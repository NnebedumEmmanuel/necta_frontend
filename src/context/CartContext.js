// Proxy re-export to the top-level context implementation and hook
import { CartProvider } from '../../context/CartContext.jsx';
export { useCart } from '../../context/useCartHook.js';
export { CartProvider };
export default CartProvider;
