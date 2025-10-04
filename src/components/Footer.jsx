import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-section">
          <h3>ProLab Equipment</h3>
          <p>Professional laboratory and scientific equipment for research excellence.</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a href="#documentation">Documentation</a></li>
            <li><a href="#warranty">Warranty</a></li>
            <li><a href="#service">Service & Support</a></li>
            <li><a href="#training">Training</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <ul>
            <li>📧 info@prolabequipment.com</li>
            <li>📞 +1 (555) 123-4567</li>
            <li>📍 123 Science Park, Research City</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} ProLab Equipment. All rights reserved.</p>
        <p className="footer-compliance">
          ISO 9001:2015 Certified | ISO 13485 Compliant
        </p>
      </div>
    </footer>
  );
};

export default Footer;