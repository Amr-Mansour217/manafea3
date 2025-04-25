import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// State to track custom translations
let customTranslations = {};

const STORAGE_KEY = 'translations_';

const saveLanguage = (language) => {
  localStorage.setItem('selectedLanguage', language);
};

const getSavedLanguage = () => {
  return localStorage.getItem('selectedLanguage');
};

export const saveTranslation = (language, key, value) => {
  if (!customTranslations[language]) {
    customTranslations[language] = {};
  }
  customTranslations[language][key] = value;

  // Update i18n resources immediately
  const currentBundle = i18n.getResourceBundle(language, 'translation');
  i18n.addResourceBundle(
    language,
    'translation',
    { ...currentBundle, [key]: value },
    true,
    true
  );
};

export const getStoredTranslation = (language, key) => {
  return customTranslations[language]?.[key] || null;
};

// Language change handler
const handleLanguageChange = (lng) => {
  document.documentElement.dir = ['ar', 'fa', 'ur'].includes(lng) ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
};

const loadStoredTranslations = () => {
  const languages = ['ar', 'en', 'fr', 'tr', 'id', 'ru', 'hi', 'ur', 'bn', 'zh', 'tl', 'fa'];
  
  languages.forEach(lang => {
    try {
      // Get stored translations
      const storageKey = STORAGE_KEY + lang;
      const storedTranslations = localStorage.getItem(storageKey);
      
      if (!storedTranslations) return;

      // Parse stored translations
      const translations = JSON.parse(storedTranslations);
      
      // Skip if no translations or invalid format
      if (!translations || typeof translations !== 'object') return;

      // Get existing translations
      const existingTranslations = i18n.getResourceBundle(lang, 'translation') || {};

      // Merge translations
      const mergedTranslations = {
        ...existingTranslations,
        ...translations
      };

      // Update i18n bundle
      i18n.addResourceBundle(
        lang,
        'translation',
        mergedTranslations,
        true,
        true
      );

      // Update in-memory translations
      if (!customTranslations[lang]) {
        customTranslations[lang] = {};
      }
      customTranslations[lang] = {
        ...customTranslations[lang],
        ...translations
      };
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error);
    }
  });
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: {
        translation: {
          "العربية": "العربية",
          "الرئيسية": "الرئيسية",
          "الفيديوهات": "الفيديوهات",
          "القرآن الكريم": "القرآن الكريم",
          "الملفات التفاعلية": "الملفات التفاعلية",
          "تطبيقات إسلامية": "تطبيقات إسلامية",
          "مواقع إسلامية أخرى": "مواقع إسلامية أخرى",
          "منافع للعلوم الإسلامية": "منافع للعلوم الإسلامية",
          "منصة تعليمية إسلامية متكاملة تقدم دروساً ومحاضرات في العلوم الشرعية والتربوية بأسلوب عصري مُيسّر": "منصة تعليمية إسلامية متكاملة تقدم دروساً ومحاضرات في العلوم الشرعية والتربوية بأسلوب عصري مُيسّر",
          "أحدث الدروس": "أحدث الدروس",
          "عرض المزيد من الدروس": "عرض المزيد من الدروس",
          "شاركنا رأيك": "شاركنا رأيك",
          "اكتب تعليقك هنا...": "اكتب تعليقك هنا...",
          "تم بنجاح!": "تم بنجاح!",
          "تم إرسال تقييمك بنجاح، شكراً لك!": "تم إرسال تقييمك بنجاح، شكراً لك!",
          "إغلاق": "إغلاق",
          "إرسال التقييم": "إرسال التقييم",
          "جميع الفيديوهات": "جميع الفيديوهات",
          "العقيدة": "العقيدة",
          "الفقه": "الفقه",
          "تفسير القرآن": "تفسير القرآن",
          "السيرة النبوية": "السيرة النبوية",
          "الحديث": "الحديث",
          "الأخلاق": "الأخلاق",
          "العلوم التربوية": "العلوم التربوية",
          "مكتبة الفيديوهات الإسلامية": "مكتبة الفيديوهات الإسلامية",
          "مجموعة مميزة من المحاضرات والدروس في علوم الشريعة والسيرة النبوية": "مجموعة مميزة من المحاضرات والدروس في علوم الشريعة والسيرة النبوية",
          "فيديوهات مختارة": "فيديوهات مختارة",
          "كتب مختارة": "كتب مختارة",
          "مكتبة الكتب الإسلامية": "مكتبة الكتب الإسلامية",
          "مكتبة التطبيقات الإسلامية": "مكتبة التطبيقات الإسلامية",
          "مكتبة المواقع الإسلامية": "مكتبة المواقع الإسلامية",
          "جميع الحقوق محفوظة": "جميع الحقوق محفوظة",
          "منافع - منصة تعليمية إسلامية": "منافع - منصة تعليمية إسلامية",
          "خطأ!": "خطأ!",
          'الرئيسية': 'الرئيسية',
      'الفيديوهات': 'الفيديوهات',
      'الكتب': 'الكتب',
      'عن_المنافع': 'عن المنافع',
      'اتصل_بنا': 'اتصل بنا',
      'تسجيل_الدخول': 'تسجيل الدخول',
      'تسجيل_الخروج': 'تسجيل الخروج',
      'لوحة_التحكم': 'لوحة التحكم',

      // الصفحة الرئيسية
      'شاركنا_رأيك': 'شاركنا رأيك',
      'اكتب_تعليقك': 'اكتب تعليقك هنا...',
      'إرسال_التقييم': 'إرسال التقييم',
      'نجاح': 'تم بنجاح!',
      'نجاح_التقييم': 'تم إرسال تقييمك بنجاح، شكراً لك!',
      'إغلاق': 'إغلاق',
      'خطأ': 'خطأ!',
      'إضافة_فيديو_جديد': 'إضافة فيديو جديد',
      'عنوان_الفيديو': 'عنوان الفيديو',
      'أدخل_عنوان_الفيديو': 'أدخل عنوان الفيديو',
      'نوع_الفيديو': 'نوع الفيديو',
      'يوتيوب': 'يوتيوب',
      'رفع_من_الجهاز': 'رفع من الجهاز',
      'رابط_الفيديو': 'رابط الفيديو',
      'أدخل_رابط_يوتيوب': 'أدخل رابط الفيديو من يوتيوب',
      'ملف_الفيديو': 'ملف الفيديو',
      'إضافة': 'إضافة',
      'إلغاء': 'إلغاء',
      'تعديل_النص': 'تعديل النص',
      'حفظ': 'حفظ',
      'النص': 'النص',
      'عرض_المزيد': 'عرض المزيد',

      // رسائل الخطأ
      'الرجاء_تسجيل_الدخول': 'يرجى تسجيل الدخول كمسؤول أولاً',
      'أدخل_العنوان': 'يرجى إدخال عنوان الفيديو',
      'أدخل_الرابط': 'يرجى إدخال رابط الفيديو',
      'اختر_الملف': 'يرجى اختيار ملف الفيديو',
      'خطأ_الإضافة': 'حدث خطأ أثناء إضافة الفيديو',
          "يرجى اختيار عدد النجوم وكتابة تعليق قبل الإرسال": "يرجى اختيار عدد النجوم وكتابة تعليق قبل الإرسال",
          "جميع الكتب": "جميع الكتب",
          "مجموعة مميزة من الكتب في علوم الشريعة والسيرة النبوية": "مجموعة مميزة من الكتب في علوم الشريعة والسيرة النبوية",
          "بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ": "بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ",
          "🌙 شهر رمضان مبارك 🌙": "🌙 شهر رمضان مبارك 🌙",
          "لم يتم تلقي أي رد من الخادم. يُرجى التحقق من اتصالك بالإنترنت.": "لم يتم تلقي أي رد من الخادم. يُرجى التحقق من اتصالك بالإنترنت.",
          "مجموعة مميزة من التطبيقات الإسلامية المفيدة": "مجموعة مميزة من التطبيقات الإسلامية المفيدة",
          "﴿ شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ ۚ فَمَن شَهِدَ مِنكُمُ الشَّهْرَ فَلْيَصُمْهُ ۖ وَمَن كَانَ مَرِيضًا أَوْ عَلَىٰ سَفَرٍ فَعِدَّةٌ مِّنْ أَيَّامٍ أُخَرَ ۗ يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ وَلِتُكْمِلُوا الْعِدَّةَ وَلِتُكَبِّرُوا اللَّهَ عَلَىٰ مَا هَدَاكُمْ وَلَعَلَّكُمْ تَشْكُرُونَ ﴾": "﴿ شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ ۚ فَمَن شَهِدَ مِنكُمُ الشَّهْرَ فَلْيَصُمْهُ ۖ وَمَن كَانَ مَرِيضًا أَوْ عَلَىٰ سَفَرٍ فَعِدَّةٌ مِّنْ أَيَّامٍ أُخَرَ ۗ يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ وَلِتُكْمِلُوا الْعِدَّةَ وَلِتُكَبِّرُوا اللَّهَ عَلَىٰ مَا هَدَاكُمْ وَلَعَلَّكُمْ تَشْكُرُونَ ﴾",
          "مجموعة مميزة من المواقع الإسلامية المفيدة": "مجموعة مميزة من المواقع الإسلامية المفيدة",
        }
      },
      en: {
        translation: {
          "العربية": "English",
          "الرئيسية": "Home",
          "الفيديوهات": "Videos",
          "القرآن الكريم": "Al Qur'an Al Kareem",
          "الملفات التفاعلية": "Interactive files",
          "تطبيقات إسلامية": "Islamic applications",
          "مواقع إسلامية أخرى": "Another Islamic sites",
          "منافع للعلوم الإسلامية": "Manafea for Islamic Sciences",
          "منصة تعليمية إسلامية متكاملة تقدم دروساً ومحاضرات في العلوم الشرعية والتربوية بأسلوب عصري مُيسّر": "An integrated Islamic educational platform offering lessons and lectures in Sharia and educational sciences in a modern, simplified style",
          "أحدث الدروس": "Latest Lessons",
          "عرض المزيد من الدروس": "View More Lessons",
          "شاركنا رأيك": "Share Your Opinion",
          "اكتب تعليقك هنا...": "Write your comment here...",
          "تم بنجاح!": "Success!",
          "تم إرسال تقييمك بنجاح، شكراً لك!": "Your feedback has been sent successfully, thank you!",
          "إغلاق": "Close",
          "جميع الفيديوهات": "All Videos",
          "العقيدة": "Aqeedah (Creed)",
          "الفقه": "Fiqh (Jurisprudence)",
          "تفسير القرآن": "Quran Interpretation",
          "السيرة النبوية": "Prophetic Biography",
          "الحديث": "Hadith",
          "الأخلاق": "Ethics",
          "العلوم التربوية": "Educational Sciences",
          "مكتبة الفيديوهات الإسلامية": "Islamic Videos Library",
          "مجموعة مميزة من المحاضرات والدروس في علوم الشريعة والسيرة النبوية": "A distinguished collection of lectures and lessons in Sharia sciences and Prophetic biography",
          "فيديوهات مختارة": "Selected Videos",
          "كتب مختارة": "Selected Books",
          "مكتبة الكتب الإسلامية": "Islamic Books Library",
          "مكتبة التطبيقات الإسلامية": "Islamic Applications Library",
          "مكتبة المواقع الإسلامية": "Islamic Websites Library",
          "جميع الحقوق محفوظة": "All Rights Reserved",
          "منافع - منصة تعليمية إسلامية": "Manafea - Islamic Educational Platform",
          "إرسال التقييم": "Submit Feedback",
          "خطأ!": "Error!",
          "يرجى اختيار عدد النجوم وكتابة تعليق قبل الإرسال": "Please select the number of stars and write a comment before submitting",
          "جميع الكتب": "All Books",
          "مجموعة مميزة من الكتب في علوم الشريعة والسيرة النبوية": "A distinguished collection of books in Sharia sciences and Prophetic biography",
          "بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ": "In the name of Allah, the Most Gracious, the Most Merciful",
          "لم يتم تلقي أي رد من الخادم. يُرجى التحقق من اتصالك بالإنترنت.": "No response was received from the server. Please check your internet connection.",
          "🌙 شهر رمضان مبارك 🌙": "🌙 Blessed Ramadan Month 🌙",
          "مجموعة مميزة من التطبيقات الإسلامية المفيدة": "A distinguished collection of useful Islamic applications",
          "﴿ شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ ۚ فَمَن شَهِدَ مِنكُمُ الشَّهْرَ فَلْيَصُمْهُ ۖ وَمَن كَانَ مَرِيضًا أَوْ عَلَىٰ سَفَرٍ فَعِدَّةٌ مِّنْ أَيَّامٍ أُخَرَ ۗ يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ وَلِتُكْمِلُوا الْعِدَّةَ وَلِتُكَبِّرُوا الْلَّهَ عَلَىٰ مَا هَدَاكُمْ وَلَعَلَّكُمْ شَكُرُونَ ﴾": "The month of Ramadan in which was revealed the Quran, a guidance for mankind and clear proofs for the guidance and the criterion (between right and wrong). So whoever of you sights (the crescent on the first night of) the month (of Ramadan), he must fast that month, and whoever is ill or on a journey, the same number (of days which one did not fast must be made up) from other days. Allah intends for you ease, and He does not want to make things difficult for you. (He wants that you) must complete the same number (of days), and that you must magnify Allah for having guided you so that you may be grateful to Him.",
          "مجموعة مميزة من المواقع الإسلامية المفيدة": "A distinguished collection of useful Islamic websites",
        }
      },
    },
    fallbackLng: 'ar',
    detection: {
      order: ['localStorage', 'navigator'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Add language change listener
i18n.on('languageChanged', handleLanguageChange);

// Initial language setup
handleLanguageChange(i18n.language);

const savedLanguage = getSavedLanguage();
if (savedLanguage) {
  i18n.changeLanguage(savedLanguage);
}

export const changeLanguage = async (lng) => {
  await i18n.changeLanguage(lng);
  handleLanguageChange(lng);
  // Load stored translations for the new language
  const storageKey = STORAGE_KEY + lng;
  const storedTranslations = localStorage.getItem(storageKey);
  if (storedTranslations) {
    const translations = JSON.parse(storedTranslations);
    if (translations && typeof translations === 'object') {
      i18n.addResourceBundle(lng, 'translation', translations, true, true);
    }
  }
};

export { saveLanguage, getSavedLanguage };
export const getDirection = (language) => {
  return ['ar', 'fa', 'ur'].includes(language) ? 'rtl' : 'ltr';
};

export default i18n;