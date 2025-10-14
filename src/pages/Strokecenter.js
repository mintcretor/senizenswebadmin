import React, { useState, useEffect } from 'react';
import { Search, Users, FileText, AlertCircle, Menu, RefreshCw, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VNPatientList() {
  const navigate = useNavigate();
  
  // State declarations
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

      // Build query parameters
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      
      const response = await fetch(
        `${API_BASE_URL}/service-registrations?patientType=AN&departmentId=STROKE&page=${page}&limit=${PATIENTS_PER_PAGE}${searchParam}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.success && data.data && data.pagination) {
        setPatientData(data.data);
        setTotalPatients(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(page);
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('ไม่สามารถโหลดข้อมูลผู้รับบริการได้: ' + error.message);
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
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

  useEffect(() => {
    fetchPatients(1, '');
  }, []);

  const handleViewDetails = (patient) => {
    navigate(`/patient-details/${patient.patient_id}`);
  };

  const handleAddAnVn = (patient) => {
    navigate(`/an-vn/add/${patient.patient_id}`, {
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
                src={patient.profile_image || patientImageUrl}
                alt="รูปภาพคนไข้"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-gray-500 font-mono">HN: {patient.hn}</p>
                  <span className="text-gray-300">|</span>
                  <p className="text-xs text-blue-600 font-mono font-semibold">AN: {patient.service_number}</p>
                </div>
                <h3
                  className="font-semibold text-gray-900 text-base sm:text-lg leading-tight truncate hover:text-blue-600 transition-colors cursor-pointer"
                  title={fullName}
                  onClick={() => handleViewDetails(patient)}
                >
                  {fullName}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                  <span>อายุ: {patient.age || '-'} ปี</span>
                  <span>ห้อง: {patient.room_number || 'ยังไม่ได้จัดห้อง'}</span>
                  {patient.bed_number && <span>เตียง: {patient.bed_number}</span>}
                </div>
                {patient.drug_intolerance && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      แพ้ยา: {patient.drug_intolerance}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(patient);
                  }}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  title="ดูรายละเอียด"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  ดูรายละเอียด
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
             <button
              onClick={() => navigate('/an-vn/add/')}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl p-6 flex items-center justify-center space-x-3 transition-colors"
            >
              <Users size={24} />
              <span className="font-medium">เปิดเลข AN</span>
            </button>
            <div className="flex items-center space-x-3">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                รายชื่อผู้ใช้บริการ (ศูนย์ฟื้นฟูผู้หลอดเลือดและสมอง)
              </h1>
              {error && (
                <div className="flex items-center text-yellow-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  เกิดข้อผิดพลาด
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
              placeholder="ค้นหา ชื่อ นามสกุล, HN หรือ AN"
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
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 sm:px-6">
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
              <PatientCard key={patient.registration_id} patient={patient} />
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
            <p className="text-gray-500 mb-6">ยังไม่มีผู้รับบริการประเภท AN ในศูนย์ฟื้นฟูผู้หลอดเลือดและสมอง</p>
          </div>
        )}

        {/* Pagination - Bottom */}
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
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      page === currentPage
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
    </div>
  );
}