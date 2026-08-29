// Serves e2e/fixtures/<set>/ over HTTP so the app can be pointed at content
// that is not part of the build. Set FIXTURE_SET to choose the directory.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const set = process.env.FIXTURE_SET ?? 'live';
const root = join(process.cwd(), 'e2e/fixtures', set);

createServer(async (request, response) => {
  const name = (request.url ?? '/').split('?')[0].replace(/^\//, '');
  try {
    const body = await readFile(join(root, name), 'utf8');
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(body);
  } catch {
    response.writeHead(404).end('{}');
  }
}).listen(4321, () => console.log(`fixtures: ${root} on 4321`));
