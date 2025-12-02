// User avatar component
// Shows user avatar with optional online badge

import { motion } from 'framer-motion';
import { useSocketStore } from '../stores/socketStore';

function UserAvatar({ user, isOnline, size = 'md' }) {
  const { onlineUsers } = useSocketStore();

  // Determine if user is online
  const userIsOnline = isOnline !== undefined 
    ? isOnline 
    : user && onlineUsers.includes(user.id);

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const badgeSize = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
  };

  // Get initials from username
  const getInitials = (username) => {
    if (!username) return '?';
    return username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get avatar color based on username (consistent color)
  const getAvatarColor = (username) => {
    if (!username) return 'bg-gray-400';
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500'
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="relative inline-block">
      {/* Avatar circle */}
      <div
        className={`${sizeClasses[size]} ${getAvatarColor(
          user?.username
        )} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.username}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          getInitials(user?.username)
        )}
      </div>

      {/* Online badge */}
      {userIsOnline && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute bottom-0 right-0 ${badgeSize[size]} bg-green-500 border-2 border-white rounded-full`}
        />
      )}
    </div>
  );
}

export default UserAvatar;

