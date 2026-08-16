import type { Metadata } from "next";
import { VerifyChecksumContent } from "@/components/trust/verify-checksum-content";
import { getGitHubSnapshot } from "@/lib/github";
import { getSocialImage } from "@/lib/site";
import { getBreadcrumbSchema, serializeJsonLd } from "@/lib/seo";

const TRUST_META_TITLE = "How to Verify SHA256 for a Windows Installer — HalalDL";
const TRUST_META_DESCRIPTION =
  "Verify a HalalDL Windows installer with SHA256SUMS.txt from the same GitHub Release. Use PowerShell, compare the exact hash, and handle SmartScreen without skipping provenance checks.";

function getDownloadFileName(downloadUrl: string, fallbackName: string) {
  try {
    return decodeURIComponent(new URL(downloadUrl).pathname.split("/").at(-1) ?? fallbackName);
  } catch {
    return fallbackName;
  }
}

function createHashCommand(fileName: string) {
  return [
    `$installer = Join-Path $env:USERPROFILE "Downloads\\${fileName}"`,
    '$checksums = Join-Path $env:USERPROFILE "Downloads\\SHA256SUMS.txt"',
    '$fileName = Split-Path $installer -Leaf',
    '$entry = Get-Content $checksums | Where-Object { $_ -match [regex]::Escape($fileName) } | Select-Object -First 1',
    'if (-not $entry) { "No checksum entry found for $fileName" } else { $expected = ($entry -split "\\s+")[0].ToLower(); $actual = (Get-FileHash $installer -Algorithm SHA256).Hash.ToLower(); if ($actual -eq $expected) { "SHA256 MATCH: $fileName" } else { "SHA256 MISMATCH: $fileName | Expected: $expected | Actual: $actual" } }',
  ].join("; ");
}

export const metadata: Metadata = {
  title: { absolute: TRUST_META_TITLE },
  description: TRUST_META_DESCRIPTION,
  alternates: { canonical: "/trust/verify-checksum" },
  openGraph: { title: TRUST_META_TITLE, description: TRUST_META_DESCRIPTION, url: "/trust/verify-checksum", type: "article", siteName: "HalalDL", images: getSocialImage("HalalDL SHA256 verification guide social preview") },
  twitter: { card: "summary_large_image", title: TRUST_META_TITLE, description: TRUST_META_DESCRIPTION, images: ["/social/halaldl-social-preview.png"] },
};

export default async function VerifyChecksumPage() {
  const github = await getGitHubSnapshot();
  const fullSetupName = getDownloadFileName(github.fullSetupUrl, "HalalDL-Full-setup.exe");
  const liteSetupName = getDownloadFileName(github.liteSetupUrl, "HalalDL-Lite-setup.exe");
  const verificationSteps = [
    "Download the installer and SHA256SUMS.txt from the exact same official GitHub Release.",
    "Calculate the SHA256 hash for the installer file you downloaded in PowerShell.",
    "Compare the output against the matching manifest line and continue only when the values match.",
  ];
  const howToSchema = { "@context": "https://schema.org", "@type": "HowTo", name: TRUST_META_TITLE, description: TRUST_META_DESCRIPTION, step: verificationSteps.map((text, index) => ({ "@type": "HowToStep", position: index + 1, name: ["Keep the release files together", "Calculate the local SHA256", "Compare the exact hash"][index], text })) };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Why should I verify SHA256?", acceptedAnswer: { "@type": "Answer", text: "A matching SHA256 value confirms that the local file matches the release asset hash published in the GitHub Release you checked." } },
      { "@type": "Question", name: "What if SmartScreen warns on first run?", acceptedAnswer: { "@type": "Answer", text: "Current installers are not code-signed yet. Confirm the GitHub Release source and compare SHA256 before deciding whether to continue." } },
      { "@type": "Question", name: "Should I verify Lite differently from Full?", acceptedAnswer: { "@type": "Answer", text: "No. Use the same process and compare the hash for the exact installer file you downloaded against its matching SHA256SUMS.txt line." } },
    ],
  };
  const breadcrumbSchema = getBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Verify SHA256", path: "/trust/verify-checksum" }]);

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(howToSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} /><VerifyChecksumContent github={github} fullSetupName={fullSetupName} liteSetupName={liteSetupName} fullHashCommand={createHashCommand(fullSetupName)} liteHashCommand={createHashCommand(liteSetupName)} /></>;
}
