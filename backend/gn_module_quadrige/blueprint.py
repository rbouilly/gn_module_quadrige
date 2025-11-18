# backend/gn_module_quadrige/blueprint.py
from flask import Blueprint

from .routes import init_routes

# Nom = MODULE_CODE, url_prefix = chemin sous l’API GN
blueprint = Blueprint("quadrige", __name__, url_prefix="/quadrige")

# Enregistrement des routes définies dans routes.py
init_routes(blueprint)
