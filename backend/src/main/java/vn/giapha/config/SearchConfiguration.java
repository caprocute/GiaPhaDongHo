package vn.giapha.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import vn.giapha.search.internal.SearchProperties;

@Configuration
@EnableConfigurationProperties(SearchProperties.class)
public class SearchConfiguration {}
