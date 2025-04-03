import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home as HomeIcon, Heart, Bell, Moon, Sun, Bell as BellIcon, Lock, Shield, Globe, HelpCircle } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const settingsOptions = [
    {
      icon: <Moon className="w-5 h-5" />,
      title: 'Dark Mode',
      description: 'Switch between light and dark theme',
      action: () => setDarkMode(!darkMode),
      value: darkMode ? 'On' : 'Off'
    },
    {
      icon: <BellIcon className="w-5 h-5" />,
      title: 'Notifications',
      description: 'Manage your notification preferences',
      action: () => setNotifications(!notifications),
      value: notifications ? 'On' : 'Off'
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: 'Language',
      description: 'Change app language',
      action: () => setLanguage(language === 'English' ? 'Hindi' : 'English'),
      value: language
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: 'Privacy & Security',
      description: 'Manage your privacy settings',
      action: () => navigate('/privacy')
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Account Security',
      description: 'Change password and security settings',
      action: () => navigate('/security')
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      title: 'Help & Support',
      description: 'Get help with your account',
      action: () => navigate('/help')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {/* Settings Options */}
        <div className="space-y-4">
          {settingsOptions.map((option, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-sm"
              onClick={option.action}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-[#FF5733]">
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{option.title}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
                {option.value && (
                  <span className="text-gray-600">{option.value}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Log Out
        </button>

        {/* App Version */}
        <div className="mt-8 text-center text-gray-500">
          <p>App Version 1.0.0</p>
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