import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import Header from './header';
import './another.css';
import Footer from './footer';
import axios from 'axios';

function Another() {
  const { t, i18n } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  
  // بيانات المواقع الافتراضية مفصولة للتنظيم
  const defaultWebsites = {
    ar: [
      { id: 1, name: "سنن.كوم", url: "https://sunnah.com/" },
      { id: 2, name: "الباحث الإسلامي", url: "https://www.islamicfinder.org/" },
      { id: 3, name: "القرآن الكريم", url: "https://www.quran.com/" },
      { id: 4, name: "الدليل إلى القرآن الكريم", url: "https://guidetoquran.com/ar" }
    ],
    en: [
      { id: 1, name: "Sunnah.com", url: "https://sunnah.com/" },
      { id: 2, name: "IslamicFinder", url: "https://www.islamicfinder.org/" },
      { id: 3, name: "Quran.com", url: "https://www.quran.com/" },
      { id: 4, name: "Guide to Quran", url: "https://guidetoquran.com/" }
    ],
    fr: [
      { id: 1, name: "Sunnah.com", url: "https://sunnah.com/" },
      { id: 2, name: "IslamicFinder", url: "https://www.islamicfinder.org/fr/" },
      { id: 3, name: "Le Saint Coran", url: "https://www.quran.com/" }
    ]
  };
  
  // تحسين استرداد بيانات المواقع من التخزين المحلي
  const [websites, setWebsites] = useState(() => {
    const savedWebsites = localStorage.getItem('websites');
    // استخدام البيانات المخزنة محلياً إن وجدت، وإلا استخدام البيانات الافتراضية
    return savedWebsites ? JSON.parse(savedWebsites) : defaultWebsites;
  });

  const [texts, setTexts] = useState(() => {
    const savedTexts = localStorage.getItem('anotherTexts');
    return savedTexts ? JSON.parse(savedTexts) : {
      ar: {
        title: 'مكتبة المواقع الإسلامية',
        description: 'مجموعة مميزة من المواقع الإسلامية المفيدة'
      },
      en: {
        title: 'Islamic Websites Library',
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

  // تحقق من حالة المشرف
  useEffect(() => {
    const checkAdmin = () => {
      const token = localStorage.getItem('adminToken');
      setIsAdmin(!!token);
    };
    checkAdmin();
    window.addEventListener('storage', checkAdmin);
    return () => window.removeEventListener('storage', checkAdmin);
  }, []);

  // حفظ التغييرات في localStorage
  useEffect(() => {
    localStorage.setItem('websites', JSON.stringify(websites));
  }, [websites]);

  useEffect(() => {
    localStorage.setItem('anotherTexts', JSON.stringify(texts));
  }, [texts]);

  const handleAddWebsite = async () => {
    if (!newWebsite.name || !newWebsite.url) {
      alert('من فضلك أدخل جميع البيانات المطلوبة');
      return;
    }

    try {
      const response = await axios.post('https://elmanafea.shop/admin/addwebsite', {
        name: newWebsite.name,
        url: newWebsite.url,
        language: i18n.language
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.status !== 200) {
        throw new Error('فشل في إضافة الموقع');
      }

      await fetchWebsites();
      setShowAddModal(false);
      setNewWebsite({ name: '', url: '' });
    } catch (error) {
      // console.error('Error adding website:', error);
      // alert(error.message);
    }
  };

  // إعادة هيكلة دالة جلب المواقع
  const fetchWebsites = async () => {
    try {
      const currentLang = i18n.language;
      // إضافة معلمة اللغة إلى الطلب
      const response = await axios.get(`https://elmanafea.shop/websites?lang=${currentLang}`);
      const data = response.data;
      console.log(`Fetched websites for ${currentLang}:`, data);

      if (Array.isArray(data)) {
        // تحسين هيكلة البيانات المستلمة
        const websitesData = data.map(site => ({
          id: site._id || site.id,
          name: site.name || site.title, // التعامل مع الاسم من أي خاصية متاحة
          url: site.url,
          language: currentLang
        }));

        // تحديث حالة المواقع مع الحفاظ على بيانات اللغات الأخرى
        setWebsites(prevWebsites => {
          // دمج البيانات الجديدة مع الحفاظ على البيانات السابقة للغات الأخرى
          const updatedWebsites = {
            ...prevWebsites,
            [currentLang]: websitesData
          };
          
          // حفظ البيانات المحدثة في التخزين المحلي
          localStorage.setItem('websites', JSON.stringify(updatedWebsites));
          
          return updatedWebsites;
        });
      }
    } catch (error) {
      console.error('Error fetching websites:', error);
      // في حالة الخطأ، الاحتفاظ بالبيانات الحالية
    }
  };

  // استدعاء دالة جلب المواقع عند تغيير اللغة
  useEffect(() => {
    fetchWebsites();
  }, [i18n.language]);

  const handleUpdateWebsite = async () => {
    if (!editingWebsite.name || !editingWebsite.url) {
      alert('من فضلك أدخل جميع البيانات المطلوبة');
      return;
    }

    try {
      const response = await axios.put(`https://elmanafea.shop/admin/updatewebsites/${editingWebsite.id}`, {
        title: editingWebsite.name,
        url: editingWebsite.url
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.status !== 200) {
        throw new Error('فشل في تحديث الموقع');
      }

      await fetchWebsites();
      setEditingWebsite(null);
    } catch (error) {
      console.error('Error updating website:', error);
      alert(error.message);
    }
  };

  const handleDeleteWebsite = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموقع؟')) {
      try {
        const response = await axios.delete(`https://elmanafea.shop/admin/deletewebsites/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        if (response.status !== 200) {
          throw new Error('فشل في حذف الموقع');
        }

        await fetchWebsites();
      } catch (error) {
        console.error('Error deleting website:', error);
        alert(error.message);
      }
    }
  };

  const handleUpdateText = () => {
    if (!tempText) {
      alert('من فضلك أدخل النص');
      return;
    }

    const currentLang = i18n.language;
    setTexts({
      ...texts,
      [currentLang]: {
        ...texts[currentLang],
        [editingField]: tempText
      }
    });
    setEditingField(null);
    setTempText('');
  };

  const getFaviconUrl = (websiteUrl) => {
    return `https://www.google.com/s2/favicons?domain=${websiteUrl}&sz=64`;
  };

  return (
    <div className="page-container">
      <Header/>
      <div className="videos-header">
        <h1>
          {texts[i18n.language]?.title}
          {isAdmin && (
            <FontAwesomeIcon
              icon={faEdit}
              className="edit-icon"
              onClick={() => {
                setEditingField('title');
                setTempText(texts[i18n.language]?.title);
              }}
            />
          )}
        </h1>
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
            
            {(websites[i18n.language] || []).map(site => (
              <div key={site.id} className="website-item">
                {isAdmin && (
                  <div className="admin-controls">
                    <button onClick={() => setEditingWebsite(site)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => handleDeleteWebsite(site.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                )}
                <a href={site.url} target="_blank" rel="noopener noreferrer">
                  <img src={getFaviconUrl(site.url)} alt={site.name} />
                  <p>{site.name}</p>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal إضافة موقع */}
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
                placeholder="اسم الموقع *"
                value={newWebsite.name}
                onChange={e => setNewWebsite({...newWebsite, name: e.target.value})}
                required
              />
              <input
                type="url"
                placeholder="رابط الموقع *"
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

      {/* Modal تعديل موقع */}
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
                placeholder="اسم الموقع *"
                value={editingWebsite.name}
                onChange={e => setEditingWebsite({...editingWebsite, name: e.target.value})}
                required
              />
              <input
                type="url"
                placeholder="رابط الموقع *"
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

      {/* Modal تعديل النص */}
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
      <Footer/>
    </div>
  );
}

export default Another;