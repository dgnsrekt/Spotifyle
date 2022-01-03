import './LoginPage.css'
import { fetchSpotifyRedirect } from '../services/auth'
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../animations/text.css'
import '../animations/vibrate.css'
import { shuffleArray, cycle } from "../animations/helpers"


export default function LoginPage(props) {
    const [redirectUrl, setRedirectUrl] = useState(null)
    const { isLoggedIn } = props;
    const [search, setSearch] = useSearchParams()
    const navigate = useNavigate();

    const gameCode = search.get("gameCode")


    const gradientClasses = [
        "text-color-change-one",
        "text-color-change-two"
    ]
    const [background, setBackground] = useState(gradientClasses[0])
    const [backgroundCycle, setBackgroundCycle] = useState(null)


    useEffect(() => {
        const shuffledBackgrounds = shuffleArray(gradientClasses)
        setBackgroundCycle(cycle(shuffledBackgrounds))
    }, [])


    function getRandomBackGroundColor() {
        setBackground(backgroundCycle.next().value)
    }


    useEffect(() => {
        const getSpotifyRedirect = async () => {
            const redirect = await fetchSpotifyRedirect(gameCode)
            if (redirect) {
                setRedirectUrl(redirect.url)
            }
        }
        if (!isLoggedIn) {
            getSpotifyRedirect()
        } else {
            navigate("dashboard")
        }

        return () => {
            setRedirectUrl(null)
        }
    }, [])

    return (
        <div onClick={getRandomBackGroundColor} className='login-page container'>
            <h1 className={background}>Topsifyle</h1>
            {redirectUrl &&
                <a href={redirectUrl} className='vibrate btn btn-success btn-lg'>
                    Login
                </a>
            }
        </div>
    )
}