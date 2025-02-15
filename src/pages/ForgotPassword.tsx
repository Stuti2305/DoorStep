import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/auth?mode=signin'
      });
      setMessage('An OTP has been sent to your email. Please check your inbox.');
    } catch (error) {
      console.error('Error sending password reset email', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to send reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Forgot Password</h1>
        {message ? (
          <p className="mb-4 text-green-600 text-center">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pink-600">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 bg-white p-3 focus:border-pink-500 focus:ring-pink-500"
                placeholder="example@example.com"
                required
              />
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full py-3 font-semibold shadow-lg hover:opacity-90 transition-opacity"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}
        <button
          onClick={() => navigate('/auth?mode=signin', { replace: true })}
          className="mt-4 w-full text-center text-pink-600 font-semibold"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
} 