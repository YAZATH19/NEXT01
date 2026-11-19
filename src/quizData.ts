
export type QuizCategory = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

export const quizCategories: QuizCategory[] = [
  {
    id: "general-knowledge",
    name: "General Knowledge",
    icon: "🌍",
    description: "Explore the world around you.",
  },
  {
    id: "science-technology",
    name: "Science & Technology",
    icon: "🔬",
    description: "Discover science and innovation.",
  },
  {
    id: "education",
    name: "Education",
    icon: "📚",
    description: "Learn something new every day.",
  },
  {
    id: "business-finance",
    name: "Business & Finance",
    icon: "💼",
    description: "Test your business knowledge.",
  },
  {
    id: "sports",
    name: "Sports",
    icon: "🏏",
    description: "Challenge your sports knowledge.",
  },
  {
    id: "sri-lanka",
    name: "Sri Lanka",
    icon: "🇱🇰",
    description: "Discover our nation's heritage.",
  },
];
