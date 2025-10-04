import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero" role="banner">
        <div className="hero-content">
          <h1 className="hero-title">
            Professional Laboratory Equipment
          </h1>
          <p className="hero-subtitle">
            Precision instruments for research excellence and scientific innovation
          </p>
          <Link to="/products" className="hero-button">
            Explore Our Products
            <span className="button-icon">→</span>
          </Link>
        </div>
        <div className="hero-background">
          <div className="hero-shape shape-1"></div>
          <div className="hero-shape shape-2"></div>
          <div className="hero-shape shape-3"></div>
        </div>
      </section>

      <section className="features">
        <div className="features-container">
          <h2 className="section-title">Why Choose ProLab Equipment?</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Precision & Accuracy</h3>
              <p>
                State-of-the-art instruments engineered for exceptional accuracy
                and reproducibility in every measurement.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Quality Assurance</h3>
              <p>
                ISO certified manufacturing processes ensuring the highest
                standards of quality and compliance.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🛠️</div>
              <h3>Expert Support</h3>
              <p>
                Comprehensive technical support, training, and maintenance
                services from our team of specialists.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Global Reach</h3>
              <p>
                Worldwide distribution network with local service centers
                for rapid response and support.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h3>Innovation</h3>
              <p>
                Cutting-edge technology incorporating AI, automation, and
                advanced analytics for modern laboratories.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Compliance</h3>
              <p>
                Full regulatory compliance with FDA, CE, and international
                standards for regulated environments.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Elevate Your Research?</h2>
          <p>
            Discover our comprehensive range of laboratory equipment designed
            for precision, reliability, and innovation.
          </p>
          <Link to="/products" className="cta-button">
            View Product Catalog
          </Link>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Research Institutions</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-label">Countries Served</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">15+</div>
            <div className="stat-label">Years Experience</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">99.8%</div>
            <div className="stat-label">Customer Satisfaction</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;