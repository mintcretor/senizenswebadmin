import React, { useState, useEffect } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import PatientList from '../components/DrugInventory/PatientList';
import MedicationDetail from '../components/DrugInventory/MedicationDetail';
import FilterSection from '../components/DrugInventory/FilterSection';
import DispenseModal from '../components/DrugInventory/DispenseModal';
import ReturnModal from '../components/DrugInventory/ReturnModal';
import AddMedicineModal from '../components/DrugInventory/AddMedicineModal';
import { mockPatients, mockMedications, mockPatientMedications, mockTransactions } from './mockData';
import './DrugInventory.css';

function DrugInventoryPage() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filters, setFilters] = useState({
    room: '',
    ward: '',
    search: ''
  });
  const [showModal, setShowModal] = useState(null); // 'add', 'dispense', 'return'
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [patients, setPatients] = useState(mockPatients);
  const [medications, setMedications] = useState(mockMedications);
  const [patientMeds, setPatientMeds] = useState(mockPatientMedications);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [loading, setLoading] = useState(false);

  // Filter patients
  const filteredPatients = patients.filter(p =>
    (!filters.room || p.room === filters.room) &&
    (!filters.ward || p.ward === filters.ward) &&
    (!filters.search || p.firstName.includes(filters.search) || p.lastName.includes(filters.search))
  );

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
      performedByName: 'Current User', // Replace with actual user
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
      performedByName: 'Current User', // Replace with actual user
      reason,
      notes,
      stockBefore: calculateStock(selectedMedicine),
      stockAfter: calculateStock(selectedMedicine) + parseInt(quantity),
      createdAt: new Date().toISOString()
    };

    setTransactions([...transactions, newTransaction]);
    setShowModal(null);
  };

  // Handle add medicine
  const handleAddMedicine = (medicineData) => {
    if (!selectedPatient) return;

    const newPatientMed = {
      id: `pm-${Date.now()}`,
      patientId: selectedPatient,
      medicationId: `med-${Date.now()}`,
      doctorOrder: medicineData.doctorOrder,
      prescribedDate: medicineData.prescribedDate,
      startDate: medicineData.startDate,
      endDate: medicineData.endDate,
      initialStock: parseInt(medicineData.initialStock),
      currentStock: parseInt(medicineData.initialStock),
      status: 'Active',
      notes: medicineData.notes,
      createdAt: new Date().toISOString()
    };

    // Add new medication to list
    const newMedicine = {
      id: newPatientMed.medicationId,
      medicineCode: `MED-${Date.now()}`,
      medicineName: medicineData.medicineName,
      dose: medicineData.dose,
      unit: medicineData.unit,
      manufacturer: 'TBD',
      batchNumber: 'TBD',
      expiryDate: medicineData.expiryDate,
      storageLocation: 'ชั้นปกติ'
    };

    setMedications([...medications, newMedicine]);
    setPatientMeds([...patientMeds, newPatientMed]);
    setShowModal(null);
  };

  // Handle export
  const handleExport = (format) => {
    console.log(`Export as ${format}`);
    // Implement export logic
  };

  // Get unique rooms and wards for filters
  const uniqueRooms = [...new Set(patients.map(p => p.room))].sort();
  const uniqueWards = [...new Set(patients.map(p => p.ward))].sort();

  const currentPatient = patients.find(p => p.id === selectedPatient);
  const currentPatientMeds = selectedPatient ? getPatientMedications(selectedPatient) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🏥 คลังยา</h1>
            <p className="text-gray-600 mt-1">จัดการยาและติดตามสต็อกผู้ป่วย</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium transition"
            >
              <Download size={18} /> Export PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium transition"
            >
              <Download size={18} /> Export Excel
            </button>
          </div>

        </div>
        {/* FILTER SECTION */}
        <FilterSection
          filters={filters}
          setFilters={setFilters}
          uniqueRooms={uniqueRooms}
          uniqueWards={uniqueWards}
        />
      </div>



      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto p-6 flex gap-6">

        {/* LEFT PANEL - PATIENT LIST */}
        <PatientList
          patients={filteredPatients}
          selectedPatient={selectedPatient}
          onSelectPatient={setSelectedPatient}
          loading={loading}
        />

        {/* RIGHT PANEL - DETAIL */}
        <MedicationDetail
          patient={currentPatient}
          medications={currentPatientMeds}
          onDispense={() => setShowModal('dispense')}
          onReturn={() => setShowModal('return')}
          onAddMedicine={() => setShowModal('add')}
          onSelectMedicine={setSelectedMedicine}
          selectedMedicine={selectedMedicine}
          calculateStock={calculateStock}
          getTransactionHistory={getTransactionHistory}
          getStockStatus={getStockStatus}
        />
      </div>

      {/* MODALS */}
      {showModal === 'add' && (
        <AddMedicineModal
          onClose={() => setShowModal(null)}
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
