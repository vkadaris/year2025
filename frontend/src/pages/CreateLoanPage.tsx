import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loanAPI, type Borrower, type Lender } from '../services/api';

const CreateLoanPage: React.FC = () => {
  const navigate = useNavigate();
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    borrower_id: '',
    lender_id: '',
    principal: '',
    interest_rate: '',
    term_months: '',
    start_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [borrowersData, lendersData] = await Promise.all([
        loanAPI.getBorrowers(),
        loanAPI.getLenders(),
      ]);
      setBorrowers(borrowersData || []);
      setLenders(lendersData || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch borrowers and lenders');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.borrower_id || !formData.lender_id) {
      setError('Please select both a borrower and a lender');
      return;
    }

    const principal = parseFloat(formData.principal);
    const interestRate = parseFloat(formData.interest_rate);
    const termMonths = parseInt(formData.term_months);

    if (principal <= 0) {
      setError('Principal must be greater than 0');
      return;
    }

    if (interestRate < 0) {
      setError('Interest rate must be non-negative');
      return;
    }

    if (termMonths <= 0) {
      setError('Term must be greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const loanData = {
        borrower_id: parseInt(formData.borrower_id),
        lender_id: parseInt(formData.lender_id),
        principal,
        interest_rate: interestRate,
        term_months: termMonths,
        start_date: formData.start_date,
      };

      const newLoan = await loanAPI.createLoan(loanData);
      navigate(`/loans/${newLoan.id}`);
    } catch (err) {
      setError('Failed to create loan');
      console.error('Error creating loan:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading form data...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">Create New Loan</h1>
        <Link to="/" className="btn btn-primary">
          Back to Loans
        </Link>
      </div>

      {error && <div className="error">{error}</div>}

      {(borrowers.length === 0 || lenders.length === 0) && (
        <div className="card" style={{ backgroundColor: '#fff3cd', borderColor: '#ffeaa7' }}>
          <p>
            <strong>Note:</strong> You need at least one borrower and one lender to create a loan.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            {borrowers.length === 0 && (
              <Link to="/borrowers" className="btn btn-primary">
                Add Borrowers
              </Link>
            )}
            {lenders.length === 0 && (
              <Link to="/lenders" className="btn btn-primary">
                Add Lenders
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Borrower</label>
            <select
              name="borrower_id"
              value={formData.borrower_id}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Select a borrower</option>
              {borrowers.map((borrower) => (
                <option key={borrower.id} value={borrower.id}>
                  {borrower.name} ({borrower.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Lender</label>
            <select
              name="lender_id"
              value={formData.lender_id}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Select a lender</option>
              {lenders.map((lender) => (
                <option key={lender.id} value={lender.id}>
                  {lender.name} ({lender.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Principal Amount ($)</label>
            <input
              type="number"
              name="principal"
              value={formData.principal}
              onChange={handleInputChange}
              className="form-input"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Annual Interest Rate (%)</label>
            <input
              type="number"
              name="interest_rate"
              value={formData.interest_rate}
              onChange={handleInputChange}
              className="form-input"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Term (months)</label>
            <input
              type="number"
              name="term_months"
              value={formData.term_months}
              onChange={handleInputChange}
              className="form-input"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="submit"
              className="btn btn-success"
              disabled={submitting || borrowers.length === 0 || lenders.length === 0}
            >
              {submitting ? 'Creating...' : 'Create Loan'}
            </button>
            <Link to="/" className="btn btn-secondary" style={{ backgroundColor: '#6c757d', color: 'white' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLoanPage;