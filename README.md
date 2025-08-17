# AI Content Generator

An AI-powered intelligent content generation interface that supports conversational design for scenes, sound effects, and avatar appearances.

## Features

- **Three Content Modules**: Scene design, sound effect selection, avatar appearance design
- **Intelligent Conversations**: Chat with professional AI assistants to refine your creativity
- **User-Controlled Completion**: Complete designs when you're satisfied with the results
- **Modern UI**: Beautiful interface built with Tailwind CSS
- **Real-time Interaction**: Smooth chat experience with instant feedback

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置API密钥

复制 `.env.example` 文件并重命名为 `.env`：

```bash
copy .env.example .env
```

编辑 `.env` 文件，添加你的OpenAI API密钥：

```env
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

> **获取API密钥**：访问 [OpenAI平台](https://platform.openai.com/api-keys) 创建API密钥

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

## 使用说明

1. **选择模块**：点击左侧任意模块的"开始设计"按钮
2. **对话交流**：在右侧聊天界面描述你的需求和想法
3. **AI辅助**：专业AI助手会帮助你完善和优化设计方案
4. **确认应用**：当AI检测到你满意某个方案时，会弹出确认框
5. **自动填充**：确认后，AI总结的内容会自动填入左侧对应区域

## 技术栈

- **前端框架**：React 18 + TypeScript
- **样式**：Tailwind CSS
- **AI集成**：OpenAI GPT-4o-mini
- **图标**：Lucide React
- **构建工具**：Vite

## 项目结构

```
src/
├── components/          # React组件
│   ├── ContentPanel.tsx # 左侧内容面板
│   ├── ChatPanel.tsx    # 右侧聊天面板
│   └── ConfirmDialog.tsx# 确认对话框
├── utils/
│   └── openai.ts       # OpenAI API工具函数
├── types.ts            # TypeScript类型定义
├── App.tsx             # 主应用组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
```

## 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint
```

## 注意事项

- 请确保你的OpenAI API密钥有足够的额度
- API调用需要网络连接
- 建议在安全的环境中使用，避免API密钥泄露
- 首次使用可能需要几秒钟的响应时间

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 许可证

MIT License 