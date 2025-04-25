import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenToSquare, faPlus } from '@fortawesome/free-solid-svg-icons';
import './videos.css';

const Videos = () => {
  const { t, i18n } = useTranslation();
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [newVideoData, setNewVideoData] = useState({
    title: '',
    link: '',
    type: '',
    file: null,
  });
  const [secondHeader, setSecondHeader] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editingVideo, setEditingVideo] = useState(null);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    setIsAdmin(!!adminToken);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`https://elmanafea.shop/categories?lang=${i18n.language}`);
        if (response.data.success) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [i18n.language]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(
          `https://elmanafea.shop/video?lang=${i18n.language}&category=${currentCategory}`
        );
        if (response.data.success) {
          setVideos(response.data.videos);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, [i18n.language, currentCategory]);

  useEffect(() => {
    const fetchSecondHeader = async () => {
      try {
        const response = await axios.get(`https://elmanafea.shop/vidsecondheader?lang=${i18n.language}`);
        if (response.data.success && response.data.second_header) {
          setSecondHeader(response.data.second_header);
        }
      } catch (error) {
        console.error('Error fetching second header:', error);
      }
    };

    fetchSecondHeader();
  }, [i18n.language]);

  const handleVideoUpload = async (videoData, categoryId) => {
    try {
      const formData = new FormData();
      formData.append('title', videoData.title);
      formData.append('lang', i18n.language);
      formData.append('category', categoryId);
      formData.append('videoType', videoData.type === 'link' ? 'text' : 'file');

      if (videoData.type === 'link') {
        formData.append('video', videoData.link);
      } else if (videoData.type === 'file' && videoData.file) {
        formData.append('video', videoData.file);
      }

      const response = await axios.post(
        'https://elmanafea.shop/admin/uploadvideo',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      if (response.data.success) {
        const updatedVideosResponse = await axios.get(
          `https://elmanafea.shop/video?lang=${i18n.language}&category=${currentCategory}`
        );
        if (updatedVideosResponse.data.success) {
          setVideos(updatedVideosResponse.data.videos);
        }
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      const response = await axios.delete(
        `https://elmanafea.shop/admin/deletevideo/${videoId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      if (response.data.success) {
        setVideos((prevVideos) => prevVideos.filter((video) => video.id !== videoId));
      }
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  const handleAddVideo = () => {
    if (!newVideoData.title || (!newVideoData.link && !newVideoData.file) || !currentCategory) return;

    handleVideoUpload(newVideoData, currentCategory);
    setShowAddVideoModal(false);
    setNewVideoData({ title: '', link: '', type: '', file: null });
  };

  const handleUpdateSecondHeader = async (newText) => {
    try {
      const response = await axios.post('https://elmanafea.shop/admin/vidsecondheader', {
        second_header: newText,
        lang: i18n.language
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.data.success) {
        setSecondHeader(newText);
      }
    } catch (error) {
      console.error('Error updating second header:', error);
      throw error;
    }
  };

  const handleUpdateCategory = async (categoryId, title) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        alert('يرجى تسجيل الدخول كمشرف أولاً');
        return;
      }

      const response = await axios.post('https://elmanafea.shop/admin/addcategory', {
        lang: i18n.language,
        title: title,
        id: categoryId
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        const categoriesResponse = await axios.get(`https://elmanafea.shop/categories?lang=${i18n.language}`);
        if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
          setCategories(categoriesResponse.data);
        }
        setIsEditing(null);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('حدث خطأ في تحديث التصنيف');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`https://elmanafea.shop/categories?lang=${i18n.language}`);
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleUpdateVideo = async (videoData) => {
    try {
      const formData = new FormData();
      formData.append('title', videoData.title);
      formData.append('lang', i18n.language);
      formData.append('category', currentCategory);
      formData.append('videoType', videoData.type === 'text' ? 'text' : 'file');

      if (videoData.type === 'text') {
        formData.append('video', videoData.link);
      } else if (videoData.type === 'file' && videoData.file) {
        formData.append('video', videoData.file);
      }

      const response = await axios.post(
        'https://elmanafea.shop/admin/uploadvideo',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      if (response.data.success) {
        const updatedVideosResponse = await axios.get(
          `https://elmanafea.shop/video?lang=${i18n.language}&category=${currentCategory}`
        );
        if (updatedVideosResponse.data.success) {
          setVideos(updatedVideosResponse.data.videos);
        }
        setEditingVideo(null);
      }
    } catch (error) {
      console.error('Error updating video:', error);
      alert('حدث خطأ في تحديث الفيديو');
    }
  };

  return (
    <div className="videos-page">
      <div className="video-header">
        <h1>{t('عنوان الفيديو الرئيسي')}</h1>
        {isAdmin ? (
          <div className="editable-container">
            <input
              type="text"
              value={secondHeader}
              onChange={(e) => setSecondHeader(e.target.value)}
              onBlur={() => handleUpdateSecondHeader(secondHeader)}
              className="header-edit-input"
            />
          </div>
        ) : (
          <p>{secondHeader}</p>
        )}
      </div>

      <div className="video-categories-container">
        {categories.map((category, index) => (
          <div 
            key={category.id}
            className={`video-category-item ${currentCategory === category.id ? 'video-category-active' : ''}`}
            onClick={() => setCurrentCategory(category.id)}
          >
            {isEditing === category.id ? (
              <div className="video-category-edit-form">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="video-category-input"
                />
                <div className="video-category-buttons">
                  <button 
                    onClick={() => {
                      handleUpdateCategory(category.id, editValue);
                      setIsEditing(null);
                    }}
                    className="video-category-save-btn"
                  >
                    حفظ
                  </button>
                  <button 
                    onClick={() => setIsEditing(null)}
                    className="video-category-cancel-btn"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <div className="video-category-content">
                <span className="video-category-title">{category.title}</span>
                {isAdmin && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(category.id);
                      setEditValue(category.title);
                    }}
                    className="video-category-edit-btn"
                  >
                    تعديل
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="video-items-grid">
        {videos.map((video) => (
          <div className="video-item-card" key={video.id}>
            <div className="video-item-thumbnail">
              {isAdmin && (
                <div className="video-item-actions">
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="video-delete-icon"
                    onClick={() => handleDeleteVideo(video.id)}
                  />
                  <FontAwesomeIcon 
                    icon={faPenToSquare} 
                    className="video-edit-icon"
                    onClick={() => {
                      setEditingVideo({
                        id: video.id,
                        title: video.title,
                        link: video.link,
                        type: 'text',
                        file: null
                      });
                    }}
                  />
                </div>
              )}
              <iframe
                width="100%"
                height="100%"
                src={video.link}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="video-item-info">
              <h3 className="video-item-title">{video.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="add-video-btn-container">
          <button className="add-video-btn" onClick={() => setShowAddVideoModal(true)}>
            {t('إضافة فيديو جديد')}
          </button>
        </div>
      )}

      {showAddVideoModal && (
        <div className="video-modal-overlay">
          <div className="video-modal-content">
            <h3>إضافة فيديو جديد</h3>

            <div className="video-type-buttons">
              <button
                className={`video-type-btn ${newVideoData.type === 'link' ? 'active' : ''}`}
                onClick={() => setNewVideoData((prev) => ({ ...prev, type: 'link' }))}
              >
                رابط
              </button>
              <button
                className={`video-type-btn ${newVideoData.type === 'file' ? 'active' : ''}`}
                onClick={() => setNewVideoData((prev) => ({ ...prev, type: 'file' }))}
              >
                ملف
              </button>
            </div>

            <div className="video-form-field">
              <label>عنوان الفيديو:</label>
              <input
                type="text"
                value={newVideoData.title}
                onChange={(e) => setNewVideoData((prev) => ({ ...prev, title: e.target.value }))}
                className="video-form-input"
              />
            </div>
            {newVideoData.type === 'link' && (
              <div className="video-form-field">
                <label>رابط الفيديو:</label>
                <input
                  type="text"
                  value={newVideoData.link}
                  onChange={(e) => setNewVideoData((prev) => ({ ...prev, link: e.target.value }))}
                  className="video-form-input"
                />
              </div>
            )}
            {newVideoData.type === 'file' && (
              <div className="video-form-field">
                <label>اختر ملف الفيديو:</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setNewVideoData((prev) => ({ ...prev, file: e.target.files[0] }))}
                  className="video-form-input"
                />
              </div>
            )}
            <div className="video-modal-buttons">
              <button
                onClick={handleAddVideo}
                className="video-save-btn"
                disabled={!newVideoData.title || (!newVideoData.link && !newVideoData.file)}
              >
                حفظ
              </button>
              <button
                onClick={() => {
                  setShowAddVideoModal(false);
                  setNewVideoData({ title: '', link: '', type: '', file: null });
                }}
                className="video-cancel-btn"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {editingVideo && (
        <div className="video-modal-overlay">
          <div className="video-modal-content">
            <h3>تعديل الفيديو</h3>

            <div className="video-type-buttons">
              <button
                className={`video-type-btn ${editingVideo.type === 'text' ? 'active' : ''}`}
                onClick={() => setEditingVideo(prev => ({ ...prev, type: 'text' }))}
              >
                رابط
              </button>
              <button
                className={`video-type-btn ${editingVideo.type === 'file' ? 'active' : ''}`}
                onClick={() => setEditingVideo(prev => ({ ...prev, type: 'file' }))}
              >
                ملف
              </button>
            </div>

            <div className="video-form-field">
              <label>عنوان الفيديو:</label>
              <input
                type="text"
                value={editingVideo.title}
                onChange={(e) => setEditingVideo(prev => ({ ...prev, title: e.target.value }))}
                className="video-form-input"
              />
            </div>

            {editingVideo.type === 'text' && (
              <div className="video-form-field">
                <label>رابط الفيديو:</label>
                <input
                  type="text"
                  value={editingVideo.link}
                  onChange={(e) => setEditingVideo(prev => ({ ...prev, link: e.target.value }))}
                  className="video-form-input"
                />
              </div>
            )}

            {editingVideo.type === 'file' && (
              <div className="video-form-field">
                <label>اختر ملف الفيديو:</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setEditingVideo(prev => ({ ...prev, file: e.target.files[0] }))}
                  className="video-form-input"
                />
              </div>
            )}

            <div className="video-modal-buttons">
              <button
                onClick={() => handleUpdateVideo(editingVideo)}
                className="video-save-btn"
                disabled={!editingVideo.title || (!editingVideo.link && !editingVideo.file)}
              >
                حفظ
              </button>
              <button
                onClick={() => setEditingVideo(null)}
                className="video-cancel-btn"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;