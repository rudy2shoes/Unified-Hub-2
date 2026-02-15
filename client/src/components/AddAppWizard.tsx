import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search, ArrowRight, ArrowLeft, Check, Loader2, ExternalLink, Globe, Star, X,
  Briefcase, DollarSign, Mail, BarChart3, MessageSquare, Layout, Building2, Megaphone,
  Folder, Heart, Zap, Shield, Code, Camera, Music, ShoppingCart, Truck, Users, Plus,
  Star as StarIcon
} from "lucide-react";
import hubLogo from "@assets/HUB_Logo_(1)_1770930042707.png";
import { AppIcon } from "@/components/AppIcon";
import type { AppCategory } from "@shared/schema";

const ICON_MAP: Record<string, any> = {
  Folder, Briefcase, DollarSign, Mail, Globe, BarChart3, MessageSquare, Layout, Building2, Megaphone, Star: StarIcon, Heart, Zap, Shield, Code, Camera, Music, ShoppingCart, Truck, Users,
};

const ICON_NAMES = Object.keys(ICON_MAP);
const CATEGORY_COLOR_OPTIONS = ["#6366F1", "#3B82F6", "#22C55E", "#EF4444", "#F59E0B", "#EC4899", "#8B5CF6", "#14B8A6"];

export const APP_CATALOG = [
  { name: "GoHighLevel", category: "CRM", color: "#3B82F6", url: "https://app.gohighlevel.com", description: "All-in-one marketing & CRM platform", icon: Briefcase },
  { name: "HubSpot", category: "CRM", color: "#FF7A59", url: "https://app.hubspot.com", description: "CRM, marketing & sales hub", icon: Briefcase },
  { name: "Salesforce", category: "CRM", color: "#00A1E0", url: "https://login.salesforce.com", description: "Enterprise CRM platform", icon: Briefcase },
  { name: "Zoho CRM", category: "CRM", color: "#E42527", url: "https://crm.zoho.com", description: "AI-powered CRM for small business", icon: Briefcase },
  { name: "Pipedrive", category: "CRM", color: "#1A1A1A", url: "https://app.pipedrive.com", description: "Sales pipeline management", icon: Briefcase },
  { name: "Close", category: "CRM", color: "#1A6DFF", url: "https://app.close.com", description: "CRM with built-in calling & SMS", icon: Briefcase },
  { name: "Freshsales", category: "CRM", color: "#F7622C", url: "https://web.freshsales.io", description: "Sales CRM by Freshworks", icon: Briefcase },
  { name: "Copper", category: "CRM", color: "#F49C20", url: "https://app.copper.com", description: "CRM built for Google Workspace", icon: Briefcase },
  { name: "Insightly", category: "CRM", color: "#3E7BFA", url: "https://crm.na1.insightly.com", description: "CRM with project management", icon: Briefcase },
  { name: "Keap", category: "CRM", color: "#2BA84A", url: "https://signin.infusionsoft.com", description: "Small business CRM & automation", icon: Briefcase },
  { name: "Microsoft Dynamics 365", category: "CRM", color: "#002050", url: "https://dynamics.microsoft.com", description: "Enterprise CRM & ERP suite", icon: Briefcase },
  { name: "Monday CRM", category: "CRM", color: "#6161FF", url: "https://monday.com", description: "Visual CRM on Monday.com", icon: Briefcase },

  { name: "QuickBooks", category: "Finance", color: "#2CA01C", url: "https://app.qbo.intuit.com", description: "Accounting & invoicing software", icon: DollarSign },
  { name: "Xero", category: "Finance", color: "#13B5EA", url: "https://login.xero.com", description: "Cloud accounting software", icon: DollarSign },
  { name: "FreshBooks", category: "Finance", color: "#0075DD", url: "https://my.freshbooks.com", description: "Invoicing & expense tracking", icon: DollarSign },
  { name: "Wave", category: "Finance", color: "#003C5A", url: "https://my.waveapps.com", description: "Free accounting & invoicing", icon: DollarSign },
  { name: "Sage", category: "Finance", color: "#00DC00", url: "https://accounts.sage.com", description: "Business accounting & payroll", icon: DollarSign },
  { name: "NetSuite", category: "Finance", color: "#1B3A4B", url: "https://system.netsuite.com", description: "Enterprise ERP & financials", icon: DollarSign },
  { name: "Zoho Books", category: "Finance", color: "#15A362", url: "https://books.zoho.com", description: "Online accounting for SMBs", icon: DollarSign },
  { name: "Bill.com", category: "Finance", color: "#00C4B3", url: "https://app.bill.com", description: "Accounts payable & receivable", icon: DollarSign },
  { name: "Expensify", category: "Finance", color: "#0B5C3E", url: "https://www.expensify.com", description: "Expense management & reports", icon: DollarSign },
  { name: "Brex", category: "Finance", color: "#F46036", url: "https://dashboard.brex.com", description: "Corporate card & spend management", icon: DollarSign },
  { name: "Ramp", category: "Finance", color: "#1A1A1A", url: "https://app.ramp.com", description: "Corporate card & expense automation", icon: DollarSign },
  { name: "Mercury", category: "Finance", color: "#5A34E1", url: "https://app.mercury.com", description: "Business banking for startups", icon: DollarSign },
  { name: "Relay", category: "Finance", color: "#0052FF", url: "https://app.relayfi.com", description: "Business banking & money management", icon: DollarSign },
  { name: "Bench", category: "Finance", color: "#1A6F56", url: "https://app.bench.co", description: "Bookkeeping & tax services", icon: DollarSign },

  { name: "Stripe", category: "Payments", color: "#635BFF", url: "https://dashboard.stripe.com", description: "Online payment processing", icon: DollarSign },
  { name: "PayPal", category: "Payments", color: "#003087", url: "https://www.paypal.com/mep/dashboard", description: "Payment processing & invoicing", icon: DollarSign },
  { name: "Square", category: "Payments", color: "#006AFF", url: "https://squareup.com/dashboard", description: "POS & payment processing", icon: DollarSign },
  { name: "Chargebee", category: "Payments", color: "#FF6600", url: "https://app.chargebee.com", description: "Subscription billing platform", icon: DollarSign },
  { name: "Paddle", category: "Payments", color: "#FDDD35", url: "https://vendors.paddle.com", description: "Payment infrastructure for SaaS", icon: DollarSign },
  { name: "Recurly", category: "Payments", color: "#24215E", url: "https://app.recurly.com", description: "Subscription management & billing", icon: DollarSign },

  { name: "Chase Bank", category: "Banking", color: "#117ACA", url: "https://secure.chase.com", description: "Chase online banking", icon: Building2 },
  { name: "Bank of America", category: "Banking", color: "#012169", url: "https://www.bankofamerica.com", description: "BofA online banking", icon: Building2 },
  { name: "Wells Fargo", category: "Banking", color: "#D71E28", url: "https://www.wellsfargo.com", description: "Wells Fargo online banking", icon: Building2 },
  { name: "Citi Bank", category: "Banking", color: "#003B70", url: "https://online.citi.com", description: "Citibank online banking", icon: Building2 },
  { name: "Capital One", category: "Banking", color: "#004977", url: "https://myaccounts.capitalone.com", description: "Capital One banking & cards", icon: Building2 },
  { name: "US Bank", category: "Banking", color: "#D30032", url: "https://onlinebanking.usbank.com", description: "US Bank online banking", icon: Building2 },
  { name: "PNC Bank", category: "Banking", color: "#F58025", url: "https://www.pnc.com/en/personal-banking.html", description: "PNC online banking", icon: Building2 },
  { name: "TD Bank", category: "Banking", color: "#34A853", url: "https://onlinebanking.tdbank.com", description: "TD Bank online banking", icon: Building2 },
  { name: "American Express", category: "Banking", color: "#006FCF", url: "https://www.americanexpress.com/en-us/account/login", description: "Amex cards & banking", icon: Building2 },

  { name: "Gmail", category: "Email", color: "#EA4335", url: "https://mail.google.com", description: "Google email service", icon: Mail },
  { name: "Outlook", category: "Email", color: "#0078D4", url: "https://outlook.live.com", description: "Microsoft email & calendar", icon: Mail },
  { name: "Yahoo Mail", category: "Email", color: "#6001D2", url: "https://mail.yahoo.com", description: "Yahoo email service", icon: Mail },
  { name: "ProtonMail", category: "Email", color: "#6D4AFF", url: "https://mail.proton.me", description: "Encrypted email service", icon: Mail },
  { name: "Zoho Mail", category: "Email", color: "#F4C025", url: "https://mail.zoho.com", description: "Business email hosting", icon: Mail },
  { name: "Fastmail", category: "Email", color: "#0066FF", url: "https://app.fastmail.com", description: "Privacy-focused email", icon: Mail },
  { name: "Superhuman", category: "Email", color: "#A855F7", url: "https://mail.superhuman.com", description: "Fastest email experience", icon: Mail },

  { name: "Facebook Ads", category: "Marketing", color: "#1877F2", url: "https://business.facebook.com/adsmanager", description: "Meta advertising platform", icon: Megaphone },
  { name: "Google Ads", category: "Marketing", color: "#4285F4", url: "https://ads.google.com", description: "Google advertising platform", icon: Megaphone },
  { name: "Mailchimp", category: "Marketing", color: "#FFE01B", url: "https://login.mailchimp.com", description: "Email marketing platform", icon: Mail },
  { name: "Semrush", category: "Marketing", color: "#FF642D", url: "https://www.semrush.com", description: "SEO & marketing toolkit", icon: BarChart3 },
  { name: "ActiveCampaign", category: "Marketing", color: "#004DE5", url: "https://www.activecampaign.com/login", description: "Email & marketing automation", icon: Megaphone },
  { name: "ConvertKit", category: "Marketing", color: "#FB6970", url: "https://app.convertkit.com", description: "Creator email marketing", icon: Mail },
  { name: "Constant Contact", category: "Marketing", color: "#0076BE", url: "https://login.constantcontact.com", description: "Email marketing & social", icon: Mail },
  { name: "Klaviyo", category: "Marketing", color: "#1A1A1A", url: "https://www.klaviyo.com/login", description: "E-commerce email & SMS marketing", icon: Megaphone },
  { name: "Drip", category: "Marketing", color: "#AA00FF", url: "https://www.getdrip.com/login", description: "E-commerce marketing automation", icon: Megaphone },
  { name: "Ahrefs", category: "Marketing", color: "#FF8C00", url: "https://app.ahrefs.com", description: "SEO tools & backlink analysis", icon: BarChart3 },
  { name: "Moz", category: "Marketing", color: "#4E7AB5", url: "https://moz.com/login", description: "SEO software & tools", icon: BarChart3 },
  { name: "Buffer", category: "Marketing", color: "#168EEA", url: "https://publish.buffer.com", description: "Social media scheduling", icon: Megaphone },
  { name: "Hootsuite", category: "Marketing", color: "#143059", url: "https://hootsuite.com/dashboard", description: "Social media management", icon: Megaphone },
  { name: "Later", category: "Marketing", color: "#FF5E79", url: "https://app.later.com", description: "Visual social media planner", icon: Megaphone },
  { name: "Sprout Social", category: "Marketing", color: "#59CB59", url: "https://app.sproutsocial.com", description: "Social media management suite", icon: Megaphone },
  { name: "Unbounce", category: "Marketing", color: "#2542E6", url: "https://app.unbounce.com", description: "Landing page builder", icon: Globe },
  { name: "Leadpages", category: "Marketing", color: "#6456F1", url: "https://my.leadpages.com", description: "Landing pages & lead gen", icon: Globe },
  { name: "Typeform", category: "Marketing", color: "#262627", url: "https://admin.typeform.com", description: "Forms & surveys", icon: Layout },
  { name: "SurveyMonkey", category: "Marketing", color: "#00BF6F", url: "https://www.surveymonkey.com/dashboard", description: "Online surveys & feedback", icon: BarChart3 },
  { name: "Brevo", category: "Marketing", color: "#0B996E", url: "https://app.brevo.com", description: "Email, SMS & chat marketing", icon: Megaphone },
  { name: "SendGrid", category: "Marketing", color: "#1A82E2", url: "https://app.sendgrid.com", description: "Transactional email delivery", icon: Mail },
  { name: "Beehiiv", category: "Marketing", color: "#F5C518", url: "https://app.beehiiv.com", description: "Newsletter platform for creators", icon: Mail },
  { name: "Substack", category: "Marketing", color: "#FF6719", url: "https://substack.com/dashboard", description: "Newsletter publishing platform", icon: Mail },

  { name: "Slack", category: "Communication", color: "#E01E5A", url: "https://app.slack.com", description: "Team messaging & collaboration", icon: MessageSquare },
  { name: "Zoom", category: "Communication", color: "#2D8CFF", url: "https://zoom.us/signin", description: "Video conferencing", icon: MessageSquare },
  { name: "Microsoft Teams", category: "Communication", color: "#6264A7", url: "https://teams.microsoft.com", description: "Team collaboration hub", icon: MessageSquare },
  { name: "Discord", category: "Communication", color: "#5865F2", url: "https://discord.com/app", description: "Community chat & voice", icon: MessageSquare },
  { name: "Google Meet", category: "Communication", color: "#00897B", url: "https://meet.google.com", description: "Video meetings by Google", icon: MessageSquare },
  { name: "Loom", category: "Communication", color: "#625DF5", url: "https://www.loom.com/looms", description: "Async video messaging", icon: Camera },
  { name: "Telegram", category: "Communication", color: "#26A5E4", url: "https://web.telegram.org", description: "Cloud-based messaging app", icon: MessageSquare },
  { name: "WhatsApp", category: "Communication", color: "#25D366", url: "https://web.whatsapp.com", description: "WhatsApp web messaging", icon: MessageSquare },
  { name: "Signal", category: "Communication", color: "#3A76F0", url: "https://signal.org", description: "Encrypted messaging app", icon: MessageSquare },
  { name: "Webex", category: "Communication", color: "#00BCEB", url: "https://web.webex.com", description: "Cisco video conferencing", icon: MessageSquare },
  { name: "RingCentral", category: "Communication", color: "#FF8800", url: "https://app.ringcentral.com", description: "VoIP phone & video meetings", icon: MessageSquare },
  { name: "Dialpad", category: "Communication", color: "#7C3AED", url: "https://dialpad.com/app", description: "AI-powered business phone", icon: MessageSquare },

  { name: "Notion", category: "Productivity", color: "#191919", url: "https://www.notion.so", description: "All-in-one workspace & docs", icon: Layout },
  { name: "Trello", category: "Productivity", color: "#0052CC", url: "https://trello.com", description: "Visual project management", icon: Layout },
  { name: "Asana", category: "Productivity", color: "#F06A6A", url: "https://app.asana.com", description: "Work management platform", icon: Layout },
  { name: "Monday.com", category: "Productivity", color: "#6161FF", url: "https://monday.com", description: "Work OS platform", icon: Layout },
  { name: "Calendly", category: "Productivity", color: "#006BFF", url: "https://calendly.com/app", description: "Scheduling & appointments", icon: Layout },
  { name: "ClickUp", category: "Productivity", color: "#7B68EE", url: "https://app.clickup.com", description: "All-in-one project management", icon: Layout },
  { name: "Jira", category: "Productivity", color: "#0052CC", url: "https://id.atlassian.com", description: "Agile project & issue tracking", icon: Layout },
  { name: "Confluence", category: "Productivity", color: "#172B4D", url: "https://id.atlassian.com", description: "Team wiki & documentation", icon: Layout },
  { name: "Basecamp", category: "Productivity", color: "#1D2D35", url: "https://launchpad.37signals.com", description: "Team projects & communication", icon: Layout },
  { name: "Linear", category: "Productivity", color: "#5E6AD2", url: "https://linear.app", description: "Issue tracking for developers", icon: Layout },
  { name: "Airtable", category: "Productivity", color: "#18BFFF", url: "https://airtable.com", description: "Spreadsheet-database hybrid", icon: Layout },
  { name: "Coda", category: "Productivity", color: "#F46A54", url: "https://coda.io", description: "All-in-one docs & apps", icon: Layout },
  { name: "Smartsheet", category: "Productivity", color: "#0073EC", url: "https://app.smartsheet.com", description: "Enterprise work management", icon: Layout },
  { name: "Wrike", category: "Productivity", color: "#08CF65", url: "https://www.wrike.com/workspace", description: "Collaborative work management", icon: Layout },
  { name: "Todoist", category: "Productivity", color: "#E44332", url: "https://todoist.com/app", description: "Personal task manager", icon: Layout },
  { name: "Evernote", category: "Productivity", color: "#00A82D", url: "https://www.evernote.com/client/web", description: "Note-taking & organization", icon: Layout },
  { name: "Obsidian", category: "Productivity", color: "#7C3AED", url: "https://obsidian.md", description: "Knowledge base & notes", icon: Layout },
  { name: "Miro", category: "Productivity", color: "#FFD02F", url: "https://miro.com/app", description: "Online whiteboard & brainstorming", icon: Layout },
  { name: "Google Calendar", category: "Productivity", color: "#4285F4", url: "https://calendar.google.com", description: "Calendar & scheduling", icon: Layout },
  { name: "Cal.com", category: "Productivity", color: "#292929", url: "https://app.cal.com", description: "Open-source scheduling", icon: Layout },
  { name: "Clockify", category: "Productivity", color: "#03A9F4", url: "https://app.clockify.me", description: "Free time tracking", icon: Layout },
  { name: "Toggl", category: "Productivity", color: "#E57CD8", url: "https://track.toggl.com", description: "Time tracking & reporting", icon: Layout },
  { name: "Harvest", category: "Productivity", color: "#FA5D00", url: "https://id.getharvest.com", description: "Time tracking & invoicing", icon: Layout },

  { name: "Google Analytics", category: "Analytics", color: "#E37400", url: "https://analytics.google.com", description: "Website analytics & insights", icon: BarChart3 },
  { name: "Mixpanel", category: "Analytics", color: "#7856FF", url: "https://mixpanel.com", description: "Product & user analytics", icon: BarChart3 },
  { name: "Hotjar", category: "Analytics", color: "#FD3A5C", url: "https://insights.hotjar.com", description: "Heatmaps & session recordings", icon: BarChart3 },
  { name: "Amplitude", category: "Analytics", color: "#1B1F3B", url: "https://analytics.amplitude.com", description: "Digital analytics platform", icon: BarChart3 },
  { name: "Plausible", category: "Analytics", color: "#5850EC", url: "https://plausible.io/sites", description: "Privacy-friendly analytics", icon: BarChart3 },
  { name: "Datadog", category: "Analytics", color: "#632CA6", url: "https://app.datadoghq.com", description: "Cloud monitoring & analytics", icon: BarChart3 },
  { name: "Looker Studio", category: "Analytics", color: "#4285F4", url: "https://lookerstudio.google.com", description: "Data visualization & dashboards", icon: BarChart3 },
  { name: "Tableau", category: "Analytics", color: "#E97627", url: "https://online.tableau.com", description: "Business intelligence & data viz", icon: BarChart3 },
  { name: "Power BI", category: "Analytics", color: "#F2C811", url: "https://app.powerbi.com", description: "Microsoft business analytics", icon: BarChart3 },
  { name: "FullStory", category: "Analytics", color: "#7A2AFF", url: "https://app.fullstory.com", description: "Digital experience analytics", icon: BarChart3 },
  { name: "Heap", category: "Analytics", color: "#5C4CE3", url: "https://heapanalytics.com", description: "Auto-capture product analytics", icon: BarChart3 },
  { name: "Segment", category: "Analytics", color: "#52BD94", url: "https://app.segment.com", description: "Customer data platform", icon: BarChart3 },
  { name: "PostHog", category: "Analytics", color: "#1D4AFF", url: "https://app.posthog.com", description: "Open-source product analytics", icon: BarChart3 },

  { name: "Shopify", category: "E-Commerce", color: "#96BF48", url: "https://admin.shopify.com", description: "E-commerce platform", icon: ShoppingCart },
  { name: "WooCommerce", category: "E-Commerce", color: "#96588A", url: "https://woocommerce.com/my-account", description: "WordPress e-commerce plugin", icon: ShoppingCart },
  { name: "BigCommerce", category: "E-Commerce", color: "#34313F", url: "https://login.bigcommerce.com", description: "E-commerce for growing brands", icon: ShoppingCart },
  { name: "Amazon Seller Central", category: "E-Commerce", color: "#FF9900", url: "https://sellercentral.amazon.com", description: "Amazon marketplace management", icon: ShoppingCart },
  { name: "Etsy", category: "E-Commerce", color: "#F1641E", url: "https://www.etsy.com/your/shops/me/dashboard", description: "Handmade & vintage marketplace", icon: ShoppingCart },
  { name: "eBay", category: "E-Commerce", color: "#E53238", url: "https://www.ebay.com/sh/ovw", description: "Online auction & sales", icon: ShoppingCart },
  { name: "Squarespace", category: "E-Commerce", color: "#1A1A1A", url: "https://account.squarespace.com", description: "Website builder & commerce", icon: ShoppingCart },
  { name: "Wix", category: "E-Commerce", color: "#0C6EFC", url: "https://manage.wix.com", description: "Website builder & e-commerce", icon: ShoppingCart },
  { name: "Printful", category: "E-Commerce", color: "#28303F", url: "https://www.printful.com/dashboard", description: "Print-on-demand fulfillment", icon: ShoppingCart },
  { name: "Printify", category: "E-Commerce", color: "#39B54A", url: "https://printify.com/app", description: "Print-on-demand platform", icon: ShoppingCart },
  { name: "Gumroad", category: "E-Commerce", color: "#FF90E8", url: "https://app.gumroad.com", description: "Sell digital products", icon: ShoppingCart },
  { name: "Lemonsqueezy", category: "E-Commerce", color: "#FFC233", url: "https://app.lemonsqueezy.com", description: "Digital product payments", icon: ShoppingCart },

  { name: "WordPress", category: "CMS", color: "#21759B", url: "https://wordpress.com/home", description: "Website builder & CMS", icon: Globe },
  { name: "Webflow", category: "CMS", color: "#4353FF", url: "https://webflow.com/dashboard", description: "No-code website builder", icon: Globe },
  { name: "Ghost", category: "CMS", color: "#15171A", url: "https://ghost.org/dashboard", description: "Publishing & newsletter platform", icon: Globe },
  { name: "Contentful", category: "CMS", color: "#2478CC", url: "https://app.contentful.com", description: "Headless CMS platform", icon: Globe },
  { name: "Strapi", category: "CMS", color: "#4945FF", url: "https://cloud.strapi.io", description: "Open-source headless CMS", icon: Globe },
  { name: "Sanity", category: "CMS", color: "#F36458", url: "https://www.sanity.io/manage", description: "Structured content platform", icon: Globe },
  { name: "Prismic", category: "CMS", color: "#5163BA", url: "https://prismic.io/dashboard", description: "Headless page builder", icon: Globe },
  { name: "Framer", category: "CMS", color: "#0055FF", url: "https://framer.com/projects", description: "No-code website builder", icon: Globe },
  { name: "Carrd", category: "CMS", color: "#2E3138", url: "https://carrd.co/dashboard", description: "Simple one-page sites", icon: Globe },

  { name: "Zendesk", category: "Support", color: "#03363D", url: "https://www.zendesk.com/login", description: "Customer service & ticketing", icon: MessageSquare },
  { name: "Freshdesk", category: "Support", color: "#25C16F", url: "https://freshdesk.com/login", description: "Helpdesk & customer support", icon: MessageSquare },
  { name: "Intercom", category: "Support", color: "#1F8DED", url: "https://app.intercom.com", description: "Customer messaging & chatbots", icon: MessageSquare },
  { name: "Help Scout", category: "Support", color: "#1292EE", url: "https://secure.helpscout.net", description: "Email-based customer support", icon: MessageSquare },
  { name: "Crisp", category: "Support", color: "#4A90D9", url: "https://app.crisp.chat", description: "Business messaging platform", icon: MessageSquare },
  { name: "Drift", category: "Support", color: "#0176FF", url: "https://app.drift.com", description: "Conversational marketing", icon: MessageSquare },
  { name: "LiveChat", category: "Support", color: "#FF5100", url: "https://my.livechatinc.com", description: "Live chat for websites", icon: MessageSquare },
  { name: "Gorgias", category: "Support", color: "#1F2937", url: "https://app.gorgias.com", description: "E-commerce customer support", icon: MessageSquare },
  { name: "Front", category: "Support", color: "#1672EC", url: "https://app.frontapp.com", description: "Shared inbox for teams", icon: MessageSquare },
  { name: "Tidio", category: "Support", color: "#0046E3", url: "https://www.tidio.com/panel", description: "Live chat & AI chatbots", icon: MessageSquare },

  { name: "Figma", category: "Design", color: "#F24E1E", url: "https://www.figma.com", description: "Collaborative UI/UX design", icon: Layout },
  { name: "Canva", category: "Design", color: "#00C4CC", url: "https://www.canva.com", description: "Graphic design & templates", icon: Layout },
  { name: "Adobe Creative Cloud", category: "Design", color: "#FF0000", url: "https://creativecloud.adobe.com", description: "Photoshop, Illustrator & more", icon: Camera },
  { name: "InVision", category: "Design", color: "#FF3366", url: "https://projects.invisionapp.com", description: "Design prototyping & review", icon: Layout },
  { name: "Sketch", category: "Design", color: "#F7B500", url: "https://www.sketch.com/workspace", description: "Mac UI/UX design tool", icon: Layout },
  { name: "Adobe Photoshop", category: "Design", color: "#31A8FF", url: "https://photoshop.adobe.com", description: "Photo editing & compositing", icon: Camera },
  { name: "Adobe Illustrator", category: "Design", color: "#FF9A00", url: "https://illustrator.adobe.com", description: "Vector graphics editor", icon: Camera },
  { name: "Lottie", category: "Design", color: "#00DDB3", url: "https://app.lottiefiles.com", description: "Lightweight animations", icon: Layout },
  { name: "Coolors", category: "Design", color: "#0066FF", url: "https://coolors.co", description: "Color palette generator", icon: Layout },
  { name: "Dribbble", category: "Design", color: "#EA4C89", url: "https://dribbble.com", description: "Design portfolio & community", icon: Layout },
  { name: "Behance", category: "Design", color: "#1769FF", url: "https://www.behance.net", description: "Creative portfolio showcase", icon: Layout },

  { name: "GitHub", category: "Developer", color: "#181717", url: "https://github.com", description: "Code hosting & collaboration", icon: Code },
  { name: "GitLab", category: "Developer", color: "#FC6D26", url: "https://gitlab.com", description: "DevOps & CI/CD platform", icon: Code },
  { name: "Bitbucket", category: "Developer", color: "#0052CC", url: "https://bitbucket.org", description: "Git code management", icon: Code },
  { name: "Vercel", category: "Developer", color: "#000000", url: "https://vercel.com/dashboard", description: "Frontend deployment platform", icon: Code },
  { name: "Netlify", category: "Developer", color: "#00C7B7", url: "https://app.netlify.com", description: "Web hosting & CI/CD", icon: Code },
  { name: "Railway", category: "Developer", color: "#0B0D0E", url: "https://railway.app/dashboard", description: "Cloud app deployment", icon: Code },
  { name: "Render", category: "Developer", color: "#46E3B7", url: "https://dashboard.render.com", description: "Cloud hosting platform", icon: Code },
  { name: "Supabase", category: "Developer", color: "#3ECF8E", url: "https://supabase.com/dashboard", description: "Open-source Firebase alternative", icon: Code },
  { name: "Firebase", category: "Developer", color: "#FFCA28", url: "https://console.firebase.google.com", description: "Google app development platform", icon: Code },
  { name: "AWS Console", category: "Developer", color: "#FF9900", url: "https://console.aws.amazon.com", description: "Amazon Web Services dashboard", icon: Code },
  { name: "Google Cloud", category: "Developer", color: "#4285F4", url: "https://console.cloud.google.com", description: "Google Cloud Platform", icon: Code },
  { name: "Azure", category: "Developer", color: "#0078D4", url: "https://portal.azure.com", description: "Microsoft cloud platform", icon: Code },
  { name: "Docker Hub", category: "Developer", color: "#2496ED", url: "https://hub.docker.com", description: "Container image registry", icon: Code },
  { name: "Postman", category: "Developer", color: "#FF6C37", url: "https://web.postman.co", description: "API development & testing", icon: Code },
  { name: "Sentry", category: "Developer", color: "#362D59", url: "https://sentry.io", description: "Error tracking & monitoring", icon: Code },
  { name: "PlanetScale", category: "Developer", color: "#000000", url: "https://app.planetscale.com", description: "Serverless MySQL platform", icon: Code },
  { name: "Cloudflare", category: "Developer", color: "#F38020", url: "https://dash.cloudflare.com", description: "CDN & web security", icon: Shield },
  { name: "DigitalOcean", category: "Developer", color: "#0080FF", url: "https://cloud.digitalocean.com", description: "Cloud infrastructure provider", icon: Code },
  { name: "Fly.io", category: "Developer", color: "#7B3FE4", url: "https://fly.io/dashboard", description: "Edge app hosting platform", icon: Code },
  { name: "Replit", category: "Developer", color: "#F26207", url: "https://replit.com", description: "Online IDE & deployment", icon: Code },
  { name: "Stack Overflow", category: "Developer", color: "#F48024", url: "https://stackoverflow.com", description: "Developer Q&A community", icon: Code },
  { name: "npm", category: "Developer", color: "#CB3837", url: "https://www.npmjs.com", description: "Node.js package registry", icon: Code },

  { name: "Google Drive", category: "Cloud Storage", color: "#4285F4", url: "https://drive.google.com", description: "Cloud file storage by Google", icon: Folder },
  { name: "Dropbox", category: "Cloud Storage", color: "#0061FF", url: "https://www.dropbox.com/home", description: "Cloud file sync & sharing", icon: Folder },
  { name: "OneDrive", category: "Cloud Storage", color: "#0078D4", url: "https://onedrive.live.com", description: "Microsoft cloud storage", icon: Folder },
  { name: "Box", category: "Cloud Storage", color: "#0061D5", url: "https://app.box.com", description: "Enterprise cloud storage", icon: Folder },
  { name: "iCloud", category: "Cloud Storage", color: "#3693F3", url: "https://www.icloud.com", description: "Apple cloud storage & apps", icon: Folder },
  { name: "pCloud", category: "Cloud Storage", color: "#1FA3E0", url: "https://my.pcloud.com", description: "Encrypted cloud storage", icon: Folder },

  { name: "Google Docs", category: "Documents", color: "#4285F4", url: "https://docs.google.com", description: "Online document editor", icon: Layout },
  { name: "Google Sheets", category: "Documents", color: "#34A853", url: "https://sheets.google.com", description: "Online spreadsheets", icon: Layout },
  { name: "Google Slides", category: "Documents", color: "#FBBC05", url: "https://slides.google.com", description: "Online presentations", icon: Layout },
  { name: "Microsoft Word", category: "Documents", color: "#2B579A", url: "https://www.office.com/launch/word", description: "Online word processing", icon: Layout },
  { name: "Microsoft Excel", category: "Documents", color: "#217346", url: "https://www.office.com/launch/excel", description: "Online spreadsheets", icon: Layout },
  { name: "Microsoft PowerPoint", category: "Documents", color: "#B7472A", url: "https://www.office.com/launch/powerpoint", description: "Online presentations", icon: Layout },
  { name: "DocuSign", category: "Documents", color: "#FFBE00", url: "https://app.docusign.com", description: "Electronic signatures & agreements", icon: Layout },
  { name: "PandaDoc", category: "Documents", color: "#36B37E", url: "https://app.pandadoc.com", description: "Document automation & e-sign", icon: Layout },
  { name: "HelloSign", category: "Documents", color: "#00B4D8", url: "https://app.hellosign.com", description: "E-signatures by Dropbox", icon: Layout },

  { name: "BambooHR", category: "HR", color: "#73C41D", url: "https://app.bamboohr.com", description: "HR management for SMBs", icon: Users },
  { name: "Gusto", category: "HR", color: "#F45D48", url: "https://app.gusto.com", description: "Payroll & benefits platform", icon: Users },
  { name: "Rippling", category: "HR", color: "#FCC419", url: "https://app.rippling.com", description: "HR, IT & finance platform", icon: Users },
  { name: "Deel", category: "HR", color: "#15357A", url: "https://app.deel.com", description: "Global payroll & compliance", icon: Users },
  { name: "Workday", category: "HR", color: "#0066CC", url: "https://www.workday.com", description: "Enterprise HR & finance", icon: Users },
  { name: "Lattice", category: "HR", color: "#B856F6", url: "https://app.lattice.com", description: "Performance management", icon: Users },
  { name: "Greenhouse", category: "HR", color: "#3B8427", url: "https://app.greenhouse.io", description: "Applicant tracking & hiring", icon: Users },
  { name: "Lever", category: "HR", color: "#3C5BFF", url: "https://hire.lever.co", description: "Recruiting & talent management", icon: Users },
  { name: "JustWorks", category: "HR", color: "#162B4D", url: "https://secure.justworks.com", description: "Payroll & compliance platform", icon: Users },
  { name: "ADP", category: "HR", color: "#D11124", url: "https://online.adp.com", description: "Payroll & HR services", icon: Users },
  { name: "Paychex", category: "HR", color: "#004990", url: "https://www.paychex.com/login", description: "Payroll & HR solutions", icon: Users },

  { name: "Zapier", category: "Automation", color: "#FF4A00", url: "https://zapier.com/app/dashboard", description: "Connect & automate apps", icon: Zap },
  { name: "Make", category: "Automation", color: "#6D00CC", url: "https://www.make.com/en/login", description: "Visual automation platform", icon: Zap },
  { name: "n8n", category: "Automation", color: "#EA4B71", url: "https://app.n8n.cloud", description: "Open-source workflow automation", icon: Zap },
  { name: "IFTTT", category: "Automation", color: "#33CCFF", url: "https://ifttt.com/home", description: "Simple app automation", icon: Zap },
  { name: "Tray.io", category: "Automation", color: "#1A74E2", url: "https://app.tray.io", description: "Enterprise integration platform", icon: Zap },
  { name: "Workato", category: "Automation", color: "#325DE8", url: "https://app.workato.com", description: "Enterprise automation platform", icon: Zap },

  { name: "ChatGPT", category: "AI", color: "#10A37F", url: "https://chat.openai.com", description: "OpenAI conversational AI", icon: Zap },
  { name: "Claude", category: "AI", color: "#CC785C", url: "https://claude.ai", description: "Anthropic AI assistant", icon: Zap },
  { name: "Gemini", category: "AI", color: "#4285F4", url: "https://gemini.google.com", description: "Google AI assistant", icon: Zap },
  { name: "Midjourney", category: "AI", color: "#1A1A2E", url: "https://www.midjourney.com", description: "AI image generation", icon: Camera },
  { name: "Perplexity", category: "AI", color: "#1FB8CD", url: "https://www.perplexity.ai", description: "AI-powered search engine", icon: Zap },
  { name: "Jasper", category: "AI", color: "#F24E1E", url: "https://app.jasper.ai", description: "AI content creation", icon: Zap },
  { name: "Copy.ai", category: "AI", color: "#7C3AED", url: "https://app.copy.ai", description: "AI marketing copywriting", icon: Zap },
  { name: "Runway", category: "AI", color: "#FFFFFF", url: "https://app.runwayml.com", description: "AI video generation & editing", icon: Camera },
  { name: "ElevenLabs", category: "AI", color: "#1A1A1A", url: "https://elevenlabs.io", description: "AI voice synthesis", icon: Music },
  { name: "Otter.ai", category: "AI", color: "#3B82F6", url: "https://otter.ai", description: "AI meeting transcription", icon: Zap },
  { name: "Descript", category: "AI", color: "#0E0F0F", url: "https://www.descript.com", description: "AI audio & video editing", icon: Music },
  { name: "Grammarly", category: "AI", color: "#15C39A", url: "https://app.grammarly.com", description: "AI writing assistant", icon: Zap },

  { name: "Facebook", category: "Social Media", color: "#1877F2", url: "https://www.facebook.com", description: "Facebook social network", icon: Globe },
  { name: "Instagram", category: "Social Media", color: "#E4405F", url: "https://www.instagram.com", description: "Photo & video sharing", icon: Camera },
  { name: "X (Twitter)", category: "Social Media", color: "#000000", url: "https://x.com", description: "Social media & news platform", icon: Globe },
  { name: "LinkedIn", category: "Social Media", color: "#0A66C2", url: "https://www.linkedin.com", description: "Professional networking", icon: Users },
  { name: "TikTok", category: "Social Media", color: "#000000", url: "https://www.tiktok.com", description: "Short-form video platform", icon: Camera },
  { name: "Pinterest", category: "Social Media", color: "#E60023", url: "https://www.pinterest.com", description: "Visual discovery & ideas", icon: Camera },
  { name: "Reddit", category: "Social Media", color: "#FF4500", url: "https://www.reddit.com", description: "Community forums & discussions", icon: Globe },
  { name: "YouTube Studio", category: "Social Media", color: "#FF0000", url: "https://studio.youtube.com", description: "YouTube channel management", icon: Camera },
  { name: "Threads", category: "Social Media", color: "#000000", url: "https://www.threads.net", description: "Text-based social by Meta", icon: Globe },
  { name: "Bluesky", category: "Social Media", color: "#0085FF", url: "https://bsky.app", description: "Decentralized social network", icon: Globe },

  { name: "1Password", category: "Security", color: "#0094F5", url: "https://my.1password.com", description: "Password manager for teams", icon: Shield },
  { name: "LastPass", category: "Security", color: "#D32D27", url: "https://lastpass.com/vault", description: "Password vault & manager", icon: Shield },
  { name: "Bitwarden", category: "Security", color: "#175DDC", url: "https://vault.bitwarden.com", description: "Open-source password manager", icon: Shield },
  { name: "Dashlane", category: "Security", color: "#0E6245", url: "https://app.dashlane.com", description: "Password & identity manager", icon: Shield },
  { name: "Okta", category: "Security", color: "#007DC1", url: "https://login.okta.com", description: "Identity & access management", icon: Shield },
  { name: "Auth0", category: "Security", color: "#EB5424", url: "https://manage.auth0.com", description: "Authentication platform", icon: Shield },
  { name: "NordVPN", category: "Security", color: "#4687FF", url: "https://my.nordaccount.com", description: "VPN & online security", icon: Shield },

  { name: "Spotify", category: "Media", color: "#1DB954", url: "https://open.spotify.com", description: "Music streaming", icon: Music },
  { name: "YouTube", category: "Media", color: "#FF0000", url: "https://www.youtube.com", description: "Video streaming platform", icon: Camera },
  { name: "Apple Music", category: "Media", color: "#FA2D48", url: "https://music.apple.com", description: "Music streaming by Apple", icon: Music },
  { name: "Netflix", category: "Media", color: "#E50914", url: "https://www.netflix.com", description: "Video streaming service", icon: Camera },
  { name: "Twitch", category: "Media", color: "#9146FF", url: "https://www.twitch.tv", description: "Live streaming platform", icon: Camera },
  { name: "SoundCloud", category: "Media", color: "#FF5500", url: "https://soundcloud.com", description: "Music sharing platform", icon: Music },

  { name: "Teachable", category: "Education", color: "#000000", url: "https://teachable.com/login", description: "Online course platform", icon: Globe },
  { name: "Thinkific", category: "Education", color: "#4E79FF", url: "https://app.thinkific.com", description: "Course creation & sales", icon: Globe },
  { name: "Kajabi", category: "Education", color: "#2B4DFF", url: "https://app.kajabi.com", description: "Knowledge commerce platform", icon: Globe },
  { name: "Udemy", category: "Education", color: "#A435F0", url: "https://www.udemy.com/instructor", description: "Online learning marketplace", icon: Globe },
  { name: "Coursera", category: "Education", color: "#0056D2", url: "https://www.coursera.org", description: "Online courses & degrees", icon: Globe },
  { name: "Skillshare", category: "Education", color: "#00FF84", url: "https://www.skillshare.com", description: "Creative learning community", icon: Globe },

  { name: "ShipStation", category: "Logistics", color: "#85B538", url: "https://ss.shipstation.com", description: "Shipping & order management", icon: Truck },
  { name: "ShipBob", category: "Logistics", color: "#6F52ED", url: "https://app.shipbob.com", description: "E-commerce fulfillment", icon: Truck },
  { name: "Shippo", category: "Logistics", color: "#2FA1DB", url: "https://app.goshippo.com", description: "Multi-carrier shipping API", icon: Truck },
  { name: "EasyPost", category: "Logistics", color: "#338EF7", url: "https://www.easypost.com/login", description: "Shipping API platform", icon: Truck },
  { name: "FedEx", category: "Logistics", color: "#4D148C", url: "https://www.fedex.com/en-us/shipping.html", description: "FedEx shipping management", icon: Truck },
  { name: "UPS", category: "Logistics", color: "#351C15", url: "https://www.ups.com/ship", description: "UPS shipping & tracking", icon: Truck },
  { name: "USPS", category: "Logistics", color: "#004B87", url: "https://www.usps.com", description: "US Postal Service", icon: Truck },
];

export const BUILTIN_CATEGORIES = Array.from(new Set(APP_CATALOG.map(a => a.category)));

interface AddAppWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFirstApp?: boolean;
}

export function AddAppWizard({ open, onOpenChange, isFirstApp = false }: AddAppWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedApp, setSelectedApp] = useState<typeof APP_CATALOG[0] | null>(null);
  const [customName, setCustomName] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [customCategory, setCustomCategory] = useState("Other");
  const [customColor, setCustomColor] = useState("#6366F1");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isFavorite, setIsFavorite] = useState(true);
  const [isCustom, setIsCustom] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Folder");
  const [newCatColor, setNewCatColor] = useState("#6366F1");
  const queryClient = useQueryClient();

  const { data: customCategories = [] } = useQuery<AppCategory[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createCategory = useMutation({
    mutationFn: async (data: { name: string; icon: string; color: string }) => {
      const res = await apiRequest("POST", "/api/categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setShowNewCategory(false);
      setNewCatName("");
      setNewCatIcon("Folder");
      setNewCatColor("#6366F1");
    },
  });

  const allCategories = useMemo(() => {
    const customNames = customCategories.map(c => c.name);
    return ["All", ...BUILTIN_CATEGORIES, ...customNames.filter(n => !BUILTIN_CATEGORIES.includes(n))];
  }, [customCategories]);

  const filteredApps = useMemo(() => {
    return APP_CATALOG.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || app.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const addApp = useMutation({
    mutationFn: async (data: { name: string; category: string; color: string; url: string; isFavorite: boolean }) => {
      const res = await apiRequest("POST", "/api/apps", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
      setStep(2);
    },
  });

  const handleSelectApp = (app: typeof APP_CATALOG[0]) => {
    setSelectedApp(app);
    setIsCustom(false);
    setStep(1);
  };

  const handleCustomApp = () => {
    setSelectedApp(null);
    setIsCustom(true);
    setCustomName("");
    setCustomUrl("");
    setStep(1);
  };

  const handleConnect = () => {
    if (isCustom) {
      addApp.mutate({
        name: customName,
        category: customCategory,
        color: customColor,
        url: customUrl || "",
        isFavorite,
      });
    } else if (selectedApp) {
      addApp.mutate({
        name: selectedApp.name,
        category: selectedApp.category,
        color: selectedApp.color,
        url: selectedApp.url,
        isFavorite,
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(0);
      setSelectedApp(null);
      setSearchQuery("");
      setActiveCategory("All");
      setIsCustom(false);
      setCustomName("");
      setCustomUrl("");
    }, 300);
  };

  const handleAddAnother = () => {
    setStep(0);
    setSelectedApp(null);
    setSearchQuery("");
    setActiveCategory("All");
    setIsCustom(false);
    setCustomName("");
    setCustomUrl("");
  };

  const appName = isCustom ? customName : selectedApp?.name;
  const appColor = isCustom ? customColor : selectedApp?.color;
  const appUrl = isCustom ? customUrl : selectedApp?.url;

  if (isFirstApp && open) {
    return (
      <div className="w-full h-full overflow-y-auto">
        <div className="w-full px-8 pt-6 pb-16">
          {step === 0 && (
            <div className="text-center mb-8">
              <img src={hubLogo} alt="HUB Logo" className="h-72 w-auto mx-auto -mb-10" />
              <h2 className="text-3xl font-display font-bold text-white mb-2">Welcome to HUB!</h2>
              <p className="text-base text-muted-foreground max-w-lg mx-auto">
                Connect your first app to get started. Pick a service you use every day and access it with one click.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="mb-6">
              <button onClick={() => setStep(0)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-4" data-testid="button-wizard-back">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <h2 className="text-2xl font-display font-bold text-white">Set up connection</h2>
              <p className="text-sm text-muted-foreground mt-1">Configure {appName || "your app"}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="browse" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <FirstAppBrowseStep
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  filteredApps={filteredApps}
                  onSelect={handleSelectApp}
                  onCustom={handleCustomApp}
                  onSkip={handleClose}
                  allCategories={allCategories}
                  showNewCategory={showNewCategory}
                  setShowNewCategory={setShowNewCategory}
                  newCatName={newCatName}
                  setNewCatName={setNewCatName}
                  newCatIcon={newCatIcon}
                  setNewCatIcon={setNewCatIcon}
                  newCatColor={newCatColor}
                  setNewCatColor={setNewCatColor}
                  onCreateCategory={() => createCategory.mutate({ name: newCatName, icon: newCatIcon, color: newCatColor })}
                  isCreatingCategory={createCategory.isPending}
                />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="configure" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <ConfigureStep
                  selectedApp={selectedApp}
                  isCustom={isCustom}
                  customName={customName}
                  setCustomName={setCustomName}
                  customUrl={customUrl}
                  setCustomUrl={setCustomUrl}
                  customCategory={customCategory}
                  setCustomCategory={setCustomCategory}
                  customColor={customColor}
                  setCustomColor={setCustomColor}
                  isFavorite={isFavorite}
                  setIsFavorite={setIsFavorite}
                  onConnect={handleConnect}
                  isPending={addApp.isPending}
                  customCategories={customCategories}
                />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                <SuccessStep
                  appName={appName || ""}
                  appColor={appColor || "#6366F1"}
                  appUrl={appUrl || ""}
                  onLaunch={() => { if (appUrl) window.open(appUrl, "_blank"); }}
                  onAddAnother={handleAddAnother}
                  onClose={handleClose}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[min(768px,calc(100vw-2rem))] max-h-[85vh] p-0 bg-[#0f0f0f] border-white/10 overflow-hidden gap-0 [&>button]:hidden rounded-2xl flex flex-col">
        <VisuallyHidden><DialogTitle>Add Application</DialogTitle></VisuallyHidden>
        <div className="flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            {step > 0 && step < 2 && (
              <button onClick={() => setStep(step - 1)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors" data-testid="button-wizard-back">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-display font-semibold text-white">
                {step === 0 ? "Add Application" : step === 1 ? "Set up connection" : "Connected!"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {step === 0 ? "Choose from popular apps or add a custom one"
                  : step === 1 ? `Configure ${appName || "your app"}`
                  : `${appName} is ready to launch`}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors" data-testid="button-wizard-close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="browse" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                <BrowseStep
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  filteredApps={filteredApps}
                  onSelect={handleSelectApp}
                  onCustom={handleCustomApp}
                  allCategories={allCategories}
                  showNewCategory={showNewCategory}
                  setShowNewCategory={setShowNewCategory}
                  newCatName={newCatName}
                  setNewCatName={setNewCatName}
                  newCatIcon={newCatIcon}
                  setNewCatIcon={setNewCatIcon}
                  newCatColor={newCatColor}
                  setNewCatColor={setNewCatColor}
                  onCreateCategory={() => createCategory.mutate({ name: newCatName, icon: newCatIcon, color: newCatColor })}
                  isCreatingCategory={createCategory.isPending}
                />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="configure" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <ConfigureStep
                  selectedApp={selectedApp}
                  isCustom={isCustom}
                  customName={customName}
                  setCustomName={setCustomName}
                  customUrl={customUrl}
                  setCustomUrl={setCustomUrl}
                  customCategory={customCategory}
                  setCustomCategory={setCustomCategory}
                  customColor={customColor}
                  setCustomColor={setCustomColor}
                  isFavorite={isFavorite}
                  setIsFavorite={setIsFavorite}
                  onConnect={handleConnect}
                  isPending={addApp.isPending}
                  customCategories={customCategories}
                />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                <SuccessStep
                  appName={appName || ""}
                  appColor={appColor || "#6366F1"}
                  appUrl={appUrl || ""}
                  onLaunch={() => { if (appUrl) window.open(appUrl, "_blank"); }}
                  onAddAnother={handleAddAnother}
                  onClose={handleClose}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NewCategoryForm({ newCatName, setNewCatName, newCatIcon, setNewCatIcon, newCatColor, setNewCatColor, onCreateCategory, isCreatingCategory, onCancel }: any) {
  return (
    <div className="p-4 rounded-xl bg-[#0f0f0f] border border-white/10 space-y-3" data-testid="form-new-category">
      <div className="space-y-1.5">
        <Label className="text-xs text-white">Name</Label>
        <Input
          placeholder="Category name"
          value={newCatName}
          onChange={(e: any) => setNewCatName(e.target.value)}
          className="bg-white/5 border-white/10 h-9 text-sm"
          data-testid="input-category-name"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-white">Icon</Label>
        <div className="grid grid-cols-10 gap-1">
          {ICON_NAMES.map((name) => {
            const IconComp = ICON_MAP[name];
            return (
              <button
                key={name}
                onClick={() => setNewCatIcon(name)}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  newCatIcon === name
                    ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                )}
                data-testid={`button-icon-${name.toLowerCase()}`}
              >
                <IconComp className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-white">Color</Label>
        <div className="flex gap-2">
          {CATEGORY_COLOR_OPTIONS.map(c => (
            <button
              key={c}
              onClick={() => setNewCatColor(c)}
              className={cn(
                "w-6 h-6 rounded-full transition-all",
                newCatColor === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#0f0f0f] scale-110" : "hover:scale-110"
              )}
              style={{ background: c }}
              data-testid={`button-color-${c.replace('#', '')}`}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          onClick={onCreateCategory}
          disabled={!newCatName.trim() || isCreatingCategory}
          className="h-8 text-xs bg-primary hover:bg-primary/90"
          data-testid="button-create-category"
        >
          {isCreatingCategory ? <Loader2 className="h-3 w-3 animate-spin" /> : "Create"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="h-8 text-xs text-muted-foreground hover:text-white"
          data-testid="button-cancel-category"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

function FirstAppBrowseStep({ searchQuery, setSearchQuery, activeCategory, setActiveCategory, filteredApps, onSelect, onCustom, onSkip, allCategories, showNewCategory, setShowNewCategory, newCatName, setNewCatName, newCatIcon, setNewCatIcon, newCatColor, setNewCatColor, onCreateCategory, isCreatingCategory }: any) {
  return (
    <div className="space-y-5">
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search for an app..."
          value={searchQuery}
          onChange={(e: any) => setSearchQuery(e.target.value)}
          className="pl-12 bg-white/5 border-white/10 h-12 text-base rounded-xl"
          data-testid="input-search-apps"
        />
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {allCategories.map((cat: string) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
              activeCategory === cat
                ? "bg-primary/20 text-primary border-primary/30"
                : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-white"
            )}
            data-testid={`button-category-${cat.toLowerCase()}`}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={() => setShowNewCategory(!showNewCategory)}
          className="px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-white"
          data-testid="button-new-category"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {showNewCategory && (
        <div className="max-w-md mx-auto">
          <NewCategoryForm
            newCatName={newCatName}
            setNewCatName={setNewCatName}
            newCatIcon={newCatIcon}
            setNewCatIcon={setNewCatIcon}
            newCatColor={newCatColor}
            setNewCatColor={setNewCatColor}
            onCreateCategory={onCreateCategory}
            isCreatingCategory={isCreatingCategory}
            onCancel={() => setShowNewCategory(false)}
          />
        </div>
      )}

      <div className="grid grid-cols-5 gap-3">
        {filteredApps.map((app: any) => (
          <motion.button
            key={app.name}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(app)}
            className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all text-center group"
            data-testid={`card-catalog-${app.name.toLowerCase().replace(/\s/g, '-')}`}
          >
            <AppIcon name={app.name} url={app.url} color={app.color} size={48} className="shadow-lg group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">{app.name}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{app.description}</p>
            </div>
          </motion.button>
        ))}

        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onCustom}
          className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-dashed border-white/10 hover:bg-white/5 hover:border-white/20 transition-all text-center group"
          data-testid="button-custom-app"
        >
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 text-muted-foreground group-hover:text-white transition-colors">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground group-hover:text-white transition-colors">Custom App</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Add any website</p>
          </div>
        </motion.button>
      </div>

      <div className="pt-2 text-center">
        <button
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/50"
          data-testid="button-skip-setup"
        >
          I'll do this later
        </button>
      </div>
    </div>
  );
}

function BrowseStep({ searchQuery, setSearchQuery, activeCategory, setActiveCategory, filteredApps, onSelect, onCustom, allCategories, showNewCategory, setShowNewCategory, newCatName, setNewCatName, newCatIcon, setNewCatIcon, newCatColor, setNewCatColor, onCreateCategory, isCreatingCategory }: any) {
  return (
    <div className="p-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search apps..."
          value={searchQuery}
          onChange={(e: any) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 h-10"
          data-testid="input-search-apps"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {allCategories.map((cat: string) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
              activeCategory === cat
                ? "bg-primary/20 text-primary border-primary/30"
                : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-white"
            )}
            data-testid={`button-category-${cat.toLowerCase()}`}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={() => setShowNewCategory(!showNewCategory)}
          className="px-2 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-white"
          data-testid="button-new-category"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {showNewCategory && (
        <NewCategoryForm
          newCatName={newCatName}
          setNewCatName={setNewCatName}
          newCatIcon={newCatIcon}
          setNewCatIcon={setNewCatIcon}
          newCatColor={newCatColor}
          setNewCatColor={setNewCatColor}
          onCreateCategory={onCreateCategory}
          isCreatingCategory={isCreatingCategory}
          onCancel={() => setShowNewCategory(false)}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
        {filteredApps.map((app: any) => (
          <button
            key={app.name}
            onClick={() => onSelect(app)}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/15 transition-all text-left group"
            data-testid={`card-catalog-${app.name.toLowerCase().replace(/\s/g, '-')}`}
          >
            <AppIcon name={app.name} url={app.url} color={app.color} size={40} className="flex-shrink-0 shadow-lg" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">{app.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{app.description}</p>
            </div>
          </button>
        ))}

        <button
          onClick={onCustom}
          className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10 hover:bg-white/5 hover:border-white/20 transition-all text-left group"
          data-testid="button-custom-app"
        >
          <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-muted-foreground group-hover:text-white transition-colors flex-shrink-0">
            <Globe className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground group-hover:text-white transition-colors">Custom App</p>
            <p className="text-[11px] text-muted-foreground">Add any website or app</p>
          </div>
        </button>
      </div>
    </div>
  );
}

const COLOR_OPTIONS = ["#6366F1", "#3B82F6", "#22C55E", "#EF4444", "#F59E0B", "#EC4899", "#8B5CF6", "#14B8A6", "#FF6B35", "#117ACA"];

function ConfigureStep({ selectedApp, isCustom, customName, setCustomName, customUrl, setCustomUrl, customCategory, setCustomCategory, customColor, setCustomColor, isFavorite, setIsFavorite, onConnect, isPending, customCategories = [] }: any) {
  const appName = isCustom ? customName : selectedApp?.name;
  const appColor = isCustom ? customColor : selectedApp?.color;
  const appUrl = isCustom ? customUrl : selectedApp?.url;
  const canConnect = isCustom ? customName.trim().length > 0 : true;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
        <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg" style={{ background: appColor || "#6366F1" }}>
          {(appName || "?")[0]}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{appName || "Your App"}</h3>
          {!isCustom && selectedApp && (
            <p className="text-sm text-muted-foreground">{selectedApp.description}</p>
          )}
        </div>
      </div>

      {isCustom && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-white">App Name</Label>
            <Input
              placeholder="e.g., My CRM, Company Portal"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              className="bg-white/5 border-white/10 h-11"
              data-testid="input-custom-name"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-white">Website URL</Label>
            <Input
              placeholder="https://example.com"
              value={customUrl}
              onChange={e => setCustomUrl(e.target.value)}
              className="bg-white/5 border-white/10 h-11"
              data-testid="input-custom-url"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-white">Category</Label>
            <div className="flex flex-wrap gap-2">
              {[...new Set(["CRM", "Finance", "Marketing", "Communication", "Productivity", "Banking", "Other", ...customCategories.map((c: any) => c.name)])].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCustomCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    customCategory === cat
                      ? "bg-primary/20 text-primary border-primary/30"
                      : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-white">Color</Label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => setCustomColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    customColor === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#0f0f0f] scale-110" : "hover:scale-110"
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {!isCustom && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Launch URL:</span>
              <span className="text-white font-medium truncate">{appUrl}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Clicking this app in your dashboard will open it in a new tab. HUB keeps all your apps one click away.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-2">
          <Star className={cn("h-4 w-4", isFavorite ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
          <span className="text-sm text-white">Add to favorites</span>
        </div>
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className={cn(
            "relative w-10 h-6 rounded-full transition-colors",
            isFavorite ? "bg-primary" : "bg-white/10"
          )}
          data-testid="toggle-favorite"
        >
          <div className={cn(
            "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
            isFavorite ? "translate-x-4.5 left-0" : "left-0.5"
          )} />
        </button>
      </div>

      <Button
        onClick={onConnect}
        disabled={isPending || !canConnect}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-base"
        data-testid="button-connect-app"
      >
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Connect {appName || "App"} <ArrowRight className="ml-2 h-4 w-4" /></>}
      </Button>
    </div>
  );
}

function SuccessStep({ appName, appColor, appUrl, onLaunch, onAddAnother, onClose }: any) {
  return (
    <div className="p-8 flex flex-col items-center text-center space-y-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="relative"
      >
        <div className="h-20 w-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-2xl" style={{ background: appColor }}>
          {appName[0]}
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
          <Check className="h-5 w-5 text-white" />
        </div>
      </motion.div>

      <div>
        <h3 className="text-2xl font-display font-bold text-white">{appName} connected!</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          You can now launch {appName} directly from your HUB dashboard with a single click.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {appUrl && (
          <Button onClick={onLaunch} className="w-full h-11 bg-primary hover:bg-primary/90" data-testid="button-launch-app">
            <ExternalLink className="mr-2 h-4 w-4" /> Launch {appName}
          </Button>
        )}
        <Button onClick={onAddAnother} variant="outline" className="w-full h-11 border-white/10 hover:bg-white/5" data-testid="button-add-another">
          Connect Another App
        </Button>
        <Button onClick={onClose} variant="ghost" className="w-full h-11 text-muted-foreground hover:text-white" data-testid="button-done">
          Done
        </Button>
      </div>
    </div>
  );
}
