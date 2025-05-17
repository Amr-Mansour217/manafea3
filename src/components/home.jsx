import React, { useState, useEffect, useCallback, Suspense } from 'react';
import './home.css';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faCheckCircle, faCircleXmark, faEllipsisVertical, faPenToSquare, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { IoStar } from "react-icons/io5";
import Header from './header'
import Footer from './footer'
import { toast } from 'react-hot-toast';
import { showToast } from './Toast';
import Louder from './louder';

// كلاس لإدارة قسم العرض الرئيسي (Hero)
class HeroSectionManager {
  constructor(i18n, setHeroBackgrounds, setTexts, setHeaderData) {
    this.i18n = i18n;
    this.setHeroBackgrounds = setHeroBackgrounds;
    this.setTexts = setTexts;
    this.setHeaderData = setHeaderData;
    this.apiBaseUrl = 'https://elmanafea.shop';
  }

  fetchHeaderData() {
    return axios.get(`${this.apiBaseUrl}/header?lang=${this.i18n.language}`)
      .then(response => {

        if (response.data?.header) {
          this.setHeaderData(response.data);
          localStorage.setItem('headerData', JSON.stringify(response.data));
          
          this.setTexts(prev => ({
            ...prev,
            [this.i18n.language]: {
              ...prev[this.i18n.language],
              hero: {
                ...prev[this.i18n.language]?.hero,
                title: response.data.header
              }
            }
          }));
        }
      })
      .catch(error => {
        const cachedHeader = localStorage.getItem('headerData');
        if (cachedHeader) {
          this.setHeaderData(JSON.parse(cachedHeader));
        }
      });
  }

  fetchSecondHeaderData() {
    return axios.get(`${this.apiBaseUrl}/secondheader?lang=${this.i18n.language}`)
      .then(response => {

        if (response.data?.second_header) {
          this.setTexts(prev => ({
            ...prev,
            [this.i18n.language]: {
              ...prev[this.i18n.language],
              hero: {
                ...prev[this.i18n.language]?.hero,
                description: response.data.second_header
              }
            }
          }));
        }
      })
      .catch(error => {
      });
  }

  fetchHeroImage() {
    return axios.get(`${this.apiBaseUrl}/image`)
      .then(response => {

        if (response.data?.image) {
          const fullImageUrl = response.data.image.startsWith('http') 
            ? response.data.image 
            : `${this.apiBaseUrl}${response.data.image}`;


          const newBackgrounds = {
            ar: fullImageUrl,
            en: fullImageUrl,
            fr: fullImageUrl,
            tr: fullImageUrl,
            id: fullImageUrl,
            ru: fullImageUrl,
            hi: fullImageUrl,
            ur: fullImageUrl,
            bn: fullImageUrl,
            zh: fullImageUrl,
            tl: fullImageUrl,
            fa: fullImageUrl,
            ha: fullImageUrl
          };

          this.setHeroBackgrounds(newBackgrounds);
          localStorage.setItem('heroBackgrounds', JSON.stringify(newBackgrounds));
        }
      })
      .catch(error => {
      });
  }

  handleHeroBackgroundChange(e, adminToken) {
    const file = e.target.files[0];
    if (file) {
      if (!adminToken) {
        alert('يرجى تسجيل الدخول كمشرف أولاً');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);
      formData.append('lang', 'ar');

      axios.post(`${this.apiBaseUrl}/admin/uploadimage`, 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      .then(response => {
        if (response.status === 200) {
          // إضافة تأخير 800 مللي ثانية قبل الحصول على البيانات المحدثة
          setTimeout(() => {
            this.fetchHeroImage();
            alert('تم تحديث صورة الخلفية بنجاح');
          }, 800);
        }
      })
      .catch(error => {
        alert(error.response?.data?.message || 'حدث خطأ في عملية تحديث الصورة');
      });
    }
  }
}

// كلاس لإدارة قسم الفيديوهات
class VideoSectionManager {
  constructor(i18n, setVideos, setTexts) {
    this.i18n = i18n;
    this.setVideos = setVideos;
    this.setTexts = setTexts;
    this.apiBaseUrl = 'https://elmanafea.shop';
  }

  formatYoutubeUrl(url) {
    if (!url) return '';
    let videoId;
    
    // تعامل مع الرابط العادي للمشاهدة
    if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1].split('&')[0];
    } 
    // تعامل مع الرابط المختصر
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } 
    // تعامل مع رابط التضمين مباشرة
    else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    }
    // تعامل مع الرابط الذي يحتوي على معرف الفيديو فقط
    else {
      videoId = url.trim();
    }
    
    return `https://www.youtube.com/embed/${videoId}`;
  }

  fetchLessonWord() {
    return axios.get(`${this.apiBaseUrl}/admin/lessonword?lang=${this.i18n.language}`)
      .then(response => {

        if (response.data?.lesson_word) {
          this.setTexts(prev => ({
            ...prev,
            [this.i18n.language]: {
              ...prev[this.i18n.language],
              section: {
                ...prev[this.i18n.language]?.section,
                title: response.data.lesson_word
              }
            }
          }));
        }
      })
      .catch(error => {
      });
  }

  fetchVideos() {
    return axios.get(`${this.apiBaseUrl}/homevideos?lang=${this.i18n.language}`)
      .then(response => {

        if (response.data.videos) {
          const formattedVideos = response.data.videos.map(video => {
            
            let videoLink = '';
            if (video.videoType === 'youtube') {
              videoLink = video.youtubeEmbedUrl;
            } else if (video.videoType === 'upload') {
              videoLink = `${this.apiBaseUrl}${video.videoPath}`;
            }

            return {
              id: video._id,
              title: video.title,
              link: videoLink,
              videoType: video.videoType,
            };
          });

          this.setVideos(formattedVideos);
        }
      })
      .catch(error => {
        toast.error('حدث خطأ أثناء تحميل الفيديوهات');
      });
  }

  handleAddVideo(newVideoData, adminToken) {
    if (!newVideoData.title || (!newVideoData.youtubeEmbedUrl && !newVideoData.videoFile)) {
      showToast.error('الرجاء إدخال جميع البيانات المطلوبة');
      return;
    }

    if (!adminToken) {
      showToast.error('يرجى تسجيل الدخول كمشرف أولاً');
      return;
    }

    const formData = new FormData();
    formData.append('title', newVideoData.title);
    formData.append('lang', this.i18n.language);

    if (newVideoData.videoType === 'youtube') {
      formData.append('videoType', 'youtube');
      formData.append('youtubeEmbedUrl', this.formatYoutubeUrl(newVideoData.youtubeEmbedUrl));
    } else {
      formData.append('videoType', 'upload');
      formData.append('video', newVideoData.videoFile);
    }

    return axios.post(`${this.apiBaseUrl}/admin/homeuploadvideo`, 
      formData,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    .then(() => {
      // إضافة تأخير 800 مللي ثانية قبل الحصول على البيانات المحدثة
      setTimeout(() => {
        this.fetchVideos();
      }, 800);
      
      return {
        title: '',
        youtubeEmbedUrl: '',
        videoFile: null,
        videoType: 'youtube'
      };
    })
    .catch(error => {
      showToast.error(error.response?.data?.message || 'حدث خطأ أثناء رفع الفيديو');
      throw error;
    });
  }

  handleEditVideo(editingItem, editValue, adminToken) {
    if (!editValue.title) {
      showToast.error('الرجاء إدخال عنوان الفيديو');
      return;
    }
    
    // التأكد من إدخال الرابط فقط إذا كان الفيديو من نوع يوتيوب
    if (editValue.type === 'youtube' && !editValue.link) {
      showToast.error('الرجاء إدخال رابط الفيديو');
      return;
    }

    if (!adminToken) {
      showToast.error('يرجى تسجيل الدخول كمشرف أولاً');
      return;
    }

    // تحضير البيانات الأساسية للتحديث (العنوان واللغة)
    const updateData = {
      title: editValue.title,
      lang: this.i18n.language
    };
    
    if (editValue.type === 'youtube') {
      const formattedUrl = this.formatYoutubeUrl(editValue.link);
      updateData.youtubeEmbedUrl = formattedUrl;
    }


    return axios.put(
      `${this.apiBaseUrl}/admin/homeupdatevideo/${editingItem.id}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    )
    .then(response => {
      if (response.status === 200) {
        // إضافة تأخير 800 مللي ثانية قبل الحصول على البيانات المحدثة
        setTimeout(() => {
          this.fetchVideos();
          showToast.edited(`تم تحديث فيديو "${editValue.title}" بنجاح`);
        }, 800);
        return true;
      }
    })
    .catch(error => {
      if (error.response) {
      }
      showToast.error(error.response?.data?.message || 'حدث خطأ أثناء تحديث الفيديو');
      throw error;
    });
  }

  handleDeleteVideo(videoId, adminToken) {
    if (!adminToken) {
      showToast.error('يرجى تسجيل الدخول كمشرف أولاً');
      return;
    }

    return axios.delete(
      `${this.apiBaseUrl}/admin/homedeletevideo/${videoId}`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          lang: this.i18n.language
        }
      }
    )
    .then(response => {
      if (response.status === 200) {
        // إضافة تأخير 800 مللي ثانية قبل الحصول على البيانات المحدثة
        setTimeout(() => {
          this.fetchVideos();
          showToast.deleted('تم حذف الفيديو بنجاح');
        }, 800);
        return true;
      }
    })
    .catch(error => {
      showToast.error(error.response?.data?.message || 'حدث خطأ أثناء حذف الفيديو');
      throw error;
    });
  }

  saveSectionTitle(editValue, adminToken) {
    const currentLang = this.i18n.language;
      
    if (!adminToken) {
      alert('يرجى تسجيل الدخول كمشرف أولاً');
      return;
    }

    // Update lesson word
    return axios.post(`${this.apiBaseUrl}/admin/lessonword`, {
      lesson_word: editValue,
      lang: currentLang,
      index: 1
    }, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    })
    .then(response => {
      if (response.status === 200) {
        // إضافة تأخير 800 مللي ثانية قبل الحصول على البيانات المحدثة
        setTimeout(() => {
          this.fetchLessonWord();
          showToast.edited('تم تحديث عنوان القسم بنجاح');
        }, 800);
        return true;
      }
    })
    .catch(error => {
      showToast.error(error.response?.data?.message || 'حدث خطأ في عملية التحديث');
      throw error;
    });
  }
}

// كلاس لإدارة قسم التقييمات
class RatingSectionManager {
  constructor() {
    this.apiBaseUrl = 'https://elmanafea.shop';
  }

  submitFeedback(stars, comment, t) {
    if (stars === 0) {
      return {
        success: false,
        message: t("يرجى اختيار عدد النجوم قبل الإرسال")
      };
    }

    if (comment.trim() === '') {
      return {
        success: false,
        message: t("يرجى كتابة تعليق قبل الإرسال")
      };
    }

    return axios.post(`${this.apiBaseUrl}/feedback`, {
      stars: stars,
      comment: comment
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    })
    .then(response => {
      if (response.status === 200) {
        return { success: true };
      } else {
        throw new Error('Unexpected response from server');
      }
    })
    .catch(error => {
      let errorMessage = t('An error occurred while submitting feedback.');
      if (error.response) {
        errorMessage = `${t('Server error')}: ${error.response.status}`;
        if (error.response.data && error.response.data.message) {
          errorMessage += ` - ${error.response.data.message}`;
        }
      } else if (error.request) {
        errorMessage = t('لم يتم تلقي أي رد من الخادم. يُرجى التحقق من اتصالك بالإنترنت.');
      } else {
        errorMessage = error.message;
      }
      return { success: false, message: errorMessage };
    });
  }

  downloadFeedbacks(adminToken) {
    if (!adminToken) {
      showToast.error('يرجى تسجيل الدخول كمشرف أولاً');
      return Promise.reject();
    }
    
    return axios.get(`${this.apiBaseUrl}/admin/feedbacks`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      responseType: 'blob'
    })
    .then(response => {
      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'feedbacks.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToast.success('تم تحميل التعليقات بنجاح');
    })
    .catch(error => {
      showToast.error('حدث خطأ أثناء تحميل ملف التعليقات');
      throw error;
    });
  }
}

// الكلاس الرئيسي للصفحة - يجمع بين كل المكونات
class HomePageManager {
  constructor(i18n) {
    this.i18n = i18n;
  }

  getHeroText(texts, section, key, headerData) {
    if (section === 'hero' && key === 'title') {
      return headerData?.header || texts[this.i18n.language]?.[section]?.[key] || texts['ar'][section][key];
    }
    const currentLang = this.i18n.language;
    return texts[currentLang]?.[section]?.[key] || texts['ar'][section][key];
  }

  getHeaderTitle(headerData, texts) {
    if (headerData?.header) {
      return headerData.header;
    }
    
    const cachedHeader = localStorage.getItem('headerData');
    if (cachedHeader) {
      const parsed = JSON.parse(cachedHeader);
      return parsed.header;
    }
    
    return texts[this.i18n.language]?.hero?.title || texts.ar.hero.title;
  }

  saveHeroEdit(editingItem, editValue, adminToken) {
    const currentLang = this.i18n.language;
    
    if (!adminToken) {
      alert('يرجى تسجيل الدخول كمشرف أولاً');
      return Promise.reject();
    }

    if (editingItem.key === 'title') {
      // Update main title
      return axios.post('https://elmanafea.shop/admin/header', {
        header: editValue,
        lang: currentLang,
        index: 1
      }, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
    } else if (editingItem.key === 'description') {
      // Update subtitle
      return axios.post('https://elmanafea.shop/admin/secondheader', {
        second_header: editValue,
        lang: currentLang,
        index: 1
      }, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
    }

    return Promise.reject(new Error('Unknown edit item'));
  }
}

const Home = () => {
  const { t, i18n } = useTranslation();
  const [stars, setStars] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [videos, setVideos] = useState([]);
  const [translations, setTranslations] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [heroBackgrounds, setHeroBackgrounds] = useState(() => {
    const savedBackgrounds = localStorage.getItem('heroBackgrounds');
    return savedBackgrounds ? JSON.parse(savedBackgrounds) : {};
  });
  const [texts, setTexts] = useState(() => {
    const savedTexts = localStorage.getItem('headerTexts');
    return savedTexts ? JSON.parse(savedTexts) : {
      ar: {
        hero: {
          // description: '﴿ شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ ﴾'
        },
        section: {
          // title: 'أحدث الدروس',
          more: 'عرض المزيد من الدروس'
        }
      }
    };
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [newVideoData, setNewVideoData] = useState({
    title: '',
    youtubeEmbedUrl: '',
    videoFile: null,
    videoType: 'youtube' // Can be 'youtube' or 'local'
  });
  const [headerData, setHeaderData] = useState(() => {
    const savedHeader = localStorage.getItem('headerData');
    return savedHeader ? JSON.parse(savedHeader) : null;
  });

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // إنشاء كائنات المدير
  const heroManager = new HeroSectionManager(i18n, setHeroBackgrounds, setTexts, setHeaderData);
  const videoManager = new VideoSectionManager(i18n, setVideos, setTexts);
  const ratingManager = new RatingSectionManager();
  const pageManager = new HomePageManager(i18n);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    setIsAdmin(!!adminToken);
  }, []);

  useEffect(() => {
    const currentLanguage = i18n.language;
    const savedVideos = localStorage.getItem('homeVideos');
    if (savedVideos) {
      const parsedVideos = JSON.parse(savedVideos);
      setVideos(parsedVideos[currentLanguage] || []);
    }
  }, [i18n.language]);

  useEffect(() => {
    const savedTranslations = localStorage.getItem('translations');
    if (savedTranslations) {
      setTranslations(JSON.parse(savedTranslations));
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    
    Promise.all([
      heroManager.fetchHeaderData(),
      heroManager.fetchSecondHeaderData(),
      heroManager.fetchHeroImage(),
      videoManager.fetchLessonWord(),
      videoManager.fetchVideos()
    ])
    .finally(() => {
      setIsLoading(false);
    });
  }, [i18n.language]);

  useEffect(() => {
    if (headerData?.header) {
    }
  }, [headerData]);

  const handleStarClick = useCallback((selectedStars) => {
    setStars(selectedStars);
  }, []);

  const handleStarHover = useCallback((hoveredRating) => {
    setHoverRating(hoveredRating);
  }, []);

  const handleStarLeave = useCallback(() => {
    setHoverRating(0);
  }, []);

  const handleCommentChange = useCallback((e) => {
    setComment(e.target.value);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const closeErrorModal = useCallback(() => {
    setIsErrorModalOpen(false);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // التحقق من وجود تقييم بالنجوم
    if (stars === 0) {
      setErrorMessage(t('يرجى اختيار تقييم بالنجوم قبل الإرسال'));
      setIsErrorModalOpen(true);
      return;
    }
    
    // التحقق من وجود تعليق
    if (!comment.trim()) {
      setErrorMessage(t('يرجى كتابة تعليق قبل الإرسال'));
      setIsErrorModalOpen(true);
      return;
    }
    
    ratingManager.submitFeedback(stars, comment, t)
      .then(result => {
        if (result.success) {
          setIsModalOpen(true);
          setStars(0);
          setComment('');
        } else {
          setErrorMessage(result.message);
          setIsErrorModalOpen(true);
        }
      });
  }, [stars, comment, t]);

  const handleHeroBackgroundChange = (e) => {
    const adminToken = localStorage.getItem('adminToken');
    heroManager.handleHeroBackgroundChange(e, adminToken);
  };

  const handleAddVideo = () => {
    setShowAddVideoModal(false);
    const adminToken = localStorage.getItem('adminToken');
    
    videoManager.handleAddVideo(newVideoData, adminToken)
      .then(resetData => {
        setNewVideoData(resetData);
      })
      .catch(() => {
        // Error is already handled in the manager class
      });
  };

  const handleEditVideo = () => {
    const adminToken = localStorage.getItem('adminToken');
    
    videoManager.handleEditVideo(editingItem, editValue, adminToken)
      .then(success => {
        if (success) {
          setEditModalOpen(false);
          setEditValue(null);
          setEditingItem(null);
        }
      })
      .catch(() => {
        // Error is already handled in the manager class
      });
  };

  const handleSaveEdit = () => {
    if (editingItem?.type === 'video') {
      handleEditVideo();
      return;
    } 
    
    if (editingItem?.section === 'hero') {
      const adminToken = localStorage.getItem('adminToken');
      
      pageManager.saveHeroEdit(editingItem, editValue, adminToken)
        .then(response => {
          if (response.status === 200) {
            // إضافة تأخير 800 مللي ثانية قبل الحصول على البيانات المحدثة
            setTimeout(() => {
              if (editingItem.key === 'title') {
                heroManager.fetchHeaderData();
              } else if (editingItem.key === 'description') {
                heroManager.fetchSecondHeaderData();
              }
            }, 800);
          }
        })
        .catch(error => {
          showToast.error(error.response?.data?.message || 'حدث خطأ في عملية التحديث');
        });
    } else if (editingItem?.section === 'section' && editingItem?.key === 'title') {
      const adminToken = localStorage.getItem('adminToken');
      videoManager.saveSectionTitle(editValue, adminToken);
    }

    setEditModalOpen(false);
    setEditingItem(null);
    setEditValue(null);
    setSelectedFile(null);
  };

  const confirmDeleteVideo = () => {
    const adminToken = localStorage.getItem('adminToken');
    
    videoManager.handleDeleteVideo(videoToDelete, adminToken)
      .then(success => {
        if (success) {
          setShowDeleteConfirmModal(false);
          setVideoToDelete(null);
        }
      })
      .catch(() => {
        // Error is already handled in the manager class
      });
  };

  const downloadFeedbacks = () => {
    setIsDownloading(true);
    const adminToken = localStorage.getItem('adminToken');
    
    ratingManager.downloadFeedbacks(adminToken)
      .finally(() => {
        setIsDownloading(false);
      });
  };

  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => {
        setIsModalOpen(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  const handleEditClick = (key, section, value) => {
    // لا تسمح بتحرير 'more' في قسم 'section'
    if (section === 'section' && key === 'more') {
      return;
    }
    
    setEditingItem({
      key,
      section,
      originalText: value,
      initialValue: translations[i18n.language]?.[value] || value
    });
    setEditValue(value);
    setEditModalOpen(true);
  };

  const getHeroText = useCallback((section, key) => {
    return pageManager.getHeroText(texts, section, key, headerData);
  }, [texts, i18n.language, headerData]);

  const getHeaderTitle = useCallback(() => {
    return pageManager.getHeaderTitle(headerData, texts);
  }, [headerData, texts, i18n.language]);

  const handleDeleteVideo = (videoId) => {
    setVideoToDelete(videoId);
    setShowDeleteConfirmModal(true);
  };

  const handleVideoEditClick = (video) => {
    
    // تحديد نوع الفيديو من البيانات بشكل صحيح
    const videoType = video.videoType;
    
    setEditingItem({ 
      type: 'video', 
      index: videos.findIndex(v => v.id === video.id), 
      id: video.id,
      title: video.title, 
      link: video.link,
      videoType: videoType
    });
    
    setEditValue({ 
      title: video.title, 
      link: video.link,
      type: videoType
    });
    
    setEditModalOpen(true);
  };

  if (isLoading) {
    return <div><Louder /></div>;
  }

  return (
    <Suspense fallback={<Louder />}>
      <>
      <Header />
      <aside 
        className="hero"
        style={{
          backgroundImage: `url("${heroBackgrounds[i18n.language] || ''}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
        {isAdmin && (
          <FontAwesomeIcon 
            icon={faPenToSquare} 
            className="edit-icon hero-edit-icon"
            onClick={() => document.getElementById('heroBackgroundInput').click()}
          />
        )}
        <div className="hero-pattern">
          <input
            type="file"
            id="heroBackgroundInput"
            accept="image/*"
            onChange={handleHeroBackgroundChange}
            style={{ display: 'none' }}
          />
        </div>
        <div className="hero-content">
          <div className="editable-container">  
            <h1>
              {headerData?.header || (texts.ar?.hero?.title || 'جاري التحميل...')}
            </h1>   
            {isAdmin && (
              <FontAwesomeIcon 
                icon={faEllipsisVertical} 
                className="edit-icon"
                onClick={() => handleEditClick('title', 'hero', headerData?.header || '')}
              />
            )}
          </div>
          <div className="editable-container">
            <p>{getHeroText('hero', 'description')}</p>
            {isAdmin && (
              <FontAwesomeIcon 
                icon={faEllipsisVertical} 
                className="edit-icon"
                onClick={() => handleEditClick('description', 'hero', getHeroText('hero', 'description'))}
              />
            )}
          </div>
        </div>
        <div className="hero-shape">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>
      </aside>
      <div className="videos-section">
        <div className="section-title">
          <div className="editable-container">
            <h4>{getHeroText('section', 'title')}</h4>
            {isAdmin && (<FontAwesomeIcon 
                icon={faEllipsisVertical} 
                className="edit-icon edit-icon-color"
                onClick={() => handleEditClick('title', 'section', getHeroText('section', 'title'))}
              />
            )}
          </div>
        </div>
        
        <div className="videos-grid">
          {videos.map((video) => (
            <div className="video-card" key={video.id}>
              <div className="video-thumbnail">
                {isAdmin && (
                  <div className="video-actions">
                    <FontAwesomeIcon 
                      icon={faTrash} 
                      className="delete-icon"
                      onClick={() => handleDeleteVideo(video.id)}    
                    />          
                    <FontAwesomeIcon 
                      icon={faPenToSquare} 
                      className="edit-icon"
                      onClick={() => handleVideoEditClick(video)}
                    />
                  </div>
                )}
                <div className="video-container">
                  {video.link ? (
                    <iframe 
                      src={video.link}
                      title={video.title}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  ) : (
                    <div className="video-error">الفيديو غير متوفر</div>
                  )}
                </div>
              </div>
              <div className="video-info">
                <h3 className="video-title">{video.title}</h3>
              </div>
            </div>
          ))}
        </div>
        
        {isAdmin && (
          <div className="add-video-btn-container">
            <button className="add-video-btn" onClick={() => setShowAddVideoModal(true)}>
              {t('إضافة فيديو جديد')}
            </button>
          </div>
        )}
        <div className="more-btn-container">
          <div className="editable-container">
            <a href="/videos" className="more-btn">
              {t('عرض المزيد من الدروس')}
              <FontAwesomeIcon icon={i18n.dir() === 'ltr' ? faArrowRight : faArrowLeft} />
            </a>
          </div>
        </div>
      </div>

      <main className="rating-section">
          <h2 className="rating-section-title">{t('شاركنا رأيك')}</h2>
          <div className="stars-container">
            {[1, 2, 3, 4, 5].map((index) => (
              <IoStar
                key={index}
                className={`star ${(hoverRating || stars) >= index ? 'active' : ''}`}  
                onClick={() => handleStarClick(index)}
                onMouseEnter={() => handleStarHover(index)}
                onMouseLeave={handleStarLeave}
              />
            ))}
          </div>
          <form className="feedback-form" onSubmit={handleSubmit}>
            <textarea
              placeholder={t("اكتب تعليقك هنا...")}
              value={comment}  
              onChange={handleCommentChange}  
            ></textarea>
            <button type="submit" className="submit-btn">{t("إرسال التقييم")}</button>
          </form>

          {isAdmin && (
            <div className="admin-download-btn-container">
              <button 
                className={`admin-download-btn ${isDownloading ? 'downloading' : ''}`} 
                onClick={downloadFeedbacks}
                disabled={isDownloading} // Disable button while downloading
              >
                {isDownloading ? (
                  <>
                    <span className="loader"></span> تحميل...
                  </>
                ) : (
                  t('تحميل التعليقات')
                )}
              </button>
            </div>
          )}
      </main>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-icon">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <h3 className="modal-title">{t('تم بنجاح!')}</h3>
            <p className="modal-message">{t('تم إرسال تقييمك بنجاح، شكراً لك!')}</p>
            <button className="modal-close-btn" onClick={closeModal}>
              {t('إغلاق')}
            </button>
          </div>
        </div>
      )}
      {/* ...existing code... */}
        
      {/* باقي الكود للنوافذ المنبثقة والأجزاء المتبقية من الصفحة */}
      {/* ... */}
      
      {/* النوافذ المنبثقة */}
      {isErrorModalOpen && (
        <div className="modal-overlay">
          <div className="error-modal">
            <div className="error-icon">
              <FontAwesomeIcon icon={faCircleXmark} />
            </div>
            <h3 className="modal-title">{t('خطأ!')}</h3>
            <p className="modal-message">{errorMessage}</p>
            <button className="modal-close-btn" onClick={closeErrorModal}>
              {t('إغلاق')}
            </button>
          </div>
        </div>
      )}

      {showAddVideoModal && (
        <div className="home-video-modal-overlay">
          <div className="home-video-modal">
            <h3 className="home-video-modal-title">إضافة فيديو جديد</h3>

            <div className="home-video-field">
              <label>عنوان الفيديو:</label>
              <input
                type="text"
                value={newVideoData.title}
                onChange={(e) => setNewVideoData(prev => ({ ...prev, title: e.target.value }))}
                className="home-video-input"
              />
            </div>

            <div className="home-video-field">
              <label>نوع الفيديو:</label>
              <select 
                value={newVideoData.videoType}
                onChange={(e) => setNewVideoData(prev => ({ ...prev, videoType: e.target.value }))}
                className="home-video-input"
              >
                <option value="youtube">يوتيوب</option>
                <option value="local">رفع من الجهاز</option>
              </select>
            </div>

            {newVideoData.videoType === 'youtube' ? (
              <div className="home-video-field">
                <label>رابط اليوتيوب:</label>
                <input
                  type="text"
                  value={newVideoData.youtubeEmbedUrl}
                  onChange={(e) => setNewVideoData(prev => ({ ...prev, youtubeEmbedUrl: e.target.value }))}
                  className="home-video-input"
                  placeholder="مثال: https://www.youtube.com/watch?v=HDBTmALzv-8"
                  dir="ltr"
                />
                <small className="input-hint">يمكنك إدخال أي نوع من روابط يوتيوب (رابط المشاهدة أو رابط مختصر)</small>
              </div>
            ) : (
              <div className="home-video-field">
                <label>ملف الفيديو:</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setNewVideoData(prev => ({ ...prev, videoFile: e.target.files[0] }))}
                  className="home-video-input"
                />
              </div>
            )}

            <div className="home-video-modal-buttons">
              <button 
                onClick={handleAddVideo} 
                className="home-video-save-btn"
                disabled={!newVideoData.title || (!newVideoData.youtubeEmbedUrl && !newVideoData.videoFile)}
              >
                حفظ
              </button>
              <button 
                onClick={() => {
                  setShowAddVideoModal(false);
                  setNewVideoData({ 
                    title: '', 
                    youtubeEmbedUrl: '', 
                    videoFile: null,
                    videoType: 'youtube'
                  });
                }} 
                className="home-video-cancel-btn"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {editModalOpen && editingItem?.type === 'video' ? (
        <div className="home-edit-modal-overlay">
          <div className="home-edit-modal">
            <h3 className="home-edit-modal-title">تعديل الفيديو</h3>

            <div className="home-edit-field">
              <label className="home-edit-label">عنوان الفيديو:</label>
              <input
                type="text"
                value={editValue.title}
                onChange={(e) => setEditValue(prev => ({ ...prev, title: e.target.value }))}
                className="home-edit-input"
              />
            </div>
            
            {/* إظهار حقل الرابط فقط إذا كان الفيديو من نوع يوتيوب */}
            {editValue.type === 'youtube' && (
              <div className="home-edit-field">
                <label className="home-edit-label">رابط اليوتيوب:</label>
                <input
                  type="text"
                  value={editValue.link}
                  onChange={(e) => setEditValue(prev => ({ ...prev, link: e.target.value }))}
                  className="home-edit-input"
                  placeholder="مثال: https://www.youtube.com/watch?v=HDBTmALzv-8"
                  dir="ltr"
                />
                <small className="input-hint">يمكنك إدخال أي نوع من روابط يوتيوب (رابط المشاهدة أو رابط مختصر)</small>
              </div>
            )}
            
            <div className="home-edit-buttons">
              <button 
                onClick={handleEditVideo} 
                className="home-edit-save-btn"
                disabled={!editValue.title || (editValue.type === 'youtube' && !editValue.link)}
              >
                حفظ
              </button>
              <button 
                onClick={() => {
                  setEditModalOpen(false);
                  setEditValue(null);
                  setEditingItem(null);
                }} 
                className="home-edit-cancel-btn"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      ) : editModalOpen && (
        <div className="home-modal-overlay">
          <div className="home-modal-wrapper">
            <h3 className="home-modal-title">تعديل النص ({i18n.language})</h3>
            <div className="home-modal-container">
              <p className="home-modal-text">النص:</p>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="home-modal-input"
                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
              />
              <div className="home-modal-actions">
                <button 
                  className="home-modal-save"
                  onClick={handleSaveEdit}
                >
                  حفظ
                </button>
                <button 
                  className="home-modal-cancel"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditValue('');
                  }}
                >
                إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmModal && (
        <div className="delete-confirm-modal-overlay">
          <div className="delete-confirm-modal">
            <h3>تأكيد الحذف</h3>
            <p>هل أنت متأكد من حذف هذا الفيديو؟</p>
            <div className="delete-confirm-actions">
              <button
                className="delete-confirm-btn confirm"
                onClick={confirmDeleteVideo}
              >
                نعم، احذف
              </button>
              <button
                className="delete-confirm-btn cancel"
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setVideoToDelete(null);
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
      </>
    </Suspense>
  );
}

export default Home;
