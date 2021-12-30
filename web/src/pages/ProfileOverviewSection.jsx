import { useEffect, useState } from "react"
import { fetchCurrentUsersGameStats } from "../services/play";
import { fetchGamesCurrentUserPublished } from "../services/game";
import { updateCurrentUsersProfile } from "../services/profile";
import './Dashboard.css'



export function LeftPanel(props) {
    const [editMode, setEditMode] = useState(false);
    const { profile, updateProfile } = props;
    const [formData, updateFormData] = useState(profile)

    const imagePrefix = "https://i.scdn.co";

    function handleFormSubmit(event) {
        event.preventDefault()
        const submitProfileChange = async () => {
            const profileData = await updateCurrentUsersProfile(formData);
            updateProfile(profileData)
        }
        submitProfileChange()
        setEditMode(false)

    }
    function handleOnChange(event) {
        updateFormData({
            ...formData,
            [event.target.name]: event.target.value.trim()
        })
    }

    return (
        <div id="left-panel" className="col-3 p-0">
            <div className="container p-2 position-relative">
                <img src={imagePrefix + profile.image} alt="icon"
                    id="profile-image"
                    className="border rounded-circle border-3 bg-dark bg-opacity-100" />
            </div>
            {
                !editMode ?

                    <div className="container p-2">
                        <div className="h3 bold">{profile.display_name}</div>
                        <div className="h6 bold">{profile.occupation}</div>
                        <div className="h6 bold">{profile.country}</div>
                        <div className="h6 bold">{profile.twitter}</div>
                        <div className="h6 bold">{profile.bio}</div>
                        <button onClick={() => { setEditMode(true) }} className="btn btn-secondary">Edit Profile</button>
                    </div>
                    :
                    <div className="container p-2">
                        <div className="h3 bold">{profile.display_name}</div>
                        <div className="h6 bold">{profile.occupation}</div>
                        <div className="h6 bold">{profile.country}</div>

                        <form onSubmit={(event) => handleFormSubmit(event)}>

                            <div className="form-group row">
                                <label htmlFor="twitterInput" className="col-form-label-sm">Twitter</label>
                                <div className="col-sm-10">
                                    <input type="text" onChange={handleOnChange} className="form-control form-control-sm" id="twitterInput" defaultValue={profile.twitter} name="twitter" />
                                </div>
                            </div>

                            <div className="form-group row">
                                <label htmlFor="bioInput" className="col-form-label-sm">Bio</label>
                                <div className="col-sm-10">
                                    <input type="text" onChange={handleOnChange} className="form-control form-control-sm" id="bioInput" defaultValue={profile.bio} name="bio" />
                                </div>
                            </div>
                            <button className="btn btn-secondary mt-3">Submit</button>
                        </form>
                    </div>
            }
        </div>
    )

}

function SingleGameStat(props) {
    return (
        <div className="card col m-4 bg-dark bg-opacity-75">
            <div className="card-body">
                <h5 className="card-title fs-4">{props.name}</h5>

                <div className="d-flex justify-content-around align-items-center">
                    <img src={props.image} />
                    <p className="card-text fs-2">{props.stat}</p>
                </div>

            </div>
        </div>
    )
}

function GameProfileStats(props) {
    const { playerStats } = props;

    return (
        <div className="row mt-4" id="card-stats">
            <SingleGameStat name={"Rank"} stat={1} image={"https://img.icons8.com/ios-filled/50/000000/crystal.png"} />
            <SingleGameStat name={"Score"} stat={playerStats.points} image={"https://img.icons8.com/ios-filled/50/000000/sword.png"} />
            <SingleGameStat name={"Stars"} stat={playerStats.avaliable_stars} image={"https://img.icons8.com/ios-filled/50/000000/pixel-star.png"} />
        </div>

    )
}

function GamesCreatedTable(props) {
    const { publishedGamesList } = props;

    function Row(props) {
        return (
            <tr>
                <td colSpan="8">{props.item.name}</td>
                <td colSpan="2">{props.item.game_code}</td>
                <td colSpan="2">{props.item.processed ? "true" : "false"}</td>
            </tr>
        )
    }

    return (
        <div className="row px-4">
            <div className="card bg-dark px-4 my-4">
                <div className="card-body">
                    <h5 className="card-title">Games Created</h5>

                    <table className="table table-dark table-borderless">
                        <thead>
                            <tr>
                                <th scope="col" colSpan="8">Game Name</th>
                                <th scope="col" colSpan="2">Game Code</th>
                                <th scope="col" colSpan="2">Processed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {publishedGamesList.map((item, index) => <Row key={index} item={item} />)}
                        </tbody>

                    </table>
                </div>
            </div>
        </div>

    )
}

export function ProfileOverviewSection() {
    const [publishedGamesList, updatePublishedGamesList] = useState([])
    const [playerStats, updatePlayerStats] = useState({})

    useEffect(() => {
        const getGamesUserPublished = async () => {
            const gameList = await fetchGamesCurrentUserPublished()
            updatePublishedGamesList(gameList)
        }
        getGamesUserPublished()
    }, [])

    useEffect(() => {
        const getPlayerStats = async () => {
            const stats = await fetchCurrentUsersGameStats()
            updatePlayerStats(stats)
        }
        getPlayerStats()
    }, [])


    return (
        <div className="col-9 p-0" id="main-stats">
            <div className="container">

                <GameProfileStats playerStats={playerStats} />
                {
                    publishedGamesList &&
                    <GamesCreatedTable publishedGamesList={publishedGamesList} />
                }
            </div>
        </div>
    )
}
