import { useParams } from "react-router-dom";

export function ActiveGame() {
    const params = useParams();
    return (

        <h1>ActiveGame: {params.gameCode}</h1>
    )
}