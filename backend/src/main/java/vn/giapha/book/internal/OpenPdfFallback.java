package vn.giapha.book.internal;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.util.List;
import org.springframework.stereotype.Component;
import vn.giapha.domain.Chapter;

/** Fallback PDF khi không có pdf-render Playwright. */
@Component
public class OpenPdfFallback {
    public byte[] renderBook(String treeTitle, List<Chapter> chapters) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document doc = new Document();
            PdfWriter.getInstance(doc, out);
            doc.open();
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font hFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 11);
            doc.add(new Paragraph(treeTitle == null ? "Sách gia phả" : treeTitle, titleFont));
            doc.add(new Paragraph(" "));
            for (Chapter ch : chapters) {
                doc.add(new Paragraph(ch.getTitle() == null ? "Chương" : ch.getTitle(), hFont));
                String body = ch.getBodyHtml() == null ? "" : ch.getBodyHtml().replaceAll("<[^>]+>", " ").replace("&nbsp;", " ");
                doc.add(new Paragraph(body.strip(), bodyFont));
                doc.add(new Paragraph(" "));
            }
            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Không tạo được PDF: " + e.getMessage(), e);
        }
    }
}
