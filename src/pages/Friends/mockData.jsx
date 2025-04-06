// mockData.js

export const users = [
    {
      userID: 1,
      displayName: 'Linh',
      about: 'A passionate coder who loves to solve problems.',
      email: 'linh@example.com',
      photoURL: 'https://example.com/photo1.jpg',
      friends: [2, 3],
      groups: [1],
      tasks: [
        { taskID: 1, taskName: 'Complete React Tutorial', timeStart: null, timeEnd: null, completed: false, status: 'future', date: '2025-04-06', progress_track: [] },
        { taskID: 2, taskName: 'Fix Bug in App', timeStart: 1618000000, timeEnd: 1618003600, completed: true, status: 'completed', date: '2025-04-01', progress_track: [{ active: false, date: '2025-04-01', progress: 100 }] },
      ]
    },
    {
      userID: 2,
      displayName: 'John',
      about: 'A web designer with an eye for details.',
      email: 'john@example.com',
      photoURL: 'https://example.com/photo2.jpg',
      friends: [1, 3],
      groups: [1],
      tasks: [
        { taskID: 3, taskName: 'Create Homepage Design', timeStart: null, timeEnd: null, completed: false, status: 'future', date: '2025-04-10', progress_track: [] }
      ]
    },
    {
      userID: 3,
      displayName: 'Sara',
      about: 'A back-end developer who loves data.',
      email: 'sara@example.com',
      photoURL: 'https://example.com/photo3.jpg',
      friends: [1, 2],
      groups: [1],
      tasks: [
        { taskID: 4, taskName: 'Set up database', timeStart: null, timeEnd: null, completed: false, status: 'future', date: '2025-04-12', progress_track: [] }
      ]
    }
  ];
  
  export const groups = [
    {
      groupID: 1,
      groupName: 'Boba Team',
      groupIcon: 'https://example.com/group-icon.jpg',
      createdAt: '2025-03-01',
      friends: [1, 2]
    },
    {
      groupID: 2,
      groupName: 'Hack Team',
      groupIcon: 'https://example.com/group-icon.jpg',
      createdAt: '2025-03-01',
      friends: [3]
    }
  ];
  