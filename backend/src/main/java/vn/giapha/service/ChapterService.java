package vn.giapha.service;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.Chapter;
import vn.giapha.repository.ChapterRepository;
import vn.giapha.service.dto.ChapterDTO;
import vn.giapha.service.mapper.ChapterMapper;

/**
 * Service Implementation for managing {@link vn.giapha.domain.Chapter}.
 */
@Service
@Transactional
public class ChapterService {

    private static final Logger LOG = LoggerFactory.getLogger(ChapterService.class);

    private final ChapterRepository chapterRepository;

    private final ChapterMapper chapterMapper;

    public ChapterService(ChapterRepository chapterRepository, ChapterMapper chapterMapper) {
        this.chapterRepository = chapterRepository;
        this.chapterMapper = chapterMapper;
    }

    /**
     * Save a chapter.
     *
     * @param chapterDTO the entity to save.
     * @return the persisted entity.
     */
    public ChapterDTO save(ChapterDTO chapterDTO) {
        LOG.debug("Request to save Chapter : {}", chapterDTO);
        Chapter chapter = chapterMapper.toEntity(chapterDTO);
        chapter = chapterRepository.save(chapter);
        return chapterMapper.toDto(chapter);
    }

    /**
     * Update a chapter.
     *
     * @param chapterDTO the entity to save.
     * @return the persisted entity.
     */
    public ChapterDTO update(ChapterDTO chapterDTO) {
        LOG.debug("Request to update Chapter : {}", chapterDTO);
        Chapter chapter = chapterMapper.toEntity(chapterDTO);
        chapter = chapterRepository.save(chapter);
        return chapterMapper.toDto(chapter);
    }

    /**
     * Partially update a chapter.
     *
     * @param chapterDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ChapterDTO> partialUpdate(ChapterDTO chapterDTO) {
        LOG.debug("Request to partially update Chapter : {}", chapterDTO);

        return chapterRepository
            .findById(chapterDTO.getId())
            .map(existingChapter -> {
                chapterMapper.partialUpdate(existingChapter, chapterDTO);

                return existingChapter;
            })
            .map(chapterRepository::save)
            .map(chapterMapper::toDto);
    }

    /**
     * Get all the chapters.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<ChapterDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Chapters");
        return chapterRepository.findAll(pageable).map(chapterMapper::toDto);
    }

    /**
     * Get all the chapters with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<ChapterDTO> findAllWithEagerRelationships(Pageable pageable) {
        return chapterRepository.findAllWithEagerRelationships(pageable).map(chapterMapper::toDto);
    }

    /**
     * Get one chapter by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ChapterDTO> findOne(Long id) {
        LOG.debug("Request to get Chapter : {}", id);
        return chapterRepository.findOneWithEagerRelationships(id).map(chapterMapper::toDto);
    }

    /**
     * Delete the chapter by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Chapter : {}", id);
        chapterRepository.deleteById(id);
    }
}
