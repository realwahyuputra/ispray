import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      selectedCity: { name: 'Dubai', country: 'UAE' },
      prayerSettings: {
        calculationMethod: 2,
        asrCalculationMethod: 0,
        latitudeAdjustmentMethod: 3,
        midnightMode: 0,
        school: 0,
        isAlarmEnabled: false, // Added alarm setting
        hijriDateOffset: 0, // Added hijriDateOffset setting
      },
      timeFormat: '24', // Default time format is 24-hour
      setSelectedCity: (city) => set({ selectedCity: city }),
      setPrayerSettings: (settings) => set({ prayerSettings: settings }),
      setTimeFormat: (format) => set({ timeFormat: format }),
    }),
    {
      name: 'prayer-app-storage', // unique name
      getStorage: () => localStorage, // (optional) by default the 'localStorage' is used
    }
  )
);

export default useStore;
