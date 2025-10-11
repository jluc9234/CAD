import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePremium } from '../contexts/PremiumContext';
import { User } from '../types';
import { SparklesIcon, getRandomGradient } from '../constants';
import { enhanceBio, generateBackgroundImage } from '../services/geminiService';

interface ProfileScreenProps {
    onPremiumClick: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onPremiumClick }) => {
    const { currentUser, logout, updateUser } = useAuth();
    const { isPremium } = usePremium();
    const [user, setUser] = useState<User>(currentUser!);
    const [isEditing, setIsEditing] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGeneratingBg, setIsGeneratingBg] = useState(false);
    const bgFileInputRef = useRef<HTMLInputElement>(null);
    const photoFileInputRef = useRef<HTMLInputElement>(null);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

    const [editSaveGradient, setEditSaveGradient] = useState(() => getRandomGradient());
    const [logoutGradient, setLogoutGradient] = useState(() => getRandomGradient());

    useEffect(() => {
        setUser(currentUser!);
    }, [currentUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev!, [name]: value }));
    };

    const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const interests = e.target.value.split(',').map(item => item.trim());
        setUser(prev => ({ ...prev!, interests }));
    }

    const handleSave = () => {
        updateUser(user);
        setIsEditing(false);
    };

    const handleEnhanceBio = async () => {
        if (!isPremium || !user.bio) return;
        setIsEnhancing(true);
        try {
            const newBio = await enhanceBio(user.bio);
            setUser(prev => ({...prev, bio: newBio}));
        } catch (error) {
            console.error("Failed to enhance bio", error);
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleBgFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const updatedUser = { ...user, background: base64String };
                setUser(updatedUser);
                updateUser(updatedUser);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handlePhotoClick = (index: number) => {
        if (isEditing) {
            setSelectedPhotoIndex(index);
            photoFileInputRef.current?.click();
        }
    };

    const handlePhotoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && selectedPhotoIndex !== null) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const newImages = [...user.images];
                newImages[selectedPhotoIndex] = base64String;
                setUser(prev => ({ ...prev, images: newImages }));
            };
            reader.readAsDataURL(file);
        }
        if (photoFileInputRef.current) {
            photoFileInputRef.current.value = "";
        }
        setSelectedPhotoIndex(null);
    };

    const handleGenerateBg = async () => {
        if (!isPremium || !aiPrompt) return;
        setIsGeneratingBg(true);
        try {
            const imageUrl = await generateBackgroundImage(aiPrompt);
            if (imageUrl) {
                const updatedUser = { ...user, background: imageUrl };
                setUser(updatedUser);
                updateUser(updatedUser);
            }
        } catch (error) {
            console.error("Failed to generate background", error);
        } finally {
            setIsGeneratingBg(false);
        }
    };

    const handleResetBackground = () => {
        const { background, ...restOfUser } = user;
        const updatedUser = restOfUser;
        setUser(updatedUser);
        updateUser(updatedUser);
    };


    if (!currentUser) return null;

    const photoGrid = Array(6).fill(null).map((_, i) => user.images[i] || null);

    return (
        <div className="px-4 text-white overflow-y-auto h-full scrollbar-hide pt-20 pb-24">
            <div className="max-w-md mx-auto">
                 <input
                    type="file"
                    ref={photoFileInputRef}
                    onChange={handlePhotoFileChange}
                    accept="image/*"
                    className="hidden"
                />
                <div className="grid grid-cols-3 grid-rows-3 gap-2 mb-6 aspect-square">
                    {photoGrid.map((imgSrc, i) => (
                         <button
                            key={i}
                            onClick={() => handlePhotoClick(i)}
                            disabled={!isEditing}
                            className={`relative group bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center transition-colors
                                ${isEditing ? 'cursor-pointer hover:border-pink-500' : ''}
                                ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
                         >
                            {imgSrc ? (
                                <img src={imgSrc} alt={`profile-pic-${i}`} className="w-full h-full object-cover rounded-lg"/>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            )}
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                            )}
                         </button>
                    ))}
                </div>
                
                 <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 mb-6">
                    {isEditing ? (
                        <div className="flex items-center space-x-2 mb-4">
                           <input type="text" name="name" value={user.name} onChange={handleInputChange} placeholder="Name" className="bg-transparent border-b-2 border-white/50 focus:outline-none text-2xl font-bold w-full"/>
                           <input type="number" name="age" value={user.age} onChange={handleInputChange} className="w-20 bg-transparent border-b-2 border-white/50 focus:outline-none text-2xl font-bold"/>
                        </div>
                     ) : (
                        <h1 className="text-3xl font-bold text-shadow mb-4">{user.name}, {user.age}</h1>
                     )}

                    <div className="flex justify-between items-center mb-2">
                         <h2 className="font-bold text-lg">Bio</h2>
                         {isEditing && (
                            <button onClick={handleEnhanceBio} disabled={!isPremium || isEnhancing || !user.bio} className="flex items-center gap-1 text-sm text-purple-300 disabled:opacity-50">
                                <SparklesIcon className="w-4 h-4" />
                                {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
                            </button>
                         )}
                    </div>
                    {isEditing ? (
                        <textarea name="bio" value={user.bio} onChange={handleInputChange} rows={4} className="w-full bg-slate-700/50 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-300"/>
                    ) : (
                        <p className="text-slate-300">{user.bio || "No bio yet."}</p>
                    )}
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 mb-6">
                     <h2 className="font-bold text-lg mb-2">Account</h2>
                     <div className="space-y-2 text-sm">
                        <p><span className="font-semibold text-slate-400">Email:</span> {user.email}</p>
                        {isEditing ? (
                             <div className="flex items-center gap-2">
                                <label className="font-semibold text-slate-400">Phone:</label>
                                <input type="tel" name="phone" value={user.phone || ''} onChange={handleInputChange} placeholder="123-456-7890" className="w-full bg-slate-700/50 rounded-lg p-1 px-2 focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-300"/>
                            </div>
                        ) : (
                             <p><span className="font-semibold text-slate-400">Phone:</span> {user.phone || 'Not set'}</p>
                        )}
                     </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 mb-6">
                    <h2 className="font-bold text-lg mb-2">Interests</h2>
                    {isEditing ? (
                         <input type="text" value={user.interests.join(', ')} onChange={handleInterestsChange} placeholder="Hiking, Painting, Music..." className="w-full bg-slate-700/50 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-300"/>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {user.interests.map(interest => (
                                <span key={interest} className="bg-white/10 text-slate-300 text-sm font-semibold px-3 py-1 rounded-full">{interest}</span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 mb-6">
                    <h2 className="font-bold text-lg mb-4">Personalize Background</h2>
                    <div className="space-y-4">
                        <div className="relative">
                            <p className="text-sm font-semibold mb-2">Generate with AI ✨</p>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="e.g., cyberpunk city, serene forest"
                                    disabled={!isPremium || isGeneratingBg}
                                    className="flex-grow bg-slate-700/50 rounded-lg p-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-300 disabled:opacity-50"
                                />
                                <button onClick={handleGenerateBg} disabled={!isPremium || isGeneratingBg || !aiPrompt} className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-purple-500 transition-all duration-300 disabled:opacity-50">
                                    {isGeneratingBg ? '...' : 'Create'}
                                </button>
                            </div>
                             {!isPremium && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center cursor-pointer" onClick={onPremiumClick}><span className="text-xs font-bold bg-yellow-400 text-black px-2 py-0.5 rounded-full">PREMIUM</span></div>}
                        </div>

                        <div>
                            <p className="text-sm font-semibold mb-2">Upload your own</p>
                            <input
                                type="file"
                                ref={bgFileInputRef}
                                onChange={handleBgFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <button onClick={() => bgFileInputRef.current?.click()} className="w-full text-center bg-slate-700/50 hover:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-300">
                                Choose a Photo
                            </button>
                        </div>

                        {user.background && (
                            <div>
                                <p className="text-sm font-semibold mb-2">Or go back to basics</p>
                                <button onClick={handleResetBackground} className="w-full text-center bg-red-500/20 hover:bg-red-500/40 text-red-300 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-300">
                                    Reset to Default Gradient
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <button onClick={() => { handleSave(); setEditSaveGradient(getRandomGradient()); }} className={`w-full bg-gradient-to-r ${editSaveGradient} text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-emerald-500/50 transform hover:-translate-y-1 transition-all duration-300 mb-4`}>
                        Save Changes
                    </button>
                ) : (
                    <button onClick={() => { setIsEditing(true); setEditSaveGradient(getRandomGradient()); }} className={`w-full bg-gradient-to-r ${editSaveGradient} text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-cyan-500/50 transform hover:-translate-y-1 transition-all duration-300 mb-4`}>
                        Edit Profile
                    </button>
                )}

                <button 
                    onClick={() => { logout(); setLogoutGradient(getRandomGradient()); }}
                    className={`w-full bg-gradient-to-r ${logoutGradient} text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-orange-500/50 transition-all duration-300`}
                >
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default ProfileScreen;
