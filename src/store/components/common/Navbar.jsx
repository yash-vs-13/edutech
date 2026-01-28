import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Navbar = memo(() => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center min-h-[4rem]">
        <Link to="/" className="flex items-center space-x-2 pt-4 pb-4 pr-4 text-xl font-bold text-primary-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>EduTech</span>
        </Link>
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;