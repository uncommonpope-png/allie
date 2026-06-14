const path = require('path');
const fs = require('fs');

const PLATFORM_DEFAULTS = {
  twitter: { label: 'X / Twitter', min: 1, max: 5, ideal: 3, peak: ['7-9 AM', '12-1 PM', '5-6 PM'], burnout: 10 },
  linkedin: { label: 'LinkedIn', min: 1, max: 2, ideal: 1, peak: ['7-9 AM', '12-1 PM', '5-6 PM'], burnout: 7 },
  instagram: { label: 'Instagram', min: 1, max: 3, ideal: 2, peak: ['9-11 AM', '6-8 PM'], burnout: 14 },
  facebook: { label: 'Facebook', min: 1, max: 2, ideal: 1, peak: ['8-10 AM', '12-2 PM'], burnout: 10 },
  tiktok: { label: 'TikTok', min: 1, max: 4, ideal: 2, peak: ['6-9 PM', '11 AM-1 PM'], burnout: 21 },
  youtube: { label: 'YouTube', min: 1, max: 1, ideal: 1, peak: ['2-4 PM', '6-8 PM'], burnout: 5 },
  threads: { label: 'Threads', min: 1, max: 3, ideal: 2, peak: ['7-9 AM', '5-7 PM'], burnout: 7 }
};

function getConfig(projectDir) {
  const p = path.join(projectDir || process.cwd(), 'allie.json');
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return {}; }
}

function recommend(projectDir) {
  const cfg = getConfig(projectDir);
  const platforms = cfg.platforms || Object.keys(PLATFORM_DEFAULTS);
  const weeklyCapacity = cfg.weeklyCapacity || 14;
  const result = [];
  let totalRecommended = 0;
  for (const p of platforms) {
    const def = PLATFORM_DEFAULTS[p];
    if (!def) continue;
    const recommended = Math.min(def.ideal, Math.max(1, Math.floor(weeklyCapacity / platforms.length)));
    totalRecommended += recommended;
    result.push({
      platform: p, label: def.label, min: def.min, max: def.max,
      ideal: def.ideal, recommended, peak: def.peak,
      weeklyPosts: recommended * 7
    });
  }
  return { platforms: result, totalWeekly: totalRecommended * 7, weeklyCapacity, burnoutRisk: (totalRecommended * 7) > weeklyCapacity };
}

function setCapacity(projectDir, weekly) {
  const fp = path.join(projectDir || process.cwd(), 'allie.json');
  let cfg = getConfig(projectDir);
  cfg.weeklyCapacity = weekly;
  fs.writeFileSync(fp, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
  return { weeklyCapacity: weekly };
}

function setPlatforms(projectDir, platforms) {
  const fp = path.join(projectDir || process.cwd(), 'allie.json');
  let cfg = getConfig(projectDir);
  cfg.platforms = platforms;
  fs.writeFileSync(fp, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
  return { platforms };
}

function schedule(projectDir, date) {
  const recs = recommend(projectDir);
  const d = date ? new Date(date) : new Date();
  const dayOfWeek = d.getDay();
  const weekDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const slots = [];
  for (const p of recs.platforms) {
    const daily = Math.ceil(p.recommended / 7);
    for (let i = 0; i < daily; i++) {
      const peak = p.peak[i % p.peak.length] || p.peak[0];
      slots.push({ platform: p.label, time: peak, date: d.toISOString().split('T')[0], day: weekDays[dayOfWeek] });
    }
  }
  return { date: d.toISOString().split('T')[0], day: weekDays[dayOfWeek], slots };
}

module.exports = { recommend, setCapacity, setPlatforms, schedule, PLATFORM_DEFAULTS };
