import { useState, useEffect } from 'react';
import { collection, getDocs, query, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Edit2, X, Check, Truck, User, Phone, Mail, FileText, AlertCircle, Clock } from 'lucide-react';

interface DeliveryMan {
  id: string;
  name: string;
  phone: string;
  email: string;
  current_duty: string;
  driving_license_no: string;
  admin_control: string;
}

export default function DeliveryMen() {
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDeliveryMan, setEditingDeliveryMan] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<DeliveryMan>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchDeliveryMen = async () => {
      try {
        const deliveryMenQuery = query(collection(db, 'delivery_man'));
        const deliveryMenSnapshot = await getDocs(deliveryMenQuery);
        const deliveryMenData = deliveryMenSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as DeliveryMan[];
        setDeliveryMen(deliveryMenData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching delivery men:', error);
        setLoading(false);
      }
    };

    fetchDeliveryMen();
  }, []);

  const handleEdit = (deliveryMan: DeliveryMan) => {
    setEditingDeliveryMan(deliveryMan.id);
    setEditValues({
      name: deliveryMan.name,
      phone: deliveryMan.phone,
      email: deliveryMan.email,
      current_duty: deliveryMan.current_duty,
      driving_license_no: deliveryMan.driving_license_no,
      admin_control: deliveryMan.admin_control
    });
  };

  const handleCancel = () => {
    setEditingDeliveryMan(null);
    setEditValues({});
  };

  const handleSave = async (deliveryManId: string) => {
    try {
      const deliveryManRef = doc(db, 'delivery_man', deliveryManId);
      await updateDoc(deliveryManRef, editValues);
      
      // Update local state
      setDeliveryMen(deliveryMen.map(man => 
        man.id === deliveryManId 
          ? { ...man, ...editValues }
          : man
      ));
      
      setEditingDeliveryMan(null);
      setEditValues({});
    } catch (error) {
      console.error('Error updating delivery man:', error);
    }
  };

  const filteredDeliveryMen = deliveryMen.filter(man => {
    const matchesSearch = 
      man.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      man.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      man.phone.includes(searchTerm);
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'available') return matchesSearch && man.current_duty === 'Available';
    if (activeFilter === 'busy') return matchesSearch && man.current_duty === 'Busy';
    if (activeFilter === 'not-available') return matchesSearch && man.current_duty === 'Not Available';
    if (activeFilter === 'active') return matchesSearch && man.admin_control === 'active';
    if (activeFilter === 'inactive') return matchesSearch && man.admin_control === 'inactive';
    
    return matchesSearch;
  });

  const getDutyStatusClass = (status: string) => {
    switch(status) {
      case 'Available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Busy':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Not Available':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAdminControlClass = (status: string) => {
    return status === 'active' 
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
      : 'bg-gray-100 text-gray-500 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-lg font-medium text-gray-700">Loading delivery personnel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <Truck className="mr-3 h-7 w-7" />
                  Delivery Personnel Management
                </h1>
                <p className="text-blue-100 mt-1">Manage and track all delivery staff from one dashboard</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1 text-white text-sm font-medium">
                  {deliveryMen.length} Total Staff
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1 text-white text-sm font-medium">
                  {deliveryMen.filter(man => man.current_duty === 'Available').length} Available
                </div>
              </div>
            </div>
          </div>
          
          {/* Search and filters */}
          <div className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex flex-wrap items-center justify-between">
              <div className="relative mt-2 md:mt-0 w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search by name, email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2 mt-3 md:mt-0 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <button 
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    activeFilter === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setActiveFilter('available')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors duration-150 ${
                    activeFilter === 'available' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Available
                </button>
                <button 
                  onClick={() => setActiveFilter('busy')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors duration-150 ${
                    activeFilter === 'busy' 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Busy
                </button>
                <button 
                  onClick={() => setActiveFilter('not-available')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors duration-150 ${
                    activeFilter === 'not-available' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Not Available
                </button>
                <button 
                  onClick={() => setActiveFilter('active')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors duration-150 ${
                    activeFilter === 'active' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Active
                </button>
                <button 
                  onClick={() => setActiveFilter('inactive')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors duration-150 ${
                    activeFilter === 'inactive' 
                      ? 'bg-gray-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="overflow-x-auto">
            {filteredDeliveryMen.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Duty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDeliveryMen.map((man) => (
                    <tr key={man.id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingDeliveryMan === man.id ? (
                          <input
                            type="text"
                            value={editValues.name || ''}
                            onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                              <User className="h-5 w-5" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{man.name}</div>
                              <div className="text-xs text-gray-500">ID: {man.id.slice(0, 8)}</div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingDeliveryMan === man.id ? (
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              <input
                                type="tel"
                                value={editValues.phone || ''}
                                onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })}
                                className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-gray-400 mr-2" />
                              <input
                                type="email"
                                value={editValues.email || ''}
                                onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                                className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center text-sm text-gray-700 mb-1">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              {man.phone}
                            </div>
                            <div className="flex items-center text-sm text-gray-700">
                              <Mail className="h-4 w-4 text-gray-400 mr-2" />
                              {man.email}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingDeliveryMan === man.id ? (
                          <select
                            value={editValues.current_duty || ''}
                            onChange={(e) => setEditValues({ ...editValues, current_duty: e.target.value })}
                            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Available">Available</option>
                            <option value="Busy">Busy</option>
                            <option value="Not Available">Not Available</option>
                          </select>
                        ) : (
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getDutyStatusClass(man.current_duty)}`}>
                              <Clock className="h-3 w-3 mr-1" />
                              {man.current_duty}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingDeliveryMan === man.id ? (
                          <input
                            type="text"
                            value={editValues.driving_license_no || ''}
                            onChange={(e) => setEditValues({ ...editValues, driving_license_no: e.target.value })}
                            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <div className="flex items-center text-sm text-gray-700">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            {man.driving_license_no}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingDeliveryMan === man.id ? (
                          <select
                            value={editValues.admin_control || ''}
                            onChange={(e) => setEditValues({ ...editValues, admin_control: e.target.value })}
                            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getAdminControlClass(man.admin_control)}`}>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {man.admin_control.charAt(0).toUpperCase() + man.admin_control.slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingDeliveryMan === man.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSave(man.id)}
                              className="flex items-center justify-center bg-green-100 rounded-full p-2 text-green-600 hover:bg-green-200 transition duration-150"
                              title="Save changes"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="flex items-center justify-center bg-red-100 rounded-full p-2 text-red-600 hover:bg-red-200 transition duration-150"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(man)}
                            className="flex items-center justify-center bg-blue-100 rounded-full p-2 text-blue-600 hover:bg-blue-200 transition duration-150"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16 px-4">
                <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No delivery personnel found</h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm ? 'Try adjusting your search terms' : 'No delivery personnel match the current filters'}
                </p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {filteredDeliveryMen.length} of {deliveryMen.length} delivery personnel
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}