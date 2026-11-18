/**
 * Content Moderation & Profanity Filtering Service
 * Masks abusive or offensive terms while preserving administrative visibility options.
 */

// Comprehensive list of abusive/profane keywords across English and common regional transliterations
const PROFANITY_LIST = [
  'fuck', 'fucking', 'fucked', 'fucker', 'shit', 'shitty', 'bitch', 'asshole', 'bastard',
  'dick', 'piss', 'cunt', 'damn', 'crap', 'slut', 'whore', 'moron', 'idiot', 'stupid',
  'bloody', 'scoundrel', 'rubbish', 'worthless', 'horrible', 'cheat', 'fraud', 'liar',
  // Common abusive Indian transliterations
  'chutiya', 'saala', 'kamina', 'harami', 'kutta', 'bhenchod', 'madarchod', 'gandu', 'bakwas'
];

// Build regex matching whole words case-insensitively
const wordPatterns = PROFANITY_LIST.map(word => {
  // Escape special regex characters
  const escaped = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  return `\\b${escaped}\\b`;
});

const regex = new RegExp(wordPatterns.join('|'), 'gi');

/**
 * Filter abusive language from text
 * @param {string} text - The raw input comment
 * @returns {{ sanitizedComment: string, hasProfanity: boolean, flaggedWords: string[] }}
 */
export function filterContent(text) {
  if (!text || typeof text !== 'string') {
    return {
      sanitizedComment: '',
      hasProfanity: false,
      flaggedWords: []
    };
  }

  const flaggedWords = [];
  
  // Find all matches
  let match;
  const testRegex = new RegExp(wordPatterns.join('|'), 'gi');
  while ((match = testRegex.exec(text)) !== null) {
    if (!flaggedWords.includes(match[0].toLowerCase())) {
      flaggedWords.push(match[0].toLowerCase());
    }
  }

  // Replace each profanity word with asterisks
  const sanitizedComment = text.replace(regex, (matched) => {
    return '*'.repeat(matched.length);
  });

  return {
    sanitizedComment,
    hasProfanity: flaggedWords.length > 0,
    flaggedWords
  };
}

export default { filterContent };
