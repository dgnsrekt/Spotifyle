import './LoginPage.css'
import { fetchSpotifyRedirect } from '../services/auth'
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';



export default function LoginPage(props) {
    const [redirectUrl, setRedirectUrl] = useState(null)
    const { isLoggedIn } = props;
    const navigate = useNavigate();

    useEffect(() => {
        const getSpotifyRedirect = async () => {
            const redirect = await fetchSpotifyRedirect()
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
        <div className='login-page container'>
            <h1 className='text-color-change'>Topsifyle</h1>
            {redirectUrl &&
                <a href={redirectUrl} className='vibrate btn btn-success btn-lg'>
                    Login
                </a>
            }
        </div>
    )
}