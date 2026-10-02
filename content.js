// Full work index. Mark two entries as featured to show them on the homepage.
const PROJECTS = [
  {
    id: 'cicadadetroit',
    featured: true,
    name: 'Cicada Detroit',
    kind: 'SECURITY ENGAGEMENT',
    date: 'Feb — Apr 2025',
    desc: 'A puzzle site became a real security research opportunity. I found and helped patch more than seven vulnerabilities.',
    tags: ['Web security', 'Bug bounty', 'JavaScript'],
    lede: 'Hands-on security research for an interactive puzzle experience.',
    content: `<p>I first joined Cicada Detroit as a participant in its puzzle competition. After a few months, I was invited to investigate the site’s security.</p>
      <p>Over roughly a month, I found and helped fix more than seven issues. The work involved page enumeration, SSRF, cross-site scripting, and clickjacking. I also learned how much context matters: identifying an issue is one part of the job; explaining its impact and helping the team address it is another.</p>
      <h2>What I learned</h2><p>The engagement brought together the things I enjoy about security: careful observation, testing assumptions, and understanding how separate parts of a web application interact.</p>
      <p>The site owner publicly acknowledged the contribution.</p>
      <p><a href="https://www.cicadadetroit.com/thankyousandacknowledgements" target="_blank" rel="noopener noreferrer">Cicada Detroit acknowledgements ↗</a></p>`
  },
  {
    id: 'cicada-writeup',
    featured: true,
    name: 'A vulnerability, documented',
    kind: 'PUBLISHED WRITE-UP',
    date: 'CICADA DETROIT',
    desc: 'An authorized technical write-up of a vulnerability from the Cicada Detroit security engagement.',
    tags: ['Write-up', 'Web security', 'PDF'],
    lede: 'A permitted public write-up of one of the vulnerabilities I helped patch.',
    content: `<p>The Cicada Detroit puzzle owner gave me permission to share a technical write-up of one of the vulnerabilities I helped patch.</p>
      <p>The report walks through the exploit and its impact. Publishing responsibly matters: the system owner approved this disclosure, and the issue was addressed.</p>
      <p><a href="/files/cicadadetroit-exploit.pdf" target="_blank" rel="noopener noreferrer">Read the exploit write-up (PDF) ↗</a></p>`
  },
  {
    id: 'arg-security',
    name: 'Security behind the story',
    kind: 'ARG SECURITY RESEARCH',
    date: 'Jul — Dec 2025',
    desc: 'Security testing for web assets and campaign infrastructure supporting The Undertone through ARGhouse.',
    tags: ['Security research', 'Web security', 'ARG'],
    lede: 'Taking the same curiosity about systems into an interactive, story-driven experience.',
    content: `<p>A second paid security engagement came through ARGhouse, for campaign web assets and infrastructure supporting <em>The Undertone</em>.</p>
      <p>It gave me a different setting in which to think about how web security supports an interactive experience. I carried the same approach from the puzzle work: investigate carefully, communicate findings clearly, and help the people behind the experience fix what needs attention.</p>
      <p>Together, these engagements turned a curiosity about puzzles into a lasting interest in hands-on security research.</p>`
  }
];
