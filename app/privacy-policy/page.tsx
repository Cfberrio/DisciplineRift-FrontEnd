import { Metadata } from "next"
import { LegalDocumentViewer } from "@/components/legal-document-viewer"

export const metadata: Metadata = {
  title: "Privacy Policy | Discipline Rift",
  description:
    "Review the Privacy Policy for Discipline Rift programs and learn how we handle your data.",
}

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentViewer
      title="Privacy Policy & Terms of Use"
      description="Review Discipline Rift's Privacy Policy, Terms of Use, and how we handle your personal information including SMS communications."
      pdfPath="/privacy-policy-updated.pdf"
      downloadName="privacy-policy-updated.pdf"
    />
  )
}




