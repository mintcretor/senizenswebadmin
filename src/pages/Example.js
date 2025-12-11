import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Clock, User, ChevronDown, X, Camera, ImageIcon,Home } from 'lucide-react';
import { procedureService } from '../services/procedureService';
// เพิ่ม PatientSearch Component
function PatientSearchModal({ visible, onClose, onSelectPatient }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [searchMode, setSearchMode] = useState('patient'); // 'patient' หรือ 'room'
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setError(null);

    if (query.length < 1) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);

      let url;
      if (searchMode === 'room') {
        // ✅ ค้นหาตามห้อง
        url = `${API_BASE_URL}/service-registrations?room=${encodeURIComponent(query)}`;
      } else {
        // ค้นหาตาม HN/ชื่อ
        url = `${API_BASE_URL}/service-registrations?search=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();

      if (result.success) {
        const transformedPatients = result.data.map(p => ({
          id: p.registration_id,
          patient_id: p.patient_id,
          prefix: p.prename || '',
          firstname: p.first_name,
          lastname: p.last_name,
          age: `${p.age}`,
          hn: p.hn,
          room: p.room_number || '-',
          service_number: p.service_number,
          image: p.profile_image || '/api/placeholder/80/80'
        }));
        setSearchResults(transformedPatients);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
  }, [searchMode]);


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
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}>
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
                    key={patient.id}
                    onClick={() => {
                      onSelectPatient(patient);
                      onClose();
                    }}
                    className="w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white border rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      {patient.image && patient.image !== '/api/placeholder/80/80' ? (
                        <img src={patient.image} alt="" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover" />
                      ) : (
                        <User size={24} className="sm:w-8 sm:h-8 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {patient.prefix}{patient.firstname} {patient.lastname}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        HN: {patient.hn} | {patient.age} ปี
                      </p>
                      {patient.room && patient.room !== '-' && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 mt-0.5">
                          <Home size={12} />
                          <span>ห้อง: {patient.room}</span>
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
const PatientProcedureForm = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showProcedureModal, setShowProcedureModal] = useState(false);
  const [showOtherModal, setShowOtherModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [intolerance, setIntolerance] = useState('-');
  const [note, setNote] = useState('');
  const [shift, setShift] = useState('เช้า'); // เพิ่ม shift

  const [selectedProcedures, setSelectedProcedures] = useState([]);
  const [checkedOther, setCheckedOther] = useState([]);

  const [oxygenHour, setOxygenHour] = useState('');
  const [infusionNG, setInfusionNG] = useState('');
  const [infusionIV, setInfusionIV] = useState('');

  const [showOxygenOptions, setShowOxygenOptions] = useState(false);
  const [showInfusionNGOptions, setShowInfusionNGOptions] = useState(false);
  const [showInfusionIVOptions, setShowInfusionIVOptions] = useState(false);
  const [editableAge, setEditableAge] = useState('');
  const [editableRoom, setEditableRoom] = useState('');
  const [procedureImages, setProcedureImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const MAX_IMAGES = 10;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  // Data from API
  const [patients, setPatients] = useState([]);
  // const [procedureItems, setProcedureItems] = useState([]);
  const [feedMachines, setFeedMachines] = useState([]);
  const [ivMachines, setIvMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const PATIENTS_PER_PAGE = 50;
  const [page, setPage] = useState(1);
  const [searchParam, setSearchParam] = useState('');
  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, []);
  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load patients
      const patientsResult = await procedureService.getANPatients();
      //const patientsResult = await response.json();


      if (patientsResult.success) {
        // Transform data to match component format
        const transformedPatients = patientsResult.data.map(p => ({
          id: p.id,
          patient_id: p.id,
          prefix: p.prename || '',
          firstname: p.first_name,
          lastname: p.last_name,
          age: `${p.age}`,
          hn: p.hn,
          room: p.room_number || '-',
          service_number: p.service_number,
          image: p.profile_image || '/api/placeholder/80/80'
        }));
        setPatients(transformedPatients);
      }

      // Load procedure types
      /* const proceduresResult = await procedureService.getProcedureTypes();
       if (proceduresResult.success) {
         const transformedProcedures = proceduresResult.data.map(p => ({
           id: p.id,
           name: p.name,
           canPerform: p.can_perform,
           hasSubOption: p.has_sub_option,
           subType: p.sub_type
         }));
       //  setProcedureItems(transformedProcedures);
       }*/

      // Load machine numbers
      const machinesResult = await procedureService.getMachineNumbers();
      if (machinesResult.success) {
        const feedPumps = machinesResult.data
          .filter(m => m.machine_type === 'feed_pump_ng')
          .map(m => m.machine_number);
        const infusionPumps = machinesResult.data
          .filter(m => m.machine_type === 'infusion_pump_iv')
          .map(m => m.machine_number);

        setFeedMachines(feedPumps);
        setIvMachines(infusionPumps);
      }

    } catch (err) {
      console.error('Load data error:', err);
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = (event) => {
    const files = Array.from(event.target.files);

    if (procedureImages.length + files.length > MAX_IMAGES) {
      alert(`สามารถแนบรูปได้สูงสุด ${MAX_IMAGES} รูป`);
      return;
    }

    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(file.name);
      } else if (file.type.startsWith('image/')) {
        validFiles.push({
          file: file,
          preview: URL.createObjectURL(file),
          name: file.name,
          type: file.type,
          size: file.size
        });
      }
    });

    if (invalidFiles.length > 0) {
      alert(`ไฟล์เหล่านี้มีขนาดเกิน 5MB: ${invalidFiles.join(', ')}`);
    }

    if (validFiles.length > 0) {
      setProcedureImages([...procedureImages, ...validFiles]);
    }

    // Reset input
    event.target.value = '';
  };

  const handleTakePhoto = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (procedureImages.length >= MAX_IMAGES) {
      alert(`สามารถแนบรูปได้สูงสุด ${MAX_IMAGES} รูป`);
      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('ไฟล์มีขนาดเกิน 5MB');
      event.target.value = '';
      return;
    }

    if (file.type.startsWith('image/')) {
      setProcedureImages([...procedureImages, {
        file: file,
        preview: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
        size: file.size
      }]);
    }

    event.target.value = '';
  };

  const handleRemoveImage = (index) => {
    if (window.confirm('คุณต้องการลบรูปภาพนี้ใช่หรือไม่?')) {
      const newImages = procedureImages.filter((_, i) => i !== index);
      // ทำลาย URL.createObjectURL เพื่อป้องกัน memory leak
      URL.revokeObjectURL(procedureImages[index].preview);
      setProcedureImages(newImages);
    }
  };

  // ✅ Function: อัพโหลดรูปภาพไปยัง API
  const uploadImages = async () => {
    if (procedureImages.length === 0) return [];

    try {
      setUploadingImages(true);

      const formData = new FormData();

      procedureImages.forEach((image) => {
        formData.append('images', image.file);
      });


      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/procedure-records/upload-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        return result.imageUrls;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);

      let errorMessage = 'ไม่สามารถอัพโหลดรูปภาพได้';

      if (error.message.includes('401')) {
        errorMessage += '\nToken หมดอายุ กรุณา Login ใหม่';
      } else if (error.message.includes('413')) {
        errorMessage += '\nไฟล์ใหญ่เกินไป (เกิน 5MB)';
      }

      alert(errorMessage);
      return [];
    } finally {
      setUploadingImages(false);
    }
  };
  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toTimeString().slice(0, 5));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredPatients = patients.filter(p =>
    p.firstname.toLowerCase().includes(searchText.toLowerCase()) ||
    p.lastname.toLowerCase().includes(searchText.toLowerCase()) ||
    p.hn.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleProcedureToggle = (item) => {
    const exists = selectedProcedures.find(p => p.id === item.id); // เปลี่ยนจาก p.name === item.name

    if (exists) {
      // ยกเลิกการเลือก
      setSelectedProcedures(selectedProcedures.filter(p => p.id !== item.id)); // เปลี่ยนจาก p.name !== item.name

      // Reset sub-options
      if (item.subType === 'hour') {
        setShowOxygenOptions(false);
        setOxygenHour('');
      } else if (item.subType === 'machine_ng') {
        setShowInfusionNGOptions(false);
        setInfusionNG('');
      } else if (item.subType === 'machine_iv') {
        setShowInfusionIVOptions(false);
        setInfusionIV('');
      }
    } else {
      // เพิ่มรายการใหม่
      const defaultPerformer = item.canPerform === 'both' ? 'nurse' : item.canPerform;
      setSelectedProcedures([...selectedProcedures, {
        ...item,
        performedBy: defaultPerformer
      }]);

      // Show sub-options
      if (item.subType === 'hour') setShowOxygenOptions(true);
      else if (item.subType === 'machine_ng') setShowInfusionNGOptions(true);
      else if (item.subType === 'machine_iv') setShowInfusionIVOptions(true);
    }
  };

  const handlePerformerChange = (procedureId, performer) => {
    setSelectedProcedures(selectedProcedures.map(p =>
      p.id === procedureId ? { ...p, performedBy: performer } : p
    ));
  };

  const handleOtherCheckbox = (item) => {
    if (checkedOther.includes(item)) {
      setCheckedOther(checkedOther.filter(i => i !== item));
    } else {
      setCheckedOther([...checkedOther, item]);
    }
  };

  const confirmProcedures = () => {
    const updated = selectedProcedures.map(proc => {
      if (proc.subType === 'hour' && oxygenHour) {
        return { ...proc, subOptionValue: oxygenHour, displayName: `${proc.name} ${oxygenHour} ชั่วโมง` };
      } else if (proc.subType === 'machine_ng' && infusionNG) {
        return { ...proc, subOptionValue: infusionNG, displayName: `${proc.name} หมายเลขเครื่อง ${infusionNG}` };
      } else if (proc.subType === 'machine_iv' && infusionIV) {
        return { ...proc, subOptionValue: infusionIV, displayName: `${proc.name} หมายเลขเครื่อง ${infusionIV}` };
      }
      return { ...proc, displayName: proc.name };
    });
    setSelectedProcedures(updated);
    setShowProcedureModal(false);
  };

  const handleSubmit = () => {
    if (!selectedPatient) {
      alert('กรุณาเลือกข้อมูลคนไข้');
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    try {
      // Validate ก่อนส่ง
      if (!selectedPatient || !selectedPatient.id || !selectedPatient.id) {
        alert('ข้อมูลผู้ป่วยไม่ครบถ้วน กรุณาเลือกผู้ป่วยใหม่');
        setLoading(false);
        return;
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}');

      let imageUrls = [];
      if (procedureImages.length > 0) {
        imageUrls = await uploadImages();
        if (imageUrls.length === 0 && procedureImages.length > 0) {
          alert('ไม่สามารถอัพโหลดรูปภาพได้ กรุณาลองใหม่');
          setLoading(false);
          return;
        }
      }

      const payload = {
        serviceRegistrationId: selectedPatient.id,
        patientId: selectedPatient.patient_id,
        admissionId: null,
        recordDate: date,
        recordTime: time,
        shift: shift,
        note: note || null,
        procedures: selectedProcedures.map(proc => ({
          typeId: proc.id,
          performedBy: proc.performedBy,
          displayName: proc.displayName || proc.name,
          subOptionValue: proc.subOptionValue || null
        })),
        nonChargeableProcedures: checkedOther,
        imageUrls: imageUrls, // ✅ เพิ่ม imageUrls
        createdBy: user.user_id || 1
      };


      const result = await procedureService.createProcedureRecord(payload);

      if (result.success) {
        alert('บันทึกข้อมูลสำเร็จ');
        resetForm();
        setShowConfirmDialog(false);
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('ไม่สามารถบันทึกข้อมูลได้: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  const procedureItems = [
    { id: 1, name: "ทำแผลเจาะคอ", canPerform: "both" },
    { id: 2, name: "ทำแผลหน้าท้อง", canPerform: "both" },
    { id: 3, name: "ทำแผลขนาดเล็ก", canPerform: "both" },
    { id: 4, name: "ทำแผลขนาดกลาง", canPerform: "both" },
    { id: 5, name: "ทำแผลขนาดใหญ่", canPerform: "both" },
    { id: 6, name: "ให้ออกซิเจน (วัน)", canPerform: "both" },
    { id: 7, name: "ให้ออกซิเจน (ชั่วโมง)", canPerform: "both", hasSubOption: true, subType: "hour" },
    { id: 8, name: "ดูดเสมหะ", canPerform: "both" },
    { id: 9, name: "พ่นยา", canPerform: "both" },
    { id: 10, name: "ตัดไหม", canPerform: "both" },
    { id: 11, name: "ใส่สาย Foley", canPerform: "both" },
    { id: 12, name: "สวนปัสสาวะทิ้ง", canPerform: "both" },
    { id: 13, name: "สวนล้างกระเพาะปัสสาวะ", canPerform: "both" },
    { id: 14, name: "ใส่สาย NG", canPerform: "both" },
    { id: 15, name: "เจาะเลือด", canPerform: "both" },
    { id: 16, name: "ฉีดยา SC/ID", canPerform: "both" },
    { id: 17, name: "ฉีดยา IM", canPerform: "both" },
    { id: 18, name: "ฉีดยา IV", canPerform: "both" },
    { id: 19, name: "เครื่อง Infustion Pump NG", canPerform: "both", hasSubOption: true, subType: "machine_ng" },
    { id: 20, name: "เครื่อง Infustion Pump IV", canPerform: "both", hasSubOption: true, subType: "machine_iv" },
    { id: 21, name: "ให้สารน้ำทางหลอดเลือดดำ IV", canPerform: "both" },
    { id: 22, name: "EKG", canPerform: "both" },
    { id: 23, name: "เตียงลม", canPerform: "both" },
    { id: 24, name: "ค่าแพทย์ตรวจเยี่ยมนอกระบบ", canPerform: "both" },
    { id: 25, name: "ค่านักโภชนาการเยี่ยมนอกระบบ", canPerform: "both" },
    { id: 26, name: "Flush สาย IV(NSS lock)", canPerform: "both" },
    { id: 27, name: "หลอดตา", canPerform: "both" },
    { id: 28, name: "เหน็บยา", canPerform: "both" },
    { id: 29, name: "ดูดเสมหะก่อน Feed", canPerform: "both" },
    { id: 30, name: "ดูสาย Foley", canPerform: "both" },
    { id: 31, name: "พลิกตะแคงตัว", canPerform: "both" },
    { id: 32, name: "สวนอุจจาระ Enema", canPerform: "both" },
    { id: 33, name: "สวนอุจจาระ Evacuate", canPerform: "both" },
    { id: 34, name: "เจาะ DTX เครื่องคนไข้", canPerform: "both" },
    { id: 35, name: "เจาะ DTX (ใช้เครื่องศูนย์รวมเวชภัณฑ์) (ครั้ง)", canPerform: "both" },
    { id: 36, name: "NA เวรติดตามส่งผู้ป่วย", canPerform: "both" },
    { id: 37, name: "ญาติขอผ้าห่ม", canPerform: "both" },
    { id: 38, name: "ญาติขอผ้าเช็ดตัว", canPerform: "both" },
    { id: 39, name: "หัตถการอื่นๆ", canPerform: "both" }
  ];
  const resetForm = () => {
    setSelectedPatient(null);
    setIntolerance('-');
    setNote('');
    setSelectedProcedures([]);
    setCheckedOther([]);
    setOxygenHour('');
    setInfusionNG('');
    setInfusionIV('');
    setShowOxygenOptions(false);
    setShowInfusionNGOptions(false);
    setShowInfusionIVOptions(false);

    // ✅ ล้างรูปภาพ
    procedureImages.forEach(img => URL.revokeObjectURL(img.preview));
    setProcedureImages([]);
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setEditableAge(patient.age);
    setEditableRoom(patient.room); // เพิ่มบรรทัดนี้
    setShowPatientModal(false);
    setSearchText('');
  };

  const getPerformerLabel = (performer) => {
    if (performer === 'nurse') return 'พยาบาล';
    if (performer === 'nurse_aid') return 'ผู้ช่วย';
    return '';
  };

  // Other procedures (hardcoded list)
  const otherColumns = [
    "อาบน้ำ / เช็ดตัว", "สระผม", "ให้ยาก่อนอาหารเช้า", "ให้ยาหลังอาหารเช้า",
    "ให้ยาก่อนอาหารเที่ยง", "ให้ยาหลังอาหารเที่ยง", "ให้ยาก่อนอาหารเย็น", "ให้ยาหลังอาหารเย็น",
    "ให้ยาก่อนนอน", "ให้อาหารทางสายยาง", "ให้น้ำระหว่างมื้อ", "ป้อนอาหารให้คนไข้",
    "เปลี่ยนผ้าอ้อม", "พลิกตะแคงตัว", "พยาบาลตรวจเยี่ยมประเมินอาการประจำเวร/แรกรับ",
    "ตรวจเยี่ยมประเมินอาการประจำเวร", "ทำความสะอาด Unit ผู้ป่วยประจำวัน", "หัตถการอื่นๆ"
  ];

  const renderImageUpload = () => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Camera size={18} className="text-purple-600" />
          รูปภาพการทำหัตถการ
        </label>
        <span className="text-xs text-gray-500">
          ({procedureImages.length}/{MAX_IMAGES})
        </span>
      </div>

      {/* แสดงรูปภาพที่เลือก */}
      {procedureImages.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {procedureImages.map((image, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={image.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
              >
                <X size={14} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                {(image.size / 1024).toFixed(0)} KB
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ปุ่มอัพโหลด */}
      {procedureImages.length < MAX_IMAGES && (
        <div className="flex gap-2">
          {/* ปุ่มถ่ายรูป */}
          <label className="flex-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg py-2 px-3 cursor-pointer flex items-center justify-center gap-2 transition">
            <Camera size={18} />
            <span className="text-sm font-medium">ถ่ายรูป</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleTakePhoto}
              className="hidden"
            />
          </label>

          {/* ปุ่มเลือกรูป */}
          <label className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 px-3 cursor-pointer flex items-center justify-center gap-2 transition">
            <ImageIcon size={18} />
            <span className="text-sm font-medium">เลือกรูป</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePickImage}
              className="hidden"
            />
          </label>
        </div>
      )}

      {procedureImages.length >= MAX_IMAGES && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-white text-xs">!</div>
          <span className="text-xs text-yellow-800">
            แนบรูปครบ {MAX_IMAGES} รูปแล้ว
          </span>
        </div>
      )}

      {uploadingImages && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 mt-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-blue-600">กำลังอัพโหลดรูปภาพ...</span>
        </div>
      )}
    </div>
  );

  if (loading && patients.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={loadInitialData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-16 pb-24 px-6 max-w-2xl mx-auto">
        {/* Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">วันที่</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white border rounded-lg p-3"
          />
        </div>

        {/* Time */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">เวลา</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-white border rounded-lg p-3"
          />
        </div>

        {/* Shift */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">เวร</label>
          <select
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            className="w-full bg-white border rounded-lg p-3"
          >
            <option value="เช้า">เช้า</option>
            <option value="บ่าย">บ่าย</option>
            <option value="ดึก">ดึก</option>
          </select>
        </div>

        {/* Patient Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ชื่อ - นามสกุล</label>
          <div
            className="bg-white border rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50"
            onClick={() => setShowPatientModal(true)}
          >
            {selectedPatient ? (
              <>
                <img src={selectedPatient.image} alt="" className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="font-medium">{selectedPatient.prefix}{selectedPatient.firstname} {selectedPatient.lastname}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{selectedPatient.service_number}</span>
                    {selectedPatient.room && selectedPatient.room !== '-' && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Home size={12} />
                          <span>ห้อง {selectedPatient.room}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <ChevronDown size={20} className="text-gray-400" />
              </>
            ) : (
              <>
                <User size={40} className="text-gray-300" />
                <span className="flex-1 text-gray-500">กรุณาเลือกข้อมูลคนไข้</span>
                <ChevronDown size={20} className="text-gray-400" />
              </>
            )}
          </div>
        </div>

        {selectedPatient && (
          <>
            {/* HN */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">HN</label>
              <input
                type="text"
                value={selectedPatient.hn}
                readOnly
                className="w-full bg-gray-100 border rounded-lg p-3"
              />
            </div>

            {/* Full Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Name - Surname</label>
              <input
                type="text"
                value={`${selectedPatient.prefix}${selectedPatient.firstname} ${selectedPatient.lastname}`}
                readOnly
                className="w-full bg-gray-100 border rounded-lg p-3"
              />
            </div>

            {/* Age */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">อายุ</label>
              <input
                type="text"
                value={editableAge}
                onChange={(e) => setEditableAge(e.target.value)}
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* Drug Intolerance */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">ประวัติการแพ้ยา</label>
              <textarea
                value={intolerance}
                onChange={(e) => setIntolerance(e.target.value)}
                className="w-full border rounded-lg p-3 resize-none"
                rows="2"
              />
            </div>

            {/* Room */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">ห้อง</label>
              <input
                type="text"
                value={editableRoom}
                onChange={(e) => setEditableRoom(e.target.value)}

                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* หัตถการพยาบาล (รวมกัน) */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">หัตถการพยาบาล</label>
              <div
                className="bg-white border rounded-lg p-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                onClick={() => setShowProcedureModal(true)}
              >
                <span className="text-gray-700">
                  {selectedProcedures.length > 0
                    ? `เลือกแล้ว ${selectedProcedures.length} รายการ`
                    : 'เลือกหัตถการ'}
                </span>
                <ChevronDown size={20} className="text-gray-400" />
              </div>

              {/* แสดงรายการที่เลือก */}
              {selectedProcedures.length > 0 && (
                <div className="mt-2 space-y-2">
                  {selectedProcedures.map((proc, idx) => (
                    <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{proc.displayName || proc.name}</span>
                        <span className="text-blue-600 text-xs">
                          ({getPerformerLabel(proc.performedBy)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>


            {/* Other Procedures */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">หัตถการที่ไม่คิดเงิน</label>
              <div
                className="bg-white border rounded-lg p-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                onClick={() => setShowOtherModal(true)}
              >
                <span className="text-gray-700">
                  {checkedOther.length > 0
                    ? `เลือกแล้ว ${checkedOther.length} รายการ`
                    : 'เลือกหัตถการ'}
                </span>
                <ChevronDown size={20} className="text-gray-400" />
              </div>

              {/* แสดงรายการที่เลือก - เพิ่มส่วนนี้ */}
              {checkedOther.length > 0 && (
                <div className="mt-2 space-y-2">
                  {checkedOther.map((item, idx) => (
                    <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {renderImageUpload()}

            {/* Note */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">หมายเหตุ</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border rounded-lg p-3 resize-none"
                rows="3"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || uploadingImages}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-3 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploadingImages ? 'กำลังอัพโหลดรูปภาพ...' : loading ? 'กำลังบันทึก...' : 'Submit'}
            </button>
          </>
        )}
      </div>

      {/* Patient Selection Modal */}
      <PatientSearchModal
        visible={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        onSelectPatient={handlePatientSelect}
        patients={patients}
      />

      {/* Procedure Modal (รวมกัน) */}
      {showProcedureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-lg h-[90vh] sm:h-[85vh] overflow-hidden flex flex-col">
            <div className="p-3 sm:p-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold">เลือกหัตถการพยาบาล</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">เลือกหัตถการและระบุผู้ปฏิบัติ</p>
                </div>
                <button onClick={() => setShowProcedureModal(false)} className="sm:hidden">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
              {procedureItems.map((item, idx) => {
                const isChecked = selectedProcedures.find(p => p.id === item.id);

                return (
                  <div key={idx} className="mb-2 sm:mb-3 border-b pb-2 sm:pb-3">
                    {/* เปลี่ยนจาก div เป็น label และเพิ่ม cursor-pointer */}
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!isChecked}
                        onChange={() => handleProcedureToggle(item)}
                        className="w-4 h-4 mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm sm:text-base break-words">{item.name}</span>

                        {/* แสดง dropdown เลือกผู้ปฏิบัติ ถ้า canPerform = 'both' */}
                        {/* แสดง dropdown เลือกผู้ปฏิบัติ ถ้า canPerform = 'both' */}
                        {isChecked && item.canPerform === 'both' && (
                          <select
                            value={isChecked.performedBy}
                            onChange={(e) => {
                              e.stopPropagation();
                              handlePerformerChange(item.id, e.target.value); // เปลี่ยนจาก item.name เป็น item.id
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-2 w-full border rounded px-2 py-1.5 text-xs sm:text-sm"
                          >
                            <option value="nurse">พยาบาล</option>
                            <option value="nurse_aid">ผู้ช่วยพยาบาล</option>
                          </select>
                        )}

                        {/* แสดงป้ายผู้ปฏิบัติ ถ้าไม่ใช่ both */}
                        {isChecked && item.canPerform !== 'both' && (
                          <div className="mt-1">
                            <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 sm:py-1 rounded">
                              {getPerformerLabel(item.canPerform)}
                            </span>
                          </div>
                        )}

                        {/* Sub-options - ต้องเพิ่ม onClick stopPropagation ด้วย */}
                        {item.name === 'ให้ออกซิเจน (ชั่วโมง)' && isChecked && showOxygenOptions && (
                          <div className="mt-2 space-y-1 ml-2 max-h-32 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(hour => (
                              <label key={hour} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="oxygen"
                                  value={hour}
                                  checked={oxygenHour === hour.toString()}
                                  onChange={(e) => setOxygenHour(e.target.value)}
                                  className="w-3 h-3 flex-shrink-0"
                                />
                                <span className="text-xs sm:text-sm">{hour} ชั่วโมง</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {item.name === 'เครื่อง Infustion Pump NG' && isChecked && showInfusionNGOptions && (
                          <div className="mt-2 space-y-1 ml-2 max-h-32 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            {feedMachines.map((machine, i) => (
                              <label key={i} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="infusionNG"
                                  value={machine}
                                  checked={infusionNG === machine}
                                  onChange={(e) => setInfusionNG(e.target.value)}
                                  className="w-3 h-3 flex-shrink-0"
                                />
                                <span className="text-xs sm:text-sm">หมายเลข {machine}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {item.name === 'เครื่อง Infustion Pump IV' && isChecked && showInfusionIVOptions && (
                          <div className="mt-2 space-y-1 ml-2 max-h-32 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            {ivMachines.map((machine, i) => (
                              <label key={i} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="infusionIV"
                                  value={machine}
                                  checked={infusionIV === machine}
                                  onChange={(e) => setInfusionIV(e.target.value)}
                                  className="w-3 h-3 flex-shrink-0"
                                />
                                <span className="text-xs sm:text-sm">หมายเลข {machine}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
            <div className="p-3 sm:p-4 border-t flex gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setShowProcedureModal(false);
                  setSelectedProcedures([]);
                  setShowOxygenOptions(false);
                  setShowInfusionNGOptions(false);
                  setShowInfusionIVOptions(false);
                }}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmProcedures}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other Procedures Modal */}
      {showOtherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-lg h-[90vh] sm:h-[85vh] overflow-hidden flex flex-col">
            <div className="p-3 sm:p-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold">เลือกหัตถการที่ไม่คิดเงิน</h2>
                <button onClick={() => setShowOtherModal(false)} className="sm:hidden">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
              {otherColumns.map((item, idx) => (
                <div key={idx} className="mb-2 sm:mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkedOther.includes(item)}
                      onChange={() => handleOtherCheckbox(item)}
                      className="w-4 h-4 flex-shrink-0"
                    />
                    <span className="text-sm sm:text-base break-words">{item}</span>
                  </label>
                </div>
              ))}
            </div>
            <div className="p-3 sm:p-4 border-t flex gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setShowOtherModal(false);
                  setCheckedOther([]);
                }}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => setShowOtherModal(false)}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-3 sm:p-4 border-b flex-shrink-0">
              <h2 className="text-base sm:text-lg font-semibold">ยืนยันการบันทึก</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between py-2 border-b text-sm sm:text-base">
                  <span className="text-gray-600">วันที่:</span>
                  <span className="font-medium">{date}</span>
                </div>
                <div className="flex justify-between py-2 border-b text-sm sm:text-base">
                  <span className="text-gray-600">เวลา:</span>
                  <span className="font-medium">{time}</span>
                </div>
                <div className="flex justify-between py-2 border-b text-sm sm:text-base">
                  <span className="text-gray-600">ชื่อ - นามสกุล:</span>
                  <span className="font-medium text-right ml-2">
                    {selectedPatient?.prefix}{selectedPatient?.firstname} {selectedPatient?.lastname}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b text-sm sm:text-base">
                  <span className="text-gray-600">HN:</span>
                  <span className="font-medium">{selectedPatient?.hn}</span>
                </div>
                <div className="flex justify-between py-2 border-b text-sm sm:text-base">
                  <span className="text-gray-600">อายุ:</span>
                  <span className="font-medium">{editableAge} ปี</span>
                </div>
                <div className="flex justify-between py-2 border-b text-sm sm:text-base">
                  <span className="text-gray-600">ห้อง:</span>
                  <span className="font-medium">{editableRoom}</span>
                </div>
                {selectedProcedures.length > 0 && (
                  <div className="py-2 border-b">
                    <span className="text-gray-600 block mb-2 font-semibold text-sm sm:text-base">หัตถการพยาบาล:</span>
                    <div className="space-y-1">
                      {selectedProcedures.map((proc, idx) => (
                        <div key={idx} className="text-xs sm:text-sm bg-gray-50 p-2 rounded">
                          <span className="font-medium break-words">{proc.displayName || proc.name}</span>
                          <span className="text-blue-600 ml-2">
                            ({getPerformerLabel(proc.performedBy)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {checkedOther.length > 0 && (
                  <div className="py-2 border-b">
                    <span className="text-gray-600 block mb-2 font-semibold text-sm sm:text-base">หัตถการที่ไม่คิดเงิน:</span>
                    <div className="space-y-1">
                      {checkedOther.map((item, idx) => (
                        <div key={idx} className="text-xs sm:text-sm bg-gray-50 p-2 rounded">
                          <span className="font-medium break-words">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ✅ แสดงจำนวนรูปภาพที่แนบ */}
                {procedureImages.length > 0 && (
                  <div className="flex justify-between py-2 border-b text-sm sm:text-base">
                    <span className="text-gray-600">รูปภาพที่แนบ:</span>
                    <span className="font-medium">{procedureImages.length} รูป</span>
                  </div>
                )}

                {note && (
                  <div className="py-2 border-b">
                    <span className="text-gray-600 block mb-1 text-sm sm:text-base">หมายเหตุ:</span>
                    <span className="font-medium text-xs sm:text-sm break-words">{note}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-3 sm:p-4 border-t flex gap-2 flex-shrink-0">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmSubmit}
                disabled={loading}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'กำลังบันทึก...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProcedureForm;