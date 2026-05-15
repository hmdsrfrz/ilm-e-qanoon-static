export const CONSTITUTIONAL_QUICK_ACTIONS = [
  {
    id:       'fundamental-rights',
    symbol:   '§',
    title:    'Fundamental Rights',
    subtitle: 'Articles 8–28',
    prompt:   'What are my fundamental rights under the Pakistan Constitution?',
  },
  {
    id:       'freedom-speech',
    symbol:   '¶',
    title:    'Freedom of Speech',
    subtitle: 'Article 19',
    prompt:   'Explain Article 19 — freedom of speech and expression in Pakistan.',
  },
  {
    id:       'arrest-rights',
    symbol:   '!',
    title:    'Rights on Arrest',
    subtitle: 'Article 10',
    prompt:   'What are my rights if I am arrested under the Pakistan Constitution?',
  },
  {
    id:       'equal-protection',
    symbol:   '=',
    title:    'Equal Protection',
    subtitle: 'Article 25',
    prompt:   'What does Article 25 say about equality of citizens before the law?',
  },
];

export type QuickAction = typeof CONSTITUTIONAL_QUICK_ACTIONS[number];
