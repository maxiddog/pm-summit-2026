import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { datadogRum } from '@datadog/browser-rum';
import { Analytics } from '@vercel/analytics/react';
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
  },
  {
    id: 'lego-001',
    name: 'Bits Lego Set',
    description: 'Build your own Bits! This 850-piece Lego set features the AI SRE Agent in stunning detail. Perfect for desk display or stress relief during incident response. Includes collector box.',
    price: 0,
    image: '/images/lego-set.jpg',
    sizes: ['One Size'],
    category: 'Accessories',
    inStock: true
  },
  {
    id: 'bandana-001',
    name: 'Datadog Bandana',
    description: 'Classic black bandana featuring an all-over Datadog mascot pattern. Versatile styling - wear it as a headband, neck scarf, or pocket square. 100% soft cotton.',
    price: 0,
    image: '/images/bandana.jpg',
    sizes: ['One Size'],
    category: 'Accessories',
    inStock: true
  },
  {
    id: 'snowglobe-001',
    name: 'Bits Snow Globe',
    description: 'Magical snow globe featuring the Bits mascot in a winter wonderland. Shake it up and watch the snow fall around your favorite AI companion. Comes in premium gift box.',
    price: 0,
    image: '/images/snow-globe.jpg',
    sizes: ['One Size'],
    category: 'Accessories',
    inStock: true
  },
  {
    id: 'pin-001',
    name: 'Bits Enamel Pin',
    description: 'High-quality enamel pin featuring Bits on a purple gradient background. Perfect for jackets, bags, or lanyards. Individually wrapped for gifting.',
    price: 0,
    image: '/images/bits-pin.jpg',
    sizes: ['One Size'],
    category: 'Accessories',
    inStock: true
  },
  {
    id: 'tracksuit-001',
    name: 'Datadog Track Suit',
    description: 'Premium black track jacket and joggers set with embroidered Datadog logo patches. Sleek athletic fit perfect for the gym, travel, or working from home in style.',
    price: 0,
    image: '/images/tracksuit.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    category: 'Tops',
    inStock: true
  },
  {
    id: 'dashboard-cap-001',
    name: 'Dashboard 5-Panel Cap',
    description: 'Eye-catching purple and pink 5-panel cap featuring a Datadog dashboard design. Retro-futuristic style with adjustable strap. Stand out at any tech event.',
    price: 0,
    image: '/images/dashboard-cap.jpg',
    sizes: ['One Size'],
    category: 'Accessories',
    inStock: true
  },
  {
    id: 'www-cap-001',
    name: 'World Wide Web Cap',
    description: 'Vintage-inspired cream and purple baseball cap with bold embroidered DATADOG lettering and World Wide Web globe design. A nod to internet history.',
    price: 0,
    image: '/images/www-cap.jpg',
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
          <img 
            src="/images/datadog-logo.jpg" 
            alt="Datadog" 
            className="datadog-logo-img"
          />
          <span className="footer-tagline">Vibecoded with ❤️ in NYC<br/>(with flaky office WiFi)</span>
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
      <Analytics />
    </div>
  );
}

export default App;
