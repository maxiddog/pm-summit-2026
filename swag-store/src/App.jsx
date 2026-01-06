import { useState, useEffect } from 'react';
import { datadogRum } from '@datadog/browser-rum';
import './App.css';
import TutorialOverlay from './components/TutorialOverlay';
import ProductCard from './components/ProductCard';
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
    description: 'Premium black crewneck with classic varsity-style Datadog lettering',
    price: 0,
    image: '/images/crewneck.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    inStock: true
  },
  {
    id: 'polo-001',
    name: 'Research Lab Polo',
    description: 'Sleek purple gradient polo with Datadog Research Lab branding',
    price: 0,
    image: '/images/polo.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    inStock: true
  },
  {
    id: 'tshirt-001',
    name: 'PM Summit 2026 Tee',
    description: "World's Best Product Manager - exclusive Product Management Summit edition",
    price: 0,
    image: '/images/tshirt.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    inStock: true
  },
  {
    id: 'sweater-001',
    name: 'Datadog Holiday Sweater',
    description: 'Festive purple knit sweater with Nordic pattern and Datadog branding',
    price: 0,
    image: '/images/holiday-sweater.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    inStock: false // Intentionally out of stock for demo
  },
  {
    id: 'candle-001',
    name: 'Datadog Candle',
    description: 'Luxurious scented candle in amber glass with purple & gold packaging',
    price: 0,
    image: '/images/candle.jpg',
    sizes: ['One Size'],
    inStock: true
  },
  {
    id: 'cards-001',
    name: 'BITS AI Agent Cards',
    description: 'Collectible trading cards featuring BITS AI SRE, Dev & Security agents',
    price: 0,
    image: '/images/agent-cards.jpg',
    sizes: ['One Size'],
    inStock: true
  },
  {
    id: 'checkered-001',
    name: 'Checkered Bits Tee',
    description: 'Bold purple & white checkered tee with Bits mascot graphic',
    price: 0,
    image: '/images/checkered-tee.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    inStock: true
  },
  {
    id: 'hoodie-001',
    name: 'Scattered Datadog Hoodie',
    description: 'Black hoodie with scattered DATADOG lettering and Bits logo',
    price: 0,
    image: '/images/black-hoodie.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    inStock: true
  },
  {
    id: 'longsleeve-001',
    name: 'Web Application Long Sleeve',
    description: 'Cream long sleeve with purple Datadog graphics and icons',
    price: 0,
    image: '/images/longsleeve.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    inStock: true
  },
  {
    id: 'plush-001',
    name: 'Bits VR Plush Keychain',
    description: 'Adorable Bits plush keychain wearing VR goggles',
    price: 0,
    image: '/images/bits-plush.jpg',
    sizes: ['One Size'],
    inStock: true
  }
];

// Categories for sidebar
const CATEGORIES = ['All', 'Tops', 'Accessories'];

function App() {
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('products'); // products, cart, checkout
  const [showTutorial, setShowTutorial] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [bugsFixed, setBugsFixed] = useState({
    checkoutButton: false,
    sizeSelection: false,
    inventory: false
  });

  useEffect(() => {
    // Log page view
    datadogRum.addAction('page_view', { view: 'products' });
  }, []);

  const addToCart = (product, size) => {
    // BUG #2: Exception when selecting size "S" (Small)
    // This bug causes an uncaught exception that will appear in Datadog
    if (size === 'S') {
      // Intentional bug: trying to access undefined property
      const undefinedVar = undefined;
      console.log(undefinedVar.property); // This will throw
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

  // BUG #1: Checkout button doesn't work
  // The onClick handler is missing/broken
  const goToCheckout = () => {
    // This function exists but is never called due to bug in Cart component
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
    // Submit order to central admin endpoint
    // This endpoint is on the landing page server and collects all orders
    try {
      // Parse full name into first/last name
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

      // Central order collection endpoint - hardcoded and non-manipulatable
      // All orders from all user instances are sent here
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
        
        // Show success message
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

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>
            Datadog
            <span>PM Summit 2026</span>
          </h1>
        </div>
        
        <nav className="sidebar-nav">
          {CATEGORIES.map(category => (
            <button
              key={category}
              className={`sidebar-nav-item ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
          <button 
            className="sidebar-nav-item"
            onClick={() => setShowTutorial(true)}
          >
            Debug Guide
          </button>
        </nav>

        <div className="sidebar-footer">
          © 2026 Datadog
        </div>
      </aside>

      {/* Floating Cart Button */}
      <div className="cart-floating">
        <button className="cart-button" onClick={goToCart}>
          Cart ({cart.length})
        </button>
      </div>

      {/* Main Content */}
      {view === 'products' && (
        <main className="main-content">
          <div className="products-grid">
            {PRODUCTS.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </main>
      )}

      {view === 'cart' && (
        <div className="cart-view">
          <Cart
            cart={cart}
            onRemove={removeFromCart}
            onCheckout={goToCheckout}
            onContinueShopping={continueShopping}
          />
        </div>
      )}

      {view === 'checkout' && (
        <div className="checkout-view">
          <CheckoutForm
            cart={cart}
            onComplete={handleCheckoutComplete}
            onBack={() => setView('cart')}
          />
        </div>
      )}

      {view === 'success' && (
        <div className="success-view">
          <div className="success-card">
            <div className="success-icon">✓</div>
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
            <button 
              className="btn-primary"
              onClick={() => window.location.reload()}
            >
              Start New Challenge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
