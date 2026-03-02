/**
 * Login page
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/api';
import { setAuthToken, setUser, copyToClipboard } from '../utils/auth';
import WebcamCapture from '../components/WebcamCapture';
import Header from '../components/Header';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [faceImage, setFaceImage] = useState(null);
  const [faceImagePreview, setFaceImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaceImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFaceImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWebcamCapture = (file) => {
    setFaceImage(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFaceImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password || !faceImage) {
      setError('Please fill all fields and provide a face image');
      setLoading(false);
      return;
    }

    try {
      const response = await loginUser(email, password, faceImage);
      setAuthToken(response.access_token);
      setUser(response.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Login</h2>

          {error && (
            <div className="bg-red-600 text-white p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Face Image</label>
              {faceImagePreview && (
                <img src={faceImagePreview} alt="Face preview" className="w-full rounded-lg mb-2 max-h-48" />
              )}
              
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full bg-gray-700 text-white p-2 rounded-lg"
                />
                <WebcamCapture onCapture={handleWebcamCapture} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-2 rounded-lg font-bold"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-gray-400 mt-4 text-center">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-400 hover:text-blue-300"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
