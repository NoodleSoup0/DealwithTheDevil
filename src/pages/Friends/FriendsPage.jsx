import React from 'react';
import './FriendsPage.css';
import Header from '../../components/header/Header';
import { Container } from "react-bootstrap";

const FriendsPage = () => {
  return (
    <div className="friends-page">
      <Header title="Friends" />
      <Container className="friends-page-container">
        <div className="friends-page-content">
          <h1>Friends</h1>
          <p>Check out friends</p>
        </div>
      </Container>
    </div>
  );
};

export default FriendsPage;