import React, { useState } from 'react';

function RamadanPopup() {
    const [isVisible, setIsVisible] = useState(true);
    
    React.useEffect(() => {
      // التحقق مما إذا كان المستخدم قد زار الموقع من قبل
      const hasVisited = localStorage.getItem('hasVisitedBefore');
      
      if (!hasVisited) {
        // إذا كانت هذه هي الزيارة الأولى، أظهر النافذة المنبثقة
        setIsVisible(true);
        
        // تعيين علامة في التخزين المحلي لتتبع زيارة المستخدم
        localStorage.setItem('hasVisitedBefore', 'true');
        
        // إخفاء النافذة المنبثقة بعد 8 ثوانٍ
        const timer = setTimeout(() => {
            setIsVisible(false);
          }, 8000);
          
          // تنظيف المؤقت عند إلغاء تحميل المكون
          return () => clearTimeout(timer);
        } else {
          setIsVisible(false);
        }
      }, []);
  
    // إذا لم تكن النافذة المنبثقة مرئية، لا تعرض شيئًا
    if (!isVisible) return null;
  
    return (
        <div className="ramadan-popup-overlay">
        <div className="ramadan-popup">
          <div className="ramadan-popup-content">
            <div className="ramadan-popup-header">
              <h2>رمضان كريم</h2>
              <button 
                className="close-button" 
                onClick={() => setIsVisible(false)}
              >
                ×
              </button>
            </div>
            <div className="ramadan-popup-body">
              <div className="ramadan-icon">
                <i className="fas fa-moon"></i>
              </div>
              <p>أهلاً بك في منافع للعلوم الإسلامية</p>
              <p>نتمنى لك شهر رمضان مبارك مليء بالخير والبركات</p>
              <p>استفد من دروسنا ومحاضراتنا الخاصة بشهر رمضان المبارك</p>
            </div>
            <div className="ramadan-popup-footer">
              <button 
                className="ramadan-button" 
                onClick={() => setIsVisible(false)}
              >
                استكشف المحتوى الرمضاني
              </button>
            </div>
          </div>
        </div>
        <style jsx>{`
          .ramadan-popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.5s ease-in-out;
          }
  
          .ramadan-popup {
            background-color: #1e3a5f;
            border-radius: 15px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            position: relative;
            animation: slideIn 0.5s ease-in-out;
            border: 2px solid #f8c12c;
          }
  
          .ramadan-popup-content {
            padding: 20px;
            text-align: center;
            direction: rtl;
          }
  
          .ramadan-popup-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #f8c12c;
            padding-bottom: 10px;
          }
  
          .ramadan-popup-header h2 {
            color: #f8c12c;
            margin: 0;
            font-size: 24px;
            font-weight: bold;
          }
  
          .close-button {
            background: none;
            border: none;
            color: #ffffff;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            line-height: 1;
          }
  
          .ramadan-popup-body {
            margin-bottom: 20px;
          }
  
          .ramadan-popup-body p {
            color: #ffffff;
            margin: 10px 0;
            font-size: 16px;
            line-height: 1.5;
          }
  
          .ramadan-icon {
            margin: 10px auto;
            width: 80px;
            height: 80px;
            background-color: #f8c12c;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 40px;
            color: #1e3a5f;
          }
  
          .ramadan-popup-footer {
            margin-top: 20px;
          }
  
          .ramadan-button {
            background-color: #f8c12c;
            color: #1e3a5f;
            border: none;
            padding: 10px 20px;
            border-radius: 30px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
          }
  
          .ramadan-button:hover {
            background-color: #ffffff;
            transform: scale(1.05);
          }
  
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
  
          @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }
  
  export default RamadanPopup;