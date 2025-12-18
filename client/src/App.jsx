import React, { useState, useEffect } from 'react';
import api from './api/axios';
import { GROUPS_BY_CLASS } from './config/SubjectConfig';

import MarksEntry from './components/MarksEntry/MarksEntry';
import PrintLayout from './components/PrintLayout/PrintLayout';
import FinalCertificate from './components/FinalCertificate/FinalCertificate';
import TabulationSheet from './components/TabulationSheet/TabulationSheet';

function App() {
  const [view, setView] = useState('entry');
  const [selectedClass, setSelectedClass] = useState('Nine');
  const [selectedGroup, setSelectedGroup] = useState('Science');
  const [selectedVersion, setSelectedVersion] = useState('Bangla');

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [selectedClass, selectedGroup, selectedVersion]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/students/${selectedClass}?group=${selectedGroup}&version=${selectedVersion}`);
      setStudents(res.data || []);
    } catch (err) {
      setStudents([]);
    } finally { setLoading(false); }
  };

  const handleClassChange = (e) => {
    const newClass = e.target.value;
    setSelectedClass(newClass);
    const availableGroups = GROUPS_BY_CLASS[newClass] || [];
    if (availableGroups.length > 0) setSelectedGroup(availableGroups[0]);
  };

  const availableGroups = GROUPS_BY_CLASS[selectedClass] || [];

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <nav style={navStyle} className="no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h2 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>Marksheets</h2>

          <select
            value={selectedVersion}
            onChange={e => setSelectedVersion(e.target.value)}
            style={{ ...selectStyle, background: '#fff3cd', color: '#856404' }}
          >
            <option value="Bangla">BV Bangla Version</option>
            <option value="English">EV English Version</option>
          </select>

          <select value={selectedClass} onChange={handleClassChange} style={selectStyle}>
            {Object.keys(GROUPS_BY_CLASS).map(cls => <option key={cls} value={cls}>Class {cls}</option>)}
          </select>

          {availableGroups.length > 1 && (
            <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} style={selectStyle}>
              {availableGroups.map(grp => <option key={grp} value={grp}>{grp}</option>)}
            </select>
          )}
        </div>

        <div  style={{ display: 'flex', gap: '5px' }}>
          <button onClick={() => setView('entry')} style={view === 'entry' ? activeBtnStyle : btnStyle}>📝 Entry</button>
          <button onClick={() => setView('print_detail')} style={view === 'print_detail' ? activeBtnStyle : btnStyle}>📄 Detail</button>
          <button onClick={() => setView('print_final')} style={view === 'print_final' ? activeBtnStyle : btnStyle}>🎓 Certificate</button>
          <button onClick={() => setView('tabulation')} style={view === 'tabulation' ? activeBtnStyle : btnStyle}>📊 Tabulation</button>
        </div>
      </nav>

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: '#e2e8f0' }}>
        {loading && <div style={loadingStyle}>Syncing Data...</div>}

        {view === 'entry' && (
          <MarksEntry
            selectedClass={selectedClass}
            selectedGroup={selectedGroup}
            selectedVersion={selectedVersion}
            students={students}
            setStudents={setStudents}
          />
        )}

        {view === 'print_detail' && (
          <PrintLayout
            selectedClass={selectedClass}
            selectedGroup={selectedGroup}
            selectedVersion={selectedVersion}
            students={students}
          />
        )}

        {view === 'print_final' && (
          <FinalCertificate
            selectedClass={selectedClass}
            selectedGroup={selectedGroup}
            selectedVersion={selectedVersion}
            students={students}
          />
        )}

        {view === 'tabulation' && (
          <TabulationSheet
            selectedClass={selectedClass}
            selectedGroup={selectedGroup}
            selectedVersion={selectedVersion}
            students={students}
          />
        )}
      </div>
    </div>
  );
}
const navStyle = { padding: '10px 20px', background: '#2d3748', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const selectStyle = { padding: '8px', borderRadius: '4px', border: 'none', fontWeight: 'bold', cursor: 'pointer' };
const btnStyle = { padding: '8px 12px', background: 'transparent', border: '1px solid #718096', color: '#cbd5e0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' };
const activeBtnStyle = { ...btnStyle, background: '#4299e1', color: 'white', border: '1px solid #4299e1' };
const loadingStyle = { position: 'absolute', top: 0, width: '100%', background: '#fff3cd', textAlign: 'center', padding: '5px', zIndex: 1000 };

export default App;