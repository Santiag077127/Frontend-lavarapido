import { readFileSync, writeFileSync } from 'node:fs';

const version = '1.9.4';
const css = readFileSync('node_modules/leaflet/dist/leaflet.css', 'utf8');
const javascript = readFileSync('node_modules/leaflet/dist/leaflet.js', 'utf8')
  .replace(/\r?\n\/\/# sourceMappingURL=.*$/, '');

const output = [
  `export const leafletVersion = '${version}'`,
  '',
  `export const leafletCss = ${JSON.stringify(css)}`,
  '',
  `export const leafletJs = ${JSON.stringify(javascript)}`,
  '',
].join('\n');

writeFileSync('src/features/map/data/leafletResources.ts', output, 'utf8');
