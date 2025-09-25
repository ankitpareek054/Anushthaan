import {
  faCirclePlay,
  faCircleStop,
} from "@fortawesome/free-regular-svg-icons";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { createPortal } from "react-dom";
import { getFormattedDate } from "../functions/getFormattedDate.jsx";
import StartTimer from "./StartTimer.jsx";
const TimeTracker = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [startedFor, setStartedFor] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isPopupOpen, setisPopupOpen] = useState(false);
  const [time, setTime] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const formattedDate = getFormattedDate();

    axios
      .post("http://localhost:5000/api/getTime", {
        userId: user?._id,
        date: formattedDate,
      })
      .then((res) => {
        setTime(res.data.time);
        setIsStarted(res.data.started);
        setIsPaused(res.data.paused);
        setStartedFor(res.data.project);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    let timer;
    if (isStarted && !isPaused) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1000);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isStarted, isPaused]);

  // const handleStart = async () => {
  //   setIsStarted(true);

  //   axios
  //     .post("http://localhost:5000/api/startTimer", {
  //       userId: user._id,
  //       startTime: Date.now(),
  //       elapsedTime: time,
  //       breakTime: 0,
  //       date: new Date().toLocaleDateString(),
  //       started: true,
  //     })
  //     .then((res) => {
  //       toast.success("Timer Started");
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };
  const handlePause = () => {
    const formattedDate = getFormattedDate();
    setIsPaused(!isPaused);
    let paused;
    if (!isPaused) {
      toast.success("paused at ", time);
      paused = true;
    } else {
      toast.success("resumed at ", Date.now());
      paused = false;
    }
    axios
      .post("http://localhost:5000/api/pauseResumeTimer", {
        userId: user._id,
        date: formattedDate,
        paused: paused,
        pausedAt: Date.now(),
      })
      .then((res) => {
        setIsPaused(res.data.paused);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleStop = async () => {
    setIsStarted(false);
    setIsPaused(false);
    setStartedFor(null);
    axios
      .post("http://localhost:5000/api/stopTimer", {
        userId: user._id,
        date: getFormattedDate(),
        elapsedTime: time,
      })
      .then((res) => {
        setTime(0);
        toast.success(
          `Timer Ended, Total time worked: ${formatTimeInText(time)}`
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0"
    );
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return { hours, minutes, seconds };
  };

  const formatTimeInText = (milliseconds) => {
    const { hours, minutes, seconds } = formatTime(milliseconds);
    return `${hours}:${minutes}:${seconds}`;
  };
  const { hours, minutes, seconds } = formatTime(time);
  return (
    <>
      <p className="text-base text-gray-800 dark:text-gray-200 font-bold ml-2">
        Time Tracker
        {startedFor && (
          <span className="text-gray-600 text-sm">({startedFor})</span>
        )}{" "}
      </p>
      <div className="my-2 bg-gray-400 dark:bg-gray-600 h-[1px]"></div>
      <div className="flex flex-row justify-between items-center gap-2 mx-2 mb-2 ">
        {/* First Row */}

        <div className=" count-down-main">
          <p className="p-2 text-lg bg-gray-200 dark:bg-gray-600  rounded-md">
            {hours}:{minutes}:{seconds}
          </p>
        </div>

        <div className="flex  gap-2 w-fit  count-down-main">
          <div className="timer">
            <button
              className={`timer  ${
                isStarted || time > 0
                  ? "bg-gray-400"
                  : "bg-gradient-to-r from-blue-400 to-blue-900"
              } p-3 rounded-lg text-white text-lg`}
              disabled={isStarted || time > 0}
              onClick={() => setisPopupOpen(true)}
              title="start"
            >
              <FontAwesomeIcon icon={faCirclePlay} />
            </button>
          </div>
          <div className="timer ">
            <button
              className={`${
                !isStarted
                  ? "bg-gray-400"
                  : "bg-gradient-to-r from-red-400 to-red-800"
              } p-3 rounded-lg text-white  text-lg`}
              disabled={!isStarted}
              onClick={handleStop}
              title="stop"
            >
              <FontAwesomeIcon icon={faCircleStop} />
            </button>
          </div>
          <div className="timer ">
            <button
              className={`timer  ${
                isStarted || time > 0
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-800"
                  : "bg-gray-400"
              } text-white text-lg p-3 px-4 rounded-lg `}
              disabled={!isStarted}
              onClick={() => handlePause()}
              title="pause/resume"
            >
              {isPaused ? (
                <FontAwesomeIcon icon={faPlay} />
              ) : (
                <FontAwesomeIcon icon={faPause} />
              )}
            </button>
          </div>
        </div>
      </div>
      {isPopupOpen &&
        createPortal(
          <StartTimer
            close={() => setisPopupOpen(false)}
            visibility={isPopupOpen}
            time={time}
            setIsStarted={setIsStarted}
          />,
          document.body // Ensures it is outside the navbar
        )}
    </>
  );
};

export default TimeTracker;
