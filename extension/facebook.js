// LeadFlow AI - Facebook Content Script
// Runs on facebook.com, performs search/add friend/DM actions

let executing = false;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'EXECUTE_TASK' && !executing) {
    executing = true;
    runFacebookTask(msg.task).finally(() => { executing = false; });
  }
  if (msg.type === 'GET_FACEBOOK_COOKIES') {
    sendResponse({ cookies: document.cookie });
  }
});

async function runFacebookTask(task) {
  console.log('[LeadFlow] Executing Facebook task:', task);

  // Step 1: Search for users by keyword
  const keywords = task.keywords || task.topic;
  const searchUrl = `https://www.facebook.com/search/people/?q=${encodeURIComponent(keywords)}`;

  // Navigate to search
  window.location.href = searchUrl;
  await sleep(5000);

  // Step 2: Collect user profiles from search results
  const profiles = collectFacebookProfiles();
  console.log('[LeadFlow] Found profiles:', profiles.length);

  // Step 3: For each profile, try to add friend / send message
  for (const profile of profiles.slice(0, task.maxTargets || 10)) {
    try {
      await visitAndInteract(profile.url, task);
      await sleep(randomInterval());
    } catch (e) {
      console.log('[LeadFlow] Error on profile:', e);
    }
  }

  // Report results
  chrome.runtime.sendMessage({
    type: 'REPORT_RESULT',
    data: {
      platform: 'facebook',
      taskId: task.id,
      leads: profiles,
      completedAt: new Date().toISOString(),
    },
  });
}

function collectFacebookProfiles() {
  const links = document.querySelectorAll('a[href*="/people/"], a[href*="facebook.com/"]');
  const profiles = [];
  const seen = new Set();
  for (const link of links) {
    const href = link.href;
    if (href && !seen.has(href) && !href.includes('profile.php') === false) {
      seen.add(href);
      profiles.push({
        url: href,
        name: link.textContent?.trim() || 'Unknown',
      });
    }
  }
  return profiles.slice(0, 20);
}

async function visitAndInteract(profileUrl, task) {
  window.location.href = profileUrl;
  await sleep(4000);

  // Try to add friend
  const addBtn = findButton(['Add friend', 'Add Friend', '添加好友']);
  if (addBtn) {
    addBtn.click();
    console.log('[LeadFlow] Friend request sent to', profileUrl);
    await sleep(2000);
  }

  // Try to send DM
  const messageBtn = findButton(['Message', 'Send Message', '发消息']);
  if (messageBtn) {
    messageBtn.click();
    await sleep(2000);
    // Find message input and type
    const msgInput = document.querySelector('div[contenteditable="true"][role="textbox"]');
    if (msgInput) {
      msgInput.focus();
      msgInput.textContent = task.dmTemplate || 'Hi! Loved your post. Would love to connect.';
      await sleep(500);
      // Find send button
      const sendBtn = findButton(['Send', '发送']);
      if (sendBtn) sendBtn.click();
    }
  }
}

function findButton(texts) {
  const buttons = document.querySelectorAll('div[role="button"], button, a[role="button"]');
  for (const btn of buttons) {
    const text = btn.textContent?.trim();
    if (texts.some(t => text === t || text.startsWith(t))) return btn;
  }
  return null;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function randomInterval() {
  return 15000 + Math.random() * 30000; // 15-45 seconds
}
