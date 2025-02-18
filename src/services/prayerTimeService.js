const BASE_URL = 'https://api.aladhan.com/v1';

    const hijriMonthNames = [
      "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
      "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
      "Ramadan", "Shawwal", "Dhu al-Qidah", "Dhu al-Hijjah"
    ];

    const hijriMonthNamesIndonesian = [
      "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir",
      "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
      "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah"
    ];

    export const fetchPrayerTimes = async (city, country, prayerSettings, date) => {
      try {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        let url = `${BASE_URL}/calendarByCity/${year}/${month}?city=${city}&country=${country}&method=${prayerSettings.calculationMethod}`;

        // Add other parameters
        url += `&school=${prayerSettings.school}`;
        url += `&asr=${prayerSettings.asrCalculationMethod}`;
        url += `&latitudeAdjustmentMethod=${prayerSettings.latitudeAdjustmentMethod}`;
        url += `&midnightMode=${prayerSettings.midnightMode}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch prayer times');
        }

        const data = await response.json();

        // Fetch Hijri date
        const hijriDateResponse = await fetch(`${BASE_URL}/gToH/${day}-${month}-${year}`);
        const hijriDateData = await hijriDateResponse.json();

        const hijriDate = hijriDateData.data.hijri;
        const hijriDay = hijriDate.day;
        const hijriMonthIndex = parseInt(hijriDate.month.number) - 1;
        const hijriMonth = hijriMonthNamesIndonesian[hijriMonthIndex];
        const hijriYear = hijriDate.year;

        const formattedHijriDate = `${hijriDay} ${hijriMonth} ${hijriYear}`;

        return {
          prayerTimes: data.data,
          hijriDate: formattedHijriDate,
        };
      } catch (error) {
        console.error('Error fetching prayer times:', error);
        throw error;
      }
    };

    export const formatPrayerTime = (time, timeFormat = '24') => {
      const date = new Date(`2024-01-01 ${time}`);
      let options = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: false
      };

      if (timeFormat === '12') {
        options.hour12 = true;
      }

      return date.toLocaleTimeString('en-US', options);
    };

    export const getNextPrayer = (timings) => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const prayerTimes = [
        { name: 'Fajr', time: timings.Fajr },
        { name: 'Sunrise', time: timings.Sunrise },
        { name: 'Dhuhr', time: timings.Dhuhr },
        { name: 'Asr', time: timings.Asr },
        { name: 'Maghrib', time: timings.Maghrib },
        { name: 'Isha', time: timings.Isha }
      ];

      const prayerNamesIndonesian = {
        Fajr: 'Subuh',
        Sunrise: 'Terbit',
        Dhuhr: 'Dzuhur',
        Asr: 'Ashar',
        Maghrib: 'Maghrib',
        Isha: 'Isya'
      };

      for (const prayer of prayerTimes) {
        const [hours, minutes] = prayer.time.split(':');
        const prayerMinutes = parseInt(hours) * 60 + parseInt(minutes);

        if (prayerMinutes > currentTime) {
          return {
            name: prayerNamesIndonesian[prayer.name],
            time: prayer.time
          };
        }
      }

      // If no next prayer found today, return first prayer of next day
      return {
        name: prayerNamesIndonesian.Fajr,
        time: prayerTimes[0].time,
        tomorrow: true
      };
    };
