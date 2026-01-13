import React from 'react';
import { motion } from 'framer-motion';
import './ProductCard.css';

function ProductCard({ product, onAddToCart, onClick }) {
  return (
    <div className="product-card" onClick={onClick}>
      <div className="product-image">
        <motion.img 
          src={product.image} 
          alt={product.name}
          className="product-img"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '<span class="product-emoji">📦</span>';
          }}
        />
        
        {!product.inStock && (
          <motion.div 
            className="out-of-stock-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            Sold Out
          </motion.div>
        )}

        {/* Hover Overlay */}
        <div className="product-overlay">
          <span className="view-details">View Details</span>
        </div>
      </div>
      
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
      </div>
    </div>
  );
}

export default ProductCard;
