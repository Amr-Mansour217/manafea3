import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from "./header";
import './quran.css';
import axios from 'axios';

function Quran() {
  const { i18n, t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [pdfFiles, setPdfFiles] = useState(() => {
    const savedPdfs = localStorage.getItem('pdfFiles');
    return savedPdfs ? JSON.parse(savedPdfs) : {
      tr: "https://drive.google.com/file/d/1V0HyOVAkOrtz2yY1VYdZc0dR4R8dGXF9/preview",
      id: "https://drive.google.com/file/d/1-qf38Mpy8Jecq3yBNF-RjIHFfuqUwel2/preview",
      ru: "https://drive.google.com/file/d/1LvI9Kmu5zL9qIKMUMEGTFJvs0L2WdeaX/preview",
      hi: "https://drive.google.com/file/d/1KrQgZikrcutPZIluVIXw_iRDRiPU8dzZ/preview",
      ur: "https://drive.google.com/file/d/1idprM_h9RVn4qIM8sEDzMQzwj9yu-9Ug/preview",
      bn: "https://drive.google.com/file/d/11Zc48u0kXVbXygRKULKXTByWc2gy0GH5/preview",
      zh: "https://drive.google.com/file/d/1rIHTX7fPKXn8dRfuJCGtJsYiUW95wu0x/preview",
      tl: "https://drive.google.com/file/d/10MgsQrx6RX3M2xYuvj5FEd6u22MFSg9-/preview",
      fa: "https://drive.google.com/file/d/1S5Ovsgd5qLALjFLG_DgJ53MNDkUG5W8G/preview",
    };
  });
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const languageNames = {
    ar: "العربية",
    en: "English",
    fr: "Français",
    tr: "Türkçe",
    id: "Bahasa Indonesia",
    ru: "Русский",
    hi: "हिन्दी",
    ur: "اردو",
    bn: "বাংলা",
    zh: "中文",
    tl: "Tagalog",
    fa: "فارسی",
  };

  useEffect(() => {
    const checkAdmin = () => {
      const token = localStorage.getItem('adminToken');
      setIsAdmin(!!token);
    };
    
    checkAdmin();
    window.addEventListener('storage', checkAdmin);
    
    return () => {
      window.removeEventListener('storage', checkAdmin);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('pdfFiles', JSON.stringify(pdfFiles));
  }, [pdfFiles]);

  useEffect(() => {
    const fetchLatestBook = async () => {
      try {
        const response = await axios.get(`https://elmanafea.shop/quran?lang=${i18n.language}`);
        console.log('Response Data:', response.data);
        const books = response.data.books;
        if (books && books.length > 0) {
          const latestBook = books[books.length - 1];
          const { _id, langs, filename, fileUrl } = latestBook;
          setPdfFiles(prev => ({
            ...prev,
            [i18n.language]: fileUrl
          }));
          console.log('Latest Book:', { _id, langs, filename, fileUrl });
        }
      } catch (error) {
        console.error('Error fetching latest book:', error);
      }
    };

    fetchLatestBook();
  }, [i18n.language]);

  const handleFileUpload = async (language, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadError('يرجى اختيار ملف PDF فقط');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('langs', `"${language}"`);

      const response = await axios.post(
        'https://elmanafea.shop/admin/uploadquran',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const uploadData = response.data;
      
      if (uploadData.success) {
        if (uploadData.path) {
          const pdfUrl = `https://elmanafea.shop${uploadData.path}`;
          setPdfFiles(prev => ({
            ...prev,
            [language]: pdfUrl
          }));
        }
      } else {
        throw new Error(uploadData.message || 'فشل في رفع الملف');
      }
    } catch (error) {
      console.error('Error:', error);
      setUploadError(error.response?.data?.message || error.message || 'حدث خطأ أثناء رفع الملف');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <>
      <Header />
      <div className={`quran-container ${!isAdmin ? 'viewer-only' : ''}`}>
        {isAdmin && (
          <div className="language-controls">
            {uploadError && <div className="upload-error">{uploadError}</div>}
            {Object.keys(languageNames).map((lang) => (
              <div key={lang} className="language-item">
                <h3>{languageNames[lang]}</h3>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFileUpload(lang, e)}
                  id={`file-${lang}`}
                  style={{ display: 'none' }}
                  disabled={isUploading}
                />
                <div className="button-group">
                  <label 
                    htmlFor={`file-${lang}`} 
                    className={`upload-btn ${isUploading ? 'uploading' : ''}`}
                  >
                    {isUploading ? 'جاري الرفع...' : 'رفع ملف PDF'}
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="pdf-viewer">
          {loadingPdf ? (
            <div className="loading-message">جاري تحميل الملف...</div>
          ) : pdfFiles[i18n.language] ? (
            console.log('PDF URL:', pdfFiles[i18n.language]),
            <iframe 
              src={`https://elmanafea.shop${pdfFiles[i18n.language]}`}
              width="100%" 
              height="100%" 
              className="pdf-embed"
              onLoad={() => setLoadingPdf(false)}
              onError={() => {
                setLoadingPdf(false);
                setUploadError('فشل في تحميل الملف');
                console.error('Error loading PDF:', pdfFiles[i18n.language]);
              }}
            />
          ) : (
            <div className="no-pdf-message">
              لا يوجد ملف PDF للغة المحددة
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Quran;