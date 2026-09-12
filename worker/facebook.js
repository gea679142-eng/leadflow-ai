/**
 * LeadFlow AI - Facebook Worker
 * Full automation: Search → Add Friend → Wait → DM
 *
 * Usage:
 *   node facebook.js search "keywords"     - Search people on Facebook
 *   node facebook.js addfriend <profileUrl>  - Send friend request
 *   node facebook.js dm <profileUrl> "msg"   - Send DM
 *   node facebook.js auto "keywords" "msg"   - Full auto: search + add friend
 */
import { chromium } from 'playwright';
import path from 'path';
import os from 'os';

const HUMAN_DELAY_MIN = 2000;
const HUMAN_DELAY_MAX = 5000;

function humanDelay() {
  const delay = Math.floor(Math.random() * (HUMAN_DELAY_MAX - HUMAN_DELAY_MIN)) + HUMAN_DELAY_MIN;
  return new Promise(r => setTimeout(r, delay));
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

async function searchPeople(page, keywords) {
  console.log(`\n=== Searching: "${keywords}" ===`);
  await page.goto(`https://www.facebook.com/search/people/?q=${encodeURIComponent(keywords)}`);
  await humanDelay();

  const leads = await page.evaluate(() => {
    const results = [];
    const links = document.querySelectorAll('a[href*="/"]');
    const seen = new Set();
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      const text = link.textContent?.trim();
      if (href.match(/^https:\/\/www\.facebook\.com\/[a-zA-Z0-9.]+/) && text && text.length > 2 && !seen.has(href)) {
        seen.add(href);
        results.push({ name: text, url: href });
      }
    });
    return results.slice(0, 20);
  });

  console.log(`Found ${leads.length} users:`);
  leads.forEach((l, i) => console.log(`  ${i+1}. ${l.name} - ${l.url}`));
  return leads;
}

async function sendFriendRequest(page, profileUrl) {
  console.log(`\n--- Friend request: ${profileUrl} ---`);
  await page.goto(profileUrl);
  await humanDelay();

  // Look for "Add friend" button
  const addBtn = page.locator('div[role="button"]:has-text("加为好友"), div[role="button"]:has-text("Add friend"), div[role="button"]:has-text("Add Friend")').first();
  if (await addBtn.isVisible({ timeout: 5000 })) {
    await addBtn.click();
    await humanDelay();
    console.log('✅ Friend request sent!');
    return { success: true, action: 'friend_request_sent' };
  }

  // Check if already pending
  const pending = page.locator('div[role="button"]:has-text("取消请求"), div[role="button"]:has-text("Cancel")').first();
  if (await pending.isVisible({ timeout: 2000 })) {
    console.log('⏳ Already pending');
    return { success: true, action: 'already_pending' };
  }

  console.log('❌ Add friend button not found');
  return { success: false, error: 'No add friend button' };
}

async function sendDM(page, profileUrl, message) {
  console.log(`\n--- DM to: ${profileUrl} ---`);
  await page.goto(`https://www.facebook.com/messages/t/${profileUrl.split('/').pop()}`);
  await humanDelay();

  // Click continue if needed
  const continueBtn = page.locator('div[role="button"]:has-text("继续"), div[role="button"]:has-text("Continue")').first();
  if (await continueBtn.isVisible({ timeout: 3000 })) {
    await continueBtn.click();
    await humanDelay();
  }

  // Check for stranger limit
  const body = await page.textContent('body');
  if (body.includes('陌生消息') || body.includes('limit')) {
    console.log('⚠️ Stranger message limit reached');
    return { success: false, error: 'stranger_limit' };
  }

  // Type message
  const input = page.locator('div[contenteditable="true"][role="textbox"]').last();
  await input.click();
  await humanDelay();
  await input.fill(message);
  await humanDelay();
  await page.keyboard.press('Enter');
  await humanDelay();

  console.log('✅ DM sent!');
  return { success: true, action: 'dm_sent' };
}

async function autoFlow(keywords, dmMessage) {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  // Step 1: Search
  const leads = await searchPeople(page, keywords);

  // Step 2: Send friend requests to top leads
  for (const lead of leads.slice(0, 5)) {
    await sendFriendRequest(page, lead.url);
    await humanDelay();
  }

  console.log('\n=== Auto flow complete ===');
  console.log('Friend requests sent. Wait for acceptance, then run DM.');
  await browser.close();
}

// Main
const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'search') {
  const browser = await launchBrowser();
  const page = await browser.newPage();
  await searchPeople(page, args[0] || 'fitness coach');
  await browser.close();
} else if (cmd === 'addfriend') {
  const browser = await launchBrowser();
  const page = await browser.newPage();
  await sendFriendRequest(page, args[0]);
  await browser.close();
} else if (cmd === 'dm') {
  const browser = await launchBrowser();
  const page = await browser.newPage();
  await sendDM(page, args[0], args[1] || 'Hi! Great to connect.');
  await browser.close();
} else if (cmd === 'auto') {
  await autoFlow(args[0] || 'saas founder', args[1] || 'Hi! Great to connect.');
} else {
  console.log('Usage: node facebook.js [search|addfriend|dm|auto]');
}
