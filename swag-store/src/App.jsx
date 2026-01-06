import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { datadogRum } from '@datadog/browser-rum';
import './App.css';
import TutorialOverlay from './components/TutorialOverlay';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import Cart from './components/Cart';
import CheckoutForm from './components/CheckoutForm';

// Initialize Datadog RUM
const instanceId = window.location.hostname.split('.')[0] || 'local';
datadogRum.init({
  applicationId: import.meta.env.VITE_DD_APP_ID || 'demo-app',
  clientToken: import.meta.env.VITE_DD_CLIENT_TOKEN || 'demo-token',
  site: 'datadoghq.com',
  service: `swag-store-${instanceId}`,
  env: 'game',
  version: '1.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'allow'
});

// Sample products - Datadog PM Summit swag
const PRODUCTS = [
  {
    id: 'crewneck-001',
    name: 'Datadog Varsity Crewneck',
    description: 'Premium black crewneck sweatshirt featuring classic varsity-style Datadog lettering. Made from ultra-soft cotton blend for all-day comfort. The perfect blend of casual style and Datadog pride.',
    price: 0,
    image: '/images/crewneck.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    category: 'Tops',
    inStock: true
  },
  {
    id: 'polo-001',
    name: 'Research Lab Polo',
    description: 'Sleek performance polo with stunning purple gradient design. Features Datadog Research Lab branding and the iconic Bits mascot. Perfect for the office or casual Fridays.',
    price: 0,
    image: '/images/polo.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    category: 'Tops',
    inStock: true
  },
  {
    id: 'tshirt-001',
    name: 'PM Summit 2026 Tee',
    description: "Exclusive Product Management Summit 2026 edition tee. Front features 'World's Best Product Manager' script, back showcases the PM Summit artwork. A collector's item for product leaders.",
    price: 0,
    image: '/images/tshirt.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    category: 'Tops',
    inStock: true
  },
  {
    id: 'sweater-001',
    name: 'Datadog Holiday Sweater',
    description: 'Festive purple knit sweater with traditional Nordic pattern and Datadog branding. Perfect for holiday parties, ugly sweater contests, or cozy debugging sessions.',
    price: 0,
    image: '/images/holiday-sweater.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    category: 'Tops',
    inStock: false
  },
  {
    id: 'candle-001',
    name: 'Datadog Candle',
    description: 'Luxurious scented candle in amber glass jar with elegant purple & gold packaging. Hand-poured with a calming scent perfect for late-night coding sessions or relaxing after a successful deployment.',
    price: 0,
    image: '/images/candle.jpg',
    sizes: ['One Size'],
    category: 'Accessories',
    inStock: true
  },
  {
    id: 'cards-001',
    name: 'BITS AI Agent Cards',
    description: 'Limited edition collectible trading cards featuring the BITS AI agents: SRE Agent, Dev Agent, and Security Analyst. Each card has unique stats and abilities. Collect them all!',
    price: 0,
    image: '/images/agent-cards.jpg',
    sizes: ['One Size'],
    category: 'Accessories',
    inStock: true
  },
  {
    id: 'checkered-001',
    name: 'Checkered Bits Tee',
    description: 'Bold all-over print tee with mesmerizing purple & white checkered pattern featuring the Bits mascot. A statement piece that turns heads at any tech conference.',
    price: 0,
    image: '/images/checkered-tee.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    category: 'Tops',
    inStock: true
  },
  {
    id: 'hoodie-001',
    name: 'Scattered Datadog Hoodie',
    description: 'Premium black hoodie with artistic scattered DATADOG lettering and embroidered Bits logo. Heavyweight cotton blend for maximum comfort during those marathon debugging sessions.',
    price: 0,
    image: '/images/black-hoodie.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    category: 'Tops',
    inStock: true
  },
  {
    id: 'longsleeve-001',
    name: 'Web Application Long Sleeve',
    description: 'Cream long sleeve covered in purple Datadog graphics, icons, and typography. Features dashboard elements, the Bits mascot, and Web Application branding. Wearable art for developers.',
    price: 0,
    image: '/images/longsleeve.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    category: 'Tops',
    inStock: true
  },
  {
    id: 'plush-001',
    name: 'Bits VR Plush Keychain',
    description: 'Adorable plush keychain featuring Bits wearing VR goggles. Soft, cuddly, and ready for the metaverse. Clip it to your bag, keys, or monitor for good luck during deployments.',
    price: 0,
    image: '/images/bits-plush.jpg',
    sizes: ['One Size'],
    category: 'Accessories',
    inStock: true
  }
];

// Categories for sidebar
const CATEGORIES = ['All', 'Tops', 'Accessories'];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100
    }
  }
};

const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

function App() {
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('products');
  const [showTutorial, setShowTutorial] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bugsFixed, setBugsFixed] = useState({
    checkoutButton: false,
    sizeSelection: false,
    inventory: false
  });

  useEffect(() => {
    datadogRum.addAction('page_view', { view: 'products' });
  }, []);

  // Filter products by category
  const filteredProducts = activeCategory === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  const addToCart = (product, size) => {
    if (size === 'S') {
      const undefinedVar = undefined;
      console.log(undefinedVar.property);
    }

    const cartItem = {
      ...product,
      selectedSize: size,
      cartId: Date.now()
    };

    setCart([...cart, cartItem]);
    datadogRum.addAction('add_to_cart', {
      productId: product.id,
      productName: product.name,
      size: size
    });
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
    datadogRum.addAction('remove_from_cart', { cartId });
  };

  const goToCheckout = () => {
    setView('checkout');
    datadogRum.addAction('checkout_started', { itemCount: cart.length });
  };

  const goToCart = () => {
    setView('cart');
    datadogRum.addAction('view_cart', { itemCount: cart.length });
  };

  const continueShopping = () => {
    setView('products');
    datadogRum.addAction('continue_shopping', {});
  };

  const handleCheckoutComplete = async (shippingInfo) => {
    try {
      const nameParts = shippingInfo.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const orderData = {
        instanceId,
        email: shippingInfo.email,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          selectedSize: item.selectedSize,
          quantity: 1
        })),
        shippingAddress: {
          firstName,
          lastName,
          address: shippingInfo.street,
          apartment: '',
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zip,
          country: shippingInfo.country
        },
        bugsFixed: Object.keys(bugsFixed).filter(key => bugsFixed[key])
      };

      const ORDERS_ENDPOINT = 'https://mcp-swag-store-dispatch-agents.vercel.app/api/orders';
      
      const response = await fetch(ORDERS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Instance-ID': instanceId
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        datadogRum.addAction('order_complete', { 
          orderId: result.orderId,
          orderTotal: cart.length,
          bugsFixed: bugsFixed 
        });
        setView('success');
      } else {
        throw new Error(result.error || 'Order submission failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      datadogRum.addError(error);
      alert('There was an error submitting your order. Please try again.');
    }
  };

  return (
    <div className="app">
      {showTutorial && (
        <TutorialOverlay 
          onClose={() => setShowTutorial(false)}
          currentView={view}
        />
      )}

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />

      {/* Sidebar */}
      <motion.aside 
        className="sidebar"
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="sidebar-brand">
          <h1>
            Datadog
            <span>PM Summit 2026</span>
          </h1>
        </div>
        
        <nav className="sidebar-nav">
          {CATEGORIES.map((category, index) => (
            <motion.button
              key={category}
              className={`sidebar-nav-item ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              {category}
              {category !== 'All' && (
                <span className="category-count">
                  {PRODUCTS.filter(p => p.category === category).length}
                </span>
              )}
            </motion.button>
          ))}
          <motion.button 
            className="sidebar-nav-item"
            onClick={() => setShowTutorial(true)}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            Debug Guide
          </motion.button>
        </nav>

        <div className="sidebar-footer">
          <div className="datadog-logo">
            <svg viewBox="0 0 800 800" fill="currentColor">
              <path d="M589.3 330.5c-2.4-1.5-4.8-2.9-7.3-4.3l-5.4-3c-7.6-4.1-15.7-7.3-24.1-9.7-1.8-.5-3.5-1-5.3-1.4l-2.6-.6c-8.8-2-18-3-27.3-3.2-2.4 0-4.9-.1-7.3 0l-2.8.1c-9.3.4-18.6 1.8-27.6 4.2-1.8.5-3.5 1-5.3 1.6l-2.6.9c-8.6 3-16.9 6.8-24.6 11.6-1.7 1-3.3 2.1-5 3.2l-2.4 1.6c-7.5 5.3-14.5 11.4-20.7 18.3-1.3 1.4-2.6 2.9-3.8 4.4l-1.8 2.2c-5.8 7.2-10.7 15-14.6 23.3-.8 1.7-1.5 3.5-2.2 5.2l-.8 2.1-26-17.8c.3-1 .7-2 1-3 4.5-12.8 10.9-24.8 19-35.6 1.6-2.2 3.3-4.3 5.1-6.4l2.5-3c8.3-9.6 17.8-18.1 28.2-25.3 2.2-1.5 4.4-2.9 6.7-4.3l3.2-1.9c10.6-6.2 22.1-11 34.1-14.4 2.4-.7 4.9-1.3 7.4-1.9l3.6-.8c12-2.6 24.4-3.9 36.8-3.8 2.6 0 5.3.1 7.9.3l3.9.3c12.4.9 24.6 3.3 36.4 7.2 2.5.8 4.9 1.7 7.3 2.6l3.5 1.4c11.4 4.6 22.3 10.5 32.4 17.7 2.1 1.5 4.2 3.1 6.3 4.7l3 2.4c9.6 7.9 18.3 17 25.7 27.2l-26.8 20.3-1.7-2.1c-7.6-9.4-16.6-17.6-26.6-24.3zm-181 56.3l23.3 18c-.4 1.5-.8 3.1-1.1 4.6-2.1 10.6-2.5 21.5-1 32.2.3 2.3.7 4.5 1.2 6.7l.7 3.1c2.7 11.2 7.4 21.9 14 31.4 1.4 2 2.9 4 4.4 5.8l2.3 2.8c7.4 8.8 16.4 16.3 26.5 22.1 2.1 1.2 4.2 2.3 6.4 3.4l3.2 1.5c10.4 4.7 21.6 7.6 33 8.6 2.4.2 4.8.3 7.2.4l3.6.1c11.4-.1 22.8-1.9 33.6-5.3l-8.4 30.5c-1.3.3-2.5.5-3.8.8-11.8 2.3-24 3-36 2-2.5-.2-5.1-.5-7.6-.8l-3.8-.5c-11.8-1.8-23.3-5.1-34.1-9.9-2.3-1-4.5-2.1-6.7-3.2l-3.2-1.7c-10.3-5.6-19.8-12.5-28.1-20.6-1.7-1.7-3.4-3.4-5.1-5.2l-2.4-2.6c-7.8-8.8-14.4-18.6-19.5-29.2-1-2.2-2-4.4-2.9-6.6l-1.4-3.3c-4.3-10.9-7-22.3-8-34-.2-2.5-.4-5-.4-7.5l-.1-3.7c0-11.5 1.6-23 4.9-34 .7-2.4 1.5-4.7 2.3-7l1.3-3.4zm198.2 90l8.4-30.6c1.4-.5 2.9-1.1 4.3-1.7 9.6-4.1 18.5-9.6 26.4-16.4 1.7-1.4 3.3-2.9 4.9-4.5l2.3-2.3c6.9-7.3 12.6-15.7 16.8-24.9 1.2-2.6 2.3-5.3 3.3-8l1.4-4c3.4-10.5 5-21.5 4.7-32.6-.1-2.3-.2-4.7-.5-7l-.4-3.4c-1.2-10.5-4.1-20.8-8.6-30.4-1.5-3.2-3.3-6.3-5.2-9.4l27-20.4c1.2 1.8 2.4 3.7 3.5 5.6 6.7 11.4 11.6 23.8 14.5 36.8.6 2.7 1.1 5.4 1.6 8.1l.6 4c1.4 12.8 1 25.7-1.3 38.3-.5 2.7-1.1 5.4-1.8 8l-1 4c-3.7 13.4-9.5 26.2-17.1 37.8-1.6 2.4-3.3 4.8-5 7.1l-2.7 3.5c-8.8 10.8-19.2 20.2-30.8 27.9-2.4 1.6-4.9 3.1-7.4 4.5l-3.8 2.1c-11.3 5.8-23.5 10-36.1 12.4-1.3.2-2.6.5-3.9.7l14.4-52.6c1.3-.3 2.7-.7 4-1.1z"/>
              <path d="M452.8 463.2c-7.8-4.5-14.5-10.5-19.9-17.7-5.3-7.3-9.2-15.5-11.5-24.2-2.3-8.7-3-17.8-2-26.8.9-8.9 3.5-17.6 7.5-25.6 4.1-8 9.7-15.2 16.5-21.1 6.8-5.9 14.8-10.5 23.3-13.5 8.6-3 17.7-4.4 26.8-4.1 9.2.3 18.2 2.2 26.5 5.8 8.3 3.6 15.9 8.8 22.2 15.3 6.3 6.5 11.3 14.2 14.7 22.6 3.4 8.4 5.2 17.4 5.3 26.5.1 9.1-1.6 18.2-4.9 26.6-3.3 8.5-8.3 16.2-14.6 22.7-6.3 6.5-13.8 11.6-22.1 15.3-8.3 3.6-17.3 5.6-26.4 5.9-9.1.3-18.3-1.1-26.9-4.2-8.6-3-16.5-7.6-23.5-13.5zm31.2-99.7c-5.6 2-10.8 5.1-15.2 9.1-4.4 4-7.9 8.9-10.5 14.4-2.6 5.4-4.1 11.3-4.5 17.3-.4 6 .5 12 2.5 17.6 2 5.7 5.1 10.9 9.1 15.3 4 4.4 8.9 8 14.3 10.5 5.4 2.6 11.3 4.1 17.3 4.5 6 .4 12-.5 17.6-2.5 5.6-2 10.8-5.1 15.2-9.1 4.4-4 7.9-8.8 10.5-14.3 2.6-5.5 4.1-11.3 4.5-17.3.4-6-.5-12-2.5-17.7-2-5.6-5.1-10.8-9.1-15.2-4-4.4-8.8-7.9-14.3-10.5-5.5-2.6-11.3-4.1-17.3-4.5-6-.4-12 .5-17.6 2.4z"/>
            </svg>
          </div>
          <span>© 2026 Datadog</span>
        </div>
      </motion.aside>

      {/* Floating Cart Button */}
      <motion.div 
        className="cart-floating"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button 
          className="cart-button" 
          onClick={goToCart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Cart ({cart.length})
        </motion.button>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {view === 'products' && (
          <motion.main 
            className="main-content"
            key="products"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="products-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={addToCart}
                    onClick={() => setSelectedProduct(product)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.main>
        )}

        {view === 'cart' && (
          <motion.div 
            className="cart-view"
            key="cart"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Cart
              cart={cart}
              onRemove={removeFromCart}
              onCheckout={goToCheckout}
              onContinueShopping={continueShopping}
            />
          </motion.div>
        )}

        {view === 'checkout' && (
          <motion.div 
            className="checkout-view"
            key="checkout"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CheckoutForm
              cart={cart}
              onComplete={handleCheckoutComplete}
              onBack={() => setView('cart')}
            />
          </motion.div>
        )}

        {view === 'success' && (
          <motion.div 
            className="success-view"
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.div 
              className="success-card"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <motion.div 
                className="success-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                ✓
              </motion.div>
              <h2>Order Submitted!</h2>
              <p>
                Congratulations! You've successfully debugged the swag store and 
                placed your order. We'll ship your items soon!
              </p>
              <div className="bugs-fixed">
                <strong>Bugs Fixed:</strong>
                <ul>
                  {Object.entries(bugsFixed).map(([bug, fixed]) => (
                    <li key={bug}>
                      {fixed ? '✓' : '○'} {bug.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </li>
                  ))}
                </ul>
              </div>
              <motion.button 
                className="btn-primary"
                onClick={() => window.location.reload()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start New Challenge
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
