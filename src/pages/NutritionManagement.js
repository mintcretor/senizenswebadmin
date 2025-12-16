import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import api from '../api/baseapi';

const NutritionManagement = () => {
  const [activeTab, setActiveTab] = useState('add-food');
  const [foodItems, setFoodItems] = useState([]);
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFood, setExpandedFood] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);

  const [formData, setFormData] = useState({
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    portion: '',
    description: '',
    allergies: '',
    image: null,
    imageFile: null,
  });

  const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
  const dayOrder = [1, 2, 3, 4, 5, 6, 0];
  const mealTypes = [
    { value: 'breakfast', label: 'มื้อเช้า' },
    { value: 'lunch', label: 'มื้อกลางวัน' },
    { value: 'dinner', label: 'มื้อเย็น' },
    { value: 'snack', label: 'มื้อว่าง' },
  ];

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const response = await api.get('/nutrition/food-items');
      setFoodItems(response.data);
    } catch (error) {
      console.error('Error fetching food items:', error);
      setFoodItems([
        {
          id: 1,
          foodName: 'ข้าวกับไข่เจียว',
          calories: 350,
          protein: 12,
          carbs: 45,
          fat: 8,
          fiber: 2,
          portion: '1 จาน',
          description: 'ข้าวสวยกับไข่เจียว 2 ฟอง',
          allergies: 'ไข่',
          image: null,
        },
      ]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ไฟล์รูปภาพต้องไม่เกิน 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({
          ...formData,
          image: reader.result,
          imageFile: file,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({
      ...formData,
      image: null,
      imageFile: null,
    });
  };

  const handleSubmitFood = async (e) => {
    e.preventDefault();
    if (!formData.foodName) {
      alert('กรุณากรอกชื่ออาหาร');
      return;
    }

    setLoading(true);
    try {
      const url = editingFood ? `/nutrition/food-items/${editingFood.id}` : '/nutrition/food-items';
      const method = editingFood ? 'put' : 'post';

      const formDataToSend = new FormData();
      formDataToSend.append('foodName', formData.foodName);
      formDataToSend.append('calories', formData.calories);
      formDataToSend.append('protein', formData.protein);
      formDataToSend.append('carbs', formData.carbs);
      formDataToSend.append('fat', formData.fat);
      formDataToSend.append('fiber', formData.fiber);
      formDataToSend.append('portion', formData.portion);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('allergies', formData.allergies);

      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
      }

      const response = await api[method](url, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 200 || response.status === 201) {
        fetchFoodItems();
        resetForm();
        setShowFoodForm(false);
        alert(editingFood ? 'แก้ไขอาหารสำเร็จ' : 'เพิ่มอาหารสำเร็จ');
      }
    } catch (error) {
      console.error('Error submitting food:', error);
      alert('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFood = (food) => {
    setEditingFood(food);
    setFormData({
      foodName: food.foodName,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      portion: food.portion,
      description: food.description,
      allergies: food.allergies,
      image: food.image,
      imageFile: null,
    });
    setImagePreview(food.image);
    setShowFoodForm(true);
  };

  const handleDeleteFood = async (id) => {
    if (window.confirm('ต้องการลบอาหารนี้หรือไม่?')) {
      try {
        const response = await api.delete(`/nutrition/food-items/${id}`);
        if (response.status === 200) {
          fetchFoodItems();
          alert('ลบอาหารสำเร็จ');
        }
      } catch (error) {
        console.error('Error deleting food:', error);
        alert('เกิดข้อผิดพลาด');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      foodName: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      portion: '',
      description: '',
      allergies: '',
      image: null,
      imageFile: null,
    });
    setImagePreview(null);
    setEditingFood(null);
  };

  const handleAddMealToDay = (day, mealType) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setSelectedFood(null);
    setShowMealModal(true);
  };

  const handleConfirmMeal = async () => {
    if (!selectedFood) {
      alert('กรุณาเลือกอาหาร');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/nutrition/weekly-menus', {
        weekNumber: getWeekNumber(new Date()),
        dayOfWeek: selectedDay,
        mealType: selectedMealType,
        foodItemId: selectedFood.id,
      });

      if (response.status === 200 || response.status === 201) {
        setShowMealModal(false);
        setSelectedDay(null);
        setSelectedMealType(null);
        setSelectedFood(null);
        alert('เพิ่มเมนูสำเร็จ');
      }
    } catch (error) {
      console.error('Error adding meal:', error);
      alert('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const filteredFoodItems = foodItems.filter((food) =>
    food.foodName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">จัดการเมนูอาหาร</h1>
          <p className="text-gray-600">ขั้นตอน 1: เพิ่มอาหาร | ขั้นตอน 2: จัดเมนูสัปดาห์</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('add-food')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'add-food'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ขั้นตอน 1: เพิ่มอาหาร
          </button>
          <button
            onClick={() => setActiveTab('weekly-menu')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'weekly-menu'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ขั้นตอน 2: จัดเมนูสัปดาห์
          </button>
        </div>

        {/* TAB 1: ADD FOOD */}
        {activeTab === 'add-food' && (
          <div className="space-y-6">
            {/* Search and Add Button */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="ค้นหาอาหาร..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowFoodForm(!showFoodForm);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={20} />
                เพิ่มอาหาร
              </button>
            </div>

            {/* Food Form */}
            {showFoodForm && (
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingFood ? 'แก้ไขอาหาร' : 'เพิ่มอาหารใหม่'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowFoodForm(false);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmitFood} className="space-y-4">
                  {/* Food Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่ออาหาร
                    </label>
                    <input
                      type="text"
                      value={formData.foodName}
                      onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
                      placeholder="เช่น ข้าวกับไข่เจียว"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      รูปภาพอาหาร
                    </label>
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-40 h-40 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="text-gray-400 mb-2" size={32} />
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">คลิกเพื่ออัพโหลด</span> หรือลากไฟล์ที่นี่
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (สูงสุด 5MB)</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Nutrition Info Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        แคลอรี่ (kcal)
                      </label>
                      <input
                        type="number"
                        value={formData.calories}
                        onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                        placeholder="350"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        โปรตีน (g)
                      </label>
                      <input
                        type="number"
                        value={formData.protein}
                        onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                        placeholder="12"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        คาร์บ (g)
                      </label>
                      <input
                        type="number"
                        value={formData.carbs}
                        onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                        placeholder="45"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ไขมัน (g)
                      </label>
                      <input
                        type="number"
                        value={formData.fat}
                        onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                        placeholder="8"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ไฟเบอร์ (g)
                      </label>
                      <input
                        type="number"
                        value={formData.fiber}
                        onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                        placeholder="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ปริมาณ
                      </label>
                      <input
                        type="text"
                        value={formData.portion}
                        onChange={(e) => setFormData({ ...formData, portion: e.target.value })}
                        placeholder="1 จาน"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      รายละเอียด
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="รายละเอียดเพิ่มเติม"
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  {/* Allergies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      สารอาหารที่แพ้
                    </label>
                    <input
                      type="text"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      placeholder="เช่น ไข่, นม, ถั่ว"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {loading ? 'กำลังบันทึก...' : editingFood ? 'แก้ไขอาหาร' : 'เพิ่มอาหาร'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowFoodForm(false);
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

            {/* Food Items List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFoodItems.map((food) => (
                <div key={food.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                  {/* Image */}
                  <div className="h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
                    {food.image && typeof food.image === 'string' && food.image.startsWith('data:') ? (
                      <img
                        src={food.image}
                        alt={food.foodName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="text-gray-400 mx-auto mb-2" size={32} />
                        <p className="text-gray-500 text-sm">ไม่มีรูปภาพ</p>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="font-bold text-gray-800 mb-2">{food.foodName}</h4>
                    <p className="text-sm text-gray-600 mb-3">{food.portion}</p>

                    {/* Quick Nutrition */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-gray-600">แคลอรี่</p>
                        <p className="font-semibold text-blue-600">{food.calories}</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-gray-600">โปรตีน</p>
                        <p className="font-semibold text-green-600">{food.protein}g</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => handleEditFood(food)}
                        className="flex-1 bg-blue-100 text-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-200 flex items-center justify-center gap-2"
                      >
                        <Edit2 size={14} />
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteFood(food.id)}
                        className="flex-1 bg-red-100 text-red-600 px-3 py-2 rounded text-sm hover:bg-red-200 flex items-center justify-center gap-2"
                      >
                        <Trash2 size={14} />
                        ลบ
                      </button>
                    </div>

                    {/* Expand Button */}
                    <button
                      onClick={() => setExpandedFood(expandedFood === food.id ? null : food.id)}
                      className="w-full mt-2 text-blue-600 text-xs hover:text-blue-800 flex items-center justify-center gap-2"
                    >
                      {expandedFood === food.id ? (
                        <>
                          <ChevronUp size={14} />
                          ซ่อนรายละเอียด
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} />
                          ดูเพิ่มเติม
                        </>
                      )}
                    </button>

                    {/* Details */}
                    {expandedFood === food.id && (
                      <div className="mt-2 pt-2 border-t space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">คาร์บ:</span>
                          <span className="font-semibold">{food.carbs}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ไขมัน:</span>
                          <span className="font-semibold">{food.fat}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ไฟเบอร์:</span>
                          <span className="font-semibold">{food.fiber}g</span>
                        </div>
                        {food.allergies && (
                          <div className="bg-red-50 p-2 rounded mt-2">
                            <p className="text-red-700">⚠️ แพ้: {food.allergies}</p>
                          </div>
                        )}
                        {food.description && (
                          <div className="bg-gray-50 p-2 rounded mt-2">
                            <p className="text-gray-700">{food.description}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: WEEKLY MENU */}
        {activeTab === 'weekly-menu' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800">จัดเมนูอาหารประจำสัปดาห์</h3>

            {dayOrder.map((dayNum) => (
              <div key={dayNum} className="bg-white rounded-lg shadow p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">{dayNames[dayNum]}</h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {mealTypes.map((meal) => (
                    <div key={meal.value} className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">{meal.label}</p>
                      <button
                        onClick={() => handleAddMealToDay(dayNum, meal.value)}
                        className="w-full bg-blue-100 text-blue-600 hover:bg-blue-200 px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition"
                      >
                        <Plus size={18} />
                        เพิ่มเมนู
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
                    disabled={!selectedFood || loading}
                    className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'กำลังบันทึก...' : 'เลือก'}
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

export default NutritionManagement;