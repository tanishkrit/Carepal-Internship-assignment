/**
 * Sentiment Analysis Engine for Home Care Feedback
 * Combines domain-specific lexicon scoring with rating calibration.
 */

const POSITIVE_WORDS = [
  'great', 'good', 'excellent', 'amazing', 'wonderful', 'caring', 'compassionate',
  'kind', 'gentle', 'punctual', 'attentive', 'professional', 'helpful', 'patient',
  'friendly', 'clean', 'hygienic', 'polite', 'respectful', 'responsible', 'dedicated',
  'skilled', 'experienced', 'comfort', 'peace of mind', 'satisfied', 'pleased', 'recommend',
  'blessed', 'supportive', 'warm', 'thorough', 'diligent', 'on time', 'courteous', 'safe'
];

const NEGATIVE_WORDS = [
  'bad', 'poor', 'terrible', 'horrible', 'worst', 'awful', 'rude', 'late', 'rough',
  'careless', 'negligent', 'unprofessional', 'lazy', 'dirty', 'unhygienic', 'impatient',
  'unresponsive', 'unacceptable', 'painful', 'disappointed', 'upset', 'angry', 'shouting',
  'delay', 'absent', 'unprepared', 'clueless', 'incompetent', 'unsafe', 'distracted',
  'phone', 'complaint', 'mistake', 'reckless', 'dirty uniform', 'unpleasant'
];

/**
 * Classifies feedback text and rating into Positive, Neutral, or Negative sentiment.
 * @param {string} text - User's comment
 * @param {number} averageRating - 1 to 5 average rating
 * @returns {{ sentiment: 'positive' | 'neutral' | 'negative', score: number }}
 */
export function analyzeSentiment(text = '', averageRating = 3) {
  const cleanText = (text || '').toLowerCase();
  
  let score = 0;
  const foundPositives = [];
  const foundNegatives = [];

  POSITIVE_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = cleanText.match(regex);
    if (matches) {
      score += matches.length * 1.5;
      foundPositives.push(word);
    }
  });

  NEGATIVE_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = cleanText.match(regex);
    if (matches) {
      score -= matches.length * 2.0; // Negative experiences weigh heavier
      foundNegatives.push(word);
    }
  });

  // Calibrate score using actual numeric star rating
  if (averageRating >= 4.0) {
    score += 1.5;
  } else if (averageRating <= 2.5) {
    score -= 2.0;
  }

  // Determine sentiment category
  let sentiment = 'neutral';
  if (score >= 1.0) {
    sentiment = 'positive';
  } else if (score <= -1.0) {
    sentiment = 'negative';
  }

  return {
    sentiment,
    score: Math.round(score * 10) / 10,
    foundPositives,
    foundNegatives
  };
}

export default { analyzeSentiment };
