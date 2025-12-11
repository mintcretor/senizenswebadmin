// src/components/supplies/SupplyList.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  Filter,
  Download
} from 'lucide-react';
import SupplyFormModal from './SupplyFormModal';
import api from '../../api/baseapi';

const SupplyList = ({ onStatsUpdate }) => {
  const [supplies, setSupplies] = useState([]);
  const [filteredSupplies, setFilteredSupplies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSupply, setEditingSupply] = useState(null);

  useEffect(() => {
    loadSupplies();
    loadCategories();
  }, []);

  useEffect(() => {
    filterSupplies();
  }, [supplies, searchTerm, selectedCategory]);

  const loadSupplies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medical-supplies');
      setSupplies(response.data.data || []);
      
      // Update stats
      if (onStatsUpdate) {
        const totalValue = response.data.data.reduce(
          (sum, item) => sum + (item.current_quantity * item.unit_price), 
          0
        );
        onStatsUpdate({
          totalSupplies: response.data.data.length,
          lowStock: response.data.data.filter(s => s.current_quantity <= s.minimum_quantity).length,
          totalValue: totalValue,
          monthlyUsage: 0 // จะคำนวณจาก API
        });
      }
    } catch (error) {
      console.error('Load supplies error:', error);
      alert('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/medical-supplies/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Load categories error:', error);
    }
  };

  const filterSupplies = () => {
    let filtered = supplies;

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(
        s => 
          s.supply_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.supply_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category_id === parseInt(selectedCategory));
    }

    setFilteredSupplies(filtered);
  };

  const handleDelete = async (supplyId) => {
    if (!window.confirm('คุณต้องการลบเวชภัณฑ์นี้ใช่หรือไม่?')) return;

    try {
      await api.delete(`/medical-supplies/${supplyId}`);
      alert('ลบสำเร็จ');
      loadSupplies();
    } catch (error) {
      console.error('Delete error:', error);
      alert('ไม่สามารถลบได้');
    }
  };

  const handleEdit = (supply) => {
    setEditingSupply(supply);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingSupply(null);
    setShowModal(true);
  };

  const handleModalClose = (shouldReload) => {
    setShowModal(false);
    setEditingSupply(null);
    if (shouldReload) {
      loadSupplies();
    }
  };

  const exportToCSV = () => {
    // Export logic
    const csvContent = [
      ['รหัส', 'ชื่อเวชภัณฑ์', 'หมวดหมู่', 'คงเหลือ', 'หน่วย', 'ราคา/หน่วย'].join(','),
      ...filteredSupplies.map(s => 
        [
          s.supply_code,
          s.supply_name,
          s.category_name,
          s.current_quantity,
          s.unit_name,
          s.unit_price
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `medical-supplies-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 flex gap-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ค้นหาเวชภัณฑ์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            เพิ่มเวชภัณฑ์
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="text-sm text-gray-600">
        แสดง {filteredSupplies.length} จาก {supplies.length} รายการ
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                รหัส
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ชื่อเวชภัณฑ์
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                หมวดหมู่
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                คงเหลือ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ขั้นต่ำ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ราคา/หน่วย
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                สถานะ
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSupplies.map((supply) => (
              <tr key={supply.supply_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {supply.supply_code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {supply.supply_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {supply.supply_name_en || '-'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {supply.category_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span className={`font-medium ${
                    supply.current_quantity <= supply.minimum_quantity
                      ? 'text-red-600'
                      : supply.current_quantity <= supply.minimum_quantity * 1.5
                      ? 'text-yellow-600'
                      : 'text-gray-900'
                  }`}>
                    {supply.current_quantity} {supply.unit_name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {supply.minimum_quantity} {supply.unit_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  ฿{supply.unit_price.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  { parseInt(supply.current_quantity || 0) <= parseInt(supply.minimum_quantity || 0) ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      ต้องสั่งซื้อ
                    </span>
                  ) : parseInt(supply.current_quantity) <= parseInt(supply.minimum_quantity * 1.5) ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      ใกล้หมด
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      ปกติ
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(supply)}
                      className="text-blue-600 hover:text-blue-900"
                      title="แก้ไข"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(supply.supply_id)}
                      className="text-red-600 hover:text-red-900"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSupplies.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">ไม่พบข้อมูลเวชภัณฑ์</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <SupplyFormModal
          supply={editingSupply}
          categories={categories}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default SupplyList;