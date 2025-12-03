export interface RecommendationConfig {
  weights: {
    category: number;
    location: number;
    time: number;
    collaborative: number;
  };
  maxDistance: number;
  minSimilarUsers: number;
  maxRecommendations: number;
  candidateGeneration: {
    maxCandidates: number;
    sameCategoryLimit: number;
    nearbyEventsLimit: number;
    upcomingDaysRange: number;
  };
}

export const RECOMMENDATION_CONFIG: RecommendationConfig = {
  weights: {
    category: 0.4,
    location: 0.3,
    time: 0.2,
    collaborative: 0.1,
  },
  maxDistance: 50,
  minSimilarUsers: 3,
  maxRecommendations: 10,
  candidateGeneration: {
    maxCandidates: 100,
    sameCategoryLimit: 50,
    nearbyEventsLimit: 30,
    upcomingDaysRange: 90,
  },
};
