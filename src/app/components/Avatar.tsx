import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
};

export default function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  // Get initials from name
  const getInitials = (fullName: string | null | undefined) => {
    if (!fullName) return '?';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    // Take first letter of first name and first letter of last name
    const firstInitial = names[0].charAt(0).toUpperCase();
    const lastInitial = names[names.length - 1].charAt(0).toUpperCase();
    return firstInitial + lastInitial;
  };

  // Generate consistent background color based on name
  const getBackgroundColor = (fullName: string | null | undefined) => {
    if (!fullName) return 'bg-gray-500';
    
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    
    // Simple hash function to get consistent color
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const shouldShowImage = src && !imageError;
  const initials = getInitials(name);
  const bgColor = getBackgroundColor(name);
  const sizeClass = sizeClasses[size];

  if (shouldShowImage) {
    return (
      <img
        src={src}
        alt={name || 'Profile'}
        className={`${sizeClass} rounded-full object-cover ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${bgColor} rounded-full flex items-center justify-center text-white font-bold ${className}`}
    >
      {initials}
    </div>
  );
}