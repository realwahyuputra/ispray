import React, { useState, useEffect, useRef } from 'react';
    import { ChevronLeft, ChevronRight, Settings, X } from 'lucide-react';
    import { useNavigate } from 'react-router-dom';
    import uq from '@umalqura/core';
    import useStore from '../store/store';

    const HijriCalendarScreen = () => {
      const navigate = useNavigate();
      const [selectedDay, setSelectedDay] = useState(new Date());
      const [gregorianDate, setGregorianDate] = useState(new Date());
      const [hijriDate, setHijriDate] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [hijriMonth, setHijriMonth] = useState(() => {
        const today = uq();
        return today.hm; // Set initial month to current Hijri month
      });
      const [hijriYear, setHijriYear] = useState(null);
      const [calendarDays, setCalendarDays] = useState([]);
      const [firstDayOfWeek, setFirstDayOfWeek] = useState(0);
      const [today, setToday] = useState(new Date());
      const [isSettingsOpen, setIsSettingsOpen] = useState(false);
      const { prayerSettings, setPrayerSettings } = useStore();
      const { hijriDateOffset } = prayerSettings;
      const [scrollPosition, setScrollPosition] = useState(0);
      const scrollRef = useRef(null);

      const hijriMonthNames = [
        "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir",
				"Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
				"Ramadan", "Syawal", "Dzulqadah", "Dzulhijjah"
      ];

      useEffect(() => {
        const today = uq();
        setHijriYear(today.hy);
      }, []);

      useEffect(() => {
        if (hijriMonth && hijriYear) {
          generateCalendar(hijriMonth, hijriYear, hijriDateOffset);
        }
      }, [hijriMonth, hijriYear, hijriDateOffset]);

      const handleBack = () => {
        navigate('/');
      };

      const fetchHijriDate = async (gregorianDate) => {
        setLoading(true);
        setError(null);
        try {
          const umalquraDate = uq(gregorianDate);
          setHijriDate(umalquraDate.format('dd/MM/yyyy'));
        } catch (err) {
          setError('Failed to fetch Hijri date');
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        setGregorianDate(new Date());
        if (selectedDay) {
          fetchHijriDate(selectedDay);
        }
      }, [selectedDay]);

      const handleDayClick = (day) => {
        setSelectedDay(day.date);
      };

      const generateCalendar = (month, year, offset) => {
        const calendar = [];
        let umalquraDate = uq(year, month, 1); // Month is 1-indexed in uq

        // Apply offset to the first day of the month
        let gregorianFirstDay = new Date(umalquraDate.date);
        gregorianFirstDay.setDate(gregorianFirstDay.getDate() + offset);

        // Check if gregorianFirstDay is a valid date
        if (isNaN(gregorianFirstDay.getTime())) {
          return;
        }

        umalquraDate = uq(gregorianFirstDay);

        const firstDay = umalquraDate.dayOfWeek;
        const daysInMonth = umalquraDate.daysInMonth;

        // Add empty cells for the days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
          calendar.push(null);
        }

        // Add the days of the month
        for (let i = 1; i <= daysInMonth; i++) {
          const dayDate = uq(year, month, i);
          let gregorianDayDate = new Date(dayDate.date);
          gregorianDayDate.setDate(gregorianDayDate.getDate() + offset);

          // Check if gregorianDayDate is a valid date
          if (isNaN(gregorianDayDate.getTime())) {
            return;
          }

          const offsetDayDate = uq(gregorianDayDate);

          calendar.push({
            date: offsetDayDate.date,
            hijriDay: i,
            hijriMonth: offsetDayDate.hm + 1,
            hijriYear: offsetDayDate.hy
          });
        }

        setCalendarDays(calendar);
        setFirstDayOfWeek(firstDay);
      };

      const goToPreviousMonth = () => {
        let newMonth = hijriMonth - 1;
        let newYear = hijriYear;
        if (newMonth < 1) {
          newMonth = 12;
          newYear--;
        }
        setHijriMonth(newMonth);
        setHijriYear(newYear);
      };

      const goToNextMonth = () => {
        let newMonth = hijriMonth + 1;
        let newYear = hijriYear;
        if (newMonth > 12) {
          newMonth = 1;
          newYear++;
        }
        setHijriMonth(newMonth);
        setHijriYear(newYear);
      };

      const weekdayNames = ["Ahd", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

      const openSettings = () => {
        setIsSettingsOpen(true);
      };

      const closeSettings = () => {
        setIsSettingsOpen(false);
      };

      const handleOffsetChange = (e) => {
        const { id, value, type, checked } = e.target;
        setPrayerSettings({
          ...prayerSettings,
          hijriDateOffset: parseInt(value, 10),
        });
      };

      const handleScroll = (e) => {
        setScrollPosition(e.target.scrollLeft);
      };

      const scrollToCenter = () => {
        if (scrollRef.current) {
          const itemWidth = 40; // Assuming each item is 40px wide
          const centerIndex = 2; // Center the scroll to the 2nd item (0 to 4)
          const scrollAmount = (centerIndex * itemWidth) - (scrollRef.current.offsetWidth / 2) + (itemWidth / 2);
          scrollRef.current.scrollLeft = scrollAmount;
        }
      };

      useEffect(() => {
        scrollToCenter();
      }, []);

      return (
        <div className="hijri-calendar-screen p-4">
          <div className="surah-detail-header">
            <button onClick={handleBack} className="back-button">
              <ChevronLeft size={24} />
            </button>
            <div className="surah-info">
              <h2 className="text-lg font-semibold">Kalender Hijriyah</h2>
            </div>
            <button onClick={openSettings} className="p-2 rounded-full hover:bg-gray-100">
              <Settings size={20} />
            </button>
          </div>
          {/* <div className="flex items-center justify-between mb-2 w-full">
            <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronLeft size={20} />
            </button>
            <span>{hijriMonthNames[hijriMonth - 1]} {hijriYear}</span>
            <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronRight size={20} />
            </button>
          </div> */}

          <div className="grid grid-cols-7 gap-2">
            {/* Weekday headers */}
            {weekdayNames.map((weekday, index) => (
              <div key={index} className="text-center text-gray-500">{weekday}</div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              const isToday = day && day.date.toDateString() === new Date().toDateString();
              const isAyyamulBidh = day && [13, 14, 15].includes(day.hijriDay);
              const is1Shawwal = day && day.hijriMonth === 10+1 && day.hijriDay === 1; // Check for 1 Shawwal
              const is10DhuAlHijjah = day && day.hijriMonth === 12+1 && day.hijriDay === 10; // Check for 10 Dhu Al-Hijjah

              return (
                <button
                  key={index}
                  className={`p-2 text-center rounded-full ${day ? 'text-gray-800' : 'text-gray-400'} ${isToday ? 'bg-blue-100 text-blue-800 font-bold' : ''} ${isAyyamulBidh ? 'bg-green-100 text-green-800 font-bold' : ''} ${is1Shawwal ? 'bg-yellow-200 text-yellow-800 font-bold' : ''} ${is10DhuAlHijjah ? 'bg-yellow-200 text-yellow-800 font-bold' : ''} flex-1`} // Apply yellow marker
                  onClick={() => {
                    if (day) {
                      handleDayClick(day.date);
                    }
                  }}
                  disabled={!day}
                  style={{ cursor: day ? 'pointer' : 'default' }}
                >
                  {day ? day.hijriDay : ''}
                </button>
              );
            })}
          </div>

          {loading && <p>Loading Hijri date...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {hijriDate && (
            <div className="mt-4 flex flex-col gap-2">
              <legend className="text-sm text-gray-500">
                {gregorianDate ? gregorianDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) + ' M' : 'N/A'} /             {hijriDate ? `${hijriDate.split('/')[0]} ${hijriMonthNames[parseInt(hijriDate.split('/')[1], 10) - 1]} ${hijriDate.split('/')[2]} H` : 'N/A'}
              </legend>
              <legend className="text-sm text-gray-500 flex items-center">
                <span className="bg-green-100 text-green-800 font-bold rounded-full px-1 mr-1">13, 14, 15</span>: Ayyamul Bidh
              </legend>
              {hijriMonth === 10 && ( // Conditionally render 1 Shawwal legend
                <legend className="text-sm text-gray-500 flex items-center">
                  <span className="bg-yellow-200 text-yellow-800 font-bold rounded-full px-1 mr-1">1</span>: Idul Fithri
                </legend>
              )}
              {hijriMonth === 12 && ( // Conditionally render 10 Dhu Al-Hijjah legend
                <legend className="text-sm text-gray-500 flex items-center">
                  <span className="bg-yellow-200 text-yellow-800 font-bold rounded-full px-1 mr-1">10</span>: Idul Adha
                </legend>
              )}
            </div>
          )}
          {/* Settings Dialog */}
          {isSettingsOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Pengaturan Tanggal</h3>
                  <button onClick={closeSettings} className="p-2 rounded-full hover:bg-gray-100">
                    <X size={20} />
                  </button>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Offset Tanggal Hijriyah:
                  </label>
                  <div className="flex items-center space-x-4">
                    {[ -1, 0, 1].map((offset) => (
                      <label key={offset} className="inline-flex items-center flex-1">
                        <input
                          type="radio"
                          value={offset}
                          checked={hijriDateOffset === offset}
                          onChange={handleOffsetChange}
                          className="form-radio h-5 w-5 text-green-500 hidden"
                        />
                        <span
                          className={`w-full text-center px-3 py-2 rounded-md border border-gray-300 text-gray-700 cursor-pointer ${hijriDateOffset === offset ? 'bg-green-100 border-green-500 text-green-800 font-semibold' : 'hover:bg-gray-100'}`}
                          onClick={() => handleOffsetChange({ target: { value: offset } })}
                        >
                          {offset === -1 ? '-1' : offset === 0 ? '0' : '+1'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    export default HijriCalendarScreen;
