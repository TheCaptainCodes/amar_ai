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
    'Mathematics': '/art/mathematics.avif',
    'History': '/art/history.webp',
    'Geography': '/art/geography.webp',
    'Literature': '/art/literature.jpeg',
    'Computer Science': '/art/computer_science.avif',
    'Economics': '/art/economics.jpg',
    'Art': '/art/art.jpg',
    'Other': '/art/other.jpg',
    // Add more subjects and their image paths here
};
