import './App.css';
import LoginPage from './pages/LoginPage.jsx'
import MainPage from './pages/Dashboard';
import { ActiveGame } from './screens/ActiveGameScreen';
import { CreateGameScreen } from './screens/GameCreationScreen';
import { ProfileOverviewSection } from './pages/ProfileOverviewSection';
import { GamesOverviewSection } from './pages/GamesOverviewSection';
import { Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchJsonWebToken } from './services/auth';
import { LeaderBoardSection } from './pages/LeaderBoard';

function CallBack(props) {
  let [search, setSearch] = useSearchParams();
  let { setIsLoggedIn } = props;
  let navigate = useNavigate();

  const code = search.get("code")
  const state = search.get("state")

  function getGameCodeFromState(state) {
    const decoded = decodeURI(state).split(":")
    if (decoded.length < 2) {
      return null
    }
    return decoded[1]
  }

  useEffect(() => {

    const getStoreToken = async () => {
      const token = await fetchJsonWebToken(code, state);
      if (token.user) {
        setIsLoggedIn(true)
        localStorage.auth = JSON.stringify(token.jwt)
        localStorage.user = JSON.stringify(token.user)
        //TODO: Add logic for getting gamecode from state and navigating;

        const gameCode = getGameCodeFromState(state)
        if (gameCode) {
          navigate(`/play/${gameCode}`);
        } else {
          navigate("/");
        }
      }
    }

    getStoreToken()
  }, [])

  return null
}




function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  let navigate = useNavigate();

  function handleLogout() {
    localStorage.clear()
    setIsLoggedIn(false)
    navigate("/")
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginPage isLoggedIn={isLoggedIn} />} />
        <Route path="dashboard" element={<MainPage isLoggedIn={isLoggedIn} handleLogout={handleLogout} />} >
          <Route index element={<ProfileOverviewSection />} />
          <Route path="games" element={<GamesOverviewSection />} />
          <Route path="leaderboard" element={<LeaderBoardSection />} />
        </Route>
        <Route path="callback" element={<CallBack setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="create/:taskID" element={<CreateGameScreen />} />
        {/* <Route path="start" element={} /> */}
        <Route path="play/:gameCode" element={<ActiveGame />} />
      </Routes>
    </div>
  );
}
export default App;
