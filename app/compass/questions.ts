import { Question } from "./types";

export const questions: Question[] = [
  {
    id: 1,
    title: "Where are you in your journey?",
    subtitle:
      "Choose the option that best describes where you are today.",
    options: [
      "I'm a Student",
      "I Recently Graduated",
      "I'm Employed",
      "I'm Building a Business",
      "I'm Changing Careers",
      "I'm Not Sure Yet",
    ],
  },
  {
    id: 2,
    title: "Where would you love to be in three years?",
    subtitle:
      "Think about the future that excites you the most.",
    options: [
      "Working my dream job",
      "Running my own business",
      "Financially independent",
      "Living abroad",
      "Leading a team",
      "Still exploring",
    ],
  },
];