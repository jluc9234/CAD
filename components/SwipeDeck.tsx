import React, { useState, useMemo, useEffect } from 'react';
import ProfileCard from './ProfileCard';
import { User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useMatch } from '../contexts/MatchContext';
import { apiService } from '../services/apiService';

const SwipeDeck: React.FC = () => {
  const { currentUser } = useAuth();
  const { addMatch } = useMatch();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      const fetchUsers = async () => {
          if(!currentUser) return;
          setIsLoading(true);
          try {
              const usersToSwipe = await apiService.getUsersToSwipe(currentUser.id);
              setUsers(usersToSwipe);
          } catch (error) {
              console.error("Failed to fetch users", error);
          } finally {
              setIsLoading(false);
          }
      };
      fetchUsers();
  }, [currentUser]);
  
  const swipeableUsers = useMemo(() => 
    users
        .map(user => ({
            ...user,
            // Generate a pseudo-random but stable match percentage for each user
            matchPercentage: (user.id * 37 + (currentUser?.id || 0) * 29) % 41 + 60
        }))
  , [users, currentUser]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentIndex >= swipeableUsers.length) return;
    
    const swipedUser = swipeableUsers[currentIndex];
    console.log(`Swiped ${direction} on ${swipedUser.name}`);
    
    if (direction === 'right') {
        // Simulate a random match
        if (Math.random() < 0.4) { // 40% chance to match
            addMatch(swipedUser);
        }
    }

    // Animate out
    setTimeout(() => {
        setCurrentIndex(prevIndex => prevIndex + 1);
    }, 300); // Wait for animation
  };
  
  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-full text-white">
            <svg className="animate-spin h-8 w-8 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    )
  }

  if (currentIndex >= swipeableUsers.length) {
    return (
        <div className="flex items-center justify-center h-full text-white text-xl p-8 text-center">
            <p>No more profiles to show right now. Check back later!</p>
        </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center pt-16 pb-20">
      <div className="relative w-[90vw] h-[calc(100vh-160px)] max-w-md max-h-[70vh] flex items-center justify-center" style={{ perspective: '1000px' }}>
        {swipeableUsers.slice(currentIndex).reverse().map((user, index) => {
          const relativeIndex = swipeableUsers.length - 1 - currentIndex - index;
          const isTopCard = relativeIndex === 0;

          return (
            <div
              key={user.id}
              className="absolute w-full h-full transition-all duration-500 ease-in-out"
              style={{
                transform: `translateY(${-relativeIndex * 10}px) translateZ(${-relativeIndex * 50}px) rotateX(${isTopCard ? 0 : 5}deg)`,
                opacity: 1 - relativeIndex * 0.1,
                zIndex: swipeableUsers.length - relativeIndex,
              }}
            >
              {isTopCard ? (
                <ProfileCard user={user} onSwipe={handleSwipe} matchPercentage={user.matchPercentage} />
              ) : (
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                    <img src={user.images[0]} alt={user.name} className="h-full w-full object-cover blur-sm brightness-75"/>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SwipeDeck;
