// node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: ee } = Object, m = globalThis, te = m.trustedTypes, ne = te ? te.emptyScript : "", re = m.reactiveElementPolyfillSupport, ie = (e, t) => e, ae = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? ne : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, oe = (e, t) => !l(e, t), se = {
	attribute: !0,
	type: String,
	converter: ae,
	reflect: !1,
	useDefault: !1,
	hasChanged: oe
};
Symbol.metadata ??= Symbol("metadata"), m.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var ce = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = se) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && u(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = d(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? se;
	}
	static _$Ei() {
		if (this.hasOwnProperty(ie("elementProperties"))) return;
		let e = ee(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(ie("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ie("properties"))) {
			let e = this.properties, t = [...f(e), ...p(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? ae : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? ae : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? oe)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
ce.elementStyles = [], ce.shadowRootOptions = { mode: "open" }, ce[ie("elementProperties")] = /* @__PURE__ */ new Map(), ce[ie("finalized")] = /* @__PURE__ */ new Map(), re?.({ ReactiveElement: ce }), (m.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var le = globalThis, ue = (e) => e, de = le.trustedTypes, fe = de ? de.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, pe = "$lit$", h = `lit$${Math.random().toFixed(9).slice(2)}$`, me = "?" + h, he = `<${me}>`, g = document, ge = () => g.createComment(""), _e = (e) => e === null || typeof e != "object" && typeof e != "function", ve = Array.isArray, ye = (e) => ve(e) || typeof e?.[Symbol.iterator] == "function", be = "[ 	\n\f\r]", xe = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Se = /-->/g, Ce = />/g, _ = RegExp(`>|${be}(?:([^\\s"'>=/]+)(${be}*=${be}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), we = /'/g, Te = /"/g, Ee = /^(?:script|style|textarea|title)$/i, De = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), v = De(1), y = De(2), Oe = Symbol.for("lit-noChange"), b = Symbol.for("lit-nothing"), ke = /* @__PURE__ */ new WeakMap(), x = g.createTreeWalker(g, 129);
function Ae(e, t) {
	if (!ve(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return fe === void 0 ? t : fe.createHTML(t);
}
var je = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = xe;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === xe ? c[1] === "!--" ? o = Se : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = _) : (Ee.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = _) : o = Ce : o === _ ? c[0] === ">" ? (o = i ?? xe, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? _ : c[3] === "\"" ? Te : we) : o === Te || o === we ? o = _ : o === Se || o === Ce ? o = xe : (o = _, i = void 0);
		let d = o === _ && e[t + 1].startsWith("/>") ? " " : "";
		a += o === xe ? n + he : l >= 0 ? (r.push(s), n.slice(0, l) + pe + n.slice(l) + h + d) : n + h + (l === -2 ? t : d);
	}
	return [Ae(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Me = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = je(t, n);
		if (this.el = e.createElement(l, r), x.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = x.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(pe)) {
					let t = u[o++], n = i.getAttribute(e).split(h), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Ie : r[1] === "?" ? Le : r[1] === "@" ? Re : Fe
					}), i.removeAttribute(e);
				} else e.startsWith(h) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (Ee.test(i.tagName)) {
					let e = i.textContent.split(h), t = e.length - 1;
					if (t > 0) {
						i.textContent = de ? de.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], ge()), x.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], ge());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === me) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(h, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += h.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = g.createElement("template");
		return n.innerHTML = e, n;
	}
};
function S(e, t, n = e, r) {
	if (t === Oe) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = _e(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = S(e, i._$AS(e, t.values), i, r)), t;
}
var Ne = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? g).importNode(t, !0);
		x.currentNode = r;
		let i = x.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Pe(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new ze(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = x.nextNode(), a++);
		}
		return x.currentNode = g, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, Pe = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = b, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = S(this, e, t), _e(e) ? e === b || e == null || e === "" ? (this._$AH !== b && this._$AR(), this._$AH = b) : e !== this._$AH && e !== Oe && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ye(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== b && _e(this._$AH) ? this._$AA.nextSibling.data = e : this.T(g.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Me.createElement(Ae(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Ne(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = ke.get(e.strings);
		return t === void 0 && ke.set(e.strings, t = new Me(e)), t;
	}
	k(t) {
		ve(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(ge()), this.O(ge()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = ue(e).nextSibling;
			ue(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, Fe = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = b, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = b;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = S(this, e, t, 0), a = !_e(e) || e !== this._$AH && e !== Oe, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = S(this, r[n + o], t, o), s === Oe && (s = this._$AH[o]), a ||= !_e(s) || s !== this._$AH[o], s === b ? e = b : e !== b && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === b ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Ie = class extends Fe {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === b ? void 0 : e;
	}
}, Le = class extends Fe {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== b);
	}
}, Re = class extends Fe {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = S(this, e, t, 0) ?? b) === Oe) return;
		let n = this._$AH, r = e === b && n !== b || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== b && (n === b || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, ze = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		S(this, e);
	}
}, Be = le.litHtmlPolyfillSupport;
Be?.(Me, Pe), (le.litHtmlVersions ??= []).push("3.3.3");
var Ve = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Pe(t.insertBefore(ge(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, He = globalThis, Ue = class extends ce {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ve(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return Oe;
	}
};
Ue._$litElement$ = !0, Ue.finalized = !0, He.litElementHydrateSupport?.({ LitElement: Ue });
var We = He.litElementPolyfillSupport;
We?.({ LitElement: Ue }), (He.litElementVersions ??= []).push("4.2.2");
// src/calc/mode.ts
var Ge = [
	"off",
	"unavailable",
	"unknown"
], Ke = (e, t) => e?.trim().toLowerCase() === t, qe = (e) => e !== void 0 && e > 0;
function Je(e, t) {
	if (Ke(e["unit.on_off"], "off")) return "off";
	if (Ke(e["compressor.mode"], "defrost")) return "defrost";
	let n = e["compressor.speed"];
	if (n === void 0) return "standby";
	let r = e["unit.summer"] === !0;
	return qe(n) ? e["dhw.demand"] === !0 ? "dhw" : r && t.active_cooling === !0 ? "active_cooling" : "heating" : r && qe(e["production.pump"]) && t.passive_cooling === !0 ? "passive_cooling" : "standby";
}
function Ye(e) {
	return e !== void 0 && Ge.includes(e.state.trim().toLowerCase());
}
var Xe = (e) => e === !0;
// src/calc/circuits.ts
function Ze(e, t, n, r) {
	let i = /* @__PURE__ */ new Set(), a = t.passive_cooling !== !1, o = n !== "none";
	switch (e) {
		case "heating":
			i.add("refrigerant").add("brine").add("production_dg1");
			break;
		case "dhw":
			i.add("refrigerant").add("brine"), o && i.add("production_dhw").add("dhw_coil");
			break;
		case "active_cooling":
			i.add("refrigerant").add("brine").add("production_dg1"), t.htr === !0 && o && (r["heating.capacity"] ?? 0) > 0 && i.add("htr").add("dhw_coil");
			break;
		case "passive_cooling":
		case "defrost": i.add("brine").add("production_dg1"), a && i.add("exchanger_10");
	}
	return qe(r["brine.pump"]) || i.delete("brine"), {
		valve26: e === "dhw" ? "dhw" : "production",
		valve14: e === "active_cooling" ? "reversed" : "normal",
		valves2728: (e === "passive_cooling" || e === "defrost") && a ? "exchanger" : "closed",
		active: i
	};
}
// src/lib/availability.ts
var Qe = /* @__PURE__ */ new Set(["unknown", "unavailable"]), $e = -999, et = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;
function tt(e) {
	if (!et.test(e)) return;
	let t = Number(e);
	return Number.isFinite(t) ? t + 0 : void 0;
}
function nt(e) {
	if (e === void 0 || Qe.has(e.state)) return !0;
	let t = tt(e.state);
	return t !== void 0 && t <= $e;
}
function rt(e) {
	if (!(e === void 0 || nt(e))) return tt(e.state);
}
// src/lib/hass.ts
var it = (e, t) => t === void 0 ? void 0 : e[t];
function at(e, t) {
	e.dispatchEvent(new CustomEvent("hass-more-info", {
		detail: { entityId: t },
		bubbles: !0,
		composed: !0
	}));
}
// src/lib/units.ts
var ot = { scale: 1 }, st = {
	scale: 5 / 9,
	offset: -32
}, ct = {
	temperature: /* @__PURE__ */ new Map([["°c", ot], ["°f", st]]),
	difference: /* @__PURE__ */ new Map([
		["k", ot],
		["°c", ot],
		["°f", st]
	]),
	power: /* @__PURE__ */ new Map([["w", ot], ["kw", { scale: 1e3 }]])
};
function lt(e) {
	return e.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase();
}
function ut(e, t) {
	let n = rt(e);
	return n === void 0 ? void 0 : dt(t, n, e?.attributes.unit_of_measurement);
}
function dt(e, t, n) {
	if (!Number.isFinite(t) || n === void 0) return;
	let r = ct[e].get(lt(n));
	return r ? (t + (r.offset ?? 0)) * r.scale : void 0;
}
// src/strings.ts
var C = {
	invalid: (e, t) => `Invalid option ${e}: expected ${t}`,
	number: (e, t) => `a number from ${e} to ${t}`,
	color: "a CSS colour such as #db4437 or rgb(219, 68, 55)",
	boolean: "true or false",
	object: "a group of options",
	choice: (e) => `one of ${e.join(", ")}`,
	list: "a list of texts"
}, ft = {
	name: "ecoGEO Schematic",
	description: "The internal schematic of an Ecoforest ecoGEO heat pump, with live values and pipes coloured by temperature."
}, pt = "ecoGEO heat pump schematic", w = {
	celsius: "°C",
	kelvin: "K",
	bar: "bar",
	percent: "%",
	rpm: "rpm",
	watt: "W"
}, mt = {
	off: "Off",
	defrost: "Defrost",
	dhw: "DHW",
	active_cooling: "Active cooling",
	heating: "Heating",
	passive_cooling: "Passive cooling",
	standby: "Standby"
}, ht = {
	alarm: "Alarm",
	offline: "Offline",
	sampleValues: "Sample values"
}, T = {
	unknownOption: (e) => `Unknown option ${e}`,
	unknownFeature: (e, t) => `Unknown feature ${e}: expected one of ${t.join(", ")}`,
	unknownRole: (e) => `Unknown entity role ${e}`,
	notEntityId: (e) => `Invalid entity for ${e}: expected an entity id such as sensor.name`,
	featureState: (e) => `Invalid option features.${e}: expected true, false or unused`,
	integer: (e, t) => `a whole number from ${e} to ${t}`,
	prefix: "a prefix of lowercase letters, digits and underscores",
	colors: "Invalid option colors: expected an ascending list of 2 to 8 stops, each { temperature, color } with a number and a CSS colour",
	dhwMismatch: (e, t) => `Invalid option dhw: ${e} does not fit model ${t}`
}, gt = {
	dg1: "DG1",
	outerLoop: "Outer loop",
	dhw: "DHW"
}, _t = {
	air: "Air unit",
	ground: "Ground loop"
}, vt = {
	externalTank: "DHW tank",
	demand: "Demand"
}, yt = { demand: "Demand" }, E = {
	setpoint: "Setpoint",
	startDelta: "Start ΔT",
	setpointShort: "Set",
	startDeltaShort: "ΔT",
	fan: "Fan",
	outside: "Outside",
	portIn: "In",
	portOut: "Out",
	dhw: "DHW"
}, bt = {
	outside: "Outside",
	cop: "COP",
	condensation: "Condensation",
	evaporation: "Evaporation",
	summer: "Summer",
	winter: "Winter"
}, xt = {
	on: "On",
	off: "Off",
	emergency: "Emergency"
}, St = {
	1: "Production outlet",
	2: "Production return",
	3: "Brine outlet",
	4: "Brine inlet",
	5: "DHW inter-accumulator outlet",
	6: "DHW inter-accumulator inlet",
	7: "Evaporator",
	8: "Condenser",
	9: "HTR system exchanger",
	10: "Passive cooling / defrosting exchanger",
	11: "Compressor",
	12: "Electronic expansion valve",
	13: "Filter dryer",
	14: "Cycle inversion valve",
	15: "Production circulator pump",
	16: "Brine circulator pump",
	17: "HTR circulator pump",
	18: "Brine expansion vessel",
	19: "Production expansion vessel",
	20: "Brine safety valve",
	21: "Production safety valve",
	22: "HTR system retention valve",
	23: "Brine drain valve",
	24: "Production discharge valve",
	25: "HTR system discharge valve",
	26: "DHW valve",
	27: "Passive cooling production valve",
	28: "Passive cooling brine valve",
	29: "Suction temperature probe",
	30: "Discharge temperature probe",
	31: "Brine outlet temperature probe",
	32: "Brine inlet temperature probe",
	33: "Production outlet temperature probe",
	34: "Production return temperature probe",
	35: "Suction pressure transducer",
	36: "Discharge pressure transducer",
	37: "Brine pressure transducer",
	38: "Production pressure transducer",
	39: "Suction mini-pressure switch",
	40: "Discharge mini-pressure switch",
	41: "Service outlet",
	44: "Outlet resistor",
	45: "Safety thermostat",
	47: "Tap water inlet",
	48: "DHW outlet",
	49: "DHW recirculation",
	50: "DHW tank",
	51: "DHW coil",
	52: "Manual trap",
	53: "Tank drain valve",
	54: "DHW temperature probe"
}, Ct = (e) => {
	let t = St[e];
	return t === void 0 ? "" : `${t} (${String(e)})`;
}, wt = "Air unit fan", D = w.celsius, Tt = [
	{
		path: "production.outlet_temperature",
		domain: "sensor",
		suffix: "production_out",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "33"
	},
	{
		path: "production.return_temperature",
		domain: "sensor",
		suffix: "production_in",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "34"
	},
	{
		path: "production.pressure",
		domain: "sensor",
		suffix: "pressure_production",
		kind: "number",
		unit: w.bar,
		decimals: 1,
		item: "38"
	},
	{
		path: "production.pump",
		domain: "sensor",
		suffix: "production_pump",
		kind: "number",
		unit: w.percent,
		decimals: 1,
		item: "15"
	},
	{
		path: "brine.outlet_temperature",
		domain: "sensor",
		suffix: "brine_out",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "31"
	},
	{
		path: "brine.inlet_temperature",
		domain: "sensor",
		suffix: "brine_in",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "32"
	},
	{
		path: "brine.pressure",
		domain: "sensor",
		suffix: "pressure_brine",
		kind: "number",
		unit: w.bar,
		decimals: 1,
		item: "37"
	},
	{
		path: "brine.pump",
		domain: "sensor",
		suffix: "brine_pump",
		kind: "number",
		unit: w.percent,
		decimals: 1,
		item: "16"
	},
	{
		path: "compressor.speed",
		domain: "sensor",
		suffix: "compressor_rpm",
		kind: "number",
		unit: w.rpm,
		decimals: 0,
		item: "11"
	},
	{
		path: "compressor.percentage",
		domain: "sensor",
		suffix: "compressor_percentage",
		kind: "number",
		unit: w.percent,
		decimals: 1,
		item: "11"
	},
	{
		path: "compressor.power",
		domain: "sensor",
		suffix: "power_consumption",
		kind: "number",
		quantity: "power",
		unit: w.watt,
		decimals: 0,
		item: "11"
	},
	{
		path: "compressor.suction_temperature",
		domain: "sensor",
		suffix: "compressor_suction_temperature",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "29"
	},
	{
		path: "compressor.discharge_temperature",
		domain: "sensor",
		suffix: "compressor_discharge_temperature",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "30"
	},
	{
		path: "compressor.suction_pressure",
		domain: "sensor",
		suffix: "compressor_suction_pressure",
		kind: "number",
		unit: w.bar,
		decimals: 1,
		item: "35"
	},
	{
		path: "compressor.discharge_pressure",
		domain: "sensor",
		suffix: "compressor_discharge_pressure",
		kind: "number",
		unit: w.bar,
		decimals: 1,
		item: "36"
	},
	{
		path: "compressor.mode",
		domain: "sensor",
		suffix: "compressor_operation_mode",
		kind: "text",
		item: "11"
	},
	{
		path: "refrigerant.condensation_temperature",
		domain: "sensor",
		suffix: "condensation_temperature",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "8"
	},
	{
		path: "refrigerant.evaporation_temperature",
		domain: "sensor",
		suffix: "evaporation_temperature",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "7"
	},
	{
		path: "refrigerant.superheat",
		domain: "sensor",
		suffix: "superheat",
		kind: "number",
		quantity: "difference",
		unit: w.kelvin,
		decimals: 1,
		item: "12"
	},
	{
		path: "refrigerant.expansion_valve",
		domain: "sensor",
		suffix: "expansion_valve_position",
		kind: "number",
		unit: w.percent,
		decimals: 0,
		item: "12"
	},
	{
		path: "heating.capacity",
		domain: "sensor",
		suffix: "condensation_capacity",
		kind: "number",
		quantity: "power",
		unit: w.watt,
		decimals: 0,
		item: "8"
	},
	{
		path: "cooling.capacity",
		domain: "sensor",
		suffix: "evaporation_capacity",
		kind: "number",
		quantity: "power",
		unit: w.watt,
		decimals: 0,
		item: "7"
	},
	{
		path: "heating.demand",
		domain: "binary_sensor",
		suffix: "dg1_demand",
		kind: "binary",
		item: "1/2"
	},
	{
		path: "heating.setpoint",
		domain: "sensor",
		suffix: "heating_dg1_setpoint",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "1/2"
	},
	{
		path: "dhw.temperature",
		domain: "sensor",
		suffix: "dhw_temperature",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "tank (54 on C)"
	},
	{
		path: "dhw.setpoint",
		domain: "number",
		suffix: "dhw_setpoint",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 0,
		item: "tank"
	},
	{
		path: "dhw.start_delta",
		domain: "number",
		suffix: "delta_t_start_dhw",
		kind: "number",
		quantity: "difference",
		unit: w.kelvin,
		decimals: 0,
		item: "tank"
	},
	{
		path: "dhw.demand",
		domain: "binary_sensor",
		suffix: "dhw_demand",
		kind: "binary",
		item: "26"
	},
	{
		path: "source.fan_speed",
		domain: "sensor",
		suffix: "aerothermal_fan_speed",
		kind: "number",
		unit: w.percent,
		decimals: 1,
		item: "air unit"
	},
	{
		path: "source.air_unit_outlet_temperature",
		domain: "sensor",
		suffix: "brine_temperature_air_unit_outlet",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "air unit"
	},
	{
		path: "source.outside_temperature",
		domain: "sensor",
		suffix: "outside_temperature",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "air unit / footer"
	},
	{
		path: "unit.on_off",
		domain: "sensor",
		suffix: "heatpump_on_off",
		kind: "text",
		item: "footer"
	},
	{
		path: "unit.summer",
		domain: "binary_sensor",
		suffix: "summer",
		kind: "binary",
		item: "footer"
	},
	{
		path: "unit.winter",
		domain: "binary_sensor",
		suffix: "winter",
		kind: "binary",
		item: "footer"
	},
	{
		path: "unit.alarm",
		domain: "binary_sensor",
		suffix: "alarm",
		kind: "binary",
		item: "footer"
	},
	{
		path: "unit.connection",
		domain: "binary_sensor",
		suffix: "status",
		kind: "binary",
		item: "footer"
	},
	{
		path: "unit.cop",
		domain: "sensor",
		suffix: "cop",
		kind: "number",
		decimals: 1,
		item: "footer"
	}
], Et = new Map(Tt.map((e) => [e.path, e])), Dt = Tt.map((e) => e.path);
[...new Set(Tt.flatMap((e) => "unit" in e ? [e.unit] : []))];
var Ot = (e, t) => `${e.domain}.${t}_${e.suffix}`;
// src/calc/readings.ts
function kt(e, t) {
	return t.quantity === void 0 ? rt(e) : ut(e, t.quantity);
}
function At(e, t) {
	switch (t.kind) {
		case "number": return kt(e, t);
		case "text": return e === void 0 || nt(e) || ["unavailable", "unknown"].includes(e.state.trim().toLowerCase()) ? void 0 : e.state.trim();
		case "binary": {
			let t = e?.state.trim().toLowerCase();
			return t === "on" || t !== "off" && void 0;
		}
	}
}
function jt(e, t) {
	return Object.fromEntries(Tt.map((n) => [n.path, At(it(e, t[n.path]), n)]));
}
// src/lib/config.ts
var Mt = /^[a-z][a-z0-9_]*\.[a-z0-9_]+$/;
function O(e, t) {
	let n = e;
	for (let e of t.split(".")) {
		if (typeof n != "object" || !n || !Object.hasOwn(n, e)) return;
		n = n[e];
	}
	return n;
}
function Nt(e) {
	if (typeof e != "string") return;
	let t = e.trim();
	return Mt.test(t) ? t : void 0;
}
function Pt(e, t) {
	return Nt(O(e, t));
}
// src/lib/options.ts
var Ft = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, It = /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|var)\((.*)\)$/i, Lt = /^[#a-zA-Z0-9(),.%\s/+-]+$/, Rt = /* @__PURE__ */ new Set(/* @__PURE__ */ "aliceblue.antiquewhite.aqua.aquamarine.azure.beige.bisque.black.blanchedalmond.blue.blueviolet.brown.burlywood.cadetblue.chartreuse.chocolate.coral.cornflowerblue.cornsilk.crimson.cyan.darkblue.darkcyan.darkgoldenrod.darkgray.darkgreen.darkgrey.darkkhaki.darkmagenta.darkolivegreen.darkorange.darkorchid.darkred.darksalmon.darkseagreen.darkslateblue.darkslategray.darkslategrey.darkturquoise.darkviolet.deeppink.deepskyblue.dimgray.dimgrey.dodgerblue.firebrick.floralwhite.forestgreen.fuchsia.gainsboro.ghostwhite.gold.goldenrod.gray.green.greenyellow.grey.honeydew.hotpink.indianred.indigo.ivory.khaki.lavender.lavenderblush.lawngreen.lemonchiffon.lightblue.lightcoral.lightcyan.lightgoldenrodyellow.lightgray.lightgreen.lightgrey.lightpink.lightsalmon.lightseagreen.lightskyblue.lightslategray.lightslategrey.lightsteelblue.lightyellow.lime.limegreen.linen.magenta.maroon.mediumaquamarine.mediumblue.mediumorchid.mediumpurple.mediumseagreen.mediumslateblue.mediumspringgreen.mediumturquoise.mediumvioletred.midnightblue.mintcream.mistyrose.moccasin.navajowhite.navy.oldlace.olive.olivedrab.orange.orangered.orchid.palegoldenrod.palegreen.paleturquoise.palevioletred.papayawhip.peachpuff.peru.pink.plum.powderblue.purple.rebeccapurple.red.rosybrown.royalblue.saddlebrown.salmon.sandybrown.seagreen.seashell.sienna.silver.skyblue.slateblue.slategray.slategrey.snow.springgreen.steelblue.tan.teal.thistle.tomato.turquoise.violet.wheat.white.whitesmoke.yellow.yellowgreen.transparent.currentcolor".split("."));
function zt(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) if (e[n] === "(" && t++, e[n] === ")" && (t--, t < 0 || t === 0 && n !== e.length - 1)) return !1;
	return t === 0;
}
function Bt(e) {
	let t = e.trim();
	if (t.length === 0 || t.length > 100 || !Lt.test(t)) return !1;
	if (Ft.test(t) || Rt.has(t.toLowerCase())) return !0;
	let n = It.exec(t);
	if (n === null || !zt(t)) return !1;
	if (n[1]?.toLowerCase() !== "var") return !0;
	let [r, ...i] = (n[2] ?? "").split(",");
	return /^\s*--[a-zA-Z0-9-]+\s*$/.test(r ?? "") && (i.length === 0 || Bt(i.join(",")));
}
var Vt = (e) => e == null;
function Ht(e) {
	switch (e.kind) {
		case "number": return C.number(String(e.min), String(e.max));
		case "color": return C.color;
		case "boolean": return C.boolean;
		case "choice": return C.choice(e.choices);
		case "list": return C.list;
	}
}
var Ut = (e) => e === null || [
	"string",
	"number",
	"boolean"
].includes(typeof e);
function Wt(e) {
	return e.map((e) => typeof e == "boolean" ? e ? "on" : "off" : e === null ? "" : String(e)).filter((e) => e.trim() !== "");
}
function Gt(e, t) {
	switch (e.kind) {
		case "number": return typeof t == "number" && Number.isFinite(t) && t >= e.min && t <= e.max;
		case "color": return typeof t == "string" && Bt(t);
		case "boolean": return typeof t == "boolean";
		case "choice": return typeof t == "string" && e.choices.includes(t);
		case "list": return Array.isArray(t) && t.every(Ut);
	}
}
function Kt(e, t) {
	let n = t.split(".").slice(0, -1);
	for (let t = 1; t <= n.length; t++) {
		let r = n.slice(0, t).join("."), i = O(e, r);
		if (!Vt(i) && (typeof i != "object" || Array.isArray(i))) return r;
	}
}
function qt(e, t) {
	let n = t.flatMap((t) => {
		let n = Kt(e, t.path);
		if (n !== void 0) return [C.invalid(n, C.object)];
		let r = O(e, t.path);
		return Vt(r) || Gt(t, r) ? [] : [C.invalid(t.path, Ht(t))];
	});
	return [...new Set(n)];
}
function Jt(e, t) {
	let n = O(e, t.path);
	if (t.kind === "list" && Array.isArray(n) && Gt(t, n)) {
		let e = Wt(n);
		return e.length > 0 ? e : t.default;
	}
	return Vt(n) || !Gt(t, n) ? t.default : n;
}
// src/diagram/colors.ts
var Yt = [
	{
		temperature: -10,
		color: "#1e5aa8"
	},
	{
		temperature: 10,
		color: "#5fa8e0"
	},
	{
		temperature: 20,
		color: "#8ecae6"
	},
	{
		temperature: 30,
		color: "#e8a317"
	},
	{
		temperature: 50,
		color: "#f2711c"
	},
	{
		temperature: 70,
		color: "#d7263d"
	}
], k = "var(--disabled-text-color)", Xt = "#8a8a8a", Zt = `var(--ecogeo-coil-muted, ${k})`, Qt = (e) => e ? k : Xt, $t = (e) => typeof e == "object" && !!e && !Array.isArray(e), en = (e) => typeof e == "string" && qt({ color: e }, [{
	kind: "color",
	path: "color",
	default: ""
}]).length === 0, tn = (e) => e.map((e) => ({
	temperature: e.temperature,
	color: e.color.trim()
}));
function nn(e) {
	let t = O(e, "colors");
	if (t == null) return [];
	if (!Array.isArray(t) || t.length < 2 || t.length > 8) return [T.colors];
	let n = t;
	if (!n.every((e) => $t(e) && typeof e.temperature == "number" && Number.isFinite(e.temperature) && en(e.color))) return [T.colors];
	let r = tn(n).map((e) => e.temperature);
	return r.every((e, t) => t === 0 || e > (r[t - 1] ?? 0)) ? [] : [T.colors];
}
function rn(e) {
	let t = O(e, "colors");
	return Array.isArray(t) && nn(e).length === 0 ? tn(t) : Yt;
}
function an(e, t = Yt) {
	let n = t[0], r = t[t.length - 1];
	if (e === void 0 || !Number.isFinite(e) || n === void 0 || r === void 0) return k;
	if (e <= n.temperature) return n.color;
	if (e >= r.temperature) return r.color;
	let i = t.findIndex((t) => t.temperature >= e), a = t[i - 1], o = t[i];
	if (a === void 0 || o === void 0) return r.color;
	let s = Math.round((e - a.temperature) / (o.temperature - a.temperature) * 1e3) / 10;
	return s <= 0 ? a.color : s >= 100 ? o.color : `color-mix(in srgb, ${o.color} ${String(s)}%, ${a.color})`;
}
// src/config/variants.ts
var on = [
	"active_cooling",
	"passive_cooling",
	"htr",
	"backup_heater"
], sn = [
	1,
	2,
	3,
	4
];
function cn(e) {
	return {
		active_cooling: e === 3 || e === 4,
		passive_cooling: e === 2 || e === 4,
		htr: !0,
		backup_heater: !0
	};
}
function ln(e, t) {
	return {
		...cn(e),
		...t
	};
}
// src/config/options.ts
var un = ["B", "C"], dn = [
	"air",
	"ground",
	"hybrid"
], fn = [
	"external",
	"internal",
	"none"
], pn = ["simplified", "full"], mn = {
	kind: "choice",
	path: "model",
	default: "B",
	choices: un
}, hn = {
	kind: "choice",
	path: "source",
	default: "ground",
	choices: dn
}, gn = {
	kind: "choice",
	path: "dhw",
	default: "external",
	choices: fn
}, _n = {
	kind: "choice",
	path: "detail",
	default: "simplified",
	choices: pn
}, vn = {
	kind: "choice",
	path: "exchanger_fill",
	default: "gradient",
	choices: ["gradient", "none"]
}, yn = {
	kind: "choice",
	path: "layout",
	default: "auto",
	choices: [
		"auto",
		"full",
		"compact"
	]
}, bn = [
	mn,
	hn,
	gn,
	_n,
	vn,
	yn
], xn = [
	"type",
	"model",
	"variant",
	"source",
	"dhw",
	"prefix",
	"features",
	"entities",
	"colors",
	"detail",
	"exchanger_fill",
	"layout",
	"view_layout",
	"layout_options",
	"grid_options",
	"visibility"
], Sn = (e) => e === "C" ? "internal" : "external", A = (e) => e == null, Cn = (e) => A(e) || typeof e == "string" && e.trim() === "", wn = (e) => typeof e == "object" && !!e && !Array.isArray(e), Tn = /^[a-z0-9_]+$/;
function En(e) {
	let t = O(e, "prefix");
	return Cn(t) ? void 0 : t.trim();
}
function Dn(e) {
	let t = O(e, "variant");
	return sn.find((e) => e === t) ?? 4;
}
function On(e) {
	let t = Jt(e, mn), n = !A(O(e, "dhw"));
	return {
		model: t,
		source: Jt(e, hn),
		dhw: n ? Jt(e, gn) : Sn(t)
	};
}
var kn = (e) => Jt(e, _n), An = (e) => Jt(e, vn), jn = (e) => Jt(e, yn);
function Mn(e) {
	let t = O(e, "features");
	if (!wn(t)) return {};
	let n = {};
	for (let e of on) {
		let r = t[e];
		(r === !0 || r === !1 || r === "unused") && (n[e] = r);
	}
	return n;
}
var Nn = (e) => e === !0 || e === !1 || e === "unused";
function Pn(e, t = "") {
	return Object.entries(e).flatMap(([e, n]) => {
		let r = t === "" ? e : `${t}.${e}`;
		return wn(n) ? Pn(n, r) : [[r, n]];
	});
}
function Fn(e) {
	let t = O(e, "variant");
	return A(t) || sn.some((e) => e === t) ? [] : [C.invalid("variant", T.integer(String(sn[0]), String(sn[sn.length - 1])))];
}
function In(e) {
	let t = O(e, "prefix");
	return Cn(t) || typeof t == "string" && Tn.test(t.trim()) ? [] : [C.invalid("prefix", T.prefix)];
}
function Ln(e) {
	let t = O(e, "features");
	return A(t) ? [] : wn(t) ? Object.entries(t).flatMap(([e, t]) => on.some((t) => t === e) ? A(t) || Nn(t) ? [] : [T.featureState(e)] : [T.unknownFeature(e, on)]) : [C.invalid("features", C.object)];
}
function Rn(e) {
	let t = O(e, "entities");
	return A(t) ? [] : wn(t) ? Pn(t).flatMap(([e, t]) => Cn(t) ? [] : Et.has(e) ? Nt(t) === void 0 ? [T.notEntityId(e)] : [] : [T.unknownRole(e)]) : [C.invalid("entities", C.object)];
}
function zn(e) {
	let t = O(e, "entities");
	return wn(t) && Pn(t).some(([, e]) => !Cn(e));
}
function Bn(e) {
	let t = Object.keys(e).filter((e) => !xn.includes(e)).map((e) => T.unknownOption(e)), n = qt(e, bn), r = [
		...t,
		...n,
		...Fn(e),
		...In(e),
		...Ln(e),
		...Rn(e),
		...nn(e)
	];
	if (qt(e, [mn, gn]).length === 0 && !A(O(e, "dhw"))) {
		let { model: t, dhw: n } = On(e);
		(t === "B" && n === "internal" || t === "C" && n === "external") && r.push(T.dhwMismatch(n, t));
	}
	return r;
}
// src/config/sample.ts
var Vn = (e) => `ecogeo_sample.${e.replace(".", "_")}`, Hn = {
	"production.outlet_temperature": "25.2",
	"production.return_temperature": "22",
	"production.pressure": "1.2",
	"production.pump": "99.9",
	"brine.outlet_temperature": "-2.8",
	"brine.inlet_temperature": "0.5",
	"brine.pressure": "1.2",
	"brine.pump": "100",
	"compressor.speed": "2803",
	"compressor.percentage": "38.9",
	"compressor.power": "786",
	"compressor.suction_temperature": "1",
	"compressor.discharge_temperature": "52.5",
	"compressor.suction_pressure": "5.7",
	"compressor.discharge_pressure": "16.4",
	"compressor.mode": "Balance",
	"refrigerant.condensation_temperature": "27",
	"refrigerant.evaporation_temperature": "-5.3",
	"refrigerant.superheat": "6.2",
	"refrigerant.expansion_valve": "58",
	"heating.capacity": "4712",
	"cooling.capacity": "3926",
	"heating.demand": "on",
	"heating.setpoint": "35",
	"dhw.temperature": "52.1",
	"dhw.setpoint": "58",
	"dhw.start_delta": "8",
	"dhw.demand": "off",
	"source.fan_speed": "34.5",
	"source.air_unit_outlet_temperature": "0.5",
	"source.outside_temperature": "3.8",
	"unit.on_off": "ON",
	"unit.summer": "off",
	"unit.winter": "on",
	"unit.alarm": "off",
	"unit.connection": "on",
	"unit.cop": "6"
}, Un = "2026-01-01T12:00:00Z", Wn = Object.fromEntries(Dt.map((e) => [e, Vn(e)])), Gn = Object.fromEntries(Dt.map((e) => {
	let t = Et.get(e)?.unit, n = Vn(e);
	return [n, {
		entity_id: n,
		state: Hn[e],
		last_updated: Un,
		attributes: t === void 0 ? {} : { unit_of_measurement: t }
	}];
}));
// src/config/resolve.ts
function Kn(e, t) {
	return Object.fromEntries(Tt.map((n) => [n.path, Pt(e, `entities.${n.path}`) ?? (t === void 0 ? void 0 : Ot(n, t))]));
}
var qn = (e) => En(e) === void 0 && !zn(e);
function Jn(e) {
	let t = En(e), n = Dn(e), r = qn(e);
	return {
		...On(e),
		detail: kn(e),
		exchangerFill: An(e),
		layout: jn(e),
		variant: n,
		prefix: t,
		colors: rn(e),
		features: ln(n, Mn(e)),
		entities: r ? Wn : Kn(e, t),
		sample: r
	};
}
// src/diagram/component-info.ts
var Yn = {
	7: "refrigerant.evaporation_temperature",
	8: "refrigerant.condensation_temperature",
	11: "compressor.speed",
	12: "refrigerant.expansion_valve",
	15: "production.pump",
	16: "brine.pump",
	26: "dhw.demand",
	29: "compressor.suction_temperature",
	30: "compressor.discharge_temperature",
	31: "brine.outlet_temperature",
	32: "brine.inlet_temperature",
	33: "production.outlet_temperature",
	34: "production.return_temperature",
	35: "compressor.suction_pressure",
	36: "compressor.discharge_pressure",
	37: "brine.pressure",
	38: "production.pressure",
	50: "dhw.temperature",
	54: "dhw.temperature"
}, Xn = "source.fan_speed", Zn = "dhw.temperature", Qn = (e, t) => e === void 0 || t?.onTap === void 0 ? void 0 : t.entities[e];
function $n(e, t) {
	return e === void 0 || t === void 0 ? {
		role: b,
		tabindex: b,
		click: b,
		keydown: b
	} : {
		role: "button",
		tabindex: "0",
		click: () => {
			t(e);
		},
		keydown: (n) => {
			(n.key === "Enter" || n.key === " ") && (n.preventDefault(), t(e));
		}
	};
}
var er = o`
  outline: 2px solid var(--primary-color, currentColor);
  outline-offset: 2px;
  filter: drop-shadow(0 0 2px var(--primary-color, currentColor));
`, tr = {
	width: 1e3,
	height: 620
}, j = {
	x: 240,
	y: 130,
	width: 520,
	height: 475
}, M = {
	x: 408,
	y: 138,
	width: 182,
	height: 66
}, nr = {
	x: 495,
	y: 185
}, rr = [[-75, -13], [-75, 13]], N = {
	x: 806,
	y: j.y,
	width: 168,
	height: 180,
	dome: 14
}, ir = N.x + N.width / 2, ar = N.y + 62, or = N.y + 146, sr = 50, cr = N.x + 14;
function lr() {
	let { x: e, y: t, width: n, height: r, dome: i } = N, a = n / 2;
	return `M${String(e)} ${String(t + i)} A${String(a)} ${String(i)} 0 0 1 ${String(e + n)} ${String(t + i)} V${String(t + r - i)} A${String(a)} ${String(i)} 0 0 1 ${String(e)} ${String(t + r - i)} Z`;
}
var P = {
	x: 26,
	y: j.y,
	width: 124,
	height: 210,
	fanX: 88,
	fanY: j.y + 162,
	fanRadius: 34,
	coil: {
		x: 36,
		y: j.y + 16,
		width: 104,
		height: 74
	},
	fins: {
		x: 52,
		step: 6,
		count: 13,
		y0: j.y + 20,
		y1: j.y + 86
	},
	slats: {
		y0: j.y + 134,
		step: 9,
		count: 8
	},
	dividerY: j.y + 114,
	captionX: 88,
	captionY: j.y - 8,
	passes: {
		y0: j.y + 30,
		step: 15,
		count: 4,
		left: 44,
		right: 132
	}
}, ur = P.x + P.width, F = {
	top: P.passes.y0,
	bottom: P.passes.y0 + (P.passes.count - 1) * P.passes.step
}, I = {
	downX: 166,
	upX: 106,
	depth: 140
}, dr = {
	start: 8,
	end: 220
}, L = {
	ground: j.y,
	hybrid: P.y + P.height + 70
}, fr = {
	x: (I.downX + I.upX) / 2,
	y: {
		ground: L.ground + I.depth + 28,
		hybrid: L.hybrid + I.depth + 28
	}
}, R = (e, t, n, r, i, a, o = {}) => ({
	item: e,
	kind: t,
	x: n,
	y: r,
	rotation: i,
	tag: a,
	...o
}), pr = [
	R(1, "port", 270, 130, 0, [
		-7,
		-8,
		"end"
	]),
	R(2, "port", 312, 130, 0, [
		-7,
		-8,
		"end"
	]),
	R(3, "port", 630, 130, 0, [
		-7,
		-8,
		"end"
	]),
	R(4, "port", 690, 130, 0, [
		-7,
		-8,
		"end"
	]),
	R(5, "port", 722, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "external" }),
	R(6, "port", 748, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "external" }),
	R(47, "port", 440, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "internal" }),
	R(48, "port", 490, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "internal" }),
	R(49, "port", 540, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "internal" }),
	R(7, "exchanger", 572, 382, 0, [
		-26,
		6,
		"end"
	], {
		size: 34,
		sides: [{
			half: "left",
			entering: ["ref_12_7"],
			leaving: ["ref_7_14", "ref_direct_suction"],
			enters: "bottom",
			reversible: !0
		}, {
			half: "right",
			entering: ["br_feed7"],
			leaving: ["brine_7_28", "brine_bypass28"],
			enters: "top"
		}]
	}),
	R(8, "exchanger", 432, 382, 0, [
		-26,
		6,
		"end"
	], {
		size: 34,
		sides: [{
			half: "left",
			entering: ["prod_15_8"],
			leaving: ["prod_8_44"],
			enters: "bottom"
		}, {
			half: "right",
			entering: ["ref_14_8", "ref_direct_8"],
			leaving: ["ref_8_13"],
			enters: "top",
			reversible: !0
		}]
	}),
	R(9, "exchanger", 373, 273, 0, [
		26,
		-2,
		"start"
	], {
		size: 23,
		feature: "htr",
		sides: [{
			half: "left",
			entering: ["htr_to_9"],
			leaving: ["htr_riser"],
			enters: "bottom"
		}, {
			half: "right",
			entering: ["ref_discharge"],
			leaving: ["ref_9_14"],
			enters: "top"
		}]
	}),
	R(11, "compressor", 510, 250, 0, [
		0,
		-26,
		"middle"
	]),
	R(12, "expansion_valve", 527, 416, 0, [
		0,
		-14,
		"middle"
	]),
	R(13, "filter_dryer", 487, 416, 0, [
		0,
		-14,
		"middle"
	]),
	R(14, "inversion_valve", 430, 296, 0, [
		-16,
		22,
		"end"
	], { feature: "active_cooling" }),
	R(29, "probe_t", 542, 234, 0, [
		0,
		-14,
		"middle"
	]),
	R(30, "probe_t", 430, 234, 0, [
		0,
		-14,
		"middle"
	]),
	R(35, "transducer_p", 564, 234, 0, [
		0,
		-14,
		"middle"
	]),
	R(36, "transducer_p", 474, 234, 0, [
		0,
		-14,
		"middle"
	]),
	R(39, "pressure_switch", 586, 234, 0, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	R(40, "pressure_switch", 452, 234, 0, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	R(41, "service_outlet", 464, 406, 0, [
		0,
		28,
		"middle"
	], { detail: "full" }),
	R(41, "service_outlet", 620, 270, 90, [
		0,
		14,
		"middle"
	], { detail: "full" }),
	R(10, "exchanger", 520, 470, 0, [
		28,
		4,
		"start"
	], {
		size: 22,
		feature: "passive_cooling",
		sides: [{
			half: "left",
			entering: ["prod_10_in"],
			leaving: ["prod_10_out"],
			enters: "bottom"
		}, {
			half: "right",
			entering: ["br_10_in"],
			leaving: ["br_10_28"],
			enters: "top"
		}]
	}),
	R(15, "pump", 385, 416, 0, [
		0,
		-19,
		"middle"
	]),
	R(16, "pump", 690, 300, 90, [
		19,
		4,
		"start"
	]),
	R(17, "pump", 340, 226, 90, [
		-14,
		4,
		"end"
	], {
		feature: "htr",
		dhw: "any"
	}),
	R(18, "vessel", 725, 520, 0, [
		-16,
		4,
		"end"
	], { detail: "full" }),
	R(19, "vessel", 368, 556, 0, [
		-16,
		4,
		"end"
	], { detail: "full" }),
	R(20, "safety_valve", 741, 440, 90, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	R(21, "safety_valve", 384, 520, 90, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	R(22, "valve", 340, 256, 0, [
		-10,
		4,
		"end"
	], {
		feature: "htr",
		dhw: "any"
	}),
	R(23, "drain_valve", 630, 572, 0, [
		14,
		4,
		"start"
	], { detail: "full" }),
	R(24, "drain_valve", 404, 572, 0, [
		14,
		4,
		"start"
	], { detail: "full" }),
	R(25, "drain_valve", 340, 318, 0, [
		-10,
		4,
		"end"
	], {
		feature: "htr",
		dhw: "any"
	}),
	R(26, "valve3", 270, 172, 270, [
		-14,
		22,
		"end"
	], { dhw: "any" }),
	R(27, "valve3", 350, 416, 0, [
		0,
		-24,
		"middle"
	], { feature: "passive_cooling" }),
	R(28, "valve3", 610, 416, 0, [
		0,
		-24,
		"middle"
	], { feature: "passive_cooling" }),
	R(31, "probe_t", 614, 228, 270, [
		0,
		-14,
		"middle"
	]),
	R(32, "probe_t", 674, 228, 270, [
		0,
		-14,
		"middle"
	]),
	R(33, "probe_t", 254, 228, 270, [
		0,
		-14,
		"middle"
	]),
	R(34, "probe_t", 296, 228, 270, [
		0,
		-14,
		"middle"
	]),
	R(37, "transducer_p", 709, 440, 270, [
		0,
		-14,
		"middle"
	]),
	R(38, "transducer_p", 352, 520, 270, [
		0,
		-14,
		"middle"
	]),
	R(44, "resistor", 270, 320, 90, [
		12,
		6,
		"start"
	], { feature: "backup_heater" }),
	R(45, "thermostat", 286, 282, 90, [
		0,
		-12,
		"middle"
	], { feature: "backup_heater" }),
	R(50, "tank", M.x + M.width / 2, M.y + M.height / 2, 0, [
		-96,
		-26,
		"end"
	], { dhw: "internal" }),
	R(51, "coil", nr.x, nr.y, 0, [
		-74,
		3,
		"middle"
	], { dhw: "internal" }),
	R(52, "service_outlet", 395, 162, 0, [
		-8,
		4,
		"end"
	], {
		dhw: "internal",
		detail: "full"
	}),
	R(53, "drain_valve", 599, 196, 270, [
		0,
		-12,
		"middle"
	], {
		dhw: "internal",
		detail: "full"
	}),
	R(54, "probe_t", 574, 171, 270, [
		26,
		-11,
		"start"
	], { dhw: "internal" })
], mr = (e) => e.split(" ").map((e) => {
	let [t, n] = e.split(",").map(Number);
	return [t ?? 0, n ?? 0];
}), z = 85, B = 50, hr = 226, gr = 206, _r = 234, vr = 214, yr = 12, V = P.coil.x + P.coil.width, br = P.passes.step / 2, xr = (I.downX - I.upX) / 2;
function Sr(e) {
	let { y0: t, step: n, count: r, left: i, right: a } = P.passes, o = [[V, t]];
	for (let e = 0; e < r; e += 1) {
		let s = t + e * n;
		e % 2 == 0 ? (e > 0 && o.push([a, s]), o.push([i, s])) : o.push([i, s], e === r - 1 ? [V, s] : [a, s]);
	}
	return (e ? o.reverse() : o).map(([e, t]) => `${String(e)},${String(t)}`).join(" ");
}
function Cr(e, t) {
	let { downX: n, upX: r, depth: i } = I, [a, o] = [(n + r) / 2, e + i];
	return t === "down" ? `${String(n)},${String(e)} ${String(n)},${String(o)} ${String(a)},${String(o)}` : `${String(a)},${String(o)} ${String(r)},${String(o)} ${String(r)},${String(e)}`;
}
var H = (...e) => e.map(([e, t]) => `${String(e)},${String(t)}`).join(" "), U = (e, t, n, r, i = {}) => ({
	id: e,
	circuit: t,
	points: mr(n),
	temperatureRole: r,
	direction: 1,
	...i
}), wr = ["production_dg1"], W = ["production_dg1", "production_dhw"], G = "production.outlet_temperature", K = "production.return_temperature", q = "production.pump", J = "brine.inlet_temperature", Y = "brine.outlet_temperature", X = "brine.pump", Tr = "compressor.discharge_temperature", Er = "compressor.suction_temperature", Dr = "refrigerant.condensation_temperature", Or = "refrigerant.evaporation_temperature", Z = "compressor.percentage", Q = "dhw.temperature", kr = "source.air_unit_outlet_temperature", Ar = [
	"dhw_sup_b",
	"dhw_sup_c",
	"dhw_ret_b",
	"dhw_ret_c",
	"dhw_ext_in",
	"dhw_ext_coil",
	"dhw_ext_out"
], jr = [
	U("p1_stub", wr, "270,130 270,118", G, { stub: !0 }),
	U("p2_stub", wr, "312,118 312,130", K, { stub: !0 }),
	U("p1_up", wr, "270,160 270,130", G, {
		dhw: "any",
		speedRole: q
	}),
	U("p1_direct", wr, "270,184 270,130", G, {
		dhw: "none",
		speedRole: q
	}),
	U("p2_in", wr, "312,130 312,198", K, { speedRole: q }),
	U("prod_44_26", W, "270,292 270,184", G, { speedRole: q }),
	U("prod_bypass44", W, "270,348 270,292", G, {
		bypass: "backup_heater",
		speedRole: q
	}),
	U("prod_8_44", W, "420,348 270,348", G, { speedRole: q }),
	U("prod_15_8", W, "397,416 420,416", K, { speedRole: q }),
	U("trunk", W, "312,198 312,416", K, { speedRole: q }),
	U("prod_27_in", W, "312,416 338,416", K, {
		through: "passive_cooling",
		speedRole: q,
		onlyWhen: { valves2728: "closed" }
	}),
	U("prod_27_15", W, "362,416 373,416", K, {
		through: "passive_cooling",
		speedRole: q
	}),
	U("prod_bypass27", W, "312,416 373,416", K, {
		bypass: "passive_cooling",
		speedRole: q
	}),
	U("prod_10_in", ["exchanger_10"], "312,416 312,492 508,492", K, {
		feature: "passive_cooling",
		speedRole: q
	}),
	U("prod_10_out", ["exchanger_10"], "508,448 350,448 350,428", G, {
		feature: "passive_cooling",
		speedRole: q
	}),
	U("prod_tap_a", W, "368,416 368,520", K, { stub: !0 }),
	U("prod_tap_b", W, "368,520 368,544", K, {
		stub: !0,
		detail: "full"
	}),
	U("prod_drain", W, "404,416 404,563", K, {
		stub: !0,
		detail: "full"
	}),
	U("dhw_sup_a", ["production_dhw"], "282,172 361,172", G, {
		dhw: "any",
		speedRole: q
	}),
	U("dhw_sup_b", ["dhw_coil"], "361,172 420,172", G, {
		dhw: "any",
		speedRole: q
	}),
	U("dhw_sup_c", ["dhw_coil"], "420,172 722,172 722,130", G, {
		dhw: "external",
		speedRole: q
	}),
	U("dhw_ret_c", ["dhw_coil"], "748,130 748,198 420,198", K, {
		dhw: "external",
		speedRole: q
	}),
	U("dhw_ret_b", ["dhw_coil"], "420,198 340,198", K, {
		dhw: "any",
		speedRole: q
	}),
	U("dhw_ret_a", ["production_dhw"], "340,198 312,198", K, {
		dhw: "any",
		speedRole: q
	}),
	U("htr_in", ["htr"], "340,198 340,214", Q, {
		feature: "htr",
		dhw: "any"
	}),
	U("htr_pump", ["htr"], "340,238 340,247", Q, {
		feature: "htr",
		dhw: "any"
	}),
	U("htr_to_9", ["htr"], "340,265 340,296 361,296", Q, {
		feature: "htr",
		dhw: "any"
	}),
	U("htr_drain", ["htr"], "340,296 340,309", Q, {
		feature: "htr",
		dhw: "any",
		stub: !0
	}),
	U("htr_riser", ["htr"], "361,250 361,172", Q, {
		feature: "htr",
		dhw: "any"
	}),
	U("dhw_ext_in", ["dhw_coil"], `722,130 722,50 ${String(ir + sr)},50 ${String(ir + sr)},${String(ar)}`, G, {
		dhw: "external",
		speedRole: q
	}),
	U("dhw_ext_coil", ["dhw_coil"], `${String(ir + sr)},${String(ar)} ${String(ir - sr)},${String(or)}`, G, {
		dhw: "external",
		speedRole: q,
		shape: {
			kind: "helix",
			cx: ir,
			top: ar,
			bottom: or,
			rx: sr,
			turns: 4.5
		}
	}),
	U("dhw_ext_out", ["dhw_coil"], `${String(ir - sr)},${String(or)} ${String(cr)},${String(or)} ${String(cr)},85 748,85 748,130`, K, {
		dhw: "external",
		speedRole: q
	}),
	U("tap_47", ["dhw_coil"], "440,118 440,138", Q, {
		dhw: "internal",
		stub: !0
	}),
	U("tap_48", ["dhw_coil"], "490,138 490,118", Q, {
		dhw: "internal",
		stub: !0
	}),
	U("tap_49", ["dhw_coil"], "540,118 540,138", Q, {
		dhw: "internal",
		stub: !0
	}),
	U("src_out", ["brine"], H([630, 130], [630, z], [_r, z]), Y, { speedRole: X }),
	U("src_in", ["brine"], H([vr, B], [690, B], [690, 130]), J, { speedRole: X }),
	U("src_air_feed", ["brine"], H([_r, z], [hr, z], [hr, F.bottom], [V, F.bottom]), Y, {
		source: ["air"],
		speedRole: X
	}),
	U("src_air_coil", ["brine"], Sr(!0), Y, {
		source: ["air"],
		speedRole: X,
		bend: br
	}),
	U("src_air_exit", ["brine"], H([V, F.top], [gr, F.top], [gr, B], [vr, B]), kr, {
		source: ["air"],
		speedRole: X
	}),
	U("src_gnd_feed", ["brine"], H([_r, z], [I.downX, z], [I.downX, L.ground]), Y, {
		source: ["ground"],
		speedRole: X
	}),
	U("src_gnd_down", ["brine"], Cr(L.ground, "down"), Y, {
		source: ["ground"],
		speedRole: X,
		roundEnd: !0,
		bend: xr
	}),
	U("src_gnd_up", ["brine"], Cr(L.ground, "up"), J, {
		source: ["ground"],
		speedRole: X,
		bend: xr
	}),
	U("src_gnd_exit", ["brine"], H([I.upX, L.ground], [I.upX, B], [vr, B]), J, {
		source: ["ground"],
		speedRole: X
	}),
	U("src_hyb_feed", ["brine"], H([_r, z], [hr, z], [hr, F.top], [V, F.top]), Y, {
		source: ["hybrid"],
		speedRole: X
	}),
	U("src_hyb_coil", ["brine"], Sr(!1), Y, {
		source: ["hybrid"],
		speedRole: X,
		bend: br
	}),
	U("src_hyb_link", ["brine"], H([V, F.bottom], [I.downX, F.bottom], [I.downX, L.hybrid]), kr, {
		source: ["hybrid"],
		speedRole: X
	}),
	U("src_hyb_down", ["brine"], Cr(L.hybrid, "down"), kr, {
		source: ["hybrid"],
		speedRole: X,
		roundEnd: !0,
		bend: xr
	}),
	U("src_hyb_up", ["brine"], Cr(L.hybrid, "up"), J, {
		source: ["hybrid"],
		speedRole: X,
		bend: xr
	}),
	U("src_hyb_exit", ["brine"], H([I.upX, L.hybrid], [I.upX, L.hybrid - 15], [yr, L.hybrid - 15], [yr, B], [vr, B]), J, {
		source: ["hybrid"],
		speedRole: X
	}),
	U("ref_discharge", ["refrigerant"], "496,250 385,250", Tr, {
		through: "htr",
		speedRole: Z
	}),
	U("ref_9_14", ["refrigerant"], "385,296 416,296", Tr, {
		through: "htr",
		speedRole: Z
	}),
	U("ref_discharge_direct", ["refrigerant"], "496,250 416,250 416,296", Tr, {
		bypass: "htr",
		speedRole: Z
	}),
	U("ref_14_8", ["refrigerant"], "444,306 444,348", Tr, {
		through: "active_cooling",
		reversible: !0,
		speedRole: Z
	}),
	U("ref_7_14", ["refrigerant"], "560,348 560,296 444,296", Er, {
		through: "active_cooling",
		reversible: !0,
		speedRole: Z
	}),
	U("ref_suction", ["refrigerant"], "444,286 610,286 610,250 524,250", Er, {
		through: "active_cooling",
		speedRole: Z
	}),
	U("ref_direct_8", ["refrigerant"], "416,296 444,296 444,348", Tr, {
		bypass: "active_cooling",
		speedRole: Z
	}),
	U("ref_direct_suction", ["refrigerant"], "560,348 560,286 610,286 610,250 524,250", Er, {
		bypass: "active_cooling",
		speedRole: Z
	}),
	U("ref_8_13", ["refrigerant"], "444,416 473,416", Dr, {
		reversible: !0,
		speedRole: Z
	}),
	U("ref_13_12", ["refrigerant"], "501,416 515,416", Dr, {
		reversible: !0,
		speedRole: Z
	}),
	U("ref_12_7", ["refrigerant"], "539,416 560,416", Or, {
		reversible: !0,
		speedRole: Z
	}),
	U("ln4_a", ["brine"], "690,130 690,288", J, { speedRole: X }),
	U("ln4_b", ["brine"], "690,312 690,348", J, { speedRole: X }),
	U("br_feed7", ["brine"], "690,348 584,348", J, {
		speedRole: X,
		onlyWhen: { valves2728: "closed" }
	}),
	U("brine_7_28", ["brine"], "584,416 598,416", Y, {
		through: "passive_cooling",
		speedRole: X,
		onlyWhen: { valves2728: "closed" }
	}),
	U("brine_28_ln3", ["brine"], "622,416 630,416", Y, {
		through: "passive_cooling",
		speedRole: X
	}),
	U("brine_bypass28", ["brine"], "584,416 630,416", Y, {
		bypass: "passive_cooling",
		speedRole: X
	}),
	U("ln3", ["brine"], "630,416 630,130", Y, { speedRole: X }),
	U("br_10_in", ["exchanger_10"], "690,348 690,448 532,448", J, {
		feature: "passive_cooling",
		speedRole: X
	}),
	U("br_10_28", ["exchanger_10"], "532,492 610,492 610,428", Y, {
		feature: "passive_cooling",
		speedRole: X
	}),
	U("brine_tap_a", ["brine"], "690,270 725,270 725,440", J, { stub: !0 }),
	U("brine_tap_b", ["brine"], "725,440 725,508", J, {
		stub: !0,
		detail: "full"
	}),
	U("brine_drain", ["brine"], "630,416 630,563", Y, {
		stub: !0,
		detail: "full"
	})
], Mr = [
	{
		over: "dhw_sup_a",
		under: "p2_in",
		at: [312, 172]
	},
	{
		over: "dhw_sup_c",
		under: "ln3",
		at: [630, 172]
	},
	{
		over: "dhw_sup_c",
		under: "ln4_a",
		at: [690, 172]
	},
	{
		over: "dhw_ret_c",
		under: "ln3",
		at: [630, 198]
	},
	{
		over: "dhw_ret_c",
		under: "ln4_a",
		at: [690, 198]
	},
	{
		over: "dhw_ret_b",
		under: "htr_riser",
		at: [361, 198]
	},
	{
		over: "trunk",
		under: "prod_8_44",
		at: [312, 348]
	},
	{
		over: "ln3",
		under: "br_feed7",
		at: [630, 348]
	},
	{
		over: "br_10_in",
		under: "br_10_28",
		at: [610, 448]
	},
	{
		over: "br_10_in",
		under: "brine_drain",
		at: [630, 448]
	},
	{
		over: "prod_10_out",
		under: "prod_tap_a",
		at: [368, 448]
	},
	{
		over: "prod_10_in",
		under: "prod_tap_a",
		at: [368, 492]
	},
	{
		over: "prod_10_out",
		under: "prod_drain",
		at: [404, 448]
	},
	{
		over: "prod_10_in",
		under: "prod_drain",
		at: [404, 492]
	}
], Nr = [
	{
		key: "dg1",
		x: 291,
		y: 112
	},
	{
		key: "outerLoop",
		x: 660,
		y: 112
	},
	{
		key: "dhw",
		x: 776,
		y: 112,
		dhw: "external"
	}
], Pr = (e, t) => t === "htr" && e.dhw === "none" ? !1 : e.features[t], Fr = (e, t) => e === "any" ? t !== "none" : e === t;
function Ir(e, t) {
	if (e.detail === "full" && t.detail !== "full" || e.source !== void 0 && !e.source.includes(t.source) || e.dhw !== void 0 && !Fr(e.dhw, t.dhw) || e.bypass !== void 0 && Pr(t, e.bypass) !== !1 || e.through !== void 0 && Pr(t, e.through) === !1) return "hidden";
	if (e.feature !== void 0) {
		let n = Pr(t, e.feature);
		if (n === !1) return "hidden";
		if (n === "unused") return "muted";
	}
	return "normal";
}
function Lr(e, t) {
	return e.flatMap((e) => {
		let n = Ir(e, t);
		return n === "hidden" ? [] : [{
			part: e,
			state: n
		}];
	});
}
var Rr = (e) => Lr(pr, e), zr = (e) => Lr(jr, e), Br = (e, t) => (e.onlyWhen === void 0 || e.onlyWhen.valves2728 === t.valves2728) && e.circuit.some((e) => t.active.has(e)), Vr = .35;
function Hr(e) {
	let t = Math.max(1, Math.round(e.turns * 2)), n = (e.bottom - e.top) / t, r = 4 / 3 * Math.max(3, n);
	return Array.from({ length: t }, (i, a) => {
		let o = a % 2 == 0, [s, c] = o ? [e.cx + e.rx, e.cx - e.rx] : [e.cx - e.rx, e.cx + e.rx], l = e.top + a * n, u = l + n, d = o ? r : -r, f = a === t - 1;
		return {
			front: o,
			curve: [
				[s, l],
				[s, l + d],
				f ? [c + (s - c) * .3, u] : [c, u + d],
				[c, u]
			]
		};
	});
}
var Ur = (e) => [...e.filter((e) => !e.front), ...e.filter((e) => e.front)];
function Wr(e) {
	let t = (e) => String(Math.round(e * 100) / 100);
	return Hr(e).map(({ front: e, curve: [n, r, i, a] }) => ({
		front: e,
		d: `M${t(n[0])} ${t(n[1])} C${t(r[0])} ${t(r[1])} ${t(i[0])} ${t(i[1])} ${t(a[0])} ${t(a[1])}`
	}));
}
function Gr(e, t) {
	let n = qr(e, 0), r = [`M${String(n[0])} ${String(n[1])}`];
	for (let n = 1; n < e.length; n += 1) {
		let [i, a, o] = [
			qr(e, n - 1),
			qr(e, n),
			e[n + 1]
		];
		if (o === void 0) {
			r.push(`L${String(a[0])} ${String(a[1])}`);
			break;
		}
		let s = Math.abs(a[0] - i[0]) + Math.abs(a[1] - i[1]), c = Math.abs(o[0] - a[0]) + Math.abs(o[1] - a[1]), l = Math.min(t, n === 1 ? s : s / 2, n === e.length - 2 ? c : c / 2), [u, d] = [Math.sign(a[0] - i[0]), Math.sign(a[1] - i[1])], [f, p] = [Math.sign(o[0] - a[0]), Math.sign(o[1] - a[1])], ee = +(u * p - d * f > 0);
		r.push(`L${String(a[0] - u * l)} ${String(a[1] - d * l)} A${String(l)} ${String(l)} 0 0 ${String(ee)} ${String(a[0] + f * l)} ${String(a[1] + p * l)}`);
	}
	return r.join(" ");
}
var Kr = (e, t) => e[0] === t[0] && e[1] === t[1];
function qr(e, t) {
	let n = e[t];
	if (n === void 0) throw Error(`No point ${String(t)}`);
	return n;
}
var Jr = (e) => e.slice(1).map((t, n) => [qr(e, n), t]), Yr = (e, t, n) => e >= Math.min(t, n) && e <= Math.max(t, n);
function Xr(e, t = [], n = 7) {
	let r = [], i, a = (e) => {
		r.push(i === void 0 ? `M${String(e[0])} ${String(e[1])}` : `L${String(e[0])} ${String(e[1])}`), i = e;
	}, o = (e) => {
		r.push(`M${String(e[0])} ${String(e[1])}`), i = e;
	};
	a(qr(e, 0));
	for (let [r, i] of Jr(e)) {
		let e = Math.sign(i[0] - r[0]), s = Math.sign(i[1] - r[1]), c = Math.abs(i[0] - r[0]) + Math.abs(i[1] - r[1]), l = t.filter((e) => Zr(e, r, i) && !Kr(e, r) && !Kr(e, i)).sort((e, t) => Math.abs(e[0] - r[0]) + Math.abs(e[1] - r[1]) - (Math.abs(t[0] - r[0]) + Math.abs(t[1] - r[1])));
		for (let t of l) {
			let l = Math.abs(t[0] - r[0]) + Math.abs(t[1] - r[1]);
			l > n && a([t[0] - e * n, t[1] - s * n]), o(c - l > n ? [t[0] + e * n, t[1] + s * n] : i);
		}
		a(i);
	}
	return r.join(" ");
}
var Zr = (e, t, n) => t[0] === n[0] && e[0] === t[0] && Yr(e[1], t[1], n[1]) || t[1] === n[1] && e[1] === t[1] && Yr(e[0], t[0], n[0]);
function Qr(e, t) {
	return Mr.filter((n) => n.under === e && t.has(n.over) && t.has(n.under)).map((e) => e.at);
}
function $r(e, t, n) {
	return e === "auto" ? t === void 0 || !(t > 0) ? !1 : t < 640 + (n ? 24 : 0) : e === "compact";
}
var ei = {
	pipe: 3,
	outline: 2
}, ti = 2, ni = 1.25, ri = (e) => Math.ceil(e * 10 - 1e-9) / 10;
function ii(e) {
	if (e === void 0 || !(e > 0)) return ei;
	let t = e / 1e3;
	return {
		pipe: Math.max(ei.pipe, ri(ti / t)),
		outline: Math.max(ei.outline, ri(ni / t))
	};
}
// src/diagram/pipes.ts
var ai = 1.2, oi = .6, si = [
	"tap_47",
	"tap_48",
	"tap_49"
], ci = [
	"prod_27_15",
	"prod_15_8",
	"prod_tap_a",
	"prod_tap_b",
	"prod_drain"
];
function li(e) {
	if (e !== void 0 && e > 0) return Math.min(8, Math.max(oi, ai * 100 / e));
}
var ui = {
	"compressor.discharge_temperature": "compressor.suction_temperature",
	"compressor.suction_temperature": "compressor.discharge_temperature",
	"refrigerant.condensation_temperature": "refrigerant.evaporation_temperature",
	"refrigerant.evaporation_temperature": "refrigerant.condensation_temperature"
}, di = (e, t) => Ar.includes(e.id) && fi(t), fi = (e) => e.active.has("htr") && !e.active.has("production_dhw");
function pi(e, t) {
	return di(e, t.circuits) ? "dhw.temperature" : e.reversible === !0 && t.mode === "active_cooling" ? ui[e.temperatureRole] ?? e.temperatureRole : (t.mode === "passive_cooling" || t.mode === "defrost") && t.circuits.valves2728 === "exchanger" && ci.includes(e.id) ? "production.outlet_temperature" : e.temperatureRole;
}
function mi(e, t, n) {
	return t === "muted" && n === "defrost" && e.feature === "passive_cooling" ? "normal" : t;
}
var hi = (e, t) => {
	let n = e[t];
	return typeof n == "number" ? n : void 0;
};
function gi(e, t, n) {
	let { mode: r, circuits: i, readings: a, stops: o } = n, s = si.includes(e.id), c = mi(e, t, r), l = s || Br(e, i), u = hi(a, pi(e, n)), d = c === "muted" || !l || u === void 0, f = e.direction === -1 != (e.reversible === !0 && r === "active_cooling"), p = {
		color: d ? k : an(u, o),
		muted: d,
		reversed: f
	};
	if (!l || c === "muted" || e.stub === !0 || s) return {
		...p,
		animated: !1
	};
	let ee = di(e, i) || e.speedRole === void 0 && e.circuit.includes("htr") ? 3 : e.speedRole === void 0 ? void 0 : li(hi(a, e.speedRole));
	return ee === void 0 ? {
		...p,
		animated: !1
	} : {
		...p,
		animated: !0,
		duration: ee
	};
}
var _i = (e) => an(hi(e.readings, "dhw.temperature"), e.stops);
function vi(e) {
	let { circuits: t, readings: n, stops: r } = e;
	return fi(t) ? an(hi(n, "dhw.temperature"), r) : t.active.has("dhw_coil") ? an(hi(n, "production.outlet_temperature"), r) : k;
}
// src/diagram/symbols.ts
var yi = .55;
function bi(e, t, n) {
	let r = -t - 9, i = t + 9;
	return y`<path class="exchanger-fill" data-half=${e} d=${e === "left" ? `M0 ${String(r)} H-16 A4 4 0 0 0 -20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 0 -16 ${String(i)} H0 Z` : `M0 ${String(r)} H16 A4 4 0 0 1 20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 1 16 ${String(i)} H0 Z`} fill=${n} fill-opacity=${yi} stroke="none" />`;
}
var xi = (e, t) => y`<text class="glyph" text-anchor="middle" dominant-baseline="central" font-size="9" fill="currentColor" stroke="none" transform="rotate(${-t})">${e}</text>`, Si = {
	kind: "helix",
	cx: 2,
	top: -60,
	bottom: 60,
	rx: 11,
	turns: 7.5
};
function Ci() {
	let e = M.x + 2 - nr.x, t = Wr(Si), { cx: n, rx: r, top: i, bottom: a } = Si, o = rr[0][1], s = rr[1][1], c = r - n;
	return y`<g transform="matrix(0 -1 1 0 0 0)">${Ur(t).map((e) => y`<path data-half=${e.front ? "front" : "back"} stroke-linecap=${e.front ? "round" : "butt"} d=${e.d} opacity=${e.front ? b : Vr} />`)}</g><path style="stroke-width: var(--pipe-width, 3)" d="M${e} ${o} H${i} M${a} ${c} V${s} H${e}" />`;
}
var wi = "M9 -10.7 L-13 -3 M9 10.7 L-13 3", Ti = (e, t) => y`<path d="M0 ${t} V${e}" />`, Ei = (e, t) => y`<path d="${e}" fill=${t ? "currentColor" : "none"} />`;
function Di(e, t) {
	let n = t.rotation ?? 0;
	switch (e) {
		case "pump": return y`<circle r="12" /><path d="M-5 -7 V7 L8 0 Z" fill="currentColor" />`;
		case "valve3": {
			let e = t.open ?? ["l", "r"];
			return y`${Ei("M-12 -6 V6 L0 0 Z", e.includes("l"))}${Ei("M12 -6 V6 L0 0 Z", e.includes("r"))}${Ei("M-6 12 H6 L0 0 Z", e.includes("d"))}<rect x="-4" y="-21" width="8" height="8" /><path d="M0 -13 V-8" />`;
		}
		case "inversion_valve": return y`<rect x="-10" y="-14" width="20" height="28" rx="3" /><path d="M-14 0 H-10 M10 -10 H14 M10 0 H14 M10 10 H14" />${t.reversed === !0 ? y`<path d="M-14 0 H14 M14 10 H5 V-10 H14" />` : y`<path d="M-14 0 H-5 V10 H14 M14 0 H5 V-10 H14" />`}`;
		case "probe_t": return y`<circle r="9" />${Ti(16, 9)}${xi("T", n)}`;
		case "transducer_p": return y`<circle r="9" />${Ti(16, 9)}${xi("P", n)}`;
		case "pressure_switch": return y`<rect x="-7" y="-7" width="14" height="14" />${Ti(16, 7)}${xi("P", n)}`;
		case "thermostat": return y`<rect x="-7" y="-7" width="14" height="14" />${Ti(16, 7)}${xi("T", n)}`;
		case "exchanger": {
			let e = t.size ?? 34, n = t.fills;
			return y`${n === void 0 ? b : y`${bi("left", e, n.left)}${bi("right", e, n.right)}`}<rect x="-20" y="${-e - 9}" width="40" height="${2 * e + 18}" rx="4" /><path d="M-12 ${-e} V${e} M12 ${-e} V${e}" /><circle cx="-12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="-12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" />`;
		}
		case "compressor": return y`<circle r="14" /><path class="compressor-lines" d="${wi}" />`;
		case "vessel": return y`<circle r="12" /><path d="M-12 2 H12" />`;
		case "safety_valve": return y`<path d="M0 16 V6 M-6 6 H6 L0 -4 Z M0 -4 L-3 -7 L3 -10 L0 -13" />`;
		case "valve": return y`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "drain_valve": return y`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "resistor": return y`<rect x="-28" y="-6" width="56" height="12" rx="2" /><path d="M-18 -6 V6 M18 -6 V6" />`;
		case "filter_dryer": return y`<rect x="-14" y="-5" width="28" height="10" rx="5" />`;
		case "expansion_valve": return y`<path d="M-12 -6 V6 L0 0 L12 -6 V6 L0 0 Z" />`;
		case "service_outlet": return y`<rect x="-3" y="-3" width="6" height="6" />${Ti(10, 3)}`;
		case "port": return y`<rect x="-5" y="-6" width="10" height="6" />`;
		case "tank": return y`<rect class="tank-body" data-dhw-tank="internal" x=${-M.width / 2} y=${-M.height / 2} width=${M.width} height=${M.height} rx="14" fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />`;
		case "coil": return Ci();
	}
}
function Oi(e, t = {}) {
	return y`<g class="symbol ${e}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${t.rotation ?? 0})">${Di(e, t)}</g>`;
}
// src/diagram/cabinet.ts
var ki = o`
  /* The stroke widths follow the card's width (add-compact-layout D4): the card sets --pipe-width and --outline-width on the svg,
     in drawing units; the fallbacks are the designed widths, used while the width is unknown. */
  .outline {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: max(3, var(--outline-width, 2));
  }
  .symbol {
    stroke-width: var(--outline-width, 2);
  }
  .pipe {
    fill: none;
    stroke: var(--secondary-text-color);
    stroke-width: var(--pipe-width, 3);
    stroke-linejoin: round;
  }
  .pipe.muted {
    stroke: var(--disabled-text-color);
  }
  /* A muted helix (external coil, coil 51) takes its own grey (refine-schematic-drawing D8; set by the card, light theme only). */
  .helix .pipe.muted {
    stroke: var(--ecogeo-coil-muted, var(--disabled-text-color));
  }
  /* The part of an idle coil pipe inside the tank, in the coil's grey (clipped to the tank body, refine-schematic-drawing D8). */
  .pipe-inside {
    fill: none;
    stroke: var(--ecogeo-coil-muted, var(--disabled-text-color));
    stroke-width: var(--pipe-width, 3);
    stroke-linejoin: round;
  }
  /* The dash overlay of an active pipe: dashes in the card colour run along it in the direction of the flow. */
  .flow {
    fill: none;
    stroke: var(--card-background-color, #fff);
    stroke-opacity: 0.55;
    stroke-width: var(--pipe-width, 3);
    stroke-linecap: round;
    stroke-dasharray: var(--pipe-width, 3) calc(var(--pipe-width, 3) * 6);
    animation: flow-dash var(--flow-duration, 2s) linear infinite;
  }
  .flow.reversed {
    animation-direction: reverse;
  }
  @keyframes flow-dash {
    to {
      stroke-dashoffset: calc(var(--pipe-width, 3) * -7);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .flow {
      animation: none;
    }
  }
  .symbol-group {
    color: var(--primary-text-color);
  }
  .symbol-group.muted {
    color: var(--disabled-text-color);
  }
  /* A component with an entity of its own opens its more-info dialog (component-info.ts). */
  .symbol-group[role='button'] {
    cursor: pointer;
  }
  .symbol-group[role='button']:focus-visible {
    ${er}
  }
  .item {
    fill: var(--secondary-text-color);
    font-size: 9px;
  }
  .circuit-label {
    fill: var(--primary-text-color);
    font-size: 10px;
    font-weight: 500;
  }
`;
function Ai(e, t) {
	return e === 26 ? t.valve26 === "dhw" ? ["l", "d"] : ["l", "r"] : t.valves2728 === "exchanger" ? ["d", "r"] : ["l", "r"];
}
function ji(e, t, n, r, i) {
	let { part: a } = e, { circuits: o } = t, s = mi(a, e.state, t.mode), [c, l, u] = a.tag, d = Ct(a.item), f = $n(Qn(Yn[a.item], r), r?.onTap);
	return y`<g class="symbol-group ${s}" data-item=${a.item} data-kind=${a.kind} aria-label=${d} role=${f.role} tabindex=${f.tabindex} @click=${f.click} @keydown=${f.keydown} style=${a.kind === "coil" ? `color: ${Ii(t)}` : b}>
    <title>${d}</title>
    <g transform="translate(${a.x} ${a.y})">${Oi(a.kind, {
		rotation: a.rotation,
		size: a.size,
		open: a.kind === "valve3" ? Ai(a.item, o) : void 0,
		reversed: a.kind === "inversion_valve" ? o.valve14 === "reversed" : void 0,
		fills: i
	})}</g>
    ${n === "full" ? y`<text class="item" x=${a.x + c} y=${a.y + l} text-anchor=${u ?? "start"}>${a.item}</text>` : b}
  </g>`;
}
function Mi(e, t, n) {
	let r = Wr(t), i = n.muted ? b : `stroke: ${n.color}`;
	return y`<g class="helix ${n.muted ? "muted" : ""}" data-segment=${e.id} style=${i}>
    ${Ur(r).map((e) => y`<path class="pipe ${n.muted ? "muted" : ""}" data-half=${e.front ? "front" : "back"} style=${i} stroke-linecap=${e.front ? "round" : "butt"} opacity=${e.front ? b : Vr} d=${e.d} />`)}
    ${n.animated ? y`<path class="flow ${n.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(n.duration)}s" d=${r.filter((e) => e.front).map((e) => e.d).join(" ")} />` : b}
  </g>`;
}
function Ni(e, t, n, r, i) {
	if (e.shape !== void 0) return Mi(e, e.shape, t);
	let a = e.bend === void 0 ? Xr(e.points, n, r) : Gr(e.points, e.bend);
	return y`<path class="pipe ${t.muted ? "muted" : ""}" data-segment=${e.id} style=${t.muted ? b : `stroke: ${t.color}`} stroke-linecap=${e.roundEnd === !0 ? "round" : b} d=${a} />${t.muted && i !== void 0 && Li.has(e.id) ? y`<path class="pipe-inside" data-inside=${e.id} clip-path="url(#${i})" d=${a} />` : b}${t.animated ? y`<path class="flow ${t.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(t.duration)}s" d=${a} />` : b}`;
}
function Pi(e, t, n, r) {
	let i = (e) => e.map((e) => n.get(e)).find((e) => e !== void 0), a = e.reversible === !0 && r === "active_cooling", [o, s] = a ? [e.leaving, e.entering] : [e.entering, e.leaving], c = i(o), l = i(s), u = (c?.muted ?? !0) && (l?.muted ?? !0), d = (e) => u ? k : e?.color ?? "var(--disabled-text-color)", f = e.enters === "top" !== a;
	return {
		id: t,
		y1: +!f,
		y2: +!!f,
		start: d(c),
		end: d(l),
		muted: u
	};
}
var Fi = (e) => y`<linearGradient id=${e.id} x1="0" y1=${e.y1} x2="0" y2=${e.y2} data-muted=${e.muted}>
      <stop offset="0" style="stop-color: ${e.start}" />
      <stop offset="1" style="stop-color: ${e.end}" />
    </linearGradient>`;
function Ii(e) {
	let t = vi(e);
	return t === "var(--disabled-text-color)" ? Zt : t;
}
var Li = /* @__PURE__ */ new Set(["dhw_ext_in", "dhw_ext_out"]);
function Ri(e, t, n, r = {
	mode: "gradient",
	idPrefix: "ecogeo"
}, i = ei.pipe) {
	let a = 7 * i / ei.pipe, o = zr(e), s = new Set(o.map((e) => e.part.id)), c = new Map(o.map((e) => [e.part.id, gi(e.part, e.state, t)])), l = [], u = e.dhw === "external" ? `${r.idPrefix}-tank-clip` : void 0, d = Rr(e).map((i) => {
		let a = r.mode === "gradient" ? i.part.sides : void 0;
		if (a === void 0) return ji(i, t, e.detail, n);
		let o = {
			left: "none",
			right: "none"
		};
		for (let e of a) {
			let n = Pi(e, `${r.idPrefix}-x${String(i.part.item)}-${e.half}`, c, t.mode);
			l.push(n), o[e.half] = `url(#${n.id})`;
		}
		return ji(i, t, e.detail, n, o);
	});
	return y`<g class="cabinet">
    <defs>${l.map(Fi)}${u === void 0 ? b : y`<clipPath id=${u} data-tank-clip><path d=${lr()} /></clipPath>`}</defs>
    <rect class="outline" x=${j.x} y=${j.y} width=${j.width} height=${j.height} rx="6" />
    ${Nr.filter((t) => e.captions !== !1 && Ir(t, e) !== "hidden").map((e) => y`<text class="circuit-label" x=${e.x} y=${e.y} text-anchor="middle">${gt[e.key]}</text>`)}
    ${o.map((e) => {
		let t = c.get(e.part.id);
		return t === void 0 ? b : Ni(e.part, t, Qr(e.part.id, s), a, u);
	})}
    ${d}
  </g>`;
}
// src/diagram/dhw.ts
var zi = o`
  .tank-body {
    stroke: var(--primary-text-color);
    stroke-width: max(2.5, var(--outline-width, 2));
  }
  .tank-rim {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: calc(var(--outline-width, 2) * 0.75);
    stroke-opacity: 0.6;
  }
  .dhw-storage[role='button'] {
    cursor: pointer;
  }
  .dhw-storage[role='button']:focus-visible {
    ${er}
  }
  .tank-caption {
    fill: var(--secondary-text-color);
    font-size: 11px;
  }
`;
function Bi(e, t) {
	if (e.dhw !== "external") return y``;
	let { x: n, y: r, width: i, dome: a } = N, o = i / 2, s = lr(), c = `M${String(n)} ${String(r + a)} A${String(o)} ${String(a)} 0 0 0 ${String(n + i)} ${String(r + a)}`, l = $n(Qn(Zn, t), t?.onTap);
	return y`<g class="dhw-storage" data-dhw="external" aria-label=${vt.externalTank} role=${l.role} tabindex=${l.tabindex} @click=${l.click} @keydown=${l.keydown}>
    <title>${vt.externalTank}</title>
    <path class="tank-body" data-dhw-tank="external" d=${s} fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />
    <path class="tank-rim" d=${c} />
    ${e.captions === !1 ? b : y`<text class="tank-caption" x=${n + i / 2} y=${r - 6} text-anchor="middle">${vt.externalTank}</text>`}
  </g>`;
}
// src/lib/format.ts
var Vi = "−";
function Hi(e) {
	let t = e?.locale;
	return typeof t == "object" && t ? t : e?.language === void 0 ? {} : { language: e.language };
}
function Ui(e) {
	switch (e.number_format) {
		case "comma_decimal": return ["en-US", "en"];
		case "decimal_comma": return [
			"de",
			"es",
			"it"
		];
		case "quote_decimal": return ["de-CH"];
		case "space_comma": return [
			"fr",
			"sv",
			"cs"
		];
		case "none": return ["en-US"];
		case "system": return;
		default: return e.language === void 0 ? void 0 : [e.language];
	}
}
var Wi = /* @__PURE__ */ new Map();
function Gi(e, t, n) {
	let r = Ui(e), i = n && e.number_format !== "none", a = `${r?.join(",") ?? ""}|${String(t)}|${String(i)}`, o = Wi.get(a);
	return o === void 0 && (o = new Intl.NumberFormat(r, {
		minimumFractionDigits: t,
		maximumFractionDigits: t,
		useGrouping: i
	}), Wi.set(a, o)), o;
}
function Ki(e, t, n = 0, r = !0) {
	if (!Number.isFinite(e)) return "–";
	let i = Number.isFinite(n) ? Math.min(20, Math.max(0, Math.trunc(n))) : 0, a = Math.abs(e) < .5 / 10 ** i ? 0 : e;
	return Gi(t ?? {}, i, r).formatToParts(a).map((e) => e.type === "minusSign" ? Vi : e.value).join("");
}
// src/calc/display.ts
function qi(e) {
	if (typeof e != "object" || !e) return;
	let t = e.display_precision;
	return typeof t == "number" && Number.isInteger(t) && t >= 0 && t <= 20 ? t : void 0;
}
var Ji = (e, t) => t ?? e.decimals ?? 0;
function Yi(e, t) {
	let n = typeof t == "string" ? t.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase() : "";
	return n === (e.unit ?? "").toLowerCase() || e.quantity === "difference" && n === "°c";
}
function Xi(e, t, n, r) {
	let i = Et.get(e);
	if (i === void 0 || t === void 0 || !Number.isFinite(t)) return;
	let a = n === void 0 || !Yi(i, r.states?.[n]?.attributes.unit_of_measurement) ? void 0 : qi(r.entities?.[n]), o = Ki(t, r.locale, Ji(i, a), !1);
	return i.unit === void 0 ? o : `${o} ${i.unit}`;
}
// src/diagram/labels.ts
var Zi = o`
  .diagram {
    position: relative;
    container-type: inline-size;
  }
  .diagram svg {
    display: block;
    width: 100%;
    height: auto;
  }
  /* One drawing unit is 1 cqw / 10: the labels grow and shrink with the drawing, never below 8 px. */
  .label {
    position: absolute;
    display: inline-flex;
    align-items: baseline;
    gap: 0.3em;
    padding: 0 0.15em;
    border-radius: 2px;
    font-size: max(8px, 0.95cqw);
    line-height: 1.2;
    white-space: nowrap;
    color: var(--primary-text-color);
    background: color-mix(in srgb, var(--card-background-color, #fff) 80%, transparent);
    transform: translate(-50%, -50%);
  }
  .label.start {
    transform: translate(0, -50%);
  }
  .label.end {
    transform: translate(-100%, -50%);
  }
  .label.bare {
    background: none;
  }
  .label.emphasis {
    font-size: max(9px, 1.2cqw);
    font-weight: 600;
  }
  .caption {
    color: var(--secondary-text-color);
    font-size: 0.85em;
  }
  /* The compact layout shows few labels, so they can be larger and never drop below 10 px (add-compact-layout D5). */
  [data-layout='compact'] .label {
    font-size: max(10px, 1.6cqw);
  }
  [data-layout='compact'] .label.emphasis {
    font-size: max(11px, 1.9cqw);
  }
  [data-layout='compact'] .label .caption {
    font-size: 1em;
  }
  /* A caption on its own line above the value (STACKED_CAPTIONS): the label is two lines tall and as wide as the value. */
  .label.stacked {
    flex-direction: column;
    align-items: center;
    gap: 0;
  }
  .label.stacked.start {
    align-items: flex-start;
  }
  .label.stacked.end {
    align-items: flex-end;
  }
  .value {
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    color: inherit;
  }
  button.value {
    cursor: pointer;
  }
  .value.missing {
    color: var(--disabled-text-color);
  }
  .footer-item {
    display: inline-flex;
    gap: 0.3em;
    align-items: baseline;
  }
`, Qi = {
	production_out: {
		x: 332,
		y: 447,
		align: "middle"
	},
	production_in: {
		x: 320,
		y: 367,
		align: "middle"
	},
	brine_out: {
		x: 580,
		y: 255,
		align: "start"
	},
	brine_in: {
		x: 730,
		y: 476,
		align: "end"
	},
	compressor_speed: {
		x: 456,
		y: 307,
		align: "start"
	},
	air_unit_out: {
		x: 232,
		y: 111,
		align: "end"
	},
	ground_out: {
		x: 100,
		y: 155,
		align: "middle"
	},
	hybrid_ground_out: {
		x: 100,
		y: 435,
		align: "middle"
	},
	tank_internal_temperature: {
		x: 604,
		y: 176,
		align: "start"
	}
}, $i = {
	production_out: E.portOut,
	production_in: E.portIn,
	brine_out: E.portOut,
	brine_in: E.portIn,
	tank_internal_temperature: E.dhw,
	tank_external_temperature: E.dhw
}, ea = /* @__PURE__ */ new Set(["tank_internal_temperature"]), ta = /* @__PURE__ */ new Set([
	"production_out",
	"production_in",
	"brine_out",
	"brine_in",
	"compressor_speed",
	"air_unit_out",
	"ground_out",
	"hybrid_ground_out",
	"tank_external_temperature",
	"tank_internal_temperature"
]), $ = (e, t, n, r, i, a = {}) => {
	let o = Qi[e], s = $i[e];
	return {
		id: e,
		role: t,
		tier: ta.has(e) ? "key" : "detail",
		x: n,
		y: r,
		align: i,
		...o === void 0 ? {} : { compact: o },
		...s === void 0 ? {} : { compactCaption: s },
		...a
	};
}, na = N.x + N.width / 2, ra = N.y + N.height + 22, ia = M.y + 12, aa = M.x + M.width / 2, oa = P.y + P.height + 12, sa = ur + 6, ca = 12, la = 20, ua = [
	$("production_out", "production.outlet_temperature", 237, 228, "end", { item: 33 }),
	$("production_in", "production.return_temperature", 291, 247, "middle", { item: 34 }),
	$("production_pressure", "production.pressure", 360, 537, "end", { item: 38 }),
	$("production_pump", "production.pump", 396, 380, "end", { item: 15 }),
	$("dg1_setpoint", "heating.setpoint", 291, 96, "middle", { item: 1 }),
	$("dg1_demand", "heating.demand", 320, 123, "start", {
		item: 1,
		demand: !0
	}),
	$("brine_out", "brine.outlet_temperature", 633, 247, "start", { item: 31 }),
	$("brine_in", "brine.inlet_temperature", 697, 247, "start", { item: 32 }),
	$("brine_pressure", "brine.pressure", 689, 459, "start", { item: 37 }),
	$("brine_pump", "brine.pump", 676, 300, "end", { item: 16 }),
	$("discharge_temperature", "compressor.discharge_temperature", 436, 262, "start", { item: 30 }),
	$("discharge_pressure", "compressor.discharge_pressure", 480, 275, "middle", { item: 36 }),
	$("suction_temperature", "compressor.suction_temperature", 528, 262, "start", { item: 29 }),
	$("suction_pressure", "compressor.suction_pressure", 570, 275, "middle", { item: 35 }),
	$("compressor_speed", "compressor.speed", 503, 307, "middle", { item: 11 }),
	$("compressor_percentage", "compressor.percentage", 503, 319, "middle", { item: 11 }),
	$("compressor_power", "compressor.power", 503, 331, "middle", { item: 11 }),
	$("superheat", "refrigerant.superheat", 527, 376, "middle", { item: 12 }),
	$("expansion_valve", "refrigerant.expansion_valve", 527, 388, "middle", { item: 12 }),
	$("condensation_temperature", "refrigerant.condensation_temperature", 432, 437, "middle", { item: 8 }),
	$("evaporation_temperature", "refrigerant.evaporation_temperature", 572, 437, "middle", { item: 7 }),
	$("fan_speed", "source.fan_speed", P.fanX, oa, "middle", {
		source: ["air", "hybrid"],
		caption: E.fan
	}),
	$("outside_temperature", "source.outside_temperature", P.fanX, oa + 13, "middle", {
		source: ["air", "hybrid"],
		caption: E.outside
	}),
	$("air_unit_in", "brine.outlet_temperature", sa, F.bottom - ca, "start", {
		source: ["air"],
		caption: E.portIn
	}),
	$("air_unit_out", "source.air_unit_outlet_temperature", sa, F.top + ca, "start", {
		source: ["air"],
		caption: E.portOut
	}),
	$("hybrid_air_unit_in", "brine.outlet_temperature", sa, F.top + ca, "start", {
		source: ["hybrid"],
		caption: E.portIn
	}),
	$("ground_in", "brine.outlet_temperature", I.downX + 6, L.ground + la, "start", {
		source: ["ground"],
		caption: E.portIn
	}),
	$("ground_out", "brine.inlet_temperature", I.upX - 6, L.ground + la, "end", {
		source: ["ground"],
		caption: E.portOut
	}),
	$("hybrid_ground_out", "brine.inlet_temperature", I.upX - 6, L.hybrid + la, "end", {
		source: ["hybrid"],
		caption: E.portOut
	}),
	$("tank_external_temperature", "dhw.temperature", na, ra, "middle", {
		dhw: "external",
		emphasis: !0
	}),
	$("tank_external_setpoint", "dhw.setpoint", na, ra + 15, "middle", {
		dhw: "external",
		caption: E.setpoint
	}),
	$("tank_external_start_delta", "dhw.start_delta", na, ra + 29, "middle", {
		dhw: "external",
		caption: E.startDelta
	}),
	$("tank_external_demand", "dhw.demand", na, ra + 43, "middle", {
		dhw: "external",
		demand: !0
	}),
	$("tank_internal_temperature", "dhw.temperature", M.x + M.width / 6, ia, "middle", {
		dhw: "internal",
		bare: !0
	}),
	$("tank_internal_setpoint", "dhw.setpoint", aa, ia, "middle", {
		dhw: "internal",
		caption: E.setpointShort,
		bare: !0
	}),
	$("tank_internal_start_delta", "dhw.start_delta", M.x + M.width * 5 / 6, ia, "middle", {
		dhw: "internal",
		caption: E.startDeltaShort,
		bare: !0
	}),
	$("tank_internal_demand", "dhw.demand", aa, ia + 13, "middle", {
		dhw: "internal",
		demand: !0,
		bare: !0
	})
];
function da(e, t, n, r, i = !1) {
	return ua.flatMap((a) => {
		if (i && a.tier !== "key" || Ir(a, e) === "hidden") return [];
		let o = n[a.role], s = i ? a.compact : void 0, c = (i ? a.compactCaption : void 0) ?? a.caption, l = s ?? {
			x: a.x,
			y: a.y,
			align: a.align
		}, u = {
			id: a.id,
			role: a.role,
			...l,
			emphasis: a.emphasis === !0,
			...a.bare === !0 && s === void 0 ? { bare: !0 } : {},
			entityId: o,
			...a.item === void 0 ? {} : { item: a.item },
			...c === void 0 ? {} : { caption: c },
			...i && c !== void 0 && ea.has(a.id) ? { stacked: !0 } : {}
		}, d = t[a.role];
		if (a.demand === !0) {
			let e = a.role === "heating.demand" ? yt.demand : vt.demand;
			return d === !0 ? [{
				...u,
				text: e,
				missing: !1
			}] : [];
		}
		let f = Xi(a.role, typeof d == "number" ? d : void 0, o, r);
		return [{
			...u,
			text: f ?? "–",
			missing: f === void 0
		}];
	});
}
var fa = /* @__PURE__ */ new Set(["outside_temperature", "cop"]);
function pa(e, t, n, r = !1) {
	let i = (e, n, r, i) => ({
		id: e,
		tier: fa.has(e) ? "key" : "detail",
		...r === void 0 ? {} : { caption: r },
		text: i ?? "–",
		missing: i === void 0,
		entityId: t[n]
	}), a = (r, a, o) => {
		let s = e[a];
		return i(r, a, o, Xi(a, typeof s == "number" ? s : void 0, t[a], n));
	}, o = e["unit.on_off"], s = e["unit.summer"] === !0 ? bt.summer : e["unit.winter"] === !0 ? bt.winter : void 0, c = [
		i("on_off", "unit.on_off", void 0, o === void 0 ? void 0 : xt[o.toLowerCase()] ?? o),
		i("season", e["unit.summer"] === !0 ? "unit.summer" : "unit.winter", void 0, s),
		a("outside_temperature", "source.outside_temperature", bt.outside),
		a("cop", "unit.cop", bt.cop),
		a("condensation_capacity", "heating.capacity", bt.condensation),
		a("evaporation_capacity", "cooling.capacity", bt.evaporation)
	];
	return r ? c.filter((e) => e.tier === "key") : c;
}
var ma = (e) => ({
	left: `${String(e.x / tr.width * 100)}%`,
	top: `${String(e.y / tr.height * 100)}%`
});
function ha(e, t, n, r) {
	let i = n ? "value missing" : "value";
	return e === void 0 || r === void 0 ? v`<span class=${i}>${t}</span>` : v`<button
        class=${i}
        type="button"
        @click=${() => {
		r(e);
	}}
      >
        ${t}
      </button>`;
}
function ga(e, t) {
	return v`${e.map((e) => {
		let { left: n, top: r } = ma(e);
		return v`<span
      class="label ${e.align}${e.emphasis ? " emphasis" : ""}${e.bare === !0 ? " bare" : ""}${e.stacked === !0 ? " stacked" : ""}"
      data-label=${e.id}
      data-role=${e.role}
      data-label-item=${e.item ?? b}
      style="left: ${n}; top: ${r}"
      >${e.caption === void 0 ? b : v`<span class="caption">${e.caption}</span>`}${ha(e.entityId, e.text, e.missing, t)}</span
    >`;
	})}`;
}
function _a(e, t) {
	return v`${e.map((e) => v`<span class="footer-item" data-footer=${e.id}
        >${e.caption === void 0 ? b : v`<span class="caption">${e.caption}</span>`}${ha(e.entityId, e.text, e.missing, t)}</span
      >`)}`;
}
// src/diagram/source.ts
var va = o`
  .source-outline {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: max(2.5, var(--outline-width, 2));
  }
  .source-frame {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: var(--outline-width, 2);
  }
  .source-fin {
    stroke: var(--secondary-text-color);
    stroke-opacity: 0.55;
    stroke-width: calc(var(--outline-width, 2) * 0.5);
  }
  .source-slat {
    stroke: var(--secondary-text-color);
    stroke-width: var(--outline-width, 2);
    stroke-linecap: round;
  }
  .source-divider {
    stroke: var(--primary-text-color);
    stroke-width: calc(var(--outline-width, 2) * 0.75);
  }
  .source-ground {
    stroke: var(--secondary-text-color);
    stroke-width: calc(var(--outline-width, 2) * 0.75);
  }
  /* The brine circuit is inactive: the housing, coil and ground line are muted like the pipes; the fan follows its own speed. */
  .muted .source-outline,
  .muted .source-frame,
  .muted .source-fin,
  .muted .source-slat,
  .muted .source-divider,
  .muted .source-ground {
    stroke: var(--disabled-text-color);
  }
  .muted .source-caption {
    fill: var(--disabled-text-color);
  }
  .source-caption {
    fill: var(--secondary-text-color);
    font-size: 11px;
  }
  .fan-part[role='button'] {
    cursor: pointer;
  }
  .fan-part[role='button']:focus-visible {
    ${er}
  }
  .fan-ring {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: var(--outline-width, 2);
  }
  .fan-blade {
    fill: var(--secondary-text-color);
  }
  .fan-rotor {
    animation: fan-spin var(--fan-duration, 2s) linear infinite;
  }
  .fan-rotor.still {
    animation: none;
  }
  @keyframes fan-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .fan-rotor {
      animation: none;
    }
  }
`, ya = (e) => e === void 0 || !(e > 0) ? void 0 : Math.min(6, Math.max(.5, 120 / e)), ba = [
	0,
	72,
	144,
	216,
	288
].map((e) => y`<path class="fan-blade" d="M0 -4 C9 -6 21 -16 17 -30 C6 -26 -3 -17 -3 -6 Z" transform="rotate(${e})" />`);
function xa(e, t, n, r) {
	let { x: i, y: a, width: o, height: s, fanX: c, fanY: l, fanRadius: u, coil: d, fins: f, slats: p, dividerY: ee } = P, m = ya(e), te = Array.from({ length: f.count }, (e, t) => f.x + t * f.step), ne = Array.from({ length: p.count }, (e, t) => p.y0 + t * p.step), [re, ie] = [i + 6, c + u + 6], ae = c - u - 6 - re, oe = $n(Qn(Xn, n), n?.onTap);
	return y`<g class="air-unit${t ? " muted" : ""}" data-source="air">
    <rect class="source-outline" x=${i} y=${a} width=${o} height=${s} rx="6" />
    <path class="source-divider" d="M${i} ${ee} H${i + o}" />
    ${ne.map((e) => y`<path class="source-slat" data-slat d="M${re} ${e} h${ae} M${ie} ${e} h${ae}" />`)}
    <rect class="source-frame" data-coil-block x=${d.x} y=${d.y} width=${d.width} height=${d.height} rx="3" />
    ${te.map((e) => y`<path class="source-fin" d="M${e} ${f.y0} V${f.y1}" />`)}
    <g class="fan-part" aria-label=${wt} role=${oe.role} tabindex=${oe.tabindex} @click=${oe.click} @keydown=${oe.keydown}>
      <title>${wt}</title>
      <circle class="fan-ring" cx=${c} cy=${l} r=${u} />
      <circle class="fan-hit" cx=${c} cy=${l} r=${u} fill="transparent" stroke="none" />
      <g class="fan" data-fan transform="translate(${c} ${l})">
        <g class=${m === void 0 ? "fan-rotor still" : "fan-rotor"} style=${m === void 0 ? "" : `--fan-duration: ${String(m)}s`}>${ba}<circle class="fan-hub" r="5" fill="var(--primary-text-color)" /></g>
      </g>
    </g>
    ${r ? y`<text class="source-caption" x=${P.captionX} y=${P.captionY} text-anchor="middle">${_t.air}</text>` : b}
  </g>`;
}
function Sa(e, t) {
	return zr(e).flatMap(({ part: e }) => e.id.startsWith("src_") ? e.points.slice(1).flatMap((n, r) => {
		let i = e.points[r];
		return i?.[0] === n[0] && t >= Math.min(i[1], n[1]) && t <= Math.max(i[1], n[1]) ? [n[0]] : [];
	}) : []);
}
function Ca(e, t, n, r) {
	let i = Sa(e, n), a = Array.from({ length: Math.floor((dr.end - dr.start - 12) / 10) + 1 }, (e, t) => dr.start + 6 + t * 10).filter((e) => !i.some((t) => Math.abs(t - e) < 10)), o = fr.y[t];
	return y`<g class="ground-loop${r ? " muted" : ""}" data-source="ground">
    <path class="source-ground" d="M${dr.start} ${n} H${dr.end}" />
    ${a.map((e) => y`<path class="source-ground" d="M${e} ${n} l-6 8" />`)}
    ${e.captions === !1 ? b : y`<text class="source-caption" x=${fr.x} y=${o} text-anchor="middle">${_t.ground}</text>`}
  </g>`;
}
function wa(e, t, n, r) {
	let i = e.source === "air" || e.source === "hybrid", a = e.source === "ground" || e.source === "hybrid", o = e.source === "hybrid" ? "hybrid" : "ground";
	return y`<g class="source" data-source-kind=${e.source}>
    ${i ? xa(t["source.fan_speed"], !n, r, e.captions !== !1) : y``}
    ${a ? Ca(e, o, L[o], !n) : y``}
  </g>`;
}
// src/lib/define.ts
function Ta(e, t) {
	let n = customElements.get(e);
	n === void 0 ? customElements.define(e, t) : n !== t && console.warn(`${e} is already defined by another copy of the module; that copy stays in use.`);
}
// src/lib/render.ts
function Ea(e, t) {
	return e === t || Array.isArray(e) && Array.isArray(t) && e.length === t.length && e.every((e, n) => e === t[n]);
}
function Da(e, t) {
	if (e === t) return !0;
	if (typeof e != "object" || typeof t != "object" || e === null || t === null) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	return n.length === r.length && n.every((n) => Object.hasOwn(t, n) && Ea(e[n], t[n]));
}
function Oa(e, t, n) {
	return e === void 0 || e.locale !== t.locale || e.language !== t.language || e.localize !== t.localize || e.formatEntityState !== t.formatEntityState || e.themes?.darkMode !== t.themes?.darkMode || n.some((n) => e.states[n] !== t.states[n] || !Da(e.entities?.[n], t.entities?.[n]));
}
function ka(e, t, n, r) {
	return e.size === 1 && e.has("hass") ? t !== void 0 && Oa(n, t, r) : !0;
}
// src/card/ecogeo-card.ts
var Aa = "ecogeo-card", ja = tr.width, Ma = tr.height, Na = 0;
Ta(Aa, class extends Ue {
	static {
		this.styles = [
			ki,
			va,
			zi,
			Zi,
			o`
      /* Block, so the ResizeObserver reports the card's width (an inline element reports none). */
      :host {
        display: block;
      }
      .footer {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 4px 16px;
        padding: 8px 16px 12px;
      }
      .mode {
        font-weight: 500;
      }
      .sample {
        color: var(--secondary-text-color);
      }
      .alarm {
        color: var(--error-color);
      }
    `
		];
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			config: { state: !0 },
			width: { state: !0 }
		};
	}
	constructor() {
		super(), this.renderedCompact = !1, this.renderedAutoCompact = !1, this.renderedStroke = ii(void 0), this.entityIds = [], this.idPrefix = `ecogeo${String(++Na)}`, this.width = 0;
	}
	get shownLayout() {
		return $r(this.resolved?.layout ?? "auto", this.width, this.renderedAutoCompact) ? "compact" : "full";
	}
	connectedCallback() {
		super.connectedCallback(), this.observer = new ResizeObserver((e) => {
			let t = e.at(-1)?.contentRect.width;
			t !== void 0 && t !== this.width && (this.width = t);
		}), this.observer.observe(this);
	}
	disconnectedCallback() {
		this.observer?.disconnect(), this.observer = void 0, super.disconnectedCallback();
	}
	setConfig(e) {
		let t = Bn(e);
		if (t.length > 0) throw Error(t.join("; "));
		this.resolved = Jn(e), this.entityIds = [...new Set(Object.values(this.resolved.entities).filter((e) => e !== void 0))], this.config = e;
	}
	getCardSize() {
		return 10;
	}
	getGridOptions() {
		return {
			columns: "full",
			rows: "auto",
			min_rows: 8
		};
	}
	shouldUpdate(e) {
		if (e.size === 1 && e.has("width")) {
			let e = ii(this.width);
			return this.shownLayout === "compact" !== this.renderedCompact || e.pipe !== this.renderedStroke.pipe || e.outline !== this.renderedStroke.outline;
		}
		return ka(e, this.hass, this.renderedHass, this.entityIds);
	}
	readings(e) {
		let t = e.sample ? Gn : this.hass?.states ?? {};
		return {
			readings: jt(t, e.entities),
			offline: Ye(it(t, e.entities["unit.connection"]))
		};
	}
	render() {
		this.renderedHass = this.hass;
		let e = this.shownLayout, t = e === "compact";
		this.renderedCompact = t, this.renderedAutoCompact = t && this.resolved?.layout === "auto";
		let n = ii(this.width);
		this.renderedStroke = n;
		let r = this.resolved;
		if (r === void 0) return v`<ha-card data-layout=${e}><div class="diagram"></div></ha-card>`;
		let i = t ? {
			...r,
			detail: "simplified",
			captions: !1
		} : r, { readings: a, offline: o } = this.readings(i), s = Je(a, i.features), c = Ze(s, i.features, i.dhw, a), l = {
			mode: s,
			circuits: c,
			readings: a,
			stops: i.colors
		}, u = i.sample ? Gn : this.hass?.states ?? {}, d = {
			locale: Hi(this.hass),
			entities: this.hass?.entities,
			states: u
		}, f = i.sample ? void 0 : (e) => {
			at(this, e);
		}, p = {
			entities: i.entities,
			onTap: f
		};
		return v`<ha-card data-layout=${e}>
      <div class="diagram">
        <svg
          viewBox="0 0 ${ja} ${Ma}"
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label=${pt}
          style="--dhw-tank-color: ${_i(l)}; --ecogeo-coil-muted: ${Qt(this.hass?.themes?.darkMode === !0)}; --pipe-width: ${String(n.pipe)}; --outline-width: ${String(n.outline)}"
        >
          ${y`${wa(i, a, c.active.has("brine"), p)}${Bi(i, p)}${Ri(i, l, p, {
			mode: i.exchangerFill,
			idPrefix: this.idPrefix
		}, n.pipe)}`}
        </svg>
        ${ga(da(i, a, i.entities, d, t), f)}
      </div>
      <div class="footer">
        <span class="mode">${mt[s]}</span>
        ${_a(pa(a, i.entities, d, t), f)}
        ${Xe(a["unit.alarm"]) ? v`<span class="alarm">${ht.alarm}</span>` : b}
        ${o ? v`<span class="offline">${ht.offline}</span>` : b}
        ${i.sample ? v`<span class="sample">${ht.sampleValues}</span>` : b}
      </div>
    </ha-card>`;
	}
});
// src/index.ts
var Pa = {
	type: Aa,
	...ft,
	preview: !0
};
function Fa(e = window) {
	let t = e.customCards ??= [];
	t.some((e) => e.type === Pa.type) || t.push({ ...Pa });
}
Fa();
export { Pa as CARD_ENTRY, Fa as registerCardPicker };
