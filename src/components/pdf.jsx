import './pdf.css'; // تأكد من إنشاء هذا الملف

function Pdf() {
  return (
    <>
      <div className="pdf-container">
        <embed 
          src= "{ArQuran}" 
          type="application/pdf" 
          width="100%" 
          height="100%" 
          className="pdf-embed"
        />
      </div>
      <div className="pdf-container">
        <embed 
          src= "djd"
          type="application/pdf" 
          width="100%" 
          height="100%" 
          className="pdf-embed"
        />
      </div>
    </>
  )
}

export default Pdf
