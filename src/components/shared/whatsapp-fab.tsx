import { useEffect, useState } from "react";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/**
 * WhatsAppFab — botón flotante de WhatsApp persistente en todas las páginas.
 * Aparece tras hacer scroll (no estorba el hero inicial) con animación de pulso.
 */
export function WhatsAppFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "¡Hola! Vengo del sitio web de Vive Travel y me gustaría recibir asesoría sobre sus experiencias."
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatear por WhatsApp"
      className={cn(
        "fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#1DA851] text-white shadow-lg transition-all duration-300 hover:bg-[#17943e] hover:shadow-xl",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-16 opacity-0"
      )}
    >
      {/* Anillo de pulso */}
      <span className="absolute inset-0 animate-ping rounded-full bg-[#1DA851] opacity-20" />
      <svg viewBox="0 0 24 24" fill="currentColor" className="relative h-7 w-7">
        <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.2 0 1.3.9 2.5 1.1 2.7.1.2 1.9 2.9 4.6 4 .6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.7-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z" />
        <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18.3c-1.5 0-3-.4-4.3-1.2l-.3-.2-2.9.9.9-2.8-.2-.3A8.3 8.3 0 1 1 12 20.3z" />
      </svg>
    </a>
  );
}
