import React, { useState, useEffect } from 'react';
import { Plus, X, Clock, CheckCircle } from 'lucide-react';

/**
 * MedicationDetail Component - Form/Modal Style
 * แสดงข้อมูลยาแบบ form ตามรูปที่ Na ต้องการ
 */
function MedicationDetail({
  patient = null,
  medications = [],
  onDispense = () => { },
  onReturn = () => { },
  onAddMedicine = () => { },
  onSelectMedicine = () => { },
  selectedMedicine = null,
  calculateStock = () => 0,
  getTransactionHistory = () => [],
  getStockStatus = () => 'OK'
}) {
  const [expandedMedicine, setExpandedMedicine] = useState(null);
  const [checkedMedicines, setCheckedMedicines] = useState({});
  const [medicineQuantities, setMedicineQuantities] = useState({});
  const [scheduleData, setScheduleData] = useState({});
  const [notes, setNotes] = useState({});

  // Calculate duration from start and end dates
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  };

  const currentMed = medications.find(m => m.id === expandedMedicine);

  // Initialize schedule data when modal opens
  useEffect(() => {
    if (expandedMedicine && currentMed && !scheduleData[currentMed.id]) {
      const startDate = currentMed.startDate ? new Date(currentMed.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const endDate = currentMed.endDate ? new Date(currentMed.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      
      setScheduleData(prev => ({
        ...prev,
        [currentMed.id]: {
          startDate,
          endDate,
          duration: calculateDuration(startDate, endDate)
        }
      }));
    }
  }, [expandedMedicine, currentMed]);

  // Handle start date change
  const handleStartDateChange = (medId, value) => {
    const currentEnd = scheduleData[medId]?.endDate || (currentMed?.endDate ? new Date(currentMed.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setScheduleData(prev => ({
      ...prev,
      [medId]: {
        ...prev[medId],
        startDate: value,
        endDate: currentEnd,
        duration: calculateDuration(value, currentEnd)
      }
    }));
  };

  // Handle end date change
  const handleEndDateChange = (medId, value) => {
    const currentStart = scheduleData[medId]?.startDate || (currentMed?.startDate ? new Date(currentMed.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setScheduleData(prev => ({
      ...prev,
      [medId]: {
        ...prev[medId],
        startDate: currentStart,
        endDate: value,
        duration: calculateDuration(currentStart, value)
      }
    }));
  };

  if (!patient) {
    return (
      <div className="card h-full flex items-center justify-center min-h-80">
        <div className="empty-state">
          <div className="empty-state-icon">💊</div>
          <div className="empty-state-title">ยังไม่มีข้อมูล</div>
          <div className="empty-state-text">เลือกผู้ป่วยเพื่อดูข้อมูลยา</div>
        </div>
      </div>
    );
  }

  const currentStock = expandedMedicine ? calculateStock(expandedMedicine) : 0;
  const status = expandedMedicine ? getStockStatus(currentStock, currentMed?.initialStock) : 'OK';

  // Handle checkbox toggle
  const handleCheckboxChange = (medId) => {
    setCheckedMedicines(prev => ({
      ...prev,
      [medId]: !prev[medId]
    }));
  };

  // Handle quantity change
  const handleQuantityChange = (medId, value) => {
    setMedicineQuantities(prev => ({
      ...prev,
      [medId]: value
    }));
  };

  // Handle notes change
  const handleNotesChange = (medId, value) => {
    setNotes(prev => ({
      ...prev,
      [medId]: value
    }));
  };

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Medications List - SCROLLABLE */}
      <div className="flex-1 overflow-y-auto">
        {medications.length === 0 ? (
          <div className="card flex items-center justify-center py-12">
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-title">ไม่มียา</div>
              <div className="empty-state-text">คลิก "เพิ่มยา" เพื่อเพิ่มยาสำหรับผู้ป่วยนี้</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {medications.map((med) => {
              const medStock = calculateStock(med.id);
              const medStatus = getStockStatus(medStock, med.initialStock);

              return (
                <div
                  key={med.id}
                  onClick={() => setExpandedMedicine(med.id === expandedMedicine ? null : med.id)}
                  className="card cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-gray-900">
                          {med.medicineName}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          {med.dose} {med.unit} | {med.medicineCode}
                        </p>
                      </div>

                      {/* Status Badge */}
                      {medStatus === 'OK' && (
                        <span className="badge badge-success text-xs">✓ ดี</span>
                      )}
                      {medStatus === 'LOW' && (
                        <span className="badge badge-warning text-xs">⚠ ต่ำ</span>
                      )}
                      {medStatus === 'CRITICAL' && (
                        <span className="badge badge-critical text-xs">🔴 วิกฤต</span>
                      )}
                      {medStatus === 'OUT_OF_STOCK' && (
                        <span className="badge badge-danger text-xs">✕ หมด</span>
                      )}
                    </div>

                    {/* Stock Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-600">
                          สต็อก: {medStock} / {med.initialStock}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.round((medStock / med.initialStock) * 100)}%
                        </span>
                      </div>
                      <div className="stock-bar">
                        <div
                          className={`stock-bar-fill ${(medStock / med.initialStock) * 100 >= 75
                            ? ''
                            : (medStock / med.initialStock) * 100 >= 50
                              ? 'low'
                              : 'critical'
                            }`}
                          style={{
                            width: `${Math.min(100, (medStock / med.initialStock) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expanded Detail Modal - แบบรูป */}
      {expandedMedicine && currentMed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 sticky top-0 z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold">{currentMed.medicineName}</h2>
                  <p className="text-sm text-purple-100 mt-1">
                    {patient.firstName} {patient.lastName} • ห้อง {patient.room}
                  </p>
                </div>
                <button
                  onClick={() => setExpandedMedicine(null)}
                  className="text-white hover:bg-purple-700 p-1 rounded"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              {/* Schedule Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 font-bold">📋</span>
                  </div>
                  <h3 className="font-bold text-gray-900">ระยะเวลาจำนวนยา</h3>
                </div>

                <div className="space-y-3">
                  {/* วันที่เริ่มใช้ - สิ้นสุด */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600">วันที่เริ่มใช้:</label>
                      <input
                        type="date"
                        value={
                          scheduleData[currentMed.id]?.startDate ||
                          (currentMed.startDate ? new Date(currentMed.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
                        }
                        onChange={(e) => handleStartDateChange(currentMed.id, e.target.value)}
                        className="mt-1 w-full p-3 border border-gray-300 rounded bg-white text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">วันที่สิ้นสุด:</label>
                      <input
                        type="date"
                        value={
                          scheduleData[currentMed.id]?.endDate ||
                          (currentMed.endDate ? new Date(currentMed.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
                        }
                        onChange={(e) => handleEndDateChange(currentMed.id, e.target.value)}
                        className="mt-1 w-full p-3 border border-gray-300 rounded bg-white text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* จำนวนวัน */}
                  <div>
                    <label className="text-xs font-medium text-gray-600">จำนวนวัน:</label>
                    <div className="mt-2 bg-green-50 border border-green-200 rounded p-4 flex items-center justify-center">
                      <span className="text-3xl font-bold text-green-600">
                        {scheduleData[currentMed.id]?.duration || currentMed.duration || 1}
                      </span>
                      <span className="text-green-600 ml-2">วัน</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ข้อกำหนด & หมายเหตุ */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-bold text-gray-900">ชื่อเภสัชกร *</label>
                  <input
                    type="text"
                    placeholder="กรอกชื่อเภสัชกรผู้จ่ายยา"
                    value={currentMed.prescriptionDetails || ''}
                    readOnly
                    className="mt-2 w-full p-3 border border-gray-200 rounded bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-900">หมายเหตุ</label>
                  <textarea
                    placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                    value={notes[currentMed.id] !== undefined ? notes[currentMed.id] : (currentMed.notes || '')}
                    onChange={(e) => handleNotesChange(currentMed.id, e.target.value)}
                    className="mt-2 w-full p-3 border border-gray-300 rounded bg-white min-h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* ยาที่ ต้องตรวจสอบ */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">💊</span>
                  <h3 className="font-bold text-gray-900">รายการยา (คำนวณอัติโนมัติตามระยะเวลา)</h3>
                </div>

                <div className="space-y-2">
                  <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                    <div className="flex items-start gap-2">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={checkedMedicines[currentMed.id] || false}
                        onChange={() => handleCheckboxChange(currentMed.id)}
                        className="mt-1 w-5 h-5 cursor-pointer"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-gray-900">
                          {currentMed.medicineName}
                        </h4>
                       
                        <p className="text-xs text-gray-600">
                          {currentMed.dose} {currentMed.unit}
                        </p>
                        <p className="text-xs text-gray-600">
                          OD • เช้าเย็น
                        </p>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded mt-2">
                          1 เม็ด × 1 ครั้ง/วัน × {scheduleData[currentMed.id]?.duration || currentMed.duration || 1} วัน
                        </span>

                        {/* Show only when checkbox is checked */}
                        {checkedMedicines[currentMed.id] && (
                          <div className="mt-3 space-y-2">
                            {/* Quantity input */}
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-medium text-gray-600">จำนวนยา:</label>
                              <input
                                type="number"
                                min="1"
                                value={medicineQuantities[currentMed.id] || 1}
                                onChange={(e) => handleQuantityChange(currentMed.id, e.target.value)}
                                className="w-16 p-2 border border-gray-300 rounded text-xs text-center"
                              />
                              <span className="text-xs text-gray-600">เม็ด</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              {getTransactionHistory(currentMed.id).length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={18} className="text-gray-600" />
                    <h3 className="font-bold text-gray-900">ประวัติการจ่ายยา</h3>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {getTransactionHistory(currentMed.id).slice(-5).reverse().map((trans) => (
                      <div
                        key={trans.id}
                        className="p-2 bg-gray-50 border border-gray-200 rounded text-xs"
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {trans.transactionType === 'DISPENSE' ? '➜ ปล่อยยา' : '↩ คืนยา'}
                          </span>
                          <span className="text-gray-600">
                            {new Date(trans.transactionTime).toLocaleTimeString('th-TH')}
                          </span>
                        </div>
                        <div>จำนวน: {trans.quantity}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="border-t bg-gray-50 p-4 flex gap-3 sticky bottom-0 z-10">
              <button
                onClick={() => setExpandedMedicine(null)}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  onSelectMedicine(currentMed.id);
                  onDispense();
                  setExpandedMedicine(null);
                }}
                className="flex-1 py-3 px-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} /> จ่ายยา
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Button - STICKY */}
      <button
        onClick={onAddMedicine}
        className="btn btn-primary w-full flex items-center justify-center gap-2 sticky bottom-0"
      >
        <Plus size={18} /> เพิ่มยา
      </button>
    </div>
  );
}

export default MedicationDetail;