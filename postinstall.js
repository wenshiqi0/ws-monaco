// FIX ME
const { readFileSync, appendFileSync } = require('fs');

const noAbridge = process.env.NO_ABRIDGE || 0;

if (!noAbridge) {
  const abridgeTypesPath = require.resolve('antbridge/lib.abridge.d.ts');
  const typescriptEs6 = require.resolve('typescript/lib/lib.es6.d.ts');
  const abridgeTypesText = readFileSync(abridgeTypesPath).toString('utf-8');
  
  appendFileSync(typescriptEs6, abridgeTypesText);
}
