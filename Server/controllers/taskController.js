import mongoose from "mongoose";
import NotificationModel from "../models/Notification.js";
import ProjectModel from "../models/Projects.js";
import TaskModel from "../models/Tasks.js";
import UserModel from "../models/User.js";
import { sendTaskAssignmentEmail, sendTaskUpdateEmail } from "../services/emailService.js";
import { createNotification } from "./notificationController.js";

// Add Task API
// Add Task API
export const addTask = async (req, res) => {
  try {
    const { title, description, projectName, assignee, assigneeId, status, priority, createdBy, createdById, startDate, endDate, completedOn, comments, visibility } = req.body;

    // Check if a task with the same name already exists in the project
    const existingTask = await TaskModel.findOne({ title, projectName });
    if (existingTask) {
      return res.status(400).json({ message: "Task name already exists in this project" });
    }

    const taskData = {
      title: req.body.title,
      description: req.body.description,
      projectName: req.body.projectName || "None",
      assignee: req.body.assignee || "Unassigned",
      assigneeId: req.body.assigneeId,
      status: req.body.status || "No Progress",
      priority: req.body.priority || "Low",
      createdBy: req.body.createdBy,
      createdById: req.body.createdById,
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
      visibility: req.body.visibility || "public",
      completedOn: req.body.CompletedOn || null,
      comments: req.body.comments || [],
    };

    const task = new TaskModel(taskData);
    await task.save();

    const project = await ProjectModel.findOne({ pname: projectName });
    if (project && project.members.has(assigneeId) && project.members.get(assigneeId).notifyinEmail) {
      const user = await UserModel.findById(assigneeId);
      await sendTaskAssignmentEmail(user, project, title, description, startDate, endDate, priority, createdBy);
    }
    // Fetch Project Details to Check Notification Preferences
    if (assigneeId) {
      const project = await ProjectModel.findOne({ pname: projectName });
      if (project && project.members.has(assigneeId)) {
        const assigneeMember = project.members.get(assigneeId);

        if (assigneeMember.notifyinApp) {
          await createNotification({
            user_id: assigneeId,
            type: "Task",
            message: `You have been assigned a new task: "${title}" in project "${project.pname}"`,
            entity_id: task._id,
            metadata: { priority, status, assignedBy: createdBy, startDate, endDate, title, projectName },
          });
        }
      }
    }
    res.status(201).json({ message: "Task created successfully and email sent", task });
  } catch (err) {
    console.error("Error in addTask:", err.message);
    if (!res.headersSent) {
      res.status(400).json({ message: err.message });
    }
  }
};



// Fetch Tasks API
export const getTasks = async (req, res) => {
  try {
    const tasks = await TaskModel.find();
    res.status(200).json(tasks);
  } catch (err) {
    console.error("Error in getTasks:", err.message);
    res.status(500).json({ message: err.message });
  }
};


//add comment
export const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { username, text, userId, attachments } = req.body;

    if (!username || !text) {
      return res.status(400).json({ message: "Username and text are required." });
    }

    // Fetch task details
    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      userId: userId,
      username: username,
      text,
      attachments: attachments,
    };

    // Update task with new comment
    await TaskModel.updateOne({ _id: taskId }, { $push: { comments: newComment } });

    // Extract mentioned usernames from the text
    const mentionedUsernames = text.match(/@(\w+)/g)?.map((name) => name.substring(1)) || [];
    //console.log("Extracted Mentions:", mentionedUsernames);

    if (mentionedUsernames.length > 0) {
      // Fetch mentioned users from the database
      const mentionedUsers = await UserModel.find({ name: { $in: mentionedUsernames } });
      //console.log("Mentioned Users Found in DB:", mentionedUsers);

      if (mentionedUsers.length > 0) {
        await Promise.all(
          mentionedUsers.map(async (mentionedUser) => {
            await createNotification({
              user_id: mentionedUser._id,
              type: "CommentMention",
              message: `${username} mentioned you in a comment on task "${task.title}"`,
              entity_id: taskId,
              metadata: {
                commentedBy: username,
                taskId: taskId,
                taskName: task.title,
                projectId: task.projectId,
                projectName: task.projectName,
              },
            });
          })
        );
      } else {
        console.log("No mentioned users found in the database.");
      }
    }

    res.status(201).json({ message: "Comment added successfully" });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



//fetch comments
export const getComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const tasks = await TaskModel.findById(taskId)
    res.status(200).json(tasks.comments)

  } catch (error) {
    console.log("error in getComments", error.message)
    res.status(500).json({ message: error.message });

  }
}


//toggle between in-progress and completed
export const updateStatus = async (req, res) => {
  try {
    const { taskId, status } = req.body;

    if (!taskId || !status) {
      return res.status(400).json({ message: "Task ID and status required" });
    }
    let completedOn = null;
    if (status === "Completed") {
      completedOn = new Date();
    }
    const updatedTask = await TaskModel.findByIdAndUpdate(taskId, { status, completedOn }, { new: true });
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not updated" });
    }


    res.json({ message: "Task status updated", task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Server error" });
  }
}

//delete comment
export const deleteComment = async (req, res) => {
  const { taskId, commentId } = req.params;

  try {
    // Find the task to get the comment's details before deleting
    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Find the comment in the task
    const comment = task.comments.find((c) => c._id.toString() === commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Delete the comment from the task
    const updateTask = await TaskModel.findOneAndUpdate(
      { _id: taskId },
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );
    console.log("update bhi ho hgaya mere bhai ", updateTask);

    if (!updateTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Delete the associated notification for the mention in the comment
    await NotificationModel.deleteMany({
      entity_id: taskId,
      type: "CommentMention",
      "metadata.commentedBy": comment.username, // Ensures only related notifications are deleted
    });

    res.status(200).json({ message: "Comment and associated notifications deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Error deleting comment", error: err.message });
  }
};

//add subtask
export const addsubTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, startDate, endDate } = req.body;
    const newSubTask = {
      _id: new mongoose.Types.ObjectId(),
      title,
      startDate,
      endDate
    };

    const updateFields = {
      $push: { subTasks: newSubTask },
    };

    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    //change to no progress when a subtask is added
    if (task.subTasks.length === 0) {
      updateFields.$set = { status: "No Progress" };
    }
    const updatedTask = await TaskModel.findByIdAndUpdate(taskId, updateFields, { new: true });
    res.status(200).json({ message: "Subtask added successfully", updatedTask });
  } catch (error) {
    console.error("Error adding subtask:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const getSubTasks = async (req, res) => {
  try {
    const { taskId } = req.params;
    const tasks = await TaskModel.findById(taskId)
    res.status(200).json(tasks.subTasks)
  } catch (error) {
    res.status(500).json({ message: "Server error in getSubTasks()", error: error.message })
  }
}

export const deleteSubTask = async (req, res) => {
  try {
    const { taskId, subTaskId } = req.params;
    const updateTask = await TaskModel.findOneAndUpdate(
      { _id: taskId },
      { $pull: { subTasks: { _id: subTaskId } } },
      { new: true }
    )

    if (!updateTask) {
      return res.status(404).json({ message: "Task not found" })
    }
    res.status(200).json({ message: "Subtask deleted successfully" })
  }
  catch (error) {
    res.status(500).json({ message: "Server error in deleteSubTask()", error: error.message })
  }
}

export const updateSubTask = async (req, res) => {
  try {
    const { taskId, subTaskId } = req.params;
    const { title, status, startDate, endDate } = req.body;

    const updateTask = await TaskModel.findOneAndUpdate(
      { _id: taskId, "subTasks._id": subTaskId },
      { $set: { "subTasks.$.title": title, "subTasks.$.startDate": startDate, "subTasks.$.endDate": endDate } },
      { new: true },

    )
    if (!updateTask) {
      return res.status(404).json({ message: "Task not found" })
    }
    res.status(200).json(updateSubTask);
  } catch (error) {
    res.status(500).json({ message: "Server error in updateSubTask()", error: error.message })
  }
}

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, assignee, assigneeId, status, priority, startDate, endDate, visibility } = req.body;

    const existingTask = await TaskModel.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const changes = {};
    for (const key of ["title", "description", "assignee", "priority", "status", "startDate", "endDate"]) {
      const normalizeDate = (date) => (date ? new Date(date).toISOString().split("T")[0] : null);

      let oldValue = existingTask[key];
      let newValue = req.body[key];

      if (key === "startDate" || key === "endDate") {
        oldValue = normalizeDate(oldValue);
        newValue = normalizeDate(newValue);
      }

      if (newValue !== undefined && String(newValue) !== String(oldValue)) {
        changes[key] = { old: oldValue || "N/A", new: newValue || "N/A" };
      }
    }

    if (Object.keys(changes).length === 0) {
      return res.status(200).json({ message: "No changes detected" });
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      { title, description, assignee, assigneeId, status, priority, startDate, endDate, visibility },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task update failed" });
    }

    const project = await ProjectModel.findOne({ pname: updatedTask.projectName });
    if (project && project.members.has(assigneeId) && project.members.get(assigneeId).notifyinEmail) {
      const user = await UserModel.findById(assigneeId);
      if (user) {
        let changesList = Object.entries(changes)
          .map(([key, value]) => `<p><strong>${key.replace(/([A-Z])/g, " $1")}:</strong> <br> Old: ${value.old || "N/A"} <br> New: ${value.new || "N/A"}</p>`)
          .join("");
        await sendTaskUpdateEmail(user, project, title, changesList);
      }
    }

    if (project && assigneeId && project.members.has(assigneeId)) {
      const assigneeMember = project.members.get(assigneeId);

      if (assigneeMember.notifyinApp) {
        await createNotification({
          user_id: assigneeId,
          type: "TaskUpdate",
          message: Object.entries(changes).map(([key, value]) => `${key}: ${value.old} → ${value.new}`).join(", "),
          entity_id: updatedTask._id,
          metadata: { priority, status, assignedBy: updatedTask.createdBy },
        });
      }
    }
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error in updateTask()", error: error.message });
  }
};


//update subtask status
export const updateSubTaskStatus = async (req, res) => {
  try {
    const { subTaskId } = req.params;
    const { status } = req.body;
    const updatedTask = await TaskModel.findOneAndUpdate(
      { "subTasks._id": subTaskId },
      { $set: { "subTasks.$.status": status } },
      { new: true }
    )
    if (!updatedTask) {
      return res.status(404).json({ message: "Subtask not found" })
    }

    const totalSubTasks = updatedTask.subTasks.length;
    const inProgressLength = updatedTask.subTasks.filter(subtask => subtask.status === "In-Progress").length;
    const completedSubTasksLength = updatedTask.subTasks.filter(subtask => subtask.status === "Completed").length;


    if (totalSubTasks === completedSubTasksLength) {
      updatedTask.status = "Completed";
      updatedTask.completedOn = new Date();
    } else if (completedSubTasksLength > 0 || inProgressLength > 0) {
      updatedTask.status = "In-Progress";
    } else {
      updatedTask.status = "No Progress";
    }
    await updatedTask.save();


    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: "Server error in updateSubTaskStatus()", error: err.message })
  }
}

export const importTasks = async (req, res) => {
  try {
    const tasks = req.body.tasks;
    const insertedTasks = await TaskModel.insertMany(tasks);
    res.json({ importedTasks: insertedTasks });
  } catch (err) {
    console.error("Error importing tasks:", err); // Log detailed error to server console
    res.status(500).json({ message: err.message });
  }
};

// Fetch Tasks by Project Name API
export const fetchTask = async (req, res) => {
  try {
    const { projectName } = req.params;
    const tasks = await TaskModel.find({ projectName });

    // Instead of returning a 404 error, return an empty array
    res.json(tasks.length ? tasks : []);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


export const updateTaskDates = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;
    const updateTask = await TaskModel.findByIdAndUpdate(id, { startDate, endDate }, { new: true });
    res.status(200).json(updateTask);

  } catch (error) {
    res.status(500).json({ message: "Server error in updateTask()", error: error.message })
  }
}


// delete main  task  api 
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body; // or from req.user if using auth middleware

    // Validate inputs
    if (!taskId || !userId) {
      return res.status(400).json({ message: "Task ID and User ID are required" });
    }

    const task = await TaskModel.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ensure only the creator can delete
    if (task.createdById.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to delete this task" });
    }

    // Delete the task
    await TaskModel.findByIdAndDelete(taskId);

    // Send response
    res.status(200).json({ message: "Task deleted successfully" });

  } catch (err) {
    console.error("Error deleting task:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};







