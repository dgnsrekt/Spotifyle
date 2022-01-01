from typing import List, Optional

from ninja import Schema
from pydantic import parse_obj_as
from profile_api import schemas as profile_schemas


class PlayerProfile(Schema):
    player_id: int
    available_stars: int
    points: int = 0
    profile: Optional[profile_schemas.Profile]

    @classmethod
    def from_player_profile_orm(cls, player_profile):
        # player_profile model
        return cls(
            player_id=player_profile.player_id,
            available_stars=player_profile.available_stars,
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


class ChoiceOutOmitAnswer(Schema):
    id: int
    spotify_asset: AssetOut
    correct: bool  # TODO: REMOVE ONLY DEBUGGIN


class StageOut(Schema):
    puzzle_type: int
    question: str
    choices: List[ChoiceOutOmitAnswer]


class ActiveGame(Schema):
    game: GameOut
    stages: List[StageOut]


class AnswerResponse(Schema):
    players_choice: ChoiceOut
    correct_choice: Optional[ChoiceOut]
    answered_correct: bool
    player_profile: PlayerProfile


class PuzzleThreePlayerAnswer(Schema):
    id: int
    answer: bool


class PuzzleThreeAnswerResponse(Schema):
    answered_correct: bool
    player_profile: PlayerProfile
