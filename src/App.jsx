import './App.css';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDirection } from './components/i18n';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from './components/home';
import Videos from './components/video';
import Quran from './components/quran';
import Intre from "./components/intre";
import Pdf from "./components/pdf";
import Apps from './components/apps';
import Another from './components/another';
import Louder from './components/louder';
import Form from './components/admin';
import Rehla from './components/rehla';
import Mosabaqa from './components/mosabaqa';
import BookViewer from './components/BookViewer';
import Toast from './components/Toast'; // استيراد مكون Toast

function App() {
  const { i18n } = useTranslation();
  const [direction, setDirection] = useState(getDirection(i18n.language));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeLanguage = async () => {
      // Supported languages
      const supportedLangs = ['ar', 'en'];
      let storedLang = localStorage.getItem('i18nextLng');
      let langToUse = storedLang || i18n.language || 'ar';
      // If the language is not supported, default to 'ar'
      if (!supportedLangs.includes(langToUse.split('-')[0])) {
        langToUse = 'ar';
        localStorage.setItem('i18nextLng', 'ar');
      } else {
        // Always use the base language (e.g., 'en' instead of 'en-GB')
        langToUse = langToUse.split('-')[0];
        localStorage.setItem('i18nextLng', langToUse);
      }
      await i18n.changeLanguage(langToUse);
      const newDirection = getDirection(langToUse);
      setDirection(newDirection);
      document.documentElement.dir = newDirection;
      document.documentElement.lang = langToUse;
      setIsLoading(false);
    };

    initializeLanguage();
  }, []);

  useEffect(() => {
    const handleLanguageChange = () => {
      const newDirection = getDirection(i18n.language);
      setDirection(newDirection);
      document.documentElement.dir = newDirection;
      document.documentElement.lang = i18n.language;
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  if (isLoading) {
    return <div>{<Louder />}</div>; 
  }
  
  return (
    <div dir={direction}>
      <Toast /> {/* إضافة مكون Toast هنا لكي يظهر في كل الصفحات */}
      <Router basename={import.meta.env.BASE_URL}> 
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/quran" element={<Quran />} />
          <Route path="/library" element={<Intre />} />
          <Route path="/bigarabicquran" element={<Pdf />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/anotherweb" element={<Another />} />
          <Route path="/admin" element={<Form />} />
          <Route path="/rehlatAlHag" element={<Rehla />} />
          <Route path="/mosabaqatManafea" element={<Mosabaqa />} />
          <Route path="/book-viewer/:link/:title" element={<BookViewer />} />
        </Routes>
      </Router>
    </div>
  );
};   

export default App;
