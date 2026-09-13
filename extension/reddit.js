// LeadFlow AI - Reddit Content Script

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'EXECUTE_TASK' && !executing) {
    executing = true;
    runRedditTask(msg.task).finally(() => { executing = false; });
  }
  if (msg.type === 'GET_REDDIT_COOKIES') {
    sendResponse({ cookies: document.cookie });
  }
});

let executing = false;

async function runRedditTask(task) {
  console.log('[LeadFlow] Executing Reddit task:', task);
  const keywords = task.keywords || task.topic;

  // Search Reddit
  window.location.href = `https://www.reddit.com/search/?q=${encodeURIComponent(keywords)}&type=user`;
  await sleep(5000);

  // Collect user links
  const links = document.querySelectorAll('a[href*="/user/"]');
  const users = [];
  const seen = new Set();
  for (const link of links) {
    const href = link.href;
    if (href && !seen.has(href) && href.includes('/user/') && !href.includes('/user/me')) {
      seen.add(href);
      users.push({ url: href, name: link.textContent?.trim() || 'u/unknown' });
    }
  }

  // Try to send DMs
  for (const user of users.slice(0, task.maxTargets || 10)) {
    try {
      window.location.href = user.url;
      await sleep(3000);

      // Click "Message" button
      const msgBtn = Array.from(document.querySelectorAll('a, button, div[role="button"]'))
        .find(b => b.textContent?.trim() === 'Message' || b.textContent?.includes('Message'));
      if (msgBtn) {
        msgBtn.click();
        await sleep(2000);
        const textarea = document.querySelector('textarea');
        if (textarea) {
          textarea.value = task.dmTemplate || 'Hey! Loved your post, would love to connect.';
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          await sleep(500);
        }
      }
    } catch (e) {
      console.log('[LeadFlow] Reddit error:', e);
    }
  }

  chrome.runtime.sendMessage({
    type: 'REPORT_RESULT',
    data: { platform: 'reddit', taskId: task.id, leads: users, completedAt: new Date().toISOString() },
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
