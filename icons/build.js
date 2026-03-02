import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { parse } from 'path';

const svgDir = './icons/svg';
const files = readdirSync(svgDir).filter(f => f.endsWith('.svg'));

const manifest = files.map(file => {
  const name = parse(file).name;
  const svg = readFileSync(`${svgDir}/${file}`, 'utf8');

  const parts = name.split('--');
  const slug = parts[0];
  const category = parts[1] || 'misc';
  const tags = parts.slice(1);

  return { slug, name: slug, category, tags, svg };
});

writeFileSync('./icons/icons-manifest.json', JSON.stringify(manifest, null, 2));
console.log(`Built manifest: ${manifest.length} icons`);
