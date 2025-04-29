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
  
  const [websites, setWebsites] = useState(() => {
    const savedWebsites = localStorage.getItem('websites');
    return savedWebsites ? JSON.parse(savedWebsites) : [];
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

      fetchWebsites();
      setShowAddModal(false);
      setNewWebsite({ name: '', url: '' });
    } catch (error) {
      // console.error('Error adding website:', error);
      // alert(error.message);
    }
  };

  const fetchWebsites = async () => {
    try {
      console.log('Fetching all websites after update');
      
      // إضافة timestamp لمنع التخزين المؤقت
      const timestamp = new Date().getTime();
      const response = await axios.get(`https://elmanafea.shop/websites?_t=${timestamp}`);
      console.log('API Response after update:', response.data);
      
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
      
      console.log('Processed websites data:', websitesData);
      
      setWebsites(websitesData);
      localStorage.setItem('websites', JSON.stringify(websitesData));
    } catch (error) {
      console.error('Error fetching websites:', error);
      setWebsites([]);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const handleUpdateWebsite = async () => {
    if (!editingWebsite.name || !editingWebsite.url) {
      alert('من فضلك أدخل جميع البيانات المطلوبة');
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        alert('يرجى تسجيل الدخول كمشرف أولاً');
        return;
      }

      console.log(`Updating website with ID: ${editingWebsite.id}`);
      
      // إرسال طلب PUT للخادم مع الحقول المطلوبة
      const response = await axios({
        method: 'put',
        url: `https://elmanafea.shop/admin/updatewebsites/${editingWebsite.id}`,
        data: {
          name: editingWebsite.name,   // إرسال الاسم في حقل name بدلاً من title
          url: editingWebsite.url,     // إرسال الرابط في حقل url
          lang: i18n.language
        },
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Update response:', response.data);

      if (response.status === 200) {
        // تحديث البيانات محلياً بعد الاستجابة الناجحة من الخادم
        setWebsites(prevWebsites => {
          const updatedWebsites = prevWebsites.map(site => 
            site.id === editingWebsite.id 
              ? {...site, name: editingWebsite.name, url: editingWebsite.url} 
              : site
          );
          
          // حفظ التغييرات في التخزين المحلي
          localStorage.setItem('websites', JSON.stringify(updatedWebsites));
          return updatedWebsites;
        });
        
        // إغلاق نافذة التعديل
        setEditingWebsite(null);
        alert('تم تحديث الموقع بنجاح');
      } else {
        throw new Error('فشل في تحديث الموقع');
      }
    } catch (error) {
      console.error('Error updating website:', error);
      console.error('Response data:', error.response?.data);
      alert(error.response?.data?.message || 'حدث خطأ في تحديث الموقع');
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

        fetchWebsites();
      } catch (error) {
        console.error('Error deleting website:', error);
        alert(error.message);
      }
    }
  };

  // تعديل دالة تحديث النصوص لتتعامل مع طلبات API
  const handleUpdateText = async () => {
    if (!tempText) {
      alert('من فضلك أدخل النص');
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        alert('يرجى تسجيل الدخول كمشرف أولاً');
        return;
      }

      const currentLang = i18n.language;
      
      // في حالة تحديث العنوان، نرسل طلب POST للـ endpoint المطلوب
      if (editingField === 'title') {
        // إرسال طلب POST للخادم لتحديث العنوان
        const response = await axios({
          method: 'post',
          url: 'https://elmanafea.shop/admin/head',
          data: {
            title: tempText,  // إرسال العنوان في حقل title
            lang: currentLang // إرسال اللغة في حقل lang
          },
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Update title response:', response.data);
        
        if (response.status === 200) {
          // بعد التحديث الناجح، نقوم بطلب GET للحصول على البيانات المحدثة
          await fetchWebsiteHeader();
          alert('تم تحديث العنوان بنجاح');
        }
      } 
      // في حالة تحديث الوصف، نرسل طلب POST للـ endpoint المخصص له
      else if (editingField === 'description') {
        // إرسال طلب POST للخادم لتحديث الوصف
        const response = await axios({
          method: 'post',
          // تصحيح اسم الإندبوينت من websecondheader إلى websitesecondheader
          url: 'https://elmanafea.shop/admin/websecondheader',
          data: {
            title: tempText,  
            lang: currentLang 
          },
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Update description response:', response.data);
        
        if (response.status === 200) {
          // بعد التحديث الناجح، نقوم بطلب GET للحصول على البيانات المحدثة
          await fetchWebsiteSecondHeader();
          alert('تم تحديث الوصف بنجاح');
        }
      }
      else {
        // تحديث محلي للنصوص الأخرى
        setTexts({
          ...texts,
          [currentLang]: {
            ...texts[currentLang],
            [editingField]: tempText
          }
        });
      }
      
      // إغلاق نافذة التعديل
      setEditingField(null);
      setTempText('');
    } catch (error) {
      console.error('Error updating text:', error);
      alert(error.response?.data?.message || 'حدث خطأ في تحديث النص');
    }
  };

  // دالة جديدة لجلب عنوان الصفحة من الخادم
  const fetchWebsiteHeader = async () => {
    try {
      const currentLang = i18n.language;
      const response = await axios.get(`https://elmanafea.shop/websitesheader?lang=${currentLang}`);
      console.log('Website header response:', response.data);
      
      if (response.data?.title) {
        // تحديث العنوان في state
        setTexts(prevTexts => ({
          ...prevTexts,
          [currentLang]: {
            ...prevTexts[currentLang],
            title: response.data.title
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching website header:', error);
    }
  };

  // دالة جديدة لجلب عنوان الصفحة الثانوي من الخادم
  const fetchWebsiteSecondHeader = async () => {
    try {
      const currentLang = i18n.language;
      const response = await axios.get(`https://elmanafea.shop/websecondheader?lang=${currentLang}`);
      console.log('Website second header response:', response.data);
      
      // التعامل مع هيكل البيانات الصحيح
      if (response.data?.second_header?.title) {
        // تحديث الوصف في state
        setTexts(prevTexts => ({
          ...prevTexts,
          [currentLang]: {
            ...prevTexts[currentLang],
            description: response.data.second_header.title
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching website second header:', error);
    }
  };

  // استدعاء دوال الجلب عند تحميل المكون أو تغيير اللغة
  useEffect(() => {
    fetchWebsiteHeader();
    fetchWebsiteSecondHeader();
  }, [i18n.language]);

  const getFaviconUrl = (websiteUrl) => {
    return `https://www.google.com/s2/favicons?domain=${websiteUrl}&sz=64`;
  };

  const renderWebsites = () => {
    if (!websites || !Array.isArray(websites)) {
      console.error('websites is not an array:', websites);
      return null;
    }
    
    return websites.map(site => (
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
    ));
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
          
            {renderWebsites()}
          </div>
        </div>
      </div>

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