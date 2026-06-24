/* ===========================
   projects.js — Fetch & Render
   =========================== */

let allProjects = [];

// Wait for Appwrite SDK to load
window.addEventListener('appwrite-ready', fetchProjects);
// Fallback if SDK already loaded
if (window.AppwriteReady) fetchProjects();

async function fetchProjects() {
  const grid = document.getElementById('projects-grid');
  const noProjects = document.getElementById('no-projects');

  try {
    const db = getDatabase();
    const response = await db.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collectionId,
      [Appwrite.Query.orderDesc('$createdAt'), Appwrite.Query.limit(50)]
    );

    allProjects = response.documents;

    if (allProjects.length === 0) {
      grid.innerHTML = '';
      noProjects.classList.remove('hidden');
      return;
    }

    renderProjects(allProjects);

  } catch (err) {
    console.warn('Appwrite not configured yet. Showing demo projects.', err);
    // Show demo cards until Appwrite is set up
    renderDemoProjects();
  }
}

function renderProjects(projects) {
  const grid = document.getElementById('projects-grid');
  grid.innerHTML = '';

  projects.forEach((project, i) => {
    const tags = (project.stack || '').split(',').map(t => t.trim()).filter(Boolean);
    const imageUrl = project.imageId ? getImagePreviewUrl(project.imageId) : null;

    const card = createProjectCard({
      title: project.title,
      description: project.description,
      tags,
      imageUrl,
      liveUrl: project.liveUrl,
      githubUrl: project.githubUrl,
      delay: i * 80,
    });

    grid.appendChild(card);
  });
}

function createProjectCard({ title, description, tags, imageUrl, liveUrl, githubUrl, delay = 0 }) {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.dataset.tags = tags.join(',');
  card.style.animationDelay = `${delay}ms`;

  const imgSection = imageUrl
    ? `<img src="${imageUrl}" alt="${title}" class="project-img" loading="lazy" onerror="this.parentNode.innerHTML='<div class=\'project-img-placeholder\'>🖥️</div>'" />`
    : `<div class="project-img-placeholder">🖥️</div>`;

  const tagsHtml = tags.map(t => `<span class="project-tag">${t}</span>`).join('');

  const linksHtml = [
    liveUrl ? `<a href="${liveUrl}" target="_blank" rel="noopener" class="project-link primary">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      Live
    </a>` : '',
    githubUrl ? `<a href="${githubUrl}" target="_blank" rel="noopener" class="project-link secondary">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
      Code
    </a>` : ''
  ].filter(Boolean).join('');

  card.innerHTML = `
    ${imgSection}
    <div class="project-body">
      <h3 class="project-title">${title}</h3>
      <p class="project-desc">${description || 'A project built with passion and precision.'}</p>
      <div class="project-tags">${tagsHtml}</div>
      <div class="project-links">${linksHtml || '<span style="font-size:0.75rem;color:var(--subtext);font-family:monospace">// coming soon</span>'}</div>
    </div>
  `;

  return card;
}

function renderDemoProjects() {
  const demos = [
    {
      title: 'Electryn Tesla — Financial Dashboard',
      description: 'A full-featured financial dashboard with Appwrite backend, crypto withdrawals, admin panel, and real-time balance management.',
      tags: ['HTML', 'CSS', 'JavaScript', 'Appwrite'],
      liveUrl: 'https://electryntesla.vercel.app',
      githubUrl: '',
    },
    {
      title: 'CHUKS MOVIES',
      description: 'A movie streaming website with TMDB integration, multi-source embed players, and a dedicated watch page.',
      tags: ['HTML', 'CSS', 'JavaScript', 'TMDB API'],
      liveUrl: '#',
      githubUrl: '#',
    },
    {
      title: 'E-Commerce Product Listing',
      description: 'A product listing application with admin dashboard, category management, and full CRUD operations.',
      tags: ['HTML', 'JavaScript', 'Appwrite', 'CSS'],
      liveUrl: '#',
      githubUrl: '#',
    },
  ];

  const grid = document.getElementById('projects-grid');
  grid.innerHTML = '';
  demos.forEach((p, i) => {
    grid.appendChild(createProjectCard({ ...p, delay: i * 100 }));
  });
}
