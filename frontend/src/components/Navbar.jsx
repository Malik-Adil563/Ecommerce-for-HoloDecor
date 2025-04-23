import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Navbar = () => {
  const state = useSelector(state => state.handleCart);
  const [isLoginVisible, setIsLoginVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const authState = localStorage.getItem('authState');
    setIsLoginVisible(authState !== 'loggedin');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authState');
    setIsLoginVisible(true);
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
      <div className="container-fluid">
        {/* Left: Navigation Links */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/product">Products</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">About</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/contact">Contact</NavLink>
            </li>
          </ul>
        </div>

        {/* Center: Logo */}
        <NavLink to="/" className="navbar-brand mx-auto">
          <img
            src="/assets/holodecorlogo.png"
            alt="HoloDecor Logo"
            className="d-inline-block align-middle"
            style={{
              height: '70px',       
              objectFit: 'contain',
              cursor: 'pointer',
             
            }}
          />
        </NavLink>

        {/* Right: Search, Cart, User */}
        <div className="d-flex align-items-center">
          <div className="d-none d-lg-flex align-items-center">
            <input
              type="text"
              placeholder="Search"
              className="form-control form-control-sm me-2"
              style={{ maxWidth: '200px' }}
            />
            <button className="btn btn-sm btn-outline-secondary me-2">🔍</button>
            <NavLink to="/cart" className="btn btn-sm btn-outline-primary me-2">
              <i className="fa fa-cart-shopping me-1"></i>({state.length})
            </NavLink>
          </div>

          <div className="dropdown d-inline-block">
            <button
              className="btn btn-sm btn-outline-secondary dropdown-toggle"
              type="button"
              id="userMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="fa fa-user"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuButton">
              {isLoginVisible ? (
                <>
                  <li>
                    <NavLink to="/login" className="dropdown-item">
                      <i className="fa fa-sign-in-alt me-2"></i> Login
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/register" className="dropdown-item">
                      <i className="fa fa-user-plus me-2"></i> Register
                    </NavLink>
                  </li>
                </>
              ) : (
                <li>
                  <button onClick={handleLogout} className="dropdown-item">
                    <i className="fa fa-sign-out-alt me-2"></i> Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;