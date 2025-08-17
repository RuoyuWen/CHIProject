# Dual-LLM System User Guide

## 🧠 Function Overview

AI Scene Designer now supports two conversation modes:

### 📝 Traditional Mode
- Direct conversation with AI designer
- Simple and intuitive interaction
- Suitable for quick creative exploration

### 🧠 Dual-LLM Mode  
- **LLM-A (Internal Logic)**: Analyzes user state and formulates conversation strategies
- **LLM-B (Rendering Interaction)**: Generates tactful, inspiring dialogue based on strategies

## 🎯 双LLM模式特点

### 智能状态识别
系统会自动识别用户的对话状态：
- **S0**: 无偏好/模糊
- **S1**: 方向已定待细化  
- **S2**: 候选过多
- **S3**: 要对比
- **S4**: 倾向目标
- **S5**: 明确反对
- **S6**: 要记忆点/独特性
- **S7**: 跑题
- **S8**: 僵持
- **S9**: 用户接管

### 策略引擎
根据用户状态智能选择对话策略：
- 用户主导框架建立
- 询问用户优先细节
- 用户主导筛选保留
- 对比选择
- 优势重构选择
- 魔术师选择
- ...等12种策略

### Agency保护机制
- 让用户感觉自己在主导设计过程
- 提供"可撤销"选项
- 归功用户的决策
- 委婉启发式对话风格

## ⚙️ Configuration Setup

### Target Scene & Final Task Configuration
Before using the Dual-LLM mode, you can configure:

**🎯 Target Scene**: The specific scene that LLM-A will intelligently guide users toward
- Examples: "Medieval Castle", "Space Station", "Enchanted Forest", "Modern Office"
- This becomes the convergence goal for the conversation strategy

**🎯 Final Task Goal**: Define what the user should ultimately accomplish
- Examples: 
  - "Create a detailed scene description for 3D rendering"
  - "Develop a story setting with atmospheric details"
  - "Design a game environment with interactive elements"

### How to Configure:
1. Open the Settings panel (gear icon)
2. Expand "Advanced Settings"
3. Find "🎯 Dual-LLM Target Configuration" section
4. Set your Target Scene and Final Task Goal
5. Save settings

These configurations will be used by LLM-A to intelligently analyze user states and generate appropriate conversation strategies.

## 🚀 Usage Guide

### 1. 模式切换
在聊天界面头部找到模式切换开关：
```
Traditional ⭘ Dual-LLM
```
点击切换开关即可在两种模式间切换。

### 2. 查看分析结果
在双LLM模式下：
1. 发送消息后，点击头部的 "Analysis" 按钮
2. 查看实时的状态分析和策略信息：
   - 🧠 当前状态
   - 🎯 关注焦点 
   - 🎪 目标场景
   - ⚡ 活跃策略
   - 👤 用户主导指标

### 3. 输入提示
- 传统模式：`💬 Chat with your Scene designer...`
- 双LLM模式：`🧠 Advanced AI analysis mode - Chat with Scene designer...`

## 🎨 界面元素

### 状态指示器
- **Std** (蓝色)：传统模式
- **Dual** (紫色)：双LLM模式

### 分析面板组件
- **Current State**: 显示用户当前对话状态
- **Focus Areas**: 当前关注的设计维度
- **Target Scene**: 系统推荐的目标场景
- **Active Strategies**: 当前激活的对话策略
- **Agency Indicators**: 用户主导权保护机制

### 策略优先级
- **P1**: 最高优先级策略
- **P2**: 中等优先级策略  
- **P3**: 备选策略

## 💡 使用建议

1. **初次使用**：建议先体验传统模式，熟悉基本功能
2. **深度设计**：使用双LLM模式获得更智能的对话引导
3. **分析查看**：在双LLM模式下开启分析面板，了解AI的思考过程
4. **策略理解**：观察不同状态下AI采用的策略变化

## 🔧 技术特性

- **状态识别准确性**：基于对话历史智能判断
- **策略自适应**：根据用户反馈动态调整
- **委婉交互**：避免命令式语言，保持启发性
- **实时分析**：每轮对话后更新状态和策略
- **模式切换**：可随时在传统和双LLM模式间切换

## 📈 预期效果

使用双LLM模式，您将体验到：
- 更自然的对话流程
- 更精准的需求理解
- 更委婉的引导方式
- 更强的用户主导感
- 更高效的设计收敛

---

*双LLM系统基于先进的对话策略理论设计，旨在提供更人性化、更智能的AI交互体验。*
