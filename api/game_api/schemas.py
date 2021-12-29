from datetime import datetime
from typing import Any, Dict, Optional, Union

from ninja import Schema

ResultType = Dict[str, Union[str, int]]


class Status(Schema):
    task_id: str
    status: str
    result: Optional[ResultType]
    date_done: Optional[datetime]


class Message(Schema):
    message: str


class GameResponse(Schema):
    name: str
    game_code: str
    publisher_id: int
    processed: bool
