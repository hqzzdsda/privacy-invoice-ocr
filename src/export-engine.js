// ==========================================
// 📥 零依赖原生 CSV 导出引擎
// 带 BOM 头的 UTF-8 CSV，Excel 直接打开不乱码
// ==========================================

/** CSV 表头顺序 */
const DEFAULT_HEADERS = [
  '原文件名',
  '发票号码',
  '税务局',
  '开票日期',
  '购买方',
  '销售方',
  '销售方税号',
  '价税合计',
];

/**
 * 生成带 BOM 头的 CSV 字符串
 *
 * @param {Object[]} dataArray - 结构化发票数据数组
 * @param {string[]} [headers=DEFAULT_HEADERS] - 表头列名
 * @returns {string} CSV 文本
 */
export function generateCSV(dataArray, headers = DEFAULT_HEADERS) {
  if (!dataArray || dataArray.length === 0) return '';

  let csvContent = headers.join(',') + '\n';

  for (const data of dataArray) {
    const row = headers.map(header => {
      let cell = data[header] || '';
      // CSV 规范：转义内部双引号，并用双引号包裹每个单元格
      cell = cell.toString().replace(/"/g, '""');
      return `"${cell}"`;
    });
    csvContent += row.join(',') + '\n';
  }

  return csvContent;
}

/**
 * 下载 CSV 文件到本地
 * 在文本最前面加上 ﻿ (BOM 头)，确保 Excel 打开中文不乱码
 *
 * @param {Object[]} dataArray - 结构化发票数据数组
 * @param {string} [filename='智能发票提取结果.csv']
 */
export function downloadCSV(dataArray, filename = '智能发票提取结果.csv') {
  const csvContent = generateCSV(dataArray, DEFAULT_HEADERS);
  if (!csvContent) return;

  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
