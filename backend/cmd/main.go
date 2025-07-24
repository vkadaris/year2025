package main

import (
	"log"
	"net/http"
	"os"

	"loan-tracker/internal/database"
	"loan-tracker/internal/handlers"

	"github.com/gorilla/mux"
)

func main() {
	// Connect to database
	db, err := database.Connect()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Create tables
	if err := db.CreateTables(); err != nil {
		log.Fatal("Failed to create tables:", err)
	}

	// Initialize handlers
	handler := handlers.NewHandler(db)

	// Setup routes
	r := mux.NewRouter()

	// API routes
	api := r.PathPrefix("/api").Subrouter()

	// Health check
	api.HandleFunc("/health", handler.HealthCheck).Methods("GET")

	// Borrower routes
	api.HandleFunc("/borrowers", handler.CreateBorrower).Methods("POST")
	api.HandleFunc("/borrowers", handler.GetBorrowers).Methods("GET")

	// Lender routes
	api.HandleFunc("/lenders", handler.CreateLender).Methods("POST")
	api.HandleFunc("/lenders", handler.GetLenders).Methods("GET")

	// Loan routes
	api.HandleFunc("/loans", handler.CreateLoan).Methods("POST")
	api.HandleFunc("/loans", handler.GetLoans).Methods("GET")
	api.HandleFunc("/loans/{id:[0-9]+}", handler.GetLoan).Methods("GET")
	api.HandleFunc("/loans/{id:[0-9]+}/report", handler.GetLoanReport).Methods("GET")

	// Payment routes
	api.HandleFunc("/payments", handler.CreatePayment).Methods("POST")
	api.HandleFunc("/loans/{loanId:[0-9]+}/payments", handler.GetPayments).Methods("GET")

	// Setup CORS headers manually for now
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			
			next.ServeHTTP(w, r)
		})
	})

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
