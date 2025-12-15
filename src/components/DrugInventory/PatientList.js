import React, { useState } from 'react';
import { Search, ChevronRight, AlertCircle } from 'lucide-react';

/**
 * PatientList Component - Mobile Optimized
 * แสดงรายชื่อผู้ป่วยแบบเนี่ยบพร้อม search filter
 */
function PatientList({
  patients = [],
  selectedPatient = null,
  onSelectPatient = () => {},
  loading = false
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter patients by search
  const filteredPatients = patients.filter(p => {
    const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
    const patientName = (p.patient_name || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const room = (p.room || '').toString();
    
    return fullName.includes(searchLower) ||
           patientName.includes(searchLower) ||
           room.includes(searchTerm);
  });

  if (loading) {
    return (
      <div className="card h-full">
        <div className="card-body space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card h-full overflow-hidden flex flex-col">
      {/* Search Input */}
      <div className="card-body pb-0">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="ค้นหาชื่อหรือห้อง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-9 w-full text-sm"
          />
        </div>
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto">
        {filteredPatients.length === 0 ? (
          <div className="empty-state py-8">
            <div className="empty-state-icon text-3xl">👥</div>
            <div className="empty-state-title">ไม่พบผู้ป่วย</div>
            <div className="empty-state-text text-xs">
              {searchTerm ? 'ค้นหาไม่พบผู้ป่วยที่ตรงกัน' : 'ไม่มีผู้ป่วยในรายการ'}
            </div>
          </div>
        ) : (
          <div>
            {filteredPatients.map((patient) => {
              // รองรับทั้ง firstName/lastName และ patient_name
              const displayName = patient.patient_name || 
                                `${patient.firstName || ''} ${patient.lastName || ''}`.trim() ||
                                'ไม่ระบุชื่อ';
              
              return (
                <div
                  key={patient.id}
                  onClick={() => onSelectPatient(patient.id)}
                  className={`list-item cursor-pointer transition-colors ${
                    selectedPatient === patient.id 
                      ? 'active bg-blue-50 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900">
                      {displayName}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      🏥 {patient.ward || 'ไม่ระบุชั้น'} - ห้อง {patient.room || 'ไม่ระบุ'}
                    </div>
                    
                    {/* HN Number */}
                    {patient.hn && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        HN: {patient.hn}
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    {patient.status === 'Critical' && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle size={12} className="text-red-500" />
                        <span className="text-xs text-red-600 font-medium">วิกฤต</span>
                      </div>
                    )}
                  </div>

                  {/* Chevron for Desktop */}
                  <ChevronRight
                    size={18}
                    className="text-gray-400 flex-shrink-0 ml-2 hidden sm:block"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="card-footer bg-gray-50 border-t text-xs text-gray-600">
        <div className="flex justify-between items-center">
          <span>ทั้งหมด: {filteredPatients.length} / {patients.length}</span>
          {filteredPatients.length === 0 && patients.length > 0 && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-blue-500 hover:text-blue-600 font-medium text-xs"
            >
              ล้าง
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientList;