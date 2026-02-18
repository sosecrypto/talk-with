#!/usr/bin/env node

/**
 * n8n Workflow Import Script
 *
 * Reads workflow JSON files from n8n/workflows/ and imports them
 * to n8n via REST API.
 *
 * Usage:
 *   node scripts/n8n-import.mjs                  # Import all workflows
 *   node scripts/n8n-import.mjs --activate        # Import and activate
 *   node scripts/n8n-import.mjs --dry-run         # Validate only (no API calls)
 *
 * Environment variables:
 *   N8N_URL     - n8n instance URL (e.g. http://YOUR_SERVER_IP:5678)
 *   N8N_API_KEY - n8n API key
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const WORKFLOWS_DIR = resolve(import.meta.dirname, '..', 'n8n', 'workflows');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const activate = args.includes('--activate');

const N8N_URL = process.env.N8N_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!dryRun && (!N8N_URL || !N8N_API_KEY)) {
  console.error('Error: N8N_URL and N8N_API_KEY environment variables are required.');
  console.error('Set them in .env.local or export them before running this script.');
  process.exit(1);
}

const baseUrl = N8N_URL?.replace(/\/+$/, '');

async function apiRequest(method, path, body) {
  const url = `${baseUrl}/api/v1${path}`;
  const options = {
    method,
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${method} ${path} failed (${response.status}): ${text}`);
  }
  return response.json();
}

function loadWorkflows() {
  const files = readdirSync(WORKFLOWS_DIR)
    .filter(f => f.endsWith('.json'))
    .sort();

  const workflows = [];
  for (const file of files) {
    const filePath = join(WORKFLOWS_DIR, file);
    const content = readFileSync(filePath, 'utf-8');

    try {
      const workflow = JSON.parse(content);
      workflows.push({ file, workflow });
      console.log(`  [OK] ${file} - "${workflow.name}" (${workflow.nodes?.length || 0} nodes)`);
    } catch (err) {
      console.error(`  [FAIL] ${file} - Invalid JSON: ${err.message}`);
      process.exit(1);
    }
  }

  return workflows;
}

async function importWorkflow(workflow, fileName) {
  const created = await apiRequest('POST', '/workflows', {
    name: workflow.name,
    nodes: workflow.nodes,
    connections: workflow.connections,
    settings: workflow.settings,
    tags: workflow.tags,
  });

  console.log(`  [IMPORTED] ${fileName} -> ID: ${created.id}`);

  if (activate) {
    await apiRequest('PATCH', `/workflows/${created.id}`, { active: true });
    console.log(`  [ACTIVATED] ${created.id}`);
  }

  return created;
}

async function main() {
  console.log('=== n8n Workflow Import ===\n');

  if (dryRun) {
    console.log('Mode: DRY RUN (validation only)\n');
  } else if (activate) {
    console.log('Mode: IMPORT + ACTIVATE\n');
  } else {
    console.log('Mode: IMPORT (inactive)\n');
  }

  console.log(`Workflows directory: ${WORKFLOWS_DIR}\n`);
  console.log('Loading workflows...');

  const workflows = loadWorkflows();

  if (workflows.length === 0) {
    console.log('\nNo workflow files found.');
    return;
  }

  console.log(`\nFound ${workflows.length} workflow(s).`);

  if (dryRun) {
    console.log('\nDry run complete. All workflow JSON files are valid.');
    return;
  }

  console.log(`\nTarget: ${baseUrl}`);
  console.log('Importing...\n');

  let successCount = 0;
  let failCount = 0;

  for (const { file, workflow } of workflows) {
    try {
      await importWorkflow(workflow, file);
      successCount++;
    } catch (err) {
      console.error(`  [ERROR] ${file}: ${err.message}`);
      failCount++;
    }
  }

  console.log(`\n=== Results ===`);
  console.log(`Imported: ${successCount}`);
  console.log(`Failed: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  }

  if (!activate) {
    console.log('\nTip: Workflows are imported as inactive.');
    console.log('Use --activate flag to auto-activate, or activate them in the n8n UI.');
  }

  console.log('\nDone!');
}

main().catch(err => {
  console.error(`\nFatal error: ${err.message}`);
  process.exit(1);
});
