import React, { useState, useEffect } from 'react';
import { Search, X, Locate } from 'lucide-react';
import useStore from '../store/store';

const CitySelector = ({ isOpen, onClose }) => {
  const { selectedCity, setSelectedCity } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [filteredCities, setFilteredCities] = useState(popularCities);
  const apiKey = '54e8af0c2b984e31a544797ec8957654'; // Replace with your actual API key

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = popularCities.filter(city =>
      city.name.toLowerCase().includes(query.toLowerCase()) ||
      city.country.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCities(filtered);

    if (query.length > 2) {
      fetchAutocomplete(query);
    } else {
      setAutocompleteResults([]);
    }
  };

  const fetchAutocomplete = async (query) => {
    try {
      const apiUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&format=json&apiKey=${apiKey}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAutocompleteResults(data.results);
    } catch (error) {
      console.error("Error fetching autocomplete:", error);
      setAutocompleteResults([]); // Clear results on error
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity({ name: city.city, country: city.country });
    setSearchQuery('');
    setAutocompleteResults([]);
    onClose();
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Geolocation success, use coordinates to set city (Jakarta fallback)
          setSelectedCity({ name: 'Jakarta', country: 'Indonesia' });
          onClose();
        },
        (error) => {
          // Geolocation error, fallback to Jakarta
          console.error("Geolocation error:", error);
          setSelectedCity({ name: 'Jakarta', country: 'Indonesia' });
          onClose();
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      // Geolocation not supported, fallback to Jakarta
      setSelectedCity({ name: 'Jakarta', country: 'Indonesia' });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-end justify-center">
      <div className="bg-white rounded-t-3xl w-full max-w-md p-6 animate-slide-up" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Pilih Kota</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="relative mb-6">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kota..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
          />
          {autocompleteResults.length > 0 && (
            <ul className="absolute mt-2 w-full bg-white border rounded-md shadow-md z-10 overflow-hidden">
              {autocompleteResults.map((result, index) => (
                <li
                  key={index}
                  onClick={() => handleCitySelect({ city: result.city, country: result.country })}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {result.city} ({result.state})
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={handleGeolocation}
          className="flex items-center justify-center w-full py-3 mb-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
        >
          <Locate size={20} className="mr-2" />
          Gunakan Lokasi Saat Ini
        </button>
        <p className="text-center text-sm text-gray-500 mb-4">Kota saat ini: {selectedCity.name}, {selectedCity.country}</p>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Kota Populer</h3>
          <div className="grid grid-cols-2 gap-3">
            {filteredCities.map((city) => (
              <button
                key={city.id}
                onClick={() => handleCitySelect(city)}
                className="flex flex-col items-start p-3 border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <span className="text-gray-800 font-medium">{city.name}</span>
                <span className="text-sm text-gray-500">{city.country}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const popularCities = [
  { id: 1, name: 'Jakarta', country: 'Indonesia' },
  { id: 2, name: 'Bogor', country: 'Indonesia' },
  { id: 3, name: 'Depok', country: 'Indonesia' },
  { id: 4, name: 'Tangerang', country: 'Indonesia' },
  { id: 5, name: 'Bekasi', country: 'Indonesia' },
  { id: 6, name: 'Medan', country: 'Indonesia' },
  { id: 7, name: 'Surabaya', country: 'Indonesia' },
  { id: 8, name: 'Yogyakarta', country: 'Indonesia' },
  { id: 9, name: 'Semarang', country: 'Indonesia' },
  { id: 10, name: 'Makassar', country: 'Indonesia' },
  { id: 11, name: 'Mekkah', country: 'Saudi Arabia' },
  { id: 12, name: 'Madinah', country: 'Saudi Arabia' },
  { id: 13, name: 'Muscat', country: 'Oman' },
  { id: 14, name: 'Istanbul', country: 'Turkey' },
];

export default CitySelector;
