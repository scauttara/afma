import React, { useRef, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import { getSubjects } from '../../config/SubjectConfig';
import { calculateGrade, calculateGPA } from '../../utils/grading';
import './TabulationSheet.scss';
import logo from '../../assets/logo.png'

const TabulationSheet = ({ students, selectedClass, selectedGroup, selectedVersion }) => {
  const printRef = useRef();

  const { processedStudents, subjects } = useMemo(() => {
    if (!students || students.length === 0) return { processedStudents: [], subjects: [] };
    const classSubjects = getSubjects(selectedClass, selectedGroup);
    const data = students.map(s => {
      const subData = classSubjects.map(sub => {
        const mark = s.marks.find(m => m.subject === sub) || { total: 0 };
        return { ...mark, ...calculateGrade(mark.total, sub) };
      });
      const stats = calculateGPA(subData);
      const totalMarks = subData.reduce((acc, curr) => acc + curr.total, 0);
      return { ...s, subData, stats: { ...stats, totalMarks } };
    });
    data.sort((a, b) => b.stats.totalMarks - a.stats.totalMarks);
    const rankedData = data.map((s, i) => ({ ...s, merit: i + 1 }));
    return { processedStudents: rankedData, subjects: classSubjects };
  }, [students, selectedClass, selectedGroup]);

  const SUBJECTS_PER_PAGE = 6;
  const subjectChunks = [];
  for (let i = 0; i < subjects.length; i += SUBJECTS_PER_PAGE) {
    subjectChunks.push(subjects.slice(i, i + SUBJECTS_PER_PAGE));
  }

  const handlePrint = useReactToPrint({ content: () => printRef.current, documentTitle: `Tabulation` });

  const handleDownloadPDF = () => {
    const opt = { margin: 2, filename: `Tabulation.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' } };
    html2pdf().set(opt).from(printRef.current).save();
  };

  if (!students.length) return <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>No Data Available</div>;

  return (
    <div className="tabulation-container">
      <div className="controls no-print">
        <button onClick={handlePrint} className="print-btn">🖨️ Print Tabulation</button>
        <button onClick={handleDownloadPDF} className="download-btn" style={{ marginLeft: '10px', background: '#ed8936' }}>⬇️ Download PDF</button>
        <div className="info">Scroll down to see all pages. Each page shows {SUBJECTS_PER_PAGE} subjects.</div>
      </div>
      <div className="sheet-preview" ref={printRef}>
        {subjectChunks.map((chunk, pageIndex) => (
          <div key={pageIndex} className="landscape-a4">
            <header className="sheet-header">
              <img src={logo} alt="" />
              <h1>AL-FALAH MODEL ACADEMY</h1>
              <h3>Tabulation Sheet - Annual Exam 2025</h3>
              <div className="meta"><span>Class: {selectedClass}</span><span>Group: {selectedGroup}</span><span>Version: {selectedVersion}</span><span>Page: {pageIndex + 1} / {subjectChunks.length}</span></div>
            </header>
            <table className="tabulation-table">
              <thead>
                <tr>
                  <th className="sticky-col" rowSpan="2">Roll</th><th className="sticky-col name-col" rowSpan="2">Name</th>
                  {chunk.map(sub => <th key={sub} colSpan="3" className="sub-header">{sub}</th>)}
                  {pageIndex === subjectChunks.length - 1 && <><th rowSpan="2" className="stat-header">Total</th><th rowSpan="2" className="stat-header">GPA</th><th rowSpan="2" className="stat-header">Merit</th></>}
                </tr>
                <tr>
                  {chunk.map(sub => <React.Fragment key={sub + 'sub'}><th className="tiny">Term</th><th className="tiny">MT</th><th className="tiny total">Total</th></React.Fragment>)}
                </tr>
              </thead>
              <tbody>
                {processedStudents.map(student => (
                  <tr key={student.id}>
                    <td className="sticky-col center">{student.roll}</td><td className="sticky-col name-col">{student.name}</td>
                    {chunk.map((subName) => {
                      const globalIndex = subjects.indexOf(subName);
                      const data = student.subData[globalIndex] || {};
                      return <React.Fragment key={student.id + subName}><td>{data.term || '-'}</td><td>{data.mt || '-'}</td><td className="bold">{data.total || '-'}</td></React.Fragment>;
                    })}
                    {pageIndex === subjectChunks.length - 1 && <><td className="bold center">{student.stats.totalMarks}</td><td className="bold center">{student.stats.gpa}</td><td className="bold center">{student.merit}</td></>}
                  </tr>
                ))}
              </tbody>
            </table>
            {pageIndex === subjectChunks.length - 1 && (<div style={{ marginTop: '140px', textAlign: 'right', paddingRight: '50px' }}><div style={{ borderTop: '1px solid black', display: 'inline-block', width: '200px', textAlign: 'center', paddingTop: '5px', fontWeight: 'bold' }}>Principal Signature</div></div>)}
            <div className="html2pdf__page-break"></div><div className="page-break"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default TabulationSheet;