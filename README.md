# Loan Tracker Application

A full-stack web application for tracking loans, borrowers, lenders, and payments. Built with React frontend, Go backend, and PostgreSQL database.

## Features

- **Loan Management**: Create and track loans with terms like principal, interest rate, and term
- **Borrower & Lender Management**: Maintain records of borrowers and lenders
- **Payment Tracking**: Record monthly payments manually and track payment history
- **Loan Reports**: Generate detailed reports showing loan summaries, payment history, and remaining balances
- **Monthly Payment Calculation**: Automatically calculate monthly payments based on loan terms

## Technology Stack

- **Frontend**: React with TypeScript, React Router, Axios
- **Backend**: Go with Gorilla Mux router
- **Database**: PostgreSQL
- **Containerization**: Docker and Docker Compose

## Project Structure

```
.
├── backend/
│   ├── cmd/                    # Application entry point
│   ├── internal/
│   │   ├── database/          # Database connection and schema
│   │   ├── handlers/          # HTTP handlers
│   │   └── models/            # Data models
│   ├── Dockerfile
│   └── go.mod
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   └── services/         # API service
│   └── package.json
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js and npm (for frontend development)
- Go 1.21+ (for backend development)

### Running with Docker Compose

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd year2025
   ```

2. Start the services:
   ```bash
   docker-compose up -d
   ```

3. The application will be available at:
   - Backend API: http://localhost:8080
   - Database: localhost:5432

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

### Running the Backend Locally

1. Ensure PostgreSQL is running (via Docker Compose or locally)

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   go mod tidy
   ```

4. Run the application:
   ```bash
   go run ./cmd
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Check API health

### Borrowers
- `GET /api/borrowers` - Get all borrowers
- `POST /api/borrowers` - Create a new borrower

### Lenders
- `GET /api/lenders` - Get all lenders
- `POST /api/lenders` - Create a new lender

### Loans
- `GET /api/loans` - Get all loans
- `GET /api/loans/{id}` - Get a specific loan
- `POST /api/loans` - Create a new loan
- `GET /api/loans/{id}/report` - Get loan report

### Payments
- `POST /api/payments` - Create a new payment
- `GET /api/loans/{loanId}/payments` - Get payments for a loan

## Database Schema

The application uses PostgreSQL with the following tables:

- **borrowers**: Store borrower information
- **lenders**: Store lender information  
- **loans**: Store loan details and terms
- **payments**: Store payment records

## Environment Variables

### Backend
- `DB_HOST`: Database host (default: localhost)
- `DB_PORT`: Database port (default: 5432)
- `DB_USER`: Database user (default: postgres)
- `DB_PASSWORD`: Database password (default: password)
- `DB_NAME`: Database name (default: loan_tracker)
- `DB_SSLMODE`: SSL mode (default: disable)
- `PORT`: Server port (default: 8080)

## Testing

### Backend Tests
```bash
cd backend
go test ./internal/handlers -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Features Overview

### Loan Calculation
The application calculates monthly payments using the standard loan formula:
```
M = P * [r(1 + r)^n] / [(1 + r)^n - 1]
```
Where:
- M = Monthly payment
- P = Principal amount
- r = Monthly interest rate
- n = Number of months

### Payment Tracking
- Manual payment entry with date and amount
- Payment history with notes
- Automatic calculation of remaining balance
- Last payment date tracking

### Reporting
- Total amount paid
- Remaining balance
- Number of payments made
- Monthly payment amount
- Complete payment history

## Development

### Adding New Features
1. Backend: Add new handlers in `internal/handlers/`
2. Database: Update schema in `internal/database/database.go`
3. Frontend: Add new pages in `src/pages/` and components in `src/components/`
4. API: Update API service in `src/services/api.ts`

### Code Style
- Go: Follow standard Go conventions
- React: Use TypeScript, functional components with hooks
- CSS: Use BEM methodology for class naming

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.