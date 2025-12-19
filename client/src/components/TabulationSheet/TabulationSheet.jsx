import React, { useRef, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import { getSubjects } from '../../config/SubjectConfig';
import { calculateGrade, calculateGPA } from '../../utils/grading';
import './TabulationSheet.scss';
import logo from '../../assets/logo.png';

const TabulationSheet = ({ students, selectedClass, selectedGroup, selectedVersion }) => {
  const printRef = useRef();

  // 1. CONFIGURATION
  // 15 Students per page provides open visibility and fits the 100px signature gap 
  const STUDENTS_PER_PAGE = 15; 
  const SUBJECTS_PER_PAGE = 6;

  // 2. DATA PROCESSING 
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

  // 3. 2D PAGINATION LOGIC (Subjects + Students) 
  const pages = useMemo(() => {
    if (!processedStudents.length) return [];

    const generatedPages = [];
    
    for (let subStart = 0; subStart < subjects.length; subStart += SUBJECTS_PER_PAGE) {
      const subjectChunk = subjects.slice(subStart, subStart + SUBJECTS_PER_PAGE);
      const isLastSubjectPage = (subStart + SUBJECTS_PER_PAGE) >= subjects.length;

      for (let studStart = 0; studStart < processedStudents.length; studStart += STUDENTS_PER_PAGE) {
        const studentChunk = processedStudents.slice(studStart, studStart + STUDENTS_PER_PAGE);
        
        generatedPages.push({
          subjectChunk,
          studentChunk,
          isLastSubjectPage,
          pageIndex: generatedPages.length
        });
      }
    }
    return generatedPages;
  }, [processedStudents, subjects]);


  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Tabulation_Class_${selectedClass}`,
  });

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    element.classList.add('pdf-mode');

    const opt = {
      margin: 0, 
      filename: `Tabulation_${selectedClass}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error("PDF Generation Error", e);
    } finally {
      element.classList.remove('pdf-mode');
    }
  };

  if (!students.length) return <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>No Data Available</div>;

  return (
    <div className="tabulation-container">
      <div className="controls no-print">
        <button onClick={handlePrint} className="print-btn">🖨️ Print All</button>
        <button onClick={handleDownloadPDF} className="download-btn">⬇️ Download PDF</button>
        <div className="info">
          Total Pages: {pages.length} | Students/Page: {STUDENTS_PER_PAGE}
        </div>
      </div>

      <div className="sheet-preview" ref={printRef}>
        {pages.map((page, index) => (
          <div key={index} className="landscape-a4">
            <header className="sheet-header">
              <img src={logo} alt="Logo" />
              <h1>AL-FALAH MODEL ACADEMY</h1>
              <h3>Tabulation Sheet - Annual Exam 2025</h3>
              <div className="meta">
                <span>Class: {selectedClass}</span>
                <span>Group: {selectedGroup}</span>
                <span>Version: {selectedVersion}</span>
                <span>Page: {index + 1} / {pages.length}</span>
              </div>
            </header>

            <table className="tabulation-table">
              <thead>
                <tr>
                  <th className="sticky-col" rowSpan="2">Roll</th>
                  <th className="sticky-col name-col" rowSpan="2">Name</th>
                  {page.subjectChunk.map(sub => (
                    <th key={sub} colSpan="3" className="sub-header">{sub}</th>
                  ))}
                  {page.isLastSubjectPage && (
                    <>
                      <th rowSpan="2" className="stat-header">Total</th>
                      <th rowSpan="2" className="stat-header">GPA</th>
                      <th rowSpan="2" className="stat-header">Merit</th>
                    </>
                  )}
                </tr>
                <tr>
                  {page.subjectChunk.map(sub => (
                    <React.Fragment key={sub + 'sub'}>
                      <th className="tiny">Term</th>
                      <th className="tiny">MT</th>
                      <th className="tiny total">Total</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {page.studentChunk.map(student => (
                  <tr key={student.id}>
                    <td className="sticky-col center">{student.roll}</td>
                    <td className="sticky-col name-col">{student.name}</td>
                    {page.subjectChunk.map((subName) => {
                      const globalIndex = subjects.indexOf(subName);
                      const data = student.subData[globalIndex] || {};
                      return (
                        <React.Fragment key={student.id + subName}>
                          <td>{data.term || '-'}</td>
                          <td>{data.mt || '-'}</td>
                          <td className="bold">{data.total || '-'}</td>
                        </React.Fragment>
                      );
                    })}
                    {page.isLastSubjectPage && (
                      <>
                        <td className="bold center">{student.stats.totalMarks}</td>
                        <td className="bold center">{student.stats.gpa}</td>
                        <td className="bold center">{student.merit}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="signature-section">
              <div className="sig-line">Principal Signature</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabulationSheet;