import React, { useState, useEffect } from 'react';
import { loanAPI, type Lender } from '../services/api';

const LendersPage: React.FC = () => {
  const [lenders, setLenders] = useState<Lender[]>([]);
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
    fetchLenders();
  }, []);

  const fetchLenders = async () => {
    try {
      setLoading(true);
      const data = await loanAPI.getLenders();
      setLenders(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch lenders');
      console.error('Error fetching lenders:', err);
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
      
      await loanAPI.createLender(formData);
      
      // Reset form and refresh data
      setFormData({ name: '', email: '', phone: '' });
      setShowForm(false);
      await fetchLenders();
    } catch (err) {
      setError('Failed to create lender');
      console.error('Error creating lender:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading lenders...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">Lenders</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          Add Lender
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Add Lender Form */}
      {showForm && (
        <div className="card">
          <h2>Add New Lender</h2>
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
                {submitting ? 'Adding...' : 'Add Lender'}
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

      {/* Lenders List */}
      <div className="card">
        {lenders.length === 0 ? (
          <p>No lenders found. Add your first lender using the button above.</p>
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
              {lenders.map((lender) => (
                <tr key={lender.id}>
                  <td>{lender.id}</td>
                  <td>{lender.name}</td>
                  <td>{lender.email || '-'}</td>
                  <td>{lender.phone || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LendersPage;