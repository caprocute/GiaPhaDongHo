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
import vn.giapha.domain.DonationCampaign;
import vn.giapha.repository.DonationCampaignRepository;
import vn.giapha.service.dto.DonationCampaignDTO;
import vn.giapha.service.mapper.DonationCampaignMapper;

/**
 * Service Implementation for managing {@link vn.giapha.domain.DonationCampaign}.
 */
@Service
@Transactional
public class DonationCampaignService {

    private static final Logger LOG = LoggerFactory.getLogger(DonationCampaignService.class);

    private final DonationCampaignRepository donationCampaignRepository;

    private final DonationCampaignMapper donationCampaignMapper;

    public DonationCampaignService(DonationCampaignRepository donationCampaignRepository, DonationCampaignMapper donationCampaignMapper) {
        this.donationCampaignRepository = donationCampaignRepository;
        this.donationCampaignMapper = donationCampaignMapper;
    }

    /**
     * Save a donationCampaign.
     *
     * @param donationCampaignDTO the entity to save.
     * @return the persisted entity.
     */
    public DonationCampaignDTO save(DonationCampaignDTO donationCampaignDTO) {
        LOG.debug("Request to save DonationCampaign : {}", donationCampaignDTO);
        DonationCampaign donationCampaign = donationCampaignMapper.toEntity(donationCampaignDTO);
        donationCampaign = donationCampaignRepository.save(donationCampaign);
        return donationCampaignMapper.toDto(donationCampaign);
    }

    /**
     * Update a donationCampaign.
     *
     * @param donationCampaignDTO the entity to save.
     * @return the persisted entity.
     */
    public DonationCampaignDTO update(DonationCampaignDTO donationCampaignDTO) {
        LOG.debug("Request to update DonationCampaign : {}", donationCampaignDTO);
        DonationCampaign donationCampaign = donationCampaignMapper.toEntity(donationCampaignDTO);
        donationCampaign = donationCampaignRepository.save(donationCampaign);
        return donationCampaignMapper.toDto(donationCampaign);
    }

    /**
     * Partially update a donationCampaign.
     *
     * @param donationCampaignDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<DonationCampaignDTO> partialUpdate(DonationCampaignDTO donationCampaignDTO) {
        LOG.debug("Request to partially update DonationCampaign : {}", donationCampaignDTO);

        return donationCampaignRepository
            .findById(donationCampaignDTO.getId())
            .map(existingDonationCampaign -> {
                donationCampaignMapper.partialUpdate(existingDonationCampaign, donationCampaignDTO);

                return existingDonationCampaign;
            })
            .map(donationCampaignRepository::save)
            .map(donationCampaignMapper::toDto);
    }

    /**
     * Get all the donationCampaigns.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<DonationCampaignDTO> findAll() {
        LOG.debug("Request to get all DonationCampaigns");
        return donationCampaignRepository
            .findAll()
            .stream()
            .map(donationCampaignMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get all the donationCampaigns with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<DonationCampaignDTO> findAllWithEagerRelationships(Pageable pageable) {
        return donationCampaignRepository.findAllWithEagerRelationships(pageable).map(donationCampaignMapper::toDto);
    }

    /**
     * Get one donationCampaign by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<DonationCampaignDTO> findOne(Long id) {
        LOG.debug("Request to get DonationCampaign : {}", id);
        return donationCampaignRepository.findOneWithEagerRelationships(id).map(donationCampaignMapper::toDto);
    }

    /**
     * Delete the donationCampaign by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete DonationCampaign : {}", id);
        donationCampaignRepository.deleteById(id);
    }
}
