from django.contrib.auth.models import User
from django.http import HttpResponseBadRequest
from django.shortcuts import get_list_or_404, get_object_or_404
from ninja import Router

from game_api import models as game_models

from . import models, schemas

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
    player = get_object_or_404(User, id=player_id)

    scoreboard, created_scoreboard = models.ScoreBoard.objects.get_or_create(
        game=game, player=player, score=0
    )

    if not created_scoreboard:
        return HttpResponseBadRequest("Player has already attempted this game.")

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


@router.get("/profile", response=schemas.PlayerProfile)
def get_players_profile(request, player_id: int):
    player_profile = get_object_or_404(models.PlayerProfile, player_id=player_id)
    return schemas.PlayerProfile.from_player_profile_orm(player_profile=player_profile)


@router.post("/answer")
def submit_players_answer(request, player_id: int, choice_id: int, wager: int):
    # TODO: Add gamecode to check if answer is in the correct game
    # TODO: bonus points for streak, frontend keeps track of streak
    # TODO: add bonus points as input. default to 0.

    players_choice = get_object_or_404(game_models.Choice, id=choice_id)

    score_board = get_object_or_404(
        models.ScoreBoard, game_id=players_choice.stage.game_id, player_id=player_id
    )
    player_profile = get_object_or_404(models.PlayerProfile, player_id=player_id)

    # TODO: the frontend should check if the players has points to wager

    if players_choice.stage.puzzle_type in [1, 2]:
        correct_choice = players_choice.stage.choice_set.get(correct=True)
        answered_correct = players_choice.correct and correct_choice.correct

        if answered_correct:
            score_board.score += wager
            # TODO: if bonus points add here
        else:
            score_board.score -= wager

        score_board.save()

        return schemas.AnswerResponse(
            players_choice=players_choice,
            correct_choice=correct_choice,
            answered_correct=answered_correct,
            player_profile=schemas.PlayerProfile.from_player_profile_orm(player_profile),
        )

    else:
        # type 3 answer
        answered_correct = players_choice.correct
        if answered_correct:
            score_board.score += wager
            # TODO: if bonus points add here
        else:
            score_board.score -= wager

        score_board.save()

        return schemas.AnswerResponse(
            players_choice=players_choice,
            answered_correct=answered_correct,
            player_profile=schemas.PlayerProfile.from_player_profile_orm(player_profile),
        )


@router.post("/star")
def consume_one_star(request, player_id: int):
    player_profile = get_object_or_404(models.PlayerProfile, player_id=player_id)
    if player_profile.avaliable_stars < 1:
        return HttpResponseBadRequest("Player has no stars avaliable.")

    player_profile.consume_star()

    return schemas.PlayerProfile.from_player_profile_orm(player_profile=player_profile)
