'use strict';

const chalk  = require('chalk');
const ora    = require('ora');
const { searchAll, scrapeUrl } = require('../lib/sourcer');
const { scoreRole }            = require('../lib/scorer');
const { addApplication }       = require('../lib/tracker');

async function searchCommand(options) {
  console.log(chalk.bold('\n🔍  Scanning opportunities...\n'));

  const spinner = ora('Fetching roles from job boards...').start();

  let roles = [];

  // If URL passed, scrape it directly
  if (options.url) {
    spinner.text = `Scraping ${options.url}...`;
    try {
      const role = await scrapeUrl(options.url);
      roles = [role];
    } catch (err) {
      spinner.fail(err.message);
      return;
    }
  } else {
    try {
      roles = await searchAll(options.query, {
        location: options.location,
        limit: parseInt(options.limit) || 10
      });
    } catch (err) {
      spinner.fail('Search failed: ' + err.message);
      return;
    }
  }

  spinner.succeed(`Found ${roles.length} roles — scoring...`);

  if (roles.length === 0) {
    console.log(chalk.yellow('\nNo results. Try with --query "payments partnerships" or check your Adzuna API keys.\n'));
    return;
  }

  // Score all roles
  const scored = roles.map(role => {
    const { score, tier, topSignals } = scoreRole(role);
    return { ...role, score, tier, topSignals };
  }).sort((a, b) => b.score - a.score);

  // Display results
  console.log('\n' + chalk.bold('─'.repeat(70)));

  const tierColors = { A: chalk.green, B: chalk.yellow, C: chalk.gray };

  for (const role of scored) {
    const color = tierColors[role.tier] || chalk.white;
    console.log(color(`\n[${role.tier}] ${role.score}/100  ${role.title}`));
    console.log(chalk.dim(`     ${role.company}  ·  ${role.location}`));
    if (role.topSignals?.length) {
      console.log(chalk.dim(`     ↳ matched: ${role.topSignals.join(', ')}`));
    }
    if (role.url) console.log(chalk.blue(`     ${role.url}`));
  }

  console.log('\n' + chalk.bold('─'.repeat(70)));

  // Save Tier A + B to tracker
  const saved = scored.filter(r => r.tier !== 'C');
  for (const r of saved) {
    addApplication(r, r.score, r.tier);
  }

  console.log(chalk.dim(`\n${saved.length} Tier A/B roles saved to tracker. Run: node index.js track\n`));
}

module.exports = { searchCommand };
