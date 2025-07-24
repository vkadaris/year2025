package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

type DB struct {
	*sql.DB
}

// Connect initializes the database connection
func Connect() (*DB, error) {
	// Default connection parameters for development
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "password")
	dbname := getEnv("DB_NAME", "loan_tracker")
	sslmode := getEnv("DB_SSLMODE", "disable")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Printf("Connected to database: %s@%s:%s/%s", user, host, port, dbname)
	return &DB{db}, nil
}

// CreateTables creates the database schema
func (db *DB) CreateTables() error {
	schema := `
	-- Create borrowers table
	CREATE TABLE IF NOT EXISTS borrowers (
		id SERIAL PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		email VARCHAR(255) UNIQUE,
		phone VARCHAR(50)
	);

	-- Create lenders table
	CREATE TABLE IF NOT EXISTS lenders (
		id SERIAL PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		email VARCHAR(255) UNIQUE,
		phone VARCHAR(50)
	);

	-- Create loans table
	CREATE TABLE IF NOT EXISTS loans (
		id SERIAL PRIMARY KEY,
		borrower_id INTEGER NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
		lender_id INTEGER NOT NULL REFERENCES lenders(id) ON DELETE CASCADE,
		principal DECIMAL(12,2) NOT NULL CHECK (principal > 0),
		interest_rate DECIMAL(5,4) NOT NULL CHECK (interest_rate >= 0),
		term_months INTEGER NOT NULL CHECK (term_months > 0),
		start_date DATE NOT NULL,
		status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'defaulted')),
		created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
	);

	-- Create payments table
	CREATE TABLE IF NOT EXISTS payments (
		id SERIAL PRIMARY KEY,
		loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
		amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
		payment_date DATE NOT NULL,
		notes TEXT,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
	);

	-- Create indexes for better performance
	CREATE INDEX IF NOT EXISTS idx_loans_borrower_id ON loans(borrower_id);
	CREATE INDEX IF NOT EXISTS idx_loans_lender_id ON loans(lender_id);
	CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
	CREATE INDEX IF NOT EXISTS idx_payments_loan_id ON payments(loan_id);
	CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

	-- Create trigger to update updated_at timestamp
	CREATE OR REPLACE FUNCTION update_updated_at_column()
	RETURNS TRIGGER AS $$
	BEGIN
		NEW.updated_at = NOW();
		RETURN NEW;
	END;
	$$ language 'plpgsql';

	CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
	`

	_, err := db.Exec(schema)
	if err != nil {
		return fmt.Errorf("failed to create tables: %w", err)
	}

	log.Println("Database schema created successfully")
	return nil
}

// getEnv gets environment variable with fallback default
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}