import { createNewGame } from "../services/game"
import { useNavigate } from "react-router-dom";

export function GamesOverviewSection() {
    // const [publishedGamesList, updatePublishedGamesList] = useState([])
    // const [playerStats, updatePlayerStats] = useState({})
    const navigate = useNavigate();

    // useEffect(() => {
    //     const getGamesUserPublished = async () => {
    //         const gameList = await fetchGamesCurrentUserPublished()
    //         updatePublishedGamesList(gameList)
    //     }
    //     getGamesUserPublished()
    // }, [])

    // useEffect(() => {
    //     const getPlayerStats = async () => {
    //         const stats = await fetchCurrentUsersGameStats()
    //         updatePlayerStats(stats)
    //     }
    //     getPlayerStats()
    // }, [])

    function handleCreateNewGame(event) {

        const startCreatingGame = async () => {
            const gameCreationStatus = await createNewGame();
            if (gameCreationStatus) {
                navigate(`/create/${gameCreationStatus.task_id}`)
            }
        }
        startCreatingGame()
    }


    return (
        <div className="col-9 p-0" id="main-stats">
            <div className="container d-flex justify-content-around mt-3">
                <div className="btn-group d-flex justify-content-between" role="group" aria-label="Basic example">
                    <button type="button" className="btn btn-secondary">Played</button>
                    <button type="button" className="btn btn-secondary">Unplayed</button>
                    <button type="button" className="btn btn-secondary">All</button>
                    <button type="button" className="btn btn-secondary">Published</button>
                </div>
                <button onClick={handleCreateNewGame} className="btn btn-success">Create New Game</button>
            </div>
        </div>
    )
}
