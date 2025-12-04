import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, ChevronDown } from 'lucide-react';
import { procedureService } from '../services/procedureService';
import { formatDateForInput, formatTime } from '../utils/dateUtils';

const ProcedureRecordEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Form states
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [shift, setShift] = useState('เช้า');
    const [note, setNote] = useState('');
    const [selectedProcedures, setSelectedProcedures] = useState([]);
    const [checkedOther, setCheckedOther] = useState([]);

    // Patient info
    const [patientInfo, setPatientInfo] = useState(null);

    // Modals
    const [showProcedureModal, setShowProcedureModal] = useState(false);
    const [showOtherModal, setShowOtherModal] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Sub-options
    const [oxygenHour, setOxygenHour] = useState('');
    const [infusionNG, setInfusionNG] = useState('');
    const [infusionIV, setInfusionIV] = useState('');
    const [showOxygenOptions, setShowOxygenOptions] = useState(false);
    const [showInfusionNGOptions, setShowInfusionNGOptions] = useState(false);
    const [showInfusionIVOptions, setShowInfusionIVOptions] = useState(false);

    // Machine numbers
    const [feedMachines, setFeedMachines] = useState([]);
    const [ivMachines, setIvMachines] = useState([]);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    const procedureItems = [
        { id: 1, name: "ทำแผลเจาะคอ", canPerform: "both" },
        { id: 2, name: "ทำแผลหน้าท้อง", canPerform: "both" },
        { id: 3, name: "ทำแผลขนาดเล็ก", canPerform: "both" },
        { id: 4, name: "ทำแผลขนาดกลาง", canPerform: "both" },
        { id: 5, name: "ทำแผลขนาดใหญ่", canPerform: "both" },
        { id: 6, name: "ให้ออกซิเจน (วัน)", canPerform: "both" },
        { id: 7, name: "ให้ออกซิเจน (ชั่วโมง)", canPerform: "both", hasSubOption: true, subType: "hour" },
        { id: 8, name: "ดูดเสมหะ", canPerform: "both" },
        { id: 9, name: "พ่นยา", canPerform: "both" },
        { id: 10, name: "ตัดไหม", canPerform: "both" },
        { id: 11, name: "ใส่สาย Foley", canPerform: "both" },
        { id: 12, name: "สวนปัสสาวะทิ้ง", canPerform: "both" },
        { id: 13, name: "สวนล้างกระเพาะปัสสาวะ", canPerform: "both" },
        { id: 14, name: "ใส่สาย NG", canPerform: "both" },
        { id: 15, name: "เจาะเลือด", canPerform: "both" },
        { id: 16, name: "ฉีดยา SC/ID", canPerform: "both" },
        { id: 17, name: "ฉีดยา IM", canPerform: "both" },
        { id: 18, name: "ฉีดยา IV", canPerform: "both" },
        { id: 19, name: "เครื่อง Infustion Pump NG", canPerform: "both", hasSubOption: true, subType: "machine_ng" },
        { id: 20, name: "เครื่อง Infustion Pump IV", canPerform: "both", hasSubOption: true, subType: "machine_iv" },
        { id: 21, name: "ให้สารน้ำทางหลอดเลือดดำ IV", canPerform: "both" },
        { id: 22, name: "EKG", canPerform: "both" },
        { id: 23, name: "เตียงลม", canPerform: "both" },
        { id: 24, name: "ค่าแพทย์ตรวจเยี่ยมนอกระบบ", canPerform: "both" },
        { id: 25, name: "ค่านักโภชนาการเยี่ยมนอกระบบ", canPerform: "both" },
        { id: 26, name: "Flush สาย IV(NSS lock)", canPerform: "both" },
        { id: 27, name: "หลอดตา", canPerform: "both" },
        { id: 28, name: "เหน็บยา", canPerform: "both" },
        { id: 29, name: "ดูดเสมหะก่อน Feed", canPerform: "both" },
        { id: 30, name: "ดูสาย Foley", canPerform: "both" },
        { id: 31, name: "พลิกตะแคงตัว", canPerform: "both" },
        { id: 32, name: "สวนอุจจาระ Enema", canPerform: "both" },
        { id: 33, name: "สวนอุจจาระ Evacuate", canPerform: "both" },
        { id: 34, name: "เจาะ DTX เครื่องคนไข้", canPerform: "both" },
        { id: 35, name: "เจาะ DTX (ใช้เครื่องศูนย์รวมเวชภัณฑ์) (ครั้ง)", canPerform: "both" },
        { id: 36, name: "NA เวรติดตามส่งผู้ป่วย", canPerform: "both" },
        { id: 37, name: "ญาติขอผ้าห่ม", canPerform: "both" },
        { id: 38, name: "ญาติขอผ้าเช็ดตัว", canPerform: "both" },
        { id: 39, name: "หัตถการอื่นๆ", canPerform: "both" }
    ];

    const otherColumns = [
        "อาบน้ำ / เช็ดตัว", "สระผม", "ให้ยาก่อนอาหารเช้า", "ให้ยาหลังอาหารเช้า",
        "ให้ยาก่อนอาหารเที่ยง", "ให้ยาหลังอาหารเที่ยง", "ให้ยาก่อนอาหารเย็น", "ให้ยาหลังอาหารเย็น",
        "ให้ยาก่อนนอน", "ให้อาหารทางสายยาง", "ให้น้ำระหว่างมื้อ", "ป้อนอาหารให้คนไข้",
        "เปลี่ยนผ้าอ้อม", "พลิกตะแคงตัว", "พยาบาลตรวจเยี่ยมประเมินอาการประจำเวร/แรกรับ",
        "ตรวจเยี่ยมประเมินอาการประจำเวร", "ทำความสะอาด Unit ผู้ป่วยประจำวัน", "หัตถการอื่นๆ"
    ];

    useEffect(() => {
        loadRecordData();
        loadMachineNumbers();
    }, [id]);

    const loadMachineNumbers = async () => {
        try {
            const machinesResult = await procedureService.getMachineNumbers();
            if (machinesResult.success) {
                const feedPumps = machinesResult.data
                    .filter(m => m.machine_type === 'feed_pump_ng')
                    .map(m => m.machine_number);
                const infusionPumps = machinesResult.data
                    .filter(m => m.machine_type === 'infusion_pump_iv')
                    .map(m => m.machine_number);

                setFeedMachines(feedPumps);
                setIvMachines(infusionPumps);
            }
        } catch (err) {
            console.error('Load machine numbers error:', err);
        }
    };

    const loadRecordData = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/procedure-records/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            const result = await response.json();
            console.log('Update result:', result);
            if (result.success) {
                const record = result.data;

                // Set form data
                setDate(formatDateForInput(record.record_date));
                setTime(record.record_time);
                setShift(record.shift);
                setNote(record.note || '');

                // Set patient info
                setPatientInfo({
                    hn: record.hn,
                    name: `${record.first_name} ${record.last_name}`,
                    service_number: record.service_number,
                    room_number: record.room_number
                });

                // Set procedures
                if (record.procedures && record.procedures.length > 0) {
                    const procedures = record.procedures.map(p => {
                        const procItem = procedureItems.find(item => item.id === p.type_id);
                        return {
                            id: p.type_id,
                            name: procItem?.name || p.display_name,
                            displayName: p.display_name,
                            performedBy: p.performed_by,
                            subOptionValue: p.sub_option_value,
                            canPerform: procItem?.canPerform || 'both',
                            hasSubOption: procItem?.hasSubOption,
                            subType: procItem?.subType
                        };
                    });
                    setSelectedProcedures(procedures);

                    // Set sub-option values
                    procedures.forEach(proc => {
                        if (proc.subType === 'hour' && proc.subOptionValue) {
                            setOxygenHour(proc.subOptionValue);
                            setShowOxygenOptions(true);
                        } else if (proc.subType === 'machine_ng' && proc.subOptionValue) {
                            setInfusionNG(proc.subOptionValue);
                            setShowInfusionNGOptions(true);
                        } else if (proc.subType === 'machine_iv' && proc.subOptionValue) {
                            setInfusionIV(proc.subOptionValue);
                            setShowInfusionIVOptions(true);
                        }
                    });
                }

                // Set non-chargeable procedures
                if (record.nonChargeableProcedures && record.nonChargeableProcedures.length > 0) {
                    setCheckedOther(record.nonChargeableProcedures.map(p => p.procedure_name));
                }
            } else {
                setError('ไม่พบข้อมูลบันทึก');
            }
        } catch (err) {
            console.error('Load record error:', err);
            setError('ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    const handleProcedureToggle = (item) => {
        const exists = selectedProcedures.find(p => p.id === item.id);

        if (exists) {
            setSelectedProcedures(selectedProcedures.filter(p => p.id !== item.id));

            if (item.subType === 'hour') {
                setShowOxygenOptions(false);
                setOxygenHour('');
            } else if (item.subType === 'machine_ng') {
                setShowInfusionNGOptions(false);
                setInfusionNG('');
            } else if (item.subType === 'machine_iv') {
                setShowInfusionIVOptions(false);
                setInfusionIV('');
            }
        } else {
            const defaultPerformer = item.canPerform === 'both' ? 'nurse' : item.canPerform;
            setSelectedProcedures([...selectedProcedures, {
                ...item,
                performedBy: defaultPerformer
            }]);

            if (item.subType === 'hour') setShowOxygenOptions(true);
            else if (item.subType === 'machine_ng') setShowInfusionNGOptions(true);
            else if (item.subType === 'machine_iv') setShowInfusionIVOptions(true);
        }
    };

    const handlePerformerChange = (procedureId, performer) => {
        setSelectedProcedures(selectedProcedures.map(p =>
            p.id === procedureId ? { ...p, performedBy: performer } : p
        ));
    };

    const handleOtherCheckbox = (item) => {
        if (checkedOther.includes(item)) {
            setCheckedOther(checkedOther.filter(i => i !== item));
        } else {
            setCheckedOther([...checkedOther, item]);
        }
    };

    const confirmProcedures = () => {
        const updated = selectedProcedures.map(proc => {
            if (proc.subType === 'hour' && oxygenHour) {
                return { ...proc, subOptionValue: oxygenHour, displayName: `${proc.name} ${oxygenHour} ชั่วโมง` };
            } else if (proc.subType === 'machine_ng' && infusionNG) {
                return { ...proc, subOptionValue: infusionNG, displayName: `${proc.name} หมายเลขเครื่อง ${infusionNG}` };
            } else if (proc.subType === 'machine_iv' && infusionIV) {
                return { ...proc, subOptionValue: infusionIV, displayName: `${proc.name} หมายเลขเครื่อง ${infusionIV}` };
            }
            return { ...proc, displayName: proc.name };
        });
        setSelectedProcedures(updated);
        setShowProcedureModal(false);
    };

    const handleSubmit = () => {
        setShowConfirmDialog(true);
    };

    const confirmUpdate = async () => {
        setSaving(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            const payload = {
                recordDate: date,
                recordTime: time,
                shift: shift,
                note: note || null,
                procedures: selectedProcedures.map(proc => ({
                    typeId: proc.id,
                    performedBy: proc.performedBy,
                    displayName: proc.displayName || proc.name,
                    subOptionValue: proc.subOptionValue || null
                })),
                nonChargeableProcedures: checkedOther,
                updatedBy: user.user_id || 1
            };

            const response = await fetch(
                `${API_BASE_URL}/procedure-records/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(payload)
                }
            );

            const result = await response.json();

            if (result.success) {
                alert('อัพเดทข้อมูลสำเร็จ');
                navigate('/ProcedureRecordList');
            } else {
                alert(`เกิดข้อผิดพลาด: ${result.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Update error:', err);
            alert('ไม่สามารถอัพเดทข้อมูลได้: ' + err.message);
        } finally {
            setSaving(false);
            setShowConfirmDialog(false);
        }
    };

    const getPerformerLabel = (performer) => {
        if (performer === 'nurse') return 'พยาบาล';
        if (performer === 'nurse_aid') return 'ผู้ช่วย';
        return '';
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

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/ProcedureRecordList')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        กลับหน้ารายการ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="pt-16 pb-24 px-6 max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/ProcedureRecordList')}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">แก้ไขบันทึกหัตถการ</h1>
                        <p className="text-sm text-gray-600">แก้ไขรายละเอียดการทำหัตถการ</p>
                    </div>
                </div>

                {/* Patient Info (Read-only) */}
                {patientInfo && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold mb-2">ข้อมูลผู้ป่วย</h3>
                        <div className="space-y-1 text-sm">
                            <p><strong>HN:</strong> {patientInfo.hn}</p>
                            <p><strong>ชื่อ:</strong> {patientInfo.name}</p>
                            <p><strong>Service Number:</strong> {patientInfo.service_number}</p>
                            {patientInfo.room_number && (
                                <p><strong>ห้อง:</strong> {patientInfo.room_number}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Date */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">วันที่</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-white border rounded-lg p-3"
                    />
                </div>

                {/* Time */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">เวลา</label>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-white border rounded-lg p-3"
                    />
                </div>

                {/* Shift */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">เวร</label>
                    <select
                        value={shift}
                        onChange={(e) => setShift(e.target.value)}
                        className="w-full bg-white border rounded-lg p-3"
                    >
                        <option value="เช้า">เช้า</option>
                        <option value="บ่าย">บ่าย</option>
                        <option value="ดึก">ดึก</option>
                    </select>
                </div>

                {/* Procedures */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">หัตถการพยาบาล</label>
                    <div
                        className="bg-white border rounded-lg p-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                        onClick={() => setShowProcedureModal(true)}
                    >
                        <span className="text-gray-700">
                            {selectedProcedures.length > 0
                                ? `เลือกแล้ว ${selectedProcedures.length} รายการ`
                                : 'เลือกหัตถการ'}
                        </span>
                        <ChevronDown size={20} className="text-gray-400" />
                    </div>

                    {selectedProcedures.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {selectedProcedures.map((proc, idx) => (
                                <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{proc.displayName || proc.name}</span>
                                        <span className="text-blue-600 text-xs">
                                            ({getPerformerLabel(proc.performedBy)})
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Other Procedures */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">หัตถการที่ไม่คิดเงิน</label>
                    <div
                        className="bg-white border rounded-lg p-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                        onClick={() => setShowOtherModal(true)}
                    >
                        <span className="text-gray-700">
                            {checkedOther.length > 0
                                ? `เลือกแล้ว ${checkedOther.length} รายการ`
                                : 'เลือกหัตถการ'}
                        </span>
                        <ChevronDown size={20} className="text-gray-400" />
                    </div>

                    {checkedOther.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {checkedOther.map((item, idx) => (
                                <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm">
                                    <span className="font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Note */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">หมายเหตุ</label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full border rounded-lg p-3 resize-none"
                        rows="3"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/procedure-records')}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full py-3 font-medium transition-colors"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full py-3 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Save size={20} />
                        บันทึก
                    </button>
                </div>
            </div>

            {/* Procedure Modal */}
            {showProcedureModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
                    <div className="bg-white rounded-lg w-full max-w-lg h-[90vh] sm:h-[85vh] overflow-hidden flex flex-col">
                        <div className="p-3 sm:p-4 border-b flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base sm:text-lg font-semibold">เลือกหัตถการพยาบาล</h2>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">เลือกหัตถการและระบุผู้ปฏิบัติ</p>
                                </div>
                                <button onClick={() => setShowProcedureModal(false)}>
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
                            {procedureItems.map((item, idx) => {
                                const isChecked = selectedProcedures.find(p => p.id === item.id);

                                return (
                                    <div key={idx} className="mb-2 sm:mb-3 border-b pb-2 sm:pb-3">
                                        <label className="flex items-start gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!isChecked}
                                                onChange={() => handleProcedureToggle(item)}
                                                className="w-4 h-4 mt-1 flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <span className="font-medium text-sm sm:text-base break-words">{item.name}</span>

                                                {isChecked && item.canPerform === 'both' && (
                                                    <select
                                                        value={isChecked.performedBy}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            handlePerformerChange(item.id, e.target.value);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="mt-2 w-full border rounded px-2 py-1.5 text-xs sm:text-sm"
                                                    >
                                                        <option value="nurse">พยาบาล</option>
                                                        <option value="nurse_aid">ผู้ช่วยพยาบาล</option>
                                                    </select>
                                                )}

                                                {isChecked && item.canPerform !== 'both' && (
                                                    <div className="mt-1">
                                                        <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 sm:py-1 rounded">
                                                            {getPerformerLabel(item.canPerform)}
                                                        </span>
                                                    </div>
                                                )}

                                                {item.name === 'ให้ออกซิเจน (ชั่วโมง)' && isChecked && showOxygenOptions && (
                                                    <div className="mt-2 space-y-1 ml-2 max-h-32 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(hour => (
                                                            <label key={hour} className="flex items-center gap-2">
                                                                <input
                                                                    type="radio"
                                                                    name="oxygen"
                                                                    value={hour}
                                                                    checked={oxygenHour === hour.toString()}
                                                                    onChange={(e) => setOxygenHour(e.target.value)}
                                                                    className="w-3 h-3 flex-shrink-0"
                                                                />
                                                                <span className="text-xs sm:text-sm">{hour} ชั่วโมง</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}

                                                {item.name === 'เครื่อง Infustion Pump NG' && isChecked && showInfusionNGOptions && (
                                                    <div className="mt-2 space-y-1 ml-2 max-h-32 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                                        {feedMachines.map((machine, i) => (
                                                            <label key={i} className="flex items-center gap-2">
                                                                <input
                                                                    type="radio"
                                                                    name="infusionNG"
                                                                    value={machine}
                                                                    checked={infusionNG === machine}
                                                                    onChange={(e) => setInfusionNG(e.target.value)}
                                                                    className="w-3 h-3 flex-shrink-0"
                                                                />
                                                                <span className="text-xs sm:text-sm">หมายเลข {machine}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}

                                                {item.name === 'เครื่อง Infustion Pump IV' && isChecked && showInfusionIVOptions && (
                                                    <div className="mt-2 space-y-1 ml-2 max-h-32 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                                        {ivMachines.map((machine, i) => (
                                                            <label key={i} className="flex items-center gap-2">
                                                                <input
                                                                    type="radio"
                                                                    name="infusionIV"
                                                                    value={machine}
                                                                    checked={infusionIV === machine}
                                                                    onChange={(e) => setInfusionIV(e.target.value)}
                                                                    className="w-3 h-3 flex-shrink-0"
                                                                />
                                                                <span className="text-xs sm:text-sm">หมายเลข {machine}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-3 sm:p-4 border-t flex gap-2 flex-shrink-0">
                            <button
                                onClick={() => {
                                    setShowProcedureModal(false);
                                }}
                                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg hover:bg-gray-50"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={confirmProcedures}
                                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                ยืนยัน
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Other Procedures Modal */}
            {showOtherModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
                    <div className="bg-white rounded-lg w-full max-w-lg h-[90vh] sm:h-[85vh] overflow-hidden flex flex-col">
                        <div className="p-3 sm:p-4 border-b flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base sm:text-lg font-semibold">เลือกหัตถการที่ไม่คิดเงิน</h2>
                                <button onClick={() => setShowOtherModal(false)}>
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
                            {otherColumns.map((item, idx) => (
                                <div key={idx} className="mb-2 sm:mb-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={checkedOther.includes(item)}
                                            onChange={() => handleOtherCheckbox(item)}
                                            className="w-4 h-4 flex-shrink-0"
                                        />
                                        <span className="text-sm sm:text-base break-words">{item}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 sm:p-4 border-t flex gap-2 flex-shrink-0">
                            <button
                                onClick={() => setShowOtherModal(false)}
                                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg hover:bg-gray-50"
                            >
                                ปิด
                            </button>
                            <button
                                onClick={() => setShowOtherModal(false)}
                                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                ยืนยัน
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
                    <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-3 sm:p-4 border-b flex-shrink-0">
                            <h2 className="text-base sm:text-lg font-semibold">ยืนยันการแก้ไข</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
                            <p className="text-gray-600 mb-4">คุณต้องการบันทึกการแก้ไขนี้ใช่หรือไม่?</p>
                        </div>
                        <div className="p-3 sm:p-4 border-t flex gap-2 flex-shrink-0">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                disabled={saving}
                                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={confirmUpdate}
                                disabled={saving}
                                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {saving ? 'กำลังบันทึก...' : 'ยืนยัน'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProcedureRecordEdit;