from ninja import NinjaAPI

from auth_api.api import router as auth_router
from auth_api.jwt import AuthBearer, InvalidToken
from game_api.api import router as game_router
from play_api.api import router as play_router
from profile_api.api import router as profile_router

api = NinjaAPI(
    title="TopsifyleAPI",
    description="Backend API for the spotify based game Topsifyle",
    version="1.0.0",
)


@api.exception_handler(InvalidToken)
def on_invalid_token(request, exc):
    detail = {"detail": "Could not validate token"}
    return api.create_response(request, detail, status=401)


api.add_router("/auth", auth_router, tags=["Authentication"])
api.add_router("/profile", profile_router, auth=AuthBearer(), tags=["Profile"])
api.add_router("/game", game_router, tags=["Game"], auth=AuthBearer())
api.add_router("/play", play_router, tags=["Play"], auth=AuthBearer())
