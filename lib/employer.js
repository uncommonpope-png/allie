const path = require('path');
const fs = require('fs');

const QUESTIONS = [
  { id: 'culture', question: 'How would you describe your company culture?', type: 'text', weight: 20, maxScore: 10,
    options: ['Innovative and fast-paced', 'Stable and structured', 'Collaborative and team-oriented', 'Results-driven', 'Mission-driven'] },
  { id: 'values', question: 'What are your core company values?', type: 'text', weight: 15, maxScore: 10 },
  { id: 'remote', question: 'What is your remote work policy?', type: 'choice', weight: 10, maxScore: 10,
    options: ['Fully remote', 'Hybrid (2-3 days in office)', 'Hybrid (flexible)', 'In-office required', 'Depends on role'] },
  { id: 'growth', question: 'How do you support employee growth?', type: 'text', weight: 15, maxScore: 10 },
  { id: 'compensation', question: 'How do you describe your compensation philosophy?', type: 'text', weight: 10, maxScore: 10 },
  { id: 'benefits', question: 'What are your top 3 employee benefits?', type: 'text', weight: 10, maxScore: 10 },
  { id: 'mission', question: 'What problem does your company solve?', type: 'text', weight: 10, maxScore: 10 },
  { id: 'diversity', question: 'How do you approach DEI initiatives?', type: 'text', weight: 10, maxScore: 10 }
];

function getEmployerPath(projectDir) {
  return path.join(projectDir || process.cwd(), 'allie-employer.json');
}

function load(projectDir) {
  const fp = getEmployerPath(projectDir);
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return { answers: [], reports: [] }; }
}

function save(projectDir, data) {
  fs.writeFileSync(getEmployerPath(projectDir), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function getQuestions() { return QUESTIONS; }

function submitAnswer(projectDir, questionId, answer) {
  const q = QUESTIONS.find(q => q.id === questionId);
  if (!q) throw new Error(`Unknown question: ${questionId}`);
  if (!answer) throw new Error('Answer is required');
  const data = load(projectDir);
  const existing = data.answers.find(a => a.questionId === questionId);
  const entry = { questionId, question: q.question, answer, updatedAt: new Date().toISOString() };
  if (existing) Object.assign(existing, entry);
  else data.answers.push(entry);
  save(projectDir, data);
  return entry;
}

function listAnswers(projectDir) {
  const data = load(projectDir);
  const answered = new Set(data.answers.map(a => a.questionId));
  const remaining = QUESTIONS.filter(q => !answered.has(q.id));
  return { answers: data.answers, total: data.answers.length, remaining: remaining.length, questionsRemaining: remaining.map(q => q.id) };
}

function analyze(projectDir) {
  const data = load(projectDir);
  const answers = data.answers;
  if (answers.length === 0) return { score: 0, label: 'No Data', message: 'Complete the employer brand questionnaire first' };

  let totalScore = 0;
  let maxPossible = 0;
  const strengths = [];
  const weaknesses = [];
  for (const q of QUESTIONS) {
    maxPossible += q.weight * q.maxScore;
    const answer = answers.find(a => a.questionId === q.id);
    if (answer && answer.answer) {
      const length = answer.answer.length;
      const detailScore = Math.min(q.maxScore, Math.ceil(length / 20));
      const weighted = detailScore * q.weight;
      totalScore += weighted;
      if (detailScore >= 7) strengths.push(q.question);
      else if (detailScore < 4) weaknesses.push(q.question);
    }
  }
  const finalScore = Math.min(100, Math.round((totalScore / Math.max(1, maxPossible)) * 100));
  const label = finalScore >= 80 ? 'Strong' : finalScore >= 60 ? 'Developing' : finalScore >= 40 ? 'Needs Work' : 'Weak';
  const report = { score: finalScore, label, strengths, weaknesses, answersProvided: answers.length, totalQuestions: QUESTIONS.length, generatedAt: new Date().toISOString() };
  data.reports.push(report);
  save(projectDir, data);
  return report;
}

function history(projectDir) {
  const data = load(projectDir);
  return data.reports.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
}

function suggest(projectDir) {
  const questionsRemaining = listAnswers(projectDir).questionsRemaining;
  return QUESTIONS.filter(q => questionsRemaining.includes(q.id));
}

module.exports = { getQuestions, submitAnswer, listAnswers, analyze, history, suggest };
