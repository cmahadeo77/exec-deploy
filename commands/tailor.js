'use strict';

const fs    = require('fs');
const path  = require('path');
const chalk = require('chalk');
const ora   = require('ora');
const { resume }        = require('../lib/resume');
const { tailorResume }  = require('../lib/claude');
const { scrapeUrl }     = require('../lib/sourcer');

// docx generation
async function generateDocx(tailored, roleTitle, company) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

  const heading = (text, level) => new Paragraph({
    heading: level,
    children: [new TextRun({ text, bold: true })]
  });

  const bullet = (text) => new Paragraph({
    bullet: { level: 0 },
    children: [new TextRun({ text, size: 20 })]
  });

  const children = [];

  // Header
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: resume.name, bold: true, size: 28 })]
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({
      text: `${resume.contact.email}  ·  ${resume.contact.location}  ·  ${resume.contact.github}`,
      size: 18, color: '666666'
    })]
  }));
  children.push(new Paragraph({ children: [] }));

  // Summary
  children.push(heading('Summary', HeadingLevel.HEADING_2));
  children.push(new Paragraph({ children: [new TextRun({ text: tailored.summary, size: 20 })] }));
  children.push(new Paragraph({ children: [] }));

  // Experience
  children.push(heading('Experience', HeadingLevel.HEADING_2));
  for (const job of tailored.experience) {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: `${job.title}  ·  ${job.company}`, bold: true, size: 22 }),
        new TextRun({ text: `   ${job.years}`, size: 20, color: '888888' })
      ]
    }));
    for (const b of job.bullets) children.push(bullet(b));
    children.push(new Paragraph({ children: [] }));
  }

  // Skills
  children.push(heading('Core Competencies', HeadingLevel.HEADING_2));
  children.push(new Paragraph({
    children: [new TextRun({ text: tailored.skills.join('  ·  '), size: 18 })]
  }));

  // Gaps note (internal only — comment in doc)
  if (tailored.gaps?.length) {
    children.push(new Paragraph({ children: [] }));
    children.push(heading('Tailoring Notes (Remove Before Sending)', HeadingLevel.HEADING_3));
    for (const g of tailored.gaps) children.push(bullet(`Gap: ${g}`));
  }

  const doc = new Document({ sections: [{ children }] });
  const slug = `${company.replace(/\s+/g, '_')}_${roleTitle.replace(/\s+/g, '_').slice(0, 30)}`;
  const outPath = path.join(process.cwd(), `resume_${slug}.docx`);
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);
  return outPath;
}

async function tailorCommand(options) {
  if (!options.url && !options.jd) {
    console.log(chalk.red('\nProvide a job URL (--url) or JD text file (--jd <file>)\n'));
    process.exit(1);
  }

  let jdText = '';
  let roleTitle = options.title || 'Target Role';
  let company   = options.company || 'Target Company';

  if (options.url) {
    const spinner = ora(`Fetching JD from ${options.url}...`).start();
    try {
      const scraped = await scrapeUrl(options.url);
      jdText    = scraped.description;
      roleTitle = scraped.title || roleTitle;
      spinner.succeed('JD fetched');
    } catch (err) {
      spinner.fail(err.message); process.exit(1);
    }
  } else {
    jdText = fs.readFileSync(options.jd, 'utf8');
  }

  const spinner = ora('Claude is tailoring your resume...').start();
  try {
    const tailored = await tailorResume(resume, jdText, roleTitle, company);
    spinner.succeed('Resume tailored');

    const docxSpinner = ora('Generating .docx...').start();
    const outPath = await generateDocx(tailored, roleTitle, company);
    docxSpinner.succeed(`Saved: ${chalk.green(outPath)}`);

    if (tailored.gaps?.length) {
      console.log(chalk.yellow('\n⚠  Gaps flagged (review before sending):'));
      tailored.gaps.forEach(g => console.log(chalk.dim(`   • ${g}`)));
    }

    console.log(chalk.bold('\n✓ Open the .docx, remove the Tailoring Notes section, and apply.\n'));
  } catch (err) {
    spinner.fail('Tailoring failed: ' + err.message);
    process.exit(1);
  }
}

module.exports = { tailorCommand };
