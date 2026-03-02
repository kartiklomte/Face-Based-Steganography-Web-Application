/**
 * Receive/Extract secure message page
 */
import { useState } from 'react';
import { extractMessage } from '../utils/api';
import Header from '../components/Header';

export const ReceiveMessage = () => {
  const [stegoImage, setStegoImage] = useState(null);
  const [stegoImagePreview, setStegoImagePreview] = useState(null);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [decryptedMessage, setDecryptedMessage] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStegoImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setStegoImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtract = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!stegoImage || !encryptionKey) {
      setError('Please provide both stego image and encryption key');
      setLoading(false);
      return;
    }

    try {
      const response = await extractMessage(stegoImage, encryptionKey);
      setDecryptedMessage(response.message);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to extract message');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setStegoImage(null);
    setStegoImagePreview(null);
    setEncryptionKey('');
    setDecryptedMessage('');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Extract Secure Message</h1>

          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success ? (
            <div className="bg-gray-800 p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-green-400 mb-6">✓ Message Extracted Successfully!</h2>

              <div className="space-y-6">
                <div className="bg-gray-700 p-6 rounded-lg border-2 border-green-500">
                  <p className="text-gray-300 mb-2 font-bold">Decrypted Message:</p>
                  <p className="text-white text-lg whitespace-pre-wrap break-words">
                    {decryptedMessage}
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(decryptedMessage);
                    alert('Message copied to clipboard!');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
                >
                  📋 Copy Message
                </button>

                <button
                  onClick={handleReset}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold"
                >
                  Extract Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleExtract} className="bg-gray-800 p-8 rounded-lg">
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2">Stego Image</label>
                  {stegoImagePreview && (
                    <img src={stegoImagePreview} alt="Preview" className="w-full rounded-lg mb-4 max-h-64" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full bg-gray-700 text-white p-2 rounded-lg"
                  />
                  <p className="text-gray-400 text-xs mt-1">Upload the stego image containing the hidden message</p>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Encryption Key</label>
                  <textarea
                    value={encryptionKey}
                    onChange={(e) => setEncryptionKey(e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-20"
                    placeholder="Paste the encryption key provided by the sender..."
                  />
                  <p className="text-gray-400 text-xs mt-1">This key was provided in the email or by the sender</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white p-3 rounded-lg font-bold text-lg"
                >
                  {loading ? 'Extracting Message...' : '🔓 Extract Message'}
                </button>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong>Note:</strong> Make sure you have the correct encryption key. The message cannot be decrypted without it.
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ReceiveMessage;
