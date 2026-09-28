import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const outputDir = join(dirname(fileURLToPath(import.meta.url)), '../src/data/gmap-regions')
const source = 'https://download.geonames.org/export/dump'
const names = ['countryInfo.txt', 'admin1CodesASCII.txt', 'cities500.zip']
const temporary = await mkdtemp(join(tmpdir(), 'gmap-regions-'))

try {
  for (const name of names) {
    const response = await fetch(`${source}/${name}`)
    if (!response.ok) throw new Error(`GeoNames ${name}: HTTP ${response.status}`)
    await writeFile(join(temporary, name), Buffer.from(await response.arrayBuffer()))
  }

  const countries = (await readFile(join(temporary, names[0]), 'utf8'))
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.trimEnd().split('\t'))
    .filter(row => /^[A-Z]{2}$/.test(row[0]) && row[4])
    .map(row => [row[0], row[4]])
    .sort((a, b) => a[1].localeCompare(b[1], 'en'))
  const regions = new Map(countries.map(([code]) => [code, { s: [], c: [] }]))

  for (const line of (await readFile(join(temporary, names[1]), 'utf8')).split('\n')) {
    if (!line) continue
    const [fullCode, name] = line.split('\t')
    const [country, state] = fullCode.split('.', 2)
    if (state && name && regions.has(country)) regions.get(country).s.push([state, name])
  }

  const cities = execFileSync('unzip', ['-p', join(temporary, names[2]), 'cities500.txt'], {
    encoding: 'utf8', maxBuffer: 100 * 1024 * 1024
  })
  for (const line of cities.split('\n')) {
    if (!line) continue
    const row = line.split('\t')
    const region = regions.get(row[8])
    if (region && (row[2] || row[1])) region.c.push([row[2] || row[1], row[10] || ''])
  }

  await mkdir(outputDir, { recursive: true })
  await writeFile(join(outputDir, 'countries.json'), JSON.stringify(countries))
  for (const [country, region] of regions) {
    region.s.sort((a, b) => a[1].localeCompare(b[1], 'en'))
    region.c.sort((a, b) => a[0].localeCompare(b[0], 'en'))
    await writeFile(join(outputDir, `${country}.json`), JSON.stringify(region))
  }
  console.log(`GeoNames: ${countries.length} countries, ${[...regions.values()].reduce((sum, region) => sum + region.c.length, 0)} cities`)
} finally {
  await rm(temporary, { recursive: true, force: true })
}
