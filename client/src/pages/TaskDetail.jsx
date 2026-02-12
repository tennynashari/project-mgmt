import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import { apiFetch } from "../api.js";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");

  useEffect(() => {
    loadTask();
    loadComments();
    loadUsers();
  }, [id]);

  const loadTask = async () => {
    try {
      const data = await apiFetch(`/api/tasks/${id}`);
      setTask(data);
    } catch (err) {
      console.error(err);
      navigate("/tasks");
    }
  };

  const loadComments = async () => {
    try {
      const data = await apiFetch(`/api/comments/task/${id}`);
      setComments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await apiFetch("/api/users");
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await apiFetch("/api/comments", {
        method: "POST",
        body: JSON.stringify({
          taskId: parseInt(id),
          message: commentText
        })
      });
      setCommentText("");
      loadComments();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await apiFetch(`/api/comments/${commentId}`, { method: "DELETE" });
      loadComments();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    setCommentText(value);

    // Detect @ mention
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(" ")) {
        setMentionSearch(textAfterAt.toLowerCase());
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (user) => {
    const lastAtIndex = commentText.lastIndexOf("@");
    const newText = commentText.slice(0, lastAtIndex) + `@${user.name} `;
    setCommentText(newText);
    setShowMentions(false);
  };

  const filteredUsers = mentionSearch
    ? users.filter((u) => u.name.toLowerCase().includes(mentionSearch))
    : users;

  const getStatusColor = (status) => {
    switch (status) {
      case "To Do":
        return "bg-slate-100 text-slate-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Review":
        return "bg-yellow-100 text-yellow-700";
      case "Done":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Low":
        return "bg-slate-100 text-slate-600";
      case "Medium":
        return "bg-orange-100 text-orange-700";
      case "High":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const renderCommentWithMentions = (text) => {
    // Highlight @mentions
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return (
          <span key={i} className="font-medium text-blue-600">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  if (!task) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <p className="text-slate-500">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <button
          onClick={() => navigate("/tasks")}
          className="mb-6 text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Tasks
        </button>

        <div className="mb-6 rounded-xl bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-2xl font-semibold text-slate-900">{task.title}</h2>
                <span className={`rounded-md px-2 py-1 text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <span className={`rounded-md px-2 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              {task.description && (
                <p className="mb-4 text-slate-600">{task.description}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <p className="text-xs text-slate-500">Project</p>
              <p className="font-medium text-slate-900">{task.project.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Assigned to</p>
              <p className="font-medium text-slate-900">{task.assignee?.name || "Unassigned"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Start Date</p>
              <p className="font-medium text-slate-900">
                {task.startDate ? new Date(task.startDate).toLocaleDateString() : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Due Date</p>
              <p className="font-medium text-slate-900">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No deadline"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Progress</p>
              <p className="font-medium text-slate-900">{task.progress}%</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="rounded-xl bg-white p-6 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Comments ({comments.length})
          </h3>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <div className="relative">
              <textarea
                className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
                rows="3"
                placeholder="Add a comment... Use @username to mention someone"
                value={commentText}
                onChange={handleCommentChange}
              />
              
              {/* Mention Dropdown */}
              {showMentions && filteredUsers.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2 w-64 rounded-lg border border-slate-200 bg-white shadow-lg">
                  {filteredUsers.slice(0, 5).map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleMentionSelect(user)}
                      className="flex w-full items-center gap-2 border-b border-slate-100 px-4 py-2 text-left text-sm hover:bg-slate-50 last:border-b-0"
                    >
                      <span className="font-medium text-slate-900">{user.name}</span>
                      <span className="text-xs text-slate-500">{user.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Post Comment
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-slate-100 p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{comment.user.name}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm text-slate-700">{renderCommentWithMentions(comment.message)}</p>
              </div>
            ))}

            {comments.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
