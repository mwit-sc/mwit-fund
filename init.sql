-- Create database tables for mwit-fund

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    donor_name VARCHAR(255) NOT NULL,
    generation VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    receipt_name VARCHAR(255),
    donor_email VARCHAR(255),
    tax_id VARCHAR(50),
    address TEXT,
    contact_info VARCHAR(255) NOT NULL,
    publication_consent VARCHAR(20) NOT NULL CHECK (publication_consent IN ('full', 'name_only', 'anonymous')),
    slip_image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create donation_stats table
CREATE TABLE IF NOT EXISTS donation_stats (
    id SERIAL PRIMARY KEY,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_donors INTEGER NOT NULL DEFAULT 0,
    target_amount DECIMAL(10,2) NOT NULL DEFAULT 750000,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial stats record
INSERT INTO donation_stats (total_amount, total_donors, target_amount)
VALUES (0, 0, 750000)
ON CONFLICT (id) DO NOTHING;

-- Create function to update donation stats
CREATE OR REPLACE FUNCTION update_donation_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total amount and donor count
    UPDATE donation_stats SET
        total_amount = (
            SELECT COALESCE(SUM(amount), 0)
            FROM donations
            WHERE status = 'approved'
        ),
        total_donors = (
            SELECT COUNT(DISTINCT donor_name)
            FROM donations
            WHERE status = 'approved'
        ),
        updated_at = NOW()
    WHERE id = 1;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update stats when donations change
CREATE OR REPLACE TRIGGER trigger_update_donation_stats
    AFTER INSERT OR UPDATE OR DELETE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_donation_stats();

-- Create expenses table for tracking income/outcome
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    expense_type VARCHAR(20) NOT NULL CHECK (expense_type IN ('income', 'outcome')),
    category VARCHAR(100),
    academic_year VARCHAR(10) NOT NULL,
    expense_date DATE NOT NULL,
    receipt_url TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create yearly_stats table for tracking by academic year
CREATE TABLE IF NOT EXISTS yearly_stats (
    id SERIAL PRIMARY KEY,
    academic_year VARCHAR(10) NOT NULL UNIQUE,
    total_donations DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_expenses DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_income DECIMAL(10,2) NOT NULL DEFAULT 0,
    donor_count INTEGER NOT NULL DEFAULT 0,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert current academic year
INSERT INTO yearly_stats (academic_year, total_donations, total_expenses, total_income, donor_count, balance)
VALUES ('2567', 0, 0, 0, 0, 0)
ON CONFLICT (academic_year) DO NOTHING;

-- Create users table for role management
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    image_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;