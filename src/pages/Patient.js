import React, { useState, useEffect } from 'react';
import { Search, Download, Upload, X, FileText, AlertCircle, CheckCircle, Menu, Plus, RefreshCw, Trash2, ClipboardPlus, Edit, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

const Patient = () => {
  // State declarations
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
  const [fullExcelData, setFullExcelData] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  // API Related States
  const [patientData, setPatientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const PATIENTS_PER_PAGE = 20;

  const navigate = useNavigate();

  // API Configuration
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // API Functions
  const fetchPatients = async (page = 1, search = '') => {
    try {
      if (page === 1 && !search) {
        setLoading(true);
      } else {
        setPaginationLoading(true);
      }
      setError(null);

      // Use page parameter instead of calculating offset in frontend
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';

      const response = await fetch(`${API_BASE_URL}/patients?page=${page}&limit=${PATIENTS_PER_PAGE}${searchParam}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log

      // Handle your backend response structure
      if (data.success && data.data && data.pagination) {
        const patients = data.data;
        const { total, totalPages } = data.pagination;

        setPatientData(patients);
        setTotalPatients(total);
        setTotalPages(totalPages);
        setCurrentPage(page);
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('ไม่สามารถโหลดข้อมูลผู้รับบริการได้: ' + error.message);

      // Fallback to mock data for development
      if (process.env.NODE_ENV === 'development') {
        console.log('Using fallback data for development');
        //const mockData = generateMockPatients(page, search);
        setPatientData();
        setTotalPatients();
        setTotalPages();
        setCurrentPage();
      }
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };

  // Mock data generator for development/testing
  const generateMockPatients = (page, search) => {
    const totalMockPatients = 350; // Simulate 350 patients
    const mockPatients = [];

    for (let i = 1; i <= totalMockPatients; i++) {
      const patient = {
        id: i,
        hn: `HN${String(i).padStart(6, '0')}`,
        prename: i % 2 === 0 ? 'นาย' : 'นางสาว',
        first_name: `ชื่อ${i}`,
        last_name: `นามสกุล${i}`,
        age: Math.floor(Math.random() * 60) + 20,
        gender: i % 2 === 0 ? 'ชาย' : 'หญิง',
        phone: `08${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      };
      mockPatients.push(patient);
    }

    // Filter by search if provided
    let filteredPatients = mockPatients;
    if (search) {
      filteredPatients = mockPatients.filter(patient => {
        const fullName = `${patient.first_name} ${patient.last_name}`;
        return fullName.toLowerCase().includes(search.toLowerCase()) ||
          patient.hn.toLowerCase().includes(search.toLowerCase());
      });
    }

    // Paginate
    const start = (page - 1) * PATIENTS_PER_PAGE;
    const end = start + PATIENTS_PER_PAGE;
    const paginatedData = filteredPatients.slice(start, end);

    return {
      data: paginatedData,
      total: filteredPatients.length
    };
  };

  const refreshPatients = async () => {
    try {
      setRefreshing(true);
      await fetchPatients(currentPage, searchTerm);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle search with pagination reset
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        setCurrentPage(1);
        fetchPatients(1, searchTerm);
      } else {
        fetchPatients(currentPage, '');
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && !paginationLoading) {
      fetchPatients(newPage, searchTerm);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };
  const handleDeletePatient = async (patientId, patientName) => {

    if (window.confirm(`คุณต้องการลบข้อมูลของ "${patientName}" ใช่หรือไม่?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete patient');
        }

        // Refresh current page after deletion
        await fetchPatients(currentPage, searchTerm);
        alert('ลบข้อมูลผู้รับบริการเรียบร้อยแล้ว');

      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล: ' + error.message);
      }
    }
  };

  const importPatientsToAPI = async (importedData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          patients: importedData,
          columnMapping: columnMapping
        })
      });

      if (!response.ok) {
        throw new Error('Failed to import patients');
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Error importing patients:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPatients(1, '');
  }, []);

  // Debug component to show pagination state
  const DebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
        <strong>Debug Info:</strong> Page {currentPage}/{totalPages} | Total: {totalPatients} | Showing: {safePatientData.length} | Loading: {loading ? 'Yes' : 'No'} | PagLoading: {paginationLoading ? 'Yes' : 'No'}
      </div>
    );
  };

  const databaseFields = [
    { key: 'hn', label: 'HN', required: true },
    { key: 'prename', label: 'คำนำหน้า', required: false }, // เพิ่มบรรทัดนี้
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

  const handleExportClick = async () => {
    try {
      setExporting(true);

      // Export all patients using page-based approach
      const response = await fetch(`${API_BASE_URL}/patients?page=1&limit=10000`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch all patients for export');
      }

      const data = await response.json();
      const allPatients = (data.success && data.data) ? data.data : [];

      // Prepare data for export
      const exportData = allPatients.map(patient => ({
        'HN': patient.hn,
        'คำนำหน้า': patient.prename,  // เปลี่ยนจาก prefix เป็น prename
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
        'ตำบล': patient.subdistrict || patient.sub_district_name,
        'อำเภอ': patient.district || patient.district_name,
        'จังหวัด': patient.province || patient.province_name,
        'รหัสไปรษณีย์': patient.postal_code
      }));

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 8 }, { wch: 8 }, { wch: 17 }, { wch: 15 },
        { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 10 },
        { wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 12 },
        { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'รายชื่อผู้รับบริการ');

      // Generate filename with current date
      const today = new Date();
      const dateStr = today.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-');

      const filename = `รายชื่อผู้รับบริการ_${dateStr}.xlsx`;

      XLSX.writeFile(wb, filename);

      setTimeout(() => {
        alert(`Export ข้อมูลสำเร็จ!\nจำนวน ${allPatients.length} ราย\nไฟล์: ${filename}`);
        setExporting(false);
      }, 500);

    } catch (error) {
      console.error('Export error:', error);
      alert('เกิดข้อผิดพลาดในการ Export ข้อมูล: ' + error.message);
      setExporting(false);
    }
  };

  const handleAddPatient = () => {
    navigate('/AddPatient');
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
    setFullExcelData([]);
  };

  const parseExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
            defval: ''
          });

          if (jsonData.length < 2) {
            throw new Error('ไฟล์ Excel ไม่มีข้อมูล');
          }

          const columns = jsonData[0] || [];
          const dataRows = jsonData.slice(1);
          const preview = dataRows.slice(0, 5);

          resolve({ columns, preview, fullData: dataRows });
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
          const { columns, preview, fullData } = await parseExcelFile(file);
          setExcelColumns(columns);
          setPreviewData(preview);
          setFullExcelData(fullData);
          setShowColumnMapping(true);
          setImportStatus('');

          // Auto-mapping logic
          const autoMapping = {};
          columns.forEach(col => {
            const colLower = col.toLowerCase();
            if (colLower.includes('hn') || colLower === 'hn') autoMapping['hn'] = col;
            else if (colLower.includes('คำนำหน้า') || colLower.includes('prename')) autoMapping['prename'] = col; // เพิ่มบรรทัดนี้
            else if (colLower.includes('ชื่อ') && !colLower.includes('นาม') && !colLower.includes('อังกฤษ')) autoMapping['first_name'] = col;
            else if (colLower.includes('นามสกุล') && !colLower.includes('อังกฤษ')) autoMapping['last_name'] = col;
            else if (colLower.includes('บัตรประชาชน') || colLower.includes('เลขประจำตัว')) autoMapping['id_card'] = col;
          });
          setColumnMapping(autoMapping);
        } catch (error) {
          setImportStatus('error');
          console.error('Error parsing Excel file:', error);
          alert('เกิดข้อผิดพลาดในการอ่านไฟล์: ' + error.message);
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

  const processImportData = () => {
    const processedData = [];

    fullExcelData.forEach((row) => {
      const patientRecord = {};
      let hasRequiredData = true;

      const requiredDbFields = databaseFields.filter(f => f.required).map(f => f.key);
      for (const dbField of requiredDbFields) {
        const excelColumn = columnMapping[dbField];
        const columnIndex = excelColumns.indexOf(excelColumn);
        if (columnIndex === -1 || !row[columnIndex]) {
          hasRequiredData = false;
          break;
        }
      }

      if (hasRequiredData) {
        Object.entries(columnMapping).forEach(([dbField, excelColumn]) => {
          const columnIndex = excelColumns.indexOf(excelColumn);
          if (columnIndex !== -1) {
            patientRecord[dbField] = row[columnIndex] || '';
          }
        });

        patientRecord.import_batch = new Date().toISOString();
        patientRecord.created_at = new Date().toISOString();

        processedData.push(patientRecord);
      }
    });

    return processedData;
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
      setImporting(true);
      setImportStatus('importing');

      const importData = processImportData();

      if (importData.length === 0) {
        throw new Error('ไม่พบข้อมูลที่ถูกต้องสำหรับนำเข้า กรุณาตรวจสอบว่าไฟล์มีข้อมูลครบถ้วนในคอลัมน์ที่จำเป็น');
      }

      for (let i = 0; i <= 70; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setImportProgress(i);
      }

      await importPatientsToAPI(importData);

      for (let i = 80; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setImportProgress(i);
      }

      setImportStatus('success');
      setImporting(false);

      // Refresh to first page after import
      setCurrentPage(1);
      await fetchPatients(1, searchTerm);

      setTimeout(() => {
        setShowImportModal(false);
      }, 2000);

    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      setImporting(false);
      alert('เกิดข้อผิดพลาดในการ Import: ' + error.message);
    }
  };

  const handleAddAnVn = (patient) => {
    console.log(patient)
    navigate(`/an-vn/add/${patient.id}`, {
      state: { patient }
    });
  };

  const handleEditPatient = (patient) => {
    navigate(`/EditPatient/${patient.id}`, {
      state: { patient }
    });
  };

  const patientImageUrl = '/images/logo.png';
  const safePatientData = Array.isArray(patientData) ? patientData : [];

  const PatientCard = ({ patient }) => {
    const fullName = `${patient.prename || ''}${patient.first_name || ''} ${patient.last_name || ''}`.trim();

    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={patientImageUrl}
                alt="รูปภาพคนไข้"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 font-mono mb-1">HN: {patient.hn}</p>
                <h3
                  className="font-semibold text-gray-900 text-base sm:text-lg leading-tight truncate hover:text-blue-600 transition-colors cursor-pointer"
                  title={fullName}
                  onClick={() => handleEditPatient(patient)}
                >
                  {fullName}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                  <span>อายุ: {patient.age || '-'} ปี</span>
                  <span>เพศ: {patient.gender || '-'}</span>
                </div>
              </div>

              <div className="flex-shrink-0 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePatient(patient.id, fullName);
                  }}
                  className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
                  title="ลบข้อมูล"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-3">
                เบอร์ติดต่อ: <span className="font-medium text-gray-700">{patient.mobile || patient.phone || '-'}</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddAnVn(patient);
                  }}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  title="เพิ่ม AN/VN"
                >
                  <ClipboardPlus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">เพิ่ม </span>AN/VN
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditPatient(patient);
                  }}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  title="ดู/แก้ไขประวัติ"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">ดู/</span>แก้ไข
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact Pagination Component for Header
  const CompactPaginationComponent = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center space-x-2 text-sm">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || paginationLoading}
          className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="หน้าก่อนหน้า"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center space-x-1">
          <span className="text-gray-600">หน้า</span>
          <select
            value={currentPage}
            onChange={(e) => handlePageChange(parseInt(e.target.value))}
            disabled={paginationLoading}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <option key={page} value={page}>{page}</option>
            ))}
          </select>
          <span className="text-gray-600">จาก {totalPages}</span>
        </div>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || paginationLoading}
          className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="หน้าถัดไป"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {paginationLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent ml-2"></div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">กำลังโหลดข้อมูลผู้รับบริการ...</p>
        </div>
      </div>
    );
  }

  if (error && safePatientData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchPatients(1, '')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                รายชื่อผู้รับบริการ
              </h1>
              {error && (
                <div className="flex items-center text-yellow-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  ใช้ข้อมูลสำรอง
                </div>
              )}
              {/* Compact Pagination in Header */}
              <div className="hidden sm:block">
                <CompactPaginationComponent />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={refreshPatients}
                disabled={refreshing}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Mobile Pagination */}
          <div className="sm:hidden mb-4">
            <CompactPaginationComponent />
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="ค้นหา ชื่อ นามสกุล หรือ HN"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
            />
          </div>

          {/* Status Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 text-sm text-gray-600">
            <div>
              หน้า {currentPage} จาก {totalPages} | แสดง {safePatientData.length} รายการ จากทั้งหมด {totalPatients} ผู้รับบริการ
            </div>
            {error && (
              <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded mt-2 sm:mt-0">
                โหมดออฟไลน์
              </span>
            )}
          </div>

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
              disabled={exporting || totalPatients === 0}
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
                  Export Excel ({totalPatients} ราย)
                </>
              )}
            </button>
          </div>
          {showMobileMenu && (
            <div className="sm:hidden mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => { handleAddPatient(); setShowMobileMenu(false); }} className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มผู้รับบริการ
                </button>
                <button onClick={() => { handleImportClick(); setShowMobileMenu(false); }} className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Excel
                </button>
                <button onClick={() => { handleExportClick(); setShowMobileMenu(false); }} disabled={exporting || totalPatients === 0} className="flex items-center justify-center px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {exporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      กำลัง Export...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export Excel ({totalPatients} ราย)
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
        <DebugInfo />

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {searchTerm ? (
              <>พบ <strong>{safePatientData.length}</strong> รายการจากการค้นหา "{searchTerm}"</>
            ) : (
              <>แสดง {((currentPage - 1) * PATIENTS_PER_PAGE) + 1} ถึง {Math.min(currentPage * PATIENTS_PER_PAGE, totalPatients)} จากทั้งหมด {totalPatients} รายการ</>
            )}
          </p>
        </div>

        {/* Loading indicator for pagination */}
        {paginationLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-2"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {/* Patient Cards */}
        {!paginationLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {safePatientData.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        )}

        {/* Empty States */}
        {!paginationLoading && safePatientData.length === 0 && totalPatients > 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูลที่ค้นหา</h3>
            <p className="text-gray-500 mb-6">ลองเปลี่ยนคำค้นหาหรือเคลียร์การค้นหา</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
                fetchPatients(1, '');
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              เคลียร์การค้นหา
            </button>
          </div>
        )}

        {!paginationLoading && totalPatients === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีข้อมูลผู้รับบริการ</h3>
            <p className="text-gray-500 mb-6">เริ่มต้นด้วยการเพิ่มผู้รับบริการใหม่หรือ Import จากไฟล์ Excel</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleAddPatient}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มผู้รับบริการ
              </button>
              <button
                onClick={handleImportClick}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Excel
              </button>
            </div>
          </div>
        )}

        {/* Pagination - Keep bottom pagination for additional navigation */}
        {!paginationLoading && totalPages > 1 && (
          <div className="mt-8 bg-white border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-6">
              <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                แสดง {((currentPage - 1) * PATIENTS_PER_PAGE) + 1} ถึง {Math.min(currentPage * PATIENTS_PER_PAGE, totalPatients)} จากทั้งหมด {totalPatients} รายการ
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || paginationLoading}
                  className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={page === '...' || paginationLoading}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${page === currentPage
                      ? 'bg-blue-600 text-white'
                      : page === '...'
                        ? 'text-gray-400 cursor-default'
                        : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                      } ${paginationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || paginationLoading}
                  className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
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