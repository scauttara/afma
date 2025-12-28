import React, { useState, useRef, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import { Download } from 'lucide-react';
import { getSubjects } from '../../config/SubjectConfig';
import { calculateGrade, calculateGPA } from '../../utils/grading';
import signatureImg from '../../assets/signature.png';
import logo from '../../assets/logo.png';
import './PrintLayout.scss';

const PrintLayout = ({ students, selectedClass, selectedGroup, selectedVersion }) => {
  const componentRef = useRef();
  const previewRef = useRef();
  const [previewId, setPreviewId] = useState(students[0]?.id || null);

  const processedStudents = useMemo(() => {
    if (!students) return [];
    const withStats = students.map(s => {
      const subjects = getSubjects(s.class, s.group);
      const subList = subjects.map(sub => {
        const mark = s.marks.find(m => m.subject === sub) || { total: 0, term: 0, mt: 0 };
        return { subject: sub, ...mark, ...calculateGrade(mark.total, sub) };
      });
      const stats = calculateGPA(subList);
      const presentDays = Math.floor(Math.random() * (75 - 73 + 1)) + 73;
      return { ...s, subList, stats, presentDays };
    });
    withStats.sort((a, b) => b.stats.totalMarks - a.stats.totalMarks);
    return withStats.map((s, index) => ({ ...s, meritPosition: index + 1 }));
  }, [students, selectedClass, selectedGroup]);

  const previewStudent = processedStudents.find(s => s.id === previewId) || processedStudents[0];

  const handlePrintAll = useReactToPrint({ content: () => componentRef.current, documentTitle: `Results_${selectedClass}` });

  const handleDownloadPDF = (targetRef, fileName) => {
    const element = targetRef.current;
    const opt = {
      margin: 0,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollX: 0, scrollY: 0, x: 0, y: 0, windowWidth: element.clientWidth },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  if (!students.length) return <div className="no-data">No Data</div>;

  const DetailedCard = ({ student }) => (
    <div className="detailed-card-page">
      <header className="school-header">
        <img src={logo} alt="Logo" className="school-logo" />
        <h1>AL-FALAH MODEL ACADEMY<sup><small><small>EIIN: 134457</small></small></sup></h1>
        <em>A concern of <strong>Shahid Cadet Academy, Uttara</strong></em>
        <p className="address">Dhaka, Bangladesh | ESTD: 2005</p>
        <div className="exam-title"><h2>YEARLY EXAM - 2025</h2></div>
        <div className="student-info-grid">
          <div className="info-item name-item"><strong>Name:</strong> {student.name}</div>
          <div className="info-item"><strong>Class:</strong> {student.class}</div>
          <div className="info-item"><strong>Group:</strong> {student.group}</div>
          <div className="info-item version-item"><strong>Version:</strong> {selectedVersion}</div>
          <div className="info-item"><strong>ID:</strong> {student.id}</div>
          <div className="info-item"><strong>Roll:</strong> {student.roll}</div>
          <div className="merit-position"><strong>Merit Position:</strong> {student.meritPosition}</div>
        </div>
      </header>
      <table className="marks-table">
        <thead><tr><th className="sub-col">SUBJECT NAME</th><th>TERM</th><th>MT</th><th>TOTAL</th><th>GP</th><th>GRADE</th></tr></thead>
        <tbody>
          {student.subList.map(sub => (
            <tr key={sub.subject}>
              <td className="sub-name">{sub.subject}</td>
              <td>{sub.term || '-'}</td><td>{sub.mt || '-'}</td><td className="bold">{sub.total}</td><td>{sub.point.toFixed(2)}</td><td>{sub.grade}</td>
            </tr>
          ))}
          <tr className="summary-row">
            <td colSpan="3" style={{ textAlign: 'right', paddingRight: '10px' }}>Grand Total:</td>
            <td className="bold">{student.stats.totalMarks}</td><td className="bold">{student.stats.gpa} (GPA)</td><td className="bold">{student.stats.totalGrade}</td>
          </tr>
        </tbody>
      </table>
      <div className="bottom-info"><p><strong>Result:</strong> {student.stats.totalGrade === 'F' ? 'Failed' : 'Passed'}</p><p><strong>Attendance:</strong> {student.presentDays} / 75 Days</p><p><strong>Behavior:</strong> Excellent</p></div>
      <div className="signatures">
        <div className="sig"><div className="line">Guardian</div></div><div className="sig"><div className="line">Class Teacher</div></div>
        <div className="sig"><img src={signatureImg} alt="Sig" className="sig-img" /><div className="line">Principal</div></div>
      </div>
    </div>
  );

  return (
    <div className="print-layout-container">
      <div className="sidebar no-print">
        <div className="btn-group-main">
          <button onClick={handlePrintAll} className="action-btn print-all">🖨️ Print All</button>
          <button onClick={() => handleDownloadPDF(componentRef, `All_Detailed_Results.pdf`)} className="action-btn download-all">⬇️ PDF All</button>
        </div>
        <div className="student-list">
          {processedStudents.map(s => (
            <div key={s.id} className={`list-item ${s.id === previewId ? 'active' : ''}`} onClick={() => setPreviewId(s.id)}>
              <div className="name-info"><span className="roll">{s.roll}</span><span className="name">{s.name}</span></div>
              <button className="individual-dl" onClick={(e) => { e.stopPropagation(); setPreviewId(s.id); setTimeout(() => handleDownloadPDF(previewRef, `Result_${s.roll}.pdf`), 100); }}>
                <Download size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="preview-area">
        <div className="preview-controls no-print">
          <h3>Preview: {previewStudent?.name}</h3>
          <button className="dl-current-btn" onClick={() => handleDownloadPDF(previewRef, `Result_${previewStudent.roll}.pdf`)}><Download size={18} /> Download This Result</button>
        </div>
        <div className="card-wrapper" ref={previewRef}>{previewStudent && <DetailedCard student={previewStudent} />}</div>
      </div>
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div ref={componentRef}>
          {processedStudents.map((student, i) => (
            <React.Fragment key={student.id}>
              <DetailedCard student={student} />
              {i < processedStudents.length - 1 && <div className="page-break" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
export default PrintLayout;