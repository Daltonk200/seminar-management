// components/Header.jsx
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeaderProps {
  user: string;
  onSignOut?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onSignOut }) => {
  const router = useRouter();
  
  interface HandleSignOutEvent extends React.MouseEvent<HTMLButtonElement> {}

  const handleSignOut = (e: HandleSignOutEvent): void => {
    e.preventDefault();
    // Clear token from localStorage
    localStorage.removeItem('token');
    
    // Call onSignOut prop if provided
    if (onSignOut) {
      onSignOut();
    }
    
    // Navigate to login page
    router.push('/login');
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link href="/" className="flex items-center">
        <h1 className="text-xl font-bold">Kodschul Management Hub</h1>
      </Link>
      <div className="flex items-center space-x-4">
        <span className="text-sm">Welcome, {user}</span>
        <button
          onClick={handleSignOut}
          className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Header;