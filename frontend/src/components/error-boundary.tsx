"use client";

import React from "react";
import { Toaster, toast } from "@/components/ui/sonner";
import { useTranslations } from "next-intl";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  somethingWentWrong: string;
  unknownError: string;
  reloadPage: string;
  toastError: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
  message?: string;
};

class ErrorBoundaryClass extends React.Component<
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
    toast.error(this.props.toastError);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">{this.props.somethingWentWrong}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.message || this.props.unknownError}
            </p>
            <button
              className="text-sm text-primary underline"
              onClick={() => window.location.reload()}
            >
              {this.props.reloadPage}
            </button>
          </div>
          <Toaster />
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Errors");
  return (
    <ErrorBoundaryClass
      somethingWentWrong={t("somethingWentWrong")}
      unknownError={t("unknownError")}
      reloadPage={t("reloadPage")}
      toastError={t("toastError")}
    >
      {children}
    </ErrorBoundaryClass>
  );
}
