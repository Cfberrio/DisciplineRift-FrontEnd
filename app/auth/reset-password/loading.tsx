import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-dr-blue rounded-full flex items-center justify-center mb-4">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">Loading reset password form...</p>
        </CardContent>
      </Card>
    </div>
  )
}
