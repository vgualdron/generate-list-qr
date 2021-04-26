import html2Canvas from 'html2canvas';
import JsPDF from 'jspdf';

export default {
  install(Vue, options) {
    Vue.prototype.getPdf = function (title, isShowPreviewFullTime) {
      html2Canvas(document.querySelector('#pdfDom'), {
        allowTaint: false,
        useCORS: true,
        x: 450,
        y: 30
      }).then(function (canvas) {
          let pageWidth = 595.28
          let pageHeight = canvas.height / (canvas.width / 592.28)
          let pageData = canvas.toDataURL('image/jpeg', 1.0)
          let PDF = new JsPDF('', 'pt', [pageWidth, pageHeight])
          PDF.addImage(pageData, 'JPEG', 0, 0, pageWidth, pageHeight)
          PDF.save(title + '.pdf')
        }
      )
    }
  }
}