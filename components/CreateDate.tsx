import React, { useState, useMemo, useEffect } from 'react';
import { DateIdea, DateCategory, BudgetOption, DressCodeOption, LocalIdea, LocalEvent, DateSuggestion } from '../types';
import { usePremium } from '../contexts/PremiumContext';
import { useAuth } from '../contexts/AuthContext';
import { WEEKLY_CHALLENGES, getRandomGradient, DATE_CATEGORIES, SparklesIcon, CalendarIcon, BUDGET_OPTIONS, DRESS_CODE_OPTIONS } from '../constants';
import { enhanceDescription, generateDateIdea, categorizeDate, getLocalDateIdeas, getLocalEvents, generateDateSuggestions } from '../services/geminiService';
import { MOCK_LOCATIONS } from '../data/mockLocations';

interface CreateDateProps {
    onBack: () => void;
    onPostDate: (newDate: Omit<DateIdea, 'id'>) => void;
    onPremiumClick: () => void;
}

const CreateDate: React.FC<CreateDateProps> = ({ onBack, onPostDate, onPremiumClick }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState<DateCategory>(DateCategory.Uncategorized);
    const [aiKeywords, setAiKeywords] = useState('');
    
    // State for advanced options & location autocomplete
    const [isOutOfTown, setIsOutOfTown] = useState(false);
    const [date, setDate] = useState<Date | null>(null);
    const [budget, setBudget] = useState<BudgetOption>('Not Set');
    const [dressCode, setDressCode] = useState<DressCodeOption>('Not Set');
    const [showCalendar, setShowCalendar] = useState(false);
    const [locationQuery, setLocationQuery] = useState('');
    const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
    
    // State for AI-powered local suggestions
    const [localIdeas, setLocalIdeas] = useState<LocalIdea[]>([]);
    const [localEvents, setLocalEvents] = useState<LocalEvent[]>([]);
    const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    
    // State for AI date suggestions from details
    const [dateSuggestions, setDateSuggestions] = useState<DateSuggestion[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [isCategorizing, setIsCategorizing] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    const { isPremium } = usePremium();
    const { currentUser } = useAuth();

    const [postGradient, setPostGradient] = useState(() => getRandomGradient());

    const currentChallenge = WEEKLY_CHALLENGES[new Date().getDay()];
    
    // Fetch local ideas when location is set
    useEffect(() => {
        if (location && isPremium) {
            const fetchIdeas = async () => {
                setIsLoadingIdeas(true);
                setLocalIdeas([]);
                const ideas = await getLocalDateIdeas(location);
                setLocalIdeas(ideas);
                setIsLoadingIdeas(false);
            };
            fetchIdeas();
        } else {
            setLocalIdeas([]);
        }
    }, [location, isPremium]);

    // Fetch local events when location and date are set
    useEffect(() => {
        if (location && date && isPremium) {
            const fetchEvents = async () => {
                setIsLoadingEvents(true);
                setLocalEvents([]);
                const events = await getLocalEvents(location, date.toISOString());
                setLocalEvents(events);
                setIsLoadingEvents(false);
            };
            fetchEvents();
        } else {
            setLocalEvents([]);
        }
    }, [location, date, isPremium]);


    const handleEnhance = async () => {
        if (!description || !isPremium) return;
        setIsEnhancing(true);
        try {
            const enhanced = await enhanceDescription(description);
            setDescription(enhanced);
        } catch (error) {
            console.error("Failed to enhance description", error);
        } finally {
            setIsEnhancing(false);
        }
    };
    
    const handleGenerate = async () => {
        if (!aiKeywords || !isPremium) return;
        setIsGenerating(true);
        try {
            const { title: newTitle, description: newDescription, location: newLocation } = await generateDateIdea(aiKeywords);
            setTitle(newTitle);
            setDescription(newDescription);
            if (newLocation) {
                setLocation(newLocation);
                setLocationQuery(newLocation);
            }
        } catch (error) {
            console.error("Failed to generate date", error);
        } finally {
            setIsGenerating(false);
        }
    }

    const handleSuggest = async () => {
        if (!isPremium) return;
        setIsSuggesting(true);
        setDateSuggestions([]);
        try {
            const suggestions = await generateDateSuggestions({
                title: title,
                location: location,
                date: date?.toISOString(),
                category: category,
                budget: budget,
                dressCode: dressCode,
            });
            setDateSuggestions(suggestions);
        } catch (error) {
            console.error("Failed to suggest dates", error);
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleAutoCategorize = async () => {
        if (!title || !description || !isPremium) return;
        setIsCategorizing(true);
        try {
            const newCategory = await categorizeDate(title, description);
            setCategory(newCategory);
        } catch (error) {
            console.error("Failed to categorize date", error);
        } finally {
            setIsCategorizing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!title || !description || !currentUser) {
            alert("Please fill out the title and description.");
            return;
        };
        if (category === DateCategory.Uncategorized) {
            alert("Please select a category for your date idea.");
            return;
        }
        if (isOutOfTown && !isPremium) {
            onPremiumClick();
            return;
        }
        setIsPosting(true);
        setPostGradient(getRandomGradient());
        
        // The ID will be generated by the backend (apiService in our case)
        const newDate: Omit<DateIdea, 'id'> = {
            title,
            description,
            category,
            authorId: currentUser.id,
            authorName: currentUser.name,
            authorImage: currentUser.images[0],
            location: location || undefined,
            isOutOfTown,
            date: date ? date.toISOString() : undefined,
            budget: budget !== 'Not Set' ? budget : undefined,
            dressCode: dressCode !== 'Not Set' ? dressCode : undefined,
        };
        onPostDate(newDate);
        // The isPosting state will be managed by the parent component after the API call finishes.
    };
    
    const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setLocationQuery(query);
        setLocation(query); // Update location in real-time for non-selected entries

        if (query.length > 2) {
            const filteredLocations = MOCK_LOCATIONS.filter(loc => 
                loc.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5); // Show top 5 matches
            setLocationSuggestions(filteredLocations);
        } else {
            setLocationSuggestions([]);
        }
    };
    
    const handleLocationSuggestionClick = (suggestion: string) => {
        setLocationQuery(suggestion);
        setLocation(suggestion);
        setLocationSuggestions([]);
    };

    const Calendar = () => {
        const [currentMonth, setCurrentMonth] = useState(date || new Date());

        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const startDate = new Date(startOfMonth);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        const endDate = new Date(endOfMonth);
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

        const datesArray = [];
        let currentDate = new Date(startDate);
        while(currentDate <= endDate) {
            datesArray.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const today = new Date();
        today.setHours(0,0,0,0);

        return (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mt-2 absolute z-10 w-full shadow-2xl">
                 <div className="flex justify-between items-center mb-2">
                    <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>&larr;</button>
                    <div className="font-bold">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                    <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>&rarr;</button>
                 </div>
                 <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
                 </div>
                 <div className="grid grid-cols-7 gap-1">
                    {datesArray.map((d, i) => {
                        const isCurrentMonth = d.getMonth() === currentMonth.getMonth();
                        const isSelected = date && d.getTime() === date.getTime();
                        const isPast = d < today;
                        return (
                            <button 
                                type="button" 
                                key={i} 
                                disabled={isPast}
                                onClick={() => {
                                    setDate(d);
                                    setShowCalendar(false);
                                }}
                                className={`w-full aspect-square flex items-center justify-center rounded-full transition-colors ${
                                    isSelected ? 'bg-pink-500 text-white' :
                                    isCurrentMonth ? 'text-white hover:bg-slate-700' : 'text-slate-500'
                                } ${isPast ? 'opacity-30 cursor-not-allowed' : ''}`}
                            >
                                {d.getDate()}
                            </button>
                        )
                    })}
                 </div>
            </div>
        )
    };
    
    const AiPowerUp = ({ title, children, onClick }: { title: string, children: React.ReactNode, onClick?: () => void }) => (
        <div className={`relative bg-slate-800/70 border border-slate-700 p-4 rounded-lg ${!isPremium ? 'cursor-pointer' : ''}`} onClick={!isPremium ? onClick : undefined}>
            <h3 className="font-bold text-white flex items-center gap-2 mb-3">
                <SparklesIcon className="w-5 h-5 text-purple-400"/>
                {title}
                {!isPremium && <span className="text-xs font-bold bg-yellow-400 text-black px-2 py-0.5 rounded-full">PREMIUM</span>}
            </h3>
            {children}
            {!isPremium && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center"></div>}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-900 z-40 p-4 pt-20 text-white overflow-y-auto scrollbar-hide">
            <button onClick={onBack} className="absolute top-6 left-4 text-slate-300 z-10">&larr; Back to Dates</button>
            <div className="max-w-lg mx-auto pb-8">
                <div className="text-center mb-8">
                    <CalendarIcon className="w-12 h-12 mx-auto bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-xl text-white shadow-lg mb-2"/>
                    <h1 className="text-3xl font-bold">Create-A-Date</h1>
                    <p className="text-slate-400">Design your perfect date and share it with the world.</p>
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-6 shadow-inner space-y-4">
                    <h2 className="text-xl font-bold text-center mb-2 text-slate-300 tracking-wide">✨ AI Magic Wand ✨</h2>
                    {/* FIX: The AiPowerUp component was previously self-closed, which is invalid as it requires children. It is now correctly wrapping its content. */}
                    <AiPowerUp title="Generate Idea From Keywords" onClick={onPremiumClick}>
                         <div className="flex items-center space-x-2">
                             <input 
                                 type="text" 
                                 value={aiKeywords}
                                 onChange={e => setAiKeywords(e.target.value)}
                                 placeholder="e.g., cozy, rainy day, books"
                                 className="flex-grow bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                 disabled={!isPremium}
                             />
                             <button 
                                 type="button" 
                                 onClick={handleGenerate}
                                 disabled={isGenerating || !aiKeywords || !isPremium}
                                 className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-purple-500 transition-all duration-300 disabled:opacity-50 text-sm"
                             >
                                 {isGenerating ? '...' : 'Go'}
                             </button>
                         </div>
                    </AiPowerUp>
                    {/* FIX: The AiPowerUp component was previously self-closed, which is invalid as it requires children. It is now correctly wrapping its content. */}
                    <AiPowerUp title="Suggest Dates From Details" onClick={onPremiumClick}>
                        <div className="space-y-3">
                            <p className="text-xs text-slate-400">Fill in any details below (title, location, date, etc.) and let AI suggest tailored ideas for you!</p>
                             <button 
                                 type="button" 
                                 onClick={handleSuggest}
                                 disabled={isSuggesting || !isPremium}
                                 className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-purple-500 transition-all duration-300 disabled:opacity-50 text-sm"
                             >
                                 {isSuggesting ? 'Thinking...' : 'Get Suggestions'}
                             </button>
                             {isSuggesting && <p className="text-sm text-center text-slate-400">Generating ideas...</p>}
                             {dateSuggestions.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-slate-700/50">
                                    {dateSuggestions.map((suggestion, i) => (
                                        <button type="button" key={i} onClick={() => {setTitle(suggestion.title); setDescription(suggestion.description);}} className="w-full text-left p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                                            <p className="font-bold text-purple-300">{suggestion.title}</p>
                                            <p className="text-xs text-slate-300">{suggestion.description}</p>
                                        </button>
                                    ))}
                                </div>
                             )}
                        </div>
                    </AiPowerUp>
                </div>

                <div className="text-center my-6">
                    <span className="text-slate-500 text-sm font-semibold tracking-wider">OR CREATE MANUALLY</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 shadow-lg">
                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold mb-1 text-slate-300">Title*</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"/>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="description" className="block text-sm font-semibold text-slate-300">Description*</label>
                            <button type="button" onClick={isPremium ? handleEnhance : onPremiumClick} disabled={isEnhancing || !description} className="text-xs flex items-center gap-1 text-purple-400 disabled:opacity-50">
                                <SparklesIcon className="w-4 h-4" />
                                {isEnhancing ? '...' : 'Enhance'}
                                {!isPremium && <span className="text-xs font-bold bg-yellow-400 text-black px-1.5 py-0.5 rounded-full ml-1">PREMIUM</span>}
                            </button>
                        </div>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"/>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="category" className="block text-sm font-semibold text-slate-300">Category*</label>
                            <button type="button" onClick={isPremium ? handleAutoCategorize : onPremiumClick} disabled={isCategorizing || !title || !description} className="text-xs flex items-center gap-1 text-purple-400 disabled:opacity-50">
                                <SparklesIcon className="w-4 h-4" />
                                {isCategorizing ? '...' : 'Auto'}
                                 {!isPremium && <span className="text-xs font-bold bg-yellow-400 text-black px-1.5 py-0.5 rounded-full ml-1">PREMIUM</span>}
                            </button>
                        </div>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value as DateCategory)} required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500">
                            <option value={DateCategory.Uncategorized} disabled>Select a category</option>
                            {DATE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <h3 className="text-lg font-bold pt-4 border-t border-slate-700/50 text-slate-300 !mt-6">Optional Details</h3>

                    <div className="relative">
                        <label htmlFor="location" className="block text-sm font-semibold mb-1 text-slate-300">Location</label>
                        <input type="text" id="location" value={locationQuery} onChange={handleLocationInputChange} placeholder="e.g., Central Park, NYC" autoComplete="off" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"/>
                        {locationSuggestions.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
                                {locationSuggestions.map(suggestion => (
                                    <li key={suggestion}>
                                        <button type="button" onClick={() => handleLocationSuggestionClick(suggestion)} className="block w-full text-left px-3 py-2 hover:bg-slate-700">{suggestion}</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    
                    {isLoadingIdeas && <p className="text-xs text-center text-slate-400">Looking for local ideas for {location}...</p>}
                    {localIdeas.length > 0 && (
                        <div>
                            <div className="space-y-2">
                                {localIdeas.map((idea, i) => (
                                    <button type="button" key={i} onClick={() => {setTitle(idea.name); setDescription(idea.idea);}} className="w-full text-left p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                                        <p className="font-bold text-cyan-300">{idea.name}</p>
                                        <p className="text-xs text-slate-300">{idea.idea}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className={`relative rounded-lg p-2 -m-2 ${!isPremium ? 'cursor-pointer hover:bg-slate-700/50 transition-colors' : ''}`} onClick={!isPremium ? onPremiumClick : undefined}>
                        <div className={`flex items-center ${!isPremium ? 'opacity-50' : ''}`}>
                            <input 
                                type="checkbox" 
                                id="isOutOfTown" 
                                checked={isOutOfTown} 
                                onChange={e => setIsOutOfTown(e.target.checked)} 
                                disabled={!isPremium}
                                className="h-4 w-4 rounded text-pink-500 bg-slate-700 border-slate-600 focus:ring-pink-500"
                            />
                            <label htmlFor="isOutOfTown" className="ml-2 text-sm text-slate-300">This is an out-of-town date idea</label>
                        </div>
                        {!isPremium && (
                            <div className="absolute inset-0 flex items-center justify-end pr-2 pointer-events-none">
                                <div className="flex items-center gap-1">
                                    <SparklesIcon className="w-4 h-4 text-yellow-300" />
                                    <span className="text-xs font-bold bg-yellow-400 text-black px-2 py-0.5 rounded-full">PREMIUM</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <label className="block text-sm font-semibold mb-1 text-slate-300">Date</label>
                            <button type="button" onClick={() => setShowCalendar(!showCalendar)} className="w-full text-left bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white">
                                {date ? date.toLocaleDateString() : 'Select a date'}
                            </button>
                            {showCalendar && <Calendar />}
                        </div>
                        <div>
                            <label htmlFor="budget" className="block text-sm font-semibold mb-1 text-slate-300">Budget</label>
                            <select id="budget" value={budget} onChange={e => setBudget(e.target.value as BudgetOption)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500">
                                <option>Not Set</option>
                                {BUDGET_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="dressCode" className="block text-sm font-semibold mb-1 text-slate-300">Dress Code</label>
                            <select id="dressCode" value={dressCode} onChange={e => setDressCode(e.target.value as DressCodeOption)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500">
                                <option>Not Set</option>
                                {DRESS_CODE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>

                    {isLoadingEvents && <p className="text-xs text-center text-slate-400">Looking for local events around {date?.toLocaleDateString()}...</p>}
                    {localEvents.length > 0 && (
                        <div>
                            <div className="space-y-2">
                                {localEvents.map((event, i) => (
                                    <button type="button" key={i} onClick={() => {setTitle(event.eventName); setDescription(event.description);}} className="w-full text-left p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                                        <p className="font-bold text-cyan-300">{event.eventName}</p>
                                        <p className="text-xs text-slate-300">{event.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="!mt-8">
                        <button type="submit" disabled={isPosting || !title || !description || category === DateCategory.Uncategorized} className={`w-full bg-gradient-to-r ${postGradient} text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-emerald-500/50 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50`}>
                            {isPosting ? 'Posting...' : 'Post Date Idea'}
                        </button>
                    </div>
                </form>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 my-6 shadow-inner">
                    <h3 className="font-bold text-center text-slate-300">This Week's Challenge</h3>
                    <p className="text-center text-sm text-cyan-300">{currentChallenge}</p>
                </div>
            </div>
        </div>
    );
};

export default CreateDate;