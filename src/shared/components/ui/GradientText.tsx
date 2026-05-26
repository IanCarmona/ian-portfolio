import React from "react";

import { cn } from "@/utils/cn";

/** Applies the índigo→cian duotone gradient to inline text. */
export function GradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("text-gradient", className)}>{children}</span>;
}
