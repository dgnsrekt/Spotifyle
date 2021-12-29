from ninja import Schema
from typing import List, Optional
from pydantic import parse_obj_as


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
