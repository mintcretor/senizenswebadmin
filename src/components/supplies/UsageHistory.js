// src/components/supplies/UsageHistory.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Download, Filter } from 'lucide-react';
import api from '../../api/baseapi';

const UsageHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of month
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadHistory();
  }, [dateRange]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medical-supplies/usage-history', {
        params: dateRange
      });
      setHistory(response.data.data || []);
    } catch (error) {
      console.error('Load history error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Export logic
    alert('Export รายงานการใช้');
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
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            วันที่เริ่มต้น
          </label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            วันที่สิ้นสุด
          </label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={exportReport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">ใช้ทั้งหมด</p>
          <p className="text-2xl font-bold text-gray-900">
            {history.reduce((sum, h) => sum + h.usage_count, 0)} ครั้ง
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">มูลค่ารวม</p>
          <p className="text-2xl font-bold text-gray-900">
            ฿{history.reduce((sum, h) => sum + h.total_value, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">รายการเวชภัณฑ์</p>
          <p className="text-2xl font-bold text-gray-900">{history.length}</p>
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                เวชภัณฑ์
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                เจ้าของ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                จำนวนครั้ง
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                จำนวนรวม
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                มูลค่า
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.supply_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.supply_code}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    item.supply_owner === 'center'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {item.supply_owner === 'center' ? 'ของศูนย์' : 'ของผู้สูงอายุ'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  {item.usage_count}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  {item.total_quantity_used}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  ฿{item.total_value.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {history.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">ไม่พบประวัติการใช้ในช่วงเวลานี้</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsageHistory;