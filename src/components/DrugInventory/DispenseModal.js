import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

function DispenseModal({ medicine, currentStock, onClose, onDispense }) {
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!quantity || quantity <= 0) {
      setError('โปรดระบุจำนวนที่ถูกต้อง');
      return;
    }

    if (parseInt(quantity) > currentStock) {
      setError(`จำนวนสต็อกไม่เพียงพอ (มี ${currentStock} ${medicine.unit} เท่านั้น)`);
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onDispense(quantity, notes);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            📤 จำหน่ายยา
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

          {/* CURRENT STOCK */}
          <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">คงเหลือ:</span>
              <span className="font-bold text-yellow-900">
                {currentStock} {medicine.unit}
              </span>
            </div>
            <div className="mt-2 w-full bg-yellow-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-2 bg-yellow-600 rounded-full"
                style={{width: `${Math.min((currentStock / medicine.initialStock) * 100, 100)}%`}}
              ></div>
            </div>
          </div>

          {/* QUANTITY INPUT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              จำนวนจำหน่าย *
            </label>
            <input 
              type="number"
              min="1"
              max={currentStock}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="เช่น 3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <p className="text-xs text-gray-500 mt-1">สูงสุด {currentStock} {medicine.unit}</p>
          </div>

          {/* TIME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เวลา
            </label>
            <input 
              type="time"
              defaultValue={new Date().toTimeString().slice(0, 5)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* NOTES */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมายเหตุ (ไม่บังคับ)
            </label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น ยาเช้า, ยากลางวัน, ยาเย็น"
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
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
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DispenseModal;
