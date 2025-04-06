import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Importing useParams and useNavigate
import { useDbData } from '../../utilities/firebase.js'; // Importing the custom hook to fetch data
import { Card, Button } from 'react-bootstrap';
import './FriendDetails.css'; // Importing CSS for styling

const FriendDetails = () => {
  const { userID } = useParams(); // Getting userID from the URL
  const navigate = useNavigate(); // Accessing the navigate function

  const [currentUser, setCurrentUser] = useState(null); // State for current user data
  const [loading, setLoading] = useState(true); // Track loading state for data fetching
  const [groupsData, groupsError] = useDbData('groups');  // Fetching group data
  const [usersData, usersError] = useDbData('users');  // Fetching users data
  const [usersArray, setUsersArray] = useState([]); // State to hold users data
  const [uniqueUsers, setUniqueUsers] = useState([]); // State to hold unique users

  console.log('User ID:', userID); // Debugging log for userID
  console.log('Users Data:', usersData); // Debugging log for users data
  console.log('Groups Data:', groupsData); // Debugging log for groups data

  // Fetch the current user and their groups
  useEffect(() => {
    if (usersData && userID) {
      const currentUserData = usersData[userID]; // Get current user data by userID
      if (currentUserData) {
        setCurrentUser(currentUserData); // Set the current user
      }
    }
  }, [usersData, userID]);

  // Fetch groups where the current user belongs and get unique users
  useEffect(() => {
    if (currentUser && groupsData) {
      // Create a set to track unique users
      const uniqueUserSet = new Set();

      // Loop through each group and add the members to the set
      Object.values(groupsData).forEach((group) => {
        group.members.forEach((memberID) => {
          if (memberID !== currentUser.userID) {
            uniqueUserSet.add(memberID); // Add unique member IDs to the set
          }
        });
      });

      // Convert the set to an array and fetch the corresponding user data
      const uniqueUserIDs = Array.from(uniqueUserSet);
      const uniqueUserData = uniqueUserIDs.map((id) => usersData[id]);
      setUniqueUsers(uniqueUserData); // Set the unique users list
      setUsersArray(Object.values(usersData)); // Set all users to map over later
      setLoading(false); // Set loading to false once data is available
    }
  }, [currentUser, groupsData, usersData]);

  // Handle the "Go Back" button click
  const handleGoBack = () => {
    navigate('/friends'); // Navigate to the FriendsPage or previous page
  };

  if (loading) {
    return (
      <div className="loading-state">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="friend-details-page">
      {/* Custom header container */}
      <div className="friend-header">
        {/* Back Button */}
        <Button onClick={handleGoBack} className="back-button">
          &lt;
        </Button>

        {/* User Info */}
        {currentUser ? (
          <h2 className="user-name">{currentUser.displayName.split(' ')[0]}'s Friends</h2>
        ) : (
          <p>Loading user info...</p>
        )}
      </div>

      {uniqueUsers.length > 0 ? (
        <div className="shared-group-members">
          {uniqueUsers.map((member) => (
            <Card className="member-card" key={member.userID}>
              <Card.Body>
                <div className="member-info">
                  <img
                    src={member.photoURL || 'default-avatar.png'} // Provide a default if no photoURL
                    alt={member.displayName}
                    width="50"
                    className="member-photo"
                  />
                  <div>
                    <h5>{member.displayName}</h5>
                  </div>
                </div>

                <h6>Tasks:</h6>
                <ul>
                  {/* Assuming each user has tasks, if not return a default message */}
                  {member.tasks && Object.values(member.tasks).length > 0 ? (
                    Object.values(member.tasks).map((task) => (
                      <li key={task.TaskID}>
                        <span>{task.TaskName} - <span>{task.Completed ? 'Completed' : 'Pending'}</span></span>
                      </li>
                    ))
                  ) : (
                    <li>No tasks available</li>
                  )}
                </ul>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <p>No shared users found for this user.</p>
      )}
    </div>
  );
};

export default FriendDetails;
