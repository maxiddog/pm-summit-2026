import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductModal.css';

function ProductModal({ product, isOpen, onClose, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeError, setShowSizeError] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowSizeError(true);
      return;
    }

    setShowSizeError(false);
    
    try {
      onAddToCart(product, selectedSize);
      setSelectedSize('');
      onClose();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(`Oops! An error occurred: ${error.message}\n\nTry using Datadog MCP to investigate this exception!`);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div 
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <button className="modal-close" onClick={onClose}>×</button>
            
            <div className="modal-body">
              <motion.div 
                className="modal-image"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <img src={product.image} alt={product.name} />
              </motion.div>
              
              <motion.div 
                className="modal-info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="modal-category">{product.category}</span>
                <h2 className="modal-title">{product.name}</h2>
                <p className="modal-description">{product.description}</p>
                <p className="modal-price">FREE</p>

                {!product.inStock ? (
                  <div className="modal-sold-out">Sold Out</div>
                ) : (
                  <div className="modal-actions">
                    <div className="modal-size-selector">
                      <label>Select Size</label>
                      <div className="modal-size-options">
                        {product.sizes.map(size => (
                          <motion.button
                            key={size}
                            className={`modal-size-btn ${selectedSize === size ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedSize(size);
                              setShowSizeError(false);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {size}
                          </motion.button>
                        ))}
                      </div>
                      {showSizeError && (
                        <p className="modal-size-error">Please select a size</p>
                      )}
                    </div>

                    <motion.button 
                      className="modal-add-btn"
                      onClick={handleAddToCart}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Add to Cart
                    </motion.button>

                    {selectedSize === 'S' && (
                      <div className="modal-warning">
                        ⚠️ Size "S" may cause issues - this is an intentional bug!
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ProductModal;

