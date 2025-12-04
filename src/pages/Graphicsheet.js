import React, { useState, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import './GraphicSheet.css';

// Mock data
const mockPatientData = {
  hn: '6600390TGPS',
  an: '6600098',
  name: 'นางสาว ทดสอบ ระบบ',
  age: 68,
  sex: 'หญิง',
  ward: 'IPD',
  dateOfAdmit: '06/02/2566',
  dateOfDischarge: '',
  attendingPhysician: 'นพ. ทดสอบ สุขภาพดี',
};

const mockVitalSigns = [
  {
    date: '30/11/68',
    time: '06:00',
    temp: 36.8,
    pulse: 78,
    systolic: 128,
    diastolic: 79,
    respRate: 18,
    o2Sat: 100,
  },
  {
    date: '1/12/68',
    time: '06:00',
    temp: 37.0,
    pulse: 82,
    systolic: 130,
    diastolic: 83,
    respRate: 18,
    o2Sat: 98,
  },
  {
    date: '2/12/68',
    time: '06:00',
    temp: 36.9,
    pulse: 82,
    systolic: 125,
    diastolic: 76,
    respRate: 16,
    o2Sat: 99,
  },
  {
    date: '2/12/68',
    time: '14:00',
    temp: 37.2,
    pulse: 85,
    systolic: 128,
    diastolic: 80,
    respRate: 18,
    o2Sat: 96,
  },
  {
    date: '3/12/68',
    time: '06:00',
    temp: 36.7,
    pulse: 76,
    systolic: 122,
    diastolic: 68,
    respRate: 16,
    o2Sat: 98,
  },
  {
    date: '4/12/68',
    time: '06:00',
    temp: 36.8,
    pulse: 80,
    systolic: 126,
    diastolic: 80,
    respRate: 18,
    o2Sat: 98,
  },
];

const mockIntakeOutput = [
  {
    date: '30/11/68',
    diet: 0,
    oralFluids: 0,
    parenteral: 2000,
    total: 2000,
    urine: 800,
    emesis: 0,
    drainage: 0,
    aspiration: 50,
    totalOut: 850,
    stools: 0,
    urineCount: 3,
  },
  {
    date: '1/12/68',
    diet: 0,
    oralFluids: 0,
    parenteral: 1000,
    total: 1000,
    urine: 1200,
    emesis: 0,
    drainage: 0,
    aspiration: 150,
    totalOut: 1350,
    stools: 1,
    urineCount: 3,
  },
  {
    date: '2/12/68',
    diet: 0,
    oralFluids: 0,
    parenteral: 500,
    total: 500,
    urine: 800,
    emesis: 0,
    drainage: 0,
    aspiration: 50,
    totalOut: 850,
    stools: 0,
    urineCount: 2,
  },
  {
    date: '3/12/68',
    diet: 0,
    oralFluids: 0,
    parenteral: 1000,
    total: 1000,
    urine: 600,
    emesis: 0,
    drainage: 0,
    aspiration: 200,
    totalOut: 800,
    stools: 0,
    urineCount: 2,
  },
  {
    date: '4/12/68',
    diet: 0,
    oralFluids: 0,
    parenteral: 1000,
    total: 1000,
    urine: 800,
    emesis: 0,
    drainage: 0,
    aspiration: 200,
    totalOut: 1000,
    stools: 0,
    urineCount: 3,
  },
];

const GraphicSheet = () => {
  const [viewMode, setViewMode] = useState('display');
  const [vitalSigns, setVitalSigns] = useState(mockVitalSigns);
  const [intakeOutput, setIntakeOutput] = useState(mockIntakeOutput);
  const [newVital, setNewVital] = useState({
    date: '',
    time: '',
    temp: 37.0,
    pulse: 80,
    systolic: 120,
    diastolic: 80,
    respRate: 18,
    o2Sat: 98,
  });

  const printRef = useRef(null);

  // Handle adding new vital sign
  const handleAddVitalSign = () => {
    if (!newVital.date || !newVital.time) {
      alert('กรุณากรอกวันที่และเวลา');
      return;
    }
    setVitalSigns([...vitalSigns, newVital]);
    // Reset form
    setNewVital({
      date: '',
      time: '',
      temp: 37.0,
      pulse: 80,
      systolic: 120,
      diastolic: 80,
      respRate: 18,
      o2Sat: 98,
    });
  };

  // Handle PDF export
  const handleExportPDF = () => {
    window.print();
  };

  // Custom dot renderer for temperature
  const renderTempDot = (props) => {
    const { cx, cy, payload } = props;
    const temp = payload.temp;
    if (temp >= 37.5) {
      return <circle cx={cx} cy={cy} r={4} fill="#ef4444" stroke="#991b1b" strokeWidth={2} />;
    }
    return <circle cx={cx} cy={cy} r={4} fill="#3b82f6" stroke="#1e40af" strokeWidth={2} />;
  };

  // Custom dot for pulse
  const renderPulseDot = (props) => {
    const { cx, cy } = props;
    return <circle cx={cx} cy={cy} r={4} fill="#000000" />;
  };

  return (
    <div className="graphic-sheet-container">
      {/* Mode Selector */}
      <div className="mode-selector print-hidden">
        <div className="mode-buttons">
          <button
            onClick={() => setViewMode('display')}
            className={`mode-btn ${viewMode === 'display' ? 'active' : ''}`}
          >
            📊 แสดงผล
          </button>
          <button
            onClick={() => setViewMode('interactive')}
            className={`mode-btn ${viewMode === 'interactive' ? 'active' : ''}`}
          >
            ✏️ บันทึกข้อมูล
          </button>
          <button
            onClick={() => setViewMode('pdf')}
            className={`mode-btn ${viewMode === 'pdf' ? 'active' : ''}`}
          >
            📄 แสดงแบบ PDF
          </button>
          <button onClick={handleExportPDF} className="export-btn">
            🖨️ พิมพ์/บันทึก PDF
          </button>
        </div>
      </div>

      {/* Main Graphic Sheet */}
      <div
        ref={printRef}
        id="printArea"
        className={`sheet-content ${viewMode === 'pdf' ? 'pdf-mode' : ''}`}
      >
        {/* Header */}
        <div className="sheet-header">
          <div className="header-left">
            <h1>SENIZENS</h1>
            <p className="header-subtitle">CODE : GRAPHIC SHEET</p>
            <p className="header-subtitle">PROG : IPD</p>
          </div>
          <div className="header-center">
            <div className="header-info">Date of Adm.: {mockPatientData.dateOfAdmit}</div>
            <div className="header-info">
              Date of Discharge: {mockPatientData.dateOfDischarge || '-'}
            </div>
            <div className="header-page">Page 1 of 1</div>
          </div>
          <div className="header-right">
            <div className="patient-info">
              <div>HN: {mockPatientData.hn}</div>
              <div>AN: {mockPatientData.an}</div>
              <div>
                Age: {mockPatientData.age} ปี Sex: {mockPatientData.sex}
              </div>
              <div>Ward: {mockPatientData.ward}</div>
            </div>
          </div>
        </div>

        <div className="physician-info">
          Attending Physician: {mockPatientData.attendingPhysician}
        </div>

        {/* Date Headers */}
        <div className="date-headers">
          <div className="date-cell header-cell">DATE</div>
          {vitalSigns.slice(0, 6).map((vs, idx) => (
            <div key={idx} className="date-cell">
              <div className="date-main">{vs.date}</div>
              <div className="date-time">{vs.time}</div>
            </div>
          ))}
        </div>

        {/* Days and Temperature Row */}
        <div className="days-row">
          <div className="days-cell">
            <div>Days after</div>
            <div>Admission</div>
          </div>
          {vitalSigns.slice(0, 6).map((vs, idx) => (
            <div key={idx} className="temp-display">
              {vs.temp.toFixed(1)}
            </div>
          ))}
        </div>

        {/* Temperature and Pulse Graph */}
        <div className="graph-container">
          <div className="graph-title">Pulse / Temperature</div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={vitalSigns.map((vs, idx) => ({
                ...vs,
                index: idx,
                label: `${vs.date} ${vs.time}`,
              }))}
              margin={{ top: 10, right: 30, bottom: 40, left: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                yAxisId="left"
                domain={[35, 41]}
                ticks={[35, 36, 37, 38, 39, 40, 41]}
                label={{ value: '°C', angle: -90, position: 'insideLeft' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[40, 160]}
                ticks={[40, 60, 80, 100, 120, 140, 160]}
                label={{ value: 'ครั้ง/นาที', angle: 90, position: 'insideRight' }}
              />

              {/* Normal range references */}
              <ReferenceLine yAxisId="left" y={37} stroke="#10b981" strokeDasharray="3 3" />
              <ReferenceLine yAxisId="right" y={60} stroke="#6b7280" strokeDasharray="3 3" />
              <ReferenceLine yAxisId="right" y={100} stroke="#6b7280" strokeDasharray="3 3" />

              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                formatter={(value, name) => {
                  if (name === 'temp') return [`${value}°C`, 'อุณหภูมิ'];
                  if (name === 'pulse') return [`${value} ครั้ง/นาที`, 'ชีพจร'];
                  return [value, name];
                }}
              />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temp"
                stroke="#ef4444"
                strokeWidth={2}
                dot={renderTempDot}
                name="temp"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="pulse"
                stroke="#000000"
                strokeWidth={2}
                dot={renderPulseDot}
                name="pulse"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Blood Pressure Section */}
        <div className="bp-section">
          <div className="bp-header">B.P.</div>
          {vitalSigns.slice(0, 6).map((vs, idx) => (
            <div key={idx} className="bp-cell">
              <div>
                Systolic: <strong>{vs.systolic}</strong>
              </div>
              <div>
                Diastolic: <strong>{vs.diastolic}</strong>
              </div>
            </div>
          ))}
        </div>

        {/* Respiratory Rate Graph */}
        <div className="graph-container" style={{ height: '250px' }}>
          <div className="graph-title">Resp. Rate</div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={vitalSigns}
              margin={{ top: 30, right: 30, bottom: 20, left: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis
                domain={[0, 40]}
                ticks={[0, 10, 20, 30, 40]}
                label={{ value: 'ครั้ง/นาที', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="respRate"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* O2 Saturation */}
        <div className="data-row">
          <div className="data-header">O2 Sat.</div>
          {vitalSigns.slice(0, 6).map((vs, idx) => (
            <div key={idx} className="data-cell">
              <strong>{vs.o2Sat}%</strong>
            </div>
          ))}
        </div>

        {/* Weight and Height */}
        <div className="data-row">
          <div className="data-header">Wt. and Ht.</div>
          {vitalSigns.slice(0, 6).map((_, idx) => (
            <div key={idx} className="data-cell"></div>
          ))}
        </div>

        {/* Input Section */}
        <div className="section-title">INPUT</div>

        <div className="data-row">
          <div className="data-header">Diet</div>
          {intakeOutput.slice(0, 6).map((io, idx) => (
            <div key={idx} className="data-cell">
              {io.diet || '-'}
            </div>
          ))}
        </div>

        <div className="data-row">
          <div className="data-header">Oral Fluids</div>
          {intakeOutput.slice(0, 6).map((io, idx) => (
            <div key={idx} className="data-cell">
              {io.oralFluids || '-'}
            </div>
          ))}
        </div>

        <div className="data-row">
          <div className="data-header">Parenteral</div>
          {intakeOutput.slice(0, 6).map((io, idx) => (
            <div key={idx} className="data-cell">
              {io.parenteral || '-'}
            </div>
          ))}
        </div>

        <div className="data-row total-row">
          <div className="data-header">Total</div>
          {intakeOutput.slice(0, 6).map((io, idx) => (
            <div key={idx} className="data-cell">
              <strong>{io.total}</strong>
            </div>
          ))}
        </div>

        {/* Output Section */}
        <div className="section-title">OUTPUT</div>

        <div className="data-row">
          <div className="data-header">Urine</div>
          {intakeOutput.slice(0, 6).map((io, idx) => (
            <div key={idx} className="data-cell">
              <strong>{io.urine}</strong>
            </div>
          ))}
        </div>

        <div className="data-row">
          <div className="data-header">Emesis</div>
          {intakeOutput.slice(0, 6).map((io, idx) => (
            <div key={idx} className="data-cell">
              {io.emesis || '-'}
            </div>
          ))}
        </div>

        <div className="data-row">
          <div className="data-header">Drainage</div>
          {intakeOutput.slice(0, 6).map((io, idx) => (
            <div key={idx} className="data-cell">
              {io.drainage || '-'}
            </div>
          ))}
        </div>

        <div className="data-row">
          <div className="data-header">Aspiration</div>
          {intakeOutput.slice(0, 6).map((io, idx) => (
            <div key={idx} className="data-cell">
              {io.aspiration || '-'}
            </div>
          ))}
        </div>

        <div className="data-row total-row">
          <div className="data-header">Total</div>
          {intakeOutput.slice(0, 6).map((io, idx) => (
            <div key={idx} className="data-cell">
              <strong>{io.totalOut}</strong>
            </div>
          ))}
        </div>

        {/* Stools and Urine Count */}
        <div className="data-row">
          <div className="data-header">Stools</div>
          {intakeOutput.slice(0, 6).map((io, idx) => (
            <div key={idx} className="data-cell">
              {io.stools || '-'}
            </div>
          ))}
        </div>

        <div className="data-row">
          <div className="data-header">Urine</div>
          {intakeOutput.slice(0, 6).map((io, idx) => (
            <div key={idx} className="data-cell">
              {io.urineCount}
            </div>
          ))}
        </div>

        {/* Signature Section */}
        <div className="signature-row">
          <div className="signature-cell"></div>
          {vitalSigns.slice(0, 6).map((_, idx) => (
            <div key={idx} className="signature-cell">
              <div className="signature-line">ผู้บันทึก</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sheet-footer">
          PrintDate/Time: {new Date().toLocaleString('th-TH')}
        </div>
      </div>

      {/* Interactive Mode Form */}
      {viewMode === 'interactive' && (
        <div className="interactive-form print-hidden">
          <h3>📝 เพิ่มข้อมูล Vital Signs</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>วันที่:</label>
              <input
                type="text"
                placeholder="DD/MM/YY"
                value={newVital.date}
                onChange={(e) => setNewVital({ ...newVital, date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>เวลา:</label>
              <input
                type="text"
                placeholder="HH:MM"
                value={newVital.time}
                onChange={(e) => setNewVital({ ...newVital, time: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>อุณหภูมิ (°C):</label>
              <input
                type="number"
                step="0.1"
                value={newVital.temp}
                onChange={(e) => setNewVital({ ...newVital, temp: parseFloat(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>ชีพจร (ครั้ง/นาที):</label>
              <input
                type="number"
                value={newVital.pulse}
                onChange={(e) => setNewVital({ ...newVital, pulse: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Systolic (mmHg):</label>
              <input
                type="number"
                value={newVital.systolic}
                onChange={(e) =>
                  setNewVital({ ...newVital, systolic: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="form-group">
              <label>Diastolic (mmHg):</label>
              <input
                type="number"
                value={newVital.diastolic}
                onChange={(e) =>
                  setNewVital({ ...newVital, diastolic: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="form-group">
              <label>อัตราการหายใจ (ครั้ง/นาที):</label>
              <input
                type="number"
                value={newVital.respRate}
                onChange={(e) =>
                  setNewVital({ ...newVital, respRate: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="form-group">
              <label>O2 Saturation (%):</label>
              <input
                type="number"
                value={newVital.o2Sat}
                onChange={(e) => setNewVital({ ...newVital, o2Sat: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <button onClick={handleAddVitalSign} className="add-btn">
            ✅ เพิ่มข้อมูล
          </button>

          <div className="recent-entries">
            <h4>📋 ข้อมูลล่าสุด ({vitalSigns.length} รายการ)</h4>
            <div className="entries-list">
              {vitalSigns.slice(-5).reverse().map((vs, idx) => (
                <div key={idx} className="entry-item">
                  <span className="entry-time">
                    {vs.date} {vs.time}
                  </span>
                  <span>Temp: {vs.temp}°C</span>
                  <span>Pulse: {vs.pulse}</span>
                  <span>BP: {vs.systolic}/{vs.diastolic}</span>
                  <span>O2: {vs.o2Sat}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphicSheet;