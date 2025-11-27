"""
Declare available permissions for QUADRIGE module

Revision ID: 0001_quadrige_permissions
Revises:
Create Date: 2025-11-27
"""

from alembic import op
import sqlalchemy as sa

# Identifiants Alembic
revision = "0001_quadrige_permissions"
down_revision = None
branch_labels = None
depends_on = None   # Pas de dépendance pour un module simple


def upgrade():
    # Déclare les permissions disponibles pour le module QUADRIGE
    op.execute(
        """
        INSERT INTO
            gn_permissions.t_permissions_available (
                id_module,
                id_object,
                id_action,
                label,
                scope_filter
            )
        SELECT
            m.id_module,
            o.id_object,
            a.id_action,
            v.label,
            v.scope_filter
        FROM
            (
                VALUES
                     ('QUADRIGE', 'ALL', 'C', False, 'Créer dans QUADRIGE')
                    ,('QUADRIGE', 'ALL', 'R', True,  'Voir QUADRIGE')
                    ,('QUADRIGE', 'ALL', 'U', False, 'Modifier QUADRIGE')
                    ,('QUADRIGE', 'ALL', 'D', False, 'Supprimer dans QUADRIGE')
            ) AS v (module_code, object_code, action_code, scope_filter, label)
        JOIN gn_commons.t_modules m 
            ON m.module_code = v.module_code
        JOIN gn_permissions.t_objects o 
            ON o.code_object = v.object_code
        JOIN gn_permissions.bib_actions a 
            ON a.code_action = v.action_code;
        """
    )

    # Nettoyage des permissions obsolètes
    op.execute(
        """
        WITH bad AS (
            SELECT p.id_permission
            FROM gn_permissions.t_permissions p
            JOIN gn_commons.t_modules m USING (id_module)
            WHERE m.module_code = 'QUADRIGE'
            EXCEPT
            SELECT p.id_permission
            FROM gn_permissions.t_permissions p
            JOIN gn_permissions.t_permissions_available pa
              ON p.id_module = pa.id_module
             AND p.id_object = pa.id_object
             AND p.id_action = pa.id_action
        )
        DELETE FROM gn_permissions.t_permissions p
        USING bad
        WHERE p.id_permission = bad.id_permission;
        """
    )


def downgrade():
    op.execute(
        """
        DELETE FROM gn_permissions.t_permissions_available pa
        USING gn_commons.t_modules m
        WHERE pa.id_module = m.id_module
          AND m.module_code = 'QUADRIGE';
        """
    )

