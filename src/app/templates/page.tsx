
import { Header } from '@/components/header';
import { TemplateManager } from '@/components/template-manager';

export default function TemplatesPage() {
    return (
        <>
            <Header />
            <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
                <TemplateManager />
            </main>
        </>
    );
}
