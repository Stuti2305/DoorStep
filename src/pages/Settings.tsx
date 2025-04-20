import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home as HomeIcon, Heart, Bell, Moon, Sun, Bell as BellIcon, Lock, Shield, Globe, HelpCircle, ChevronRight } from 'lucide-react';

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
      icon: darkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />,
      title: 'Theme',
      description: 'Switch between light and dark theme',
      action: () => setDarkMode(!darkMode),
      value: darkMode ? 'Dark' : 'Light'
    },
    {
      icon: <BellIcon className="w-6 h-6" />,
      title: 'Notifications',
      description: 'Manage your notification preferences',
      action: () => setNotifications(!notifications),
      value: notifications ? 'Enabled' : 'Disabled'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Language',
      description: 'Change app language',
      action: () => setLanguage(language === 'English' ? 'Hindi' : 'English'),
      value: language
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Privacy & Security',
      description: 'Manage your privacy settings',
      action: () => navigate('/privacy')
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Account Security',
      description: 'Change password and security settings',
      action: () => navigate('/security')
    },
    {
      icon: <HelpCircle className="w-6 h-6" />,
      title: 'Help & Support',
      description: 'Get help with your account',
      action: () => navigate('/help')
    }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="max-w-xl mx-auto p-6 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Manage your account preferences</p>
        </div>

        {/* Settings Options */}
        <div className="space-y-5">
          {settingsOptions.map((option, index) => (
            <div
              key={index}
              className={`p-5 rounded-xl shadow-sm flex items-center justify-between transition-all 
                ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'}`}
              onClick={option.action}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-orange-100'}`}>
                  {option.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{option.title}</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{option.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {option.value && (
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {option.value}
                  </span>
                )}
                <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`w-full mt-8 py-4 rounded-xl font-semibold text-lg
            ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
        >
          Log Out
        </button>

        {/* App Version */}
        <div className={`mt-10 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>App Version 1.0.0</p>
        </div>
      </div>

      
    </div>
  );
}