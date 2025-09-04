import React from 'react';

interface MapProps {
  address?: string;
  className?: string;
  height?: string;
  lat?: number;
  lng?: number;
  zoom?: number;
}

const Map: React.FC<MapProps> = ({
  address = "D 14 15 INDUSTRIAL AREA,UPSIDC FIROZABAD-283203 UP INDIA",
  className = '',
  height = 'h-64',
  lat = 27.1519, // Approximate coordinates for Firozabad, UP
  lng = 78.3957,
  zoom = 15
}) => {
  // Encode the address for Google Maps
  const encodedAddress = encodeURIComponent(address);
  
  // Google Maps search with marker and specific location
  const searchMapSrc = `https://www.google.com/maps?q=${encodedAddress}&t=m&z=${zoom}&output=embed&iwloc=near&ll=${lat},${lng}`;

  const handleOpenInMaps = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}&center=${lat},${lng}&zoom=${zoom}`;
    window.open(mapsUrl, '_blank');
  };

  const handleGetDirections = () => {
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(directionsUrl, '_blank');
  };

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${height} ${className}`}>
      {/* Map iframe */}
      <iframe
        src={searchMapSrc}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="AKSHAR AYURVED Location"
        className="absolute inset-0"
      />
      
      {/* Custom Marker at specific coordinates */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Center marker - positioned at map center */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer"
          style={{
            left: '50%',
            top: '50%',
            zIndex: 10
          }}
          onClick={() => handleOpenInMaps()}
        >
          {/* House Icon Marker */}
          <div className="relative group">
            <div className="w-10 h-10 bg-green-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center hover:bg-green-700 transition-colors">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
            {/* Marker pulse animation */}
            <div className="absolute inset-0 w-10 h-10 bg-green-600 rounded-full animate-ping opacity-75"></div>
            
            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                <div className="font-semibold">AKSHAR AYURVED</div>
                <div className="text-gray-300 text-xs">Click to open in Maps</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
          
          {/* Location label */}
          <div className="mt-2 bg-white bg-opacity-95 rounded-lg px-3 py-2 shadow-lg text-sm font-semibold text-gray-800 whitespace-nowrap border border-gray-200">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>AKSHAR AYURVED</span>
            </div>
          </div>
        </div>
        
        {/* Floating marker indicator */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg z-20 pointer-events-none">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="text-sm font-medium">📍 AKSHAR AYURVED Location</span>
          </div>
        </div>
      </div>
      
      {/* Overlay with address info */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg max-w-xs">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">AKSHAR AYURVED</h4>
            <p className="text-xs text-gray-600 mt-1">{address}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <button
          onClick={handleGetDirections}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
          </svg>
          <span>Directions</span>
        </button>
        <button
          onClick={handleOpenInMaps}
          className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-lg"
        >
          Open in Maps
        </button>
      </div>

      {/* Loading fallback */}
      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center" style={{ zIndex: -1 }}>
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
          </svg>
          <p className="text-gray-500 text-sm">Loading Map...</p>
        </div>
      </div>
    </div>
  );
};

export default Map;
