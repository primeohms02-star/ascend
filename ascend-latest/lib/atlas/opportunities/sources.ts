export type OpportunitySource = {
  name: string;

  category:
    | "jobs"
    | "remote"
    | "internships"
    | "scholarships"
    | "grants"
    | "competitions"
    | "startup"
    | "learning";

  global: boolean;

  remote: boolean;

  enabled: boolean;
};

export const OpportunitySources: OpportunitySource[] = [

  // -----------------------------
  // Global Jobs
  // -----------------------------

  {
    name: "LinkedIn",
    category: "jobs",
    global: true,
    remote: true,
    enabled: true,
  },

  {
    name: "Indeed",
    category: "jobs",
    global: true,
    remote: true,
    enabled: true,
  },

  {
    name: "Glassdoor",
    category: "jobs",
    global: true,
    remote: false,
    enabled: true,
  },

  {
    name: "Google Careers",
    category: "jobs",
    global: true,
    remote: true,
    enabled: true,
  },

  {
    name: "Microsoft Careers",
    category: "jobs",
    global: true,
    remote: true,
    enabled: true,
  },

  {
    name: "Meta Careers",
    category: "jobs",
    global: true,
    remote: true,
    enabled: true,
  },

  {
    name: "Amazon Jobs",
    category: "jobs",
    global: true,
    remote: true,
    enabled: true,
  },

  // -----------------------------
  // Remote
  // -----------------------------

  {
    name: "RemoteOK",
    category: "remote",
    global: true,
    remote: true,
    enabled: true,
  },

  {
    name: "We Work Remotely",
    category: "remote",
    global: true,
    remote: true,
    enabled: true,
  },

  {
    name: "Wellfound",
    category: "remote",
    global: true,
    remote: true,
    enabled: true,
  },

  // -----------------------------
  // Internships
  // -----------------------------

  {
    name: "Internshala",
    category: "internships",
    global: true,
    remote: true,
    enabled: true,
  },

  // -----------------------------
  // Scholarships
  // -----------------------------

  {
    name: "ScholarshipPortal",
    category: "scholarships",
    global: true,
    remote: false,
    enabled: true,
  },

  {
    name: "Chevening",
    category: "scholarships",
    global: true,
    remote: false,
    enabled: true,
  },

  {
    name: "DAAD",
    category: "scholarships",
    global: true,
    remote: false,
    enabled: true,
  },

  {
    name: "Commonwealth Scholarships",
    category: "scholarships",
    global: true,
    remote: false,
    enabled: true,
  },

  {
    name: "Mastercard Foundation",
    category: "scholarships",
    global: true,
    remote: false,
    enabled: true,
  },

  // -----------------------------
  // Grants
  // -----------------------------

  {
    name: "Grants.gov",
    category: "grants",
    global: true,
    remote: false,
    enabled: true,
  },

  {
    name: "Google for Startups",
    category: "grants",
    global: true,
    remote: true,
    enabled: true,
  },

  {
    name: "Tony Elumelu Foundation",
    category: "grants",
    global: false,
    remote: false,
    enabled: true,
  },

  // -----------------------------
  // Startup
  // -----------------------------

  {
    name: "Y Combinator",
    category: "startup",
    global: true,
    remote: true,
    enabled: true,
  },

  {
    name: "Techstars",
    category: "startup",
    global: true,
    remote: true,
    enabled: true,
  },

  {
    name: "Founder Institute",
    category: "startup",
    global: true,
    remote: true,
    enabled: true,
  },

  // -----------------------------
  // Competitions
  // -----------------------------

  {
    name: "Devpost",
    category: "competitions",
    global: true,
    remote: true,
    enabled: true,
  },

  {
    name: "Kaggle",
    category: "competitions",
    global: true,
    remote: true,
    enabled: true,
  },

  // -----------------------------
  // Learning
  // -----------------------------

  {
    name: "Coursera",
    category: "learning",
    global: true,
    remote: true,
    enabled: true,
  },

  {
    name: "edX",
    category: "learning",
    global: true,
    remote: true,
    enabled: true,
  },

  {
    name: "FutureLearn",
    category: "learning",
    global: true,
    remote: true,
    enabled: true,
  },

  {
    name: "Udemy",
    category: "learning",
    global: true,
    remote: true,
    enabled: true,
  },

  // -----------------------------
  // Regional Sources
  // -----------------------------

  {
    name: "Jobberman",
    category: "jobs",
    global: false,
    remote: false,
    enabled: true,
  },

  {
    name: "MyJobMag",
    category: "jobs",
    global: false,
    remote: false,
    enabled: true,
  },

];