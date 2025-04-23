import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";
import Axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Link, useLocation } from "react-router-dom";

const Products = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState([]);
  const [loading, setLoading] = useState(false);
  let componentMounted = true;

  const dispatch = useDispatch();

  const addProduct = (product) => {
    dispatch(addCart(product));
  };

  const location = useLocation(); // to read query params (optional)

  // Fetch products when component mounts
  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      const response = await Axios.get(`http://localhost:8000/getProducts`);
      if (componentMounted) {
        setData(response.data);
        setFilter(response.data); // initially show all products
        setLoading(false);
      }

      return () => {
        componentMounted = false;
      };
    };

    getProducts();
  }, []);

  // Update the filter when category changes in the URL or by category buttons
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get("category");

    if (categoryFromUrl) {
      // Filter products based on the category from the URL
      const filteredData = data.filter((item) => item.category === categoryFromUrl);
      setFilter(filteredData);
    } else {
      // No category, show all products
      setFilter(data);
    }
  }, [location.search, data]); // Re-run when location.search or data changes

  const Loading = () => {
    return (
      <>
        <div className="col-12 py-5 text-center">
          <Skeleton height={40} width={560} />
        </div>
        {[...Array(6)].map((_, index) => (
          <div key={index} className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
            <Skeleton height={592} />
          </div>
        ))}
      </>
    );
  };

  // Filter products based on selected category button
  const filterProduct = (cat) => {
    if (cat === "all") {
      // Reset filter to all products
      window.history.pushState(null, "", `/products`);
      setFilter(data);
    } else {
      window.history.pushState(null, "", `?category=${cat}`);
      const updatedList = data.filter((item) => item.category === cat);
      setFilter(updatedList);
    }
  };

  const ShowProducts = () => {
    return (
      <>
        <div className="buttons text-center py-5" id="product-gallery">
          <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("all")}>All</button>
          <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("modern seating")}>Modern Seating</button>
          <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("classic vintage")}>Classic Vintage</button>
          <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("modular flexible")}>Modular Flexible</button>
        </div>

        {filter.map((product) => {
          return (
            <div id={product.id} key={product.id} className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
              <div className="card text-center h-100" key={product.id}>
                <img
                  className="card-img-top p-3"
                  src={product.image}
                  alt="Card"
                  height={300}
                />
                <div className="card-body">
                  <h5 className="card-title">
                    {product.title.substring(0, 12)}...
                  </h5>
                  <p className="card-text">
                    {product.description.substring(0, 90)}...
                  </p>
                </div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item lead">PKR {product.price}</li>
                </ul>
                <div className="card-body">
                  <Link to={"/product/" + product.id} className="btn btn-dark m-1">
                    Buy Now
                  </Link>
                  <button className="btn btn-dark m-1" onClick={() => addProduct(product)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <>
      <div className="container my-3 py-3">
        <div className="row">
          <div className="col-12">
            <h2 className="display-5 text-center">Latest Products</h2>
            <hr />
          </div>
        </div>
        <div className="row justify-content-center">
          {loading ? <Loading /> : <ShowProducts />}
        </div>
      </div>
    </>
  );
};

export default Products;