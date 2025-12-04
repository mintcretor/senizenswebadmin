import React, { useState, useEffect } from 'react';
import { Search, X, UserPlus, Users, User, Download, Share2, ChevronRight, Info, AlertCircle, QrCode, FileText, Calendar } from 'lucide-react';
import { useParams } from 'react-router-dom';

// API Configuration
const API_BASE_URL = 'http://172.16.40.11:3001/api';

const createApiClient = () => {
    const getToken = () => {
        try {
            return localStorage.getItem('authToken');
        } catch {
            return null;
        }
    };

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
        getMultidisciplinaryReports: (patientId) =>
            fetchWithAuth(`/reports/patient/${patientId}/multidisciplinary`),
        getRehabReports: (patientId) =>
            fetchWithAuth(`/reports/patient/${patientId}/rehab`),
    };
};

const api = createApiClient();

const useAuth = () => {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <X size={20} className="sm:w-6 sm:h-6" />
                    </button>
                    <h2 className="text-base sm:text-lg font-bold">ค้นหาผู้ป่วย</h2>
                    <div className="w-10" />
                </div>

                <div className="p-3 sm:p-4 bg-gray-50">
                    <div className="flex items-center gap-2 sm:gap-3 bg-white border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
                        <Search size={18} className="sm:w-5 sm:h-5 text-gray-500" />
                        <input
                            type="text"
                            className="flex-1 outline-none text-sm sm:text-base"
                            placeholder="ค้นหา HN, ชื่อ, นามสกุล, หรือบัตรประชาชน"
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
                    <div className="flex items-center gap-2 mt-2 sm:mt-3 px-1">
                        <Info size={14} className="sm:w-4 sm:h-4 text-gray-500" />
                        <p className="text-xs text-gray-600">สามารถค้นหาด้วย HN, ชื่อ-นามสกุล, หรือเลขบัตรประชาชน</p>
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 mt-2 sm:mt-3 px-2 sm:px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle size={14} className="sm:w-4 sm:h-4 text-red-600" />
                            <p className="text-xs sm:text-sm text-red-600">{error}</p>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                    {isSearching ? (
                        <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-600"></div>
                            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">กำลังค้นหา...</p>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="space-y-2 sm:space-y-3">
                            {searchResults.map((patient) => (
                                <button
                                    key={patient.id}
                                    onClick={() => handleSelectPatient(patient)}
                                    className="w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white border rounded-xl hover:border-purple-500 hover:shadow-md transition-all text-left"
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
                                        {patient.blood_type && (
                                            <p className="text-xs text-red-600">หมู่เลือด: {patient.blood_type}</p>
                                        )}
                                        {patient.chronic_diseases && (
                                            <p className="text-xs text-red-500 italic truncate">โรคประจำตัว: {patient.chronic_diseases}</p>
                                        )}
                                    </div>
                                    <ChevronRight size={20} className="sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
                                </button>
                            ))}
                        </div>
                    ) : searchQuery.length >= 2 ? (
                        <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                            <Search size={48} className="sm:w-16 sm:h-16 text-gray-300" />
                            <p className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-gray-600">ไม่พบผู้ป่วย</p>
                            <p className="mt-2 text-xs sm:text-sm text-gray-500 text-center px-4">ลองค้นหาด้วยคำอื่นหรือตรวจสอบความถูกต้อง</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                            <Users size={48} className="sm:w-16 sm:h-16 text-gray-300" />
                            <p className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-gray-600">ค้นหาผู้ป่วย</p>
                            <p className="mt-2 text-xs sm:text-sm text-gray-500 text-center px-4">พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อเริ่มค้นหา</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// DailyReport Component
export default function DailyReport() {
    const { user } = useAuth();
    const { hn } = useParams();
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [isLoadingPatient, setIsLoadingPatient] = useState(false);
    const [isLoadingReports, setIsLoadingReports] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [multiReports, setMultiReports] = useState([]);
    const [rehabReports, setRehabReports] = useState([]);

    useEffect(() => {
        if (hn) {
            loadPatientByHN(hn);
        }
    }, [hn]);

    useEffect(() => {
        if (selectedPatient) {
            loadReports();
        }
    }, [selectedPatient, selectedDate]);

    const loadPatientByHN = async (hn) => {
        try {
            setIsLoadingPatient(true);
            const response = await api.getPatientByHN(hn);
            setSelectedPatient(response.data);
        } catch (error) {
            alert(`ข้อผิดพลาด\nไม่พบข้อมูลผู้ป่วย HN: ${hn}`);
        } finally {
            setIsLoadingPatient(false);
        }
    };

    const loadReports = async () => {
        if (!selectedPatient) return;

        try {
            setIsLoadingReports(true);

            const [multiResponse, rehabResponse] = await Promise.all([
                api.getMultidisciplinaryReports(selectedPatient.id),
                api.getRehabReports(selectedPatient.id),
            ]);

            console.log('Multi Reports:', multiResponse);   
            const normalizeDate = (dateStr) => {
                if (!dateStr) return null;
                return dateStr.split('T')[0];
            };

            const filteredMulti = (multiResponse.data || []).filter(
                report => normalizeDate(report.report_date) === selectedDate
            );
            const filteredRehab = (rehabResponse.data || []).filter(
                report => normalizeDate(report.report_date) === selectedDate
            );

            setMultiReports(filteredMulti);
            setRehabReports(filteredRehab);
        } catch (error) {
            console.error('Load reports error:', error);
            alert('ไม่สามารถโหลดรายงานได้');
        } finally {
            setIsLoadingReports(false);
        }
    };

    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const thaiYear = date.getFullYear() + 543;
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${thaiYear}`;
    };

    const formatDateShort = (dateStr) => {
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

    const generateDailyReportText = () => {
        const patientName = selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : '';
        let reportText = `รายงานประจำวัน - ${patientName}
HN: ${selectedPatient?.hn || ''}
วันที่: ${formatDate(selectedDate)}
═══════════════════════════════════════════════════════════════════════════════

`;

        if (multiReports.length > 0) {
            multiReports.forEach((report, index) => {
                reportText += `📋 รายงานสหวิชาชีพ + ยา ${multiReports.length > 1 ? `(${index + 1})` : ''}
ห้อง: ${report.room_number || '-'}
เวร: ${report.shift || '-'} 
วันที่: ${formatDateShort(report.report_date)}

อาการโดยรวม (ภายใน 24 ชม.):
${report.overall_condition || '-'}

สัญญาณชีพ: ${report.vital_signs || '-'}
${report.temperature ? `• อุณหภูมิ: ${report.temperature}°C` : ''}
${report.pulse ? `• ชีพจร: ${report.pulse} ครั้ง/นาที` : ''}
${report.respiration ? `• หายใจ: ${report.respiration} ครั้ง/นาที` : ''}
${report.blood_pressure ? `• ความดัน: ${report.blood_pressure} mmHg` : ''}
${report.o2_saturation ? `• ออกซิเจน: ${report.o2_saturation}%` : ''}

การขับถ่าย:
- ปัสสาวะ: ${report.urination && report.urination !== 0 ? `${report.urination} ครั้ง` : 'ยังไม่ได้ถปัสสาวะ'}
- อุจจาระ: ${report.defecation && report.defecation !== 0 ? `${report.defecation} ครั้ง` : 'ยังไม่ได้ถ่ายอุจจาระ'}

${report.additional_notes ? `หมายเหตุ: ${report.additional_notes}` : ''}
${report.appointment ? `การนัดหมาย: ${report.appointment}` : ''}

ผู้รายงาน: ${report.first_name || ''} ${report.last_name || ''}

───────────────────────────────────────────────────────────────────────────────
`;
            });
        }

        if (rehabReports.length > 0) {
            rehabReports.forEach((report, index) => {
                reportText += `💪 รายงานกายภาพ (Rehab) ${rehabReports.length > 1 ? `(${index + 1})` : ''}
ห้อง: ${report.room_number || '-'}
วันที่: ${formatDateShort(report.report_date)}

แพ็คเกจ: ${report.rehab_package || '-'}

ประสิทธิภาพในการทำกายภาพ:
${report.rehab_efficiency || '-'}

Progress & Outcome:
${report.progress_outcome || '-'}

${report.appointment ? `การนัดหมาย (กายภาพ): ${report.appointment}` : ''}

${report.others ? `อื่นๆ:\n${report.others}` : ''}

ผู้รายงาน: ${report.first_name || ''} ${report.last_name || ''}

───────────────────────────────────────────────────────────────────────────────

`;
            });
        }

        if (multiReports.length === 0 && rehabReports.length === 0) {
            reportText += `ไม่มีรายงานในวันที่ ${formatDate(selectedDate)}

`;
        }

        reportText += `═══════════════════════════════════════════════════════════════════════════════
พวกเราจะพยายามอย่างเต็มที่เพื่อให้มั่นใจว่า คุณ${patientName}
จะได้รับการดูแลที่ดีที่สุดในทุกๆวัน ขอบคุณค่ะ

หากมีข้อสงสัย หรือสอบถามข้อมูลเพิ่มเติม
สามารถติดต่อได้ที่เบอร์โทรศัพท์ 02-412-0999 (เวลาทำการ 08:00-17:00 น.)`;

        return reportText;
    };

    const handleDownload = () => {
        if (!selectedPatient) {
            alert('กรุณาเลือกผู้ป่วยก่อน');
            return;
        }

        const reportText = generateDailyReportText();

        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'TH SarabunPSK', 'Angsana New', 'Cordia New', sans-serif; font-size: 16pt; }
          pre { font-family: 'TH SarabunPSK', 'Angsana New', 'Cordia New', sans-serif; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <pre>${reportText}</pre>
      </body>
      </html>
    `;

        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/msword;charset=utf-8'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `รายงานประจำวัน_${selectedPatient.first_name}_${selectedDate}.doc`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const fallbackCopy = (text) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            alert('คัดลอกไปยังคลิปบอร์ดแล้ว ✅');
        } catch (error) {
            alert('ไม่สามารถคัดลอกได้ กรุณาลองใหม่');
        }

        document.body.removeChild(textArea);
    };

    const handleShare = () => {
        const reportText = generateDailyReportText();
        const encodedText = encodeURIComponent(reportText);

        // ลองเปิด LINE
        const lineUrl = `https://line.me/R/msg/text/?${encodedText}`;
        const newWindow = window.open(lineUrl, '_blank');

        // ถ้าเปิดไม่ได้ (popup blocked) ให้คัดลอกแทน
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            const userWantsCopy = window.confirm('ไม่สามารถเปิด LINE ได้\nต้องการคัดลอกข้อความแทนหรือไม่?');
            if (userWantsCopy) {
                fallbackCopy(reportText);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                        <FileText size={24} className="text-purple-600 sm:w-7 sm:h-7" />
                        <h1 className="text-base sm:text-xl font-bold text-gray-900">รายงานประจำวัน (สำหรับญาติ)</h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDownload}
                            disabled={!selectedPatient}
                            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition text-sm sm:text-base"
                        >
                            <Download size={18} className="sm:w-5 sm:h-5" />
                            <span>ดาวน์โหลด</span>
                        </button>
                        <button
                            onClick={handleShare}
                            disabled={!selectedPatient}
                            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition text-sm sm:text-base"
                        >
                            <Share2 size={18} className="sm:w-5 sm:h-5" />
                            <span>แชร์</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4">
                    <div className="flex items-center justify-between mb-4 gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900">ข้อมูลผู้ป่วย</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowSearchModal(true)}
                                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 font-semibold rounded-lg border border-purple-600 transition text-sm sm:text-base"
                            >
                                <Search size={18} className="sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">ค้นหา</span>
                            </button>
                            {selectedPatient && (
                                <button
                                    onClick={handleGenerateQR}
                                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold rounded-lg border border-indigo-600 transition text-sm sm:text-base"
                                >
                                    <QrCode size={18} className="sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">สร้าง QR</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {isLoadingPatient && (
                        <div className="flex flex-col items-center py-6 sm:py-8">
                            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-purple-600"></div>
                            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600">กำลังโหลดข้อมูล...</p>
                        </div>
                    )}

                    {selectedPatient ? (
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 sm:p-4 mb-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                                    <User size={20} className="sm:w-6 sm:h-6 text-purple-700" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-purple-900 text-base sm:text-lg truncate">
                                        {selectedPatient.first_name} {selectedPatient.last_name}
                                    </p>
                                    <p className="text-xs sm:text-sm text-purple-700">
                                        HN: {selectedPatient.hn} | {selectedPatient.age} ปี | {selectedPatient.gender}
                                    </p>
                                    {selectedPatient.chronic_diseases && (
                                        <p className="text-xs text-red-600 italic mt-1 line-clamp-2">
                                            โรคประจำตัว: {selectedPatient.chronic_diseases}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowSearchModal(true)}
                                    className="p-2 hover:bg-purple-100 rounded-lg transition flex-shrink-0"
                                >
                                    <Search size={18} className="sm:w-5 sm:h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowSearchModal(true)}
                            className="w-full bg-purple-50 border-2 border-dashed border-purple-300 rounded-xl p-6 sm:p-8 flex flex-col items-center hover:bg-purple-100 transition"
                        >
                            <UserPlus size={28} className="sm:w-8 sm:h-8 text-purple-600" />
                            <p className="mt-2 sm:mt-3 font-semibold text-purple-600 text-sm sm:text-base">กดเพื่อเลือกผู้ป่วย</p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">ค้นหาด้วย HN, ชื่อ, หรือนามสกุล</p>
                        </button>
                    )}

                    {selectedPatient && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar size={16} className="inline mr-2" />
                                เลือกวันที่
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                            />
                        </div>
                    )}
                </div>

                {selectedPatient && (
                    <>
                        {isLoadingReports ? (
                            <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 flex flex-col items-center">
                                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-600"></div>
                                <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">กำลังโหลดรายงาน...</p>
                            </div>
                        ) : (
                            <>
                                {multiReports.length === 0 && rehabReports.length === 0 ? (
                                    <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 flex flex-col items-center">
                                        <FileText size={48} className="sm:w-16 sm:h-16 text-gray-300" />
                                        <p className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-gray-600">ไม่มีรายงาน</p>
                                        <p className="mt-2 text-xs sm:text-sm text-gray-500 text-center">
                                            ไม่พบรายงานในวันที่ {formatDate(selectedDate)}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {multiReports.length > 0 && (
                                            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4">
                                                <h2 className="text-base sm:text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                                                    <div className="w-1.5 sm:w-2 h-5 sm:h-6 bg-blue-600 rounded"></div>
                                                    รายงานสหวิชาชีพ + ยา
                                                </h2>

                                                {multiReports.map((report, index) => (
                                                    <div key={report.report_id} className="mb-6 last:mb-0">
                                                        {multiReports.length > 1 && (
                                                            <p className="text-sm font-semibold text-gray-600 mb-2">รายงานที่ {index + 1}</p>
                                                        )}

                                                        <div className="bg-blue-50 rounded-lg p-3 sm:p-4 space-y-3">
                                                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                                                <div>
                                                                    <p className="text-xs text-gray-600">ห้อง</p>
                                                                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{report.room_number || '-'}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-gray-600">เวร</p>
                                                                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{report.shift || '-'}</p>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs text-gray-600 mb-1">อาการโดยรวม</p>
                                                                <p className="text-xs sm:text-sm text-gray-900 whitespace-pre-wrap">{report.overall_condition || '-'}</p>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs text-gray-600 mb-2">สัญญาณชีพ: {report.vital_signs || '-'}</p>
                                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                                                                    {report.temperature && (
                                                                        <div className="bg-white rounded px-2 sm:px-3 py-2">
                                                                            <p className="text-xs text-gray-500">อุณหภูมิ</p>
                                                                            <p className="font-semibold text-sm">{report.temperature}°C</p>
                                                                        </div>
                                                                    )}
                                                                    {report.pulse && (
                                                                        <div className="bg-white rounded px-2 sm:px-3 py-2">
                                                                            <p className="text-xs text-gray-500">ชีพจร</p>
                                                                            <p className="font-semibold text-sm">{report.pulse}</p>
                                                                        </div>
                                                                    )}
                                                                    {report.respiration && (
                                                                        <div className="bg-white rounded px-2 sm:px-3 py-2">
                                                                            <p className="text-xs text-gray-500">หายใจ</p>
                                                                            <p className="font-semibold text-sm">{report.respiration}</p>
                                                                        </div>
                                                                    )}
                                                                    {report.blood_pressure && (
                                                                        <div className="bg-white rounded px-2 sm:px-3 py-2">
                                                                            <p className="text-xs text-gray-500">ความดัน</p>
                                                                            <p className="font-semibold text-sm">{report.blood_pressure}</p>
                                                                        </div>
                                                                    )}
                                                                    {report.o2_saturation && (
                                                                        <div className="bg-white rounded px-2 sm:px-3 py-2">
                                                                            <p className="text-xs text-gray-500">ออกซิเจน</p>
                                                                            <p className="font-semibold text-sm">{report.o2_saturation}%</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-3 gap-2 text-sm">
                                                                <div className="bg-white rounded px-2 sm:px-3 py-2">
                                                                    <p className="text-xs text-gray-500">ปัสสาวะ</p>
                                                                    <p className="font-semibold text-xs sm:text-sm">{report.urination && report.urination !== 0 ? `${report.urination} ครั้ง` : 'ยังไม่ได้ปัสสาวะ'}</p>
                                                                </div>
                                                                <div className="bg-white rounded px-2 sm:px-3 py-2">
                                                                    <p className="text-xs text-gray-500">อุจจาระ</p>
                                                                    <p className="font-semibold text-xs sm:text-sm">{report.defecation && report.defecation !== 0 ? `${report.defecation} ครั้ง` : 'ยังไม่ได้ถ่าย'}</p>
                                                                </div>

                                                            </div>



                                                            {report.additional_notes && (
                                                                <div>
                                                                    <p className="text-xs text-gray-600 mb-1">หมายเหตุ</p>
                                                                    <p className="text-xs sm:text-sm text-gray-900 whitespace-pre-wrap">{report.additional_notes}</p>
                                                                </div>
                                                            )}

                                                            <div className="pt-2 border-t border-blue-200">
                                                                <p className="text-xs text-gray-600">
                                                                    ผู้รายงาน: {report.first_name || ''} {report.last_name || ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {rehabReports.length > 0 && (
                                            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4">
                                                <h2 className="text-base sm:text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                                                    <div className="w-1.5 sm:w-2 h-5 sm:h-6 bg-green-600 rounded"></div>
                                                    รายงานกายภาพ (Rehab)
                                                </h2>

                                                {rehabReports.map((report, index) => (
                                                    <div key={report.report_id} className="mb-6 last:mb-0">
                                                        {rehabReports.length > 1 && (
                                                            <p className="text-sm font-semibold text-gray-600 mb-2">รายงานที่ {index + 1}</p>
                                                        )}

                                                        <div className="bg-green-50 rounded-lg p-3 sm:p-4 space-y-3">
                                                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                                                <div>
                                                                    <p className="text-xs text-gray-600">ห้อง</p>
                                                                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{report.room_number || '-'}</p>
                                                                </div>
                                                                {report.rehab_package && (
                                                                    <div>
                                                                        <p className="text-xs text-gray-600">แพ็คเกจ</p>
                                                                        <p className="font-semibold text-gray-900 text-sm sm:text-base">{report.rehab_package}</p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {report.rehab_efficiency && (
                                                                <div>
                                                                    <p className="text-xs text-gray-600 mb-1">ประสิทธิภาพในการทำกายภาพ</p>
                                                                    <p className="text-xs sm:text-sm text-gray-900 whitespace-pre-wrap">{report.rehab_efficiency}</p>
                                                                </div>
                                                            )}

                                                            {report.progress_outcome && (
                                                                <div>
                                                                    <p className="text-xs text-gray-600 mb-1">Progress & Outcome</p>
                                                                    <p className="text-xs sm:text-sm text-gray-900 whitespace-pre-wrap">{report.progress_outcome}</p>
                                                                </div>
                                                            )}

                                                            {report.appointment && (
                                                                <div className="bg-white rounded px-2 sm:px-3 py-2">
                                                                    <p className="text-xs text-gray-500">นัดหมาย (กายภาพ)</p>
                                                                    <p className="text-xs sm:text-sm font-semibold text-gray-900">{report.appointment}</p>
                                                                </div>
                                                            )}

                                                            {report.others && (
                                                                <div>
                                                                    <p className="text-xs text-gray-600 mb-1">อื่นๆ</p>
                                                                    <p className="text-xs sm:text-sm text-gray-900 whitespace-pre-wrap">{report.others}</p>
                                                                </div>
                                                            )}

                                                            <div className="pt-2 border-t border-green-200">
                                                                <p className="text-xs text-gray-600">
                                                                    ผู้รายงาน: {report.first_name || ''} {report.last_name || ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                    <Info size={18} className="sm:w-5 sm:h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-purple-900 mb-1">วิธีใช้งาน</p>
                        <p className="text-xs text-purple-700">
                            1. เลือกผู้ป่วยที่ต้องการดูรายงาน<br />
                            2. เลือกวันที่ที่ต้องการดูรายงาน<br />
                            3. กดปุ่ม "ดาวน์โหลด" เพื่อบันทึกเป็นไฟล์ หรือ "แชร์" เพื่อส่งให้ญาติผู้ป่วย<br />
                            4. สามารถสร้าง QR Code เพื่อให้ญาติสแกนและดูรายงานได้โดยตรง
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