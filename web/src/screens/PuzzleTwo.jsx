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

export function TrackArtWidget(props) {
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
export function PuzzleTwoContainer(props) {
    const { choices, changeStage, updatePlayerData, playerData, wager } = props;
    const [isPlaying, setIsPlaying] = useState(false)
    const [buttonText, setButtonText] = useState("Ready")
    const audioRef = useRef();

    const [playerAnsweredCorrect, updatePlayerAnsweredCorrect] = useState(null);
    const [correctChoice, updateCorrectChoice] = useState(null);


    useEffect(() => {
        return () => {
            if (audioRef == null) {
                return
            }
            if (!audioRef.current.paused) {
                audioRef.current.pause()
                updatePlayerAnsweredCorrect(null)
            }
        };
    }, []);

    useEffect(() => {
        updatePlayerAnsweredCorrect(null)
    }, [choices])

    function handleCheckAnswer(answerId) {
        const sendAnswer = async () => {
            const response = await submitAnswer(answerId, wager);
            const { available_stars, points } = response.player_profile

            updatePlayerData({
                ...playerData,
                available_stars,
                points
            })
            console.log(response)

            updateCorrectChoice(response.correct_choice)
            updatePlayerAnsweredCorrect(response.answered_correct)
        }
        //TODO: go to next sage
        if (!audioRef.current.paused) {
            sendAnswer()
            setIsPlaying(audioRef.current.paused)
        }
    }

    function handleClick(event) {
        if (audioRef.current.paused) {
            audioRef.current.play()
            setIsPlaying(!audioRef.current.paused)
        }
    }

    if (playerAnsweredCorrect === null) {
        return (
            <div className="p2-container">
                <audio id="music-player" loop ref={audioRef}>
                    <source src={PREVIEW_PREFIX_URL + choices[0].spotify_asset.preview} />
                </audio>

                {
                    isPlaying ?
                        <>
                            {choices.map((item, index) => <TrackArtWidget handleCheckAnswer={handleCheckAnswer} key={item.id} item={item} />)}
                        </>
                        :
                        <button className="start-button"
                            onClick={handleClick}
                            onMouseOver={() => setButtonText("Go!")}
                            onMouseLeave={() => setButtonText("Ready")}
                        >{buttonText}</button>
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

