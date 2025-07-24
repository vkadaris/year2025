package models

import (
	"time"
)

// Borrower represents a loan borrower
type Borrower struct {
	ID    int    `json:"id" db:"id"`
	Name  string `json:"name" db:"name"`
	Email string `json:"email" db:"email"`
	Phone string `json:"phone" db:"phone"`
}

// Lender represents a loan lender
type Lender struct {
	ID    int    `json:"id" db:"id"`
	Name  string `json:"name" db:"name"`
	Email string `json:"email" db:"email"`
	Phone string `json:"phone" db:"phone"`
}

// Loan represents a loan with its terms
type Loan struct {
	ID           int       `json:"id" db:"id"`
	BorrowerID   int       `json:"borrower_id" db:"borrower_id"`
	LenderID     int       `json:"lender_id" db:"lender_id"`
	Principal    float64   `json:"principal" db:"principal"`
	InterestRate float64   `json:"interest_rate" db:"interest_rate"`
	TermMonths   int       `json:"term_months" db:"term_months"`
	StartDate    time.Time `json:"start_date" db:"start_date"`
	Status       string    `json:"status" db:"status"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
	
	// Related entities for easier JSON responses
	Borrower *Borrower `json:"borrower,omitempty"`
	Lender   *Lender   `json:"lender,omitempty"`
}

// Payment represents a payment made towards a loan
type Payment struct {
	ID          int       `json:"id" db:"id"`
	LoanID      int       `json:"loan_id" db:"loan_id"`
	Amount      float64   `json:"amount" db:"amount"`
	PaymentDate time.Time `json:"payment_date" db:"payment_date"`
	Notes       string    `json:"notes" db:"notes"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// LoanReport represents calculated loan information for reporting
type LoanReport struct {
	Loan            *Loan     `json:"loan"`
	TotalPaid       float64   `json:"total_paid"`
	RemainingBalance float64  `json:"remaining_balance"`
	MonthlyPayment  float64   `json:"monthly_payment"`
	PaymentsCount   int       `json:"payments_count"`
	LastPaymentDate *time.Time `json:"last_payment_date,omitempty"`
}