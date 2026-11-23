import React, { ReactNode, useState } from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react-dom";

interface HoverTooltipProps {
  content: ReactNode;
  children: ReactNode;
  minWidthRem?: number;
}

const MAX_WIDTH_REM = 40;
const VIEWPORT_CAP = "calc(100vw - 16px)";

const HoverTooltip: React.FC<HoverTooltipProps> = ({
  content,
  children,
  minWidthRem = 20,
}) => {
  const [open, setOpen] = useState(false);

  const { x, y, refs, strategy } = useFloating({
    placement: "bottom",
    strategy: "fixed",
    open,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  return (
    <div
      ref={refs.setReference}
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}

      {open &&
        createPortal(
          <div
            ref={refs.setFloating}
            role="tooltip"
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              zIndex: 9999,
              width: "max-content",
              minWidth: `min(${minWidthRem}rem, ${VIEWPORT_CAP})`,
              maxWidth: `min(${MAX_WIDTH_REM}rem, ${VIEWPORT_CAP})`,
            }}
            className="tile text-primaryText pointer-events-none px-3 shadow-[6px_6px_0_rgba(0,0,0,0.6)]"
          >
            {content}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default HoverTooltip;
