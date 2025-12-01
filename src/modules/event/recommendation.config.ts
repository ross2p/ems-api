export interface RecommendationConfig {
  weights: {
    category: number;
    location: number;
    time: number;
    collaborative: number;
  };
  maxDistance: number; // Maximum distance in kilometers for location similarity
  minSimilarUsers: number; // Minimum number of similar users to consider
  maxRecommendations: number; // Default number of recommendations to return
}

export const RECOMMENDATION_CONFIG: RecommendationConfig = {
  weights: {
    category: 0.4, // 40% weight for category similarity
    location: 0.3, // 30% weight for location similarity
    time: 0.2, // 20% weight for time similarity
    collaborative: 0.1, // 10% weight for collaborative filtering
  },
  maxDistance: 50, // 50 km
  minSimilarUsers: 3, // At least 3 similar users
  maxRecommendations: 10, // Return top 10 recommendations by default
};

