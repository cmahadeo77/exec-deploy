'use strict';

const Anthropic = require('@anthropic-ai/sdk');

let client;

function getClient() {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not set. Run: export ANTHROPIC_API_KEY=sk-ant-...');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

async function tailorResume(resume, jobDescription, roleTitle, company) {
  const anthropic = getClient();
  
  const prompt = `You are a senior payments executive resume writer. 

MASTER RESUME:
${JSON.stringify(resume, null, 2)}

TARGET ROLE: ${roleTitle} at ${company}

JOB DESCRIPTION:
${jobDescription}

TASK: Tailor this resume for the target role. Rules:
1. Only use facts that exist in the master resume — no embellishment
2. Reorder bullets to surface most relevant experience first
3. Mirror the JD's language where authentic (e.g., if JD says "commercialize partnerships" and resume shows that experience, use that framing)
4. Keep the same structure (summary, experience, skills)
5. Flag any gaps honestly in a GAPS section at the end

Return as JSON with keys: summary, experience (array with company/title/years/bullets), skills (array), gaps (array of strings).
Return ONLY valid JSON, no markdown, no preamble.`;

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = response.content[0].text.replace(/```json|```/g, '').trim();
  return JSON.parse(text);
}

async function analyzeFit(resume, jobDescription, roleTitle, company) {
  const anthropic = getClient();

  const prompt = `You are a senior payments recruiter and executive coach.

CANDIDATE PROFILE:
${JSON.stringify(resume, null, 2)}

TARGET ROLE: ${roleTitle} at ${company}
JOB DESCRIPTION: ${jobDescription}

Analyze fit. Return JSON with:
- score: 0-100
- tier: "A", "B", or "C"  
- strengths: array of 3-5 specific strengths (be specific, reference actual resume content)
- gaps: array of real gaps (be honest)
- positioning: 2 sentence pitch for how Chris should position himself for this role
- shouldApply: boolean

Return ONLY valid JSON.`;

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = response.content[0].text.replace(/```json|```/g, '').trim();
  return JSON.parse(text);
}

module.exports = { tailorResume, analyzeFit };
