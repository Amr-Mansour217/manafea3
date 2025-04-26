import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Header from './header';
import Footer from './footer';
import './mosabaqa.css';
import { countryCodes } from './countryCodes';
// import { useTranslation } from 'react-i18next';



const Mosabaqa = () => {
  const { t, i18n } = useTranslation(); // إضافة i18n
  const [formData, setFormData] = useState({
    name: '',
    answer: '',
    countryCode: '+966',
    phone: '',
    email: '',
    country: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [showCountryCodes, setShowCountryCodes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(countryCodes);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // السماح فقط بالأرقام مع حد أقصى 14 رقم
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
    // السماح فقط بالأرقام وعلامة + مع حد أقصى 4 أرقام
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setError(t('الرجاء إدخال الاسم ورقم الهاتف'));
      return;
    }
    
    try {
      setIsModalOpen(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setFormData({ name: '', answer: '', countryCode: '+966', phone: '', email: '', country: '' });
      }, 3000);
    } catch (error) {
      setError(t('حدث خطأ في إرسال البيانات'));
    }
  };

  const getTextDirection = (text) => {
    // التحقق من اللغة الحالية
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
          <h2>{t('المسابقة الرمضانية')}</h2>
          <div className="question-section">
            <h3>{t('السؤال')}:</h3>
            <p>{t('ما هو أول مسجد بني في الإسلام؟')}</p>
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
