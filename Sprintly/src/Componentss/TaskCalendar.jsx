import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import { motion } from 'framer-motion';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import TaskDetail from './TaskDetails/TaskDetail.jsx';
import CustomDateContentRow from './CustomDateContentRoww.jsx';
import CustomToolbar from './CustomToolbar.jsx';


const TaskCalendar = () => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupEvents, setPopupEvents] = useState([]);
    const [popupDate, setPopupDate] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [visiblity, setVisiblity] = useState(false);
    const localizer = momentLocalizer(moment);
    const [loggedInUser, setLoggedInUser] = useState(null); // Store logged-in user


    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user")); // Get user from localStorage
        setLoggedInUser(user); // Save to state

        setIsLoading(true);

        axios
            .get('http://localhost:5000/api/tasks')
            .then((res) => {
                setIsLoading(false);

                // Only keep tasks created by OR assigned to logged-in user
                const filteredTasks = res.data.filter(task => {
                    return task.createdById === user._id || task.assigneeId === user._id;
                });

                setTasks(filteredTasks); // Update state with only relevant tasks
            })
            .catch((err) => {
                console.error("Error fetching tasks:", err);
                setIsLoading(false);
            });
    }, []);


    const openDetails = (taskdeet) => {
        setSelectedTask(taskdeet);
        console.log(taskdeet)
        setTimeout(() => setVisiblity(true), 100);
    };

    useEffect(() => {
        if (selectedTask) {
            setVisiblity(true);
        }
    }, [selectedTask]);

    const closeDetails = () => {
        setSelectedTask(null);
        setTimeout(() => setVisiblity(false), 100);
    };


    const events = [];
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    // First: push all actual task spans
    sortedTasks.forEach(task => {
        const startDate = moment(task.startDate).startOf('day');

        const trueEndDate =
            task.status?.toLowerCase() === 'completed' && task.completedOn
                ? moment(task.completedOn).endOf('day')
                : moment(task.endDate).endOf('day');

        events.push({
            title: task.title,
            start: startDate.toDate(),
            end: trueEndDate.toDate(),
            status: task.status,
            fullTask: task
        });
    });

    // Second: add extra spans for visual continuity
    for (let i = 0; i < sortedTasks.length - 1; i++) {
        const currentTask = sortedTasks[i];

        const currentEnd = moment(
            currentTask.status?.toLowerCase() === 'completed' && currentTask.completedOn
                ? currentTask.completedOn
                : currentTask.endDate
        ).startOf('day');

        const nextDay = currentEnd.clone().add(1, 'day');

        for (let j = i + 1; j < sortedTasks.length; j++) {
            const nextTask = sortedTasks[j];

            const nextStart = moment(nextTask.startDate).startOf('day');
            const nextEnd =
                nextTask.status?.toLowerCase() === 'completed' && nextTask.completedOn
                    ? moment(nextTask.completedOn).endOf('day')
                    : moment(nextTask.endDate).endOf('day');

            // If the next task spans the "next day", duplicate it from that day onwards
            if (nextStart.isSameOrBefore(nextDay) && nextEnd.isSameOrAfter(nextDay)) {
                events.push({
                    title: nextTask.title,
                    start: nextDay.toDate(),
                    end: nextEnd.toDate(),
                    status: nextTask.status,
                    fullTask: nextTask,
                    _duplicateSpan: true // mark it as a visual helper span
                });
                break; // only one such duplicate per next-day gap
            }
        }
    }

    const eventStyleGetter = () => {
        const style = {
            backgroundColor: '#dbeafe',
            color: 'black',
            borderRadius: '5px',
            padding: '2px 5px',
            border: 'none',
            fontSize: '14px',
            marginTop: '1px'
        };
        return { style };
    };

    const CustomEvent = ({ event }) => {
        const pillColor = event.status === 'Completed' ? 'bg-green-500' : event.status === 'In-Progress' ? 'bg-yellow-500' : 'bg-gray-500';
        return (
            <div className="flex items-center gap-1 overflow-hidden text-xs " onClick={() => openDetails(event.fullTask)}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${pillColor}`}></span>
                <span className='truncate'>{event.title}</span>
            </div>
        );
    };

    const handleShowMore = (events, date) => {
        const fullTasks = events
            .filter(event => !event._duplicateSpan) // Exclude duplicate tasks
            .map(event => event.fullTask);

        setPopupEvents(fullTasks);
        setPopupDate(date);
        setShowPopup(true);
    };


    const closePopup = () => {
        setShowPopup(false);
        setPopupEvents([]);
        setPopupDate(null);
    };

    const handleDateClick = (slotInfo) => {
        const clickedDate = moment(slotInfo.start).startOf('day');

        const eventsOnDate = events
            .filter(event => moment(event.start).isSame(clickedDate, 'day'))
            .filter(event => !event._duplicateSpan)
            .map(event => event.fullTask); // extract full task

        if (eventsOnDate.length === 0) return;

        setPopupEvents(eventsOnDate);
        setPopupDate(slotInfo.start);
        setShowPopup(true);
    };


    return (
        <div className="p-4 border-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 shadow mt-3 rounded-lg overflow-hidden h-[calc(100vh-130px)] w-full" style={{ scrollbarWidth: "thin" }}>
            <div className="h-full flex flex-col">
                <h1 className="text-xl text-gray-600 font-bold dark:text-gray-300 mb-2">Agenda</h1>
                {isLoading ? (
                    <div className="flex items-center justify-center mt-8">
                        <FontAwesomeIcon
                            icon={faSpinner}
                            spin
                            className="text-gray-600 dark:text-gray-100 text-2xl"
                        />
                    </div>
                ) : (
                    <Calendar
                        localizer={localizer}
                        //events={events.filter(e => !e._duplicateSpan)} // filter duplicates for display
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        views={['month']}
                        eventPropGetter={eventStyleGetter}
                        components={{
                            event: CustomEvent,
                            month: {
                                dateContentRow: CustomDateContentRow
                            },
                            toolbar: CustomToolbar // Include custom toolbar
                        }}
                        onShowMore={handleShowMore}
                        //onSelectSlot={handleDateClick}
                        selectable
                        dayPropGetter={() => ({
                            style: { overflow: 'hidden' } // overflow handling
                        })}
                    />
                )}
            </div>
            {showPopup && (
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg max-h-[80vh] w-[90vw] sm:w-[400px] overflow-y-auto">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Events on {moment(popupDate).format('MMMM Do, YYYY')}
                        </h2>
                        <ul className="space-y-2">
                            {popupEvents.map((task, index) => (
                                <li key={index} className="flex items-center gap-2 cursor-pointer group" onClick={() => { openDetails(task); console.log(task) }}>
                                    <span className={`w-2 h-2 rounded-full ${task.status === 'Completed' ? 'bg-green-500' :
                                        task.status === 'In-Progress' ? 'bg-yellow-500' :
                                            'bg-gray-500'
                                        }`}></span>
                                    <div className='flex justify-between w-full items-center group-hover:text-blue-600 transition-colors'>
                                        <p className=''>{task.title}</p>
                                        <FontAwesomeIcon icon={faArrowRight} className=" opacity-0 group-hover:opacity-100 transition-opacity" />

                                    </div>

                                </li>
                            ))}
                        </ul>
                        <button onClick={closePopup} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {selectedTask && (
                <motion.div
                    className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex justify-end"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                >
                    <TaskDetail
                        proptask={selectedTask}
                        closeDetails={closeDetails}
                        isVisible={visiblity}
                    />
                </motion.div>
            )}
        </div>
    );
};

export default TaskCalendar;