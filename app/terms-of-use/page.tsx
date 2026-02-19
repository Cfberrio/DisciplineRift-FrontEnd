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
      description="Learn about opt-in requirements, frequency expectations, and message policies for our SMS communications."
      pdfPath="/terms-of-use-updated.pdf"
      downloadName="terms-of-use-updated.pdf"
      extraNote="Message & data rates may apply."
    />
  )
}




