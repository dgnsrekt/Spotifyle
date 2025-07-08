#!/bin/bash

# Detect which docker compose command to use
if command -v docker-compose &> /dev/null; then
    docker-compose "$@"
else
    docker compose "$@"
fi