

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Store, Plus, Trash2, Save, X, Search, Eye, Edit, Filter, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Vendor {
  id: string;
  name: string;
  image: string;
  ownerId?: string;
  cuisine?: string;
  description?: string;
  address?: string;
  email?: string;
  deliveryTime?: string;
  phone?: string;
  priceForTwo?: number;
  rating?: number;
  promoted?: boolean;
  isactive?: boolean;
}

interface NewShop {
  name: string;
  cuisine: string;
  description: string;
  address: string;
  email: string;
  deliveryTime: string;
  image: string;
  phone: string;
  priceForTwo: number;
  rating: number;
  promoted: boolean;
  isactive: boolean;
}

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVendor, setEditingVendor] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<Vendor>>({});
  const [showAddShop, setShowAddShop] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Vendor | '';
    direction: 'ascending' | 'descending';
  }>({ key: '', direction: 'ascending' });
  const [filterOptions, setFilterOptions] = useState({
    showPromoted: false,
    showActive: false,
    minRating: 0,
  });
  const [showFilters, setShowFilters] = useState(false);

  const [newShop, setNewShop] = useState<NewShop>({
    name: '',
    cuisine: '',
    description: '',
    address: '',
    email: '',
    deliveryTime: '',
    image: '/images/shops/default.jpg',
    phone: '',
    priceForTwo: 0,
    rating: 0,
    promoted: false,
    isactive: true
  });

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const shopsQuery = collection(db, 'shops');
        const shopsSnapshot = await getDocs(shopsQuery);
        const vendorsList = shopsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          image: doc.data().image || '/images/shops/default.jpg',
          ownerId: doc.data().ownerId,
          cuisine: doc.data().cuisine,
          description: doc.data().description,
          address: doc.data().address,
          email: doc.data().email,
          deliveryTime: doc.data().deliveryTime,
          phone: doc.data().phone,
          priceForTwo: doc.data().priceForTwo,
          rating: doc.data().rating,
          promoted: doc.data().promoted,
          isactive: doc.data().isactive
        }));
        setVendors(vendorsList);
        setFilteredVendors(vendorsList);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  useEffect(() => {
    let result = [...vendors];
    
    if (searchTerm) {
      result = result.filter(
        vendor => 
          vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterOptions.showPromoted) {
      result = result.filter(vendor => vendor.promoted);
    }
    
    if (filterOptions.showActive) {
      result = result.filter(vendor => vendor.isactive);
    }
    
    if (filterOptions.minRating > 0) {
      result = result.filter(vendor => (vendor.rating || 0) >= filterOptions.minRating);
    }
    
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Vendor];
        const bValue = b[sortConfig.key as keyof Vendor];
        
        if (aValue === undefined || bValue === undefined) return 0;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (sortConfig.direction === 'ascending') {
          return aValue < bValue ? -1 : 1;
        } else {
          return aValue > bValue ? -1 : 1;
        }
      });
    }
    
    setFilteredVendors(result);
  }, [vendors, searchTerm, filterOptions, sortConfig]);

  const handleEdit = (vendorId: string) => {
    setEditingVendor(vendorId);
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      setEditedValues({
        name: vendor.name || '',
        cuisine: vendor.cuisine || '',
        description: vendor.description || '',
        address: vendor.address || '',
        email: vendor.email || '',
        deliveryTime: vendor.deliveryTime || '',
        phone: vendor.phone || '',
        priceForTwo: vendor.priceForTwo || 0,
        rating: vendor.rating || 0,
        promoted: vendor.promoted || false,
        isactive: vendor.isactive !== undefined ? vendor.isactive : true,
        image: vendor.image || '/images/shops/default.jpg'
      });
    }
  };

  const handleSave = async (vendorId: string) => {
    try {
      const vendorRef = doc(db, 'shops', vendorId);
      await updateDoc(vendorRef, editedValues);
      setVendors(vendors.map(v => 
        v.id === vendorId ? { ...v, ...editedValues } : v
      ));
      setEditingVendor(null);
      setEditedValues({});
    } catch (error) {
      console.error('Error updating vendor:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingVendor(null);
    setEditedValues({});
  };

  const handleAddShop = async () => {
    try {
      const docRef = await addDoc(collection(db, 'shops'), newShop);
      setVendors([...vendors, { id: docRef.id, ...newShop }]);
      setShowAddShop(false);
      setNewShop({
        name: '',
        cuisine: '',
        description: '',
        address: '',
        email: '',
        deliveryTime: '',
        image: '/images/shops/default.jpg',
        phone: '',
        priceForTwo: 0,
        rating: 0,
        promoted: false,
        isactive: true
      });
    } catch (error) {
      console.error('Error adding shop:', error);
    }
  };

  const handleDeleteShop = async (vendorId: string) => {
    try {
      await deleteDoc(doc(db, 'shops', vendorId));
      setVendors(vendors.filter(v => v.id !== vendorId));
      if (selectedVendor?.id === vendorId) {
        setSelectedVendor(null);
        setShowVendorDetails(false);
      }
    } catch (error) {
      console.error('Error deleting shop:', error);
    }
  };

  const handleViewVendorDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowVendorDetails(true);
  };

  const handleSort = (key: keyof Vendor) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Vendor) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? 
      <ChevronUp size={16} className="inline" /> : 
      <ChevronDown size={16} className="inline" />;
  };

  const renderSortableHeader = (key: keyof Vendor, label: string) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => handleSort(key)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {getSortIcon(key)}
      </div>
    </th>
  );

  const renderRatingStars = (rating: number = 0) => {
    const fullStars = Math.floor(Math.min(Math.max(rating, 0), 5));
    const hasHalfStar = rating % 1 >= 0.5 && fullStars < 5;
    const emptyStars = Math.max(5 - fullStars - (hasHalfStar ? 1 : 0), 0);
    
    return (
      <div className="flex">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} size={16} className="text-yellow-500 fill-yellow-500" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star size={16} className="text-gray-300 fill-gray-300" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} size={16} className="text-gray-300 fill-gray-300" />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-100 border border-gray-200"
              >
                <span>View as {viewMode === 'grid' ? 'Table' : 'Grid'}</span>
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-100 border border-gray-200"
              >
                <Filter size={20} />
                <span>Filters</span>
              </button>
              <button
                onClick={() => setShowAddShop(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
              >
                <Plus size={20} />
                <span>Add Shop</span>
              </button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search vendors by name, cuisine, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {showFilters && (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-full md:w-auto">
                <h3 className="font-medium mb-3">Filter Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filterOptions.showPromoted}
                      onChange={(e) => setFilterOptions({...filterOptions, showPromoted: e.target.checked})}
                      className="mr-2"
                    />
                    <span>Promoted Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filterOptions.showActive}
                      onChange={(e) => setFilterOptions({...filterOptions, showActive: e.target.checked})}
                      className="mr-2"
                    />
                    <span>Active Only</span>
                  </label>
                  <div>
                    <label className="block mb-1">Min Rating</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={filterOptions.minRating}
                        onChange={(e) => setFilterOptions({...filterOptions, minRating: parseFloat(e.target.value)})}
                        className="w-24"
                      />
                      <span>{filterOptions.minRating}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredVendors.length} of {vendors.length} vendors
          </div>
        </div>

        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredVendors.length > 0 ? (
              filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 border border-gray-100"
                >
                  <div className="relative">
                    <div className="h-40 bg-gray-100">
                      <img
                        src={vendor.image}
                        alt={vendor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {vendor.promoted && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-semibold px-2 py-1 rounded-full">
                        Promoted
                      </div>
                    )}
                    {vendor.isactive === false && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Inactive
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                      {vendor.rating !== undefined && (
                        <div className="flex items-center">
                          {renderRatingStars(vendor.rating)}
                          <span className="ml-1 text-sm font-medium">{vendor.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-2">{vendor.cuisine}</p>
                    
                    {vendor.deliveryTime && (
                      <p className="text-sm text-gray-500 mb-2">
                        <span className="font-medium">Delivery:</span> {vendor.deliveryTime}
                      </p>
                    )}
                    
                    {vendor.priceForTwo && (
                      <p className="text-sm text-gray-500 mb-4">
                        <span className="font-medium">Price for two:</span> ${vendor.priceForTwo}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-4">
                      <Link 
                        to={`/admin/vendor-products/${vendor.ownerId}`}
                        className="text-blue-600 hover:underline text-sm font-medium flex items-center"
                      >
                        <Store size={16} className="mr-1" />
                        View Products
                      </Link>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewVendorDetails(vendor)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(vendor.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteShop(vendor.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">No vendors found matching your criteria.</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'table' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {renderSortableHeader('name', 'Name')}
                    {renderSortableHeader('cuisine', 'Cuisine')}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    {renderSortableHeader('priceForTwo', 'Price for Two')}
                    {renderSortableHeader('rating', 'Rating')}
                    {renderSortableHeader('isactive', 'Status')}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVendors.length > 0 ? (
                    filteredVendors.map((vendor) => (
                      <tr key={vendor.id} className={`${editingVendor === vendor.id ? 'bg-blue-50' : ''} hover:bg-gray-50`}>
                        <td className="px-6 py-4">
                          {editingVendor === vendor.id ? (
                            <input
                              type="text"
                              value={editedValues.name || ''}
                              onChange={(e) => setEditedValues({...editedValues, name: e.target.value})}
                              className="border rounded px-2 py-1 w-full"
                            />
                          ) : (
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                                <img src={vendor.image} alt={vendor.name} className="h-full w-full object-cover" />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">{vendor.name}</div>
                                {vendor.promoted && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Promoted
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingVendor === vendor.id ? (
                            <input
                              type="text"
                              value={editedValues.cuisine || ''}
                              onChange={(e) => setEditedValues({...editedValues, cuisine: e.target.value})}
                              className="border rounded px-2 py-1 w-full"
                            />
                          ) : (
                            <span className="text-gray-900">{vendor.cuisine}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingVendor === vendor.id ? (
                            <textarea
                              value={editedValues.description || ''}
                              onChange={(e) => setEditedValues({...editedValues, description: e.target.value})}
                              className="border rounded px-2 py-1 w-full"
                              rows={2}
                            />
                          ) : (
                            <p className="text-gray-500 truncate max-w-xs">{vendor.description}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingVendor === vendor.id ? (
                            <div className="space-y-2">
                              <input
                                type="email"
                                placeholder="Email"
                                value={editedValues.email || ''}
                                onChange={(e) => setEditedValues({...editedValues, email: e.target.value})}
                                className="border rounded px-2 py-1 w-full"
                              />
                              <input
                                type="tel"
                                placeholder="Phone"
                                value={editedValues.phone || ''}
                                onChange={(e) => setEditedValues({...editedValues, phone: e.target.value})}
                                className="border rounded px-2 py-1 w-full"
                              />
                            </div>
                          ) : (
                            <div>
                              <div className="text-sm text-gray-900">{vendor.email}</div>
                              <div className="text-sm text-gray-500">{vendor.phone}</div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingVendor === vendor.id ? (
                            <input
                              type="number"
                              value={editedValues.priceForTwo || 0}
                              onChange={(e) => setEditedValues({...editedValues, priceForTwo: Number(e.target.value)})}
                              className="border rounded px-2 py-1 w-full"
                            />
                          ) : (
                            <span className="text-gray-900">${vendor.priceForTwo}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingVendor === vendor.id ? (
                            <input
                              type="number"
                              value={editedValues.rating || 0}
                              onChange={(e) => setEditedValues({...editedValues, rating: Number(e.target.value)})}
                              className="border rounded px-2 py-1 w-full"
                              min="0"
                              max="5"
                              step="0.1"
                            />
                          ) : (
                            renderRatingStars(vendor.rating || 0)
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingVendor === vendor.id ? (
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={editedValues.isactive || false}
                                onChange={(e) => setEditedValues({...editedValues, isactive: e.target.checked})}
                                className="mr-2"
                              />
                              <span>Active</span>
                            </label>
                          ) : (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              vendor.isactive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {vendor.isactive ? 'Active' : 'Inactive'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingVendor === vendor.id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSave(vendor.id)}
                                className="bg-green-600 text-white p-1 rounded hover:bg-green-700"
                                title="Save"
                              >
                                <Save size={18} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="bg-gray-600 text-white p-1 rounded hover:bg-gray-700"
                                title="Cancel"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewVendorDetails(vendor)}
                                className="text-gray-600 hover:text-gray-900 p-1"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleEdit(vendor.id)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteShop(vendor.id)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        No vendors found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showVendorDetails && selectedVendor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">{selectedVendor.name}</h2>
                <button
                  onClick={() => setShowVendorDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="rounded-lg overflow-hidden bg-gray-100 h-48">
                    <img 
                      src={selectedVendor.image} 
                      alt={selectedVendor.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {selectedVendor.rating !== undefined && (
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Rating:</span>
                        {renderRatingStars(selectedVendor.rating)}
                        <span className="ml-1">{selectedVendor.rating}</span>
                      </div>
                    )}
                    
                    {selectedVendor.deliveryTime && (
                      <p><span className="font-medium">Delivery Time:</span> {selectedVendor.deliveryTime}</p>
                    )}
                    
                    {selectedVendor.priceForTwo && (
                      <p><span className="font-medium">Price for Two:</span> ${selectedVendor.priceForTwo}</p>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Status:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedVendor.isactive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedVendor.isactive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    {selectedVendor.promoted && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Promoted
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Details</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {selectedVendor.cuisine && (
                          <p className="mb-2"><span className="font-medium">Cuisine:</span> {selectedVendor.cuisine}</p>
                        )}
                        {selectedVendor.description && (
                          <div className="mb-2">
                            <span className="font-medium">Description:</span>
                            <p className="text-gray-700 mt-1">{selectedVendor.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {selectedVendor.email && (
                          <p className="mb-2"><span className="font-medium">Email:</span> {selectedVendor.email}</p>
                        )}
                        {selectedVendor.phone && (
                          <p className="mb-2"><span className="font-medium">Phone:</span> {selectedVendor.phone}</p>
                        )}
                        {selectedVendor.address && (
                          <div className="mb-2">
                            <span className="font-medium">Address:</span>
                            <p className="text-gray-700 mt-1">{selectedVendor.address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex space-x-3">
                    <Link 
                      to={`/admin/vendor-products/${selectedVendor.ownerId}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <Store size={18} className="mr-2" />
                      View Products
                    </Link>
                    <button
                      onClick={() => {
                        handleEdit(selectedVendor.id);
                        setShowVendorDetails(false);
                      }}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
                    >
                      <Edit size={18} className="mr-2" />
                      Edit Shop
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteShop(selectedVendor.id);
                        setShowVendorDetails(false);
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                    >
                      <Trash2 size={18} className="mr-2" />
                      Delete Shop
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAddShop && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Add New Shop</h2>
                <button
                  onClick={() => setShowAddShop(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name*</label>
                      <input
                        type="text"
                        value={newShop.name}
                        onChange={(e) => setNewShop({...newShop, name: e.target.value})}
                        className="block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type*</label>
                      <input
                        type="text"
                        value={newShop.cuisine}
                        onChange={(e) => setNewShop({...newShop, cuisine: e.target.value})}
                        className="block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={newShop.description}
                        onChange={(e) => setNewShop({...newShop, description: e.target.value})}
                        rows={4}
                        className="block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input
                        type="text"
                        value={newShop.image}
                        onChange={(e) => setNewShop({...newShop, image: e.target.value})}
                        className="block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="/images/shops/default.jpg"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Contact & Additional Info</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={newShop.email}
                          onChange={(e) => setNewShop({...newShop, email: e.target.value})}
                          className="block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={newShop.phone}
                          onChange={(e) => setNewShop({...newShop, phone: e.target.value})}
                          className="block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                      <textarea
                        value={newShop.address}
                        onChange={(e) => setNewShop({...newShop, address: e.target.value})}
                        rows={3}
                        className="block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
                        <input
                          type="text"
                          value={newShop.deliveryTime}
                          onChange={(e) => setNewShop({...newShop, deliveryTime: e.target.value})}
                          className="block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="20-30 min"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price for Two ($)</label>
                        <input
                          type="number"
                          value={newShop.priceForTwo}
                          onChange={(e) => setNewShop({...newShop, priceForTwo: Number(e.target.value)})}
                          className="block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0-5)</label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          value={newShop.rating}
                          onChange={(e) => setNewShop({...newShop, rating: Number(e.target.value)})}
                          className="block w-full mr-3"
                          min="0"
                          max="5"
                          step="0.1"
                        />
                        <span className="font-medium">{newShop.rating}</span>
                      </div>
                      {renderRatingStars(newShop.rating)}
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newShop.promoted}
                          onChange={(e) => setNewShop({...newShop, promoted: e.target.checked})}
                          className="mr-2 h-4 w-4"
                        />
                        <span className="text-sm font-medium text-gray-700">Promoted</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newShop.isactive}
                          onChange={(e) => setNewShop({...newShop, isactive: e.target.checked})}
                          className="mr-2 h-4 w-4"
                        />
                        <span className="text-sm font-medium text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddShop(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddShop}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={!newShop.name || !newShop.cuisine}
                >
                  Add Shop
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
