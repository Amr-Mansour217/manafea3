import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faEdit, faSave, faFileExcel, faDownload, faPlus, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Header from './header';
import Footer from './footer';
import './mosabaqa.css';
import { countryCodes } from './countryCodes';
import { showToast } from './Toast'; // Import showToast component
import Louder from './louder'; // استيراد مكون Louder

const Mosabaqa = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    answer: '',
    countryCode: '+966',
    phone: '',
    email: '',
    country: ''
  });
  const [question, setQuestion] = useState('ما هو أول مسجد بني في الإسلام؟');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false); // حالة جديدة لتتبع صحة الإجابة
  const [error, setError] = useState('');
  const [showCountryCodes, setShowCountryCodes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(countryCodes);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const countryCodeRef = useRef(null);
  
  // New states for answer options management
  const [answerOptions, setAnswerOptions] = useState([]);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [newOption, setNewOption] = useState('');
  const [editingOption, setEditingOption] = useState({ id: null, text: '' });

  // Add new state for question editing
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionFormData, setQuestionFormData] = useState({
    questionText: '',
    correctAnswer: '',
    newCorrectAnswer: '' // حقل جديد لإضافة إجابة جديدة
  });

  // إضافة حالات جديدة للتأكيد على الحذف
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState(null);

  useEffect(() => {
    // استرجاع الإجابة الصحيحة من localStorage عند تحميل الصفحة أو تغيير اللغة
    const savedCorrectAnswer = localStorage.getItem(`correctAnswer_${i18n.language}`);
    if (savedCorrectAnswer) {
      setCorrectAnswer(savedCorrectAnswer);
    }
    
    fetchQuestion();
    fetchAnswerOptions();
  }, [i18n.language]);

  // حفظ الإجابة الصحيحة في localStorage عند تغيرها، مع مراعاة اللغة الحالية
  useEffect(() => {
    if (correctAnswer) {
      localStorage.setItem(`correctAnswer_${i18n.language}`, correctAnswer);
    }
  }, [correctAnswer, i18n.language]);

  useEffect(() => {
    const checkAdmin = () => {
      const token = localStorage.getItem('adminToken');
      setIsAdmin(!!token);
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (countryCodeRef.current && !countryCodeRef.current.contains(event.target)) {
        setShowCountryCodes(false);
      }
    }

    if (showCountryCodes) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryCodes]);

  const fetchQuestion = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`https://elmanafea.shop/questions?lang=${i18n.language}`);
      if (response.data && response.data.question) {
        setQuestion(response.data.question);
        // If there's a correct answer in the response, set it
        if (response.data.correctAnswer) {
          setCorrectAnswer(response.data.correctAnswer);
          // حفظ الإجابة الصحيحة في localStorage أيضًا هنا، مع مراعاة اللغة
          localStorage.setItem(`correctAnswer_${i18n.language}`, response.data.correctAnswer);
        }
      }
    } catch (err) {
      console.error('Error fetching question:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchAnswerOptions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`https://elmanafea.shop/storedanswers?lang=${i18n.language}`);
      
      // التحقق من شكل البيانات القادمة
      let options = [];
      if (response.data && response.data.answers && Array.isArray(response.data.answers)) {
        options = response.data.answers;
      } else if (response.data && Array.isArray(response.data)) {
        options = response.data;
      } else {
        console.log('No answer options available or empty response');
        options = [];
      }
      
      // ترتيب الخيارات بحسب تاريخ الإنشاء (الأحدث أولاً)
      const sortedOptions = [...options].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setAnswerOptions(sortedOptions);
    } catch (err) {
      console.error('Error fetching answer options:', err);
      // لا تظهر رسالة خطأ إذا كان الخطأ 404 (لا توجد إجابات)
      if (err.response && err.response.status === 404) {
        // في حالة عدم وجود إجابات، قم بتعيين المصفوفة فارغة بدلاً من عرض خطأ
        setAnswerOptions([]);
      } else {
        showToast.error(t('حدث خطأ في تحميل خيارات الإجابة'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 14);
      setFormData({ ...formData, [name]: numbersOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCountryCodeSelect = (code) => {
    setFormData({
      ...formData,
      countryCode: code
    });
    setShowCountryCodes(false);
  };

  const handleCountrySearch = (e) => {
    const value = e.target.value;
    const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 4);
    const validValue = '+' + numbersOnly;

    setFormData({ ...formData, countryCode: validValue });

    const query = validValue.replace('+', '');
    const filtered = countryCodes.filter(country =>
      country.name.toLowerCase().includes(query.toLowerCase()) ||
      country.code.includes(query)
    );
    setFilteredCountries(filtered);
    setShowCountryCodes(true);
  };

  const openQuestionModal = () => {
    setQuestionFormData({
      questionText: question,
      correctAnswer: correctAnswer,
      newCorrectAnswer: ''
    });
    setShowQuestionModal(true);
  };

  const closeQuestionModal = () => {
    setShowQuestionModal(false);
  };

  const handleQuestionFormChange = (e) => {
    const { name, value } = e.target;
    setQuestionFormData({
      ...questionFormData,
      [name]: value
    });
  };

  const saveQuestion = async () => {
    if (!questionFormData.questionText.trim()) {
      showToast.error(t('الرجاء إدخال السؤال'));
      return;
    }

    // التحقق من وجود إجابة محددة أو إجابة جديدة
    if (answerOptions.length > 0 && !questionFormData.correctAnswer) {
      showToast.error(t('الرجاء اختيار الإجابة الصحيحة'));
      return;
    }

    if (answerOptions.length === 0 && !questionFormData.newCorrectAnswer.trim()) {
      showToast.error(t('الرجاء إدخال الإجابة الصحيحة'));
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');

      if (!token) {
        showToast.error(t('الرمز غير صالح أو منتهي الصلاحية. الرجاء تسجيل الدخول مجددا كمسؤول'));
        return;
      }

      let answerId = questionFormData.correctAnswer;
      let isNewAnswer = false;

      // إذا لم توجد خيارات إجابة، قم بإنشاء إجابة جديدة أولاً (POST)
      if (answerOptions.length === 0 && questionFormData.newCorrectAnswer.trim()) {
        const answerResponse = await axios.post('https://elmanafea.shop/admin/answers', {
          answer: questionFormData.newCorrectAnswer,
          lang: i18n.language
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // استخدام معرف الإجابة الجديدة
        if (answerResponse.data && answerResponse.data._id) {
          answerId = answerResponse.data._id;
          isNewAnswer = true;
        } else if (answerResponse.data && answerResponse.data.id) {
          answerId = answerResponse.data.id;
          isNewAnswer = true;
        }
      }

      // حفظ السؤال مع الإجابة الصحيحة
      // دائمًا استخدم POST لأن الخادم لا يدعم PUT في هذا المسار
      await axios.post('https://elmanafea.shop/admin/question', {
        question: questionFormData.questionText,
        correctAnswer: answerId,
        lang: i18n.language
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // تحديث الحالة المحلية
      setQuestion(questionFormData.questionText);
      setCorrectAnswer(answerId);
      
      // حفظ الإجابة الصحيحة في localStorage مع مراعاة اللغة
      localStorage.setItem(`correctAnswer_${i18n.language}`, answerId);
      
      closeQuestionModal();
      await fetchQuestion();
      await fetchAnswerOptions();
      showToast.success(t('تم تحديث السؤال بنجاح'));
    } catch (err) {
      console.error('Error updating question:', err);
      if (err.response) {
        if (err.response.status === 401) {
          showToast.error(t('الرمز غير صالح أو منتهي الصلاحية. الرجاء تسجيل الدخول مجددا كمسؤول'));
        } else if (err.response.status === 403) {
          showToast.error(t('غير مصرح بالتعديل. الرجاء تسجيل الدخول كمسؤول'));
        } else {
          showToast.error(t('حدث خطأ في تحديث السؤال'));
        }
      } else {
        showToast.error(t('حدث خطأ في الاتصال بالخادم'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      showToast.error(t('الرجاء إدخال الاسم ورقم الهاتف'));
      return;
    }
    
    if (!formData.answer) {
      showToast.error(t('الرجاء اختيار إجابة من القائمة'));
      return;
    }

    try {
      setIsLoading(true);

      // حفظ البيانات في متغير مؤقت لاستخدامها في الطلب
      const submissionData = {
        name: formData.name,
        phone: formData.countryCode + formData.phone,
        email: formData.email || ' ',
        country: formData.country || '',
        answer: '',
        answerId: formData.answer,
        lang: i18n.language
      };

      // البحث عن نص الإجابة المختارة
      const selectedOption = answerOptions.find(option => option._id === formData.answer);
      
      if (!selectedOption) {
        showToast.error(t('حدث خطأ في تحديد الإجابة، يرجى المحاولة مرة أخرى'));
        setIsLoading(false);
        return;
      }
      
      submissionData.answer = selectedOption.text;
      
      console.log("إرسال الإجابة:", selectedOption.text);
      console.log("الإجابة الصحيحة:", correctAnswer);
      
      // تحديد ما إذا كانت الإجابة المختارة هي الصحيحة
      const isCorrect = formData.answer === correctAnswer;

      // مسح البيانات فوراً قبل إرسال الطلب
      setFormData({ 
        name: '', 
        answer: '', 
        countryCode: '+966', 
        phone: '', 
        email: '', 
        country: '' 
      });

      // إرسال البيانات إلى الخادم
      const response = await axios.post('https://elmanafea.shop/answer', submissionData);

      console.log("استجابة الخادم:", response.data);
      
      setIsCorrectAnswer(isCorrect);
      setIsModalOpen(true);
      
      // إغلاق النافذة المنبثقة بعد 3 ثوانٍ
      setTimeout(() => {
        setIsModalOpen(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting participation:', err);
      if (err.response && err.response.data && err.response.data.message) {
        showToast.error(t(err.response.data.message));
      } else {
        showToast.error(t('حدث خطأ في إرسال البيانات'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');

      if (!token) {
        showToast.error(t('الرجاء تسجيل الدخول كمسؤول'));
        return;
      }

      // Make GET request with responseType blob to handle file download
      const response = await axios.get('https://elmanafea.shop/admin/answers', {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a temporary link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `answers_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      showToast.success(t('تم تنزيل الملف بنجاح')); // Success toast for download
    } catch (err) {
      console.error('Error downloading Excel:', err);
      if (err.response && err.response.status === 401) {
        showToast.error(t('الرمز غير صالح أو منتهي الصلاحية. الرجاء تسجيل الدخول مجددا كمسؤول'));
      } else {
        showToast.error(t('حدث خطأ في تحميل الملف'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openOptionsModal = () => {
    setShowOptionsModal(true);
  };

  const closeOptionsModal = () => {
    setShowOptionsModal(false);
    setNewOption('');
    setEditingOption({ id: null, text: '' });
  };

  const addNewOption = async () => {
    if (!newOption.trim()) return;
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        showToast.error(t('الرجاء تسجيل الدخول كمسؤول'));
        return;
      }
      
      // تغيير text إلى answer حسب متطلبات الـ backend
      await axios.post('https://elmanafea.shop/admin/answers', {
        answer: newOption,
        lang: i18n.language
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      await fetchAnswerOptions();
      setNewOption('');
      showToast.success(t('تمت إضافة الخيار بنجاح'));
    } catch (err) {
      console.error('Error adding option:', err);
      if (err.response && err.response.data && err.response.data.message) {
        showToast.error(t(err.response.data.message));
      } else if (err.response && err.response.status === 401) {
        showToast.error(t('الرمز غير صالح أو منتهي الصلاحية'));
      } else {
        showToast.error(t('حدث خطأ في إضافة الخيار'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startEditOption = (option) => {
    setEditingOption({
      id: option._id,
      text: option.text
    });
  };

  const saveEditedOption = async () => {
    if (!editingOption.text.trim() || !editingOption.id) return;
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        showToast.error(t('الرجاء تسجيل الدخول كمسؤول'));
        return;
      }
      
      // تغيير الحقل من answer إلى text حسب ما يطلبه الخادم
      await axios.put(`https://elmanafea.shop/admin/storedanswers/${editingOption.id}`, {
        text: editingOption.text,  // تغيير من answer إلى text
        lang: i18n.language
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      await fetchAnswerOptions();
      setEditingOption({ id: null, text: '' });
      showToast.success(t('تم تحديث الخيار بنجاح'));
    } catch (err) {
      console.error('Error updating option:', err);
      if (err.response && err.response.data && err.response.data.message) {
        showToast.error(t(err.response.data.message));
      } else {
        showToast.error(t('حدث خطأ في تحديث الخيار'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteOption = (option) => {
    setOptionToDelete(option);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setOptionToDelete(null);
  };

  const proceedWithDelete = async () => {
    if (!optionToDelete || !optionToDelete._id) return;
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        showToast.error(t('الرجاء تسجيل الدخول كمسؤول'));
        return;
      }
      
      await axios.delete(`https://elmanafea.shop/admin/answer/${optionToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      await fetchAnswerOptions();
      showToast.success(t('تم حذف الخيار بنجاح'));
    } catch (err) {
      console.error('Error deleting option:', err);
      showToast.error(t('حدث خطأ في حذف الخيار'));
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setOptionToDelete(null);
    }
  };

  const getTextDirection = (text) => {
    if (['ar', 'fa', 'ur'].includes(i18n.language)) {
      return 'rtl';
    }
    return 'ltr';
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (isLoading) {
    return <div><Louder /></div>;
  }

  return (
    <>
      <Header />
      <div className="mosabaqa-container">
        <div className="mosabaqa-form">
          <div className="mosabaqa-header">
            <h2>{t('مسابقة منافع الحج')}</h2>
            {isAdmin && (
              <div className="admin-buttons">
                <button 
                  className="admin-excel-btn"
                  onClick={handleDownloadExcel}
                  disabled={isLoading}
                  title={t('تحميل إجابات المشاركين')}
                >
                  <FontAwesomeIcon icon={faFileExcel} />
                  <span>{t('تحميل الإجابات')}</span>
                  {isLoading && <span className="loading-spinner"></span>}
                </button>
                <button 
                  className="admin-options-btn"
                  onClick={openOptionsModal}
                  disabled={isLoading}
                  title={t('إدارة خيارات الإجابة')}
                >
                  <FontAwesomeIcon icon={faEdit} />
                  <span>{t('إدارة الخيارات')}</span>
                </button>
              </div>
            )}
          </div>

          <div className="question-section">
            <h3>{t('السؤال')}:</h3>
            <div className="question-content">
              <div className="question-view-container">
                <p>{question}</p>
                {isAdmin && (
                  <button 
                    className="question-edit-btn"
                    onClick={openQuestionModal}
                    title={t('تعديل السؤال')}
                    disabled={isLoading}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                )}
              </div>
            </div>
          </div>
            <div className="form-group answer-options-container">
              <label>{t('الإجابة')}</label>
              <div className="custom-answer-options">
                {answerOptions.length === 0 ? (
                  <p className="no-answers-message">{t('لا توجد خيارات متاحة حاليا')}</p>
                ) : (
                  answerOptions.map(option => (
                    <div 
                      key={option._id} 
                      className={`answer-option ${formData.answer === option._id ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, answer: option._id })}
                    >
                      <div className="custom-radio">
                        <div className="radio-inner"></div>
                      </div>
                      <span className="option-label">{option.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('الاسم')}</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={t('ادخل اسمك الكامل')}
              />
            </div>

            <div className="form-group">
              <label>{t('رقم الهاتف')}</label>
              <div className="phone-input-group">
                <div className="country-code-container" ref={countryCodeRef}>
                  <input
                    type="text"
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleCountrySearch}
                    className="country-code"
                    onClick={() => setShowCountryCodes(true)}
                  />
                  {showCountryCodes && (
                    <div className="country-codes-dropdown">
                      {filteredCountries.map((country) => (
                        <div
                          key={country.code}
                          className="country-option"
                          onClick={() => handleCountryCodeSelect(country.code)}
                        >
                          <span className="country-flag">{country.flag}</span>
                          <span className="country-name">{country.name}</span>
                          <span className="country-code">{country.code}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="phone-number"
                  placeholder={t("رقم الهاتف")}
                  dir={getTextDirection(t("رقم الهاتف"))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('البلد')}</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder={t('ادخل اسم بلدك')}
              />
            </div>

            <div className="form-group">
              <label>{t('البريد الإلكتروني')}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('ادخل بريدك الإلكتروني')}
              />
            </div>
            
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? t('جاري الإرسال...') : t('إرسال المشاركة')}
            </button>
          </form>
        </div>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className={`result-modal ${isCorrectAnswer ? 'success-modal' : 'error-modal'}`}>
              <div className={`result-icon ${isCorrectAnswer ? 'success-icon' : 'error-icon'}`}>
                <FontAwesomeIcon icon={isCorrectAnswer ? faCheckCircle : faTimes} />
              </div>
              <h3>{isCorrectAnswer ? t('إجابة صحيحة!') : t('إجابة خاطئة')}</h3>
              <p>
                {isCorrectAnswer 
                  ? t('أحسنت! شكراً لمشاركتك في المسابقة') 
                  : t('للأسف إجابتك غير صحيحة، يمكنك المحاولة مرة أخرى')}
              </p>
              <button className="close-modal-btn" onClick={closeModal}>
                {t('إغلاق')}
              </button>
            </div>
          </div>
        )}

        {/* Answer Options Modal */}
        {showOptionsModal && (
          <div className="modal-overlay">
            <div className="options-modal">
              <h3>{t('إدارة خيارات الإجابة')}</h3>
              
              <div className="options-header">
                <div className="add-option-form">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder={t('أضف خيار جديد')}
                  />
                  <button 
                    onClick={addNewOption}
                    disabled={!newOption.trim() || isLoading}
                  >
                    <FontAwesomeIcon icon={faPlus} /> {t('إضافة')}
                  </button>
                </div>
              </div>
              
              <div className="options-list">
                {answerOptions.length === 0 ? (
                  <p className="no-options">{t('لا توجد خيارات متاحة')}</p>
                ) : (
                  answerOptions.map(option => (
                    <div key={option._id} className="option-item">
                      {editingOption.id === option._id ? (
                        <div className="edit-option-form">
                          <input
                            type="text"
                            value={editingOption.text}
                            onChange={(e) => setEditingOption({ ...editingOption, text: e.target.value })}
                          />
                          <button 
                            onClick={saveEditedOption}
                            disabled={!editingOption.text.trim() || isLoading}
                          >
                            <FontAwesomeIcon icon={faSave} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="option-text">{option.text}</span>
                          <div className="option-actions">
                            <button onClick={() => startEditOption(option)}>
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button 
                              onClick={() => confirmDeleteOption(option)} // تغيير من deleteOption إلى confirmDeleteOption
                              className="delete-btn"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <button className="close-modal-btn" onClick={closeOptionsModal}>
                {t('إغلاق')}
              </button>
            </div>
          </div>
        )}

        {/* نافذة تأكيد الحذف */}
        {showDeleteConfirm && optionToDelete && (
          <div className="modal-overlay">
            <div className="confirm-modal">
              <h3>{t('تأكيد الحذف')}</h3>
              <p>{t('هل أنت متأكد من حذف الإجابة التالية؟')}</p>
              <p className="option-to-delete">"{optionToDelete.text}"</p>
              
              <div className="confirm-buttons">
                <button 
                  className="cancel-btn" 
                  onClick={cancelDelete}
                  disabled={isLoading}
                >
                  {t('إلغاء')}
                </button>
                <button 
                  className="delete-confirm-btn" 
                  onClick={proceedWithDelete}
                  disabled={isLoading}
                >
                  {isLoading ? t('جاري الحذف...') : t('نعم، احذف')}
                  {isLoading && <span className="loading-spinner"></span>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Question Edit Modal */}
        {showQuestionModal && (
          <div className="modal-overlay">
            <div className="question-modal">
              <h3>{t('تعديل السؤال والإجابة الصحيحة')}</h3>
              
              <div className="modal-form">
                <div className="form-group">
                  <label>{t('السؤال')}</label>
                  <input
                    type="text"
                    name="questionText"
                    value={questionFormData.questionText}
                    onChange={handleQuestionFormChange}
                    placeholder={t('أدخل السؤال')}
                    required
                  />
                </div>
                
                {answerOptions.length > 0 ? (
                  // إذا كانت هناك خيارات إجابة، أظهر القائمة المنسدلة
                  <div className="form-group">
                    <label>{t('الإجابة الصحيحة')}</label>
                    <select
                      name="correctAnswer"
                      value={questionFormData.correctAnswer}
                      onChange={handleQuestionFormChange}
                      className="answer-select"
                    >
                      <option value="">{t('اختر الإجابة الصحيحة')}</option>
                      {answerOptions.map(option => (
                        <option key={option._id} value={option._id}>
                          {option.text}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  // إذا لم تكن هناك خيارات إجابة، أظهر حقل إدخال للإجابة الجديدة
                  <div className="form-group">
                    <label>{t('أضف إجابة جديدة')}</label>
                    <input
                      type="text"
                      name="newCorrectAnswer"
                      value={questionFormData.newCorrectAnswer}
                      onChange={handleQuestionFormChange}
                      placeholder={t('أدخل الإجابة الصحيحة')}
                    />
                    <small className="hint-text">{t('سيتم حفظ هذه الإجابة كإجابة صحيحة')}</small>
                  </div>
                )}

                <div className="modal-buttons">
                  <button 
                    className="save-btn" 
                    onClick={saveQuestion}
                    disabled={isLoading || !questionFormData.questionText.trim() || 
                      (answerOptions.length > 0 && !questionFormData.correctAnswer) ||
                      (answerOptions.length === 0 && !questionFormData.newCorrectAnswer.trim())}
                  >
                    {isLoading ? t('جاري الحفظ...') : t('حفظ')}
                    {isLoading && <span className="loading-spinner"></span>}
                  </button>
                  <button className="cancel-btn" onClick={closeQuestionModal}>
                    {t('إلغاء')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Mosabaqa;
