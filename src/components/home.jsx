import React, { useState, useEffect, useCallback } from 'react';
import './home.css';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faCheckCircle, faCircleXmark, faEllipsisVertical, faPenToSquare, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { IoStar } from "react-icons/io5";
import Header from './header'
import Footer from './footer'
import { toast } from 'react-hot-toast';

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
    youtubeEmbedUrl: ''
  });
  const [headerData, setHeaderData] = useState(() => {
    const savedHeader = localStorage.getItem('headerData');
    return savedHeader ? JSON.parse(savedHeader) : null;
  });

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
    } else {
      setVideos(allVideos[currentLanguage] || []);
    }
  }, [i18n.language]);

  useEffect(() => {
    const savedTranslations = localStorage.getItem('translations');
    if (savedTranslations) {
      setTranslations(JSON.parse(savedTranslations));
    }
  }, []);

  const fetchHeaderData = async () => {
    try {
      const response = await axios.get(`https://elmanafea.shop/header?lang=${i18n.language}`);
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
    } catch (error) {
      console.error('Error fetching header:', error);
      const cachedHeader = localStorage.getItem('headerData');
      if (cachedHeader) {
        setHeaderData(JSON.parse(cachedHeader));
      }
    }
  };

  const fetchSecondHeaderData = async () => {
    try {
      const response = await axios.get(`https://elmanafea.shop/secondheader?lang=${i18n.language}`);
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
    } catch (error) {
      console.error('Error fetching second header:', error);
    }
  };

  const fetchHeroImage = async () => {
    try {
      const response = await axios.get('https://elmanafea.shop/image');
      console.log('Image response:', response.data);

      if (response.data?.image) {
        // تكوين الرابط الكامل للصورة
        const fullImageUrl = response.data.image.startsWith('http') 
          ? response.data.image 
          : `https://elmanafea.shop${response.data.image}`;

        console.log('Full image URL:', fullImageUrl);

        // تحديث الخلفيات لجميع اللغات
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
          fa: fullImageUrl
        };

        setHeroBackgrounds(newBackgrounds);
        localStorage.setItem('heroBackgrounds', JSON.stringify(newBackgrounds));
      }
    } catch (error) {
      console.error('Error fetching hero image:', error);
    }
  };

  const fetchLessonWord = async () => {
    try {
      // تصحيح الرابط ليكون مطابق للباك إند
      const response = await axios.get(`https://elmanafea.shop/admin/lessonword?lang=${i18n.language}`);
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
    } catch (error) {
      console.error('Error fetching lesson word:', error);
    }
  };

  useEffect(() => {
    fetchHeaderData();
    fetchSecondHeaderData();
    fetchHeroImage();
    fetchLessonWord();
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

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (stars === 0 || comment.trim() === '') {
      setErrorMessage(t("يرجى اختيار عدد النجوم وكتابة تعليق قبل الإرسال"));
      setIsErrorModalOpen(true);
    } else {
      try {
        const response = await axios.post('https://elmanafea.shop/feedback', {
          stars: stars,
          comment: comment
        }, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });
        
        if (response.status === 200) {
          setIsModalOpen(true);
          setStars(0);
          setComment('');
        } else {
          throw new Error('Unexpected response from server');
        }
      } catch (error) {
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
      }
    }
  }, [stars, comment, t]);

  const handleHeroBackgroundChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          alert('يرجى تسجيل الدخول كمشرف أولاً');
          return;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('lang', 'ar');

        const response = await axios.post('https://elmanafea.shop/admin/uploadimage', 
          formData,
          {
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.status === 200) {
          await fetchHeroImage();
          alert('تم تحديث صورة الخلفية بنجاح');
        }

      } catch (error) {
        console.error('Error uploading image:', error);
        alert(error.response?.data?.message || 'حدث خطأ في عملية تحديث الصورة');
      }
    }
  };

  const fetchVideos = async () => {
    try {
      console.log('Fetching videos for language:', i18n.language);
      const response = await axios.get(`https://elmanafea.shop/homevideos?lang=${i18n.language}`);
      console.log('Fetched videos:', response.data);
      
      if (Array.isArray(response.data)) {
        const formattedVideos = response.data.map(video => ({
          id: video.id,
          title: video.title,
          link: video.videoType === "youtube" ? video.videoEmbedUrl : video.videoPath,
          videoType: video.videoType
        }));
        console.log('Formatted videos:', formattedVideos);
        setVideos(formattedVideos);
      } else {
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('حدث خطأ أثناء تحميل الفيديوهات');
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [i18n.language]);

  const handleAddVideo = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        toast.error('يرجى تسجيل الدخول كمشرف أولاً');
        return;
      }

      console.log('Adding video with data:', {
        title: newVideoData.title,
        lang: i18n.language,
        youtubeEmbedUrl: newVideoData.youtubeEmbedUrl
      });

      const formData = new FormData();
      formData.append('title', newVideoData.title);
      formData.append('lang', i18n.language);
      formData.append('videoType', 'youtube');
      formData.append('youtubeEmbedUrl', newVideoData.youtubeEmbedUrl);

      const response = await axios.post('https://elmanafea.shop/admin/homeuploadvideo', formData, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });

      console.log('Server response:', response.data);

      if (response.data.success) {
        toast.success('تم إضافة الفيديو بنجاح');
        setShowAddVideoModal(false);
        setNewVideoData({ title: '', youtubeEmbedUrl: '' });
        await fetchVideos();
      } else {
        toast.error(response.data.message || 'حدث خطأ أثناء إضافة الفيديو');
      }
    } catch (error) {
      console.error('Error adding video:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء إضافة الفيديو');
    }
  };
  
  const handleDeleteVideo = (videoId) => {
    const currentLang = i18n.language;
    
    setVideos(prevVideos => {
      const updatedVideos = prevVideos.filter(video => video.id !== videoId);
      const homeVideosData = JSON.parse(localStorage.getItem('homeVideos') || '{}');
      
      if (!homeVideosData[currentLang]) {
        homeVideosData[currentLang] = [];
      }
      homeVideosData[currentLang] = updatedVideos;
      
      localStorage.setItem('homeVideos', JSON.stringify(homeVideosData));
      return updatedVideos;
    });
  };

  const allVideos = {
    ar: [
        {
            title: 'الأخلاق في رمضان',
            link:"https://www.youtube.com/embed/BYkWHLm4bSk" ,
        },
        {
            id: 2,
            title: 'الحلقة الأولى | حديث رمضان | الموسم الأول عنوان الحلقة: إستقبال رمضان',
            link: 'https://www.youtube.com/embed/wTPq6Hnz2XA?si=pOdZHWuZ5oHhbVYa',
        },
        {
            id: 3,
            title: 'السيرة النبوية',
            link: 'https://www.youtube.com/embed/tjp7wiUaPZk?si=QTrBLZ8nzMYXSliB',
        },
    ],
    en: [
        {
            id: 1,
            title: 'Cleaning up before Ramadan - FULL LECTURE - Mufti Menk',
            link:"https://www.youtube.com/embed/Q-eK7M4OqSo",
        },
        {
            id: 2,
            title: 'Make The Most of This Month! | Ramadan Reminder 01 | Mufti Menk',
            link:"https://www.youtube.com/embed/ufffdfz-Wqc",
        },
        {
            id: 3,
            title: 'Virtues of Ramadan',
            link: "https://www.youtube.com/embed/UK94ne7RrIM?si=GiFDf1xL4aDjFCu2",
        },
    ],
    ur: [  
        {
            id: 1,
            title: "uran Tafseer | Juz 2 | Ramadan Special",
            link: 'https://www.youtube.com/embed/GqFrODsIPlQ?si=llaU_0ED6T2azXV1',
        },
        {
            id: 2,
            title: "رمضان کے روزوں کی فضیلت واہمیت",
            link: "https://www.youtube.com/embed/3H-5zH6ZMnw",
        },
        {
            id: 3,
            title: "عقیدہ کی اہمیت",
            link: 'https://www.youtube.com/embed/GqFrODsIPlQ?si=llaU_0ED6T2azXV1',
        },
    ],
    fr: [

      {
        id: 1,
        title: "RAMADAN : 30 JOURS POUR CHANGER - NADER ABOU ANAS",
        link: 'https://www.youtube.com/embed/GqFrODsIPlQ?si=llaU_0ED6T2azXV1',
    },
    {
        id: 2,
        title: "Le Ramadan - Imam Yacine [ Conférence complète en 4K ]",
        link:"https://www.youtube.com/embed/5ylnAaWaino",
    },
    {
        id: 3,
        title: "Le Ramadan - Imam Yacine ",
        link:"https://www.youtube.com/embed/5ylnAaWaino" ,
    },
      
    ],
    tr: [
      {
        id: 1,
        title: "İslam'da Ramazan ayının yeri ve önemi | Dr. Ömer Demirbağ | Ahmed Şahin | Bir Başka Ramazan",
        link:"https://www.youtube.com/embed/UnZNrKdizJE" ,
    },
    {
        id: 2,
        title: "Ramazan'da Bu 4 Şeyi Kesinlikle Yapın!",
        link:"https://www.youtube.com/embed/EG8ewqGifDg",
    },
    {
        id: 3,
        title: "DHBT MBSTS ÖABT DKAB INANÇ ESASLARI - UNITE 1 - DIN VE INANÇ 🕋",
        link:"https://www.youtube.com/embed/aqXM_hM20hI?list=PLTfYWRDOnXGkMUYA7kYE65D1-GoB2JpRL" ,
    },

    ],
    id: [

      {
        id: 1,
        title: "Tiga Amalan Pokok Ramadhan - Ustadz Adi Hidayat",
        link:"https://www.youtube.com/embed/koE44zuc_ic"  ,
    },
    {
        id: 2,
        title: "Empat Keistimewaan Ramadhan - Ustadz Adi Hidayat",
        link:"https://www.youtube.com/embed/GU59no0BBrw",
    },
    {
        id: 3,
        title: "Pondasi Iman - Ustadz Adi Hidayat",
        link:"https://www.youtube.com/embed/VYD_2fsylcM"  ,
    },

    ],
    ru: [

      {
        id: 1,
        title: "ИСТОРИЯ ПОСТА в месяц Рамадан - Доктор Закир Найк",
        link:"https://www.youtube.com/embed/XcdBtTBLayU"  ,
    },
    {
        id: 2,
        title: "ЧТО ТАКОЕ РАМАДАН? Рауф Гаджиев",
        link:"https://www.youtube.com/embed/4_p-of9xt8k",
    },
    {
        id: 3,
        title: "Правильная АКЫДА! | Вероубеждения АХЛЮ СУННА валь джамаа | Юсуф Берхудар",
        link:"https://www.youtube.com/embed/HTnW5v0CUCA"  ,
    },

    ],
    hi: [

      {
        id: 1,
        title: "Quran Tafseer | Juz 2 | Ramadan Special ",
        link:"https://www.youtube.com/embed/vtTw3SHElsQ"  ,
    },
    {
        id: 2,
        title: "Ramzan Ke Roze Ki Fazilat & Ahmiyat | رمضان کے روزوں کی فضیلت واہمیت Baseerat | بصیرت",
        link:"https://www.youtube.com/embed/3H-5zH6ZMnw",
    },
    {
        id: 3,
        title: "Roze ka Hukm & Roza na Rakhne wale log | روزے کا حکم نیز روزہ نہ رکھنے والے لوگ | Baseerat | بصیرت",
        link:"https://www.youtube.com/embed/QlTqvBVI4zI",
    },

    ],
    bn: [

      {
        id: 1,
        title: "রমযান কোরআনের মাস  ",
        link:"https://www.youtube.com/embed/R5wsOLKlK_E"  ,
    },
    {
        id: 2,
        title: "ভূমিকা পর্ব: তিনটি মূলনীতির ধারাবাহিক ক্লাস।আলোচকঃ আব্দুর রব আফ্ফান,দ্বীরা সেন্টার রিয়াদ সৌদি আরব।",
        link:"https://www.youtube.com/embed/9TkZdhf51Po",
    },
    {
        id: 3,
        title: "রমযান কোরআনের মাস",
        link:"https://www.youtube.com/embed/R5wsOLKlK_E",
    },

    ],
    zh: [

      {
        id: 1,
        title: "斋戒的律例",
        link:"https://www.youtube.com/embed/5WgqPoiqb08"  ,
    },
    {
        id: 2,
        title: "Karim Khan－關於開齋節的中文翻譯版。祝大家開齋節快樂",
        link:"https://www.youtube.com/embed/iMRMd-1crHQ",
    },
    {
        id: 3,
        title: "穆圣和他的同伴们怎样度过斋月——马雪平",
        link:"https://www.youtube.com/embed/o8koNdcRAC4",
    },

    ],
    tl: [

      {
        id: 1,
        title: "Ang kabutihan ng Ramadan at pag-aayuno",
        link:"https://www.youtube.com/embed/8oAv_PsVg1s"  ,
    },
    {
        id: 2,
        title: "Ang pinakamahusay na ng Ramadan",
        link:"https://www.youtube.com/embed/UhL6B7PTyBg",
    },
    {
        id: 3,
        title: "Umrah sa Ramadan - sa Filipino.",
        link:"https://www.youtube.com/embed/EyMCtF3b2VE",
    },

    ],
    fa: [

      {
        id: 1,
        title: "دروس رمضان - به زبان فارسی دروس رمضان به زبان فارسی",
        link:"https://www.youtube.com/embed/6ZIJ4rwiIUI"  ,
    },
    {
        id: 2,
        title: "آیا اسلام دین جدیدی است؟ به فارسی آیا اسلام دین جدیدی است؟ به زبان فارسی",
        link:"https://www.youtube.com/embed/8ZSg3yQM56k" ,
    },
    {
        id: 3,
        title: "دین اسلام درس زبان فارسی 1 قسمت اول",
        link:"https://www.youtube.com/embed/MNY4zsXXT_w" ,
    },

    ],
}

useEffect(() => {
  if (isModalOpen) {
    const timer = setTimeout(() => {
      setIsModalOpen(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }
}, [isModalOpen]);

const handleEditClick = (key, section, value) => {
  setEditingItem({
    key,
    section,
    originalText: value,
    initialValue: translations[i18n.language]?.[value] || value
  });
  setEditValue(value);
  setEditModalOpen(true);
};

const handleVideoEditClick = (video, index) => {
  setEditingItem({ 
    type: 'video', 
    index, 
    id: video.id,
    title: video.title, 
    link: video.link,
    videoType: video.videoType
  });
  setEditValue({ 
    title: video.title, 
    link: video.link,
    type: video.videoType
  });
  setEditModalOpen(true);
};

const handleSaveEdit = async () => {
  if (editingItem?.type === 'video') {
    try {
      const formData = new FormData();
      formData.append('title', editValue.title);
      formData.append('lang', i18n.language);
      formData.append('videoType', 'youtube');  // نحن نتعامل فقط مع فيديوهات يوتيوب في الوقت الحالي
      formData.append('youtubeEmbedUrl', editValue.link);

      const response = await axios.post('https://elmanafea.shop/admin/homeuploadvideo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.data.success) {
        toast.success('تم تحديث الفيديو بنجاح');
        await fetchVideos();  // تحديث قائمة الفيديوهات
        setEditModalOpen(false);
        setEditingItem(null);
        setEditValue(null);
      } else {
        toast.error('حدث خطأ أثناء تحديث الفيديو');
      }
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء تحديث الفيديو');
    }
  } else if (editingItem?.section === 'hero') {
    try {
      const currentLang = i18n.language;
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        alert('يرجى تسجيل الدخول كمشرف أولاً');
        return;
      }

      if (editingItem.key === 'title') {
        // تحديث العنوان الرئيسي
        const response = await axios.post('https://elmanafea.shop/admin/header', {
          header: editValue,
          lang: currentLang,
          index: 1
        }, {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        });

        if (response.status === 200) {
          await fetchHeaderData();
        }
      } else if (editingItem.key === 'description') {
        // تحديث العنوان الفرعي
        const response = await axios.post('https://elmanafea.shop/admin/secondheader', {
          second_header: editValue,
          lang: currentLang,
          index: 1
        }, {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        });

        if (response.status === 200) {
          await fetchSecondHeaderData();
        }
      }
      
      setEditModalOpen(false);
      setEditingItem(null);
      alert('تم التحديث بنجاح');
      
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'حدث خطأ في عملية التحديث');
    }
  } else if (editingItem?.section === 'section' && editingItem?.key === 'title') {
    try {
      const currentLang = i18n.language;
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        alert('يرجى تسجيل الدخول كمشرف أولاً');
        return;
      }

      // تصحيح شكل الداتا المرسلة
      const response = await axios.post('https://elmanafea.shop/admin/lessonword', {
        lesson_word: editValue,
        lang: currentLang,
        index: 1  // إضافة index مثل بقية الطلبات
      }, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });

      if (response.status === 200) {
        await fetchLessonWord();
        setEditModalOpen(false);
        setEditingItem(null);
        alert('تم التحديث بنجاح');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'حدث خطأ في عملية التحديث');
    }
  }

  setEditModalOpen(false);
  setEditingItem(null);
  setEditValue(null);
  setSelectedFile(null);
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

  return (
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
  {videos.map((video, index) => (
    <div className="video-card" key={video.id || index}>
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
              onClick={() => handleVideoEditClick(video, index)}
            />
          </div>
        )}
        <iframe 
          width="100%" 
          height="100%" 
          src={video.link} 
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
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
            {getHeroText('section', 'more')}
            <FontAwesomeIcon icon={i18n.dir() === 'ltr' ? faArrowRight : faArrowLeft} />
          </a>
          {isAdmin && (
            <FontAwesomeIcon 
              icon={faEllipsisVertical} 
              className="edit-icon edit-icon-color"
              onClick={() => handleEditClick('more', 'section', getHeroText('section', 'more'))}
            />
          )}
        </div>
      </div>
    </div>

    {showAddVideoModal && (
      <div className="edit-modal-overlay">
        <div className="edit-modal">
          <h3>إضافة فيديو جديد</h3>

          <div className="edit-field">
            <label>عنوان الفيديو:</label>
            <input
              type="text"
              value={newVideoData.title}
              onChange={(e) => setNewVideoData(prev => ({ ...prev, title: e.target.value }))}
              className="edit-input"
            />
          </div>
          <div className="edit-field">
            <label>رابط اليوتيوب:</label>
            <input
              type="text"
              value={newVideoData.youtubeEmbedUrl}
              onChange={(e) => setNewVideoData(prev => ({ ...prev, youtubeEmbedUrl: e.target.value }))}
              className="edit-input"
              placeholder="مثال: https://www.youtube.com/embed/..."
            />
          </div>
          <div className="modal-buttons">
            <button 
              onClick={handleAddVideo} 
              className="save-btn"
              disabled={!newVideoData.title || !newVideoData.youtubeEmbedUrl}
            >
              حفظ
            </button>
            <button 
              onClick={() => {
                setShowAddVideoModal(false);
                setNewVideoData({ title: '', youtubeEmbedUrl: '' });
              }} 
              className="cancel-btn"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    )}

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

    {editModalOpen && editingItem?.type === 'video' ? (
      <div className="edit-modal-overlay">
        <div className="edit-modal">
          <h3>تعديل الفيديو</h3>

          <div className="edit-field">
            <label>عنوان الفيديو:</label>
            <input
              type="text"
              value={editValue.title}
              onChange={(e) => setEditValue(prev => ({ ...prev, title: e.target.value }))}
              className="edit-input"
            />
          </div>
          <div className="edit-field">
            <label>رابط اليوتيوب:</label>
            <input
              type="text"
              value={editValue.link}
              onChange={(e) => setEditValue(prev => ({ ...prev, link: e.target.value }))}
              className="edit-input"
              placeholder="مثال: https://www.youtube.com/embed/..."
            />
          </div>
          <div className="modal-buttons">
            <button 
              onClick={handleSaveEdit} 
              className="save-btn"
              disabled={!editValue.title || !editValue.link}
            >
              حفظ
            </button>
            <button 
              onClick={() => {
                setEditModalOpen(false);
                setEditValue(null);
                setEditingItem(null);
              }} 
              className="cancel-btn"
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

    <Footer />
    </>
  );

}

export default Home;
