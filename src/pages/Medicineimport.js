// components/MedicineImport.jsx
import React, { useState } from 'react';
import api from '../api/baseapi';
import './MedicineImport.css'; // หรือใช้ Tailwind/Material-UI

const MedicineImport = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('upload'); // 'upload', 'preview', 'result'

  // จัดการเมื่อเลือกไฟล์
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(null);
      setImportResult(null);
      setError(null);
      setStep('upload');
    }
  };

  // Preview ข้อมูลจากไฟล์
  const handlePreview = async () => {
    if (!file) {
      setError('กรุณาเลือกไฟล์');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/medicine/preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setPreview(response.data);
      setStep('preview');
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอ่านไฟล์');
    } finally {
      setLoading(false);
    }
  };

  // Import ข้อมูลเข้าฐานข้อมูล
  const handleImport = async () => {
    if (!file) {
      setError('กรุณาเลือกไฟล์');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/medicine/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImportResult(response.data);
      setStep('result');
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการ import ข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // Reset การ import
  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setImportResult(null);
    setError(null);
    setStep('upload');
  };

  return (
    <div className="medicine-import-container">
      <div className="import-card">
        <h2 className="import-title">นำเข้าข้อมูลยา</h2>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Step 1: Upload File */}
        {step === 'upload' && (
          <div className="upload-section">
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="file-upload"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="file-upload" className="file-label">
                <span className="upload-icon">📁</span>
                <span className="upload-text">
                  {file ? file.name : 'เลือกไฟล์ Excel (.xlsx, .xls)'}
                </span>
              </label>
            </div>

            {file && (
              <div className="file-info">
                <p>ไฟล์: {file.name}</p>
                <p>ขนาด: {(file.size / 1024).toFixed(2)} KB</p>
              </div>
            )}

            <div className="button-group">
              <button
                onClick={handlePreview}
                disabled={!file || loading}
                className="btn btn-primary"
              >
                {loading ? 'กำลังโหลด...' : 'ดูตัวอย่างข้อมูล'}
              </button>
              <button
                onClick={handleImport}
                disabled={!file || loading}
                className="btn btn-success"
              >
                {loading ? 'กำลัง Import...' : 'Import เข้าระบบทันที'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preview Data */}
        {step === 'preview' && preview && (
          <div className="preview-section">
            <div className="preview-header">
              <h3>ตัวอย่างข้อมูล</h3>
              <p>จำนวนแถวทั้งหมด: {preview.totalRows} แถว</p>
            </div>

            <div className="table-wrapper">
              <table className="preview-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>รหัส</th>
                    <th>ชื่อยา</th>
                    <th>Generic</th>
                    <th>รูปแบบ</th>
                    <th>ความแรง</th>
                    <th>หน่วย</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.preview.map((row, index) => (
                    <tr key={index} className={index === 0 || index === 1 ? 'header-row' : ''}>
                      <td>{row.rowNumber}</td>
                      <td>{row.code || '-'}</td>
                      <td>{row.name || '-'}</td>
                      <td>{row.genName || '-'}</td>
                      <td>{row.dform || '-'}</td>
                      <td>{row.strgth ? `${row.strgth} ${row.strgth_u || ''}` : '-'}</td>
                      <td>{row.unit || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="button-group">
              <button onClick={handleReset} className="btn btn-secondary">
                ยกเลิก
              </button>
              <button
                onClick={handleImport}
                disabled={loading}
                className="btn btn-success"
              >
                {loading ? 'กำลัง Import...' : 'ยืนยัน Import'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Import Result */}
        {step === 'result' && importResult && (
          <div className="result-section">
            <div className="result-header">
              <span className="success-icon">✅</span>
              <h3>Import เสร็จสิ้น</h3>
            </div>

            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-value">{importResult.summary.total}</div>
                <div className="summary-label">ทั้งหมด</div>
              </div>
              <div className="summary-card success">
                <div className="summary-value">{importResult.summary.success}</div>
                <div className="summary-label">สำเร็จ</div>
              </div>
              <div className="summary-card warning">
                <div className="summary-value">{importResult.summary.duplicates}</div>
                <div className="summary-label">ซ้ำ</div>
              </div>
              <div className="summary-card danger">
                <div className="summary-value">{importResult.summary.errors}</div>
                <div className="summary-label">ผิดพลาด</div>
              </div>
              <div className="summary-card info">
                <div className="summary-value">{importResult.summary.skipped}</div>
                <div className="summary-label">ข้าม</div>
              </div>
            </div>

            {/* แสดงรายการยาที่ซ้ำ */}
            {importResult.duplicates && importResult.duplicates.length > 0 && (
              <div className="duplicates-section">
                <h4>รายการยาที่มีในระบบแล้ว ({importResult.duplicates.length})</h4>
                <div className="list-wrapper">
                  <ul className="duplicate-list">
                    {importResult.duplicates.slice(0, 10).map((dup, index) => (
                      <li key={index}>
                        แถว {dup.row}: {dup.code} - {dup.name}
                      </li>
                    ))}
                  </ul>
                  {importResult.duplicates.length > 10 && (
                    <p className="more-info">และอีก {importResult.duplicates.length - 10} รายการ</p>
                  )}
                </div>
              </div>
            )}

            {/* แสดงรายการที่เกิดข้อผิดพลาด */}
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="errors-section">
                <h4>รายการที่เกิดข้อผิดพลาด ({importResult.errors.length})</h4>
                <div className="list-wrapper">
                  <ul className="error-list">
                    {importResult.errors.slice(0, 10).map((err, index) => (
                      <li key={index}>
                        แถว {err.row}: {err.error}
                      </li>
                    ))}
                  </ul>
                  {importResult.errors.length > 10 && (
                    <p className="more-info">และอีก {importResult.errors.length - 10} รายการ</p>
                  )}
                </div>
              </div>
            )}

            <div className="button-group">
              <button onClick={handleReset} className="btn btn-primary">
                Import ไฟล์ใหม่
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineImport;