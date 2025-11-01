import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AshokaChakraIcon } from '../icons/ashoka-chakra-icon';

interface AuthFormWrapperProps {
  children: React.ReactNode;
  title: string;
  description: string;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
}

export function AuthFormWrapper({
  children,
  title,
  description,
  footerText,
  footerLink,
  footerLinkText,
}: AuthFormWrapperProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4">
       <div className="absolute top-8 flex items-center gap-2 text-2xl font-headline text-primary">
          <AshokaChakraIcon className="h-8 w-8" />
          <h1>Nyayadeep</h1>
        </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
        <CardFooter>
          <div className="text-center text-sm w-full">
            {footerText}{' '}
            <Link href={footerLink} className="underline text-primary">
              {footerLinkText}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
