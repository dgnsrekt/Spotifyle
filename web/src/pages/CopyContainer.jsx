import urlcat from "urlcat";
import { HOST_PREFIX_URL } from "../common";

export function CopyContainer(props) {
    const { gameCode } = props;
    const url = urlcat(HOST_PREFIX_URL, "/play/:gameCode", { gameCode: gameCode })

    async function copy() {
        await navigator.clipboard.writeText(url)
    }

    return (
        <div>
            <button className="btn btn-danger" onClick={copy}>Share 📋</button>
        </div>
    )
}