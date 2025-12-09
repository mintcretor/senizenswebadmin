import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Calendar, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { canEditRecord, canDeleteRecord } from '../utils/permissionUtils';

const ProcedureRecordList = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchText, setSearchText] = useState('');
    const [shiftFilter, setShiftFilter] = useState('all');
    const [roomFilter, setRoomFilter] = useState('all');
    const [availableRooms, setAvailableRooms] = useState([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        // โหลดข้อมูล user ปัจจุบัน
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUser(user);

        loadData();
    }, [startDate, endDate]);

    useEffect(() => {
        filterRecords();
    }, [records, searchText, shiftFilter, roomFilter]);

    useEffect(() => {
        if (records.length > 0) {
            extractAvailableRooms();
        }
    }, [records]);

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_BASE_URL}/procedure-records?startDate=${startDate}&endDate=${endDate}&limit=1000`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setRecords(result.data);
            } else {
                throw new Error(result.error || 'Failed to load data');
            }
        } catch (error) {
            console.error('Load error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const extractAvailableRooms = () => {
        const rooms = [...new Set(
            records
                .map(r => r.room_number)
                .filter(room => room && room !== '-' && room !== 'null' && room !== 'undefined' && room.trim() !== '')
        )].sort((a, b) => {
            const numA = parseInt(a) || 0;
            const numB = parseInt(b) || 0;
            return numA - numB;
        });
        setAvailableRooms(rooms);
    };

    const filterRecords = () => {
        let filtered = [...records];

        if (searchText) {
            filtered = filtered.filter(r =>
                r.hn?.toLowerCase().includes(searchText.toLowerCase()) ||
                r.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
                r.last_name?.toLowerCase().includes(searchText.toLowerCase()) ||
                r.service_number?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        if (shiftFilter !== 'all') {
            filtered = filtered.filter(r => r.shift === shiftFilter);
        }

        if (roomFilter !== 'all') {
            filtered = filtered.filter(r => r.room_number === roomFilter);
        }

        setFilteredRecords(filtered);
    };

    // ฟังก์ชันตรวจสอบสิทธิ์แก้ไข
    const checkEditPermission = (record) => {
        if (!currentUser) return { canEdit: false, reason: 'ไม่พบข้อมูลผู้ใช้' };

        return canEditRecord(record, currentUser, {
            checkTime: true,
            checkCreator: true,
            checkRole: true,
            checkSameDay: true, // เปิดใช้ตรวจสอบวันเดียวกัน
            hoursLimit: 24,
            allowedRoles :['หัวหน้าพยาบาล แผนก IPD', 'admin']
        });
    };

    // ฟังก์ชันตรวจสอบสิทธิ์ลบ
    const checkDeletePermission = (record) => {
        if (!currentUser) return { canDelete: false, reason: 'ไม่พบข้อมูลผู้ใช้' };

        return canDeleteRecord(record, currentUser, {
            checkTime: true,
            checkCreator: true,
            checkRole: true,
            hoursLimit: 24, // ลบได้แค่ 2 ชั่วโมง
            allowedRoles: ['admin', 'head_nurse']
        });
    };

    // จัดการคลิกปุ่มแก้ไข
    const handleEditClick = (record) => {
        const permission = checkEditPermission(record);

        if (!permission.canEdit) {
            alert(permission.reason);
            return;
        }

        navigate(`/ProcedureRecordEdit/${record.id}`);
    };

    // จัดการคลิกปุ่มลบ
    const handleDeleteClick = (record) => {
        const permission = checkDeletePermission(record);

        if (!permission.canDelete) {
            alert(permission.reason);
            return;
        }

        setDeleteTarget(record);
        setShowDeleteDialog(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            const response = await fetch(
                `${API_BASE_URL}/procedure-records/${deleteTarget.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            const result = await response.json();

            if (result.success) {
                alert('ลบบันทึกสำเร็จ');
                loadData();
            } else {
                alert('ไม่สามารถลบบันทึกได้');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('เกิดข้อผิดพลาดในการลบ');
        } finally {
            setShowDeleteDialog(false);
            setDeleteTarget(null);
        }
    };

    const resetFilters = () => {
        setSearchText('');
        setShiftFilter('all');
        setRoomFilter('all');
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate(new Date().toISOString().split('T')[0]);
    };

    const formatDateThai = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatTime = (timeString) => {
        if (!timeString) return '-';
        return timeString.slice(0, 5);
    };

    if (loading && records.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                        รายการบันทึกหัตถการพยาบาล
                    </h1>
                    <p className="text-gray-600">จัดการและแก้ไขบันทึกหัตถการ</p>

                        

                </div>
                

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-600 text-sm">
                            <strong>เกิดข้อผิดพลาด:</strong> {error}
                        </p>
                        <button
                            onClick={loadData}
                            className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
                        >
                            ลองใหม่อีกครั้ง
                        </button>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">วันที่เริ่มต้น</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full border rounded-lg p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">วันที่สิ้นสุด</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full border rounded-lg p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">เวร</label>
                            <select
                                value={shiftFilter}
                                onChange={(e) => setShiftFilter(e.target.value)}
                                className="w-full border rounded-lg p-2"
                            >
                                <option value="all">ทั้งหมด</option>
                                <option value="เช้า">เช้า</option>
                                <option value="บ่าย">บ่าย</option>
                                <option value="ดึก">ดึก</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                ห้อง {availableRooms.length > 0 && `(${availableRooms.length} ห้อง)`}
                            </label>
                            <select
                                value={roomFilter}
                                onChange={(e) => setRoomFilter(e.target.value)}
                                className="w-full border rounded-lg p-2"
                            >
                                <option value="all">ทั้งหมด</option>
                                {availableRooms.map((room, idx) => (
                                    <option key={idx} value={room}>
                                        ห้อง {room}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="ค้นหา HN, ชื่อ, Service Number..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                    </div>

                    {(searchText || shiftFilter !== 'all' || roomFilter !== 'all') && (
                        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
                            <span className="text-sm text-gray-600">กรองโดย:</span>

                            {searchText && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                    ค้นหา: "{searchText}"
                                </span>
                            )}

                            {shiftFilter !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                    เวร: {shiftFilter}
                                </span>
                            )}

                            {roomFilter !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                    ห้อง: {roomFilter}
                                </span>
                            )}

                            <button
                                onClick={resetFilters}
                                className="ml-auto text-xs text-red-600 hover:text-red-700 underline"
                            >
                                ล้างตัวกรอง
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <p className="text-sm text-gray-600">จำนวนบันทึก</p>
                        <p className="text-2xl font-bold text-blue-600">{filteredRecords.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <p className="text-sm text-gray-600">วันนี้</p>
                        <p className="text-2xl font-bold text-green-600">
                            {filteredRecords.filter(r => {
                                if (!r.record_date) return false;
                                const recordDate = r.record_date.split('T')[0];
                                const today = new Date().toISOString().split('T')[0];
                                return recordDate === today;
                            }).length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <p className="text-sm text-gray-600">เวรเช้า</p>
                        <p className="text-2xl font-bold text-purple-600">
                            {filteredRecords.filter(r => r.shift === 'เช้า').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <p className="text-sm text-gray-600">ห้องทั้งหมด</p>
                        <p className="text-2xl font-bold text-orange-600">{availableRooms.length}</p>
                    </div>
                </div>

                {/* Records List */}
                <div className="space-y-3">
                    {filteredRecords.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                            <p className="mb-2">ไม่พบข้อมูล</p>
                            {(searchText || shiftFilter !== 'all' || roomFilter !== 'all') && (
                                <button
                                    onClick={resetFilters}
                                    className="text-blue-600 hover:text-blue-700 text-sm underline"
                                >
                                    ล้างตัวกรองทั้งหมด
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredRecords.map((record) => {
                            const editPermission = checkEditPermission(record);
                            const deletePermission = checkDeletePermission(record);

                            return (
                                <div key={record.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <h3 className="font-semibold text-lg">
                                                        {record.first_name} {record.last_name}
                                                    </h3>
                                                    <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                                        {record.shift}
                                                    </span>
                                                    {record.room_number && record.room_number !== '-' && (
                                                        <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">
                                                            ห้อง {record.room_number}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    HN: {record.hn} | {record.service_number}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    <Calendar size={14} className="inline mr-1" />
                                                    {formatDateThai(record.record_date)} {formatTime(record.record_time)}
                                                </p>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                {/* ปุ่มแก้ไข */}
                                                {editPermission.canEdit ? (
                                                    <button
                                                        onClick={() => handleEditClick(record)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="แก้ไข"
                                                    >
                                                        <Edit size={20} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => alert(editPermission.reason)}
                                                        className="p-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                                                        title={editPermission.reason}
                                                    >
                                                        <Lock size={20} />
                                                    </button>
                                                )}

                                                {/* ปุ่มลบ */}
                                                {deletePermission.canDelete ? (
                                                    <button
                                                        onClick={() => handleDeleteClick(record)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="ลบ"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => alert(deletePermission.reason)}
                                                        className="p-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                                                        title={deletePermission.reason}
                                                    >
                                                        <Lock size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {record.note && (
                                            <div className="mt-2 p-2 bg-yellow-50 rounded">
                                                <p className="text-xs text-gray-700">
                                                    <strong>หมายเหตุ:</strong> {record.note}
                                                </p>
                                            </div>
                                        )}

                                        <div className="mt-3 pt-3 border-t flex justify-between items-center text-xs text-gray-500">
                                            <span>ผู้บันทึก: {record.created_by_name || 'ไม่ระบุ'}</span>
                                            {/* แสดงสถานะสิทธิ์ */}
                                            {(!editPermission.canEdit || !deletePermission.canDelete) && (
                                                <span className="text-gray-400 flex items-center gap-1">
                                                    <Lock size={12} />
                                                    ล็อกการแก้ไข
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="mt-4 text-sm text-gray-600 text-right">
                    แสดง {filteredRecords.length} รายการ จากทั้งหมด {records.length} รายการ
                </div>
            </div>

            {/* Delete Dialog */}
            {showDeleteDialog && deleteTarget && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">ยืนยันการลบ</h3>
                            <p className="text-gray-600 mb-2">คุณต้องการลบบันทึกหัตถการของ</p>
                            <p className="font-medium mb-4">
                                {deleteTarget.first_name} {deleteTarget.last_name} (HN: {deleteTarget.hn})
                            </p>
                            <p className="text-sm text-red-600 mb-6">การลบจะไม่สามารถกู้คืนได้</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteDialog(false);
                                        setDeleteTarget(null);
                                    }}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                    ลบ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProcedureRecordList;