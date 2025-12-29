import React, { ReactNode } from "react";

export type ComponentWithChildren = React.FC<{ children?: ReactNode }>;
export type IconType = React.ComponentType<{ className?: string }>;
