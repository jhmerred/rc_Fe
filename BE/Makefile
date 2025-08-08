.PHONY: help build up down logs shell db-shell clean

help:
	@echo "사용 가능한 명령어:"
	@echo "  make build      - Docker 이미지 빌드"
	@echo "  make up         - 서비스 시작"
	@echo "  make down       - 서비스 중지"
	@echo "  make logs       - 로그 보기"
	@echo "  make shell      - 앱 컨테이너 쉘 접속"
	@echo "  make db-shell   - MySQL 쉘 접속"
	@echo "  make clean      - 볼륨 포함 모두 삭제"
	@echo "  make dev-db     - 개발용 MySQL만 실행"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

shell:
	docker-compose exec app bash

db-shell:
	docker-compose exec mysql mysql -uroot -p1tkddydwkdql qpin

clean:
	docker-compose down -v

dev-db:
	docker-compose -f docker-compose.dev.yml up -d

dev-db-down:
	docker-compose -f docker-compose.dev.yml down