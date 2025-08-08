#!/bin/bash

# EC2 배포 스크립트

echo "🚀 EC2 배포를 시작합니다..."

# SSL 인증서 생성 (자체 서명 - 개발용)
echo "📜 SSL 인증서를 생성합니다..."
mkdir -p ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/server.key \
  -out ssl/server.crt \
  -subj "/C=KR/ST=Seoul/L=Seoul/O=RealCoaching/OU=IT/CN=ec2-13-209-6-117.ap-northeast-2.compute.amazonaws.com"

# Docker 컨테이너 중지 및 제거
echo "🛑 기존 컨테이너를 중지합니다..."
docker-compose -f docker-compose.prod.yml down

# Docker 이미지 빌드
echo "🔨 Docker 이미지를 빌드합니다..."
docker-compose -f docker-compose.prod.yml build

# Docker 컨테이너 시작
echo "▶️ Docker 컨테이너를 시작합니다..."
docker-compose -f docker-compose.prod.yml up -d

echo "✅ 배포가 완료되었습니다!"
echo "🌐 사이트 주소: https://ec2-13-209-6-117.ap-northeast-2.compute.amazonaws.com"
echo ""
echo "⚠️  중요 사항:"
echo "1. .env.production 파일에서 실제 환경변수 값을 설정하세요"
echo "2. Google OAuth Console에서 리다이렉트 URI를 업데이트하세요:"
echo "   https://ec2-13-209-6-117.ap-northeast-2.compute.amazonaws.com/api/v1/auth/google/callback"
echo "3. Let's Encrypt를 사용하려면 다음 명령어를 실행하세요:"
echo "   sudo certbot --nginx -d ec2-13-209-6-117.ap-northeast-2.compute.amazonaws.com"