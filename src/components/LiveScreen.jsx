import React, { useState, useEffect } from 'react';
    import ReactPlayer from 'react-player';
    import { Loader } from 'lucide-react';

    const LiveScreen = () => {
      const [channels, setChannels] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [playingUrl, setPlayingUrl] = useState(null); // State for the playing URL
      const apiUrl = 'http://sunnahtube.wctrgpbxmn-58e60w2zy3d7.p.temp-site.link/api/live.php';
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;

      useEffect(() => {
        const fetchChannels = async () => {
          try {
            const response = await fetch(proxyUrl);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // Directly use data as the channel list
            setChannels(data);
          } catch (err) {
            setError('Failed to fetch live channels');
            console.error('Error fetching live channels:', err);
          } finally {
            setLoading(false);
          }
        };

        fetchChannels();
      }, []);

      const handleChannelClick = (url) => {
        setPlayingUrl(url); // Set the playing URL when a channel is clicked
      };

      const handleClosePlayer = () => {
        setPlayingUrl(null);
      };

      if (loading) {
        return (
          <div className="quran-screen flex justify-center items-center p-6">
            <Loader className="animate-spin" size={30} />
          </div>
        );
      }

      if (error) {
        return (
          <div className="quran-screen text-center p-4">
            {error}
          </div>
        );
      }

      return (
        <div className="quran-screen p-4">
          <h2 className="text-2xl font-semibold text-center mb-4">Live TV Channels</h2>
          <div className="grid grid-cols-2 gap-4">
            {channels.map((channel, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-4 border rounded-lg shadow-sm cursor-pointer"
                onClick={() => handleChannelClick(channel.url)} // Call handleChannelClick
              >
                <img
                  src={channel.thumbnail}
                  alt={channel.title}
                  className="w-full h-32 object-cover rounded-md mb-2"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/320x180?font=montserrat&text=No+Image'; // Placeholder image
                  }}
                />
                <span className="text-sm font-medium text-gray-800 text-center">{channel.title}</span>
              </div>
            ))}
          </div>

          {/* Fullscreen Video Player */}
          {playingUrl && (
            <div className="fixed inset-0 bg-black z-[1001] flex items-center justify-center">
              <button
                onClick={handleClosePlayer}
                className="absolute top-4 right-4 bg-white text-black p-2 rounded-full"
              >
                X
              </button>
              <ReactPlayer
                url={playingUrl}
                playing={true}
                controls={true}
                width="100%"
                height="100%"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 1001, // Ensure it's above the bottom nav
                  ...(window.innerWidth <= 600 && { // Apply landscape for mobile
                    transform: 'rotate(90deg)',
                    width: '100vh',
                    height: '100vw',
                    top: '50%',
                    left: '50%',
                    transformOrigin: 'center',
                    marginTop: '-50vw',
                    marginLeft: '50vh',
                  }),
                }}
              />
            </div>
          )}
        </div>
      );
    };

    export default LiveScreen;
