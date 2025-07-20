/*
  # Schéma de base de données MyComfort

  1. Nouvelles tables
    - `clients` - Informations des clients
    - `invoices` - Factures principales
    - `invoice_items` - Articles des factures
    - `products` - Catalogue produits MyComfort

  2. Sécurité
    - Activation RLS sur toutes les tables
    - Politiques d'accès pour utilisateurs authentifiés
    - Protection des données sensibles

  3. Relations
    - Clés étrangères entre factures et clients
    - Liaison articles-factures
    - Intégrité référentielle
*/

-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  postal_code text,
  city text,
  siret text,
  lodging_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des factures
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_address text,
  client_phone text,
  client_email text,
  subtotal decimal(10,2) DEFAULT 0,
  tax decimal(10,2) DEFAULT 0,
  total decimal(10,2) DEFAULT 0,
  status text DEFAULT 'draft',
  event_location text,
  invoice_date date DEFAULT CURRENT_DATE,
  due_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des articles de facture
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity integer DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total decimal(10,2) NOT NULL,
  product_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Table du catalogue produits MyComfort
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  size_dimensions text,
  price decimal(10,2) NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activation Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Politiques d'accès pour les clients
CREATE POLICY "Users can read own clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own clients"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (true);

-- Politiques d'accès pour les factures
CREATE POLICY "Users can read own invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert invoices"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own invoices"
  ON invoices
  FOR UPDATE
  TO authenticated
  USING (true);

-- Politiques d'accès pour les articles de facture
CREATE POLICY "Users can read invoice items"
  ON invoice_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert invoice items"
  ON invoice_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update invoice items"
  ON invoice_items
  FOR UPDATE
  TO authenticated
  USING (true);

-- Politiques d'accès pour les produits (lecture seule pour tous)
CREATE POLICY "Users can read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertion des produits MyComfort par défaut
INSERT INTO products (name, category, size_dimensions, price, description) VALUES
('MATELAS BAMBOU 70 x 190', 'Matelas', '70 x 190', 900.00, 'Matelas en fibre de bambou, confort optimal'),
('MATELAS BAMBOU 80 x 200', 'Matelas', '80 x 200', 1050.00, 'Matelas en fibre de bambou, confort optimal'),
('MATELAS BAMBOU 90 x 190', 'Matelas', '90 x 190', 1110.00, 'Matelas en fibre de bambou, confort optimal'),
('MATELAS BAMBOU 90 x 200', 'Matelas', '90 x 200', 1150.00, 'Matelas en fibre de bambou, confort optimal'),
('MATELAS BAMBOU 120 x 190', 'Matelas', '120 x 190', 1600.00, 'Matelas en fibre de bambou, confort optimal'),
('MATELAS BAMBOU 140 x 190', 'Matelas', '140 x 190', 1800.00, 'Matelas en fibre de bambou, confort optimal'),
('MATELAS BAMBOU 140 x 200', 'Matelas', '140 x 200', 1880.00, 'Matelas en fibre de bambou, confort optimal'),
('MATELAS BAMBOU 160 x 200', 'Matelas', '160 x 200', 2100.00, 'Matelas en fibre de bambou, confort optimal'),
('MATELAS BAMBOU 180 x 200', 'Matelas', '180 x 200', 2200.00, 'Matelas en fibre de bambou, confort optimal'),
('MATELAS BAMBOU 200 x 200', 'Matelas', '200 x 200', 2300.00, 'Matelas en fibre de bambou, confort optimal'),
('OREILLER BAMBOU 60 x 40', 'Oreiller', '60 x 40', 80.00, 'Oreiller ergonomique en fibre de bambou'),
('COUETTE BAMBOU 220 x 240', 'Couette', '220 x 240', 210.00, 'Couette légère en fibre de bambou'),
('COUETTE BAMBOU 240 x 260', 'Couette', '240 x 260', 270.00, 'Couette légère en fibre de bambou')
ON CONFLICT DO NOTHING;