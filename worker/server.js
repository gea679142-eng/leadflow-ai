/**
 * LeadFlow AI - Local Worker
 * Connects to the cloud website, polls for tasks, executes them with real browser automation.
 *
 * Usage:
 *   node server.js
 * Then enter your website URL and JWT token when prompted.
 */
import { chromium } from 'playwright';
import path from 'path';
import os from 'os';
import readline from 'readline';

const SERVER_URL = 'https://leadflow-ai-z2rf.onrender.com';
let AUTH_TOKEN = '';

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

async function api(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${SERVER_URL}/api/worker/poll`, opts);
  return res.json();
}

function humanDelay(min = 2000, max = 5000) {
  return new Promise(r => setTimeout(r, Math.random() * (max - min) + min));
}

async function launchBrowser() {
  const userDataDir = path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data');
  console.log('Launching Chrome...');
  return chromium.launchPersistentContext(userDataDir, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1280, height: 800 },
    args: ['--disable-blink-features=AutomationControlled'],
  });
}

async function searchFacebook(page, keywords) {
  console.log(`Searching Facebook: "${keywords}"`);
  await page.goto(`https://www.facebook.com/search/people/?q=${encodeURIComponent(keywords.split('\n')[0])}`);
  await humanDelay(3000, 5000);

  const leads = await page.evaluate(() => {
    const results = [];
    const seen = new Set();
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href') || '';
      const text = a.textContent?.trim();
      if (href.match(/^https:\/\/www\.facebook\.com\/[a-zA-Z0-9._-]+/) &&
          text && text.length > 2 && text.length < 50 && !seen.has(href)) {
        seen.add(href);
        results.push({ username: text, profileUrl: href, bio: '' });
      }
    });
    return results.slice(0, 15);
  });

  console.log(`Found ${leads.length} potential leads`);
  return leads;
}

async function sendFriendRequest(page, profileUrl) {
  await page.goto(profileUrl);
  await humanDelay(2000, 4000);
  const addBtn = page.locator('div[role="button"]:has-text("加为好友"), div[role="button"]:has-text("Add friend"), div[role="button"]:has-text("Add Friend")').first();
  if (await addBtn.isVisible({ timeout: 5000 })) {
    await addBtn.click();
    await humanDelay(2000, 3000);
    return 'friend_requested';
  }
  return 'skipped';
}

async function processTask(task, page) {
  console.log(`\n=== Processing task: ${task.name} ===`);
  console.log(`Keywords: ${task.optimizedKeywords || task.keywords}`);

  const allLeads = [];
  const platforms = task.platforms || ['facebook'];

  for (const platform of platforms) {
    if (platform === 'facebook') {
      const leads = await searchFacebook(page, task.optimizedKeywords || task.keywords);
      for (const lead of leads) {
        allLeads.push({ ...lead, platform: 'facebook' });
      }
    }
  }

  // Report leads to server
  if (allLeads.length > 0) {
    console.log(`Reporting ${allLeads.length} leads to server...`);
    const result = await api('/api/worker/poll', 'POST', {
      taskId: task.id,
      platform: 'facebook',
      foundLeads: allLeads,
    });
    console.log(`Server response: ${result.added} new leads added, ${result.total} total`);
  }

  // Now send friend requests
  for (const lead of allLeads.slice(0, 5)) {
    console.log(`Sending friend request to ${lead.username}...`);
    const status = await sendFriendRequest(page, lead.profileUrl);
    console.log(`  -> ${status}`);
    await humanDelay(3000, 6000);
  }

  console.log('Task complete!');
}

async function main() {
  console.log('=== LeadFlow AI Worker ===');
  console.log(`Server: ${SERVER_URL}`);
  AUTH_TOKEN = await ask('Enter your JWT token (from website browser console: localStorage.getItem("lf_token")): ');
  if (!AUTH_TOKEN) {
    console.log('No token provided. Exiting.');
    return;
  }

  const browser = await launchBrowser();
  const page = await browser.newPage();

  while (true) {
    try {
      const data = await api('/api/worker/poll');
      if (data.tasks && data.tasks.length > 0) {
        for (const task of data.tasks) {
          await processTask(task, page);
        }
      } else {
        console.log('No pending tasks. Waiting 10s...');
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
    await new Promise(r => setTimeout(r, 10000));
  }
}

main().catch(console.error);
