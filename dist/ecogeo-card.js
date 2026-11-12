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
}, h = (e, t) => !l(e, t), oe = {
	attribute: !0,
	type: String,
	converter: ae,
	reflect: !1,
	useDefault: !1,
	hasChanged: h
};
Symbol.metadata ??= Symbol("metadata"), m.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var se = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = oe) {
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
		return this.elementProperties.get(e) ?? oe;
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
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? h)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
se.elementStyles = [], se.shadowRootOptions = { mode: "open" }, se[ie("elementProperties")] = /* @__PURE__ */ new Map(), se[ie("finalized")] = /* @__PURE__ */ new Map(), re?.({ ReactiveElement: se }), (m.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var ce = globalThis, le = (e) => e, ue = ce.trustedTypes, de = ue ? ue.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, fe = "$lit$", g = `lit$${Math.random().toFixed(9).slice(2)}$`, pe = "?" + g, me = `<${pe}>`, he = document, ge = () => he.createComment(""), _e = (e) => e === null || typeof e != "object" && typeof e != "function", ve = Array.isArray, ye = (e) => ve(e) || typeof e?.[Symbol.iterator] == "function", be = "[ 	\n\f\r]", xe = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Se = /-->/g, Ce = />/g, _ = RegExp(`>|${be}(?:([^\\s"'>=/]+)(${be}*=${be}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), we = /'/g, Te = /"/g, Ee = /^(?:script|style|textarea|title)$/i, De = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), v = De(1), y = De(2), Oe = Symbol.for("lit-noChange"), b = Symbol.for("lit-nothing"), ke = /* @__PURE__ */ new WeakMap(), x = he.createTreeWalker(he, 129);
function Ae(e, t) {
	if (!ve(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return de === void 0 ? t : de.createHTML(t);
}
var je = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = xe;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === xe ? c[1] === "!--" ? o = Se : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = _) : (Ee.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = _) : o = Ce : o === _ ? c[0] === ">" ? (o = i ?? xe, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? _ : c[3] === "\"" ? Te : we) : o === Te || o === we ? o = _ : o === Se || o === Ce ? o = xe : (o = _, i = void 0);
		let d = o === _ && e[t + 1].startsWith("/>") ? " " : "";
		a += o === xe ? n + me : l >= 0 ? (r.push(s), n.slice(0, l) + fe + n.slice(l) + g + d) : n + g + (l === -2 ? t : d);
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
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(fe)) {
					let t = u[o++], n = i.getAttribute(e).split(g), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Le : r[1] === "?" ? Re : r[1] === "@" ? ze : Ie
					}), i.removeAttribute(e);
				} else e.startsWith(g) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (Ee.test(i.tagName)) {
					let e = i.textContent.split(g), t = e.length - 1;
					if (t > 0) {
						i.textContent = ue ? ue.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], ge()), x.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], ge());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === pe) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(g, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += g.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = he.createElement("template");
		return n.innerHTML = e, n;
	}
};
function Ne(e, t, n = e, r) {
	if (t === Oe) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = _e(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = Ne(e, i._$AS(e, t.values), i, r)), t;
}
var Pe = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? he).importNode(t, !0);
		x.currentNode = r;
		let i = x.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Fe(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Be(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = x.nextNode(), a++);
		}
		return x.currentNode = he, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, Fe = class e {
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
		e = Ne(this, e, t), _e(e) ? e === b || e == null || e === "" ? (this._$AH !== b && this._$AR(), this._$AH = b) : e !== this._$AH && e !== Oe && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ye(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== b && _e(this._$AH) ? this._$AA.nextSibling.data = e : this.T(he.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Me.createElement(Ae(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Pe(r, this), n = e.u(this.options);
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
			let t = le(e).nextSibling;
			le(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, Ie = class {
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
		if (i === void 0) e = Ne(this, e, t, 0), a = !_e(e) || e !== this._$AH && e !== Oe, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = Ne(this, r[n + o], t, o), s === Oe && (s = this._$AH[o]), a ||= !_e(s) || s !== this._$AH[o], s === b ? e = b : e !== b && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === b ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Le = class extends Ie {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === b ? void 0 : e;
	}
}, Re = class extends Ie {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== b);
	}
}, ze = class extends Ie {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = Ne(this, e, t, 0) ?? b) === Oe) return;
		let n = this._$AH, r = e === b && n !== b || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== b && (n === b || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Be = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		Ne(this, e);
	}
}, Ve = ce.litHtmlPolyfillSupport;
Ve?.(Me, Fe), (ce.litHtmlVersions ??= []).push("3.3.3");
var He = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Fe(t.insertBefore(ge(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Ue = globalThis, We = class extends se {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = He(t, this.renderRoot, this.renderOptions);
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
We._$litElement$ = !0, We.finalized = !0, Ue.litElementHydrateSupport?.({ LitElement: We });
var Ge = Ue.litElementPolyfillSupport;
Ge?.({ LitElement: We }), (Ue.litElementVersions ??= []).push("4.2.2");
// src/calc/mode.ts
var Ke = [
	"off",
	"unavailable",
	"unknown"
], qe = (e, t) => e?.trim().toLowerCase() === t, Je = (e) => e !== void 0 && e > 0;
function Ye(e, t) {
	if (qe(e["unit.on_off"], "off")) return "off";
	if (qe(e["compressor.mode"], "defrost")) return "defrost";
	let n = e["compressor.speed"];
	if (n === void 0) return "standby";
	let r = e["unit.summer"] === !0;
	return Je(n) ? e["dhw.demand"] === !0 ? "dhw" : r && t.active_cooling === !0 ? "active_cooling" : "heating" : r && Je(e["production.pump"]) && t.passive_cooling === !0 ? "passive_cooling" : "standby";
}
function Xe(e) {
	return e !== void 0 && Ke.includes(e.state.trim().toLowerCase());
}
var Ze = (e) => e === !0;
// src/calc/circuits.ts
function Qe(e, t, n, r) {
	let i = /* @__PURE__ */ new Set(), a = t.passive_cooling !== !1, o = n === "external" || n === "internal";
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
	return Je(r["brine.pump"]) || i.delete("brine"), {
		valve26: e === "dhw" ? "dhw" : "production",
		valve14: e === "active_cooling" ? "reversed" : "normal",
		valves2728: (e === "passive_cooling" || e === "defrost") && a ? "exchanger" : "closed",
		active: i
	};
}
// src/lib/availability.ts
var $e = /* @__PURE__ */ new Set(["unknown", "unavailable"]), et = -999, tt = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;
function nt(e) {
	if (!tt.test(e)) return;
	let t = Number(e);
	return Number.isFinite(t) ? t + 0 : void 0;
}
function rt(e) {
	if (e === void 0 || $e.has(e.state)) return !0;
	let t = nt(e.state);
	return t !== void 0 && t <= et;
}
function it(e) {
	if (!(e === void 0 || rt(e))) return nt(e.state);
}
// src/lib/hass.ts
var at = (e, t) => t === void 0 ? void 0 : e[t];
function ot(e, t) {
	e.dispatchEvent(new CustomEvent("hass-more-info", {
		detail: { entityId: t },
		bubbles: !0,
		composed: !0
	}));
}
// src/lib/units.ts
var st = { scale: 1 }, ct = {
	scale: 5 / 9,
	offset: -32
}, lt = {
	temperature: /* @__PURE__ */ new Map([["°c", st], ["°f", ct]]),
	difference: /* @__PURE__ */ new Map([
		["k", st],
		["°c", st],
		["°f", ct]
	]),
	power: /* @__PURE__ */ new Map([["w", st], ["kw", { scale: 1e3 }]])
};
function ut(e) {
	return e.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase();
}
function dt(e, t) {
	let n = it(e);
	return n === void 0 ? void 0 : ft(t, n, e?.attributes.unit_of_measurement);
}
function ft(e, t, n) {
	if (!Number.isFinite(t) || n === void 0) return;
	let r = lt[e].get(ut(n));
	return r ? (t + (r.offset ?? 0)) * r.scale : void 0;
}
// src/strings.ts
var S = {
	invalid: (e, t) => `Invalid option ${e}: expected ${t}`,
	number: (e, t) => `a number from ${e} to ${t}`,
	color: "a CSS colour such as #db4437 or rgb(219, 68, 55)",
	boolean: "true or false",
	object: "a group of options",
	choice: (e) => `one of ${e.join(", ")}`,
	list: "a list of texts"
}, pt = {
	name: "ecoGEO Schematic",
	description: "The internal schematic of an Ecoforest ecoGEO heat pump, with live values and pipes coloured by temperature."
}, mt = "ecoGEO heat pump schematic", C = {
	celsius: "°C",
	kelvin: "K",
	bar: "bar",
	percent: "%",
	rpm: "rpm",
	watt: "W"
}, ht = {
	off: "Off",
	defrost: "Defrost",
	dhw: "DHW",
	active_cooling: "Active cooling",
	heating: "Heating",
	passive_cooling: "Passive cooling",
	standby: "Standby"
}, gt = {
	alarm: "Alarm",
	offline: "Offline",
	sampleValues: "Sample values"
}, w = {
	unknownOption: (e) => `Unknown option ${e}`,
	unknownFeature: (e, t) => `Unknown feature ${e}: expected one of ${t.join(", ")}`,
	unknownRole: (e) => `Unknown entity role ${e}`,
	notEntityId: (e) => `Invalid entity for ${e}: expected an entity id such as sensor.name`,
	featureState: (e) => `Invalid option features.${e}: expected true, false or unused`,
	integer: (e, t) => `a whole number from ${e} to ${t}`,
	prefix: "a prefix of lowercase letters, digits and underscores",
	colors: "Invalid option colors: expected an ascending list of 2 to 8 stops, each { temperature, color } with a number and a CSS colour",
	dhwMismatch: (e, t) => `Invalid option dhw: ${e} does not fit model ${t}${e === "none" && t === "C" ? " (model C always has its tank; use unused)" : ""}`
}, _t = {
	dg1: "DG1",
	outerLoop: "Outer loop",
	dhw: "DHW"
}, vt = {
	air: "Air unit",
	ground: "Ground loop"
}, yt = {
	externalTank: "DHW tank",
	demand: "Demand"
}, bt = { demand: "Demand" }, T = {
	setpoint: "Setpoint",
	startDelta: "Start ΔT",
	setpointShort: "Set",
	startDeltaShort: "ΔT",
	fan: "Fan",
	outside: "Outside",
	portIn: "In",
	portOut: "Out",
	dhw: "DHW"
}, xt = {
	outside: "Outside",
	cop: "COP",
	condensation: "Condensation",
	evaporation: "Evaporation",
	summer: "Summer",
	winter: "Winter"
}, St = {
	on: "On",
	off: "Off",
	emergency: "Emergency"
}, Ct = {
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
}, wt = (e) => {
	let t = Ct[e];
	return t === void 0 ? "" : `${t} (${String(e)})`;
}, Tt = "Air unit fan", E = {
	noForm: "The editor needs Home Assistant's form element, which is not available yet. Use the code editor instead.",
	sections: {
		unit: "Unit",
		entity_prefix: "Entities",
		features: "Features",
		appearance: "Appearance",
		entities: "Advanced entities"
	},
	fields: {
		model: "Model",
		variant: "Variant",
		source: "Outer-loop source",
		dhw: "DHW storage",
		prefix: "Entity prefix",
		passive_cooling: "Passive cooling",
		active_cooling: "Active cooling",
		htr: "HTR",
		backup_heater: "Backup heater",
		detail: "Detail level",
		exchanger_fill: "Exchanger fill",
		layout: "Layout"
	},
	advanced: "Advanced settings",
	roleGroups: {
		production: "Production circuit",
		brine: "Brine circuit",
		compressor: "Compressor",
		refrigerant: "Refrigerant circuit",
		heating: "Heating",
		cooling: "Cooling",
		dhw: "Domestic hot water",
		source: "Outer-loop source",
		unit: "Unit status"
	},
	roles: {
		outlet_temperature: "Outlet temperature",
		return_temperature: "Return temperature",
		inlet_temperature: "Inlet temperature",
		pressure: "Pressure",
		pump: "Pump speed",
		speed: "Speed",
		percentage: "Capacity percentage",
		power: "Power consumption",
		suction_temperature: "Suction temperature",
		discharge_temperature: "Discharge temperature",
		suction_pressure: "Suction pressure",
		discharge_pressure: "Discharge pressure",
		mode: "Operation mode",
		condensation_temperature: "Condensation temperature",
		evaporation_temperature: "Evaporation temperature",
		superheat: "Superheat",
		expansion_valve: "Expansion valve position",
		capacity: "Capacity",
		demand: "Demand",
		setpoint: "Setpoint",
		temperature: "Temperature",
		start_delta: "Start difference",
		fan_speed: "Fan speed",
		air_unit_outlet_temperature: "Air unit outlet temperature",
		outside_temperature: "Outside temperature",
		on_off: "On or off",
		summer: "Summer mode",
		winter: "Winter mode",
		alarm: "Alarm",
		connection: "Connection",
		cop: "COP"
	},
	colorRow: {
		temperature: (e) => `Colour stop ${String(e)}: temperature`,
		color: (e) => `Colour stop ${String(e)}: colour`
	},
	choices: {
		model: {
			B: "Model B",
			C: "Model C"
		},
		variant: {
			1: "Variant 1",
			2: "Variant 2",
			3: "Variant 3",
			4: "Variant 4"
		},
		source: {
			air: "Air unit",
			ground: "Ground loop",
			hybrid: "Air unit and ground loop"
		},
		dhw: {
			external: "External tank",
			internal: "Internal tank",
			unused: "Tank not in use",
			none: "None"
		},
		detail: {
			simplified: "Simplified",
			full: "Full"
		},
		exchanger_fill: {
			gradient: "Gradient",
			none: "None"
		},
		layout: {
			auto: "Auto (by width)",
			full: "Full",
			compact: "Compact"
		}
	},
	featureChoices: {
		on: "On",
		off: "Off",
		unused: "Unused (drawn muted)",
		presetOn: "on",
		presetOff: "off",
		presetUnused: "unused",
		variantDefault: (e) => `Variant default: ${e}`
	}
}, D = C.celsius, Et = [
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
		unit: C.bar,
		decimals: 1,
		item: "38"
	},
	{
		path: "production.pump",
		domain: "sensor",
		suffix: "production_pump",
		kind: "number",
		unit: C.percent,
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
		unit: C.bar,
		decimals: 1,
		item: "37"
	},
	{
		path: "brine.pump",
		domain: "sensor",
		suffix: "brine_pump",
		kind: "number",
		unit: C.percent,
		decimals: 1,
		item: "16"
	},
	{
		path: "compressor.speed",
		domain: "sensor",
		suffix: "compressor_rpm",
		kind: "number",
		unit: C.rpm,
		decimals: 0,
		item: "11"
	},
	{
		path: "compressor.percentage",
		domain: "sensor",
		suffix: "compressor_percentage",
		kind: "number",
		unit: C.percent,
		decimals: 1,
		item: "11"
	},
	{
		path: "compressor.power",
		domain: "sensor",
		suffix: "power_consumption",
		kind: "number",
		quantity: "power",
		unit: C.watt,
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
		unit: C.bar,
		decimals: 1,
		item: "35"
	},
	{
		path: "compressor.discharge_pressure",
		domain: "sensor",
		suffix: "compressor_discharge_pressure",
		kind: "number",
		unit: C.bar,
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
		unit: C.kelvin,
		decimals: 1,
		item: "12"
	},
	{
		path: "refrigerant.expansion_valve",
		domain: "sensor",
		suffix: "expansion_valve_position",
		kind: "number",
		unit: C.percent,
		decimals: 0,
		item: "12"
	},
	{
		path: "heating.capacity",
		domain: "sensor",
		suffix: "condensation_capacity",
		kind: "number",
		quantity: "power",
		unit: C.watt,
		decimals: 0,
		item: "8"
	},
	{
		path: "cooling.capacity",
		domain: "sensor",
		suffix: "evaporation_capacity",
		kind: "number",
		quantity: "power",
		unit: C.watt,
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
		unit: C.kelvin,
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
		unit: C.percent,
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
], Dt = new Map(Et.map((e) => [e.path, e])), Ot = Et.map((e) => e.path);
[...new Set(Et.flatMap((e) => "unit" in e ? [e.unit] : []))];
var kt = (e, t) => `${e.domain}.${t}_${e.suffix}`;
// src/calc/readings.ts
function At(e, t) {
	return t.quantity === void 0 ? it(e) : dt(e, t.quantity);
}
function jt(e, t) {
	switch (t.kind) {
		case "number": return At(e, t);
		case "text": return e === void 0 || rt(e) || ["unavailable", "unknown"].includes(e.state.trim().toLowerCase()) ? void 0 : e.state.trim();
		case "binary": {
			let t = e?.state.trim().toLowerCase();
			return t === "on" || t !== "off" && void 0;
		}
	}
}
function Mt(e, t) {
	return Object.fromEntries(Et.map((n) => [n.path, jt(at(e, t[n.path]), n)]));
}
// src/lib/config.ts
var Nt = /^[a-z][a-z0-9_]*\.[a-z0-9_]+$/;
function O(e, t) {
	let n = e;
	for (let e of t.split(".")) {
		if (typeof n != "object" || !n || !Object.hasOwn(n, e)) return;
		n = n[e];
	}
	return n;
}
function Pt(e) {
	if (typeof e != "string") return;
	let t = e.trim();
	return Nt.test(t) ? t : void 0;
}
function Ft(e, t) {
	return Pt(O(e, t));
}
// src/lib/options.ts
var It = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, Lt = /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|var)\((.*)\)$/i, Rt = /^[#a-zA-Z0-9(),.%\s/+-]+$/, zt = /* @__PURE__ */ new Set(/* @__PURE__ */ "aliceblue.antiquewhite.aqua.aquamarine.azure.beige.bisque.black.blanchedalmond.blue.blueviolet.brown.burlywood.cadetblue.chartreuse.chocolate.coral.cornflowerblue.cornsilk.crimson.cyan.darkblue.darkcyan.darkgoldenrod.darkgray.darkgreen.darkgrey.darkkhaki.darkmagenta.darkolivegreen.darkorange.darkorchid.darkred.darksalmon.darkseagreen.darkslateblue.darkslategray.darkslategrey.darkturquoise.darkviolet.deeppink.deepskyblue.dimgray.dimgrey.dodgerblue.firebrick.floralwhite.forestgreen.fuchsia.gainsboro.ghostwhite.gold.goldenrod.gray.green.greenyellow.grey.honeydew.hotpink.indianred.indigo.ivory.khaki.lavender.lavenderblush.lawngreen.lemonchiffon.lightblue.lightcoral.lightcyan.lightgoldenrodyellow.lightgray.lightgreen.lightgrey.lightpink.lightsalmon.lightseagreen.lightskyblue.lightslategray.lightslategrey.lightsteelblue.lightyellow.lime.limegreen.linen.magenta.maroon.mediumaquamarine.mediumblue.mediumorchid.mediumpurple.mediumseagreen.mediumslateblue.mediumspringgreen.mediumturquoise.mediumvioletred.midnightblue.mintcream.mistyrose.moccasin.navajowhite.navy.oldlace.olive.olivedrab.orange.orangered.orchid.palegoldenrod.palegreen.paleturquoise.palevioletred.papayawhip.peachpuff.peru.pink.plum.powderblue.purple.rebeccapurple.red.rosybrown.royalblue.saddlebrown.salmon.sandybrown.seagreen.seashell.sienna.silver.skyblue.slateblue.slategray.slategrey.snow.springgreen.steelblue.tan.teal.thistle.tomato.turquoise.violet.wheat.white.whitesmoke.yellow.yellowgreen.transparent.currentcolor".split("."));
function Bt(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) if (e[n] === "(" && t++, e[n] === ")" && (t--, t < 0 || t === 0 && n !== e.length - 1)) return !1;
	return t === 0;
}
function Vt(e) {
	let t = e.trim();
	if (t.length === 0 || t.length > 100 || !Rt.test(t)) return !1;
	if (It.test(t) || zt.has(t.toLowerCase())) return !0;
	let n = Lt.exec(t);
	if (n === null || !Bt(t)) return !1;
	if (n[1]?.toLowerCase() !== "var") return !0;
	let [r, ...i] = (n[2] ?? "").split(",");
	return /^\s*--[a-zA-Z0-9-]+\s*$/.test(r ?? "") && (i.length === 0 || Vt(i.join(",")));
}
var Ht = (e) => e == null;
function Ut(e) {
	switch (e.kind) {
		case "number": return S.number(String(e.min), String(e.max));
		case "color": return S.color;
		case "boolean": return S.boolean;
		case "choice": return S.choice(e.choices);
		case "list": return S.list;
	}
}
var Wt = (e) => e === null || [
	"string",
	"number",
	"boolean"
].includes(typeof e);
function Gt(e) {
	return e.map((e) => typeof e == "boolean" ? e ? "on" : "off" : e === null ? "" : String(e)).filter((e) => e.trim() !== "");
}
function Kt(e, t) {
	switch (e.kind) {
		case "number": return typeof t == "number" && Number.isFinite(t) && t >= e.min && t <= e.max;
		case "color": return typeof t == "string" && Vt(t);
		case "boolean": return typeof t == "boolean";
		case "choice": return typeof t == "string" && e.choices.includes(t);
		case "list": return Array.isArray(t) && t.every(Wt);
	}
}
function qt(e, t) {
	let n = t.split(".").slice(0, -1);
	for (let t = 1; t <= n.length; t++) {
		let r = n.slice(0, t).join("."), i = O(e, r);
		if (!Ht(i) && (typeof i != "object" || Array.isArray(i))) return r;
	}
}
function Jt(e, t) {
	let n = t.flatMap((t) => {
		let n = qt(e, t.path);
		if (n !== void 0) return [S.invalid(n, S.object)];
		let r = O(e, t.path);
		return Ht(r) || Kt(t, r) ? [] : [S.invalid(t.path, Ut(t))];
	});
	return [...new Set(n)];
}
function Yt(e, t) {
	let n = O(e, t.path);
	if (t.kind === "list" && Array.isArray(n) && Kt(t, n)) {
		let e = Gt(n);
		return e.length > 0 ? e : t.default;
	}
	return Ht(n) || !Kt(t, n) ? t.default : n;
}
// src/diagram/colors.ts
var Xt = [
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
], Zt = "var(--disabled-text-color)", Qt = "#8a8a8a", $t = `var(--ecogeo-coil-muted, ${Zt})`, en = (e) => e ? Zt : Qt, tn = (e) => typeof e == "object" && !!e && !Array.isArray(e), nn = (e) => typeof e == "string" && Jt({ color: e }, [{
	kind: "color",
	path: "color",
	default: ""
}]).length === 0, rn = (e) => e.map((e) => ({
	temperature: e.temperature,
	color: e.color.trim()
}));
function an(e) {
	let t = O(e, "colors");
	if (t == null) return [];
	if (!Array.isArray(t) || t.length < 2 || t.length > 8) return [w.colors];
	let n = t;
	if (!n.every((e) => tn(e) && typeof e.temperature == "number" && Number.isFinite(e.temperature) && nn(e.color))) return [w.colors];
	let r = rn(n).map((e) => e.temperature);
	return r.every((e, t) => t === 0 || e > (r[t - 1] ?? 0)) ? [] : [w.colors];
}
function on(e) {
	let t = O(e, "colors");
	return Array.isArray(t) && an(e).length === 0 ? rn(t) : Xt;
}
function sn(e, t = Xt) {
	let n = t[0], r = t[t.length - 1];
	if (e === void 0 || !Number.isFinite(e) || n === void 0 || r === void 0) return Zt;
	if (e <= n.temperature) return n.color;
	if (e >= r.temperature) return r.color;
	let i = t.findIndex((t) => t.temperature >= e), a = t[i - 1], o = t[i];
	if (a === void 0 || o === void 0) return r.color;
	let s = Math.round((e - a.temperature) / (o.temperature - a.temperature) * 1e3) / 10;
	return s <= 0 ? a.color : s >= 100 ? o.color : `color-mix(in srgb, ${o.color} ${String(s)}%, ${a.color})`;
}
// src/config/variants.ts
var cn = [
	"active_cooling",
	"passive_cooling",
	"htr",
	"backup_heater"
], k = [
	1,
	2,
	3,
	4
];
function ln(e) {
	return {
		active_cooling: e === 3 || e === 4,
		passive_cooling: e === 2 || e === 4,
		htr: !0,
		backup_heater: !0
	};
}
function un(e, t) {
	return {
		...ln(e),
		...t
	};
}
// src/config/options.ts
var dn = ["B", "C"], fn = [
	"air",
	"ground",
	"hybrid"
], pn = [
	"external",
	"internal",
	"unused",
	"none"
], mn = ["simplified", "full"], hn = {
	kind: "choice",
	path: "model",
	default: "B",
	choices: dn
}, gn = {
	kind: "choice",
	path: "source",
	default: "ground",
	choices: fn
}, _n = {
	kind: "choice",
	path: "dhw",
	default: "external",
	choices: pn
}, vn = {
	kind: "choice",
	path: "detail",
	default: "simplified",
	choices: mn
}, yn = {
	kind: "choice",
	path: "exchanger_fill",
	default: "gradient",
	choices: ["gradient", "none"]
}, bn = {
	kind: "choice",
	path: "layout",
	default: "auto",
	choices: [
		"auto",
		"full",
		"compact"
	]
}, xn = [
	hn,
	gn,
	_n,
	vn,
	yn,
	bn
], Sn = [
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
], Cn = (e) => e === "C" ? "internal" : "external", A = (e) => e == null, wn = (e) => A(e) || typeof e == "string" && e.trim() === "", Tn = (e) => typeof e == "object" && !!e && !Array.isArray(e), En = /^[a-z0-9_]+$/;
function Dn(e) {
	let t = O(e, "prefix");
	return wn(t) ? void 0 : t.trim();
}
function On(e) {
	let t = O(e, "variant");
	return k.find((e) => e === t) ?? 4;
}
function kn(e) {
	let t = Yt(e, hn), n = !A(O(e, "dhw"));
	return {
		model: t,
		source: Yt(e, gn),
		dhw: n ? Yt(e, _n) : Cn(t)
	};
}
var An = (e) => Yt(e, vn), jn = (e) => Yt(e, yn), Mn = (e) => Yt(e, bn);
function Nn(e) {
	let t = O(e, "features");
	if (!Tn(t)) return {};
	let n = {};
	for (let e of cn) {
		let r = t[e];
		(r === !0 || r === !1 || r === "unused") && (n[e] = r);
	}
	return n;
}
var Pn = (e) => e === !0 || e === !1 || e === "unused";
function Fn(e, t = "") {
	return Object.entries(e).flatMap(([e, n]) => {
		let r = t === "" ? e : `${t}.${e}`;
		return Tn(n) ? Fn(n, r) : [[r, n]];
	});
}
function In(e) {
	let t = O(e, "variant");
	return A(t) || k.some((e) => e === t) ? [] : [S.invalid("variant", w.integer(String(k[0]), String(k[k.length - 1])))];
}
function Ln(e) {
	let t = O(e, "prefix");
	return wn(t) || typeof t == "string" && En.test(t.trim()) ? [] : [S.invalid("prefix", w.prefix)];
}
function Rn(e) {
	let t = O(e, "features");
	return A(t) ? [] : Tn(t) ? Object.entries(t).flatMap(([e, t]) => cn.some((t) => t === e) ? A(t) || Pn(t) ? [] : [w.featureState(e)] : [w.unknownFeature(e, cn)]) : [S.invalid("features", S.object)];
}
function zn(e) {
	let t = O(e, "entities");
	return A(t) ? [] : Tn(t) ? Fn(t).flatMap(([e, t]) => wn(t) ? [] : Dt.has(e) ? Pt(t) === void 0 ? [w.notEntityId(e)] : [] : [w.unknownRole(e)]) : [S.invalid("entities", S.object)];
}
function Bn(e) {
	let t = O(e, "entities");
	return Tn(t) && Fn(t).some(([, e]) => !wn(e));
}
function Vn(e) {
	let t = Object.keys(e).filter((e) => !Sn.includes(e)).map((e) => w.unknownOption(e)), n = Jt(e, xn), r = [
		...t,
		...n,
		...In(e),
		...Ln(e),
		...Rn(e),
		...zn(e),
		...an(e)
	];
	if (Jt(e, [hn, _n]).length === 0 && !A(O(e, "dhw"))) {
		let { model: t, dhw: n } = kn(e);
		(t === "B" && n === "internal" || t === "C" && (n === "external" || n === "none")) && r.push(w.dhwMismatch(n, t));
	}
	return r;
}
// src/config/sample.ts
var Hn = (e) => `ecogeo_sample.${e.replace(".", "_")}`, Un = {
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
}, Wn = "2026-01-01T12:00:00Z", Gn = Object.fromEntries(Ot.map((e) => [e, Hn(e)])), Kn = Object.fromEntries(Ot.map((e) => {
	let t = Dt.get(e)?.unit, n = Hn(e);
	return [n, {
		entity_id: n,
		state: Un[e],
		last_updated: Wn,
		attributes: t === void 0 ? {} : { unit_of_measurement: t }
	}];
}));
// src/config/resolve.ts
function qn(e, t) {
	return Object.fromEntries(Et.map((n) => [n.path, Ft(e, `entities.${n.path}`) ?? (t === void 0 ? void 0 : kt(n, t))]));
}
var Jn = (e) => Dn(e) === void 0 && !Bn(e);
function Yn(e) {
	let t = Dn(e), n = On(e), r = Jn(e);
	return {
		...kn(e),
		detail: An(e),
		exchangerFill: jn(e),
		layout: Mn(e),
		variant: n,
		prefix: t,
		colors: on(e),
		features: un(n, Nn(e)),
		entities: r ? Gn : qn(e, t),
		sample: r
	};
}
// src/diagram/component-info.ts
var Xn = {
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
}, Zn = "source.fan_speed", Qn = "dhw.temperature", $n = (e, t) => e === void 0 || t?.onTap === void 0 ? void 0 : t.entities[e];
function er(e, t) {
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
var tr = o`
  outline: 2px solid var(--primary-color, currentColor);
  outline-offset: 2px;
  filter: drop-shadow(0 0 2px var(--primary-color, currentColor));
`, nr = {
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
}, rr = {
	x: 495,
	y: 185
}, ir = [[-75, -13], [-75, 13]], N = {
	x: 806,
	y: j.y,
	width: 168,
	height: 180,
	dome: 14
}, ar = N.x + N.width / 2, or = N.y + 62, sr = N.y + 146, cr = 50, lr = N.x + 14;
function ur() {
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
}, dr = P.x + P.width, F = {
	top: P.passes.y0,
	bottom: P.passes.y0 + (P.passes.count - 1) * P.passes.step
}, I = {
	downX: 166,
	upX: 106,
	depth: 140
}, fr = {
	start: 8,
	end: 220
}, L = {
	ground: j.y,
	hybrid: P.y + P.height + 70
}, pr = {
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
}), mr = [
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
	], {
		dhw: "any",
		unusedMuted: !0
	}),
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
	R(51, "coil", rr.x, rr.y, 0, [
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
], hr = (e) => e.split(" ").map((e) => {
	let [t, n] = e.split(",").map(Number);
	return [t ?? 0, n ?? 0];
}), z = 85, B = 50, gr = 226, _r = 206, vr = 234, yr = 214, br = 12, xr = P.coil.x + P.coil.width, Sr = P.passes.step / 2, Cr = (I.downX - I.upX) / 2;
function wr(e) {
	let { y0: t, step: n, count: r, left: i, right: a } = P.passes, o = [[xr, t]];
	for (let e = 0; e < r; e += 1) {
		let s = t + e * n;
		e % 2 == 0 ? (e > 0 && o.push([a, s]), o.push([i, s])) : o.push([i, s], e === r - 1 ? [xr, s] : [a, s]);
	}
	return (e ? o.reverse() : o).map(([e, t]) => `${String(e)},${String(t)}`).join(" ");
}
function Tr(e, t) {
	let { downX: n, upX: r, depth: i } = I, [a, o] = [(n + r) / 2, e + i];
	return t === "down" ? `${String(n)},${String(e)} ${String(n)},${String(o)} ${String(a)},${String(o)}` : `${String(a)},${String(o)} ${String(r)},${String(o)} ${String(r)},${String(e)}`;
}
var V = (...e) => e.map(([e, t]) => `${String(e)},${String(t)}`).join(" "), H = (e, t, n, r, i = {}) => ({
	id: e,
	circuit: t,
	points: hr(n),
	temperatureRole: r,
	direction: 1,
	...i
}), Er = ["production_dg1"], U = ["production_dg1", "production_dhw"], W = "production.outlet_temperature", G = "production.return_temperature", K = "production.pump", q = "brine.inlet_temperature", J = "brine.outlet_temperature", Y = "brine.pump", Dr = "compressor.discharge_temperature", Or = "compressor.suction_temperature", kr = "refrigerant.condensation_temperature", Ar = "refrigerant.evaporation_temperature", X = "compressor.percentage", Z = "dhw.temperature", jr = "source.air_unit_outlet_temperature", Mr = [
	"dhw_sup_b",
	"dhw_sup_c",
	"dhw_ret_b",
	"dhw_ret_c",
	"dhw_ext_in",
	"dhw_ext_coil",
	"dhw_ext_out"
], Nr = [
	H("p1_stub", Er, "270,130 270,118", W, { stub: !0 }),
	H("p2_stub", Er, "312,118 312,130", G, { stub: !0 }),
	H("p1_up", Er, "270,160 270,130", W, {
		dhw: "any",
		speedRole: K
	}),
	H("p1_direct", Er, "270,184 270,130", W, {
		dhw: "none",
		speedRole: K
	}),
	H("p2_in", Er, "312,130 312,198", G, { speedRole: K }),
	H("prod_44_26", U, "270,292 270,184", W, { speedRole: K }),
	H("prod_bypass44", U, "270,348 270,292", W, {
		bypass: "backup_heater",
		speedRole: K
	}),
	H("prod_8_44", U, "420,348 270,348", W, { speedRole: K }),
	H("prod_15_8", U, "397,416 420,416", G, { speedRole: K }),
	H("trunk", U, "312,198 312,416", G, { speedRole: K }),
	H("prod_27_in", U, "312,416 338,416", G, {
		through: "passive_cooling",
		speedRole: K,
		onlyWhen: { valves2728: "closed" }
	}),
	H("prod_27_15", U, "362,416 373,416", G, {
		through: "passive_cooling",
		speedRole: K
	}),
	H("prod_bypass27", U, "312,416 373,416", G, {
		bypass: "passive_cooling",
		speedRole: K
	}),
	H("prod_10_in", ["exchanger_10"], "312,416 312,492 508,492", G, {
		feature: "passive_cooling",
		speedRole: K
	}),
	H("prod_10_out", ["exchanger_10"], "508,448 350,448 350,428", W, {
		feature: "passive_cooling",
		speedRole: K
	}),
	H("prod_tap_a", U, "368,416 368,520", G, { stub: !0 }),
	H("prod_tap_b", U, "368,520 368,544", G, {
		stub: !0,
		detail: "full"
	}),
	H("prod_drain", U, "404,416 404,563", G, {
		stub: !0,
		detail: "full"
	}),
	H("dhw_sup_a", ["production_dhw"], "282,172 361,172", W, {
		dhw: "any",
		speedRole: K
	}),
	H("dhw_sup_b", ["dhw_coil"], "361,172 420,172", W, {
		dhw: "any",
		speedRole: K
	}),
	H("dhw_sup_c", ["dhw_coil"], "420,172 722,172 722,130", W, {
		dhw: "external",
		speedRole: K
	}),
	H("dhw_ret_c", ["dhw_coil"], "748,130 748,198 420,198", G, {
		dhw: "external",
		speedRole: K
	}),
	H("dhw_ret_b", ["dhw_coil"], "420,198 340,198", G, {
		dhw: "any",
		speedRole: K
	}),
	H("dhw_ret_a", ["production_dhw"], "340,198 312,198", G, {
		dhw: "any",
		speedRole: K
	}),
	H("htr_in", ["htr"], "340,198 340,214", Z, {
		feature: "htr",
		dhw: "any"
	}),
	H("htr_pump", ["htr"], "340,238 340,247", Z, {
		feature: "htr",
		dhw: "any"
	}),
	H("htr_to_9", ["htr"], "340,265 340,296 361,296", Z, {
		feature: "htr",
		dhw: "any"
	}),
	H("htr_drain", ["htr"], "340,296 340,309", Z, {
		feature: "htr",
		dhw: "any",
		stub: !0
	}),
	H("htr_riser", ["htr"], "361,250 361,172", Z, {
		feature: "htr",
		dhw: "any"
	}),
	H("dhw_ext_in", ["dhw_coil"], `722,130 722,50 ${String(ar + cr)},50 ${String(ar + cr)},${String(or)}`, W, {
		dhw: "external",
		speedRole: K
	}),
	H("dhw_ext_coil", ["dhw_coil"], `${String(ar + cr)},${String(or)} ${String(ar - cr)},${String(sr)}`, W, {
		dhw: "external",
		speedRole: K,
		shape: {
			kind: "helix",
			cx: ar,
			top: or,
			bottom: sr,
			rx: cr,
			turns: 4.5
		}
	}),
	H("dhw_ext_out", ["dhw_coil"], `${String(ar - cr)},${String(sr)} ${String(lr)},${String(sr)} ${String(lr)},85 748,85 748,130`, G, {
		dhw: "external",
		speedRole: K
	}),
	H("tap_47", ["dhw_coil"], "440,118 440,138", Z, {
		dhw: "internal",
		stub: !0
	}),
	H("tap_48", ["dhw_coil"], "490,138 490,118", Z, {
		dhw: "internal",
		stub: !0
	}),
	H("tap_49", ["dhw_coil"], "540,118 540,138", Z, {
		dhw: "internal",
		stub: !0
	}),
	H("src_out", ["brine"], V([630, 130], [630, z], [vr, z]), J, { speedRole: Y }),
	H("src_in", ["brine"], V([yr, B], [690, B], [690, 130]), q, { speedRole: Y }),
	H("src_air_feed", ["brine"], V([vr, z], [gr, z], [gr, F.bottom], [xr, F.bottom]), J, {
		source: ["air"],
		speedRole: Y
	}),
	H("src_air_coil", ["brine"], wr(!0), J, {
		source: ["air"],
		speedRole: Y,
		bend: Sr
	}),
	H("src_air_exit", ["brine"], V([xr, F.top], [_r, F.top], [_r, B], [yr, B]), jr, {
		source: ["air"],
		speedRole: Y
	}),
	H("src_gnd_feed", ["brine"], V([vr, z], [I.downX, z], [I.downX, L.ground]), J, {
		source: ["ground"],
		speedRole: Y
	}),
	H("src_gnd_down", ["brine"], Tr(L.ground, "down"), J, {
		source: ["ground"],
		speedRole: Y,
		roundEnd: !0,
		bend: Cr
	}),
	H("src_gnd_up", ["brine"], Tr(L.ground, "up"), q, {
		source: ["ground"],
		speedRole: Y,
		bend: Cr
	}),
	H("src_gnd_exit", ["brine"], V([I.upX, L.ground], [I.upX, B], [yr, B]), q, {
		source: ["ground"],
		speedRole: Y
	}),
	H("src_hyb_feed", ["brine"], V([vr, z], [gr, z], [gr, F.top], [xr, F.top]), J, {
		source: ["hybrid"],
		speedRole: Y
	}),
	H("src_hyb_coil", ["brine"], wr(!1), J, {
		source: ["hybrid"],
		speedRole: Y,
		bend: Sr
	}),
	H("src_hyb_link", ["brine"], V([xr, F.bottom], [I.downX, F.bottom], [I.downX, L.hybrid]), jr, {
		source: ["hybrid"],
		speedRole: Y
	}),
	H("src_hyb_down", ["brine"], Tr(L.hybrid, "down"), jr, {
		source: ["hybrid"],
		speedRole: Y,
		roundEnd: !0,
		bend: Cr
	}),
	H("src_hyb_up", ["brine"], Tr(L.hybrid, "up"), q, {
		source: ["hybrid"],
		speedRole: Y,
		bend: Cr
	}),
	H("src_hyb_exit", ["brine"], V([I.upX, L.hybrid], [I.upX, L.hybrid - 15], [br, L.hybrid - 15], [br, B], [yr, B]), q, {
		source: ["hybrid"],
		speedRole: Y
	}),
	H("ref_discharge", ["refrigerant"], "496,250 385,250", Dr, {
		through: "htr",
		speedRole: X
	}),
	H("ref_9_14", ["refrigerant"], "385,296 416,296", Dr, {
		through: "htr",
		speedRole: X
	}),
	H("ref_discharge_direct", ["refrigerant"], "496,250 416,250 416,296", Dr, {
		bypass: "htr",
		speedRole: X
	}),
	H("ref_14_8", ["refrigerant"], "444,306 444,348", Dr, {
		through: "active_cooling",
		reversible: !0,
		speedRole: X
	}),
	H("ref_7_14", ["refrigerant"], "560,348 560,296 444,296", Or, {
		through: "active_cooling",
		reversible: !0,
		speedRole: X
	}),
	H("ref_suction", ["refrigerant"], "444,286 610,286 610,250 524,250", Or, {
		through: "active_cooling",
		speedRole: X
	}),
	H("ref_direct_8", ["refrigerant"], "416,296 444,296 444,348", Dr, {
		bypass: "active_cooling",
		speedRole: X
	}),
	H("ref_direct_suction", ["refrigerant"], "560,348 560,286 610,286 610,250 524,250", Or, {
		bypass: "active_cooling",
		speedRole: X
	}),
	H("ref_8_13", ["refrigerant"], "444,416 473,416", kr, {
		reversible: !0,
		speedRole: X
	}),
	H("ref_13_12", ["refrigerant"], "501,416 515,416", kr, {
		reversible: !0,
		speedRole: X
	}),
	H("ref_12_7", ["refrigerant"], "539,416 560,416", Ar, {
		reversible: !0,
		speedRole: X
	}),
	H("ln4_a", ["brine"], "690,130 690,288", q, { speedRole: Y }),
	H("ln4_b", ["brine"], "690,312 690,348", q, { speedRole: Y }),
	H("br_feed7", ["brine"], "690,348 584,348", q, {
		speedRole: Y,
		onlyWhen: { valves2728: "closed" }
	}),
	H("brine_7_28", ["brine"], "584,416 598,416", J, {
		through: "passive_cooling",
		speedRole: Y,
		onlyWhen: { valves2728: "closed" }
	}),
	H("brine_28_ln3", ["brine"], "622,416 630,416", J, {
		through: "passive_cooling",
		speedRole: Y
	}),
	H("brine_bypass28", ["brine"], "584,416 630,416", J, {
		bypass: "passive_cooling",
		speedRole: Y
	}),
	H("ln3", ["brine"], "630,416 630,130", J, { speedRole: Y }),
	H("br_10_in", ["exchanger_10"], "690,348 690,448 532,448", q, {
		feature: "passive_cooling",
		speedRole: Y
	}),
	H("br_10_28", ["exchanger_10"], "532,492 610,492 610,428", J, {
		feature: "passive_cooling",
		speedRole: Y
	}),
	H("brine_tap_a", ["brine"], "690,270 725,270 725,440", q, { stub: !0 }),
	H("brine_tap_b", ["brine"], "725,440 725,508", q, {
		stub: !0,
		detail: "full"
	}),
	H("brine_drain", ["brine"], "630,416 630,563", J, {
		stub: !0,
		detail: "full"
	})
], Pr = [
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
], Fr = [
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
], Ir = (e, t) => t === "htr" && e.dhw === "none" ? !1 : e.features[t], Lr = (e) => e.dhw === "unused" ? e.model === "C" ? "internal" : "external" : e.dhw, Rr = (e, t) => {
	let n = Lr(t);
	return e === "any" ? n !== "none" : e === n;
};
function zr(e, t) {
	if (e.detail === "full" && t.detail !== "full" || e.source !== void 0 && !e.source.includes(t.source) || e.dhw !== void 0 && !Rr(e.dhw, t) || e.bypass !== void 0 && Ir(t, e.bypass) !== !1 || e.through !== void 0 && Ir(t, e.through) === !1) return "hidden";
	if (e.feature !== void 0) {
		let n = Ir(t, e.feature);
		if (n === !1) return "hidden";
		if (n === "unused") return "muted";
	}
	return t.dhw === "unused" && e.dhw !== void 0 && (e.dhw !== "any" || e.unusedMuted === !0) ? "muted" : "normal";
}
function Br(e, t) {
	return e.flatMap((e) => {
		let n = zr(e, t);
		return n === "hidden" ? [] : [{
			part: e,
			state: n
		}];
	});
}
var Vr = (e) => Br(mr, e), Hr = (e) => Br(Nr, e), Ur = (e, t) => (e.onlyWhen === void 0 || e.onlyWhen.valves2728 === t.valves2728) && e.circuit.some((e) => t.active.has(e)), Wr = .35;
function Gr(e) {
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
var Kr = (e) => [...e.filter((e) => !e.front), ...e.filter((e) => e.front)];
function qr(e) {
	let t = (e) => String(Math.round(e * 100) / 100);
	return Gr(e).map(({ front: e, curve: [n, r, i, a] }) => ({
		front: e,
		d: `M${t(n[0])} ${t(n[1])} C${t(r[0])} ${t(r[1])} ${t(i[0])} ${t(i[1])} ${t(a[0])} ${t(a[1])}`
	}));
}
function Jr(e, t) {
	let n = Xr(e, 0), r = [`M${String(n[0])} ${String(n[1])}`];
	for (let n = 1; n < e.length; n += 1) {
		let [i, a, o] = [
			Xr(e, n - 1),
			Xr(e, n),
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
var Yr = (e, t) => e[0] === t[0] && e[1] === t[1];
function Xr(e, t) {
	let n = e[t];
	if (n === void 0) throw Error(`No point ${String(t)}`);
	return n;
}
var Zr = (e) => e.slice(1).map((t, n) => [Xr(e, n), t]), Qr = (e, t, n) => e >= Math.min(t, n) && e <= Math.max(t, n);
function $r(e, t = [], n = 7) {
	let r = [], i, a = (e) => {
		r.push(i === void 0 ? `M${String(e[0])} ${String(e[1])}` : `L${String(e[0])} ${String(e[1])}`), i = e;
	}, o = (e) => {
		r.push(`M${String(e[0])} ${String(e[1])}`), i = e;
	};
	a(Xr(e, 0));
	for (let [r, i] of Zr(e)) {
		let e = Math.sign(i[0] - r[0]), s = Math.sign(i[1] - r[1]), c = Math.abs(i[0] - r[0]) + Math.abs(i[1] - r[1]), l = t.filter((e) => ei(e, r, i) && !Yr(e, r) && !Yr(e, i)).sort((e, t) => Math.abs(e[0] - r[0]) + Math.abs(e[1] - r[1]) - (Math.abs(t[0] - r[0]) + Math.abs(t[1] - r[1])));
		for (let t of l) {
			let l = Math.abs(t[0] - r[0]) + Math.abs(t[1] - r[1]);
			l > n && a([t[0] - e * n, t[1] - s * n]), o(c - l > n ? [t[0] + e * n, t[1] + s * n] : i);
		}
		a(i);
	}
	return r.join(" ");
}
var ei = (e, t, n) => t[0] === n[0] && e[0] === t[0] && Qr(e[1], t[1], n[1]) || t[1] === n[1] && e[1] === t[1] && Qr(e[0], t[0], n[0]);
function ti(e, t) {
	return Pr.filter((n) => n.under === e && t.has(n.over) && t.has(n.under)).map((e) => e.at);
}
function ni(e, t, n) {
	return e === "auto" ? t === void 0 || !(t > 0) ? !1 : t < 640 + (n ? 24 : 0) : e === "compact";
}
var ri = {
	pipe: 3,
	outline: 2
}, ii = 2, ai = 1.25, oi = (e) => Math.ceil(e * 10 - 1e-9) / 10;
function si(e) {
	if (e === void 0 || !(e > 0)) return ri;
	let t = e / 1e3;
	return {
		pipe: Math.max(ri.pipe, oi(ii / t)),
		outline: Math.max(ri.outline, oi(ai / t))
	};
}
// src/diagram/pipes.ts
var ci = 1.2, li = .6, ui = [
	"tap_47",
	"tap_48",
	"tap_49"
], di = [
	"prod_27_15",
	"prod_15_8",
	"prod_tap_a",
	"prod_tap_b",
	"prod_drain"
];
function fi(e) {
	if (e !== void 0 && e > 0) return Math.min(8, Math.max(li, ci * 100 / e));
}
var pi = {
	"compressor.discharge_temperature": "compressor.suction_temperature",
	"compressor.suction_temperature": "compressor.discharge_temperature",
	"refrigerant.condensation_temperature": "refrigerant.evaporation_temperature",
	"refrigerant.evaporation_temperature": "refrigerant.condensation_temperature"
}, mi = (e, t) => Mr.includes(e.id) && hi(t), hi = (e) => e.active.has("htr") && !e.active.has("production_dhw");
function gi(e, t) {
	return mi(e, t.circuits) ? "dhw.temperature" : e.reversible === !0 && t.mode === "active_cooling" ? pi[e.temperatureRole] ?? e.temperatureRole : (t.mode === "passive_cooling" || t.mode === "defrost") && t.circuits.valves2728 === "exchanger" && di.includes(e.id) ? "production.outlet_temperature" : e.temperatureRole;
}
function _i(e, t, n) {
	return t === "muted" && n === "defrost" && e.feature === "passive_cooling" ? "normal" : t;
}
var vi = (e, t) => {
	let n = e[t];
	return typeof n == "number" ? n : void 0;
};
function yi(e, t, n) {
	let { mode: r, circuits: i, readings: a, stops: o } = n, s = ui.includes(e.id), c = _i(e, t, r), l = s || Ur(e, i), u = vi(a, gi(e, n)), d = c === "muted" || !l || u === void 0, f = e.direction === -1 != (e.reversible === !0 && r === "active_cooling"), p = {
		color: d ? Zt : sn(u, o),
		muted: d,
		reversed: f
	};
	if (!l || c === "muted" || e.stub === !0 || s) return {
		...p,
		animated: !1
	};
	let ee = mi(e, i) || e.speedRole === void 0 && e.circuit.includes("htr") ? 3 : e.speedRole === void 0 ? void 0 : fi(vi(a, e.speedRole));
	return ee === void 0 ? {
		...p,
		animated: !1
	} : {
		...p,
		animated: !0,
		duration: ee
	};
}
var bi = (e) => sn(vi(e.readings, "dhw.temperature"), e.stops);
function xi(e) {
	let { circuits: t, readings: n, stops: r } = e;
	return hi(t) ? sn(vi(n, "dhw.temperature"), r) : t.active.has("dhw_coil") ? sn(vi(n, "production.outlet_temperature"), r) : Zt;
}
// src/diagram/symbols.ts
var Si = .55;
function Ci(e, t, n) {
	let r = -t - 9, i = t + 9;
	return y`<path class="exchanger-fill" data-half=${e} d=${e === "left" ? `M0 ${String(r)} H-16 A4 4 0 0 0 -20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 0 -16 ${String(i)} H0 Z` : `M0 ${String(r)} H16 A4 4 0 0 1 20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 1 16 ${String(i)} H0 Z`} fill=${n} fill-opacity=${Si} stroke="none" />`;
}
var wi = (e, t) => y`<text class="glyph" text-anchor="middle" dominant-baseline="central" font-size="9" fill="currentColor" stroke="none" transform="rotate(${-t})">${e}</text>`, Ti = {
	kind: "helix",
	cx: 2,
	top: -60,
	bottom: 60,
	rx: 11,
	turns: 7.5
};
function Ei() {
	let e = M.x + 2 - rr.x, t = qr(Ti), { cx: n, rx: r, top: i, bottom: a } = Ti, o = ir[0][1], s = ir[1][1], c = r - n;
	return y`<g transform="matrix(0 -1 1 0 0 0)">${Kr(t).map((e) => y`<path data-half=${e.front ? "front" : "back"} stroke-linecap=${e.front ? "round" : "butt"} d=${e.d} opacity=${e.front ? b : Wr} />`)}</g><path style="stroke-width: var(--pipe-width, 3)" d="M${e} ${o} H${i} M${a} ${c} V${s} H${e}" />`;
}
var Di = "M9 -10.7 L-13 -3 M9 10.7 L-13 3", Oi = (e, t) => y`<path d="M0 ${t} V${e}" />`, ki = (e, t) => y`<path d="${e}" fill=${t ? "currentColor" : "none"} />`;
function Ai(e, t) {
	let n = t.rotation ?? 0;
	switch (e) {
		case "pump": return y`<circle r="12" /><path d="M-5 -7 V7 L8 0 Z" fill="currentColor" />`;
		case "valve3": {
			let e = t.open ?? ["l", "r"];
			return y`${ki("M-12 -6 V6 L0 0 Z", e.includes("l"))}${ki("M12 -6 V6 L0 0 Z", e.includes("r"))}${ki("M-6 12 H6 L0 0 Z", e.includes("d"))}<rect x="-4" y="-21" width="8" height="8" /><path d="M0 -13 V-8" />`;
		}
		case "inversion_valve": return y`<rect x="-10" y="-14" width="20" height="28" rx="3" /><path d="M-14 0 H-10 M10 -10 H14 M10 0 H14 M10 10 H14" />${t.reversed === !0 ? y`<path d="M-14 0 H14 M14 10 H5 V-10 H14" />` : y`<path d="M-14 0 H-5 V10 H14 M14 0 H5 V-10 H14" />`}`;
		case "probe_t": return y`<circle r="9" />${Oi(16, 9)}${wi("T", n)}`;
		case "transducer_p": return y`<circle r="9" />${Oi(16, 9)}${wi("P", n)}`;
		case "pressure_switch": return y`<rect x="-7" y="-7" width="14" height="14" />${Oi(16, 7)}${wi("P", n)}`;
		case "thermostat": return y`<rect x="-7" y="-7" width="14" height="14" />${Oi(16, 7)}${wi("T", n)}`;
		case "exchanger": {
			let e = t.size ?? 34, n = t.fills;
			return y`${n === void 0 ? b : y`${Ci("left", e, n.left)}${Ci("right", e, n.right)}`}<rect x="-20" y="${-e - 9}" width="40" height="${2 * e + 18}" rx="4" /><path d="M-12 ${-e} V${e} M12 ${-e} V${e}" /><circle cx="-12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="-12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" />`;
		}
		case "compressor": return y`<circle r="14" /><path class="compressor-lines" d="${Di}" />`;
		case "vessel": return y`<circle r="12" /><path d="M-12 2 H12" />`;
		case "safety_valve": return y`<path d="M0 16 V6 M-6 6 H6 L0 -4 Z M0 -4 L-3 -7 L3 -10 L0 -13" />`;
		case "valve": return y`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "drain_valve": return y`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "resistor": return y`<rect x="-28" y="-6" width="56" height="12" rx="2" /><path d="M-18 -6 V6 M18 -6 V6" />`;
		case "filter_dryer": return y`<rect x="-14" y="-5" width="28" height="10" rx="5" />`;
		case "expansion_valve": return y`<path d="M-12 -6 V6 L0 0 L12 -6 V6 L0 0 Z" />`;
		case "service_outlet": return y`<rect x="-3" y="-3" width="6" height="6" />${Oi(10, 3)}`;
		case "port": return y`<rect x="-5" y="-6" width="10" height="6" />`;
		case "tank": return y`<rect class="tank-body" data-dhw-tank="internal" x=${-M.width / 2} y=${-M.height / 2} width=${M.width} height=${M.height} rx="14" fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />`;
		case "coil": return Ei();
	}
}
function ji(e, t = {}) {
	return y`<g class="symbol ${e}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${t.rotation ?? 0})">${Ai(e, t)}</g>`;
}
// src/diagram/cabinet.ts
var Mi = o`
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
  /* One dash period (dash 1 + gap 6 widths). The -7px carries a length: Chromium does not interpolate a unitless calc(), it jumps. */
  @keyframes flow-dash {
    to {
      stroke-dashoffset: calc(var(--pipe-width, 3) * -7px);
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
    ${tr}
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
function Ni(e, t) {
	return e === 26 ? t.valve26 === "dhw" ? ["l", "d"] : ["l", "r"] : t.valves2728 === "exchanger" ? ["d", "r"] : ["l", "r"];
}
function Pi(e, t, n, r, i) {
	let { part: a } = e, { circuits: o } = t, s = _i(a, e.state, t.mode), [c, l, u] = a.tag, d = wt(a.item), f = er($n(Xn[a.item], r), r?.onTap);
	return y`<g class="symbol-group ${s}" data-item=${a.item} data-kind=${a.kind} aria-label=${d} role=${f.role} tabindex=${f.tabindex} @click=${f.click} @keydown=${f.keydown} style=${a.kind === "coil" ? `color: ${zi(t)}` : b}>
    <title>${d}</title>
    <g transform="translate(${a.x} ${a.y})">${ji(a.kind, {
		rotation: a.rotation,
		size: a.size,
		open: a.kind === "valve3" ? Ni(a.item, o) : void 0,
		reversed: a.kind === "inversion_valve" ? o.valve14 === "reversed" : void 0,
		fills: i
	})}</g>
    ${n === "full" ? y`<text class="item" x=${a.x + c} y=${a.y + l} text-anchor=${u ?? "start"}>${a.item}</text>` : b}
  </g>`;
}
function Fi(e, t, n) {
	let r = qr(t), i = n.muted ? b : `stroke: ${n.color}`;
	return y`<g class="helix ${n.muted ? "muted" : ""}" data-segment=${e.id} style=${i}>
    ${Kr(r).map((e) => y`<path class="pipe ${n.muted ? "muted" : ""}" data-half=${e.front ? "front" : "back"} style=${i} stroke-linecap=${e.front ? "round" : "butt"} opacity=${e.front ? b : Wr} d=${e.d} />`)}
    ${n.animated ? y`<path class="flow ${n.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(n.duration)}s" d=${r.filter((e) => e.front).map((e) => e.d).join(" ")} />` : b}
  </g>`;
}
function Ii(e, t, n, r, i) {
	if (e.shape !== void 0) return Fi(e, e.shape, t);
	let a = e.bend === void 0 ? $r(e.points, n, r) : Jr(e.points, e.bend);
	return y`<path class="pipe ${t.muted ? "muted" : ""}" data-segment=${e.id} style=${t.muted ? b : `stroke: ${t.color}`} stroke-linecap=${e.roundEnd === !0 ? "round" : b} d=${a} />${t.muted && i !== void 0 && Bi.has(e.id) ? y`<path class="pipe-inside" data-inside=${e.id} clip-path="url(#${i})" d=${a} />` : b}${t.animated ? y`<path class="flow ${t.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(t.duration)}s" d=${a} />` : b}`;
}
function Li(e, t, n, r) {
	let i = (e) => e.map((e) => n.get(e)).find((e) => e !== void 0), a = e.reversible === !0 && r === "active_cooling", [o, s] = a ? [e.leaving, e.entering] : [e.entering, e.leaving], c = i(o), l = i(s), u = (c?.muted ?? !0) && (l?.muted ?? !0), d = (e) => u ? Zt : e?.color ?? "var(--disabled-text-color)", f = e.enters === "top" !== a;
	return {
		id: t,
		y1: +!f,
		y2: +!!f,
		start: d(c),
		end: d(l),
		muted: u
	};
}
var Ri = (e) => y`<linearGradient id=${e.id} x1="0" y1=${e.y1} x2="0" y2=${e.y2} data-muted=${e.muted}>
      <stop offset="0" style="stop-color: ${e.start}" />
      <stop offset="1" style="stop-color: ${e.end}" />
    </linearGradient>`;
function zi(e) {
	let t = xi(e);
	return t === "var(--disabled-text-color)" ? $t : t;
}
var Bi = /* @__PURE__ */ new Set(["dhw_ext_in", "dhw_ext_out"]);
function Vi(e, t, n, r = {
	mode: "gradient",
	idPrefix: "ecogeo"
}, i = ri.pipe) {
	let a = 7 * i / ri.pipe, o = Hr(e), s = new Set(o.map((e) => e.part.id)), c = new Map(o.map((e) => [e.part.id, yi(e.part, e.state, t)])), l = [], u = Lr(e) === "external" ? `${r.idPrefix}-tank-clip` : void 0, d = Vr(e).map((i) => {
		let a = r.mode === "gradient" ? i.part.sides : void 0;
		if (a === void 0) return Pi(i, t, e.detail, n);
		let o = {
			left: "none",
			right: "none"
		};
		for (let e of a) {
			let n = Li(e, `${r.idPrefix}-x${String(i.part.item)}-${e.half}`, c, t.mode);
			l.push(n), o[e.half] = `url(#${n.id})`;
		}
		return Pi(i, t, e.detail, n, o);
	});
	return y`<g class="cabinet">
    <defs>${l.map(Ri)}${u === void 0 ? b : y`<clipPath id=${u} data-tank-clip><path d=${ur()} /></clipPath>`}</defs>
    <rect class="outline" x=${j.x} y=${j.y} width=${j.width} height=${j.height} rx="6" />
    ${Fr.filter((t) => e.captions !== !1 && zr(t, e) !== "hidden").map((e) => y`<text class="circuit-label" x=${e.x} y=${e.y} text-anchor="middle">${_t[e.key]}</text>`)}
    ${o.map((e) => {
		let t = c.get(e.part.id);
		return t === void 0 ? b : Ii(e.part, t, ti(e.part.id, s), a, u);
	})}
    ${d}
  </g>`;
}
// src/diagram/dhw.ts
var Hi = o`
  .tank-body {
    stroke: var(--primary-text-color);
    stroke-width: max(2.5, var(--outline-width, 2));
  }
  /* An unused tank (dhw: unused): outline and rim muted as well as the fill (tank 50 is a muted symbol group). */
  .symbol-group.muted .tank-body,
  .dhw-storage.muted .tank-body,
  .dhw-storage.muted .tank-rim {
    stroke: var(--disabled-text-color);
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
    ${tr}
  }
  .tank-caption {
    fill: var(--secondary-text-color);
    font-size: 11px;
  }
`;
function Ui(e, t) {
	if (Lr(e) !== "external") return y``;
	let { x: n, y: r, width: i, dome: a } = N, o = i / 2, s = ur(), c = `M${String(n)} ${String(r + a)} A${String(o)} ${String(a)} 0 0 0 ${String(n + i)} ${String(r + a)}`, l = er($n(Qn, t), t?.onTap);
	return y`<g class=${e.dhw === "unused" ? "dhw-storage muted" : "dhw-storage"} data-dhw="external" aria-label=${yt.externalTank} role=${l.role} tabindex=${l.tabindex} @click=${l.click} @keydown=${l.keydown}>
    <title>${yt.externalTank}</title>
    <path class="tank-body" data-dhw-tank="external" d=${s} fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />
    <path class="tank-rim" d=${c} />
    ${e.captions === !1 ? b : y`<text class="tank-caption" x=${n + i / 2} y=${r - 6} text-anchor="middle">${yt.externalTank}</text>`}
  </g>`;
}
// src/lib/format.ts
var Wi = "−";
function Gi(e) {
	let t = e?.locale;
	return typeof t == "object" && t ? t : e?.language === void 0 ? {} : { language: e.language };
}
function Ki(e) {
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
var qi = /* @__PURE__ */ new Map();
function Ji(e, t, n) {
	let r = Ki(e), i = n && e.number_format !== "none", a = `${r?.join(",") ?? ""}|${String(t)}|${String(i)}`, o = qi.get(a);
	return o === void 0 && (o = new Intl.NumberFormat(r, {
		minimumFractionDigits: t,
		maximumFractionDigits: t,
		useGrouping: i
	}), qi.set(a, o)), o;
}
function Yi(e, t, n = 0, r = !0) {
	if (!Number.isFinite(e)) return "–";
	let i = Number.isFinite(n) ? Math.min(20, Math.max(0, Math.trunc(n))) : 0, a = Math.abs(e) < .5 / 10 ** i ? 0 : e;
	return Ji(t ?? {}, i, r).formatToParts(a).map((e) => e.type === "minusSign" ? Wi : e.value).join("");
}
// src/calc/display.ts
function Xi(e) {
	if (typeof e != "object" || !e) return;
	let t = e.display_precision;
	return typeof t == "number" && Number.isInteger(t) && t >= 0 && t <= 20 ? t : void 0;
}
var Zi = (e, t) => t ?? e.decimals ?? 0;
function Qi(e, t) {
	let n = typeof t == "string" ? t.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase() : "";
	return n === (e.unit ?? "").toLowerCase() || e.quantity === "difference" && n === "°c";
}
function $i(e, t, n, r) {
	let i = Dt.get(e);
	if (i === void 0 || t === void 0 || !Number.isFinite(t)) return;
	let a = n === void 0 || !Qi(i, r.states?.[n]?.attributes.unit_of_measurement) ? void 0 : Xi(r.entities?.[n]), o = Yi(t, r.locale, Zi(i, a), !1);
	return i.unit === void 0 ? o : `${o} ${i.unit}`;
}
// src/diagram/labels.ts
var ea = o`
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
`, ta = {
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
}, na = {
	production_out: T.portOut,
	production_in: T.portIn,
	brine_out: T.portOut,
	brine_in: T.portIn,
	tank_internal_temperature: T.dhw,
	tank_external_temperature: T.dhw
}, ra = /* @__PURE__ */ new Set(["tank_internal_temperature"]), ia = /* @__PURE__ */ new Set([
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
]), Q = (e, t, n, r, i, a = {}) => {
	let o = ta[e], s = na[e];
	return {
		id: e,
		role: t,
		tier: ia.has(e) ? "key" : "detail",
		x: n,
		y: r,
		align: i,
		...o === void 0 ? {} : { compact: o },
		...s === void 0 ? {} : { compactCaption: s },
		...a
	};
}, aa = N.x + N.width / 2, oa = N.y + N.height + 22, sa = M.y + 12, ca = M.x + M.width / 2, la = P.y + P.height + 12, ua = dr + 6, da = 12, fa = 20, pa = [
	Q("production_out", "production.outlet_temperature", 237, 228, "end", { item: 33 }),
	Q("production_in", "production.return_temperature", 291, 247, "middle", { item: 34 }),
	Q("production_pressure", "production.pressure", 360, 537, "end", { item: 38 }),
	Q("production_pump", "production.pump", 396, 380, "end", { item: 15 }),
	Q("dg1_setpoint", "heating.setpoint", 291, 96, "middle", { item: 1 }),
	Q("dg1_demand", "heating.demand", 320, 123, "start", {
		item: 1,
		demand: !0
	}),
	Q("brine_out", "brine.outlet_temperature", 633, 247, "start", { item: 31 }),
	Q("brine_in", "brine.inlet_temperature", 697, 247, "start", { item: 32 }),
	Q("brine_pressure", "brine.pressure", 689, 459, "start", { item: 37 }),
	Q("brine_pump", "brine.pump", 676, 300, "end", { item: 16 }),
	Q("discharge_temperature", "compressor.discharge_temperature", 436, 262, "start", { item: 30 }),
	Q("discharge_pressure", "compressor.discharge_pressure", 480, 275, "middle", { item: 36 }),
	Q("suction_temperature", "compressor.suction_temperature", 528, 262, "start", { item: 29 }),
	Q("suction_pressure", "compressor.suction_pressure", 570, 275, "middle", { item: 35 }),
	Q("compressor_speed", "compressor.speed", 503, 307, "middle", { item: 11 }),
	Q("compressor_percentage", "compressor.percentage", 503, 319, "middle", { item: 11 }),
	Q("compressor_power", "compressor.power", 503, 331, "middle", { item: 11 }),
	Q("superheat", "refrigerant.superheat", 527, 376, "middle", { item: 12 }),
	Q("expansion_valve", "refrigerant.expansion_valve", 527, 388, "middle", { item: 12 }),
	Q("condensation_temperature", "refrigerant.condensation_temperature", 432, 437, "middle", { item: 8 }),
	Q("evaporation_temperature", "refrigerant.evaporation_temperature", 572, 437, "middle", { item: 7 }),
	Q("fan_speed", "source.fan_speed", P.fanX, la, "middle", {
		source: ["air", "hybrid"],
		caption: T.fan
	}),
	Q("outside_temperature", "source.outside_temperature", P.fanX, la + 13, "middle", {
		source: ["air", "hybrid"],
		caption: T.outside
	}),
	Q("air_unit_in", "brine.outlet_temperature", ua, F.bottom - da, "start", {
		source: ["air"],
		caption: T.portIn
	}),
	Q("air_unit_out", "source.air_unit_outlet_temperature", ua, F.top + da, "start", {
		source: ["air"],
		caption: T.portOut
	}),
	Q("hybrid_air_unit_in", "brine.outlet_temperature", ua, F.top + da, "start", {
		source: ["hybrid"],
		caption: T.portIn
	}),
	Q("ground_in", "brine.outlet_temperature", I.downX + 6, L.ground + fa, "start", {
		source: ["ground"],
		caption: T.portIn
	}),
	Q("ground_out", "brine.inlet_temperature", I.upX - 6, L.ground + fa, "end", {
		source: ["ground"],
		caption: T.portOut
	}),
	Q("hybrid_ground_out", "brine.inlet_temperature", I.upX - 6, L.hybrid + fa, "end", {
		source: ["hybrid"],
		caption: T.portOut
	}),
	Q("tank_external_temperature", "dhw.temperature", aa, oa, "middle", {
		dhw: "external",
		emphasis: !0
	}),
	Q("tank_external_setpoint", "dhw.setpoint", aa, oa + 15, "middle", {
		dhw: "external",
		caption: T.setpoint
	}),
	Q("tank_external_start_delta", "dhw.start_delta", aa, oa + 29, "middle", {
		dhw: "external",
		caption: T.startDelta
	}),
	Q("tank_external_demand", "dhw.demand", aa, oa + 43, "middle", {
		dhw: "external",
		demand: !0
	}),
	Q("tank_internal_temperature", "dhw.temperature", M.x + M.width / 6, sa, "middle", {
		dhw: "internal",
		bare: !0
	}),
	Q("tank_internal_setpoint", "dhw.setpoint", ca, sa, "middle", {
		dhw: "internal",
		caption: T.setpointShort,
		bare: !0
	}),
	Q("tank_internal_start_delta", "dhw.start_delta", M.x + M.width * 5 / 6, sa, "middle", {
		dhw: "internal",
		caption: T.startDeltaShort,
		bare: !0
	}),
	Q("tank_internal_demand", "dhw.demand", ca, sa + 13, "middle", {
		dhw: "internal",
		demand: !0,
		bare: !0
	})
];
function ma(e, t, n, r, i = !1) {
	return pa.flatMap((a) => {
		if (i && a.tier !== "key" || zr(a, e) === "hidden" || e.dhw === "unused" && a.dhw !== void 0) return [];
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
			...i && c !== void 0 && ra.has(a.id) ? { stacked: !0 } : {}
		}, d = t[a.role];
		if (a.demand === !0) {
			let e = a.role === "heating.demand" ? bt.demand : yt.demand;
			return d === !0 ? [{
				...u,
				text: e,
				missing: !1
			}] : [];
		}
		let f = $i(a.role, typeof d == "number" ? d : void 0, o, r);
		return [{
			...u,
			text: f ?? "–",
			missing: f === void 0
		}];
	});
}
var ha = /* @__PURE__ */ new Set(["outside_temperature", "cop"]);
function ga(e, t, n, r = !1) {
	let i = (e, n, r, i) => ({
		id: e,
		tier: ha.has(e) ? "key" : "detail",
		...r === void 0 ? {} : { caption: r },
		text: i ?? "–",
		missing: i === void 0,
		entityId: t[n]
	}), a = (r, a, o) => {
		let s = e[a];
		return i(r, a, o, $i(a, typeof s == "number" ? s : void 0, t[a], n));
	}, o = e["unit.on_off"], s = e["unit.summer"] === !0 ? xt.summer : e["unit.winter"] === !0 ? xt.winter : void 0, c = [
		i("on_off", "unit.on_off", void 0, o === void 0 ? void 0 : St[o.toLowerCase()] ?? o),
		i("season", e["unit.summer"] === !0 ? "unit.summer" : "unit.winter", void 0, s),
		a("outside_temperature", "source.outside_temperature", xt.outside),
		a("cop", "unit.cop", xt.cop),
		a("condensation_capacity", "heating.capacity", xt.condensation),
		a("evaporation_capacity", "cooling.capacity", xt.evaporation)
	];
	return r ? c.filter((e) => e.tier === "key") : c;
}
var _a = (e) => ({
	left: `${String(e.x / nr.width * 100)}%`,
	top: `${String(e.y / nr.height * 100)}%`
});
function va(e, t, n, r) {
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
function ya(e, t) {
	return v`${e.map((e) => {
		let { left: n, top: r } = _a(e);
		return v`<span
      class="label ${e.align}${e.emphasis ? " emphasis" : ""}${e.bare === !0 ? " bare" : ""}${e.stacked === !0 ? " stacked" : ""}"
      data-label=${e.id}
      data-role=${e.role}
      data-label-item=${e.item ?? b}
      style="left: ${n}; top: ${r}"
      >${e.caption === void 0 ? b : v`<span class="caption">${e.caption}</span>`}${va(e.entityId, e.text, e.missing, t)}</span
    >`;
	})}`;
}
function ba(e, t) {
	return v`${e.map((e) => v`<span class="footer-item" data-footer=${e.id}
        >${e.caption === void 0 ? b : v`<span class="caption">${e.caption}</span>`}${va(e.entityId, e.text, e.missing, t)}</span
      >`)}`;
}
// node_modules/@lit/reactive-element/decorators/property.js
var xa = {
	attribute: !0,
	type: String,
	converter: ae,
	reflect: !1,
	hasChanged: h
}, Sa = (e = xa, t, n) => {
	let { kind: r, metadata: i } = n, a = globalThis.litPropertyMetadata.get(i);
	if (a === void 0 && globalThis.litPropertyMetadata.set(i, a = /* @__PURE__ */ new Map()), r === "setter" && ((e = Object.create(e)).wrapped = !0), a.set(n.name, e), r === "accessor") {
		let { name: r } = n;
		return {
			set(n) {
				let i = t.get.call(this);
				t.set.call(this, n), this.requestUpdate(r, i, e, !0, n);
			},
			init(t) {
				return t !== void 0 && this.C(r, void 0, e, t), t;
			}
		};
	}
	if (r === "setter") {
		let { name: r } = n;
		return function(n) {
			let i = this[r];
			t.call(this, n), this.requestUpdate(r, i, e, !0, n);
		};
	}
	throw Error("Unsupported decorator location: " + r);
};
function Ca(e) {
	return (t, n) => typeof n == "object" ? Sa(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function wa(e) {
	return Ca({
		...e,
		state: !0,
		attribute: !1
	});
}
// src/lib/define.ts
function Ta(e, t) {
	let n = customElements.get(e);
	n === void 0 ? customElements.define(e, t) : n !== t && console.warn(`${e} is already defined by another copy of the module; that copy stays in use.`);
}
// src/editor/fields.ts
var Ea = (e, t, { advanced: n = !1 } = {}) => ({
	name: e,
	selector: { entity: { domain: t } },
	...n ? { advanced: n } : {}
});
function Da(e) {
	let t = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(e.trim())?.[1];
	if (t === void 0) return;
	let n = t.length === 3 ? t.replace(/./g, "$&$&") : t, r = (e) => Number.parseInt(n.slice(e, e + 2), 16);
	return [
		r(0),
		r(2),
		r(4)
	];
}
var Oa = (e) => Array.isArray(e) && e.length === 3 && e.every((e) => typeof e == "number" && Number.isFinite(e)), ka = (e) => "#" + e.map((e) => Math.min(255, Math.max(0, Math.round(e))).toString(16).padStart(2, "0")).join(""), Aa = (e) => ({
	name: e,
	selector: { color_rgb: {} }
}), ja = (e, t, n, r = t.default) => ({
	name: e,
	default: r,
	selector: { select: {
		mode: "dropdown",
		options: t.choices.map((e) => ({
			value: e,
			label: n[e] ?? e
		}))
	} }
}), Ma = "#9e9e9e", Na = /^colors_(\d+)_(temperature|color)$/;
function Pa(e) {
	let t = Na.exec(e);
	return t?.[1] === void 0 ? void 0 : {
		index: Number(t[1]),
		part: t[2]
	};
}
function Fa(e) {
	let t = O(e, "colors");
	return Array.isArray(t) ? t.map((e) => {
		let { temperature: t, color: n } = typeof e == "object" && e ? e : {};
		return {
			...typeof t == "number" ? { temperature: t } : {},
			...typeof n == "string" ? { color: n } : {}
		};
	}) : Xt.map((e) => ({ ...e }));
}
var Ia = Da("#9e9e9e") ?? [
	158,
	158,
	158
], La = () => ({ color: Ia });
function Ra(e) {
	let t = [...e];
	for (; t.length >= 2 && t[t.length - 1]?.temperature === void 0 && t[t.length - 2]?.temperature === void 0;) t.pop();
	return t.at(-1)?.temperature === void 0 && t.length > 0 ? t : [...t, La()];
}
function za(e) {
	return Ra(Fa(e).map(({ temperature: e, color: t }) => {
		let n = t === void 0 ? void 0 : Da(t);
		return {
			...e === void 0 ? {} : { temperature: e },
			...n === void 0 ? {} : { color: n },
			...t === void 0 ? {} : { orig: t }
		};
	}));
}
function Ba(e) {
	return Array.from({ length: e }, (e, t) => t).flatMap((e) => [{
		name: `colors_${String(e)}_temperature`,
		selector: { number: {
			step: "any",
			mode: "box",
			unit_of_measurement: C.celsius
		} }
	}, Aa(`colors_${String(e)}_color`)]);
}
function Va(e) {
	let t = {};
	return e.forEach(({ temperature: e, color: n }, r) => {
		e !== void 0 && (t[`colors_${String(r)}_temperature`] = e), n !== void 0 && (t[`colors_${String(r)}_color`] = [...n]);
	}), t;
}
function Ha(e) {
	let t = /* @__PURE__ */ new Map(), n = {};
	for (let [r, i] of Object.entries(e)) {
		let e = Pa(r);
		e === void 0 ? n[r] = i : t.set(e.index, {
			...t.get(e.index),
			[e.part]: i
		});
	}
	return {
		rows: t,
		rest: n
	};
}
var Ua = (e, t) => e.every((e, n) => e === t[n]);
function Wa(e) {
	let t = typeof e == "string" && e.trim() !== "" ? Number(e) : e;
	return typeof t == "number" && Number.isFinite(t) ? t : void 0;
}
function Ga(e, t) {
	let n = t === void 0 ? void 0 : Da(t);
	return Oa(e) ? t !== void 0 && n && Ua(n, e) ? t : ka(e) : t !== void 0 && n === void 0 ? t : Ma;
}
function Ka(e, t) {
	let n = Math.max(e.length, ...[...t.keys()].map((e) => e + 1));
	return Ra(Array.from({ length: n }, (n, r) => {
		let i = t.get(r), a = Wa(i?.temperature), o = i !== void 0 && Oa(i.color) ? i.color : void 0, s = e[r]?.orig;
		return {
			...a === void 0 ? {} : { temperature: a },
			...o === void 0 ? {} : { color: o },
			...s === void 0 ? {} : { orig: s }
		};
	}));
}
var qa = (e, t) => e.length === t.length && e.every((e, n) => e.temperature === t[n]?.temperature && e.color === t[n]?.color), Ja = (e) => e.length === Xt.length && e.every((e, t) => {
	let n = Xt[t];
	return e.temperature === n?.temperature && e.color.toLowerCase() === n.color;
});
function Ya(e, t) {
	let n = e.flatMap(({ temperature: e, color: t, orig: n }) => e === void 0 ? [] : [{
		temperature: e,
		color: Ga(t, n)
	}]).sort((e, t) => e.temperature - t.temperature), r = O(t, "colors");
	return Array.isArray(r) && qa(n, Fa(t)) ? "keep" : Ja(n) ? r !== void 0 && !Array.isArray(r) ? "keep" : void 0 : n;
}
function Xa(e, t) {
	return t === void 0 ? Object.fromEntries(Object.entries(e).filter(([e]) => e !== "colors")) : {
		...e,
		colors: t
	};
}
// src/editor/ecogeo-schema.ts
var Za = ["features", "entities"], Qa = ["entities"], $a = "default", eo = [
	[$a, void 0],
	["true", !0],
	["false", !1],
	["unused", "unused"]
];
function to(e, t) {
	let { on: n, off: r, unused: i, presetOn: a, presetOff: o, presetUnused: s, variantDefault: c } = E.featureChoices;
	return {
		name: e,
		default: $a,
		coded: eo,
		selector: { select: {
			mode: "dropdown",
			options: [
				{
					value: $a,
					label: c(t === "unused" ? s : t ? a : o)
				},
				{
					value: "true",
					label: n
				},
				{
					value: "false",
					label: r
				},
				{
					value: "unused",
					label: i
				}
			]
		} }
	};
}
var no = [
	"passive_cooling",
	"active_cooling",
	"htr",
	"backup_heater"
];
function ro() {
	return {
		name: "variant",
		default: "4",
		coded: k.map((e) => [String(e), e]),
		selector: { select: {
			mode: "dropdown",
			options: k.map((e) => ({
				value: String(e),
				label: E.choices.variant[e]
			}))
		} }
	};
}
var io = (e) => pn.filter((t) => t === "unused" || t === Cn(e) || t === "none" && e === "B");
function ao(e, t) {
	let n = O(e, "dhw"), r = io(t), i = pn.filter((e) => r.includes(e) || e === n);
	return ja("dhw", {
		..._n,
		choices: i
	}, E.choices.dhw, Cn(t));
}
function oo() {
	let e = /* @__PURE__ */ new Map();
	for (let t of Et) {
		let [n = "", r = ""] = t.path.split(".");
		e.set(n, [...e.get(n) ?? [], Ea(r, t.domain, { advanced: !0 })]);
	}
	return {
		type: "expandable",
		name: "entities",
		schema: [...e].map(([e, t]) => ({
			type: "expandable",
			name: e,
			title: E.roleGroups[e],
			schema: t
		}))
	};
}
function so(e, t = za(e).length) {
	let n = ln(On(e)), r = O(e, "model") === dn[1] ? dn[1] : dn[0];
	return [
		{
			type: "expandable",
			name: "unit",
			flatten: !0,
			schema: [
				ja("model", hn, E.choices.model),
				ro(),
				ja("source", gn, E.choices.source),
				ao(e, r)
			]
		},
		{
			type: "expandable",
			name: "entity_prefix",
			flatten: !0,
			schema: [{
				name: "prefix",
				selector: { text: {} }
			}]
		},
		{
			type: "expandable",
			name: "features",
			schema: no.map((e) => to(e, n[e]))
		},
		{
			type: "expandable",
			name: "appearance",
			flatten: !0,
			schema: [
				ja("detail", vn, E.choices.detail),
				ja("exchanger_fill", yn, E.choices.exchanger_fill),
				ja("layout", bn, E.choices.layout),
				...Ba(t)
			]
		},
		oo()
	];
}
// src/editor/schema.ts
function co(e) {
	return "type" in e;
}
function lo(e) {
	let { advanced: t, ...n } = e;
	return n;
}
function uo(e, t) {
	return e.flatMap((e) => {
		if (!co(e)) return t || e.advanced !== !0 ? [lo(e)] : [];
		let n = uo(e.schema, t);
		return n.length > 0 ? [{
			...e,
			schema: n
		}] : [];
	});
}
function $(e, t = "") {
	return e.flatMap((e) => co(e) ? $(e.schema, e.flatten ? t : `${t}${e.name}.`) : [{
		field: e,
		path: `${t}${e.name}`
	}]);
}
function fo(e, t) {
	return uo(e, t);
}
function po(e, t) {
	if (e == null || e === "") return !1;
	if (t.default === void 0) return !0;
	if (typeof t.default == "number") {
		let n = typeof e == "number" ? e : typeof e == "string" ? nt(e) : void 0;
		if (n !== void 0) return n !== t.default;
	}
	return mo(e) !== mo(t.default);
}
function mo(e) {
	return (typeof e == "string" || typeof e == "number" || typeof e == "boolean" ? String(e) : JSON.stringify(e)).toLowerCase();
}
function ho(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function go(e, t, n, r, i = "") {
	let [a, ...o] = t.split("."), s = e, { [a]: c, ...l } = s;
	if (o.length === 0) return n === void 0 ? l : Object.hasOwn(s, a) ? {
		...s,
		[a]: n
	} : {
		...l,
		[a]: n
	};
	let u = go(ho(c) ? c : {}, o.join("."), n, r, `${i}${a}.`), d = r !== void 0 && O(r, `${i}${a}`) !== void 0;
	return n === void 0 && Object.keys(u).length === 0 && !d ? l : {
		...s,
		[a]: u
	};
}
function _o(e, t, n = /* @__PURE__ */ new Set()) {
	return $(e).reduce((e, { field: r, path: i }) => r.default !== void 0 && O(t, i) === void 0 && !n.has(i) ? go(e, i, r.default) : e, t);
}
function vo(e, t, n) {
	return $(e).map(({ path: e }) => e).filter((e) => O(t, e) !== void 0 && O(n, e) === void 0);
}
function yo(e) {
	if (!ho(e)) return e;
	let t = Object.entries(e).filter(([, e]) => e !== void 0).map(([e, t]) => [e, yo(t)]);
	return t.length !== Object.keys(e).length || t.some(([t, n]) => n !== e[t]) ? Object.fromEntries(t) : e;
}
function bo(e, t) {
	return $(e).reduce((e, { field: n, path: r }) => ("text" in n.selector || "entity" in n.selector) && O(e, r) === "" ? go(e, r, void 0, t) : e, t);
}
function xo(e, t) {
	return $(e).reduce((e, { field: t, path: n }) => {
		let r = O(e, n), i = t.coded?.find(([, e]) => e !== void 0 && e === r);
		return i === void 0 ? e : go(e, n, i[0]);
	}, t);
}
function So(e, t, n) {
	return $(e).reduce((e, { field: t, path: r }) => {
		let i = O(e, r), a = t.coded?.find(([e]) => e === i);
		return a === void 0 ? e : go(e, r, a[1], n);
	}, t);
}
function Co(e, t, n, r = []) {
	let i = (e) => ho(e) && Object.keys(e).length === 0;
	return Object.fromEntries(Object.entries(e).flatMap(([e, a]) => {
		if (!n.includes(e) || !ho(a)) return [[e, a]];
		let o = t[e], s = r.includes(e) ? Object.fromEntries(Object.entries(a).filter(([e, t]) => !i(t) || ho(o) && i(o[e]))) : a;
		return Object.keys(s).length > 0 || i(o) ? [[e, s]] : [];
	}));
}
function wo(e, t, n) {
	return $(e).reduce((e, { field: n, path: r }) => n.default !== void 0 && O(t, r) === void 0 && O(e, r) !== void 0 && !po(O(e, r), n) ? go(e, r, void 0, t) : e, n);
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/decorate.js
function To(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/editor/ecogeo-card-editor.ts
var Eo = "ecogeo-card-editor", Do = [{
	name: "advanced",
	selector: { boolean: {} }
}], Oo = () => E.advanced, ko = E.sections, Ao = E.fields, jo = E.roles;
function Mo(e) {
	if (co(e)) return e.title ?? ko[e.name] ?? e.name;
	let t = Pa(e.name);
	return t === void 0 ? Ao[e.name] ?? jo[e.name] ?? e.name : E.colorRow[t.part](t.index + 1);
}
var No = (e) => Object.hasOwn(e, "entities"), Po = class extends We {
	static {
		this.styles = o`
    .hint {
      color: var(--secondary-text-color);
    }
    .switch {
      display: block;
      margin-bottom: 8px;
    }
    .error {
      color: var(--error-color);
      margin: 0 0 8px;
    }
  `;
	}
	constructor() {
		super(), this.schemaFor = so, this._switch = { advanced: !1 }, this._formDefined = customElements.get("ha-form") !== void 0, this._schema = [], this._formSchema = [], this._shown = {}, this._draft = [], this._draftBuilt = !1, this._emptied = /* @__PURE__ */ new Set(), this._toggleAdvanced = (e) => {
			e.stopPropagation(), this._switch = { advanced: e.detail.value.advanced === !0 };
		}, this._configChanged = (e) => {
			e.stopPropagation();
			let t = this._config ?? {}, n = this._hasColorRows, r = n ? Ha(e.detail.value) : void 0, i = yo(bo(this._schema, r?.rest ?? e.detail.value)), a = n ? Ha(this._shown).rest : this._shown, o = vo(this._schema, a, i);
			this._emptied = new Set([...this._emptied, ...o].filter((e) => O(i, e) === void 0));
			let s = So(this._schema, i, t), c = Co(wo(this._schema, t, s), t, Za, Qa);
			r && (this._draft = Ka(this._draft, r.rows));
			let l = r ? Ya(this._draft, t) : "keep", u = l === "keep" ? c : Xa(c, l);
			this._colorsSeen = u.colors, this._config = u, this._refreshSchema(u), this.dispatchEvent(new CustomEvent("config-changed", {
				detail: { config: u },
				bubbles: !0,
				composed: !0
			}));
		}, this._formDefined || customElements.whenDefined("ha-form").then(() => {
			this._formDefined = !0;
		});
	}
	setConfig(e) {
		let t = JSON.stringify(e) !== JSON.stringify(this._config);
		this._emptied.size > 0 && t && (this._emptied = /* @__PURE__ */ new Set());
		let n = this._config !== void 0 && No(this._config);
		No(e) && !n && !this._switch.advanced && (this._switch = { advanced: !0 }), this._draftBuilt && JSON.stringify(e.colors) === JSON.stringify(this._colorsSeen) || (this._draft = za(e), this._colorsSeen = e.colors, this._draftBuilt = !0), this._config = e, this._refreshSchema(e);
	}
	_refreshSchema(e) {
		let t = this.schemaFor(e, this._draft.length);
		JSON.stringify(t) !== JSON.stringify(this._schema) && (this._schema = t, this._formSchema = fo(t, this._switch.advanced));
	}
	willUpdate(e) {
		e.has("schemaFor") && this._config && this._refreshSchema(this._config), e.has("_switch") && (this._formSchema = fo(this._schema, this._switch.advanced)), this._config && (e.has("_config") || e.has("schemaFor")) && (this._shown = {
			...xo(this._schema, _o(this._schema, this._config, this._emptied)),
			...this._hasColorRows ? Va(this._draft) : {}
		});
	}
	get _hasColorRows() {
		return $(this._schema).some(({ path: e }) => Pa(e) !== void 0);
	}
	render() {
		if (!this._config) return b;
		let e = Vn(this._config);
		return v`
      ${e.length > 0 ? v`<p class="error" role="alert">${e.join("; ")}</p>` : b}
      ${this._formDefined ? v`<ha-form
                class="switch"
                .hass=${this.hass}
                .data=${this._switch}
                .schema=${Do}
                .computeLabel=${Oo}
                @value-changed=${this._toggleAdvanced}
              ></ha-form>
              <ha-form
                .hass=${this.hass}
                .data=${this._shown}
                .schema=${this._formSchema}
                .computeLabel=${Mo}
                @value-changed=${this._configChanged}
              ></ha-form>` : v`<p class="hint">${E.noForm}</p>`}
    `;
	}
};
To([Ca({ attribute: !1 })], Po.prototype, "hass", void 0), To([Ca({ attribute: !1 })], Po.prototype, "schemaFor", void 0), To([wa()], Po.prototype, "_config", void 0), To([wa()], Po.prototype, "_switch", void 0), To([wa()], Po.prototype, "_formDefined", void 0), Ta(Eo, Po);
// src/diagram/source.ts
var Fo = o`
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
    ${tr}
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
`, Io = (e) => e === void 0 || !(e > 0) ? void 0 : Math.min(6, Math.max(.5, 120 / e)), Lo = [
	0,
	72,
	144,
	216,
	288
].map((e) => y`<path class="fan-blade" d="M0 -4 C9 -6 21 -16 17 -30 C6 -26 -3 -17 -3 -6 Z" transform="rotate(${e})" />`);
function Ro(e, t, n, r) {
	let { x: i, y: a, width: o, height: s, fanX: c, fanY: l, fanRadius: u, coil: d, fins: f, slats: p, dividerY: ee } = P, m = Io(e), te = Array.from({ length: f.count }, (e, t) => f.x + t * f.step), ne = Array.from({ length: p.count }, (e, t) => p.y0 + t * p.step), [re, ie] = [i + 6, c + u + 6], ae = c - u - 6 - re, h = er($n(Zn, n), n?.onTap);
	return y`<g class="air-unit${t ? " muted" : ""}" data-source="air">
    <rect class="source-outline" x=${i} y=${a} width=${o} height=${s} rx="6" />
    <path class="source-divider" d="M${i} ${ee} H${i + o}" />
    ${ne.map((e) => y`<path class="source-slat" data-slat d="M${re} ${e} h${ae} M${ie} ${e} h${ae}" />`)}
    <rect class="source-frame" data-coil-block x=${d.x} y=${d.y} width=${d.width} height=${d.height} rx="3" />
    ${te.map((e) => y`<path class="source-fin" d="M${e} ${f.y0} V${f.y1}" />`)}
    <g class="fan-part" aria-label=${Tt} role=${h.role} tabindex=${h.tabindex} @click=${h.click} @keydown=${h.keydown}>
      <title>${Tt}</title>
      <circle class="fan-ring" cx=${c} cy=${l} r=${u} />
      <circle class="fan-hit" cx=${c} cy=${l} r=${u} fill="transparent" stroke="none" />
      <g class="fan" data-fan transform="translate(${c} ${l})">
        <g class=${m === void 0 ? "fan-rotor still" : "fan-rotor"} style=${m === void 0 ? "" : `--fan-duration: ${String(m)}s`}>${Lo}<circle class="fan-hub" r="5" fill="var(--primary-text-color)" /></g>
      </g>
    </g>
    ${r ? y`<text class="source-caption" x=${P.captionX} y=${P.captionY} text-anchor="middle">${vt.air}</text>` : b}
  </g>`;
}
function zo(e, t) {
	return Hr(e).flatMap(({ part: e }) => e.id.startsWith("src_") ? e.points.slice(1).flatMap((n, r) => {
		let i = e.points[r];
		return i?.[0] === n[0] && t >= Math.min(i[1], n[1]) && t <= Math.max(i[1], n[1]) ? [n[0]] : [];
	}) : []);
}
function Bo(e, t, n, r) {
	let i = zo(e, n), a = Array.from({ length: Math.floor((fr.end - fr.start - 12) / 10) + 1 }, (e, t) => fr.start + 6 + t * 10).filter((e) => !i.some((t) => Math.abs(t - e) < 10)), o = pr.y[t];
	return y`<g class="ground-loop${r ? " muted" : ""}" data-source="ground">
    <path class="source-ground" d="M${fr.start} ${n} H${fr.end}" />
    ${a.map((e) => y`<path class="source-ground" d="M${e} ${n} l-6 8" />`)}
    ${e.captions === !1 ? b : y`<text class="source-caption" x=${pr.x} y=${o} text-anchor="middle">${vt.ground}</text>`}
  </g>`;
}
function Vo(e, t, n, r) {
	let i = e.source === "air" || e.source === "hybrid", a = e.source === "ground" || e.source === "hybrid", o = e.source === "hybrid" ? "hybrid" : "ground";
	return y`<g class="source" data-source-kind=${e.source}>
    ${i ? Ro(t["source.fan_speed"], !n, r, e.captions !== !1) : y``}
    ${a ? Bo(e, o, L[o], !n) : y``}
  </g>`;
}
// src/lib/render.ts
function Ho(e, t) {
	return e === t || Array.isArray(e) && Array.isArray(t) && e.length === t.length && e.every((e, n) => e === t[n]);
}
function Uo(e, t) {
	if (e === t) return !0;
	if (typeof e != "object" || typeof t != "object" || e === null || t === null) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	return n.length === r.length && n.every((n) => Object.hasOwn(t, n) && Ho(e[n], t[n]));
}
function Wo(e, t, n) {
	return e === void 0 || e.locale !== t.locale || e.language !== t.language || e.localize !== t.localize || e.formatEntityState !== t.formatEntityState || e.themes?.darkMode !== t.themes?.darkMode || n.some((n) => e.states[n] !== t.states[n] || !Uo(e.entities?.[n], t.entities?.[n]));
}
function Go(e, t, n, r) {
	return e.size === 1 && e.has("hass") ? t !== void 0 && Wo(n, t, r) : !0;
}
// src/card/ecogeo-card.ts
var Ko = "ecogeo-card", qo = nr.width, Jo = nr.height, Yo = 0;
Ta(Ko, class extends We {
	static {
		this.styles = [
			Mi,
			Fo,
			Hi,
			ea,
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
	static getConfigElement() {
		return document.createElement(Eo);
	}
	static getStubConfig() {
		return {};
	}
	constructor() {
		super(), this.renderedCompact = !1, this.renderedAutoCompact = !1, this.renderedStroke = si(void 0), this.entityIds = [], this.idPrefix = `ecogeo${String(++Yo)}`, this.width = 0;
	}
	get shownLayout() {
		return ni(this.resolved?.layout ?? "auto", this.width, this.renderedAutoCompact) ? "compact" : "full";
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
		let t = Vn(e);
		if (t.length > 0) throw Error(t.join("; "));
		this.resolved = Yn(e), this.entityIds = [...new Set(Object.values(this.resolved.entities).filter((e) => e !== void 0))], this.config = e;
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
			let e = si(this.width);
			return this.shownLayout === "compact" !== this.renderedCompact || e.pipe !== this.renderedStroke.pipe || e.outline !== this.renderedStroke.outline;
		}
		return Go(e, this.hass, this.renderedHass, this.entityIds);
	}
	readings(e) {
		let t = e.sample ? Kn : this.hass?.states ?? {};
		return {
			readings: Mt(t, e.entities),
			offline: Xe(at(t, e.entities["unit.connection"]))
		};
	}
	render() {
		this.renderedHass = this.hass;
		let e = this.shownLayout, t = e === "compact";
		this.renderedCompact = t, this.renderedAutoCompact = t && this.resolved?.layout === "auto";
		let n = si(this.width);
		this.renderedStroke = n;
		let r = this.resolved;
		if (r === void 0) return v`<ha-card data-layout=${e}><div class="diagram"></div></ha-card>`;
		let i = t ? {
			...r,
			detail: "simplified",
			captions: !1
		} : r, { readings: a, offline: o } = this.readings(i), s = Ye(a, i.features), c = Qe(s, i.features, i.dhw, a), l = {
			mode: s,
			circuits: c,
			readings: a,
			stops: i.colors
		}, u = i.sample ? Kn : this.hass?.states ?? {}, d = {
			locale: Gi(this.hass),
			entities: this.hass?.entities,
			states: u
		}, f = i.sample ? void 0 : (e) => {
			ot(this, e);
		}, p = {
			entities: i.entities,
			onTap: f
		};
		return v`<ha-card data-layout=${e}>
      <div class="diagram">
        <svg
          viewBox="0 0 ${qo} ${Jo}"
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label=${mt}
          style="--dhw-tank-color: ${i.dhw === "unused" ? Zt : bi(l)}; --ecogeo-coil-muted: ${en(this.hass?.themes?.darkMode === !0)}; --pipe-width: ${String(n.pipe)}; --outline-width: ${String(n.outline)}"
        >
          ${y`${Vo(i, a, c.active.has("brine"), p)}${Ui(i, p)}${Vi(i, l, p, {
			mode: i.exchangerFill,
			idPrefix: this.idPrefix
		}, n.pipe)}`}
        </svg>
        ${ya(ma(i, a, i.entities, d, t), f)}
      </div>
      <div class="footer">
        <span class="mode">${ht[s]}</span>
        ${ba(ga(a, i.entities, d, t), f)}
        ${Ze(a["unit.alarm"]) ? v`<span class="alarm">${gt.alarm}</span>` : b}
        ${o ? v`<span class="offline">${gt.offline}</span>` : b}
        ${i.sample ? v`<span class="sample">${gt.sampleValues}</span>` : b}
      </div>
    </ha-card>`;
	}
});
// src/index.ts
var Xo = {
	type: Ko,
	...pt,
	preview: !0
};
function Zo(e = window) {
	let t = e.customCards ??= [];
	t.some((e) => e.type === Xo.type) || t.push({ ...Xo });
}
Zo();
export { Xo as CARD_ENTRY, Zo as registerCardPicker };
