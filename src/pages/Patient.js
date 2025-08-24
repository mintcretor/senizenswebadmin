import React, { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const Patient = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  // ฟังก์ชันสำหรับไปหน้าเพิ่มผู้รับบริการ
  const handleAddPatient = () => {

    navigate('/AddPatient');

    // วิธีที่ 2: ใช้ Next.js Router (ถ้าใช้ Next.js)
    // import { useRouter } from 'next/router';
    // const router = useRouter();
    // router.push('/add-patient');

    // วิธีที่ 3: ใช้ window.location
    // window.location.href = '/add-patient';

    // วิธีที่ 4: ใช้ history API
    // window.history.pushState({}, '', '/add-patient');


  };

  // ใช้ URL ของรูปภาพแทนการ import จากไฟล์
  const patientImageUrl = 'https://i.imgur.com/u15jJzF.png';

  const services = [
    {
      id: 'HN: 12015601',
      name: 'นายสุนิจ สนายกาย',
      status: 'AN: 25546',
      department: 'ศูนย์ฟื้นฟูหลอดเลือดและสมอง',
      type: 'package'
    },
    {
      id: 'HN: 12015601',
      name: 'นายสุนิจ สนายกาย',
      status: 'VN: 001',
      department: 'คลินิคไตเทียม',
      type: 'hospital'
    },
    {
      id: 'HN: 12015601',
      name: 'นายสุนิจ สนายกาย',
      status: 'AN: 25546',
      department: 'ศูนย์ฟื้นฟูหลอดเลือดและสมอง',
      type: 'package'
    },
    {
      id: 'HN: 12015601',
      name: 'นายสุนิจ สนายกาย',
      status: 'VN: 001',
      category: 'คลินิคไตเทียม',
      department: 'คลินิคไตเทียม',
      type: 'hospital'
    },
    {
      id: 'HN: 12015601',
      name: 'นายสุนิจ สนายกาย',
      status: 'AN: 25546',
      department: 'ศูนย์ฟื้นฟูหลอดเลือดและสมอง',
      type: 'package'
    },
    {
      id: 'HN: 12015601',
      name: 'นายสุนิจ สนายกาย',
      status: 'AN: 25546',
      department: 'ศูนย์ฟื้นฟูหลอดเลือดและสมอง',
      type: 'package'
    }
  ];

  const duplicatedServices = [...services, ...services];

  const filteredServices = duplicatedServices.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ServiceCard = ({ service, index }) => (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4 border border-gray-200">
      <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
        {/* รูปภาพ */}
        <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24">
          <img
            src={patientImageUrl}
            alt="รูปภาพคนไข้"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex-1 min-w-0 flex items-start justify-between">
          <div className="flex flex-col">
            {/* HN และชื่อ */}
            <div className="flex flex-col mb-1 sm:mb-0">
              <span className="text-sm text-gray-600 font-mono mb-1">{service.id}</span>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base break-words">{service.name}</h3>
            </div>

            {/* สถานะและแผนก */}
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs sm:text-sm text-gray-600">สถานะ:</span>
              <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs self-start break-all">
                {service.department}
              </span>
            </div>
          </div>

          {/* AN/VN และ Package อยู่ในคอลัมน์เดียวกันทางด้านขวา */}
          <div className="flex flex-col items-end space-y-2 flex-shrink-0 ml-4">
            {service.type === 'package' ? (
              <>
                <span className="bg-pink-500 text-white px-2 py-1 rounded text-xs font-medium self-end">
                  {service.status}
                </span>
                <button className="bg-yellow-400 hover:bg-yellow-300 text-black px-2 py-6 rounded-lg font-bold text-sm transition-colors">
                  Package
                </button>
              </>
            ) : (
              <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium self-end">
                {service.status}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
            รายชื่อผู้รับบริการทั้งหมด
          </h1>

          {/* Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="ค้นหา ชื่อ นามสกุل หรื่อ HN"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Action Buttons - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleAddPatient}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base flex-1 sm:flex-none"
            >
              เพิ่มผู้รับบริการ
            </button>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base flex-1 sm:flex-none">
              <Download className="h-4 w-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Service Cards - Single Column on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredServices.map((service, index) => (
            <ServiceCard key={`${service.id}-${index}`} service={service} index={index} />
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-base sm:text-lg">ไม่พบข้อมูลที่ค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Patient;