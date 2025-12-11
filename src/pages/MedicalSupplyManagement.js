// src/pages/MedicalSupplyManagement.jsx
import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  TrendingUp, 
  Box,
  FileText 
} from 'lucide-react';
import SupplyList from '../components/supplies/SupplyList';
import StockManagement from '../components/supplies/StockManagement';
import LowStockAlert from '../components/supplies/LowStockAlert';
import UsageHistory from '../components/supplies/UsageHistory';
import SupplyCategories from '../components/supplies/SupplyCategories';

const MedicalSupplyManagement = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [stats, setStats] = useState({
    totalSupplies: 0,
    lowStock: 0,
    totalValue: 0,
    monthlyUsage: 0
  });

  const tabs = [
    { id: 'list', label: 'รายการเวชภัณฑ์', icon: Package },
    { id: 'stock', label: 'จัดการสต็อค', icon: Box },
    { id: 'alerts', label: 'แจ้งเตือน', icon: AlertTriangle },
    { id: 'usage', label: 'ประวัติการใช้', icon: TrendingUp },
    { id: 'categories', label: 'หมวดหมู่', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Package className="w-8 h-8" />
                ระบบจัดการเวชภัณฑ์
              </h1>
              <p className="text-blue-100 mt-1">Medical Supply Management System</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="เวชภัณฑ์ทั้งหมด"
            value={stats.totalSupplies}
            icon={Package}
            color="blue"
          />
          <StatCard
            title="แจ้งเตือนสต็อคต่ำ"
            value={stats.lowStock}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="มูลค่าคงคลัง"
            value={`฿${stats.totalValue.toLocaleString()}`}
            icon={Box}
            color="green"
          />
          <StatCard
            title="การใช้เดือนนี้"
            value={stats.monthlyUsage}
            icon={TrendingUp}
            color="purple"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'list' && <SupplyList onStatsUpdate={setStats} />}
            {activeTab === 'stock' && <StockManagement />}
            {activeTab === 'alerts' && <LowStockAlert />}
            {activeTab === 'usage' && <UsageHistory />}
            {activeTab === 'categories' && <SupplyCategories />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default MedicalSupplyManagement;