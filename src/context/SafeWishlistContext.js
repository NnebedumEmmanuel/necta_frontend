// Proxy re-exports to the top-level WishlistContext implementation
// The top-level file is `context/WishlistContext.jsx` (not SafeWishlistContext).
export { default } from '../../context/WishlistContext.jsx';
export { WishlistProvider, useWishlist } from '../../context/WishlistContext.jsx';

// For compatibility with imports expecting `WishlistProvider` as a named export
// consumers can do: import { WishlistProvider } from './context/SafeWishlistContext'
