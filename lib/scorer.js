'use strict';

// Domain signal weights — tuned for payments/fintech executive profile
const SIGNALS = {
  // Tier 1 — core differentiators (high weight)
  'visa':                    12,
  'mastercard':              12,
  'dual.network':            15,
  'tokenization':            10,
  'visa direct':             10,
  'real.time':                8,
  'ecosystem':                8,
  'issuer':                   8,
  'processor':                7,
  'stablecoin':              10,
  'b2b.*payment':             9,
  'partnership.*structure':  10,
  'deal.*structure':         10,
  'sow':                      8,
  'embedded.finance':         9,

  // Tier 2 — relevant but common
  'payments':                 5,
  'fintech':                  5,
  'go.to.market':             5,
  'business.case':            5,
  'revenue.*growth':          4,
  'kpi':                      4,
  'cross.functional':         4,
  'partner.*management':      6,
  'network':                  3,
  'digital.wallet':           6,
  'psp':                      6,

  // Tier 3 — nice to have
  'strategy':                 2,
  'product':                  2,
  'enterprise':               2,
  'senior':                   1,
  'director':                 2,
  'vice.president':           2,
  'vp':                       2,

  // Contract/IC signals
  'contract':                 3,
  'independent.*contractor':  3,
  'consulting':               3,
  'fractional':               4,
};

// Location signals
const LOCATION_SIGNALS = {
  'remote':      10,
  'bay.area':    10,
  'san.francisco': 8,
  'california':   6,
  'new.york':     3,
  'hybrid':       5,
};

function scoreRole(role) {
  const text = `${role.title || ''} ${role.description || ''} ${role.company || ''}`.toLowerCase();
  
  let score = 0;
  let matchedSignals = [];

  for (const [pattern, weight] of Object.entries(SIGNALS)) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(text)) {
      score += weight;
      matchedSignals.push({ signal: pattern, weight });
    }
  }

  // Location scoring
  const locationText = (role.location || '').toLowerCase();
  for (const [pattern, weight] of Object.entries(LOCATION_SIGNALS)) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(locationText) || regex.test(text)) {
      score += weight;
    }
  }

  // Normalize to 0-100
  const maxPossible = 120;
  const normalized = Math.min(100, Math.round((score / maxPossible) * 100));

  // Tier assignment
  let tier;
  if (normalized >= 65) tier = 'A';
  else if (normalized >= 40) tier = 'B';
  else tier = 'C';

  // Top 3 signals for display
  const topSignals = matchedSignals
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map(s => s.signal.replace(/\.\*/g, ' ').replace(/\./g, ' '));

  return { score: normalized, tier, topSignals };
}

module.exports = { scoreRole };
