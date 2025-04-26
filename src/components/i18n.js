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
          "العودة":"العودة",
          "تطبيقات إسلامية": "تطبيقات إسلامية",
          "مواقع إسلامية أخرى": "مواقع إسلامية أخرى",
          "منافع للعلوم الإسلامية": "منافع للعلوم الإسلامية",
          "مسابقة منافع":"مسابقة منافع",
          "المسابقة الرمضانية":"المسابقة الرمضانية",
          "السؤال:":"السؤال:",
          "الإجابة":"الإجابة",
          "الاسم":"الاسم",
          "رقم الهاتف":"رقم الهاتف",
          "البلد":"البلد",
          "البريد الإلكتروني (اختياري)":"البريد الإلكتروني (اختياري)",
          "رحلة الحج":"رحلة الحج",
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
            "القرآن الكريم": "Quran",
            "الملفات التفاعلية": "Interactive Files",
            "العودة": "Back",
            "تطبيقات إسلامية": "Islamic Apps",
            "مواقع إسلامية أخرى": "Other Islamic Websites",
            "منافع للعلوم الإسلامية": "Manafea for Islamic Sciences",
            "مسابقة منافع": "Manafea Contest",
            "المسابقة الرمضانية": "Ramadan Contest",
            "السؤال:": "Question:",
            "الإجابة": "Answer",
            "الاسم": "Name",
            "رقم الهاتف": "Phone Number",
            "البلد": "Country",
            "البريد الإلكتروني (اختياري)": "Email (optional)",
            "رحلة الحج": "Hajj Journey",
            "منصة تعليمية إسلامية متكاملة تقدم دروساً ومحاضرات في العلوم الشرعية والتربوية بأسلوب عصري مُيسّر": "A comprehensive Islamic educational platform offering lessons and lectures in Sharia and educational sciences in a modern, simplified style",
            "أحدث الدروس": "Latest Lessons",
            "عرض المزيد من الدروس": "Show More Lessons",
            "شاركنا رأيك": "Share Your Opinion",
            "اكتب تعليقك هنا...": "Write your comment here...",
            "تم بنجاح!": "Success!",
            "تم إرسال تقييمك بنجاح، شكراً لك!": "Your feedback has been sent successfully, thank you!",
            "إغلاق": "Close",
            "إرسال التقييم": "Send Feedback",
            "جميع الفيديوهات": "All Videos",
            "العقيدة": "Aqidah (Belief)",
            "الفقه": "Fiqh (Jurisprudence)",
            "تفسير القرآن": "Quran Interpretation",
            "السيرة النبوية": "Prophetic Biography",
            "الحديث": "Hadith",
            "الأخلاق": "Morals",
            "العلوم التربوية": "Educational Sciences",
            "مكتبة الفيديوهات الإسلامية": "Islamic Video Library",
            "مجموعة مميزة من المحاضرات والدروس في علوم الشريعة والسيرة النبوية": "A distinguished collection of lectures and lessons in Sharia sciences and the Prophet's biography",
            "فيديوهات مختارة": "Selected Videos",
            "كتب مختارة": "Selected Books",
            "مكتبة الكتب الإسلامية": "Islamic Book Library",
            "مكتبة التطبيقات الإسلامية": "Islamic Apps Library",
            "مكتبة المواقع الإسلامية": "Islamic Websites Library",
            "جميع الحقوق محفوظة": "All Rights Reserved",
            "منافع - منصة تعليمية إسلامية": "Manafea - Islamic Educational Platform",
            "خطأ!": "Error!",
            "الرئيسية": "Home",
            "الفيديوهات": "Videos",
            "الكتب": "Books",
            "عن_المنافع": "About Manafea",
            "اتصل_بنا": "Contact Us",
            "تسجيل_الدخول": "Login",
            "تسجيل_الخروج": "Logout",
            "لوحة_التحكم": "Dashboard",
            "شاركنا_رأيك": "Share Your Opinion",
            "اكتب_تعليقك": "Write your comment here...",
            "إرسال_التقييم": "Send Feedback",
            "نجاح": "Success!",
            "نجاح_التقييم": "Your feedback has been sent successfully, thank you!",
            "إغلاق": "Close",
            "خطأ": "Error!",
            "إضافة_فيديو_جديد": "Add New Video",
            "عنوان_الفيديو": "Video Title",
            "أدخل_عنوان_الفيديو": "Enter video title",
            "نوع_الفيديو": "Video Type",
            "يوتيوب": "YouTube",
            "رفع_من_الجهاز": "Upload from Device",
            "رابط_الفيديو": "Video Link",
            "أدخل_رابط_يوتيوب": "Enter YouTube video link",
            "ملف_الفيديو": "Video File",
            "إضافة": "Add",
            "إلغاء": "Cancel",
            "تعديل_النص": "Edit Text",
            "حفظ": "Save",
            "النص": "Text",
            "عرض_المزيد": "Show More",
            "الرجاء_تسجيل_الدخول": "Please login as admin first",
            "أدخل_العنوان": "Please enter the video title",
            "أدخل_الرابط": "Please enter the video link",
            "اختر_الملف": "Please select the video file",
            "خطأ_الإضافة": "An error occurred while adding the video",
            "يرجى اختيار عدد النجوم وكتابة تعليق قبل الإرسال": "Please select the number of stars and write a comment before submitting",
            "جميع الكتب": "All Books",
            "مجموعة مميزة من الكتب في علوم الشريعة والسيرة النبوية": "A distinguished collection of books in Sharia sciences and the Prophet's biography",
            "بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ": "In the name of Allah, the Most Gracious, the Most Merciful",
            "🌙 شهر رمضان مبارك 🌙": "🌙 Blessed Ramadan 🌙",
            "لم يتم تلقي أي رد من الخادم. يُرجى التحقق من اتصالك بالإنترنت.": "No response received from the server. Please check your internet connection.",
            "مجموعة مميزة من التطبيقات الإسلامية المفيدة": "A distinguished collection of useful Islamic apps",
            "﴿ شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ ۚ فَمَن شَهِدَ مِنكُمُ الشَّهْرَ فَلْيَصُمْهُ ۖ وَمَن كَانَ مَرِيضًا أَوْ عَلَىٰ سَفَرٍ فَعِدَّةٌ مِّنْ أَيَّامٍ أُخَرَ ۗ يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ وَلِتُكْمِلُوا الْعِدَّةَ وَلِتُكَبِّرُوا اللَّهَ عَلَىٰ مَا هَدَاكُمْ وَلَعَلَّكُمْ تَشْكُرُونَ ﴾": "The month of Ramadan in which the Quran was revealed as guidance for mankind and clear proofs of guidance and criterion...",
            "مجموعة مميزة من المواقع الإسلامية المفيدة": "A distinguished collection of useful Islamic websites"
        }
      },
      fr: {
        translation: {
          "العربية": "Français",
              "الرئيسية": "Accueil",
              "الفيديوهات": "Vidéos",
              "القرآن الكريم": "Coran",
              "العودة": "Retour",
              "الملفات التفاعلية": "Fichiers interactifs",
              "تطبيقات إسلامية": "Applications islamiques",
              "مواقع إسلامية أخرى": "Autres sites islamiques",
              "منافع للعلوم الإسلامية": "Manafea pour les sciences islamiques",
              "مسابقة منافع": "Concours Manafea",
              "المسابقة الرمضانية": "Concours du Ramadan",
              "السؤال:": "Question :",
              "الإجابة": "Réponse",
              "الاسم": "Nom",
              "رقم الهاتف": "Numéro de téléphone",
              "البلد": "Pays",
              "البريد الإلكتروني (اختياري)": "Email (facultatif)",
              "رحلة الحج": "Voyage du Hajj",
              "منصة تعليمية إسلامية متكاملة تقدم دروساً ومحاضرات في العلوم الشرعية والتربوية بأسلوب عصري مُيسّر": "Une plateforme éducative islamique intégrée offrant des leçons et des conférences en sciences de la charia et de l'éducation dans un style moderne et simplifié",
              "أحدث الدروس": "Dernières leçons",
              "عرض المزيد من الدروس": "Afficher plus de leçons",
              "شاركنا رأيك": "Partagez votre avis",
              "اكتب تعليقك هنا...": "Écrivez votre commentaire ici...",
              "تم بنجاح!": "Succès !",
              "تم إرسال تقييمك بنجاح، شكراً لك!": "Votre évaluation a été envoyée avec succès, merci !",
              "إغلاق": "Fermer",
              "إرسال التقييم": "Envoyer l'évaluation",
              "جميع الفيديوهات": "Toutes les vidéos",
              "العقيدة": "Aqidah (Croyance)",
              "الفقه": "Fiqh (Jurisprudence)",
              "تفسير القرآن": "Interprétation du Coran",
              "السيرة النبوية": "Biographie prophétique",
              "الحديث": "Hadith",
              "الأخلاق": "Éthique",
              "العلوم التربوية": "Sciences de l'éducation",
              "مكتبة الفيديوهات الإسلامية": "Bibliothèque de vidéos islamiques",
              "مجموعة مميزة من المحاضرات والدروس في علوم الشريعة والسيرة النبوية": "Une collection distinguée de conférences et de leçons en sciences de la charia et de la biographie prophétique",
              "فيديوهات مختارة": "Vidéos sélectionnées",
              "كتب مختارة": "Livres sélectionnés",
              "مكتبة الكتب الإسلامية": "Bibliothèque de livres islamiques",
              "مكتبة التطبيقات الإسلامية": "Bibliothèque d'applications islamiques",
              "مكتبة المواقع الإسلامية": "Bibliothèque de sites islamiques",
              "جميع الحقوق محفوظة": "Tous droits réservés",
              "منافع - منصة تعليمية إسلامية": "Manafea - Plateforme éducative islamique",
              "خطأ!": "Erreur !",
              "الرئيسية": "Accueil",
              "الفيديوهات": "Vidéos",
              "الكتب": "Livres",
              "عن_المنافع": "À propos de Manafea",
              "اتصل_بنا": "Contactez-nous",
              "تسجيل_الدخول": "Se connecter",
              "تسجيل_الخروج": "Se déconnecter",
              "لوحة_التحكم": "Tableau de bord",
              "شاركنا_رأيك": "Partagez votre avis",
              "اكتب_تعليقك": "Écrivez votre commentaire ici...",
              "إرسال_التقييم": "Envoyer l'évaluation",
              "نجاح": "Succès !",
              "نجاح_التقييم": "Votre évaluation a été envoyée avec succès, merci !",
              "إغلاق": "Fermer",
              "خطأ": "Erreur !",
              "إضافة_فيديو_جديد": "Ajouter une nouvelle vidéo",
              "عنوان_الفيديو": "Titre de la vidéo",
              "أدخل_عنوان_الفيديو": "Entrez le titre de la vidéo",
              "نوع_الفيديو": "Type de vidéo",
              "يوتيوب": "YouTube",
              "رفع_من_الجهاز": "Télécharger depuis l'appareil",
              "رابط_الفيديو": "Lien de la vidéo",
              "أدخل_رابط_يوتيوب": "Entrez le lien de la vidéo YouTube",
              "ملف_الفيديو": "Fichier vidéo",
              "إضافة": "Ajouter",
              "إلغاء": "Annuler",
              "تعديل_النص": "Modifier le texte",
              "حفظ": "Enregistrer",
              "النص": "Texte",
              "عرض_المزيد": "Voir plus",
              "الرجاء_تسجيل_الدخول": "Veuillez d'abord vous connecter en tant qu'administrateur",
              "أدخل_العنوان": "Veuillez entrer le titre de la vidéo",
              "أدخل_الرابط": "Veuillez entrer le lien de la vidéo",
              "اختر_الملف": "Veuillez sélectionner le fichier vidéo",
              "خطأ_الإضافة": "Une erreur s'est produite lors de l'ajout de la vidéo",
              "يرجى اختيار عدد النجوم وكتابة تعليق قبل الإرسال": "Veuillez sélectionner le nombre d'étoiles et écrire un commentaire avant de soumettre",
              "جميع الكتب": "Tous les livres",
              "مجموعة مميزة من الكتب في علوم الشريعة والسيرة النبوية": "Une collection distinguée de livres en sciences de la charia et de la biographie prophétique",
              "بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ": "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux",
              "🌙 شهر رمضان مبارك 🌙": "🌙 Béni soit le mois de Ramadan 🌙",
              "لم يتم تلقي أي رد من الخادم. يُرجى التحقق من اتصالك بالإنترنت.": "Aucune réponse n'a été reçue du serveur. Veuillez vérifier votre connexion Internet.",
              "مجموعة مميزة من التطبيقات الإسلامية المفيدة": "Une collection distinguée d'applications islamiques utiles",
              "﴿ شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ ۚ فَمَن شَهِدَ مِنكُمُ الشَّهْرَ فَلْيَصُمْهُ ۖ وَمَن كَانَ مَرِيضًا أَوْ عَلَىٰ سَفَرٍ فَعِدَّةٌ مِّنْ أَيَّامٍ أُخَرَ ۗ يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ وَلِتُكْمِلُوا الْعِدَّةَ وَلِتُكَبِّرُوا اللَّهَ عَلَىٰ مَا هَدَاكُمْ وَلَعَلَّكُمْ تَشْكُرُونَ ﴾": "Le mois de Ramadan au cours duquel le Coran a été descendu comme guide pour les gens et preuves claires de la bonne direction et du discernement...",
              "مجموعة مميزة من المواقع الإسلامية المفيدة": "Une collection distinguée de sites web islamiques utiles"
        }
      }, 
      tr: {
        translation: {
          "العربية": "Türkçe",
            "الرئيسية": "Ana Sayfa",
            "الفيديوهات": "Videolar",
            "القرآن الكريم": "Kur'an",
            "العودة": "Geri",
            "الملفات التفاعلية": "Etkileşimli Dosyalar",
            "تطبيقات إسلامية": "İslami Uygulamalar",
            "مواقع إسلامية أخرى": "Diğer İslami Siteler",
            "منافع للعلوم الإسلامية": "İslami İlimler İçin Manafea",
            "مسابقة منافع": "Manafea Yarışması",
            "المسابقة الرمضانية": "Ramazan Yarışması",
            "السؤال:": "Soru:",
            "الإجابة": "Cevap",
            "الاسم": "Ad",
            "رقم الهاتف": "Telefon Numarası",
            "البلد": "Ülke",
            "البريد الإلكتروني (اختياري)": "E-posta (isteğe bağlı)",
            "رحلة الحج": "Hac Yolculuğu",
            "منصة تعليمية إسلامية متكاملة تقدم دروساً ومحاضرات في العلوم الشرعية والتربوية بأسلوب عصري مُيسّر": "Şeriat ve eğitim bilimlerinde modern ve basitleştirilmiş bir tarzda dersler ve konferanslar sunan entegre bir İslami eğitim platformu",
            "أحدث الدروس": "En Son Dersler",
            "عرض المزيد من الدروس": "Daha Fazla Ders Görüntüle",
            "شاركنا رأيك": "Görüşünüzü Paylaşın",
            "اكتب تعليقك هنا...": "Yorumunuzu buraya yazın...",
            "تم بنجاح!": "Başarılı!",
            "تم إرسال تقييمك بنجاح، شكراً لك!": "Görüşleriniz başarıyla gönderildi, teşekkür ederiz!",
            "إغلاق": "Kapat",
            "إرسال التقييم": "Değerlendirme Gönder",
            "جميع الفيديوهات": "Tüm Videolar",
            "العقيدة": "Akide (İnanç)",
            "الفقه": "Fıkıh (Hukuk)",
            "تفسير القرآن": "Kur'an Yorumu",
            "السيرة النبوية": "Peygamber Biyografisi",
            "الحديث": "Hadis",
            "الأخلاق": "Ahlak",
            "العلوم التربوية": "Eğitim Bilimleri",
            "مكتبة الفيديوهات الإسلامية": "İslami Videolar Kütüphanesi",
            "مجموعة مميزة من المحاضرات والدروس في علوم الشريعة والسيرة النبوية": "Şeriat bilimleri ve peygamber biyografisi konularında seçkin konferans ve ders koleksiyonu",
            "فيديوهات مختارة": "Seçilmiş Videolar",
            "كتب مختارة": "Seçilmiş Kitaplar",
            "مكتبة الكتب الإسلامية": "İslami Kitap Kütüphanesi",
            "مكتبة التطبيقات الإسلامية": "İslami Uygulama Kütüphanesi",
            "مكتبة المواقع الإسلامية": "İslami Web Siteleri Kütüphanesi",
            "جميع الحقوق محفوظة": "Tüm Hakları Saklıdır",
            "منافع - منصة تعليمية إسلامية": "Manafea - İslami Eğitim Platformu",
            "خطأ!": "Hata!",
            "الرئيسية": "Ana Sayfa",
            "الفيديوهات": "Videolar",
            "الكتب": "Kitaplar",
            "عن_المنافع": "Manafea Hakkında",
            "اتصل_بنا": "Bize Ulaşın",
            "تسجيل_الدخول": "Giriş Yap",
            "تسجيل_الخروج": "Çıkış Yap",
            "لوحة_التحكم": "Kontrol Paneli",
            "شاركنا_رأيك": "Görüşünüzü Paylaşın",
            "اكتب_تعليقك": "Yorumunuzu buraya yazın...",
            "إرسال_التقييم": "Değerlendirme Gönder",
            "نجاح": "Başarılı!",
            "نجاح_التقييم": "Görüşleriniz başarıyla gönderildi, teşekkür ederiz!",
            "إغلاق": "Kapat",
            "خطأ": "Hata!",
            "إضافة_فيديو_جديد": "Yeni Video Ekle",
            "عنوان_الفيديو": "Video Başlığı",
            "أدخل_عنوان_الفيديو": "Video başlığını girin",
            "نوع_الفيديو": "Video Türü",
            "يوتيوب": "YouTube",
            "رفع_من_الجهاز": "Cihazdan Yükle",
            "رابط_الفيديو": "Video Bağlantısı",
            "أدخل_رابط_يوتيوب": "YouTube video bağlantısını girin",
            "ملف_الفيديو": "Video Dosyası",
            "إضافة": "Ekle",
            "إلغاء": "İptal",
            "تعديل_النص": "Metni Düzenle",
            "حفظ": "Kaydet",
            "النص": "Metin",
            "عرض_المزيد": "Daha Fazla Görüntüle",
            "الرجاء_تسجيل_الدخول": "Lütfen önce yönetici olarak giriş yapın",
            "أدخل_العنوان": "Lütfen video başlığını girin",
            "أدخل_الرابط": "Lütfen video bağlantısını girin",
            "اختر_الملف": "Lütfen video dosyasını seçin",
            "خطأ_الإضافة": "Video eklenirken bir hata oluştu",
            "يرجى اختيار عدد النجوم وكتابة تعليق قبل الإرسال": "Lütfen göndermeden önce yıldız sayısını seçin ve bir yorum yazın",
            "جميع الكتب": "Tüm Kitaplar",
            "مجموعة مميزة من الكتب في علوم الشريعة والسيرة النبوية": "Şeriat bilimleri ve peygamber biyografisi konularında seçkin bir kitap koleksiyonu",
            "بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ": "Rahman ve Rahim olan Allah'ın adıyla",
            "🌙 شهر رمضان مبارك 🌙": "🌙 Mübarek Ramazan Ayı 🌙",
            "لم يتم تلقي أي رد من الخادم. يُرجى التحقق من اتصالك بالإنترنت.": "Sunucudan herhangi bir yanıt alınamadı. Lütfen internet bağlantınızı kontrol edin.",
            "مجموعة مميزة من التطبيقات الإسلامية المفيدة": "Faydalı İslami uygulamaların seçkin bir koleksiyonu",
            "﴿ شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ ۚ فَمَن شَهِدَ مِنكُمُ الشَّهْرَ فَلْيَصُمْهُ ۖ وَمَن كَانَ مَرِيضًا أَوْ عَلَىٰ سَفَرٍ فَعِدَّةٌ مِّنْ أَيَّامٍ أُخَرَ ۗ يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ وَلِتُكْمِلُوا الْعِدَّةَ وَلِتُكَبِّرُوا اللَّهَ عَلَىٰ مَا هَدَاكُمْ وَلَعَلَّكُمْ تَشْكُرُونَ ﴾": "Ramazan ayı, insanlara yol gösterici, doğrunun ve doğruyu eğriden ayırmanın açık delilleri olarak Kur'an'ın indirildiği aydır...",
            "مجموعة مميزة من المواقع الإسلامية المفيدة": "Faydalı İslami web sitelerinin seçkin bir koleksiyonu"          
        }
      },
      id: {
        translation: {
          "العربية": "Türkçe",
            "الرئيسية": "Ana Sayfa",
            "الفيديوهات": "Videolar",
            "القرآن الكريم": "Kur'an",
            "العودة": "Kembali",
            "الملفات التفاعلية": "Etkileşimli Dosyalar",
            "تطبيقات إسلامية": "İslami Uygulamalar",
            "مواقع إسلامية أخرى": "Diğer İslami Siteler",
            "منافع للعلوم الإسلامية": "İslami İlimler İçin Manafea",
            "مسابقة منافع": "Manafea Yarışması",
            "المسابقة الرمضانية": "Ramazan Yarışması",
            "السؤال:": "Soru:",
            "الإجابة": "Cevap",
            "الاسم": "Ad",
            "رقم الهاتف": "Telefon Numarası",
            "البلد": "Ülke",
            "البريد الإلكتروني (اختياري)": "E-posta (isteğe bağlı)",
            "رحلة الحج": "Hac Yolculuğu",
            "منصة تعليمية إسلامية متكاملة تقدم دروساً ومحاضرات في العلوم الشرعية والتربوية بأسلوب عصري مُيسّر": "Şeriat ve eğitim bilimlerinde modern ve basitleştirilmiş bir tarzda dersler ve konferanslar sunan entegre bir İslami eğitim platformu",
            "أحدث الدروس": "En Son Dersler",
            "عرض المزيد من الدروس": "Daha Fazla Ders Görüntüle",
            "شاركنا رأيك": "Görüşünüzü Paylaşın",
            "اكتب تعليقك هنا...": "Yorumunuzu buraya yazın...",
            "تم بنجاح!": "Başarılı!",
            "تم إرسال تقييمك بنجاح، شكراً لك!": "Görüşleriniz başarıyla gönderildi, teşekkür ederiz!",
            "إغلاق": "Kapat",
            "إرسال التقييم": "Değerlendirme Gönder",
            "جميع الفيديوهات": "Tüm Videolar",
            "العقيدة": "Akide (İnanç)",
            "الفقه": "Fıkıh (Hukuk)",
            "تفسير القرآن": "Kur'an Yorumu",
            "السيرة النبوية": "Peygamber Biyografisi",
            "الحديث": "Hadis",
            "الأخلاق": "Ahlak",
            "العلوم التربوية": "Eğitim Bilimleri",
            "مكتبة الفيديوهات الإسلامية": "İslami Videolar Kütüphanesi",
            "مجموعة مميزة من المحاضرات والدروس في علوم الشريعة والسيرة النبوية": "Şeriat bilimleri ve peygamber biyografisi konularında seçkin konferans ve ders koleksiyonu",
            "فيديوهات مختارة": "Seçilmiş Videolar",
            "كتب مختارة": "Seçilmiş Kitaplar",
            "مكتبة الكتب الإسلامية": "İslami Kitap Kütüphanesi",
            "مكتبة التطبيقات الإسلامية": "İslami Uygulama Kütüphanesi",
            "مكتبة المواقع الإسلامية": "İslami Web Siteleri Kütüphanesi",
            "جميع الحقوق محفوظة": "Tüm Hakları Saklıdır",
            "منافع - منصة تعليمية إسلامية": "Manafea - İslami Eğitim Platformu",
            "خطأ!": "Hata!",
            "الرئيسية": "Ana Sayfa",
            "الفيديوهات": "Videolar",
            "الكتب": "Kitaplar",
            "عن_المنافع": "Manafea Hakkında",
            "اتصل_بنا": "Bize Ulaşın",
            "تسجيل_الدخول": "Giriş Yap",
            "تسجيل_الخروج": "Çıkış Yap",
            "لوحة_التحكم": "Kontrol Paneli",
            "شاركنا_رأيك": "Görüşünüzü Paylaşın",
            "اكتب_تعليقك": "Yorumunuzu buraya yazın...",
            "إرسال_التقييم": "Değerlendirme Gönder",
            "نجاح": "Başarılı!",
            "نجاح_التقييم": "Görüşleriniz başarıyla gönderildi, teşekkür ederiz!",
            "إغلاق": "Kapat",
            "خطأ": "Hata!",
            "إضافة_فيديو_جديد": "Yeni Video Ekle",
            "عنوان_الفيديو": "Video Başlığı",
            "أدخل_عنوان_الفيديو": "Video başlığını girin",
            "نوع_الفيديو": "Video Türü",
            "يوتيوب": "YouTube",
            "رفع_من_الجهاز": "Cihazdan Yükle",
            "رابط_الفيديو": "Video Bağlantısı",
            "أدخل_رابط_يوتيوب": "YouTube video bağlantısını girin",
            "ملف_الفيديو": "Video Dosyası",
            "إضافة": "Ekle",
            "إلغاء": "İptal",
            "تعديل_النص": "Metni Düzenle",
            "حفظ": "Kaydet",
            "النص": "Metin",
            "عرض_المزيد": "Daha Fazla Görüntüle",
            "الرجاء_تسجيل_الدخول": "Lütfen önce yönetici olarak giriş yapın",
            "أدخل_العنوان": "Lütfen video başlığını girin",
            "أدخل_الرابط": "Lütfen video bağlantısını girin",
            "اختر_الملف": "Lütfen video dosyasını seçin",
            "خطأ_الإضافة": "Video eklenirken bir hata oluştu",
            "يرجى اختيار عدد النجوم وكتابة تعليق قبل الإرسال": "Lütfen göndermeden önce yıldız sayısını seçin ve bir yorum yazın",
            "جميع الكتب": "Tüm Kitaplar",
            "مجموعة مميزة من الكتب في علوم الشريعة والسيرة النبوية": "Şeriat bilimleri ve peygamber biyografisi konularında seçkin bir kitap koleksiyonu",
            "بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ": "Rahman ve Rahim olan Allah'ın adıyla",
            "🌙 شهر رمضان مبارك 🌙": "🌙 Mübarek Ramazan Ayı 🌙",
            "لم يتم تلقي أي رد من الخادم. يُرجى التحقق من اتصالك بالإنترنت.": "Sunucudan herhangi bir yanıt alınamadı. Lütfen internet bağlantınızı kontrol edin.",
            "مجموعة مميزة من التطبيقات الإسلامية المفيدة": "Faydalı İslami uygulamaların seçkin bir koleksiyonu",
            "﴿ شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ ۚ فَمَن شَهِدَ مِنكُمُ الشَّهْرَ فَلْيَصُمْهُ ۖ وَمَن كَانَ مَرِيضًا أَوْ عَلَىٰ سَفَرٍ فَعِدَّةٌ مِّنْ أَيَّامٍ أُخَرَ ۗ يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ وَلِتُكْمِلُوا الْعِدَّةَ وَلِتُكَبِّرُوا اللَّهَ عَلَىٰ مَا هَدَاكُمْ وَلَعَلَّكُمْ تَشْكُرُونَ ﴾": "Ramazan ayı, insanlara yol gösterici, doğrunun ve doğruyu eğriden ayırmanın açık delilleri olarak Kur'an'ın indirildiği aydır...",
            "مجموعة مميزة من المواقع الإسلامية المفيدة": "Faydalı İslami web sitelerinin seçkin bir koleksiyonu"          
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
