#!/usr/bin/env node
const runCatalogProbe = require('../common/catalog-probe-base.cjs');

// Regional catalog probe: scentspiredae.myshopify.com
runCatalogProbe({
  name: 'Scentspired UAE',
  domain: 'scentspiredae.myshopify.com'
}).then(success => {
  process.exit(success ? 0 : 1);
});
