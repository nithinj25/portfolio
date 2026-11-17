import { site } from "@/data/site";
import { CodeIcon, FileIcon, GithubIcon, LinkedinIcon, MailIcon, XIcon } from "./icons";

// Round icon links: GitHub, X, LinkedIn, LeetCode, email, résumé.
// A link that is still empty in site.ts shows as a dashed TODO icon, or is
// left out entirely when `site.showTodos` is false.
const links = [
  { href: site.socials.github, label: "GitHub", Icon: GithubIcon },
  { href: site.socials.x, label: "X", Icon: XIcon },
  { href: site.socials.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
  { href: site.leetcode ? `https://leetcode.com/u/${site.leetcode}/` : "", label: "LeetCode", Icon: CodeIcon },
  { href: `mailto:${site.email}`, label: "Email", Icon: MailIcon },
  { href: site.resume, label: "Résumé", Icon: FileIcon },
];

export default function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-1 ${className}`}>
      {links
        .filter((l) => l.href || site.showTodos)
        .map(({ href, label, Icon }) => (
          <li key={label}>
            {href ? (
              <a
                href={href}
                target={href.startsWith("http") || href.endsWith(".pdf") ? "_blank" : undefined}
                rel="noreferrer"
                aria-label={label}
                title={label}
                className="grid size-11 place-items-center sm:size-9 rounded-full border border-line bg-bg text-muted transition hover:-translate-y-0.5 hover:border-faint hover:text-fg"
              >
                <Icon />
              </a>
            ) : (
              <span
                role="img"
                aria-label={`${label} (TODO: link not added yet)`}
                title={`TODO: add your ${label} link in src/data/site.ts`}
                className="grid size-11 place-items-center sm:size-9 rounded-full border border-dashed border-faint bg-bg text-faint"
              >
                <Icon />
              </span>
            )}
          </li>
        ))}
    </ul>
  );
}
