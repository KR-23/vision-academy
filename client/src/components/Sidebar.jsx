import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Heart, Trophy, Award, Settings, 
  PlusCircle, FileSpreadsheet, DollarSign, UserCheck, ShieldCheck 
} from 'lucide-react';

export default function Sidebar({ role }) {
  // Define sidebar links based on user role
  const getLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { to: '/admin', label: 'Admin Panel', icon: ShieldCheck },
          { to: '/admin/instructors', label: 'Approve Instructors', icon: UserCheck },
          { to: '/admin/courses', label: 'All Courses', icon: BookOpen },
        ];
      case 'instructor':
        return [
          { to: '/instructor', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/instructor/courses', label: 'My Courses', icon: BookOpen },
          { to: '/instructor/create-course', label: 'Create Course', icon: PlusCircle },
          { to: '/instructor/submissions', label: 'Grading Hub', icon: FileSpreadsheet },
        ];
      case 'student':
      default:
        return [
          { to: '/dashboard', label: 'Student Home', icon: LayoutDashboard },
          { to: '/dashboard/courses', label: 'My Learning', icon: BookOpen },
          { to: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
          { to: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy },
          { to: '/dashboard/certificates', label: 'Certificates', icon: Award },
          { to: '/profile', label: 'Profile Settings', icon: Settings },
        ];
    }
  };

  const links = getLinks();

  return (
    <aside className="fixed inset-y-16 left-0 z-30 hidden w-64 border-r border-accent/30/80 bg-bg-main px-3 py-6 dark:border-accent/20/80  md:block">
      <div className="flex flex-col gap-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard' || link.to === '/instructor' || link.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-accent/10 text-primary  '
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-main   '
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}
