import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faEdit, faSave, faFileExcel, faDownload } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Header from './header';
import Footer from './footer';
import './mosabaqa.css';
import { countryCodes } from './countryCodes';

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
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [showCountryCodes, setShowCountryCodes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(countryCodes);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchQuestion();
  }, [i18n.language]);

  useEffect(() => {
    const checkAdmin = () => {
      const token = localStorage.getItem('adminToken');
      setIsAdmin(!!token);
    };
    checkAdmin();
  }, []);

  const fetchQuestion = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`https://elmanafea.shop/questions?lang=${i18n.language}`);
      if (response.data && response.data.question) {
        setQuestion(response.data.question);
      }
    } catch (err) {
      console.error('Error fetching question:', err);
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

  const toggleQuestionEdit = async () => {
    if (isEditingQuestion) {
      try {
        setIsLoading(true);
        
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          throw {
            response: {
              status: 401,
              data: { message: 'No authentication token found.' }
            }
          };
        }
        
        await axios.post('https://elmanafea.shop/admin/question', {
          question: question,
          lang: i18n.language
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        await fetchQuestion();
        setError(''); // Clear any previous errors on success
      } catch (err) {
        console.error('Error updating question:', err);
        
        // Handle specific error codes
        if (err.response) {
          if (err.response.status === 401) {
            setError(t('الرمز غير صالح أو منتهي الصلاحية. الرجاء تسجيل الدخول مجددا كمسؤول'));
          } else if (err.response.status === 403) {
            setError(t('غير مصرح بالتعديل. الرجاء تسجيل الدخول كمسؤول'));
          } else {
            setError(t('حدث خطأ في تحديث السؤال'));
          }
        } else {
          setError(t('حدث خطأ في الاتصال بالخادم'));
        }
      } finally {
        setIsLoading(false);
      }
    }
    setIsEditingQuestion(!isEditingQuestion);
  };

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setError(t('الرجاء إدخال الاسم ورقم الهاتف'));
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Prepare the full phone number with country code
      const fullPhoneNumber = formData.countryCode + formData.phone;
      
      // Send data to backend
      await axios.post('https://elmanafea.shop/answer', {
        name: formData.name,
        phone: fullPhoneNumber,
        email: formData.email || ' ', // Send empty string if email is not provided
        country: formData.country || '',
        answer: formData.answer,
        lang: i18n.language
      });
      
      // Show success modal
      setIsModalOpen(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsModalOpen(false);
        setFormData({ name: '', answer: '', countryCode: '+966', phone: '', email: '', country: '' });
      }, 3000);
      
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error submitting participation:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(t(err.response.data.message));
      } else {
        setError(t('حدث خطأ في إرسال البيانات'));
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
        setError(t('الرجاء تسجيل الدخول كمسؤول'));
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
      
      setError('');
    } catch (err) {
      console.error('Error downloading Excel:', err);
      if (err.response && err.response.status === 401) {
        setError(t('الرمز غير صالح أو منتهي الصلاحية. الرجاء تسجيل الدخول مجددا كمسؤول'));
      } else {
        setError(t('حدث خطأ في تحميل الملف'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getTextDirection = (text) => {
    if (['ar', 'fa', 'ur'].includes(i18n.language)) {
      return 'rtl';
    }
    return 'ltr';
  };

  return (
    <>
      <Header />
      <div className="mosabaqa-container">
        <div className="mosabaqa-form">
          <div className="mosabaqa-header">
            <h2>{t('مسابقة منافع الحج')}</h2>
            {isAdmin && (
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
            )}
          </div>

          <div className="question-section">
            <h3>{t('السؤال')}:</h3>
            <div className="question-content">
              {isEditingQuestion ? (
                <div className="question-edit-container">
                  <input
                    type="text"
                    value={question}
                    onChange={handleQuestionChange}
                    className="question-edit-input"
                  />
                  <button 
                    className="question-edit-btn save-btn"
                    onClick={toggleQuestionEdit}
                    title={t('حفظ')}
                    disabled={isLoading}
                  >
                    <FontAwesomeIcon icon={faSave} />
                    {isLoading && <span className="loading-spinner"></span>}
                  </button>
                </div>
              ) : (
                <div className="question-view-container">
                  <p>{question}</p>
                  {isAdmin && (
                    <button 
                      className="question-edit-btn"
                      onClick={() => setIsEditingQuestion(true)}
                      title={t('تعديل السؤال')}
                      disabled={isLoading}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
            <div className="form-group">
              <label>{t('الإجابة')}</label>
              <input
                type="text"
                name="answer"
                value={formData.answer}
                onChange={handleChange}
                required
                placeholder={t('اكتب إجابتك هنا')}
              />
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
                <div className="country-code-container">
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

            {error && <div className="error-message">{t(error)}</div>}
            
            <button type="submit" className="submit-btn">
              {t('إرسال المشاركة')}
            </button>
          </form>
        </div>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="success-modal">
              <div className="success-icon">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <h3>{t('تم إرسال مشاركتك بنجاح!')}</h3>
              <p>{t('شكراً لمشاركتك في المسابقة')}</p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Mosabaqa;
