"""add_ai_contexts_table

Revision ID: c1a2b3c4d5e6
Revises: b8f3d91e2c4a
Create Date: 2026-01-02 02:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision: str = 'c1a2b3c4d5e6'
down_revision: Union[str, Sequence[str], None] = 'b8f3d91e2c4a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create ai_contexts table
    op.create_table(
        'ai_contexts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('ficha_cliente_id', UUID(as_uuid=True), nullable=False),
        sa.Column('gemini_file_uri', sa.String(), nullable=True),
        sa.Column('gemini_cache_name', sa.String(), nullable=True),
        sa.Column('last_updated', sa.DateTime(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('ficha_cliente_id')
    )
    
    # Create foreign key relationship
    op.create_foreign_key(
        'fk_ai_contexts_ficha_cliente_id',
        'ai_contexts', 'fichas_cliente',
        ['ficha_cliente_id'], ['id']
    )
    
    # Create index on id
    op.create_index(op.f('ix_ai_contexts_id'), 'ai_contexts', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_ai_contexts_id'), table_name='ai_contexts')
    op.drop_table('ai_contexts')
