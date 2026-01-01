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
import MenuSetManagement from './MenuSetManagement';

const NutritionManagement = () => {
  const [activeTab, setActiveTab] = useState('add-food');
  const [foodItems, setFoodItems] = useState([]);
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFood, setExpandedFood] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchFoodItems();
  }, []);

  // ✅ Convert Buffer to base64 image
  const convertBufferToImage = (imageData) => {
    if (!imageData) return null;
    
    // If it's already a data URL
    if (typeof imageData === 'string' && imageData.startsWith('data:')) {
      return imageData;
    }
    
    // If it's a Buffer object {type: 'Buffer', data: [...]}
    if (imageData.type === 'Buffer' && Array.isArray(imageData.data)) {
      const uint8Array = new Uint8Array(imageData.data);
      const binaryString = String.fromCharCode.apply(null, uint8Array);
      return 'data:image/jpeg;base64,' + btoa(binaryString);
    }
    
    // If it's already a Uint8Array or similar
    if (imageData instanceof Uint8Array || ArrayBuffer.isView(imageData)) {
      const binaryString = String.fromCharCode.apply(null, imageData);
      return 'data:image/jpeg;base64,' + btoa(binaryString);
    }
    
    return null;
  };

  // ✅ ดึงข้อมูลอาหารจาก API
  const fetchFoodItems = async () => {
    try {
      const response = await api.get('/nutrition/food-items');
<<<<<<< HEAD
      console.log('Fetched food items:', response.data);
      // ✅ ตรวจสอบว่า response.data เป็น array
      if (Array.isArray(response.data.data)) {
        
        setFoodItems(response.data.data);
      } else {
        console.warn('API response is not an array, setting empty array');
        setFoodItems([]);
=======
      console.log('📊 Fetched food items response:', response);
      
      // ✅ ตรวจสอบว่า response.data เป็น array
      let foodData = [];
      
      if (response.data) {
        // ถ้า response.data เป็น array ตรงๆ
        if (Array.isArray(response.data)) {
          foodData = response.data;
        }
        // ถ้า response.data มี property data ข้างใน
        else if (Array.isArray(response.data.data)) {
          foodData = response.data.data;
        }
        // ถ้า response.data มี property items
        else if (Array.isArray(response.data.items)) {
          foodData = response.data.items;
        }
>>>>>>> b431bfdcc9b2f11cbeb6450ef805fe6a6274c2f7
      }
      
      // ✅ Convert Buffer images to base64
      foodData = foodData.map(food => ({
        ...food,
        image: convertBufferToImage(food.image) || food.image
      }));
      
      setFoodItems(foodData);
      console.log('✅ Food items loaded:', foodData.length, 'items');
    } catch (error) {
      console.error('❌ Error fetching food items:', error);
      // ✅ เมื่อ error ก็ใช้ข้อมูล mock แบบเดิม
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
        {
          id: 2,
          foodName: 'แกงส้มปลาทู',
          calories: 420,
          protein: 25,
          carbs: 30,
          fat: 15,
          fiber: 3,
          portion: '1 ชาม',
          description: 'แกงส้มรสชาติสม่ำเสมอ',
          allergies: 'กุ้ง, ปลา',
          image: null,
        },
      ]);
    }
  };

  // ✅ จัดการเปลี่ยนแปลงรูปภาพ
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

  // ✅ ลบรูปภาพ
  const removeImage = () => {
    setImagePreview(null);
    setFormData({
      ...formData,
      image: null,
      imageFile: null,
    });
  };

  // ✅ ส่งแบบฟอร์มอาหาร
  const handleSubmitFood = async (e) => {
    e.preventDefault();
    if (!formData.foodName) {
      alert('กรุณากรอกชื่ออาหาร');
      return;
    }

    setLoading(true);
    try {
      // สร้าง FormData สำหรับส่ง multipart/form-data (รับได้ทั้งรูปภาพและข้อมูล)
      const formDataToSend = new FormData();
      formDataToSend.append('foodName', formData.foodName);
      formDataToSend.append('calories', formData.calories || 0);
      formDataToSend.append('protein', formData.protein || 0);
      formDataToSend.append('carbs', formData.carbs || 0);
      formDataToSend.append('fat', formData.fat || 0);
      formDataToSend.append('fiber', formData.fiber || 0);
      formDataToSend.append('portion', formData.portion || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('allergies', formData.allergies || '');

      // ✅ ถ้ามีไฟล์รูปภาพให้เพิ่มไปด้วย
      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
      }

      // ตัดสินใจ URL และ method (POST = สร้าง, PUT = แก้ไข)
      const url = editingFood 
        ? `/nutrition/food-items/${editingFood.id}` 
        : '/nutrition/food-items';
      const method = editingFood ? 'put' : 'post';

      // ✅ ส่งไปยัง API
      const response = await api[method](url, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('✅ API Response:', response);

      if (response.status === 200 || response.status === 201) {
        await fetchFoodItems();
        resetForm();
        setShowFoodForm(false);
        alert(editingFood ? 'แก้ไขอาหารสำเร็จ' : 'เพิ่มอาหารสำเร็จ');
      }
    } catch (error) {
      console.error('❌ Error submitting food:', error);
      alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // ✅ แก้ไขอาหาร
  const handleEditFood = (food) => {
    setEditingFood(food);
    setFormData({
      foodName: food.food_name || food.foodName || '',
      calories: food.calories || '',
      protein: food.protein || '',
      carbs: food.carbs || '',
      fat: food.fat || '',
      fiber: food.fiber || '',
      portion: food.portion || '',
      description: food.description || '',
      allergies: food.allergies || '',
      image: food.image || null,
      imageFile: null,
    });
    setImagePreview(food.image || null);
    setShowFoodForm(true);
  };

  // ✅ ลบอาหาร
  const handleDeleteFood = async (id) => {
    if (window.confirm('ต้องการลบอาหารนี้หรือไม่?')) {
      try {
        const response = await api.delete(`/nutrition/food-items/${id}`);
        console.log('✅ Delete response:', response);
        
        if (response.status === 200) {
          await fetchFoodItems();
          alert('ลบอาหารสำเร็จ');
        }
      } catch (error) {
        console.error('❌ Error deleting food:', error);
        alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  // ✅ รีเซ็ตแบบฟอร์ม
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

  // ✅ ตรวจสอบให้แน่ใจว่า foodItems เป็น array เสมอก่อนเรียก filter
  const filteredFoodItems = Array.isArray(foodItems)
    ? foodItems.filter((food) => {
        const foodName = food.food_name || food.foodName || '';
        return foodName.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">จัดการเมนูอาหาร</h1>
          <p className="text-gray-600">ขั้นตอน 1: เพิ่มอาหาร | ขั้นตอน 2: จัดเซ็ตเมนูสัปดาห์</p>
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
            onClick={() => setActiveTab('menu-sets')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'menu-sets'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ขั้นตอน 2: จัดเซ็ตเมนูสัปดาห์
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
                      สารก่อภูมิแพ้
                    </label>
                    <input
                      type="text"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      placeholder="เช่น ไข่, กุ้ง, นม"
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
                    {food.image ? (
                      <img
                        src={food.image}
                        alt={food.food_name || food.foodName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', food.image);
                          e.target.style.display = 'none';
                        }}
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
                    <h4 className="font-bold text-gray-800 mb-2">{food.food_name || food.foodName}</h4>
                    <p className="text-sm text-gray-600 mb-3">{food.portion}</p>

                    {/* Quick Nutrition */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-gray-600">แคลอรี่</p>
                        <p className="font-semibold text-blue-600">{food.calories || 0}</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-gray-600">โปรตีน</p>
                        <p className="font-semibold text-green-600">{food.protein || 0}g</p>
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
                          <span className="font-semibold">{food.carbs || 0}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ไขมัน:</span>
                          <span className="font-semibold">{food.fat || 0}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ไฟเบอร์:</span>
                          <span className="font-semibold">{food.fiber || 0}g</span>
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

        {/* TAB 2: MENU SETS */}
        {activeTab === 'menu-sets' && <MenuSetManagement />}
      </div>
    </div>
  );
};

export default NutritionManagement;