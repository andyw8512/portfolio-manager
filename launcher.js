/**
 * 持仓整理工具 - 桌面启动器
 * 功能：启动 node server.js，等服务就绪后自动打开浏览器访问 http://localhost:3011
 * 使用：将本文件与 server.js、持仓整理工具.html、node_modules 放在同一目录；
 *       或使用 pkg 打包成 exe 后，将 exe 放在该目录，双击 exe 即可。
 */
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const PORT = 3011;
const URL = `http://localhost:${PORT}`;

// 当前程序所在目录：打包成 exe 时为 exe 所在目录，否则为 launcher.js 所在目录
const appDir = path.resolve(typeof process.pkg !== 'undefined' ? path.dirname(process.execPath) : __dirname);

function waitForServer(maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const tick = () => {
      attempts++;
      const req = http.get(`${URL}/health`, (res) => {
        if (res.statusCode === 200) return resolve();
        if (attempts >= maxAttempts) return reject(new Error('服务未就绪'));
        setTimeout(tick, 500);
      });
      req.on('error', () => {
        if (attempts >= maxAttempts) return reject(new Error('服务未就绪'));
        setTimeout(tick, 500);
      });
      req.setTimeout(2000, () => { req.destroy(); });
    };
    tick();
  });
}

function openBrowser() {
  const url = URL;
  const cmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const arg = process.platform === 'win32' ? url : [url];
  spawn(cmd, process.platform === 'win32' ? [url] : arg, { stdio: 'ignore', shell: process.platform === 'win32' });
}

function main() {
  const serverPath = path.join(appDir, 'server.js');
  const node = process.platform === 'win32' ? 'node.exe' : 'node';
  const child = spawn(node, [serverPath], {
    cwd: appDir,
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, PORT: String(PORT) }
  });
  child.unref();

  console.log('正在启动服务…');
  waitForServer()
    .then(() => {
      console.log('服务已就绪，正在打开浏览器…');
      openBrowser();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err.message || err);
      process.exit(1);
    });
}

main();
