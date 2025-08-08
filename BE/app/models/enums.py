from enum import Enum

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    HR = "HR"
    ENDUSER = "ENDUSER"

class GroupMemberRole(str, Enum):
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"

class AssessmentType(str, Enum):
    SURVEY = "SURVEY"  # 설문조사
    TEST = "TEST"  # 시험
    INTERVIEW = "INTERVIEW"  # 면접
    EVALUATION = "EVALUATION"  # 평가

class AssessmentStatus(str, Enum):
    DRAFT = "DRAFT"  # 초안
    ACTIVE = "ACTIVE"  # 진행중
    COMPLETED = "COMPLETED"  # 완료
    CANCELLED = "CANCELLED"  # 취소됨

class AssessmentSessionStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"  # 시작 전
    IN_PROGRESS = "IN_PROGRESS"  # 진행중
    COMPLETED = "COMPLETED"  # 완료
    EXPIRED = "EXPIRED"  # 만료됨

class ChatRole(str, Enum):
    USER = "USER"  # 사용자
    ASSISTANT = "ASSISTANT"  # AI 어시스턴트
    SYSTEM = "SYSTEM"  # 시스템 메시지