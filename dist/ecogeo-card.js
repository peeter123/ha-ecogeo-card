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
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: ee, getOwnPropertySymbols: te, getPrototypeOf: ne } = Object, re = globalThis, ie = re.trustedTypes, ae = ie ? ie.emptyScript : "", oe = re.reactiveElementPolyfillSupport, f = (e, t) => e, se = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? ae : null;
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
}, ce = (e, t) => !l(e, t), le = {
	attribute: !0,
	type: String,
	converter: se,
	reflect: !1,
	useDefault: !1,
	hasChanged: ce
};
Symbol.metadata ??= Symbol("metadata"), re.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var p = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = le) {
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
		return this.elementProperties.get(e) ?? le;
	}
	static _$Ei() {
		if (this.hasOwnProperty(f("elementProperties"))) return;
		let e = ne(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(f("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(f("properties"))) {
			let e = this.properties, t = [...ee(e), ...te(e)];
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
			let i = (n.converter?.toAttribute === void 0 ? se : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? se : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? ce)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
p.elementStyles = [], p.shadowRootOptions = { mode: "open" }, p[f("elementProperties")] = /* @__PURE__ */ new Map(), p[f("finalized")] = /* @__PURE__ */ new Map(), oe?.({ ReactiveElement: p }), (re.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var ue = globalThis, de = (e) => e, fe = ue.trustedTypes, pe = fe ? fe.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, me = "$lit$", m = `lit$${Math.random().toFixed(9).slice(2)}$`, he = "?" + m, ge = `<${he}>`, h = document, g = () => h.createComment(""), _ = (e) => e === null || typeof e != "object" && typeof e != "function", _e = Array.isArray, ve = (e) => _e(e) || typeof e?.[Symbol.iterator] == "function", ye = "[ 	\n\f\r]", v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, be = /-->/g, xe = />/g, y = RegExp(`>|${ye}(?:([^\\s"'>=/]+)(${ye}*=${ye}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), Se = /'/g, Ce = /"/g, we = /^(?:script|style|textarea|title)$/i, Te = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), b = Te(1), x = Te(2), S = Symbol.for("lit-noChange"), C = Symbol.for("lit-nothing"), Ee = /* @__PURE__ */ new WeakMap(), w = h.createTreeWalker(h, 129);
function De(e, t) {
	if (!_e(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return pe === void 0 ? t : pe.createHTML(t);
}
var Oe = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = v;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === v ? c[1] === "!--" ? o = be : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = y) : (we.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = y) : o = xe : o === y ? c[0] === ">" ? (o = i ?? v, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? y : c[3] === "\"" ? Ce : Se) : o === Ce || o === Se ? o = y : o === be || o === xe ? o = v : (o = y, i = void 0);
		let d = o === y && e[t + 1].startsWith("/>") ? " " : "";
		a += o === v ? n + ge : l >= 0 ? (r.push(s), n.slice(0, l) + me + n.slice(l) + m + d) : n + m + (l === -2 ? t : d);
	}
	return [De(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, ke = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = Oe(t, n);
		if (this.el = e.createElement(l, r), w.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = w.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(me)) {
					let t = u[o++], n = i.getAttribute(e).split(m), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Ne : r[1] === "?" ? Pe : r[1] === "@" ? Fe : Me
					}), i.removeAttribute(e);
				} else e.startsWith(m) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (we.test(i.tagName)) {
					let e = i.textContent.split(m), t = e.length - 1;
					if (t > 0) {
						i.textContent = fe ? fe.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], g()), w.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], g());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === he) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(m, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += m.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = h.createElement("template");
		return n.innerHTML = e, n;
	}
};
function T(e, t, n = e, r) {
	if (t === S) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = _(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = T(e, i._$AS(e, t.values), i, r)), t;
}
var Ae = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? h).importNode(t, !0);
		w.currentNode = r;
		let i = w.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new je(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Ie(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = w.nextNode(), a++);
		}
		return w.currentNode = h, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, je = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = C, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = T(this, e, t), _(e) ? e === C || e == null || e === "" ? (this._$AH !== C && this._$AR(), this._$AH = C) : e !== this._$AH && e !== S && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ve(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== C && _(this._$AH) ? this._$AA.nextSibling.data = e : this.T(h.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = ke.createElement(De(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Ae(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = Ee.get(e.strings);
		return t === void 0 && Ee.set(e.strings, t = new ke(e)), t;
	}
	k(t) {
		_e(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(g()), this.O(g()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = de(e).nextSibling;
			de(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, Me = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = C, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = C;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = T(this, e, t, 0), a = !_(e) || e !== this._$AH && e !== S, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = T(this, r[n + o], t, o), s === S && (s = this._$AH[o]), a ||= !_(s) || s !== this._$AH[o], s === C ? e = C : e !== C && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === C ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Ne = class extends Me {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === C ? void 0 : e;
	}
}, Pe = class extends Me {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== C);
	}
}, Fe = class extends Me {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = T(this, e, t, 0) ?? C) === S) return;
		let n = this._$AH, r = e === C && n !== C || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== C && (n === C || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Ie = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		T(this, e);
	}
}, Le = ue.litHtmlPolyfillSupport;
Le?.(ke, je), (ue.litHtmlVersions ??= []).push("3.3.3");
var Re = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new je(t.insertBefore(g(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, ze = globalThis, E = class extends p {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Re(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return S;
	}
};
E._$litElement$ = !0, E.finalized = !0, ze.litElementHydrateSupport?.({ LitElement: E });
var Be = ze.litElementPolyfillSupport;
Be?.({ LitElement: E }), (ze.litElementVersions ??= []).push("4.2.2");
// src/calc/mode.ts
var Ve = [
	"off",
	"unavailable",
	"unknown"
], He = (e, t) => e?.trim().toLowerCase() === t, Ue = (e) => e !== void 0 && e > 0;
function We(e, t) {
	if (He(e["unit.on_off"], "off")) return "off";
	if (He(e["compressor.mode"], "defrost")) return "defrost";
	let n = e["compressor.speed"];
	if (n === void 0) return "standby";
	let r = e["unit.summer"] === !0;
	return Ue(n) ? e["dhw.demand"] === !0 ? "dhw" : r && t.active_cooling === !0 ? "active_cooling" : "heating" : r && Ue(e["production.pump"]) && t.passive_cooling === !0 ? "passive_cooling" : "standby";
}
function Ge(e) {
	return e !== void 0 && Ve.includes(e.state.trim().toLowerCase());
}
var Ke = (e) => e === !0;
// src/calc/circuits.ts
function qe(e, t, n, r) {
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
	return Ue(r["brine.pump"]) || i.delete("brine"), {
		valve26: e === "dhw" ? "dhw" : "production",
		valve14: e === "active_cooling" ? "reversed" : "normal",
		valves2728: (e === "passive_cooling" || e === "defrost") && a ? "exchanger" : "closed",
		active: i
	};
}
// src/lib/availability.ts
var Je = /* @__PURE__ */ new Set(["unknown", "unavailable"]), Ye = -999, Xe = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;
function Ze(e) {
	if (!Xe.test(e)) return;
	let t = Number(e);
	return Number.isFinite(t) ? t + 0 : void 0;
}
function Qe(e) {
	if (e === void 0 || Je.has(e.state)) return !0;
	let t = Ze(e.state);
	return t !== void 0 && t <= Ye;
}
function $e(e) {
	if (!(e === void 0 || Qe(e))) return Ze(e.state);
}
// src/lib/hass.ts
var et = (e, t) => t === void 0 ? void 0 : e[t];
function tt(e, t) {
	e.dispatchEvent(new CustomEvent("hass-more-info", {
		detail: { entityId: t },
		bubbles: !0,
		composed: !0
	}));
}
// src/lib/units.ts
var nt = { scale: 1 }, rt = {
	scale: 5 / 9,
	offset: -32
}, it = {
	temperature: /* @__PURE__ */ new Map([["°c", nt], ["°f", rt]]),
	difference: /* @__PURE__ */ new Map([
		["k", nt],
		["°c", nt],
		["°f", rt]
	]),
	power: /* @__PURE__ */ new Map([["w", nt], ["kw", { scale: 1e3 }]])
};
function at(e) {
	return e.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase();
}
function ot(e, t) {
	let n = $e(e);
	return n === void 0 ? void 0 : st(t, n, e?.attributes.unit_of_measurement);
}
function st(e, t, n) {
	if (!Number.isFinite(t) || n === void 0) return;
	let r = it[e].get(at(n));
	return r ? (t + (r.offset ?? 0)) * r.scale : void 0;
}
// src/strings.ts
var D = {
	invalid: (e, t) => `Invalid option ${e}: expected ${t}`,
	number: (e, t) => `a number from ${e} to ${t}`,
	color: "a CSS colour such as #db4437 or rgb(219, 68, 55)",
	boolean: "true or false",
	object: "a group of options",
	choice: (e) => `one of ${e.join(", ")}`,
	list: "a list of texts"
}, ct = {
	name: "ecoGEO Schematic",
	description: "The internal schematic of an Ecoforest ecoGEO heat pump, with live values and pipes coloured by temperature."
}, lt = "ecoGEO heat pump schematic", O = {
	celsius: "°C",
	kelvin: "K",
	bar: "bar",
	percent: "%",
	rpm: "rpm",
	watt: "W"
}, ut = {
	off: "Off",
	defrost: "Defrost",
	dhw: "DHW",
	active_cooling: "Active cooling",
	heating: "Heating",
	passive_cooling: "Passive cooling",
	standby: "Standby"
}, dt = {
	alarm: "Alarm",
	offline: "Offline",
	sampleValues: "Sample values"
}, k = {
	unknownOption: (e) => `Unknown option ${e}`,
	unknownFeature: (e, t) => `Unknown feature ${e}: expected one of ${t.join(", ")}`,
	unknownRole: (e) => `Unknown entity role ${e}`,
	notEntityId: (e) => `Invalid entity for ${e}: expected an entity id such as sensor.name`,
	featureState: (e) => `Invalid option features.${e}: expected true, false or unused`,
	integer: (e, t) => `a whole number from ${e} to ${t}`,
	prefix: "a prefix of lowercase letters, digits and underscores",
	colors: "Invalid option colors: expected an ascending list of 2 to 8 stops, each { temperature, color } with a number and a CSS colour",
	dhwMismatch: (e, t) => `Invalid option dhw: ${e} does not fit model ${t}`
}, ft = {
	dg1: "DG1",
	outerLoop: "Outer loop",
	dhw: "DHW"
}, pt = {
	air: "Air unit",
	ground: "Ground loop"
}, mt = {
	externalTank: "DHW tank",
	demand: "Demand"
}, A = {
	setpoint: "Setpoint",
	startDelta: "Start ΔT",
	fan: "Fan",
	outside: "Outside",
	airOutlet: "Outlet",
	groundIn: "In",
	groundOut: "Out"
}, j = {
	outside: "Outside",
	cop: "COP",
	condensation: "Condensation",
	evaporation: "Evaporation",
	summer: "Summer",
	winter: "Winter"
}, ht = {
	on: "On",
	off: "Off",
	emergency: "Emergency"
}, M = O.celsius, N = [
	{
		path: "production.outlet_temperature",
		domain: "sensor",
		suffix: "production_out",
		kind: "number",
		quantity: "temperature",
		unit: M,
		decimals: 1,
		item: "33"
	},
	{
		path: "production.return_temperature",
		domain: "sensor",
		suffix: "production_in",
		kind: "number",
		quantity: "temperature",
		unit: M,
		decimals: 1,
		item: "34"
	},
	{
		path: "production.pressure",
		domain: "sensor",
		suffix: "pressure_production",
		kind: "number",
		unit: O.bar,
		decimals: 1,
		item: "38"
	},
	{
		path: "production.pump",
		domain: "sensor",
		suffix: "production_pump",
		kind: "number",
		unit: O.percent,
		decimals: 1,
		item: "15"
	},
	{
		path: "brine.outlet_temperature",
		domain: "sensor",
		suffix: "brine_out",
		kind: "number",
		quantity: "temperature",
		unit: M,
		decimals: 1,
		item: "31"
	},
	{
		path: "brine.inlet_temperature",
		domain: "sensor",
		suffix: "brine_in",
		kind: "number",
		quantity: "temperature",
		unit: M,
		decimals: 1,
		item: "32"
	},
	{
		path: "brine.pressure",
		domain: "sensor",
		suffix: "pressure_brine",
		kind: "number",
		unit: O.bar,
		decimals: 1,
		item: "37"
	},
	{
		path: "brine.pump",
		domain: "sensor",
		suffix: "brine_pump",
		kind: "number",
		unit: O.percent,
		decimals: 1,
		item: "16"
	},
	{
		path: "compressor.speed",
		domain: "sensor",
		suffix: "compressor_rpm",
		kind: "number",
		unit: O.rpm,
		decimals: 0,
		item: "11"
	},
	{
		path: "compressor.percentage",
		domain: "sensor",
		suffix: "compressor_percentage",
		kind: "number",
		unit: O.percent,
		decimals: 1,
		item: "11"
	},
	{
		path: "compressor.power",
		domain: "sensor",
		suffix: "power_consumption",
		kind: "number",
		quantity: "power",
		unit: O.watt,
		decimals: 0,
		item: "11"
	},
	{
		path: "compressor.suction_temperature",
		domain: "sensor",
		suffix: "compressor_suction_temperature",
		kind: "number",
		quantity: "temperature",
		unit: M,
		decimals: 1,
		item: "29"
	},
	{
		path: "compressor.discharge_temperature",
		domain: "sensor",
		suffix: "compressor_discharge_temperature",
		kind: "number",
		quantity: "temperature",
		unit: M,
		decimals: 1,
		item: "30"
	},
	{
		path: "compressor.suction_pressure",
		domain: "sensor",
		suffix: "compressor_suction_pressure",
		kind: "number",
		unit: O.bar,
		decimals: 1,
		item: "35"
	},
	{
		path: "compressor.discharge_pressure",
		domain: "sensor",
		suffix: "compressor_discharge_pressure",
		kind: "number",
		unit: O.bar,
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
		unit: M,
		decimals: 1,
		item: "8"
	},
	{
		path: "refrigerant.evaporation_temperature",
		domain: "sensor",
		suffix: "evaporation_temperature",
		kind: "number",
		quantity: "temperature",
		unit: M,
		decimals: 1,
		item: "7"
	},
	{
		path: "refrigerant.superheat",
		domain: "sensor",
		suffix: "superheat",
		kind: "number",
		quantity: "difference",
		unit: O.kelvin,
		decimals: 1,
		item: "12"
	},
	{
		path: "refrigerant.expansion_valve",
		domain: "sensor",
		suffix: "expansion_valve_position",
		kind: "number",
		unit: O.percent,
		decimals: 0,
		item: "12"
	},
	{
		path: "heating.capacity",
		domain: "sensor",
		suffix: "condensation_capacity",
		kind: "number",
		quantity: "power",
		unit: O.watt,
		decimals: 0,
		item: "8"
	},
	{
		path: "cooling.capacity",
		domain: "sensor",
		suffix: "evaporation_capacity",
		kind: "number",
		quantity: "power",
		unit: O.watt,
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
		unit: M,
		decimals: 1,
		item: "1/2"
	},
	{
		path: "dhw.temperature",
		domain: "sensor",
		suffix: "dhw_temperature",
		kind: "number",
		quantity: "temperature",
		unit: M,
		decimals: 1,
		item: "tank (54 on C)"
	},
	{
		path: "dhw.setpoint",
		domain: "number",
		suffix: "dhw_setpoint",
		kind: "number",
		quantity: "temperature",
		unit: M,
		decimals: 0,
		item: "tank"
	},
	{
		path: "dhw.start_delta",
		domain: "number",
		suffix: "delta_t_start_dhw",
		kind: "number",
		quantity: "difference",
		unit: O.kelvin,
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
		unit: O.percent,
		decimals: 1,
		item: "air unit"
	},
	{
		path: "source.air_unit_outlet_temperature",
		domain: "sensor",
		suffix: "brine_temperature_air_unit_outlet",
		kind: "number",
		quantity: "temperature",
		unit: M,
		decimals: 1,
		item: "air unit"
	},
	{
		path: "source.outside_temperature",
		domain: "sensor",
		suffix: "outside_temperature",
		kind: "number",
		quantity: "temperature",
		unit: M,
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
], gt = new Map(N.map((e) => [e.path, e])), _t = N.map((e) => e.path);
[...new Set(N.flatMap((e) => "unit" in e ? [e.unit] : []))];
var vt = (e, t) => `${e.domain}.${t}_${e.suffix}`;
// src/calc/readings.ts
function yt(e, t) {
	return t.quantity === void 0 ? $e(e) : ot(e, t.quantity);
}
function bt(e, t) {
	switch (t.kind) {
		case "number": return yt(e, t);
		case "text": return e === void 0 || Qe(e) || ["unavailable", "unknown"].includes(e.state.trim().toLowerCase()) ? void 0 : e.state.trim();
		case "binary": {
			let t = e?.state.trim().toLowerCase();
			return t === "on" || t !== "off" && void 0;
		}
	}
}
function xt(e, t) {
	return Object.fromEntries(N.map((n) => [n.path, bt(et(e, t[n.path]), n)]));
}
// src/lib/config.ts
var St = /^[a-z][a-z0-9_]*\.[a-z0-9_]+$/;
function P(e, t) {
	let n = e;
	for (let e of t.split(".")) {
		if (typeof n != "object" || !n || !Object.hasOwn(n, e)) return;
		n = n[e];
	}
	return n;
}
function Ct(e) {
	if (typeof e != "string") return;
	let t = e.trim();
	return St.test(t) ? t : void 0;
}
function wt(e, t) {
	return Ct(P(e, t));
}
// src/lib/options.ts
var Tt = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, Et = /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|var)\((.*)\)$/i, Dt = /^[#a-zA-Z0-9(),.%\s/+-]+$/, Ot = /* @__PURE__ */ new Set(/* @__PURE__ */ "aliceblue.antiquewhite.aqua.aquamarine.azure.beige.bisque.black.blanchedalmond.blue.blueviolet.brown.burlywood.cadetblue.chartreuse.chocolate.coral.cornflowerblue.cornsilk.crimson.cyan.darkblue.darkcyan.darkgoldenrod.darkgray.darkgreen.darkgrey.darkkhaki.darkmagenta.darkolivegreen.darkorange.darkorchid.darkred.darksalmon.darkseagreen.darkslateblue.darkslategray.darkslategrey.darkturquoise.darkviolet.deeppink.deepskyblue.dimgray.dimgrey.dodgerblue.firebrick.floralwhite.forestgreen.fuchsia.gainsboro.ghostwhite.gold.goldenrod.gray.green.greenyellow.grey.honeydew.hotpink.indianred.indigo.ivory.khaki.lavender.lavenderblush.lawngreen.lemonchiffon.lightblue.lightcoral.lightcyan.lightgoldenrodyellow.lightgray.lightgreen.lightgrey.lightpink.lightsalmon.lightseagreen.lightskyblue.lightslategray.lightslategrey.lightsteelblue.lightyellow.lime.limegreen.linen.magenta.maroon.mediumaquamarine.mediumblue.mediumorchid.mediumpurple.mediumseagreen.mediumslateblue.mediumspringgreen.mediumturquoise.mediumvioletred.midnightblue.mintcream.mistyrose.moccasin.navajowhite.navy.oldlace.olive.olivedrab.orange.orangered.orchid.palegoldenrod.palegreen.paleturquoise.palevioletred.papayawhip.peachpuff.peru.pink.plum.powderblue.purple.rebeccapurple.red.rosybrown.royalblue.saddlebrown.salmon.sandybrown.seagreen.seashell.sienna.silver.skyblue.slateblue.slategray.slategrey.snow.springgreen.steelblue.tan.teal.thistle.tomato.turquoise.violet.wheat.white.whitesmoke.yellow.yellowgreen.transparent.currentcolor".split("."));
function kt(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) if (e[n] === "(" && t++, e[n] === ")" && (t--, t < 0 || t === 0 && n !== e.length - 1)) return !1;
	return t === 0;
}
function At(e) {
	let t = e.trim();
	if (t.length === 0 || t.length > 100 || !Dt.test(t)) return !1;
	if (Tt.test(t) || Ot.has(t.toLowerCase())) return !0;
	let n = Et.exec(t);
	if (n === null || !kt(t)) return !1;
	if (n[1]?.toLowerCase() !== "var") return !0;
	let [r, ...i] = (n[2] ?? "").split(",");
	return /^\s*--[a-zA-Z0-9-]+\s*$/.test(r ?? "") && (i.length === 0 || At(i.join(",")));
}
var jt = (e) => e == null;
function Mt(e) {
	switch (e.kind) {
		case "number": return D.number(String(e.min), String(e.max));
		case "color": return D.color;
		case "boolean": return D.boolean;
		case "choice": return D.choice(e.choices);
		case "list": return D.list;
	}
}
var Nt = (e) => e === null || [
	"string",
	"number",
	"boolean"
].includes(typeof e);
function Pt(e) {
	return e.map((e) => typeof e == "boolean" ? e ? "on" : "off" : e === null ? "" : String(e)).filter((e) => e.trim() !== "");
}
function Ft(e, t) {
	switch (e.kind) {
		case "number": return typeof t == "number" && Number.isFinite(t) && t >= e.min && t <= e.max;
		case "color": return typeof t == "string" && At(t);
		case "boolean": return typeof t == "boolean";
		case "choice": return typeof t == "string" && e.choices.includes(t);
		case "list": return Array.isArray(t) && t.every(Nt);
	}
}
function It(e, t) {
	let n = t.split(".").slice(0, -1);
	for (let t = 1; t <= n.length; t++) {
		let r = n.slice(0, t).join("."), i = P(e, r);
		if (!jt(i) && (typeof i != "object" || Array.isArray(i))) return r;
	}
}
function Lt(e, t) {
	let n = t.flatMap((t) => {
		let n = It(e, t.path);
		if (n !== void 0) return [D.invalid(n, D.object)];
		let r = P(e, t.path);
		return jt(r) || Ft(t, r) ? [] : [D.invalid(t.path, Mt(t))];
	});
	return [...new Set(n)];
}
function Rt(e, t) {
	let n = P(e, t.path);
	if (t.kind === "list" && Array.isArray(n) && Ft(t, n)) {
		let e = Pt(n);
		return e.length > 0 ? e : t.default;
	}
	return jt(n) || !Ft(t, n) ? t.default : n;
}
// src/diagram/colors.ts
var zt = [
	{
		temperature: -10,
		color: "#1e88e5"
	},
	{
		temperature: 20,
		color: "#43a047"
	},
	{
		temperature: 45,
		color: "#fb8c00"
	},
	{
		temperature: 70,
		color: "#e53935"
	}
], Bt = "var(--disabled-text-color)", Vt = (e) => typeof e == "object" && !!e && !Array.isArray(e), Ht = (e) => typeof e == "string" && Lt({ color: e }, [{
	kind: "color",
	path: "color",
	default: ""
}]).length === 0, Ut = (e) => e.map((e) => ({
	temperature: e.temperature,
	color: e.color.trim()
}));
function Wt(e) {
	let t = P(e, "colors");
	if (t == null) return [];
	if (!Array.isArray(t) || t.length < 2 || t.length > 8) return [k.colors];
	let n = t;
	if (!n.every((e) => Vt(e) && typeof e.temperature == "number" && Number.isFinite(e.temperature) && Ht(e.color))) return [k.colors];
	let r = Ut(n).map((e) => e.temperature);
	return r.every((e, t) => t === 0 || e > (r[t - 1] ?? 0)) ? [] : [k.colors];
}
function Gt(e) {
	let t = P(e, "colors");
	return Array.isArray(t) && Wt(e).length === 0 ? Ut(t) : zt;
}
function Kt(e, t = zt) {
	let n = t[0], r = t[t.length - 1];
	if (e === void 0 || !Number.isFinite(e) || n === void 0 || r === void 0) return Bt;
	if (e <= n.temperature) return n.color;
	if (e >= r.temperature) return r.color;
	let i = t.findIndex((t) => t.temperature >= e), a = t[i - 1], o = t[i];
	if (a === void 0 || o === void 0) return r.color;
	let s = Math.round((e - a.temperature) / (o.temperature - a.temperature) * 1e3) / 10;
	return s <= 0 ? a.color : s >= 100 ? o.color : `color-mix(in srgb, ${o.color} ${String(s)}%, ${a.color})`;
}
// src/config/variants.ts
var qt = [
	"active_cooling",
	"passive_cooling",
	"htr",
	"backup_heater"
], F = [
	1,
	2,
	3,
	4
];
function Jt(e) {
	return {
		active_cooling: e === 3 || e === 4,
		passive_cooling: e === 2 || e === 4,
		htr: !0,
		backup_heater: !0
	};
}
function Yt(e, t) {
	return {
		...Jt(e),
		...t
	};
}
// src/config/options.ts
var Xt = ["B", "C"], Zt = [
	"air",
	"ground",
	"hybrid"
], Qt = [
	"external",
	"internal",
	"none"
], $t = {
	kind: "choice",
	path: "model",
	default: "B",
	choices: Xt
}, en = {
	kind: "choice",
	path: "source",
	default: "ground",
	choices: Zt
}, tn = {
	kind: "choice",
	path: "dhw",
	default: "external",
	choices: Qt
}, nn = [
	$t,
	en,
	tn
], rn = [
	"type",
	"model",
	"variant",
	"source",
	"dhw",
	"prefix",
	"features",
	"entities",
	"colors",
	"view_layout",
	"layout_options",
	"grid_options",
	"visibility"
], an = (e) => e === "C" ? "internal" : "external", I = (e) => e == null, on = (e) => I(e) || typeof e == "string" && e.trim() === "", L = (e) => typeof e == "object" && !!e && !Array.isArray(e), sn = /^[a-z0-9_]+$/;
function cn(e) {
	let t = P(e, "prefix");
	return on(t) ? void 0 : t.trim();
}
function ln(e) {
	let t = P(e, "variant");
	return F.find((e) => e === t) ?? 4;
}
function un(e) {
	let t = Rt(e, $t), n = !I(P(e, "dhw"));
	return {
		model: t,
		source: Rt(e, en),
		dhw: n ? Rt(e, tn) : an(t)
	};
}
function dn(e) {
	let t = P(e, "features");
	if (!L(t)) return {};
	let n = {};
	for (let e of qt) {
		let r = t[e];
		(r === !0 || r === !1 || r === "unused") && (n[e] = r);
	}
	return n;
}
var fn = (e) => e === !0 || e === !1 || e === "unused";
function pn(e, t = "") {
	return Object.entries(e).flatMap(([e, n]) => {
		let r = t === "" ? e : `${t}.${e}`;
		return L(n) ? pn(n, r) : [[r, n]];
	});
}
function mn(e) {
	let t = P(e, "variant");
	return I(t) || F.some((e) => e === t) ? [] : [D.invalid("variant", k.integer(String(F[0]), String(F[F.length - 1])))];
}
function hn(e) {
	let t = P(e, "prefix");
	return on(t) || typeof t == "string" && sn.test(t.trim()) ? [] : [D.invalid("prefix", k.prefix)];
}
function gn(e) {
	let t = P(e, "features");
	return I(t) ? [] : L(t) ? Object.entries(t).flatMap(([e, t]) => qt.some((t) => t === e) ? I(t) || fn(t) ? [] : [k.featureState(e)] : [k.unknownFeature(e, qt)]) : [D.invalid("features", D.object)];
}
function _n(e) {
	let t = P(e, "entities");
	return I(t) ? [] : L(t) ? pn(t).flatMap(([e, t]) => on(t) ? [] : gt.has(e) ? Ct(t) === void 0 ? [k.notEntityId(e)] : [] : [k.unknownRole(e)]) : [D.invalid("entities", D.object)];
}
function vn(e) {
	let t = P(e, "entities");
	return L(t) && pn(t).some(([, e]) => !on(e));
}
function yn(e) {
	let t = Object.keys(e).filter((e) => !rn.includes(e)).map((e) => k.unknownOption(e)), n = Lt(e, nn), r = [
		...t,
		...n,
		...mn(e),
		...hn(e),
		...gn(e),
		..._n(e),
		...Wt(e)
	];
	if (Lt(e, [$t, tn]).length === 0 && !I(P(e, "dhw"))) {
		let { model: t, dhw: n } = un(e);
		(t === "B" && n === "internal" || t === "C" && n === "external") && r.push(k.dhwMismatch(n, t));
	}
	return r;
}
// src/config/sample.ts
var bn = (e) => `ecogeo_sample.${e.replace(".", "_")}`, xn = {
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
}, Sn = "2026-01-01T12:00:00Z", Cn = Object.fromEntries(_t.map((e) => [e, bn(e)])), wn = Object.fromEntries(_t.map((e) => {
	let t = gt.get(e)?.unit, n = bn(e);
	return [n, {
		entity_id: n,
		state: xn[e],
		last_updated: Sn,
		attributes: t === void 0 ? {} : { unit_of_measurement: t }
	}];
}));
// src/config/resolve.ts
function Tn(e, t) {
	return Object.fromEntries(N.map((n) => [n.path, wt(e, `entities.${n.path}`) ?? (t === void 0 ? void 0 : vt(n, t))]));
}
var En = (e) => cn(e) === void 0 && !vn(e);
function Dn(e) {
	let t = cn(e), n = ln(e), r = En(e);
	return {
		...un(e),
		variant: n,
		prefix: t,
		colors: Gt(e),
		features: Yt(n, dn(e)),
		entities: r ? Cn : Tn(e, t),
		sample: r
	};
}
// src/diagram/geometry.ts
var On = {
	width: 1e3,
	height: 620
}, kn = {
	x: 240,
	y: 130,
	width: 520,
	height: 475
}, R = {
	x: 408,
	y: 138,
	width: 182,
	height: 66
}, An = {
	x: 806,
	y: 150,
	width: 178,
	height: 180
}, z = {
	x: 40,
	y: 120,
	width: 150,
	height: 180,
	fanX: 115,
	fanY: 250,
	fanRadius: 36,
	fins: {
		x: 76,
		step: 12,
		count: 7,
		y0: 144,
		y1: 192
	},
	captionX: 95,
	captionY: 112
}, jn = {
	ground: 160,
	hybrid: 350
}, Mn = {
	x: 105,
	y: {
		ground: 320,
		hybrid: 510
	}
}, B = (e, t, n, r, i, a, o = {}) => ({
	item: e,
	kind: t,
	x: n,
	y: r,
	rotation: i,
	tag: a,
	...o
}), Nn = [
	B(1, "port", 270, 130, 0, [
		-7,
		-8,
		"end"
	]),
	B(2, "port", 312, 130, 0, [
		-7,
		-8,
		"end"
	]),
	B(3, "port", 630, 130, 0, [
		-7,
		-8,
		"end"
	]),
	B(4, "port", 690, 130, 0, [
		-7,
		-8,
		"end"
	]),
	B(5, "port", 722, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "external" }),
	B(6, "port", 748, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "external" }),
	B(47, "port", 440, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "internal" }),
	B(48, "port", 490, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "internal" }),
	B(49, "port", 540, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "internal" }),
	B(7, "exchanger", 572, 382, 0, [
		-26,
		6,
		"end"
	], { size: 34 }),
	B(8, "exchanger", 432, 382, 0, [
		-26,
		6,
		"end"
	], { size: 34 }),
	B(9, "exchanger", 373, 273, 0, [
		26,
		-2,
		"start"
	], {
		size: 23,
		feature: "htr"
	}),
	B(11, "compressor", 510, 250, 0, [
		0,
		-26,
		"middle"
	]),
	B(12, "expansion_valve", 527, 416, 0, [
		0,
		-14,
		"middle"
	]),
	B(13, "filter_dryer", 487, 416, 0, [
		0,
		-14,
		"middle"
	]),
	B(14, "inversion_valve", 430, 296, 0, [
		-16,
		22,
		"end"
	], { feature: "active_cooling" }),
	B(29, "probe_t", 542, 234, 0, [
		0,
		-14,
		"middle"
	]),
	B(30, "probe_t", 430, 234, 0, [
		0,
		-14,
		"middle"
	]),
	B(35, "transducer_p", 564, 234, 0, [
		0,
		-14,
		"middle"
	]),
	B(36, "transducer_p", 474, 234, 0, [
		0,
		-14,
		"middle"
	]),
	B(39, "pressure_switch", 586, 234, 0, [
		0,
		-14,
		"middle"
	]),
	B(40, "pressure_switch", 452, 234, 0, [
		0,
		-14,
		"middle"
	]),
	B(41, "service_outlet", 464, 406, 0, [
		0,
		28,
		"middle"
	]),
	B(41, "service_outlet", 620, 270, 90, [
		0,
		14,
		"middle"
	]),
	B(10, "exchanger", 520, 470, 0, [
		28,
		4,
		"start"
	], {
		size: 22,
		feature: "passive_cooling"
	}),
	B(15, "pump", 385, 416, 0, [
		0,
		-19,
		"middle"
	]),
	B(16, "pump", 690, 300, 90, [
		19,
		4,
		"start"
	]),
	B(17, "pump", 340, 226, 90, [
		-14,
		4,
		"end"
	], {
		feature: "htr",
		dhw: "any"
	}),
	B(18, "vessel", 725, 520, 0, [
		-16,
		4,
		"end"
	]),
	B(19, "vessel", 368, 556, 0, [
		-16,
		4,
		"end"
	]),
	B(20, "safety_valve", 741, 440, 90, [
		0,
		-14,
		"middle"
	]),
	B(21, "safety_valve", 384, 520, 90, [
		0,
		-14,
		"middle"
	]),
	B(22, "valve", 340, 256, 0, [
		-10,
		4,
		"end"
	], {
		feature: "htr",
		dhw: "any"
	}),
	B(23, "drain_valve", 630, 572, 0, [
		14,
		4,
		"start"
	]),
	B(24, "drain_valve", 404, 572, 0, [
		14,
		4,
		"start"
	]),
	B(25, "drain_valve", 340, 318, 0, [
		-10,
		4,
		"end"
	], {
		feature: "htr",
		dhw: "any"
	}),
	B(26, "valve3", 270, 172, 270, [
		-14,
		22,
		"end"
	], { dhw: "any" }),
	B(27, "valve3", 350, 416, 0, [
		0,
		-24,
		"middle"
	], { feature: "passive_cooling" }),
	B(28, "valve3", 610, 416, 0, [
		0,
		-24,
		"middle"
	], { feature: "passive_cooling" }),
	B(31, "probe_t", 614, 228, 270, [
		0,
		-14,
		"middle"
	]),
	B(32, "probe_t", 674, 228, 270, [
		0,
		-14,
		"middle"
	]),
	B(33, "probe_t", 254, 228, 270, [
		0,
		-14,
		"middle"
	]),
	B(34, "probe_t", 296, 228, 270, [
		0,
		-14,
		"middle"
	]),
	B(37, "transducer_p", 709, 440, 270, [
		0,
		-14,
		"middle"
	]),
	B(38, "transducer_p", 352, 520, 270, [
		0,
		-14,
		"middle"
	]),
	B(44, "resistor", 270, 320, 90, [
		12,
		6,
		"start"
	], { feature: "backup_heater" }),
	B(45, "thermostat", 286, 282, 90, [
		0,
		-12,
		"middle"
	], { feature: "backup_heater" }),
	B(50, "tank", R.x + R.width / 2, R.y + R.height / 2, 0, [
		-80,
		-17,
		"start"
	], { dhw: "internal" }),
	B(51, "coil", 495, 185, 0, [
		0,
		-25,
		"middle"
	], { dhw: "internal" }),
	B(52, "service_outlet", 395, 162, 0, [
		-8,
		4,
		"end"
	], { dhw: "internal" }),
	B(53, "drain_valve", 599, 196, 270, [
		0,
		-12,
		"middle"
	], { dhw: "internal" }),
	B(54, "probe_t", 574, 171, 270, [
		0,
		-14,
		"middle"
	], { dhw: "internal" })
], Pn = (e) => e.split(" ").map((e) => {
	let [t, n] = e.split(",").map(Number);
	return [t ?? 0, n ?? 0];
}), V = (e, t, n, r, i = {}) => ({
	id: e,
	circuit: t,
	points: Pn(n),
	temperatureRole: r,
	direction: 1,
	...i
}), H = ["production_dg1"], U = ["production_dg1", "production_dhw"], W = "production.outlet_temperature", G = "production.return_temperature", K = "production.pump", q = "brine.inlet_temperature", J = "brine.outlet_temperature", Y = "brine.pump", X = "compressor.discharge_temperature", Fn = "compressor.suction_temperature", In = "refrigerant.condensation_temperature", Ln = "refrigerant.evaporation_temperature", Z = "compressor.percentage", Q = "dhw.temperature", Rn = "source.air_unit_outlet_temperature", zn = [
	"dhw_sup_b",
	"dhw_sup_c",
	"dhw_ret_b",
	"dhw_ret_c",
	"dhw_ext_in",
	"dhw_ext_coil",
	"dhw_ext_out"
], Bn = [
	V("p1_stub", H, "270,130 270,118", W, { stub: !0 }),
	V("p2_stub", H, "312,118 312,130", G, { stub: !0 }),
	V("p1_up", H, "270,160 270,130", W, {
		dhw: "any",
		speedRole: K
	}),
	V("p1_direct", H, "270,184 270,130", W, {
		dhw: "none",
		speedRole: K
	}),
	V("p2_in", H, "312,130 312,198", G, { speedRole: K }),
	V("prod_44_26", U, "270,292 270,184", W, { speedRole: K }),
	V("prod_bypass44", U, "270,348 270,292", W, {
		bypass: "backup_heater",
		speedRole: K
	}),
	V("prod_8_44", U, "420,348 270,348", W, { speedRole: K }),
	V("prod_15_8", U, "397,416 420,416", G, { speedRole: K }),
	V("trunk", U, "312,198 312,416", G, { speedRole: K }),
	V("prod_27_in", U, "312,416 338,416", G, {
		through: "passive_cooling",
		speedRole: K,
		onlyWhen: { valves2728: "closed" }
	}),
	V("prod_27_15", U, "362,416 373,416", G, {
		through: "passive_cooling",
		speedRole: K
	}),
	V("prod_bypass27", U, "312,416 373,416", G, {
		bypass: "passive_cooling",
		speedRole: K
	}),
	V("prod_10_in", ["exchanger_10"], "312,416 312,492 508,492", G, {
		feature: "passive_cooling",
		speedRole: K
	}),
	V("prod_10_out", ["exchanger_10"], "508,448 350,448 350,428", W, {
		feature: "passive_cooling",
		speedRole: K
	}),
	V("prod_tap_a", U, "368,416 368,520", G, { stub: !0 }),
	V("prod_tap_b", U, "368,520 368,544", G, { stub: !0 }),
	V("prod_drain", U, "404,416 404,563", G, { stub: !0 }),
	V("dhw_sup_a", ["production_dhw"], "282,172 361,172", W, {
		dhw: "any",
		speedRole: K
	}),
	V("dhw_sup_b", ["dhw_coil"], "361,172 420,172", W, {
		dhw: "any",
		speedRole: K
	}),
	V("dhw_sup_c", ["dhw_coil"], "420,172 722,172 722,130", W, {
		dhw: "external",
		speedRole: K
	}),
	V("dhw_ret_c", ["dhw_coil"], "748,130 748,198 420,198", G, {
		dhw: "external",
		speedRole: K
	}),
	V("dhw_ret_b", ["dhw_coil"], "420,198 340,198", G, {
		dhw: "any",
		speedRole: K
	}),
	V("dhw_ret_a", ["production_dhw"], "340,198 312,198", G, {
		dhw: "any",
		speedRole: K
	}),
	V("htr_in", ["htr"], "340,198 340,214", Q, {
		feature: "htr",
		dhw: "any"
	}),
	V("htr_pump", ["htr"], "340,238 340,247", Q, {
		feature: "htr",
		dhw: "any"
	}),
	V("htr_to_9", ["htr"], "340,265 340,296 361,296", Q, {
		feature: "htr",
		dhw: "any"
	}),
	V("htr_drain", ["htr"], "340,296 340,309", Q, {
		feature: "htr",
		dhw: "any",
		stub: !0
	}),
	V("htr_riser", ["htr"], "361,250 361,172", Q, {
		feature: "htr",
		dhw: "any"
	}),
	V("dhw_ext_in", ["dhw_coil"], "722,130 722,50 940,50 940,190", W, {
		dhw: "external",
		speedRole: K
	}),
	V("dhw_ext_coil", ["dhw_coil"], "940,190 840,190 840,235 940,235 940,280 840,280", W, {
		dhw: "external",
		speedRole: K
	}),
	V("dhw_ext_out", ["dhw_coil"], "840,280 820,280 820,85 748,85 748,130", G, {
		dhw: "external",
		speedRole: K
	}),
	V("tap_47", ["dhw_coil"], "440,118 440,138", Q, {
		dhw: "internal",
		stub: !0
	}),
	V("tap_48", ["dhw_coil"], "490,138 490,118", Q, {
		dhw: "internal",
		stub: !0
	}),
	V("tap_49", ["dhw_coil"], "540,118 540,138", Q, {
		dhw: "internal",
		stub: !0
	}),
	V("src_out", ["brine"], "630,130 630,85 150,85", J, { speedRole: Y }),
	V("src_in", ["brine"], "20,50 690,50 690,130", q, { speedRole: Y }),
	V("src_air_feed", ["brine"], "150,85 150,150", J, {
		source: ["air", "hybrid"],
		speedRole: Y
	}),
	V("src_air_coil", ["brine"], "150,150 70,150 70,168 150,168 150,186 70,186", J, {
		source: ["air", "hybrid"],
		speedRole: Y
	}),
	V("src_air_exit", ["brine"], "70,186 20,186 20,50", Rn, {
		source: ["air"],
		speedRole: Y
	}),
	V("src_gnd_feed", ["brine"], "150,85 150,210", J, {
		source: ["ground"],
		speedRole: Y
	}),
	V("src_gnd_loop", ["brine"], "150,210 60,210 60,250 150,250 150,290 20,290", J, {
		source: ["ground"],
		speedRole: Y
	}),
	V("src_gnd_exit", ["brine"], "20,290 20,50", q, {
		source: ["ground"],
		speedRole: Y
	}),
	V("src_hyb_link", ["brine"], "70,186 29,186 29,390", Rn, {
		source: ["hybrid"],
		speedRole: Y
	}),
	V("src_hyb_loop", ["brine"], "29,390 150,390 150,420 60,420 60,450 150,450 150,480 20,480", Rn, {
		source: ["hybrid"],
		speedRole: Y
	}),
	V("src_hyb_exit", ["brine"], "20,480 20,50", q, {
		source: ["hybrid"],
		speedRole: Y
	}),
	V("ref_discharge", ["refrigerant"], "496,250 385,250", X, {
		through: "htr",
		speedRole: Z
	}),
	V("ref_9_14", ["refrigerant"], "385,296 416,296", X, {
		through: "htr",
		speedRole: Z
	}),
	V("ref_discharge_direct", ["refrigerant"], "496,250 416,250 416,296", X, {
		bypass: "htr",
		speedRole: Z
	}),
	V("ref_14_8", ["refrigerant"], "444,306 444,348", X, {
		through: "active_cooling",
		reversible: !0,
		speedRole: Z
	}),
	V("ref_7_14", ["refrigerant"], "560,348 560,296 444,296", Fn, {
		through: "active_cooling",
		reversible: !0,
		speedRole: Z
	}),
	V("ref_suction", ["refrigerant"], "444,286 610,286 610,250 524,250", Fn, {
		through: "active_cooling",
		speedRole: Z
	}),
	V("ref_direct_8", ["refrigerant"], "416,296 444,296 444,348", X, {
		bypass: "active_cooling",
		speedRole: Z
	}),
	V("ref_direct_suction", ["refrigerant"], "560,348 560,286 610,286 610,250 524,250", Fn, {
		bypass: "active_cooling",
		speedRole: Z
	}),
	V("ref_8_13", ["refrigerant"], "444,416 473,416", In, {
		reversible: !0,
		speedRole: Z
	}),
	V("ref_13_12", ["refrigerant"], "501,416 515,416", In, {
		reversible: !0,
		speedRole: Z
	}),
	V("ref_12_7", ["refrigerant"], "539,416 560,416", Ln, {
		reversible: !0,
		speedRole: Z
	}),
	V("ln4_a", ["brine"], "690,130 690,288", q, { speedRole: Y }),
	V("ln4_b", ["brine"], "690,312 690,348", q, { speedRole: Y }),
	V("br_feed7", ["brine"], "690,348 584,348", q, {
		speedRole: Y,
		onlyWhen: { valves2728: "closed" }
	}),
	V("brine_7_28", ["brine"], "584,416 598,416", J, {
		through: "passive_cooling",
		speedRole: Y,
		onlyWhen: { valves2728: "closed" }
	}),
	V("brine_28_ln3", ["brine"], "622,416 630,416", J, {
		through: "passive_cooling",
		speedRole: Y
	}),
	V("brine_bypass28", ["brine"], "584,416 630,416", J, {
		bypass: "passive_cooling",
		speedRole: Y
	}),
	V("ln3", ["brine"], "630,416 630,130", J, { speedRole: Y }),
	V("br_10_in", ["exchanger_10"], "690,348 690,448 532,448", q, {
		feature: "passive_cooling",
		speedRole: Y
	}),
	V("br_10_28", ["exchanger_10"], "532,492 610,492 610,428", J, {
		feature: "passive_cooling",
		speedRole: Y
	}),
	V("brine_tap_a", ["brine"], "690,270 725,270 725,480", q, { stub: !0 }),
	V("brine_tap_b", ["brine"], "725,480 725,508", q, { stub: !0 }),
	V("brine_drain", ["brine"], "630,416 630,563", J, { stub: !0 })
], Vn = [
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
], Hn = [
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
], Un = (e, t) => t === "htr" && e.dhw === "none" ? !1 : e.features[t], Wn = (e, t) => e === "any" ? t !== "none" : e === t;
function Gn(e, t) {
	if (e.source !== void 0 && !e.source.includes(t.source) || e.dhw !== void 0 && !Wn(e.dhw, t.dhw) || e.bypass !== void 0 && Un(t, e.bypass) !== !1 || e.through !== void 0 && Un(t, e.through) === !1) return "hidden";
	if (e.feature !== void 0) {
		let n = Un(t, e.feature);
		if (n === !1) return "hidden";
		if (n === "unused") return "muted";
	}
	return "normal";
}
function Kn(e, t) {
	return e.flatMap((e) => {
		let n = Gn(e, t);
		return n === "hidden" ? [] : [{
			part: e,
			state: n
		}];
	});
}
var qn = (e) => Kn(Nn, e), Jn = (e) => Kn(Bn, e), Yn = (e, t) => (e.onlyWhen === void 0 || e.onlyWhen.valves2728 === t.valves2728) && e.circuit.some((e) => t.active.has(e)), Xn = (e, t) => e[0] === t[0] && e[1] === t[1];
function Zn(e, t) {
	let n = e[t];
	if (n === void 0) throw Error(`No point ${String(t)}`);
	return n;
}
var Qn = (e) => e.slice(1).map((t, n) => [Zn(e, n), t]), $n = (e, t, n) => e >= Math.min(t, n) && e <= Math.max(t, n);
function er(e, t = []) {
	let n = [], r, i = (e) => {
		n.push(r === void 0 ? `M${String(e[0])} ${String(e[1])}` : `L${String(e[0])} ${String(e[1])}`), r = e;
	}, a = (e) => {
		n.push(`M${String(e[0])} ${String(e[1])}`), r = e;
	};
	i(Zn(e, 0));
	for (let [n, r] of Qn(e)) {
		let e = Math.sign(r[0] - n[0]), o = Math.sign(r[1] - n[1]), s = Math.abs(r[0] - n[0]) + Math.abs(r[1] - n[1]), c = t.filter((e) => tr(e, n, r) && !Xn(e, n) && !Xn(e, r)).sort((e, t) => Math.abs(e[0] - n[0]) + Math.abs(e[1] - n[1]) - (Math.abs(t[0] - n[0]) + Math.abs(t[1] - n[1])));
		for (let t of c) {
			let c = Math.abs(t[0] - n[0]) + Math.abs(t[1] - n[1]);
			c > 5 && i([t[0] - e * 5, t[1] - o * 5]), a(s - c > 5 ? [t[0] + e * 5, t[1] + o * 5] : r);
		}
		i(r);
	}
	return n.join(" ");
}
var tr = (e, t, n) => t[0] === n[0] && e[0] === t[0] && $n(e[1], t[1], n[1]) || t[1] === n[1] && e[1] === t[1] && $n(e[0], t[0], n[0]);
function nr(e, t) {
	return Vn.filter((n) => n.under === e && t.has(n.over) && t.has(n.under)).map((e) => e.at);
}
// src/diagram/pipes.ts
var rr = 1.2, ir = .6, ar = [
	"tap_47",
	"tap_48",
	"tap_49"
], or = [
	"prod_27_15",
	"prod_15_8",
	"prod_tap_a",
	"prod_tap_b",
	"prod_drain"
];
function sr(e) {
	if (e !== void 0 && e > 0) return Math.min(8, Math.max(ir, rr * 100 / e));
}
var cr = {
	"compressor.discharge_temperature": "compressor.suction_temperature",
	"compressor.suction_temperature": "compressor.discharge_temperature",
	"refrigerant.condensation_temperature": "refrigerant.evaporation_temperature",
	"refrigerant.evaporation_temperature": "refrigerant.condensation_temperature"
}, lr = (e, t) => zn.includes(e.id) && ur(t), ur = (e) => e.active.has("htr") && !e.active.has("production_dhw");
function dr(e, t) {
	return lr(e, t.circuits) ? "dhw.temperature" : e.reversible === !0 && t.mode === "active_cooling" ? cr[e.temperatureRole] ?? e.temperatureRole : (t.mode === "passive_cooling" || t.mode === "defrost") && t.circuits.valves2728 === "exchanger" && or.includes(e.id) ? "production.outlet_temperature" : e.temperatureRole;
}
function fr(e, t, n) {
	return t === "muted" && n === "defrost" && e.feature === "passive_cooling" ? "normal" : t;
}
var pr = (e, t) => {
	let n = e[t];
	return typeof n == "number" ? n : void 0;
};
function mr(e, t, n) {
	let { mode: r, circuits: i, readings: a, stops: o } = n, s = ar.includes(e.id), c = fr(e, t, r), l = s || Yn(e, i), u = pr(a, dr(e, n)), d = c === "muted" || !l || u === void 0, ee = e.direction === -1 != (e.reversible === !0 && r === "active_cooling"), te = {
		color: d ? Bt : Kt(u, o),
		muted: d,
		reversed: ee
	};
	if (!l || c === "muted" || e.stub === !0 || s) return {
		...te,
		animated: !1
	};
	let ne = lr(e, i) || e.speedRole === void 0 && e.circuit.includes("htr") ? 3 : e.speedRole === void 0 ? void 0 : sr(pr(a, e.speedRole));
	return ne === void 0 ? {
		...te,
		animated: !1
	} : {
		...te,
		animated: !0,
		duration: ne
	};
}
var hr = (e) => Kt(pr(e.readings, "dhw.temperature"), e.stops);
function gr(e) {
	let { circuits: t, readings: n, stops: r } = e;
	return ur(t) ? Kt(pr(n, "dhw.temperature"), r) : t.active.has("dhw_coil") ? Kt(pr(n, "production.outlet_temperature"), r) : Bt;
}
// src/diagram/symbols.ts
var _r = (e, t) => x`<text class="glyph" text-anchor="middle" dominant-baseline="central" font-size="9" fill="currentColor" stroke="none" transform="rotate(${-t})">${e}</text>`;
function vr(e, t, n) {
	let r = Array.from({ length: 14 }, (r, i) => {
		let a = i + 1;
		return `L${String(e + (t - e) * a / 15)} ${String(n + (a % 2 == 1 ? -3 : 3))}`;
	});
	return `M${String(e)} ${String(n)} ${r.join(" ")} L${String(t)} ${String(n)}`;
}
var yr = (e, t) => x`<path d="M0 ${t} V${e}" />`, br = (e, t) => x`<path d="${e}" fill=${t ? "currentColor" : "none"} />`;
function xr(e, t) {
	let n = t.rotation ?? 0;
	switch (e) {
		case "pump": return x`<circle r="12" /><path d="M-5 -7 V7 L8 0 Z" fill="currentColor" />`;
		case "valve3": {
			let e = t.open ?? ["l", "r"];
			return x`${br("M-12 -6 V6 L0 0 Z", e.includes("l"))}${br("M12 -6 V6 L0 0 Z", e.includes("r"))}${br("M-6 12 H6 L0 0 Z", e.includes("d"))}<rect x="-4" y="-21" width="8" height="8" /><path d="M0 -13 V-8" />`;
		}
		case "inversion_valve": return x`<rect x="-10" y="-14" width="20" height="28" rx="3" /><path d="M-14 0 H-10 M10 -10 H14 M10 0 H14 M10 10 H14" />${t.reversed === !0 ? x`<path d="M-14 0 H14 M14 10 H5 V-10 H14" />` : x`<path d="M-14 0 H-5 V10 H14 M14 0 H5 V-10 H14" />`}`;
		case "probe_t": return x`<circle r="9" />${yr(16, 9)}${_r("T", n)}`;
		case "transducer_p": return x`<circle r="9" />${yr(16, 9)}${_r("P", n)}`;
		case "pressure_switch": return x`<rect x="-7" y="-7" width="14" height="14" />${yr(16, 7)}${_r("P", n)}`;
		case "thermostat": return x`<rect x="-7" y="-7" width="14" height="14" />${yr(16, 7)}${_r("T", n)}`;
		case "exchanger": {
			let e = t.size ?? 34;
			return x`<rect x="-20" y="${-e - 9}" width="40" height="${2 * e + 18}" rx="4" /><path d="M-12 ${-e} V${e} M12 ${-e} V${e}" /><circle cx="-12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="-12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" />`;
		}
		case "compressor": return x`<circle r="14" /><path d="M0 -8 A8 8 0 1 0 8 0 M0 -8 L6 -4" />`;
		case "vessel": return x`<circle r="12" /><path d="M-12 2 H12" />`;
		case "safety_valve": return x`<path d="M0 16 V6 M-6 6 H6 L0 -4 Z M0 -4 L-3 -7 L3 -10 L0 -13" />`;
		case "valve": return x`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "drain_valve": return x`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "resistor": return x`<rect x="-28" y="-6" width="56" height="12" rx="2" /><path d="M-18 -6 V6 M18 -6 V6" />`;
		case "filter_dryer": return x`<rect x="-14" y="-5" width="28" height="10" rx="5" />`;
		case "expansion_valve": return x`<path d="M-12 -6 V6 L0 0 L12 -6 V6 L0 0 Z" />`;
		case "service_outlet": return x`<rect x="-3" y="-3" width="6" height="6" />${yr(10, 3)}`;
		case "port": return x`<rect x="-5" y="-6" width="10" height="6" />`;
		case "tank": return x`<rect class="tank-body" data-dhw-tank="internal" x=${-R.width / 2} y=${-R.height / 2} width=${R.width} height=${R.height} rx="14" fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />`;
		case "coil": return x`<path d="${vr(-75, 60, -13)} M60 -13 V13 ${vr(60, -75, 13).replace("M60 13 ", "")}" />`;
	}
}
function Sr(e, t = {}) {
	return x`<g class="symbol ${e}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${t.rotation ?? 0})">${xr(e, t)}</g>`;
}
// src/diagram/cabinet.ts
var Cr = o`
  .outline {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: 2;
  }
  .pipe {
    fill: none;
    stroke: var(--secondary-text-color);
    stroke-width: 2;
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
    stroke-width: 2;
    stroke-linecap: round;
    stroke-dasharray: 2 12;
    animation: flow-dash var(--flow-duration, 2s) linear infinite;
  }
  .flow.reversed {
    animation-direction: reverse;
  }
  @keyframes flow-dash {
    to {
      stroke-dashoffset: -14;
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
function wr(e, t) {
	return e === 26 ? t.valve26 === "dhw" ? ["l", "d"] : ["l", "r"] : t.valves2728 === "exchanger" ? ["d", "r"] : ["l", "r"];
}
function Tr(e, t) {
	let { part: n } = e, { circuits: r } = t, i = fr(n, e.state, t.mode), [a, o, s] = n.tag;
	return x`<g class="symbol-group ${i}" data-item=${n.item} data-kind=${n.kind} style=${n.kind === "coil" ? `color: ${gr(t)}` : C}>
    <g transform="translate(${n.x} ${n.y})">${Sr(n.kind, {
		rotation: n.rotation,
		size: n.size,
		open: n.kind === "valve3" ? wr(n.item, r) : void 0,
		reversed: n.kind === "inversion_valve" ? r.valve14 === "reversed" : void 0
	})}</g>
    <text class="item" x=${n.x + a} y=${n.y + o} text-anchor=${s ?? "start"}>${n.item}</text>
  </g>`;
}
function Er(e, t, n, r) {
	let i = mr(e, t, n), a = er(e.points, r);
	return x`<path class="pipe ${i.muted ? "muted" : ""}" data-segment=${e.id} style=${i.muted ? C : `stroke: ${i.color}`} d=${a} />${i.animated ? x`<path class="flow ${i.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(i.duration)}s" d=${a} />` : C}`;
}
function Dr(e, t) {
	let n = Jn(e), r = new Set(n.map((e) => e.part.id));
	return x`<g class="cabinet">
    <rect class="outline" x=${kn.x} y=${kn.y} width=${kn.width} height=${kn.height} rx="6" />
    ${Hn.filter((t) => Gn(t, e) !== "hidden").map((e) => x`<text class="circuit-label" x=${e.x} y=${e.y} text-anchor="middle">${ft[e.key]}</text>`)}
    ${n.map((e) => Er(e.part, e.state, t, nr(e.part.id, r)))}
    ${qn(e).map((e) => Tr(e, t))}
  </g>`;
}
// src/diagram/dhw.ts
var Or = o`
  .tank-body {
    stroke: var(--primary-text-color);
    stroke-width: 2;
  }
  .tank-caption {
    fill: var(--secondary-text-color);
    font-size: 11px;
  }
`;
function kr(e) {
	if (e.dhw !== "external") return x``;
	let { x: t, y: n, width: r, height: i } = An;
	return x`<g class="dhw-storage" data-dhw="external">
    <rect class="tank-body" data-dhw-tank="external" x=${t} y=${n} width=${r} height=${i} rx="22" fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />
    <text class="tank-caption" x=${t + r / 2} y=${n - 6} text-anchor="middle">${mt.externalTank}</text>
  </g>`;
}
// src/lib/format.ts
var Ar = "−";
function jr(e) {
	let t = e?.locale;
	return typeof t == "object" && t ? t : e?.language === void 0 ? {} : { language: e.language };
}
function Mr(e) {
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
var Nr = /* @__PURE__ */ new Map();
function Pr(e, t, n) {
	let r = Mr(e), i = n && e.number_format !== "none", a = `${r?.join(",") ?? ""}|${String(t)}|${String(i)}`, o = Nr.get(a);
	return o === void 0 && (o = new Intl.NumberFormat(r, {
		minimumFractionDigits: t,
		maximumFractionDigits: t,
		useGrouping: i
	}), Nr.set(a, o)), o;
}
function Fr(e, t, n = 0, r = !0) {
	if (!Number.isFinite(e)) return "–";
	let i = Number.isFinite(n) ? Math.min(20, Math.max(0, Math.trunc(n))) : 0, a = Math.abs(e) < .5 / 10 ** i ? 0 : e;
	return Pr(t ?? {}, i, r).formatToParts(a).map((e) => e.type === "minusSign" ? Ar : e.value).join("");
}
// src/calc/display.ts
function Ir(e) {
	if (typeof e != "object" || !e) return;
	let t = e.display_precision;
	return typeof t == "number" && Number.isInteger(t) && t >= 0 && t <= 20 ? t : void 0;
}
var Lr = (e, t) => t ?? e.decimals ?? 0;
function Rr(e, t) {
	let n = typeof t == "string" ? t.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase() : "";
	return n === (e.unit ?? "").toLowerCase() || e.quantity === "difference" && n === "°c";
}
function zr(e, t, n, r) {
	let i = gt.get(e);
	if (i === void 0 || t === void 0 || !Number.isFinite(t)) return;
	let a = n === void 0 || !Rr(i, r.states?.[n]?.attributes.unit_of_measurement) ? void 0 : Ir(r.entities?.[n]), o = Fr(t, r.locale, Lr(i, a), !1);
	return i.unit === void 0 ? o : `${o} ${i.unit}`;
}
// src/diagram/labels.ts
var Br = o`
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
}), Vr = 895, Hr = [
	$("production_out", "production.outlet_temperature", 237, 228, "end", { item: 33 }),
	$("production_in", "production.return_temperature", 291, 247, "middle", { item: 34 }),
	$("production_pressure", "production.pressure", 360, 537, "end", { item: 38 }),
	$("production_pump", "production.pump", 396, 380, "end", { item: 15 }),
	$("dg1_setpoint", "heating.setpoint", 291, 96, "middle", { item: 1 }),
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
		caption: A.fan
	}),
	$("outside_temperature", "source.outside_temperature", 115, 325, "middle", {
		source: ["air", "hybrid"],
		caption: A.outside
	}),
	$("air_unit_outlet", "source.air_unit_outlet_temperature", 115, 338, "middle", {
		source: ["air", "hybrid"],
		caption: A.airOutlet
	}),
	$("ground_out", "brine.outlet_temperature", 158, 203, "start", {
		source: ["ground"],
		caption: A.groundOut
	}),
	$("ground_in", "brine.inlet_temperature", 158, 290, "start", {
		source: ["ground"],
		caption: A.groundIn
	}),
	$("hybrid_ground_in", "brine.inlet_temperature", 158, 480, "start", {
		source: ["hybrid"],
		caption: A.groundIn
	}),
	...["external", "internal"].flatMap((e) => {
		let t = e === "external" ? 352 : 152;
		return [
			$(`tank_${e}_temperature`, "dhw.temperature", Vr, t, "middle", {
				dhw: e,
				emphasis: !0
			}),
			$(`tank_${e}_setpoint`, "dhw.setpoint", Vr, t + 15, "middle", {
				dhw: e,
				caption: A.setpoint
			}),
			$(`tank_${e}_start_delta`, "dhw.start_delta", Vr, t + 29, "middle", {
				dhw: e,
				caption: A.startDelta
			}),
			$(`tank_${e}_demand`, "dhw.demand", Vr, t + 43, "middle", {
				dhw: e,
				demand: !0
			})
		];
	})
];
function Ur(e, t, n, r) {
	return Hr.flatMap((i) => {
		if (Gn(i, e) === "hidden") return [];
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
		if (i.demand === !0) return s === !0 ? [{
			...o,
			text: mt.demand,
			missing: !1
		}] : [];
		let c = zr(i.role, typeof s == "number" ? s : void 0, a, r);
		return [{
			...o,
			text: c ?? "–",
			missing: c === void 0
		}];
	});
}
function Wr(e, t, n) {
	let r = (e, n, r, i) => ({
		id: e,
		...r === void 0 ? {} : { caption: r },
		text: i ?? "–",
		missing: i === void 0,
		entityId: t[n]
	}), i = (i, a, o) => {
		let s = e[a];
		return r(i, a, o, zr(a, typeof s == "number" ? s : void 0, t[a], n));
	}, a = e["unit.on_off"], o = e["unit.summer"] === !0 ? j.summer : e["unit.winter"] === !0 ? j.winter : void 0;
	return [
		r("on_off", "unit.on_off", void 0, a === void 0 ? void 0 : ht[a.toLowerCase()] ?? a),
		r("season", e["unit.summer"] === !0 ? "unit.summer" : "unit.winter", void 0, o),
		i("outside_temperature", "source.outside_temperature", j.outside),
		i("cop", "unit.cop", j.cop),
		i("condensation_capacity", "heating.capacity", j.condensation),
		i("evaporation_capacity", "cooling.capacity", j.evaporation)
	];
}
var Gr = (e) => ({
	left: `${String(e.x / On.width * 100)}%`,
	top: `${String(e.y / On.height * 100)}%`
});
function Kr(e, t, n, r) {
	let i = n ? "value missing" : "value";
	return e === void 0 || r === void 0 ? b`<span class=${i}>${t}</span>` : b`<button
        class=${i}
        type="button"
        @click=${() => {
		r(e);
	}}
      >
        ${t}
      </button>`;
}
function qr(e, t) {
	return b`${e.map((e) => {
		let { left: n, top: r } = Gr(e);
		return b`<span
      class="label ${e.align}${e.emphasis ? " emphasis" : ""}"
      data-label=${e.id}
      data-role=${e.role}
      data-label-item=${e.item ?? C}
      style="left: ${n}; top: ${r}"
      >${e.caption === void 0 ? C : b`<span class="caption">${e.caption}</span>`}${Kr(e.entityId, e.text, e.missing, t)}</span
    >`;
	})}`;
}
function Jr(e, t) {
	return b`${e.map((e) => b`<span class="footer-item" data-footer=${e.id}
        >${e.caption === void 0 ? C : b`<span class="caption">${e.caption}</span>`}${Kr(e.entityId, e.text, e.missing, t)}</span
      >`)}`;
}
// src/diagram/source.ts
var Yr = o`
  .source-outline {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: 2;
  }
  .source-fin {
    stroke: var(--divider-color);
    stroke-width: 1;
  }
  .source-ground {
    stroke: var(--secondary-text-color);
    stroke-width: 1.5;
  }
  /* The brine circuit is inactive: the housing, coil and ground line are muted like the pipes; the fan follows its own speed. */
  .muted .source-outline,
  .muted .source-fin,
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
  .fan-ring {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: 1.5;
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
`, Xr = (e) => e === void 0 || !(e > 0) ? void 0 : Math.min(6, Math.max(.5, 120 / e)), Zr = [
	0,
	90,
	180,
	270
].map((e) => x`<path class="fan-blade" d="M0 0 C6 -8 6 -24 0 -30 C-8 -24 -8 -8 0 0 Z" transform="rotate(${e})" />`);
function Qr(e, t) {
	let { x: n, y: r, width: i, height: a, fanX: o, fanY: s, fanRadius: c } = z, l = Xr(e), { fins: u } = z, d = Array.from({ length: u.count }, (e, t) => u.x + t * u.step);
	return x`<g class="air-unit${t ? " muted" : ""}" data-source="air">
    <rect class="source-outline" x=${n} y=${r} width=${i} height=${a} rx="6" />
    ${d.map((e) => x`<path class="source-fin" d="M${e} ${z.fins.y0} V${z.fins.y1}" />`)}
    <circle class="fan-ring" cx=${o} cy=${s} r=${c} />
    <g class="fan" data-fan transform="translate(${o} ${s})">
      <g class=${l === void 0 ? "fan-rotor still" : "fan-rotor"} style=${l === void 0 ? "" : `--fan-duration: ${String(l)}s`}>${Zr}<circle r="4" fill="var(--primary-text-color)" /></g>
    </g>
    <text class="source-caption" x=${z.captionX} y=${z.captionY} text-anchor="middle">${pt.air}</text>
  </g>`;
}
function $r(e, t) {
	return Jn(e).flatMap(({ part: e }) => e.id.startsWith("src_") ? e.points.slice(1).flatMap((n, r) => {
		let i = e.points[r];
		return i?.[0] === n[0] && t > Math.min(i[1], n[1]) && t < Math.max(i[1], n[1]) ? [n[0]] : [];
	}) : []);
}
function ei(e, t, n, r) {
	let i = $r(e, n), a = Array.from({ length: 16 }, (e, t) => 44 + t * 10).filter((e) => !i.some((t) => Math.abs(t - e) < 8)), o = Mn.y[t];
	return x`<g class="ground-loop${r ? " muted" : ""}" data-source="ground">
    <path class="source-ground" d="M8 ${n} H202" />
    ${a.map((e) => x`<path class="source-ground" d="M${e} ${n} l-6 8" />`)}
    <text class="source-caption" x=${Mn.x} y=${o} text-anchor="middle">${pt.ground}</text>
  </g>`;
}
function ti(e, t, n) {
	let r = e.source === "air" || e.source === "hybrid", i = e.source === "ground" || e.source === "hybrid", a = e.source === "hybrid" ? "hybrid" : "ground";
	return x`<g class="source" data-source-kind=${e.source}>
    ${r ? Qr(t["source.fan_speed"], !n) : x``}
    ${i ? ei(e, a, jn[a], !n) : x``}
  </g>`;
}
// src/lib/define.ts
function ni(e, t) {
	let n = customElements.get(e);
	n === void 0 ? customElements.define(e, t) : n !== t && console.warn(`${e} is already defined by another copy of the module; that copy stays in use.`);
}
// src/lib/render.ts
function ri(e, t) {
	return e === t || Array.isArray(e) && Array.isArray(t) && e.length === t.length && e.every((e, n) => e === t[n]);
}
function ii(e, t) {
	if (e === t) return !0;
	if (typeof e != "object" || typeof t != "object" || e === null || t === null) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	return n.length === r.length && n.every((n) => Object.hasOwn(t, n) && ri(e[n], t[n]));
}
function ai(e, t, n) {
	return e === void 0 || e.locale !== t.locale || e.language !== t.language || e.localize !== t.localize || e.formatEntityState !== t.formatEntityState || e.themes?.darkMode !== t.themes?.darkMode || n.some((n) => e.states[n] !== t.states[n] || !ii(e.entities?.[n], t.entities?.[n]));
}
function oi(e, t, n, r) {
	return e.size === 1 && e.has("hass") ? t !== void 0 && ai(n, t, r) : !0;
}
// src/card/ecogeo-card.ts
var si = "ecogeo-card", ci = On.width, li = On.height;
ni(si, class extends E {
	constructor(...e) {
		super(...e), this.entityIds = [];
	}
	static {
		this.styles = [
			Cr,
			Yr,
			Or,
			Br,
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
		let t = yn(e);
		if (t.length > 0) throw Error(t.join("; "));
		this.resolved = Dn(e), this.entityIds = [...new Set(Object.values(this.resolved.entities).filter((e) => e !== void 0))], this.config = e;
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
		return oi(e, this.hass, this.renderedHass, this.entityIds);
	}
	readings(e) {
		let t = e.sample ? wn : this.hass?.states ?? {};
		return {
			readings: xt(t, e.entities),
			offline: Ge(et(t, e.entities["unit.connection"]))
		};
	}
	render() {
		this.renderedHass = this.hass;
		let e = this.resolved;
		if (e === void 0) return b`<ha-card><div class="diagram"></div></ha-card>`;
		let { readings: t, offline: n } = this.readings(e), r = We(t, e.features), i = qe(r, e.features, e.dhw, t), a = {
			mode: r,
			circuits: i,
			readings: t,
			stops: e.colors
		}, o = e.sample ? wn : this.hass?.states ?? {}, s = {
			locale: jr(this.hass),
			entities: this.hass?.entities,
			states: o
		}, c = e.sample ? void 0 : (e) => {
			tt(this, e);
		};
		return b`<ha-card>
      <div class="diagram">
        <svg
          viewBox="0 0 ${ci} ${li}"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label=${lt}
          style="--dhw-tank-color: ${hr(a)}"
        >
          ${x`${ti(e, t, i.active.has("brine"))}${kr(e)}${Dr(e, a)}`}
        </svg>
        ${qr(Ur(e, t, e.entities, s), c)}
      </div>
      <div class="footer">
        <span class="mode">${ut[r]}</span>
        ${Jr(Wr(t, e.entities, s), c)}
        ${Ke(t["unit.alarm"]) ? b`<span class="alarm">${dt.alarm}</span>` : C}
        ${n ? b`<span class="offline">${dt.offline}</span>` : C}
        ${e.sample ? b`<span class="sample">${dt.sampleValues}</span>` : C}
      </div>
    </ha-card>`;
	}
});
// src/index.ts
var ui = {
	type: si,
	...ct,
	preview: !0
};
function di(e = window) {
	let t = e.customCards ??= [];
	t.some((e) => e.type === ui.type) || t.push({ ...ui });
}
di();
export { ui as CARD_ENTRY, di as registerCardPicker };
