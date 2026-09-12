/**
 * LeadFlow AI - Facebook Worker
 * Uses Playwright with the user's Chrome profile (already logged into Facebook)
 * to search for users matching keywords and send DMs.
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import os from 'os';

const WEBSITE_URL = 'https://leadflow-ai-z2rf.onrender.com';
const STATE_FILE = path.join(os.homedir(), '.leadflow-fb-state.json');

// Safe delays (ms)
const HUMAN_DELAY_MIN = 2000;
const HUMAN_DELAY_MAX = 5000;

function humanDelay() {
  const delay = Math.floor(Math.random() * (HUMAN_DELAY_MAX - HUMAN_DELAY_MIN)) + HUMAN_DELAY_MIN;
  return new Promise(r => setTimeout(r, delay));
}

async function launchBrowser() {
  // Use the user's Chrome profile where Facebook is already logged in
  const userDataDir = path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data');
  
  console.log('Launching Chrome with user profile...');
  console.log('Profile dir:', userDataDir);
  
  const browser = await chromium.launchPersistentContext(userDataDir, {
    headless: false, // Show browser so user can see
    channel: 'chrome',
    viewport: { width: 1280, height: 800 },
    args: ['--disable-blink-features=AutomationControlled'],
  });
  
  return browser;
}

async function searchFacebookUsers(page, keywords) {
  console.log(`\n=== Searching Facebook for: "${keywords}" ===`);
  
  // Go to Facebook search
  await page.goto('https://www.facebook.com/search/people/?q=' + encodeURIComponent(keywords));
  await humanDelay();
  
  // Extract user profiles from search results
  const leads = await page.evaluate(() => {
    const results = [];
    // Facebook search results - user profile links
    const links = document.querySelectorAll('a[href*="/people/"], a[href*="?id="][role="link"]');
    const seen = new Set();
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      const text = link.textContent?.trim();
      if (href && text && text.length > 2 && !seen.has(href)) {
        seen.add(href);
        results.push({
          username: text,
          profileUrl: href.startsWith('http') ? href : 'https://www.facebook.com' + href,
          source: 'facebook_search',
        });
      }
    });
    
    return results.slice(0, 20); // Limit to 20 per search
  });
  
  console.log(`Found ${leads.length} potential users`);
  return leads;
}

async function sendFacebookDM(page, profileUrl, message) {
  console.log(`\n--- Sending DM to: ${profileUrl} ---`);
  
  try {
    // Navigate to the user's profile
    await page.goto(profileUrl);
    await humanDelay();
    
    // Look for Message button
    const messageButton = await page.locator('div[role="button"]:has-text("Message")').first();
    if (await messageButton.isVisible({ timeout: 5000 })) {
      await messageButton.click();
      await humanDelay();
      
      // Find message input
      const messageInput = await page.locator('div[contenteditable="true"][role="textbox"]').last();
      await messageInput.click();
      await humanDelay();
      
      // Type the message
      await messageInput.fill(message);
      await humanDelay();
      
      // Press Enter to send
      await page.keyboard.press('Enter');
      await humanDelay();
      
      console.log('✅ DM sent successfully!');
      return { success: true };
    } else {
      console.log('❌ Message button not found');
      return { success: false, error: 'No message button' };
    }
  } catch (err) {
    console.log('❌ Error sending DM:', err.message);
    return { success: false, error: err.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'test';
  
  if (command === 'search') {
    const keywords = args[1] || 'fitness coach';
    const browser = await launchBrowser();
    const page = await browser.newPage();
    
    const leads = await searchFacebookUsers(page, keywords);
    console.log('\n=== RESULTS ===');
    leads.forEach((lead, i) => {
      console.log(`${i+1}. ${lead.username} - ${lead.profileUrl}`);
    });
    
    await browser.close();
  } else if (command === 'dm') {
    const profileUrl = args[1];
    const message = args[2] || 'Hi! I noticed your profile and wanted to connect.';
    const browser = await launchBrowser();
    const page = await browser.newPage();
    
    const result = await sendFacebookDM(page, profileUrl, message);
    console.log('Result:', result);
    
    await browser.close();
  } else if (command === 'test') {
    console.log('=== LeadFlow Facebook Worker Test ===');
    console.log('Commands:');
    console.log('  node facebook.js search "keywords"  - Search Facebook users');
    console.log('  node facebook.js dm <profileUrl> "message"  - Send DM to user');
    console.log('');
    
    // Quick test - just open Facebook
    const browser = await launchBrowser();
    const page = await browser.newPage();
    await page.goto('https://www.facebook.com');
    await humanDelay();
    console.log('Facebook page loaded. Title:', await page.title());
    console.log('Browser is open. Press Ctrl+C to close.');
    
    // Keep browser open for testing
    await new Promise(() => {});
  }
}

main().catch(console.error);
