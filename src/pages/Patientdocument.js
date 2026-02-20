import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Upload, FolderPlus, File, Folder, Trash2, Download, Search,
  Grid, List, ChevronRight, Home, FileText, Image as ImageIcon,
  FileArchive, ArrowLeft, User, Images, X, ChevronLeft, ChevronRight as ChevronRightIcon, ZoomIn
} from 'lucide-react';
import api, { getImageBaseURL } from '../api/baseapi';

// ─── Lightbox Component ────────────────────────────────────────────────────────
function Lightbox({ images, currentIndex, onClose, onNext, onPrev }) {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  // Reset เมื่อเปลี่ยนรูป
  useEffect(() => {
    setRotation(0);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') { if (scale > 1) { setScale(1); setPosition({ x: 0, y: 0 }); } else onClose(); }
      if (e.key === 'ArrowRight' && scale === 1) onNext();
      if (e.key === 'ArrowLeft' && scale === 1) onPrev();
      if (e.key === 'r' || e.key === 'R') setRotation(r => (r + 90) % 360);
      if (e.key === 'l' || e.key === 'L') setRotation(r => (r - 90 + 360) % 360);
      if (e.key === '+' || e.key === '=') setScale(s => Math.min(s + 0.25, 5));
      if (e.key === '-') setScale(s => { const ns = Math.max(s - 0.25, 1); if (ns === 1) setPosition({ x: 0, y: 0 }); return ns; });
      if (e.key === '0') { setScale(1); setPosition({ x: 0, y: 0 }); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onNext, onPrev, scale]);

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setScale(s => {
      const ns = Math.min(Math.max(s + delta, 1), 5);
      if (ns === 1) setPosition({ x: 0, y: 0 });
      return ns;
    });
  };

  // Mouse drag (เมื่อ zoom แล้ว)
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  // Touch pinch zoom
  const lastTouchDist = useRef(null);
  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (lastTouchDist.current !== null) {
        const delta = (dist - lastTouchDist.current) * 0.01;
        setScale(s => Math.min(Math.max(s + delta, 1), 5));
      }
      lastTouchDist.current = dist;
    }
  };
  const handleTouchEnd = () => { lastTouchDist.current = null; };

  const rotateRight = (e) => { e.stopPropagation(); setRotation(r => (r + 90) % 360); };
  const rotateLeft = (e) => { e.stopPropagation(); setRotation(r => (r - 90 + 360) % 360); };
  const zoomIn = (e) => { e.stopPropagation(); setScale(s => Math.min(s + 0.25, 5)); };
  const zoomOut = (e) => { e.stopPropagation(); setScale(s => { const ns = Math.max(s - 0.25, 1); if (ns === 1) setPosition({ x: 0, y: 0 }); return ns; }); };
  const zoomReset = (e) => { e.stopPropagation(); setScale(1); setPosition({ x: 0, y: 0 }); };
  const handlePrint = (e) => {
    e.stopPropagation();
    const imgUrl = getImageBaseURL() + current.file_url;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
    <html>
      <head>
        <title>${current.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: white;
            font-family: sans-serif;
          }
          img {
            max-width: 100%;
            max-height: 90vh;
            object-fit: contain;
            transform: rotate(${rotation}deg);
          }
          p {
            margin-top: 12px;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body { margin: 0; }
            img { max-height: 95vh; }
          }
        </style>
      </head>
      <body>
        <img src="${imgUrl}" alt="${current.name}" />
        <p>${current.name}</p>
        <script>
          window.onload = () => {
            window.print();
            window.onafterprint = () => window.close();
          };
        </script>
      </body>
    </html>
  `);
    printWindow.document.close();
  };

  const current = images[currentIndex];
  if (!current) return null;

  const isRotated90 = rotation === 90 || rotation === 270;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center select-none"
      style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
      onClick={() => { if (scale > 1) { setScale(1); setPosition({ x: 0, y: 0 }); } else onClose(); }}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white z-10 p-2 rounded-full hover:bg-white/10 transition-colors"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        <X size={24} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/40 px-3 py-1 rounded-full z-10">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Rotation controls — ซ้ายบน */}
      <div className="absolute top-4 left-4 flex items-center gap-1 z-10" onClick={e => e.stopPropagation()}>
        <button onClick={rotateLeft} title="หมุนซ้าย (L)" className="text-white p-2 rounded-full hover:bg-white/10 transition-colors" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
          </svg>
        </button>
        <span className="text-white/60 text-xs w-8 text-center">{rotation}°</span>
        <button onClick={rotateRight} title="หมุนขวา (R)" className="text-white p-2 rounded-full hover:bg-white/10 transition-colors" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
          </svg>
        </button>
      </div>

      {/* Print button — ซ้ายบน ต่อจาก rotation */}
      <div className="absolute top-14 left-4 z-10" onClick={e => e.stopPropagation()}>
        <button
          onClick={handlePrint}
          title="พิมพ์รูปภาพ"
          className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
        </button>
      </div>

      {/* Zoom controls — ขวาบน (ใต้ปุ่มปิด) */}
      <div className="absolute top-14 right-4 flex flex-col items-center gap-1 z-10" onClick={e => e.stopPropagation()}>
        <button onClick={zoomIn} title="ขยาย (+)" className="text-white p-2 rounded-full hover:bg-white/10 transition-colors" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <span
          className="text-white/60 text-xs w-10 text-center cursor-pointer hover:text-white transition-colors"
          onClick={zoomReset}
          title="Reset zoom (0)"
        >
          {Math.round(scale * 100)}%
        </span>
        <button onClick={zoomOut} title="ย่อ (-)" className="text-white p-2 rounded-full hover:bg-white/10 transition-colors" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
      </div>

      {/* Prev (ซ่อนตอน zoom) */}
      {images.length > 1 && scale === 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {/* Image container */}
      <div
        className="flex flex-col items-center gap-3"
        style={{ maxWidth: '90vw', maxHeight: '90vh', padding: '4rem' }}
        onClick={(e) => e.stopPropagation()}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{
          width: isRotated90 ? '60vh' : '80vw',
          height: isRotated90 ? '80vw' : '75vh',
          maxWidth: isRotated90 ? '60vh' : '900px',
          maxHeight: isRotated90 ? '900px' : '75vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: scale > 1 ? 'hidden' : 'visible',
        }}>
          <img
            ref={imgRef}
            src={getImageBaseURL() + current.file_url}
            alt={current.name}
            draggable={false}
            onMouseDown={handleMouseDown}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              transform: `rotate(${rotation}deg) scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease',
              borderRadius: '8px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
              userSelect: 'none',
            }}
          />
        </div>
        <p className="text-white/70 text-sm truncate max-w-md">{current.name}</p>
      </div>

      {/* Next (ซ่อนตอน zoom) */}
      {images.length > 1 && scale === 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        >
          <ChevronRightIcon size={32} />
        </button>
      )}

      {/* Hint เมื่อ zoom */}
      {scale > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/40 text-xs">
          ลากเพื่อเลื่อนดู • กด Esc หรือคลิกพื้นหลังเพื่อ reset zoom
        </div>
      )}

      {/* Thumbnail strip (ซ่อนตอน zoom) */}
      {images.length > 1 && scale === 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-lg px-2">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={(e) => { e.stopPropagation(); onNext(idx - currentIndex); }}
              className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-80'
                }`}
            >
              <img src={getImageBaseURL() + img.file_url} alt={img.name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PatientDocumentManager() {
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const patient = location.state?.patient;

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'gallery'
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

  // Lightbox state
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    if (patientId) {
      loadPatientData();
      loadDocuments();
    }
  }, [patientId]);

  const loadPatientData = async () => {
    if (!patientData) {
      try {
        const response = await api.get(`/patients/${patientId}`);
        setPatientData(response.data.data);
      } catch (error) {
        console.error('Error loading patient data:', error);
      }
    }
  };


  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/documents/patients/${patientId}/documents`);
      setItems(buildTreeStructure(response.data.data));
    } catch (error) {
      console.error('Error loading documents:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const buildTreeStructure = (flatData) => {
    const itemMap = {};
    const rootItems = [];
    flatData.forEach(item => {
      itemMap[item.id] = { ...item, children: item.type === 'folder' ? [] : undefined };
    });
    flatData.forEach(item => {
      if (item.parent_id === null) {
        rootItems.push(itemMap[item.id]);
      } else if (itemMap[item.parent_id]) {
        itemMap[item.parent_id].children.push(itemMap[item.id]);
      }
    });
    return rootItems;
  };

  const getCurrentItems = () => {
    let current = items;
    for (const folder of currentPath) {
      const found = current.find(item => item.id === folder.id);
      if (found && found.type === 'folder') current = found.children;
    }
    if (searchQuery) {
      return current.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return current;
  };

  // ── image helpers ──────────────────────────────────────────────────────────
  const isImage = (item) =>
    item.type === 'file' && (item.file_type || '').startsWith('image/');

  const getImageItems = (itemsList) => itemsList.filter(isImage);

  const openLightbox = (item, allItems) => {
    const images = getImageItems(allItems);
    const idx = images.findIndex(img => img.id === item.id);
    if (idx === -1) return;
    setLightboxImages(images);
    setLightboxIndex(idx);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const lightboxNext = useCallback((delta = 1) => {
    setLightboxIndex(i => (i + delta + lightboxImages.length) % lightboxImages.length);
  }, [lightboxImages.length]);

  const lightboxPrev = useCallback(() => {
    setLightboxIndex(i => (i - 1 + lightboxImages.length) % lightboxImages.length);
  }, [lightboxImages.length]);

  // ── upload / folder / delete / download ───────────────────────────────────
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    await uploadFiles(files);
  };

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); if (e.currentTarget === e.target) setIsDragging(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = async (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) await uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    try {
      const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;
      let successCount = 0, errorCount = 0;
      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('patient_id', patientId);
          formData.append('parent_id', parentId);
          formData.append('name', file.name);
          formData.append('type', 'file');
          await api.post(`/documents/patients/${patientId}/documents/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          successCount++;
        } catch { errorCount++; }
      }
      await loadDocuments();
      alert(errorCount === 0
        ? `อัพโหลดไฟล์สำเร็จ ${successCount} ไฟล์`
        : `อัพโหลดสำเร็จ ${successCount} ไฟล์, ล้มเหลว ${errorCount} ไฟล์`);
    } catch { alert('เกิดข้อผิดพลาดในการอัพโหลดไฟล์'); }
    finally { setUploading(false); }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;
      await api.post(`/documents/patients/${patientId}/documents/folder`, {
        name: newFolderName, type: 'folder', patient_id: patientId, parent_id: parentId
      });
      await loadDocuments();
      setNewFolderName(''); setShowNewFolderModal(false);
    } catch { alert('เกิดข้อผิดพลาดในการสร้างโฟลเดอร์'); }
  };

  const deleteSelected = async () => {
    if (selectedItems.size === 0) return;
    if (!window.confirm(`ต้องการลบรายการที่เลือก ${selectedItems.size} รายการ?`)) return;
    try {
      await Promise.all(Array.from(selectedItems).map(id =>
        api.delete(`/documents/patients/${patientId}/documents/${id}`)
      ));
      await loadDocuments();
      setSelectedItems(new Set());
      alert('ลบรายการสำเร็จ');
    } catch { alert('เกิดข้อผิดพลาดในการลบรายการ'); }
  };

  const downloadFile = async (item) => {
    if (item.type === 'folder') return;
    try {
      const response = await api.get(
        `/documents/patients/${patientId}/documents/${item.id}/download`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', item.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch { alert('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์'); }
  };

  const openFolder = (folder) => setCurrentPath([...currentPath, folder]);
  const navigateToPath = (index) => setCurrentPath(currentPath.slice(0, index));
  const goHome = () => setCurrentPath([]);
  const toggleSelection = (id) => {
    const s = new Set(selectedItems);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedItems(s);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getFileIcon = (item) => {
    if (item.type === 'folder') return <Folder size={24} className="text-yellow-500" />;
    const ft = item.file_type || '';
    if (ft.startsWith('image/')) return <ImageIcon size={24} className="text-purple-500" />;
    if (ft.includes('pdf')) return <FileText size={24} className="text-red-500" />;
    if (ft.includes('zip') || ft.includes('rar')) return <FileArchive size={24} className="text-orange-500" />;
    return <File size={24} className="text-blue-500" />;
  };

  const currentItems = getCurrentItems();
  const imageItems = getImageItems(currentItems);
  const hasImages = imageItems.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={lightboxNext}
          onPrev={lightboxPrev}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">เอกสารผู้ป่วย</h1>
        </div>
        {patientData && (
          <div className="flex items-center gap-2 text-sm text-gray-600 ml-10">
            <User size={16} />
            <span className="font-medium">
              {patientData.name || `${patientData.first_name} ${patientData.last_name}`}
            </span>
            {patientData.hn && <span className="text-gray-400">(HN: {patientData.hn})</span>}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap items-center gap-3">
        {/* Upload */}
        <label className={`cursor-pointer px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-white text-sm font-medium ${uploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
          <Upload size={16} />
          {uploading ? 'กำลังอัพโหลด...' : 'อัพโหลดเอกสาร'}
          <input type="file" multiple className="hidden" onChange={handleFileUpload} disabled={uploading} />
        </label>

        {/* New folder */}
        <button
          onClick={() => setShowNewFolderModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
        >
          <FolderPlus size={16} />
          สร้างโฟลเดอร์
        </button>

        {/* Delete selected */}
        {selectedItems.size > 0 && (
          <button
            onClick={deleteSelected}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <Trash2 size={16} />
            ลบ ({selectedItems.size})
          </button>
        )}

        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาเอกสาร..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            title="Grid view"
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            title="List view"
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
          >
            <List size={16} />
          </button>
          {hasImages && (
            <button
              onClick={() => setViewMode('gallery')}
              title="Gallery view (รูปภาพ)"
              className={`p-1.5 rounded ${viewMode === 'gallery' ? 'bg-white shadow' : ''}`}
            >
              <Images size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-6 py-2 flex items-center gap-1 text-sm text-gray-600 bg-white border-b border-gray-100">
        <button onClick={goHome} className="hover:text-blue-600 transition-colors flex items-center gap-1">
          <Home size={14} /> หน้าหลัก
        </button>
        {currentPath.map((folder, index) => (
          <React.Fragment key={folder.id}>
            <ChevronRight size={14} className="text-gray-400" />
            <button
              onClick={() => navigateToPath(index + 1)}
              className="hover:text-blue-600 transition-colors"
            >
              {folder.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Drop zone wrapper */}
      <div
        className="flex-1 p-6 relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/90 pointer-events-none">
            <Upload size={48} className="text-blue-400 mb-3" />
            <p className="text-blue-600 font-semibold text-lg">วางไฟล์ที่นี่เพื่ออัพโหลด</p>
            <p className="text-blue-400 text-sm mt-1">รองรับหลายไฟล์พร้อมกัน</p>
          </div>
        )}

        {/* Empty state */}
        {currentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Folder size={64} className="mb-4 opacity-30" />
            <p className="text-lg font-medium mb-1">ไม่มีเอกสารหรือโฟลเดอร์</p>
            <p className="text-sm">เริ่มต้นโดยการอัพโหลดเอกสารหรือสร้างโฟลเดอร์ใหม่</p>
            <p className="text-xs mt-2 text-blue-400">💡 ลากไฟล์มาวางที่นี่เพื่ออัพโหลด</p>
          </div>

        ) : viewMode === 'gallery' ? (
          // ── GALLERY VIEW ────────────────────────────────────────────────────
          <>
            {/* Non-image items (folders + non-image files) */}
            {currentItems.filter(i => !isImage(i)).length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">โฟลเดอร์ / ไฟล์อื่นๆ</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {currentItems.filter(i => !isImage(i)).map(item => (
                    <div
                      key={item.id}
                      onClick={() => item.type === 'folder' ? openFolder(item) : null}
                      onDoubleClick={() => item.type === 'file' ? downloadFile(item) : null}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border cursor-pointer transition-all text-center
                        ${selectedItems.has(item.id) ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                    >
                      {getFileIcon(item)}
                      <span className="text-xs text-gray-700 truncate w-full">{item.name}</span>
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
                        className="w-3.5 h-3.5 mt-0.5"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image gallery grid */}
            {imageItems.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ImageIcon size={14} />
                  รูปภาพ ({imageItems.length} รูป)
                </p>
                <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 space-y-3">
                  {imageItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
                      onClick={() => openLightbox(item, currentItems)}
                    >
                      <img
                        src={item.file_url}
                        alt={item.name}
                        className="w-full object-cover block"
                        loading="lazy"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {/* Selection checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
                        className="absolute top-2 left-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                      {/* Name tooltip at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs truncate">{item.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>

        ) : viewMode === 'grid' ? (
          // ── GRID VIEW ───────────────────────────────────────────────────────
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {currentItems.map(item => (
              <div
                key={item.id}
                onClick={() => item.type === 'folder' ? openFolder(item) : null}
                onDoubleClick={() => item.type === 'file' ? (isImage(item) ? openLightbox(item, currentItems) : downloadFile(item)) : null}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all group
                  ${selectedItems.has(item.id) ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'}`}
              >
                {/* Image thumbnail in grid */}
                {
                  console.log('Rendering item:', item.name, 'file_url:', item.file_url)
                }
                {isImage(item) ? (
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={getImageBaseURL() + item.file_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ) : (
                  <div className="w-14 h-14 flex items-center justify-center">
                    {getFileIcon(item)}
                  </div>
                )}

                {/* Zoom hint for images */}
                {isImage(item) && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <ZoomIn size={20} className="text-blue-500" />
                  </div>
                )}

                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
                  className="absolute top-2 right-2 w-4 h-4"
                  onClick={(e) => e.stopPropagation()}
                />
                <p className="text-xs text-gray-700 text-center truncate w-full">{item.name}</p>
                <p className="text-xs text-gray-400">
                  {item.type === 'folder'
                    ? `${item.children?.length || 0} รายการ`
                    : formatFileSize(item.file_size)}
                </p>
                <p className="text-xs text-gray-300">{formatDate(item.created_at)}</p>
              </div>
            ))}
          </div>

        ) : (
          // ── LIST VIEW ───────────────────────────────────────────────────────
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {currentItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => item.type === 'folder' ? openFolder(item) : null}
                onDoubleClick={() => item.type === 'file' ? (isImage(item) ? openLightbox(item, currentItems) : downloadFile(item)) : null}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0 border-gray-100
                  ${selectedItems.has(item.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
                  className="w-4 h-4"
                  onClick={(e) => e.stopPropagation()}
                />
                {/* Thumbnail for images in list */}
                {isImage(item) ? (
                  <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                    <img src={getImageBaseURL() + item.file_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ) : (
                  getFileIcon(item)
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                </div>
                <p className="text-xs text-gray-400 hidden sm:block w-36 text-right">{formatDate(item.created_at)}</p>
                <p className="text-xs text-gray-400 w-20 text-right">
                  {item.type === 'folder'
                    ? `${item.children?.length || 0} รายการ`
                    : formatFileSize(item.file_size)}
                </p>
                {item.type === 'file' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); isImage(item) ? openLightbox(item, currentItems) : downloadFile(item); }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={isImage(item) ? 'ดูรูปภาพ' : 'ดาวน์โหลด'}
                  >
                    {isImage(item) ? <ZoomIn size={16} className="text-purple-500" /> : <Download size={16} />}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-80 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">สร้างโฟลเดอร์ใหม่</h3>
            <input
              type="text"
              placeholder="ชื่อโฟลเดอร์"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createFolder()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowNewFolderModal(false); setNewFolderName(''); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={createFolder}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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