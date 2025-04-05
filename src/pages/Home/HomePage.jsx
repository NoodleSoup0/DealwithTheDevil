import React from 'react';
import './HomePage.css';
import Header from '../../components/header/Header';
import { Container } from "react-bootstrap";

const HomePage = () => {
    return (
        <div className="home-page">
            <Header title="Home" />
            <Container className="home-page-container">
                <div className="home-page-content">
                    <h1>Progress 4 U</h1>
                    <p>Track your progress and stay motivated!</p>
                </div>
            </Container>
        </div>
    );
};

export default HomePage;