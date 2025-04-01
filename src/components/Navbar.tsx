import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, LogIn, LogOut, UserPlus, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Adjust path as needed

const Navbar: React.FC = () => {
  const { user, logout } = useAuth(); // Assuming useAuth provides user and logout function
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call the logout function from context
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo/Brand */}
        <Link to={user ? "/dashboard" : "/login"} className="flex items-center space-x-2 text-xl font-bold hover:text-blue-200 transition duration-200">
          <KeyRound size={28} />
          <span>LicenseManager</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* Links for logged-in users */}
              <NavLink to="/dashboard">
                <LayoutDashboard size={20} className="mr-1" /> Dashboard
              </NavLink>

              {/* Admin-specific link */}
              {user.role === 'admin' && (
                <NavLink to="/admin">
                  <ShieldCheck size={20} className="mr-1" /> Admin Panel
                </NavLink>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded hover:bg-red-600 transition duration-200"
              >
                <LogOut size={20} className="mr-1" /> Logout ({user.username})
              </button>
            </>
          ) : (
            <>
              {/* Links for guests */}
              <NavLink to="/login">
                <LogIn size={20} className="mr-1" /> Login
              </NavLink>
              <NavLink to="/register">
                <UserPlus size={20} className="mr-1" /> Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// Helper component for NavLink styling
const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link
    to={to}
    className="flex items-center px-3 py-2 rounded hover:bg-blue-700 transition duration-200"
    // Add activeClassName logic if needed using useLocation hook from react-router-dom
  >
    {children}
  </Link>
);


export default Navbar;
