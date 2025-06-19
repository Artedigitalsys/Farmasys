/*
  # Initial Schema for Pharmacy Management System

  1. New Tables
    - `users`
      - Stores user information and authentication details
      - Links to Supabase Auth users
    - `medications`
      - Stores medication information
      - Includes name, code, category, reorder level
    - `suppliers`
      - Stores supplier information
    - `batches`
      - Stores medication batch information
      - Tracks quantity, expiry dates, and current stock
    - `inventory_movements`
      - Tracks all inventory transactions
      - Records stock ins and outs with reasons
    - `movement_reasons`
      - Stores predefined reasons for inventory movements

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Restrict access based on user roles
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'pharmacist', 'assistant');

-- Create enum for movement types
CREATE TYPE movement_type AS ENUM ('in', 'out');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'assistant',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id),
  updated_by uuid REFERENCES users(id)
);

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  supplier_id uuid REFERENCES suppliers(id),
  reorder_level integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id),
  updated_by uuid REFERENCES users(id)
);

-- Create batches table
CREATE TABLE IF NOT EXISTS batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id uuid NOT NULL REFERENCES medications(id),
  batch_number text NOT NULL,
  quantity integer NOT NULL,
  current_stock integer NOT NULL,
  received_date date NOT NULL,
  expiry_date date NOT NULL,
  supplier_id uuid REFERENCES suppliers(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id),
  updated_by uuid REFERENCES users(id),
  CONSTRAINT positive_quantity CHECK (quantity > 0),
  CONSTRAINT valid_current_stock CHECK (current_stock >= 0 AND current_stock <= quantity)
);

-- Create movement reasons table
CREATE TABLE IF NOT EXISTS movement_reasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id),
  updated_by uuid REFERENCES users(id)
);

-- Create inventory movements table
CREATE TABLE IF NOT EXISTS inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_type movement_type NOT NULL,
  batch_id uuid NOT NULL REFERENCES batches(id),
  quantity integer NOT NULL,
  reason_id uuid NOT NULL REFERENCES movement_reasons(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id),
  CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE movement_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users"
  ON users
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for suppliers table
CREATE POLICY "All authenticated users can view active suppliers"
  ON suppliers
  FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Admins and pharmacists can manage suppliers"
  ON suppliers
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'pharmacist'));

-- Create policies for medications table
CREATE POLICY "All authenticated users can view active medications"
  ON medications
  FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Admins and pharmacists can manage medications"
  ON medications
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'pharmacist'));

-- Create policies for batches table
CREATE POLICY "All authenticated users can view batches"
  ON batches
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and pharmacists can manage batches"
  ON batches
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'pharmacist'));

-- Create policies for movement reasons table
CREATE POLICY "All authenticated users can view active reasons"
  ON movement_reasons
  FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Admins can manage movement reasons"
  ON movement_reasons
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for inventory movements table
CREATE POLICY "All authenticated users can view movements"
  ON inventory_movements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can create movements"
  ON inventory_movements
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_medications_code ON medications(code);
CREATE INDEX idx_medications_supplier ON medications(supplier_id);
CREATE INDEX idx_batches_medication ON batches(medication_id);
CREATE INDEX idx_batches_supplier ON batches(supplier_id);
CREATE INDEX idx_inventory_movements_batch ON inventory_movements(batch_id);
CREATE INDEX idx_inventory_movements_reason ON inventory_movements(reason_id);
CREATE INDEX idx_inventory_movements_created_at ON inventory_movements(created_at DESC);

-- Insert initial movement reasons
INSERT INTO movement_reasons (code, description)
VALUES 
  ('ADJ', 'Stock Adjustment'),
  ('DEV', 'Return'),
  ('PER', 'Loss'),
  ('VEN', 'Expiry'),
  ('DOA', 'Donation')
ON CONFLICT (code) DO NOTHING;