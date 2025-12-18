import Student from '../models/Student.js';

// Helper Maps
const CLASS_TO_NUM = {
  "One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5,
  "Six": 6, "Seven": 7, "Eight": 8, "Nine": 9, "Ten": 10
};

const VERSION_CODE = {
  "Bangla": 1,
  "English": 2
};

// 1. Get Students (Updated to filter by Version if needed later)
export const getStudentsByClass = async (req, res) => {
  try {
    const { className } = req.params;
    const { group, version } = req.query; // Support version filtering

    let query = { class: className };
    if (group && group !== 'General') query.group = group;
    if (version) query.version = version;

    const students = await Student.find(query).sort({ roll: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Create Student (NEW ID LOGIC)
export const createStudent = async (req, res) => {
  try {
    const { name, roll, className, group, version } = req.body;

    // A. Parse Inputs
    const classNum = CLASS_TO_NUM[className] || 0;     // e.g. "Eight" -> 8
    const versionCode = VERSION_CODE[version] || 1;     // e.g. "English" -> 2
    
    // B. Pad Roll Number to 3 digits (e.g., 12 -> "012")
    const rollString = roll.toString().padStart(3, '0');

    // C. Generate Final ID: 82012
    const id = `${classNum}${versionCode}${rollString}`;

    // D. Check for duplicate ID
    const existing = await Student.findOne({ id });
    if (existing) {
      return res.status(400).json({ error: `Student ID ${id} already exists.` });
    }
    
    const newStudent = new Student({
      id,
      name,
      roll, // We store the simple roll "12" for display
      class: className,
      group,
      version, // Save the version text "English"
      marks: []
    });

    await newStudent.save();
    res.json(newStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Bulk Update
export const updateBulkMarks = async (req, res) => {
  try {
    const studentsData = req.body;
    const bulkOps = studentsData.map(student => ({
      updateOne: {
        filter: { id: student.id },
        update: { $set: { marks: student.marks, roll: student.roll, name: student.name } },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) await Student.bulkWrite(bulkOps);
    res.json({ message: "Saved" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Delete
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await Student.findOneAndDelete({ id });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};