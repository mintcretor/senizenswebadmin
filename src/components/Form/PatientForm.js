

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// Import API functions (you would create these in a separate file)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_IMG_BASE_URL = process.env.REACT_APP_API_BASE_IMG_URL;
// API Helper functions
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Request Error:', error);
    return { success: false, error: error.message };
  }
};

const uploadPatientImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${API_BASE_URL}/patients/upload-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Image Upload Error:', error);
    return { success: false, error: error.message };
  }
};




const checkHNExists = async (hn) => {
  return await apiRequest(`/patients/check-hn/${hn}`);
};

const getGeneratedHN = async () => {
  return await apiRequest('/patients/generate-next-hn');
};

const getProvinces = async () => {
  return await apiRequest('/location/provinces');
};

const getDistricts = async (provinceId) => {
  return await apiRequest(`/location/districts/${provinceId}`);
};

const getSubDistricts = async (districtId) => {
  return await apiRequest(`/location/sub-districts/${districtId}`);
};

// Age calculation function
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

// FileUpload Component - Made Responsive
const FileUpload = ({ onFileUpload, isUploading, existingImageUrl }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(existingImageUrl || null);
  const [uploadStatus, setUploadStatus] = useState(null);

  // เพิ่ม useEffect เพื่อ update previewUrl เมื่อ existingImageUrl เปลี่ยน
  useEffect(() => {
    if (existingImageUrl) {
      setPreviewUrl(existingImageUrl);
      setUploadStatus('success');
    }
  }, [existingImageUrl]);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      setUploadStatus('uploading');
      try {
        const result = await uploadPatientImage(file);
        if (result.success && result.data.data) {
          setUploadStatus('success');
          onFileUpload(API_IMG_BASE_URL + result.data.data.imageUrl || result.data.data.url);
        } else {
          setUploadStatus('error');
          console.error('Upload failed:', result.error);
        }
      } catch (error) {
        setUploadStatus('error');
        console.error('Upload error:', error);
      }
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
        className="cursor-pointer flex flex-col items-center justify-center w-full h-32 sm:h-40 md:h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
      >
        {previewUrl ? (
          <div className="relative w-full h-full">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
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

// InputField Component - Made Responsive
const InputField = ({ label, placeholder, type = "text", value, onChange, error, onBlur, required = false, readOnly = false }) => {
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
        className={`px-2 py-2 sm:px-3 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-500' : 'border-gray-300'
          } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
};

// SelectField Component - Made Responsive with disabled support
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

// Toast notification component - Made Responsive
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

  // Modal states
  const { id } = useParams(); // รับ patient ID จาก URL
  const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isVNModalOpen, setIsVNModalOpen] = useState(false);
  const [newPatientId, setNewPatientId] = useState(null);
  const location = useLocation();
  const patientFromState = ''; // ข้อมูลที่ส่งมาจากหน้า Patient
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const shouldShowVNModal = mode === "add";

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
    // คำนำหน้าทั่วไป
    { value: 'นาย', label: 'นาย' },
    { value: 'นาง', label: 'นาง' },
    { value: 'นางสาว', label: 'นางสาว' },

    // เด็ก
    { value: 'เด็กชาย', label: 'เด็กชาย' },
    { value: 'เด็กหญิง', label: 'เด็กหญิง' },
    { value: 'ด.ช.', label: 'ด.ช.' },
    { value: 'ด.ญ.', label: 'ด.ญ.' },

    // ยศทหาร
    { value: 'พลฯ', label: 'พลฯ' },
    { value: 'พล.อ.', label: 'พล.อ.' },
    { value: 'พล.ท.', label: 'พล.ท.' },
    { value: 'พล.ต.', label: 'พล.ต.' },
    { value: 'พ.อ.', label: 'พ.อ.' },
    { value: 'พ.ท.', label: 'พ.ท.' },
    { value: 'พ.ต.', label: 'พ.ต.' },
    { value: 'ร.อ.', label: 'ร.อ.' },
    { value: 'ร.ท.', label: 'ร.ท.' },
    { value: 'ร.ต.', label: 'ร.ต.' },
    { value: 'จ.ส.อ.', label: 'จ.ส.อ.' },
    { value: 'จ.ส.ท.', label: 'จ.ส.ท.' },
    { value: 'จ.ส.ต.', label: 'จ.ส.ต.' },

    // ยศตำรวจ
    { value: 'พล.ต.อ.', label: 'พล.ต.อ.' },
    { value: 'พ.ต.อ.', label: 'พ.ต.อ.' },
    { value: 'พ.ต.ท.', label: 'พ.ต.ท.' },
    { value: 'พ.ต.ต.', label: 'พ.ต.ต.' },
    { value: 'ร.ต.อ.', label: 'ร.ต.อ.' },
    { value: 'ร.ต.ท.', label: 'ร.ต.ท.' },
    { value: 'ร.ต.ต.', label: 'ร.ต.ต.' },
    { value: 'ด.ต.', label: 'ด.ต.' },
    { value: 'ส.ต.อ.', label: 'ส.ต.อ.' },
    { value: 'ส.ต.ท.', label: 'ส.ต.ท.' },
    { value: 'ส.ต.ต.', label: 'ส.ต.ต.' },

    // วิชาการ/วิชาชีพ
    { value: 'ศาสตราจารย์', label: 'ศาสตราจารย์' },
    { value: 'ศ.', label: 'ศ.' },
    { value: 'รองศาสตราจารย์', label: 'รองศาสตราจารย์' },
    { value: 'รศ.', label: 'รศ.' },
    { value: 'ผู้ช่วยศาสตราจารย์', label: 'ผู้ช่วยศาสตราจารย์' },
    { value: 'ผศ.', label: 'ผศ.' },
    { value: 'อาจารย์', label: 'อาจารย์' },
    { value: 'อ.', label: 'อ.' },
    { value: 'ดร.', label: 'ดร.' },
    { value: 'นพ.', label: 'นพ.' },
    { value: 'พญ.', label: 'พญ.' },
    { value: 'ทพ.', label: 'ทพ.' },
    { value: 'ทพญ.', label: 'ทพญ.' },
    { value: 'สพ.', label: 'สพ.' },
    { value: 'สพญ.', label: 'สพญ.' },
    { value: 'ภก.', label: 'ภก.' },
    { value: 'ภญ.', label: 'ภญ.' },

    // ศาสนา
    { value: 'พระ', label: 'พระ' },
    { value: 'สามเณร', label: 'สามเณร' },
    { value: 'หลวงพ่อ', label: 'หลวงพ่อ' },
    { value: 'หลวงปู่', label: 'หลวงปู่' },
    { value: 'อิหม่าม', label: 'อิหม่าม' },
    { value: 'บาทหลวง', label: 'บาทหลวง' },
    { value: 'คุณพ่อ', label: 'คุณพ่อ' },
    { value: 'ซิสเตอร์', label: 'ซิสเตอร์' },

    // ตำแหน่งราชการ
    { value: 'นายกรัฐมนตรี', label: 'นายกรัฐมนตรี' },
    { value: 'รัฐมนตรี', label: 'รัฐมนตรี' },
    { value: 'ปลัดกระทรวง', label: 'ปลัดกระทรวง' },
    { value: 'อธิบดี', label: 'อธิบดี' },

    // เจ้านาย
    { value: 'สมเด็จพระ', label: 'สมเด็จพระ' },
    { value: 'พระเจ้าวรวงศ์เธอ', label: 'พระเจ้าวรวงศ์เธอ' },
    { value: 'พระวรวงศ์เธอ', label: 'พระวรวงศ์เธอ' },
    { value: 'พระองค์เจ้า', label: 'พระองค์เจ้า' },
    { value: 'หม่อมเจ้า', label: 'หม่อมเจ้า' },
    { value: 'ม.จ.', label: 'ม.จ.' },
    { value: 'หม่อมราชวงศ์', label: 'หม่อมราชวงศ์' },
    { value: 'ม.ร.ว.', label: 'ม.ร.ว.' },
    { value: 'หม่อมหลวง', label: 'หม่อมหลวง' },
    { value: 'ม.ล.', label: 'ม.ล.' },

    // อื่นๆ
    { value: 'คุณ', label: 'คุณ' },
    { value: 'คุณหญิง', label: 'คุณหญิง' },
    { value: 'ท่าน', label: 'ท่าน' },
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

  // Load initial data
  useEffect(() => {
    if (mode === "edit") {
      loadPatientDataForEdit();
    } else {
      // Add mode - โหลด generated HN เหมือนเดิม
      loadProvinces();
      loadGeneratedHN();
    }
  }, [mode, id]);

  useEffect(() => {
  if (mode === "edit" && initialDataLoaded && patientData.province) {
    // โหลดอำเภอและตำบลตามลำดับ
    const loadLocationData = async () => {
      // โหลดอำเภอ
      if (patientData.province) {
        await loadDistricts(patientData.province);
      }
      // โหลดตำบล (ต้องรอให้อำเภอโหลดเสร็จก่อน)
      if (patientData.district) {
        await loadSubDistricts(patientData.district);
      }
    };
    
    loadLocationData();
  }
}, [initialDataLoaded, patientData.province, patientData.district]);

  const savePatientData = async (patientData, allergies, emergencyContacts, imageUrl = null) => {
    const payload = {
      patientData: {
        ...patientData,
        imageUrl // ตรวจสอบว่า imageUrl มีค่าหรือไม่
      },
      allergies: allergies || [],
      emergencyContacts: emergencyContacts || []
    };

    // เพิ่ม console.log เพื่อ debug
   

    const httpMethod = mode === "edit" ? 'PUT' : 'POST';
    const endpoint = mode === "edit" ? `/patients/${id}` : '/patients';

    return await apiRequest(endpoint, {
      method: httpMethod,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  };
  const getConfirmModalTitle = () => {
    return mode === "edit" ? "ตรวจสอบการแก้ไขข้อมูล" : "ตรวจสอบข้อมูลก่อนบันทึก";
  };

  const getConfirmButtonText = () => {
    return mode === "edit" ? "ยืนยันการแก้ไข" : "ยืนยันบันทึก";
  };
  const loadGeneratedHN = async () => {
    if (mode === "add") {
      setIsLoading(true);
      const result = await getGeneratedHN();
      if (result.success) {
        setPatientData(prev => ({
          ...prev,
          hn: result.data.data.hn
        }));
      } else {
        showToast('ไม่สามารถสร้าง HN อัตโนมัติได้ กรุณากรอกเอง', 'error');
      }
      setIsLoading(false);
    }
  };

  const loadProvinces = async () => {
    try {
      const result = await getProvinces();
      if (result.data.success && result.data.data) {
        // API ส่งกลับมาเป็น result.data ไม่ใช่ result.data.data
        setProvinces(result.data.data.map(province => ({
          value: province.id, // API ส่งกลับมาเป็น value แล้ว
          label: province.name_th  // API ส่งกลับมาเป็น label แล้ว
        })));
      } else {
        console.error('Failed to load provinces:', result.error);
        setProvinces([]);
        showToast('ไม่สามารถโหลดข้อมูลจังหวัดได้', 'error');
      }
    } catch (error) {
      console.error('Load provinces error:', error);
      setProvinces([]);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    }
  };
const loadPatientDataForEdit = async () => {
  try {
    setIsLoading(true);
    
    // โหลดจังหวัดก่อนเสมอ
    await loadProvinces();
    
    if (patientFromState) {
      // ใช้ข้อมูลที่ส่งมาจาก location.state
      populateFormData(patientFromState);
    } else {
      // Fetch ข้อมูลจาก API ด้วย patient ID
      const result = await apiRequest(`/patients/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Patient data fetched for edit:', result);
      if (result.success && result.data) {
        populateFormData(result.data.data || result.data);
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


  const getSaveButtonText = () => {
    if (isSaving) {
      return mode === "edit" ? 'กำลังแก้ไข...' : 'กำลังบันทึก...';
    }
    return mode === "edit" ? 'แก้ไขข้อมูล' : 'บันทึกข้อมูล';
  };
const populateFormData = (data) => {
  // แปลงวันเกิดจาก ISO string เป็น YYYY-MM-DD
  let formattedBirthDate = '';
  if (data.birth_date || data.birthDate) {
    const birthDateStr = data.birth_date || data.birthDate;
    const dateObj = new Date(birthDateStr);
    if (!isNaN(dateObj.getTime())) {
      formattedBirthDate = dateObj.toISOString().split('T')[0];
    }
  }

  // แปลงเพศจากรูปแบบย่อเป็นรูปแบบเต็ม
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

  // ใส่ข้อมูล allergies และ emergency contacts ถ้ามี
  if (data.allergies) {
    setAllergies(data.allergies);
  }
  if (data.emergencyContacts) {
    setEmergencyContacts(data.emergencyContacts);
  }
  // ใส่รูปภาพถ้ามี
  if (data.imageUrl || data.profile_image) {
    const imageUrl = data.imageUrl || data.profile_image;
    setImageUrl(imageUrl);
  }
};

  // เพิ่มฟังก์ชันสำหรับโหลดอำเภอ
  const loadDistricts = async (provinceId) => {
    if (!provinceId) {
      setDistricts([]);
      setSubDistricts([]);
      return;
    }

    try {
      const result = await getDistricts(provinceId);
      if (result.data.success && result.data.data) {
        // setDistricts(result.data.data);

        setDistricts(result.data.data.map(districts => ({
          value: districts.id, // API ส่งกลับมาเป็น value แล้ว
          label: districts.name_th  // API ส่งกลับมาเป็น label แล้ว
        })));
      } else {
        setDistricts([]);
        showToast('ไม่สามารถโหลดข้อมูลอำเภอได้', 'error');
      }
    } catch (error) {
      console.error('Load districts error:', error);
      setDistricts([]);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลอำเภอ', 'error');
    }
  };
  const loadProvincesForEdit = async (provinceId, districtId) => {
    await loadProvinces();

    if (provinceId) {
      await loadDistricts(provinceId);

      if (districtId) {
        await loadSubDistricts(districtId);
      }
    }
  };
  // เพิ่มฟังก์ชันสำหรับโหลดตำบล
  const loadSubDistricts = async (districtId) => {
    if (!districtId) {
      setSubDistricts([]);
      return;
    }

    try {
      const result = await getSubDistricts(districtId);
      if (result.data.success && result.data.data) {

        setSubDistricts(result.data.data.map(subdistricts => ({
          value: subdistricts.id, // API ส่งกลับมาเป็น value แล้ว
          label: subdistricts.name_th  // API ส่งกลับมาเป็น label แล้ว
        })));


      } else {
        setSubDistricts([]);
        showToast('ไม่สามารถโหลดข้อมูลตำบลได้', 'error');
      }
    } catch (error) {
      console.error('Load sub-districts error:', error);
      setSubDistricts([]);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลตำบล', 'error');
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

    // ใน edit mode อาจไม่จำเป็นต้องมี idCard และ birthDate
    if (mode === "add") {
      if (!patientData.idCard) newErrors.idCard = 'กรุณากรอกเลขบัตรประชาชน';
      if (!patientData.birthDate) newErrors.birthDate = 'กรุณากรอกวันเกิด';
      if (!patientData.gender) newErrors.gender = 'กรุณาเลือกเพศ';
    }

    // validation patterns เหมือนเดิม
    if (patientData.idCard && !/^\d{13}$/.test(patientData.idCard)) {
      newErrors.idCard = 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleHNBlur = async () => {
    if (patientData.hn && mode === "add") { // เช็ค HN ซ้ำเฉพาะ add mode
      try {
        const result = await checkHNExists(patientData.hn);
        if (result.success && result.data && result.data.exists) {
          setErrors(prev => ({ ...prev, hn: 'HN นี้มีอยู่ในระบบแล้ว' }));
        } else if (result.success) {
          setErrors(prev => ({ ...prev, hn: '' }));
        }
      } catch (error) {
        console.error('HN check error:', error);
      }
    }
  };

  // แก้ไข updatePatientData ให้รองรับ cascading dropdown
  const updatePatientData = (field, value) => {
    setPatientData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Auto-calculate age when birth date changes
      if (field === 'birthDate') {
        newData.age = calculateAge(value);
      }

      // Reset dependent fields when province changes
      if (field === 'province') {
        newData.district = '';
        newData.subDistrict = '';
        loadDistricts(value);
        setSubDistricts([]);
      }

      // Reset sub-district when district changes
      if (field === 'district') {
        newData.subDistrict = '';
        loadSubDistricts(value);
      }

      return newData;
    });

    // Clear error when user starts typing
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

  // Save data
  const handleSaveData = () => {
    openConfirmModal();
  };

  const confirmSave = async () => {
    setIsSaving(true);
    try {
      // เพิ่ม console.log เพื่อ debug

      const result = await savePatientData(patientData, allergies, emergencyContacts, imageUrl);

      if (result.success) {
        closeConfirmModal();

        if (mode === "edit") {
          showToast('บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
          setTimeout(() => {
            navigate('/Patient');
          }, 2000);
        } else {
          if (result.data.data && result.data.data.patientId) {
            setNewPatientId(result.data.data.patientId);
            openVNModal();
            showToast('บันทึกข้อมูลผู้ป่วยสำเร็จ', 'success');
          }
        }
      } else {
        showToast(`เกิดข้อผิดพลาด: ${result.error}`, 'error');
      }
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const goToAddPatientVN = () => {
    closeVNModal();
    navigate(`/an-vn/add/${newPatientId}`); // ส่งเป็น URL param
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
            <InputField
              label="วัน / เดือน / ปีเกิด"
              placeholder="วัน / เดือน / ปีเกิด"
              type="date"
              value={patientData.birthDate}
              onChange={(e) => updatePatientData('birthDate', e.target.value)}
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

        {/* Address Section - Responsive Grid with Cascading Dropdown */}
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

        {/* Medical Info Section - Responsive */}
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

            {/* Allergy Table - Responsive */}
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
                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 max-w-20 sm:max-w-none truncate">{allergy.allergen_name}</td>
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

        {/* Emergency Contact Section - Responsive */}
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

          {/* Emergency Contacts Table - Responsive */}
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
                        <button
                          onClick={() => removeContact(contact.id)}
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

      {/* Action Buttons - Responsive */}
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

      {/* Allergy Modal - Responsive */}
      {isAllergyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">เพิ่มข้อมูลการแพ้</h3>
              <button
                onClick={closeAllergyModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ{newAllergy.type === 'drug' ? 'ยา' : 'อาหาร'}ที่แพ้
                </label>
                <input
                  type="text"
                  value={newAllergy.name}
                  onChange={(e) => setNewAllergy({ ...newAllergy, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`กรอกชื่อ${newAllergy.type === 'drug' ? 'ยา' : 'อาหาร'}ที่แพ้`}
                />
              </div>

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
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="อธิบายอาการที่เกิดขึ้น เช่น ผื่นคัน, บวม, หายใจลำบาก"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
                <textarea
                  value={newAllergy.notes}
                  onChange={(e) => setNewAllergy({ ...newAllergy, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
              <button
                onClick={closeAllergyModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                ยกเลิก
              </button>
              <button
                onClick={addAllergy}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                เพิ่มข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contact Modal - Responsive */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">เพิ่มผู้ติดต่อฉุกเฉิน</h3>
              <button
                onClick={closeContactModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ความสัมพันธ์</label>
                <select
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">เลือกความสัมพันธ์</option>
                  <option value="บิดา">บิดา</option>
                  <option value="มารดา">มารดา</option>
                  <option value="สามี">สามี</option>
                  <option value="ภรรยา">ภรรยา</option>
                  <option value="บุตร">บุตร</option>
                  <option value="บุตรสาว">บุตรสาว</option>
                  <option value="พี่ชาย">พี่ชาย</option>
                  <option value="พี่สาว">พี่สาว</option>
                  <option value="น้องชาย">น้องชาย</option>
                  <option value="น้องสาว">น้องสาว</option>
                  <option value="ปู่">ปู่</option>
                  <option value="ย่า">ย่า</option>
                  <option value="ตา">ตา</option>
                  <option value="ยาย">ยาย</option>
                  <option value="เพื่อน">เพื่อน</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกเบอร์โทรศัพท์"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่</label>
                <textarea
                  value={newContact.address}
                  onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="กรอกที่อยู่"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
              <button
                onClick={closeContactModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                ยกเลิก
              </button>
              <button
                onClick={addContact}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                เพิ่มข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Data Modal - Responsive */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">ตรวจสอบข้อมูลก่อนบันทึก</h3>
              <button
                onClick={closeConfirmModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6 text-sm sm:text-base">
              {/* Personal Info Review */}
              <div>
                <h4 className="text-sm sm:text-md font-semibold text-gray-700 mb-2 sm:mb-3 border-b pb-2">ข้อมูลส่วนตัว</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div><span className="font-medium">HN:</span> {patientData.hn || '-'}</div>
                  <div><span className="font-medium">เลขบัตรประชาชน:</span> {patientData.idCard || '-'}</div>
                  <div><span className="font-medium">คำนำหน้า:</span> {patientData.prename || '-'}</div> {/* เพิ่มบรรทัดนี้ */}
                  <div><span className="font-medium">ชื่อ:</span> {patientData.firstName || '-'}</div>
                  <div><span className="font-medium">นามสกุล:</span> {patientData.lastName || '-'}</div>
                  <div><span className="font-medium">วันเกิด:</span> {patientData.birthDate || '-'}</div>
                  <div><span className="font-medium">อายุ:</span> {patientData.age ? `${patientData.age} ปี` : '-'}</div>
                  <div><span className="font-medium">เพศ:</span> {genderOptions.find(g => g.value === patientData.gender)?.label || '-'}</div>
                  <div><span className="font-medium">ศาสนา:</span> {religionOptions.find(r => r.value === patientData.religion)?.label || '-'}</div>
                  <div><span className="font-medium">สัญชาติ:</span> {patientData.nationality || '-'}</div>
                  <div><span className="font-medium">เชื้อชาติ:</span> {patientData.race || '-'}</div>
                  <div><span className="font-medium">กรุ๊ปเลือด:</span> {patientData.bloodGroup || '-'}</div>
                </div>
              </div>


              <div>
                <h4 className="text-sm sm:text-md font-semibold text-gray-700 mb-2 sm:mb-3 border-b pb-2">ที่อยู่</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div><span className="font-medium">บ้านเลขที่:</span> {patientData.houseNumber || '-'}</div>
                  <div><span className="font-medium">หมู่:</span> {patientData.village || '-'}</div>
                  <div><span className="font-medium">จังหวัด:</span> {provinces.find(p => p.value == patientData.province)?.label || '-'}</div>
                  <div><span className="font-medium">อำเภอ:</span> {districts.find(d => d.value == patientData.district)?.label || '-'}</div>
                  <div><span className="font-medium">ตำบล:</span> {subDistricts.find(s => s.value == patientData.subDistrict)?.label || '-'}</div>
                </div>
              </div>

              {/* Medical Info Review */}
              <div>
                <h4 className="text-sm sm:text-md font-semibold text-gray-700 mb-2 sm:mb-3 border-b pb-2">ข้อมูลทางการแพทย์</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mb-4">
                  <div><span className="font-medium">โรคประจำตัว:</span> {patientData.chronicDisease || '-'}</div>
                  <div><span className="font-medium">เบอร์โทรศัพท์:</span> {patientData.contactPhone || '-'}</div>
                </div>

                {Array.isArray(allergies) && allergies.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-600 mb-2 text-xs sm:text-sm">รายการสิ่งที่แพ้:</h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm border border-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 sm:px-3 py-2 text-left">ประเภท</th>
                            <th className="px-2 sm:px-3 py-2 text-left">ชื่อ</th>
                            <th className="px-2 sm:px-3 py-2 text-left">ความรุนแรง</th>
                            <th className="hidden sm:table-cell px-2 sm:px-3 py-2 text-left">อาการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allergies.map((allergy, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-2 sm:px-3 py-2">{allergy.type === 'drug' ? 'แพ้ยา' : 'แพ้อาหาร'}</td>
                              <td className="px-2 sm:px-3 py-2">{allergy.name}</td>
                              <td className="px-2 sm:px-3 py-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${allergy.severity === 'severe' ? 'bg-red-100 text-red-800' :
                                  allergy.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                  {allergy.severity === 'severe' ? 'รุนแรง' :
                                    allergy.severity === 'moderate' ? 'ปานกลาง' : 'เล็กน้อย'}
                                </span>
                              </td>
                              <td className="hidden sm:table-cell px-2 sm:px-3 py-2">{allergy.symptoms}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Emergency Contacts Review */}
              {Array.isArray(emergencyContacts) && emergencyContacts.length > 0 && (
                <div>
                  <h4 className="text-sm sm:text-md font-semibold text-gray-700 mb-2 sm:mb-3 border-b pb-2">ผู้ติดต่อฉุกเฉิน</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 sm:px-3 py-2 text-left">ชื่อ-นามสกุล</th>
                          <th className="px-2 sm:px-3 py-2 text-left">ความสัมพันธ์</th>
                          <th className="px-2 sm:px-3 py-2 text-left">เบอร์โทร</th>
                          <th className="hidden sm:table-cell px-2 sm:px-3 py-2 text-left">ที่อยู่</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emergencyContacts.map((contact, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-2 sm:px-3 py-2 font-medium">{contact.name}</td>
                            <td className="px-2 sm:px-3 py-2">{contact.relationship}</td>
                            <td className="px-2 sm:px-3 py-2">{contact.phone}</td>
                            <td className="hidden sm:table-cell px-2 sm:px-3 py-2 max-w-32 truncate">{contact.address}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6 border-t pt-4">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                แก้ไข
              </button>
              <button
                onClick={confirmSave}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                {isSaving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{isSaving ? 'กำลังบันทึก...' : 'ยืนยันบันทึก'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal - Responsive */}
      {isVNModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">บันทึกข้อมูลสำเร็จ</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">ข้อมูลผู้ป่วยได้ถูกบันทึกในระบบแล้ว</p>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={goToAddPatientVN}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  เพิ่ม VN ใหม่
                </button>
                <button
                  onClick={goToPatientPage}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
                >
                  กลับหน้าผู้ป่วย
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientForm;