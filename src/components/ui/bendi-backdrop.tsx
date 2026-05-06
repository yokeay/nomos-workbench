"use client"

import { useEffect, useState, type RefObject } from "react"

interface BenDiBackdropProps {
  /** The popup element ref — backdrop will match its bounding rect */
  popupRef: RefObject<HTMLElement | null>
  /** Whether the backdrop is visible */
  open: boolean
  /** Extra margin in px to expand the backdrop beyond the popup bounds */
  margin?: number
  /** z-index, default 40 */
  zIndex?: number
}

/**
 * 苯迪算法 — BenDi Backdrop
 *
 * 计算弹窗组件所覆盖的内容区域边界，仅对该区域应用背景虚化，
 * 避免全屏 fixed inset-0 带来的不必要渲染开销。
 *
 * 用法：
 *   const popupRef = useRef<HTMLDivElement>(null)
 *   <BenDiBackdrop popupRef={popupRef} open={open} />
 *   <div ref={popupRef}>弹窗内容</div>
 */
export function BenDiBackdrop({
  popupRef,
  open,
  margin = 0,
  zIndex = 40,
}: BenDiBackdropProps) {
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null)

  useEffect(() => {
    if (!open || !popupRef.current) {
      setRect(null)
      return
    }

    const update = () => {
      if (!popupRef.current) return
      const bounds = popupRef.current.getBoundingClientRect()
      setRect({
        top: bounds.top - margin,
        left: bounds.left - margin,
        width: bounds.width + margin * 2,
        height: bounds.height + margin * 2,
      })
    }

    update()

    // Recalculate on scroll / resize — the popup may shift
    window.addEventListener("scroll", update, true)
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update, true)
      window.removeEventListener("resize", update)
    }
  }, [open, margin, popupRef])

  if (!open || !rect) return null

  return (
    <div
      className="backdrop-blur-sm bg-background/10 animate-fade-in pointer-events-none"
      style={{
        position: "fixed",
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        zIndex,
      }}
    />
  )
}
