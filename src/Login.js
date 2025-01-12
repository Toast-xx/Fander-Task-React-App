import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login form submitted with:', { email, password });
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      console.log('Login Successful:', response.data);
      localStorage.setItem('token', response.data.token); // Store the token in localStorage
      console.log('Token stored in localStorage:', response.data.token);
      setIsAuthenticated(true); // Set authentication state
      setSuccess('Login Successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard'); // Redirect to the dashboard after a short delay
      }, 2000);
    } catch (err) {
      console.error('Login Failed:', err);
      setError('Invalid email or password');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email:
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <br />
      <label>
        Password:
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      <br />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;