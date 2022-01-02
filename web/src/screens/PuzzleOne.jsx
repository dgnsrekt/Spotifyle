
import { useEffect, useState } from "react";
import { submitAnswer } from "../services/play"
import { IMAGE_PREFIX_URL } from "../common"
import './PuzzleOne.css'

export function PuzzleOneQuestionWidget(props) {
    const { question } = props;

    return (
        <blockquote id="puzzle-one-question" className="roll-in-blurred-left">
            <h1>Artist Trivia</h1>
            <p>
                {question}
            </p>
        </blockquote>
    )
}

function PuzzleOneChoiceWidget(props) {
    const { choice, handleOnClick } = props;

    return (
        <div onClick={() => handleOnClick(choice.id)}
            className="puzzle-one-choice-card roll-in-blurred-left"
        >
            <div className="puzzle-one-choice-widget">
                <img src={IMAGE_PREFIX_URL + choice.spotify_asset.image} alt="choice" />
                <p>{choice.spotify_asset.name}</p>
            </div>
        </div>
    )
}

export function PuzzleOneContainer(props) {
    const { choices, changeStage, updatePlayerData, playerData, wager } = props;
    const [playerAnsweredCorrect, updatePlayerAnsweredCorrect] = useState(null);
    const [correctChoice, updateCorrectChoice] = useState(null);

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

            updateCorrectChoice(response.correct_choice)
            updatePlayerAnsweredCorrect(response.answered_correct)
        }
        //TODO: go to next sage
        sendAnswer()
    }



    if (playerAnsweredCorrect === null) {
        return (
            <div id="puzzle-one-container">
                {choices.map((choice, index) => <PuzzleOneChoiceWidget key={index} choice={choice} handleOnClick={handleCheckAnswer} />)}
            </div>
        )
    }

    if (playerAnsweredCorrect === true) {
        return (
            <div className="puzzle-one-answer">
                <h1>Correct</h1>
                <PuzzleOneChoiceWidget choice={correctChoice} handleOnClick={changeStage} />
            </div>
        )
    }

    if (playerAnsweredCorrect === false) {
        return (
            <div className="puzzle-one-answer">
                <h1 className="flicker-in-1">WRONG</h1>
                <h4>{correctChoice.spotify_asset.name} was the <strong>CORRECT</strong> answer.</h4>
                <PuzzleOneChoiceWidget choice={correctChoice} handleOnClick={changeStage} />
            </div>
        )

    }
}