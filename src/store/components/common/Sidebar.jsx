import React, { memo, cloneElement } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { signOut } from '../../slices/authSlice';

const Sidebar = memo(({ isMinimized = false, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const isActive = (path) => location.pathname === path;

  const handleSignOut = () => {
    dispatch(signOut());
    navigate('/signin');
  };

  const getInitials = () => {
    // Return only the first letter of the first name
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    } else if (user?.name) {
      return user.name.split(' ')[0][0].toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getFirstName = () => {
    return user?.firstName || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  };

  const getCategory = () => {
    return user?.category || 'student';
  };

  const menuItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      path: '/courses',
      label: 'All Courses',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      path: '/my-courses',
      label: 'My Courses',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      path: '/help',
      label: 'Help & Support',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      path: '/faq',
      label: 'FAQ',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      path: '/profile',
      label: 'My Profile',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 z-50 ${isMinimized ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 p-4 flex flex-col h-full transition-all duration-300 ease-in-out`}>
      {/* Sidebar Header: Logo & Toggle */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 flex-shrink-0 min-h-[60px] pointer-events-none">
        <Link
          to="/"
          className={`flex items-center space-x-2 transition-opacity duration-300 pointer-events-auto ${isMinimized ? 'opacity-0 invisible w-0' : 'opacity-100 visible'}`}
        >
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span className="text-xl font-bold text-gray-700 whitespace-nowrap">EduTech</span>
        </Link>

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className={`p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 focus:outline-none pointer-events-auto ${isMinimized ? 'mx-auto' : ''}`}
          aria-label={isMinimized ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMinimized ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      <nav className="space-y-2 flex-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          const iconColors = {
            '/': active ? 'text-primary-700' : 'text-blue-600',
            '/courses': active ? 'text-primary-700' : 'text-green-600',
            '/my-courses': active ? 'text-primary-700' : 'text-teal-600',
            '/help': active ? 'text-primary-700' : 'text-orange-600',
            '/faq': active ? 'text-primary-700' : 'text-purple-600',
            '/profile': active ? 'text-primary-700' : 'text-indigo-600',
          };

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center transition-all duration-300 ${isMinimized ? 'justify-center p-3' : 'px-4 py-3'
                } rounded-lg ${active
                  ? 'bg-primary-100 text-primary-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
              title={isMinimized ? item.label : ''}
            >
              <span className={`flex-shrink-0 ${isMinimized ? '' : 'mr-3'}`}>
                {cloneElement(item.icon, {
                  className: `${isMinimized ? 'w-6 h-6' : 'w-5 h-5'} ${iconColors[item.path] || 'text-gray-600'}`,
                })}
              </span>
              {!isMinimized && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Profile Tile at Bottom */}
      <div className="mt-auto pt-4 border-t border-gray-200 flex-shrink-0">
        <div className={`flex items-center ${isMinimized ? 'flex-col gap-3 p-2' : 'space-x-3 px-3 py-3'} bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300`}>
          {/* Profile Image */}
          <div className="flex-shrink-0">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover shadow-sm border border-white"
              />
            ) : (
              <div title={getFirstName()} className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                {getInitials()}
              </div>
            )}
          </div>

          {/* User Name and Category - Only when expanded */}
          {!isMinimized && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-700 truncate">
                {getFirstName()}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {getCategory()}
              </div>
            </div>
          )}

          {/* Sign Out Icon */}
          <button
            onClick={handleSignOut}
            className={`p-1.5 rounded-md hover:bg-gray-200 transition-colors focus:outline-none ${isMinimized ? 'text-gray-400 hover:text-red-500' : 'text-gray-600'}`}
            title="Sign Out"
            aria-label="Sign Out"
          >
            <svg
              className={`${isMinimized ? 'w-6 h-6' : 'w-5 h-5'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;