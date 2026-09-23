-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DROP EXISTING TABLES (Hard Reset)
-- Order matters due to foreign keys
DROP TABLE IF EXISTS expense_installments CASCADE;
DROP TABLE IF EXISTS expenses CASCADE; -- The old monolithic table
DROP TABLE IF EXISTS expense_recurrences CASCADE; -- The old unused/zombie table

-- 2. CREATE NEW TABLES

-- A. EXPENSE TEMPLATES (Plantillas)
-- Defines the rules for generating future expenses.
CREATE TABLE expense_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    -- Core Info
    concept VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL, -- in cents
    currency VARCHAR(10) DEFAULT 'ARS',
    
    -- Categorization
    category_id UUID REFERENCES expense_categories(id),
    vendor_id UUID REFERENCES vendors(id),
    
    -- Recurrence Rules
    frequency VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
    start_date DATE NOT NULL,
    end_date DATE, -- Nullable (indefinite)
    next_due_date DATE NOT NULL, -- Optimization to know when to generate next
    
    -- Payment Details (Default for instances)
    payment_method VARCHAR(50) NOT NULL, 
    card_id UUID REFERENCES cards(id), -- Nullable
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- B. EXPENSES (Instancias / Transacciones Reales)
-- Represents a concrete financial event that affects balance/cashflow.
CREATE TABLE expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Link to Template (Nullable: One-off expenses have NULL)
    template_id UUID REFERENCES expense_templates(id),
    
    -- Core Info
    concept VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL, -- in cents
    currency VARCHAR(10) DEFAULT 'ARS',
    
    -- Categorization
    category_id UUID REFERENCES expense_categories(id),
    vendor_id UUID REFERENCES vendors(id),
    
    -- Transaction Details
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'paid', 'pending'
    date DATE NOT NULL, -- The actual transaction date
    
    -- Payment Details
    payment_method VARCHAR(50) NOT NULL,
    card_id UUID REFERENCES cards(id), -- If paid with card
    
    -- Metadata
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- C. EXPENSE INSTALLMENTS (Cuotas de Tarjeta)
-- Handles specific cashflow impact of credit card installments.
-- Linked to a PARENT expense in 'expenses' table.
CREATE TABLE expense_installments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Link to the parent Transaction
    expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
    
    -- Installment Details
    installment_number INTEGER NOT NULL,
    total_installments INTEGER NOT NULL,
    
    -- Cashflow Impact
    due_date DATE NOT NULL, -- When this specific installment must be paid (card closing/due date)
    amount INTEGER NOT NULL, -- Amount of THIS installment in cents
    status VARCHAR(20) DEFAULT 'pending' -- 'paid' when the card bill is paid
);

-- Indexes for performance
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_template_id ON expenses(template_id);
CREATE INDEX idx_expense_templates_next_due_date ON expense_templates(next_due_date) WHERE active = TRUE;
CREATE INDEX idx_expense_installments_due_date ON expense_installments(due_date);
