/**
 * Home/Landing page
 */
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import Header from '../components/Header';

export const Home = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            🔐 Secure Steganography
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            Send encrypted messages hidden inside images using advanced face recognition, AES encryption, and LSB steganography.
          </p>

          <div className="space-y-4 mb-12">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-blue-400 mb-2">🎯 Key Features</h3>
              <ul className="text-gray-300 space-y-2">
                <li>✅ Face Recognition Authentication</li>
                <li>✅ AES-256 Message Encryption</li>
                <li>✅ LSB Image Steganography</li>
                <li>✅ Secure Email Sharing</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            {authenticated ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
                >
                  Go to Dashboard
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
                >
                  Register Now
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg"
                >
                  Login
                </button>
              </>
            )}
          </div>

          <p className="text-gray-400 mt-8 text-sm">
            Your messages are encrypted, hidden, and secure. Only the intended recipient can extract them.
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
