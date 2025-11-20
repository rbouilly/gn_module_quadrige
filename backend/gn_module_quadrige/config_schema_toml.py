"""
Schéma Marshmallow pour la configuration TOML du module Quadrige.

La classe doit impérativement s'appeler GnModuleSchemaConf.
Les valeurs réelles seront surchargées par
config/gn_module_quadrige.toml dans l’installation GeoNature.
"""

from marshmallow import Schema, fields

class GnModuleSchemaConf(Schema):
    graphql_url = fields.Url()
    access_token = fields.String(required=True)

    # Champs additionnels configurables dans le TOML
    locations = fields.List(fields.Dict(), missing=[])
    extractable_fields = fields.List(fields.String(), missing=[])
