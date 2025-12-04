import React, { useState, useEffect } from 'react';
import {
    Search, X, Edit2, Trash2, Eye, Calendar, User, Clock,
    FileText, Filter, ChevronLeft, ChevronRight, AlertCircle,
    Download, Share2, Plus, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { canEditreport, canDeleteReport } from '../utils/permissionUtils';

// API Configuration
const API_BASE_URL = 'https://api.thesenizens.com/api';

const createApiClient = () => {
    const getToken = () => localStorage.getItem('authToken');

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
        getReports: (params) => {
            const queryString = new URLSearchParams(params).toString();
            return fetchWithAuth(`/reports/multidisciplinary?${queryString}`);
        },

        getReportById: (id) =>
            fetchWithAuth(`/reports/multidisciplinary/${id}`),

        deleteReport: (id) =>
            fetchWithAuth(`/reports/multidisciplinary/${id}`, {
                method: 'DELETE',
            }),
    };
};

const api = createApiClient();

const useAuth = () => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    return { user };
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const thaiYear = date.getFullYear() + 543;
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${thaiYear}`;
};


// Filter Modal Component
function FilterModal({ visible, onClose, filters, onApplyFilters }) {
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleApply = () => {
        onApplyFilters(localFilters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters = {
            shift: '',
            startDate: '',
            endDate: '',
        };
        setLocalFilters(resetFilters);
        onApplyFilters(resetFilters);
        onClose();
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold">กรองข้อมูล</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Shift Filter */}
                    <div>
                        <label className="block text-sm font-medium mb-2">เวร</label>
                        <select
                            value={localFilters.shift}
                            onChange={(e) => setLocalFilters({ ...localFilters, shift: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">ทั้งหมด</option>
                            <option value="D">D (กลางวัน)</option>
                            <option value="E">E (เย็น)</option>
                            <option value="N">N (กลางคืน)</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium mb-2">วันที่เริ่มต้น</label>
                        <input
                            type="date"
                            value={localFilters.startDate}
                            onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">วันที่สิ้นสุด</label>
                        <input
                            type="date"
                            value={localFilters.endDate}
                            onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex gap-2 p-4 border-t">
                    <button
                        onClick={handleReset}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        รีเซ็ต
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        ค้นหา
                    </button>
                </div>
            </div>
        </div>
    );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ visible, onClose, onConfirm, report, isDeleting }) {
    if (!visible || !report) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                        <AlertCircle size={24} className="text-red-600" />
                    </div>

                    <h2 className="text-xl font-bold text-center mb-2">ยืนยันการลบรายงาน</h2>
                    <p className="text-gray-600 text-center mb-4">
                        คุณต้องการลบรายงานของผู้ป่วยนี้ใช่หรือไม่?
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">ชื่อผู้ป่วย:</span>
                                <span className="font-medium">{report.patient_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">HN:</span>
                                <span className="font-medium">{report.patient_hn}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">วันที่:</span>
                                <span className="font-medium">{formatDate(report.report_date)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">เวร:</span>
                                <span className="font-medium">{report.shift}</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-red-600 text-center mb-6">
                        ⚠️ การดำเนินการนี้ไม่สามารถย้อนกลับได้
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            ยกเลิก
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                        >
                            {isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบ'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main Component
export default function MultidisciplinaryReportList() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // States
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        shift: '',
        startDate: '',
        endDate: '',
    });
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReports, setTotalReports] = useState(0);
    const reportsPerPage = 10;

    useEffect(() => {
        loadReports();
    }, [currentPage, filters]);

    const loadReports = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: reportsPerPage,
                search: searchQuery,
                ...filters,
            };

            const response = await api.getReports(params);
            console.log('Load reports response:', response);
            if (response.success) {
                setReports(response.data || []);
                setTotalPages(response.pagination?.totalPages || 1);
                setTotalReports(response.pagination?.total || 0);
            }
        } catch (error) {
            console.error('Load reports error:', error);
            alert('ไม่สามารถโหลดข้อมูลรายงานได้');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        loadReports();
    };

    // ฟังก์ชันตรวจสอบสิทธิ์แก้ไข
    const checkEditPermission = (report) => {
        if (!user) return { canEdit: false, reason: 'ไม่พบข้อมูลผู้ใช้' };

        return canEditreport(report, user, {
            checkTime: true,
            checkCreator: true,
            checkRole: true,
            checkSameDay: true,
            hoursLimit: 24,
            allowedRoles: ['หัวหน้าพยาบาล แผนก IPD', 'admin']
        });
    };

    // ฟังก์ชันตรวจสอบสิทธิ์ลบ
    const checkDeletePermission = (report) => {
        if (!user) return { canDelete: false, reason: 'ไม่พบข้อมูลผู้ใช้' };

        return canDeleteReport(report, user, {
            checkTime: true,
            checkCreator: true,
            checkRole: true,
            hoursLimit: 2,
            allowedRoles: ['admin', 'หัวหน้าพยาบาล แผนก IPD']
        });
    };

    // จัดการคลิกปุ่มแก้ไข
    const handleEditClick = (report) => {
        const permission = checkEditPermission(report);

        if (!permission.canEdit) {
            alert(permission.reason);
            return;
        }

        navigate(`/multidisciplinary/edit/${report.report_id}`);
    };

    // จัดการคลิกปุ่มลบ
    const handleDeleteClick = (report) => {
        const permission = checkDeletePermission(report);

        if (!permission.canDelete) {
            alert(permission.reason);
            return;
        }

        setSelectedReport(report);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!selectedReport) return;

        setIsDeleting(true);
        try {
            await api.deleteReport(selectedReport.report_id);
            alert('ลบรายงานสำเร็จ');
            setShowDeleteModal(false);
            setSelectedReport(null);
            loadReports();
        } catch (error) {
            console.error('Delete error:', error);
            alert('ไม่สามารถลบรายงานได้');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (report) => {
        handleEditClick(report);
    };

    const handleView = (report) => {
        navigate(`/multidisciplinary/view/${report.report_id}`);
    };

    const getShiftLabel = (shift) => {
        switch (shift) {
            case 'D': return 'กลางวัน';
            case 'E': return 'เย็น';
            case 'N': return 'กลางคืน';
            default: return shift;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <FileText size={28} className="text-blue-600" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">จัดการรายงานสหวิชาชีพ</h1>
                                <p className="text-sm text-gray-600">Multidisciplinary Reports Management</p>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-2 bg-gray-50 border rounded-lg px-4 py-2">
                            <Search size={20} className="text-gray-500" />
                            <input
                                type="text"
                                className="flex-1 outline-none bg-transparent"
                                placeholder="ค้นหา HN, ชื่อผู้ป่วย, ห้อง..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            {searchQuery && (
                                <button onClick={() => { setSearchQuery(''); handleSearch(); }}>
                                    <X size={20} className="text-gray-500" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            ค้นหา
                        </button>
                        <button
                            onClick={() => setShowFilterModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            <Filter size={20} />
                            กรอง
                        </button>
                    </div>

                    {/* Active Filters */}
                    {(filters.shift || filters.startDate || filters.endDate) && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="text-sm text-gray-600">กรองโดย:</span>
                            {filters.shift && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                                    เวร {getShiftLabel(filters.shift)}
                                    <button onClick={() => setFilters({ ...filters, shift: '' })}>
                                        <X size={14} />
                                    </button>
                                </span>
                            )}
                            {filters.startDate && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                                    ตั้งแต่ {formatDate(filters.startDate)}
                                    <button onClick={() => setFilters({ ...filters, startDate: '' })}>
                                        <X size={14} />
                                    </button>
                                </span>
                            )}
                            {filters.endDate && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                                    ถึง {formatDate(filters.endDate)}
                                    <button onClick={() => setFilters({ ...filters, endDate: '' })}>
                                        <X size={14} />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Stats */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">รายงานทั้งหมด</p>
                            <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
                        </div>
                        <FileText size={48} className="text-blue-600 opacity-20" />
                    </div>
                </div>

                {/* Reports List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-16 text-center">
                        <FileText size={64} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-lg font-semibold text-gray-600 mb-2">ไม่พบรายงาน</p>
                        <p className="text-sm text-gray-500">
                            {searchQuery || filters.shift || filters.startDate || filters.endDate
                                ? 'ลองเปลี่ยนเงื่อนไขการค้นหา'
                                : 'เริ่มสร้างรายงานใหม่เพื่อเริ่มต้นใช้งาน'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reports.map((report) => {
                            const editPermission = checkEditPermission(report);
                            const deletePermission = checkDeletePermission(report);

                            return (
                                <div
                                    key={report.id}
                                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                    <User size={24} className="text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-gray-900">{report.patient_name}</h3>
                                                        {report.room_number && (
                                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                                                ห้อง {report.room_number}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                                                        <span>HN: {report.patient_hn}</span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={14} />
                                                            {formatDate(report.report_date)}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={14} />
                                                            เวร {getShiftLabel(report.shift)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {report.overall_condition}
                                                    </p>
                                                    {report.created_by && (
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            รายงานโดย: {report.created_by_name || `User ${report.created_by}`}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            {/* ปุ่มแก้ไข */}
                                            {editPermission.canEdit ? (
                                                <button
                                                    onClick={() => handleEditClick(report)}
                                                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition"
                                                    title="แก้ไข"
                                                >
                                                    <Edit2 size={18} className="text-blue-600" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => alert(editPermission.reason)}
                                                    className="p-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                                                    title={editPermission.reason}
                                                >
                                                    <Lock size={18} />
                                                </button>
                                            )}

                                            {/* ปุ่มลบ */}
                                            {deletePermission.canDelete ? (
                                                <button
                                                    onClick={() => handleDeleteClick(report)}
                                                    className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition"
                                                    title="ลบ"
                                                >
                                                    <Trash2 size={18} className="text-red-600" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => alert(deletePermission.reason)}
                                                    className="p-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                                                    title={deletePermission.reason}
                                                >
                                                    <Lock size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* แสดงสถานะล็อก */}
                                    {(!editPermission.canEdit || !deletePermission.canDelete) && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Lock size={12} />
                                                {!editPermission.canEdit && !deletePermission.canDelete
                                                    ? 'ล็อกการแก้ไขและลบ'
                                                    : !editPermission.canEdit
                                                        ? 'ล็อกการแก้ไข'
                                                        : 'ล็อกการลบ'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <p className="text-sm text-gray-600">
                            แสดง {(currentPage - 1) * reportsPerPage + 1} - {Math.min(currentPage * reportsPerPage, totalReports)} จาก {totalReports} รายการ
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={20} />
                                ก่อนหน้า
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 rounded-lg transition ${currentPage === pageNum
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ถัดไป
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <FilterModal
                visible={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                filters={filters}
                onApplyFilters={setFilters}
            />

            <DeleteConfirmModal
                visible={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedReport(null);
                }}
                onConfirm={handleDelete}
                report={selectedReport}
                isDeleting={isDeleting}
            />
        </div>
    );
}