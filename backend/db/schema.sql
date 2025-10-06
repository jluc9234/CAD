-- Drop the table if it exists to start fresh (optional, good for testing)
DROP TABLE IF EXISTS "Users";

-- Create the Users table
CREATE TABLE "Users" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "age" INTEGER NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "phone" VARCHAR(50),
    "password" VARCHAR(255) NOT NULL, -- In a real app, this should be a hashed password
    "bio" TEXT,
    "images" TEXT[], -- Array of strings for image URLs
    "interests" TEXT[], -- Array of strings for interests
    "background" TEXT -- Can be a data URL or a regular URL for the background image
);

-- Create the Swipes table for tracking user interactions
CREATE TABLE "Swipes" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE,
    "swiped_user_id" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE,
    "action" VARCHAR(10) NOT NULL CHECK (action IN ('like', 'pass')),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the DateIdeas table for user-created date ideas
CREATE TABLE "DateIdeas" (
    "id" SERIAL PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(50),
    "authorId" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE,
    "authorName" VARCHAR(255),
    "authorImage" VARCHAR(500),
    "location" VARCHAR(255),
    "date" TIMESTAMP,
    "budget" VARCHAR(10),
    "dressCode" VARCHAR(50),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the UserPremium table for premium subscriptions
CREATE TABLE "UserPremium" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE,
    "is_premium" BOOLEAN DEFAULT FALSE,
    "expires_at" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the Matches table for mutual likes
CREATE TABLE "Matches" (
    "id" SERIAL PRIMARY KEY,
    "user1_id" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE,
    "user2_id" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user1_id, user2_id)
);

-- Create the Messages table for chat
CREATE TABLE "Messages" (
    "id" SERIAL PRIMARY KEY,
    "match_id" INTEGER REFERENCES "Matches"("id") ON DELETE CASCADE,
    "sender_id" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE,
    "text" TEXT NOT NULL,
    "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial user data for the application
INSERT INTO "Users" ("name", "age", "email", "phone", "password", "bio", "images", "interests") VALUES
('Alex', 29, 'demo@user.com', '555-123-4567', 'password', 'Software engineer by day, aspiring musician by night. I love exploring the city''s music scene and finding hidden coffee shops. Let''s create our own soundtrack.', '{"https://picsum.photos/seed/user0a/800/1200", "https://picsum.photos/seed/user0b/800/1200", "https://picsum.photos/seed/user0c/800/1200"}', '{"Live Music", "Espresso", "Coding", "Jazz"}'),
('Chloe', 28, 'chloe@email.com', NULL, 'password123', 'Lover of art, adventure, and artisanal coffee. Looking for someone to explore new galleries and hiking trails with. Bonus points if you can make me laugh.', '{"https://picsum.photos/seed/user1a/800/1200", "https://picsum.photos/seed/user1b/800/1200"}', '{"Hiking", "Painting", "Indie Music", "Travel"}'),
('Marcus', 31, 'marcus@email.com', NULL, 'password123', 'Architect who finds beauty in structure and nature. I enjoy weekend trips out of the city, trying new recipes, and a good game of chess. Seeking a genuine connection.', '{"https://picsum.photos/seed/user2a/800/1200"}', '{"Architecture", "Cooking", "Chess", "Camping"}'),
('Sophia', 26, 'sophia@email.com', NULL, 'password123', 'Fitness enthusiast and foodie. My perfect weekend involves a morning run followed by brunch. Let''s challenge each other at the gym and then reward ourselves with tacos.', '{"https://picsum.photos/seed/user3a/800/1200"}', '{"Yoga", "Weightlifting", "Brunch", "Dogs"}'),
('Leo', 30, 'leo@email.com', NULL, 'password123', 'Photographer always chasing the perfect shot. I''m drawn to compelling stories and interesting perspectives. Let''s find a great view and talk about anything and everything.', '{"https://picsum.photos/seed/user4a/800/1200"}', '{"Photography", "Documentaries", "City Nights", "Philosophy"}'),
('Isabella', 27, 'isabella@email.com', NULL, 'password123', 'Novelist with a love for rainy days and cozy cafes. If you enjoy deep conversations and getting lost in a good book, we''ll get along great. Tell me your favorite story.', '{"https://picsum.photos/seed/user5a/800/1200"}', '{"Reading", "Creative Writing", "Tea", "Museums"}');
