// ==========================================
// 🧠 发票正则解析引擎
// 从 OCR 文本行中提取 7 个结构化字段
// 高容错设计：处理全角/半角混用、OCR 乱码、格式偏移
// ==========================================

/** 中国 36 个省级税务局白名单 */
const VALID_BUREAUS = [
  '北京市', '天津市', '上海市', '重庆市',
  '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省',
  '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省',
  '河南省', '湖北省', '湖南省', '广东省', '海南省',
  '四川省', '贵州省', '云南省', '陕西省', '甘肃省', '青海省',
  '内蒙古自治区', '广西壮族自治区', '西藏自治区', '宁夏回族自治区', '新疆维吾尔自治区',
  '大连市', '青岛市', '宁波市', '厦门市', '深圳市',
].join('|');

/**
 * 从 OCR 识别的文本行中提取发票结构化字段
 *
 * @param {string[]} textLines - OCR 返回的文本行数组
 * @returns {{ 发票号码: string, 开票日期: string, 购买方: string, 销售方: string, 销售方税号: string, 价税合计: string, 税务局: string }}
 */
export function parseInvoice(textLines) {
  const fullText = textLines.join('\n').replace(/：/g, ':');
  const noSpaceText = fullText.replace(/\s+/g, '');

  const result = {
    发票号码: '',
    开票日期: '',
    购买方: '',
    销售方: '',
    销售方税号: '',
    价税合计: '',
    税务局: '',
  };

  // 1. 税务局 — 白名单匹配，容忍 0-4 个 OCR 乱码字符
  const bureauRegex = new RegExp(`(国家税务总局)?.{0,4}?(${VALID_BUREAUS})税务`);
  const bureauMatch = noSpaceText.match(bureauRegex);
  if (bureauMatch) {
    result.税务局 = `国家税务总局${bureauMatch[2]}税务局`;
  }

  // 2. 发票号码 — 优先匹配 "号码/NO" 后 8-20 位数字
  const numMatch = noSpaceText.match(/(?:号码|NO).*?(\d{8,20})/i);
  if (numMatch) {
    result.发票号码 = numMatch[1];
  } else {
    // 兜底：匹配常见发票代码前缀 + 18 位数字
    const fallback = noSpaceText.match(/(?:01|04|08|26|23)\d{18}/);
    if (fallback) result.发票号码 = fallback[0];
  }

  // 3. 开票日期 — YYYY年MM月DD日 格式
  const dateMatch = fullText.match(/20\d{2}年\d{1,2}月\d{1,2}日/);
  if (dateMatch) {
    result.开票日期 = dateMatch[0];
  }

  // 4. 购买方 / 销售方 — "称:" 后的公司名
  const nameRegex = /称[:;]*\s*([一-龥]+(?:（个人）|\(个人\)|[a-zA-Z0-9]+)?(?:有限公司|旅行社|公司|厂|部|集团)?)/g;
  const names = [];
  let nameMatch;
  while ((nameMatch = nameRegex.exec(fullText)) !== null) {
    const cleanName = nameMatch[1].trim();
    if (cleanName.length > 1 && !/明细|系统|清单|发票/.test(cleanName)) {
      names.push(cleanName);
    }
  }
  const uniqueNames = [...new Set(names)];
  if (uniqueNames.length > 0) {
    result.购买方 = uniqueNames[0];
    if (uniqueNames.length > 1) {
      result.销售方 = uniqueNames[uniqueNames.length - 1];
    }
  }

  // 5. 销售方税号 — 15-20 位大写字母数字
  const taxRegex = /(?:代码|识别号|税号|号)[:;]*\s*([A-Z0-9]{15,20})/g;
  const taxes = [];
  let taxMatch;
  while ((taxMatch = taxRegex.exec(fullText)) !== null) {
    taxes.push(taxMatch[1]);
  }
  if (taxes.length > 0) {
    result.销售方税号 = taxes[taxes.length - 1];
  } else {
    // 兜底：以 9 开头的 18 位纳税人识别号
    const fallbackTax = noSpaceText.match(/9[A-Z0-9]{17}/g);
    if (fallbackTax) {
      result.销售方税号 = fallbackTax[fallbackTax.length - 1];
    }
  }

  // 6. 价税合计 — 取文本中最大金额
  const moneyMatch = fullText.match(/[¥￥Y]?\s*(\d{1,8}\.\d{2})/g);
  if (moneyMatch) {
    const amounts = moneyMatch
      .map(v => parseFloat(v.replace(/[^\d.]/g, '')))
      .sort((a, b) => b - a);
    result.价税合计 = amounts[0].toFixed(2);
  }

  return result;
}
