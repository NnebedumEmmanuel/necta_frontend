import React from 'react'
import { Instagram, Facebook, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Column 1: Company */}
        <div className="space-y-4">
          <Link to="/" className="inline-block">
            <img src="/images/img6.png" alt="Necta" className="w-32" />
          </Link>
          <p className="text-sm text-gray-400">
            NectaHub — quality electronics and power solutions. Shop with
            confidence and get fast delivery across Nigeria.
          </p>
          <div className="flex items-center gap-3">
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
              <Instagram size={20} />
            </a>
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
              <Facebook size={20} />
            </a>
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        {/* Column 2: Shop */}
        <div>
          <h4 className="font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <Link to="/shop" className="hover:text-white">All Products</Link>
            </li>
            <li>
              <Link to="/shop?category=speakers" className="hover:text-white">Speakers</Link>
            </li>
            <li>
              <Link to="/shop?category=solar" className="hover:text-white">Solar</Link>
            </li>
            <li>
              <Link to="/shop?category=inverter" className="hover:text-white">Inverters</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Support */}
        <div>
          <h4 className="font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <Link to="/contact" className="hover:text-white">Contact Us</Link>
            </li>
            <li>
              <Link to="/shipping-returns" className="hover:text-white">Shipping & Returns</Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-white">Terms & Conditions</Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Stay Connected (Newsletter) */}
        <div>
          <h4 className="font-semibold mb-3">Stay Connected</h4>
          <p className="text-sm text-gray-400 mb-3">Subscribe to our newsletter for updates and offers.</p>
          <form
            onSubmit={(e) => { e.preventDefault(); /* TODO: hook up newsletter submission */ }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <input
              type="email"
              placeholder="Your email"
              aria-label="Subscribe email"
              required
              className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-sm placeholder-gray-400 focus:outline-none"
            />
            <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded text-sm">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="border-t border-gray-800 bg-gray-800 text-gray-400 text-xs py-3">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>©{new Date().getFullYear()} NectaHub. All rights reserved.</div>
          <div>Powered by Necta</div>
        </div>
      </div>
    </footer>
  )
}
