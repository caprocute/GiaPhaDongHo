package vn.giapha.config;

import io.minio.MinioClient;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.giapha.media.internal.ImgproxyProperties;
import vn.giapha.media.internal.MinioProperties;

/** Bean MinioClient + enable ConfigurationProperties cho module media. */
@Configuration
@EnableConfigurationProperties({ MinioProperties.class, ImgproxyProperties.class })
public class MinioConfig {

    @Bean
    public MinioClient minioClient(MinioProperties props) {
        return MinioClient.builder()
            .endpoint(props.getEndpoint())
            .credentials(props.getAccessKey(), props.getSecretKey())
            .build();
    }
}
