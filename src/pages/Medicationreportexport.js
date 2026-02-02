import React, { useState, useEffect } from 'react';
import { Users, Download, FileText, Filter, Search, MessageCircle, Pill, Building, Home, Calendar, Send, X, Check, AlertCircle,Bell } from 'lucide-react';
import api from '../api/baseapi';

const MedicationReportExport = () => {
  // States
  const [allResidents, setAllResidents] = useState([]);
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWard, setFilterWard] = useState('all');
  const [filterRoom, setFilterRoom] = useState('all');
  const [selectedResidents, setSelectedResidents] = useState([]);
  const [wards, setWards] = useState([]);
  const [rooms, setRooms] = useState([]);
  
  // Line notification states
  const [showLineModal, setShowLineModal] = useState(false);
  const [currentResident, setCurrentResident] = useState(null);
  const [lineMessage, setLineMessage] = useState('');
  const [familyContacts, setFamilyContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [sendingLine, setSendingLine] = useState(false);

  // Statistics
  const [statistics, setStatistics] = useState({
    totalResidents: 0,
    totalMedications: 0,
    totalWards: 0,
    totalRooms: 0
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    filterResidents();
  }, [searchTerm, filterWard, filterRoom, allResidents]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all wards
      const wardsResponse = await api.get('/ward?is_active=true');
      const wardsData = wardsResponse.data.data;
      setWards(wardsData);

      // Fetch all residents from all wards
      const allResidentsData = [];
      const allRooms = new Set();
      const seenResidentIds = new Set(); // เก็บ ID ที่เจอแล้ว เพื่อป้องกันซ้ำ

      for (const ward of wardsData) {
        try {
          // Get rooms for this ward
          const roomsResponse = await api.get(`/ward/rooms?ward_id=${ward.ward_id}`);
          const roomsData = roomsResponse.data.data;

          // Get residents for each room
          for (const room of roomsData) {
            try {
              const residentsResponse = await api.get(`/ward/residents?room_id=${room.room_number}&is_active=true`);
              const residents = residentsResponse.data.data;

              // Get medications for each resident
              for (const resident of residents) {
                // ตรวจสอบว่าเคยเพิ่มผู้ป่วยคนนี้แล้วหรือยัง
                if (seenResidentIds.has(resident.id)) {
                  console.log(`Skipping duplicate resident: ${resident.patient_name} (ID: ${resident.id})`);
                  continue; // ข้ามไปถ้าเจอแล้ว
                }
                
                seenResidentIds.add(resident.id); // เพิ่ม ID เข้า Set

                try {
                  const medicationsResponse = await api.get(`/medication-reconciliation/${resident.service_registration_id || resident.registration_id}`);
                  const medicationsData = medicationsResponse.data.data;

                  allResidentsData.push({
                    ...resident,
                    ward_id: ward.ward_id,
                    ward_name: ward.ward_name,
                    room_id: room.id,
                    room_number: room.room_number,
                    room_type: room.room_type,
                    medications: medicationsData?.medications || [],
                    medication_count: medicationsData?.medications?.length || 0
                  });

                  allRooms.add(room.room_number);
                } catch (error) {
                  console.error(`Error fetching medications for resident ${resident.id}:`, error);
                  allResidentsData.push({
                    ...resident,
                    ward_id: ward.ward_id,
                    ward_name: ward.ward_name,
                    room_id: room.id,
                    room_number: room.room_number,
                    room_type: room.room_type,
                    medications: [],
                    medication_count: 0
                  });
                }
              }
            } catch (error) {
              console.error(`Error fetching residents for room ${room.room_number}:`, error);
            }
          }
        } catch (error) {
          console.error(`Error fetching rooms for ward ${ward.ward_id}:`, error);
        }
      }

      console.log(`✅ Loaded ${allResidentsData.length} unique residents (removed duplicates)`);
      
      setAllResidents(allResidentsData);
      setFilteredResidents(allResidentsData);
      setRooms(Array.from(allRooms).sort());

      // Calculate statistics
      const totalMedications = allResidentsData.reduce((sum, r) => sum + r.medication_count, 0);
      setStatistics({
        totalResidents: allResidentsData.length,
        totalMedications: totalMedications,
        totalWards: wardsData.length,
        totalRooms: allRooms.size
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const filterResidents = () => {
    let filtered = [...allResidents];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.ward_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by ward
    if (filterWard !== 'all') {
      filtered = filtered.filter(r => r.ward_id === parseInt(filterWard));
    }

    // Filter by room
    if (filterRoom !== 'all') {
      filtered = filtered.filter(r => r.room_number === filterRoom);
    }

    setFilteredResidents(filtered);
  };

  const toggleResidentSelection = (residentId) => {
    setSelectedResidents(prev =>
      prev.includes(residentId)
        ? prev.filter(id => id !== residentId)
        : [...prev, residentId]
    );
  };

  const selectAllResidents = () => {
    if (selectedResidents.length === filteredResidents.length) {
      setSelectedResidents([]);
    } else {
      setSelectedResidents(filteredResidents.map(r => r.id));
    }
  };

  // Helper functions for converting medical codes
  const getFrequencyLabel = (frequency) => {
    const frequencyMap = {
      'od': 'วันละ 1 ครั้ง',
      'qd': 'วันละ 1 ครั้ง',
      'bid': 'วันละ 2 ครั้ง',
      'tid': 'วันละ 3 ครั้ง',
      'qid': 'วันละ 4 ครั้ง',
      'q2h': 'ทุก 2 ชั่วโมง',
      'q3h': 'ทุก 3 ชั่วโมง',
      'q4h': 'ทุก 4 ชั่วโมง',
      'q6h': 'ทุก 6 ชั่วโมง',
      'q8h': 'ทุก 8 ชั่วโมง',
      'q12h': 'ทุก 12 ชั่วโมง',
      'q48h': 'วันเว้นวัน',
      'q72h': 'ทุก 72 ชั่วโมง',
      'prn': 'เมื่อต้องการ',
      'stat': 'ทันที',
      'sos': 'ทานเมื่อมีอาการ'
    };

    if (!frequency) return '';
    const freq = frequency.toLowerCase();
    return frequencyMap[freq] || frequency;
  };

  // (Removed duplicate getTimingLabel function)

  const exportToExcel = () => {
    const residentsToExport = selectedResidents.length > 0
      ? allResidents.filter(r => selectedResidents.includes(r.id))
      : filteredResidents;

    if (residentsToExport.length === 0) {
      alert('ไม่มีข้อมูลที่จะ Export');
      return;
    }

    // Create CSV content with medicine details in separate rows
    const headers = ['ชื่อผู้ป่วย', 'อายุ', 'วอร์ด', 'ห้อง', 'เตียง', 'ชื่อยา', 'ขนาด', 'จำนวนที่ได้รับ', 'วิธีใช้', 'ความถี่', 'เวลา', 'คำแนะนำพิเศษ'];
    
    const rows = [];
    
    residentsToExport.forEach(resident => {
      if (resident.medications && resident.medications.length > 0) {
        // แต่ละยาจะเป็น 1 แถว
        resident.medications.forEach((med, index) => {
          rows.push([
            index === 0 ? (resident.patient_name || '-') : '', // แสดงชื่อแค่แถวแรก
            index === 0 ? (resident.age || '-') : '',
            index === 0 ? (resident.ward_name || '-') : '',
            index === 0 ? (resident.room_number || '-') : '',
            index === 0 ? (resident.bed_number || '-') : '',
            med.medication_name || '-',
            med.dosage || '-',
            med.quantity || '-',
            med.dosage_instruction || '-',
            getFrequencyLabel(med.frequency) || '-',
            formatMealTiming(med.schedule_time_display, med.timing) || '-',
            med.special_instruction || '-'
          ]);
        });
      } else {
        // ถ้าไม่มียา แสดงแถวเดียว
        rows.push([
          resident.patient_name || '-',
          resident.age || '-',
          resident.ward_name || '-',
          resident.room_number || '-',
          resident.bed_number || '-',
          'ไม่มีรายการยา',
          '-',
          '-',
          '-',
          '-',
          '-',
          '-'
        ]);
      }
    });

    const csvContent = [
      '\uFEFF' + headers.join(','), // BOM for UTF-8
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `medication_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`✅ Export สำเร็จ! ดาวน์โหลด ${residentsToExport.length} คน (${rows.length} รายการยา)`);
  };

  const exportToPDF = async () => {
    const residentsToExport = selectedResidents.length > 0
      ? allResidents.filter(r => selectedResidents.includes(r.id))
      : filteredResidents;

    if (residentsToExport.length === 0) {
      alert('ไม่มีข้อมูลที่จะ Export');
      return;
    }

    // Create HTML content for PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>รายงานการรับยา</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Sarabun', 'Tahoma', sans-serif; font-size: 12pt; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h1 { margin: 0; font-size: 20pt; }
          .header p { margin: 5px 0; color: #666; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat-box { text-align: center; padding: 10px; background: #f5f5f5; border-radius: 5px; }
          .stat-box .number { font-size: 24pt; font-weight: bold; color: #2563eb; }
          .stat-box .label { font-size: 10pt; color: #666; }
          .resident { margin-bottom: 20px; page-break-inside: avoid; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
          .resident-header { background: #2563eb; color: white; padding: 10px; margin: -15px -15px 10px -15px; border-radius: 5px 5px 0 0; }
          .resident-info { display: flex; gap: 20px; margin-bottom: 10px; }
          .resident-info div { flex: 1; }
          .label { font-weight: bold; color: #333; }
          .medicine-list { margin-top: 10px; }
          .medicine-item { padding: 8px; background: #f9f9f9; margin-bottom: 5px; border-left: 3px solid #2563eb; }
          .no-medicines { color: #999; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>รายงานการรับยาผู้สูงอายุ</h1>
          <p>ศูนย์เวชศาสตร์ฟื้นฟูหลอดเลือดสมอง เดอะ ซีนิเซ่นส์</p>
          <p>วันที่: ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div class="stats">
          <div class="stat-box">
            <div class="number">${residentsToExport.length}</div>
            <div class="label">ผู้ป่วยทั้งหมด</div>
          </div>
          <div class="stat-box">
            <div class="number">${residentsToExport.reduce((sum, r) => sum + r.medication_count, 0)}</div>
            <div class="label">รายการยาทั้งหมด</div>
          </div>
          <div class="stat-box">
            <div class="number">${new Set(residentsToExport.map(r => r.ward_name)).size}</div>
            <div class="label">วอร์ด</div>
          </div>
          <div class="stat-box">
            <div class="number">${new Set(residentsToExport.map(r => r.room_number)).size}</div>
            <div class="label">ห้อง</div>
          </div>
        </div>
    `;

    residentsToExport.forEach((resident, index) => {
      htmlContent += `
        <div class="resident">
          <div class="resident-header">
            <strong>${index + 1}. ${resident.patient_name}</strong>
          </div>
          <div class="resident-info">
            <div><span class="label">อายุ:</span> ${resident.age || '-'} ปี</div>
            <div><span class="label">วอร์ด:</span> ${resident.ward_name || '-'}</div>
            <div><span class="label">ห้อง:</span> ${resident.room_number || '-'}</div>
            <div><span class="label">เตียง:</span> ${resident.bed_number || '-'}</div>
          </div>
          <div><span class="label">จำนวนยา:</span> ${resident.medication_count} รายการ</div>
          <div class="medicine-list">
            <strong>รายการยา:</strong>
      `;

      if (resident.medications && resident.medications.length > 0) {
        resident.medications.forEach((med, medIndex) => {
          // สร้างข้อมูลยาที่มีความถี่และเวลา
          let medInfo = `${medIndex + 1}. <strong>${med.medication_name}</strong>`;
          
          if (med.generic_name) {
            medInfo += ` (${med.generic_name})`;
          }
          
          if (med.dosage) {
            medInfo += ` - ${med.dosage}`;
          }
          
          if (med.quantity) {
            medInfo += ` จำนวน ${med.quantity}`;
          }
          
          // บรรทัดรายละเอียด
          let details = [];
          
          if (med.dosage_instruction) {
            details.push(med.dosage_instruction);
          }
          
          if (med.frequency) {
            details.push(`ความถี่: ${getFrequencyLabel(med.frequency)}`);
          }
          
          if (med.schedule_time_display || med.timing) {
            const timeInfo = formatMealTiming(med.schedule_time_display, med.timing);
            if (timeInfo) {
              details.push(`เวลา: ${timeInfo}`);
            }
          }
          
          htmlContent += `
            <div class="medicine-item">
              ${medInfo}
              ${details.length > 0 ? `<br><small>${details.join(' • ')}</small>` : ''}
              ${med.special_instruction ? `<br><small style="color: #d97706;">⚠️ ${med.special_instruction}</small>` : ''}
            </div>
          `;
        });
      } else {
        htmlContent += '<div class="no-medicines">ไม่มีรายการยา</div>';
      }

      htmlContent += `
          </div>
        </div>
      `;
    });

    htmlContent += `
      </body>
      </html>
    `;

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.onload = function () {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };

  const handleOpenLineModal = (resident) => {
    if (resident.medication_count === 0) {
      alert('ผู้ป่วยนี้ไม่มีรายการยา');
      return;
    }

    setCurrentResident(resident);

    const medicineList = resident.medications.map((med, index) => {
      let medDetails = `${index + 1}. ${med.medication_name}`;
      
      if (med.dosage) {
        medDetails += ` (${med.dosage})`;
      }
      
      // เพิ่มจำนวนที่ได้รับ
      if (med.quantity) {
        medDetails += ` จำนวน ${med.quantity}`;
      }
      
      if (med.dosage_instruction) {
        medDetails += ` - ${med.dosage_instruction}`;
      }
      
      // เพิ่มความถี่
      if (med.frequency) {
        medDetails += ` ${getFrequencyLabel(med.frequency)}`;
      }
      
      // เพิ่มเวลา
      if (med.schedule_time_display || med.timing) {
        const timeInfo = formatMealTiming(med.schedule_time_display, med.timing);
        if (timeInfo) {
          medDetails += ` ${timeInfo}`;
        }
      }
      
      // เพิ่มคำแนะนำพิเศษ
      if (med.special_instruction) {
        medDetails += `\n   ⚠️ ${med.special_instruction}`;
      }
      
      return medDetails;
    }).join('\n');

    const currentDate = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const message = `📋 รายงานการรับยา
ศูนย์เวชศาสตร์ฟื้นฟูหลอดเลือดสมอง เดอะ ซีนิเซ่นส์

👤 ผู้ป่วย: ${resident.patient_name}
🏥 วอร์ด: ${resident.ward_name}
🚪 ห้อง: ${resident.room_number}
📅 วันที่รับยา: ${currentDate}

💊 รายการยาที่ได้รับ (${resident.medication_count} รายการ):
${medicineList}

✅ ได้รับยาเรียบร้อยแล้ว

ℹ️ หากมีข้อสงสัยเพิ่มเติท กรุณาติดต่อเจ้าหน้าที่`;

    setLineMessage(message);
    fetchFamilyContacts(resident.id);
    setShowLineModal(true);
  };

  const fetchFamilyContacts = async (residentId) => {
    try {
      const response = await api.get(`/residents/${residentId}/family-contacts`);
      setFamilyContacts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching family contacts:', error);
      setFamilyContacts([
        { id: 1, name: 'ญาติผู้ป่วย', phone: '0XX-XXX-XXXX', line_id: 'UXXXXXXXXXXXXXXX' }
      ]);
    }
  };

  // ฟังก์ชันแปลงเวลา (timing)
  const getTimingLabel = (timing) => {
    const timingMap = {
      'ac': 'ก่อนอาหาร',
      'pc': 'หลังอาหาร',
      'hs': 'ก่อนนอน',
      'prn': 'เมื่อต้องการ',
      'stat': 'ทันที',
      'sos': 'เมื่อมีอาการ',
      'S.O.S': 'เมื่อมีอาการ'
    };

    if (!timing) return '';
    const time = timing.toLowerCase();
    return timingMap[time] || timing;
  };

  // ฟังก์ชันจัดการแสดงเวลารับประทานยา
const formatMealTiming = (scheduleTimeDisplay, timing) => {
  if (!scheduleTimeDisplay) return '';

  // 1. กำหนดคำแปลของ timing
  const timingMap = {
    'ac': 'ก่อนอาหาร',
    'pc': 'หลังอาหาร',
    'hs': 'ก่อนนอน',
    'prn': 'เมื่อต้องการ',
    'stat': 'ทันที',
    'sos': 'เมื่อมีอาการ'
  };

  const prefix = timingMap[timing?.toLowerCase()] || '';

  // 2. ตรวจสอบว่าใน scheduleTimeDisplay มีคำระบุประเภทอยู่แล้วหรือไม่
  // เช่น มีคำว่า "ก่อนอาหาร", "หลังอาหาร", "ก่อนนอน" อยู่ในประโยคแล้วหรือยัง
  const hasPrefixAlready = 
    scheduleTimeDisplay.includes('ก่อนอาหาร') || 
    scheduleTimeDisplay.includes('หลังอาหาร') || 
    scheduleTimeDisplay.includes('ก่อนนอน');

  // 3. ถ้าเป็น timing ประเภท ac หรือ pc และยังไม่มีคำนำหน้าในข้อความ
  if ((timing?.toLowerCase() === 'ac' || timing?.toLowerCase() === 'pc') && !hasPrefixAlready) {
    // แยกรายการเวลา (กรณีมีหลายเวลา เช่น "เช้า, เที่ยง, เย็น") 
    // แล้วนำมารวมกันใหม่โดยมี prefix นำหน้าแค่ครั้งเดียว
    const times = scheduleTimeDisplay.split(',').map(t => t.trim()).join(' ');
    return `${prefix} ${times}`;
  }

  // 4. กรณี timing อื่นๆ (เช่น hs, prn) หรือมีคำนำหน้าอยู่แล้ว
  if (timing && !hasPrefixAlready) {
    const timingLabel = timingMap[timing.toLowerCase()] || timing;
    // ถ้า timingLabel ไม่เท่ากับค่าเดิม (คือแปลได้) ให้เอามาต่อกัน
    if (timingLabel !== timing) {
      return `${timingLabel} ${scheduleTimeDisplay}`;
    }
  }

  return scheduleTimeDisplay;
};

const handleSendLineNotification = async () => {
  if (!currentResident) return;

  // 1. เตรียมข้อความที่จะแชร์
  const shareDetails = `\n${lineMessage}`;
  
  // 2. ตรวจสอบว่า Browser รองรับ Web Share API หรือไม่
  if (navigator.share) {
    try { 
      await navigator.share({
        title: 'รายงานจากระบบดูแลผู้สูงอายุ',
        text: shareDetails,
        // url: 'https://your-app-url.com', // ใส่ URL ของเว็บคุณ (ถ้ามี)
      });
      console.log('แชร์สำเร็จ');
      setShowLineModal(false);
    } catch (error) {
      console.log('ยกเลิกการแชร์ หรือ เกิดข้อผิดพลาด:', error);
    }
  } else {
    // 3. Fallback สำหรับ Browser ที่ไม่รองรับ (เปิด LINE โดยตรง)
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareDetails)}`;
    window.open(lineUrl, '_blank');
  }
};

  const ResidentCard = ({ resident }) => {
    const isSelected = selectedResidents.includes(resident.id);

    return (
      <div
        className={`p-5 rounded-xl border-2 transition-all duration-200 ${
          isSelected
            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md'
            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div
              onClick={() => toggleResidentSelection(resident.id)}
              className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              {isSelected && <Check className="w-4 h-4 text-white" />}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg mb-1">
                {resident.patient_name}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>อายุ: {resident.age || '-'} ปี</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Building className="w-4 h-4" />
                  <span>{resident.ward_name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Home className="w-4 h-4" />
                  <span>ห้อง: {resident.room_number}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Pill className="w-4 h-4" />
                  <span>{resident.medication_count} รายการยา</span>
                </div>
              </div>

              {resident.medications && resident.medications.length > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs font-semibold text-gray-700 mb-2">รายการยา:</div>
                  <div className="space-y-1">
                    {resident.medications.slice(0, 3).map((med, idx) => {
                      let medDisplay = med.medication_name;
                      if (med.dosage) medDisplay += ` (${med.dosage})`;
                      if (med.quantity) medDisplay += ` x${med.quantity}`;
                      
                      let details = [];
                      if (med.frequency) {
                        details.push(getFrequencyLabel(med.frequency));
                      }
                      if (med.schedule_time_display || med.timing) {
                        const timeInfo = formatMealTiming(med.schedule_time_display, med.timing);
                        if (timeInfo) details.push(timeInfo);
                      }
                      
                      return (
                        <div key={idx} className="text-xs text-gray-600">
                          • {medDisplay}
                          {details.length > 0 && (
                            <div className="ml-3 text-gray-500">{details.join(' • ')}</div>
                          )}
                        </div>
                      );
                    })}
                    {resident.medications.length > 3 && (
                      <div className="text-xs text-blue-600 font-medium">
                        และอีก {resident.medications.length - 3} รายการ...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => handleOpenLineModal(resident)}
            disabled={resident.medication_count === 0}
            className="ml-3 flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>แจ้งญาติ</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  รายงานผู้ป่วยและยาทั้งหมด
                </h1>
                <p className="text-sm text-gray-600">ศูนย์เวชศาสตร์ฟื้นฟูหลอดเลือดสมอง เดอะ ซีนิเซ่นส์</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={exportToExcel}
                disabled={loading || filteredResidents.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={exportToPDF}
                disabled={loading || filteredResidents.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ผู้ป่วยทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.totalResidents}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">รายการยาทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.totalMedications}</p>
              </div>
              <Pill className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">วอร์ดทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.totalWards}</p>
              </div>
              <Building className="w-10 h-10 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ห้องทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.totalRooms}</p>
              </div>
              <Home className="w-10 h-10 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              ค้นหาและกรองข้อมูล
            </h2>
            {selectedResidents.length > 0 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                เลือกแล้ว {selectedResidents.length} คน
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อผู้ป่วย, วอร์ด, หรือห้อง..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <select
                value={filterWard}
                onChange={(e) => setFilterWard(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
              >
                <option value="all">🏥 ทุกวอร์ด</option>
                {wards.map(ward => (
                  <option key={ward.ward_id} value={ward.ward_id}>{ward.ward_name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
              >
                <option value="all">🚪 ทุกห้อง</option>
                {rooms.map(room => (
                  <option key={room} value={room}>ห้อง {room}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              แสดง {filteredResidents.length} จาก {allResidents.length} คน
            </div>
            <button
              onClick={selectAllResidents}
              className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
            >
              <Check className="w-4 h-4 inline mr-1" />
              {selectedResidents.length === filteredResidents.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
            </button>
          </div>
        </div>

        {/* Residents List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-16 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">กำลังโหลดข้อมูล...</p>
            </div>
          ) : filteredResidents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-16 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">ไม่พบข้อมูลผู้ป่วย</p>
              <p className="text-gray-500 text-sm mt-2">ลองเปลี่ยนตัวกรองหรือค้นหาใหม่</p>
            </div>
          ) : (
            filteredResidents.map(resident => (
              <ResidentCard key={resident.id} resident={resident} />
            ))
          )}
        </div>
      </div>

      {/* LINE Modal */}
      {showLineModal && currentResident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">ส่งรายงานไปยัง LINE</h3>
                    <p className="text-sm text-gray-600">ผู้ป่วย: {currentResident.patient_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowLineModal(false);
                    setCurrentResident(null);
                    setSelectedContacts([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Family Contacts */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">เลือกญาติที่ต้องการแจ้งเตือน:</h4>
                <div className="space-y-2">
                  {familyContacts.map(contact => (
                    <label
                      key={contact.id}
                      className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedContacts([...selectedContacts, contact.id]);
                          } else {
                            setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                          }
                        }}
                        className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{contact.name}</div>
                        <div className="text-sm text-gray-600">{contact.phone}</div>
                      </div>
                      <Bell className="w-5 h-5 text-gray-400" />
                    </label>
                  ))}
                </div>
              </div>

              {/* Message Preview */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">ตัวอย่างข้อความ:</h4>
                <textarea
                  value={lineMessage}
                  onChange={(e) => setLineMessage(e.target.value)}
                  className="w-full h-64 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-mono text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setShowLineModal(false);
                    setCurrentResident(null);
                    setSelectedContacts([]);
                  }}
                  className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSendLineNotification}
                  disabled={sendingLine || selectedContacts.length === 0}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {sendingLine ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>กำลังส่ง...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>ส่งรายงาน ({selectedContacts.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationReportExport;