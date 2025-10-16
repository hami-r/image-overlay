import { Header } from '@/components/header';
import { BatchEditor } from '@/components/batch-editor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BatchPage() {
    return (
        <>
            <Header />
            <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Batch Image Creation</CardTitle>
                        <CardDescription>
                            For developers: Input a JSON array to create multiple images at once.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BatchEditor />
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
