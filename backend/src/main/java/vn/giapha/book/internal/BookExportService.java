package vn.giapha.book.internal;

import java.io.ByteArrayInputStream;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.Chapter;
import vn.giapha.domain.FamilyTree;
import vn.giapha.media.internal.MinioStorageService;
import vn.giapha.repository.ChapterRepository;
import vn.giapha.repository.FamilyTreeRepository;

@Service
@Transactional(readOnly = true)
public class BookExportService {

    private final FamilyTreeRepository familyTreeRepository;
    private final ChapterRepository chapterRepository;
    private final PdfRenderClient pdfRenderClient;
    private final OpenPdfFallback openPdfFallback;
    private final MinioStorageService minioStorageService;
    private final BookProperties props;

    public BookExportService(
        FamilyTreeRepository familyTreeRepository,
        ChapterRepository chapterRepository,
        PdfRenderClient pdfRenderClient,
        OpenPdfFallback openPdfFallback,
        MinioStorageService minioStorageService,
        BookProperties props
    ) {
        this.familyTreeRepository = familyTreeRepository;
        this.chapterRepository = chapterRepository;
        this.pdfRenderClient = pdfRenderClient;
        this.openPdfFallback = openPdfFallback;
        this.minioStorageService = minioStorageService;
        this.props = props;
    }

    public Map<String, Object> exportBook(String slug) {
        FamilyTree tree = familyTreeRepository.findBySlug(slug).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy cây"));
        List<Chapter> chapters = chapterRepository.findByTree_SlugOrderByIdAsc(slug);
        if (chapters.isEmpty()) {
            throw new IllegalArgumentException("Chưa có chương (Chapter) để xuất");
        }
        String title = tree.getBranchName() != null ? tree.getBranchName() : ("Họ " + (tree.getSurname() == null ? slug : tree.getSurname()));
        String html = buildHtml(title, chapters);
        byte[] pdf = pdfRenderClient.renderHtml(html).orElseGet(() -> openPdfFallback.renderBook(title, chapters));
        String key = props.getExportPrefix() + "/" + slug + "/" + Instant.now().getEpochSecond() + "-" + UUID.randomUUID() + ".pdf";
        minioStorageService.upload(key, new ByteArrayInputStream(pdf), pdf.length, "application/pdf");
        String url = minioStorageService.presignedGetUrl(key);
        Map<String, Object> m = new HashMap<>();
        m.put("objectKey", key);
        m.put("downloadUrl", url);
        m.put("bytes", pdf.length);
        m.put("chapters", chapters.size());
        m.put("engine", props.getPdfRenderUrl() == null || props.getPdfRenderUrl().isBlank() ? "openpdf" : "playwright-or-fallback");
        return m;
    }

    static String buildHtml(String title, List<Chapter> chapters) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset=\"utf-8\"/><title>")
            .append(esc(title))
            .append("</title><style>body{font-family:serif;max-width:40rem;margin:2rem auto}h1{text-align:center}h2{margin-top:2rem;border-bottom:1px solid #ccc}</style></head><body>");
        sb.append("<h1>").append(esc(title)).append("</h1><p style=\"text-align:center\">Sách gia phả — GiaPhaHub</p>");
        for (Chapter ch : chapters) {
            sb.append("<h2>").append(esc(ch.getTitle())).append("</h2>");
            sb.append(ch.getBodyHtml() == null ? "<p></p>" : ch.getBodyHtml());
        }
        sb.append("</body></html>");
        return sb.toString();
    }

    private static String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
