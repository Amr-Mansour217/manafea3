import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import Header from './header';
import './another.css';
import Footer from './footer';
import axios from 'axios';
import { showToast } from './Toast';
import Louder from './louder';

// كلاس لإدارة المواقع
class WebsiteManager {
  constructor(i18n, showToast) {
    this.i18n = i18n;
    this.showToast = showToast;
    this.baseURL = 'https://elmanafea.shop';
  }

  normalizeUrl(url) {
    if (!url) return '';
    url = url.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  }

  getFaviconUrl(websiteUrl) {
    return `https://www.google.com/s2/favicons?domain=${websiteUrl}&sz=64`;
  }

  async fetchWebsites() {
    try {
      
      const timestamp = new Date().getTime();
      const response = await axios.get(`${this.baseURL}/websites?_t=${timestamp}`);

      let websitesData = [];
      
      if (Array.isArray(response.data)) {
        websitesData = response.data.map(site => ({
          id: site._id,
          name: site.name,
          url: site.url
        }));
      } else if (response.data && typeof response.data === 'object') {
        const possibleArrayData = Object.values(response.data).find(val => Array.isArray(val));
        if (possibleArrayData) {
          websitesData = possibleArrayData.map(site => ({
            id: site._id || site.id,
            name: site.name || site.title,
            url: site.url
          }));
        }
      }
      
      return websitesData;

    } catch (error) {
      this.showToast.error(this.i18n.t('حدث خطأ في جلب المواقع'));
      return [];
    }
  }

  async addWebsite(newWebsite) {
    if (!newWebsite.name || !newWebsite.url) {
      this.showToast.error(this.i18n.t('من فضلك أدخل جميع البيانات المطلوبة'));
      return false;
    }

    try {
      const formattedUrl = this.normalizeUrl(newWebsite.url);
      
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        this.showToast.error(this.i18n.t('يرجى تسجيل الدخول كمشرف أولاً'));
        return false;
      }
      
      const response = await axios.post(`${this.baseURL}/admin/addwebsite`, {
        name: newWebsite.name,
        url: formattedUrl,
        language: this.i18n.language
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });


      if (response.status >= 200 && response.status < 300) {
        this.showToast.success(this.i18n.t('تمت الإضافة بنجاح'));
        return true;
      }
      
      return false;
    } catch (error) {
      
      if (error.response && error.response.data && error.response.data.message) {
        this.showToast.error(this.i18n.t(error.response.data.message));
      } else {
        this.showToast.error(this.i18n.t('حدث خطأ في إضافة الموقع'));
      }
      
      return false;
    }
  }

  async updateWebsite(editingWebsite) {
    if (!editingWebsite.name || !editingWebsite.url) {
      this.showToast.error(this.i18n.t('من فضلك أدخل جميع البيانات المطلوبة'));
      return false;
    }

    const formattedUrl = this.normalizeUrl(editingWebsite.url);
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        this.showToast.error(this.i18n.t('يرجى تسجيل الدخول كمشرف أولاً'));
        return false;
      }

      
      const response = await axios({
        method: 'put',
        url: `${this.baseURL}/admin/updatewebsites/${editingWebsite.id}`,
        data: {
          name: editingWebsite.name,
          url: formattedUrl,
          lang: this.i18n.language
        },
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });


      if (response.status === 200) {
        this.showToast.edited(this.i18n.t('تم التعديل بنجاح'));
        return { ...editingWebsite, url: formattedUrl };
      } else {
        throw new Error('فشل في تحديث الموقع');
      }
    } catch (error) {
      this.showToast.error(this.i18n.t(error.response?.data?.message || 'حدث خطأ في تحديث الموقع'));
      return false;
    }
  }

  async deleteWebsite(website) {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        this.showToast.error(this.i18n.t('يرجى تسجيل الدخول كمشرف أولاً'));
        return false;
      }

      const response = await axios.delete(`${this.baseURL}/admin/deletewebsites/${website.id}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.status !== 200) {
        throw new Error('فشل في حذف الموقع');
      }
      
      this.showToast.deleted(this.i18n.t('تم الحذف بنجاح'));
      return true;
    } catch (error) {
      this.showToast.error(this.i18n.t(error.message));
      return false;
    }
  }
}

// كلاس لإدارة نصوص الصفحة
class TextManager {
  constructor(i18n, showToast) {
    this.i18n = i18n;
    this.showToast = showToast;
    this.baseURL = 'https://elmanafea.shop';
  }

  async fetchWebsiteHeader() {
    try {
      const currentLang = this.i18n.language;
      const response = await axios.get(`${this.baseURL}/websitesheader?lang=${currentLang}`);
      
      // Check different possible response structures
      if (response.data?.title) {
        return response.data.title;
      } else if (response.data?.header?.title) {
        return response.data.header.title;
      } else if (typeof response.data === 'string') {
        return response.data;
      }
      
      return "مكتبة المواقع الإسلامية"; // Default title as fallback
    } catch (error) {
      this.showToast.error(this.i18n.t('حدث خطأ في جلب العنوان'));
      return "مكتبة المواقع الإسلامية"; // Default title even on error
    }
  }

  async fetchWebsiteSecondHeader() {
    try {
      const currentLang = this.i18n.language;
      const response = await axios.get(`${this.baseURL}/websecondheader?lang=${currentLang}`);
      
      if (response.data?.second_header?.title) {
        return response.data.second_header.title;
      }
      return null;
    } catch (error) {
      this.showToast.error(this.i18n.t('حدث خطأ في جلب الوصف'));
      return null;
    }
  }

  async updateText(editingField, tempText) {
    if (!tempText) {
      this.showToast.error(this.i18n.t('من فضلك أدخل النص'));
      return false;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        this.showToast.error(this.i18n.t('يرجى تسجيل الدخول كمشرف أولاً'));
        return false;
      }

      const currentLang = this.i18n.language;
      
      if (editingField === 'title') {
        const response = await axios({
          method: 'post',
          url: `${this.baseURL}/admin/head`,
          data: {
            title: tempText,
            lang: currentLang
          },
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        
        if (response.status === 200) {
          this.showToast.success(this.i18n.t('تمت العملية بنجاح'));
          return true;
        }
      } else if (editingField === 'description') {
        const response = await axios({
          method: 'post',
          url: `${this.baseURL}/admin/websecondheader`,
          data: {
            title: tempText,  
            lang: currentLang 
          },
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        
        if (response.status === 200) {
          this.showToast.success(this.i18n.t('تمت العملية بنجاح'));
          return true;
        }
      }
      
      return false;
    } catch (error) {
      this.showToast.error(this.i18n.t(error.response?.data?.message || 'حدث خطأ في تحديث النص'));
      return false;
    }
  }
}

function Another() {
  const { t, i18n } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // إنشاء مدراء الصفحة
  const websiteManager = new WebsiteManager(i18n, showToast);
  const textManager = new TextManager(i18n, showToast);

  // حالة الصفحة
  const [websites, setWebsites] = useState(() => {
    const savedWebsites = localStorage.getItem('websites');
    return savedWebsites ? JSON.parse(savedWebsites) : [];
  });

  const [texts, setTexts] = useState(() => {
    const savedTexts = localStorage.getItem('anotherTexts');
    return savedTexts ? JSON.parse(savedTexts) : {
      ar: {
        title: 'مكتبة المواقع الإسلامية', // Add default title here
        description: 'مجموعة مميزة من المواقع الإسلامية المفيدة'
      },
      en: {
        title: 'Islamic Websites Library', // Add default title here
        description: 'A collection of useful Islamic websites'
      }
    };
  });

  const [editingField, setEditingField] = useState(null);
  const [tempText, setTempText] = useState('');

  const [editingWebsite, setEditingWebsite] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWebsite, setNewWebsite] = useState({
    name: '',
    url: ''
  });

  const [websiteToDelete, setWebsiteToDelete] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      const token = localStorage.getItem('adminToken');
      setIsAdmin(!!token);
    };
    checkAdmin();
    window.addEventListener('storage', checkAdmin);
    return () => window.removeEventListener('storage', checkAdmin);
  }, []);

  useEffect(() => {
    localStorage.setItem('websites', JSON.stringify(websites));
  }, [websites]);

  useEffect(() => {
    localStorage.setItem('anotherTexts', JSON.stringify(texts));
  }, [texts]);

  const fetchWebsites = async () => {
    const websitesData = await websiteManager.fetchWebsites();
    setWebsites(websitesData);
    localStorage.setItem('websites', JSON.stringify(websitesData));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchWebsites();
    // Add fetchPageTexts here to ensure titles load on component mount
    fetchPageTexts();
  }, []);

  const handleAddWebsite = async () => {
    const success = await websiteManager.addWebsite(newWebsite);
    
    if (success) {
      setShowAddModal(false);
      setNewWebsite({ name: '', url: '' });
      fetchWebsites();
    }
  };

  const handleUpdateWebsite = async () => {
    const updatedSite = await websiteManager.updateWebsite(editingWebsite);
    
    if (updatedSite) {
      setWebsites(prevWebsites => {
        const updatedWebsites = prevWebsites.map(site => 
          site.id === editingWebsite.id ? updatedSite : site
        );
        
        localStorage.setItem('websites', JSON.stringify(updatedWebsites));
        return updatedWebsites;
      });
      
      setEditingWebsite(null);
    }
  };

  const handleDeleteWebsite = (website) => {
    setWebsiteToDelete(website);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteWebsite = async () => {
    const success = await websiteManager.deleteWebsite(websiteToDelete);
    
    if (success) {
      setShowDeleteConfirmModal(false);
      setWebsiteToDelete(null);
      fetchWebsites();
    }
  };

  const handleUpdateText = async () => {
    const success = await textManager.updateText(editingField, tempText);
    
    if (success) {
      if (editingField === 'title') {
        const title = await textManager.fetchWebsiteHeader();
        if (title) {
          setTexts(prevTexts => ({
            ...prevTexts,
            [i18n.language]: {
              ...prevTexts[i18n.language],
              title
            }
          }));
        }
      } else if (editingField === 'description') {
        const description = await textManager.fetchWebsiteSecondHeader();
        if (description) {
          setTexts(prevTexts => ({
            ...prevTexts,
            [i18n.language]: {
              ...prevTexts[i18n.language],
              description
            }
          }));
        }
      } else {
        setTexts({
          ...texts,
          [i18n.language]: {
            ...texts[i18n.language],
            [editingField]: tempText
          }
        });
      }
      
      setEditingField(null);
      setTempText('');
    }
  };

  const fetchPageTexts = async () => {
    try {
      const title = await textManager.fetchWebsiteHeader();
      const description = await textManager.fetchWebsiteSecondHeader();
      
      
      if (title || description) {
        setTexts(prevTexts => {
          const updatedTexts = {
            ...prevTexts,
            [i18n.language]: {
              ...prevTexts[i18n.language],
              title: title || prevTexts[i18n.language]?.title || 'مكتبة المواقع الإسلامية',
              description: description || prevTexts[i18n.language]?.description
            }
          };
          return updatedTexts;
        });
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchPageTexts();
  }, [i18n.language]);

  const renderWebsites = () => {
    if (!websites || !Array.isArray(websites)) {
      return null;
    }
    
    return websites.map(site => (
      <div key={site.id} className="website-item">
        {isAdmin && (
          <div className="admin-controls">
            <button onClick={() => setEditingWebsite(site)}>
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button onClick={() => handleDeleteWebsite(site)}>
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        )}
        <a href={site.url} target="_blank" rel="noopener noreferrer">
          <img src={websiteManager.getFaviconUrl(site.url)} alt={site.name} />
          <p>{site.name}</p>
        </a>
      </div>
    ));
  };

  if (isLoading) {
    return <div><Louder /></div>;
  }

  return (
    <div className="page-container">
      <Header/>
      <div className="videos-header">
        {texts[i18n.language]?.title && (
          <h1>
            {texts[i18n.language].title}
            {isAdmin && (
              <FontAwesomeIcon
                icon={faEdit}
                className="edit-icon"
                onClick={() => {
                  setEditingField('title');
                  setTempText(texts[i18n.language]?.title || '');
                }}
              />
            )}
          </h1>
        )}
        <p>
          {texts[i18n.language]?.description}
          {isAdmin && (
            <FontAwesomeIcon
              icon={faEdit}
              className="edit-icon"
              onClick={() => {
                setEditingField('description');
                setTempText(texts[i18n.language]?.description);
              }}
            />
          )}
        </p>
      </div>
    
      <div className="content-wrap">
        <div className="another-container">
          <div className="websites-grid">
            {isAdmin && (
              <div className="add-app" onClick={() => setShowAddModal(true)}>
                <div className="add-app-content">
                  <FontAwesomeIcon icon={faPlus} />
                  <p>{t('إضافة موقع')}</p>
                </div>
              </div>
            )}
          
            {renderWebsites()}
          </div>
        </div>
      </div>

      {/* نوافذ الأضافة والتحرير والحذف */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>إضافة موقع جديد ({i18n.language})</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddWebsite();
            }}>
              <input
                type="text"
                placeholder="اسم الموقع"
                value={newWebsite.name}
                onChange={e => setNewWebsite({...newWebsite, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="رابط الموقع  (مثال: elmanafea.com أو https://example.com)"
                value={newWebsite.url}
                onChange={e => setNewWebsite({...newWebsite, url: e.target.value})}
                required
              />
              <div className="modal-buttons">
                <button type="submit">إضافة</button>
                <button type="button" onClick={() => setShowAddModal(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingWebsite && (
        <div className="modal">
          <div className="modal-content">
            <h3>تعديل الموقع ({i18n.language})</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateWebsite();
            }}>
              <input
                type="text"
                placeholder="اسم الموقع"
                value={editingWebsite.name}
                onChange={e => setEditingWebsite({...editingWebsite, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="رابط الموقع * (مثال: elmanafea.com أو https://example.com)"
                value={editingWebsite.url}
                onChange={e => setEditingWebsite({...editingWebsite, url: e.target.value})}
                required
              />
              <div className="modal-buttons">
                <button type="submit">حفظ</button>
                <button type="button" onClick={() => setEditingWebsite(null)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingField && (
        <div className="another-edit-overlay">
          <div className="another-edit-wrapper">
            <h3 className="another-edit-title">تعديل النص ({i18n.language})</h3>
            <div className="another-edit-container">
              <p className="another-edit-text">النص:</p>
              <input
                type="text"
                value={tempText}
                onChange={(e) => setTempText(e.target.value)}
                className="another-edit-field"
                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
              />
              <div className="another-edit-actions">
                <button 
                  className="another-edit-save"
                  onClick={handleUpdateText}
                >
                  حفظ
                </button>
                <button 
                  className="another-edit-cancel"
                  onClick={() => {
                    setEditingField(null);
                    setTempText('');
                  }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmModal && websiteToDelete && (
        <div className="delete-confirm-modal-overlay">
          <div className="delete-confirm-modal">
            <h3>تأكيد الحذف</h3>
            <p>هل أنت متأكد من حذف موقع "{websiteToDelete.name}"؟</p>
            <div className="delete-confirm-buttons">
              <button 
                className="delete-confirm-btn"
                onClick={confirmDeleteWebsite}
              >
                نعم، احذف
              </button>
              <button 
                className="delete-cancel-btn"
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setWebsiteToDelete(null);
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer/>
    </div>
  );
}

export default Another;
