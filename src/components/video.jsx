import React, { useState, useEffect } from 'react';
import i18n from './i18n';
import { useTranslation } from 'react-i18next';
import './video.css';
import Header from './header'
import Footer from './footer'
import Louder from './louder';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft, faTrash, faPlus, faPenToSquare, faCog } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { Document, Page } from 'react-pdf';
import { showToast } from './Toast'; // استيراد دالة showToast

const translations = {
    categories: {
        ar: {
            all: 'جميع الفيديوهات',
            aqeedah: 'العقيدة',
            fiqh: 'الفقه',
            tafseer: 'تفسير القرآن',
            seerah: 'السيرة النبوية',
            hadith: 'الحديث',
            akhlaq: 'الأخلاق'
        },
        en: {
            all: 'All Videos',
            aqeedah: 'Islamic Creed',
            fiqh: 'Islamic Jurisprudence',
            tafseer: 'Quran Interpretation',
            seerah: "Prophet's Biography",
            hadith: 'Hadith',
            akhlaq: 'Islamic Ethics'
        }, 
        fr: {
            all: 'Toutes les Vidéos',
            aqeedah: 'La Croyance',
            fiqh: 'Jurisprudence',
            tafseer: 'Interprétation du Coran',
            seerah: 'Biographie du Prophète',
            hadith: 'Hadith',
            akhlaq: 'Éthique Islamique'
        },
        ur: {
            all: 'تمام ویڈیوز',
            aqeedah: 'عقیدہ',
            fiqh: 'فقہ',
            tafseer: 'تفسیر قرآن',
            seerah: 'سیرت النبی',
            hadith: 'حدیث',
            akhlaq: 'اخلاق'
        },
        tr: {
            all: 'Tüm Videolar',
            aqeedah: 'İnanç',
            fiqh: 'Fıkıh',
            tafseer: 'Kuran Tefsiri',
            seerah: 'Peygamber Hayatı',
            hadith: 'Hadis',
            akhlaq: 'Ahlak'
        },
        id: {
            all: 'Semua Video',
            aqeedah: 'Akidah',
            fiqh: 'Fiqih',
            tafseer: 'Tafsir Quran',
            seerah: 'Sirah Nabi',
            hadith: 'Hadits',
            akhlaq: 'Akhlak'
        },
        ru: {
            all: 'Все Видео',
            aqeedah: 'Вероубеждение',
            fiqh: 'Фикх',
            tafseer: 'Толкование Корана',
            seerah: 'Жизнеописание Пророка',
            hadith: 'Хадис',
            akhlaq: 'Нравственность'
        },
        hi: {
            all: 'सभी वीडियो',
            aqeedah: 'आस्था',
            fiqh: 'फ़िक़्ह',
            tafseer: 'क़ुरआन की व्याख्या',
            seerah: 'पैगंबर की जीवनी',
            hadith: 'हदीस',
            akhlaq: 'नैतिकता'
        },
        bn: {
            all: 'সকল ভিডিও',
            aqeedah: 'আকীদাহ',
            fiqh: 'ফিকাহ',
            tafseer: 'তাফসীর',
            seerah: 'সীরাত',
            hadith: 'হাদিস',
            akhlaq: 'আখলাক'
        },
        zh: {
            all: '所有视频',
            aqeedah: '信仰',
            fiqh: '伊斯兰法学',
            tafseer: '古兰经解释',
            seerah: '先知传记',
            hadith: '圣训',
            akhlaq: '伊斯兰道德'
        },
        tl: {
            all: 'Lahat ng Video',
            aqeedah: 'Pananampalataya',
            fiqh: 'Jurisprudensya',
            tafseer: 'Interpretasyon ng Quran',
            seerah: 'Buhay ng Propeta',
            hadith: 'Hadith',
            akhlaq: 'Moralidad'
        },
        fa: {
            all: 'همه ویدیوها',
            aqeedah: 'عقیده',
            fiqh: 'فقه',
            tafseer: 'تفسیر قرآن',
            seerah: 'سیره نبوی',
            hadith: 'حدیث',
            akhlaq: 'اخلاق'
        },
        ha: {
            all: 'Dukkan Bidiyo',
            aqeedah: 'Aqidah',
            fiqh: 'Fiqh',
            tafseer: "Fassarar Alkur'ani",
            seerah: 'Tarihin Annabi',
            hadith: 'Hadith',
            akhlaq: 'Hali'
        }
    },
    featuredTitle: {
        ar: 'فيديوهات مختارة',
        en: 'Featured Videos',
        fr: 'Vidéos à la Une',
        ur: 'منتخب ویڈیوز',
        tr: 'Öne Çıkan Videolar',
        id: 'Video Pilihan',
        ru: 'Избранные Видео',
        hi: 'चुनिंदा वीडियो',
        bn: 'নির্বাচিত ভিডিও',
        zh: '精选视频',
        tl: 'Mga Piling Video',
        fa: 'ویدیوهای منتخب',
        ha: 'Zababbun Bidiyo'
    }
};

const allCategories = [
  { id: 'all', name: 'جميع الفيديوهات' },
//   { id: 'aqeedah', name: 'العقيدة' },
  { id: 'fiqh', name: 'الفقه' },
  { id: 'tafseer', name: 'تفسير القرآن' },
  { id: 'seerah', name: 'السيرة النبوية' },
  { id: 'hadith', name: 'الحديث' },
  { id: 'akhlaq', name: 'الأخلاق' }
];

const allVideos = {
    ar: [
        {
            id: 1,
            title: 'احكام الحج',
            link: "https://www.youtube.com/embed/FsDrBKQy7gM",
            category: 'aqeedah'
        }
        // ... rest of ar videos ...
    ],
    en: [
        // ... en videos ...
    ]
    // ... rest of languages ...
};

function Videos(){
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState('all');
    const [videos, setVideos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const videosPerPage = 8;

    const [isAdmin, setIsAdmin] = useState(false); // تغيير القيمة الافتراضية إلى false

    // إضافة state جديد للتحميل
    const [isUploading, setIsUploading] = useState(false);
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [isSavingText, setIsSavingText] = useState(false);

    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const [pdfFiles, setPdfFiles] = useState([]);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('adminToken');
            setIsAdmin(!!token);
        };
        
        checkAuth();
        // إضافة event listener للاستماع لتغييرات تسجيل الدخول
        window.addEventListener('storage', checkAuth);
        
        return () => {
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

    const [categories, setCategories] = useState(() => {
        const currentLang = i18n.language;
        const savedCategories = localStorage.getItem('categories');
        if (savedCategories) {
            const parsed = JSON.parse(savedCategories);
            return parsed[currentLang] || Object.entries(translations.categories[currentLang]).map(([id, name]) => ({ id, name }));
        }
        return Object.entries(translations.categories[currentLang]).map(([id, name]) => ({ id, name }));
    });

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [newCategory, setNewCategory] = useState({ id: '', name: '' });

    const [showAddVideoModal, setShowAddVideoModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newVideoData, setNewVideoData] = useState({
        title: '',
        link: '',
        type: '',
        category: 'all'
    });

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [editingText, setEditingText] = useState({
        text: '',
        type: ''
    });

    const [texts, setTexts] = useState(() => {
        const savedTexts = localStorage.getItem('texts');
        return savedTexts ? JSON.parse(savedTexts) : {};
    });

    const [sectionTitle, setSectionTitle] = useState(() => {
        const currentLang = i18n.language;
        const savedTitle = localStorage.getItem('sectionTitle');
        if (savedTitle) {
            const parsed = JSON.parse(savedTitle);
            return {
                visible: parsed.visible,
                text: parsed.text || translations.featuredTitle[currentLang]
            };
        }
        return {
            visible: true,
            text: translations.featuredTitle[currentLang]
        };
    });

    const [allVideosTitle, setAllVideosTitle] = useState(() => {
        const savedTitle = localStorage.getItem('allVideosTitle');
        return savedTitle ? JSON.parse(savedTitle) : translations.categories;
    });

    const formatYoutubeUrl = (url) => {
        if (!url) return '';
        let videoId;
        if (url.includes('watch?v=')) {
            videoId = url.split('watch?v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('embed/')[1].split('?')[0];
        } else {
            videoId = url.trim();
        }
        return `https://www.youtube.com/embed/${videoId}`;
    };

    const fetchVideos = () => {
        setIsLoading(true);
        axios.get(
            activeCategory === 'all' 
                ? `https://elmanafea.shop/videos/all?lang=${i18n.language}`
                : `https://elmanafea.shop/videos?lang=${i18n.language}&category=${activeCategory}`
        ).then(response => {
            console.log('Videos response:', response.data);
            console.log('Videos URL:', response.config.url);

            if (response.data.videos) {
                const formattedVideos = response.data.videos.map(video => {
                    console.log('Raw video data:', video);

                    let videoLink = '';
                    if (video.videoType === 'embed') {
                        videoLink = formatYoutubeUrl(video.youtubeEmbedUrl || video.link);
                    } else if (video.videoType === 'upload') {
                        videoLink = "https://elmanafea.shop" + video.videoPath || video.url;
                    }

                    return {
                        id: video._id,
                        title: video.title,
                        category: video.category,
                        link: videoLink,
                        isLocal: video.videoType === 'upload'
                    };
                });

                console.log('Formatted videos:', formattedVideos);
                setVideos(formattedVideos);
            }
        }).catch(error => {
            console.error('Error fetching videos:', error);
        }).finally(() => {
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchVideos();
    }, [i18n.language, activeCategory]);

    useEffect(() => {
        const currentLang = i18n.language;
        
        setCategories(prevCategories => {
            const savedCategories = localStorage.getItem('categories');
            if (savedCategories) {
                const parsed = JSON.parse(savedCategories);
                return parsed[currentLang] || Object.entries(translations.categories[currentLang]).map(([id, name]) => ({ id, name }));
            }
            return Object.entries(translations.categories[currentLang]).map(([id, name]) => ({ id, name }));
        });

        setSectionTitle(prev => ({
            ...prev,
            text: translations.featuredTitle[currentLang]
        }));
    }, [i18n.language]);

    useEffect(() => {
        const currentLang = i18n.language;
        
        const savedSectionTitle = localStorage.getItem('sectionTitle');
        if (savedSectionTitle) {
            const parsed = JSON.parse(savedSectionTitle);
            if (parsed[currentLang]) {
                setSectionTitle(prev => ({
                    ...prev,
                    text: parsed[currentLang].text
                }));
            }
        }
        
        const savedAllVideosTitle = localStorage.getItem('allVideosTitle');
        if (savedAllVideosTitle) {
            const parsed = JSON.parse(savedAllVideosTitle);
            setAllVideosTitle(parsed);
        }
        
        const savedCategories = localStorage.getItem('categories');
        if (savedCategories) {
            const parsed = JSON.parse(savedCategories);
            if (parsed[currentLang]) {
                setCategories(parsed[currentLang]);
            }
        }
    }, [i18n.language]);

    useEffect(() => {
        const currentLang = i18n.language;
        
        const savedSectionTitle = localStorage.getItem('sectionTitle');
        if (savedSectionTitle) {
            const parsed = JSON.parse(savedSectionTitle);
            if (parsed[currentLang]) {
                setSectionTitle(prev => ({
                    ...prev,
                    text: parsed[currentLang].text
                }));
            }
        }
        
        const savedCategories = localStorage.getItem('categories');
        if (savedCategories) {
            const parsed = JSON.parse(savedCategories);
            if (parsed[currentLang]) {
                setCategories(parsed[currentLang]);
            } else {
                setCategories(Object.entries(translations.categories[currentLang]).map(([id, name]) => ({ id, name })));
            }
        }
    }, [i18n.language]);

    useEffect(() => {
        fetchVideoHeaderData();
        fetchVideoSecondHeaderData();
        fetchCategoriesData();
    }, [i18n.language]);

    const fetchVideoHeaderData = () => {
        axios.get(`https://elmanafea.shop/vidpageheader?lang=${i18n.language}`)
        .then(response => {
            console.log('Video header response:', response.data);

            if (response.data?.header) {
                setTexts(prev => ({
                    ...prev,
                    [i18n.language]: {
                        ...prev[i18n.language],
                        title: response.data.header
                    }
                }));
            }
        }).catch(error => {
            console.error('Error fetching video header:', error);
        });
    };

    const fetchVideoSecondHeaderData = () => {
        axios.get(`https://elmanafea.shop/vidsecondheader?lang=${i18n.language}`)
        .then(response => {
            console.log('Video second header response:', response.data);

            if (response.data?.second_header) {
                setTexts(prev => ({
                    ...prev,
                    [i18n.language]: {
                        ...prev[i18n.language],
                        description: response.data.second_header
                    }
                }));
            }
        }).catch(error => {
            console.error('Error fetching video second header:', error);
        });
    };

    const fetchCategoriesData = () => {
        const currentLang = i18n.language;
        axios.get(`https://elmanafea.shop/categories?lang=${currentLang}`)
        .then(response => {
            if (response.data?.categories) {
                const mappedCategories = response.data.categories.map(cat => ({
                    id: cat.id,
                    name: cat.title,
                    _id: cat._id,
                    lang: cat.lang
                }));

                const allCategory = {
                    id: 'all',
                    name: translations.categories[currentLang].all
                };

                const finalCategories = [allCategory, ...mappedCategories];
                setCategories(finalCategories);
            }
        }).catch(error => {
            console.error('Error fetching categories:', error);
            const defaultCategories = [
                { id: 'all', name: translations.categories[i18n.language].all },
                ...Object.entries(translations.categories[i18n.language])
                    .filter(([id]) => id !== 'all')
                    .map(([id, name]) => ({ id, name }))
            ];
            setCategories(defaultCategories);
        });
    };

    const handleCategoryClick = (categoryId) => {
        setActiveCategory(categoryId);
    };

    const handleEditTextClick = (defaultText, type) => {
        console.log("handleEditTextClick called with:", defaultText, type); // للتأكد من أن الوظيفة تعمل
        const currentText = texts[i18n.language]?.[type] || defaultText;
        setEditingText({
            text: currentText,
            type: type
        });
        setEditModalOpen(true);
    };

    const handleDeleteCategory = (categoryId) => {
        if (categoryId === 'all') return; // منع حذف تصنيف "الكل"

        // إيجاد التصنيف المراد حذفه للحصول على معرف المستند (_id)
        const catToDelete = categories.find(cat => cat.id === categoryId);
        if (!catToDelete?._id) {
            alert('لم يتم العثور على معرف التصنيف');
            return;
        }

        setCategoryToDelete(catToDelete);
        setShowDeleteConfirmModal(true);
    };

    const handleEditCategory = (category) => {
        if (category.id === 'all') return; // منع تعديل تصنيف "الكل"
        setEditingCategory(category);
        setNewCategory({ 
            id: category.id,
            name: category.name,
            _id: category._id 
        });
        setShowCategoryModal(true);
    };

    const handleAddVideo = () => {
        if (!newVideoData.title || (!newVideoData.link && !selectedFile)) return;

        setShowAddVideoModal(false);
        setIsUploading(true);

        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            alert('يرجى تسجيل الدخول كمشرف أولاً');
            return;
        }

        const formData = new FormData();
        formData.append('title', newVideoData.title);
        formData.append('lang', i18n.language);
        formData.append('category', newVideoData.category);

        if (newVideoData.type === 'file') {
            formData.append('videoType', 'upload');
            formData.append('video', selectedFile);
        } else if (newVideoData.type === 'youtube') {
            formData.append('videoType', 'embed');
            formData.append('youtubeEmbedUrl', formatYoutubeUrl(newVideoData.link));
        }

        axios.post('https://elmanafea.shop/admin/uploadvideo', 
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        ).then(response => {
            if (response.status === 201) {
                return fetchVideos();
            }
        }).then(() => {
            showToast.added(`تم إضافة فيديو "${newVideoData.title}" بنجاح`);
            setNewVideoData({ title: '', link: '', type: '', category: 'all' });
            setSelectedFile(null);
        }).catch(error => {
            console.error('Error uploading video:', error.response?.data || error.message);
            showToast.error(error.response?.data?.message || 'حدث خطأ في عملية رفع الفيديو');
            setShowAddVideoModal(true);
        }).finally(() => {
            setIsUploading(false);
        });
    };

    const handleEditVideo = (video) => {
        setEditingVideo({
            ...video, 
            type: video.isLocal ? 'file' : 'youtube'
        });
        setEditModalOpen(true);
    };

    const handleSaveVideo = () => {
        setEditModalOpen(false);
        setIsSavingEdit(true);
        
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            alert('يرجى تسجيل الدخول كمشرف أولاً');
            setIsSavingEdit(false);
            return;
        }

        const videoData = {
            id: editingVideo.id,
            title: editingVideo.title,
            youtubeEmbedUrl: formatYoutubeUrl(editingVideo.link),
            category: editingVideo.category,
            lang: i18n.language
        };

        if (editingVideo.type === 'file' && selectedFile) {
            const formData = new FormData();
            formData.append('id', editingVideo.id);
            formData.append('title', editingVideo.title);
            formData.append('category', editingVideo.category);
            formData.append('lang', i18n.language);
            formData.append('video', selectedFile);
            formData.append('videoType', 'upload');

            axios.put(
                'https://elmanafea.shop/admin/updatevideo',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            ).then(response => {
                if (response.status === 200) {
                    return fetchVideos();
                }
            }).then(() => {
                showToast.edited(`تم تحديث فيديو "${editingVideo.title}" بنجاح`);
                setEditingVideo(null);
                setSelectedFile(null);
            }).catch(error => {
                console.error('Error updating video:', error.response?.data || error.message);
                showToast.error(error.response?.data?.message || 'حدث خطأ في عملية تحديث الفيديو');
            }).finally(() => {
                setIsSavingEdit(false);
            });
            return;
        }

        axios.put(
            'https://elmanafea.shop/admin/updatevideo',
            videoData,
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            }
        ).then(response => {
            if (response.status === 200) {
                return fetchVideos();
            }
        }).then(() => {
            showToast.edited(`تم تحديث فيديو "${editingVideo.title}" بنجاح`);
            setEditingVideo(null);
        }).catch(error => {
            console.error('Error updating video:', error);
            showToast.error(error.response?.data?.message || 'حدث خطأ في عملية التحديث');
        }).finally(() => {
            setIsSavingEdit(false);
        });
    };

    const handleDeleteVideo = (videoId) => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            alert('يرجى تسجيل الدخول كمشرف أولاً');
            return;
        }

        if (!window.confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
            return;
        }

        axios.delete(
            'https://elmanafea.shop/admin/deletevideo',
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    id: videoId,
                    lang: i18n.language
                }
            }
        ).then(response => {
            if (response.status === 200) {
                return fetchVideos();
            }
        }).then(() => {
            showToast.deleted('تم حذف الفيديو بنجاح');
        }).catch(error => {
            console.error('Error deleting video:', error);
            showToast.error(error.response?.data?.message || 'حدث خطأ في عملية الحذف');
        });
    };

    const handleTextSave = () => {
        setEditModalOpen(false);
        setIsSavingText(true);
        
        const currentLang = i18n.language;
        const adminToken = localStorage.getItem('adminToken');

        if (!adminToken) {
            alert('يرجى تسجيل الدخول كمشرف أولاً');
            setIsSavingText(false);
            return;
        }

        if (editingText.type === 'title') {
            axios.post('https://elmanafea.shop/admin/vidpageheader', 
                {
                    header: editingText.text,
                    lang: currentLang
                },
                {
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    }
                }
            ).then(response => {
                if (response.status === 200) {
                    return fetchVideoHeaderData();
                }
            }).then(() => {
                setEditingText(null);
                showToast.edited('تم تحديث العنوان بنجاح');
            }).catch(error => {
                console.error('Error updating header:', error);
                showToast.error(error.response?.data?.message || 'حدث خطأ في عملية تحديث العنوان');
            }).finally(() => {
                setIsSavingText(false);
            });
        } else if (editingText.type === 'description') {
            axios.post('https://elmanafea.shop/admin/vidsecondheader', 
                {
                    second_header: editingText.text,
                    lang: currentLang
                },
                {
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    }
                }
            ).then(response => {
                if (response.status === 200) {
                    return fetchVideoSecondHeaderData();
                }
            }).then(() => {
                setEditingText(null);
                showToast.edited('تم تحديث الوصف بنجاح');
            }).catch(error => {
                console.error('Error updating description:', error);
                showToast.error(error.response?.data?.message || 'حدث خطأ في عملية تحديث الوصف');
            }).finally(() => {
                setIsSavingText(false);
            });
        }
    };

    const handleAddCategory = () => {
        if (!newCategory.id || !newCategory.name) return;
        
        setShowCategoryModal(false);
        setIsSavingCategory(true);
        
        const currentLang = i18n.language;
        const adminToken = localStorage.getItem('adminToken');
        
        if (!adminToken) {
            alert('يرجى تسجيل الدخول كمشرف أولاً');
            setIsSavingCategory(false);
            return;
        }

        axios.post('https://elmanafea.shop/admin/addcategory', 
            {
                id: newCategory.id,
                title: newCategory.name,
                lang: currentLang
            },
            {
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            }
        ).then(response => {
            if (response.status === 201) {
                return fetchCategoriesData();
            }
        }).then(() => {
            setNewCategory({ id: '', name: '' });
            showToast.added(`تم إضافة تصنيف "${newCategory.name}" بنجاح`);
        }).catch(error => {
            console.error('Error adding category:', error);
            showToast.error(error.response?.data?.message || 'حدث خطأ في عملية الإضافة');
        }).finally(() => {
            setIsSavingCategory(false);
        });
    };

    const handleUpdateCategory = () => {
        if (!editingCategory?._id) {
            showToast.error('لا يمكن تحديث التصنيف، معرف التصنيف غير موجود');
            return;
        }

        setShowCategoryModal(false);
        setIsSavingCategory(true);
        
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            alert('يرجى تسجيل الدخول كمشرف أولاً');
            setIsSavingCategory(false);
            return;
        }

        axios.put(
            `https://elmanafea.shop/admin/updatecategory/${editingCategory._id}`,
            {
                title: newCategory.name,
                lang: i18n.language
            },
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            }
        ).then(response => {
            if (response.status === 200) {
                return fetchCategoriesData();
            }
        }).then(() => {
            setEditingCategory(null);
            setNewCategory({ id: '', name: '' });
            showToast.edited(`تم تحديث تصنيف "${newCategory.name}" بنجاح`);
        }).catch(error => {
            console.error('Error updating category:', error.response?.data || error);
            showToast.error(error.response?.data?.message || 'حدث خطأ في عملية التحديث');
        }).finally(() => {
            setIsSavingCategory(false);
        });
    };

    const handleConfirmDeleteCategory = () => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            alert('يرجى تسجيل الدخول كمشرف أولاً');
            return;
        }

        axios.delete(
            `https://elmanafea.shop/admin/removecategory/${categoryToDelete._id}`,
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    lang: i18n.language
                }
            }
        ).then(response => {
            if (response.status === 200) {
                return fetchCategoriesData();
            }
        }).then(() => {
            showToast.deleted(`تم حذف التصنيف "${categoryToDelete.name}" بنجاح`);
        }).catch(error => {
            console.error('Error deleting category:', error.response?.data || error);
            showToast.error(error.response?.data?.message || 'حدث خطأ في عملية الحذف');
        }).finally(() => {
            setShowDeleteConfirmModal(false);
            setCategoryToDelete(null);
        });
    };

    const getTextContent = (type, defaultText) => {
        const currentLang = i18n.language;
        return texts[currentLang]?.[type] || t(defaultText);
    };

    const indexOfLastVideo = currentPage * videosPerPage;
    const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
    const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(videos.length / videosPerPage); i++) {
        pageNumbers.push(i);
    }

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const fetchPdfFiles = () => {
        axios.get(`https://elmanafea.shop/pdfs?lang=${i18n.language}`)
        .then(response => {
            if (response.data.pdfs) {
                setPdfFiles(response.data.pdfs);
            }
        }).catch(error => {
            console.error('Error fetching PDFs:', error);
        });
    };

    useEffect(() => {
        fetchPdfFiles();
    }, [i18n.language]);

    if (isLoading) {
        return <div>{<Louder/>}</div>;
    }
    
    return (
        <>
            <Header />
            <div className="videos-header">
                <div className="editable-container">
                    <h1>{getTextContent('title', 'مكتبة الفيديوهات الإسلامية')}</h1>
                    {isAdmin && (
                        <FontAwesomeIcon 
                            icon={faPenToSquare} 
                            className="edit-icon"
                            onClick={() => handleEditTextClick('مكتبة الفيديوهات الإسلامية', 'title')}
                        />
                    )}
                </div>
                <div className="editable-container">
                    <p>{getTextContent('description', 'مجموعة مميزة من المحاضرات والدروس في علوم الشريعة والسيرة النبوية')}</p>
                    {isAdmin && (
                        <FontAwesomeIcon 
                            icon={faPenToSquare} 
                            className="edit-icon"
                            onClick={() => handleEditTextClick('مجموعة مميزة من المحاضرات والدروس في علوم الشريعة والسيرة النبوية', 'description')}
                        />
                    )}
                </div>
            </div>

            <div className="video-categories">
                <ul>
                    {categories.map(category => (
                        <li key={category.id}>
                            <div className="category-name-container">
                                <a  
                                    className={activeCategory === category.id ? 'active' : ''}
                                    onClick={() => handleCategoryClick(category.id)}
                                >
                                    {category.id === 'all' ? 
                                        allVideosTitle[i18n.language]?.all || translations.categories[i18n.language].all 
                                        : category.name
                                    }
                                </a>
                            </div>
                            {isAdmin && category.id !== 'all' && (
                                <div className="category-actions">
                                    <FontAwesomeIcon 
                                        icon={faTrash} 
                                        className="delete-icon"
                                        onClick={() => handleDeleteCategory(category.id)}
                                    />
                                    <FontAwesomeIcon 
                                        icon={faPenToSquare} 
                                        className="edit-icon"
                                        onClick={() => handleEditCategory(category)}
                                    />
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
                {isAdmin && (
                    <button 
                        className="manage-categories-btn"
                        onClick={() => setShowCategoryModal(true)}
                    >
                        <FontAwesomeIcon icon={faCog} /> إدارة التصنيفات
                    </button>
                )}
            </div>

            <section className="videos-section">
                {sectionTitle.visible && (
                    <div className="section-title">
                        <h2>{t(sectionTitle.text)}</h2>
                    </div>
                )}
                <div className="videos-grid">
                    {currentVideos.map((video, index) => (
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
                                            onClick={() => handleEditVideo(video)}
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
                                    ) : video.url ? (
                                        <video 
                                            controls
                                            width="100%"
                                            height="100%"
                                            src={video.url}
                                            title={video.title}
                                        >
                                            Your browser does not support the video tag.
                                        </video>
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

                <div className="pagination">
                    <ul>
                        {currentPage > 1 && (
                            <li>
                                <a onClick={() => paginate(currentPage - 1)}>
                                    <FontAwesomeIcon icon={i18n.dir() === 'ltr' ? faChevronLeft : faChevronRight} />
                                </a>
                            </li>
                        )}
                        {pageNumbers.map(number => (
                            <li key={number}>
                                <a onClick={() => paginate(number)} className={currentPage === number ? 'active' : ''}>
                                    {number}
                                </a>
                            </li>
                        ))}
                        {currentPage < pageNumbers.length && (
                            <li>
                                <a onClick={() => paginate(currentPage + 1)}>
                                    <FontAwesomeIcon icon={i18n.dir() === 'ltr' ? faChevronRight : faChevronLeft} />
                                </a>
                            </li>
                        )}
                    </ul>
                </div>
            </section>

            {isAdmin && (
                <button 
                    className="add-video-btn"
                    onClick={() => setShowAddVideoModal(true)}
                >
                    <FontAwesomeIcon icon={faPlus} /> إضافة فيديو
                </button>
            )}

            {showAddVideoModal && (
                <div className="video-add-modal-overlay">
                    <div className="video-add-modal">
                        <h3>إضافة فيديو جديد</h3>
                        
                        <div className="video-type-selector">
                            <button 
                                className={`video-type-btn ${newVideoData.type === 'youtube' ? 'active' : ''}`}
                                onClick={() => setNewVideoData(prev => ({ ...prev, type: 'youtube' }))}
                            >
                                رابط يوتيوب
                            </button>
                            <button 
                                className={`video-type-btn ${newVideoData.type === 'file' ? 'active' : ''}`}
                                onClick={() => setNewVideoData(prev => ({ ...prev, type: 'file' }))}
                            >
                                رفع ملف
                            </button>
                        </div>

                        <div className="video-add-field">
                            <label>عنوان الفيديو:</label>
                            <input
                                type="text"
                                value={newVideoData.title}
                                onChange={(e) => setNewVideoData(prev => ({ ...prev, title: e.target.value }))}
                                className="video-add-input"
                            />
                        </div>

                        <div className="video-add-field">
                            <label>التصنيف:</label>
                            <select
                                value={newVideoData.category}
                                onChange={(e) => setNewVideoData(prev => ({ ...prev, category: e.target.value }))}
                                className="video-add-input"
                            >
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {newVideoData.type === 'youtube' && (
                            <div className="video-add-field">
                                <label>رابط اليوتيوب:</label>
                                <input
                                    type="text"
                                    value={newVideoData.link}
                                    onChange={(e) => setNewVideoData(prev => ({ ...prev, link: e.target.value }))}
                                    className="video-add-input"
                                    placeholder="مثال: https://www.youtube.com/embed/..."
                                />
                            </div>
                        )}

                        {newVideoData.type === 'file' && (
                            <div className="video-add-field">
                                <label>اختر ملف الفيديو:</label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="video-add-input"
                                />
                            </div>
                        )}

                        <div className="video-modal-buttons">
                            <button 
                                onClick={handleAddVideo} 
                                className="video-save-btn"
                                disabled={!newVideoData.title || (!newVideoData.link && !selectedFile) || isUploading}
                            >
                                {isUploading ? 'جاري الحفظ...' : 'حفظ'}
                            </button>
                            <button 
                                onClick={() => {
                                    setShowAddVideoModal(false);
                                    setNewVideoData({ title: '', link: '', type: '', category: 'all' });
                                    setSelectedFile(null);
                                }} 
                                className="video-cancel-btn"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editModalOpen && editingVideo && (
                <div className="video-edit-modal-overlay">
                    <div className="video-edit-modal">
                        <h3>تعديل الفيديو</h3>
                        
                        <div className="video-edit-field">
                            <label>عنوان الفيديو:</label>
                            <input
                                type="text"
                                value={editingVideo.title}
                                onChange={(e) => setEditingVideo(prev => ({ ...prev, title: e.target.value }))}
                                className="video-edit-input"
                            />
                        </div>

                        <div className="video-edit-field">
                            <label>التصنيف:</label>
                            <select
                                value={editingVideo.category}
                                onChange={(e) => setEditingVideo(prev => ({ ...prev, category: e.target.value }))}
                                className="video-edit-select"
                            >
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {editingVideo.type === 'youtube' ? (
                            <div className="video-edit-field">
                                <label>رابط يوتيوب:</label>
                                <input
                                    type="text"
                                    value={editingVideo.link}
                                    onChange={(e) => setEditingVideo(prev => ({ ...prev, link: e.target.value }))}
                                    className="video-edit-input"
                                    placeholder="مثال: https://www.youtube.com/embed/..."
                                />
                            </div>
                        ) : (
                            <div className="video-edit-field">
                                <label>تغيير ملف الفيديو:</label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="video-edit-input"
                                />
                            </div>
                        )}

                        <div className="video-edit-buttons">
                            <button 
                                onClick={handleSaveVideo} 
                                className="video-edit-save-btn"
                                disabled={!editingVideo?.title || isSavingEdit}
                            >
                                {isSavingEdit ? 'جاري الحفظ...' : 'حفظ'}
                            </button>
                            <button 
                                onClick={() => {
                                    setEditModalOpen(false);
                                    setEditingVideo(null);
                                    setSelectedFile(null);
                                }} 
                                className="video-edit-cancel-btn"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editModalOpen && editingText && (
                <div className="video-modal-overlay">
                    <div className="video-modal-wrapper">
                        <h3 className="video-modal-title">تعديل النص ({i18n.language})</h3>
                        <div className="video-modal-container">
                            <p className="video-modal-text">النص:</p>
                            <input
                                type="text"
                                value={editingText.text}
                                onChange={(e) => setEditingText({...editingText, text: e.target.value})}
                                className="video-modal-input"
                                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                            />
                            <div className="video-modal-actions">
                                <button 
                                    className="video-modal-save"
                                    onClick={handleTextSave}
                                    disabled={!editingText?.text || isSavingText}
                                >
                                    {isSavingText ? 'جاري الحفظ...' : 'حفظ'}
                                </button>
                                <button 
                                    className="video-modal-cancel"
                                    onClick={() => {
                                        setEditModalOpen(false);
                                        setEditingText(null);
                                    }}
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCategoryModal && (
                <div className="video-category-modal-overlay">
                    <div className="video-category-modal">
                        <h3>{editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</h3>
                        
                        <div className="video-category-field">
                            <label>معرف التصنيف:</label>
                            <input
                                type="text"
                                value={newCategory.id}
                                onChange={(e) => setNewCategory(prev => ({ ...prev, id: e.target.value }))}
                                className="video-category-input"
                                disabled={editingCategory}
                            />
                        </div>

                        <div className="video-category-field">
                            <label>اسم التصنيف:</label>
                            <input
                                type="text"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                                className="video-category-input"
                            />
                        </div>

                        {!editingCategory && (
                            <div className="video-categories-list">
                                {categories.map(category => (
                                    <div key={category.id} className="video-category-item">
                                        <span>{category.name}</span>
                                        {category.id !== 'all' && (
                                            <div className="video-category-actions">
                                                <FontAwesomeIcon 
                                                    icon={faPenToSquare} 
                                                    onClick={() => handleEditCategory(category)}
                                                />
                                                <FontAwesomeIcon 
                                                    icon={faTrash} 
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="video-modal-buttons">
                            <button 
                                onClick={editingCategory ? handleUpdateCategory : handleAddCategory} 
                                className="video-save-btn"
                                disabled={!newCategory.id || !newCategory.name || isSavingCategory}
                            >
                                {isSavingCategory ? 'جاري الحفظ...' : (editingCategory ? 'تحديث' : 'إضافة')}
                            </button>
                            <button 
                                onClick={() => {
                                    setShowCategoryModal(false);
                                    setEditingCategory(null);
                                    setNewCategory({ id: '', name: '' });
                                }} 
                                className="video-cancel-btn"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirmModal && (
                <div className="delete-confirm-modal-overlay">
                    <div className="delete-confirm-modal">
                        <h3>تأكيد الحذف</h3>
                        <p>هل أنت متأكد من حذف تصنيف "{categoryToDelete?.name}"؟</p>
                        <div className="delete-confirm-actions">
                            <button
                                className="delete-confirm-btn confirm"
                                onClick={handleConfirmDeleteCategory}
                            >
                                نعم، احذف
                            </button>
                            <button
                                className="delete-confirm-btn cancel"
                                onClick={() => {
                                    setShowDeleteConfirmModal(false);
                                    setCategoryToDelete(null);
                                }}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <section className="pdf-section">
                <div className="pdf-grid">
                    {pdfFiles.map((pdf, index) => (
                        <div className="pdf-card" key={index}>
                            <Document file={pdf.url} onLoadError={console.error}>
                                <Page pageNumber={1} width={300} />
                            </Document>
                            <h3 className="pdf-title">{pdf.title}</h3>
                        </div>
                    ))}
                </div>
            </section>
            <Footer />
        </>
    );
}

export default Videos;