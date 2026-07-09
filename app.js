// ========================
// CONFIG
// ========================
const CITY = "New Delhi";
const GITHUB_USERNAME = "quantapixel";

// ========================
// PROJECTS DATA
// Add your projects here.
// `content` is full HTML — write as much as you want.
// ========================
const PROJECTS = [
  
  {
    id: "cicadadetroit",
    name: "Cicada Detroit",
    desc: "Bug bounty for a game website",
    date: "2026-05",
    category: "web-hacking",
    tags: ["javascript", "bug-bounty"],
    lede: "addressed page enumeration, SSRF, advanced XSS, clickjacking risks and DDoS/DoS mitigation vulnerabilities",
    content: `
      <p>This was the second time ever I've done freelance bug bounty and first time I've done it for money. 
      Around end of 2025 when I was supposed to study for my JEE exam I got the opportunity to work bug bounty for this 
      cicada styled game show. Over the period of a month I exploited and corrected 7+ bugs/exploits and made site airtight 
      and hacker-proof while making 3000+$ this shit shifted my focus from ethical hacking, rf experimentation, 
      osint investigation and ai assisted sec analysis to bug bounty, ctfs(crypto, web exp, pwn, rev eng, foren, game) and kid
      you not I particapted in 10+ hackathons/ctfs(won 2 hackathons, 3 ctfs) for the next 3 month till jan start which gravely 
      affected my JEE score and led me to make the unfortunate choice to join the college which was my last option.</p>

      <h2>Exploit</h2>
      <p>The puzzle owner allowed me to release the writeup for one of the more critical ongoing(then) vulnerabilities 
      I patched:-<br><a href="files/cicadadetroit-exploit.pdf" target="_blank" rel="noopener noreferrer">exploit pdf</a> </p>
    
      <h2>Acknoledgment</h2>
      <p>The owner also made this acknoledgement page for me(well technically I told him to add it):-
      <br> <a href="https://www.cicadadetroit.com/thankyousandacknowledgements" target="_blank" rel="noopener noreferrer">
      Link</a></p>
`    
  }
];

// ========================
// PAGES
// ========================
const PAGES = {
  home:           document.getElementById("page-home"),
  projects:       document.getElementById("page-projects"),
  projectArticle: document.getElementById("page-project-article"),
  about:          document.getElementById("page-about"),
};

function showPage(name) {
  Object.values(PAGES).forEach(p => {
    p.classList.remove("active");
    p.classList.add("hidden");
  });
  PAGES[name].classList.remove("hidden");
  PAGES[name].classList.add("active");
  window.scrollTo(0, 0);
}

window.showPage = showPage;

// ========================
// NAV
// ========================
document.getElementById("hdr-name").addEventListener("click", () => showPage("home"));

// ========================
// RENDER PROJECTS GRID
// ========================
function renderProjects() {
  const grid = document.getElementById("projects-grid");
  grid.innerHTML = "";

  PROJECTS.forEach(proj => {
    const card = document.createElement("div");
    card.className = "proj-card";
    card.innerHTML = `
      <div>
        <div class="proj-name">${proj.name}</div>
        <div class="proj-desc">${proj.desc}</div>
        <div class="proj-tags">
          ${proj.tags.map(t => `<span class="proj-tag">${t}</span>`).join("")}
        </div>
      </div>
      <div style="font-size:10px;color:var(--t4);flex-shrink:0">${proj.date}</div>
    `;
    card.addEventListener("click", () => openProjectArticle(proj.id));
    grid.appendChild(card);
  });
}

// ========================
// OPEN PROJECT ARTICLE
// ========================
function openProjectArticle(id) {
  const proj = PROJECTS.find(p => p.id === id);
  if (!proj) return;

  document.getElementById("proj-art-cat").textContent = proj.category;
  document.getElementById("proj-art-date").textContent = proj.date;
  document.getElementById("proj-art-title").textContent = proj.name;
  document.getElementById("proj-art-lede").textContent = proj.lede;
  document.getElementById("proj-art-tags").innerHTML = proj.tags.map(t => `<span class="tag">${t}</span>`).join("");
  document.getElementById("proj-art-body").innerHTML = proj.content;
  document.getElementById("proj-art-back").onclick = () => showPage("projects");

  showPage("projectArticle");
}

// ========================
// WEATHER
// ========================
async function loadWeather() {
  try {
    const res = await fetch(`https://wttr.in/${CITY}?format=j1`);
    const data = await res.json();
    const current = data.current_condition[0];
    const temp = current.temp_C;
    const desc = current.weatherDesc[0].value;
    document.getElementById("weather-val").textContent = `${temp}°C · ${desc}`;
  } catch (err) {
    console.error(err);
    document.getElementById("weather-val").textContent = "weather unavailable";
  }
}

// ========================
// LOCAL TIME
// ========================
function updateLocalTime() {
  const now = new Date();
  const formatted = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
  document.getElementById("local-time-val").textContent = formatted;
}

// ========================
// GITHUB CONTRIBUTIONS HEATMAP
// ========================
async function loadGithubActivity() {
  const wrap = document.getElementById("github-strip");
  wrap.innerHTML = '<div class="gh-loading">fetching contributions...</div>';

  try {
    const [contribRes, eventsRes] = await Promise.all([
      fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=100`)
    ]);
    const { contributions: allContribs } = await contribRes.json();

    // Keep only last 8 months
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 8);
    const contributions = allContribs.filter(d => new Date(d.date) >= cutoff);
    const events = await eventsRes.json();

    // Build a map of date → [event descriptions]
    const eventMap = {};
    events.forEach(e => {
      const d = e.created_at.slice(0, 10);
      if (!eventMap[d]) eventMap[d] = [];
      const desc = formatEvent(e);
      if (desc) eventMap[d].push(desc);
    });

    // Pad front so first cell is Sunday (day 0)
    const firstDay = new Date(contributions[0].date).getUTCDay();
    const padded = [...Array(firstDay).fill(null), ...contributions];

    // Build month labels (one per column where month changes)
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthLabels = []; // { col, label }
    let lastMonth = -1;
    for (let i = 0; i < padded.length; i++) {
      const col = Math.floor(i / 7);
      if (padded[i]) {
        const m = new Date(padded[i].date).getUTCMonth();
        if (m !== lastMonth) { monthLabels.push({ col, label: MONTHS[m] }); lastMonth = m; }
      }
    }
    const totalCols = Math.ceil(padded.length / 7);

    // Tooltip element
    let tip = document.getElementById("gh-tip");
    if (!tip) {
      tip = document.createElement("div");
      tip.id = "gh-tip";
      tip.className = "gh-tip";
      document.body.appendChild(tip);
    }

    // Render
    wrap.innerHTML = "";
    wrap.style.cssText = "";

    const cellSize = `min(13px, calc((100% - ${(totalCols - 1) * 3}px) / ${totalCols}))`;

    // Month label row — fixed 13px cols matching grid
    const labelRow = document.createElement("div");
    labelRow.className = "gh-months";
    labelRow.style.cssText = `display:grid;grid-template-columns:repeat(${totalCols},min(13px,calc((100% - ${(totalCols-1)*3}px)/${totalCols})));gap:3px;margin-bottom:4px;overflow:visible;`;
    for (let c = 0; c < totalCols; c++) {
      const span = document.createElement("span");
      const lbl = monthLabels.find(m => m.col === c);
      if (lbl) {
        span.textContent = lbl.label;
        span.style.cssText = "font-size:9px;color:var(--t4);white-space:nowrap;position:relative;";
      }
      labelRow.appendChild(span);
    }
    wrap.appendChild(labelRow);

    // Grid
    const grid = document.createElement("div");
    grid.className = "gh-grid";
    grid.style.cssText = `display:grid;grid-template-rows:repeat(7,13px);grid-template-columns:repeat(${totalCols},${cellSize});grid-auto-flow:column;gap:3px;`;

    padded.forEach((day, i) => {
      const cell = document.createElement("div");
      if (!day) {
        cell.className = "gh-day gh-empty";
      } else {
        cell.className = `gh-day${day.level > 0 ? ` l${Math.min(day.level, 4)}` : ""}`;
        cell.addEventListener("click", e => {
          const evs = eventMap[day.date] || [];
          const lines = evs.length
            ? evs.slice(0, 5).join("<br>") + (evs.length > 5 ? `<br><span style="color:var(--t4)">+${evs.length - 5} more</span>` : "")
            : "No recorded events";
          tip.innerHTML = `<div class="gh-tip-date">${day.date}</div><div class="gh-tip-count">${day.count} contribution${day.count !== 1 ? "s" : ""}</div>${evs.length ? `<div class="gh-tip-evs">${lines}</div>` : ""}`;
          tip.style.display = "block";
          const r = cell.getBoundingClientRect();
          const tx = Math.min(r.left, window.innerWidth - 272);
          const ty = r.top - tip.offsetHeight - 8;
          tip.style.left = (tx < 8 ? 8 : tx) + "px";
          tip.style.top = (ty < 8 ? r.bottom + 8 : ty) + "px";
          e.stopPropagation();
        });
      }
      grid.appendChild(cell);
    });

    wrap.appendChild(grid);
    document.addEventListener("click", () => { tip.style.display = "none"; }, { once: false });

  } catch (err) {
    console.error(err);
    wrap.innerHTML = '<div class="gh-loading">contributions unavailable</div>';
  }
}

function formatEvent(e) {
  const repo = e.repo.name.split("/")[1];
  switch (e.type) {
    case "PushEvent":      return `pushed to ${repo}`;
    case "CreateEvent":    return `created ${e.payload.ref_type} in ${repo}`;
    case "PullRequestEvent": return `${e.payload.action} PR in ${repo}`;
    case "IssuesEvent":    return `${e.payload.action} issue in ${repo}`;
    case "ForkEvent":      return `forked ${repo}`;
    case "WatchEvent":     return `starred ${repo}`;
    case "IssueCommentEvent": return `commented in ${repo}`;
    case "DeleteEvent":    return `deleted ${e.payload.ref_type} in ${repo}`;
    default:               return null;
  }
}

// ========================
// GITHUB STATS
// ========================
async function loadGithubStats() {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
    const user = await res.json();
    document.getElementById("gh-stats").innerHTML = `
      <span>${user.public_repos} repos</span>
      <span> · </span>
      <span>${user.followers} followers</span>
      <span> · </span>
      <span>${user.following} following</span>
    `;
  } catch (err) {
    console.error(err);
  }
}

// ========================
// LATEST PROJECT
// ========================
async function loadLatestProject() {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated`);
    const repos = await res.json();
    const latest = repos[0];
    document.getElementById("s-building").innerHTML = `<span class="dot-live"></span> ${latest.name}`;
  } catch (err) {
    console.error(err);
  }
}

// ========================
// SPOTIFY
// ========================
async function loadSpotify() {
  try {
    const res = await fetch("/api/spotify");
    const data = await res.json();
    if (data.isPlaying) {
      document.getElementById("spotify-music-icon").style.display = "inline";
      document.getElementById("spotify-val").textContent = `${data.title} — ${data.artist}`;
    } else {
      document.getElementById("spotify-music-icon").style.display = "none";
      document.getElementById("spotify-val").textContent = "not playing";
    }
  } catch (err) {
    console.error(err);
  }
}

// ========================
// INIT
// ========================
renderProjects();
loadWeather();
updateLocalTime();
loadGithubActivity();
loadGithubStats();
loadLatestProject();
loadSpotify();

// ========================
// AUTO REFRESH
// ========================
setInterval(updateLocalTime, 1000);
setInterval(loadWeather, 600000);
setInterval(loadSpotify, 15000);