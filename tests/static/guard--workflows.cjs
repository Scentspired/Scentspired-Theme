#!/usr/bin/env node

/**
 * ============================================================================
 * GUARD — every GitHub Actions workflow parses and has the shape Actions needs
 * ============================================================================
 *
 * A workflow file GitHub cannot read does not fail a check in a way that stops
 * anything: the run dies in 0 seconds as "a workflow file issue", and the gate
 * it was supposed to run never runs. That happened when a one-line `run:` held
 * ": " inside an unquoted value, which YAML reads as a new key.
 *
 * Parses each .github/workflows/*.yml with the `yaml` library (strict: duplicate
 * keys are errors), then checks what Actions requires: `on` and `jobs`; each job
 * has `runs-on` and `steps`; each step has `run` or `uses`, never both.
 *
 *   node tests/static/guard--workflows.cjs [--dir=<workflows dir>]
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const arg = process.argv.find((a) => a.startsWith('--dir='));
const DIR = arg ? path.resolve(arg.slice(6)) : path.resolve(__dirname, '..', '..', '.github', 'workflows');

const problems = [];
const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => /\.ya?ml$/.test(f)).sort() : [];
for (const f of files) {
  const doc = YAML.parseDocument(fs.readFileSync(path.join(DIR, f), 'utf8'), { uniqueKeys: true, prettyErrors: true });
  if (doc.errors.length) {
    for (const e of doc.errors) problems.push(`${f}: ${e.message.split('\n')[0]}`);
    continue;
  }
  const w = doc.toJS();
  if (!w || typeof w !== 'object') { problems.push(`${f}: not a mapping`); continue; }
  // YAML 1.1 readers turn a bare `on` key into true; the yaml library keeps it a string
  if (!('on' in w) && !(true in w)) problems.push(`${f}: no "on" (what starts the workflow)`);
  if (!w.jobs || typeof w.jobs !== 'object') { problems.push(`${f}: no "jobs"`); continue; }
  for (const [id, job] of Object.entries(w.jobs)) {
    if (!job || typeof job !== 'object') { problems.push(`${f}: job ${id} is empty`); continue; }
    if (job.uses) continue; // a reusable workflow call has no steps of its own
    if (!job['runs-on']) problems.push(`${f}: job ${id} has no runs-on`);
    if (!Array.isArray(job.steps) || !job.steps.length) { problems.push(`${f}: job ${id} has no steps`); continue; }
    job.steps.forEach((s, i) => {
      const name = `${f}: job ${id} step ${i + 1}${s && s.name ? ` (${s.name})` : ''}`;
      if (!s || typeof s !== 'object') return problems.push(`${name} is empty`);
      if (!s.run && !s.uses) problems.push(`${name} has neither run nor uses`);
      if (s.run && s.uses) problems.push(`${name} has both run and uses`);
      if (s.run !== undefined && typeof s.run !== 'string') problems.push(`${name}: run is not text`);
    });
  }
}

if (!files.length) problems.push(`no workflow files in ${DIR}`);
if (problems.length) {
  console.error(`\n❌ ${problems.length} workflow problem(s):\n`);
  problems.forEach((p) => console.error('   ' + p));
  console.error('');
  process.exit(1);
}
console.log(`  ✅ ${files.length} workflow file(s) parse and have jobs, runners and steps.`);
