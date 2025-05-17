import React, { useState } from 'react';
import axios from 'axios';
import { setAdminToken } from '../../utils/authUtils';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Replace with your actual login endpoint
      const response = await axios.post('https://elmanafea.shop/admin/login', {
        username,
        password
      });
      
      // Check if token exists in the response
      if (response.data && response.data.token) {
        // Store the token using our utility
        setAdminToken(response.data.token);
        
        // Redirect to admin dashboard or show success message
        window.location.href = '/admin/dashboard';
      } else {
        setError('Invalid response from server. Token not received.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <h2>Admin Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
