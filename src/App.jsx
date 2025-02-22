import React, { useState, useEffect, useRef, useCallback } from 'react';
    import {
      MapPin,
      Bell,
      Settings as SettingsIcon,
      ChevronLeft,
      ChevronRight,
      Search,
      Home as HomeIcon,
      TrendingUp, // Market
      Repeat, // Trade
      Coins, // Assets
      Grid, // Menu
      User,
      Loader,
      BellRing, // Import BellRing icon
      Book,
      ListOrdered,
      Compass, // Import Compass icon
      Calendar, // Import Calendar icon
      Video, // Import Video icon
    } from 'lucide-react';
    import CitySelector from './components/CitySelector';
    import Articles from './components/Articles';
    import { usePrayerTimes } from './hooks/usePrayerTimes';
    import Settings from './components/Settings';
    import './App.css';
    import useStore from './store/store';
    import alarmSound from './assets/audio/alarm.mp3'; // Import the alarm sound
    import { formatPrayerTime } from './services/prayerTimeService';
    import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
    import QuranScreen from './components/QuranScreen';
    import SurahDetail from './components/SurahDetail';
    import BookmarkedAyahsScreen from './components/BookmarkedAyahsScreen';
    import * as Quran from 'quran-pack';
    import cse from 'cse';
    import QiblaScreen from './components/QiblaScreen'; // Import QiblaScreen
    import HijriCalendarScreen from './components/HijriCalendarScreen'; // Import HijriCalendarScreen
    import uq from '@umalqura/core';
    import { ToastContainer, toast } from 'react-toastify';
    import 'react-toastify/dist/ReactToastify.css';
    import LiveScreen from './components/LiveScreen'; // Import LiveScreen

    const App = () => {
      const { selectedCity, setSelectedCity, prayerSettings, setPrayerSettings, timeFormat } = useStore();
      const [isCitySelectorOpen, setIsCitySelectorOpen] = useState(false);
      const [searchQuery, setSearchQuery] = useState('');
      const [searchResults, setSearchResults] = useState(null);
      const [isSettingsOpen, setIsSettingsOpen] = useState(false);
      const [currentDate, setCurrentDate] = useState(new Date());
      const [hijriDate, setHijriDate] = useState('');
      const [timeRemaining, setTimeRemaining] = useState(null);
      const audioRef = useRef(null); // Ref for the audio element
      const [skyPhase, setSkyPhase] = useState('noon'); // Default to noon
      const [prayerCheckboxes, setPrayerCheckboxes] = useState(() => {
        const storedCheckboxes = localStorage.getItem('prayerCheckboxes');
        return storedCheckboxes ? JSON.parse(storedCheckboxes) : {};
      });
      const [activeTab, setActiveTab] = useState('home'); // State for active tab
      const [latestReadAyah, setLatestReadAyah] = useState(() => {
        const storedAyah = localStorage.getItem('latestReadAyah');
        return storedAyah ? JSON.parse(storedAyah) : null;
      });

      const { prayerTimes, loading, error, nextPrayer, setNextPrayer, refetch } = usePrayerTimes(
        selectedCity.name,
        selectedCity.country,
        prayerSettings,
        currentDate
      );

      const hijriMonthNames = [
        "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir",
        "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
        "Ramadan", "Syawal", "Dzulqadah", "Dzulhijjah"
      ];

      useEffect(() => {
        const calculateHijriDate = () => {
          if (currentDate) {
            const gregorianDate = new Date(currentDate);
            gregorianDate.setDate(currentDate.getDate() - prayerSettings.hijriDateOffset);
            try {
              const umalquraDate = uq(gregorianDate);
              const day = umalquraDate.format('dd');
              const monthIndex = parseInt(umalquraDate.format('MM'), 10) - 1;
              const year = umalquraDate.format('yyyy');

              if (monthIndex >= 0 && monthIndex < hijriMonthNames.length) {
                setHijriDate(`${day} ${hijriMonthNames[monthIndex]} ${year}`);
              } else {
                setHijriDate('N/A');
              }
            } catch (error) {
              console.error("Error calculating Hijri date:", error);
              setHijriDate('N/A');
            }
          } else {
            setHijriDate('N/A');
          }
        };

        if (prayerTimes && nextPrayer) {
          calculateHijriDate();
          calculateTimeRemaining(nextPrayer.time);
        }
      }, [prayerTimes, nextPrayer, currentDate, timeFormat, prayerSettings.hijriDateOffset]);

      useEffect(() => {
        // Update time remaining every minute
        const intervalId = setInterval(() => {
          if (prayerTimes) {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            // Find the next prayer
            let foundNext = false;
            for (let i = 0; i < prayerTimes.prayerTimes.length; i++) {
              const prayer = prayerTimes.prayerTimes[i];
              if (prayer.time > currentTime) {
                setNextPrayer({
                  name: prayer.name,
                  time: prayer.time
                });
                calculateTimeRemaining(prayer.time);
                foundNext = true;
                break;
              }
            }

            // If no prayer found for today, set next prayer to first prayer of tomorrow
            if (!foundNext) {
              const firstPrayer = prayerTimes.prayerTimes[0];
              if (firstPrayer) {
                setNextPrayer({
                  name: firstPrayer.name,
                  time: firstPrayer.time,
                  tomorrow: true
                });
                calculateTimeRemaining(firstPrayer.time);
              }
            }
          }
        }, 60000);

        return () => clearInterval(intervalId);
      }, [prayerTimes, currentDate, setNextPrayer, timeFormat]);

      useEffect(() => {
        // Check if it's time for a prayer and play alarm
        const checkPrayerTimes = () => {
          if (prayerTimes && prayerSettings.isAlarmEnabled) {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            prayerTimes.prayerTimes.forEach(prayer => {
              if (prayer.time === currentTime) {
                console.log(`It's time for ${prayer.name}!`);
                playSound();
              }
            });
          }
        };

        // Set interval to check prayer times every minute
        const prayerCheckIntervalId = setInterval(checkPrayerTimes, 60000);

        return () => clearInterval(prayerCheckIntervalId);
      }, [prayerTimes, prayerSettings.isAlarmEnabled]);

      const calculateTimeRemaining = (prayerTime) => {
        if (!prayerTime) {
          console.error("Prayer time is undefined or null");
          setTimeRemaining(null);
          return;
        }

        let prayerDate = new Date(currentDate);
        let prayerHours, prayerMinutes;

        // Attempt to parse the time string
        const timeParts = prayerTime.match(/(\d+):(\d+)\s*([ap]m)?/i);

        if (!timeParts) {
          console.error("Invalid prayer time format:", prayerTime);
          setTimeRemaining(null);
          return;
        }

        prayerHours = parseInt(timeParts[1], 10);
        prayerMinutes = parseInt(timeParts[2], 10);
        const ampm = timeParts[3];

        // Adjust hours for 12-hour format with AM/PM
        if (ampm) {
          if (ampm.toLowerCase() === 'pm' && prayerHours !== 12) prayerHours += 12;
          if (ampm.toLowerCase() === 'am' && prayerHours === 12) prayerHours = 0;
        }

        prayerDate.setHours(prayerHours);
        prayerDate.setMinutes(prayerMinutes);
        prayerDate.setSeconds(0);
        prayerDate.setMilliseconds(0);

        console.log("Prayer Date:", prayerDate);

        const now = new Date();
        console.log("Current Time:", now);

        let difference = prayerDate.getTime() - now.getTime();

        if (difference < 0) {
          prayerDate = new Date(currentDate);
          prayerDate.setDate(currentDate.getDate() + 1);
          prayerDate.setHours(prayerHours);
          prayerDate.setMinutes(prayerMinutes);
          prayerDate.setSeconds(0);
          prayerDate.setMilliseconds(0);
          difference = prayerDate.getTime() - now.getTime();
        }

        console.log("Time Difference:", difference);

        let minutesLeft = Math.ceil(difference / (1000 * 60));

        if (isNaN(minutesLeft)) {
          console.error("Calculated minutesLeft is NaN");
          setTimeRemaining(null);
          return;
        }

        const hoursLeft = Math.floor(minutesLeft / 60);
        minutesLeft = minutesLeft % 60;

        let timeRemainingString = "";
        if (hoursLeft > 0) {
          timeRemainingString += `${hoursLeft} jam `;
        }
        timeRemainingString += `${minutesLeft} menit`;

        setTimeRemaining(timeRemainingString);
      };

      const playSound = () => {
        if (audioRef.current) {
          audioRef.current.play();
        }
      };

      const quickActions = [
        { icon: 'book', label: 'Quran' },
        { icon: 'book-open', label: 'Azkar' },
        { icon: 'circle' && <div className="tasbih-icon">📿</div> },
        { icon: 'compass' && <div className="qibla-icon">🧭</div> },
        { icon: 'grid' && <div className="grid-icon">➕</div> }
      ];

      const navItems = [
        { icon: <HomeIcon size={24} />, label: 'Home', tab: 'home' },
        { icon: <Compass size={24} />, label: 'Kiblat', tab: 'qibla' }, // Replaced Market with Qibla and Compass icon
        { icon: <Book size={24} />, label: 'Quran', tab: 'quran' }, // Add Quran tab
        { icon: <Video size={24} />, label: 'Live', tab: 'live' }, // Replaced Assets with Live and Video icon
        { icon: <Calendar size={24} />, label: 'Hijri', tab: 'hijri' } // Add Hijri tab
      ];

      const getPrayerIcon = (iconName) => {
        switch (iconName) {
          case 'moon':
            return '🌙';
          case 'sunrise':
            return '🌅';
          case 'sun':
            return '☀️';
          case 'sunset':
            return '🌅';
          default:
            return '☀️';
        }
      };

      const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
      };

      const handleSearchSubmit = (e) => {
        e.preventDefault();
        // performSearch(searchQuery); // Remove the API search
      };

      const openSettings = () => {
        setIsSettingsOpen(true);
      };

      const closeSettings = () => {
        setIsSettingsOpen(false);
      };

      const handleSettingsChange = useCallback((newSettings) => {
        setPrayerSettings(newSettings);
      }, []);

      const goToPreviousDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        setCurrentDate(newDate);
      };

      const goToNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        setCurrentDate(newDate);
      };

      const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
      };

      useEffect(() => {
        const now = new Date();
        const hours = now.getHours();

        if (hours >= 6 && hours < 10) {
          setSkyPhase('dawn');
        } else if (hours >= 10 && hours < 16) {
          setSkyPhase('noon');
        } else if (hours >= 16 && hours < 20) {
          setSkyPhase('dusk');
        } else {
          setSkyPhase('midnight');
        }
      }, []);

      useEffect(() => {
        localStorage.setItem('prayerCheckboxes', JSON.stringify(prayerCheckboxes));
      }, [prayerCheckboxes]);

      const handleCheckboxChange = (prayerName, isChecked) => {
        const dateKey = currentDate.toDateString();
        setPrayerCheckboxes(prevCheckboxes => {
          const newCheckboxes = {
            ...prevCheckboxes,
            [dateKey]: {
              ...prevCheckboxes[dateKey],
              [prayerName]: isChecked
            }
          };
          return newCheckboxes;
        });

        // Show toast notification only when checking the checkbox
        if (isChecked) {
          let toastMessage = `Alhamdulillah kamu sudah shalat ${prayerName}`;
          toast.success(toastMessage, {
            position: toast.POSITION.TOP_CENTER
          });
        }
      };

      const resetCheckboxes = () => {
        setPrayerCheckboxes({});
      };

      const getCurrentPrayerTime = () => {
        if (!prayerTimes || !nextPrayer) return null;

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        for (const prayer of prayerTimes.prayerTimes) {
          const [hours, minutes] = prayer.time.split(':');
          const prayerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
          const timeDiff = now.getTime() - prayerTime.getTime();
          const minutesDiff = Math.floor(timeDiff / (1000 * 60));

          if (minutesDiff >= 0 && minutesDiff <= 5) {
            return prayer.name;
          }
        }
        return null;
      };

      const currentPrayer = getCurrentPrayerTime();

      const handleTabChange = (tab) => {
        setActiveTab(tab);
      };

      const handleSetLatestReadAyah = (surahNumber, verseNumber) => {
        const surah = Quran.surah(surahNumber);
        if (surah) {
          const ayahInfo = {
            surahNumber: surahNumber,
            verseNumber: verseNumber,
            surahName: surah.nameLatin,
          };
          localStorage.setItem('latestReadAyah', JSON.stringify(ayahInfo));
          setLatestReadAyah(ayahInfo);
        }
      };

      const searchResultsRef = useRef(null);
      const scriptRef = useRef(null);

      useEffect(() => {
        if (activeTab === 'home') {
          const cx = '010268028161000595287:r9cavnk7mvo';
          const gcse = document.createElement('script');
          gcse.type = 'text/javascript';
          gcse.async = true;
          gcse.src = `https://cse.google.com/cse.js?cx=${cx}`;

          scriptRef.current = gcse;

          const s = document.getElementsByTagName('script')[0];
          s.parentNode.insertBefore(gcse, s);

          gcse.onload = () => {
            const renderSearch = () => {
              if (window.google && window.google.search) {
                // Explicitly render the search box and results
                const searchBoxElement = document.createElement('gcse:searchbox');
                searchBoxElement.setAttribute('data-resultsUrl', '/');
                searchBoxElement.setAttribute('data-newWindow', 'false');
                searchBoxElement.setAttribute('data-queryParameterName', 'q');
                const searchResultsElement = document.createElement('gcse:searchresults');
                searchResultsElement.setAttribute('data-resultsUrl', '/');
                searchResultsElement.setAttribute('data-newWindow', 'false');
                searchResultsElement.setAttribute('data-queryParameterName', 'q');

                if (searchResultsRef.current) {
                  searchResultsRef.current.innerHTML = ''; // Clear previous content
                  searchResultsRef.current.appendChild(searchBoxElement);
                  searchResultsRef.current.appendChild(searchResultsElement);
                }

                window.google.search.cse.element.go('search', 'searchresults-only', {
                  gname: 'search'
                });

                // Set the search query if there is one
                if (searchQuery) {
                  const searchBox = document.querySelector(".gsc-input");
                  if (searchBox) {
                    searchBox.value = searchQuery;
                  }
                }
              } else {
                setTimeout(renderSearch, 500);
              }
            };
            renderSearch();
          };

          window.__gcse = {
            parsetags: 'explicit',
          };

          return () => {
            if (scriptRef.current && scriptRef.current.parentNode) {
              scriptRef.current.parentNode.removeChild(scriptRef.current);
              scriptRef.current = null;
            }
            if (searchResultsRef.current) {
              searchResultsRef.current.innerHTML = '';
            }
          };
        }
      }, [activeTab, searchQuery]);

      useEffect(() => {
        const setPlaceholder = () => {
          const searchInput = document.querySelector('input.gsc-input');
          if (searchInput) {
            searchInput.setAttribute('placeholder', 'Apa yang ingin antum cari?');
          } else {
            setTimeout(setPlaceholder, 500);
          }
        };

        // Call setPlaceholder after the component mounts and after the CSE script loads
        if (activeTab === 'home') {
          setTimeout(setPlaceholder, 500);
        }
      }, [activeTab]);

      return (
        <Router>
          <div className="app-container">
            <audio ref={audioRef} src={alarmSound} preload="auto" /> {/* Audio element */}
            <div>
              <Routes>
                <Route path="/" element={
                  <>
                    {activeTab === 'home' && (
                      <div>
                        <div className="header">
                          <div className="sky">
                            <div className={`sky__phase sky__dawn ${skyPhase === 'dawn' ? 'active' : ''}`}></div>
                            <div className={`sky__phase sky__noon ${skyPhase === 'noon' ? 'active' : ''}`}></div>
                            <div className={`sky__phase sky__dusk ${skyPhase === 'dusk' ? 'active' : ''}`}></div>
                            <div className={`sky__phase sky__midnight ${skyPhase === 'midnight' ? 'active' : ''}`}>
                            </div>
                          </div>
                          <div className="top-bar">
                            <img
                              src="https://i.ibb.co.com/FLBhVTkG/logo-mps.png"
                              alt="MPS Logo"
                              className="h-8" // Adjust height as needed
                            />
                            <div className="actions">
                              <button
                                className="location"
                                onClick={() => setIsCitySelectorOpen(true)}
                              >
                                <MapPin size={20} className="location-icon" />
                              </button>
                              <div className="action-icon-wrapper" onClick={openSettings}>
                                <SettingsIcon size={20} />
                              </div>
                            </div>
                          </div>

                          <div className={`current-prayer ${skyPhase === 'dawn' || skyPhase === 'noon' ? 'text-black' : 'text-white'}`}>
                            {loading ? (
                              <div className="flex items-center justify-center p-8">
                                <Loader className="animate-spin" size={30} />
                              </div>
                            ) : nextPrayer && (
                              <>
                                <div className="prayer-name">
                                  {currentPrayer === 'Sunrise' ? 'Waktu Terlarang Shalat' : nextPrayer.name}
                                </div>
                                <div className="prayer-time">
                                  {formatPrayerTime(nextPrayer.time, timeFormat)}
                                </div>
                                {nextPrayer.name === 'Sunrise' || nextPrayer.name === 'Terbit' ? (
                                  <div className="next-prayer">
                                    Matahari terbit dalam {timeRemaining}
                                  </div>
                                ) : (
                                  timeRemaining !== null && (
                                    <div className="next-prayer">
                                      {nextPrayer.name} {timeRemaining} lagi
                                    </div>
                                  )
                                )}
                              </>
                            )}
                          </div>

                          {/* Inline Search Results */}
                          <div className="search-results-container">
                            <div ref={searchResultsRef}>
                            </div>
                          </div>

                          <div className="date-selector">
                            <ChevronLeft size={24} className="arrow" onClick={goToPreviousDay} style={{ cursor: 'pointer' }} />
                            <Link to="/hijri">
                              <span className="date">{hijriDate ? hijriDate : 'Loading...'}</span>
                            </Link>
                            <ChevronRight size={24} className="arrow" onClick={goToNextDay} style={{ cursor: 'pointer' }} />
                          </div>
                        </div>

                        <div className="prayer-list">
                          {loading ? (
                            <div className="flex items-center justify-center p-8">
                              <Loader className="animate-spin" size={30} />
                            </div>
                          ) : (
                            prayerTimes?.prayerTimes.map((prayer, index) => {
                              const dateKey = currentDate.toDateString();
                              const isChecked = (prayerCheckboxes[dateKey] && prayerCheckboxes[dateKey][prayer.name]) || false;
                              const isSunrise = prayer.name === 'Sunrise';

                              return (
                                <div className="prayer-item" key={index}>
                                  <div className="prayer-info">
                                    <span className="prayer-icon">{getPrayerIcon(prayer.icon)}</span>
                                    <span className="prayer-name">{prayer.name}</span>
                                    {prayer.bell && <Bell size={16} className="bell-icon" />}
                                  </div>
                                  <div className="prayer-time">{formatPrayerTime(prayer.time, timeFormat)}</div>
                                  <div className="checkbox">
                                    <input
                                      type="checkbox"
                                      className="custom-checkbox"
                                      checked={isChecked}
                                      onChange={(e) => handleCheckboxChange(prayer.name, e.target.checked)}
                                      disabled={isSunrise}
                                      style={{ opacity: isSunrise ? 0.5 : 1, cursor: isSunrise ? 'not-allowed' : 'pointer', border: isSunrise ? 'none' : '1px solid #ccc' }}
                                    />
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {latestReadAyah && latestReadAyah.surahNumber && ( // Conditionally render the banner
                          <Link to={`/quran/${latestReadAyah.surahNumber}?verse=${latestReadAyah.verseNumber}`} className="latest-read-ayah">
                            <div className="welcome-banner">
                              <ListOrdered size={22} className="mosque-icon" />
                              <span className="welcome-text">
                                Lanjutkan Surat {latestReadAyah.surahName} : {latestReadAyah.verseNumber}
                              </span>
                            </div>
                          </Link>
                        )}

                        <div className="quick-actions">
                          {quickActions.map((action, index) => (
                            <div className="action-item" key={index}>
                              <div className="action-icon-wrapper">
                                {action.icon === 'book' && <Bell size={24} />}
                                {action.icon === 'book-open' && <Bell size={24} />}
                                {action.icon === 'circle' && <div className="tasbih-icon">📿</div>}
                                {action.icon === 'compass' && <div className="qibla-icon">🧭</div>}
                                {action.icon === 'grid' && <div className="grid-icon">➕</div>}
                              </div>
                              <span className="action-label">{action.label}</span>
                            </div>
                          ))}
                        </div>

                        <Articles />
                      </div>
                    )}
                  </>
                } />
                <Route path="/quran" element={<QuranScreen />} />
                <Route path="/quran/:surahNumber" element={<SurahDetail setLatestReadAyah={handleSetLatestReadAyah} />} />
                <Route path="/bookmarked" element={<BookmarkedAyahsScreen />} />
                <Route path="/qibla" element={<QiblaScreen />} /> {/* Add QiblaScreen route */}
                <Route path="/hijri" element={<HijriCalendarScreen />} />
                <Route path="/live" element={<LiveScreen />} /> {/* Add LiveScreen route */}
              </Routes>

              <CitySelector
                isOpen={isCitySelectorOpen}
                onClose={() => setIsCitySelectorOpen(false)}
              />

              <Settings
                isOpen={isSettingsOpen}
                onClose={closeSettings}
                onResetCheckboxes={resetCheckboxes} // Pass the resetCheckboxes function
              />
              <ToastContainer />
            </div>
            <nav className="bottom-nav">
              {navItems.map((item, index) => (
                <Link
                  to={item.tab === 'home' ? '/' : item.tab === 'qibla' ? '/qibla' : item.tab === 'quran' ? '/quran' : item.tab === 'live' ? '/live' : item.tab === 'hijri' ? '/hijri' : '/bookmarked'} // Update routes
                  className={`nav-item ${activeTab === item.tab ? 'active' : ''}`}
                  key={index}
                  // onClick={() => handleTabChange(item.tab)}
                >
                  <div className="nav-icon">
                    {item.icon}
                  </div>
                  <span className="nav-label">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </Router>
      );
    };

    export default App;
