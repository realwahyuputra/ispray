import React, { useState, useEffect, useRef } from 'react';
    import ReactPlayer from 'react-player';
    import { Loader, ArrowLeft, RefreshCw } from 'lucide-react'; // Import ArrowLeft and RefreshCw
    import { useNavigate } from 'react-router-dom'; // Import useNavigate

    const LiveScreen = () => {
      const [channels, setChannels] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [playingUrl, setPlayingUrl] = useState(null); // State for the playing URL
      const apiUrl = 'http://sunnahtube.wctrgpbxmn-58e60w2zy3d7.p.temp-site.link/api/live.php';
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
      const playerContainerRef = useRef(null); // Ref for the player container
      const isMountedRef = useRef(true); // Ref to track if the component is mounted
      const navigate = useNavigate(); // Initialize useNavigate
      const [isReloading, setIsReloading] = useState(false); // State for reload loading

      const fetchChannels = async () => {
        try {
          setIsReloading(true); // Start reloading
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
          setIsReloading(false); // Stop reloading
        }
      };

      useEffect(() => {
        fetchChannels();

        return () => {
          isMountedRef.current = false; // Set to false when the component unmounts
        };
      }, []);

      const handleChannelClick = (url) => {
        setPlayingUrl(url); // Set the playing URL when a channel is clicked
        if (playerContainerRef.current) {
          if (playerContainerRef.current.requestFullscreen) {
            playerContainerRef.current.requestFullscreen();
          } else if (playerContainerRef.current.mozRequestFullScreen) { /* Firefox */
            playerContainerRef.current.mozRequestFullScreen();
          } else if (playerContainerRef.current.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            playerContainerRef.current.webkitRequestFullscreen();
          } else if (playerContainerRef.current.msRequestFullscreen) { /* IE/Edge */
            playerContainerRef.current.msRequestFullscreen();
          }
        }
      };

      const handleClosePlayer = () => {
        setPlayingUrl(null);
        if (isMountedRef.current && document) { // Check if component is mounted and document is available
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
          } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
          }
        }
      };

      const handleBack = () => {
        navigate('/'); // Navigate back to the home screen
      };

      const handleReload = () => {
        fetchChannels(); // Call the fetchChannels function to reload the data
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
          <div className="flex items-center justify-between mb-4">
            <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-100">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-lg font-semibold text-center">Live Dakwah</h2>
            <button onClick={handleReload} className="p-2 rounded-full hover:bg-gray-100">
              {isReloading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <RefreshCw size={24} />
              )}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4"> {/* Adjusted grid columns */}
            {channels.map((channel, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-4 border rounded-lg shadow-sm cursor-pointer bg-white" // Added bg-white
                onClick={() => handleChannelClick(channel.url)} // Call handleChannelClick
              >
                <img
                  src={channel.thumbnail}
                  alt={channel.title}
                  className="w-full aspect-square object-cover rounded-md mb-2" // Changed height to create a square
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
            <div
              className="fixed inset-0 bg-black z-[1001] flex items-center justify-center"
              ref={playerContainerRef} // Attach the ref to the container
            >
              <button
                onClick={handleClosePlayer}
                className="absolute bottom-4 md:top-4 right-4 bg-white text-black p-2 rounded-full size-[40px]"
                style={{
                  zIndex: 10001,
                }}
              >
                ✕
              </button>
              <ReactPlayer
                url={playingUrl}
                playing={true}
                controls={false} // Hide controls
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
									width: '100%',
									height: '100%',
                  zIndex: 1001, // Ensure it's above the bottom nav
                  ...(window.innerWidth <= 600 && { // Apply landscape for mobile
                    transform: 'rotate(90deg)',
                    width: '100vh',
                    height: '100vw',
										top: 'auto',
										left: 'auto',
                    transformOrigin: 'center',
                  }),
                }}
                config={{
                  youtube: {
                    playerVars: {
                      origin: window.location.origin, // Important for YouTube
                      controls: 0, // Hide controls
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
      );
    };

    export default LiveScreen;
