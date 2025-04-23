import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveryMen.map((man) => (
                  <tr key={man.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{man.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{man.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{man.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{man.current_duty}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{man.driving_license_no}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{man.admin_control}</td>
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