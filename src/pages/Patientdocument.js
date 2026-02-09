import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Upload, FolderPlus, File, Folder, Trash2, Download, Search, Grid, List, ChevronRight, Home, FileText, Image as ImageIcon, FileArchive, ArrowLeft, User } from 'lucide-react';
import api from '../api/baseapi';

export default function PatientDocumentManager() {
  const { patientId } = useParams(); // รับ ID จาก URL params
  
  const location = useLocation();
  const navigate = useNavigate();
  const patient = location.state?.patient; // รับข้อมูลผู้ป่วยจาก state

  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPath, setCurrentPath] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [patientData, setPatientData] = useState(patient);
  const [isDragging, setIsDragging] = useState(false);

  // Load patient data and documents on mount
  useEffect(() => {
    console.log('Patient ID from URL:', patientId);
    if (patientId) {
      loadPatientData();
      loadDocuments();
    }
  }, [patientId]);

  // โหลดข้อมูลผู้ป่วย (ถ้าไม่มีใน state)
  const loadPatientData = async () => {
    if (!patientData) {
        console.log('Loading patient data from API for ID:', patientId);
      try {
        const response = await api.get(`/patients/${patientId}`);
        console.log('Patient data loaded:', response.data);
        setPatientData(response.data.data);
      } catch (error) {
        console.error('Error loading patient data:', error);
        // Redirect back if patient not found
        // navigate('/patients');
      }
    }
  };

  // โหลดเอกสารและโฟลเดอร์ทั้งหมดของผู้ป่วย
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/documents/patients/${patientId}/documents`);
      console.log('Documents loaded:', response.data);  
      setItems(buildTreeStructure(response.data.data));
    } catch (error) {
      console.error('Error loading documents:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // แปลงข้อมูลแบบ flat จาก database เป็น tree structure
  const buildTreeStructure = (flatData) => {
    const itemMap = {};
    const rootItems = [];

    // สร้าง map ของทุก items
    flatData.forEach(item => {
      itemMap[item.id] = {
        ...item,
        children: item.type === 'folder' ? [] : undefined
      };
    });

    // สร้าง tree structure
    flatData.forEach(item => {
      if (item.parent_id === null) {
        rootItems.push(itemMap[item.id]);
      } else if (itemMap[item.parent_id]) {
        itemMap[item.parent_id].children.push(itemMap[item.id]);
      }
    });

    return rootItems;
  };

  // แปลง tree structure เป็น flat data สำหรับส่งไปยัง API
  const flattenTreeStructure = (items, parentId = null) => {
    let result = [];
    items.forEach(item => {
      const flatItem = {
        id: item.id,
        name: item.name,
        type: item.type,
        parent_id: parentId,
        patient_id: patientId,
        file_url: item.file_url,
        file_type: item.file_type,
        file_size: item.file_size,
        created_at: item.created_at,
        updated_at: item.updated_at
      };
      result.push(flatItem);
      
      if (item.children && item.children.length > 0) {
        result = result.concat(flattenTreeStructure(item.children, item.id));
      }
    });
    return result;
  };

  const getCurrentItems = () => {
    let current = items;
    for (const folder of currentPath) {
      const found = current.find(item => item.id === folder.id);
      if (found && found.type === 'folder') {
        current = found.children;
      }
    }
    
    if (searchQuery) {
      return current.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return current;
  };

  // อัพโหลดไฟล์ไปยัง server
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    await uploadFiles(files);
  };

  // Handle drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragging to false if we're leaving the drop zone entirely
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    await uploadFiles(files);
  };

  // Upload files function (shared between file input and drag-drop)
  const uploadFiles = async (files) => {
    setUploading(true);

    try {
      // หา parent_id จาก current path
      const parentId = currentPath.length > 0 
        ? currentPath[currentPath.length - 1].id 
        : null;

      let successCount = 0;
      let errorCount = 0;

      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('patient_id', patientId);
          formData.append('parent_id', parentId);
          formData.append('name', file.name);
          formData.append('type', 'file');

          // อัพโหลดไฟล์
          const response = await api.post(`/documents/patients/${patientId}/documents/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          console.log('File uploaded:', response.data);
          successCount++;
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          errorCount++;
        }
      }

      // โหลดข้อมูลใหม่
      await loadDocuments();
      
      if (errorCount === 0) {
        alert(`อัพโหลดไฟล์สำเร็จ ${successCount} ไฟล์`);
      } else {
        alert(`อัพโหลดสำเร็จ ${successCount} ไฟล์, ล้มเหลว ${errorCount} ไฟล์`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('เกิดข้อผิดพลาดในการอัพโหลดไฟล์');
    } finally {
      setUploading(false);
    }
  };

  // สร้างโฟลเดอร์ใหม่
  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const parentId = currentPath.length > 0 
        ? currentPath[currentPath.length - 1].id 
        : null;

      const response = await api.post(`/documents/patients/${patientId}/documents/folder`, {
        name: newFolderName,
        type: 'folder',
        patient_id: patientId,
        parent_id: parentId
      });

      // โหลดข้อมูลใหม่
      await loadDocuments();
      setNewFolderName('');
      setShowNewFolderModal(false);
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('เกิดข้อผิดพลาดในการสร้างโฟลเดอร์');
    }
  };

  // ลบไฟล์หรือโฟลเดอร์
  const deleteSelected = async () => {
    if (selectedItems.size === 0) return;
    
    if (!window.confirm(`ต้องการลบรายการที่เลือก ${selectedItems.size} รายการ?`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedItems).map(itemId =>
        api.delete(`/documents/patients/${patientId}/documents/${itemId}`)
      );

      await Promise.all(deletePromises);
      
      // โหลดข้อมูลใหม่
      await loadDocuments();
      setSelectedItems(new Set());
      alert('ลบรายการสำเร็จ');
    } catch (error) {
      console.error('Error deleting items:', error);
      alert('เกิดข้อผิดพลาดในการลบรายการ');
    }
  };

  // ดาวน์โหลดไฟล์
  const downloadFile = async (item) => {
    if (item.type === 'folder') return;

    try {
      const response = await api.get(`/documents/patients/${patientId}/documents/${item.id}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', item.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์');
    }
  };

  const openFolder = (folder) => {
    setCurrentPath([...currentPath, folder]);
  };

  const navigateToPath = (index) => {
    setCurrentPath(currentPath.slice(0, index));
  };

  const goHome = () => {
    setCurrentPath([]);
  };

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (item) => {
    if (item.type === 'folder') {
      return <Folder className="w-8 h-8 text-blue-500" />;
    }
    
    const fileType = item.file_type || '';
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-green-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    } else if (fileType.includes('zip') || fileType.includes('rar')) {
      return <FileArchive className="w-8 h-8 text-yellow-500" />;
    }
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const currentItems = getCurrentItems();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">เอกสารผู้ป่วย</h1>
                {patientData && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>
                      {patientData.name || patientData.first_name + ' ' + patientData.last_name}
                      {patientData.hn && ` (HN: ${patientData.hn})`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <label className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload className="w-5 h-5" />
                <span>{uploading ? 'กำลังอัพโหลด...' : 'อัพโหลดเอกสาร'}</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>

              <button
                onClick={() => setShowNewFolderModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FolderPlus className="w-5 h-5" />
                <span>สร้างโฟลเดอร์</span>
              </button>

              {selectedItems.size > 0 && (
                <button
                  onClick={deleteSelected}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>ลบ ({selectedItems.size})</span>
                </button>
              )}
            </div>

            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ค้นหาเอกสาร..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <button
              onClick={goHome}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>หน้าหลัก</span>
            </button>
            
            {currentPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => navigateToPath(index + 1)}
                  className="hover:text-blue-600 transition-colors"
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Items Grid/List */}
        <div 
          className={`bg-white rounded-lg shadow-md p-6 relative ${isDragging ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-blue-50 bg-opacity-90 border-4 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <p className="text-xl font-bold text-blue-600">วางไฟล์ที่นี่เพื่ออัพโหลด</p>
                <p className="text-sm text-gray-600 mt-2">รองรับหลายไฟล์พร้อมกัน</p>
              </div>
            </div>
          )}

          {currentItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Folder className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>ไม่มีเอกสารหรือโฟลเดอร์</p>
              <p className="text-sm">เริ่มต้นโดยการอัพโหลดเอกสารหรือสร้างโฟลเดอร์ใหม่</p>
              <p className="text-sm mt-4 text-blue-600 font-medium">💡 ลากไฟล์มาวางที่นี่เพื่ออัพโหลด</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {currentItems.map(item => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                    selectedItems.has(item.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => item.type === 'folder' ? openFolder(item) : null}
                  onDoubleClick={() => item.type === 'file' ? downloadFile(item) : null}
                >
                  <div className="flex items-start justify-between mb-2">
                    {getFileIcon(item)}
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelection(item.id);
                      }}
                      className="w-5 h-5"
                    />
                  </div>
                  <p className="font-medium text-sm truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.type === 'folder' 
                      ? `${item.children?.length || 0} รายการ`
                      : formatFileSize(item.file_size)
                    }
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(item.created_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {currentItems.map(item => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedItems.has(item.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => item.type === 'folder' ? openFolder(item) : null}
                  onDoubleClick={() => item.type === 'file' ? downloadFile(item) : null}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelection(item.id);
                      }}
                      className="w-5 h-5"
                    />
                    {getFileIcon(item)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.type === 'folder' 
                        ? `${item.children?.length || 0} รายการ`
                        : formatFileSize(item.file_size)
                      }
                    </div>
                    {item.type === 'file' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(item);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Download className="w-5 h-5 text-blue-600" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">สร้างโฟลเดอร์ใหม่</h3>
            <input
              type="text"
              placeholder="ชื่อโฟลเดอร์"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createFolder()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={createFolder}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                สร้าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}