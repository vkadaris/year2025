import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loanAPI, type Loan } from '../services/api';

const LoansPage: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const data = await loanAPI.getLoans();
      setLoans(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch loans');
      console.error('Error fetching loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading loans...</div>;
  }

  if (error) {
    return (
      <div>
        <div className="error">{error}</div>
        <button onClick={fetchLoans} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">Loans</h1>
        <Link to="/loans/create" className="btn btn-primary">
          Create New Loan
        </Link>
      </div>

      {loans.length === 0 ? (
        <div className="card">
          <p>No loans found. <Link to="/loans/create">Create your first loan</Link>.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Borrower</th>
                <th>Lender</th>
                <th>Principal</th>
                <th>Interest Rate</th>
                <th>Term</th>
                <th>Start Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id}>
                  <td>{loan.id}</td>
                  <td>{loan.borrower?.name || 'Unknown'}</td>
                  <td>{loan.lender?.name || 'Unknown'}</td>
                  <td>{formatCurrency(loan.principal)}</td>
                  <td>{loan.interest_rate}%</td>
                  <td>{loan.term_months} months</td>
                  <td>{formatDate(loan.start_date)}</td>
                  <td>
                    <span
                      className={`status ${loan.status}`}
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        backgroundColor:
                          loan.status === 'active'
                            ? '#d4edda'
                            : loan.status === 'completed'
                            ? '#d1ecf1'
                            : '#f8d7da',
                        color:
                          loan.status === 'active'
                            ? '#155724'
                            : loan.status === 'completed'
                            ? '#0c5460'
                            : '#721c24',
                      }}
                    >
                      {loan.status}
                    </span>
                  </td>
                  <td>
                    <Link
                      to={`/loans/${loan.id}`}
                      className="btn btn-primary"
                      style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LoansPage;