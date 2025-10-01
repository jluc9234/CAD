import React, { useState, useMemo } from 'react';
import ProfileCard from './ProfileCard';
import { MOCK_USERS } from '../data/mockData';
import { User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const SwipeDeck: React.FC = () => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotification();
  
  const swipeableUsers = useMemo(() => 
    MOCK_USERS
        .filter(u => u.id !== currentUser?.id)
        .map(user => ({
            ...user,
            // Generate a pseudo-random but stable match percentage for each user
            matchPercentage: (user.id * 37 + (currentUser?.id || 0) * 29) % 41 + 60
        }))
  , [currentUser]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction: 'left' | 'right') => {
    const swipedUser = swipeableUsers[currentIndex];
    console.log(`Swiped ${direction} on ${swipedUser.name}`);
    
    if (direction === 'right') {
        // Simulate a random match
        if (Math.random() < 0.3) { // 30% chance to match
            setTimeout(() => {
                addNotification(`You matched with ${swipedUser.name}!`, 'match');
            }, 500); // Delay notification slightly for effect
        }
    }

    // Animate out
    setTimeout(() => {
        if (currentIndex < swipeableUsers.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // End of stack, maybe show a message or reshuffle
            console.log("End of profiles");
            setCurrentIndex(0); // Loop for demo
        }
    }, 300); // Wait for animation
  };
  
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