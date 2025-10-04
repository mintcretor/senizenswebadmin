import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SenizensLogin from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patient from './pages/Patient';
import MainLayout from './layouts/MainLayout';
import AddPatient from './pages/AddPatient';
import ThaiServiceForm from './pages/VNPatient';
import VNPatientList from './pages/Strokecenter';
import ServiceManagementSystem from './pages/SettingSystem';
import PatientDetails from './pages/PatientDetails';
import EditPatient from './pages/EditPatient';
import SenizensRegister from './pages/Register'
import MultidisciplinaryReport from './pages/MultidisciplinaryReport'
import RehabReport from './pages/RehabReport'
import DailyReport from './pages/DailyReport'
import ReportsList from './pages/ReportsList'
import Example from './pages/Example'
import ProcedureReport from './pages/ProcedureReport'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = checkAuthStatus(); // ฟังก์ชันตรวจสอบการ login

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ฟังก์ชันตรวจสอบสถานะการ login
const checkAuthStatus = () => {
  // วิธีที่ 1: ตรวจสอบจาก localStorage
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');

  // วิธีที่ 2: ตรวจสอบจาก sessionStorage
  // const token = sessionStorage.getItem('authToken');

  // วิธีที่ 3: ตรวจสอบจาก cookie (ถ้าใช้)
  // const token = document.cookie.includes('authToken');

  return token && user; // คืนค่า true ถ้ามี token และ user
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // ตรวจสอบสถานะการ login เมื่อ app เริ่มทำงาน
    const authStatus = checkAuthStatus();
    setIsAuthenticated(authStatus);
    setIsLoading(false);
  }, []);

  // แสดง loading screen ระหว่างตรวจสอบการ login
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Route สำหรับ Login */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <SenizensLogin />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <SenizensRegister />
          }
        />
        {/* Root route - redirect based on auth status */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />

        {/* Protected Routes with Layout */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/Patient" element={<Patient />} />
          <Route path="/stroke-center" element={<VNPatientList />} />
          <Route path="/Settings" element={<ServiceManagementSystem />} />
          <Route path="/Patient/:id" element={<PatientDetails />} />
          <Route path="/AddPatient" element={<AddPatient />} />
          <Route path="/EditPatient/:id" element={<EditPatient />} />
          <Route path="/an-vn/add/:id?" element={<ThaiServiceForm />} />
          <Route path="/multidisciplinary" element={<MultidisciplinaryReport />} />
          <Route path="/rehab" element={<RehabReport />} />
          <Route path="/multidisciplinary/:hn?" element={<MultidisciplinaryReport />} />
          <Route path="/rehab/:hn?" element={<RehabReport />} />
          <Route path="/daily-report/:hn?" element={<DailyReport />} />
          <Route path="/reports-list" element={<ReportsList />} />
          <Route path="/procedure-form" element={<Example />} />
          <Route path="/procedure-report" element={<ProcedureReport />} />

        </Route>

        {/* Catch all route - redirect to appropriate page */}
        <Route
          path="*"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;