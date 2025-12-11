import React, { useState } from 'react';
import { X, Search } from 'lucide-react';

// Mock data for autocomplete
const mockMedicineList = [
  { id: 1, name: 'Paracetamol', dose: '500mg', unit: 'เม็ด' },
  { id: 2, name: 'Amoxicillin', dose: '250mg', unit: 'แคปซูล' },
  { id: 3, name: 'Ibuprofen', dose: '400mg', unit: 'เม็ด' },
  { id: 4, name: 'Omeprazole', dose: '20mg', unit: 'แคปซูล' },
  { id: 5, name: 'Metformin', dose: '500mg', unit: 'เม็ด' },
  { id: 6, name: 'Lisinopril', dose: '5mg', unit: 'เม็ด' },
];

function AddMedicineModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    medicineName: '',
    dose: '',
    injectionMethod: '',
    howToUse: '',
    frequency: '',
    note: '',
    stock: '',
    expiry: '',
    warning: '',
    enableAlert: false,
    medicationStatus: 'used-already',
    changeSchedule: false,
    image: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Autocomplete states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredMedicines, setFilteredMedicines] = useState([]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.medicineName.trim()) {
      newErrors.medicineName = 'โปรดระบุชื่อยา';
    }
    if (!formData.dose.trim()) {
      newErrors.dose = 'โปรดระบุขนาดยา';
    }
    if (!formData.howToUse.trim()) {
      newErrors.howToUse = 'โปรดระบุวิธีใช้ยา';
    }
    if (!formData.frequency.trim()) {
      newErrors.frequency = 'โปรดระบุความถี่';
    }
    if (!formData.medicationStatus) {
      newErrors.medicationStatus = 'โปรดเลือกสถานะการใช้ยา';
    }

    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      onSave(formData);
      setLoading(false);
    }, 500);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Autocomplete handler
  const handleMedicineNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, medicineName: value }));

    if (errors.medicineName) {
      setErrors(prev => ({ ...prev, medicineName: '' }));
    }

    // Filter medicines based on input
    if (value.trim()) {
      const filtered = mockMedicineList.filter(med =>
        med.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredMedicines(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredMedicines([]);
      setShowSuggestions(false);
    }
  };

  // Select medicine from suggestions
  const handleSelectMedicine = (medicine) => {
    setFormData(prev => ({
      ...prev,
      medicineName: medicine.name,
      dose: medicine.dose
    }));
    setShowSuggestions(false);
    setFilteredMedicines([]);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full my-8">
        {/* HEADER */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 bg-blue-500">
          <div>
            <h3 className="font-bold text-lg text-white">
              เพิ่มรายการยา
            </h3>
            <p className="text-sm text-blue-100 mt-1">กรอกข้อมูลยาให้ครบถ้วน</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* IMAGE UPLOAD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📷 รูปของยา
            </label>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-6xl mb-2">📷</div>
                  <p className="text-blue-600 font-medium mb-1">ถ่ายรูป / เลือกรูปซองยา</p>
                  <p className="text-gray-500 text-sm">ระบบจะอ่านข้อมูลอัตโนมัติ</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              {!imagePreview && (
                <label
                  htmlFor="image-upload"
                  className="mt-3 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition"
                >
                  เลือกรูปภาพ
                </label>
              )}
            </div>
          </div>

          {/* MEDICINE NAME WITH AUTOCOMPLETE */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อยา(ชื่อทั่วไป) *
            </label>
            <div className="relative">
              <input
                type="text"
                name="medicineName"
                value={formData.medicineName}
                onChange={handleMedicineNameChange}
                onFocus={() => {
                  if (formData.medicineName.trim()) {
                    const filtered = mockMedicineList.filter(med =>
                      med.name.toLowerCase().includes(formData.medicineName.toLowerCase())
                    );
                    setFilteredMedicines(filtered);
                    setShowSuggestions(true);
                  }
                }}
                placeholder="พิมพ์ชื่อยาเพื่อค้นหา หรือ กรอกชื่อยาใหม่"
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition ${errors.medicineName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>


            {/* AUTOCOMPLETE DROPDOWN */}
            {showSuggestions && filteredMedicines.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredMedicines.map((medicine) => (
                  <button
                    key={medicine.id}
                    type="button"
                    onClick={() => handleSelectMedicine(medicine)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 transition border-b border-gray-100 last:border-0"
                  >
                    <div className="font-medium text-gray-900">{medicine.name}</div>
                    <div className="text-sm text-gray-600">{medicine.dose} • {medicine.unit}</div>
                  </button>
                ))}
              </div>
            )}

            {errors.medicineName && <p className="text-xs text-red-600 mt-1">{errors.medicineName}</p>}
          </div>

          {/* Generic name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อสามัญ(Generic name) *
            </label>
            <input
              type="text"
              name="genericName"
              value={formData.genericName}
              onChange={handleChange}
              placeholder="เช่น Chlorpheniramine , Paracetamol "
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${errors.dose ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
            />
            {errors.dose && <p className="text-xs text-red-600 mt-1">{errors.dose}</p>}
          </div>

          {/* Generic name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อทางการค้า(Trade name) *
            </label>
            <input
              type="text"
              name="Trade"
              value={formData.Trade}
              onChange={handleChange}
              placeholder="เช่น Histata, Tylenol, Sara"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${errors.dose ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
            />
            {errors.dose && <p className="text-xs text-red-600 mt-1">{errors.dose}</p>}
          </div>

          {/* DOSE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ขนาดยา *
            </label>
            <input
              type="text"
              name="dose"
              value={formData.dose}
              onChange={handleChange}
              placeholder="500 mg"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${errors.dose ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
            />
            {errors.dose && <p className="text-xs text-red-600 mt-1">{errors.dose}</p>}
          </div>

          {/* STOCK AND EXPIRY */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันหมดอายุ
              </label>
              <input
                type="text"
                name="timeout"
                value={formData.timeout}
                onChange={handleChange}
                placeholder="เช่น 12/2026"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lot No.
              </label>
              <input
                type="text"
                name="LotNo"
                value={formData.Lotno}
                onChange={handleChange}
                placeholder="เช่น ABC123"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>


          {/* INJECTION METHOD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💉 เส้นทางการให้ยา
            </label>
            <select
              name="injectionMethod"
              value={formData.injectionMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">เลือกวิธีใช้...</option>
              <option value="po">po - รับประทาน (Per oral)</option>
              <option value="inj">Inj - ฉีด (Injection)</option>
              <option value="iv">IV - ฉีดเข้าหลอดเลือดดำ</option>
              <option value="im">IM - ฉีดเข้ากล้ามเนื้อ</option>
              <option value="sc">SC - ฉีดใต้ผิวหนัง</option>
              <option value="sl">sl - อมใต้ลิ้น (Sublingual)</option>
              <option value="od">OD - ตาขวา (Occulo dextro)</option>
              <option value="os">OS - ตาซ้าย (Occulo sinistro)</option>
              <option value="apply-le">Apply LE - ทาตาซ้าย</option>
              <option value="apply-re">Apply RE - ทาตาขวา</option>
            </select>
          </div>

          {/* HOW TO USE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💊 วิธีใช้ยา *
            </label>
            <input
              type="text"
              name="howToUse"
              value={formData.howToUse}
              onChange={handleChange}
              placeholder="เช่น รับประทานหลังอาหาร 1 เม็ด"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${errors.howToUse ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
            />
            {errors.howToUse && <p className="text-xs text-red-600 mt-1">{errors.howToUse}</p>}
          </div>

          {/* FREQUENCY */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📋 ความถี่ *
            </label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${errors.frequency ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
            >
              <option value="">เลือกความถี่...</option>
              <option value="od">OD - วันละครั้ง (omni die)</option>
              <option value="qd">QD - วันละครั้ง (quaque die)</option>
              <option value="bid">bid - วันละ 2 ครั้ง (Bis in die)</option>
              <option value="tid">tid - วันละ 3 ครั้ง (Ter in die)</option>
              <option value="qid">qid - วันละ 4 ครั้ง (Quater in die)</option>
              <option value="q2h">q2h - ทุก 2 ชั่วโมง (quaque 2 hora)</option>
              <option value="q3h">q3h - ทุก 3 ชั่วโมง (quaque 3 hora)</option>
              <option value="q4h">q4h - ทุก 4 ชั่วโมง (quaque 4 hora)</option>
              <option value="prn">prn - เมื่อจำเป็น (Pro re nata)</option>
              <option value="stat">stat - ทันที (Statim)</option>
            </select>
            {errors.frequency && <p className="text-xs text-red-600 mt-1">{errors.frequency}</p>}
          </div>

          {/* NOTE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🗒️ เวลา
            </label>
            <select
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">เลือก...</option>
              <option value="ac">ac - ก่อนอาหาร (Ante cibum)</option>
              <option value="pc">pc - หลังอาหาร (Post cibum)</option>
              <option value="hs">hs - ก่อนนอน (Hora somni)</option>
              <option value="prn">prn - เมื่อต้องการ (Pro re nata)</option>
              <option value="stat">stat - ทันที (Statim)</option>
              <option value="sos">S.O.S - เมื่อจำเป็น (Si opus sit)</option>
            </select>
          </div>

          {/* STOCK AND EXPIRY */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                จำนวนยา
              </label>
              <input
                type="text"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="จำนวน"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                มื้อสุดท้าย
              </label>
              <input
                type="text"
                name="expiry"
                value={formData.expiry}
                onChange={handleChange}
                placeholder="เช้า/เที่ยง/เย็น"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* WARNING */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⚠️ คำแนะนำพิเศษ
            </label>
            <textarea
              name="warning"
              value={formData.warning}
              onChange={handleChange}
              placeholder="เช่น ห้ามรับประทานกับนม"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>

          {/* ENABLE ALERT */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="enableAlert"
              name="enableAlert"
              checked={formData.enableAlert}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="enableAlert" className="flex-1 cursor-pointer">
              <p className="font-medium text-gray-900">ยารับจากภายนอก</p>
              <p className="text-sm text-gray-600">ติ๊กถ้ายาจากโรงพยาบาลอื่น</p>
            </label>
          </div>

          {/* MEDICATION STATUS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              สถานะการใช้ยา *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, medicationStatus: 'used-already' }))}
                className={`p-4 border-2 rounded-lg transition ${formData.medicationStatus === 'used-already'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white hover:border-green-300'
                  }`}
              >
                <div className="text-3xl mb-2">✓</div>
                <p className="font-medium text-gray-900 text-sm">ใช้ต่อขนาดเดิม</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, medicationStatus: 'continue-different' }))}
                className={`p-4 border-2 rounded-lg transition ${formData.medicationStatus === 'continue-different'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-300 bg-white hover:border-yellow-300'
                  }`}
              >
                <div className="text-3xl mb-2">⚡</div>
                <p className="font-medium text-gray-900 text-sm">ใช้ต่อปรับขนาด</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, medicationStatus: 'temporarily-stop' }))}
                className={`p-4 border-2 rounded-lg transition ${formData.medicationStatus === 'temporarily-stop'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 bg-white hover:border-orange-300'
                  }`}
              >
                <div className="text-3xl mb-2">⏸</div>
                <p className="font-medium text-gray-900 text-sm">พักใช้ยาไว้</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, medicationStatus: 'not-use' }))}
                className={`p-4 border-2 rounded-lg transition ${formData.medicationStatus === 'not-use'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-white hover:border-red-300'
                  }`}
              >
                <div className="text-3xl mb-2">✕</div>
                <p className="font-medium text-gray-900 text-sm">ไม่ใช้ต่อ</p>
              </button>
            </div>
            {errors.medicationStatus && <p className="text-xs text-red-600 mt-2">{errors.medicationStatus}</p>}
          </div>

          {/* CHANGE SCHEDULE */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="changeSchedule"
              name="changeSchedule"
              checked={formData.changeSchedule}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="changeSchedule" className="flex-1 cursor-pointer">
              <p className="font-medium text-gray-900">มีการเปลี่ยนแปลงการใช้ยา</p>
              <p className="text-sm text-gray-600">ติ๊กถ้ามีการเปลี่ยนแปลง</p>
            </label>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังบันทึก...' : 'เพิ่มยา'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddMedicineModal;