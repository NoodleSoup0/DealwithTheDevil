import React from 'react';
import './SchedulePage.css';
import Header from '../../components/header/Header';
import { Container } from "react-bootstrap";

const SchedulePage = () => {
  return (
    <div className="schedule-page">
      <Header title="Schedule" />
      <Container className="schedule-page-container">
        <div className="schedule-page-content">
          <h1>Schedule</h1>
          <p>Your Schedule Here</p>
        </div>
      </Container>
    </div>
  );
};

export default SchedulePage;