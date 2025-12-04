import React, { useState, useEffect } from 'react';
import { Calendar, User, Plus, Edit2, Save, X, Loader, AlertCircle, Filter } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ShiftScheduleTable = () => {
    const [employees, setEmployees] = useState([]);
    const [scheduleData, setScheduleData] = useState({});
    const [shiftTypes, setShiftTypes] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // State สำหรับเดือนและปี
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [daysInMonth, setDaysInMonth] = useState(31);

    // State สำหรับ filter ตำแหน่งและ ward
    const [selectedRole, setSelectedRole] = useState('all');
    const [selectedWard, setSelectedWard] = useState('all');
    const [availableRoles, setAvailableRoles] = useState([]);
    const [availableWards, setAvailableWards] = useState([]);

    // คำนวณจำนวนวันในเดือน
    useEffect(() => {
        const days = new Date(currentYear, currentMonth, 0).getDate();
        setDaysInMonth(days);
    }, [currentMonth, currentYear]);

    // ดึงข้อมูลประเภทเวร
    useEffect(() => {
        const fetchShiftTypes = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/schedules/shift-types`);
                if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลประเภทเวรได้');
                
                const result = await response.json();
                console.log('Shift types:', result);
                
                if (result.success) {
                    setShiftTypes(result.data);
                }
            } catch (err) {
                console.error('Error fetching shift types:', err);
                // ใช้ข้อมูลเริ่มต้นถ้าดึงไม่ได้
                setShiftTypes([
                    { code: 'D', name: 'กลางวัน', color_class: 'bg-blue-100 text-blue-800', start_time: '07:00:00', end_time: '19:00:00' },
                    { code: 'N', name: 'กลางคืน', color_class: 'bg-purple-100 text-purple-800', start_time: '19:00:00', end_time: '07:00:00' },
                    { code: 'X', name: 'ว่าง', color_class: 'bg-gray-100 text-gray-600' },
                    { code: 'D/N', name: 'ทั้งวัน', color_class: 'bg-green-100 text-green-800', start_time: '07:00:00', end_time: '07:00:00' },
                    { code: 'VAC', name: 'ลา', color_class: 'bg-yellow-100 text-yellow-800' },
                ]);
            }
        };

        fetchShiftTypes();
    }, []);

    // ดึงข้อมูลพนักงานและตารางเวร
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // ดึงข้อมูลพนักงาน
                const employeesResponse = await fetch(`${API_BASE_URL}/users/nurse`);
                if (!employeesResponse.ok) throw new Error('ไม่สามารถดึงข้อมูลพนักงานได้');
                
                const employeesData = await employeesResponse.json();
                console.log('Employees data:', employeesData);
                setEmployees(employeesData);

                // สร้างรายการตำแหน่งและ ward ที่มี
                const roles = [...new Set(employeesData.map(emp => emp.role_id).filter(Boolean))];
                const wards = [...new Set(employeesData.map(emp => emp.ward).filter(Boolean))];
                setAvailableRoles(roles);
                setAvailableWards(wards);

                // ดึงตารางเวร
                const scheduleResponse = await fetch(
                    `${API_BASE_URL}/schedules/monthly?month=${currentMonth}&year=${currentYear}`
                );
                
                console.log('Fetching schedule:', `${API_BASE_URL}/schedules/monthly?month=${currentMonth}&year=${currentYear}`);

                if (!scheduleResponse.ok) throw new Error('ไม่สามารถดึงข้อมูลตารางเวรได้');
                
                const scheduleResult = await scheduleResponse.json();
                console.log('Schedule result:', scheduleResult);
                
                if (scheduleResult.success && scheduleResult.data) {
                    // แปลงข้อมูลจาก API เป็นรูปแบบที่ใช้งาน
                    const formattedSchedule = {};
                    
                    scheduleResult.data.forEach(userSchedule => {
                        // ใช้ user_id ที่ถูกต้อง
                        const userId = userSchedule.user_id;
                        formattedSchedule[userId] = {};
                        
                        // ถ้ามี schedules ให้ใส่ข้อมูล
                        if (userSchedule.schedules) {
                            Object.keys(userSchedule.schedules).forEach(day => {
                                formattedSchedule[userId][parseInt(day)] = 
                                    userSchedule.schedules[day].shift_code;
                            });
                        }
                        
                        // เติมวันที่ไม่มีข้อมูลด้วย 'X'
                        for (let day = 1; day <= daysInMonth; day++) {
                            if (!formattedSchedule[userId][day]) {
                                formattedSchedule[userId][day] = 'X';
                            }
                        }
                    });
                    
                    // เติมข้อมูลพนักงานที่ยังไม่มีในตาราง
                    employeesData.forEach(emp => {
                        // ใช้ user_id แทน id
                        const userId = emp.user_id;
                        if (!formattedSchedule[userId]) {
                            formattedSchedule[userId] = {};
                            for (let day = 1; day <= daysInMonth; day++) {
                                formattedSchedule[userId][day] = 'X';
                            }
                        }
                    });
                    
                    console.log('Formatted schedule:', formattedSchedule);
                    setScheduleData(formattedSchedule);
                } else {
                    // ถ้าไม่มีข้อมูล สร้างตารางเปล่า
                    initializeEmptySchedule(employeesData);
                }

            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
                
                // ใช้ข้อมูลตัวอย่างถ้าดึงไม่ได้
                const sampleEmployees = [
                    { user_id: 1, first_name: 'แนงมีสิตา', last_name: 'วอลอัมคา', role_id: 'PA', ward: 'Ward A' },
                    { user_id: 2, first_name: 'พัชรี', last_name: 'ภรวีธิช', role_id: 'NA', ward: 'Ward B' },
                    { user_id: 3, first_name: 'อธิตา', last_name: 'มนต์ศิล', role_id: 'RN', ward: null },
                ];
                setEmployees(sampleEmployees);
                setAvailableRoles(['PA', 'NA', 'RN']);
                setAvailableWards(['Ward A', 'Ward B']);
                initializeEmptySchedule(sampleEmployees);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentMonth, currentYear, daysInMonth]);

    // สร้างตารางเปล่า
    const initializeEmptySchedule = (employeeList) => {
        const emptySchedule = {};
        employeeList.forEach(emp => {
            // ใช้ user_id แทน id
            const userId = emp.user_id;
            emptySchedule[userId] = {};
            for (let day = 1; day <= daysInMonth; day++) {
                emptySchedule[userId][day] = 'X';
            }
        });
        setScheduleData(emptySchedule);
    };

    // กรองพนักงานตามตำแหน่งและ ward
    const getFilteredEmployees = () => {
        let filtered = employees;

        // กรองตามตำแหน่ง
        if (selectedRole !== 'all') {
            filtered = filtered.filter(emp => emp.role_id === selectedRole);
        }

        // กรองตาม ward (เฉพาะ PA และ NA)
        if ((selectedRole === 'PA' || selectedRole === 'NA') && selectedWard !== 'all') {
            filtered = filtered.filter(emp => emp.ward === selectedWard);
        }

        return filtered;
    };

    // ตรวจสอบว่าควรแสดง Ward selector หรือไม่
    const shouldShowWardSelector = () => {
        return selectedRole === 'PA' || selectedRole === 'NA';
    };

    // Reset ward เมื่อเปลี่ยนตำแหน่งที่ไม่ใช่ PA/NA
    useEffect(() => {
        if (!shouldShowWardSelector()) {
            setSelectedWard('all');
        }
    }, [selectedRole]);

    // อัพเดทเวร
    const updateShift = (empId, day, value) => {
        setScheduleData(prev => ({
            ...prev,
            [empId]: {
                ...prev[empId],
                [day]: value
            }
        }));
    };

    // บันทึกตารางเวร
    const saveSchedule = async () => {
        try {
            setIsSaving(true);
            setError(null);
            setSaveSuccess(false);

            // เตรียมข้อมูลสำหรับส่ง API
            const schedules = [];
            
            Object.keys(scheduleData).forEach(userId => {
                Object.keys(scheduleData[userId]).forEach(day => {
                    const scheduleDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    schedules.push({
                        user_id: parseInt(userId),
                        schedule_date: scheduleDate,
                        shift_type_code: scheduleData[userId][day]
                    });
                });
            });

            console.log('Saving schedules:', schedules.slice(0, 5)); // ดู 5 รายการแรก

            const response = await fetch(`${API_BASE_URL}/schedules/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ schedules })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถบันทึกตารางเวรได้');
            }

            const result = await response.json();
            console.log('Save result:', result);
            
            if (result.success) {
                setSaveSuccess(true);
                setIsEditMode(false);
                
                // ซ่อนข้อความสำเร็จหลัง 3 วินาที
                setTimeout(() => {
                    setSaveSuccess(false);
                }, 3000);
            }

        } catch (err) {
            console.error('Error saving schedule:', err);
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // นับจำนวนเวร
    const getDayCount = (empId, shiftCode) => {
        const schedule = scheduleData[empId] || {};
        return Object.values(schedule).filter(s => s === shiftCode).length;
    };

    // เปลี่ยนเดือน
    const changeMonth = (increment) => {
        let newMonth = currentMonth + increment;
        let newYear = currentYear;
        
        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    // แสดงชื่อเดือนภาษาไทย
    const getThaiMonth = (month) => {
        const months = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        return months[month - 1];
    };

    // Format เวลา
    const formatTime = (time) => {
        if (!time) return '';
        // ถ้าเป็น format HH:MM:SS ให้ตัดเอาแค่ HH:MM
        return time.substring(0, 5);
    };

    const filteredEmployees = getFilteredEmployees();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-600 p-3 rounded-lg">
                                <Calendar className="text-white" size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">ตารางเวรพนักงาน</h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <button
                                        onClick={() => changeMonth(-1)}
                                        disabled={isLoading}
                                        className="text-gray-600 hover:text-indigo-600 font-semibold disabled:opacity-50"
                                    >
                                        ← เดือนก่อน
                                    </button>
                                    <p className="text-gray-600 font-semibold">
                                        {getThaiMonth(currentMonth)} {currentYear + 543}
                                    </p>
                                    <button
                                        onClick={() => changeMonth(1)}
                                        disabled={isLoading}
                                        className="text-gray-600 hover:text-indigo-600 font-semibold disabled:opacity-50"
                                    >
                                        เดือนถัดไป →
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={isEditMode ? saveSchedule : () => setIsEditMode(true)}
                            disabled={isLoading || isSaving}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                                isEditMode
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isSaving ? (
                                <>
                                    <Loader size={18} className="inline mr-2 animate-spin" />
                                    กำลังบันทึก...
                                </>
                            ) : isEditMode ? (
                                <>
                                    <Save size={18} className="inline mr-2" />
                                    บันทึก
                                </>
                            ) : (
                                <>
                                    <Edit2 size={18} className="inline mr-2" />
                                    แก้ไข
                                </>
                            )}
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                            <Filter size={20} className="text-indigo-600" />
                            <h3 className="font-semibold text-gray-700">กรองข้อมูล</h3>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {/* ตัวเลือกตำแหน่ง */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ตำแหน่ง
                                </label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="all">ทั้งหมด</option>
                                    {availableRoles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>

                            {/* ตัวเลือก Ward (แสดงเฉพาะ PA และ NA) */}
                            {shouldShowWardSelector() && (
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ward
                                    </label>
                                    <select
                                        value={selectedWard}
                                        onChange={(e) => setSelectedWard(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="all">ทั้งหมด</option>
                                        {availableWards.map(ward => (
                                            <option key={ward} value={ward}>{ward}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* แสดงจำนวนพนักงานที่กรอง */}
                            <div className="flex items-end">
                                <div className="bg-indigo-100 px-4 py-2 rounded-lg">
                                    <div className="text-sm text-indigo-600 font-medium">
                                        พบ {filteredEmployees.length} คน
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shift Legend */}
                    <div className="mt-6 flex flex-wrap gap-3">
                        {shiftTypes.map(shift => (
                            <div key={shift.code} className={`${shift.color_class} px-4 py-2 rounded-lg flex items-center gap-2`}>
                                <span className="font-bold">{shift.code}</span>
                                <span className="text-sm">
                                    = {shift.name} 
                                    {shift.start_time && ` (${formatTime(shift.start_time)}-${formatTime(shift.end_time)})`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Success Message */}
                {saveSuccess && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-green-700 font-semibold">บันทึกตารางเวรสำเร็จ!</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                        <Loader className="animate-spin mx-auto mb-4 text-indigo-600" size={48} />
                        <p className="text-gray-600 text-lg">กำลังโหลดข้อมูล...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                        <div className="flex items-center">
                            <AlertCircle className="text-red-500 mr-3" size={24} />
                            <div>
                                <p className="text-red-700 font-semibold">เกิดข้อผิดพลาด</p>
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* No Data Message */}
                {!isLoading && filteredEmployees.length === 0 && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded">
                        <div className="flex items-center">
                            <AlertCircle className="text-yellow-500 mr-3" size={24} />
                            <div>
                                <p className="text-yellow-700 font-semibold">ไม่พบข้อมูล</p>
                                <p className="text-yellow-600 text-sm">
                                    ไม่พบพนักงานตามเงื่อนไขที่เลือก กรุณาเลือกตัวกรองอื่น
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content - Only show when not loading */}
                {!isLoading && filteredEmployees.length > 0 && (
                    <>
                        {/* Schedule Table */}
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-indigo-600 text-white">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold w-48 sticky left-0 bg-indigo-600 z-10">
                                                <div className="flex items-center gap-2">
                                                    <User size={18} />
                                                    ชื่อ - นามสกุล
                                                </div>
                                            </th>
                                            <th className="px-3 py-3 text-center font-semibold w-24">ตำแหน่ง</th>
                                            {shouldShowWardSelector() && (
                                                <th className="px-3 py-3 text-center font-semibold w-24">Ward</th>
                                            )}
                                            {[...Array(daysInMonth)].map((_, i) => (
                                                <th key={i + 1} className="px-2 py-3 text-center font-semibold w-12 text-xs">
                                                    {i + 1}
                                                </th>
                                            ))}
                                            <th className="px-3 py-3 text-center font-semibold w-16 bg-indigo-700">OT</th>
                                            <th className="px-3 py-3 text-center font-semibold w-16 bg-indigo-700">รวม</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredEmployees.map((emp, idx) => {
                                            const userId = emp.user_id;
                                            return (
                                                <tr key={userId} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                    <td 
                                                        className="px-4 py-3 font-medium text-gray-800 sticky left-0 z-10" 
                                                        style={{ backgroundColor: idx % 2 === 0 ? '#f9fafb' : 'white' }}
                                                    >
                                                        {emp.first_name} {emp.last_name}
                                                    </td>
                                                    <td className="px-3 py-3 text-center text-sm text-gray-600">
                                                        {emp.role_id || '-'}
                                                    </td>
                                                    {shouldShowWardSelector() && (
                                                        <td className="px-3 py-3 text-center text-sm text-gray-600">
                                                            {emp.ward || '-'}
                                                        </td>
                                                    )}
                                                    {[...Array(daysInMonth)].map((_, day) => {
                                                        const dayNum = day + 1;
                                                        const shift = scheduleData[userId]?.[dayNum] || 'X';
                                                        const shiftInfo = shiftTypes.find(s => s.code === shift) || 
                                                            { code: 'X', color_class: 'bg-gray-100 text-gray-600' };

                                                        return (
                                                            <td key={dayNum} className="px-1 py-2 text-center">
                                                                {isEditMode ? (
                                                                    <select
                                                                        value={shift}
                                                                        onChange={(e) => updateShift(userId, dayNum, e.target.value)}
                                                                        className="w-full px-2 py-1 text-sm font-bold rounded border border-gray-300 cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                                        style={{
                                                                            minWidth: '60px',
                                                                            backgroundColor: shiftInfo.color_class.includes('bg-blue') ? '#dbeafe' :
                                                                                           shiftInfo.color_class.includes('bg-purple') ? '#f3e8ff' :
                                                                                           shiftInfo.color_class.includes('bg-green') ? '#dcfce7' :
                                                                                           shiftInfo.color_class.includes('bg-yellow') ? '#fef9c3' :
                                                                                           '#f3f4f6',
                                                                            color: '#111827'
                                                                        }}
                                                                    >
                                                                        {shiftTypes.map(s => (
                                                                            <option 
                                                                                key={s.code} 
                                                                                value={s.code}
                                                                                className="bg-white text-gray-900 font-semibold py-2"
                                                                            >
                                                                                {s.code}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                ) : (
                                                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${shiftInfo.color_class}`}>
                                                                        {shift}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="px-3 py-3 text-center font-bold text-gray-700 bg-yellow-50">
                                                        {getDayCount(userId, 'D/N')}
                                                    </td>
                                                    <td className="px-3 py-3 text-center font-bold text-indigo-700 bg-indigo-50">
                                                        {daysInMonth - getDayCount(userId, 'X') - getDayCount(userId, 'VAC')}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                            {shiftTypes.slice(0, 4).map(shift => {
                                const total = filteredEmployees.reduce((sum, emp) => 
                                    sum + getDayCount(emp.user_id, shift.code), 0
                                );
                                return (
                                    <div key={shift.code} className={`${shift.color_class} p-4 rounded-lg shadow`}>
                                        <div className="text-2xl font-bold">{total}</div>
                                        <div className="text-sm font-semibold">วัน{shift.name}ทั้งหมด</div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ShiftScheduleTable;