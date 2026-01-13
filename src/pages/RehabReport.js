import React, { useState, useEffect } from 'react';
import { Search, X, UserPlus, Users, User, Save, Share2, Dumbbell, ChevronRight, Info, AlertCircle, QrCode } from 'lucide-react';
import { useParams } from 'react-router-dom';

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
      fetchWithAuth(`/patients/search?q=${encodeURIComponent(query)}`),
    
    getPatientByHN: (hn) => 
      fetchWithAuth(`/patients/hn/${hn}`),
    
    saveRehabReport: (data) =>
      fetchWithAuth('/reports/rehab', {
        method: 'POST',
        body: JSON.stringify(data),
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

// PatientSearch Component
function PatientSearch({ visible, onClose, onSelectPatient }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setError(null);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await api.searchPatients(query);
      setSearchResults(results.data || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPatient = (patient) => {
    onSelectPatient(patient);
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={24} />
          </button>
          <h2 className="text-lg font-bold">ค้นหาผู้ป่วย</h2>
          <div className="w-10" />
        </div>

        <div className="p-4 bg-gray-50">
          <div className="flex items-center gap-3 bg-white border rounded-xl px-4 py-3">
            <Search size={20} className="text-gray-500" />
            <input
              type="text"
              className="flex-1 outline-none text-base"
              placeholder="ค้นหา HN, ชื่อ, นามสกุล, หรือบัตรประชาชน"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); setError(null); }}>
                <X size={20} className="text-gray-500" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 mt-3 px-1">
            <Info size={16} className="text-gray-500" />
            <p className="text-xs text-gray-600">สามารถค้นหาด้วย HN, ชื่อ-นามสกุล, หรือเลขบัตรประชาชน</p>
          </div>
          {error && (
            <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={16} className="text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">กำลังค้นหา...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className="w-full flex items-center gap-3 p-4 bg-white border rounded-xl hover:border-green-500 hover:shadow-md transition-all text-left"
                >
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    {patient.profile_image ? (
                      <img src={patient.profile_image} alt="" className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                      <User size={32} className="text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {patient.first_name} {patient.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      HN: {patient.hn} | อายุ: {patient.age} ปี | เพศ: {patient.gender}
                    </p>
                    {patient.blood_type && (
                      <p className="text-xs text-red-600">หมู่เลือด: {patient.blood_type}</p>
                    )}
                    {patient.chronic_diseases && (
                      <p className="text-xs text-red-500 italic truncate">โรคประจำตัว: {patient.chronic_diseases}</p>
                    )}
                  </div>
                  <ChevronRight size={24} className="text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          ) : searchQuery.length >= 2 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Search size={64} className="text-gray-300" />
              <p className="mt-4 text-lg font-semibold text-gray-600">ไม่พบผู้ป่วย</p>
              <p className="mt-2 text-sm text-gray-500">ลองค้นหาด้วยคำอื่นหรือตรวจสอบความถูกต้อง</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <Users size={64} className="text-gray-300" />
              <p className="mt-4 text-lg font-semibold text-gray-600">ค้นหาผู้ป่วย</p>
              <p className="mt-2 text-sm text-gray-500">พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อเริ่มค้นหา</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// RehabReport Component
export default function RehabReport() {
  const { user } = useAuth();
    const { hn } = useParams(); // เพิ่มบรรทัดนี้

  const [showShareButton, setShowShareButton] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    roomNumber: '',
    date: new Date().toISOString().split('T')[0],
    rehabPackage: '',
    rehabEfficiency: '',
    progressOutcome: '',
    appointment: '',
    others: '',
  });


  useEffect(() => {
    // ลบส่วนเดิมที่อ่าน query string
    // const params = new URLSearchParams(window.location.search);
    // const hn = params.get('hn');
    
    if (hn) {
      loadPatientByHN(hn);
    }
  }, [hn]); // เพิ่ม dependency

  const loadPatientByHN = async (hn) => {
    try {
      setIsLoadingPatient(true);
      const patient = await api.getPatientByHN(hn);
      setSelectedPatient(patient.data);
      //alert(`โหลดข้อมูลสำเร็จ\nผู้ป่วย: ${patient.first_name} ${patient.last_name}\nHN: ${patient.hn}`);
    } catch (error) {
      alert(`ข้อผิดพลาด\nไม่พบข้อมูลผู้ป่วย HN: ${hn}`);
    } finally {
      setIsLoadingPatient(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    alert(`เลือกผู้ป่วยสำเร็จ\n${patient.first_name} ${patient.last_name}\nHN: ${patient.hn}`);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const generateQRCodeURL = () => {
    if (!selectedPatient) return '';
    const baseURL = window.location.origin + window.location.pathname;
    return `${baseURL}?hn=${selectedPatient.hn}`;
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
    const reporterName = user?.nickname || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'ผู้ใช้งาน';
    const patientName = selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : '';

    return `${formData.roomNumber} ${patientName}
HN: ${selectedPatient?.hn || ''}
วันที่ : ${formatDate(formData.date)}
—--------------------------------------------------------------------------------------------------------------------------------------
กายภาพ (Rehab)
แพ็คเกจ : ${formData.rehabPackage}
ประสิทธิภาพในการทำกายภาพ : ${formData.rehabEfficiency}
—--------------------------------------------------------------------------------------------------------------------------------------
Progress & Outcome
${formData.progressOutcome}
—--------------------------------------------------------------------------------------------------------------------------------------
การนัดหมาย (Appointment) : 
กายภาพ : ${formData.appointment}
—--------------------------------------------------------------------------------------------------------------------------------------
อื่นๆ
${formData.others}
*หากมีกิจกรรมให้ใส่ว่าเข้าร่วมหรือไม่ อาทิ เข้ากิจกรรมกีฬาสีหรือไม่
—--------------------------------------------------------------------------------------------------------------------------------------
ผู้รายงาน : ${reporterName} (${user?.code || user?.username || ''})
—--------------------------------------------------------------------------------------------------------------------------------------
พวกเราจะพยายามอย่างเต็มที่เพื่อให้มั่นใจว่า คุณ${patientName}
จะได้รับการดูแลที่ดีที่สุดในทุกๆวัน ขอบคุณค่ะ
หากมีข้อสงสัย หรือสอบถามข้อมูลเพิ่มเติม
สามารถติดต่อได้ที่เบอร์โทรศัพท์ 02-412-0999 (เวลาทำการ 08:00-17:00 น.)`;
  };

  const handleSave = async () => {
    if (!selectedPatient) {
      alert('กรุณาเลือกผู้ป่วย\nกรุณาค้นหาและเลือกข้อมูลผู้ป่วยก่อน');
      return;
    }
    if (!formData.roomNumber) {
      alert('กรุณากรอกเลขห้อง\nกรุณากรอกเลขห้องผู้ป่วย');
      return;
    }

    try {
      setIsSaving(true);
      
      const reportData = {
        patient_id: selectedPatient.id,
        patient_hn: selectedPatient.hn,
        room_number: formData.roomNumber,
        report_date: formData.date,
        rehab_package: formData.rehabPackage,
        rehab_efficiency: formData.rehabEfficiency,
        progress_outcome: formData.progressOutcome,
        appointment: formData.appointment,
        others: formData.others,
      };

      await api.saveRehabReport(reportData);

      const reportText = generateReportText();
      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `รายงานกายภาพ_${formData.roomNumber}_${selectedPatient.first_name}_${formData.date}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
      setShowShareButton(true);
      alert('สำเร็จ\nบันทึกรายงานเรียบร้อยแล้ว');
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
      navigator.share({ text: reportText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(reportText);
      alert('คัดลอกไปยังคลิปบอร์ดแล้ว');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Dumbbell size={28} className="text-green-600" />
            <h1 className="text-xl font-bold text-gray-900">รายงานกายภาพ (Rehab)</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              <Save size={20} />
              {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
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
                className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 font-semibold rounded-lg border border-green-600 transition"
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
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
              <p className="mt-3 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          )}

          {selectedPatient ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                  <User size={24} className="text-green-700" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-green-900 text-lg">
                    {selectedPatient.first_name} {selectedPatient.last_name}
                  </p>
                  <p className="text-sm text-green-700">
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
                  className="p-2 hover:bg-green-100 rounded-lg transition"
                >
                  <Search size={20} className="text-gray-600" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSearchModal(true)}
              className="w-full bg-green-50 border-2 border-dashed border-green-300 rounded-xl p-8 flex flex-col items-center hover:bg-green-100 transition"
            >
              <UserPlus size={32} className="text-green-600" />
              <p className="mt-3 font-semibold text-green-600">กดเพื่อเลือกผู้ป่วย</p>
              <p className="text-sm text-gray-600 mt-1">ค้นหาด้วย HN, ชื่อ, หรือนามสกุล</p>
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลขห้อง <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => handleChange('roomNumber', e.target.value)}
                placeholder="กรอกเลขห้อง เช่น 301"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันที่</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">กายภาพ (Rehab)</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">แพ็คเกจ</label>
            <input
              type="text"
              value={formData.rehabPackage}
              onChange={(e) => handleChange('rehabPackage', e.target.value)}
              placeholder="เช่น Intensive Rehab"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ประสิทธิภาพในการทำกายภาพ
              <span className="block text-xs text-gray-500 font-normal">(อธิบายโดยคร่าวๆ ว่าทำอะไรบ้าง)</span>
            </label>
            <textarea
              value={formData.rehabEfficiency}
              onChange={(e) => handleChange('rehabEfficiency', e.target.value)}
              placeholder="อธิบายกิจกรรมกายภาพและความสามารถ"
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Progress & Outcome</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ความก้าวหน้าและผลลัพธ์</label>
            <textarea
              value={formData.progressOutcome}
              onChange={(e) => handleChange('progressOutcome', e.target.value)}
              placeholder="อธิบายความก้าวหน้า"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">การนัดหมาย (Appointment)</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">กายภาพ</label>
            <input
              type="text"
              value={formData.appointment}
              onChange={(e) => handleChange('appointment', e.target.value)}
              placeholder="ระบุการนัดหมาย"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">อื่นๆ</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              กิจกรรมเพิ่มเติม
              <span className="block text-xs text-gray-500 font-normal">*หากมีกิจกรรมให้ใส่ว่าเข้าร่วมหรือไม่</span>
            </label>
            <textarea
              value={formData.others}
              onChange={(e) => handleChange('others', e.target.value)}
              placeholder="ระบุกิจกรรมและการเข้าร่วม"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ผู้รายงาน</label>
            <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
              {user?.nickname || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'ผู้ใช้งาน'}
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Info size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-900 mb-1">วิธีใช้งาน QR Code</p>
            <p className="text-xs text-green-700">
              1. เลือกผู้ป่วยที่ต้องการ<br/>
              2. กดปุ่ม "สร้าง QR" เพื่อสร้าง QR Code<br/>
              3. นำ QR Code ไปติดที่เตียงผู้ป่วย<br/>
              4. เมื่อต้องการกรอกข้อมูล สแกน QR Code ด้วยแอปใดก็ได้ ระบบจะโหลดข้อมูลผู้ป่วยอัตโนมัติ
            </p>
          </div>
        </div>
      </div>

      <PatientSearch
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectPatient={handleSelectPatient}
      />
    </div>
  );
}