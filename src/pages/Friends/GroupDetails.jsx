import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Importing useParams and useNavigate
import { users, groups } from '../Friends/mockData.jsx'; // Importing the mock data
import { Card, Button } from "react-bootstrap";
import './GroupDetails.css';

const GroupDetails = () => {
  const { groupID } = useParams(); // Getting groupID from the URL
  const navigate = useNavigate(); // Accessing the navigate function
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Fetch group details based on the groupID using useEffect
  useEffect(() => {
    const groupIDNumber = parseInt(groupID, 10); // Convert the groupID from string to number
    const group = groups.find(g => g.groupID === groupIDNumber); // Find the group using the number
    setSelectedGroup(group); // Set the group details in state
  }, [groupID]);

  // Handle the "Go Back" button click
  const handleGoBack = () => {
    navigate('/friends'); // Navigate to the FriendsPage or previous page
  };

  return (
    <div className="group-details-page">
      
      {/* Custom header container */}
      <div className="group-header">
        {/* Back Button */}
        <Button onClick={handleGoBack} className="back-button">
          &lt; 
        </Button>

        {/* Group Name */}
        {selectedGroup ? (
          <h2 className="group-name">{selectedGroup.groupName}</h2>
        ) : (
          <p>Loading group name...</p>
        )}
      </div>

      {selectedGroup ? (
        <div className="group-details">

          {/* Display each member's card stacked vertically */}
          <div className="member-cards">
            {selectedGroup.friends.map(friendID => {
              const friend = users.find(user => user.userID === friendID);

              return (
                <Card className="member-card" key={friend.userID}>
                  <Card.Body>
                    <div className="member-info">
                      <img src={friend.photoURL} alt={friend.displayName} width="50" className="member-photo" />
                      <div>
                        <h5>{friend.displayName}</h5>
                        <span className="task-completion">
                          {friend.tasks.filter(task => task.completed).length}/{friend.tasks.length} tasks completed
                        </span>
                      </div>
                    </div>

                    <h6>Tasks:</h6>
                    <ul>
                      {friend.tasks.map(task => (
                        <li key={task.taskID}>
                          <span>{task.taskName} - <span>{task.completed ? 'Completed' : 'Pending'}</span></span>
                        </li>
                      ))}
                    </ul>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <p>Loading group details...</p>
      )}
    </div>
  );
};

export default GroupDetails;
