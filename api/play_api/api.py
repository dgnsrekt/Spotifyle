from ninja import Router
from game_api import models as game_models
from django.shortcuts import get_object_or_404, get_list_or_404
from django.contrib.auth.models import User
from django.http import HttpResponseBadRequest
from . import schemas

router = Router()


# [x] get all game assets by gamecode GET /play

# check if players answer is correct
# | should create/update scoreboard

# player points GET /play/star -> star count

# player consume single star POST /play/star -> star count
# |- if player has 0 star return 400 code or unable code
# |- let players skip questions with stars


@router.get("", response=schemas.ActiveGame)
def get_game_by_gamecode(request, game_code: str, player_id: int):
    game = get_object_or_404(game_models.Game, game_code=game_code)
    player = get_object_or_404(User, id=player_id)  # TODO: used for creating scoreboard.

    stages = []
    stages_orm = get_list_or_404(game.stage_set)

    for stage in stages_orm:
        choices = []
        for choice in stage.choice_set.all():
            choices.append(schemas.ChoiceOut.from_orm(choice))

        stages.append(
            schemas.StageOut(
                puzzle_type=stage.puzzle_type, question=stage.question, choices=choices
            )
        )

    game_out = schemas.GameOut.from_orm(game)
    return schemas.ActiveGame(game=game_out, stages=stages)


from typing import List, Union


@router.post("/answer")
def submit_players_answer(request, player_id: int, choice_id: int, wager: int):
    # TODO: Add gamecode to check if answer is in the correct game
    players_choice = get_object_or_404(game_models.Choice, id=choice_id)

    # score_board = get_object_or_404(game_models.ScoreBoard, game_id=gam)

    # TODO: Need to check if player has the points to wager
    # TODO: Add new score to response
    # TODO: Add points to players scoreboard
    # TODO: create scoreboard

    if players_choice.stage.puzzle_type in [1, 2]:
        correct_choice = players_choice.stage.choice_set.get(correct=True)
        answered_correct = players_choice.correct and correct_choice.correct
        return schemas.AnswerResponse(
            players_choice=players_choice,
            correct_choice=correct_choice,
            answered_correct=answered_correct,
        )

    else:
        # type 3 answer
        answered_correct = players_choice.correct
        return schemas.AnswerResponse(
            players_choice=players_choice, answered_correct=answered_correct
        )


# router.post("/star")
# submit_player_passes
# player passes question and consumes one star
# player must have stars avaliable
