"""initial mira schema

Revision ID: 001_initial_mira_schema
Revises: 
Create Date: 2026-11-10 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial_mira_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Patients table
    op.create_table(
        'patients_demo',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('reference_id', sa.String(), unique=True, index=True),
        sa.Column('name', sa.String(), nullable=False, index=True),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('date_of_birth', sa.String(), nullable=True),
        sa.Column('preferred_clinic', sa.String(), nullable=True),
        sa.Column('enquiry_category', sa.String(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('status', sa.String(), default='active'),
        sa.Column('validation_score', sa.Integer(), default=100),
        sa.Column('missing_fields', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('is_demo_data', sa.Boolean(), default=True),
    )

    # Documents table
    op.create_table(
        'documents',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('filename', sa.String(), nullable=False),
        sa.Column('file_type', sa.String(), default='pdf'),
        sa.Column('file_size', sa.Integer(), default=0),
        sa.Column('status', sa.String(), default='uploaded'),
        sa.Column('uploaded_at', sa.DateTime(), nullable=True),
        sa.Column('processed_at', sa.DateTime(), nullable=True),
        sa.Column('patient_id', sa.String(), nullable=True),
        sa.Column('extracted_data', sa.JSON(), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('ocr_text', sa.Text(), nullable=True),
        sa.Column('missing_fields', sa.JSON(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('is_demo_data', sa.Boolean(), default=True),
    )

    # Appointments table
    op.create_table(
        'appointments',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('patient_id', sa.String(), nullable=False, index=True),
        sa.Column('patient_name', sa.String(), nullable=False),
        sa.Column('clinic_name', sa.String(), nullable=True),
        sa.Column('preferred_date', sa.String(), nullable=False),
        sa.Column('preferred_time', sa.String(), nullable=True),
        sa.Column('appointment_type', sa.String(), default='General Consultation'),
        sa.Column('status', sa.String(), default='requested'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('confirmed_at', sa.DateTime(), nullable=True),
        sa.Column('cancelled_at', sa.DateTime(), nullable=True),
        sa.Column('is_demo_data', sa.Boolean(), default=True),
    )

    # Providers table
    op.create_table(
        'providers',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('clinic_name', sa.String(), nullable=False, index=True),
        sa.Column('provider_name', sa.String(), nullable=True),
        sa.Column('address', sa.String(), nullable=True),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('website', sa.String(), nullable=True),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('state', sa.String(), nullable=True),
        sa.Column('suburb', sa.String(), nullable=True),
        sa.Column('source_url', sa.String(), nullable=True),
        sa.Column('collected_at', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(), default='active'),
        sa.Column('is_demo_data', sa.Boolean(), default=True),
    )

    # Workflows table
    op.create_table(
        'workflows',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('trigger', sa.String(), nullable=False),
        sa.Column('steps', sa.JSON(), nullable=False),
        sa.Column('status', sa.String(), default='active'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('last_executed_at', sa.DateTime(), nullable=True),
        sa.Column('total_executions', sa.Integer(), default=0),
        sa.Column('successful_executions', sa.Integer(), default=0),
    )

    # Audit Logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('user_name', sa.String(), nullable=False),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('resource_type', sa.String(), nullable=True),
        sa.Column('resource_id', sa.String(), nullable=True),
        sa.Column('details', sa.JSON(), nullable=True),
        sa.Column('ip_address', sa.String(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
    )

def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('workflows')
    op.drop_table('providers')
    op.drop_table('appointments')
    op.drop_table('documents')
    op.drop_table('patients_demo')

