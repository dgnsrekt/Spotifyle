import { useState, useEffect } from "react";
import { useNavigate, Link, Outlet } from "react-router-dom";
import { fetchCurrentUsersProfile } from "../services/profile";
import { LeftPanel } from "./ProfileOverviewSection"
import { getAuthenticatedUserFromStorage } from "../services/core";
import "./Dashboard.css"

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
        <span id='logout-button' className="flex-grow-1 align-self-baseline d-flex justify-content-end align-items-center"><button
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
    const [userInformation, updateUserInformation] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        const getCurrentUsersProfile = async () => {
            const profileData = await fetchCurrentUsersProfile();
            if (!profileData) {
                navigate("/")
                sessionStorage.clear()
            }
            updateProfile(profileData)
        }
        if (!profile) {
            getCurrentUsersProfile()
        }
        updateUserInformation(getAuthenticatedUserFromStorage())

    }, [])

    return (
        <>
            <HeaderSection>
                <HeaderLink name="Profile" linkTo={"/dashboard"} />
                <HeaderLink name="Games" linkTo={"/dashboard/games"} />
                <HeaderLink name="Leaderboard" linkTo={"/dashboard/leaderboard"} />
                <LogoutButton handleLogout={props.handleLogout} />
            </HeaderSection>
            {profile &&
                <DashBoard profile={profile} updateProfile={updateProfile} userInformation={userInformation}>
                    <Outlet />
                </DashBoard>
            }
        </>
    )
}