import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SenizensLogin from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patient from './pages/Patient';
import MainLayout from './layouts/MainLayout';
import AddPatient from './pages/AddPatient';
import ThaiServiceForm from './pages/VNPatient';
import VNPatientList from './pages/Strokecenter';
import ServiceManagementSystem from './pages/SettingSystem';

// หน้าใหม่ที่ต้องสร้าง
import PatientDetails from './pages/PatientDetails';   // หน้าดูรายละเอียดผู้รับบริการ
import EditPatient from './pages/EditPatient';         // หน้าแก้ไขผู้รับบริการ

function App() {
  return (
    <Router>
      <Routes>
        {/* Route ที่ไม่ต้องมี Layout */}
        <Route path="/login" element={<SenizensLogin />} />
        <Route path="/" element={<SenizensLogin />} />

        {/* Route Group สำหรับหน้าที่มี Layout ร่วมกัน */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/Patient" element={<Patient />} />
          <Route path="/stroke-center" element={<VNPatientList />} />
          <Route path="/Settings" element={<ServiceManagementSystem />} />
          
          {/* Routes ใหม่สำหรับ Patient Management */}
          <Route path="/Patient/:id" element={<PatientDetails />} />
           <Route path="/AddPatient" element={<AddPatient />} />
          <Route path="/EditPatient/:id" element={<EditPatient />} />
          <Route path="/an-vn/add" element={<ThaiServiceForm />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;