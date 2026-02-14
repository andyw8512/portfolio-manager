# MiniMax 国际站 Key 说明

**国际站域名**：**minimax.io**（不是 .com）  
- 控制台：https://platform.minimax.io  
- API 基地址：https://api.minimax.io  
参考：[MiniMax M2.5](https://www.minimax.io/news/minimax-m25)、[文本接口文档](https://platform.minimax.io/docs/api-reference/text-post)

## 1. 确认平台与 Key 来源

- 必须使用 **https://platform.minimax.io**（国际站）登录。
- 在 **接口密钥 → 创建新的 API Key** 里创建「按量付费」Key（不要用 Coding Plan Key）。

## 2. 重新生成并替换 Key

1. 登录 [platform.minimax.io](https://platform.minimax.io)（国际站）→ **接口密钥**。
2. 若当前 Key 已不用，可删除或停用；点击 **创建新的 API Key**，类型选 **按量付费**。
3. 创建后**完整复制**新 Key（不要多空格、少字符），替换到本项目的 `server.js` 里 `MINIMAX_API_KEY` 的默认值，或设置环境变量：
   ```powershell
   $env:MINIMAX_API_KEY = "粘贴你的新Key"
   node server.js
   ```
4. 重启 `node server.js` 后再试。

## 3. 尝试传 GroupId（若控制台有）

部分账号需同时传 **GroupId**：

1. 在 platform.minimax.io 打开 **账户管理 / 基本信息**（或 接口密钥 页面附近）。
2. 若看到 **Group ID** 或 **群组 ID**，复制其值。
3. 启动时传入环境变量再启动：
   ```powershell
   $env:MINIMAX_GROUP_ID = "你的GroupId"
   $env:MINIMAX_API_KEY = "你的Key"
   node server.js
   ```
4. 或在 `server.js` 里把 `MINIMAX_GROUP_ID` 默认值设为该 ID 后重启。

## 4. 确认账户与余额

- 在 [platform.minimax.io](https://platform.minimax.io) **账户管理 → 余额**：确保有余额且未欠费。
- 若从未充值，先完成充值后再调用接口。

## 5. 本地验证 Key

在项目目录执行：

```bash
node check-minimax-key.js
```

- 若提示「鉴权成功」「图片接口正常」，说明 Key 和 GroupId（如有）正确，可正常用 OCR。
- 若仍报 2049，请把终端里**完整输出**（含 `base_resp`）发给 MiniMax 支持（api@minimaxi.com）或根据控制台提示排查。

## 6. 当前项目使用的接口

- 地址：`https://api.minimax.io/v1/text/chatcompletion_v2`（国际站 minimax.io）。
- 认证：`Authorization: Bearer <API_KEY>`，可选 `?GroupId=xxx`。
- Key 须在 **platform.minimax.io** 申请的「按量付费」Key。
