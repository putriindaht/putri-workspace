type BootstrapOptions = {
  defaultPalette: string;
  paletteIds: string[];
  storageKey: string;
};

/** Synchronous head script prevents a light-theme flash for saved dark preferences. */
export function buildThemeBootstrap({
  defaultPalette,
  paletteIds,
  storageKey,
}: BootstrapOptions) {
  return `(()=>{let p=${JSON.stringify(defaultPalette)},a="system";try{const s=JSON.parse(localStorage.getItem(${JSON.stringify(storageKey)})||"null");if(${JSON.stringify(paletteIds)}.includes(s?.palette))p=s.palette;if(["light","dark","system"].includes(s?.appearance))a=s.appearance;}catch{}const r=document.documentElement;r.dataset.palette=p;r.dataset.appearance=a;r.dataset.colorMode=a==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):a;})();`;
}
