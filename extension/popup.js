// LeadFlow AI Popup
const API = 'https://leadflow-ai-z2rf.onrender.com';

document.addEventListener('DOMContentLoaded', async () => {
  const token = (await chrome.storage.local.get('leadflow_token')).leadflow_token;
  if (token) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainSection').style.display = 'block';
    loadPlatforms();
  } else {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('mainSection').style.display = 'none';
  }
});

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.token) {
    await chrome.storage.local.set({ leadflow_token: data.token });
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainSection').style.display = 'block';
    loadPlatforms();
  } else {
    alert('Login failed: ' + (data.error || 'try again'));
  }
}

async function loadPlatforms() {
  const token = (await chrome.storage.local.get('leadflow_token')).leadflow_token;
  const res = await fetch(`${API}/api/accounts`, {
    headers: { 'Cookie': `lf_token=${token}` },
  });
  const accounts = await res.json();

  const all = ['facebook', 'reddit', 'instagram', 'tiktok', 'youtube', 'x', 'linkedin'];
  const icons = { facebook: '📘', reddit: '👽', instagram: '📷', tiktok: '🎵', youtube: '▶️', x: '𝕏', linkedin: 'in' };
  const container = document.getElementById('platforms');
  container.innerHTML = all.map(p => {
    const acc = accounts.find(a => a.platform === p);
    return `<div class="platform">
      <span class="icon">${icons[p]}</span>
      <span class="name">${p}</span>
      <span class="badge ${acc ? 'on' : 'off'}">${acc ? 'Connected' : 'Off'}</span>
    </div>`;
  }).join('');

  document.getElementById('statusMsg').className = 'status connected';
  document.getElementById('statusMsg').textContent = `✅ Logged in as ${accounts.length} platform(s)`;
}

async function connectCurrent() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const res = await chrome.runtime.sendMessage({ type: 'CONNECT_PLATFORM' });
  if (res && res.status === 'connected') {
    alert(`Connected: ${res.platform}!`);
    loadPlatforms();
  } else {
    alert('Not on a supported site. Open Facebook/Reddit/Instagram first.');
  }
}

function openDashboard() {
  chrome.tabs.create({ url: `${API}/dashboard` });
}
