import React from "react";

const Home = () => {
  const scrollToGallery = () => {
    const gallerySection = document.getElementById("product-gallery");
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  return (
    <>
      <div className="hero border-1 pb-3">
        <div className="card bg-dark text-white border-0 mx-3">
          <img
            className="card-img img-fluid"
            src="./assets/bgimg2.jpg"
            alt="Card"
            style={{ objectFit: "cover", width: "100%", height: "600px" }}  // Adjusting the image style
          />
          <div className="card-img-overlay d-flex align-items-center">
            <div className="container">
              <h1 className="card-title text fw-bold text-center">Holo Decor: Where reality meets imagination.</h1>
              <h2 className="text-center">We emphasize Fast And Quality Work</h2>
              <p className="text-center fs-5">Let your creativity flow as you see how new designs fit seamlessly into your space.</p>
              <div className="d-flex justify-content-center py-3">
                <button style={{ backgroundColor: '#8a6344' }} className="btn text-center" onClick={scrollToGallery}>
                  Check Out Our Gallery
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;