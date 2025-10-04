import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, Percent, Calendar, Save } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

const PatientPackageSelector = ({ patient, onClose, onSave }) => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [discountType, setDiscountType] = useState('percent'); // 'percent' or 'amount'
  const [discountValue, setDiscountValue] = useState(0);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/packages?active=true`);
      const result = await response.json();
      
      if (result.success) {
        setPackages(result.data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      alert('ไม่สามารถโหลดรายการแพ็คเกจได้');
    } finally {
      setLoading(false);
    }
  };

  const calculateFinalPrice = () => {
    if (!selectedPackage) return 0;
    
    const basePrice = selectedPackage.price;
    let discountAmount = 0;
    
    if (discountType === 'percent') {
      discountAmount = (basePrice * discountValue) / 100;
    } else {
      discountAmount = discountValue;
    }
    
    return Math.max(0, basePrice - discountAmount);
  };

  const handleSave = async () => {
    if (!selectedPackage) {
      alert('กรุณาเลือกแพ็คเกจ');
      return;
    }

    setSaving(true);
    try {
      const data = {
        patient_id: patient.id,
        package_id: selectedPackage.id,
        package_name: selectedPackage.name,
        base_price: selectedPackage.price,
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        final_price: calculateFinalPrice(),
        note: note,
        status: 'active',
        created_at: new Date().toISOString()
      };

      // เรียก API บันทึกแพ็คเกจของผู้ป่วย
      const response = await fetch(`${API_BASE_URL}/patient-packages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        alert('บันทึกแพ็คเกจเรียบร้อยแล้ว');
        onSave && onSave(data);
        onClose();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error saving package:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">เลือกแพ็คเกจสำหรับผู้รับบริการ</h2>
            <p className="text-gray-600 mt-1">
              {patient.prefix}{patient.first_name} {patient.last_name} (HN: {patient.hn})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Package Selection */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              เลือกแพ็คเกจ
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map(pkg => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPackage?.id === pkg.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Package className={`h-6 w-6 mt-1 ${
                      selectedPackage?.id === pkg.id ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          {pkg.duration}
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {pkg.price.toLocaleString()} บาท
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {packages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                ไม่มีแพ็คเกจที่เปิดใช้งาน
              </div>
            )}
          </div>

          {/* Discount Section */}
          {selectedPackage && (
            <>
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  ส่วนลด
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Discount Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ประเภทส่วนลด
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => {
                        setDiscountType(e.target.value);
                        setDiscountValue(0);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percent">เปอร์เซ็นต์ (%)</option>
                      <option value="amount">จำนวนเงิน (บาท)</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {discountType === 'percent' ? 'ส่วนลด (%)' : 'ส่วนลด (บาท)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max={discountType === 'percent' ? 100 : selectedPackage.price}
                        value={discountValue}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          if (discountType === 'percent') {
                            setDiscountValue(Math.min(100, Math.max(0, value)));
                          } else {
                            setDiscountValue(Math.min(selectedPackage.price, Math.max(0, value)));
                          }
                        }}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        {discountType === 'percent' ? (
                          <Percent className="h-5 w-5 text-gray-400" />
                        ) : (
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Discount Buttons */}
                {discountType === 'percent' && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">ส่วนลดด่วน:</p>
                    <div className="flex flex-wrap gap-2">
                      {[5, 10, 15, 20, 25, 30].map(percent => (
                        <button
                          key={percent}
                          onClick={() => setDiscountValue(percent)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                        >
                          {percent}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมายเหตุ
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="เพิ่มหมายเหตุเกี่ยวกับแพ็คเกจนี้..."
                />
              </div>

              {/* Price Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">สรุปราคา</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>ราคาเต็ม:</span>
                    <span className="font-medium">{selectedPackage.price.toLocaleString()} บาท</span>
                  </div>
                  
                  {discountValue > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>ส่วนลด:</span>
                      <span className="font-medium">
                        - {discountType === 'percent' 
                          ? `${discountValue}% (${((selectedPackage.price * discountValue) / 100).toLocaleString()} บาท)`
                          : `${discountValue.toLocaleString()} บาท`
                        }
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t border-blue-300 pt-3 flex justify-between text-xl font-bold text-blue-900">
                    <span>ราคาสุทธิ:</span>
                    <span>{calculateFinalPrice().toLocaleString()} บาท</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedPackage || saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>บันทึกแพ็คเกจ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientPackageSelector;