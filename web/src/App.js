import './App.css';
import LoginPage from './pages/LoginPage.jsx'
import Dashboard from './pages/Dashboard';
import { Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchJsonWebToken } from './services/auth';

function CallBack(props) {
  let [search, setSearch] = useSearchParams();
  let { setIsLoggedIn } = props;
  let navigate = useNavigate();

  const code = search.get("code")
  const state = search.get("state")

  useEffect(() => {

    const getStoreToken = async () => {
      const token = await fetchJsonWebToken(code, state);
      console.log(token)
      if (token.user) {
        setIsLoggedIn(true)
        sessionStorage.auth = JSON.stringify(token.jwt)
        sessionStorage.user = JSON.stringify(token.user)
        //TODO: Add logic for getting gamecode from state and navigating;
        navigate("/");
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
    sessionStorage.clear()
    setIsLoggedIn(false)
    navigate("/")
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginPage isLoggedIn={isLoggedIn} />} />
        <Route path="dashboard" element={<Dashboard isLoggedIn={isLoggedIn} handleLogout={handleLogout} />} />
        <Route path="callback" element={<CallBack setIsLoggedIn={setIsLoggedIn} />} />
      </Routes>
    </div>
  );
}
export default App;
