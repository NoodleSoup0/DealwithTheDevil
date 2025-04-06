import React from 'react';
import './FriendsPage.css';
import Header from '../../components/header/Header';
import { Container, Card, Button } from "react-bootstrap";
import { groups } from '../Friends/mockData.jsx'; // Importing the mock data
import { useNavigate } from 'react-router-dom'; // Importing useNavigate

const FriendsPage = () => {
  const navigate = useNavigate(); // Using useNavigate hook to get the navigate function

  // Handle group selection to navigate to GroupDetails
  const handleGroupClick = (groupID) => {
    navigate(`/group-details/${groupID}`); // Navigating to the group details page
  };

  // Handle add friend button click
  const handleAddFriendClick = () => {
    // Add logic for adding a friend (e.g., navigate to an add friend page or open a modal)
    console.log("Add Friend button clicked");
  };

  // Handle create group button click
  const handleCreateGroupClick = () => {
    // Add logic for creating a group (e.g., navigate to a create group page or open a modal)
    console.log("Create Group button clicked");
  };

  return (
    <div className="friends-page">
      <Header title="Friends" />
      <Container className="friends-page-container">
        <div className="friends-page-content">
          <h1>Friend Groups</h1>

          {/* Add Friend and Create Group Buttons */}
          <div className="friends-page-buttons">
            <Button variant="primary" onClick={handleAddFriendClick}>
              Add Friend
            </Button>
            <Button variant="success" onClick={handleCreateGroupClick}>
              Create Group
            </Button>
          </div>

          {/* Display Group Cards */}
          <div className="groups-list">
            {groups.map(group => (
              <Card key={group.groupID} className="group-card" onClick={() => handleGroupClick(group.groupID)}>
                <Card.Body className="group-card-body">
                  <div>
                    <Card.Img variant="top" src={group.groupIcon} />
                  </div>
                  <div>
                    <Card.Title>{group.groupName}</Card.Title>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default FriendsPage;
