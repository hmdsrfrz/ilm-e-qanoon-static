import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/cn';

interface Props {
  content:    string;
  className?: string;
}

export default function MarkdownRenderer({ content, className }: Props) {
  return (
    <div className={cn('markdown-body', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // h1 — rarely used, large display
          h1: ({ children }) => (
            <h1 className="font-display text-pk-green text-3xl mt-6 mb-4 leading-none uppercase tracking-wide">
              {children}
            </h1>
          ),

          // h2 — section titles
          h2: ({ children }) => (
            <h2 className="font-display text-pk-paper text-xl mt-6 mb-3 leading-none uppercase tracking-wide">
              {children}
            </h2>
          ),

          // h3 — "Relevant Provisions", "Plain Language Explanation", "References"
          h3: ({ children }) => (
            <h3 className="font-mono text-pk-green text-[10px] uppercase tracking-[0.35em] mt-6 mb-3 pb-1.5 border-b border-pk-border flex items-center gap-2">
              <span className="text-pk-green opacity-50">//</span>
              {children}
            </h3>
          ),

          // h4 — article sub-headers (we've removed these from the prompt but keep the handler)
          h4: ({ children }) => (
            <h4 className="font-mono text-pk-paper/90 text-[12px] font-semibold mt-4 mb-1 uppercase tracking-wider">
              {children}
            </h4>
          ),

          // Body paragraphs
          p: ({ children }) => (
            <p className="font-mono text-[13px] text-pk-paper/90 leading-[1.85] mb-3">
              {children}
            </p>
          ),

          // Bullet lists
          ul: ({ children }) => (
            <ul className="my-2 space-y-1.5 list-none pl-0">{children}</ul>
          ),

          // Numbered lists
          ol: ({ children }) => (
            <ol className="my-2 space-y-1.5 list-none pl-0">{children}</ol>
          ),

          li: ({ children }) => (
            <li className="font-mono text-[13px] text-pk-paper/85 flex items-start gap-2.5">
              <span className="text-pk-green text-[9px] mt-[5px] flex-shrink-0">▸</span>
              <span className="flex-1 leading-[1.8]">{children}</span>
            </li>
          ),

          // **bold** — article numbers, key terms
          strong: ({ children }) => (
            <strong className="text-pk-paper font-semibold font-mono">{children}</strong>
          ),

          em: ({ children }) => (
            <em className="text-pk-paper/65 not-italic border-l border-pk-green/40 pl-3 block my-2 font-mono text-[12px] leading-relaxed">
              {children}
            </em>
          ),

          // Inline code — article refs like Art. 19
          code: ({ children }) => (
            <code className="font-mono text-[11px] text-pk-green bg-pk-green/10 px-1.5 py-0.5 rounded-sm">
              {children}
            </code>
          ),

          // Block quote — direct statutory citations
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-pk-green/60 pl-4 my-4 font-mono text-[12px] text-pk-paper/65 leading-relaxed">
              {children}
            </blockquote>
          ),

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pk-green underline underline-offset-2 hover:text-pk-paper transition-colors"
            >
              {children}
            </a>
          ),

          hr: () => <hr className="border-pk-border my-5" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
