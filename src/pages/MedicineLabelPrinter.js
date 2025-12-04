import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Printer, User, Calendar, Pill, X, Check, Building, Home, ChevronRight, Search, Filter, Clock, AlertCircle, Edit2, Save } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.thesenizens.com/';

const MedicineLabelPrinter = () => {
  // States
  const [wards, setWards] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [residents, setResidents] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedResident, setSelectedResident] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [editedSchedules, setEditedSchedules] = useState({}); // เก็บข้อมูลที่แก้ไข
  const [editingScheduleId, setEditingScheduleId] = useState(null); // กำลังแก้ไข schedule ไหน
  const [loading, setLoading] = useState(false);
  const [printDate, setPrintDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [medicineSearchTerm, setMedicineSearchTerm] = useState(''); // ค้นหายา
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const printRef = useRef();

  // Fetch wards on component mount
  useEffect(() => {
    fetchWards();
  }, []);

  // Fetch rooms when ward is selected
  useEffect(() => {
    if (selectedWard) {
      fetchRooms(selectedWard.ward_id);
      setSelectedRoom(null);
      setSelectedResident(null);
      setResidents([]);
    }
  }, [selectedWard]);

  // Fetch residents when room is selected
  useEffect(() => {
    if (selectedRoom) {
      console.log('Selected room changed:', selectedRoom);
      fetchResidents(selectedRoom.room_number);
      setSelectedResident(null);
    }
  }, [selectedRoom]);

  // Fetch schedules when resident is selected
  useEffect(() => {
    console.log('Selected resident changed:', selectedResident);
    if (selectedResident) {
      fetchSchedules(selectedResident.patient_id);
    }
  }, [selectedResident, printDate, timeSlot]);

  // API Calls
  const fetchWards = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ward?is_active=true`);
      const data = await response.json();
      console.log('Wards data:', data);
      setWards(data.data);
    } catch (error) {
      console.error('Error fetching wards:', error);
      alert('ไม่สามารถโหลดข้อมูลวอร์ดได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (wardId) => {
    console.log('Fetching rooms for ward ID:', wardId);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ward/rooms?ward_id=${wardId}`);
      const data = await response.json();
      console.log('Rooms data:', data);
      setRooms(data.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      alert('ไม่สามารถโหลดข้อมูลห้องได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchResidents = async (roomId) => {
    console.log('Fetching residents for room ID:', roomId);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ward/residents?room_id=${roomId}&is_active=true`);
      const data = await response.json();
      console.log('Residents data:', data);
      setResidents(data.data);
    } catch (error) {
      console.error('Error fetching residents:', error);
      alert('ไม่สามารถโหลดข้อมูลผู้สูงอายุได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async (residentId) => {
    console.log('Fetching schedules for resident ID:', residentId);
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/ward/medicine-schedules?resident_id=${residentId}&is_active=true`
      );
      const data = await response.json();
      console.log('Schedules data:', data);
      // Filter by time slot if selected
      let filtered = data.data;
      if (timeSlot !== 'all') {
        filtered = data.data.filter(schedule => {
          const timeField = `time_${timeSlot}`;
          return schedule[timeField] !== null;
        });
      }

      setSchedules(filtered);
      setSelectedSchedules([]);
      setEditedSchedules({}); // รีเซ็ตข้อมูลที่แก้ไข
    } catch (error) {
      console.error('Error fetching schedules:', error);
      alert('ไม่สามารถโหลดข้อมูลตารางยาได้');
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับเริ่มแก้ไข schedule
  const startEditingSchedule = useCallback((scheduleId) => {
    const schedule = schedules.find(s => s.schedule_id === scheduleId);
    if (schedule) {
      setEditedSchedules(prev => {
        if (!prev[scheduleId]) {
          return {
            ...prev,
            [scheduleId]: {
              dosage_instruction: schedule.dosage_instruction || '',
              frequency: schedule.frequency || '',
              time_morning: schedule.time_morning || '',
              time_noon: schedule.time_noon || '',
              time_evening: schedule.time_evening || '',
              time_bedtime: schedule.time_bedtime || '',
              before_after_meal: schedule.before_after_meal || '',
              special_instruction: schedule.special_instruction || ''
            }
          };
        }
        return prev;
      });
      setEditingScheduleId(scheduleId);
    }
  }, [schedules]);

  // ฟังก์ชันสำหรับบันทึกการแก้ไข
  const saveScheduleEdit = (scheduleId) => {
    setEditingScheduleId(null);
  };

  // ฟังก์ชันสำหรับยกเลิกการแก้ไข
  const cancelScheduleEdit = useCallback((scheduleId) => {
    setEditedSchedules(prev => {
      const newEdited = { ...prev };
      delete newEdited[scheduleId];
      return newEdited;
    });
    setEditingScheduleId(null);
  }, []);
  // ฟังก์ชันสำหรับอัพเดทค่าที่แก้ไข
  const updateEditedSchedule = useCallback((scheduleId, field, value) => {
    setEditedSchedules(prev => ({
      ...prev,
      [scheduleId]: {
        ...(prev[scheduleId] || {}),
        [field]: value
      }
    }));
  }, []);

  // ฟังก์ชันสำหรับดึงข้อมูลที่จะใช้แสดงผล (ถ้ามีการแก้ไขใช้ของแก้ไข ไม่งั้นใช้ของเดิม)
  const getScheduleData = (schedule) => {
    return editedSchedules[schedule.schedule_id] || schedule;
  };

  // Toggle schedule selection
  const toggleScheduleSelection = (scheduleId) => {
    setSelectedSchedules(prev =>
      prev.includes(scheduleId)
        ? prev.filter(id => id !== scheduleId)
        : [...prev, scheduleId]
    );
  };

  // Select all schedules
  const selectAllSchedules = () => {
    const filteredIds = filteredSchedules.map(s => s.schedule_id);
    const allFilteredSelected = filteredIds.every(id => selectedSchedules.includes(id));

    if (allFilteredSelected) {
      // ยกเลิกการเลือกยาที่ถูกกรอง
      setSelectedSchedules(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // เลือกยาที่ถูกกรองทั้งหมด
      setSelectedSchedules(prev => {
        const newSelected = [...prev];
        filteredIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    }
  };

  // Get time slot label
  const getTimeSlotLabel = (schedule) => {
    const scheduleData = getScheduleData(schedule);
    const times = [];
    if (scheduleData.time_morning) times.push(`เช้า ${scheduleData.time_morning}`);
    if (scheduleData.time_noon) times.push(`เที่ยง ${scheduleData.time_noon}`);
    if (scheduleData.time_evening) times.push(`เย็น ${scheduleData.time_evening}`);
    if (scheduleData.time_bedtime) times.push(`ก่อนนอน ${scheduleData.time_bedtime}`);
    return times.join(', ') || '-';
  };

  // Print function
const handlePrint = async () => {
  if (selectedSchedules.length === 0) {
    alert('กรุณาเลือกยาที่ต้องการพิมพ์');
    return;
  }

  if (editingScheduleId !== null) {
    alert('กรุณาบันทึกหรือยกเลิกการแก้ไขก่อนพิมพ์');
    return;
  }

  const ImageUrl = window.location.origin + '/images/logo.png';

  const labelsHTML = schedulesToPrint.map((schedule) => {
    const scheduleData = getScheduleData(schedule);
    const currentDate = new Date(printDate);
    const dateStr = currentDate.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });

    return `
      <div class="page">
        <div class="header">
          <div class="header-left">
            <img src="${ImageUrl}" alt="Logo" crossorigin="anonymous" />
            <div class="clinic-info">
              <div class="clinic-name">ศูนย์เวชศาสตร์ฟื้นฟูหลอดเลือดสมอง เดอะ ซีนิเซ่นส์</div>
              <div class="license">( The Senizens Stroke Reha Center ) เลขที่ใบอนุญาต 10101005964</div>
            </div>
          </div>
          <div class="date"><strong>วันที่:</strong> ${dateStr}</div>
        </div>
        
        <div class="content">
          <div class="patient"><strong>${selectedResident.patient_name}</strong> ${selectedResident.hn}</div>
          <div class="medicine"><strong>${schedule.medicine_name}</strong></div>
          <div class="info-row">
            
            <span>${scheduleData.dosage_instruction || '-'} ${scheduleData.frequency || ''}</span>
          </div>
          <div class="info-row">
            
            <span>${scheduleData.before_after_meal || '-'}</span>
          </div>
          ${scheduleData.special_instruction ? `
            <div class="special">
              <span class="label">หมายเหตุ:</span>
              <span>${scheduleData.special_instruction}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="footer">วอร์ด ${selectedWard.floor} ห้อง ${selectedRoom.room_number}</div>
      </div>
    `;
  }).join('');

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>พิมพ์ฉลากยา</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @page {
          size: 96mm 46mm;
          margin: 0;
        }
        
        html, body {
          width: 96mm;
          height: 46mm;
          margin: 0;
          padding: 0;
          font-family: 'Sarabun', 'Tahoma', 'Arial', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
        
        .page {
          width: 96mm;
          height: 46mm;
          padding: 1mm 2mm;
          page-break-after: always;
          position: relative;
          border: 1px solid #000;
          display: flex;
          flex-direction: column;
          background: white;
        }
        
        .page:last-child {
          page-break-after: auto;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5mm;
          padding-bottom: 1mm;
          border-bottom: 1px dotted #666;
          flex-shrink: 0;
        }
        
        .header-left {
          display: flex;
          gap: 2mm;
          align-items: center;
          flex: 1;
        }
        
        .header img {
          width: 10mm;
          height: 8mm;
          object-fit: contain;
          flex-shrink: 0;
          display: block;
        }
        
        .clinic-info {
          flex: 1;
        }
        
        .clinic-name {
          font-size: 10px;
          font-weight: bold;
          line-height: 1.3;
          margin-bottom: 0.5mm;
          color: #000;
        }
        
        .license {
          font-size: 7px;
          line-height: 1.3;
          color: #000;
        }
        
        .date {
          font-size: 10px;
          white-space: nowrap;
          flex-shrink: 0;
          color: #000;
        }
        
        .content {
          flex: 1;
          overflow: visible;
        }
        
        .patient {
          font-size: 12px;
          margin-bottom: 1.5mm;
          line-height: 1.3;
          color: #000;
        }
        
        .medicine {
          font-size: 12px;
          margin-bottom: 1.5mm;
          line-height: 1.3;
          color: #000;
        }
        
        .info-row {
          font-size: 11px;
          margin-bottom: 1mm;
          line-height: 1.3;
          color: #000;
        }
        
        .label {
          font-weight: normal;
          color: #000;
        }
        
        .special {
          font-size: 11px;
          margin-top: 1mm;
          padding-left: 2mm;
          line-height: 1.3;
          color: #000;
        }
        
        .footer {
          font-size: 11px;
          padding-top: 1mm;
          border-top: 1px solid #666;
          flex-shrink: 0;
          line-height: 1.3;
          color: #000;
        }
        
        strong {
          font-weight: bold;
        }
        
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          html, body {
            width: 96mm !important;
            height: 46mm !important;
          }
          
          .page {
            width: 96mm !important;
            height: 46mm !important;
          }
          
          body {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          img {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      </style>
    </head>
    <body>${labelsHTML}</body>
    </html>
  `);

  printWindow.document.close();
  
  printWindow.onload = function() {
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  };
};
  // Reset selection
  const handleReset = () => {
    setSelectedWard(null);
    setSelectedRoom(null);
    setSelectedResident(null);
    setRooms([]);
    setResidents([]);
    setSchedules([]);
    setSelectedSchedules([]);
    setEditedSchedules({});
    setSearchTerm('');
  };

  // Filter residents by search term
  const filteredResidents = React.useMemo(() =>
    residents.filter(resident =>
      resident.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [residents, searchTerm]
  );

  // Filter schedules by medicine search term
  // Filter schedules by medicine search term
  const filteredSchedules = React.useMemo(() =>
    schedules.filter(schedule => {
      if (!medicineSearchTerm) return true;

      const searchLower = medicineSearchTerm.toLowerCase();
      // ใช้ข้อมูลจาก schedule เดิมในการค้นหา ไม่ใช้ editedSchedules

      return (
        schedule.medicine_name?.toLowerCase().includes(searchLower) ||
        schedule.medicine_code?.toLowerCase().includes(searchLower) ||
        schedule.dosage_instruction?.toLowerCase().includes(searchLower) ||
        schedule.frequency?.toLowerCase().includes(searchLower) ||
        schedule.before_after_meal?.toLowerCase().includes(searchLower) ||
        schedule.special_instruction?.toLowerCase().includes(searchLower)
      );
    }), [schedules, medicineSearchTerm]  // ลบ editedSchedules ออก
  );

  // Selected schedules for printing
  const schedulesToPrint = schedules.filter(s =>
    selectedSchedules.includes(s.schedule_id)
  );

  // Get time slot badge color
  const getTimeSlotBadge = (slot) => {
    const colors = {
      morning: 'bg-amber-100 text-amber-800 border-amber-200',
      noon: 'bg-orange-100 text-orange-800 border-orange-200',
      evening: 'bg-purple-100 text-purple-800 border-purple-200',
      bedtime: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[slot] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Current step tracker
  const getCurrentStep = () => {
    if (!selectedWard) return 1;
    if (!selectedRoom) return 2;
    if (!selectedResident) return 3;
    return 4;
  };

  const currentStep = getCurrentStep();

  // Component สำหรับแสดงและแก้ไขข้อมูล schedule
  const ScheduleCard = ({ schedule }) => {
    const isSelected = selectedSchedules.includes(schedule.schedule_id);
    const isEditing = editingScheduleId === schedule.schedule_id;
    const scheduleData = editedSchedules[schedule.schedule_id] || schedule;

    // เพิ่ม local state สำหรับเก็บค่าขณะกำลังพิมพ์
    const [localData, setLocalData] = React.useState(scheduleData);

    // Sync local data กับ scheduleData เมื่อเริ่มแก้ไขหรือเปลี่ยน schedule
    React.useEffect(() => {
      setLocalData(scheduleData);
    }, [isEditing, schedule.schedule_id]);

    const handleToggleSelect = React.useCallback((e) => {
      e.stopPropagation();
      if (!isEditing) {
        toggleScheduleSelection(schedule.schedule_id);
      }
    }, [isEditing, schedule.schedule_id]);

    const handleStartEdit = React.useCallback((e) => {
      e.stopPropagation();
      startEditingSchedule(schedule.schedule_id);
    }, [schedule.schedule_id]);

    const handleSaveEdit = React.useCallback((e) => {
      e.stopPropagation();
      // บันทึกข้อมูลจาก local state ไปยัง parent
      Object.keys(localData).forEach(field => {
        updateEditedSchedule(schedule.schedule_id, field, localData[field]);
      });
      saveScheduleEdit(schedule.schedule_id);
    }, [schedule.schedule_id, localData]);

    const handleCancelEdit = React.useCallback((e) => {
      e.stopPropagation();
      setLocalData(schedule); // Reset กลับไปเป็นค่าเดิม
      cancelScheduleEdit(schedule.schedule_id);
    }, [schedule.schedule_id]);

    // เปลี่ยนจาก updateEditedSchedule เป็น setLocalData
    const handleInputChange = React.useCallback((field, value) => {
      setLocalData(prev => ({
        ...prev,
        [field]: value
      }));
    }, []);
    console.log('Rendering ScheduleCard for:', schedule.medicine_name, 'isEditing:', isEditing);

    return (
      <div
        className={`group p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 ${isSelected
          ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md'
          : 'border-gray-200 hover:border-green-300 hover:bg-gray-50 hover:shadow-sm'
          }`}
      >
        <div className="flex items-start space-x-3">
          {/* Checkbox */}
          <div
            onClick={handleToggleSelect}
            className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${!isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              } ${isSelected
                ? 'bg-green-500 border-green-500 shadow-sm'
                : 'border-gray-300 group-hover:border-green-400'
              }`}
          >
            {isSelected && <Check className="w-4 h-4 text-white" />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                {schedule.medicine_name}
              </h3>
              {!isEditing ? (
                <button
                  onClick={handleStartEdit}
                  className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex-shrink-0"
                  title="แก้ไขข้อมูล"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                  <button
                    onClick={handleSaveEdit}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                    title="บันทึก"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="ยกเลิก"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              // โหมดแก้ไข - ใช้ localData แทน scheduleData
              <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">💊 วิธีใช้:</label>
                  <textarea
                    value={localData.dosage_instruction || ''}
                    onChange={(e) => handleInputChange('dosage_instruction', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="เช่น รับประทานครั้งละ 1 เม็ด"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">📋 ความถี่:</label>
                  <input
                    type="text"
                    value={localData.frequency || ''}
                    onChange={(e) => handleInputChange('frequency', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="เช่น วันละ 3 ครั้ง"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">🍽️ กับอาหาร:</label>
                  <select
                    value={localData.before_after_meal || ''}
                    onChange={(e) => handleInputChange('before_after_meal', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">เลือก...</option>

                    {/* ก่อนอาหาร */}
                    <option value="ก่อนอาหารเช้า">ก่อนอาหาร เช้า</option>
                    <option value="ก่อนอาหารกลางวัน">ก่อนอาหาร กลางวัน</option>
                    <option value="ก่อนอาหารเย็น">ก่อนอาหาร เย็น</option>
                   
                    <option value="ก่อนอาหารเช้า กลางวัน">ก่อนอาหาร เช้า กลางวัน</option>
                    <option value="ก่อนอาหารเช้า เย็น">ก่อนอาหาร เช้า เย็น</option>
                    <option value="ก่อนอาหารกลางวัน เย็น">ก่อนอาหาร กลางวัน เย็น</option>
                    <option value="ก่อนอาหารเช้า กลางวัน เย็น">ก่อนอาหาร เช้า กลางวัน เย็น</option>
                    <option value="ก่อนอาหารเช้า กลางวัน เย็น และก่อนนอน">ก่อนอาหาร เช้า กลางวัน เย็น และก่อนนอน</option>
                    <option value="ก่อนอาหารเช้า และก่อนนอน">ก่อนอาหาร เช้า และก่อนนอน</option>
                    <option value="ก่อนอาหารกลางวัน และก่อนนอน">ก่อนอาหาร กลางวัน และก่อนนอน</option>
                    <option value="ก่อนอาหารเย็น และก่อนนอน">ก่อนอาหาร เย็น และก่อนนอน</option>

                    {/* หลังอาหาร */}
                    <option value="หลังอาหารเช้า">หลังอาหาร เช้า</option>
                    <option value="หลังอาหารกลางวัน">หลังอาหาร กลางวัน</option>
                    <option value="หลังอาหารเย็น">หลังอาหาร เย็น</option>
                    <option value="หลังอาหารเช้า กลางวัน">หลังอาหาร เช้า กลางวัน</option>
                    <option value="หลังอาหารเช้า เย็น">หลังอาหาร เช้า เย็น</option>
                    <option value="หลังอาหารกลางวัน เย็น">หลังอาหาร กลางวัน เย็น</option>
                    <option value="หลังอาหารเช้า กลางวัน เย็น">หลังอาหาร เช้า กลางวัน เย็น</option>
                    <option value="หลังอาหารเช้า กลางวัน เย็น และก่อนนอน">หลังอาหาร เช้า กลางวัน เย็น และก่อนนอน</option>
                    <option value="หลังอาหารเช้า และก่อนนอน">หลังอาหาร เช้า และก่อนนอน</option>
                    <option value="หลังอาหารกลางวัน และก่อนนอน">หลังอาหาร กลางวัน และก่อนนอน</option>
                    <option value="หลังอาหารเย็น และก่อนนอน">หลังอาหาร เย็น และก่อนนอน</option>


                     <option value="ก่อนนอน">ก่อนนอน</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">⚠️ คำแนะนำพิเศษ:</label>
                  <textarea
                    value={localData.special_instruction || ''}
                    onChange={(e) => handleInputChange('special_instruction', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="เช่น ห้ามรับประทานกับนม"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            ) : (
              // โหมดแสดงผล
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-start">
                  <span className="font-semibold text-gray-700 min-w-[80px]">💊 วิธีใช้:</span>
                  <span className="text-gray-600 flex-1">{scheduleData.dosage_instruction || '-'}</span>
                </div>

                <div className="flex items-start">
                  <span className="font-semibold text-gray-700 min-w-[80px]">📋 ความถี่:</span>
                  <span className="text-gray-600 flex-1">{scheduleData.frequency || '-'}</span>
                </div>


                <div className="flex items-start">
                  <span className="font-semibold text-gray-700 min-w-[80px]">🍽️ อาหาร:</span>
                  <span className="text-gray-600 flex-1">{scheduleData.before_after_meal || '-'}</span>
                </div>

                {scheduleData.special_instruction && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-amber-900 text-xs">คำแนะนำพิเศษ:</span>
                        <p className="text-amber-800 text-xs mt-1">{scheduleData.special_instruction}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - Hide when printing */}
      <div className="print:hidden bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 sm:p-3 rounded-xl shadow-lg">
                <Printer className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ระบบพิมพ์ซองยา
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">ศูนย์ดูแลผู้สูงอายุ</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={handleReset}
                className="flex-1 sm:flex-none px-4 py-2 sm:py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-200"
              >
                <X className="w-4 h-4 sm:inline hidden mr-1" />
                เริ่มใหม่
              </button>
              {selectedResident && (
                <button
                  onClick={handlePrint}
                  disabled={selectedSchedules.length === 0}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                >
                  <Printer className="w-4 h-4" />
                  <span>พิมพ์ ({selectedSchedules.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Steps - Desktop Only */}
          <div className="hidden lg:flex items-center justify-center mt-6 space-x-4">
            {[
              { num: 1, label: 'เลือกวอร์ด', icon: Building, color: 'blue' },
              { num: 2, label: 'เลือกห้อง', icon: Home, color: 'green' },
              { num: 3, label: 'เลือกผู้สูงอายุ', icon: User, color: 'purple' },
              { num: 4, label: 'เลือกยา', icon: Pill, color: 'orange' }
            ].map((step, index) => {
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;
              const Icon = step.icon;

              return (
                <React.Fragment key={step.num}>
                  <div className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'scale-110' : isCompleted ? 'scale-100' : 'scale-90 opacity-50'
                    }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${isCompleted
                      ? `bg-${step.color}-500 text-white shadow-lg`
                      : isActive
                        ? `bg-${step.color}-100 border-2 border-${step.color}-500 text-${step.color}-700 shadow-md`
                        : 'bg-gray-200 text-gray-500'
                      }`}>
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`text-xs font-medium ${isActive ? `text-${step.color}-700` : isCompleted ? `text-${step.color}-600` : 'text-gray-500'
                      }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={`h-0.5 w-16 transition-all duration-300 ${isCompleted ? `bg-${step.color}-500` : 'bg-gray-300'
                      }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Breadcrumb - Mobile Only */}
          <div className="lg:hidden">
            {(selectedWard || selectedRoom || selectedResident) && (
              <div className="flex flex-wrap items-center gap-2 mt-4 text-xs sm:text-sm">
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                  <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                  {selectedWard && (
                    <span className="font-medium text-blue-900">{selectedWard.ward_name}</span>
                  )}
                </div>

                {selectedRoom && (
                  <>
                    <ChevronRight key="chevron-room" className="w-3.5 h-3.5 text-gray-400" />
                    <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                      <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                      <span className="font-medium text-green-900">ห้อง {selectedRoom.room_number}</span>
                    </div>
                  </>
                )}

                {selectedResident && (
                  <>
                    <ChevronRight key="chevron-resident" className="w-3.5 h-3.5 text-gray-400" />
                    <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                      <span className="font-medium text-purple-900">
                        {selectedResident.patient_name}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

        {/* DESKTOP: Horizontal Wizard Flow */}
        <div className="hidden lg:block">
          {/* Step 1: Ward Selection */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-fadeIn">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-xl mr-4">
                  <Building className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">เลือกวอร์ด (หอผู้ป่วย)</h2>
                  <p className="text-sm text-gray-600">กดเลือกวอร์ดที่ต้องการ</p>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
                  <p className="text-sm">กำลังโหลด...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
                  {wards.map(ward => (
                    <div
                      key={ward.ward_id}
                      onClick={() => setSelectedWard(ward)}
                      className="group p-6 rounded-2xl border-2 border-gray-200 cursor-pointer transition-all duration-200 transform hover:scale-105 hover:border-blue-500 hover:bg-blue-50 hover:shadow-xl"
                    >
                      <div className="text-xl font-bold text-gray-900 mb-2">{ward.ward_name}</div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2" />
                          {ward.building} {ward.floor && `ชั้น ${ward.floor}`}
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          จุ: {ward.capacity} คน
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Room Selection */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-xl mr-4">
                    <Home className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">เลือกห้อง</h2>
                    <p className="text-sm text-gray-600">วอร์ด: {selectedWard.ward_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWard(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  ← กลับ
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-3"></div>
                  <p className="text-sm">กำลังโหลด...</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 xl:grid-cols-6 gap-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
                  {rooms.map(room => (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className="group p-6 rounded-2xl border-2 border-gray-200 cursor-pointer transition-all duration-200 transform hover:scale-105 hover:border-green-500 hover:bg-green-50 hover:shadow-xl text-center"
                    >
                      <div className="text-3xl font-bold text-gray-900 mb-2">{room.room_number}</div>
                      <div className="text-xs text-gray-600">{room.room_type}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Resident Selection */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-xl mr-4">
                    <User className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">เลือกผู้สูงอายุ</h2>
                    <p className="text-sm text-gray-600">ห้อง: {selectedRoom.room_number}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  ← กลับ
                </button>
              </div>

              {/* Search Box */}
              {residents.length > 0 && (
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อผู้สูงอายุ... (พิมพ์เพื่อค้นหา)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-3"></div>
                  <p className="text-sm">กำลังโหลด...</p>
                </div>
              ) : filteredResidents.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-lg font-medium">
                    {searchTerm ? 'ไม่พบผู้สูงอายุที่ค้นหา' : 'ไม่มีผู้สูงอายุในห้องนี้'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
                  {filteredResidents.map(resident => (
                    <div
                      key={resident.id}
                      onClick={() => setSelectedResident(resident)}
                      className="group p-6 rounded-2xl border-2 border-gray-200 cursor-pointer transition-all duration-200 transform hover:scale-105 hover:border-purple-500 hover:bg-purple-50 hover:shadow-xl"
                    >
                      <div className="text-lg font-bold text-gray-900 mb-2">
                        {resident.patient_name}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          อายุ: {resident.age} ปี
                        </div>
                        {resident.bed_number && (
                          <div className="flex items-center">
                            🛏️ เตียง {resident.bed_number}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Medicine Selection */}
          {currentStep === 4 && (
            <div className="grid grid-cols-3 gap-6 animate-fadeIn">
              {/* Left: Summary Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-fit sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">ข้อมูลที่เลือก</h3>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl">
                    <Building className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-blue-600 font-medium">วอร์ด</div>
                      <div className="text-sm text-gray-900 font-semibold truncate">{selectedWard.ward_name}</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-xl">
                    <Home className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-green-600 font-medium">ห้อง</div>
                      <div className="text-sm text-gray-900 font-semibold">{selectedRoom.room_number}</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-xl">
                    <User className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-purple-600 font-medium">ผู้สูงอายุ</div>
                      <div className="text-sm text-gray-900 font-semibold truncate">
                        {selectedResident.patient_name}
                      </div>
                      <div className="text-xs text-gray-600">อายุ {selectedResident.age} ปี</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-xl">
                    <Pill className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-orange-600 font-medium">ยาที่เลือก</div>
                      <div className="text-2xl text-gray-900 font-bold">{selectedSchedules.length}</div>
                      <div className="text-xs text-gray-600">รายการ</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedResident(null)}
                  className="w-full mt-6 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  ← เปลี่ยนผู้สูงอายุ
                </button>
              </div>

              {/* Right: Medicine List */}
              <div className="col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-orange-100 p-3 rounded-xl mr-4">
                      <Pill className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">เลือกยาที่ต้องการพิมพ์</h2>
                      <p className="text-sm text-gray-600">
                        คลิกเพื่อเลือกยา หรือคลิกปุ่มแก้ไขเพื่อปรับข้อมูล ({selectedSchedules.length}/{filteredSchedules.length}
                        {medicineSearchTerm && ` จากทั้งหมด ${schedules.length}`})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="space-y-4 mb-6">
                  {/* Search Box */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ค้นหายา... (ชื่อยา, รหัสยา, วิธีใช้, ความถี่, คำแนะนำ)"
                      value={medicineSearchTerm}
                      onChange={(e) => setMedicineSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                    {medicineSearchTerm && (
                      <button
                        onClick={() => setMedicineSearchTerm('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-blue-600" />
                        วันที่พิมพ์
                      </label>
                      <input
                        type="date"
                        value={printDate}
                        onChange={(e) => setPrintDate(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-purple-600" />
                        ช่วงเวลา
                      </label>
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none bg-white"
                      >
                        <option value="all">🕐 ทั้งหมด</option>
                        <option value="morning">🌅 เช้า</option>
                        <option value="noon">☀️ เที่ยง</option>
                        <option value="evening">🌆 เย็น</option>
                        <option value="bedtime">🌙 ก่อนนอน</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={selectAllSchedules}
                        className="w-full px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                      >
                        <Check className="w-4 h-4 inline mr-1" />
                        {selectedSchedules.length === filteredSchedules.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Schedules List */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-3"></div>
                      <p className="text-sm">กำลังโหลดตารางยา...</p>
                    </div>
                  ) : schedules.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                      <Pill className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium">ไม่พบตารางยา</p>
                      <p className="text-sm text-gray-400 mt-1">ลองเปลี่ยนช่วงเวลาหรือวันที่</p>
                    </div>
                  ) : filteredSchedules.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                      <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium">ไม่พบยาที่ค้นหา</p>
                      <p className="text-sm text-gray-400 mt-1">ลองค้นหาด้วยคำอื่น หรือ <button onClick={() => setMedicineSearchTerm('')} className="text-blue-600 hover:underline">ล้างการค้นหา</button></p>
                    </div>
                  ) : (
                    filteredSchedules.map(schedule => (
                      <ScheduleCard key={schedule.schedule_id} schedule={schedule} />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MOBILE: Original 3-column Layout */}
        <div className="lg:hidden">
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {/* Left Panel - Ward/Room/Resident Selection */}
            <div className="print:hidden space-y-4">

              {/* 1. Ward Selection */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-2">
                      <Building className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <span>1. เลือกวอร์ด</span>
                  </h2>
                  {selectedWard && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      เลือกแล้ว
                    </span>
                  )}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {loading && !selectedWard ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-sm">กำลังโหลด...</p>
                    </div>
                  ) : wards.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">ไม่พบข้อมูลวอร์ด</p>
                    </div>
                  ) : (
                    wards.map(ward => (
                      <div
                        key={ward.ward_id}
                        onClick={() => setSelectedWard(ward)}
                        className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${selectedWard?.ward_id === ward.ward_id
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm'
                          }`}
                      >
                        <div className="font-semibold text-gray-900 mb-1">{ward.ward_name}</div>
                        <div className="text-xs sm:text-sm text-gray-600 flex flex-wrap gap-2">
                          <span className="inline-flex items-center">
                            <Building className="w-3 h-3 mr-1" />
                            {ward.building}
                          </span>
                          {ward.floor && (
                            <span className="inline-flex items-center">
                              ชั้น {ward.floor}
                            </span>
                          )}
                          <span className="inline-flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {ward.capacity} คน
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 2. Room Selection */}
              {selectedWard && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300 animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg mr-2">
                        <Home className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      </div>
                      <span>2. เลือกห้อง</span>
                    </h2>
                    {selectedRoom && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                        เลือกแล้ว
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {loading && !selectedRoom ? (
                      <div className="col-span-3 sm:col-span-4 flex flex-col items-center justify-center py-8 text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
                        <p className="text-sm">กำลังโหลด...</p>
                      </div>
                    ) : rooms.length === 0 ? (
                      <div className="col-span-3 sm:col-span-4 text-center py-8 text-gray-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">ไม่พบห้อง</p>
                      </div>
                    ) : (
                      rooms.map(room => (
                        <div
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          className={`group p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center transform hover:scale-105 ${selectedRoom?.id === room.id
                            ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-md'
                            : 'border-gray-200 hover:border-green-300 hover:bg-gray-50 hover:shadow-sm'
                            }`}
                        >
                          <div className="font-bold text-lg sm:text-xl text-gray-900">{room.room_number}</div>
                          <div className="text-xs text-gray-600 mt-1 truncate">{room.room_type}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 3. Resident Selection */}
              {selectedRoom && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300 animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
                      <div className="bg-purple-100 p-2 rounded-lg mr-2">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      </div>
                      <span>3. เลือกผู้สูงอายุ</span>
                    </h2>
                    {selectedResident && (
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full">
                        เลือกแล้ว
                      </span>
                    )}
                  </div>

                  {/* Search Box */}
                  {residents.length > 0 && (
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="ค้นหาชื่อผู้สูงอายุ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                  )}

                  <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {loading && !selectedResident ? (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                        <p className="text-sm">กำลังโหลด...</p>
                      </div>
                    ) : filteredResidents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">
                          {searchTerm ? 'ไม่พบผู้สูงอายุที่ค้นหา' : 'ไม่มีผู้สูงอายุในห้องนี้'}
                        </p>
                      </div>
                    ) : (
                      filteredResidents.map(resident => (
                        <div
                          key={resident.id}
                          onClick={() => setSelectedResident(resident)}
                          className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${selectedResident?.id === resident.id
                            ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 shadow-md'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 hover:shadow-sm'
                            }`}
                        >
                          <div className="font-semibold text-gray-900 mb-1">
                            {resident.patient_name}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 flex flex-wrap gap-2">
                            <span className="inline-flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {resident.age} ปี
                            </span>
                            {resident.bed_number && (
                              <span className="inline-flex items-center">
                                🛏️ เตียง {resident.bed_number}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Schedule Selection */}
            <div className="print:hidden lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
              {selectedResident ? (
                <>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
                      <div className="bg-orange-100 p-2 rounded-lg mr-2">
                        <Pill className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      </div>
                      <span>ตารางยา</span>
                    </h2>

                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-600">เลือกแล้ว:</span>
                      <span className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full">
                        {selectedSchedules.length} รายการ
                      </span>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="space-y-3 sm:space-y-4 mb-6">
                    {/* Medicine Search Box */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="ค้นหายา... (ชื่อยา, รหัส, วิธีใช้)"
                        value={medicineSearchTerm}
                        onChange={(e) => setMedicineSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                      {medicineSearchTerm && (
                        <button
                          onClick={() => setMedicineSearchTerm('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-blue-600" />
                          วันที่พิมพ์
                        </label>
                        <input
                          type="date"
                          value={printDate}
                          onChange={(e) => setPrintDate(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-purple-600" />
                          ช่วงเวลา
                        </label>
                        <select
                          value={timeSlot}
                          onChange={(e) => setTimeSlot(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none bg-white"
                        >
                          <option value="all">🕐 ทั้งหมด</option>
                          <option value="morning">🌅 เช้า</option>
                          <option value="noon">☀️ เที่ยง</option>
                          <option value="evening">🌆 เย็น</option>
                          <option value="bedtime">🌙 ก่อนนอน</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                        <button
                          onClick={selectAllSchedules}
                          className="w-full px-4 py-2 text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                        >
                          <Check className="w-4 h-4 inline mr-1" />
                          {selectedSchedules.length === filteredSchedules.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Schedules List */}
                  <div className="space-y-3 max-h-[calc(100vh-24rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-3"></div>
                        <p className="text-sm">กำลังโหลดตารางยา...</p>
                      </div>
                    ) : schedules.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Pill className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm font-medium">ไม่พบตารางยา</p>
                        <p className="text-xs text-gray-400 mt-1">ลองเปลี่ยนช่วงเวลาหรือวันที่</p>
                      </div>
                    ) : filteredSchedules.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm font-medium">ไม่พบยาที่ค้นหา</p>
                        <p className="text-xs text-gray-400 mt-1">
                          <button onClick={() => setMedicineSearchTerm('')} className="text-blue-600 hover:underline">
                            ล้างการค้นหา
                          </button>
                        </p>
                      </div>
                    ) : (
                      filteredSchedules.map(schedule => (
                        <ScheduleCard key={schedule.schedule_id} schedule={schedule} />
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-gray-400">
                  <div className="text-center max-w-sm">
                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-6 rounded-full inline-block mb-6">
                      <Printer className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-600 mb-3">เริ่มต้นพิมพ์ซองยา</h3>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="bg-blue-100 text-blue-800 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                        <span>เลือกวอร์ด</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <span className="bg-green-100 text-green-800 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                        <span>เลือกห้อง</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <span className="bg-purple-100 text-purple-800 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                        <span>เลือกผู้สูงอายุ</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>


      {/* Print Area */}
      <div ref={printRef} className="hidden print:block">
        <style>{`
          @media print {
            @page {
              size: 80mm 120mm;
              margin: 5mm;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .page-break-before {
              page-break-before: always;
            }
          }
        `}</style>

        {schedulesToPrint.map((schedule, index) => {
          const scheduleData = getScheduleData(schedule);
          return (
            <div key={schedule.schedule_id} className={index > 0 ? 'page-break-before' : ''}>
              <div className="border-2 border-black p-3" style={{
                width: '80mm',
                minHeight: '120mm',
                fontSize: '11pt',
                fontFamily: 'TH Sarabun New, sans-serif',
                pageBreakAfter: 'always'
              }}>
                {/* Header */}
                <div className="text-center border-b-2 border-black pb-2 mb-2">
                  <div className="font-bold text-lg">ศูนย์ดูแลผู้สูงอายุ</div>
                  <div className="text-sm">ELDERLY CARE CENTER</div>
                </div>

                {/* Patient Info */}
                <div className="mb-2 pb-2 border-b border-gray-400">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">ชื่อ-สกุล:</span>
                    <span>{selectedResident.patient_name} </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">วอร์ด:</span>
                    <span>{selectedWard.ward_name}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">ห้อง:</span>
                    <span>{selectedRoom.room_number}</span>
                    <span className="font-bold">อายุ:</span>
                    <span>{selectedResident.age} ปี</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">วันที่:</span>
                    <span>{new Date(printDate).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>

                {/* Medicine Info */}
                <div className="mb-2">
                  <div className="font-bold text-center text-lg mb-2 bg-gray-200 py-1">
                    {schedule.medicine_name}
                  </div>

                  <div className="space-y-1">
                    <div>
                      <span className="font-bold">วิธีใช้:</span>
                      <div className="ml-4">{scheduleData.dosage_instruction || '-'}</div>
                    </div>

                    <div>
                      <span className="font-bold">ความถี่:</span>
                      <div className="ml-4">{scheduleData.frequency || '-'}</div>
                    </div>

                    <div>
                      <span className="font-bold">เวลา:</span>
                      <div className="ml-4">{getTimeSlotLabel(schedule)}</div>
                    </div>

                    <div>
                      <span className="font-bold">กับอาหาร:</span>
                      <div className="ml-4">{scheduleData.before_after_meal || '-'}</div>
                    </div>

                    {scheduleData.special_instruction && (
                      <div className="border-t border-gray-400 pt-2 mt-2">
                        <span className="font-bold">⚠️ คำแนะนำพิเศษ:</span>
                        <div className="ml-4 text-red-600">{scheduleData.special_instruction}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-2 pt-2 border-t-2 border-black text-xs text-center">
                  <div>กรุณาอ่านคำแนะนำก่อนใช้ยาทุกครั้ง</div>
                  <div>หากมีผลข้างเคียง กรุณาปรึกษาพยาบาลหรือแพทย์</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
        
        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background-color: #f3f4f6;
          border-radius: 3px;
        }
      `}</style>

    </div>

  );
};

export default MedicineLabelPrinter;
