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

// Sample products
const PRODUCTS = [
  {
    id: 'hoodie-001',
    name: 'Datadog Monitoring Hoodie',
    description: 'Stay warm while monitoring your infrastructure',
    price: 0,
    image: '🧥',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    inStock: true
  },
  {
    id: 'tshirt-001',
    name: 'Log Everything T-Shirt',
    description: 'Because logs are life',
    price: 0,
    image: '👕',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    inStock: true
  },
  {
    id: 'mug-001',
    name: 'APM Coffee Mug',
    description: 'Trace your caffeine performance',
    price: 0,
    image: '☕',
    sizes: ['One Size'],
    inStock: true
  },
  {
    id: 'stickers-001',
    name: 'Datadog Sticker Pack',
    description: 'Decorate everything with observability',
    price: 0,
    image: '🎨',
    sizes: ['One Size'],
    inStock: true
  },
  {
    id: 'hat-001',
    name: 'Dashboard Dad Hat',
    description: 'For the metrics-obsessed',
    price: 0,
    image: '🧢',
    sizes: ['One Size'],
    inStock: true
  },
  {
    id: 'socks-001',
    name: 'Distributed Tracing Socks',
    description: 'Follow the path from toe to heel',
    price: 0,
    image: '🧦',
    sizes: ['S/M', 'L/XL'],
    inStock: false // Intentionally out of stock for demo
  }
];

function App() {
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('products'); // products, cart, checkout
  const [showTutorial, setShowTutorial] = useState(true);
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
      const ORDERS_ENDPOINT = 'https://landing-page-olive-eight-67.vercel.app/api/orders';
      
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

      <header className="header">
        <div className="header-content">
          <h1 className="logo">
            <span className="logo-icon">🐕</span>
            Datadog Swag Store
          </h1>
          <div className="header-actions">
            <button 
              className="cart-button"
              onClick={goToCart}
            >
              🛒 Cart ({cart.length})
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {view === 'products' && (
          <div className="products-view">
            <div className="view-header">
              <h2>Choose Your Swag</h2>
              <p className="subtitle">All items are free! Fix the bugs to checkout.</p>
            </div>
            
            <div className="products-grid">
              {PRODUCTS.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </div>
        )}

        {view === 'cart' && (
          <Cart
            cart={cart}
            onRemove={removeFromCart}
            onCheckout={goToCheckout}
            onContinueShopping={continueShopping}
          />
        )}

        {view === 'checkout' && (
          <CheckoutForm
            cart={cart}
            onComplete={handleCheckoutComplete}
            onBack={() => setView('cart')}
          />
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
              <p className="bugs-fixed">
                <strong>Bugs Fixed:</strong>
                <ul>
                  {Object.entries(bugsFixed).map(([bug, fixed]) => (
                    <li key={bug}>
                      {fixed ? '✓' : '✗'} {bug.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </li>
                  ))}
                </ul>
              </p>
              <button 
                className="btn-primary"
                onClick={() => window.location.reload()}
              >
                Start New Challenge
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Datadog MCP Debugging Challenge | Need help? Check the tutorial!</p>
      </footer>
    </div>
  );
}

export default App;
