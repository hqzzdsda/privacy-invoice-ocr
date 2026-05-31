// ==========================================
// 🖼️ 图像预处理
// 步进式 50% 降采样 + 白底填充，避免大图直接缩放失真
// ==========================================

/**
 * 对图片进行步进式缩放，适配模型输入尺寸
 * 超过 maxSide 的图片通过多次 50% 降采样，再一次性缩放到目标尺寸
 * 比直接缩放质量高得多
 *
 * @param {HTMLImageElement} imageEl - 原始图片元素
 * @param {number} maxSide - 最大边长，默认 2048
 * @returns {HTMLCanvasElement} 缩放后的画布
 */
export function resizeForModel(imageEl, maxSide = 2048) {
  let width = imageEl.naturalWidth || imageEl.width;
  let height = imageEl.naturalHeight || imageEl.height;

  // 小图直接输出，不缩放
  if (Math.max(width, height) <= maxSide) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(imageEl, 0, 0, width, height);
    return canvas;
  }

  // 大图：先逐步 50% 降采样，再一次性缩放到目标
  const ratio = maxSide / Math.max(width, height);
  const targetW = Math.round(width * ratio);
  const targetH = Math.round(height * ratio);

  const offCanvas = document.createElement('canvas');
  const offCtx = offCanvas.getContext('2d');
  offCanvas.width = width;
  offCanvas.height = height;
  offCtx.fillStyle = '#ffffff';
  offCtx.fillRect(0, 0, width, height);
  offCtx.drawImage(imageEl, 0, 0, width, height);

  let curW = width;
  let curH = height;
  while (curW * 0.5 > targetW) {
    curW = Math.floor(curW * 0.5);
    curH = Math.floor(curH * 0.5);
    offCtx.drawImage(offCanvas, 0, 0, curW * 2, curH * 2, 0, 0, curW, curH);
  }

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetW;
  finalCanvas.height = targetH;
  const finalCtx = finalCanvas.getContext('2d');
  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = 'high';
  finalCtx.drawImage(offCanvas, 0, 0, curW, curH, 0, 0, targetW, targetH);

  return finalCanvas;
}

/**
 * 从 File 对象加载为 Image 元素
 * 同时更新预览区
 *
 * @param {File} file - 用户上传的图片文件
 * @param {HTMLImageElement} [previewEl] - 预览 img 元素
 * @param {HTMLElement} [placeholderEl] - 占位提示元素
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(file, previewEl, placeholderEl) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      if (previewEl) {
        previewEl.src = url;
        previewEl.style.display = 'block';
      }
      if (placeholderEl) {
        placeholderEl.style.display = 'none';
      }
      resolve(img);
    };
    img.onerror = reject;
  });
}
