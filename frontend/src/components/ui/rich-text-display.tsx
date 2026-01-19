import * as React from "react"
import { cn } from "@/lib/utils"
import DOMPurify from "isomorphic-dompurify"

interface RichTextDisplayProps {
    content?: string | null
    className?: string
}

export function RichTextDisplay({ content, className }: RichTextDisplayProps) {
    if (!content) return null

    // Check if content is HTML (contains HTML tags)
    const isHtml = /<[^>]+>/.test(content)

    if (!isHtml) {
        // Plain text - render as-is with whitespace preserved
        return (
            <div className={cn("whitespace-pre-wrap", className)}>
                {content}
            </div>
        )
    }

    const sanitizedContent = DOMPurify.sanitize(content)

    return (
        <div
            className={cn(
                "prose prose-sm dark:prose-invert max-w-none",
                "[&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1",
                "[&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4",
                className
            )}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
    )
}
