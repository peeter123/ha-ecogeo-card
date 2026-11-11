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
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: m } = Object, ee = globalThis, te = ee.trustedTypes, ne = te ? te.emptyScript : "", re = ee.reactiveElementPolyfillSupport, h = (e, t) => e, g = {
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
}, ie = (e, t) => !l(e, t), ae = {
	attribute: !0,
	type: String,
	converter: g,
	reflect: !1,
	useDefault: !1,
	hasChanged: ie
};
Symbol.metadata ??= Symbol("metadata"), ee.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
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
		if (this.hasOwnProperty(h("elementProperties"))) return;
		let e = m(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(h("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(h("properties"))) {
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
			let i = (n.converter?.toAttribute === void 0 ? g : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? g : e.converter;
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
_.elementStyles = [], _.shadowRootOptions = { mode: "open" }, _[h("elementProperties")] = /* @__PURE__ */ new Map(), _[h("finalized")] = /* @__PURE__ */ new Map(), re?.({ ReactiveElement: _ }), (ee.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var oe = globalThis, se = (e) => e, ce = oe.trustedTypes, le = ce ? ce.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, ue = "$lit$", v = `lit$${Math.random().toFixed(9).slice(2)}$`, de = "?" + v, fe = `<${de}>`, y = document, b = () => y.createComment(""), pe = (e) => e === null || typeof e != "object" && typeof e != "function", me = Array.isArray, he = (e) => me(e) || typeof e?.[Symbol.iterator] == "function", ge = "[ 	\n\f\r]", x = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, _e = /-->/g, ve = />/g, S = RegExp(`>|${ge}(?:([^\\s"'>=/]+)(${ge}*=${ge}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), ye = /'/g, be = /"/g, xe = /^(?:script|style|textarea|title)$/i, Se = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), C = Se(1), w = Se(2), T = Symbol.for("lit-noChange"), E = Symbol.for("lit-nothing"), Ce = /* @__PURE__ */ new WeakMap(), D = y.createTreeWalker(y, 129);
function we(e, t) {
	if (!me(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return le === void 0 ? t : le.createHTML(t);
}
var Te = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = x;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === x ? c[1] === "!--" ? o = _e : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = S) : (xe.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = S) : o = ve : o === S ? c[0] === ">" ? (o = i ?? x, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? S : c[3] === "\"" ? be : ye) : o === be || o === ye ? o = S : o === _e || o === ve ? o = x : (o = S, i = void 0);
		let d = o === S && e[t + 1].startsWith("/>") ? " " : "";
		a += o === x ? n + fe : l >= 0 ? (r.push(s), n.slice(0, l) + ue + n.slice(l) + v + d) : n + v + (l === -2 ? t : d);
	}
	return [we(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Ee = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = Te(t, n);
		if (this.el = e.createElement(l, r), D.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = D.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(ue)) {
					let t = u[o++], n = i.getAttribute(e).split(v), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Ae : r[1] === "?" ? je : r[1] === "@" ? Me : ke
					}), i.removeAttribute(e);
				} else e.startsWith(v) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (xe.test(i.tagName)) {
					let e = i.textContent.split(v), t = e.length - 1;
					if (t > 0) {
						i.textContent = ce ? ce.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], b()), D.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], b());
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
		let n = y.createElement("template");
		return n.innerHTML = e, n;
	}
};
function O(e, t, n = e, r) {
	if (t === T) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = pe(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = O(e, i._$AS(e, t.values), i, r)), t;
}
var De = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? y).importNode(t, !0);
		D.currentNode = r;
		let i = D.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Oe(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Ne(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = D.nextNode(), a++);
		}
		return D.currentNode = y, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, Oe = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = E, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = O(this, e, t), pe(e) ? e === E || e == null || e === "" ? (this._$AH !== E && this._$AR(), this._$AH = E) : e !== this._$AH && e !== T && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? he(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== E && pe(this._$AH) ? this._$AA.nextSibling.data = e : this.T(y.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Ee.createElement(we(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new De(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = Ce.get(e.strings);
		return t === void 0 && Ce.set(e.strings, t = new Ee(e)), t;
	}
	k(t) {
		me(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(b()), this.O(b()), this, this.options)) : r = n[i], r._$AI(a), i++;
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
}, ke = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = E, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = E;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = O(this, e, t, 0), a = !pe(e) || e !== this._$AH && e !== T, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = O(this, r[n + o], t, o), s === T && (s = this._$AH[o]), a ||= !pe(s) || s !== this._$AH[o], s === E ? e = E : e !== E && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === E ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Ae = class extends ke {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === E ? void 0 : e;
	}
}, je = class extends ke {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== E);
	}
}, Me = class extends ke {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = O(this, e, t, 0) ?? E) === T) return;
		let n = this._$AH, r = e === E && n !== E || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== E && (n === E || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Ne = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		O(this, e);
	}
}, Pe = oe.litHtmlPolyfillSupport;
Pe?.(Ee, Oe), (oe.litHtmlVersions ??= []).push("3.3.3");
var Fe = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Oe(t.insertBefore(b(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Ie = globalThis, Le = class extends _ {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Fe(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return T;
	}
};
Le._$litElement$ = !0, Le.finalized = !0, Ie.litElementHydrateSupport?.({ LitElement: Le });
var Re = Ie.litElementPolyfillSupport;
Re?.({ LitElement: Le }), (Ie.litElementVersions ??= []).push("4.2.2");
// src/calc/mode.ts
var ze = [
	"off",
	"unavailable",
	"unknown"
], Be = (e, t) => e?.trim().toLowerCase() === t, Ve = (e) => e !== void 0 && e > 0;
function He(e, t) {
	if (Be(e["unit.on_off"], "off")) return "off";
	if (Be(e["compressor.mode"], "defrost")) return "defrost";
	let n = e["compressor.speed"];
	if (n === void 0) return "standby";
	let r = e["unit.summer"] === !0;
	return Ve(n) ? e["dhw.demand"] === !0 ? "dhw" : r && t.active_cooling === !0 ? "active_cooling" : "heating" : r && Ve(e["production.pump"]) && t.passive_cooling === !0 ? "passive_cooling" : "standby";
}
function Ue(e) {
	return e !== void 0 && ze.includes(e.state.trim().toLowerCase());
}
var We = (e) => e === !0;
// src/calc/circuits.ts
function Ge(e, t, n, r) {
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
	return Ve(r["brine.pump"]) || i.delete("brine"), {
		valve26: e === "dhw" ? "dhw" : "production",
		valve14: e === "active_cooling" ? "reversed" : "normal",
		valves2728: (e === "passive_cooling" || e === "defrost") && a ? "exchanger" : "closed",
		active: i
	};
}
// src/lib/availability.ts
var Ke = /* @__PURE__ */ new Set(["unknown", "unavailable"]), qe = -999, Je = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;
function Ye(e) {
	if (!Je.test(e)) return;
	let t = Number(e);
	return Number.isFinite(t) ? t + 0 : void 0;
}
function Xe(e) {
	if (e === void 0 || Ke.has(e.state)) return !0;
	let t = Ye(e.state);
	return t !== void 0 && t <= qe;
}
function Ze(e) {
	if (!(e === void 0 || Xe(e))) return Ye(e.state);
}
// src/lib/hass.ts
var Qe = (e, t) => t === void 0 ? void 0 : e[t];
function $e(e, t) {
	e.dispatchEvent(new CustomEvent("hass-more-info", {
		detail: { entityId: t },
		bubbles: !0,
		composed: !0
	}));
}
// src/lib/units.ts
var et = { scale: 1 }, tt = {
	scale: 5 / 9,
	offset: -32
}, nt = {
	temperature: /* @__PURE__ */ new Map([["°c", et], ["°f", tt]]),
	difference: /* @__PURE__ */ new Map([
		["k", et],
		["°c", et],
		["°f", tt]
	]),
	power: /* @__PURE__ */ new Map([["w", et], ["kw", { scale: 1e3 }]])
};
function rt(e) {
	return e.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase();
}
function it(e, t) {
	let n = Ze(e);
	return n === void 0 ? void 0 : at(t, n, e?.attributes.unit_of_measurement);
}
function at(e, t, n) {
	if (!Number.isFinite(t) || n === void 0) return;
	let r = nt[e].get(rt(n));
	return r ? (t + (r.offset ?? 0)) * r.scale : void 0;
}
// src/strings.ts
var k = {
	invalid: (e, t) => `Invalid option ${e}: expected ${t}`,
	number: (e, t) => `a number from ${e} to ${t}`,
	color: "a CSS colour such as #db4437 or rgb(219, 68, 55)",
	boolean: "true or false",
	object: "a group of options",
	choice: (e) => `one of ${e.join(", ")}`,
	list: "a list of texts"
}, ot = {
	name: "ecoGEO Schematic",
	description: "The internal schematic of an Ecoforest ecoGEO heat pump, with live values and pipes coloured by temperature."
}, st = "ecoGEO heat pump schematic", A = {
	celsius: "°C",
	kelvin: "K",
	bar: "bar",
	percent: "%",
	rpm: "rpm",
	watt: "W"
}, ct = {
	off: "Off",
	defrost: "Defrost",
	dhw: "DHW",
	active_cooling: "Active cooling",
	heating: "Heating",
	passive_cooling: "Passive cooling",
	standby: "Standby"
}, lt = {
	alarm: "Alarm",
	offline: "Offline",
	sampleValues: "Sample values"
}, j = {
	unknownOption: (e) => `Unknown option ${e}`,
	unknownFeature: (e, t) => `Unknown feature ${e}: expected one of ${t.join(", ")}`,
	unknownRole: (e) => `Unknown entity role ${e}`,
	notEntityId: (e) => `Invalid entity for ${e}: expected an entity id such as sensor.name`,
	featureState: (e) => `Invalid option features.${e}: expected true, false or unused`,
	integer: (e, t) => `a whole number from ${e} to ${t}`,
	prefix: "a prefix of lowercase letters, digits and underscores",
	colors: "Invalid option colors: expected an ascending list of 2 to 8 stops, each { temperature, color } with a number and a CSS colour",
	dhwMismatch: (e, t) => `Invalid option dhw: ${e} does not fit model ${t}`
}, ut = {
	dg1: "DG1",
	outerLoop: "Outer loop",
	dhw: "DHW"
}, dt = {
	air: "Air unit",
	ground: "Ground loop"
}, ft = {
	externalTank: "DHW tank",
	demand: "Demand"
}, pt = { demand: "Demand" }, M = {
	setpoint: "Setpoint",
	startDelta: "Start ΔT",
	fan: "Fan",
	outside: "Outside",
	airOutlet: "Outlet",
	groundIn: "In",
	groundOut: "Out"
}, N = {
	outside: "Outside",
	cop: "COP",
	condensation: "Condensation",
	evaporation: "Evaporation",
	summer: "Summer",
	winter: "Winter"
}, mt = {
	on: "On",
	off: "Off",
	emergency: "Emergency"
}, ht = {
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
}, gt = (e) => {
	let t = ht[e];
	return t === void 0 ? "" : `${t} (${String(e)})`;
}, _t = "Air unit fan", P = A.celsius, vt = [
	{
		path: "production.outlet_temperature",
		domain: "sensor",
		suffix: "production_out",
		kind: "number",
		quantity: "temperature",
		unit: P,
		decimals: 1,
		item: "33"
	},
	{
		path: "production.return_temperature",
		domain: "sensor",
		suffix: "production_in",
		kind: "number",
		quantity: "temperature",
		unit: P,
		decimals: 1,
		item: "34"
	},
	{
		path: "production.pressure",
		domain: "sensor",
		suffix: "pressure_production",
		kind: "number",
		unit: A.bar,
		decimals: 1,
		item: "38"
	},
	{
		path: "production.pump",
		domain: "sensor",
		suffix: "production_pump",
		kind: "number",
		unit: A.percent,
		decimals: 1,
		item: "15"
	},
	{
		path: "brine.outlet_temperature",
		domain: "sensor",
		suffix: "brine_out",
		kind: "number",
		quantity: "temperature",
		unit: P,
		decimals: 1,
		item: "31"
	},
	{
		path: "brine.inlet_temperature",
		domain: "sensor",
		suffix: "brine_in",
		kind: "number",
		quantity: "temperature",
		unit: P,
		decimals: 1,
		item: "32"
	},
	{
		path: "brine.pressure",
		domain: "sensor",
		suffix: "pressure_brine",
		kind: "number",
		unit: A.bar,
		decimals: 1,
		item: "37"
	},
	{
		path: "brine.pump",
		domain: "sensor",
		suffix: "brine_pump",
		kind: "number",
		unit: A.percent,
		decimals: 1,
		item: "16"
	},
	{
		path: "compressor.speed",
		domain: "sensor",
		suffix: "compressor_rpm",
		kind: "number",
		unit: A.rpm,
		decimals: 0,
		item: "11"
	},
	{
		path: "compressor.percentage",
		domain: "sensor",
		suffix: "compressor_percentage",
		kind: "number",
		unit: A.percent,
		decimals: 1,
		item: "11"
	},
	{
		path: "compressor.power",
		domain: "sensor",
		suffix: "power_consumption",
		kind: "number",
		quantity: "power",
		unit: A.watt,
		decimals: 0,
		item: "11"
	},
	{
		path: "compressor.suction_temperature",
		domain: "sensor",
		suffix: "compressor_suction_temperature",
		kind: "number",
		quantity: "temperature",
		unit: P,
		decimals: 1,
		item: "29"
	},
	{
		path: "compressor.discharge_temperature",
		domain: "sensor",
		suffix: "compressor_discharge_temperature",
		kind: "number",
		quantity: "temperature",
		unit: P,
		decimals: 1,
		item: "30"
	},
	{
		path: "compressor.suction_pressure",
		domain: "sensor",
		suffix: "compressor_suction_pressure",
		kind: "number",
		unit: A.bar,
		decimals: 1,
		item: "35"
	},
	{
		path: "compressor.discharge_pressure",
		domain: "sensor",
		suffix: "compressor_discharge_pressure",
		kind: "number",
		unit: A.bar,
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
		unit: P,
		decimals: 1,
		item: "8"
	},
	{
		path: "refrigerant.evaporation_temperature",
		domain: "sensor",
		suffix: "evaporation_temperature",
		kind: "number",
		quantity: "temperature",
		unit: P,
		decimals: 1,
		item: "7"
	},
	{
		path: "refrigerant.superheat",
		domain: "sensor",
		suffix: "superheat",
		kind: "number",
		quantity: "difference",
		unit: A.kelvin,
		decimals: 1,
		item: "12"
	},
	{
		path: "refrigerant.expansion_valve",
		domain: "sensor",
		suffix: "expansion_valve_position",
		kind: "number",
		unit: A.percent,
		decimals: 0,
		item: "12"
	},
	{
		path: "heating.capacity",
		domain: "sensor",
		suffix: "condensation_capacity",
		kind: "number",
		quantity: "power",
		unit: A.watt,
		decimals: 0,
		item: "8"
	},
	{
		path: "cooling.capacity",
		domain: "sensor",
		suffix: "evaporation_capacity",
		kind: "number",
		quantity: "power",
		unit: A.watt,
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
		unit: P,
		decimals: 1,
		item: "1/2"
	},
	{
		path: "dhw.temperature",
		domain: "sensor",
		suffix: "dhw_temperature",
		kind: "number",
		quantity: "temperature",
		unit: P,
		decimals: 1,
		item: "tank (54 on C)"
	},
	{
		path: "dhw.setpoint",
		domain: "number",
		suffix: "dhw_setpoint",
		kind: "number",
		quantity: "temperature",
		unit: P,
		decimals: 0,
		item: "tank"
	},
	{
		path: "dhw.start_delta",
		domain: "number",
		suffix: "delta_t_start_dhw",
		kind: "number",
		quantity: "difference",
		unit: A.kelvin,
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
		unit: A.percent,
		decimals: 1,
		item: "air unit"
	},
	{
		path: "source.air_unit_outlet_temperature",
		domain: "sensor",
		suffix: "brine_temperature_air_unit_outlet",
		kind: "number",
		quantity: "temperature",
		unit: P,
		decimals: 1,
		item: "air unit"
	},
	{
		path: "source.outside_temperature",
		domain: "sensor",
		suffix: "outside_temperature",
		kind: "number",
		quantity: "temperature",
		unit: P,
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
], yt = new Map(vt.map((e) => [e.path, e])), bt = vt.map((e) => e.path);
[...new Set(vt.flatMap((e) => "unit" in e ? [e.unit] : []))];
var xt = (e, t) => `${e.domain}.${t}_${e.suffix}`;
// src/calc/readings.ts
function St(e, t) {
	return t.quantity === void 0 ? Ze(e) : it(e, t.quantity);
}
function Ct(e, t) {
	switch (t.kind) {
		case "number": return St(e, t);
		case "text": return e === void 0 || Xe(e) || ["unavailable", "unknown"].includes(e.state.trim().toLowerCase()) ? void 0 : e.state.trim();
		case "binary": {
			let t = e?.state.trim().toLowerCase();
			return t === "on" || t !== "off" && void 0;
		}
	}
}
function wt(e, t) {
	return Object.fromEntries(vt.map((n) => [n.path, Ct(Qe(e, t[n.path]), n)]));
}
// src/lib/config.ts
var Tt = /^[a-z][a-z0-9_]*\.[a-z0-9_]+$/;
function F(e, t) {
	let n = e;
	for (let e of t.split(".")) {
		if (typeof n != "object" || !n || !Object.hasOwn(n, e)) return;
		n = n[e];
	}
	return n;
}
function Et(e) {
	if (typeof e != "string") return;
	let t = e.trim();
	return Tt.test(t) ? t : void 0;
}
function Dt(e, t) {
	return Et(F(e, t));
}
// src/lib/options.ts
var Ot = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, kt = /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|var)\((.*)\)$/i, At = /^[#a-zA-Z0-9(),.%\s/+-]+$/, jt = /* @__PURE__ */ new Set(/* @__PURE__ */ "aliceblue.antiquewhite.aqua.aquamarine.azure.beige.bisque.black.blanchedalmond.blue.blueviolet.brown.burlywood.cadetblue.chartreuse.chocolate.coral.cornflowerblue.cornsilk.crimson.cyan.darkblue.darkcyan.darkgoldenrod.darkgray.darkgreen.darkgrey.darkkhaki.darkmagenta.darkolivegreen.darkorange.darkorchid.darkred.darksalmon.darkseagreen.darkslateblue.darkslategray.darkslategrey.darkturquoise.darkviolet.deeppink.deepskyblue.dimgray.dimgrey.dodgerblue.firebrick.floralwhite.forestgreen.fuchsia.gainsboro.ghostwhite.gold.goldenrod.gray.green.greenyellow.grey.honeydew.hotpink.indianred.indigo.ivory.khaki.lavender.lavenderblush.lawngreen.lemonchiffon.lightblue.lightcoral.lightcyan.lightgoldenrodyellow.lightgray.lightgreen.lightgrey.lightpink.lightsalmon.lightseagreen.lightskyblue.lightslategray.lightslategrey.lightsteelblue.lightyellow.lime.limegreen.linen.magenta.maroon.mediumaquamarine.mediumblue.mediumorchid.mediumpurple.mediumseagreen.mediumslateblue.mediumspringgreen.mediumturquoise.mediumvioletred.midnightblue.mintcream.mistyrose.moccasin.navajowhite.navy.oldlace.olive.olivedrab.orange.orangered.orchid.palegoldenrod.palegreen.paleturquoise.palevioletred.papayawhip.peachpuff.peru.pink.plum.powderblue.purple.rebeccapurple.red.rosybrown.royalblue.saddlebrown.salmon.sandybrown.seagreen.seashell.sienna.silver.skyblue.slateblue.slategray.slategrey.snow.springgreen.steelblue.tan.teal.thistle.tomato.turquoise.violet.wheat.white.whitesmoke.yellow.yellowgreen.transparent.currentcolor".split("."));
function Mt(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) if (e[n] === "(" && t++, e[n] === ")" && (t--, t < 0 || t === 0 && n !== e.length - 1)) return !1;
	return t === 0;
}
function Nt(e) {
	let t = e.trim();
	if (t.length === 0 || t.length > 100 || !At.test(t)) return !1;
	if (Ot.test(t) || jt.has(t.toLowerCase())) return !0;
	let n = kt.exec(t);
	if (n === null || !Mt(t)) return !1;
	if (n[1]?.toLowerCase() !== "var") return !0;
	let [r, ...i] = (n[2] ?? "").split(",");
	return /^\s*--[a-zA-Z0-9-]+\s*$/.test(r ?? "") && (i.length === 0 || Nt(i.join(",")));
}
var Pt = (e) => e == null;
function Ft(e) {
	switch (e.kind) {
		case "number": return k.number(String(e.min), String(e.max));
		case "color": return k.color;
		case "boolean": return k.boolean;
		case "choice": return k.choice(e.choices);
		case "list": return k.list;
	}
}
var It = (e) => e === null || [
	"string",
	"number",
	"boolean"
].includes(typeof e);
function Lt(e) {
	return e.map((e) => typeof e == "boolean" ? e ? "on" : "off" : e === null ? "" : String(e)).filter((e) => e.trim() !== "");
}
function Rt(e, t) {
	switch (e.kind) {
		case "number": return typeof t == "number" && Number.isFinite(t) && t >= e.min && t <= e.max;
		case "color": return typeof t == "string" && Nt(t);
		case "boolean": return typeof t == "boolean";
		case "choice": return typeof t == "string" && e.choices.includes(t);
		case "list": return Array.isArray(t) && t.every(It);
	}
}
function zt(e, t) {
	let n = t.split(".").slice(0, -1);
	for (let t = 1; t <= n.length; t++) {
		let r = n.slice(0, t).join("."), i = F(e, r);
		if (!Pt(i) && (typeof i != "object" || Array.isArray(i))) return r;
	}
}
function Bt(e, t) {
	let n = t.flatMap((t) => {
		let n = zt(e, t.path);
		if (n !== void 0) return [k.invalid(n, k.object)];
		let r = F(e, t.path);
		return Pt(r) || Rt(t, r) ? [] : [k.invalid(t.path, Ft(t))];
	});
	return [...new Set(n)];
}
function I(e, t) {
	let n = F(e, t.path);
	if (t.kind === "list" && Array.isArray(n) && Rt(t, n)) {
		let e = Lt(n);
		return e.length > 0 ? e : t.default;
	}
	return Pt(n) || !Rt(t, n) ? t.default : n;
}
// src/diagram/colors.ts
var Vt = [
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
], Ht = "var(--disabled-text-color)", Ut = (e) => typeof e == "object" && !!e && !Array.isArray(e), Wt = (e) => typeof e == "string" && Bt({ color: e }, [{
	kind: "color",
	path: "color",
	default: ""
}]).length === 0, Gt = (e) => e.map((e) => ({
	temperature: e.temperature,
	color: e.color.trim()
}));
function Kt(e) {
	let t = F(e, "colors");
	if (t == null) return [];
	if (!Array.isArray(t) || t.length < 2 || t.length > 8) return [j.colors];
	let n = t;
	if (!n.every((e) => Ut(e) && typeof e.temperature == "number" && Number.isFinite(e.temperature) && Wt(e.color))) return [j.colors];
	let r = Gt(n).map((e) => e.temperature);
	return r.every((e, t) => t === 0 || e > (r[t - 1] ?? 0)) ? [] : [j.colors];
}
function qt(e) {
	let t = F(e, "colors");
	return Array.isArray(t) && Kt(e).length === 0 ? Gt(t) : Vt;
}
function Jt(e, t = Vt) {
	let n = t[0], r = t[t.length - 1];
	if (e === void 0 || !Number.isFinite(e) || n === void 0 || r === void 0) return Ht;
	if (e <= n.temperature) return n.color;
	if (e >= r.temperature) return r.color;
	let i = t.findIndex((t) => t.temperature >= e), a = t[i - 1], o = t[i];
	if (a === void 0 || o === void 0) return r.color;
	let s = Math.round((e - a.temperature) / (o.temperature - a.temperature) * 1e3) / 10;
	return s <= 0 ? a.color : s >= 100 ? o.color : `color-mix(in srgb, ${o.color} ${String(s)}%, ${a.color})`;
}
// src/config/variants.ts
var Yt = [
	"active_cooling",
	"passive_cooling",
	"htr",
	"backup_heater"
], L = [
	1,
	2,
	3,
	4
];
function Xt(e) {
	return {
		active_cooling: e === 3 || e === 4,
		passive_cooling: e === 2 || e === 4,
		htr: !0,
		backup_heater: !0
	};
}
function Zt(e, t) {
	return {
		...Xt(e),
		...t
	};
}
// src/config/options.ts
var Qt = ["B", "C"], $t = [
	"air",
	"ground",
	"hybrid"
], en = [
	"external",
	"internal",
	"none"
], tn = ["simplified", "full"], nn = {
	kind: "choice",
	path: "model",
	default: "B",
	choices: Qt
}, rn = {
	kind: "choice",
	path: "source",
	default: "ground",
	choices: $t
}, an = {
	kind: "choice",
	path: "dhw",
	default: "external",
	choices: en
}, on = {
	kind: "choice",
	path: "detail",
	default: "simplified",
	choices: tn
}, sn = {
	kind: "choice",
	path: "exchanger_fill",
	default: "gradient",
	choices: ["gradient", "none"]
}, cn = [
	nn,
	rn,
	an,
	on,
	sn
], ln = [
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
	"view_layout",
	"layout_options",
	"grid_options",
	"visibility"
], un = (e) => e === "C" ? "internal" : "external", R = (e) => e == null, dn = (e) => R(e) || typeof e == "string" && e.trim() === "", z = (e) => typeof e == "object" && !!e && !Array.isArray(e), fn = /^[a-z0-9_]+$/;
function pn(e) {
	let t = F(e, "prefix");
	return dn(t) ? void 0 : t.trim();
}
function mn(e) {
	let t = F(e, "variant");
	return L.find((e) => e === t) ?? 4;
}
function hn(e) {
	let t = I(e, nn), n = !R(F(e, "dhw"));
	return {
		model: t,
		source: I(e, rn),
		dhw: n ? I(e, an) : un(t)
	};
}
var gn = (e) => I(e, on), _n = (e) => I(e, sn);
function vn(e) {
	let t = F(e, "features");
	if (!z(t)) return {};
	let n = {};
	for (let e of Yt) {
		let r = t[e];
		(r === !0 || r === !1 || r === "unused") && (n[e] = r);
	}
	return n;
}
var yn = (e) => e === !0 || e === !1 || e === "unused";
function bn(e, t = "") {
	return Object.entries(e).flatMap(([e, n]) => {
		let r = t === "" ? e : `${t}.${e}`;
		return z(n) ? bn(n, r) : [[r, n]];
	});
}
function xn(e) {
	let t = F(e, "variant");
	return R(t) || L.some((e) => e === t) ? [] : [k.invalid("variant", j.integer(String(L[0]), String(L[L.length - 1])))];
}
function Sn(e) {
	let t = F(e, "prefix");
	return dn(t) || typeof t == "string" && fn.test(t.trim()) ? [] : [k.invalid("prefix", j.prefix)];
}
function Cn(e) {
	let t = F(e, "features");
	return R(t) ? [] : z(t) ? Object.entries(t).flatMap(([e, t]) => Yt.some((t) => t === e) ? R(t) || yn(t) ? [] : [j.featureState(e)] : [j.unknownFeature(e, Yt)]) : [k.invalid("features", k.object)];
}
function wn(e) {
	let t = F(e, "entities");
	return R(t) ? [] : z(t) ? bn(t).flatMap(([e, t]) => dn(t) ? [] : yt.has(e) ? Et(t) === void 0 ? [j.notEntityId(e)] : [] : [j.unknownRole(e)]) : [k.invalid("entities", k.object)];
}
function Tn(e) {
	let t = F(e, "entities");
	return z(t) && bn(t).some(([, e]) => !dn(e));
}
function En(e) {
	let t = Object.keys(e).filter((e) => !ln.includes(e)).map((e) => j.unknownOption(e)), n = Bt(e, cn), r = [
		...t,
		...n,
		...xn(e),
		...Sn(e),
		...Cn(e),
		...wn(e),
		...Kt(e)
	];
	if (Bt(e, [nn, an]).length === 0 && !R(F(e, "dhw"))) {
		let { model: t, dhw: n } = hn(e);
		(t === "B" && n === "internal" || t === "C" && n === "external") && r.push(j.dhwMismatch(n, t));
	}
	return r;
}
// src/config/sample.ts
var Dn = (e) => `ecogeo_sample.${e.replace(".", "_")}`, On = {
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
}, kn = "2026-01-01T12:00:00Z", An = Object.fromEntries(bt.map((e) => [e, Dn(e)])), jn = Object.fromEntries(bt.map((e) => {
	let t = yt.get(e)?.unit, n = Dn(e);
	return [n, {
		entity_id: n,
		state: On[e],
		last_updated: kn,
		attributes: t === void 0 ? {} : { unit_of_measurement: t }
	}];
}));
// src/config/resolve.ts
function Mn(e, t) {
	return Object.fromEntries(vt.map((n) => [n.path, Dt(e, `entities.${n.path}`) ?? (t === void 0 ? void 0 : xt(n, t))]));
}
var Nn = (e) => pn(e) === void 0 && !Tn(e);
function Pn(e) {
	let t = pn(e), n = mn(e), r = Nn(e);
	return {
		...hn(e),
		detail: gn(e),
		exchangerFill: _n(e),
		variant: n,
		prefix: t,
		colors: qt(e),
		features: Zt(n, vn(e)),
		entities: r ? An : Mn(e, t),
		sample: r
	};
}
// src/diagram/component-info.ts
var Fn = {
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
}, In = "source.fan_speed", Ln = "dhw.temperature", Rn = (e, t) => e === void 0 || t?.onTap === void 0 ? void 0 : t.entities[e];
function zn(e, t) {
	return e === void 0 || t === void 0 ? {
		role: E,
		tabindex: E,
		click: E,
		keydown: E
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
// src/diagram/geometry.ts
var Bn = {
	width: 1e3,
	height: 620
}, Vn = {
	x: 240,
	y: 130,
	width: 520,
	height: 475
}, B = {
	x: 408,
	y: 138,
	width: 182,
	height: 66
}, Hn = {
	x: 806,
	y: 150,
	width: 178,
	height: 180,
	dome: 14
}, Un = {
	x: 40,
	y: 120,
	width: 150,
	height: 180,
	fanX: 115,
	fanY: 250,
	fanRadius: 36,
	coil: {
		x: 60,
		y: 136,
		width: 100,
		height: 62
	},
	fins: {
		x: 74,
		step: 6,
		count: 13,
		y0: 140,
		y1: 194
	},
	slats: {
		y0: 218,
		step: 9,
		count: 8
	},
	dividerY: 206,
	captionX: 95,
	captionY: 112
}, Wn = {
	ground: 160,
	hybrid: 350
}, Gn = {
	x: 105,
	y: {
		ground: 320,
		hybrid: 510
	}
}, V = (e, t, n, r, i, a, o = {}) => ({
	item: e,
	kind: t,
	x: n,
	y: r,
	rotation: i,
	tag: a,
	...o
}), Kn = [
	V(1, "port", 270, 130, 0, [
		-7,
		-8,
		"end"
	]),
	V(2, "port", 312, 130, 0, [
		-7,
		-8,
		"end"
	]),
	V(3, "port", 630, 130, 0, [
		-7,
		-8,
		"end"
	]),
	V(4, "port", 690, 130, 0, [
		-7,
		-8,
		"end"
	]),
	V(5, "port", 722, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "external" }),
	V(6, "port", 748, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "external" }),
	V(47, "port", 440, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "internal" }),
	V(48, "port", 490, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "internal" }),
	V(49, "port", 540, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "internal" }),
	V(7, "exchanger", 572, 382, 0, [
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
	V(8, "exchanger", 432, 382, 0, [
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
	V(9, "exchanger", 373, 273, 0, [
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
	V(11, "compressor", 510, 250, 0, [
		0,
		-26,
		"middle"
	]),
	V(12, "expansion_valve", 527, 416, 0, [
		0,
		-14,
		"middle"
	]),
	V(13, "filter_dryer", 487, 416, 0, [
		0,
		-14,
		"middle"
	]),
	V(14, "inversion_valve", 430, 296, 0, [
		-16,
		22,
		"end"
	], { feature: "active_cooling" }),
	V(29, "probe_t", 542, 234, 0, [
		0,
		-14,
		"middle"
	]),
	V(30, "probe_t", 430, 234, 0, [
		0,
		-14,
		"middle"
	]),
	V(35, "transducer_p", 564, 234, 0, [
		0,
		-14,
		"middle"
	]),
	V(36, "transducer_p", 474, 234, 0, [
		0,
		-14,
		"middle"
	]),
	V(39, "pressure_switch", 586, 234, 0, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	V(40, "pressure_switch", 452, 234, 0, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	V(41, "service_outlet", 464, 406, 0, [
		0,
		28,
		"middle"
	], { detail: "full" }),
	V(41, "service_outlet", 620, 270, 90, [
		0,
		14,
		"middle"
	], { detail: "full" }),
	V(10, "exchanger", 520, 470, 0, [
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
	V(15, "pump", 385, 416, 0, [
		0,
		-19,
		"middle"
	]),
	V(16, "pump", 690, 300, 90, [
		19,
		4,
		"start"
	]),
	V(17, "pump", 340, 226, 90, [
		-14,
		4,
		"end"
	], {
		feature: "htr",
		dhw: "any"
	}),
	V(18, "vessel", 725, 520, 0, [
		-16,
		4,
		"end"
	], { detail: "full" }),
	V(19, "vessel", 368, 556, 0, [
		-16,
		4,
		"end"
	], { detail: "full" }),
	V(20, "safety_valve", 741, 440, 90, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	V(21, "safety_valve", 384, 520, 90, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	V(22, "valve", 340, 256, 0, [
		-10,
		4,
		"end"
	], {
		feature: "htr",
		dhw: "any"
	}),
	V(23, "drain_valve", 630, 572, 0, [
		14,
		4,
		"start"
	], { detail: "full" }),
	V(24, "drain_valve", 404, 572, 0, [
		14,
		4,
		"start"
	], { detail: "full" }),
	V(25, "drain_valve", 340, 318, 0, [
		-10,
		4,
		"end"
	], {
		feature: "htr",
		dhw: "any"
	}),
	V(26, "valve3", 270, 172, 270, [
		-14,
		22,
		"end"
	], { dhw: "any" }),
	V(27, "valve3", 350, 416, 0, [
		0,
		-24,
		"middle"
	], { feature: "passive_cooling" }),
	V(28, "valve3", 610, 416, 0, [
		0,
		-24,
		"middle"
	], { feature: "passive_cooling" }),
	V(31, "probe_t", 614, 228, 270, [
		0,
		-14,
		"middle"
	]),
	V(32, "probe_t", 674, 228, 270, [
		0,
		-14,
		"middle"
	]),
	V(33, "probe_t", 254, 228, 270, [
		0,
		-14,
		"middle"
	]),
	V(34, "probe_t", 296, 228, 270, [
		0,
		-14,
		"middle"
	]),
	V(37, "transducer_p", 709, 440, 270, [
		0,
		-14,
		"middle"
	]),
	V(38, "transducer_p", 352, 520, 270, [
		0,
		-14,
		"middle"
	]),
	V(44, "resistor", 270, 320, 90, [
		12,
		6,
		"start"
	], { feature: "backup_heater" }),
	V(45, "thermostat", 286, 282, 90, [
		0,
		-12,
		"middle"
	], { feature: "backup_heater" }),
	V(50, "tank", B.x + B.width / 2, B.y + B.height / 2, 0, [
		-80,
		-17,
		"start"
	], { dhw: "internal" }),
	V(51, "coil", 495, 185, 0, [
		0,
		-25,
		"middle"
	], { dhw: "internal" }),
	V(52, "service_outlet", 395, 162, 0, [
		-8,
		4,
		"end"
	], {
		dhw: "internal",
		detail: "full"
	}),
	V(53, "drain_valve", 599, 196, 270, [
		0,
		-12,
		"middle"
	], {
		dhw: "internal",
		detail: "full"
	}),
	V(54, "probe_t", 574, 171, 270, [
		0,
		-14,
		"middle"
	], { dhw: "internal" })
], qn = (e) => e.split(" ").map((e) => {
	let [t, n] = e.split(",").map(Number);
	return [t ?? 0, n ?? 0];
}), H = (e, t, n, r, i = {}) => ({
	id: e,
	circuit: t,
	points: qn(n),
	temperatureRole: r,
	direction: 1,
	...i
}), U = ["production_dg1"], W = ["production_dg1", "production_dhw"], G = "production.outlet_temperature", K = "production.return_temperature", q = "production.pump", J = "brine.inlet_temperature", Y = "brine.outlet_temperature", X = "brine.pump", Jn = "compressor.discharge_temperature", Yn = "compressor.suction_temperature", Xn = "refrigerant.condensation_temperature", Zn = "refrigerant.evaporation_temperature", Z = "compressor.percentage", Q = "dhw.temperature", Qn = "source.air_unit_outlet_temperature", $n = [
	"dhw_sup_b",
	"dhw_sup_c",
	"dhw_ret_b",
	"dhw_ret_c",
	"dhw_ext_in",
	"dhw_ext_coil",
	"dhw_ext_out"
], er = [
	H("p1_stub", U, "270,130 270,118", G, { stub: !0 }),
	H("p2_stub", U, "312,118 312,130", K, { stub: !0 }),
	H("p1_up", U, "270,160 270,130", G, {
		dhw: "any",
		speedRole: q
	}),
	H("p1_direct", U, "270,184 270,130", G, {
		dhw: "none",
		speedRole: q
	}),
	H("p2_in", U, "312,130 312,198", K, { speedRole: q }),
	H("prod_44_26", W, "270,292 270,184", G, { speedRole: q }),
	H("prod_bypass44", W, "270,348 270,292", G, {
		bypass: "backup_heater",
		speedRole: q
	}),
	H("prod_8_44", W, "420,348 270,348", G, { speedRole: q }),
	H("prod_15_8", W, "397,416 420,416", K, { speedRole: q }),
	H("trunk", W, "312,198 312,416", K, { speedRole: q }),
	H("prod_27_in", W, "312,416 338,416", K, {
		through: "passive_cooling",
		speedRole: q,
		onlyWhen: { valves2728: "closed" }
	}),
	H("prod_27_15", W, "362,416 373,416", K, {
		through: "passive_cooling",
		speedRole: q
	}),
	H("prod_bypass27", W, "312,416 373,416", K, {
		bypass: "passive_cooling",
		speedRole: q
	}),
	H("prod_10_in", ["exchanger_10"], "312,416 312,492 508,492", K, {
		feature: "passive_cooling",
		speedRole: q
	}),
	H("prod_10_out", ["exchanger_10"], "508,448 350,448 350,428", G, {
		feature: "passive_cooling",
		speedRole: q
	}),
	H("prod_tap_a", W, "368,416 368,520", K, { stub: !0 }),
	H("prod_tap_b", W, "368,520 368,544", K, {
		stub: !0,
		detail: "full"
	}),
	H("prod_drain", W, "404,416 404,563", K, {
		stub: !0,
		detail: "full"
	}),
	H("dhw_sup_a", ["production_dhw"], "282,172 361,172", G, {
		dhw: "any",
		speedRole: q
	}),
	H("dhw_sup_b", ["dhw_coil"], "361,172 420,172", G, {
		dhw: "any",
		speedRole: q
	}),
	H("dhw_sup_c", ["dhw_coil"], "420,172 722,172 722,130", G, {
		dhw: "external",
		speedRole: q
	}),
	H("dhw_ret_c", ["dhw_coil"], "748,130 748,198 420,198", K, {
		dhw: "external",
		speedRole: q
	}),
	H("dhw_ret_b", ["dhw_coil"], "420,198 340,198", K, {
		dhw: "any",
		speedRole: q
	}),
	H("dhw_ret_a", ["production_dhw"], "340,198 312,198", K, {
		dhw: "any",
		speedRole: q
	}),
	H("htr_in", ["htr"], "340,198 340,214", Q, {
		feature: "htr",
		dhw: "any"
	}),
	H("htr_pump", ["htr"], "340,238 340,247", Q, {
		feature: "htr",
		dhw: "any"
	}),
	H("htr_to_9", ["htr"], "340,265 340,296 361,296", Q, {
		feature: "htr",
		dhw: "any"
	}),
	H("htr_drain", ["htr"], "340,296 340,309", Q, {
		feature: "htr",
		dhw: "any",
		stub: !0
	}),
	H("htr_riser", ["htr"], "361,250 361,172", Q, {
		feature: "htr",
		dhw: "any"
	}),
	H("dhw_ext_in", ["dhw_coil"], "722,130 722,50 940,50 940,212", G, {
		dhw: "external",
		speedRole: q
	}),
	H("dhw_ext_coil", ["dhw_coil"], "940,212 840,296", G, {
		dhw: "external",
		speedRole: q,
		shape: {
			kind: "helix",
			cx: 890,
			top: 212,
			bottom: 296,
			rx: 50,
			turns: 4.5
		}
	}),
	H("dhw_ext_out", ["dhw_coil"], "840,296 820,296 820,85 748,85 748,130", K, {
		dhw: "external",
		speedRole: q
	}),
	H("tap_47", ["dhw_coil"], "440,118 440,138", Q, {
		dhw: "internal",
		stub: !0
	}),
	H("tap_48", ["dhw_coil"], "490,138 490,118", Q, {
		dhw: "internal",
		stub: !0
	}),
	H("tap_49", ["dhw_coil"], "540,118 540,138", Q, {
		dhw: "internal",
		stub: !0
	}),
	H("src_out", ["brine"], "630,130 630,85 150,85", Y, { speedRole: X }),
	H("src_in", ["brine"], "20,50 690,50 690,130", J, { speedRole: X }),
	H("src_air_feed", ["brine"], "150,85 150,150", Y, {
		source: ["air", "hybrid"],
		speedRole: X
	}),
	H("src_air_coil", ["brine"], "150,150 70,150 70,168 150,168 150,186 70,186", Y, {
		source: ["air", "hybrid"],
		speedRole: X,
		bend: 9
	}),
	H("src_air_exit", ["brine"], "70,186 20,186 20,50", Qn, {
		source: ["air"],
		speedRole: X
	}),
	H("src_gnd_feed", ["brine"], "150,85 150,210", Y, {
		source: ["ground"],
		speedRole: X
	}),
	H("src_gnd_loop", ["brine"], "150,210 60,210 60,250 150,250 150,290 20,290", Y, {
		source: ["ground"],
		speedRole: X
	}),
	H("src_gnd_exit", ["brine"], "20,290 20,50", J, {
		source: ["ground"],
		speedRole: X
	}),
	H("src_hyb_link", ["brine"], "70,186 29,186 29,390", Qn, {
		source: ["hybrid"],
		speedRole: X
	}),
	H("src_hyb_loop", ["brine"], "29,390 150,390 150,420 60,420 60,450 150,450 150,480 20,480", Qn, {
		source: ["hybrid"],
		speedRole: X
	}),
	H("src_hyb_exit", ["brine"], "20,480 20,50", J, {
		source: ["hybrid"],
		speedRole: X
	}),
	H("ref_discharge", ["refrigerant"], "496,250 385,250", Jn, {
		through: "htr",
		speedRole: Z
	}),
	H("ref_9_14", ["refrigerant"], "385,296 416,296", Jn, {
		through: "htr",
		speedRole: Z
	}),
	H("ref_discharge_direct", ["refrigerant"], "496,250 416,250 416,296", Jn, {
		bypass: "htr",
		speedRole: Z
	}),
	H("ref_14_8", ["refrigerant"], "444,306 444,348", Jn, {
		through: "active_cooling",
		reversible: !0,
		speedRole: Z
	}),
	H("ref_7_14", ["refrigerant"], "560,348 560,296 444,296", Yn, {
		through: "active_cooling",
		reversible: !0,
		speedRole: Z
	}),
	H("ref_suction", ["refrigerant"], "444,286 610,286 610,250 524,250", Yn, {
		through: "active_cooling",
		speedRole: Z
	}),
	H("ref_direct_8", ["refrigerant"], "416,296 444,296 444,348", Jn, {
		bypass: "active_cooling",
		speedRole: Z
	}),
	H("ref_direct_suction", ["refrigerant"], "560,348 560,286 610,286 610,250 524,250", Yn, {
		bypass: "active_cooling",
		speedRole: Z
	}),
	H("ref_8_13", ["refrigerant"], "444,416 473,416", Xn, {
		reversible: !0,
		speedRole: Z
	}),
	H("ref_13_12", ["refrigerant"], "501,416 515,416", Xn, {
		reversible: !0,
		speedRole: Z
	}),
	H("ref_12_7", ["refrigerant"], "539,416 560,416", Zn, {
		reversible: !0,
		speedRole: Z
	}),
	H("ln4_a", ["brine"], "690,130 690,288", J, { speedRole: X }),
	H("ln4_b", ["brine"], "690,312 690,348", J, { speedRole: X }),
	H("br_feed7", ["brine"], "690,348 584,348", J, {
		speedRole: X,
		onlyWhen: { valves2728: "closed" }
	}),
	H("brine_7_28", ["brine"], "584,416 598,416", Y, {
		through: "passive_cooling",
		speedRole: X,
		onlyWhen: { valves2728: "closed" }
	}),
	H("brine_28_ln3", ["brine"], "622,416 630,416", Y, {
		through: "passive_cooling",
		speedRole: X
	}),
	H("brine_bypass28", ["brine"], "584,416 630,416", Y, {
		bypass: "passive_cooling",
		speedRole: X
	}),
	H("ln3", ["brine"], "630,416 630,130", Y, { speedRole: X }),
	H("br_10_in", ["exchanger_10"], "690,348 690,448 532,448", J, {
		feature: "passive_cooling",
		speedRole: X
	}),
	H("br_10_28", ["exchanger_10"], "532,492 610,492 610,428", Y, {
		feature: "passive_cooling",
		speedRole: X
	}),
	H("brine_tap_a", ["brine"], "690,270 725,270 725,440", J, { stub: !0 }),
	H("brine_tap_b", ["brine"], "725,440 725,508", J, {
		stub: !0,
		detail: "full"
	}),
	H("brine_drain", ["brine"], "630,416 630,563", Y, {
		stub: !0,
		detail: "full"
	})
], tr = [
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
], nr = [
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
], rr = (e, t) => t === "htr" && e.dhw === "none" ? !1 : e.features[t], ir = (e, t) => e === "any" ? t !== "none" : e === t;
function ar(e, t) {
	if (e.detail === "full" && t.detail !== "full" || e.source !== void 0 && !e.source.includes(t.source) || e.dhw !== void 0 && !ir(e.dhw, t.dhw) || e.bypass !== void 0 && rr(t, e.bypass) !== !1 || e.through !== void 0 && rr(t, e.through) === !1) return "hidden";
	if (e.feature !== void 0) {
		let n = rr(t, e.feature);
		if (n === !1) return "hidden";
		if (n === "unused") return "muted";
	}
	return "normal";
}
function or(e, t) {
	return e.flatMap((e) => {
		let n = ar(e, t);
		return n === "hidden" ? [] : [{
			part: e,
			state: n
		}];
	});
}
var sr = (e) => or(Kn, e), cr = (e) => or(er, e), lr = (e, t) => (e.onlyWhen === void 0 || e.onlyWhen.valves2728 === t.valves2728) && e.circuit.some((e) => t.active.has(e)), ur = .35;
function dr(e) {
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
function fr(e) {
	let t = (e) => String(Math.round(e * 100) / 100);
	return dr(e).map(({ front: e, curve: [n, r, i, a] }) => ({
		front: e,
		d: `M${t(n[0])} ${t(n[1])} C${t(r[0])} ${t(r[1])} ${t(i[0])} ${t(i[1])} ${t(a[0])} ${t(a[1])}`
	}));
}
function pr(e, t) {
	let n = hr(e, 0), r = [`M${String(n[0])} ${String(n[1])}`];
	for (let n = 1; n < e.length; n += 1) {
		let [i, a, o] = [
			hr(e, n - 1),
			hr(e, n),
			e[n + 1]
		];
		if (o === void 0) {
			r.push(`L${String(a[0])} ${String(a[1])}`);
			break;
		}
		let s = Math.abs(a[0] - i[0]) + Math.abs(a[1] - i[1]), c = Math.abs(o[0] - a[0]) + Math.abs(o[1] - a[1]), l = Math.min(t, s / 2, c / 2), [u, d] = [Math.sign(a[0] - i[0]), Math.sign(a[1] - i[1])], [f, p] = [Math.sign(o[0] - a[0]), Math.sign(o[1] - a[1])], m = +(u * p - d * f > 0);
		r.push(`L${String(a[0] - u * l)} ${String(a[1] - d * l)} A${String(l)} ${String(l)} 0 0 ${String(m)} ${String(a[0] + f * l)} ${String(a[1] + p * l)}`);
	}
	return r.join(" ");
}
var mr = (e, t) => e[0] === t[0] && e[1] === t[1];
function hr(e, t) {
	let n = e[t];
	if (n === void 0) throw Error(`No point ${String(t)}`);
	return n;
}
var gr = (e) => e.slice(1).map((t, n) => [hr(e, n), t]), _r = (e, t, n) => e >= Math.min(t, n) && e <= Math.max(t, n);
function vr(e, t = []) {
	let n = [], r, i = (e) => {
		n.push(r === void 0 ? `M${String(e[0])} ${String(e[1])}` : `L${String(e[0])} ${String(e[1])}`), r = e;
	}, a = (e) => {
		n.push(`M${String(e[0])} ${String(e[1])}`), r = e;
	};
	i(hr(e, 0));
	for (let [n, r] of gr(e)) {
		let e = Math.sign(r[0] - n[0]), o = Math.sign(r[1] - n[1]), s = Math.abs(r[0] - n[0]) + Math.abs(r[1] - n[1]), c = t.filter((e) => yr(e, n, r) && !mr(e, n) && !mr(e, r)).sort((e, t) => Math.abs(e[0] - n[0]) + Math.abs(e[1] - n[1]) - (Math.abs(t[0] - n[0]) + Math.abs(t[1] - n[1])));
		for (let t of c) {
			let c = Math.abs(t[0] - n[0]) + Math.abs(t[1] - n[1]);
			c > 7 && i([t[0] - e * 7, t[1] - o * 7]), a(s - c > 7 ? [t[0] + e * 7, t[1] + o * 7] : r);
		}
		i(r);
	}
	return n.join(" ");
}
var yr = (e, t, n) => t[0] === n[0] && e[0] === t[0] && _r(e[1], t[1], n[1]) || t[1] === n[1] && e[1] === t[1] && _r(e[0], t[0], n[0]);
function br(e, t) {
	return tr.filter((n) => n.under === e && t.has(n.over) && t.has(n.under)).map((e) => e.at);
}
// src/diagram/pipes.ts
var xr = 1.2, Sr = .6, Cr = [
	"tap_47",
	"tap_48",
	"tap_49"
], wr = [
	"prod_27_15",
	"prod_15_8",
	"prod_tap_a",
	"prod_tap_b",
	"prod_drain"
];
function Tr(e) {
	if (e !== void 0 && e > 0) return Math.min(8, Math.max(Sr, xr * 100 / e));
}
var Er = {
	"compressor.discharge_temperature": "compressor.suction_temperature",
	"compressor.suction_temperature": "compressor.discharge_temperature",
	"refrigerant.condensation_temperature": "refrigerant.evaporation_temperature",
	"refrigerant.evaporation_temperature": "refrigerant.condensation_temperature"
}, Dr = (e, t) => $n.includes(e.id) && Or(t), Or = (e) => e.active.has("htr") && !e.active.has("production_dhw");
function kr(e, t) {
	return Dr(e, t.circuits) ? "dhw.temperature" : e.reversible === !0 && t.mode === "active_cooling" ? Er[e.temperatureRole] ?? e.temperatureRole : (t.mode === "passive_cooling" || t.mode === "defrost") && t.circuits.valves2728 === "exchanger" && wr.includes(e.id) ? "production.outlet_temperature" : e.temperatureRole;
}
function Ar(e, t, n) {
	return t === "muted" && n === "defrost" && e.feature === "passive_cooling" ? "normal" : t;
}
var jr = (e, t) => {
	let n = e[t];
	return typeof n == "number" ? n : void 0;
};
function Mr(e, t, n) {
	let { mode: r, circuits: i, readings: a, stops: o } = n, s = Cr.includes(e.id), c = Ar(e, t, r), l = s || lr(e, i), u = jr(a, kr(e, n)), d = c === "muted" || !l || u === void 0, f = e.direction === -1 != (e.reversible === !0 && r === "active_cooling"), p = {
		color: d ? Ht : Jt(u, o),
		muted: d,
		reversed: f
	};
	if (!l || c === "muted" || e.stub === !0 || s) return {
		...p,
		animated: !1
	};
	let m = Dr(e, i) || e.speedRole === void 0 && e.circuit.includes("htr") ? 3 : e.speedRole === void 0 ? void 0 : Tr(jr(a, e.speedRole));
	return m === void 0 ? {
		...p,
		animated: !1
	} : {
		...p,
		animated: !0,
		duration: m
	};
}
var Nr = (e) => Jt(jr(e.readings, "dhw.temperature"), e.stops);
function Pr(e) {
	let { circuits: t, readings: n, stops: r } = e;
	return Or(t) ? Jt(jr(n, "dhw.temperature"), r) : t.active.has("dhw_coil") ? Jt(jr(n, "production.outlet_temperature"), r) : Ht;
}
// src/diagram/symbols.ts
var Fr = .55;
function Ir(e, t, n) {
	let r = -t - 9, i = t + 9;
	return w`<path class="exchanger-fill" data-half=${e} d=${e === "left" ? `M0 ${String(r)} H-16 A4 4 0 0 0 -20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 0 -16 ${String(i)} H0 Z` : `M0 ${String(r)} H16 A4 4 0 0 1 20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 1 16 ${String(i)} H0 Z`} fill=${n} fill-opacity=${Fr} stroke="none" />`;
}
var Lr = (e, t) => w`<text class="glyph" text-anchor="middle" dominant-baseline="central" font-size="9" fill="currentColor" stroke="none" transform="rotate(${-t})">${e}</text>`;
function Rr() {
	return w`<g transform="matrix(0 -1 1 0 0 0)">${fr({
		kind: "helix",
		cx: 2,
		top: -60,
		bottom: 60,
		rx: 11,
		turns: 5.5
	}).map((e) => w`<path data-half=${e.front ? "front" : "back"} d=${e.d} opacity=${e.front ? E : ur} />`)}</g><path d="M-75 -13 H-60 M60 9 V13 H-75" />`;
}
var zr = (e, t) => w`<path d="M0 ${t} V${e}" />`, Br = (e, t) => w`<path d="${e}" fill=${t ? "currentColor" : "none"} />`;
function Vr(e, t) {
	let n = t.rotation ?? 0;
	switch (e) {
		case "pump": return w`<circle r="12" /><path d="M-5 -7 V7 L8 0 Z" fill="currentColor" />`;
		case "valve3": {
			let e = t.open ?? ["l", "r"];
			return w`${Br("M-12 -6 V6 L0 0 Z", e.includes("l"))}${Br("M12 -6 V6 L0 0 Z", e.includes("r"))}${Br("M-6 12 H6 L0 0 Z", e.includes("d"))}<rect x="-4" y="-21" width="8" height="8" /><path d="M0 -13 V-8" />`;
		}
		case "inversion_valve": return w`<rect x="-10" y="-14" width="20" height="28" rx="3" /><path d="M-14 0 H-10 M10 -10 H14 M10 0 H14 M10 10 H14" />${t.reversed === !0 ? w`<path d="M-14 0 H14 M14 10 H5 V-10 H14" />` : w`<path d="M-14 0 H-5 V10 H14 M14 0 H5 V-10 H14" />`}`;
		case "probe_t": return w`<circle r="9" />${zr(16, 9)}${Lr("T", n)}`;
		case "transducer_p": return w`<circle r="9" />${zr(16, 9)}${Lr("P", n)}`;
		case "pressure_switch": return w`<rect x="-7" y="-7" width="14" height="14" />${zr(16, 7)}${Lr("P", n)}`;
		case "thermostat": return w`<rect x="-7" y="-7" width="14" height="14" />${zr(16, 7)}${Lr("T", n)}`;
		case "exchanger": {
			let e = t.size ?? 34, n = t.fills;
			return w`${n === void 0 ? E : w`${Ir("left", e, n.left)}${Ir("right", e, n.right)}`}<rect x="-20" y="${-e - 9}" width="40" height="${2 * e + 18}" rx="4" /><path d="M-12 ${-e} V${e} M12 ${-e} V${e}" /><circle cx="-12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="-12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" />`;
		}
		case "compressor": return w`<circle r="14" /><path d="M0 -8 A8 8 0 1 0 8 0 M0 -8 L6 -4" />`;
		case "vessel": return w`<circle r="12" /><path d="M-12 2 H12" />`;
		case "safety_valve": return w`<path d="M0 16 V6 M-6 6 H6 L0 -4 Z M0 -4 L-3 -7 L3 -10 L0 -13" />`;
		case "valve": return w`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "drain_valve": return w`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "resistor": return w`<rect x="-28" y="-6" width="56" height="12" rx="2" /><path d="M-18 -6 V6 M18 -6 V6" />`;
		case "filter_dryer": return w`<rect x="-14" y="-5" width="28" height="10" rx="5" />`;
		case "expansion_valve": return w`<path d="M-12 -6 V6 L0 0 L12 -6 V6 L0 0 Z" />`;
		case "service_outlet": return w`<rect x="-3" y="-3" width="6" height="6" />${zr(10, 3)}`;
		case "port": return w`<rect x="-5" y="-6" width="10" height="6" />`;
		case "tank": return w`<rect class="tank-body" data-dhw-tank="internal" x=${-B.width / 2} y=${-B.height / 2} width=${B.width} height=${B.height} rx="14" fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />`;
		case "coil": return Rr();
	}
}
function Hr(e, t = {}) {
	return w`<g class="symbol ${e}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${t.rotation ?? 0})">${Vr(e, t)}</g>`;
}
// src/diagram/cabinet.ts
var Ur = o`
  .outline {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: 3;
  }
  .pipe {
    fill: none;
    stroke: var(--secondary-text-color);
    stroke-width: 3;
    stroke-linejoin: round;
  }
  .pipe.muted {
    stroke: var(--disabled-text-color);
  }
  /* The dash overlay of an active pipe: dashes in the card colour run along it in the direction of the flow. */
  .flow {
    fill: none;
    stroke: var(--card-background-color, #fff);
    stroke-opacity: 0.55;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: 3 18;
    animation: flow-dash var(--flow-duration, 2s) linear infinite;
  }
  .flow.reversed {
    animation-direction: reverse;
  }
  @keyframes flow-dash {
    to {
      stroke-dashoffset: -21;
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
    outline: 2px solid var(--primary-color, currentColor);
    outline-offset: 2px;
    filter: drop-shadow(0 0 2px var(--primary-color, currentColor));
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
function Wr(e, t) {
	return e === 26 ? t.valve26 === "dhw" ? ["l", "d"] : ["l", "r"] : t.valves2728 === "exchanger" ? ["d", "r"] : ["l", "r"];
}
function Gr(e, t, n, r, i) {
	let { part: a } = e, { circuits: o } = t, s = Ar(a, e.state, t.mode), [c, l, u] = a.tag, d = gt(a.item), f = zn(Rn(Fn[a.item], r), r?.onTap);
	return w`<g class="symbol-group ${s}" data-item=${a.item} data-kind=${a.kind} aria-label=${d} role=${f.role} tabindex=${f.tabindex} @click=${f.click} @keydown=${f.keydown} style=${a.kind === "coil" ? `color: ${Pr(t)}` : E}>
    <title>${d}</title>
    <g transform="translate(${a.x} ${a.y})">${Hr(a.kind, {
		rotation: a.rotation,
		size: a.size,
		open: a.kind === "valve3" ? Wr(a.item, o) : void 0,
		reversed: a.kind === "inversion_valve" ? o.valve14 === "reversed" : void 0,
		fills: i
	})}</g>
    ${n === "full" ? w`<text class="item" x=${a.x + c} y=${a.y + l} text-anchor=${u ?? "start"}>${a.item}</text>` : E}
  </g>`;
}
function Kr(e, t, n) {
	let r = fr(t), i = n.muted ? E : `stroke: ${n.color}`;
	return w`<g class="helix ${n.muted ? "muted" : ""}" data-segment=${e.id} style=${i}>
    ${r.map((e) => w`<path class="pipe ${n.muted ? "muted" : ""}" data-half=${e.front ? "front" : "back"} style=${i} opacity=${e.front ? E : ur} d=${e.d} />`)}
    ${n.animated ? w`<path class="flow ${n.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(n.duration)}s" d=${r.filter((e) => e.front).map((e) => e.d).join(" ")} />` : E}
  </g>`;
}
function qr(e, t, n) {
	if (e.shape !== void 0) return Kr(e, e.shape, t);
	let r = e.bend === void 0 ? vr(e.points, n) : pr(e.points, e.bend);
	return w`<path class="pipe ${t.muted ? "muted" : ""}" data-segment=${e.id} style=${t.muted ? E : `stroke: ${t.color}`} d=${r} />${t.animated ? w`<path class="flow ${t.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(t.duration)}s" d=${r} />` : E}`;
}
function Jr(e, t, n, r) {
	let i = (e) => e.map((e) => n.get(e)).find((e) => e !== void 0), a = e.reversible === !0 && r === "active_cooling", [o, s] = a ? [e.leaving, e.entering] : [e.entering, e.leaving], c = i(o), l = i(s), u = (c?.muted ?? !0) && (l?.muted ?? !0), d = (e) => u ? Ht : e?.color ?? "var(--disabled-text-color)", f = e.enters === "top" !== a;
	return {
		id: t,
		y1: +!f,
		y2: +!!f,
		start: d(c),
		end: d(l),
		muted: u
	};
}
var Yr = (e) => w`<linearGradient id=${e.id} x1="0" y1=${e.y1} x2="0" y2=${e.y2} data-muted=${e.muted}>
      <stop offset="0" style="stop-color: ${e.start}" />
      <stop offset="1" style="stop-color: ${e.end}" />
    </linearGradient>`;
function Xr(e, t, n, r = {
	mode: "gradient",
	idPrefix: "ecogeo"
}) {
	let i = cr(e), a = new Set(i.map((e) => e.part.id)), o = new Map(i.map((e) => [e.part.id, Mr(e.part, e.state, t)])), s = [], c = sr(e).map((i) => {
		let a = r.mode === "gradient" ? i.part.sides : void 0;
		if (a === void 0) return Gr(i, t, e.detail, n);
		let c = {
			left: "none",
			right: "none"
		};
		for (let e of a) {
			let n = Jr(e, `${r.idPrefix}-x${String(i.part.item)}-${e.half}`, o, t.mode);
			s.push(n), c[e.half] = `url(#${n.id})`;
		}
		return Gr(i, t, e.detail, n, c);
	});
	return w`<g class="cabinet">
    <defs>${s.map(Yr)}</defs>
    <rect class="outline" x=${Vn.x} y=${Vn.y} width=${Vn.width} height=${Vn.height} rx="6" />
    ${nr.filter((t) => ar(t, e) !== "hidden").map((e) => w`<text class="circuit-label" x=${e.x} y=${e.y} text-anchor="middle">${ut[e.key]}</text>`)}
    ${i.map((e) => {
		let t = o.get(e.part.id);
		return t === void 0 ? E : qr(e.part, t, br(e.part.id, a));
	})}
    ${c}
  </g>`;
}
// src/diagram/dhw.ts
var Zr = o`
  .tank-body {
    stroke: var(--primary-text-color);
    stroke-width: 2.5;
  }
  .tank-rim {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: 1.5;
    stroke-opacity: 0.6;
  }
  .dhw-storage[role='button'] {
    cursor: pointer;
  }
  .dhw-storage[role='button']:focus-visible {
    outline: 2px solid var(--primary-color, currentColor);
    outline-offset: 2px;
    filter: drop-shadow(0 0 2px var(--primary-color, currentColor));
  }
  .tank-caption {
    fill: var(--secondary-text-color);
    font-size: 11px;
  }
`;
function Qr(e, t) {
	if (e.dhw !== "external") return w``;
	let { x: n, y: r, width: i, height: a, dome: o } = Hn, s = i / 2, c = `M${String(n)} ${String(r + o)} A${String(s)} ${String(o)} 0 0 1 ${String(n + i)} ${String(r + o)} V${String(r + a - o)} A${String(s)} ${String(o)} 0 0 1 ${String(n)} ${String(r + a - o)} Z`, l = `M${String(n)} ${String(r + o)} A${String(s)} ${String(o)} 0 0 0 ${String(n + i)} ${String(r + o)}`, u = zn(Rn(Ln, t), t?.onTap);
	return w`<g class="dhw-storage" data-dhw="external" aria-label=${ft.externalTank} role=${u.role} tabindex=${u.tabindex} @click=${u.click} @keydown=${u.keydown}>
    <title>${ft.externalTank}</title>
    <path class="tank-body" data-dhw-tank="external" d=${c} fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />
    <path class="tank-rim" d=${l} />
    <text class="tank-caption" x=${n + i / 2} y=${r - 6} text-anchor="middle">${ft.externalTank}</text>
  </g>`;
}
// src/lib/format.ts
var $r = "−";
function ei(e) {
	let t = e?.locale;
	return typeof t == "object" && t ? t : e?.language === void 0 ? {} : { language: e.language };
}
function ti(e) {
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
var ni = /* @__PURE__ */ new Map();
function ri(e, t, n) {
	let r = ti(e), i = n && e.number_format !== "none", a = `${r?.join(",") ?? ""}|${String(t)}|${String(i)}`, o = ni.get(a);
	return o === void 0 && (o = new Intl.NumberFormat(r, {
		minimumFractionDigits: t,
		maximumFractionDigits: t,
		useGrouping: i
	}), ni.set(a, o)), o;
}
function ii(e, t, n = 0, r = !0) {
	if (!Number.isFinite(e)) return "–";
	let i = Number.isFinite(n) ? Math.min(20, Math.max(0, Math.trunc(n))) : 0, a = Math.abs(e) < .5 / 10 ** i ? 0 : e;
	return ri(t ?? {}, i, r).formatToParts(a).map((e) => e.type === "minusSign" ? $r : e.value).join("");
}
// src/calc/display.ts
function ai(e) {
	if (typeof e != "object" || !e) return;
	let t = e.display_precision;
	return typeof t == "number" && Number.isInteger(t) && t >= 0 && t <= 20 ? t : void 0;
}
var oi = (e, t) => t ?? e.decimals ?? 0;
function si(e, t) {
	let n = typeof t == "string" ? t.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase() : "";
	return n === (e.unit ?? "").toLowerCase() || e.quantity === "difference" && n === "°c";
}
function ci(e, t, n, r) {
	let i = yt.get(e);
	if (i === void 0 || t === void 0 || !Number.isFinite(t)) return;
	let a = n === void 0 || !si(i, r.states?.[n]?.attributes.unit_of_measurement) ? void 0 : ai(r.entities?.[n]), o = ii(t, r.locale, oi(i, a), !1);
	return i.unit === void 0 ? o : `${o} ${i.unit}`;
}
// src/diagram/labels.ts
var li = o`
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
  .label.emphasis {
    font-size: max(9px, 1.2cqw);
    font-weight: 600;
  }
  .caption {
    color: var(--secondary-text-color);
    font-size: 0.85em;
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
`, $ = (e, t, n, r, i, a = {}) => ({
	id: e,
	role: t,
	x: n,
	y: r,
	align: i,
	...a
}), ui = 895, di = [
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
	$("compressor_speed", "compressor.speed", 503, 308, "middle", { item: 11 }),
	$("compressor_percentage", "compressor.percentage", 503, 319, "middle", { item: 11 }),
	$("compressor_power", "compressor.power", 503, 330, "middle", { item: 11 }),
	$("superheat", "refrigerant.superheat", 527, 376, "middle", { item: 12 }),
	$("expansion_valve", "refrigerant.expansion_valve", 527, 388, "middle", { item: 12 }),
	$("condensation_temperature", "refrigerant.condensation_temperature", 432, 437, "middle", { item: 8 }),
	$("evaporation_temperature", "refrigerant.evaporation_temperature", 572, 437, "middle", { item: 7 }),
	$("fan_speed", "source.fan_speed", 115, 312, "middle", {
		source: ["air", "hybrid"],
		caption: M.fan
	}),
	$("outside_temperature", "source.outside_temperature", 115, 325, "middle", {
		source: ["air", "hybrid"],
		caption: M.outside
	}),
	$("air_unit_outlet", "source.air_unit_outlet_temperature", 115, 338, "middle", {
		source: ["air", "hybrid"],
		caption: M.airOutlet
	}),
	$("ground_out", "brine.outlet_temperature", 158, 203, "start", {
		source: ["ground"],
		caption: M.groundOut
	}),
	$("ground_in", "brine.inlet_temperature", 158, 290, "start", {
		source: ["ground"],
		caption: M.groundIn
	}),
	$("hybrid_ground_in", "brine.inlet_temperature", 158, 480, "start", {
		source: ["hybrid"],
		caption: M.groundIn
	}),
	...["external", "internal"].flatMap((e) => {
		let t = e === "external" ? 352 : 152;
		return [
			$(`tank_${e}_temperature`, "dhw.temperature", ui, t, "middle", {
				dhw: e,
				emphasis: !0
			}),
			$(`tank_${e}_setpoint`, "dhw.setpoint", ui, t + 15, "middle", {
				dhw: e,
				caption: M.setpoint
			}),
			$(`tank_${e}_start_delta`, "dhw.start_delta", ui, t + 29, "middle", {
				dhw: e,
				caption: M.startDelta
			}),
			$(`tank_${e}_demand`, "dhw.demand", ui, t + 43, "middle", {
				dhw: e,
				demand: !0
			})
		];
	})
];
function fi(e, t, n, r) {
	return di.flatMap((i) => {
		if (ar(i, e) === "hidden") return [];
		let a = n[i.role], o = {
			id: i.id,
			role: i.role,
			x: i.x,
			y: i.y,
			align: i.align,
			emphasis: i.emphasis === !0,
			entityId: a,
			...i.item === void 0 ? {} : { item: i.item },
			...i.caption === void 0 ? {} : { caption: i.caption }
		}, s = t[i.role];
		if (i.demand === !0) {
			let e = i.role === "heating.demand" ? pt.demand : ft.demand;
			return s === !0 ? [{
				...o,
				text: e,
				missing: !1
			}] : [];
		}
		let c = ci(i.role, typeof s == "number" ? s : void 0, a, r);
		return [{
			...o,
			text: c ?? "–",
			missing: c === void 0
		}];
	});
}
function pi(e, t, n) {
	let r = (e, n, r, i) => ({
		id: e,
		...r === void 0 ? {} : { caption: r },
		text: i ?? "–",
		missing: i === void 0,
		entityId: t[n]
	}), i = (i, a, o) => {
		let s = e[a];
		return r(i, a, o, ci(a, typeof s == "number" ? s : void 0, t[a], n));
	}, a = e["unit.on_off"], o = e["unit.summer"] === !0 ? N.summer : e["unit.winter"] === !0 ? N.winter : void 0;
	return [
		r("on_off", "unit.on_off", void 0, a === void 0 ? void 0 : mt[a.toLowerCase()] ?? a),
		r("season", e["unit.summer"] === !0 ? "unit.summer" : "unit.winter", void 0, o),
		i("outside_temperature", "source.outside_temperature", N.outside),
		i("cop", "unit.cop", N.cop),
		i("condensation_capacity", "heating.capacity", N.condensation),
		i("evaporation_capacity", "cooling.capacity", N.evaporation)
	];
}
var mi = (e) => ({
	left: `${String(e.x / Bn.width * 100)}%`,
	top: `${String(e.y / Bn.height * 100)}%`
});
function hi(e, t, n, r) {
	let i = n ? "value missing" : "value";
	return e === void 0 || r === void 0 ? C`<span class=${i}>${t}</span>` : C`<button
        class=${i}
        type="button"
        @click=${() => {
		r(e);
	}}
      >
        ${t}
      </button>`;
}
function gi(e, t) {
	return C`${e.map((e) => {
		let { left: n, top: r } = mi(e);
		return C`<span
      class="label ${e.align}${e.emphasis ? " emphasis" : ""}"
      data-label=${e.id}
      data-role=${e.role}
      data-label-item=${e.item ?? E}
      style="left: ${n}; top: ${r}"
      >${e.caption === void 0 ? E : C`<span class="caption">${e.caption}</span>`}${hi(e.entityId, e.text, e.missing, t)}</span
    >`;
	})}`;
}
function _i(e, t) {
	return C`${e.map((e) => C`<span class="footer-item" data-footer=${e.id}
        >${e.caption === void 0 ? E : C`<span class="caption">${e.caption}</span>`}${hi(e.entityId, e.text, e.missing, t)}</span
      >`)}`;
}
// src/diagram/source.ts
var vi = o`
  .source-outline {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: 2.5;
  }
  .source-frame {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: 2;
  }
  .source-fin {
    stroke: var(--secondary-text-color);
    stroke-opacity: 0.55;
    stroke-width: 1;
  }
  .source-slat {
    stroke: var(--secondary-text-color);
    stroke-width: 2;
    stroke-linecap: round;
  }
  .source-divider {
    stroke: var(--primary-text-color);
    stroke-width: 1.5;
  }
  .source-ground {
    stroke: var(--secondary-text-color);
    stroke-width: 1.5;
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
    outline: 2px solid var(--primary-color, currentColor);
    outline-offset: 2px;
    filter: drop-shadow(0 0 2px var(--primary-color, currentColor));
  }
  .fan-ring {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: 2;
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
`, yi = (e) => e === void 0 || !(e > 0) ? void 0 : Math.min(6, Math.max(.5, 120 / e)), bi = [
	0,
	72,
	144,
	216,
	288
].map((e) => w`<path class="fan-blade" d="M0 -4 C9 -6 21 -16 17 -30 C6 -26 -3 -17 -3 -6 Z" transform="rotate(${e})" />`);
function xi(e, t, n) {
	let { x: r, y: i, width: a, height: o, fanX: s, fanY: c, fanRadius: l, coil: u, fins: d, slats: f, dividerY: p } = Un, m = yi(e), ee = Array.from({ length: d.count }, (e, t) => d.x + t * d.step), te = Array.from({ length: f.count }, (e, t) => f.y0 + t * f.step), [ne, re] = [r + 6, s + l + 6], h = s - l - 6 - ne, g = zn(Rn(In, n), n?.onTap);
	return w`<g class="air-unit${t ? " muted" : ""}" data-source="air">
    <rect class="source-outline" x=${r} y=${i} width=${a} height=${o} rx="6" />
    <path class="source-divider" d="M${r} ${p} H${r + a}" />
    ${te.map((e) => w`<path class="source-slat" data-slat d="M${ne} ${e} h${h} M${re} ${e} h${h}" />`)}
    <rect class="source-frame" data-coil-block x=${u.x} y=${u.y} width=${u.width} height=${u.height} rx="3" />
    ${ee.map((e) => w`<path class="source-fin" d="M${e} ${d.y0} V${d.y1}" />`)}
    <g class="fan-part" aria-label=${_t} role=${g.role} tabindex=${g.tabindex} @click=${g.click} @keydown=${g.keydown}>
      <title>${_t}</title>
      <circle class="fan-ring" cx=${s} cy=${c} r=${l} />
      <circle class="fan-hit" cx=${s} cy=${c} r=${l} fill="transparent" stroke="none" />
      <g class="fan" data-fan transform="translate(${s} ${c})">
        <g class=${m === void 0 ? "fan-rotor still" : "fan-rotor"} style=${m === void 0 ? "" : `--fan-duration: ${String(m)}s`}>${bi}<circle class="fan-hub" r="5" fill="var(--primary-text-color)" /></g>
      </g>
    </g>
    <text class="source-caption" x=${Un.captionX} y=${Un.captionY} text-anchor="middle">${dt.air}</text>
  </g>`;
}
function Si(e, t) {
	return cr(e).flatMap(({ part: e }) => e.id.startsWith("src_") ? e.points.slice(1).flatMap((n, r) => {
		let i = e.points[r];
		return i?.[0] === n[0] && t > Math.min(i[1], n[1]) && t < Math.max(i[1], n[1]) ? [n[0]] : [];
	}) : []);
}
function Ci(e, t, n, r) {
	let i = Si(e, n), a = Array.from({ length: 16 }, (e, t) => 44 + t * 10).filter((e) => !i.some((t) => Math.abs(t - e) < 8)), o = Gn.y[t];
	return w`<g class="ground-loop${r ? " muted" : ""}" data-source="ground">
    <path class="source-ground" d="M8 ${n} H202" />
    ${a.map((e) => w`<path class="source-ground" d="M${e} ${n} l-6 8" />`)}
    <text class="source-caption" x=${Gn.x} y=${o} text-anchor="middle">${dt.ground}</text>
  </g>`;
}
function wi(e, t, n, r) {
	let i = e.source === "air" || e.source === "hybrid", a = e.source === "ground" || e.source === "hybrid", o = e.source === "hybrid" ? "hybrid" : "ground";
	return w`<g class="source" data-source-kind=${e.source}>
    ${i ? xi(t["source.fan_speed"], !n, r) : w``}
    ${a ? Ci(e, o, Wn[o], !n) : w``}
  </g>`;
}
// src/lib/define.ts
function Ti(e, t) {
	let n = customElements.get(e);
	n === void 0 ? customElements.define(e, t) : n !== t && console.warn(`${e} is already defined by another copy of the module; that copy stays in use.`);
}
// src/lib/render.ts
function Ei(e, t) {
	return e === t || Array.isArray(e) && Array.isArray(t) && e.length === t.length && e.every((e, n) => e === t[n]);
}
function Di(e, t) {
	if (e === t) return !0;
	if (typeof e != "object" || typeof t != "object" || e === null || t === null) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	return n.length === r.length && n.every((n) => Object.hasOwn(t, n) && Ei(e[n], t[n]));
}
function Oi(e, t, n) {
	return e === void 0 || e.locale !== t.locale || e.language !== t.language || e.localize !== t.localize || e.formatEntityState !== t.formatEntityState || e.themes?.darkMode !== t.themes?.darkMode || n.some((n) => e.states[n] !== t.states[n] || !Di(e.entities?.[n], t.entities?.[n]));
}
function ki(e, t, n, r) {
	return e.size === 1 && e.has("hass") ? t !== void 0 && Oi(n, t, r) : !0;
}
// src/card/ecogeo-card.ts
var Ai = "ecogeo-card", ji = Bn.width, Mi = Bn.height, Ni = 0;
Ti(Ai, class extends Le {
	constructor(...e) {
		super(...e), this.entityIds = [], this.idPrefix = `ecogeo${String(++Ni)}`;
	}
	static {
		this.styles = [
			Ur,
			vi,
			Zr,
			li,
			o`
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
			config: { state: !0 }
		};
	}
	setConfig(e) {
		let t = En(e);
		if (t.length > 0) throw Error(t.join("; "));
		this.resolved = Pn(e), this.entityIds = [...new Set(Object.values(this.resolved.entities).filter((e) => e !== void 0))], this.config = e;
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
		return ki(e, this.hass, this.renderedHass, this.entityIds);
	}
	readings(e) {
		let t = e.sample ? jn : this.hass?.states ?? {};
		return {
			readings: wt(t, e.entities),
			offline: Ue(Qe(t, e.entities["unit.connection"]))
		};
	}
	render() {
		this.renderedHass = this.hass;
		let e = this.resolved;
		if (e === void 0) return C`<ha-card><div class="diagram"></div></ha-card>`;
		let { readings: t, offline: n } = this.readings(e), r = He(t, e.features), i = Ge(r, e.features, e.dhw, t), a = {
			mode: r,
			circuits: i,
			readings: t,
			stops: e.colors
		}, o = e.sample ? jn : this.hass?.states ?? {}, s = {
			locale: ei(this.hass),
			entities: this.hass?.entities,
			states: o
		}, c = e.sample ? void 0 : (e) => {
			$e(this, e);
		}, l = {
			entities: e.entities,
			onTap: c
		};
		return C`<ha-card>
      <div class="diagram">
        <svg
          viewBox="0 0 ${ji} ${Mi}"
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label=${st}
          style="--dhw-tank-color: ${Nr(a)}"
        >
          ${w`${wi(e, t, i.active.has("brine"), l)}${Qr(e, l)}${Xr(e, a, l, {
			mode: e.exchangerFill,
			idPrefix: this.idPrefix
		})}`}
        </svg>
        ${gi(fi(e, t, e.entities, s), c)}
      </div>
      <div class="footer">
        <span class="mode">${ct[r]}</span>
        ${_i(pi(t, e.entities, s), c)}
        ${We(t["unit.alarm"]) ? C`<span class="alarm">${lt.alarm}</span>` : E}
        ${n ? C`<span class="offline">${lt.offline}</span>` : E}
        ${e.sample ? C`<span class="sample">${lt.sampleValues}</span>` : E}
      </div>
    </ha-card>`;
	}
});
// src/index.ts
var Pi = {
	type: Ai,
	...ot,
	preview: !0
};
function Fi(e = window) {
	let t = e.customCards ??= [];
	t.some((e) => e.type === Pi.type) || t.push({ ...Pi });
}
Fi();
export { Pi as CARD_ENTRY, Fi as registerCardPicker };
