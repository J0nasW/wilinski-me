(() => {
    let theme = null;
    try {
        theme = localStorage.getItem('theme');
    } catch {}
    if (!theme) theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
})();
