from typing import List, Optional

from celery.result import AsyncResult
from django.shortcuts import get_list_or_404
from django.db.models import Q
from ninja import Router
from ninja.pagination import paginate, PageNumberPagination

from . import models, schemas, tasks

from play_api import models as play_models

router = Router()

# List all games
# List games user created / owned
# List games user has played #NOTE: Need Scoreboard for this.
# List games user has not played #NOTE: Need Scoreboard for this.
# Get number of players by game
# Get a games share link
# Get a games owner and score
# Paginate games
# Create a new game


@router.post("", response={200: schemas.Status, 429: schemas.Message})
def create_game(request, publisher_id: int, max_stages: int = 5):
    if models.Game.objects.filter(publisher_id=publisher_id, processed=False).exists():
        return 429, schemas.Message(message="Game already being processed.")

    # TODO: Cannot create game if owner has unplayed games created by owner.

    status = tasks.create_game.delay(publisher_id=publisher_id, max_stages=max_stages)
    return 200, schemas.Status(task_id=status.id, **status._get_task_meta())


@router.get("/check", response=schemas.Status)
def check_status(request, status_id: str):
    status = AsyncResult(id=status_id)
    print(status._get_task_meta())
    return schemas.Status(**status._get_task_meta())


PAGE_SIZE = 10


@router.get("", response=List[schemas.GameResponse])
@paginate(PageNumberPagination, page_size=PAGE_SIZE)
def list_games(request, **kwargs):
    return models.Game.objects.all()


@router.get("/published/{publisher_id}", response=List[schemas.GameResponse])
@paginate(PageNumberPagination, page_size=PAGE_SIZE)
def list_games_by_publisher(request, publisher_id: int, **kwargs):
    return get_list_or_404(models.Game.objects.order_by("-id"), publisher_id=publisher_id)


from ninja import Schema


@router.get("/played/{player_id}", response=List[schemas.PlayedGameResponse])
@paginate(PageNumberPagination, page_size=PAGE_SIZE)
def list_games_played_by_player(request, player_id: int, **kwargs):
    return get_list_or_404(models.Game.objects.order_by("-id"), scoreboard__player_id=player_id)


@router.get("/unplayed/{player_id}", response=List[schemas.PlayedGameResponse])
@paginate(PageNumberPagination, page_size=PAGE_SIZE)
def list_games_player_has_not_played(request, player_id: int, **kwargs):
    return get_list_or_404(models.Game.objects.order_by("-id"), ~Q(scoreboard__player_id=player_id))
