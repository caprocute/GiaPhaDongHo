package vn.giapha.service;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.DonationContribution;
import vn.giapha.repository.DonationContributionRepository;
import vn.giapha.service.dto.DonationContributionDTO;
import vn.giapha.service.mapper.DonationContributionMapper;

/**
 * Service Implementation for managing {@link vn.giapha.domain.DonationContribution}.
 */
@Service
@Transactional
public class DonationContributionService {

    private static final Logger LOG = LoggerFactory.getLogger(DonationContributionService.class);

    private final DonationContributionRepository donationContributionRepository;

    private final DonationContributionMapper donationContributionMapper;

    public DonationContributionService(
        DonationContributionRepository donationContributionRepository,
        DonationContributionMapper donationContributionMapper
    ) {
        this.donationContributionRepository = donationContributionRepository;
        this.donationContributionMapper = donationContributionMapper;
    }

    /**
     * Save a donationContribution.
     *
     * @param donationContributionDTO the entity to save.
     * @return the persisted entity.
     */
    public DonationContributionDTO save(DonationContributionDTO donationContributionDTO) {
        LOG.debug("Request to save DonationContribution : {}", donationContributionDTO);
        DonationContribution donationContribution = donationContributionMapper.toEntity(donationContributionDTO);
        donationContribution = donationContributionRepository.save(donationContribution);
        return donationContributionMapper.toDto(donationContribution);
    }

    /**
     * Update a donationContribution.
     *
     * @param donationContributionDTO the entity to save.
     * @return the persisted entity.
     */
    public DonationContributionDTO update(DonationContributionDTO donationContributionDTO) {
        LOG.debug("Request to update DonationContribution : {}", donationContributionDTO);
        DonationContribution donationContribution = donationContributionMapper.toEntity(donationContributionDTO);
        donationContribution = donationContributionRepository.save(donationContribution);
        return donationContributionMapper.toDto(donationContribution);
    }

    /**
     * Partially update a donationContribution.
     *
     * @param donationContributionDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<DonationContributionDTO> partialUpdate(DonationContributionDTO donationContributionDTO) {
        LOG.debug("Request to partially update DonationContribution : {}", donationContributionDTO);

        return donationContributionRepository
            .findById(donationContributionDTO.getId())
            .map(existingDonationContribution -> {
                donationContributionMapper.partialUpdate(existingDonationContribution, donationContributionDTO);

                return existingDonationContribution;
            })
            .map(donationContributionRepository::save)
            .map(donationContributionMapper::toDto);
    }

    /**
     * Get all the donationContributions.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<DonationContributionDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all DonationContributions");
        return donationContributionRepository.findAll(pageable).map(donationContributionMapper::toDto);
    }

    /**
     * Get all the donationContributions with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<DonationContributionDTO> findAllWithEagerRelationships(Pageable pageable) {
        return donationContributionRepository.findAllWithEagerRelationships(pageable).map(donationContributionMapper::toDto);
    }

    /**
     * Get one donationContribution by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<DonationContributionDTO> findOne(Long id) {
        LOG.debug("Request to get DonationContribution : {}", id);
        return donationContributionRepository.findOneWithEagerRelationships(id).map(donationContributionMapper::toDto);
    }

    /**
     * Delete the donationContribution by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete DonationContribution : {}", id);
        donationContributionRepository.deleteById(id);
    }
}
