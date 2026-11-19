"""Helpers for authoring question banks. Options are written correct-first,
then shuffled deterministically so the right answer isn't always A."""
import json, random, hashlib

class Bank:
    def __init__(self, subject, prefix):
        self.subject = subject
        self.prefix = prefix
        self.items = []
        self.counter = {}

    def add(self, pool, topic, skill, diff, cmd, prompt, *, options=None, answer=None,
            mistakes=None, hint=None, explain=None, steps=None, unit=None, tol=None,
            display=None, stimulus=None, passage=None, multi=None, order=None, marks=1):
        key = (topic, pool)
        self.counter[key] = self.counter.get(key, 0) + 1
        p = {'diagnostic': 'd', 'practice': 'p', 'mock': 'x'}[pool]
        qid = f"{topic}-{p}{self.counter[key]:02d}"
        q = {'id': qid, 'subject': self.subject, 'topic': topic, 'pool': pool,
             'skill': skill, 'difficulty': diff, 'command': cmd, 'prompt': prompt}
        if options is not None:
            correct = options[0]
            rnd = random.Random(int(hashlib.md5(qid.encode()).hexdigest(), 16))
            opts = options[:]
            if not (order == 'keep'):
                rnd.shuffle(opts)
            q['type'] = 'mcq'
            q['options'] = opts
            q['answer'] = opts.index(correct)
            if mistakes:
                q['mistakes'] = {str(opts.index(k)): v for k, v in mistakes.items()}
        elif multi is not None:
            # multi = (options, correct_list)
            opts, correct = multi
            q['type'] = 'multi'
            q['options'] = opts
            q['answer'] = sorted(opts.index(c) for c in correct)
        elif isinstance(answer, (int, float)) or (isinstance(answer, list) and answer and isinstance(answer[0], (int, float))):
            q['type'] = 'numeric'
            q['answer'] = answer
            if tol is not None: q['tolerance'] = tol
            if unit: q['unit'] = unit
            if display is not None: q['display'] = display
            if mistakes: q['mistakes'] = {str(k): v for k, v in mistakes.items()}
        else:
            q['type'] = 'text'
            q['answer'] = answer if isinstance(answer, list) else [answer]
            if mistakes: q['mistakes'] = {k.lower(): v for k, v in mistakes.items()}
        if hint: q['hint'] = hint
        if explain: q['explanation'] = explain
        if steps: q['steps'] = steps
        if stimulus: q['stimulus'] = stimulus
        if passage:
            q['passage'] = passage
            q['order'] = len([x for x in self.items if x.get('passage') == passage]) + 1
        if marks != 1: q['marks'] = marks
        self.items.append(q)
        return q

    def dump(self, path):
        with open(path, 'w') as f:
            json.dump({'subject': self.subject, 'version': 1, 'questions': self.items}, f, indent=1, ensure_ascii=False)
        return len(self.items)

def table(headers, rows, caption=None):
    t = {'type': 'table', 'headers': headers, 'rows': rows}
    if caption: t['caption'] = caption
    return t

def bar(labels, values, caption=None, ylabel=None):
    b = {'type': 'bar', 'labels': labels, 'values': values}
    if caption: b['caption'] = caption
    if ylabel: b['yLabel'] = ylabel
    return b

def line(labels, values, caption=None, ylabel=None, xlabel=None):
    b = {'type': 'line', 'labels': labels, 'values': values}
    if caption: b['caption'] = caption
    if ylabel: b['yLabel'] = ylabel
    if xlabel: b['xLabel'] = xlabel
    return b

def svg(markup, caption=None):
    s = {'type': 'svg', 'svg': markup}
    if caption: s['caption'] = caption
    return s
