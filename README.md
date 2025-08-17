# 🎨 AI Scene Designer

**Create stunning scenes with AI-powered design assistance**

一个基于React + TypeScript的智能场景设计工具，集成双LLM系统，为创作者提供专业的AI设计助手。

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC.svg)

## ✨ 核心特性

### 🧠 双LLM智能系统
- **modeD (Dual)**: 先进的双LLM架构，包含内部逻辑分析模块(LLM-A)和对话渲染模块(LLM-B)
- **modeT (Tradition)**: 传统单AI对话模式，直接交互体验
- **智能状态分析**: S0-S9用户状态识别和12种策略性对话引导

### 🎯 智能工作流程
- **AI优先设计**: 用户先与AI交互完成设计，再解锁手动编辑
- **模块化内容**: 场景、音效、角色设计（当前专注场景设计）
- **实时分析面板**: 显示LLM-A的内部状态、策略和目标引导

### 🎨 现代化界面
- **玻璃态设计**: 半透明背景与模糊效果
- **渐变动画**: 平滑的微动画和过渡效果
- **响应式布局**: 完美适配桌面和移动设备
- **直观状态指示**: 清晰的禁用/启用状态视觉反馈

### ⚙️ 灵活配置
- **多模型支持**: GPT-4.1, GPT-4.1-Mini, GPT-4.1-Nano, GPT-4o
- **自定义提示词**: 分别配置LLM-A、LLM-B和传统模式的系统提示
- **参数调节**: 温度、最大Token数、目标场景等
- **本地存储**: 设置自动保存，无需重复配置

## 🚀 快速开始

### 环境要求
- Node.js 16+ 
- npm 或 yarn
- OpenAI API Key

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/RuoyuWen/CHIProject.git
   cd CHIProject
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **配置API Key**
   - 访问 http://localhost:5173
   - 在设置页面输入您的OpenAI API Key
   - 选择AI模式（modeD/modeT）
   - 配置其他参数后保存

## 🎯 使用指南

### 基础流程
1. **设置配置** → 选择AI模式和模型参数
2. **开始设计** → 点击"AI Design: Scene"进入对话
3. **AI引导** → 与AI交流，完善场景设计理念
4. **确认内容** → 查看AI总结，确认应用到设计区域
5. **手动精修** → 编辑区域解锁，可进一步调整内容
6. **下载作品** → 完成后下载最终设计文件

### modeD (双LLM) 特色
- **智能状态识别**: 自动判断用户当前设计阶段
- **策略性引导**: 根据状态选择最适合的对话策略
- **用户主导感**: 保持用户感觉主控的同时智能收敛
- **实时分析**: 查看AI的内部思考过程

### modeT (传统) 特色
- **直接对话**: 熟悉的聊天体验
- **快速响应**: 单模型处理，响应更快
- **简单配置**: 配置相对简单

## 🔧 技术架构

### 前端技术栈
- **React 18** - 现代化组件开发
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **Tailwind CSS** - 原子化CSS框架
- **Lucide React** - 现代图标库

### AI集成
- **OpenAI API** - GPT模型调用
- **双LLM架构** - LLM-A分析 + LLM-B渲染
- **状态管理** - React Hooks + LocalStorage
- **错误处理** - 完善的API错误处理机制

### 项目结构
```
src/
├── components/          # React组件
│   ├── ChatPanel.tsx   # 聊天面板
│   ├── ContentPanel.tsx # 内容编辑面板
│   ├── SettingsPanel.tsx # 设置页面
│   └── ConfirmDialog.tsx # 确认对话框
├── utils/               # 工具函数
│   ├── openai.ts       # OpenAI API封装
│   └── llmModules.ts   # 双LLM系统逻辑
├── types.ts            # TypeScript类型定义
└── App.tsx             # 主应用组件
```

## 🎨 界面预览

### 设置页面
- 🔑 API Key配置
- 🤖 AI模式选择 (modeD/modeT)
- ⚙️ 高级参数设置
- 🧠 双LLM提示词配置

### 主界面
- 📝 **左侧**: 场景设计编辑区域（AI完成后解锁）
- 💬 **右侧**: AI对话面板
- 🔍 **分析面板**: 双LLM模式下的实时状态分析

## 🚀 部署

### 开发环境
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
```

### 生产部署
项目基于Vite构建，支持部署到：
- Vercel
- Netlify  
- GitHub Pages
- 任何静态托管服务

## 🤝 贡献

欢迎提交Issue和Pull Request！

### 开发规范
- 使用TypeScript进行类型安全开发
- 遵循React Hooks最佳实践
- 保持组件单一职责
- 添加必要的注释和文档

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- OpenAI for providing powerful AI models
- React community for excellent development tools
- Tailwind CSS for beautiful styling system

---

**🎨 开始您的AI辅助设计之旅吧！**

> 如有问题或建议，欢迎提交Issue或联系开发者。