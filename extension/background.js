// LeadFlow AI - Background Service Worker (Manifest V3)
const API_BASE = 'https://leadflow-ai-z2rf.onrender.com';

// When extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('LeadFlow AI installed');
  chrome.storage.local.set({ leadflow: { connected: false, platform: null, tasks: [] } });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  handleMessage(msg, sender).then(sendResponse);
  return true; // keep channel open for async
});

async function handleMessage(msg, sender) {
  switch (msg.type) {
    case 'GET_COOKIES':
      return await getCookiesForTab(sender.tab);

    case 'CONNECT_PLATFORM':
      return await connectPlatform(msg.platform);

    case 'REPORT_RESULT':
      return await reportResult(msg);

    case 'POLL_TASKS':
      return await pollTasks();

    default:
      return { error: 'unknown message type' };
  }
}

// Read cookies from the current tab's domain
async function getCookiesForTab(tab) {
  if (!tab || !tab.url) return { cookies: '', platform: null };
  const url = new URL(tab.url);
  const domain = url.hostname;

  const cookies = await chrome.cookies.getAll({ domain: domain.replace(/^www\./, '') });
  const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');

  let platform = null;
  if (domain.includes('facebook')) platform = 'facebook';
  else if (domain.includes('reddit')) platform = 'reddit';
  else if (domain.includes('instagram')) platform = 'instagram';
  else if (domain.includes('tiktok')) platform = 'tiktok';
  else if (domain.includes('youtube')) platform = 'youtube';
  else if (domain.includes('twitter') || domain.includes('x.com')) platform = 'x';
  else if (domain.includes('linkedin')) platform = 'linkedin';

  return { cookies: cookieStr, platform, domain };
}

// Send cookies to our server to connect
async function connectPlatform(platform) {
  const token = await chrome.storage.local.get('leadflow_token');
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  const { cookies, platform: detected } = await getCookiesForTab(tab);

  const res = await fetch(`${API_BASE}/api/accounts/connect-extension`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      platform: detected || platform,
      cookies,
      token: token.leadflow_token,
    }),
  });
  return await res.json();
}

// Report a lead/action result back to the server
async function reportResult(data) {
  const token = await chrome.storage.local.get('leadflow_token');
  await fetch(`${API_BASE}/api/worker/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, token: token.leadflow_token }),
  });
}

// Poll for pending tasks from the server
async function pollTasks() {
  const token = await chrome.storage.local.get('leadflow_token');
  if (!token.leadflow_token) return { tasks: [] };

  const res = await fetch(`${API_BASE}/api/worker/poll`, {
    headers: { 'Authorization': `Bearer ${token.leadflow_token}` },
  });
  return await res.json();
}

// Periodic polling: every 30 seconds check for tasks
setInterval(async () => {
  try {
    const result = await pollTasks();
    if (result.tasks && result.tasks.length > 0) {
      // Send task to active tab's content script
      for (const task of result.tasks) {
        const tabs = await chrome.tabs.query({ url: task.platform === 'facebook' ? '*://*.facebook.com/*' : '*://*.reddit.com/*' });
        for (const tab of tabs) {
          chrome.tabs.sendMessage(tab.id, { type: 'EXECUTE_TASK', task });
        }
      }
    }
  } catch (e) {
    console.log('Poll error:', e);
  }
}, 30000);
