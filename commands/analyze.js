'use strict';

const chalk = require('chalk');
const ora   = require('ora');
const { resume }      = require('../lib/resume');
const { analyzeFit }  = require('../lib/claude');
const { scrapeUrl }   = require('../lib/sourcer');
const fs = require('fs');

async function analyzeCommand(options) {
  if (!options.url && !options.jd) {
    console.log(chalk.red('\nProvide --url <job-url> or --jd <file>\n'));
    process.exit(1);
  }

  let jdText = '';
  let roleTitle = options.title || 'Role';
  let company   = options.company || 'Company';

  if (options.url) {
    const spinner = ora('Fetching JD...').start();
    try {
      const scraped = await scrapeUrl(options.url);
      jdText    = scraped.description;
      roleTitle = scraped.title || roleTitle;
      spinner.succeed('JD loaded');
    } catch (err) { spinner.fail(err.message); process.exit(1); }
  } else {
    jdText = fs.readFileSync(options.jd, 'utf8');
  }

  const spinner = ora('Running fit analysis...').start();
  try {
    const result = await analyzeFit(resume, jdText, roleTitle, company);
    spinner.succeed('Analysis complete');

    const tierColor = { A: chalk.green, B: chalk.yellow, C: chalk.red }[result.tier] || chalk.white;

    console.log(chalk.bold(`\n${roleTitle}  ·  ${company}`));
    console.log(tierColor(`Tier ${result.tier}  —  Score: ${result.score}/100\n`));

    console.log(chalk.bold('Strengths:'));
    (result.strengths || []).forEach(s => console.log(chalk.green(`  ✓ ${s}`)));

    console.log(chalk.bold('\nGaps:'));
    (result.gaps || []).forEach(g => console.log(chalk.yellow(`  ⚠  ${g}`)));

    console.log(chalk.bold('\nHow to position:'));
    console.log(`  ${result.positioning}`);

    const rec = result.shouldApply ? chalk.green('YES — apply') : chalk.red('LOW PRIORITY — skip or deprioritize');
    console.log(chalk.bold(`\nRecommendation: ${rec}\n`));

  } catch (err) {
    spinner.fail('Analysis failed: ' + err.message);
    process.exit(1);
  }
}

module.exports = { analyzeCommand };
