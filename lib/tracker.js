'use strict';

const fs   = require('fs');
const path = require('path');

const STORE = path.join(__dirname, '../logs/applications.json');

function load() {
  if (!fs.existsSync(STORE)) return [];
  try { return JSON.parse(fs.readFileSync(STORE, 'utf8')); }
  catch { return []; }
}

function save(data) {
  fs.writeFileSync(STORE, JSON.stringify(data, null, 2));
}

function addApplication(role, score, tier) {
  const apps = load();
  const existing = apps.find(a => a.url === role.url);
  if (existing) return existing;

  const entry = {
    id: Date.now().toString(),
    title: role.title,
    company: role.company,
    url: role.url,
    score,
    tier,
    status: 'identified',
    appliedAt: null,
    notes: '',
    followUpDate: null,
    addedAt: new Date().toISOString()
  };
  apps.push(entry);
  save(apps);
  return entry;
}

function updateStatus(id, status, notes) {
  const apps = load();
  const app = apps.find(a => a.id === id);
  if (!app) return null;
  app.status = status;
  if (notes) app.notes = notes;
  if (status === 'applied') app.appliedAt = new Date().toISOString();
  save(apps);
  return app;
}

function getAll() { return load(); }

module.exports = { addApplication, updateStatus, getAll };
