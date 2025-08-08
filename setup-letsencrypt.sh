#!/bin/bash

# Let's Encrypt SSL 인증서 설정 스크립트

echo "🔐 Let's Encrypt SSL 인증서를 설정합니다..."

# Certbot 설치 (Ubuntu/Debian)
echo "📦 Certbot을 설치합니다..."
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# 기존 자체 서명 인증서 백업
echo "💾 기존 인증서를 백업합니다..."
sudo mkdir -p /etc/ssl/backup
sudo cp /etc/ssl/certs/server.crt /etc/ssl/backup/ 2>/dev/null || true
sudo cp /etc/ssl/private/server.key /etc/ssl/backup/ 2>/dev/null || true

# Nginx 설정 업데이트 (Let's Encrypt용)
echo "⚙️ Nginx 설정을 업데이트합니다..."
sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
server {
    listen 80;
    server_name ec2-13-209-6-117.ap-northeast-2.compute.amazonaws.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Nginx 재시작
echo "🔄 Nginx를 재시작합니다..."
sudo nginx -t && sudo systemctl restart nginx

# Let's Encrypt 인증서 발급
echo "📜 Let's Encrypt 인증서를 발급합니다..."
sudo certbot --nginx -d ec2-13-209-6-117.ap-northeast-2.compute.amazonaws.com --non-interactive --agree-tos -m admin@example.com

# 인증서 자동 갱신 설정
echo "🔁 인증서 자동 갱신을 설정합니다..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

echo "✅ Let's Encrypt SSL 인증서 설정이 완료되었습니다!"
echo "🌐 HTTPS 사이트: https://ec2-13-209-6-117.ap-northeast-2.compute.amazonaws.com"