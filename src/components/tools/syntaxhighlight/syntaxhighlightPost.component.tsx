import { codeToHtml } from "shiki";
import type { BundledLanguage, BundledTheme } from "shiki";
import {
  transformerNotationHighlight,
  transformerNotationDiff,
} from "@shikijs/transformers";
import CopyToClipboard from "./copyToClipboard.component";

type Props = {
  code: string;
  lang?: BundledLanguage;
  theme?: BundledTheme;
  filename?: string;
};

export default async function SyntaxHighlightPost({
  code,
  lang = "javascript",
  theme = "nord",
  filename,
}: Props) {
  const html = await codeToHtml(code, {
    lang,
    theme,
    transformers: [transformerNotationHighlight(), transformerNotationDiff()],
  });

  return (
    <div className="mt-4 rounded-lg bg-gradient-to-r from-sky-200 to-sky-400 p-4 md:p-8 lg:p-12 [&>pre]:rounded-none ">
      <div className="overflow-hidden rounded-s-lg">
        <div className="flex items-center justify-between bg-gradient-to-r from-neutral-900 to-neutral-800 py-2 pl-2 pr-4 text-sm">
          <span className="-mb-[calc(0.5rem+2px)] px-4 py-2 "></span>
          <CopyToClipboard code={code} />
        </div>
        <div
          className="border-t-2 border-neutral-700 text-sm [&>pre]:overflow-x-auto [&>pre]:!bg-neutral-900 [&>pre]:py-3 [&>pre]:pl-4 [&>pre]:pr-5 [&>pre]:leading-snug [&_code]:block [&_code]:w-fit [&_code]:min-w-full"
          dangerouslySetInnerHTML={{ __html: html }}
        ></div>
      </div>
    </div>
  );
}
