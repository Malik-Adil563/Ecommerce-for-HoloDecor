import React from 'react';

const SmallSection = () => {
  return (
    <section className="py-5 bg-white">
      <div
        className="container bg-warning-subtle rounded-5 shadow-sm py-5 px-4 d-flex flex-column flex-md-row align-items-center justify-content-between"
        style={{ maxWidth: "1240px" }}
      >
        {/* Text Section */}
        <div className="text-center text-md-start">
          <h2
            className="fw-bold mb-2 text-dark"
            style={{ fontSize: "2rem", fontFamily: "Georgia, 'Times New Roman', Times, serif" }}
          >
            See it. Feel it. Place it
          </h2>
          <p
            className="text-secondary"
            style={{ fontSize: "1.5rem", fontFamily: "Georgia, 'Times New Roman', Times, serif" }}
          >
            Experience high-quality 3D sofa models designed for realism and detail
          </p>
        </div>

        {/* Image Section */}
        <div className="d-flex align-items-center justify-content-center mt-4 mt-md-0 ms-md-4" style={{ transform: "scale(1.4)", transformOrigin: "center" }}>
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ height: "150px", width: "150px", overflow: "visible" }}
          >
            <img
              src="/assets/ssimg2.png"
              alt="3D cube"
              style={{ transform: "scale(1.2)", transformOrigin: "center", maxWidth: "150px", height: "auto" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmallSection;