from . import stages as stage_creator
from . import models
from assets import models as asset_models
from celery import shared_task
from celery.utils.log import get_task_logger
import random


logger = get_task_logger(__name__)


@shared_task(bind=True)
def create_game(self, *, publisher_id: int, max_stages: int):
    game_code = stage_creator.generate_game_code()
    game_name = stage_creator.generate_game_name(game_code=game_code)
    logger.info("created game code")

    game_object = models.Game.objects.create(
        name=game_name,
        publisher_id=publisher_id,
        game_code=game_code,
        task_id=self.request.id,
        processed=False,
    )

    self.update_state(state="STAGING", meta={"current": 1, "total": 3})

    type_three = stage_creator.stage_three_processor(
        publisher_id=publisher_id, max_stages=max_stages
    )
    logger.info("first stage processor complete")

    self.update_state(state="STAGING", meta={"current": 2, "total": 3})
    type_two = stage_creator.stage_two_processor(publisher_id=publisher_id, max_stages=max_stages)
    logger.info("second stage processor complete")

    self.update_state(state="STAGING", meta={"current": 3, "total": 3})
    type_one = stage_creator.stage_one_processor(publisher_id=publisher_id, max_stages=max_stages)
    logger.info("third stage processor complete")
    # NOTE: type one is the slowest that is why its switched to last.

    stages = type_one + type_two + type_three
    random.shuffle(stages)
    logger.info("shuffled stages")

    saved = 0
    for index, stage in enumerate(stages):
        self.update_state(state="SAVING", meta={"current": index, "total": len(stages)})
        stage_object = game_object.stage_set.create(
            **stage.dict(include={"puzzle_type", "question"})
        )
        saved += 1
        for choice in stage.choices:
            choice_object = stage_object.choice_set.create(correct=choice.correct)
            asset = asset_models.SpotifyAsset.objects.get(id=choice.id)
            choice_object.spotify_asset.add(asset)
            choice_object.save()
            saved += 1

    logger.info("game creation completed.")
    logger.info(f"{saved} assets saved to database.")

    game_object.processed = True
    game_object.save()
