// Loads the JSON content (curriculum, question banks, lessons) and indexes it.
// `buildContent` is pure so the engine can be tested in Node with the same data.

const FILES = {
  curriculum: 'data/curriculum.json',
  qMaths: 'data/questions/maths.json',
  qScience: 'data/questions/science.json',
  qEnglish: 'data/questions/english.json',
  lMaths: 'data/lessons/maths.json',
  lScience: 'data/lessons/science.json',
  lEnglish: 'data/lessons/english.json',
  passages: 'data/passages.json',
  writing: 'data/writing.json',
  commandWords: 'data/command-words.json',
};

export function buildContent(raw) {
  const curriculum = raw.curriculum;
  const subjects = curriculum.subjects;
  const topics = {};
  for (const s of subjects) for (const t of s.topics) topics[t.id] = { ...t, subject: s.id };
  const questions = [
    ...raw.qMaths.questions,
    ...raw.qScience.questions,
    ...raw.qEnglish.questions,
  ];
  const qById = Object.fromEntries(questions.map((q) => [q.id, q]));
  const lessons = {};
  for (const l of [...raw.lMaths.lessons, ...raw.lScience.lessons, ...raw.lEnglish.lessons]) lessons[l.topic] = l;
  const passages = Object.fromEntries(raw.passages.passages.map((p) => [p.id, p]));
  return {
    curriculum,
    subjects,
    subjectById: Object.fromEntries(subjects.map((s) => [s.id, s])),
    topics,
    questions,
    qById,
    lessons,
    passages,
    writing: raw.writing.tasks,
    commandWords: raw.commandWords.words,
  };
}

export async function loadContent(base = '') {
  const entries = await Promise.all(
    Object.entries(FILES).map(async ([k, path]) => {
      const res = await fetch(base + path, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
      return [k, await res.json()];
    })
  );
  return buildContent(Object.fromEntries(entries));
}
