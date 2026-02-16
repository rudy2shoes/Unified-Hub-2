import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

const OWNER = 'rudy2shoes';
const REPO = 'Unified-Hub-2';

const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.cache', '.config', '.local', '.upm',
  'dist', '.replit', 'attached_assets'
]);

const IGNORE_FILES = new Set([
  'package-lock.json', '.replit', 'github-push.ts'
]);

function getAllFiles(dir: string, baseDir: string = dir): { relativePath: string; fullPath: string }[] {
  const results: { relativePath: string; fullPath: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      results.push(...getAllFiles(fullPath, baseDir));
    } else {
      if (IGNORE_FILES.has(entry.name)) continue;
      if (relativePath === 'server/github-push.ts') continue;
      results.push({ relativePath, fullPath });
    }
  }
  return results;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function apiCall(url: string, options: RequestInit, headers: any): Promise<any> {
  const res = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  console.log('Getting GitHub client...');
  const accessToken = await getAccessToken();

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const apiBase = `https://api.github.com/repos/${OWNER}/${REPO}`;

  console.log(`Pushing code to ${OWNER}/${REPO}...`);

  // Verify repo exists
  await apiCall(apiBase, {}, headers);
  console.log('Repository found.');

  // Get existing files in the repo to get their SHAs (needed for updating)
  const existingShas: Record<string, string> = {};
  async function getExistingFiles(repoPath: string = '') {
    try {
      const url = repoPath 
        ? `${apiBase}/contents/${repoPath}` 
        : `${apiBase}/contents`;
      const data = await apiCall(url, {}, headers);
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.type === 'file') {
            existingShas[item.path] = item.sha;
          } else if (item.type === 'dir') {
            await getExistingFiles(item.path);
          }
        }
      }
    } catch (e) {
      // Directory doesn't exist yet, that's fine
    }
  }

  console.log('Getting existing file SHAs...');
  await getExistingFiles();
  console.log(`Found ${Object.keys(existingShas).length} existing files.`);

  // Collect all local files
  const files = getAllFiles('/home/runner/workspace');
  console.log(`Found ${files.length} local files to push.`);

  // Upload files one at a time using Contents API
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const content = fs.readFileSync(file.fullPath).toString('base64');
        
        const body: any = {
          message: `Add ${file.relativePath}`,
          content,
        };

        // If file already exists, include its SHA
        if (existingShas[file.relativePath]) {
          body.sha = existingShas[file.relativePath];
          body.message = `Update ${file.relativePath}`;
        }

        await apiCall(
          `${apiBase}/contents/${file.relativePath}`,
          { method: 'PUT', body: JSON.stringify(body) },
          headers
        );

        successCount++;
        break;
      } catch (err: any) {
        if (attempt < 2) {
          // If we get a conflict (file exists but we don't have SHA), get the SHA
          if (err.message.includes('422') || err.message.includes('409')) {
            try {
              const fileData = await apiCall(
                `${apiBase}/contents/${file.relativePath}`,
                {},
                headers
              );
              existingShas[file.relativePath] = fileData.sha;
            } catch (e) {}
          }
          await sleep(1000 * (attempt + 1));
          continue;
        }
        errorCount++;
        console.error(`Failed: ${file.relativePath}: ${err.message.substring(0, 100)}`);
      }
    }

    if ((i + 1) % 10 === 0 || i === files.length - 1) {
      console.log(`Progress: ${i + 1}/${files.length} (${successCount} ok, ${errorCount} failed)`);
    }

    // Small delay to avoid rate limiting
    if (i % 5 === 4) {
      await sleep(500);
    }
  }

  console.log(`\nDone! ${successCount}/${files.length} files pushed successfully.`);

  if (successCount > 0) {
    console.log(`\nCode available at: https://github.com/${OWNER}/${REPO}`);

    // Create release
    console.log('\nCreating v1.0.0 release...');
    try {
      // Get latest commit SHA
      const refData = await apiCall(`${apiBase}/git/ref/heads/main`, {}, headers);
      const commitSha = refData.object.sha;

      // Delete existing release/tag
      try {
        const releaseData = await apiCall(`${apiBase}/releases/tags/v1.0.0`, {}, headers);
        await fetch(`${apiBase}/releases/${releaseData.id}`, { method: 'DELETE', headers });
      } catch (e) {}
      try {
        await fetch(`${apiBase}/git/refs/tags/v1.0.0`, { method: 'DELETE', headers });
      } catch (e) {}
      await sleep(1000);

      const release = await apiCall(`${apiBase}/releases`, {
        method: 'POST',
        body: JSON.stringify({
          tag_name: 'v1.0.0',
          target_commitish: 'main',
          name: 'HUB v1.0.0 - Unified Workspace',
          body: `## HUB v1.0.0\n\nThe first release of HUB - your unified workspace dashboard.\n\n### Features\n- Access all your business apps from one dashboard\n- Dark/light theme with customizable backgrounds\n- Focus Mode for distraction-free work\n- Agency Mode for managing multiple client workspaces\n- Persistent login sessions in desktop app\n- Drag-and-drop widget dashboard\n\n### Downloads\nDesktop app builds will be available shortly after this release is published.\n- **macOS**: .dmg file\n- **Windows**: .exe installer\n- **Linux**: .AppImage file`,
          draft: false,
          prerelease: false,
        }),
      }, headers);

      console.log(`Release created: ${release.html_url}`);
    } catch (err: any) {
      console.error(`Release error: ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error('Push failed:', err);
  process.exit(1);
});
