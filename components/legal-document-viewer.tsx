import Link from "next/link"

type LegalDocumentViewerProps = {
  title: string
  description: string
  pdfPath: string
  downloadName: string
  extraNote?: string
}

export function LegalDocumentViewer({
  title,
  description,
  pdfPath,
  downloadName,
  extraNote,
}: LegalDocumentViewerProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Discipline Rift</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {title}
            </h1>
          </div>
          <p className="text-base text-gray-600">{description}</p>
          {extraNote && (
            <p className="text-sm text-gray-500 italic">{extraNote}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="text-dr-blue font-semibold hover:underline"
            >
              ← Back to registration
            </Link>
            <a
              href={pdfPath}
              download={downloadName}
              className="text-white bg-dr-blue hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-semibold transition-colors"
            >
              Download PDF
            </a>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
          <object
            data={pdfPath}
            type="application/pdf"
            className="w-full h-[75vh]"
          >
            <iframe
              src={pdfPath}
              title={title}
              className="w-full h-[75vh] border-0"
            />
            <div className="p-6 space-y-3">
              <p className="text-gray-700">
                Your browser cannot display PDFs inline. You can download the
                document instead.
              </p>
              <a
                href={pdfPath}
                download={downloadName}
                className="text-white bg-dr-blue hover:bg-blue-700 px-4 py-2 rounded-md inline-block text-sm font-semibold transition-colors"
              >
                Download {downloadName}
              </a>
            </div>
          </object>
        </div>
      </div>
    </div>
  )
}

