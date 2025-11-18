# backend/gn_module_quadrige/extraction_data.py
import os
import time
import requests

from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport

from .build_query import build_extraction_query


def extract_ifremer_data(programmes, filter_data):
    """
    Lance les extractions de résultats pour chaque programme et renvoie
    la liste des URLs de fichiers ZIP fournis par Ifremer.
    """

    graphql_url = "https://quadrige-core.ifremer.fr/graphql/public"
    access_token = (
        "2L7BiaziVfbd9iLhhhaq6MiWRKGwJrexUmR183GgiJx4:"
        "39EA9640A2DE33C8FD909F1850462A3DBE17F0B28C4C90E1D1813EEB5BF59FAA:"
        "1|KGHk/rHvlglDfKv8/E6DG+MLcAp0RpysnjW3lXMdg2vm4kwUXu+vIYfspTOLSAZVFX6IIj+jzgdDdcxwo16jBg=="
    )

    transport = RequestsHTTPTransport(
        url=graphql_url,
        verify=True,
        headers={"Authorization": f"token {access_token}"},
    )
    client = Client(transport=transport, fetch_schema_from_transport=False)

    download_links = []
    os.makedirs("outputs", exist_ok=True)

    for p in programmes:
        print(f"[extract_ifremer_data] Programme : {p}")

        # 1) Lancer la tâche d’extraction
        try:
            execute_query = build_extraction_query(p, filter_data)
            response = client.execute(execute_query)
            task_id = response["executeResultExtraction"]["id"]
            print(f"   Extraction lancée (id: {task_id})")
        except Exception as e:
            print(f"   ❌ Erreur lors de l'extraction {p} : {e}")
            continue

        # 2) Suivi du statut
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
            status_response = client.execute(
                status_query, variable_values={"id": task_id}
            )
            extraction = status_response["getExtraction"]
            status = extraction["status"]
            print(f"    Statut: {status}")

            if status == "SUCCESS":
                file_url = extraction["fileUrl"]
                print(f"     ✅ Fichier disponible : {file_url}")
            elif status in ["PENDING", "RUNNING"]:
                time.sleep(2)
            else:
                print(f"     ❌ Tâche en erreur : {extraction.get('error')}")
                break

        if not file_url:
            continue

        # 3) Télécharger le ZIP en local (optionnel, surtout pour debug)
        zip_path = os.path.join("outputs", os.path.basename(file_url))
        try:
            r = requests.get(file_url)
            r.raise_for_status()
            with open(zip_path, "wb") as f:
                f.write(r.content)
            print(f"     💾 ZIP téléchargé localement : {zip_path}")
        except Exception as e:
            print(f"     ⚠️ Erreur lors du téléchargement : {e}")

        # 4) Ajouter l'URL à la liste renvoyée au backend
        download_links.append(file_url)

    return download_links
