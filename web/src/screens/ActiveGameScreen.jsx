import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import "./ActiveGameScreen.css"
import "../animations/gradient.css"
import "../animations/entrances.css"
import "../animations/exit.css"
import { shuffleArray, cycle } from "../animations/helpers"
import { fetchCurrentUsersGameStats, fetchGameData, consumeStar } from "../services/play"
import { IMAGE_PREFIX_URL } from "../common"

import { PuzzleOneQuestionWidget, PuzzleOneContainer } from "./PuzzleOne";
import { PuzzleTwoQuestionWidget, PuzzleTwoContainer } from "./PuzzleTwo";
import { PuzzleThreeQuestionWidget, PuzzleThreeContainer } from "./PuzzleThree";

function GameHeader(props) {
    return (
        <div id="game-header">
            {props.children}
        </div>
    )
}

function GameStageSection(props) {
    const { changeStage, currentStage, updatePlayerData, playerData, wager } = props;
    const { question, puzzle_type: puzzleType, choices } = currentStage;

    if (puzzleType === 1) {
        return (
            <div id="game-stage-section">
                <PuzzleOneQuestionWidget question={question} />
                <PuzzleOneContainer changeStage={changeStage} choices={choices} playerData={playerData} updatePlayerData={updatePlayerData} wager={wager} />
            </div>
        )
    }

    if (puzzleType === 2) {
        return (
            <div id="game-stage-section">
                <PuzzleTwoQuestionWidget question={question} />
                <PuzzleTwoContainer changeStage={changeStage} currentStage={currentStage} choices={choices} playerData={playerData} updatePlayerData={updatePlayerData} wager={wager} />
            </div>
        )
    }


    if (puzzleType === 3) {
        return (
            <div id="game-stage-section">
                <PuzzleThreeQuestionWidget question={question} />
                <PuzzleThreeContainer changeStage={changeStage} choices={choices} playerData={playerData} updatePlayerData={updatePlayerData} wager={wager} />
            </div>
        )
    }

    return null
}

function WagerMeter(props) {
    const { wager, points } = props;

    if (points <= 1) {
        return null
    }

    return (<>
        <div className="wager-range"
            data-tooltip
            data-tool-tip-position="wager-meter"
            aria-description="Wager increases overtime."
        >
            <label htmlFor="wagerRange" className="form-label h2">{wager}</label>
            <input type="range" className="form-range" min={1} max={points} value={wager} id="wagerRange" disabled></input>
        </div>
    </>)

}

function StarButton(props) {
    const { stars, handleClick } = props;
    const [text, setText] = useState("Use ⭐ To Pass")

    if (!stars) {
        return <button className="star-button" style={{ opacity: .25 }} disabled>No Stars</button>
    }
    return <button
        onClick={handleClick}
        onMouseOver={() => setText(`⭐ ${stars}`)}
        onMouseLeave={() => setText("Use ⭐ To Pass")}
        className="star-button"

        data-tooltip
        data-tool-tip-position="star"
        aria-description="Consume a star to pass to the next stage without wagering points."
    >{text}</button>

}


function GameControlsFooter(props) {
    const { playerData, updatePlayerData, wager, updateWager, changeStage, currentStage } = props;
    const { points, available_stars } = playerData;

    function handleStarClick() {
        const handleConsumeStar = async () => {
            const response = await consumeStar();
            const { available_stars, points } = response;
            updatePlayerData({
                ...playerData,
                available_stars,
                points
            })

        }

        handleConsumeStar()
        changeStage()
    }

    useEffect(() => {
        updateWager(points > 0 ? Math.floor(points / 2) : 1)
    }, [currentStage])



    useEffect(() => {
        if (wager < points) {
            const timer = setTimeout(() => {
                updateWager(wager + 1)
            }, Math.floor((points / wager) * 2));

            return () => clearTimeout(timer)
        }

    }, [wager, changeStage])

    return (
        <footer id="game-controls">
            <WagerMeter wager={wager} updateWager={updateWager} points={points} currentStage={currentStage} />
            {/* <MaxWagerButton wager={wager} updateWager={updateWager} points={poin} /> */}
            <MaxWagerButton wager={wager} points={points} updateWager={updateWager} />
            <StarButton stars={available_stars} handleClick={handleStarClick} />
        </footer>
    )

}

function MaxWagerButton(props) {
    const { wager, points, updateWager } = props;
    if (wager >= points) {
        return null
    }

    return (
        <button className="max-wager-button"
            onClick={() => { points > 1 ? updateWager(points) : updateWager(1) }}
            data-tooltip
            data-tool-tip-position="max-wager"
            aria-description="Max out the wager meter."
        >Max Wager</button>
    )


}

function Avatar(props) {
    const { image, display_name: displayName, occupation, country } = props.profile;

    return (
        <div id="avatar-container">
            {image ?
                <img id="avatar-image"
                    className="border rounded-circle border-3 bg-dark bg-opacity-100"
                    src={IMAGE_PREFIX_URL + image} alt="avatar-image" />
                :
                <img id="avatar-image"
                    className="border rounded-circle border-3 bg-dark bg-opacity-100"
                    src="https://img.icons8.com/ios-filled/50/000000/name.png" alt="avatar-image" />
            }

            <div id="avatar-details">
                <p>{displayName}</p>
                <p>👑 1</p>
            </div>
        </div>
    )
}

function ErrorPage(props) {
    const navigate = useNavigate();
    const { message, gameCode } = props;

    useEffect(() => {
        localStorage.removeItem(gameCode)
    }, [])

    function goHome() {
        navigate(`/?gameCode=${gameCode}`)
    }

    return (
        <div className="error-page text-color-change-one">
            <h1>Error Page</h1>
            <h2>{message}</h2>
            <button onClick={goHome} className="exit-error-button">Back to dashboard</button>
        </div>

    )
}


function GameDisplay(props) {
    const { gameCode, background, getRandomBackGroundColor } = props;
    const [playerData, updatePlayerData] = useState(null);
    const [wager, updateWager] = useState(1);

    const [stageArray, updateStageArray] = useState(null);
    const [currentStage, updateCurrentStage] = useState(null);

    const [errorMessage, updateError] = useState(null);

    const navigate = useNavigate();

    function changeStage() {
        const nextStage = stageArray.next()
        if (!nextStage.done) {
            updateCurrentStage(nextStage.value)
            updateStageArray(stageArray)

            const storedIndex = parseInt(localStorage.getItem(gameCode))
            localStorage.setItem(gameCode, storedIndex + 1)
            getRandomBackGroundColor()

        } else {
            localStorage.removeItem(gameCode)
            navigate("/dashboard")
        }
    }

    function* stageGenerator(array) {
        for (let item of array) {
            yield item
        }
    }

    useEffect(() => {
        const getGameData = async () => {
            try {
                const response = await fetchGameData(gameCode);

                if (response) {
                    // set a game position in session storage
                    // you can slice to the current game position
                    // updateCurrentStage(response.stages)
                    // store gameID as key
                    // sotre lastIndex as value
                    // get a stage slice array.slice(lastIndex)

                    const storedIndex = localStorage.getItem(gameCode)

                    if (!storedIndex) {
                        const stageSlice = response.stages.slice()
                        updateCurrentStage(stageSlice.shift())
                        updateStageArray(stageGenerator(stageSlice))
                        localStorage.setItem(gameCode, 0)
                        //TODO: setItem when progressing forward
                    } else {
                        const stageSlice = response.stages.slice(storedIndex)
                        updateCurrentStage(stageSlice.shift())
                        updateStageArray(stageGenerator(stageSlice))
                    }
                }
            } catch (error) {
                updateError(error.message)
            }
        }

        if (!stageArray) {
            getGameData()
        }

    }, [])

    useEffect(() => {
        const getPlayerData = async () => {
            const response = await fetchCurrentUsersGameStats();
            if (response) {
                updatePlayerData(response)
            }
        }
        getPlayerData()
    }, [])

    if (errorMessage) {
        return <ErrorPage message={errorMessage} gameCode={gameCode} />
    }

    if (!playerData || !currentStage) {
        return null
    }


    return (
        <div id="game-display" className={background}>
            <GameHeader>
                <Avatar profile={playerData.profile} />

                {/* <h1>{playerData.available_stars}</h1> */}
                <h1>{playerData.points} </h1>
            </GameHeader>

            <GameStageSection changeStage={changeStage} currentStage={currentStage} updatePlayerData={updatePlayerData} playerData={playerData} wager={wager} />

            <GameControlsFooter currentStage={currentStage} changeStage={changeStage} updatePlayerData={updatePlayerData} playerData={playerData} wager={wager} updateWager={updateWager} />
        </div>
    )
}

export function ActiveGame() {
    const params = useParams();
    const gradientClasses = [
        "gradient-one",
        "gradient-two",
        "gradient-three",
        "gradient-four",
        "gradient-five",
    ]

    const [background, setBackground] = useState(gradientClasses[0])
    const [backgroundCycle, setBackgroundCycle] = useState(null)


    useEffect(() => {
        const shuffledBackgrounds = shuffleArray(gradientClasses)
        setBackgroundCycle(cycle(shuffledBackgrounds))
    }, [])


    function getRandomBackGroundColor() {
        setBackground(backgroundCycle.next().value)
    }

    return (
        <>
            <GameDisplay gameCode={params.gameCode} background={background} getRandomBackGroundColor={getRandomBackGroundColor}></GameDisplay>
        </>
    )
}