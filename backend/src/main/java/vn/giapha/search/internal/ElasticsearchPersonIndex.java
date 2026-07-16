package vn.giapha.search.internal;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import vn.giapha.search.api.PersonSuggestHit;

/**
 * Index + suggest Person trên Elasticsearch (REST).
 */
@Component
public class ElasticsearchPersonIndex {

    private static final Logger LOG = LoggerFactory.getLogger(ElasticsearchPersonIndex.class);

    private final SearchProperties properties;
    private final ObjectMapper objectMapper;
    private volatile Boolean available;
    private volatile RestClient client;

    public ElasticsearchPersonIndex(SearchProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    public boolean isAvailable() {
        if (!properties.elasticsearchConfigured()) {
            return false;
        }
        Boolean cached = available;
        if (cached != null) {
            return cached;
        }
        synchronized (this) {
            if (available != null) {
                return available;
            }
            try {
                RestClient c = client();
                c.get().uri("/").retrieve().toBodilessEntity();
                ensureIndex();
                available = true;
            } catch (Exception e) {
                LOG.warn("Elasticsearch không sẵn sàng — fallback PG FTS: {}", e.getMessage());
                available = false;
            }
            return available;
        }
    }

    public void index(PersonIndexDocument doc) {
        if (!properties.elasticsearchConfigured()) {
            return;
        }
        try {
            ensureIndex();
            ObjectNode body = objectMapper.createObjectNode();
            body.put("id", doc.id());
            body.put("code", nullToEmpty(doc.code()));
            body.put("fullName", nullToEmpty(doc.fullName()));
            body.put("tenHuy", nullToEmpty(doc.tenHuy()));
            body.put("tenThuong", nullToEmpty(doc.tenThuong()));
            body.put("fold", nullToEmpty(doc.fold()));
            body.put("treeSlug", nullToEmpty(doc.treeSlug()));
            if (doc.generation() != null) {
                body.put("generation", doc.generation());
            }
            body.put("lifeStatus", nullToEmpty(doc.lifeStatus()));

            client()
                .put()
                .uri("/{index}/_doc/{id}", properties.getIndex(), doc.id())
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toBodilessEntity();
            available = true;
        } catch (Exception e) {
            LOG.warn("ES index person {} thất bại: {}", doc.id(), e.getMessage());
            available = false;
        }
    }

    public void delete(Long personId) {
        if (!properties.elasticsearchConfigured() || personId == null) {
            return;
        }
        try {
            client()
                .delete()
                .uri("/{index}/_doc/{id}", properties.getIndex(), personId)
                .retrieve()
                .toBodilessEntity();
        } catch (Exception e) {
            LOG.debug("ES delete person {} — {}", personId, e.getMessage());
        }
    }

    public List<PersonSuggestHit> suggest(String treeSlug, String foldedQuery, int limit) {
        if (!isAvailable() || foldedQuery.isBlank()) {
            return List.of();
        }
        try {
            ObjectNode root = objectMapper.createObjectNode();
            root.put("size", limit);
            ObjectNode bool = root.putObject("query").putObject("bool");
            bool.putArray("filter").addObject().putObject("term").put("treeSlug", treeSlug);
            ObjectNode multi = bool.putArray("must").addObject().putObject("multi_match");
            multi.put("query", foldedQuery);
            multi.putArray("fields").add("fold").add("code").add("fullName").add("tenHuy").add("tenThuong");
            multi.put("type", "bool_prefix");

            JsonNode response = client()
                .post()
                .uri("/{index}/_search", properties.getIndex())
                .contentType(MediaType.APPLICATION_JSON)
                .body(root)
                .retrieve()
                .body(JsonNode.class);

            return mapHits(response);
        } catch (RestClientException e) {
            LOG.warn("ES suggest lỗi — fallback FTS: {}", e.getMessage());
            available = false;
            return List.of();
        }
    }

    private List<PersonSuggestHit> mapHits(JsonNode response) {
        List<PersonSuggestHit> out = new ArrayList<>();
        if (response == null) {
            return out;
        }
        JsonNode hits = response.path("hits").path("hits");
        if (!hits.isArray()) {
            return out;
        }
        for (JsonNode hit : hits) {
            JsonNode src = hit.path("_source");
            out.add(
                new PersonSuggestHit(
                    src.path("id").asLong(),
                    text(src, "code"),
                    text(src, "fullName"),
                    text(src, "treeSlug"),
                    src.path("generation").isMissingNode() || src.path("generation").isNull()
                        ? null
                        : src.path("generation").asInt(),
                    text(src, "lifeStatus")
                )
            );
        }
        return out;
    }

    private void ensureIndex() {
        try {
            var head = client().head().uri("/{index}", properties.getIndex()).retrieve().toBodilessEntity();
            if (head.getStatusCode().is2xxSuccessful()) {
                return;
            }
        } catch (RestClientException ignored) {
            // create
        }
        ObjectNode body = objectMapper.createObjectNode();
        ObjectNode settings = body.putObject("settings").putObject("analysis");
        ObjectNode analyzer = settings.putObject("analyzer").putObject("vi_folded");
        analyzer.put("tokenizer", "standard");
        ArrayNode filters = analyzer.putArray("filter");
        filters.add("lowercase");
        filters.add("asciifolding");

        ObjectNode props = body.putObject("mappings").putObject("properties");
        props.putObject("id").put("type", "long");
        props.putObject("code").put("type", "keyword");
        textField(props, "fullName");
        textField(props, "tenHuy");
        textField(props, "tenThuong");
        textField(props, "fold");
        props.putObject("treeSlug").put("type", "keyword");
        props.putObject("generation").put("type", "integer");
        props.putObject("lifeStatus").put("type", "keyword");

        client()
            .put()
            .uri("/{index}", properties.getIndex())
            .contentType(MediaType.APPLICATION_JSON)
            .body(body)
            .retrieve()
            .toBodilessEntity();
        LOG.info("Đã tạo index ES {}", properties.getIndex());
    }

    private static void textField(ObjectNode props, String name) {
        ObjectNode f = props.putObject(name);
        f.put("type", "text");
        f.put("analyzer", "vi_folded");
        f.put("search_analyzer", "vi_folded");
    }

    private RestClient client() {
        RestClient c = client;
        if (c == null) {
            synchronized (this) {
                if (client == null) {
                    client = RestClient.builder().baseUrl(properties.getElasticsearchUrl().replaceAll("/$", "")).build();
                }
                c = client;
            }
        }
        return c;
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s;
    }

    private static String text(JsonNode src, String field) {
        return Optional.ofNullable(src.get(field)).map(JsonNode::asText).orElse("");
    }
}
