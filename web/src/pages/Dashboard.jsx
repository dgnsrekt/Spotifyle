import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { fetchCurrentUsersProfile, updateCurrentUsersProfile } from "../services/profile"
import './Dashboard.css'

function HeaderLink(props) {
    return (
        <a href="#">
            <span className="h4 py-2 px-4 m-0 create">{props.name}</span>
        </a>
    )
}

function LogoutButton(props) {

    return (
        <span className="flex-grow-1 align-self-baseline d-flex justify-content-end align-items-center"><button
            className="btn btn-danger" onClick={props.handleLogout}>Logout</button></span>
    )

}

function HeaderSection(props) {
    return (
        <header>
            <nav className="navbar border border-3 border-dark bg-dark bg-opacity-50">
                <div className="container-md">
                    <div className="col-3"></div>

                    <div className="col-9 mt-4 d-flex" id="header-links">
                        {props.children}

                    </div>
                </div>
            </nav>
        </header>
    )
}


function LeftPanel(props) {
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
    return (
        <div className="row mt-4" id="card-stats">
            <SingleGameStat name={"Rank"} stat={1} image={"https://img.icons8.com/ios-filled/50/000000/crystal.png"} />
            <SingleGameStat name={"Score"} stat={75} image={"https://img.icons8.com/ios-filled/50/000000/sword.png"} />
            <SingleGameStat name={"Stars"} stat={22} image={"https://img.icons8.com/ios-filled/50/000000/pixel-star.png"} />
        </div>

    )
}

function GamesCreatedTable(props) {
    return (
        <div className="row px-4">
            <div className="card bg-dark px-4 my-4">
                <div className="card-body">
                    <h5 className="card-title">Games Created</h5>

                    <table className="table table-dark table-borderless">
                        <thead>
                            <tr>
                                <th scope="col" colSpan="8">Name</th>
                                <th scope="col" colSpan="2">Players</th>
                                <th scope="col" colSpan="2">Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan="8">something-one</td>
                                <td colSpan="2">45</td>
                                <td colSpan="2">fat</td>
                            </tr>
                            <tr>
                                <td colSpan="8">something-one</td>
                                <td colSpan="2">45</td>
                                <td colSpan="2">fat</td>
                            </tr>
                            <tr>
                                <td colSpan="8">something-one</td>
                                <td colSpan="2">45</td>
                                <td colSpan="2">fat</td>
                            </tr>
                        </tbody>

                    </table>

                </div>
            </div>
        </div>

    )
}

function RightSection(props) {
    return (
        <div className="col-9 p-0" id="main-stats">
            <div className="container">
                <GameProfileStats />
                <GamesCreatedTable />
                <GamesCreatedTable />
            </div>
        </div>
    )
}
function MainSection(props) {
    const { profile, updateProfile } = props;

    return (
        <main>
            <div className="container">
                <div className="row">
                    <LeftPanel profile={profile} updateProfile={updateProfile} />
                    <RightSection />
                </div>
            </div>
        </main>
    )

}


export default function Dashboard(props) {
    const [profile, updateProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getCurrentUsersProfile = async () => {
            const profileData = await fetchCurrentUsersProfile();
            if (!profileData) {
                navigate("/")
            }
            console.log(profileData)
            updateProfile(profileData)
        }
        if (!profile) {
            getCurrentUsersProfile()

        }
    }, [])


    return (
        <>
            <HeaderSection>
                <HeaderLink name="Profile" />
                <HeaderLink name="Games" />
                <HeaderLink name="Leaderboard" />
                <LogoutButton handleLogout={props.handleLogout} />
            </HeaderSection>
            {profile &&
                <MainSection profile={profile} updateProfile={updateProfile}></MainSection>
            }
        </>
    )
}