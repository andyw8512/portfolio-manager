/**
 * 持仓整理工具 - OCR 后端
 * 版本：1.1（v1.0 为稳定基线可回滚）
 * 支持 MiniMax 国际站 / Gemini / OpenAI 三种 OCR 引擎，由前端选择。
 * 部署到公网时由平台设置 PORT，同一服务同时提供 API 与前端页面。
 */
const path = require('path');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3011;

// MiniMax 国际站（需设置环境变量 MINIMAX_API_KEY、MINIMAX_GROUP_ID）
const MINIMAX_BASE = 'https://api.minimax.io/v1/text/chatcompletion_v2';
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || '';
const MINIMAX_GROUP_ID = process.env.MINIMAX_GROUP_ID || '';

// Gemini（需设置环境变量 GEMINI_API_KEY）
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_DEFAULT_KEY = process.env.GEMINI_API_KEY || '';

// OpenAI（需设置环境变量 OPENAI_API_KEY）
const OPENAI_API_BASE = 'https://api.openai.com/v1';
const OPENAI_DEFAULT_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_OCR_MODEL = process.env.OPENAI_OCR_MODEL || 'gpt-4o-mini';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 公网部署：访问根路径即打开工具页，不暴露目录下其他文件
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '持仓整理工具.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'OCR 服务运行中' });
});

// 版本标识：支持 minimax / gemini / openai
app.get('/api/version', (req, res) => {
  res.json({ version: 4, engines: ['minimax', 'gemini', 'openai'] });
});

// 与 image-to-excel 完全相同的提示词（MiniMax）
const OCR_PROMPT = '请识别图片中的全部文字。如果是表格，请按行输出，每行用制表符Tab分隔各列，不要添加表头以外的说明。纯文字则按原文顺序逐行输出。';

/** 表格 OCR 提示词（Gemini / OpenAI 通用），与解析逻辑兼容 */
const TABLE_OCR_PROMPT = `这是一张持仓或表格截图。请把图中的表格文字完整识别出来。
要求：严格按行输出，一行一行，不要合并或省略。同一行的不同列之间用 Tab 或连续空格分隔。表头也要保留，不要用 Markdown 表格符号，只要纯文本。`;

/**
 * 使用 Gemini API 做 OCR（图片 base64 → 识别文本）
 */
// 默认 1.5 Flash（免费额度通常更充足）；2.0 可能无免费额度导致 429
const GEMINI_OCR_MODEL = process.env.GEMINI_OCR_MODEL || 'gemini-1.5-flash-latest';

async function ocrWithGemini(imageBase64, apiKey, mimeType = 'image/png') {
  const key = (apiKey || GEMINI_DEFAULT_KEY).trim();
  if (!key) throw new Error('请设置 Gemini API Key（环境变量 GEMINI_API_KEY 或前端填写）');
  const base64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const model = GEMINI_OCR_MODEL;
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${key}`;
  const body = {
    contents: [{
      parts: [
        { inlineData: { mimeType, data: base64 } },
        { text: TABLE_OCR_PROMPT }
      ]
    }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
  };
  try {
    const res = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
    const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text == null) throw new Error(res.data?.error?.message || 'Gemini 未返回文本');
    return text;
  } catch (e) {
    if (e.response?.status === 429) {
      throw new Error('Gemini 免费额度已用尽或请求过于频繁，请约 1 分钟后再试，或暂时改用「MiniMax 国际站」进行识别。');
    }
    throw e;
  }
}

/**
 * 使用 OpenAI Vision API 做 OCR（gpt-4o-mini，按量付费需先充值）
 */
async function ocrWithOpenAI(imageBase64, apiKey, mimeType = 'image/png') {
  const key = (apiKey || OPENAI_DEFAULT_KEY).trim();
  if (!key) throw new Error('请设置 OpenAI API Key（环境变量 OPENAI_API_KEY 或前端填写）');
  const dataUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:${mimeType};base64,${imageBase64.replace(/^data:image\/\w+;base64,/, '')}`;
  const url = `${OPENAI_API_BASE}/chat/completions`;
  const res = await axios.post(
    url,
    {
      model: OPENAI_OCR_MODEL,
      messages: [
        { role: 'system', content: '你是专业的OCR助手。若是表格，按行输出，每行用制表符Tab分隔各列，不要添加表头以外的说明。' },
        {
          role: 'user',
          content: [
            { type: 'text', text: TABLE_OCR_PROMPT },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]
        }
      ],
      max_tokens: 8192
    },
    {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    }
  );
  const text = res.data?.choices?.[0]?.message?.content;
  if (text == null) throw new Error(res.data?.error?.message || 'OpenAI 未返回文本');
  return text;
}

/**
 * POST /api/ocr
 * body: { image [, provider='minimax'|'gemini'|'openai', apiKey ] }
 * 返回: { success, data: { content: "识别的文字" } }
 */
app.post('/api/ocr', async (req, res) => {
  try {
    const { image, provider = 'minimax', apiKey } = req.body;
    if (!image) return res.status(400).json({ error: '缺少图片数据' });

    if (provider === 'openai') {
      const mimeType = (req.body.mimeType || 'image/png').trim();
      const content = await ocrWithOpenAI(image, apiKey, mimeType);
      return res.json({ success: true, data: { content } });
    }
    if (provider === 'gemini') {
      const mimeType = (req.body.mimeType || 'image/png').trim();
      const content = await ocrWithGemini(image, apiKey, mimeType);
      return res.json({ success: true, data: { content } });
    }

    // MiniMax
    let dataUrl = image;
    if (!image.startsWith('data:')) dataUrl = `data:image/png;base64,${image}`;
    const key = MINIMAX_API_KEY.trim();
    const groupId = (MINIMAX_GROUP_ID || '').trim();
    const url = groupId ? `${MINIMAX_BASE}?GroupId=${encodeURIComponent(groupId)}` : MINIMAX_BASE;

    const mmRes = await axios.post(
      url,
      {
        model: 'MiniMax-Text-01',
        messages: [
          { role: 'system', content: '你是专业的OCR助手，请准确识别图片中的全部文字。若是表格，按行输出，每行用制表符Tab分隔各列。' },
          {
            role: 'user',
            content: [
              { type: 'text', text: OCR_PROMPT },
              { type: 'image_url', image_url: { url: dataUrl } }
            ]
          }
        ],
        temperature: 0.1,
        max_completion_tokens: 8192
      },
      {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );

    const baseResp = mmRes.data?.base_resp;
    if (baseResp && baseResp.status_code !== 0) {
      const rawMsg = baseResp.status_msg || `MiniMax 错误: ${baseResp.status_code}`;
      console.error('MiniMax 返回:', baseResp.status_code, rawMsg);
      let msg = rawMsg;
      if (baseResp.status_code === 1008) msg += '。请检查账户余额';
      else if (baseResp.status_code === 1004 || baseResp.status_code === 2049) {
        msg = rawMsg + '。请确认：1) 在 platform.minimax.io（国际站）使用「接口密钥-创建新的API Key」申请「按量付费」Key；2) 账户有余额；3) 若刚换 Key 需重启 node server.js。可尝试设置环境变量 MINIMAX_GROUP_ID（控制台-基本信息）。';
      }
      throw new Error(msg);
    }
    const content = mmRes.data?.choices?.[0]?.message?.content || '';
    return res.json({ success: true, data: { content } });
  } catch (e) {
    const raw = e.response?.data;
    console.error('OCR 失败:', raw || e.message);
    let msg = raw?.base_resp?.status_msg || raw?.error?.message || e.message || 'OCR 识别失败';
    if (raw?.base_resp) msg = raw.base_resp.status_msg + (raw.base_resp.status_code === 1008 ? '。请检查账户余额' : '');
    if (/invalid|鉴权|1004|2049/i.test(String(msg)) && !msg.includes('按量付费')) {
      msg = msg + '。请确认使用 platform.minimax.io（国际站）「按量付费」Key；若刚换过 Key 需重启 node server.js。';
    }
    res.status(e.response?.status || 500).json({ success: false, error: msg });
  }
});

app.listen(PORT, () => {
  const mmHint = MINIMAX_API_KEY ? MINIMAX_API_KEY.slice(0, 12) + '...' : '(未设置)';
  const gemHint = GEMINI_DEFAULT_KEY ? GEMINI_DEFAULT_KEY.slice(0, 12) + '...' : '(未设置，可选)';
  const oaiHint = OPENAI_DEFAULT_KEY ? OPENAI_DEFAULT_KEY.slice(0, 12) + '...' : '(未设置，可选)';
  console.log(`========================================`);
  console.log(`  OCR 服务已启动（MiniMax / Gemini / OpenAI）`);
  console.log(`  端口: ${PORT}`);
  console.log(`  MiniMax Key: ${mmHint}`);
  console.log(`  Gemini Key:  ${gemHint}`);
  console.log(`  OpenAI Key:  ${oaiHint}`);
  console.log(`  http://localhost:${PORT}/health`);
  console.log(`  http://localhost:${PORT}/api/ocr`);
  console.log(`========================================`);
});
