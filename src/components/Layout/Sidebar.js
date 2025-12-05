import React from 'react';
import {
  Home,
  Users,
  Settings,
  Bell,
  HelpCircle,
  HeartPulse,
  PersonStanding,
  Droplets,
  Sparkles,
  LogOut,
  ClipboardMinus,
  Calendar,
  Pill,
} from 'lucide-react';

const Sidebar = ({ isSidebarOpen }) => {
  const currentPath = window.location.pathname;

  // ตรวจสอบว่าอยู่บนมือถือหรือไม่ (หน้าจอเล็กกว่า 768px)
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // เช็คตอนโหลดครั้งแรก
    checkMobile();

    // เช็คทุกครั้งที่ resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ถ้าเป็นมือถือ ให้ย่อไว้ตลอด ไม่สนใจ isSidebarOpen
  const isOpen = isMobile ? false : isSidebarOpen;

  const getLinkClass = (path) => {
    const isActive = currentPath === path;
    const baseClasses = 'flex items-center space-x-3 p-2 rounded-lg transition-colors';
    const activeClass = 'bg-slate-700';
    const inactiveClass = 'hover:bg-slate-700';
    return `${baseClasses} ${isActive ? activeClass : inactiveClass}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.clear();

    if (window.confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      window.location.href = '/login';
    }
  };

  return (
    <div className={`${isOpen ? 'w-64' : 'w-16'} bg-slate-800 text-white transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-slate-800 font-bold text-sm">S</span>
          </div>
          {isOpen && <span className="font-semibold">SENIZENS</span>}
        </div>
      </div>

      {/* Quick Access */}
      <div className="p-4 overflow-y-auto flex-1">
        {isOpen && <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3">Quick Access</h3>}
        <nav className="space-y-2">
          <a href="/dashboard" className={getLinkClass('/dashboard')} title={!isOpen ? 'Dashboard' : ''}>
            <Home size={20} className="flex-shrink-0" />
            {isOpen && <span>Dashboard</span>}
          </a>
          <a href="/Patient" className={getLinkClass('/Patient')} title={!isOpen ? 'Patient' : ''}>
            <Users size={20} className="flex-shrink-0" />
            {isOpen && <span>Patient</span>}
          </a>
          <a href="/stroke-center" className={getLinkClass('/stroke-center')} title={!isOpen ? 'ศูนย์ฟื้นฟูโรคหลอดเลือดสมอง' : ''}>
            <HeartPulse size={20} className="flex-shrink-0" />
            {isOpen && <span className="text-sm">ศูนย์ฟื้นฟูโรคหลอดเลือดสมอง</span>}
          </a>
          <a href="/physical-therapy" className={getLinkClass('/physical-therapy')} title={!isOpen ? 'กายภาพบำบัด' : ''}>
            <PersonStanding size={20} className="flex-shrink-0" />
            {isOpen && <span>กายภาพบำบัด</span>}
          </a>
          <a href="/dialysis-center" className={getLinkClass('/dialysis-center')} title={!isOpen ? 'ศูนย์ไตเทียม' : ''}>
            <Droplets size={20} className="flex-shrink-0" />
            {isOpen && <span>ศูนย์ไตเทียม</span>}
          </a>
          <a href="/wellness" className={getLinkClass('/wellness')} title={!isOpen ? 'สุขภาพและความงาม' : ''}>
            <Sparkles size={20} className="flex-shrink-0" />
            {isOpen && <span>สุขภาพและความงาม</span>}
          </a>
          <a href="/drug-inventory" className={getLinkClass('/drug-inventory')}>
            <Pill size={20} className="flex-shrink-0" />
            {isOpen && <span>คลังยา</span>}
          </a>
          <a href="/ProcedureRecordList" className={getLinkClass('/ProcedureRecordList')} title={!isOpen ? 'จัดการข้อมูลบันทึกหัตถการ' : ''}>
            <ClipboardMinus size={20} className="flex-shrink-0" />
            {isOpen && <span>จัดการข้อมูลบันทึกหัตถการ</span>}
          </a>
          <a href="/MultidisciplinaryReportList" className={getLinkClass('/MultidisciplinaryReportList')} title={!isOpen ? 'จัดการข้อมูลรายงานสหวิชาชีพ' : ''}>
            <ClipboardMinus size={20} className="flex-shrink-0" />
            {isOpen && <span>จัดการข้อมูลรายงานสหวิชาชีพ</span>}
          </a>
          
          <a href="/reports-list" className={getLinkClass('/reports-list')} title={!isOpen ? 'รายงานรายวัน' : ''}>
            <ClipboardMinus size={20} className="flex-shrink-0" />
            {isOpen && <span>รายงานรายวัน</span>}
          </a>
          <a href="/ShiftScheduleTable" className={getLinkClass('/ShiftScheduleTable')} title={!isOpen ? 'ตั้งค่าตารางเวร' : ''}>
            <Calendar size={20} className="flex-shrink-0" />
            {isOpen && <span>ตั้งค่าตารางเวร</span>}
          </a>

          <a href="/Usermanagement" className={getLinkClass('/Usermanagement')} title={!isOpen ? 'User Management' : ''}>
            <Users size={20} className="flex-shrink-0" />
            {isOpen && <span>User Management</span>}
          </a>


          <a href="/Settings" className={getLinkClass('/Settings')} title={!isOpen ? 'System Setting' : ''}>
            <Settings size={20} className="flex-shrink-0" />
            {isOpen && <span>System Setting</span>}
          </a>
        </nav>
      </div>

      {/* Account Section */}
      <div className="mt-auto p-4 border-t border-slate-700">
        {isOpen && <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3">Account</h3>}
        <nav className="space-y-2">
          <a href="/notifications" className={getLinkClass('/notifications')} title={!isOpen ? 'Notifications' : ''}>
            <Bell size={20} className="flex-shrink-0" />
            {isOpen && <span>Notifications</span>}
          </a>
          <a href="/account-settings" className={getLinkClass('/account-settings')} title={!isOpen ? 'Settings' : ''}>
            <Settings size={20} className="flex-shrink-0" />
            {isOpen && <span>Settings</span>}
          </a>
          <a href="/faq" className={getLinkClass('/faq')} title={!isOpen ? 'FAQ' : ''}>
            <HelpCircle size={20} className="flex-shrink-0" />
            {isOpen && <span>FAQ</span>}
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-2 rounded-lg transition-colors hover:bg-red-600 w-full text-left"
            title={!isOpen ? 'Logout' : ''}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {isOpen && <span>Logout</span>}
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;