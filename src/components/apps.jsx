import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Header from './header';
// import AthanPro from "./imgs/athanPro.png";
// import HisnAlMuslim from "./imgs/hisnAlMuslim.png";
// import IQuran from "./imgs/iQuran.png";
// import Islam360 from "./imgs/islam360.png";
// import MuslimPro from "./imgs/muslimPro.png";
import './apps.css' 
import Footer from './footer';

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
      fr: {
        title: 'Bibliothèque d\'Applications Islamiques',
        description: 'Une collection d\'applications islamiques utiles'
      },
      tr: {
        title: 'İslami Uygulamalar Kütüphanesi',
        description: 'Faydalı İslami uygulamaların bir koleksiyonu'
      },
      id: {
        title: 'Perpustakaan Aplikasi Islam',
        description: 'Koleksi aplikasi Islam yang bermanfaat'
      },
      ru: {
        title: 'Библиотека Исламских Приложений',
        description: 'Коллекция полезных исламских приложений'
      },
      hi: {
        title: 'इस्लामिक ऐप्स लाइब्रेरी',
        description: 'उपयोगी इस्लामिक एप्लिकेशन का संग्रह'
      },
      ur: {
        title: 'اسلامی ایپس لائبریری',
        description: 'مفید اسلامی ایپلیکیشنز کا مجموعہ'
      },
      bn: {
        title: 'ইসলামিক অ্যাপস লাইব্রেরি',
        description: 'উপকারী ইসলামিক অ্যাপ্লিকেশনের সংগ্রহ'
      },
      zh: {
        title: '伊斯兰应用程序库',
        description: '实用伊斯兰应用程序集合'
      },
      tl: {
        title: 'Aklatan ng mga Islamic na Application',
        description: 'Koleksyon ng mga kapaki-pakinabang na Islamic applications'
      },
      fa: {
        title: 'کتابخانه برنامه‌های اسلامی',
        description: 'مجموعه‌ای از برنامه‌های کاربردی اسلامی'
      }
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
  const [editingHeader, setEditingHeader] = useState(false);
  const [editingHeaderText, setEditingHeaderText] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingDescriptionText, setEditingDescriptionText] = useState('');

  const resizeImage = async (file) => {
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
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const resizedImage = await resizeImage(file);
      setNewApp(prev => ({
        ...prev,
        image: resizedImage
      }));
    }
  };

  // Check admin status
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
        fr: {
          title: 'Bibliothèque d\'Applications Islamiques',
          description: 'Une collection d\'applications islamiques utiles'
        },
        tr: {
          title: 'İslami Uygulamalar Kütüphanesi',
          description: 'Faydalı İslami uygulamaların bir koleksiyonu'
        },
        id: {
          title: 'Perpustakaan Aplikasi Islam',
          description: 'Koleksi aplikasi Islam yang bermanfaat'
        },
        ru: {
          title: 'Библиотека Исламских Приложений',
          description: 'Коллекция полезных исламских приложений'
        },
        hi: {
          title: 'इस्लामिक ऐप्स लाइब्रेरी',
          description: 'उपयोगी इस्लामिक एप्लिकेशन का संग्रह'
        },
        ur: {
          title: 'اسلامی ایپس لائبریری',
          description: 'مفید اسلامی ایپلیکیشنز کا مجموعہ'
        },
        bn: {
          title: 'ইসলামিক অ্যাপস লাইব্রেরি',
          description: 'উপকারী ইসলামিক অ্যাপ্লিকেশনের সংগ্রহ'
        },
        zh: {
          title: '伊斯兰应用程序库',
          description: '实用伊斯兰应用程序集合'
        },
        tl: {
          title: 'Aklatan ng mga Islamic na Application',
          description: 'Koleksyon ng mga kapaki-pakinabang na Islamic applications'
        },
        fa: {
          title: 'کتابخانه برنامه‌های اسلامی',
          description: 'مجموعه‌ای از برنامه‌های کاربردی اسلامی'
        }
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

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const response = await axios.get(
          `https://elmanafea.shop/appsheader?lang=${i18n.language}`
        );
        if (response.data?.header) {
          setHeaderText(response.data.header);
        }
      } catch (error) {
        console.error('Error fetching header:', error);
      }
    };

    fetchHeaderData();
  }, [i18n.language]);

  useEffect(() => {
    const fetchDescriptionData = async () => {
      try {
        const response = await axios.get(
          `https://elmanafea.shop/appssecondheader?lang=${i18n.language}`
        );
        if (response.data?.secondHeader) {
          setDescriptionText(response.data.secondHeader);
        }
      } catch (error) {
        console.error('Error fetching description:', error);
      }
    };

    fetchDescriptionData();
  }, [i18n.language]);

  const handleAddApp = async () => {
    try {
      if (!newApp.name || !newApp.link || !newApp.image) {
        alert('الرجاء إدخال جميع البيانات المطلوبة');
        return;
      }

      const formData = new FormData();
      formData.append('photo', newApp.image);
      formData.append('title', newApp.name);
      formData.append('url', newApp.link);
      formData.append('platform', newApp.category);

      const response = await fetch('https://elmanafea.shop/admin/addapp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('فشل في إضافة التطبيق');
      }

      await fetchApps(newApp.category);
      setShowAddModal(false);
      setNewApp({
        name: '',
        image: null,
        link: '',
        category: 'android'
      });

    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  const fetchApps = async (platform) => {
    try {
      const response = await fetch(`https://elmanafea.shop/apps?platform=${platform}`);
      const data = await response.json();
      console.log('Fetched apps:', data);

      if (Array.isArray(data)) {
        const updatedApps = data.map(app => ({
          id: app.id,
          name: app.title || '',
          image: app.photo ? `https://elmanafea.shop/${app.photo.startsWith('/') ? app.photo.slice(1) : app.photo}` : '',
          link: app.url || '',
          category: platform
        }));
        setApps(updatedApps);
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
    }
  };

  useEffect(() => {
    fetchApps(activeCategory);
  }, [activeCategory]);

  const handleEditImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingApp(prev => ({
        ...prev,
        image: file // Store the actual file
      }));
    }
  };

  const handleUpdateApp = async () => {
    try {
      const formData = new FormData();
      formData.append('photo', editingApp.image);
      formData.append('title', editingApp.name);
      formData.append('url', editingApp.link);
      formData.append('platform', editingApp.category);

      const response = await fetch('https://elmanafea.shop/admin/addapp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('فشل في تحديث التطبيق');
      }

      await fetchApps(editingApp.category);
      setEditingApp(null);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  const handleUpdateHeader = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        alert('يرجى تسجيل الدخول كمشرف أولاً');
        return;
      }

      const response = await axios.post(
        'https://elmanafea.shop/admin/appsheader',
        {
          text: editingHeaderText,
          lang: i18n.language
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        }
      );

      if (response.status === 200) {
        setHeaderText(editingHeaderText);
        setEditingHeader(false);
        alert('تم تحديث العنوان بنجاح');
      }
    } catch (error) {
      console.error('Error updating header:', error);
      alert(error.response?.data?.message || 'حدث خطأ في تحديث العنوان');
    }
  };

  const handleUpdateDescription = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        alert('يرجى تسجيل الدخول كمشرف أولاً');
        return;
      }

      const response = await axios.post(
        'https://elmanafea.shop/admin/appssecondheader',
        {
          text: editingDescriptionText,
          lang: i18n.language
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        }
      );

      if (response.status === 200) {
        setDescriptionText(editingDescriptionText);
        setEditingDescription(false);
        alert('تم تحديث الوصف بنجاح');
      }
    } catch (error) {
      console.error('Error updating description:', error);
      alert(error.response?.data?.message || 'حدث خطأ في تحديث الوصف');
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

  const filteredApps = apps.filter(app => app.category === activeCategory);

  return (
    <div className="page-container">
      <Header />

      <div className="videos-header">
        {editingHeader ? (
          <div className="edit-header-container">
            <input
              type="text"
              value={editingHeaderText}
              onChange={(e) => setEditingHeaderText(e.target.value)}
              className="edit-header-input"
            />
            <div className="edit-header-buttons">
              <button onClick={handleUpdateHeader}>حفظ</button>
              <button onClick={() => setEditingHeader(false)}>إلغاء</button>
            </div>
          </div>
        ) : (
          <div className="header-container">
            <h1>{headerText || t('مكتبة التطبيقات الإسلامية')}</h1>
            {isAdmin && (
              <FontAwesomeIcon
                icon={faPenToSquare}
                className="edit-icon"
                onClick={() => {
                  setEditingHeaderText(headerText);
                  setEditingHeader(true);
                }}
              />
            )}
          </div>
        )}
        {editingDescription ? (
          <div className="edit-header-container">
            <input
              type="text"
              value={editingDescriptionText}
              onChange={(e) => setEditingDescriptionText(e.target.value)}
              className="edit-header-input"
            />
            <div className="edit-header-buttons">
              <button onClick={handleUpdateDescription}>حفظ</button>
              <button onClick={() => setEditingDescription(false)}>إلغاء</button>
            </div>
          </div>
        ) : (
          <div className="header-container">
            <p>{descriptionText || t('مجموعة مميزة من التطبيقات الإسلامية المفيدة')}</p>
            {isAdmin && (
              <FontAwesomeIcon
                icon={faPenToSquare}
                className="edit-icon"
                onClick={() => {
                  setEditingDescriptionText(descriptionText);
                  setEditingDescription(true);
                }}
              />
            )}
          </div>
        )}
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
              <li><a className={activeCategory === 'android' ? 'active' : ''} onClick={() => setActiveCategory('android')}>android</a></li>
              <li><a className={activeCategory === 'ios' ? 'active' : ''} onClick={() => setActiveCategory('ios')}>ios</a></li>
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
                    <button onClick={() => {
                      if(window.confirm('هل أنت متأكد من حذف هذا التطبيق؟')) {
                        setApps(apps.filter(a => a.id !== app.id));
                      }
                    }}>
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

      <Footer />
    </div>
  )
}

export default Apps;