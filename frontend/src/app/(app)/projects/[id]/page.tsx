'use client';

import ProjectDetail from '@/pages/ProjectDetail';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
 return <ProjectDetail id={params.id} />;
}
