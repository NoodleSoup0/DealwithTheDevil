import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Importing useParams and useNavigate
import { useDbData } from '../../utilities/firebase.js'; // Importing the custom hook to fetch data
import { Card, Button } from 'react-bootstrap';
import './GroupDetails.css';

const GroupDetails = () => {
  const { groupID } = useParams(); // Getting groupID from the URL
  const navigate = useNavigate(); // Accessing the navigate function

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state for data fetching
  const [groupsData, groupsError] = useDbData('groups');  // Fetching group data
  const [usersData, usersError] = useDbData('users');  // Fetching users data
  const [usersArray, setUsersArray] = useState([]); // State to hold users data

  console.log('Group ID:', groupID); // Debugging log for groupID
  console.log('Groups Data:', groupsData); // Debugging log for groups data
  console.log('Users Data:', usersData); // Debugging log for users data

  // Fetch the group data and user data, and match them
  useEffect(() => {
    if (groupsData && usersData) {
      // Convert groupsData and usersArray object to an array of groups
      const groupsArray = Object.values(groupsData);
      const userArray = Object.values(usersData);
      setUsersArray(userArray); // Set users array
      
      // Find the selected group by its groupID
      const group = groupsArray.find(group => group.groupID === groupID); // Convert groupID to number
      if (group) {
        setSelectedGroup(group); // Set the selected group
        console.log('Selected Group:', group); // Debugging log for selected group
        setLoading(false); // Set loading to false once data is available
      } else {
        console.error('Group not found');
      }
    }
  }, [groupsData, usersData, groupID]); // Run effect when groupsData, usersData, or groupID changes

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
            {selectedGroup.members && selectedGroup.members.length > 0 ? (
              selectedGroup.members.map((friendID) => {
                // Find user matching the member's userID
                const friend = usersArray.find((user) => user.userID === friendID);
                console.log('friend:', friend); // Debugging log for friend data
                if (friend) {
                  // Convert tasks object into an array of tasks
                  const listtasks = Object.values(friend.tasks || {}); // Ensure tasks is an object, fallback to empty object
                  console.log('listtasks:', listtasks); // Debugging log for tasks data
                  
                  return (
                    <Card className="member-card" key={friend.userID}>
                      <Card.Body>
                        <div className="member-info">
                          <img src={friend.photoURL} alt={friend.displayName} width="50" className="member-photo" />
                          <div>
                            <h5>{friend.displayName}</h5>
                          </div>
                        </div>

                        <h6>Tasks:</h6>
                        <ul>
                          {listtasks.length > 0 ? (
                            listtasks.map((task) => (
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
                  );
                }
                return null;
              })
            ) : (
              <p>No members in this group.</p>
            )}
          </div>
        </div>
      ) : (
        <p>Loading group details...</p>
      )}
    </div>
  );
};

export default GroupDetails;
