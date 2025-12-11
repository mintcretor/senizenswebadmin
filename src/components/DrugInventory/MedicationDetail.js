import React, { useState } from 'react';
import { Plus, Trash2, RefreshCw, Clock } from 'lucide-react';

/**
 * MedicationDetail Component - Mobile Optimized
 * แสดงรายละเอียดยาของผู้ป่วยที่เลือก
 */
function MedicationDetail({
  patient = null,
  medications = [],
  onDispense = () => {},
  onReturn = () => {},
  onAddMedicine = () => {},
  onSelectMedicine = () => {},
  selectedMedicine = null,
  calculateStock = () => 0,
  getTransactionHistory = () => [],
  getStockStatus = () => 'OK'
}) {
  const [expandedMedicine, setExpandedMedicine] = useState(null);

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

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Patient Header - STICKY */}
      <div className="card sticky top-0 z-10">
        <div className="card-header">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {patient.firstName} {patient.lastName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              🏥 {patient.ward} - ห้อง {patient.room} | อายุ {patient.age} ปี
            </p>
          </div>
        </div>
      </div>

      {/* Add Medicine Button - STICKY */}
      <button
        onClick={onAddMedicine}
        className="btn btn-primary w-full flex items-center justify-center gap-2 sticky top-[100px] z-9"
      >
        <Plus size={18} /> เพิ่มยา
      </button>

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
            const currentStock = calculateStock(med.id);
            const status = getStockStatus(currentStock, med.initialStock);
            const transactions = getTransactionHistory(med.id);
            const isExpanded = expandedMedicine === med.id;

            return (
              <div key={med.id} className="card overflow-hidden">
                {/* Medicine Header */}
                <div
                  onClick={() => setExpandedMedicine(isExpanded ? null : med.id)}
                  className="card-body cursor-pointer hover:bg-gray-50 p-3 sm:p-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate">
                        {med.medicineName}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                        {med.dose} {med.unit} | รหัส: {med.medicineCode}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {status === 'OK' && (
                        <span className="badge badge-success text-xs">✓ ดี</span>
                      )}
                      {status === 'LOW' && (
                        <span className="badge badge-warning text-xs">⚠ ต่ำ</span>
                      )}
                      {status === 'CRITICAL' && (
                        <span className="badge badge-critical text-xs">🔴 วิกฤต</span>
                      )}
                      {status === 'OUT_OF_STOCK' && (
                        <span className="badge badge-danger text-xs">✕ หมด</span>
                      )}
                    </div>
                  </div>

                  {/* Stock Indicator */}
                  <div className="mt-2 sm:mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-600">
                        สต็อก: {currentStock} / {med.initialStock}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round((currentStock / med.initialStock) * 100)}%
                      </span>
                    </div>
                    <div className="stock-bar">
                      <div
                        className={`stock-bar-fill ${
                          (currentStock / med.initialStock) * 100 >= 75
                            ? ''
                            : (currentStock / med.initialStock) * 100 >= 50
                            ? 'low'
                            : 'critical'
                        }`}
                        style={{
                          width: `${Math.min(100, (currentStock / med.initialStock) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    {/* Medicine Details */}
                    <div className="p-3 sm:p-4 space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-600">ชื่อผู้ผลิต</p>
                          <p className="font-medium text-gray-900">{med.manufacturer}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">เลขแบตช์</p>
                          <p className="font-medium text-gray-900">{med.batchNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">วันหมดอายุ</p>
                          <p className="font-medium text-gray-900">
                            {new Date(med.expiryDate).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">เก็บที่</p>
                          <p className="font-medium text-gray-900">{med.storageLocation}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="border-t border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => {
                          onSelectMedicine(med.id);
                          onDispense();
                        }}
                        className="btn btn-success flex items-center justify-center gap-1 text-xs sm:text-sm flex-1"
                      >
                        <RefreshCw size={16} /> ปล่อยยา
                      </button>
                      <button
                        onClick={() => {
                          onSelectMedicine(med.id);
                          onReturn();
                        }}
                        className="btn btn-secondary flex items-center justify-center gap-1 text-xs sm:text-sm flex-1"
                      >
                        <Trash2 size={16} /> คืนยา
                      </button>
                    </div>

                    {/* Transaction History */}
                    {transactions.length > 0 && (
                      <div className="border-t border-gray-200 p-3 sm:p-4">
                        <h4 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-1">
                          <Clock size={16} /> ประวัติการจ่ายยา
                        </h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {transactions.slice(-5).reverse().map((trans) => (
                            <div
                              key={trans.id}
                              className="text-xs bg-white p-2 rounded border border-gray-200"
                            >
                              <div className="flex justify-between items-start">
                                <span className="font-medium">
                                  {trans.transactionType === 'DISPENSE' ? '➜' : '↩'}{' '}
                                  {trans.transactionType === 'DISPENSE'
                                    ? 'ปล่อยยา'
                                    : 'คืนยา'}
                                </span>
                                <span className="text-gray-600">
                                  {new Date(trans.transactionTime).toLocaleTimeString('th-TH')}
                                </span>
                              </div>
                              <div className="text-gray-600 mt-1">
                                จำนวน: <span className="font-medium">{trans.quantity}</span>
                              </div>
                              {trans.notes && (
                                <div className="text-gray-500 mt-1 italic">"{trans.notes}"</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}

export default MedicationDetail;