from pydantic import BaseModel, EmailStr, constr, validator
import re


class SignupSchema(BaseModel):
    # Keep length constraints via `constr`, but enforce pattern via validator
    username: constr(min_length=3, max_length=20)
    email: EmailStr
    password: constr(min_length=8)

    @validator('username')
    def username_must_match(cls, v: str) -> str:
        pattern = r'^[A-Za-z0-9_.-]+$'
        if not re.match(pattern, v):
            raise ValueError('Username may only contain letters, numbers, underscore, dot or hyphen')
        return v

    @validator('password')
    def password_must_have_upper(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v
