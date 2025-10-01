import React, { useState, useMemo, useEffect } from 'react';
import { DateIdea, DateCategory, BudgetOption, DressCodeOption, LocalIdea, LocalEvent, DateSuggestion } from '../types';
import { usePremium } from '../contexts/PremiumContext';
import { useAuth } from '../contexts/AuthContext';
import { WEEKLY_CHALLENGES, getRandomGradient, DATE_CATEGORIES, SparklesIcon, CalendarIcon, BUDGET_OPTIONS, DRESS_CODE_OPTIONS } from '../constants';
import { enhanceDescription, generateDateIdea, categorizeDate, getLocalDateIdeas, getLocalEvents, generateDateSuggestions } from '../services/geminiService';
import { MOCK_LOCATIONS } from '../data/mockLocations';

interface CreateDateProps {
    onBack: () => void;
    onPostDate: (newDate: DateIdea) => void;
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
        setIsPosting(true);
        setPostGradient(getRandomGradient());
        try {
            const newDate: DateIdea = {
                id: Date.now(),
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
        } catch (error) {
            console.error("Failed to post date", error);
        } finally {
            setIsPosting(false);
        }
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
                    <span className="text-slate-500 text-sm font-semibold tracking-wider">OR CRAFT YOUR OWN</span>
                    <div className="w-20 h-px bg-slate-700 mx-auto mt-1"></div>
                </div>
                
                 <div className="bg-yellow-400/10 border border-yellow-400/30 p-4 rounded-lg mb-6">
                    <p className="text-sm font-bold text-yellow-300">Weekly Challenge</p>
                    <p className="text-slate-300 text-sm">{currentChallenge}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-4">
                        <h3 className="font-bold text-lg text-slate-300">The Core Idea</h3>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Date Title (e.g., Rooftop Movie Night)" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500" required />
                        <div>
                             <textarea id="description" rows={5} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the date..." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500" required />
                             <button type="button" onClick={isPremium ? handleEnhance : onPremiumClick} disabled={isEnhancing || !description} className="w-full mt-2 flex items-center justify-center space-x-2 bg-slate-700/50 text-slate-300 font-semibold py-2 rounded-lg hover:bg-slate-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                <SparklesIcon className="w-5 h-5 text-purple-400"/>
                                <span>{isEnhancing ? 'Enhancing...' : 'Enhance with AI'}</span>
                                {!isPremium && <span className="text-xs font-bold bg-yellow-400 text-black px-2 py-0.5 rounded-full">PREMIUM</span>}
                             </button>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-4">
                        <h3 className="font-bold text-lg text-slate-300">Logistics</h3>
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="font-semibold">Out-of-Town Date?</span>
                            <div className="relative">
                                <input type="checkbox" className="sr-only" checked={isOutOfTown} onChange={() => setIsOutOfTown(!isOutOfTown)} />
                                <div className={`block w-12 h-6 rounded-full transition-colors ${isOutOfTown ? 'bg-pink-500' : 'bg-slate-700'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isOutOfTown ? 'translate-x-6' : ''}`}></div>
                            </div>
                        </label>
                        <div className="relative">
                            <input type="text" value={locationQuery} onChange={handleLocationInputChange} placeholder={isOutOfTown ? "City & State (e.g. Miami, FL)" : "Location (e.g., Central Park, NYC)"} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500" />
                            {locationSuggestions.length > 0 && (
                                <ul className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
                                    {locationSuggestions.map((suggestion, index) => (
                                        <li key={index} onClick={() => handleLocationSuggestionClick(suggestion)} className="px-4 py-2 cursor-pointer hover:bg-slate-700 transition-colors text-sm">{suggestion}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="relative">
                            <input type="text" onFocus={() => setShowCalendar(true)} onBlur={() => setTimeout(() => setShowCalendar(false), 150)} value={date ? date.toLocaleDateString() : ''} placeholder="Select a date (Optional)" readOnly className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer" />
                            {showCalendar && <Calendar />}
                        </div>
                    </div>
                    
                    {/* Local Inspiration Section */}
                     {(localIdeas.length > 0 || localEvents.length > 0 || isLoadingIdeas || isLoadingEvents) && isPremium && (
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-4 animate-fade-in">
                            <h3 className="font-bold text-lg text-slate-300 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-cyan-400"/> Local Inspiration</h3>
                            {isLoadingIdeas ? <p className="text-sm text-slate-400">Finding local spots...</p> : localIdeas.map((idea, i) => (
                                <button type="button" key={i} onClick={() => {setTitle(idea.name); setDescription(idea.idea);}} className="w-full text-left p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                                    <p className="font-bold text-cyan-300">{idea.name}</p>
                                    <p className="text-xs text-slate-300">{idea.idea}</p>
                                </button>
                            ))}
                             {date && <div className="border-t border-slate-700/50 my-2"></div>}
                             {isLoadingEvents ? <p className="text-sm text-slate-400">Looking for local events...</p> : localEvents.map((event, i) => (
                                <button type="button" key={i} onClick={() => {setTitle(event.eventName); setDescription(event.description);}} className="w-full text-left p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                                    <p className="font-bold text-cyan-300">{event.eventName}</p>
                                    <p className="text-xs text-slate-300">{event.description}</p>
                                </button>
                            ))}
                        </div>
                    )}


                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-4">
                        <h3 className="font-bold text-lg text-slate-300">The Vibe</h3>
                        <div className="flex items-center space-x-2">
                            <select value={category} onChange={e => setCategory(e.target.value as DateCategory)} className="flex-grow w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500">
                                <option value={DateCategory.Uncategorized} disabled>Select a category...</option>
                                {DATE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                             <button type="button" onClick={isPremium ? handleAutoCategorize : onPremiumClick} disabled={isCategorizing || !title || !description} className="flex-shrink-0 flex items-center justify-center space-x-2 bg-slate-700/50 text-slate-300 font-semibold p-3 rounded-lg hover:bg-slate-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" title="Auto-categorize with AI">
                                <SparklesIcon className="w-5 h-5 text-purple-400"/>
                                 {!isPremium && <span className="sr-only">Premium Feature</span>}
                             </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <select value={budget} onChange={e => setBudget(e.target.value as BudgetOption)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500">
                                <option value="Not Set">Budget (Optional)...</option>
                                {BUDGET_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            <select value={dressCode} onChange={e => setDressCode(e.target.value as DressCodeOption)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500">
                                <option value="Not Set">Dress Code (Optional)...</option>
                                {DRESS_CODE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <button type="submit" disabled={isPosting || !title || !description || category === DateCategory.Uncategorized} className={`w-full bg-gradient-to-r ${postGradient} text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-orange-500/50 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-60 disabled:transform-none disabled:shadow-none`}>
                        {isPosting ? 'Posting...' : 'Post Your Date'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateDate;