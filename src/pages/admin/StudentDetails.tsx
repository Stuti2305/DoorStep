
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { GraduationCap, ArrowLeft, Edit2, X, Check, Search, Users, RefreshCw } from 'lucide-react';
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
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Student>>({});
  const [searchTerm, setSearchTerm] = useState('');
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
        setFilteredStudents(studentsData);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => 
        student.stuname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.stuemail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.stuid.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

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

  const refreshData = async () => {
    setLoading(true);
    try {
      const studentsQuery = collection(db, 'Students');
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      setStudents(studentsData);
      setFilteredStudents(studentsData);
    } catch (error) {
      console.error('Error refreshing students:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="w-20 h-20 mb-4 relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-blue-600 border-b-blue-600 border-r-transparent border-l-transparent"></div>
          <GraduationCap className="w-10 h-10 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-blue-600 font-medium">Loading student data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="mr-4 p-2 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-blue-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <GraduationCap className="w-8 h-8 text-blue-600 mr-3" />
                  Student Management
                </h1>
                <p className="text-gray-500 mt-1">View and manage all registered students</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={refreshData}
                className="p-2 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors flex items-center justify-center"
              >
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </button>
              <div className="bg-indigo-600 text-white py-2 px-4 rounded-full flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span className="font-medium">{students.length} Students</span>
              </div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingStudent === student.id ? (
                          <input
                            type="text"
                            value={editValues.stuname}
                            onChange={(e) => setEditValues({ ...editValues, stuname: e.target.value })}
                            className="border border-blue-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{student.stuname}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingStudent === student.id ? (
                          <input
                            type="email"
                            value={editValues.stuemail}
                            onChange={(e) => setEditValues({ ...editValues, stuemail: e.target.value })}
                            className="border border-blue-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">{student.stuemail}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingStudent === student.id ? (
                          <input
                            type="text"
                            value={editValues.stuid}
                            onChange={(e) => setEditValues({ ...editValues, stuid: e.target.value })}
                            className="border border-blue-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-sm text-gray-500 font-mono">{student.stuid}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingStudent === student.id ? (
                          <input
                            type="tel"
                            value={editValues.stuphno}
                            onChange={(e) => setEditValues({ ...editValues, stuphno: e.target.value })}
                            className="border border-blue-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">{student.stuphno}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingStudent === student.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSave(student.id)}
                              className="p-2 bg-green-100 rounded-full hover:bg-green-200 transition-colors"
                              title="Save"
                            >
                              <Check className="w-5 h-5 text-green-600" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-2 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-5 h-5 text-red-600" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                            title="Edit Student"
                          >
                            <Edit2 className="w-5 h-5 text-blue-600" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 text-lg">No students found matching your search</p>
                        {searchTerm && (
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Showing {filteredStudents.length} of {students.length} students
              </p>
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
