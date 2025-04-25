import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ar: {
    translation: {
      // القائمة الرئيسية
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
      'خطأ_الإضافة': 'حدث خطأ أثناء إضافة الفيديو'
    }
  },
  en: {
    translation: {
      // القائمة الرئيسية
      'الرئيسية': 'Home',
      'الفيديوهات': 'Videos',
      'الكتب': 'Books',
      'عن_المنافع': 'About',
      'اتصل_بنا': 'Contact',
      'تسجيل_الدخول': 'Login',
      'تسجيل_الخروج': 'Logout',
      'لوحة_التحكم': 'Admin Panel',

      // الصفحة الرئيسية
      'شاركنا_رأيك': 'Share Your Opinion',
      'اكتب_تعليقك': 'Write your comment here...',
      'إرسال_التقييم': 'Send Rating',
      'نجاح': 'Success!',
      'نجاح_التقييم': 'Your rating has been sent successfully, thank you!',
      'إغلاق': 'Close',
      'خطأ': 'Error!',
      'إضافة_فيديو_جديد': 'Add New Video',
      'عنوان_الفيديو': 'Video Title',
      'أدخل_عنوان_الفيديو': 'Enter video title',
      'نوع_الفيديو': 'Video Type',
      'يوتيوب': 'YouTube',
      'رفع_من_الجهاز': 'Upload from Device',
      'رابط_الفيديو': 'Video Link',
      'أدخل_رابط_يوتيوب': 'Enter YouTube video link',
      'ملف_الفيديو': 'Video File',
      'إضافة': 'Add',
      'إلغاء': 'Cancel',
      'تعديل_النص': 'Edit Text',
      'حفظ': 'Save',
      'النص': 'Text',
      'عرض_المزيد': 'Show More',

      // رسائل الخطأ
      'الرجاء_تسجيل_الدخول': 'Please login as admin first',
      'أدخل_العنوان': 'Please enter video title',
      'أدخل_الرابط': 'Please enter video link',
      'اختر_الملف': 'Please select a video file',
      'خطأ_الإضافة': 'Error occurred while adding video'
    }
  },
  fr: {
    translation: {
      // القائمة الرئيسية
      'الرئيسية': 'Accueil',
      'الفيديوهات': 'Vidéos',
      'الكتب': 'Livres',
      'عن_المنافع': 'À propos',
      'اتصل_بنا': 'Contact',
      'تسجيل_الدخول': 'Connexion',
      'تسجيل_الخروج': 'Déconnexion',
      'لوحة_التحكم': 'Panneau Admin',

      // الصفحة الرئيسية
      'شاركنا_رأيك': 'Partagez Votre Avis',
      'اكتب_تعليقك': 'Écrivez votre commentaire ici...',
      'إرسال_التقييم': 'Envoyer l\'évaluation',
      'نجاح': 'Succès !',
      'نجاح_التقييم': 'Votre évaluation a été envoyée avec succès, merci !',
      'إغلاق': 'Fermer',
      'خطأ': 'Erreur !',
      'إضافة_فيديو_جديد': 'Ajouter une Nouvelle Vidéo',
      'عنوان_الفيديو': 'Titre de la Vidéo',
      'أدخل_عنوان_الفيديو': 'Entrez le titre de la vidéo',
      'نوع_الفيديو': 'Type de Vidéo',
      'يوتيوب': 'YouTube',
      'رفع_من_الجهاز': 'Télécharger depuis l\'appareil',
      'رابط_الفيديو': 'Lien de la Vidéo',
      'أدخل_رابط_يوتيوب': 'Entrez le lien de la vidéo YouTube',
      'ملف_الفيديو': 'Fichier Vidéo',
      'إضافة': 'Ajouter',
      'إلغاء': 'Annuler',
      'تعديل_النص': 'Modifier le Texte',
      'حفظ': 'Enregistrer',
      'النص': 'Texte',
      'عرض_المزيد': 'Voir Plus',

      // رسائل الخطأ
      'الرجاء_تسجيل_الدخول': 'Veuillez vous connecter en tant qu\'administrateur',
      'أدخل_العنوان': 'Veuillez entrer le titre de la vidéo',
      'أدخل_الرابط': 'Veuillez entrer le lien de la vidéo',
      'اختر_الملف': 'Veuillez sélectionner un fichier vidéo',
      'خطأ_الإضافة': 'Une erreur est survenue lors de l\'ajout de la vidéo'
    }
  },
  tr: {
    translation: {
      // Header
      'home': 'Ana Sayfa',
      'videos': 'Videolar',
      'books': 'Kitaplar',
      'about': 'Hakkında',
      'contact': 'İletişim',
      'login': 'Giriş',
      'logout': 'Çıkış',
      'admin': 'Yönetici Paneli',

      // Home Page
      'shareOpinion': 'Görüşünüzü Paylaşın',
      'writeComment': 'Yorumunuzu buraya yazın...',
      'sendRating': 'Değerlendirme Gönder',
      'success': 'Başarılı!',
      'ratingSuccess': 'Değerlendirmeniz başarıyla gönderildi, teşekkürler!',
      'close': 'Kapat',
      'error': 'Hata!',
      'addNewVideo': 'Yeni Video Ekle',
      'videoTitle': 'Video Başlığı',
      'enterVideoTitle': 'Video başlığını girin',
      'videoType': 'Video Türü',
      'youtube': 'YouTube',
      'uploadFromDevice': 'Cihazdan Yükle',
      'videoLink': 'Video Bağlantısı',
      'enterYoutubeLink': 'YouTube video bağlantısını girin',
      'videoFile': 'Video Dosyası',
      'add': 'Ekle',
      'cancel': 'İptal',
      'edit': 'Metni Düzenle',
      'save': 'Kaydet',
      'text': 'Metin',
      'showMore': 'Daha Fazla',

      // Error Messages
      'pleaseLogin': 'Lütfen önce yönetici olarak giriş yapın',
      'enterTitle': 'Lütfen video başlığını girin',
      'enterLink': 'Lütfen video bağlantısını girin',
      'selectFile': 'Lütfen bir video dosyası seçin',
      'addError': 'Video eklenirken bir hata oluştu'
    }
  },
  id: {
    translation: {
      // Header
      'home': 'Beranda',
      'videos': 'Video',
      'books': 'Buku',
      'about': 'Tentang',
      'contact': 'Kontak',
      'login': 'Masuk',
      'logout': 'Keluar',
      'admin': 'Panel Admin',

      // Home Page
      'shareOpinion': 'Bagikan Pendapat Anda',
      'writeComment': 'Tulis komentar Anda di sini...',
      'sendRating': 'Kirim Penilaian',
      'success': 'Berhasil!',
      'ratingSuccess': 'Penilaian Anda telah berhasil dikirim, terima kasih!',
      'close': 'Tutup',
      'error': 'Kesalahan!',
      'addNewVideo': 'Tambah Video Baru',
      'videoTitle': 'Judul Video',
      'enterVideoTitle': 'Masukkan judul video',
      'videoType': 'Jenis Video',
      'youtube': 'YouTube',
      'uploadFromDevice': 'Unggah dari Perangkat',
      'videoLink': 'Tautan Video',
      'enterYoutubeLink': 'Masukkan tautan video YouTube',
      'videoFile': 'File Video',
      'add': 'Tambah',
      'cancel': 'Batal',
      'edit': 'Edit Teks',
      'save': 'Simpan',
      'text': 'Teks',
      'showMore': 'Tampilkan Lebih Banyak',

      // Error Messages
      'pleaseLogin': 'Silakan masuk sebagai admin terlebih dahulu',
      'enterTitle': 'Silakan masukkan judul video',
      'enterLink': 'Silakan masukkan tautan video',
      'selectFile': 'Silakan pilih file video',
      'addError': 'Terjadi kesalahan saat menambahkan video'
    }
  },
  ru: {
    translation: {
      // Header
      'home': 'Главная',
      'videos': 'Видео',
      'books': 'Книги',
      'about': 'О нас',
      'contact': 'Контакты',
      'login': 'Вход',
      'logout': 'Выход',
      'admin': 'Панель администратора',

      // Home Page
      'shareOpinion': 'Поделитесь Своим Мнением',
      'writeComment': 'Напишите свой комментарий здесь...',
      'sendRating': 'Отправить Оценку',
      'success': 'Успешно!',
      'ratingSuccess': 'Ваша оценка успешно отправлена, спасибо!',
      'close': 'Закрыть',
      'error': 'Ошибка!',
      'addNewVideo': 'Добавить Новое Видео',
      'videoTitle': 'Название Видео',
      'enterVideoTitle': 'Введите название видео',
      'videoType': 'Тип Видео',
      'youtube': 'YouTube',
      'uploadFromDevice': 'Загрузить с Устройства',
      'videoLink': 'Ссылка на Видео',
      'enterYoutubeLink': 'Введите ссылку на видео YouTube',
      'videoFile': 'Видеофайл',
      'add': 'Добавить',
      'cancel': 'Отмена',
      'edit': 'Редактировать Текст',
      'save': 'Сохранить',
      'text': 'Текст',
      'showMore': 'Показать Больше',

      // Error Messages
      'pleaseLogin': 'Пожалуйста, войдите как администратор',
      'enterTitle': 'Пожалуйста, введите название видео',
      'enterLink': 'Пожалуйста, введите ссылку на видео',
      'selectFile': 'Пожалуйста, выберите видеофайл',
      'addError': 'Произошла ошибка при добавлении видео'
    }
  },
  hi: {
    translation: {
      // Header
      'home': 'मुख्य पृष्ठ',
      'videos': 'वीडियो',
      'books': 'किताबें',
      'about': 'हमारे बारे में',
      'contact': 'संपर्क करें',
      'login': 'लॉग इन',
      'logout': 'लॉग आउट',
      'admin': 'एडमिन पैनल',

      // Home Page
      'shareOpinion': 'अपनी राय साझा करें',
      'writeComment': 'अपनी टिप्पणी यहाँ लिखें...',
      'sendRating': 'रेटिंग भेजें',
      'success': 'सफल!',
      'ratingSuccess': 'आपकी रेटिंग सफलतापूर्वक भेजी गई, धन्यवाद!',
      'close': 'बंद करें',
      'error': 'त्रुटि!',
      'addNewVideo': 'नया वीडियो जोड़ें',
      'videoTitle': 'वीडियो का शीर्षक',
      'enterVideoTitle': 'वीडियो का शीर्षक दर्ज करें',
      'videoType': 'वीडियो का प्रकार',
      'youtube': 'यूट्यूब',
      'uploadFromDevice': 'डिवाइस से अपलोड करें',
      'videoLink': 'वीडियो लिंक',
      'enterYoutubeLink': 'यूट्यूब वीडियो लिंक दर्ज करें',
      'videoFile': 'वीडियो फ़ाइल',
      'add': 'जोड़ें',
      'cancel': 'रद्द करें',
      'edit': 'टेक्स्ट संपादित करें',
      'save': 'सहेजें',
      'text': 'टेक्स्ट',
      'showMore': 'और दिखाएं',

      // Error Messages
      'pleaseLogin': 'कृपया पहले एडमिन के रूप में लॉग इन करें',
      'enterTitle': 'कृपया वीडियो का शीर्षक दर्ज करें',
      'enterLink': 'कृपया वीडियो का लिंक दर्ज करें',
      'selectFile': 'कृपया एक वीडियो फ़ाइल चुनें',
      'addError': 'वीडियो योग करने में त्रुटि हुई'
    }
  },
  ur: {
    translation: {
      // Header
      'home': 'صفحہ اول',
      'videos': 'ویڈیوز',
      'books': 'کتابیں',
      'about': 'ہمارے بارے میں',
      'contact': 'رابطہ کریں',
      'login': 'لاگ ان',
      'logout': 'لاگ آؤٹ',
      'admin': 'ایڈمن پینل',

      // Home Page
      'shareOpinion': 'اپنی رائے شیئر کریں',
      'writeComment': 'اپنا تبصرہ یہاں لکھیں...',
      'sendRating': 'درجہ بندی بھیجیں',
      'success': 'کامیاب!',
      'ratingSuccess': 'آپ کی درجہ بندی کامیابی سے بھیج دی گئی، شکریہ!',
      'close': 'بند کریں',
      'error': 'خرابی!',
      'addNewVideo': 'نئی ویڈیو شامل کریں',
      'videoTitle': 'ویڈیو کا عنوان',
      'enterVideoTitle': 'ویڈیو کا عنوان درج کریں',
      'videoType': 'ویڈیو کی قسم',
      'youtube': 'یوٹیوب',
      'uploadFromDevice': 'آلے سے اپ لوڈ کریں',
      'videoLink': 'ویڈیو کا لنک',
      'enterYoutubeLink': 'یوٹیوب ویڈیو کا لنک درج کریں',
      'videoFile': 'ویڈیو فائل',
      'add': 'شامل کریں',
      'cancel': 'منسوخ کریں',
      'edit': 'متن میں ترمیم کریں',
      'save': 'محفوظ کریں',
      'text': 'متن',
      'showMore': 'مزید دکھائیں',

      // Error Messages
      'pleaseLogin': 'براہ کرم پہلے ایڈمن کے طور پر لاگ ان کریں',
      'enterTitle': 'براہ کرم ویڈیو کا عنوان درج کریں',
      'enterLink': 'براہ کرم ویڈیو کا لنک درج کریں',
      'selectFile': 'براہ کرم ویڈیو فائل منتخب کریں',
      'addError': 'ویڈیو شامل کرنے میں خرابی پیش آگئی'
    }
  },
  bn: {
    translation: {
      // Header
      'home': 'হোম',
      'videos': 'ভিডিও',
      'books': 'বই',
      'about': 'আমাদের সম্পর্কে',
      'contact': 'যোগাযোগ',
      'login': 'লগইন',
      'logout': 'লগআউট',
      'admin': 'অ্যাডমিন প্যানেল',

      // Home Page
      'shareOpinion': 'আপনার মতামত শেয়ার করুন',
      'writeComment': 'আপনার মন্তব্য এখানে লিখুন...',
      'sendRating': 'রেটিং পাঠান',
      'success': 'সফল!',
      'ratingSuccess': 'আপনার রেটিং সফলভাবে পাঠানো হয়েছে, ধন্যবাদ!',
      'close': 'বন্ধ করুন',
      'error': 'ত্রুটি!',
      'addNewVideo': 'নতুন ভিডিও যোগ করুন',
      'videoTitle': 'ভিডিও শিরোনাম',
      'enterVideoTitle': 'ভিডিও শিরোনাম লিখুন',
      'videoType': 'ভিডিও ধরন',
      'youtube': 'ইউটিউব',
      'uploadFromDevice': 'ডিভাইস থেকে আপলোড করুন',
      'videoLink': 'ভিডিও লিঙ্ক',
      'enterYoutubeLink': 'ইউটিউব ভিডিও লিঙ্ক লিখুন',
      'videoFile': 'ভিডিও ফাইল',
      'add': 'যোগ করুন',
      'cancel': 'বাতিল করুন',
      'edit': 'টেক্সট সম্পাদনা করুন',
      'save': 'সংরক্ষণ করুন',
      'text': 'টেক্সট',
      'showMore': 'আরও দেখুন',

      // Error Messages
      'pleaseLogin': 'অনুগ্রহ করে প্রথমে অ্যাডমিন হিসাবে লগইন করুন',
      'enterTitle': 'অনুগ্রহ করে ভিডিও শিরোনাম লিখুন',
      'enterLink': 'অনুগ্রহ করে ভিডিও লিঙ্ক লিখুন',
      'selectFile': 'অনুগ্রহ করে একটি ভিডিও ফাইল নির্বাচন করুন',
      'addError': 'ভিডিও যোগ করার সময় ত্রুটি হয়েছে'
    }
  },
  zh: {
    translation: {
      // Header
      'home': '首页',
      'videos': '视频',
      'books': '书籍',
      'about': '关于我们',
      'contact': '联系我们',
      'login': '登录',
      'logout': '退出',
      'admin': '管理面板',

      // Home Page
      'shareOpinion': '分享您的观点',
      'writeComment': '在此写下您的评论...',
      'sendRating': '发送评分',
      'success': '成功！',
      'ratingSuccess': '您的评分已成功发送，谢谢！',
      'close': '关闭',
      'error': '错误！',
      'addNewVideo': '添加新视频',
      'videoTitle': '视频标题',
      'enterVideoTitle': '输入视频标题',
      'videoType': '视频类型',
      'youtube': 'YouTube',
      'uploadFromDevice': '从设备上传',
      'videoLink': '视频链接',
      'enterYoutubeLink': '输入YouTube视频链接',
      'videoFile': '视频文件',
      'add': '添加',
      'cancel': '取消',
      'edit': '编辑文本',
      'save': '保存',
      'text': '文本',
      'showMore': '显示更多',

      // Error Messages
      'pleaseLogin': '请先以管理员身份登录',
      'enterTitle': '请输入视频标题',
      'enterLink': '请输入视频链接',
      'selectFile': '请选择视频文件',
      'addError': '添加视频时发生错误'
    }
  },
  tl: {
    translation: {
      // Header
      'home': 'Home',
      'videos': 'Mga Video',
      'books': 'Mga Libro',
      'about': 'Tungkol Sa',
      'contact': 'Makipag-ugnayan',
      'login': 'Mag-login',
      'logout': 'Mag-logout',
      'admin': 'Admin Panel',

      // Home Page
      'shareOpinion': 'Ibahagi ang Iyong Opinyon',
      'writeComment': 'Isulat ang iyong komento dito...',
      'sendRating': 'Ipadala ang Rating',
      'success': 'Tagumpay!',
      'ratingSuccess': 'Matagumpay na naipadala ang iyong rating, salamat!',
      'close': 'Isara',
      'error': 'Error!',
      'addNewVideo': 'Magdagdag ng Bagong Video',
      'videoTitle': 'Pamagat ng Video',
      'enterVideoTitle': 'Ilagay ang pamagat ng video',
      'videoType': 'Uri ng Video',
      'youtube': 'YouTube',
      'uploadFromDevice': 'I-upload mula sa Device',
      'videoLink': 'Link ng Video',
      'enterYoutubeLink': 'Ilagay ang link ng YouTube video',
      'videoFile': 'Video File',
      'add': 'Idagdag',
      'cancel': 'Kanselahin',
      'edit': 'I-edit ang Teksto',
      'save': 'I-save',
      'text': 'Teksto',
      'showMore': 'Ipakita pa',

      // Error Messages
      'pleaseLogin': 'Mangyaring mag-login muna bilang admin',
      'enterTitle': 'Mangyaring ilagay ang pamagat ng video',
      'enterLink': 'Mangyaring ilagay ang link ng video',
      'selectFile': 'Mangyaring pumili ng video file',
      'addError': 'May error sa pagdagdag ng video'
    }
  },
  fa: {
    translation: {
      // Header
      'home': 'صفحه اصلی',
      'videos': 'ویدیوها',
      'books': 'کتاب‌ها',
      'about': 'درباره ما',
      'contact': 'تماس با ما',
      'login': 'ورود',
      'logout': 'خروج',
      'admin': 'پنل مدیریت',

      // Home Page
      'shareOpinion': 'نظر خود را به اشتراک بگذارید',
      'writeComment': 'نظر خود را اینجا بنویسید...',
      'sendRating': 'ارسال امتیاز',
      'success': 'موفق!',
      'ratingSuccess': 'امتیاز شما با موفقیت ارسال شد، متشکریم!',
      'close': 'بستن',
      'error': 'خطا!',
      'addNewVideo': 'افزودن ویدیوی جدید',
      'videoTitle': 'عنوان ویدیو',
      'enterVideoTitle': 'عنوان ویدیو را وارد کنید',
      'videoType': 'نوع ویدیو',
      'youtube': 'یوتیوب',
      'uploadFromDevice': 'آپلود از دستگاه',
      'videoLink': 'لینک ویدیو',
      'enterYoutubeLink': 'لینک ویدیوی یوتیوب را وارد کنید',
      'videoFile': 'فایل ویدیو',
      'add': 'افزودن',
      'cancel': 'لغو',
      'edit': 'ویرایش متن',
      'save': 'ذخیره',
      'text': 'متن',
      'showMore': 'نمایش بیشتر',

      // Error Messages
      'pleaseLogin': 'لطفا ابتدا به عنوان مدیر وارد شوید',
      'enterTitle': 'لطفا عنوان ویدیو را وارد کنید',
      'enterLink': 'لطفا لینک ویدیو را وارد کنید',
      'selectFile': 'لطفا یک فایل ویدیو انتخاب کنید',
      'addError': 'خطا در افزودن ویدیو'
    }
  }
};

// سأكمل باقي اللغات في الرسائل التالية لتجنب تجاوز حد الرسالة

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 