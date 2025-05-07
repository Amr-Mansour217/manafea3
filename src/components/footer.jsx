import React, { useState, useEffect } from 'react';
import './footer.css';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { showToast } from './Toast';

// كلاس لإدارة روابط التواصل الاجتماعي
class SocialLinksManager {
  constructor() {
    this.baseURL = 'https://elmanafea.shop';
  }

  async fetchSocialLinks() {
    try {
      const response = await axios.get(`${this.baseURL}/social`);
      
      if (response.status === 200 && response.data) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: false,
        message: 'Failed to fetch social links'
      };
    } catch (error) {
      console.error('Error fetching social links:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch social links'
      };
    }
  }

  async updateSocialLinks(links, adminToken) {
    try {
      if (!adminToken) {
        return {
          success: false,
          message: 'يرجى تسجيل الدخول كمشرف أولاً'
        };
      }

      const response = await axios.post(
        `${this.baseURL}/admin/social`,
        links,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return {
        success: response.status === 200,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating social links:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update social links'
      };
    }
  }
}

// كلاس لإدارة حقوق النشر ونصوص الفوتر
class FooterTextManager {
  constructor(t) {
    this.t = t;
    this.baseURL = 'https://elmanafea.shop';
  }

  async fetchFooterText() {
    try {
      const response = await axios.get(`${this.baseURL}/copyright`);
      
      if (response.status === 200 && response.data?.copyright) {
        return {
          success: true,
          data: response.data.copyright
        };
      }
      
      return {
        success: false,
        message: 'Failed to fetch copyright text'
      };
    } catch (error) {
      console.error('Error fetching copyright text:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch copyright text'
      };
    }
  }

  async updateFooterText(text, adminToken) {
    try {
      if (!adminToken) {
        return {
          success: false,
          message: 'يرجى تسجيل الدخول كمشرف أولاً'
        };
      }

      const response = await axios.post(
        `${this.baseURL}/admin/copyright`,
        { text },
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );
      
      return {
        success: response.status === 200,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating copyright text:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update copyright text'
      };
    }
  }

  getDefaultCopyrightText() {
    const currentYear = new Date().getFullYear();
    return this.t('حقوق النشر © {{year}} المنافع. جميع الحقوق محفوظة.', { year: currentYear });
  }
}

function Footer() {
  const { t } = useTranslation();
  
  // إنشاء كائنات المدراء
  const socialLinksManager = new SocialLinksManager();
  const footerTextManager = new FooterTextManager(t);
  
  // حالة الكومبوننت
  const [isAdmin, setIsAdmin] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    twitter: '',
    youtube: '',
    instagram: '',
    telegram: ''
  });
  
  const [copyrightText, setCopyrightText] = useState('');
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [isEditingCopyright, setIsEditingCopyright] = useState(false);
  const [editedLinks, setEditedLinks] = useState({});
  const [editedCopyright, setEditedCopyright] = useState('');
  
  // التحقق من صلاحيات المدير
  useEffect(() => {
    const checkAdmin = () => {
      const token = localStorage.getItem('adminToken');
      setIsAdmin(!!token);
    };
    
    checkAdmin();
    window.addEventListener('storage', checkAdmin);
    return () => window.removeEventListener('storage', checkAdmin);
  }, []);
  
  // جلب بيانات روابط التواصل الاجتماعي
  useEffect(() => {
    const fetchSocialLinks = async () => {
      const result = await socialLinksManager.fetchSocialLinks();
      
      if (result.success) {
        setSocialLinks(result.data);
      }
    };
    
    fetchSocialLinks();
  }, []);
  
  // جلب نص حقوق النشر
  useEffect(() => {
    const fetchCopyrightText = async () => {
      const result = await footerTextManager.fetchFooterText();
      
      if (result.success) {
        setCopyrightText(result.data);
      } else {
        setCopyrightText(footerTextManager.getDefaultCopyrightText());
      }
    };
    
    fetchCopyrightText();
  }, [t]);
  
  // فتح نافذة تعديل روابط التواصل الاجتماعي
  const handleEditLinks = () => {
    setEditedLinks({ ...socialLinks });
    setIsEditingLinks(true);
  };
  
  // فتح نافذة تعديل نص حقوق النشر
  const handleEditCopyright = () => {
    setEditedCopyright(copyrightText);
    setIsEditingCopyright(true);
  };
  
  // حفظ روابط التواصل الاجتماعي
  const handleSaveLinks = async () => {
    const adminToken = localStorage.getItem('adminToken');
    const result = await socialLinksManager.updateSocialLinks(editedLinks, adminToken);
    
    if (result.success) {
      setSocialLinks(editedLinks);
      setIsEditingLinks(false);
      showToast.success(t('تم تحديث روابط التواصل الاجتماعي بنجاح'));
    } else {
      showToast.error(result.message);
    }
  };
  
  // حفظ نص حقوق النشر
  const handleSaveCopyright = async () => {
    const adminToken = localStorage.getItem('adminToken');
    const result = await footerTextManager.updateFooterText(editedCopyright, adminToken);
    
    if (result.success) {
      setCopyrightText(editedCopyright);
      setIsEditingCopyright(false);
      showToast.success(t('تم تحديث نص حقوق النشر بنجاح'));
    } else {
      showToast.error(result.message);
    }
  };
  
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="social-links">
          {isAdmin && (
            <button 
              className="edit-social-btn"
              onClick={handleEditLinks}
            >
              <FontAwesomeIcon icon={faPenToSquare} />
              {t('تعديل الروابط')}
            </button>
          )}
          
          <ul>
            {socialLinks.facebook && (
              <li>
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-facebook-f"></i>
                </a>
              </li>
            )}
            
            {socialLinks.twitter && (
              <li>
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-twitter"></i>
                </a>
              </li>
            )}
            
            {socialLinks.youtube && (
              <li>
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-youtube"></i>
                </a>
              </li>
            )}
            
            {socialLinks.instagram && (
              <li>
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-instagram"></i>
                </a>
              </li>
            )}
            
            {socialLinks.telegram && (
              <li>
                <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-telegram"></i>
                </a>
              </li>
            )}
          </ul>
        </div>
        
        <div className="copyright">
          <p>
            {copyrightText || footerTextManager.getDefaultCopyrightText()}
            {isAdmin && (
              <FontAwesomeIcon 
                icon={faPenToSquare} 
                className="edit-copyright-icon"
                onClick={handleEditCopyright}
              />
            )}
          </p>
        </div>
      </div>
      
      {/* نافذة تعديل روابط التواصل الاجتماعي */}
      {isEditingLinks && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{t('تعديل روابط التواصل الاجتماعي')}</h3>
            <div className="social-form">
              <div className="form-group">
                <label>{t('فيسبوك')}</label>
                <input 
                  type="text" 
                  value={editedLinks.facebook || ''}
                  onChange={e => setEditedLinks({...editedLinks, facebook: e.target.value})}
                  placeholder="https://facebook.com/..."
                />
              </div>
              
              <div className="form-group">
                <label>{t('تويتر')}</label>
                <input 
                  type="text" 
                  value={editedLinks.twitter || ''}
                  onChange={e => setEditedLinks({...editedLinks, twitter: e.target.value})}
                  placeholder="https://twitter.com/..."
                />
              </div>
              
              <div className="form-group">
                <label>{t('يوتيوب')}</label>
                <input 
                  type="text" 
                  value={editedLinks.youtube || ''}
                  onChange={e => setEditedLinks({...editedLinks, youtube: e.target.value})}
                  placeholder="https://youtube.com/..."
                />
              </div>
              
              <div className="form-group">
                <label>{t('إنستغرام')}</label>
                <input 
                  type="text" 
                  value={editedLinks.instagram || ''}
                  onChange={e => setEditedLinks({...editedLinks, instagram: e.target.value})}
                  placeholder="https://instagram.com/..."
                />
              </div>
              
              <div className="form-group">
                <label>{t('تيليغرام')}</label>
                <input 
                  type="text" 
                  value={editedLinks.telegram || ''}
                  onChange={e => setEditedLinks({...editedLinks, telegram: e.target.value})}
                  placeholder="https://t.me/..."
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button onClick={handleSaveLinks} className="save-btn">{t('حفظ')}</button>
              <button onClick={() => setIsEditingLinks(false)} className="cancel-btn">{t('إلغاء')}</button>
            </div>
          </div>
        </div>
      )}
      
      {/* نافذة تعديل نص حقوق النشر */}
      {isEditingCopyright && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{t('تعديل نص حقوق النشر')}</h3>
            <textarea 
              value={editedCopyright}
              onChange={e => setEditedCopyright(e.target.value)}
              rows={3}
              className="copyright-textarea"
            />
            
            <div className="modal-actions">
              <button onClick={handleSaveCopyright} className="save-btn">{t('حفظ')}</button>
              <button onClick={() => setIsEditingCopyright(false)} className="cancel-btn">{t('إلغاء')}</button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

export default Footer;