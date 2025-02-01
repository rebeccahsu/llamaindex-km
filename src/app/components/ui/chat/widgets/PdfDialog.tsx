import dynamic from "next/dynamic";
import { Button } from "../../button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../drawer";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

export interface PdfDialogProps {
  documentId: string;
  url: string;
  trigger: React.ReactNode;
}

// Dynamic imports for client-side rendering only
const PDFViewer = dynamic(
  () => import("@llamaindex/pdf-viewer").then((module) => module.PDFViewer),
  { ssr: false },
);

const PdfFocusProvider = dynamic(
  () =>
    import("@llamaindex/pdf-viewer").then((module) => module.PdfFocusProvider),
  { ssr: false },
);

export default function PdfDialog(props: PdfDialogProps) {
  const { documentId, url } = props;

  const renderViewer = () => {
    if (url.startsWith('https://drive.google.com')) {
      const match = url.match(/(?<=\/d\/)[\w-]+/);
      const fileId = match ? match[0] : null;
      const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      return (
        <iframe
          src={`https://drive.google.com/file/d/${fileId}/preview`}
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      );
    }

    let theUrl = url;
    const serverHost = process.env.NEXT_PUBLIC_SERVER_HOST || 'http://localhost:3000';

    if (url.startsWith(serverHost)) {
      theUrl = url.replace(serverHost, '');
    }

    return (
      <PdfFocusProvider>
        <PDFViewer
          file={{
            id: documentId,
            url: theUrl
          }}
        />
      </PdfFocusProvider>
    );
  }

  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>{props.trigger}</DrawerTrigger>
      <DrawerContent className="w-3/5 mt-24 h-full max-h-[96%] ">
        <DrawerHeader className="flex justify-between max-w-[100%]">
          <div className="space-y-2 shrink">
            <DrawerTitle>PDF Content</DrawerTitle>
            <DrawerDescription>
              File URL:{" "}
              <a
                className="hover:text-blue-900 break-all"
                href={props.url}
                target="_blank"
              >
                {props.url}
              </a>
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="m-4 grow">
          {renderViewer()}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
