import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { GraduationCap, ArrowLeft, Edit2, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Student {
  id: string;
  stuname: string;
  stuemail: string;
  stuid: string;
  stuphno: string;
}

export default function StudentDetails() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Student>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsQuery = collection(db, 'Students');
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Student[];
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleEdit = (student: Student) => {
    setEditingStudent(student.id);
    setEditValues({
      stuname: student.stuname,
      stuemail: student.stuemail,
      stuid: student.stuid,
      stuphno: student.stuphno
    });
  };

  const handleCancel = () => {
    setEditingStudent(null);
    setEditValues({});
  };

  const handleSave = async (studentId: string) => {
    try {
      const studentRef = doc(db, 'Students', studentId);
      await updateDoc(studentRef, editValues);
      
      // Update local state
      setStudents(students.map(student => 
        student.id === studentId 
          ? { ...student, ...editValues }
          : student
      ));
      
      setEditingStudent(null);
      setEditValues({});
    } catch (error) {
      console.error('Error updating student:', error);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Student Details</h1>
          </div>
          <div className="flex items-center">
            <GraduationCap className="w-6 h-6 text-blue-600 mr-2" />
            <span className="text-lg font-medium text-gray-700">Total Students: {students.length}</span>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {editingStudent === student.id ? (
                        <input
                          type="text"
                          value={editValues.stuname}
                          onChange={(e) => setEditValues({ ...editValues, stuname: e.target.value })}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        student.stuname
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingStudent === student.id ? (
                        <input
                          type="email"
                          value={editValues.stuemail}
                          onChange={(e) => setEditValues({ ...editValues, stuemail: e.target.value })}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        student.stuemail
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingStudent === student.id ? (
                        <input
                          type="text"
                          value={editValues.stuid}
                          onChange={(e) => setEditValues({ ...editValues, stuid: e.target.value })}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        student.stuid
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingStudent === student.id ? (
                        <input
                          type="tel"
                          value={editValues.stuphno}
                          onChange={(e) => setEditValues({ ...editValues, stuphno: e.target.value })}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        student.stuphno
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingStudent === student.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSave(student.id)}
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
                          onClick={() => handleEdit(student)}
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