import React, { useState, useEffect } from 'react';
import './FriendsPage.css';
import Header from '../../components/header/Header';
import { Container, Card, Button, Modal, Form } from "react-bootstrap";
import { useNavigate } from 'react-router-dom'; // Importing useNavigate
import CreateGroupModal from './CreateGroupModal.jsx';
// Mock data for groups (you can replace it with your Firebase data later)
// import { groups, users } from '../Friends/mockData.jsx';
import { useDbData } from '../../utilities/firebase.js';


const FriendsPage = () => {
 const navigate = useNavigate(); // Using useNavigate hook to get the navigate function
  // Using fetch groups and users from the DB
 const [groupsData, groupsError] = useDbData('groups');
 const [usersData, usersError] = useDbData('users');
  const [groupsList, setGroupsList] = useState([]);
 const [usersList, setUsersList] = useState([]);


 useEffect(() => {
   if (groupsData) {
     setGroupsList(Object.values(groupsData));
   }
   if (usersData) {
     setUsersList(Object.values(usersData));
   }
 }, [groupsData, usersData]);


 // Modal visibility states
 const [showAddFriendModal, setShowAddFriendModal] = useState(false);
 const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  // Modal form data
 const [selectedFriends, setSelectedFriends] = useState([]);
 const [groupName, setGroupName] = useState('');


 // Handle group selection to navigate to GroupDetails
 const handleGroupClick = (groupID) => {
   navigate(`/group-details/${groupID}`); // Navigating to the group details page
 };


 // Handle add friend button click
 const handleAddFriendClick = () => {
   setShowAddFriendModal(true); // Show Add Friend modal
 };


 // Handle create group button click
 const handleCreateGroupClick = () => {
   setShowCreateGroupModal(true); // Show Create Group modal
 };


 // Handle Add Friend Modal submission
 const handleAddFriendSubmit = () => {
   console.log("Friends added:", selectedFriends);


   setShowAddFriendModal(false); // Close the modal
   setSelectedFriends([]); // Reset selected friends
 };


 // Handle Create Group Modal submission
 const handleCreateGroupSubmit = () => {
   console.log("Creating group with name:", groupName);
   console.log("Selected friends for the group:", selectedFriends);




   setShowCreateGroupModal(false); // Close the modal
   setGroupName(''); // Reset group name
   setSelectedFriends([]); // Reset selected friends
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
           {groupsList.map(group => (
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


     {/* Add Friend Modal */}
    
     <CreateGroupModal
       usersList = {usersList}
       show={showCreateGroupModal}
       onHide={() => setShowCreateGroupModal(false)}
       groupName={groupName}
       setGroupName={setGroupName}
       selectedFriends={selectedFriends}
       setSelectedFriends={setSelectedFriends}
       onSubmit={handleCreateGroupSubmit}
     />
   </div>
 );
};


export default FriendsPage;