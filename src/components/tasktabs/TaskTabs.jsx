import React, { useState } from 'react';
import CustomModal from '../../components/modal/CustomModal';
import { useAuthState, useDbUpdate, useDbData } from '../../utilities/firebase';
import { Container, Button, Form } from 'react-bootstrap';
import { FiTrash2 } from 'react-icons/fi';
import { IoIosAddCircleOutline } from "react-icons/io";
import './TaskTabs.css';

const TaskTabs = ({ currentTasks, missedTasks, futureTasks }) => {
    const [activeTab, setActiveTab] = useState('missed');
    const [taskToEdit, setTaskToEdit] = useState(null);

    const [user] = useAuthState();
    const userId = user?.uid;
    const [updateTask] = useDbUpdate(userId ? `users/${userId}/tasks` : null);
    const [activeProgressData] = useDbData(userId ? `users/${userId}/ProgressTrack/Active` : null);
    const [updateActiveProgress] = useDbUpdate(userId ? `users/${userId}/ProgressTrack/Active` : null);
    const [showEditModal, setShowEditModal] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        startTime: '10:00',
        duration: 1,
        futureDate: new Date().toISOString().split('T')[0],
    });


    const [showAddConfirmModal, setShowAddConfirmModal] = useState(false);
    const [pendingAddTask, setPendingAddTask] = useState(null);
    const [pendingFormData, setPendingFormData] = useState(null);

    const [isCreatingFutureTask, setIsCreatingFutureTask] = useState(false);


    const handleOpenModal = (task) => {
        const formattedStartTime = task.TimeStart
            ? `${Math.floor(task.TimeStart).toString().padStart(2, '0')}:${(task.TimeStart % 1 === 0.5 ? '30' : '00')}`
            : '10:00';

        const calculatedDuration =
            task.TimeEnd && task.TimeStart ? task.TimeEnd - task.TimeStart : 1;

        setFormData({
            title: task.TaskName,
            startTime: formattedStartTime,
            duration: calculatedDuration,
        });

        setTaskToEdit(task);
        setShowEditModal(true);
    };

    const isOverlapping = (start, end) => {
        return currentTasks.some((task) => {
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

    const handleSubmitTaskEdit = () => {
        const [hours, minutes] = formData.startTime.split(":").map(Number);
        const timeStartDecimal = hours + minutes / 60;
        const timeEndDecimal = timeStartDecimal + parseFloat(formData.duration);

        if (isOverlapping(timeStartDecimal, timeEndDecimal)) {
            alert("This task overlaps with another one on your schedule.");
            return;
        }

        const newId = Date.now();
        const revivedTask = {
            TaskName: formData.title,
            TimeStart: timeStartDecimal,
            TimeEnd: timeEndDecimal,
            Completed: false,
            // Status: 'current',
            // Date: new Date().toISOString().split('T')[0],
            Status: activeTab === 'future' && isCreatingFutureTask ? 'future' : 'current',
            Date: activeTab === 'future' && isCreatingFutureTask
                ? formData.futureDate
                : new Date().toISOString().split('T')[0],

        };

        // If the task is from the future tab, ask for confirmation
        if (activeTab === 'future' && !isCreatingFutureTask) {
            setPendingAddTask(taskToEdit);
            setPendingFormData({ id: newId, task: revivedTask });
            setShowEditModal(false);
            setShowAddConfirmModal(true);
        } else {
            // If the task is from the future tab, just add it
            if (activeTab === 'future') {
                updateTask({ [newId]: revivedTask });
            } else {
                updateTask({ [newId]: revivedTask, [taskToEdit.TaskID]: null });
                const currentProgress = activeProgressData?.Progress || 0;
                const currentTotal = activeProgressData?.Total || 0;
                updateActiveProgress({ Progress: currentProgress, Total: currentTotal + 1 });
            }
            setShowEditModal(false);
        }
    };

    const handleNewFutureTask = () => {
        setIsCreatingFutureTask(true);
        setTaskToEdit(null); // not editing an existing one
        setFormData({
            title: '',
            startTime: '10:00',
            duration: 1,
            futureDate: new Date().toISOString().split('T')[0],
        });
        setShowEditModal(true);
    };


    const renderTasks = (tasks) => {
        if (tasks.length === 0) return <p className="no-tasks">No tasks found.</p>;

        return tasks.map((task) => (
            <div key={task.TaskID} className="tab-task-card">
                <div>
                    <span className="tab-task-name">{task.TaskName}</span><br />
                    <span className="tab-task-date">Due: {task.Date}</span>
                </div>
                <div className="tab-task-actions">
                    <button onClick={() => handleOpenModal(task)}>
                        <IoIosAddCircleOutline size={25} />
                    </button>
                    <button
                        onClick={() => updateTask({ [task.TaskID]: null })}
                    >
                        <FiTrash2 size={20} />
                    </button>
                </div>


            </div>
        ));
    };

    return (
        <div className="task-tabs">
            <div className="tab-buttons">
                <button
                    className={activeTab === 'missed' ? 'active' : ''}
                    onClick={() => setActiveTab('missed')}
                >
                    Missed Tasks
                </button>
                <button
                    className={activeTab === 'future' ? 'active' : ''}
                    onClick={() => setActiveTab('future')}
                >
                    Future Tasks
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'missed'
                    ? renderTasks(missedTasks)
                    : renderTasks(futureTasks)}
            </div>

            {activeTab === 'future' && (
                <div className="add-future-button-wrapper">
                    <Button variant="success" onClick={handleNewFutureTask}>
                        + New Future Task
                    </Button>
                </div>
            )}

            {/* Edit task modal */}
            <CustomModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Add Task"
            >
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Task Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, title: e.target.value }))
                            }
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Start Time</Form.Label>
                        <Form.Control
                            type="time"
                            value={formData.startTime}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                            }
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Duration (hours)</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.5"
                            min="0.5"
                            value={formData.duration}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, duration: e.target.value }))
                            }
                        />
                    </Form.Group>
                    {activeTab === 'future' && isCreatingFutureTask && (
                        <Form.Group className="mb-3">
                            <Form.Label>Date (yyyy-mm-dd)</Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.futureDate}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, futureDate: e.target.value }))
                                }
                            />
                        </Form.Group>
                    )}
                    <Button variant="primary" onClick={handleSubmitTaskEdit}>
                        Add to Schedule
                    </Button>
                </Form>
            </CustomModal>

            {/* Confirmation modal*/}
            <CustomModal
                show={showAddConfirmModal}
                onClose={() => setShowAddConfirmModal(false)}
                title="Keep Future Task?"
            >
                <p>Do you want to keep this task in your future list after adding it to today’s schedule?</p>
                <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            // Keep future task
                            console.log('Keep future task:', pendingFormData);
                            updateTask({ [pendingFormData.id]: pendingFormData.task });
                            const currentProgress = activeProgressData?.Progress || 0;
                            const currentTotal = activeProgressData?.Total || 0;
                            updateActiveProgress({ Progress: currentProgress, Total: currentTotal + 1 });
                            setShowAddConfirmModal(false);
                        }}
                    >
                        Yes
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => {
                            // Remove future task
                            updateTask({
                                [pendingFormData.id]: pendingFormData.task,
                                [pendingAddTask.TaskID]: null,
                            });
                            const currentProgress = activeProgressData?.Progress || 0;
                            const currentTotal = activeProgressData?.Total || 0;
                            updateActiveProgress({ Progress: currentProgress, Total: currentTotal + 1 });
                            setShowAddConfirmModal(false);
                        }}
                    >
                        No, Remove
                    </Button>
                </div>
            </CustomModal>


        </div>
    );
};

export default TaskTabs;
