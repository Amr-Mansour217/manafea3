import React, { useState, useEffect } from 'react';
import i18n from './i18n';
import { useTranslation } from 'react-i18next';
import './video.css';
import Header from './header'
import Footer from './footer'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft, faTrash, faPlus, faPenToSquare, faCog } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

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
        fa: 'ویدیوهای منتخب'
    }
};

const allCategories = [
  { id: 'all', name: 'جميع الفيديوهات' },
  { id: 'aqeedah', name: 'العقيدة' },
  { id: 'fiqh', name: 'الفقه' },
  { id: 'tafseer', name: 'تفسير القرآن' },
  { id: 'seerah', name: 'السيرة النبوية' },
  { id: 'hadith', name: 'الحديث' },
  { id: 'akhlaq', name: 'الأخلاق' }
];

function Videos(){
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState('all');
    const [videos, setVideos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const videosPerPage = 8;

    const [isAdmin, setIsAdmin] = useState(false); // تغيير القيمة الافتراضية إلى false

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

    const allVideos = {
        ar: [
            {
                id: 1,
                title: 'احكام الحج',
                link: "https://www.youtube.com/embed/FsDrBKQy7gM",
                category: 'aqeedah',
          },
          {
            id: 2,
            title: '2 احكام الحج',
            link:"https://www.youtube.com/embed/3DlaM8VzOA0",
            category: 'aqeedah',
        },
        {
            id: 3,
            title: '3 احكام الحج',
            link:"https://www.youtube.com/embed/OZloBu0tdN4",
            category: 'aqeedah',
        },
        {
            id: 4,
            title: 'من أحكام الحج _4',
            link:"https://www.youtube.com/embed/T4OplBYc5_k" ,
            category: 'aqeedah',
        },
        {
            id: 5,
            title: 'أحكام الحج 5 | هل يجوز تأخير الحج للشخص القادر ؟',
            link:"https://www.youtube.com/embed/EeARmFLwZtc" ,
            category: 'aqeedah',
        },   
        {
            id: 6,
            title: 'أحكام الحج 6',
            link:"https://www.youtube.com/embed/41O096K052g" ,
            category: 'aqeedah',
        },
        {
            id: 7,
            title: 'أحكام الحج 7',
            link:"https://www.youtube.com/embed/NHAjTRWgEW8"  ,
            category: 'aqeedah',
        },
        {
            id: 8,
            title: 'أحكام الحج | ما أركان الحج وما واجباته، وما سننه، وما الفرق بين الثلاثة؟',
            link:"https://www.youtube.com/embed/ydwmJ5hdSEI"  ,
            category: 'aqeedah',
        },
        {
            id: 9,
            title: 'العقيده الاسلاميه للاطفال وتعليم أقسام التوحيد _ نحولة كيدز',
            link:"https://www.youtube.com/embed/FWsZ2HGagZk"  ,
            category: 'aqeedah',
        },
        {
            id: 10,
            title: 'شرح ثلاثة الأصول (1) لمعالي الشيخ صالح آل الشيخ - عقيدة - كبار العلماء',
            link:"https://www.youtube.com/embed/R5f3FFeRtto"   ,
            category: 'aqeedah',
        },
        {
            id:11,
            title: 'تعليم الاطفال العقيدة الاسلامية الصحيحة| Teaching children the principles of Islam| الله خالقنا',
            link:"https://www.youtube.com/embed/l4JJsY7T654"   ,
            category: 'aqeedah',
        },
        {
            id:12,
            title: 'ما الطريقة المثلى لتعليم الأطفال العقيدة الصحيحة؟ لمعالي الشيخ صالح الفوزان',
            link:"https://www.youtube.com/embed/LT885l6F0AQ"   ,
            category: 'aqeedah',
        },
        {
            id:13,
            title: 'أهمية الفقه في الإسلام | #بذور_الخير الحلقة الحادية والعشرون',
            link:"https://www.youtube.com/embed/g00JHEYCYDQ"    ,
            category: 'fiqh',
        },
        {
            id:14,
            title: '01 تفسير الجزء الاول من القرآن الكريم',
            link:"https://www.youtube.com/embed/CrfPLXu8F_s?list=PLQ7560lEIhRwONVvGZ7P2AcU4Si_fbKaY"    ,
            category: 'tafseer',
        },
        {
            id:15,
            title: '02 تفسير الجزء الثاني من القرآن الكريم',
            link:"https://www.youtube.com/embed/d6mFf0Tx1Qc?list=PLQ7560lEIhRwONVvGZ7P2AcU4Si_fbKaY"    ,
            category: 'tafseer',
        },
        {
            id:16,
            title: '03 تفسير الجزء الثاني من القرآن الكريم',
            link:"https://www.youtube.com/embed/lVfWebt_txg?list=PLQ7560lEIhRwONVvGZ7P2AcU4Si_fbKaY"    ,
            category: 'tafseer',
        },
        {
            id:17,
            title: 'كيف تحولت الدرعية من قرية صغيرة إلى قلب الدولة السعودية الأولى؟ مع د.عبدالله المنيف في مخيال',
            link:"https://www.youtube.com/embed/s15LqNPhaNs"    ,
            category: 'seerah',
        },
        {
            id:18,
            title: 'السيرة النبوية 01 للشيخ الدكتور طارق السويدان',
            link:"https://www.youtube.com/embed/LrwpOlTcqnI"     ,
            category: 'seerah',
        },  
        {
            id:19,
            title: 'فكيف لو رأوني؟ | سلسلة أحاديث نبوية | مع خالد النجار 🎤',
            link:"https://www.youtube.com/embed/rp79XaxrrXk?list=PL0ABfBaCkAn3NNBuQ2tdw5Bu9oY5E-sCn7"     ,
            category: 'hadith',
        },
        {
            id:20,
            title: 'ذنوب عنان السماء | سلسلة أحاديث نبوية | مع خالد النجار 🎤',
            link:"https://www.youtube.com/embed/jtJ0TwGQQj0?list=PL0ABfBaCkAn3NNBuQ2tdw5Bu9oY5E-sCn7",
            category: 'hadith',
        },    
        {
            id:21,
            title: 'حسن الخلق ( الأخلاق في الإسلام ) | فيديو تعليمي !!',
            link:"https://www.youtube.com/embed/r54-Ybflym4",
            category: 'akhlaq',
        },
        {
            id:22,
            title: 'آداب الطعام | تعليم الأطفال | برنامج عمر وإخوته | كرتون إسلامي',
            link:"https://www.youtube.com/embed/1wclOy6fo08",
            category: 'akhlaq',
        },    
    ],
        en: [
            {
                id: 1,
                title: 'Basics of Islamic Creed',
                link: "https://www.youtube.com/embed/2bmwco4Ugfs",
                category: 'aqeedah'
            },
            {
                id: 2,
                title: 'An Unexpected Journey: A European Discovers Islam Online and His Life Turns Upside Down',
                link:"https://www.youtube.com/embed/6WcsHia1VoQ",
                category: 'aqeedah'
            },
            {
                id: 3,
                title: 'Why do we study Tawheed? | Shaykh Haytham Sarhan (',
                link: "https://www.youtube.com/embed/f8PTOQFl4f4?list=PLBFEt29we81SMpAHBNdD5v1F3Wp2gzxnn" ,
                category: 'aqeedah'
            },
            {
                id: 4,
                title: 'Concise Explanation of Kitab At Tawheed | Shaykh Haytham Sarhan',
                link: "https://www.youtube.com/embed/XPOX5QedkGo?list=PLBFEt29we81RV9tEGDnhI8JB2rWDwgBGT" ,
                category: 'aqeedah'
            },
            {
                id: 5,
                title: 'Fiqh - Semester 1',
                link:"https://www.youtube.com/embed/V0tOuxRXgW8?list=PLDOc9rkFwfwD4Yxk6qCwcfnUIXiA6iIeU" ,
                category: 'fiqh'
            },
            {
                id: 6,
                title: 'Fiqh - Semester 1 ',
                link:"https://www.youtube.com/embed/Zxl94-DFGx4?list=PLDOc9rkFwfwD4Yxk6qCwcfnUIXiA6iIeU" ,
                category: 'fiqh'
            },
            {
                id: 7,
                title: 'Description of ablution',
                link: "https://www.youtube.com/embed/Ilmo9467cBU",
                category: 'fiqh'
            },
            {
                id: 8,
                title: 'Nullifiers of ablution',
                link:"https://www.youtube.com/embed/UK94ne7RrIM" ,
                category: 'fiqh'
            },
            {
                id: 9,
                title: 'Surah Al-Faatiha (The Opening) ',
                link:"https://www.youtube.com/embed/v0r76TgXL4E?list=PLYRXQljU5MiJ8Iz_VKgmatnx-H-leJ7st",
                category: 'tafseer'
            },
            {
                id: 10,
                title: 'Alif Laam Meem',
                link:"https://www.youtube.com/embed/YMNEgAGqAIk?list=PLYRXQljU5MiJ8Iz_VKgmatnx-H-leJ7st",
                category: 'tafseer'
            },
            {
                id: 11,
                title: 'Islamic Lectures in English: The Miracles of Muhammad',
                link:"https://www.youtube.com/embed/izMcJqVRPlQ",
                category: 'seerah'
            },
            {
                id: 12,
                title: 'Arabia Before Islam ',
                link:"https://www.youtube.com/embed/BcXSgvJLlYM?list=PLW7-5eCq8IySZOYczT-Z9-vFIBWNH5UMT",
                category: 'seerah'
            },
            {
                id: 13,
                title: 'Book 1: Revelation | English AudioBook',
                link:"https://www.youtube.com/embed/4w8VUspnVwM?list=PL7atYSa5SSm7XhiA_JyBaSd-eUSMAZ_yL",
                category: 'hadith'
            },
            {
                id: 14,
                title: 'Book 2: Revelation | English AudioBook',
                link:"https://www.youtube.com/embed/s5PSoCHPgB4?list=PL7atYSa5SSm7XhiA_JyBaSd-eUSMAZ_yL",
                category: 'hadith'
            },
            {
                id: 15,
                title: 'Morality in the Quran',
                link:"https://www.youtube.com/embed/60NLgmVQt3Y" ,
                category: 'akhlaq'
            },
            {
                id: 16,
                title: 'Good manners ',
                link:"https://www.youtube.com/embed/CHyiIPTy5Ag" ,
                category: 'akhlaq'
            },  {
                id: 17,
                title: 'good behaviour in islam',
                link:"https://www.youtube.com/embed/RFfvMheEnmc" ,
                category: 'akhlaq'
            },  {
                id: 18,
                title: 'Good Character',
                link:"https://www.youtube.com/embed/XkJ6rDjtL_E"  ,
                category: 'akhlaq'
            },
        ],
        ur: [  
            {
                id: 1,
                title: "اسلام کی ضروری باتیں || علم دین سیکھنا ضروری کیوں",
                link:"https://www.youtube.com/embed/IAtw3fPLcRc"   ,
                category: 'fiqh'
            },   {
                id: 2,
                title: "أنوار هدايت / قران کریم کے پاروں کا خلاصہ / آسان اور سہل انداز میں",
                link:"https://www.youtube.com/embed/w2MT7w9rbRM"  ,
                category: 'tafseer'
            },   {
                id: 3,
                title: "سیرت نبوی صلی اللہ علیہ وسلم",
                link:"https://www.youtube.com/embed/WkdD0TVYHOI"  ,
                category: 'seerah'
            },   {
                id: 4,
                title: "نبی ﷺ کا نسب نامہ ",
                link:"https://www.youtube.com/embed/k3tC2IUafPc"  ,
                category: 'seerah'
            },   {
                id: 6,
                title: "نبی ﷺ کے والد کی شادی، وفات اور ترکہ",
                link:"https://www.youtube.com/embed/LBrisEsdCQ0"  ,
                category: 'seerah'
            },   {
                id: 7,
                title: "نبی ﷺ کی ولادت اور رضاعت",
                link:"https://www.youtube.com/embed/4YQkorWEMas"  ,
                category: 'seerah'
            },   {
                id: 8,
                title: "شقًٓ صدر کا واقعہ اور مہر نبوت کا تذکرہ",
                link:"https://www.youtube.com/embed/h5lLbqqZJfc"   ,
                category: 'seerah'
            },

            {
                id: 9,
                title: "اسلام میں عقیدہ آخرت کی اہمیت",
                description: "اسلامی عقیدے کے بارے میں بات کرنا",
                link:"https://www.youtube.com/embed/9UX21zfbi9Q"   ,
                category: 'aqeedah'
            },
            {
                id: 10,
                title: "| اسلامی شریعت میں حدیث کی تعریف کیا ہے ؟ | مولانا ڈاکٹر محمد الیاس فیصل",
                description: "اسلامی قانون میں احادیث کے بارے میں بات کرنے والا کلپ",
                link:"https://www.youtube.com/embed/kVVHEXwZOJg"   ,
                category: 'hadith'
            },
            {
                id: 11,
                title: "قرآن میں بنیادی انسانی اخلاقیات",
                description: "قرآن میں اخلاق کے بارے میں ایک کلپ",
                link:"https://www.youtube.com/embed/dgNmGsshDgM"   ,
                category: 'akhlaq'
            },
        ],
        fr: [
            {
                id: 1,
                title: "Cours 1: La croyance (Al Aquida)",
                link: "https://www.youtube.com/embed/m9cn-hkFcWQ",
                category: 'aqeedah'
            },
            {
                id: 2,
                title: "[1]Al `Aquîda Al-Wassitiya ",
                link:"https://www.youtube.com/embed/2tR3KHseAkg?list=PLRDM2C56WTKEqkajD2htFLxffjeXgfC2j",
                category: 'aqeedah'
            },   {
                id: 3,
                title: "[2] Al `Aquîda Al-Wassitiya",
                link:"https://www.youtube.com/embed/p_7cW82qxJQ?list=PLRDM2C56WTKEqkajD2htFLxffjeXgfC2j",
                category: 'aqeedah'
            },   {
                id: 4,
                title: "COMMENT RATTRAPER SES PRIÈRES. (fiqh mâliki) ",
                link:"https://www.youtube.com/embed/Eev8eCFJB-8?list=PLiGphLNkyYRd9cKcyEU8TEUpQitmz-ZR7" ,
                category: 'fiqh'
            },   {
                id: 5,
                title: "COMMENT CORRIGER SA PRIÈRE (prosternations de l'oubli). ",
                link:"https://www.youtube.com/embed/yvKnJTlxqFE?list=PLiGphLNkyYRd9cKcyEU8TEUpQitmz-ZR7",
                category: 'fiqh'
            },   {
                id: 6,
                title: "Tafsir Imam Sékou Sylla - Sourate Al Baqara Verset 183 à 184",
                link:"https://www.youtube.com/embed/z3poKjmqa5Q?list=PLQQKxe64Xf055MOReJxVT8TRpZ7fj5gsf" ,
                category: 'tafseer'
            },   {
                id: 7,
                title: "Tafsir Imam Sékou Sylla - Sourate Adh-dhariyat Verset 38 à 51 ",
                link:"https://www.youtube.com/embed/EXUmDwPalEU?list=PLQQKxe64Xf055MOReJxVT8TRpZ7fj5gsf",
                category: 'tafseer'
            },   {
                id: 8,
                title: "Tafsir Imam Sékou Sylla : Sourate An-Najm - Verset 33 à 46",
                link:"https://www.youtube.com/embed/Ht5Qxv2WECQ?list=PLQQKxe64Xf055MOReJxVT8TRpZ7fj5gsf",
                category: 'tafseer'
            },   {
                id: 9,
                title: "La Sirah du Prophète Muhammad(SAW) EP 1",
                link:"https://www.youtube.com/embed/H8dzFGR9aoY?list=PLYZxc42QNctXvxDw9LaQk02Nskb2iJTmd",
                category: 'seerah'
            },   {
                id: 10,
                title: "La Sirah du Prophète Muhammad(SAW) EP 2",
                link:"https://www.youtube.com/embed/yIiOy1ajig4?list=PLYZxc42QNctXvxDw9LaQk02Nskb2iJTmd",
                category: 'seerah'
            },   {
                id: 11,
                title: "La Sirah du Prophète Muhammad(SAW) EP 3",
                link:"https://www.youtube.com/embed/HMHxNd7MifE?list=PLYZxc42QNctXvxDw9LaQk02Nskb2iJTmd",
                category: 'seerah'
            },   {
                id: 12,
                title: "H1 - Les 40 Hadîth de Nawawi",
                link:"https://www.youtube.com/embed/dCUvuXYu_9Y?list=PLxJLu-ZcLtGfTZCV9oLOgNcsAL0j88qWJ",
                category: 'hadith'
            },   {
                id: 13,
                title: "H2 - les 40 Hadîth de Nawawi ",
                link:"https://www.youtube.com/embed/T76mNdKhsZ4?list=PLxJLu-ZcLtGfTZCV9oLOgNcsAL0j88qWJ",
                category: 'hadith'
            },   {
                id: 14,
                title: " Les 40 hadith de l'imam An-Nawawi (français)",
                link:"https://www.youtube.com/embed/b2Uuq50Ur_Q",
                category: 'hadith'
            },   {
                id: 15,
                title: "Écoute et tu verras la vie autrement (Conférence) ",
                link:"https://www.youtube.com/embed/oDrOxXHMv_4" ,
                category: 'hadith'
            },   {
                id: 16,
                title: "Science et éthique en islam / en français - Al-Mansour Al-Hudhaili",
                link:"https://www.youtube.com/embed/D7A7xiIi4G0" ,
                category: 'akhlaq'
            },   {
                id: 17,
                title: "Bonnes mœurs",
                link:"https://www.youtube.com/embed/An2d2E44q2U",
                category: 'akhlaq'
            },
      
        ],
        tr: [
            {
                id: 1,
                title: "DHBT MBSTS ÖABT DKAB INANÇ ESASLARI - UNITE 1 - DIN VE INANÇ 🕋",
                link:"https://www.youtube.com/embed/aqXM_hM20hNQg?list=PLTfYWRDOnXGkMUYA7kYE65D1-GoB2JpRL" ,
                category: 'aqeedah'
            },   {
                id: 2,
                title: "İSLAM İNANÇ ESASLARI - ÜNİTE 2 - İSLAM DİNİ ve İNANCI",
                link:"https://www.youtube.com/embed/yFp6bI-hNQg?list=PLTfYWRDOnXGkMUYA7kYE65D1-GoB2JpRL",
                category: 'aqeedah'
            },   {
                id: 3,
                title: "1- Fıkıh ve İslam Hukuku | Fıkha Giriş | Yakup Özcan",
                link:"https://www.youtube.com/embed/1xRTiqXeMK0" ,
                category: 'fiqh'
            },   {
                id: 4,
                title: "2- İslam Hukuku'nun Oluşum Süreci | Fıkha Giriş | Yakup Özcan ",
                link:"https://www.youtube.com/embed/Jz6o_xz_qJc",
                category: 'fiqh'
            },   {
                id: 5,
                title: "İslam’da Söz | Meâric Suresi Tefsiri 7 | Halis Bayancuk Hoca",
                link:"https://www.youtube.com/embed/yL3ba9-UUoY" ,
                category: 'tafseer'
            },   {
                id: 6,
                title: "Hz Muhammed'in Hikmet Dolu 40 Sözü // 40 Hadis Hayatınıza Işık Tutacak Sözler",
                link:"https://www.youtube.com/embed/6Yc3IbxjaeA" ,
                category: 'hadith'
            },
            {
                id: 7,
                title: "Son Din İslam | Saadettin Acar | Konu: Ahlak",
                link:"https://www.youtube.com/embed/iohNcClWNqk",
                category: 'akhlaq'
            },
            {
                id: 8,
                title: "Hz. Muhammed'in (asm) Hayatı - Neden Siyer Öğrenmeliyiz? - Bölüm 1",
                link:"https://www.youtube.com/embed/DcrrhvlwJIY",
                category: 'seerah'
            },
        ],
        id: [
            {
                id: 1,
                title: "[Serial Aqidah] Eps. 1: Pondasi Iman - Ustadz Adi Hidayat",
                link:"https://www.youtube.com/embed/VYD_2fsylcM" ,
                category: 'aqeedah'
            },

            {
                id: 2,
                title: "[Serial Aqidah] Eps. 2: Pokok-Pokok Iman - Ustadz Adi Hidayat",
                link:"https://www.youtube.com/embed/VYD_2fsylcM" ,
                category: 'aqeedah'
            },
              {
                id: 3,
                title: "[Serial Fiqh Eps 1] Bab Pendahuluan Fiqh Sholat - Ustadz Adi Hidayat",
                link:"https://www.youtube.com/embed/_OWAc3cPerU?list=PL3iW_rlEoH5LiWstWEY6bZFIDb7oHXz4h"  ,
                category: 'fiqh'
            },  {
                id: 4,
                title: "[Serial Fiqh Eps 2] Tata Cara Sholat - Ustadz Adi Hidayat",
                link:"https://www.youtube.com/embed/uUsJQutYuAU?list=PL3iW_rlEoH5LiWstWEY6bZFIDb7oHXz4h"  ,
                category: 'fiqh'
            },  {
                id: 5,
                title: "[Serial Fiqh Eps 3] Tata Cara Wudhu - Ustadz Adi Hidayat",
                link:"https://www.youtube.com/embed/h__PMrkx0Tc?list=PL3iW_rlEoH5LiWstWEY6bZFIDb7oHXz4h" ,
                category: 'fiqh'
            },  {
                id: 6,
                title: "Kajian Bakda Subuh Tafsir Al-Insyirah - Ustadz Adi Hidayat",
                link:"https://www.youtube.com/embed/L5Dt_BaG3kQ" ,
                category: 'tafseer'
            },  {
                id: 7,
                title: "Tafsir Surah Adh-Dhuha - Ustadz Adi Hidayat",
                link:"https://www.youtube.com/embed/W7wZStf3iiE"   ,
                category: 'tafseer'
            },  {
                id: 8,
                title: "Sirah Nabawiyah #1 : Pengantar Sirah Nabawiyah - Khalid Basalamah",
                link:"https://www.youtube.com/embed/BWgwRJjm3sc?list=PLlK0gGuioshBgZZf8VOC4IonQtFxPsifW"  ,
                category: 'seerah'
            },  {
                id: 9,
                title: "Sirah Nabawiyah Episode Two - History of Makkah Establishment",
                link:"https://www.youtube.com/embed/hHkxhDdkBWk?list=PLlK0gGuioshBgZZf8VOC4IonQtFxPsifW"  ,
                category: 'seerah'
            },
            {
                id: 10,
                title: "E1] Sirah Rasulullah ﷺ - Kelahiran Baginda Membawa Rahmat Kepada Sekalian Alam | Ustaz Wadi Annuar",
                link:"https://www.youtube.com/embed/VYD_2fsylcM" ,
                category: 'seerah'
            },{
                id: 11,
                title: "Kisah Nabi Muhammad SAW dari Lahir Hingga Wafat | Ustadz Abdul Somad",
                link:"https://www.youtube.com/embed/pij8PGbhZwM" ,
                category: 'hadith'
            },{
                id: 12,
                title: "Perbedaan Adab Dan Akhlak - Ustadz Adi Hidayat",
                link:"https://www.youtube.com/embed/PcntEfe6R_k"  ,
                category: 'akhlaq'
            },
            {
                id: 13,
                title: "Ustaz Amin - Maksud Akhlak Dalam Islam",
                link:"https://www.youtube.com/embed/l8iACx2hG-U" ,
                category: 'akhlaq'
            },
    
        ],
        ru: [
            
           
              {
                id: 1,
                title: "Правильная АКЫДА! | Вероубеждения АХЛЮ СУННА валь джамаа | Юсуф Берхудар",
                link:"https://www.youtube.com/embed/HTnW5v0CUCA"  ,
                category: 'aqeedah'
            },   {
                id: 2,
                title: "Акида ( Вероубеждение ) ОЗВУЧКА - Шейх Ибн аль - Усаймин / напоминание братья и сёстры",
                link:"https://www.youtube.com/embed/fKWI07hD0h4" ,
                category: 'aqeedah'
            },   {
                id: 3,
                title: "Ustaz Amin - Maksud Akhlak Dalam Islam",
                link:"https://www.youtube.com/embed/l8iACx2hG-U" ,
                category: 'fiqh'
            },   {
                id: 4,
                title: "Введение в фикх. Что такое Шариат?",
                link:"https://www.youtube.com/embed/Y2yIrM-JP8c"  ,
                category: 'fiqh'
            },   {
                id: 6,
                title: "удрость в Коране. Часть 1 из 7 | Нуман Али Хан",
                link:"https://www.youtube.com/embed/znlevKeCXpE" ,
                category: 'tafseer'
            },   {
                id: 7,
                title: "Зависть как грех в исламе. Уроки из суры ан-Ниса | Нуман Али Хан (rus sub)",
                link:"https://www.youtube.com/embed/vegaAvUs2Cw"  ,
                category: 'tafseer'
            },   {
                id: 8,
                title: "Сира Пророка Мухаммада ﷺ | Предисловие 1 из 29 | Муфтий Менк",
                link:"https://www.youtube.com/embed/6gpHSUKg9EA"  ,
                category: 'seerah'
            },   {
                id: 9,
                title: "Сира Пророка Мухаммада ﷺ | Времена язычества и Рождение 2 из 29 | Муфтий Менк",
                link:"https://www.youtube.com/embed/AIy5D4DqAEY"  ,
                category: 'seerah'
            },
            {
                id: 10,
                title: "24 хадиса от Пророка, которые изменят вашу жизнь | Время покаяния",
                link:"https://www.youtube.com/embed/vLgrsh51VTU" ,
                category: 'hadith'
            },
            {
                id: 11,
                title: "БЛАГОЙ НРАВ НА ДЕЛЕ | Одна из самых прекрасных лекций шейха Абдурраззак Аль Бадра",
                link:"https://www.youtube.com/embed/n-rcEGYshog" ,
                category: 'akhlaq'
            },
            
    
        ],
        hi: [
            {
                id: 1,
                title:`शीर्षक: "इस्लाम के बारे में आवश्यक बातें || धार्मिक ज्ञान सीखना क्यों ज़रूरी है",`,
                link:"https://www.youtube.com/embed/IAtw3fPLcRc"   ,
                category: 'fiqh'
            },   {
                id: 2,
                title: `अनवर हिदायत / पवित्र कुरान की आयतों का सारांश / सरल और आसान तरीके से`,
                link:"https://www.youtube.com/embed/w2MT7w9rbRM"  ,
                category: 'tafseer'
            },   {
                id: 3,
                title: `पैगम्बर (सल्लल्लाहु अलैहि वसल्लम) की जीवनी`,
                link:"https://www.youtube.com/embed/WkdD0TVYHOI"  ,
                category: 'seerah'
            },   {
                id: 4,
                title: `पैगम्बर की वंशावली`,
                link:"https://www.youtube.com/embed/k3tC2IUafPc"  ,
                category: 'seerah'
            },   {
                id: 6,
                title: `पैगम्बर (स.) के पिता का विवाह, मृत्यु और विरासत`,
                link:"https://www.youtube.com/embed/LBrisEsdCQ0"  ,
                category: 'seerah'
            },   {
                id: 7,
                title: `पैगम्बर (सल्लल्लाहु अलैहि व सल्लम) का जन्म और स्तनपान`,
                link:"https://www.youtube.com/embed/4YQkorWEMas"  ,
                category: 'seerah'
            },   {
                id: 8,
                title: `सद्र की घटना और नबूवत की मुहर का उल्लेख`,
                link:"https://www.youtube.com/embed/h5lLbqqZJfc"   ,
                category: 'seerah'
            }, 
            {
                id: 9,
                title: `रमज़ान के डोनट्स में कदम रखें`,
                description: "रमजान के दौरान हमें क्या करना चाहिए और क्या नहीं करना चाहिए, इस बारे में एक क्लिप।",
                link:"https://www.youtube.com/embed/8s4tNCBXEdE"  ,
                category: 'akhlaq'
            },   {
                id: 10,
                title: `मोजे के ऊपर पोंछने की शर्तें क्या हैं?`,
                description: "एक क्लिप जिसमें मोजे पोंछने की शर्तों के बारे में बताया गया है।",
                link:"https://www.youtube.com/embed/GcxI1PaSK7A"   ,
                category: 'akhlaq'
            },    
            {
                id: 11,
                title: "इस्लामी कानून में हदीस की परिभाषा क्या है? | मौलाना डॉ. मुहम्मद इलियास फैसल",
                description: "اسلامی قانون میں احادیث کے بارے میں بات کرنے والا کلپ",
                link:"https://www.youtube.com/embed/kVVHEXwZOJg"   ,
                category: 'hadith'
            }, 
    
        ],
        bn: [

            {
                id: 1,
                title: "1-ভূমিকা পর্ব: তিনটি মূলনীতির ধারাবাহিক ক্লাস।আলোচকঃ আব্দুর রব আফ্ফান,দ্বীরা সেন্টার রিয়াদ সৌদি আরব।",
                link:"https://www.youtube.com/embed/9TkZdhf51Po"  ,
                category: 'aqeedah'
            },   {
                id: 2,
                title: "আকীদা সংক্রান্ত ভুল-ত্রুটি পর্ব ১",
                link:"https://www.youtube.com/embed/UrRrlCAScas"  ,
                category: 'aqeedah'
            },   {
                id: 3,
                title: "শেখ আব্দুল রাজ্জাকের বাংলায় ইসলামের পরিচয়ের একটি বক্তৃতা।",
                link:"https://www.youtube.com/embed/LN3FGPSqxiQ" ,
                category: 'aqeedah'
            },   {
                id: 4,
                title: "ফিকহ পাঠ্যক্রম, দ্বিতীয় স্তর, পর্ব ১/১০, বাংলায়, প্রচারক মামুন আল-রশিদ, টিচ মি ইসলাম স্কুল",
                link:"https://www.youtube.com/embed/k3tC2IUafPc"  ,
                category: 'fiqh'
            },   {
                id: 6,
                title: "নামাজ পড়ার সঠিক পদ্ধতি",
                link:"https://www.youtube.com/embed/XuTTXcd0-aY" ,
                category: 'fiqh'
            },   {
                id: 7,
                title: "যাকাতুল ফিতর (ফিতরা) | শায়েখ / মোহাম্মদ হুজাইফা ",
                link:"https://www.youtube.com/embed/jJhMPqbFV7o"  ,
                category: 'fiqh'
            },   {
                id: 8,
                title: "উপবাসের অংশগুলি",
                link:"https://www.youtube.com/embed/RQ0BV_iBuCM"   ,
                category: 'fiqh'
            },   
            {
                id: 9,
                title: "পবিত্র কুরআনের ব্যাখ্যা",
                link:"https://www.youtube.com/embed/21MWrFaYHzI"   ,
                category: 'tafseer'
            },
            {
                id: 10,
                title: "সূরা আল-কাওসারের ব্যাখ্যা",
                link:"https://www.youtube.com/embed/_3aE5GyghwQ"  ,
                category: 'tafseer'
            },
            {
                id: 11,
                title: "রমজান কাউন্সিল",
                link:"https://www.youtube.com/embed/PxE60JKK7Ks" ,
                category: 'seerah'
            },
            {
                id: 12,
                title: "নবীর জীবনী অধ্যয়ন",
                link:"https://www.youtube.com/embed/LH_VsQxk3Y4"  ,
                category: 'seerah'
            },
            {
                id: 13,
                title: "নবীজির ৮০টি (গুরুত্বপূর্ণ) ছোট সহিহ হাদীস ",
                description: "একটি হাদিস থেকে একটি ক্লিপ",
                link:"https://www.youtube.com/embed/irGuzlLVIB4"  ,
                category: 'hadith'
            },
            {
                id: 14,
                title: "ইসলামে নৈতিকতা ও আদর্শ",
                description: "ইসলামে নীতিশাস্ত্র সম্পর্কে আলোচনা",
                link:"https://www.youtube.com/embed/6acBpWlxgS8"  ,
                category: 'akhlaq'
            },
    
        ],
        zh: [

            {
                id: 1,
                title: "信仰简释",
                link:"https://www.youtube.com/embed/A0FBuWy_d84"   ,
                category: 'aqeedah'
            },   {
                id: 2,
                title: "伊斯兰教的定义",
                link:"https://www.youtube.com/embed/veptdUXYbpM"   ,
                category: 'aqeedah'
            },   {
                id: 3,
                title: "伊斯兰是什么-2",
                link:"https://www.youtube.com/embed/u9ZIAO7fHT8" ,
                category: 'aqeedah'
            },   {
                id: 4,
                title: "如何祈祷",
                link:"https://www.youtube.com/embed/MciGMMRDbLU"   ,
                category: 'fiqh'
            },   {
                id: 6,
                title: "卡里姆汗 - 朝觐中文版",
                link:"https://www.youtube.com/embed/km_gI7tugX4"  ,
                category: 'fiqh'
            },   {
                id: 7,
                title: "布哈里圣训 ",
                link:"https://www.youtube.com/embed/z830PPQkZOg"  ,
                category: 'hadith'
            },   {
                id: 8,
                title: "布哈里圣训实录 - 知识篇 - 第十二部分",
                link:"https://www.youtube.com/embed/9jwU9h14wt8"   ,
                category: 'hadith'
            },   
            {
                id: 9,
                title: "布哈里圣训实录 - 知识篇 - 第十部分",
                link:"https://www.youtube.com/embed/oZ0LjWHmVzI"    ,
                category: 'hadith'
            },
            {
                id: 10,
                title: "布哈里圣训实录 - 知识篇 - 第八部分",
                link:"https://www.youtube.com/embed/mPEVlFMazFU"   ,
                category: 'hadith'
            },

            {
                id: 11,
                title: "先知及其同伴在斋月期间的状况",
                link:"https://www.youtube.com/embed/o8koNdcRAC4"   ,
                category: 'hadith'
            },
            {
                id: 12,
                title: "开端章的解释",
                description: "开端章完整解读",
                link:"https://www.youtube.com/embed/-FyrENNecM4"   ,
                category: 'tafseer'
            },
            {
                id: 13,
                title: "古兰经第二十二章注释",
                description: "古兰经第二十二章 完整解释",
                link:"https://www.youtube.com/embed/cCl6qZubfTI"   ,
                category: 'tafseer'
            },{
                id: 14,
                title: "古兰经第二十二章注释",
                description: "古兰经第二十二章 法拉格篇的完整解释",
                link:"https://www.youtube.com/embed/73kTev4kbbY"   ,
                category: 'tafseer'
            },{
                id: 15,
                title: "古兰经第二十二章注释",
                description: "古兰经 1：安纳斯篇的完整解释",
                link:"https://www.youtube.com/embed/ypoY3XjiqfI"   ,
                category: 'tafseer'
            },{
                id: 16,
                title: "他为你们而制服天地万物，对于能思维的民众，此中确有许多迹象。",
                description: "宗教经文",
                link:"https://www.youtube.com/embed/w2fbj-b8Uro"   ,
                category: 'tafseer'
            },{
                id: 17,
                title: "先知穆罕默德传记 #1",
                description: "关于先知穆罕默德传记的片段，愿上帝保佯他并赐予他平安。",
                link:"https://www.youtube.com/embed/i_vYYU2F4O8"   ,
                category: 'seerah'
            },{
                id: 18,
                title: "先知传记, 马旭平, 部分 四",
                description: "关于先知穆罕默德传记的片段，愿上帝保佯他并赐予他平安。",
                link:"https://www.youtube.com/embed/r-v6FkGFJ0o"   ,
                category: 'seerah'
            },
            {
                id: 19,
                title: "伊斯兰教的伦理道德",
                description: "一段关于伊斯兰教中道德重要性的视频",
                link:"https://www.youtube.com/embed/7qnvS-QacM8"   ,
                category: 'akhlaq'
            },
    
        ],
        tl: [
            {
                id: 1,
                title: "Ano ang Islam?",
                link:"https://www.youtube.com/embed/eLKwjvCOMaw"    ,
                category: 'aqeedah'
            },   {
                id: 2,
                title: "Tuklasin ang Iyong Tunay na Relihiyon - Filipino",
                link:"https://www.youtube.com/embed/QL6-il8LLkU"   ,
                category: 'aqeedah'
            },   {
                id: 3,
                title: "Muhammad ﷺ sa Torah at sa Bibliya",
                link:"https://www.youtube.com/embed/6iWoHSfhkCc"  ,
                category: 'aqeedah'
            },   {
                id: 4,
                title: "Bakit tayo nilikha ng Diyos?",
                link:"https://www.youtube.com/embed/90oQt-iuCiY"   ,
                category: 'aqeedah'
            },   {
                id: 6,
                title: `Kahulugan ng "Walang Diyos kundi si Allah" - Filipino`,
                link:"https://www.youtube.com/embed/UY3LVFLF6wM"  ,
                category: 'aqeedah'
            },   {
                id: 7,
                title: "RELIHIYON NG MGA PROPETA",
                link:"https://www.youtube.com/embed/6fnVoq3jT10"  ,
                category: 'aqeedah'
            },   {
                id: 8,
                title: "Ang Pamamaraan ng Wudhu at Salah",
                link:"https://www.youtube.com/embed/orBhUttvg0c"   ,
                category: 'fiqh'
            }, 
            {
                id: 9,
                title: "Tafsir Jalalain dan Kitab Tafsir Bagus Lainnya",
                description: "Isang clip na nagsasabi tungkol sa isang tanong na nasa isip ng karamihan ng mga tao: Bakit tayo nilikha ng Diyos?",
                link:"https://www.youtube.com/embed/lsdVFCsPlFc"   ,
                category: 'tafseer'
            },   {
                id: 10,
                title: `Sirah Nabawiyah #1 : Pengantar Sirah Nabawiyah`,
                description: "Pagpapaliwanag ng kahulugan ng La ilaha illa Allah sa wikang Filipino",
                link:"https://www.youtube.com/embed/BWgwRJjm3sc?list=PLlK0gGuioshBgZZf8VOC4IonQtFxPsifW"  ,
                category: 'seerah'
            },   {
                id: 11,
                title: "ISLAM TAGALOG LECTURE",
                description: "Pinag-uusapan ang relihiyon ng mga propeta",
                link:"https://www.youtube.com/embed/GmDxOdKGf3I"  ,
                category: 'hadith'
            },   {
                id: 12,
                title: "Moralidad mula sa Pananaw ng Relihiyong-Islam (1) ",
                description: "Pagsasalita sa Filipino tungkol sa paghuhugas at pagdarasal",
                link:"https://www.youtube.com/embed/EQm-o3Bjde0"   ,
                category: 'akhlaq'
            }, 
    
        ],
        fa: [

            {
                id: 1,
                title: "آیا اسلام دین جدیدی است؟",
                link:"https://www.youtube.com/embed/8ZSg3yQM56k"     ,
                category: 'aqeedah'
            },{
                id: 2,
                title: "بینش در تماس",
                link:"https://www.youtube.com/embed/uAnDDfmsVgI"    ,
                category: 'aqeedah'
            },   {
                id: 3,
                title: "ایمان مسلمان",
                link:"https://www.youtube.com/embed/MNY4zsXXT_w"   ,
                category: 'aqeedah'
            },   {
                id: 4,
                title: "شرح دعا",
                link:"https://www.youtube.com/embed/XuU8qLaOD1s"   ,
                category: 'fiqh'
            },   {
                id: 6,
                title: `شرح صحيح بخارى `,
                link:"https://www.youtube.com/embed/R1_MdEbSl1c"   ,
                category: 'hadith'
            },   {
                id: 7,
                title: "شرح صحيح بخارى 2",
                link:"https://www.youtube.com/embed/CVsB0GcZlXU"  ,
                category: 'hadith'
            },   {
                id: 8,
                title: "شرح صحيح بخارى 3",
                link:"https://www.youtube.com/embed/GakMWfCLLjo"    ,
                category: 'hadith'
            }, 

            {
                id: 9,
                title: "جزء اول ترجمه تفسیری قرآنکریم به زبان فارسی سی جزء کامل",
                description: "شرح دین اسلام و صحبت در مورد آن",
                link:"https://www.youtube.com/embed/AHawE8RLInQ"     ,
                category: 'tafseer'
            },{
                id: 10,
                title: "بررسی سیره نبوی؛ سخنان پیامبر اسلام قبل از وفاتش چه بود",
                description: "صحبت از بصیرت در تبلیغ اسلامی",
                link:"https://www.youtube.com/embed/N0EMLGlWxoE"     ,
                category: 'tafseer'
            },   {
                id: 11,
                title: "بررسی سیره نبوی؛ سخنان پیامبر اسلام قبل از وفاتش چه بود",
                description: "کلیپی در مورد دین اسلام",
                link:"https://www.youtube.com/embed/N0EMLGlWxoE"   ,
                category: 'seerah'
            },   {
                id: 12,
                title: "سيرة النبي صلى الله عليه وسلم",
                description: "صحبت در مورد چگونگی نماز خواندن",
                link:"https://www.youtube.com/embed/0_MOPfSuAbs"    ,
                category: 'seerah'
            },   {
                id: 13,
                title: `اخلاق اسلامی`,
                description: "کلیپی از حدیثی از صحیح بخاری",
                link:"https://www.youtube.com/embed/noX8f1z97Lo"   ,
                category: 'akhlaq'
            }, 
            {
                id: 14,
                title: `اخلاق اسلامی از ما چه میخواهد`,
                description: "کلیپی از حدیثی از صحیح بخاری",
                link:"https://www.youtube.com/embed/Vr_9gNHTkTw"   ,
                category: 'akhlaq'
            }, 
              
    
        ],
    }
    

    useEffect(() => {
        const initializeVideos = () => {
            setIsLoading(true);
            const currentLanguage = i18n.language;
            
            // محاولة تحميل الفيديوهات من localStorage
            const savedVideos = localStorage.getItem('videosData');
            let languageVideos;
            
            if (savedVideos) {
                const parsedVideos = JSON.parse(savedVideos);
                languageVideos = parsedVideos[currentLanguage] || allVideos[currentLanguage] || allVideos.en;
            } else {
                languageVideos = allVideos[currentLanguage] || allVideos.en;
            }
            
            if (activeCategory === 'all') {
                setVideos(languageVideos);
            } else {
                const filteredVideos = languageVideos.filter(video => video.category === activeCategory);
                setVideos(filteredVideos);
            }
            setCurrentPage(1);
            setIsLoading(false);
        };

        initializeVideos();
    }, [i18n.language, activeCategory]);

    useEffect(() => {
        const currentLang = i18n.language;
        
        // تحديث الفئات
        setCategories(prevCategories => {
            const savedCategories = localStorage.getItem('categories');
            if (savedCategories) {
                const parsed = JSON.parse(savedCategories);
                return parsed[currentLang] || Object.entries(translations.categories[currentLang]).map(([id, name]) => ({ id, name }));
            }
            return Object.entries(translations.categories[currentLang]).map(([id, name]) => ({ id, name }));
        });

        // تحديث عنوان "فيديوهات مختارة"
        setSectionTitle(prev => ({
            ...prev,
            text: translations.featuredTitle[currentLang]
        }));
    }, [i18n.language]);

    useEffect(() => {
        const currentLang = i18n.language;
        
        // استرجاع عنوان "فيديوهات مختارة"
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
        
        // استرجاع عنوان "جميع الفيديوهات"
        const savedAllVideosTitle = localStorage.getItem('allVideosTitle');
        if (savedAllVideosTitle) {
            const parsed = JSON.parse(savedAllVideosTitle);
            setAllVideosTitle(parsed);
        }
        
        // استرجاع التصنيفات
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
        
        // استرجاع عنوان "فيديوهات مختارة"
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
        
        // استرجاع التصنيفات
        const savedCategories = localStorage.getItem('categories');
        if (savedCategories) {
            const parsed = JSON.parse(savedCategories);
            if (parsed[currentLang]) {
                setCategories(parsed[currentLang]);
            } else {
                // إذا لم تكن هناك تصنيفات محفوظة للغة الحالية، استخدم التصنيفات الافتراضية
                setCategories(Object.entries(translations.categories[currentLang]).map(([id, name]) => ({ id, name })));
            }
        }
    }, [i18n.language]);

    useEffect(() => {
        fetchVideoHeaderData();
        fetchVideoSecondHeaderData();
        fetchCategoriesData(); // إضافة استدعاء جلب الفئات
    }, [i18n.language]);

    const fetchVideoHeaderData = async () => {
        try {
            const response = await axios.get(`https://elmanafea.shop/vidpageheader?lang=${i18n.language}`);
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
        } catch (error) {
            console.error('Error fetching video header:', error);
        }
    };

    const fetchVideoSecondHeaderData = async () => {
        try {
            const response = await axios.get(`https://elmanafea.shop/vidsecondheader?lang=${i18n.language}`);
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
        } catch (error) {
            console.error('Error fetching video second header:', error);
        }
    };

    const fetchCategoriesData = async () => {
        try {
            const adminToken = localStorage.getItem('adminToken');
            const response = await axios.get(
                `https://elmanafea.shop/admin/categories?lang=${i18n.language}`,
                {
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    }
                }
            );

            if (response.data?.categories) {
                setCategories(response.data.categories.map(cat => ({
                    id: cat.id,
                    name: cat.title,
                    _id: cat._id // إضافة _id من الاستجابة
                })));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            // إذا فشل جلب البيانات، استخدم الفئات الافتراضية
            const defaultCategories = Object.entries(translations.categories[i18n.language])
                .map(([id, name]) => ({ id, name }));
            setCategories(defaultCategories);
        }
    };

    const handleCategoryClick = (categoryId) => {
        setActiveCategory(categoryId);
    };

    const handleAddCategory = async () => {
        if (!newCategory.id || !newCategory.name) return;
        
        const currentLang = i18n.language;
        
        try {
            const adminToken = localStorage.getItem('adminToken');
            if (!adminToken) {
                alert('يرجى تسجيل الدخول كمشرف أولاً');
                return;
            }

            const response = await axios.post('https://elmanafea.shop/admin/categories', 
                {
                    title: newCategory.name,
                    lang: currentLang,
                    index: categories.length + 1
                },
                {
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    }
                }
            );

            if (response.status === 200) {
                await fetchCategoriesData();
                setShowCategoryModal(false);
                setNewCategory({ id: '', name: '' });
                alert('تمت الإضافة بنجاح');
            }

        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'حدث خطأ في عملية الإضافة');
        }
    };

    const handleEditCategory = (category) => {
        if (category.id === 'all') return; // منع تعديل تصنيف "الكل"
        setEditingCategory(category);
        setNewCategory({ ...category });
        setShowCategoryModal(true);
    };

    const handleUpdateCategory = async () => {
        const currentLang = i18n.language;
        
        try {
            const adminToken = localStorage.getItem('adminToken');
            if (!adminToken) {
                alert('يرجى تسجيل الدخول كمشرف أولاً');
                return;
            }

            const response = await axios.post('https://elmanafea.shop/admin/categories', 
                {
                    title: newCategory.name,
                    lang: currentLang,
                    index: categories.findIndex(cat => cat.id === editingCategory?.id) + 1
                },
                {
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    }
                }
            );

            if (response.status === 200) {
                await fetchCategoriesData(); // تحديث البيانات من الباك إند
                setShowCategoryModal(false);
                setEditingCategory(null);
                setNewCategory({ id: '', name: '' });
                alert('تم التحديث بنجاح');
            }

        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'حدث خطأ في عملية التحديث');
        }
    };

    const handleDeleteCategory = (categoryId) => {
        if (categoryId === 'all') return; // منع حذف تصنيف "الكل"
        
        const currentLang = i18n.language;
        const updatedCategories = categories.filter(cat => cat.id !== categoryId);
        
        // حفظ التصنيفات في localStorage
        const savedCategories = JSON.parse(localStorage.getItem('categories') || '{}');
        savedCategories[currentLang] = updatedCategories;
        localStorage.setItem('categories', JSON.stringify(savedCategories));
        
        setCategories(updatedCategories);
    };

    const handleAddVideo = () => {
        const currentLang = i18n.language;
        
        if (!newVideoData.title || (!newVideoData.link && !selectedFile)) return;

        const newVideo = {
            id: Date.now(),
            title: newVideoData.title,
            link: newVideoData.type === 'youtube' 
                ? (newVideoData.link.includes('embed') 
                    ? newVideoData.link 
                    : newVideoData.link.replace('watch?v=', 'embed/'))
                : URL.createObjectURL(selectedFile),
            isLocal: newVideoData.type === 'file',
            category: newVideoData.category
        };

        // تحديث الفيديوهات في localStorage
        const savedVideos = JSON.parse(localStorage.getItem('videosData') || '{}');
        savedVideos[currentLang] = [...(savedVideos[currentLang] || []), newVideo];
        localStorage.setItem('videosData', JSON.stringify(savedVideos));

        setVideos(prev => [...prev, newVideo]);
        setShowAddVideoModal(false);
        setNewVideoData({ title: '', link: '', type: '', category: 'all' });
        setSelectedFile(null);
    };

    const handleDeleteVideo = (videoId) => {
        const currentLang = i18n.language;
        
        const updatedVideos = videos.filter(video => video.id !== videoId);
        
        // تحديث الفيديوهات في localStorage
        const savedVideos = JSON.parse(localStorage.getItem('videosData') || '{}');
        savedVideos[currentLang] = updatedVideos;
        localStorage.setItem('videosData', JSON.stringify(savedVideos));
        
        setVideos(updatedVideos);
    };

    const handleEditVideo = (video) => {
        setEditingVideo({
            ...video,
            type: video.isLocal ? 'file' : 'youtube'
        });
        setEditModalOpen(true);
    };

    const handleSaveVideo = () => {
        const currentLang = i18n.language;
        
        if (!editingVideo.title) return;

        const updatedVideo = {
            ...editingVideo,
            link: editingVideo.type === 'youtube' 
                ? (editingVideo.link.includes('embed') 
                    ? editingVideo.link 
                    : editingVideo.link.replace('watch?v=', 'embed/'))
                : selectedFile ? URL.createObjectURL(selectedFile) : editingVideo.link
        };

        const updatedVideos = videos.map(video => 
            video.id === editingVideo.id ? updatedVideo : video
        );

        // تحديث الفيديوهات في localStorage
        const savedVideos = JSON.parse(localStorage.getItem('videosData') || '{}');
        savedVideos[currentLang] = updatedVideos;
        localStorage.setItem('videosData', JSON.stringify(savedVideos));

        setVideos(updatedVideos);
        setEditModalOpen(false);
        setEditingVideo(null);
        setSelectedFile(null);
    };

    const handleEditTextClick = (text, type) => {
        const currentText = type === 'title' ? 
            getTextContent('title', 'مكتبة الفيديوهات الإسلامية') :
            type === 'description' ?
            getTextContent('description', 'مجموعة مميزة من المحاضرات والدروس في علوم الشريعة والسيرة النبوية') :
            text;

        setEditingText({
            text: currentText,
            type: type
        });
        setEditModalOpen(true);
    };

    const handleTextSave = async () => {
        const currentLang = i18n.language;

        if (editingText.type === 'title') {
            try {
                const adminToken = localStorage.getItem('adminToken');
                if (!adminToken) {
                    alert('يرجى تسجيل الدخول كمشرف أولاً');
                    return;
                }

                const response = await axios.post('https://elmanafea.shop/admin/vidpageheader', 
                    {
                        header: editingText.text,
                        lang: currentLang
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${adminToken}`
                        }
                    }
                );

                if (response.status === 200) {
                    await fetchVideoHeaderData();
                    setEditModalOpen(false);
                    setEditingText(null);
                    alert('تم التحديث بنجاح');
                }

            } catch (error) {
                console.error('Error:', error);
                alert(error.response?.data?.message || 'حدث خطأ في عملية التحديث');
            }
        } else if (editingText.type === 'description') {
            try {
                const adminToken = localStorage.getItem('adminToken');
                if (!adminToken) {
                    alert('يرجى تسجيل الدخول كمشرف أولاً');
                    return;
                }

                const response = await axios.post('https://elmanafea.shop/admin/vidsecondheader', 
                    {
                        second_header: editingText.text,
                        lang: currentLang
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${adminToken}`
                        }
                    }
                );

                if (response.status === 200) {
                    await fetchVideoSecondHeaderData();
                    setEditModalOpen(false);
                    setEditingText(null);
                    alert('تم التحديث بنجاح');
                }

            } catch (error) {
                console.error('Error:', error);
                alert(error.response?.data?.message || 'حدث خطأ في عملية التحديث');
            }
        }
    };

    const getTextContent = (type, defaultText) => {
        const currentLang = i18n.language;
        return texts[currentLang]?.[type] || t(defaultText);
    };

    // حساب الصفحات
    const indexOfLastVideo = currentPage * videosPerPage;
    const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
    const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);

    // حساب عدد الصفحات
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(videos.length / videosPerPage); i++) {
        pageNumbers.push(i);
    }

    // التنقل بين الصفحات
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (isLoading) {
        return <div>Loading...</div>;
    }
    
    return (
        <>
            <Header/>
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
                                {isAdmin && category.id === 'all' && (
                                    <FontAwesomeIcon 
                                        icon={faPenToSquare} 
                                        className="edit-icon"
                                        onClick={() => handleEditTextClick(
                                            allVideosTitle[i18n.language]?.all || translations.categories[i18n.language].all,
                                            'allVideos'
                                        )}
                                        style={{ marginLeft: '10px', cursor: 'pointer', color: '#007bff' }}
                                    />
                                )}
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
                        {isAdmin && (
                            <div className="title-actions">
                                <FontAwesomeIcon 
                                    icon={faPenToSquare} 
                                    className="edit-icon"
                                    onClick={() => handleEditTextClick(sectionTitle.text, 'sectionTitle')}
                                    style={{ marginLeft: '10px', cursor: 'pointer', color: '#007bff' }}
                                />
                                {/* <FontAwesomeIcon 
                                    icon={faTrash} 
                                    className="delete-icon"
                                    onClick={() => {
                                        setSectionTitle(prev => ({ ...prev, visible: false }));
                                        localStorage.setItem('sectionTitle', JSON.stringify({ ...sectionTitle, visible: false }));
                                    }}
                                    style={{ cursor: 'pointer', color: '#dc3545' }}
                                /> */}
                            </div>
                        )}
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
                                {video.isLocal ? (
                                    <div className="local-video-container">
                                        <video className="local-video" src={video.link} controls />
                                    </div>
                                ) : (
                                    <iframe 
                                        width="100%" 
                                        height="100%" 
                                        src={video.link} 
                                        title={video.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                    ></iframe>
                                )}
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
                <div className="edit-modal-overlay">
                    <div className="edit-modal">
                        <h3>إضافة فيديو جديد</h3>
                        
                        <div className="video-type-selector">
                            <button 
                                className={`type-btn ${newVideoData.type === 'youtube' ? 'active' : ''}`}
                                onClick={() => setNewVideoData(prev => ({ ...prev, type: 'youtube' }))}
                            >
                                رابط يوتيوب
                            </button>
                            <button 
                                className={`type-btn ${newVideoData.type === 'file' ? 'active' : ''}`}
                                onClick={() => setNewVideoData(prev => ({ ...prev, type: 'file' }))}
                            >
                                رفع ملف
                            </button>
                        </div>

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
                            <label>التصنيف:</label>
                            <select
                                value={newVideoData.category}
                                onChange={(e) => setNewVideoData(prev => ({ ...prev, category: e.target.value }))}
                                className="edit-input"
                            >
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {newVideoData.type === 'youtube' && (
                            <div className="edit-field">
                                <label>رابط اليوتيوب:</label>
                                <input
                                    type="text"
                                    value={newVideoData.link}
                                    onChange={(e) => setNewVideoData(prev => ({ ...prev, link: e.target.value }))}
                                    className="edit-input"
                                    placeholder="مثال: https://www.youtube.com/embed/..."
                                />
                            </div>
                        )}

                        {newVideoData.type === 'file' && (
                            <div className="edit-field">
                                <label>اختر ملف الفيديو:</label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="edit-input"
                                />
                            </div>
                        )}

                        <div className="modal-buttons">
                            <button 
                                onClick={handleAddVideo} 
                                className="save-btn"
                                disabled={!newVideoData.title || (!newVideoData.link && !selectedFile)}
                            >
                                حفظ
                            </button>
                            <button 
                                onClick={() => {
                                    setShowAddVideoModal(false);
                                    setNewVideoData({ title: '', link: '', type: '', category: 'all' });
                                    setSelectedFile(null);
                                }} 
                                className="cancel-btn"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editModalOpen && editingVideo && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal">
                        <h3>تعديل الفيديو</h3>
                        
                        <div className="edit-field">
                            <label>عنوان الفيديو:</label>
                            <input
                                type="text"
                                value={editingVideo.title}
                                onChange={(e) => setEditingVideo(prev => ({ ...prev, title: e.target.value }))}
                                className="edit-input"
                            />
                        </div>

                        <div className="edit-field">
                            <label>التصنيف:</label>
                            <select
                                value={editingVideo.category}
                                onChange={(e) => setEditingVideo(prev => ({ ...prev, category: e.target.value }))}
                                className="edit-input"
                            >
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {editingVideo.type === 'youtube' ? (
                            <div className="edit-field">
                                <label>رابط يوتيوب:</label>
                                <input
                                    type="text"
                                    value={editingVideo.link}
                                    onChange={(e) => setEditingVideo(prev => ({ ...prev, link: e.target.value }))}
                                    className="edit-input"
                                    placeholder="مثال: https://www.youtube.com/embed/..."
                                />
                            </div>
                        ) : (
                            <div className="edit-field">
                                <label>تغيير ملف الفيديو:</label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="edit-input"
                                />
                            </div>
                        )}

                        <div className="modal-buttons">
                            <button 
                                onClick={handleSaveVideo} 
                                className="save-btn"
                            >
                                حفظ
                            </button>
                            <button 
                                onClick={() => {
                                    setEditModalOpen(false);
                                    setEditingVideo(null);
                                    setSelectedFile(null);
                                }} 
                                className="cancel-btn"
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
                                >
                                    حفظ
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
                <div className="edit-modal-overlay">
                    <div className="edit-modal">
                        <h3>{editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</h3>
                        
                        <div className="edit-field">
                            <label>معرف التصنيف:</label>
                            <input
                                type="text"
                                value={newCategory.id}
                                onChange={(e) => setNewCategory(prev => ({ ...prev, id: e.target.value }))}
                                className="edit-input"
                                disabled={editingCategory}
                            />
                        </div>

                        <div className="edit-field">
                            <label>اسم التصنيف:</label>
                            <input
                                type="text"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                                className="edit-input"
                            />
                        </div>

                        {!editingCategory && (
                            <div className="categories-list">
                                {categories.map(category => (
                                    <div key={category.id} className="category-item">
                                        <span>{category.name}</span>
                                        {category.id !== 'all' && (
                                            <div className="category-actions">
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

                        <div className="modal-buttons">
                            <button 
                                onClick={editingCategory ? handleUpdateCategory : handleAddCategory} 
                                className="save-btn"
                                disabled={!newCategory.id || !newCategory.name}
                            >
                                {editingCategory ? 'تحديث' : 'إضافة'}
                            </button>
                            <button 
                                onClick={() => {
                                    setShowCategoryModal(false);
                                    setEditingCategory(null);
                                    setNewCategory({ id: '', name: '' });
                                }} 
                                className="cancel-btn"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </>
    )
}

export default Videos;