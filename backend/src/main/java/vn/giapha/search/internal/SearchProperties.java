package vn.giapha.search.internal;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "giapha.search")
public class SearchProperties {

    /** URL Elasticsearch (rỗng = tắt ES, dùng PG FTS). */
    private String elasticsearchUrl = "";

    private String index = "person_v1";

    private int suggestDefaultLimit = 10;

    private int suggestMaxLimit = 25;

    public String getElasticsearchUrl() {
        return elasticsearchUrl;
    }

    public void setElasticsearchUrl(String elasticsearchUrl) {
        this.elasticsearchUrl = elasticsearchUrl;
    }

    public String getIndex() {
        return index;
    }

    public void setIndex(String index) {
        this.index = index;
    }

    public int getSuggestDefaultLimit() {
        return suggestDefaultLimit;
    }

    public void setSuggestDefaultLimit(int suggestDefaultLimit) {
        this.suggestDefaultLimit = suggestDefaultLimit;
    }

    public int getSuggestMaxLimit() {
        return suggestMaxLimit;
    }

    public void setSuggestMaxLimit(int suggestMaxLimit) {
        this.suggestMaxLimit = suggestMaxLimit;
    }

    public boolean elasticsearchConfigured() {
        return elasticsearchUrl != null && !elasticsearchUrl.isBlank();
    }
}
