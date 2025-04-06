import React, { useState } from 'react';
import './HomePage.css';
import Header from '../../components/header/Header';
import { Container, Row, Col } from "react-bootstrap";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import ProgressBar from 'react-bootstrap/ProgressBar';
import 'react-circular-progressbar/dist/styles.css';
import { useAuthState, useDbData, useDbUpdate } from "../../utilities/firebase";


const HomePage = () => {
    //format date
    const formatDate = (date) => {
        const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
        const month = date.toLocaleDateString('en-US', { month: 'long' });
        const day = date.getDate();
      
        const getSuffix = (n) => {
          if (n > 3 && n < 21) return 'th';
          switch (n % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
          }
        };
        const dayWithSuffix = `${day}${getSuffix(day)}`;
        return `${weekday}, ${month} ${dayWithSuffix}`;
      };
    
    const tasks_completed = 0;
    const total_tasks = 0;

    const [user] = useAuthState();
    const [progressData] = useDbData(user ? `users/${user.uid}/ProgressTrack/Active` : null);
    const tasksCompleted = progressData?.Progress || 0;
    const totalTasks = progressData?.Total || 0;
    const percentage = totalTasks === 0 ? 0 : (tasksCompleted / totalTasks) * 100;

    // const [userData] = useDbData(user ? `users/${user.uid}` : null);
    // const [allGroups] = useDbData('groups');
    
    //total money dependent on task completion
    const [userData] = useDbData(user ? `users/${user.uid}` : null);
    const [allGroups] = useDbData('groups');

    let totalMoney = null;
    let isFullyComplete = null;

    if (user && userData && allGroups) {
    const userID = userData.userID;
    const userGroups = Object.values(allGroups).filter(group =>
        group.members.includes(userID)
    );
    totalMoney = userGroups.reduce((sum, group) => sum + (group.money || 0), 0);
    const progress = userData.ProgressTrack?.Active;
    isFullyComplete = progress?.Progress === progress?.Total;
    }
    
    //mock data
    const friends = [
        {
          userID: '1',
          displayName: 'Linh',
          ProgressTrack: { Active: { Progress: 4, Total: 5 } }
        },
        {
          userID: '2',
          displayName: 'Herbert',
          ProgressTrack: { Active: { Progress: 2, Total: 3 } }
        },
        {
          userID: '3',
          displayName: 'Ishani',
          ProgressTrack: { Active: { Progress: 0, Total: 1 } }
        }
      ];

    // ranking function
    const getRankedFriends = (friendsList) => {
        return [...friendsList].sort((a, b) => {
        const aCompleted = a.ProgressTrack?.Active?.Progress || 0;
        const aTotal = a.ProgressTrack?.Active?.Total || 0;
        const aPercent = aTotal === 0 ? 0 : aCompleted / aTotal;

        const bCompleted = b.ProgressTrack?.Active?.Progress || 0;
        const bTotal = b.ProgressTrack?.Active?.Total || 0;
        const bPercent = bTotal === 0 ? 0 : bCompleted / bTotal;

        return bPercent - aPercent;
        });
    };
    const rankedFriends = getRankedFriends(friends);

    return (
        <div className="home-page">
            <Header title="Dashboard" />
            <Container className="home-page-container">
                <div className="home-page-content">
                    <h1 className="home-titles">
                        {formatDate(new Date())}
                    </h1>
                </div>
                <div>
                {(totalMoney !== null && isFullyComplete !== null) && (
                    <p className="home-subheading"
                        style={{ color: isFullyComplete ? "#0C7C59" : "#93032E", fontWeight: 600 }}>
                        {isFullyComplete ? `SAVED: +$${totalMoney}` : `LOST: -$${totalMoney}`}
                    </p>
                )}
                </div>
                <div className="personal-overview-content">
                    <p className="home-subheading"> Tasks Completed</p>
                </div>
                <div className="circular-progress-bar">

                    <CircularProgressbar
                        value={percentage}
                        text={`${tasksCompleted}/${totalTasks}`}
                        styles={{
                            root: {},
                            path: {
                            stroke: '#1C434E',
                            strokeLinecap: 'butt',
                            },
                            // Customize the circle behind the path, i.e. the "total progress"
                            trail: {
                            // Trail color
                            stroke: "#C89254",
                            strokeLinecap: 'butt',
                            // Rotate the trail
                            transform: 'rotate(0.25turn)',
                            transformOrigin: 'center center',
                            },
                            // Customize the text
                            text: {
                            // Text color
                            fill: "#1C434E",
                            // Text size
                            fontSize: '16px',
                            fontWeight: 'bold',
                            fontFamily: 'Verdana'
                            },
                        }}
                    />
                </div>  
            </Container>
            
            <Container className="home-page-container">
                <div className="home-page-content">
                    <h1 className="home-titles">
                        Friend Progress</h1>
                </div>
            </Container>

            <div className="friend-progress-wrapper">
            <div className="friend-progress-wrapper">
                {rankedFriends.map((friend, index) => {
                    const completed = friend.ProgressTrack?.Active?.Progress || 0;
                    const total = friend.ProgressTrack?.Active?.Total || 0;
                    const percent = total === 0 ? 0 : (completed / total) * 100;

                    return (
                        <div className="friend-progress-card" key={friend.userID}>
                            <div className="friend-header-row">
                            <span className="friend-rank">#{index + 1}</span>
                            <span className="friend-name">{friend.displayName}</span>
                        </div>
                        <ProgressBar
                            now={percent}
                            label={`${completed}/${total}`}
                            className="friend-bar"
                            variant="success"
                        />
                        </div>
                    );
                })}
                </div>
            </div>          
        </div>
    );
};

export default HomePage;