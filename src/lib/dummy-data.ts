// Dummy data powering the cheat-mode dashboards (Abhay = student 7488, Aseem = admin 2368)

export type Student = {
  id: string;
  name: string;
  classLevel: string;
  attendance: { present: number; online: number; absent: number }; // %
  overall: number;
  streak: number;
  subjects: Record<string, number>; // subject -> score%
};

export const STUDENTS: Student[] = [
  { id: "abhay",    name: "Abhay Sharma",  classLevel: "XII PCM", attendance: { present: 88, online: 8,  absent: 4  }, overall: 87, streak: 12, subjects: { Physics: 91, Maths: 88, Chemistry: 82 } },
  { id: "sumanth",  name: "Sumanth",       classLevel: "XII PCM", attendance: { present: 95, online: 4,  absent: 1  }, overall: 82, streak: 9,  subjects: { Physics: 75, Maths: 84, Chemistry: 87 } },
  { id: "harish",   name: "Harish",        classLevel: "XII PCM", attendance: { present: 82, online: 5,  absent: 13 }, overall: 71, streak: 4,  subjects: { Physics: 58, Maths: 74, Chemistry: 81 } },
  { id: "naitik",   name: "Naitik",        classLevel: "XII PCM", attendance: { present: 92, online: 6,  absent: 2  }, overall: 78, streak: 7,  subjects: { Physics: 79, Maths: 76, Chemistry: 80 } },
  { id: "vivaan",   name: "Vivaan Sethi",  classLevel: "XII PCM", attendance: { present: 70, online: 12, absent: 18 }, overall: 64, streak: 3,  subjects: { Physics: 60, Maths: 68, Chemistry: 65 } },
  { id: "meher",    name: "Meher Gupta",   classLevel: "XII PCM", attendance: { present: 76, online: 10, absent: 14 }, overall: 70, streak: 5,  subjects: { Physics: 68, Maths: 72, Chemistry: 70 } },
  { id: "ruveer",   name: "Ruveer",        classLevel: "XII PCM", attendance: { present: 73, online: 13, absent: 14 }, overall: 67, streak: 2,  subjects: { Physics: 64, Maths: 70, Chemistry: 67 } },
  { id: "aarav",    name: "Aarav Suri",    classLevel: "XII PCM", attendance: { present: 78, online: 6,  absent: 16 }, overall: 89, streak: 14, subjects: { Physics: 89, Maths: 92, Chemistry: 86 } },
  { id: "isaam",    name: "Isaam",         classLevel: "XII PCM", attendance: { present: 84, online: 7,  absent: 9  }, overall: 51, streak: 2,  subjects: { Physics: 51, Maths: 54, Chemistry: 48 } },
  { id: "pratiksha",name: "Pratiksha",     classLevel: "XI PCM",  attendance: { present: 96, online: 3,  absent: 1  }, overall: 80, streak: 11, subjects: { Physics: 78, Maths: 82, Chemistry: 80 } },
  { id: "aviraaj",  name: "Aviraaj",       classLevel: "XI PCM",  attendance: { present: 68, online: 8,  absent: 24 }, overall: 62, streak: 1,  subjects: { Physics: 60, Maths: 64, Chemistry: 62 } },
  { id: "singhal",  name: "Aarav Singhal", classLevel: "XI PCM",  attendance: { present: 72, online: 11, absent: 17 }, overall: 69, streak: 4,  subjects: { Physics: 65, Maths: 71, Chemistry: 71 } },
  { id: "arnav",    name: "Arnav",         classLevel: "X",       attendance: { present: 60, online: 18, absent: 22 }, overall: 58, streak: 2,  subjects: { Physics: 55, Maths: 60, Chemistry: 59 } },
  { id: "devika",   name: "Devika",        classLevel: "X",       attendance: { present: 52, online: 22, absent: 26 }, overall: 55, streak: 1,  subjects: { Physics: 52, Maths: 56, Chemistry: 57 } },
  { id: "shriya",   name: "Shriya",        classLevel: "X",       attendance: { present: 44, online: 28, absent: 28 }, overall: 50, streak: 0,  subjects: { Physics: 48, Maths: 52, Chemistry: 50 } },
  { id: "jai",      name: "Jai Goel",      classLevel: "X",       attendance: { present: 32, online: 36, absent: 32 }, overall: 42, streak: 0,  subjects: { Physics: 40, Maths: 44, Chemistry: 42 } },
];

export type Paper = {
  id: string;
  title: string;
  subject: string;
  date: string;
  avgScore: number;
  totalStudents: number;
  difficultyMix: { easy: number; medium: number; hard: number };
  typology: { remembering: number; applying: number; analysing: number };
  format: { theory: number; numerical: number; assertion: number };
  performanceByDifficulty: { easy: number; medium: number; hard: number };
  performanceByTypology: { remembering: number; applying: number; analysing: number };
  performanceByTopic: { topic: string; score: number }[];
  leaderboard: { name: string; score: number }[];
};

export const PAPERS: Paper[] = [
  {
    id: "p1",
    title: "Paper 1, Before Coulomb's Law (MCQ)",
    subject: "Physics",
    date: "2026-05-10",
    avgScore: 42,
    totalStudents: 11,
    difficultyMix: { easy: 64, medium: 35, hard: 1 },
    typology: { remembering: 53, applying: 26, analysing: 21 },
    format: { theory: 60, numerical: 35, assertion: 5 },
    performanceByDifficulty: { easy: 41, medium: 32, hard: 18 },
    performanceByTypology: { remembering: 41, applying: 33, analysing: 36 },
    performanceByTopic: [
      { topic: "Before Coulomb's Law", score: 42 },
      { topic: "Coulomb's Law", score: 32 },
    ],
    leaderboard: [
      { name: "Aarav Suri", score: 89 },
      { name: "Naitik", score: 79 },
      { name: "Sumanth", score: 77 },
      { name: "Harish", score: 64 },
      { name: "Isaam", score: 51 },
    ],
  },
  {
    id: "p2",
    title: "Paper 1, Conduction & Induction (Sub)",
    subject: "Physics",
    date: "2026-05-15",
    avgScore: 39,
    totalStudents: 11,
    difficultyMix: { easy: 55, medium: 40, hard: 5 },
    typology: { remembering: 48, applying: 32, analysing: 20 },
    format: { theory: 50, numerical: 42, assertion: 8 },
    performanceByDifficulty: { easy: 44, medium: 30, hard: 22 },
    performanceByTypology: { remembering: 45, applying: 36, analysing: 30 },
    performanceByTopic: [
      { topic: "Conduction", score: 41 },
      { topic: "Induction", score: 36 },
    ],
    leaderboard: [
      { name: "Aarav Suri", score: 81 },
      { name: "Sumanth", score: 75 },
      { name: "Naitik", score: 61 },
      { name: "Harish", score: 58 },
      { name: "Isaam", score: 45 },
    ],
  },
  {
    id: "p3",
    title: "Paper 2, Coulomb's Law (MCQ)",
    subject: "Physics",
    date: "2026-05-22",
    avgScore: 32,
    totalStudents: 13,
    difficultyMix: { easy: 50, medium: 42, hard: 8 },
    typology: { remembering: 40, applying: 35, analysing: 25 },
    format: { theory: 45, numerical: 48, assertion: 7 },
    performanceByDifficulty: { easy: 38, medium: 26, hard: 14 },
    performanceByTypology: { remembering: 38, applying: 30, analysing: 28 },
    performanceByTopic: [
      { topic: "Coulomb's Law", score: 32 },
      { topic: "Charge Distribution", score: 28 },
    ],
    leaderboard: [
      { name: "Aarav Suri", score: 76 },
      { name: "Aarav Singhal", score: 68 },
      { name: "Sumanth", score: 64 },
      { name: "Pratiksha", score: 58 },
      { name: "Naitik", score: 52 },
    ],
  },
  {
    id: "p4",
    title: "Paper 2, Coulomb's Law (Sub)",
    subject: "Physics",
    date: "2026-05-28",
    avgScore: 15,
    totalStudents: 13,
    difficultyMix: { easy: 40, medium: 45, hard: 15 },
    typology: { remembering: 30, applying: 38, analysing: 32 },
    format: { theory: 40, numerical: 50, assertion: 10 },
    performanceByDifficulty: { easy: 22, medium: 12, hard: 6 },
    performanceByTypology: { remembering: 21, applying: 12, analysing: 14 },
    performanceByTopic: [
      { topic: "Field Calculations", score: 16 },
      { topic: "Force Vectors", score: 14 },
    ],
    leaderboard: [
      { name: "Aarav Suri", score: 38 },
      { name: "Sumanth", score: 28 },
      { name: "Pratiksha", score: 22 },
      { name: "Naitik", score: 18 },
      { name: "Harish", score: 12 },
    ],
  },
];

// Per-student Abhay's data for student-side dashboard
export const ABHAY_TIMELINE = [
  { week: "W1", score: 72, avg: 64 },
  { week: "W2", score: 78, avg: 65 },
  { week: "W3", score: 81, avg: 67 },
  { week: "W4", score: 84, avg: 69 },
  { week: "W5", score: 86, avg: 70 },
  { week: "W6", score: 89, avg: 72 },
  { week: "W7", score: 91, avg: 73 },
];

export const ABHAY_RADAR = [
  { skill: "Conceptual", value: 88, full: 100 },
  { skill: "Speed", value: 78, full: 100 },
  { skill: "Accuracy", value: 92, full: 100 },
  { skill: "Numerical", value: 85, full: 100 },
  { skill: "Theory", value: 81, full: 100 },
  { skill: "Application", value: 86, full: 100 },
];

export const ABHAY_CHAPTERS = [
  { chapter: "Electric Charges", progress: 100 },
  { chapter: "Electric Potential", progress: 86 },
  { chapter: "Capacitance", progress: 64 },
  { chapter: "Current Electricity", progress: 42 },
  { chapter: "Magnetism", progress: 18 },
];

export const ABHAY_RECENT = [
  { paper: "Paper 1, Before Coulomb (MCQ)", subject: "Physics", date: "May 10", score: 78 },
  { paper: "Paper 1, Conduction (Sub)",      subject: "Physics", date: "May 15", score: 72 },
  { paper: "Paper 2, Coulomb's Law (MCQ)",   subject: "Physics", date: "May 22", score: 84 },
  { paper: "Paper 2, Coulomb's Law (Sub)",   subject: "Physics", date: "May 28", score: 71 },
];

export const QUOTES = [
  "One step closer to becoming your best self.",
  "Discipline is the bridge between dreams and accomplishment.",
  "Small daily improvements compound into stunning results.",
  "Don't wish it were easier, wish you were better.",
  "The expert in anything was once a beginner.",
  "Push yourself, because no one else is going to do it for you.",
  "Stars cannot shine without darkness.",
];

/* ---------------- Chapter & subject breakdown (CBSE typology) ---------------- */

export const CHAPTERS_BY_SUBJECT: Record<string, string[]> = {
  Physics: ["Electrostatics", "Current Electricity", "Magnetism", "EM Induction", "Optics", "Modern Physics"],
  Maths: ["Relations & Functions", "Calculus", "Vectors & 3D", "Probability", "Linear Programming"],
  Chemistry: ["Solid State", "Solutions", "Electrochemistry", "Organic-I", "Coordination", "Biomolecules"],
};

// Deterministic pseudo-random so the same student always gets the same numbers
function seeded(seed: string, salt: number) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = ((h ^ seed.charCodeAt(i)) * 16777619) >>> 0;
  h = (h + salt * 2654435761) >>> 0;
  return h / 0xffffffff;
}

export function studentChapterPerf(studentId: string, subject: string, base: number) {
  const list = CHAPTERS_BY_SUBJECT[subject] ?? [];
  return list.map((ch, i) => {
    const jitter = Math.round((seeded(studentId + subject + ch, i) - 0.5) * 24);
    const score = Math.max(20, Math.min(99, base + jitter));
    return { chapter: ch, score };
  });
}

export function classChapterPerf(subject: string) {
  const list = CHAPTERS_BY_SUBJECT[subject] ?? [];
  const subStudents = STUDENTS.filter((s) => s.subjects[subject] != null);
  return list.map((ch, idx) => {
    const avg = Math.round(
      subStudents.reduce((acc, s) => {
        const perChapter = studentChapterPerf(s.id, subject, s.subjects[subject]);
        return acc + (perChapter[idx]?.score ?? s.subjects[subject]);
      }, 0) / Math.max(1, subStudents.length),
    );
    return { chapter: ch, avg };
  });
}

// CBSE-style typology distribution per subject (class-wide rollup)
export const SUBJECT_TYPOLOGY = [
  { subject: "Physics",   Remember: 28, Understand: 30, Apply: 24, Analyse: 18 },
  { subject: "Maths",     Remember: 18, Understand: 26, Apply: 34, Analyse: 22 },
  { subject: "Chemistry", Remember: 32, Understand: 28, Apply: 22, Analyse: 18 },
];

export const CLASS_DIFFICULTY_SPLIT = [
  { name: "Easy",   value: 38, fill: "#22C55E" },
  { name: "Medium", value: 44, fill: "#FBBF24" },
  { name: "Hard",   value: 18, fill: "#EF4444" },
];
