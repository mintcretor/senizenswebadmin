import React, { useState, useEffect } from 'react';
import { Plus, X, Clock, CheckCircle, Edit, Trash2, Save } from 'lucide-react';

/**
 * MedicationDetail Component - Display Card Style with Inline Edit
 * แสดงข้อมูลยาแบบ display card (read-only)
 * มี edit/delete icons ที่ top right
 * แก้ไขเลย ในตัว card เอง
 */

// Mapping for frequency descriptions
const frequencyMap = {
  'od': 'OD - วันละ 1 ครั้ง (omni die)',
  'qd': 'QD - วันละ 1 ครั้ง (quaque die)',
  'bid': 'bid - วันละ 2 ครั้ง (Bis in die)',
  'tid': 'tid - วันละ 3 ครั้ง (Ter in die)',
  'qid': 'qid - วันละ 4 ครั้ง (Quater in die)',
  'q2h': 'q2h - ทุก 2 ชั่วโมง (quaque 2 hora)',
  'q3h': 'q3h - ทุก 3 ชั่วโมง (quaque 3 hora)',
  'q4h': 'q4h - ทุก 4 ชั่วโมง (quaque 4 hora)',
  'q6h': 'q6h - ทุก 6 ชั่วโมง (quaque 6 hora)',
  'q8h': 'q8h - ทุก 8 ชั่วโมง (quaque 8 hora)',
  'q12h': 'q12h - ทุก 12 ชั่วโมง (quaque 12 hora)',
  'q24h': 'q24h - วันละครั้ง (quaque 24 hora)',
  'q48h': 'q48h - ทุก 48 ชั่วโมง (quaque 48 hora)',
  'q72h': 'q72h - ทุก 72 ชั่วโมง (quaque 72 hora)',
  'prn': 'prn - เมื่อจำเป็น (Pro re nata)',
  'stat': 'stat - ทันที (Statim)'
};

// Mapping for timing descriptions
const timingMap = {
  'ac': 'ac - ก่อนอาหาร (Ante cibum)',
  'pc': 'pc - หลังอาหาร (Post cibum)',
  'hs': 'hs - ก่อนนอน (Hora somni)',
  'prn': 'prn - เมื่อต้องการ (Pro re nata)',
  'stat': 'stat - ทันที (Statim)',
  'sos': 'S.O.S - เมื่อจำเป็น (Si opus sit)'
};

// Mapping for route descriptions
const routeMap = {
  'po': 'po - รับประทาน (Per oral)',
  'inj': 'Inj - ฉีด (Injection)',
  'iv': 'IV - ฉีดเข้าหลอดเลือดดำ',
  'im': 'IM - ฉีดเข้ากล้ามเนื้อ',
  'sc': 'SC - ฉีดใต้ผิวหนัง',
  'sl': 'sl - อมใต้ลิ้น (Sublingual)',
  'od': 'OD - ตาขวา (Occulo dextro)',
  'os': 'OS - ตาซ้าย (Occulo sinistro)',
  'apply-le': 'Apply LE - ทาตาซ้าย',
  'apply-re': 'Apply RE - ทาตาขวา'
};

function MedicationDetail({
  patient = null,
  medications = [],
  onDispense = () => { },
  onReturn = () => { },
  onAddMedicine = () => { },
  onSelectMedicine = () => { },
  onEditMedicine = () => { },
  onDeleteMedicine = () => { },
  onSaveMedicine = () => { },
  selectedMedicine = null,
  calculateStock = () => 0,
  getTransactionHistory = () => [],
  getStockStatus = () => 'OK'
}) {
  const [expandedMedicine, setExpandedMedicine] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);

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

  const currentMed = medications.find(m => m.id === expandedMedicine);
  const currentStock = expandedMedicine ? calculateStock(expandedMedicine) : 0;
  const status = expandedMedicine ? getStockStatus(currentStock, currentMed?.initialStock) : 'OK';

  // Helper function to get display text
  const getFrequencyDisplay = (code) => frequencyMap[code?.toLowerCase()] || code || '-';
  const getTimingDisplay = (code) => timingMap[code?.toLowerCase()] || code || '-';
  const getRouteDisplay = (code) => routeMap[code?.toLowerCase()] || code || '-';

  // Handle edit button - enable edit mode
  const handleEditClick = () => {
    setEditMode(true);
    setEditData({ ...currentMed });
  };

  // Handle save button
  const handleSave = () => {
    console.log('Saving medicine:', editData);
    onSaveMedicine(editData);
    setEditMode(false);
    setEditData(null);
  };

  // Handle cancel button
  const handleCancel = () => {
    setEditMode(false);
    setEditData(null);
  };

  // Handle edit field change
  const handleEditChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle delete medicine
  const handleDeleteMedicine = (medId) => {
    if (window.confirm('ต้องการลบยานี้ใช่หรือไม่?')) {
      onDeleteMedicine(medId);
      setExpandedMedicine(null);
    }
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
                          {med.medication_name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          {med.dosage} {med.unit} | {med.medicine_code}
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

      {/* Expanded Detail Modal - Display Card Style with Inline Edit */}
      {expandedMedicine && currentMed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
            {/* Header with Edit/Delete Icons */}
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl">
                      💊
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">{currentMed.medication_name}</h2>
                      <p className="text-sm text-orange-100">
                        {patient.firstName} {patient.lastName}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Edit & Delete Icons */}
                {!editMode && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick();
                      }}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                      title="แก้ไข"
                    >
                      <Edit size={20} className="text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMedicine(currentMed.id);
                      }}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                      title="ลบ"
                    >
                      <Trash2 size={20} className="text-white" />
                    </button>
                    <button
                      onClick={() => setExpandedMedicine(null)}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                    >
                      <X size={20} className="text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {editMode && editData ? (
                // EDIT MODE - Form fields
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">ชื่อยา:</label>
                    <input
                      type="text"
                      value={editData.medication_name || ''}
                      onChange={(e) => handleEditChange('medication_name', e.target.value)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">ชื่อสามัญ:</label>
                    <input
                      type="text"
                      value={editData.generic_name || ''}
                      onChange={(e) => handleEditChange('generic_name', e.target.value)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">ชื่อทางการค้า:</label>
                    <input
                      type="text"
                      value={editData.trade_name || ''}
                      onChange={(e) => handleEditChange('trade_name', e.target.value)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">ขนาด:</label>
                    <input
                      type="text"
                      value={editData.dosage || ''}
                      onChange={(e) => handleEditChange('dosage', e.target.value)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">เส้นทาง:</label>
                    <select
                      value={editData.route || ''}
                      onChange={(e) => handleEditChange('route', e.target.value)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="">เลือก...</option>
                      <option value="po">po - รับประทาน</option>
                      <option value="inj">Inj - ฉีด</option>
                      <option value="iv">IV - เข้าหลอดเลือด</option>
                      <option value="im">IM - กล้ามเนื้อ</option>
                      <option value="sc">SC - ใต้ผิว</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">วิธีใช้:</label>
                    <input
                      type="text"
                      value={editData.dosage_instruction || ''}
                      onChange={(e) => handleEditChange('dosage_instruction', e.target.value)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">ความถี่:</label>
                    <select
                      value={editData.frequency || ''}
                      onChange={(e) => handleEditChange('frequency', e.target.value)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="">เลือก...</option>
                      <option value="od">OD - วันละครั้ง</option>
                      <option value="bid">bid - วันละ 2 ครั้ง</option>
                      <option value="tid">tid - วันละ 3 ครั้ง</option>
                      <option value="qid">qid - วันละ 4 ครั้ง</option>
                      <option value="prn">prn - เมื่อจำเป็น</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">เวลา:</label>
                    <select
                      value={editData.timing || ''}
                      onChange={(e) => handleEditChange('timing', e.target.value)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="">เลือก...</option>
                      <option value="ac">ac - ก่อนอาหาร</option>
                      <option value="pc">pc - หลังอาหาร</option>
                      <option value="hs">hs - ก่อนนอน</option>
                      <option value="prn">prn - เมื่อต้องการ</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">จำนวน:</label>
                    <input
                      type="number"
                      value={editData.quantity || ''}
                      onChange={(e) => handleEditChange('quantity', e.target.value)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">วันหมดอายุ:</label>
                    <input
                      type="text"
                      value={editData.expiry_date || ''}
                      onChange={(e) => handleEditChange('expiry_date', e.target.value)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Lot No:</label>
                    <input
                      type="text"
                      value={editData.lot_number || ''}
                      onChange={(e) => handleEditChange('lot_number', e.target.value)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">คำแนะนำพิเศษ:</label>
                    <textarea
                      value={editData.special_instruction || ''}
                      onChange={(e) => handleEditChange('special_instruction', e.target.value)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded text-sm resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              ) : (
                // DISPLAY MODE - Read-only info
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <span className="text-xl">💉</span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">ชื่อสามัญ:</p>
                      <p className="font-medium text-gray-900">{currentMed.generic_name || currentMed.medication_name}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-xl">🏷️</span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">ชื่อทางการค้า:</p>
                      <p className="font-medium text-gray-900">{currentMed.trade_name || '-'}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-xl">💊</span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">เส้นทางการให้ยา:</p>
                      <p className="font-medium text-gray-900">{getRouteDisplay(currentMed.route)}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-xl">📋</span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">วิธีใช้:</p>
                      <p className="font-medium text-gray-900">{currentMed.dosage_instruction || '-'}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-xl">⏰</span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">ความถี่:</p>
                      <p className="font-medium text-gray-900">{getFrequencyDisplay(currentMed.frequency)}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-xl">🕐</span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">เวลา:</p>
                      <p className="font-medium text-gray-900">{getTimingDisplay(currentMed.timing)}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-xl">📦</span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">จำนวน:</p>
                      <p className="font-medium text-gray-900">{currentMed.quantity || '-'}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-xl">📅</span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">วันหมดอายุ:</p>
                      <p className="font-medium text-gray-900">{currentMed.expiry_date || '-'}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-xl">🔢</span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">Lot No:</p>
                      <p className="font-medium text-gray-900">{currentMed.lot_number || '-'}</p>
                    </div>
                  </div>

                  {currentMed.special_instruction && (
                    <div className="flex gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <span className="text-xl">⚠️</span>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">คำแนะนำพิเศษ:</p>
                        <p className="font-medium text-gray-900">{currentMed.special_instruction}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Badge */}
              {currentMed.status && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 mb-2">สถานะการใช้ยา:</p>
                  <div className="flex gap-2">
                    {currentMed.status === 'continue_same' && (
                      <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium">✓ ใช้ต่อขนาดเดิม</span>
                    )}
                    {currentMed.status === 'continue_different' && (
                      <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium">⚡ ใช้ต่อปรับขนาด</span>
                    )}
                    {currentMed.status === 'temporarily_stop' && (
                      <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-xs font-medium">⏸ พักใช้ยา</span>
                    )}
                    {currentMed.status === 'discontinued' && (
                      <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-medium">✕ ไม่ใช้ต่อ</span>
                    )}
                  </div>
                </div>
              )}

              {/* Transaction History */}
              {getTransactionHistory(currentMed.id).length > 0 && (
                <div className="border-t pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-gray-600" />
                    <h3 className="font-bold text-sm text-gray-900">ประวัติการจ่ายยา</h3>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {getTransactionHistory(currentMed.id).slice(-5).reverse().map((trans) => (
                      <div key={trans.id} className="p-2 bg-gray-50 border border-gray-200 rounded text-xs">
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

            {/* Footer - Save/Cancel buttons (show only in edit mode) */}
            {editMode && (
              <div className="border-t bg-gray-50 p-4 flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2 px-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition flex items-center justify-center gap-2 text-sm"
                >
                  <Save size={16} /> บันทึก
                </button>
              </div>
            )}
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
