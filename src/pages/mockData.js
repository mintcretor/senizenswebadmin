// MOCK DATA - Drug Inventory System

// ================================
// 1️⃣ PATIENTS
// ================================
export const mockPatients = [
  {
    id: 'pat-001',
    firstName: 'สมใจ',
    lastName: 'ใจสมดี',
    patientId: 'PAT001',
    dateOfBirth: '1959-03-15',
    age: 65,
    gender: 'F',
    room: '101',
    ward: 'A',
    admitDate: '2024-11-01T10:00:00Z',
    dischargeDate: null,
    status: 'Admitted',
    phone: '0812345678',
    emergencyContact: 'นางสาว ข. งาม'
  },
  {
    id: 'pat-002',
    firstName: 'ประสิทธิ์',
    lastName: 'ดีงาม',
    patientId: 'PAT002',
    dateOfBirth: '1972-06-20',
    age: 52,
    gender: 'M',
    room: '102',
    ward: 'B',
    admitDate: '2024-10-28T08:30:00Z',
    dischargeDate: null,
    status: 'Admitted',
    phone: '0898765432',
    emergencyContact: 'นาง พ. เพื่อน'
  },
  {
    id: 'pat-003',
    firstName: 'เนาวลักษณ์',
    lastName: 'สม',
    patientId: 'PAT003',
    dateOfBirth: '1985-12-08',
    age: 38,
    gender: 'F',
    room: '103',
    ward: 'A',
    admitDate: '2024-11-02T14:15:00Z',
    dischargeDate: null,
    status: 'Admitted',
    phone: '0856789012',
    emergencyContact: 'นาย ก. ใจดี'
  },
  {
    id: 'pat-004',
    firstName: 'วิชัย',
    lastName: 'กำลังเดิน',
    patientId: 'PAT004',
    dateOfBirth: '1960-01-01',
    age: 64,
    gender: 'M',
    room: '201',
    ward: 'C',
    admitDate: '2024-10-25T09:00:00Z',
    dischargeDate: null,
    status: 'Admitted',
    phone: '0834567890',
    emergencyContact: 'นางสาว พ. สุข'
  },
  {
    id: 'pat-005',
    firstName: 'สระวี',
    lastName: 'แสงสว่าง',
    patientId: 'PAT005',
    dateOfBirth: '1978-07-12',
    age: 46,
    gender: 'F',
    room: '301',
    ward: 'D',
    admitDate: '2024-11-01T16:45:00Z',
    dischargeDate: null,
    status: 'Admitted',
    phone: '0823456789',
    emergencyContact: 'นาย อ. อุดม'
  }
];

// ================================
// 2️⃣ MEDICATIONS (Master List)
// ================================
export const mockMedications = [
  {
    id: 'med-001',
    medicineCode: 'MED-PARA-500',
    medicineName: 'Paracetamol',
    dose: '500mg',
    unit: 'เม็ด',
    manufacturer: 'Thai Pharma Co.',
    batchNumber: 'B20240801',
    expiryDate: '2025-08-01',
    storageLocation: 'ชั้นปกติ-A'
  },
  {
    id: 'med-002',
    medicineCode: 'MED-AMX-250',
    medicineName: 'Amoxicillin',
    dose: '250mg',
    unit: 'แคปซูล',
    manufacturer: 'Global Pharma',
    batchNumber: 'B20240615',
    expiryDate: '2025-06-15',
    storageLocation: 'ชั้นปกติ-B'
  },
  {
    id: 'med-003',
    medicineCode: 'MED-IBUPROFEN-400',
    medicineName: 'Ibuprofen',
    dose: '400mg',
    unit: 'เม็ด',
    manufacturer: 'Thai Pharma Co.',
    batchNumber: 'B20240920',
    expiryDate: '2025-09-20',
    storageLocation: 'ชั้นปกติ-C'
  },
  {
    id: 'med-004',
    medicineCode: 'MED-OMEPRAZOLE-20',
    medicineName: 'Omeprazole',
    dose: '20mg',
    unit: 'แคปซูล',
    manufacturer: 'International Pharma',
    batchNumber: 'B20240705',
    expiryDate: '2025-07-05',
    storageLocation: 'ตู้เย็น-1'
  },
  {
    id: 'med-005',
    medicineCode: 'MED-METFORMIN-500',
    medicineName: 'Metformin',
    dose: '500mg',
    unit: 'เม็ด',
    manufacturer: 'Diabetes Care Ltd.',
    batchNumber: 'B20240810',
    expiryDate: '2025-08-10',
    storageLocation: 'ชั้นปกติ-D'
  },
  {
    id: 'med-006',
    medicineCode: 'MED-LISINOPRIL-5',
    medicineName: 'Lisinopril',
    dose: '5mg',
    unit: 'เม็ด',
    manufacturer: 'Cardio Pharma',
    batchNumber: 'B20240912',
    expiryDate: '2025-09-12',
    storageLocation: 'ชั้นปกติ-E'
  }
];

// ================================
// 3️⃣ PATIENT MEDICATIONS (Prescriptions)
// ================================
export const mockPatientMedications = [
  // Patient 1: สมใจ (Room 101, Ward A)
  {
    id: 'pm-001',
    patientId: 'pat-001',
    medicationId: 'med-001',
    doctorOrder: '3 ครั้ง/วัน หลังอาหาร',
    prescribedDate: '2024-11-01',
    startDate: '2024-11-01',
    endDate: '2024-11-07',
    initialStock: 30,
    currentStock: 24,
    status: 'Active',
    notes: 'ยาแก้ปวด',
    unit: 'เม็ด',
    createdAt: '2024-11-01T10:30:00Z'
  },
  {
    id: 'pm-002',
    patientId: 'pat-001',
    medicationId: 'med-002',
    doctorOrder: '2 ครั้ง/วัน หลังอาหาร',
    prescribedDate: '2024-11-01',
    startDate: '2024-11-01',
    endDate: '2024-11-08',
    initialStock: 20,
    currentStock: 16,
    status: 'Active',
    notes: 'ยาปฏิชีวนะ',
    unit: 'แคปซูล',
    createdAt: '2024-11-01T10:30:00Z'
  },
  {
    id: 'pm-003',
    patientId: 'pat-001',
    medicationId: 'med-004',
    doctorOrder: '1 ครั้ง/วัน ก่อนนอน',
    prescribedDate: '2024-11-01',
    startDate: '2024-11-01',
    endDate: '2024-11-30',
    initialStock: 15,
    currentStock: 12,
    status: 'Active',
    notes: 'ยาลดกรด',
    unit: 'แคปซูล',
    createdAt: '2024-11-01T10:30:00Z'
  },

  // Patient 2: ประสิทธิ์ (Room 102, Ward B)
  {
    id: 'pm-004',
    patientId: 'pat-002',
    medicationId: 'med-003',
    doctorOrder: '2 ครั้ง/วัน หลังอาหาร',
    prescribedDate: '2024-10-28',
    startDate: '2024-10-28',
    endDate: '2024-11-10',
    initialStock: 25,
    currentStock: 8,
    status: 'Active',
    notes: 'ยาลดปวด',
    unit: 'เม็ด',
    createdAt: '2024-10-28T08:45:00Z'
  },
  {
    id: 'pm-005',
    patientId: 'pat-002',
    medicationId: 'med-005',
    doctorOrder: '2 ครั้ง/วัน หลังอาหาร',
    prescribedDate: '2024-10-28',
    startDate: '2024-10-28',
    endDate: '2024-11-28',
    initialStock: 40,
    currentStock: 28,
    status: 'Active',
    notes: 'ยาเบาหวาน',
    unit: 'เม็ด',
    createdAt: '2024-10-28T08:45:00Z'
  },

  // Patient 3: เนาวลักษณ์ (Room 103, Ward A)
  {
    id: 'pm-006',
    patientId: 'pat-003',
    medicationId: 'med-001',
    doctorOrder: '2 ครั้ง/วัน หลังอาหาร',
    prescribedDate: '2024-11-02',
    startDate: '2024-11-02',
    endDate: '2024-11-09',
    initialStock: 20,
    currentStock: 19,
    status: 'Active',
    notes: 'ยาแก้ปวด',
    unit: 'เม็ด',
    createdAt: '2024-11-02T14:30:00Z'
  },
  {
    id: 'pm-007',
    patientId: 'pat-003',
    medicationId: 'med-006',
    doctorOrder: '1 ครั้ง/วัน เช้า',
    prescribedDate: '2024-11-02',
    startDate: '2024-11-02',
    endDate: '2024-12-02',
    initialStock: 30,
    currentStock: 29,
    status: 'Active',
    notes: 'ยาความดันโลหิต',
    unit: 'เม็ด',
    createdAt: '2024-11-02T14:30:00Z'
  }
];

// ================================
// 4️⃣ MEDICATION TRANSACTIONS (History)
// ================================
export const mockTransactions = [
  // Patient 1 - Paracetamol (pm-001)
  {
    id: 'trans-001',
    patientMedicationId: 'pm-001',
    patientId: 'pat-001',
    medicationId: 'med-001',
    transactionType: 'DISPENSE',
    quantity: 3,
    transactionTime: '2024-11-01T07:00:00Z',
    performedByName: 'นาง เอ. ทำหน้าที่',
    reason: null,
    notes: 'ยาเช้า',
    stockBefore: 30,
    stockAfter: 27,
    createdAt: '2024-11-01T07:00:00Z'
  },
  {
    id: 'trans-002',
    patientMedicationId: 'pm-001',
    patientId: 'pat-001',
    medicationId: 'med-001',
    transactionType: 'DISPENSE',
    quantity: 3,
    transactionTime: '2024-11-01T12:00:00Z',
    performedByName: 'นาง ก. สวย',
    reason: null,
    notes: 'ยากลางวัน',
    stockBefore: 27,
    stockAfter: 24,
    createdAt: '2024-11-01T12:00:00Z'
  },
  {
    id: 'trans-003',
    patientMedicationId: 'pm-001',
    patientId: 'pat-001',
    medicationId: 'med-001',
    transactionType: 'DISPENSE',
    quantity: 3,
    transactionTime: '2024-11-01T20:00:00Z',
    performedByName: 'นาง เอ. ทำหน้าที่',
    reason: null,
    notes: 'ยาเย็น',
    stockBefore: 24,
    stockAfter: 21,
    createdAt: '2024-11-01T20:00:00Z'
  },
  {
    id: 'trans-004',
    patientMedicationId: 'pm-001',
    patientId: 'pat-001',
    medicationId: 'med-001',
    transactionType: 'DISPENSE',
    quantity: 3,
    transactionTime: '2024-11-02T07:00:00Z',
    performedByName: 'นาง เอ. ทำหน้าที่',
    reason: null,
    notes: 'ยาเช้า',
    stockBefore: 21,
    stockAfter: 18,
    createdAt: '2024-11-02T07:00:00Z'
  },

  // Patient 1 - Amoxicillin (pm-002)
  {
    id: 'trans-005',
    patientMedicationId: 'pm-002',
    patientId: 'pat-001',
    medicationId: 'med-002',
    transactionType: 'DISPENSE',
    quantity: 2,
    transactionTime: '2024-11-01T08:00:00Z',
    performedByName: 'นาง เอ. ทำหน้าที่',
    reason: null,
    notes: 'ยาเช้า',
    stockBefore: 20,
    stockAfter: 18,
    createdAt: '2024-11-01T08:00:00Z'
  },
  {
    id: 'trans-006',
    patientMedicationId: 'pm-002',
    patientId: 'pat-001',
    medicationId: 'med-002',
    transactionType: 'DISPENSE',
    quantity: 2,
    transactionTime: '2024-11-01T20:00:00Z',
    performedByName: 'นาง เอ. ทำหน้าที่',
    reason: null,
    notes: 'ยาเย็น',
    stockBefore: 18,
    stockAfter: 16,
    createdAt: '2024-11-01T20:00:00Z'
  },
  {
    id: 'trans-007',
    patientMedicationId: 'pm-002',
    patientId: 'pat-001',
    medicationId: 'med-002',
    transactionType: 'RETURN',
    quantity: 1,
    transactionTime: '2024-11-02T10:00:00Z',
    performedByName: 'นาง เอ. ทำหน้าที่',
    reason: 'Unused',
    notes: 'ผู้ป่วยขอคืน ยังไม่ได้ใช้',
    stockBefore: 16,
    stockAfter: 17,
    createdAt: '2024-11-02T10:00:00Z'
  },

  // Patient 2 - Ibuprofen (pm-004) - LOW STOCK
  {
    id: 'trans-008',
    patientMedicationId: 'pm-004',
    patientId: 'pat-002',
    medicationId: 'med-003',
    transactionType: 'DISPENSE',
    quantity: 2,
    transactionTime: '2024-10-28T08:30:00Z',
    performedByName: 'นาง ค. ดี',
    reason: null,
    notes: 'ยาเช้า',
    stockBefore: 25,
    stockAfter: 23,
    createdAt: '2024-10-28T08:30:00Z'
  },
  {
    id: 'trans-009',
    patientMedicationId: 'pm-004',
    patientId: 'pat-002',
    medicationId: 'med-003',
    transactionType: 'DISPENSE',
    quantity: 2,
    transactionTime: '2024-10-28T20:00:00Z',
    performedByName: 'นาง ค. ดี',
    reason: null,
    notes: 'ยาเย็น',
    stockBefore: 23,
    stockAfter: 21,
    createdAt: '2024-10-28T20:00:00Z'
  },
  {
    id: 'trans-010',
    patientMedicationId: 'pm-004',
    patientId: 'pat-002',
    medicationId: 'med-003',
    transactionType: 'DISPENSE',
    quantity: 2,
    transactionTime: '2024-10-29T08:00:00Z',
    performedByName: 'นาง ค. ดี',
    reason: null,
    notes: 'ยาเช้า',
    stockBefore: 21,
    stockAfter: 19,
    createdAt: '2024-10-29T08:00:00Z'
  },
  {
    id: 'trans-011',
    patientMedicationId: 'pm-004',
    patientId: 'pat-002',
    medicationId: 'med-003',
    transactionType: 'DISPENSE',
    quantity: 2,
    transactionTime: '2024-10-29T20:00:00Z',
    performedByName: 'นาง ค. ดี',
    reason: null,
    notes: 'ยาเย็น',
    stockBefore: 19,
    stockAfter: 17,
    createdAt: '2024-10-29T20:00:00Z'
  },
  {
    id: 'trans-012',
    patientMedicationId: 'pm-004',
    patientId: 'pat-002',
    medicationId: 'med-003',
    transactionType: 'DISPENSE',
    quantity: 2,
    transactionTime: '2024-10-30T08:00:00Z',
    performedByName: 'นาง ค. ดี',
    reason: null,
    notes: 'ยาเช้า',
    stockBefore: 17,
    stockAfter: 15,
    createdAt: '2024-10-30T08:00:00Z'
  },
  {
    id: 'trans-013',
    patientMedicationId: 'pm-004',
    patientId: 'pat-002',
    medicationId: 'med-003',
    transactionType: 'DISPENSE',
    quantity: 2,
    transactionTime: '2024-10-30T20:00:00Z',
    performedByName: 'นาง ค. ดี',
    reason: null,
    notes: 'ยาเย็น',
    stockBefore: 15,
    stockAfter: 13,
    createdAt: '2024-10-30T20:00:00Z'
  },
  {
    id: 'trans-014',
    patientMedicationId: 'pm-004',
    patientId: 'pat-002',
    medicationId: 'med-003',
    transactionType: 'DISPENSE',
    quantity: 2,
    transactionTime: '2024-10-31T08:00:00Z',
    performedByName: 'นาง ค. ดี',
    reason: null,
    notes: 'ยาเช้า',
    stockBefore: 13,
    stockAfter: 11,
    createdAt: '2024-10-31T08:00:00Z'
  },
  {
    id: 'trans-015',
    patientMedicationId: 'pm-004',
    patientId: 'pat-002',
    medicationId: 'med-003',
    transactionType: 'DISPENSE',
    quantity: 2,
    transactionTime: '2024-10-31T20:00:00Z',
    performedByName: 'นาง ค. ดี',
    reason: null,
    notes: 'ยาเย็น',
    stockBefore: 11,
    stockAfter: 9,
    createdAt: '2024-10-31T20:00:00Z'
  },
  {
    id: 'trans-016',
    patientMedicationId: 'pm-004',
    patientId: 'pat-002',
    medicationId: 'med-003',
    transactionType: 'DISPENSE',
    quantity: 1,
    transactionTime: '2024-11-01T08:00:00Z',
    performedByName: 'นาง ค. ดี',
    reason: null,
    notes: 'ยาเช้า',
    stockBefore: 9,
    stockAfter: 8,
    createdAt: '2024-11-01T08:00:00Z'
  }
];
