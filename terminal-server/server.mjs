import { exec } from 'child_process';
import WebSocket from 'ws';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const server = new WebSocket.Server({ port: 9000 }, () => console.log('Server running'));

server.on('connection', async socket => {
  console.log('Client connected');

  const shell = exec('bash', { cwd: resolve(__dirname, '../apollo-demo') });
  shell.once('close', () => console.log('Shell closed\n'));

  socket.on('message', message => {
    console.log('Received message', JSON.stringify(message));
    shell.stdin.write(message);
  });

  socket.once('close', () => {
    console.log('Client disconnected');
    shell.kill();
  });

  await Promise.race([handleStdout(), handleStderr()]);
  console.log('Shell connection lost');

  async function handleStdout() {
    for await (const data of shell.stdout) {
      console.log('Received stdout', JSON.stringify(data));
      socket.send(JSON.stringify({ data, type: 'stdout' }));
    }
  }

  async function handleStderr() {
    for await (const data of shell.stderr) {
      console.log('Received stderr', JSON.stringify(data));
      socket.send(JSON.stringify({ data, type: 'stderr' }));
    }
  }
});
