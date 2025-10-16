import { Header } from '@/components/header';
import { ImageEditor } from '@/components/image-editor';

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        <ImageEditor />
      </main>
    </>
  );
}
