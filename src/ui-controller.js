// ==========================================
// 🎮 UI 控制器
// DOM 交互、批量队列处理、状态管理与事件绑定
// ==========================================

import * as ocr from '@paddlejs-models/ocr';
import { resizeForModel, loadImage } from './image-processor.js';
import { parseInvoice } from './invoice-parser.js';
import { downloadCSV } from './export-engine.js';

// ── DOM 引用 ──────────────────────────────
const statusBadge = document.getElementById('status-badge');
const uploadInput = document.getElementById('upload');
const uploadLabel = document.getElementById('upload-label');
const previewEl = document.getElementById('preview');
const placeholderEl = document.getElementById('preview-placeholder');
const fieldsContainer = document.getElementById('fields-container');
const exportBtn = document.getElementById('export-btn');
const progressBox = document.getElementById('progress-box');
const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('progress-fill');
const fileListEl = document.getElementById('file-list');

// ── 全局状态 ──────────────────────────────
/** 所有处理完毕的发票数据 */
let globalProcessedData = [];

// ── 引擎初始化 ────────────────────────────

export async function initEngine() {
  try {
    await ocr.init();
    statusBadge.innerText = '✅ 引擎就绪 (纯本地)';
    statusBadge.style.backgroundColor = '#10b981';
    uploadInput.disabled = false;
    uploadLabel.style.opacity = '1';
    uploadLabel.style.cursor = 'pointer';
  } catch (error) {
    statusBadge.innerText = '❌ 初始化失败';
    statusBadge.style.backgroundColor = '#ef4444';
    console.error(error);
  }
}

// ── 字段卡片渲染 ──────────────────────────

/**
 * 动态渲染右侧独立输入框
 * @param {Object} dataObj - 解析后的发票字段
 * @param {string} fileName - 当前文件名
 */
function renderFields(dataObj, fileName) {
  fieldsContainer.innerHTML = '';

  const fileLabel = document.createElement('div');
  fileLabel.style.gridColumn = '1 / -1';
  fileLabel.style.fontSize = '12px';
  fileLabel.style.color = '#3b82f6';
  fileLabel.innerText = `📄 当前显示: ${fileName}`;
  fieldsContainer.appendChild(fileLabel);

  for (const [key, value] of Object.entries(dataObj)) {
    const card = document.createElement('div');
    card.className = 'field-card';
    card.innerHTML = `
      <div class="field-label">${key}</div>
      <input type="text" class="field-value" data-key="${key}" value="${value || ''}" placeholder="未识别到...">
    `;
    fieldsContainer.appendChild(card);
  }
}

// ── 批量上传处理 ──────────────────────────

uploadInput.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  // 初始化状态
  globalProcessedData = [];
  exportBtn.disabled = true;
  exportBtn.style.opacity = '0.5';
  progressBox.style.display = 'block';
  fileListEl.innerText = `排队中：共 ${files.length} 个文件...`;

  // 顺序队列处理
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    progressText.innerText = `正在处理 (${i + 1}/${files.length}): ${file.name}`;
    progressFill.style.width = `${(i / files.length) * 100}%`;

    try {
      // 1. 加载并显示图片
      const imgEl = await loadImage(file, previewEl, placeholderEl);

      // 2. 预处理压缩
      const processCanvas = resizeForModel(imgEl, 2048);
      const tempImg = new Image();
      tempImg.src = processCanvas.toDataURL('image/jpeg', 0.9);
      await new Promise(r => { tempImg.onload = r; });

      // 3. OCR 识别
      const res = await ocr.recognize(tempImg);

      // 4. 解析结构数据
      let parsedData = {};
      if (res && res.text && res.text.length > 0) {
        parsedData = parseInvoice(res.text);
      }
      parsedData['原文件名'] = file.name;

      // 存入全局库
      globalProcessedData.push(parsedData);

      // 实时渲染当前结果
      renderFields(parsedData, file.name);

    } catch (error) {
      console.error(`文件 ${file.name} 处理失败:`, error);
    }
  }

  // 全部完成
  progressFill.style.width = '100%';
  progressText.innerText = `✅ 全部处理完毕！共处理 ${files.length} 张发票。`;
  progressText.style.color = '#10b981';
  exportBtn.disabled = false;
  exportBtn.style.opacity = '1';
});

// ── CSV 导出 ──────────────────────────────

exportBtn.addEventListener('click', () => {
  if (globalProcessedData.length === 0) return;

  // 同步用户手动修改过的字段
  const currentInputs = fieldsContainer.querySelectorAll('.field-value');
  if (currentInputs.length > 0 && globalProcessedData.length > 0) {
    const lastData = globalProcessedData[globalProcessedData.length - 1];
    currentInputs.forEach(input => {
      const key = input.getAttribute('data-key');
      lastData[key] = input.value;
    });
  }

  downloadCSV(globalProcessedData);
});
