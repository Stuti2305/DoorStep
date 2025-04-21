import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  Heart, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  ShoppingBag, 
  CreditCard, 
  UserCircle, 
  Package, 
  MessageCircle 
} from 'lucide-react';

export default function HelpAndFAQs() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const categories = [
    { name: "Orders & Delivery", icon: <ShoppingBag className="w-5 h-5" /> },
    { name: "Payments & Refunds", icon: <CreditCard className="w-5 h-5" /> },
    { name: "Account & Profile", icon: <UserCircle className="w-5 h-5" /> },
    { name: "Products & Services", icon: <Package className="w-5 h-5" /> }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-b-3xl shadow-lg mb-6">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-2">Help Center</h1>
          <p className="text-orange-100 text-sm">Find answers to your questions</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Search and Categories */}
          <div className="lg:w-1/2">
            {/* Search Bar */}
            {/* <div className="mb-6 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
              />
            </div> */}

            {/* FAQ Categories */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {categories.map((category, index) => (
                <button key={index} className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-orange-50 transition-colors">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-2">
                    {category.icon}
                  </div>
                  <p className="font-medium text-sm text-gray-700">{category.name}</p>
                </button>
              ))}
            </div>

            {/* Still Need Help Section */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl shadow-md text-white">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500 mr-3">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold">Still Need Help?</h2>
              </div>
              <p className="text-orange-50 mb-4">
                If you couldn't find the answer to your question, our customer support team is here to help you.
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="w-full py-3 bg-white text-orange-500 font-medium rounded-lg hover:bg-orange-50 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>

          {/* Right Column - Most Common Questions */}
          <div className="lg:w-1/2">
            <div className="sticky top-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Most Common Questions</h2>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div 
                    key={index} 
                    className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all ${
                      expandedFaq === index ? 'ring-2 ring-orange-300' : ''
                    }`}
                  >
                    <button
                      className="w-full p-4 flex justify-between items-center text-left"
                      onClick={() => toggleFaq(index)}
                    >
                      <span className="font-medium text-gray-800">{faq.question}</span>
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full ${
                        expandedFaq === index ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
                      } flex items-center justify-center transition-colors`}>
                        {expandedFaq === index ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                    {expandedFaq === index && (
                      <div className="p-4 pt-0 text-gray-600 border-t border-gray-100 bg-orange-50/50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    
    </div>
  );
}