package vn.giapha.genealogy.api;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Cấu hình site / cây — lưu trong {@code FamilyTree.metaJson} + trường entity.
 * Public đọc được; ghi cần quyền quản trị phả hệ (FR-12.18).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class TreeSettingsDTO implements Serializable {

    private String slug;

    @NotBlank
    @Size(max = 200)
    private String displayName;

    @Size(max = 40)
    private String shortName;

    @Size(max = 20)
    private String provinceCode;

    @Size(max = 300)
    private String address;

    @Size(max = 120)
    private String contactName;

    @Size(max = 40)
    private String contactPhone;

    @Size(max = 120)
    private String contactEmail;

    @Size(max = 2000)
    private String description;

    private List<@Size(max = 60) String> seoKeywords = new ArrayList<>();

    @Size(max = 120)
    private String bankName;

    @Size(max = 120)
    private String bankBranch;

    @Size(max = 60)
    private String bankAccountNo;

    @Size(max = 120)
    private String bankAccountName;

    @Size(max = 300)
    private String socialFacebook;

    @Size(max = 300)
    private String socialZalo;

    /** {@code bang-vang} | {@code co} — palette portal/admin. */
    @Size(max = 40)
    private String brandPalette = "bang-vang";

    @Size(max = 500)
    private String logoUrl;

    @Size(max = 500)
    private String faviconUrl;

    @Valid
    private TreeFeatureSettings tree = new TreeFeatureSettings();

    @Valid
    private NotifySettings notify = new NotifySettings();

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getShortName() {
        return shortName;
    }

    public void setShortName(String shortName) {
        this.shortName = shortName;
    }

    public String getProvinceCode() {
        return provinceCode;
    }

    public void setProvinceCode(String provinceCode) {
        this.provinceCode = provinceCode;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getSeoKeywords() {
        return seoKeywords;
    }

    public void setSeoKeywords(List<String> seoKeywords) {
        this.seoKeywords = seoKeywords != null ? seoKeywords : new ArrayList<>();
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getBankBranch() {
        return bankBranch;
    }

    public void setBankBranch(String bankBranch) {
        this.bankBranch = bankBranch;
    }

    public String getBankAccountNo() {
        return bankAccountNo;
    }

    public void setBankAccountNo(String bankAccountNo) {
        this.bankAccountNo = bankAccountNo;
    }

    public String getBankAccountName() {
        return bankAccountName;
    }

    public void setBankAccountName(String bankAccountName) {
        this.bankAccountName = bankAccountName;
    }

    public String getSocialFacebook() {
        return socialFacebook;
    }

    public void setSocialFacebook(String socialFacebook) {
        this.socialFacebook = socialFacebook;
    }

    public String getSocialZalo() {
        return socialZalo;
    }

    public void setSocialZalo(String socialZalo) {
        this.socialZalo = socialZalo;
    }

    public String getBrandPalette() {
        return brandPalette;
    }

    public void setBrandPalette(String brandPalette) {
        this.brandPalette = brandPalette;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getFaviconUrl() {
        return faviconUrl;
    }

    public void setFaviconUrl(String faviconUrl) {
        this.faviconUrl = faviconUrl;
    }

    public TreeFeatureSettings getTree() {
        return tree;
    }

    public void setTree(TreeFeatureSettings tree) {
        this.tree = tree != null ? tree : new TreeFeatureSettings();
    }

    public NotifySettings getNotify() {
        return notify;
    }

    public void setNotify(NotifySettings notify) {
        this.notify = notify != null ? notify : new NotifySettings();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TreeFeatureSettings implements Serializable {

        @Min(5)
        @Max(500)
        private int maxNodesDefault = 43;

        private boolean publicTree = true;
        private boolean maskLivingBirthDate = true;
        private boolean allowSelfDeclare = true;
        private boolean allowTreeExport = false;

        @Size(max = 4)
        private String codePrefix = "A";

        public int getMaxNodesDefault() {
            return maxNodesDefault;
        }

        public void setMaxNodesDefault(int maxNodesDefault) {
            this.maxNodesDefault = maxNodesDefault;
        }

        public boolean isPublicTree() {
            return publicTree;
        }

        public void setPublicTree(boolean publicTree) {
            this.publicTree = publicTree;
        }

        public boolean isMaskLivingBirthDate() {
            return maskLivingBirthDate;
        }

        public void setMaskLivingBirthDate(boolean maskLivingBirthDate) {
            this.maskLivingBirthDate = maskLivingBirthDate;
        }

        public boolean isAllowSelfDeclare() {
            return allowSelfDeclare;
        }

        public void setAllowSelfDeclare(boolean allowSelfDeclare) {
            this.allowSelfDeclare = allowSelfDeclare;
        }

        public boolean isAllowTreeExport() {
            return allowTreeExport;
        }

        public void setAllowTreeExport(boolean allowTreeExport) {
            this.allowTreeExport = allowTreeExport;
        }

        public String getCodePrefix() {
            return codePrefix;
        }

        public void setCodePrefix(String codePrefix) {
            this.codePrefix = codePrefix;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class NotifySettings implements Serializable {

        @Min(0)
        @Max(30)
        private int remindDaysBefore = 7;

        private boolean channelEmail = true;
        private boolean channelZalo = false;

        public int getRemindDaysBefore() {
            return remindDaysBefore;
        }

        public void setRemindDaysBefore(int remindDaysBefore) {
            this.remindDaysBefore = remindDaysBefore;
        }

        public boolean isChannelEmail() {
            return channelEmail;
        }

        public void setChannelEmail(boolean channelEmail) {
            this.channelEmail = channelEmail;
        }

        public boolean isChannelZalo() {
            return channelZalo;
        }

        public void setChannelZalo(boolean channelZalo) {
            this.channelZalo = channelZalo;
        }
    }
}
