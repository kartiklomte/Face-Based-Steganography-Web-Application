/**
 * Navigation header component
 */
import { useNavigate } from 'react-router-dom';
import { getUser, logout } from '../utils/auth';

export const Header = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          🔐 Secure Steganography
        </h1>
        
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
