import React from 'react';
import './ProfilePage.css';
import { Container, Card } from 'react-bootstrap';
import Header from '../../components/header/Header';
import { useAuthState, useDbData } from '../../utilities/firebase';

const ProfilePage = () => {
  const [user] = useAuthState();
  const [userData] = useDbData(user ? `users/${user.uid}` : null);
  const [allUsers] = useDbData('users');
  const [allGroups] = useDbData('groups');

  if (!userData || !allUsers || !allGroups) {
    return (
      <div className="profile-page">
        <Header title="Profile" />
        <Container className="profile-container">
          <p>Loading profile...</p>
        </Container>
      </div>
    );
  }

  const myProgress = userData?.ProgressTrack?.Active || {};
  const completed = myProgress.Progress || 0;
  const total = myProgress.Total || 0;

  const myGroups = Object.values(allGroups).filter(group =>
    group.members.includes(userData.userID)
  );

  // Losses: if user didn't complete all their tasks
  const isFullyComplete = completed === total;
  const losses = isFullyComplete
    ? 0
    : myGroups.reduce((sum, group) => sum + (group.money || 0), 0);

  // Gains: if group members didn't finish their tasks
  let gains = 0;
  myGroups.forEach(group => {
    group.members.forEach(memberID => {
      if (memberID !== userData.userID) {
        const member = allUsers[memberID];
        const progress = member?.ProgressTrack?.Active;
        if (progress && progress.Total > 0 && progress.Progress < progress.Total) {
          gains += group.money || 0;
        }
      }
    });
  });

  return (
    <div className="profile-page">
      <Header title="Profile" />
      <Container className="profile-container">
        <Card className="profile-card">
          <div className="profile-picture">
            <img src={userData.photoURL} alt="Profile" />
          </div>
          <div className="profile-details">
            <h3>{userData.displayName}</h3>
            <p>{userData.email}</p>
            <hr />
            <p><strong>Tasks Completed:</strong> {completed}/{total}</p>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default ProfilePage;
