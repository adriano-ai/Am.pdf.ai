import JSZip from 'jszip';

export const generateEPUB = async (text: string, filename: string = 'ebook.epub') => {
  const zip = new JSZip();
  const title = "Documento Gerado";
  const author = "Am.pdf.ai";
  const uuid = "urn:uuid:" + Math.random().toString(36).substring(2, 15);

  // 1. mimetype (MUST be the first file and uncompressed/STORE)
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  // 2. META-INF/container.xml
  zip.folder("META-INF")?.file("container.xml", `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
    </rootfiles>
</container>`);

  // Prepare Content
  // Escape HTML characters in text and convert newlines to paragraphs
  const escapeHtml = (unsafe: string) => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  };

  const paragraphs = text.split('\n').filter(p => p.trim() !== '').map(p => `<p>${escapeHtml(p)}</p>`).join('\n');

  // 3. OEBPS folder
  const oebps = zip.folder("OEBPS");

  // content.opf
  oebps?.file("content.opf", `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
        <dc:title>${title}</dc:title>
        <dc:creator opf:role="aut">${author}</dc:creator>
        <dc:language>pt-BR</dc:language>
        <dc:identifier id="BookId" opf:scheme="UUID">${uuid}</dc:identifier>
    </metadata>
    <manifest>
        <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
        <item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>
    </manifest>
    <spine toc="ncx">
        <itemref idref="content"/>
    </spine>
</package>`);

  // toc.ncx
  oebps?.file("toc.ncx", `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD NCX 2005-1//EN"
   "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
    <head>
        <meta name="dtb:uid" content="${uuid}"/>
        <meta name="dtb:depth" content="1"/>
        <meta name="dtb:totalPageCount" content="0"/>
        <meta name="dtb:maxPageNumber" content="0"/>
    </head>
    <docTitle>
        <text>${title}</text>
    </docTitle>
    <navMap>
        <navPoint id="navPoint-1" playOrder="1">
            <navLabel>
                <text>Início</text>
            </navLabel>
            <content src="content.xhtml"/>
        </navPoint>
    </navMap>
</ncx>`);

  // content.xhtml
  oebps?.file("content.xhtml", `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="pt-BR">
<head>
    <title>${title}</title>
    <style type="text/css">
        body { font-family: serif; line-height: 1.5; margin: 5%; }
        p { margin-bottom: 1em; text-indent: 1.5em; text-align: justify; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    ${paragraphs}
    <p style="text-align: center; margin-top: 2em; font-size: 0.8em; color: #666;">Gerado por Am.pdf.ai</p>
</body>
</html>`);

  // Generate and download
  // Critical fix: force the mimeType to application/epub+zip so the browser treats it as an EPUB, not a generic ZIP
  const content = await zip.generateAsync({ 
    type: "blob",
    mimeType: "application/epub+zip"
  });
  
  // Create download link programmatically
  const url = window.URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename; // This should be 'ebook.epub'
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};