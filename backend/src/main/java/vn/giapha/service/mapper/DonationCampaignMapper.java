package vn.giapha.service.mapper;

import org.mapstruct.*;
import vn.giapha.domain.DonationCampaign;
import vn.giapha.domain.FamilyTree;
import vn.giapha.service.dto.DonationCampaignDTO;
import vn.giapha.service.dto.FamilyTreeDTO;

/**
 * Mapper for the entity {@link DonationCampaign} and its DTO {@link DonationCampaignDTO}.
 */
@Mapper(componentModel = "spring")
public interface DonationCampaignMapper extends EntityMapper<DonationCampaignDTO, DonationCampaign> {
    @Mapping(target = "tree", source = "tree", qualifiedByName = "familyTreeSlug")
    DonationCampaignDTO toDto(DonationCampaign s);

    @Named("familyTreeSlug")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "slug", source = "slug")
    FamilyTreeDTO toDtoFamilyTreeSlug(FamilyTree familyTree);
}
