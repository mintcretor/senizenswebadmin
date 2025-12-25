import React, { useState, useEffect } from 'react';
import {
  Check,
  AlertCircle,
  X,
  Edit2,
  Plus,
  Calendar,
  User,
  Clock,
  MessageSquare,
  ChevronDown,
  Save,
  Eye,
  Utensils,
} from 'lucide-react';
import api from '../api/baseapi';

const MealConsumptionTracking = () => {
  const [activeTab, setActiveTab] = useState('tracking');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [patients, setPatients] = useState([]);
  const [consumptionData, setConsumptionData] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [dailySummary, setDailySummary] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState(null);
  const [expandedPatient, setExpandedPatient] = useState(null);

  const [formData, setFormData] = useState({
    mealType: '',
    consumptionStatus: 'not_eaten',
    notes: '',
    changeReason: '',
    requestMenuChange: false,
  });

  const mealTypes = [
    { value: 'breakfast', label: 'มื้อเช้า', icon: '🌅' },
    { value: 'lunch', label: 'มื้อกลางวัน', icon: '☀️' },
    { value: 'dinner', label: 'มื้อเย็น', icon: '🌙' },
    { value: 'snack', label: 'มื้อว่าง', icon: '🍪' },
  ];

  const consumptionStatusOptions = [
    { value: 'eaten', label: 'ทานหมด', icon: '✅', color: 'bg-green-100 text-green-800' },
    { value: 'partially_eaten', label: 'ทานไม่หมด', icon: '⚠️', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'not_eaten', label: 'ไม่ได้ทาน', icon: '❌', color: 'bg-red-100 text-red-800' },
  ];

  useEffect(() => {
    fetchPatients();
    fetchConsumptionData();
    fetchChangeRequests();
    fetchDailySummary();
  }, [selectedDate]);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      if (response.status === 200 || response.status === 201) {
        const data = await Promise.resolve(response.data);
        setPatients(data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([
        { id: 1, name: 'นายสมชาย จันทร์', hn: 'HN001' },
        { id: 2, name: 'นางสาวรัตน์ สวัสดิ์', hn: 'HN002' },
        { id: 3, name: 'นายประเสริฐ ศรีสุข', hn: 'HN003' },
      ]);
    }
  };

  const fetchConsumptionData = async () => {
    try {
      const response = await api.get('/meal-consumption/tracking', { params: { date: selectedDate } });
      if (response.status === 200 || response.status === 201) {
        const data = await Promise.resolve(response.data);
        setConsumptionData(data);
      }
    } catch (error) {
      console.error('Error fetching consumption data:', error);
      setConsumptionData([]);
    }
  };

  const fetchChangeRequests = async () => {
    try {
      const response = await api.get('/meal-consumption/change-requests', { params: { status: 'pending' } });
      if (response.status === 200 || response.status === 201) {
        const data = await Promise.resolve(response.data);
        setChangeRequests(data);
      }
    } catch (error) {
      console.error('Error fetching change requests:', error);
      setChangeRequests([]);
    }
  };

  const fetchDailySummary = async () => {
    try {
      const response = await api.get('/meal-consumption/daily-summary', { params: { date: selectedDate } });
      if (response.status === 200 || response.status === 201) {
        const data = await Promise.resolve(response.data);
        setDailySummary(data);
      }
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      setDailySummary([]);
    }
  };

  const handleStatusChange = async (patientId, mealType, newStatus, notes = '', changeReason = '') => {
    try {
      const response = await fetch('/api/meal-consumption/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          trackingDate: selectedDate,
          mealType,
          consumptionStatus: newStatus,
          notes,
          changeReason: newStatus !== 'eaten' ? changeReason : '',
        }),
      });

      if (response.status === 200 || response.status === 201) {
        fetchConsumptionData();
        fetchDailySummary();
        setEditingId(null);
        alert('บันทึกสถานะการทานอาหารสำเร็จ');
      }
    } catch (error) {
      console.error('Error updating consumption:', error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const handleApproveMenuChange = async (requestId) => {
    try {
      const response = await fetch(`/api/meal-consumption/change-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalNotes: 'อนุมัติ' }),
      });

      if (response.status === 200 || response.status === 201) {
        fetchChangeRequests();
        alert('อนุมัติการเปลี่ยนเมนูสำเร็จ');
      }
    } catch (error) {
      console.error('Error approving change:', error);
    }
  };

  const handleRejectMenuChange = async (requestId) => {
    try {
      const response = await fetch(`/api/meal-consumption/change-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalNotes: 'ไม่อนุมัติ' }),
      });

      if (response.status === 200 || response.status === 201) {
        fetchChangeRequests();
        alert('ปฏิเสธการเปลี่ยนเมนูสำเร็จ');
      }
    } catch (error) {
      console.error('Error rejecting change:', error);
    }
  };

  const getConsumptionStatus = (status) => {
    return consumptionStatusOptions.find(opt => opt.value === status);
  };

  const getMealLabel = (mealType) => {
    return mealTypes.find(mt => mt.value === mealType);
  };

  const patientConsumption = (patientId) => {
    return consumptionData.filter(c => c.patientId === patientId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">เช็คการทานอาหารผู้ป่วย</h1>
          </div>
          <p className="text-gray-600">ตรวจสอบและบันทึกการทานอาหารของผู้ป่วย</p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'tracking'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            บันทึกการทาน
          </button>
          <button
            onClick={() => setActiveTab('changes')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'changes'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            คำขอเปลี่ยนเมนู
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'summary'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            สรุปรายวัน
          </button>
        </div>

        {activeTab === 'tracking' && (
          <div className="mb-6 flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">เลือกวันที่:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="space-y-4">
            {patients.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>ไม่มีข้อมูลผู้ป่วย</p>
              </div>
            ) : (
              patients.map((patient) => (
                <div key={patient.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5" />
                        <div>
                          <h3 className="font-bold">{patient.name}</h3>
                          <p className="text-sm opacity-90">HN: {patient.hn}</p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setExpandedPatient(expandedPatient === patient.id ? null : patient.id)
                        }
                        className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                      >
                        <ChevronDown
                          size={20}
                          style={{
                            transform:
                              expandedPatient === patient.id ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        />
                      </button>
                    </div>
                  </div>

                  {expandedPatient === patient.id && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {mealTypes.map((meal) => {
                        const patientMeals = patientConsumption(patient.id).filter(
                          (c) => c.mealType === meal.value
                        );
                        const latestMeal = patientMeals[patientMeals.length - 1];
                        const statusInfo = latestMeal
                          ? getConsumptionStatus(latestMeal.consumptionStatus)
                          : null;

                        return (
                          <div key={meal.value} className="border rounded-lg p-4 hover:shadow-md transition">
                            <p className="text-sm font-semibold text-gray-700 mb-3">
                              {meal.icon} {meal.label}
                            </p>
                            {latestMeal ? (
                              <>
                                <div className={`mb-3 p-2 rounded ${statusInfo?.color}`}>
                                  <p className="text-sm font-medium">{statusInfo?.label}</p>
                                </div>
                                {editingId === latestMeal.id ? (
                                  <div className="space-y-2">
                                    <select
                                      value={formData.consumptionStatus}
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          consumptionStatus: e.target.value,
                                        })
                                      }
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    >
                                      {consumptionStatusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                    {formData.consumptionStatus !== 'eaten' && (
                                      <textarea
                                        value={formData.changeReason}
                                        onChange={(e) =>
                                          setFormData({
                                            ...formData,
                                            changeReason: e.target.value,
                                          })
                                        }
                                        placeholder="เหตุผล"
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                        rows="2"
                                      />
                                    )}
                                    <textarea
                                      value={formData.notes}
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          notes: e.target.value,
                                        })
                                      }
                                      placeholder="หมายเหตุ"
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                      rows="2"
                                    />
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() =>
                                          handleStatusChange(
                                            patient.id,
                                            meal.value,
                                            formData.consumptionStatus,
                                            formData.notes,
                                            formData.changeReason
                                          )
                                        }
                                        className="flex-1 bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700 flex items-center justify-center gap-1"
                                      >
                                        <Save size={14} />
                                        บันทึก
                                      </button>
                                      <button
                                        onClick={() => setEditingId(null)}
                                        className="flex-1 bg-gray-400 text-white px-2 py-1 rounded text-sm hover:bg-gray-500"
                                      >
                                        ยกเลิก
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {latestMeal.notes && (
                                      <p className="text-xs text-gray-600">📝: {latestMeal.notes}</p>
                                    )}
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => {
                                          setEditingId(latestMeal.id);
                                          setFormData({
                                            consumptionStatus: latestMeal.consumptionStatus,
                                            notes: latestMeal.notes || '',
                                            changeReason: latestMeal.changeReason || '',
                                            mealType: meal.value,
                                            requestMenuChange: false,
                                          });
                                        }}
                                        className="flex-1 bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm hover:bg-blue-200 flex items-center justify-center gap-1"
                                      >
                                        <Edit2 size={14} />
                                        แก้ไข
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedTracking(latestMeal);
                                          setShowDetailModal(true);
                                        }}
                                        className="flex-1 bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm hover:bg-gray-200 flex items-center justify-center gap-1"
                                      >
                                        <Eye size={14} />
                                        ดู
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingId('new_' + patient.id + '_' + meal.value);
                                  setFormData({
                                    mealType: meal.value,
                                    consumptionStatus: 'not_eaten',
                                    notes: '',
                                    changeReason: '',
                                    requestMenuChange: false,
                                  });
                                }}
                                className="w-full bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 flex items-center justify-center gap-2"
                              >
                                <Plus size={16} />
                                เพิ่มรายการ
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'changes' && (
          <div className="space-y-4">
            {changeRequests.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>ไม่มีคำขอเปลี่ยนเมนู</p>
              </div>
            ) : (
              changeRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">{request.patientName}</h3>
                      <p className="text-sm text-gray-600">HN: {request.patientHN}</p>
                    </div>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      รออนุมัติ
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">เมนูเดิม</p>
                      <p className="font-medium text-gray-800">{request.originalMenu}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">เมนูที่ขอ</p>
                      <p className="font-medium text-gray-800">{request.requestedMenu}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>เหตุผล:</strong> {request.requestReason}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      ขออนุมัติจาก: <strong>{request.requestByName}</strong>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveMenuChange(request.id)}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <Check size={18} />
                      อนุมัติ
                    </button>
                    <button
                      onClick={() => handleRejectMenuChange(request.id)}
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <X size={18} />
                      ไม่อนุมัติ
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-4">
            {dailySummary.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>ไม่มีข้อมูลสรุปรายวัน</p>
              </div>
            ) : (
              dailySummary.map((summary) => (
                <div key={summary.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <h3 className="font-bold text-lg">{summary.patientName}</h3>
                    <p className="text-sm opacity-90">HN: {summary.patientHN}</p>
                  </div>

                  <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">ทานหมด</p>
                      <p className="text-2xl font-bold text-green-600">{summary.mealsEaten}</p>
                      <p className="text-xs text-gray-500">มื้อ</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">ทานไม่หมด</p>
                      <p className="text-2xl font-bold text-yellow-600">{summary.mealsPartiallyEaten}</p>
                      <p className="text-xs text-gray-500">มื้อ</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">ไม่ได้ทาน</p>
                      <p className="text-2xl font-bold text-red-600">{summary.mealsNotEaten}</p>
                      <p className="text-xs text-gray-500">มื้อ</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">ร้อยละความสำเร็จ</p>
                      <p className="text-2xl font-bold text-blue-600">{summary.consumptionPercentage}%</p>
                      <p className="text-xs text-gray-500">ของทั้งวัน</p>
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">แคลอรี่</p>
                      <p className="text-lg font-bold text-gray-800">{summary.totalCaloriesConsumed}</p>
                      <p className="text-xs text-gray-500">kcal</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">โปรตีน</p>
                      <p className="text-lg font-bold text-gray-800">{summary.totalProteinConsumed}</p>
                      <p className="text-xs text-gray-500">g</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">คาร์บ</p>
                      <p className="text-lg font-bold text-gray-800">{summary.totalCarbsConsumed}</p>
                      <p className="text-xs text-gray-500">g</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">ไขมัน</p>
                      <p className="text-lg font-bold text-gray-800">{summary.totalFatConsumed}</p>
                      <p className="text-xs text-gray-500">g</p>
                    </div>
                  </div>

                  {summary.generalNotes && (
                    <div className="p-6 border-t border-gray-200 bg-gray-50">
                      <p className="text-sm font-medium text-gray-700 mb-2">หมายเหตุทั่วไป</p>
                      <p className="text-sm text-gray-600">{summary.generalNotes}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showDetailModal && selectedTracking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">รายละเอียด</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">สถานะการทาน</p>
                <p className="text-lg font-bold text-gray-800">
                  {getConsumptionStatus(selectedTracking.consumptionStatus)?.label}
                </p>
              </div>

              {selectedTracking.notes && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">หมายเหตุ</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedTracking.notes}
                  </p>
                </div>
              )}

              {selectedTracking.changeReason && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">เหตุผล</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedTracking.changeReason}
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
                <p>ตรวจสอบโดย: <strong>{selectedTracking.checkedByName || '-'}</strong></p>
                <p>เวลา: <strong>{new Date(selectedTracking.checkedAt).toLocaleString('th-TH')}</strong></p>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealConsumptionTracking;