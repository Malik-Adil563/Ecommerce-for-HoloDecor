import React from "react";
import { Footer, Navbar } from "../components";

const ContactPage = () => {
  return (
    <>
      <Navbar />

      <div
        style={{
          backgroundImage: "url('/assets/contact-bg.jpg')", // Your custom image
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          paddingTop: "60px",
          paddingBottom: "60px",
        }}
      >
        <div className="container">
          <div
            className="col-md-6 col-lg-5 col-sm-10 mx-auto p-4"
            style={{
              background: "rgba(255, 255, 255, 0.75)",
              backdropFilter: "blur(12px)",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 className="text-center mb-4 fw-bold text-dark">Contact Us</h2>
            <form>
              <div className="mb-3">
                <label htmlFor="Name" className="form-label fw-semibold">
                  Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="Name"
                  placeholder="Enter your name"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="Email" className="form-label fw-semibold">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="Email"
                  placeholder="name@example.com"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="Message" className="form-label fw-semibold">
                  Message
                </label>
                <textarea
                  rows={5}
                  className="form-control"
                  id="Message"
                  placeholder="Enter your message"
                />
              </div>
              <div className="text-center">
                <button className="btn btn-dark px-4" type="submit">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ContactPage;
