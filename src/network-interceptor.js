// ==========================================
// 🛡️ 网络拦截器
// 拦截 PaddleJS CDN 请求，重定向到本地模型文件
// 确保 100% 纯本地推理，零网络外传
// ==========================================

const CDN_BASE = 'https://paddlejs.cdn.bcebos.com/models/fuse/ocr';

const MODEL_MAP = {
  'ch_PP-OCRv2_det_fuse_activation': '/models/det',
  'ch_PP-OCRv2_rec_fuse_activation': '/models/rec',
};

const originalFetch = window.fetch;

window.fetch = async function (...args) {
  let url = args[0];

  if (typeof url === 'string' && url.includes('paddlejs.cdn.bcebos.com')) {
    for (const [modelName, localPath] of Object.entries(MODEL_MAP)) {
      if (url.includes(modelName)) {
        url = url.replace(`${CDN_BASE}/${modelName}`, localPath);
        break;
      }
    }
    args[0] = url;
  }

  return originalFetch.apply(this, args);
};
