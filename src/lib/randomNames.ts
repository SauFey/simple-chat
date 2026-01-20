const adjectives = [
  'Glad', 'Snäll', 'Modig', 'Lugn', 'Pigg',
  'Rolig', 'Smart', 'Snabb', 'Stark', 'Tyst',
  'Varm', 'Kall', 'Vild', 'Mjuk', 'Fin',
  'Söt', 'Cool', 'Fräsch', 'Mysig', 'Lycklig'
];

const nouns = [
  'Panda', 'Tiger', 'Uggla', 'Räv', 'Varg',
  'Björn', 'Hund', 'Katt', 'Fågel', 'Delfin',
  'Lejon', 'Elefant', 'Koala', 'Pingvin', 'Kanin',
  'Apa', 'Zebra', 'Giraff', 'Orm', 'Känguru'
];

export const generateRandomName = (): string => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);
  return `${adjective}${noun}${number}`;
};

export const generateSessionId = (): string => {
  return crypto.randomUUID();
};
