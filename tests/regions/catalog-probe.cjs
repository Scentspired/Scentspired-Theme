#!/usr/bin/env node
/**
 * Live catalog probe for one region, read from regions/<id>/region.json.
 *   node tests/regions/catalog-probe.cjs <region-id>
 * Read-only: storefront GETs against the region's own store.
 */
const runCatalogProbe = require('./catalog-probe-base.cjs');
const { readRegionFile } = require('../../scripts/region-engine.cjs');

const id = (process.argv[2] || '').toLowerCase();
const region = readRegionFile(id);
if (!region || !region.myshopify_domain) {
  console.error(`\n  ✗ Region "${id}" is unknown or declares no myshopify_domain.\n`);
  process.exit(1);
}

runCatalogProbe({ name: `Scentspired ${region.name || id}`, domain: region.myshopify_domain }).then((ok) =>
  process.exit(ok ? 0 : 1)
);
