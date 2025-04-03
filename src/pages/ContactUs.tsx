import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Heart, Bell, Mail, Phone, MapPin } from 'lucide-react';

export default function ContactUs() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Contact Us</h1>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#FF5733]" />
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="font-medium">+91 9876543210</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#FF5733]" />
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">support@doorstep.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#FF5733]" />
              <div>
                <p className="text-gray-600">Address</p>
                <p className="font-medium">Automation Building, Banasthali Vidyapith, Rajasthan, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-600 mb-1">Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded-lg"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Subject</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Message</label>
              <textarea
                className="w-full p-2 border rounded-lg"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#FF5733] text-white rounded-lg hover:bg-[#FF5733]/90"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Business Hours */}
        <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
          <h2 className="text-lg font-semibold mb-4">Business Hours</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Sunday - Monday</span>
              <span className="font-medium">9:00 AM - 8:00 PM</span>
            </div>
            {/* <div className="flex justify-between">
              <span className="text-gray-600">Saturday</span>
              <span className="font-medium">10:00 AM - 6:00 PM</span>
            </div> */}
            <div className="flex justify-between">
              <span className="text-gray-600">Tuesday</span>
              <span className="font-medium">Closed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FF5733] border-t border-[#FFD66B] flex justify-around py-4">
        <button onClick={() => navigate('/home')} className="text-white">
          <HomeIcon className="w-6 h-6" />
        </button>
        <button onClick={() => navigate('/favorites')} className="text-white">
          <Heart className="w-6 h-6" />
        </button>
        <button onClick={() => navigate('/profile')} className="text-white">
          <Bell className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
} 