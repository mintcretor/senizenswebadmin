import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

function ReturnModal({ medicine, onClose, onReturn }) {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const reasonOptions = [
    { value: 'Unused', label: 'ยังไม่ได้ใช้' },
    { value: 'PatientRequest', label: 'ผู้ป่วยขอคืน' },
    { value: 'Expiry', label: 'หมดอายุ' },
    { value: 'Damage', label: 'เสียหาย' },
    { value: 'Other', label: 'อื่น ๆ' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!quantity || quantity <= 0) {
      setError('โปรดระบุจำนวนที่ถูกต้อง');
      return;
    }

    if (!reason) {
      setError('โปรดระบุเหตุผลการรับคืน');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onReturn(quantity, reason, notes);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            🔄 รับยาคืน
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* MEDICINE INFO */}
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm font-medium text-gray-900">ยา: {medicine.doctorOrder}</p>
            <p className="text-xs text-gray-600 mt-1">หน่วยนับ: {medicine.unit}</p>
          </div>

          {/* MEDICINE STATUS */}
          <div className="p-3 bg-purple-50 rounded border border-purple-200">
            <p className="text-sm text-gray-700">
              จำหน่ายไปทั้งหมด: <span className="font-bold text-purple-900">{medicine.initialStock} {medicine.unit}</span>
            </p>
          </div>

          {/* QUANTITY INPUT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              จำนวนรับคืน *
            </label>
            <input 
              type="number"
              min="1"
              max={medicine.initialStock}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="เช่น 2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
            <p className="text-xs text-gray-500 mt-1">สูงสุด {medicine.initialStock} {medicine.unit}</p>
          </div>

          {/* REASON SELECT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เหตุผล *
            </label>
            <select 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            >
              <option value="">-- เลือกเหตุผล --</option>
              {reasonOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* NOTES */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมายเหตุเพิ่มเติม (ไม่บังคับ)
            </label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เพิ่มเติมข้อมูล..."
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
            />
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded flex gap-2">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
            >
              ยกเลิก
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังบันทึก...' : 'ยืนยัน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReturnModal;
