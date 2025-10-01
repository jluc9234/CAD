import React, { useState, useEffect, useRef } from 'react';
import { MapPinIcon, getRandomGradient } from '../constants';

// Since we are loading Mapbox from a CDN, we need to declare it to TypeScript
declare const mapboxgl: any;

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: string;
}

const DirectionsModal: React.FC<DirectionsModalProps> = ({ isOpen, onClose, location }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [iconGradient] = useState(() => getRandomGradient());
  const [titleGradient] = useState(() => getRandomGradient());
  const [buttonGradient, setButtonGradient] = useState(() => getRandomGradient());

  useEffect(() => {
    if (isOpen && mapContainerRef.current) {
        setIsLoading(true);
        setError(null);

        const fetchCoordinatesAndInitMap = async () => {
            try {
                if (!process.env.MAPBOX_ACCESS_TOKEN) {
                    throw new Error("Mapbox token is not configured.");
                }
                const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`;
                const response = await fetch(geocodingUrl);
                const data = await response.json();

                if (data.features && data.features.length > 0) {
                    const coordinates = data.features[0].center;
                    
                    mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;
                    
                    // Cleanup previous map instance if it exists
                    if (mapRef.current) {
                        mapRef.current.remove();
                    }

                    const map = new mapboxgl.Map({
                        container: mapContainerRef.current!,
                        style: 'mapbox://styles/mapbox/dark-v11', // Dark theme to match the app
                        center: coordinates,
                        zoom: 14
                    });
                    
                    map.on('load', () => {
                        new mapboxgl.Marker()
                            .setLngLat(coordinates)
                            .addTo(map);
                        setIsLoading(false);
                    });

                    mapRef.current = map;

                } else {
                    throw new Error("Location not found.");
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Could not load map.");
                setIsLoading(false);
            }
        };

        fetchCoordinatesAndInitMap();
    }

    return () => {
        // Cleanup map instance on component unmount or when modal is closed
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    }
  }, [isOpen, location]);

  const handleOpenInMaps = () => {
    // This creates a link that should open in the user's default maps app
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex justify-center items-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-lg w-full text-white transform scale-95 hover:scale-100 transition-transform duration-300 text-center" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-center mb-4">
            <div className={`flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br ${iconGradient} shadow-[0_0_20px_theme(colors.blue.500)] mr-4`}>
                <MapPinIcon className="h-6 w-6 text-white"/>
            </div>
            <div>
                 <h2 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${titleGradient} text-left`}>
                    Location
                 </h2>
                 <p className="text-slate-300 text-left">{location}</p>
            </div>
        </div>
        
        <div className="relative w-full h-64 md:h-80 bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-4 border-t-pink-500 border-slate-600 rounded-full animate-spin"></div>
                    <p className="text-slate-400 mt-2 text-sm">Loading map...</p>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                     <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}
            <div ref={mapContainerRef} className="absolute inset-0" />
        </div>

        <button 
          onClick={handleOpenInMaps}
          className={`w-full mt-6 bg-gradient-to-r ${buttonGradient} text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-cyan-400/50 transform hover:-translate-y-1 transition-all duration-300`}
        >
          Open in Maps App
        </button>

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default DirectionsModal;
