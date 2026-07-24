// src/js/icons.js
// Biblioteca central de ícones SVG (estilo linha, cor herdada via currentColor)
// pra substituir os emojis genéricos do sistema por algo com cara de app de verdade.

export const ICONS = {
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,

    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,

    dice: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8.3" cy="8.3" r="1.3" fill="currentColor" stroke="none"/><circle cx="15.7" cy="8.3" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="8.3" cy="15.7" r="1.3" fill="currentColor" stroke="none"/><circle cx="15.7" cy="15.7" r="1.3" fill="currentColor" stroke="none"/></svg>`,

    star: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17.8 5.9 21l1.5-6.8-5.2-4.7 6.9-.7z"/></svg>`,

    starOutline: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17.8 5.9 21l1.5-6.8-5.2-4.7 6.9-.7z"/></svg>`,

    users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8.5" cy="7.5" r="3.2"/><path d="M2.5 20c0-3.6 2.7-6 6-6s6 2.4 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M14.8 14.3c2.7.2 4.7 2.4 4.7 5.7"/></svg>`,

    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11.5L12 4l8.5 7.5"/><path d="M5.5 10v9.5a1 1 0 0 0 1 1H9.5v-6h5v6h3a1 1 0 0 0 1-1V10"/></svg>`,

    door: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21H15"/><path d="M15 3l4 1.5v15L15 21"/><circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none"/></svg>`,

    clapper: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5l1.3-4.7a1.2 1.2 0 0 1 1.5-.8l13 3.6a1.2 1.2 0 0 1 .8 1.5l-.4 1.4z"/><path d="M3 10.5h18v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M6 6.4l3 3.4M11 5l3 3.4M16 3.6l3 3.4" stroke-width="1.5"/></svg>`,

    flame: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12.2 2c.3 3-2.4 4-2.9 6.6-.3 1.6.4 2.8 1.4 3.5-.6-1.6.1-2.8.9-3.6.2 1.2.9 2 1.8 2.6 1.4.9 2.6 2.2 2.6 4.3 0 3.4-2.8 6.1-6.2 6.1S3.6 19.8 3.6 16.4c0-4.6 3.4-6.1 5.1-9.2C9.7 5.2 9.9 3.2 12.2 2z"/></svg>`,

    crown: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M3 8l4 3 5-6 5 6 4-3-1.6 10H4.6z"/></svg>`,

    bolt: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>`,

    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6"/></svg>`,

    checkCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.6 2.6L16.3 9"/></svg>`,

    chartBar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V11M12 20V4M20 20v-7"/></svg>`,

    device: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="2.3"/><path d="M10.5 18.5h3"/></svg>`,

    moon: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20 14.3A8.5 8.5 0 1 1 9.7 4a7 7 0 0 0 10.3 10.3z"/></svg>`,

    popcorn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 9.5L7.8 21h8.4l1.3-11.5"/><path d="M4.8 9.5a2.6 2.6 0 0 1 -.3-4.9 2.7 2.7 0 0 1 4.7-2 3 3 0 0 1 5.6 0 2.7 2.7 0 0 1 4.7 2 2.6 2.6 0 0 1 -.3 4.9z"/><path d="M9.5 9.5V21M14.5 9.5V21"/></svg>`,

    trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4"/><path d="M12 14v3M9 21h6M9.5 21c0-2 .8-3 2.5-3s2.5 1 2.5 3"/></svg>`,

    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/></svg>`,

    heart: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 20.5s-8-5-8-11.5A4.7 4.7 0 0 1 8.7 4a5 5 0 0 1 3.3 1.6A5 5 0 0 1 15.3 4 4.7 4.7 0 0 1 20 9c0 6.5-8 11.5-8 11.5z"/></svg>`,

    heartOutline: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-8-5-8-11.5A4.7 4.7 0 0 1 8.7 4a5 5 0 0 1 3.3 1.6A5 5 0 0 1 15.3 4 4.7 4.7 0 0 1 20 9c0 6.5-8 11.5-8 11.5z"/></svg>`,

    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5L22 20.5H2z"/><path d="M12 9.5v5M12 17.3v.2"/></svg>`,

    sparkle: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2c.5 4.3 1.7 5.5 6 6-4.3.5-5.5 1.7-6 6-.5-4.3-1.7-5.5-6-6 4.3-.5 5.5-1.7 6-6z"/><path d="M19 15c.2 1.7.7 2.2 2.4 2.4-1.7.2-2.2.7-2.4 2.4-.2-1.7-.7-2.2-2.4-2.4 1.7-.2 2.2-.7 2.4-2.4z"/></svg>`,

    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.8A1 1 0 0 1 10 4h4a1 1 0 0 1 1 1.2V7M6.5 7l.8 12.3a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L18.5 7"/><path d="M10 11v6M14 11v6"/></svg>`,

    lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>`,

    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.7" r="0.9" fill="currentColor" stroke="none"/></svg>`,

    pencil: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l.9-3.9L16.6 4.4a1.5 1.5 0 0 1 2.1 0l1 1a1.5 1.5 0 0 1 0 2.1L8 19.1z"/><path d="M14.5 6.5l3 3"/></svg>`,

    chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>`,

    play: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 4.5v15l13-7.5z"/></svg>`,
};

// Troca todos os <span data-icon="nome"></span> de um trecho da página pelo SVG correspondente.
export function hydrateIcons(root = document) {
    root.querySelectorAll('[data-icon]').forEach(el => {
        const name = el.getAttribute('data-icon');
        if (ICONS[name] && !el.dataset.hydrated) {
            el.innerHTML = ICONS[name];
            el.dataset.hydrated = '1';
        }
    });
}

// Atalho pra montar um ícone já embrulhado num span, usado dentro de strings de template no JS.
export function iconSpan(name, extraClass = '') {
    return `<span class="icon ${extraClass}">${ICONS[name] || ''}</span>`;
}
