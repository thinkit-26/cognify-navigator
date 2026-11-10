// CBSE: Class 9-10 have a single combined Science paper; Physics/Chemistry/Biology split from Class 11.
const SCIENCE_MATHS = ["Science", "Maths"];
const SENIOR = ["Physics", "Chemistry", "Maths", "Biology", "Accountancy", "Economics"];

export const PYQ_SUBJECTS: Record<number, string[]> = {
  9: SCIENCE_MATHS,
  10: SCIENCE_MATHS,
  11: SENIOR,
  12: SENIOR,
};
