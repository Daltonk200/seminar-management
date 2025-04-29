import { useState, useEffect } from "react";
import Header from "../components/Header";
import Link from "next/link";

// TypeScript interfaces for fetched data
interface Trainer {
  _id: string;
  name: string;
  training_subjects: string[];
  location: string;
  email: string;
}

interface Course {
  _id: string;
  name: string;
  date: string;
  subject: string;
  location: string;
  participants: number;
  notes?: string;
  price: number;
  trainer_price: number;
  trainer?: Trainer | null;
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null); // courseId being assigned
  const [selectedTrainer, setSelectedTrainer] = useState<{ [courseId: string]: string }>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: "",
    date: "",
    subject: "",
    location: "",
    participants: 1,
    notes: "",
    price: 0,
    trainer_price: 0,
  });
  const [editCourseId, setEditCourseId] = useState<string | null>(null);
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);

  // Open modal for editing, pre-fill with course data
  const handleEditCourse = (course: Course) => {
    setNewCourse({
      name: course.name,
      date: course.date.slice(0, 10), // format for input type="date"
      subject: course.subject,
      location: course.location,
      participants: course.participants,
      notes: course.notes || "",
      price: course.price,
      trainer_price: course.trainer_price,
    });
    setEditCourseId(course._id);
    setShowCreateModal(true);
  };

  // Handle create or update
  const handleCreateOrUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      let res, data;
      if (editCourseId) {
        res = await fetch(`/api/courses?id=${editCourseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCourse),
        });
      } else {
        res = await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCourse),
        });
      }
      data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setEditCourseId(null);
        setNewCourse({
          name: "",
          date: "",
          subject: "",
          location: "",
          participants: 1,
          notes: "",
          price: 0,
          trainer_price: 0,
        });
        fetchData();
      } else {
        setError(data.message || "Failed to save course");
      }
    } catch (err) {
      setError("An error occurred while saving course");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesRes, trainersRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/trainers"),
      ]);
      const coursesData = await coursesRes.json();
      const trainersData = await trainersRes.json();
      if (coursesData.success && trainersData.success) {
        setCourses(coursesData.data);
        setTrainers(trainersData.data);
      } else {
        setError("Failed to fetch data");
      }
    } catch (err) {
      setError("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTrainer = async (courseId: string) => {
    const trainerId = selectedTrainer[courseId];
    if (!trainerId) return;
    setAssigning(courseId);
    setError(null);
    try {
      const res = await fetch("/api/assign-trainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, trainerId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        setError(data.message || "Failed to assign trainer");
      }
    } catch (err) {
      setError("An error occurred while assigning trainer");
    } finally {
      setAssigning(null);
    }
  };

  const handleRemoveTrainer = async (courseId: string) => {
    setError(null);
    try {
      const res = await fetch("/api/assign-trainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, action: "remove" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        setError(data.message || "Failed to remove trainer");
      }
    } catch (err) {
      setError("An error occurred while removing trainer");
    }
  };

  const handleDeleteCourse = (id: string) => {
    setDeleteCourseId(id);
  };

  const confirmDeleteCourse = async () => {
    if (!deleteCourseId) return;
    setError(null);
    try {
      const res = await fetch(`/api/courses?id=${deleteCourseId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        setError(data.message || "Failed to delete course");
      }
    } catch (err) {
      setError("An error occurred while deleting course");
    } finally {
      setDeleteCourseId(null);
    }
  };

  return (
    <div>
      <Header user="John Doe" onSignOut={() => {}} />
      <main className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8">Courses</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        )}
        {loading ? (
          <div className="text-center py-6">Loading courses...</div>
        ) : (
          <>
            <button
              onClick={() => {
                setShowCreateModal(true);
                setEditCourseId(null);
                setNewCourse({
                  name: "",
                  date: "",
                  subject: "",
                  location: "",
                  participants: 1,
                  notes: "",
                  price: 0,
                  trainer_price: 0,
                });
              }}
              className="bg-green-500 text-white px-4 py-2 rounded mb-6 hover:bg-green-600"
            >
              Create Course
            </button>
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md text-gray-900">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-3 px-4 border-b">Course Name</th>
                  <th className="py-3 px-4 border-b">Date</th>
                  <th className="py-3 px-4 border-b">Subject</th>
                  <th className="py-3 px-4 border-b">Location</th>
                  <th className="py-3 px-4 border-b">Trainer</th>
                  <th className="py-3 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td className="py-3 px-4 border-b">{course.name}</td>
                    <td className="py-3 px-4 border-b">{new Date(course.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 border-b">{course.subject}</td>
                    <td className="py-3 px-4 border-b">{course.location}</td>
                    <td className="py-3 px-4 border-b">
                      {course.trainer ? (
                        <div>
                          <div>
                            <strong>{course.trainer.name}</strong>
                          </div>
                          <div>{course.trainer.training_subjects.join(", ")}</div>
                          <div>{course.trainer.email}</div>
                        </div>
                      ) : (
                        <span>No trainer assigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 border-b flex space-x-2">
                      <button
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-yellow-600"
                        onClick={() => handleEditCourse(course)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600"
                        onClick={() => handleDeleteCourse(course._id)}
                      >
                        Delete
                      </button>
                      {course.trainer ? (
                        <button
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600"
                          onClick={() => handleRemoveTrainer(course._id)}
                        >
                          Remove Trainer
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <select
                            className="border border-gray-300 px-4 py-2 rounded-lg shadow-md"
                            value={selectedTrainer[course._id] || ""}
                            onChange={e => setSelectedTrainer({ ...selectedTrainer, [course._id]: e.target.value })}
                          >
                            <option value="">Select Trainer</option>
                            {trainers.map((trainer) => (
                              <option key={trainer._id} value={trainer._id}>
                                {trainer.name}
                              </option>
                            ))}
                          </select>
                          <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
                            onClick={() => handleAssignTrainer(course._id)}
                            disabled={!selectedTrainer[course._id] || assigning === course._id}
                          >
                            {assigning === course._id ? "Assigning..." : "Assign Trainer"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </main>
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editCourseId ? "Edit Course" : "Create Course"}
            </h2>
            <form onSubmit={handleCreateOrUpdateCourse}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  value={newCourse.name}
                  onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
                <input
                  type="date"
                  value={newCourse.date}
                  onChange={e => setNewCourse({ ...newCourse, date: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Subject</label>
                <input
                  type="text"
                  value={newCourse.subject}
                  onChange={e => setNewCourse({ ...newCourse, subject: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Location</label>
                <input
                  type="text"
                  value={newCourse.location}
                  onChange={e => setNewCourse({ ...newCourse, location: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Participants</label>
                <input
                  type="number"
                  min={1}
                  value={newCourse.participants}
                  onChange={e => setNewCourse({ ...newCourse, participants: Number(e.target.value) })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Notes</label>
                <textarea
                  value={newCourse.notes}
                  onChange={e => setNewCourse({ ...newCourse, notes: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Price</label>
                <input
                  type="number"
                  min={0}
                  value={newCourse.price}
                  onChange={e => setNewCourse({ ...newCourse, price: Number(e.target.value) })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Trainer Price</label>
                <input
                  type="number"
                  min={0}
                  value={newCourse.trainer_price}
                  onChange={e => setNewCourse({ ...newCourse, trainer_price: Number(e.target.value) })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditCourseId(null);
                  }}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  {editCourseId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteCourseId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-red-600">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this course? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setDeleteCourseId(null)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={confirmDeleteCourse}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
