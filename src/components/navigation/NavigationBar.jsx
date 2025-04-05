import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { LuListTodo } from "react-icons/lu";
import './NavigationBar.css';

const NavigationBar = () => {
    const navigate = useNavigate();

    return (
        <>
            <Navbar className="navbar">
                <Container className="d-flex justify-content-center align-items-center">
                    <Nav className="w-100 d-flex justify-content-between align-items-center position-relative">
                        <Nav.Link as={NavLink} to="/" className="nav-icon" activeclassname="active">
                            <i className="bi bi-house-door-fill"></i>
                            <p>Home</p>
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/schedule" className="nav-icon" activeclassname="active">
                            <LuListTodo size={28} />
                            <p>Schedule</p>
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/friends" className="nav-icon" activeclassname="active">
                            <i className="bi bi-people-fill"></i>
                            <p>Friends</p>
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/profile" className="nav-icon" activeclassname="active">
                            <i className="bi bi-person-circle"></i>
                            <p>Profile</p>
                        </Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
        </>
    );
};

export default NavigationBar;
