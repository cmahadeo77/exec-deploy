#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const chalk = require('chalk');
const { version } = require('./package.json');

const { searchCommand }    = require('./commands/search');
const { tailorCommand }    = require('./commands/tailor');
const { analyzeCommand }   = require('./commands/analyze');
const { trackCommand }     = require('./commands/track');
const { respondCommand }   = require('./commands/respond');
const { dashboardCommand } = require('./commands/dashboard');
const { pushCommand }      = require('./commands/push');

console.log(`
${chalk.bold.white('exec-deploy')} v${version}
${chalk.dim('resume optimizer & opportunity distribution · contract & FTE')}
`);

program
  .name('exec-deploy')
  .version(version)
  .description('AI-powered resume optimization and opportunity distribution for payments & fintech executives');

program
  .command('search')
  .description('Find and score live roles from job boards (contract + FTE)')
  .option('-q, --query <text>', 'Custom search query')
  .option('-u, --url <url>',    'Scrape and score a specific job URL')
  .option('-l, --limit <n>',    'Max results per query', '10')
  .option('--location <place>', 'Location filter', 'united states')
  .action(searchCommand);

program
  .command('tailor')
  .description('Tailor your resume to a specific role — outputs .docx')
  .option('-u, --url <url>',      'Job posting URL')
  .option('--jd <file>',          'Path to JD text file')
  .option('--title <text>',       'Role title override')
  .option('--company <text>',     'Company name override')
  .action(tailorCommand);

program
  .command('analyze')
  .description('Deep fit analysis for a specific role (no resume generated)')
  .option('-u, --url <url>',      'Job posting URL')
  .option('--jd <file>',          'Path to JD text file')
  .option('--title <text>',       'Role title override')
  .option('--company <text>',     'Company name override')
  .action(analyzeCommand);

program
  .command('track')
  .description('View and manage your application pipeline')
  .option('--update <id>',        'Application ID to update')
  .option('--status <status>',    'New status (applied/interviewing/offer/passed)')
  .option('--note <text>',        'Add a note')
  .action(trackCommand);

program
  .command('respond')
  .description('Log an outcome to recalibrate role scoring')
  .action(respondCommand);

program
  .command('dashboard')
  .description('Generate HTML pipeline dashboard')
  .action(dashboardCommand);

program
  .command('push')
  .description('Distribute applications via platform integrations')
  .action(pushCommand);

program.parse(process.argv);
