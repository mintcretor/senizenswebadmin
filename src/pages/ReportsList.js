import React, { useState, useEffect } from 'react';
import { Search, FileText, Calendar, User, Download, Eye, ChevronRight, Filter, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// API Configuration
const API_BASE_URL = 'http://172.16.40.11:3001/api';

const createApiClient = () => {
  const getToken = () => {
    try {
      return localStorage.getItem('authToken');
    } catch {
      return null;
    }
  };
  
  const fetchWithAuth = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  };

  return {
    getAllReportsSummary: (date) =>
      fetchWithAuth(`/reports/summary?date=${date}`),
    
    getPatientReports: (patientId, date) =>
      fetchWithAuth(`/reports/patient/${patientId}?date=${date}`),
  };
};

const api = createApiClient();

const useAuth = () => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  return { user };
};

export default function ReportsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [availableRooms, setAvailableRooms] = useState([]);

  useEffect(() => {
    loadReports();
  }, [selectedDate]);

  useEffect(() => {
    filterReports();
  }, [searchQuery, filterType, selectedRoom, reports]);

  useEffect(() => {
    // Extract unique rooms from reports
    const rooms = [...new Set(reports
      .map(r => r.room_number)
      .filter(room => room && room !== '-')
    )].sort();
    setAvailableRooms(rooms);
  }, [reports]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAllReportsSummary(selectedDate);
      setReports(response.data || []);
    } catch (error) {
      console.error('Load reports error:', error);
      alert('ไม่สามารถโหลดรายงานได้');
    } finally {
      setIsLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    if (searchQuery) {
      filtered = filtered.filter(report => 
        report.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.hn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.room_number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(report => {
        if (filterType === 'multi') return report.has_multi_report;
        if (filterType === 'rehab') return report.has_rehab_report;
        return true;
      });
    }

    if (selectedRoom !== 'all') {
      filtered = filtered.filter(report => report.room_number === selectedRoom);
    }

    setFilteredReports(filtered);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const thaiYear = date.getFullYear() + 543;
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${thaiYear}`;
  };

  const handleViewReport = (patientHn) => {
    navigate(`/daily-report/${patientHn}`);
  };

  const getReportBadge = (report) => {
    const badges = [];
    if (report.has_multi_report) {
      badges.push(
        <span key="multi" className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
          สหวิชาชีพ
        </span>
      );
    }
    if (report.has_rehab_report) {
      badges.push(
        <span key="rehab" className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
          กายภาพ
        </span>
      );
    }
    return badges;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <FileText size={24} className="sm:w-7 sm:h-7 text-indigo-600" />
            <h1 className="text-base sm:text-xl font-bold text-gray-900">รายงานทั้งหมด</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={14} className="sm:w-4 sm:h-4 inline mr-2" />
                เลือกวันที่
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search size={14} className="sm:w-4 sm:h-4 inline mr-2" />
                ค้นหา
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ชื่อ, HN, หรือห้อง"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Home size={14} className="sm:w-4 sm:h-4 inline mr-2" />
                เลือกห้อง
              </label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
              >
                <option value="all">ทั้งหมด</option>
                {availableRooms.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter size={14} className="sm:w-4 sm:h-4 inline mr-2" />
                ประเภทรายงาน
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
              >
                <option value="all">ทั้งหมด</option>
                <option value="multi">สหวิชาชีพ</option>
                <option value="rehab">กายภาพ</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">กำลังโหลดรายงาน...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 flex flex-col items-center">
            <FileText size={48} className="sm:w-16 sm:h-16 text-gray-300" />
            <p className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-gray-600">ไม่พบรายงาน</p>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 text-center px-4">
              ไม่มีรายงานในวันที่ {formatDate(selectedDate)}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">วันที่: {formatDate(selectedDate)}</p>
                <p className="text-base sm:text-lg font-bold text-gray-900">
                  พบ {filteredReports.length} รายการ
                </p>
              </div>
              <div className="text-left sm:text-right text-xs sm:text-sm text-gray-600">
                <p>สหวิชาชีพ: {filteredReports.filter(r => r.has_multi_report).length} รายงาน</p>
                <p>กายภาพ: {filteredReports.filter(r => r.has_rehab_report).length} รายงาน</p>
              </div>
            </div>

            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div
                  key={report.patient_id}
                  className="bg-white rounded-xl shadow-sm p-3 sm:p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <User size={20} className="sm:w-6 sm:h-6 text-indigo-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900 text-sm sm:text-lg">
                          {report.patient_name}
                        </p>
                        <div className="flex gap-1 flex-wrap">
                          {getReportBadge(report)}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">
                        HN: {report.hn} | ห้อง: {report.room_number || '-'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        อัพเดทล่าสุด: {new Date(report.last_updated).toLocaleString('th-TH', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleViewReport(report.hn)}
                        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold rounded-lg border border-indigo-600 transition text-xs sm:text-base"
                      >
                        <Eye size={16} className="sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">ดูรายงาน</span>
                      </button>
                    </div>
                  </div>

                  {report.latest_notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">หมายเหตุล่าสุด:</p>
                      <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">
                        {report.latest_notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}