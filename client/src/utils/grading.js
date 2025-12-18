// List of subjects that are out of 50 marks
const SUBJECTS_50_MARKS = [
  "Information & Communication Technology", "ICT",
  "Physical Education & Health", "Phy. Edu",
  "Work & Life Oriented Education", "Work & Life",
  "Arts & Crafts", "Arts"
];

export const calculateGrade = (mark, subjectName = "") => {
  let m = parseInt(mark) || 0;
  
  // Check if this is a 50-mark subject
  if (SUBJECTS_50_MARKS.some(s => subjectName.includes(s))) {
    // Scale the mark up to 100 for grading calculation
    m = m * 2; 
  }

  if (m >= 80) return { grade: 'A+', point: 5.00 };
  if (m >= 70) return { grade: 'A', point: 4.00 };
  if (m >= 60) return { grade: 'A-', point: 3.50 };
  if (m >= 50) return { grade: 'B', point: 3.00 };
  if (m >= 40) return { grade: 'C', point: 2.00 };
  if (m >= 33) return { grade: 'D', point: 1.00 };
  
  return { grade: 'F', point: 0.00 };
};

export const calculateGPA = (subjectsList) => {
  if (subjectsList.length === 0) return { totalMarks: 0, gpa: "0.00", totalGrade: "F" };

  let totalPoints = 0;
  let totalMarks = 0;
  let hasFail = false;

  subjectsList.forEach(sub => {
    totalMarks += (sub.total || 0);
    totalPoints += Number(sub.point);
    if (sub.point === 0) hasFail = true;
  });

  if (hasFail) {
      return { totalMarks, gpa: "0.00", totalGrade: "F" };
  }

  const gpaAvg = (totalPoints / subjectsList.length).toFixed(2);
  const gpaNum = Number(gpaAvg);

  let totalGrade = 'F';
  if (gpaNum >= 5.00) totalGrade = 'A+';
  else if (gpaNum >= 4.00) totalGrade = 'A';
  else if (gpaNum >= 3.50) totalGrade = 'A-';
  else if (gpaNum >= 3.00) totalGrade = 'B';
  else if (gpaNum >= 2.00) totalGrade = 'C';
  else if (gpaNum >= 1.00) totalGrade = 'D';

  return { totalMarks, gpa: gpaAvg, totalGrade };
};