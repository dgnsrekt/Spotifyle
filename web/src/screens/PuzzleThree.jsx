import { useState, useEffect, useRef } from 'react';
import { IMAGE_PREFIX_URL, PREVIEW_PREFIX_URL } from '../common';
import { submitStageThreeAnswer } from '../services/play';
import "./PuzzleThree.css"

export function PuzzleThreeQuestionWidget(props) {
    const { question } = props;

    return (
        <>
            <blockquote className="roll-in-blurred-left">
                <h1>{question}</h1>
                <h4>Scroll over the art to play the song.</h4>
                <h4>Lock in the art that matches the track.</h4>
            </blockquote>
        </>
    )
}

function PuzzleThreeChoiceWidget(props) {
    const { index, toggleChoice, choice, choiceListStatus, selected } = props;
    const { id, spotify_asset: SpotifyAsset } = choice;
    const { image, name, preview } = SpotifyAsset;
    const audioRef = useRef();

    function pause(event) {
        const element = audioRef.current;
        if (!element.paused) {
            element.pause()
        }
    }

    function play(event) {
        const element = audioRef.current;
        if (element.paused) {
            element.play()
        } else {
            element.pause()
        }
    }

    return (
        <div className={selected ? "puzzle-three-choice-widget selected-cover" : "puzzle-three-choice-widget"} >
            <a onClick={() => toggleChoice(index)} onMouseEnter={play} onMouseLeave={pause} >
                <img src={IMAGE_PREFIX_URL + image} alt="choice" className="track-art" />
                <audio width="200" height="200" preload="auto" ref={audioRef}>

                    <source src={PREVIEW_PREFIX_URL + preview} type="audio/mp3" />
                    Your browser does not support the video tag.
                </audio>
            </a>
        </div >
    )
}

export function PuzzleThreeContainer(props) {
    const { choices, changeStage, updatePlayerData, playerData, wager } = props;
    const [playerAnsweredCorrect, updatePlayerAnsweredCorrect] = useState(null);
    const [choiceListStatus, updateChoiceList] = useState([false, false, false, false])

    function toggleChoice(index) {
        const choiceListSlice = choiceListStatus.slice()
        choiceListSlice[index] = !choiceListSlice[index]
        updateChoiceList(choiceListSlice)
    }

    function handleCheckAnswer() {
        let answerBody = [];

        for (let [index, value] of choices.entries()) {
            let answer = choiceListStatus[index];
            answerBody.push({ id: value.id, answer: answer })
        }

        const sendAnswer = async () => {

            const response = await submitStageThreeAnswer(wager, answerBody);
            const { answered_correct: answeredCorrect } = response;
            const { available_stars, points } = response.player_profile;
            updatePlayerData({
                ...playerData,
                available_stars,
                points
            })
            updatePlayerAnsweredCorrect(answeredCorrect)
        }

        //     //TODO: go to next sage
        sendAnswer()
    }


    useEffect(() => {
        updatePlayerAnsweredCorrect(null)
        updateChoiceList([false, false, false, false])
    }, [choices])

    if (playerAnsweredCorrect === null) {
        return (
            <>
                <div id="puzzle-three-container">
                    {choices.map((choice, index) => <PuzzleThreeChoiceWidget key={index} index={index} choice={choice} toggleChoice={toggleChoice} choiceListStatus={choiceListStatus} selected={choiceListStatus[index]} />)}
                </div>
                <button onClick={handleCheckAnswer} className="puzzle-three-submit-button">Submit Answer</button>
            </>
        )
    }

    if (playerAnsweredCorrect === true) {
        return (
            <div id="puzzle-three-container">
                <h2 className="swirl-in-fwd">Correct</h2>
                <button onClick={changeStage} className="puzzle-three-next-button">Next</button>
            </div>
        )
    }
    if (playerAnsweredCorrect === false) {
        return (
            <div id="puzzle-three-container">
                <h2 className="bounce-in-top">Wrong</h2>
                <button onClick={changeStage} className="puzzle-three-next-button">Next</button>
            </div>
        )
    }
}