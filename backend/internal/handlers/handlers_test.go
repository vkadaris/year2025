package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"loan-tracker/internal/models"
)

func TestCalculateMonthlyPayment(t *testing.T) {
	tests := []struct {
		name        string
		principal   float64
		rate        float64
		termMonths  int
		expected    float64
		tolerance   float64
	}{
		{
			name:       "Zero interest rate",
			principal:  10000,
			rate:       0,
			termMonths: 12,
			expected:   833.33,
			tolerance:  0.01,
		},
		{
			name:       "Standard loan",
			principal:  100000,
			rate:       5.0, // 5% annual
			termMonths: 360, // 30 years
			expected:   536.82,
			tolerance:  0.01,
		},
		{
			name:       "Short term loan",
			principal:  5000,
			rate:       3.5,
			termMonths: 24,
			expected:   216.01,
			tolerance:  0.01,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := calculateMonthlyPayment(tt.principal, tt.rate, tt.termMonths)
			if abs(result-tt.expected) > tt.tolerance {
				t.Errorf("calculateMonthlyPayment() = %v, want %v (tolerance %v)", result, tt.expected, tt.tolerance)
			}
		})
	}
}

func abs(x float64) float64 {
	if x < 0 {
		return -x
	}
	return x
}

func TestHealthCheck(t *testing.T) {
	// Create a request to pass to our handler
	req, err := http.NewRequest("GET", "/api/health", nil)
	if err != nil {
		t.Fatal(err)
	}

	// Create a ResponseRecorder to record the response
	rr := httptest.NewRecorder()
	
	// Create a handler instance (we don't need a real database for this test)
	handler := &Handler{}

	// Call the handler
	handler.HealthCheck(rr, req)

	// Check the status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// Check the response body contains expected fields
	var response map[string]string
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Errorf("could not parse response JSON: %v", err)
	}

	if response["status"] != "healthy" {
		t.Errorf("expected status to be 'healthy', got %v", response["status"])
	}

	if response["timestamp"] == "" {
		t.Errorf("expected timestamp to be present")
	}
}

// Mock tests for handlers that require database connection
func TestCreateBorrowerInvalidJSON(t *testing.T) {
	// Test with invalid JSON
	req, err := http.NewRequest("POST", "/api/borrowers", bytes.NewBuffer([]byte("invalid json")))
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := &Handler{} // No DB needed for this test

	handler.CreateBorrower(rr, req)

	if status := rr.Code; status != http.StatusBadRequest {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusBadRequest)
	}
}

func TestCreatePaymentInvalidAmount(t *testing.T) {
	// Test with invalid payment amount
	payment := models.Payment{
		LoanID: 1,
		Amount: -100, // Invalid negative amount
	}
	
	jsonData, _ := json.Marshal(payment)
	req, err := http.NewRequest("POST", "/api/payments", bytes.NewBuffer(jsonData))
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := &Handler{} // No DB needed for this test

	handler.CreatePayment(rr, req)

	if status := rr.Code; status != http.StatusBadRequest {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusBadRequest)
	}
}

func TestCreateLoanValidation(t *testing.T) {
	tests := []struct {
		name     string
		loan     models.Loan
		wantCode int
	}{
		{
			name: "Invalid principal",
			loan: models.Loan{
				Principal:    -1000,
				InterestRate: 5.0,
				TermMonths:   12,
			},
			wantCode: http.StatusBadRequest,
		},
		{
			name: "Invalid interest rate",
			loan: models.Loan{
				Principal:    1000,
				InterestRate: -1.0,
				TermMonths:   12,
			},
			wantCode: http.StatusBadRequest,
		},
		{
			name: "Invalid term",
			loan: models.Loan{
				Principal:    1000,
				InterestRate: 5.0,
				TermMonths:   0,
			},
			wantCode: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			jsonData, _ := json.Marshal(tt.loan)
			req, err := http.NewRequest("POST", "/api/loans", bytes.NewBuffer(jsonData))
			if err != nil {
				t.Fatal(err)
			}

			rr := httptest.NewRecorder()
			handler := &Handler{} // No DB needed for validation tests

			handler.CreateLoan(rr, req)

			if status := rr.Code; status != tt.wantCode {
				t.Errorf("handler returned wrong status code: got %v want %v", status, tt.wantCode)
			}
		})
	}
}