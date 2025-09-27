import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, Save, Settings, Package, DollarSign, FileText } from 'lucide-react';

// Mock data for master items
const initialMasterData = {
  packages: [
    { id: 1, name: 'แพ็คเกจกายภาพบำบัด 10 ครั้ง', description: 'กายภาพบำบัดพื้นฐาน 10 ครั้ง รวมการประเมินและแผนการรักษา', price: 15000, duration: '1 เดือน', isActive: true },
    { id: 2, name: 'แพ็คเกจกายภาพบำบัด 20 ครั้ง', description: 'กายภาพบำบัดเข้มข้น 20 ครั้ง เหมาะสำหรับผู้ป่วยหนัก', price: 28000, duration: '2 เดือน', isActive: true },
    { id: 3, name: 'แพ็คเกจกายภาพบำบัดแบบเฉพาะ', description: 'กายภาพบำบัดเฉพาะทาง สำหรับโรคเฉพาะ', price: 5000, duration: '2 สัปดาห์', isActive: false },
    { id: 4, name: 'แพ็คเกจฟื้นฟูสมรรถภาพ', description: 'โปรแกรมฟื้นฟูสมรรถภาพแบบครบวงจร', price: 35000, duration: '3 เดือน', isActive: true },
  ],
  medical: [
    { id: 1, name: 'SET เวชภัณฑ์ Suction (ดูดเสมหะ)', description: 'ชุดอุปกรณ์สำหรับดูดเสมหะ รวมสายและถุงเก็บ', price: 8000, unit: 'ชุด', isActive: true },
    { id: 2, name: 'SET เวชภัณฑ์ ให้อาหารทางสายยาง', description: 'ชุดอุปกรณ์สำหรับการให้อาหารทางสายยาง', price: 6000, unit: 'ชุด', isActive: true },
    { id: 3, name: 'SET เวชภัณฑ์ดูแลแผล', description: 'ชุดอุปกรณ์สำหรับการดูแลและทำแผล', price: 4500, unit: 'ชุด', isActive: true },
    { id: 4, name: 'SET เวชภัณฑ์วัดสัญญาณชีพ', description: 'อุปกรณ์วัดความดัน อุณหภูมิ และชีพจร', price: 12000, unit: 'ชุด', isActive: true },
  ],
  contracts: [
    { id: 1, name: 'ค่าบริการหัตถการ เครื่องดูดเสมหะ (เดือน)', category: 'หัตถการ (ดูดเสมหะหล่อนพิด)', description: 'ค่าบริการใช้เครื่องดูดเสมหะรายเดือน', price: 7000, billing: 'รายเดือน', isActive: true },
    { id: 2, name: 'ค่าบริการค่าไฟ เครื่องผลิตออกซิเจน (เดือน)', category: 'ค่าไฟฟ้าเครื่องมือแพทย์', description: 'ค่าไฟฟ้าสำหรับเครื่องผลิตออกซิเจนรายเดือน', price: 6000, billing: 'รายเดือน', isActive: true },
    { id: 3, name: 'ค่าบริการดูแลอุปกรณ์การแพทย์', category: 'บำรุงรักษา', description: 'ค่าบำรุงรักษาและตรวจสอบอุปกรณ์การแพทย์', price: 3500, billing: 'รายเดือน', isActive: true },
    { id: 4, name: 'ค่าบริการพยาบาลเฉพาะทาง', category: 'บริการพยาบาล', description: 'ค่าบริการพยาบาลเฉพาะทางแบบตัวต่อตัว', price: 15000, billing: 'รายวัน', isActive: true },
  ],
  pricing: [
    { id: 1, type: 'ห้องพัก', name: 'ห้องเดี่ยวธรรมดา', price: 2500, unit: 'วัน', isActive: true },
    { id: 2, type: 'ห้องพัก', name: 'ห้องเดี่ยวพิเศษ', price: 3500, unit: 'วัน', isActive: true },
    { id: 3, type: 'ห้องพัก', name: 'ห้องคู่', price: 2000, unit: 'วัน', isActive: true },
    { id: 4, type: 'บริการ', name: 'ค่าธรรมเนียมแพทย์', price: 1500, unit: 'ครั้ง', isActive: true },
    { id: 5, type: 'บริการ', name: 'ค่าบริการพยาบาล 24 ชม.', price: 3000, unit: 'วัน', isActive: true },
    { id: 6, type: 'อุปกรณ์', name: 'ค่าเช่าเตียงผู้ป่วย', price: 500, unit: 'วัน', isActive: true },
    { id: 7, type: 'อุปกรณ์', name: 'ค่าเช่าเครื่องช่วยหายใจ', price: 2000, unit: 'วัน', isActive: true },
  ]
};

export default function ServiceManagementSystem() {
  const [currentTab, setCurrentTab] = useState('packages');
  const [masterData, setMasterData] = useState(initialMasterData);

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

  // Settings Management Functions
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

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      name: modalForm.name,
      description: modalForm.description,
      ...(currentTab === 'contracts' && { category: modalForm.category }),
      ...(currentTab === 'packages' && { duration: modalForm.duration }),
      ...(currentTab === 'medical' && { unit: modalForm.unit }),
      ...(currentTab === 'contracts' && { billing: modalForm.billing }),
      ...(currentTab === 'pricing' && { type: modalForm.type }),
      price: parseInt(modalForm.price),
      isActive: modalForm.isActive
    };

    setMasterData(prev => {
      const dataKey = currentTab;
      if (editingItem) {
        return {
          ...prev,
          [dataKey]: prev[dataKey].map(item => 
            item.id === editingItem.id ? newItem : item
          )
        };
      } else {
        return {
          ...prev,
          [dataKey]: [...prev[dataKey], newItem]
        };
      }
    });

    closeModal();
  };

  const handleDelete = (itemId) => {
    if (window.confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      setMasterData(prev => ({
        ...prev,
        [currentTab]: prev[currentTab].filter(item => item.id !== itemId)
      }));
    }
  };

  const toggleItemStatus = (itemId) => {
    setMasterData(prev => ({
      ...prev,
      [currentTab]: prev[currentTab].map(item => 
        item.id === itemId ? { ...item, isActive: !item.isActive } : item
      )
    }));
  };

  const getTabConfig = () => {
    const configs = {
      packages: {
        title: 'คอร์สแพ็คเกจกายภาพ',
        icon: Package,
        color: 'blue',
        fields: ['name', 'description', 'duration', 'price', 'isActive']
      },
      medical: {
        title: 'รายการเหมาเวชภัณฑ์',
        icon: FileText,
        color: 'green',
        fields: ['name', 'description', 'unit', 'price', 'isActive']
      },
      contracts: {
        title: 'รายการเหมา',
        icon: Settings,
        color: 'purple',
        fields: ['name', 'description', 'category', 'billing', 'price', 'isActive']
      },
      pricing: {
        title: 'ตารางราคา',
        icon: DollarSign,
        color: 'orange',
        fields: ['name', 'type', 'unit', 'price', 'isActive']
      }
    };
    return configs[currentTab];
  };

  const TabButton = ({ tabKey, config, isActive }) => {
    const Icon = config.icon;
    return (
      <button
        onClick={() => setCurrentTab(tabKey)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          isActive
            ? `bg-${config.color}-600 text-white`
            : `text-${config.color}-600 hover:bg-${config.color}-50`
        }`}
      >
        <Icon className="w-5 h-5" />
        <span>{config.title}</span>
      </button>
    );
  };

  const currentData = masterData[currentTab];
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
              className={`bg-${tabConfig.color}-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-${tabConfig.color}-700 transition-colors flex items-center gap-2`}
            >
              <Plus className="w-4 h-4" />
              เพิ่มรายการใหม่
            </button>
          </div>

          {/* Table */}
          <div className={`border border-${tabConfig.color}-300 rounded-lg overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`bg-${tabConfig.color}-50`}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-${tabConfig.color}-300`}>
                      ชื่อรายการ
                    </th>
                    {currentTab === 'packages' && (
                      <th className={`px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-${tabConfig.color}-300`}>
                        ระยะเวลา
                      </th>
                    )}
                    {currentTab === 'medical' && (
                      <th className={`px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-${tabConfig.color}-300`}>
                        หน่วย
                      </th>
                    )}
                    {currentTab === 'contracts' && (
                      <>
                        <th className={`px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-${tabConfig.color}-300`}>
                          หมวดหมู่
                        </th>
                        <th className={`px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-${tabConfig.color}-300`}>
                          การเรียกเก็บ
                        </th>
                      </>
                    )}
                    {currentTab === 'pricing' && (
                      <>
                        <th className={`px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-${tabConfig.color}-300`}>
                          ประเภท
                        </th>
                        <th className={`px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-${tabConfig.color}-300`}>
                          หน่วย
                        </th>
                      </>
                    )}
                    <th className={`px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-${tabConfig.color}-300`}>
                      ราคา
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-${tabConfig.color}-300`}>
                      สถานะ
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-medium text-gray-700`}>
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item) => (
                    <tr key={item.id} className={`border-t border-${tabConfig.color}-300`}>
                      <td className={`px-4 py-3 border-r border-${tabConfig.color}-300`}>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                          )}
                        </div>
                      </td>
                      {currentTab === 'packages' && (
                        <td className={`px-4 py-3 border-r border-${tabConfig.color}-300`}>
                          {item.duration}
                        </td>
                      )}
                      {currentTab === 'medical' && (
                        <td className={`px-4 py-3 border-r border-${tabConfig.color}-300`}>
                          {item.unit}
                        </td>
                      )}
                      {currentTab === 'contracts' && (
                        <>
                          <td className={`px-4 py-3 border-r border-${tabConfig.color}-300`}>
                            {item.category}
                          </td>
                          <td className={`px-4 py-3 border-r border-${tabConfig.color}-300`}>
                            <span className={`px-2 py-1 bg-${tabConfig.color}-100 text-${tabConfig.color}-800 rounded text-xs`}>
                              {item.billing}
                            </span>
                          </td>
                        </>
                      )}
                      {currentTab === 'pricing' && (
                        <>
                          <td className={`px-4 py-3 border-r border-${tabConfig.color}-300`}>
                            <span className={`px-2 py-1 bg-${tabConfig.color}-100 text-${tabConfig.color}-800 rounded text-xs`}>
                              {item.type}
                            </span>
                          </td>
                          <td className={`px-4 py-3 border-r border-${tabConfig.color}-300`}>
                            {item.unit}
                          </td>
                        </>
                      )}
                      <td className={`px-4 py-3 border-r border-${tabConfig.color}-300`}>
                        <span className="font-semibold text-green-600">
                          {item.price.toLocaleString()} บาท
                        </span>
                      </td>
                      <td className={`px-4 py-3 border-r border-${tabConfig.color}-300`}>
                        <button
                          onClick={() => toggleItemStatus(item.id)}
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
                            className={`text-${tabConfig.color}-600 hover:text-${tabConfig.color}-800`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
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
                  {Math.round(currentData.reduce((sum, item) => sum + item.price, 0) / currentData.length || 0).toLocaleString()}
                </div>
                <div className="text-gray-600">ราคาเฉลี่ย (บาท)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-start space-x-4 mt-8">
          <button className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" />
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingItem ? 'แก้ไข' : 'เพิ่ม'}{tabConfig.title}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อรายการ *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={modalForm.name}
                    onChange={handleModalInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="กรอกชื่อรายการ..."
                    required
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รายละเอียด
                  </label>
                  <textarea
                    name="description"
                    value={modalForm.description}
                    onChange={handleModalInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="กรอกรายละเอียด..."
                  />
                </div>

                {/* Type for pricing */}
                {currentTab === 'pricing' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ประเภท *</label>
                    <select
                      name="type"
                      value={modalForm.type}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                {/* Category for contracts */}
                {currentTab === 'contracts' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่ *</label>
                    <input
                      type="text"
                      name="category"
                      value={modalForm.category}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="กรอกหมวดหมู่..."
                      required
                    />
                  </div>
                )}

                {/* Duration for packages */}
                {currentTab === 'packages' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ระยะเวลา</label>
                    <input
                      type="text"
                      name="duration"
                      value={modalForm.duration}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="เช่น 1 เดือน, 2 สัปดาห์"
                    />
                  </div>
                )}

                {/* Unit for medical and pricing */}
                {(currentTab === 'medical' || currentTab === 'pricing') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">หน่วย</label>
                    <select
                      name="unit"
                      value={modalForm.unit}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">เลือกหน่วย</option>
                      <option value="ชุด">ชุด</option>
                      <option value="วัน">วัน</option>
                      <option value="ครั้ง">ครั้ง</option>
                      <option value="เดือน">เดือน</option>
                      <option value="ชิ้น">ชิ้น</option>
                      <option value="กล่อง">กล่อง</option>
                    </select>
                  </div>
                )}

                {/* Billing for contracts */}
                {currentTab === 'contracts' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">การเรียกเก็บ *</label>
                    <select
                      name="billing"
                      value={modalForm.billing}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ราคา (บาท) *</label>
                  <input
                    type="number"
                    name="price"
                    value={modalForm.price}
                    onChange={handleModalInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                {/* Status */}
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
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-${tabConfig.color}-600 text-white rounded-lg hover:bg-${tabConfig.color}-700 transition-colors`}
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