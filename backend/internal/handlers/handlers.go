package handlers

import (
	"encoding/json"
	"log"
	"math"
	"net/http"
	"strconv"
	"time"

	"loan-tracker/internal/database"
	"loan-tracker/internal/models"

	"github.com/gorilla/mux"
)

type Handler struct {
	db *database.DB
}

func NewHandler(db *database.DB) *Handler {
	return &Handler{db: db}
}

// Borrower handlers
func (h *Handler) CreateBorrower(w http.ResponseWriter, r *http.Request) {
	var borrower models.Borrower
	if err := json.NewDecoder(r.Body).Decode(&borrower); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	query := `INSERT INTO borrowers (name, email, phone) VALUES ($1, $2, $3) RETURNING id`
	err := h.db.QueryRow(query, borrower.Name, borrower.Email, borrower.Phone).Scan(&borrower.ID)
	if err != nil {
		log.Printf("Error creating borrower: %v", err)
		http.Error(w, "Failed to create borrower", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(borrower)
}

func (h *Handler) GetBorrowers(w http.ResponseWriter, r *http.Request) {
	query := `SELECT id, name, email, phone FROM borrowers ORDER BY name`
	rows, err := h.db.Query(query)
	if err != nil {
		http.Error(w, "Failed to fetch borrowers", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var borrowers []models.Borrower
	for rows.Next() {
		var b models.Borrower
		if err := rows.Scan(&b.ID, &b.Name, &b.Email, &b.Phone); err != nil {
			http.Error(w, "Failed to scan borrower", http.StatusInternalServerError)
			return
		}
		borrowers = append(borrowers, b)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(borrowers)
}

// Lender handlers
func (h *Handler) CreateLender(w http.ResponseWriter, r *http.Request) {
	var lender models.Lender
	if err := json.NewDecoder(r.Body).Decode(&lender); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	query := `INSERT INTO lenders (name, email, phone) VALUES ($1, $2, $3) RETURNING id`
	err := h.db.QueryRow(query, lender.Name, lender.Email, lender.Phone).Scan(&lender.ID)
	if err != nil {
		http.Error(w, "Failed to create lender", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(lender)
}

func (h *Handler) GetLenders(w http.ResponseWriter, r *http.Request) {
	query := `SELECT id, name, email, phone FROM lenders ORDER BY name`
	rows, err := h.db.Query(query)
	if err != nil {
		http.Error(w, "Failed to fetch lenders", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var lenders []models.Lender
	for rows.Next() {
		var l models.Lender
		if err := rows.Scan(&l.ID, &l.Name, &l.Email, &l.Phone); err != nil {
			http.Error(w, "Failed to scan lender", http.StatusInternalServerError)
			return
		}
		lenders = append(lenders, l)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(lenders)
}

// Loan handlers
func (h *Handler) CreateLoan(w http.ResponseWriter, r *http.Request) {
	var loan models.Loan
	if err := json.NewDecoder(r.Body).Decode(&loan); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Validate input
	if loan.Principal <= 0 {
		http.Error(w, "Principal must be greater than 0", http.StatusBadRequest)
		return
	}
	if loan.InterestRate < 0 {
		http.Error(w, "Interest rate must be non-negative", http.StatusBadRequest)
		return
	}
	if loan.TermMonths <= 0 {
		http.Error(w, "Term must be greater than 0", http.StatusBadRequest)
		return
	}

	query := `INSERT INTO loans (borrower_id, lender_id, principal, interest_rate, term_months, start_date, status) 
	          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, created_at, updated_at`
	err := h.db.QueryRow(query, loan.BorrowerID, loan.LenderID, loan.Principal, 
		loan.InterestRate, loan.TermMonths, loan.StartDate, "active").Scan(
		&loan.ID, &loan.CreatedAt, &loan.UpdatedAt)
	if err != nil {
		log.Printf("Error creating loan: %v", err)
		http.Error(w, "Failed to create loan", http.StatusInternalServerError)
		return
	}

	loan.Status = "active"
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(loan)
}

func (h *Handler) GetLoans(w http.ResponseWriter, r *http.Request) {
	query := `
	SELECT l.id, l.borrower_id, l.lender_id, l.principal, l.interest_rate, 
	       l.term_months, l.start_date, l.status, l.created_at, l.updated_at,
	       b.name as borrower_name, b.email as borrower_email, b.phone as borrower_phone,
	       le.name as lender_name, le.email as lender_email, le.phone as lender_phone
	FROM loans l
	JOIN borrowers b ON l.borrower_id = b.id
	JOIN lenders le ON l.lender_id = le.id
	ORDER BY l.created_at DESC`

	rows, err := h.db.Query(query)
	if err != nil {
		log.Printf("Error fetching loans: %v", err)
		http.Error(w, "Failed to fetch loans", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var loans []models.Loan
	for rows.Next() {
		var l models.Loan
		var borrower models.Borrower
		var lender models.Lender

		err := rows.Scan(&l.ID, &l.BorrowerID, &l.LenderID, &l.Principal, &l.InterestRate,
			&l.TermMonths, &l.StartDate, &l.Status, &l.CreatedAt, &l.UpdatedAt,
			&borrower.Name, &borrower.Email, &borrower.Phone,
			&lender.Name, &lender.Email, &lender.Phone)
		if err != nil {
			log.Printf("Error scanning loan: %v", err)
			http.Error(w, "Failed to scan loan", http.StatusInternalServerError)
			return
		}

		borrower.ID = l.BorrowerID
		lender.ID = l.LenderID
		l.Borrower = &borrower
		l.Lender = &lender

		loans = append(loans, l)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(loans)
}

func (h *Handler) GetLoan(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	loanID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid loan ID", http.StatusBadRequest)
		return
	}

	query := `
	SELECT l.id, l.borrower_id, l.lender_id, l.principal, l.interest_rate, 
	       l.term_months, l.start_date, l.status, l.created_at, l.updated_at,
	       b.name as borrower_name, b.email as borrower_email, b.phone as borrower_phone,
	       le.name as lender_name, le.email as lender_email, le.phone as lender_phone
	FROM loans l
	JOIN borrowers b ON l.borrower_id = b.id
	JOIN lenders le ON l.lender_id = le.id
	WHERE l.id = $1`

	var l models.Loan
	var borrower models.Borrower
	var lender models.Lender

	err = h.db.QueryRow(query, loanID).Scan(&l.ID, &l.BorrowerID, &l.LenderID, &l.Principal, &l.InterestRate,
		&l.TermMonths, &l.StartDate, &l.Status, &l.CreatedAt, &l.UpdatedAt,
		&borrower.Name, &borrower.Email, &borrower.Phone,
		&lender.Name, &lender.Email, &lender.Phone)
	
	if err != nil {
		http.Error(w, "Loan not found", http.StatusNotFound)
		return
	}

	borrower.ID = l.BorrowerID
	lender.ID = l.LenderID
	l.Borrower = &borrower
	l.Lender = &lender

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(l)
}

// Payment handlers
func (h *Handler) CreatePayment(w http.ResponseWriter, r *http.Request) {
	var payment models.Payment
	if err := json.NewDecoder(r.Body).Decode(&payment); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if payment.Amount <= 0 {
		http.Error(w, "Payment amount must be greater than 0", http.StatusBadRequest)
		return
	}

	query := `INSERT INTO payments (loan_id, amount, payment_date, notes) 
	          VALUES ($1, $2, $3, $4) RETURNING id, created_at`
	err := h.db.QueryRow(query, payment.LoanID, payment.Amount, 
		payment.PaymentDate, payment.Notes).Scan(&payment.ID, &payment.CreatedAt)
	if err != nil {
		log.Printf("Error creating payment: %v", err)
		http.Error(w, "Failed to create payment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payment)
}

func (h *Handler) GetPayments(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	loanID, err := strconv.Atoi(vars["loanId"])
	if err != nil {
		http.Error(w, "Invalid loan ID", http.StatusBadRequest)
		return
	}

	query := `SELECT id, loan_id, amount, payment_date, notes, created_at 
	          FROM payments WHERE loan_id = $1 ORDER BY payment_date DESC`
	rows, err := h.db.Query(query, loanID)
	if err != nil {
		http.Error(w, "Failed to fetch payments", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var payments []models.Payment
	for rows.Next() {
		var p models.Payment
		if err := rows.Scan(&p.ID, &p.LoanID, &p.Amount, &p.PaymentDate, &p.Notes, &p.CreatedAt); err != nil {
			http.Error(w, "Failed to scan payment", http.StatusInternalServerError)
			return
		}
		payments = append(payments, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payments)
}

// Report handler
func (h *Handler) GetLoanReport(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	loanID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid loan ID", http.StatusBadRequest)
		return
	}

	// Get loan details
	var loan models.Loan
	var borrower models.Borrower
	var lender models.Lender

	query := `
	SELECT l.id, l.borrower_id, l.lender_id, l.principal, l.interest_rate, 
	       l.term_months, l.start_date, l.status, l.created_at, l.updated_at,
	       b.name as borrower_name, b.email as borrower_email, b.phone as borrower_phone,
	       le.name as lender_name, le.email as lender_email, le.phone as lender_phone
	FROM loans l
	JOIN borrowers b ON l.borrower_id = b.id
	JOIN lenders le ON l.lender_id = le.id
	WHERE l.id = $1`

	err = h.db.QueryRow(query, loanID).Scan(&loan.ID, &loan.BorrowerID, &loan.LenderID, &loan.Principal, &loan.InterestRate,
		&loan.TermMonths, &loan.StartDate, &loan.Status, &loan.CreatedAt, &loan.UpdatedAt,
		&borrower.Name, &borrower.Email, &borrower.Phone,
		&lender.Name, &lender.Email, &lender.Phone)
	
	if err != nil {
		http.Error(w, "Loan not found", http.StatusNotFound)
		return
	}

	borrower.ID = loan.BorrowerID
	lender.ID = loan.LenderID
	loan.Borrower = &borrower
	loan.Lender = &lender

	// Calculate payment statistics
	paymentQuery := `
	SELECT COALESCE(SUM(amount), 0) as total_paid,
	       COUNT(*) as payments_count,
	       MAX(payment_date) as last_payment_date
	FROM payments WHERE loan_id = $1`

	var totalPaid float64
	var paymentsCount int
	var lastPaymentDate *time.Time

	err = h.db.QueryRow(paymentQuery, loanID).Scan(&totalPaid, &paymentsCount, &lastPaymentDate)
	if err != nil {
		log.Printf("Error calculating payment stats: %v", err)
		http.Error(w, "Failed to calculate payment statistics", http.StatusInternalServerError)
		return
	}

	// Calculate monthly payment and remaining balance
	monthlyPayment := calculateMonthlyPayment(loan.Principal, loan.InterestRate, loan.TermMonths)
	remainingBalance := math.Max(0, loan.Principal-totalPaid)

	report := models.LoanReport{
		Loan:             &loan,
		TotalPaid:        totalPaid,
		RemainingBalance: remainingBalance,
		MonthlyPayment:   monthlyPayment,
		PaymentsCount:    paymentsCount,
		LastPaymentDate:  lastPaymentDate,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(report)
}

// calculateMonthlyPayment calculates the monthly payment for a loan using the formula:
// M = P * [r(1 + r)^n] / [(1 + r)^n - 1]
// where M = monthly payment, P = principal, r = monthly interest rate, n = number of months
func calculateMonthlyPayment(principal, annualRate float64, termMonths int) float64 {
	if annualRate == 0 {
		return principal / float64(termMonths)
	}

	monthlyRate := annualRate / 100 / 12
	n := float64(termMonths)
	
	payment := principal * (monthlyRate * math.Pow(1+monthlyRate, n)) / (math.Pow(1+monthlyRate, n) - 1)
	return payment
}

// Health check handler
func (h *Handler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"status":    "healthy",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}