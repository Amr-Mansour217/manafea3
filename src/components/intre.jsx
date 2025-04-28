import React, { useState, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import './intractivefiles.css';
import Header from "./header";
import Footer from './footer';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-container">Something went wrong. Please try refreshing the page.</div>;
    }
    return this.props.children;
  }
}

// Loading component
const LoadingSpinner = () => (
  <div className="loading-spinner">Loading...</div>
);

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
  const [error, setError] = useState(null);
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
      console.error('API Error:', error);
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
        console.error('Error checking admin status:', error);
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

    const fetchHeaderData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/bookheader?lang=${i18n.language}`);
        if (isMounted && response.data?.header) {
          setHeaderText(response.data.header);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching header:', error);
          setError('Failed to load header data');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
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
    const fetchBooks = async () => {
      try {
        const response = await axios.get(`https://elmanafea.shop/books?lang=${i18n.language}`);
        if (response.data && Array.isArray(response.data.books)) {
          const formattedBooks = response.data.books.map(book => {
            // تأكد من أن رابط الصورة كامل
            let imageUrl = book.imageUrl;
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = `https://elmanafea.shop${imageUrl}`;
            }
            console.log('Book image URL:', imageUrl); // للتأكد من الرابط

            return {
              id: book._id || Date.now(),
              title: book.title,
              link: book.fileUrl,
              image: imageUrl
            };
          });
          setBooks(formattedBooks);
        }
      } catch (error) {
        console.error('Error fetching books:', error);
        const defaultBooks = allBooks[i18n.language] || [];
        setBooks(defaultBooks);
      }
    };

    fetchBooks();
  }, [i18n.language]);

  // Save books to localStorage
  useEffect(() => {
    if (!i18n.language || !books) return;

    try {
      localStorage.setItem(`books_${i18n.language}`, JSON.stringify(books));
    } catch (error) {
      console.error('Error saving books:', error);
    }
  }, [books, i18n.language]);

  const handleUpdateHeader = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin authentication required');
      }

      const response = await api.post(
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
      );

      if (response.status === 200) {
        setHeaderText(editingHeaderText);
        setShowHeaderModal(false);
      }
    } catch (error) {
      console.error('Error updating header:', error);
      alert(error.response?.data?.message || 'Failed to update header');
    }
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

  const handleDelete = async (bookId) => {
    if (window.confirm(t('هل أنت متأكد من حذف هذا الكتاب؟'))) {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          throw new Error('Admin authentication required');
        }

        // استخدام الرابط الجديد للحذف
        await axios.delete(`https://elmanafea.shop/admin/deletebook/${bookId}`, {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        });

        // تحديث قائمة الكتب بعد الحذف
        const response = await axios.get(`https://elmanafea.shop/books?lang=${i18n.language}`);
        if (response.data && Array.isArray(response.data.books)) {
          const formattedBooks = response.data.books.map(book => {
            // تأكد من أن رابط الصورة كامل
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
          alert('تم حذف الكتاب بنجاح');
        }
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('حدث خطأ أثناء حذف الكتاب');
      }
    }
  };

  const handleUpdate = async () => {
    if (!editingBook) return;

    try {
      const formData = new FormData();
      formData.append('bookId', editingBook.id);
      formData.append('title', editingBook.title);
      formData.append('lang', i18n.language);
      
      // إضافة الملف إذا تم تغييره
      if (editingBook.file) {
        formData.append('file', editingBook.file);
        formData.append('type', 'file');
      } else if (editingBook.link) {
        formData.append('file', editingBook.link);
        formData.append('type', 'text');
      }

      // إضافة الصورة الجديدة إذا تم اختيارها
      if (editingBook.newImage) {
        formData.append('image', editingBook.newImage);
      }

      // طباعة محتويات الـ FormData للتأكد
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await axios({
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
      });

      if (response.status === 200 || response.status === 201) {
        // تحديث قائمة الكتب بعد التعديل
        const getBooksResponse = await axios.get(`https://elmanafea.shop/books?lang=${i18n.language}`);
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
        alert('تم تحديث الكتاب بنجاح');
      } else {
        throw new Error(response.data?.message || 'Failed to update book');
      }
    } catch (error) {
      console.error('Error updating book:', error);
      alert(error.response?.data?.message || 'حدث خطأ في تحديث الكتاب');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('يرجى اختيار ملف PDF فقط');
        event.target.value = '';
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        alert('حجم الملف كبير جداً. الحد الأقصى هو 50 ميجابايت');
        event.target.value = '';
        return;
      }

      console.log('Selected file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      setNewBook(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  const handleCloseModal = () => {
    if (newBook.link && newBook.link.startsWith('blob:')) {
      URL.revokeObjectURL(newBook.link);
    }
    setShowAddModal(false);
    setNewBook({ id: '', title: '', file: null });
    setUploadType('');
  };

  const handleAdd = async () => {
    try {
      if (!newBook.title.trim()) {
        alert('من فضلك أدخل عنوان الكتاب');
        return;
      }
      
      if (!newBook.file) {
        alert('من فضلك اختر ملف PDF');
        return;
      }

      if (newBook.file.type !== 'application/pdf') {
        alert('يرجى اختيار ملف PDF فقط');
        return;
      }

      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        alert('جلسة المسؤول منتهية. يرجى تسجيل الدخول مرة أخرى');
        return;
      }

      const formData = new FormData();
      formData.append('file', newBook.file);
      formData.append('title', newBook.title.trim());
      formData.append('lang', i18n.language);
      formData.append('type', 'file');

      // إضافة الصورة إذا تم اختيارها
      if (newBook.image) {
        formData.append('image', newBook.image);
      }

      setUploadProgress(0);

      const response = await axios({
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
      });

      if (response.status === 201 || response.status === 200) {
        // Refresh books list after successful upload
        const getBooksResponse = await axios.get(`https://elmanafea.shop/books?lang=${i18n.language}`);
        if (getBooksResponse.data && Array.isArray(getBooksResponse.data.books)) {
          const formattedBooks = getBooksResponse.data.books.map(book => ({
            id: book._id || Date.now(),
            title: book.title,
            link: book.fileUrl,
            image: book.imageUrl
          }));
          setBooks(formattedBooks);
        }
        
        setShowAddModal(false);
        setNewBook({ title: '', file: null, image: null });
        setUploadProgress(0);
        alert('تم إضافة الكتاب بنجاح');
      }
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = 'حدث خطأ أثناء رفع الكتاب';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'جلسة المسؤول منتهية. يرجى تسجيل الدخول مرة أخرى';
          localStorage.removeItem('adminToken');
          setIsAdmin(false);
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      alert(errorMessage);
      setUploadProgress(0);
    }
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
    const fetchVideoHeader = async () => {
      try {
        const response = await axios.get(`https://elmanafea.shop/booksecondheader?lang=${i18n.language}`);
        if (response.data && response.data.second_header) {
          setSubtitleText(response.data.second_header);
        }
      } catch (error) {
        console.error('Error fetching video header:', error);
        setSubtitleText('مجموعة مميزة من الكتب في علوم الشريعة والسيرة النبوية');
      }
    };

    fetchVideoHeader();
  }, [i18n.language]);

  const handleUpdateSubtitle = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin authentication required');
      }

      // Send POST request to update video header
      const response = await axios.post(
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
      );

      if (response.status === 200 || response.status === 201) {
        // Fetch updated video header
        const getResponse = await axios.get(`https://elmanafea.shop/booksecondheader?lang=${i18n.language}`);
        if (getResponse.data && getResponse.data.title) {
          setSubtitleText(getResponse.data.title);
        } else {
          setSubtitleText(editingSubtitleText);
        }
        setShowSubtitleModal(false);
      }
    } catch (error) {
      console.error('Error updating video header:', error);
      alert(error.response?.data?.message || 'Failed to update header');
    }
  };

  const handleBookClick = (book) => {
    const encodedUrl = encodeURIComponent(book.link);
    const encodedTitle = encodeURIComponent(book.title);
    navigate(`/book-viewer/${encodedUrl}/${encodedTitle}`);
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
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

          {/* Header Edit Modal */}
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

        {/* Modal for editing subtitle */}
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

          {/* نافذة تعديل الكتاب */}
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

                {/* إضافة حقل تحميل الصورة */}
                <div className="file-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) { // 5MB limit
                          alert('حجم الصورة كبير جداً. الحد الأقصى هو 5 ميجابايت');
                          e.target.value = '';
                          return;
                        }
                        setEditingBook({...editingBook, newImage: file});
                      }
                    }}
                    className="file-input"
                    id="edit-image-upload"
                  />
                  <label htmlFor="edit-image-upload" className="file-label">
                    تغيير صورة الغلاف
                  </label>
                  {editingBook.newImage && (
                    <span className="file-name">{editingBook.newImage.name}</span>
                  )}
                </div>

                {/* عرض الصورة الحالية إذا وجدت */}
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

          {/* نافذة إضافة كتاب جديد */}
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
                    {newBook.file && <span className="file-name">{newBook.file.name}</span>}
                  </div>

                  {/* إضافة حقل تحميل الصورة */}
                  <div className="file-upload-container">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) { // 5MB limit
                            alert('حجم الصورة كبير جداً. الحد الأقصى هو 5 ميجابايت');
                            e.target.value = '';
                            return;
                          }
                          setNewBook({...newBook, image: file});
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
                        <span className="file-name">{newBook.image.name}</span>
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
              {currentPage > 1 && (
                <li><a onClick={() => paginate(currentPage - 1)}>&lt;</a></li>
              )}
              {pageNumbers.map(number => (
                <li key={number}>
                  <a onClick={() => paginate(number)} className={currentPage === number ? 'active' : ''}>
                    {number}
                  </a>
                </li>
              ))}
              {currentPage < pageNumbers.length && (
                <li><a onClick={() => paginate(currentPage + 1)}>&gt;</a></li>
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
      <Suspense fallback={<LoadingSpinner />}>
        <Intre />
      </Suspense>
    </ErrorBoundary>
  );
}