#!/usr/bin/env node
const runCatalogProbe = require('../common/catalog-probe-base.cjs');

runCatalogProbe({
  name: 'Scentspired UK',
  domain: 'scentspireduk.myshopify.com'
}).then(success => {
  process.exit(success ? 0 : 1);
});
