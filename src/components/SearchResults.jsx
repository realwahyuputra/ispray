import React, { useEffect, useRef } from 'react';
    import { ArrowLeft } from 'lucide-react';
    import { useLocation, useNavigate } from 'react-router-dom';

    const SearchResults = ({ onClose }) => {
      const searchResultsRef = useRef(null);
      const scriptRef = useRef(null);
      const location = useLocation();
      const navigate = useNavigate();
      const searchQuery = new URLSearchParams(location.search).get('q') || '';

      useEffect(() => {
        const cx = '010268028161000595287:r9cavnk7mvo';
        const gcse = document.createElement('script');
        gcse.type = 'text/javascript';
        gcse.async = true;
        gcse.src = `https://cse.google.com/cse.js?cx=${cx}`;

        scriptRef.current = gcse;

        const s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(gcse, s);

        gcse.onload = () => {
          const renderSearch = () => {
            if (window.google && window.google.search) {
              // Explicitly render the search box and results
              const searchBoxElement = document.createElement('gcse:searchbox');
              searchBoxElement.setAttribute('data-resultsUrl', '/search');
              searchBoxElement.setAttribute('data-newWindow', 'false');
              searchBoxElement.setAttribute('data-queryParameterName', 'q');
              const searchResultsElement = document.createElement('gcse:searchresults');
              searchResultsElement.setAttribute('data-resultsUrl', '/search');
              searchResultsElement.setAttribute('data-newWindow', 'false');
              searchResultsElement.setAttribute('data-queryParameterName', 'q');

              if (searchResultsRef.current) {
                searchResultsRef.current.innerHTML = ''; // Clear previous content
                searchResultsRef.current.appendChild(searchBoxElement);
                searchResultsRef.current.appendChild(searchResultsElement);
              }

              window.google.search.cse.element.go('search', 'searchresults-only', {
                gname: 'search'
              });

              // Set the search query after rendering
              const searchBox = document.querySelector(".gsc-input");
              if (searchBox) {
                searchBox.value = searchQuery;
              }

              // Trigger a search if a query is present
              if (searchQuery) {
                const searchButton = document.querySelector(".gsc-search-button");
                if (searchButton) {
                  searchButton.click();
                }
              }
            } else {
              setTimeout(renderSearch, 500);
            }
          };
          renderSearch();
        };

        window.__gcse = {
          parsetags: 'explicit',
        };

        return () => {
          if (scriptRef.current && scriptRef.current.parentNode) {
            scriptRef.current.parentNode.removeChild(scriptRef.current);
            scriptRef.current = null;
          }
          if (searchResultsRef.current) {
            searchResultsRef.current.innerHTML = '';
          }
        };
      }, [searchQuery]);

      const handleBack = () => {
        navigate('/');
      };

      return (
        <div className="search-results-container">
          <div className="flex items-center justify-start p-4 border-b">
            <button onClick={handleBack} className="mr-4">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-lg font-semibold">Hasil Pencarian untuk "{searchQuery}"</h2>
          </div>
          <div className="p-4" ref={searchResultsRef}>
          </div>
        </div>
      );
    };

    export default SearchResults;
