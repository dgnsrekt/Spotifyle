from ninja import Router


router = Router()

# List all games
# List games user created / owned
# List games user has played
# List games user has not played
# Get number of players by game
# Get a games share link
# Get a games owner and score
# Paginate games
# Create a new game


@router.get("")
def list_games(request):
    return "games"
