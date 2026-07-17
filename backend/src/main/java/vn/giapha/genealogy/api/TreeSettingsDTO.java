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

    @Valid
    private CalendarSettings calendar = new CalendarSettings();

    @Valid
    private AuthSettings auth = new AuthSettings();

    @Valid
    private PrivacySettings privacy = new PrivacySettings();

    @Valid
    private SmtpSettings smtp = new SmtpSettings();

    @Valid
    private ZaloSettings zalo = new ZaloSettings();

    @Valid
    private WebhookSettings webhook = new WebhookSettings();

    @Valid
    private BackupSettings backup = new BackupSettings();

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

    public CalendarSettings getCalendar() {
        return calendar;
    }

    public void setCalendar(CalendarSettings calendar) {
        this.calendar = calendar != null ? calendar : new CalendarSettings();
    }

    public AuthSettings getAuth() {
        return auth;
    }

    public void setAuth(AuthSettings auth) {
        this.auth = auth != null ? auth : new AuthSettings();
    }

    public PrivacySettings getPrivacy() {
        return privacy;
    }

    public void setPrivacy(PrivacySettings privacy) {
        this.privacy = privacy != null ? privacy : new PrivacySettings();
    }

    public SmtpSettings getSmtp() {
        return smtp;
    }

    public void setSmtp(SmtpSettings smtp) {
        this.smtp = smtp != null ? smtp : new SmtpSettings();
    }

    public ZaloSettings getZalo() {
        return zalo;
    }

    public void setZalo(ZaloSettings zalo) {
        this.zalo = zalo != null ? zalo : new ZaloSettings();
    }

    public WebhookSettings getWebhook() {
        return webhook;
    }

    public void setWebhook(WebhookSettings webhook) {
        this.webhook = webhook != null ? webhook : new WebhookSettings();
    }

    public BackupSettings getBackup() {
        return backup;
    }

    public void setBackup(BackupSettings backup) {
        this.backup = backup != null ? backup : new BackupSettings();
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

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CalendarSettings implements Serializable {

        @Size(max = 60)
        private String timezone = "Asia/Ho_Chi_Minh";

        private boolean showLeapMonthLabel = true;

        public String getTimezone() {
            return timezone;
        }

        public void setTimezone(String timezone) {
            this.timezone = timezone;
        }

        public boolean isShowLeapMonthLabel() {
            return showLeapMonthLabel;
        }

        public void setShowLeapMonthLabel(boolean showLeapMonthLabel) {
            this.showLeapMonthLabel = showLeapMonthLabel;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AuthSettings implements Serializable {

        private boolean publicRegistration = true;
        private boolean autoActivate = true;
        private boolean captchaEnabled = false;
        private boolean requireTerms = true;

        public boolean isPublicRegistration() {
            return publicRegistration;
        }

        public void setPublicRegistration(boolean publicRegistration) {
            this.publicRegistration = publicRegistration;
        }

        public boolean isAutoActivate() {
            return autoActivate;
        }

        public void setAutoActivate(boolean autoActivate) {
            this.autoActivate = autoActivate;
        }

        public boolean isCaptchaEnabled() {
            return captchaEnabled;
        }

        public void setCaptchaEnabled(boolean captchaEnabled) {
            this.captchaEnabled = captchaEnabled;
        }

        public boolean isRequireTerms() {
            return requireTerms;
        }

        public void setRequireTerms(boolean requireTerms) {
            this.requireTerms = requireTerms;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PrivacySettings implements Serializable {

        /** members | public | private */
        @Size(max = 20)
        private String defaultLivingPrivacy = "members";

        public String getDefaultLivingPrivacy() {
            return defaultLivingPrivacy;
        }

        public void setDefaultLivingPrivacy(String defaultLivingPrivacy) {
            this.defaultLivingPrivacy = defaultLivingPrivacy;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SmtpSettings implements Serializable {

        private boolean configured;
        @Size(max = 200)
        private String host;
        private int port = 587;
        private boolean tls = true;
        @Size(max = 120)
        private String username;
        @Size(max = 120)
        private String fromEmail;
        @Size(max = 120)
        private String fromName;
        /** Chỉ nhận khi PUT; không trả về GET. */
        @Size(max = 200)
        private String password;

        public boolean isConfigured() {
            return configured;
        }

        public void setConfigured(boolean configured) {
            this.configured = configured;
        }

        public String getHost() {
            return host;
        }

        public void setHost(String host) {
            this.host = host;
        }

        public int getPort() {
            return port;
        }

        public void setPort(int port) {
            this.port = port;
        }

        public boolean isTls() {
            return tls;
        }

        public void setTls(boolean tls) {
            this.tls = tls;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getFromEmail() {
            return fromEmail;
        }

        public void setFromEmail(String fromEmail) {
            this.fromEmail = fromEmail;
        }

        public String getFromName() {
            return fromName;
        }

        public void setFromName(String fromName) {
            this.fromName = fromName;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ZaloSettings implements Serializable {

        private boolean configured;
        /** off | dry_run | live */
        @Size(max = 20)
        private String mode = "off";
        @Size(max = 120)
        private String oaId;
        @Size(max = 120)
        private String appId;
        @Size(max = 500)
        private String accessToken;

        public boolean isConfigured() {
            return configured;
        }

        public void setConfigured(boolean configured) {
            this.configured = configured;
        }

        public String getMode() {
            return mode;
        }

        public void setMode(String mode) {
            this.mode = mode;
        }

        public String getOaId() {
            return oaId;
        }

        public void setOaId(String oaId) {
            this.oaId = oaId;
        }

        public String getAppId() {
            return appId;
        }

        public void setAppId(String appId) {
            this.appId = appId;
        }

        public String getAccessToken() {
            return accessToken;
        }

        public void setAccessToken(String accessToken) {
            this.accessToken = accessToken;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class WebhookSettings implements Serializable {

        private boolean enabled;
        @Size(max = 500)
        private String url;
        @Size(max = 200)
        private String secret;
        private boolean secretConfigured;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public boolean isSecretConfigured() {
            return secretConfigured;
        }

        public void setSecretConfigured(boolean secretConfigured) {
            this.secretConfigured = secretConfigured;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BackupSettings implements Serializable {

        private boolean enabled;
        /** daily | weekly */
        @Size(max = 20)
        private String schedule = "daily";
        @Size(max = 10)
        private String runAt = "02:00";

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public String getSchedule() {
            return schedule;
        }

        public void setSchedule(String schedule) {
            this.schedule = schedule;
        }

        public String getRunAt() {
            return runAt;
        }

        public void setRunAt(String runAt) {
            this.runAt = runAt;
        }
    }
}
