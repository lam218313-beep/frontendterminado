"""add_logo_url_to_users

Revision ID: 200cd34e5f67
Revises: 100ab91c7fc6
Create Date: 2026-01-03 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '200cd34e5f67'
down_revision: Union[str, Sequence[str], None] = '100ab91c7fc6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', 
        sa.Column('logo_url', sa.String(), nullable=True)
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'logo_url')
