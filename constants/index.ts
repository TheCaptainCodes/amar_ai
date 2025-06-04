export const subjects = [
  "Physics",
  "Chemistry",
  "Biology",
  "Mathematics",
  "History",
  "Geography",
  "Literature",
  "Computer Science",
  "Economics",
  "Art",
  "Other",
];

export const subjectsColors: { [key: string]: string } = {
  Physics: "#FF5733",
  Chemistry: "#33FF57",
  Biology: "#3357FF",
  Mathematics: "#FF33A1",
  History: "#A133FF",
  Geography: "#33FFA1",
  Literature: "#FF8833",
  "Computer Science": "#33B5FF",
  Economics: "#8833FF",
  Art: "#FF3333",
  Other: "#808080",
  science: "#E5D0FF",
  maths: "#FFDA6E",
  language: "#BDE7FF",
  coding: "#FFC8E4",
  history: "#FFECC8",
  economics: "#C8FFDF",
};

export const voices = {
  male: { casual: "2BJW5coyhAzSr8STdHbE", professional: "c6SfcYrb2t09NHXiT80T" },
  female: { casual: "ZIlrSGI4jZqobxRKprJz", professional: "sarah" },
};

// Mapping of subjects to background images
export const subjectBackgrounds: { [key: string]: string } = {
    'Physics': '/art/physics.jpg',
    'Chemistry': '/art/chemistry.avif',
    'Biology': '/art/biology.webp',
    'Mathematics': '/art/math-art.avif',
    'History': '/art/history-art.avif',
    'Geography': '/art/geography-art.avif',
    'Literature': '/art/literature-art.avif',
    'Computer Science': '/art/cs-art.avif',
    'Economics': '/art/economics-art.avif',
    'Art': '/art/art-art.avif',
    'Other': '/art/default-art.avif',
    // Add more subjects and their image paths here
};

export const recentSessions = [
  {
    id: "1",
    subject: "science",
    name: "Neura the Brainy Explorer",
    topic: "Neural Network of the Brain",
    duration: 45,
    color: "#E5D0FF",
  },
  {
    id: "2",
    subject: "maths",
    name: "Countsy the Number Wizard",
    topic: "Derivatives & Integrals",
    duration: 30,
    color: "#FFDA6E",
  },
  {
    id: "3",
    subject: "language",
    name: "Verba the Vocabulary Builder",
    topic: "English Literature",
    duration: 30,
    color: "#BDE7FF",
  },
  {
    id: "4",
    subject: "coding",
    name: "Codey the Logic Hacker",
    topic: "Intro to If-Else Statements",
    duration: 45,
    color: "#FFC8E4",
  },
  {
    id: "5",
    subject: "history",
    name: "Memo, the Memory Keeper",
    topic: "World Wars: Causes & Consequences",
    duration: 15,
    color: "#FFECC8",
  },
  {
    id: "6",
    subject: "economics",
    name: "The Market Maestro",
    topic: "The Basics of Supply & Demand",
    duration: 10,
    color: "#C8FFDF",
  },
];
