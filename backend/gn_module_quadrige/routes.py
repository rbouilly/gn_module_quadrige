# backend/gn_module_quadrige/routes.py
import os
import requests  #  AJOUT OBLIGATOIRE
from flask import request, jsonify, send_from_directory

from .extraction_data import extract_ifremer_data
from .extraction_programs import extract_programs


from . import utils_backend


def init_routes(bp):
    """
    Enregistre toutes les routes sur le blueprint passé en argument.
    """

    # -------------------------
    # 1) Extraction + filtrage programmes
    # -------------------------
    @bp.route("/program-extraction", methods=["POST"])
    def recevoir_program_extraction():
        data = request.json or {}
        program_filter = data.get("filter", {})
        monitoring_location = program_filter.get("monitoringLocation", "")

        print("\n[QUADRIGE BACKEND] ➡️ /program-extraction")
        print("[QUADRIGE BACKEND] Filtre reçu :", program_filter)

        try:
            file_url = extract_programs(program_filter)
            print(f"[QUADRIGE BACKEND] URL CSV reçue : {file_url}")

            utils_backend.sauvegarder_filtre(program_filter)

            utils_backend.nettoyer_dossier_memory()

            brut_path = os.path.join(
                utils_backend.MEMORY_DIR,
                f"programmes_{monitoring_location}_brut.csv"
            )
            r = requests.get(file_url)
            r.raise_for_status()

            with open(brut_path, "wb") as f:
                f.write(r.content)

            print(f"[QUADRIGE BACKEND] CSV brut sauvegardé : {brut_path}")

            filtre_path = os.path.join(
                utils_backend.MEMORY_DIR,
                f"programmes_{monitoring_location}_filtered.csv"
            )

            utils_backend.nettoyer_csv(brut_path, filtre_path, monitoring_location)

            programmes_json = utils_backend.csv_to_programmes_json(filtre_path)


        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

        base_url = "/quadrige/memory"

        return jsonify({
            "status": "ok",
            "fichiers_csv": [
                {
                    "file_name": f"programmes_{monitoring_location}_brut.csv",
                    "url": f"{base_url}/programmes_{monitoring_location}_brut.csv",
                },
                {
                    "file_name": f"programmes_{monitoring_location}_filtered.csv",
                    "url": f"{base_url}/programmes_{monitoring_location}_filtered.csv",
                },
            ],
            "programmes": programmes_json,
        }), 200

    # -------------------------
    # 2) Relancer uniquement le filtrage
    # -------------------------
    @bp.route("/filtrage_seul", methods=["POST", "GET"])
    def relancer_filtrage():
        if request.method == "POST":
            data = request.json or {}
            program_filter = data.get("filter", {})
        else:
            program_filter = {}

        if not program_filter:
            program_filter = utils_backend.charger_filtre()

        monitoring_location = program_filter.get("monitoringLocation", "")

        if not monitoring_location:
            return jsonify({
                "status": "error",
                "message": "Aucun filtre trouvé (ni reçu, ni sauvegardé).",
            }), 400

        try:
            brut_path = os.path.join(
                utils_backend.MEMORY_DIR,
                f"programmes_{monitoring_location}_brut.csv"
            )
            filtre_path = os.path.join(
                utils_backend.MEMORY_DIR,
                f"programmes_{monitoring_location}_filtered.csv"
            )

            if not os.path.exists(brut_path):
                return jsonify({
                    "status": "ok",
                    "fichiers_csv": [],
                    "programmes": [],
                    "message": "⚠️ Aucun CSV brut trouvé pour ce filtre.",
                }), 200

            utils_backend.nettoyer_csv(brut_path, filtre_path, monitoring_location)
            programmes_json = utils_backend.csv_to_programmes_json(filtre_path)

        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

        return jsonify({
            "status": "ok",
            "fichiers_csv": [
                {
                    "file_name": f"programmes_{monitoring_location}_filtered.csv",
                    "url": f"/quadrige/memory/programmes_{monitoring_location}_filtered.csv",
                }
            ],
            "programmes": programmes_json,
            "message": "Filtrage relancé avec succès",
        }), 200

    # -------------------------
    # 3) Extraction des données (ZIP)
    # -------------------------
    @bp.route("/data-extractions", methods=["POST"])
    def recevoir_data_extractions():
        data = request.json or {}
        programmes = data.get("programmes", [])
        filter_data_front = data.get("filter", {})

        print("[QUADRIGE BACKEND] ➡️ /data-extractions")

        if not programmes:
            return jsonify({
                "status": "warning",
                "type": "validation",
                "message": "Aucun programme reçu par le backend",
            }), 400

        last_filter = utils_backend.charger_filtre()
        monitoring_location = last_filter.get("monitoringLocation", "")

        if not monitoring_location:
            return jsonify({
                "status": "error",
                "message": "Aucune monitoringLocation trouvée dans le dernier filtre.",
            }), 400

        filter_data = dict(filter_data_front)
        filter_data["monitoringLocation"] = monitoring_location

        try:
            utils_backend.nettoyer_output_data()

            download_links = extract_ifremer_data(programmes, filter_data)

        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

        if not download_links:
            return jsonify({
                "status": "warning",
                "type": "not_found",
                "message": "Les programmes sélectionnés ne correspondent pas au filtre",
            }), 404

        renamed_files = utils_backend.name_extraction_data(
            programmes, download_links, filter_data, monitoring_location
        )

        return jsonify({
            "status": "ok",
            "programmes_recus": programmes,
            "filtre_utilise": filter_data,
            "fichiers_zip": renamed_files,
        }), 200

    # -------------------------
    # 4) Servir les fichiers sauvegardés
    # -------------------------
    @bp.route("/memory/<path:filename>", methods=["GET"])
    def download_memory_file(filename):
        return send_from_directory(utils_backend.MEMORY_DIR, filename)

    @bp.route("/output_data/<path:filename>", methods=["GET"])
    def download_output_data(filename):
        return send_from_directory(utils_backend.OUTPUT_DATA_DIR, filename)

    # -------------------------
    # 5) Récupérer les programmes
    # -------------------------
    @bp.route("/last-programmes", methods=["GET"])
    def get_last_programmes():
        last_filter = utils_backend.charger_filtre()
        monitoring_location = last_filter.get("monitoringLocation", "")
        base_url = "/quadrige/memory"

        filtre_path = os.path.join(
            utils_backend.MEMORY_DIR,
            f"programmes_{monitoring_location}_filtered.csv",
        )
        brut_path = os.path.join(
            utils_backend.MEMORY_DIR,
            f"programmes_{monitoring_location}_brut.csv",
        )

        programmes = utils_backend.csv_to_programmes_json(filtre_path) if os.path.exists(filtre_path) else []

        fichiers_csv = []
        if os.path.exists(brut_path):
            fichiers_csv.append({
                "file_name": os.path.basename(brut_path),
                "url": f"{base_url}/{os.path.basename(brut_path)}",
            })
        if os.path.exists(filtre_path):
            fichiers_csv.append({
                "file_name": os.path.basename(filtre_path),
                "url": f"{base_url}/{os.path.basename(filtre_path)}",
            })

        return jsonify({
            "status": "ok" if programmes else "empty",
            "message": "Aucun programme sauvegardé" if not programmes else f"{len(programmes)} programmes trouvés",
            "programmes": programmes,
            "monitoringLocation": monitoring_location,
            "fichiers_csv": fichiers_csv,
        }), 200
