const sections = [...document.querySelectorAll('.scroll-section')];
const detail = document.getElementById('project-detail');
const detailTitle = document.getElementById('detail-title');
const workIndex = document.getElementById('work-index');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const titles = { home: 'Jaskaran Singh — Computer Science & Security', work: 'Work — Jaskaran Singh', about: 'About — Jaskaran Singh' };
let homeIntroTimer;
let currentView;
history.scrollRestoration = 'manual';

function playHomeIntro() {
  const home = document.getElementById('home');
  clearTimeout(homeIntroTimer);
  home.classList.remove('home-entering');
  void home.offsetWidth;
  requestAnimationFrame(() => home.classList.add('home-entering'));
  homeIntroTimer = setTimeout(() => home.classList.remove('home-entering'), 1500);
}
function currentSection() {
  if (location.hash === '#about' || /^\/about(?:\.html)?\/?$/.test(location.pathname)) return 'about';
  return 'home';
}
function markNavigation(active) {
  document.querySelectorAll('[data-scroll], [data-work]').forEach(link => {
    if ((link.hasAttribute('data-work') ? 'work' : link.dataset.scroll) === active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function renderRoute({ scroll = false, restoreY } = {}) {
  // Preserve old bookmarked links to the former scrolling Work section.
  if (['#work', '#projects'].includes(location.hash)) history.replaceState(history.state, '', '/projects' + location.search);
  const projectId = new URLSearchParams(location.search).get('project');
  const project = PROJECTS.find(item => item.id === projectId);
  const isDetail = Boolean(project);
  const isIndex = !isDetail && /^\/projects(?:\.html)?\/?$/.test(location.pathname);
  const previousView = currentView;
  currentView = isDetail ? 'detail' : isIndex ? 'work' : 'home';
  sections.forEach(section => { section.hidden = isDetail || isIndex; });
  detail.hidden = !isDetail;
  workIndex.hidden = !isIndex;
  const section = currentSection();

  if (isDetail) {
    document.getElementById('detail-kind').textContent = `${project.kind} · ${project.date}`;
    detailTitle.textContent = project.name;
    document.getElementById('detail-lede').textContent = project.lede;
    document.getElementById('detail-tags').replaceChildren(...project.tags.map(tag => {
      const chip = document.createElement('span'); chip.textContent = tag; return chip;
    }));
    document.getElementById('detail-content').innerHTML = project.content;
    document.querySelectorAll('.detail-content > *').forEach(element => element.classList.add('reveal'));
    const back = document.querySelector('[data-close-detail]');
    back.href = history.state?.returnTo || '/projects';
    back.textContent = /^\/(?:#home)?$/.test(history.state?.returnTo || '') ? '← back to featured' : '← all work';
    document.title = `${project.name} — Jaskaran Singh`;
  } else {
    document.title = isIndex ? titles.work : titles[section];
    if (!isIndex && section === 'home' && (scroll || previousView !== 'home')) playHomeIntro();
  }
  document.querySelector('link[rel="canonical"]').href = `https://jaskaran.xyz${isDetail ? `/projects?project=${project.id}` : isIndex ? '/projects' : section === 'about' ? '/about' : '/'}`;
  markNavigation(isDetail || isIndex ? 'work' : section);
  document.dispatchEvent(new Event('portfolio:route'));
  requestAnimationFrame(() => {
    observeReveals();
    if (typeof restoreY === 'number') {
      window.scrollTo({ top: restoreY, behavior: 'instant' });
    } else if (scroll || (!isDetail && !isIndex && section === 'about')) {
      const target = document.getElementById(section);
      const top = isDetail || isIndex ? 0 : target.getBoundingClientRect().top + window.scrollY - document.querySelector('.site-header').offsetHeight;
      window.scrollTo({ top: Math.max(0, top), behavior: previousView === 'home' && currentView === 'home' && !reducedMotion.matches ? 'smooth' : 'instant' });
    }
    if (scroll && previousView !== currentView) document.getElementById('main').focus({ preventScroll: true });
  });
}
function navigate(url, { returnTo, returnY, restoreY } = {}) {
  history.replaceState({ ...history.state, scrollY: window.scrollY }, '', location.href);
  history.pushState({ returnTo, returnY }, '', url);
  renderRoute({ scroll: true, restoreY });
}

document.addEventListener('click', event => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a');
  if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
  if (link.matches('[data-scroll]')) {
    event.preventDefault(); navigate(`/#${link.dataset.scroll}`);
  } else if (link.matches('[data-work]')) {
    event.preventDefault(); navigate('/projects');
  } else if (link.matches('[data-project]')) {
    event.preventDefault();
    navigate(`/projects?project=${encodeURIComponent(link.dataset.project)}`, {
      returnTo: location.pathname + location.search + location.hash, returnY: window.scrollY
    });
  } else if (link.matches('[data-close-detail]')) {
    event.preventDefault();
    navigate(link.getAttribute('href'), { restoreY: history.state?.returnY });
  }
});
window.addEventListener('popstate', () => renderRoute({ scroll: true, restoreY: history.state?.scrollY }));

function createCard(project, index, featured = false) {
  const card = document.createElement('a');
  card.className = featured ? 'featured-entry' : 'project-card reveal';
  card.href = `/projects?project=${encodeURIComponent(project.id)}`;
  card.dataset.project = project.id;
  const copy = document.createElement('span'); copy.className = featured ? 'featured-entry-copy' : 'project-card-copy';
  const kind = document.createElement('span'); kind.className = 'eyebrow'; kind.textContent = project.kind;
  const name = document.createElement('span'); name.className = featured ? 'featured-entry-title' : 'project-card-title'; name.textContent = project.name;
  const description = document.createElement('span'); description.className = featured ? 'featured-entry-description' : 'project-card-description'; description.textContent = project.desc;
  copy.append(kind, name, description);
  if (featured) {
    card.append(copy);
  } else {
    const arrow = document.createElement('span'); arrow.className = 'project-card-arrow'; arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = '↗';
    const number = document.createElement('span'); number.className = 'project-number'; number.textContent = `0${index + 1}`;
    const tags = document.createElement('span'); tags.className = 'detail-tags';
    project.tags.forEach(tag => { const chip = document.createElement('span'); chip.textContent = tag; tags.append(chip); });
    copy.append(tags);
    const cardEnd = document.createElement('span'); cardEnd.className = 'project-card-end';
    const action = document.createElement('span'); action.className = 'project-card-action'; action.textContent = 'open case';
    cardEnd.append(action, arrow);
    card.append(number, copy, cardEnd);
  }
  return card;
}
PROJECTS.forEach((project, index) => document.getElementById('projects-grid').append(createCard(project, index)));
PROJECTS.filter(project => project.featured).slice(0, 2).forEach((project, index) => document.getElementById('featured-grid').append(createCard(project, index, true)));
function renderContributionChart() {
  const grid = document.getElementById('contribution-grid');
  if (!grid) return;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const end = new Date(today);
  const day = end.getDay();
  end.setDate(end.getDate() + (6 - day));
  const start = new Date(end);
  start.setDate(start.getDate() - (52 * 7 - 1));
  const dates = [];
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) dates.push(new Date(cursor));
  const months = document.querySelector('.contribution-months');
  months.replaceChildren();
  let previousMonth = -1;
  dates.forEach((date, index) => {
    if (index % 7 !== 0) return;
    if (date.getMonth() === previousMonth) return;
    previousMonth = date.getMonth();
    const week = index / 7;
    if (week > 49) return;
    const label = document.createElement('span');
    label.textContent = date.toLocaleDateString('en', { month: 'short' });
    label.style.gridColumn = `${week + 1} / span 3`;
    months.append(label);
  });
  const fallback = date => ({ date: date.toISOString().slice(0, 10), count: 0, level: 0 });
  const paint = contributions => {
    const byDate = new Map(contributions.map(item => [item.date, item]));
    grid.replaceChildren(...dates.map(date => {
      const item = byDate.get(date.toISOString().slice(0, 10)) || fallback(date);
      const cell = document.createElement('span');
      const level = Math.max(0, Math.min(4, Number(item.level) || 0));
      cell.className = `contribution-cell level-${level}`;
      cell.title = `${item.count || 0} contribution${item.count === 1 ? '' : 's'} · ${item.date}`;
      cell.setAttribute('aria-label', cell.title);
      return cell;
    }));
  };
  paint([]);
  fetch('https://github-contributions-api.jogruber.de/v4/Quantapixel?y=last', { mode: 'cors' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('GitHub activity unavailable')))
    .then(data => paint(Array.isArray(data.contributions) ? data.contributions : []))
    .catch(() => {});
}
renderContributionChart();
document.querySelectorAll('.hero-copy, .scene, .section-heading, .about-intro, .about-github, .about-experience, .highlight').forEach(element => element.classList.add('reveal'));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: .12, rootMargin: '0px 0px -35px 0px' });
function observeReveals() {
  document.querySelectorAll('.reveal:not(.is-visible)').forEach(element => revealObserver.observe(element));
}
const sectionObserver = new IntersectionObserver(entries => {
  if (currentView !== 'home') return;
  const mostVisible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
  if (mostVisible) markNavigation(mostVisible.target.id);
}, { threshold: [0.2, .45, .7] });
sections.forEach(section => sectionObserver.observe(section));
renderRoute();
