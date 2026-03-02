/**
 * Dashboard page
 */
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

export const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-white mb-12 text-center">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Send Message Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => navigate('/send')}>
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-4">📤 Send Secure Message</h2>
                <p className="mb-6">
                  Encrypt a message, hide it in an image using steganography, and send it securely to a recipient.
                </p>
                <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100">
                  Send Message
                </button>
              </div>
            </div>

            {/* Receive Message Card */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => navigate('/receive')}>
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-4">📥 Extract Secure Message</h2>
                <p className="mb-6">
                  Upload a stego image and encryption key to extract and decrypt the hidden message.
                </p>
                <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100">
                  Extract Message
                </button>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-12 bg-gray-800 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
              <div>
                <h3 className="text-xl font-bold text-blue-400 mb-2">🔐 Encryption</h3>
                <p>Messages are encrypted using AES encryption for maximum security.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-400 mb-2">🖼️ Steganography</h3>
                <p>Encrypted messages are hidden inside images using LSB steganography.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-400 mb-2">👤 Face Auth</h3>
                <p>Face recognition technology ensures secure authentication at login.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
