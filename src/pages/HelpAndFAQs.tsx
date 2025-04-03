import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Heart, Bell, ChevronDown, ChevronUp } from 'lucide-react';

export default function HelpAndFAQs() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I place an order?",
      answer: "To place an order, simply browse through our products, add items to your cart, and proceed to checkout. You'll need to provide your delivery address and payment information to complete the order."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept various payment methods including credit/debit cards, UPI, net banking, and cash on delivery (COD) for eligible orders."
    },
    {
      question: "How can I track my order?",
      answer: "You can track your order by logging into your account and visiting the 'My Orders' section. You'll receive real-time updates about your order status and delivery tracking information."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 7-day return policy for most products. If you're not satisfied with your purchase, you can initiate a return through your account dashboard. Some items may be non-returnable due to hygiene reasons."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can reach our customer support team through the 'Contact Us' page, where you'll find our phone number, email, and a contact form. Our team is available 24/7 to assist you."
    },
    {
      question: "Do you offer same-day delivery?",
      answer: "Yes, we offer same-day delivery for orders placed before 12 PM in select areas. Delivery times may vary depending on your location and product availability."
    },
    {
      question: "How can I change my delivery address?",
      answer: "You can update your delivery address by going to the 'Delivery Address' section in your profile. You can add, edit, or remove addresses as needed."
    },
    {
      question: "What should I do if I receive a damaged product?",
      answer: "If you receive a damaged product, please contact our customer support immediately with photos of the damaged item. We'll arrange for a replacement or refund as per our policy."
    }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Help & FAQs</h1>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search for help..."
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5733]"
          />
        </div>

        {/* FAQ Categories */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button className="p-4 bg-white rounded-lg shadow-sm text-center">
            <p className="font-medium">Orders & Delivery</p>
          </button>
          <button className="p-4 bg-white rounded-lg shadow-sm text-center">
            <p className="font-medium">Payments & Refunds</p>
          </button>
          <button className="p-4 bg-white rounded-lg shadow-sm text-center">
            <p className="font-medium">Account & Profile</p>
          </button>
          <button className="p-4 bg-white rounded-lg shadow-sm text-center">
            <p className="font-medium">Products & Services</p>
          </button>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                className="w-full p-4 flex justify-between items-center"
                onClick={() => toggleFaq(index)}
              >
                <span className="text-left font-medium">{faq.question}</span>
                {expandedFaq === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="p-4 pt-0 text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Need Help Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Still Need Help?</h2>
          <p className="text-gray-600 mb-4">
            If you couldn't find the answer to your question, our customer support team is here to help you.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="w-full py-2 bg-[#FF5733] text-white rounded-lg hover:bg-[#FF5733]/90"
          >
            Contact Support
          </button>
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