import React, { useState } from "react";
import { Container, Button } from "react-bootstrap";
import { X } from "react-bootstrap-icons";
import { IoSettingsOutline } from "react-icons/io5"
import { BsThreeDotsVertical } from 'react-icons/bs';
import { signOut } from '../../utilities/firebase';
import { useNavigate } from 'react-router-dom';
import "./Header.css";

const Header = ({ title }) => {
    const [showProfile, setShowProfile] = useState(false);

    const navigate = useNavigate();

    const handleSignOut = () => {
        signOut();
        navigate('/');
    };

    const handleClose = () => setShowProfile(false);
    const handleShow = () => setShowProfile(true);

    return (
        <div>
            <div className="app-header">
                <Container className="d-flex justify-content-between align-items-center">
                    <h4 className="m-0 header-title">{title}</h4>
                    {/* <BsThreeDotsVertical size={20} className="header-menu-icon" onClick={handleShow} /> */}
                    <IoSettingsOutline size={25} className="header-menu-icon" onClick={handleShow} />
                </Container>
            </div>

            <div className={`profile-popup ${showProfile ? "show" : ""}`}>
                <div className="profile-header-popup">
                    <h5>Sign Out</h5>
                    <X size={24} className="close-icon" onClick={handleClose} />
                </div>
                <div className="profile-body">
                    <Button variant="danger" onClick={handleSignOut}>Sign Out</Button>
                </div>
            </div>

            {showProfile && <div className="overlay" onClick={handleClose}></div>}
        </div>
    );
};

export default Header;
