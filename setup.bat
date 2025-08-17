@echo off
echo 智能内容生成器 - 项目设置
echo ============================

echo.
echo 1. 复制环境变量文件...
if not exist .env (
    copy .env.example .env
    echo .env 文件已创建！
    echo.
    echo 请编辑 .env 文件，添加你的 OpenAI API 密钥：
    echo VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
    echo.
    pause
) else (
    echo .env 文件已存在
)

echo.
echo 2. 启动开发服务器...
echo 应用将在 http://localhost:3000 启动
echo.
echo 按任意键继续启动开发服务器...
pause

npm run dev 