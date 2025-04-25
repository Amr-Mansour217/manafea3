import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import Header from './header';
import Footer from './footer';
import './rehla.css';

const Rehla = () => {
  const { t, i18n } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [content, setContent] = useState(() => {
    const saved = localStorage.getItem('rehlaContent');
    return saved ? JSON.parse(saved) : {
      videoUrl: 'https://www.youtube.com/embed/default-video-id',
      sections: []
    };
  });
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [modalType, setModalType] = useState('');
  const [textStyle, setTextStyle] = useState({
    fontSize: '16px',
    color: '#000000',
    fontWeight: 'normal'
  });

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    setIsAdmin(!!adminToken);
  }, []);

  useEffect(() => {
    localStorage.setItem('rehlaContent', JSON.stringify(content));
  }, [content]);

  const handleVideoChange = () => {
    setTempValue(content.videoUrl);
    setShowVideoModal(true);
  };

  const handleSaveVideo = () => {
    setContent({ ...content, videoUrl: tempValue });
    setShowVideoModal(false);
    setTempValue('');
  };

  const addSection = (type) => {
    const newSection = {
      id: Date.now(),
      type,
      content: type === 'text' ? 'أدخل النص هنا' : '',
      imageUrl: type === 'image' ? 'رابط الصورة' : '',
      style: {
        fontSize: '18px',
        color: '#000000',
        fontWeight: 'normal'
      }
    };
    setContent({
      ...content,
      sections: [...content.sections, newSection]
    });
  };

  const updateSection = (id, newContent) => {
    setContent({
      ...content,
      sections: content.sections.map(section =>
        section.id === id ? { ...section, ...newContent } : section
      )
    });
  };

  const deleteSection = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      setContent({
        ...content,
        sections: content.sections.filter(section => section.id !== id)
      });
    }
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setTempValue(section.type === 'text' ? section.content : section.imageUrl);
    setTextStyle(section.style || { fontSize: '16px', color: '#000000', fontWeight: 'normal' });
    setModalType(section.type);
    setShowEditModal(true);
  };

  const handleSaveSection = () => {
    updateSection(editingSection.id, {
      [modalType === 'text' ? 'content' : 'imageUrl']: tempValue,
      style: textStyle
    });
    setShowEditModal(false);
    setEditingSection(null);
    setTempValue('');
  };

  return (
    <>
      <Header />
      <div className="rehla-container">
        <div className="video-section">
          <iframe
            src={content.videoUrl}
            title="Featured Video"
            frameBorder="0"
            allowFullScreen
          />
          {isAdmin && (
            <button className="edit-btn" onClick={handleVideoChange}>
              <FontAwesomeIcon icon={faPenToSquare} />
              تغيير الفيديو
            </button>
          )}
        </div>

        {content.sections.map((section) => (
          <div key={section.id} className="content-section">
            {section.type === 'text' ? (
              <div className="text-content" style={section.style}>
                {editMode ? (
                  <textarea
                    value={section.content}
                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                    style={section.style}
                  />
                ) : (
                  <p style={section.style}>{section.content}</p>
                )}
              </div>
            ) : (
              <div className="image-content">
                <img src={section.imageUrl} alt="" />
                {editMode && (
                  <input
                    type="text"
                    value={section.imageUrl}
                    onChange={(e) => updateSection(section.id, { imageUrl: e.target.value })}
                    placeholder="رابط الصورة"
                  />
                )}
              </div>
            )}
            {isAdmin && (
              <div className="section-controls">
                <FontAwesomeIcon
                  icon={faEdit}
                  onClick={() => handleEditSection(section)}
                />
                <FontAwesomeIcon
                  icon={faTrash}
                  onClick={() => deleteSection(section.id)}
                />
              </div>
            )}
          </div>
        ))}

        {isAdmin && (
          <div className="add-section-controls">
            <button onClick={() => addSection('text')}>إضافة نص</button>
            <button onClick={() => addSection('image')}>إضافة صورة</button>
          </div>
        )}
      </div>

      {showVideoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>تعديل رابط الفيديو</h3>
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder="أدخل رابط الفيديو"
              className="modal-input"
            />
            <div className="modal-buttons">
              <button onClick={handleSaveVideo} className="save-btn">حفظ</button>
              <button onClick={() => setShowVideoModal(false)} className="cancel-btn">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{modalType === 'text' ? 'تعديل النص' : 'تعديل رابط الصورة'}</h3>
            {modalType === 'text' ? (
              <div className="text-editor">
                <div className="formatting-controls">
                  <div className="format-group">
                    <label>حجم الخط:</label>
                    <select 
                      value={textStyle.fontSize}
                      onChange={(e) => setTextStyle({...textStyle, fontSize: e.target.value})}
                    >
                      <option value="16px">صغير</option>
                      <option value="18px">عادي</option>
                      <option value="22px">كبير</option>
                      <option value="26px">كبير جداً</option>
                      <option value="32px">ضخم</option>
                    </select>
                  </div>
                  <div className="format-group">
                    <label>سُمك الخط:</label>
                    <select 
                      value={textStyle.fontWeight}
                      onChange={(e) => setTextStyle({...textStyle, fontWeight: e.target.value})}
                    >
                      <option value="normal">عادي</option>
                      <option value="500">متوسط</option>
                      <option value="600">سميك</option>
                      <option value="bold">غامق</option>
                    </select>
                  </div>
                  <div className="format-group">
                    <label>لون الخط:</label>
                    <input 
                      type="color"
                      value={textStyle.color}
                      onChange={(e) => setTextStyle({...textStyle, color: e.target.value})}
                    />
                  </div>
                </div>
                <textarea
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  placeholder="أدخل النص"
                  className="modal-textarea"
                  style={textStyle}
                />
              </div>
            ) : (
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                placeholder="أدخل رابط الصورة"
                className="modal-input"
              />
            )}
            <div className="modal-buttons">
              <button onClick={handleSaveSection} className="save-btn">حفظ</button>
              <button onClick={() => setShowEditModal(false)} className="cancel-btn">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Rehla;
