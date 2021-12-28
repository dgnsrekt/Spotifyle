from ninja import Schema
from typing import Dict, Any, Optional, Union
from datetime import datetime


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
