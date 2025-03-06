import React, { useState } from 'react';
    import { ChevronLeft, Sunrise, Sunset } from 'lucide-react';
    import { useNavigate } from 'react-router-dom';

    const AzkarScreen = () => {
      const navigate = useNavigate();
      const [isMorning, setIsMorning] = useState(true);

      const handleBack = () => {
        const homeMenu = document.querySelector('.nav-item[href="/"]');
        if (homeMenu) {
          homeMenu.click();
        } else {
          navigate('/');
        }
      };

      const toggleTime = () => {
        setIsMorning(!isMorning);
      };

      return (
        <div className="quran-screen p-4">
          <div className="surah-detail-header">
            <button onClick={handleBack} className="back-button">
              <ChevronLeft size={24} />
            </button>
            <div className="surah-info">
              <h2 className="text-lg font-semibold text-center">{isMorning ? 'Dzikir Pagi' : 'Dzikir Petang'}</h2>
            </div>
            <button onClick={toggleTime} className="p-2 rounded-full hover:bg-gray-100">
              {isMorning ? <Sunset size={20} /> : <Sunrise size={20} />}
            </button>
          </div>
          <p>{isMorning ? 'Morning azkar' : 'Evening azkar'}</p>
        </div>
      );
    };

    export default AzkarScreen;
