'use strict';

const axios = require('axios');

const DEFAULT_QUERIES = [
  'payments partnerships director',
  'fintech ecosystem partnerships',
  'visa mastercard payments strategy',
  'payment network business development',
  'embedded finance partnerships',
  'stablecoin payments consulting',
  'payments independent contractor'
];

async function searchAdzuna(query, options = {}) {
  const appId  = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.warn('⚠  ADZUNA_APP_ID/ADZUNA_APP_KEY not set — skipping Adzuna search');
    return [];
  }

  const params = {
    app_id: appId,
    app_key: appKey,
    results_per_page: options.limit || 10,
    what: query,
    where: options.location || 'united states',
    content_type: 'application/json'
  };

  try {
    const res = await axios.get('https://api.adzuna.com/v1/api/jobs/us/search/1', { params, timeout: 8000 });
    return (res.data.results || []).map(job => ({
      id: job.id,
      title: job.title,
      company: job.company?.display_name || 'Unknown',
      location: job.location?.display_name || '',
      description: job.description || '',
      url: job.redirect_url || '',
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      created: job.created,
      source: 'adzuna'
    }));
  } catch (err) {
    console.warn(`Adzuna search failed for "${query}":`, err.message);
    return [];
  }
}

async function scrapeUrl(url) {
  const cheerio = require('cheerio');
  try {
    const res = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; exec-deploy/1.0)' }
    });
    const $ = cheerio.load(res.data);
    // Extract basic text — sites vary wildly so we grab everything
    const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 3000);
    const title = $('title').text() || $('h1').first().text() || '';
    return { title, description: text, url, source: 'manual' };
  } catch (err) {
    throw new Error(`Could not fetch ${url}: ${err.message}`);
  }
}

async function searchAll(customQuery, options = {}) {
  const queries = customQuery ? [customQuery] : DEFAULT_QUERIES;
  const allResults = [];
  const seen = new Set();

  for (const query of queries) {
    const results = await searchAdzuna(query, options);
    for (const r of results) {
      if (!seen.has(r.id || r.url)) {
        seen.add(r.id || r.url);
        allResults.push(r);
      }
    }
  }

  return allResults;
}

module.exports = { searchAll, scrapeUrl };
