#!/bin/bash

# Docker 部署脚本 - Garage WebUI Next.js
set -e

echo "🚀 开始 Docker 部署 Garage WebUI..."

# 检查环境变量
if [ -z "$GARAGE_API_BASE_URL" ]; then
    echo "❌ 错误: GARAGE_API_BASE_URL 环境变量未设置"
    exit 1
fi

if [ -z "$GARAGE_API_ADMIN_KEY" ]; then
    echo "❌ 错误: GARAGE_API_ADMIN_KEY 环境变量未设置"
    exit 1
fi

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: Docker 未安装"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ 错误: Docker Compose 未安装"
    exit 1
fi

# 构建模式：production (默认) 或 development
BUILD_MODE=${1:-production}

echo "📦 部署模式: $BUILD_MODE"

if [ "$BUILD_MODE" = "development" ]; then
    echo "🔧 启动开发环境..."
    docker-compose -f docker-compose.dev.yml up --build -d
    echo "✅ 开发环境已启动在 http://localhost:3000"
    echo "📝 查看日志: docker-compose -f docker-compose.dev.yml logs -f"
elif [ "$BUILD_MODE" = "production" ]; then
    echo "🏗️  构建生产镜像..."
    docker build -t garage-webui-nextjs:latest .
    
    echo "🚀 启动生产容器..."
    docker-compose up -d
    
    echo "✅ 生产环境已启动在 http://localhost:3000"
    echo "📝 查看日志: docker-compose logs -f garage-webui"
    
    # 健康检查
    echo "🔍 等待服务启动..."
    for i in {1..30}; do
        if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            echo "✅ 服务健康检查通过!"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "❌ 服务启动超时"
            docker-compose logs garage-webui
            exit 1
        fi
        sleep 2
    done
else
    echo "❌ 错误: 无效的构建模式 '$BUILD_MODE'"
    echo "💡 使用方法: $0 [production|development]"
    exit 1
fi

echo ""
echo "🎉 Docker 部署完成!"
echo "🌐 访问地址: http://localhost:3000"
echo "🔍 健康检查: curl http://localhost:3000/api/health"
