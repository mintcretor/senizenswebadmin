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
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [patients, setPatients] = useState([]);
  const [medications, setMedications] = useState([]);
  const [patientMeds, setPatientMeds] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPatientList, setShowPatientList] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [uniqueWards, setUniqueWards] = useState([]);
  const [uniqueRooms, setUniqueRooms] = useState([]);
  const [saveError, setSaveError] = useState('');

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      
      const patient = patients.find(p => p.id === patientId);
      if (!patient || !patient.service_registration_id) {
        console.log('No service_registration_id found for patient:', patientId);
        setPatientMeds([]);
        return;
      }
      
      const serviceRegId = patient.service_registration_id;
      console.log('Loading medications for service_registration_id:', serviceRegId);
      
      const response = await api.get(`/medication-reconciliation/${serviceRegId}`);
      
      console.log('Medications response:', response.data);
      
      if (response.data.success && response.data.data) {
        const reconData = response.data.data;
        const medications = reconData.medications || [];
        
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
          unit: 'เม็ด',
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
          currentStock: med.quantity || 0,
          imageUrl: med.image_url,
          notes: med.dosage_instruction || '',
          prescribedDate: reconData.reconciliation_date,
          ...med
        }));
        
        console.log('Transformed medications:', transformedMeds);
        setPatientMeds(transformedMeds);
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

  // Load patients with filters
  const loadPatients = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50,
        page: 1
      };

      if (filters.search) params.search = filters.search;

      const response = await api.get('/service-registrations/patients-on-hold', { params });
      
      console.log('Patients response:', response.data);
      
      if (response.data.success) {
        let patientsData = response.data.data || [];
        
        console.log('Raw patients:', patientsData.length, patientsData.slice(0, 3));
        console.log('Raw patient FULL DATA:', JSON.stringify(patientsData[0], null, 2));
        
        const transformedPatients = patientsData.map((p, index) => {
          const patientId = p.patient_id || p.id || `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          let firstName = '';
          let lastName = '';
          
          if (p.patient_name) {
            const nameParts = p.patient_name.trim().split(' ');
            if (nameParts.length >= 2) {
              firstName = nameParts[0];
              lastName = nameParts.slice(1).join(' ');
            } else {
              firstName = p.patient_name;
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
            id: patientId,
            firstName: firstName,
            lastName: lastName
          };
        });
        
        console.log('Transformed patients:', transformedPatients.slice(0, 3));
        
        let uniquePatients = transformedPatients.filter((patient, index, self) => {
          if (!patient.id) return false;
          
          return index === self.findIndex((p) => {
            return p.id === patient.id;
          });
        });
        
        if (filters.ward) {
          uniquePatients = uniquePatients.filter(p => p.ward === filters.ward);
        }
        if (filters.room) {
          uniquePatients = uniquePatients.filter(p => p.room === filters.room);
        }
        
        setPatients(uniquePatients);
        setLoading(false);
        
        const wards = [...new Set(uniquePatients.map(p => p.ward).filter(Boolean))];
        const rooms = [...new Set(uniquePatients.map(p => p.room).filter(Boolean))];
        
        setUniqueWards(wards);
        setUniqueRooms(rooms);
        
      } else {
        setPatients([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Load patients error:', error);
      setPatients([]);
      setLoading(false);
    }
  };

  // Handler functions
  const handleEditMedicine = (medicineId) => {
    console.log('Edit medicine:', medicineId);
    const medicine = patientMeds.find(m => m.id === medicineId);
    if (medicine) {
      setEditingMedicine(medicine);
      setShowModal('add');
    }
  };

  const filteredPatients = patients.filter(p => {
    if (filters.ward && p.ward !== filters.ward) return false;
    if (filters.room && p.room !== filters.room) return false;
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const patientName = (p.patient_name || '').toLowerCase();
      const room = (p.room || '').toString();
      
      return fullName.includes(searchLower) || 
             patientName.includes(searchLower) || 
             room.includes(filters.search);
    }
    
    return true;
  });

  const calculateStock = (medicineId) => {
    const medicine = patientMeds.find(m => m.id === medicineId);
    if (!medicine) return 0;

    let currentStock = medicine.initialStock || 0;
    
    const relevantTransactions = transactions.filter(
      t => t.medicineId === medicineId
    );

    relevantTransactions.forEach(t => {
      if (t.type === 'dispense') {
        currentStock -= parseInt(t.quantity || 0);
      } else if (t.type === 'return') {
        currentStock += parseInt(t.quantity || 0);
      }
    });

    return Math.max(0, currentStock);
  };

  const getTransactionHistory = (medicineId) => {
    return transactions.filter(t => t.medicineId === medicineId) || [];
  };

  const getStockStatus = (currentStock, initialStock) => {
    const percentage = (currentStock / initialStock) * 100;
    if (percentage === 0) return 'empty';
    if (percentage < 25) return 'critical';
    if (percentage < 50) return 'low';
    if (percentage < 75) return 'medium';
    return 'high';
  };

  const getPatientMedications = (patientId) => {
    return patientMeds.filter(m => m.patientId === patientId);
  };

  const handleDispense = (quantity, notes) => {
    console.log('Dispense:', quantity, notes);
    const transaction = {
      id: `tx-${Date.now()}`,
      medicineId: selectedMedicine,
      type: 'dispense',
      quantity,
      notes,
      timestamp: new Date().toISOString()
    };
    setTransactions([...transactions, transaction]);
    setShowModal(null);
  };

  const handleReturn = (quantity, reason, notes) => {
    console.log('Return:', quantity, reason, notes);
    const transaction = {
      id: `tx-${Date.now()}`,
      medicineId: selectedMedicine,
      type: 'return',
      quantity,
      reason,
      notes,
      timestamp: new Date().toISOString()
    };
    setTransactions([...transactions, transaction]);
    setShowModal(null);
  };

  // Handle Add/Edit Medicine with API
  const handleAddMedicine = async (medicineData) => {
    setSaveError('');
    
    if (editingMedicine) {
      try {
        console.log('Updating medicine:', editingMedicine.id, medicineData);
        
        const payload = {
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
        };

        const response = await api.put(
          `/medication-reconciliation/${editingMedicine.id}`,
          payload
        );

        if (response.data.success) {
          const updatedMeds = patientMeds.map(med => {
            if (med.id === editingMedicine.id) {
              return {
                ...med,
                ...medicineData,
                updatedAt: new Date().toISOString()
              };
            }
            return med;
          });
          setPatientMeds(updatedMeds);
          setEditingMedicine(null);
          setShowModal(null);
        }
      } catch (error) {
        console.error('Update medicine error:', error);
        setSaveError('เกิดข้อผิดพลาดในการบันทึกยา: ' + (error.response?.data?.message || error.message));
        
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
        setShowModal(null);
      }
    } else {
      try {
        console.log('Adding new medicine:', medicineData);
        
        const currentPatient = patients.find(p => p.id === selectedPatient);
        if (!currentPatient?.service_registration_id) {
          setSaveError('ไม่พบข้อมูลผู้ป่วย');
          return;
        }

        const fullPayload = {
          service_registration_id: currentPatient.service_registration_id || currentPatient.id,
          patient_id: currentPatient.patient_id,
          patient_name: currentPatient.patient_name,
          ward_name: currentPatient.ward_name || currentPatient.ward,
          room_number: currentPatient.room_number || currentPatient.room,
          reconciled_by: 1,
          notes: '',
          medications: [{
            medicine_id: medicineData.id || null,
            medicationName: medicineData.medication_name,
            genericName: medicineData.generic_name,
            tradeName: medicineData.trade_name,
            dosage: medicineData.dosage,
            route: medicineData.route,
            dosageInstruction: medicineData.dosage_instruction,
            frequency: medicineData.frequency,
            timing: medicineData.timing,
            scheduleTime: '',
            scheduleTimeDisplay: '',
            quantity: medicineData.quantity,
            lastDose: medicineData.last_dose || '',
            expiryDate: medicineData.expiry_date,
            lotNumber: medicineData.lot_number,
            isExternal: medicineData.is_external,
            externalHospital: medicineData.external_hospital,
            status: medicineData.status || 'continue_same',
            adjustedDosage: medicineData.adjusted_dosage,
            hasChanges: medicineData.has_changes,
            changeReason: medicineData.change_reason,
            specialInstruction: medicineData.special_instruction,
            imageUrl: medicineData.image_url,
          }]
        };

        console.log('Sending payload to API:', fullPayload);

        const response = await api.post('/medication-reconciliation', fullPayload);

        if (response.data.success) {
          const newMed = {
            id: response.data.data?.id || `pm-${Date.now()}`,
            patientId: selectedPatient,
            medicationId: response.data.data?.medicine_id || `med-${Date.now()}`,
            doctorOrder: medicineData.doctorOrder,
            prescribedDate: new Date().toISOString(),
            initialStock: parseInt(medicineData.quantity || 0),
            currentStock: parseInt(medicineData.quantity || 0),
            status: medicineData.status,
            createdAt: new Date().toISOString(),
            ...medicineData
          };
          
          setPatientMeds([...patientMeds, newMed]);
          setShowModal(null);
        }
      } catch (error) {
        console.error('Add medicine error:', error);
        setSaveError('เกิดข้อผิดพลาดในการบันทึกยา: ' + (error.response?.data?.message || error.message));
        
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
        setShowModal(null);
      }
    }
  };

  // Handle delete medicine
  const handleDeleteMedicine = (medicineId) => {
    console.log('Deleting medicine:', medicineId);
    const filtered = patientMeds.filter(med => med.id !== medicineId);
    setPatientMeds(filtered);
  };

  // Handle export
  const handleExport = (format) => {
    console.log(`Export as ${format}`);
  };

  const currentPatient = patients.find(p => p.id === selectedPatient);
  const currentPatientMeds = selectedPatient ? getPatientMedications(selectedPatient) : [];

  // Handle patient selection on mobile
  const handleSelectPatientMobile = (patientId) => {
    setSelectedPatient(patientId);
    if (windowWidth < 1024) {
      setShowPatientList(false);
    }
  };

  // Responsive logic - Mobile แสดงแบบ stacked ทั้งหมด
  const isMobile = windowWidth < 1024;
  const shouldShowPatientList = isMobile ? showPatientList : true;
  const shouldShowDetail = isMobile ? !showPatientList && selectedPatient : selectedPatient || !isMobile;

  return (
    <div className="drug-inventory-container">
      {/* ERROR NOTIFICATION */}
      {saveError && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{saveError}</span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="drug-inventory-header">
        <div className="header-content">
          <div className="header-title">
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

      {/* MOBILE TOGGLE PANEL */}
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
              onEditMedicine={handleEditMedicine}
              onDeleteMedicine={handleDeleteMedicine}
              selectedMedicine={selectedMedicine}
              calculateStock={calculateStock}
              getTransactionHistory={getTransactionHistory}
              getStockStatus={getStockStatus}
            />
          </div>
        ) : (
          !shouldShowPatientList && (
            <div className="detail-panel flex items-center justify-center">
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
          editingMedicine={editingMedicine}
          onClose={() => {
            setShowModal(null);
            setEditingMedicine(null);
            setSaveError('');
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