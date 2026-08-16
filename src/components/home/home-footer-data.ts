import { SITE_LINKS } from "@/lib/site";

export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterLinkGroup = {
  label: string;
  links: FooterLink[];
};

export const HOME_FOOTER_GROUPS: FooterLinkGroup[] = [
  {
    label: "Product",
    links: [
      { label: "Download", href: "/download" },
      { label: "Full vs Lite", href: "/compare/full-vs-lite" },
      { label: "Release notes", href: "/changelog" },
    ],
  },
  {
    label: "Learn",
    links: [
      { label: "Windows install", href: "/install/windows" },
      { label: "Verify SHA256", href: "/trust/verify-checksum" },
      { label: "Guides", href: "/guides" },
    ],
  },
  {
    label: "Project",
    links: [
      { label: "GitHub", href: SITE_LINKS.repoUrl, external: true },
      { label: "Issues", href: SITE_LINKS.issuesUrl, external: true },
      { label: "Support", href: SITE_LINKS.supportUrl, external: true },
    ],
  },
];
