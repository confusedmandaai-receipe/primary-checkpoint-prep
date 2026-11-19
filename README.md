# Checkpoint Prep: a 90-day Cambridge Primary Checkpoint plan

A personal study coach for Cambridge Primary Checkpoint **Mathematics (0096)**, **Science (0097)** and **English (0058)**. It is a static site: HTML, CSS and plain JavaScript, with JSON question banks and progress saved in LocalStorage. It runs on GitHub Pages and needs no build step.

## What it does

| Stage | What happens |
|---|---|
| 1. Diagnose | One diagnostic per subject. Each topic is marked **Strong**, **Developing** or **Needs attention**, and the site builds a priority list. |
| 2. Understand | Lessons for weak topics: the key idea, a visual, worked examples revealed step by step, common mistakes, then guided practice with hints. |
| 3. Practise | Exam-style and mixed-topic sets, command-word practice, structured writing, and mistakes coming back for spaced review. |
| 4. Get ready | Timed mocks every other day and targeted revision. No big new topics. |

- **Separate exam dates per subject.** Each subject's revision ends on its own exam day, the day before each exam is light, and the plan carries on for the subjects still to come.
- **Adapts to the student.** If most of last week's plan went unfinished, the plan gets shorter, starts with a quick-win warm-up and offers half-length mocks. Missed mocks come back as catch-ups, weak topics take turns, and the student can swap a topic.
- **Daily planner.** Each day's plan fits the student's daily study time. Weaker subjects get more time and all three stay balanced. Missed tasks move to a short "rescheduled" list instead of piling up, and "Later" pushes a task to another day.
- **Weekly report.** Shows questions attempted, accuracy, subject and topic results, repeated mistakes and improvement on earlier weeks. Its focus topics are fed into the next week's plan automatically.
- **Mock centre.** Kept separate from practice and uses its own bank of mock-only questions. It has a timer, a question navigator and flags, then answer review, topic and skill analysis, and a history of past mocks.
- **Readiness.** Combines topic coverage, mastery, reasoning-question accuracy and timed mock results. It is never quiz accuracy alone, and it cannot reach "Exam-ready" until there is a mock result in every subject.
- **Subtle gamification.** A learning journey, topic mastery badges (earned for strong results that include reasoning questions), weekly achievements, an optional progress garden and 3-minute challenges. There are no leaderboards, speed rewards or compulsory streaks.

## Run locally

Browsers block `fetch()` for files opened straight from disk, so serve the folder:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to GitHub Pages

Go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, then pick `main` and `/ (root)`. The `.nojekyll` file makes Pages serve the files as they are.

## Project structure

```
index.html            single-page app shell (hash routing)
css/styles.css        design system
js/app.js             router, session runner
js/core/              util, store (storage adapter), content loader
js/engine/            pure logic: marking, analytics, srs, sessions, planner, badges
js/components/        quiz runner, task list, charts and visuals
js/views/             one file per page
data/curriculum.json  subjects → topics (with exam weight and objectives)
data/questions/*.json question banks (diagnostic / practice / mock pools)
data/lessons/*.json   one lesson per topic
data/passages.json    original reading passages
data/writing.json     writing tasks with success criteria
data/command-words.json
tests/                node:test suites for content and engine
```

### Adding questions

Add an object to the right `data/questions/<subject>.json`:

```json
{ "id": "m-frac-p20", "subject": "maths", "topic": "m-frac", "pool": "practice",
  "skill": "reasoning", "difficulty": 2, "command": "calculate", "type": "numeric",
  "prompt": "…", "answer": 24, "unit": "cm", "hint": "…", "explanation": "…",
  "steps": ["…"], "mistakes": { "12": "Halved instead of doubled" } }
```

- **Types:** `mcq` (`options` plus the index in `answer`), `multi` (an array of indices), `numeric` (accepts fractions, units and `$`), and `text` (a list of accepted answers).
- **`mistakes`:** maps a wrong answer to the misconception behind it. The site uses this to explain errors and to find repeated mistakes.
- **Pools:** `diagnostic` questions are used only in diagnostics, and `mock` questions only in mocks.

Run `npm test` to check your new questions. It fails on a bad topic id, a missing explanation, or an answer the marker would reject.

### Backend later

All persistence goes through `Store` and an adapter in `js/core/store.js`. To sync to a server, write a `RemoteAdapter` with the same `load` and `save` methods. The engine modules are pure functions of `(state, content)` and work unchanged.

## Tests

```bash
npm test                  # content, engine and three full student scenarios
node tests/simulate.mjs   # writes day-by-day scenario output to tests/sim-output/
```

The scenario tests simulate three students day by day from setup to the last exam: a quick learner, a reluctant slower learner, and one who needs a push but learns fast once interested. They check that no planning rule is ever broken.

## Content note

All questions, passages, lessons and writing tasks are original practice material written to match Cambridge Primary learning objectives and question styles. They are **not** Cambridge past papers. Cambridge Primary Checkpoint is a trademark of Cambridge University Press & Assessment, which is not affiliated with this project.
