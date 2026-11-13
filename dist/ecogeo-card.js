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
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: m } = Object, h = globalThis, ee = h.trustedTypes, te = ee ? ee.emptyScript : "", ne = h.reactiveElementPolyfillSupport, g = (e, t) => e, re = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? te : null;
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
}, ie = (e, t) => !l(e, t), ae = {
	attribute: !0,
	type: String,
	converter: re,
	reflect: !1,
	useDefault: !1,
	hasChanged: ie
};
Symbol.metadata ??= Symbol("metadata"), h.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var _ = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = ae) {
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
		return this.elementProperties.get(e) ?? ae;
	}
	static _$Ei() {
		if (this.hasOwnProperty(g("elementProperties"))) return;
		let e = m(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(g("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(g("properties"))) {
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
			let i = (n.converter?.toAttribute === void 0 ? re : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? re : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? ie)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
_.elementStyles = [], _.shadowRootOptions = { mode: "open" }, _[g("elementProperties")] = /* @__PURE__ */ new Map(), _[g("finalized")] = /* @__PURE__ */ new Map(), ne?.({ ReactiveElement: _ }), (h.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var oe = globalThis, se = (e) => e, ce = oe.trustedTypes, le = ce ? ce.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, ue = "$lit$", v = `lit$${Math.random().toFixed(9).slice(2)}$`, de = "?" + v, fe = `<${de}>`, pe = document, me = () => pe.createComment(""), he = (e) => e === null || typeof e != "object" && typeof e != "function", ge = Array.isArray, _e = (e) => ge(e) || typeof e?.[Symbol.iterator] == "function", ve = "[ 	\n\f\r]", ye = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, be = /-->/g, xe = />/g, Se = RegExp(`>|${ve}(?:([^\\s"'>=/]+)(${ve}*=${ve}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), Ce = /'/g, we = /"/g, Te = /^(?:script|style|textarea|title)$/i, Ee = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), y = Ee(1), b = Ee(2), De = Symbol.for("lit-noChange"), x = Symbol.for("lit-nothing"), Oe = /* @__PURE__ */ new WeakMap(), ke = pe.createTreeWalker(pe, 129);
function Ae(e, t) {
	if (!ge(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return le === void 0 ? t : le.createHTML(t);
}
var je = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = ye;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === ye ? c[1] === "!--" ? o = be : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = Se) : (Te.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = Se) : o = xe : o === Se ? c[0] === ">" ? (o = i ?? ye, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? Se : c[3] === "\"" ? we : Ce) : o === we || o === Ce ? o = Se : o === be || o === xe ? o = ye : (o = Se, i = void 0);
		let d = o === Se && e[t + 1].startsWith("/>") ? " " : "";
		a += o === ye ? n + fe : l >= 0 ? (r.push(s), n.slice(0, l) + ue + n.slice(l) + v + d) : n + v + (l === -2 ? t : d);
	}
	return [Ae(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Me = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = je(t, n);
		if (this.el = e.createElement(l, r), ke.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = ke.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(ue)) {
					let t = u[o++], n = i.getAttribute(e).split(v), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Le : r[1] === "?" ? Re : r[1] === "@" ? ze : Ie
					}), i.removeAttribute(e);
				} else e.startsWith(v) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (Te.test(i.tagName)) {
					let e = i.textContent.split(v), t = e.length - 1;
					if (t > 0) {
						i.textContent = ce ? ce.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], me()), ke.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], me());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === de) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(v, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += v.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = pe.createElement("template");
		return n.innerHTML = e, n;
	}
};
function Ne(e, t, n = e, r) {
	if (t === De) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = he(t) ? void 0 : t._$litDirective$;
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? pe).importNode(t, !0);
		ke.currentNode = r;
		let i = ke.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Fe(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Be(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = ke.nextNode(), a++);
		}
		return ke.currentNode = pe, r;
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
		this.type = 2, this._$AH = x, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = Ne(this, e, t), he(e) ? e === x || e == null || e === "" ? (this._$AH !== x && this._$AR(), this._$AH = x) : e !== this._$AH && e !== De && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? _e(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== x && he(this._$AH) ? this._$AA.nextSibling.data = e : this.T(pe.createTextNode(e)), this._$AH = e;
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
		let t = Oe.get(e.strings);
		return t === void 0 && Oe.set(e.strings, t = new Me(e)), t;
	}
	k(t) {
		ge(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(me()), this.O(me()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = se(e).nextSibling;
			se(e).remove(), e = t;
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
		this.type = 1, this._$AH = x, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = x;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = Ne(this, e, t, 0), a = !he(e) || e !== this._$AH && e !== De, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = Ne(this, r[n + o], t, o), s === De && (s = this._$AH[o]), a ||= !he(s) || s !== this._$AH[o], s === x ? e = x : e !== x && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === x ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Le = class extends Ie {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === x ? void 0 : e;
	}
}, Re = class extends Ie {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== x);
	}
}, ze = class extends Ie {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = Ne(this, e, t, 0) ?? x) === De) return;
		let n = this._$AH, r = e === x && n !== x || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== x && (n === x || r);
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
}, Ve = oe.litHtmlPolyfillSupport;
Ve?.(Me, Fe), (oe.litHtmlVersions ??= []).push("3.3.3");
var He = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Fe(t.insertBefore(me(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Ue = globalThis, We = class extends _ {
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
		return De;
	}
};
We._$litElement$ = !0, We.finalized = !0, Ue.litElementHydrateSupport?.({ LitElement: We });
var Ge = Ue.litElementPolyfillSupport;
Ge?.({ LitElement: We }), (Ue.litElementVersions ??= []).push("4.2.2");
// src/strings.ts
var S = {
	invalid: (e, t) => `Invalid option ${e}: expected ${t}`,
	number: (e, t) => `a number from ${e} to ${t}`,
	color: "a CSS colour such as #db4437 or rgb(219, 68, 55)",
	boolean: "true or false",
	object: "a group of options",
	choice: (e) => `one of ${e.join(", ")}`,
	list: "a list of texts"
}, Ke = {
	name: "ecoGEO Schematic",
	description: "The internal schematic of an Ecoforest ecoGEO heat pump, with live values and pipes coloured by temperature."
}, qe = "ecoGEO heat pump schematic", C = {
	celsius: "°C",
	kelvin: "K",
	bar: "bar",
	percent: "%",
	rpm: "rpm",
	watt: "W"
}, Je = {
	off: ["OFF"],
	defrost: ["Defrost"]
}, Ye = {
	off: "Off",
	defrost: "Defrost",
	dhw: "DHW",
	active_cooling: "Active cooling",
	heating: "Heating",
	passive_cooling: "Passive cooling",
	standby: "Standby"
}, Xe = {
	alarm: "Alarm",
	offline: "Offline",
	sampleValues: "Sample values"
}, w = {
	unknownOption: (e) => `Unknown option ${e}`,
	unknownFeature: (e, t) => `Unknown feature ${e}: expected one of ${t.join(", ")}`,
	unknownRole: (e) => `Unknown entity role ${e}`,
	notEntityId: (e) => `Invalid entity for ${e}: expected an entity id such as sensor.name, or none`,
	statesKey: (e) => `Unknown option states.${e}: expected off or defrost`,
	statesList: (e) => `Invalid option states.${e}: expected a list of one or more texts`,
	featureState: (e) => `Invalid option features.${e}: expected true, false or unused`,
	integer: (e, t) => `a whole number from ${e} to ${t}`,
	prefix: "a prefix of lowercase letters, digits and underscores",
	colors: "Invalid option colors: expected an ascending list of 2 to 8 stops, each { temperature, color } with a number and a CSS colour",
	dhwMismatch: (e, t) => `Invalid option dhw: ${e} does not fit model ${t}${e === "none" && t === "C" ? " (model C always has its tank; use unused)" : ""}`
}, Ze = {
	dg1: "DG1",
	outerLoop: "Outer loop",
	dhw: "DHW"
}, Qe = {
	air: "Air unit",
	ground: "Ground loop"
}, $e = {
	externalTank: "DHW tank",
	demand: "Demand"
}, et = { demand: "Demand" }, T = {
	setpoint: "Setpoint",
	startDelta: "Start ΔT",
	setpointShort: "Set",
	startDeltaShort: "ΔT",
	fan: "Fan",
	outside: "Outside",
	portIn: "In",
	portOut: "Out",
	dhw: "DHW"
}, tt = {
	outside: "Outside",
	cop: "COP",
	condensation: "Condensation",
	evaporation: "Evaporation",
	summer: "Summer",
	winter: "Winter"
}, nt = {
	on: "On",
	off: "Off",
	emergency: "Emergency"
}, rt = {
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
}, it = (e) => {
	let t = rt[e];
	return t === void 0 ? "" : `${t} (${String(e)})`;
}, at = "Air unit fan", E = {
	noForm: "The editor needs Home Assistant's form element, which is not available yet. Use the code editor instead.",
	sections: {
		unit: "Unit",
		entity_prefix: "Entities",
		features: "Features",
		appearance: "Appearance",
		entities: "Advanced entities",
		states: "State values"
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
		layout: "Layout",
		_device: "Device",
		_not_present: "Not present",
		off: "Off state values",
		defrost: "Defrost state values"
	},
	suggest: {
		button: "Suggest entities",
		filled: (e) => `${String(e)} ${e === 1 ? "role" : "roles"} filled from the device.`,
		empty: (e) => `Left empty: ${e.join(", ")}.`,
		warningsTitle: "Entity check",
		unknown: (e, t) => `${e}: ${t} does not exist in Home Assistant.`,
		unit: (e, t) => `${e}: the unit of ${t} does not fit this role.`,
		kind: (e, t) => `${e}: ${t} is not a kind of entity this role reads.`
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
}, ot = Je, st = /* @__PURE__ */ new Set(["unknown", "unavailable"]), ct = -999, lt = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;
function ut(e) {
	if (!lt.test(e)) return;
	let t = Number(e);
	return Number.isFinite(t) ? t + 0 : void 0;
}
function dt(e) {
	if (e === void 0 || st.has(e.state)) return !0;
	let t = ut(e.state);
	return t !== void 0 && t <= ct;
}
function ft(e) {
	if (!(e === void 0 || dt(e))) return ut(e.state);
}
// src/lib/hass.ts
var pt = (e, t) => t === void 0 ? void 0 : e[t];
function mt(e, t) {
	e.dispatchEvent(new CustomEvent("hass-more-info", {
		detail: { entityId: t },
		bubbles: !0,
		composed: !0
	}));
}
// src/lib/units.ts
var ht = { scale: 1 }, gt = {
	scale: 5 / 9,
	offset: -32
}, _t = {
	temperature: /* @__PURE__ */ new Map([["°c", ht], ["°f", gt]]),
	difference: /* @__PURE__ */ new Map([
		["k", ht],
		["°c", ht],
		["°f", gt]
	]),
	power: /* @__PURE__ */ new Map([["w", ht], ["kw", { scale: 1e3 }]]),
	pressure: /* @__PURE__ */ new Map([
		["bar", ht],
		["kpa", { scale: .01 }],
		["mpa", { scale: 10 }],
		["pa", { scale: 1e-5 }],
		["mbar", { scale: .001 }],
		["psi", { scale: .0689476 }]
	])
};
function vt(e) {
	return e.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase();
}
var yt = (e, t) => t !== void 0 && _t[e].has(vt(t));
function bt(e, t) {
	let n = ft(e);
	return n === void 0 ? void 0 : xt(t, n, e?.attributes.unit_of_measurement);
}
function xt(e, t, n) {
	if (!Number.isFinite(t) || n === void 0) return;
	let r = _t[e].get(vt(n));
	return r ? (t + (r.offset ?? 0)) * r.scale : void 0;
}
// src/config/roles.ts
var D = [
	"sensor",
	"number",
	"input_number"
], St = [
	...D,
	"binary_sensor",
	"switch",
	"input_boolean"
], Ct = [
	"binary_sensor",
	"switch",
	"input_boolean",
	"sensor"
], wt = [
	"sensor",
	"select",
	"input_select",
	"binary_sensor",
	"switch",
	"input_boolean"
], O = C.celsius, k = [
	{
		path: "production.outlet_temperature",
		domain: "sensor",
		suffix: "production_out",
		kind: "number",
		quantity: "temperature",
		unit: O,
		decimals: 1,
		item: "33",
		accepts: D,
		direction: "out"
	},
	{
		path: "production.return_temperature",
		domain: "sensor",
		suffix: "production_in",
		kind: "number",
		quantity: "temperature",
		unit: O,
		decimals: 1,
		item: "34",
		accepts: D,
		direction: "in"
	},
	{
		path: "production.pressure",
		domain: "sensor",
		suffix: "pressure_production",
		kind: "number",
		quantity: "pressure",
		unit: C.bar,
		decimals: 1,
		item: "38",
		accepts: D
	},
	{
		path: "production.pump",
		domain: "sensor",
		suffix: "production_pump",
		kind: "number",
		unit: C.percent,
		decimals: 1,
		item: "15",
		onOff: !0,
		accepts: St
	},
	{
		path: "brine.outlet_temperature",
		domain: "sensor",
		suffix: "brine_out",
		kind: "number",
		quantity: "temperature",
		unit: O,
		decimals: 1,
		item: "31",
		accepts: D,
		direction: "out"
	},
	{
		path: "brine.inlet_temperature",
		domain: "sensor",
		suffix: "brine_in",
		kind: "number",
		quantity: "temperature",
		unit: O,
		decimals: 1,
		item: "32",
		accepts: D,
		direction: "in"
	},
	{
		path: "brine.pressure",
		domain: "sensor",
		suffix: "pressure_brine",
		kind: "number",
		quantity: "pressure",
		unit: C.bar,
		decimals: 1,
		item: "37",
		accepts: D
	},
	{
		path: "brine.pump",
		domain: "sensor",
		suffix: "brine_pump",
		kind: "number",
		unit: C.percent,
		decimals: 1,
		item: "16",
		onOff: !0,
		accepts: St
	},
	{
		path: "compressor.speed",
		domain: "sensor",
		suffix: "compressor_rpm",
		kind: "number",
		unit: C.rpm,
		decimals: 0,
		item: "11",
		onOff: !0,
		accepts: St
	},
	{
		path: "compressor.percentage",
		domain: "sensor",
		suffix: "compressor_percentage",
		kind: "number",
		unit: C.percent,
		decimals: 1,
		item: "11",
		accepts: D
	},
	{
		path: "compressor.power",
		domain: "sensor",
		suffix: "power_consumption",
		kind: "number",
		quantity: "power",
		unit: C.watt,
		decimals: 0,
		item: "11",
		accepts: D
	},
	{
		path: "compressor.suction_temperature",
		domain: "sensor",
		suffix: "compressor_suction_temperature",
		kind: "number",
		quantity: "temperature",
		unit: O,
		decimals: 1,
		item: "29",
		accepts: D,
		direction: "in"
	},
	{
		path: "compressor.discharge_temperature",
		domain: "sensor",
		suffix: "compressor_discharge_temperature",
		kind: "number",
		quantity: "temperature",
		unit: O,
		decimals: 1,
		item: "30",
		accepts: D,
		direction: "out"
	},
	{
		path: "compressor.suction_pressure",
		domain: "sensor",
		suffix: "compressor_suction_pressure",
		kind: "number",
		quantity: "pressure",
		unit: C.bar,
		decimals: 1,
		item: "35",
		accepts: D,
		direction: "in"
	},
	{
		path: "compressor.discharge_pressure",
		domain: "sensor",
		suffix: "compressor_discharge_pressure",
		kind: "number",
		quantity: "pressure",
		unit: C.bar,
		decimals: 1,
		item: "36",
		accepts: D,
		direction: "out"
	},
	{
		path: "compressor.mode",
		domain: "sensor",
		suffix: "compressor_operation_mode",
		kind: "text",
		item: "11",
		onOff: !0,
		accepts: wt
	},
	{
		path: "refrigerant.condensation_temperature",
		domain: "sensor",
		suffix: "condensation_temperature",
		kind: "number",
		quantity: "temperature",
		unit: O,
		decimals: 1,
		item: "8",
		accepts: D
	},
	{
		path: "refrigerant.evaporation_temperature",
		domain: "sensor",
		suffix: "evaporation_temperature",
		kind: "number",
		quantity: "temperature",
		unit: O,
		decimals: 1,
		item: "7",
		accepts: D
	},
	{
		path: "refrigerant.superheat",
		domain: "sensor",
		suffix: "superheat",
		kind: "number",
		quantity: "difference",
		unit: C.kelvin,
		decimals: 1,
		item: "12",
		accepts: D
	},
	{
		path: "refrigerant.expansion_valve",
		domain: "sensor",
		suffix: "expansion_valve_position",
		kind: "number",
		unit: C.percent,
		decimals: 0,
		item: "12",
		accepts: D
	},
	{
		path: "heating.capacity",
		domain: "sensor",
		suffix: "condensation_capacity",
		kind: "number",
		quantity: "power",
		unit: C.watt,
		decimals: 0,
		item: "8",
		accepts: D
	},
	{
		path: "cooling.capacity",
		domain: "sensor",
		suffix: "evaporation_capacity",
		kind: "number",
		quantity: "power",
		unit: C.watt,
		decimals: 0,
		item: "7",
		accepts: D
	},
	{
		path: "heating.demand",
		domain: "binary_sensor",
		suffix: "dg1_demand",
		kind: "binary",
		item: "1/2",
		accepts: Ct
	},
	{
		path: "heating.setpoint",
		domain: "sensor",
		suffix: "heating_dg1_setpoint",
		kind: "number",
		quantity: "temperature",
		unit: O,
		decimals: 1,
		item: "1/2",
		accepts: D
	},
	{
		path: "dhw.temperature",
		domain: "sensor",
		suffix: "dhw_temperature",
		kind: "number",
		quantity: "temperature",
		unit: O,
		decimals: 1,
		item: "tank (54 on C)",
		accepts: D
	},
	{
		path: "dhw.setpoint",
		domain: "number",
		suffix: "dhw_setpoint",
		kind: "number",
		quantity: "temperature",
		unit: O,
		decimals: 0,
		item: "tank",
		accepts: D
	},
	{
		path: "dhw.start_delta",
		domain: "number",
		suffix: "delta_t_start_dhw",
		kind: "number",
		quantity: "difference",
		unit: C.kelvin,
		decimals: 0,
		item: "tank",
		accepts: D
	},
	{
		path: "dhw.demand",
		domain: "binary_sensor",
		suffix: "dhw_demand",
		kind: "binary",
		item: "26",
		accepts: Ct
	},
	{
		path: "source.fan_speed",
		domain: "sensor",
		suffix: "aerothermal_fan_speed",
		kind: "number",
		unit: C.percent,
		decimals: 1,
		item: "air unit",
		accepts: D
	},
	{
		path: "source.air_unit_outlet_temperature",
		domain: "sensor",
		suffix: "brine_temperature_air_unit_outlet",
		kind: "number",
		quantity: "temperature",
		unit: O,
		decimals: 1,
		item: "air unit",
		accepts: D
	},
	{
		path: "source.outside_temperature",
		domain: "sensor",
		suffix: "outside_temperature",
		kind: "number",
		quantity: "temperature",
		unit: O,
		decimals: 1,
		item: "air unit / footer",
		accepts: D
	},
	{
		path: "unit.on_off",
		domain: "sensor",
		suffix: "heatpump_on_off",
		kind: "text",
		item: "footer",
		onOff: !0,
		accepts: wt
	},
	{
		path: "unit.summer",
		domain: "binary_sensor",
		suffix: "summer",
		kind: "binary",
		item: "footer",
		accepts: Ct
	},
	{
		path: "unit.winter",
		domain: "binary_sensor",
		suffix: "winter",
		kind: "binary",
		item: "footer",
		accepts: Ct
	},
	{
		path: "unit.alarm",
		domain: "binary_sensor",
		suffix: "alarm",
		kind: "binary",
		item: "footer",
		accepts: Ct
	},
	{
		path: "unit.connection",
		domain: "binary_sensor",
		suffix: "status",
		kind: "binary",
		item: "footer",
		accepts: Ct
	},
	{
		path: "unit.cop",
		domain: "sensor",
		suffix: "cop",
		kind: "number",
		decimals: 1,
		item: "footer",
		accepts: D
	}
], Tt = [
	"binary_sensor",
	"switch",
	"input_boolean"
], Et = (e) => e !== void 0 && Tt.includes(e.split(".")[0] ?? ""), Dt = new Map(k.map((e) => [e.path, e])), Ot = k.map((e) => e.path);
[...new Set(k.flatMap((e) => "unit" in e ? [e.unit] : []))];
var kt = (e, t) => `${e.domain}.${t}_${e.suffix}`;
// src/calc/readings.ts
function At(e, t) {
	return t.quantity === void 0 ? ft(e) : bt(e, t.quantity) ?? (t.quantity === "pressure" ? ft(e) : void 0);
}
function jt(e) {
	switch (e?.state.trim().toLowerCase()) {
		case "on":
		case "true":
		case "yes":
		case "1": return !0;
		case "off":
		case "false":
		case "no":
		case "0": return !1;
		default: return;
	}
}
function Mt(e, t, n) {
	if (t.onOff === !0 && Et(n)) return jt(e);
	switch (t.kind) {
		case "number": return At(e, t);
		case "text": return e === void 0 || dt(e) || ["unavailable", "unknown"].includes(e.state.trim().toLowerCase()) ? void 0 : e.state.trim();
		case "binary": return jt(e);
	}
}
function Nt(e, t) {
	return Object.fromEntries(k.map((n) => [n.path, Mt(pt(e, t[n.path]), n, t[n.path])]));
}
var Pt = [
	"production.pump",
	"brine.pump",
	"source.fan_speed"
];
function Ft(e, t, n) {
	let r = {};
	for (let i of Pt) {
		let a = e[i], o = pt(n, t[i])?.attributes.unit_of_measurement?.trim();
		typeof a == "number" && a > 0 && o !== void 0 && o !== "" && o !== "%" && (r[i] = !0);
	}
	return {
		...e,
		...r
	};
}
var It = (e, t) => typeof e == "string" && t.some((t) => t.trim().toLowerCase() === e.trim().toLowerCase()), Lt = (e) => e === !0 || typeof e == "number" && e > 0;
function Rt(e) {
	let t = e["compressor.speed"];
	if (t !== void 0) return Lt(t);
	let n = e["compressor.percentage"];
	if (n !== void 0) return n > 0;
	let r = e["compressor.power"];
	return r === void 0 ? void 0 : r > 100;
}
function zt(e, t, n = ot) {
	let r = e["unit.on_off"];
	if (r === !1 || It(r, n.off)) return "off";
	let i = e["compressor.mode"];
	if (i === !0 || It(i, n.defrost)) return "defrost";
	let a = Rt(e);
	if (a === void 0) return "standby";
	let o = e["unit.summer"] === !0;
	return a ? e["dhw.demand"] === !0 ? "dhw" : o && t.active_cooling === !0 ? "active_cooling" : "heating" : o && Lt(e["production.pump"]) && t.passive_cooling === !0 ? "passive_cooling" : "standby";
}
function Bt(e) {
	return e !== void 0 && (jt(e) === !1 || dt({ state: e.state.trim().toLowerCase() }));
}
var Vt = (e) => e === !0;
// src/calc/circuits.ts
function Ht(e, t, n, r, i = !0) {
	let a = /* @__PURE__ */ new Set(), o = t.passive_cooling !== !1, s = n === "external" || n === "internal";
	switch (e) {
		case "heating":
			a.add("refrigerant").add("brine").add("production_dg1");
			break;
		case "dhw":
			a.add("refrigerant").add("brine"), s && a.add("production_dhw").add("dhw_coil");
			break;
		case "active_cooling":
			a.add("refrigerant").add("brine").add("production_dg1"), t.htr === !0 && s && (r["heating.capacity"] ?? 0) > 0 && a.add("htr").add("dhw_coil");
			break;
		case "passive_cooling":
		case "defrost": a.add("brine").add("production_dg1"), o && a.add("exchanger_10");
	}
	return i && !Lt(r["brine.pump"]) && a.delete("brine"), {
		valve26: e === "dhw" ? "dhw" : "production",
		valve14: e === "active_cooling" ? "reversed" : "normal",
		valves2728: (e === "passive_cooling" || e === "defrost") && o ? "exchanger" : "closed",
		active: a
	};
}
// src/lib/config.ts
var Ut = /^[a-z][a-z0-9_]*\.[a-z0-9_]+$/;
function A(e, t) {
	let n = e;
	for (let e of t.split(".")) {
		if (typeof n != "object" || !n || !Object.hasOwn(n, e)) return;
		n = n[e];
	}
	return n;
}
function Wt(e) {
	if (typeof e != "string") return;
	let t = e.trim();
	return Ut.test(t) ? t : void 0;
}
function Gt(e, t) {
	return Wt(A(e, t));
}
// src/lib/options.ts
var Kt = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, qt = /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|var)\((.*)\)$/i, Jt = /^[#a-zA-Z0-9(),.%\s/+-]+$/, Yt = /* @__PURE__ */ new Set(/* @__PURE__ */ "aliceblue.antiquewhite.aqua.aquamarine.azure.beige.bisque.black.blanchedalmond.blue.blueviolet.brown.burlywood.cadetblue.chartreuse.chocolate.coral.cornflowerblue.cornsilk.crimson.cyan.darkblue.darkcyan.darkgoldenrod.darkgray.darkgreen.darkgrey.darkkhaki.darkmagenta.darkolivegreen.darkorange.darkorchid.darkred.darksalmon.darkseagreen.darkslateblue.darkslategray.darkslategrey.darkturquoise.darkviolet.deeppink.deepskyblue.dimgray.dimgrey.dodgerblue.firebrick.floralwhite.forestgreen.fuchsia.gainsboro.ghostwhite.gold.goldenrod.gray.green.greenyellow.grey.honeydew.hotpink.indianred.indigo.ivory.khaki.lavender.lavenderblush.lawngreen.lemonchiffon.lightblue.lightcoral.lightcyan.lightgoldenrodyellow.lightgray.lightgreen.lightgrey.lightpink.lightsalmon.lightseagreen.lightskyblue.lightslategray.lightslategrey.lightsteelblue.lightyellow.lime.limegreen.linen.magenta.maroon.mediumaquamarine.mediumblue.mediumorchid.mediumpurple.mediumseagreen.mediumslateblue.mediumspringgreen.mediumturquoise.mediumvioletred.midnightblue.mintcream.mistyrose.moccasin.navajowhite.navy.oldlace.olive.olivedrab.orange.orangered.orchid.palegoldenrod.palegreen.paleturquoise.palevioletred.papayawhip.peachpuff.peru.pink.plum.powderblue.purple.rebeccapurple.red.rosybrown.royalblue.saddlebrown.salmon.sandybrown.seagreen.seashell.sienna.silver.skyblue.slateblue.slategray.slategrey.snow.springgreen.steelblue.tan.teal.thistle.tomato.turquoise.violet.wheat.white.whitesmoke.yellow.yellowgreen.transparent.currentcolor".split("."));
function Xt(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) if (e[n] === "(" && t++, e[n] === ")" && (t--, t < 0 || t === 0 && n !== e.length - 1)) return !1;
	return t === 0;
}
function Zt(e) {
	let t = e.trim();
	if (t.length === 0 || t.length > 100 || !Jt.test(t)) return !1;
	if (Kt.test(t) || Yt.has(t.toLowerCase())) return !0;
	let n = qt.exec(t);
	if (n === null || !Xt(t)) return !1;
	if (n[1]?.toLowerCase() !== "var") return !0;
	let [r, ...i] = (n[2] ?? "").split(",");
	return /^\s*--[a-zA-Z0-9-]+\s*$/.test(r ?? "") && (i.length === 0 || Zt(i.join(",")));
}
var Qt = (e) => e == null;
function $t(e) {
	switch (e.kind) {
		case "number": return S.number(String(e.min), String(e.max));
		case "color": return S.color;
		case "boolean": return S.boolean;
		case "choice": return S.choice(e.choices);
		case "list": return S.list;
	}
}
var en = (e) => e === null || [
	"string",
	"number",
	"boolean"
].includes(typeof e);
function tn(e) {
	return e.map((e) => typeof e == "boolean" ? e ? "on" : "off" : e === null ? "" : String(e)).filter((e) => e.trim() !== "");
}
function nn(e, t) {
	switch (e.kind) {
		case "number": return typeof t == "number" && Number.isFinite(t) && t >= e.min && t <= e.max;
		case "color": return typeof t == "string" && Zt(t);
		case "boolean": return typeof t == "boolean";
		case "choice": return typeof t == "string" && e.choices.includes(t);
		case "list": return Array.isArray(t) && t.every(en);
	}
}
function rn(e, t) {
	let n = t.split(".").slice(0, -1);
	for (let t = 1; t <= n.length; t++) {
		let r = n.slice(0, t).join("."), i = A(e, r);
		if (!Qt(i) && (typeof i != "object" || Array.isArray(i))) return r;
	}
}
function an(e, t) {
	let n = t.flatMap((t) => {
		let n = rn(e, t.path);
		if (n !== void 0) return [S.invalid(n, S.object)];
		let r = A(e, t.path);
		return Qt(r) || nn(t, r) ? [] : [S.invalid(t.path, $t(t))];
	});
	return [...new Set(n)];
}
function on(e, t) {
	let n = A(e, t.path);
	if (t.kind === "list" && Array.isArray(n) && nn(t, n)) {
		let e = tn(n);
		return e.length > 0 ? e : t.default;
	}
	return Qt(n) || !nn(t, n) ? t.default : n;
}
// src/diagram/colors.ts
var sn = [
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
], cn = "var(--disabled-text-color)", ln = "#8a8a8a", un = `var(--ecogeo-coil-muted, ${cn})`, dn = (e) => e ? cn : ln, fn = (e) => typeof e == "object" && !!e && !Array.isArray(e), pn = (e) => typeof e == "string" && an({ color: e }, [{
	kind: "color",
	path: "color",
	default: ""
}]).length === 0, mn = (e) => e.map((e) => ({
	temperature: e.temperature,
	color: e.color.trim()
}));
function hn(e) {
	let t = A(e, "colors");
	if (t == null) return [];
	if (!Array.isArray(t) || t.length < 2 || t.length > 8) return [w.colors];
	let n = t;
	if (!n.every((e) => fn(e) && typeof e.temperature == "number" && Number.isFinite(e.temperature) && pn(e.color))) return [w.colors];
	let r = mn(n).map((e) => e.temperature);
	return r.every((e, t) => t === 0 || e > (r[t - 1] ?? 0)) ? [] : [w.colors];
}
function gn(e) {
	let t = A(e, "colors");
	return Array.isArray(t) && hn(e).length === 0 ? mn(t) : sn;
}
function _n(e, t = sn) {
	let n = t[0], r = t[t.length - 1];
	if (e === void 0 || !Number.isFinite(e) || n === void 0 || r === void 0) return cn;
	if (e <= n.temperature) return n.color;
	if (e >= r.temperature) return r.color;
	let i = t.findIndex((t) => t.temperature >= e), a = t[i - 1], o = t[i];
	if (a === void 0 || o === void 0) return r.color;
	let s = Math.round((e - a.temperature) / (o.temperature - a.temperature) * 1e3) / 10;
	return s <= 0 ? a.color : s >= 100 ? o.color : `color-mix(in srgb, ${o.color} ${String(s)}%, ${a.color})`;
}
// src/config/variants.ts
var vn = [
	"active_cooling",
	"passive_cooling",
	"htr",
	"backup_heater"
], yn = [
	1,
	2,
	3,
	4
];
function bn(e) {
	return {
		active_cooling: e === 3 || e === 4,
		passive_cooling: e === 2 || e === 4,
		htr: !0,
		backup_heater: !0
	};
}
function xn(e, t) {
	return {
		...bn(e),
		...t
	};
}
// src/config/options.ts
var Sn = ["B", "C"], Cn = [
	"air",
	"ground",
	"hybrid"
], wn = [
	"external",
	"internal",
	"unused",
	"none"
], Tn = ["simplified", "full"], En = {
	kind: "choice",
	path: "model",
	default: "B",
	choices: Sn
}, Dn = {
	kind: "choice",
	path: "source",
	default: "ground",
	choices: Cn
}, On = {
	kind: "choice",
	path: "dhw",
	default: "external",
	choices: wn
}, kn = {
	kind: "choice",
	path: "detail",
	default: "simplified",
	choices: Tn
}, An = {
	kind: "choice",
	path: "exchanger_fill",
	default: "gradient",
	choices: ["gradient", "none"]
}, jn = {
	kind: "choice",
	path: "layout",
	default: "auto",
	choices: [
		"auto",
		"full",
		"compact"
	]
}, Mn = [
	En,
	Dn,
	On,
	kn,
	An,
	jn
], Nn = [
	"type",
	"model",
	"variant",
	"source",
	"dhw",
	"prefix",
	"features",
	"entities",
	"states",
	"colors",
	"detail",
	"exchanger_fill",
	"layout",
	"view_layout",
	"layout_options",
	"grid_options",
	"visibility"
], Pn = (e) => e === "C" ? "internal" : "external", j = (e) => e == null, Fn = (e) => j(e) || typeof e == "string" && e.trim() === "", M = (e) => typeof e == "object" && !!e && !Array.isArray(e), In = /^[a-z0-9_]+$/, Ln = (e) => typeof e == "string" && e.trim() === "none";
function Rn(e) {
	let t = A(e, "prefix");
	return Fn(t) ? void 0 : t.trim();
}
function zn(e) {
	let t = A(e, "variant");
	return yn.find((e) => e === t) ?? 4;
}
function Bn(e) {
	let t = on(e, En), n = !j(A(e, "dhw"));
	return {
		model: t,
		source: on(e, Dn),
		dhw: n ? on(e, On) : Pn(t)
	};
}
var Vn = (e) => on(e, kn), Hn = (e) => on(e, An), Un = (e) => on(e, jn), Wn = ["off", "defrost"], Gn = (e) => Array.isArray(e) && e.length > 0 && e.every((e) => typeof e == "string" && e.trim() !== "");
function Kn(e) {
	let t = A(e, "states"), n = M(t) ? t : {}, r = (e) => {
		let t = n[e];
		return Gn(t) ? t : ot[e];
	};
	return {
		off: r("off"),
		defrost: r("defrost")
	};
}
function qn(e) {
	let t = A(e, "features");
	if (!M(t)) return {};
	let n = {};
	for (let e of vn) {
		let r = t[e];
		(r === !0 || r === !1 || r === "unused") && (n[e] = r);
	}
	return n;
}
var Jn = (e) => e === !0 || e === !1 || e === "unused";
function Yn(e) {
	let t = A(e, "entities");
	return M(t) ? new Set(Xn(t).filter(([e, t]) => Dt.has(e) && Ln(t)).map(([e]) => e)) : /* @__PURE__ */ new Set();
}
function Xn(e, t = "") {
	return Object.entries(e).flatMap(([e, n]) => {
		let r = t === "" ? e : `${t}.${e}`;
		return M(n) ? Xn(n, r) : [[r, n]];
	});
}
function Zn(e) {
	let t = A(e, "variant");
	return j(t) || yn.some((e) => e === t) ? [] : [S.invalid("variant", w.integer(String(yn[0]), String(yn[yn.length - 1])))];
}
function Qn(e) {
	let t = A(e, "prefix");
	return Fn(t) || typeof t == "string" && In.test(t.trim()) ? [] : [S.invalid("prefix", w.prefix)];
}
function $n(e) {
	let t = A(e, "features");
	return j(t) ? [] : M(t) ? Object.entries(t).flatMap(([e, t]) => vn.some((t) => t === e) ? j(t) || Jn(t) ? [] : [w.featureState(e)] : [w.unknownFeature(e, vn)]) : [S.invalid("features", S.object)];
}
function er(e) {
	let t = A(e, "states");
	return j(t) ? [] : M(t) ? Object.entries(t).flatMap(([e, t]) => Wn.some((t) => t === e) ? j(t) || Gn(t) ? [] : [w.statesList(e)] : [w.statesKey(e)]) : [S.invalid("states", S.object)];
}
function tr(e) {
	let t = A(e, "entities");
	return j(t) ? [] : M(t) ? Xn(t).flatMap(([e, t]) => Fn(t) ? [] : Dt.has(e) ? Wt(t) !== void 0 || Ln(t) ? [] : [w.notEntityId(e)] : [w.unknownRole(e)]) : [S.invalid("entities", S.object)];
}
function nr(e) {
	let t = A(e, "entities");
	return M(t) && Xn(t).some(([, e]) => !Fn(e));
}
function rr(e) {
	let t = Object.keys(e).filter((e) => !Nn.includes(e)).map((e) => w.unknownOption(e)), n = an(e, Mn), r = [
		...t,
		...n,
		...Zn(e),
		...Qn(e),
		...$n(e),
		...tr(e),
		...er(e),
		...hn(e)
	];
	if (an(e, [En, On]).length === 0 && !j(A(e, "dhw"))) {
		let { model: t, dhw: n } = Bn(e);
		(t === "B" && n === "internal" || t === "C" && (n === "external" || n === "none")) && r.push(w.dhwMismatch(n, t));
	}
	return r;
}
// src/config/sample.ts
var ir = (e) => `ecogeo_sample.${e.replace(".", "_")}`, ar = {
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
}, or = "2026-01-01T12:00:00Z", sr = Object.fromEntries(Ot.map((e) => [e, ir(e)])), cr = Object.fromEntries(Ot.map((e) => {
	let t = Dt.get(e)?.unit, n = ir(e);
	return [n, {
		entity_id: n,
		state: ar[e],
		last_updated: or,
		attributes: t === void 0 ? {} : { unit_of_measurement: t }
	}];
}));
// src/config/resolve.ts
function lr(e, t, n = Yn(e)) {
	return Object.fromEntries(k.map((r) => [r.path, Gt(e, `entities.${r.path}`) ?? (t === void 0 || n.has(r.path) ? void 0 : kt(r, t))]));
}
var ur = (e) => Rn(e) === void 0 && !nr(e);
function dr(e) {
	let t = Rn(e), n = zn(e), r = ur(e), i = Yn(e);
	return {
		...Bn(e),
		detail: Vn(e),
		exchangerFill: Hn(e),
		layout: Un(e),
		variant: n,
		prefix: t,
		states: Kn(e),
		colors: gn(e),
		features: xn(n, qn(e)),
		entities: r ? sr : lr(e, t, i),
		notPresent: i,
		sample: r
	};
}
// src/diagram/component-info.ts
var fr = {
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
}, pr = [
	"compressor.speed",
	"compressor.percentage",
	"compressor.power"
];
function mr(e, t) {
	return e === 11 ? pr.find((e) => t?.entities[e] !== void 0) ?? pr[0] : fr[e];
}
var hr = "source.fan_speed", gr = "dhw.temperature", _r = (e, t) => e === void 0 || t?.onTap === void 0 ? void 0 : t.entities[e];
function vr(e, t) {
	return e === void 0 || t === void 0 ? {
		role: x,
		tabindex: x,
		click: x,
		keydown: x
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
var yr = o`
  outline: 2px solid var(--primary-color, currentColor);
  outline-offset: 2px;
  filter: drop-shadow(0 0 2px var(--primary-color, currentColor));
`, br = {
	production_out: {
		x: 376,
		y: 372,
		align: "end"
	},
	production_in: {
		x: 320,
		y: 500,
		align: "middle"
	},
	brine_out: {
		x: 604,
		y: 196,
		align: "start"
	},
	brine_in: {
		x: 644,
		y: 260,
		align: "start"
	},
	compressor_speed: {
		x: 444,
		y: 308,
		align: "start"
	},
	tank_internal_temperature: {
		x: 628,
		y: 488,
		align: "start"
	},
	tank_external_temperature: {
		x: 780,
		y: 24,
		align: "start"
	},
	air_unit_out: {
		x: 204,
		y: 28,
		align: "end"
	},
	ground_out: {
		x: 100,
		y: 264,
		align: "middle"
	},
	hybrid_ground_out: {
		x: 100,
		y: 488,
		align: "middle"
	}
}, xr = {
	air_unit_out: {
		at: (e) => ({
			x: e.airUnitWallX + 3,
			y: e.airPortY.top + Sr(e),
			align: "start"
		}),
		reason: "starts 3 units off the housing so that the outlet caption and its widest value end before the feed pipe at the narrowest full layout"
	},
	dg1_demand: {
		at: (e, t) => ({
			x: t(320, 118)[0],
			y: 118,
			align: "start"
		}),
		reason: "the demand text 5 units higher, clear of the cabinet top edge that its plate touches at the full place (y 123)"
	},
	fan_speed: {
		at: (e) => ({
			x: e.airUnit.x + 9,
			y: e.airUnit.y + e.airUnit.height + 12,
			align: "start"
		}),
		reason: "left-aligned 9 units inside the housing: the outside air value (about 105 units wide at 600 px) centred on the fan reaches the hybrid return pipe at x 6"
	},
	outside_temperature: {
		at: (e) => ({
			x: e.airUnit.x + 9,
			y: e.airUnit.y + e.airUnit.height + 25,
			align: "start"
		}),
		reason: "under the fan value, on the same left edge"
	},
	ground_in: {
		at: (e) => ({
			x: e.groundLoop.downX + 3,
			y: e.groundLineY.ground + 20,
			align: "start"
		}),
		reason: "starts 3 units off the down leg (not 6): the legs sit 4 units further right than before, and the widest value must still end left of the cabinet"
	},
	ground_out: {
		at: (e) => ({
			x: e.groundLoop.upX - 3,
			y: e.groundLineY.ground + 20,
			align: "end"
		}),
		reason: "ends 3 units off the up leg (not 6) so that the widest value (-12.3, defrost) stays 2 px inside the drawing edge at 600 px"
	},
	hybrid_ground_out: {
		at: (e) => ({
			x: e.groundLoop.upX - 3,
			y: e.groundLineY.hybrid + 20,
			align: "end"
		}),
		reason: "the same as the ground loop: 3 units off the up leg, so that the widest value stays inside the drawing edge"
	},
	compressor_speed: {
		at: (e, t) => ({
			x: t(503, 308)[0],
			y: 308,
			align: "middle"
		}),
		reason: "the stack of three rows is 14 units apart (12 in the full arrangement), since the 8 px text of a 600 px card is taller than 12 units"
	},
	compressor_percentage: {
		at: (e, t) => ({
			x: t(503, 322)[0],
			y: 322,
			align: "middle"
		}),
		reason: "the middle row of the compressor stack, 14 units under the speed"
	},
	compressor_power: {
		at: (e, t) => ({
			x: t(503, 336)[0],
			y: 336,
			align: "middle"
		}),
		reason: "the bottom row of the compressor stack, 14 units under the percentage, still clear of the pipes below"
	}
}, Sr = (e) => Math.round(12 * (e.scale ?? 1) * 100) / 100, Cr = {
	production_out: T.portOut,
	production_in: T.portIn,
	brine_out: T.portOut,
	brine_in: T.portIn,
	tank_internal_temperature: T.dhw,
	tank_external_temperature: T.dhw
}, wr = /* @__PURE__ */ new Set(["tank_internal_temperature"]), Tr = /* @__PURE__ */ new Set([
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
]), Er = (e) => (t, n, r, i, a, o = {}) => {
	let s = e[t], c = Cr[t];
	return {
		id: t,
		role: n,
		tier: Tr.has(t) ? "key" : "detail",
		x: r,
		y: i,
		align: a,
		...s === void 0 ? {} : { compact: s },
		...c === void 0 ? {} : { compactCaption: c },
		...o
	};
};
function Dr(e, t, n = (e, t) => [e, t]) {
	let { externalTank: r, internalTank: i, airUnit: a, airUnitWallX: o } = e, s = r.x + r.width / 2, c = r.y + r.height + 22, l = i.y + 12, u = i.x + i.width / 2, d = a.y + a.height + 12, f = o + 6, p = Sr(e), m = Er(t), h = (e, t, r, i, a, o) => {
		let [s, c] = n(r, i);
		return m(e, t, s, c, a, o);
	};
	return { specs: [
		h("production_out", "production.outlet_temperature", 237, 228, "end", { item: 33 }),
		h("production_in", "production.return_temperature", 291, 247, "middle", { item: 34 }),
		h("production_pressure", "production.pressure", 360, 537, "end", { item: 38 }),
		h("production_pump", "production.pump", 396, 380, "end", { item: 15 }),
		h("dg1_setpoint", "heating.setpoint", 291, 96, "middle", { item: 1 }),
		h("dg1_demand", "heating.demand", 320, 123, "start", {
			item: 1,
			demand: !0
		}),
		h("brine_out", "brine.outlet_temperature", 633, 247, "start", { item: 31 }),
		h("brine_in", "brine.inlet_temperature", 697, 247, "start", { item: 32 }),
		h("brine_pressure", "brine.pressure", 689, 459, "start", { item: 37 }),
		h("brine_pump", "brine.pump", 676, 300, "end", { item: 16 }),
		h("discharge_temperature", "compressor.discharge_temperature", 436, 262, "start", { item: 30 }),
		h("discharge_pressure", "compressor.discharge_pressure", 480, 275, "middle", { item: 36 }),
		h("suction_temperature", "compressor.suction_temperature", 528, 262, "start", { item: 29 }),
		h("suction_pressure", "compressor.suction_pressure", 570, 275, "middle", { item: 35 }),
		h("compressor_speed", "compressor.speed", 503, 307, "middle", { item: 11 }),
		h("compressor_percentage", "compressor.percentage", 503, 319, "middle", { item: 11 }),
		h("compressor_power", "compressor.power", 503, 331, "middle", { item: 11 }),
		h("superheat", "refrigerant.superheat", 527, 376, "middle", {
			item: 12,
			detail: "full"
		}),
		h("expansion_valve", "refrigerant.expansion_valve", 527, 388, "middle", {
			item: 12,
			detail: "full"
		}),
		h("condensation_temperature", "refrigerant.condensation_temperature", 432, 437, "middle", { item: 8 }),
		h("evaporation_temperature", "refrigerant.evaporation_temperature", 572, 437, "middle", { item: 7 }),
		m("fan_speed", "source.fan_speed", e.airUnit.fanX, d, "middle", {
			source: ["air", "hybrid"],
			caption: T.fan
		}),
		m("outside_temperature", "source.outside_temperature", e.airUnit.fanX, d + 13, "middle", {
			source: ["air", "hybrid"],
			caption: T.outside
		}),
		m("air_unit_in", "brine.outlet_temperature", f, e.airPortY.bottom - p, "start", {
			source: ["air"],
			caption: T.portIn
		}),
		m("air_unit_out", "source.air_unit_outlet_temperature", f, e.airPortY.top + p, "start", {
			source: ["air"],
			caption: T.portOut
		}),
		m("hybrid_air_unit_in", "brine.outlet_temperature", f, e.airPortY.top + p, "start", {
			source: ["hybrid"],
			caption: T.portIn
		}),
		m("ground_in", "brine.outlet_temperature", e.groundLoop.downX + 6, e.groundLineY.ground + 20, "start", {
			source: ["ground"],
			caption: T.portIn
		}),
		m("ground_out", "brine.inlet_temperature", e.groundLoop.upX - 6, e.groundLineY.ground + 20, "end", {
			source: ["ground"],
			caption: T.portOut
		}),
		m("hybrid_ground_out", "brine.inlet_temperature", e.groundLoop.upX - 6, e.groundLineY.hybrid + 20, "end", {
			source: ["hybrid"],
			caption: T.portOut
		}),
		m("tank_external_temperature", "dhw.temperature", s, c, "middle", {
			dhw: "external",
			emphasis: !0
		}),
		m("tank_external_setpoint", "dhw.setpoint", s, c + 15, "middle", {
			dhw: "external",
			caption: T.setpoint
		}),
		m("tank_external_start_delta", "dhw.start_delta", s, c + 29, "middle", {
			dhw: "external",
			caption: T.startDelta
		}),
		m("tank_external_demand", "dhw.demand", s, c + 43, "middle", {
			dhw: "external",
			demand: !0
		}),
		m("tank_internal_temperature", "dhw.temperature", e.internalTank.x + e.internalTank.width / 6, l, "middle", {
			dhw: "internal",
			bare: !0
		}),
		m("tank_internal_setpoint", "dhw.setpoint", u, l, "middle", {
			dhw: "internal",
			caption: T.setpointShort,
			bare: !0
		}),
		m("tank_internal_start_delta", "dhw.start_delta", e.internalTank.x + e.internalTank.width * 5 / 6, l, "middle", {
			dhw: "internal",
			caption: T.startDeltaShort,
			bare: !0
		}),
		m("tank_internal_demand", "dhw.demand", u, l + 13, "middle", {
			dhw: "internal",
			demand: !0,
			bare: !0
		})
	] };
}
// src/diagram/geometry.ts
var N = (e) => Math.round(e * 100) / 100;
function Or(e) {
	let { airUnit: t, groundLoop: n, externalTank: r, run: i, cabinet: a } = e, o = e.scale ?? 1, s = {
		ground: a.y,
		hybrid: t.y + t.height + Math.round(70 * o)
	};
	return {
		...e,
		airUnitWallX: t.x + t.width,
		airPortY: {
			top: t.passes.y0,
			bottom: t.passes.y0 + (t.passes.count - 1) * t.passes.step
		},
		coilPortX: t.coil.x + t.coil.width,
		airCoilBend: t.passes.step / 2,
		loopBend: (n.downX - n.upX) / 2,
		groundLineY: s,
		groundCaption: {
			x: (n.downX + n.upX) / 2,
			y: {
				ground: s.ground + n.depth + 28,
				hybrid: s.hybrid + n.depth + 28
			}
		},
		externalCoil: {
			cx: r.x + r.width / 2,
			top: r.y + Math.round(62 * o),
			bottom: r.y + Math.round(146 * o),
			rx: Math.round(50 * o),
			port6X: r.x + Math.round(14 * o)
		},
		joinX: {
			out: i.feedX + 8,
			in: i.returnX + 8
		}
	};
}
var kr = [[-75, -13], [-75, 13]];
function Ar({ externalTank: e }) {
	let { x: t, y: n, width: r, height: i, dome: a } = e, o = r / 2;
	return `M${String(t)} ${String(n + a)} A${String(o)} ${String(a)} 0 0 1 ${String(t + r)} ${String(n + a)} V${String(n + i - a)} A${String(o)} ${String(a)} 0 0 1 ${String(t)} ${String(n + i - a)} Z`;
}
var P = {
	x: 240,
	y: 130,
	width: 520,
	height: 475
}, F = Or({
	viewBox: {
		width: 1e3,
		height: 620
	},
	cabinet: P,
	internalTank: {
		x: 408,
		y: 138,
		width: 182,
		height: 66
	},
	coil51: {
		x: 495,
		y: 185
	},
	externalTank: {
		x: 806,
		y: P.y,
		width: 168,
		height: 180,
		dome: 14
	},
	airUnit: {
		x: 26,
		y: P.y,
		width: 124,
		height: 210,
		fanX: 88,
		fanY: P.y + 162,
		fanRadius: 34,
		coil: {
			x: 36,
			y: P.y + 16,
			width: 104,
			height: 74
		},
		fins: {
			x: 52,
			step: 6,
			count: 13,
			y0: P.y + 20,
			y1: P.y + 86
		},
		slats: {
			y0: P.y + 134,
			step: 9,
			count: 8
		},
		dividerY: P.y + 114,
		captionX: 88,
		captionY: P.y - 8,
		passes: {
			y0: P.y + 30,
			step: 15,
			count: 4,
			left: 44,
			right: 132
		}
	},
	groundLoop: {
		downX: 166,
		upX: 106,
		depth: 140
	},
	groundLineX: {
		start: 8,
		end: 220
	},
	run: {
		outY: 85,
		inY: 50,
		feedX: 226,
		returnX: 206,
		hybridReturnX: 12
	}
}), I = (e, t, n, r, i, a, o = {}) => ({
	item: e,
	kind: t,
	x: n,
	y: r,
	rotation: i,
	tag: a,
	...o
}), jr = (e) => [
	I(1, "port", 270, 130, 0, [
		-7,
		-8,
		"end"
	]),
	I(2, "port", 312, 130, 0, [
		-7,
		-8,
		"end"
	]),
	I(3, "port", 630, 130, 0, [
		-7,
		-8,
		"end"
	]),
	I(4, "port", 690, 130, 0, [
		-7,
		-8,
		"end"
	]),
	I(5, "port", 722, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "external" }),
	I(6, "port", 748, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "external" }),
	I(47, "port", 440, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "internal" }),
	I(48, "port", 490, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "internal" }),
	I(49, "port", 540, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "internal" }),
	I(7, "exchanger", 572, 382, 0, [
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
	I(8, "exchanger", 432, 382, 0, [
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
	I(9, "exchanger", 373, 273, 0, [
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
	I(11, "compressor", 510, 250, 0, [
		0,
		-26,
		"middle"
	]),
	I(12, "expansion_valve", 527, 416, 0, [
		0,
		-14,
		"middle"
	]),
	I(13, "filter_dryer", 487, 416, 0, [
		0,
		-14,
		"middle"
	]),
	I(14, "inversion_valve", 430, 296, 0, [
		-16,
		22,
		"end"
	], { feature: "active_cooling" }),
	I(29, "probe_t", 542, 234, 0, [
		0,
		-14,
		"middle"
	]),
	I(30, "probe_t", 430, 234, 0, [
		0,
		-14,
		"middle"
	]),
	I(35, "transducer_p", 564, 234, 0, [
		0,
		-14,
		"middle"
	]),
	I(36, "transducer_p", 474, 234, 0, [
		0,
		-14,
		"middle"
	]),
	I(39, "pressure_switch", 586, 234, 0, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	I(40, "pressure_switch", 452, 234, 0, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	I(41, "service_outlet", 464, 406, 0, [
		0,
		28,
		"middle"
	], { detail: "full" }),
	I(41, "service_outlet", 620, 270, 90, [
		0,
		14,
		"middle"
	], { detail: "full" }),
	I(10, "exchanger", 520, 470, 0, [
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
	I(15, "pump", 385, 416, 0, [
		0,
		-19,
		"middle"
	]),
	I(16, "pump", 690, 300, 90, [
		19,
		4,
		"start"
	]),
	I(17, "pump", 340, 226, 90, [
		-14,
		4,
		"end"
	], {
		feature: "htr",
		dhw: "any"
	}),
	I(18, "vessel", 725, 520, 0, [
		-16,
		4,
		"end"
	], { detail: "full" }),
	I(19, "vessel", 368, 556, 0, [
		-16,
		4,
		"end"
	], { detail: "full" }),
	I(20, "safety_valve", 741, 440, 90, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	I(21, "safety_valve", 384, 520, 90, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	I(22, "valve", 340, 256, 0, [
		-10,
		4,
		"end"
	], {
		feature: "htr",
		dhw: "any"
	}),
	I(23, "drain_valve", 630, 572, 0, [
		14,
		4,
		"start"
	], { detail: "full" }),
	I(24, "drain_valve", 404, 572, 0, [
		14,
		4,
		"start"
	], { detail: "full" }),
	I(25, "drain_valve", 340, 318, 0, [
		-10,
		4,
		"end"
	], {
		feature: "htr",
		dhw: "any"
	}),
	I(26, "valve3", 270, 172, 270, [
		-14,
		22,
		"end"
	], {
		dhw: "any",
		unusedMuted: !0
	}),
	I(27, "valve3", 350, 416, 0, [
		0,
		-24,
		"middle"
	], { feature: "passive_cooling" }),
	I(28, "valve3", 610, 416, 0, [
		0,
		-24,
		"middle"
	], { feature: "passive_cooling" }),
	I(31, "probe_t", 614, 228, 270, [
		0,
		-14,
		"middle"
	]),
	I(32, "probe_t", 674, 228, 270, [
		0,
		-14,
		"middle"
	]),
	I(33, "probe_t", 254, 228, 270, [
		0,
		-14,
		"middle"
	]),
	I(34, "probe_t", 296, 228, 270, [
		0,
		-14,
		"middle"
	]),
	I(37, "transducer_p", 709, 440, 270, [
		0,
		-14,
		"middle"
	]),
	I(38, "transducer_p", 352, 520, 270, [
		0,
		-14,
		"middle"
	]),
	I(44, "resistor", 270, 320, 90, [
		12,
		6,
		"start"
	], { feature: "backup_heater" }),
	I(45, "thermostat", 286, 282, 90, [
		0,
		-12,
		"middle"
	], { feature: "backup_heater" }),
	I(50, "tank", e.internalTank.x + e.internalTank.width / 2, e.internalTank.y + e.internalTank.height / 2, 0, [
		-96,
		-26,
		"end"
	], { dhw: "internal" }),
	I(51, "coil", e.coil51.x, e.coil51.y, 0, [
		-74,
		3,
		"middle"
	], { dhw: "internal" }),
	I(52, "service_outlet", 395, 162, 0, [
		-8,
		4,
		"end"
	], {
		dhw: "internal",
		detail: "full"
	}),
	I(53, "drain_valve", 599, 196, 270, [
		0,
		-12,
		"middle"
	], {
		dhw: "internal",
		detail: "full"
	}),
	I(54, "probe_t", 574, 171, 270, [
		26,
		-11,
		"start"
	], { dhw: "internal" })
], Mr = (e) => e.split(" ").map((e) => {
	let [t, n] = e.split(",").map(Number);
	return [t ?? 0, n ?? 0];
});
function Nr(e, t) {
	let { y0: n, step: r, count: i, left: a, right: o } = e.airUnit.passes, s = [[e.coilPortX, n]];
	for (let t = 0; t < i; t += 1) {
		let c = n + t * r;
		t % 2 == 0 ? (t > 0 && s.push([o, c]), s.push([a, c])) : s.push([a, c], t === i - 1 ? [e.coilPortX, c] : [o, c]);
	}
	return (t ? s.reverse() : s).map(([e, t]) => `${String(e)},${String(t)}`).join(" ");
}
function Pr(e, t, n) {
	let { downX: r, upX: i, depth: a } = e.groundLoop, [o, s] = [(r + i) / 2, t + a];
	return n === "down" ? `${String(r)},${String(t)} ${String(r)},${String(s)} ${String(o)},${String(s)}` : `${String(o)},${String(s)} ${String(i)},${String(s)} ${String(i)},${String(t)}`;
}
var L = (...e) => e.map(([e, t]) => `${String(e)},${String(t)}`).join(" "), R = (e, t, n, r, i = {}) => ({
	id: e,
	circuit: t,
	points: Mr(n),
	temperatureRole: r,
	direction: 1,
	...i
}), Fr = ["production_dg1"], z = ["production_dg1", "production_dhw"], B = "production.outlet_temperature", V = "production.return_temperature", H = "production.pump", U = "brine.inlet_temperature", W = "brine.outlet_temperature", G = "brine.pump", Ir = "compressor.discharge_temperature", Lr = "compressor.suction_temperature", Rr = "refrigerant.condensation_temperature", zr = "refrigerant.evaporation_temperature", K = "compressor.percentage", q = "dhw.temperature", Br = "source.air_unit_outlet_temperature", Vr = [
	"dhw_sup_b",
	"dhw_sup_c",
	"dhw_ret_b",
	"dhw_ret_c",
	"dhw_ext_in",
	"dhw_ext_coil",
	"dhw_ext_out"
], Hr = (e) => [
	R("p1_stub", Fr, "270,130 270,118", B, { stub: !0 }),
	R("p2_stub", Fr, "312,118 312,130", V, { stub: !0 }),
	R("p1_up", Fr, "270,160 270,130", B, {
		dhw: "any",
		speedRole: H
	}),
	R("p1_direct", Fr, "270,184 270,130", B, {
		dhw: "none",
		speedRole: H
	}),
	R("p2_in", Fr, "312,130 312,198", V, { speedRole: H }),
	R("prod_44_26", z, "270,292 270,184", B, { speedRole: H }),
	R("prod_bypass44", z, "270,348 270,292", B, {
		bypass: "backup_heater",
		speedRole: H
	}),
	R("prod_8_44", z, "420,348 270,348", B, { speedRole: H }),
	R("prod_15_8", z, "397,416 420,416", V, { speedRole: H }),
	R("trunk", z, "312,198 312,416", V, { speedRole: H }),
	R("prod_27_in", z, "312,416 338,416", V, {
		through: "passive_cooling",
		speedRole: H,
		onlyWhen: { valves2728: "closed" }
	}),
	R("prod_27_15", z, "362,416 373,416", V, {
		through: "passive_cooling",
		speedRole: H
	}),
	R("prod_bypass27", z, "312,416 373,416", V, {
		bypass: "passive_cooling",
		speedRole: H
	}),
	R("prod_10_in", ["exchanger_10"], "312,416 312,492 508,492", V, {
		feature: "passive_cooling",
		speedRole: H
	}),
	R("prod_10_out", ["exchanger_10"], "508,448 350,448 350,428", B, {
		feature: "passive_cooling",
		speedRole: H
	}),
	R("prod_tap_a", z, "368,416 368,520", V, { stub: !0 }),
	R("prod_tap_b", z, "368,520 368,544", V, {
		stub: !0,
		detail: "full"
	}),
	R("prod_drain", z, "404,416 404,563", V, {
		stub: !0,
		detail: "full"
	}),
	R("dhw_sup_a", ["production_dhw"], "282,172 361,172", B, {
		dhw: "any",
		speedRole: H
	}),
	R("dhw_sup_b", ["dhw_coil"], "361,172 420,172", B, {
		dhw: "any",
		speedRole: H
	}),
	R("dhw_sup_c", ["dhw_coil"], "420,172 722,172 722,130", B, {
		dhw: "external",
		speedRole: H
	}),
	R("dhw_ret_c", ["dhw_coil"], "748,130 748,198 420,198", V, {
		dhw: "external",
		speedRole: H
	}),
	R("dhw_ret_b", ["dhw_coil"], "420,198 340,198", V, {
		dhw: "any",
		speedRole: H
	}),
	R("dhw_ret_a", ["production_dhw"], "340,198 312,198", V, {
		dhw: "any",
		speedRole: H
	}),
	R("htr_in", ["htr"], "340,198 340,214", q, {
		feature: "htr",
		dhw: "any"
	}),
	R("htr_pump", ["htr"], "340,238 340,247", q, {
		feature: "htr",
		dhw: "any"
	}),
	R("htr_to_9", ["htr"], "340,265 340,296 361,296", q, {
		feature: "htr",
		dhw: "any"
	}),
	R("htr_drain", ["htr"], "340,296 340,309", q, {
		feature: "htr",
		dhw: "any",
		stub: !0
	}),
	R("htr_riser", ["htr"], "361,250 361,172", q, {
		feature: "htr",
		dhw: "any"
	}),
	R("dhw_ext_in", ["dhw_coil"], `722,130 722,${String(e.run.inY)} ${String(e.externalCoil.cx + e.externalCoil.rx)},${String(e.run.inY)} ${String(e.externalCoil.cx + e.externalCoil.rx)},${String(e.externalCoil.top)}`, B, {
		dhw: "external",
		speedRole: H
	}),
	R("dhw_ext_coil", ["dhw_coil"], `${String(e.externalCoil.cx + e.externalCoil.rx)},${String(e.externalCoil.top)} ${String(e.externalCoil.cx - e.externalCoil.rx)},${String(e.externalCoil.bottom)}`, B, {
		dhw: "external",
		speedRole: H,
		shape: {
			kind: "helix",
			cx: e.externalCoil.cx,
			top: e.externalCoil.top,
			bottom: e.externalCoil.bottom,
			rx: e.externalCoil.rx,
			turns: 4.5
		}
	}),
	R("dhw_ext_out", ["dhw_coil"], `${String(e.externalCoil.cx - e.externalCoil.rx)},${String(e.externalCoil.bottom)} ${String(e.externalCoil.port6X)},${String(e.externalCoil.bottom)} ${String(e.externalCoil.port6X)},${String(e.run.outY)} 748,${String(e.run.outY)} 748,130`, V, {
		dhw: "external",
		speedRole: H
	}),
	R("tap_47", ["dhw_coil"], "440,118 440,138", q, {
		dhw: "internal",
		stub: !0
	}),
	R("tap_48", ["dhw_coil"], "490,138 490,118", q, {
		dhw: "internal",
		stub: !0
	}),
	R("tap_49", ["dhw_coil"], "540,118 540,138", q, {
		dhw: "internal",
		stub: !0
	}),
	R("src_out", ["brine"], L([630, 130], [630, e.run.outY], [e.joinX.out, e.run.outY]), W, { speedRole: G }),
	R("src_in", ["brine"], L([e.joinX.in, e.run.inY], [690, e.run.inY], [690, 130]), U, { speedRole: G }),
	R("src_air_feed", ["brine"], L([e.joinX.out, e.run.outY], [e.run.feedX, e.run.outY], [e.run.feedX, e.airPortY.bottom], [e.coilPortX, e.airPortY.bottom]), W, {
		source: ["air"],
		speedRole: G
	}),
	R("src_air_coil", ["brine"], Nr(e, !0), W, {
		source: ["air"],
		speedRole: G,
		bend: e.airCoilBend
	}),
	R("src_air_exit", ["brine"], L([e.coilPortX, e.airPortY.top], [e.run.returnX, e.airPortY.top], [e.run.returnX, e.run.inY], [e.joinX.in, e.run.inY]), Br, {
		source: ["air"],
		speedRole: G
	}),
	R("src_gnd_feed", ["brine"], L([e.joinX.out, e.run.outY], [e.groundLoop.downX, e.run.outY], [e.groundLoop.downX, e.groundLineY.ground]), W, {
		source: ["ground"],
		speedRole: G
	}),
	R("src_gnd_down", ["brine"], Pr(e, e.groundLineY.ground, "down"), W, {
		source: ["ground"],
		speedRole: G,
		roundEnd: !0,
		bend: e.loopBend
	}),
	R("src_gnd_up", ["brine"], Pr(e, e.groundLineY.ground, "up"), U, {
		source: ["ground"],
		speedRole: G,
		bend: e.loopBend
	}),
	R("src_gnd_exit", ["brine"], L([e.groundLoop.upX, e.groundLineY.ground], [e.groundLoop.upX, e.run.inY], [e.joinX.in, e.run.inY]), U, {
		source: ["ground"],
		speedRole: G
	}),
	R("src_hyb_feed", ["brine"], L([e.joinX.out, e.run.outY], [e.run.feedX, e.run.outY], [e.run.feedX, e.airPortY.top], [e.coilPortX, e.airPortY.top]), W, {
		source: ["hybrid"],
		speedRole: G
	}),
	R("src_hyb_coil", ["brine"], Nr(e, !1), W, {
		source: ["hybrid"],
		speedRole: G,
		bend: e.airCoilBend
	}),
	R("src_hyb_link", ["brine"], L([e.coilPortX, e.airPortY.bottom], [e.groundLoop.downX, e.airPortY.bottom], [e.groundLoop.downX, e.groundLineY.hybrid]), Br, {
		source: ["hybrid"],
		speedRole: G
	}),
	R("src_hyb_down", ["brine"], Pr(e, e.groundLineY.hybrid, "down"), Br, {
		source: ["hybrid"],
		speedRole: G,
		roundEnd: !0,
		bend: e.loopBend
	}),
	R("src_hyb_up", ["brine"], Pr(e, e.groundLineY.hybrid, "up"), U, {
		source: ["hybrid"],
		speedRole: G,
		bend: e.loopBend
	}),
	R("src_hyb_exit", ["brine"], L([e.groundLoop.upX, e.groundLineY.hybrid], [e.groundLoop.upX, e.groundLineY.hybrid - 15], [e.run.hybridReturnX, e.groundLineY.hybrid - 15], [e.run.hybridReturnX, e.run.inY], [e.joinX.in, e.run.inY]), U, {
		source: ["hybrid"],
		speedRole: G
	}),
	R("ref_discharge", ["refrigerant"], "496,250 385,250", Ir, {
		through: "htr",
		speedRole: K
	}),
	R("ref_9_14", ["refrigerant"], "385,296 416,296", Ir, {
		through: "htr",
		speedRole: K
	}),
	R("ref_discharge_direct", ["refrigerant"], "496,250 416,250 416,296", Ir, {
		bypass: "htr",
		speedRole: K
	}),
	R("ref_14_8", ["refrigerant"], "444,306 444,348", Ir, {
		through: "active_cooling",
		reversible: !0,
		speedRole: K
	}),
	R("ref_7_14", ["refrigerant"], "560,348 560,296 444,296", Lr, {
		through: "active_cooling",
		reversible: !0,
		speedRole: K
	}),
	R("ref_suction", ["refrigerant"], "444,286 610,286 610,250 524,250", Lr, {
		through: "active_cooling",
		speedRole: K
	}),
	R("ref_direct_8", ["refrigerant"], "416,296 444,296 444,348", Ir, {
		bypass: "active_cooling",
		speedRole: K
	}),
	R("ref_direct_suction", ["refrigerant"], "560,348 560,286 610,286 610,250 524,250", Lr, {
		bypass: "active_cooling",
		speedRole: K
	}),
	R("ref_8_13", ["refrigerant"], "444,416 473,416", Rr, {
		reversible: !0,
		speedRole: K
	}),
	R("ref_13_12", ["refrigerant"], "501,416 515,416", Rr, {
		reversible: !0,
		speedRole: K
	}),
	R("ref_12_7", ["refrigerant"], "539,416 560,416", zr, {
		reversible: !0,
		speedRole: K
	}),
	R("ln4_a", ["brine"], "690,130 690,288", U, { speedRole: G }),
	R("ln4_b", ["brine"], "690,312 690,348", U, { speedRole: G }),
	R("br_feed7", ["brine"], "690,348 584,348", U, {
		speedRole: G,
		onlyWhen: { valves2728: "closed" }
	}),
	R("brine_7_28", ["brine"], "584,416 598,416", W, {
		through: "passive_cooling",
		speedRole: G,
		onlyWhen: { valves2728: "closed" }
	}),
	R("brine_28_ln3", ["brine"], "622,416 630,416", W, {
		through: "passive_cooling",
		speedRole: G
	}),
	R("brine_bypass28", ["brine"], "584,416 630,416", W, {
		bypass: "passive_cooling",
		speedRole: G
	}),
	R("ln3", ["brine"], "630,416 630,130", W, { speedRole: G }),
	R("br_10_in", ["exchanger_10"], "690,348 690,448 532,448", U, {
		feature: "passive_cooling",
		speedRole: G
	}),
	R("br_10_28", ["exchanger_10"], "532,492 610,492 610,428", W, {
		feature: "passive_cooling",
		speedRole: G
	}),
	R("brine_tap_a", ["brine"], "690,270 725,270 725,440", U, { stub: !0 }),
	R("brine_tap_b", ["brine"], "725,440 725,508", U, {
		stub: !0,
		detail: "full"
	}),
	R("brine_drain", ["brine"], "630,416 630,563", W, {
		stub: !0,
		detail: "full"
	})
], Ur = [
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
], Wr = [
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
];
function Gr(e, t) {
	return {
		...t,
		id: e,
		components: jr(t),
		segments: Hr(t),
		crossings: Ur,
		circuitLabels: Wr,
		labels: Dr(t, {})
	};
}
var Kr = Gr("full", F);
function qr(e, t) {
	let n = e[0], r = e[e.length - 1];
	if (n === void 0 || r === void 0) return t;
	if (t <= n[0]) return N(t + n[1] - n[0]);
	if (t >= r[0]) return N(t + r[1] - r[0]);
	let i = e.findIndex(([e]) => e > t), [a, o] = e[i - 1] ?? n, [s, c] = e[i] ?? r;
	return N(o + (t - a) / (s - a) * (c - o));
}
var Jr = [
	[240, 200],
	[254, 218],
	[286, 250],
	[296, 272],
	[312, 288],
	[338, 324],
	[397, 383],
	[416, 410],
	[539, 533],
	[560, 564],
	[590, 594],
	[598, 606],
	[630, 638],
	[674, 712],
	[690, 728],
	[709, 755],
	[725, 771],
	[748, 800],
	[760, 820]
], Yr = [[130, 130], [505, 505]], J = (e) => qr(Jr, e), Xr = (e) => qr(Yr, e), Y = .8, Zr = (e) => N(e * Y), Qr = -12, $r = (e) => N(Zr(e) + Qr), ei = (e) => N(P.y + (e - P.y) * Y), ti = {
	x: 200,
	y: P.y,
	width: 620,
	height: 400
}, ni = Or({
	viewBox: {
		width: 1e3,
		height: ti.y + ti.height + 15
	},
	scale: Y,
	cabinet: ti,
	internalTank: {
		x: J(F.internalTank.x),
		y: F.internalTank.y,
		width: N(J(F.internalTank.x + F.internalTank.width) - J(F.internalTank.x)),
		height: F.internalTank.height
	},
	coil51: {
		x: J(F.coil51.x),
		y: F.coil51.y
	},
	externalTank: {
		x: 853,
		y: P.y,
		width: Math.round(168 * Y),
		height: Math.round(180 * Y),
		dome: Math.round(14 * Y)
	},
	airUnit: {
		x: $r(26),
		y: P.y,
		width: Zr(124),
		height: N(210 * Y),
		fanX: $r(88),
		fanY: ei(P.y + 162),
		fanRadius: N(34 * Y),
		coil: {
			x: $r(36),
			y: ei(P.y + 16),
			width: Zr(104),
			height: N(74 * Y)
		},
		fins: {
			x: $r(52),
			step: N(6 * Y),
			count: 13,
			y0: ei(P.y + 20),
			y1: ei(P.y + 86)
		},
		slats: {
			y0: ei(P.y + 134),
			step: N(9 * Y),
			count: 8
		},
		dividerY: ei(P.y + 114),
		captionX: $r(88),
		captionY: P.y - 8,
		passes: {
			y0: ei(P.y + 30),
			step: N(15 * Y),
			count: 4,
			left: $r(44),
			right: $r(132)
		}
	},
	groundLoop: {
		downX: 130,
		upX: 84,
		depth: N(140 * Y)
	},
	groundLineX: {
		start: Zr(8),
		end: Zr(220)
	},
	run: {
		outY: 85,
		inY: 50,
		feedX: 190,
		returnX: 172,
		hybridReturnX: 6
	}
}), ri = 470;
function ii() {
	let e = ni, t = (e) => e >= P.x && e <= P.x + P.width, n = ([e, n]) => t(e) ? [J(e), Xr(n)] : [e, n], r = J(368), i = jr(e).filter((e) => e.detail !== "full").map((e) => e.item === 50 || e.item === 51 ? e : e.item === 38 ? {
		...e,
		x: r + 16,
		y: ri,
		rotation: 90
	} : {
		...e,
		x: J(e.x),
		y: Xr(e.y)
	}), a = Hr(e).filter((e) => e.detail !== "full").map((e) => e.id === "prod_tap_a" ? {
		...e,
		points: [[r, Xr(416)], [r, ri]]
	} : {
		...e,
		points: e.points.map(n)
	}), o = new Set(a.map((e) => e.id)), s = Ur.filter((e) => o.has(e.over) && o.has(e.under) && (e.over !== "prod_10_in" || e.under !== "prod_tap_a")).map((e) => ({
		...e,
		at: n(e.at)
	})), c = Dr(e, br, (e, t) => [J(e), Xr(t)]);
	return {
		...e,
		id: "simplified",
		components: i,
		segments: a,
		crossings: s,
		circuitLabels: Wr.map((e) => ({
			...e,
			x: J(e.x),
			y: Xr(e.y)
		})),
		labels: { specs: c.specs.map((t) => {
			if (t.id === "production_pressure") return {
				...t,
				x: r + 32,
				y: ri,
				align: "start"
			};
			let n = xr[t.id]?.at(e, (e, t) => [J(e), Xr(t)]);
			return n === void 0 ? t : {
				...t,
				...n
			};
		}) }
	};
}
var ai = ii();
function oi(e, t) {
	return t === "compact" ? ai : e === "full" ? Kr : ai;
}
var si = (e) => e.arrangement ?? oi(e.detail, "full"), ci = (e, t) => t === "htr" && e.dhw === "none" ? !1 : e.features[t], li = (e) => e.dhw === "unused" ? e.model === "C" ? "internal" : "external" : e.dhw, ui = (e, t) => {
	let n = li(t);
	return e === "any" ? n !== "none" : e === n;
};
function di(e, t) {
	if (e.detail === "full" && t.detail !== "full" || e.source !== void 0 && !e.source.includes(t.source) || e.dhw !== void 0 && !ui(e.dhw, t) || e.bypass !== void 0 && ci(t, e.bypass) !== !1 || e.through !== void 0 && ci(t, e.through) === !1) return "hidden";
	if (e.feature !== void 0) {
		let n = ci(t, e.feature);
		if (n === !1) return "hidden";
		if (n === "unused") return "muted";
	}
	return t.dhw === "unused" && e.dhw !== void 0 && (e.dhw !== "any" || e.unusedMuted === !0) ? "muted" : "normal";
}
function fi(e, t) {
	return e.flatMap((e) => {
		let n = di(e, t);
		return n === "hidden" ? [] : [{
			part: e,
			state: n
		}];
	});
}
var pi = (e) => fi(si(e).components, e), mi = (e) => fi(si(e).segments, e), hi = (e, t) => (e.onlyWhen === void 0 || e.onlyWhen.valves2728 === t.valves2728) && e.circuit.some((e) => t.active.has(e)), gi = .35;
function _i(e) {
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
var vi = (e) => [...e.filter((e) => !e.front), ...e.filter((e) => e.front)];
function yi(e) {
	let t = (e) => String(Math.round(e * 100) / 100);
	return _i(e).map(({ front: e, curve: [n, r, i, a] }) => ({
		front: e,
		d: `M${t(n[0])} ${t(n[1])} C${t(r[0])} ${t(r[1])} ${t(i[0])} ${t(i[1])} ${t(a[0])} ${t(a[1])}`
	}));
}
function bi(e, t) {
	let n = Si(e, 0), r = [`M${String(n[0])} ${String(n[1])}`];
	for (let n = 1; n < e.length; n += 1) {
		let [i, a, o] = [
			Si(e, n - 1),
			Si(e, n),
			e[n + 1]
		];
		if (o === void 0) {
			r.push(`L${String(a[0])} ${String(a[1])}`);
			break;
		}
		let s = Math.abs(a[0] - i[0]) + Math.abs(a[1] - i[1]), c = Math.abs(o[0] - a[0]) + Math.abs(o[1] - a[1]), l = Math.min(t, n === 1 ? s : s / 2, n === e.length - 2 ? c : c / 2), [u, d] = [Math.sign(a[0] - i[0]), Math.sign(a[1] - i[1])], [f, p] = [Math.sign(o[0] - a[0]), Math.sign(o[1] - a[1])], m = +(u * p - d * f > 0);
		r.push(`L${String(a[0] - u * l)} ${String(a[1] - d * l)} A${String(l)} ${String(l)} 0 0 ${String(m)} ${String(a[0] + f * l)} ${String(a[1] + p * l)}`);
	}
	return r.join(" ");
}
var xi = (e, t) => e[0] === t[0] && e[1] === t[1];
function Si(e, t) {
	let n = e[t];
	if (n === void 0) throw Error(`No point ${String(t)}`);
	return n;
}
var Ci = (e) => e.slice(1).map((t, n) => [Si(e, n), t]), wi = (e, t, n) => e >= Math.min(t, n) && e <= Math.max(t, n);
function Ti(e, t = [], n = 7) {
	let r = [], i, a = (e) => {
		r.push(i === void 0 ? `M${String(e[0])} ${String(e[1])}` : `L${String(e[0])} ${String(e[1])}`), i = e;
	}, o = (e) => {
		r.push(`M${String(e[0])} ${String(e[1])}`), i = e;
	};
	a(Si(e, 0));
	for (let [r, i] of Ci(e)) {
		let e = Math.sign(i[0] - r[0]), s = Math.sign(i[1] - r[1]), c = Math.abs(i[0] - r[0]) + Math.abs(i[1] - r[1]), l = t.filter((e) => Ei(e, r, i) && !xi(e, r) && !xi(e, i)).sort((e, t) => Math.abs(e[0] - r[0]) + Math.abs(e[1] - r[1]) - (Math.abs(t[0] - r[0]) + Math.abs(t[1] - r[1])));
		for (let t of l) {
			let l = Math.abs(t[0] - r[0]) + Math.abs(t[1] - r[1]);
			l > n && a([t[0] - e * n, t[1] - s * n]), o(c - l > n ? [t[0] + e * n, t[1] + s * n] : i);
		}
		a(i);
	}
	return r.join(" ");
}
var Ei = (e, t, n) => t[0] === n[0] && e[0] === t[0] && wi(e[1], t[1], n[1]) || t[1] === n[1] && e[1] === t[1] && wi(e[0], t[0], n[0]);
function Di(e, t, n) {
	return e.crossings.filter((e) => e.under === t && n.has(e.over) && n.has(e.under)).map((e) => e.at);
}
function Oi(e, t, n) {
	return e === "auto" ? t === void 0 || !(t > 0) ? !1 : t < 600 + (n ? 24 : 0) : e === "compact";
}
var ki = {
	pipe: 3,
	outline: 2
}, Ai = 2, ji = 1.25, Mi = (e) => Math.ceil(e * 10 - 1e-9) / 10;
function Ni(e) {
	if (e === void 0 || !(e > 0)) return ki;
	let t = e / 1e3;
	return {
		pipe: Math.max(ki.pipe, Mi(Ai / t)),
		outline: Math.max(ki.outline, Mi(ji / t))
	};
}
function Pi(e) {
	let { cardWidth: t, viewBox: n } = e;
	if (t === void 0 || !(t > 0)) return 0;
	if (!e.isPanel || !(e.windowHeight > 0)) return t;
	let r = e.headerHeight !== void 0 && e.headerHeight > 0 ? e.headerHeight : 56, i = e.safeAreaTop !== void 0 && e.safeAreaTop > 0 ? e.safeAreaTop : 0, a = Math.floor((e.windowHeight - r - i - 64) * n.width / n.height);
	return Math.min(t, Math.max(a, 320));
}
// src/diagram/pipes.ts
var Fi = 1.2, Ii = .6, Li = [
	"tap_47",
	"tap_48",
	"tap_49"
], Ri = [
	"prod_27_15",
	"prod_15_8",
	"prod_tap_a",
	"prod_tap_b",
	"prod_drain"
];
function zi(e) {
	if (e !== void 0 && e > 0) return Math.min(8, Math.max(Ii, Fi * 100 / e));
}
var Bi = {
	"compressor.discharge_temperature": "compressor.suction_temperature",
	"compressor.suction_temperature": "compressor.discharge_temperature",
	"refrigerant.condensation_temperature": "refrigerant.evaporation_temperature",
	"refrigerant.evaporation_temperature": "refrigerant.condensation_temperature"
}, Vi = (e, t) => Vr.includes(e.id) && Hi(t), Hi = (e) => e.active.has("htr") && !e.active.has("production_dhw");
function Ui(e, t) {
	return Vi(e, t.circuits) ? "dhw.temperature" : e.reversible === !0 && t.mode === "active_cooling" ? Bi[e.temperatureRole] ?? e.temperatureRole : (t.mode === "passive_cooling" || t.mode === "defrost") && t.circuits.valves2728 === "exchanger" && Ri.includes(e.id) ? "production.outlet_temperature" : e.temperatureRole;
}
function Wi(e, t, n) {
	return t === "muted" && n === "defrost" && e.feature === "passive_cooling" ? "normal" : t;
}
var Gi = (e, t) => {
	let n = e[t];
	return n === !0 ? 3 : zi(typeof n == "number" ? n : void 0);
}, Ki = (e, t) => {
	let n = e[t];
	return typeof n == "number" ? n : void 0;
};
function qi(e, t, n) {
	let { mode: r, circuits: i, readings: a, stops: o } = n, s = Li.includes(e.id), c = Wi(e, t, r), l = s || hi(e, i), u = Ki(a, Ui(e, n)), d = c === "muted" || !l || u === void 0, f = e.direction === -1 != (e.reversible === !0 && r === "active_cooling"), p = {
		color: d ? cn : _n(u, o),
		muted: d,
		reversed: f
	};
	if (!l || c === "muted" || e.stub === !0 || s) return {
		...p,
		animated: !1
	};
	let m = Vi(e, i) || e.speedRole === void 0 && e.circuit.includes("htr") ? 3 : e.speedRole === void 0 ? void 0 : Gi(a, e.speedRole);
	return m === void 0 ? {
		...p,
		animated: !1
	} : {
		...p,
		animated: !0,
		duration: m
	};
}
var Ji = (e) => _n(Ki(e.readings, "dhw.temperature"), e.stops);
function Yi(e) {
	let { circuits: t, readings: n, stops: r } = e;
	return Hi(t) ? _n(Ki(n, "dhw.temperature"), r) : t.active.has("dhw_coil") ? _n(Ki(n, "production.outlet_temperature"), r) : cn;
}
// src/diagram/symbols.ts
var Xi = .55;
function Zi(e, t, n) {
	let r = -t - 9, i = t + 9;
	return b`<path class="exchanger-fill" data-half=${e} d=${e === "left" ? `M0 ${String(r)} H-16 A4 4 0 0 0 -20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 0 -16 ${String(i)} H0 Z` : `M0 ${String(r)} H16 A4 4 0 0 1 20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 1 16 ${String(i)} H0 Z`} fill=${n} fill-opacity=${Xi} stroke="none" />`;
}
var Qi = (e, t) => b`<text class="glyph" text-anchor="middle" dominant-baseline="central" font-size="9" fill="currentColor" stroke="none" transform="rotate(${-t})">${e}</text>`, $i = {
	kind: "helix",
	cx: 2,
	top: -60,
	bottom: 60,
	rx: 11,
	turns: 7.5
};
function ea({ internalTank: e, coil51: t }) {
	let n = e.x + 2 - t.x, r = yi($i), { cx: i, rx: a, top: o, bottom: s } = $i, c = kr[0][1], l = kr[1][1], u = a - i;
	return b`<g transform="matrix(0 -1 1 0 0 0)">${vi(r).map((e) => b`<path data-half=${e.front ? "front" : "back"} stroke-linecap=${e.front ? "round" : "butt"} d=${e.d} opacity=${e.front ? x : gi} />`)}</g><path style="stroke-width: var(--pipe-width, 3)" d="M${n} ${c} H${o} M${s} ${u} V${l} H${n}" />`;
}
var ta = "M9 -10.7 L-13 -3 M9 10.7 L-13 3", na = (e, t) => b`<path d="M0 ${t} V${e}" />`, ra = (e, t) => b`<path d="${e}" fill=${t ? "currentColor" : "none"} />`;
function ia(e, t) {
	let n = t.rotation ?? 0, r = () => {
		if (t.arrangement === void 0) throw Error(`the ${e} symbol needs the arrangement it is drawn in`);
		return t.arrangement;
	};
	switch (e) {
		case "pump": return b`<circle r="12" /><path d="M-5 -7 V7 L8 0 Z" fill="currentColor" />`;
		case "valve3": {
			let e = t.open ?? ["l", "r"];
			return b`${ra("M-12 -6 V6 L0 0 Z", e.includes("l"))}${ra("M12 -6 V6 L0 0 Z", e.includes("r"))}${ra("M-6 12 H6 L0 0 Z", e.includes("d"))}<rect x="-4" y="-21" width="8" height="8" /><path d="M0 -13 V-8" />`;
		}
		case "inversion_valve": return b`<rect x="-10" y="-14" width="20" height="28" rx="3" /><path d="M-14 0 H-10 M10 -10 H14 M10 0 H14 M10 10 H14" />${t.reversed === !0 ? b`<path d="M-14 0 H14 M14 10 H5 V-10 H14" />` : b`<path d="M-14 0 H-5 V10 H14 M14 0 H5 V-10 H14" />`}`;
		case "probe_t": return b`<circle r="9" />${na(16, 9)}${Qi("T", n)}`;
		case "transducer_p": return b`<circle r="9" />${na(16, 9)}${Qi("P", n)}`;
		case "pressure_switch": return b`<rect x="-7" y="-7" width="14" height="14" />${na(16, 7)}${Qi("P", n)}`;
		case "thermostat": return b`<rect x="-7" y="-7" width="14" height="14" />${na(16, 7)}${Qi("T", n)}`;
		case "exchanger": {
			let e = t.size ?? 34, n = t.fills;
			return b`${n === void 0 ? x : b`${Zi("left", e, n.left)}${Zi("right", e, n.right)}`}<rect x="-20" y="${-e - 9}" width="40" height="${2 * e + 18}" rx="4" /><path d="M-12 ${-e} V${e} M12 ${-e} V${e}" /><circle cx="-12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="-12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" />`;
		}
		case "compressor": return b`<circle r="14" /><path class="compressor-lines" d="${ta}" />`;
		case "vessel": return b`<circle r="12" /><path d="M-12 2 H12" />`;
		case "safety_valve": return b`<path d="M0 16 V6 M-6 6 H6 L0 -4 Z M0 -4 L-3 -7 L3 -10 L0 -13" />`;
		case "valve": return b`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "drain_valve": return b`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "resistor": return b`<rect x="-28" y="-6" width="56" height="12" rx="2" /><path d="M-18 -6 V6 M18 -6 V6" />`;
		case "filter_dryer": return b`<rect x="-14" y="-5" width="28" height="10" rx="5" />`;
		case "expansion_valve": return b`<path d="M-12 -6 V6 L0 0 L12 -6 V6 L0 0 Z" />`;
		case "service_outlet": return b`<rect x="-3" y="-3" width="6" height="6" />${na(10, 3)}`;
		case "port": return b`<rect x="-5" y="-6" width="10" height="6" />`;
		case "tank": return b`<rect class="tank-body" data-dhw-tank="internal" x=${-r().internalTank.width / 2} y=${-r().internalTank.height / 2} width=${r().internalTank.width} height=${r().internalTank.height} rx="14" fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />`;
		case "coil": return ea(r());
	}
}
function aa(e, t = {}) {
	return b`<g class="symbol ${e}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${t.rotation ?? 0})">${ia(e, t)}</g>`;
}
// src/diagram/cabinet.ts
var oa = o`
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
    ${yr}
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
function sa(e, t) {
	return e === 26 ? t.valve26 === "dhw" ? ["l", "d"] : ["l", "r"] : t.valves2728 === "exchanger" ? ["d", "r"] : ["l", "r"];
}
function ca(e, t, n, r, i, a) {
	let { part: o } = e, { circuits: s } = t, c = Wi(o, e.state, t.mode), [l, u, d] = o.tag, f = it(o.item), p = vr(_r(mr(o.item, r), r), r?.onTap);
	return b`<g class="symbol-group ${c}" data-item=${o.item} data-kind=${o.kind} aria-label=${f} role=${p.role} tabindex=${p.tabindex} @click=${p.click} @keydown=${p.keydown} style=${o.kind === "coil" ? `color: ${pa(t)}` : x}>
    <title>${f}</title>
    <g transform="translate(${o.x} ${o.y})">${aa(o.kind, {
		rotation: o.rotation,
		size: o.size,
		open: o.kind === "valve3" ? sa(o.item, s) : void 0,
		reversed: o.kind === "inversion_valve" ? s.valve14 === "reversed" : void 0,
		fills: a,
		arrangement: i
	})}</g>
    ${n === "full" ? b`<text class="item" x=${o.x + l} y=${o.y + u} text-anchor=${d ?? "start"}>${o.item}</text>` : x}
  </g>`;
}
function la(e, t, n) {
	let r = yi(t), i = n.muted ? x : `stroke: ${n.color}`;
	return b`<g class="helix ${n.muted ? "muted" : ""}" data-segment=${e.id} style=${i}>
    ${vi(r).map((e) => b`<path class="pipe ${n.muted ? "muted" : ""}" data-half=${e.front ? "front" : "back"} style=${i} stroke-linecap=${e.front ? "round" : "butt"} opacity=${e.front ? x : gi} d=${e.d} />`)}
    ${n.animated ? b`<path class="flow ${n.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(n.duration)}s" d=${r.filter((e) => e.front).map((e) => e.d).join(" ")} />` : x}
  </g>`;
}
function ua(e, t, n, r, i) {
	if (e.shape !== void 0) return la(e, e.shape, t);
	let a = e.bend === void 0 ? Ti(e.points, n, r) : bi(e.points, e.bend);
	return b`<path class="pipe ${t.muted ? "muted" : ""}" data-segment=${e.id} style=${t.muted ? x : `stroke: ${t.color}`} stroke-linecap=${e.roundEnd === !0 ? "round" : x} d=${a} />${t.muted && i !== void 0 && ma.has(e.id) ? b`<path class="pipe-inside" data-inside=${e.id} clip-path="url(#${i})" d=${a} />` : x}${t.animated ? b`<path class="flow ${t.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(t.duration)}s" d=${a} />` : x}`;
}
function da(e, t, n, r) {
	let i = (e) => e.map((e) => n.get(e)).find((e) => e !== void 0), a = e.reversible === !0 && r === "active_cooling", [o, s] = a ? [e.leaving, e.entering] : [e.entering, e.leaving], c = i(o), l = i(s), u = (c?.muted ?? !0) && (l?.muted ?? !0), d = (e) => u ? cn : e?.color ?? "var(--disabled-text-color)", f = e.enters === "top" !== a;
	return {
		id: t,
		y1: +!f,
		y2: +!!f,
		start: d(c),
		end: d(l),
		muted: u
	};
}
var fa = (e) => b`<linearGradient id=${e.id} x1="0" y1=${e.y1} x2="0" y2=${e.y2} data-muted=${e.muted}>
      <stop offset="0" style="stop-color: ${e.start}" />
      <stop offset="1" style="stop-color: ${e.end}" />
    </linearGradient>`;
function pa(e) {
	let t = Yi(e);
	return t === "var(--disabled-text-color)" ? un : t;
}
var ma = /* @__PURE__ */ new Set(["dhw_ext_in", "dhw_ext_out"]);
function ha(e, t, n, r = {
	mode: "gradient",
	idPrefix: "ecogeo"
}, i = ki.pipe) {
	let a = 7 * i / ki.pipe, o = si(e), { cabinet: s } = o, c = mi(e), l = new Set(c.map((e) => e.part.id)), u = new Map(c.map((e) => [e.part.id, qi(e.part, e.state, t)])), d = [], f = li(e) === "external" ? `${r.idPrefix}-tank-clip` : void 0, p = pi(e).map((i) => {
		let a = r.mode === "gradient" ? i.part.sides : void 0;
		if (a === void 0) return ca(i, t, e.detail, n, o);
		let s = {
			left: "none",
			right: "none"
		};
		for (let e of a) {
			let n = da(e, `${r.idPrefix}-x${String(i.part.item)}-${e.half}`, u, t.mode);
			d.push(n), s[e.half] = `url(#${n.id})`;
		}
		return ca(i, t, e.detail, n, o, s);
	});
	return b`<g class="cabinet">
    <defs>${d.map(fa)}${f === void 0 ? x : b`<clipPath id=${f} data-tank-clip><path d=${Ar(o)} /></clipPath>`}</defs>
    <rect class="outline" x=${s.x} y=${s.y} width=${s.width} height=${s.height} rx="6" />
    ${o.circuitLabels.filter((t) => e.captions !== !1 && di(t, e) !== "hidden").map((e) => b`<text class="circuit-label" x=${e.x} y=${e.y} text-anchor="middle">${Ze[e.key]}</text>`)}
    ${c.map((e) => {
		let t = u.get(e.part.id);
		return t === void 0 ? x : ua(e.part, t, Di(o, e.part.id, l), a, f);
	})}
    ${p}
  </g>`;
}
// src/diagram/dhw.ts
var ga = o`
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
    ${yr}
  }
  .tank-caption {
    fill: var(--secondary-text-color);
    font-size: 11px;
  }
`;
function _a(e, t) {
	if (li(e) !== "external") return b``;
	let n = si(e), { x: r, y: i, width: a, dome: o } = n.externalTank, s = a / 2, c = Ar(n), l = `M${String(r)} ${String(i + o)} A${String(s)} ${String(o)} 0 0 0 ${String(r + a)} ${String(i + o)}`, u = vr(_r(gr, t), t?.onTap);
	return b`<g class=${e.dhw === "unused" ? "dhw-storage muted" : "dhw-storage"} data-dhw="external" aria-label=${$e.externalTank} role=${u.role} tabindex=${u.tabindex} @click=${u.click} @keydown=${u.keydown}>
    <title>${$e.externalTank}</title>
    <path class="tank-body" data-dhw-tank="external" d=${c} fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />
    <path class="tank-rim" d=${l} />
    ${e.captions === !1 ? x : b`<text class="tank-caption" x=${r + a / 2} y=${i - 6} text-anchor="middle">${$e.externalTank}</text>`}
  </g>`;
}
// src/lib/format.ts
var va = "−";
function ya(e) {
	let t = e?.locale;
	return typeof t == "object" && t ? t : e?.language === void 0 ? {} : { language: e.language };
}
function ba(e) {
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
var xa = /* @__PURE__ */ new Map();
function Sa(e, t, n) {
	let r = ba(e), i = n && e.number_format !== "none", a = `${r?.join(",") ?? ""}|${String(t)}|${String(i)}`, o = xa.get(a);
	return o === void 0 && (o = new Intl.NumberFormat(r, {
		minimumFractionDigits: t,
		maximumFractionDigits: t,
		useGrouping: i
	}), xa.set(a, o)), o;
}
function Ca(e, t, n = 0, r = !0) {
	if (!Number.isFinite(e)) return "–";
	let i = Number.isFinite(n) ? Math.min(20, Math.max(0, Math.trunc(n))) : 0, a = Math.abs(e) < .5 / 10 ** i ? 0 : e;
	return Sa(t ?? {}, i, r).formatToParts(a).map((e) => e.type === "minusSign" ? va : e.value).join("");
}
// src/calc/display.ts
function wa(e) {
	if (typeof e != "object" || !e) return;
	let t = e.display_precision;
	return typeof t == "number" && Number.isInteger(t) && t >= 0 && t <= 20 ? t : void 0;
}
var Ta = (e, t) => t ?? e.decimals ?? 0;
function Ea(e, t) {
	let n = typeof t == "string" ? t.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase() : "";
	return n === (e.unit ?? "").toLowerCase() || e.quantity === "difference" && n === "°c";
}
function Da(e) {
	if (/e/i.test(e ?? "")) return 0;
	let t = /^\s*[-+]?\d*\.(\d+)/.exec(e ?? "");
	return Math.min(20, t?.[1]?.length ?? 0);
}
function Oa(e, t) {
	let n = e === void 0 ? void 0 : t.states?.[e]?.attributes.unit_of_measurement;
	return typeof n == "string" && n.trim() !== "" ? n.trim() : void 0;
}
function ka(e, t, n, r) {
	if (typeof t == "boolean") return nt[t ? "on" : "off"];
	let i = Dt.get(e);
	if (i === void 0 || t === void 0 || !Number.isFinite(t)) return;
	let a = Oa(n, r), o = Ea(i, a), s = i.quantity !== void 0 && yt(i.quantity, a), c = i.unit !== void 0 && a !== void 0 && !o && !s, l = n === void 0 || !(o || c) ? void 0 : wa(r.entities?.[n]), u = c && l === void 0 ? Da(n === void 0 ? void 0 : r.states?.[n]?.state) : Ta(i, l), d = Ca(t, r.locale, u, !1), f = c ? a : i.unit;
	return f === void 0 ? d : `${d} ${f}`;
}
// src/diagram/labels.ts
var Aa = o`
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
`, ja = /* @__PURE__ */ new Set();
function Ma(e, t, n, r, i = !1, a = ja) {
	return si(e).labels.specs.flatMap((o) => {
		if (i && o.tier !== "key" || a.has(o.role) || di(o, e) === "hidden" || e.dhw === "unused" && o.dhw !== void 0) return [];
		let s = n[o.role], c = i ? o.compact : void 0, l = (i ? o.compactCaption : void 0) ?? o.caption, u = c ?? {
			x: o.x,
			y: o.y,
			align: o.align
		}, d = {
			id: o.id,
			role: o.role,
			...u,
			emphasis: o.emphasis === !0,
			...o.bare === !0 && c === void 0 ? { bare: !0 } : {},
			entityId: s,
			...o.item === void 0 ? {} : { item: o.item },
			...l === void 0 ? {} : { caption: l },
			...i && l !== void 0 && wr.has(o.id) ? { stacked: !0 } : {}
		}, f = t[o.role];
		if (o.demand === !0) {
			let e = o.role === "heating.demand" ? et.demand : $e.demand;
			return f === !0 ? [{
				...d,
				text: e,
				missing: !1
			}] : [];
		}
		let p = ka(o.role, typeof f == "number" || typeof f == "boolean" ? f : void 0, s, r);
		return [{
			...d,
			text: p ?? "–",
			missing: p === void 0
		}];
	});
}
var Na = /* @__PURE__ */ new Set(["outside_temperature", "cop"]);
function Pa(e, t, n, r = !1, i = ja) {
	let a = (e, n, r, a) => n.every((e) => i.has(e)) ? void 0 : {
		id: e,
		tier: Na.has(e) ? "key" : "detail",
		...r === void 0 ? {} : { caption: r },
		text: a ?? "–",
		missing: a === void 0,
		entityId: t[n[0]]
	}, o = (r, i, o) => {
		let s = e[i];
		return a(r, [i], o, ka(i, typeof s == "number" || typeof s == "boolean" ? s : void 0, t[i], n));
	}, s = e["unit.on_off"], c = e["unit.summer"] === !0 ? tt.summer : e["unit.winter"] === !0 ? tt.winter : void 0, l = [
		a("on_off", ["unit.on_off"], void 0, s === void 0 ? void 0 : typeof s == "boolean" ? nt[s ? "on" : "off"] : nt[s.toLowerCase()] ?? s),
		a("season", e["unit.summer"] === !0 || i.has("unit.winter") ? ["unit.summer", "unit.winter"] : ["unit.winter", "unit.summer"], void 0, c),
		o("outside_temperature", "source.outside_temperature", tt.outside),
		o("cop", "unit.cop", tt.cop),
		o("condensation_capacity", "heating.capacity", tt.condensation),
		o("evaporation_capacity", "cooling.capacity", tt.evaporation)
	].filter((e) => e !== void 0);
	return r ? l.filter((e) => e.tier === "key") : l;
}
var Fa = (e, t) => ({
	left: `${String(e.x / t.width * 100)}%`,
	top: `${String(e.y / t.height * 100)}%`
});
function Ia(e, t, n, r) {
	let i = n ? "value missing" : "value";
	return e === void 0 || r === void 0 ? y`<span class=${i}>${t}</span>` : y`<button
        class=${i}
        type="button"
        @click=${() => {
		r(e);
	}}
      >
        ${t}
      </button>`;
}
function La(e, t, n) {
	return y`${e.map((e) => {
		let { left: r, top: i } = Fa(e, n);
		return y`<span
      class="label ${e.align}${e.emphasis ? " emphasis" : ""}${e.bare === !0 ? " bare" : ""}${e.stacked === !0 ? " stacked" : ""}"
      data-label=${e.id}
      data-role=${e.role}
      data-label-item=${e.item ?? x}
      style="left: ${r}; top: ${i}"
      >${e.caption === void 0 ? x : y`<span class="caption">${e.caption}</span>`}${Ia(e.entityId, e.text, e.missing, t)}</span
    >`;
	})}`;
}
function Ra(e, t) {
	return y`${e.map((e) => y`<span class="footer-item" data-footer=${e.id}
        >${e.caption === void 0 ? x : y`<span class="caption">${e.caption}</span>`}${Ia(e.entityId, e.text, e.missing, t)}</span
      >`)}`;
}
// node_modules/@lit/reactive-element/decorators/property.js
var za = {
	attribute: !0,
	type: String,
	converter: re,
	reflect: !1,
	hasChanged: ie
}, Ba = (e = za, t, n) => {
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
function Va(e) {
	return (t, n) => typeof n == "object" ? Ba(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function Ha(e) {
	return Va({
		...e,
		state: !0,
		attribute: !1
	});
}
// src/lib/define.ts
function Ua(e, t) {
	let n = customElements.get(e);
	n === void 0 ? customElements.define(e, t) : n !== t && console.warn(`${e} is already defined by another copy of the module; that copy stays in use.`);
}
// src/config/keywords.ts
var X = (e) => e.split(/\s+/).filter((e) => e !== ""), Z = "temp temperature temperatuur temperatura temperatur", Wa = "pressure druk presion druck", Ga = "pump pomp bomba pumpe circulator", Ka = "heating verwarming heizung heizkreis calefaccion cv", qa = `production productie produccion produktion ${Ka}`, Ja = "brine glycol source bron brijn captacion salmuera sole", Ya = "dhw sanitary sanitaria tapwater warmwater warmwasser acs caliente domestic hotwater boiler", Xa = "demand vraag demanda anforderung bedarf request", Za = "suction zuig saug ansaug succion aspiracion niederdruck lagedruk", Qa = "discharge pers druckgas heissgas descarga hochdruck hogedruk", $a = "capacity vermogen capacidad kapazitat leistung power", eo = "valve ventiel valvula ventil position stand posicion stellung", to = "compressor compresor kompressor verdichter", no = "condens condensation condensatie condensacion kondensation kondens", ro = "evaporat evaporation evaporacion verdamp verdampfung", io = `${Ka} dg verwarmen`, ao = "setpoint set target desired gewenst ingesteld soll wunsch consigna objetivo streef", oo = "superheat oververhitting oververhit sobrecalentamiento ueberhitzung uberhitzung", so = "on off aan uit onoff encendido apagado ein aus", co = "alarm alarma storing stoerung storung fehler error fault malfunction", lo = "cop scop coefficient rendimiento rendement wirkungsgrad efficiency", uo = {
	"production.outlet_temperature": {
		subject: X(qa),
		role: X(Z)
	},
	"production.return_temperature": {
		subject: X(qa),
		role: X(Z)
	},
	"production.pressure": {
		subject: X(qa),
		role: X(Wa)
	},
	"production.pump": {
		subject: X(qa),
		role: X(Ga)
	},
	"brine.outlet_temperature": {
		subject: X(Ja),
		role: X(Z)
	},
	"brine.inlet_temperature": {
		subject: X(Ja),
		role: X(Z)
	},
	"brine.pressure": {
		subject: X(Ja),
		role: X(Wa)
	},
	"brine.pump": {
		subject: X(Ja),
		role: X(Ga)
	},
	"compressor.speed": {
		subject: X(to),
		role: X("rpm speed toerental toeren velocidad drehzahl frequency frequentie frecuencia frequenz hz running draait actief active activo laufend")
	},
	"compressor.percentage": {
		subject: X(to),
		role: X("percentage porcentaje prozent load belasting carga auslastung capaciteit")
	},
	"compressor.power": {
		subject: X("power vermogen potencia leistung electrical elektrisch electrico"),
		role: X("consumption opgenomen verbruik consumo verbrauch aufnahme")
	},
	"compressor.suction_temperature": {
		subject: X(Za),
		role: X(Z)
	},
	"compressor.discharge_temperature": {
		subject: X(Qa),
		role: X(Z)
	},
	"compressor.suction_pressure": {
		subject: X(Za),
		role: X(Wa)
	},
	"compressor.discharge_pressure": {
		subject: X(Qa),
		role: X(Wa)
	},
	"compressor.mode": {
		subject: X(to),
		role: X("mode modus modo operation operating bedrijf funcionamiento betriebsart")
	},
	"refrigerant.condensation_temperature": {
		subject: X(no),
		role: X(Z)
	},
	"refrigerant.evaporation_temperature": {
		subject: X(ro),
		role: X(Z)
	},
	"refrigerant.superheat": {
		subject: X(oo),
		role: X(oo)
	},
	"refrigerant.expansion_valve": {
		subject: X("expansion expansie expansionsventil expans"),
		role: X(eo)
	},
	"heating.capacity": {
		subject: X(no),
		role: X($a)
	},
	"cooling.capacity": {
		subject: X(ro),
		role: X($a)
	},
	"heating.demand": {
		subject: X(io),
		role: X(Xa)
	},
	"heating.setpoint": {
		subject: X(io),
		role: X(`${Z} ${ao}`)
	},
	"dhw.temperature": {
		subject: X(Ya),
		role: X(Z)
	},
	"dhw.setpoint": {
		subject: X(Ya),
		role: X(`${Z} ${ao}`)
	},
	"dhw.start_delta": {
		subject: X(Ya),
		role: X("delta difference verschil diferencia unterschied start starten arranque")
	},
	"dhw.demand": {
		subject: X(Ya),
		role: X(Xa)
	},
	"source.fan_speed": {
		subject: X("fan ventilator ventilador luefter lufter aerothermal aerotermico"),
		role: X("speed toerental toeren velocidad drehzahl rpm fan ventilator ventilador")
	},
	"source.air_unit_outlet_temperature": {
		subject: X("luchtunit lufteinheit airunit aerothermal aero"),
		role: X(Z)
	},
	"source.outside_temperature": {
		subject: X("outside outdoor external buiten exterior aussen ausen"),
		role: X(Z)
	},
	"unit.on_off": {
		subject: X(`${so} heatpump warmtepomp`),
		role: X(`${so} power switch schakelaar`)
	},
	"unit.summer": {
		subject: X("summer zomer verano sommer"),
		role: X("summer zomer verano sommer mode bedrijf modo betrieb")
	},
	"unit.winter": {
		subject: X("winter invierno"),
		role: X("winter invierno mode bedrijf modo betrieb")
	},
	"unit.alarm": {
		subject: X(co),
		role: X(co)
	},
	"unit.connection": {
		subject: X("connection connected connectivity conexion verbinding verbindung online communication"),
		role: X("connection connected connectivity conexion verbinding verbindung status online communication")
	},
	"unit.cop": {
		subject: X(lo),
		role: X(lo)
	}
}, fo = {
	in: X(`in inlet return retour retorno inflow terug terugvoer terugloop inlaat entrada eintritt ruecklauf rucklauf ingaand eingang ${Za}`),
	out: X(`out outlet supply aanvoer uitlaat salida impulsion austritt vorlauf uitgaand ausgang uit ${Qa}`)
}, po = X(ao), mo = /* @__PURE__ */ new Set(["heating.setpoint", "dhw.setpoint"]), ho = X("flow"), go = {
	exact: 100,
	suffix: 90,
	subject: 30,
	role: 20,
	direction: 10,
	strong: 40,
	tie: 5
}, _o = (e) => e.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replaceAll("ß", "ss"), vo = (e) => _o(e).split(/[^a-z]+/).filter((e) => e !== ""), yo = (e) => {
	let t = e.indexOf(".");
	return [e.slice(0, t), e.slice(t + 1)];
};
function bo(e, t, n, r) {
	let i = n[r]?.name_by_user ?? n[r]?.name ?? "";
	return Object.values(t).filter((e) => e?.device_id === r).flatMap((t) => {
		let n = e[t.entity_id];
		if (n === void 0) return [];
		let [r, a] = yo(t.entity_id), o = n.attributes.friendly_name, s = n.attributes.unit_of_measurement, c = n.attributes.device_class;
		return [{
			entityId: t.entity_id,
			domain: r,
			objectId: a,
			unit: typeof s == "string" ? s : void 0,
			deviceClass: typeof c == "string" ? c : void 0,
			names: [...typeof o == "string" ? [xo(o, i)] : [], ...typeof t.name == "string" ? [t.name] : []]
		}];
	});
}
function xo(e, t) {
	let n = _o(t).trim(), r = _o(e);
	if (n === "" || !r.startsWith(n)) return e;
	let i = r.slice(n.length);
	return i === "" || /^[^a-z0-9]/.test(i) ? i : e;
}
function So(e) {
	let [t, ...n] = e;
	if (t === void 0) return "";
	let r = t;
	for (let e of n) {
		let t = 0;
		for (; t < r.length && t < e.length && r[t] === e[t];) t++;
		r = r.slice(0, t);
	}
	let i = r.lastIndexOf("_");
	return i < 0 ? "" : r.slice(0, i + 1);
}
function Co(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of k) {
		let r = /* @__PURE__ */ new Set();
		for (let t of e) {
			let e = `_${n.suffix}`;
			t.domain === n.domain && t.objectId.length > e.length && t.objectId.endsWith(e) && r.add(t.objectId.slice(0, -e.length));
		}
		for (let e of r) t.set(e, (t.get(e) ?? 0) + 1);
	}
	let [n] = [...t].sort(([e, t], [n, r]) => r - t || n.length - e.length || (e < n ? -1 : 1));
	return n === void 0 ? So(e.map((e) => e.objectId)) : `${n[0]}_`;
}
var wo = (e) => (e ?? "").trim().toLowerCase(), To = {
	"compressor.speed": ["rpm", "hz"],
	"production.pump": ["%", "rpm"],
	"brine.pump": ["%", "rpm"],
	"source.fan_speed": ["%", "rpm"]
}, Eo = {
	temperature: ["temperature"],
	difference: ["temperature"],
	power: ["power"],
	pressure: ["pressure", "atmospheric_pressure"]
};
function Do(e, t) {
	if (Tt.includes(t.domain)) return !0;
	if (e.kind !== "number") return wo(t.unit) === "" && (t.deviceClass === void 0 || t.deviceClass === "enum");
	if ("quantity" in e && e.quantity !== void 0) {
		if (!yt(e.quantity, t.unit)) return !1;
		let n = Eo[e.quantity];
		return t.deviceClass === void 0 || n === void 0 || n.includes(t.deviceClass);
	}
	let n = wo(t.unit), r = To[e.path] ?? ("unit" in e && e.unit !== void 0 ? [wo(e.unit)] : []);
	return r.length === 0 ? n === "" : r.includes(n);
}
function Oo(e, t) {
	return e.accepts.includes(t.domain) && Do(e, t);
}
var ko = (e, t) => e.some((e) => t.some((t) => e.length >= 4 ? t.includes(e) : t === e));
function Ao(e, t, n) {
	if (t.entityId === kt(e, n.replace(/_$/, "")) && n !== "") return go.exact;
	if ((e.kind !== "binary" || Tt.includes(t.domain)) && (t.objectId === e.suffix || t.objectId.endsWith(`_${e.suffix}`))) return go.suffix;
	let r = [...vo(t.objectId.startsWith(n) ? t.objectId.slice(n.length) : t.objectId), ...t.names.flatMap(vo)];
	if (ko(po, r) !== mo.has(e.path)) return 0;
	let i = 0, a = uo[e.path];
	if (ko(a.subject, r) && (i += go.subject), ko(a.role, r) && (i += go.role), e.direction !== void 0) {
		if ((e.direction !== "out" || !ko(ho, r) || ko(fo.in, r)) && !ko(fo[e.direction], r)) return 0;
		i += go.direction;
	}
	return i;
}
function jo(e) {
	return typeof e != "object" || !e || Array.isArray(e) ? {} : Object.fromEntries(Object.entries(e).map(([e, t]) => [e, typeof t == "object" && t && !Array.isArray(t) ? jo(t) : t]));
}
function Mo(e) {
	let { states: t, config: n } = e, r = bo(t, e.entities, e.devices, e.deviceId), i = Co(r), a = lr(n, Rn(n)), o = /* @__PURE__ */ new Set(), s = [];
	for (let e of k) {
		if (Ln(A(n, `entities.${e.path}`))) continue;
		let r = a[e.path];
		r !== void 0 && t[r] !== void 0 ? o.add(r) : s.push(e);
	}
	let c = s.flatMap((e, t) => r.filter((t) => !o.has(t.entityId) && Oo(e, t)).map((n) => ({
		role: e,
		order: t,
		candidate: n,
		score: Ao(e, n, i)
	}))).filter((e) => e.score > 0).sort((e, t) => t.score - e.score || e.order - t.order || (e.candidate.entityId < t.candidate.entityId ? -1 : 1)), l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set();
	for (let e of c) {
		let t = e.role.path;
		if (e.score < go.strong) break;
		if (l.has(t) || u.has(t) || o.has(e.candidate.entityId)) continue;
		let [n, r] = c.filter((t) => t.role === e.role && !o.has(t.candidate.entityId));
		n !== void 0 && r !== void 0 && n.score - r.score <= go.tie ? u.add(t) : (l.set(t, e.candidate.entityId), o.add(e.candidate.entityId));
	}
	let d = jo(A(n, "entities"));
	for (let [e, t] of l) {
		let [n = "", r = ""] = e.split("."), i = d[n], a = typeof i == "object" && i ? i : {};
		a[r] = t, d[n] = a;
	}
	return {
		entities: d,
		report: {
			filled: s.map((e) => e.path).filter((e) => l.has(e)),
			empty: s.map((e) => e.path).filter((e) => !l.has(e))
		}
	};
}
// src/editor/role-labels.ts
var No = E.roleGroups, Po = E.roles;
function Fo(e) {
	let [t = "", n = ""] = e.split(".");
	return `${No[t] ?? t}: ${Po[n] ?? n}`;
}
// src/editor/binding-check.ts
function Io(e, t) {
	if (t === void 0 || Object.keys(t).length === 0) return [];
	let n = lr(e, Rn(e));
	return k.flatMap((r) => {
		let i = n[r.path];
		if (i === void 0 || Ln(A(e, `entities.${r.path}`))) return [];
		let a = Fo(r.path), o = t[i];
		if (o === void 0) return [E.suggest.unknown(a, i)];
		let s = i.slice(0, i.indexOf("."));
		if (!r.accepts.includes(s)) return [E.suggest.kind(a, i)];
		if (o.state === "unavailable") return [];
		let c = o.attributes.unit_of_measurement, l = o.attributes.device_class;
		return Do(r, {
			domain: s,
			unit: typeof c == "string" ? c : void 0,
			deviceClass: typeof l == "string" ? l : void 0
		}) ? [] : [E.suggest.unit(a, i)];
	});
}
// src/editor/fields.ts
var Lo = (e, t, { advanced: n = !1 } = {}) => ({
	name: e,
	selector: { entity: { filter: { domain: t } } },
	...n ? { advanced: n } : {}
});
function Ro(e) {
	let t = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(e.trim())?.[1];
	if (t === void 0) return;
	let n = t.length === 3 ? t.replace(/./g, "$&$&") : t, r = (e) => Number.parseInt(n.slice(e, e + 2), 16);
	return [
		r(0),
		r(2),
		r(4)
	];
}
var zo = (e) => Array.isArray(e) && e.length === 3 && e.every((e) => typeof e == "number" && Number.isFinite(e)), Bo = (e) => "#" + e.map((e) => Math.min(255, Math.max(0, Math.round(e))).toString(16).padStart(2, "0")).join(""), Vo = (e) => ({
	name: e,
	selector: { color_rgb: {} }
}), Ho = (e, t, n, r = t.default) => ({
	name: e,
	default: r,
	selector: { select: {
		mode: "dropdown",
		options: t.choices.map((e) => ({
			value: e,
			label: n[e] ?? e
		}))
	} }
}), Uo = "#9e9e9e", Wo = /^colors_(\d+)_(temperature|color)$/;
function Go(e) {
	let t = Wo.exec(e);
	return t?.[1] === void 0 ? void 0 : {
		index: Number(t[1]),
		part: t[2]
	};
}
function Ko(e) {
	let t = A(e, "colors");
	return Array.isArray(t) ? t.map((e) => {
		let { temperature: t, color: n } = typeof e == "object" && e ? e : {};
		return {
			...typeof t == "number" ? { temperature: t } : {},
			...typeof n == "string" ? { color: n } : {}
		};
	}) : sn.map((e) => ({ ...e }));
}
var qo = Ro("#9e9e9e") ?? [
	158,
	158,
	158
], Jo = () => ({ color: qo });
function Yo(e) {
	let t = [...e];
	for (; t.length >= 2 && t[t.length - 1]?.temperature === void 0 && t[t.length - 2]?.temperature === void 0;) t.pop();
	return t.at(-1)?.temperature === void 0 && t.length > 0 ? t : [...t, Jo()];
}
function Xo(e) {
	return Yo(Ko(e).map(({ temperature: e, color: t }) => {
		let n = t === void 0 ? void 0 : Ro(t);
		return {
			...e === void 0 ? {} : { temperature: e },
			...n === void 0 ? {} : { color: n },
			...t === void 0 ? {} : { orig: t }
		};
	}));
}
function Zo(e) {
	return Array.from({ length: e }, (e, t) => t).flatMap((e) => [{
		name: `colors_${String(e)}_temperature`,
		selector: { number: {
			step: "any",
			mode: "box",
			unit_of_measurement: C.celsius
		} }
	}, Vo(`colors_${String(e)}_color`)]);
}
function Qo(e) {
	let t = {};
	return e.forEach(({ temperature: e, color: n }, r) => {
		e !== void 0 && (t[`colors_${String(r)}_temperature`] = e), n !== void 0 && (t[`colors_${String(r)}_color`] = [...n]);
	}), t;
}
function $o(e) {
	let t = /* @__PURE__ */ new Map(), n = {};
	for (let [r, i] of Object.entries(e)) {
		let e = Go(r);
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
var es = (e, t) => e.every((e, n) => e === t[n]);
function ts(e) {
	let t = typeof e == "string" && e.trim() !== "" ? Number(e) : e;
	return typeof t == "number" && Number.isFinite(t) ? t : void 0;
}
function ns(e, t) {
	let n = t === void 0 ? void 0 : Ro(t);
	return zo(e) ? t !== void 0 && n && es(n, e) ? t : Bo(e) : t !== void 0 && n === void 0 ? t : Uo;
}
function rs(e, t) {
	let n = Math.max(e.length, ...[...t.keys()].map((e) => e + 1));
	return Yo(Array.from({ length: n }, (n, r) => {
		let i = t.get(r), a = ts(i?.temperature), o = i !== void 0 && zo(i.color) ? i.color : void 0, s = e[r]?.orig;
		return {
			...a === void 0 ? {} : { temperature: a },
			...o === void 0 ? {} : { color: o },
			...s === void 0 ? {} : { orig: s }
		};
	}));
}
var is = (e, t) => e.length === t.length && e.every((e, n) => e.temperature === t[n]?.temperature && e.color === t[n]?.color), as = (e) => e.length === sn.length && e.every((e, t) => {
	let n = sn[t];
	return e.temperature === n?.temperature && e.color.toLowerCase() === n.color;
});
function os(e, t) {
	let n = e.flatMap(({ temperature: e, color: t, orig: n }) => e === void 0 ? [] : [{
		temperature: e,
		color: ns(t, n)
	}]).sort((e, t) => e.temperature - t.temperature), r = A(t, "colors");
	return Array.isArray(r) && is(n, Ko(t)) ? "keep" : as(n) ? r !== void 0 && !Array.isArray(r) ? "keep" : void 0 : n;
}
function ss(e, t) {
	return t === void 0 ? Object.fromEntries(Object.entries(e).filter(([e]) => e !== "colors")) : {
		...e,
		colors: t
	};
}
// src/editor/ecogeo-schema.ts
var cs = [
	"features",
	"entities",
	"states"
], ls = ["entities"], us = "_device", ds = "_not_present", fs = "default", ps = [
	[fs, void 0],
	["true", !0],
	["false", !1],
	["unused", "unused"]
];
function ms(e, t) {
	let { on: n, off: r, unused: i, presetOn: a, presetOff: o, presetUnused: s, variantDefault: c } = E.featureChoices;
	return {
		name: e,
		default: fs,
		coded: ps,
		selector: { select: {
			mode: "dropdown",
			options: [
				{
					value: fs,
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
var hs = [
	"passive_cooling",
	"active_cooling",
	"htr",
	"backup_heater"
];
function gs() {
	return {
		name: "variant",
		default: "4",
		coded: yn.map((e) => [String(e), e]),
		selector: { select: {
			mode: "dropdown",
			options: yn.map((e) => ({
				value: String(e),
				label: E.choices.variant[e]
			}))
		} }
	};
}
var _s = (e) => wn.filter((t) => t === "unused" || t === Pn(e) || t === "none" && e === "B");
function vs(e, t) {
	let n = A(e, "dhw"), r = _s(t), i = wn.filter((e) => r.includes(e) || e === n);
	return Ho("dhw", {
		...On,
		choices: i
	}, E.choices.dhw, Pn(t));
}
function ys(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of k) {
		if (Ln(A(e, `entities.${n.path}`))) continue;
		let [r = "", i = ""] = n.path.split(".");
		t.set(r, [...t.get(r) ?? [], Lo(i, n.accepts, { advanced: !0 })]);
	}
	return {
		type: "expandable",
		name: "entities",
		schema: [...t].map(([e, t]) => ({
			type: "expandable",
			name: e,
			title: E.roleGroups[e],
			schema: t
		}))
	};
}
var bs = () => ({
	name: ds,
	advanced: !0,
	selector: { select: {
		multiple: !0,
		mode: "dropdown",
		options: k.map((e) => ({
			value: e.path,
			label: Fo(e.path)
		}))
	} }
}), xs = {
	off: "unit.on_off",
	defrost: "compressor.mode"
};
function Ss(e, t) {
	let n = lr(e, Rn(e)), r = (e) => {
		let r = n[xs[e]], i = r === void 0 ? void 0 : t?.[r]?.attributes.options;
		return Array.isArray(i) ? i.filter((e) => typeof e == "string") : [];
	};
	return {
		off: r("off"),
		defrost: r("defrost")
	};
}
function Cs(e) {
	let t = (t) => ({
		name: t,
		advanced: !0,
		default: [...ot[t]],
		selector: { select: {
			multiple: !0,
			custom_value: !0,
			mode: "dropdown",
			options: [.../* @__PURE__ */ new Set([...e[t], ...ot[t]])]
		} }
	});
	return {
		type: "expandable",
		name: "states",
		schema: [t("off"), t("defrost")]
	};
}
function ws(e, t = Xo(e).length, n) {
	let r = bn(zn(e)), i = A(e, "model") === Sn[1] ? Sn[1] : Sn[0];
	return [
		{
			type: "expandable",
			name: "unit",
			flatten: !0,
			schema: [
				Ho("model", En, E.choices.model),
				gs(),
				Ho("source", Dn, E.choices.source),
				vs(e, i)
			]
		},
		{
			type: "expandable",
			name: "entity_prefix",
			flatten: !0,
			schema: [{
				name: us,
				selector: { device: {} }
			}, {
				name: "prefix",
				selector: { text: {} }
			}]
		},
		{
			type: "expandable",
			name: "features",
			schema: hs.map((e) => ms(e, r[e]))
		},
		{
			type: "expandable",
			name: "appearance",
			flatten: !0,
			schema: [
				Ho("detail", kn, E.choices.detail),
				Ho("exchanger_fill", An, E.choices.exchanger_fill),
				Ho("layout", jn, E.choices.layout),
				...Zo(t)
			]
		},
		ys(e),
		bs(),
		Cs(Ss(e, n))
	];
}
// src/editor/schema.ts
function Ts(e) {
	return "type" in e;
}
function Es(e) {
	let { advanced: t, ...n } = e;
	return n;
}
function Ds(e, t) {
	return e.flatMap((e) => {
		if (!Ts(e)) return t || e.advanced !== !0 ? [Es(e)] : [];
		let n = Ds(e.schema, t);
		return n.length > 0 ? [{
			...e,
			schema: n
		}] : [];
	});
}
function Q(e, t = "") {
	return e.flatMap((e) => Ts(e) ? Q(e.schema, e.flatten ? t : `${t}${e.name}.`) : [{
		field: e,
		path: `${t}${e.name}`
	}]);
}
function Os(e, t) {
	return Ds(e, t);
}
function ks(e, t) {
	if (e == null || e === "") return !1;
	if (t.default === void 0) return !0;
	if (typeof t.default == "number") {
		let n = typeof e == "number" ? e : typeof e == "string" ? ut(e) : void 0;
		if (n !== void 0) return n !== t.default;
	}
	return As(e) !== As(t.default);
}
function As(e) {
	return (typeof e == "string" || typeof e == "number" || typeof e == "boolean" ? String(e) : JSON.stringify(e)).toLowerCase();
}
function js(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function $(e, t, n, r, i = "") {
	let [a, ...o] = t.split("."), s = e, { [a]: c, ...l } = s;
	if (o.length === 0) return n === void 0 ? l : Object.hasOwn(s, a) ? {
		...s,
		[a]: n
	} : {
		...l,
		[a]: n
	};
	let u = $(js(c) ? c : {}, o.join("."), n, r, `${i}${a}.`), d = r !== void 0 && A(r, `${i}${a}`) !== void 0;
	return n === void 0 && Object.keys(u).length === 0 && !d ? l : {
		...s,
		[a]: u
	};
}
function Ms(e, t, n = /* @__PURE__ */ new Set()) {
	return Q(e).reduce((e, { field: r, path: i }) => r.default !== void 0 && A(t, i) === void 0 && !n.has(i) ? $(e, i, r.default) : e, t);
}
function Ns(e, t, n) {
	return Q(e).map(({ path: e }) => e).filter((e) => A(t, e) !== void 0 && A(n, e) === void 0);
}
function Ps(e) {
	if (!js(e)) return e;
	let t = Object.entries(e).filter(([, e]) => e !== void 0).map(([e, t]) => [e, Ps(t)]);
	return t.length !== Object.keys(e).length || t.some(([t, n]) => n !== e[t]) ? Object.fromEntries(t) : e;
}
function Fs(e, t) {
	return Q(e).reduce((e, { field: n, path: r }) => ("text" in n.selector || "entity" in n.selector) && A(e, r) === "" ? $(e, r, void 0, t) : e, t);
}
function Is(e, t) {
	return Q(e).reduce((e, { field: t, path: n }) => {
		let r = A(e, n), i = t.coded?.find(([, e]) => e !== void 0 && e === r);
		return i === void 0 ? e : $(e, n, i[0]);
	}, t);
}
function Ls(e, t, n) {
	return Q(e).reduce((e, { field: t, path: r }) => {
		let i = A(e, r), a = t.coded?.find(([e]) => e === i);
		return a === void 0 ? e : $(e, r, a[1], n);
	}, t);
}
function Rs(e, t, n, r = []) {
	let i = (e) => js(e) && Object.keys(e).length === 0;
	return Object.fromEntries(Object.entries(e).flatMap(([e, a]) => {
		if (!n.includes(e) || !js(a)) return [[e, a]];
		let o = t[e], s = r.includes(e) ? Object.fromEntries(Object.entries(a).filter(([e, t]) => !i(t) || js(o) && i(o[e]))) : a;
		return Object.keys(s).length > 0 || i(o) ? [[e, s]] : [];
	}));
}
function zs(e, t, n) {
	return Q(e).reduce((e, { field: n, path: r }) => n.default !== void 0 && A(t, r) === void 0 && A(e, r) !== void 0 && !ks(A(e, r), n) ? $(e, r, void 0, t) : e, n);
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/decorate.js
function Bs(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/editor/ecogeo-card-editor.ts
var Vs = "ecogeo-card-editor", Hs = [{
	name: "advanced",
	selector: { boolean: {} }
}], Us = () => E.advanced, Ws = E.sections, Gs = E.fields, Ks = E.roles;
function qs(e) {
	if (Ts(e)) return e.title ?? Ws[e.name] ?? e.name;
	let t = Go(e.name);
	return t === void 0 ? Gs[e.name] ?? Ks[e.name] ?? e.name : E.colorRow[t.part](t.index + 1);
}
var Js = (e) => Object.hasOwn(e, "entities") || Object.hasOwn(e, "states"), Ys = (e) => Object.hasOwn(e, "entities"), Xs = [us, ds];
function Zs(e, t) {
	let n = e.states;
	if (typeof n != "object" || !n || Array.isArray(n)) return e;
	let r = (e, t) => Array.isArray(e) && Array.isArray(t) && e.length === t.length && e.every((e, n) => String(e).trim().toLowerCase() === String(t[n]).trim().toLowerCase()), i = Object.entries(n).filter(([e, n]) => {
		if (!Array.isArray(n)) return !0;
		if (n.length === 0) return !1;
		let i = e === "off" || e === "defrost" ? ot[e] : void 0, a = JSON.stringify(n) === JSON.stringify(A(t, `states.${e}`));
		return i === void 0 || !r(n, i) || a;
	});
	return {
		...e,
		states: Object.fromEntries(i)
	};
}
function Qs(e, t, n) {
	let r = e;
	for (let e of Yn(n)) t.has(e) || (r = $(r, `entities.${e}`, void 0, n));
	for (let e of t) r = $(r, `entities.${e}`, "none", n);
	return r;
}
var $s = class extends We {
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
    .suggest {
      margin: 8px 0;
      padding: 8px 16px;
      border: none;
      border-radius: var(--ha-border-radius-pill, 18px);
      background: var(--primary-color);
      color: var(--text-primary-color);
      font: inherit;
      font-weight: 500;
      cursor: pointer;
    }
    .suggest:disabled {
      background: var(--disabled-color);
      cursor: default;
    }
    .report,
    .warnings {
      margin: 0 0 8px;
      padding-left: 20px;
      color: var(--secondary-text-color);
    }
    .warnings {
      color: var(--warning-color, var(--secondary-text-color));
    }
    .title {
      margin: 8px 0 0;
      font-weight: 500;
    }
  `;
	}
	constructor() {
		super(), this.schemaFor = ws, this._switch = { advanced: !1 }, this._optionsKey = "", this._formDefined = customElements.get("ha-form") !== void 0, this._schema = [], this._formSchema = [], this._shown = {}, this._draft = [], this._draftBuilt = !1, this._emptied = /* @__PURE__ */ new Set(), this._toggleAdvanced = (e) => {
			e.stopPropagation(), this._switch = { advanced: e.detail.value.advanced === !0 };
		}, this._configChanged = (e) => {
			e.stopPropagation();
			let t = this._config ?? {}, { [us]: n, [ds]: r, ...i } = e.detail.value, a = this._has(us), o = typeof n == "string" && n !== "" ? n : void 0;
			if (a && o !== this._device) {
				this._device = o, this._report = void 0;
				return;
			}
			this._report = void 0;
			let s = this._has(ds), c = a || s ? i : e.detail.value, l = this._hasColorRows, u = l ? $o(c) : void 0, d = Ps(Fs(this._schema, u?.rest ?? c)), f = l ? $o(this._shown).rest : this._shown, p = (e) => {
				let t = A(d, e);
				return e.startsWith("states.") && Array.isArray(t) && t.length === 0;
			}, m = [...Ns(this._schema, f, d), ...Q(this._schema).map(({ path: e }) => e).filter((e) => p(e) && A(f, e) !== void 0)].filter((e) => !Xs.includes(e));
			this._emptied = new Set([...this._emptied, ...m].filter((e) => A(d, e) === void 0 || p(e)));
			let h = Ls(this._schema, d, t), ee = s && (Array.isArray(r) || Object.hasOwn(e.detail.value, "_not_present")) ? Qs(h, new Set(Array.isArray(r) ? r.filter((e) => typeof e == "string") : []), t) : h, te = Rs(Zs(zs(this._schema, t, ee), t), t, cs, ls);
			u && (this._draft = rs(this._draft, u.rows));
			let ne = u ? os(this._draft, t) : "keep", g = ne === "keep" ? te : ss(te, ne);
			this._colorsSeen = g.colors, this._config = g, this._refreshSchema(g), this.dispatchEvent(new CustomEvent("config-changed", {
				detail: { config: g },
				bubbles: !0,
				composed: !0
			}));
		}, this._suggest = () => {
			let e = this._pickDevice(), t = this.hass;
			if (e === void 0 || t === void 0 || this._config === void 0) return;
			let n = this._config, { entities: r, report: i } = Mo({
				states: t.states,
				entities: t.entities ?? {},
				devices: t.devices ?? {},
				deviceId: e,
				config: n
			});
			this._switch = { advanced: !0 }, this._report = {
				filled: i.filled.length,
				empty: i.empty.map(Fo)
			};
			let a = Object.keys(r).length === 0 && !Ys(n) ? n : {
				...n,
				entities: r
			};
			JSON.stringify(a) !== JSON.stringify(n) && (this._config = a, this._refreshSchema(a), this.dispatchEvent(new CustomEvent("config-changed", {
				detail: { config: a },
				bubbles: !0,
				composed: !0
			})));
		}, this._formDefined || customElements.whenDefined("ha-form").then(() => {
			this._formDefined = !0;
		});
	}
	setConfig(e) {
		let t = JSON.stringify(e) !== JSON.stringify(this._config);
		this._emptied.size > 0 && t && (this._emptied = /* @__PURE__ */ new Set()), t && (this._report = void 0);
		let n = this._config !== void 0 && Js(this._config);
		Js(e) && !n && !this._switch.advanced && (this._switch = { advanced: !0 }), this._draftBuilt && JSON.stringify(e.colors) === JSON.stringify(this._colorsSeen) || (this._draft = Xo(e), this._colorsSeen = e.colors, this._draftBuilt = !0), this._config = e, this._refreshSchema(e);
	}
	_refreshSchema(e) {
		let t = this.schemaFor(e, this._draft.length, this.hass?.states);
		this._optionsKey = JSON.stringify(Ss(e, this.hass?.states)), JSON.stringify(t) !== JSON.stringify(this._schema) && (this._schema = t, this._formSchema = Os(t, this._switch.advanced));
	}
	willUpdate(e) {
		(e.has("schemaFor") && this._config || e.has("hass") && this._config && JSON.stringify(Ss(this._config, this.hass?.states)) !== this._optionsKey) && this._refreshSchema(this._config), e.has("_switch") && (this._formSchema = Os(this._schema, this._switch.advanced)), this._config && (e.has("_config") || e.has("schemaFor") || e.has("_device")) && (this._shown = {
			...Is(this._schema, Ms(this._schema, this._config, this._emptied)),
			...this._hasColorRows ? Qo(this._draft) : {},
			...this._has("_device") && this._device !== void 0 ? { [us]: this._device } : {},
			...this._has("_not_present") ? { [ds]: [...Yn(this._config)] } : {}
		});
	}
	_has(e) {
		return Q(this._schema).some(({ path: t }) => t === e);
	}
	get _hasColorRows() {
		return Q(this._schema).some(({ path: e }) => Go(e) !== void 0);
	}
	_pickDevice() {
		return this.hass === void 0 ? void 0 : this._device;
	}
	_renderNotes() {
		let e = this._config ? Io(this._config, this.hass?.states) : [];
		return y`
      ${this._has("_device") ? y`<button
              type="button"
              class="suggest"
              ?disabled=${this._pickDevice() === void 0}
              @click=${this._suggest}
            >
              ${E.suggest.button}
            </button>` : x}
      ${this._report ? y`<ul class="report" role="status">
              <li>${E.suggest.filled(this._report.filled)}</li>
              ${this._report.empty.length > 0 ? y`<li>${E.suggest.empty(this._report.empty)}</li>` : x}
            </ul>` : x}
      ${e.length > 0 ? y`<p class="title">${E.suggest.warningsTitle}</p>
              <ul class="warnings">
                ${e.map((e) => y`<li>${e}</li>`)}
              </ul>` : x}
    `;
	}
	render() {
		if (!this._config) return x;
		let e = rr(this._config);
		return y`
      ${e.length > 0 ? y`<p class="error" role="alert">${e.join("; ")}</p>` : x}
      ${this._formDefined ? y`<ha-form
                class="switch"
                .hass=${this.hass}
                .data=${this._switch}
                .schema=${Hs}
                .computeLabel=${Us}
                @value-changed=${this._toggleAdvanced}
              ></ha-form>
              <ha-form
                .hass=${this.hass}
                .data=${this._shown}
                .schema=${this._formSchema}
                .computeLabel=${qs}
                @value-changed=${this._configChanged}
              ></ha-form>
              ${this._renderNotes()}` : y`<p class="hint">${E.noForm}</p>`}
    `;
	}
};
Bs([Va({ attribute: !1 })], $s.prototype, "hass", void 0), Bs([Va({ attribute: !1 })], $s.prototype, "schemaFor", void 0), Bs([Ha()], $s.prototype, "_config", void 0), Bs([Ha()], $s.prototype, "_switch", void 0), Bs([Ha()], $s.prototype, "_device", void 0), Bs([Ha()], $s.prototype, "_report", void 0), Bs([Ha()], $s.prototype, "_formDefined", void 0), Ua(Vs, $s);
// src/diagram/source.ts
var ec = o`
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
    ${yr}
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
`, tc = (e) => Math.round(e * 100) / 100, nc = 3, rc = (e) => e === !0 ? nc : e === void 0 || e === !1 || !(e > 0) ? void 0 : Math.min(6, Math.max(.5, 120 / e)), ic = 34, ac = [
	0,
	72,
	144,
	216,
	288
].map((e) => b`<path class="fan-blade" d="M0 -4 C9 -6 21 -16 17 -30 C6 -26 -3 -17 -3 -6 Z" transform="rotate(${e})" />`);
function oc(e, t, n, r, i) {
	let { x: a, y: o, width: s, height: c, fanX: l, fanY: u, fanRadius: d, coil: f, fins: p, slats: m, dividerY: h } = e, ee = rc(t), te = Array.from({ length: p.count }, (e, t) => tc(p.x + t * p.step)), ne = Array.from({ length: m.count }, (e, t) => tc(m.y0 + t * m.step)), [g, re] = [tc(a + 6), tc(l + d + 6)], ie = tc(l - d - 6 - g), ae = tc(d / ic), _ = vr(_r(hr, r), r?.onTap);
	return b`<g class="air-unit${n ? " muted" : ""}" data-source="air">
    <rect class="source-outline" x=${a} y=${o} width=${s} height=${c} rx="6" />
    <path class="source-divider" d="M${a} ${h} H${tc(a + s)}" />
    ${ne.map((e) => b`<path class="source-slat" data-slat d="M${g} ${e} h${ie} M${re} ${e} h${ie}" />`)}
    <rect class="source-frame" data-coil-block x=${f.x} y=${f.y} width=${f.width} height=${f.height} rx="3" />
    ${te.map((e) => b`<path class="source-fin" d="M${e} ${p.y0} V${p.y1}" />`)}
    <g class="fan-part" aria-label=${at} role=${_.role} tabindex=${_.tabindex} @click=${_.click} @keydown=${_.keydown}>
      <title>${at}</title>
      <circle class="fan-ring" cx=${l} cy=${u} r=${d} />
      <circle class="fan-hit" cx=${l} cy=${u} r=${d} fill="transparent" stroke="none" />
      <g class="fan" data-fan transform="translate(${l} ${u})${ae === 1 ? "" : ` scale(${String(ae)})`}">
        <g class=${ee === void 0 ? "fan-rotor still" : "fan-rotor"} style=${ee === void 0 ? "" : `--fan-duration: ${String(ee)}s`}>${ac}<circle class="fan-hub" r="5" fill="var(--primary-text-color)" /></g>
      </g>
    </g>
    ${i ? b`<text class="source-caption" x=${e.captionX} y=${e.captionY} text-anchor="middle">${Qe.air}</text>` : x}
  </g>`;
}
function sc(e, t) {
	return mi(e).flatMap(({ part: e }) => e.id.startsWith("src_") ? e.points.slice(1).flatMap((n, r) => {
		let i = e.points[r];
		return i?.[0] === n[0] && t >= Math.min(i[1], n[1]) && t <= Math.max(i[1], n[1]) ? [n[0]] : [];
	}) : []);
}
function cc(e, t, n, r) {
	let { groundLineX: i, groundCaption: a } = si(e), o = sc(e, n), s = Array.from({ length: Math.floor((i.end - i.start - 12) / 10) + 1 }, (e, t) => i.start + 6 + t * 10).filter((e) => !o.some((t) => Math.abs(t - e) < 10)), c = a.y[t];
	return b`<g class="ground-loop${r ? " muted" : ""}" data-source="ground">
    <path class="source-ground" d="M${i.start} ${n} H${i.end}" />
    ${s.map((e) => b`<path class="source-ground" d="M${e} ${n} l-6 8" />`)}
    ${e.captions === !1 ? x : b`<text class="source-caption" x=${a.x} y=${c} text-anchor="middle">${Qe.ground}</text>`}
  </g>`;
}
function lc(e, t, n, r) {
	let { airUnit: i, groundLineY: a } = si(e), o = e.source === "air" || e.source === "hybrid", s = e.source === "ground" || e.source === "hybrid", c = e.source === "hybrid" ? "hybrid" : "ground";
	return b`<g class="source" data-source-kind=${e.source}>
    ${o ? oc(i, t["source.fan_speed"], !n, r, e.captions !== !1) : b``}
    ${s ? cc(e, c, a[c], !n) : b``}
  </g>`;
}
// src/lib/render.ts
function uc(e, t) {
	return e === t || Array.isArray(e) && Array.isArray(t) && e.length === t.length && e.every((e, n) => e === t[n]);
}
function dc(e, t) {
	if (e === t) return !0;
	if (typeof e != "object" || typeof t != "object" || e === null || t === null) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	return n.length === r.length && n.every((n) => Object.hasOwn(t, n) && uc(e[n], t[n]));
}
function fc(e, t, n) {
	return e === void 0 || e.locale !== t.locale || e.language !== t.language || e.localize !== t.localize || e.formatEntityState !== t.formatEntityState || e.themes?.darkMode !== t.themes?.darkMode || n.some((n) => e.states[n] !== t.states[n] || !dc(e.entities?.[n], t.entities?.[n]));
}
function pc(e, t, n, r) {
	return e.size === 1 && e.has("hass") ? t !== void 0 && fc(n, t, r) : !0;
}
// src/suggest/stub.ts
function mc(e, t, n) {
	let r = bo(e.states, t, e.devices ?? {}, n), i = Co(r).replace(/_$/, "");
	if (i === "") return;
	let a = new Set(r.map((e) => e.entityId));
	return k.filter((e) => a.has(kt(e, i))).length * 2 >= k.length ? i : void 0;
}
function hc(e) {
	if (e === void 0) return {};
	let t = /* @__PURE__ */ new Map();
	for (let n of Object.values(e.entities ?? {})) {
		if (typeof n.device_id != "string") continue;
		let e = t.get(n.device_id) ?? {};
		e[n.entity_id] = n, t.set(n.device_id, e);
	}
	let n = [...t].flatMap(([t, n]) => mc(e, n, t) ?? []);
	return n.length === 1 ? { prefix: n[0] } : {};
}
// src/card/ecogeo-card.ts
var gc = "ecogeo-card", _c = 0;
Ua(gc, class extends We {
	static {
		this.styles = [
			oa,
			ec,
			ga,
			Aa,
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
			width: { state: !0 },
			viewportHeight: { state: !0 },
			isPanel: { attribute: !1 },
			layout: { attribute: !1 }
		};
	}
	static getConfigElement() {
		return document.createElement(Vs);
	}
	static getStubConfig(e) {
		return hc(e);
	}
	constructor() {
		super(), this.renderedCompact = !1, this.renderedAutoCompact = !1, this.renderedStroke = Ni(void 0), this.renderedDrawing = 0, this.entityIds = [], this.idPrefix = `ecogeo${String(++_c)}`, this.onWindowResize = () => {
			this.inPanel && window.innerHeight !== this.viewportHeight && (this.viewportHeight = window.innerHeight);
		}, this.width = 0, this.viewportHeight = window.innerHeight;
	}
	get inPanel() {
		return this.isPanel === !0 || this.layout === "panel";
	}
	cssPx(e) {
		let t = Number.parseFloat(getComputedStyle(this).getPropertyValue(e));
		return Number.isFinite(t) ? t : void 0;
	}
	drawingWidthFor(e) {
		return Pi({
			isPanel: this.inPanel,
			cardWidth: this.width,
			windowHeight: window.innerHeight,
			headerHeight: this.inPanel ? this.cssPx("--header-height") : void 0,
			safeAreaTop: this.inPanel ? this.cssPx("--safe-area-inset-top") : void 0,
			viewBox: e
		});
	}
	layoutWidth() {
		return this.drawingWidthFor(oi(this.resolved?.detail ?? "simplified", "full").viewBox);
	}
	get shownLayout() {
		return Oi(this.resolved?.layout ?? "auto", this.layoutWidth(), this.renderedAutoCompact) ? "compact" : "full";
	}
	connectedCallback() {
		super.connectedCallback(), this.observer = new ResizeObserver((e) => {
			let t = e.at(-1)?.contentRect.width;
			t !== void 0 && t !== this.width && (this.width = t);
		}), this.observer.observe(this), window.addEventListener("resize", this.onWindowResize), this.viewportHeight = window.innerHeight;
	}
	disconnectedCallback() {
		this.observer?.disconnect(), this.observer = void 0, window.removeEventListener("resize", this.onWindowResize), super.disconnectedCallback();
	}
	setConfig(e) {
		let t = rr(e);
		if (t.length > 0) throw Error(t.join("; "));
		this.resolved = dr(e), this.entityIds = [...new Set(Object.values(this.resolved.entities).filter((e) => e !== void 0))], this.config = e;
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
		if (e.size > 0 && [...e.keys()].every((e) => e === "width" || e === "viewportHeight" || e === "isPanel" || e === "layout")) {
			let e = this.shownLayout, t = Ni(this.drawingWidthFor(this.arrangementViewBox(e)));
			return e === "compact" !== this.renderedCompact || this.fittedWidth(e) !== this.renderedDrawing || t.pipe !== this.renderedStroke.pipe || t.outline !== this.renderedStroke.outline;
		}
		return pc(e, this.hass, this.renderedHass, this.entityIds);
	}
	arrangementViewBox(e) {
		return oi(e === "compact" ? "simplified" : this.resolved?.detail ?? "simplified", e).viewBox;
	}
	fittedWidth(e) {
		if (!this.inPanel || !(this.width > 0)) return 0;
		let t = this.drawingWidthFor(this.arrangementViewBox(e));
		return t < this.width ? t : 0;
	}
	readings(e) {
		let t = e.sample ? cr : this.hass?.states ?? {};
		return {
			readings: Nt(t, e.entities),
			offline: Bt(pt(t, e.entities["unit.connection"]))
		};
	}
	render() {
		this.renderedHass = this.hass;
		let e = this.shownLayout, t = e === "compact";
		this.renderedCompact = t, this.renderedAutoCompact = t && this.resolved?.layout === "auto";
		let n = Ni(this.drawingWidthFor(this.arrangementViewBox(e)));
		this.renderedStroke = n;
		let r = this.fittedWidth(e);
		this.renderedDrawing = r;
		let i = this.resolved;
		if (i === void 0) return y`<ha-card data-layout=${e}><div class="diagram"></div></ha-card>`;
		let a = t ? "simplified" : i.detail, o = oi(a, e), { viewBox: s } = o, c = t ? {
			...i,
			detail: a,
			captions: !1,
			arrangement: o
		} : {
			...i,
			arrangement: o
		}, { readings: l, offline: u } = this.readings(c), d = zt(l, c.features, c.states), f = Ht(d, c.features, c.dhw, l, !c.notPresent.has("brine.pump")), p = c.sample ? cr : this.hass?.states ?? {}, m = Ft(l, c.entities, p), h = {
			mode: d,
			circuits: f,
			readings: m,
			stops: c.colors
		}, ee = {
			locale: ya(this.hass),
			entities: this.hass?.entities,
			states: p
		}, te = c.sample ? void 0 : (e) => {
			mt(this, e);
		}, ne = {
			entities: c.entities,
			onTap: te
		};
		return y`<ha-card data-layout=${e}>
      <div class="diagram" style=${r > 0 ? `max-width: ${String(r)}px; margin: 0 auto` : x}>
        <svg
          viewBox="0 0 ${s.width} ${s.height}"
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label=${qe}
          style="--dhw-tank-color: ${c.dhw === "unused" ? cn : Ji(h)}; --ecogeo-coil-muted: ${dn(this.hass?.themes?.darkMode === !0)}; --pipe-width: ${String(n.pipe)}; --outline-width: ${String(n.outline)}"
        >
          ${b`${lc(c, m, f.active.has("brine"), ne)}${_a(c, ne)}${ha(c, h, ne, {
			mode: c.exchangerFill,
			idPrefix: this.idPrefix
		}, n.pipe)}`}
        </svg>
        ${La(Ma(c, l, c.entities, ee, t, c.notPresent), te, s)}
      </div>
      <div class="footer">
        <span class="mode">${Ye[d]}</span>
        ${Ra(Pa(l, c.entities, ee, t, c.notPresent), te)}
        ${Vt(l["unit.alarm"]) ? y`<span class="alarm">${Xe.alarm}</span>` : x}
        ${u ? y`<span class="offline">${Xe.offline}</span>` : x}
        ${c.sample ? y`<span class="sample">${Xe.sampleValues}</span>` : x}
      </div>
    </ha-card>`;
	}
});
// src/index.ts
var vc = {
	type: gc,
	...Ke,
	preview: !0
};
function yc(e = window) {
	let t = e.customCards ??= [];
	t.some((e) => e.type === vc.type) || t.push({ ...vc });
}
yc();
export { vc as CARD_ENTRY, yc as registerCardPicker };
