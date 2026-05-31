// ==========================================
// 🚀 Privacy Invoice OCR — 启动入口
// 纯本地发票 OCR 批量工作台
// ==========================================

import '@paddlejs/paddlejs-backend-webgl';
import './network-interceptor.js';
import { initEngine } from './ui-controller.js';

initEngine();
