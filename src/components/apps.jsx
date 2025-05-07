import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Header from './header';
import './apps.css' 
import Footer from './footer';
import { showToast } from './Toast';
import Louder from './louder';

// كلاس لمعالجة وضبط حجم الصور
class ImageProcessor {
  async resizeImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 250; // تعديل الحجم إلى 250 بكسل
          let width = img.width;
          let height = img.height;

          // حساب النسبة مع الحفاظ على التناسق
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          }, 'image/jpeg', 0.8);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
}

// كلاس لإدارة نصوص الصفحة
class TextManager {
  constructor(i18n) {
    this.i18n = i18n;
    this.baseURL = 'https://elmanafea.shop';
  }
  
  async fetchHeaderText() {
    try {
      const response = await axios.get(
        `${this.baseURL}/appsheader?lang=${this.i18n.language}`
      );
      if (response.data?.header) {
        return response.data.header;
      }
      return null;
    } catch (error) {
      console.error('Error fetching header:', error);
      return null;
    }
  }

  async fetchDescriptionText() {
    try {
      const response = await axios.get(
        `${this.baseURL}/appssecondheader?lang=${this.i18n.language}`
      );
      if (response.data?.secondHeader) {
        return response.data.secondHeader;
      }
      return null;
    } catch (error) {
      console.error('Error fetching description:', error);
      return null;
    }
  }

  async updateHeaderText(text, adminToken) {
    try {
      if (!adminToken) {
        throw new Error('يرجى تسجيل الدخول كمشرف أولاً');
      }

      const response = await axios.post(
        `${this.baseURL}/admin/appsheader`,
        {
          text: text,
          lang: this.i18n.language
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        }
      );

      return { success: response.status === 200, data: response.data };
    } catch (error) {
      console.error('Error updating header:', error);
      throw error;
    }
  }
  
  async updateDescriptionText(text, adminToken) {
    try {
      if (!adminToken) {
        throw new Error('يرجى تسجيل الدخول كمشرف أولاً');
      }

      const response = await axios.post(
        `${this.baseURL}/admin/appssecondheader`,
        {
          text: text,
          lang: this.i18n.language
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        }
      );

      return { success: response.status === 200, data: response.data };
    } catch (error) {
      console.error('Error updating description:', error);
      throw error;
    }
  }
}

// كلاس لإدارة التطبيقات
class AppManager {
  constructor(i18n) {
    this.i18n = i18n;
    this.baseURL = 'https://elmanafea.shop';
  }
  
  async fetchApps(platform) {
    try {
      const response = await axios.get(`${this.baseURL}/apps?platform=${platform}`);
      const data = response.data;

      if (Array.isArray(data)) {
        return data.map(app => ({
          id: app._id,
          name: app.title || '',
          image: app.photo ? `${this.baseURL}/${app.photo.startsWith('/') ? app.photo.slice(1) : app.photo}` : '',
          link: app.url || '',
          category: app.platform || platform
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching apps:', error);
      throw new Error('حدث خطأ أثناء استرجاع التطبيقات');
    }
  }

  async addApp(appData, adminToken) {
    try {
      if (!appData.name || !appData.link || !appData.image) {
        throw new Error('الرجاء إدخال جميع البيانات المطلوبة');
      }

      if (!adminToken) {
        throw new Error('يرجى تسجيل الدخول كمشرف أولاً');
      }

      const formData = new FormData();
      formData.append('photo', appData.image);
      formData.append('title', appData.name);
      formData.append('url', appData.link);
      formData.append('platform', appData.category);

      const response = await axios({
        method: 'post',
        url: `${this.baseURL}/admin/addapp`,
        data: formData,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      return { success: response.status === 200 || response.status === 201, data: response.data };
    } catch (error) {
      console.error('Error adding app:', error);
      throw error;
    }
  }

  async updateApp(appData, adminToken) {
    try {
      if (!appData.name || !appData.link) {
        throw new Error('الرجاء إدخال جميع البيانات المطلوبة');
      }

      if (!adminToken) {
        throw new Error('يرجى تسجيل الدخول كمشرف أولاً');
      }

      const formData = new FormData();
      formData.append('photo', appData.image);
      formData.append('title', appData.name);
      formData.append('url', appData.link);
      formData.append('platform', appData.category);

      const response = await axios.put(
        `${this.baseURL}/admin/updateapp/${appData.id}`, 
        formData, 
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      return { success: response.status === 200, data: response.data };
    } catch (error) {
      console.error('Error updating app:', error);
      throw error;
    }
  }

  async deleteApp(appId, adminToken) {
    try {
      if (!appId) return { success: false, message: 'معرف التطبيق غير موجود' };
      
      if (!adminToken) {
        throw new Error('يرجى تسجيل الدخول كمشرف أولاً');
      }

      const response = await axios.delete(
        `${this.baseURL}/admin/deleteapp/${appId}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      return { success: response.status === 200, data: response.data };
    } catch (error) {
      console.error('Error deleting app:', error);
      throw error;
    }
  }
}

// الكومبوننت الرئيسي مع استخدام الكلاسات
function Apps() {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('android');
  const [isAdmin, setIsAdmin] = useState(false);
  const [apps, setApps] = useState([]);
  const [texts, setTexts] = useState(() => {
    const savedTexts = localStorage.getItem('appsTexts');
    return savedTexts ? JSON.parse(savedTexts) : {
      ar: {
        description: 'مجموعة مميزة من التطبيقات الإسلامية المفيدة'
      },
      en: {
        title: 'Islamic Apps Library',
      },
      // ...existing code...
    };
  });
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [newApp, setNewApp] = useState({
    name: '',
    image: null,
    link: '',
    category: 'android'
  });
  const [editingField, setEditingField] = useState(null);
  const [tempText, setTempText] = useState('');
  const [headerText, setHeaderText] = useState('');
  const [editingHeaderText, setEditingHeaderText] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [editingDescriptionText, setEditingDescriptionText] = useState('');
  const [appToDelete, setAppToDelete] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showTitleEditModal, setShowTitleEditModal] = useState(false);
  const [showDescriptionEditModal, setShowDescriptionEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // إنشاء كائنات من الكلاسات
  const imageProcessor = new ImageProcessor();
  const textManager = new TextManager(i18n);
  const appManager = new AppManager(i18n);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const resizedImage = await imageProcessor.resizeImage(file);
      setNewApp(prev => ({
        ...prev,
        image: resizedImage
      }));
    }
  };

  // التحقق من حالة المشرف
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
    const savedTexts = localStorage.getItem('appsTexts');
    if (savedTexts) {
      const parsed = JSON.parse(savedTexts);
      const defaultTexts = {
        ar: {},
        en: {
          title: 'Islamic Apps Library',
        },
        // ...existing code...
      };

      const updatedTexts = Object.keys(defaultTexts).reduce((acc, lang) => {
        acc[lang] = {
          ...defaultTexts[lang],
          ...parsed[lang]
        };
        return acc;
      }, {});
      
      setTexts(updatedTexts);
    }
  }, []);

  // جلب بيانات النصوص
  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const headerText = await textManager.fetchHeaderText();
        if (headerText) {
          setHeaderText(headerText);
        }
      } catch (error) {
        console.error('Error fetching header:', error);
      }
    };

    const fetchDescriptionData = async () => {
      try {
        const descText = await textManager.fetchDescriptionText();
        if (descText) {
          setDescriptionText(descText);
        }
      } catch (error) {
        console.error('Error fetching description:', error);
      }
    };

    fetchHeaderData();
    fetchDescriptionData();
  }, [i18n.language]);

  // إضافة تطبيق جديد
  const handleAddApp = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const result = await appManager.addApp(newApp, adminToken);
      
      if (result.success) {
        await fetchApps(newApp.category);
        showToast.added(`تم إضافة تطبيق "${newApp.name}" بنجاح`);
        setShowAddModal(false);
        setNewApp({
          name: '',
          image: null,
          link: '',
          category: 'android'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      showToast.error(error.message || 'حدث خطأ في إضافة التطبيق');
    }
  };

  // جلب التطبيقات
  const fetchApps = async (platform) => {
    setIsLoading(true);
    try {
      const appsData = await appManager.fetchApps(platform);
      setApps(appsData);
    } catch (error) {
      showToast.error(error.message);
      setApps([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps(activeCategory);
  }, [activeCategory]);

  // معالجة تغيير صورة التطبيق
  const handleEditImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingApp(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  // تحديث تطبيق
  const handleUpdateApp = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const result = await appManager.updateApp(editingApp, adminToken);
      
      if (result.success) {
        await fetchApps(editingApp.category);
        showToast.edited(`تم تحديث تطبيق "${editingApp.name}" بنجاح`);
        setEditingApp(null);
      }
    } catch (error) {
      console.error('Error:', error);
      showToast.error(error.message || 'حدث خطأ في تحديث التطبيق');
    }
  };

  // تحديث عنوان الصفحة
  const handleUpdateHeader = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const result = await textManager.updateHeaderText(editingHeaderText, adminToken);
      
      if (result.success) {
        setHeaderText(editingHeaderText);
        setShowTitleEditModal(false);
        showToast.edited('تم تحديث العنوان بنجاح');
      }
    } catch (error) {
      console.error('Error updating header:', error);
      showToast.error(error.message || 'حدث خطأ في تحديث العنوان');
    }
  };

  // تحديث وصف الصفحة
  const handleUpdateDescription = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const result = await textManager.updateDescriptionText(editingDescriptionText, adminToken);
      
      if (result.success) {
        setDescriptionText(editingDescriptionText);
        setShowDescriptionEditModal(false);
        showToast.edited('تم تحديث الوصف بنجاح');
      }
    } catch (error) {
      console.error('Error updating description:', error);
      showToast.error(error.message || 'حدث خطأ في تحديث الوصف');
    }
  };

  const getCurrentText = (field) => {
    const currentLang = i18n.language;
    return texts[currentLang]?.[field] || texts[currentLang === 'en' ? 'ar' : 'en'][field];
  };

  const handleUpdateText = () => {
    const currentLang = i18n.language;
    const updatedTexts = {
      ...texts,
      [currentLang]: {
        ...texts[currentLang],
        [editingField]: tempText
      }
    };
    
    if (currentLang === 'en') {
      updatedTexts.ar = { ...texts.ar };
    }
    
    setTexts(updatedTexts);
    localStorage.setItem('appsTexts', JSON.stringify(updatedTexts));
    setEditingField(null);
    setTempText('');
  };

  // حذف تطبيق
  const handleDeleteApp = (appId) => {
    setAppToDelete(appId);
    setShowDeleteConfirm(true);
  };

  // تأكيد حذف التطبيق
  const confirmAppDelete = async () => {
    if (!appToDelete) return;
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      const result = await appManager.deleteApp(appToDelete, adminToken);
      
      if (result.success) {
        fetchApps(activeCategory);
        showToast.deleted('تم حذف التطبيق بنجاح');
      }
    } catch (error) {
      console.error('Error deleting app:', error);
      showToast.error(error.message || 'حدث خطأ في حذف التطبيق');
    } finally {
      setShowDeleteConfirm(false);
      setAppToDelete(null);
    }
  };

  const filteredApps = apps.filter(app => app.category === activeCategory);

  if (isLoading) {
    return <div><Louder /></div>;
  }

  return (
    <div className="page-container">
      <Header />

      <div className="videos-header">
        <div className="header-container">
          <h1>{headerText || t('مكتبة التطبيقات الإسلامية')}</h1>
          {isAdmin && (
            <FontAwesomeIcon
              icon={faPenToSquare}
              className="edit-icon"
              onClick={() => {
                setEditingHeaderText(headerText || t('مكتبة التطبيقات الإسلامية'));
                setShowTitleEditModal(true);
              }}
            />
          )}
        </div>
        <div className="header-container">
          <p>{descriptionText || t('مجموعة مميزة من التطبيقات الإسلامية المفيدة')}</p>
          {isAdmin && (
            <FontAwesomeIcon
              icon={faPenToSquare}
              className="edit-icon"
              onClick={() => {
                setEditingDescriptionText(descriptionText || t('مجموعة مميزة من التطبيقات الإسلامية المفيدة'));
                setShowDescriptionEditModal(true);
              }}
            />
          )}
        </div>
      </div>

      {editingField && (
        <div className="apps-edit-overlay">
          <div className="apps-edit-wrapper">
            <h3 className="apps-edit-title">تعديل النص ({i18n.language})</h3>
            <div className="apps-edit-container">
              <p className="apps-edit-text">النص:</p>
              <input
                type="text"
                value={tempText}
                onChange={(e) => setTempText(e.target.value)}
                className="apps-edit-field"
                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
              />
              <div className="apps-edit-actions">
                <button 
                  className="apps-edit-save"
                  onClick={handleUpdateText}
                >
                  حفظ
                </button>
                <button 
                  className="apps-edit-cancel"
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

      <div className="content-wrap">
        <div className="apps-container">
          <div className="apps-categories">
            <ul> 
              <li><a className={activeCategory === 'android' ? 'active' : ''} onClick={() => setActiveCategory('android')}>Android</a></li>
              <li><a className={activeCategory === 'ios' ? 'active' : ''} onClick={() => setActiveCategory('ios')}>iOS</a></li>
            </ul>
          </div>
          <div className="apps-grid">
            {isAdmin && (
              <div className="app-item add-app" onClick={() => setShowAddModal(true)}>
                <div className="add-app-content">
                  <FontAwesomeIcon icon={faPlus} />
                  <p>إضافة تطبيق جديد</p>
                </div>
              </div>
            )}
            {filteredApps.map(app => (
              <div key={app.id} className="app-item">
                {isAdmin && (
                  <div className="admin-controls">
                    <button onClick={() => setEditingApp(app)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => handleDeleteApp(app.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                )}
                <a href={app.link} target="_blank" rel="noopener noreferrer">
                  <img src={app.image} alt={app.name} />
                  <p>{app.name}</p>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* النوافذ المنبثقة */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>إضافة تطبيق جديد</h3>
            
            <div className="form-group">
              <label>صورة التطبيق</label>
              <div className="image-upload-container">
                {newApp.image && (
                  <img 
                    src={URL.createObjectURL(newApp.image)}
                    alt="معاينة"
                    className="image-preview"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                  id="add-app-image"
                />
                <label htmlFor="add-app-image" className="upload-label">
                  {newApp.image ? 'تغيير الصورة' : 'اختيار صورة'}
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>اسم التطبيق</label>
              <input
                type="text"
                value={newApp.name}
                onChange={e => setNewApp({...newApp, name: e.target.value})}
                placeholder="اسم التطبيق"
              />
            </div>

            <div className="form-group">
              <label>رابط التطبيق</label>
              <input
                type="text"
                value={newApp.link}
                onChange={e => setNewApp({...newApp, link: e.target.value})}
                placeholder="رابط التطبيق"
              />
            </div>

            <div className="form-group">
              <label>المنصة</label>
              <select
                value={newApp.category}
                onChange={e => setNewApp({...newApp, category: e.target.value})}
              >
                <option value="android">Android</option>
                <option value="ios">iOS</option>
              </select>
            </div>

            <div className="modal-buttons">
              <button onClick={handleAddApp} className="save-btn">إضافة</button>
              <button onClick={() => setShowAddModal(false)} className="cancel-btn">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {editingApp && (
        <div className="modal">
          <div className="modal-content">
            <h3>تعديل التطبيق</h3>
            <input
              type="text"
              value={editingApp.name}
              onChange={e => setEditingApp({...editingApp, name: e.target.value})}
              placeholder="اسم التطبيق"
            />
            <input
              type="text"
              value={editingApp.link}
              onChange={e => setEditingApp({...editingApp, link: e.target.value})}
              placeholder="رابط التطبيق"
            />
            <div className="image-upload-preview">
              <img 
                src={editingApp.image} 
                alt="معاينة"
                style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'contain',
                  marginBottom: '10px'
                }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleEditImage}
                className="file-input"
                id="edit-app-image"
              />
              <label htmlFor="edit-app-image" className="file-label">
                تغيير الصورة
              </label>
            </div>
            <select
              value={editingApp.category}
              onChange={e => setEditingApp({...editingApp, category: e.target.value})}
            >
              <option value="android">Android</option>
              <option value="ios">iOS</option>
            </select>
            <div className="modal-buttons">
              <button onClick={handleUpdateApp}>حفظ</button>
              <button onClick={() => setEditingApp(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showTitleEditModal && (
        <div className="app-edit-modal-overlay">
          <div className="app-edit-modal">
            <h3>تعديل العنوان الرئيسي</h3>
            <div className="app-edit-modal-content">
              <input
                type="text"
                value={editingHeaderText}
                onChange={(e) => setEditingHeaderText(e.target.value)}
                className="app-edit-input"
                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
              />
              <div className="app-edit-modal-actions">
                <button 
                  className="app-save-btn"
                  onClick={handleUpdateHeader}
                >
                  حفظ
                </button>
                <button 
                  className="app-cancel-btn"
                  onClick={() => setShowTitleEditModal(false)}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDescriptionEditModal && (
        <div className="app-edit-modal-overlay">
          <div className="app-edit-modal">
            <h3>تعديل وصف الصفحة</h3>
            <div className="app-edit-modal-content">
              <input
                type="text"
                value={editingDescriptionText}
                onChange={(e) => setEditingDescriptionText(e.target.value)}
                className="app-edit-input"
                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
              />
              <div className="app-edit-modal-actions">
                <button 
                  className="app-save-btn"
                  onClick={handleUpdateDescription}
                >
                  حفظ
                </button>
                <button 
                  className="app-cancel-btn"
                  onClick={() => setShowDescriptionEditModal(false)}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content">
            <h3>{t('تأكيد الحذف')}</h3>
            <p>{t('هل أنت متأكد من حذف هذا التطبيق؟')}</p>
            <div className="modal-buttons">
              <button 
                onClick={confirmAppDelete} 
                className="delete-btn"
              >
                {t('نعم، حذف')}
              </button>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setAppToDelete(null);
                }} 
                className="cancel-btn"
              >
                {t('إلغاء')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmModal && appToDelete && (
        <div className="app-delete-confirm-modal-overlay">
          <div className="app-delete-confirm-modal">
            <h3>تأكيد الحذف</h3>
            <p>هل أنت متأكد من حذف تطبيق "{appToDelete.name}"؟</p>
            <div className="app-delete-confirm-buttons">
              <button 
                className="app-delete-confirm-btn"
                onClick={() => handleDeleteApp(appToDelete.id)}
              >
                نعم، احذف
              </button>
              <button 
                className="app-delete-cancel-btn"
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setAppToDelete(null);
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default Apps;