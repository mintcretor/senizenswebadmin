import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, Settings, Package, DollarSign, FileText } from 'lucide-react';

// API Base URL
const API_BASE_URL =process.env.REACT_APP_API_BASE_URL;
export default function ServiceManagementSystem() {
  const [currentTab, setCurrentTab] = useState('packages');
  const [masterData, setMasterData] = useState({
    packages: [],
    medical: [],
    contracts: [],
    pricing: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalForm, setModalForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    unit: '',
    billing: '',
    type: '',
    isActive: true
  });

  // Fetch data when tab changes
  useEffect(() => {
    fetchData();
  }, [currentTab]);

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${currentTab}`);
      const result = await response.json();
      
      if (result.success) {
        setMasterData(prev => ({
          ...prev,
          [currentTab]: result.data
        }));
      } else {
        setError('ไม่สามารถดึงข้อมูลได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setModalForm({
        name: item.name,
        description: item.description || '',
        category: item.category || '',
        price: item.price.toString(),
        duration: item.duration || '',
        unit: item.unit || '',
        billing: item.billing || '',
        type: item.type || '',
        isActive: item.isActive
      });
    } else {
      setEditingItem(null);
      setModalForm({
        name: '',
        description: '',
        category: '',
        price: '',
        duration: '',
        unit: '',
        billing: '',
        type: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setModalForm({
      name: '',
      description: '',
      category: '',
      price: '',
      duration: '',
      unit: '',
      billing: '',
      type: '',
      isActive: true
    });
  };

  const handleModalInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setModalForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const requestData = {
      name: modalForm.name,
      description: modalForm.description,
      price: parseFloat(modalForm.price),
      isActive: modalForm.isActive
    };

    // Add tab-specific fields
    if (currentTab === 'packages') {
      requestData.duration = modalForm.duration;
    } else if (currentTab === 'medical') {
      requestData.unit = modalForm.unit;
    } else if (currentTab === 'contracts') {
      requestData.category = modalForm.category;
      requestData.billing = modalForm.billing;
    } else if (currentTab === 'pricing') {
      requestData.type = modalForm.type;
      requestData.unit = modalForm.unit;
    }

    try {
      const url = editingItem 
        ? `${API_BASE_URL}/${currentTab}/${editingItem.id}`
        : `${API_BASE_URL}/${currentTab}`;
      
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (result.success) {
        closeModal();
        fetchData(); // Refresh data
        alert(result.message);
      } else {
        setError(result.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      setError('ไม่สามารถบันทึกข้อมูลได้');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/${currentTab}/${itemId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        fetchData(); // Refresh data
        alert(result.message);
      } else {
        setError(result.message || 'ไม่สามารถลบได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการลบข้อมูล');
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemStatus = async (itemId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/${currentTab}/${itemId}/toggle`, {
        method: 'PATCH'
      });

      const result = await response.json();

      if (result.success) {
        fetchData(); // Refresh data
      } else {
        setError(result.message || 'ไม่สามารถเปลี่ยนสถานะได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด');
      console.error('Toggle error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTabConfig = () => {
    const configs = {
      packages: {
        title: 'คอร์สแพ็คเกจ Rehub',
        icon: Package,
        color: 'blue'
      },
      medical: {
        title: 'รายการเหมาเวชภัณฑ์',
        icon: FileText,
        color: 'green'
      },
      contracts: {
        title: 'รายการเหมา',
        icon: Settings,
        color: 'purple'
      },
      pricing: {
        title: 'ตารางราคา',
        icon: DollarSign,
        color: 'orange'
      }
    };
    return configs[currentTab];
  };

  const TabButton = ({ tabKey, config, isActive }) => {
    const Icon = config.icon;
    const activeClasses = isActive
      ? `bg-${config.color}-600 text-white`
      : `text-${config.color}-600 hover:bg-${config.color}-50`;
    
    return (
      <button
        onClick={() => setCurrentTab(tabKey)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeClasses}`}
      >
        <Icon className="w-5 h-5" />
        <span>{config.title}</span>
      </button>
    );
  };

  const currentData = masterData[currentTab] || [];
  const tabConfig = getTabConfig();

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">ระบบตั้งค่าแพ็คเกจและราคา</h1>
          <div className="text-sm text-gray-500">
            จัดการแพ็คเกจ เวชภัณฑ์ รายการเหมา และตารางราคา
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 rounded-lg">
          {Object.entries({
            packages: { title: 'คอร์สแพ็คเกจกายภาพ', icon: Package, color: 'blue' },
            medical: { title: 'รายการเหมาเวชภัณฑ์', icon: FileText, color: 'green' },
            contracts: { title: 'รายการเหมา', icon: Settings, color: 'purple' },
            pricing: { title: 'ตารางราคา', icon: DollarSign, color: 'orange' }
          }).map(([key, config]) => (
            <TabButton
              key={key}
              tabKey={key}
              config={config}
              isActive={currentTab === key}
            />
          ))}
        </div>

        {/* Content Area */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{tabConfig.title}</h2>
            <button
              onClick={() => openModal()}
              disabled={loading}
              className={`bg-${tabConfig.color}-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-${tabConfig.color}-700 transition-colors flex items-center gap-2 disabled:opacity-50`}
            >
              <Plus className="w-4 h-4" />
              เพิ่มรายการใหม่
            </button>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600">กำลังโหลด...</p>
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r">
                        ชื่อรายการ
                      </th>
                      {currentTab === 'packages' && (
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r">
                          ระยะเวลา
                        </th>
                      )}
                      {currentTab === 'medical' && (
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r">
                          หน่วย
                        </th>
                      )}
                      {currentTab === 'contracts' && (
                        <>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r">
                            หมวดหมู่
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r">
                            การเรียกเก็บ
                          </th>
                        </>
                      )}
                      {currentTab === 'pricing' && (
                        <>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r">
                            ประเภท
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r">
                            หน่วย
                          </th>
                        </>
                      )}
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r">
                        ราคา
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r">
                        สถานะ
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                          ไม่มีข้อมูล
                        </td>
                      </tr>
                    ) : (
                      currentData.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="px-4 py-3 border-r">
                            <div>
                              <div className="font-medium">{item.name}</div>
                              {item.description && (
                                <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                              )}
                            </div>
                          </td>
                          {currentTab === 'packages' && (
                            <td className="px-4 py-3 border-r">{item.duration}</td>
                          )}
                          {currentTab === 'medical' && (
                            <td className="px-4 py-3 border-r">{item.unit}</td>
                          )}
                          {currentTab === 'contracts' && (
                            <>
                              <td className="px-4 py-3 border-r">{item.category}</td>
                              <td className="px-4 py-3 border-r">
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                  {item.billing}
                                </span>
                              </td>
                            </>
                          )}
                          {currentTab === 'pricing' && (
                            <>
                              <td className="px-4 py-3 border-r">
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                                  {item.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 border-r">{item.unit}</td>
                            </>
                          )}
                          <td className="px-4 py-3 border-r">
                            <span className="font-semibold text-green-600">
                              {Number(item.price).toLocaleString()} บาท
                            </span>
                          </td>
                          <td className="px-4 py-3 border-r">
                            <button
                              onClick={() => toggleItemStatus(item.id)}
                              disabled={loading}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                item.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {item.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openModal(item)}
                                disabled={loading}
                                className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                disabled={loading}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary */}
          {!loading && currentData.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{currentData.length}</div>
                  <div className="text-gray-600">รายการทั้งหมด</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {currentData.filter(item => item.isActive).length}
                  </div>
                  <div className="text-gray-600">เปิดใช้งาน</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(currentData.reduce((sum, item) => sum + Number(item.price), 0) / currentData.length || 0).toLocaleString()}
                  </div>
                  <div className="text-gray-600">ราคาเฉลี่ย (บาท)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingItem ? 'แก้ไข' : 'เพิ่ม'}{tabConfig.title}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อรายการ *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={modalForm.name}
                    onChange={handleModalInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รายละเอียด
                  </label>
                  <textarea
                    name="description"
                    value={modalForm.description}
                    onChange={handleModalInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {currentTab === 'pricing' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ประเภท *</label>
                    <select
                      name="type"
                      value={modalForm.type}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">เลือกประเภท</option>
                      <option value="ห้องพัก">ห้องพัก</option>
                      <option value="บริการ">บริการ</option>
                      <option value="อุปกรณ์">อุปกรณ์</option>
                      <option value="ยา">ยา</option>
                      <option value="ตรวจ">ตรวจ</option>
                    </select>
                  </div>
                )}

                {currentTab === 'contracts' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่ *</label>
                    <input
                      type="text"
                      name="category"
                      value={modalForm.category}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}

                {currentTab === 'packages' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ระยะเวลา</label>
                    <input
                      type="text"
                      name="duration"
                      value={modalForm.duration}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {(currentTab === 'medical' || currentTab === 'pricing') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">หน่วย</label>
                    <select
                      name="unit"
                      value={modalForm.unit}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">เลือกหน่วย</option>
                      <option value="ชุด">ชุด</option>
                      <option value="วัน">วัน</option>
                      <option value="ครั้ง">ครั้ง</option>
                      <option value="เดือน">เดือน</option>
                    </select>
                  </div>
                )}

                {currentTab === 'contracts' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">การเรียกเก็บ *</label>
                    <select
                      name="billing"
                      value={modalForm.billing}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">เลือกการเรียกเก็บ</option>
                      <option value="รายวัน">รายวัน</option>
                      <option value="รายเดือน">รายเดือน</option>
                      <option value="รายปี">รายปี</option>
                      <option value="ครั้งเดียว">ครั้งเดียว</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ราคา (บาท) *</label>
                  <input
                    type="number"
                    name="price"
                    value={modalForm.price}
                    onChange={handleModalInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 mt-6">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={modalForm.isActive}
                      onChange={handleModalInputChange}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">เปิดใช้งาน</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {editingItem ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}