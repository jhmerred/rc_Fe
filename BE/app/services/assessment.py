from sqlmodel import Session, select, func
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.assessment import Assessment, AssessmentSession, AssessmentResult, AssessmentChat
from app.models.enums import AssessmentStatus, AssessmentType

class AssessmentService:
    def __init__(self, session: Session):
        self.session = session
    
    # Assessment 기본 CRUD
    def get_by_id(self, assessment_id: int) -> Optional[Assessment]:
        """ID로 평가 조회"""
        return self.session.get(Assessment, assessment_id)
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Assessment]:
        """모든 평가 조회"""
        return self.session.exec(
            select(Assessment)
            .order_by(Assessment.created_at.desc())
            .offset(skip).limit(limit)
        ).all()
    
    def get_by_group(self, group_id: int, skip: int = 0, limit: int = 100) -> List[Assessment]:
        """그룹별 평가 조회"""
        return self.session.exec(
            select(Assessment)
            .where(Assessment.group_id == group_id)
            .order_by(Assessment.created_at.desc())
            .offset(skip).limit(limit)
        ).all()
    
    def get_by_type(self, assessment_type: AssessmentType, skip: int = 0, limit: int = 100) -> List[Assessment]:
        """유형별 평가 조회"""
        return self.session.exec(
            select(Assessment)
            .where(Assessment.type == assessment_type)
            .order_by(Assessment.created_at.desc())
            .offset(skip).limit(limit)
        ).all()
    
    def get_active_assessments(self, skip: int = 0, limit: int = 100) -> List[Assessment]:
        """활성 평가 조회"""
        return self.session.exec(
            select(Assessment)
            .where(Assessment.is_active == True)
            .order_by(Assessment.created_at.desc())
            .offset(skip).limit(limit)
        ).all()
    
    def create(self, **assessment_data) -> Assessment:
        """평가 생성"""
        assessment = Assessment(**assessment_data)
        self.session.add(assessment)
        self.session.commit()
        self.session.refresh(assessment)
        return assessment
    
    def update(self, assessment_id: int, **update_data) -> Optional[Assessment]:
        """평가 정보 업데이트"""
        assessment = self.get_by_id(assessment_id)
        if not assessment:
            return None
        
        for field, value in update_data.items():
            if hasattr(assessment, field) and value is not None:
                setattr(assessment, field, value)
        
        self.session.add(assessment)
        self.session.commit()
        self.session.refresh(assessment)
        return assessment
    
    def delete(self, assessment_id: int) -> bool:
        """평가 삭제"""
        assessment = self.get_by_id(assessment_id)
        if not assessment:
            return False
        
        self.session.delete(assessment)
        self.session.commit()
        return True
    
    def deactivate(self, assessment_id: int) -> Optional[Assessment]:
        """평가 비활성화"""
        return self.update(assessment_id, is_active=False)
    
    def activate(self, assessment_id: int) -> Optional[Assessment]:
        """평가 활성화"""
        return self.update(assessment_id, is_active=True)
    
    # AssessmentSession 관련
    def create_session(self, **session_data) -> AssessmentSession:
        """평가 세션 생성"""
        session = AssessmentSession(**session_data)
        self.session.add(session)
        self.session.commit()
        self.session.refresh(session)
        return session
    
    def get_session_by_id(self, session_id: int) -> Optional[AssessmentSession]:
        """ID로 세션 조회"""
        return self.session.get(AssessmentSession, session_id)
    
    def get_sessions_by_assessment(self, assessment_id: int, skip: int = 0, limit: int = 100) -> List[AssessmentSession]:
        """평가별 세션 조회"""
        return self.session.exec(
            select(AssessmentSession)
            .where(AssessmentSession.assessment_id == assessment_id)
            .order_by(AssessmentSession.created_at.desc())
            .offset(skip).limit(limit)
        ).all()
    
    def get_sessions_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> List[AssessmentSession]:
        """사용자별 세션 조회"""
        return self.session.exec(
            select(AssessmentSession)
            .where(AssessmentSession.user_id == user_id)
            .order_by(AssessmentSession.created_at.desc())
            .offset(skip).limit(limit)
        ).all()
    
    def get_sessions_by_status(self, status: AssessmentStatus, skip: int = 0, limit: int = 100) -> List[AssessmentSession]:
        """상태별 세션 조회"""
        return self.session.exec(
            select(AssessmentSession)
            .where(AssessmentSession.status == status)
            .order_by(AssessmentSession.created_at.desc())
            .offset(skip).limit(limit)
        ).all()
    
    def update_session(self, session_id: int, **update_data) -> Optional[AssessmentSession]:
        """세션 정보 업데이트"""
        session = self.get_session_by_id(session_id)
        if not session:
            return None
        
        for field, value in update_data.items():
            if hasattr(session, field) and value is not None:
                setattr(session, field, value)
        
        self.session.add(session)
        self.session.commit()
        self.session.refresh(session)
        return session
    
    def update_session_status(self, session_id: int, status: AssessmentStatus) -> Optional[AssessmentSession]:
        """세션 상태 업데이트"""
        return self.update_session(session_id, status=status)
    
    def complete_session(self, session_id: int) -> Optional[AssessmentSession]:
        """세션 완료 처리"""
        return self.update_session(session_id, 
                                 status=AssessmentStatus.COMPLETED,
                                 completed_at=datetime.utcnow())
    
    # AssessmentResult 관련
    def create_result(self, **result_data) -> AssessmentResult:
        """평가 결과 생성"""
        result = AssessmentResult(**result_data)
        self.session.add(result)
        self.session.commit()
        self.session.refresh(result)
        return result
    
    def get_result_by_session(self, session_id: int) -> Optional[AssessmentResult]:
        """세션별 결과 조회"""
        return self.session.exec(
            select(AssessmentResult)
            .where(AssessmentResult.session_id == session_id)
        ).first()
    
    def get_results_by_assessment(self, assessment_id: int, skip: int = 0, limit: int = 100) -> List[AssessmentResult]:
        """평가별 결과 조회"""
        return self.session.exec(
            select(AssessmentResult)
            .join(AssessmentSession)
            .where(AssessmentSession.assessment_id == assessment_id)
            .order_by(AssessmentResult.created_at.desc())
            .offset(skip).limit(limit)
        ).all()
    
    def update_result(self, result_id: int, **update_data) -> Optional[AssessmentResult]:
        """결과 정보 업데이트"""
        result = self.session.get(AssessmentResult, result_id)
        if not result:
            return None
        
        for field, value in update_data.items():
            if hasattr(result, field) and value is not None:
                setattr(result, field, value)
        
        self.session.add(result)
        self.session.commit()
        self.session.refresh(result)
        return result
    
    # AssessmentChat 관련
    def create_chat(self, **chat_data) -> AssessmentChat:
        """채팅 메시지 생성"""
        chat = AssessmentChat(**chat_data)
        self.session.add(chat)
        self.session.commit()
        self.session.refresh(chat)
        return chat
    
    def get_chats_by_session(self, session_id: int, skip: int = 0, limit: int = 100) -> List[AssessmentChat]:
        """세션별 채팅 조회"""
        return self.session.exec(
            select(AssessmentChat)
            .where(AssessmentChat.session_id == session_id)
            .order_by(AssessmentChat.created_at)
            .offset(skip).limit(limit)
        ).all()
    
    def count_chats_by_session(self, session_id: int) -> int:
        """세션별 채팅 수"""
        return self.session.exec(
            select(func.count())
            .select_from(AssessmentChat)
            .where(AssessmentChat.session_id == session_id)
        ).one()
    
    # 통계 관련
    def count_assessments_by_group(self, group_id: int) -> int:
        """그룹별 평가 수"""
        return self.session.exec(
            select(func.count())
            .select_from(Assessment)
            .where(Assessment.group_id == group_id)
        ).one()
    
    def count_sessions_by_assessment(self, assessment_id: int) -> int:
        """평가별 세션 수"""
        return self.session.exec(
            select(func.count())
            .select_from(AssessmentSession)
            .where(AssessmentSession.assessment_id == assessment_id)
        ).one()
    
    def count_completed_sessions(self, assessment_id: int) -> int:
        """평가별 완료된 세션 수"""
        return self.session.exec(
            select(func.count())
            .select_from(AssessmentSession)
            .where(AssessmentSession.assessment_id == assessment_id)
            .where(AssessmentSession.status == AssessmentStatus.COMPLETED)
        ).one()
    
    def get_user_assessment_history(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """사용자 평가 이력 조회"""
        sessions = self.get_sessions_by_user(user_id, skip, limit)
        history = []
        
        for session in sessions:
            assessment = self.get_by_id(session.assessment_id)
            result = self.get_result_by_session(session.id)
            
            history.append({
                "session": session,
                "assessment": assessment,
                "result": result
            })
        
        return history
    
    def exists_session(self, assessment_id: int, user_id: int) -> bool:
        """특정 평가에 대한 사용자 세션 존재 여부"""
        session = self.session.exec(
            select(AssessmentSession)
            .where(AssessmentSession.assessment_id == assessment_id)
            .where(AssessmentSession.user_id == user_id)
        ).first()
        return session is not None