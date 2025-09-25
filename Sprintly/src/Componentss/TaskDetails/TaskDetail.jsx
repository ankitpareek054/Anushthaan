
import React, { useEffect, useRef, useState } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleHalfStroke,
  faCircleInfo,
  faClose,
  faCircleCheck,
  faEllipsis,
  faCircleStop,
} from '@fortawesome/free-solid-svg-icons'
import CommentSection from './CommentSection.jsx'
import { toast } from 'react-toastify'
import axios from 'axios'
import AddSubTask from '../AddSubTask.jsx'
import AddTask from '../AddTask.jsx'
import SubTasks from './SubTasks.jsx'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

const TaskDetail = ({ proptask, closeDetails, isVisible, setTaskRefresh }) => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false)
  const [close, setClose] = useState(false)
  const [isAddSubTaskOpen, setIsAddSubTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [url, setUrl] = useState(null)

  const [refresh, setRefresh] = useState(Date.now)
  const user = localStorage.getItem('user')
  const parsedUser = JSON.parse(user)
  const currentUserId = parsedUser._id
  const [isToggleVisible, setIsToggleVisible] = useState(
    currentUserId === proptask.assigneeId,
  )
  const [task, setTask] = useState(proptask)

  // at top of your component file:
  const formatCustomDate = (dateString) => {
    const date = new Date(dateString)
    const month = date.toLocaleString('en-US', { month: 'short' })
    const day = date.getDate()
    const year = String(date.getFullYear()).slice(-2) // last two digits
    return `${month} ${day}'${year}`
  }


  useEffect(() => {
    axios
      .get('http://localhost:5000/api/tasks')
      .then((res) => {
        setTask(res.data.find((task) => task._id === proptask._id))
      })
      .catch((err) => {
        console.log('failed to retreive tasks', err)
      })
    setTaskRefresh ? setTaskRefresh(refresh) : null
  }, [refresh])

  // mark task as completed/in progress
  const handleToggle = async () => {
    let newStatus
    {
      task.status === 'No Progress'
        ? (newStatus = 'In-Progress')
        : task.status === 'In-Progress'
          ? (newStatus = 'Completed')
          : (newStatus = 'No Progress')
    }
    try {
      const response = await axios.post(
        'http://localhost:5000/api/updateStatus',
        {
          taskId: task._id,
          status: newStatus,
        },
      )

      if (response.data.task) {
        task.status = response.data.task.status // Update local task status
        setRefresh(!refresh)
        setTaskRefresh(refresh)
      }
      toast.success(`Task marked as ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update task status')
      console.error('Error updating status:', error)
    }
  }

  const modalRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeDetails()
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    if (isVisible || isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, isMenuOpen, closeDetails])

  // Function to get initials from the name
  const getInitials = (name) => {
    if (!name) return ''
    const words = name.split(' ')
    return words.length > 1
      ? words[0][0].toUpperCase() + words[1][0].toUpperCase()
      : words[0][0].toUpperCase()
  }

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/deleteTask/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUserId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Task deleted successfully');
        // Optionally refresh task list
        setTaskRefresh && setTaskRefresh(Date.now());
        // 1) Close the detail modal so the list underneath is visible
        closeDetails();
        // 2) Trigger the parent refresh by toggling the boolean
        setTaskRefresh && setTaskRefresh(prev => !prev);
      } else {
        toast.error(data.message || 'Error deleting task');;
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Server error while deleting task');
    }
  };


  // Function to generate background colors based on the name
  const generateColor = (name) => {
    const colors = [
      '#4CAF50',
      '#FF9800',
      '#9C27B0',
      '#2196F3',
      '#795548',
      '#c92920',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const getImage = async (userId) => {
    try {
      const res = await axios.get('http://localhost:5000/api/getUsers')
      const foundUser = res.data.users.find((user) => user._id === userId)

      if (foundUser && foundUser.profilePicUrl) {
        const imageName = foundUser.profilePicUrl
        console.log('Found profile pic:', imageName)

        const urlRes = await axios.post(
          `http://localhost:5000/api/getPresignedUrls/${imageName}`,
        )
        if (urlRes.status === 200) {
          return urlRes.data.presignedUrl
        } else {
          console.log('Error fetching presigned URL:', urlRes.data.message)
        }
      }
    } catch (err) {
      console.log('Error fetching image:', err)
    }
    return null // Return null if there's an error or no image
  }

  const [createdByUrl, setCreatedByUrl] = useState(null)
  const [assigneeUrl, setAssigneeUrl] = useState(null)

  useEffect(() => {
    const fetchImages = async () => {
      if (task.createdById) {
        const url = await getImage(task.createdById)
        setCreatedByUrl(url)
      }
      if (task.assigneeId) {
        const url = await getImage(task.assigneeId)
        setAssigneeUrl(url)
      }
    }

    fetchImages()
  }, [task.createdById, task.assigneeId])

  return (
    <div
      className={`fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-end items-center h-screen transition-opacity duration-500 ease-in-out dark:text-gray-100 ${isVisible
          ? 'opacity-100 bg-gray-950 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
        }`}
    >
      <div
        className={`relative bg-white dark:bg-gray-800 shadow-lg w-full h-screen overflow-y-auto lg:w-2/3 md:w-3/4 p-3 rounded-lg transform transition-transform duration-500 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'
          } ${close ? 'translate-x-full' : ''}`}
        ref={modalRef}
      >
        {/* Close Button */}
        <button
          className="text-gray-800  bg-gray-200 dark:bg-gray-500 dark:text-gray-100  px-4 py-2 rounded hover:bg-gray-300  dark:hover:bg-gray-400 mb-2"
          onClick={() => {
            setClose(true)
            setTimeout(closeDetails, 400)
          }}
        >
          <FontAwesomeIcon icon={faClose} />
        </button>

        {/* Task Header */}
        <div className="border dark:border-gray-500 rounded-lg shadow-md p-6 bg-white dark:bg-gray-800 w-full">
          <div className="flex justify-between items-center border-b-2 dark:border-gray-500 pb-4">
            <h2 className="font-semibold text-sm lg:text-3xl md:text-lg">
              {task.title}
            </h2>
            <div className="flex gap-3">
              {isToggleVisible && task.subTasks.length === 0 && (
                <button
                  className={` flex my-auto items-center px-2 py-1 text-white rounded-md cursor-pointer transition-all duration-300 bg-gradient-to-r ${task.status == 'No Progress'
                      ? 'from-blue-400 to-blue-800'
                      : task.status == 'In-Progress'
                        ? 'from-green-500 to-green-700 '
                        : 'from-gray-400 to-gray-600'
                    }`}
                  onClick={handleToggle}
                >
                  {' '}
                  {task.status === 'No Progress'
                    ? 'Start Task'
                    : task.status === 'In-Progress'
                      ? 'Complete Task'
                      : 'Restart'}
                </button>
              )}
              {(currentUserId === task.assigneeId ||
                currentUserId === task.createdById) && (
                  <button
                    className="text-gray-800   dark:text-gray-100  px-3 py-2 rounded hover:bg-blue-100 hover:text-blue-500  dark:hover:bg-gray-400 mb-2 my-auto"
                    onClick={() => {
                      setIsMenuOpen(!isMenuOpen)
                    }}
                  >
                    <FontAwesomeIcon icon={faEllipsis} />
                  </button>
                )}
            </div>

            {/* menu options */}
            {isMenuOpen && (
              <div
                className="absolute bg-white dark:bg-gray-600 rounded-md shadow-lg top-32 mr-6 right-0 z-10 border"
                ref={menuRef}
              >
                {task.createdById === currentUserId && (
                  <>
                    <p
                      className="w-full px-8 p-2 hover:bg-blue-100 hover:text-blue-500"
                      onClick={() => {
                        setIsEditTaskOpen(true)
                        setIsMenuOpen(false)
                      }}
                    >
                      Edit
                    </p>

                    <p
                      className="w-full px-8 p-2 hover:bg-red-100 hover:text-red-500"
                      onClick={() => {
                        handleDeleteTask(task._id)
                        setIsMenuOpen(false)
                      }}
                    >
                      Delete
                    </p>
                  </>
                )}

                <p
                  className="w-full px-8 p-2 hover:bg-blue-100 hover:text-blue-500"
                  onClick={() => {
                    setIsAddSubTaskOpen(true)
                    setIsMenuOpen(false)
                  }}
                >
                  Add subtask
                </p>
              </div>
            )}
          </div>

          {/* Task Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 lg:gap-10 md:gap-10 mt-4">
            <div>
              <p className="text-sm flex items-center">
                <span className="font-medium text-gray-500 dark:text-gray-400 mr-2">
                  Created by:
                </span>

                {createdByUrl ? (
                  <img
                    src={createdByUrl}
                    alt={getInitials(task.createdBy)}
                    className="w-8 h-8 object-cover rounded-full"
                    style={{ backgroundColor: generateColor(task.createdBy) }}
                  />
                ) : (
                  <div
                    className="w-6 h-6 flex shrink-0 items-center justify-center rounded-full text-white text-md font-semibold"
                    style={{ backgroundColor: generateColor(task.createdBy) }}
                  >
                    {getInitials(task.createdBy)}
                  </div>
                )}
                {/* <div
                className="w-6 h-6 flex shrink-0 items-center justify-center rounded-full text-white text-md font-semibold"
                style={{ backgroundColor: generateColor(task.createdBy) }}
              >
                {getInitials(task.createdBy)}
              </div> */}
                <span className="ml-1 ">
                  {task.createdBy} on{' '}
                  {new Date(task.startDate).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: "numeric",
                  })}
                </span>
              </p>
            </div>

            <div>
              <p className="text-sm flex items-center">
                <span className="font-medium text-gray-500 dark:text-gray-400 mr-2">
                  Assigned to:
                </span>

                {assigneeUrl ? (
                  <img
                    src={assigneeUrl}
                    alt={getInitials(task.assignee)}
                    className="w-8 h-8 object-cover rounded-full"
                    style={{ backgroundColor: generateColor(task.assignee) }}
                  />
                ) : (
                  <div
                    className="w-6 h-6 flex shrink-0 items-center justify-center rounded-full text-white text-md font-semibold"
                    style={{ backgroundColor: generateColor(task.assignee) }}
                  >
                    {getInitials(task.assignee)}
                  </div>
                )}

                <span className="ml-1">{task.assignee}</span>
              </p>
            </div>

            <div className="flex text-sm">
              <span className="font-medium text-gray-500 dark:text-gray-400 mr-2">
                Project:
              </span>
              {task.projectName}
            </div>

            <div>
              <p className="text-sm">
                <span className="font-medium text-gray-500 dark:text-gray-400">Start/Due Date:</span>{" "}
                <span className="text-blue-500">
                  {formatCustomDate(task.startDate)}{" "}
                  <FontAwesomeIcon icon={faArrowRight} className="mx-1 text-gray-600 dark:text-gray-400 text-xs" />
                </span>{" "}
                <span className="text-red-600">
                  {formatCustomDate(task.endDate)}
                </span>

              </p>
            </div>

            <div>
              <p className="text-sm flex items-center">
                <span className="font-medium text-gray-500 pr-2 dark:text-gray-400">
                  Priority:
                </span>
                <FontAwesomeIcon
                  icon={faCircleInfo}
                  className={`text-lg pr-2 ${task.priority === 'High'
                      ? 'text-red-500'
                      : task.priority === 'Medium'
                        ? 'text-yellow-500'
                        : 'text-gray-500  dark:text-gray-400'
                    }`}
                />
                <span>{task.priority || 'None'}</span>
              </p>
            </div>

            <div>
              <p className="text-sm flex items-center">
                <span className="font-medium text-gray-500 dark:text-gray-400 pr-2">
                  Status:
                </span>
                <div className="mr-2">
                  {task.status === 'Completed' ? (
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      className="text-green-500 text-lg"
                    />
                  ) : task.status === 'In-Progress' ? (
                    <FontAwesomeIcon
                      icon={faCircleHalfStroke}
                      className="text-yellow-500 text-lg"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faCircleStop}
                      className="text-gray-500 text-lg"
                    />
                  )}
                </div>
                {task.status}
              </p>
            </div>
          </div>

          {/* Dropdown for Description */}
          <div>
            <h3
              className="mt-4 text-md font-medium cursor-pointer flex items-center w-fit dark:text-gray-300 mb-4"
              onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
            >
              Description
              {isDescriptionOpen ? (
                <FaChevronUp className="w-4 h-4 text-gray-600 ml-2 dark:text-gray-400" />
              ) : (
                <FaChevronDown className="w-4 h-4 text-gray-600 ml-2 dark:text-gray-400" />
              )}
            </h3>
            {isDescriptionOpen && (
              <div className="mt-4 mb-3 bg-gray-50 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-100 dark:bg-gray-600">
                <ul className="list-disc pl-5">
                  {task.description.split('. ').map((line, index) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {task.subTasks.length > 0 && (
            <SubTasks
              task={task}
              currentUserId={currentUserId}
              setDetailsRefresh={setRefresh}
            />
          )}
          {isAddSubTaskOpen && (
            <AddSubTask
              close={() => setIsAddSubTaskOpen(false)}
              visibility={isAddSubTaskOpen}
              task={task}
              setRefresh={setRefresh}
            />
          )}

          {isEditTaskOpen && (
            <AddTask
              visiblity={isEditTaskOpen}
              close={() => setIsEditTaskOpen(false)}
              name="edit"
              task={task}
              defaultProjectName={task.projectName}
              setRefresh={setRefresh}
            />
          )}

          {/* Comments Section */}
          <p className="mt-6 text-lg font-semibold dark:text-gray-300">
            Comments
          </p>
          <CommentSection task={task} />
        </div>
      </div>
    </div>
  )
}
export default TaskDetail
