// src/pages/Dashboard.js

import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  FileSpreadsheet,
  Wrench,
  Users,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  // State สำหรับเก็บข้อมูลจาก API
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // API Base URL - ปรับตามโปรเจคของคุณ
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Function สำหรับเรียก API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result)
      if (result.success) {
        setDashboardData(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);

      // ใช้ข้อมูล fallback หากเกิดข้อผิดพลาด
      setDashboardData(getFallbackData());
    } finally {
      setLoading(false);
    }
  };

  // ข้อมูล Fallback กรณี API ล้มเหลว
  const getFallbackData = () => ({
    stats: [
      {
        title: 'จำนวนผู้ป่วยในระบบ',
        value: '73,882',
        date: '07/08/2025',
        color: 'bg-yellow-100',
        textColor: 'text-yellow-800'
      },
      {
        title: 'จำนวนผู้ป่วย Admit',
        value: '25',
        date: '07/08/2025',
        color: 'bg-blue-100',
        textColor: 'text-blue-800'
      },
      {
        title: 'จำนวนผู้ป่วย Discharge',
        value: '10',
        date: '07/08/2025',
        color: 'bg-purple-100',
        textColor: 'text-purple-800'
      },
      {
        title: 'ศูนย์ฟื้นฟูหลอดเลือดสมองและผู้สูงอายุ เดอะซีนิเซ่นส์',
        value: '25',
        date: '07/08/2025',
        color: 'bg-green-100',
        textColor: 'text-green-800'
      }
    ],
    additionalStats: [
      {
        title: 'คลินิกเวชกรรมเดอะซีนิเซ่นส์',
        value: '17',
        date: '07/08/2025',
        color: 'bg-gray-100',
        textColor: 'text-gray-800'
      },
      {
        title: 'สหคลินิกเซนดีไซน์',
        value: '8',
        date: '07/08/2025',
        color: 'bg-teal-100',
        textColor: 'text-teal-800'
      },
      {
        title: 'คลินิกเวชกรรมคิดนีเซ่นส์',
        value: '9',
        date: '07/08/2025',
        color: 'bg-indigo-100',
        textColor: 'text-indigo-800'
      },
      {
        title: 'คลินิกเวชกรรมเดอะซีนิเซ่นส์เวลเนส',
        value: '30',
        date: '07/08/2025',
        color: 'bg-pink-100',
        textColor: 'text-pink-800'
      }
    ],
    activities: [
      {
        user: 'นายกฤษดา ระบุ',
        action: 'ศูนย์ฟื้นฟูหลอดเลือดสมองและผู้สูงอายุ เดอะซีนิเซ่นส์',
        time: '3h ago',
        type: 'blue'
      }
    ],
    greenActivities: [
      {
        user: 'นายกฤษดา ระบุ',
        action: 'ศูนย์ฟื้นฟูหลอดเลือดสมองและผู้สูงอายุ เดอะซีนิเซ่นส์',
        time: '3h ago',
        type: 'green'
      }
    ]
  });

  // เรียก API เมื่อ component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto refresh ทุก 5 นาที
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Component สำหรับแสดง Loading
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
      <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
      <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
    </div>
  );

  // Component สำหรับแสดง Error
  const ErrorMessage = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">เกิดข้อผิดพลาดในการโหลดข้อมูล</h3>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm transition-colors"
        >
          ลองใหม่
        </button>
      </div>
    </div>
  );

  // Component สำหรับแสดงสถิติ
  const StatCard = ({ stat, index }) => (
    <div key={index} className={`${stat.color} rounded-xl p-6 relative overflow-hidden`}>
      <div className={`${stat.textColor} font-semibold text-sm mb-2`}>{stat.title}</div>
      <div className={`${stat.textColor} text-2xl font-bold mb-1`}>{stat.value}</div>
      <div className={`${stat.textColor} text-xs opacity-70`}>{stat.date}</div>
      <div className="absolute bottom-0 right-0 opacity-20">
        <svg width="100" height="40" viewBox="0 0 100 40">
          <path d="M0,20 Q25,0 50,20 T100,20 L100,40 L0,40 Z" fill="currentColor" />
        </svg>
      </div>
    </div>
  );

  // Component สำหรับแสดง Activity
  const ActivityCard = ({ activity, index }) => (
    <div
      key={index}
      className={`${activity.type === 'blue' ? 'bg-blue-500' : 'bg-green-500'} text-white rounded-lg p-4 flex items-start space-x-3`}
    >
      <img
        src={activity.profileImage || (activity.type === 'blue'
          ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
          : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
        )}
        alt="User"
        className="w-10 h-10 rounded-full"
        onError={(e) => {
          e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face";
        }}
      />
      <div className="flex-1">
        <div className="font-medium text-sm">{activity.user}</div>
        <div className="text-sm opacity-90 mt-1">{activity.action}</div>
        <div className="text-xs opacity-70 mt-1">{activity.time}</div>
      </div>
    </div>
  );

  // แสดง Loading ถ้ากำลังโหลดและยังไม่มีข้อมูล
  if (loading && !dashboardData) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {/* แสดง Error Message หากมี */}
      {error && <ErrorMessage />}

      {/* Header พร้อมข้อมูลการอัปเดตล่าสุด */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">แดชบอร์ด</h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              อัปเดตล่าสุด: {lastUpdated.toLocaleString('th-TH')}
            </p>
          )}
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรช</span>
        </button>
      </div>

      {dashboardData && (
        <>
          {/* Stats Cards - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {dashboardData.stats.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
          </div>

          {/* Stats Cards - Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardData.additionalStats.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl p-6 flex items-center justify-center space-x-3 transition-colors">
              <UserPlus size={24} />
              <span className="font-medium">ผู้รับริการใหม่</span>
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl p-6 flex items-center justify-center space-x-3 transition-colors">
              <Users size={24} />
              <span className="font-medium">เปิดเลข VN/AN</span>
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white rounded-xl p-6 flex items-center justify-center space-x-3 transition-colors">
              <FileSpreadsheet size={24} />
              <span className="font-medium">รายงาน</span>
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white rounded-xl p-6 flex items-center justify-center space-x-3 transition-colors">
              <Wrench size={24} />
              <span className="font-medium">การจัดการระบบ</span>
            </button>
          </div>

          {/* Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Activity Feed */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">ผู้มารับบริการล่าสุด</h3>
                <span className="text-sm text-gray-500">
                  ({dashboardData.activities?.length || 0} รายการ)
                </span>
              </div>
              <div className="space-y-3">
                {dashboardData.activities?.length > 0 ? (
                  dashboardData.activities.map((activity, index) => (
                    <ActivityCard key={index} activity={activity} index={index} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    ไม่มีข้อมูลผู้มารับบริการล่าสุด
                  </div>
                )}
              </div>
            </div>

            {/* Right Activity Feed */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">ผู้มารับบริการที่ชำระเงินแล้วล่าสุด</h3>
                <span className="text-sm text-gray-500">
                  ({dashboardData.greenActivities?.length || 0} รายการ)
                </span>
              </div>
              <div className="space-y-3">
                {dashboardData.greenActivities?.length > 0 ? (
                  dashboardData.greenActivities.map((activity, index) => (
                    <ActivityCard key={index} activity={activity} index={index} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    ไม่มีข้อมูลผู้ที่ชำระเงินแล้วล่าสุด
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;