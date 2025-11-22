! function() {
    function t() {}

    function e(t) {
        return t()
    }

    function n() {
        return Object.create(null)
    }

    function s(t) {
        t.forEach(e)
    }

    function r(t) {
        return "function" == typeof t
    }

    function l(t, e) {
        return t != t ? e == e : t !== e || t && "object" == typeof t || "function" == typeof t
    }
    let o;

    function i(t, e) {
        return o || (o = document.createElement("a")), o.href = e, t === o.href
    }

    function c(e, ...n) {
        if (null == e) return t;
        const s = e.subscribe(...n);
        return s.unsubscribe ? () => s.unsubscribe() : s
    }

    function a(t, e, n) {
        t.$$.on_destroy.push(c(e, n))
    }

    function u(t, e, n, s) {
        if (t) {
            const r = d(t, e, n, s);
            return t[0](r)
        }
    }

    function d(t, e, n, s) {
        return t[1] && s ? function(t, e) {
            for (const n in e) t[n] = e[n];
            return t
        }(n.ctx.slice(), t[1](s(e))) : n.ctx
    }

    function f(t, e, n, s) {
        if (t[2] && s) {
            const r = t[2](s(n));
            if (void 0 === e.dirty) return r;
            if ("object" == typeof r) {
                const t = [],
                    n = Math.max(e.dirty.length, r.length);
                for (let s = 0; s < n; s += 1) t[s] = e.dirty[s] | r[s];
                return t
            }
            return e.dirty | r
        }
        return e.dirty
    }

    function p(t, e, n, s, r, l) {
        if (r) {
            const o = d(e, n, s, l);
            t.p(o, r)
        }
    }

    function g(t) {
        if (t.ctx.length > 32) {
            const e = [],
                n = t.ctx.length / 32;
            for (let t = 0; t < n; t++) e[t] = -1;
            return e
        }
        return -1
    }
    const h = "undefined" != typeof window ? window : "undefined" != typeof globalThis ? globalThis : global;

    function m(t, e) {
        t.appendChild(e)
    }

    function b(t, e, n) {
        t.insertBefore(e, n || null)
    }

    function x(t) {
        t.parentNode && t.parentNode.removeChild(t)
    }

    function $(t, e) {
        for (let n = 0; n < t.length; n += 1) t[n] && t[n].d(e)
    }

    function v(t) {
        return document.createElement(t)
    }

    function w(t) {
        return document.createElementNS("http://www.w3.org/2000/svg", t)
    }

    function y(t) {
        return document.createTextNode(t)
    }

    function k() {
        return y(" ")
    }

    function _() {
        return y("")
    }

    function j(t, e, n, s) {
        return t.addEventListener(e, n, s), () => t.removeEventListener(e, n, s)
    }

    function C(t) {
        return function(e) {
            return e.preventDefault(), t.call(this, e)
        }
    }

    function M(t, e, n) {
        null == n ? t.removeAttribute(e) : t.getAttribute(e) !== n && t.setAttribute(e, n)
    }

    function L(t) {
        return "" === t ? null : +t
    }

    function S(t, e) {
        e = "" + e, t.data !== e && (t.data = e)
    }

    function J(t, e) {
        t.value = e ?? ""
    }

    function T(t, e, n, s) {
        null == n ? t.style.removeProperty(e) : t.style.setProperty(e, n, s ? "important" : "")
    }

    function O(t, e, n) {
        for (let n = 0; n < t.options.length; n += 1) {
            const s = t.options[n];
            if (s.__value === e) return void(s.selected = !0)
        }
        n && void 0 === e || (t.selectedIndex = 0)
    }

    function E(t) {
        const e = t.querySelector(":checked");
        return e && e.__value
    }
    let N;

    function P(t) {
        N = t
    }

    function D() {
        if (!N) throw new Error("Function called outside component initialization");
        return N
    }

    function H(t) {
        D().$$.on_mount.push(t)
    }

    function A(t) {
        return D().$$.context.get(t)
    }

    function I(t, e) {
        const n = t.$$.callbacks[e.type];
        n && n.slice().forEach((t => t.call(this, e)))
    }
    const z = [],
        q = [];
    let B = [];
    const F = [],
        R = Promise.resolve();
    let Z = !1;

    function U() {
        Z || (Z = !0, R.then(G))
    }

    function W(t) {
        B.push(t)
    }

    function Y(t) {
        F.push(t)
    }
    const V = new Set;
    let X = 0;

    function G() {
        if (0 !== X) return;
        const t = N;
        do {
            try {
                for (; X < z.length;) {
                    const t = z[X];
                    X++, P(t), K(t.$$)
                }
            } catch (t) {
                throw z.length = 0, X = 0, t
            }
            for (P(null), z.length = 0, X = 0; q.length;) q.pop()();
            for (let t = 0; t < B.length; t += 1) {
                const e = B[t];
                V.has(e) || (V.add(e), e())
            }
            B.length = 0
        } while (z.length);
        for (; F.length;) F.pop()();
        Z = !1, V.clear(), P(t)
    }

    function K(t) {
        if (null !== t.fragment) {
            t.update(), s(t.before_update);
            const e = t.dirty;
            t.dirty = [-1], t.fragment && t.fragment.p(t.ctx, e), t.after_update.forEach(W)
        }
    }
    const Q = new Set;
    let tt;

    function et() {
        tt = {
            r: 0,
            c: [],
            p: tt
        }
    }

    function nt() {
        tt.r || s(tt.c), tt = tt.p
    }

    function st(t, e) {
        t && t.i && (Q.delete(t), t.i(e))
    }

    function rt(t, e, n, s) {
        if (t && t.o) {
            if (Q.has(t)) return;
            Q.add(t), tt.c.push((() => {
                Q.delete(t), s && (n && t.d(1), s())
            })), t.o(e)
        } else s && s()
    }

    function lt(t, e) {
        rt(t, 1, 1, (() => {
            e.delete(t.key)
        }))
    }

    function ot(t, e, n) {
        const s = t.$$.props[e];
        void 0 !== s && (t.$$.bound[s] = n, n(t.$$.ctx[s]))
    }

    function it(t) {
        t && t.c()
    }

    function ct(t, n, l, o) {
        const {
            fragment: i,
            after_update: c
        } = t.$$;
        i && i.m(n, l), o || W((() => {
            const n = t.$$.on_mount.map(e).filter(r);
            t.$$.on_destroy ? t.$$.on_destroy.push(...n) : s(n), t.$$.on_mount = []
        })), c.forEach(W)
    }

    function at(t, e) {
        const n = t.$$;
        null !== n.fragment && (function(t) {
            const e = [],
                n = [];
            B.forEach((s => -1 === t.indexOf(s) ? e.push(s) : n.push(s))), n.forEach((t => t())), B = e
        }(n.after_update), s(n.on_destroy), n.fragment && n.fragment.d(e), n.on_destroy = n.fragment = null, n.ctx = [])
    }

    function ut(e, r, l, o, i, c, a, u = [-1]) {
        const d = N;
        P(e);
        const f = e.$$ = {
            fragment: null,
            ctx: [],
            props: c,
            update: t,
            not_equal: i,
            bound: n(),
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(r.context || (d ? d.$$.context : [])),
            callbacks: n(),
            dirty: u,
            skip_bound: !1,
            root: r.target || d.$$.root
        };
        a && a(f.root);
        let p = !1;
        if (f.ctx = l ? l(e, r.props || {}, ((t, n, ...s) => {
                const r = s.length ? s[0] : n;
                return f.ctx && i(f.ctx[t], f.ctx[t] = r) && (!f.skip_bound && f.bound[t] && f.bound[t](r), p && function(t, e) {
                    -1 === t.$$.dirty[0] && (z.push(t), U(), t.$$.dirty.fill(0)), t.$$.dirty[e / 31 | 0] |= 1 << e % 31
                }(e, t)), n
            })) : [], f.update(), p = !0, s(f.before_update), f.fragment = !!o && o(f.ctx), r.target) {
            if (r.hydrate) {
                const t = function(t) {
                    return Array.from(t.childNodes)
                }(r.target);
                f.fragment && f.fragment.l(t), t.forEach(x)
            } else f.fragment && f.fragment.c();
            r.intro && st(e.$$.fragment), ct(e, r.target, r.anchor, r.customElement), G()
        }
        P(d)
    }
    class dt {
        $destroy() {
            at(this, 1), this.$destroy = t
        }
        $on(e, n) {
            if (!r(n)) return t;
            const s = this.$$.callbacks[e] || (this.$$.callbacks[e] = []);
            return s.push(n), () => {
                const t = s.indexOf(n); - 1 !== t && s.splice(t, 1)
            }
        }
        $set(t) {
            var e;
            this.$$set && (e = t, 0 !== Object.keys(e).length) && (this.$$.skip_bound = !0, this.$$set(t), this.$$.skip_bound = !1)
        }
    }
    const ft = [];

    function pt(e, n = t) {
        let s;
        const r = new Set;

        function o(t) {
            if (l(e, t) && (e = t, s)) {
                const t = !ft.length;
                for (const t of r) t[1](), ft.push(t, e);
                if (t) {
                    for (let t = 0; t < ft.length; t += 2) ft[t][0](ft[t + 1]);
                    ft.length = 0
                }
            }
        }
        return {
            set: o,
            update: function(t) {
                o(t(e))
            },
            subscribe: function(l, i = t) {
                const c = [l, i];
                return r.add(c), 1 === r.size && (s = n(o) || t), l(e), () => {
                    r.delete(c), 0 === r.size && s && (s(), s = null)
                }
            }
        }
    }

    function gt(t, e = !1) {
        return (t = t.slice(t.startsWith("/#") ? 2 : 0, t.endsWith("/*") ? -2 : void 0)).startsWith("/") || (t = "/" + t), "/" === t && (t = ""), e && !t.endsWith("/") && (t += "/"), t
    }

    function ht(t, e, n) {
        if ("" === n) return t;
        if ("/" === n[0]) return n;
        let s = t => t.split("/").filter((t => "" !== t)),
            r = s(t);
        return "/" + (e ? s(e) : []).map(((t, e) => r[e])).join("/") + "/" + n
    }

    function mt(t, e, n, s) {
        let r = [e, "data-" + e].reduce(((e, s) => {
            let r = t.getAttribute(s);
            return n && t.removeAttribute(s), null === r ? e : r
        }), !1);
        return !s && "" === r || r || s || !1
    }

    function bt(t) {
        let e = t.split("&").map((t => t.split("="))).reduce(((t, e) => {
            let n = e[0];
            if (!n) return t;
            let s = !(e.length > 1) || e[e.length - 1];
            return "string" == typeof s && s.includes(",") && (s = s.split(",")), void 0 === t[n] ? t[n] = [s] : t[n].push(s), t
        }), {});
        return Object.entries(e).reduce(((t, e) => (t[e[0]] = e[1].length > 1 ? e[1] : e[1][0], t)), {})
    }

    function xt(t, e) {
        return t ? e + t : ""
    }

    function $t(t) {
        throw new Error("[Tinro] " + t)
    }
    var vt, wt, yt, kt = {
            HISTORY: 1,
            HASH: 2,
            MEMORY: 3,
            OFF: 4,
            run(t, e, n, s) {
                return t === this.HISTORY ? e && e() : t === this.HASH ? n && n() : s && s()
            },
            getDefault() {
                return window && "srcdoc" !== window.location.pathname ? this.HISTORY : this.MEMORY
            }
        },
        _t = "",
        jt = function() {
            let t, e = kt.getDefault(),
                n = n => t && t(Ct(e)),
                s = t => {
                    t && (e = t), window.onhashchange = window.onpopstate = vt = null, e !== kt.OFF && kt.run(e, (t => window.onpopstate = n), (t => window.onhashchange = n)) && n()
                };
            return {
                mode: s,
                get: t => Ct(e),
                go(t, s) {
                    (function(t, e, n) {
                        !n && (wt = yt);
                        let s = t => history[(n ? "replace" : "push") + "State"]({}, "", t);
                        kt.run(t, (t => s(_t + e)), (t => s(`#${e}`)), (t => vt = e))
                    })(e, t, s), n()
                },
                start(e) {
                    t = e, s()
                },
                stop() {
                    t = null, s(kt.OFF)
                },
                set(t) {
                    this.go((t => {
                        let n = Object.assign(Ct(e), t);
                        return n.path + xt(function(t) {
                            return Object.entries(t).map((([t, e]) => e ? !0 === e ? t : `${t}=${Array.isArray(e)?e.join(","):e}` : null)).filter((t => t)).join("&")
                        }(n.query), "?") + xt(n.hash, "#")
                    })(t), !t.path)
                },
                methods() {
                    return function(t) {
                        let e = () => t.get().query,
                            n = e => t.set({
                                query: e
                            }),
                            s = t => n(t(e())),
                            r = e => t.set({
                                hash: e
                            });
                        return {
                            hash: {
                                get: () => t.get().hash,
                                set: r,
                                clear: () => r("")
                            },
                            query: {
                                replace: n,
                                clear: () => n(""),
                                get: t => t ? e()[t] : e(),
                                set(t, e) {
                                    s((n => (n[t] = e, n)))
                                },
                                delete(t) {
                                    s((e => (e[t] && delete e[t], e)))
                                }
                            }
                        }
                    }(this)
                },
                base: t => _t = t
            }
        }();

    function Ct(t) {
        let e = window.location,
            n = kt.run(t, (t => (_t ? e.pathname.replace(_t, "") : e.pathname) + e.search + e.hash), (t => String(e.hash.slice(1) || "/")), (t => vt || "/")),
            s = n.match(/^([^?#]+)(?:\?([^#]+))?(?:\#(.+))?$/);
        return yt = n, {
            url: n,
            from: wt,
            path: s[1] || "",
            query: bt(s[2] || ""),
            hash: s[3] || ""
        }
    }
    var Mt = function() {
        let {
            subscribe: t
        } = pt(jt.get(), (t => {
            jt.start(t);
            let e = function(t) {
                let e = e => {
                    let n = e.target.closest("a[href]"),
                        s = n && mt(n, "target", !1, "_self"),
                        r = n && mt(n, "tinro-ignore"),
                        l = e.ctrlKey || e.metaKey || e.altKey || e.shiftKey;
                    if ("_self" == s && !r && !l && n) {
                        let s = n.getAttribute("href").replace(/^\/#/, "");
                        /^\/\/|^#|^[a-zA-Z]+:/.test(s) || (e.preventDefault(), t(s.startsWith("/") ? s : n.href.replace(window.location.origin, "")))
                    }
                };
                return addEventListener("click", e), () => removeEventListener("click", e)
            }(jt.go);
            return () => {
                jt.stop(), e()
            }
        }));
        return {
            subscribe: t,
            goto: jt.go,
            params: Lt,
            meta: Tt,
            useHashNavigation: t => jt.mode(t ? kt.HASH : kt.HISTORY),
            mode: {
                hash: () => jt.mode(kt.HASH),
                history: () => jt.mode(kt.HISTORY),
                memory: () => jt.mode(kt.MEMORY)
            },
            base: jt.base,
            location: jt.methods()
        }
    }();

    function Lt() {
        return A("tinro").meta.params
    }
    var St = "tinro",
        Jt = Ot({
            pattern: "",
            matched: !0
        });

    function Tt() {
        return St, D().$$.context.has("tinro") ? A(St).meta : $t("meta() function must be run inside any `<Route>` child component only")
    }

    function Ot(t) {
        let e = {
            router: {},
            exact: !1,
            pattern: null,
            meta: null,
            parent: null,
            fallback: !1,
            redirect: !1,
            firstmatch: !1,
            breadcrumb: null,
            matched: !1,
            childs: new Set,
            activeChilds: new Set,
            fallbacks: new Set,
            async showFallbacks() {
                if (!this.fallback && (await (U(), R), this.childs.size > 0 && 0 == this.activeChilds.size || 0 == this.childs.size && this.fallbacks.size > 0)) {
                    let t = this;
                    for (; 0 == t.fallbacks.size;)
                        if (t = t.parent, !t) return;
                    t && t.fallbacks.forEach((t => {
                        if (t.redirect) {
                            let e = ht("/", t.parent.pattern, t.redirect);
                            Mt.goto(e, !0)
                        } else t.show()
                    }))
                }
            },
            start() {
                this.router.un || (this.router.un = Mt.subscribe((t => {
                    this.router.location = t, null !== this.pattern && this.match()
                })))
            },
            match() {
                this.showFallbacks()
            }
        };
        return Object.assign(e, t), e.start(), e
    }
    const Et = t => ({
            params: 2 & t,
            meta: 4 & t
        }),
        Nt = t => ({
            params: t[1],
            meta: t[2]
        });

    function Pt(t) {
        let e;
        const n = t[9].default,
            s = u(n, t, t[8], Nt);
        return {
            c() {
                s && s.c()
            },
            m(t, n) {
                s && s.m(t, n), e = !0
            },
            p(t, r) {
                s && s.p && (!e || 262 & r) && p(s, n, t, t[8], e ? f(n, t[8], r, Et) : g(t[8]), Nt)
            },
            i(t) {
                e || (st(s, t), e = !0)
            },
            o(t) {
                rt(s, t), e = !1
            },
            d(t) {
                s && s.d(t)
            }
        }
    }

    function Dt(t) {
        let e, n, s = t[0] && Pt(t);
        return {
            c() {
                s && s.c(), e = _()
            },
            m(t, r) {
                s && s.m(t, r), b(t, e, r), n = !0
            },
            p(t, [n]) {
                t[0] ? s ? (s.p(t, n), 1 & n && st(s, 1)) : (s = Pt(t), s.c(), st(s, 1), s.m(e.parentNode, e)) : s && (et(), rt(s, 1, 1, (() => {
                    s = null
                })), nt())
            },
            i(t) {
                n || (st(s), n = !0)
            },
            o(t) {
                rt(s), n = !1
            },
            d(t) {
                s && s.d(t), t && x(e)
            }
        }
    }

    function Ht(t, e, n) {
        let {
            $$slots: s = {},
            $$scope: r
        } = e, {
            path: l = "/*"
        } = e, {
            fallback: o = !1
        } = e, {
            redirect: i = !1
        } = e, {
            firstmatch: c = !1
        } = e, {
            breadcrumb: a = null
        } = e, u = !1, d = {}, f = {};
        const p = function(t) {
            let e = A(St) || Jt;
            (e.exact || e.fallback) && $t(`${t.fallback?"<Route fallback>":`<Route path="${t.path}">`}  can't be inside ${e.fallback?"<Route fallback>":`<Route path="${e.path||"/"}"> with exact path`}`);
            let n = t.fallback ? "fallbacks" : "childs",
                s = pt({}),
                r = Ot({
                    fallback: t.fallback,
                    parent: e,
                    update(t) {
                        r.exact = !t.path.endsWith("/*"), r.pattern = gt(`${r.parent.pattern||""}${t.path}`), r.redirect = t.redirect, r.firstmatch = t.firstmatch, r.breadcrumb = t.breadcrumb, r.match()
                    },
                    register: () => (r.parent[n].add(r), async () => {
                        r.parent[n].delete(r), r.parent.activeChilds.delete(r), r.router.un && r.router.un(), r.parent.match()
                    }),
                    show: () => {
                        t.onShow(), !r.fallback && r.parent.activeChilds.add(r)
                    },
                    hide: () => {
                        t.onHide(), r.parent.activeChilds.delete(r)
                    },
                    match: async () => {
                        r.matched = !1;
                        let {
                            path: e,
                            url: n,
                            from: l,
                            query: o
                        } = r.router.location, i = function(t, e) {
                            t = gt(t, !0), e = gt(e, !0);
                            let n = [],
                                s = {},
                                r = !0,
                                l = t.split("/").map((t => t.startsWith(":") ? (n.push(t.slice(1)), "([^\\/]+)") : t)).join("\\/"),
                                o = e.match(new RegExp(`^${l}$`));
                            return o || (r = !1, o = e.match(new RegExp(`^${l}`))), o ? (n.forEach(((t, e) => s[t] = o[e + 1])), {
                                exact: r,
                                params: s,
                                part: o[0].slice(0, -1)
                            }) : null
                        }(r.pattern, e);
                        if (!r.fallback && i && r.redirect && (!r.exact || r.exact && i.exact)) {
                            let t = ht(e, r.parent.pattern, r.redirect);
                            return Mt.goto(t, !0)
                        }
                        r.meta = i && {
                            from: l,
                            url: n,
                            query: o,
                            match: i.part,
                            pattern: r.pattern,
                            breadcrumbs: r.parent.meta && r.parent.meta.breadcrumbs.slice() || [],
                            params: i.params,
                            subscribe: s.subscribe
                        }, r.breadcrumb && r.meta && r.meta.breadcrumbs.push({
                            name: r.breadcrumb,
                            path: i.part
                        }), s.set(r.meta), !i || r.fallback || !(!r.exact || r.exact && i.exact) || r.parent.firstmatch && r.parent.matched ? r.hide() : (t.onMeta(r.meta), r.parent.matched = !0, r.show()), i && r.showFallbacks()
                    }
                });
            return l = r, D().$$.context.set("tinro", l), H((() => r.register())), r;
            var l
        }({
            fallback: o,
            onShow() {
                n(0, u = !0)
            },
            onHide() {
                n(0, u = !1)
            },
            onMeta(t) {
                n(2, f = t), n(1, d = f.params)
            }
        });
        return t.$$set = t => {
            "path" in t && n(3, l = t.path), "fallback" in t && n(4, o = t.fallback), "redirect" in t && n(5, i = t.redirect), "firstmatch" in t && n(6, c = t.firstmatch), "breadcrumb" in t && n(7, a = t.breadcrumb), "$$scope" in t && n(8, r = t.$$scope)
        }, t.$$.update = () => {
            232 & t.$$.dirty && p.update({
                path: l,
                redirect: i,
                firstmatch: c,
                breadcrumb: a
            })
        }, [u, d, f, l, o, i, c, a, r, s]
    }
    class At extends dt {
        constructor(t) {
            super(), ut(this, t, Ht, Dt, l, {
                path: 3,
                fallback: 4,
                redirect: 5,
                firstmatch: 6,
                breadcrumb: 7
            })
        }
    }

    function It(e) {
        let n, s, l, o, i;
        return {
            c() {
                n = w("svg"), s = w("line"), l = w("line"), M(s, "x1", "18"), M(s, "y1", "6"), M(s, "x2", "6"), M(s, "y2", "18"), M(l, "x1", "6"), M(l, "y1", "6"), M(l, "x2", "18"), M(l, "y2", "18"), M(n, "class", "h-6 w-6 text-red-400 cursor-pointer"), M(n, "viewBox", "0 -2 24 24"), M(n, "fill", "none"), M(n, "stroke", "currentColor"), M(n, "stroke-width", "2"), M(n, "stroke-linecap", "round"), M(n, "stroke-linejoin", "round")
            },
            m(t, c) {
                b(t, n, c), m(n, s), m(n, l), o || (i = j(n, "click", (function() {
                    r(e[0]()) && e[0]().apply(this, arguments)
                })), o = !0)
            },
            p(t, [n]) {
                e = t
            },
            i: t,
            o: t,
            d(t) {
                t && x(n), o = !1, i()
            }
        }
    }

    function zt(t, e, n) {
        let {
            click: s = (() => {})
        } = e;
        return t.$$set = t => {
            "click" in t && n(0, s = t.click)
        }, [s]
    }
    class qt extends dt {
        constructor(t) {
            super(), ut(this, t, zt, It, l, {
                click: 0
            })
        }
    }

    function Bt(t) {
        let e, n, s, r, l, o, i, c;
        return i = new qt({
            props: {
                click: t[5]
            }
        }), {
            c() {
                e = v("div"), n = v("div"), s = v("h1"), r = y(t[0]), l = k(), o = v("div"), it(i.$$.fragment), M(s, "class", "alm-hdr"), M(n, "class", "w-11/12"), M(o, "class", "flex justify-end w-1/12"), M(e, "class", "flex items-center")
            },
            m(t, a) {
                b(t, e, a), m(e, n), m(n, s), m(s, r), m(e, l), m(e, o), ct(i, o, null), c = !0
            },
            p(t, e) {
                (!c || 1 & e) && S(r, t[0]);
                const n = {};
                4 & e && (n.click = t[5]), i.$set(n)
            },
            i(t) {
                c || (st(i.$$.fragment, t), c = !0)
            },
            o(t) {
                rt(i.$$.fragment, t), c = !1
            },
            d(t) {
                t && x(e), at(i)
            }
        }
    }

    function Ft(e) {
        let n, s;
        return {
            c() {
                n = v("h1"), s = y(e[0]), M(n, "class", "alm-hdr")
            },
            m(t, e) {
                b(t, n, e), m(n, s)
            },
            p(t, e) {
                1 & e && S(s, t[0])
            },
            i: t,
            o: t,
            d(t) {
                t && x(n)
            }
        }
    }

    function Rt(t) {
        let e, n, s, r, l;
        const o = [Ft, Bt],
            i = [];

        function c(t, e) {
            return t[0] && !t[1] ? 0 : t[0] && t[1] ? 1 : -1
        }~(n = c(t)) && (s = i[n] = o[n](t));
        const a = t[4].default,
            d = u(a, t, t[3], null);
        return {
            c() {
                e = v("div"), s && s.c(), r = k(), d && d.c(), M(e, "class", "alm")
            },
            m(t, s) {
                b(t, e, s), ~n && i[n].m(e, null), m(e, r), d && d.m(e, null), l = !0
            },
            p(t, [u]) {
                let h = n;
                n = c(t), n === h ? ~n && i[n].p(t, u) : (s && (et(), rt(i[h], 1, 1, (() => {
                    i[h] = null
                })), nt()), ~n ? (s = i[n], s ? s.p(t, u) : (s = i[n] = o[n](t), s.c()), st(s, 1), s.m(e, r)) : s = null), d && d.p && (!l || 8 & u) && p(d, a, t, t[3], l ? f(a, t[3], u, null) : g(t[3]), null)
            },
            i(t) {
                l || (st(s), st(d, t), l = !0)
            },
            o(t) {
                rt(s), rt(d, t), l = !1
            },
            d(t) {
                t && x(e), ~n && i[n].d(), d && d.d(t)
            }
        }
    }

    function Zt(t, e, n) {
        let {
            $$slots: s = {},
            $$scope: r
        } = e, {
            title: l = !1
        } = e, {
            cross: o = !1
        } = e, {
            close: i = (() => {})
        } = e;
        return t.$$set = t => {
            "title" in t && n(0, l = t.title), "cross" in t && n(1, o = t.cross), "close" in t && n(2, i = t.close), "$$scope" in t && n(3, r = t.$$scope)
        }, [l, o, i, r, s, () => i()]
    }
    class Ut extends dt {
        constructor(t) {
            super(), ut(this, t, Zt, Rt, l, {
                title: 0,
                cross: 1,
                close: 2
            })
        }
    }

    function Wt(e) {
        let n;
        return {
            c() {
                n = v("div"), n.innerHTML = '<div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"><div class="fixed inset-0 bg-gray-100 bg-opacity-75 transition-opacity" aria-hidden="true"></div> \n    <div class="flex h-screen justify-center items-center"><div class="m-auto"><div style="border-top-color:transparent" class="w-10 h-10 border-4 border-blue-400 border-solid rounded-full animate-spin"></div></div></div></div>', M(n, "class", "fixed z-10 inset-0 overflow-y-auto"), M(n, "aria-labelledby", "modal-title"), M(n, "role", "dialog"), M(n, "aria-modal", "true")
            },
            m(t, e) {
                b(t, n, e)
            },
            p: t,
            i: t,
            o: t,
            d(t) {
                t && x(n)
            }
        }
    }
    class Yt extends dt {
        constructor(t) {
            super(), ut(this, t, null, Wt, l, {})
        }
    }

    function Vt(t) {
        let e, n, s, r = t[0] && Xt(t);
        const l = t[3].default,
            o = u(l, t, t[2], null);
        return {
            c() {
                e = v("div"), r && r.c(), n = k(), o && o.c(), M(e, "class", "crd")
            },
            m(t, l) {
                b(t, e, l), r && r.m(e, null), m(e, n), o && o.m(e, null), s = !0
            },
            p(t, i) {
                t[0] ? r ? r.p(t, i) : (r = Xt(t), r.c(), r.m(e, n)) : r && (r.d(1), r = null), o && o.p && (!s || 4 & i) && p(o, l, t, t[2], s ? f(l, t[2], i, null) : g(t[2]), null)
            },
            i(t) {
                s || (st(o, t), s = !0)
            },
            o(t) {
                rt(o, t), s = !1
            },
            d(t) {
                t && x(e), r && r.d(), o && o.d(t)
            }
        }
    }

    function Xt(t) {
        let e, n;
        return {
            c() {
                e = v("h1"), n = y(t[0]), M(e, "class", "crd-hdr")
            },
            m(t, s) {
                b(t, e, s), m(e, n)
            },
            p(t, e) {
                1 & e && S(n, t[0])
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function Gt(t) {
        let e, n, s = t[1] && Vt(t);
        return {
            c() {
                s && s.c(), e = _()
            },
            m(t, r) {
                s && s.m(t, r), b(t, e, r), n = !0
            },
            p(t, [n]) {
                t[1] ? s ? (s.p(t, n), 2 & n && st(s, 1)) : (s = Vt(t), s.c(), st(s, 1), s.m(e.parentNode, e)) : s && (et(), rt(s, 1, 1, (() => {
                    s = null
                })), nt())
            },
            i(t) {
                n || (st(s), n = !0)
            },
            o(t) {
                rt(s), n = !1
            },
            d(t) {
                s && s.d(t), t && x(e)
            }
        }
    }

    function Kt(t, e, n) {
        let {
            $$slots: s = {},
            $$scope: r
        } = e, {
            title: l = !1
        } = e, {
            show: o = !0
        } = e;
        return t.$$set = t => {
            "title" in t && n(0, l = t.title), "show" in t && n(1, o = t.show), "$$scope" in t && n(2, r = t.$$scope)
        }, [l, o, r, s]
    }
    class Qt extends dt {
        constructor(t) {
            super(), ut(this, t, Kt, Gt, l, {
                title: 0,
                show: 1
            })
        }
    }

    function te(t) {
        let e, n, r, l;
        return {
            c() {
                e = v("input"), M(e, "class", n = t[0].sent ? "ipt-rnd text-right border-red-500" : "ipt-rnd text-right focus:border-indigo-500"), M(e, "step", "0.1"), M(e, "type", "number")
            },
            m(n, s) {
                b(n, e, s), J(e, t[0].status), r || (l = [j(e, "change", t[4]), j(e, "input", t[5])], r = !0)
            },
            p(t, s) {
                1 & s && n !== (n = t[0].sent ? "ipt-rnd text-right border-red-500" : "ipt-rnd text-right focus:border-indigo-500") && M(e, "class", n), 1 & s && L(e.value) !== t[0].status && J(e, t[0].status)
            },
            d(t) {
                t && x(e), r = !1, s(l)
            }
        }
    }

    function ee(t) {
        let e, n, r, l;
        return {
            c() {
                e = v("input"), M(e, "class", n = t[0].sent ? "ipt-rnd text-right border-red-500" : "ipt-rnd text-right focus:border-indigo-500"), M(e, "type", "text")
            },
            m(n, s) {
                b(n, e, s), J(e, t[0].status), r || (l = [j(e, "change", t[6]), j(e, "input", t[7])], r = !0)
            },
            p(t, s) {
                1 & s && n !== (n = t[0].sent ? "ipt-rnd text-right border-red-500" : "ipt-rnd text-right focus:border-indigo-500") && M(e, "class", n), 1 & s && e.value !== t[0].status && J(e, t[0].status)
            },
            d(t) {
                t && x(e), r = !1, s(l)
            }
        }
    }

    function ne(t) {
        let e, n, r, l;
        return {
            c() {
                e = v("input"), M(e, "class", n = t[0].sent ? "ipt-rnd text-right border-red-500" : "ipt-rnd text-right focus:border-indigo-500"), M(e, "type", "date")
            },
            m(n, s) {
                b(n, e, s), J(e, t[2]), r || (l = [j(e, "change", t[8]), j(e, "input", t[9])], r = !0)
            },
            p(t, s) {
                1 & s && n !== (n = t[0].sent ? "ipt-rnd text-right border-red-500" : "ipt-rnd text-right focus:border-indigo-500") && M(e, "class", n), 4 & s && J(e, t[2])
            },
            d(t) {
                t && x(e), r = !1, s(l)
            }
        }
    }

    function se(t) {
        let e, n, r, l;
        return {
            c() {
                e = v("input"), M(e, "class", n = t[0].sent ? "ipt-rnd text-right border-red-500" : "ipt-rnd text-right focus:border-indigo-500"), M(e, "type", "time")
            },
            m(n, s) {
                b(n, e, s), J(e, t[0].status), r || (l = [j(e, "change", t[10]), j(e, "input", t[11])], r = !0)
            },
            p(t, s) {
                1 & s && n !== (n = t[0].sent ? "ipt-rnd text-right border-red-500" : "ipt-rnd text-right focus:border-indigo-500") && M(e, "class", n), 1 & s && J(e, t[0].status)
            },
            d(t) {
                t && x(e), r = !1, s(l)
            }
        }
    }

    function re(e) {
        let n, s, r, l, o, i, c, a, u, d, f = (e[0].descr ? e[0].descr : "") + "",
            p = "number" == e[0].type && te(e),
            g = "text" == e[0].type && ee(e),
            h = "date" == e[0].type && ne(e),
            $ = "time" == e[0].type && se(e);
        return {
            c() {
                n = v("div"), s = v("div"), r = v("p"), l = y(f), i = k(), c = v("div"), p && p.c(), a = k(), g && g.c(), u = k(), h && h.c(), d = k(), $ && $.c(), M(r, "class", o = "pr-4 truncate text-" + (e[0].descrColor ? e[0].descrColor : "gray") + "-500 font-bold"), M(s, "class", "w-2/3"), M(c, "class", "flex justify-end w-1/3"), M(n, "class", "crd-itm-psn")
            },
            m(t, e) {
                b(t, n, e), m(n, s), m(s, r), m(r, l), m(n, i), m(n, c), p && p.m(c, null), m(c, a), g && g.m(c, null), m(c, u), h && h.m(c, null), m(c, d), $ && $.m(c, null)
            },
            p(t, [e]) {
                1 & e && f !== (f = (t[0].descr ? t[0].descr : "") + "") && S(l, f), 1 & e && o !== (o = "pr-4 truncate text-" + (t[0].descrColor ? t[0].descrColor : "gray") + "-500 font-bold") && M(r, "class", o), "number" == t[0].type ? p ? p.p(t, e) : (p = te(t), p.c(), p.m(c, a)) : p && (p.d(1), p = null), "text" == t[0].type ? g ? g.p(t, e) : (g = ee(t), g.c(), g.m(c, u)) : g && (g.d(1), g = null), "date" == t[0].type ? h ? h.p(t, e) : (h = ne(t), h.c(), h.m(c, d)) : h && (h.d(1), h = null), "time" == t[0].type ? $ ? $.p(t, e) : ($ = se(t), $.c(), $.m(c, null)) : $ && ($.d(1), $ = null)
            },
            i: t,
            o: t,
            d(t) {
                t && x(n), p && p.d(), g && g.d(), h && h.d(), $ && $.d()
            }
        }
    }

    function le(t, e, n) {
        t += e;
        let s = 0;
        do {
            if (s == n) return oe(t, e);
            t = ie(t, e), s++
        } while (0 != t.length);
        return "not found"
    }

    function oe(t, e) {
        let n = t.indexOf(e);
        return t.substring(0, n)
    }

    function ie(t, e) {
        let n = t.indexOf(e) + e.length;
        return t.substring(n)
    }

    function ce(t, e, n) {
        let {
            widget: s
        } = e, {
            wsPush: r = ((t, e, n) => {})
        } = e, l = "";

        function o() {
            n(0, s.status = le(l, "-", 2) + "." + le(l, "-", 1) + "." + le(l, "-", 0), s), r(s.ws, s.topic, s.status)
        }
        return t.$$set = t => {
            "widget" in t && n(0, s = t.widget), "wsPush" in t && n(1, r = t.wsPush)
        }, t.$$.update = () => {
            1 & t.$$.dirty && (s.status, function() {
                let t = s.status;
                n(2, l = le(t, ".", 2) + "-" + le(t, ".", 1) + "-" + le(t, ".", 0))
            }())
        }, [s, r, l, o, () => (n(0, s.sent = !0, s), r(s.ws, s.topic, s.status)), function() {
            s.status = L(this.value), n(0, s)
        }, () => (n(0, s.sent = !0, s), r(s.ws, s.topic, s.status)), function() {
            s.status = this.value, n(0, s)
        }, () => (n(0, s.sent = !0, s), o()), function() {
            l = this.value, n(2, l)
        }, () => (n(0, s.sent = !0, s), r(s.ws, s.topic, s.status)), function() {
            s.status = this.value, n(0, s)
        }]
    }
    class ae extends dt {
        constructor(t) {
            super(), ut(this, t, ce, re, l, {
                widget: 0,
                wsPush: 1
            })
        }
    }

    function ue(e) {
        let n, r, l, o, i, c, a, u, d, f, p, g, h, $ = (e[0].descr ? e[0].descr : "") + "",
            w = e[0].after + "";
        return {
            c() {
                n = v("div"), r = v("p"), l = y($), o = k(), i = y(e[4]), c = k(), a = y(w), d = k(), f = v("input"), M(r, "class", u = "pr-4 truncate text-" + (e[0].descrColor ? e[0].descrColor : "gray") + "-500 font-bold"), M(n, "class", "text-center"), M(f, "class", p = "form-range range-secondary w-full h-2 p-0 rounded-lg " + (e[0].sent ? "bg-red-300" : "bg-gray-300") + " focus:outline-none appearance-none"), M(f, "type", "range"), M(f, "min", e[2]), M(f, "max", e[3])
            },
            m(t, s) {
                b(t, n, s), m(n, r), m(r, l), m(r, o), m(r, i), m(r, c), m(r, a), b(t, d, s), b(t, f, s), J(f, e[0].status), g || (h = [j(f, "change", e[5]), j(f, "input", e[5]), j(f, "change", e[6])], g = !0)
            },
            p(t, [e]) {
                1 & e && $ !== ($ = (t[0].descr ? t[0].descr : "") + "") && S(l, $), 16 & e && S(i, t[4]), 1 & e && w !== (w = t[0].after + "") && S(a, w), 1 & e && u !== (u = "pr-4 truncate text-" + (t[0].descrColor ? t[0].descrColor : "gray") + "-500 font-bold") && M(r, "class", u), 1 & e && p !== (p = "form-range range-secondary w-full h-2 p-0 rounded-lg " + (t[0].sent ? "bg-red-300" : "bg-gray-300") + " focus:outline-none appearance-none") && M(f, "class", p), 4 & e && M(f, "min", t[2]), 8 & e && M(f, "max", t[3]), 1 & e && J(f, t[0].status)
            },
            i: t,
            o: t,
            d(t) {
                t && x(n), t && x(d), t && x(f), g = !1, s(h)
            }
        }
    }

    function de(t, e, n) {
        let s, {
                widget: r
            } = e,
            {
                wsPush: l = ((t, e, n) => {})
            } = e,
            o = r.min,
            i = r.max;
        return t.$$set = t => {
            "widget" in t && n(0, r = t.widget), "wsPush" in t && n(1, l = t.wsPush)
        }, t.$$.update = () => {
            1 & t.$$.dirty && (r.status, function() {
                var t, e, l, c, a;
                n(4, s = Math.round(r.status)), r.k && 0 !== r.k && (n(2, o = r.min / r.k), n(3, i = r.max / r.k), n(4, (t = r.status, e = o, l = i, c = r.min, a = r.max, s = Math.round((t - e) * (a - c) / (l - e) + c))))
            }())
        }, [r, l, o, i, s, function() {
            r.status = L(this.value), n(0, r)
        }, () => (n(0, r.sent = !0, r), l(r.ws, r.topic, r.status))]
    }
    class fe extends dt {
        constructor(t) {
            super(), ut(this, t, de, ue, l, {
                widget: 0,
                wsPush: 1
            })
        }
    }
    class pe {
        static ctx;
        constructor(t, e = {}, n = !1) {
            pe.ctx = this, this.$root = pe.make(t, e, n)
        }
        static make(t, e = {}, n = !1) {
            return t && "object" == typeof e ? e instanceof Node ? e : ("svg" == t && (n = !0), pe.config(n ? document.createElementNS("http://www.w3.org/2000/svg", t) : document.createElement(t), e, n)) : null
        }
        static config(t, e, n = !1) {
            if (Array.isArray(t)) return t.forEach((t => pe.config(t, e, n))), null;
            if (!(t instanceof Node) || "object" != typeof e) return t;
            let s = e.context;
            pe.ctx = null === s ? null : s || pe.ctx, s = pe.ctx;
            let r = e => {
                if (e)
                    if (e instanceof Node) t.appendChild(e);
                    else if (e instanceof pe) t.appendChild(e.$root);
                else if ("string" == typeof e) t.innerHTML += e;
                else if ("object" == typeof e) {
                    let s = pe.make(e.tag ?? "div", e, n || "svg" == e.tag);
                    s && t.appendChild(s)
                }
            };
            for (const [n, l] of Object.entries(e))
                if (l) switch (n) {
                    case "tag":
                    case "context":
                    case "get":
                    case "also":
                        continue;
                    case "text":
                        t.textContent = l + "";
                        break;
                    case "html":
                        t.innerHTML = l;
                        break;
                    case "class":
                        (Array.isArray(l) ? l : l.split(" ")).map((e => e && t.classList.add(e)));
                        break;
                    case "push":
                        l.push(t);
                        break;
                    case "var":
                        s && (s["$" + l] = t);
                        break;
                    case "events":
                        for (let e in l) t.addEventListener(e, l[e].bind(s));
                        break;
                    case "parent":
                        l && l.appendChild(t);
                        break;
                    case "attrs":
                        for (let e in l) t.setAttribute(e, l[e]);
                        break;
                    case "props":
                        for (let e in l) t[e] = l[e];
                        break;
                    case "child_r":
                        t.replaceChildren();
                    case "child":
                        r(l);
                        break;
                    case "children_r":
                        t.replaceChildren();
                    case "children":
                        for (const t of l) r(t);
                        break;
                    case "style":
                        if ("string" == typeof l) t.style.cssText += l + ";";
                        else
                            for (let e in l) t.style[e] = l[e];
                        break;
                    default:
                        t[n] = l
                }
            return e.also && s && e.also.call(s, t), t
        }
        static makeArray(t, e = !1) {
            return t && Array.isArray(t) ? t.map((t => pe.make(t.tag, t, e))) : []
        }
        static makeShadow(t, e = {}, n = null) {
            if (!t || "object" != typeof e) return null;
            let s = t instanceof Node ? t : document.createElement(t);
            return s.attachShadow({
                mode: "open"
            }), pe.config(s.shadowRoot, {
                context: e.context,
                children: [{
                    tag: "style",
                    textContent: n ?? ""
                }, e.child ?? {}, ...e.children ?? []]
            }), delete e.children, delete e.child, pe.config(s, e), s
        }
    }
    class ge {
        static make = (t, e) => pe.make(t, e, !0);
        static config = (t, e) => pe.config(t, e, !0);
        static makeArray = t => pe.makeArray(t, !0);
        static svg = (t = {}, e = {}) => ge._make("svg", t, e);
        static rect = (t, e, n, s, r, l, o = {}, i = {}) => ge._make("rect", {
            ...o,
            x: t,
            y: e,
            width: n,
            height: s,
            rx: r,
            ry: l
        }, i);
        static circle = (t, e, n, s = {}, r = {}) => ge._make("circle", {
            ...s,
            cx: t,
            cy: e,
            r: n
        }, r);
        static line = (t, e, n, s, r = {}, l = {}) => ge._make("line", {
            ...r,
            x1: t,
            y1: e,
            x2: n,
            y2: s
        }, l);
        static polyline = (t, e = {}, n = {}) => ge._make("polyline", {
            ...e,
            points: t
        }, n);
        static polygon = (t, e = {}, n = {}) => ge._make("polygon", {
            ...e,
            points: t
        }, n);
        static path = (t, e = {}, n = {}) => ge._make("path", {
            ...e,
            d: t
        }, n);
        static text = (t, e, n, s = {}, r = {}) => ge._make("text", {
            ...s,
            x: e,
            y: n
        }, {
            ...r,
            text: t
        });
        static _make = (t, e = {}, n = {}) => ge.make(t, {
            attrs: {
                ...e
            },
            ...n
        })
    }
    const he = (t, e, n) => t < e ? e : t > n ? n : t,
        me = (t, e, n, s, r) => n == e ? s : (t - e) * (r - s) / (n - e) + s,
        be = (t, e = 1) => t[t.length - e],
        xe = () => (new Date).getTime(),
        $e = 16,
        ve = 15,
        we = 12,
        ye = 16;
    class ke {
        data = {};
        cfg = {
            dark: !1,
            type: "bar",
            labels: [],
            period: 200
        };
        sel_mode = !1;
        pressX = 0;
        constructor(t, e = {}, n = window) {
            ke.css && (function(t) {
                    let e = document.createElement("style");
                    e.innerText = t, document.head.appendChild(e)
                }(ke.css), ke.css = null), t.style.overflow = "hidden", pe.make("div", {
                    context: this,
                    parent: t,
                    class: "svp",
                    var: "svp",
                    children: [{
                        class: "menu",
                        children: [{
                            class: "labels",
                            var: "labels"
                        }, {
                            style: "display:flex",
                            children: [{
                                class: "buttons none",
                                var: "buttons",
                                children: [{
                                    class: "button",
                                    child: Me("M 2,12 H 22 M 2,12 6.2,16.2 M 2,12 6.2,7.7 M 22,12 17.7,7.7 M 22,12 17.7,16.2"),
                                    events: {
                                        click: () => this.fitData()
                                    }
                                }, {
                                    class: "button",
                                    var: "single",
                                    child: Me("M17 4V20M17 20L13 16M17 20L21 16M7 20V4M7 4L3 8M7 4L11 8"),
                                    events: {
                                        click: () => {
                                            this.$single.classList.toggle("active"), this._render()
                                        }
                                    }
                                }, {
                                    class: "button",
                                    text: "1s",
                                    events: {
                                        click: () => this._setMax(1)
                                    }
                                }, {
                                    class: "button",
                                    text: "1m",
                                    events: {
                                        click: () => this._setMax(60)
                                    }
                                }, {
                                    class: "button",
                                    text: "1h",
                                    events: {
                                        click: () => this._setMax(3600)
                                    }
                                }, {
                                    class: "button",
                                    text: "1d",
                                    events: {
                                        click: () => this._setMax(86400)
                                    }
                                }, {
                                    class: "button",
                                    text: "1w",
                                    events: {
                                        click: () => this._setMax(604800)
                                    }
                                }, {
                                    class: ["sel_mode", "button"],
                                    var: "sel_mode",
                                    child: Me("M4.4 3.4c-.5-.1-.7-.2-.84-.14a.5.5 0 0 0-.3.3c-.1.16.0.4.14.84l4.21 14.3c.13.4.2.64.3.7a.5.5 0 0 0 .4.1c.16-.03.3-.2.6-.5L12 16l4.4 4.4.2.2.3.3.4.3a.5.5 0 0 0 .31 0c.1-.0.2-.14.41-.3l2.9-2.9c.2-.2.3-.3.3-.41a.5.5 0 0 0 0-.31c-.1-.1-.1-.2-.3-.41L16 12l3.1-3.1c.3-.3.47-.47.5-.63a.5.5 0 0 0-.1-.4c-.1-.13-.3-.2-.74-.31l-14.3-4.2Z"),
                                    events: {
                                        click: () => {
                                            this.sel_mode = !this.sel_mode, this.$sel_mode.classList.toggle("active")
                                        }
                                    }
                                }, {
                                    class: "button",
                                    child: Me("M3 21L21 3M3 21H9M3 21L3 15M21 3H15M21 3V9"),
                                    var: "fullscr",
                                    events: {
                                        click: () => {
                                            this.$svp.classList.toggle("fullscreen"), this.$fullscr.classList.toggle("active")
                                        }
                                    }
                                }, {
                                    class: "button",
                                    child: Me("M21 21H3M18 11L12 17M12 17L6 11M12 17V3"),
                                    events: {
                                        click: () => function(t) {
                                            t.style.width = t.clientWidth + "px", t.style.height = t.clientHeight + "px";
                                            let e = new XMLSerializer,
                                                n = document.createElement("a");
                                            n.href = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(e.serializeToString(t)), n.download = "plot.svg", n.click(), t.style.width = "100%", t.style.height = "100%"
                                        }(this.$plot)
                                    }
                                }, {
                                    class: "button",
                                    child: Me("M18 6L6 18M6 6L18 18"),
                                    events: {
                                        click: () => this.clearData()
                                    }
                                }, {
                                    class: "button",
                                    child: Me("M4 12H20M20 12L14 6M20 12L14 18"),
                                    var: "auto",
                                    events: {
                                        click: () => this.autoData()
                                    }
                                }]
                            }]
                        }, {
                            class: "dots",
                            child: {
                                tag: "svg",
                                var: "dots",
                                style: "width: 4px;height: 18px",
                                children: [...Array(3).keys()].map((t => ({
                                    tag: "circle",
                                    attrs: {
                                        cx: 2,
                                        cy: 2 + 7 * t,
                                        r: 2,
                                        fill: "var(--font)"
                                    }
                                })))
                            },
                            events: {
                                click: () => {
                                    this.$buttons.classList.toggle("none"), this.$labels.classList.toggle("none")
                                }
                            }
                        }]
                    }, {
                        class: "svcont",
                        var: "svcont",
                        child: {
                            tag: "svg",
                            var: "plot",
                            class: "svg",
                            style: "font-family: Verdana, sans-serif;pointer-events: none;",
                            attrs: {
                                width: "100%",
                                height: "100%"
                            },
                            children: [{
                                tag: "g",
                                var: "grid"
                            }, {
                                tag: "g",
                                var: "cursor"
                            }, {
                                tag: "g",
                                var: "lines"
                            }, {
                                tag: "g",
                                var: "markers"
                            }, {
                                tag: "g",
                                var: "gtext"
                            }, {
                                tag: "g",
                                var: "dur",
                                children: [{
                                    tag: "rect",
                                    var: "dur_rect",
                                    attrs: {
                                        y: 15,
                                        width: 0,
                                        stroke: "none",
                                        fill: "black"
                                    },
                                    style: "filter: opacity(0.3)"
                                }, {
                                    tag: "text",
                                    var: "dur_text",
                                    attrs: {
                                        y: 11,
                                        fill: "--font",
                                        "text-anchor": "middle"
                                    },
                                    style: "font-size: 13px"
                                }]
                            }, {
                                tag: "g",
                                var: "tooltip",
                                style: "filter: opacity(0.9)"
                            }]
                        }
                    }]
                }),
                function(t, e, n = window, s = 300, r = 5) {
                    const l = "ontouchstart" in n.document.documentElement;
                    let o = 0,
                        i = [],
                        c = null,
                        a = {
                            x: 0,
                            y: 0
                        },
                        u = !1,
                        d = (t, n) => {
                            e({
                                type: t,
                                touch: l,
                                move: {
                                    x: 0,
                                    y: 0
                                },
                                pos: {
                                    x: 0,
                                    y: 0
                                },
                                drag: a,
                                pressed: l ? i.length >= 2 : o,
                                ...n
                            })
                        },
                        f = (e, s) => ({
                            x: Math.round(e - t.getBoundingClientRect().left),
                            y: Math.round(s - t.getBoundingClientRect().top - n.document.documentElement.scrollTop)
                        }),
                        p = t => f(t.pageX, t.pageY),
                        g = () => {
                            a = {
                                x: 0,
                                y: 0
                            }, c && clearTimeout(c), c = setTimeout((() => c = null), s)
                        },
                        h = () => {
                            c && (clearTimeout(c), c = null)
                        },
                        m = () => {
                            let t = 0;
                            return c && (h(), t = Math.abs(a.x) < r && Math.abs(a.y) < r), a = {
                                x: 0,
                                y: 0
                            }, t
                        };
                    if (l) {
                        let e = (t, e) => {
                                for (let n in t.changedTouches)
                                    if (t.changedTouches[n].identifier == e) return s(t, n);
                                return null
                            },
                            s = (t, e) => {
                                let n = t.changedTouches[e];
                                return {
                                    id: n.identifier,
                                    x: n.pageX,
                                    y: n.pageY
                                }
                            },
                            r = e => {
                                u && e.target != t && !i.length && (u = !1, d("leave"), n.document.removeEventListener("touchstart", r), n.document.removeEventListener("touchmove", l), n.document.removeEventListener("touchend", o), n.document.removeEventListener("touchcancel ", o))
                            },
                            l = t => {
                                if (i.length) {
                                    if (1 == i.length) {
                                        let n = i[0],
                                            s = e(t, n.id);
                                        if (!s) return;
                                        t.preventDefault(), d("move", {
                                            move: {
                                                x: s.x - n.x,
                                                y: s.y - n.y
                                            },
                                            pos: f(s.x, s.y)
                                        }), h()
                                    } else {
                                        let n = [0, 0],
                                            s = [0, 0],
                                            r = 0;
                                        for (let l in n) s[l] = i[l], n[l] = e(t, s[l].id), n[l] ? r = 1 : n[l] = s[l];
                                        if (r) {
                                            t.preventDefault();
                                            let e = (n[0].x + n[1].x) / 2,
                                                r = (n[0].y + n[1].y) / 2,
                                                l = e - (s[0].x + s[1].x) / 2,
                                                o = r - (s[0].y + s[1].y) / 2;
                                            a.x += l, a.y += o, d("drag", {
                                                move: {
                                                    x: l,
                                                    y: o
                                                },
                                                pos: f(e, r)
                                            });
                                            let i = Math.abs(n[0].x - n[1].x),
                                                c = Math.abs(n[0].y - n[1].y),
                                                u = Math.abs(s[0].x - s[1].x),
                                                p = Math.abs(s[0].y - s[1].y);
                                            d("zoom", {
                                                zoom: Math.hypot(i, c) - Math.hypot(u, p),
                                                pos: f(e, r)
                                            })
                                        }
                                    }
                                    for (let n in i) {
                                        let s = e(t, i[n].id);
                                        s && (i[n] = s)
                                    }
                                }
                            },
                            o = t => {
                                if (i.length) {
                                    let e = s(t, 0);
                                    if (!e) return;
                                    let n = i.findIndex((t => e.id == t.id));
                                    ~n && (t.preventDefault(), i.splice(n, 1), i.length || (d("trelease", {
                                        pos: f(e.x, e.y)
                                    }), m() && d("click", {
                                        pos: f(e.x, e.y)
                                    })), 1 == i.length && d("release", {
                                        pos: f(e.x, e.y)
                                    }))
                                }
                            };
                        t.addEventListener("touchstart", (t => {
                            t.preventDefault();
                            let e = s(t, 0);
                            if (!e) return;
                            let c = i.findIndex((t => e.id == t.id));
                            ~c && i.splice(c, 1), i.unshift(e), 1 == i.length && (g(), u || (u = !0, n.document.addEventListener("touchstart", r, {
                                passive: !1
                            }), n.document.addEventListener("touchmove", l, {
                                passive: !1
                            }), n.document.addEventListener("touchend", o), n.document.addEventListener("touchcancel ", o), d("enter", {
                                pos: f(e.x, e.y)
                            })), d("tpress", {
                                pos: f(e.x, e.y)
                            })), 2 == i.length && (d("press", {
                                pos: f(e.x, e.y)
                            }), h())
                        }), {
                            passive: !1
                        })
                    } else {
                        let e = () => {
                                n.document.removeEventListener("mousemove", r), n.document.removeEventListener("mouseup", l)
                            },
                            s = () => {
                                n.document.addEventListener("mousemove", r), n.document.addEventListener("mouseup", l)
                            },
                            r = t => {
                                o && (t.preventDefault(), a.x += t.movementX, a.y += t.movementY, d("drag", {
                                    move: {
                                        x: t.movementX,
                                        y: t.movementY
                                    },
                                    pos: p(t)
                                }))
                            },
                            l = n => {
                                o && (n.preventDefault(), o = 0, d("release", {
                                    pos: p(n)
                                }), m() && d("click", {
                                    pos: p(n)
                                }), n.target !== t && e())
                            };
                        t.addEventListener("mouseenter", (t => {
                            d("enter", {
                                pos: p(t)
                            }), s()
                        })), t.addEventListener("mouseleave", (t => {
                            d("leave", {
                                pos: p(t)
                            }), o || e()
                        })), t.addEventListener("mousedown", (t => {
                            o || (s(), t.preventDefault(), o = 1, g(), d("press", {
                                pos: p(t)
                            }))
                        })), t.addEventListener("mousemove", (t => {
                            o || d("move", {
                                move: {
                                    x: t.movementX,
                                    y: t.movementY
                                },
                                pos: p(t)
                            })
                        })), t.addEventListener("wheel", (t => {
                            t.preventDefault(), d("zoom", {
                                zoom: -t.deltaY / 100,
                                pos: p(t)
                            })
                        }), {
                            passive: !1
                        })
                    }
                }(this.$svcont, (t => {
                    let e = this.$plot.clientWidth,
                        n = this.$plot.clientHeight,
                        s = "timeline" == this.cfg.type;
                    switch (t.touch && "move" === t.type && (t.type = "drag"), t.type) {
                        case "zoom": {
                            let n = () => this.maxSecs = he(this.maxSecs, 1, 31536e4),
                                s = this.maxSecs;
                            t.touch ? (this.maxSecs -= t.zoom / (e / this.maxSecs / 2), n(), this.tZero += (this.maxSecs - s) / 2) : (this.maxSecs *= -t.zoom / 5 + 1, n(), this.tZero += (this.maxSecs - s) * (1 - t.pos.x / e)), this.auto && this._resetZ(), this._clearMarkers(), this._render()
                        }
                        break;
                        case "drag":
                            if (this.sel_mode) {
                                let n = Math.abs(t.pos.x - this.pressX),
                                    s = Math.min(this.pressX, t.pos.x),
                                    r = n / e * this.maxSecs;
                                ge.config(this.$dur_rect, {
                                    attrs: {
                                        x: Math.min(this.pressX, t.pos.x),
                                        width: n
                                    }
                                }), ge.config(this.$dur_text, {
                                    attrs: {
                                        x: s + n / 2,
                                        fill: this._getProp("--font")
                                    },
                                    text: Math.floor(r / 86400) + ":" + new Date(1e3 * r).toISOString().slice(11, 22)
                                })
                            } else this.tZero -= t.move.x / (e / this.maxSecs), this._auto(!1), this._render();
                            break;
                        case "press":
                        case "tpress":
                            this._clearMarkers(), this.pressX = t.pos.x, this.sel_mode && (ge.config(this.$dur_rect, {
                                attrs: {
                                    x: t.pos.x,
                                    width: 0,
                                    height: n - ve - $e
                                }
                            }), this.$dur.style.display = "unset");
                            break;
                        case "release":
                        case "trelease":
                            this.$dur.style.display = "none";
                            break;
                        case "leave":
                            this._clearMarkers();
                            break;
                        case "move":
                        case "click": {
                            let r = 1e3 * (this.tZero - (1 - t.pos.x / e) * this.maxSecs),
                                l = 150,
                                o = he(t.pos.x, l / 2, e - l / 2),
                                i = t => (t => new Date(t - 6e4 * (new Date).getTimezoneOffset()))(t).toISOString().split("T");
                            if (ge.config(this.$cursor, {
                                    children_r: [Ce(t.pos.x, s ? 0 : $e, t.pos.x, n - ve, this._getProp("--grid"), 1), ge.rect(o - l / 2, n - ve, l, ve, 3, 0, {
                                        fill: this._getProp("--grid")
                                    }), je(i(r).join(" ").slice(0, -3), o, n - 3, this._getProp("--font"), 12, {
                                        "text-anchor": "middle"
                                    })]
                                }), !this.points) break;
                            let c = t => {
                                    let n = ge.make("rect");
                                    ge.config(this.$tooltip, {
                                        children_r: [n, ...t]
                                    });
                                    let s = this.$tooltip.getBBox();
                                    ge.config(n, {
                                        attrs: {
                                            x: s.x - 4,
                                            width: s.width + 8,
                                            y: s.y - 4,
                                            height: s.height + 8,
                                            rx: 4,
                                            fill: this._getProp("--back"),
                                            stroke: this._getProp("--font")
                                        }
                                    }), ge.config(this.$tooltip, {
                                        attrs: {
                                            transform: `translate(${e-1-s.width-4} 18)`
                                        }
                                    })
                                },
                                a = this._getProp("--font");
                            if (s) {
                                if ("click" == t.type) {
                                    for (let t of this.points) t.rect.classList.remove("active");
                                    for (let e of this.points)
                                        if (t.pos.x >= e.x1 && t.pos.x <= e.x2 && t.pos.y >= e.y1 && t.pos.y <= e.y2) {
                                            let t = -16,
                                                n = (t, e, n, s) => je(t + ": " + (e ? "-" : i(n).join(" ").slice(0, -5)), 0, s, a, we);
                                            c([je(this.cfg.labels[e.axis], 0, t += ye, this._getCol(e.axis), we, {}, !0), n("Start", e.block.fstart, e.block.start, t += 19), n("Stop", e.block.fstop, e.block.stop, t += ye), je("Duration: " + new Date(e.block.stop - e.block.start).toISOString().substring(11, 19), 0, t += ye, a, we)]), e.rect.classList.add("active");
                                            break
                                        }
                                }
                            } else if ("bar" === this.cfg.type && this.points) {
                                const e = Object.keys(this.points).map(Number).sort(((t, e) => t - e)),
                                    s = this.$plot.clientWidth;
                                for (const r of e) {
                                    const l = s / e.length * .8,
                                        o = s - (1e3 * this.tZero - r) * s / (1e3 * this.maxSecs),
                                        u = o - l / 2,
                                        d = o + l / 2;
                                    if (t.pos.x >= u && t.pos.x <= d) {
                                        const t = this.points[r][0],
                                            e = Number(t);
                                        if (isNaN(e)) break;
                                        const s = i(r);
                                        let o = -16;
                                        c([je(`${this.cfg.labels[0]||"Value"}: ${e.toFixed(2)}`, 0, o += ye, this._getCol(0), we, {}, !0), je(s[0], 0, o += ye, a, we), je(s[1].slice(0, -2), 0, o += ye, a, we)]), ge.config(this.$markers, {
                                            children_r: [ge.rect(u, $e, l, n - ve - $e, 2, 2, {
                                                fill: this._getCol(1),
                                                "fill-opacity": .3
                                            })]
                                        }), found = !0;
                                        break
                                    }
                                }
                            } else {
                                let t = 0,
                                    e = Object.keys(this.points).map(Number);
                                for (let n = 1; n < e.length; n++)
                                    if (e[n] >= r) {
                                        t = e[e[n] - r < r - e[n - 1] ? n : n - 1];
                                        break
                                    } if (t && this.points[t].y) {
                                    ge.config(this.$markers, {
                                        children_r: this.points[t].y.map(((e, n) => this._disabled(n) ? null : ge.circle(this.points[t].x, e, 4, {
                                            stroke: this._getCol(n),
                                            fill: this._getProp("--back"),
                                            "stroke-width": 2
                                        })))
                                    });
                                    let e = -16;
                                    c([...this.points[t].y.map(((n, s) => je(`${this.cfg.labels[s]??s}: ${this.data[t][s].toFixed(2)}${this.units[s]??""}`, 0, e += ye, this._getCol(s), we, {}, !0))), je(i(t)[0], 0, e += 21, a, we), je(i(t)[1].slice(0, -2), 0, e += ye, a, we)])
                                }
                            }
                        }
                    }
                }), n), this.maxSecs = this.$plot.clientWidth / 10, this.maxSecs < 30 && (this.maxSecs = 30), this.setConfig(e), this._resizer = new ResizeObserver((async () => {
                    await new Promise(requestAnimationFrame), this._render()
                })), this._resizer.observe(this.$plot)
        }
        release() {
            this._resizer.disconnect()
        }
        setConfig(t) {
            this.cfg = {
                ...this.cfg,
                ...t
            }, this.$svp.className = "svp " + (this.cfg.dark ? "dark" : "light"), this.$plot.style.background = this._getProp("--back"), this.units = [], this.cfg.labels = this.cfg.labels.map((t => {
                let e = "",
                    n = t.match(/(.*)\[(.*)\]$/);
                return n && (t = n[1], e = n[2]), this.units.push(e), t
            })), this.labels = [], pe.config(this.$labels, {
                children_r: this.cfg.labels.map(((t, e) => pe.make("div", {
                    class: "label",
                    push: this.labels,
                    children: [{
                        class: "marker",
                        style: `background:${this._getCol(e)}`
                    }, {
                        tag: "span",
                        text: t
                    }],
                    events: {
                        click: () => {
                            "timeline" != this.cfg.type && (this.labels[e].classList.toggle("tint"), this._render())
                        }
                    }
                })))
            }), this.tmr && clearTimeout(this.tmr), this._render()
        }
        clearData() {
            this.data = {}, this.tZero = xe() / 1e3 | 0, this._render()
        }
        fitData() {
            this._resetZ(), this._fit(), this._render()
        }
        autoData() {
            this._resetZ(), this._auto(!0), this._render()
        }
        setData(t) {
            let e = Array.isArray(t);
            switch (this.cfg.type) {
                case "bar":
                    for (let e in t) {
                        let n = Number(e);
                        n = Math.floor(n < 99999999999 ? 1e3 * n : n), this.data[n] = [t[e]]
                    }
                    break;
                case "running":
                    this.tmr && clearTimeout(this.tmr), this.tmr = setTimeout((() => {
                        let t = Object.values(this.data);
                        var e, n;
                        t.length < 2 || (e = be(t), n = be(t, 2), e && n && e.every(((t, e) => t === n[e])) && delete this.data[be(Object.keys(this.data))], this.setData([...be(t)]))
                    }), this.cfg.period);
                case "stack":
                    if (!e) return;
                    this.data[xe()] = t.map(Number);
                    break;
                case "timeline":
                    if (e) return;
                    if (!Array.isArray(Object.values(t)[0])) {
                        let e = {};
                        for (let n in t)
                            for (let s in t[n]) e[s] = !0;
                        let n = new Array(Object.keys(e).length).fill(!1),
                            s = Object.values(this.data);
                        s.length && (n = [...be(s)]);
                        for (let e in t) {
                            for (let s in t[e]) n[s] = t[e][s];
                            t[e] = [...n]
                        }
                    }
                default:
                    if (e) return;
                    let n = Number(be(Object.keys(this.data)));
                    for (let e in t) {
                        let s = Number(e);
                        s = Math.floor(s < 99999999999 ? 1e3 * s : s), (!n || n < s) && (this.data[s] = t[e].map(Number))
                    }
            }
            if (!this.cfg.labels.length) {
                let t = Object.values(this.data);
                t.length && this.setConfig({
                    labels: t[0].map(((t, e) => "Line " + e))
                })
            }
            this.tZero || (this._auto(!0), this._fit()), this.auto && (this._resetZ(), this._clearMarkers()), this._render()
        }
        _render() {
            if (this.$lines.replaceChildren(), this.$grid.replaceChildren(), this.$gtext.replaceChildren(), this.points = null, !this.tZero) return;
            let t = this.$plot.clientWidth,
                e = this.$plot.clientHeight;
            if (e < 50) return;
            let n = Object.keys(this.data).map(Number),
                s = (t, n, s) => me(t, n, s, e - ve, $e),
                r = e => t + (e / 1e3 - this.tZero) * t / this.maxSecs,
                l = t => this.points[n[t]] = this.data[n[t]];
            for (let t = 0; t < n.length; t++)
                if (this.points) {
                    if (l(t), n[t] >= 1e3 * this.tZero) break
                } else t + 1 < n.length && n[t + 1] >= 1e3 * (this.tZero - this.maxSecs) && (this.points = {}, l(t));
            if (this.points)
                if ("bar" === this.cfg.type && this.points) {
                    const t = this.$plot.clientWidth,
                        e = this.$plot.clientHeight,
                        n = Object.keys(this.points).map(Number).sort(((t, e) => t - e));
                    let s = 1 / 0,
                        r = -1 / 0;
                    for (const t of n) {
                        const e = this.points[t][0];
                        e < s && (s = e), e > r && (r = e)
                    }
                    s === 1 / 0 && (s = 0), r === -1 / 0 && (r = 1);
                    const l = e => t - (1e3 * this.tZero - e) * t / (1e3 * this.maxSecs),
                        o = t => me(t, s, r, e - ve, $e);
                    for (const s of n) {
                        const r = t / n.length * .8,
                            i = l(s) - r / 2,
                            c = o(this.points[s][0]);
                        ge.config(this.$lines, {
                            child: ge.rect(i, c, r, e - ve - c, 2, 2, {
                                fill: this._getCol(0),
                                stroke: this._getProp("--back"),
                                "stroke-width": 1
                            })
                        })
                    }
                } else if ("timeline" == this.cfg.type) {
                let t = Object.values(this.points),
                    n = Object.keys(this.points).map(Number),
                    s = [];
                for (let e in t[0]) {
                    let r = [],
                        l = 0;
                    t[0][e] && (r.push({
                        fstart: !0,
                        start: n[0]
                    }), l = 1);
                    for (let t in this.points) {
                        t = Number(t);
                        let n = this.points[t][e];
                        l && !n && (be(r).stop = t, l = 0), !l && n && (r.push({
                            start: t
                        }), l = 1)
                    }
                    if (l) {
                        let t = be(r);
                        t.stop = be(n), t.fstop = !0
                    }
                    s.push(r)
                }
                let l = t[0].length,
                    o = (e - ve - 5) / l,
                    i = .8 * o;
                this.points = [];
                for (let t in s) {
                    t = Number(t);
                    for (let e of s[t]) {
                        let n = r(e.start),
                            s = r(e.stop),
                            l = o * t + (o - i) / 2,
                            c = ge.rect(n, l, s - n, i, 3, 0, {
                                fill: this._getCol(t)
                            }, {
                                class: "tblock"
                            });
                        this.$lines.appendChild(c), c.style.setProperty("--active", _e(t, 1, this._getColv() + .1)), this.points.push({
                            x1: n,
                            x2: s,
                            y1: l,
                            y2: l + i,
                            axis: t,
                            block: e,
                            rect: c
                        })
                    }
                }
            } else {
                let n = Object.keys(this.points).length,
                    l = t / 1;
                if (n > l) {
                    let t = this.points;
                    this.points = {};
                    let e = Object.keys(t);
                    for (let s = 0; s < l; s++) {
                        let r = Math.floor(s / l * n);
                        this.points[e[r]] = t[e[r]]
                    }
                }
                const o = 999999999;
                let i = -o,
                    c = o,
                    a = {},
                    u = {};
                for (let t in this.points) {
                    let e = this.points[t];
                    for (let t in e) this._disabled(t) || (e[t] > i && (i = e[t]), e[t] < c && (c = e[t]), t in a || (a[t] = -o), t in u || (u[t] = o), e[t] > a[t] && (a[t] = e[t]), e[t] < u[t] && (u[t] = e[t]))
                }
                if (c != o) {
                    let n = this.$single.classList.contains("active");
                    for (let t in this.points) {
                        let e, l = r(t);
                        e = n ? this.points[t].map(((t, e) => s(t, u[e], a[e]))) : this.points[t].map((t => s(t, c, i))), this.points[t] = {
                            x: l,
                            y: e
                        }
                    }
                    let l = Object.values(this.points);
                    for (let t in l[0].y) {
                        if (this._disabled(t)) continue;
                        let e = "";
                        l.forEach((n => e += `${n.x},${n.y[t]} `)), ge.config(this.$lines, {
                            child: ge.polyline(e, {
                                fill: "none",
                                stroke: this._getCol(t),
                                "stroke-width": 2
                            })
                        })
                    } {
                        const r = 9;
                        let l = Math.round(e / 80),
                            o = (i - c) / l,
                            d = {
                                filter: `drop-shadow(0 0 1px ${this._getProp("--back")})`
                            };
                        for (let e = 0; e < l + 1; e++) {
                            let r = s(i - o * e, c, i);
                            e != l && this.$grid.appendChild(Ce(0, r, t, r, this._getProp("--grid"), 1, {
                                "stroke-dasharray": "7 8"
                            })), n || this.$gtext.appendChild(je((i - o * e).toFixed(1), 0, r - 5, this._getProp("--font"), 12, d))
                        }
                        if (n) {
                            let t = 0;
                            for (let e in a) {
                                e = Number(e);
                                for (let n = 0; n < l + 1; n++) {
                                    let r = s(i - o * n, c, i);
                                    this.$gtext.appendChild(je((a[e] - (a[e] - u[e]) / l * n).toFixed(1), t, r - 5, this._getCol(e), 12, d))
                                }
                                t += Math.max(a[e].toFixed(1).length, u[e].toFixed(1).length) * r
                            }
                        }
                    }
                }
            } {
                let n = Math.round(t / 150),
                    s = this.maxSecs / n,
                    r = 0;
                for (let t of [86400, 3600, 1800, 60, 30, 10, 5, 1])
                    if (s >= t) {
                        r = t;
                        break
                    } r || (r = .1), s = Math.floor(s / r) * r;
                let l = Math.ceil(this.tZero / s) * s;
                if (!s) return;
                let o = 0;
                for (;;) {
                    let n = l - s * o,
                        r = t - t * (this.tZero - n) / this.maxSecs;
                    if (r < -75) break;
                    o++;
                    let i = this.maxSecs < 86400 ? new Date(1e3 * n).toTimeString().split(" ")[0] : new Date(1e3 * n).toISOString().split("T")[0];
                    ge.config(this.$grid, {
                        children: [Ce(0, e - ve, t, e - ve, this._getProp("--grid"), 1.5), Ce(r, e - ve - 6, r, e - ve - 1, this._getProp("--grid"), 2), je(i, r, e - ve + 14, this._getProp("--font"), 11, {
                            "text-anchor": "middle"
                        })]
                    })
                }
            }
        }
        _getProp(t) {
            return window.getComputedStyle(this.$svp).getPropertyValue(t)
        }
        _resetZ() {
            let t = Object.keys(this.data);
            this.tZero = (t.length ? Number(t.slice(-1)[0]) : xe()) / 1e3
        }
        _clearMarkers() {
            this.$cursor.replaceChildren(), this.$markers.replaceChildren(), this.$tooltip.replaceChildren()
        }
        _disabled(t) {
            return this.labels[t] && this.labels[t].classList.contains("tint")
        }
        _getColv() {
            return this.cfg.dark ? .55 : .47
        }
        _getCol(t) {
            return _e(t, .6, this._getColv())
        }
        _fit() {
            let t = Object.keys(this.data).map(Number);
            t.length > 2 && (this.maxSecs = (be(t) - t[0]) / 1e3)
        }
        _auto(t) {
            this.auto != t && (this.auto = t, t ? this.$auto.classList.add("active") : this.$auto.classList.remove("active"))
        }
        _setMax(t) {
            this.maxSecs = t, this._render()
        }
        labels = [];
        units = [];
        points = null;
        tZero = 0;
        maxSecs = 10;
        auto = !1;
        static css = ".svp.light{--back:#fff;--font:#111;--grid:#cacaca}.svp.dark{--back:#1c1d22;--font:#c3c3c3;--grid:#4a4a4a}.svp{all:unset;font-family:Verdana,sans-serif;background:var(--back);height:100%;width:100%;display:flex;flex-direction:column;color:var(--font);user-select:none;padding:4px;box-sizing:border-box}.svp.fullscreen{position:fixed;left:0;top:0}.svp .svcont{width:100%;height:100%;overflow:hidden;touch-action:none}.svp .menu{all:unset;flex-shrink:0;display:flex;justify-content:space-between;align-items:center;padding:5px 3px;min-height:24px}.svp .label{all:unset;display:inline-flex;vertical-align:middle;align-items:center;padding-right:7px;font-size:14px;cursor:pointer}.svp .label.tint{filter:opacity(.4)}.svp .label .marker{all:unset;width:7px;height:7px;margin-right:6px}.svp .buttons{all:unset;display:flex;align-items:stretch;gap:3px;flex-wrap:wrap}.svp .tblock.active{fill:var(--active);stroke:#000;stroke-width:3}.svp .button{all:unset;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid var(--grid);border-radius:7px;padding:2px;width:16px;height:16px;font-size:11px}.svp .button.active{border:1px solid var(--font)}.svp .button:hover{border:1px solid var(--font)}.svp .none{display:none}.svp .dots{all:unset;display:flex;align-items:center;justify-content:center;cursor:pointer;padding-left:7px}"
    }
    const _e = (t, e, n) => ((t, e, n) => {
            t %= 360;
            let s = e * Math.min(n, 1 - n),
                r = (e, r = (e + t / 30) % 12) => n - s * Math.max(Math.min(r - 3, 9 - r, 1), -1);
            return "rgb(" + Math.round(255 * r(0)) + "," + Math.round(255 * r(8)) + "," + Math.round(255 * r(4)) + ")"
        })(260 * t + 0, e, n),
        je = (t, e, n, s, r, l = {}, o = !1) => ge.text(t, e, n, {
            fill: s,
            ...l
        }, {
            style: `font-size: ${r}px;font-weight:${o?"bold":"unset"}`
        }),
        Ce = (t, e, n, s, r, l, o = {}) => ge.line(t, e, n, s, {
            stroke: r,
            fill: "none",
            "stroke-width": l,
            ...o
        }),
        Me = t => ge.svg({
            viewBox: "0 0 24 24"
        }, {
            style: "width:24px;height:24px",
            child: ge.path(t, {
                fill: "none",
                stroke: "var(--font)",
                "stroke-width": 2,
                "stroke-linecap": "round",
                "stroke-linejoin": "round"
            })
        });

    function Le(e) {
        let n, s, r, l, o, i, c = e[0].descr + "";
        return {
            c() {
                n = v("div"), s = v("div"), r = v("p"), l = y(c), o = k(), i = v("div"), M(r, "class", "descr"), M(s, "class", "text-center"), M(i, "class", "svp-container"), M(n, "class", "chart-container")
            },
            m(t, c) {
                b(t, n, c), m(n, s), m(s, r), m(r, l), m(n, o), m(n, i), e[4](i)
            },
            p(t, [e]) {
                1 & e && c !== (c = t[0].descr + "") && S(l, c)
            },
            i: t,
            o: t,
            d(t) {
                t && x(n), e[4](null)
            }
        }
    }

    function Se(t, e, n) {
        let s, r, l, {
            widget: o
        } = e;

        function i() {
            const t = {};
            return o.status && o.status.forEach((e => {
                const n = [];
                for (let t = 1;; t++) {
                    const s = `y${t}`;
                    if (void 0 === e[s]) break;
                    n.push(e[s])
                }
                n.length > 0 && (t[e.x] = n)
            })), t
        }
        const c = {
            dark: !1,
            type: "bar" === o.type ? "bar" : "plot",
            labels: Array.isArray(o.series) ? o.series : ["Data"],
            period: 2e3
        };
        var a;
        return H((() => {
            s && (n(2, r = new ke(s, c)), r.setData(i()), r.fitData())
        })), a = () => {
            r && r.release()
        }, D().$$.on_destroy.push(a), t.$$set = t => {
            "widget" in t && n(0, o = t.widget)
        }, t.$$.update = () => {
            13 & t.$$.dirty && r && o.status && (o.status != l && (r.setData(i()), r.setConfig({
                labels: Array.isArray(o.series) ? o.series : ["Данные"],
                type: "bar" === o.type ? "bar" : "plot"
            }), r.fitData()), n(3, l = o.status))
        }, [o, s, r, l, function(t) {
            q[t ? "unshift" : "push"]((() => {
                s = t, n(1, s)
            }))
        }]
    }
    class Je extends dt {
        constructor(t) {
            super(), ut(this, t, Se, Le, l, {
                widget: 0
            })
        }
    }

    function Te(t) {
        let e, n, s, r, l, o, i, c = (t[0].descr ? t[0].descr : "") + "";
        return o = new Je({
            props: {
                widget: t[0],
                id: "notes",
                title: "",
                height: "150",
                padding: "0px",
                margin: "0px"
            }
        }), {
            c() {
                e = v("div"), n = v("p"), s = y(c), l = k(), it(o.$$.fragment), M(n, "class", r = "inline-block italic truncate align-top text-center text-" + (t[0].descrColor ? t[0].descrColor : "gray") + "-500 txt-sz"), M(e, "class", "text-center")
            },
            m(t, r) {
                b(t, e, r), m(e, n), m(n, s), b(t, l, r), ct(o, t, r), i = !0
            },
            p(t, [e]) {
                (!i || 1 & e) && c !== (c = (t[0].descr ? t[0].descr : "") + "") && S(s, c), (!i || 1 & e && r !== (r = "inline-block italic truncate align-top text-center text-" + (t[0].descrColor ? t[0].descrColor : "gray") + "-500 txt-sz")) && M(n, "class", r);
                const l = {};
                1 & e && (l.widget = t[0]), o.$set(l)
            },
            i(t) {
                i || (st(o.$$.fragment, t), i = !0)
            },
            o(t) {
                rt(o.$$.fragment, t), i = !1
            },
            d(t) {
                t && x(e), t && x(l), at(o, t)
            }
        }
    }

    function Oe(t, e, n) {
        let {
            widget: s
        } = e;
        return t.$$set = t => {
            "widget" in t && n(0, s = t.widget)
        }, [s]
    }
    class Ee extends dt {
        constructor(t) {
            super(), ut(this, t, Oe, Te, l, {
                widget: 0
            })
        }
    }

    function Ne(e) {
        let n, r, l, o, i, c, a, u, d, f, p, g, h, $, w, _, C, L, J, T, O = (e[0].descr ? e[0].descr : "") + "";
        return {
            c() {
                n = v("div"), r = v("div"), l = v("p"), o = y(O), c = k(), a = v("div"), u = v("label"), d = v("div"), f = v("input"), g = k(), h = v("div"), w = k(), _ = v("div"), M(l, "class", i = "pr-4 truncate text-" + (e[0].descrColor ? e[0].descrColor : "gray") + "-500 font-bold"), M(r, "class", "w-2/3"), M(f, "id", p = e[0].topic), M(f, "type", "checkbox"), M(f, "class", "sr-only"), M(h, "class", $ = "block " + (e[1] ? "bg-blue-600" : "bg-gray-600") + " w-10 h-6 rounded-full shadow-lg"), M(_, "class", C = "dot " + (e[0].sent ? "bg-red-300" : "bg-gray-100") + " absolute left-1 top-1 w-4 h-4 rounded-full transition shadow-lg"), M(d, "class", "relative"), M(u, "for", L = e[0].topic), M(u, "class", "items-center cursor-pointer"), M(a, "class", "flex justify-end w-1/3"), M(n, "class", "crd-itm-psn")
            },
            m(t, s) {
                b(t, n, s), m(n, r), m(r, l), m(l, o), m(n, c), m(n, a), m(a, u), m(u, d), m(d, f), f.checked = e[1], m(d, g), m(d, h), m(d, w), m(d, _), J || (T = [j(f, "change", e[4]), j(f, "change", e[5])], J = !0)
            },
            p(t, [e]) {
                1 & e && O !== (O = (t[0].descr ? t[0].descr : "") + "") && S(o, O), 1 & e && i !== (i = "pr-4 truncate text-" + (t[0].descrColor ? t[0].descrColor : "gray") + "-500 font-bold") && M(l, "class", i), 1 & e && p !== (p = t[0].topic) && M(f, "id", p), 2 & e && (f.checked = t[1]), 2 & e && $ !== ($ = "block " + (t[1] ? "bg-blue-600" : "bg-gray-600") + " w-10 h-6 rounded-full shadow-lg") && M(h, "class", $), 1 & e && C !== (C = "dot " + (t[0].sent ? "bg-red-300" : "bg-gray-100") + " absolute left-1 top-1 w-4 h-4 rounded-full transition shadow-lg") && M(_, "class", C), 1 & e && L !== (L = t[0].topic) && M(u, "for", L)
            },
            i: t,
            o: t,
            d(t) {
                t && x(n), J = !1, s(T)
            }
        }
    }

    function Pe(t, e, n) {
        let {
            widget: s
        } = e, {
            toggleState: r = !1
        } = e, {
            wsPush: l = ((t, e, n) => {})
        } = e;

        function o() {
            n(0, s.sent = !0, s), n(0, s.status = r ? "1" : "0", s)
        }
        return t.$$set = t => {
            "widget" in t && n(0, s = t.widget), "toggleState" in t && n(1, r = t.toggleState), "wsPush" in t && n(2, l = t.wsPush)
        }, t.$$.update = () => {
            1 & t.$$.dirty && (s.status, "1" == s.status ? n(1, r = !0) : "0" == s.status && n(1, r = !1))
        }, [s, r, l, o, function() {
            r = this.checked, n(1, r)
        }, () => (o(), l(s.ws, s.topic, s.status))]
    }
    class De extends dt {
        constructor(t) {
            super(), ut(this, t, Pe, Ne, l, {
                widget: 0,
                toggleState: 1,
                wsPush: 2
            })
        }
    }

    function He(e) {
        let n, s, r, l, o, i, c, a, u, d, f, p, g, h, $, w = (e[0].descr ? e[0].descr : "") + "",
            _ = (e[0].status ? e[0].status : "") + "",
            j = (e[0].after ? e[0].after : "") + "";
        return {
            c() {
                n = v("div"), s = v("div"), r = v("p"), l = y(w), i = k(), c = v("div"), a = v("p"), u = y(_), f = k(), p = v("p"), g = y(" "), h = y(j), M(r, "class", o = "pr-4 truncate text-" + (e[0].descrColor ? e[0].descrColor : "gray") + "-500 font-bold"), M(s, "class", "w-2/3"), M(a, "class", d = "wgt-adt-stl truncate " + (e[1] ? "text-green-500" : "")), M(p, "class", $ = "wgt-adt-stl truncate " + (e[1] ? "text-green-500" : "")), M(c, "class", "flex justify-end w-1/3"), M(n, "class", "crd-itm-psn")
            },
            m(t, e) {
                b(t, n, e), m(n, s), m(s, r), m(r, l), m(n, i), m(n, c), m(c, a), m(a, u), m(c, f), m(c, p), m(p, g), m(p, h)
            },
            p(t, [e]) {
                1 & e && w !== (w = (t[0].descr ? t[0].descr : "") + "") && S(l, w), 1 & e && o !== (o = "pr-4 truncate text-" + (t[0].descrColor ? t[0].descrColor : "gray") + "-500 font-bold") && M(r, "class", o), 1 & e && _ !== (_ = (t[0].status ? t[0].status : "") + "") && S(u, _), 2 & e && d !== (d = "wgt-adt-stl truncate " + (t[1] ? "text-green-500" : "")) && M(a, "class", d), 1 & e && j !== (j = (t[0].after ? t[0].after : "") + "") && S(h, j), 2 & e && $ !== ($ = "wgt-adt-stl truncate " + (t[1] ? "text-green-500" : "")) && M(p, "class", $)
            },
            i: t,
            o: t,
            d(t) {
                t && x(n)
            }
        }
    }

    function Ae(t, e, n) {
        let s, {
                widget: r
            } = e,
            {
                value: l
            } = e,
            o = !1;

        function i() {
            n(1, o = !1)
        }
        return t.$$set = t => {
            "widget" in t && n(0, r = t.widget), "value" in t && n(2, l = t.value)
        }, t.$$.update = () => {
            1 & t.$$.dirty && (r.status, r.status && (r.status != s && (setTimeout(i, 300), n(1, o = !0)), s = r.status))
        }, [r, o, l]
    }
    class Ie extends dt {
        constructor(t) {
            super(), ut(this, t, Ae, He, l, {
                widget: 0,
                value: 2
            })
        }
    }

    function ze(t, e, n) {
        const s = t.slice();
        return s[15] = e[n], s[17] = n, s
    }

    function qe(t, e, n) {
        const s = t.slice();
        return s[18] = e[n], s[19] = e, s[20] = n, s
    }

    function Be(e) {
        let n, s;
        return n = new Ut({
            props: {
                title: "Загрузка..."
            }
        }), {
            c() {
                it(n.$$.fragment)
            },
            m(t, e) {
                ct(n, t, e), s = !0
            },
            p: t,
            i(t) {
                s || (st(n.$$.fragment, t), s = !0)
            },
            o(t) {
                rt(n.$$.fragment, t), s = !1
            },
            d(t) {
                at(n, t)
            }
        }
    }

    function Fe(t) {
        let e, n, s, r, l, o = t[4] && Re(),
            i = t[1],
            c = [];
        for (let e = 0; e < i.length; e += 1) c[e] = Qe(ze(t, i, e));
        const a = t => rt(c[t], 1, 1, (() => {
            c[t] = null
        }));
        return {
            c() {
                e = v("div"), n = v("div"), o && o.c(), s = k(), r = v("div");
                for (let t = 0; t < c.length; t += 1) c[t].c();
                M(n, "class", "grd-1col1 animate-pulse"), M(r, "class", "grd-3col1"), M(e, "class", "my-4")
            },
            m(t, i) {
                b(t, e, i), m(e, n), o && o.m(n, null), m(e, s), m(e, r);
                for (let t = 0; t < c.length; t += 1) c[t] && c[t].m(r, null);
                l = !0
            },
            p(t, e) {
                if (t[4] ? o ? 16 & e && st(o, 1) : (o = Re(), o.c(), st(o, 1), o.m(n, null)) : o && (et(), rt(o, 1, 1, (() => {
                        o = null
                    })), nt()), 11 & e) {
                    let n;
                    for (i = t[1], n = 0; n < i.length; n += 1) {
                        const s = ze(t, i, n);
                        c[n] ? (c[n].p(s, e), st(c[n], 1)) : (c[n] = Qe(s), c[n].c(), st(c[n], 1), c[n].m(r, null))
                    }
                    for (et(), n = i.length; n < c.length; n += 1) a(n);
                    nt()
                }
            },
            i(t) {
                if (!l) {
                    st(o);
                    for (let t = 0; t < i.length; t += 1) st(c[t]);
                    l = !0
                }
            },
            o(t) {
                rt(o), c = c.filter(Boolean);
                for (let t = 0; t < c.length; t += 1) rt(c[t]);
                l = !1
            },
            d(t) {
                t && x(e), o && o.d(), $(c, t)
            }
        }
    }

    function Re(t) {
        let e, n;
        return e = new Qt({
            props: {
                title: "Ваша панель управления пуста, вначале добавьте новые элементы в конфигураторе!"
            }
        }), {
            c() {
                it(e.$$.fragment)
            },
            m(t, s) {
                ct(e, t, s), n = !0
            },
            i(t) {
                n || (st(e.$$.fragment, t), n = !0)
            },
            o(t) {
                rt(e.$$.fragment, t), n = !1
            },
            d(t) {
                at(e, t)
            }
        }
    }

    function Ze(t) {
        let e, n, s, r, l, o, i = "input" === t[18].widget && Ue(t),
            c = "toggle" === t[18].widget && We(t),
            a = "anydata" === t[18].widget && Ye(t),
            u = "range" === t[18].widget && Ve(t),
            d = "chart" === t[18].widget && Xe(t);
        return {
            c() {
                i && i.c(), e = k(), c && c.c(), n = k(), a && a.c(), s = k(), u && u.c(), r = k(), d && d.c(), l = _()
            },
            m(t, f) {
                i && i.m(t, f), b(t, e, f), c && c.m(t, f), b(t, n, f), a && a.m(t, f), b(t, s, f), u && u.m(t, f), b(t, r, f), d && d.m(t, f), b(t, l, f), o = !0
            },
            p(t, o) {
                "input" === t[18].widget ? i ? (i.p(t, o), 1 & o && st(i, 1)) : (i = Ue(t), i.c(), st(i, 1), i.m(e.parentNode, e)) : i && (et(), rt(i, 1, 1, (() => {
                    i = null
                })), nt()), "toggle" === t[18].widget ? c ? (c.p(t, o), 1 & o && st(c, 1)) : (c = We(t), c.c(), st(c, 1), c.m(n.parentNode, n)) : c && (et(), rt(c, 1, 1, (() => {
                    c = null
                })), nt()), "anydata" === t[18].widget ? a ? (a.p(t, o), 1 & o && st(a, 1)) : (a = Ye(t), a.c(), st(a, 1), a.m(s.parentNode, s)) : a && (et(), rt(a, 1, 1, (() => {
                    a = null
                })), nt()), "range" === t[18].widget ? u ? (u.p(t, o), 1 & o && st(u, 1)) : (u = Ve(t), u.c(), st(u, 1), u.m(r.parentNode, r)) : u && (et(), rt(u, 1, 1, (() => {
                    u = null
                })), nt()), "chart" === t[18].widget ? d ? (d.p(t, o), 1 & o && st(d, 1)) : (d = Xe(t), d.c(), st(d, 1), d.m(l.parentNode, l)) : d && (et(), rt(d, 1, 1, (() => {
                    d = null
                })), nt())
            },
            i(t) {
                o || (st(i), st(c), st(a), st(u), st(d), o = !0)
            },
            o(t) {
                rt(i), rt(c), rt(a), rt(u), rt(d), o = !1
            },
            d(t) {
                i && i.d(t), t && x(e), c && c.d(t), t && x(n), a && a.d(t), t && x(s), u && u.d(t), t && x(r), d && d.d(t), t && x(l)
            }
        }
    }

    function Ue(t) {
        let e, n, s;

        function r(e) {
            t[6](e, t[18])
        }
        let l = {
            widget: t[18],
            wsPush: t[5]
        };
        return void 0 !== t[18].status && (l.value = t[18].status), e = new ae({
            props: l
        }), q.push((() => ot(e, "value", r))), {
            c() {
                it(e.$$.fragment)
            },
            m(t, n) {
                ct(e, t, n), s = !0
            },
            p(s, r) {
                t = s;
                const l = {};
                1 & r && (l.widget = t[18]), 8 & r && (l.wsPush = t[5]), !n && 1 & r && (n = !0, l.value = t[18].status, Y((() => n = !1))), e.$set(l)
            },
            i(t) {
                s || (st(e.$$.fragment, t), s = !0)
            },
            o(t) {
                rt(e.$$.fragment, t), s = !1
            },
            d(t) {
                at(e, t)
            }
        }
    }

    function We(t) {
        let e, n, s;

        function r(e) {
            t[8](e, t[18])
        }
        let l = {
            widget: t[18],
            wsPush: t[7]
        };
        return void 0 !== t[18].status && (l.value = t[18].status), e = new De({
            props: l
        }), q.push((() => ot(e, "value", r))), {
            c() {
                it(e.$$.fragment)
            },
            m(t, n) {
                ct(e, t, n), s = !0
            },
            p(s, r) {
                t = s;
                const l = {};
                1 & r && (l.widget = t[18]), 8 & r && (l.wsPush = t[7]), !n && 1 & r && (n = !0, l.value = t[18].status, Y((() => n = !1))), e.$set(l)
            },
            i(t) {
                s || (st(e.$$.fragment, t), s = !0)
            },
            o(t) {
                rt(e.$$.fragment, t), s = !1
            },
            d(t) {
                at(e, t)
            }
        }
    }

    function Ye(t) {
        let e, n, s;

        function r(e) {
            t[9](e, t[18])
        }
        let l = {
            widget: t[18]
        };
        return void 0 !== t[18].status && (l.value = t[18].status), e = new Ie({
            props: l
        }), q.push((() => ot(e, "value", r))), {
            c() {
                it(e.$$.fragment)
            },
            m(t, n) {
                ct(e, t, n), s = !0
            },
            p(s, r) {
                t = s;
                const l = {};
                1 & r && (l.widget = t[18]), !n && 1 & r && (n = !0, l.value = t[18].status, Y((() => n = !1))), e.$set(l)
            },
            i(t) {
                s || (st(e.$$.fragment, t), s = !0)
            },
            o(t) {
                rt(e.$$.fragment, t), s = !1
            },
            d(t) {
                at(e, t)
            }
        }
    }

    function Ve(t) {
        let e, n, s;

        function r(e) {
            t[11](e, t[18])
        }
        let l = {
            widget: t[18],
            wsPush: t[10]
        };
        return void 0 !== t[18].status && (l.value = t[18].status), e = new fe({
            props: l
        }), q.push((() => ot(e, "value", r))), {
            c() {
                it(e.$$.fragment)
            },
            m(t, n) {
                ct(e, t, n), s = !0
            },
            p(s, r) {
                t = s;
                const l = {};
                1 & r && (l.widget = t[18]), 8 & r && (l.wsPush = t[10]), !n && 1 & r && (n = !0, l.value = t[18].status, Y((() => n = !1))), e.$set(l)
            },
            i(t) {
                s || (st(e.$$.fragment, t), s = !0)
            },
            o(t) {
                rt(e.$$.fragment, t), s = !1
            },
            d(t) {
                at(e, t)
            }
        }
    }

    function Xe(t) {
        let e, n, s;

        function r(e) {
            t[12](e, t[18])
        }
        let l = {
            widget: t[18]
        };
        return void 0 !== t[18].status && (l.value = t[18].status), e = new Ee({
            props: l
        }), q.push((() => ot(e, "value", r))), {
            c() {
                it(e.$$.fragment)
            },
            m(t, n) {
                ct(e, t, n), s = !0
            },
            p(s, r) {
                t = s;
                const l = {};
                1 & r && (l.widget = t[18]), !n && 1 & r && (n = !0, l.value = t[18].status, Y((() => n = !1))), e.$set(l)
            },
            i(t) {
                s || (st(e.$$.fragment, t), s = !0)
            },
            o(t) {
                rt(e.$$.fragment, t), s = !1
            },
            d(t) {
                at(e, t)
            }
        }
    }

    function Ge(t) {
        let e, n, s = t[18].page === t[15].page && Ze(t);
        return {
            c() {
                s && s.c(), e = _()
            },
            m(t, r) {
                s && s.m(t, r), b(t, e, r), n = !0
            },
            p(t, n) {
                t[18].page === t[15].page ? s ? (s.p(t, n), 3 & n && st(s, 1)) : (s = Ze(t), s.c(), st(s, 1), s.m(e.parentNode, e)) : s && (et(), rt(s, 1, 1, (() => {
                    s = null
                })), nt())
            },
            i(t) {
                n || (st(s), n = !0)
            },
            o(t) {
                rt(s), n = !1
            },
            d(t) {
                s && s.d(t), t && x(e)
            }
        }
    }

    function Ke(t) {
        let e, n, s = t[0],
            r = [];
        for (let e = 0; e < s.length; e += 1) r[e] = Ge(qe(t, s, e));
        const l = t => rt(r[t], 1, 1, (() => {
            r[t] = null
        }));
        return {
            c() {
                for (let t = 0; t < r.length; t += 1) r[t].c();
                e = k()
            },
            m(t, s) {
                for (let e = 0; e < r.length; e += 1) r[e] && r[e].m(t, s);
                b(t, e, s), n = !0
            },
            p(t, n) {
                if (11 & n) {
                    let o;
                    for (s = t[0], o = 0; o < s.length; o += 1) {
                        const l = qe(t, s, o);
                        r[o] ? (r[o].p(l, n), st(r[o], 1)) : (r[o] = Ge(l), r[o].c(), st(r[o], 1), r[o].m(e.parentNode, e))
                    }
                    for (et(), o = s.length; o < r.length; o += 1) l(o);
                    nt()
                }
            },
            i(t) {
                if (!n) {
                    for (let t = 0; t < s.length; t += 1) st(r[t]);
                    n = !0
                }
            },
            o(t) {
                r = r.filter(Boolean);
                for (let t = 0; t < r.length; t += 1) rt(r[t]);
                n = !1
            },
            d(t) {
                $(r, t), t && x(e)
            }
        }
    }

    function Qe(t) {
        let e, n;
        return e = new Qt({
            props: {
                title: t[15].page,
                $$slots: {
                    default: [Ke]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), {
            c() {
                it(e.$$.fragment)
            },
            m(t, s) {
                ct(e, t, s), n = !0
            },
            p(t, n) {
                const s = {};
                2 & n && (s.title = t[15].page), 2097163 & n && (s.$$scope = {
                    dirty: n,
                    ctx: t
                }), e.$set(s)
            },
            i(t) {
                n || (st(e.$$.fragment, t), n = !0)
            },
            o(t) {
                rt(e.$$.fragment, t), n = !1
            },
            d(t) {
                at(e, t)
            }
        }
    }

    function tn(t) {
        let e, n, s, r;
        const l = [Fe, Be],
            o = [];

        function i(t, e) {
            return t[2] ? 0 : 1
        }
        return e = i(t), n = o[e] = l[e](t), {
            c() {
                n.c(), s = _()
            },
            m(t, n) {
                o[e].m(t, n), b(t, s, n), r = !0
            },
            p(t, [r]) {
                let c = e;
                e = i(t), e === c ? o[e].p(t, r) : (et(), rt(o[c], 1, 1, (() => {
                    o[c] = null
                })), nt(), n = o[e], n ? n.p(t, r) : (n = o[e] = l[e](t), n.c()), st(n, 1), n.m(s.parentNode, s))
            },
            i(t) {
                r || (st(n), r = !0)
            },
            o(t) {
                rt(n), r = !1
            },
            d(t) {
                o[e].d(t), t && x(s)
            }
        }
    }

    function en(t, e, n) {
        let {
            layoutJson: s
        } = e, r = !1, {
            pages: l
        } = e, {
            show: o
        } = e, {
            wsPush: i = ((t, e, n) => {})
        } = e;

        function c() {
            0 === s.length && n(4, r = !0)
        }
        return t.$$set = t => {
            "layoutJson" in t && n(0, s = t.layoutJson), "pages" in t && n(1, l = t.pages), "show" in t && n(2, o = t.show), "wsPush" in t && n(3, i = t.wsPush)
        }, t.$$.update = () => {
            1 & t.$$.dirty && (s.length, n(4, r = !1), setTimeout(c, 3e3))
        }, [s, l, o, i, r, (t, e, n) => i(t, e, n), function(e, r) {
            t.$$.not_equal(r.status, e) && (r.status = e, n(0, s))
        }, (t, e, n) => i(t, e, n), function(e, r) {
            t.$$.not_equal(r.status, e) && (r.status = e, n(0, s))
        }, function(e, r) {
            t.$$.not_equal(r.status, e) && (r.status = e, n(0, s))
        }, (t, e, n) => i(t, e, n), function(e, r) {
            t.$$.not_equal(r.status, e) && (r.status = e, n(0, s))
        }, function(e, r) {
            t.$$.not_equal(r.status, e) && (r.status = e, n(0, s))
        }]
    }
    class nn extends dt {
        constructor(t) {
            super(), ut(this, t, en, tn, l, {
                layoutJson: 0,
                pages: 1,
                show: 2,
                wsPush: 3
            })
        }
    }

    function sn(e) {
        let n, s, l, o, i, c, a;
        return {
            c() {
                n = w("svg"), s = w("path"), l = w("circle"), o = w("circle"), i = w("circle"), M(s, "stroke", "none"), M(s, "d", "M0 0h24v24H0z"), M(l, "cx", "5"), M(l, "cy", "12"), M(l, "r", "1"), M(o, "cx", "12"), M(o, "cy", "12"), M(o, "r", "1"), M(i, "cx", "19"), M(i, "cy", "12"), M(i, "r", "1"), M(n, "class", "h-6 w-6 text-green-400 cursor-pointer"), M(n, "width", "24"), M(n, "height", "24"), M(n, "viewBox", "0 -2 24 24"), M(n, "stroke-width", "2"), M(n, "stroke", "currentColor"), M(n, "fill", "none"), M(n, "stroke-linecap", "round"), M(n, "stroke-linejoin", "round")
            },
            m(t, u) {
                b(t, n, u), m(n, s), m(n, l), m(n, o), m(n, i), c || (a = j(n, "click", (function() {
                    r(e[0]()) && e[0]().apply(this, arguments)
                })), c = !0)
            },
            p(t, [n]) {
                e = t
            },
            i: t,
            o: t,
            d(t) {
                t && x(n), c = !1, a()
            }
        }
    }

    function rn(t, e, n) {
        let {
            click: s = (() => {})
        } = e;
        return t.$$set = t => {
            "click" in t && n(0, s = t.click)
        }, [s]
    }
    class ln extends dt {
        constructor(t) {
            super(), ut(this, t, rn, sn, l, {
                click: 0
            })
        }
    }

    function on(e) {
        let n, s, l, o, i;
        return {
            c() {
                n = w("svg"), s = w("line"), l = w("circle"), M(s, "x1", "12"), M(s, "y1", "18"), M(s, "x2", "12"), M(s, "y2", "8"), M(l, "cx", "12"), M(l, "cy", "4"), M(l, "r", "1"), M(n, "class", "h-6 w-6 text-blue-400 cursor-pointer"), M(n, "viewBox", "0 -2 24 24"), M(n, "fill", "none"), M(n, "stroke", "currentColor"), M(n, "stroke-width", "2"), M(n, "stroke-linecap", "round"), M(n, "stroke-linejoin", "round")
            },
            m(t, c) {
                b(t, n, c), m(n, s), m(n, l), o || (i = j(n, "click", (function() {
                    r(e[0]()) && e[0]().apply(this, arguments)
                })), o = !0)
            },
            p(t, [n]) {
                e = t
            },
            i: t,
            o: t,
            d(t) {
                t && x(n), o = !1, i()
            }
        }
    }

    function cn(t, e, n) {
        let {
            click: s = (() => {})
        } = e;
        return t.$$set = t => {
            "click" in t && n(0, s = t.click)
        }, [s]
    }
    class an extends dt {
        constructor(t) {
            super(), ut(this, t, cn, on, l, {
                click: 0
            })
            /*! js-cookie v3.0.5 | MIT */
        }
    }

    function un(t) {
        for (var e = 1; e < arguments.length; e++) {
            var n = arguments[e];
            for (var s in n) t[s] = n[s]
        }
        return t
    }
    var dn = function t(e, n) {
        function s(t, s, r) {
            if ("undefined" != typeof document) {
                "number" == typeof(r = un({}, n, r)).expires && (r.expires = new Date(Date.now() + 864e5 * r.expires)), r.expires && (r.expires = r.expires.toUTCString()), t = encodeURIComponent(t).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
                var l = "";
                for (var o in r) r[o] && (l += "; " + o, !0 !== r[o] && (l += "=" + r[o].split(";")[0]));
                return document.cookie = t + "=" + e.write(s, t) + l
            }
        }
        return Object.create({
            set: s,
            get: function(t) {
                if ("undefined" != typeof document && (!arguments.length || t)) {
                    for (var n = document.cookie ? document.cookie.split("; ") : [], s = {}, r = 0; r < n.length; r++) {
                        var l = n[r].split("="),
                            o = l.slice(1).join("=");
                        try {
                            var i = decodeURIComponent(l[0]);
                            if (s[i] = e.read(o, i), t === i) break
                        } catch (t) {}
                    }
                    return t ? s[t] : s
                }
            },
            remove: (t, e) => {
                s(t, "", un({}, e, {
                    expires: -1
                }))
            },
            withAttributes: function(e) {
                return t(this.converter, un({}, this.attributes, e))
            },
            withConverter: function(e) {
                return t(un({}, this.converter, e), this.attributes)
            }
        }, {
            attributes: {
                value: Object.freeze(n)
            },
            converter: {
                value: Object.freeze(e)
            }
        })
    }({
        read: t => ('"' === t[0] && (t = t.slice(1, -1)), t.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)),
        write: t => encodeURIComponent(t).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent)
    }, {
        path: "/"
    });

    function fn(t, e, n) {
        const s = t.slice();
        return s[53] = e[n], s
    }

    function pn(t, e, n) {
        const s = t.slice();
        return s[64] = e[n][0], s[65] = e[n][1], s
    }

    function gn(t, e, n) {
        const s = t.slice();
        return s[68] = e[n], s[69] = e, s[70] = n, s
    }

    function hn(t, e, n) {
        const s = t.slice();
        return s[71] = e[n], s[72] = e, s[73] = n, s
    }

    function mn(t, e, n) {
        const s = t.slice();
        return s[64] = e[n][0], s[74] = e[n][1], s[75] = e, s[76] = n, s
    }

    function bn(t, e, n) {
        const s = t.slice();
        return s[77] = e[n], s
    }

    function xn(t, e, n) {
        const s = t.slice();
        return s[80] = e[n], s[70] = n, s
    }

    function $n(t, e, n) {
        const s = t.slice();
        return s[82] = e[n], s
    }

    function vn(e) {
        let n, s;
        return n = new Ut({
            props: {
                title: "Загрузка..."
            }
        }), {
            c() {
                it(n.$$.fragment)
            },
            m(t, e) {
                ct(n, t, e), s = !0
            },
            p: t,
            i(t) {
                s || (st(n.$$.fragment, t), s = !0)
            },
            o(t) {
                rt(n.$$.fragment, t), s = !1
            },
            d(t) {
                at(n, t)
            }
        }
    }

    function wn(t) {
        let e, n, s, r, l, o, i, c, a, u, d;
        s = new Qt({
            props: {
                title: "Конфигуратор",
                $$slots: {
                    default: [Hn]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), l = new Qt({
            props: {
                title: "Сценарии",
                $$slots: {
                    default: [An]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), c = new Qt({
            props: {
                $$slots: {
                    default: [zn]
                },
                $$scope: {
                    ctx: t
                }
            }
        });
        let f = t[14] && qn(t);
        return {
            c() {
                e = v("div"), n = v("div"), it(s.$$.fragment), r = k(), it(l.$$.fragment), o = k(), i = v("div"), it(c.$$.fragment), a = k(), f && f.c(), u = _(), M(n, "class", "grd-2col1"), M(e, "class", "my-4"), M(i, "class", "grd-1col1")
            },
            m(t, p) {
                b(t, e, p), m(e, n), ct(s, n, null), m(n, r), ct(l, n, null), b(t, o, p), b(t, i, p), ct(c, i, null), b(t, a, p), f && f.m(t, p), b(t, u, p), d = !0
            },
            p(t, e) {
                const n = {};
                7438 & e[0] | 8388608 & e[2] && (n.$$scope = {
                    dirty: e,
                    ctx: t
                }), s.$set(n);
                const r = {};
                8193 & e[0] | 8388608 & e[2] && (r.$$scope = {
                    dirty: e,
                    ctx: t
                }), l.$set(r);
                const o = {};
                720 & e[0] | 8388608 & e[2] && (o.$$scope = {
                    dirty: e,
                    ctx: t
                }), c.$set(o), t[14] ? f ? f.p(t, e) : (f = qn(t), f.c(), f.m(u.parentNode, u)) : f && (f.d(1), f = null)
            },
            i(t) {
                d || (st(s.$$.fragment, t), st(l.$$.fragment, t), st(c.$$.fragment, t), d = !0)
            },
            o(t) {
                rt(s.$$.fragment, t), rt(l.$$.fragment, t), rt(c.$$.fragment, t), d = !1
            },
            d(t) {
                t && x(e), at(s), at(l), t && x(o), t && x(i), at(c), t && x(a), f && f.d(t), t && x(u)
            }
        }
    }

    function yn(t) {
        let e, n;
        return {
            c() {
                e = v("optgroup"), M(e, "label", n = t[82].header)
            },
            m(t, n) {
                b(t, e, n)
            },
            p(t, s) {
                8 & s[0] && n !== (n = t[82].header) && M(e, "label", n)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function kn(t) {
        let e, n, s, r, l = t[82].name + "";
        return {
            c() {
                e = v("option"), n = y(l), s = k(), e.__value = r = t[82].num, e.value = e.__value
            },
            m(t, r) {
                b(t, e, r), m(e, n), m(e, s)
            },
            p(t, s) {
                8 & s[0] && l !== (l = t[82].name + "") && S(n, l), 8 & s[0] && r !== (r = t[82].num) && (e.__value = r, e.value = e.__value)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function _n(t) {
        let e, n, s = t[82].header && yn(t),
            r = !t[82].header && kn(t);
        return {
            c() {
                s && s.c(), e = _(), r && r.c(), n = _()
            },
            m(t, l) {
                s && s.m(t, l), b(t, e, l), r && r.m(t, l), b(t, n, l)
            },
            p(t, l) {
                t[82].header ? s ? s.p(t, l) : (s = yn(t), s.c(), s.m(e.parentNode, e)) : s && (s.d(1), s = null), t[82].header ? r && (r.d(1), r = null) : r ? r.p(t, l) : (r = kn(t), r.c(), r.m(n.parentNode, n))
            },
            d(t) {
                s && s.d(t), t && x(e), r && r.d(t), t && x(n)
            }
        }
    }

    function jn(t) {
        let e, n = t[12],
            s = [];
        for (let e = 0; e < n.length; e += 1) s[e] = Cn(xn(t, n, e));
        return {
            c() {
                for (let t = 0; t < s.length; t += 1) s[t].c();
                e = _()
            },
            m(t, n) {
                for (let e = 0; e < s.length; e += 1) s[e] && s[e].m(t, n);
                b(t, e, n)
            },
            p(t, r) {
                if (4096 & r[0]) {
                    let l;
                    for (n = t[12], l = 0; l < n.length; l += 1) {
                        const o = xn(t, n, l);
                        s[l] ? s[l].p(o, r) : (s[l] = Cn(o), s[l].c(), s[l].m(e.parentNode, e))
                    }
                    for (; l < s.length; l += 1) s[l].d(1);
                    s.length = n.length
                }
            },
            d(t) {
                $(s, t), t && x(e)
            }
        }
    }

    function Cn(t) {
        let e, n, s, r = t[80].topic.ru + "";
        return {
            c() {
                e = v("option"), n = y(r), s = k(), e.__value = t[70], e.value = e.__value
            },
            m(t, r) {
                b(t, e, r), m(e, n), m(e, s)
            },
            p(t, e) {
                4096 & e[0] && r !== (r = t[80].topic.ru + "") && S(n, r)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function Mn(t) {
        let e, n, s, r, l = t[77].label + "";
        return {
            c() {
                e = v("option"), n = y(l), s = k(), e.__value = r = t[77].name, e.value = e.__value
            },
            m(t, r) {
                b(t, e, r), m(e, n), m(e, s)
            },
            p(t, s) {
                4 & s[0] && l !== (l = t[77].label + "") && S(n, l), 4 & s[0] && r !== (r = t[77].name) && (e.__value = r, e.value = e.__value)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function Ln(t) {
        let e, n, s, r, l, o, i, c, a, u, d, f = Object.entries(t[68]),
            p = [];
        for (let e = 0; e < f.length; e += 1) p[e] = En(mn(t, f, e));

        function g() {
            return t[41](t[68])
        }
        let h = t[68].customModifiers?.length && Nn(t);
        return {
            c() {
                for (let t = 0; t < p.length; t += 1) p[t].c();
                e = k(), n = v("tr"), s = v("td"), s.textContent = "Свой модификатор", r = k(), l = v("td"), o = v("button"), o.textContent = "+", i = k(), h && h.c(), c = _(), M(s, "colspan", "4"), M(s, "class", "text-right"), M(o, "class", "h-3 sm:h-6 md:h-6 lg:h-6 xl:h-6 2xl:h-6 w-6 bg-blue-100 inline-flex items-center border border-gray-300 hover:bg-blue-200"), M(l, "class", "tbl-bdy-lg"), M(n, "class", "txt-sz txt-pad")
            },
            m(t, f) {
                for (let e = 0; e < p.length; e += 1) p[e] && p[e].m(t, f);
                b(t, e, f), b(t, n, f), m(n, s), m(n, r), m(n, l), m(l, o), b(t, i, f), h && h.m(t, f), b(t, c, f), a = !0, u || (d = j(o, "click", g), u = !0)
            },
            p(n, s) {
                if (t = n, 258 & s[0]) {
                    let n;
                    for (f = Object.entries(t[68]), n = 0; n < f.length; n += 1) {
                        const r = mn(t, f, n);
                        p[n] ? p[n].p(r, s) : (p[n] = En(r), p[n].c(), p[n].m(e.parentNode, e))
                    }
                    for (; n < p.length; n += 1) p[n].d(1);
                    p.length = f.length
                }
                t[68].customModifiers?.length ? h ? (h.p(t, s), 2 & s[0] && st(h, 1)) : (h = Nn(t), h.c(), st(h, 1), h.m(c.parentNode, c)) : h && (et(), rt(h, 1, 1, (() => {
                    h = null
                })), nt())
            },
            i(t) {
                a || (st(h), a = !0)
            },
            o(t) {
                rt(h), a = !1
            },
            d(t) {
                $(p, t), t && x(e), t && x(n), t && x(i), h && h.d(t), t && x(c), u = !1, d()
            }
        }
    }

    function Sn(t) {
        let e, n, s, r, l, o, i, c, a;

        function u(t, e) {
            return 2 & e[0] && (c = null), null == c && (c = !!t[64].startsWith("btn")), c ? Tn : Jn
        }
        let d = u(t, [-1, -1, -1]),
            f = d(t);
        return {
            c() {
                e = v("tr"), n = v("td"), s = k(), r = v("td"), l = k(), o = v("td"), i = k(), f.c(), a = k(), M(e, "class", "txt-sz txt-pad")
            },
            m(t, c) {
                b(t, e, c), m(e, n), m(e, s), m(e, r), m(e, l), m(e, o), m(e, i), f.m(e, null), m(e, a)
            },
            p(t, n) {
                d === (d = u(t, n)) && f ? f.p(t, n) : (f.d(1), f = d(t), f && (f.c(), f.m(e, a)))
            },
            d(t) {
                t && x(e), f.d()
            }
        }
    }

    function Jn(t) {
        let e, n, s, r, l, o, i, c, a = t[64] + "";

        function u() {
            t[40].call(o, t[64], t[69], t[70])
        }
        return {
            c() {
                e = v("td"), n = v("p"), s = y(a), r = k(), l = v("td"), o = v("input"), M(n, "class", "txt-ita"), M(e, "class", "tbl-bdy-sm text-right"), M(o, "class", "ipt-sm w-full text-sm"), M(o, "type", "text"), M(l, "class", "tbl-bdy-sm text-center")
            },
            m(a, d) {
                b(a, e, d), m(e, n), m(n, s), b(a, r, d), b(a, l, d), m(l, o), J(o, t[68][t[64]]), i || (c = j(o, "input", u), i = !0)
            },
            p(e, n) {
                t = e, 2 & n[0] && a !== (a = t[64] + "") && S(s, a), 6 & n[0] && o.value !== t[68][t[64]] && J(o, t[68][t[64]])
            },
            d(t) {
                t && x(e), t && x(r), t && x(l), i = !1, c()
            }
        }
    }

    function Tn(t) {
        let e, n, s, r, l, o, i, c = t[64].substring(4) + "";

        function a() {
            return t[38](t[68], t[64])
        }
        let u = "nil" != t[68][t[64]] && On(t);
        return {
            c() {
                e = v("td"), n = v("button"), s = y(c), r = k(), u && u.c(), l = _(), M(n, "class", "h-3 sm:h-6 md:h-6 lg:h-6 xl:h-6 2xl:h-6 w-auto bg-blue-100 inline-flex items-center border border-gray-300 hover:bg-blue-200"), M(e, "class", "tbl-bdy-sm text-right")
            },
            m(t, c) {
                b(t, e, c), m(e, n), m(n, s), b(t, r, c), u && u.m(t, c), b(t, l, c), o || (i = j(n, "click", a), o = !0)
            },
            p(e, n) {
                t = e, 2 & n[0] && c !== (c = t[64].substring(4) + "") && S(s, c), "nil" != t[68][t[64]] ? u ? u.p(t, n) : (u = On(t), u.c(), u.m(l.parentNode, l)) : u && (u.d(1), u = null)
            },
            d(t) {
                t && x(e), t && x(r), u && u.d(t), t && x(l), o = !1, i()
            }
        }
    }

    function On(t) {
        let e, n, s, r;

        function l() {
            t[39].call(n, t[64], t[69], t[70])
        }
        return {
            c() {
                e = v("td"), n = v("input"), M(n, "class", "ipt-sm w-full text-sm"), M(n, "type", "text"), M(e, "class", "tbl-bdy-sm text-center")
            },
            m(o, i) {
                b(o, e, i), m(e, n), J(n, t[68][t[64]]), s || (r = j(n, "input", l), s = !0)
            },
            p(e, s) {
                t = e, 6 & s[0] && n.value !== t[68][t[64]] && J(n, t[68][t[64]])
            },
            d(t) {
                t && x(e), s = !1, r()
            }
        }
    }

    function En(t) {
        let e, n = "type" != t[64] && "subtype" != t[64] && "id" != t[64] && "widget" != t[64] && "page" != t[64] && "descr" != t[64] && "show" != t[64] && "customModifiers" != t[64] && Sn(t);
        return {
            c() {
                n && n.c(), e = _()
            },
            m(t, s) {
                n && n.m(t, s), b(t, e, s)
            },
            p(t, s) {
                "type" != t[64] && "subtype" != t[64] && "id" != t[64] && "widget" != t[64] && "page" != t[64] && "descr" != t[64] && "show" != t[64] && "customModifiers" != t[64] ? n ? n.p(t, s) : (n = Sn(t), n.c(), n.m(e.parentNode, e)) : n && (n.d(1), n = null)
            },
            d(t) {
                n && n.d(t), t && x(e)
            }
        }
    }

    function Nn(t) {
        let e, n, r = [],
            l = new Map,
            o = t[68].customModifiers;
        const i = t => t[71].id;
        for (let e = 0; e < o.length; e += 1) {
            let n = hn(t, o, e),
                s = i(n);
            l.set(s, r[e] = Pn(s, n))
        }
        return {
            c() {
                for (let t = 0; t < r.length; t += 1) r[t].c();
                e = _()
            },
            m(t, s) {
                for (let e = 0; e < r.length; e += 1) r[e] && r[e].m(t, s);
                b(t, e, s), n = !0
            },
            p(t, n) {
                100663298 & n[0] && (o = t[68].customModifiers, et(), r = function(t, e, n, r, l, o, i, c, a, u, d, f) {
                    let p = t.length,
                        g = o.length,
                        h = p;
                    const m = {};
                    for (; h--;) m[t[h].key] = h;
                    const b = [],
                        x = new Map,
                        $ = new Map,
                        v = [];
                    for (h = g; h--;) {
                        const t = f(l, o, h),
                            s = n(t);
                        let r = i.get(s);
                        r ? v.push((() => r.p(t, e))) : (r = u(s, t), r.c()), x.set(s, b[h] = r), s in m && $.set(s, Math.abs(h - m[s]))
                    }
                    const w = new Set,
                        y = new Set;

                    function k(t) {
                        st(t, 1), t.m(c, d), i.set(t.key, t), d = t.first, g--
                    }
                    for (; p && g;) {
                        const e = b[g - 1],
                            n = t[p - 1],
                            s = e.key,
                            r = n.key;
                        e === n ? (d = e.first, p--, g--) : x.has(r) ? !i.has(s) || w.has(s) ? k(e) : y.has(r) ? p-- : $.get(s) > $.get(r) ? (y.add(s), k(e)) : (w.add(r), p--) : (a(n, i), p--)
                    }
                    for (; p--;) {
                        const e = t[p];
                        x.has(e.key) || a(e, i)
                    }
                    for (; g;) k(b[g - 1]);
                    return s(v), b
                }(r, n, i, 0, t, o, l, e.parentNode, lt, Pn, e, hn), nt())
            },
            i(t) {
                if (!n) {
                    for (let t = 0; t < o.length; t += 1) st(r[t]);
                    n = !0
                }
            },
            o(t) {
                for (let t = 0; t < r.length; t += 1) rt(r[t]);
                n = !1
            },
            d(t) {
                for (let e = 0; e < r.length; e += 1) r[e].d(t);
                t && x(e)
            }
        }
    }

    function Pn(t, e) {
        let n, r, l, o, i, c, a, u, d, f, p, g, h, $, w, y, _, C, L, S, T;

        function O() {
            e[42].call(a, e[72], e[73])
        }

        function E() {
            e[43].call(g, e[72], e[73])
        }

        function N() {
            return e[44](e[68], e[73])
        }

        function P() {
            return e[45](e[68], e[73])
        }
        return _ = new qt({
            props: {
                click: P,
                class: "cursor-pointer"
            }
        }), {
            key: t,
            first: null,
            c() {
                n = v("tr"), r = v("td"), l = k(), o = v("td"), o.innerHTML = '<p class="txt-ita">Название</p>', i = k(), c = v("td"), a = v("input"), u = k(), d = v("td"), d.innerHTML = '<p class="txt-ita">Значение</p>', f = k(), p = v("td"), g = v("input"), h = k(), $ = v("td"), w = v("button"), w.textContent = "✓", y = k(), it(_.$$.fragment), C = k(), M(o, "class", "tbl-bdy-sm text-right"), M(a, "class", "ipt-sm w-full text-sm"), M(a, "type", "text"), M(a, "placeholder", "Имя модификатора"), M(c, "class", "tbl-bdy-sm"), M(d, "class", "tbl-bdy-sm text-right"), M(g, "class", "ipt-sm w-full text-sm"), M(g, "type", "text"), M(g, "placeholder", "Значение"), M(p, "class", "tbl-bdy-sm"), M(w, "class", "bg-green-100 hover:bg-green-200 border border-gray-300 p-1 mr-1"), M($, "class", "tbl-bdy-lg"), M(n, "class", "txt-sz txt-pad"), this.first = n
            },
            m(t, s) {
                b(t, n, s), m(n, r), m(n, l), m(n, o), m(n, i), m(n, c), m(c, a), J(a, e[71].name), m(n, u), m(n, d), m(n, f), m(n, p), m(p, g), J(g, e[71].value), m(n, h), m(n, $), m($, w), m($, y), ct(_, $, null), m(n, C), L = !0, S || (T = [j(a, "input", O), j(g, "input", E), j(w, "click", N)], S = !0)
            },
            p(t, n) {
                e = t, 6 & n[0] && a.value !== e[71].name && J(a, e[71].name), 6 & n[0] && g.value !== e[71].value && J(g, e[71].value);
                const s = {};
                2 & n[0] && (s.click = P), _.$set(s)
            },
            i(t) {
                L || (st(_.$$.fragment, t), L = !0)
            },
            o(t) {
                rt(_.$$.fragment, t), L = !1
            },
            d(t) {
                t && x(n), at(_), S = !1, s(T)
            }
        }
    }

    function Dn(t) {
        let e, n, r, l, o, i, c, a, u, d, f, p, g, h, w, C, L, T, E, N, P, D, H, A, I, z, q, B, F, R = t[68].subtype + "";

        function Z() {
            t[32].call(i, t[69], t[70])
        }
        let U = t[2],
            Y = [];
        for (let e = 0; e < U.length; e += 1) Y[e] = Mn(bn(t, U, e));

        function V() {
            t[33].call(u, t[69], t[70])
        }

        function X() {
            t[34].call(p, t[69], t[70])
        }

        function G() {
            t[35].call(w, t[69], t[70])
        }

        function K() {
            return t[53](t[68], t[69], t[70])
        }

        function Q() {
            return t[37](t[68])
        }
        T = new ln({
            props: {
                click: K
            }
        }), P = new qt({
            props: {
                click: function() {
                    return t[36](t[70])
                }
            }
        }), A = new an({
            props: {
                click: Q
            }
        });
        let tt = t[68].show && Ln(t);
        return {
            c() {
                e = v("tr"), n = v("td"), r = y(R), l = k(), o = v("td"), i = v("input"), c = k(), a = v("td"), u = v("select");
                for (let t = 0; t < Y.length; t += 1) Y[t].c();
                d = k(), f = v("td"), p = v("input"), g = k(), h = v("td"), w = v("input"), C = k(), L = v("td"), it(T.$$.fragment), E = k(), N = v("td"), it(P.$$.fragment), D = k(), H = v("td"), it(A.$$.fragment), I = k(), tt && tt.c(), z = _(), M(n, "class", "tbl-bdy-lg"), M(i, "class", "ipt-lg w-full"), M(i, "type", "text"), M(o, "class", "tbl-bdy-lg"), M(u, "class", "ipt-lg w-full"), void 0 === t[68].widget && W(V), M(a, "class", "tbl-bdy-lg"), M(p, "class", "ipt-lg w-full"), M(p, "type", "text"), M(f, "class", "tbl-bdy-lg"), M(w, "class", "ipt-lg w-full"), M(w, "type", "text"), M(h, "class", "tbl-bdy-lg"), M(L, "class", "tbl-bdy-lg"), M(N, "class", "tbl-bdy-lg"), M(H, "class", "tbl-bdy-lg"), M(e, "class", "txt-sz txt-pad align-middle")
            },
            m(s, x) {
                b(s, e, x), m(e, n), m(n, r), m(e, l), m(e, o), m(o, i), J(i, t[68].id), m(e, c), m(e, a), m(a, u);
                for (let t = 0; t < Y.length; t += 1) Y[t] && Y[t].m(u, null);
                O(u, t[68].widget, !0), m(e, d), m(e, f), m(f, p), J(p, t[68].page), m(e, g), m(e, h), m(h, w), J(w, t[68].descr), m(e, C), m(e, L), ct(T, L, null), m(e, E), m(e, N), ct(P, N, null), m(e, D), m(e, H), ct(A, H, null), b(s, I, x), tt && tt.m(s, x), b(s, z, x), q = !0, B || (F = [j(i, "input", Z), j(u, "change", V), j(p, "input", X), j(w, "input", G)], B = !0)
            },
            p(e, n) {
                if (t = e, (!q || 2 & n[0]) && R !== (R = t[68].subtype + "") && S(r, R), 6 & n[0] && i.value !== t[68].id && J(i, t[68].id), 4 & n[0]) {
                    let e;
                    for (U = t[2], e = 0; e < U.length; e += 1) {
                        const s = bn(t, U, e);
                        Y[e] ? Y[e].p(s, n) : (Y[e] = Mn(s), Y[e].c(), Y[e].m(u, null))
                    }
                    for (; e < Y.length; e += 1) Y[e].d(1);
                    Y.length = U.length
                }
                6 & n[0] && O(u, t[68].widget), 6 & n[0] && p.value !== t[68].page && J(p, t[68].page), 6 & n[0] && w.value !== t[68].descr && J(w, t[68].descr);
                const s = {};
                2 & n[0] && (s.click = K), T.$set(s);
                const l = {};
                2 & n[0] && (l.click = Q), A.$set(l), t[68].show ? tt ? (tt.p(t, n), 2 & n[0] && st(tt, 1)) : (tt = Ln(t), tt.c(), st(tt, 1), tt.m(z.parentNode, z)) : tt && (et(), rt(tt, 1, 1, (() => {
                    tt = null
                })), nt())
            },
            i(t) {
                q || (st(T.$$.fragment, t), st(P.$$.fragment, t), st(A.$$.fragment, t), st(tt), q = !0)
            },
            o(t) {
                rt(T.$$.fragment, t), rt(P.$$.fragment, t), rt(A.$$.fragment, t), rt(tt), q = !1
            },
            d(t) {
                t && x(e), $(Y, t), at(T), at(P), at(A), t && x(I), tt && tt.d(t), t && x(z), B = !1, s(F)
            }
        }
    }

    function Hn(t) {
        let e, n, r, l, o, i, c, a, u, d, f, p, g = t[3],
            h = [];
        for (let e = 0; e < g.length; e += 1) h[e] = _n($n(t, g, e));
        let w = t[12] && jn(t),
            y = t[1],
            _ = [];
        for (let e = 0; e < y.length; e += 1) _[e] = Dn(gn(t, y, e));
        const C = t => rt(_[t], 1, 1, (() => {
            _[t] = null
        }));
        return {
            c() {
                e = v("div"), n = v("select");
                for (let t = 0; t < h.length; t += 1) h[t].c();
                r = k(), l = v("select"), w && w.c(), o = k(), i = v("table"), c = v("thead"), c.innerHTML = '<tr class="txt-sz txt-pad"><th class="tbl-hd">Тип</th> \n              <th class="tbl-hd">Id</th> \n              <th class="tbl-hd">Виджет</th> \n              <th class="tbl-hd">Вкладка</th> \n              <th class="tbl-hd">Название</th> \n              <th class="tbl-hd w-7"></th> \n              <th class="tbl-hd w-7"></th> \n              <th class="tbl-hd w-7"></th></tr>', a = k(), u = v("tbody");
                for (let t = 0; t < _.length; t += 1) _[t].c();
                M(n, "class", "slct-lg"), void 0 === t[10] && W((() => t[28].call(n))), M(l, "class", "slct-lg"), void 0 === t[11] && W((() => t[30].call(l))), M(e, "class", "grd-2col2"), M(c, "class", "bg-gray-100"), M(u, "class", "bg-white"), M(i, "class", "tbl")
            },
            m(s, g) {
                b(s, e, g), m(e, n);
                for (let t = 0; t < h.length; t += 1) h[t] && h[t].m(n, null);
                O(n, t[10], !0), m(e, r), m(e, l), w && w.m(l, null), O(l, t[11], !0), b(s, o, g), b(s, i, g), m(i, c), m(i, a), m(i, u);
                for (let t = 0; t < _.length; t += 1) _[t] && _[t].m(u, null);
                d = !0, f || (p = [j(n, "change", t[28]), j(n, "change", t[29]), j(l, "change", t[30]), j(l, "change", t[31])], f = !0)
            },
            p(t, e) {
                if (8 & e[0]) {
                    let s;
                    for (g = t[3], s = 0; s < g.length; s += 1) {
                        const r = $n(t, g, s);
                        h[s] ? h[s].p(r, e) : (h[s] = _n(r), h[s].c(), h[s].m(n, null))
                    }
                    for (; s < h.length; s += 1) h[s].d(1);
                    h.length = g.length
                }
                if (1032 & e[0] && O(n, t[10]), t[12] ? w ? w.p(t, e) : (w = jn(t), w.c(), w.m(l, null)) : w && (w.d(1), w = null), 2048 & e[0] && O(l, t[11]), 121766150 & e[0]) {
                    let n;
                    for (y = t[1], n = 0; n < y.length; n += 1) {
                        const s = gn(t, y, n);
                        _[n] ? (_[n].p(s, e), st(_[n], 1)) : (_[n] = Dn(s), _[n].c(), st(_[n], 1), _[n].m(u, null))
                    }
                    for (et(), n = y.length; n < _.length; n += 1) C(n);
                    nt()
                }
            },
            i(t) {
                if (!d) {
                    for (let t = 0; t < y.length; t += 1) st(_[t]);
                    d = !0
                }
            },
            o(t) {
                _ = _.filter(Boolean);
                for (let t = 0; t < _.length; t += 1) rt(_[t]);
                d = !1
            },
            d(t) {
                t && x(e), $(h, t), w && w.d(), t && x(o), t && x(i), $(_, t), f = !1, s(p)
            }
        }
    }

    function An(t) {
        let e, n, s;
        return {
            c() {
                e = v("textarea"), M(e, "rows", t[13]), M(e, "class", "px-2 bg-gray-50 border-2 border-gray-200 rounded text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 w-full")
            },
            m(r, l) {
                b(r, e, l), J(e, t[0]), n || (s = j(e, "input", t[46]), n = !0)
            },
            p(t, n) {
                8192 & n[0] && M(e, "rows", t[13]), 1 & n[0] && J(e, t[0])
            },
            d(t) {
                t && x(e), n = !1, s()
            }
        }
    }

    function In(e) {
        let n, s, r;
        return {
            c() {
                n = v("button"), n.textContent = "Опубликовать конфигурацию на портале", M(n, "class", "btn-lg mt-4")
            },
            m(t, l) {
                b(t, n, l), s || (r = j(n, "click", e[52]), s = !0)
            },
            p: t,
            d(t) {
                t && x(n), s = !1, r()
            }
        }
    }

    function zn(t) {
        let e, n, r, l, o, i, c, a, u, d, f, p, g, h, $, w = t[4] && In(t);
        return {
            c() {
                e = v("div"), n = v("button"), n.textContent = "Сохранить на устройстве", r = k(), l = v("button"), l.textContent = "Перезагрузить устройство", o = k(), i = v("button"), i.textContent = "Экспорт конфигурации", c = k(), a = v("label"), u = v("input"), d = k(), f = y("Импорт конфигурации"), p = k(), w && w.c(), g = _(), M(n, "class", "btn-lg"), M(l, "class", "btn-lg"), M(i, "class", "btn-lg"), M(u, "accept", "application/JSON"), M(u, "type", "file"), M(u, "id", "formFile"), M(a, "class", "btn-lg cursor-pointer select-none"), M(e, "class", "grd-2col1")
            },
            m(s, x) {
                b(s, e, x), m(e, n), m(e, r), m(e, l), m(e, o), m(e, i), m(e, c), m(e, a), m(a, u), m(a, d), m(a, f), b(s, p, x), w && w.m(s, x), b(s, g, x), h || ($ = [j(n, "click", t[47]), j(l, "click", t[48]), j(i, "click", t[49]), j(u, "change", t[50]), j(a, "click", t[51])], h = !0)
            },
            p(t, e) {
                t[4] ? w ? w.p(t, e) : (w = In(t), w.c(), w.m(g.parentNode, g)) : w && (w.d(1), w = null)
            },
            d(t) {
                t && x(e), t && x(p), w && w.d(t), t && x(g), h = !1, s($)
            }
        }
    }

    function qn(t) {
        let e, n, s, r, l, o, i;

        function c(t, e) {
            return t[15] ? Fn : Bn
        }
        let a = c(t),
            u = a(t);
        return {
            c() {
                e = v("div"), n = v("div"), s = v("div"), u.c(), r = k(), l = v("button"), l.textContent = "Закрыть", M(s, "class", "modal-body p-6 overflow-y-auto"), T(s, "max-height", "80vh"), M(l, "class", "btn-lg"), M(n, "class", "modal bg-white rounded-lg overflow-hidden"), M(e, "class", "modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center")
            },
            m(c, a) {
                b(c, e, a), m(e, n), m(n, s), u.m(s, null), m(n, r), m(n, l), o || (i = j(l, "click", t[23]), o = !0)
            },
            p(t, e) {
                a === (a = c(t)) && u ? u.p(t, e) : (u.d(1), u = a(t), u && (u.c(), u.m(s, null)))
            },
            d(t) {
                t && x(e), u.d(), o = !1, i()
            }
        }
    }

    function Bn(e) {
        let n;
        return {
            c() {
                n = v("p"), n.textContent = "Данные modinfo.json недоступны", M(n, "class", "text-red-500 mt-2")
            },
            m(t, e) {
                b(t, n, e)
            },
            p: t,
            d(t) {
                t && x(n)
            }
        }
    }

    function Fn(t) {
        let e, n, s, r, l, o, i, c, a, u, d, f, p, g, h, w, _, j, C, L, J, T, O, E, N, P, D, H, A, I, z, q, B, F = t[15].about.moduleName + "",
            R = t[15].about.authorName + "",
            Z = t[15].about.moduleDesc + "",
            U = Object.entries(t[15].about.propInfo),
            W = [];
        for (let e = 0; e < U.length; e += 1) W[e] = Rn(pn(t, U, e));

        function Y(t, e) {
            return 32768 & e[0] && (B = null), null == B && (B = !(!t[15]?.about?.funcInfo || !Array.isArray(t[15].about.funcInfo))), B ? Un : Zn
        }
        let V = Y(t, [-1, -1, -1]),
            X = V(t);
        return {
            c() {
                e = v("div"), n = v("div"), s = v("h4"), s.textContent = "Информация:", r = k(), l = v("p"), o = v("strong"), o.textContent = "Название модуля:", i = k(), c = y(F), a = k(), u = v("p"), d = v("strong"), d.textContent = "Автор:", f = k(), p = y(R), g = k(), h = v("p"), w = v("strong"), w.textContent = "Описание:", _ = k(), j = y(Z), C = k(), L = v("hr"), J = k(), T = v("div"), O = v("h5"), O.textContent = "Параметры конфигурации:", E = k(), N = v("ul");
                for (let t = 0; t < W.length; t += 1) W[t].c();
                P = k(), D = v("hr"), H = k(), A = v("div"), I = v("h5"), I.textContent = "Функции сценария:", z = k(), q = v("ul"), X.c(), M(s, "class", "font-bold mb-2"), M(l, "class", "mb-2"), M(u, "class", "mb-2"), M(h, "class", "mb-2"), M(L, "class", "divider my-4"), M(n, "class", "section mb-6"), M(O, "class", "font-bold mb-2"), M(N, "class", "spec-list"), M(D, "class", "divider my-4"), M(T, "class", "section mb-6"), M(I, "class", "font-bold mb-2"), M(q, "class", "spec-list"), M(A, "class", "section mb-6"), M(e, "class", "content")
            },
            m(t, x) {
                b(t, e, x), m(e, n), m(n, s), m(n, r), m(n, l), m(l, o), m(l, i), m(l, c), m(n, a), m(n, u), m(u, d), m(u, f), m(u, p), m(n, g), m(n, h), m(h, w), m(h, _), m(h, j), m(n, C), m(n, L), m(e, J), m(e, T), m(T, O), m(T, E), m(T, N);
                for (let t = 0; t < W.length; t += 1) W[t] && W[t].m(N, null);
                m(T, P), m(T, D), m(e, H), m(e, A), m(A, I), m(A, z), m(A, q), X.m(q, null)
            },
            p(t, e) {
                if (32768 & e[0] && F !== (F = t[15].about.moduleName + "") && S(c, F), 32768 & e[0] && R !== (R = t[15].about.authorName + "") && S(p, R), 32768 & e[0] && Z !== (Z = t[15].about.moduleDesc + "") && S(j, Z), 32768 & e[0]) {
                    let n;
                    for (U = Object.entries(t[15].about.propInfo), n = 0; n < U.length; n += 1) {
                        const s = pn(t, U, n);
                        W[n] ? W[n].p(s, e) : (W[n] = Rn(s), W[n].c(), W[n].m(N, null))
                    }
                    for (; n < W.length; n += 1) W[n].d(1);
                    W.length = U.length
                }
                V === (V = Y(t, e)) && X ? X.p(t, e) : (X.d(1), X = V(t), X && (X.c(), X.m(q, null)))
            },
            d(t) {
                t && x(e), $(W, t), X.d()
            }
        }
    }

    function Rn(t) {
        let e, n, s, r, l, o, i, c = t[64] + "",
            a = t[65] + "";
        return {
            c() {
                e = v("li"), n = v("strong"), s = y(c), r = y(":"), l = k(), o = y(a), i = k(), M(e, "class", "mb-1")
            },
            m(t, c) {
                b(t, e, c), m(e, n), m(n, s), m(n, r), m(e, l), m(e, o), m(e, i)
            },
            p(t, e) {
                32768 & e[0] && c !== (c = t[64] + "") && S(s, c), 32768 & e[0] && a !== (a = t[65] + "") && S(o, a)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function Zn(e) {
        let n;
        return {
            c() {
                n = v("li"), n.textContent = "У данного модуля нет функций", M(n, "class", "mb-1")
            },
            m(t, e) {
                b(t, n, e)
            },
            p: t,
            d(t) {
                t && x(n)
            }
        }
    }

    function Un(t) {
        let e, n = t[15].about.funcInfo,
            s = [];
        for (let e = 0; e < n.length; e += 1) s[e] = Wn(fn(t, n, e));
        return {
            c() {
                for (let t = 0; t < s.length; t += 1) s[t].c();
                e = _()
            },
            m(t, n) {
                for (let e = 0; e < s.length; e += 1) s[e] && s[e].m(t, n);
                b(t, e, n)
            },
            p(t, r) {
                if (32768 & r[0]) {
                    let l;
                    for (n = t[15].about.funcInfo, l = 0; l < n.length; l += 1) {
                        const o = fn(t, n, l);
                        s[l] ? s[l].p(o, r) : (s[l] = Wn(o), s[l].c(), s[l].m(e.parentNode, e))
                    }
                    for (; l < s.length; l += 1) s[l].d(1);
                    s.length = n.length
                }
            },
            d(t) {
                $(s, t), t && x(e)
            }
        }
    }

    function Wn(t) {
        let e, n, s, r, l, o, i, c, a, u, d, f = t[53].name + "",
            p = (t[53].params?.join(", ") || " ") + "",
            g = t[53].descr.replace(/\n/g, "<br>") + "";
        return {
            c() {
                e = v("li"), n = v("strong"), s = y(f), r = y(" ("), l = y(p), o = y(")"), i = k(), c = v("br"), a = k(), u = y(g), d = k(), M(e, "class", "mb-1")
            },
            m(t, f) {
                b(t, e, f), m(e, n), m(n, s), m(n, r), m(n, l), m(n, o), m(e, i), m(e, c), m(e, a), m(e, u), m(e, d)
            },
            p(t, e) {
                32768 & e[0] && f !== (f = t[53].name + "") && S(s, f), 32768 & e[0] && p !== (p = (t[53].params?.join(", ") || " ") + "") && S(l, p), 32768 & e[0] && g !== (g = t[53].descr.replace(/\n/g, "<br>") + "") && S(u, g)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function Yn(t) {
        let e, n, s, r;
        const l = [wn, vn],
            o = [];

        function i(t, e) {
            return t[5] ? 0 : 1
        }
        return e = i(t), n = o[e] = l[e](t), {
            c() {
                n.c(), s = _()
            },
            m(t, n) {
                o[e].m(t, n), b(t, s, n), r = !0
            },
            p(t, r) {
                let c = e;
                e = i(t), e === c ? o[e].p(t, r) : (et(), rt(o[c], 1, 1, (() => {
                    o[c] = null
                })), nt(), n = o[e], n ? n.p(t, r) : (n = o[e] = l[e](t), n.c()), st(n, 1), n.m(s.parentNode, s))
            },
            i(t) {
                r || (st(n), r = !0)
            },
            o(t) {
                rt(n), r = !1
            },
            d(t) {
                o[e].d(t), t && x(s)
            }
        }
    }
    const Vn = "Файл не является файлом конфигурации";

    function Xn(t, e) {
        let n = t - .5 + Math.random() * (e - t + 1);
        return Math.round(n)
    }

    function Gn(t, e, n) {
        let s, {
                configJson: r
            } = e,
            {
                widgetsJson: l
            } = e,
            {
                itemsJson: o
            } = e,
            {
                scenarioTxt: i
            } = e,
            {
                userdata: c
            } = e,
            {
                show: a
            } = e,
            u = 0,
            d = 0,
            f = null,
            {
                saveConfig: p = (() => {})
            } = e,
            {
                rebootEsp: g = (() => {})
            } = e,
            h = {};

        function m() {
            for (let t = 0; t < o.length; t++) {
                let e = Object.assign({}, o[t]);
                if (u === e.num) {
                    delete e.num, delete e.name, e.id = e.id + Xn(0, 100), r.push(e), n(1, r), n(9, v), n(27, $), n(10, u = 0);
                    break
                }
            }
        }

        function b(t) {
            for (let e = 0; e < r.length; e++)
                if (t === e) {
                    r.splice(e, 1), n(1, r), n(9, v), n(27, $);
                    break
                }
        }

        function x() {
            h.mark = "iotm", h.config = r;
            let t = (t => {
                try {
                    t = JSON.stringify(JSON.parse(t), null, 4)
                } catch (e) {
                    return t
                }
                return (t = t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")).replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (t => t))
            })(JSON.stringify(h));
            t = t + "\n\nscenario=>" + i,
                function(t, e, n) {
                    var s = new Blob([t], {
                        type: "application/json"
                    });
                    if (window.navigator.msSaveOrOpenBlob) window.navigator.msSaveOrOpenBlob(s, e);
                    else {
                        const t = document.createElement("a");
                        document.body.appendChild(t);
                        const n = window.URL.createObjectURL(s);
                        t.href = n, t.download = e, t.click(), setTimeout((() => {
                            window.URL.revokeObjectURL(n), document.body.removeChild(t)
                        }), 0)
                    }
                }(t, "export.json")
        }
        H((async () => {
            await _()
        }));
        let $ = null,
            v = null;

        function w() {
            n(9, v = null), document.getElementById("formFile").value = ""
        }
        let {
            moduleOrder: y = ((t, e, n) => {})
        } = e;
        const k = async () => {
            let t = {
                category: "",
                topic: {
                    ru: "",
                    en: ""
                },
                text: {
                    ru: "",
                    en: ""
                },
                config: r,
                scenario: i,
                gallery: [],
                type: "iotmpost",
                username: c.username
            };
            const e = dn.get("token_iotm2");
            try {
                let n = await fetch("https://portal.iotmanager.org/api/configurations/add", {
                    mode: "cors",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${e}`
                    },
                    body: JSON.stringify(t)
                });
                const s = await n.json();
                n.ok ? (s.result.acknowledged && window.open("https://portal.iotmanager.org/configs?id=" + s.result.insertedId + "&token=" + dn.get("token_iotm2"), "_blank"), errors = [{
                    msg: "ok_success"
                }]) : errors = s.message
            } catch (t) {}
        }, _ = async () => {
            try {
                const t = dn.get("token_iotm2");
                let e = await fetch("https://portal.iotmanager.org/api/configurations/get", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${t}`
                    },
                    mode: "cors",
                    method: "GET"
                });
                e.ok && n(12, f = await e.json())
            } catch (t) {}
        };

        function j() {
            n(1, r = f[d].config), n(0, i = f[d].scenario)
        }
        let C = !1,
            M = null;

        function L(t) {
            let e = "Не найдено";
            for (const n of o)
                if (n.header) e = n.header;
                else if (n.moduleName === t) return e;
            return e
        }

        function S(t) {
            L(t.moduleName), async function(t) {
                let e = "undefineded";
                const n = L(t.moduleName);
                "virtual_elments" === n ? e = "virtual" : "executive_devices" === n ? e = "exec" : "screens" === n ? e = "display" : "sensors" === n && (e = "sensors");
                try {
                    const n = `https://raw.githubusercontent.com/Mit4el/IoTManager/ver4dev/src/modules/${encodeURIComponent(e)}/${encodeURIComponent(t.moduleName)}/modinfo.json`,
                        s = await fetch(n);
                    if (!s.ok) throw new Error(`Ошибка: ${s.status}`);
                    return await s.json()
                } catch (t) {
                    return null
                }
            }(t).then((t => {
                n(15, M = t || null), n(14, C = !0)
            })).catch((() => {
                n(15, M = null), n(14, C = !0)
            }))
        }

        function J(t) {
            t.customModifiers || (t.customModifiers = []), t.customModifiers.push({
                id: Date.now(),
                name: "",
                value: ""
            }), n(1, r = [...r])
        }

        function T(t, e) {
            const n = t.customModifiers[e];
            n.name && n.value && (t[n.name] = n.value, O(t, e))
        }

        function O(t, e) {
            const s = [...t.customModifiers];
            s.splice(e, 1), 0 === s.length ? delete t.customModifiers : t.customModifiers = s, n(1, r = [...r])
        }
        return t.$$set = t => {
            "configJson" in t && n(1, r = t.configJson), "widgetsJson" in t && n(2, l = t.widgetsJson), "itemsJson" in t && n(3, o = t.itemsJson), "scenarioTxt" in t && n(0, i = t.scenarioTxt), "userdata" in t && n(4, c = t.userdata), "show" in t && n(5, a = t.show), "saveConfig" in t && n(6, p = t.saveConfig), "rebootEsp" in t && n(7, g = t.rebootEsp), "moduleOrder" in t && n(8, y = t.moduleOrder)
        }, t.$$.update = () => {
            134218240 & t.$$.dirty[0] && v && (v[0].text().then((t => {
                if (n(27, $ = t), !$.includes("scenario=>")) return void window.alert(Vn);
                let e = function(t, e) {
                        let n = t.indexOf("scenario=>");
                        return t.substring(0, n)
                    }($),
                    s = function(t, e) {
                        let n = t.indexOf(e) + e.length;
                        return t.substring(n)
                    }($, "scenario=>");
                if (! function(t) {
                        try {
                            JSON.parse(t)
                        } catch (t) {
                            return !1
                        }
                        return !0
                    }(e)) return void window.alert(Vn);
                let l = JSON.parse(e);
                "iotm" === l.mark ? window.confirm("Применить конфигурацию?\nне забудьте нажать кнопку 'сохранить на устройстве'") && (n(1, r = []), n(0, i = ""), n(1, r = l.config), n(0, i = s)) : window.alert(Vn)
            })), n(9, v = null)), 1 & t.$$.dirty[0] && n(13, s = i.split("\n").length + 1)
        }, [i, r, l, o, c, a, p, g, y, v, u, d, f, s, C, M, m, b, x, w, k, j, S, function() {
            n(14, C = !1)
        }, J, T, O, $, function() {
            u = E(this), n(10, u), n(3, o)
        }, () => m(), function() {
            d = E(this), n(11, d)
        }, () => j(), function(t, e) {
            t[e].id = this.value, n(1, r), n(9, v), n(27, $), n(2, l)
        }, function(t, e) {
            t[e].widget = E(this), n(1, r), n(9, v), n(27, $), n(2, l)
        }, function(t, e) {
            t[e].page = this.value, n(1, r), n(9, v), n(27, $), n(2, l)
        }, function(t, e) {
            t[e].descr = this.value, n(1, r), n(9, v), n(27, $), n(2, l)
        }, t => b(t), t => S(t), (t, e) => y(t.id, e.substring(4), t[e]), function(t, e, s) {
            e[s][t] = this.value, n(1, r), n(9, v), n(27, $), n(2, l)
        }, function(t, e, s) {
            e[s][t] = this.value, n(1, r), n(9, v), n(27, $), n(2, l)
        }, t => J(t), function(t, e) {
            t[e].name = this.value, n(1, r), n(9, v), n(27, $), n(2, l)
        }, function(t, e) {
            t[e].value = this.value, n(1, r), n(9, v), n(27, $), n(2, l)
        }, (t, e) => T(t, e), (t, e) => O(t, e), function() {
            i = this.value, n(0, i), n(9, v), n(27, $)
        }, () => p(), () => g(), () => x(), function() {
            v = this.files, n(9, v), n(27, $)
        }, () => w(), () => k(), (t, e, s) => n(1, e[s].show = !t.show, r)]
    }
    class Kn extends dt {
        constructor(t) {
            super(), ut(this, t, Gn, Yn, l, {
                configJson: 1,
                widgetsJson: 2,
                itemsJson: 3,
                scenarioTxt: 0,
                userdata: 4,
                show: 5,
                saveConfig: 6,
                rebootEsp: 7,
                moduleOrder: 8
            }, null, [-1, -1, -1])
        }
    }

    function Qn(t, e, n) {
        const s = t.slice();
        return s[23] = e[n][0], s[24] = e[n][1], s
    }

    function ts(e) {
        let n, s;
        return n = new Ut({
            props: {
                title: "Загрузка..."
            }
        }), {
            c() {
                it(n.$$.fragment)
            },
            m(t, e) {
                ct(n, t, e), s = !0
            },
            p: t,
            i(t) {
                s || (st(n.$$.fragment, t), s = !0)
            },
            o(t) {
                rt(n.$$.fragment, t), s = !1
            },
            d(t) {
                at(n, t)
            }
        }
    }

    function es(t) {
        let e, n, s, r, l, o, i, c, a;
        return s = new Qt({
            props: {
                title: "Подключение к WiFi",
                $$slots: {
                    default: [rs]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), l = new Qt({
            props: {
                title: "Подключение к MQTT",
                $$slots: {
                    default: [as]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), c = new Qt({
            props: {
                $$slots: {
                    default: [us]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), {
            c() {
                e = v("div"), n = v("div"), it(s.$$.fragment), r = k(), it(l.$$.fragment), o = k(), i = v("div"), it(c.$$.fragment), M(n, "class", "grd-2col1"), M(e, "class", "my-4"), M(i, "class", "grd-1col1")
            },
            m(t, u) {
                b(t, e, u), m(e, n), ct(s, n, null), m(n, r), ct(l, n, null), b(t, o, u), b(t, i, u), ct(c, i, null), a = !0
            },
            p(t, e) {
                const n = {};
                134217783 & e && (n.$$scope = {
                    dirty: e,
                    ctx: t
                }), s.$set(n);
                const r = {};
                134217795 & e && (r.$$scope = {
                    dirty: e,
                    ctx: t
                }), l.$set(r);
                const o = {};
                134217856 & e && (o.$$scope = {
                    dirty: e,
                    ctx: t
                }), c.$set(o)
            },
            i(t) {
                a || (st(s.$$.fragment, t), st(l.$$.fragment, t), st(c.$$.fragment, t), a = !0)
            },
            o(t) {
                rt(s.$$.fragment, t), rt(l.$$.fragment, t), rt(c.$$.fragment, t), a = !1
            },
            d(t) {
                t && x(e), at(s), at(l), t && x(o), t && x(i), at(c)
            }
        }
    }

    function ns(t) {
        let e, n, s, r, l = t[24] + "";
        return {
            c() {
                e = v("option"), n = y(l), s = k(), e.__value = r = t[24], e.value = e.__value
            },
            m(t, r) {
                b(t, e, r), m(e, n), m(e, s)
            },
            p(t, s) {
                4 & s && l !== (l = t[24] + "") && S(n, l), 4 & s && r !== (r = t[24]) && (e.__value = r, e.value = e.__value)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function ss(t) {
        let e, n, s;
        return n = new Ut({
            props: {
                title: "Введен неправильный пароль"
            }
        }), {
            c() {
                e = v("div"), it(n.$$.fragment), M(e, "class", "grd-1col1")
            },
            m(t, r) {
                b(t, e, r), ct(n, e, null), s = !0
            },
            i(t) {
                s || (st(n.$$.fragment, t), s = !0)
            },
            o(t) {
                rt(n.$$.fragment, t), s = !1
            },
            d(t) {
                t && x(e), at(n)
            }
        }
    }

    function rs(t) {
        let e, n, r, l, o, i, c, a, u, d, f, p, g, h, w, y, _, C, L, S, T, E, N, P, D, H, A, I, z, q, B, F, R, Z, U, Y, V = Object.entries(t[2]),
            X = [];
        for (let e = 0; e < V.length; e += 1) X[e] = ns(Qn(t, V, e));
        let G = 1 === t[1].passer && ss();
        return {
            c() {
                e = v("div"), n = v("div"), n.innerHTML = '<p class="wgt-dscr-stl truncate">Название устройства</p>', r = k(), l = v("div"), o = v("input"), i = k(), c = v("div"), c.innerHTML = '<p class="wgt-dscr-stl truncate">Точка доступа</p>', a = k(), u = v("div"), d = v("input"), f = k(), p = v("div"), p.innerHTML = '<p class="wgt-dscr-stl truncate">Пароль точки доступа</p>', g = k(), h = v("div"), w = v("input"), y = k(), _ = v("div"), _.innerHTML = '<p class="wgt-dscr-stl truncate">Название wifi сети</p>', C = k(), L = v("div"), S = v("select");
                for (let t = 0; t < X.length; t += 1) X[t].c();
                T = k(), E = v("div"), E.innerHTML = '<p class="wgt-dscr-stl truncate">Пароль</p>', N = k(), P = v("div"), D = v("input"), H = k(), A = v("div"), A.innerHTML = '<p class="wgt-dscr-stl truncate">Сервер обновления</p>', I = k(), z = v("div"), q = v("input"), B = k(), G && G.c(), F = k(), R = v("button"), R.textContent = "Сохранить", M(n, "class", "w-full"), M(o, "class", "content-center px-2 h-8 bg-gray-50 border-2 border-gray-200 rounded w-full text-gray-700 leading-tight focus:outline-none focus:bg-white text-left focus:border-indigo-500"), M(o, "type", "text"), M(l, "class", "flex justify-end w-full"), M(c, "class", "w-full"), M(d, "class", "content-center px-2 h-8 bg-gray-50 border-2 border-gray-200 rounded w-full text-gray-700 leading-tight focus:outline-none focus:bg-white text-left focus:border-indigo-500"), M(d, "type", "text"), M(u, "class", "flex justify-end w-full"), M(p, "class", "w-full"), M(w, "class", "content-center px-2 h-8 bg-gray-50 border-2 border-gray-200 rounded w-full text-gray-700 leading-tight focus:outline-none focus:bg-white text-left focus:border-indigo-500"), M(h, "class", "flex justify-end w-full"), M(_, "class", "w-full"), M(S, "class", "content-center px-2 h-8 bg-gray-50 border-2 border-gray-200 rounded w-full text-gray-700 leading-tight focus:outline-none focus:bg-white text-left focus:border-indigo-500"), void 0 === t[0].routerssid && W((() => t[11].call(S))), M(L, "class", "flex justify-end w-full"), M(E, "class", "w-full"), M(D, "class", "content-center px-2 h-8 bg-gray-50 border-2 border-gray-200 rounded w-full text-gray-700 leading-tight focus:outline-none focus:bg-white text-left focus:border-indigo-500"), M(D, "type", "text"), M(P, "class", "flex justify-end w-full"), M(A, "class", "w-full"), M(q, "class", "content-center px-2 h-8 mb-4 bg-gray-50 border-2 border-gray-200 rounded w-full text-gray-700 leading-tight focus:outline-none focus:bg-white text-left focus:border-indigo-500"), M(q, "type", "text"), M(z, "class", "flex justify-end w-full"), M(e, "class", "grid grid-cols-2 gap-2"), M(R, "class", "btn-lg")
            },
            m(s, x) {
                b(s, e, x), m(e, n), m(e, r), m(e, l), m(l, o), J(o, t[0].name), m(e, i), m(e, c), m(e, a), m(e, u), m(u, d), J(d, t[0].apssid), m(e, f), m(e, p), m(e, g), m(e, h), m(h, w), J(w, t[0].appass), m(e, y), m(e, _), m(e, C), m(e, L), m(L, S);
                for (let t = 0; t < X.length; t += 1) X[t] && X[t].m(S, null);
                O(S, t[0].routerssid, !0), m(e, T), m(e, E), m(e, N), m(e, P), m(P, D), J(D, t[0].routerpass), m(e, H), m(e, A), m(e, I), m(e, z), m(z, q), J(q, t[0].serverip), b(s, B, x), G && G.m(s, x), b(s, F, x), b(s, R, x), Z = !0, U || (Y = [j(o, "input", t[8]), j(d, "input", t[9]), j(w, "input", t[10]), j(S, "change", t[11]), j(S, "click", t[12]), j(D, "input", t[13]), j(q, "input", t[14]), j(R, "click", t[15])], U = !0)
            },
            p(t, e) {
                if (5 & e && o.value !== t[0].name && J(o, t[0].name), 5 & e && d.value !== t[0].apssid && J(d, t[0].apssid), 5 & e && w.value !== t[0].appass && J(w, t[0].appass), 4 & e) {
                    let n;
                    for (V = Object.entries(t[2]), n = 0; n < V.length; n += 1) {
                        const s = Qn(t, V, n);
                        X[n] ? X[n].p(s, e) : (X[n] = ns(s), X[n].c(), X[n].m(S, null))
                    }
                    for (; n < X.length; n += 1) X[n].d(1);
                    X.length = V.length
                }
                5 & e && O(S, t[0].routerssid), 5 & e && D.value !== t[0].routerpass && J(D, t[0].routerpass), 5 & e && q.value !== t[0].serverip && J(q, t[0].serverip), 1 === t[1].passer ? G ? 2 & e && st(G, 1) : (G = ss(), G.c(), st(G, 1), G.m(F.parentNode, F)) : G && (et(), rt(G, 1, 1, (() => {
                    G = null
                })), nt())
            },
            i(t) {
                Z || (st(G), Z = !0)
            },
            o(t) {
                rt(G), Z = !1
            },
            d(t) {
                t && x(e), $(X, t), t && x(B), G && G.d(t), t && x(F), t && x(R), U = !1, s(Y)
            }
        }
    }

    function ls(t) {
        let e;
        return {
            c() {
                e = v("p"), e.textContent = "Ошибка", M(e, "class", "text-red-500 font-bold h-8 bg-red-50 border-2 border-gray-200 rounded w-full text-center")
            },
            m(t, n) {
                b(t, e, n)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function os(t) {
        let e;
        return {
            c() {
                e = v("p"), e.textContent = "Ожидание", M(e, "class", "text-blue-500 font-bold h-8 bg-blue-50 border-2 border-gray-200 rounded w-full text-center")
            },
            m(t, n) {
                b(t, e, n)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function is(t) {
        let e;
        return {
            c() {
                e = v("p"), e.textContent = "Подключение", M(e, "class", "text-yellow-500 font-bold h-8 bg-yellow-50 border-2 border-gray-200 rounded w-full text-center")
            },
            m(t, n) {
                b(t, e, n)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function cs(t) {
        let e;
        return {
            c() {
                e = v("p"), e.textContent = "Подключено", M(e, "class", "text-green-500 font-bold m-0 p-0 h-8 bg-green-50 border-2 border-gray-200 rounded w-full text-center")
            },
            m(t, n) {
                b(t, e, n)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function as(t) {
        let e, n, r, l, o, i, c, a, u, d, f, p, g, h, $, w, y, _, C, L, S, T, O, E, N, P, D, H, A, I, z, q, B;

        function F(t, e) {
            return "e5" === t[1].mqtt ? cs : "e13" === t[1].mqtt ? is : void 0 === t[1].mqtt ? os : ls
        }
        let R = F(t),
            Z = R(t);
        return {
            c() {
                e = v("div"), n = v("div"), n.innerHTML = '<p class="wgt-dscr-stl text-gray-500 truncate">Состояние подключения</p>', r = k(), l = v("div"), Z.c(), o = k(), i = v("div"), i.innerHTML = '<p class="wgt-dscr-stl truncate">Название сервера</p>', c = k(), a = v("div"), u = v("input"), d = k(), f = v("div"), f.innerHTML = '<p class="wgt-dscr-stl truncate">Порт</p>', p = k(), g = v("div"), h = v("input"), $ = k(), w = v("div"), w.innerHTML = '<p class="wgt-dscr-stl truncate">Префикс</p>', y = k(), _ = v("div"), C = v("input"), L = k(), S = v("div"), S.innerHTML = '<p class="wgt-dscr-stl truncate">Имя пользователя</p>', T = k(), O = v("div"), E = v("input"), N = k(), P = v("div"), P.innerHTML = '<p class="wgt-dscr-stl truncate">Пароль</p>', D = k(), H = v("div"), A = v("input"), I = k(), z = v("button"), z.textContent = "Сохранить", M(n, "class", "w-full"), M(l, "class", "flex justify-center w-full align-baseline text-sm sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base truncate align-text-middle"), M(i, "class", "w-full"), M(u, "class", "content-center px-2 h-8 bg-gray-50 border-2 border-gray-200 rounded w-full text-gray-700 leading-tight focus:outline-none focus:bg-white text-left focus:border-indigo-500"), M(u, "type", "text"), M(a, "class", "flex justify-end w-full"), M(f, "class", "w-full"), M(h, "class", "content-center px-2 h-8 bg-gray-50 border-2 border-gray-200 rounded w-full text-gray-700 leading-tight focus:outline-none focus:bg-white text-left focus:border-indigo-500"), M(h, "type", "text"), M(g, "class", "flex justify-end w-full"), M(w, "class", "w-full"), M(C, "class", "content-center px-2 h-8 bg-gray-50 border-2 border-gray-200 rounded w-full text-gray-700 leading-tight focus:outline-none focus:bg-white text-left focus:border-indigo-500"), M(C, "type", "text"), M(_, "class", "flex justify-end w-full"), M(S, "class", "w-full"), M(E, "class", "content-center px-2 h-8 bg-gray-50 border-2 border-gray-200 rounded w-full text-gray-700 leading-tight focus:outline-none focus:bg-white text-left focus:border-indigo-500"), M(E, "type", "text"), M(O, "class", "flex justify-end w-full"), M(P, "class", "w-full"), M(A, "class", "content-center px-2 h-8 mb-4 bg-gray-50 border-2 border-gray-200 rounded w-full text-gray-700 leading-tight focus:outline-none focus:bg-white text-left focus:border-indigo-500"), M(A, "type", "text"), M(H, "class", "flex justify-end w-full"), M(e, "class", "grid grid-cols-2 gap-2"), M(z, "class", "btn-lg")
            },
            m(s, x) {
                b(s, e, x), m(e, n), m(e, r), m(e, l), Z.m(l, null), m(e, o), m(e, i), m(e, c), m(e, a), m(a, u), J(u, t[0].mqttServer), m(e, d), m(e, f), m(e, p), m(e, g), m(g, h), J(h, t[0].mqttPort), m(e, $), m(e, w), m(e, y), m(e, _), m(_, C), J(C, t[0].mqttPrefix), m(e, L), m(e, S), m(e, T), m(e, O), m(O, E), J(E, t[0].mqttUser), m(e, N), m(e, P), m(e, D), m(e, H), m(H, A), J(A, t[0].mqttPass), b(s, I, x), b(s, z, x), q || (B = [j(u, "input", t[16]), j(h, "input", t[17]), j(C, "input", t[18]), j(E, "input", t[19]), j(A, "input", t[20]), j(z, "click", t[21])], q = !0)
            },
            p(t, e) {
                R !== (R = F(t)) && (Z.d(1), Z = R(t), Z && (Z.c(), Z.m(l, null))), 5 & e && u.value !== t[0].mqttServer && J(u, t[0].mqttServer), 5 & e && h.value !== t[0].mqttPort && J(h, t[0].mqttPort), 5 & e && C.value !== t[0].mqttPrefix && J(C, t[0].mqttPrefix), 5 & e && E.value !== t[0].mqttUser && J(E, t[0].mqttUser), 5 & e && A.value !== t[0].mqttPass && J(A, t[0].mqttPass)
            },
            d(t) {
                t && x(e), Z.d(), t && x(I), t && x(z), q = !1, s(B)
            }
        }
    }

    function us(e) {
        let n, s, r;
        return {
            c() {
                n = v("button"), n.textContent = "Перезагрузить устройство", M(n, "class", "btn-lg")
            },
            m(t, l) {
                b(t, n, l), s || (r = j(n, "click", e[22]), s = !0)
            },
            p: t,
            d(t) {
                t && x(n), s = !1, r()
            }
        }
    }

    function ds(t) {
        let e, n, s, r;
        const l = [es, ts],
            o = [];

        function i(t, e) {
            return t[3] ? 0 : 1
        }
        return e = i(t), n = o[e] = l[e](t), {
            c() {
                n.c(), s = _()
            },
            m(t, n) {
                o[e].m(t, n), b(t, s, n), r = !0
            },
            p(t, [r]) {
                let c = e;
                e = i(t), e === c ? o[e].p(t, r) : (et(), rt(o[c], 1, 1, (() => {
                    o[c] = null
                })), nt(), n = o[e], n ? n.p(t, r) : (n = o[e] = l[e](t), n.c()), st(n, 1), n.m(s.parentNode, s))
            },
            i(t) {
                r || (st(n), r = !0)
            },
            o(t) {
                rt(n), r = !1
            },
            d(t) {
                o[e].d(t), t && x(s)
            }
        }
    }

    function fs(t, e, n) {
        let {
            settingsJson: s
        } = e, {
            errorsJson: r
        } = e, {
            ssidJson: l
        } = e, {
            show: o
        } = e, {
            ssidClick: i = (() => {})
        } = e, {
            saveSett: c = (() => {})
        } = e, {
            saveMqtt: a = (() => {})
        } = e, {
            rebootEsp: u = (() => {})
        } = e;
        return t.$$set = t => {
            "settingsJson" in t && n(0, s = t.settingsJson), "errorsJson" in t && n(1, r = t.errorsJson), "ssidJson" in t && n(2, l = t.ssidJson), "show" in t && n(3, o = t.show), "ssidClick" in t && n(4, i = t.ssidClick), "saveSett" in t && n(5, c = t.saveSett), "saveMqtt" in t && n(6, a = t.saveMqtt), "rebootEsp" in t && n(7, u = t.rebootEsp)
        }, [s, r, l, o, i, c, a, u, function() {
            s.name = this.value, n(0, s), n(2, l)
        }, function() {
            s.apssid = this.value, n(0, s), n(2, l)
        }, function() {
            s.appass = this.value, n(0, s), n(2, l)
        }, function() {
            s.routerssid = E(this), n(0, s), n(2, l);
        }, () => i(), function() {
            s.routerpass = this.value, n(0, s), n(2, l)
        }, function() {
            s.serverip = this.value, n(0, s), n(2, l)
        }, () => c(), function() {
            s.mqttServer = this.value, n(0, s), n(2, l)
        }, function() {
            s.mqttPort = this.value, n(0, s), n(2, l)
        }, function() {
            s.mqttPrefix = this.value, n(0, s), n(2, l)
        }, function() {
            s.mqttUser = this.value, n(0, s), n(2, l)
        }, function() {
            s.mqttPass = this.value, n(0, s), n(2, l)
        }, () => a(), () => u()]
    }
    class ps extends dt {
        constructor(t) {
            super(), ut(this, t, fs, ds, l, {
                settingsJson: 0,
                errorsJson: 1,
                ssidJson: 2,
                show: 3,
                ssidClick: 4,
                saveSett: 5,
                saveMqtt: 6,
                rebootEsp: 7
            })
        }
    }

    function gs(t, e, n) {
        const s = t.slice();
        return s[23] = e[n], s[25] = n, s
    }

    function hs(e) {
        let n, s;
        return n = new Ut({
            props: {
                title: "Загрузка..."
            }
        }), {
            c() {
                it(n.$$.fragment)
            },
            m(t, e) {
                ct(n, t, e), s = !0
            },
            p: t,
            i(t) {
                s || (st(n.$$.fragment, t), s = !0)
            },
            o(t) {
                rt(n.$$.fragment, t), s = !1
            },
            d(t) {
                at(n, t)
            }
        }
    }

    function ms(t) {
        let e, n, s, r, l, o;
        return s = new Qt({
            props: {
                title: t[4].udps ? "Список устройств (авто режим)" : "Список устройств (ручной режим)",
                $$slots: {
                    default: [vs]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), l = new Ut({
            props: {
                $$slots: {
                    default: [ws]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), {
            c() {
                e = v("div"), n = v("div"), it(s.$$.fragment), r = k(), it(l.$$.fragment), M(n, "class", "grd-1col1"), M(e, "class", "my-4")
            },
            m(t, i) {
                b(t, e, i), m(e, n), ct(s, n, null), m(e, r), ct(l, e, null), o = !0
            },
            p(t, e) {
                const n = {};
                16 & e && (n.title = t[4].udps ? "Список устройств (авто режим)" : "Список устройств (ручной режим)"), 67108990 & e && (n.$$scope = {
                    dirty: e,
                    ctx: t
                }), s.$set(n);
                const r = {};
                67108864 & e && (r.$$scope = {
                    dirty: e,
                    ctx: t
                }), l.$set(r)
            },
            i(t) {
                o || (st(s.$$.fragment, t), st(l.$$.fragment, t), o = !0)
            },
            o(t) {
                rt(s.$$.fragment, t), rt(l.$$.fragment, t), o = !1
            },
            d(t) {
                t && x(e), at(s), at(l)
            }
        }
    }

    function bs(t) {
        let e, n, s, r, l, o, i, c, a, u, d, f, p, g, h, $, w, _, j, C, L, J, T, O, E, N, P = t[23].ws + 1 + "",
            D = t[23].name + "",
            H = t[23].ip + "",
            A = t[23].id + "",
            I = (t[23].fv ? t[23].fv : "-") + "",
            z = t[23].status ? "online" : "offline",
            q = (t[23].ping ? t[23].ping : "-") + "",
            B = t[25] > 0 && function(t) {
                let e, n, s;
                return n = new qt({
                    props: {
                        click: () => t[14](t[25])
                    }
                }), {
                    c() {
                        e = v("td"), it(n.$$.fragment), M(e, "class", "tbl-bdy-lg")
                    },
                    m(t, r) {
                        b(t, e, r), ct(n, e, null), s = !0
                    },
                    p(e, n) {
                        t = e
                    },
                    i(t) {
                        s || (st(n.$$.fragment, t), s = !0)
                    },
                    o(t) {
                        rt(n.$$.fragment, t), s = !1
                    },
                    d(t) {
                        t && x(e), at(n)
                    }
                }
            }(t);
        return {
            c() {
                e = v("tr"), n = v("td"), s = y(P), r = k(), l = v("td"), o = y(D), i = k(), c = v("td"), a = v("a"), u = y(H), f = k(), p = v("td"), g = y(A), h = k(), $ = v("td"), w = y(I), _ = k(), j = v("td"), C = y(z), J = k(), T = v("td"), O = y(q), E = k(), B && B.c(), M(n, "class", "tbl-bdy-lg ipt-lg w-full"), M(l, "class", "tbl-bdy-lg ipt-lg w-full"), M(a, "href", d = "http://" + t[23].ip), M(c, "class", "tbl-bdy-lg ipt-lg w-full"), M(p, "class", "tbl-bdy-lg ipt-lg w-full"), M($, "class", "tbl-bdy-lg ipt-lg w-full"), M(j, "class", L = "tbl-bdy-lg ipt-lg w-full " + (t[23].status ? "bg-green-50" : "bg-red-50")), M(T, "class", "tbl-bdy-lg ipt-lg w-full"), M(e, "class", "txt-sz txt-pad")
            },
            m(t, d) {
                b(t, e, d), m(e, n), m(n, s), m(e, r), m(e, l), m(l, o), m(e, i), m(e, c), m(c, a), m(a, u), m(e, f), m(e, p), m(p, g), m(e, h), m(e, $), m($, w), m(e, _), m(e, j), m(j, C), m(e, J), m(e, T), m(T, O), m(e, E), B && B.m(e, null), N = !0
            },
            p(t, e) {
                (!N || 2 & e) && P !== (P = t[23].ws + 1 + "") && S(s, P), (!N || 2 & e) && D !== (D = t[23].name + "") && S(o, D), (!N || 2 & e) && H !== (H = t[23].ip + "") && S(u, H), (!N || 2 & e && d !== (d = "http://" + t[23].ip)) && M(a, "href", d), (!N || 2 & e) && A !== (A = t[23].id + "") && S(g, A), (!N || 2 & e) && I !== (I = (t[23].fv ? t[23].fv : "-") + "") && S(w, I), (!N || 2 & e) && z !== (z = t[23].status ? "online" : "offline") && S(C, z), (!N || 2 & e && L !== (L = "tbl-bdy-lg ipt-lg w-full " + (t[23].status ? "bg-green-50" : "bg-red-50"))) && M(j, "class", L), (!N || 2 & e) && q !== (q = (t[23].ping ? t[23].ping : "-") + "") && S(O, q), t[25] > 0 && B.p(t, e)
            },
            i(t) {
                N || (st(B), N = !0)
            },
            o(t) {
                rt(B), N = !1
            },
            d(t) {
                t && x(e), B && B.d()
            }
        }
    }

    function xs(t) {
        let e, n, r, l, o, i, c, a, u, d, f, p, g, h, $;
        return {
            c() {
                e = v("tr"), n = v("td"), r = k(), l = v("td"), o = v("input"), i = k(), c = v("td"), a = v("input"), u = k(), d = v("td"), f = v("input"), p = k(), g = v("td"), M(n, "class", "tbl-bdy-lg"), M(o, "class", "ipt-lg w-full m-0"), M(o, "type", "text"), M(l, "class", "tbl-bdy-lg"), M(a, "class", "ipt-lg w-full m-0"), M(a, "type", "text"), M(c, "class", "tbl-bdy-lg"), M(f, "class", "ipt-lg w-full m-0"), M(f, "type", "text"), M(d, "class", "tbl-bdy-lg"), M(g, "class", "tbl-bdy-lg"), M(e, "class", "txt-sz txt-pad")
            },
            m(s, x) {
                b(s, e, x), m(e, n), m(e, r), m(e, l), m(l, o), J(o, t[3].name), m(e, i), m(e, c), m(c, a), J(a, t[3].ip), m(e, u), m(e, d), m(d, f), J(f, t[3].id), m(e, p), m(e, g), h || ($ = [j(o, "input", t[15]), j(a, "input", t[16]), j(f, "input", t[17])], h = !0)
            },
            p(t, e) {
                8 & e && o.value !== t[3].name && J(o, t[3].name), 8 & e && a.value !== t[3].ip && J(a, t[3].ip), 8 & e && f.value !== t[3].id && J(f, t[3].id)
            },
            d(t) {
                t && x(e), h = !1, s($)
            }
        }
    }

    function $s(e) {
        let n, s, r;
        return {
            c() {
                n = v("button"), n.textContent = "Добавить устройство", M(n, "class", "btn-lg")
            },
            m(t, l) {
                b(t, n, l), s || (r = j(n, "click", e[18]), s = !0)
            },
            p: t,
            d(t) {
                t && x(n), s = !1, r()
            }
        }
    }

    function vs(t) {
        let e, n, r, l, o, i, c, a, u, d, f, p, g, h, w, y, _, C, L, S, J, O, E, N, P, D, H, A, I, z, q, B, F, R = t[1],
            Z = [];
        for (let e = 0; e < R.length; e += 1) Z[e] = bs(gs(t, R, e));
        const U = t => rt(Z[t], 1, 1, (() => {
            Z[t] = null
        }));
        let W = t[2] && xs(t),
            Y = !t[4].udps && !t[2] && $s(t);
        return {
            c() {
                e = v("table"), n = v("thead"), n.innerHTML = '<tr class="txt-sz txt-pad"><th class="tbl-hd w-7">№</th> \n              <th class="tbl-hd">Название устройства</th> \n              <th class="tbl-hd">IP адрес</th> \n              <th class="tbl-hd">Идентификатор</th> \n              <th class="tbl-hd">Версия</th> \n              <th class="tbl-hd">Состояние</th> \n              <th class="tbl-hd">Пинг</th> \n              <th class="tbl-hd w-7"></th></tr>', r = k(), l = v("tbody");
                for (let t = 0; t < Z.length; t += 1) Z[t].c();
                o = k(), W && W.c(), i = k(), c = v("div"), a = v("div"), u = v("div"), d = k(), f = v("div"), Y && Y.c(), p = k(), g = v("button"), g.textContent = "Сохранить", h = k(), w = v("button"), w.textContent = "Перезагрузить все устройства", _ = k(), C = v("div"), L = v("div"), S = v("div"), S.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Автоматический поиск устройств по UDP</p>', J = k(), O = v("div"), E = v("label"), N = v("div"), P = v("input"), D = k(), H = v("div"), I = k(), z = v("div"), M(n, "class", "bg-gray-100"), M(l, "class", "bg-white"), M(e, "class", "tbl mb-0"), M(u, "class", "bg-green-300 h-0.5 rounded-full"), T(u, "width", t[5] + "%"), M(a, "class", "w-full bg-gray-200 rounded-full h-0.5 dark:bg-gray-700"), M(c, "class", "mb-4"), M(g, "class", "btn-lg"), M(w, "class", "btn-lg"), M(f, "class", y = t[4].udps ? "grd-2col1" : "grd-3col1"), M(S, "class", "w-3/4"), M(P, "id", "udps"), M(P, "type", "checkbox"), M(P, "class", "sr-only"), M(H, "class", A = "block " + (t[4].udps ? "bg-blue-600" : "bg-gray-600") + " w-10 h-6 rounded-full shadow-lg"), M(z, "class", "dot bg-gray-100 absolute left-1 top-1 w-4 h-4 rounded-full transition shadow-lg"), M(N, "class", "relative"), M(E, "for", "udps"), M(E, "class", "items-center cursor-pointer"), M(O, "class", "flex justify-end w-1/4"), M(L, "class", "flex mb-2 h-6 items-center"), M(C, "class", "mt-4")
            },
            m(s, x) {
                b(s, e, x), m(e, n), m(e, r), m(e, l);
                for (let t = 0; t < Z.length; t += 1) Z[t] && Z[t].m(l, null);
                m(l, o), W && W.m(l, null), b(s, i, x), b(s, c, x), m(c, a), m(a, u), b(s, d, x), b(s, f, x), Y && Y.m(f, null), m(f, p), m(f, g), m(f, h), m(f, w), b(s, _, x), b(s, C, x), m(C, L), m(L, S), m(L, J), m(L, O), m(O, E), m(E, N), m(N, P), P.checked = t[4].udps, m(N, D), m(N, H), m(N, I), m(N, z), q = !0, B || (F = [j(g, "click", t[19]), j(w, "click", t[20]), j(P, "change", t[21]), j(P, "change", t[22])], B = !0)
            },
            p(t, e) {
                if (130 & e) {
                    let n;
                    for (R = t[1], n = 0; n < R.length; n += 1) {
                        const s = gs(t, R, n);
                        Z[n] ? (Z[n].p(s, e), st(Z[n], 1)) : (Z[n] = bs(s), Z[n].c(), st(Z[n], 1), Z[n].m(l, o))
                    }
                    for (et(), n = R.length; n < Z.length; n += 1) U(n);
                    nt()
                }
                t[2] ? W ? W.p(t, e) : (W = xs(t), W.c(), W.m(l, null)) : W && (W.d(1), W = null), (!q || 32 & e) && T(u, "width", t[5] + "%"), t[4].udps || t[2] ? Y && (Y.d(1), Y = null) : Y ? Y.p(t, e) : (Y = $s(t), Y.c(), Y.m(f, p)), (!q || 16 & e && y !== (y = t[4].udps ? "grd-2col1" : "grd-3col1")) && M(f, "class", y), 16 & e && (P.checked = t[4].udps), (!q || 16 & e && A !== (A = "block " + (t[4].udps ? "bg-blue-600" : "bg-gray-600") + " w-10 h-6 rounded-full shadow-lg")) && M(H, "class", A)
            },
            i(t) {
                if (!q) {
                    for (let t = 0; t < R.length; t += 1) st(Z[t]);
                    q = !0
                }
            },
            o(t) {
                Z = Z.filter(Boolean);
                for (let t = 0; t < Z.length; t += 1) rt(Z[t]);
                q = !1
            },
            d(t) {
                t && x(e), $(Z, t), W && W.d(), t && x(i), t && x(c), t && x(d), t && x(f), Y && Y.d(), t && x(_), t && x(C), B = !1, s(F)
            }
        }
    }

    function ws(e) {
        let n;
        return {
            c() {
                n = v("p"), n.textContent = 'Авто режим - список создается автоматически, можно нажать кнопку "сохранить список" что бы использовать его потом в ручном режиме. Ручной режим - используется сохраненный список, возможно ручное добавление удаление устройств.'
            },
            m(t, e) {
                b(t, n, e)
            },
            p: t,
            d(t) {
                t && x(n)
            }
        }
    }

    function ys(t) {
        let e, n, s, r;
        const l = [ms, hs],
            o = [];

        function i(t, e) {
            return t[0] ? 0 : 1
        }
        return e = i(t), n = o[e] = l[e](t), {
            c() {
                n.c(), s = _()
            },
            m(t, n) {
                o[e].m(t, n), b(t, s, n), r = !0
            },
            p(t, [r]) {
                let c = e;
                e = i(t), e === c ? o[e].p(t, r) : (et(), rt(o[c], 1, 1, (() => {
                    o[c] = null
                })), nt(), n = o[e], n ? n.p(t, r) : (n = o[e] = l[e](t), n.c()), st(n, 1), n.m(s.parentNode, s))
            },
            i(t) {
                r || (st(n), r = !0)
            },
            o(t) {
                rt(n), r = !1
            },
            d(t) {
                o[e].d(t), t && x(s)
            }
        }
    }

    function ks(t, e, n) {
        let {
            show: s
        } = e, {
            deviceList: r
        } = e, {
            showInput: l
        } = e, {
            newDevice: o = {}
        } = e, {
            settingsJson: i
        } = e, {
            percent: c
        } = e, {
            addDevInList: a = (() => {})
        } = e, {
            saveList: u = (() => {})
        } = e, {
            saveSett: d = (() => {})
        } = e, {
            sendToAllDevices: f = (t => {})
        } = e, {
            applicationReboot: p = (() => {})
        } = e;

        function g(t) {
            for (let e = 0; e < r.length; e++)
                if (t === e) {
                    r.splice(e, 1), n(1, r);
                    break
                }
        }

        function h() {
            n(0, s = !1), d(), p()
        }

        function m() {
            i.udps ? (u(), window.alert("Список устройств сохранен в память ESP. Перейдите в ручной режим для использования сохраненного списка"), p()) : l ? a() ? (u(), n(2, l = !1), p()) : n(2, l = !1) : (u(), p())
        }
        return t.$$set = t => {
            "show" in t && n(0, s = t.show), "deviceList" in t && n(1, r = t.deviceList), "showInput" in t && n(2, l = t.showInput), "newDevice" in t && n(3, o = t.newDevice), "settingsJson" in t && n(4, i = t.settingsJson), "percent" in t && n(5, c = t.percent), "addDevInList" in t && n(10, a = t.addDevInList), "saveList" in t && n(11, u = t.saveList), "saveSett" in t && n(12, d = t.saveSett), "sendToAllDevices" in t && n(6, f = t.sendToAllDevices), "applicationReboot" in t && n(13, p = t.applicationReboot)
        }, [s, r, l, o, i, c, f, g, h, m, a, u, d, p, t => g(t), function() {
            o.name = this.value, n(3, o)
        }, function() {
            o.ip = this.value, n(3, o)
        }, function() {
            o.id = this.value, n(3, o)
        }, () => n(2, l = !l), () => m(), t => (f("/reboot|"), window.alert("Все устройства будут перезагружены")), function() {
            i.udps = this.checked, n(4, i)
        }, () => h()]
    }
    class _s extends dt {
        constructor(t) {
            super(), ut(this, t, ks, ys, l, {
                show: 0,
                deviceList: 1,
                showInput: 2,
                newDevice: 3,
                settingsJson: 4,
                percent: 5,
                addDevInList: 10,
                saveList: 11,
                saveSett: 12,
                sendToAllDevices: 6,
                applicationReboot: 13
            })
        }
    }

    function js(t, e, n) {
        const s = t.slice();
        return s[43] = e[n], s[45] = n, s
    }

    function Cs(e) {
        let n, s;
        return n = new Ut({
            props: {
                title: "Загрузка..."
            }
        }), {
            c() {
                it(n.$$.fragment)
            },
            m(t, e) {
                ct(n, t, e), s = !0
            },
            p: t,
            i(t) {
                s || (st(n.$$.fragment, t), s = !0)
            },
            o(t) {
                rt(n.$$.fragment, t), s = !1
            },
            d(t) {
                at(n, t)
            }
        }
    }

    function Ms(t) {
        let e, n, s, r, l, o, i, c, a, u;
        return s = new Qt({
            props: {
                title: "Системная информация",
                $$slots: {
                    default: [Ps]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), l = new Qt({
            props: {
                title: "Системные настройки",
                $$slots: {
                    default: [Is]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), i = new Qt({
            props: {
                title: "Лог",
                $$slots: {
                    default: [qs]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), a = new Qt({
            props: {
                title: "Обновление прошивки",
                $$slots: {
                    default: [Rs]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), {
            c() {
                e = v("div"), n = v("div"), it(s.$$.fragment), r = k(), it(l.$$.fragment), o = k(), it(i.$$.fragment), c = k(), it(a.$$.fragment), M(n, "class", "grd-3col1"), M(e, "class", "my-4")
            },
            m(t, d) {
                b(t, e, d), m(e, n), ct(s, n, null), m(n, r), ct(l, n, null), m(n, o), ct(i, n, null), m(n, c), ct(a, n, null), u = !0
            },
            p(t, e) {
                const n = {};
                68 & e[0] | 32768 & e[1] && (n.$$scope = {
                    dirty: e,
                    ctx: t
                }), s.$set(n);
                const r = {};
                1267 & e[0] | 32768 & e[1] && (r.$$scope = {
                    dirty: e,
                    ctx: t
                }), l.$set(r);
                const o = {};
                8 & e[0] | 32768 & e[1] && (o.$$scope = {
                    dirty: e,
                    ctx: t
                }), i.$set(o);
                const c = {};
                6400 & e[0] | 32768 & e[1] && (c.$$scope = {
                    dirty: e,
                    ctx: t
                }), a.$set(c)
            },
            i(t) {
                u || (st(s.$$.fragment, t), st(l.$$.fragment, t), st(i.$$.fragment, t), st(a.$$.fragment, t), u = !0)
            },
            o(t) {
                rt(s.$$.fragment, t), rt(l.$$.fragment, t), rt(i.$$.fragment, t), rt(a.$$.fragment, t), u = !1
            },
            d(t) {
                t && x(e), at(s), at(l), at(i), at(a)
            }
        }
    }

    function Ls(t) {
        let e;
        return {
            c() {
                e = v("p"), e.textContent = "не подключено", M(e, "class", "text-red-500 font-bold text-sm text-center truncate")
            },
            m(t, n) {
                b(t, e, n)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function Ss(t) {
        let e;
        return {
            c() {
                e = v("p"), e.textContent = "нет сигнала", M(e, "class", "text-red-500 font-bold text-sm text-center truncate")
            },
            m(t, n) {
                b(t, e, n)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function Js(t) {
        let e;
        return {
            c() {
                e = v("p"), e.textContent = "очень низкий", M(e, "class", "text-red-500 font-bold text-sm text-center truncate")
            },
            m(t, n) {
                b(t, e, n)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function Ts(t) {
        let e;
        return {
            c() {
                e = v("p"), e.textContent = "низкий", M(e, "class", "text-yellow-500 font-bold text-sm text-center truncate")
            },
            m(t, n) {
                b(t, e, n)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function Os(t) {
        let e;
        return {
            c() {
                e = v("p"), e.textContent = "хороший", M(e, "class", "text-yellow-500 font-bold text-sm text-center truncate")
            },
            m(t, n) {
                b(t, e, n)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function Es(t) {
        let e;
        return {
            c() {
                e = v("p"), e.textContent = "очень хороший", M(e, "class", "text-green-500 font-bold text-sm text-center truncate")
            },
            m(t, n) {
                b(t, e, n)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function Ns(t) {
        let e;
        return {
            c() {
                e = v("p"), e.textContent = "отличный", M(e, "class", "text-green-500 font-bold text-sm text-center truncate")
            },
            m(t, n) {
                b(t, e, n)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function Ps(t) {
        let e, n, s, r, l, o, i, c, a, u, d, f, p, g, h, $, w, _, C, L, J, T, O, E, N, P, D, H, A, I, z, q, B, F, R, Z, U, W, Y, V, X, G, K, Q, tt, et, nt, st, rt, lt, ot, it, ct, at, ut, dt, ft, pt, gt, ht, mt, bt, xt, $t, vt, wt, yt, kt, _t, jt, Ct, Mt, Lt, St, Jt, Tt, Ot, Et, Nt, Pt, Dt, Ht, At, It, zt, qt, Bt, Ft, Rt, Zt, Ut, Wt, Yt, Vt, Xt, Gt, Kt, Qt, te, ee = t[2].bn + "",
            ne = (t[2].bt ? t[2].bt : "-") + "",
            se = t[2].bver + "",
            re = t[2].wver + "",
            le = t[2].timenow + "",
            oe = t[2].upt + "",
            ie = t[2].uptm + "",
            ce = t[2].uptw + "",
            ae = t[2].heap + "",
            ue = t[2].freeBytes + "",
            de = t[2].fl + "",
            fe = t[2].rst + "",
            pe = 0 === t[2].rssi && Ls(),
            ge = 1 === t[2].rssi && Ss(),
            he = 2 === t[2].rssi && Js(),
            me = 3 === t[2].rssi && Ts(),
            be = 4 === t[2].rssi && Os(),
            xe = 5 === t[2].rssi && Es(),
            $e = 6 === t[2].rssi && Ns();
        return {
            c() {
                e = v("div"), n = v("div"), n.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Название прошивки</p>', s = k(), r = v("div"), l = v("p"), o = y(ee), i = k(), c = v("div"), a = v("div"), a.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Время компиляции</p>', u = k(), d = v("div"), f = v("p"), p = y(ne), g = k(), h = v("div"), $ = v("div"), $.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Версия прошивки</p>', w = k(), _ = v("div"), C = v("p"), L = y(se), J = k(), T = v("div"), O = v("div"), O.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Версия веб интерфейса</p>', E = k(), N = v("div"), P = v("p"), D = y(re), H = k(), A = v("div"), I = v("div"), I.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Время на устройстве</p>', z = k(), q = v("div"), B = v("p"), F = y(le), R = k(), Z = v("div"), U = v("div"), U.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Uptime устройства</p>', W = k(), Y = v("div"), V = v("p"), X = y(oe), G = k(), K = v("div"), Q = v("div"), Q.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Uptime сессии mqtt</p>', tt = k(), et = v("div"), nt = v("p"), st = y(ie), rt = k(), lt = v("div"), ot = v("div"), ot.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Uptime сессии wifi</p>', it = k(), ct = v("div"), at = v("p"), ut = y(ce), dt = k(), ft = v("div"), pt = v("div"), pt.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Качество WiFi сигнала</p>', gt = k(), ht = v("div"), pe && pe.c(), mt = k(), ge && ge.c(), bt = k(), he && he.c(), xt = k(), me && me.c(), $t = k(), be && be.c(), vt = k(), xe && xe.c(), wt = k(), $e && $e.c(), yt = k(), kt = v("div"), _t = v("div"), _t.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Остаток RAM</p>', jt = k(), Ct = v("div"), Mt = v("p"), Lt = y(ae), St = k(), Jt = v("div"), Tt = v("div"), Tt.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Остаток flash</p>', Ot = k(), Et = v("div"), Nt = v("p"), Pt = y(ue), Dt = k(), Ht = v("div"), At = v("div"), At.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Кол-во записей на flash</p>', It = k(), zt = v("div"), qt = v("p"), Bt = y(de), Ft = k(), Rt = v("div"), Zt = v("div"), Zt.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Причина перезагрузки</p>', Ut = k(), Wt = v("div"), Yt = v("p"), Vt = y(fe), Gt = k(), Kt = v("button"), Kt.textContent = "Перезагрузить устройство", M(n, "class", "w-2/3"), M(l, "class", "text-gray-500 font-bold text-sm text-center truncate"), M(r, "class", "flex justify-center w-1/3"), M(e, "class", "flex mb-2 h-6 items-center"), M(a, "class", "w-2/3"), M(f, "class", "text-gray-500 font-bold text-sm text-center truncate"), M(d, "class", "flex justify-center w-1/3"), M(c, "class", "flex mb-2 h-6 items-center"), M($, "class", "w-2/3"), M(C, "class", "text-gray-500 font-bold text-sm text-center truncate"), M(_, "class", "flex justify-center w-1/3"), M(h, "class", "flex mb-2 h-6 items-center"), M(O, "class", "w-2/3"), M(P, "class", "text-gray-500 font-bold text-sm text-center truncate"), M(N, "class", "flex justify-center w-1/3"), M(T, "class", "flex mb-2 h-6 items-center"), M(I, "class", "w-2/3"), M(B, "class", "text-gray-500 font-bold text-sm text-center truncate"), M(q, "class", "flex justify-center w-1/3"), M(A, "class", "flex mb-2 h-6 items-center"), M(U, "class", "w-2/3"), M(V, "class", "text-gray-500 font-bold text-sm text-center truncate"), M(Y, "class", "flex justify-center w-1/3"), M(Z, "class", "flex mb-2 h-6 items-center"), M(Q, "class", "w-2/3"), M(nt, "class", "text-gray-500 font-bold text-sm text-center truncate"), M(et, "class", "flex justify-center w-1/3"), M(K, "class", "flex mb-2 h-6 items-center"), M(ot, "class", "w-2/3"), M(at, "class", "text-gray-500 font-bold text-sm text-center truncate"), M(ct, "class", "flex justify-center w-1/3"), M(lt, "class", "flex mb-2 h-6 items-center"), M(pt, "class", "w-2/3"), M(ht, "class", "flex justify-center w-1/3 text-xs sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base break-words"), M(ft, "class", "flex mb-2 h-6 items-center"), M(_t, "class", "w-2/3"), M(Mt, "class", "text-green-500 font-bold text-center truncate"), M(Ct, "class", "flex justify-center w-1/3 text-sm text-center"), M(kt, "class", "flex mb-2 h-6 items-center"), M(Tt, "class", "w-2/3"), M(Nt, "class", "text-green-500 font-bold text-center truncate"), M(Et, "class", "flex justify-center w-1/3 text-sm text-center"), M(Jt, "class", "flex mb-2 h-6 items-center"), M(At, "class", "w-2/3"), M(qt, "class", "text-green-500 font-bold text-center truncate"), M(zt, "class", "flex justify-center w-1/3 text-sm"), M(Ht, "class", "flex mb-2 h-6 items-center"), M(Zt, "class", "w-2/3"), M(Yt, "class", Xt = (t[2].rst.toString().includes("Watchdog") || t[2].rst.toString().includes("Exception") ? "text-red-500" : "text-green-500") + " font-bold text-center truncate"), M(Wt, "class", "flex justify-center w-1/3 text-sm"), M(Rt, "class", "flex mb-2 h-6 items-center"), M(Kt, "class", "btn-lg")
            },
            m(x, v) {
                b(x, e, v), m(e, n), m(e, s), m(e, r), m(r, l), m(l, o), b(x, i, v), b(x, c, v), m(c, a), m(c, u), m(c, d), m(d, f), m(f, p), b(x, g, v), b(x, h, v), m(h, $), m(h, w), m(h, _), m(_, C), m(C, L), b(x, J, v), b(x, T, v), m(T, O), m(T, E), m(T, N), m(N, P), m(P, D), b(x, H, v), b(x, A, v), m(A, I), m(A, z), m(A, q), m(q, B), m(B, F), b(x, R, v), b(x, Z, v), m(Z, U), m(Z, W), m(Z, Y), m(Y, V), m(V, X), b(x, G, v), b(x, K, v), m(K, Q), m(K, tt), m(K, et), m(et, nt), m(nt, st), b(x, rt, v), b(x, lt, v), m(lt, ot), m(lt, it), m(lt, ct), m(ct, at), m(at, ut), b(x, dt, v), b(x, ft, v), m(ft, pt), m(ft, gt), m(ft, ht), pe && pe.m(ht, null), m(ht, mt), ge && ge.m(ht, null), m(ht, bt), he && he.m(ht, null), m(ht, xt), me && me.m(ht, null), m(ht, $t), be && be.m(ht, null), m(ht, vt), xe && xe.m(ht, null), m(ht, wt), $e && $e.m(ht, null), b(x, yt, v), b(x, kt, v), m(kt, _t), m(kt, jt), m(kt, Ct), m(Ct, Mt), m(Mt, Lt), b(x, St, v), b(x, Jt, v), m(Jt, Tt), m(Jt, Ot), m(Jt, Et), m(Et, Nt), m(Nt, Pt), b(x, Dt, v), b(x, Ht, v), m(Ht, At), m(Ht, It), m(Ht, zt), m(zt, qt), m(qt, Bt), b(x, Ft, v), b(x, Rt, v), m(Rt, Zt), m(Rt, Ut), m(Rt, Wt), m(Wt, Yt), m(Yt, Vt), b(x, Gt, v), b(x, Kt, v), Qt || (te = j(Kt, "click", t[20]), Qt = !0)
            },
            p(t, e) {
                4 & e[0] && ee !== (ee = t[2].bn + "") && S(o, ee), 4 & e[0] && ne !== (ne = (t[2].bt ? t[2].bt : "-") + "") && S(p, ne), 4 & e[0] && se !== (se = t[2].bver + "") && S(L, se), 4 & e[0] && re !== (re = t[2].wver + "") && S(D, re), 4 & e[0] && le !== (le = t[2].timenow + "") && S(F, le), 4 & e[0] && oe !== (oe = t[2].upt + "") && S(X, oe), 4 & e[0] && ie !== (ie = t[2].uptm + "") && S(st, ie), 4 & e[0] && ce !== (ce = t[2].uptw + "") && S(ut, ce), 0 === t[2].rssi ? pe || (pe = Ls(), pe.c(), pe.m(ht, mt)) : pe && (pe.d(1), pe = null), 1 === t[2].rssi ? ge || (ge = Ss(), ge.c(), ge.m(ht, bt)) : ge && (ge.d(1), ge = null), 2 === t[2].rssi ? he || (he = Js(), he.c(), he.m(ht, xt)) : he && (he.d(1), he = null), 3 === t[2].rssi ? me || (me = Ts(), me.c(), me.m(ht, $t)) : me && (me.d(1), me = null), 4 === t[2].rssi ? be || (be = Os(), be.c(), be.m(ht, vt)) : be && (be.d(1), be = null), 5 === t[2].rssi ? xe || (xe = Es(), xe.c(), xe.m(ht, wt)) : xe && (xe.d(1), xe = null), 6 === t[2].rssi ? $e || ($e = Ns(), $e.c(), $e.m(ht, null)) : $e && ($e.d(1), $e = null), 4 & e[0] && ae !== (ae = t[2].heap + "") && S(Lt, ae), 4 & e[0] && ue !== (ue = t[2].freeBytes + "") && S(Pt, ue), 4 & e[0] && de !== (de = t[2].fl + "") && S(Bt, de), 4 & e[0] && fe !== (fe = t[2].rst + "") && S(Vt, fe), 4 & e[0] && Xt !== (Xt = (t[2].rst.toString().includes("Watchdog") || t[2].rst.toString().includes("Exception") ? "text-red-500" : "text-green-500") + " font-bold text-center truncate") && M(Yt, "class", Xt)
            },
            d(t) {
                t && x(e), t && x(i), t && x(c), t && x(g), t && x(h), t && x(J), t && x(T), t && x(H), t && x(A), t && x(R), t && x(Z), t && x(G), t && x(K), t && x(rt), t && x(lt), t && x(dt), t && x(ft), pe && pe.d(), ge && ge.d(), he && he.d(), me && me.d(), be && be.d(), xe && xe.d(), $e && $e.d(), t && x(yt), t && x(kt), t && x(St), t && x(Jt), t && x(Dt), t && x(Ht), t && x(Ft), t && x(Rt), t && x(Gt), t && x(Kt), Qt = !1, te()
            }
        }
    }

    function Ds(t) {
        let e, n, r, l, o, i, c, a, u, d, f, p, g, h, $, w, y, _, C;
        return {
            c() {
                e = v("div"), n = v("div"), n.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">i2c SCL gpio</p>', r = k(), l = v("div"), o = v("input"), i = k(), c = v("div"), a = v("div"), a.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">i2c SDA gpio</p>', u = k(), d = v("div"), f = v("input"), p = k(), g = v("div"), h = v("div"), h.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">i2c частота</p>', $ = k(), w = v("div"), y = v("input"), M(n, "class", "w-2/3"), M(o, "class", "ipt-rnd h-7 text-center focus:border-indigo-500"), M(o, "type", "number"), M(l, "class", "flex justify-center w-1/3"), M(e, "class", "flex mb-2 h-6 items-center"), M(a, "class", "w-2/3"), M(f, "class", "ipt-rnd h-7 text-center focus:border-indigo-500"), M(f, "type", "number"), M(d, "class", "flex justify-center w-1/3"), M(c, "class", "flex mb-2 h-6 items-center"), M(h, "class", "w-2/3"), M(y, "class", "ipt-rnd h-7 text-center focus:border-indigo-500"), M(y, "type", "number"), M(w, "class", "flex justify-center w-1/3"), M(g, "class", "flex mb-2 h-6 items-center")
            },
            m(s, x) {
                b(s, e, x), m(e, n), m(e, r), m(e, l), m(l, o), J(o, t[0].pinSCL), b(s, i, x), b(s, c, x), m(c, a), m(c, u), m(c, d), m(d, f), J(f, t[0].pinSDA), b(s, p, x), b(s, g, x), m(g, h), m(g, $), m(g, w), m(w, y), J(y, t[0].i2cFreq), _ || (C = [j(o, "input", t[33]), j(o, "change", t[34]), j(f, "input", t[35]), j(f, "change", t[36]), j(y, "input", t[37]), j(y, "change", t[38])], _ = !0)
            },
            p(t, e) {
                1 & e[0] && L(o.value) !== t[0].pinSCL && J(o, t[0].pinSCL), 1 & e[0] && L(f.value) !== t[0].pinSDA && J(f, t[0].pinSDA), 1 & e[0] && L(y.value) !== t[0].i2cFreq && J(y, t[0].i2cFreq)
            },
            d(t) {
                t && x(e), t && x(i), t && x(c), t && x(p), t && x(g), _ = !1, s(C)
            }
        }
    }

    function Hs(e) {
        let n, s, r;
        return {
            c() {
                n = v("button"), n.textContent = "Сохранить", M(n, "class", "btn-lg animate-pulse")
            },
            m(t, l) {
                b(t, n, l), s || (r = j(n, "click", e[39]), s = !0)
            },
            p: t,
            d(t) {
                t && x(n), s = !1, r()
            }
        }
    }

    function As(e) {
        let n, s, r;
        return {
            c() {
                n = v("button"), n.textContent = "Сохранить и перезагрузить", M(n, "class", "btn-lg animate-pulse")
            },
            m(t, l) {
                b(t, n, l), s || (r = j(n, "click", e[40]), s = !0)
            },
            p: t,
            d(t) {
                t && x(n), s = !1, r()
            }
        }
    }

    function Is(t) {
        let e, n, r, l, o, i, c, a, u, d, f, p, g, h, $, w, y, C, S, T, O, E, N, P, D, H, A, I, z, q, B, F, R, Z, U, W, Y, V, X, G, K, Q, tt, et, nt, st, rt, lt, ot, it, ct, at, ut, dt, ft, pt, gt, ht, mt, bt, xt, $t, vt, wt, yt, kt, _t, jt, Ct = !0 === t[0].i2c && Ds(t),
            Mt = t[1] && Hs(t),
            Lt = t[10] && As(t);
        return {
            c() {
                e = v("div"), n = v("div"), n.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Часовой пояс</p>', r = k(), l = v("div"), o = v("input"), i = k(), c = v("div"), a = v("div"), a.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Данные графиков</p>', u = k(), d = v("div"), f = v("button"), f.textContent = "Очистить", p = k(), g = v("div"), h = v("div"), h.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Время из браузера</p>', $ = k(), w = v("div"), y = v("button"), y.textContent = "Установить", C = k(), S = v("div"), T = v("div"), T.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Группа устройств</p>', O = k(), E = v("div"), N = v("input"), P = k(), D = v("div"), H = v("div"), H.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Включить лог</p>', A = k(), I = v("div"), z = v("label"), q = v("div"), B = v("input"), F = k(), R = v("div"), U = k(), W = v("div"), Y = k(), V = v("div"), X = v("div"), X.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Прием событий с других устройств</p>', G = k(), K = v("div"), Q = v("label"), tt = v("div"), et = v("input"), nt = k(), st = v("div"), lt = k(), ot = v("div"), it = k(), ct = v("div"), at = v("div"), at.innerHTML = '<p class="pr-4 text-gray-500 font-bold text-sm truncate">Перенаправление i2c</p>', ut = k(), dt = v("div"), ft = v("label"), pt = v("div"), gt = v("input"), ht = k(), mt = v("div"), xt = k(), $t = v("div"), vt = k(), Ct && Ct.c(), wt = k(), Mt && Mt.c(), yt = k(), Lt && Lt.c(), kt = _(), M(n, "class", "w-2/3"), M(o, "class", "ipt-rnd h-7 text-center focus:border-indigo-500"), M(o, "type", "number"), M(l, "class", "flex justify-center w-1/3"), M(e, "class", "flex mb-2 h-6 items-center"), M(a, "class", "w-2/3"), M(f, "class", "btn-lg h-7"), M(d, "class", "flex justify-center w-1/3"), M(c, "class", "flex mb-2 h-6 items-center"), M(h, "class", "w-2/3"), M(y, "class", "btn-lg"), M(w, "class", "flex justify-center w-1/3"), M(g, "class", "flex mb-2 h-6 items-center"), M(T, "class", "w-2/3"), M(N, "class", "ipt-rnd h-7 text-center focus:border-indigo-500"), M(E, "class", "flex justify-center w-1/3"), M(S, "class", "flex mb-2 h-6 items-center"), M(H, "class", "w-2/3"), M(B, "id", "log"), M(B, "type", "checkbox"), M(B, "class", "sr-only"), M(R, "class", Z = "block " + (t[0].log ? "bg-blue-600" : "bg-gray-600") + " w-10 h-6 rounded-full shadow-lg"), M(W, "class", "dot bg-gray-100 absolute left-1 top-1 w-4 h-4 rounded-full transition shadow-lg"), M(q, "class", "relative"), M(z, "for", "log"), M(z, "class", "items-center cursor-pointer"), M(I, "class", "flex justify-center w-1/3"), M(D, "class", "flex mb-2 h-6 items-center"), M(X, "class", "w-2/3"), M(et, "id", "mqtt"), M(et, "type", "checkbox"), M(et, "class", "sr-only"), M(st, "class", rt = "block " + (t[0].mqttin ? "bg-blue-600" : "bg-gray-600") + " w-10 h-6 rounded-full shadow-lg"), M(ot, "class", "dot bg-gray-100 absolute left-1 top-1 w-4 h-4 rounded-full transition shadow-lg"), M(tt, "class", "relative"), M(Q, "for", "mqtt"), M(Q, "class", "items-center cursor-pointer"), M(K, "class", "flex justify-center w-1/3"), M(V, "class", "flex mb-2 h-6 items-center"), M(at, "class", "w-2/3"), M(gt, "id", "i2c"), M(gt, "type", "checkbox"), M(gt, "class", "sr-only"), M(mt, "class", bt = "block " + (t[0].i2c ? "bg-blue-600" : "bg-gray-600") + " w-10 h-6 rounded-full shadow-lg"), M($t, "class", "dot bg-gray-100 absolute left-1 top-1 w-4 h-4 rounded-full transition shadow-lg"), M(pt, "class", "relative"), M(ft, "for", "i2c"), M(ft, "class", "items-center cursor-pointer"), M(dt, "class", "flex justify-center w-1/3"), M(ct, "class", "flex mb-2 h-6 items-center")
            },
            m(s, x) {
                b(s, e, x), m(e, n), m(e, r), m(e, l), m(l, o), J(o, t[0].timezone), b(s, i, x), b(s, c, x), m(c, a), m(c, u), m(c, d), m(d, f), b(s, p, x), b(s, g, x), m(g, h), m(g, $), m(g, w), m(w, y), b(s, C, x), b(s, S, x), m(S, T), m(S, O), m(S, E), m(E, N), J(N, t[0].wg), b(s, P, x), b(s, D, x), m(D, H), m(D, A), m(D, I), m(I, z), m(z, q), m(q, B), B.checked = t[0].log, m(q, F), m(q, R), m(q, U), m(q, W), b(s, Y, x), b(s, V, x), m(V, X), m(V, G), m(V, K), m(K, Q), m(Q, tt), m(tt, et), et.checked = t[0].mqttin, m(tt, nt), m(tt, st), m(tt, lt), m(tt, ot), b(s, it, x), b(s, ct, x), m(ct, at), m(ct, ut), m(ct, dt), m(dt, ft), m(ft, pt), m(pt, gt), gt.checked = t[0].i2c, m(pt, ht), m(pt, mt), m(pt, xt), m(pt, $t), b(s, vt, x), Ct && Ct.m(s, x), b(s, wt, x), Mt && Mt.m(s, x), b(s, yt, x), Lt && Lt.m(s, x), b(s, kt, x), _t || (jt = [j(o, "input", t[21]), j(o, "change", t[22]), j(f, "click", t[23]), j(y, "click", t[24]), j(N, "input", t[25]), j(N, "change", t[26]), j(B, "change", t[27]), j(B, "change", t[28]), j(et, "change", t[29]), j(et, "change", t[30]), j(gt, "change", t[31]), j(gt, "change", t[32])], _t = !0)
            },
            p(t, e) {
                1 & e[0] && L(o.value) !== t[0].timezone && J(o, t[0].timezone), 1 & e[0] && N.value !== t[0].wg && J(N, t[0].wg), 1 & e[0] && (B.checked = t[0].log), 1 & e[0] && Z !== (Z = "block " + (t[0].log ? "bg-blue-600" : "bg-gray-600") + " w-10 h-6 rounded-full shadow-lg") && M(R, "class", Z), 1 & e[0] && (et.checked = t[0].mqttin), 1 & e[0] && rt !== (rt = "block " + (t[0].mqttin ? "bg-blue-600" : "bg-gray-600") + " w-10 h-6 rounded-full shadow-lg") && M(st, "class", rt), 1 & e[0] && (gt.checked = t[0].i2c), 1 & e[0] && bt !== (bt = "block " + (t[0].i2c ? "bg-blue-600" : "bg-gray-600") + " w-10 h-6 rounded-full shadow-lg") && M(mt, "class", bt), !0 === t[0].i2c ? Ct ? Ct.p(t, e) : (Ct = Ds(t), Ct.c(), Ct.m(wt.parentNode, wt)) : Ct && (Ct.d(1), Ct = null), t[1] ? Mt ? Mt.p(t, e) : (Mt = Hs(t), Mt.c(), Mt.m(yt.parentNode, yt)) : Mt && (Mt.d(1), Mt = null), t[10] ? Lt ? Lt.p(t, e) : (Lt = As(t), Lt.c(), Lt.m(kt.parentNode, kt)) : Lt && (Lt.d(1), Lt = null)
            },
            d(t) {
                t && x(e), t && x(i), t && x(c), t && x(p), t && x(g), t && x(C), t && x(S), t && x(P), t && x(D), t && x(Y), t && x(V), t && x(it), t && x(ct), t && x(vt), Ct && Ct.d(t), t && x(wt), Mt && Mt.d(t), t && x(yt), Lt && Lt.d(t), t && x(kt), _t = !1, s(jt)
            }
        }
    }

    function zs(t) {
        let e, n, s, r = t[43].msg + "";
        return {
            c() {
                e = v("div"), n = y(r), M(e, "class", s = t[43].msg.toString().includes("[E]") || t[43].msg.toString().includes("[!]") ? "text-xs text-red-500" : "text-xs text-black")
            },
            m(t, s) {
                b(t, e, s), m(e, n)
            },
            p(t, l) {
                8 & l[0] && r !== (r = t[43].msg + "") && S(n, r), 8 & l[0] && s !== (s = t[43].msg.toString().includes("[E]") || t[43].msg.toString().includes("[!]") ? "text-xs text-red-500" : "text-xs text-black") && M(e, "class", s)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function qs(t) {
        let e, n = t[3],
            s = [];
        for (let e = 0; e < n.length; e += 1) s[e] = zs(js(t, n, e));
        return {
            c() {
                e = v("div");
                for (let t = 0; t < s.length; t += 1) s[t].c();
                M(e, "class", "h-96 overflow-y-auto")
            },
            m(t, n) {
                b(t, e, n);
                for (let t = 0; t < s.length; t += 1) s[t] && s[t].m(e, null)
            },
            p(t, r) {
                if (8 & r[0]) {
                    let l;
                    for (n = t[3], l = 0; l < n.length; l += 1) {
                        const o = js(t, n, l);
                        s[l] ? s[l].p(o, r) : (s[l] = zs(o), s[l].c(), s[l].m(e, null))
                    }
                    for (; l < s.length; l += 1) s[l].d(1);
                    s.length = n.length
                }
            },
            d(t) {
                t && x(e), $(s, t)
            }
        }
    }

    function Bs(e) {
        let n;
        return {
            c() {
                n = v("p"), n.textContent = "Файл не выбран", M(n, "class", "text-gray-500 text-sm mb-2")
            },
            m(t, e) {
                b(t, n, e)
            },
            p: t,
            d(t) {
                t && x(n)
            }
        }
    }

    function Fs(t) {
        let e, n, s, r;
        return {
            c() {
                e = v("p"), n = y("Выбранный файл: "), s = v("strong"), r = y(t[12]), M(e, "class", "text-gray-500 text-sm mb-2")
            },
            m(t, l) {
                b(t, e, l), m(e, n), m(e, s), m(s, r)
            },
            p(t, e) {
                4096 & e[0] && S(r, t[12])
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function Rs(t) {
        let e, n, r, l, o, i, c, a, u, d;

        function f(t, e) {
            return t[12] ? Fs : Bs
        }
        let p = f(t),
            g = p(t);
        return {
            c() {
                e = v("div"), e.textContent = "Перетащите файл firmawre.bin или littlefs.bin сюда или нажмите кнопку Открыть файл", n = k(), g.c(), r = k(), l = v("input"), o = k(), i = v("button"), i.textContent = "Открыть файл", c = k(), a = v("button"), a.textContent = "Обновить прошивку", M(e, "class", "drop-zone mb-2"), M(l, "type", "file"), M(l, "accept", ".bin"), M(l, "class", "hidden"), M(i, "class", "btn-lg mb-2"), M(a, "class", "btn-lg")
            },
            m(s, f) {
                var p;
                b(s, e, f), b(s, n, f), g.m(s, f), b(s, r, f), b(s, l, f), t[41](l), b(s, o, f), b(s, i, f), b(s, c, f), b(s, a, f), u || (d = [j(e, "dragover", C(t[17])), j(e, "dragover", (p = t[18], function(t) {
                    return t.stopPropagation(), p.call(this, t)
                })), j(e, "drop", C(t[19])), j(e, "drop", t[13]), j(l, "change", t[14]), j(i, "click", t[15]), j(a, "click", t[42])], u = !0)
            },
            p(t, e) {
                p === (p = f(t)) && g ? g.p(t, e) : (g.d(1), g = p(t), g && (g.c(), g.m(r.parentNode, r)))
            },
            d(f) {
                f && x(e), f && x(n), g.d(f), f && x(r), f && x(l), t[41](null), f && x(o), f && x(i), f && x(c), f && x(a), u = !1, s(d)
            }
        }
    }

    function Zs(t) {
        let e, n, s, r;
        const l = [Ms, Cs],
            o = [];

        function i(t, e) {
            return t[9] ? 0 : 1
        }
        return e = i(t), n = o[e] = l[e](t), {
            c() {
                n.c(), s = _()
            },
            m(t, n) {
                o[e].m(t, n), b(t, s, n), r = !0
            },
            p(t, r) {
                let c = e;
                e = i(t), e === c ? o[e].p(t, r) : (et(), rt(o[c], 1, 1, (() => {
                    o[c] = null
                })), nt(), n = o[e], n ? n.p(t, r) : (n = o[e] = l[e](t), n.c()), st(n, 1), n.m(s.parentNode, s))
            },
            i(t) {
                r || (st(n), r = !0)
            },
            o(t) {
                rt(n), r = !1
            },
            d(t) {
                o[e].d(t), t && x(s)
            }
        }
    }

    function Us(t, e, n) {
        let {
            errorsJson: s
        } = e, {
            coreMessages: r
        } = e, {
            settingsJson: l
        } = e, {
            saveSett: o = (() => {})
        } = e, {
            cleanLogs: i = (() => {})
        } = e, {
            rebootEsp: c = (() => {})
        } = e, {
            setBrowserTime: a = (() => {})
        } = e, {
            uploadFirmware: u = (() => {})
        } = e, {
            onFileSelected: d
        } = e, {
            show: f
        } = e, {
            paramsBeenChanged: p = !1
        } = e, g = !1, h = null, m = "";
        return t.$$set = t => {
            "errorsJson" in t && n(2, s = t.errorsJson), "coreMessages" in t && n(3, r = t.coreMessages), "settingsJson" in t && n(0, l = t.settingsJson), "saveSett" in t && n(4, o = t.saveSett), "cleanLogs" in t && n(5, i = t.cleanLogs), "rebootEsp" in t && n(6, c = t.rebootEsp), "setBrowserTime" in t && n(7, a = t.setBrowserTime), "uploadFirmware" in t && n(8, u = t.uploadFirmware), "onFileSelected" in t && n(16, d = t.onFileSelected), "show" in t && n(9, f = t.show), "paramsBeenChanged" in t && n(1, p = t.paramsBeenChanged)
        }, [l, p, s, r, o, i, c, a, u, f, g, h, m, function(t) {
            const e = t.dataTransfer.files[0];
            e && (n(12, m = e.name), d(e))
        }, function() {
            const t = h.files[0];
            t && (n(12, m = t.name), d(t))
        }, function() {
            h.click()
        }, d, function(e) {
            I.call(this, t, e)
        }, function(e) {
            I.call(this, t, e)
        }, function(e) {
            I.call(this, t, e)
        }, () => c(), function() {
            l.timezone = L(this.value), n(0, l)
        }, () => n(1, p = !0), () => i(), () => a(), function() {
            l.wg = this.value, n(0, l)
        }, () => n(10, g = !0), function() {
            l.log = this.checked, n(0, l)
        }, () => n(1, p = !0), function() {
            l.mqttin = this.checked, n(0, l)
        }, () => n(10, g = !0), function() {
            l.i2c = this.checked, n(0, l)
        }, () => n(10, g = !0), function() {
            l.pinSCL = L(this.value), n(0, l)
        }, () => n(10, g = !0), function() {
            l.pinSDA = L(this.value), n(0, l)
        }, () => n(10, g = !0), function() {
            l.i2cFreq = L(this.value), n(0, l)
        }, () => n(10, g = !0), () => (o(), n(1, p = !1)), () => (o(), c(), n(10, g = !1)), function(t) {
            q[t ? "unshift" : "push"]((() => {
                h = t, n(11, h)
            }))
        }, () => u()]
    }
    class Ws extends dt {
        constructor(t) {
            super(), ut(this, t, Us, Zs, l, {
                errorsJson: 2,
                coreMessages: 3,
                settingsJson: 0,
                saveSett: 4,
                cleanLogs: 5,
                rebootEsp: 6,
                setBrowserTime: 7,
                uploadFirmware: 8,
                onFileSelected: 16,
                show: 9,
                paramsBeenChanged: 1
            }, null, [-1, -1])
        }
    }

    function Ys(e) {
        let n, s;
        return n = new Ut({
            props: {
                title: "Загрузка..."
            }
        }), {
            c() {
                it(n.$$.fragment)
            },
            m(t, e) {
                ct(n, t, e), s = !0
            },
            p: t,
            i(t) {
                s || (st(n.$$.fragment, t), s = !0)
            },
            o(t) {
                rt(n.$$.fragment, t), s = !1
            },
            d(t) {
                at(n, t)
            }
        }
    }

    function Vs(e) {
        let n, s, r;
        return {
            c() {
                n = v("div"), s = v("iframe"), i(s.src, r = `http://${e[1]}/edit`) || M(s, "src", r), M(s, "title", "Файловой менеджер IoTManager"), M(s, "width", "100%"), M(s, "height", "100vh"), M(s, "frameborder", "0"), M(s, "class", "fullscreen-iframe"), M(n, "class", "edit-page")
            },
            m(t, e) {
                b(t, n, e), m(n, s)
            },
            p(t, e) {
                2 & e && !i(s.src, r = `http://${t[1]}/edit`) && M(s, "src", r)
            },
            i: t,
            o: t,
            d(t) {
                t && x(n)
            }
        }
    }

    function Xs(t) {
        let e, n, s, r;
        const l = [Vs, Ys],
            o = [];

        function i(t, e) {
            return t[0] ? 0 : 1
        }
        return e = i(t), n = o[e] = l[e](t), {
            c() {
                n.c(), s = _()
            },
            m(t, n) {
                o[e].m(t, n), b(t, s, n), r = !0
            },
            p(t, [r]) {
                let c = e;
                e = i(t), e === c ? o[e].p(t, r) : (et(), rt(o[c], 1, 1, (() => {
                    o[c] = null
                })), nt(), n = o[e], n ? n.p(t, r) : (n = o[e] = l[e](t), n.c()), st(n, 1), n.m(s.parentNode, s))
            },
            i(t) {
                r || (st(n), r = !0)
            },
            o(t) {
                rt(n), r = !1
            },
            d(t) {
                o[e].d(t), t && x(s)
            }
        }
    }

    function Gs(t, e, n) {
        let {
            show: s = !1
        } = e, {
            espIP: r = ""
        } = e;
        return t.$$set = t => {
            "show" in t && n(0, s = t.show), "espIP" in t && n(1, r = t.espIP)
        }, [s, r]
    }
    class Ks extends dt {
        constructor(t) {
            super(), ut(this, t, Gs, Xs, l, {
                show: 0,
                espIP: 1
            })
        }
    }
    var Qs = {
        ru: {
            "login.email": "Email",
            "login.pass": "Пароль",
            "login.login": "Вход",
            "profile.update": "Собрать прошивку",
            ok_success: "Задача добавлена",
            err_order_exist: "Ваша задача выполняется! Cледующию задачу можно будет запустить после завершения",
            err_add_order: "Ошибка отправки задачи",
            err_of_login: "Ошибка входа в систему",
            err_user_not_exist: "Такой пользователь не был зарегестрирован",
            err_pass: "Неправильный пароль",
            err_empty_fullname: "Пустое поле имени",
            err_empty_user: "Пустое поле Email адреса",
            err_not_email: "Неправильно введен Email",
            err_pass_lenth: "Пароль должен быть от 4 до 10 символов",
            ok_success_login: "Вы вошли в систему",
            "profile.exit": "Выйти"
        },
        en: {
            "login.email": "Email",
            "login.pass": "Password",
            "login.login": "Login",
            "profile.update": "Собрать прошивку",
            ok_success: "Задача добавлена",
            err_order_exist: "Ваша задача выполняется! Cледующию задачу можно будет запустить после завершения",
            err_add_order: "Ошибка отправки задачи",
            err_of_login: "Ошибка входа в систему",
            err_user_not_exist: "Такой пользователь не был зарегестрирован",
            err_pass: "Неправильный пароль",
            err_empty_fullname: "Пустое поле имени",
            err_empty_user: "Пустое поле Email адреса",
            err_not_email: "Неправильно введен Email",
            err_pass_lenth: "Пароль должен быть от 4 до 10 символов",
            ok_success_login: "Вы вошли в систему",
            "profile.exit": "Выйти"
        }
    };
    const tr = function(e, n, l) {
        const o = !Array.isArray(e),
            i = o ? [e] : e,
            a = n.length < 2;
        return u = e => {
            let l = !1;
            const u = [];
            let d = 0,
                f = t;
            const p = () => {
                    if (d) return;
                    f();
                    const s = n(o ? u[0] : u);
                    a ? e(s) : f = r(s) ? s : t
                },
                g = i.map(((t, e) => c(t, (t => {
                    u[e] = t, d &= ~(1 << e), l && p()
                }), (() => {
                    d |= 1 << e
                }))));
            return l = !0, p(), () => {
                s(g), f(), l = !1
            }
        }, {
            subscribe: pt(void 0, u).subscribe
        };
        var u
    }(pt("ru"), (t => (e, n = {}) => function(t, e, n) {
        if (!e) throw new Error("no key provided to $t()");
        if (!t) throw new Error(`no translation for key "${e}"`);
        let s = Qs[t][e];
        if (!s) throw new Error(`no translation found for ${t}.${e}`);
        return Object.keys(n).map((t => {
            const e = new RegExp(`{{${t}}}`, "g");
            s = s.replace(e, n[t])
        })), s
    }(t, e, n)));

    function er(t, e, n) {
        const s = t.slice();
        return s[10] = e[n], s[12] = n, s
    }

    function nr(e) {
        let n, s;
        return n = new Ut({
            props: {
                title: "Загрузка..."
            }
        }), {
            c() {
                it(n.$$.fragment)
            },
            m(t, e) {
                ct(n, t, e), s = !0
            },
            p: t,
            i(t) {
                s || (st(n.$$.fragment, t), s = !0)
            },
            o(t) {
                rt(n.$$.fragment, t), s = !1
            },
            d(t) {
                at(n, t)
            }
        }
    }

    function sr(t) {
        let e, n, s, r;
        const l = [lr, rr],
            o = [];

        function i(t, e) {
            return t[1] ? 0 : 1
        }
        return e = i(t), n = o[e] = l[e](t), {
            c() {
                n.c(), s = _()
            },
            m(t, n) {
                o[e].m(t, n), b(t, s, n), r = !0
            },
            p(t, r) {
                let c = e;
                e = i(t), e === c ? o[e].p(t, r) : (et(), rt(o[c], 1, 1, (() => {
                    o[c] = null
                })), nt(), n = o[e], n ? n.p(t, r) : (n = o[e] = l[e](t), n.c()), st(n, 1), n.m(s.parentNode, s))
            },
            i(t) {
                r || (st(n), r = !0)
            },
            o(t) {
                rt(n), r = !1
            },
            d(t) {
                o[e].d(t), t && x(s)
            }
        }
    }

    function rr(e) {
        let n, s, r, l;
        return r = new Qt({
            props: {
                title: "Сервер недоступен"
            }
        }), {
            c() {
                n = v("div"), s = v("div"), it(r.$$.fragment), M(s, "class", "grd-1col1"), M(n, "class", "my-4")
            },
            m(t, e) {
                b(t, n, e), m(n, s), ct(r, s, null), l = !0
            },
            p: t,
            i(t) {
                l || (st(r.$$.fragment, t), l = !0)
            },
            o(t) {
                rt(r.$$.fragment, t), l = !1
            },
            d(t) {
                t && x(n), at(r)
            }
        }
    }

    function lr(e) {
        let n, r, l, o, i, c, a, u, d, f, p, g, h, w, _, C, L, T, O, E, N = e[4]("login.email") + "",
            P = e[4]("login.pass") + "",
            D = e[4]("login.login") + "",
            H = e[3],
            A = [];
        for (let t = 0; t < H.length; t += 1) A[t] = or(er(e, H, t));
        return {
            c() {
                n = v("div"), r = v("div"), l = v("form"), o = v("div"), i = v("label"), c = y(N), a = k(), u = v("input"), d = k(), f = v("div"), p = v("label"), g = y(P), h = k(), w = v("input"), _ = k();
                for (let t = 0; t < A.length; t += 1) A[t].c();
                C = k(), L = v("button"), T = y(D), M(i, "class", "block text-gray-700 text-sm font-bold mb-2"), M(i, "for", "username"), M(u, "class", "shadow appearance-none border rounded w-full h-10 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"), M(u, "id", "username"), M(u, "type", "text"), M(u, "placeholder", "someone@example.com"), M(o, "class", "mb-4"), M(p, "class", "block text-gray-700 text-sm font-bold mb-2"), M(p, "for", "password"), M(w, "class", "shadow appearance-none border rounded w-full h-10 px-3 text-gray-700 mb-0 leading-tight focus:outline-none focus:shadow-outline"), M(w, "id", "password"), M(w, "type", "password"), M(w, "placeholder", "**********"), M(f, "class", "mb-6"), M(L, "class", "btn-lg mt-6"), M(l, "class", "bg-white shadow-2xl rounded-xl px-8 pt-6 pb-8 mb-4"), M(r, "class", "w-full max-w-lg"), M(n, "class", "flex h-screen m-2 md:m-4 lg:m-8 items-start justify-center")
            },
            m(t, s) {
                b(t, n, s), m(n, r), m(r, l), m(l, o), m(o, i), m(i, c), m(o, a), m(o, u), J(u, e[2].username), m(l, d), m(l, f), m(f, p), m(p, g), m(f, h), m(f, w), J(w, e[2].password), m(l, _);
                for (let t = 0; t < A.length; t += 1) A[t] && A[t].m(l, null);
                m(l, C), m(l, L), m(L, T), O || (E = [j(u, "input", e[6]), j(w, "input", e[7]), j(L, "click", e[8])], O = !0)
            },
            p(t, e) {
                if (16 & e && N !== (N = t[4]("login.email") + "") && S(c, N), 4 & e && u.value !== t[2].username && J(u, t[2].username), 16 & e && P !== (P = t[4]("login.pass") + "") && S(g, P), 4 & e && w.value !== t[2].password && J(w, t[2].password), 24 & e) {
                    let n;
                    for (H = t[3], n = 0; n < H.length; n += 1) {
                        const s = er(t, H, n);
                        A[n] ? A[n].p(s, e) : (A[n] = or(s), A[n].c(), A[n].m(l, C))
                    }
                    for (; n < A.length; n += 1) A[n].d(1);
                    A.length = H.length
                }
                16 & e && D !== (D = t[4]("login.login") + "") && S(T, D)
            },
            i: t,
            o: t,
            d(t) {
                t && x(n), $(A, t), O = !1, s(E)
            }
        }
    }

    function or(t) {
        let e, n, s = t[4](t[10].msg) + "";
        return {
            c() {
                e = v("p"), n = y(s), M(e, "class", "text-red-500 p-0 m-0 font-bold text-xs italic")
            },
            m(t, s) {
                b(t, e, s), m(e, n)
            },
            p(t, e) {
                24 & e && s !== (s = t[4](t[10].msg) + "") && S(n, s)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function ir(t) {
        let e, n, s, r;
        const l = [sr, nr],
            o = [];

        function i(t, e) {
            return t[0] ? 0 : 1
        }
        return e = i(t), n = o[e] = l[e](t), {
            c() {
                n.c(), s = _()
            },
            m(t, n) {
                o[e].m(t, n), b(t, s, n), r = !0
            },
            p(t, [r]) {
                let c = e;
                e = i(t), e === c ? o[e].p(t, r) : (et(), rt(o[c], 1, 1, (() => {
                    o[c] = null
                })), nt(), n = o[e], n ? n.p(t, r) : (n = o[e] = l[e](t), n.c()), st(n, 1), n.m(s.parentNode, s))
            },
            i(t) {
                r || (st(n), r = !0)
            },
            o(t) {
                rt(n), r = !1
            },
            d(t) {
                o[e].d(t), t && x(s)
            }
        }
    }

    function cr(t, e, n) {
        let s;
        a(t, tr, (t => n(4, s = t)));
        let {
            show: r = !0
        } = e, {
            serverOnline: l
        } = e, o = {}, i = [];
        const c = async t => {
            n(3, i = []);
            try {
                let e = await fetch("https://portal.iotmanager.org/api/auth/login", {
                    mode: "cors",
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(t)
                });
                const s = await e.json();
                e.ok ? (n(3, i = [{
                    msg: "ok_success_login"
                }]), u(s.message)) : n(3, i = s.message)
            } catch (t) {}
        }, u = async t => {
            dn.set("token_iotm2", t), Mt.goto("/profile"), location.reload()
        };
        return t.$$set = t => {
            "show" in t && n(0, r = t.show), "serverOnline" in t && n(1, l = t.serverOnline)
        }, [r, l, o, i, s, c, function() {
            o.username = this.value, n(2, o)
        }, function() {
            o.password = this.value, n(2, o)
        }, () => c(o)]
    }
    class ar extends dt {
        constructor(t) {
            super(), ut(this, t, cr, ir, l, {
                show: 0,
                serverOnline: 1
            })
        }
    }

    function ur(t, e, n) {
        const s = t.slice();
        return s[31] = e[n], s[33] = n, s
    }

    function dr(t, e, n) {
        const s = t.slice();
        return s[34] = e[n], s[33] = n, s
    }

    function fr(t, e, n) {
        const s = t.slice();
        return s[36] = e[n], s[37] = e, s[33] = n, s
    }

    function pr(t, e, n) {
        const s = t.slice();
        return s[36] = e[n], s[38] = e, s[33] = n, s
    }

    function gr(t, e, n) {
        const s = t.slice();
        return s[36] = e[n], s[39] = e, s[33] = n, s
    }

    function hr(t, e, n) {
        const s = t.slice();
        return s[36] = e[n], s[40] = e, s[33] = n, s
    }

    function mr(e) {
        let n, s;
        return n = new Ut({
            props: {
                title: "Загрузка..."
            }
        }), {
            c() {
                it(n.$$.fragment)
            },
            m(t, e) {
                ct(n, t, e), s = !0
            },
            p: t,
            i(t) {
                s || (st(n.$$.fragment, t), s = !0)
            },
            o(t) {
                rt(n.$$.fragment, t), s = !1
            },
            d(t) {
                at(n, t)
            }
        }
    }

    function br(t) {
        let e, n, s, r;
        const l = [$r, xr],
            o = [];

        function i(t, e) {
            return t[5] ? 0 : 1
        }
        return e = i(t), n = o[e] = l[e](t), {
            c() {
                n.c(), s = _()
            },
            m(t, n) {
                o[e].m(t, n), b(t, s, n), r = !0
            },
            p(t, r) {
                let c = e;
                e = i(t), e === c ? o[e].p(t, r) : (et(), rt(o[c], 1, 1, (() => {
                    o[c] = null
                })), nt(), n = o[e], n ? n.p(t, r) : (n = o[e] = l[e](t), n.c()), st(n, 1), n.m(s.parentNode, s))
            },
            i(t) {
                r || (st(n), r = !0)
            },
            o(t) {
                rt(n), r = !1
            },
            d(t) {
                o[e].d(t), t && x(s)
            }
        }
    }

    function xr(e) {
        let n, s, r, l;
        return r = new Qt({
            props: {
                title: "Сервер недоступен"
            }
        }), {
            c() {
                n = v("div"), s = v("div"), it(r.$$.fragment), M(s, "class", "grd-1col1"), M(n, "class", "my-4")
            },
            m(t, e) {
                b(t, n, e), m(n, s), ct(r, s, null), l = !0
            },
            p: t,
            i(t) {
                l || (st(r.$$.fragment, t), l = !0)
            },
            o(t) {
                rt(r.$$.fragment, t), l = !1
            },
            d(t) {
                t && x(n), at(r)
            }
        }
    }

    function $r(t) {
        let e, n, s = t[4] && t[2] && t[0] && vr(t);
        return {
            c() {
                s && s.c(), e = _()
            },
            m(t, r) {
                s && s.m(t, r), b(t, e, r), n = !0
            },
            p(t, n) {
                t[4] && t[2] && t[0] ? s ? (s.p(t, n), 21 & n[0] && st(s, 1)) : (s = vr(t), s.c(), st(s, 1), s.m(e.parentNode, e)) : s && (et(), rt(s, 1, 1, (() => {
                    s = null
                })), nt())
            },
            i(t) {
                n || (st(s), n = !0)
            },
            o(t) {
                rt(s), n = !1
            },
            d(t) {
                s && s.d(t), t && x(e)
            }
        }
    }

    function vr(t) {
        let e, n, s, r;
        return s = new Qt({
            props: {
                title: "",
                $$slots: {
                    default: [zr]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), {
            c() {
                e = v("div"), n = v("div"), it(s.$$.fragment), M(n, "class", "grd-1col1"), M(e, "class", "my-4")
            },
            m(t, l) {
                b(t, e, l), m(e, n), ct(s, n, null), r = !0
            },
            p(t, e) {
                const n = {};
                2013 & e[0] | 1024 & e[1] && (n.$$scope = {
                    dirty: e,
                    ctx: t
                }), s.$set(n)
            },
            i(t) {
                r || (st(s.$$.fragment, t), r = !0)
            },
            o(t) {
                rt(s.$$.fragment, t), r = !1
            },
            d(t) {
                t && x(e), at(s)
            }
        }
    }

    function wr(t) {
        let e, n, s, r, l, o, i = t[36].path.substring(t[36].path.lastIndexOf("/") + 1, t[36].path.length) + "";

        function c() {
            return t[16](t[36], t[40], t[33])
        }
        return {
            c() {
                e = v("div"), n = v("p"), s = y(i), M(n, "class", r = (t[36].active ? "bg-green-100" : "") + " cursor-pointer select-none text-black text-xs font-medium mr-2 px-0.5 py-0.5 rounded text-center")
            },
            m(t, r) {
                b(t, e, r), m(e, n), m(n, s), l || (o = j(n, "click", c), l = !0)
            },
            p(e, l) {
                t = e, 1 & l[0] && i !== (i = t[36].path.substring(t[36].path.lastIndexOf("/") + 1, t[36].path.length) + "") && S(s, i), 1 & l[0] && r !== (r = (t[36].active ? "bg-green-100" : "") + " cursor-pointer select-none text-black text-xs font-medium mr-2 px-0.5 py-0.5 rounded text-center") && M(n, "class", r)
            },
            d(t) {
                t && x(e), l = !1, o()
            }
        }
    }

    function yr(t) {
        let e, n = t[4][t[36].path]?.usedLibs[t[0].projectProp.platformio.default_envs] && wr(t);
        return {
            c() {
                n && n.c(), e = _()
            },
            m(t, s) {
                n && n.m(t, s), b(t, e, s)
            },
            p(t, s) {
                t[4][t[36].path]?.usedLibs[t[0].projectProp.platformio.default_envs] ? n ? n.p(t, s) : (n = wr(t), n.c(), n.m(e.parentNode, e)) : n && (n.d(1), n = null)
            },
            d(t) {
                n && n.d(t), t && x(e)
            }
        }
    }

    function kr(t) {
        let e, n, s, r, l, o, i = t[36].path.substring(t[36].path.lastIndexOf("/") + 1, t[36].path.length) + "";

        function c() {
            return t[17](t[36], t[39], t[33])
        }
        return {
            c() {
                e = v("div"), n = v("p"), s = y(i), M(n, "class", r = (t[36].active ? "bg-green-100" : "") + " cursor-pointer select-none text-black text-xs font-medium mr-2 px-0.5 py-0.5 rounded text-center")
            },
            m(t, r) {
                b(t, e, r), m(e, n), m(n, s), l || (o = j(n, "click", c), l = !0)
            },
            p(e, l) {
                t = e, 1 & l[0] && i !== (i = t[36].path.substring(t[36].path.lastIndexOf("/") + 1, t[36].path.length) + "") && S(s, i), 1 & l[0] && r !== (r = (t[36].active ? "bg-green-100" : "") + " cursor-pointer select-none text-black text-xs font-medium mr-2 px-0.5 py-0.5 rounded text-center") && M(n, "class", r)
            },
            d(t) {
                t && x(e), l = !1, o()
            }
        }
    }

    function _r(t) {
        let e, n = t[4][t[36].path]?.usedLibs[t[0].projectProp.platformio.default_envs] && kr(t);
        return {
            c() {
                n && n.c(), e = _()
            },
            m(t, s) {
                n && n.m(t, s), b(t, e, s)
            },
            p(t, s) {
                t[4][t[36].path]?.usedLibs[t[0].projectProp.platformio.default_envs] ? n ? n.p(t, s) : (n = kr(t), n.c(), n.m(e.parentNode, e)) : n && (n.d(1), n = null)
            },
            d(t) {
                n && n.d(t), t && x(e)
            }
        }
    }

    function jr(t) {
        let e, n, s, r, l, o, i = t[36].path.substring(t[36].path.lastIndexOf("/") + 1, t[36].path.length) + "";

        function c() {
            return t[18](t[36], t[38], t[33])
        }
        return {
            c() {
                e = v("div"), n = v("p"), s = y(i), M(n, "class", r = (t[36].active ? "bg-green-100" : "") + " cursor-pointer select-none text-black text-xs font-medium mr-2 px-0.5 py-0.5 rounded text-center")
            },
            m(t, r) {
                b(t, e, r), m(e, n), m(n, s), l || (o = j(n, "click", c), l = !0)
            },
            p(e, l) {
                t = e, 1 & l[0] && i !== (i = t[36].path.substring(t[36].path.lastIndexOf("/") + 1, t[36].path.length) + "") && S(s, i), 1 & l[0] && r !== (r = (t[36].active ? "bg-green-100" : "") + " cursor-pointer select-none text-black text-xs font-medium mr-2 px-0.5 py-0.5 rounded text-center") && M(n, "class", r)
            },
            d(t) {
                t && x(e), l = !1, o()
            }
        }
    }

    function Cr(t) {
        let e, n = t[4][t[36].path]?.usedLibs[t[0].projectProp.platformio.default_envs] && jr(t);
        return {
            c() {
                n && n.c(), e = _()
            },
            m(t, s) {
                n && n.m(t, s), b(t, e, s)
            },
            p(t, s) {
                t[4][t[36].path]?.usedLibs[t[0].projectProp.platformio.default_envs] ? n ? n.p(t, s) : (n = jr(t), n.c(), n.m(e.parentNode, e)) : n && (n.d(1), n = null)
            },
            d(t) {
                n && n.d(t), t && x(e)
            }
        }
    }

    function Mr(t) {
        let e, n, s, r, l, o, i, c = t[36].path.substring(t[36].path.lastIndexOf("/") + 1, t[36].path.length) + "";

        function a() {
            return t[19](t[36], t[37], t[33])
        }
        return {
            c() {
                e = v("div"), n = v("p"), s = y(c), l = k(), M(n, "class", r = (t[36].active ? "bg-green-100" : "") + " cursor-pointer select-none text-black text-xs font-medium mr-2 px-0.5 py-0.5 rounded text-center")
            },
            m(t, r) {
                b(t, e, r), m(e, n), m(n, s), m(e, l), o || (i = j(n, "click", a), o = !0)
            },
            p(e, l) {
                t = e, 1 & l[0] && c !== (c = t[36].path.substring(t[36].path.lastIndexOf("/") + 1, t[36].path.length) + "") && S(s, c), 1 & l[0] && r !== (r = (t[36].active ? "bg-green-100" : "") + " cursor-pointer select-none text-black text-xs font-medium mr-2 px-0.5 py-0.5 rounded text-center") && M(n, "class", r)
            },
            d(t) {
                t && x(e), o = !1, i()
            }
        }
    }

    function Lr(t) {
        let e, n = t[4][t[36].path]?.usedLibs[t[0].projectProp.platformio.default_envs] && Mr(t);
        return {
            c() {
                n && n.c(), e = _()
            },
            m(t, s) {
                n && n.m(t, s), b(t, e, s)
            },
            p(t, s) {
                t[4][t[36].path]?.usedLibs[t[0].projectProp.platformio.default_envs] ? n ? n.p(t, s) : (n = Mr(t), n.c(), n.m(e.parentNode, e)) : n && (n.d(1), n = null)
            },
            d(t) {
                n && n.d(t), t && x(e)
            }
        }
    }

    function Sr(t) {
        let e, n, s = t[10](t[34].msg) + "";
        return {
            c() {
                e = v("p"), n = y(s), M(e, "class", "text-red-500 p-0 m-0 font-bold text-xs italic")
            },
            m(t, s) {
                b(t, e, s), m(e, n)
            },
            p(t, e) {
                1280 & e[0] && s !== (s = t[10](t[34].msg) + "") && S(n, s)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function Jr(t) {
        let e, n, s, r, l, o, i = 0 === t[3].build && 0 === t[3].fs ? "успешно" : "ошибка";
        return {
            c() {
                e = v("div"), n = v("p"), n.textContent = "Статус последнего обновления:", s = k(), r = v("p"), l = y(i), M(n, "class", "text-center text-gray-500 font-bold truncate"), M(r, "class", o = (0 === t[3].build && 0 === t[3].fs ? "text-green-500" : "text-red-500") + " text-center font-bold truncate"), M(e, "class", "grid grid-cols-2 mb-4")
            },
            m(t, o) {
                b(t, e, o), m(e, n), m(e, s), m(e, r), m(r, l)
            },
            p(t, e) {
                8 & e[0] && i !== (i = 0 === t[3].build && 0 === t[3].fs ? "успешно" : "ошибка") && S(l, i), 8 & e[0] && o !== (o = (0 === t[3].build && 0 === t[3].fs ? "text-green-500" : "text-red-500") + " text-center font-bold truncate") && M(r, "class", o)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function Tr(t) {
        let e, n, s, r, l, o = t[9],
            i = [];
        for (let e = 0; e < o.length; e += 1) i[e] = Ir(ur(t, o, e));
        const c = t => rt(i[t], 1, 1, (() => {
            i[t] = null
        }));
        return {
            c() {
                e = v("table"), n = v("thead"), n.innerHTML = '<tr class="txt-sz txt-pad"><th class="tbl-hd">Название</th> \n                    <th class="tbl-hd">Версия</th> \n                    <th class="tbl-hd">Время</th> \n\n                    <th class="tbl-hd">Подготовка</th> \n                    <th class="tbl-hd">Сборка build</th> \n                    <th class="tbl-hd">Сборка fs</th> \n                    <th class="tbl-hd"></th> \n                    <th class="tbl-hd w-7"></th></tr>', s = k(), r = v("tbody");
                for (let t = 0; t < i.length; t += 1) i[t].c();
                M(n, "class", "bg-gray-100"), M(r, "class", "bg-white"), M(e, "class", "tbl mb-0")
            },
            m(t, o) {
                b(t, e, o), m(e, n), m(e, s), m(e, r);
                for (let t = 0; t < i.length; t += 1) i[t] && i[t].m(r, null);
                l = !0
            },
            p(t, e) {
                if (39556 & e[0]) {
                    let n;
                    for (o = t[9], n = 0; n < o.length; n += 1) {
                        const s = ur(t, o, n);
                        i[n] ? (i[n].p(s, e), st(i[n], 1)) : (i[n] = Ir(s), i[n].c(), st(i[n], 1), i[n].m(r, null))
                    }
                    for (et(), n = o.length; n < i.length; n += 1) c(n);
                    nt()
                }
            },
            i(t) {
                if (!l) {
                    for (let t = 0; t < o.length; t += 1) st(i[t]);
                    l = !0
                }
            },
            o(t) {
                i = i.filter(Boolean);
                for (let t = 0; t < i.length; t += 1) rt(i[t]);
                l = !1
            },
            d(t) {
                t && x(e), $(i, t)
            }
        }
    }

    function Or(t) {
        let e, n, s, r, l, o, i, c, a, u, d, f, p, g, h = t[31].projectProp.platformio.default_envs + "",
            $ = t[31].ver + "",
            w = new Date(t[31].dateAdded).toLocaleString("ru", {
                timeZone: "Europe/Vienna"
            }) + "";
        const _ = [Nr, Er],
            j = [];

        function C(t, e) {
            return 0 === t[31].status.preparation && 0 === t[31].status.build && 0 === t[31].status.fs ? 0 : 1
        }
        return d = C(t), f = j[d] = _[d](t), {
            c() {
                e = v("tr"), n = v("td"), s = y(h), r = k(), l = v("td"), o = y($), i = k(), c = v("td"), a = y(w), u = k(), f.c(), p = k(), M(n, "class", "tbl-bdy-lg ipt-lg w-full"), M(l, "class", "tbl-bdy-lg ipt-lg w-full"), M(c, "class", "tbl-bdy-lg ipt-lg w-full"), M(e, "class", "txt-sz txt-pad")
            },
            m(t, f) {
                b(t, e, f), m(e, n), m(n, s), m(e, r), m(e, l), m(l, o), m(e, i), m(e, c), m(c, a), m(e, u), j[d].m(e, null), m(e, p), g = !0
            },
            p(t, n) {
                (!g || 512 & n[0]) && h !== (h = t[31].projectProp.platformio.default_envs + "") && S(s, h), (!g || 512 & n[0]) && $ !== ($ = t[31].ver + "") && S(o, $), (!g || 512 & n[0]) && w !== (w = new Date(t[31].dateAdded).toLocaleString("ru", {
                    timeZone: "Europe/Vienna"
                }) + "") && S(a, w);
                let r = d;
                d = C(t), d === r ? j[d].p(t, n) : (et(), rt(j[r], 1, 1, (() => {
                    j[r] = null
                })), nt(), f = j[d], f ? f.p(t, n) : (f = j[d] = _[d](t), f.c()), st(f, 1), f.m(e, p))
            },
            i(t) {
                g || (st(f), g = !0)
            },
            o(t) {
                rt(f), g = !1
            },
            d(t) {
                t && x(e), j[d].d()
            }
        }
    }

    function Er(t) {
        let e, n, s, r, l, o, i, c, a, u, d, f, p, g, h, $, w, j, C, L, J = t[11][t[31].status.preparation] + "",
            T = t[11][t[31].status.build] + "",
            O = t[11][t[31].status.fs] + "";

        function E() {
            return t[21](t[31])
        }

        function N() {
            return t[22](t[31])
        }

        function P() {
            return t[23](t[31])
        }

        function D(t, e) {
            return 2 === t[31].status.build && 2 === t[31].status.preparation && 2 === t[31].status.fs ? Dr : Pr
        }
        let H = D(t),
            A = H(t);
        const I = [Ar, Hr],
            z = [];

        function q(t, e) {
            return t[31].processed ? 0 : 1
        }
        return w = q(t), j = z[w] = I[w](t), {
            c() {
                e = v("td"), n = v("div"), s = y(J), l = k(), o = v("td"), i = v("div"), c = y(T), u = k(), d = v("td"), f = v("div"), p = y(O), h = k(), A.c(), $ = k(), j.c(), C = _(), M(n, "onclick", r = E), M(e, "class", "tbl-bdy-lg ipt-lg w-full"), M(i, "onclick", a = N), M(o, "class", "tbl-bdy-lg ipt-lg w-full"), M(f, "onclick", g = P), M(d, "class", "tbl-bdy-lg ipt-lg w-full")
            },
            m(t, r) {
                b(t, e, r), m(e, n), m(n, s), b(t, l, r), b(t, o, r), m(o, i), m(i, c), b(t, u, r), b(t, d, r), m(d, f), m(f, p), b(t, h, r), A.m(t, r), b(t, $, r), z[w].m(t, r), b(t, C, r), L = !0
            },
            p(e, l) {
                t = e, (!L || 512 & l[0]) && J !== (J = t[11][t[31].status.preparation] + "") && S(s, J), (!L || 512 & l[0] && r !== (r = E)) && M(n, "onclick", r), (!L || 512 & l[0]) && T !== (T = t[11][t[31].status.build] + "") && S(c, T), (!L || 512 & l[0] && a !== (a = N)) && M(i, "onclick", a), (!L || 512 & l[0]) && O !== (O = t[11][t[31].status.fs] + "") && S(p, O), (!L || 512 & l[0] && g !== (g = P)) && M(f, "onclick", g), H === (H = D(t)) && A ? A.p(t, l) : (A.d(1), A = H(t), A && (A.c(), A.m($.parentNode, $)));
                let o = w;
                w = q(t), w === o ? z[w].p(t, l) : (et(), rt(z[o], 1, 1, (() => {
                    z[o] = null
                })), nt(), j = z[w], j ? j.p(t, l) : (j = z[w] = I[w](t), j.c()), st(j, 1), j.m(C.parentNode, C))
            },
            i(t) {
                L || (st(j), L = !0)
            },
            o(t) {
                rt(j), L = !1
            },
            d(t) {
                t && x(e), t && x(l), t && x(o), t && x(u), t && x(d), t && x(h), A.d(t), t && x($), z[w].d(t), t && x(C)
            }
        }
    }

    function Nr(e) {
        let n, s, r, l, o, i, c, a;
        return {
            c() {
                n = v("td"), s = v("p"), s.textContent = "Ожидание очереди...", r = k(), l = v("td"), o = k(), i = v("td"), c = k(), a = v("td"), M(s, "class", "text-green-500 font-bold truncate"), M(n, "class", "tbl-bdy-lg ipt-lg w-full"), M(l, "class", "tbl-bdy-lg ipt-lg w-full"), M(i, "class", "tbl-bdy-lg ipt-lg w-full"), M(a, "class", "tbl-bdy-lg ipt-lg w-full")
            },
            m(t, e) {
                b(t, n, e), m(n, s), b(t, r, e), b(t, l, e), b(t, o, e), b(t, i, e), b(t, c, e), b(t, a, e)
            },
            p: t,
            i: t,
            o: t,
            d(t) {
                t && x(n), t && x(r), t && x(l), t && x(o), t && x(i), t && x(c), t && x(a)
            }
        }
    }

    function Pr(e) {
        let n;
        return {
            c() {
                n = v("td"), M(n, "class", "tbl-bdy-lg ipt-lg w-full")
            },
            m(t, e) {
                b(t, n, e)
            },
            p: t,
            d(t) {
                t && x(n)
            }
        }
    }

    function Dr(t) {
        let e, n, s;

        function r() {
            return t[24](t[31])
        }
        return {
            c() {
                e = v("td"), e.innerHTML = '<p class="w-fill">Установить</p>', M(e, "class", "tbl-bdy-lg ipt-lg w-full cursor-pointer select-none bg-green-100 hover:bg-green-200")
            },
            m(t, l) {
                b(t, e, l), n || (s = j(e, "click", r), n = !0)
            },
            p(e, n) {
                t = e
            },
            d(t) {
                t && x(e), n = !1, s()
            }
        }
    }

    function Hr(e) {
        let n;
        return {
            c() {
                n = v("td"), M(n, "class", "tbl-bdy-lg ipt-lg w-full")
            },
            m(t, e) {
                b(t, n, e)
            },
            p: t,
            i: t,
            o: t,
            d(t) {
                t && x(n)
            }
        }
    }

    function Ar(t) {
        let e, n, s;

        function r() {
            return t[25](t[31])
        }
        return n = new qt({
            props: {
                click: r
            }
        }), {
            c() {
                e = v("td"), it(n.$$.fragment), M(e, "class", "tbl-bdy-lg ipt-lg w-full")
            },
            m(t, r) {
                b(t, e, r), ct(n, e, null), s = !0
            },
            p(e, s) {
                t = e;
                const l = {};
                512 & s[0] && (l.click = r), n.$set(l)
            },
            i(t) {
                s || (st(n.$$.fragment, t), s = !0)
            },
            o(t) {
                rt(n.$$.fragment, t), s = !1
            },
            d(t) {
                t && x(e), at(n)
            }
        }
    }

    function Ir(t) {
        let e, n, s = t[31].projectProp.platformio.default_envs === t[2].projectProp.platformio.default_envs && Or(t);
        return {
            c() {
                s && s.c(), e = _()
            },
            m(t, r) {
                s && s.m(t, r), b(t, e, r), n = !0
            },
            p(t, n) {
                t[31].projectProp.platformio.default_envs === t[2].projectProp.platformio.default_envs ? s ? (s.p(t, n), 516 & n[0] && st(s, 1)) : (s = Or(t), s.c(), st(s, 1), s.m(e.parentNode, e)) : s && (et(), rt(s, 1, 1, (() => {
                    s = null
                })), nt())
            },
            i(t) {
                n || (st(s), n = !0)
            },
            o(t) {
                rt(s), n = !1
            },
            d(t) {
                s && s.d(t), t && x(e)
            }
        }
    }

    function zr(t) {
        let e, n, r, l, o, i, c, a, u, d, f, p, g, h, w, _, C, L, J, T, O, E, N, P = t[2].projectProp.platformio.default_envs + "",
            D = t[6].username + "",
            H = t[10]("profile.update") + "",
            A = 0 !== Object.keys(t[3]).length,
            I = t[10]("profile.exit") + "",
            z = t[0].modules.virtual_elments,
            q = [];
        for (let e = 0; e < z.length; e += 1) q[e] = yr(hr(t, z, e));
        let B = t[0].modules.sensors,
            F = [];
        for (let e = 0; e < B.length; e += 1) F[e] = _r(gr(t, B, e));
        let R = t[0].modules.executive_devices,
            Z = [];
        for (let e = 0; e < R.length; e += 1) Z[e] = Cr(pr(t, R, e));
        let U = t[0].modules.screens,
            W = [];
        for (let e = 0; e < U.length; e += 1) W[e] = Lr(fr(t, U, e));
        let Y = t[8],
            V = [];
        for (let e = 0; e < Y.length; e += 1) V[e] = Sr(dr(t, Y, e));
        let X = A && Jr(t),
            G = t[9] && Tr(t);
        return {
            c() {
                e = v("div"), n = v("p"), r = y(P), l = k(), o = v("p"), i = y(D), c = k(), a = v("div");
                for (let t = 0; t < q.length; t += 1) q[t].c();
                u = k();
                for (let t = 0; t < F.length; t += 1) F[t].c();
                d = k();
                for (let t = 0; t < Z.length; t += 1) Z[t].c();
                f = k();
                for (let t = 0; t < W.length; t += 1) W[t].c();
                p = k();
                for (let t = 0; t < V.length; t += 1) V[t].c();
                g = k(), h = v("button"), w = y(H), _ = k(), X && X.c(), C = k(), G && G.c(), L = k(), J = v("button"), T = y(I), M(n, "class", "text-center text-gray-500 font-bold"), M(o, "class", "text-center text-gray-500 font-bold"), M(e, "class", "grid grid-cols-2"), M(a, "class", "grid my-4 grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 2xl:grid-cols-12 gap-4"), M(h, "class", "btn-lg mt-4 mb-4"), M(J, "class", "btn-lg mt-4")
            },
            m(s, x) {
                b(s, e, x), m(e, n), m(n, r), m(e, l), m(e, o), m(o, i), b(s, c, x), b(s, a, x);
                for (let t = 0; t < q.length; t += 1) q[t] && q[t].m(a, null);
                m(a, u);
                for (let t = 0; t < F.length; t += 1) F[t] && F[t].m(a, null);
                m(a, d);
                for (let t = 0; t < Z.length; t += 1) Z[t] && Z[t].m(a, null);
                m(a, f);
                for (let t = 0; t < W.length; t += 1) W[t] && W[t].m(a, null);
                b(s, p, x);
                for (let t = 0; t < V.length; t += 1) V[t] && V[t].m(s, x);
                b(s, g, x), b(s, h, x), m(h, w), b(s, _, x), X && X.m(s, x), b(s, C, x), G && G.m(s, x), b(s, L, x), b(s, J, x), m(J, T), O = !0, E || (N = [j(h, "click", t[20]), j(J, "click", t[26])], E = !0)
            },
            p(t, e) {
                if ((!O || 4 & e[0]) && P !== (P = t[2].projectProp.platformio.default_envs + "") && S(r, P), (!O || 64 & e[0]) && D !== (D = t[6].username + "") && S(i, D), 17 & e[0]) {
                    let n;
                    for (z = t[0].modules.virtual_elments, n = 0; n < z.length; n += 1) {
                        const s = hr(t, z, n);
                        q[n] ? q[n].p(s, e) : (q[n] = yr(s), q[n].c(), q[n].m(a, u))
                    }
                    for (; n < q.length; n += 1) q[n].d(1);
                    q.length = z.length
                }
                if (17 & e[0]) {
                    let n;
                    for (B = t[0].modules.sensors, n = 0; n < B.length; n += 1) {
                        const s = gr(t, B, n);
                        F[n] ? F[n].p(s, e) : (F[n] = _r(s), F[n].c(), F[n].m(a, d))
                    }
                    for (; n < F.length; n += 1) F[n].d(1);
                    F.length = B.length
                }
                if (17 & e[0]) {
                    let n;
                    for (R = t[0].modules.executive_devices, n = 0; n < R.length; n += 1) {
                        const s = pr(t, R, n);
                        Z[n] ? Z[n].p(s, e) : (Z[n] = Cr(s), Z[n].c(), Z[n].m(a, f))
                    }
                    for (; n < Z.length; n += 1) Z[n].d(1);
                    Z.length = R.length
                }
                if (17 & e[0]) {
                    let n;
                    for (U = t[0].modules.screens, n = 0; n < U.length; n += 1) {
                        const s = fr(t, U, n);
                        W[n] ? W[n].p(s, e) : (W[n] = Lr(s), W[n].c(), W[n].m(a, null))
                    }
                    for (; n < W.length; n += 1) W[n].d(1);
                    W.length = U.length
                }
                if (1280 & e[0]) {
                    let n;
                    for (Y = t[8], n = 0; n < Y.length; n += 1) {
                        const s = dr(t, Y, n);
                        V[n] ? V[n].p(s, e) : (V[n] = Sr(s), V[n].c(), V[n].m(g.parentNode, g))
                    }
                    for (; n < V.length; n += 1) V[n].d(1);
                    V.length = Y.length
                }(!O || 1024 & e[0]) && H !== (H = t[10]("profile.update") + "") && S(w, H), 8 & e[0] && (A = 0 !== Object.keys(t[3]).length), A ? X ? X.p(t, e) : (X = Jr(t), X.c(), X.m(C.parentNode, C)) : X && (X.d(1), X = null), t[9] ? G ? (G.p(t, e), 512 & e[0] && st(G, 1)) : (G = Tr(t), G.c(), st(G, 1), G.m(L.parentNode, L)) : G && (et(), rt(G, 1, 1, (() => {
                    G = null
                })), nt()), (!O || 1024 & e[0]) && I !== (I = t[10]("profile.exit") + "") && S(T, I)
            },
            i(t) {
                O || (st(G), O = !0)
            },
            o(t) {
                rt(G), O = !1
            },
            d(t) {
                t && x(e), t && x(c), t && x(a), $(q, t), $(F, t), $(Z, t), $(W, t), t && x(p), $(V, t), t && x(g), t && x(h), t && x(_), X && X.d(t), t && x(C), G && G.d(t), t && x(L), t && x(J), E = !1, s(N)
            }
        }
    }

    function qr(t) {
        let e, n, s, r;
        const l = [br, mr],
            o = [];

        function i(t, e) {
            return t[1] ? 0 : 1
        }
        return e = i(t), n = o[e] = l[e](t), {
            c() {
                n.c(), s = _()
            },
            m(t, n) {
                o[e].m(t, n), b(t, s, n), r = !0
            },
            p(t, r) {
                let c = e;
                e = i(t), e === c ? o[e].p(t, r) : (et(), rt(o[c], 1, 1, (() => {
                    o[c] = null
                })), nt(), n = o[e], n ? n.p(t, r) : (n = o[e] = l[e](t), n.c()), st(n, 1), n.m(s.parentNode, s))
            },
            i(t) {
                r || (st(n), r = !0)
            },
            o(t) {
                rt(n), r = !1
            },
            d(t) {
                o[e].d(t), t && x(s)
            }
        }
    }

    function Br(t, e, n) {
        let s;
        a(t, tr, (t => n(10, s = t)));
        let {
            show: r
        } = e, {
            flashProfileJson: l
        } = e, {
            otaJson: o
        } = e, {
            allmodeinfo: i
        } = e, {
            profile: c
        } = e, {
            serverOnline: u
        } = e, {
            userdata: d
        } = e, {
            updateBuild: f = (t => {})
        } = e, p = [], g = null;
        var h;
        H((async () => {
            await b()
        }));
        const m = async () => {
            await b()
        }, b = async () => {
            try {
                const t = dn.get("token_iotm2");
                let e = await fetch("https://portal.iotmanager.org/compiler/userorders", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${t}`
                    },
                    mode: "cors",
                    method: "GET"
                });
                e.ok && (n(9, g = await e.json()), function(t) {
                    t.length && (t[0].processed ? clearInterval(h) : h || (h = setInterval(m, 1e4)))
                }(g))
            } catch (t) {}
        }, x = async t => {
            try {
                const e = dn.get("token_iotm2");
                (await fetch("https://portal.iotmanager.org/compiler/delete/builds/" + t.orderId, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${e}`
                    },
                    mode: "cors",
                    method: "GET"
                })).ok && await b()
            } catch (t) {}
        }, $ = async () => {
            delete c._id, n(0, c.username = d.username, c);
            const t = dn.get("token_iotm2");
            try {
                let e = await fetch("https://portal.iotmanager.org/compiler/order", {
                    mode: "cors",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${t}`
                    },
                    body: JSON.stringify(c)
                });
                const s = await e.json();
                e.ok ? (n(8, p = [{
                    msg: "ok_success"
                }]), await b()) : n(8, p = s.message)
            } catch (t) {}
        }, v = async () => {
            dn.remove("token_iotm2"), Mt.goto("/login"), location.reload()
        }, w = async (t, e) => {};
        return t.$$set = t => {
            "show" in t && n(1, r = t.show), "flashProfileJson" in t && n(2, l = t.flashProfileJson), "otaJson" in t && n(3, o = t.otaJson), "allmodeinfo" in t && n(4, i = t.allmodeinfo), "profile" in t && n(0, c = t.profile), "serverOnline" in t && n(5, u = t.serverOnline), "userdata" in t && n(6, d = t.userdata), "updateBuild" in t && n(7, f = t.updateBuild)
        }, [c, r, l, o, i, u, d, f, p, g, s, {
            0: "",
            1: "В процессе",
            2: "Ок",
            3: "Ошибка"
        }, x, $, v, w, (t, e, s) => n(0, e[s].active = !t.active, c), (t, e, s) => n(0, e[s].active = !t.active, c), (t, e, s) => n(0, e[s].active = !t.active, c), (t, e, s) => n(0, e[s].active = !t.active, c), () => $(), t => w(), t => w(), t => w(), t => f("http://portal.iotmanager.org/compiler/userdata/builds/" + t.orderId), t => x(t), () => v()]
    }
    class Fr extends dt {
        constructor(t) {
            super(), ut(this, t, Br, qr, l, {
                show: 1,
                flashProfileJson: 2,
                otaJson: 3,
                allmodeinfo: 4,
                profile: 0,
                serverOnline: 5,
                userdata: 6,
                updateBuild: 7
            }, null, [-1, -1])
        }
    }

    function Rr(e) {
        let n, s, r, l;
        return {
            c() {
                n = w("svg"), s = w("path"), M(s, "d", "M7 18a4.6 4.4 0 0 1 0 -9h0a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-12"), M(n, "class", r = "h-8 w-8 " + e[0]), M(n, "width", "8"), M(n, "height", "8"), M(n, "viewBox", l = e[1] + " " + e[2] + " 24 24"), M(n, "stroke-width", "2"), M(n, "stroke", "currentColor"), M(n, "fill", "none"), M(n, "stroke-linecap", "round"), M(n, "stroke-linejoin", "round")
            },
            m(t, e) {
                b(t, n, e), m(n, s)
            },
            p(t, [e]) {
                1 & e && r !== (r = "h-8 w-8 " + t[0]) && M(n, "class", r), 6 & e && l !== (l = t[1] + " " + t[2] + " 24 24") && M(n, "viewBox", l)
            },
            i: t,
            o: t,
            d(t) {
                t && x(n)
            }
        }
    }

    function Zr(t, e, n) {
        let {
            color: s
        } = e, {
            x: r = 0
        } = e, {
            y: l = 0
        } = e;
        return t.$$set = t => {
            "color" in t && n(0, s = t.color), "x" in t && n(1, r = t.x), "y" in t && n(2, l = t.y)
        }, [s, r, l]
    }
    class Ur extends dt {
        constructor(t) {
            super(), ut(this, t, Zr, Rr, l, {
                color: 0,
                x: 1,
                y: 2
            })
        }
    }
    const {
        window: Wr
    } = h;

    function Yr(t, e, n) {
        const s = t.slice();
        return s[135] = e[n], s
    }

    function Vr(t) {
        let e, n;
        return e = new Yt({}), {
            c() {
                it(e.$$.fragment)
            },
            m(t, s) {
                ct(e, t, s), n = !0
            },
            i(t) {
                n || (st(e.$$.fragment, t), n = !0)
            },
            o(t) {
                rt(e.$$.fragment, t), n = !1
            },
            d(t) {
                at(e, t)
            }
        }
    }

    function Xr(t) {
        let e, n, r, l, o = t[20],
            i = [];
        for (let e = 0; e < o.length; e += 1) i[e] = Gr(Yr(t, o, e));
        return {
            c() {
                e = v("div"), n = v("select");
                for (let t = 0; t < i.length; t += 1) i[t].c();
                M(n, "class", "border border-indigo-500 border-1"), void 0 === t[28] && W((() => t[53].call(n))), M(e, "class", "px-15 py-1")
            },
            m(s, o) {
                b(s, e, o), m(e, n);
                for (let t = 0; t < i.length; t += 1) i[t] && i[t].m(n, null);
                O(n, t[28], !0), r || (l = [j(n, "change", t[53]), j(n, "change", t[54])], r = !0)
            },
            p(t, e) {
                if (1048576 & e[0]) {
                    let s;
                    for (o = t[20], s = 0; s < o.length; s += 1) {
                        const r = Yr(t, o, s);
                        i[s] ? i[s].p(r, e) : (i[s] = Gr(r), i[s].c(), i[s].m(n, null))
                    }
                    for (; s < i.length; s += 1) i[s].d(1);
                    i.length = o.length
                }
                269484032 & e[0] && O(n, t[28])
            },
            d(t) {
                t && x(e), $(i, t), r = !1, s(l)
            }
        }
    }

    function Gr(t) {
        let e, n, s, r, l = t[135].name + "";
        return {
            c() {
                e = v("option"), n = y(l), s = k(), e.__value = r = t[135].ws, e.value = e.__value
            },
            m(t, r) {
                b(t, e, r), m(e, n), m(e, s)
            },
            p(t, s) {
                1048576 & s[0] && l !== (l = t[135].name + "") && S(n, l), 1048576 & s[0] && r !== (r = t[135].ws) && (e.__value = r, e.value = e.__value)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function Kr(t) {
        let e, n;
        return {
            c() {
                e = v("li"), n = v("a"), n.textContent = "Вход", M(n, "class", "menu__item"), M(n, "href", "/login")
            },
            m(t, s) {
                b(t, e, s), m(e, n)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function Qr(t) {
        let e, n;
        return {
            c() {
                e = v("li"), n = v("a"), n.textContent = "Модули", M(n, "class", "menu__item"), M(n, "href", "/profile")
            },
            m(t, s) {
                b(t, e, s), m(e, n)
            },
            d(t) {
                t && x(e)
            }
        }
    }

    function tl(t) {
        let e, n, s, r, l, o, i, c, a, u, d, f, p, g, h, m;
        return e = new At({
            props: {
                path: "/",
                $$slots: {
                    default: [nl]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), s = new At({
            props: {
                path: "/config",
                $$slots: {
                    default: [sl]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), l = new At({
            props: {
                path: "/connection",
                $$slots: {
                    default: [rl]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), i = new At({
            props: {
                path: "/list",
                $$slots: {
                    default: [ll]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), a = new At({
            props: {
                path: "/system",
                $$slots: {
                    default: [ol]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), d = new At({
            props: {
                path: "/edit",
                $$slots: {
                    default: [il]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), p = new At({
            props: {
                path: "/profile",
                $$slots: {
                    default: [cl]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), h = new At({
            props: {
                path: "/login",
                $$slots: {
                    default: [al]
                },
                $$scope: {
                    ctx: t
                }
            }
        }), {
            c() {
                it(e.$$.fragment), n = k(), it(s.$$.fragment), r = k(), it(l.$$.fragment), o = k(), it(i.$$.fragment), c = k(), it(a.$$.fragment), u = k(), it(d.$$.fragment), f = k(), it(p.$$.fragment), g = k(), it(h.$$.fragment)
            },
            m(t, x) {
                ct(e, t, x), b(t, n, x), ct(s, t, x), b(t, r, x), ct(l, t, x), b(t, o, x), ct(i, t, x), b(t, c, x), ct(a, t, x), b(t, u, x), ct(d, t, x), b(t, f, x), ct(p, t, x), b(t, g, x), ct(h, t, x), m = !0
            },
            p(t, n) {
                const r = {};
                2097536 & n[0] | 16384 & n[4] && (r.$$scope = {
                    dirty: n,
                    ctx: t
                }), e.$set(r);
                const o = {};
                4225280 & n[0] | 16384 & n[4] && (o.$$scope = {
                    dirty: n,
                    ctx: t
                }), s.$set(o);
                const c = {};
                229632 & n[0] | 16384 & n[4] && (c.$$scope = {
                    dirty: n,
                    ctx: t
                }), l.$set(c);
                const u = {};
                537952528 & n[0] | 16384 & n[4] && (u.$$scope = {
                    dirty: n,
                    ctx: t
                }), i.$set(u);
                const f = {};
                1073907456 & n[0] | 16384 & n[4] && (f.$$scope = {
                    dirty: n,
                    ctx: t
                }), a.$set(f);
                const g = {};
                134217984 & n[0] | 16384 & n[4] && (g.$$scope = {
                    dirty: n,
                    ctx: t
                }), d.$set(g);
                const m = {};
                63701248 & n[0] | 16384 & n[4] && (m.$$scope = {
                    dirty: n,
                    ctx: t
                }), p.$set(m);
                const b = {};
                33554432 & n[0] | 16384 & n[4] && (b.$$scope = {
                    dirty: n,
                    ctx: t
                }), h.$set(b)
            },
            i(t) {
                m || (st(e.$$.fragment, t), st(s.$$.fragment, t), st(l.$$.fragment, t), st(i.$$.fragment, t), st(a.$$.fragment, t), st(d.$$.fragment, t), st(p.$$.fragment, t), st(h.$$.fragment, t), m = !0)
            },
            o(t) {
                rt(e.$$.fragment, t), rt(s.$$.fragment, t), rt(l.$$.fragment, t), rt(i.$$.fragment, t), rt(a.$$.fragment, t), rt(d.$$.fragment, t), rt(p.$$.fragment, t), rt(h.$$.fragment, t), m = !1
            },
            d(t) {
                at(e, t), t && x(n), at(s, t), t && x(r), at(l, t), t && x(o), at(i, t), t && x(c), at(a, t), t && x(u), at(d, t), t && x(f), at(p, t), t && x(g), at(h, t)
            }
        }
    }

    function el(t) {
        let e, n;
        return e = new Ut({
            props: {
                title: "Подключение через " + t[0] + " сек."
            }
        }), {
            c() {
                it(e.$$.fragment)
            },
            m(t, s) {
                ct(e, t, s), n = !0
            },
            p(t, n) {
                const s = {};
                1 & n[0] && (s.title = "Подключение через " + t[0] + " сек."), e.$set(s)
            },
            i(t) {
                n || (st(e.$$.fragment, t), n = !0)
            },
            o(t) {
                rt(e.$$.fragment, t), n = !1
            },
            d(t) {
                at(e, t)
            }
        }
    }

    function nl(t) {
        let e, n;
        return e = new nn({
            props: {
                show: t[8].dash,
                layoutJson: t[21],
                pages: t[7],
                wsPush: t[57]
            }
        }), {
            c() {
                it(e.$$.fragment)
            },
            m(t, s) {
                ct(e, t, s), n = !0
            },
            p(t, n) {
                const s = {};
                256 & n[0] && (s.show = t[8].dash), 2097152 & n[0] && (s.layoutJson = t[21]), 128 & n[0] && (s.pages = t[7]), e.$set(s)
            },
            i(t) {
                n || (st(e.$$.fragment, t), n = !0)
            },
            o(t) {
                rt(e.$$.fragment, t), n = !1
            },
            d(t) {
                at(e, t)
            }
        }
    }

    function sl(t) {
        let e, n, s, r;

        function l(e) {
            t[62](e)
        }

        function o(e) {
            t[63](e)
        }
        let i = {
            show: t[8].config,
            widgetsJson: t[12],
            itemsJson: t[11],
            saveConfig: t[58],
            cleanLogs: t[59],
            rebootEsp: t[60],
            moduleOrder: t[61],
            userdata: t[22]
        };
        return void 0 !== t[13] && (i.configJson = t[13]), void 0 !== t[14] && (i.scenarioTxt = t[14]), e = new Kn({
            props: i
        }), q.push((() => ot(e, "configJson", l))), q.push((() => ot(e, "scenarioTxt", o))), {
            c() {
                it(e.$$.fragment)
            },
            m(t, n) {
                ct(e, t, n), r = !0
            },
            p(t, r) {
                const l = {};
                256 & r[0] && (l.show = t[8].config), 4096 & r[0] && (l.widgetsJson = t[12]), 2048 & r[0] && (l.itemsJson = t[11]), 4194304 & r[0] && (l.userdata = t[22]), !n && 8192 & r[0] && (n = !0, l.configJson = t[13], Y((() => n = !1))), !s && 16384 & r[0] && (s = !0, l.scenarioTxt = t[14], Y((() => s = !1))), e.$set(l)
            },
            i(t) {
                r || (st(e.$$.fragment, t), r = !0)
            },
            o(t) {
                rt(e.$$.fragment, t), r = !1
            },
            d(t) {
                at(e, t)
            }
        }
    }

    function rl(t) {
        let e, n;
        return e = new ps({
            props: {
                show: t[8].connection,
                rebootEsp: t[64],
                ssidClick: t[65],
                saveSett: t[66],
                saveMqtt: t[67],
                settingsJson: t[15],
                errorsJson: t[17],
                ssidJson: t[16]
            }
        }), {
            c() {
                it(e.$$.fragment)
            },
            m(t, s) {
                ct(e, t, s), n = !0
            },
            p(t, n) {
                const s = {};
                256 & n[0] && (s.show = t[8].connection), 32768 & n[0] && (s.settingsJson = t[15]), 131072 & n[0] && (s.errorsJson = t[17]), 65536 & n[0] && (s.ssidJson = t[16]), e.$set(s)
            },
            i(t) {
                n || (st(e.$$.fragment, t), n = !0)
            },
            o(t) {
                rt(e.$$.fragment, t), n = !1
            },
            d(t) {
                at(e, t)
            }
        }
    }

    function ll(t) {
        let e, n;
        return e = new _s({
            props: {
                show: t[8].list,
                deviceList: t[20],
                settingsJson: t[15],
                saveSett: t[68],
                rebootEsp: t[69],
                showInput: dl,
                addDevInList: t[70],
                newDevice: t[29],
                sendToAllDevices: t[71],
                saveList: t[72],
                percent: t[4],
                devListOverride: t[73],
                applicationReboot: t[74]
            }
        }), {
            c() {
                it(e.$$.fragment)
            },
            m(t, s) {
                ct(e, t, s), n = !0
            },
            p(t, n) {
                const s = {};
                256 & n[0] && (s.show = t[8].list), 1048576 & n[0] && (s.deviceList = t[20]), 32768 & n[0] && (s.settingsJson = t[15]), 536870912 & n[0] && (s.newDevice = t[29]), 16 & n[0] && (s.percent = t[4]), e.$set(s)
            },
            i(t) {
                n || (st(e.$$.fragment, t), n = !0)
            },
            o(t) {
                rt(e.$$.fragment, t), n = !1
            },
            d(t) {
                at(e, t)
            }
        }
    }

    function ol(t) {
        let e, n, s;

        function r(e) {
            t[81](e)
        }
        let l = {
            show: t[8].system,
            errorsJson: t[17],
            settingsJson: t[15],
            saveSett: t[75],
            rebootEsp: t[76],
            uploadFirmware: t[77],
            setBrowserTime: t[78],
            cleanLogs: t[79],
            cancelAlarm: t[80],
            versionsList: t[9],
            coreMessages: t[30],
            onFileSelected: t[34]
        };
        return void 0 !== t[10] && (l.choosingVersion = t[10]), e = new Ws({
            props: l
        }), q.push((() => ot(e, "choosingVersion", r))), {
            c() {
                it(e.$$.fragment)
            },
            m(t, n) {
                ct(e, t, n), s = !0
            },
            p(t, s) {
                const r = {};
                256 & s[0] && (r.show = t[8].system), 131072 & s[0] && (r.errorsJson = t[17]), 32768 & s[0] && (r.settingsJson = t[15]), 512 & s[0] && (r.versionsList = t[9]), 1073741824 & s[0] && (r.coreMessages = t[30]), !n && 1024 & s[0] && (n = !0, r.choosingVersion = t[10], Y((() => n = !1))), e.$set(r)
            },
            i(t) {
                s || (st(e.$$.fragment, t), s = !0)
            },
            o(t) {
                rt(e.$$.fragment, t), s = !1
            },
            d(t) {
                at(e, t)
            }
        }
    }

    function il(t) {
        let e, n;
        return e = new Ks({
            props: {
                show: t[8].edit,
                espIP: t[27].ip
            }
        }), {
            c() {
                it(e.$$.fragment)
            },
            m(t, s) {
                ct(e, t, s), n = !0
            },
            p(t, n) {
                const s = {};
                256 & n[0] && (s.show = t[8].edit), 134217728 & n[0] && (s.espIP = t[27].ip), e.$set(s)
            },
            i(t) {
                n || (st(e.$$.fragment, t), n = !0)
            },
            o(t) {
                rt(e.$$.fragment, t), n = !1
            },
            d(t) {
                at(e, t)
            }
        }
    }

    function cl(t) {
        let e, n;
        return e = new Fr({
            props: {
                show: t[8].profile,
                flashProfileJson: t[18],
                userdata: t[22],
                updateBuild: t[82],
                allmodeinfo: t[23],
                profile: t[24],
                serverOnline: t[25],
                otaJson: t[19]
            }
        }), {
            c() {
                it(e.$$.fragment)
            },
            m(t, s) {
                ct(e, t, s), n = !0
            },
            p(t, n) {
                const s = {};
                256 & n[0] && (s.show = t[8].profile), 262144 & n[0] && (s.flashProfileJson = t[18]), 4194304 & n[0] && (s.userdata = t[22]), 8388608 & n[0] && (s.allmodeinfo = t[23]), 16777216 & n[0] && (s.profile = t[24]), 33554432 & n[0] && (s.serverOnline = t[25]), 524288 & n[0] && (s.otaJson = t[19]), e.$set(s)
            },
            i(t) {
                n || (st(e.$$.fragment, t), n = !0)
            },
            o(t) {
                rt(e.$$.fragment, t), n = !1
            },
            d(t) {
                at(e, t)
            }
        }
    }

    function al(t) {
        let e, n;
        return e = new ar({
            props: {
                show: !0,
                serverOnline: t[25]
            }
        }), {
            c() {
                it(e.$$.fragment)
            },
            m(t, s) {
                ct(e, t, s), n = !0
            },
            p(t, n) {
                const s = {};
                33554432 & n[0] && (s.serverOnline = t[25]), e.$set(s)
            },
            i(t) {
                n || (st(e.$$.fragment, t), n = !0)
            },
            o(t) {
                rt(e.$$.fragment, t), n = !1
            },
            d(t) {
                at(e, t)
            }
        }
    }

    function ul(t) {
        let e, n, r, l, o, i, c, a, u, d, f, p, g, h, $, w, y, _, C, L, S, J, T, O, E, N, P, D, H, A, I, z, q, B, F, R, Z, U, Y, V, X, G, K, Q, tt, lt;
        W(t[52]);
        let ot = t[6] && Vr(),
            ut = t[5] && Xr(t);

        function dt(t, e) {
            return t[22] ? Qr : Kr
        }
        c = new Ur({
            props: {
                color: !0 === t[26] ? "text-green-500" : "text-red-500"
            }
        });
        let ft = dt(t),
            pt = ft(t);
        const gt = [el, tl],
            ht = [];

        function mt(t, e) {
            return t[26] || "/|" == t[31] ? 1 : 0
        }
        return Y = mt(t), V = ht[Y] = gt[Y](t), {
            c() {
                e = v("div"), ot && ot.c(), n = k(), r = v("header"), l = v("div"), ut && ut.c(), o = k(), i = v("div"), it(c.$$.fragment), a = k(), u = v("nav"), d = v("input"), f = k(), p = v("label"), p.innerHTML = "<span></span>", g = k(), h = v("ul"), $ = v("li"), w = v("a"), w.textContent = "Управление", y = k(), _ = v("li"), C = v("a"), C.textContent = "Конфигуратор", L = k(), S = v("li"), J = v("a"), J.textContent = "Подключение", T = k(), O = v("li"), E = v("a"), E.textContent = "Системные", N = k(), P = v("li"), D = v("a"), D.textContent = "Устройства", H = k(), A = v("li"), I = v("a"), I.textContent = "Файлы", z = k(), pt.c(), q = k(), B = v("li"), F = k(), R = v("main"), Z = v("ul"), U = v("div"), V.c(), G = k(), K = v("footer"), K.innerHTML = '<div class="flex justify-center content-center text-xxs text-gray-500">Developed by Dmitry Borisenko</div>', M(i, "class", "pl-4 pr-4 py-1"), M(l, "class", "flex content-center items-center justify-end"), M(r, "class", "h-10 w-full bg-gray-100 overflow-auto shadow-md"), M(d, "class", "w-0 h-0"), M(d, "id", "menu__toggle"), M(d, "type", "checkbox"), M(p, "class", "menu__btn"), M(p, "for", "menu__toggle"), M(w, "class", "menu__item"), M(w, "href", "/"), M(C, "class", "menu__item"), M(C, "href", "/config"), M(J, "class", "menu__item"), M(J, "href", "/connection"), M(E, "class", "menu__item"), M(E, "href", "/system"), M(D, "class", "menu__item"), M(D, "href", "/list"), M(I, "class", "menu__item"), M(I, "href", "/edit"), M(B, "class", "flex flex-col pl-6 pt-3 w-full h-screen"), M(h, "class", "menu__box"), M(u, "class", "flex"), M(U, "class", "bg-cover pt-0 px-4"), M(Z, "class", "menu__main"), M(R, "class", X = "flex-1 overflow-y-auto p-0 " + (!0 !== t[1] || t[2] ? "ml-0" : "ml-36")), M(K, "class", "h-4 bg-gray-100 border-gray-300 shadow-lg"), M(e, "class", "flex flex-col h-screen bg-gray-50")
            },
            m(s, x) {
                b(s, e, x), ot && ot.m(e, null), m(e, n), m(e, r), m(r, l), ut && ut.m(l, null), m(l, o), m(l, i), ct(c, i, null), m(e, a), m(e, u), m(u, d), d.checked = t[1], m(u, f), m(u, p), m(u, g), m(u, h), m(h, $), m($, w), m(h, y), m(h, _), m(_, C), m(h, L), m(h, S), m(S, J), m(h, T), m(h, O), m(O, E), m(h, N), m(h, P), m(P, D), m(h, H), m(h, A), m(A, I), m(h, z), pt.m(h, null), m(h, q), m(h, B), m(e, F), m(e, R), m(R, Z), m(Z, U), ht[Y].m(U, null), m(e, G), m(e, K), Q = !0, tt || (lt = [j(Wr, "resize", t[52]), j(d, "change", t[55]), j(d, "change", t[56])], tt = !0)
            },
            p(t, s) {
                t[6] ? ot ? 64 & s[0] && st(ot, 1) : (ot = Vr(), ot.c(), st(ot, 1), ot.m(e, n)) : ot && (et(), rt(ot, 1, 1, (() => {
                    ot = null
                })), nt()), t[5] ? ut ? ut.p(t, s) : (ut = Xr(t), ut.c(), ut.m(l, o)) : ut && (ut.d(1), ut = null);
                const r = {};
                67108864 & s[0] && (r.color = !0 === t[26] ? "text-green-500" : "text-red-500"), c.$set(r), 2 & s[0] && (d.checked = t[1]), ft !== (ft = dt(t)) && (pt.d(1), pt = ft(t), pt && (pt.c(), pt.m(h, q)));
                let i = Y;
                Y = mt(t), Y === i ? ht[Y].p(t, s) : (et(), rt(ht[i], 1, 1, (() => {
                    ht[i] = null
                })), nt(), V = ht[Y], V ? V.p(t, s) : (V = ht[Y] = gt[Y](t), V.c()), st(V, 1), V.m(U, null)), (!Q || 6 & s[0] && X !== (X = "flex-1 overflow-y-auto p-0 " + (!0 !== t[1] || t[2] ? "ml-0" : "ml-36"))) && M(R, "class", X)
            },
            i(t) {
                Q || (st(ot), st(c.$$.fragment, t), st(V), Q = !0)
            },
            o(t) {
                rt(ot), rt(c.$$.fragment, t), rt(V), Q = !1
            },
            d(t) {
                t && x(e), ot && ot.d(), ut && ut.d(), at(c), pt.d(), ht[Y].d(), tt = !1, s(lt)
            }
        }
    }
    let dl = !1;
    async function fl(t, e, n) {
        let s = t.slice(e, t.length),
            r = await s.text();
        try {
            n.json = JSON.parse(r), n.parse = !0
        } catch (t) {
            n.parse = !1
        }
        return n.parse
    }
    async function pl(t, e) {
        let n = t.slice(e, t.length);
        return await n.text()
    }

    function gl(t) {
        let e = t.shift();
        t.sort(((t, e) => t.name < e.name ? -1 : t.name > e.name ? 1 : 0)), t.unshift(e)
    }

    function hl(t, e) {
        for (var n in e) t[n] = e[n];
        return t
    }

    function ml(t, e) {
        for (var n in e) "status" !== n && (t[n] = e[n]);
        return t
    }

    function bl(t, e, n) {
        let s;
        a(t, Mt, (t => n(97, s = t))), Mt.mode.hash();
        let r, l, o, i = {},
            c = 60,
            u = c,
            d = !1,
            f = !0,
            p = !1,
            g = document.location.hostname,
            h = !0,
            m = !0,
            b = !1,
            x = [],
            $ = {
                dash: !1,
                config: !1,
                connection: !1,
                list: !1,
                system: !1,
                dev: !1,
                edit: !1
            },
            v = {},
            w = [],
            y = [],
            k = [],
            _ = " ",
            j = {},
            C = {},
            M = {},
            L = {},
            S = {},
            J = [];
        J = [{
            name: "--",
            id: "--",
            ip: g,
            ws: 0,
            status: !1
        }];
        var T = [],
            O = [],
            N = [];
        let P, D, A = [],
            I = [],
            z = {},
            q = null,
            B = null,
            F = null,
            R = !1,
            Z = {
                itemsJson: !1,
                widgetsJson: !1,
                configJson: !1,
                scenarioTxt: !1,
                settingsJson: !1,
                ssidJson: !1,
                incDeviceList: !1,
                deviceListJson: !1,
                errorsJson: !1,
                statusJson: !1,
                paramsJson: !1,
                flashProfileJson: !1,
                otaJson: !1
            },
            U = [],
            W = !1,
            Y = 0,
            V = {},
            X = [];

        function G() {
            n(31, D = s.path.toString()), n(31, D += "|"), yt(), "/edit|" === D && n(8, $.edit = !0, $), "/|" === D ? (St(D), n(5, m = !1)) : (n(5, m = "/list|" !== D), K())
        }

        function K() {
            void 0 !== Y && Lt(Y, D)
        }
        Mt.subscribe(G), H((async () => {
            await Q(), Pt(), n(1, f = r > 900), Tt(), h = !0, tt(), jt(), setInterval((() => {
                J.forEach((t => {
                    if (t.status && U[t.ws] && 1 === U[t.ws].readyState) {
                        U[t.ws].send("/pi|");
                        const e = t.ws;
                        st(e), i[e] && clearTimeout(i[e]), i[e] = setTimeout((() => {}), 1500)
                    }
                }))
            }), 2e3)
        }));
        const Q = async () => {
            try {
                if (!navigator.onLine) return void n(25, R = !1);
                const t = dn.get("token_iotm2"),
                    e = new AbortController,
                    s = setTimeout((() => e.abort()), 5e3);
                let r = await fetch("https://portal.iotmanager.org/api/user/email", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${t}`
                    },
                    mode: "cors",
                    method: "GET",
                    signal: e.signal
                });
                clearTimeout(s), r.ok ? (n(22, q = await r.json()), n(25, R = !0)) : n(25, R = !0)
            } catch (t) {
                t.name, n(25, R = !1)
            }
        };

        function tt() {
            Et(Y);
            for (let t = 0; t < J.length; t++) n(20, J[t].ws = t, J), !1 !== J[t].status && void 0 !== J[t].status || (nt(t), rt(t))
        }

        function et(t, e) {
            J.forEach((s => {
                s.ws === t && (s.status = e, s.ping = 0, !0 === s.status || (function(t) {
                    n(21, I = I.filter((e => e.ws !== t)))
                }(t), dt(t)))
            })), Tt(), n(20, J)
        }

        function nt(t) {
            let e = st(t);
            "error" === e ? i[t] && clearTimeout(i[t]) : (U[t] = new WebSocket("ws://" + e + ":81"), U.binaryType = "blob")
        }

        function st(t) {
            let e = "error";
            return J.forEach((n => {
                t === n.ws && (e = n.ip)
            })), e
        }

        function rt(t) {
            U[t] && (st(t), U[t].addEventListener("open", (e => {
                et(t, !0), h && 0 === t && Lt(t, "/devlist|"), "/|" === D ? Lt(t, D) : t === Y && K()
            })), U[t].addEventListener("message", (e => {
                if ("string" == typeof e.data) {
                    let n = e.data;
                    if ("/po|" === e.data) return void(i[t] && clearTimeout(i[t]));
                    "/tstr|" === n && Ct(t, !0)
                }
                e.data instanceof Blob && (t === Y && async function(t, e) {
                    var s = t.slice(0, 6);
                    let r = await s.text();
                    var l = t.slice(7, 11);
                    let o = await l.text();
                    if ("itemsj" === r) {
                        let e = {};
                        await fl(t, o, e) ? (n(11, w = e.json), Z.itemsJson = !0) : Z.itemsJson = !1
                    }
                    if ("widget" === r) {
                        let e = {};
                        await fl(t, o, e) ? (n(12, y = e.json), Z.widgetsJson = !0) : Z.widgetsJson = !1
                    }
                    if ("config" === r) {
                        let e = {};
                        await fl(t, o, e) ? (n(13, k = e.json), Z.configJson = !0) : Z.configJson = !1
                    }
                    if ("scenar" === r && n(14, _ = await pl(t, o)), "settin" === r) {
                        let e = {};
                        await fl(t, o, e) ? (n(15, j = e.json), Z.settingsJson = !0) : Z.settingsJson = !1
                    }
                    if ("ssidli" === r) {
                        let e = {};
                        await fl(t, o, e) ? (n(16, C = e.json), Z.ssidJson = !0) : Z.ssidJson = !1
                    }
                    if ("errors" === r) {
                        let e = {};
                        await fl(t, o, e) ? (n(17, M = e.json), Z.errorsJson = !0) : Z.errorsJson = !1
                    }
                    if ("devlis" === r) {
                        let e = {};
                        await fl(t, o, e) ? (A = [], A = e.json, Z.incDeviceList = !0, await async function() {
                            h ? at() : ut(), h = !1, n(20, J), Z.deviceListJson = !0, lt(), Tt(), tt()
                        }()) : Z.incDeviceList = !1
                    }
                    if ("prfile" === r) {
                        let e = {};
                        await fl(t, o, e) ? (n(18, L = e.json), Z.flashProfileJson = !0) : Z.flashProfileJson = !1
                    }
                    if ("otaupd" === r) {
                        let e = {};
                        await fl(t, o, e) ? (n(19, S = e.json), Z.otaJson = !0) : Z.otaJson = !1
                    }
                    if ("corelg" === r) {
                        let e = await pl(t, o);
                        Jt(e)
                    }
                    await lt()
                }(e.data), "/|" === D && async function(t, e) {
                    var s = t.slice(0, 6);
                    let r = await s.text();
                    var l = t.slice(7, 11);
                    let o = await l.text();
                    if ("status" === r) {
                        let e = {};
                        await fl(t, o, e) && function(t) {
                            for (let e = 0; e < I.length; e++)
                                if (I[e].topic === t.topic) {
                                    n(21, I[e] = hl(I[e], t), I), n(21, I[e].sent = !1, I);
                                    break
                                }
                        }(e.json)
                    }
                    if ("layout" === r) {
                        let s = {};
                        await fl(t, o, s) && async function(t, e) {
                            for (let n = 0; n < e.length; n++) e[n].ws = t;
                            n(21, I = I.concat(e)), dt(t)
                        }(e, s.json)
                    }
                    if ("params" === r) {
                        let s = {};
                        if (await fl(t, o, s)) {
                            let t = s.json;
                            z = {
                                    ...z,
                                    ...t
                                },
                                function(t) {
                                    for (const [t, e] of Object.entries(z))
                                        for (let s = 0; s < I.length; s++) {
                                            let r = I[s].topic;
                                            if (r && (r = r.substring(r.lastIndexOf("/") + 1, r.length), t === r)) {
                                                n(21, I[s].status = e, I);
                                                break
                                            }
                                        }
                                    Lt(t, "/charts|")
                                }(e), lt()
                        }
                    }
                    if ("charta" === r) {
                        let e, n = await pl(t, o);
                        n = "[" + n.substring(0, n.length - 1) + "]";
                        try {
                            e = JSON.parse(n)
                        } catch (t) {
                            return
                        }
                        let s = {},
                            r = {};
                        if (!await async function(t, e, n) {
                                let s = t.slice(12, e),
                                    r = await s.text();
                                try {
                                    n.json = JSON.parse(r), n.parse = !0
                                } catch (t) {
                                    n.parse = !1
                                }
                                return n.parse
                            }(t, o, s)) return;
                        r = s.json;
                        let l = {};
                        l.status = e, l = {
                            ...l,
                            ...r
                        }, ft(l)
                    }
                    if ("chartb" === r) {
                        let e = {};
                        await fl(t, o, e) && ft(e.json)
                    }
                }(e.data, t))
            })), U[t].addEventListener("close", (e => {
                i[t] && clearTimeout(i[t]), et(t, !1)
            })), U[t].addEventListener("error", (e => {
                et(t, !1)
            })))
        }
        async function lt() {
            "/|" === D && n(8, $.dash = !0, $), "/config|" === D && Z.itemsJson && Z.widgetsJson && Z.configJson && Z.settingsJson && (kt(), n(8, $.config = !0, $)), "/connection|" === D && Z.ssidJson && Z.settingsJson && Z.errorsJson && (kt(), n(8, $.connection = !0, $)), "/list|" === D && Z.settingsJson && (kt(), n(8, $.list = !0, $)), "/system|" === D && Z.errorsJson && Z.settingsJson && (kt(), async function() {
                if (n(9, v = {}), j.serverip) try {
                    let t = j.serverip + "/iotm/ver.json",
                        e = await fetch(t, {
                            mode: "cors",
                            method: "GET"
                        });
                    e.ok ? (n(9, v = await e.json()), n(9, v = v[M.bn]), n(10, o = M.bver)) : n(10, o = void 0)
                } catch (t) {
                    n(10, o = void 0)
                }
            }(), n(8, $.system = !0, $)), "/profile|" === D && Z.flashProfileJson && (kt(), n(8, $.profile = !0, $), await ot(), await it())
        }
        const ot = async () => {
            try {
                let t = await fetch("https://portal.iotmanager.org/compiler/allmodinfo", {
                    mode: "cors",
                    method: "GET"
                });
                t.ok && (n(23, B = await t.json()), n(23, B = B.message))
            } catch (t) {}
        }, it = async () => {
            try {
                const t = dn.get("token_iotm2");
                let e = await fetch("https://portal.iotmanager.org/compiler/profile", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${t}`
                    },
                    mode: "cors",
                    method: "GET"
                });
                e.ok && (n(24, F = await e.json()), n(24, F = F.message), await ct())
            } catch (t) {}
        }, ct = async () => {
            n(24, F.projectProp.platformio.default_envs = L.projectProp.platformio.default_envs, F);
            for (const [t, e] of Object.entries(F.modules)) {
                let n = L.modules[t];
                e.forEach((t => {
                    t.active = !1, n && n.forEach((e => {
                        e.path === t.path && (t.active = e.active)
                    }))
                }))
            }
        };
        async function at() {
            n(20, J = A), gl(J), n(20, J[0].status = !0, J)
        }
        async function ut() {
            n(20, J = function(t, e) {
                var n = new Set(t.map((t => t.ip)));
                let s = [...t, ...e.filter((t => !n.has(t.ip)))];
                return s
            }(J, A)), gl(J)
        }

        function dt(t) {
            I.sort(((t, e) => t.descr < e.descr ? -1 : t.descr > e.descr ? 1 : 0)), n(7, x = []), Array.from(new Set(Array.from(I, (({
                page: t
            }) => t)))).forEach(((t, e, s) => {
                n(7, x = [...x, JSON.parse(JSON.stringify({
                    page: t
                }))])
            })), x.sort(((t, e) => t.page < e.page ? -1 : t.page > e.page ? 1 : 0)), n(21, I), Lt(t, "/params|")
        }
        async function ft(t) {
            let e = !0;
            if (I.length > 0)
                for (let s = 0; s < I.length; s++)
                    if (I[s].topic === t.topic) {
                        e = !1, n(21, I[s] = ml(I[s], t), I);
                        let r = I[s].status,
                            l = t.status;
                        r ? (r = [...r, ...l], n(21, I[s].status = r, I)) : n(21, I[s].status = l, I), n(21, I[s].sent = !1, I)
                    }
        }

        function pt() {
            const t = Date.now();
            Lt(Y, "/localt|" + t / 1e3)
        }
        let gt = null;
        async function ht() {
            if (!gt) return;
            const t = new FormData;
            t.append("file", gt);
            try {
                (await fetch(`http://${P.ip}/update`, {
                    method: "POST",
                    body: t
                })).ok
            } catch (t) {}
        }

        function mt() {
            Lt(Y, "/tuoyal|" + JSON.stringify(wt())),
                function() {
                    for (let t = 0; t < k.length; t++) delete k[t].show
                }(), Lt(Y, "/gifnoc|" + JSON.stringify(k)), Lt(Y, "/oiranecs|" + _), yt(), K()
        }

        function bt() {
            Object.keys(j).length > 5 ? (function(t, e, n, s, r) {
                for (let e = 0; e < t.length; e++) {
                    let s = t[e];
                    for (const [t, e] of Object.entries(s))
                        if ("ip" == t && e == n) {
                            s.name = r;
                            break
                        }
                }
            }(J, 0, st(Y), 0, j.name), n(20, J), Lt(Y, "/sgnittes|" + JSON.stringify(j))) : window.alert("Ошибка размера settingsJson (возможно не был передан странице)"), yt(), K()
        }

        function xt() {
            let t = Object.assign([], J);
            for (let e = 0; e < t.length; e++) t[e].status = !1;
            Lt(Y, "/tsil|" + JSON.stringify(t))
        }

        function $t() {
            Lt(Y, "/clean|")
        }

        function vt() {
            var t = Object.keys(j).length;
            Lt(Y, "/tuoyal|" + JSON.stringify(wt())), t > 5 ? Lt(Y, "/sgnittes|" + JSON.stringify(j)) : window.alert("Ошибка"), yt(), Lt(Y, "/mqtt|")
        }

        function wt() {
            let t = [];
            for (let e = 0; e < k.length; e++) {
                let n = Object.assign({}, k[e]),
                    s = n.widget,
                    r = !0;
                for (let e = 0; e < y.length; e++) {
                    if (s === y[e].name) {
                        let l = Object.assign({}, y[e]);
                        if (l.page = n.page, l.descr = n.descr, l.topic = j.mqttPrefix + "/" + j.id + "/" + n.id, "nil" !== s && t.push(l), "chart" === l.widget && "bar" !== l.type) {
                            "chart5" === l.name && (l.series = [n.series1, n.series2]), "chart6" === l.name && (l.series = [n.series1, n.series2, n.series3]);
                            let e = {
                                name: "inputDate",
                                widget: "input",
                                size: "small",
                                color: "orange",
                                type: "date"
                            };
                            e.page = n.page, e.topic = j.mqttPrefix + "/" + j.id + "/" + n.id + "-date", e.descr = n.descr, t.push(e)
                        }
                        r = !1;
                        break
                    }
                    r = !0
                }
            }
            t.sort(((t, e) => t.descr < e.descr ? -1 : t.descr > e.descr ? 1 : 0));
            for (let e = 0; e < t.length; e++) t[e].order = e;
            return t
        }

        function yt() {
            n(11, w = []), n(12, y = []), n(13, k = []), n(14, _ = " "), n(15, j = {}), n(17, M = {}), n(21, I = []), z = {}, n(19, S = {}), n(18, L = {});
            for (const [t, e] of Object.entries($)) n(8, $[t] = !1, $);
            kt()
        }

        function kt() {
            for (const [t, e] of Object.entries(Z)) Z[t] = !1
        }

        function _t(t, e, n) {
            Lt(t, "/control|" + e.substring(e.lastIndexOf("/") + 1, e.length) + "/" + n)
        }

        function jt() {
            var t;
            tickerTask = setTimeout(jt, 1e3), n(0, u--, u), d && W && (d = !1, n(6, b = !1), c = 60, n(0, u = c)), n(4, l = (u - (t = c)) * (100 - 0) / (0 - t) + 0), u <= 0 && (function() {
                if (U)
                    for (let t = 0; t < U.length; t++);
            }(), n(0, u = c), J.forEach((t => {
                !1 === t.status || void 0 === t.status ? (nt(t.ws), rt(t.ws)) : (Lt(t.ws, "/tst|"), Ct(t.ws, !1))
            })))
        }

        function Ct(t, e) {
            if (e) {
                T[t] && clearTimeout(T[t]), O[t] && (N[t] = Date.now() - O[t]);
                for (let e = 0; e < J.length; e++) J[e].ws === t && n(20, J[e].ping = N[t], J);
                n(20, J)
            } else O[t] = Date.now(), T[t] = setTimeout((() => {
                et(t, !1)
            }), 18e3)
        }

        function Lt(t, e) {
            U[t] && 1 === U[t].readyState && U[t].send(e)
        }

        function St(t) {
            J.forEach((e => {
                !0 === e.status && Lt(e.ws, t)
            }))
        }
        const Jt = t => {
            X.length >= 100 && X.shift(), n(30, X = [...X, {
                msg: t
            }]), X.sort(((t, e) => t.time > e.time ? -1 : t.time < e.time ? 1 : 0))
        };

        function Tt() {
            Et(Y), n(26, W = P.status)
        }

        function Ot() {
            "/list|" === D || (Tt(), yt(), G(), P.ip)
        }

        function Et(t) {
            for (let e = 0; e < J.length; e++) {
                let s = J[e];
                if (s.ws === t) {
                    n(27, P = s);
                    break
                }
            }
        }

        function Nt() {
            return void 0 !== V.name && void 0 !== V.ip && void 0 !== V.id && (n(29, V.status = !1, V), n(29, V.ws = J.length, V), A.push(V), ut(), tt(), !0)
        }

        function Pt() {
            n(2, p = r < 900)
        }

        function Dt() {
            Lt(Y, "/scan|" + JSON.stringify(j.routerssid))
        }
        // function Dt(element) {
        //     let s = {
        //         value: element
        //     };
        //     Lt(Y, "/scan|" + JSON.stringify(s))
        // }

        function Ht() {
            d = !0, Lt(Y, "/reboot|"), et(Y, !1), n(6, b = !0), n(26, W = !1), c = 10, n(0, u = c)
        }

        function At(t) {
            d = !0, Lt(Y, "/update|" + t), n(6, b = !0), n(26, W = !1), c = 20, n(0, u = c)
        }

        function It() {
            for (const [t, e] of Object.entries($)) n(8, $[t] = !1, $);
            n(6, b = !0), setTimeout((() => {
                location.reload()
            }), 1e3)
        }

        function zt(t) {
            n(17, M[t] = 0, M), Lt(Y, '/rorre|{"' + t + '":0}')
        }

        function qt(t, e, n) {
            let s = {
                id: t,
                key: e,
                value: n
            };
            Lt(Y, "/order|" + JSON.stringify(s))
        }
        return [u, f, p, r, l, m, b, x, $, v, o, w, y, k, _, j, C, M, L, S, J, I, q, B, F, R, W, P, Y, V, X, D, at, pt, function(t) {
            gt = t
        }, ht, mt, bt, xt, $t, vt, _t, St, Ot, Nt, Pt, Dt, Ht, At, It, zt, qt, function() {
            n(3, r = Wr.innerWidth)
        }, function() {
            Y = E(this), n(28, Y), n(20, J)
        }, () => Ot(), function() {
            f = this.checked, n(1, f)
        }, () => Pt(), (t, e, n) => _t(t, e, n), () => mt(), () => $t(), () => Ht(), (t, e, n) => qt(t, e, n), function(t) {
            k = t, n(13, k)
        }, function(t) {
            _ = t, n(14, _)
        }, () => Ht(), () => Dt(), () => bt(), () => vt(), () => bt(), () => Ht(), () => Nt(), t => St(t), () => xt(), () => at(), () => It(), () => bt(), () => Ht(), () => ht(), () => pt(), () => $t(), t => zt(t), function(t) {
            o = t, n(10, o)
        }, t => At(t)]
    }
    new class extends dt {
        constructor(t) {
            super(), ut(this, t, bl, ul, l, {}, null, [-1, -1, -1, -1, -1])
        }
    }({
        target: document.body,
        props: {
            name: "world"
        }
    })
}();
//# sourceMappingURL=bundle.js.map
