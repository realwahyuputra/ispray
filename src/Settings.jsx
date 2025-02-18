import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import useStore from '../store/store';
import { toast } from 'react-toastify';

const Settings = ({ isOpen, onClose, onResetCheckboxes }) => { // Added onResetCheckboxes prop
  const { prayerSettings, setPrayerSettings, timeFormat, setTimeFormat } = useStore();
  const { calculationMethod, asrCalculationMethod, latitudeAdjustmentMethod, midnightMode, school, isAlarmEnabled, hijriDateOffset } = prayerSettings;

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    if (id === 'timeFormat') {
      setTimeFormat(value);
    } else {
      setPrayerSettings({
        ...prayerSettings,
        [id]: type === 'checkbox' ? checked : parseInt(value, 10),
      });
    }
  };

  const handleResetCheckboxes = () => {
    localStorage.removeItem('prayerCheckboxes');
    onResetCheckboxes(); // Call the prop function
    toast.success('Prayer time checkboxes have been reset.', {
      position: toast.POSITION.TOP_CENTER
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
      <div className="bg-white rounded-t-3xl w-full max-w-md p-6 animate-slide-up" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Pengaturan</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="mb-4">
          <label htmlFor="calculationMethod" className="block text-gray-700 text-sm font-bold mb-2">
            Metode Perhitungan:
          </label>
          <select
            id="calculationMethod"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={calculationMethod}
            onChange={handleChange}
          >
            <option value={0}>Kemenag RI</option>
            <option value={1}>Islamic Society of North America (ISNA)</option>
            <option value={2}>Muslim World League (MWL)</option>
            <option value={3}>Umm al-Qura, Mecca</option>
            <option value={4}>Egyptian General Authority of Survey</option>
            <option value={5}>Custom Setting</option>
            <option value={7}>University of Islamic Sciences, Karachi</option>
            <option value={8}>Gulf Region</option>
            <option value={9}>Kuwait</option>
            <option value={10}>Qatar</option>
            <option value={11}>Majlis Ugama Islam Singapura, Singapore</option>
            <option value={12}>Union Organization Islamic de France</option>
            <option value={13}>Diyanet İşleri Başkanlığı, Turkey</option>
            <option value={14}>Spiritual Administration of Muslims of Russia</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="asrCalculationMethod" className="block text-gray-700 text-sm font-bold mb-2">
            Metode Perhitungan Ashar:
          </label>
          <select
            id="asrCalculationMethod"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={asrCalculationMethod}
            onChange={handleChange}
          >
            <option value={0}>Standard</option>
            <option value={1}>Hanafi</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="latitudeAdjustmentMethod" className="block text-gray-700 text-sm font-bold mb-2">
            Metode Penyesuaian Lintang:
          </label>
          <select
            id="latitudeAdjustmentMethod"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={latitudeAdjustmentMethod}
            onChange={handleChange}
          >
            <option value={0}>None</option>
            <option value={1}>Middle of the Night</option>
            <option value={2}>One Seventh</option>
            <option value={3}>Angle Based</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="midnightMode" className="block text-gray-700 text-sm font-bold mb-2">
            Mode Tengah Malam:
          </label>
          <select
            id="midnightMode"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={midnightMode}
            onChange={handleChange}
          >
            <option value={0}>Standard</option>
            <option value={1}>Jafari</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="school" className="block text-gray-700 text-sm font-bold mb-2">
            Mazhab:
          </label>
          <select
            id="school"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={school}
            onChange={handleChange}
          >
            <option value={0}>Shafii</option>
            <option value={1}>Hanafi</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="timeFormat" className="block text-gray-700 text-sm font-bold mb-2">
            Format Waktu:
          </label>
          <select
            id="timeFormat"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={timeFormat}
            onChange={handleChange}
          >
            <option value="24">24 Jam</option>
            <option value="12">12 Jam</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="isAlarmEnabled" className="inline-flex items-center">
            <input
              type="checkbox"
              id="isAlarmEnabled"
              className="form-checkbox h-5 w-5 text-green-500"
              checked={isAlarmEnabled || false}
              onChange={handleChange}
            />
            <span className="ml-2 text-gray-700 text-sm font-bold">Aktifkan Alarm</span>
          </label>
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
                  id="hijriDateOffset"
                  value={offset}
                  checked={prayerSettings.hijriDateOffset === offset}
                  onChange={handleChange}
                  className="form-radio h-5 w-5 text-green-500 hidden"
                />
                <span
                  className={`w-full text-center px-3 py-2 rounded-md border border-gray-300 text-gray-700 cursor-pointer ${prayerSettings.hijriDateOffset === offset ? 'bg-green-100 border-green-500 text-green-800 font-semibold' : 'hover:bg-gray-100'}`}
                  onClick={() => handleChange({ target: { id: 'hijriDateOffset', value: offset } })}
                >
                  {offset === -1 ? '-1' : offset === 0 ? '0' : '+1'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleResetCheckboxes}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Reset Checkbox Sholat
        </button>
      </div>
    </div>
  );
};

export default Settings;
