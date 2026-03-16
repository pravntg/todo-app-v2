import { useState } from 'react';
import axios from 'axios';

const AUTH_API_URL = 'http://localhost:5000/api/auth';

function Auth({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isLogin ? '/login' : '/register';
    
    try {
      const res = await axios.post(`${AUTH_API_URL}${endpoint}`, { email, password });
      
      // Save the generated token to local storage
      localStorage.setItem('token', res.data.token);
      
      // Update global state
      setToken(res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div className="app-container auth-container">
      <h2>{isLogin ? 'Welcome Back.' : 'Create an Account.'}</h2>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        {isLogin ? 'Sign in to access your secure tasks.' : 'Sign up to encrypt and save your tasks.'}
      </p>

      {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" 
          className="todo-input" 
          placeholder="Email Address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" 
          className="todo-input" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="add-btn" style={{ padding: '12px', marginTop: '10px' }}>
          {isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <p style={{ marginTop: '2rem', cursor: 'pointer', color: '#38bdf8' }} onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </p>
    </div>
  );
}

export default Auth;
