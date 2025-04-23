import React from 'react';
import './Footer.css'; // Keep it minimal now

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'burlywood' }} className="text-dark pt-5 pb-3">
      <div className="container">
        <div className="row gy-4">
          {/* Left Section */}
          <div className="col-md-4 text-center text-md-start">
            <h4>Holo Decor</h4>
            <p>Your virtual home decor assistant.</p>
            <p className="mb-0">Contact Us:</p>
            <small>Email: support@holodecor.com</small>
          </div>

          {/* Middle Section */}
          <div className="col-md-4 text-center" style={{ color: 'white' }}>
            <ul className="list-unstyled" >
              <li><a href="#" className="text-decoration-none text-dark d-block mb-2">Home</a></li>
              <li><a href="#" className="text-decoration-none text-dark d-block mb-2">Shop</a></li>
              <li><a href="#" className="text-decoration-none text-dark d-block mb-2">AR Visualization</a></li>
              <li><a href="#" className="text-decoration-none text-dark d-block mb-2">Our Story</a></li>
              <li><a href="#" className="text-decoration-none text-dark d-block mb-2">Blog</a></li>
            </ul>
          </div>

          {/* Right Section */}
          <div className="col-md-4 text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-3 mb-2">
              <a href="https://facebook.com/holodecor" target="_blank" rel="noopener noreferrer">
                <img src="facebook-icon.png" alt="Facebook" width="30" height="30" />
              </a>
              <a href="https://twitter.com/holodecor" target="_blank" rel="noopener noreferrer">
                <img src="twitter-icon.png" alt="Twitter" width="30" height="30" />
              </a>
              <a href="https://instagram.com/holodecor" target="_blank" rel="noopener noreferrer">
                <img src="instagram-icon.png" alt="Instagram" width="30" height="30" />
              </a>
            </div>
            <div className="small">
              <a href="#" className="text-muted me-2 text-decoration-none">Privacy Policy</a>
              <span>|</span>
              <a href="#" className="text-muted ms-2 text-decoration-none">Terms & Conditions</a>
            </div>
          </div>
        </div>

        <hr className="my-4" style={{ borderTop: '1px solid #ccc' }} />

        {/* Bottom */}
        <div className="text-center small">
          &copy; 2025 Holo Decor. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;