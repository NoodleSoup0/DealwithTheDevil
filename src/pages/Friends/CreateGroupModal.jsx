import React, { useState, useEffect } from 'react';
import './CreateGroupModal.css';
import { Modal, Button, Form, InputGroup, FormControl, Badge } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import googleLogo from '../../images/favicon.svg';
import { useDbAdd, useAuthState } from '../../utilities/firebase';


const CreateGroupModal = ({ usersList, show, onHide, currentUser }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [money, setMoney] = useState('');
  const [groupIcon, setGroupIcon] = useState(googleLogo);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [add, addResult] = useDbAdd('groups');

  const MAX_FRIENDS = 3;

  // Filter users based on the search query when typing
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers([]);
      return;
    }

    const filtered = usersList.filter(
      (user) =>
        !selectedFriends.includes(user.userID) && // Don't show already selected users
        (user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [searchQuery, usersList, selectedFriends]);

  // Handle the input change in the search bar
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle selecting a friend
  const handleFriendSelection = (user) => {
    if (selectedFriends.length >= MAX_FRIENDS) {
      setError(`You can only add up to ${MAX_FRIENDS} friends`);
      return;
    }

    // Debug logging
    console.log("Selecting user:", user);
    
    if (!selectedFriends.includes(user.userID)) {
      setSelectedFriends(prev => [...prev, user.userID]);
      setSearchQuery(''); // Clear search after selection
      setError(''); // Clear any errors
    }
  };

  // Handle removing a selected friend from the list
  const handleRemoveFriend = (userID) => {
    setSelectedFriends(selectedFriends.filter((id) => id !== userID));
    setError(''); // Clear any errors when removing a friend
  };

  // Include the current user in the members array
  const [authUser] = useAuthState(); // This gives the currently authenticated user
  useEffect(() => {
        if (authUser) {
            ; // Set the authenticated user
        }
    }, [authUser]);

  // Submit the group creation
  const handleSubmit = async () => {
    try {
      if (!groupName) {
        setError('Please enter a group name');
        return;
      }

      if (selectedFriends.length === 0) {
        setError('Please add at least one friend');
        return;
      }

      if (!money) {
        setError('Please enter an amount');
        return;
      }

      const groupID = uuidv4();
      const createdAt = Date.now();
    
      const allMembers = currentUser?.userID 
        ? [currentUser.userID, ...selectedFriends] 
        : [...selectedFriends];

      console.log('currentUser:', currentUser);

      const groupData = {
        groupID,
        groupName,
        groupIcon,
        createdAt,
        members: allMembers,
        money: parseFloat(money),
      };
      
      // Debug logging
      console.log('Group data:', groupData);
      console.log('Members array:', allMembers);

      // Call add function and wait for it to complete
      const result = await add(groupData, groupID);
      
      // Handle the response based on the result directly
      if (result && result.error) {
        setError(result.message || 'Error creating group');
      } else {
        onHide();
        // Reset form state
        setGroupName('');
        setSelectedFriends([]);
        setMoney('');
        setSearchQuery('');
        setError('');
      }
    } catch (error) {
      setError('Error creating group: ' + (error.message || error));
      console.error('Error creating group:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md" className="create-group=modal">
      <Modal.Header closeButton>
        <Modal.Title>Create Group</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <p className="text-danger">{error}</p>}

        <Form>
          {/* Group Name */}
          <Form.Group className="mb-3" controlId="groupName">
            <Form.Label>Group Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </Form.Group>

          {/* Display selected friends */}
          <Form.Group className="mb-3" controlId="selectedFriends">
            <Form.Label>
              Selected Friends ({selectedFriends.length}/{MAX_FRIENDS})
            </Form.Label>
            {selectedFriends.length > 0 ? (
              <div className="d-flex flex-wrap gap-2 mb-2">
                {selectedFriends.map((userID) => {
                  const user = usersList.find((u) => u.userID === userID);
                  return user ? (
                    <Badge
                      key={userID}
                      pill
                      bg="primary"
                      className="d-flex align-items-center"
                      style={{ cursor: 'pointer', padding: '8px 12px' }}
                      onClick={() => handleRemoveFriend(userID)}
                    >
                      {user.displayName}
                      <span className="ms-2">×</span>
                    </Badge>
                  ) : null;
                })}
              </div>
            ) : (
              <p className="text-muted small">No friends selected yet</p>
            )}
          </Form.Group>

          {/* Search Friends */}
          <Form.Group className="mb-3" controlId="searchFriends">
            <Form.Label>
              {selectedFriends.length < MAX_FRIENDS
                ? "Search friends by name or email"
                : "Friend limit reached"}
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Type to search friends"
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={selectedFriends.length >= MAX_FRIENDS}
            />
            
            {/* Search Results */}
            {searchQuery.trim() !== '' && (
              <div className="mt-2 search-results border rounded" style={{ maxHeight: '200px', overflow: 'auto' }}>
                {filteredUsers.length === 0 ? (
                  <p className="p-2 m-0 text-muted">No matching users found</p>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.userID}
                      className="p-2 border-bottom d-flex align-items-center"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleFriendSelection(user)}
                    >
                      <div>
                        <div>{user.displayName}</div>
                        <div className="text-muted small">{user.email}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </Form.Group>

          {/* Money Input */}
          <Form.Group className="mb-3" controlId="money">
            <Form.Label>Money</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <FormControl
                type="number"
                placeholder="Enter amount"
                value={money}
                onChange={(e) => setMoney(e.target.value)}
              />
            </InputGroup>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Create Group
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateGroupModal;