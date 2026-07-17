package vn.giapha.book.internal;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "giapha.book")
public class BookProperties {
    /** URL service pdf-render (Playwright). Rỗng = fallback OpenPDF trong BE. */
    private String pdfRenderUrl = "";
    private String exportPrefix = "exports";

    public String getPdfRenderUrl() { return pdfRenderUrl; }
    public void setPdfRenderUrl(String pdfRenderUrl) { this.pdfRenderUrl = pdfRenderUrl; }
    public String getExportPrefix() { return exportPrefix; }
    public void setExportPrefix(String exportPrefix) { this.exportPrefix = exportPrefix; }
}
