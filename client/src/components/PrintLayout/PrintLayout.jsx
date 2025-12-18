import React, { useState, useRef, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import { getSubjects } from '../../config/SubjectConfig';
import { calculateGrade, calculateGPA } from '../../utils/grading';
import signatureImg from '../../assets/signature.png'; 
import './PrintLayout.scss';

const PrintLayout = ({ students, selectedClass, selectedGroup, selectedVersion }) => {
  const componentRef = useRef();
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
      return { ...s, subList, stats };
    });
    withStats.sort((a, b) => b.stats.totalMarks - a.stats.totalMarks);
    return withStats.map((s, index) => ({ ...s, meritPosition: index + 1 }));
  }, [students, selectedClass, selectedGroup]);

  const previewStudent = processedStudents.find(s => s.id === previewId) || processedStudents[0];

  const handlePrint = useReactToPrint({ content: () => componentRef.current, documentTitle: `Detailed_Result` });

  const handleDownloadPDF = () => {
    const opt = { margin: 5, filename: `Detailed_Result.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
    html2pdf().set(opt).from(componentRef.current).save();
  };

  if (!students.length) return <div>No Data</div>;

  return (
    <div className="print-layout-container">
      <div className="sidebar no-print">
        <h3>Detailed Results</h3>
        <div className="btn-group">
            <button onClick={handlePrint} className="action-btn print">🖨️ Print All</button>
            <button onClick={handleDownloadPDF} className="action-btn download">⬇️ Download PDF</button>
        </div>
        <div className="student-list">
          {processedStudents.map(s => (
             <div key={s.id} className={`list-item ${s.id === previewId ? 'active' : ''}`} onClick={() => setPreviewId(s.id)}>
              <span className="roll">{s.roll}</span> {s.name}
            </div>
          ))}
        </div>
      </div>
      <div className="preview-area">
        <div ref={componentRef} className="printable-content">
          {processedStudents.map((student) => (
             <div key={student.id} className="detailed-card-page">
                <header className="school-header">
                  <h1>AL-FALAH MODEL ACADEMY</h1>
                  <p>Dhaka, Bangladesh | ESTD: 2005</p>
                  <div className="exam-title"><h2>YEARLY EXAM - 2025</h2></div>
                  <div className="student-box">
                    <div className="row">
                       <span>Name: <strong>{student.name}</strong></span>
                       <span>Class: <strong>{student.class}</strong> ({student.group})</span>
                    </div>
                    <div className="row">
                       <span>ID: <strong>{student.id}</strong></span>
                       <span>Roll: <strong>{student.roll}</strong></span>
                       <span>Version: <strong>{selectedVersion}</strong></span>
                       <span>Merit: <strong style={{color:'red'}}>{student.meritPosition}</strong></span>
                    </div>
                  </div>
                </header>
                <table className="marks-table">
                  <thead>
                    <tr>
                      <th className="sub-col">Subject Name</th>
                      <th>Term</th><th>MT</th><th>Total</th><th>GP</th><th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.subList.map(sub => (
                      <tr key={sub.subject}>
                        <td className="sub-name">{sub.subject}</td>
                        <td>{sub.term || '-'}</td>
                        <td>{sub.mt || '-'}</td>
                        <td className="bold">{sub.total}</td>
                        <td>{sub.point.toFixed(2)}</td>
                        <td>{sub.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="summary-row">
                      <td colSpan="3" style={{textAlign:'right', paddingRight: '10px'}}>Grand Total:</td>
                      <td className="bold">{student.stats.totalMarks}</td>
                      <td className="bold">{student.stats.gpa} (GPA)</td>
                      <td className="bold">{student.stats.totalGrade}</td>
                    </tr>
                  </tfoot>
                </table>
                <div className="bottom-info">
                   <p><strong>Result:</strong> {student.stats.totalGrade === 'F' ? 'Failed' : 'Passed'}</p>
                   <p><strong>Total Subjects:</strong> {student.subList.length}</p>
                </div>
                <div className="signatures">
                  <div className="sig"><div className="line">Guardian</div></div>
                  <div className="sig"><div className="line">Class Teacher</div></div>
                  <div className="sig">
                    <img src={signatureImg} alt="Sig" className="sig-img" />
                    <div className="line">Principal</div>
                  </div>
                </div>
                <div className="html2pdf__page-break"></div><div className="page-break"></div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default PrintLayout;