import React, { useRef, useState, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import { getSubjects } from '../../config/SubjectConfig';
import { calculateGrade, calculateGPA } from '../../utils/grading';
import signatureImg from '../../assets/signature.png'; 
import './FinalCertificate.scss';
import logo from '../../assets/logo.png'

const FinalCertificate = ({ students, selectedClass, selectedGroup, selectedVersion }) => {
  const printRef = useRef();
  const [previewId, setPreviewId] = useState(students[0]?.id || null);

  const processedStudents = useMemo(() => {
    if (!students) return [];
    const withStats = students.map(s => {
      const subjects = getSubjects(s.class, s.group);
      let totalPossibleMarks = 0;
      const subList = subjects.map(sub => {
        const mark = s.marks.find(m => m.subject === sub) || { total: 0, term: 0, mt: 0 };
        const is50MarkSubject = ['ICT','Arts','Phy. Edu','Work & Life'].some(n => sub.includes(n));
        const maxMarks = is50MarkSubject ? 50 : 100;
        totalPossibleMarks += maxMarks;
        return { subject: sub, maxMarks, ...mark, ...calculateGrade(mark.total, sub) };
      });
      const stats = calculateGPA(subList);
      const presentDays = Math.floor(Math.random() * (75 - 73 + 1)) + 73;
      return { ...s, subList, stats, totalPossibleMarks, presentDays };
    });
    withStats.sort((a, b) => b.stats.totalMarks - a.stats.totalMarks);
    return withStats.map((s, index) => ({ ...s, meritPosition: index + 1 }));
  }, [students, selectedClass, selectedGroup]);

  const previewStudent = processedStudents.find(s => s.id === previewId) || processedStudents[0];

  const handlePrint = useReactToPrint({ content: () => printRef.current, documentTitle: `Certificate` });

  const handleDownloadPDF = () => {
    const opt = { margin: 0, filename: `Certificate.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
    html2pdf().set(opt).from(printRef.current).save();
  };

  if (!students.length) return <div style={{padding:'20px', color:'white'}}>No Data</div>;

  const CertificateCard = ({ student }) => (
    <div className="certificate-page">
      <header className="school-header">
        <img src={logo} alt="" />        <h1>AL-FALAH MODEL ACADEMY</h1>
        <p className="address">3, East Mollartek, Dakshinkhan, Dhaka-1230</p>        
        <div className="exam-title"><h2>YEARLY EXAM - 2025</h2></div>
        <div className="student-info-grid">
           <div className="info-item"><strong>Name:</strong> {student.name}</div>
           <div className="info-item"><strong>Class:</strong> {student.class}</div>
           <div className="info-item"><strong>Group:</strong> {student.group}</div>
           <div className="info-item"><strong>Version:</strong> {selectedVersion}</div>
           <div className="info-item"><strong>ID:</strong> {student.id}</div>
           <div className="info-item"><strong>Roll:</strong> {student.roll}</div>
           <div className="info-item merit-position" style={{color: '#c53030'}}><strong>Merit Position:</strong> {student.meritPosition}</div>
        </div>
      </header>
      <table className="main-table">
        <thead>
          <tr>
            <th className="sub-col">Subject Name</th><th className="num-col">Total</th><th className="num-col">Obt.</th><th className="grade-col">Grade</th><th className="grade-col">GP</th><th className="summary-col">GPA</th><th className="summary-col">Grade</th>
          </tr>
        </thead>
        <tbody>
          {student.subList.map((sub, idx) => (
            <tr key={sub.subject}>
              <td className="sub-name">{sub.subject}</td>
              <td>{sub.maxMarks}</td>
              <td className="bold">{sub.total}</td>
              <td>{sub.grade}</td>
              <td>{sub.point.toFixed(2)}</td>
              {idx === 0 && <td rowSpan={student.subList.length} className="gpa-cell">{student.stats.gpa}</td>}
              {idx === 0 && <td rowSpan={student.subList.length} className="grade-cell">{student.stats.totalGrade}</td>}
            </tr>
          ))}
        </tbody>
        <tfoot>
            <tr className="footer-row">
                <td style={{textAlign: 'right', paddingRight: '10px'}}><strong>Grand Total:</strong></td>
                <td>{student.totalPossibleMarks}</td> 
                <td className="bold">{student.stats.totalMarks}</td>
                <td colSpan="4" className="comment">{student.stats.totalGrade === 'F' ? 'Better luck next time!' : 'Congratulations!'}</td>
            </tr>
        </tfoot>
      </table>
      <div className="footer-stats">
          <div className="stat">Working Days: <strong>75</strong></div>
          <div className="stat">Present Days: <strong>{student.presentDays}</strong></div>
          <div className="stat">Behavior: <strong>Excellent</strong></div>
      </div>
      <div className="signatures">
         <div className="sig-box"><div className="line">Guardian</div></div>
         <div className="sig-box"><div className="line">Class Teacher</div></div>
         <div className="sig-box"><img src={signatureImg} alt="Sig" className="sig-img" /><div className="line">Principal</div></div>
      </div>
      <div className="contact-footer">Website: afma.suyena.com | Mobile: 01714-359692</div>
    </div>
  );

  return (
    <div className="final-certificate-container">
      <div className="sidebar no-print">
        <div className="btn-group">
          <button onClick={handlePrint} className="action-btn print">🖨️ Print All</button>
          <button onClick={handleDownloadPDF} className="action-btn download">⬇️ Download PDF</button>
        </div>
        <div className="list">
          {processedStudents.map(s => <div key={s.id} className={`item ${s.id === previewId ? 'active' : ''}`} onClick={() => setPreviewId(s.id)}><span className="roll">{s.roll}</span> {s.name}</div>)}
        </div>
      </div>
      <div className="preview-area"><div className="paper-a4">{previewStudent && <CertificateCard student={previewStudent} />}</div></div>
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}><div ref={printRef}>{processedStudents.map((student, i) => (<div key={student.id}><CertificateCard student={student} /><div className="html2pdf__page-break"></div>{i < processedStudents.length - 1 && <div className="page-break" />}</div>))}</div></div>
    </div>
  );
};
export default FinalCertificate;