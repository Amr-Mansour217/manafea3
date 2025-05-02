import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from "./header";
import './quran.css';
import axios from 'axios';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

function Quran() {
  const { i18n, t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [pdfFiles, setPdfFiles] = useState(() => {
    const savedPdfs = localStorage.getItem('pdfFiles');
    return savedPdfs ? JSON.parse(savedPdfs) : {};
  });
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
    ha: "Hausa" // Added Hausa language
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
        const books = response.data.books;
        if (books && books.length > 0) {
          const latestBook = books[books.length - 1];
          setPdfFiles(prev => ({
            ...prev,
            [i18n.language]: latestBook.fileUrl
          }));
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
      if (uploadData.success && uploadData.path) {
        const pdfUrl = `https://elmanafea.shop${uploadData.path}`;
        setPdfFiles(prev => ({
          ...prev,
          [language]: pdfUrl
        }));
        alert('تم رفع الملف بنجاح');
        window.location.reload(); // Reload the page after successful upload
      } else {
        // Handle cases where the response indicates failure
        alert(uploadData.message || 'فشل في رفع الملف');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء رفع الملف'); // Alert for failure
      setUploadError(error.response?.data?.message || error.message || 'حدث خطأ أثناء رفع الملف');
    } finally {
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
                />
                <div className="button-group">
                  <label htmlFor={`file-${lang}`} className="upload-btn">
                    رفع ملف PDF
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="pdf-viewer">
          {pdfFiles[i18n.language] ? (
            <Worker workerUrl={`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`}>
              <Viewer
                fileUrl={pdfFiles[i18n.language]?.startsWith('http') ? pdfFiles[i18n.language] : `https://elmanafea.shop${pdfFiles[i18n.language]}`}
              />
            </Worker>
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