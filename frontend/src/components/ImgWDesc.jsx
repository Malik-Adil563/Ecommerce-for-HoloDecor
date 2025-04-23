import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ImgWDesc = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 }); // Initialize AOS
  }, []);

  return (
    <section className="py-5 bg-white font-serif">
      <div className="container">
        <div className="row align-items-center justify-content-center flex-wrap">
          
          {/* Text Section */}
          <div
            className="col-md-6 col-12 p-3"
            data-aos="fade-right"
          >
          <h2
  className="fw-bold text-dark mb-4"
  style={{
    fontSize: 'clamp(2rem, 5vw, 4rem)',
    lineHeight: '1.2',
    wordBreak: 'break-word'
  }}
>
  <span>The power of imagination</span>
  <span> brought to life!</span>
</h2>


            <p className="text-secondary mb-4" style={{ fontSize: '2rem', lineHeight: '1.6' }}>
              Experience your space like never before. With our HoloDecor, you can view life-sized 3D sofas right in your room—through your camera or a photo.
            </p>

            {/* Styled Button */}
            <button
              className="btn btn-warning px-4 py-2 rounded-pill shadow"
              style={{
                fontSize: '1rem',
                fontWeight: '500',
                color: '#fff',
                backgroundColor: '#ffa500',
                borderColor: '#ffa500'
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#ff8c00')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#ffa500')}
            >
              Try HoloDecor Now
            </button>
          </div>

          {/* Image Section */}
          <div
            className="col-md-6 col-12 p-3 d-flex justify-content-center align-items-center"
            data-aos="fade-left"
          >
            <img
              src="/assets/hpimg1.jpg"
              alt="Description"
              className="img-fluid"
              style={{ maxWidth: '500px', width: '100%' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImgWDesc;