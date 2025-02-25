import React, { useRef } from 'react';
    import { X, ArrowLeft, RefreshCw } from 'lucide-react';
    import { useNavigate } from 'react-router-dom';

    const IframeScreen = ({ url, onClose, title }) => {
      const navigate = useNavigate();
      const iframeRef = useRef(null); // Ref for the iframe element

      const handleBack = () => {
        onClose();
        navigate('/'); // Navigate back to the home screen
      };

      const handleClose = () => {
        onClose();
        navigate('/'); // Navigate back to the home screen
      };

      const handleReload = () => {
        if (iframeRef.current) {
          iframeRef.current.contentWindow.location.reload(); // Reload the iframe
        }
      };

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* Header */}
            <div className="surah-detail-header" style={{ position: 'absolute', top: 0, left: 0, width: '100%', backgroundColor: '#fff', zIndex: 1000, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
              <button onClick={handleBack} className="back-button">
                <ArrowLeft size={24} />
              </button>
              <div className="surah-info">
                <h2 className="text-lg font-semibold">{title || 'Konten'}</h2>
              </div>
              <button
                onClick={handleReload}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <RefreshCw size={24} />
              </button>
            </div>
            <iframe
              ref={iframeRef} // Attach the ref to the iframe
              src={url}
              title="Iframe Content"
              className="w-full h-full"
              style={{ marginTop: '65px' }} // Adjust margin to accommodate the header
            />
          </div>
        </div>
      );
    };

    export default IframeScreen;
