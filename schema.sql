-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  brand VARCHAR(255),
  phone VARCHAR(50)
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  invoice_number SERIAL,
  amount INTEGER NOT NULL, -- in cents
  currency VARCHAR(10) DEFAULT 'ARS',
  discount INTEGER DEFAULT 0,
  status VARCHAR(20) CHECK (status IN ('pendiente', 'facturado', 'vencido')),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL
);

-- Line Items
CREATE TABLE IF NOT EXISTS line_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL -- in cents
);

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- Cards
CREATE TABLE IF NOT EXISTS cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  last_four_digits VARCHAR(4),
  closing_day INTEGER NOT NULL,
  due_day INTEGER NOT NULL
);

-- Expense Recurrences
CREATE TABLE IF NOT EXISTS expense_recurrences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  concept VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'ARS',
  category_id UUID REFERENCES expense_categories(id),
  vendor_id UUID REFERENCES vendors(id),
  payment_method VARCHAR(50) CHECK (payment_method IN ('Efectivo', 'Tarjeta')),
  card_id UUID REFERENCES cards(id),
  frequency VARCHAR(50), -- 'monthly', 'weekly'
  start_date DATE,
  end_date DATE
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id),
  concept VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES expense_categories(id),
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'ARS',
  status VARCHAR(20) DEFAULT 'paid', -- 'paid', 'pending'
  expense_date DATE NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  card_id UUID REFERENCES cards(id),
  total_installments INTEGER DEFAULT 1,
  current_installment INTEGER DEFAULT 1,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_interval VARCHAR(50),
  recurrence_end_date DATE,
  parent_expense_id UUID REFERENCES expenses(id)
);

-- Expense Installments (for tracking credit card installments)
CREATE TABLE IF NOT EXISTS expense_installments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending'
);
