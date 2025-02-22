import React, { useState, useEffect } from 'react';
    import * as Quran from 'quran-pack';
    import { useNavigate, Link } from 'react-router-dom';
    import { Loader, Search, Bookmark } from 'lucide-react';
    import { ChevronLeft } from 'lucide-react';

    const QuranScreen = () => {
      const [surahList, setSurahList] = useState([]);
      const [loading, setLoading] = useState(true);
      const [searchQuery, setSearchQuery] = useState('');
      const [filteredSurahList, setFilteredSurahList] = useState([]);
      const navigate = useNavigate();

      useEffect(() => {
        setLoading(true);
        setSurahList(Quran.surahList);
        setFilteredSurahList(Quran.surahList);
        setLoading(false);
      }, []);

      useEffect(() => {
        const filtered = surahList.filter(surah =>
          surah.name_latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
          surah.name_id.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredSurahList(filtered);
      }, [searchQuery, surahList]);

      const handleSurahClick = (surahNumber) => {
        navigate(`/quran/${surahNumber}`);
      };

      const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
      };

      const handleBack = () => {
        navigate('/'); // Navigate to home
      };

      if (loading) {
        return (
          <div className="flex justify-center items-center p-6">
            <Loader className="animate-spin" size={30} />
          </div>
        );
      }

      return (
        <div className="quran-screen">
          <div className="surah-detail-header">
            <button onClick={handleBack} className="back-button">
              <ChevronLeft size={24} />
            </button>
            <div className="surah-info">
              <h2 className="text-lg font-semibold text-center">Al Quran 30 Juz</h2>
            </div>
            <Link to="/bookmarked" className="mr-4">
              <Bookmark size={24} />
            </Link>
          </div>
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Cari Surah..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <ul className="surah-list">
            {filteredSurahList.map(surah => (
              <li
                key={surah.number}
                className="surah-item"
                onClick={() => handleSurahClick(surah.number)}
              >
                <div className="surah-card">
                  <div className="surah-details-top">
                    <span>{surah.number_of_verse} Ayat</span>
                  </div>
                  <div className="surah-info">
                    <span className="surah-name-arabic">{surah.name}</span>
                    <span className="surah-name-latin">{surah.name_latin}</span>
                  </div>
                  <div className="surah-details">
                    <span className={`surah-details-item surah-category ${surah.category === 'Makkiyah' ? 'makkiyah' : 'madaniyah'}`}>
                      {surah.category === 'Makkiyah' ? 'Makkiyah' : 'Madaniyah'}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    };

    export default QuranScreen;
