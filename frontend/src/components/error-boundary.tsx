"use client";

import React from "react";
import { Toaster, toast } from "@/components/ui/sonner";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  message?: string;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("UI error boundary caught:", error);
    toast.error("Произошла ошибка. Попробуйте обновить страницу.");
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Что-то пошло не так</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.message || "Неизвестная ошибка"}
            </p>
            <button
              className="text-sm text-primary underline"
              onClick={() => window.location.reload()}
            >
              Обновить страницу
            </button>
          </div>
          <Toaster />
        </div>
      );
    }

    return this.props.children;
  }
}
