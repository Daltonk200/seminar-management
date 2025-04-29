import { useState, useEffect } from "react";
import Header from "../components/Header";
import Link from "next/link";
import {
  Calendar,
  BookOpen,
  MapPin,
  Users,
  DollarSign,
  Trash2,
  Edit,
  UserPlus,
  UserMinus,
  Plus,
  Info,
  AlertCircle,
} from "lucide-react";

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
  const [selectedTrainer, setSelectedTrainer] = useState<{
    [courseId: string]: string;
  }>({});
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
  const [confirmAssign, setConfirmAssign] = useState<{
    courseId: string | null;
    trainerId: string | null;
  }>({ courseId: null, trainerId: null });
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

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

  const handleAssignTrainer = (courseId: string) => {
    const trainerId = selectedTrainer[courseId];
    if (!trainerId) return;
    setConfirmAssign({ courseId, trainerId });
  };

  const doAssignTrainer = async () => {
    if (!confirmAssign.courseId || !confirmAssign.trainerId) return;
    setAssigning(confirmAssign.courseId);
    setError(null);
    try {
      const res = await fetch("/api/assign-trainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: confirmAssign.courseId,
          trainerId: confirmAssign.trainerId,
        }),
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
      setConfirmAssign({ courseId: null, trainerId: null });
    }
  };

  const handleRemoveTrainer = (courseId: string) => {
    setConfirmRemove(courseId);
  };

  const doRemoveTrainer = async () => {
    if (!confirmRemove) return;
    setError(null);
    try {
      const res = await fetch("/api/assign-trainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: confirmRemove, action: "remove" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        setError(data.message || "Failed to remove trainer");
      }
    } catch (err) {
      setError("An error occurred while removing trainer");
    } finally {
      setConfirmRemove(null);
    }
  };

  const handleDeleteCourse = (id: string) => {
    setDeleteCourseId(id);
  };
  const confirmDeleteCourse = async () => {
    if (!deleteCourseId) return;
    setError(null);
    try {
      const res = await fetch(`/api/courses?id=${deleteCourseId}`, {
        method: "DELETE",
      });
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
    <div className="min-h-screen bg-gray-50">
      <Header user="John Doe" onSignOut={() => {}} />
      <main className="container mx-auto p-6 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Courses</h1>
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
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-500 transition duration-200 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Create Course</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex items-center space-x-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
              <p className="text-gray-600">Loading courses...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium text-sm uppercase tracking-wider">
                      Course Name
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-sm uppercase tracking-wider">
                      Date
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-sm uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-sm uppercase tracking-wider">
                      Location
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-sm uppercase tracking-wider">
                      Trainer
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-sm uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr
                      key={course._id}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">
                          {course.name}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-gray-700">
                          <Calendar size={16} className="mr-2 text-gray-500" />
                          {new Date(course.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-gray-700">
                          <BookOpen size={16} className="mr-2 text-gray-500" />
                          {course.subject}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-gray-700">
                          <MapPin size={16} className="mr-2 text-gray-500" />
                          {course.location}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {course.trainer ? (
                          <div className="bg-green-50 p-3 rounded-md border border-green-100">
                            <div className="font-medium text-green-700 mb-1">
                              {course.trainer.name}
                            </div>
                            <div className="text-xs text-gray-600 mb-1">
                              {course.trainer.training_subjects.join(", ")}
                            </div>
                            <div className="text-xs text-gray-500">
                              {course.trainer.email}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                            <Info size={14} className="mr-1" />
                            No trainer assigned
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md shadow-sm hover:bg-amber-600 transition duration-150"
                            onClick={() => handleEditCourse(course)}
                          >
                            <Edit size={16} className="mr-1" />
                            Edit
                          </button>
                          <button
                            className="inline-flex items-center px-3 py-1.5 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 transition duration-150"
                            onClick={() => handleDeleteCourse(course._id)}
                          >
                            <Trash2 size={16} className="mr-1" />
                            Delete
                          </button>
                          {course.trainer ? (
                            <button
                              className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white rounded-md shadow-sm hover:bg-gray-700 transition duration-150"
                              onClick={() => handleRemoveTrainer(course._id)}
                            >
                              <UserMinus size={16} className="mr-1" />
                              Remove Trainer
                            </button>
                          ) : (
                            <div className="flex items-center space-x-2 mt-2 md:mt-0">
                              <select
                                className="border border-gray-300 px-3 py-1.5 rounded-md shadow-sm text-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 text-gray-900 bg-white"
                                value={selectedTrainer[course._id] || ""}
                                onChange={(e) =>
                                  setSelectedTrainer({
                                    ...selectedTrainer,
                                    [course._id]: e.target.value,
                                  })
                                }
                              >
                                <option
                                  value=""
                                  className="text-gray-500 bg-white"
                                >
                                  Select Trainer
                                </option>
                                {trainers.map((trainer) => (
                                  <option
                                    key={trainer._id}
                                    value={trainer._id}
                                    className="text-gray-900 bg-white"
                                  >
                                    {trainer.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                className="inline-flex items-center px-3 py-1.5 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleAssignTrainer(course._id)}
                                disabled={
                                  !selectedTrainer[course._id] ||
                                  assigning === course._id
                                }
                              >
                                {assigning === course._id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Assigning...
                                  </>
                                ) : (
                                  <>
                                    <UserPlus size={16} className="mr-1" />
                                    Assign
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      {/* Create/Edit Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editCourseId ? "Edit Course" : "Create Course"}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditCourseId(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <BookOpen size={16} />
                  </span>
                  <input
                    type="text"
                    value={newCourse.name}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, name: e.target.value })
                    }
                    className="pl-10 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Date
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Calendar size={16} />
                  </span>
                  <input
                    type="date"
                    value={newCourse.date}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, date: e.target.value })
                    }
                    className="pl-10 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Subject
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <BookOpen size={16} />
                  </span>
                  <input
                    type="text"
                    value={newCourse.subject}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, subject: e.target.value })
                    }
                    className="pl-10 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Location
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <MapPin size={16} />
                  </span>
                  <input
                    type="text"
                    value={newCourse.location}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, location: e.target.value })
                    }
                    className="pl-10 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Participants
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Users size={16} />
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={newCourse.participants}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        participants: Number(e.target.value),
                      })
                    }
                    className="pl-10 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Notes
                </label>
                <div className="relative">
                  <span className="absolute top-2 left-3 text-gray-500">
                    <Info size={16} />
                  </span>
                  <textarea
                    value={newCourse.notes}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, notes: e.target.value })
                    }
                    className="pl-10 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-24"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <DollarSign size={16} />
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={newCourse.price}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        price: Number(e.target.value),
                      })
                    }
                    className="pl-10 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Trainer Price
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <DollarSign size={16} />
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={newCourse.trainer_price}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        trainer_price: Number(e.target.value),
                      })
                    }
                    className="pl-10 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditCourseId(null);
                  }}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-500 transition duration-150"
                >
                  {editCourseId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Course Confirmation Modal */}
      {deleteCourseId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center mb-4 text-red-600">
              <AlertCircle size={24} className="mr-2" />
              <h2 className="text-xl font-bold">Confirm Delete</h2>
            </div>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete this course? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-150"
                onClick={() => setDeleteCourseId(null)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-150 flex items-center"
                onClick={confirmDeleteCourse}
              >
                <Trash2 size={16} className="mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Assign Trainer Modal */}
      {confirmAssign.courseId && confirmAssign.trainerId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center mb-4 text-green-600">
              <UserPlus size={24} className="mr-2" />
              <h2 className="text-xl font-bold">Confirm Assign Trainer</h2>
            </div>
            <p className="mb-6 text-gray-700">
              Are you sure you want to assign this trainer? An email will be
              sent to notify the trainer.
            </p>
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-150"
                onClick={() =>
                  setConfirmAssign({ courseId: null, trainerId: null })
                }
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-500 transition duration-150 flex items-center"
                onClick={doAssignTrainer}
              >
                <UserPlus size={16} className="mr-1" />
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Remove Trainer Modal */}
      {confirmRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center mb-4 text-gray-600">
              <UserMinus size={24} className="mr-2" />
              <h2 className="text-xl font-bold">Confirm Remove Trainer</h2>
            </div>
            <p className="mb-6 text-gray-700">
              Are you sure you want to remove this trainer? An email will be
              sent to notify the trainer.
            </p>
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-150"
                onClick={() => setConfirmRemove(null)}
              >
                Cancel
              </button>
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-150 flex items-center"
                onClick={doRemoveTrainer}
              >
                <UserMinus size={16} className="mr-1" />
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
