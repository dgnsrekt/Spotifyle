import "./PuzzleTwo.css"
import { useEffect, useState, useRef } from 'react';
import { IMAGE_PREFIX_URL, PREVIEW_PREFIX_URL } from "../common";
import { submitAnswer } from "../services/play";


export function PuzzleTwoQuestionWidget(props) {
    const { question } = props;

    return (
        <>
            <blockquote className="roll-in-blurred-left">
                <h1>{question}</h1>
            </blockquote>
        </>
    )
}

function TrackArtWidget(props) {
    const { id } = props.item;
    const { name, spotify_uri, spotify_type, image, preview } = props.item.spotify_asset;

    return (
        <div className="track-art-widget"
            data-tooltip
            data-tool-tip-position="track"
            aria-description={name}
        >
            <img onClick={() => props.handleCheckAnswer(id)}
                className="p2-track-art swirl-in-fwd"
                src={IMAGE_PREFIX_URL + image}
                alt={name}

            />
        </div>
    )
}

function StartButton(props) {
    const [buttonText, setButtonText] = useState("Ready")

    return (
        <button className="start-button"
            onClick={props.handleClick}
            onMouseOver={() => setButtonText("Go!")}
            onMouseLeave={() => setButtonText("Ready")}
        >{buttonText}
        </button>
    )

}

function AudioPlayer(props) {
    const { preview, setStageStarted, showButton, currentStage } = props;

    const [isPlaying, setIsPlaying] = useState(false)

    const source = PREVIEW_PREFIX_URL + preview;

    const audioRef = useRef();
    const isReadyRef = useRef(false);

    useEffect(() => {

        if (audioRef.current && audioRef !== undefined) {

            if (isPlaying) {
                audioRef.current.play()
            } else {
                audioRef.current.pause()
            }

        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            if (isPlaying) {
                setIsPlaying(false)
            }

        }

    }, [isPlaying, currentStage])

    function startPlaying() {
        setIsPlaying(!isPlaying)
        setStageStarted(true)

    }

    return (
        <>
            {!showButton ?
                <audio id="music-player" loop ref={audioRef}>
                    <source src={source} />
                </audio>
                :
                <StartButton handleClick={startPlaying} />
            }

        </>
    )
}

export function PuzzleTwoContainer(props) {
    const { choices, changeStage, currentStage, updatePlayerData, playerData, wager } = props;
    const [song, setSong] = useState(null)

    const [playerAnsweredCorrect, updatePlayerAnsweredCorrect] = useState(null);
    const [correctChoice, updateCorrectChoice] = useState(null);

    const [stageStarted, setStageStarted] = useState(false)

    useEffect(() => {
        setSong(choices[0].spotify_asset.preview)
        setStageStarted(false)

        return () => {
            updatePlayerAnsweredCorrect(null)
            setSong(null)
            setStageStarted(false)
        }
    }, [choices, currentStage])


    function handleCheckAnswer(answerId) {
        const sendAnswer = async () => {
            const response = await submitAnswer(answerId, wager);
            const { available_stars, points } = response.player_profile

            updatePlayerData({
                ...playerData,
                available_stars,
                points
            })

            updateCorrectChoice(response.correct_choice)
            updatePlayerAnsweredCorrect(response.answered_correct)
        }
        sendAnswer()
    }

    if (playerAnsweredCorrect === null) {
        return (
            <div className="p2-container">
                <AudioPlayer currentStage={currentStage} preview={song} showButton={!stageStarted} setStageStarted={setStageStarted} />
                {stageStarted &&
                    <>
                        {choices.map((item, index) => <TrackArtWidget handleCheckAnswer={handleCheckAnswer} key={item.id} item={item} />)}
                    </>
                }
            </div>
        )
    }

    if (playerAnsweredCorrect === true) {
        return (
            <div className="p2-answer-container">
                <h1>CORRECT</h1>
                <TrackArtWidget item={correctChoice} handleCheckAnswer={changeStage} />
            </div>
        )
    }

    if (playerAnsweredCorrect === false) {
        return (
            <div className="p2-answer-container">
                <h1>WRONG</h1>
                <p>The correct answer was...</p>
                <TrackArtWidget item={correctChoice} handleCheckAnswer={changeStage} />
            </div>
        )
    }


}

