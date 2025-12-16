"""
Init QUADRIGE module

Revision ID: 0001_quadrige_init
Revises:
Create Date: 2025-11-27
"""

from alembic import op

revision = "0001_quadrige_init"
down_revision = None
branch_labels = ("quadrige",)
depends_on = None


def upgrade():

    # 1) Déclarer le module QUADRIGE si absent
    op.execute("""
        INSERT INTO gn_commons.t_modules (
            module_code,
            module_label,
            module_desc,
            module_external_url,
            active_frontend,
            active_backend
        )
        SELECT
            'QUADRIGE',
            'Quadrige',
            'Module de consultation et d’extraction des données Quadrige',
            NULL,
            true,
            true
        WHERE NOT EXISTS (
            SELECT 1 FROM gn_commons.t_modules WHERE module_code = 'QUADRIGE'
        );
    """)

    # 2) Déclarer l’objet de permission principal
    op.execute("""
        INSERT INTO gn_permissions.t_objects (code_object, description_object)
        SELECT
            'QUADRIGE',
            'Accès global au module Quadrige'
        WHERE NOT EXISTS (
            SELECT 1 FROM gn_permissions.t_objects WHERE code_object = 'QUADRIGE'
        );
    """)


def downgrade():
    op.execute("""
        DELETE FROM gn_permissions.t_objects WHERE code_object = 'QUADRIGE';
        DELETE FROM gn_commons.t_modules WHERE module_code = 'QUADRIGE';
    """)
