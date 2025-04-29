// pages/index.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import { 
  Layers, 
  Users, 
  Calendar, 
  CheckCircle, 
  BookOpen, 
  UserCheck,
  Loader2
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalTrainers: 0,
    upcomingCourses: 0,
    completedCourses: 0,
  });
  const [user, setUser] = useState("Admin");
  const [loading, setLoading] = useState(true);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      // If we had a real JWT, we could decode it to get the username
      setUser("Admin");
      fetchStats();
    }
  }, [router]);

  // Fetch statistics from our APIs
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch courses
      const coursesResponse = await fetch('/api/courses');
      const coursesData = await coursesResponse.json();
      
      // Fetch trainers
      const trainersResponse = await fetch('/api/trainers');
      const trainersData = await trainersResponse.json();

      if (coursesData.success && trainersData.success) {
        const courses = coursesData.data;
        const today = new Date();
        
        // Calculate statistics
        interface Course {
          date: string;
        }

        const upcomingCourses: number = (courses as Course[]).filter((course: Course) => new Date(course.date) >= today).length;
        const completedCourses: number = (courses as Course[]).filter((course: Course) => new Date(course.date) < today).length;
        
        setStats({
          totalCourses: courses.length,
          totalTrainers: trainersData.data.length,
          upcomingCourses,
          completedCourses,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onSignOut={handleSignOut} />
      <main className="container mx-auto p-6">
        <div className="flex items-center mb-8">
          <Layers className="mr-3 text-blue-600" size={32} />
          <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin mr-2 text-blue-600" size={24} />
            <p className="text-gray-600 font-medium">Loading statistics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Total Courses</h2>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BookOpen className="text-blue-600" size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalCourses}
              </p>
              <p className="text-sm text-gray-500 mt-2">Available courses</p>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Total Trainers</h2>
                <div className="p-3 bg-green-100 rounded-full">
                  <UserCheck className="text-green-600" size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {stats.totalTrainers}
              </p>
              <p className="text-sm text-gray-500 mt-2">Active trainers</p>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Upcoming Courses</h2>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Calendar className="text-orange-600" size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {stats.upcomingCourses}
              </p>
              <p className="text-sm text-gray-500 mt-2">Scheduled sessions</p>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Completed Courses</h2>
                <div className="p-3 bg-purple-100 rounded-full">
                  <CheckCircle className="text-purple-600" size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {stats.completedCourses}
              </p>
              <p className="text-sm text-gray-500 mt-2">Finished sessions</p>
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap gap-4">
          <Link
            href="/courses"
            className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-300"
          >
            <BookOpen className="mr-2" size={20} />
            View Courses
          </Link>
          <Link
            href="/trainers"
            className="flex items-center bg-green-600 text-white px-6 py-3 rounded-lg shadow-sm hover:bg-green-700 transition-colors duration-300"
          >
            <Users className="mr-2" size={20} />
            View Trainers
          </Link>
        </div>
      </main>
    </div>
  );
}