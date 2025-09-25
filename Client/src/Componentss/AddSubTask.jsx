import { faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const AddSubTask = ({ visibility, close, task, setRefresh, subTask }) => {
    const [title, setTitle] = useState(subTask ? subTask.subtaskName : "");
    const [subTaskId, setSubTaskId] = useState(null)
    const [status, setStatus] = useState(null)
    const [isLoading,setIsLoading]=useState(false);
    const [minDate, setMinDate] = useState("");
     const [maxDate, setMaxDate] = useState("");
     
     useEffect(() => {
         if (task) {
           setMinDate(task.startDate?.split("T")[0] || "");
           setMaxDate(task.endDate?.split("T")[0] || "");
         }
       }, [task]);
       useEffect(() => {
         if (minDate) {
           console.log("min", minDate);
         }
       }, [minDate]);

    useEffect(() => {
        if (subTask) {
            setTitle(subTask.subtaskName);
            setSubTaskId(subTask.subtaskId);
            setStatus(subTask.status);
           
            {subTask.subTaskStart? document.getElementById("start-date").value=new Date(subTask?.subTaskStart).toISOString().split('T')[0]:""}
            {subTask.subTaskEnd? document.getElementById("end-date").value=new Date(subTask?.subTaskEnd).toISOString().split('T')[0]:""}        }
    }, [subTask]);

    const handleSubmit = async (e) => {
        setIsLoading(true);
        e.preventDefault();
        if (subTask) {
            //edit subtask
            try {
                await axios.post(`http://localhost:5000/api/editSubTask/${task._id}/${subTaskId}`, {
                    title: document.getElementById('title').value,
                    status: status,
                    startDate:document.getElementById("start-date").value,
                    endDate:document.getElementById("end-date").value
                });
                setIsLoading(true);
                toast.success('Task Updated');
                setRefresh(Date.now());

                close();
            } catch (err) {
                setIsLoading(true);
                toast.error('Error updating subtask');
                console.error('Error updating subtask', err);
            }
        } else {
            //add subtask
            if (document.getElementById("start-date").value > document.getElementById("end-date").value) {
                document.getElementById("end-date").setCustomValidity("End date must be greater than or equal to start date.");
                document.getElementById("end-date").reportValidity(); // Show error immediately
                setIsLoading(false);
                return;
              }
            try {
                await axios.post(`http://localhost:5000/api/addSubTask/${task._id}`, {
                    title: document.getElementById('title').value,
                    startDate: document.getElementById('start-date').value,
                    endDate: document.getElementById('end-date').value,
                });
                setIsLoading(true);
                toast.success('Subtask added successfully');
                setRefresh(Date.now());
                close();
            } catch (err) {
                setIsLoading(true);
                toast.error('Error adding subtask');
                console.error('Error adding subtask', err);
            }
        }
    };
    return (
        <div className={`fixed inset-0 flex items-center justify-start p-4 bg-gray-900 bg-opacity-50 z-50 transition-opacity duration-300 ${visibility ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}>
            <form className={`relative bg-white dark:bg-gray-700 dark:text-gray-100 p-5 rounded-md shadow-md w-[90%] lg:w-[40%] md:w-[60%] transition-transform duration-500 ${visibility ? "scale-100" : "scale-90"
                }`}
                onSubmit={handleSubmit}>
                <h2 className="text-xl font-semibold mb-8 ">Add Subtask</h2>

                <div className='gap-2'>
                {/* Project Name Field */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        id="title"
                        className="peer w-full border-b border-gray-300 dark:bg-gray-700 dark:text-gray-100 px-3 pt-6 pb-2 focus:outline-none focus:border-b-blue-500 autofill:bg-transparent autofill:shadow-none"
                        placeholder=" "
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <label
                        htmlFor="title"
                        required
                        className="absolute left-3  text-gray-500 text-sm transition-all duration-200 transform peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500">
                        Title
                    </label>
                </div>
                <div className="relative mb-4">
                    <input type="date" 
                    {...(!subTask && {
                        min: minDate,
                        max: maxDate,
                        defaultValue: minDate,
                      })}
                    id="start-date" className="peer w-full border-b border-gray-300 px-3 pt-6 pb-2 text-gray-500 dark:text-gray-400 focus:outline-none focus:border-b-blue-500 dark:bg-gray-700" required />
                    <label htmlFor="start-date" className="absolute left-3 top-1 text-gray-500  dark:text-gray-400 text-sm">Start Date</label>
                </div>
                <div className="relative mb-4">
                    <input type="date" 
                    onChange={(e) => e.target.setCustomValidity("")}
                    min={minDate}
                    defaultValue={minDate ? minDate : ""}
                    max={maxDate}
                    id="end-date" className="peer w-full border-b border-gray-300 px-3 pt-6 pb-2 text-gray-500 dark:text-gray-400 focus:outline-none focus:border-b-blue-500 dark:bg-gray-700" required />
                    <label htmlFor="end-date" className="absolute left-3 top-1 text-gray-500 dark:text-gray-400 text-sm">End Date</label>
                </div>
                </div>
                <p className="font-thin text-xs -mt-3 mb-2">Note: Date range will be within respective tasks duration</p>

                <div className='flex justify-end gap-3'>
                    <button
                        type="submit"
                        className="mt-5  px-6 p-2 rounded-md border border-blue-500 text-blue-500 transform transition-transform duration-200 hover:scale-105"
                        onClick={close}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="mt-5 px-6 p-2 w-36 rounded-md bg-gradient-to-r from-blue-400 to-blue-900 text-white transition-all duration-300 hover:from-blue-900 hover:to-blue-400">
                       {isLoading? ( <FontAwesomeIcon
                                                       icon={faSpinner}
                                                       spin
                                                       className=" text-lg"
                                                     />):(subTask ? "Save changes" : "Add Subtask")
                                           }
                    </button>
                </div>
            </form>
        </div>
    )
}
export default AddSubTask
