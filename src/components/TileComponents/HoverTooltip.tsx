// src/components/HoverTooltip.tsx
import React, { ReactNode, useState } from "react";
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
}

const HoverTooltip: React.FC<HoverTooltipProps> = ({ content, children }) => {
  const [open, setOpen] = useState(false);

  const { x, y, refs, strategy } = useFloating({
    placement: "bottom",
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

      {open && (
        <div
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            zIndex: 9999,
          }}
          className="text-primaryText bg-mainBg w-80 rounded-lg p-0 px-3 opacity-97 shadow-lg transition-opacity duration-200"
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default HoverTooltip;
