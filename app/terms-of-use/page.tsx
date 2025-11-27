import { Metadata } from "next"
import { LegalDocumentViewer } from "@/components/legal-document-viewer"

export const metadata: Metadata = {
  title: "Terms of Use | Discipline Rift",
  description:
    "Understand the rules, responsibilities, and expectations for using Discipline Rift services.",
}

export default function TermsOfUsePage() {
  return (
    <LegalDocumentViewer
      title="Terms of Use"
      description="Review the terms that govern participation in Discipline Rift programs, websites, and communications."
      pdfPath="/Site_terms.pdf"
      downloadName="Site_terms.pdf"
    />
  )
}

