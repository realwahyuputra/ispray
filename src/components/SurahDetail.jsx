import React, { useState, useEffect, useRef } from 'react';
    import * as Quran from 'quran-pack';
    import { useParams, useNavigate, useLocation } from 'react-router-dom';
    import { ChevronLeft, Play, Pause, Volume2, VolumeX, Bookmark, BookmarkPlus, ScanText } from 'lucide-react';
    import useStore from '../store/store';

    const SurahDetail = ({ setLatestReadAyah }) => {
      const { surahNumber } = useParams();
      const [surah, setSurah] = useState(null);
      const [verses, setVerses] = useState([]);
      const [loading, setLoading] = useState(true);
      const [playingVerse, setPlayingVerse] = useState(null);
      const [isPlaying, setIsPlaying] = useState(false);
      const [isMuted, setIsMuted] = useState(false);
      const audioRef = useRef(null);
      const navigate = useNavigate();
      const verseRefs = useRef({}); // Refs for each verse
      const headerRef = useRef(null);
      const { prayerSettings } = useStore();
      const [bookmarkedAyahs, setBookmarkedAyahs] = useState(() => {
        const storedBookmarks = localStorage.getItem('bookmarkedAyahs');
        return storedBookmarks ? JSON.parse(storedBookmarks) : {};
      });
      const location = useLocation();
      const surahDetailRef = useRef(null);
      const [currentVerseNumber, setCurrentVerseNumber] = useState(null);
      const [showTranslation, setShowTranslation] = useState(null); // State to control translation visibility

      useEffect(() => {
        const fetchSurah = async () => {
          setLoading(true);
          try {
            const surahInstance = Quran.surah(parseInt(surahNumber, 10));
            setSurah(surahInstance);
            let versesData = surahInstance.arabics;
            if (surahNumber !== '1') {
              versesData = {
                ...{ '0': 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
                ...versesData
              }
            }
            const versesArray = Object.entries(versesData).map(([verseNumber, arabicText]) => {
              let latin = surahInstance.latins[verseNumber];
              let translation = surahInstance.translations.id[verseNumber];
              let tafsir = surahInstance.tafsirs.id?.kemenag[verseNumber];
              if (verseNumber === '0') {
                latin = '';
                translation = { id: 'Dengan menyebut nama Allah Yang Maha Pengasih, Maha Penyayang.' }
                tafsir = null;
              }
              return {
                verseNumber: parseInt(verseNumber, 10),
                arabic: arabicText,
                latin: latin,
                translation: translation,
                tafsir: tafsir,
              };
            });
            setVerses(versesArray);
          } catch (error) {
            console.error("Error fetching surah:", error);
          } finally {
            setLoading(false);
          }
        };

        if (surahNumber) {
          fetchSurah();
        }
      }, [surahNumber]);

      useEffect(() => {
        if (audioRef.current) {
          audioRef.current.addEventListener('ended', handleAudioEnded);
          audioRef.current.volume = isMuted ? 0 : 1;
        }
        return () => {
          if (audioRef.current) {
            audioRef.current.removeEventListener('ended', handleAudioEnded);
          }
        };
      }, [playingVerse, isMuted]);

      useEffect(() => {
        if (playingVerse && verseRefs.current[playingVerse]) {
          verseRefs.current[playingVerse].scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, [playingVerse]);

      useEffect(() => {
        if (surahDetailRef.current) {
          surahDetailRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
        const verseParam = new URLSearchParams(location.search).get('verse');
        if (verseParam) {
          // Delay scrolling until verses are loaded
          if (!loading && verses.length > 0) {
            const verseNumber = parseInt(verseParam, 10);
            if (verseRefs.current[verseNumber]) {
              verseRefs.current[verseNumber].scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
            }
          }
        }
      }, [location.search, loading, verses, surahNumber]);

      const handleBack = () => {
        navigate('/quran');
      };

      const handlePlayPause = (verseNumber) => {
        let audioUrl = `https://quranaudio.pages.dev/2/${surahNumber}_${verseNumber}.mp3`;
        if (verseNumber === 0 && surahNumber !== '1') {
          audioUrl = 'https://quranaudio.pages.dev/2/1_1.mp3';
        }

        if (playingVerse === verseNumber) {
          // Pause the audio
          if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
          } else {
            audioRef.current.play();
            setIsPlaying(true);
          }
        } else {
          // Play a new verse
          setPlayingVerse(verseNumber);
          setIsPlaying(true);
          audioRef.current.src = audioUrl;
          audioRef.current.play();
        }
      };

      const handleAudioEnded = () => {
        // Find the index of the current verse
        const currentIndex = verses.findIndex(verse => verse.verseNumber === playingVerse);

        // If it's the last verse, stop playing
        if (currentIndex === verses.length - 1) {
          setIsPlaying(false);
          setPlayingVerse(null);
          return;
        }

        // Play the next verse
        const nextVerse = verses[currentIndex + 1].verseNumber;
        setPlayingVerse(nextVerse);
        let audioUrl = `https://quranaudio.pages.dev/2/${surahNumber}_${nextVerse}.mp3`;
        if (nextVerse === 0 && surahNumber !== '1') {
          audioUrl = 'https://quranaudio.pages.dev/2/1_1.mp3';
        }
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      };

      const toggleMute = () => {
        setIsMuted(!isMuted);
      };

      const toggleBookmark = (verseNumber) => {
        const verseKey = `${surahNumber}-${verseNumber}`;
        setBookmarkedAyahs(prevBookmarks => {
          const newBookmarks = { ...prevBookmarks };
          if (newBookmarks[verseKey]) {
            delete newBookmarks[verseKey]; // Remove bookmark if it exists
          } else {
            newBookmarks[verseKey] = true; // Add bookmark
          }
          localStorage.setItem('bookmarkedAyahs', JSON.stringify(newBookmarks));
          setLatestReadAyah(parseInt(surahNumber), parseInt(verseNumber));
          setCurrentVerseNumber(verseNumber);

          return newBookmarks;
        });
      };

      const handleVerseClick = (verseNumber) => {
        setLatestReadAyah(parseInt(surahNumber), parseInt(verseNumber));
        setCurrentVerseNumber(verseNumber);
      };

      useEffect(() => {
        // Set latest read ayah whenever a verse is clicked or bookmarked
        localStorage.setItem('latestReadAyah', JSON.stringify({
          surahNumber: parseInt(surahNumber),
          verseNumber: currentVerseNumber,
          surahName: surah?.nameLatin,
        }));
      }, [surahNumber, currentVerseNumber, surah?.nameLatin]);

      const toggleTranslation = (verseNumber) => {
        setShowTranslation(showTranslation === verseNumber ? null : verseNumber);
      };

      if (loading) {
        return (
          <div className="flex justify-center items-center p-6">
            Loading...
          </div>
        );
      }

      if (!surah) {
        return <div>Surah not found.</div>;
      }

      return (
        <div className="surah-detail" ref={surahDetailRef}>
          <div className="surah-detail-header" ref={headerRef}>
            <button onClick={handleBack} className="back-button">
              <ChevronLeft size={24} />
            </button>
            <div className="surah-info">
              <h2 className="text-lg font-semibold">{surah.nameLatin}</h2>
            </div>
            <button onClick={toggleMute} className="mute-button">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
          <div className="surah-verses">
            {verses.map((verse, index) => {
              const isBookmarked = !!bookmarkedAyahs[`${surahNumber}-${verse.verseNumber}`];
              return (
                <div
                  key={index}
                  className={`verse-item ${playingVerse === verse.verseNumber ? 'playing-verse' : ''}`}
                  ref={el => verseRefs.current[verse.verseNumber] = el}
                  onClick={() => handleVerseClick(verse.verseNumber)}
                >
                  <p className="verse-arabic">
                    {verse.arabic}
                    {verse.verseNumber !== 0 && (
                      <span className="text-gray-500"> ({verse.verseNumber})</span>
                    )}
                  </p>
                  <p className="verse-latin">{verse.latin}</p>
                  <div className="verse-actions-inline flex items-center mt-2">
                    <button
                      className={`play-button text-xs mr-1 ${playingVerse === verse.verseNumber ? 'active' : ''}`}
                      onClick={() => handlePlayPause(verse.verseNumber)}
                    >
                      {playingVerse === verse.verseNumber && isPlaying ? (
                        <>
                          <Pause size={12} /> Pause
                        </>
                      ) : (
                        <>
                          <Play size={12} /> Play
                        </>
                      )}
                    </button>
                    {verse.verseNumber !== 0 && ( // Conditionally render bookmark button
                      <button
                        onClick={() => toggleBookmark(verse.verseNumber)}
                        className="bookmark-button text-xs mr-1"
                      >
                        {isBookmarked ? (
                          <>
                            <Bookmark size={12} color="#2563eb" fill="#2563eb" /> Bookmarked
                          </>
                        ) : (
                          <>
                            <BookmarkPlus size={12} /> Bookmark
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => toggleTranslation(verse.verseNumber)}
                      className="verse-translation-button bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded text-xs flex items-center"
                    >
                      <ScanText size={12} className="mr-1" /> Terjemahan
                    </button>
                  </div>
                  {showTranslation === verse.verseNumber && (
                    <div className="verse-translation-content p-4 text-left mt-2 bg-gray-100 rounded">
                      <p>{typeof verse.translation === 'string' ? verse.translation : verse.translation?.id}</p>
                      {verse.tafsir && (
                        <>
                          <h4 className="font-semibold mt-2">Tafsir:</h4>
                          <p className="text-sm bg-gray-100 p-2 rounded">{verse.tafsir}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <audio ref={audioRef} />
        </div>
      );
    };

    export default SurahDetail;
