import React from 'react';

export default function PendingApproval() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Created Successfully!</h1>
        <p className="text-gray-700 mb-6">Your account has been created successfully, but it is pending approval from the admin. You will be notified once your account is approved.</p>
        <p className="text-gray-500">Thank you for your patience.</p>
      </div>
    </div>
  );
} 