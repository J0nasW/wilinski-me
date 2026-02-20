export interface SocialLink {
  id: string;
  label: string;
  href: string;
}

export const socialLinks: SocialLink[] = [
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/jonas-wilinski-a31a35143/" },
  { id: "github", label: "GitHub", href: "https://github.com/J0nasW" },
  { id: "x", label: "X", href: "https://x.com/Jonas_H_W" },
  { id: "bluesky", label: "Bluesky", href: "https://bsky.app/profile/jonashw.bsky.social" },
  { id: "orcid", label: "ORCID", href: "https://orcid.org/0009-0005-4672-7197" },
  { id: "huggingface", label: "HuggingFace", href: "https://huggingface.co/J0nasW" },
];
