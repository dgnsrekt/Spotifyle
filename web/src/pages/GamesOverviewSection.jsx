import { fetchGamesCurrentUserHasPlayed, fetchGamesCurrentUserPublished, fetchGamesCurrentUserUnplayedGames } from "../services/game"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CopyContainer } from "./CopyContainer";
import "./GamesOverviewSection.css"


function PlayedGamesButton(props) {
    const { setGames, setShowPlayButton } = props;

    function handleOnClick() {
        const getGameList = async () => {
            const response = await fetchGamesCurrentUserHasPlayed()
            if (response) {
                setGames(response)
                setShowPlayButton(false)
            } else {
                setGames([])
            }
        }
        getGameList()


    }

    return <button onClick={handleOnClick} type="button" className="btn btn-secondary">Played</button>
}
function GamesNotPlayedButton(props) {
    const { setGames, setShowPlayButton } = props;

    function handleOnClick() {
        const getGameList = async () => {
            const response = await fetchGamesCurrentUserUnplayedGames()
            if (response) {
                setGames(response)
                setShowPlayButton(true)
            } else {
                setGames([])
            }
        }
        getGameList()

    }
    return <button onClick={handleOnClick} type="button" className="btn btn-secondary">UnPlayed</button>
}


function PublishedGamesButton(props) {
    const { setGames, setShowPlayButton } = props;

    function handleOnClick() {
        const getGameList = async () => {
            const response = await fetchGamesCurrentUserPublished()
            if (response) {
                setGames(response)
                setShowPlayButton(false)
            } else {
                setGames([])
            }
        }
        getGameList()

    }
    return <button onClick={handleOnClick} type="button" className="btn btn-secondary">Published</button>
}




function GamesTable(props) {
    const [games, setGames] = useState(null);
    const [showPlayButton, setShowPlayButton] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const getGameList = async () => {
            const response = await fetchGamesCurrentUserHasPlayed()
            if (response) {
                setGames(response)
            }
        }
        getGameList()
    }, [])

    function startGame(gameCode) {
        navigate(`/play/${gameCode}`)
    }

    // fetchGamesCurrentUserHasPlayed
    function Row(props) {
        return (
            <tr>
                <td colSpan="8">{props.item.name}</td>

                <td colSpan="2">
                    {
                        showPlayButton ? <button onClick={() => startGame(props.item.game_code)}>PLAY</button> :
                            < CopyContainer gameCode={props.item.game_code} />
                    }
                </td>

            </tr>
        )
    }

    return (
        <>

            <div className="btn-group d-flex justify-content-between" role="group" aria-label="Basic example">
                <PlayedGamesButton setGames={setGames} setShowPlayButton={setShowPlayButton} />
                <GamesNotPlayedButton setGames={setGames} setShowPlayButton={setShowPlayButton} />
                <PublishedGamesButton setGames={setGames} setShowPlayButton={setShowPlayButton} />
            </div>

            {
                games ?
                    <div className="row px-4">
                        <div className="card bg-dark px-4 my-4">
                            <div className="card-body">
                                <h5 className="card-title">Games Created</h5>

                                <table className="table table-dark table-borderless">
                                    <thead>
                                        <tr>
                                            <th scope="col" colSpan="8">Game Name</th>
                                            <th scope="col" colSpan="2">Game Code</th>
                                            {/* <th scope="col" colSpan="2">Processed</th> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {games.map((item, index) => <Row key={index} item={item} />)}
                                    </tbody>

                                </table>
                            </div>
                        </div>
                    </div>
                    :
                    <h1>NO GAMES TO LIST</h1>
            }
        </>
    )
}



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
        <div className="col-9 games-overview">
            <div>
                <GamesTable />
            </div>
        </div>
    )
}
