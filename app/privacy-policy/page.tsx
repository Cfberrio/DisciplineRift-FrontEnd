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
      title="Privacy Policy"
      description="Review how Discipline Rift collects, uses, and safeguards your personal information throughout the registration experience."
      pdfPath="/Site_terms.pdf"
      downloadName="Privacy_Policy.pdf"
    />
  )
}

