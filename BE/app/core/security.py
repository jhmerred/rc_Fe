from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from jose import JWTError, jwt
from sqlmodel import Session
import secrets
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from app.core.config import settings
from app.models.token import RefreshToken

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({
        "exp": expire,
        "type": "access"
    })
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(session: Session, data: dict, expires_delta: Optional[timedelta] = None, max_retry: int = 3) -> Tuple[str, datetime]:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=30)

    for _ in range(max_retry):
        jti = secrets.token_urlsafe(32)
        exists = session.query(RefreshToken).filter_by(jti=jti).first()
        if not exists:
            break
    else:
        raise RuntimeError("Failed to generate unique jti after retries")

    to_encode.update({
        "exp": expire,
        "type": "refresh",
        "jti": jti  # JWT ID for token revocation
    })
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt, expire

def verify_token(token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        if payload.get("type") != token_type:
            return None

        if "sub" not in payload or not payload["sub"]:
            return None

        if "exp" not in payload:
            return None

        return payload
    except JWTError:
        return None

def verify_refresh_token(token: str) -> Optional[Dict[str, Any]]:
    return verify_token(token, token_type="refresh")

def get_encryption_key() -> bytes:
    """SECRET_KEY로부터 일관된 암호화 키 생성"""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b'stable_salt',  # 일관된 salt 사용
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(settings.SECRET_KEY.encode()))
    return key

def create_enduser_token(name: str) -> str:
    """Enduser의 이름을 암호화하여 토큰 생성"""
    # 매번 다른 토큰을 생성하기 위해 nonce 추가
    nonce = secrets.token_urlsafe(16)
    data = f"{name}:{nonce}"
    
    # 암호화
    f = Fernet(get_encryption_key())
    encrypted = f.encrypt(data.encode())
    
    # URL-safe 형태로 반환
    return base64.urlsafe_b64encode(encrypted).decode()

def verify_enduser_token(token: str, name: str) -> bool:
    """Enduser 토큰을 복호화하여 이름 검증"""
    try:
        # Base64 디코딩
        encrypted = base64.urlsafe_b64decode(token.encode())
        
        # 복호화
        f = Fernet(get_encryption_key())
        decrypted = f.decrypt(encrypted).decode()
        
        # 이름 추출 및 검증
        decrypted_name = decrypted.split(':')[0]
        return decrypted_name == name
    except Exception:
        return False