// Lightweight content filter for hate speech, harassment, sexual content and bullying.
// Server-side only usage, but pure so it is safe to import anywhere.

const PATTERNS: RegExp[] = [
  // slurs / hate speech
  /\bn+i+g+(?:g+e+r+|g+a+|a+)\b/i,
  /\bf+a+g+(?:g+o+t+)?s?\b/i,
  /\bk+i+k+e+s?\b/i,
  /\bs+p+i+c+s\b/i,
  /\bch+i+n+k+s?\b/i,
  /\btr+a+n+n+y+\b/i,
  /\bret+a+r+d+(?:ed)?\b/i,
  // harassment / bullying / self-harm encouragement
  /\bkill\s*(?:your\s*self|urself|yrself)\b/i,
  /\bkys\b/i,
  /\bgo\s+die\b/i,
  /\bi\s+hope\s+you\s+die\b/i,
  /\byou\s+should\s+(?:die|kill)\b/i,
  /\bnobody\s+(?:likes|loves)\s+you\b/i,
  /\byou'?re\s+(?:so\s+)?(?:worthless|pathetic|disgusting|ugly\s*as|fat\s*(?:pig|cow))\b/i,
  /\b(?:ugly|stupid|worthless|fat)\s+(?:bitch|whore|slut|pig|cow)\b/i,
  /\bi'?ll\s+(?:find|hurt|beat|kill)\s+you\b/i,
  // sexual content
  /\b(?:cock|dick|pussy|cunt|blowjob|handjob|anal|cum|jerk\s*off|horny|nudes?|sext|porn|rape|molest)\b/i,
  /\bsend\s+(?:me\s+)?(?:nudes|pics)\b/i,
  /\bfuck\s+(?:you|off|u)\b/i,
  /\bwhore\b|\bslut\b/i,
];

export function isFlagged(content: string): boolean {
  const normalized = content
    .toLowerCase()
    .replace(/[013457@$!]/g, (c) => ({ "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", $: "s", "!": "i" })[c] ?? c)
    .replace(/[^a-z\s']/g, " ")
    .replace(/\s+/g, " ");

  return PATTERNS.some((re) => re.test(normalized) || re.test(content));
}
