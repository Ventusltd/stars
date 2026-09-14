// Numbers in the historical electron/soul graphs are not modular-star family keys.
// Only an explicit family key may open code.html?family=N.
const SITE = 'https://ventusltd.github.io/stars/';
const GH = 'https://github.com/Ventusltd/stars/blob/main/';
export function nodeLinks(node, { report = 'CLASSIFICATION', symbols = new Set(), example = null } = {}) {
  const fallback = `${GH}reports/${report}.md`;
  let gh = node.gh || fallback, ext = node.ext || fallback;
  const family = /^family:(\d+)$/.exec(node.id || '');
  if (family) ext = `${SITE}code.html?family=${family[1]}`;
  const symbol = node.symbol || String(node.label || '').split(/[ (]/)[0];
  if ((node.type === 'element' || node.type === 'constant' || node.type === 'block') && symbols.has(symbol)) {
    ext = `${SITE}table.html?block=${encodeURIComponent(symbol)}`;
  }
  if (node.type === 'repo' || node.type === 'repository') {
    const repo = node.repo || node.label;
    if (/^(?:Ventusltd\/)?[A-Za-z0-9_.-]+$/.test(repo || '')) gh = ext = `https://github.com/${repo.startsWith('Ventusltd/') ? repo : 'Ventusltd/' + repo}`;
  }
  if (node.type === 'decay' && example) gh = ext = example;
  return { gh, ext };
}
