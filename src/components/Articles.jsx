import React, { useState, useEffect } from 'react';
    import { ExternalLink, Loader, X } from 'lucide-react';

    const Articles = () => {
      const [articles, setArticles] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [selectedArticle, setSelectedArticle] = useState(null);

      // Function to extract image from content if thumbnail is not available
      const extractImageFromContent = (content) => {
        const div = document.createElement('div');
        div.innerHTML = content;
        const img = div.querySelector('img');
        return img ? img.src : null;
      };

      // Function to parse XML directly
      const parseRSS = async (url) => {
				  try {
				    const response = await fetch(url);
				    if (!response.ok) {
				      throw new Error(`HTTP error! status: ${response.status}`);
				    }
				    const text = await response.text();
				    const parser = new DOMParser();
				    const xmlDoc = parser.parseFromString(text, 'text/xml');
				
				    // Define the namespace resolver
				    const nsResolver = xmlDoc.createNSResolver(xmlDoc.documentElement);
				
				    // Use getElementsByTagNameNS for namespace-aware selection
				    const items = xmlDoc.querySelectorAll('item');
				    const parsedArticles = Array.from(items).map(item => {
				      // For content:encoded
				      const content = item.getElementsByTagNameNS('*', 'encoded')[0]?.textContent || '';
				      
				      // For media:content
				      const mediaContent = item.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'content')[0];
				      const thumbnail = mediaContent?.getAttribute('url') || extractImageFromContent(content);
				      
				      const description = item.querySelector('description')?.textContent || '';
				
				      const article = {
				        title: item.querySelector('title')?.textContent || '',
				        link: item.querySelector('link')?.textContent || '',
				        pubDate: item.querySelector('pubDate')?.textContent || '',
				        content: content,
				        thumbnail: thumbnail || 'https://placehold.co/600x600?font=montserrat&text=Info+Kajian',
				        description: description,
				      };
				      return article;
				    }).slice(0, 10);
				    return parsedArticles;
				  } catch (error) {
				    console.error('Error parsing RSS feed:', error);
				    throw new Error('Failed to parse RSS feed');
				  }
				};

      useEffect(() => {
        const fetchArticles = async () => {
          try {
            setLoading(true);
            const articles = await parseRSS('https://www.rssground.com/services/facebook-rss/67b46cc3c62d8');
            setArticles(articles);
          } catch (err) {
            setError('Gagal memuat artikel');
            console.error('Error fetching articles:', err);
          } finally {
            setLoading(false);
          }
        };

        fetchArticles();
      }, []);

      const openArticleDialog = (article) => {
        setSelectedArticle(article);
      };

      const closeArticleDialog = () => {
        setSelectedArticle(null);
      };

      if (loading) {
        return (
          <div className="flex justify-center items-center p-6">
            <Loader className="animate-spin text-blue-500" size={24} />
          </div>
        );
      }

      if (error) {
        return (
          <div className="text-center p-4">
            {error}
          </div>
        );
      }

      return (
        <div className="articles-section">
          <h2 className="text-xl font-semibold mb-4 px-4">Jadwal Kajian</h2>
          <div className="articles-list">
            {articles.length > 0 ? (
              articles.map((article, index) => (
                <div
                  key={index}
                  onClick={() => openArticleDialog(article)}
                  className="article-card cursor-pointer"
                >
                  <div className="article-content">
                    <div className="article-image">
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/600x600?font=montserrat&text=Info+Kajian';
                        }}
                      />
                      <div className="article-overlay">
                        <ExternalLink size={20} className="text-white" />
                      </div>
                    </div>
                    <div className="article-text">
                      <h3 className="article-title">{article.title}</h3>
                      <p className="article-date">
                        {new Date(article.pubDate).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4">Tidak ada artikel ditemukan.</div>
            )}
          </div>

          {/* Article Dialog */}
          {selectedArticle && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
              <div className="bg-white rounded-lg w-full max-w-2xl p-6 pt-0 relative" style={{ maxHeight: '90vh', maxWidth: '90%', overflowY: 'auto' }}>
                <div className="sticky top-0 bg-white z-10 flex justify-between items-center mb-4 -mx-6 py-2 px-6">
                  <h2 className="text-sm md:text-xl font-semibold">{selectedArticle.title}</h2>
                  <button
                    onClick={closeArticleDialog}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>
                {selectedArticle.thumbnail && (
                  <img
                    src={selectedArticle.thumbnail}
                    alt={selectedArticle.title}
                    className="w-full h-auto mb-4"
                  />
                )}
                <div className="text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: selectedArticle.description }} />
                {/* <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} /> */}
              </div>
            </div>
          )}
        </div>
      );
    };

    export default Articles;
