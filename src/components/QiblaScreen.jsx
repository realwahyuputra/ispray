import React, { useState, useEffect, useRef } from 'react';
import { Loader, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QiblaScreen = () => {
  const [loading, setLoading] = useState(true);
  const [pointDegree, setPointDegree] = useState(null);
  const compassCircle = useRef(null);
  const myPoint = useRef(null);
  const isIOS =
    navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
    navigator.userAgent.match(/AppleWebKit/);
  const navigate = useNavigate();

  useEffect(() => {
    const startBtn = document.querySelector(".start-btn");

    function init() {
      //startBtn.addEventListener("click", startCompass);
      startCompass();
      navigator.geolocation.getCurrentPosition(locationHandler, (error) => {
        console.error("Error getting location:", error);
        setLoading(false);
      });

      if (!isIOS) {
        window.addEventListener("deviceorientationabsolute", handler, true);
      }
    }

    function startCompass() {
      if (isIOS) {
        DeviceOrientationEvent.requestPermission()
          .then((response) => {
            if (response === "granted") {
              window.addEventListener("deviceorientation", handler, true);
            } else {
              alert("has to be allowed!");
            }
          })
          .catch(() => alert("not supported"));
      }
    }

    function handler(e) {
      let compass = e.webkitCompassHeading || Math.abs(e.alpha - 360);
      if (compassCircle.current) {
        compassCircle.current.style.transform = `translate(-50%, -50%) rotate(${-compass}deg)`;
      }

      // Check if myPoint and pointDegree exist
      if (myPoint.current && pointDegree !== null) {
        // Calculate the difference between current compass direction and Qibla direction
        let diff = compass - pointDegree;
        
        // Normalize the difference to be between -180 and 180 degrees
        diff = (diff + 180) % 360 - 180;
        
        // Take absolute value for the comparison
        diff = Math.abs(diff);

        // Show green indicator when within 15 degrees of Qibla direction
        if (diff <= 15) {
          myPoint.current.style.opacity = '1';
        } else {
          myPoint.current.style.opacity = '0';
        }
      }
    }

    function locationHandler(position) {
      const { latitude, longitude } = position.coords;
      const degree = calcDegreeToPoint(latitude, longitude);
      setPointDegree(degree);

      if (degree < 0) {
        setPointDegree(degree + 360);
      }
      setLoading(false);
    }

    function calcDegreeToPoint(latitude, longitude) {
      // Qibla geolocation
      const point = {
        lat: 21.422487,
        lng: 39.826206
      };

      const phiK = (point.lat * Math.PI) / 180.0;
      const lambdaK = (point.lng * Math.PI) / 180.0;
      const phi = (latitude * Math.PI) / 180.0;
      const lambda = (longitude * Math.PI) / 180.0;
      const psi =
        (180.0 / Math.PI) *
        Math.atan2(
          Math.sin(lambdaK - lambda),
          Math.cos(phi) * Math.tan(phiK) -
          Math.sin(phi) * Math.cos(lambdaK - lambda)
        );
      return Math.round(psi);
    }

    init();

    return () => {
      window.removeEventListener("deviceorientationabsolute", handler);
      window.removeEventListener("deviceorientation", handler);
    };
  }, []);

  const handleBack = () => {
    const homeMenu = document.querySelector('.nav-item[href="/"]');
    if (homeMenu) {
      homeMenu.click();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="qibla-screen flex flex-col items-center justify-center h-full">
      <div className="surah-detail-header" style={{ position: 'fixed', top: 0, left: 0, width: '100%', backgroundColor: '#fff', zIndex: 1000, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee', margin: 0 }}>
        <button onClick={handleBack} className="back-button">
          <ArrowLeft size={24} />
        </button>
        <div className="surah-info">
          <h2 className="text-lg font-semibold text-center">Arah Kiblat</h2>
        </div>
        <div style={{ width: '40px' }}></div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center p-6">
          <Loader className="animate-spin" size={30} />
        </div>
      ) : (
        <>
          <div className="compass relative w-80 h-80" style={{ marginTop: '65px' }}>
            <div className="arrow"></div>
            <div className="compass-circle" ref={compassCircle}></div>
            <div className="my-point" ref={myPoint}></div>
          </div>
          {/* <button className="start-btn">Start compass</button> */}
        </>
      )}
    </div>
  );
};

export default QiblaScreen;
