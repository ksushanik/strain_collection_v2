"use client"

import * as React from "react"
import { useEditor, EditorContent, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import { cn } from "@/lib/utils"
import { Toggle } from "@/components/ui/toggle"
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    Heading2,
} from "lucide-react"

interface RichTextEditorProps {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    className?: string
    disabled?: boolean
}

function ToolbarButton({
    isActive,
    onClick,
    children,
    ariaLabel
}: {
    isActive: boolean
    onClick: () => void
    children: React.ReactNode
    ariaLabel: string
}) {
    return (
        <Toggle
            size="sm"
            pressed={isActive}
            onPressedChange={onClick}
            aria-label={ariaLabel}
            className="h-6 w-6 p-0"
        >
            {children}
        </Toggle>
    )
}

function CompactToolbar({ editor }: { editor: Editor }) {
    return (
        <div className="flex items-center gap-0.5 border-b bg-muted/30 px-1.5 py-1">
            <ToolbarButton
                isActive={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
                ariaLabel="Bold"
            >
                <Bold className="h-3 w-3" />
            </ToolbarButton>
            <ToolbarButton
                isActive={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                ariaLabel="Italic"
            >
                <Italic className="h-3 w-3" />
            </ToolbarButton>
            <ToolbarButton
                isActive={editor.isActive("underline")}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                ariaLabel="Underline"
            >
                <UnderlineIcon className="h-3 w-3" />
            </ToolbarButton>
            <ToolbarButton
                isActive={editor.isActive("strike")}
                onClick={() => editor.chain().focus().toggleStrike().run()}
                ariaLabel="Strikethrough"
            >
                <Strikethrough className="h-3 w-3" />
            </ToolbarButton>
            <div className="mx-0.5 h-4 w-px bg-border" />
            <ToolbarButton
                isActive={editor.isActive("heading", { level: 2 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                ariaLabel="Heading"
            >
                <Heading2 className="h-3 w-3" />
            </ToolbarButton>
            <ToolbarButton
                isActive={editor.isActive("bulletList")}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                ariaLabel="Bullet List"
            >
                <List className="h-3 w-3" />
            </ToolbarButton>
            <ToolbarButton
                isActive={editor.isActive("orderedList")}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                ariaLabel="Ordered List"
            >
                <ListOrdered className="h-3 w-3" />
            </ToolbarButton>
        </div>
    )
}

export function RichTextEditor({
    value = "",
    onChange,
    placeholder,
    className,
    disabled = false,
}: RichTextEditorProps) {
    const [isFocused, setIsFocused] = React.useState(false)

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2, 3],
                },
            }),
            Underline,
        ],
        content: value,
        editable: !disabled,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            if (html === "<p></p>") {
                onChange?.("")
            } else {
                onChange?.(html)
            }
        },
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm dark:prose-invert max-w-none min-h-[50px] p-2 focus:outline-none",
                    "[&_p]:my-0.5 [&_ul]:my-0.5 [&_ol]:my-0.5 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-1 [&_h2]:mb-0.5"
                ),
            },
        },
    })

    // Sync external value changes
    React.useEffect(() => {
        if (editor && value !== editor.getHTML() && value !== (editor.getHTML() === "<p></p>" ? "" : editor.getHTML())) {
            editor.commands.setContent(value || "")
        }
    }, [editor, value])

    return (
        <div
            className={cn(
                "rounded-md border bg-background focus-within:ring-1 focus-within:ring-ring",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            {editor && (
                <div
                    className={cn(
                        "h-8",
                        isFocused ? "" : "pointer-events-none opacity-0"
                    )}
                >
                    <CompactToolbar editor={editor} />
                </div>
            )}
            <EditorContent
                editor={editor}
                placeholder={placeholder}
            />
        </div>
    )
}
