import { faPaperclip, faPenNib, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { FaPlus, FaTrash, FaFilePdf, FaFileAlt } from "react-icons/fa";
import { toast } from "react-toastify";

const CommentSection = ({ task }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isdeleting, setIsDeleting] = useState(false);

  const openPopup = () => setIsPopupOpen(true); // Open the popup
  const closePopup = () => setIsPopupOpen(false); // Close the popup

  const taskid = task._id;

  const [users, setUsers] = useState([]); // Store users for mentions
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [mentionIndex, setMentionIndex] = useState(null);
  // Get current user
  const user = localStorage.getItem("user");
  const parsedUser = JSON.parse(user);
  const username = parsedUser.name;
  const userId = parsedUser._id;
  const modalRef = useRef(null);
  const commentsPaneRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    if (commentsPaneRef.current) {
      commentsPaneRef.current.scrollTop = commentsPaneRef.current.scrollHeight;
    }
  }

  useEffect(() => {
    axios.post(`http://localhost:5000/api/getMembers/${task.projectName}`)
      .then((res) => setUsers(res.data))
      .catch((err) => console.log("Error fetching users:", err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setSelectedComment(null); // Close the modal when clicking outside
      }
    };

    if (selectedComment) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedComment]); // Re-run this effect whenever selectedComment changes



  const handleAddComment = async () => {
    if (uploading) {
      toast.error("Please wait for the file to upload");
      return;
    }

    if (!newComment.trim() && selectedFiles.length === 0) {
      toast.error("Please enter a comment or select files.");
      return;
    }

    setUploading(true);
    try {
      let uploadedFileUrls = [];
      if (selectedFiles.length > 0) {
        console.log(selectedFiles)
        uploadedFileUrls = await uploadFilesToS3(selectedFiles);
      }
      console.log(uploadedFileUrls);

      const commentData = {
        userId,
        username,
        text: newComment.trim(),
        attachments: uploadedFileUrls,
      };
      const response = await axios.post(
        `http://localhost:5000/api/addComment/${taskid}`,
        commentData
      );

      if (response.data.message === "Comment added successfully") {
        toast.success("Comment added successfully!");
        setRefresh((prev) => !prev);
        setNewComment("");
        setSelectedFiles([]);
      } else {
        toast.error("Failed to add comment.");
      }
    } catch (err) {
      toast.error("Error adding comment");
    } finally {
      setUploading(false);
    }
  };
  //function to upload files to s3
  const uploadFilesToS3 = async (files) => {
    const fileUrls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      console.log(file);

      try {
        const response = await axios.post("http://localhost:5000/api/upload", formData);
        if (response.data.urls && response.data.urls.length > 0) {
          console.log(response.data.urls[0]);
          fileUrls.push(response.data.urls[0].fileName);
        }
        console.log(response);
      } catch (error) {
        console.error("Upload failed", error);
        toast.error("File upload failed");
      }
    }

    return fileUrls;
  };

  const handleDeleteComment = async () => {
    try {
      setIsDeleting(true);
      const dati = await axios.delete(`http://localhost:5000/api/deleteComment/${taskid}/${selectedComment}`);
      console.log("dati ka log h ye", dati);
      setRefresh(!refresh)
      setSelectedComment(null)
      toast.success("Comment deleted suully");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
    finally {
      setIsDeleting(false);
    }
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    setNewComment(value);

    const words = value.split(" ");
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith("@")) {
      const searchQuery = lastWord.substring(1).toLowerCase();
      setMentionSuggestions(users.filter(user => user.name.toLowerCase().includes(searchQuery)));
      setMentionIndex(words.length - 1);
    } else {
      setMentionSuggestions([]);
      setMentionIndex(null);
    }
  };

  const selectMention = (mention) => {
    const words = newComment.split(" ");
    words[mentionIndex] = `@${mention.name}`;
    setNewComment(words.join(" ") + " ");
    setMentionSuggestions([]);
    setMentionIndex(null);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const highlightMentions = (text) => {
    return text.split(" ").map((word, index) =>
      word.startsWith("@") ? (
        <span key={index} style={{ color: "#3B82F6" }}>
          {word}{" "}
        </span>
      ) : (
        word + " "
      )
    );
  };

  useEffect(() => {
    axios
      .post(`http://localhost:5000/api/getComments/${taskid}`)
      .then((res) => {
        setComments(res.data);
        setTimeout(() => {
          scrollToBottom();
        }, 300);
      })
      .catch((err) => {
        console.log("Error fetching comments", err);
      });
  }, [refresh]);

  // Function to get initials from the name
  const getInitials = (name) => {
    if (!name) return "";
    const words = name.split(" ");
    return words.length > 1
      ? words[0][0].toUpperCase() + words[1][0].toUpperCase()
      : words[0][0].toUpperCase();
  };

  // Function to generate background colors based on the name
  const generateColor = (name) => {
    const colors = ["#4CAF50", "#FF9800", "#9C27B0", "#2196F3", "#795548", "#c92920"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    setSelectedFiles([...selectedFiles, ...files]);
  };



  const handleDeleteFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleDownload = async (fileName) => {
    try {

      const response = await axios.post(`http://localhost:5000/api/getPresignedUrls/${fileName}`);



      const presignedUrl = response.data.presignedUrl; // Assuming a single URL
      console.log(presignedUrl, "Presigned URL");
      const link = document.createElement("a");
      link.href = presignedUrl;  // Use the extracted URL
      link.setAttribute("download", fileName);  // Set the download attribute with the file name

      document.body.appendChild(link);
      link.click();  // Trigger the download


    } catch (error) {
      console.error("Error downloading file", error);
      toast.error("Failed to download file");
    }
  };

  const renderFilePreview = (file) => {
    const fileExtension = file.name.split('.').pop();


    return (
      <div className="w-full h-20 flex items-center justify-center text-gray-600 dark:text-gray-100">
        {fileExtension === "pdf" ? (
          <div>
            <FaFilePdf
              size={30}
              onClick={() => handleDownload(file.name)}
              className="cursor-pointer"
            />
            <span> {file.name}</span>
          </div>
        ) :
          (
            <div>
              <FaFileAlt
                size={30}
                onClick={() => handleDownload(file.name)}
                className="cursor-pointer"
              />
              <span> {file.name}</span>
            </div>
          )}
      </div>
    );
  };


  return (
    <div className="mt-2 relative">
      {/* Display Comments */}
      <div
        ref={commentsPaneRef}
        className={`border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-4 dark:text-gray-100  overflow-y-auto transition-all duration-300 ${comments.length === 0 ? "h-16" : "max-h-48"
          }`}
        style={{ scrollbarWidth: "thin" }}
      >
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex items-start space-x-2 border-b dark:border-gray-500 p-4">
              <div
                className="w-8 h-8 flex shrink-0 items-center justify-center rounded-full text-white text-lg font-semibold"
                style={{ backgroundColor: generateColor(comment.username) }}
              >
                {getInitials(comment.username)}
              </div>
              <div className="flex justify-between w-full">
                <div>
                  <p className="text-sm font-medium">{comment.username}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-100">
                    {highlightMentions(comment.text)}
                  </p>

                </div>


                {/* Popup Modal */}
                {isPopupOpen && (
                  <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-md w-3/4 h-3/4 overflow-auto relative">
                      <button
                        onClick={closePopup}
                        className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 dark:text-gray-200 dark:hover:text-gray-400"
                      >
                        &times; {/* Cross button */}
                      </button>

                      <h2 className="text-xl font-semibold mb-4">Uploaded Attachments</h2>
                      <div className="grid grid-cols-2 gap-2">
                        {comment.attachments.map((file, index) => (
                          <div key={index} className="border border-gray-300 dark:border-gray-500 p-1 rounded-md">
                            {renderFilePreview({ name: file })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {comment.attachments?.length > 0 && (

                    <p className="text-sm text-gray-500 mt-2 font-bold hover:text-blue-500 dark:text-gray-200 cursor-pointer"
                      onClick={openPopup}
                    >
                      <FontAwesomeIcon icon={faPaperclip} />
                      Attachments
                    </p>
                  )}
                  {comment.userId === userId && (
                    <div className="p-3 border-l hover:text-blue-400" onClick={() => setSelectedComment(comment._id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>



      {/* Input Section */}
      <div className="mt-4">
        <div className="flex items-center dark:bg-gray-800">
        <div
                className="w-8 h-8 flex shrink-0 items-center justify-center rounded-full text-white text-lg font-semibold"
                style={{ backgroundColor: generateColor(username) }}
              >
                {getInitials(username)}
              </div>
          <input
            ref={inputRef}
            type="text"
            value={newComment}
            onChange={handleCommentChange}
            placeholder="Write a comment here..."
            className="flex-1 border border-gray-300 dark:border-gray-500 rounded-lg p-2 text-sm ml-1 dark:bg-gray-800"
          />
          <label htmlFor="file-upload" className="cursor-pointer bg-gray-200 dark:bg-gray-500 dark:text-gray-100  text-gray-600 rounded-lg p-2 mx-2" >
            <FaPlus />
            <input id="file-upload" type="file" onChange={handleFileChange} multiple className="hidden" />
          </label>
          <button
            onClick={handleAddComment}
            className="bg-green-500 hover:scale-105 text-white py-1 px-3 rounded-md transition-transform duration-300 transform ml-2"
          >
            Send
          </button>
        </div>

        {/* Mention Suggestions */}
        {mentionSuggestions.length > 0 && (
          <ul className="absolute bg-white dark:bg-gray-700 border rounded-md shadow-lg min-w-56 max-h-60 mt-1 bottom-10 right-96 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            {mentionSuggestions.map((user, index) => (
              <li
                key={user.id}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-500 cursor-pointer"
                onClick={() => selectMention(user)}
              >
                {user.name}
              </li>
            ))}
          </ul>
        )}

        {/* Display Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 border border-gray-200 dark:border-gray-500 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">Selected Files:</p>
            <ul className="space-y-2">
              {selectedFiles.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400"
                >
                  <span className="truncate">{file.name}</span>
                  <button
                    onClick={() => handleDeleteFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {selectedComment && (
          <div className="absolute bg-white dark:bg-gray-600  p-6 rounded-md shadow-lg -mt-80 mr-2 right-0 z-10 border" ref={modalRef}>
            <p className="text-lg mb-2 font-semibold text-gray-800 dark:text-gray-100">Are you sure?</p>
            <p className=" mb-2 text-sm text-gray-800 dark:text-gray-100">Are you sure you want to delete this comment?</p>
            <div className="border-b mt-8"></div>
            <div className="mt-2 flex justify-end gap-2">
              <button className="py-1 px-7 border-2 border-blue-400 text-blue-400 dark:text-blue-300 font-semibold rounded-lg" onClick={() => setSelectedComment(null)}>No</button>
              <button className="py-1 px-7 bg-red-500 font-semibold rounded-lg text-white hover:bg-red-400" onClick={handleDeleteComment}>yes</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CommentSection;