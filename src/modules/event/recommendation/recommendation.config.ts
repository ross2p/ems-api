export const RECOMMENDATION_WEIGHTS = {
  category: 0.4,
  location: 0.3,
  time: 0.2,
  collaborative: 0.1,
} as const;

export const RECOMMENDATION_THRESHOLDS = {
  maxDistance: 50,
  minSimilarUsers: 3,
  maxRecommendations: 10,
} as const;

export const RECOMMENDATION_CANDIDATE_CONFIG = {
  maxCandidates: 100,
  sameCategoryLimit: 50,
  nearbyEventsLimit: 30,
  upcomingTimeRange: 90 * 24 * 60 * 60 * 1000, // 90 days in milliseconds
} as const;
