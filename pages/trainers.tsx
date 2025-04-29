// pages/trainers.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { 
  Users, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Mail, 
  MapPin, 
  Bookmark, 
  User,
  X,
  Save,
  Loader2,
  AlertCircle
} from "lucide-react";

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
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onSignOut={handleSignOut} />
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Users className="mr-3 text-green-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-800">Trainers</h1>
        </div>
        
        {error && (
          <div className="flex items-center bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <AlertCircle className="mr-2 text-red-500" size={20} />
            <span>{error}</span>
          </div>
        )}
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center bg-green-600 text-white px-5 py-2 rounded-lg mb-6 hover:bg-green-700 transition-colors duration-300 shadow-sm"
        >
          <UserPlus className="mr-2" size={18} />
          Create Trainer
        </button>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin mr-2 text-green-600" size={24} />
            <p className="text-gray-600 font-medium">Loading trainers...</p>
          </div>
        ) : trainers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
            <User className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600">No trainers found. Create your first trainer!</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
            <table className="min-w-full text-gray-900">
              <thead>
                <tr>
                  <th className="py-4 px-6 text-left text-gray-700 font-semibold border-b">
                    <div className="flex items-center">
                      <User className="mr-2 text-gray-500" size={16} />
                      Trainer Name
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left text-gray-700 font-semibold border-b">
                    <div className="flex items-center">
                      <Bookmark className="mr-2 text-gray-500" size={16} />
                      Subjects
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left text-gray-700 font-semibold border-b">
                    <div className="flex items-center">
                      <MapPin className="mr-2 text-gray-500" size={16} />
                      Location
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left text-gray-700 font-semibold border-b">
                    <div className="flex items-center">
                      <Mail className="mr-2 text-gray-500" size={16} />
                      Email
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left text-gray-700 font-semibold border-b">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {trainers.map((trainer) => (
                  <tr key={trainer._id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium">{trainer.name}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {trainer.training_subjects.map((subject, idx) => (
                          <span 
                            key={idx} 
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">{trainer.location}</td>
                    <td className="py-4 px-6">
                      <a 
                        href={`mailto:${trainer.email}`}
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <Mail className="mr-1" size={14} />
                        {trainer.email}
                      </a>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button 
                          className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                          onClick={() => handleEditTrainer(trainer)}
                        >
                          <Edit2 className="mr-1" size={14} />
                          Edit
                        </button>
                        <button 
                          className="flex items-center bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors duration-300"
                          onClick={() => handleDeleteTrainer(trainer._id)}
                        >
                          <Trash2 className="mr-1" size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Create/Edit Trainer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide text-gray-900">
            <h2 className="text-2xl font-bold mb-4">{editTrainerId ? "Edit Trainer" : "Create Trainer"}</h2>
            <form onSubmit={handleCreateOrUpdateTrainer}>
              <div className="mb-4">
                <label className=" text-gray-700 text-sm font-semibold mb-2 flex items-center">
                  <User className="mr-2 text-gray-500" size={16} />
                  Name
                </label>
                <input
                  type="text"
                  value={newTrainer.name}
                  onChange={(e) => setNewTrainer({...newTrainer, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  required
                />
              </div>
              <div className="mb-4">
                <label className=" text-gray-700 text-sm font-semibold mb-2 flex items-center">
                  <Bookmark className="mr-2 text-gray-500" size={16} />
                  Subjects (comma separated)
                </label>
                <input
                  type="text"
                  value={newTrainer.training_subjects}
                  onChange={(e) => setNewTrainer({...newTrainer, training_subjects: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="React.js, Next.js, Node.js"
                  required
                />
              </div>
              <div className="mb-4">
                <label className=" text-gray-700 text-sm font-semibold mb-2 flex items-center">
                  <MapPin className="mr-2 text-gray-500" size={16} />
                  Location
                </label>
                <input
                  type="text"
                  value={newTrainer.location}
                  onChange={(e) => setNewTrainer({...newTrainer, location: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  required
                />
              </div>
              <div className="mb-6">
                <label className=" text-gray-700 text-sm font-semibold mb-2 flex items-center">
                  <Mail className="mr-2 text-gray-500" size={16} />
                  Email
                </label>
                <input
                  type="email"
                  value={newTrainer.email}
                  onChange={(e) => setNewTrainer({...newTrainer, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setEditTrainerId(null); }}
                  className="flex items-center bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-300"
                >
                  <X className="mr-1" size={16} />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300"
                >
                  <Save className="mr-1" size={16} />
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
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center mb-4">
              <AlertCircle className="mr-2 text-red-600" size={24} />
              <h2 className="text-xl font-bold text-red-600">Confirm Delete</h2>
            </div>
            <p className="mb-6 text-gray-700">Are you sure you want to delete this trainer? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                className="flex items-center bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-300"
                onClick={() => setDeleteTrainerId(null)}
              >
                <X className="mr-1" size={16} />
                Cancel
              </button>
              <button
                className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300"
                onClick={confirmDeleteTrainer}
              >
                <Trash2 className="mr-1" size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
