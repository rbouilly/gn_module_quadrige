# backend/gn_module_quadrige/extraction_programs.py
import os
import time

import pandas as pd
import requests
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport


def extract_programs(
    filter_data: dict,
    graphql_url="https://quadrige-core.ifremer.fr/graphql/public",
    access_token=(
        "2L7BiaziVfbd9iLhhhaq6MiWRKGwJrexUmR183GgiJx4:"
        "39EA9640A2DE33C8FD909F1850462A3DBE17F0B28C4C90E1D1813EEB5BF59FAA:"
        "1|KGHk/rHvlglDfKv8/E6DG+MLcAp0RpysnjW3lXMdg2vm4kwUXu+vIYfspTOLSAZVFX6II+jgdDdcxwo16jBg=="
    ),
):
    """
    Lance une extraction de programmes et retourne l’URL CSV fournie par Ifremer.
    """

    transport = RequestsHTTPTransport(
        url=graphql_url,
        verify=True,
        headers={"Authorization": f"token {access_token}"},
    )
    client = Client(transport=transport, fetch_schema_from_transport=False)

    name = filter_data.get("name", "Extraction Programmes")
    monitoring_location = filter_data.get("monitoringLocation", "")
    if not monitoring_location:
        raise ValueError("Le champ 'monitoringLocation' est vide — requête annulée.")

    query = gql(
        f"""
    query {{
      executeProgramExtraction(
        filter: {{
          name: "{name}"
          criterias: [{{
            monitoringLocation: {{ searchText: "{monitoring_location}" }}
          }}]
        }}
      ) {{
        id
        name
        startDate
        status
      }}
    }}
    """
    )

    try:
        response = client.execute(query)
        task = response["executeProgramExtraction"]
        task_id = task["id"]
        print(
            f"[extract_programs] ✅ Extraction lancée (id={task_id}, nom={task['name']})"
        )
    except Exception as e:
        raise RuntimeError(f"Erreur lors du lancement de l’extraction : {e}")

    # Suivi du statut
    status_query = gql(
        """
    query getStatus($id: Int!) {
        getExtraction(id: $id) {
            status
            fileUrl
            error
        }
    }
    """
    )

    file_url = None
    while file_url is None:
        status_resp = client.execute(status_query, variable_values={"id": task_id})
        extraction = status_resp["getExtraction"]
        status = extraction["status"]
        print(f"[extract_programs] Statut : {status}")

        if status == "SUCCESS":
            file_url = extraction["fileUrl"]
            print(f"[extract_programs] ✅ Fichier disponible : {file_url}")
        elif status in ["PENDING", "RUNNING"]:
            time.sleep(2)
        else:
            raise RuntimeError(f"Tâche en erreur : {extraction.get('error')}")

    return file_url


def nettoyer_csv(input_path, output_path, monitoring_location_prefix: str):
    """
    Nettoie le CSV extrait depuis Ifremer pour ne garder que :
      - les lignes où 'Lieu : Mnémonique' commence par le préfixe monitoring_location_prefix
      - les colonnes importantes pour le frontend
      - une seule occurrence de chaque 'Programme : Code' (suppression des doublons)
    """
    df = pd.read_csv(input_path, sep=";", dtype=str)

    colonnes_requises = [
        "Lieu : Mnémonique",
        "Programme : Code",
        "Programme : Libellé",
        "Programme : Etat",
        "Programme : Date de création",
        "Programme : Droit : Personne : Responsable : NOM Prénom : Liste",
    ]
    for col in colonnes_requises:
        if col not in df.columns:
            raise ValueError(f"❌ Colonne manquante dans le CSV extrait : {col}")

    df_filtre = df[
        df["Lieu : Mnémonique"].str.startswith(monitoring_location_prefix, na=False)
    ]

    df_reduit = df_filtre[
        [
            "Lieu : Mnémonique",
            "Programme : Code",
            "Programme : Libellé",
            "Programme : Etat",
            "Programme : Date de création",
            "Programme : Droit : Personne : Responsable : NOM Prénom : Liste",
        ]
    ]

    df_unique = df_reduit.drop_duplicates(subset=["Programme : Code"])
    df_unique.to_csv(output_path, sep=";", index=False)

    print(f"[extract_programs] ✅ CSV filtré enregistré : {output_path}")


def csv_to_programmes_json(csv_path: str):
    """
    Charge un CSV filtré et le transforme en liste JSON de programmes.
    """
    if not os.path.exists(csv_path):
        return []

    df = pd.read_csv(csv_path, sep=";", dtype=str).fillna("")

    programmes = []
    for _, row in df.iterrows():
        programmes.append(
            {
                "name": row.get("Programme : Code", ""),
                "checked": False,
                "libelle": row.get("Programme : Libellé", ""),
                "etat": row.get("Programme : Etat", ""),
                "startDate": row.get("Programme : Date de création", ""),
                "responsable": row.get(
                    "Programme : Droit : Personne : Responsable : NOM Prénom : Liste", ""
                ).replace("|", ", "),
            }
        )
    return programmes
