import React from 'react';
import { Users } from 'lucide-react';

function PatientList({ patients, selectedPatient, onSelectPatient, loading }) {
  return (
    <div className="w-1/3 bg-white rounded-lg shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Users size={20} className="text-blue-600" />
          รายชื่อผู้ป่วย ({patients.length})
        </h2>
      </div>

      {/* CONTENT */}
      <div className="overflow-y-auto max-h-96">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            <p>กำลังโหลด...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p>ไม่พบผู้ป่วยในเงื่อนไขที่ระบุ</p>
          </div>
        ) : (
          patients.map(patient => (
            <div
              key={patient.id}
              onClick={() => onSelectPatient(patient.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition ${
                selectedPatient === patient.id 
                  ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                  : 'hover:bg-gray-50 active:bg-blue-50'
              }`}
            >
              <p className="font-semibold text-gray-900">{patient.firstName} {patient.lastName}</p>
              <p className="text-sm text-gray-600 mt-1">
                🏠 {patient.room} | 🏢 {patient.ward} | 👶 {patient.age} ปี
              </p>
              <p className="text-xs text-gray-400 mt-1">ID: {patient.patientId}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PatientList;
