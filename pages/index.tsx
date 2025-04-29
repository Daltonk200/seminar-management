// pages/index.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";

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
    <div>
      <Header user={user} onSignOut={handleSignOut} />
      <main className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        
        {loading ? (
          <div className="text-center py-6">
            <p className="text-gray-600">Loading statistics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Total Courses</h2>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalCourses}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Total Trainers</h2>
              <p className="text-3xl font-bold text-green-600">
                {stats.totalTrainers}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Upcoming Courses</h2>
              <p className="text-3xl font-bold text-orange-600">
                {stats.upcomingCourses}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Completed Courses</h2>
              <p className="text-3xl font-bold text-gray-600">
                {stats.completedCourses}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex space-x-4">
          <Link
            href="/courses"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600"
          >
            View Courses
          </Link>
          <Link
            href="/trainers"
            className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600"
          >
            View Trainers
          </Link>
        </div>
      </main>
    </div>
  );
}