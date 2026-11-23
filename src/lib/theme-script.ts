/**
 * Runs before first paint to apply a user-forced theme (no flash). System preference
 * is handled purely in CSS. Its SHA-256 is added to the CSP by scripts/postbuild.mjs.
 */
export const THEME_SCRIPT = `try{var t=localStorage.getItem('nc-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;
