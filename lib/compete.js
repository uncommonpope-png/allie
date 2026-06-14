const path = require('path');
const fs = require('fs');

const INDUSTRY_BENCHMARKS = {
  technology: { salaryRange: { jr: '70-95K', mid: '95-140K', sr: '140-200K+', dir: '180-280K+' }, avgTenure: 2.5, remotePercent: 65 },
  finance: { salaryRange: { jr: '55-80K', mid: '80-130K', sr: '130-200K', dir: '180-350K+' }, avgTenure: 4.2, remotePercent: 30 },
  healthcare: { salaryRange: { jr: '50-75K', mid: '75-110K', sr: '110-160K', dir: '150-250K' }, avgTenure: 5.1, remotePercent: 25 },
  marketing: { salaryRange: { jr: '45-65K', mid: '65-95K', sr: '95-140K', dir: '130-200K' }, avgTenure: 2.8, remotePercent: 55 },
  education: { salaryRange: { jr: '40-55K', mid: '55-75K', sr: '75-100K', dir: '90-140K' }, avgTenure: 6.3, remotePercent: 40 },
  manufacturing: { salaryRange: { jr: '40-60K', mid: '60-85K', sr: '85-120K', dir: '110-170K' }, avgTenure: 5.8, remotePercent: 15 },
  retail: { salaryRange: { jr: '30-45K', mid: '45-70K', sr: '70-100K', dir: '90-150K' }, avgTenure: 3.2, remotePercent: 20 },
  consulting: { salaryRange: { jr: '70-100K', mid: '100-160K', sr: '160-250K', dir: '200-400K+' }, avgTenure: 3.0, remotePercent: 45 }
};

function getCompetePath(projectDir) {
  return path.join(projectDir || process.cwd(), 'allie-compete.json');
}

function load(projectDir) {
  const fp = getCompetePath(projectDir);
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return { competitors: [], analyses: [] }; }
}

function save(projectDir, data) {
  fs.writeFileSync(getCompetePath(projectDir), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function getBenchmarks(industry) {
  if (industry) return INDUSTRY_BENCHMARKS[industry] || null;
  return INDUSTRY_BENCHMARKS;
}

function addCompetitor(projectDir, comp) {
  if (!comp.name) throw new Error('Competitor name is required');
  const data = load(projectDir);
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name: comp.name,
    website: comp.website || '',
    industry: comp.industry || 'technology',
    size: comp.size || 'unknown',
    focus: comp.focus || '',
    strengths: comp.strengths || [],
    weaknesses: comp.weaknesses || [],
    pricing: comp.pricing || '',
    notes: comp.notes || '',
    createdAt: new Date().toISOString()
  };
  data.competitors.push(entry);
  save(projectDir, data);
  return entry;
}

function listCompetitors(projectDir) {
  const data = load(projectDir);
  return { competitors: data.competitors, total: data.competitors.length };
}

function analyzeComp(projectDir, compId) {
  const data = load(projectDir);
  const comp = data.competitors.find(c => c.id === compId);
  if (!comp) throw new Error(`Competitor ${compId} not found`);
  const bench = INDUSTRY_BENCHMARKS[comp.industry] || INDUSTRY_BENCHMARKS.technology;
  const analysis = {
    competitor: comp.name,
    industry: comp.industry,
    benchmarks: bench,
    strengthsCount: (comp.strengths || []).length,
    weaknessesCount: (comp.weaknesses || []).length,
    threatLevel: (comp.strengths || []).length >= 5 ? 'High' : (comp.strengths || []).length >= 3 ? 'Medium' : 'Low',
    positioning: [
      { factor: 'Market Focus', theirs: comp.focus, yours: 'Differentiate by...' },
      { factor: 'Pricing', theirs: comp.pricing, yours: 'Compare value prop...' }
    ]
  };
  data.analyses.push(analysis);
  save(projectDir, data);
  return analysis;
}

function compareAll(projectDir) {
  const data = load(projectDir);
  const competitors = data.competitors;
  if (competitors.length === 0) return { message: 'No competitors added yet' };
  const matrix = competitors.map(c => ({
    name: c.name, industry: c.industry, size: c.size,
    strengths: (c.strengths || []).length,
    weaknesses: (c.weaknesses || []).length,
    threat: (c.strengths || []).length >= 5 ? 'High' : (c.strengths || []).length >= 3 ? 'Medium' : 'Low'
  }));
  const topThreats = matrix.filter(m => m.threat === 'High').sort((a, b) => b.strengths - a.strengths);
  return { matrix, topThreats, total: competitors.length };
}

function benchmarkCompensation(projectDir, role, industry, level) {
  const bench = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS.technology;
  const range = bench.salaryRange[level] || bench.salaryRange.mid;
  return { role, industry, level, salaryRange: range, avgTenure: bench.avgTenure, remotePercent: bench.remotePercent, market: `You are competitive if offering ${range} for ${level} ${role} roles in ${industry}.` };
}

module.exports = { getBenchmarks, addCompetitor, listCompetitors, analyzeComp, compareAll, benchmarkCompensation, INDUSTRY_BENCHMARKS };
