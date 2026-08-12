import { ChevronUp, ChevronDown } from "lucide-react";

export function ReorderButtons({
  onUp,
  onDown,
  disabledUp,
  disabledDown,
}: {
  onUp: () => void;
  onDown: () => void;
  disabledUp: boolean;
  disabledDown: boolean;
}) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onUp}
        disabled={disabledUp}
        aria-label="Subir"
        className="flex h-5 w-6 items-center justify-center text-neutral-500 hover:text-neutral-900 disabled:opacity-25"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={disabledDown}
        aria-label="Bajar"
        className="flex h-5 w-6 items-center justify-center text-neutral-500 hover:text-neutral-900 disabled:opacity-25"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}
