/* ===========================
   admin.js — Admin Logic
   =========================== */

// ── THEME ──────────────────────────────────────────
const html = document.documentElement;
const themeIconAdmin = document.getElementById('theme-icon-admin');

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  if (themeIconAdmin) themeIconAdmin.textContent = theme === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('portfolio-theme', theme);
}

const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
setTheme(savedTheme);

document.getElementById('theme-toggle-admin')?.addEventListener('click', () => {
  setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// ── STATE ──────────────────────────────────────────
let currentUser = null;
let projectList = [];
let editMode = false;

// ── INIT ───────────────────────────────────────────
window.addEventListener('appwrite-ready', initAdmin);
if (window.AppwriteReady) initAdmin();

async function initAdmin() {
  try {
    const account = getAccount();
    currentUser = await account.get();
    showDashboard();
  } catch {
    showLogin();
  }
}

// ── LOGIN ───────────────────────────────────────────
function showLogin() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('admin-dashboard').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('admin-dashboard').classList.remove('hidden');
  if (currentUser) {
    document.getElementById('user-label').textContent = `// ${currentUser.email}`;
  const mob = document.getElementById('user-label-mobile');
  if (mob) { mob.textContent = currentUser.email; mob.classList.remove('hidden'); }
  }
  loadProjects();
}

document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');

  if (!email || !password) {
    showError(errEl, 'Email and password required.');
    return;
  }

  btn.disabled = true;
  document.getElementById('login-btn-text').textContent = 'Signing in...';
  errEl.classList.add('hidden');

  try {
    const account = getAccount();
    await account.createEmailPasswordSession(email, password);
    currentUser = await account.get();
    showDashboard();
  } catch (err) {
    showError(errEl, 'Invalid credentials. Please try again.');
    btn.disabled = false;
    document.getElementById('login-btn-text').textContent = 'Sign In';
  }
});

// Allow Enter key on login
document.getElementById('login-password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('login-btn').click();
});

// ── LOGOUT ─────────────────────────────────────────
document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    await getAccount().deleteSession('current');
  } catch {}
  currentUser = null;
  showLogin();
});

// ── PANEL NAVIGATION ───────────────────────────────
const panelTitles = {
  projects: ['Projects', '// manage your portfolio projects'],
  add: ['Add Project', '// fill in project details'],
};

document.querySelectorAll('.sidebar-link[data-panel]').forEach(btn => {
  btn.addEventListener('click', () => {
    showPanel(btn.dataset.panel);
  });
});

function showPanel(name) {
  // Hide all panels
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.add('hidden'));
  document.getElementById(`panel-${name}`)?.classList.remove('hidden');

  // Update sidebar active state
  document.querySelectorAll('.sidebar-link[data-panel]').forEach(b => {
    b.classList.toggle('active', b.dataset.panel === name);
  });

  // Update header
  const [title, sub] = panelTitles[name] || ['Panel', ''];
  document.getElementById('panel-title').textContent = title;
  document.getElementById('panel-sub').textContent = sub;

  if (name === 'projects') loadProjects();
  if (name === 'add' && !editMode) resetForm();
}

// ── LOAD PROJECTS ──────────────────────────────────
async function loadProjects() {
  const listEl = document.getElementById('admin-projects-list');
  const emptyEl = document.getElementById('admin-empty');
  const countEl = document.getElementById('project-count');

  // Skeletons
  listEl.innerHTML = Array(3).fill('<div class="admin-skeleton"></div>').join('');
  emptyEl.classList.add('hidden');

  try {
    const db = getDatabase();
    const res = await db.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collectionId,
      [Appwrite.Query.orderDesc('$createdAt')]
    );
    projectList = res.documents;
    countEl.textContent = projectList.length;

    if (projectList.length === 0) {
      listEl.innerHTML = '';
      emptyEl.classList.remove('hidden');
      return;
    }

    listEl.innerHTML = '';
    projectList.forEach(project => {
      listEl.appendChild(buildAdminProjectItem(project));
    });

  } catch (err) {
    listEl.innerHTML = `<p class="font-mono text-red-400 text-sm">// error loading projects: ${err.message}</p>`;
  }
}

function buildAdminProjectItem(project) {
  const div = document.createElement('div');
  div.className = 'admin-project-item';

  const thumb = project.imageId
    ? `<img src="${getImagePreviewUrl(project.imageId)}" class="admin-project-thumb" alt="${project.title}" onerror="this.parentNode.innerHTML='<div class=\'admin-project-thumb-placeholder\'>🖥️</div>'" />`
    : `<div class="admin-project-thumb-placeholder">🖥️</div>`;

  div.innerHTML = `
    ${thumb}
    <div class="admin-project-info">
      <div class="admin-project-name">${project.title}</div>
      <div class="admin-project-tags">${project.stack || '—'}</div>
    </div>
    <button class="admin-action-btn" onclick="openEditProject('${project.$id}')">Edit</button>
  `;
  return div;
}

// ── OPEN EDIT ──────────────────────────────────────
function openEditProject(docId) {
  const project = projectList.find(p => p.$id === docId);
  if (!project) return;

  editMode = true;
  document.getElementById('form-heading').textContent = 'Edit Project';
  document.getElementById('edit-doc-id').value = project.$id;
  document.getElementById('edit-image-id').value = project.imageId || '';
  document.getElementById('proj-title').value = project.title || '';
  document.getElementById('proj-stack').value = project.stack || '';
  document.getElementById('proj-desc').value = project.description || '';
  document.getElementById('proj-live').value = project.liveUrl || '';
  document.getElementById('proj-github').value = project.githubUrl || '';
  document.getElementById('save-btn-text').textContent = 'Update Project';
  document.getElementById('delete-project-btn').classList.remove('hidden');

  // Show existing image preview
  if (project.imageId) {
    const preview = document.getElementById('image-preview');
    preview.src = getImagePreviewUrl(project.imageId);
    preview.classList.remove('hidden');
    document.getElementById('drop-placeholder').classList.add('hidden');
    document.getElementById('image-drop-zone').classList.add('has-image');
  }

  showPanel('add');
  document.getElementById('panel-title').textContent = 'Edit Project';
  document.getElementById('panel-sub').textContent = '// update project details';
}

// ── IMAGE PREVIEW ──────────────────────────────────
document.getElementById('proj-image').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const preview = document.getElementById('image-preview');
    preview.src = ev.target.result;
    preview.classList.remove('hidden');
    document.getElementById('drop-placeholder').classList.add('hidden');
    document.getElementById('image-drop-zone').classList.add('has-image');
  };
  reader.readAsDataURL(file);
});

// ── SAVE PROJECT ───────────────────────────────────
document.getElementById('save-project-btn').addEventListener('click', saveProject);

async function saveProject() {
  const title = document.getElementById('proj-title').value.trim();
  const stack = document.getElementById('proj-stack').value.trim();
  const description = document.getElementById('proj-desc').value.trim();
  const liveUrl = document.getElementById('proj-live').value.trim();
  const githubUrl = document.getElementById('proj-github').value.trim();
  const imageFile = document.getElementById('proj-image').files[0];
  const docId = document.getElementById('edit-doc-id').value;
  const existingImageId = document.getElementById('edit-image-id').value;

  const errEl = document.getElementById('form-error');
  const successEl = document.getElementById('form-success');
  const saveBtn = document.getElementById('save-project-btn');
  const saveBtnText = document.getElementById('save-btn-text');

  errEl.classList.add('hidden');
  successEl.classList.add('hidden');

  if (!title || !stack) {
    showError(errEl, '// title and stack are required');
    return;
  }

  saveBtn.disabled = true;
  saveBtnText.textContent = editMode ? 'Updating...' : 'Saving...';

  try {
    const db = getDatabase();
    const storage = getStorage();
    let imageId = existingImageId;

    // Upload new image if provided
    if (imageFile) {
      if (existingImageId) {
        try {
          await storage.deleteFile(APPWRITE_CONFIG.bucketId, existingImageId);
        } catch {}
      }
      const uploaded = await storage.createFile(
        APPWRITE_CONFIG.bucketId,
        Appwrite.ID.unique(),
        imageFile
      );
      imageId = uploaded.$id;
    }

    const data = { title, stack, description, liveUrl, githubUrl, imageId: imageId || '' };

    if (editMode && docId) {
      await db.updateDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collectionId, docId, data);
      showSuccess(successEl, '// project updated successfully ✓');
    } else {
      await db.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collectionId,
        Appwrite.ID.unique(),
        data
      );
      showSuccess(successEl, '// project added successfully ✓');
      resetForm();
    }

  } catch (err) {
    showError(errEl, `// error: ${err.message}`);
  } finally {
    saveBtn.disabled = false;
    saveBtnText.textContent = editMode ? 'Update Project' : 'Save Project';
  }
}

// ── DELETE PROJECT ─────────────────────────────────
document.getElementById('delete-project-btn').addEventListener('click', async () => {
  const docId = document.getElementById('edit-doc-id').value;
  const imageId = document.getElementById('edit-image-id').value;
  if (!docId) return;

  if (!confirm('Delete this project? This cannot be undone.')) return;

  try {
    const db = getDatabase();
    await db.deleteDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collectionId, docId);
    if (imageId) {
      try { await getStorage().deleteFile(APPWRITE_CONFIG.bucketId, imageId); } catch {}
    }
    resetForm();
    showPanel('projects');
  } catch (err) {
    showError(document.getElementById('form-error'), `// delete failed: ${err.message}`);
  }
});

// ── HELPERS ────────────────────────────────────────
function resetForm() {
  editMode = false;
  document.getElementById('form-heading').textContent = 'Add New Project';
  document.getElementById('edit-doc-id').value = '';
  document.getElementById('edit-image-id').value = '';
  document.getElementById('proj-title').value = '';
  document.getElementById('proj-stack').value = '';
  document.getElementById('proj-desc').value = '';
  document.getElementById('proj-live').value = '';
  document.getElementById('proj-github').value = '';
  document.getElementById('proj-image').value = '';
  document.getElementById('image-preview').classList.add('hidden');
  document.getElementById('image-preview').src = '';
  document.getElementById('drop-placeholder').classList.remove('hidden');
  document.getElementById('image-drop-zone').classList.remove('has-image');
  document.getElementById('save-btn-text').textContent = 'Save Project';
  document.getElementById('delete-project-btn').classList.add('hidden');
  document.getElementById('form-error').classList.add('hidden');
  document.getElementById('form-success').classList.add('hidden');
}

function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 5000);
}

function showSuccess(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4000);
}