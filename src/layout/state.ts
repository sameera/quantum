import { atom, useAtom } from "jotai";

import { useBreakpoint } from "./use-breakpoints";

const isExplorerCollapsed$ = atom(false);
const isMobileExplorerOpen$ = atom(false);
const contentTitle$ = atom<string | null>(null);
const isWorkspacesBarExpanded$ = atom(false);

interface LayoutStateBase {
    isMobileView: boolean;
    isExplorerCollapsed: boolean;
    contentTitle: string | null;
    isWorkspacesBarExpanded: boolean;
    setIsExplorerCollapsed: (collapsed: boolean) => void;
    setContentTitle: (title: string | null) => void;
    setIsWorkspacesBarExpanded: (expanded: boolean) => void;
}

interface DesktopLayoutState extends LayoutStateBase {
    isMobileView: false;
}

interface MobileLayoutState extends LayoutStateBase {
    isMobileView: true;
    isExplorerOpen: boolean;
    setIsExplorerOpen: (open: boolean) => void;
}

export type LayoutState = DesktopLayoutState | MobileLayoutState;

export function useLayoutState(): LayoutState {
    const { isLargerThan } = useBreakpoint();

    const [isExplorerCollapsed, setIsExplorerCollapsed] =
        useAtom(isExplorerCollapsed$);
    const [contentTitle, setContentTitle] = useAtom(contentTitle$);
    const [isWorkspacesBarExpanded, setIsWorkspacesBarExpanded] = useAtom(
        isWorkspacesBarExpanded$
    );
    const [isMobileExplorerOpen, setIsMobileExplorerOpen] = useAtom(
        isMobileExplorerOpen$
    );

    const isMobileView = !isLargerThan("sm");

    if (isMobileView) {
        return {
            isMobileView: true,
            isExplorerCollapsed: false, // No collpased state in mobile
            isExplorerOpen: isMobileExplorerOpen,
            contentTitle,
            isWorkspacesBarExpanded,
            setIsExplorerCollapsed,
            setContentTitle,
            setIsWorkspacesBarExpanded,
            setIsExplorerOpen: setIsMobileExplorerOpen,
        };
    } else {
        return {
            isMobileView: false,
            isExplorerCollapsed,
            contentTitle,
            isWorkspacesBarExpanded,
            setIsExplorerCollapsed,
            setContentTitle,
            setIsWorkspacesBarExpanded,
        };
    }
}
