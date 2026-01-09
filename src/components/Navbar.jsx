import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { session, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  return (
    <nav className="navbar">
      {}
      <div className="user-section">
        {!session ? (
          <Link to="/login" className="flex items-center px-3 py-1 rounded bg-orange-500 text-white hover:bg-orange-600" aria-label="Sign In">
            <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Sign In
          </Link>
        ) : (
          <div className="flex items-center space-x-3">
            {session.user.user_metadata?.avatar_url ? (
              <Link to="/dashboard">
                <img
                  src={session.user.user_metadata.avatar_url}
                  alt="avatar"
                  className="w-8 h-8 rounded-full cursor-pointer"
                />
              </Link>
            ) : (
              <Link to="/dashboard" className="flex items-center px-2 py-1 rounded bg-gray-200 hover:bg-gray-300" aria-label="Dashboard">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6" />
                </svg>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-1 rounded bg-orange-500 text-white hover:bg-orange-600"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
