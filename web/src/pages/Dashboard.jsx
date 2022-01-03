import { useState, useEffect } from "react";
import { useNavigate, Link, Outlet } from "react-router-dom";
import { fetchCurrentUsersProfile } from "../services/profile";
import { createNewGame } from "../services/game";
import { LeftPanel } from "./ProfileOverviewSection"
import { getAuthenticatedUserFromStorage } from "../services/core";
import "./Dashboard.css"


export function CreateGameButton() {
    const navigate = useNavigate();

    function handleCreateNewGame(event) {

        const startCreatingGame = async () => {
            const gameCreationStatus = await createNewGame();

            if (gameCreationStatus) {
                navigate(`/create/${gameCreationStatus.task_id}`)
            }
        }
        startCreatingGame()
    }
    return <button onClick={handleCreateNewGame} className="btn btn-success">Create New Game</button>
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

function HeaderLink(props) {
    const { linkTo } = props;
    return (
        <Link to={linkTo}>
            <span className="h4 py-2 px-4 m-0 create">{props.name}</span>
        </Link>
    )
}

function LogoutButton(props) {

    return (
        <span id='logout-button'><button
            className="btn btn-danger" onClick={props.handleLogout}>Logout</button></span>
    )

}
function DashBoard(props) {
    const { profile, updateProfile, userInformation } = props;

    return (
        <main>
            <div className="container">
                <div className="row">
                    <LeftPanel profile={profile} updateProfile={updateProfile} userInformation={userInformation} />
                    {props.children}
                </div>
            </div>
        </main>
    )
}

export default function MainPage(props) {
    const [profile, updateProfile] = useState(null);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [userInformation, updateUserInformation] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        const getCurrentUsersProfile = async () => {
            const profileData = await fetchCurrentUsersProfile();
            if (!profileData) {
                navigate("/")
                localStorage.clear()
            }
            updateProfile(profileData)
            setDataLoaded(profileData.data_loaded)
        }
        if (!profile) {
            getCurrentUsersProfile()
        }
        if (!dataLoaded) {
            setTimeout(() => { getCurrentUsersProfile() }, 2000)
        }

        updateUserInformation(getAuthenticatedUserFromStorage())


    }, [profile])

    return (
        <>
            <HeaderSection>
                <HeaderLink name="Profile" linkTo={"/dashboard"} />
                <HeaderLink name="Games" linkTo={"/dashboard/games"} />
                <HeaderLink name="Leaderboard" linkTo={"/dashboard/leaderboard"} />
                <div className="button-group">
                    {
                        dataLoaded &&
                        <CreateGameButton />
                    }
                    <LogoutButton handleLogout={props.handleLogout} />
                </div>
            </HeaderSection>
            {profile &&
                <DashBoard profile={profile} updateProfile={updateProfile} userInformation={userInformation}>
                    <Outlet />
                </DashBoard>
            }
        </>
    )
}