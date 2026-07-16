package vn.giapha.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.MediaPhoto;
import vn.giapha.repository.MediaPhotoRepository;
import vn.giapha.service.dto.MediaPhotoDTO;
import vn.giapha.service.mapper.MediaPhotoMapper;

/**
 * Service Implementation for managing {@link vn.giapha.domain.MediaPhoto}.
 */
@Service
@Transactional
public class MediaPhotoService {

    private static final Logger LOG = LoggerFactory.getLogger(MediaPhotoService.class);

    private final MediaPhotoRepository mediaPhotoRepository;

    private final MediaPhotoMapper mediaPhotoMapper;

    public MediaPhotoService(MediaPhotoRepository mediaPhotoRepository, MediaPhotoMapper mediaPhotoMapper) {
        this.mediaPhotoRepository = mediaPhotoRepository;
        this.mediaPhotoMapper = mediaPhotoMapper;
    }

    /**
     * Save a mediaPhoto.
     *
     * @param mediaPhotoDTO the entity to save.
     * @return the persisted entity.
     */
    public MediaPhotoDTO save(MediaPhotoDTO mediaPhotoDTO) {
        LOG.debug("Request to save MediaPhoto : {}", mediaPhotoDTO);
        MediaPhoto mediaPhoto = mediaPhotoMapper.toEntity(mediaPhotoDTO);
        mediaPhoto = mediaPhotoRepository.save(mediaPhoto);
        return mediaPhotoMapper.toDto(mediaPhoto);
    }

    /**
     * Update a mediaPhoto.
     *
     * @param mediaPhotoDTO the entity to save.
     * @return the persisted entity.
     */
    public MediaPhotoDTO update(MediaPhotoDTO mediaPhotoDTO) {
        LOG.debug("Request to update MediaPhoto : {}", mediaPhotoDTO);
        MediaPhoto mediaPhoto = mediaPhotoMapper.toEntity(mediaPhotoDTO);
        mediaPhoto = mediaPhotoRepository.save(mediaPhoto);
        return mediaPhotoMapper.toDto(mediaPhoto);
    }

    /**
     * Partially update a mediaPhoto.
     *
     * @param mediaPhotoDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<MediaPhotoDTO> partialUpdate(MediaPhotoDTO mediaPhotoDTO) {
        LOG.debug("Request to partially update MediaPhoto : {}", mediaPhotoDTO);

        return mediaPhotoRepository
            .findById(mediaPhotoDTO.getId())
            .map(existingMediaPhoto -> {
                mediaPhotoMapper.partialUpdate(existingMediaPhoto, mediaPhotoDTO);

                return existingMediaPhoto;
            })
            .map(mediaPhotoRepository::save)
            .map(mediaPhotoMapper::toDto);
    }

    /**
     * Get all the mediaPhotos.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<MediaPhotoDTO> findAll() {
        LOG.debug("Request to get all MediaPhotos");
        return mediaPhotoRepository.findAll().stream().map(mediaPhotoMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get all the mediaPhotos with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<MediaPhotoDTO> findAllWithEagerRelationships(Pageable pageable) {
        return mediaPhotoRepository.findAllWithEagerRelationships(pageable).map(mediaPhotoMapper::toDto);
    }

    /**
     * Get one mediaPhoto by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<MediaPhotoDTO> findOne(Long id) {
        LOG.debug("Request to get MediaPhoto : {}", id);
        return mediaPhotoRepository.findOneWithEagerRelationships(id).map(mediaPhotoMapper::toDto);
    }

    /**
     * Delete the mediaPhoto by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete MediaPhoto : {}", id);
        mediaPhotoRepository.deleteById(id);
    }
}
