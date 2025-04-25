import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './BookViewer.css';

const BookViewer = () => {
  const { bookUrl, title } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // تنظيف وفك تشفير المسار
  const cleanUrl = (url) => {
    try {
      // إزالة أي تشفير مزدوج
      let cleaned = decodeURIComponent(decodeURIComponent(url));
      // التأكد من أن المسار يبدأ بـ /
      if (!cleaned.startsWith('/')) {
        cleaned = '/' + cleaned;
      }
      return cleaned;
    } catch (e) {
      console.error('Error decoding URL:', e);
      return url;
    }
  };

  const decodedUrl = cleanUrl(bookUrl);
  const decodedTitle = decodeURIComponent(title);
  const fullUrl = `https://elmanafea.shop${decodedUrl}`;

  useEffect(() => {
    const objectElement = document.querySelector('.book-viewer-iframe');
    if (objectElement) {
      objectElement.onload = () => {
        setLoading(false);
        setError(null);
      };
      objectElement.onerror = () => {
        setLoading(false);
        setError('حدث خطأ في تحميل الملف. يرجى المحاولة مرة أخرى.');
      };
    }

    // تنظيف عند إزالة المكون
    return () => {
      if (objectElement) {
        objectElement.onload = null;
        objectElement.onerror = null;
      }
    };
  }, [fullUrl]);

  return (
    <div className="book-viewer-container">
      <div className="book-viewer-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> العودة
        </button>
        <h1>{decodedTitle}</h1>
      </div>
      <div className="book-viewer-content">
        {loading && (
          <div className="loading-spinner">
            جاري تحميل الكتاب...
          </div>
        )}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <object
          data={fullUrl}
          type="application/pdf"
          className="book-viewer-iframe"
          aria-label={decodedTitle}
        >
          <p>
            متصفحك لا يدعم عرض ملفات PDF. يمكنك{' '}
            <a href={fullUrl} target="_blank" rel="noopener noreferrer">
              تحميل الملف
            </a>{' '}
            لعرضه.
          </p>
        </object>
      </div>
    </div>
  );
};

export default BookViewer; 