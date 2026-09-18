'use client';

import { Box } from '@mui/material';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

type Dimensions = { width: number; height: number };
type Placement = Dimensions & { left: number; top: number };

/** Natural sizes are stable per URL, so resolve each one only once per session. */
const naturalSizeCache = new Map<string, Dimensions>();

const VIEWPORT_MARGIN = 16;
const CURSOR_GAP = 24;
const OPEN_DELAY = 140;

function supportsHover() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function loadNaturalSize(src: string): Promise<Dimensions> {
  const cached = naturalSizeCache.get(src);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      const size = { width: image.naturalWidth, height: image.naturalHeight };
      naturalSizeCache.set(src, size);
      resolve(size);
    };
    image.onerror = reject;
    image.src = src;
  });
}

/**
 * Shows the image at its true pixel size next to the cursor, only shrinking it
 * when it would not fit on screen.
 */
function placeNextToCursor(cursorX: number, cursorY: number, natural: Dimensions): Placement {
  const maxWidth = window.innerWidth - VIEWPORT_MARGIN * 2;
  const maxHeight = window.innerHeight - VIEWPORT_MARGIN * 2;
  const scale = Math.min(1, maxWidth / natural.width, maxHeight / natural.height);
  const width = Math.round(natural.width * scale);
  const height = Math.round(natural.height * scale);

  let left = cursorX + CURSOR_GAP;
  if (left + width > window.innerWidth - VIEWPORT_MARGIN) {
    left = cursorX - CURSOR_GAP - width;
  }
  left = Math.min(Math.max(left, VIEWPORT_MARGIN), window.innerWidth - width - VIEWPORT_MARGIN);

  let top = cursorY - height / 2;
  top = Math.min(Math.max(top, VIEWPORT_MARGIN), window.innerHeight - height - VIEWPORT_MARGIN);

  return { left, top, width, height };
}

interface ImageHoverPreviewProps {
  src?: string | null;
  alt?: string;
  disabled?: boolean;
  children: ReactNode;
}

export default function ImageHoverPreview({
  src,
  alt = '',
  disabled = false,
  children,
}: ImageHoverPreviewProps) {
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<number | null>(null);
  const hoveringRef = useRef(false);
  const cursorRef = useRef({ x: 0, y: 0 });

  useEffect(() => setMounted(true), []);

  const hide = useCallback(() => {
    hoveringRef.current = false;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPlacement(null);
  }, []);

  // A changed source (or an unmounted card) must never leave a stale preview behind.
  useEffect(() => hide, [hide, src]);

  useEffect(() => {
    if (!placement) return;
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    window.addEventListener('blur', hide);
    document.addEventListener('visibilitychange', hide);
    return () => {
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
      window.removeEventListener('blur', hide);
      document.removeEventListener('visibilitychange', hide);
    };
  }, [placement, hide]);

  const trackCursor = (event: ReactMouseEvent) => {
    cursorRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseEnter = (event: ReactMouseEvent) => {
    trackCursor(event);
    if (disabled || !src || !supportsHover()) return;

    hoveringRef.current = true;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      loadNaturalSize(src)
        .then((natural) => {
          // SVGs without an intrinsic size report 0x0 — nothing sensible to pop up.
          if (!hoveringRef.current || !natural.width || !natural.height) return;
          const { x, y } = cursorRef.current;
          setPlacement(placeNextToCursor(x, y, natural));
        })
        .catch(() => undefined);
    }, OPEN_DELAY);
  };

  return (
    <Box
      component="span"
      sx={{ display: 'contents' }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={trackCursor}
      onMouseLeave={hide}
      onMouseDown={hide}
    >
      {children}
      {mounted &&
        placement &&
        src &&
        createPortal(
          <Box
            sx={{
              position: 'fixed',
              left: `${placement.left}px`,
              top: `${placement.top}px`,
              width: `${placement.width}px`,
              height: `${placement.height}px`,
              zIndex: 3000,
              pointerEvents: 'none',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              backgroundColor: '#000',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65)',
              '@keyframes imageHoverPreviewIn': {
                from: { opacity: 0, transform: 'scale(0.96)' },
                to: { opacity: 1, transform: 'scale(1)' },
              },
              animation: 'imageHoverPreviewIn 120ms ease-out',
            }}
          >
            {/* Plain img on purpose: this shows the untouched original, not a resized variant. */}
            <Box
              component="img"
              src={src}
              alt={alt}
              sx={{ display: 'block', width: '100%', height: '100%' }}
            />
          </Box>,
          document.body
        )}
    </Box>
  );
}
