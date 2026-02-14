/**
 * 直接测试 MiniMax 国际站 Key 是否可用（不经过 server）
 * 用法：node check-minimax-key.js
 * 可选：set MINIMAX_GROUP_ID=xxx 再运行
 */
const axios = require('axios');

const KEY = process.env.MINIMAX_API_KEY || 'sk-api-9IZwGCpwGe575TI1PXk-K5428U39FJKZWvf5yNk7dvDUE58bUU4_Mxwvj7q7QXa92jSP9DYuKU7CacN7t1M7H3rhhca2KsBJHea0gbl3veSjvEoQYGabVpA';
const GROUP_ID = (process.env.MINIMAX_GROUP_ID || '').trim();
const BASE = 'https://api.minimax.io/v1/text/chatcompletion_v2';  // 国际站 minimax.io
const URL = GROUP_ID ? `${BASE}?GroupId=${encodeURIComponent(GROUP_ID)}` : BASE;

const MINI_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function main() {
  console.log('Key 前15位:', KEY.slice(0, 15) + '...');
  if (GROUP_ID) console.log('GroupId:', GROUP_ID);
  console.log('请求 URL:', URL);
  console.log('');

  try {
    const res = await axios.post(URL, {
      model: 'MiniMax-Text-01',
      messages: [
        { role: 'user', content: [{ type: 'text', text: '说「成功」' }] }
      ],
      temperature: 0.1,
      max_tokens: 64
    }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY.trim()}` }
    });
    const baseResp = res.data?.base_resp;
    if (baseResp && baseResp.status_code !== 0) {
      console.log('MiniMax 业务错误:', baseResp.status_code, baseResp.status_msg);
      console.log('完整 base_resp:', JSON.stringify(baseResp, null, 2));
      process.exit(1);
    }
    console.log('✅ 鉴权成功，文本接口正常');
    // 再测带图（按量付费才支持）
    const res2 = await axios.post(URL, {
      model: 'MiniMax-Text-01',
      messages: [
        { role: 'user', content: [{ type: 'text', text: '描述这张图' }, { type: 'image_url', image_url: { url: MINI_PNG } }] }
      ],
      temperature: 0.1,
      max_completion_tokens: 128
    }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY.trim()}` }
    });
    const baseResp2 = res2.data?.base_resp;
    if (baseResp2 && baseResp2.status_code !== 0) {
      console.log('图片接口返回:', baseResp2.status_code, baseResp2.status_msg);
      if (baseResp2.status_code === 1004 || baseResp2.status_code === 2049) {
        console.log('说明：鉴权通过但图片接口需「按量付费」Key，或需传 GroupId。请在控制台「基本信息」查看 Group ID，执行：set MINIMAX_GROUP_ID=你的GroupId 后重试。');
      }
      process.exit(1);
    }
    console.log('✅ 图片接口正常，Key 可用于 OCR');
  } catch (e) {
    console.log('请求异常:', e.response?.status, e.response?.data || e.message);
    if (e.response?.data) console.log('响应体:', JSON.stringify(e.response.data, null, 2));
    if (e.response?.headers?.['trace-id']) console.log('trace_id:', e.response.headers['trace-id']);
    process.exit(1);
  }
}

main();
