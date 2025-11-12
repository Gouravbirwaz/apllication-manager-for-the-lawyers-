import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-6xl">404</h1>
        <p className="text-xl text-muted-foreground">
          Oops! The page you're looking for could not be found.
        </p>
      </div>
      <p className="max-w-md text-muted-foreground">
        It seems like you've taken a wrong turn. Let's get you back on track.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
