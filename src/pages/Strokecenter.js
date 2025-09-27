import React, { useState, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data: Replace with actual API call to your backend
const mockPatientData = [
  { id: 1, hn: 'HN001234', an: 'AN001', firstName: 'สมชาย', lastName: 'ใจดี', clinic: 'ศูนย์ฟื้นฟูผู้หลอดเลือดและสมอง' },
  { id: 2, hn: 'HN001235', an: 'AN002', firstName: 'สมหญิง', lastName: 'ใจดี', clinic: 'ศูนย์ฟื้นฟูผู้หลอดเลือดและสมอง' },
  { id: 3, hn: 'HN001236', an: 'AN003', firstName: 'สมศักดิ์', lastName: 'เจริญสุข', clinic: 'ศูนย์ฟื้นฟูผู้หลอดเลือดและสมอง' },
  { id: 4, hn: 'HN001237', an: 'AN004', firstName: 'สมใส', lastName: 'มีสุข', clinic: 'ศูนย์ฟื้นฟูผู้หลอดเลือดและสมอง' },
  { id: 5, hn: 'HN001238', vn: 'VN001', firstName: 'สมพร', lastName: 'ศรีสุข', clinic: 'คลินิกทั่วไป' },
  { id: 6, hn: 'HN001239', vn: 'VN002', firstName: 'สมหมาย', lastName: 'วรรณา', clinic: 'คลินิกพิเศษ' },
  { id: 7, hn: 'HN001240', an: 'AN005', firstName: 'สมบัติ', lastName: 'เจริญ', clinic: 'ศูนย์ฟื้นฟูผู้หลอดเลือดและสมอง' },
];

export default function VNPatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClinic, setFilterClinic] = useState('ศูนย์ฟื้นฟูผู้หลอดเลือดและสมอง');
  
  // Fetch patient data on component load and filter
  useEffect(() => {
    // In a real application, you would make an API call here
    const filteredPatients = mockPatientData.filter(patient => 
      patient.clinic === 'ศูนย์ฟื้นฟูผู้หลอดเลือดและสมอง' && patient.an
    );
    setPatients(filteredPatients);
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleViewDetails = (patientId) => {
    // Redirect to a details page for the patient
    navigate(`/patient-details/${patientId}`);
  };

  const filteredAndSearchedPatients = patients.filter(patient =>
    patient.hn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.an.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-100 p-8">
      <div className="flex-1 bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">รายชื่อผู้ใช้บริการ (ศูนย์ฟื้นฟูผู้หลอดเลือดและสมอง)</h1>
          <button
            onClick={() => navigate('/add-patient')}
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            เพิ่มผู้ใช้บริการ
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="ค้นหา HN, ชื่อ, นามสกุล, AN"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="w-full md:w-1/3 relative">
            <select
              value={filterClinic}
              onChange={(e) => setFilterClinic(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ศูนย์ฟื้นฟูผู้หลอดเลือดและสมอง">ศูนย์ฟื้นฟูผู้หลอดเลือดและสมอง</option>
              <option value="คลินิกทั่วไป">คลินิกทั่วไป</option>
              <option value="คลินิกพิเศษ">คลินิกพิเศษ</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        {/* Patient Table */}
        <div className="overflow-x-auto border border-gray-300 rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th className="w-16 py-3 px-4 text-left text-sm font-semibold text-gray-700">HN</th>
                <th className="w-16 py-3 px-4 text-left text-sm font-semibold text-gray-700">AN</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">ชื่อ-นามสกุล</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">คลินิก</th>
                <th className="w-24 py-3 px-4 text-left text-sm font-semibold text-gray-700">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSearchedPatients.length > 0 ? (
                filteredAndSearchedPatients.map(patient => (
                  <tr key={patient.id} className="border-t border-gray-300 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800">{patient.hn}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{patient.an}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{patient.firstName} {patient.lastName}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{patient.clinic}</td>
                    <td className="py-3 px-4 text-sm text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => handleViewDetails(patient.id)}>ดูรายละเอียด</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">ไม่พบรายชื่อผู้ใช้บริการที่ตรงเงื่อนไข</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}