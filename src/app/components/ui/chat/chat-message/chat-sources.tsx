import { Check, Copy } from "lucide-react";
import { useMemo } from "react";
import { Button } from "../../button";
import { PreviewCard } from "../../document-preview";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../hover-card";
import { cn } from "../../lib/utils";
import { useCopyToClipboard } from "../hooks/use-copy-to-clipboard";
import { DocumentFileType, SourceData, SourceNode } from "../index";
import PdfDialog from "../widgets/PdfDialog";

type Document = {
  url: string;
  sources: SourceNode[];
};

export function ChatSources({ data, citationIds }: { data: SourceData, citationIds: string[] }) {
  const documents: Document[] = useMemo(() => {
    const citedNodes = data?.nodes.filter((node) => citationIds.includes(node.id));
    // group nodes by document (a document must have a URL)
    const nodesByUrl: Record<string, SourceNode[]> = {};
    citedNodes.forEach((node) => {
      const key = node.url;
      nodesByUrl[key] ??= [];
      nodesByUrl[key].push(node);
    });

    // convert to array of documents
    const sourcesDocuments = Object.entries(nodesByUrl).map(([url, sources]) => ({
      url,
      sources: sources.map((source) => ({
        ...source,
        overallIndex: citedNodes.findIndex((n) => n.id === source.id)
      })),
    }));

    return sourcesDocuments;

    // return sourcesDocuments.filter((doc) => doc.sources.some((source) => source.score && source.score > 0.6));
  }, [data.nodes]);

  if (documents.length === 0) return null;

  return (
    <div className="space-y-2 text-sm">
      <div className="font-semibold text-lg">Sources:</div>
      <div className="flex gap-3 flex-wrap">
        {documents.map((document) => {
          return <DocumentInfo key={document.url} document={document} />;
        })}
      </div>
    </div>
  );
}

function SourceInfo({ node, index }: { node?: SourceNode; index: number }) {
  if (!node) return <SourceNumberButton index={index} />;
  return (
    <HoverCard>
      <HoverCardTrigger
        className="cursor-default"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <SourceNumberButton
          index={node.overallIndex || index}
          className="hover:text-white hover:bg-primary"
        />
        {/* <div>
          {node.score?.toFixed(2) ?? "N/A"}
        </div> */}
      </HoverCardTrigger>
      <HoverCardContent className="w-[400px]">
        <NodeInfo nodeInfo={node} />
      </HoverCardContent>
    </HoverCard>
  );
}

export function SourceNumberButton({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-xs w-5 h-5 rounded-full bg-gray-100 inline-flex items-center justify-center",
        className,
      )}
    >
      {index + 1}
    </span>
  );
}

export function DocumentInfo({
  document,
  className,
}: {
  document: Document;
  className?: string;
}) {
  const { url, sources } = document;
  // console.log('--DocumentInfo--', document)
  // Extract filename from URL
  const urlParts = url.split("/");
  const fileName = (() => {
    const metaFileName = sources[0]?.metadata?.file_name;
    if (typeof metaFileName === "string") {
      return metaFileName;
    }
    return urlParts.length > 0 ? urlParts[urlParts.length - 1] : url
  })()
  const fileExt = fileName?.split(".").pop() as DocumentFileType | undefined;

  const previewFile = {
    name: fileName,
    type: fileExt as DocumentFileType,
  };

  const DocumentDetail = (
    <div className={`relative ${className}`}>
      <PreviewCard className={"cursor-pointer"} file={previewFile} />
      <div className="absolute bottom-2 right-2 space-x-2 flex">
        {sources.map((node: SourceNode, index: number) => (
          <div key={node.id}>
            <SourceInfo node={node} index={index} />
          </div>
        ))}
      </div>
    </div>
  );

  if (url.endsWith(".pdf") || fileName?.endsWith(".pdf")) {
    // open internal pdf dialog for pdf files when click document card
    return <PdfDialog documentId={sources[0].id} url={url} trigger={DocumentDetail} />;
  }
  // open external link when click document card for other file types
  return <div onClick={() => window.open(url, "_blank")}>{DocumentDetail}</div>;
}

function NodeInfo({ nodeInfo }: { nodeInfo: SourceNode }) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 1000 });

  const pageNumber =
    // XXX: page_label is used in Python, but page_number is used by Typescript
    (nodeInfo.metadata?.page_number as number) ??
    (nodeInfo.metadata?.page_label as number) ??
    null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="font-semibold">
          {pageNumber ? `On page ${pageNumber}:` : "Content:"}
        </span>
        {nodeInfo.text && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(nodeInfo.text);
            }}
            size="icon"
            variant="ghost"
            className="h-12 w-12 shrink-0"
          >
            {isCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {nodeInfo.text && (
        <pre className="max-h-[200px] overflow-auto whitespace-pre-line">
          &ldquo;{nodeInfo.text}&rdquo;
        </pre>
      )}
    </div>
  );
}
