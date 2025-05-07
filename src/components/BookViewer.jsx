import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BookViewer.css';
import { showToast } from './Toast';
import { useTranslation } from 'react-i18next';
import Header from './header';
import Footer from './footer';
import Louder from './louder';

// كلاس لإدارة الكتب
class BookManager {
  constructor() {
    this.baseURL = 'https://elmanafea.shop';
  }

  async fetchBook(bookId) {
    try {
      const response = await axios.get(`${this.baseURL}/book/${bookId}`);
      
      if (response.status === 200) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: false,
        message: 'Failed to fetch book'
      };
    } catch (error) {
      console.error('Error fetching book:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch book'
      };
    }
  }

  async fetchBookContent(bookId, page = 1) {
    try {
      const response = await axios.get(`${this.baseURL}/book/${bookId}/page/${page}`);
      
      if (response.status === 200) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: false,
        message: 'Failed to fetch book content'
      };
    } catch (error) {
      console.error('Error fetching book content:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch book content'
      };
    }
  }
}

// كلاس للتعامل مع تفضيلات المستخدم وحالة القراءة
class UserPreferencesManager {
  saveFontSize(size) {
    localStorage.setItem('bookFontSize', size.toString());
  }

  getFontSize() {
    return parseInt(localStorage.getItem('bookFontSize') || '18');
  }

  saveTheme(theme) {
    localStorage.setItem('bookTheme', theme);
  }

  getTheme() {
    return localStorage.getItem('bookTheme') || 'light';
  }

  saveReadingProgress(bookId, page) {
    const progress = JSON.parse(localStorage.getItem('readingProgress') || '{}');
    progress[bookId] = page;
    localStorage.setItem('readingProgress', JSON.stringify(progress));
  }

  getReadingProgress(bookId) {
    const progress = JSON.parse(localStorage.getItem('readingProgress') || '{}');
    return progress[bookId] || 1;
  }
}

function BookViewer() {
  const { t } = useTranslation();
  const { bookId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // إنشاء كائنات المدراء
  const bookManager = new BookManager();
  const prefsManager = new UserPreferencesManager();
  
  // حالة الكتاب
  const [book, setBook] = useState(null);
  const [content, setContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // حالة تفضيلات المستخدم
  const [fontSize, setFontSize] = useState(prefsManager.getFontSize());
  const [theme, setTheme] = useState(prefsManager.getTheme());
  const [isLoading, setIsLoading] = useState(true);

  // جلب معلومات الكتاب عند التحميل
  useEffect(() => {
    const loadBook = async () => {
      setIsLoading(true);
      
      try {
        const result = await bookManager.fetchBook(bookId);
        
        if (result.success) {
          setBook(result.data);
          setTotalPages(result.data.totalPages || 1);
          
          // استرجاع آخر صفحة قرأها المستخدم
          const lastPage = prefsManager.getReadingProgress(bookId);
          setCurrentPage(lastPage);
          
          // جلب محتوى الكتاب
          const contentResult = await bookManager.fetchBookContent(bookId, lastPage);
          if (contentResult.success) {
            setContent(contentResult.data.content);
          } else {
            showToast.error(contentResult.message);
          }
        } else {
          showToast.error(result.message);
        }
      } catch (error) {
        console.error('Error loading book:', error);
        showToast.error('حدث خطأ أثناء تحميل الكتاب');
      } finally {
        setIsLoading(false);
      }
    };

    loadBook();
  }, [bookId]);

  // تحميل محتوى الصفحة عند تغيير الصفحة الحالية
  useEffect(() => {
    const loadPageContent = async () => {
      if (!bookId || !currentPage) return;
      
      setIsLoading(true);
      
      try {
        const result = await bookManager.fetchBookContent(bookId, currentPage);
        
        if (result.success) {
          setContent(result.data.content);
          prefsManager.saveReadingProgress(bookId, currentPage);
        } else {
          showToast.error(result.message);
        }
      } catch (error) {
        console.error('Error loading page content:', error);
        showToast.error('حدث خطأ أثناء تحميل محتوى الصفحة');
      } finally {
        setIsLoading(false);
      }
    };

    loadPageContent();
  }, [currentPage, bookId]);

  // حفظ تفضيلات المستخدم عند تغييرها
  useEffect(() => {
    prefsManager.saveFontSize(fontSize);
  }, [fontSize]);

  useEffect(() => {
    prefsManager.saveTheme(theme);
  }, [theme]);

  // التنقل بين الصفحات
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePageChange = (e) => {
    const page = parseInt(e.target.value);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // تغيير حجم الخط
  const increaseFontSize = () => {
    if (fontSize < 32) {
      setFontSize(prevSize => prevSize + 2);
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 12) {
      setFontSize(prevSize => prevSize - 2);
    }
  };

  // تغيير المظهر
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // العودة للصفحة السابقة
  const handleGoBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };

  if (isLoading) {
    return <div><Louder /></div>;
  }

  return (
    <div className={`book-viewer-container ${theme}`}>
      <Header />
      
      <div className="book-viewer-content">
        {book && (
          <div className="book-header">
            <h1>{book.title}</h1>
            <div className="book-info">
              <p>{book.author}</p>
              <p>{book.category}</p>
            </div>
          </div>
        )}
        
        <div className="book-controls">
          <button onClick={handleGoBack} className="back-button">
            {t('العودة')}
          </button>
          
          <div className="page-navigation">
            <button 
              onClick={goToPreviousPage} 
              disabled={currentPage === 1}
              className="page-nav-btn"
            >
              {t('السابق')}
            </button>
            
            <div className="page-indicator">
              <input
                type="number"
                value={currentPage}
                onChange={handlePageChange}
                min="1"
                max={totalPages}
                className="page-input"
              />
              <span>/ {totalPages}</span>
            </div>
            
            <button 
              onClick={goToNextPage} 
              disabled={currentPage === totalPages}
              className="page-nav-btn"
            >
              {t('التالي')}
            </button>
          </div>
          
          <div className="reading-preferences">
            <button onClick={decreaseFontSize} className="font-size-btn">A-</button>
            <button onClick={increaseFontSize} className="font-size-btn">A+</button>
            <button onClick={toggleTheme} className="theme-btn">
              {theme === 'light' ? t('وضع الظلام') : t('وضع النهار')}
            </button>
          </div>
        </div>
        
        <div 
          className="book-content"
          style={{ 
            fontSize: `${fontSize}px`,
            backgroundColor: theme === 'light' ? '#ffffff' : '#121212',
            color: theme === 'light' ? '#333333' : '#e0e0e0'
          }}
        >
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <p>{t('لا يوجد محتوى متاح لهذه الصفحة.')}</p>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default BookViewer;