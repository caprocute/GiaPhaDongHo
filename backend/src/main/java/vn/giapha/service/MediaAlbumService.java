package vn.giapha.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.MediaAlbum;
import vn.giapha.repository.MediaAlbumRepository;
import vn.giapha.service.dto.MediaAlbumDTO;
import vn.giapha.service.mapper.MediaAlbumMapper;

/**
 * Service Implementation for managing {@link vn.giapha.domain.MediaAlbum}.
 */
@Service
@Transactional
public class MediaAlbumService {

    private static final Logger LOG = LoggerFactory.getLogger(MediaAlbumService.class);

    private final MediaAlbumRepository mediaAlbumRepository;

    private final MediaAlbumMapper mediaAlbumMapper;

    public MediaAlbumService(MediaAlbumRepository mediaAlbumRepository, MediaAlbumMapper mediaAlbumMapper) {
        this.mediaAlbumRepository = mediaAlbumRepository;
        this.mediaAlbumMapper = mediaAlbumMapper;
    }

    /**
     * Save a mediaAlbum.
     *
     * @param mediaAlbumDTO the entity to save.
     * @return the persisted entity.
     */
    public MediaAlbumDTO save(MediaAlbumDTO mediaAlbumDTO) {
        LOG.debug("Request to save MediaAlbum : {}", mediaAlbumDTO);
        MediaAlbum mediaAlbum = mediaAlbumMapper.toEntity(mediaAlbumDTO);
        mediaAlbum = mediaAlbumRepository.save(mediaAlbum);
        return mediaAlbumMapper.toDto(mediaAlbum);
    }

    /**
     * Update a mediaAlbum.
     *
     * @param mediaAlbumDTO the entity to save.
     * @return the persisted entity.
     */
    public MediaAlbumDTO update(MediaAlbumDTO mediaAlbumDTO) {
        LOG.debug("Request to update MediaAlbum : {}", mediaAlbumDTO);
        MediaAlbum mediaAlbum = mediaAlbumMapper.toEntity(mediaAlbumDTO);
        mediaAlbum = mediaAlbumRepository.save(mediaAlbum);
        return mediaAlbumMapper.toDto(mediaAlbum);
    }

    /**
     * Partially update a mediaAlbum.
     *
     * @param mediaAlbumDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<MediaAlbumDTO> partialUpdate(MediaAlbumDTO mediaAlbumDTO) {
        LOG.debug("Request to partially update MediaAlbum : {}", mediaAlbumDTO);

        return mediaAlbumRepository
            .findById(mediaAlbumDTO.getId())
            .map(existingMediaAlbum -> {
                mediaAlbumMapper.partialUpdate(existingMediaAlbum, mediaAlbumDTO);

                return existingMediaAlbum;
            })
            .map(mediaAlbumRepository::save)
            .map(mediaAlbumMapper::toDto);
    }

    /**
     * Get all the mediaAlbums.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<MediaAlbumDTO> findAll() {
        LOG.debug("Request to get all MediaAlbums");
        return mediaAlbumRepository.findAll().stream().map(mediaAlbumMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one mediaAlbum by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<MediaAlbumDTO> findOne(Long id) {
        LOG.debug("Request to get MediaAlbum : {}", id);
        return mediaAlbumRepository.findById(id).map(mediaAlbumMapper::toDto);
    }

    /**
     * Delete the mediaAlbum by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete MediaAlbum : {}", id);
        mediaAlbumRepository.deleteById(id);
    }
}
