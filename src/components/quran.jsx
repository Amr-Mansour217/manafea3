import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Header from "./header";
import './quran.css';
import axios from 'axios';
import Louder from './louder'; // استيراد مكون Louder

// دالة معالجة أسماء الملفات لتحويل المسافات والحروف غير اللاتينية
const sanitizeFileName = (fileName) => {
  // الحصول على امتداد الملف
  const fileExtension = fileName.split('.').pop();
  
  // تحويل المسافات إلى شرطات سفلية
  let sanitized = fileName.replace(/\s+/g, '_');
  
  // التحقق من وجود حروف غير لاتينية (غير ASCII)
  const hasNonLatinChars = /[^\x00-\x7F]/.test(sanitized);
  
  if (hasNonLatinChars) {
    // إنشاء اسم عشوائي مكون من أحرف وأرقام لاتينية
    const randomString = Math.random().toString(36).substring(2, 10);
    const timestamp = Date.now().toString(36);
    
    // إنشاء الاسم الجديد مع الاحتفاظ بامتداد الملف
    sanitized = `quran_${timestamp}_${randomString}.${fileExtension}`;
  }
  
  return sanitized;
};

function Quran() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [pdfFiles, setPdfFiles] = useState(() => {
    const savedPdfs = localStorage.getItem('pdfFiles');
    return savedPdfs ? JSON.parse(savedPdfs) : {};
  });
  const [uploadError, setUploadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
    ha: "Hausa"
  };

  const loadingMessages = {
    ar: "انتظر تحميل الملف...",
    en: "Please wait while the file is loading...",
    fr: "Veuillez patienter pendant le chargement du fichier...",
    tr: "Dosya yüklenirken lütfen bekleyin...",
    id: "Harap tunggu saat file sedang dimuat...",
    ru: "Пожалуйста, подождите, пока файл загружается...",
    hi: "कृपया फ़ाइल लोड होने तक प्रतीक्षा करें...",
    ur: "براہ کرم فائل کے لوڈ ہونے کا انتظار کریں...",
    bn: "ফাইল লোড হওয়ার জন্য অনুগ্রহ করে অপেক্ষা করুন...",
    zh: "请稍候，文件正在加载...",
    tl: "Mangyaring maghintay habang naglo-load ang file...",
    fa: "لطفاً منتظر بمانید تا فایل بارگذاری شود...",
    ha: "Da fatan za ku jira yayin da ake loda fayil ɗin..."
  };

  const isMobileOrTablet = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestBook();
  }, [i18n.language]);

  useEffect(() => {
    if (!isAdmin && pdfFiles[i18n.language]) {
      openPdf();
    }
  }, [pdfFiles, i18n.language]);

  const openPdf = () => {
    const pdfUrl = pdfFiles[i18n.language]?.startsWith('http')
      ? pdfFiles[i18n.language]
      : `https://elmanafea.shop${pdfFiles[i18n.language]}`;

    if (!pdfUrl) {
      alert('لا يوجد ملف PDF للغة المحددة');
      return;
    }

    window.open(pdfUrl, '_blank');
  };

  const handleFileUpload = async (language, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadError('يرجى اختيار ملف PDF فقط');
      return;
    }

    try {
      // معالجة اسم الملف
      const originalFileName = file.name;
      const sanitizedFileName = sanitizeFileName(originalFileName);
      
      // إنشاء ملف جديد بالاسم المعالج
      const sanitizedFile = new File([file], sanitizedFileName, { type: file.type });
      
      const formData = new FormData();
      formData.append('file', sanitizedFile);
      formData.append('langs', `"${language}"`);
      // احتفظ بالاسم الأصلي للعرض إذا كنت بحاجة إليه
      formData.append('originalFileName', originalFileName);

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
        window.location.reload();
      } else {
        alert(uploadData.message || 'فشل في رفع الملف');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'حدث خطأ أثناء رفع الملف');
      setUploadError(error.response?.data?.message || error.message || 'حدث خطأ أثناء رفع الملف');
    } finally {
      event.target.value = '';
    }
  };

  if (isLoading) {
    return <div><Louder /></div>;
  }

  return (
    <>
      <Header />
      <div className={`quran-container ${!isAdmin ? 'viewer-only' : ''}`}>
        <div className="left-section">
          <div className="loading-message">
            {loadingMessages[i18n.language]}
          </div>
        </div>
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
            <p>
              انتظر تحميل الملف
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default Quran;
