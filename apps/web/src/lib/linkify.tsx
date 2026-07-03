import { Fragment } from "react";

const URL_PATTERN = /(https?:\/\/[^\s<]+[^\s<.,;:!?)}\]"'])/g;

function isUrl(part: string) {
  return part.startsWith("http://") || part.startsWith("https://");
}

export function linkifyText(text: string) {
  const parts = text.split(URL_PATTERN);

  return parts.map((part, index) => {
    if (isUrl(part)) {
      return (
        <a
          key={`${part}-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-secondary underline underline-offset-2 hover:text-primary"
        >
          {part}
        </a>
      );
    }

    return <Fragment key={`${index}-${part.slice(0, 8)}`}>{part}</Fragment>;
  });
}
