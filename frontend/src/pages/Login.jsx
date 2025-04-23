import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Footer, Navbar } from "../components";
import axios from "axios";

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
        localStorage.setItem('authState', "loggedin");
        navigate('/');
      }
    } catch (error) {
      if (error.response) {
        console.error('Error response', error.response.data);
        alert('Login failed: ' + error.response.data);
      } else {
        console.error('Error:', error.message);
        alert('An error occurred: ' + error.message);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: "100vh",
          background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url('/assets/login-bg.png') center/cover no-repeat`,
        }}
      >
        <div className="card shadow-lg p-4 rounded-4" style={{ maxWidth: '450px', width: '100%', backgroundColor: 'rgba(255,255,255,0.95)' }}>
          <h2 className="text-center fw-bold mb-3">Welcome Back 👋</h2>
          <hr />
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <span>
                New here? <Link to="/register" className="text-decoration-none text-primary">Register</Link>
              </span>
              <button type="submit" className="btn btn-dark px-4">Login</button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
