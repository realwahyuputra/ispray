import React, { useState, useEffect } from 'react';
      import * as Quran from 'quran-pack';
      import { useNavigate, Link } from 'react-router-dom';
      import { ChevronLeft, Bookmark } from 'lucide-react';

      const BookmarkedAyahsScreen = () => {
        const [bookmarkedVerses, setBookmarkedVerses] = useState([]);
        const navigate = useNavigate();

        useEffect(() => {
          const storedBookmarks = localStorage.getItem('bookmarkedAyahs');
          if (storedBookmarks) {
            const bookmarks = JSON.parse(storedBookmarks);
            const versesData = [];

            for (const verseKey in bookmarks) {
              if (bookmarks.hasOwnProperty(verseKey)) {
                const [surahNumber, verseNumber] = verseKey.split('-');
                const surah = Quran.surah(parseInt(surahNumber, 10));

                if (surah) {
                  const arabic = surah.arabics[verseNumber];
                  const latin = surah.latins[verseNumber];
                  const translation = surah.translations.id[verseNumber];

                  versesData.push({
                    surahNumber: parseInt(surahNumber, 10),
                    verseNumber: parseInt(verseNumber, 10),
                    arabic: arabic,
                    latin: latin,
                    translation: translation,
                    surahNameLatin: surah.nameLatin
                  });
                }
              }
            }

            setBookmarkedVerses(versesData);
          }
        }, []);

        const handleBack = () => {
          navigate('/quran');
        };

        const goToSurah = (surahNumber, verseNumber) => {
          navigate(`/quran/${surahNumber}?verse=${verseNumber}`);
        };

        return (
          <div className="bookmarked-ayahs-screen p-4">
            <div className="surah-detail-header">
              <button onClick={handleBack} className="back-button">
                <ChevronLeft size={24} />
              </button>
              <div className="surah-info">
                <h2 className="text-lg font-semibold">Ayat Ditandai</h2>
              </div>
              <Link to="/bookmarked" className="mr-4">
                <Bookmark size={24} />
              </Link>
            </div>
            {bookmarkedVerses.length === 0 ? (
              <p>Belum ada ayat yang ditandai.</p>
            ) : (
              <ul className="space-y-4">
                {bookmarkedVerses.map((verse, index) => (
                  <li key={index} className="bg-white rounded-lg shadow p-4" onClick={() => goToSurah(verse.surahNumber, verse.verseNumber)}>
                    <p className="text-right text-xl">{verse.arabic}</p>
                    <p className="text-gray-600">{verse.latin}</p>
                    <p className="text-gray-800">{verse.translation?.id}</p>
                    <p className="text-sm text-gray-500">Surat {verse.surahNameLatin} - Ayat {verse.verseNumber}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      };

      export default BookmarkedAyahsScreen;
