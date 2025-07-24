import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import LoansPage from './pages/LoansPage';
import LoanDetailsPage from './pages/LoanDetailsPage';
import CreateLoanPage from './pages/CreateLoanPage';
import BorrowersPage from './pages/BorrowersPage';
import LendersPage from './pages/LendersPage';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              Loan Tracker
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  Loans
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/borrowers" className="nav-link">
                  Borrowers
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/lenders" className="nav-link">
                  Lenders
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/loans/create" className="nav-link">
                  Create Loan
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LoansPage />} />
            <Route path="/loans/:id" element={<LoanDetailsPage />} />
            <Route path="/loans/create" element={<CreateLoanPage />} />
            <Route path="/borrowers" element={<BorrowersPage />} />
            <Route path="/lenders" element={<LendersPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
