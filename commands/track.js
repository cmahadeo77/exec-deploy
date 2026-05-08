'use strict';

const chalk   = require('chalk');
const { getAll, updateStatus } = require('../lib/tracker');

function trackCommand(options) {
  const apps = getAll();

  if (apps.length === 0) {
    console.log(chalk.yellow('\nNo applications tracked yet. Run: node index.js search\n'));
    return;
  }

  const tierColors = { A: chalk.green, B: chalk.yellow, C: chalk.gray };
  const statusColors = {
    'identified': chalk.dim,
    'applied':    chalk.cyan,
    'interviewing': chalk.green,
    'offer':      chalk.bold.green,
    'declined':   chalk.red,
    'passed':     chalk.gray
  };

  // Group by tier
  const tiers = { A: [], B: [], C: [] };
  for (const app of apps) {
    (tiers[app.tier] || tiers.C).push(app);
  }

  console.log(chalk.bold('\n📋  Application Pipeline\n'));
  console.log(chalk.bold('─'.repeat(70)));

  for (const [tier, list] of Object.entries(tiers)) {
    if (!list.length) continue;
    const color = tierColors[tier];
    console.log(color(`\nTier ${tier} (${list.length})`));
    for (const app of list) {
      const sColor = statusColors[app.status] || chalk.white;
      console.log(`  ${color('●')} ${app.title}  ·  ${chalk.dim(app.company)}`);
      console.log(`    ${sColor(app.status.toUpperCase())}  score:${app.score}  ${chalk.blue(app.url || '')}`);
      if (app.notes) console.log(chalk.dim(`    note: ${app.notes}`));
    }
  }

  console.log('\n' + chalk.bold('─'.repeat(70)));
  console.log(chalk.dim(`\nTo update a role status: node index.js track --update <id> --status applied\n`));
}

module.exports = { trackCommand };
