'use client';

import dynamic from 'next/dynamic';

const BlogsPage = dynamic(() => import('./BlogsContent'), { ssr: false });

export default BlogsPage;