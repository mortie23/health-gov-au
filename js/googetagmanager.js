! function(e, t, a, n, r) {
    if (Array.prototype.indexOf) {
        e[n] = e[n] || [], e[n].push({ "gtm.start": (new Date).getTime(), event: "gtm.js" });
        var g = t.getElementsByTagName(a)[0],
            m = t.createElement(a);
        m.async = !0, m.src = "https://www.googletagmanager.com/gtm.js?id=GTM-N4ZZ787", g.parentNode.insertBefore(m, g)
    }
}(window, document, "script", "dataLayer");;