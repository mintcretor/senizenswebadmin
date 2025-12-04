import React from 'react';
import { Pill, Plus, Download, RotateCw } from 'lucide-react';

function MedicationDetail({
  patient,
  medications,
  onDispense,
  onReturn,
  onAddMedicine,
  onSelectMedicine,
  selectedMedicine,
  calculateStock,
  getTransactionHistory,
  getStockStatus
}) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'OK': 
        return { bg: 'bg-green-100', text: 'text-green-800', icon: '🟢' };
      case 'LOW': 
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🟡' };
      case 'CRITICAL': 
        return { bg: 'bg-red-100', text: 'text-red-800', icon: '🔴' };
      default: 
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '⚫' };
    }
  };

  if (!patient) {
    return (
      <div className="w-2/3 bg-white rounded-lg shadow-sm p-12 text-center">
        <Pill size={48} className="mx-auto mb-4 opacity-20" />
        <p className="text-lg text-gray-500">เลือกผู้ป่วยเพื่อแสดงข้อมูลยา</p>
      </div>
    );
  }

  return (
    <div className="w-2/3 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
      {/* PATIENT INFO HEADER */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              👤 {patient.firstName} {patient.lastName}
            </h3>
            <p className="text-gray-700 mt-2">
              🏠 ห้อง {patient.room} | 🏢 Ward {patient.ward} | 👶 Age {patient.age} | 📋 {patient.patientId}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              📅 เข้ารับการรักษา: {new Date(patient.admitDate).toLocaleDateString('th-TH')}
            </p>
          </div>
          <button className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 font-medium transition">
            📋 พิมพ์
          </button>
        </div>
      </div>

      {/* MEDICATIONS LIST */}
      <div className="overflow-y-auto flex-1 p-6">
        <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Pill size={20} className="text-blue-600" />
          รายการยา
        </h4>

        {medications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Pill size={40} className="mx-auto mb-2 opacity-20" />
            <p>ยังไม่มีรายการยา</p>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map(med => {
              const currentStock = calculateStock(med.id);
              const status = getStockStatus(currentStock, med.initialStock);
              const statusColor = getStatusColor(status);
              const history = getTransactionHistory(med.id);

              return (
                <div
                  key={med.id}
                  onClick={() => onSelectMedicine(med.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    selectedMedicine === med.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  {/* MEDICINE NAME & STATUS */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{med.doctorOrder}</p>
                      <p className="text-sm text-gray-600">
                        ยา: {med.medicineName || 'N/A'} {med.dose || ''}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor.bg} ${statusColor.text}`}>
                      {statusColor.icon} {status}
                    </span>
                  </div>

                  {/* STOCK PROGRESS */}
                  <div className="bg-gray-50 p-3 rounded mb-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">จำนวนคงเหลือ:</span>
                      <span className="font-bold text-gray-900">
                        {currentStock} / {med.initialStock} {med.unit || 'หน่วย'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          status === 'OK' ? 'bg-green-500' :
                          status === 'LOW' ? 'bg-yellow-500' :
                          status === 'CRITICAL' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}
                        style={{width: `${Math.min((currentStock/med.initialStock)*100, 100)}%`}}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round((currentStock/med.initialStock)*100)}% คงเหลือ
                    </p>
                  </div>

                  {/* COLLAPSIBLE HISTORY */}
                  <details className="text-sm">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                      📜 ประวัติ ({history.length})
                    </summary>
                    <div className="mt-3 space-y-2 text-gray-700">
                      {history.length === 0 ? (
                        <p className="text-gray-500 text-xs">ไม่มีประวัติการจำหน่าย/รับคืน</p>
                      ) : (
                        history.slice(-5).reverse().map((h, idx) => (
                          <div key={idx} className="p-2 bg-gray-100 rounded text-xs border border-gray-200">
                            <div className="flex justify-between">
                              <span className={h.transactionType === 'DISPENSE' ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                                {h.transactionType === 'DISPENSE' ? '📤 จำหน่าย' : '🔄 รับคืน'}
                              </span>
                              <span className="font-semibold">{h.quantity} {med.unit}</span>
                            </div>
                            <div className="text-gray-600 mt-1">
                              {new Date(h.transactionTime).toLocaleDateString('th-TH', { 
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div className="text-gray-500 mt-1">
                              {h.performedByName}
                              {h.reason && ` (${h.reason})`}
                            </div>
                            {h.notes && <div className="text-gray-600 mt-1">💬 {h.notes}</div>}
                          </div>
                        ))
                      )}
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="p-6 border-t border-gray-200 flex gap-3 bg-gray-50">
        <button 
          onClick={onAddMedicine}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition active:scale-95"
        >
          <Plus size={20} /> เพิ่มยา
        </button>
        <button 
          onClick={onDispense}
          disabled={!selectedMedicine}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📤 จำหน่ายยา
        </button>
        <button 
          onClick={onReturn}
          disabled={!selectedMedicine}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCw size={18} /> รับยาคืน
        </button>
      </div>
    </div>
  );
}

export default MedicationDetail;
