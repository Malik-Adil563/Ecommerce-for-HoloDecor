import React, { useState } from 'react';
import { Footer, Navbar } from "../components";
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/register', { name, email, password });
      if (response.data && response.data.token) {
        navigate('/login');
      }
    } catch (error) {
      if (error.response) {
        alert('Signup failed: ' + error.response.data);
      } else {
        alert('An error occurred: ' + error.message);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div 
        className="container-fluid d-flex align-items-center justify-content-center min-vh-100 bg-light"
        style={{
          backgroundImage: `url('/assets/register-bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="card shadow-lg p-4" style={{ maxWidth: "450px", width: "100%", borderRadius: "20px", background: "rgba(255,255,255,0.9)" }}>
          <h2 className="text-center mb-3">Create an Account ✨</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label>Email address</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="text-center">
              <button className="btn btn-dark w-100">Register</button>
            </div>
            <p className="mt-3 text-center">
              Already have an account? <Link to="/login" className="text-info text-decoration-none">Login</Link>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;
