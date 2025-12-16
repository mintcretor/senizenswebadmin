import React, { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Home,
  Pause,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import api from '../api/baseapi';

const PatientMenuAssignment = () => {
  const [activeTab, setActiveTab] = useState('patient-assignment');
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [patients, setPatients] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [weeklyMenus, setWeeklyMenus] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [currentWeek, setCurrentWeek] = useState(getWeekNumber(new Date()));
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [holdStatus, setHoldStatus] = useState(false);
  const [holdReason, setHoldReason] = useState('');
  const [holdUntil, setHoldUntil] = useState('');
  const [loading, setLoading] = useState(false);

  // Daily menu state - for each day and meal type
  const [dailyMenuAssignments, setDailyMenuAssignments] = useState({
    1: { breakfast: null, lunch: null, dinner: null, snack: null },
    2: { breakfast: null, lunch: null, dinner: null, snack: null },
    3: { breakfast: null, lunch: null, dinner: null, snack: null },
    4: { breakfast: null, lunch: null, dinner: null, snack: null },
    5: { breakfast: null, lunch: null, dinner: null, snack: null },
    6: { breakfast: null, lunch: null, dinner: null, snack: null },
    0: { breakfast: null, lunch: null, dinner: null, snack: null },
  });

  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);

  useEffect(() => {
    fetchWards();
    fetchFoodItems();
  }, []);

  useEffect(() => {
    if (selectedWard) {
      fetchRooms();
    }
  }, [selectedWard]);

  useEffect(() => {
    if (selectedWard && selectedRoom) {
      fetchPatients();
    }
  }, [selectedWard, selectedRoom]);

  useEffect(() => {
    fetchWeeklyMenus();
    fetchAssignments();
  }, [currentWeek]);

  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  function getWeekDateRange(weekNum) {
    const simple = new Date(currentDate.getFullYear(), 0, 1 + (weekNum - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());

    const startDate = new Date(ISOweekStart);
    const endDate = new Date(ISOweekStart);
    endDate.setDate(endDate.getDate() + 6);
    return { start: startDate, end: endDate };
  }

  const fetchWards = async () => {
    try {
      const response = await api.get('/nutrition/wards');
      setWards(response.data);
    } catch (error) {
      console.error('Error fetching wards:', error);
      setWards([
        { id: 1, wardName: 'Ward A', wardCode: 'A', description: 'Medical Ward' },
        { id: 2, wardName: 'Ward B', wardCode: 'B', description: 'Surgical Ward' },
      ]);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await api.get('/nutrition/rooms', {
        params: { wardId: selectedWard }
      });
      setPatients([]);
      setSelectedRoom(null);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/nutrition/patients', {
        params: {
          wardId: selectedWard,
          roomId: selectedRoom
        }
      });
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([
        {
          id: 1,
          hn: 'HN001',
          firstName: 'สมชาย',
          lastName: 'จันทร์',
          allergies: 'ไข่, นม',
          status: 'admitted',
        },
        {
          id: 2,
          hn: 'HN002',
          firstName: 'รัตน์',
          lastName: 'สวัสดิ์',
          allergies: 'ปลา',
          status: 'admitted',
        },
      ]);
    }
  };

  const fetchFoodItems = async () => {
    try {
      const response = await api.get('/nutrition/food-items');
      setFoodItems(response.data);
    } catch (error) {
      console.error('Error fetching food items:', error);
    }
  };

  const fetchWeeklyMenus = async () => {
    try {
      const response = await api.get('/nutrition/weekly-menus', {
        params: { week: currentWeek }
      });
      setWeeklyMenus(response.data);
    } catch (error) {
      console.error('Error fetching weekly menus:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/nutrition/assignments', {
        params: { week: currentWeek }
      });
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleAddMealToDay = (day, mealType) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setSelectedFood(null);
    setShowMealModal(true);
  };

  const handleConfirmMeal = () => {
    if (!selectedFood) {
      alert('กรุณาเลือกอาหาร');
      return;
    }

    setDailyMenuAssignments(prev => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [selectedMealType]: selectedFood
      }
    }));

    setShowMealModal(false);
    setSelectedDay(null);
    setSelectedMealType(null);
    setSelectedFood(null);
  };

  const handleRemoveMeal = (day, mealType) => {
    setDailyMenuAssignments(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: null
      }
    }));
  };

  const handleAssignToPatient = async () => {
    if (!selectedPatient) {
      alert('กรุณาเลือกผู้ป่วย');
      return;
    }

    // Check if any meal is assigned
    const hasAnyMeal = Object.values(dailyMenuAssignments).some(dayMeals =>
      Object.values(dayMeals).some(meal => meal !== null)
    );

    if (!hasAnyMeal && !holdStatus) {
      alert('กรุณาเพิ่มเมนูหรือเลือก Hold');
      return;
    }

    setLoading(true);
    try {
      const weekDates = getWeekDateRange(currentWeek);

      // Prepare meals array
      const mealsArray = [];
      Object.entries(dailyMenuAssignments).forEach(([day, meals]) => {
        Object.entries(meals).forEach(([mealType, foodItem]) => {
          if (foodItem) {
            mealsArray.push({
              dayOfWeek: parseInt(day),
              mealType,
              foodItemId: foodItem.id
            });
          }
        });
      });

      const response = await api.post('/nutrition/patient-assignments', {
        patientId: selectedPatient.id,
        weekNumber: currentWeek,
        weekStartDate: weekDates.start.toISOString().split('T')[0],
        assignmentStatus: holdStatus ? 'hold' : 'active',
        holdReason: holdReason,
        holdUntilDate: holdUntil,
        meals: mealsArray,
      });

      if (response.status === 200 || response.status === 201) {
        fetchAssignments();
        setShowAssignmentModal(false);
        setSelectedPatient(null);
        setHoldStatus(false);
        setHoldReason('');
        setHoldUntil('');
        // Reset daily menus
        setDailyMenuAssignments({
          1: { breakfast: null, lunch: null, dinner: null, snack: null },
          2: { breakfast: null, lunch: null, dinner: null, snack: null },
          3: { breakfast: null, lunch: null, dinner: null, snack: null },
          4: { breakfast: null, lunch: null, dinner: null, snack: null },
          5: { breakfast: null, lunch: null, dinner: null, snack: null },
          6: { breakfast: null, lunch: null, dinner: null, snack: null },
          0: { breakfast: null, lunch: null, dinner: null, snack: null },
        });
        alert('เพิ่มเมนูให้ผู้ป่วยสำเร็จ');
      }
    } catch (error) {
      console.error('Error assigning to patient:', error);
      alert('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
  const dayOrder = [1, 2, 3, 4, 5, 6, 0]; // จันทร์ ถึง อาทิตย์
  const mealTypes = [
    { value: 'breakfast', label: 'มื้อเช้า' },
    { value: 'lunch', label: 'มื้อกลางวัน' },
    { value: 'dinner', label: 'มื้อเย็น' },
    { value: 'snack', label: 'มื้อว่าง' },
  ];

  const weekDates = getWeekDateRange(currentWeek);
  const getPatientAssignment = (patientId) => {
    return assignments.find((a) => a.patientId === patientId && a.weekNumber === currentWeek);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">จัดเมนูอาหารประจำสัปดาห์</h1>
          <p className="text-gray-600">
            สัปดาห์ที่ {currentWeek} ({weekDates.start.toLocaleDateString('th-TH')} -{' '}
            {weekDates.end.toLocaleDateString('th-TH')})
          </p>
        </div>

        {/* Tab */}
        <div className="mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('patient-assignment')}
            className="px-4 py-2 font-medium border-b-2 border-blue-600 text-blue-600"
          >
            เลือกเมนูให้ผู้ป่วย
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Ward Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">เลือกวอร์ด</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {wards.map((ward) => (
                <button
                  key={ward.id}
                  onClick={() => setSelectedWard(ward.id)}
                  className={`p-4 rounded-lg border-2 transition ${
                    selectedWard === ward.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <Home className="mb-2" size={24} />
                  <p className="font-bold text-gray-800">{ward.wardName}</p>
                  <p className="text-sm text-gray-600">{ward.wardCode}</p>
                </button>
              ))}
            </div>
          </div>

          {selectedWard && (
            <>
              {/* Room Selection */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">เลือกห้อง</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((roomNum) => (
                    <button
                      key={roomNum}
                      onClick={() => setSelectedRoom(roomNum)}
                      className={`p-3 rounded-lg border-2 transition ${
                        selectedRoom === roomNum
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      ห้อง {roomNum}
                    </button>
                  ))}
                </div>
              </div>

              {selectedRoom && (
                <>
                  {/* Patient List */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">ผู้ป่วยในห้องนี้</h3>

                    {patients.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">ไม่มีผู้ป่วยในห้องนี้</p>
                    ) : (
                      <div className="space-y-3">
                        {patients.map((patient) => {
                          const assignment = getPatientAssignment(patient.id);
                          return (
                            <div
                              key={patient.id}
                              className="border rounded-lg p-4 hover:shadow-md transition"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-bold text-gray-800">
                                    {patient.firstName} {patient.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600">HN: {patient.hn}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {assignment && (
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        assignment.assignmentStatus === 'hold'
                                          ? 'bg-red-100 text-red-700'
                                          : 'bg-green-100 text-green-700'
                                      }`}
                                    >
                                      {assignment.assignmentStatus === 'hold'
                                        ? 'HOLD'
                                        : 'Active'}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => {
                                      setSelectedPatient(patient);
                                      setShowAssignmentModal(true);
                                    }}
                                    className={`px-4 py-2 rounded text-sm transition ${
                                      assignment
                                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                  >
                                    {assignment ? 'เปลี่ยน' : 'เลือกเมนู'}
                                  </button>
                                </div>
                              </div>

                              {/* Allergies */}
                              {patient.allergies && (
                                <div className="bg-red-50 p-2 rounded mt-2 text-xs">
                                  <p className="text-red-700">⚠️ แพ้อาหาร: {patient.allergies}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Assignment Modal - Daily Menu Selection */}
        {showAssignmentModal && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-96 overflow-y-auto">
              <div className="border-b border-gray-200 px-6 py-4 sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">
                    เลือกเมนูให้ {selectedPatient.firstName} {selectedPatient.lastName}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAssignmentModal(false);
                      setSelectedPatient(null);
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Allergies */}
                {selectedPatient.allergies && (
                  <div className="bg-red-50 p-4 rounded">
                    <p className="text-red-700">
                      <strong>⚠️ แพ้อาหาร:</strong> {selectedPatient.allergies}
                    </p>
                  </div>
                )}

                {/* Daily Menu Selection - วันและมื้ออาหาร */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800 text-lg">จัดเมนูรายวัน</h3>

                  {dayOrder.map((dayNum) => (
                    <div key={dayNum} className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        {dayNames[dayNum]}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {mealTypes.map((meal) => (
                          <div key={meal.value} className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">{meal.label}</p>
                            {dailyMenuAssignments[dayNum][meal.value] ? (
                              <div className="bg-white border-2 border-green-400 rounded p-2">
                                <p className="text-sm font-semibold text-gray-800">
                                  {dailyMenuAssignments[dayNum][meal.value].foodName}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {dailyMenuAssignments[dayNum][meal.value].portion}
                                </p>
                                <button
                                  onClick={() => handleRemoveMeal(dayNum, meal.value)}
                                  className="mt-2 w-full bg-red-100 text-red-600 px-2 py-1 rounded text-xs hover:bg-red-200 flex items-center justify-center gap-1"
                                >
                                  <Trash2 size={12} />
                                  ลบ
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAddMealToDay(dayNum, meal.value)}
                                className="w-full bg-blue-100 text-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-200 flex items-center justify-center gap-1 font-medium"
                              >
                                <Plus size={16} />
                                เพิ่มเมนู
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hold Options */}
                <div className="border-t pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={holdStatus}
                      onChange={(e) => setHoldStatus(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="font-medium text-gray-700">Hold ไม่จัดเมนูในสัปดาห์นี้</span>
                  </label>

                  {holdStatus && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          เหตุผล
                        </label>
                        <textarea
                          value={holdReason}
                          onChange={(e) => setHoldReason(e.target.value)}
                          placeholder="เช่น ผู้ป่วยเตรียมตัวสำหรับการผ่าตัด"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          rows="2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hold จนถึงวันที่
                        </label>
                        <input
                          type="date"
                          value={holdUntil}
                          onChange={(e) => setHoldUntil(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t">
                  <button
                    onClick={handleAssignToPatient}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {loading ? 'กำลังบันทึก...' : 'ยืนยันการจัดเมนู'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAssignmentModal(false);
                      setSelectedPatient(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-800 px-6 py-2 rounded-lg"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Meal Selection Modal */}
        {showMealModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  เลือกอาหาร - {dayNames[selectedDay]} {mealTypes.find(m => m.value === selectedMealType)?.label}
                </h2>
                <button
                  onClick={() => {
                    setShowMealModal(false);
                    setSelectedDay(null);
                    setSelectedMealType(null);
                    setSelectedFood(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                  {foodItems.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => setSelectedFood(food)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition ${
                        selectedFood?.id === food.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <p className="font-semibold text-gray-800">{food.foodName}</p>
                      <p className="text-sm text-gray-600">
                        {food.portion} | {food.calories} kcal
                      </p>
                    </button>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleConfirmMeal}
                    disabled={!selectedFood}
                    className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    เลือก
                  </button>
                  <button
                    onClick={() => {
                      setShowMealModal(false);
                      setSelectedDay(null);
                      setSelectedMealType(null);
                      setSelectedFood(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-800 px-6 py-2 rounded-lg"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientMenuAssignment;