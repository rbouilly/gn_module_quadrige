# backend/gn_module_quadrige/build_query.py
from gql import gql


def build_extraction_query(programme: str, filter_data: dict):
    """
    Construit une requête GraphQL executeResultExtraction en fonction
    du programme et des paramètres envoyés par le frontend.

    Args:
        programme (str): identifiant du programme
        filter_data (dict): contient (name, fields, startDate, endDate,
                            monitoringLocation, ...)
    """
    name = filter_data.get("name", "").lower()
    fields = filter_data.get("fields", [])
    start_date = filter_data.get("startDate", "")
    end_date = filter_data.get("endDate", "")
    monitoring_location = filter_data.get("monitoringLocation", "")

    formatted_fields = ",\n                        ".join(fields)

    periods_part = ""
    if start_date and end_date:
        periods_part = f"""
                periods: [{{ startDate: "{start_date}", endDate: "{end_date}" }}]"""

    monitoring_part = ""
    if monitoring_location:
        monitoring_part = f"""
                    monitoringLocation: {{ text: "{monitoring_location}" }}"""

    query = f"""
    query {{
        executeResultExtraction(
            filter: {{
                name: "{name}"
                fields: [
                    {formatted_fields}
                ]{periods_part}
                mainFilter: {{
                    program: {{ ids: ["{programme}"] }}{monitoring_part}
                }}
            }}
        ) {{
            id
            name
            startDate
            status
        }}
    }}
    """

    return gql(query)
