import { Metadata } from "next"
import { LegalDocumentViewer } from "@/components/legal-document-viewer"

export const metadata: Metadata = {
  title: "SMS Terms | Discipline Rift",
  description:
    "Read the SMS Terms governing text message communications from Discipline Rift.",
}

export default function SmsTermsPage() {
  return (
    <LegalDocumentViewer
      title="SMS Terms"
      description="Learn about opt-in requirements, frequency expectations, and message policies for our SMS communications."
      pdfPath="/SMS_TERMS.pdf"
      downloadName="SMS_TERMS.pdf"
      extraNote="Message & data rates may apply."
    />
  )
}

