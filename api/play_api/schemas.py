from typing import List, Optional

from ninja import Schema
from pydantic import parse_obj_as


class PlayerProfile(Schema):
    player_id: int
    avaliable_stars: int
    points: int

    @classmethod
    def from_player_profile_orm(cls, player_profile):
        # player_profile model
        return cls(
            player_id=player_profile.player_id,
            avaliable_stars=player_profile.avaliable_stars,
            points=player_profile.points,
        )


class GameOut(Schema):
    name: str
    game_code: str
    publisher_id: int
    processed: bool


class AssetOut(Schema):
    name: str  # TODO: may need to remove
    spotify_uri: str
    spotify_type: str
    image: str
    preview: Optional[str]


class ChoiceOut(Schema):
    id: int
    spotify_asset: AssetOut
    # description: Optional[str]
    correct: bool


class StageOut(Schema):
    puzzle_type: int
    question: str
    choices: List[ChoiceOut]


class ActiveGame(Schema):
    game: GameOut
    stages: List[StageOut]


class AnswerResponse(Schema):
    players_choice: ChoiceOut
    correct_choice: Optional[ChoiceOut]
    answered_correct: bool
    player_profile: PlayerProfile
