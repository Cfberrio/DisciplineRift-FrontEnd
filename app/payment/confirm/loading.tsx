import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function PaymentConfirmLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading</h1>
          <p className="text-gray-600">Please wait...</p>
        </CardContent>
      </Card>
    </div>
  )
}
