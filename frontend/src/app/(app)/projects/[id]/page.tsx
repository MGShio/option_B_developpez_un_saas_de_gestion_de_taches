'use client';

import ProjectDetail from '@/pages/ProjectDetail';
import { use } from 'react';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProjectDetail id={id} />;
}
