// src/components/supplies/LowStockAlert.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShoppingCart, RefreshCw } from 'lucide-react';
import api from '../../api/baseapi';

const LowStockAlert = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medical-supplies/low-stock');
      setAlerts(response.data.data || []);
    } catch (error) {
      console.error('Load alerts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePO = (supply) => {
    // Navigate to Purchase Order creation
    alert(`สร้างใบสั่งซื้อสำหรับ: ${supply.supply_name}`);
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
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              แจ้งเตือนสต็อคต่ำ
            </h3>
            <p className="text-sm text-gray-600">
              พบเวชภัณฑ์ที่ต้องสั่งซื้อ {alerts.length} รายการ
            </p>
          </div>
        </div>
        <button
          onClick={loadAlerts}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          รีเฟรช
        </button>
      </div>

      {/* Alert List */}
      {alerts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600">ไม่มีเวชภัณฑ์ที่ต้องสั่งซื้อ</p>
          <p className="text-sm text-gray-500 mt-1">สต็อคทั้งหมดอยู่ในระดับปกติ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.supply_id}
              className="bg-white rounded-lg border-l-4 border-red-500 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">
                      ต้องสั่งซื้อ
                    </span>
                    <span className="text-sm text-gray-500">
                      {alert.supply_code}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {alert.supply_name}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-500">คงเหลือ</p>
                      <p className="text-lg font-bold text-red-600">
                        {alert.current_quantity} {alert.unit_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ขั้นต่ำ</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {alert.minimum_quantity} {alert.unit_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ควรสั่ง</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {alert.quantity_needed} {alert.unit_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ตำแหน่ง</p>
                      <p className="text-sm text-gray-900">
                        {alert.storage_location || '-'}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleCreatePO(alert)}
                  className="ml-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  สั่งซื้อ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LowStockAlert;