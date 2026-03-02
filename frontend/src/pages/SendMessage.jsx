/**
 * Send secure message page
 */
import { useState } from 'react';
import { embedMessage, shareViaEmail } from '../utils/api';
import { downloadFile, hexToBlob, copyToClipboard } from '../utils/auth';
import Header from '../components/Header';

export const SendMessage = () => {
  const [receiverEmail, setReceiverEmail] = useState('');
  const [secretMessage, setSecretMessage] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [embeddedData, setEmbeddedData] = useState(null);
  const [sharing, setSharing] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmbed = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!receiverEmail || !secretMessage || !image) {
      setError('Please fill all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await embedMessage(receiverEmail, secretMessage, image);
      setEmbeddedData(response);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to embed message');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (embeddedData) {
      const blob = hexToBlob(embeddedData.stego_image);
      downloadFile(blob, 'stego_image.png');
    }
  };

  const handleShareEmail = async () => {
    if (!embeddedData) return;

    setSharing(true);
    try {
      const blob = hexToBlob(embeddedData.stego_image);
      const file = new File([blob], 'stego_image.png', { type: 'image/png' });
      
      await shareViaEmail(receiverEmail, embeddedData.encryption_key, file);
      alert('Email sent successfully!');
    } catch (err) {
      alert('Failed to send email: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSharing(false);
    }
  };

  const handleCopyKey = () => {
    copyToClipboard(embeddedData.encryption_key);
    alert('Encryption key copied to clipboard!');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Send Secure Message</h1>

          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && embeddedData ? (
            <div className="bg-gray-800 p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-green-400 mb-6">✓ Message Embedded Successfully!</h2>

              <div className="space-y-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-300 mb-2">Encryption Key:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={embeddedData.encryption_key}
                      readOnly
                      className="flex-1 bg-gray-600 text-white p-2 rounded-lg"
                    />
                    <button
                      onClick={handleCopyKey}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-gray-400 text-xs mt-2">⚠️ Keep this key safe! The receiver will need it to decrypt the message.</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleDownloadImage}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
                  >
                    📥 Download Stego Image
                  </button>

                  <button
                    onClick={handleShareEmail}
                    disabled={sharing}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold"
                  >
                    {sharing ? 'Sending...' : '📧 Share Via Email'}
                  </button>

                  <button
                    onClick={() => {
                      setSuccess(false);
                      setEmbeddedData(null);
                      setReceiverEmail('');
                      setSecretMessage('');
                      setImage(null);
                      setImagePreview(null);
                    }}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEmbed} className="bg-gray-800 p-8 rounded-lg">
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2">Receiver Email</label>
                  <input
                    type="email"
                    value={receiverEmail}
                    onChange={(e) => setReceiverEmail(e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="receiver@example.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Secret Message</label>
                  <textarea
                    value={secretMessage}
                    onChange={(e) => setSecretMessage(e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    placeholder="Enter your secret message here..."
                  />
                  <p className="text-gray-400 text-xs mt-1">Max length depends on image size</p>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Select Image</label>
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="w-full rounded-lg mb-4 max-h-64" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full bg-gray-700 text-white p-2 rounded-lg"
                  />
                  <p className="text-gray-400 text-xs mt-1">Supported formats: PNG, JPG, BMP, etc.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-3 rounded-lg font-bold text-lg"
                >
                  {loading ? 'Embedding Message...' : '🔒 Embed Message in Image'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default SendMessage;
