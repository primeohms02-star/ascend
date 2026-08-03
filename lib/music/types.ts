export const MUSIC_ROLES = [
  "Artist",
  "Producer",
  "Songwriter",
  "DJ",
  "Audio Engineer",
  "Manager",
  "Music Marketer",
  "Instrumentalist",
] as const;

export const MUSIC_STAGES = [
  "Exploring",
  "Emerging",
  "Developing",
  "Established",
] as const;

export const MUSIC_GENRES = [
  "Afrobeats",
  "Afropop",
  "Amapiano",
  "Highlife",
  "Fuji",
  "Gospel",
  "Hip-Hop",
  "R&B",
  "Alternative",
  "Electronic",
  "Jazz",
  "Other",
] as const;

export const MUSIC_SKILLS = [
  "Songwriting",
  "Vocal Performance",
  "Music Production",
  "Beat Making",
  "Recording",
  "Mixing",
  "Mastering",
  "Live Performance",
  "DJing",
  "Music Business",
  "Artist Management",
  "Marketing",
  "Content Creation",
  "Distribution",
  "Instrument Performance",
] as const;

export const MUSIC_GOALS = [
  "Release Music",
  "Grow My Audience",
  "Find Funding",
  "Find Music Opportunities",
  "Build My Team",
  "Improve My Craft",
  "Earn From Music",
  "Enter the Music Industry",
] as const;

export const MUSIC_CHALLENGES = [
  "Funding",
  "Industry Access",
  "Audience Growth",
  "Marketing",
  "Production Resources",
  "Collaboration",
  "Consistency",
  "Music Business Knowledge",
  "Distribution",
  "Performance Opportunities",
] as const;

export const MUSIC_REGIONS = [
  "Nigeria",
  "West Africa",
  "Africa",
  "Remote",
  "Global",
] as const;

export type MusicProfile = {
  id: string;
  userId: string;
  roles: string[];
  careerStage: string;
  genres: string[];
  skills: string[];
  goal: string;
  challenges: string[];
  location: string;
  preferredRegions: string[];
  northStar: string;
  createdAt: string;
  updatedAt: string;
};

export type MusicProfileInput = Omit<
  MusicProfile,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
