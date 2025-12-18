// src/config/SubjectConfig.js

// 1. Define which groups exist for which class
export const GROUPS_BY_CLASS = {
  "One": ["General"],
  "Two": ["General"],
  "Three": ["General"],
  "Four": ["General"],
  "Five": ["General"],
  "Six": ["General"],
  "Seven": ["General"],
  "Eight": ["General"],
  "Nine": ["Science", "Business Studies", "Humanities"],
  "Ten": ["Science", "Business Studies", "Humanities"]
};

// 2. Define the subjects
const SUBJECT_LISTS = {
  // --- PRIMARY ---
  "One_General": ["Bangla", "English For Today", "Mathematics"],
  "Two_General": ["Bangla", "English For Today", "Mathematics"],
  
  "Three_General": ["Bangla", "English For Today", "Mathematics", "BGS", "Gen. Science", "Islam & Moral"],
  "Four_General": ["Bangla", "English For Today", "Mathematics", "BGS", "Gen. Science", "Islam & Moral"],
  "Five_General": ["Bangla", "English For Today", "Mathematics", "BGS", "Gen. Science", "Islam & Moral"],

  // --- JUNIOR SECONDARY ---
  "Six_General": ["Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math", "BGS", "Gen. Science", "Islam & Moral", "Agriculture", "ICT", "Phy. Edu", "Work & Life", "Arts & Crafts"],
  "Seven_General": ["Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math", "BGS", "Gen. Science", "Islam & Moral", "Agriculture", "ICT", "Phy. Edu", "Work & Life", "Arts & Crafts"],
  "Eight_General": ["Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math", "BGS", "Gen. Science", "Islam & Moral", "Agriculture", "ICT", "Phy. Edu", "Work & Life", "Arts & Crafts"],

  // --- SECONDARY (NINE & TEN) ---
  // SCIENCE
  "Nine_Science": ["Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math", "ICT", "Phy. Edu", "Work & Life", "Arts & Crafts", "Islam & Moral", "Physics", "Chemistry", "Biology", "Higher Math", "BGS"],
  "Ten_Science":  ["Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math", "ICT", "Phy. Edu", "Work & Life", "Arts & Crafts", "Islam & Moral", "Physics", "Chemistry", "Biology", "Higher Math", "BGS"],

  // BUSINESS STUDIES
  "Nine_Business Studies": ["Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math", "ICT", "Phy. Edu", "Work & Life", "Arts & Crafts", "Islam & Moral", "Accounting", "Finance", "Entrepreneurship", "Gen. Science", "Agriculture"],
  "Ten_Business Studies":  ["Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math", "ICT", "Phy. Edu", "Work & Life", "Arts & Crafts", "Islam & Moral", "Accounting", "Finance", "Entrepreneurship", "Gen. Science", "Agriculture"],

  // HUMANITIES
  "Nine_Humanities": ["Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math", "ICT", "Phy. Edu", "Work & Life", "Arts & Crafts", "Islam & Moral", "History", "Geography", "Civics", "Gen. Science", "Agriculture"],
  "Ten_Humanities":  ["Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math", "ICT", "Phy. Edu", "Work & Life", "Arts & Crafts", "Islam & Moral", "History", "Geography", "Civics", "Gen. Science", "Agriculture"]
};

// Helper to get subjects safely
export const getSubjects = (className, group) => {
  const key = `${className}_${group}`;
  return SUBJECT_LISTS[key] || [];
};