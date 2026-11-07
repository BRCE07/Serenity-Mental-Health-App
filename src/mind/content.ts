import { Ionicons } from '@expo/vector-icons';
import { Region, SessionMode } from './types';

type Icon = keyof typeof Ionicons.glyphMap;

/* ------------------------------ Mood ------------------------------ */

export const MOODS: { value: 1 | 2 | 3 | 4 | 5; label: string; icon: Icon; color: string }[] = [
  { value: 1, label: 'Rough', icon: 'rainy', color: '#FF7A8A' },
  { value: 2, label: 'Low', icon: 'cloud', color: '#FFB38A' },
  { value: 3, label: 'Okay', icon: 'partly-sunny', color: '#B9A4FF' },
  { value: 4, label: 'Good', icon: 'sunny', color: '#8FF0DA' },
  { value: 5, label: 'Great', icon: 'sparkles', color: '#9BF29B' },
];

export const MOOD_TAGS = ['Sleep', 'Work', 'School', 'Family', 'Friends', 'Health', 'Money', 'Alone', 'Exercise'];

/* ------------------------- Crisis detection ------------------------ */

const CRISIS = [
  /\bsuicid/i, /\bkill myself\b/i, /\bend (it all|my life)\b/i, /\bwant to die\b/i,
  /\bself[- ]?harm/i, /\bhurt myself\b/i, /\bno reason to live\b/i, /\bbetter off without me\b/i,
];
export const hasCrisisLanguage = (text: string) => CRISIS.some((r) => r.test(text));

/* ------------------------ Motivational notes ----------------------- */

export const NOTES = [
  'You do not have to be perfect to be worthy of rest.',
  'Small steps still move you forward.',
  'Feelings are visitors. Let them come and go.',
  'Asking for help is a sign of strength, not weakness.',
  'Be as kind to yourself as you would be to a good friend.',
  'Today only needs your best, not everyone else\'s.',
  'Progress is not a straight line, and that is okay.',
  'You have survived every hard day so far.',
  'Rest is productive. Recharge without guilt.',
  'One breath at a time is enough.',
  'You are allowed to take up space.',
  'It is okay to not be okay. It is not okay to go through it alone.',
];

export function noteForDay(offset = 0): string {
  const d = new Date();
  const dayOfYear = Math.floor((+d - +new Date(d.getFullYear(), 0, 0)) / 86400000);
  return NOTES[(dayOfYear + offset) % NOTES.length];
}

/* --------------------------- Hotlines ----------------------------- */

export interface Hotline {
  id: string;
  name: string;
  desc: string;
  /** Digits to dial. Omit for link-only entries. */
  dial?: string;
  display?: string;
  textTo?: string;
  url?: string;
  emergency?: boolean;
}

export const REGION_LABEL: Record<Region, string> = {
  PH: 'Philippines',
  US: 'United States',
  INTL: 'Elsewhere',
};

export const HOTLINES: Record<Region, Hotline[]> = {
  PH: [
    { id: 'ph911', name: 'National Emergency Hotline', desc: 'Police, ambulance and fire. Immediate danger.', dial: '911', display: '911', emergency: true },
    { id: 'ncmh1553', name: 'NCMH Crisis Hotline', desc: '24/7 free, confidential support for emotional distress and suicide prevention.', dial: '1553', display: '1553' },
    { id: 'ncmh-globe', name: 'NCMH Crisis Hotline (Globe/TM)', desc: 'Mobile line, 24/7.', dial: '09663514518', display: '0966-351-4518' },
    { id: 'ncmh-globe2', name: 'NCMH Crisis Hotline (Globe/TM)', desc: 'Mobile line, 24/7.', dial: '09178998727', display: '0917-899-8727' },
    { id: 'ncmh-smart', name: 'NCMH Crisis Hotline (Smart/TNT)', desc: 'Mobile line, 24/7.', dial: '09186392672', display: '0918-639-2672' },
    { id: 'hopeline', name: 'Hopeline Philippines', desc: '24/7 crisis support. 2919 is toll-free on all networks.', dial: '2919', display: '2919' },
    { id: 'hopeline2', name: 'Hopeline (alternate)', desc: '24/7 crisis support.', dial: '09175584673', display: '0917-558-4673' },
    { id: 'intouch', name: 'In Touch Crisis Line', desc: 'Free and confidential crisis counseling.', dial: '0288931893', display: '(02) 8893-1893' },
    { id: 'intouch2', name: 'In Touch Crisis Line (Globe)', desc: 'Free and confidential crisis counseling.', dial: '09178631136', display: '0917-863-1136' },
  ],
  US: [
    { id: 'us911', name: 'Emergency Services', desc: 'Immediate danger or medical emergency.', dial: '911', display: '911', emergency: true },
    { id: 'us988', name: '988 Suicide & Crisis Lifeline', desc: 'Call or text 988, 24/7, free and confidential.', dial: '988', display: '988', textTo: '988' },
    { id: 'ustext', name: 'Crisis Text Line', desc: 'Text HOME to 741741, 24/7.', textTo: '741741', display: '741741' },
  ],
  INTL: [
    { id: 'ifl', name: 'Find a Helpline', desc: 'Free directory of crisis lines in most countries.', url: 'https://findahelpline.com' },
    { id: 'iasp', name: 'IASP Crisis Centres', desc: 'International Association for Suicide Prevention directory.', url: 'https://www.iasp.info/crisis-centres-helplines/' },
  ],
};

/* ---------------------------- Counselors -------------------------- */
// Fictional sample profiles. Replace with a real directory from your backend.

export interface Counselor {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  languages: string[];
  modes: SessionMode[];
  bio: string;
  years: number;
}

export const SPECIALTIES = ['Anxiety', 'Depression', 'Stress', 'Burnout', 'Grief', 'Sleep', 'Relationships', 'Students'];

export const COUNSELORS: Counselor[] = [
  {
    id: 'c1', name: 'Dr. Maya Santos', title: 'Clinical Psychologist',
    specialties: ['Anxiety', 'Stress', 'Burnout'], languages: ['English', 'Filipino'],
    modes: ['video', 'chat', 'in-person'], years: 12,
    bio: 'Helps busy professionals untangle anxiety and burnout using practical, evidence-based tools like CBT.',
  },
  {
    id: 'c2', name: 'Jon Reyes', title: 'Licensed Guidance Counselor',
    specialties: ['Students', 'Stress', 'Relationships'], languages: ['English', 'Filipino', 'Cebuano'],
    modes: ['video', 'chat'], years: 8,
    bio: 'Works with students and young adults on school pressure, identity and relationships in a warm, easygoing way.',
  },
  {
    id: 'c3', name: 'Dr. Lea Tan', title: 'Psychiatrist',
    specialties: ['Depression', 'Sleep', 'Anxiety'], languages: ['English', 'Filipino'],
    modes: ['video', 'in-person'], years: 15,
    bio: 'Combines assessment, therapy referrals and medication management when needed, at a gentle pace.',
  },
  {
    id: 'c4', name: 'Amina Cruz', title: 'Grief & Trauma Counselor',
    specialties: ['Grief', 'Depression', 'Relationships'], languages: ['English', 'Filipino'],
    modes: ['video', 'chat'], years: 10,
    bio: 'Offers a steady, non-judgmental space for loss, life transitions and healing from difficult experiences.',
  },
  {
    id: 'c5', name: 'Marco Dela Cruz', title: 'Counseling Psychologist',
    specialties: ['Burnout', 'Sleep', 'Stress'], languages: ['English', 'Filipino'],
    modes: ['video', 'chat', 'in-person'], years: 6,
    bio: 'Focuses on sustainable routines, sleep and boundaries for people running on empty.',
  },
];

const SLOT_HOURS = [9, 10, 11, 14, 15, 16, 19];

/** Deterministic pseudo-availability so the UI feels real without a backend. */
export function slotsFor(counselorId: string, dayOffset: number): Date[] {
  const seed = [...counselorId].reduce((a, c) => a + c.charCodeAt(0), 0) + dayOffset * 7;
  const now = new Date();
  return SLOT_HOURS.filter((h, i) => (seed + i * 3) % 4 !== 0)
    .map((h) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, h, 0, 0, 0);
      return d;
    })
    .filter((d) => d.getTime() > now.getTime() + 60 * 60 * 1000);
}

/* ------------------------------ Learn ----------------------------- */

export interface Article {
  id: string;
  title: string;
  icon: Icon;
  summary: string;
  signs: string[];
  helps: string[];
}

export const ARTICLES: Article[] = [
  {
    id: 'stress', title: 'Stress', icon: 'flash',
    summary: 'Stress is the body\'s response to demands. In short bursts it can help; when it never switches off, it wears you down.',
    signs: ['Tight muscles, headaches or stomach upset', 'Irritability or feeling overwhelmed', 'Trouble concentrating or sleeping'],
    helps: ['Short breaks and slow breathing', 'Regular movement and sleep', 'Breaking big tasks into small steps', 'Talking it through with someone you trust'],
  },
  {
    id: 'anxiety', title: 'Anxiety', icon: 'pulse',
    summary: 'Everyone feels anxious sometimes. It becomes a concern when worry is constant, hard to control, or gets in the way of daily life.',
    signs: ['Racing thoughts or constant "what if"', 'Restlessness, fast heartbeat, shortness of breath', 'Avoiding situations that cause worry'],
    helps: ['Grounding and breathing exercises', 'Reducing caffeine and keeping a routine', 'Therapy such as CBT, which is very effective', 'Gradually facing fears rather than avoiding them'],
  },
  {
    id: 'depression', title: 'Low mood & depression', icon: 'cloud',
    summary: 'Depression is more than sadness. It is a persistent low mood or loss of interest that lasts two weeks or more and affects daily life.',
    signs: ['Feeling empty, hopeless or numb', 'Loss of interest in things you used to enjoy', 'Changes in sleep, appetite or energy', 'Thoughts of self-harm (seek help right away)'],
    helps: ['Reaching out to a professional. Depression is treatable', 'Small daily actions: light, a short walk, a meal', 'Staying connected with people, even briefly', 'Being patient with yourself'],
  },
  {
    id: 'burnout', title: 'Burnout', icon: 'battery-dead',
    summary: 'Burnout is exhaustion from prolonged stress, often work-related, with cynicism and a feeling of reduced accomplishment.',
    signs: ['Constant tiredness that rest does not fix', 'Dreading work or study', 'Feeling detached or ineffective'],
    helps: ['Setting boundaries on time and workload', 'Protecting sleep and real breaks', 'Talking to a manager, counselor or doctor', 'Rebuilding things that give energy back'],
  },
  {
    id: 'sleep', title: 'Sleep & mental health', icon: 'moon',
    summary: 'Sleep and mood affect each other. Poor sleep worsens anxiety and low mood, and those in turn make sleep harder.',
    signs: ['Trouble falling or staying asleep', 'Waking very early and unable to return to sleep', 'Feeling unrefreshed despite enough hours'],
    helps: ['Consistent sleep and wake times', 'Screens off and lights low an hour before bed', 'Limiting caffeine after midday', 'Seeing a doctor if problems last weeks'],
  },
  {
    id: 'panic', title: 'Panic attacks', icon: 'alert-circle',
    summary: 'A panic attack is a sudden surge of intense fear with physical symptoms. It feels frightening but peaks within minutes and passes.',
    signs: ['Pounding heart, chest tightness, dizziness', 'Trembling, sweating, tingling', 'Feeling detached or afraid of losing control'],
    helps: ['Remind yourself: this will pass', 'Slow exhale-focused breathing', 'The 5-4-3-2-1 grounding exercise', 'Seek urgent care if chest pain is new or you are unsure'],
  },
];

export const WHEN_TO_SEEK_HELP =
  'Reach out to a professional if feelings last more than two weeks, interfere with work, school or relationships, or you rely on alcohol or other substances to cope. If you have thoughts of harming yourself, contact a crisis line or emergency services right now.';

/* ------------------------------ Coping ---------------------------- */

export interface BreathPhase { label: string; sec: number; scale: number }
export interface BreathPattern { id: string; name: string; sub: string; phases: BreathPhase[] }

export const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: 'box', name: 'Box', sub: '4-4-4-4 · steady focus',
    phases: [
      { label: 'Inhale', sec: 4, scale: 1 }, { label: 'Hold', sec: 4, scale: 1 },
      { label: 'Exhale', sec: 4, scale: 0.55 }, { label: 'Hold', sec: 4, scale: 0.55 },
    ],
  },
  {
    id: '478', name: '4-7-8', sub: 'Wind down for sleep',
    phases: [
      { label: 'Inhale', sec: 4, scale: 1 }, { label: 'Hold', sec: 7, scale: 1 }, { label: 'Exhale', sec: 8, scale: 0.55 },
    ],
  },
  {
    id: 'calm', name: 'Calm', sub: '5-5 · gentle reset',
    phases: [{ label: 'Inhale', sec: 5, scale: 1 }, { label: 'Exhale', sec: 5, scale: 0.55 }],
  },
];

export interface Strategy {
  id: string;
  title: string;
  icon: Icon;
  minutes: number;
  intro: string;
  steps: string[];
}

export const STRATEGIES: Strategy[] = [
  {
    id: 'grounding', title: '5-4-3-2-1 grounding', icon: 'eye', minutes: 3,
    intro: 'Pulls attention out of racing thoughts and into the present using your senses.',
    steps: ['Name 5 things you can see', 'Name 4 things you can touch', 'Name 3 things you can hear', 'Name 2 things you can smell', 'Name 1 thing you can taste, or take one slow breath'],
  },
  {
    id: 'pmr', title: 'Progressive muscle relaxation', icon: 'body', minutes: 8,
    intro: 'Tense then release muscle groups to let go of physical stress.',
    steps: ['Sit or lie comfortably and breathe slowly', 'Tense your feet for 5 seconds, then release for 10', 'Move up: calves, thighs, stomach, hands, arms, shoulders, face', 'Notice the difference between tense and relaxed'],
  },
  {
    id: 'dump', title: 'Brain dump', icon: 'create', minutes: 5,
    intro: 'Get worries out of your head and onto paper so they feel smaller.',
    steps: ['Set a 5-minute timer', 'Write everything on your mind, unfiltered', 'Circle what you can act on today', 'Pick one small next step and let the rest go for now'],
  },
  {
    id: 'move', title: 'Move for 10 minutes', icon: 'walk', minutes: 10,
    intro: 'Even a short walk changes your body chemistry and shifts your mood.',
    steps: ['Step outside if you can', 'Walk at an easy pace, no goal', 'Notice colors, sounds and the air around you'],
  },
  {
    id: 'name', title: 'Name it to tame it', icon: 'chatbubble-ellipses', minutes: 2,
    intro: 'Putting a precise word on a feeling reduces its intensity.',
    steps: ['Pause and ask: what am I feeling right now?', 'Be specific: anxious, disappointed, lonely, tired?', 'Say it: "I am noticing that I feel ___"', 'Ask: what do I need right now?'],
  },
  {
    id: 'reach', title: 'Reach out', icon: 'people', minutes: 5,
    intro: 'Connection is one of the strongest buffers against stress.',
    steps: ['Pick one person you trust', 'Send a simple message: "Can we talk today?"', 'You do not need to explain everything, just start'],
  },
];

/* --------------------------- Community seed ----------------------- */

export const SEED_POSTS: { id: string; alias: string; text: string; minutesAgo: number; hugs: number }[] = [
  { id: 's1', alias: 'Quiet Fox', text: 'Finally told a friend I have been struggling. Scary, but I feel lighter already. If you are holding it in, maybe today is the day.', minutesAgo: 25, hugs: 41 },
  { id: 's2', alias: 'Gentle Heron', text: 'Exam week is eating me alive. Anyone else using tiny 25-minute study blocks? It is the only thing keeping me sane.', minutesAgo: 95, hugs: 23 },
  { id: 's3', alias: 'Soft Willow', text: 'Small win: I got out of bed, showered, and took a walk. It was not much, but it was everything today.', minutesAgo: 240, hugs: 87 },
  { id: 's4', alias: 'Calm Otter', text: 'Reminder that sleep is not a reward for finishing everything. Go to bed. The to-do list will still be there.', minutesAgo: 600, hugs: 56 },
  { id: 's5', alias: 'Kind Comet', text: 'Having a hard anniversary of losing my dad. If you are grieving too, I am thinking of you.', minutesAgo: 1100, hugs: 64 },
];

const ADJ = ['Quiet', 'Gentle', 'Soft', 'Calm', 'Kind', 'Brave', 'Warm', 'Bright', 'Still', 'Steady'];
const NOUN = ['Fox', 'Heron', 'Willow', 'Otter', 'Comet', 'Lantern', 'Meadow', 'River', 'Sparrow', 'Moon'];
export const randomAlias = () =>
  `${ADJ[Math.floor(Math.random() * ADJ.length)]} ${NOUN[Math.floor(Math.random() * NOUN.length)]}`;
