import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loanAPI, type Loan, type Payment, type LoanReport } from '../services/api';

const LoanDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [report, setReport] = useState<LoanReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLoanData(parseInt(id));
    }
  }, [id]);

  const fetchLoanData = async (loanId: number) => {
    try {
      setLoading(true);
      const [loanData, paymentsData, reportData] = await Promise.all([
        loanAPI.getLoan(loanId),
        loanAPI.getPayments(loanId),
        loanAPI.getLoanReport(loanId),
      ]);
      setLoan(loanData);
      setPayments(paymentsData || []);
      setReport(reportData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch loan data');
      console.error('Error fetching loan data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !paymentAmount) return;

    try {
      setSubmitting(true);
      await loanAPI.createPayment({
        loan_id: parseInt(id),
        amount: parseFloat(paymentAmount),
        payment_date: paymentDate,
        notes: paymentNotes,
      });
      
      // Refresh data
      await fetchLoanData(parseInt(id));
      
      // Reset form
      setPaymentAmount('');
      setPaymentNotes('');
      setShowPaymentForm(false);
    } catch (err) {
      setError('Failed to create payment');
      console.error('Error creating payment:', err);
    } finally {
      setSubmitting(false);
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
    return <div className="loading">Loading loan details...</div>;
  }

  if (error) {
    return (
      <div>
        <div className="error">{error}</div>
        <Link to="/" className="btn btn-primary">
          Back to Loans
        </Link>
      </div>
    );
  }

  if (!loan || !report) {
    return (
      <div>
        <div className="error">Loan not found</div>
        <Link to="/" className="btn btn-primary">
          Back to Loans
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">Loan Details</h1>
        <Link to="/" className="btn btn-primary">
          Back to Loans
        </Link>
      </div>

      {/* Loan Information */}
      <div className="card">
        <h2>Loan Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Loan ID:</strong> {loan.id}
          </div>
          <div>
            <strong>Status:</strong> {loan.status}
          </div>
          <div>
            <strong>Borrower:</strong> {loan.borrower?.name}
          </div>
          <div>
            <strong>Lender:</strong> {loan.lender?.name}
          </div>
          <div>
            <strong>Principal:</strong> {formatCurrency(loan.principal)}
          </div>
          <div>
            <strong>Interest Rate:</strong> {loan.interest_rate}%
          </div>
          <div>
            <strong>Term:</strong> {loan.term_months} months
          </div>
          <div>
            <strong>Start Date:</strong> {formatDate(loan.start_date)}
          </div>
        </div>
      </div>

      {/* Loan Summary */}
      <div className="card">
        <h2>Loan Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Monthly Payment:</strong> {formatCurrency(report.monthly_payment)}
          </div>
          <div>
            <strong>Total Paid:</strong> {formatCurrency(report.total_paid)}
          </div>
          <div>
            <strong>Remaining Balance:</strong> {formatCurrency(report.remaining_balance)}
          </div>
          <div>
            <strong>Number of Payments:</strong> {report.payments_count}
          </div>
          {report.last_payment_date && (
            <div>
              <strong>Last Payment:</strong> {formatDate(report.last_payment_date)}
            </div>
          )}
        </div>
      </div>

      {/* Payment Form */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Payments</h2>
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="btn btn-success"
          >
            Add Payment
          </button>
        </div>

        {showPaymentForm && (
          <form onSubmit={handleSubmitPayment} style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="form-input"
                rows={3}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-success" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Payment'}
              </button>
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="btn btn-secondary"
                style={{ backgroundColor: '#6c757d' }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Payments Table */}
        {payments.length === 0 ? (
          <p>No payments recorded yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Notes</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{formatDate(payment.payment_date)}</td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>{payment.notes || '-'}</td>
                  <td>{formatDate(payment.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LoanDetailsPage;