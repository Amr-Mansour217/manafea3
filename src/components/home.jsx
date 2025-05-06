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
import { showToast } from './Toast'; // استيراد دالة showToast
import Louder from './louder'; // استيراد مكون Louder

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
  const [isDownloading, setIsDownloading] = useState(false); // State to track download progress
  const [isLoading, setIsLoading] = useState(true);

  const formatYoutubeUrl = (url) => {
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
  };

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

  const fetchHeaderData = () => {
    return axios.get(`https://elmanafea.shop/header?lang=${i18n.language}`)
      .then(response => {
        console.log('Response from backend:', response.data);

        if (response.data?.header) {
          console.log('Found header:', response.data.header);
          setHeaderData(response.data);
          localStorage.setItem('headerData', JSON.stringify(response.data));
          
          setTexts(prev => ({
            ...prev,
            [i18n.language]: {
              ...prev[i18n.language],
              hero: {
                ...prev[i18n.language]?.hero,
                title: response.data.header
              }
            }
          }));
        }
      })
      .catch(error => {
        console.error('Error fetching header:', error);
        const cachedHeader = localStorage.getItem('headerData');
        if (cachedHeader) {
          setHeaderData(JSON.parse(cachedHeader));
        }
      });
  };

  const fetchSecondHeaderData = () => {
    return axios.get(`https://elmanafea.shop/secondheader?lang=${i18n.language}`)
      .then(response => {
        console.log('Second header response:', response.data);

        if (response.data?.second_header) {
          setTexts(prev => ({
            ...prev,
            [i18n.language]: {
              ...prev[i18n.language],
              hero: {
                ...prev[i18n.language]?.hero,
                description: response.data.second_header
              }
            }
          }));
        }
      })
      .catch(error => {
        console.error('Error fetching second header:', error);
      });
  };

  const fetchHeroImage = () => {
    return axios.get('https://elmanafea.shop/image')
      .then(response => {
        console.log('Image response:', response.data);

        if (response.data?.image) {
          const fullImageUrl = response.data.image.startsWith('http') 
            ? response.data.image 
            : `https://elmanafea.shop${response.data.image}`;

          console.log('Full image URL:', fullImageUrl);

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

          setHeroBackgrounds(newBackgrounds);
          localStorage.setItem('heroBackgrounds', JSON.stringify(newBackgrounds));
        }
      })
      .catch(error => {
        console.error('Error fetching hero image:', error);
      });
  };

  const fetchLessonWord = () => {
    return axios.get(`https://elmanafea.shop/admin/lessonword?lang=${i18n.language}`)
      .then(response => {
        console.log('Lesson word response:', response.data);

        if (response.data?.lesson_word) {
          setTexts(prev => ({
            ...prev,
            [i18n.language]: {
              ...prev[i18n.language],
              section: {
                ...prev[i18n.language]?.section,
                title: response.data.lesson_word
              }
            }
          }));
        }
      })
      .catch(error => {
        console.error('Error fetching lesson word:', error);
      });
  };

  const fetchVideos = () => {
    return axios.get(`https://elmanafea.shop/homevideos?lang=${i18n.language}`)
      .then(response => {
        console.log('Raw response:', response);
        console.log('Videos data:', response.data);

        if (response.data.videos) {
          const formattedVideos = response.data.videos.map(video => {
            console.log('Processing video:', video);
            
            let videoLink = '';
            if (video.videoType === 'youtube') {
              videoLink = video.youtubeEmbedUrl;
            } else if (video.videoType === 'upload') {
              videoLink = `https://elmanafea.shop${video.videoPath}`;
            }

            return {
              id: video._id,
              title: video.title,
              link: videoLink,
              videoType: video.videoType,
            };
          });

          console.log('Formatted videos:', formattedVideos);
          setVideos(formattedVideos);
        }
      })
      .catch(error => {
        console.error('Error fetching videos:', error);
        toast.error('حدث خطأ أثناء تحميل الفيديوهات');
      });
  };

  useEffect(() => {
    setIsLoading(true); // نبدأ التحميل
    
    Promise.all([
      fetchHeaderData(),
      fetchSecondHeaderData(),
      fetchHeroImage(),
      fetchLessonWord(),
      fetchVideos()
    ])
    .finally(() => {
      setIsLoading(false); // ننهي التحميل بعد اكتمال كل الطلبات
    });
  }, [i18n.language]);

  useEffect(() => {
    if (headerData?.header) {
      console.log('Header data updated:', headerData.header);
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
    if (stars === 0 || comment.trim() === '') {
      setErrorMessage(t("يرجى اختيار عدد النجوم وكتابة تعليق قبل الإرسال"));
      setIsErrorModalOpen(true);
    } else {
      axios.post('https://elmanafea.shop/feedback', {
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
          setIsModalOpen(true);
          setStars(0);
          setComment('');
        } else {
          throw new Error('Unexpected response from server');
        }
      })
      .catch(error => {
        console.error('Error submitting feedback:', error);
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
        setIsErrorModalOpen(true);
        setErrorMessage(errorMessage);
      });
    }
  }, [stars, comment, t]);

  const handleHeroBackgroundChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        alert('يرجى تسجيل الدخول كمشرف أولاً');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);
      formData.append('lang', 'ar');

      axios.post('https://elmanafea.shop/admin/uploadimage', 
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
            axios.get('https://elmanafea.shop/image')
              .then(imageResponse => {
                if (imageResponse.data?.image) {
                  // Ensure the full image URL is constructed
                  const fullImageUrl = imageResponse.data.image.startsWith('http') 
                    ? imageResponse.data.image 
                    : `https://elmanafea.shop${imageResponse.data.image}`;

                  // Update backgrounds for all languages
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

                  setHeroBackgrounds(newBackgrounds);
                  localStorage.setItem('heroBackgrounds', JSON.stringify(newBackgrounds));
                  alert('تم تحديث صورة الخلفية بنجاح');
                }
              })
              .catch(error => {
                console.error('Error fetching hero image:', error);
              });
          }, 800); // انتظار 800 مللي ثانية
        }
      })
      .catch(error => {
        console.error('Error uploading image:', error);
        alert(error.response?.data?.message || 'حدث خطأ في عملية تحديث الصورة');
      });
    }
  };

  const handleAddVideo = () => {
    if (!newVideoData.title || (!newVideoData.youtubeEmbedUrl && !newVideoData.videoFile)) {
      showToast.error('الرجاء إدخال جميع البيانات المطلوبة');
      return;
    }

    setShowAddVideoModal(false);

    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      showToast.error('يرجى تسجيل الدخول كمشرف أولاً');
      return;
    }

    const formData = new FormData();
    formData.append('title', newVideoData.title);
    formData.append('lang', i18n.language);

    if (newVideoData.videoType === 'youtube') {
      formData.append('videoType', 'youtube');
      formData.append('youtubeEmbedUrl', formatYoutubeUrl(newVideoData.youtubeEmbedUrl));
    } else {
      formData.append('videoType', 'upload');
      formData.append('video', newVideoData.videoFile);
    }

    axios.post('https://elmanafea.shop/admin/homeuploadvideo', 
      formData,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    .then(response => {
        // إضافة تأخير 800 مللي ثانية قبل الحصول على البيانات المحدثة
        setTimeout(() => {
          fetchVideos();
        }, 800); // انتظار 800 مللي ثانية
        
        // Reset form data after successful submission
        setNewVideoData({
          title: '',
          youtubeEmbedUrl: '',
          videoFile: null,
          videoType: 'youtube'
        });
    })
    .catch(error => {
      showToast.error(error.response?.data?.message || 'حدث خطأ أثناء رفع الفيديو');
    });
  };

  const handleEditVideo = () => {
    if (!editValue.title) {
      showToast.error('الرجاء إدخال عنوان الفيديو');
      return;
    }
    
    // التأكد من إدخال الرابط فقط إذا كان الفيديو من نوع يوتيوب
    if (editValue.type === 'youtube' && !editValue.link) {
      showToast.error('الرجاء إدخال رابط الفيديو');
      return;
    }

    setEditModalOpen(false);

    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      showToast.error('يرجى تسجيل الدخول كمشرف أولاً');
      return;
    }

    // تحضير البيانات الأساسية للتحديث (العنوان واللغة)
    const updateData = {
      title: editValue.title,
      lang: i18n.language
    };
    
    if (editValue.type === 'embed') {
      const formattedUrl = formatYoutubeUrl(editValue.link);
      updateData.youtubeEmbedUrl = formattedUrl;
    }

    console.log("البيانات المرسلة للتحديث:", updateData);

    // باقي الكود كما هو...
    axios.put(
      `https://elmanafea.shop/admin/homeupdatevideo/${editingItem.id}`,
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
          axios.get(`https://elmanafea.shop/homevideos?lang=${i18n.language}`)
            .then(videosResponse => {
              if (videosResponse.data.videos) {
                const formattedVideos = videosResponse.data.videos.map(video => {
                  let videoLink = '';
                  if (video.videoType === 'youtube') {
                    videoLink = video.youtubeEmbedUrl;
                  } else if (video.videoType === 'upload') {
                    videoLink = `https://elmanafea.shop${video.videoPath}`;
                  }

                  return {
                    id: video._id,
                    title: video.title,
                    link: videoLink,
                    videoType: video.videoType,
                  };
                });

                setVideos(formattedVideos);
                showToast.edited(`تم تحديث فيديو "${editValue.title}" بنجاح`);
                // Clear edit form data
                setEditValue(null);
                setEditingItem(null);
              }
            })
            .catch(error => {
              console.error('Error fetching videos:', error);
              showToast.error('حدث خطأ أثناء تحديث قائمة الفيديوهات');
            });
        }, 800); // انتظار 800 مللي ثانية
      }
    })
    .catch(error => {
      console.error('Error updating video:', error);
      if (error.response) {
        console.error('تفاصيل الخطأ:', error.response.status, error.response.data);
      }
      showToast.error(error.response?.data?.message || 'حدث خطأ أثناء تحديث الفيديو');
    });
  };

  const handleSaveEdit = () => {
    if (editingItem?.type === 'video') {
      handleEditVideo();
      return;
    } 
    
    if (editingItem?.section === 'hero') {
      const currentLang = i18n.language;
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        alert('يرجى تسجيل الدخول كمشرف أولاً');
        return;
      }

      if (editingItem.key === 'title') {
        // Update main title
        axios.post('https://elmanafea.shop/admin/header', {
          header: editValue,
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
              axios.get(`https://elmanafea.shop/header?lang=${i18n.language}`)
                .then(headerResponse => {
                  if (headerResponse.data?.header) {
                    setHeaderData(headerResponse.data);
                    localStorage.setItem('headerData', JSON.stringify(headerResponse.data));
                    
                    setTexts(prev => ({
                      ...prev,
                      [i18n.language]: {
                        ...prev[i18n.language],
                        hero: {
                          ...prev[i18n.language]?.hero,
                          title: headerResponse.data.header
                        }
                      }
                    }));
                  }
                  showToast.edited('تم تحديث العنوان الرئيسي بنجاح');
                })
                .catch(error => {
                  console.error('Error fetching header:', error);
                });
            }, 800); // انتظار 800 مللي ثانية
          }
        })
        .catch(error => {
          console.error('Error:', error);
          showToast.error(error.response?.data?.message || 'حدث خطأ في عملية التحديث');
        });
      } else if (editingItem.key === 'description') {
        // Update subtitle
        axios.post('https://elmanafea.shop/admin/secondheader', {
          second_header: editValue,
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
              axios.get(`https://elmanafea.shop/secondheader?lang=${i18n.language}`)
                .then(secondHeaderResponse => {
                  if (secondHeaderResponse.data?.second_header) {
                    setTexts(prev => ({
                      ...prev,
                      [i18n.language]: {
                        ...prev[i18n.language],
                        hero: {
                          ...prev[i18n.language]?.hero,
                          description: secondHeaderResponse.data.second_header
                        }
                      }
                    }));
                  }
                  showToast.edited('تم تحديث الوصف بنجاح');
                })
                .catch(error => {
                  console.error('Error fetching second header:', error);
                });
            }, 800); // انتظار 800 مللي ثانية
          }
        })
        .catch(error => {
          console.error('Error:', error);
          showToast.error(error.response?.data?.message || 'حدث خطأ في عملية التحديث');
        });
      }
    } else if (editingItem?.section === 'section' && editingItem?.key === 'title') {
      const currentLang = i18n.language;
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        alert('يرجى تسجيل الدخول كمشرف أولاً');
        return;
      }

      // Update lesson word
      axios.post('https://elmanafea.shop/admin/lessonword', {
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
            axios.get(`https://elmanafea.shop/admin/lessonword?lang=${i18n.language}`)
              .then(lessonWordResponse => {
                if (lessonWordResponse.data?.lesson_word) {
                  setTexts(prev => ({
                    ...prev,
                    [i18n.language]: {
                      ...prev[i18n.language],
                      section: {
                        ...prev[i18n.language]?.section,
                        title: lessonWordResponse.data.lesson_word
                      }
                    }
                  }));
                }
                showToast.edited('تم تحديث عنوان القسم بنجاح');
              })
              .catch(error => {
                console.error('Error fetching lesson word:', error);
              });
          }, 800); // انتظار 800 مللي ثانية
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showToast.error(error.response?.data?.message || 'حدث خطأ في عملية التحديث');
      });
    }

    setEditModalOpen(false);
    setEditingItem(null);
    setEditValue(null);
    setSelectedFile(null);
  };

  const confirmDeleteVideo = () => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      showToast.error('يرجى تسجيل الدخول كمشرف أولاً');
      return;
    }

    axios.delete(
      `https://elmanafea.shop/admin/homedeletevideo/${videoToDelete}`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          lang: i18n.language
        }
      }
    )
    .then(response => {
      if (response.status === 200) {
        // إضافة تأخير 800 مللي ثانية قبل الحصول على البيانات المحدثة
        setTimeout(() => {
          axios.get(`https://elmanafea.shop/homevideos?lang=${i18n.language}`)
            .then(videosResponse => {
              if (videosResponse.data.videos) {
                const formattedVideos = videosResponse.data.videos.map(video => {
                  let videoLink = '';
                  if (video.videoType === 'youtube') {
                    videoLink = video.youtubeEmbedUrl;
                  } else if (video.videoType === 'upload') {
                    videoLink = `https://elmanafea.shop${video.videoPath}`;
                  }

                  return {
                    id: video._id,
                    title: video.title,
                    link: videoLink,
                    videoType: video.videoType,
                  };
                });

                setVideos(formattedVideos);
                showToast.deleted('تم حذف الفيديو بنجاح');
              }
            })
            .catch(error => {
              console.error('Error fetching videos:', error);
              showToast.error('حدث خطأ أثناء تحديث قائمة الفيديوهات');
            });
        }, 800); // انتظار 800 مللي ثانية
      }
    })
    .catch(error => {
      console.error('Error deleting video:', error);
      showToast.error(error.response?.data?.message || 'حدث خطأ أثناء حذف الفيديو');
    })
    .finally(() => {
      setShowDeleteConfirmModal(false);
      setVideoToDelete(null);
    });
  };

  const downloadFeedbacks = () => {
    setIsDownloading(true);
    
    axios.get('https://elmanafea.shop/admin/feedbacks', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
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
      console.error('Error downloading feedbacks:', error);
      showToast.error('حدث خطأ أثناء تحميل ملف التعليقات');
    })
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
  if (section === 'hero' && key === 'title') {
    return headerData?.header || texts[i18n.language]?.[section]?.[key] || texts['ar'][section][key];
  }
  const currentLang = i18n.language;
  return texts[currentLang]?.[section]?.[key] || texts['ar'][section][key];
}, [texts, i18n.language, headerData]);

const getHeaderTitle = useCallback(() => {
  if (headerData?.header) {
    console.log('Using header from state:', headerData.header);
    return headerData.header;
  }
  
  const cachedHeader = localStorage.getItem('headerData');
  if (cachedHeader) {
    const parsed = JSON.parse(cachedHeader);
    console.log('Using header from localStorage:', parsed.header);
    return parsed.header;
  }
  
  console.log('Using fallback header');
  return texts[i18n.language]?.hero?.title || texts.ar.hero.title;
}, [headerData, texts, i18n.language]);

  // إضافة دالة handleDeleteVideo التي كانت مفقودة
  const handleDeleteVideo = (videoId) => {
    setVideoToDelete(videoId);
    setShowDeleteConfirmModal(true);
  };

  // إضافة دالة handleVideoEditClick التي كانت مفقودة
  const handleVideoEditClick = (video) => {
    console.log("تفاصيل الفيديو المراد تعديله:", video);  
    
    // تحديد نوع الفيديو من البيانات بشكل صحيح
    const videoType = video.videoType;
    console.log("نوع الفيديو:", videoType);
    
    setEditingItem({ 
      type: 'video', 
      index: videos.findIndex(v => v.id === video.id), 
      id: video.id,
      title: video.title, 
      link: video.link,
      videoType: videoType // تأكد من تخزين نوع الفيديو بشكل صحيح
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
        <div 
          className="hero-pattern" 
          
        >
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

      {showVideoModal && (
        <div className="home-video-modal-overlay">
          <div className="home-video-modal">
            <h2 className="home-video-modal-title">
              {editingVideo ? 'تعديل الفيديو' : 'إضافة فيديو جديد'}
            </h2>
            <div className="home-video-field">
              <label>عنوان الحلقة:</label>
              <input
                type="text"
                className="home-video-input"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
              />
            </div>
            <div className="home-video-field">
              <label>عنوان الفيديو:</label>
              <input
                type="text"
                className="home-video-input"
                placeholder="مثل: https://www.youtube.com/embed..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
            <div className="home-video-modal-buttons">
              <button 
                className="home-video-save-btn"
                disabled={!videoTitle || !videoUrl}
                onClick={handleSaveVideo}
              >
                حفظ
              </button>
              <button 
                className="home-video-cancel-btn"
                onClick={() => setShowVideoModal(false)}
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
