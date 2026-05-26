"""add google_id to users

Revision ID: 0f4ef2ff99ea
Revises: 6ee1f5136e26
Create Date: 2026-05-26 13:03:16.294504

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0f4ef2ff99ea'
down_revision = '6ee1f5136e26'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('google_id', sa.String(length=100), nullable=True))
        batch_op.alter_column('password', existing_type=sa.VARCHAR(length=256), nullable=True)
        batch_op.create_unique_constraint('uq_users_google_id', ['google_id'])


def downgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_constraint('uq_users_google_id', type_='unique')
        batch_op.alter_column('password', existing_type=sa.VARCHAR(length=256), nullable=False)
        batch_op.drop_column('google_id')
