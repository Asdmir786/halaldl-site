import type { Metadata } from "next";
import { WindowsInstallContent } from "@/components/install/windows-install-content";
import { getGitHubSnapshot } from "@/lib/github";
import { getSocialImage } from "@/lib/site";
import { getBreadcrumbSchema, serializeJsonLd } from "@/lib/seo";

const INSTALL_META_TITLE = "How to Install HalalDL on Windows 10/11 and Verify SHA256";
const INSTALL_META_DESCRIPTION =
  "Install HalalDL on Windows 10/11 from official GitHub Releases. Choose Full, Lite, or Portable, then use SHA256SUMS.txt and PowerShell to verify the installer.";

const installSteps = [
  "Open the official GitHub Release.",
  "Choose Full unless you prefer managing more of the toolchain or want a Portable folder.",
  "Compare the installer against SHA256SUMS.txt before first run when you want the extra integrity check.",
  "Launch HalalDL; if Windows asks for confirmation, verify source and checksum before deciding how to continue.",
];

export const metadata: Metadata = {
  title: { absolute: INSTALL_META_TITLE },
  description: INSTALL_META_DESCRIPTION,
  alternates: { canonical: "/install/windows" },
  openGraph: { title: INSTALL_META_TITLE, description: INSTALL_META_DESCRIPTION, url: "/install/windows", type: "article", siteName: "HalalDL", images: getSocialImage("HalalDL Windows install guide social preview") },
  twitter: { card: "summary_large_image", title: INSTALL_META_TITLE, description: INSTALL_META_DESCRIPTION, images: ["/social/halaldl-social-preview.png"] },
};

export default async function InstallWindowsPage() {
  const github = await getGitHubSnapshot();
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: INSTALL_META_TITLE,
    description: INSTALL_META_DESCRIPTION,
    step: installSteps.map((text, index) => ({ "@type": "HowToStep", position: index + 1, name: ["Open the official release", "Choose a Windows build", "Verify the installer hash", "Launch after checking provenance"][index], text })),
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Which build should most people install?", acceptedAnswer: { "@type": "Answer", text: "Most people should install the Full build because it provides the smoother first-run path." } },
      { "@type": "Question", name: "Can I install HalalDL with WinGet?", acceptedAnswer: { "@type": "Answer", text: "Yes. WinGet is convenient, but GitHub Releases remains the direct source for the newest release assets and SHA256SUMS.txt." } },
      { "@type": "Question", name: "What should I do if SmartScreen warns?", acceptedAnswer: { "@type": "Answer", text: "Verify that the installer came from GitHub Releases and compare it against SHA256SUMS.txt before proceeding." } },
    ],
  };
  const breadcrumbSchema = getBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Install on Windows", path: "/install/windows" }]);

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(howToSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} /><WindowsInstallContent github={github} /></>;
}
