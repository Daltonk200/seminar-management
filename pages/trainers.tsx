// pages/trainers.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";

// Define TypeScript interfaces
interface Trainer {
  _id: string;
  name: string;
  training_subjects: string[];
  location: string;
  email: string;
}

export default function Trainers() {
  const router = useRouter();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<string>("Admin");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTrainer, setNewTrainer] = useState<{
    name: string;
    training_subjects: string;
    location: string;
    email: string;
  }>({
    name: "",
    training_subjects: "",
    location: "",
    email: "",
  });
  const [deleteTrainerId, setDeleteTrainerId] = useState<string | null>(null);
  const [editTrainerId, setEditTrainerId] = useState<string | null>(null);

  // Open modal for editing, pre-fill with trainer data
  const handleEditTrainer = (trainer: Trainer) => {
    setNewTrainer({
      name: trainer.name,
      training_subjects: trainer.training_subjects.join(", "),
      location: trainer.location,
      email: trainer.email,
    });
    setEditTrainerId(trainer._id);
    setShowCreateModal(true);
  };

  // Handle create or update trainer
  const handleCreateOrUpdateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response, data;
      if (editTrainerId) {
        response = await fetch(`/api/trainers?id=${editTrainerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newTrainer.name,
            training_subjects: newTrainer.training_subjects.split(',').map(subject => subject.trim()),
            location: newTrainer.location,
            email: newTrainer.email
          }),
        });
      } else {
        response = await fetch('/api/trainers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newTrainer.name,
            training_subjects: newTrainer.training_subjects.split(',').map(subject => subject.trim()),
            location: newTrainer.location,
            email: newTrainer.email
          }),
        });
      }
      data = await response.json();
      if (data.success) {
        setNewTrainer({ name: "", training_subjects: "", location: "", email: "" });
        setShowCreateModal(false);
        setEditTrainerId(null);
        fetchTrainers();
      } else {
        setError(data.message || 'Failed to save trainer');
      }
    } catch (error) {
      setError('An error occurred while saving trainer');
    }
  };

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      // If we had a real JWT, we could decode it to get the username
      setUser("Admin");
      fetchTrainers();
    }
  }, [router]);

  // Fetch trainers from API
  const fetchTrainers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/trainers');
      const data = await response.json();

      if (data.success) {
        setTrainers(data.data);
      } else {
        setError(data.message || 'Failed to fetch trainers');
      }
    } catch (error) {
      setError('An error occurred while fetching trainers');
      console.error("Error fetching trainers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete trainer
  const handleDeleteTrainer = (trainerId: string) => {
    setDeleteTrainerId(trainerId);
  };

  const confirmDeleteTrainer = async () => {
    if (!deleteTrainerId) return;
    setError(null);
    try {
      const response = await fetch(`/api/trainers?id=${deleteTrainerId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchTrainers();
      } else {
        setError(data.message || 'Failed to delete trainer');
      }
    } catch (error) {
      setError('An error occurred while deleting trainer');
      console.error("Error deleting trainer:", error);
    } finally {
      setDeleteTrainerId(null);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div>
      <Header user={user} onSignOut={handleSignOut} />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Trainers</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600"
        >
          Create Trainer
        </button>
        
        {loading ? (
          <div className="text-center py-6">
            <p className="text-gray-600">Loading trainers...</p>
          </div>
        ) : trainers.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No trainers found. Create your first trainer!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md text-gray-900">
              <thead className="bg-gray-800 text-white">
                <tr className="w-full bg-gray-100 border-b">
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">
                    Trainer Name
                  </th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">
                    Subjects
                  </th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">
                    Location
                  </th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">
                    Email
                  </th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {trainers.map((trainer) => (
                  <tr key={trainer._id} className="border-b">
                    <td className="py-3 px-4">{trainer.name}</td>
                    <td className="py-3 px-4">
                      {trainer.training_subjects.join(", ")}
                    </td>
                    <td className="py-3 px-4">{trainer.location}</td>
                    <td className="py-3 px-4">
                      <a 
                        href={`mailto:${trainer.email}`}
                        className="text-blue-500 hover:underline"
                      >
                        {trainer.email}
                      </a>
                    </td>
                    <td className="py-3 px-4 flex space-x-2">
                      <button 
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        onClick={() => handleEditTrainer(trainer)}
                      >
                        Edit
                      </button>
                      <button 
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => handleDeleteTrainer(trainer._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Create Trainer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{editTrainerId ? "Edit Trainer" : "Create Trainer"}</h2>
            <form onSubmit={handleCreateOrUpdateTrainer}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newTrainer.name}
                  onChange={(e) => setNewTrainer({...newTrainer, name: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Subjects (comma separated)
                </label>
                <input
                  type="text"
                  value={newTrainer.training_subjects}
                  onChange={(e) => setNewTrainer({...newTrainer, training_subjects: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="React.js, Next.js, Node.js"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={newTrainer.location}
                  onChange={(e) => setNewTrainer({...newTrainer, location: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newTrainer.email}
                  onChange={(e) => setNewTrainer({...newTrainer, email: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setEditTrainerId(null); }}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  {editTrainerId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Trainer Confirmation Modal */}
      {deleteTrainerId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-red-600">Confirm Delete</h2>
            <p className="mb-6 text-gray-800">Are you sure you want to delete this trainer? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setDeleteTrainerId(null)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={confirmDeleteTrainer}
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