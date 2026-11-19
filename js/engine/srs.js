// Spaced repetition for individual mistakes and for whole topics.
import { addDays } from '../core/util.js';

export const QUESTION_INTERVALS = [1, 3, 7, 14]; // days after box 0..3
export const TOPIC_INTERVALS = [2, 5, 10, 21, 35];

/** Update a question's review card after an attempt. Returns 'corrected' when a past mistake is now fixed. */
export function updateQuestionCard(srs, qid, ok, todayIso) {
  const card = srs.questions[qid];
  if (!ok) {
    srs.questions[qid] = { box: 0, due: addDays(todayIso, 1), wrong: (card?.wrong || 0) + 1, last: todayIso };
    return 'wrong';
  }
  if (!card) return 'none';
  const box = card.box + 1;
  if (box >= QUESTION_INTERVALS.length) {
    delete srs.questions[qid];
    return 'corrected';
  }
  srs.questions[qid] = { ...card, box, due: addDays(todayIso, QUESTION_INTERVALS[box]), last: todayIso };
  return box === 1 ? 'corrected' : 'progress';
}

/** Topic review scheduling after a focused practice session. */
export function updateTopicCard(srs, topicId, fraction, todayIso) {
  const card = srs.topics[topicId] || { box: -1 };
  const box = fraction >= 0.75 ? Math.min(card.box + 1, TOPIC_INTERVALS.length - 1) : 0;
  srs.topics[topicId] = { box, due: addDays(todayIso, fraction >= 0.75 ? TOPIC_INTERVALS[box] : 1), last: todayIso };
}

export function dueQuestions(srs, todayIso) {
  return Object.entries(srs.questions)
    .filter(([, c]) => c.due <= todayIso)
    .sort((a, b) => a[1].due.localeCompare(b[1].due) || b[1].wrong - a[1].wrong)
    .map(([qid]) => qid);
}

export function dueTopics(srs, todayIso) {
  return Object.entries(srs.topics).filter(([, c]) => c.due <= todayIso).map(([t]) => t);
}
