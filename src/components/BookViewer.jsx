import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Louder from './louder'; // استيراد مكون Louder

function BookViewer() {
  const { link, title } = useParams();
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
  }, [link, title]);

  let decodedLink = link && link !== 'undefined' ? decodeURIComponent(link) : null;

  // Ensure the link is absolute
  if (decodedLink && !decodedLink.startsWith('http')) {
    decodedLink = `https://elmanafea.shop${decodedLink}`;
  }

  if (!decodedLink) {
    return <div className="error-message">{t('رابط الكتاب غير متوفر')}</div>;
  }

  const googleDocsViewerUrl = `https://docs.google.com/gview?url=${decodedLink}&embedded=true`;

  return (
    <div className="book-viewer-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{decodeURIComponent(title || t('كتاب بدون عنوان'))}</h1>
        <button 
          className="back-button" 
          onClick={() => navigate(-1)} // Navigate back to the previous page
          style={{
            padding: '10px 20px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {t('العودة')}
        </button>
      </div>
      <div className="pdf-viewer" style={{ height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
        {loadingPdf && (
          <div className="loading-message">
            <Louder /> {/* استخدام Louder بدلاً من رسالة التحميل العادية */}
          </div>
        )}
        {error ? (
          <div className="error-message">
            {t('فشل في تحميل الملف')}
          </div>
        ) : (
          <iframe
            src={googleDocsViewerUrl}
            width="100%"
            height="150%"
            className="pdf-embed"
            title="Book Viewer"
            onLoad={() => setLoadingPdf(false)}
            onError={() => {
              setLoadingPdf(false);
              setError(true);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default BookViewer;
