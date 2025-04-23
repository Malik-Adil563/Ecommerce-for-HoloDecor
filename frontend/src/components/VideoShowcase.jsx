import React from "react";
import sofa3D from "../assets/videos/sofa3D.mp4";

const VideoShowcase = () => {
  return (
    <section className="py-5 bg-light border-top">
      <div className="container text-center">
        <h2 className="display-5 fw-semibold text-dark" style={{ fontFamily: "Georgia, 'Times New Roman', Times, serif" }}>
          See the Sofa in 3D Action
        </h2>
        <p className="lead text-secondary mb-4">
          Explore how our Seating styles fit in any space with realistic 3D modeling.
        </p>
        <div className="mx-auto rounded overflow-hidden shadow" style={{ maxWidth: "900px" }}>
          <video
            controls
            autoPlay
            loop
            muted
            playsInline
            className="w-100 d-block"
          >
            <source src={sofa3D} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;