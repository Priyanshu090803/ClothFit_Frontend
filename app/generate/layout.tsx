'use client';

/**
 * Generate Layout - Uses dashboard layout for consistency
 */

import DashboardLayout from '../dashboard/layout';
import type { ReactNode } from 'react';

interface GenerateLayoutProps {
    children: ReactNode;
}

export default function GenerateLayout({ children }: GenerateLayoutProps) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
