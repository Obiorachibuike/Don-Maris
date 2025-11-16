"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Lightbulb, Wrench } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, aiExplanation, aiRecommendation, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
              { (aiExplanation || aiRecommendation) && (
                <div className="mt-2 pt-2 border-t border-destructive/20 space-y-2">
                  {aiExplanation && (
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-300 flex-shrink-0" />
                      <p className="text-xs text-destructive-foreground/80">
                        <strong className="font-semibold text-yellow-300">Explanation:</strong> {aiExplanation}
                      </p>
                    </div>
                  )}
                   {aiRecommendation && (
                    <div className="flex items-start gap-2">
                      <Wrench className="h-4 w-4 mt-0.5 text-blue-300 flex-shrink-0" />
                       <p className="text-xs text-destructive-foreground/80">
                        <strong className="font-semibold text-blue-300">Recommendation:</strong> {aiRecommendation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
