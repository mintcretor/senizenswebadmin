import React, { useState } from 'react';
import { Search, Download, Upload, X, FileText, AlertCircle, CheckCircle, Menu, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

const Patient = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [excelColumns, setExcelColumns] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [showColumnMapping, setShowColumnMapping] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();
  // ข้อมูลผู้รับบริการจำลอง (ในการใช้งานจริงควรดึงจาก API)
  const mockPatientData = [
    {
      hn: '12015601',
      prefix: 'นาย',
      first_name: 'สุนิจ',
      last_name: 'สนายกาย',
      first_name_en: 'Sunij',
      last_name_en: 'Sanayagai',
      gender: 'ชาย',
      age: '35',
      id_card: '1234567890123',
      passport: '',
      birth_date: '15/03/1988',
      phone: '053-123456',
      mobile: '081-2345678',
      nationality: 'ไทย',
      ethnicity: 'ไทย',
      religion: 'พุทธ',
      marital_status: 'โสด',
      allergies: 'ไม่มี',
      occupation: 'พนักงานบริษัท',
      house_number: '123',
      village: '5',
      subdistrict: 'เมืองชาย',
      district: 'เมือง',
      province: 'เชียงราย',
      postal_code: '57000'
    },
    {
      hn: '12015602',
      prefix: 'นาง',
      first_name: 'สมใส',
      last_name: 'ใจดี',
      first_name_en: 'Somsai',
      last_name_en: 'Jaidee',
      gender: 'หญิง',
      age: '28',
      id_card: '1234567890124',
      passport: '',
      birth_date: '22/07/1995',
      phone: '053-234567',
      mobile: '082-3456789',
      nationality: 'ไทย',
      ethnicity: 'ไทย',
      religion: 'พุทธ',
      marital_status: 'แต่งงาน',
      allergies: 'แพ้ยาปฏิชีวนะ',
      occupation: 'ครู',
      house_number: '456',
      village: '2',
      subdistrict: 'รอบเวียง',
      district: 'เมือง',
      province: 'เชียงราย',
      postal_code: '57000'
    },
    {
      hn: '12015603',
      prefix: 'นาย',
      first_name: 'วิชัย',
      last_name: 'รุ่งเรือง',
      first_name_en: 'Wichai',
      last_name_en: 'Rungruang',
      gender: 'ชาย',
      age: '42',
      id_card: '1234567890125',
      passport: '',
      birth_date: '10/12/1981',
      phone: '053-345678',
      mobile: '083-4567890',
      nationality: 'ไทย',
      ethnicity: 'ไทย',
      religion: 'พุทธ',
      marital_status: 'แต่งงาน',
      allergies: 'แพ้อาหารทะเล',
      occupation: 'นักธุรกิจ',
      house_number: '789',
      village: '1',
      subdistrict: 'บ้านดู่',
      district: 'เมือง',
      province: 'เชียงราย',
      postal_code: '57000'
    },
    {
      hn: '12015604',
      prefix: 'นางสาว',
      first_name: 'มาลี',
      last_name: 'สวยงาม',
      first_name_en: 'Malee',
      last_name_en: 'Suaynam',
      gender: 'หญิง',
      age: '25',
      id_card: '1234567890126',
      passport: '',
      birth_date: '05/09/1998',
      phone: '053-456789',
      mobile: '084-5678901',
      nationality: 'ไทย',
      ethnicity: 'ไทย',
      religion: 'พุทธ',
      marital_status: 'โสด',
      allergies: 'ไม่มี',
      occupation: 'พนักงานธนาคาร',
      house_number: '321',
      village: '3',
      subdistrict: 'แม่กรณ์',
      district: 'เมือง',
      province: 'เชียงราย',
      postal_code: '57000'
    },
    {
      hn: '12015605',
      prefix: 'นาย',
      first_name: 'สมชาย',
      last_name: 'มั่นคง',
      first_name_en: 'Somchai',
      last_name_en: 'Mankong',
      gender: 'ชาย',
      age: '55',
      id_card: '1234567890127',
      passport: '',
      birth_date: '20/01/1968',
      phone: '053-567890',
      mobile: '085-6789012',
      nationality: 'ไทย',
      ethnicity: 'ไทย',
      religion: 'พุทธ',
      marital_status: 'แต่งงาน',
      allergies: 'แพ้ยาแอสไพริน',
      occupation: 'ข้าราชการเกษียณ',
      house_number: '654',
      village: '7',
      subdistrict: 'นางแล',
      district: 'เมือง',
      province: 'เชียงราย',
      postal_code: '57000'
    }
  ];

  // ฟิลด์ในฐานข้อมูลที่ต้องการ
  const databaseFields = [
    { key: 'hn', label: 'HN', required: true },
    { key: 'first_name', label: 'ชื่อ', required: true },
    { key: 'last_name', label: 'นามสกุล', required: true },
    { key: 'id_card', label: 'บัตรประชาชน', required: false },
    { key: 'birth_date', label: 'วันเกิด', required: false },
    { key: 'age', label: 'อายุ', required: false },
    { key: 'gender', label: 'เพศ', required: false },
    { key: 'religion', label: 'ศาสนา', required: false },
    { key: 'nationality', label: 'สัญชาติ', required: false },
    { key: 'ethnicity', label: 'เชื้อชาติ', required: false },
    { key: 'blood_type', label: 'กรุ๊ปเลือด', required: false },
    { key: 'phone', label: 'เบอร์โทรศัพท์', required: false },
    { key: 'house_number', label: 'บ้านเลขที่', required: false },
    { key: 'village', label: 'หมู่', required: false },
    { key: 'subdistrict', label: 'ตำบล', required: false },
    { key: 'district', label: 'อำเภอ', required: false },
    { key: 'province', label: 'จังหวัด', required: false },
    { key: 'postal_code', label: 'รหัสไปรษณีย์', required: false },
  ];

  // ฟังก์ชัน Export Excel
  const handleExportClick = async () => {
    try {
      setExporting(true);
      
      // เตรียมข้อมูลสำหรับ export
      const exportData = mockPatientData.map(patient => ({
        'HN': patient.hn,
        'คำนำหน้า': patient.prefix,
        'ชื่อ': patient.first_name,
        'นามสกุล': patient.last_name,
        'ชื่อภาษาอังกฤษ': patient.first_name_en,
        'นามสกุลภาษาอังกฤษ': patient.last_name_en,
        'เพศ': patient.gender,
        'อายุ': patient.age,
        'บัตรประชาชน': patient.id_card,
        'เลขพาสปอร์ต': patient.passport,
        'วันเกิด': patient.birth_date,
        'เบอร์ติดต่อ': patient.phone,
        'เบอร์มือถือ': patient.mobile,
        'สัญชาติ': patient.nationality,
        'เชื้อชาติ': patient.ethnicity,
        'ศาสนา': patient.religion,
        'สถานะ': patient.marital_status,
        'แพ้ยา': patient.allergies,
        'อาชีพ': patient.occupation,
        'บ้านเลขที่': patient.house_number,
        'หมู่': patient.village,
        'ตำบล': patient.subdistrict,
        'อำเภอ': patient.district,
        'จังหวัด': patient.province,
        'รหัสไปรษณีย์': patient.postal_code
      }));

      // จำลองการประมวลผล
      await new Promise(resolve => setTimeout(resolve, 1500));

      // สร้าง workbook
      const wb = XLSX.utils.book_new();
      
      // สร้าง worksheet จากข้อมูล
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // ปรับความกว้างของคอลัมน์
      const colWidths = [
        { wch: 12 }, // HN
        { wch: 10 }, // คำนำหน้า
        { wch: 15 }, // ชื่อ
        { wch: 15 }, // นามสกุล
        { wch: 15 }, // ชื่ออังกฤษ
        { wch: 15 }, // นามสกุลอังกฤษ
        { wch: 8 },  // เพศ
        { wch: 8 },  // อายุ
        { wch: 17 }, // บัตรประชาชน
        { wch: 15 }, // พาสปอร์ต
        { wch: 12 }, // วันเกิด
        { wch: 15 }, // เบอร์ติดต่อ
        { wch: 15 }, // เบอร์มือถือ
        { wch: 10 }, // สัญชาติ
        { wch: 10 }, // เชื้อชาติ
        { wch: 10 }, // ศาสนา
        { wch: 12 }, // สถานะ
        { wch: 20 }, // แพ้ยา
        { wch: 20 }, // อาชีพ
        { wch: 12 }, // บ้านเลขที่
        { wch: 8 },  // หมู่
        { wch: 15 }, // ตำบล
        { wch: 15 }, // อำเภอ
        { wch: 15 }, // จังหวัด
        { wch: 12 }  // รหัสไปรษณีย์
      ];
      ws['!cols'] = colWidths;

      // เพิ่ม worksheet เข้า workbook
      XLSX.utils.book_append_sheet(wb, ws, 'รายชื่อผู้รับบริการ');
      
      // สร้างชื่อไฟล์พร้อมวันที่
      const today = new Date();
      const dateStr = today.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-');
      
      const filename = `รายชื่อผู้รับบริการ_${dateStr}.xlsx`;
      
      // ดาวน์โหลดไฟล์
      XLSX.writeFile(wb, filename);
      
      // แสดงข้อความสำเร็จ
      setTimeout(() => {
        alert(`Export ข้อมูลสำเร็จ!\nจำนวน ${mockPatientData.length} ราย\nไฟล์: ${filename}`);
        setExporting(false);
      }, 500);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('เกิดข้อผิดพลาดในการ Export ข้อมูล');
      setExporting(false);
    }
  };

  const handleAddPatient = () => {
      navigate('/AddPatient');
    console.log('Navigate to add patient page');
  };

  const handleImportClick = () => {
    setShowImportModal(true);
    setSelectedFile(null);
    setImportStatus('');
    setImportProgress(0);
    setShowColumnMapping(false);
    setExcelColumns([]);
    setColumnMapping({});
    setPreviewData([]);
  };

  const parseExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const mockColumns = [
            'HN', 'คำนำหน้า', 'ชื่อ', 'นามสกุล', 'ชื่อภาษาอังกฤษ', 
            'นามสกุลภาษาอังกฤษ', 'เพศ', 'อายุ', 'บัตรประชาชน', 
            'เลขพาสปอร์ต', 'วันเกิด', 'เบอร์ติดต่อ', 'เบอร์มือถือ', 
            'สัญชาติ', 'เชื้อชาติ', 'ศาสนา', 'สถานะ', 'แพ้ยา', 'อาชีพ', 
            'บ้านเลขที่', 'หมู่', 'ตำบล', 'อำเภอ', 'จังหวัด', 'รหัสไปรษณีย์'
          ];
          
          const mockPreviewData = [
            ['12015601', 'นาย', 'สุนิจ', 'สนายกาย', 'Sunij', 'Sanayagai', 'ชาย', '35', '1234567890123', '', '15/03/1988', '053-123456', '081-2345678', 'ไทย', 'ไทย', 'พุทธ', 'โสด', 'ไม่มี', 'พนักงานบริษัท', '123', '5', 'เมืองชาย', 'เมือง', 'เชียงราย', '57000'],
            ['12015602', 'นาง', 'สมใส', 'ใจดี', 'Somsai', 'Jaidee', 'หญิง', '28', '1234567890124', '', '22/07/1995', '053-234567', '082-3456789', 'ไทย', 'ไทย', 'พุทธ', 'แต่งงาน', 'แพ้ยาปฏิชีวนะ', 'ครู', '456', '2', 'รอบเวียง', 'เมือง', 'เชียงราย', '57000']
          ];
          
          resolve({ columns: mockColumns, preview: mockPreviewData });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
        setImportStatus('parsing');
        
        try {
          const { columns, preview } = await parseExcelFile(file);
          setExcelColumns(columns);
          setPreviewData(preview);
          setShowColumnMapping(true);
          setImportStatus('');
          
          const autoMapping = {};
          columns.forEach(col => {
            const colLower = col.toLowerCase();
            if (colLower.includes('hn') || colLower === 'hn') autoMapping['hn'] = col;
            else if (colLower.includes('ชื่อ') && !colLower.includes('นาม') && !colLower.includes('อังกฤษ')) autoMapping['first_name'] = col;
            else if (colLower.includes('นามสกุล') && !colLower.includes('อังกฤษ')) autoMapping['last_name'] = col;
            else if (colLower.includes('บัตรประชาชน') || colLower.includes('เลขประจำตัว')) autoMapping['id_card'] = col;
            else if (colLower.includes('วันเกิด')) autoMapping['birth_date'] = col;
            else if (colLower.includes('อายุ')) autoMapping['age'] = col;
            else if (colLower.includes('เพศ')) autoMapping['gender'] = col;
            else if (colLower.includes('ศาสนา')) autoMapping['religion'] = col;
            else if (colLower.includes('สัญชาติ')) autoMapping['nationality'] = col;
            else if (colLower.includes('เชื้อชาติ')) autoMapping['ethnicity'] = col;
            else if (colLower.includes('เบอร์') || colLower.includes('โทร')) autoMapping['phone'] = col;
            else if (colLower.includes('บ้านเลขที่')) autoMapping['house_number'] = col;
            else if (colLower.includes('หมู่')) autoMapping['village'] = col;
            else if (colLower.includes('ตำบล')) autoMapping['subdistrict'] = col;
            else if (colLower.includes('อำเภอ')) autoMapping['district'] = col;
            else if (colLower.includes('จังหวัด')) autoMapping['province'] = col;
            else if (colLower.includes('รหัสไปรษณีย์')) autoMapping['postal_code'] = col;
          });
          setColumnMapping(autoMapping);
        } catch (error) {
          setImportStatus('error');
          console.error('Error parsing Excel file:', error);
        }
      } else {
        setImportStatus('error');
        alert('กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls) เท่านั้น');
      }
    }
  };

  const handleColumnMappingChange = (dbField, excelColumn) => {
    setColumnMapping(prev => ({
      ...prev,
      [dbField]: excelColumn
    }));
  };

  const validateMapping = () => {
    const requiredFields = databaseFields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !columnMapping[field.key]);
    return missingFields;
  };

  const simulateImport = async () => {
    setImporting(true);
    setImportStatus('importing');
    
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setImportProgress(i);
    }
    
    setImportStatus('success');
    setImporting(false);
    
    setTimeout(() => {
      setShowImportModal(false);
    }, 2000);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert('กรุณาเลือกไฟล์');
      return;
    }

    const missingFields = validateMapping();
    if (missingFields.length > 0) {
      alert(`กรุณาเลือกคอลัมน์สำหรับฟิลด์ที่จำเป็น: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('columnMapping', JSON.stringify(columnMapping));
      
      await simulateImport();
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      setImporting(false);
    }
  };

  const patientImageUrl = 'https://i.imgur.com/u15jJzF.png';

  // สร้างรายการผู้ป่วยจากข้อมูลจำลอง
  const services = mockPatientData.flatMap(patient => [
    {
      id: `HN: ${patient.hn}`,
      name: `${patient.prefix}${patient.first_name} ${patient.last_name}`,
      status: 'AN: 25546',
      department: 'ศูนย์ฟื้นฟูหลอดเลือดและสมอง',
      type: 'package'
    },
    {
      id: `HN: ${patient.hn}`,
      name: `${patient.prefix}${patient.first_name} ${patient.last_name}`,
      status: 'VN: 001',
      department: 'คลินิคไตเทียม',
      type: 'hospital'
    }
  ]);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ServiceCard = ({ service, index }) => (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-200 h-fit">
      <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
        {/* Patient Image - Hidden on mobile, shown on tablet and up */}
        <div className="hidden sm:block flex-shrink-0">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={patientImageUrl}
              alt="รูปภาพคนไข้"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            {/* Patient Info */}
            <div className="flex-1 min-w-0 mb-3 sm:mb-0">
              <div className="flex items-start justify-between sm:block">
                <div>
                  <p className="text-xs text-gray-500 font-mono mb-1">{service.id}</p>
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight mb-2">
                    {service.name}
                  </h3>
                </div>
                
                {/* Mobile Image - Only shown on mobile */}
                <div className="sm:hidden flex-shrink-0 ml-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={patientImageUrl}
                      alt="รูปภาพคนไข้"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Department Info */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-600">แผนก:</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 max-w-full">
                  <span className="truncate">{service.department}</span>
                </span>
              </div>
            </div>

            {/* Status and Action */}
            <div className="flex items-center justify-between sm:flex-col sm:items-end sm:space-y-2 sm:ml-4">
              <div className="flex items-center space-x-2 sm:flex-col sm:space-x-0 sm:space-y-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  service.type === 'package' 
                    ? 'bg-pink-100 text-pink-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {service.status}
                </span>
                
                {service.type === 'package' && (
                  <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 transform hover:scale-105 shadow-md">
                    Package
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-4 sm:px-6 sm:py-6">
          {/* Title and Mobile Menu */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              รายชื่อผู้รับบริการ
            </h1>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="ค้นหา ชื่อ นามสกุล หรื่อ HN"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
            />
          </div>

          {/* Action Buttons - Desktop */}
          <div className="hidden sm:flex flex-wrap gap-3">
            <button
              onClick={handleAddPatient}
              className="inline-flex items-center px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มผู้รับบริการ
            </button>
            
            <button 
              onClick={handleImportClick}
              className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Excel
            </button>
            
            <button 
              onClick={handleExportClick}
              disabled={exporting}
              className="inline-flex items-center px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  กำลัง Export...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </>
              )}
            </button>
          </div>

          {/* Mobile Action Menu */}
          {showMobileMenu && (
            <div className="sm:hidden mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => {
                    handleAddPatient();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มผู้รับบริการ
                </button>
                
                <button 
                  onClick={() => {
                    handleImportClick();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Excel
                </button>
                
                <button 
                  onClick={() => {
                    handleExportClick();
                    setShowMobileMenu(false);
                  }}
                  disabled={exporting}
                  className="flex items-center justify-center px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      กำลัง Export...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export Excel
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-8 pb-8 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-4xl min-h-[80vh] max-h-none shadow-2xl my-auto">
            <div className="p-4 sm:p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Import ข้อมูลผู้รับบริการ</h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={importing}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {!showColumnMapping ? (
                  <>
                    {/* File Upload Area */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        เลือกไฟล์ Excel
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="excel-upload"
                          disabled={importing}
                        />
                        <label htmlFor="excel-upload" className="cursor-pointer">
                          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-lg text-gray-700 font-medium mb-2">
                            คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง
                          </p>
                          <p className="text-sm text-gray-500">
                            รองรับไฟล์ .xlsx และ .xls เท่านั้น
                          </p>
                        </label>
                      </div>
                      
                      {selectedFile && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center space-x-3">
                          <FileText className="h-6 w-6 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-medium text-green-800 truncate">{selectedFile.name}</p>
                            <p className="text-sm text-green-600">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {importStatus === 'parsing' && (
                      <div className="mb-8 text-center py-8">
                        <div className="inline-flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent"></div>
                          <span className="text-lg text-gray-700">กำลังอ่านไฟล์...</span>
                        </div>
                      </div>
                    )}

                    {/* Format Info */}
                    <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
                      <h4 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
                        <FileText className="h-6 w-6 mr-3" />
                        รูปแบบไฟล์ Excel ที่ต้องการ:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base text-blue-800">
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>HN, คำนำหน้า, ชื่อ, นามสกุล</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>เพศ, อายุ, บัตรประชาชน, วันเกิด</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>เบอร์ติดต่อ, สัญชาติ, ศาสนา</span>
                          </li>
                        </ul>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>ที่อยู่: บ้านเลขที่, หมู่, ตำบล</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>อำเภอ, จังหวัด, รหัสไปรษณีย์</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>ข้อมูลเพิ่มเติม: อาชีพ, แพ้ยา</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Column Mapping */}
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-6">จับคู่คอลัมน์ข้อมูล</h4>
                      
                      {/* Preview Data */}
                      <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                        <h5 className="text-base font-medium text-gray-700 mb-4">ตัวอย่างข้อมูลจากไฟล์:</h5>
                        <div className="overflow-x-auto">
                          <div className="min-w-full">
                            <div className="grid grid-flow-col gap-4 font-medium text-gray-800 mb-3 text-sm">
                              {excelColumns.slice(0, 8).map(col => (
                                <div key={col} className="w-28 truncate">{col}</div>
                              ))}
                              {excelColumns.length > 8 && <div className="text-gray-500 text-center">...</div>}
                            </div>
                            {previewData.slice(0, 3).map((row, i) => (
                              <div key={i} className="grid grid-flow-col gap-4 text-gray-600 text-sm mb-1">
                                {row.slice(0, 8).map((cell, j) => (
                                  <div key={j} className="w-28 truncate" title={cell}>{cell}</div>
                                ))}
                                {row.length > 8 && <div className="text-gray-400 text-center">...</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Column Mapping Form */}
                      <div className="space-y-6">
                        <h5 className="text-base font-medium text-gray-900">จับคู่คอลัมน์ข้อมูล:</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-96 overflow-y-auto border border-gray-200 rounded-xl p-6">
                          {databaseFields.map(field => (
                            <div key={field.key} className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 flex items-center">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1 text-base">*</span>}
                              </label>
                              <select
                                value={columnMapping[field.key] || ''}
                                onChange={(e) => handleColumnMappingChange(field.key, e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">-- เลือกคอลัมน์ --</option>
                                {excelColumns.map(col => (
                                  <option key={col} value={col}>{col}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mapping Summary */}
                      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                        <div className="flex justify-between text-base">
                          <span>จับคู่แล้ว: <strong className="text-blue-700">{Object.keys(columnMapping).length}</strong> ฟิลด์</span>
                          <span>ฟิลด์ที่จำเป็น: <strong className="text-blue-700">{databaseFields.filter(f => f.required).length}</strong> ฟิลด์</span>
                        </div>
                        {validateMapping().length > 0 && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              <strong>ฟิลด์ที่ยังไม่ได้จับคู่:</strong> {validateMapping().map(f => f.label).join(', ')}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Back button */}
                      <div className="mt-6">
                        <button
                          onClick={() => {
                            setShowColumnMapping(false);
                            setSelectedFile(null);
                            setExcelColumns([]);
                            setColumnMapping({});
                          }}
                          className="text-base text-blue-600 hover:text-blue-800 font-medium flex items-center"
                        >
                          ← เลือกไฟล์ใหม่
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Import Progress */}
                {importing && (
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-medium text-gray-900">กำลังประมวลผล...</span>
                      <span className="text-base font-medium text-blue-600">{importProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${importProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Status Messages */}
                {importStatus === 'success' && (
                  <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-4">
                    <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-lg font-medium text-green-800">Import ข้อมูลสำเร็จ!</p>
                      <p className="text-base text-green-700 mt-2">ระบบจะปิดหน้าต่างนี้โดยอัตโนมัติ</p>
                    </div>
                  </div>
                )}
                
                {importStatus === 'error' && (
                  <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-4">
                    <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-lg font-medium text-red-800">เกิดข้อผิดพลาดในการ Import ข้อมูล</p>
                      <p className="text-base text-red-700 mt-2">กรุณาตรวจสอบไฟล์และลองใหม่อีกครั้ง</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 flex-shrink-0">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-base"
                  disabled={importing}
                >
                  ยกเลิก
                </button>
                {showColumnMapping && (
                  <button
                    onClick={handleImport}
                    disabled={importing || validateMapping().length > 0}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 text-base"
                  >
                    {importing ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        กำลังประมวลผล...
                      </span>
                    ) : (
                      'Import ข้อมูล'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-6 sm:px-6">
        {/* Results Summary */}
        {searchTerm && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              พบ <strong>{filteredServices.length}</strong> รายการจากการค้นหา "{searchTerm}"
            </p>
          </div>
        )}

        {/* Patient Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {filteredServices.map((service, index) => (
            <ServiceCard key={`${service.id}-${index}`} service={service} index={index} />
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูลที่ค้นหา</h3>
            <p className="text-gray-500 mb-6">ลองเปลี่ยนคำค้นหาหรือเพิ่มผู้รับบริการใหม่</p>
            <button
              onClick={handleAddPatient}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มผู้รับบริการ
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="sm:hidden fixed bottom-6 right-6 z-30">
        <button
          onClick={handleAddPatient}
          className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center transform hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default Patient;