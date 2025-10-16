import Link from 'next/link';
import { Code, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <ImageIcon className="h-6 w-6 text-primary-foreground bg-primary p-1 rounded-md" />
          <h1 className="text-xl font-bold">Image Overlay Studio</h1>
        </Link>
        <div className="flex items-center gap-4">
           <Link href="/batch" passHref>
            <Button variant="outline">
              <Code className="mr-2" />
              Batch Create
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
