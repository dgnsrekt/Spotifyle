export function GamesOverviewSection() {
    // const [publishedGamesList, updatePublishedGamesList] = useState([])
    // const [playerStats, updatePlayerStats] = useState({})

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


    return (
        <div className="col-9 p-0" id="main-stats">
            <div className="container d-flex justify-content-around mt-3">
                <div class="btn-group d-flex justify-content-between" role="group" aria-label="Basic example">
                    <button type="button" class="btn btn-secondary">Played</button>
                    <button type="button" class="btn btn-secondary">Unplayed</button>
                    <button type="button" class="btn btn-secondary">All</button>
                    <button type="button" class="btn btn-secondary">Published</button>
                </div>
                <button className="btn btn-success">Create New Game</button>
            </div>
        </div>
    )
}
