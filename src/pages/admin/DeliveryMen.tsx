import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, doc, updateDoc } from 'firebase/firestore';
import { Edit2, X, Check } from 'lucide-react';

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Delivery Men Details</h1>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Duty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Control</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveryMen.map((man) => (
                  <tr key={man.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {editingDeliveryMan === man.id ? (
                        <input
                          type="text"
                          value={editValues.name}
                          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        man.name
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingDeliveryMan === man.id ? (
                        <input
                          type="tel"
                          value={editValues.phone}
                          onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        man.phone
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingDeliveryMan === man.id ? (
                        <input
                          type="email"
                          value={editValues.email}
                          onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        man.email
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingDeliveryMan === man.id ? (
                        <select
                          value={editValues.current_duty}
                          onChange={(e) => setEditValues({ ...editValues, current_duty: e.target.value })}
                          className="border rounded px-2 py-1 w-full"
                        >
                          <option value="Available">Available</option>
                          <option value="Busy">Busy</option>
                          <option value="Not Available">Not Available</option>
                        </select>
                      ) : (
                        man.current_duty
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingDeliveryMan === man.id ? (
                        <input
                          type="text"
                          value={editValues.driving_license_no}
                          onChange={(e) => setEditValues({ ...editValues, driving_license_no: e.target.value })}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        man.driving_license_no
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingDeliveryMan === man.id ? (
                        <select
                          value={editValues.admin_control}
                          onChange={(e) => setEditValues({ ...editValues, admin_control: e.target.value })}
                          className="border rounded px-2 py-1 w-full"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      ) : (
                        man.admin_control
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingDeliveryMan === man.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSave(man.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(man)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 