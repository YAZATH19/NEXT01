
export type QuizQuestion = {
  id: string;
  categoryId: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: "gk-001",
    categoryId: "general-knowledge",
    question: "What is the largest ocean on Earth?",
    options: [
      "Atlantic Ocean",
      "Indian Ocean",
      "Pacific Ocean",
      "Arctic Ocean",
    ],
    correctAnswerIndex: 2,
  },
  {
    id: "gk-002",
    categoryId: "general-knowledge",
    question: "Which planet is known as the Red Planet?",
    options: [
      "Venus",
      "Mars",
      "Jupiter",
      "Mercury",
    ],
    correctAnswerIndex: 1,
  },
  {
    id: "gk-003",
    categoryId: "general-knowledge",
    question: "How many continents are there on Earth?",
    options: [
      "Five",
      "Six",
      "Seven",
      "Eight",
    ],
    correctAnswerIndex: 2,
  },
  {
    id: "gk-004",
    categoryId: "general-knowledge",
    question: "What is the chemical symbol for gold?",
    options: [
      "Ag",
      "Au",
      "Fe",
      "Cu",
    ],
    correctAnswerIndex: 1,
  },
  {
    id: "gk-005",
    categoryId: "general-knowledge",
    question: "Which gas do plants primarily absorb during photosynthesis?",
    options: [
      "Oxygen",
      "Nitrogen",
      "Carbon Dioxide",
      "Hydrogen",
    ],
    correctAnswerIndex: 2,
  },

  // Science & Technology
  {
    id: "sci-001",
    categoryId: "science-technology",
    question: "What does CPU stand for?",
    options: [
      "Central Processing Unit",
      "Computer Personal Unit",
      "Central Program Utility",
      "Control Processing User",
    ],
    correctAnswerIndex: 0,
  },
  {
    id: "sci-002",
    categoryId: "science-technology",
    question: "What is the chemical formula for water?",
    options: ["CO2", "O2", "H2O", "NaCl"],
    correctAnswerIndex: 2,
  },
  {
    id: "sci-003",
    categoryId: "science-technology",
    question: "Which organ pumps blood through the body?",
    options: ["Lungs", "Heart", "Brain", "Liver"],
    correctAnswerIndex: 1,
  },
  {
    id: "sci-004",
    categoryId: "science-technology",
    question: "What does HTML stand for?",
    options: [
      "High Text Machine Language",
      "Hyper Transfer Markup Language",
      "HyperText Markup Language",
      "Home Tool Markup Language",
    ],
    correctAnswerIndex: 2,
  },
  {
    id: "sci-005",
    categoryId: "science-technology",
    question: "Which planet is closest to the Sun?",
    options: ["Earth", "Venus", "Mars", "Mercury"],
    correctAnswerIndex: 3,
  },

  // Education
  {
    id: "edu-001",
    categoryId: "education",
    question: "What is 12 multiplied by 8?",
    options: ["84", "96", "108", "112"],
    correctAnswerIndex: 1,
  },
  {
    id: "edu-002",
    categoryId: "education",
    question: "What is the opposite of 'ancient'?",
    options: ["Old", "Historic", "Modern", "Traditional"],
    correctAnswerIndex: 2,
  },
  {
    id: "edu-003",
    categoryId: "education",
    question: "How many degrees are in a right angle?",
    options: ["45", "60", "90", "180"],
    correctAnswerIndex: 2,
  },
  {
    id: "edu-004",
    categoryId: "education",
    question: "Which word is a noun?",
    options: ["Quickly", "Beautiful", "Education", "Run"],
    correctAnswerIndex: 2,
  },
  {
    id: "edu-005",
    categoryId: "education",
    question: "What is the square root of 144?",
    options: ["10", "11", "12", "14"],
    correctAnswerIndex: 2,
  },

  // Business & Finance
  {
    id: "biz-001",
    categoryId: "business-finance",
    question: "What does ROI stand for?",
    options: [
      "Rate of Income",
      "Return on Investment",
      "Revenue of Industry",
      "Risk of Investment",
    ],
    correctAnswerIndex: 1,
  },
  {
    id: "biz-002",
    categoryId: "business-finance",
    question: "What is the main purpose of a business budget?",
    options: [
      "To plan income and expenses",
      "To design a company logo",
      "To recruit employees",
      "To advertise products",
    ],
    correctAnswerIndex: 0,
  },
  {
    id: "biz-003",
    categoryId: "business-finance",
    question: "What does ATM stand for?",
    options: [
      "Automatic Transfer Method",
      "Automated Teller Machine",
      "Account Transaction Manager",
      "Advanced Trading Machine",
    ],
    correctAnswerIndex: 1,
  },
  {
    id: "biz-004",
    categoryId: "business-finance",
    question: "What is profit?",
    options: [
      "Total sales only",
      "Total expenses",
      "Revenue minus expenses",
      "Money borrowed from a bank",
    ],
    correctAnswerIndex: 2,
  },
  {
    id: "biz-005",
    categoryId: "business-finance",
    question: "What does SME stand for?",
    options: [
      "Small and Medium-sized Enterprises",
      "Standard Market Exchange",
      "Sales Management Executive",
      "Strategic Money Evaluation",
    ],
    correctAnswerIndex: 0,
  },

  // Sports
  {
    id: "sport-001",
    categoryId: "sports",
    question: "How many players are in a cricket team on the field?",
    options: ["9", "10", "11", "12"],
    correctAnswerIndex: 2,
  },
  {
    id: "sport-002",
    categoryId: "sports",
    question: "Which sport uses a shuttlecock?",
    options: ["Tennis", "Badminton", "Squash", "Volleyball"],
    correctAnswerIndex: 1,
  },
  {
    id: "sport-003",
    categoryId: "sports",
    question: "How many rings are on the Olympic symbol?",
    options: ["4", "5", "6", "7"],
    correctAnswerIndex: 1,
  },
  {
    id: "sport-004",
    categoryId: "sports",
    question: "How many players are on the field for one football team?",
    options: ["9", "10", "11", "12"],
    correctAnswerIndex: 2,
  },
  {
    id: "sport-005",
    categoryId: "sports",
    question: "Which country won the 1996 Cricket World Cup?",
    options: [
      "Australia",
      "India",
      "Pakistan",
      "Sri Lanka",
    ],
    correctAnswerIndex: 3,
  },

  // Sri Lanka
  {
    id: "sl-001",
    categoryId: "sri-lanka",
    question: "What is the administrative capital of Sri Lanka?",
    options: [
      "Colombo",
      "Kandy",
      "Sri Jayawardenepura Kotte",
      "Galle",
    ],
    correctAnswerIndex: 2,
  },
  {
    id: "sl-002",
    categoryId: "sri-lanka",
    question: "What is the currency of Sri Lanka?",
    options: [
      "Indian Rupee",
      "Sri Lankan Rupee",
      "US Dollar",
      "Maldivian Rufiyaa",
    ],
    correctAnswerIndex: 1,
  },
  {
    id: "sl-003",
    categoryId: "sri-lanka",
    question: "Which mountain is the highest in Sri Lanka?",
    options: [
      "Adam's Peak",
      "Pidurutalagala",
      "Kirigalpotta",
      "Namunukula",
    ],
    correctAnswerIndex: 1,
  },
  {
    id: "sl-004",
    categoryId: "sri-lanka",
    question: "In which year did Sri Lanka gain independence?",
    options: ["1945", "1947", "1948", "1950"],
    correctAnswerIndex: 2,
  },
  {
    id: "sl-005",
    categoryId: "sri-lanka",
    question: "Which city is famous for the Temple of the Tooth?",
    options: ["Colombo", "Anuradhapura", "Kandy", "Matara"],
    correctAnswerIndex: 2,
  },
];

export function getQuestionsByCategory(
  categoryId: string
): QuizQuestion[] {
  return quizQuestions.filter(
    (question) => question.categoryId === categoryId
  );
}
