import './footer.css'
import { useTranslation } from 'react-i18next';


function Footer() {
    const { t } = useTranslation();
    return (
        <footer>
      <div className="footer-content">
        <div className="footer-bottom">
          <div className="copyright">
            {t('جميع الحقوق محفوظة')} &copy; {new Date().getFullYear()} {t('منافع - منصة تعليمية إسلامية')}
          </div>
        </div>
      </div>
    </footer>
    )
}

export default Footer