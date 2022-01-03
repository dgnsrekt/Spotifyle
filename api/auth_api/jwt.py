from datetime import datetime, timedelta
from typing import Optional

from django.conf import settings
from django.contrib.auth.models import User, update_last_login
from django.shortcuts import get_object_or_404
from jose import JWTError, jwt
from ninja.security import HttpBearer
from pydantic import ValidationError

from . import schemas

JWT_SECRET = settings.JWT_SECRET
JWT_ALGORITHM = settings.JWT_ALGORITHM


def create_access_token(
    *, verified_user: schemas.User, expiration: Optional[int] = None
) -> schemas.JsonWebToken:
    data = verified_user.dict()

    if expiration is None:
        expiration = datetime.utcnow() + timedelta(hours=2)

    data.update({"exp": expiration})
    access_token = jwt.encode(data, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return schemas.JsonWebToken(access_token=access_token, token_type="Bearer")


def verify_access_token(*, token: schemas.JsonWebToken):
    user = jwt.decode(token.access_token, JWT_SECRET, algorithms=JWT_ALGORITHM)
    return schemas.User(**user)


class InvalidToken(Exception):
    pass


class AuthBearer(HttpBearer):
    def authenticate(self, request, token):
        try:
            jwt_token = schemas.JsonWebToken(access_token=token, token_type="Bearer")
            decoded_user = verify_access_token(token=jwt_token)
            verified_user = get_object_or_404(User, id=decoded_user.id)
            return verified_user
        except (ValidationError, JWTError, User.DoesNotExist) as e:
            raise InvalidToken
