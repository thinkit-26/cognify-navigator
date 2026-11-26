// Chapter names in book order, for every class and subject on the site. A chapter's number is its place in
// the list (the first name is chapter 1). From the NCERT textbooks (reprint 2026-27) and the CBSE syllabus
// for 2026-27: Class 9 Science and Maths follow the new CBSE 2026-27 syllabus, Class 11 Economics and
// Class 12 Economics follow the CBSE units. A derivation can still be filed under a chapter typed by hand.

const SCIENCE_10 = [
  "Chemical Reactions and Equations",
  "Acids, Bases and Salts",
  "Metals and Non-metals",
  "Carbon and its Compounds",
  "Life Processes",
  "Control and Coordination",
  "How do Organisms Reproduce?",
  "Heredity",
  "Light – Reflection and Refraction",
  "The Human Eye and the Colourful World",
  "Electricity",
  "Magnetic Effects of Electric Current",
  "Our Environment",
];

const SCIENCE_9 = [
  "Exploration: Entering the World of Secondary Science",
  "Cell",
  "Tissues",
  "Motion",
  "Exploring Mixtures and their Separation",
  "Force and Laws of Motion",
  "Work, Energy and Simple Machines",
  "Structure of an Atom",
  "Atoms and Molecules",
  "Sound",
  "Reproduction",
  "Diversity",
  "Earth as a System: Energy, Matter & Life",
];

const MATHS_9 = [
  "Number System",
  "Introduction to Polynomials",
  "Sequences and Progressions",
  "Exploring Algebraic Identities",
  "Linear Equations in Two Variables",
  "Coordinate Geometry",
  "Introduction to Euclid's Geometry: Axioms and Postulates",
  "Lines and Angles",
  "Triangles – Congruence Theorems",
  "4-gons (Quadrilaterals)",
  "Circles",
  "Area and Perimeter",
  "Surface Area and Volume",
  "Statistics",
  "Introduction to Probability",
];

const MATHS_10 = [
  "Real Numbers",
  "Polynomials",
  "Pair of Linear Equations in Two Variables",
  "Quadratic Equations",
  "Arithmetic Progressions",
  "Triangles",
  "Coordinate Geometry",
  "Introduction to Trigonometry",
  "Some Applications of Trigonometry",
  "Circles",
  "Areas Related to Circles",
  "Surface Areas and Volumes",
  "Statistics",
  "Probability",
];

const PHYSICS_11 = [
  "Units and Measurements",
  "Motion in a Straight Line",
  "Motion in a Plane",
  "Laws of Motion",
  "Work, Energy and Power",
  "System of Particles and Rotational Motion",
  "Gravitation",
  "Mechanical Properties of Solids",
  "Mechanical Properties of Fluids",
  "Thermal Properties of Matter",
  "Thermodynamics",
  "Kinetic Theory",
  "Oscillations",
  "Waves",
];

const PHYSICS_12 = [
  "Electric Charges and Fields",
  "Electrostatic Potential and Capacitance",
  "Current Electricity",
  "Moving Charges and Magnetism",
  "Magnetism and Matter",
  "Electromagnetic Induction",
  "Alternating Current",
  "Electromagnetic Waves",
  "Ray Optics and Optical Instruments",
  "Wave Optics",
  "Dual Nature of Radiation and Matter",
  "Atoms",
  "Nuclei",
  "Semiconductor Electronics: Materials, Devices and Simple Circuits",
];

const CHEMISTRY_11 = [
  "Some Basic Concepts of Chemistry",
  "Structure of Atom",
  "Classification of Elements and Periodicity in Properties",
  "Chemical Bonding and Molecular Structure",
  "Thermodynamics",
  "Equilibrium",
  "Redox Reactions",
  "Organic Chemistry – Some Basic Principles and Techniques",
  "Hydrocarbons",
];

const CHEMISTRY_12 = [
  "Solutions",
  "Electrochemistry",
  "Chemical Kinetics",
  "The d- and f-Block Elements",
  "Coordination Compounds",
  "Haloalkanes and Haloarenes",
  "Alcohols, Phenols and Ethers",
  "Aldehydes, Ketones and Carboxylic Acids",
  "Amines",
  "Biomolecules",
];

const MATHS_11 = [
  "Sets",
  "Relations and Functions",
  "Trigonometric Functions",
  "Complex Numbers and Quadratic Equations",
  "Linear Inequalities",
  "Permutations and Combinations",
  "Binomial Theorem",
  "Sequences and Series",
  "Straight Lines",
  "Conic Sections",
  "Introduction to Three Dimensional Geometry",
  "Limits and Derivatives",
  "Statistics",
  "Probability",
];

const MATHS_12 = [
  "Relations and Functions",
  "Inverse Trigonometric Functions",
  "Matrices",
  "Determinants",
  "Continuity and Differentiability",
  "Application of Derivatives",
  "Integrals",
  "Application of Integrals",
  "Differential Equations",
  "Vector Algebra",
  "Three Dimensional Geometry",
  "Linear Programming",
  "Probability",
];

const BIOLOGY_11 = [
  "The Living World",
  "Biological Classification",
  "Plant Kingdom",
  "Animal Kingdom",
  "Morphology of Flowering Plants",
  "Anatomy of Flowering Plants",
  "Structural Organisation in Animals",
  "Cell: The Unit of Life",
  "Biomolecules",
  "Cell Cycle and Cell Division",
  "Photosynthesis in Higher Plants",
  "Respiration in Plants",
  "Plant Growth and Development",
  "Breathing and Exchange of Gases",
  "Body Fluids and Circulation",
  "Excretory Products and their Elimination",
  "Locomotion and Movement",
  "Neural Control and Coordination",
  "Chemical Coordination and Integration",
];

const BIOLOGY_12 = [
  "Sexual Reproduction in Flowering Plants",
  "Human Reproduction",
  "Reproductive Health",
  "Principles of Inheritance and Variation",
  "Molecular Basis of Inheritance",
  "Evolution",
  "Human Health and Disease",
  "Microbes in Human Welfare",
  "Biotechnology: Principles and Processes",
  "Biotechnology and its Applications",
  "Organisms and Populations",
  "Ecosystem",
  "Biodiversity and Conservation",
];

const ACCOUNTANCY_11 = [
  "Introduction to Accounting",
  "Theory Base of Accounting",
  "Recording of Transactions - I",
  "Recording of Transactions - II",
  "Bank Reconciliation Statement",
  "Trial Balance and Rectification of Errors",
  "Depreciation, Provisions and Reserves",
  "Financial Statements - I",
  "Financial Statements - II",
];

const ACCOUNTANCY_12 = [
  "Accounting for Not-for-Profit Organisation",
  "Accounting for Partnership: Basic Concepts",
  "Reconstitution of a Partnership Firm – Admission of a Partner",
  "Reconstitution of a Partnership Firm – Retirement/Death of a Partner",
  "Dissolution of Partnership Firm",
  "Accounting for Share Capital",
  "Issue and Redemption of Debentures",
  "Financial Statements of a Company",
  "Analysis of Financial Statements",
  "Accounting Ratios",
  "Cash Flow Statement",
];

const ECONOMICS_11 = [
  "Statistics: Introduction",
  "Collection, Organisation and Presentation of Data",
  "Statistical Tools and Interpretation",
  "Microeconomics: Introduction",
  "Consumer's Equilibrium and Demand",
  "Producer Behaviour and Supply",
  "Forms of Market and Price Determination under Perfect Competition with Simple Applications",
];

const ECONOMICS_12 = [
  "National Income and Related Aggregates",
  "Money and Banking",
  "Determination of Income and Employment",
  "Government Budget and the Economy",
  "Balance of Payments",
  "Development Experience (1947-90) and Economic Reforms since 1991",
  "Current Challenges facing Indian Economy",
  "Development Experience of India – A Comparison with Neighbours",
];

/** class level, then subject (the names used by PYQ_SUBJECTS), to the chapter names in book order. */
export const CHAPTERS: Record<number, Record<string, string[]>> = {
  9: { Science: SCIENCE_9, Maths: MATHS_9 },
  10: { Science: SCIENCE_10, Maths: MATHS_10 },
  11: { Physics: PHYSICS_11, Chemistry: CHEMISTRY_11, Maths: MATHS_11, Biology: BIOLOGY_11, Accountancy: ACCOUNTANCY_11, Economics: ECONOMICS_11 },
  12: { Physics: PHYSICS_12, Chemistry: CHEMISTRY_12, Maths: MATHS_12, Biology: BIOLOGY_12, Accountancy: ACCOUNTANCY_12, Economics: ECONOMICS_12 },
};
