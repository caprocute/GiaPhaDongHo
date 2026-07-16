package vn.giapha.service.mapper;

import org.mapstruct.*;
import vn.giapha.domain.DonationCampaign;
import vn.giapha.domain.DonationContribution;
import vn.giapha.service.dto.DonationCampaignDTO;
import vn.giapha.service.dto.DonationContributionDTO;

/**
 * Mapper for the entity {@link DonationContribution} and its DTO {@link DonationContributionDTO}.
 */
@Mapper(componentModel = "spring")
public interface DonationContributionMapper extends EntityMapper<DonationContributionDTO, DonationContribution> {
    @Mapping(target = "campaign", source = "campaign", qualifiedByName = "donationCampaignTitle")
    DonationContributionDTO toDto(DonationContribution s);

    @Named("donationCampaignTitle")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "title")
    DonationCampaignDTO toDtoDonationCampaignTitle(DonationCampaign donationCampaign);
}
