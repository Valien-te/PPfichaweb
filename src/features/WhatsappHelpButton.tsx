import { Button } from "@/shared/components/base/Button";

import type { EjecutivoLegal } from "./whatsapp-help";
import { construirWhatsappHref } from "./whatsapp-help";

type WhatsappHelpButtonProps = {
  ejecutivoLegal: EjecutivoLegal | null;
};

function WhatsappIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.875 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.436-9.884 9.892-9.884a9.82 9.82 0 0 1 6.988 2.895 9.83 9.83 0 0 1 2.9 6.994c-.003 5.45-4.437 9.884-9.897 9.884m8.413-18.297A11.82 11.82 0 0 0 12.055 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.9 11.9 0 0 0 5.688 1.448h.005c6.558 0 11.894-5.335 11.897-11.893a11.82 11.82 0 0 0-3.488-8.413Z" />
    </svg>
  );
}

export function WhatsappHelpButton({ ejecutivoLegal }: WhatsappHelpButtonProps) {
  const href = ejecutivoLegal ? construirWhatsappHref(ejecutivoLegal.telefonoWhatsapp) : null;

  if (!href) return null;

  return (
    <Button
      asChild
      className="fixed right-[calc(1rem+env(safe-area-inset-right))] bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 size-12 rounded-full bg-[#25D366] px-0 text-white shadow-md ring-1 ring-black/5 hover:bg-[#20BD5A] active:bg-[#1FAE54] focus-visible:ring-[#25D366] focus-visible:ring-offset-2 [&_svg]:size-6"
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hablar con mi Ejecutivo/a por WhatsApp"
        title="Hablar con mi Ejecutivo/a por WhatsApp"
      >
        <WhatsappIcon />
      </a>
    </Button>
  );
}
