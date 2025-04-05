import React from 'react';
import './ProfilePage.css';
import Header from '../../components/header/Header';
import { Container } from "react-bootstrap";

const ProfilePage = () => {
  return (
    <div className="profile-page">
      <Header title="Profile" />
      <Container className="profile-page-container">
        <div className="profile-page-content">
          <h1>Profile</h1>
          <p>Your Profile Here</p>
        </div>
      </Container>
    </div>
  );
};

export default ProfilePage;