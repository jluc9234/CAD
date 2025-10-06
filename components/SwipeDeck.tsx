/// <reference types="vite/client" />

import React, { useState, useMemo, useEffect } from 'react';
import ProfileCard from './ProfileCard';
import { User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const SwipeDeck: React.FC = () => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    if (!currentUser) return;
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error);
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

  const handleSwipe = async (direction: 'left' | 'right') => {
    const swipedUser = swipeableUsers[currentIndex];
    console.log(`Swiped ${direction} on ${swipedUser.name}`);
    const action = direction === 'right' ? 'like' : 'pass';
    
    // Send swipe to backend
    const token = localStorage.getItem('token');
    try {
      // First, record the swipe
      const swipeResponse = await fetch(`${API_BASE}/swipe`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ swipedUserId: swipedUser.id, action })
      });

      if (swipeResponse.ok && action === 'like') {
        // Check if this created a match
        const matchResponse = await fetch(`${API_BASE}/check-match`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ swipedUserId: swipedUser.id })
        });

        if (matchResponse.ok) {
          const matchResult = await matchResponse.json();
          if (matchResult.isMatch) {
            // It's a match! Show notification
            addNotification(`You matched with ${swipedUser.name}! 💕`, 'match');
          }
        }
      }
    } catch (error) {
      console.error('Error processing swipe:', error);
    }

    // Animate out
    setTimeout(() => {
        if (currentIndex < swipeableUsers.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // End of stack, fetch more or show message
            console.log("End of profiles");
            setCurrentIndex(0); // Reset for demo
            // Optionally refetch users
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