// src/components/supplies/SupplyFormModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import api from '../../api/baseapi';

const SupplyFormModal = ({ supply, categories, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState([]);
  const [formData, setFormData] = useState({
    supply_code: '',
    supply_name: '',
    supply_name_en: '',
    category_id: '',
    unit_id: '',
    description: '',
    unit_price: '',
    cost_price: '',
    minimum_quantity: '',
    maximum_quantity: '',
    current_quantity: '',
    storage_location: '',
    is_consumable: true,
    requires_prescription: false,
    is_active: true
  });

  useEffect(() => {
    loadUnits();
    if (supply) {
      setFormData({
        supply_code: supply.supply_code || '',
        supply_name: supply.supply_name || '',
        supply_name_en: supply.supply_name_en || '',
        category_id: supply.category_id || '',
        unit_id: supply.unit_id || '',
        description: supply.description || '',
        unit_price: supply.unit_price || '',
        cost_price: supply.cost_price || '',
        minimum_quantity: supply.minimum_quantity || '',
        maximum_quantity: supply.maximum_quantity || '',
        current_quantity: supply.current_quantity || '',
        storage_location: supply.storage_location || '',
        is_consumable: supply.is_consumable !== false,
        requires_prescription: supply.requires_prescription === true,
        is_active: supply.is_active !== false
      });
    }
  }, [supply]);

  const loadUnits = async () => {
    try {
      const response = await api.get('/medical-supplies/units');
      setUnits(response.data.data || []);
    } catch (error) {
      console.error('Load units error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (supply) {
        // Update
        await api.put(`/medical-supplies/${supply.supply_id}`, formData);
        alert('แก้ไขสำเร็จ');
      } else {
        // Create
        await api.post('/medical-supplies', formData);
        alert('เพิ่มสำเร็จ');
      }
      onClose(true); // Reload data
    } catch (error) {
      console.error('Submit error:', error);
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {supply ? 'แก้ไขเวชภัณฑ์' : 'เพิ่มเวชภัณฑ์ใหม่'}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสเวชภัณฑ์ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="supply_code"
                value={formData.supply_code}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="SUP-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมวดหมู่ <span className="text-red-500">*</span>
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อเวชภัณฑ์ (ไทย) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="supply_name"
                value={formData.supply_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ผ้าก๊อซ 4x4"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อเวชภัณฑ์ (อังกฤษ)
              </label>
              <input
                type="text"
                name="supply_name_en"
                value={formData.supply_name_en}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Gauze 4x4"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รายละเอียด
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="รายละเอียดเพิ่มเติม..."
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">ราคาและสต็อค</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หน่วยนับ <span className="text-red-500">*</span>
                </label>
                <select
                  name="unit_id"
                  value={formData.unit_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">เลือกหน่วย</option>
                  {units.map(unit => (
                    <option key={unit.unit_id} value={unit.unit_id}>
                      {unit.unit_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ราคาขาย/หน่วย (บาท)
                </label>
                <input
                  type="number"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ต้นทุน/หน่วย (บาท)
                </label>
                <input
                  type="number"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  จำนวนปัจจุบัน
                </label>
                <input
                  type="number"
                  name="current_quantity"
                  value={formData.current_quantity}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  จำนวนขั้นต่ำ
                </label>
                <input
                  type="number"
                  name="minimum_quantity"
                  value={formData.minimum_quantity}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  จำนวนสูงสุด
                </label>
                <input
                  type="number"
                  name="maximum_quantity"
                  value={formData.maximum_quantity}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ตำแหน่งเก็บ
                </label>
                <input
                  type="text"
                  name="storage_location"
                  value={formData.storage_location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="คลังหลัก, ชั้น 2"
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">ตัวเลือกเพิ่มเติม</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_consumable"
                  checked={formData.is_consumable}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  เป็นของใช้แล้วทิ้ง (Consumable)
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="requires_prescription"
                  checked={formData.requires_prescription}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  ต้องใช้ใบสั่งแพทย์
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  ใช้งานอยู่
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  บันทึก
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplyFormModal;