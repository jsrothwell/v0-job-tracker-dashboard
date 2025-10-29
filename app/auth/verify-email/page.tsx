import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { AlertCircle, Mail } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card className="border-border/50">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Check your email</CardTitle>
            <CardDescription className="text-center">We&apos;ve sent you a verification link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please check your email and click the verification link to activate your account. Once verified, you can
              sign in to start tracking your job applications.
            </p>

            <div className="rounded-lg border border-border/50 bg-muted/50 p-3 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="font-medium">Email not arriving?</p>
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    <li>Check your spam or junk folder</li>
                    <li>Wait a few minutes - emails can take time to arrive</li>
                    <li>Make sure you entered the correct email address</li>
                  </ul>
                </div>
              </div>
            </div>

            <Link href="/auth/login" className="inline-block text-sm text-primary underline-offset-4 hover:underline">
              Back to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
