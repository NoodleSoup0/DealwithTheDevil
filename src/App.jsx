import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useAuthState, useDbData } from './utilities/firebase';
import SignInPage from './pages/SignIn/SignInPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import HomePage from './pages/Home/HomePage';
import ProfilePage from './pages/Profile/ProfilePage';
import FriendsPage from './pages/Friends/FriendsPage';
import SchedulePage from './pages/Schedule/SchedulePage';
import NavigationBar from './components/navigation/NavigationBar';
import SmartphoneFrame from './components/phoneframe/SmartphoneFrame';
import './App.css';

const App = () => {
  const [user, loading, error] = useAuthState();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      {!user ? (
        <SignInPage />
      ) : (
        <>
          <div className="main-content">
            <Routes>
              <Route path="/" element={<HomePage user={user} />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <NavigationBar />
        </>
      )}
    </>
  );
};

const SmartphoneScreen = ({ children }) => {
  return (
    <div className="smartphone-container-new">
      <div className="smartphone-new">
        <div className="smartphone-content-new">{children}</div>
      </div>
    </div>
  );
}

const AppWrapper = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // the intention here is to remove the smartphone frame for mobile view
  // but it's not working as expected so I'm just going to leave it as is
  // will come back to this later if we have time
  return (
    // <Router>
    //   {isMobile ? <SmartphoneScreen><App /></SmartphoneScreen> : <SmartphoneFrame><App /></SmartphoneFrame>}
    // </Router>
    <Router>
      <SmartphoneFrame><App /></SmartphoneFrame>
    </Router>
  );
};

export default AppWrapper;