import React, { useState, useEffect, useRef } from 'react';
import { Search, Printer, User, Calendar, Clock, Pill, FileText, X, Check } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api'; // เปลี่ยนตามที่ตั้งของ API

const MedicineLabelPrinter = () => {
  // States
  const [residents, setResidents] = useState([]);
  const [selectedResident, setSelectedResident] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [printDate, setPrintDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('all');
  const printRef = useRef();

  // Fetch residents on component mount
  useEffect(() => {
    fetchResidents();
  }, []);

  // Fetch schedules when resident is selected
  useEffect(() => {
    if (selectedResident) {
      fetchSchedules(selectedResident.resident_id);
    }
  }, [selectedResident, printDate, timeSlot]);

  // API Calls
  const fetchResidents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/service-registrations?is_active=true`);
      const data = await response.json();
      setResidents(data);
    } catch (error) {
      console.error('Error fetching residents:', error);
      alert('ไม่สามารถโหลดข้อมูลผู้สูงอายุได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async (residentId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/medical?resident_id=${residentId}&is_active=true`
      );
      const data = await response.json();
      
      // Filter by time slot if selected
      let filtered = data;
      if (timeSlot !== 'all') {
        filtered = data.filter(schedule => {
          const timeField = `time_${timeSlot}`;
          return schedule[timeField] !== null;
        });
      }
      
      setSchedules(filtered);
      setSelectedSchedules([]);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      alert('ไม่สามารถโหลดข้อมูลตารางยาได้');
    } finally {
      setLoading(false);
    }
  };

  // Filter residents by search term
  const filteredResidents = residents.filter(resident => 
    `${resident.first_name} ${resident.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.room_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    if (selectedSchedules.length === schedules.length) {
      setSelectedSchedules([]);
    } else {
      setSelectedSchedules(schedules.map(s => s.schedule_id));
    }
  };

  // Get time slot label
  const getTimeSlotLabel = (schedule) => {
    const times = [];
    if (schedule.time_morning) times.push(`เช้า ${schedule.time_morning}`);
    if (schedule.time_noon) times.push(`เที่ยง ${schedule.time_noon}`);
    if (schedule.time_evening) times.push(`เย็น ${schedule.time_evening}`);
    if (schedule.time_bedtime) times.push(`ก่อนนอน ${schedule.time_bedtime}`);
    return times.join(', ');
  };

  // Print function
  const handlePrint = () => {
    if (selectedSchedules.length === 0) {
      alert('กรุณาเลือกยาที่ต้องการพิมพ์');
      return;
    }
    window.print();
  };

  // Selected schedules for printing
  const schedulesToPrint = schedules.filter(s => 
    selectedSchedules.includes(s.schedule_id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hide when printing */}
      <div className="print:hidden bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Printer className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ระบบพิมพ์ซองยา</h1>
                <p className="text-sm text-gray-500">ศูนย์ดูแลผู้สูงอายุ</p>
              </div>
            </div>
            
            {selectedResident && (
              <button
                onClick={handlePrint}
                disabled={selectedSchedules.length === 0}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Printer className="w-5 h-5" />
                <span>พิมพ์ซองยา ({selectedSchedules.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Resident Selection */}
          <div className="print:hidden lg:col-span-1 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              เลือกผู้สูงอายุ
            </h2>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ หรือห้อง..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Residents List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-gray-500">กำลังโหลด...</div>
              ) : filteredResidents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">ไม่พบข้อมูล</div>
              ) : (
                filteredResidents.map(resident => (
                  <div
                    key={resident.resident_id}
                    onClick={() => setSelectedResident(resident)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedResident?.resident_id === resident.resident_id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {resident.first_name} {resident.last_name}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      ห้อง: {resident.room_number} | อายุ: {resident.age} ปี
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Schedule Selection */}
          <div className="print:hidden lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            {selectedResident ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Pill className="w-5 h-5 mr-2 text-green-600" />
                    ตารางยาของ {selectedResident.first_name} {selectedResident.last_name}
                  </h2>
                  
                  <button
                    onClick={() => setSelectedResident(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      วันที่พิมพ์
                    </label>
                    <input
                      type="date"
                      value={printDate}
                      onChange={(e) => setPrintDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ช่วงเวลา
                    </label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">ทั้งหมด</option>
                      <option value="morning">เช้า</option>
                      <option value="noon">เที่ยง</option>
                      <option value="evening">เย็น</option>
                      <option value="bedtime">ก่อนนอน</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={selectAllSchedules}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {selectedSchedules.length === schedules.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                    </button>
                  </div>
                </div>

                {/* Schedules List */}
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">กำลังโหลด...</div>
                  ) : schedules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">ไม่พบตารางยา</div>
                  ) : (
                    schedules.map(schedule => (
                      <div
                        key={schedule.schedule_id}
                        onClick={() => toggleScheduleSelection(schedule.schedule_id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedSchedules.includes(schedule.schedule_id)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                selectedSchedules.includes(schedule.schedule_id)
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-gray-300'
                              }`}>
                                {selectedSchedules.includes(schedule.schedule_id) && (
                                  <Check className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <span className="font-medium text-gray-900">
                                {schedule.medicine_name}
                              </span>
                            </div>
                            
                            <div className="ml-7 mt-2 space-y-1 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">วิธีใช้:</span> {schedule.dosage_instruction}
                              </div>
                              <div>
                                <span className="font-medium">ความถี่:</span> {schedule.frequency}
                              </div>
                              <div>
                                <span className="font-medium">เวลา:</span> {getTimeSlotLabel(schedule)}
                              </div>
                              <div>
                                <span className="font-medium">อาหาร:</span> {schedule.before_after_meal}
                              </div>
                              {schedule.special_instruction && (
                                <div className="text-orange-600">
                                  <span className="font-medium">คำแนะนำพิเศษ:</span> {schedule.special_instruction}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <User className="w-16 h-16 mb-4" />
                <p className="text-lg">กรุณาเลือกผู้สูงอายุเพื่อดูตารางยา</p>
              </div>
            )}
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
          }
        `}</style>
        
        {schedulesToPrint.map((schedule, index) => (
          <div key={schedule.schedule_id} className={`${index > 0 ? 'page-break-before' : ''}`}>
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
                  <span>{selectedResident.first_name} {selectedResident.last_name}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold">ห้อง:</span>
                  <span>{selectedResident.room_number}</span>
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
                    <div className="ml-4">{schedule.dosage_instruction}</div>
                  </div>
                  
                  <div>
                    <span className="font-bold">ความถี่:</span>
                    <div className="ml-4">{schedule.frequency}</div>
                  </div>
                  
                  <div>
                    <span className="font-bold">เวลา:</span>
                    <div className="ml-4">{getTimeSlotLabel(schedule)}</div>
                  </div>
                  
                  <div>
                    <span className="font-bold">กับอาหาร:</span>
                    <div className="ml-4">{schedule.before_after_meal}</div>
                  </div>

                  {schedule.special_instruction && (
                    <div className="border-t border-gray-400 pt-2 mt-2">
                      <span className="font-bold">⚠️ คำแนะนำพิเศษ:</span>
                      <div className="ml-4 text-red-600">{schedule.special_instruction}</div>
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
        ))}
      </div>
    </div>
  );
};

export default MedicineLabelPrinter;