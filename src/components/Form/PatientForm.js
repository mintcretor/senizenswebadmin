import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload, AlertCircle, CheckCircle, Pencil } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// 1. นำเข้า api และ helper สำหรับ URL รูปภาพ
import api, { getImageBaseURL } from '../../api/baseapi';

console.log('API Base URL:', process.env.REACT_APP_API_BASE_URL);
// Helper function สำหรับคำนวณอายุ
const calculateAge = (birthDate) => {
  if (!birthDate) return '';

  const today = new Date();
  const birth = new Date(birthDate);

  if (isNaN(birth.getTime())) return '';

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age >= 0 ? age.toString() : '';
};

// FileUpload Component
const FileUpload = ({ onFileUpload, isUploading, existingImageUrl }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(existingImageUrl || null);
  const [uploadStatus, setUploadStatus] = useState(null);

  useEffect(() => {
    if (existingImageUrl) {
      setPreviewUrl(existingImageUrl);
      setUploadStatus('success');
    }
  }, [existingImageUrl]);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      console.error('No file selected');
      return;
    }

    if (!file.type.startsWith('image/')) {
      console.error('Selected file is not an image');
      return;
    }

    console.log('📁 File to upload:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setUploadStatus('uploading');

    const formData = new FormData();
    formData.append('image', file);

    // ตรวจสอบว่า FormData มีข้อมูล
    console.log('📤 Sending FormData...');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      // ✅ วิธีที่ 1: ใช้ axios โดยไม่ระบุ config เลย
      const response = await api.post('/patients/upload-image', formData);

      console.log('✅ Response:', response.data);

      const result = response.data;
      if (result.success && result.data) {
        setUploadStatus('success');
        const imgPath = result.data.imageUrl || result.data.url;

        // ✅ แก้ไขการสร้าง URL
        let fullUrl;
        if (imgPath.startsWith('http')) {
          // ถ้าเป็น full URL อยู่แล้ว
          fullUrl = imgPath;
        } else {
          // ลบ / ตัวหน้าออก (ถ้ามี) เพราะ getImageBaseURL() มี / ต่อท้ายอยู่แล้ว
          // const cleanPath = imgPath.startsWith('/') ? imgPath.substring(1) : imgPath;
          fullUrl = `${getImageBaseURL()}${imgPath}`;
          console.log('🖼️ Constructed Image URL:', fullUrl);
        }

        console.log('✅ Full image URL:', fullUrl);
        onFileUpload(fullUrl);
      } else {
        setUploadStatus('error');
        console.error('❌ Upload failed:', result.message);
      }
    } catch (error) {
      setUploadStatus('error');
      console.error('❌ Upload error:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        id="imageUpload"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading || uploadStatus === 'uploading'}
      />
      <label
        htmlFor="imageUpload"
        className="cursor-pointer flex flex-col items-center justify-center w-full h-48 sm:h-56 md:h-64 lg:h-72 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
      >
        {previewUrl ? (
          <div className="relative w-full h-full flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            {uploadStatus === 'uploading' && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-white text-xs sm:text-sm">กำลังอัพโหลด...</div>
              </div>
            )}
            {uploadStatus === 'success' && (
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-500" />
              </div>
            )}
            {uploadStatus === 'error' && (
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6 text-red-500" />
              </div>
            )}
          </div>
        ) : (
          <>
            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mb-2" />
            <p className="text-xs sm:text-sm text-gray-500 text-center px-2">
              คลิกเพื่ออัพโหลดรูปภาพ
            </p>
          </>
        )}
      </label>
    </div>
  );
};
const DateField = ({ label, value, onChange, error, required = false }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [viewMode, setViewMode] = useState('day'); // 'day' | 'month' | 'year'
  const [viewDate, setViewDate] = useState(() => {
  if (value) return new Date(value + 'T00:00:00');
  return new Date();
});

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  const displayValue = selectedDate
    ? `${String(selectedDate.getDate()).padStart(2, '0')}/${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${selectedDate.getFullYear()}`
    : '';

  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const thaiDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleSelectDay = (day) => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateStr);
    setShowPicker(false);
  };
useEffect(() => {
  if (value) {
    setViewDate(new Date(value + 'T00:00:00'));
  }
}, [value]);
  const handleSelectMonth = (monthIndex) => {
    setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
    setViewMode('day');
  };

  const handleSelectYear = (year) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setViewMode('month');
  };

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const renderDayGrid = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const cells = [];

    for (let i = 0; i < firstDay; i++) cells.push(<div key={`e-${i}`} />);

    for (let d = 1; d <= daysInMonth; d++) {
      const isSelected = selectedDate &&
        selectedDate.getDate() === d &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;
      const isToday = new Date().getDate() === d &&
        new Date().getMonth() === month &&
        new Date().getFullYear() === year;

      cells.push(
        <button
          key={d}
          type="button"
          onClick={() => handleSelectDay(d)}
          className={`w-8 h-8 text-xs rounded-full flex items-center justify-center transition-colors
            ${isSelected ? 'bg-blue-600 text-white font-bold' :
              isToday ? 'border border-blue-400 text-blue-600 font-semibold' :
              'hover:bg-blue-50 text-gray-700'}`}
        >
          {d}
        </button>
      );
    }
    return cells;
  };

  const renderMonthGrid = () => {
    return thaiMonths.map((m, i) => {
      const isSelected = selectedDate && selectedDate.getMonth() === i &&
        selectedDate.getFullYear() === viewDate.getFullYear();
      return (
        <button
          key={i}
          type="button"
          onClick={() => handleSelectMonth(i)}
          className={`py-2 text-xs rounded-lg transition-colors
            ${isSelected ? 'bg-blue-600 text-white font-bold' : 'hover:bg-blue-50 text-gray-700'}`}
        >
          {m}
        </button>
      );
    });
  };

  const renderYearGrid = () => {
    const currentYear = viewDate.getFullYear();
    const startYear = currentYear - 6;
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);
    return years.map(y => {
      const isSelected = selectedDate && selectedDate.getFullYear() === y;
      return (
        <button
          key={y}
          type="button"
          onClick={() => handleSelectYear(y)}
          className={`py-2 text-xs rounded-lg transition-colors
            ${isSelected ? 'bg-blue-600 text-white font-bold' : 'hover:bg-blue-50 text-gray-700'}`}
        >
          {y}
        </button>
      );
    });
  };

  return (
    <div className="flex flex-col relative">
      <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Input แสดงวันที่ */}
      <div
        className={`flex items-center px-3 py-2 border rounded-lg cursor-pointer bg-white
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${showPicker ? 'ring-2 ring-blue-500 border-transparent' : 'hover:border-gray-400'}`}
        onClick={() => { setShowPicker(!showPicker); setViewMode('day'); }}
      >
        <span className={`flex-1 text-sm ${displayValue ? 'text-gray-900' : 'text-gray-400'}`}>
          {displayValue || 'วว/ดด/ปปปป'}
        </span>
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}

      {/* Popup ปฏิทิน */}
      {showPicker && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />

          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-3 w-64">

            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <button type="button" onClick={prevMonth}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex space-x-1">
                <button type="button"
                  onClick={() => setViewMode(viewMode === 'month' ? 'day' : 'month')}
                  className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg">
                  {thaiMonths[viewDate.getMonth()]}
                </button>
                <button type="button"
                  onClick={() => setViewMode(viewMode === 'year' ? 'day' : 'year')}
                  className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg">
                  {viewDate.getFullYear()}
                </button>
              </div>

              <button type="button" onClick={nextMonth}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day View */}
            {viewMode === 'day' && (
              <>
                <div className="grid grid-cols-7 mb-1">
                  {thaiDays.map(d => (
                    <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                  {renderDayGrid()}
                </div>
              </>
            )}

            {/* Month View */}
            {viewMode === 'month' && (
              <div className="grid grid-cols-3 gap-1">
                {renderMonthGrid()}
              </div>
            )}

            {/* Year View */}
            {viewMode === 'year' && (
              <div className="grid grid-cols-3 gap-1">
                {renderYearGrid()}
              </div>
            )}

            {/* ปุ่มล้างค่า */}
            {selectedDate && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <button type="button"
                  onClick={() => { onChange(''); setShowPicker(false); }}
                  className="w-full text-xs text-gray-500 hover:text-red-500 py-1">
                  ล้างวันที่
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
// InputField Component (เหมือนเดิม)
const InputField = ({ label, placeholder, type = "text", value, onChange, error, onBlur, required = false, readOnly = false, lang }) => {
  return (
    <div className="flex flex-col">
      <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        readOnly={readOnly}
        lang={lang}
        className={`px-2 py-2 sm:px-3 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-500' : 'border-gray-300'
          } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
};

// SelectField Component (เหมือนเดิม)
const SelectField = ({ label, options, value, onChange, placeholder, error, required = false, loading = false, disabled = false }) => {
  const safeOptions = options || [];

  return (
    <div className="flex flex-col">
      <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value || ''}
        onChange={onChange}
        disabled={loading || disabled}
        className={`px-2 py-2 sm:px-3 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-500' : 'border-gray-300'
          } ${(loading || disabled) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      >
        <option value="">
          {loading ? 'กำลังโหลด...' :
            disabled ? 'กรุณาเลือกข้อมูลก่อนหน้า' :
              placeholder}
        </option>
        {safeOptions.map((option, index) => (
          <option key={option.value || index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
};

// Toast notification component (เหมือนเดิม)
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 left-4 sm:left-auto sm:right-4 sm:w-auto max-w-sm p-3 sm:p-4 rounded-lg shadow-lg z-50 ${type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' : 'bg-blue-500'
      } text-white`}>
      <div className="flex items-center space-x-2">
        {type === 'success' && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
        {type === 'error' && <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
        <span className="text-sm sm:text-base flex-1">{message}</span>
        <button onClick={onClose} className="ml-2 flex-shrink-0">
          <X className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
};

const PatientForm = ({ mode = "add" }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const patientFromState = location.state?.patientData || ''; // แก้ไขการรับ state ให้ถูกต้องถ้ามีการส่งมา

  // Modal states
  const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isVNModalOpen, setIsVNModalOpen] = useState(false);
  const [newPatientId, setNewPatientId] = useState(null);

  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Data states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);

  // Toast notification
  const [toast, setToast] = useState(null);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Patient data
  const [patientData, setPatientData] = useState({
    hn: '',
    idCard: '',
    prename: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    age: '',
    gender: '',
    religion: '',
    nationality: 'ไทย',
    race: 'ไทย',
    bloodGroup: '',
    houseNumber: '',
    village: '',
    subDistrict: '',
    district: '',
    province: '',
    chronicDisease: '',
    contactPhone: ''
  });

  const prenameOptions = [
    // --- บุคคลธรรมดา (ภาษาไทย) ---
    { value: 'คุณ', label: 'คุณ' }, // เพิ่มตามคำขอ (นิยมใช้นำหน้าชื่อเพื่อความสุภาพ)
    { value: 'นาย', label: 'นาย' },
    { value: 'นาง', label: 'นาง' },
    { value: 'นางสาว', label: 'นางสาว' },
    { value: 'เด็กชาย', label: 'เด็กชาย' },
    { value: 'เด็กหญิง', label: 'เด็กหญิง' },

    // --- General (English) ---
    { value: 'Mr.', label: 'Mr.' },
    { value: 'Mrs.', label: 'Mrs.' },
    { value: 'Ms.', label: 'Ms.' },
    { value: 'Miss', label: 'Miss' },
    { value: 'Mx.', label: 'Mx.' },
    { value: 'Dr.', label: 'Dr.' },

    // --- วิชาการ / การแพทย์ (Academic & Medical) ---
    { value: 'ดร.', label: 'ดร.' },
    { value: 'นพ.', label: 'นพ.' },
    { value: 'พญ.', label: 'พญ.' },
    { value: 'ทพ.', label: 'ทพ.' },
    { value: 'ทพญ.', label: 'ทพญ.' },
    { value: 'ภก.', label: 'ภก.' },
    { value: 'ภญ.', label: 'ภญ.' },
    { value: 'สพ.ญ.', label: 'สพ.ญ.' },
    { value: 'นสพ.', label: 'นสพ.' },
    { value: 'ศ.', label: 'ศ.' },
    { value: 'รศ.', label: 'รศ.' },
    { value: 'ผศ.', label: 'ผศ.' },
    { value: 'อ.', label: 'อ.' },

    // --- ยศตำรวจ / ทหาร (Rank - Common) ---
    { value: 'พล.ต.อ.', label: 'พล.ต.อ.' },
    { value: 'พล.ต.ท.', label: 'พล.ต.ท.' },
    { value: 'พล.ต.ต.', label: 'พล.ต.ต.' },
    { value: 'พ.ต.อ.', label: 'พ.ต.อ.' },
    { value: 'พ.ต.ท.', label: 'พ.ต.ท.' },
    { value: 'พ.ต.ต.', label: 'พ.ต.ต.' },
    { value: 'ร.ต.อ.', label: 'ร.ต.อ.' },
    { value: 'ร.ต.ท.', label: 'ร.ต.ท.' },
    { value: 'ร.ต.ต.', label: 'ร.ต.ต.' },
    { value: 'พล.อ.', label: 'พล.อ.' },
    { value: 'พล.ร.อ.', label: 'พล.ร.อ.' },
    { value: 'พล.อ.อ.', label: 'พล.อ.อ.' },
    { value: 'ว่าที่ร้อยตรี', label: 'ว่าที่ร้อยตรี' },

    // --- ฐานันดรศักดิ์ (Royal Titles) ---
    { value: 'ม.ร.ว.', label: 'ม.ร.ว.' },
    { value: 'ม.ล.', label: 'ม.ล.' },

    // --- อื่นๆ ---
    { value: 'พระ', label: 'พระ' },
    { value: 'ทนาย', label: 'ทนาย' },
  ];

  // Allergies data
  const [allergies, setAllergies] = useState([]);
  const [newAllergy, setNewAllergy] = useState({
    type: 'drug',
    name: '',
    severity: 'mild',
    symptoms: '',
    notes: ''
  });

  // Emergency contacts data
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    address: ''
  });
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // Load initial data
  useEffect(() => {
    if (mode === "edit") {
      loadPatientDataForEdit();
    } else {
      loadProvinces();
      loadGeneratedHN();
    }
  }, [mode, id]);

  useEffect(() => {
    if (mode === "edit" && initialDataLoaded && patientData.province) {
      const loadLocationData = async () => {
        if (patientData.province) {
          await loadDistricts(patientData.province);
        }
        if (patientData.district) {
          await loadSubDistricts(patientData.district);
        }
      };

      loadLocationData();
    }
  }, [initialDataLoaded, patientData.province, patientData.district]);

  // ฟังก์ชัน API Calls ใหม่ที่ใช้ api instance

  const loadGeneratedHN = async () => {
    if (mode === "add") {
      setIsLoading(true);
      try {
        const response = await api.get('/patients/generate-next-hn');
        const result = response.data;
        if (result.success) {
          setPatientData(prev => ({
            ...prev,
            hn: result.data.hn
          }));
        } else {
          showToast('ไม่สามารถสร้าง HN อัตโนมัติได้ กรุณากรอกเอง', 'error');
        }
      } catch (error) {
        console.error('Error generating HN:', error);
        showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const loadProvinces = async () => {
    try {
      const response = await api.get('/location/provinces');
      const result = response.data;

      if (result.success && result.data) {
        setProvinces(result.data.map(province => ({
          value: province.id,
          label: province.name_th
        })));
      } else {
        setProvinces([]);
        showToast('ไม่สามารถโหลดข้อมูลจังหวัดได้', 'error');
      }
    } catch (error) {
      console.error('Load provinces error:', error);
      setProvinces([]);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    }
  };

  const loadDistricts = async (provinceId) => {
    if (!provinceId) {
      setDistricts([]);
      setSubDistricts([]);
      return;
    }

    try {
      const response = await api.get(`/location/districts/${provinceId}`);
      const result = response.data;

      if (result.success && result.data) {
        setDistricts(result.data.map(d => ({
          value: d.id,
          label: d.name_th
        })));
      } else {
        setDistricts([]);
      }
    } catch (error) {
      console.error('Load districts error:', error);
      setDistricts([]);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลอำเภอ', 'error');
    }
  };

  const loadSubDistricts = async (districtId) => {
    if (!districtId) {
      setSubDistricts([]);
      return;
    }

    try {
      const response = await api.get(`/location/sub-districts/${districtId}`);
      const result = response.data;

      if (result.success && result.data) {
        setSubDistricts(result.data.map(s => ({
          value: s.id,
          label: s.name_th
        })));
      } else {
        setSubDistricts([]);
      }
    } catch (error) {
      console.error('Load sub-districts error:', error);
      setSubDistricts([]);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลตำบล', 'error');
    }
  };

  const loadPatientDataForEdit = async () => {
    try {
      setIsLoading(true);

      await loadProvinces();

      if (patientFromState) {
        populateFormData(patientFromState);
      } else {
        const response = await api.get(`/patients/${id}`);
        const result = response.data;

        if (result.success && result.data) {
          populateFormData(result.data);
        } else {
          showToast('ไม่สามารถโหลดข้อมูลผู้รับบริการได้', 'error');
          navigate('/Patient');
        }
      }

      setInitialDataLoaded(true);

    } catch (error) {
      console.error('Load patient data error:', error);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
      navigate('/Patient');
    } finally {
      setIsLoading(false);
    }
  };

  const checkHNExists = async (hn) => {
    try {
      const response = await api.get(`/patients/check-hn/${hn}`);
      return response.data;
    } catch (error) {
      console.error('Check HN error:', error);
      return { success: false };
    }
  };

  const savePatientData = async (patientData, allergies, emergencyContacts, imageUrl = null) => {
    // ✅ แปลง full URL เป็น path อย่างเดียว
    let imagePath = null;
    if (imageUrl) {
      if (imageUrl.startsWith('http')) {
        // ถ้าเป็น full URL ให้ตัดเอาแค่ path
        const baseUrl = getImageBaseURL();
        imagePath = imageUrl.replace(baseUrl, '');
      } else {
        // ถ้าเป็น path อยู่แล้ว ใช้เลย
        imagePath = imageUrl;
      }
    }

    const payload = {
      patientData: {
        ...patientData,
        imageUrl: imagePath  // ✅ ส่งแค่ path ไปบันทึก
      },
      allergies: allergies || [],
      emergencyContacts: emergencyContacts || [],
      addresses: patientData.province || patientData.district || patientData.subDistrict ? [{
        houseNumber: patientData.houseNumber,
        village: patientData.village,
        subDistrict: patientData.subDistrict,
        district: patientData.district,
        province: patientData.province
      }] : []
    };

    const endpoint = mode === "edit" ? `/patients/${id}` : '/patients';

    if (mode === "edit") {
      return await api.put(endpoint, payload);
    } else {
      return await api.post(endpoint, payload);
    }
  };

  const populateFormData = (data) => {
    // Logic เหมือนเดิม
    let formattedBirthDate = '';
    if (data.birth_date || data.birthDate) {
      const birthDateStr = data.birth_date || data.birthDate;
      const dateObj = new Date(birthDateStr);
      if (!isNaN(dateObj.getTime())) {
        formattedBirthDate = dateObj.toISOString().split('T')[0];
      }
    }

    let genderValue = data.gender || '';
    if (genderValue === 'ช') genderValue = 'ชาย';
    else if (genderValue === 'ญ' || genderValue === 'หญ') genderValue = 'หญิง';

    setPatientData({
      hn: data.hn || '',
      idCard: data.id_card || data.idCard || '',
      prename: data.prename || '',
      firstName: data.first_name || data.firstName || '',
      lastName: data.last_name || data.lastName || '',
      birthDate: formattedBirthDate,
      age: data.age || '',
      gender: genderValue,
      religion: data.religion || '',
      nationality: data.nationality || 'ไทย',
      race: data.ethnicity || data.race || 'ไทย',
      bloodGroup: data.blood_type || data.bloodGroup || '',
      houseNumber: data.house_number || data.houseNumber || '',
      village: data.village || '',
      subDistrict: data.sub_district || data.subdistrict || data.subDistrict || '',
      district: data.district || '',
      province: data.province || '',
      chronicDisease: data.chronic_disease || data.chronicDisease || '',
      contactPhone: data.mobile || data.phone || data.contactPhone || ''
    });

    if (data.allergies) {
      setAllergies(data.allergies);
    }
    if (data.emergencyContacts) {
      setEmergencyContacts(data.emergencyContacts);
    }

    if (data.imageUrl || data.profile_image) {
      let img = data.imageUrl || data.profile_image;
      // เช็คว่าเป็น full URL หรือ path
      if (img && !img.startsWith('http')) {
        img = getImageBaseURL() + img;
      }
      setImageUrl(img);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!patientData.hn) newErrors.hn = 'กรุณากรอก HN';
    if (!patientData.firstName) newErrors.firstName = 'กรุณากรอกชื่อ';
    if (!patientData.lastName) newErrors.lastName = 'กรุณากรอกนามสกุล';

    if (mode === "add") {
      if (!patientData.idCard) newErrors.idCard = 'กรุณากรอกเลขบัตรประชาชน';
      if (!patientData.birthDate) newErrors.birthDate = 'กรุณากรอกวันเกิด';
      if (!patientData.gender) newErrors.gender = 'กรุณาเลือกเพศ';
    }

    // validation patterns เหมือนเดิม
    //if (patientData.idCard && !/^\d{13}$/.test(patientData.idCard)) {
    //  newErrors.idCard = 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก';
    //}

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleHNBlur = async () => {
    if (patientData.hn && mode === "add") {
      const result = await checkHNExists(patientData.hn);
      if (result.success && result.data && result.data.exists) {
        setErrors(prev => ({ ...prev, hn: 'HN นี้มีอยู่ในระบบแล้ว' }));
      } else {
        setErrors(prev => ({ ...prev, hn: '' }));
      }
    }
  };

  const updatePatientData = (field, value) => {
    setPatientData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      if (field === 'birthDate') {
        newData.age = calculateAge(value);
      }

      if (field === 'province') {
        newData.district = '';
        newData.subDistrict = '';
        loadDistricts(value);
        setSubDistricts([]);
      }

      if (field === 'district') {
        newData.subDistrict = '';
        loadSubDistricts(value);
      }

      return newData;
    });

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleImageUpload = (url) => {
    setImageUrl(url);
    showToast('อัพโหลดรูปภาพสำเร็จ', 'success');
  };

  // Modal functions
  const openAllergyModal = () => setIsAllergyModalOpen(true);
  const closeAllergyModal = () => {
    setIsAllergyModalOpen(false);
    setNewAllergy({
      type: 'drug',
      name: '',
      severity: 'mild',
      symptoms: '',
      notes: ''
    });
  };

  const openContactModal = () => setIsContactModalOpen(true);
  const closeContactModal = () => {
    setIsContactModalOpen(false);
    setNewContact({
      name: '',
      relationship: '',
      phone: '',
      address: ''
    });
  };

  const openConfirmModal = () => {
    if (validateForm()) {
      setIsConfirmModalOpen(true);
    } else {
      showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', 'error');
    }
  };

  const closeConfirmModal = () => setIsConfirmModalOpen(false);
  const openVNModal = () => setIsVNModalOpen(true);
  const closeVNModal = () => setIsVNModalOpen(false);

  // Add allergy
  const addAllergy = () => {
    if (newAllergy.name.trim()) {
      setAllergies(prev => [...(prev || []), { ...newAllergy, id: Date.now() }]);
      closeAllergyModal();
      showToast('เพิ่มข้อมูลการแพ้สำเร็จ', 'success');
    }
  };

  const removeAllergy = (id) => {
    setAllergies(prev => (prev || []).filter(allergy => allergy.id !== id));
    showToast('ลบข้อมูลการแพ้สำเร็จ', 'success');
  };

  // Add emergency contact
  const addContact = () => {
    if (newContact.name.trim() && newContact.relationship.trim() && newContact.phone.trim()) {
      if (!/^\d{10}$/.test(newContact.phone)) {
        showToast('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก', 'error');
        return;
      }

      setEmergencyContacts(prev => [...(prev || []), { ...newContact, id: Date.now() }]);
      closeContactModal();
      showToast('เพิ่มผู้ติดต่อฉุกเฉินสำเร็จ', 'success');
    } else {
      showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
    }
  };

  const removeContact = (id) => {
    setEmergencyContacts(prev => (prev || []).filter(contact => contact.id !== id));
    showToast('ลบผู้ติดต่อฉุกเฉินสำเร็จ', 'success');
  };

  const openEditContactModal = (contact) => {
    setEditingContact({ ...contact });
    setIsEditContactModalOpen(true);
  };

  const closeEditContactModal = () => {
    setIsEditContactModalOpen(false);
    setEditingContact(null);
  };

  const saveEditContact = () => {
    if (!editingContact.name.trim() || !editingContact.relationship.trim() || !editingContact.phone.trim()) {
      showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }
    if (!/^\d{10}$/.test(editingContact.phone)) {
      showToast('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก', 'error');
      return;
    }
    setEmergencyContacts(prev =>
      prev.map(c => c.id === editingContact.id ? { ...editingContact } : c)
    );
    closeEditContactModal();
    showToast('แก้ไขผู้ติดต่อฉุกเฉินสำเร็จ', 'success');
  };

  // Save data
  const handleSaveData = () => {
    openConfirmModal();
  };

  const confirmSave = async () => {
    setIsSaving(true);
    try {
      const response = await savePatientData(patientData, allergies, emergencyContacts, imageUrl);
      const result = response.data; // รับ data จาก axios response

      if (result.success) {
        closeConfirmModal();

        if (mode === "edit") {
          showToast('บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
          setTimeout(() => {
            navigate('/Patient');
          }, 2000);
        } else {
          if (result.data && result.data.patientId) {
            setNewPatientId(result.data.patientId);
            openVNModal();
            showToast('บันทึกข้อมูลผู้ป่วยสำเร็จ', 'success');
          }
        }
      } else {
        showToast(`เกิดข้อผิดพลาด: ${result.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error("Save error:", error);
      const msg = error.response?.data?.message || error.message;
      showToast(`เกิดข้อผิดพลาด: ${msg}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const goToAddPatientVN = () => {
    closeVNModal();
    navigate(`/an-vn/add/${newPatientId}`);
  };

  const getSaveButtonText = () => {
    if (isSaving) {
      return mode === "edit" ? 'กำลังแก้ไข...' : 'กำลังบันทึก...';
    }
    return mode === "edit" ? 'แก้ไขข้อมูล' : 'บันทึกข้อมูล';
  };

  const goToPatientPage = () => {
    closeVNModal();
    navigate('/patients');
  };

  // Options
  const genderOptions = [
    { value: 'ชาย', label: 'ชาย' },
    { value: 'หญิง', label: 'หญิง' },
    { value: 'อื่นๆ', label: 'อื่นๆ' }
  ];

  const bloodGroupOptions = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'AB', label: 'AB' },
    { value: 'O', label: 'O' }
  ];

  const religionOptions = [
    { value: 'buddhist', label: 'พุทธ' },
    { value: 'christian', label: 'คริสต์' },
    { value: 'islamic', label: 'อิสลาม' },
    { value: 'hindu', label: 'ฮินดู' },
    { value: 'other', label: 'อื่นๆ' }
  ];

  // ... (ส่วน JSX UI ด้านล่างเหมือนเดิมทุกประการ ไม่ต้องเปลี่ยนแปลง)
  // เพื่อความกระชับของคำตอบ ผมจะละส่วน JSX ที่ยาวมากไว้ 
  // แต่ในการใช้งานจริงคุณสามารถ Copy JSX จากโค้ดเก่ามาวางต่อจากบรรทัดนี้ได้เลยครับ

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen p-2 sm:p-4 lg:p-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <div className="text-center text-sm sm:text-base">กำลังโหลด...</div>
          </div>
        </div>
      )}

      {/* Form Container - Responsive */}
      <div className="bg-white p-3 sm:p-6 lg:p-8 rounded-lg shadow-md">
        {/* Personal Info Section */}
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">ข้อมูลส่วนตัว</h2>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Image Upload Column - Responsive */}
          {/* Image Upload Column - Responsive */}
          <div className="flex flex-col items-center justify-center p-2 sm:p-4 border border-dashed border-gray-300 rounded-lg h-full order-first lg:order-none">
            <FileUpload
              onFileUpload={handleImageUpload}
              isUploading={isImageUploading}
              existingImageUrl={imageUrl}
            />
          </div>

          {/* Form Fields Column - Responsive Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <InputField
              label="HN"
              placeholder="HN"
              value={patientData.hn}
              onChange={(e) => updatePatientData('hn', e.target.value)}
              onBlur={handleHNBlur}
              error={errors.hn}
              required
              readOnly={true}
            />
            <InputField
              label="เลขบัตรประชาชน"
              placeholder="เลขบัตรประชาชน"
              value={patientData.idCard}
              onChange={(e) => updatePatientData('idCard', e.target.value)}
              error={errors.idCard}
              required
            />

            <SelectField
              label="คำนำหน้า"
              options={prenameOptions}
              value={patientData.prename}
              onChange={(e) => updatePatientData('prename', e.target.value)}
              placeholder="เลือกคำนำหน้า"
              error={errors.prename}
              required
            />

            <InputField
              label="ชื่อ"
              placeholder="ชื่อ"
              value={patientData.firstName}
              onChange={(e) => updatePatientData('firstName', e.target.value)}
              error={errors.firstName}
              required
            />
            <InputField
              label="นามสกุล"
              placeholder="นามสกุล"
              value={patientData.lastName}
              onChange={(e) => updatePatientData('lastName', e.target.value)}
              error={errors.lastName}
              required
            />
            <DateField
              label="วัน / เดือน / ปีเกิด"
              value={patientData.birthDate}
              onChange={(val) => updatePatientData('birthDate', val)}
              error={errors.birthDate}
              required
            />
            <InputField
              label="อายุ (ปี)"
              placeholder="อายุจะคำนวนอัตโนมัติ"
              type="number"
              value={patientData.age}
              onChange={(e) => updatePatientData('age', e.target.value)}
              error={errors.age}
              readOnly={true}
            />
            <SelectField
              label="เพศ"
              options={genderOptions}
              value={patientData.gender}
              onChange={(e) => updatePatientData('gender', e.target.value)}
              placeholder="เลือกเพศ"
              error={errors.gender}
              required
            />
            <SelectField
              label="ศาสนา"
              options={religionOptions}
              value={patientData.religion}
              onChange={(e) => updatePatientData('religion', e.target.value)}
              placeholder="เลือกศาสนา"
            />

            <InputField
              label="สัญชาติ"
              placeholder="สัญชาติ"
              value={patientData.nationality}
              onChange={(e) => updatePatientData('nationality', e.target.value)}
            />
            <InputField
              label="เชื้อชาติ"
              placeholder="เชื้อชาติ"
              value={patientData.race}
              onChange={(e) => updatePatientData('race', e.target.value)}
            />
            <SelectField
              label="กรุ๊ปเลือด"
              options={bloodGroupOptions}
              value={patientData.bloodGroup}
              onChange={(e) => updatePatientData('bloodGroup', e.target.value)}
              placeholder="เลือกกรุ๊ปเลือด"
            />
          </div>
        </div>

        {/* Address Section */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">ที่อยู่ที่สามารถติดต่อได้</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <InputField
              label="บ้านเลขที่"
              placeholder="บ้านเลขที่"
              value={patientData.houseNumber}
              onChange={(e) => updatePatientData('houseNumber', e.target.value)}
            />
            <InputField
              label="หมู่"
              placeholder="หมู่"
              value={patientData.village}
              onChange={(e) => updatePatientData('village', e.target.value)}
            />
            <SelectField
              label="จังหวัด"
              options={provinces}
              value={patientData.province}
              onChange={(e) => updatePatientData('province', e.target.value)}
              placeholder="เลือกจังหวัด"
            />
            <SelectField
              label="อำเภอ"
              options={districts}
              value={patientData.district}
              onChange={(e) => updatePatientData('district', e.target.value)}
              placeholder="เลือกอำเภอ"
              disabled={!patientData.province}
            />
            <SelectField
              label="ตำบล"
              options={subDistricts}
              value={patientData.subDistrict}
              onChange={(e) => updatePatientData('subDistrict', e.target.value)}
              placeholder="เลือกตำบล"
              disabled={!patientData.district}
            />
          </div>
        </div>

        {/* Medical Info Section */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">ข้อมูลทางการแพทย์</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <InputField
              label="โรคประจำตัว"
              placeholder="โรคประจำตัว (ถ้ามี)"
              value={patientData.chronicDisease}
              onChange={(e) => updatePatientData('chronicDisease', e.target.value)}
            />
            <InputField
              label="เบอร์โทรศัพท์ติดต่อ"
              placeholder="เบอร์โทรศัพท์ติดต่อ"
              value={patientData.contactPhone}
              onChange={(e) => updatePatientData('contactPhone', e.target.value)}
              error={errors.contactPhone}
            />
          </div>

          <div className="mt-4 sm:mt-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 space-y-2 sm:space-y-0">
              <h3 className="text-base sm:text-lg font-medium text-gray-700">ข้อมูลการแพ้</h3>
              <button
                onClick={openAllergyModal}
                className="bg-green-500 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                <span>เพิ่มข้อมูลแพ้</span>
              </button>
            </div>

            {/* Allergy Table */}
            {Array.isArray(allergies) && allergies.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full bg-white border border-gray-200 rounded-lg text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อสิ่งที่แพ้</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ระดับความรุนแรง</th>
                      <th className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อาการ</th>
                      <th className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมายเหตุ</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การกระทำ</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allergies.map((allergy) => (
                      <tr key={allergy.id}>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${allergy.type === 'drug' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                            {allergy.type === 'drug' ? 'แพ้ยา' : 'แพ้อาหาร'}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 max-w-20 sm:max-w-none truncate">{allergy.allergen_name || allergy.name}</td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${allergy.severity === 'severe' ? 'bg-red-100 text-red-800' :
                            allergy.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                            {allergy.severity === 'severe' ? 'รุนแรง' :
                              allergy.severity === 'moderate' ? 'ปานกลาง' : 'เล็กน้อย'}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 max-w-32 truncate">{allergy.symptoms}</td>
                        <td className="hidden md:table-cell px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 max-w-32 truncate">{allergy.notes}</td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          <button
                            onClick={() => removeAllergy(allergy.id)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 space-y-2 sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">ผู้ติดต่อฉุกเฉิน</h2>
            <button
              onClick={openContactModal}
              className="bg-blue-500 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>เพิ่มผู้ติดต่อฉุกเฉิน</span>
            </button>
          </div>

          {/* Emergency Contacts Table */}
          {Array.isArray(emergencyContacts) && emergencyContacts.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full bg-white border border-gray-200 rounded-lg text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ความสัมพันธ์</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เบอร์โทรศัพท์</th>
                    <th className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ที่อยู่</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การกระทำ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emergencyContacts.map((contact) => (
                    <tr key={contact.id}>
                      <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium max-w-24 sm:max-w-none truncate">{contact.name}</td>
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {contact.relationship}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{contact.phone}</td>
                      <td className="hidden md:table-cell px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 max-w-32 truncate">{contact.address}</td>
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditContactModal(contact)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                            title="แก้ไข"
                          >
                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={() => removeContact(contact.id)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1"
                            title="ลบ"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-start space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8">
        <button
          onClick={handleSaveData}
          disabled={isSaving}
          className="bg-green-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          {isSaving && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          <span>{getSaveButtonText()}</span>
        </button>
        <button
          onClick={() => navigate('/Patient')}
          className="bg-red-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
        >
          ยกเลิก
        </button>
      </div>

      {/* Allergy Modal */}
      {isAllergyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            {/* ... Content of Allergy Modal ... */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">เพิ่มข้อมูลการแพ้</h3>
              <button onClick={closeAllergyModal} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทการแพ้</label>
                <select
                  value={newAllergy.type}
                  onChange={(e) => setNewAllergy({ ...newAllergy, type: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="drug">แพ้ยา</option>
                  <option value="food">แพ้อาหาร</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ{newAllergy.type === 'drug' ? 'ยา' : 'อาหาร'}ที่แพ้</label>
                <input
                  type="text"
                  value={newAllergy.name}
                  onChange={(e) => setNewAllergy({ ...newAllergy, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* ... other fields ... */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ระดับความรุนแรง</label>
                <select
                  value={newAllergy.severity}
                  onChange={(e) => setNewAllergy({ ...newAllergy, severity: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mild">เล็กน้อย</option>
                  <option value="moderate">ปานกลาง</option>
                  <option value="severe">รุนแรง</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">อาการที่เกิดขึ้น</label>
                <textarea
                  value={newAllergy.symptoms}
                  onChange={(e) => setNewAllergy({ ...newAllergy, symptoms: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
                <textarea
                  value={newAllergy.notes}
                  onChange={(e) => setNewAllergy({ ...newAllergy, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg"
                  rows="2"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={closeAllergyModal} className="px-4 py-2 border rounded-lg">ยกเลิก</button>
              <button onClick={addAllergy} className="px-4 py-2 bg-green-600 text-white rounded-lg">เพิ่มข้อมูล</button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4">
            {/* ... Content similar to original ... */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">เพิ่มผู้ติดต่อฉุกเฉิน</h3>
              <button onClick={closeContactModal} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="ชื่อ-นามสกุล" value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              <select value={newContact.relationship} onChange={e => setNewContact({ ...newContact, relationship: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                <option value="">เลือกความสัมพันธ์</option>
                <option value="บิดา">บิดา</option>
                <option value="มารดา">มารดา</option>
                <option value="สามี">สามี</option>
                <option value="ภรรยา">ภรรยา</option>
                <option value="บุตร">บุตร</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
              <input type="tel" placeholder="เบอร์โทรศัพท์" value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              <textarea placeholder="ที่อยู่" value={newContact.address} onChange={e => setNewContact({ ...newContact, address: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows="3" />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={closeContactModal} className="px-4 py-2 border rounded-lg">ยกเลิก</button>
              <button onClick={addContact} className="px-4 py-2 bg-blue-600 text-white rounded-lg">เพิ่มข้อมูล</button>
            </div>
          </div>
        </div>
      )}


      {/* Edit Emergency Contact Modal */}
      {isEditContactModalOpen && editingContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">แก้ไขผู้ติดต่อฉุกเฉิน</h3>
              <button onClick={closeEditContactModal} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="ชื่อ-นามสกุล"
                value={editingContact.name}
                onChange={e => setEditingContact({ ...editingContact, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
              />
              <select
                value={editingContact.relationship}
                onChange={e => setEditingContact({ ...editingContact, relationship: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
              >
                <option value="">เลือกความสัมพันธ์</option>
                <option value="บิดา">บิดา</option>
                <option value="มารดา">มารดา</option>
                <option value="สามี">สามี</option>
                <option value="ภรรยา">ภรรยา</option>
                <option value="บุตร">บุตร</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
              <input
                type="tel"
                placeholder="เบอร์โทรศัพท์"
                value={editingContact.phone}
                onChange={e => setEditingContact({ ...editingContact, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
              />
              <textarea
                placeholder="ที่อยู่"
                value={editingContact.address}
                onChange={e => setEditingContact({ ...editingContact, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                rows="3"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={closeEditContactModal} className="px-4 py-2 border rounded-lg text-sm sm:text-base">
                ยกเลิก
              </button>
              <button
                onClick={saveEditContact}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm sm:text-base hover:bg-blue-700"
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">ตรวจสอบข้อมูลก่อนบันทึก</h3>
              <button onClick={closeConfirmModal} className="text-gray-400 hover:text-gray-600 p-1"><X className="h-5 w-5" /></button>
            </div>
            {/* ... Review Data Sections (use patientData state) ... */}
            <div className="space-y-4">
              <p><strong>HN:</strong> {patientData.hn}</p>
              <p><strong>ชื่อ-นามสกุล:</strong> {patientData.prename}{patientData.firstName} {patientData.lastName}</p>
              {/* ... other summary ... */}
            </div>
            <div className="flex justify-end space-x-3 mt-6 border-t pt-4">
              <button onClick={closeConfirmModal} className="px-4 py-2 border rounded-lg">แก้ไข</button>
              <button onClick={confirmSave} disabled={isSaving} className="px-4 py-2 bg-green-600 text-white rounded-lg">
                {isSaving ? 'กำลังบันทึก...' : 'ยืนยันบันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal (VN) */}
      {isVNModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">บันทึกข้อมูลสำเร็จ</h3>
            <div className="flex flex-col space-y-3 mt-6">
              <button onClick={goToAddPatientVN} className="w-full bg-blue-600 text-white py-2 rounded-lg">เพิ่ม VN ใหม่</button>
              <button onClick={goToPatientPage} className="w-full bg-gray-600 text-white py-2 rounded-lg">กลับหน้าผู้ป่วย</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientForm;