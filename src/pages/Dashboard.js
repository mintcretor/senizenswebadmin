// src/pages/Dashboard.js

import React from 'react';
// 1. ลบ import ที่ไม่ได้ใช้ออก เหลือไว้เฉพาะที่ใช้ในหน้านี้จริงๆ
import {
  UserPlus,
  FileSpreadsheet,
  Wrench,
  Users
} from 'lucide-react';

const Dashboard = () => {
  // 2. ลบ state 'isSidebarOpen' ออกไป เพราะ MainLayout จัดการให้แล้ว

  // ข้อมูลต่างๆ ยังคงเหมือนเดิม
const stats = [
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
  ];

  const additionalStats = [
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
  ];

  // กิจกรรมล่าสุด
  const activities = [
    {
      user: 'นายกฤษดา ระบุ',
      action: 'ศูนย์ฟื้นฟูหลอดเลือดสมองและผู้สูงอายุ เดอะซีนิเซ่นส์',
      time: '3h ago',
      type: 'blue'
    },
    {
      user: 'นายกฤษดา ระบุ',
      action: 'ศูนย์ฟื้นฟูหลอดเลือดสมองและผู้สูงอายุ เดอะซีนิเซ่นส์',
      time: '2 days ago',
      type: 'blue'
    },
    {
      user: 'นายกฤษดา ระบุ',
      action: 'ศูนย์ฟื้นฟูหลอดเลือดสมองและผู้สูงอายุ เดอะซีนิเซ่นส์',
      time: '5 days ago',
      type: 'blue'
    },
    {
      user: 'นายกฤษดา ระบุ',
      action: 'ศูนย์ฟื้นฟูหลอดเลือดสมองและผู้สูงอายุ เดอะซีนิเซ่นส์',
      time: '10 days ago',
      type: 'blue'
    },
    {
      user: 'นายกฤษดา ระบุ',
      action: 'ศูนย์ฟื้นฟูหลอดเลือดสมองและผู้สูงอายุ เดอะซีนิเซ่นส์',
      time: '10 days ago',
      type: 'blue'
    }
  ];

  const greenActivities = [
    {
      user: 'นายกฤษดา ระบุ',
      action: 'ศูนย์ฟื้นฟูหลอดเลือดสมองและผู้สูงอายุ เดอะซีนิเซ่นส์',
      time: '3h ago',
      type: 'green'
    },
    {
      user: 'นายกฤษดา ระบุ',
      action: 'ศูนย์ฟื้นฟูหลอดเลือดสมองและผู้สูงอายุ เดอะซีนิเซ่นส์',
      time: '2 days ago',
      type: 'green'
    },
    {
      user: 'นายกฤษดา ระบุ',
      action: 'ศูนย์ฟื้นฟูหลอดเลือดสมองและผู้สูงอายุ เดอะซีนิเซ่นส์',
      time: '3 days ago',
      type: 'green'
    },
    {
      user: 'นายกฤษดา ระบุ',
      action: 'ศูนย์ฟื้นฟูหลอดเลือดสมองและผู้สูงอายุ เดอะซีนิเซ่นส์',
      time: '10 days ago',
      type: 'green'
    },
    {
      user: 'นายกฤษดา ระบุ',
      action: 'ศูนย์ฟื้นฟูหลอดเลือดสมองและผู้สูงอายุ เดอะซีนิเซ่นส์',
      time: '10 days ago',
      type: 'green'
    }
  ];

  // 3. แก้ไข return ให้เหลือเฉพาะส่วนของเนื้อหา (Content) ที่จะแสดงใน Outlet
  return (
    <>
      {/* Stats Cards - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
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
        ))}
      </div>

      {/* Stats Cards - Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {additionalStats.map((stat, index) => (
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">ผู้มารับบริการล่าสุด</h3>
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={index} className="bg-blue-500 text-white rounded-lg p-4 flex items-start space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{activity.user}</div>
                  <div className="text-sm opacity-90 mt-1">{activity.action}</div>
                  <div className="text-xs opacity-70 mt-1">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Activity Feed */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">ผู้มารับบริการที่ชำระเงินแล้วล่าสุด</h3>
          <div className="space-y-3">
            {greenActivities.map((activity, index) => (
              <div key={index} className="bg-green-500 text-white rounded-lg p-4 flex items-start space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{activity.user}</div>
                  <div className="text-sm opacity-90 mt-1">{activity.action}</div>
                  <div className="text-xs opacity-70 mt-1">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;