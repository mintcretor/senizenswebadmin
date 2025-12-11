// src/components/supplies/StockManagement.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Minus, RotateCcw, Save } from 'lucide-react';
import api from '../../api/baseapi';

const StockManagement = () => {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustments, setAdjustments] = useState({});

  useEffect(() => {
    loadSupplies();
  }, []);

  const loadSupplies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medical-supplies');
      setSupplies(response.data.data || []);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustment = (supplyId, value) => {
    setAdjustments(prev => ({
      ...prev,
      [supplyId]: value
    }));
  };

  const handleSaveAdjustment = async (supply) => {
    const adjustment = adjustments[supply.supply_id];
    if (!adjustment || adjustment === '0') return;

    try {
      await api.post(`/medical-supplies/${supply.supply_id}/adjust-stock`, {
        adjustment: parseFloat(adjustment),
        reason: 'Manual adjustment'
      });
      alert('ปรับสต็อคสำเร็จ');
      setAdjustments(prev => {
        const newAdj = { ...prev };
        delete newAdj[supply.supply_id];
        return newAdj;
      });
      loadSupplies();
    } catch (error) {
      console.error('Adjustment error:', error);
      alert('ไม่สามารถปรับสต็อคได้');
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>หมายเหตุ:</strong> ใส่ตัวเลขบวก (+) เพื่อเพิ่มสต็อค หรือตัวเลขลบ (-) เพื่อลดสต็อค
        </p>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                เวชภัณฑ์
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                คงเหลือ
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                ปรับสต็อค
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {supplies.map((supply) => (
              <tr key={supply.supply_id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {supply.supply_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {supply.supply_code}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-lg font-semibold text-gray-900">
                    {supply.current_quantity} {supply.unit_name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        const current = parseFloat(adjustments[supply.supply_id] || 0);
                        handleAdjustment(supply.supply_id, (current - 1).toString());
                      }}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={adjustments[supply.supply_id] || ''}
                      onChange={(e) => handleAdjustment(supply.supply_id, e.target.value)}
                      placeholder="0"
                      className="w-24 px-3 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => {
                        const current = parseFloat(adjustments[supply.supply_id] || 0);
                        handleAdjustment(supply.supply_id, (current + 1).toString());
                      }}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleSaveAdjustment(supply)}
                      disabled={!adjustments[supply.supply_id] || adjustments[supply.supply_id] === '0'}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                    >
                      <Save className="w-4 h-4" />
                      บันทึก
                    </button>
                    <button
                      onClick={() => handleAdjustment(supply.supply_id, '')}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="รีเซ็ต"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockManagement;