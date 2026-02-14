# OpenAI API Key 设置与充值说明

本项目的 OCR 已支持 **OpenAI（GPT-4o mini）** 引擎。使用前需要：**注册/登录 OpenAI 账号 → 充值（预付费）→ 创建 API Key → 在本工具中填写 Key**。

---

## 一、如何设置 OpenAI API Key

### 1. 获取 API Key

1. 打开 **OpenAI 平台**：<https://platform.openai.com>  
2. 使用 Google / 微软 / 苹果 等登录或注册（国内需可访问该域名的网络环境）。  
3. 进入 **API keys** 页面：<https://platform.openai.com/api-keys>  
4. 点击 **「Create new secret key」**，给 Key 起个名字（如「持仓工具OCR」），创建后**复制并保存**（只显示一次）。

### 2. 在本工具中使用 Key

**方式 A：前端填写（推荐）**

- 打开持仓整理工具页面，在「OCR 引擎」下拉框选择 **「OpenAI (GPT-4o mini)”**。
- 在出现的 **「OpenAI API Key」** 输入框中粘贴你的 Key（`sk-...`）。
- 上传截图后点击「开始计算」或「截图转 Excel」即可用 OpenAI 做识别。

**方式 B：后端默认 Key**

- 在运行 `node server.js` 的终端所在机器上设置环境变量：  
  **Windows（PowerShell）**：`$env:OPENAI_API_KEY="sk-你的Key"`  
  **Mac/Linux**：`export OPENAI_API_KEY="sk-你的Key"`  
- 然后执行：`node server.js`  
- 前端选择 OpenAI 时可不填 Key，将使用该环境变量。

---

## 二、如何充值（OpenAI 为预付费）

自 2024 年起，OpenAI API 已改为**预付费**：需先往账户充值，才能正常调用 API。

### 1. 进入充值 / 账单页

- 打开：<https://platform.openai.com/account/billing/overview>  
- 或：平台右上角头像 → **Billing** / **Usage**。

### 2. 添加付款方式（绑卡）

- 点击 **「Add payment details」** 或「添加付款方式」。
- 填写：
  - 信用卡号、有效期、CVV、持卡人姓名
  - 账单地址（需与银行登记一致；国内用户常用可支持国际支付的卡或虚拟卡）
- **国内用户**：若无法直接使用国内信用卡，可考虑：
  - 支持国际支付的 **双币/多币种信用卡**，或
  - 合规的 **虚拟信用卡** 服务（如部分海外虚拟卡），并确保可向 OpenAI 扣款。
- 绑卡时可能会有一笔小额验证扣款（如 1 美元），通常稍后会退回。

### 3. 充值金额

- 绑卡后，在 Billing 页面选择 **「Add to credit balance」** 或「充值」。
- **最低充值**：一般为 **5 美元**，也有更高档位（如 10、20、50 美元等）。
- 充值的金额会进入 **Credit balance**，按 API 用量从余额中扣除。
- 可设置 **自动充值**：当余额低于某金额时自动充值指定金额（如低于 5 美元时自动充 10 美元）。

### 4. 注意事项

- 充值金额有**有效期**（例如 12 个月），过期未用完的余额可能失效，具体以平台说明为准。
- 若 Key 报错 **insufficient_quota** 或 **You exceeded your current quota**，通常是**余额为 0 或未绑卡/未充值**，请先完成绑卡并充值后再试。

---

## 三、费用参考（OCR 场景）

- 本工具使用 **gpt-4o-mini** 做 OCR，按 token 计费（输入+输出）。
- 单次截图识别通常消耗 token 不多，费用很低（约几分钱人民币量级）。
- 最新价格以官网为准：<https://openai.com/api/pricing>  
  - 可搜索 **gpt-4o-mini** 查看当前输入/输出单价。

---

## 四、本项目中的配置小结

| 项目       | 说明 |
|------------|------|
| 环境变量   | `OPENAI_API_KEY`：可选，作为后端默认 Key。 |
| 前端输入框 | 选择「OpenAI (GPT-4o mini)」后出现，可填 Key，优先于环境变量。 |
| 模型       | 默认 `gpt-4o-mini`，可通过环境变量 `OPENAI_OCR_MODEL` 修改（如 `gpt-4o`）。 |

完成「注册 → 绑卡 → 充值 → 创建 API Key → 在本工具填写 Key」后，即可稳定使用 OpenAI 进行 OCR 识别。
