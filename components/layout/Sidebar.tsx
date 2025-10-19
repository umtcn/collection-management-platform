'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Package,
    ChevronDown,
    ShoppingBag,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface NavItem {
    label: string;
    icon: ReactNode;
    href?: string;
    children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
        href: '/dashboard',
    },
    {
        label: 'Ürünler',
        icon: <Package className="w-5 h-5" />,
        children: [
            { label: 'Koleksiyon', href: '/collections' },
        ],
    },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[55] lg:hidden"
                    onClick={onClose}
                    aria-label="Close sidebar"
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-[60] h-full w-64 bg-white dark:bg-dark-card border-r border-light-border dark:border-dark-border transition-transform duration-300 lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo & Close Button */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-light-border dark:border-dark-border">
                    <h1 className="text-2xl font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                        LOGO
                    </h1>
                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 px-3">
                        MENU
                    </div>

                    <ul className="space-y-1">
                        {navItems.map((item, index) => (
                            <NavItemComponent
                                key={index}
                                item={item}
                                pathname={pathname}
                            />
                        ))}
                    </ul>

                    {/* Sales Section */}
                    <div className="mt-8">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 px-3">
                            Satış
                        </div>
                        <Link
                            href="/collections"
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                                pathname === '/collections'
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            )}
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span>Koleksiyon</span>
                        </Link>
                    </div>
                </nav>
            </aside>
        </>
    );
}

function NavItemComponent({
    item,
    pathname,
}: {
    item: NavItem;
    pathname: string;
}) {
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
        return (
            <li>
                <details className="group">
                    <summary className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors list-none">
                        <div className="flex items-center gap-3">
                            {item.icon}
                            <span>{item.label}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <ul className="mt-1 ml-8 space-y-1">
                        {item.children?.map((child, childIndex) => (
                            <li key={childIndex}>
                                <Link
                                    href={child.href}
                                    className={cn(
                                        'block px-3 py-2 rounded-md text-sm transition-colors',
                                        pathname === child.href
                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    )}
                                >
                                    {child.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </details>
            </li>
        );
    }

    return (
        <li>
            <Link
                href={item.href || '#'}
                className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    pathname === item.href
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                )}
            >
                {item.icon}
                <span>{item.label}</span>
            </Link>
        </li>
    );
}