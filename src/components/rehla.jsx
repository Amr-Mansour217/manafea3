import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPenToSquare, faFileUpload } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Header from './header';
import Footer from './footer';
import './rehla.css';
import { showToast } from './Toast'; // Import showToast component

const Rehla = () => {
  const { t, i18n } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [content, setContent] = useState({
    videoUrl: '',
    videoType: 'file',
    videoId: '',
    sections: []
  });
  const [videosArray, setVideosArray] = useState([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [tempVideoFile, setTempVideoFile] = useState(null);
  const [tempImageFile, setTempImageFile] = useState(null);
  const [modalType, setModalType] = useState('');
  const [isVideoLoading, setIsVideoLoading] = useState(true); // State to track video loading
  const [textStyle, setTextStyle] = useState({
    fontSize: '16px',
    color: '#000000',
    fontWeight: 'normal'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [imgs, setImgs] = useState([]);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [showVideoDeleteConfirm, setShowVideoDeleteConfirm] = useState(false);

  const getDirection = () => {
    const rtlLanguages = ['ar', 'fa', 'he', 'ur'];
    const langCode = i18n.language.split('-')[0];
    return rtlLanguages.includes(langCode) ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    setIsAdmin(!!adminToken);

    document.documentElement.dir = getDirection();
    document.body.dir = getDirection();

    fetchVideoData();
    fetchContentFromAPI();
  }, [i18n.language]);

  useEffect(() => {
    localStorage.setItem('rehlaSections', JSON.stringify(content.sections));
  }, [content.sections]);

  const fetchVideoData = () => {
    setIsLoading(true);
    
    axios.get(`https://elmanafea.shop/rehlavideos?lang=${i18n.language}`)
      .then(response => {
        if (response.data && response.data.videos && Array.isArray(response.data.videos)) {
          setVideosArray(response.data.videos);
          
          if (response.data.videos.length > 0) {
            const latestVideo = response.data.videos[response.data.videos.length - 1];
            
            setContent(prevContent => ({
              ...prevContent,
              videoUrl: latestVideo.url,
              videoId: latestVideo.id,
              videoType: 'file'
            }));
          }
        } else if (response.data && response.data.video) {
          setVideosArray([response.data.video]);
          
          setContent(prevContent => ({
            ...prevContent,
            videoUrl: response.data.video.url,
            videoId: response.data.video.id,
            videoType: 'file'
          }));
        } else {
          setVideosArray([]);
        }
      })
      .catch(err => {
        console.error('Error fetching video data:', err);
        showToast.error(t('حدث خطأ أثناء جلب بيانات الفيديو'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fetchContentFromAPI = () => {
    setIsLoading(true);
    
    axios.get(`https://elmanafea.shop/rehla/media?lang=${i18n.language}`)
      .then(response => {
        if (response.data && response.data.contentItems) {
          const contentItems = response.data.contentItems;
          
          const allSections = contentItems.map((item, index) => {
            if (item.type === 'image') {
              return {
                id: item._id,
                type: 'image',
                imageUrl: `https://elmanafea.shop${item.content}`,
                createdAt: item.createdAt,
                index: index
              };
            } else if (item.type === 'subtitle') {
              return {
                id: item._id,
                type: 'text',
                content: item.content,
                createdAt: item.createdAt,
                index: index
              };
            }
            return null;
          }).filter(item => item !== null);
          
          const imageItems = contentItems
            .filter(item => item.type === 'image')
            .map((item, index) => ({
              id: item._id,
              url: `https://elmanafea.shop${item.content}`,
              createdAt: item.createdAt,
              index: index
            }));
          
          setImgs(imageItems);
          
          setContent(prevContent => ({
            ...prevContent,
            sections: allSections
          }));
        }
      })
      .catch(err => {
        console.error('Error fetching content:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleVideoChange = () => {
    setTempValue('');
    setTempVideoFile(null);
    setShowVideoModal(true);
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setTempValue(videoUrl);
      setTempVideoFile(file);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setTempValue(imageUrl);
      setTempImageFile(file);
    }
  };

  const handleSaveVideo = () => {
    if (!tempVideoFile) {
      showToast.error(t('الرجاء اختيار ملف فيديو'));
      return;
    }

    setIsUploading(true);

    const token = localStorage.getItem('adminToken');

    if (!token) {
      showToast.error(t('جلسة المسؤول منتهية. يرجى تسجيل الدخول مرة أخرى'));
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('video', tempVideoFile);
    formData.append('lang', i18n.language);

    axios.post(
      'https://elmanafea.shop/admin/rehlauploadvideo',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      }
    )
      .then(() => {
        return fetchVideoData();
      })
      .then(() => {
        setShowVideoModal(false);
        setTempValue('');
        setTempVideoFile(null);
        showToast.added(t('تم رفع الفيديو بنجاح'));
      })
      .catch(err => {
        console.error('Error uploading video:', err);
        if (err.response && err.response.data && err.response.data.message) {
          showToast.error(t(err.response.data.message));
        } else {
          showToast.error(t('حدث خطأ أثناء رفع الفيديو'));
        }
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  const handleDeleteVideo = () => {
    setShowVideoDeleteConfirm(true);
  };

  const confirmVideoDelete = () => {
    setIsLoading(true);

    const token = localStorage.getItem('adminToken');

    if (!token) {
      showToast.error(t('جلسة المسؤول منتهية. يرجى تسجيل الدخول مرة أخرى'));
      setIsLoading(false);
      return;
    }
    
    axios.delete(
      `https://elmanafea.shop/admin/rehladeletevideo/${content.videoId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )
      .then(() => {
        setContent(prevContent => ({
          ...prevContent,
          videoUrl: '',
          videoId: ''
        }));

        showToast.deleted(t('تم حذف الفيديو بنجاح'));
        return fetchVideoData();
      })
      .catch(err => {
        console.error('Error deleting video:', err);
        if (err.response && err.response.data && err.response.data.message) {
          showToast.error(t(err.response.data.message));
        } else {
          showToast.error(t('حدث خطأ أثناء حذف الفيديو'));
        }
      })
      .finally(() => {
        setIsLoading(false);
        setShowVideoDeleteConfirm(false);
      });
  };

  const openAddSectionModal = (type) => {
    setModalType(type);
    setTempValue('');
    setTempImageFile(null);
    setIsAddingSection(true);
    setShowEditModal(true);
  };

  const addSection = (type, contentValue) => {
    if (type === 'text') {
      setIsLoading(true);
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        showToast.error(t('جلسة المسؤول منتهية. يرجى تسجيل الدخول مرة أخرى'));
        setIsLoading(false);
        return;
      }
      
      axios.post(
        'https://elmanafea.shop/admin/rehlacontentitems',
        {
          contentItems: contentValue,
          lang: i18n.language
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
        .then(response => {
          axios.get(`https://elmanafea.shop/rehla/media?lang=${i18n.language}`)
            .then(response => {
              if (response.data && response.data.contentItems) {
                const contentItems = response.data.contentItems;
                
                const allSections = contentItems.map((item, index) => {
                  if (item.type === 'image') {
                    return {
                      id: item._id,
                      type: 'image',
                      imageUrl: `https://elmanafea.shop${item.content}`,
                      createdAt: item.createdAt,
                      index: index
                    };
                  } else if (item.type === 'subtitle') {
                    return {
                      id: item._id,
                      type: 'text',
                      content: item.content,
                      createdAt: item.createdAt,
                      index: index
                    };
                  }
                  return null;
                }).filter(item => item !== null);
                
                const imageItems = contentItems
                  .filter(item => item.type === 'image')
                  .map((item, index) => ({
                    id: item._id,
                    url: `https://elmanafea.shop${item.content}`,
                    createdAt: item.createdAt,
                    index: index
                  }));
                
                setImgs(imageItems);
                
                setContent(prevContent => ({
                  ...prevContent,
                  sections: allSections
                }));
              }
              showToast.added(t('تم إضافة النص بنجاح'));
            })        
        })
        .catch(err => {
          console.error('Error adding text section:', err);
          if (err.response && err.response.data && err.response.data.message) {
            showToast.error(t(err.response.data.message));
          } else {
            showToast.error(t('حدث خطأ أثناء إضافة قسم النص'));
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(true);
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        showToast.error(t('جلسة المسؤول منتهية. يرجى تسجيل الدخول مرة أخرى'));
        setIsLoading(false);
        return;
      }

      let formData = new FormData();
      formData.append('lang', i18n.language);

      if (tempImageFile) {
        formData.append('image', tempImageFile);
        
        axios.post(
          'https://elmanafea.shop/admin/rehlauploadimage',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        )
          .then(response => {
            axios.get(`https://elmanafea.shop/rehla/media?lang=${i18n.language}`)
              .then(response => {
                if (response.data && response.data.contentItems) {
                  const contentItems = response.data.contentItems;
                  
                  const allSections = contentItems.map((item, index) => {
                    if (item.type === 'image') {
                      return {
                        id: item._id,
                        type: 'image',
                        imageUrl: `https://elmanafea.shop${item.content}`,
                        createdAt: item.createdAt,
                        index: index
                      };
                    } else if (item.type === 'subtitle') {
                      return {
                        id: item._id,
                        type: 'text',
                        content: item.content,
                        createdAt: item.createdAt,
                        index: index
                      };
                    }
                    return null;
                  }).filter(item => item !== null);
                  
                  const imageItems = contentItems
                    .filter(item => item.type === 'image')
                    .map((item, index) => ({
                      id: item._id,
                      url: `https://elmanafea.shop${item.content}`,
                      createdAt: item.createdAt,
                      index: index
                    }));
                  
                  setImgs(imageItems);
                  
                  setContent(prevContent => ({
                    ...prevContent,
                    sections: allSections
                  }));
                }
                showToast.added(t('تم إضافة الصورة بنجاح'));
              })
          })
          .catch(err => {
            console.error('Error adding image section:', err);
            if (err.response && err.response.data && err.response.data.message) {
              showToast.error(t(err.response.data.message));
            } else {
              showToast.error(t('حدث خطأ أثناء إضافة قسم الصورة'));
            }
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else if (contentValue) {
        fetch(contentValue)
          .then(response => {
            if (!response.ok) throw new Error('Failed to fetch image');
            return response.blob();
          })
          .then(blob => {
            const file = new File([blob], "image.jpg", { type: blob.type });
            formData.append('image', file);
            
            return axios.post(
              'https://elmanafea.shop/admin/rehlauploadimage',
              formData,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data'
                }
              }
            );
          })
          .then(response => {
            if (response.data && response.data.imageUrl) {
              const newImage = {
                id: response.data.id || Date.now(),
                url: response.data.imageUrl
              };
              
              setImgs(prev => [...prev, newImage]);
              
              const newImageSection = {
                id: response.data.id || Date.now(),
                type: 'image',
                imageUrl: response.data.imageUrl
              };
              
              setContent(prevContent => ({
                ...prevContent,
                sections: [...prevContent.sections, newImageSection]
              }));
              showToast.added(t('تم إضافة الصورة بنجاح'));
            }
          })
          .catch(error => {
            console.error('Error creating file from URL:', error);
            showToast.error(t('رجاء اختيار ملف صورة صحيح أو إدخال رابط صحيح'));
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        showToast.error(t('الرجاء اختيار صورة أو إدخال رابط'));
        setIsLoading(false);
      }
    }
  };

  const updateSection = (id, newContent) => {
    const section = content.sections.find(s => s.id === id);
    
    if (section && section.type === 'text') {
      setIsLoading(true);
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        showToast.error(t('جلسة المسؤول منتهية. يرجى تسجيل الدخول مرة أخرى'));
        setIsLoading(false);
        return;
      }
      
      axios.put(
        `https://elmanafea.shop/admin/rehlaupdatesubtitle/${id}`,
        {
          content: newContent.content
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
        .then(() => {
          setContent({
            ...content,
            sections: content.sections.map(section =>
              section.id === id ? { ...section, ...newContent } : section
            )
          });
          showToast.edited(t('تم تحديث النص بنجاح'));
        })
        .catch(err => {
          console.error('Error updating text section:', err);
          if (err.response && err.response.data && err.response.data.message) {
            showToast.error(t(err.response.data.message));
          } else {
            showToast.error(t('حدث خطأ أثناء تحديث قسم النص'));
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (section && section.type === 'image') {
      setIsLoading(true);
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        showToast.error(t('جلسة المسؤول منتهية. يرجى تسجيل الدخول مرة أخرى'));
        setIsLoading(false);
        return;
      }
      
      if (tempImageFile) {
        const formData = new FormData();
        formData.append('image', tempImageFile);
        formData.append('lang', i18n.language);
        
        axios.put(
          `https://elmanafea.shop/admin/rehlaupdateimage/${id}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        )
          .then(response => {
            if (response.data && response.data.imageUrl) {
              const updatedImageSection = {
                id: response.data._id || id,
                type: 'image',
                imageUrl: response.data.imageUrl,
                createdAt: new Date().toISOString()
              };
              
              setContent(prevContent => ({
                ...prevContent,
                sections: prevContent.sections.map(s =>
                  s.id === id ? updatedImageSection : s
                )
              }));
              
              setImgs(prev => prev.map(img => img.id === id ? { id, url: response.data.imageUrl } : img));
              showToast.edited(t('تم تحديث الصورة بنجاح'));
            }
          })
          .catch(err => {
            console.error('Error updating image section:', err);
            if (err.response && err.response.data && err.response.data.message) {
              showToast.error(t(err.response.data.message));
            } else {
              showToast.error(t('حدث خطأ أثناء تحديث الصورة'));
            }
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else if (newContent.imageUrl && newContent.imageUrl !== section.imageUrl) {
        fetch(newContent.imageUrl)
          .then(response => {
            if (!response.ok) throw new Error('Failed to fetch image');
            return response.blob();
          })
          .then(blob => {
            const formData = new FormData();
            formData.append('image', blob, 'image.jpg');
            formData.append('lang', i18n.language);
            
            return axios.put(
              `https://elmanafea.shop/admin/rehlaupdateimage/${id}`,
              formData,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data'
                }
              }
            );
          })
          .then(uploadResponse => {
            if (uploadResponse.data && uploadResponse.data.imageUrl) {
              const updatedImageSection = {
                id: uploadResponse.data._id || id,
                type: 'image',
                imageUrl: uploadResponse.data.imageUrl,
                createdAt: new Date().toISOString()
              };
              
              setContent(prevContent => ({
                ...prevContent,
                sections: prevContent.sections.map(s =>
                  s.id === id ? updatedImageSection : s
                )
              }));
              
              setImgs(prev => prev.map(img => img.id === id ? { id, url: uploadResponse.data.imageUrl } : img));
              showToast.edited(t('تم تحديث الصورة بنجاح'));
            }
          })
          .catch(error => {
            console.error('Error updating image from URL:', error);
            showToast.error(t('حدث خطأ أثناء تحديث الصورة من الرابط'));
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    } else {
      setContent({
        ...content,
        sections: content.sections.map(section =>
          section.id === id ? { ...section, ...newContent } : section
        )
      });
    }
  };

  const deleteSection = (id) => {
    setSectionToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmSectionDelete = () => {
    if (!sectionToDelete) return;
    
    const section = content.sections.find(s => s.id === sectionToDelete);
    
    setIsLoading(true);
    
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showToast.error(t('جلسة المسؤول منتهية. يرجى تسجيل الدخول مرة أخرى'));
      setIsLoading(false);
      return;
    }
    
    if (section && section.type === 'text') {
      axios.delete(
        `https://elmanafea.shop/admin/rehladeletesubtitle/${sectionToDelete}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
        .then(() => {
          setContent({
            ...content,
            sections: content.sections.filter(section => section.id !== sectionToDelete)
          });
          showToast.deleted(t('تم حذف النص بنجاح'));
        })
        .catch(err => {
          console.error('Error deleting section:', err);
          if (err.response && err.response.data && err.response.data.message) {
            showToast.error(t(err.response.data.message));
          } else {
            showToast.error(t('حدث خطأ أثناء حذف القسم'));
          }
        })
        .finally(() => {
          setIsLoading(false);
          setShowDeleteConfirm(false);
          setSectionToDelete(null);
        });
    } else if (section && section.type === 'image') {
      axios.delete(
        `https://elmanafea.shop/admin/rehladeleteimage/${sectionToDelete}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
        .then(() => {
          setContent({
            ...content,
            sections: content.sections.filter(section => section.id !== sectionToDelete)
          });
          
          setImgs(prev => prev.filter(img => img.id !== sectionToDelete));
          showToast.deleted(t('تم حذف الصورة بنجاح'));
        })
        .catch(err => {
          console.error('Error deleting section:', err);
          if (err.response && err.response.data && err.response.data.message) {
            showToast.error(t(err.response.data.message));
          } else {
            showToast.error(t('حدث خطأ أثناء حذف القسم'));
          }
        })
        .finally(() => {
          setIsLoading(false);
          setShowDeleteConfirm(false);
          setSectionToDelete(null);
        });
    }
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setTempValue(section.type === 'text' ? section.content : section.imageUrl);
    setModalType(section.type);
    setShowEditModal(true);
  };

  const handleSaveSection = () => {
    if (isAddingSection) {
      addSection(modalType, tempValue);
      setIsAddingSection(false);
    } else {
      updateSection(editingSection.id, modalType === 'text' ? { content: tempValue } : { imageUrl: tempValue });
    }
    setShowEditModal(false);
    setEditingSection(null);
    setTempValue('');
    setTempImageFile(null);
  };

  const renderVideoContent = () => {
    if (!content.videoUrl) {
      return (
        <div className="video-placeholder">
          {isAdmin ? (
            <div className="admin-video-placeholder">
              <FontAwesomeIcon icon={faFileUpload} size="2x" />
              <p>{t('اضغط على زر التعديل لرفع فيديو')}</p>
            </div>
          ) : (
            <p>{t('لا يوجد فيديو متاح حالياً')}</p>
          )}
        </div>
      );
    } else {
      return (
        <div className="video-container">
          {isVideoLoading && (
            <div className="video-loader">
              <span className="loader"></span>
              <p>{t('جاري تحميل الفيديو...')}</p>
            </div>
          )}
          <video
            className="rehla-video"
            controls
            preload="auto"
            onCanPlay={() => setIsVideoLoading(false)}
            onWaiting={() => setIsVideoLoading(true)}
            onPlaying={() => setIsVideoLoading(false)}
          >
            <source src={"https://elmanafea.shop" + content.videoUrl} type="video/mp4" />
            {t('متصفحك لا يدعم تشغيل الفيديو')}
          </video>
        </div>
      );
    }
  };

  const renderOrderedContent = () => {
    const orderedSections = [...content.sections].sort((a, b) => a.index - b.index);
    
    return (
      <div className="flowing-content" dir={getDirection()}>
        {orderedSections.map((section) => (
          <React.Fragment key={section.id}>
            {section.type === 'text' ? (
              <p style={section.style} className={`flowing-text text-${getDirection()}`}>
                {section.content}
              </p>
            ) : (
              <div className="flowing-image">
                <img src={section.imageUrl} alt="" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="rehla-container" dir={getDirection()}>
        <div className="video-section">
          {renderVideoContent()}
          {isAdmin && (
            <button 
              className={content.videoUrl ? "video-delete-btn" : "video-edit-btn"} 
              onClick={content.videoUrl ? handleDeleteVideo : handleVideoChange} 
              title={content.videoUrl ? t('حذف الفيديو') : t('تغيير الفيديو')}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={content.videoUrl ? faTrash : faFileUpload} />
              {isLoading && <span className="loading-spinner"></span>}
            </button>
          )}
        </div>

        {isAdmin ? (
          <div className={`admin-content-sections dir-${getDirection()}`}>
            {[...content.sections].sort((a, b) => a.index - b.index).map((section) => (
              <div key={section.id} className="content-section">
                {section.type === 'text' ? (
                  <div className={`text-content text-${getDirection()}`} style={section.style}>
                    {editMode ? (
                      <textarea
                        value={section.content}
                        onChange={(e) => updateSection(section.id, { content: e.target.value })}
                        style={section.style}
                        dir={getDirection()}
                      />
                    ) : (
                      <p style={section.style}>{section.content}</p>
                    )}
                  </div>
                ) : section.type === 'image' ? (
                  <div className="image-content">
                    <img src={section.imageUrl} alt="" />
                    {editMode && (
                      <input
                        type="text"
                        value={section.imageUrl}
                        onChange={(e) => updateSection(section.id, { imageUrl: e.target.value })}
                        placeholder="رابط الصورة"
                        dir={getDirection()}
                      />
                    )}
                  </div>
                ) : null}
                <div className={`section-controls controls-${getDirection()}`}>
                  <FontAwesomeIcon
                    icon={faEdit}
                    onClick={() => handleEditSection(section)}
                  />
                  <FontAwesomeIcon
                    icon={faTrash}
                    onClick={() => deleteSection(section.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          renderOrderedContent()
        )}
        
        {isAdmin && (
          <div className="add-section-controls">
            <button onClick={() => openAddSectionModal('text')}>إضافة نص</button>
            <button onClick={() => openAddSectionModal('image')}>إضافة صورة</button>
          </div>
        )}
      </div>

      {showVideoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{t('تعديل الفيديو')}</h3>

            <div className="file-upload-container">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoFileChange}
                ref={fileInputRef}
                className="file-input"
              />
              <button
                className="file-upload-btn"
                onClick={() => fileInputRef.current.click()}
              >
                {t('اختر ملف فيديو')}
              </button>
              {tempVideoFile && (
                <div className="selected-file">
                  {tempVideoFile.name}
                </div>
              )}

              {tempVideoFile && (
                <div className="video-preview">
                  <video controls width="100%" height="150">
                    <source src={tempValue} type="video/mp4" />
                    {t('متصفحك لا يدعم تشغيل الفيديو')}
                  </video>
                </div>
              )}
            </div>

            <div className="modal-buttons">
              <button
                onClick={handleSaveVideo}
                className="save-btn"
                disabled={isUploading || !tempVideoFile}
              >
                {isUploading ? t('جاري الرفع...') : t('حفظ')}
              </button>
              <button onClick={() => {
                setShowVideoModal(false);
                setTempValue('');
                setTempVideoFile(null);
              }} className="cancel-btn">
                {t('إلغاء')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              {isAddingSection 
                ? (modalType === 'text' ? 'إضافة نص جديد' : 'إضافة صورة جديدة')
                : (modalType === 'text' ? 'تعديل النص' : 'تعديل رابط الصورة')
              }
            </h3>
            {modalType === 'text' ? (
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                placeholder={isAddingSection ? "أدخل النص الجديد هنا" : "أدخل النص"}
                className="modal-textarea"
              />
            ) : (
              <div className="file-upload-container">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  ref={imageInputRef}
                  className="file-input"
                />
                <button
                  className="file-upload-btn"
                  onClick={() => imageInputRef.current.click()}
                >
                  {t('اختر ملف صورة')}
                </button>
                {tempImageFile && (
                  <div className="selected-file">
                    {tempImageFile.name}
                  </div>
                )}
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  placeholder={isAddingSection ? "أدخل رابط الصورة الجديدة" : "أدخل رابط الصورة"}
                  className="modal-input"
                />
              </div>
            )}
            <div className="modal-buttons">
              <button 
                onClick={handleSaveSection} 
                className="save-btn"
                disabled={isLoading}
              >
                {isLoading ? t('جاري الحفظ...') : t('حفظ')}
              </button>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSection(null);
                  setTempValue('');
                  setTempImageFile(null);
                  setIsAddingSection(false);
                }} 
                className="cancel-btn"
              >
                {t('إلغاء')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{t('تأكيد الحذف')}</h3>
            <p>{t('هل أنت متأكد من حذف هذا القسم؟')}</p>
            <div className="modal-buttons">
              <button 
                onClick={confirmSectionDelete} 
                className="delete-btn"
              >
                {t('نعم، حذف')}
              </button>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSectionToDelete(null);
                }} 
                className="cancel-btn"
              >
                {t('إلغاء')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showVideoDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{t('تأكيد الحذف')}</h3>
            <p>{t('هل أنت متأكد من حذف هذا الفيديو؟')}</p>
            <div className="modal-buttons">
              <button 
                onClick={confirmVideoDelete} 
                className="delete-btn"
              >
                {t('نعم، حذف')}
              </button>
              <button 
                onClick={() => setShowVideoDeleteConfirm(false)} 
                className="cancel-btn"
              >
                {t('إلغاء')}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Rehla;
