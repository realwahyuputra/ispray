import React, { useState } from 'react';
    import { Search, X } from 'lucide-react';
    import useStore from '../store/store';

    const popularCities = [
      { id: 1, name: 'Jakarta', country: 'Indonesia' },
      { id: 2, name: 'Surabaya', country: 'Indonesia' },
      { id: 3, name: 'Bandung', country: 'Indonesia' },
      { id: 4, name: 'Medan', country: 'Indonesia' },
      { id: 5, name: 'Dubai', country: 'UAE' },
      { id: 6, name: 'Mecca', country: 'Saudi Arabia' },
      { id: 7, name: 'Medina', country: 'Saudi Arabia' },
      { id: 8, name: 'Istanbul', country: 'Turkey' },
    ];

    const CitySelector = ({ isOpen, onClose }) => {
      const { selectedCity, setSelectedCity } = useStore();
      const [searchQuery, setSearchQuery] = useState('');
      const [filteredCities, setFilteredCities] = useState(popularCities);

      const handleSearch = (query) => {
        setSearchQuery(query);
        const filtered = popularCities.filter(city =>
          city.name.toLowerCase().includes(query.toLowerCase()) ||
          city.country.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredCities(filtered);
      };

      const handleCitySelect = (city) => {
        setSelectedCity(city);
        onClose();
      };

      if (!isOpen) return null;

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 animate-slide-up">
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
            </div>

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

    export default CitySelector;
