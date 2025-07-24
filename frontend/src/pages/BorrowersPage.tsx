import React, { useState, useEffect } from 'react';
import { loanAPI, type Borrower } from '../services/api';

const BorrowersPage: React.FC = () => {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const fetchBorrowers = async () => {
    try {
      setLoading(true);
      const data = await loanAPI.getBorrowers();
      setBorrowers(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch borrowers');
      console.error('Error fetching borrowers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      await loanAPI.createBorrower(formData);
      
      // Reset form and refresh data
      setFormData({ name: '', email: '', phone: '' });
      setShowForm(false);
      await fetchBorrowers();
    } catch (err) {
      setError('Failed to create borrower');
      console.error('Error creating borrower:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading borrowers...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">Borrowers</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          Add Borrower
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Add Borrower Form */}
      {showForm && (
        <div className="card">
          <h2>Add New Borrower</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-success" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Borrower'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
                style={{ backgroundColor: '#6c757d', color: 'white' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Borrowers List */}
      <div className="card">
        {borrowers.length === 0 ? (
          <p>No borrowers found. Add your first borrower using the button above.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {borrowers.map((borrower) => (
                <tr key={borrower.id}>
                  <td>{borrower.id}</td>
                  <td>{borrower.name}</td>
                  <td>{borrower.email || '-'}</td>
                  <td>{borrower.phone || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BorrowersPage;