// App.js - Updated version with Meal Consumption Tracking
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
import SenizensRegister from './pages/Register';
import MultidisciplinaryReport from './pages/MultidisciplinaryReport';
import RehabReport from './pages/RehabReport';
import DailyReport from './pages/DailyReport';
import ReportsList from './pages/ReportsList';
import Example from './pages/Example';
import ProcedureReport from './pages/ProcedureReport';
import MedicineLabelPrinter from './pages/MedicineLabelPrinter';
import Medicineimport from './pages/Medicineimport';
import AdmitDocumentWord from './pages/AdmitDocumentWord';
import ShiftScheduleTable from './pages/ShiftScheduleTable';
import Usermanagement from './pages/Usermanagement';
import Graphicsheet from './pages/Graphicsheet';
import ProcedureRecordList from './pages/ProcedureRecordList';
import ProcedureRecordEdit from './pages/ProcedureRecordEdit';
import DrugInventoryPage from './pages/DrugInventoryPage';
import MultidisciplinaryReportList from './pages/MultidisciplinaryReportList';
import MedicalSupplyManagement from './pages/MedicalSupplyManagement';
import EditVN from './pages/EditVN';
import EditVNS from './pages/EditVNS';

import NutritionManagement from './pages/NutritionManagement';
import MealConsumptionTracking from './pages/MealConsumptionTracking';
import Physicaltherapy from './pages/Physicaltherapy';
import Dialysiscenter from './pages/Dialysiscenter';

// Import auth utilities
import { checkAuthStatus } from './utils/auth';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = checkAuthStatus();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
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
          <Route path="/stroke-center/edit/:vnId" element={<EditVN />} />
          <Route path="/PatientVN/edit/:vnId" element={<EditVNS />} />

          <Route path="/physical-therapy" element={<Physicaltherapy />} />
          <Route path="/dialysis-center" element={<Dialysiscenter />} />
          <Route path="/Settings" element={<ServiceManagementSystem />} />
          <Route path="/Patient/:id" element={<PatientDetails />} />
          <Route path="/AddPatient" element={<AddPatient />} />
          <Route path="/EditPatient/:id" element={<EditPatient />} />
          <Route path="/an-vn/add/:id?" element={<ThaiServiceForm />} />
          <Route path="/multidisciplinary" element={<MultidisciplinaryReport />} />
          <Route path="/drug-inventory" element={<DrugInventoryPage />} />
          <Route path="/nutrition" element={<NutritionManagement />} />
          <Route path="/meal-consumption" element={<MealConsumptionTracking />} /> {/* ← เพิ่มเส้นทางเช็คการทาน */}
          <Route path="/rehab" element={<RehabReport />} />
          <Route path="/multidisciplinary/:hn?" element={<MultidisciplinaryReport />} />
          <Route
            path="/multidisciplinary/edit/:id"
            element={<MultidisciplinaryReport />}
          />

          <Route path="/rehab/:hn?" element={<RehabReport />} />
          <Route path="/daily-report/:hn?" element={<DailyReport />} />
          <Route path="/reports-list" element={<ReportsList />} />
          <Route path="/procedure-form" element={<Example />} />
          <Route path="/procedure-report" element={<ProcedureReport />} />
          <Route path="/medicine-print" element={<MedicineLabelPrinter />} />
          <Route path="/medicine-import" element={<Medicineimport />} />
          <Route path="/admit-document" element={<AdmitDocumentWord />} />
          <Route path="/ShiftScheduleTable" element={<ShiftScheduleTable />} />
          <Route path="/Usermanagement" element={<Usermanagement />} />
          <Route path="/Graphicsheet" element={<Graphicsheet />} />
          <Route path="/ProcedureRecordList" element={<ProcedureRecordList />} />
          <Route path="/ProcedureRecordEdit/:id" element={<ProcedureRecordEdit />} />
          <Route path="/MultidisciplinaryReportList" element={<MultidisciplinaryReportList />} />
          <Route path="/medical-supplies" element={<MedicalSupplyManagement />} />

        </Route>

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