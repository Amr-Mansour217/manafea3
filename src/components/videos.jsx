import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import axios from 'axios';
import './videos.css';
import Header from './header';
import Footer from './footer';

const Videos = () => {
  const { t } = useTranslation();
  const [videos, setVideos] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [secondHeader, setSecondHeader] = useState('');
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [newVideoData, setNewVideoData] = useState({ title: '', link: '', type: '', file: null });
  const [editingVideo, setEditingVideo] = useState(null);

  // فحص إذا كان المستخدم مشرف
  useEffect(() => {
    const checkAdmin = () => {
      const token = localStorage.getItem('adminToken');
      setIsAdmin(!!token);
    };
    checkAdmin();
  }, []);

  // جلب الفيديوهات من الباك إند
  const fetchVideos = async () => {
    try {
      const response = await axios.get(
        `https://elmanafea.shop/videos?lang=${i18n.language}&category=${currentCategory || ''}`
      );

      if (response.data.videos) {
        // ترتيب الفيديوهات حسب الكاتيجوري
        const formattedVideos = response.data.videos
          .map(video => ({
            id: video._id,
            title: video.title,
            category: video.category,
            videoType: video.videoType,
            link: video.videoType === 'embed' ? video.videoEmbedUrl : video.videoPath
          }))
          .sort((a, b) => a.category.localeCompare(b.category));
          
        setVideos(formattedVideos);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [currentCategory, i18n.language]);

  // رفع فيديو جديد
  const handleAddVideo = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newVideoData.title);
      formData.append('lang', i18n.language);
      formData.append('category', currentCategory);
      formData.append('videoType', newVideoData.type === 'link' ? 'embed' : 'upload');

      if (newVideoData.type === 'link') {
        formData.append('youtubeEmbedUrl', newVideoData.link);
      } else if (newVideoData.file) {
        formData.append('video', newVideoData.file);
      }

      const response = await axios.post(
        'https://elmanafea.shop/admin/uploadvideo',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        await fetchVideos();
        setShowAddVideoModal(false);
        setNewVideoData({ title: '', link: '', type: '', file: null });
      }
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  // تعديل فيديو
  const handleUpdateVideo = async (videoData) => {
    try {
      const formData = new FormData();
      formData.append('title', videoData.title);
      formData.append('lang', i18n.language);
      formData.append('category', currentCategory);
      formData.append('videoType', videoData.type === 'text' ? 'embed' : 'upload');

      if (videoData.type === 'text') {
        formData.append('youtubeEmbedUrl', videoData.link);
      } else if (videoData.file) {
        formData.append('video', videoData.file);
      }

      const response = await axios.post(
        'https://elmanafea.shop/admin/uploadvideo',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        await fetchVideos();
        setEditingVideo(null);
      }
    } catch (error) {
      console.error('Error updating video:', error);
    }
  };

  // حذف فيديو
  const handleDeleteVideo = async (videoId) => {
    try {
      await axios.delete(
        `https://elmanafea.shop/admin/deletevideo/${videoId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      await fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  const renderVideoContent = (video) => {
    if (video.videoType === 'embed') {
      return (
        <iframe
          width="100%"
          height="100%"
          src={video.link}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
    } else {
      return (
        <video controls width="100%" height="100%">
          <source src={video.link} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }
  };

  // تصنيف الفيديوهات حسب الكاتيجوري
  const videosByCategory = videos.reduce((acc, video) => {
    if (!acc[video.category]) {
      acc[video.category] = [];
    }
    acc[video.category].push(video);
    return acc;
  }, {});

  return (
    <>
      <Header />
      <div className="videos-page">
        <div className="video-header">
          <h1>{t('عنوان الفيديو الرئيسي')}</h1>
          {isAdmin && (
            <button 
              className="add-video-btn"
              onClick={() => setShowAddVideoModal(true)}
            >
              {t('إضافة فيديو')}
            </button>
          )}
        </div>

        {Object.entries(videosByCategory).map(([category, categoryVideos]) => (
          <div key={category} className="video-category-section">
            <h2>{category}</h2>
            <div className="video-grid">
              {categoryVideos.map((video) => (
                <div className="video-item" key={video.id}>
                  <div className="video-item-container">
                    {isAdmin && (
                      <div className="video-item-actions">
                        <button
                          className="edit-btn"
                          onClick={() => setEditingVideo(video)}
                        >
                          {t('تعديل')}
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteVideo(video.id)}
                        >
                          {t('حذف')}
                        </button>
                      </div>
                    )}
                    {renderVideoContent(video)}
                  </div>
                  <div className="video-item-info">
                    <h3 className="video-item-title">{video.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {showAddVideoModal && (
          <div className="video-modal">
            <div className="video-modal-content">
              <h3>{t('إضافة فيديو جديد')}</h3>
              <input
                type="text"
                placeholder={t('عنوان الفيديو')}
                value={newVideoData.title}
                onChange={(e) => setNewVideoData({ ...newVideoData, title: e.target.value })}
              />
              <div className="video-type-selector">
                <button
                  className={newVideoData.type === 'link' ? 'active' : ''}
                  onClick={() => setNewVideoData({ ...newVideoData, type: 'link' })}
                >
                  {t('رابط يوتيوب')}
                </button>
                <button
                  className={newVideoData.type === 'file' ? 'active' : ''}
                  onClick={() => setNewVideoData({ ...newVideoData, type: 'file' })}
                >
                  {t('ملف فيديو')}
                </button>
              </div>
              {newVideoData.type === 'link' ? (
                <input
                  type="text"
                  placeholder={t('رابط الفيديو')}
                  value={newVideoData.link}
                  onChange={(e) => setNewVideoData({ ...newVideoData, link: e.target.value })}
                />
              ) : (
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setNewVideoData({ ...newVideoData, file: e.target.files[0] })}
                />
              )}
              <div className="modal-buttons">
                <button onClick={handleAddVideo}>{t('إضافة')}</button>
                <button onClick={() => setShowAddVideoModal(false)}>{t('إلغاء')}</button>
              </div>
            </div>
          </div>
        )}

        {editingVideo && (
          <div className="video-modal">
            <div className="video-modal-content">
              <h3>{t('تعديل الفيديو')}</h3>
              <input
                type="text"
                value={editingVideo.title}
                onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
              />
              <div className="video-type-selector">
                <button
                  className={editingVideo.type === 'text' ? 'active' : ''}
                  onClick={() => setEditingVideo({ ...editingVideo, type: 'text' })}
                >
                  {t('رابط يوتيوب')}
                </button>
                <button
                  className={editingVideo.type === 'file' ? 'active' : ''}
                  onClick={() => setEditingVideo({ ...editingVideo, type: 'file' })}
                >
                  {t('ملف فيديو')}
                </button>
              </div>
              {editingVideo.type === 'text' ? (
                <input
                  type="text"
                  value={editingVideo.link}
                  onChange={(e) => setEditingVideo({ ...editingVideo, link: e.target.value })}
                />
              ) : (
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setEditingVideo({ ...editingVideo, file: e.target.files[0] })}
                />
              )}
              <div className="modal-buttons">
                <button onClick={() => handleUpdateVideo(editingVideo)}>{t('حفظ')}</button>
                <button onClick={() => setEditingVideo(null)}>{t('إلغاء')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Videos;