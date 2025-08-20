import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PostForm } from '@/components/forms/PostForm';

export function PostListing() {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Container className="py-8">
          <PageHeader
            title="İlan Ver"
            description="Yük veya araç kapasitesi ilanınızı oluşturun"
          />
          
          <div className="max-w-4xl mx-auto">
            <PostForm />
          </div>
        </Container>
      </div>
    </AuthGuard>
  );
}