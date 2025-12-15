import React, { useState, useEffect } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import PatientList from '../components/DrugInventory/PatientList';
import MedicationDetail from '../components/DrugInventory/MedicationDetail';
import FilterSection from '../components/DrugInventory/FilterSection';
import DispenseModal from '../components/DrugInventory/DispenseModal';
import ReturnModal from '../components/DrugInventory/ReturnModal';
import AddMedicineModal from '../components/DrugInventory/AddMedicineModal';
import api from '../api/baseapi';
import './DrugInventory.css';

function DrugInventoryPage() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filters, setFilters] = useState({
    ward: '',
    room: '',   
    search: ''
  });
  const [showModal, setShowModal] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [editingMedicine, setEditingMedicine] = useState(null);  // ← NEW
  const [patients, setPatients] = useState([]);
  const [medications, setMedications] = useState([]);
  const [patientMeds, setPatientMeds] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPatientList, setShowPatientList] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [uniqueWards, setUniqueWards] = useState([]);
  const [uniqueRooms, setUniqueRooms] = useState([]);

  // Load initial data
  useEffect(() => {
    loadPatients();
  }, []);

  // Load patient medications when patient is selected
  useEffect(() => {
    if (selectedPatient) {
      loadPatientMedications(selectedPatient);
    }
  }, [selectedPatient]);

  // Load patient medications from Medication Reconciliation API
  const loadPatientMedications = async (patientId) => {
    try {
      console.log('Loading medications for patient:', patientId);
      
      // หา service_registration_id ของผู้ป่วยที่เลือก
      const patient = patients.find(p => p.id === patientId);
      if (!patient || !patient.service_registration_id) {
        console.log('No service_registration_id found for patient:', patientId);
        setPatientMeds([]);
        return;
      }
      
      const serviceRegId = patient.service_registration_id;
      console.log('Loading medications for service_registration_id:', serviceRegId);
      
      // ดึงข้อมูล Medication Reconciliation ล่าสุด
      const response = await api.get(`/medication-reconciliation/${serviceRegId}`);
      
      console.log('Medications response:', response.data);
      
      if (response.data.success && response.data.data) {
        const reconData = response.data.data;
        const medications = reconData.medications || [];
        
        // Transform medications data สำหรับ Drug Inventory UI
        const transformedMeds = medications.map((med, index) => ({
          id: med.id || `med-${index}`,
          patientId: patientId,
          medicationId: med.medicine_id,
          medication_name: med.medication_name,
          medicineName: med.medication_name || med.generic_name,
          generic_name: med.generic_name,
          trade_name: med.trade_name,
          dosage: med.dosage,
          dose: med.dosage,
          unit: 'เม็ด', // ปรับตามความเหมาะสม
          route: med.route,
          frequency: med.frequency,
          timing: med.timing,
          dosage_instruction: med.dosage_instruction,
          quantity: med.quantity,
          expiry_date: med.expiry_date,
          lot_number: med.lot_number,
          status: med.status,
          special_instruction: med.special_instruction,
          has_changes: med.has_changes,
          adjusted_dosage: med.adjusted_dosage,
          change_reason: med.change_reason,
          is_external: med.is_external,
          external_hospital: med.external_hospital,
          doctorOrder: `${med.dosage_instruction || ''} ${med.frequency || ''}`.trim() || 'ไม่ระบุ',
          scheduleTime: med.schedule_time,
          scheduleTimeDisplay: med.schedule_time_display,
          initialStock: med.quantity || 0,
          currentStock: med.quantity || 0, // จะคำนวณจาก transaction จริงๆ
          imageUrl: med.image_url,
          notes: med.dosage_instruction || '',
          prescribedDate: reconData.reconciliation_date,
          ...med
        }));
        
        console.log('Transformed medications:', transformedMeds);
        setPatientMeds(transformedMeds);
        
        // ล้าง transactions เพราะ Medication Reconciliation ไม่มีระบบ transaction แบบ inventory
        setTransactions([]);
      } else {
        console.log('No medications found');
        setPatientMeds([]);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Load medications error:', error);
      if (error.response?.status === 404) {
        console.log('No reconciliation found for this patient');
      }
      setPatientMeds([]);
      setTransactions([]);
    }
  };

  // Load wards from API
  const loadWards = async () => {
    try {
      const response = await api.get('/');
      console.log('Wards response:', response.data);
      if (response.data.success) {
        const wards = response.data.data || [];
        setUniqueWards(wards.map(w => w.name || w.ward_name).filter(Boolean));
      }
    } catch (error) {
      console.error('Load wards error:', error);
    }
  };

  // Load patients with filters (limit to 10)
  const loadPatients = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50,
        page: 1
      };

      // ส่งเฉพาะ search ไป API, ward และ room จะ filter ฝั่ง frontend
      if (filters.search) params.search = filters.search;

      const response = await api.get('/service-registrations/patients-on-hold', { params });
      
      console.log('Patients response:', response.data);
      
      if (response.data.success) {
        let patientsData = response.data.data || [];
        
        console.log('Raw patients:', patientsData.length, patientsData.slice(0, 3));
        console.log('Raw patient FULL DATA:', JSON.stringify(patientsData[0], null, 2));
        
        // Transform data to match component structure
        const transformedPatients = patientsData.map((p, index) => {
          // Ensure unique ID - prioritize patient_id, then id, then generate unique one
          const patientId = p.patient_id || p.id || `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          // แยกชื่อจาก patient_name (เช่น "นางสมจิตต์ สรนันต์ศรี")
          let firstName = '';
          let lastName = '';
          
          if (p.patient_name) {
            const nameParts = p.patient_name.trim().split(' ');
            if (nameParts.length >= 2) {
              firstName = nameParts[0]; // คำนำหน้า + ชื่อ เช่น "นางสมจิตต์"
              lastName = nameParts.slice(1).join(' '); // นามสกุล เช่น "สรนันต์ศรี"
            } else {
              firstName = p.patient_name; // ถ้ามีแค่คำเดียว
            }
          } else {
            firstName = p.first_name || p.firstName || '';
            lastName = p.last_name || p.lastName || '';
          }
          
          return {
            id: patientId,
            firstName: firstName,
            lastName: lastName,
            ward: p.ward || p.ward_name || '',
            room: p.room || p.room_number || '',
            age: p.age || 0,
            gender: p.gender || '',
            hn: p.hn || '',
            service_number: p.service_number || '',
            patient_name: p.patient_name || '',
            ...p,
            // Override important fields to make sure they're not overwritten
            id: patientId,
            firstName: firstName,
            lastName: lastName
          };
        });
        
        console.log('Transformed patients:', transformedPatients.slice(0, 3));
        
        // Remove duplicates based on ID (more strict checking)
        let uniquePatients = transformedPatients.filter((patient, index, self) => {
          // Check if patient has valid ID
          if (!patient.id) return false;
          
          // Find first occurrence with same ID
          return index === self.findIndex((p) => {
            // Compare IDs strictly
            return p.id === patient.id;
          });
        });
        
        // Filter by ward and room in frontend
        if (filters.ward) {
          uniquePatients = uniquePatients.filter(p => p.ward === filters.ward);
        }
        if (filters.room) {
          uniquePatients = uniquePatients.filter(p => p.room === filters.room);
        }
        
        // จำกัดแค่ 10 คนแรก
        uniquePatients = uniquePatients.slice(0, 10);
        
        console.log('Unique patients (10):', uniquePatients);
        console.log('Patient IDs:', uniquePatients.map(p => ({ id: p.id, name: `${p.firstName} ${p.lastName}`, room: p.room })));
        
        setPatients(uniquePatients);
        
        // Extract unique wards and rooms from ALL patient data (before filtering)
        const allTransformed = transformedPatients.filter((patient, index, self) =>
          index === self.findIndex((p) => p.id === patient.id)
        );
        
        const wards = [...new Set(allTransformed.map(p => p.ward).filter(Boolean))];
        setUniqueWards(wards.sort());
        
        if (filters.ward) {
          const rooms = [...new Set(
            allTransformed
              .filter(p => p.ward === filters.ward)
              .map(p => p.room)
              .filter(Boolean)
          )];
          setUniqueRooms(rooms.sort());
        } else {
          const rooms = [...new Set(allTransformed.map(p => p.room).filter(Boolean))];
          setUniqueRooms(rooms.sort());
        }
        
        // Auto-select first patient
        if (uniquePatients.length > 0 && !selectedPatient) {
          setSelectedPatient(uniquePatients[0].id);
        }
      }
    } catch (error) {
      console.error('Load patients error:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Clear room when ward changes
  useEffect(() => {
    if (filters.ward) {
      // ล้าง room เมื่อเปลี่ยน ward
      setFilters(prev => ({ ...prev, room: '' }));
    }
  }, [filters.ward]);

  // Reload patients when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients();
    }, 300); // debounce
    
    return () => clearTimeout(timer);
  }, [filters.ward, filters.room, filters.search]);

  // Track window size for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter patients (already limited from API)
  const filteredPatients = patients;

  // Get patient medications
  const getPatientMedications = (patientId) => {
    return patientMeds.filter(pm => pm.patientId === patientId);
  };

  // Get transaction history
  const getTransactionHistory = (patientMedicationId) => {
    return transactions.filter(t => t.patientMedicationId === patientMedicationId);
  };

  // Calculate stock
  const calculateStock = (patientMedicationId) => {
    const pm = patientMeds.find(m => m.id === patientMedicationId);
    if (!pm) return 0;

    const trans = transactions.filter(t => t.patientMedicationId === patientMedicationId);
    let stock = pm.initialStock;

    trans.forEach(t => {
      if (t.transactionType === 'DISPENSE') {
        stock -= t.quantity;
      } else if (t.transactionType === 'RETURN') {
        stock += t.quantity;
      }
    });

    return Math.max(0, stock);
  };

  // Determine stock status
  const getStockStatus = (current, initial) => {
    const percentage = (current / initial) * 100;
    if (percentage >= 75) return 'OK';
    if (percentage >= 50) return 'LOW';
    if (percentage >= 25) return 'CRITICAL';
    return 'OUT_OF_STOCK';
  };

  // Handle edit medicine ← NEW
  const handleEditMedicine = (medicineId) => {
    const med = patientMeds.find(m => m.id === medicineId);
    console.log('Editing medicine:', med);
    setEditingMedicine(med);
    setShowModal('add');
  };

  // Handle dispense
  const handleDispense = (quantity, notes) => {
    if (!selectedPatient || !selectedMedicine) return;

    const newTransaction = {
      id: `trans-${Date.now()}`,
      patientMedicationId: selectedMedicine,
      patientId: selectedPatient,
      medicationId: patientMeds.find(m => m.id === selectedMedicine)?.medicationId,
      transactionType: 'DISPENSE',
      quantity: parseInt(quantity),
      transactionTime: new Date().toISOString(),
      performedByName: 'Current User',
      reason: null,
      notes,
      stockBefore: calculateStock(selectedMedicine),
      stockAfter: calculateStock(selectedMedicine) - parseInt(quantity),
      createdAt: new Date().toISOString()
    };

    setTransactions([...transactions, newTransaction]);
    setShowModal(null);
  };

  // Handle return
  const handleReturn = (quantity, reason, notes) => {
    if (!selectedPatient || !selectedMedicine) return;

    const newTransaction = {
      id: `trans-${Date.now()}`,
      patientMedicationId: selectedMedicine,
      patientId: selectedPatient,
      medicationId: patientMeds.find(m => m.id === selectedMedicine)?.medicationId,
      transactionType: 'RETURN',
      quantity: parseInt(quantity),
      transactionTime: new Date().toISOString(),
      performedByName: 'Current User',
      reason,
      notes,
      stockBefore: calculateStock(selectedMedicine),
      stockAfter: calculateStock(selectedMedicine) + parseInt(quantity),
      createdAt: new Date().toISOString()
    };

    setTransactions([...transactions, newTransaction]);
    setShowModal(null);
  };

  // Handle add/edit medicine ← UPDATED
  const handleAddMedicine = (medicineData) => {
    if (!selectedPatient) return;

    if (editingMedicine) {
      // UPDATE existing medicine
      console.log('Updating medicine:', editingMedicine.id, medicineData);
      const updatedMeds = patientMeds.map(med => {
        if (med.id === editingMedicine.id) {
          return {
            ...med,
            medication_name: medicineData.medication_name,
            generic_name: medicineData.generic_name,
            trade_name: medicineData.trade_name,
            dosage: medicineData.dosage,
            route: medicineData.route,
            dosage_instruction: medicineData.dosage_instruction,
            frequency: medicineData.frequency,
            timing: medicineData.timing,
            quantity: medicineData.quantity,
            expiry_date: medicineData.expiry_date,
            lot_number: medicineData.lot_number,
            status: medicineData.status,
            special_instruction: medicineData.special_instruction,
            has_changes: medicineData.has_changes,
            adjusted_dosage: medicineData.adjusted_dosage,
            change_reason: medicineData.change_reason,
            is_external: medicineData.is_external,
            external_hospital: medicineData.external_hospital,
            updatedAt: new Date().toISOString()
          };
        }
        return med;
      });
      setPatientMeds(updatedMeds);
      setEditingMedicine(null);
    } else {
      // CREATE new medicine
      console.log('Adding new medicine:', medicineData);
      const newPatientMed = {
        id: `pm-${Date.now()}`,
        patientId: selectedPatient,
        medicationId: `med-${Date.now()}`,
        doctorOrder: medicineData.doctorOrder,
        prescribedDate: medicineData.prescribedDate,
        initialStock: parseInt(medicineData.quantity || 0),
        currentStock: parseInt(medicineData.quantity || 0),
        status: medicineData.status,
        createdAt: new Date().toISOString(),
        ...medicineData
      };

      setPatientMeds([...patientMeds, newPatientMed]);
    }
    setShowModal(null);
  };

  // Handle delete medicine ← NEW (optional)
  const handleDeleteMedicine = (medicineId) => {
    console.log('Deleting medicine:', medicineId);
    const filtered = patientMeds.filter(med => med.id !== medicineId);
    setPatientMeds(filtered);
  };

  // Handle export
  const handleExport = (format) => {
    console.log(`Export as ${format}`);
    // Implement export logic
  };

  const currentPatient = patients.find(p => p.id === selectedPatient);
  const currentPatientMeds = selectedPatient ? getPatientMedications(selectedPatient) : [];

  // Handle patient selection on mobile - hide list, show detail
  const handleSelectPatientMobile = (patientId) => {
    setSelectedPatient(patientId);
    // On mobile: hide list and show detail
    if (windowWidth < 1024) {
      setShowPatientList(false);
    }
  };

  // On desktop: always show both panels
  const isMobile = windowWidth < 1024;
  const shouldShowPatientList = isMobile ? showPatientList : true;
  const shouldShowDetail = isMobile ? !showPatientList && selectedPatient : true;

  return (
    <div className="drug-inventory-container min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="drug-inventory-header sticky top-0 z-20">
        <div className="header-content">
          <div className="header-title flex-1">
            <h1>💊 คลังยา</h1>
            <p>จัดการยาและติดตามผู้ป่วย</p>
          </div>
          <div className="header-actions">
            <button
              onClick={() => handleExport('pdf')}
              className="btn btn-primary no-print"
              title="Export as PDF"
            >
              <Download size={16} /> 
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="btn btn-success no-print"
              title="Export as Excel"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Excel</span>
            </button>
          </div>
        </div>

        {/* FILTER SECTION */}
        <FilterSection
          filters={filters}
          setFilters={setFilters}
          uniqueWards={uniqueWards}
          uniqueRooms={uniqueRooms}
        />
      </div>

      {/* MOBILE TOGGLE PANEL (only on mobile) */}
      {isMobile && (
        <div className="mobile-panel-toggle no-print">
          <button
            onClick={() => setShowPatientList(true)}
            className={`btn flex-1 ${showPatientList ? 'btn-primary' : 'btn-secondary'}`}
          >
            👥 ผู้ป่วย
          </button>
          <button
            onClick={() => setShowPatientList(false)}
            className={`btn flex-1 ${!showPatientList ? 'btn-primary' : 'btn-secondary'}`}
            disabled={!selectedPatient}
          >
            💊 ยา
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="main-content">
        {/* LEFT PANEL - PATIENT LIST */}
        {shouldShowPatientList && (
          <div className="patient-list-panel">
            <PatientList
              patients={filteredPatients}
              selectedPatient={selectedPatient}
              onSelectPatient={handleSelectPatientMobile}
              loading={loading}
            />
          </div>
        )}

        {/* RIGHT PANEL - DETAIL */}
        {shouldShowDetail ? (
          <div className="detail-panel">
            <MedicationDetail
              patient={currentPatient}
              medications={currentPatientMeds}
              onDispense={() => setShowModal('dispense')}
              onReturn={() => setShowModal('return')}
              onAddMedicine={() => setShowModal('add')}
              onSelectMedicine={setSelectedMedicine}
              onEditMedicine={handleEditMedicine}  // ← PASS HERE
              onDeleteMedicine={handleDeleteMedicine}  // ← PASS HERE
              selectedMedicine={selectedMedicine}
              calculateStock={calculateStock}
              getTransactionHistory={getTransactionHistory}
              getStockStatus={getStockStatus}
            />
          </div>
        ) : (
          !shouldShowPatientList && (
            <div className="detail-panel flex items-center justify-center min-h-60">
              <div className="empty-state">
                <div className="empty-state-icon">👤</div>
                <div className="empty-state-title">เลือกผู้ป่วย</div>
                <div className="empty-state-text">เลือกผู้ป่วยจากรายการเพื่อดูรายละเอียด</div>
              </div>
            </div>
          )
        )}
      </div>

      {/* MODALS */}
      {showModal === 'add' && (
        <AddMedicineModal
          editingMedicine={editingMedicine}  // ← PASS HERE
          onClose={() => {
            setShowModal(null);
            setEditingMedicine(null);
          }}
          onSave={handleAddMedicine}
        />
      )}

      {showModal === 'dispense' && selectedMedicine && (
        <DispenseModal
          medicine={patientMeds.find(m => m.id === selectedMedicine)}
          currentStock={calculateStock(selectedMedicine)}
          onClose={() => setShowModal(null)}
          onDispense={handleDispense}
        />
      )}

      {showModal === 'return' && selectedMedicine && (
        <ReturnModal
          medicine={patientMeds.find(m => m.id === selectedMedicine)}
          onClose={() => setShowModal(null)}
          onReturn={handleReturn}
        />
      )}
    </div>
  );
}

export default DrugInventoryPage;