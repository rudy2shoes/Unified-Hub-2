import { useState } from "react";
import goHighLevelIcon from "@assets/e4f5b5a2-3c12-424d-a4bc-1038a0910f96_1770925815909.png";

interface AppIconProps {
  name: string;
  url?: string | null;
  color?: string | null;
  size?: number;
  className?: string;
  notificationCount?: number | null;
}

const LOCAL_ICONS: Record<string, string> = {
  "GoHighLevel": goHighLevelIcon,
};

const BRAND_ICONS: Record<string, string> = {
  "HubSpot": "https://cdn.simpleicons.org/hubspot/FF7A59",
  "Salesforce": "https://cdn.simpleicons.org/salesforce/00A1E0",
  "Zoho CRM": "https://cdn.simpleicons.org/zoho/E42527",
  "Pipedrive": "https://cdn.simpleicons.org/pipedrive/ffffff",
  "Freshsales": "https://cdn.simpleicons.org/freshworks/F7622C",
  "Copper": "https://logo.clearbit.com/copper.com",
  "Insightly": "https://logo.clearbit.com/insightly.com",
  "Keap": "https://logo.clearbit.com/keap.com",
  "Microsoft Dynamics 365": "https://cdn.simpleicons.org/dynamics365/002050",
  "Monday CRM": "https://cdn.simpleicons.org/mondaydotcom/ffffff",

  "QuickBooks": "https://cdn.simpleicons.org/quickbooks/2CA01C",
  "Xero": "https://cdn.simpleicons.org/xero/13B5EA",
  "FreshBooks": "https://logo.clearbit.com/freshbooks.com",
  "Wave": "https://logo.clearbit.com/waveapps.com",
  "Sage": "https://cdn.simpleicons.org/sage/00DC00",
  "Brex": "https://logo.clearbit.com/brex.com",
  "Mercury": "https://logo.clearbit.com/mercury.com",

  "Stripe": "https://cdn.simpleicons.org/stripe/ffffff",
  "PayPal": "https://cdn.simpleicons.org/paypal/ffffff",
  "Square": "https://cdn.simpleicons.org/square/ffffff",
  "Chargebee": "https://logo.clearbit.com/chargebee.com",
  "Paddle": "https://logo.clearbit.com/paddle.com",

  "Chase Bank": "https://logo.clearbit.com/chase.com",
  "Bank of America": "https://logo.clearbit.com/bankofamerica.com",
  "Wells Fargo": "https://logo.clearbit.com/wellsfargo.com",
  "Capital One": "https://logo.clearbit.com/capitalone.com",
  "American Express": "https://cdn.simpleicons.org/americanexpress/ffffff",

  "Gmail": "https://cdn.simpleicons.org/gmail/EA4335",
  "Outlook": "https://cdn.simpleicons.org/microsoftoutlook/0078D4",
  "ProtonMail": "https://cdn.simpleicons.org/protonmail/6D4AFF",
  "Yahoo Mail": "https://cdn.simpleicons.org/yahoo/6001D2",

  "Facebook Ads": "https://cdn.simpleicons.org/facebook/ffffff",
  "Google Ads": "https://cdn.simpleicons.org/googleads/4285F4",
  "Mailchimp": "https://cdn.simpleicons.org/mailchimp/FFE01B",
  "Semrush": "https://cdn.simpleicons.org/semrush/FF642D",
  "ActiveCampaign": "https://logo.clearbit.com/activecampaign.com",
  "ConvertKit": "https://cdn.simpleicons.org/convertkit/ffffff",
  "Constant Contact": "https://logo.clearbit.com/constantcontact.com",
  "Klaviyo": "https://cdn.simpleicons.org/klaviyo/ffffff",
  "Ahrefs": "https://cdn.simpleicons.org/ahrefs/ffffff",
  "Buffer": "https://cdn.simpleicons.org/buffer/ffffff",
  "Hootsuite": "https://cdn.simpleicons.org/hootsuite/ffffff",
  "Sprout Social": "https://logo.clearbit.com/sproutsocial.com",
  "Typeform": "https://cdn.simpleicons.org/typeform/ffffff",
  "SurveyMonkey": "https://cdn.simpleicons.org/surveymonkey/00BF6F",
  "Substack": "https://cdn.simpleicons.org/substack/FF6719",

  "Slack": "https://cdn.simpleicons.org/slack",
  "Zoom": "https://cdn.simpleicons.org/zoom/ffffff",
  "Microsoft Teams": "https://cdn.simpleicons.org/microsoftteams/6264A7",
  "Discord": "https://cdn.simpleicons.org/discord/ffffff",
  "Google Meet": "https://cdn.simpleicons.org/googlemeet/00897B",
  "Loom": "https://cdn.simpleicons.org/loom/ffffff",
  "Telegram": "https://cdn.simpleicons.org/telegram/ffffff",
  "WhatsApp": "https://cdn.simpleicons.org/whatsapp/ffffff",
  "Signal": "https://cdn.simpleicons.org/signal/ffffff",
  "Webex": "https://cdn.simpleicons.org/webex/ffffff",

  "Notion": "https://cdn.simpleicons.org/notion/ffffff",
  "Trello": "https://cdn.simpleicons.org/trello/0052CC",
  "Asana": "https://cdn.simpleicons.org/asana/F06A6A",
  "Monday.com": "https://cdn.simpleicons.org/mondaydotcom/ffffff",
  "Calendly": "https://cdn.simpleicons.org/calendly/006BFF",
  "ClickUp": "https://cdn.simpleicons.org/clickup/7B68EE",
  "Jira": "https://cdn.simpleicons.org/jira/0052CC",
  "Confluence": "https://cdn.simpleicons.org/confluence/172B4D",
  "Linear": "https://cdn.simpleicons.org/linear/ffffff",
  "Airtable": "https://cdn.simpleicons.org/airtable/18BFFF",
  "Todoist": "https://cdn.simpleicons.org/todoist/E44332",
  "Evernote": "https://cdn.simpleicons.org/evernote/00A82D",
  "Obsidian": "https://cdn.simpleicons.org/obsidian/7C3AED",
  "Miro": "https://cdn.simpleicons.org/miro/FFD02F",
  "Google Calendar": "https://cdn.simpleicons.org/googlecalendar/4285F4",
  "Clockify": "https://cdn.simpleicons.org/clockify/03A9F4",
  "Toggl": "https://cdn.simpleicons.org/toggl/E57CD8",

  "Google Analytics": "https://cdn.simpleicons.org/googleanalytics/E37400",
  "Mixpanel": "https://cdn.simpleicons.org/mixpanel/ffffff",
  "Hotjar": "https://cdn.simpleicons.org/hotjar/FD3A5C",
  "Amplitude": "https://logo.clearbit.com/amplitude.com",
  "Datadog": "https://cdn.simpleicons.org/datadog/ffffff",
  "Tableau": "https://cdn.simpleicons.org/tableau/E97627",
  "Power BI": "https://cdn.simpleicons.org/powerbi/F2C811",
  "PostHog": "https://cdn.simpleicons.org/posthog/ffffff",

  "Shopify": "https://cdn.simpleicons.org/shopify/96BF48",
  "WooCommerce": "https://cdn.simpleicons.org/woocommerce/ffffff",
  "BigCommerce": "https://cdn.simpleicons.org/bigcommerce/ffffff",
  "Amazon Seller Central": "https://cdn.simpleicons.org/amazon/FF9900",
  "Etsy": "https://cdn.simpleicons.org/etsy/ffffff",
  "eBay": "https://cdn.simpleicons.org/ebay",
  "Squarespace": "https://cdn.simpleicons.org/squarespace/ffffff",
  "Wix": "https://cdn.simpleicons.org/wix/ffffff",
  "Gumroad": "https://cdn.simpleicons.org/gumroad/ffffff",

  "WordPress": "https://cdn.simpleicons.org/wordpress/21759B",
  "Webflow": "https://cdn.simpleicons.org/webflow/ffffff",
  "Ghost": "https://cdn.simpleicons.org/ghost/ffffff",
  "Contentful": "https://cdn.simpleicons.org/contentful/2478CC",
  "Strapi": "https://cdn.simpleicons.org/strapi/ffffff",
  "Framer": "https://cdn.simpleicons.org/framer/ffffff",

  "Zendesk": "https://cdn.simpleicons.org/zendesk/ffffff",
  "Freshdesk": "https://cdn.simpleicons.org/freshworks/25C16F",
  "Intercom": "https://cdn.simpleicons.org/intercom/ffffff",

  "Figma": "https://cdn.simpleicons.org/figma",
  "Canva": "https://cdn.simpleicons.org/canva/00C4CC",
  "Adobe Creative Cloud": "https://cdn.simpleicons.org/adobecreativecloud/FF0000",
  "InVision": "https://cdn.simpleicons.org/invision/FF3366",
  "Sketch": "https://cdn.simpleicons.org/sketch/F7B500",
  "Adobe Photoshop": "https://cdn.simpleicons.org/adobephotoshop/31A8FF",
  "Adobe Illustrator": "https://cdn.simpleicons.org/adobeillustrator/FF9A00",
  "Dribbble": "https://cdn.simpleicons.org/dribbble/EA4C89",
  "Behance": "https://cdn.simpleicons.org/behance/1769FF",

  "GitHub": "https://cdn.simpleicons.org/github/ffffff",
  "GitLab": "https://cdn.simpleicons.org/gitlab/FC6D26",
  "Bitbucket": "https://cdn.simpleicons.org/bitbucket/0052CC",
  "Vercel": "https://cdn.simpleicons.org/vercel/ffffff",
  "Netlify": "https://cdn.simpleicons.org/netlify/00C7B7",
  "Railway": "https://cdn.simpleicons.org/railway/ffffff",
  "Render": "https://cdn.simpleicons.org/render/ffffff",
  "Supabase": "https://cdn.simpleicons.org/supabase/3ECF8E",
  "Firebase": "https://cdn.simpleicons.org/firebase/FFCA28",
  "AWS Console": "https://cdn.simpleicons.org/amazonaws/FF9900",
  "Google Cloud": "https://cdn.simpleicons.org/googlecloud/4285F4",
  "Azure": "https://cdn.simpleicons.org/microsoftazure/0078D4",
  "Docker Hub": "https://cdn.simpleicons.org/docker/2496ED",
  "Postman": "https://cdn.simpleicons.org/postman/FF6C37",
  "Sentry": "https://cdn.simpleicons.org/sentry/ffffff",
  "Cloudflare": "https://cdn.simpleicons.org/cloudflare/F38020",
  "DigitalOcean": "https://cdn.simpleicons.org/digitalocean/0080FF",
  "Replit": "https://cdn.simpleicons.org/replit/F26207",
  "Stack Overflow": "https://cdn.simpleicons.org/stackoverflow/F48024",
  "npm": "https://cdn.simpleicons.org/npm/CB3837",

  "Google Drive": "https://cdn.simpleicons.org/googledrive/4285F4",
  "Dropbox": "https://cdn.simpleicons.org/dropbox/0061FF",
  "OneDrive": "https://cdn.simpleicons.org/onedrive/0078D4",
  "Box": "https://logo.clearbit.com/box.com",
  "iCloud": "https://cdn.simpleicons.org/icloud/3693F3",

  "Google Docs": "https://cdn.simpleicons.org/googledocs/4285F4",
  "Google Sheets": "https://cdn.simpleicons.org/googlesheets/34A853",
  "Google Slides": "https://cdn.simpleicons.org/googleslides/FBBC05",
  "Microsoft Word": "https://cdn.simpleicons.org/microsoftword/2B579A",
  "Microsoft Excel": "https://cdn.simpleicons.org/microsoftexcel/217346",
  "Microsoft PowerPoint": "https://cdn.simpleicons.org/microsoftpowerpoint/B7472A",
  "DocuSign": "https://cdn.simpleicons.org/docusign/FFBE00",

  "BambooHR": "https://logo.clearbit.com/bamboohr.com",
  "Gusto": "https://logo.clearbit.com/gusto.com",
  "Rippling": "https://logo.clearbit.com/rippling.com",
  "Deel": "https://logo.clearbit.com/deel.com",
  "Greenhouse": "https://logo.clearbit.com/greenhouse.io",
  "ADP": "https://logo.clearbit.com/adp.com",

  "Zapier": "https://cdn.simpleicons.org/zapier/FF4A00",
  "Make": "https://logo.clearbit.com/make.com",
  "IFTTT": "https://cdn.simpleicons.org/ifttt/ffffff",

  "ChatGPT": "https://cdn.simpleicons.org/openai/ffffff",
  "Claude": "https://cdn.simpleicons.org/anthropic/ffffff",
  "Gemini": "https://cdn.simpleicons.org/googlegemini/ffffff",
  "Perplexity": "https://cdn.simpleicons.org/perplexity/ffffff",
  "Grammarly": "https://cdn.simpleicons.org/grammarly/15C39A",

  "Facebook": "https://cdn.simpleicons.org/facebook/ffffff",
  "Instagram": "https://cdn.simpleicons.org/instagram/ffffff",
  "X (Twitter)": "https://cdn.simpleicons.org/x/ffffff",
  "LinkedIn": "https://cdn.simpleicons.org/linkedin/ffffff",
  "TikTok": "https://cdn.simpleicons.org/tiktok/ffffff",
  "Pinterest": "https://cdn.simpleicons.org/pinterest/ffffff",
  "Reddit": "https://cdn.simpleicons.org/reddit/ffffff",
  "YouTube Studio": "https://cdn.simpleicons.org/youtube/ffffff",
  "Threads": "https://cdn.simpleicons.org/threads/ffffff",
  "Bluesky": "https://cdn.simpleicons.org/bluesky/ffffff",

  "1Password": "https://cdn.simpleicons.org/1password/ffffff",
  "LastPass": "https://cdn.simpleicons.org/lastpass/ffffff",
  "Bitwarden": "https://cdn.simpleicons.org/bitwarden/ffffff",
  "Okta": "https://cdn.simpleicons.org/okta/ffffff",
  "Auth0": "https://cdn.simpleicons.org/auth0/ffffff",
  "NordVPN": "https://cdn.simpleicons.org/nordvpn/ffffff",

  "Spotify": "https://cdn.simpleicons.org/spotify/ffffff",
  "YouTube": "https://cdn.simpleicons.org/youtube/ffffff",
  "Apple Music": "https://cdn.simpleicons.org/applemusic/ffffff",
  "Netflix": "https://cdn.simpleicons.org/netflix/ffffff",
  "Twitch": "https://cdn.simpleicons.org/twitch/ffffff",
  "SoundCloud": "https://cdn.simpleicons.org/soundcloud/ffffff",

  "Udemy": "https://cdn.simpleicons.org/udemy/ffffff",
  "Coursera": "https://cdn.simpleicons.org/coursera/ffffff",
};

function getDomain(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

type IconSource = { url: string; type: "local" | "brand" | "clearbit" } | null;

function getIconInfo(name: string, url?: string | null): IconSource {
  if (LOCAL_ICONS[name]) return { url: LOCAL_ICONS[name], type: "local" };
  if (BRAND_ICONS[name]) {
    const brandUrl = BRAND_ICONS[name];
    const isClearbit = brandUrl.includes("clearbit.com");
    return { url: brandUrl, type: isClearbit ? "clearbit" : "brand" };
  }

  if (url) {
    const domain = getDomain(url);
    if (domain) {
      return { url: `https://logo.clearbit.com/${domain}`, type: "clearbit" };
    }
  }

  return null;
}

function getIconUrl(name: string, url?: string | null): string | null {
  const info = getIconInfo(name, url);
  return info ? info.url : null;
}

function NotificationBadge({ count, size }: { count: number; size: number }) {
  if (count <= 0) return null;

  const badgeSize = Math.max(14, size * 0.32);
  const fontSize = Math.max(8, badgeSize * 0.65);
  const offset = size <= 32 ? -3 : -4;

  return (
    <div
      className="absolute flex items-center justify-center bg-[#EF4444] text-white font-bold rounded-full border-2 border-[#0d0d0d] shadow-lg shadow-red-500/30 animate-in zoom-in-50 duration-200"
      style={{
        top: offset,
        right: offset,
        minWidth: badgeSize,
        height: badgeSize,
        fontSize,
        padding: count > 9 ? "0 3px" : 0,
        lineHeight: 1,
        zIndex: 10,
      }}
      data-testid="notification-badge"
    >
      {count > 99 ? "99+" : count}
    </div>
  );
}

export function AppIcon({ name, url, color, size = 32, className = "", notificationCount }: AppIconProps) {
  const [imgError, setImgError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  const iconInfo = getIconInfo(name, url);

  const fontSize = size <= 24 ? "text-[10px]" : size <= 32 ? "text-xs" : size <= 40 ? "text-sm" : size <= 56 ? "text-xl" : "text-2xl";
  const radius = size <= 32 ? "rounded-lg" : "rounded-xl";
  const badge = notificationCount && notificationCount > 0 ? <NotificationBadge count={notificationCount} size={size} /> : null;

  if (iconInfo && !imgError) {
    const isClearbit = iconInfo.type === "clearbit";
    const bgColor = isClearbit ? "#F0F0F0" : (color || "#6366F1");
    const imgSize = isClearbit ? "w-[80%] h-[80%]" : "w-[72%] h-[72%]";

    return (
      <div
        className={`relative flex items-center justify-center overflow-visible ${radius} ${className}`}
        style={{ width: size, height: size, minWidth: size }}
      >
        <div
          className={`flex items-center justify-center overflow-hidden ${radius} w-full h-full`}
          style={{ background: bgColor }}
        >
          <img
            src={iconInfo.url}
            alt={name}
            className={`${imgSize} object-contain`}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        </div>
        {badge}
      </div>
    );
  }

  if (url && !fallbackError) {
    const domain = getDomain(url);
    if (domain) {
      const fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      return (
        <div
          className={`relative flex items-center justify-center overflow-visible ${radius} ${className}`}
          style={{ width: size, height: size, minWidth: size }}
        >
          <div
            className={`flex items-center justify-center overflow-hidden ${radius} w-full h-full`}
            style={{ background: "#F0F0F0" }}
          >
            <img
              src={fallbackUrl}
              alt={name}
              className="w-[72%] h-[72%] object-contain"
              onError={() => setFallbackError(true)}
              loading="lazy"
            />
          </div>
          {badge}
        </div>
      );
    }
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-visible ${radius} ${className}`}
      style={{ width: size, height: size, minWidth: size }}
    >
      <div
        className={`flex items-center justify-center text-white font-bold shadow-lg ${radius} w-full h-full ${fontSize}`}
        style={{ background: color || "#6366F1" }}
      >
        {name[0]}
      </div>
      {badge}
    </div>
  );
}
