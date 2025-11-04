import React, { useState, useEffect, useRef } from 'react';
import { Printer, ArrowLeft, Eye, Pencil, Loader, AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const formatThaiDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = (d.getFullYear() + 543).toString();
  return `${day}/${month}/${year}`;
};

export default function ContractViewEditPrint() {
  const navigate = useNavigate();
  console.log(useParams());
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const printRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // State สำหรับข้อมูลสัญญา
  const [contractData, setContractData] = useState(null);

  // State สำหรับการแก้ไข
  const [editData, setEditData] = useState({
    basePrice: '',
    packages: [],
    medicalSupplies: [],
    contractItems: []
  });

  // โหลดข้อมูลสัญญา
  useEffect(() => {
    const fetchContractData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!id) {
          setError('ไม่พบรหัสสัญญา');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/service-registrations/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        if (result.success && result.data) {
          setContractData(result.data);
          setEditData({
            basePrice: result.data.contract_data?.basePrice || '',
            packages: result.data.contract_data?.packages || [],
            medicalSupplies: result.data.contract_data?.medicalSupplies || [],
            contractItems: result.data.contract_data?.contractItems || []
          });
        } else {
          setError('ไม่สามารถโหลดข้อมูลสัญญา');
        }
      } catch (err) {
        console.error('Error fetching contract:', err);
        setError(`เกิดข้อผิดพลาด: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContractData();
  }, [id, API_BASE_URL]);

  // ฟังก์ชันอัปเดตข้อมูล
  const handleUpdateContract = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        ...contractData,
        contract_data: {
          ...contractData.contract_data,
          basePrice: parseInt(editData.basePrice) || 0,
          packages: editData.packages,
          medicalSupplies: editData.medicalSupplies,
          contractItems: editData.contractItems
        }
      };

      const response = await fetch(`${API_BASE_URL}/service-registrations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        alert('บันทึกข้อมูลสำเร็จ');
        setContractData(result.data);
        setIsPreviewMode(false);
      }
    } catch (err) {
      console.error('Error updating contract:', err);
      setError(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ฟังก์ชันพิมพ์เอกสาร
  const handlePrint = () => {
    if (!contractData) return;

    const totalPrice = calculateTotalPrice();

    const printWindow = window.open('', '', 'height=900,width=1000');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>สัญญาการรับบริการ</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Cordia New', 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #fff;
            }
            .container {
              max-width: 900px;
              margin: 0 auto;
              padding: 30px 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .title {
              font-size: 26px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 14px;
              color: #666;
            }
            .section {
              margin: 20px 0;
            }
            .section-title {
              font-size: 14px;
              font-weight: bold;
              margin: 20px 0 12px 0;
              padding: 8px 12px;
              background-color: #e8f0ff;
              border-left: 4px solid #0066cc;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #ddd;
            }
            .info-label {
              font-weight: bold;
              min-width: 200px;
            }
            .info-value {
              flex: 1;
              text-align: right;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            th {
              background-color: #0066cc;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #ddd;
            }
            td {
              padding: 10px 12px;
              border: 1px solid #ddd;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .amount-cell {
              text-align: right;
            }
            .total-section {
              margin-top: 20px;
              text-align: right;
            }
            .total-box {
              background-color: #e3f2fd;
              padding: 15px 20px;
              border: 2px solid #0066cc;
              border-radius: 5px;
              display: inline-block;
              font-size: 16px;
              font-weight: bold;
            }
            .signature-section {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
              gap: 30px;
            }
            .signature-box {
              flex: 1;
              text-align: center;
            }
            .signature-line {
              border-top: 1px solid #333;
              width: 100%;
              margin-top: 60px;
              margin-bottom: 10px;
            }
            .date-line {
              font-size: 12px;
              margin-top: 10px;
            }
            .footer-text {
              text-align: center;
              margin-top: 30px;
              font-size: 11px;
              color: #999;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="title">สัญญาการรับบริการ</div>
              <div class="subtitle">ศูนย์บริการสุขภาพ</div>
            </div>

            <div class="section">
              <div class="section-title">ข้อมูลผู้รับบริการ</div>
              <div class="info-row">
                <span class="info-label">HN:</span>
                <span class="info-value">${contractData.patient?.hn || '-'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${contractData.patient_type || 'AN/VN'}:</span>
                <span class="info-value">${contractData.patient_type_number || '-'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">ชื่อ - นามสกุล:</span>
                <span class="info-value">${contractData.patient?.first_name || ''} ${contractData.patient?.last_name || ''}</span>
              </div>
              <div class="info-row">
                <span class="info-label">เลขบัตรประชาชน:</span>
                <span class="info-value">${contractData.patient?.id_card || '-'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">คลินิก/แผนก:</span>
                <span class="info-value">${contractData.department?.name || '-'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">วันที่สร้างสัญญา:</span>
                <span class="info-value">${formatThaiDate(contractData.registration_date)}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">ข้อมูลสัญญาการรักษา</div>
              <div class="info-row">
                <span class="info-label">หมายเลขห้อง:</span>
                <span class="info-value">${contractData.contract_data?.roomType || '-'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">ประเภทห้อง:</span>
                <span class="info-value">${contractData.contract_data?.room_type || '-'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">ชั้น:</span>
                <span class="info-value">${contractData.contract_data?.floor || '-'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">ประเภทการค่าบริการ:</span>
                <span class="info-value">${contractData.contract_data?.billingType || '-'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">วันเริ่มต้น:</span>
                <span class="info-value">${formatThaiDate(contractData.contract_data?.startDate)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">วันสิ้นสุด:</span>
                <span class="info-value">${formatThaiDate(contractData.contract_data?.endDate)}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">รายละเอียดค่าบริการ</div>
              <table>
                <thead>
                  <tr>
                    <th style="width: 10%;">ลำดับ</th>
                    <th style="width: 60%;">รายการ</th>
                    <th style="width: 30%;" class="amount-cell">ราคา (บาท)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>ค่าห้อง (${contractData.contract_data?.billingType || '-'})</td>
                    <td class="amount-cell">${(contractData.contract_data?.basePrice || 0).toLocaleString('th-TH')}</td>
                  </tr>
                  ${(contractData.contract_data?.packages || []).map((pkg, idx) => `
                    <tr>
                      <td>${idx + 2}</td>
                      <td>${pkg.name}</td>
                      <td class="amount-cell">${(pkg.finalPrice || pkg.price || 0).toLocaleString('th-TH')}</td>
                    </tr>
                  `).join('')}
                  ${(contractData.contract_data?.medicalSupplies || []).map((med, idx) => `
                    <tr>
                      <td>${(contractData.contract_data?.packages?.length || 0) + idx + 2}</td>
                      <td>${med.name}</td>
                      <td class="amount-cell">${(med.finalPrice || med.price || 0).toLocaleString('th-TH')}</td>
                    </tr>
                  `).join('')}
                  ${(contractData.contract_data?.contractItems || []).map((item, idx) => `
                    <tr>
                      <td>${(contractData.contract_data?.packages?.length || 0) + (contractData.contract_data?.medicalSupplies?.length || 0) + idx + 2}</td>
                      <td>${item.name} (${item.category})</td>
                      <td class="amount-cell">${(item.finalPrice || item.price || 0).toLocaleString('th-TH')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="total-section">
              <div class="total-box">
                รวมทั้งหมด: ${totalPrice.toLocaleString('th-TH')} บาท
              </div>
            </div>

            <div class="signature-section">
              <div class="signature-box">
                <p style="font-weight: bold; margin-bottom: 5px;">ลายเซ็นผู้รับบริการ/ผู้ปกครอง</p>
                <div class="signature-line"></div>
                <div class="date-line">วันที่ _____ / _____ / _____</div>
              </div>
              <div class="signature-box">
                <p style="font-weight: bold; margin-bottom: 5px;">ลายเซ็นเจ้าหน้าที่</p>
                <div class="signature-line"></div>
                <div class="date-line">วันที่ _____ / _____ / _____</div>
              </div>
            </div>

            <div class="footer-text">
              พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}
            </div>
          </div>

          <script>
            window.print();
            window.onafterprint = function() { window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // คำนวณราคารวม
  const calculateTotalPrice = () => {
    if (!contractData?.contract_data) return 0;
    const basePrice = contractData.contract_data.basePrice || 0;
    const packages = (contractData.contract_data.packages || []).reduce((sum, pkg) => sum + (pkg.finalPrice || pkg.price || 0), 0);
    const medical = (contractData.contract_data.medicalSupplies || []).reduce((sum, med) => sum + (med.finalPrice || med.price || 0), 0);
    const items = (contractData.contract_data.contractItems || []).reduce((sum, item) => sum + (item.finalPrice || item.price || 0), 0);
    return basePrice + packages + medical + items;
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-100 items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูลสัญญา...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !contractData) {
    return (
      <div className="flex min-h-screen bg-slate-100 items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <p className="text-red-600 font-semibold">เกิดข้อผิดพลาด</p>
          </div>
          <p className="text-gray-600 mb-6">{error || 'ไม่พบข้อมูลสัญญา'}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            กลับไป
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="flex-1 p-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="กลับไป"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  สัญญาการรับบริการ
                </h1>
                <p className="text-sm text-gray-600">
                  {contractData.patient?.first_name} {contractData.patient?.last_name}
                </p>
              </div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 pb-6 border-b">
            <button
              onClick={() => setIsPreviewMode(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                !isPreviewMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Pencil className="w-4 h-4" />
              แก้ไข
            </button>
            <button
              onClick={() => setIsPreviewMode(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                isPreviewMode
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Eye className="w-4 h-4" />
              ตรวจสอบ
            </button>
          </div>

          {isPreviewMode ? (
            // Preview Mode
            <div className="space-y-6">
              {/* Patient Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-l-4 border-blue-600 pl-3 bg-blue-50">ข้อมูลผู้รับบริการ</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">HN</p>
                    <p className="font-semibold">{contractData.patient?.hn || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">{contractData.patient_type || 'AN/VN'}</p>
                    <p className="font-semibold">{contractData.patient_type_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">ชื่อ-นามสกุล</p>
                    <p className="font-semibold">{contractData.patient?.first_name} {contractData.patient?.last_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">เลขบัตรประชาชน</p>
                    <p className="font-semibold">{contractData.patient?.id_card || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">คลินิก</p>
                    <p className="font-semibold">{contractData.department?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">วันที่สร้าง</p>
                    <p className="font-semibold">{formatThaiDate(contractData.registration_date)}</p>
                  </div>
                </div>
              </div>

              {/* Contract Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-l-4 border-blue-600 pl-3 bg-blue-50">ข้อมูลสัญญาการรักษา</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">หมายเลขห้อง</p>
                    <p className="font-semibold">{contractData.contract_data?.roomType || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">ประเภทห้อง</p>
                    <p className="font-semibold">{contractData.contract_data?.room_type || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">ชั้น</p>
                    <p className="font-semibold">{contractData.contract_data?.floor || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">ประเภทการค่าบริการ</p>
                    <p className="font-semibold">{contractData.contract_data?.billingType || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">วันเริ่มต้น</p>
                    <p className="font-semibold">{formatThaiDate(contractData.contract_data?.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">วันสิ้นสุด</p>
                    <p className="font-semibold">{formatThaiDate(contractData.contract_data?.endDate)}</p>
                  </div>
                </div>
              </div>

              {/* Services Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-l-4 border-blue-600 pl-3 bg-blue-50">รายละเอียดค่าบริการ</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="border border-gray-300 p-3 text-left w-16">ลำดับ</th>
                      <th className="border border-gray-300 p-3 text-left">รายการ</th>
                      <th className="border border-gray-300 p-3 text-right w-32">ราคา (บาท)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3">1</td>
                      <td className="border border-gray-300 p-3">ค่าห้อง ({contractData.contract_data?.billingType})</td>
                      <td className="border border-gray-300 p-3 text-right">{(contractData.contract_data?.basePrice || 0).toLocaleString('th-TH')}</td>
                    </tr>
                    {(contractData.contract_data?.packages || []).map((pkg, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-3">{idx + 2}</td>
                        <td className="border border-gray-300 p-3">{pkg.name}</td>
                        <td className="border border-gray-300 p-3 text-right">{(pkg.finalPrice || pkg.price || 0).toLocaleString('th-TH')}</td>
                      </tr>
                    ))}
                    {(contractData.contract_data?.medicalSupplies || []).map((med, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-3">{(contractData.contract_data?.packages?.length || 0) + idx + 2}</td>
                        <td className="border border-gray-300 p-3">{med.name}</td>
                        <td className="border border-gray-300 p-3 text-right">{(med.finalPrice || med.price || 0).toLocaleString('th-TH')}</td>
                      </tr>
                    ))}
                    {(contractData.contract_data?.contractItems || []).map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-3">{(contractData.contract_data?.packages?.length || 0) + (contractData.contract_data?.medicalSupplies?.length || 0) + idx + 2}</td>
                        <td className="border border-gray-300 p-3">{item.name} ({item.category})</td>
                        <td className="border border-gray-300 p-3 text-right">{(item.finalPrice || item.price || 0).toLocaleString('th-TH')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-6 text-right">
                <p className="text-2xl font-bold text-blue-900">
                  รวมทั้งหมด: {calculateTotalPrice().toLocaleString('th-TH')} บาท
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-start gap-4 pt-6 border-t">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Printer className="w-5 h-5" />
                  พิมพ์เอกสารสัญญา
                </button>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Patient Info - Read Only */}
              <div>
                <h3 className="text-lg font-semibold mb-4">ข้อมูลผู้รับบริการ</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">HN</label>
                    <input type="text" value={contractData.patient?.hn || ''} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{contractData.patient_type || 'AN/VN'}</label>
                    <input type="text" value={contractData.patient_type_number || ''} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                    <input type="text" value={`${contractData.patient?.first_name || ''} ${contractData.patient?.last_name || ''}`} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                  </div>
                </div>
              </div>

              {/* Contract Details - Editable */}
              <div>
                <h3 className="text-lg font-semibold mb-4">ข้อมูลสัญญา</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ห้อง</label>
                    <input type="text" value={contractData.contract_data?.roomType || ''} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
                    <input type="text" value={contractData.contract_data?.billingType || ''} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">วันเริ่มต้น</label>
                    <input type="text" value={formatThaiDate(contractData.contract_data?.startDate) || ''} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">วันสิ้นสุด</label>
                    <input type="text" value={formatThaiDate(contractData.contract_data?.endDate) || ''} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                  </div>
                </div>

                {/* Editable Base Price */}
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">ราคาห้องพื้นฐาน (บาท)</label>
                      <input
                        type="number"
                        value={editData.basePrice}
                        onChange={(e) => setEditData(prev => ({ ...prev, basePrice: e.target.value }))}
                        className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>
                    <div className="pt-6">
                      <p className="text-sm text-gray-600">ราคาปัจจุบัน</p>
                      <p className="text-2xl font-bold text-yellow-600">{parseInt(editData.basePrice || 0).toLocaleString('th-TH')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-4">สรุปรายการบริการ</h3>
                <div className="space-y-4">
                  {editData.packages.length > 0 && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="font-semibold text-purple-900 mb-2">แพ็คเกจกายภาพ ({editData.packages.length} รายการ)</p>
                      <ul className="text-sm space-y-1">
                        {editData.packages.map((pkg, idx) => (
                          <li key={idx} className="flex justify-between">
                            <span>{pkg.name}</span>
                            <span className="font-semibold">{(pkg.finalPrice || pkg.price || 0).toLocaleString('th-TH')} บาท</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {editData.medicalSupplies.length > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="font-semibold text-green-900 mb-2">เวชภัณฑ์ ({editData.medicalSupplies.length} รายการ)</p>
                      <ul className="text-sm space-y-1">
                        {editData.medicalSupplies.map((med, idx) => (
                          <li key={idx} className="flex justify-between">
                            <span>{med.name}</span>
                            <span className="font-semibold">{(med.finalPrice || med.price || 0).toLocaleString('th-TH')} บาท</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {editData.contractItems.length > 0 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="font-semibold text-blue-900 mb-2">รายการอื่นๆ ({editData.contractItems.length} รายการ)</p>
                      <ul className="text-sm space-y-1">
                        {editData.contractItems.map((item, idx) => (
                          <li key={idx} className="flex justify-between">
                            <span>{item.name} ({item.category})</span>
                            <span className="font-semibold">{(item.finalPrice || item.price || 0).toLocaleString('th-TH')} บาท</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-6 text-right">
                <p className="text-2xl font-bold text-blue-900">
                  รวมทั้งหมด: {calculateTotalPrice().toLocaleString('th-TH')} บาท
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-start gap-4 pt-6 border-t">
                <button
                  onClick={handleUpdateContract}
                  disabled={isSaving}
                  className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
                <button
                  onClick={() => setEditData({
                    basePrice: contractData.contract_data?.basePrice || '',
                    packages: contractData.contract_data?.packages || [],
                    medicalSupplies: contractData.contract_data?.medicalSupplies || [],
                    contractItems: contractData.contract_data?.contractItems || []
                  })}
                  className="bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}