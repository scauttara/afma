import React, { useState, useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import api from '../../api/axios';
import { getSubjects } from '../../config/SubjectConfig';
import './MarksEntry.scss';

const MarksEntry = ({ selectedClass, selectedGroup, selectedVersion, students, setStudents }) => {
  const [status, setStatus] = useState('Idle');
  const [newStudent, setNewStudent] = useState({ name: '', roll: '' });
  const rollInputRef = useRef(null);
  const subjects = getSubjects(selectedClass, selectedGroup);

  // Updates local state for Name/Roll; triggered by auto-save useEffect
  const updateStudentInfo = (studentId, field, value) => {
    setStatus('Typing...');
    setStudents(prev => prev.map(student => {
      if (student.id !== studentId) return student;
      return { ...student, [field]: value };
    }));
  };

  // Updates marks for subjects
  const updateMark = (studentId, subjectName, field, value) => {
    setStatus('Typing...');
    setStudents(prev => prev.map(student => {
      if (student.id !== studentId) return student;
      let newMarks = [...student.marks];
      const existingIndex = newMarks.findIndex(m => m.subject === subjectName);
      const val = value === '' ? '' : parseInt(value) || 0;

      if (existingIndex > -1) {
        newMarks[existingIndex] = { ...newMarks[existingIndex], [field]: val };
      } else {
        newMarks.push({ subject: subjectName, term: 0, mt: 0, total: 0, [field]: val });
      }

      const idx = existingIndex > -1 ? existingIndex : newMarks.length - 1;
      const term = parseInt(newMarks[idx].term || 0);
      const mt = parseInt(newMarks[idx].mt || 0);
      newMarks[idx].total = term + mt;
      return { ...student, marks: newMarks };
    }));
  };

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.roll) return alert("Enter Name and Roll");
    try {
      setStatus('Saving...');
      const res = await api.post('/add-student', {
        name: newStudent.name,
        roll: newStudent.roll,
        className: selectedClass,
        group: selectedGroup,
        version: selectedVersion
      });
      setStudents(prev => [...prev, res.data].sort((a, b) => parseInt(a.roll) - parseInt(b.roll)));
      setNewStudent({ name: '', roll: '' });
      setStatus('Saved');
      if (rollInputRef.current) rollInputRef.current.focus();
    } catch (err) {
      alert(err.response?.data?.error || "Error adding student.");
      setStatus('Error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete student?")) return;
    try {
      await api.delete(`/delete-student/${id}`);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (e) { alert("Error deleting"); }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') handleAddStudent();
  };

  // Debounced auto-save effect
  useEffect(() => {
    if (status !== 'Typing...') return;
    const timer = setTimeout(async () => {
      setStatus('Saving...');
      try {
        await api.post('/update-marks', students);
        setStatus('Saved');
      } catch (err) {
        setStatus('Error Saving');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [students, status]);

  return (
    <div className="marks-entry-container">
      <div className="add-student-bar">
        <h3>Add to {selectedClass} ({selectedVersion})</h3>
        <div className="inputs">
          <input
            ref={rollInputRef}
            placeholder="Roll"
            value={newStudent.roll}
            onChange={e => setNewStudent({ ...newStudent, roll: e.target.value })}
            className="input-roll"
          />
          <input
            placeholder="Name"
            value={newStudent.name}
            onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
            onKeyDown={handleNameKeyDown}
            className="input-name"
          />
          <button onClick={handleAddStudent} className="add-btn">+ Add</button>
        </div>
      </div>

      <div className={`status-bar ${status.toLowerCase()}`}>
        {status === 'Idle' ? 'Ready' : status}
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th rowSpan="2" className="fixed-col roll-col">Roll / ID</th>
              <th rowSpan="2" className="fixed-col name-col">Name</th>
              {subjects.map(sub => <th key={sub} colSpan="3" className="subject-header">{sub}</th>)}
              <th rowSpan="2" className="action-col">Action</th>
            </tr>
            <tr>
              {subjects.map(sub => (
                <React.Fragment key={sub}>
                  <th className="sub-th">Term</th>
                  <th className="sub-th">MT</th>
                  <th className="sub-th total">Total</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id}>
                <td className="fixed-col roll-col">
                  <input
                    className="edit-metadata-input roll-edit"
                    value={student.roll}
                    onChange={(e) => updateStudentInfo(student.id, 'roll', e.target.value)}
                  />
                  <div className="student-id-subtext">{student.id}</div>
                </td>
                <td className="fixed-col name-col">
                  <input
                    className="edit-metadata-input name-edit"
                    value={student.name}
                    onChange={(e) => updateStudentInfo(student.id, 'name', e.target.value)}
                  />
                </td>
                {subjects.map(sub => {
                  const mark = student.marks.find(m => m.subject === sub) || {};
                  return (
                    <React.Fragment key={student.id + sub}>
                      <td><input value={mark.term ?? ''} onChange={e => updateMark(student.id, sub, 'term', e.target.value)} placeholder="-" /></td>
                      <td><input value={mark.mt ?? ''} onChange={e => updateMark(student.id, sub, 'mt', e.target.value)} placeholder="-" /></td>
                      <td className="total-cell">{mark.total || 0}</td>
                    </React.Fragment>
                  )
                })}
                <td className="action-cell">
                  <button onClick={() => handleDelete(student.id)} className="delete-btn"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarksEntry;