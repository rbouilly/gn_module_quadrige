# backend/gn_module_quadrige/migrations/06261234b984_create_template_schema.py
"""create_quadrige_schema

Revision ID: 06261234b984
Revises: 
Create Date: 2021-03-29 18:38:24.512562
"""
from importlib import resources

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "06261234b984"
down_revision = None
branch_labels = ("quadrige",)
depends_on = None

# Schéma par défaut pour le module (à adapter si besoin)
schema = "gn_quadrige"


def upgrade():
    # ⚠️ nécessite un fichier backend/gn_module_quadrige/migrations/data/schema.sql
    operations = resources.read_text(
        "gn_module_quadrige.migrations.data", "schema.sql"
    )
    op.execute(operations)


def downgrade():
    # Adapter en fonction de ce que crée schema.sql
    op.execute(f"DROP SCHEMA IF EXISTS {schema} CASCADE")
