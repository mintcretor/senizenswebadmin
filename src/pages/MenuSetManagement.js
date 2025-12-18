import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../api/baseapi';

const MenuSetManagement = () => {
  const [menuSets, setMenuSets] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const [loading, setLoading] = useState(false);

  const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
  const dayOrder = [1, 2, 3, 4, 5, 6, 0]; // จันทร์ - อาทิตย์
  const mealTypes = [
    { value: 'breakfast', label: 'มื้อเช้า' },
    { value: 'lunch', label: 'มื้อกลางวัน' },
    { value: 'dinner', label: 'มื้อเย็น' },
    { value: 'snack', label: 'มื้อว่าง' },
  ];

  const initializeWeeklyMenus = () => {
    const menus = {};
    dayOrder.forEach((day) => {
      menus[day] = {};
      mealTypes.forEach((meal) => {
        menus[day][meal.value] = [];
      });
    });
    return menus;
  };

  const [formData, setFormData] = useState({
    setName: '',
    startDate: '',
    endDate: '',
    weeklyMenus: initializeWeeklyMenus(),
  });

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const response = await api.get('/nutrition/food-items');
      // ✅ ตรวจสอบว่า response.data เป็น array
      if (Array.isArray(response.data)) {
        setFoodItems(response.data);
      } else {
        console.warn('API response is not an array, setting empty array');
        setFoodItems([]);
      }
    } catch (error) {
      console.error('Error fetching food items:', error);
      // ✅ เมื่อ error ก็ให้ใช้ข้อมูล mock แบบเดิม
      setFoodItems([
        {
          id: 1,
          foodName: 'ข้าวกับไข่เจียว',
          calories: 350,
          portion: '1 จาน',
        },
      ]);
    }
  };

  const handleAddSet = async (e) => {
    e.preventDefault();
    if (!formData.setName || !formData.startDate || !formData.endDate) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setLoading(true);
    try {
      const url = editingSet ? `/nutrition/menu-sets/${editingSet.id}` : '/nutrition/menu-sets';
      const method = editingSet ? 'put' : 'post';

      const response = await api[method](url, {
        setName: formData.setName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        weeklyMenus: formData.weeklyMenus,
      });

      if (response.status === 200 || response.status === 201) {
        if (editingSet) {
          setMenuSets(menuSets.map(set => 
            set.id === editingSet.id ? response.data : set
          ));
        } else {
          setMenuSets([...menuSets, response.data]);
        }
        resetForm();
        setShowAddForm(false);
        alert(editingSet ? 'แก้ไขเซ็ตสำเร็จ' : 'เพิ่มเซ็ตสำเร็จ');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSet = (set) => {
    setEditingSet(set);
    setFormData({
      setName: set.setName,
      startDate: set.startDate,
      endDate: set.endDate,
      weeklyMenus: set.weeklyMenus || initializeWeeklyMenus(),
    });
    setShowAddForm(true);
  };

  const handleDeleteSet = async (id) => {
    if (window.confirm('ต้องการลบเซ็ตนี้หรือไม่?')) {
      try {
        const response = await api.delete(`/nutrition/menu-sets/${id}`);
        if (response.status === 200) {
          setMenuSets(menuSets.filter(set => set.id !== id));
          alert('ลบเซ็ตสำเร็จ');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาด');
      }
    }
  };

  const handleAddFoodToMeal = (dayNum, mealType, foodId) => {
    const selectedFood = foodItems.find(f => f.id === foodId);
    if (!selectedFood) return;

    const currentMenus = formData.weeklyMenus[dayNum][mealType] || [];
    const isDuplicate = currentMenus.some(menu => menu.id === foodId);
    
    if (isDuplicate) {
      alert('อาหารนี้มีอยู่แล้วในมื้อนี้');
      return;
    }

    const updatedMenus = [...currentMenus, selectedFood];
    setFormData({
      ...formData,
      weeklyMenus: {
        ...formData.weeklyMenus,
        [dayNum]: {
          ...formData.weeklyMenus[dayNum],
          [mealType]: updatedMenus,
        },
      },
    });
  };

  const handleRemoveFoodFromMeal = (dayNum, mealType, foodId) => {
    const updatedMenus = formData.weeklyMenus[dayNum][mealType].filter(menu => menu.id !== foodId);
    setFormData({
      ...formData,
      weeklyMenus: {
        ...formData.weeklyMenus,
        [dayNum]: {
          ...formData.weeklyMenus[dayNum],
          [mealType]: updatedMenus,
        },
      },
    });
  };

  const resetForm = () => {
    setFormData({
      setName: '',
      startDate: '',
      endDate: '',
      weeklyMenus: initializeWeeklyMenus(),
    });
    setEditingSet(null);
  };

  // ✅ Ensure foodItems is always an array before using
  const safeFoodItems = Array.isArray(foodItems) ? foodItems : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">เซ็ตเมนูอาหาร</h2>
          <p className="text-gray-600">จัดการเซ็ตเมนูรายสัปดาห์</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(!showAddForm);
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          เพิ่มเซ็ตใหม่
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            {editingSet ? 'แก้ไขเซ็ตเมนู' : 'เพิ่มเซ็ตเมนูใหม่'}
          </h3>

          <form onSubmit={handleAddSet} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อเซ็ต
                </label>
                <input
                  type="text"
                  value={formData.setName}
                  onChange={(e) => setFormData({ ...formData, setName: e.target.value })}
                  placeholder="เช่น เซ็ตอาหารสุขภาพ"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วันเริ่มต้น
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วันสิ้นสุด
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Weekly Meals Grid */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-4">จัดเมนูรายวัน</h4>
              
              {dayOrder.map((dayNum) => (
                <div key={dayNum} className="mb-6 border rounded-lg p-4 bg-gray-50">
                  <h5 className="text-lg font-semibold text-gray-800 mb-4">{dayNames[dayNum]}</h5>
                  
                  {/* 4 Meal Types */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {mealTypes.map((meal) => (
                      <div key={meal.value} className="border rounded-lg p-3 bg-white">
                        <p className="font-semibold text-gray-800 mb-3 text-center">{meal.label}</p>

                        {/* Food Dropdown */}
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddFoodToMeal(dayNum, meal.value, parseInt(e.target.value));
                              e.target.value = '';
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">เลือกอาหาร</option>
                          {safeFoodItems.map((food) => (
                            <option key={food.id} value={food.id}>
                              {food.foodName}
                            </option>
                          ))}
                        </select>

                        {/* Selected Meals */}
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {formData.weeklyMenus[dayNum][meal.value] && 
                           formData.weeklyMenus[dayNum][meal.value].length > 0 ? (
                            formData.weeklyMenus[dayNum][meal.value].map((menu) => (
                              <div
                                key={menu.id}
                                className="bg-green-50 border border-green-300 rounded p-2 flex items-center justify-between text-xs"
                              >
                                <div>
                                  <p className="font-semibold text-gray-800">{menu.foodName}</p>
                                  <p className="text-gray-600">{menu.portion}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFoodFromMeal(dayNum, meal.value, menu.id)}
                                  className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-400 text-xs text-center py-2">ยังไม่มีเมนู</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'กำลังบันทึก...' : editingSet ? 'แก้ไขเซ็ต' : 'เพิ่มเซ็ต'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="flex-1 bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Sets Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {menuSets.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">ยังไม่มีเซ็ตเมนู คลิก "เพิ่มเซ็ตใหม่" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Header */}
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    ระยะเวลา
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    ชื่อเซ็ต
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800">
                    Action
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {menuSets.map((set) => (
                  <React.Fragment key={set.id}>
                    {/* Main Row */}
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">
                        <div className="font-semibold">{set.setName}</div>
                        <div className="text-xs text-gray-600">
                          {new Date(set.startDate).toLocaleDateString('th-TH')} ถึง{' '}
                          {new Date(set.endDate).toLocaleDateString('th-TH')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {/* 7 Days Grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {dayOrder.map((dayNum) => (
                            <div key={dayNum} className="text-center">
                              <p className="text-xs font-semibold text-gray-700 mb-1">
                                {dayNames[dayNum]}
                              </p>
                              <div className="text-xs text-gray-600 space-y-1 min-h-12 bg-gray-50 rounded p-1">
                                {mealTypes.some(meal => 
                                  set.weeklyMenus?.[dayNum]?.[meal.value]?.length > 0
                                ) ? (
                                  <>
                                    {mealTypes.map((meal) => {
                                      const menus = set.weeklyMenus?.[dayNum]?.[meal.value] || [];
                                      return menus.length > 0 ? (
                                        <div key={meal.value}>
                                          <p className="text-xs font-semibold text-gray-700">{meal.label}:</p>
                                          {menus.map((menu, idx) => (
                                            <div key={idx} className="text-xs truncate text-gray-600">
                                              {menu.foodName || menu}
                                            </div>
                                          ))}
                                        </div>
                                      ) : null;
                                    })}
                                  </>
                                ) : (
                                  <div className="text-gray-400">-</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEditSet(set)}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-100 rounded"
                            title="แก้ไข"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteSet(set.id)}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-100 rounded"
                            title="ลบ"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuSetManagement;