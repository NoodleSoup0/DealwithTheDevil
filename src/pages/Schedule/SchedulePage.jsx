import React, { useState, useEffect } from 'react';
import './SchedulePage.css';
import Header from '../../components/header/Header';
import CustomModal from '../../components/modal/CustomModal';
import { useAuthState, useDbData, useDbUpdate } from "../../utilities/firebase";
import { Container, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { IoIosAddCircleOutline } from "react-icons/io";
import { FiTrash2 } from 'react-icons/fi';

const SchedulePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [missedTasks, setMissedTasks] = useState([]);
  const [futureTasks, setFutureTasks] = useState([]);
  const [currentTasks, setCurrentTasks] = useState([]);
  const [stagedTasks, setStagedTasks] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [scheduleLocked, setScheduleLocked] = useState(false);

  const [user] = useAuthState();
  const userId = user?.uid;
  const [firebaseTasksData] = useDbData(userId ? `users/${userId}/tasks` : null);
  const [updateTask, updateResult] = useDbUpdate(userId ? `users/${userId}/tasks` : null);
  const [firebaseProgress] = useDbData(userId ? `users/${userId}/ProgressTrack/Active` : null);
  const [updateActiveProgress] = useDbUpdate(userId ? `users/${userId}/ProgressTrack/Active` : null);


  // Filter tasks based on their status
  const filterTasks = () => {
    const missed = tasks.filter(task => task.Status === 'missed');
    const future = tasks.filter(task => task.Status === 'future');
    const current = tasks.filter(task => task.Status === 'current');
    setMissedTasks(missed);
    setFutureTasks(future);
    setCurrentTasks(current);
  };

  useEffect(() => {
    if (!firebaseTasksData) return;

    const today = new Date().toISOString().split('T')[0];

    const firebaseTasks = Object.entries(firebaseTasksData).map(
      ([id, task]) => ({
        ...task,
        TaskID: id,
      })
    );

    const hasTodayCurrentTask = firebaseTasks.some(
      (task) => task.Date === today && task.Status === "current"
    );

    if (hasTodayCurrentTask) {
      // Today already has current tasks — keep schedule locked
      setScheduleLocked(true);
      setTasks(firebaseTasks);
    } else {
      const updatedTasks = {};
      const cleanedTasks = [];

      firebaseTasks.forEach(({ TaskID, ...task }) => {
        if (task.Completed) {
          return;
        }
        if (task.Status === "current") {
          // Mark current as missed
          const updatedTask = { ...task, Status: "missed" };
          updatedTasks[TaskID] = updatedTask;
          cleanedTasks.push({ ...updatedTask, TaskID });
        } else {
          // Keep other tasks
          cleanedTasks.push({ ...task, TaskID });
        }
      });

      if (Object.keys(updatedTasks).length > 0) {
        updateTask(updatedTasks); // Push updates to Firebase
      }

      setScheduleLocked(false);
      setTasks(cleanedTasks);
    }
  }, [firebaseTasksData]);

  // Call filterTasks whenever tasks change
  useEffect(() => {
    filterTasks();
  }, [tasks]);

  // Task form states
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [duration, setDuration] = useState(1);


  const handleAddTask = () => {
    if (!userId) {
      alert("You must be signed in to add a task.");
      return;
    }
    const [hours, minutes] = startTime.split(":").map(Number);
    const timeStartDecimal = hours + minutes / 60;
    const timeEndDecimal = timeStartDecimal + parseFloat(duration);

    if (isOverlapping(timeStartDecimal, timeEndDecimal)) {
      alert("This task overlaps with an existing task. Please choose a different time.");
      return;
    }

    const taskId = Date.now();

    const newTask = {
      TaskName: title,
      TimeStart: timeStartDecimal,
      TimeEnd: timeEndDecimal,
      Completed: false,
      Status: 'current',
      Date: new Date().toISOString().split('T')[0],
    };

    if (scheduleLocked) {
      updateTask({ [taskId]: newTask });

      updateActiveProgress({
        Total: (firebaseProgress?.Total || 0) + 1,
        Date: new Date().toISOString().split('T')[0]
      });
    } else {
      setStagedTasks((prev) => [...prev, { ...newTask, TaskID: taskId }]);
    }

    setTasks((prev) => [...prev, { ...newTask, TaskID: taskId }]);

    // Reset modal
    setTitle('');
    setStartTime('10:00');
    setDuration(1);
    setShowModal(false);
  };

  const handleConfirmSchedule = () => {
    if (!userId || stagedTasks.length === 0) return;

    const updates = {};
    stagedTasks.forEach((task) => {
      updates[task.TaskID] = { ...task };
      delete updates[task.TaskID].TaskID; // Remove TaskID from value
    });

    updateTask(updates);

    updateActiveProgress({
      Total: (firebaseProgress?.Total || 0) + stagedTasks.length,
      Date: new Date().toISOString().split('T')[0]
    });

    setScheduleLocked(true);
    setShowConfirmModal(false);
    setStagedTasks([]); // Clear staged tasks
  };

  const getFormattedDate = () => {
    const today = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);
  };

  const start = Math.floor(
    Math.min(...currentTasks.map((t) => t.TimeStart ?? Infinity))
  );
  const end = Math.ceil(
    Math.max(...currentTasks.map((t) => t.TimeEnd ?? -Infinity))
  );

  // Generate 30-minute intervals
  const timeIntervals = [];
  for (let t = start; t < end; t += 0.5) {
    timeIntervals.push(t);
  }

  // Filter only intervals that fall within at least one task's block
  const visibleTimeIntervals = timeIntervals.filter((time) =>
    currentTasks.some(
      (task) =>
        task.TimeStart !== null &&
        task.TimeEnd !== null &&
        time >= task.TimeStart &&
        time <= task.TimeEnd
    )
  );

  // For each visible interval, compute task and display info
  const timeRows = visibleTimeIntervals.map((time) => {
    const matchingTasks = currentTasks.filter((task) => task.TimeStart === time);
    const isTaskEndTime = currentTasks.some((task) => task.TimeEnd === time);
    const hour = Math.floor(time);
    const minutes = (time % 1) * 60;
    const displayLabel = `${hour.toString().padStart(2, '0')}:${minutes === 0 ? '00' : '30'}`;

    return {
      time,
      displayLabel,
      matchingTasks,
      isTaskEndTime,
    };
  });

  const handleDeleteTask = (taskId) => {
    setStagedTasks((prev) => prev.filter((task) => task.TaskID !== taskId));
    setTasks((prev) => prev.filter((task) => task.TaskID !== taskId));
  };

  const isOverlapping = (start, end) => {
    return tasks.some((task) => {
      if (task.Date !== new Date().toISOString().split('T')[0]) return false;
      const existingStart = task.TimeStart;
      const existingEnd = task.TimeEnd;
      return (
        (start >= existingStart && start < existingEnd) || // starts inside another
        (end > existingStart && end <= existingEnd) ||     // ends inside another
        (start <= existingStart && end >= existingEnd)     // fully overlaps
      );
    });
  };

  return (
    <div className="schedule-page">
      <Header title="Schedule" />
      <Container className="schedule-page-container">
        <div className="schedule-page-content">
          <div className="date-header d-flex justify-content-between align-items-center p-3 rounded">
            <h2 className="date-heading">{getFormattedDate()}</h2>
            <IoIosAddCircleOutline size={30} className="add-task-icon" onClick={() => setShowModal(true)} />
          </div>

          <div className="time-grid">
            {timeRows.length > 0 ? (
              timeRows.map((row, i) => (
                <div key={i} className="time-row">
                  <div
                    className={`time-label ${row.matchingTasks.length !== 0 || row.isTaskEndTime ? '' : 'invisible-label'
                      }`}
                  >
                    {row.displayLabel}
                  </div>
                  <div className="time-cell">
                    {row.matchingTasks.length > 0 ? (
                      row.matchingTasks.map((task) => (
                        <div
                          key={task.TaskID}
                          className={`task-card ${task.Status} ${task.Completed ? 'completed' : ''}`}
                          style={{
                            height: `${(task.TimeEnd - task.TimeStart) * 3.8}rem`,
                            position: 'relative',
                          }}
                        >
                          {!scheduleLocked && stagedTasks.some((t) => t.TaskID === task.TaskID) && (
                            <button
                              className="delete-task-btn"
                              onClick={() => handleDeleteTask(task.TaskID)}
                            >
                              <FiTrash2 />
                            </button>
                          )}

                          <input
                            type="checkbox"
                            className="task-checkbox"
                            checked={task.Completed}
                            disabled={task.Completed}
                            onChange={() => {
                              if (scheduleLocked && !task.Completed) {
                                const newCompleted = true;

                                // Local update
                                setTasks((prev) =>
                                  prev.map((t) =>
                                    t.TaskID === task.TaskID ? { ...t, Completed: newCompleted } : t
                                  )
                                );

                                // Firebase update
                                updateTask({
                                  [task.TaskID]: { ...task, Completed: newCompleted },
                                });

                                // Progress update
                                updateActiveProgress({
                                  Progress: (firebaseProgress?.Progress || 0) + 1,
                                  Date: new Date().toISOString().split('T')[0],
                                });
                              }
                            }}
                          />

                          <span className="task-name">{task.TaskName}</span>
                        </div>

                      ))
                    ) : row.isTaskEndTime ? (
                      <div className="task-placeholder" />
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-tasks-message">
                <p>No tasks scheduled for today.</p>
              </div>
            )}
          </div>

          <div className="text-center mt-4">
            <Button
              variant="danger"
              className="confirm-button"
              onClick={() => setShowConfirmModal(true)}
              disabled={scheduleLocked || stagedTasks.length === 0}
            >
              {scheduleLocked ? "Schedule Locked" : "Confirm Schedule"}
            </Button>
          </div>

        </div>
      </Container>

      {/* Create Task Modal */}
      <CustomModal show={showModal} onClose={() => setShowModal(false)} title="Create Task">
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Task Name</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CS392 Presentation"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Start Time</Form.Label>
            <Form.Control
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Duration (hours)</Form.Label>
            <Form.Control
              type="number"
              step="0.5"
              min="0.5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </Form.Group>

          <Button variant="primary" onClick={handleAddTask}>
            Add Task
          </Button>
        </Form>
      </CustomModal>

      {/* Confirmation Modal */}
      <CustomModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Schedule"
      >
        <p>Are you sure you want to confirm? This will lock your schedule for the day.</p>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmSchedule}>
            Yes, Confirm
          </Button>
        </div>
      </CustomModal>

    </div>
  );
};

export default SchedulePage;