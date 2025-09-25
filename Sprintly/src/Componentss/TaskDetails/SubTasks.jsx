import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartGantt, faChartSimple, faCircleCheck, faCircleHalfStroke, faCircleStop, faEye, faEyeSlash, faList, faPen, faTableCellsLarge, faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import AddSubTask from '../AddSubTask.jsx';
import Kanban from '../Kanban.jsx';
import TabularView from '../TabularView.jsx';
import Gantt from '../GanttDhtml.jsx';

const SubTasks = ({ task, currentUserId, setDetailsRefresh }) => {
    const [subTasks, setSubTaks] = useState([])
    const [selectedSubTask, setSelectedSubTask] = useState(null)
    const [isSubTaskHidden, setIsSubTaskHidden] = useState(false)
    const [isEditSubTaskOpen, setIsEditSubTaskOpen] = useState(false)
    const [selectedSubTaskId, setSelectedSubTaskId] = useState(null)
    const [isTabular, setTabular] = useState(false)
    const [isKanban, setIsKanban] = useState(false)
    const [isList, setIsList] = useState(true)
    const [isGnatt, setGantt] = useState(false)
    const [refresh, setRefresh] = useState(Date.now)
    const headers = ["Title", "Start Date", "End Date",  "Status"];


    useEffect(() => {
        try {
            axios.post(`http://localhost:5000/api/getSubTasks/${task._id}`)
                .then((res) => {
                    setSubTaks(res.data)
                })
        } catch (err) {
            console.log("Error fetching subtasks", err)
        }
        setDetailsRefresh(refresh)
    }, [refresh, task])

    const handleSubTaskStatusChange = async (id, status) => {
        const newStatus = (status === "No Progress" ? "In-Progress" : status === "In-Progress" ? "Completed" : "No Progress")
        try {
            await axios.post(`http://localhost:5000/api/updateSubTaskStatus/${id}`, {
                status: newStatus
            })
            setRefresh(!refresh)
            toast.success('Marked as ' + newStatus, { autoClose: 700 })
        } catch (err) {
            toast.error('Error updating status')
            console.error('Error updating status', err)
        }
    }

    const EditSubTask = (id, title, status, subTaskStart, subTaskEnd) => {
        const sub = { subtaskId: id, subtaskName: title, status, subTaskStart, subTaskEnd }
        setIsEditSubTaskOpen(true)
        setSelectedSubTask(sub)
    }

    const handleDeleteTask = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/deleteSubTask/${task._id}/${selectedSubTaskId}`);
            setRefresh(!refresh)
            setSelectedSubTaskId(null)
            toast.success("Task deleted successfully");
        } catch (error) {
            toast.error("Failed to delete task");
        }
    };

    return (
        <div>
            <div className={`flex justify-between px-2 rounded-md ${isSubTaskHidden ? "bg-gray-50 dark:bg-gray-700" : "bg-white dark:bg-gray-800"}`}>
                <p className="mt-4 mb-2 text-md font-medium cursor-pointer flex items-center w-fit dark:text-gray-300">
                    Subtasks
                </p>
                <button className="mr-2" onClick={() => setIsSubTaskHidden(prev => !prev)}>
                    {isSubTaskHidden ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
                </button>
            </div>
            {!isSubTaskHidden && (
                <div className=" p-1 rounded-lg  ">
                    <div className="flex space-x-1 w-fit text-xs dark:bg-gray-700 p-2">
                        <button className={`px-2 border-black border-r dark:border-white text-gray-500 hover:text-blue-400 dark:hover:text-blue-400 hover:bg-blue-100 ${isList ? "!text-blue-400 bg-blue-200 " : ""}`} title="List"
                            onClick={() => { setIsList(true); setTabular(false); setIsKanban(false); setGantt(false) }}>
                            <FontAwesomeIcon icon={faList} />
                        </button>
                        <button className={`px-2 border-black border-r dark:border-white text-gray-500 hover:text-blue-400 dark:hover:text-blue-400 hover:bg-blue-100 ${isTabular ? "!text-blue-400 bg-blue-100 " : ""}`} title="Tabular"
                            onClick={() => { setIsList(false); setTabular(true); setIsKanban(false); setGantt(false); }}>
                            <FontAwesomeIcon icon={faTableCellsLarge} />
                        </button>
                        <button className={`px-2 border-black border-r dark:border-white text-gray-500 hover:text-blue-400 hover:bg-blue-100 ${isKanban ? "!text-blue-400 bg-blue-100" : ""}`} title="Kanban"
                            onClick={() => { setIsList(false); setTabular(false); setIsKanban(true); setGantt(false) }}><FontAwesomeIcon icon={faChartSimple} /></button>
                        <button className={`px-2  text-gray-500 hover:text-blue-400 hover:bg-blue-100 ${isGnatt ? "!text-blue-400 bg-blue-100" : ""}`} title="Gantt"
                            onClick={() => { setIsList(false); setTabular(false); setIsKanban(false); setGantt(true) }}><FontAwesomeIcon icon={faChartGantt} /></button>
                    </div>

                    {isList && subTasks.map((subtask, index) => (
                        <div key={index} className=" m-2 flex items-center   dark:border-gray-500">
                            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 w-full rounded-md">
                                <div className='flex'>
                                    <span className="mr-2 text-sm">
                                        {subtask.status === "Completed" ? (
                                            <FontAwesomeIcon
                                                icon={faCircleCheck}
                                                className="text-green-500"
                                            />
                                        ) : subtask.status === "No Progress" ? (
                                            <FontAwesomeIcon
                                                icon={faCircleStop}
                                                className="text-gray-500 dark:text-gray-200"
                                            />
                                        ) : (
                                            <FontAwesomeIcon
                                                icon={faCircleHalfStroke}
                                                className="text-yellow-500"
                                            />
                                        )}
                                    </span>
                                    <p>{subtask.title}</p>
                                    <span className="text-blue-500 ml-3">{new Date(subtask.startDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</span> {" -> "}
                                    <span className="text-red-600">{new Date(subtask.endDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</span>
                                </div>


                                <div className="flex gap-3 text-[11px] text-gray-500 ">
                                    {currentUserId === task.assigneeId && (
                                        <button
                                            className={` flex my-auto items-center px-2 py-1 text-white rounded-md cursor-pointer transition-all duration-300 bg-gradient-to-r ${subtask.status == "No Progress" ? "from-blue-400 to-blue-800" : subtask.status == "In-Progress" ? "from-green-500 to-green-700 " : "from-gray-400 to-gray-600"
                                                }`}
                                            onClick={() => handleSubTaskStatusChange(subtask._id, subtask.status)}
                                        > {subtask.status === "No Progress" ? "Start Task" :
                                            subtask.status === "In-Progress" ? "Complete Task" : "Restart"}

                                        </button>
                                    )}
                                    {(currentUserId === task.assigneeId || currentUserId === task.createdById) && (
                                        <div className=' flex gap-3'>
                                            <FontAwesomeIcon icon={faPen} className="hover:text-blue-500 my-auto dark:text-gray-300 dark:hover:text-blue-400" onClick={() => EditSubTask(subtask._id, subtask.title, subtask.status, subtask.startDate, subtask.endDate)} />
                                            <FontAwesomeIcon icon={faTrash} className="hover:text-blue-500 my-auto dark:text-gray-300 dark:hover:text-blue-400" onClick={() => setSelectedSubTaskId(subtask._id)} />
                                        </div>
                                    )}


                                </div>

                            </div>
                        </div>
                    ))}
                    {isKanban && (
                        <Kanban isSubtask={true} taskId={task._id} taskAssignee={task.assignee} setRefresh={setRefresh}/>
                    )}
                    {
                        isGnatt && (
                            <Gantt isSubtask={true} taskId={task._id}/>
                        )
                    }
                    {isTabular && (
                         <table className="w-full  border-collapse border overflow-x-auto border-gray-300 dark:border-gray-600">
                                  <thead>
                                    <tr className="bg-gray-200 dark:bg-gray-800 text-xs md:text-sm">
                                      {headers.map((header, index) => (
                                        <th key={index} className="border border-gray-300 dark:border-gray-600 p-2">
                                          {header}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    
                                      {subTasks.map((data, index) => (
                                        <tr
                                          key={index}
                                          className="odd:bg-white even:bg-gray-100 dark:odd:bg-gray-700 dark:even:bg-gray-800 text-xs md:text-sm"
                                        >
                                          <td className="border border-gray-300 dark:border-gray-600 p-2 py-3">{data.title}</td>
                                          {/* <td className="border border-gray-300 dark:border-gray-600 p-2 ">{data.createdBy}</td> */}
                                          {/* <td className="border border-gray-300 dark:border-gray-600 p-2">{data.assignee}</td> */}
                                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-nowrap">{new Date(data.startDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</td>
                                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-nowrap">{new Date(data.endDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</td>
                                          
                                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-nowrap">
                                            {data.status === "Completed" ? (
                                              <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 text-lg" />
                                            ) : data.status === "In-Progress" ? (
                                              <FontAwesomeIcon icon={faCircleHalfStroke} className="text-yellow-500 text-lg" />
                                            ) : (
                                              <FontAwesomeIcon icon={faCircleStop} className="text-gray-500 text-lg" />
                                            )} {data.status}
                                          </td>
                                          {/* <td className="border border-gray-300 dark:border-gray-600 p-2 text-nowrap">
                                            {data.completedOn ? new Date(data.completedOn).toLocaleDateString("en-US", { day: "numeric", month: "short" }) : "-"}
                                          </td> */}
                                        </tr>
                                      ))
                                   
                                    }
                                  </tbody>
                                </table>
                    )}
                </div>
            )}


            {selectedSubTaskId && (
                <div className="absolute bg-white dark:bg-gray-600  p-6 rounded-md shadow-lg -mt-80 mr-2 right-0 z-10 border" >
                    <p className="text-lg mb-2 font-semibold text-gray-800 dark:text-gray-200">Are you sure?</p>
                    <p className=" mb-2 text-sm text-gray-800 dark:text-gray-200">Are you sure you want to delete this task?</p>
                    <div className="border-b mt-8"></div>
                    <div className="mt-2 flex justify-end gap-2">
                        <button className="py-1 px-7 border-2 border-blue-400 text-blue-400 font-semibold rounded-lg" onClick={() => setSelectedSubTaskId(null)}>No</button>
                        <button className="py-1 px-7 bg-red-500 font-semibold rounded-lg text-white hover:bg-red-400" onClick={handleDeleteTask}>yes</button>
                    </div>
                </div>
            )}

            {isEditSubTaskOpen && (
                <AddSubTask close={() => { setIsEditSubTaskOpen(false); setSelectedSubTaskId(null) }} visibility={isEditSubTaskOpen} task={task} setRefresh={setRefresh} subTask={selectedSubTask} />
            )}
        </div>

    )
}

export default SubTasks