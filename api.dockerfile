# syntax=docker/dockerfile:1
FROM python:3.9

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /api

COPY ./api/pyproject.toml /api

ENV PYTHONPATH=${PYTHONPATH}:${PWD}

RUN pip3 install poetry
RUN poetry config virtualenvs.create false
RUN poetry install --no-dev

COPY ./api /api/

