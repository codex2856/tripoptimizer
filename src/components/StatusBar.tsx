interface Props {
  countryName: string;
  hubName?: string;
  totalDays: number;
  stopsCount: number;
}

function Item({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex flex-1 items-center gap-2.5 px-4 py-3 sm:px-6">
      <span className={`h-2 w-2 flex-none rounded-full ${ok ? 'bg-olive' : 'bg-ink-faint/50'}`} />
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-paper/60">{label}</span>
      <span className="ml-auto truncate text-sm font-semibold text-paper">{value}</span>
    </div>
  );
}

export function StatusBar({ countryName, hubName, totalDays, stopsCount }: Props) {
  return (
    <div className="mt-4 flex flex-wrap divide-y divide-white/10 rounded-2xl bg-ink shadow-lift sm:mx-4 sm:flex-nowrap sm:divide-x sm:divide-y-0 lg:mx-8">
      <Item label="País" value={countryName || '—'} ok={!!countryName} />
      <Item label="Llegada" value={hubName || '—'} ok={!!hubName} />
      <Item label="Días" value={String(totalDays)} ok={totalDays > 0} />
      <Item label="Destinos" value={stopsCount > 0 ? `${stopsCount}` : '—'} ok={stopsCount > 0} />
    </div>
  );
}
