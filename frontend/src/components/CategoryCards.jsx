import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/style.css';

const CategoryCards = () => {
  const navigate = useNavigate();

  const categories = [
    {
      label: "Modern Seating",
      value: "modern seating",
      description: "Clean lines and minimal design for a modern space.",
      img: "modern-seating.jpg",
    },
    {
      label: "Classic & Vintage",
      value: "classic vintage",
      description: "Timeless charm with detailed, elegant designs.",
      img: "classic-seating.jpg",
    },
    {
      label: "Modular & Flexible",
      value: "modular flexible",
      description: "Flexible arrangements for your unique space.",
      img: "modular-seating.jpg",
    },
  ];

  const goToCategory = (category) => {
    navigate(`/product?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="container py-5" id="product-gallery">
     <h2 className="text-center mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', Times, serif", fontWeight: "bold" }}>
  Explore Seating Styles
</h2>
      <div className="row justify-content-center g-4">
        {categories.map((cat, index) => (
          <div
            key={index}
            className="col-md-4 col-sm-6 col-12"
            onClick={() => goToCategory(cat.value)}
            style={{ cursor: 'pointer' }}
          >
            <div className="hover-card">
              <img
                src={`${process.env.PUBLIC_URL}/assets/${cat.img}`}
                alt={cat.label}
                className="hover-card-img"
              />
              <div className="hover-overlay">
                <div className="hover-text">
                  <h5>{cat.label}</h5>
                  <p>{cat.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryCards;