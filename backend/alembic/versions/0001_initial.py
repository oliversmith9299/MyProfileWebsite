"""Initial schema: pgvector extension + all tables.

Revision ID: 0001
Revises:
Create Date: 2026-07-06
"""

from alembic import op

from app.models import Base

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    # First migration bootstraps the full schema from the ORM metadata;
    # subsequent migrations are generated with `alembic revision --autogenerate`.
    Base.metadata.create_all(op.get_bind())


def downgrade() -> None:
    Base.metadata.drop_all(op.get_bind())
