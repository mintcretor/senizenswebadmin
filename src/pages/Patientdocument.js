import React, { useState, useEffect } from 'react';
import { Upload, FolderPlus, File, Folder, Trash2, Download, Search, Grid, List, ChevronRight, Home, FileText, Image as ImageIcon, FileArchive } from 'lucide-react';

export default function PatientDocumentManager() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPath, setCurrentPath] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Load data from storage on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save data whenever items change
  useEffect(() => {
    saveData();
  }, [items]);

  const loadData = async () => {
    try {
      const result = await window.storage.get('patient-documents');
      if (result && result.value) {
        setItems(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('No existing data found, starting fresh');
    }
  };

  const saveData = async () => {
    try {
      await window.storage.set('patient-documents', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving data:', error);
    }
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

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: 'file',
      size: file.size,
      fileType: file.type,
      uploadDate: new Date().toISOString(),
      file: file
    }));

    addItemsToCurrentLocation(newFiles);
  };

  const addItemsToCurrentLocation = (newItems) => {
    if (currentPath.length === 0) {
      setItems([...items, ...newItems]);
    } else {
      const updatedItems = [...items];
      let current = updatedItems;
      
      for (let i = 0; i < currentPath.length - 1; i++) {
        const folder = current.find(item => item.id === currentPath[i].id);
        current = folder.children;
      }
      
      const lastFolder = current.find(item => item.id === currentPath[currentPath.length - 1].id);
      lastFolder.children = [...lastFolder.children, ...newItems];
      
      setItems(updatedItems);
    }
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder = {
      id: Date.now(),
      name: newFolderName,
      type: 'folder',
      children: [],
      createdDate: new Date().toISOString()
    };

    addItemsToCurrentLocation([newFolder]);
    setNewFolderName('');
    setShowNewFolderModal(false);
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

  const deleteSelected = () => {
    if (selectedItems.size === 0) return;
    
    const deleteFromArray = (arr) => {
      return arr.filter(item => {
        if (selectedItems.has(item.id)) {
          return false;
        }
        if (item.type === 'folder') {
          item.children = deleteFromArray(item.children);
        }
        return true;
      });
    };

    setItems(deleteFromArray([...items]));
    setSelectedItems(new Set());
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
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileIcon = (item) => {
    if (item.type === 'folder') {
      return <Folder className="w-8 h-8 text-blue-500" />;
    }
    
    const fileType = item.fileType || '';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">ระบบจัดการเอกสารผู้ป่วย</h1>
                <p className="text-sm text-gray-600">Patient Document Management System</p>
              </div>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors">
                <Upload className="w-5 h-5" />
                <span>อัพโหลดเอกสาร</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
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
        <div className="bg-white rounded-lg shadow-md p-6">
          {currentItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Folder className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>ไม่มีเอกสารหรือโฟลเดอร์</p>
              <p className="text-sm">เริ่มต้นโดยการอัพโหลดเอกสารหรือสร้างโฟลเดอร์ใหม่</p>
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
                      ? `${item.children.length} รายการ`
                      : formatFileSize(item.size)
                    }
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
                        {formatDate(item.uploadDate || item.createdDate)}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.type === 'folder' 
                        ? `${item.children.length} รายการ`
                        : formatFileSize(item.size)
                      }
                    </div>
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