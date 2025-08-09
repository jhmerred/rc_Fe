# FastAPI + SQLModel + Google OAuth

간단한 Google OAuth 인증 시스템입니다.

## 프로젝트 구조
```
app/
├── api/v1/          # API 엔드포인트
├── core/            # 핵심 설정 및 보안
├── models/          # SQLModel 모델
├── schemas/         # Pydantic 스키마
├── services/        # 비즈니스 로직
└── main.py          # FastAPI 앱
```

## 설정

### 1. Google OAuth 설정
Google Cloud Console에서 OAuth 2.0 클라이언트 생성:
- 승인된 리디렉션 URI: `http://localhost:8000/api/v1/auth/google/callback`

### 2. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일에 Google OAuth 정보 입력
```

## 실행 방법

### 로컬 실행
```bash
# 의존성 설치
uv sync

# 실행
uv run uvicorn app.main:app --reload
```

### Docker Compose 실행
```bash
# 전체 스택 실행 (MySQL + FastAPI)
make up

# 로그 확인
make logs

# 중지
make down

# 개발용 MySQL만 실행
make dev-db
```

## API 엔드포인트

- `GET /` - 헬스 체크
- `GET /docs` - Swagger UI
- `GET /api/v1/auth/google` - Google 로그인 시작
- `GET /api/v1/auth/google/callback` - Google OAuth 콜백
- `GET /api/v1/auth/check` - 인증 상태 확인
- `POST /api/v1/auth/logout` - 로그아웃
- `GET /api/v1/users/me` - 현재 사용자 정보 (인증 필요)

## 인증 플로우

1. 사용자가 `/api/v1/auth/google` 접속
2. Google 로그인 페이지로 리다이렉트
3. 로그인 성공 시 `/api/v1/auth/google/callback`으로 돌아옴
4. JWT 토큰 생성 후 프론트엔드로 리다이렉트
5. 프론트엔드에서 토큰 저장 및 API 호출 시 사용

## 개발 도구

```bash
# 앱 컨테이너 쉘 접속
make shell

# MySQL 쉘 접속
make db-shell

# Docker 이미지 다시 빌드
make build
```