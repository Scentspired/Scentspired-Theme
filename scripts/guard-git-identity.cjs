#!/usr/bin/env node
/**
 * Every commit in this repository is Ahmad Hassan's, and says so alone.
 *
 *   node scripts/guard-git-identity.cjs --commit-msg <file>   commit-msg hook
 *   node scripts/guard-git-identity.cjs --pre-push             pre-push hook (reads git's ref lines)
 *   node scripts/guard-git-identity.cjs --range <a>..<b>       check any range by hand
 *
 * Refused: a commit authored or committed under any other name or email, and a
 * message carrying a co-author or sign-off trailer (Co-Authored-By, Signed-off-by)
 * — tools add those, and a pushed trailer puts another identity in the history.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');

const NAME = 'Ahmad Hassan (B-Ted)';
const EMAIL = 'ahmadhassan.bted@gmail.com';
const TRAILER = /^(co-authored-by|signed-off-by):/im;

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const fail = (lines) => {
  console.error('\n❌ Git identity guard:');
  lines.forEach((l) => console.error(`   ${l}`));
  console.error(`   Every commit here is ${NAME} <${EMAIL}>, with no co-author trailers.\n`);
  process.exit(1);
};

const args = process.argv.slice(2);

if (args[0] === '--commit-msg') {
  const problems = [];
  const who = (kind) => {
    const env = kind === 'author' ? ['GIT_AUTHOR_NAME', 'GIT_AUTHOR_EMAIL'] : ['GIT_COMMITTER_NAME', 'GIT_COMMITTER_EMAIL'];
    const ident = git('var', kind === 'author' ? 'GIT_AUTHOR_IDENT' : 'GIT_COMMITTER_IDENT');
    const m = ident.match(/^(.*) <([^>]*)>/);
    return { name: process.env[env[0]] || (m && m[1]), email: process.env[env[1]] || (m && m[2]) };
  };
  for (const kind of ['author', 'committer']) {
    const { name, email } = who(kind);
    if (email !== EMAIL || name !== NAME) problems.push(`${kind} would be ${name} <${email}>`);
  }
  const message = fs.readFileSync(args[1], 'utf8').split('\n').filter((l) => !l.startsWith('#')).join('\n');
  if (TRAILER.test(message)) problems.push('the message carries a co-author or sign-off trailer');
  if (problems.length) fail(problems);
  process.exit(0);
}

function checkRange(range) {
  const problems = [];
  const out = git('log', '--format=%H%x1f%an%x1f%ae%x1f%cn%x1f%ce%x1f%B%x1e', ...range);
  for (const rec of out.split('\x1e').map((r) => r.trim()).filter(Boolean)) {
    const [sha, an, ae, cn, ce, body] = rec.split('\x1f');
    const short = sha.slice(0, 7);
    if (ae !== EMAIL || an !== NAME) problems.push(`${short} authored by ${an} <${ae}>`);
    if (ce !== EMAIL || cn !== NAME) problems.push(`${short} committed by ${cn} <${ce}>`);
    if (TRAILER.test(body || '')) problems.push(`${short} carries a co-author or sign-off trailer`);
  }
  return problems;
}

if (args[0] === '--pre-push') {
  // git gives one line per ref: <local ref> <local sha> <remote ref> <remote sha>
  const zero = /^0+$/;
  const problems = [];
  for (const line of fs.readFileSync(0, 'utf8').split('\n').filter(Boolean)) {
    const [, localSha, , remoteSha] = line.split(' ');
    if (zero.test(localSha)) continue; // deleting a remote ref pushes no commits
    const range = zero.test(remoteSha) ? [localSha, '--not', '--remotes'] : [`${remoteSha}..${localSha}`];
    problems.push(...checkRange(range));
  }
  if (problems.length) fail(problems);
  process.exit(0);
}

if (args[0] === '--range') {
  const problems = checkRange([args[1]]);
  if (problems.length) fail(problems);
  console.log(`✅ ${args[1]}: every commit is ${NAME} <${EMAIL}>, no trailers.`);
  process.exit(0);
}

console.error('usage: --commit-msg <file> | --pre-push | --range <a>..<b>');
process.exit(2);
