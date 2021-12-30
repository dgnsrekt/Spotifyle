import "./GameCreationScreen.css"
import '../animations/text.css'
import '../animations/vibrate.css'
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import { checkGameBuildStatus } from "../services/game";

export function CreateGameScreen() {
    const [pendingGame, setPendingGame] = useState({})
    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const getBuildStatus = async () => {
            const status = await checkGameBuildStatus(params.taskID)
            if (status) {
                setPendingGame(status)
                console.log(status)
            }

        }

        const { status } = pendingGame;


        if (status !== "SUCCESS") {
            setTimeout(() => { getBuildStatus() }, 1000)
        }

    }, [pendingGame])

    function startGame() {
        console.log("starting game")
        const gameCode = pendingGame.result.game_code;
        console.log(gameCode)
        navigate(`/play/${gameCode}`)

    }

    return (
        <div id="game-creation-screen" className='d-flex flex-column justify-content-center align-items-center gap-5'>
            <h1 className='display-1 text-color-change'>
                Creating Game
            </h1>
            {
                pendingGame &&
                <>
                    <h2 className="text-color-change">
                        Status: {pendingGame.status}
                    </h2>
                    {
                        pendingGame.result && pendingGame.result.current > 0 &&
                        <>
                            <h2 className="text-color-change">
                                {pendingGame.result.current - 1} out of {pendingGame.result.total} complete.
                            </h2>
                        </>
                    }
                </>
            }
            {
                pendingGame.status === "SUCCESS" &&
                <button onClick={startGame} className='btn btn-success btn-lg vibrate'>Play Game</button>
            }

        </div >
    )
}