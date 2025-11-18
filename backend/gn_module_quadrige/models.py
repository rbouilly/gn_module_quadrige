# backend/gn_module_quadrige/models.py
"""
Modèles SQLAlchemy du module gn_module_quadrige.

Pour l’instant, simple exemple minimal (sans géométrie ni current_app).
Tu pourras l’adapter quand tu créeras un schéma / des tables dédiées.
"""

from geonature.utils.env import DB
from geonature.utils.utilssqlalchemy import serializable


@serializable
class QuadrigeExample(DB.Model):
    __tablename__ = "quadrige_example"
    __table_args__ = {"schema": "public"}  # à adapter plus tard

    id = DB.Column(DB.Integer, primary_key=True)
    label = DB.Column(DB.String, nullable=False)
