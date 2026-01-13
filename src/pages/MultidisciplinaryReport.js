import React, { useState, useEffect } from 'react';
import { Search, X, UserPlus, Users, User, Save, Share2, ChevronRight, Info, AlertCircle, QrCode, Image as ImageIcon, CheckSquare, Square, Home } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { formatDateForInput, formatTime } from '../utils/dateUtils';


// API Configuration
const API_BASE_URL = 'http://172.16.40.11:3001/api';

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
    searchPatients: (query) =>
      fetchWithAuth(`/service-registrations?search=${encodeURIComponent(query)}`),

    // 🆕 ค้นหาด้วยเลขห้อง
    searchPatientsByRoom: (roomNumber) =>
      fetchWithAuth(`/service-registrations?room=${encodeURIComponent(roomNumber)}`),

    getPatientByHN: (hn) =>
      fetchWithAuth(`/service-registrations/hn/${hn}`),

    // 🆕 เพิ่ม API สำหรับดึงรายงานเดี่ยว
    getReportById: (id) =>
      fetchWithAuth(`/reports/multidisciplinary/${id}`),

    saveMultidisciplinaryReport: (data) =>
      fetchWithAuth('/reports/multidisciplinary', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    // 🆕 เพิ่ม API สำหรับแก้ไขรายงาน
    updateMultidisciplinaryReport: (id, data) =>
      fetchWithAuth(`/reports/multidisciplinary/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    // 🆕 เพิ่ม API สำหรับดึงรูปภาพจากหัตถการ
    getProcedureImages: (patientId, startDate, endDate) =>
      fetchWithAuth(`/procedure-records?patientId=${patientId}&startDate=${startDate}&endDate=${endDate}`),
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


// PatientSearch Component
function PatientSearch({ visible, onClose, onSelectPatient }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [searchMode, setSearchMode] = useState('patient'); // 'patient' หรือ 'room'

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setError(null);

    if (query.length < 1) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      
      let results;
      
      if (searchMode === 'room') {
        // ✅ ค้นหาตามห้อง
        results = await api.searchPatientsByRoom(query);
      } else {
        // ค้นหาตาม HN/ชื่อ
        results = await api.searchPatients(query);
      }

      const allResults = results.data || [];

      // ลบข้อมูลซ้ำ (ถ้ามี) โดยใช้ patient_id
      const uniqueResults = allResults.filter((patient, index, self) =>
        index === self.findIndex((p) => p.patient_id === patient.patient_id)
      );

      setSearchResults(uniqueResults);
    } catch (err) {
      console.error('Search error:', err);
      setError('เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // เคลียร์ค่าเมื่อเปลี่ยนโหมด
  useEffect(() => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
  }, [searchMode]);

  const handleSelectPatient = (patient) => {
    onSelectPatient(patient);
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
          <h2 className="text-base sm:text-lg font-bold">ค้นหาผู้ป่วย</h2>
          <div className="w-10" />
        </div>

        {/* ✅ Toggle Search Mode */}
        <div className="p-3 sm:p-4 bg-gray-50 border-b">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setSearchMode('patient')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition ${
                searchMode === 'patient'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <User size={16} />
                <span>ค้นหาชื่อ/HN</span>
              </div>
            </button>
            <button
              onClick={() => setSearchMode('room')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition ${
                searchMode === 'room'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Home size={16} />
                <span>ค้นหาห้อง</span>
              </div>
            </button>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 sm:gap-3 bg-white border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
            <Search size={18} className="sm:w-5 sm:h-5 text-gray-500" />
            <input
              type="text"
              className="flex-1 outline-none text-sm sm:text-base"
              placeholder={
                searchMode === 'room'
                  ? 'ค้นหาเลขห้อง เช่น 101, 202'
                  : 'ค้นหา HN, ชื่อ, หรือนามสกุล'
              }
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); setError(null); }}>
                <X size={18} className="sm:w-5 sm:h-5 text-gray-500" />
              </button>
            )}
          </div>
          {error && (
            <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">กำลังค้นหา...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              {/* ✅ แสดงชื่อห้องถ้าค้นหาตามห้อง */}
              {searchMode === 'room' && (
                <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Home size={18} className="text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">ห้อง {searchQuery}</p>
                      <p className="text-xs text-blue-700">พบผู้ป่วย {searchResults.length} คน</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2 sm:space-y-3">
                {searchResults.map((patient) => (
                  <button
                    key={patient.patient_id}
                    onClick={() => handleSelectPatient(patient)}
                    className="w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white border rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      {patient.profile_image ? (
                        <img src={patient.profile_image} alt="" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover" />
                      ) : (
                        <User size={24} className="sm:w-8 sm:h-8 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {patient.first_name} {patient.last_name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        HN: {patient.hn} | {patient.age} ปี | {patient.gender}
                      </p>
                      {patient.room_number && patient.room_number !== '-' && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 mt-0.5">
                          <Home size={12} />
                          <span>ห้อง: {patient.room_number}</span>
                        </div>
                      )}
                    </div>
                    <ChevronRight size={20} className="sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </>
          ) : searchQuery.length >= 1 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              {searchMode === 'room' ? (
                <>
                  <Home size={48} className="sm:w-16 sm:h-16 text-gray-300" />
                  <p className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-gray-600">
                    ไม่พบผู้ป่วยในห้อง {searchQuery}
                  </p>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500 text-center px-4">
                    ตรวจสอบเลขห้องว่าถูกต้องหรือไม่
                  </p>
                </>
              ) : (
                <>
                  <Search size={48} className="sm:w-16 sm:h-16 text-gray-300" />
                  <p className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-gray-600">ไม่พบผู้ป่วย</p>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500 text-center px-4">
                    ลองค้นหาด้วยคำอื่นหรือตรวจสอบความถูกต้อง
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              {searchMode === 'room' ? (
                <>
                  <Home size={48} className="sm:w-16 sm:h-16 text-gray-300" />
                  <p className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-gray-600">ค้นหาผู้ป่วยตามห้อง</p>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500 text-center px-4">
                    พิมพ์เลขห้องเพื่อดูผู้ป่วยทั้งหมดในห้องนั้น
                  </p>
                </>
              ) : (
                <>
                  <Search size={48} className="sm:w-16 sm:h-16 text-gray-300" />
                  <p className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-gray-600">ค้นหาผู้ป่วย</p>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500 text-center px-4">
                    พิมพ์เพื่อเริ่มค้นหา
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 🆕 ImageModal Component - สำหรับดูรูปภาพขยาย
function ImageModal({ visible, onClose, imageUrl }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition"
      >
        <X size={24} />
      </button>
      <img
        src={imageUrl}
        alt="Procedure"
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// MultidisciplinaryReport Component
export default function MultidisciplinaryReport() {
  const { user } = useAuth();
  const [showShareButton, setShowShareButton] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { hn, id } = useParams(); // เพิ่ม id สำหรับ edit mode

  // 🆕 เพิ่ม state สำหรับ edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [reportId, setReportId] = useState(null);

  // 🆕 States สำหรับรูปภาพ
  const [procedureImages, setProcedureImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState(null);

  const [formData, setFormData] = useState({
    roomNumber: '',
    shift: 'N',
    date: new Date().toISOString().split('T')[0],
    overallCondition: '',
    vitalSigns: 'คงที่',
    temperature: '',
    pulse: '',
    respiration: '',
    bloodPressure: '',
    o2sat: '',
    fluidIntakeTime: '00:00-08:00',
    fluidIntake: '',
    fluidOutputTime: '00:00-08:00',
    fluidOutput: '',
    urination: '',
    defecation: '',
    sleepHours: '',
    sleepQuality: '',
    mealTimes: [],
    feedingType: '',
    feedingFrequency: '',
    feedingAmount: '',
    feedingTime: '',
    additionalNotes: '',
    appointment: '',
  });

  useEffect(() => {
    if (id) {
      // Edit mode
      setIsEditMode(true);
      setReportId(id);
      loadReportForEdit(id);
    } else if (hn) {
      // Create mode with HN
      loadPatientByHN(hn);
    }
  }, [hn, id]);

  // 🆕 โหลดข้อมูลรายงานสำหรับแก้ไข
  const loadReportForEdit = async (reportId) => {
    try {
      setIsLoadingPatient(true);
      const response = await api.getReportById(reportId);
      
      if (response.success && response.data) {
        const report = response.data;
        
        // Set patient data
        setSelectedPatient({
          patient_id: report.patient_id,
          hn: report.patient_hn,
          first_name: report.patient_name?.split(' ')[0] || '',
          last_name: report.patient_name?.split(' ')[1] || '',
          age: report.patient_age || '',
          gender: report.patient_gender || '',
          room_number: report.room_number,
          chronic_diseases: report.chronic_diseases,
        });
        console.log('Loaded report for edit:', report);
        // Set form data
        setFormData({
          roomNumber: report.room_number || '',
          shift: report.shift || 'N',
          date: formatDateForInput(report.report_date) || new Date().toISOString().split('T')[0],
          overallCondition: report.overall_condition || '',
          vitalSigns: report.vital_signs || 'คงที่',
          temperature: report.temperature || '',
          pulse: report.pulse || '',
          respiration: report.respiration || '',
          bloodPressure: report.blood_pressure || '',
          o2sat: report.o2_saturation || '',
          fluidIntakeTime: report.fluid_intake_time || '00:00-08:00',
          fluidIntake: report.fluid_intake || '',
          fluidOutputTime: report.fluid_output_time || '00:00-08:00',
          fluidOutput: report.fluid_output || '',
          urination: report.urination || '',
          defecation: report.defecation || '',
          sleepHours: report.sleep_hours || '',
          sleepQuality: report.sleep_quality || '',
          mealTimes: report.meal_times ? report.meal_times.split(',') : [],
          feedingType: report.feeding_type || '',
          feedingFrequency: report.feeding_frequency || '',
          feedingAmount: report.feeding_amount || '',
          feedingTime: report.feeding_time || '',
          additionalNotes: report.additional_notes || '',
          appointment: report.appointment || '',
        });

        // Load existing images if any
        if (report.image_urls && Array.isArray(report.image_urls)) {
          const images = report.image_urls.map((url, index) => ({
            id: index,
            image_url: url,
          }));
          setProcedureImages(images);
          // Pre-select all existing images
          setSelectedImages(images.map((_, index) => index));
        }
      }
    } catch (error) {
      console.error('Load report error:', error);
      alert('ไม่สามารถโหลดข้อมูลรายงานได้');
    } finally {
      setIsLoadingPatient(false);
    }
  };

  // 🆕 Load images เมื่อเลือกวันที่หรือผู้ป่วย
  useEffect(() => {
    if (selectedPatient && formData.date) {
      loadProcedureImages();
    }
  }, [selectedPatient, formData.date]);

  const loadPatientByHN = async (hn) => {
    try {
      setIsLoadingPatient(true);
      const patient = await api.getPatientByHN(hn);
      setSelectedPatient(patient.data);
      if (patient.data.room_number) {
        setFormData(prev => ({ ...prev, roomNumber: patient.data.room_number }));
      }
    } catch (error) {
      alert(`ข้อผิดพลาด\nไม่พบข้อมูลผู้ป่วย HN: ${hn}`);
    } finally {
      setIsLoadingPatient(false);
    }
  };

  // 🆕 โหลดรูปภาพจากหัตถการ
  const loadProcedureImages = async () => {
    if (!selectedPatient) return;

    setIsLoadingImages(true);
    try {
      console.log('🔵 Loading procedure images...');
      console.log('🔵 Patient ID:', selectedPatient.patient_id);
      console.log('🔵 Date:', formData.date);

      const response = await api.getProcedureImages(
        selectedPatient.patient_id,
        formData.date,
        formData.date
      );

      console.log('✅ Response:', response);

      if (response.success && response.data) {
        const images = [];
        
        response.data.forEach((record) => {
          if (record.image_urls && Array.isArray(record.image_urls) && record.image_urls.length > 0) {
            record.image_urls.forEach((imageUrl) => {
              images.push({
                id: record.id,
                record_id: record.id,
                image_url: imageUrl,
                record_date: record.record_date,
                record_time: record.record_time,
                procedure_names: record.procedures?.map(p => p.display_name || p.procedure_name).join(', ') || 'ไม่ระบุ'
              });
            });
          }
        });

        console.log('✅ Found images:', images.length);
        setProcedureImages(images);
        setSelectedImages([]); // Reset selection
      } else {
        setProcedureImages([]);
        setSelectedImages([]);
      }
    } catch (error) {
      console.error('❌ Load images error:', error);
      setProcedureImages([]);
      setSelectedImages([]);
    } finally {
      setIsLoadingImages(false);
    }
  };

  // 🆕 Toggle เลือก/ยกเลิก รูปภาพ
  const toggleImageSelection = (index) => {
    setSelectedImages(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // 🆕 เลือกทั้งหมด
  const selectAllImages = () => {
    const allIndices = procedureImages.map((_, index) => index);
    setSelectedImages(allIndices);
  };

  // 🆕 ยกเลิกทั้งหมด
  const deselectAllImages = () => {
    setSelectedImages([]);
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    if (patient.room_number) {
      setFormData(prev => ({ ...prev, roomNumber: patient.room_number }));
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMealTimeChange = (mealTime) => {
    setFormData(prev => {
      const currentMealTimes = prev.mealTimes || [];
      const isChecked = currentMealTimes.includes(mealTime);
      
      if (isChecked) {
        return {
          ...prev,
          mealTimes: currentMealTimes.filter(time => time !== mealTime)
        };
      } else {
        return {
          ...prev,
          mealTimes: [...currentMealTimes, mealTime]
        };
      }
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const thaiYear = date.getFullYear() + 543;
    const shortYear = String(thaiYear).slice(-2);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${shortYear}`;
  };

  const generateQRCodeURL = () => {
    if (!selectedPatient) return '';
    const baseURL = window.location.origin + window.location.pathname;
    return `${baseURL}/${selectedPatient.hn}`;
  };

  const handleGenerateQR = () => {
    if (!selectedPatient) {
      alert('กรุณาเลือกผู้ป่วยก่อน');
      return;
    }
    const qrURL = generateQRCodeURL();
    window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrURL)}`, '_blank');
  };

  const generateReportText = () => {
    const reporterName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.nickname || 'ผู้ใช้งาน';
    const patientName = selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : '';

    // 🆕 เพิ่มข้อมูลรูปภาพ
    let imageInfo = '';
    if (selectedImages.length > 0) {
      imageInfo = `\n\nรูปภาพแนบ: ${selectedImages.length} รูป`;
      imageInfo += '\n(รูปภาพจากการทำหัตถการในวันนี้)';
    }

    return `${formData.roomNumber} ${patientName}
HN: ${selectedPatient?.hn || ''}
เวร${formData.shift} ${formatDate(formData.date)}
—---------------------------------------------------------------------------------------------------------------------------------------
สหวิชาชีพ + ยา
อาการโดยรวม (ภายใน 24 ชม.) : ${formData.overallCondition}
*รวมถึงยา และกิจวัตรประจำวัน (สามารถทำได้ตามเป้าหมายหรือไม่?)

สัญญาณชีพ : ${formData.vitalSigns}
T=${formData.temperature}°C  P=${formData.pulse}  R=${formData.respiration}  BP=${formData.bloodPressure}  O2sat=${formData.o2sat}%

ปริมาตรน้ำเข้า (Intake) รอบ ${formData.fluidIntakeTime} : ${formData.fluidIntake} cc
ปริมาตรน้ำออก (Output) รอบ ${formData.fluidOutputTime} : ${formData.fluidOutput} cc
ปัสสาวะ : ${formData.urination} ครั้ง ถ่ายอุจจาระ : ${formData.defecation} ครั้ง
นอนหลับ : ${formData.sleepHours ? `${formData.sleepHours} ชั่วโมง` : '-'} (คุณภาพ: ${formData.sleepQuality || '-'})
รับประทานอาหาร : ${formData.mealTimes && formData.mealTimes.length > 0 ? formData.mealTimes.join(', ') : 'ไม่มีข้อมูล'}

การให้อาหาร :
${formData.feedingType ? `ประเภท: ${formData.feedingType}` : ''}
${formData.feedingFrequency ? `ความถี่: ${formData.feedingFrequency}` : ''}
${formData.feedingAmount ? `ปริมาณ: ${formData.feedingAmount} ml` : ''}
${formData.feedingTime ? `เวลา: ${formData.feedingTime}` : ''}
${!formData.feedingType && !formData.feedingFrequency && !formData.feedingAmount && !formData.feedingTime ? 'ไม่มีข้อมูล' : ''}

หมายเหตุเพิ่มเติม : ${formData.additionalNotes}${imageInfo}
ผู้รายงาน : ${reporterName} (${user?.code || user?.username || ''})
—--------------------------------------------------------------------------------------------------------------------------------------
การนัดหมาย (Appointment) : 
สหวิชาชีพ: ${formData.appointment}
—--------------------------------------------------------------------------------------------------------------------------------------
พวกเราจะพยายามอย่างเต็มที่เพื่อให้มั่นใจว่า คุณ${patientName}
จะได้รับการดูแลที่ดีที่สุดในทุกๆวัน ขอบคุณค่ะ
หากมีข้อสงสัย หรือสอบถามข้อมูลเพิ่มเติม
สามารถติดต่อได้ที่เบอร์โทรศัพท์ 02-412-0999 (เวลาทำการ 08:00-17:00 น.)`;
  };

  const validateForm = () => {
    const errors = [];

    if (!selectedPatient) {
      errors.push('กรุณาเลือกผู้ป่วย');
    }

    if (!formData.roomNumber || formData.roomNumber.trim() === '') {
      errors.push('กรุณากรอกเลขห้อง');
    }

    if (!formData.overallCondition || formData.overallCondition.trim() === '') {
      errors.push('กรุณากรอกอาการโดยรวม');
    }

    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert(`กรุณาตรวจสอบข้อมูล\n\n${errors.join('\n')}`);
      return;
    }

    try {
      setIsSaving(true);

      // 🆕 รวม image URLs ที่เลือก
      const selectedImageUrls = selectedImages.map(index => procedureImages[index].image_url);

      const reportData = {
        patient_id: selectedPatient.patient_id,
        patient_hn: selectedPatient.hn,
        room_number: formData.roomNumber,
        shift: formData.shift,
        report_date: formData.date,
        overall_condition: formData.overallCondition,
        vital_signs: formData.vitalSigns,
        temperature: formData.temperature || null,
        pulse: formData.pulse || null,
        respiration: formData.respiration || null,
        blood_pressure: formData.bloodPressure || null,
        o2_saturation: formData.o2sat || null,
        fluid_intake_time: formData.fluidIntakeTime || null,
        fluid_intake: formData.fluidIntake || null,
        fluid_output_time: formData.fluidOutputTime || null,
        fluid_output: formData.fluidOutput || null,
        urination: formData.urination || null,
        defecation: formData.defecation || null,
        sleep_hours: formData.sleepHours || null,
        sleep_quality: formData.sleepQuality || null,
        meal_times: formData.mealTimes.length > 0 ? formData.mealTimes.join(',') : null,
        feeding_type: formData.feedingType || null,
        feeding_frequency: formData.feedingFrequency || null,
        feeding_amount: formData.feedingAmount || null,
        feeding_time: formData.feedingTime || null,
        additional_notes: formData.additionalNotes || null,
        appointment: formData.appointment || null,
        image_urls: selectedImageUrls.length > 0 ? selectedImageUrls : null, // 🆕
      };

      console.log('🔵 Saving report with images:', selectedImageUrls.length);

      // 🆕 เรียก API ที่ต่างกันตามโหมด
      if (isEditMode && reportId) {
        await api.updateMultidisciplinaryReport(reportId, reportData);
        alert('สำเร็จ\nแก้ไขรายงานเรียบร้อยแล้ว');
      } else {
        await api.saveMultidisciplinaryReport(reportData);
        alert('สำเร็จ\nบันทึกรายงานเรียบร้อยแล้ว');
      }
      
      setShowShareButton(true);
    } catch (error) {
      console.error('Save error:', error);
      alert('ข้อผิดพลาด\nไม่สามารถบันทึกรายงานได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    const reportText = generateReportText();
    if (navigator.share) {
      navigator.share({ text: reportText }).catch(() => { });
    } else {
      navigator.clipboard.writeText(reportText);
      alert('คัดลอกไปยังคลิปบอร์ดแล้ว');
    }
  };

  // 🆕 Render รูปภาพจากหัตถการ
  const renderProcedureImages = () => {
    if (!selectedPatient) return null;

    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ImageIcon size={20} className="text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">รูปภาพการทำหัตถการ</h2>
            <span className="text-sm text-gray-500">
              ({selectedImages.length}/{procedureImages.length})
            </span>
          </div>
          
          {procedureImages.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={selectAllImages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-50 hover:bg-purple-100 text-purple-600 font-medium rounded-lg border border-purple-600 transition"
              >
                <CheckSquare size={16} />
                เลือกทั้งหมด
              </button>
              <button
                onClick={deselectAllImages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium rounded-lg border border-gray-300 transition"
              >
                <Square size={16} />
                ยกเลิกทั้งหมด
              </button>
            </div>
          )}
        </div>

        {isLoadingImages ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            <p className="mt-3 text-gray-600">กำลังโหลดรูปภาพ...</p>
          </div>
        ) : procedureImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
            <ImageIcon size={48} className="text-gray-300" />
            <p className="mt-4 text-lg font-semibold text-gray-600">ไม่มีรูปภาพจากหัตถการในวันนี้</p>
            <p className="mt-2 text-sm text-gray-500">รูปภาพจะแสดงเมื่อมีการบันทึกหัตถการพร้อมรูปภาพ</p>
          </div>
        ) : (
          <>
            {/* Image Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
              {procedureImages.map((image, index) => {
                const isSelected = selectedImages.includes(index);
                
                return (
                  <div
                    key={`${image.id}-${index}`}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      isSelected ? 'border-purple-600 shadow-lg' : 'border-gray-200 hover:border-purple-400'
                    }`}
                    onClick={() => toggleImageSelection(index)}
                  >
                    <img
                      src={image.image_url}
                      alt={`Procedure ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Checkbox */}
                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'bg-purple-600' : 'bg-white border-2 border-gray-300'
                    }`}>
                      {isSelected && <CheckSquare size={16} className="text-white" />}
                    </div>

                    {/* Time Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-xs font-semibold text-white truncate">
                        {image.record_time}
                      </p>
                    </div>

                    {/* Selection Overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-purple-600 bg-opacity-20"></div>
                    )}

                    {/* Zoom button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewImageUrl(image.image_url);
                      }}
                      className="absolute top-2 left-2 p-1.5 bg-white/90 hover:bg-white rounded-full transition opacity-0 hover:opacity-100"
                    >
                      <Search size={14} className="text-gray-700" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Help Text */}
            <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <Info size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-purple-700">
                แตะที่รูปเพื่อเลือก/ยกเลิก • รูปที่เลือกจะแนบไปกับรายงาน • คลิกที่ไอคอนแว่นขยายเพื่อดูรูปขนาดใหญ่
              </p>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Users size={28} className="text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {isEditMode ? 'แก้ไขรายงานสหวิชาชีพ + ยา' : 'รายงานสหวิชาชีพ + ยา'}
              </h1>
              {isEditMode && (
                <p className="text-sm text-gray-600">Edit Multidisciplinary Report</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              <Save size={20} />
              {isSaving ? 'กำลังบันทึก...' : (isEditMode ? 'บันทึกการแก้ไข' : 'บันทึก')}
            </button>
            {showShareButton && (
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                <Share2 size={20} />
                แชร์
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">ข้อมูลผู้ป่วย</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSearchModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-lg border border-blue-600 transition"
              >
                <Search size={20} />
                ค้นหา
              </button>
              {selectedPatient && (
                <button
                  onClick={handleGenerateQR}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 font-semibold rounded-lg border border-purple-600 transition"
                >
                  <QrCode size={20} />
                  สร้าง QR
                </button>
              )}
            </div>
          </div>

          {isLoadingPatient && (
            <div className="flex flex-col items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p className="mt-3 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          )}

          {selectedPatient ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                  <User size={24} className="text-blue-700" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-blue-900 text-lg">
                    {selectedPatient.first_name} {selectedPatient.last_name}
                  </p>
                  <p className="text-sm text-blue-700">
                    HN: {selectedPatient.hn} | อายุ: {selectedPatient.age} ปี | เพศ: {selectedPatient.gender}
                  </p>
                  {selectedPatient.chronic_diseases && (
                    <p className="text-xs text-red-600 italic mt-1">
                      โรคประจำตัว: {selectedPatient.chronic_diseases}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowSearchModal(true)}
                  className="p-2 hover:bg-blue-100 rounded-lg transition"
                >
                  <Search size={20} className="text-gray-600" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSearchModal(true)}
              className="w-full bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-8 flex flex-col items-center hover:bg-blue-100 transition"
            >
              <UserPlus size={32} className="text-blue-600" />
              <p className="mt-3 font-semibold text-blue-600">กดเพื่อเลือกผู้ป่วย</p>
              <p className="text-sm text-gray-600 mt-1">ค้นหาด้วย เลขห้อง, HN, ชื่อ, หรือนามสกุล</p>
            </button>
          )}

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลขห้อง <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => handleChange('roomNumber', e.target.value)}
                placeholder="กรอกเลขห้อง เช่น 301"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">เวร</label>
              <select
                value={formData.shift}
                onChange={(e) => handleChange('shift', e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="D">D (กลางวัน)</option>
                <option value="E">E (เย็น)</option>
                <option value="N">N (กลางคืน)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันที่</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 🆕 Procedure Images Section */}
        {renderProcedureImages()}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">สหวิชาชีพ + ยา</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              อาการโดยรวม (ภายใน 24 ชม.) <span className="text-red-500">*</span>
              <span className="block text-xs text-gray-500 font-normal">*รวมถึงยา และกิจวัตรประจำวัน</span>
            </label>
            <textarea
              value={formData.overallCondition}
              onChange={(e) => handleChange('overallCondition', e.target.value)}
              placeholder="อธิบายอาการโดยรวม"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">สัญญาณชีพ</label>
            <select
              value={formData.vitalSigns}
              onChange={(e) => handleChange('vitalSigns', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="คงที่">คงที่</option>
              <option value="ไม่คงที่">ไม่คงที่</option>
              <option value="ต้องติดตาม">ต้องติดตาม</option>
            </select>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-green-800 mb-3">รายละเอียดสัญญาณชีพ</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">อุณหภูมิ (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => handleChange('temperature', e.target.value)}
                  placeholder="36.5"
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชีพจร</label>
                <input
                  type="number"
                  value={formData.pulse}
                  onChange={(e) => handleChange('pulse', e.target.value)}
                  placeholder="72"
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หายใจ</label>
                <input
                  type="number"
                  value={formData.respiration}
                  onChange={(e) => handleChange('respiration', e.target.value)}
                  placeholder="18"
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ความดันโลหิต</label>
                <input
                  type="text"
                  value={formData.bloodPressure}
                  onChange={(e) => handleChange('bloodPressure', e.target.value)}
                  placeholder="120/80"
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ออกซิเจน (%)</label>
                <input
                  type="number"
                  value={formData.o2sat}
                  onChange={(e) => handleChange('o2sat', e.target.value)}
                  placeholder="98"
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ปัสสาวะ (ครั้ง)</label>
              <input
                type="number"
                value={formData.urination}
                onChange={(e) => handleChange('urination', e.target.value)}
                placeholder="4"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">อุจจาระ (ครั้ง)</label>
              <input
                type="number"
                value={formData.defecation}
                onChange={(e) => handleChange('defecation', e.target.value)}
                placeholder="2"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมายเหตุเพิ่มเติม
            </label>
            <textarea
              value={formData.additionalNotes}
              onChange={(e) => handleChange('additionalNotes', e.target.value)}
              placeholder="ระบุหมายเหตุเพิ่มเติม"
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ผู้รายงาน</label>
            <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
              {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.nickname || 'ผู้ใช้งาน'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">การนัดหมาย (Appointment)</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">สหวิชาชีพ</label>
            <input
              type="text"
              value={formData.appointment}
              onChange={(e) => handleChange('appointment', e.target.value)}
              placeholder="ระบุการนัดหมาย"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900 mb-1">คำแนะนำในการกรอกข้อมูล</p>
            <p className="text-xs text-blue-700">
              • ฟิลด์ที่มี <span className="text-red-500">*</span> จำเป็นต้องกรอก<br />
              • ค้นหาผู้ป่วย: สามารถค้นหาด้วยเลขห้อง (เช่น 301) เพื่อหาผู้ป่วยในห้องนั้นได้ทันที<br />
              • รูปภาพหัตถการ: เลือกรูปที่ต้องการแนบกับรายงาน<br />
              • QR Code: สร้างเพื่อให้ญาติหรือพนักงานสแกนและกรอกข้อมูลได้ง่ายขึ้น
            </p>
          </div>
        </div>
      </div>

      <PatientSearch
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectPatient={handleSelectPatient}
      />

      {/* 🆕 Image Modal */}
      <ImageModal
        visible={viewImageUrl !== null}
        onClose={() => setViewImageUrl(null)}
        imageUrl={viewImageUrl}
      />
    </div>
  );
}