from ninja import NinjaAPI

from auth_api.api import router as auth_router
from auth_api.jwt import AuthBearer, InvalidToken
from profile_api.api import router as profile_router

api = NinjaAPI(version="1.0.0")


@api.exception_handler(InvalidToken)
def on_invalid_token(request, exc):
    detail = {"detail": "Could not validate token"}
    return api.create_response(request, detail, status=401)


api.add_router("/auth", auth_router)
api.add_router("/profile", profile_router, auth=AuthBearer())
