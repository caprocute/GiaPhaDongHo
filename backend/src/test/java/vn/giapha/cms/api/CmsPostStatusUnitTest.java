package vn.giapha.cms.api;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CmsPostStatusUnitTest {

    @Test
    void publishedCheckIsCaseInsensitive() {
        assertThat(CmsPostStatus.isPublished("published")).isTrue();
        assertThat(CmsPostStatus.isPublished("PUBLISHED")).isTrue();
        assertThat(CmsPostStatus.isPublished("draft")).isFalse();
        assertThat(CmsPostStatus.isPublished(null)).isFalse();
    }
}
