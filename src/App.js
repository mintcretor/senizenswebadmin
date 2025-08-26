import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SenizensLogin from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patient from './pages/Patient';
import MainLayout from './layouts/MainLayout'; // 1. Import Layout เข้ามา
import AddPatient from './pages/AddPatient';
import ThaiServiceForm from './pages/VNPatient';
function App() {
  return (
    <Router>
      <Routes>
        {/* Route ที่ไม่ต้องมี Layout */}
        <Route path="/login" element={<SenizensLogin />} />
        <Route path="/" element={<SenizensLogin />} />

        {/* 2. สร้าง Route Group สำหรับหน้าที่มี Layout ร่วมกัน */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/Patient" element={<Patient />} />
          <Route path="/AddPatient" element={<AddPatient />} />
          <Route path="/VNPatient" element={<ThaiServiceForm />} />
          {/* สามารถเพิ่ม Route อื่นๆ ที่ต้องการ Sidebar ที่นี่ได้เลย */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;