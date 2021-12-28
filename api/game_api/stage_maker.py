import itertools
import random
from typing import List
from uuid import uuid4, uuid5

from ninja import Schema

from assets import models as asset_models

from . import models, trivia


def generate_game_code(username):
    def _generate_code():
        return uuid5(uuid4(), username).hex.upper()

    code = _generate_code()
    while models.Game.objects.filter(game_code=code).exists():
        code = _generate_code()

    return code


class Choice(Schema):
    id: int
    correct: bool


class Stage(Schema):
    puzzle_type: int
    question: str
    choices: List[Choice]


import time


def stage_one_processor_old(*, publisher_id: int, max_stages: int):
    pre_processing = asset_models.SpotifyAsset.objects.filter(
        spotify_type="artist", observers=publisher_id, image__isnull=False
    ).values_list("id", "name")

    # NOTE: may need to add a limit

    data = list(pre_processing)

    random.shuffle(data)

    stages = []
    wrong_choices = []
    for id, answer in data:
        if len(stages) > max_stages:
            wrong_choices.append(Choice(id=id, correct=False))
            continue

        question, _ = trivia.create_question(answer=answer)

        if question:
            stage = Stage(question=question, puzzle_type=1, choices=[Choice(id=id, correct=True)])
            stages.append(stage)
        else:
            wrong_choices.append(Choice(id=id, correct=False))

    random.shuffle(wrong_choices)
    wrong_choices = itertools.cycle(wrong_choices)

    for stage in stages:
        while len(stage.choices) < 4:
            stage.choices.append(next(wrong_choices))

    return stages


def stage_one_processor(*, publisher_id: int, max_stages: int):
    assets = asset_models.SpotifyAsset.objects.filter(
        spotify_type="artist", observers=publisher_id, image__isnull=False
    )
    data = list(assets)

    random.shuffle(data)

    stages = []
    correct_ids = []

    for asset in data:
        if len(stages) > max_stages:
            break
        question, _ = trivia.create_question(answer=asset.name)
        if question:
            stage = Stage(
                question=question, puzzle_type=1, choices=[Choice(id=asset.id, correct=True)]
            )
            stages.append(stage)
            correct_ids.append(asset.id)

    wrong_answers = list(filter(lambda item: item.id not in correct_ids, data))

    for stage in stages:
        sample = random.sample(wrong_answers, k=3)
        choices = [Choice(id=answer.id, correct=False) for answer in sample]
        stage.choices += choices

    return stages


# from pprint import pprint

# stages = stage_one_processor_new(publisher_id=1, max_stages=5)
# for stage in stages:
# print(stage.json(indent=4))
# stages = stage_one_processor(publisher_id=1, max_stages=5)
# print(stages)


def stage_two_processor(*, publisher_id: int, max_stages: int, choice_size: int):
    assets = asset_models.SpotifyAsset.objects.filter(
        spotify_type="track", observers=publisher_id, image__isnull=False, preview__isnull=False
    )

    data = [Choice(id=asset.id, correct=False) for asset in assets]
    stages = []
    for _ in range(max_stages):
        choice_set = random.sample(data, k=choice_size)
        index = random.randint(0, choice_size - 1)
        choice_set[index].correct = True
        stage = Stage(question="Find the track.", puzzle_type=2, choices=choice_set)
        stages.append(stage)

    return stages


def stage_three_processor(*, publisher_id: int, max_stages: int):
    assets = asset_models.SpotifyAsset.objects.filter(
        spotify_type="track", observers=publisher_id, image__isnull=False, preview__isnull=False
    )
    data = [Choice(id=asset.id, correct=False) for asset in assets]
    stages = []
    for _ in range(max_stages):
        choice_set = random.sample(data, k=8)
        choice_map = random.choices([True, False], k=4)
        choice_matrix = choice_map + choice_map

        for choice, correct in zip(choice_set, choice_matrix):
            choice.correct = correct

        stage = Stage(question="Lock in the Track", puzzle_type=3, choices=choice_set)
        stages.append(stage)
    return stages


# one = stage_one_processor(publisher_id=1, max_stages=5)
# two = stage_two_processor(publisher_id=1, max_stages=5, choice_size=10)
# three = stage_three_processor(publisher_id=1, max_stages=5)

# stages = one + two + three

# random.shuffle(stages)

# for s in stages:
#     print(s.json(indent=4))


# r = random.sample(list(range(50)), k=8)
# print(sorted(r))
# print(y + y)


# stages = stage_two_processor(publisher_id=1, max_stages=5)
# for s in stages:
#     print(s.json(indent=4))


# game_code = generate_game_code()
# game = models.Game.objects.create(publisher_id=publisher_id, game_code=game_code)
#
# stage = models.Stage.objects.create(game_id=game.id)
