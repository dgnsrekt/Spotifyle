from django.contrib.auth.models import User
from django.http import HttpResponseBadRequest
from django.shortcuts import get_list_or_404, get_object_or_404
from ninja import Router

from game_api import models as game_models
from profile_api import models as profile_models
from profile_api import schemas as profile_schemas

from . import models, schemas

router = Router()


# [x] get all game assets by gamecode GET /play

# check if players answer is correct
# | should create/update scoreboard

# player points GET /play/star -> star count

# player consume single star POST /play/star -> star count
# |- if player has 0 star return 400 code or unable code
# |- let players skip questions with stars
import random
from pprint import pprint


@router.get("", response=schemas.ActiveGame)
def get_game_by_gamecode(request, game_code: str, player_id: int):
    game = get_object_or_404(game_models.Game, game_code=game_code)
    player = get_object_or_404(User, id=player_id)

    scoreboard, created_scoreboard = models.ScoreBoard.objects.get_or_create(
        game=game, player=player, defaults={"score": 0}
    )

    if not created_scoreboard:
        return HttpResponseBadRequest("Player has already attempted this game.")

    # TODO: REPLACE THIS IS FOR DEBUGGIN ONLY

    def split_choices(choices):
        half = len(choices) // 2
        return choices[:half], choices[half:]

    stages = []
    stages_orm = get_list_or_404(game.stage_set)

    for stage in stages_orm:
        choices = []
        if stage.puzzle_type == 1:
            for choice in stage.choice_set.all():
                choices.append(schemas.ChoiceOut.from_orm(choice))
            random.shuffle(choices)

        elif stage.puzzle_type == 2:
            for choice in stage.choice_set.all():
                choices.append(schemas.ChoiceOut.from_orm(choice))

            # NOTE: Used to make sure all the assets have the same preview.
            # This is to make sure no one can find the correct choice
            # by snooping in on the mp3 id.
            correct = list(filter(lambda item: item.correct == True, choices))
            assert len(correct) == 1
            target_preview = correct.pop().spotify_asset.preview
            for choice in choices:
                choice.spotify_asset.preview = target_preview

            # random.shuffle(choices)
        elif stage.puzzle_type == 3:
            # TODO: FIXME: HACK: super hacky. Need to fix a bug on the puzzle three creation
            # NOTE: Need to check if two assets have the same image before
            # creating stage three assets.
            # Songs maybe different with the same album art.

            for front, back in zip(*split_choices(list(stage.choice_set.all()))):
                choice_out = schemas.ChoiceOut.from_orm(front)

                if front.correct is False:
                    # swap the images on the wrong answers.
                    choice_out.spotify_asset.image = back.spotify_asset.image

                choices.append(choice_out)

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
    profile = get_object_or_404(profile_models.Profile, user_id=player_id)
    output = schemas.PlayerProfile.from_player_profile_orm(player_profile=player_profile)
    output.profile = profile_schemas.Profile.from_orm(profile)
    return output


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
            player_profile.update_gainers_and_losers(wager)
            # TODO: if bonus points add here
        else:
            score_board.score -= wager
            player_profile.update_gainers_and_losers(-wager)

        score_board.save()

        return schemas.AnswerResponse(
            players_choice=players_choice,
            correct_choice=correct_choice,
            answered_correct=answered_correct,
            player_profile=schemas.PlayerProfile.from_player_profile_orm(player_profile),
        )


@router.post("/answer/three", response=schemas.PuzzleThreeAnswerResponse)
def submit_players_puzzle_three_answer(
    request, player_id: int, wager: int, choices: List[schemas.PuzzleThreePlayerAnswer]
):

    first_choice = get_object_or_404(game_models.Choice, id=choices[0].id)

    score_board = get_object_or_404(
        models.ScoreBoard, game_id=first_choice.stage.game_id, player_id=player_id
    )

    player_profile = get_object_or_404(models.PlayerProfile, player_id=player_id)

    answered_correct = None

    for choice in choices:
        correct_choice = get_object_or_404(game_models.Choice, id=choice.id)
        if correct_choice.correct != choice.answer:
            answered_correct = False
            score_board.score -= wager
            player_profile.update_gainers_and_losers(-wager)
            break

    else:
        answered_correct = True
        score_board.score += wager
        player_profile.update_gainers_and_losers(wager)

    score_board.save()

    return schemas.PuzzleThreeAnswerResponse(
        answered_correct=answered_correct,
        player_profile=schemas.PlayerProfile.from_player_profile_orm(player_profile),
    )


@router.post("/star")
def consume_one_star(request, player_id: int):
    player_profile = get_object_or_404(models.PlayerProfile, player_id=player_id)
    if player_profile.available_stars < 1:
        return HttpResponseBadRequest("Player has no stars available.")

    player_profile.consume_star()

    return schemas.PlayerProfile.from_player_profile_orm(player_profile=player_profile)


from ninja import Schema


class Player(Schema):
    username: str


class GameOut(Schema):
    name: str
    game_code: str


class ScoreboardOut(Schema):
    game: GameOut
    player: Player
    score: int


@router.get("/scoreboard", response=List[ScoreboardOut])
def get_scoreboard(request, game_code: str):
    return get_list_or_404(models.ScoreBoard, game__game_code=game_code)
