import React, { useState, useEffect, useRef } from 'react';
import './header.css';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import Logo from './imgs/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faChevronDown, faBars, faTimes, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { changeLanguage } from './i18n';

function Header() {
  const { t, i18n } = useTranslation();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [navItems] = useState([
    { path: "/", text: "الرئيسية" },
    { path: "/videos", text: "الفيديوهات" },
    { path: "/quran", text: "القرآن الكريم" },
    { path: "/library", text: "الملفات التفاعلية" },
    { path: "/apps", text: "تطبيقات إسلامية" },
    { path: "/anotherweb", text: "مواقع إسلامية أخرى" },
    { path: "/rehlatAlHag", text: "رحلة الحج" },
    { path: "/mosabaqatManafea", text: "مسابقة منافع" },
  ]);
  const [scrollingItems, setScrollingItems] = useState(() => {
    const saved = localStorage.getItem('scrollingItems');
    return saved ? JSON.parse(saved) : {
      ar: ["بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ"],
      en: ["In the name of Allah, the Most Gracious, the Most Merciful"],
      fr: ["Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux"],
      tr: ["Allah'ın adıyla, En Merhametli, En Şefkatli"],
      id: ["Dengan nama Allah Yang Maha Pengasih, Maha Penyayang"],
      ru: ["Во имя Аллаха, Милостивого, Милосердного"],
      hi: ["अल्लाह के नाम से जो बड़ा कृपालु, अत्यंत दयावान है"],
      ur: ["اللہ کے نام سے جو نہایت مہربان رحم والا ہے"],
      bn: ["পরম করুণাময়, অতি দয়ালু আল্লাহর নামে"],
      zh: ["奉至仁至慈的安拉之名"],
      tl: ["Sa ngalan ni Allah, ang Pinakamahabagin, ang Pinakamaawain"],
      fa: ["به نام خداوند بخشنده مهربان"]
    };
  });
  const [isScrollingModalOpen, setIsScrollingModalOpen] = useState(false);
  const [scrollingEditValue, setScrollingEditValue] = useState("");
  const [editingScrollingIndex, setEditingScrollingIndex] = useState(null);
  const languageRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    setIsAdmin(!!adminToken);
  }, []);

  useEffect(() => {
    localStorage.setItem('scrollingItems', JSON.stringify(scrollingItems));
  }, [scrollingItems]);

  const toggleLanguageMenu = () => {
    setIsLanguageOpen(!isLanguageOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLanguageChange = async (lng) => {
    await changeLanguage(lng);
    setIsLanguageOpen(false);
  };

  const handleAddScrollingItem = () => {
    const currentLang = i18n.language;
    if (scrollingEditValue.trim()) {
      setScrollingItems(prev => {
        const currentLangTexts = prev[currentLang] || [];
        const updated = {
          ...prev,
          [currentLang]: [...currentLangTexts, scrollingEditValue.trim()]
        };
        localStorage.setItem('scrollingItems', JSON.stringify(updated));
        return updated;
      });
      setScrollingEditValue("");
    }
  };

  const handleEditScrollingItem = (index) => {
    const currentLang = i18n.language;
    setEditingScrollingIndex(index);
    setScrollingEditValue(scrollingItems[currentLang][index]);
  };

  const handleUpdateScrollingItem = () => {
    const currentLang = i18n.language;
    if (editingScrollingIndex !== null && scrollingEditValue.trim()) {
      setScrollingItems(prev => {
        const updated = {
          ...prev,
          [currentLang]: prev[currentLang].map((item, index) => 
            index === editingScrollingIndex ? scrollingEditValue.trim() : item
          )
        };
        localStorage.setItem('scrollingItems', JSON.stringify(updated));
        return updated;
      });
      setEditingScrollingIndex(null);
      setScrollingEditValue("");
    }
  };

  const handleDeleteScrollingItem = (index) => {
    const currentLang = i18n.language;
    setScrollingItems(prev => {
      const updated = {
        ...prev,
        [currentLang]: prev[currentLang].filter((_, i) => i !== index)
      };
      localStorage.setItem('scrollingItems', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <>
      <header className={i18n.dir()}>
        <div className="header-pattern"></div>
        <div className="top-nav">
          <div className="logo-container">
            <div className="scroll-container">
              <div className="scroll-track">
                {scrollingItems[i18n.language]?.map((text, index) => (
                  <div 
                    key={index} 
                    className="scroll-item"
                    style={{
                      animationDelay: `${index * 2}s`
                    }}
                  >
                    {text}
                  </div>
                ))}
              </div>
            </div>
            
            {isAdmin && (
              <FontAwesomeIcon 
                icon={faEllipsisVertical} 
                className="edit-icon scroll-edit-icon"
                onClick={() => setIsScrollingModalOpen(true)}
              />
            )}
            
            <Link to="/" className="logo-link">
              <img src={Logo} alt="منافع" className="logo" draggable="false"/>
            </Link>
          </div>
        </div>
        <nav className="main-nav">
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
          </button>
          <ul className={`nav-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t(item.text)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="language-dropdown" ref={languageRef}>
            <button className="language-btn" onClick={toggleLanguageMenu}>
              <FontAwesomeIcon icon={faGlobe} />
              {t('العربية')}
              <FontAwesomeIcon icon={faChevronDown} />
            </button>
            <div className={`language-content ${isLanguageOpen ? 'show' : ''}`}>
              <a onClick={() => handleLanguageChange('ar')}>العربية</a>
              <a onClick={() => handleLanguageChange('en')}>English</a>
              <a onClick={() => handleLanguageChange('fr')}>Français</a>
              <a onClick={() => handleLanguageChange('tr')}>Türkçe</a>
              <a onClick={() => handleLanguageChange('id')}>Bahasa</a>
              <a onClick={() => handleLanguageChange('ru')}>русский</a>
              <a onClick={() => handleLanguageChange('hi')}>हिंदी</a>
              <a onClick={() => handleLanguageChange('ur')}>اردو</a>
              <a onClick={() => handleLanguageChange('bn')}>বাংলা</a>
              <a onClick={() => handleLanguageChange('zh')}>中国人</a>
              <a onClick={() => handleLanguageChange('tl')}>filipino</a>
              <a onClick={() => handleLanguageChange('fa')}>فارسی</a>
            </div>
          </div>
        </nav>
      </header>

      {isScrollingModalOpen && (
        <div className="edit-modal-overlay">
          <div className="edit-modal scrolling-modal">
            <h3>إدارة النصوص المتحركة - {i18n.language.toUpperCase()}</h3>
            
            <div className="scrolling-items-list">
              {scrollingItems[i18n.language]?.map((item, index) => (
                <div key={index} className="scrolling-item">
                  <span>{item}</span>
                  <div className="item-actions">
                    <FontAwesomeIcon 
                      icon={faPenToSquare}
                      className="edit-btn"
                      onClick={() => handleEditScrollingItem(index)}
                    />
                    <FontAwesomeIcon 
                      icon={faTrash}
                      className="delete-btn"
                      onClick={() => handleDeleteScrollingItem(index)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="add-scrolling-item">
              <input
                type="text"
                value={scrollingEditValue}
                onChange={(e) => setScrollingEditValue(e.target.value)}
                placeholder={`أدخل نصاً جديداً (${i18n.language})`}
                className="edit-input"
              />
              {editingScrollingIndex !== null ? (
                <button onClick={handleUpdateScrollingItem} className="save-btn">
                  تحديث
                </button>
              ) : (
                <button onClick={handleAddScrollingItem} className="save-btn">
                  إضافة
                </button>
              )}
            </div>

            <button 
              onClick={() => setIsScrollingModalOpen(false)} 
              className="cancel-btn"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;