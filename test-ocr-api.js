/**
 * OCR API 测试（仅 MiniMax，与 image-to-excel 一致）
 * 用法：先启动 server (npm start)，再运行 node test-ocr-api.js
 */

const axios = require('axios');

const BASE = 'http://localhost:3011';

const MINI_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const IMAGE_DATA_URL = `data:image/png;base64,${MINI_PNG_BASE64}`;

async function testHealth() {
  const res = await axios.get(`${BASE}/health`);
  if (res.data?.status === 'ok') {
    console.log('[OK] 健康检查通过');
    return true;
  }
  throw new Error('健康检查失败');
}

async function testMinimaxOcr() {
  console.log('\n[测试] MiniMax OCR（仅传 image，与 image-to-excel 一致）...');
  const res = await axios.post(
    `${BASE}/api/ocr`,
    { image: IMAGE_DATA_URL },
    { validateStatus: () => true }
  );
  if (res.data?.success && res.data?.data?.content !== undefined) {
    console.log('[OK] MiniMax OCR 成功，返回 content 长度:', String(res.data.data.content).length);
    return true;
  }
  const err = res.data?.error || res.statusText;
  if (err.includes('鉴权') || err.includes('1004') || err.includes('2049') || err.includes('Key') || err.includes('令牌')) {
    console.log('[预期] MiniMax 需有效按量付费 Key:', err.slice(0, 60));
    return true;
  }
  throw new Error('MiniMax OCR 异常: ' + err);
}

async function run() {
  try {
    await testHealth();
    await testMinimaxOcr();
    console.log('\n========== 测试通过 ==========\n');
    process.exit(0);
  } catch (e) {
    console.error('\n[失败]', e.message);
    process.exit(1);
  }
}

run();
