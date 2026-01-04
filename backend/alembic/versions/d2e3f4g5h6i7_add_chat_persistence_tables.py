"""add_chat_persistence_tables

Revision ID: d2e3f4g5h6i7
Revises: c1a2b3c4d5e6
Create Date: 2026-01-02 02:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision: str = 'd2e3f4g5h6i7'
down_revision: Union[str, Sequence[str], None] = 'c1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create chat_sessions table
    op.create_table(
        'chat_sessions',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('last_message_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('ficha_cliente_id', UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create foreign keys for chat_sessions
    op.create_foreign_key(
        'fk_chat_sessions_ficha_cliente_id',
        'chat_sessions', 'fichas_cliente',
        ['ficha_cliente_id'], ['id']
    )
    op.create_foreign_key(
        'fk_chat_sessions_user_id',
        'chat_sessions', 'users',
        ['user_id'], ['id']
    )

    # Create chat_messages table
    op.create_table(
        'chat_messages',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.Column('meta_data', sa.JSON(), nullable=True),
        sa.Column('session_id', UUID(as_uuid=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Create foreign key for chat_messages
    op.create_foreign_key(
        'fk_chat_messages_session_id',
        'chat_messages', 'chat_sessions',
        ['session_id'], ['id']
    )


def downgrade() -> None:
    op.drop_table('chat_messages')
    op.drop_table('chat_sessions')
