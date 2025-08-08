당신의 FastAPI 프로젝트의 사용자 인증 및 권한 시스템을 AI가 이해하고 동작을 예측할 수 있도록 하기 위해, 다음과 같은 \*\*"AI-friendly 설명문"\*\*을 작성할 수 있습니다. 이 설명은 모델 구조와 인증 흐름을 기반으로 하며, 기능 개발을 위한 명확한 가이드가 될 수 있습니다.

---

### 🧠 AI를 위한 백엔드 시스템 설명 (User 모델 기반 인증 및 생성 로직)

이 시스템은 `User` 테이블을 중심으로, 사용자 권한(Role)에 따라 다른 방식으로 로그인 및 사용자 생성 기능을 제공하는 구조입니다.

#### ✅ 사용자 역할 (User Role)

사용자는 다음과 같은 세 가지 역할(Role) 중 하나를 가질 수 있습니다:

* `Admin`: 최상위 관리자. HR 및 Enduser를 생성할 수 있음.
* `HR`: 그룹 관리자. Enduser를 생성할 수 있음.
* `Enduser`: 평가 대상자. Token 기반으로 로그인함.

#### 🔐 로그인 방식

| 역할        | 로그인 방식           | 인증 기준                     |
| --------- | ---------------- | ------------------------- |
| Admin, HR | Google OAuth 로그인 | `email` 필드 기반 인증          |
| Enduser   | Token + Name 로그인 | Token 복호화 → Name 일치 여부 확인 |

* Admin과 HR은 `email`을 기준으로 DB에서 검색하여 존재하면 로그인.
* Enduser는 `enduser_token`(암호화된 이름)과 `name`을 함께 보내면, 백엔드는 `enduser_token`을 복호화해서 `name`과 일치하는지 확인하여 로그인 성공 여부를 결정.

#### 🔐 Enduser Token 생성/검증 로직

* Token은 `name`을 암호화하여 생성하되, 동일한 name으로 생성하더라도 매번 다른 값이 되도록 구성해야 함 (예: salt 또는 nonce 포함).
* 로그인 시에는 해당 `enduser_token`을 복호화해서 `name`이 일치하는지 판단.

---

### 👷 사용자 생성 규칙

#### 1. Admin이 HR 생성

* 새로운 `Group`을 생성.
* 해당 그룹의 관리자(HR)로 `User(role=HR)`를 생성. 이때 `email`만 저장.
* HR이 추후 Google OAuth로 로그인하면, DB의 `email`과 매칭되는 계정으로 인증됨.

#### 2. Admin 또는 HR이 Enduser 생성

* 특정 그룹의 `GroupMember`로 속하는 `User(role=ENDUSER)`를 생성.
* 사용자의 `name`만 입력하면 됨.
* 이때 백엔드는 내부적으로 해당 `name`을 기반으로 `enduser_token`을 암호화하여 생성.
* 생성된 token은 고유해야 하며, 추후 로그인 시 복호화 검증에 사용됨.

---

### 📌 요약 - 백엔드 구현을 위한 주요 포인트

| 기능               | 설명                                              |
| ---------------- | ----------------------------------------------- |
| Google OAuth 로그인 | Admin/HR: email 기준 인증 및 토큰 발급                   |
| Token 로그인        | Enduser: `enduser_token` 복호화 후 `name` 일치 여부로 인증 |
| 사용자 생성           | Admin은 HR/Enduser 생성 가능, HR은 Enduser만 생성 가능     |
| 그룹 관리            | HR은 그룹을 대표하며, Enduser는 그룹에 소속됨                  |
| Token 암호화        | 같은 name이라도 매번 다른 token이 생성되어야 함 (보안상 안전하게)      |

---