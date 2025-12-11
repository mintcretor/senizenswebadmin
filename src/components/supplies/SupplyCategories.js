// src/components/supplies/SupplyCategories.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FolderOpen,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import api from '../../api/baseapi';

const SupplyCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    category_code: '',
    category_name: '',
    description: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medical-supplies/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Load categories error:', error);
      alert('ไม่สามารถโหลดข้อมูลหมวดหมู่ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        category_code: category.category_code || '',
        category_name: category.category_name || '',
        description: category.description || '',
        is_active: category.is_active !== false
      });
    } else {
      setEditingCategory(null);
      setFormData({
        category_code: '',
        category_name: '',
        description: '',
        is_active: true
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      category_code: '',
      category_name: '',
      description: '',
      is_active: true
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category_code.trim()) {
      newErrors.category_code = 'กรุณาระบุรหัสหมวดหมู่';
    }

    if (!formData.category_name.trim()) {
      newErrors.category_name = 'กรุณาระบุชื่อหมวดหมู่';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editingCategory) {
        // Update
        await api.put(`/medical-supplies/categories/${editingCategory.category_id}`, formData);
        alert('แก้ไขหมวดหมู่สำเร็จ');
      } else {
        // Create
        await api.post('/medical-supplies/categories', formData);
        alert('เพิ่มหมวดหมู่สำเร็จ');
      }
      
      handleCloseModal();
      loadCategories();
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.error || 'เกิดข้อผิดพลาด';
      alert(errorMessage);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`คุณต้องการลบหมวดหมู่ "${category.category_name}" ใช่หรือไม่?`)) {
      return;
    }

    try {
      await api.delete(`/medical-supplies/categories/${category.category_id}`);
      alert('ลบหมวดหมู่สำเร็จ');
      loadCategories();
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.error || 'ไม่สามารถลบได้';
      
      if (error.response?.status === 400) {
        alert('ไม่สามารถลบได้ เนื่องจากมีเวชภัณฑ์ในหมวดหมู่นี้อยู่');
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleToggleActive = async (category) => {
    try {
      await api.put(`/medical-supplies/categories/${category.category_id}`, {
        ...category,
        is_active: !category.is_active
      });
      loadCategories();
    } catch (error) {
      console.error('Toggle active error:', error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FolderOpen className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              หมวดหมู่เวชภัณฑ์
            </h3>
            <p className="text-sm text-gray-600">
              จัดการหมวดหมู่สำหรับจัดเก็บเวชภัณฑ์
            </p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          เพิ่มหมวดหมู่
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">หมายเหตุ:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>หมวดหมู่ที่ถูกปิดการใช้งานจะไม่แสดงในตัวเลือกเมื่อเพิ่มเวชภัณฑ์</li>
              <li>ไม่สามารถลบหมวดหมู่ที่มีเวชภัณฑ์อยู่ได้</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">ยังไม่มีหมวดหมู่</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
          >
            เพิ่มหมวดหมู่แรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.category_id}
              category={category}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CategoryModal
          category={editingCategory}
          formData={formData}
          errors={errors}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

// ========================================
// Category Card Component
// ========================================
const CategoryCard = ({ category, onEdit, onDelete, onToggleActive }) => {
  return (
    <div className={`bg-white rounded-lg border-2 p-4 transition-all hover:shadow-md ${
      category.is_active ? 'border-gray-200' : 'border-gray-300 bg-gray-50'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            category.is_active 
              ? 'bg-purple-100' 
              : 'bg-gray-200'
          }`}>
            <FolderOpen className={`w-6 h-6 ${
              category.is_active 
                ? 'text-purple-600' 
                : 'text-gray-400'
            }`} />
          </div>
          <div>
            <h4 className={`font-semibold ${
              category.is_active ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {category.category_name}
            </h4>
            <p className="text-xs text-gray-500">{category.category_code}</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <button
          onClick={() => onToggleActive(category)}
          className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
            category.is_active
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          {category.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
        </button>
      </div>

      {/* Description */}
      {category.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {category.description}
        </p>
      )}

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-3 border-b border-gray-200">
        <span>เวชภัณฑ์: {category.supply_count || 0} รายการ</span>
        {category.created_at && (
          <span>
            สร้าง: {new Date(category.created_at).toLocaleDateString('th-TH')}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(category)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Edit className="w-4 h-4" />
          <span className="text-sm font-medium">แก้ไข</span>
        </button>
        <button
          onClick={() => onDelete(category)}
          className="flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          title="ลบ"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ========================================
// Category Modal Component
// ========================================
const CategoryModal = ({ 
  category, 
  formData, 
  errors, 
  onChange, 
  onSubmit, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FolderOpen className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {category ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* Category Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสหมวดหมู่ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="category_code"
              value={formData.category_code}
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.category_code ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="CAT-001"
            />
            {errors.category_code && (
              <p className="mt-1 text-sm text-red-600">{errors.category_code}</p>
            )}
          </div>

          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อหมวดหมู่ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="category_name"
              value={formData.category_name}
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.category_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="อุปกรณ์ทำแผล"
            />
            {errors.category_name && (
              <p className="mt-1 text-sm text-red-600">{errors.category_name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รายละเอียด
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับหมวดหมู่นี้..."
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={onChange}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label className="ml-2 text-sm text-gray-700">
              เปิดใช้งาน
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplyCategories;