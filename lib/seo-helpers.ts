/**
 * SEO Helper utilities for optimizing meta descriptions, titles, and content
 */

/**
 * Truncate text to a specific length for meta descriptions
 * Google typically shows 150-160 characters
 */
export function truncateMetaDescription(text: string, maxLength: number = 155): string {
    if (text.length <= maxLength) return text;
    
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return truncated.slice(0, lastSpace) + '...';
}

/**
 * Optimize page title for SEO
 * Google typically shows 50-60 characters
 */
export function optimizeTitle(title: string, maxLength: number = 60): string {
    if (title.length <= maxLength) return title;
    
    const truncated = title.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return truncated.slice(0, lastSpace) + '...';
}

/**
 * Generate meta keywords from content
 */
export function generateKeywords(content: string, maxKeywords: number = 10): string[] {
    const words = content.toLowerCase().split(/\s+/);
    const commonWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of'];
    
    const filtered = words.filter(word => 
        word.length > 3 && !commonWords.includes(word)
    );
    
    const frequency: Record<string, number> = {};
    filtered.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxKeywords)
        .map(([word]) => word);
}

/**
 * Clean text for SEO (remove special characters, extra spaces)
 */
export function cleanTextForSEO(text: string): string {
    return text
        .replace(/[^\w\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Generate URL-friendly slug
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

/**
 * Calculate reading time (words per minute)
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): string {
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
}

/**
 * Generate Open Graph image URL
 */
export function generateOGImageUrl(
    title: string,
    description?: string,
    baseUrl: string = 'https://your-domain.com'
): string {
    const params = new URLSearchParams({
        title,
        ...(description && { description }),
    });
    
    return `${baseUrl}/api/og?${params.toString()}`;
}

/**
 * Validate meta description length
 */
export function isValidMetaDescription(description: string): {
    valid: boolean;
    length: number;
    recommendation: string;
} {
    const length = description.length;
    
    if (length < 50) {
        return {
            valid: false,
            length,
            recommendation: 'Meta description is too short. Aim for 150-160 characters.',
        };
    }
    
    if (length > 160) {
        return {
            valid: false,
            length,
            recommendation: 'Meta description is too long. Keep it under 160 characters.',
        };
    }
    
    return {
        valid: true,
        length,
        recommendation: 'Meta description length is optimal.',
    };
}

/**
 * Validate page title length
 */
export function isValidTitle(title: string): {
    valid: boolean;
    length: number;
    recommendation: string;
} {
    const length = title.length;
    
    if (length < 30) {
        return {
            valid: false,
            length,
            recommendation: 'Title is too short. Aim for 50-60 characters.',
        };
    }
    
    if (length > 60) {
        return {
            valid: false,
            length,
            recommendation: 'Title is too long. Keep it under 60 characters.',
        };
    }
    
    return {
        valid: true,
        length,
        recommendation: 'Title length is optimal.',
    };
}
