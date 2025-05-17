import React, { useState, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faPenToSquare, faAnglesLeft, faAnglesRight, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './intractivefiles.css';
import Header from "./header";
import Footer from './footer';
import Louder from './louder'; // استيراد مكون Louder
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { showToast } from './Toast'; // استيراد دالة showToast

// دالة مساعدة لمعالجة أسماء الملفات
const sanitizeFileName = (fileName) => {
  let sanitized = fileName.replace(/\s+/g, '_');
  const containsNonLatinChars = /[^\x00-\x7F]/.test(sanitized);
  if (containsNonLatinChars) {
    const randomPart = Math.random().toString(36).substring(2, 10);
    const timestamp = Date.now().toString(36);
    const extension = fileName.split('.').pop();
    sanitized = `file_${timestamp}_${randomPart}.${extension}`;
  }
  return sanitized;
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-container">Something went wrong. Please try refreshing the page.</div>;
    }
    return this.props.children;
  }
}

function Intre() {
  const { t, i18n } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [books, setBooks] = useState([]);
  const [headerText, setHeaderText] = useState('');
  const [showHeaderModal, setShowHeaderModal] = useState(false);
  const [editingHeaderText, setEditingHeaderText] = useState('');
  const [showSubtitleModal, setShowSubtitleModal] = useState(false);
  const [subtitleText, setSubtitleText] = useState('');
  const [editingSubtitleText, setEditingSubtitleText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [uploadType, setUploadType] = useState(''); // 'file' or 'link'
  const [newBook, setNewBook] = useState({
    id: '',
    title: '',
    file: null,
    image: null
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const booksPerPage = 8; // Adjust this number as needed
  const navigate = useNavigate();

  // Initialize axios instance with default config
  const api = axios.create({
    baseURL: 'https://elmanafea.shop',
    timeout: 15000, // 15 seconds timeout
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Add response interceptor for error handling
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        setIsAdmin(false);
      }
      return Promise.reject(error);
    }
  );

  // Check admin status
  useEffect(() => {
    const checkAdmin = () => {
      try {
        const token = localStorage.getItem('adminToken');
        setIsAdmin(!!token);
      } catch (error) {
        setIsAdmin(false);
      }
    };
    
    checkAdmin();
    window.addEventListener('storage', checkAdmin);
    return () => window.removeEventListener('storage', checkAdmin);
  }, []);

  // Fetch header text
  useEffect(() => {
    let isMounted = true;

    const fetchHeaderData = () => {
      setIsLoading(true);
      api.get(`/bookheader?lang=${i18n.language}`)
        .then(response => {
          if (isMounted && response.data?.header) {
            setHeaderText(response.data.header);
          }
        })
        .catch(error => {
          if (isMounted) {
            showToast.error(t('فشل تحميل بيانات العنوان'));
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    };

    if (i18n.language) {
      fetchHeaderData();
    }

    return () => {
      isMounted = false;
    };
  }, [i18n.language]);

  // Add useEffect to fetch books
  useEffect(() => {
    const fetchBooks = () => {
      axios.get(`https://elmanafea.shop/books?lang=${i18n.language}`)
        .then(response => {
          if (response.data && Array.isArray(response.data.books)) {
            const formattedBooks = response.data.books.map(book => {
              let imageUrl = book.imageUrl;
              if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = `https://elmanafea.shop${imageUrl}`;
              }
              return {
                id: book._id || Date.now(),
                title: book.title,
                link: book.fileUrl,
                image: imageUrl
              };
            });
            setBooks(formattedBooks);
          }
        })
        .catch(error => {
          showToast.error(t('فشل تحميل الكتب'));
        });
    };

    fetchBooks();
  }, [i18n.language]);

  // Save books to localStorage
  useEffect(() => {
    if (!i18n.language || !books) return;

    try {
      localStorage.setItem(`books_${i18n.language}`, JSON.stringify(books));
    } catch (error) {
    }
  }, [books, i18n.language]);

  const handleUpdateHeader = () => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      showToast.error('Admin authentication required');
      return;
    }

    api.post(
      '/admin/bookheader',
      {
        header: editingHeaderText,
        lang: i18n.language
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    )
    .then(response => {
      if (response.status === 200) {
        setHeaderText(editingHeaderText);
        setShowHeaderModal(false);
        showToast.success(t('تم تحديث العنوان بنجاح'));
      }
    })
    .catch(error => {
      showToast.error(error.response?.data?.message || t('فشل تحديث العنوان'));
    });
  };

  // Pagination logic
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(books.length / booksPerPage); i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEdit = (book) => {
    setEditingBook(book);
    setShowEditModal(true);
  };

  const handleDelete = (bookId) => {
    setBookToDelete(bookId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!bookToDelete) return;
    
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      showToast.error('Admin authentication required');
      return;
    }

    axios.delete(`https://elmanafea.shop/admin/deletebook/${bookToDelete}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    })
    .then(() => {
      return axios.get(`https://elmanafea.shop/books?lang=${i18n.language}`);
    })
    .then(response => {
      if (response.data && Array.isArray(response.data.books)) {
        const formattedBooks = response.data.books.map(book => {
          let imageUrl = book.imageUrl;
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `https://elmanafea.shop${imageUrl}`;
          }
          return {
            id: book._id || Date.now(),
            title: book.title,
            link: book.fileUrl,
            image: imageUrl
          };
        });
        setBooks(formattedBooks);
        showToast.deleted(t('تم حذف الكتاب بنجاح'));
      }
    })
    .catch(error => {
      showToast.error(t('حدث خطأ أثناء حذف الكتاب'));
    })
    .finally(() => {
      setShowDeleteConfirm(false);
      setBookToDelete(null);
    });
  };

  const handleUpdate = () => {
    if (!editingBook) return;

    const formData = new FormData();
    formData.append('bookId', editingBook.id);
    formData.append('title', editingBook.title);
    formData.append('lang', i18n.language);
    
    if (editingBook.file) {
      const sanitizedFile = new File(
        [editingBook.file], 
        sanitizeFileName(editingBook.file.name), 
        { type: editingBook.file.type }
      );
      formData.append('file', sanitizedFile);
      formData.append('type', 'file');
    } else if (editingBook.link) {
      formData.append('file', editingBook.link);
      formData.append('type', 'text');
    }

    if (editingBook.newImage) {
      const sanitizedImage = handleImageUpload(editingBook.newImage);
      if (sanitizedImage) {
        formData.append('image', sanitizedImage);
      }
    }

    axios({
      method: 'put',
      url: `https://elmanafea.shop/admin/updatebook/${editingBook.id}`,
      data: {
        title: editingBook.title,
        bookId: editingBook.id,
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.status === 200 || response.status === 201) {
        return axios.get(`https://elmanafea.shop/books?lang=${i18n.language}`);
      }
      throw new Error(response.data?.message || 'Failed to update book');
    })
    .then(getBooksResponse => {
      if (getBooksResponse.data && Array.isArray(getBooksResponse.data.books)) {
        const formattedBooks = getBooksResponse.data.books.map(book => {
          let imageUrl = book.imageUrl;
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `https://elmanafea.shop${imageUrl}`;
          }
          return {
            id: book._id || Date.now(),
            title: book.title,
            link: book.fileUrl,
            image: imageUrl
          };
        });
        setBooks(formattedBooks);
      }
      
      setShowEditModal(false);
      setEditingBook(null);
      showToast.edited(t('تم تحديث الكتاب بنجاح'));
    })
    .catch(error => {
      showToast.error(error.response?.data?.message || t('حدث خطأ في تحديث الكتاب'));
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showToast.error(t('يرجى اختيار ملف PDF فقط'));
        event.target.value = '';
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) {
        showToast.error(t('حجم الملف كبير جداً. الحد الأقصى هو 50 ميجابايت'));
        event.target.value = '';
        return;
      }

      const fileName = file.name;
      const sanitizedFileName = sanitizeFileName(fileName);
      const renamedFile = new File([file], sanitizedFileName, { type: file.type });

      setNewBook(prev => ({
        ...prev,
        file: renamedFile,
        originalFileName: fileName
      }));
    }
  };

  const handleImageUpload = (file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast.error('حجم الصورة كبير جداً. الحد الأقصى هو 5 ميجابايت');
        return null;
      }

      const fileName = file.name;
      const sanitizedFileName = sanitizeFileName(fileName);
      return new File([file], sanitizedFileName, { type: file.type });
    }
    return null;
  };

  const handleCloseModal = () => {
    if (newBook.link && newBook.link.startsWith('blob:')) {
      URL.revokeObjectURL(newBook.link);
    }
    setShowAddModal(false);
    setNewBook({ id: '', title: '', file: null });
    setUploadType('');
  };

  const handleAdd = () => {
    if (!newBook.title.trim()) {
      showToast.error(t('من فضلك أدخل عنوان الكتاب'));
      return;
    }
    
    if (!newBook.file) {
      showToast.error(t('من فضلك اختر ملف PDF'));
      return;
    }

    if (newBook.file.type !== 'application/pdf') {
      showToast.error(t('يرجى اختيار ملف PDF فقط'));
      return;
    }

    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      showToast.error(t('جلسة المسؤول منتهية. يرجى تسجيل الدخول مرة أخرى'));
      return;
    }

    const formData = new FormData();
    formData.append('file', newBook.file);
    formData.append('title', newBook.title.trim());
    formData.append('lang', i18n.language);
    formData.append('type', 'file');
    if (newBook.originalFileName) {
      formData.append('originalFileName', newBook.originalFileName);
    }

    if (newBook.image) {
      formData.append('image', newBook.image);
    }

    setUploadProgress(0);

    axios({
      method: 'post',
      url: 'https://elmanafea.shop/admin/uploadbook',
      data: formData,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      }
    })
    .then(response => {
      if (response.status === 201 || response.status === 200) {
        return axios.get(`https://elmanafea.shop/books?lang=${i18n.language}`);
      }
      throw new Error('Upload failed');
    })
    .then(getBooksResponse => {
      if (getBooksResponse.data && Array.isArray(getBooksResponse.data.books)) {
        const formattedBooks = getBooksResponse.data.books.map(book => {
          let imageUrl = book.imageUrl;
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `https://elmanafea.shop${imageUrl}`;
          }
          return {
            id: book._id || Date.now(),
            title: book.title,
            link: book.fileUrl,
            image: imageUrl
          };
        });
        setBooks(formattedBooks);
      }
      
      setShowAddModal(false);
      setNewBook({ title: '', file: null, image: null });
      setUploadProgress(0);
      showToast.added(t('تم إضافة الكتاب بنجاح'));
    })
    .catch(error => {
      let errorMessage = t('حدث خطأ أثناء رفع الكتاب');
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = t('جلسة المسؤول منتهية. يرجى تسجيل الدخول مرة أخرى');
          localStorage.removeItem('adminToken');
          setIsAdmin(false);
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      showToast.error(errorMessage);
      setUploadProgress(0);
    });
  };

  useEffect(() => {
    return () => {
      books.forEach(book => {
        if (book.link && book.link.startsWith('blob:')) {
          URL.revokeObjectURL(book.link);
        }
      });
    };
  }, []);

  // Add useEffect to fetch video header
  useEffect(() => {
    const fetchVideoHeader = () => {
      axios.get(`https://elmanafea.shop/booksecondheader?lang=${i18n.language}`)
        .then(response => {
          if (response.data && response.data.second_header) {
            setSubtitleText(response.data.second_header);
          }
        })
        .catch(error => {
          setSubtitleText('مجموعة مميزة من الكتب في علوم الشريعة والسيرة النبوية');
        });
    };

    fetchVideoHeader();
  }, [i18n.language]);

  const handleUpdateSubtitle = () => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      showToast.error(t('Admin authentication required'));
      return;
    }

    axios.post(
      'https://elmanafea.shop/admin/booksecondheader',
      {
        second_header: editingSubtitleText,
        lang: i18n.language
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    )
    .then(response => {
      if (response.status === 200 || response.status === 201) {
        return axios.get(`https://elmanafea.shop/booksecondheader?lang=${i18n.language}`);
      }
      throw new Error('Failed to update header');
    })
    .then(getResponse => {
      if (getResponse.data && getResponse.data.title) {
        setSubtitleText(getResponse.data.title);
      } else {
        setSubtitleText(editingSubtitleText);
      }
      setShowSubtitleModal(false);
      showToast.success(t('تم تحديث العنوان الفرعي بنجاح'));
    })
    .catch(error => {
      showToast.error(error.response?.data?.message || t('Failed to update header'));
    });
  };

  const handleBookClick = (book) => {
    if (!book.link) {
      showToast.error(t('رابط الكتاب غير متوفر'));
      return;
    }

    const absoluteLink = book.link.startsWith('http') ? book.link : `https://elmanafea.shop${book.link}`;
    const encodedLink = encodeURIComponent(absoluteLink.trim());
    const encodedTitle = encodeURIComponent(book.title.trim() || 'كتاب بدون عنوان');

    navigate(`/book-viewer/${encodedLink}/${encodedTitle}`);
  };

  if (isLoading) {
    return <div><Louder /></div>; // استخدام مكون Louder بدلاً من LoadingSpinner
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<Louder />}> {/* استخدام Louder في Suspense */}
        <Header />
        <div className="videos-header">
          <div className="header-container">
            <h1>{headerText || t('مكتبة الكتب الإسلامية')}</h1>
            {isAdmin && (
              <FontAwesomeIcon
                icon={faPenToSquare}
                className="edit-icon"
                onClick={() => {
                  setEditingHeaderText(headerText || t('مكتبة الكتب الإسلامية'));
                  setShowHeaderModal(true);
                }}
              />
            )}
          </div>

          {showHeaderModal && (
            <div className="modal">
              <div className="modal-content">
                <h3>تعديل العنوان الرئيسي</h3>
                <input
                  type="text"
                  value={editingHeaderText}
                  onChange={(e) => setEditingHeaderText(e.target.value)}
                  placeholder="أدخل العنوان الرئيسي"
                  className="modal-input"
                />
                <div className="modal-buttons">
                  <button onClick={handleUpdateHeader}>حفظ</button>
                  <button onClick={() => setShowHeaderModal(false)}>إلغاء</button>
                </div>
              </div>
            </div>
          )}
          
          <div className="subtitle-container">
            <p>{subtitleText}</p>
            {isAdmin && (
              <FontAwesomeIcon
                icon={faPenToSquare}
                className="edit-icon"
                onClick={() => {
                  setEditingSubtitleText(subtitleText);
                  setShowSubtitleModal(true);
                }}
              />
            )}
          </div>
        </div>

        {showSubtitleModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>تعديل العنوان الفرعي</h3>
              <input
                type="text"
                value={editingSubtitleText}
                onChange={(e) => setEditingSubtitleText(e.target.value)}
                placeholder="أدخل العنوان الفرعي"
                className="modal-input"
              />
              <div className="modal-buttons">
                <button onClick={handleUpdateSubtitle}>حفظ</button>
                <button onClick={() => setShowSubtitleModal(false)}>إلغاء</button>
              </div>
            </div>
          </div>
        )}
        
        <section className="videos-section">
          <div className="section-title">
            <div className="section-title-container">
              <h2>{t('كتب مختارة')}</h2>
            </div>
            {isAdmin && (
              <button className="add-btn" onClick={() => setShowAddModal(true)}>
                <FontAwesomeIcon icon={faPlus} /> {t('إضافة كتاب')}
              </button>
            )}
          </div>

          <div className="videos-grid">
            {currentBooks.map(book => (
              <div key={book.id} className="video-card pdf-card">
                <div onClick={() => handleBookClick(book)} style={{ cursor: 'pointer' }}>
                  <div className="video-thumbnail intre-thumbnail"
                    style={{
                      backgroundImage: `url(${book.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      objectFit: 'contain'
                    }}
                  >
                  </div>
                  <div className="video-info">
                    <h3 className="video-title">{book.title}</h3>
                    <p className="video-description">{book.description}</p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="admin-controls-bottom">
                    <button onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(book);
                    }}>
                      <FontAwesomeIcon 
                        icon={faEdit} 
                        style={{ 
                          color: '#2196F3',
                          fontSize: '18px',
                        }}
                      />
                    </button>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(book.id);
                    }}>
                      <FontAwesomeIcon 
                        icon={faTrash} 
                        style={{ 
                          color: '#f44336',
                          fontSize: '18px',
                        }}
                      />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {showDeleteConfirm && (
            <div className="modal confirm-modal">
              <div className="modal-content">
                <h3>{t('تأكيد الحذف')}</h3>
                <p>{t('هل أنت متأكد من حذف هذا الكتاب؟')}</p>
                <div className="modal-buttons">
                  <button 
                    onClick={confirmDelete} 
                    className="delete-btn"
                  >
                    {t('نعم، حذف')}
                  </button>
                  <button 
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setBookToDelete(null);
                    }} 
                    className="cancel-btn"
                  >
                    {t('إلغاء')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showEditModal && (
            <div className="modal">
              <div className="modal-content">
                <h3>{t('تعديل الكتاب')}</h3>
                <input
                  type="text"
                  value={editingBook.title}
                  onChange={e => setEditingBook({...editingBook, title: e.target.value})}
                  placeholder={t('عنوان الكتاب')}
                />
                <input
                  type="text"
                  value={editingBook.link}
                  onChange={e => setEditingBook({...editingBook, link: e.target.value})}
                  placeholder={t('رابط الكتاب')}
                />

                <div className="file-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const sanitizedImage = handleImageUpload(file);
                        if (sanitizedImage) {
                          setEditingBook({
                            ...editingBook, 
                            newImage: sanitizedImage,
                            originalImageName: file.name
                          });
                        }
                      }
                    }}
                    className="file-input"
                    id="edit-image-upload"
                  />
                  <label htmlFor="edit-image-upload" className="file-label">
                    تغيير صورة الغلاف
                  </label>
                  {editingBook.newImage && (
                    <span className="file-name">{editingBook.originalImageName || editingBook.newImage.name}</span>
                  )}
                </div>

                {editingBook.image && !editingBook.newImage && (
                  <div className="current-image-preview">
                    <p>الصورة الحالية:</p>
                    <img 
                      src={editingBook.image} 
                      alt="الصورة الحالية"
                      style={{ maxWidth: '100px', marginTop: '10px' }}
                    />
                  </div>
                )}

                <div className="modal-buttons">
                  <button onClick={handleUpdate}>{t('حفظ')}</button>
                  <button onClick={() => setShowEditModal(false)}>{t('إلغاء')}</button>
                </div>
              </div>
            </div>
          )}

          {showAddModal && (
            <div className="modal">
              <div className="modal-content">
                <h3>{t('إضافة كتاب جديد')}</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAdd();
                }}>
                  <input
                    type="text"
                    value={newBook.title}
                    onChange={e => setNewBook({...newBook, title: e.target.value})}
                    placeholder="عنوان الكتاب"
                    required
                  />

                  <div className="file-upload-container">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="file-input"
                      id="pdf-upload"
                      required
                    />
                    <label htmlFor="pdf-upload" className="file-label">
                      اختر ملف PDF
                    </label>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar"
                          style={{ width: `${uploadProgress}%` }}
                        />
                        <span className="progress-text">{Math.round(uploadProgress)}%</span>
                      </div>
                    )}
                    {newBook.file && <span className="file-name">{newBook.originalFileName || newBook.file.name}</span>}
                  </div>

                  <div className="file-upload-container">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const sanitizedImage = handleImageUpload(file);
                          if (sanitizedImage) {
                            setNewBook({
                              ...newBook, 
                              image: sanitizedImage,
                              originalImageName: file.name
                            });
                          }
                        }
                      }}
                      className="file-input"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="file-label">
                      اختر صورة الغلاف
                    </label>
                    {newBook.image && (
                      <div className="image-preview">
                        <span className="file-name">{newBook.originalImageName || newBook.image.name}</span>
                        <img 
                          src={URL.createObjectURL(newBook.image)} 
                          alt="معاينة الصورة"
                          style={{ 
                            maxWidth: '100px', 
                            marginTop: '10px',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="modal-buttons">
                    <button 
                      type="submit"
                      disabled={!newBook.title || !newBook.file}
                    >
                      إضافة
                    </button>
                    <button type="button" onClick={() => {
                      setShowAddModal(false);
                      setNewBook({ title: '', file: null, image: null });
                      setUploadProgress(0);
                    }}>إلغاء</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="pagination">
            <ul>
              {pageNumbers.length > 4 && currentPage > 1 && (
                <li><a onClick={() => paginate(1)}>
                  <FontAwesomeIcon icon={i18n.dir() === 'ltr' ? faAnglesLeft : faAnglesRight} />
                </a></li>
              )}
              {pageNumbers.length > 4 && currentPage > 1 && (
                <li><a onClick={() => paginate(currentPage - 1)}>
                  <FontAwesomeIcon icon={i18n.dir() === 'ltr' ? faChevronLeft : faChevronRight} />
                </a></li>
              )}
              {(() => {
                let startPage, endPage;
                
                if (pageNumbers.length <= 4) {
                    startPage = 0;
                    endPage = pageNumbers.length;
                } else if (currentPage <= 2) {
                    startPage = 0;
                    endPage = 4;
                } else if (currentPage >= pageNumbers.length - 1) {
                    startPage = pageNumbers.length - 4;
                    endPage = pageNumbers.length;
                } else {
                    startPage = currentPage - 2;
                    endPage = currentPage + 2;
                }
                
                return pageNumbers.slice(startPage, endPage).map(number => (
                    <li key={number}>
                        <a onClick={() => paginate(number)} className={currentPage === number ? 'active' : ''}>
                            {number}
                        </a>
                    </li>
                ));
              })()}
              {pageNumbers.length > 4 && currentPage < pageNumbers.length && (
                <li><a onClick={() => paginate(currentPage + 1)}>
                  <FontAwesomeIcon icon={i18n.dir() === 'ltr' ? faChevronRight : faChevronLeft} />
                </a></li>
              )}
              {pageNumbers.length > 4 && currentPage < pageNumbers.length && (
                <li><a onClick={() => paginate(pageNumbers.length)}>
                  <FontAwesomeIcon icon={i18n.dir() === 'ltr' ? faAnglesRight : faAnglesLeft} />
                </a></li>
              )}
            </ul>
          </div>
        </section>
        <Footer/>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function IntreWrapper() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Louder />}> {/* استخدام Louder في IntreWrapper أيضاً */}
        <Intre />
      </Suspense>
    </ErrorBoundary>
  );
}
