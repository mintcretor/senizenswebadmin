import React, { useState, useEffect } from 'react';
import { Search, Download, Calendar, Filter, X } from 'lucide-react';

const ProcedureReport = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchText, setSearchText] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [performerFilter, setPerformerFilter] = useState('');
  
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  useEffect(() => {
    filterRecords();
  }, [records, searchText, shiftFilter, performerFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/procedure-records?startDate=${startDate}&endDate=${endDate}&limit=1000`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const result = await response.json();
      
      if (result.success) {
        // ดึงรายละเอียดของแต่ละ record
        const detailedRecords = await Promise.all(
          result.data.map(async (record) => {
            const detailResponse = await fetch(
              `${API_BASE_URL}/procedure-records/${record.id}`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              }
            );
            const detailResult = await detailResponse.json();
            return detailResult.success ? detailResult.data : record;
          })
        );
        setRecords(detailedRecords);
      }
    } catch (error) {
      console.error('Load error:', error);
      alert('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...records];

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(r => 
        r.hn?.toLowerCase().includes(searchText.toLowerCase()) ||
        r.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        r.last_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        r.service_number?.toLowerCase().includes(searchText.toLowerCase()) ||
        r.room_number?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by shift
    if (shiftFilter !== 'all') {
      filtered = filtered.filter(r => r.shift === shiftFilter);
    }

    // Filter by created_by_name
    if (performerFilter) {
      filtered = filtered.filter(r => 
        r.created_by_name?.toLowerCase().includes(performerFilter.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  };

  const exportToExcel = () => {
    // สร้างข้อมูลสำหรับ Excel
    const excelData = [];
    
    // Header
    excelData.push([
      'วันที่',
      'เวลา',
      'เวร',
      'HN',
      'ชื่อ-นามสกุล',
      'Service Number',
      'หัตถการพยาบาล',
      'หัตถการไม่คิดเงิน',
      'ผู้บันทึก',
      'หมายเหตุ'
    ]);

    // Data rows
    filteredRecords.forEach(record => {
      const procedures = record.procedures?.map(p => 
        p.display_name
      ).join(', ') || '-';
      
      const nonChargeable = record.nonChargeableProcedures?.map(p => 
        p.procedure_name
      ).join(', ') || '-';

      excelData.push([
        record.record_date,
        record.record_time,
        record.shift,
        record.hn,
        `${record.first_name} ${record.last_name}`,
        record.service_number,
        procedures,
        nonChargeable,
        record.created_by_name || '-',
        record.note || '-'
      ]);
    });

    // แปลงเป็น CSV
    const csvContent = excelData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    // เพิ่ม BOM สำหรับ UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `รายงานหัตถการ_${startDate}_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPerformerLabel = (performer) => {
    return performer === 'nurse' ? 'พยาบาล' : 'ผู้ช่วย';
  };

  // สรุปสถิติ
  const stats = {
    total: filteredRecords.length,
    totalProcedures: filteredRecords.reduce((sum, r) => 
      sum + (r.procedures?.length || 0), 0
    ),
    totalNonChargeable: filteredRecords.reduce((sum, r) => 
      sum + (r.nonChargeableProcedures?.length || 0), 0
    )
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            รายงานสรุปหัตถการพยาบาล
          </h1>
          <p className="text-gray-600">สรุปรายการหัตถการที่บันทึกในระบบ</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium mb-2">วันที่เริ่มต้น</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium mb-2">วันที่สิ้นสุด</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* Shift Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">เวร</label>
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="all">ทั้งหมด</option>
                <option value="เช้า">เช้า</option>
                <option value="บ่าย">บ่าย</option>
                <option value="ดึก">ดึก</option>
              </select>
            </div>

            {/* Performer Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">ค้นหาผู้บันทึก</label>
              <input
                type="text"
                value={performerFilter}
                onChange={(e) => setPerformerFilter(e.target.value)}
                placeholder="ชื่อผู้บันทึก"
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ค้นหา HN, ชื่อ, Service Number..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">จำนวนบันทึก</p>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">หัตถการคิดเงิน</p>
            <p className="text-2xl font-bold text-green-600">{stats.totalProcedures}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">หัตถการไม่คิดเงิน</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalNonChargeable}</p>
          </div>
        </div>

        {/* Export Button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download size={20} />
            Export Excel
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">เวลา</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">เวร</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">HN</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ-นามสกุล</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ห้อง</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">หัตถการพยาบาล</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">หัตถการไม่คิดเงิน</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้บันทึก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{record.record_date}</td>
                      <td className="px-4 py-3 text-sm">{record.record_time}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {record.shift}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{record.hn}</td>
                      <td className="px-4 py-3 text-sm">{record.first_name} {record.last_name}</td>
                      <td className="px-4 py-3 text-sm">{record.room_number || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        {record.procedures && record.procedures.length > 0 ? (
                          <div className="space-y-1">
                            {record.procedures.map((proc, idx) => (
                              <div key={idx} className="text-xs font-medium">
                                {proc.display_name}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {record.nonChargeableProcedures && record.nonChargeableProcedures.length > 0 ? (
                          <div className="space-y-1">
                            {record.nonChargeableProcedures.map((proc, idx) => (
                              <div key={idx} className="text-xs text-gray-600">
                                {proc.procedure_name}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                          {record.created_by_name || 'ไม่ระบุ'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 text-sm text-gray-600 text-right">
          แสดง {filteredRecords.length} รายการ จากทั้งหมด {records.length} รายการ
        </div>
      </div>
    </div>
  );
};

export default ProcedureReport;