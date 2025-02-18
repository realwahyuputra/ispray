import { useState, useEffect } from 'react';
import { fetchPrayerTimes, formatPrayerTime, getNextPrayer } from '../services/prayerTimeService';
import useStore from '../store/store';

export const usePrayerTimes = (city, country, prayerSettings, date) => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const { timeFormat } = useStore();

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const loadPrayerTimes = async () => {
      try {
        setLoading(true);
        const prayerData = await fetchPrayerTimes(city, country, prayerSettings, date);
        const today = date.getDate() - 1; // API returns array starting from 1st of month
        const todayPrayers = prayerData.prayerTimes[today];

        const formattedPrayers = [
          { name: 'Fajr', time: formatPrayerTime(todayPrayers.timings.Fajr, timeFormat), icon: 'moon', bell: true },
          { name: 'Sunrise', time: formatPrayerTime(todayPrayers.timings.Sunrise, timeFormat), icon: 'sunrise', bell: false },
          { name: 'Dhuhr', time: formatPrayerTime(todayPrayers.timings.Dhuhr, timeFormat), icon: 'sun', bell: true },
          { name: 'Asr', time: formatPrayerTime(todayPrayers.timings.Asr, timeFormat), icon: 'sun', bell: true },
          { name: 'Maghrib', time: formatPrayerTime(todayPrayers.timings.Maghrib, timeFormat), icon: 'sunset', bell: true },
          { name: 'Isha', time: formatPrayerTime(todayPrayers.timings.Isha, timeFormat), icon: 'moon', bell: true }
        ];

        setPrayerTimes({
          prayerTimes: formattedPrayers,
          hijriDate: prayerData.hijriDate,
        });

        const next = getNextPrayer(todayPrayers.timings);
        setNextPrayer({
          name: next.name,
          time: next.time,
          tomorrow: next.tomorrow
        });
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (city && country) {
      loadPrayerTimes();
    }
  }, [city, country, prayerSettings, date, timeFormat, refetchTrigger]);

  const value = { 
    prayerTimes, 
    loading, 
    error, 
    nextPrayer,
    setNextPrayer: (nextPrayer) => {
      setNextPrayer(nextPrayer);
    },
    refetch
  };

  return value;
};
