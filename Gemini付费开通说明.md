# Gemini API 付费开通与充值说明

本项目使用的 Gemini API 与 **Google AI Studio** 一致。付费与免费**使用同一个 API Key 和接口**，只需在 Google 侧为你的项目**开通计费**，即可自动使用付费额度（更高限额、按量计费）。

---

## 一、如何开通付费（设置计费）

### 方法 A：从 Google AI Studio 进入（推荐）

1. 打开 **Google AI Studio**  
   - 网址：<https://aistudio.google.com>  
   - 使用你当前用来生成 API Key 的 Google 账号登录。

2. 进入 **API Key / 用量与计费**  
   - 点击左侧或顶部 **「Get API key」/「API keys」**，或  
   - 进入 **Dashboard（仪表盘）→ Usage and Billing（用量与计费）→ Billing（计费）**。

3. 为项目开通计费  
   - 找到你正在用的那个项目（和你 API Key 对应的项目）。  
   - 点击 **「Set up Billing」** 或 **「升级 / Upgrade」**。  
   - 会跳转到 **Google Cloud Console** 的计费页面。

4. 在 Google Cloud 完成计费设置  
   - **关联或创建计费账户**：  
     - 若已有 GCP 计费账户，选择并关联到当前项目即可。  
     - 若没有，按页面提示「创建计费账户」。  
   - **添加付款方式**：  
     - 支持 Visa、Mastercard、American Express、部分地区支持 PayPal 等。  
     - 验证时可能会有一笔小额预授权（如 1 美元），通常会在之后退回。  
   - **新用户**：有时会获得约 **300 美元、90 天** 的免费试用额度，用完后才按量扣费。

5. 完成并确认  
   - 回到 AI Studio，确认该项目下已显示「Billing enabled」或类似状态。  
   - **无需更换 API Key**，继续用现有 Key 即可，请求会自动走付费配额。

### 方法 B：从 Google Cloud Console 进入

1. 打开 **Google Cloud Console**：<https://console.cloud.google.com>  
2. 选择与 AI Studio 中 **API Key 所属的同一个项目**。  
3. 左侧菜单：**Billing（计费）→ Link a billing account（关联计费账户）**。  
4. 按提示创建或选择计费账户、添加付款方式，完成关联。

---

## 二、“充值”是什么意思？

Gemini API 是**按量计费（后付费）**，没有“先充值到余额”的必须步骤：

- **开通计费** = 在 GCP 为项目关联计费账户并添加付款方式。  
- 之后 API 产生的费用会**自动从你的付款方式扣款**（通常按月结算）。  
- 若 Google 要求**一次性预付款**（例如 5–50 美元），那是作为**账户信用额度**，用于抵扣后续 API 费用，不是额外手续费。

所以：  
- **你想“用付费 Gemini”** → 按上面「一」完成**开通计费**即可。  
- **没有单独的“Gemini 充值页面”**，只要计费账户里有有效付款方式，就会按用量扣费。

---

## 三、定价参考（以官方为准）

- 官方定价：<https://ai.google.dev/gemini-api/docs/pricing>  
- 常见模型大致为：  
  - **Gemini 1.5 Flash**：输入约 \$0.075/百万 token，输出约 \$0.30/百万 token（仅供参考，请以官网为准）。  
  - 做 OCR 时，主要消耗**输入 token**（图片+文字），单次请求成本通常很低（几分钱量级）。

---

## 四、建议

1. **设置预算提醒**：在 GCP Console → Billing → Budgets & alerts 中设置月度预算和告警，避免意外超支。  
2. **继续用现有 Key**：本项目无需改代码，开通计费后同一 Key 会自动使用付费额度。  
3. **查看用量**：  
   - AI Studio：Dashboard → Usage and Billing  
   - GCP：Billing → Reports

如有新政策或步骤变更，以 Google 官方文档为准：  
- <https://ai.google.dev/gemini-api/docs/billing>
