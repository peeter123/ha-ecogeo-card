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
var oe = class extends HTMLElement {
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
oe.elementStyles = [], oe.shadowRootOptions = { mode: "open" }, oe[h("elementProperties")] = /* @__PURE__ */ new Map(), oe[h("finalized")] = /* @__PURE__ */ new Map(), re?.({ ReactiveElement: oe }), (ee.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var se = globalThis, ce = (e) => e, le = se.trustedTypes, ue = le ? le.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, de = "$lit$", _ = `lit$${Math.random().toFixed(9).slice(2)}$`, fe = "?" + _, pe = `<${fe}>`, v = document, me = () => v.createComment(""), he = (e) => e === null || typeof e != "object" && typeof e != "function", ge = Array.isArray, _e = (e) => ge(e) || typeof e?.[Symbol.iterator] == "function", ve = "[ 	\n\f\r]", ye = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, be = /-->/g, xe = />/g, y = RegExp(`>|${ve}(?:([^\\s"'>=/]+)(${ve}*=${ve}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), Se = /'/g, Ce = /"/g, we = /^(?:script|style|textarea|title)$/i, Te = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), b = Te(1), x = Te(2), S = Symbol.for("lit-noChange"), C = Symbol.for("lit-nothing"), Ee = /* @__PURE__ */ new WeakMap(), w = v.createTreeWalker(v, 129);
function De(e, t) {
	if (!ge(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return ue === void 0 ? t : ue.createHTML(t);
}
var Oe = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = ye;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === ye ? c[1] === "!--" ? o = be : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = y) : (we.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = y) : o = xe : o === y ? c[0] === ">" ? (o = i ?? ye, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? y : c[3] === "\"" ? Ce : Se) : o === Ce || o === Se ? o = y : o === be || o === xe ? o = ye : (o = y, i = void 0);
		let d = o === y && e[t + 1].startsWith("/>") ? " " : "";
		a += o === ye ? n + pe : l >= 0 ? (r.push(s), n.slice(0, l) + de + n.slice(l) + _ + d) : n + _ + (l === -2 ? t : d);
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
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(de)) {
					let t = u[o++], n = i.getAttribute(e).split(_), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Pe : r[1] === "?" ? Fe : r[1] === "@" ? Ie : Ne
					}), i.removeAttribute(e);
				} else e.startsWith(_) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (we.test(i.tagName)) {
					let e = i.textContent.split(_), t = e.length - 1;
					if (t > 0) {
						i.textContent = le ? le.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], me()), w.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], me());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === fe) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(_, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += _.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = v.createElement("template");
		return n.innerHTML = e, n;
	}
};
function Ae(e, t, n = e, r) {
	if (t === S) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = he(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = Ae(e, i._$AS(e, t.values), i, r)), t;
}
var je = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? v).importNode(t, !0);
		w.currentNode = r;
		let i = w.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Me(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Le(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = w.nextNode(), a++);
		}
		return w.currentNode = v, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, Me = class e {
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
		e = Ae(this, e, t), he(e) ? e === C || e == null || e === "" ? (this._$AH !== C && this._$AR(), this._$AH = C) : e !== this._$AH && e !== S && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? _e(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== C && he(this._$AH) ? this._$AA.nextSibling.data = e : this.T(v.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = ke.createElement(De(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new je(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = Ee.get(e.strings);
		return t === void 0 && Ee.set(e.strings, t = new ke(e)), t;
	}
	k(t) {
		ge(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(me()), this.O(me()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = ce(e).nextSibling;
			ce(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, Ne = class {
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
		if (i === void 0) e = Ae(this, e, t, 0), a = !he(e) || e !== this._$AH && e !== S, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = Ae(this, r[n + o], t, o), s === S && (s = this._$AH[o]), a ||= !he(s) || s !== this._$AH[o], s === C ? e = C : e !== C && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === C ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Pe = class extends Ne {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === C ? void 0 : e;
	}
}, Fe = class extends Ne {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== C);
	}
}, Ie = class extends Ne {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = Ae(this, e, t, 0) ?? C) === S) return;
		let n = this._$AH, r = e === C && n !== C || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== C && (n === C || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Le = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		Ae(this, e);
	}
}, Re = se.litHtmlPolyfillSupport;
Re?.(ke, Me), (se.litHtmlVersions ??= []).push("3.3.3");
var ze = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Me(t.insertBefore(me(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Be = globalThis, Ve = class extends oe {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ze(t, this.renderRoot, this.renderOptions);
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
Ve._$litElement$ = !0, Ve.finalized = !0, Be.litElementHydrateSupport?.({ LitElement: Ve });
var He = Be.litElementPolyfillSupport;
He?.({ LitElement: Ve }), (Be.litElementVersions ??= []).push("4.2.2");
// src/calc/mode.ts
var Ue = [
	"off",
	"unavailable",
	"unknown"
], We = (e, t) => e?.trim().toLowerCase() === t, Ge = (e) => e !== void 0 && e > 0;
function Ke(e, t) {
	if (We(e["unit.on_off"], "off")) return "off";
	if (We(e["compressor.mode"], "defrost")) return "defrost";
	let n = e["compressor.speed"];
	if (n === void 0) return "standby";
	let r = e["unit.summer"] === !0;
	return Ge(n) ? e["dhw.demand"] === !0 ? "dhw" : r && t.active_cooling === !0 ? "active_cooling" : "heating" : r && Ge(e["production.pump"]) && t.passive_cooling === !0 ? "passive_cooling" : "standby";
}
function qe(e) {
	return e !== void 0 && Ue.includes(e.state.trim().toLowerCase());
}
var Je = (e) => e === !0;
// src/calc/circuits.ts
function Ye(e, t, n, r) {
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
	return Ge(r["brine.pump"]) || i.delete("brine"), {
		valve26: e === "dhw" ? "dhw" : "production",
		valve14: e === "active_cooling" ? "reversed" : "normal",
		valves2728: (e === "passive_cooling" || e === "defrost") && a ? "exchanger" : "closed",
		active: i
	};
}
// src/lib/availability.ts
var Xe = /* @__PURE__ */ new Set(["unknown", "unavailable"]), Ze = -999, Qe = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;
function $e(e) {
	if (!Qe.test(e)) return;
	let t = Number(e);
	return Number.isFinite(t) ? t + 0 : void 0;
}
function et(e) {
	if (e === void 0 || Xe.has(e.state)) return !0;
	let t = $e(e.state);
	return t !== void 0 && t <= Ze;
}
function tt(e) {
	if (!(e === void 0 || et(e))) return $e(e.state);
}
// src/lib/hass.ts
var nt = (e, t) => t === void 0 ? void 0 : e[t];
function rt(e, t) {
	e.dispatchEvent(new CustomEvent("hass-more-info", {
		detail: { entityId: t },
		bubbles: !0,
		composed: !0
	}));
}
// src/lib/units.ts
var it = { scale: 1 }, at = {
	scale: 5 / 9,
	offset: -32
}, ot = {
	temperature: /* @__PURE__ */ new Map([["°c", it], ["°f", at]]),
	difference: /* @__PURE__ */ new Map([
		["k", it],
		["°c", it],
		["°f", at]
	]),
	power: /* @__PURE__ */ new Map([["w", it], ["kw", { scale: 1e3 }]])
};
function st(e) {
	return e.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase();
}
function ct(e, t) {
	let n = tt(e);
	return n === void 0 ? void 0 : lt(t, n, e?.attributes.unit_of_measurement);
}
function lt(e, t, n) {
	if (!Number.isFinite(t) || n === void 0) return;
	let r = ot[e].get(st(n));
	return r ? (t + (r.offset ?? 0)) * r.scale : void 0;
}
// src/strings.ts
var T = {
	invalid: (e, t) => `Invalid option ${e}: expected ${t}`,
	number: (e, t) => `a number from ${e} to ${t}`,
	color: "a CSS colour such as #db4437 or rgb(219, 68, 55)",
	boolean: "true or false",
	object: "a group of options",
	choice: (e) => `one of ${e.join(", ")}`,
	list: "a list of texts"
}, ut = {
	name: "ecoGEO Schematic",
	description: "The internal schematic of an Ecoforest ecoGEO heat pump, with live values and pipes coloured by temperature."
}, dt = "ecoGEO heat pump schematic", E = {
	celsius: "°C",
	kelvin: "K",
	bar: "bar",
	percent: "%",
	rpm: "rpm",
	watt: "W"
}, ft = {
	off: "Off",
	defrost: "Defrost",
	dhw: "DHW",
	active_cooling: "Active cooling",
	heating: "Heating",
	passive_cooling: "Passive cooling",
	standby: "Standby"
}, pt = {
	alarm: "Alarm",
	offline: "Offline",
	sampleValues: "Sample values"
}, D = {
	unknownOption: (e) => `Unknown option ${e}`,
	unknownFeature: (e, t) => `Unknown feature ${e}: expected one of ${t.join(", ")}`,
	unknownRole: (e) => `Unknown entity role ${e}`,
	notEntityId: (e) => `Invalid entity for ${e}: expected an entity id such as sensor.name`,
	featureState: (e) => `Invalid option features.${e}: expected true, false or unused`,
	integer: (e, t) => `a whole number from ${e} to ${t}`,
	prefix: "a prefix of lowercase letters, digits and underscores",
	colors: "Invalid option colors: expected an ascending list of 2 to 8 stops, each { temperature, color } with a number and a CSS colour",
	dhwMismatch: (e, t) => `Invalid option dhw: ${e} does not fit model ${t}`
}, mt = {
	dg1: "DG1",
	outerLoop: "Outer loop",
	dhw: "DHW"
}, ht = {
	air: "Air unit",
	ground: "Ground loop"
}, gt = {
	externalTank: "DHW tank",
	demand: "Demand"
}, _t = { demand: "Demand" }, O = {
	setpoint: "Setpoint",
	startDelta: "Start ΔT",
	setpointShort: "Set",
	startDeltaShort: "ΔT",
	fan: "Fan",
	outside: "Outside",
	portIn: "In",
	portOut: "Out"
}, vt = {
	outside: "Outside",
	cop: "COP",
	condensation: "Condensation",
	evaporation: "Evaporation",
	summer: "Summer",
	winter: "Winter"
}, yt = {
	on: "On",
	off: "Off",
	emergency: "Emergency"
}, bt = {
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
}, xt = (e) => {
	let t = bt[e];
	return t === void 0 ? "" : `${t} (${String(e)})`;
}, St = "Air unit fan", k = E.celsius, Ct = [
	{
		path: "production.outlet_temperature",
		domain: "sensor",
		suffix: "production_out",
		kind: "number",
		quantity: "temperature",
		unit: k,
		decimals: 1,
		item: "33"
	},
	{
		path: "production.return_temperature",
		domain: "sensor",
		suffix: "production_in",
		kind: "number",
		quantity: "temperature",
		unit: k,
		decimals: 1,
		item: "34"
	},
	{
		path: "production.pressure",
		domain: "sensor",
		suffix: "pressure_production",
		kind: "number",
		unit: E.bar,
		decimals: 1,
		item: "38"
	},
	{
		path: "production.pump",
		domain: "sensor",
		suffix: "production_pump",
		kind: "number",
		unit: E.percent,
		decimals: 1,
		item: "15"
	},
	{
		path: "brine.outlet_temperature",
		domain: "sensor",
		suffix: "brine_out",
		kind: "number",
		quantity: "temperature",
		unit: k,
		decimals: 1,
		item: "31"
	},
	{
		path: "brine.inlet_temperature",
		domain: "sensor",
		suffix: "brine_in",
		kind: "number",
		quantity: "temperature",
		unit: k,
		decimals: 1,
		item: "32"
	},
	{
		path: "brine.pressure",
		domain: "sensor",
		suffix: "pressure_brine",
		kind: "number",
		unit: E.bar,
		decimals: 1,
		item: "37"
	},
	{
		path: "brine.pump",
		domain: "sensor",
		suffix: "brine_pump",
		kind: "number",
		unit: E.percent,
		decimals: 1,
		item: "16"
	},
	{
		path: "compressor.speed",
		domain: "sensor",
		suffix: "compressor_rpm",
		kind: "number",
		unit: E.rpm,
		decimals: 0,
		item: "11"
	},
	{
		path: "compressor.percentage",
		domain: "sensor",
		suffix: "compressor_percentage",
		kind: "number",
		unit: E.percent,
		decimals: 1,
		item: "11"
	},
	{
		path: "compressor.power",
		domain: "sensor",
		suffix: "power_consumption",
		kind: "number",
		quantity: "power",
		unit: E.watt,
		decimals: 0,
		item: "11"
	},
	{
		path: "compressor.suction_temperature",
		domain: "sensor",
		suffix: "compressor_suction_temperature",
		kind: "number",
		quantity: "temperature",
		unit: k,
		decimals: 1,
		item: "29"
	},
	{
		path: "compressor.discharge_temperature",
		domain: "sensor",
		suffix: "compressor_discharge_temperature",
		kind: "number",
		quantity: "temperature",
		unit: k,
		decimals: 1,
		item: "30"
	},
	{
		path: "compressor.suction_pressure",
		domain: "sensor",
		suffix: "compressor_suction_pressure",
		kind: "number",
		unit: E.bar,
		decimals: 1,
		item: "35"
	},
	{
		path: "compressor.discharge_pressure",
		domain: "sensor",
		suffix: "compressor_discharge_pressure",
		kind: "number",
		unit: E.bar,
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
		unit: k,
		decimals: 1,
		item: "8"
	},
	{
		path: "refrigerant.evaporation_temperature",
		domain: "sensor",
		suffix: "evaporation_temperature",
		kind: "number",
		quantity: "temperature",
		unit: k,
		decimals: 1,
		item: "7"
	},
	{
		path: "refrigerant.superheat",
		domain: "sensor",
		suffix: "superheat",
		kind: "number",
		quantity: "difference",
		unit: E.kelvin,
		decimals: 1,
		item: "12"
	},
	{
		path: "refrigerant.expansion_valve",
		domain: "sensor",
		suffix: "expansion_valve_position",
		kind: "number",
		unit: E.percent,
		decimals: 0,
		item: "12"
	},
	{
		path: "heating.capacity",
		domain: "sensor",
		suffix: "condensation_capacity",
		kind: "number",
		quantity: "power",
		unit: E.watt,
		decimals: 0,
		item: "8"
	},
	{
		path: "cooling.capacity",
		domain: "sensor",
		suffix: "evaporation_capacity",
		kind: "number",
		quantity: "power",
		unit: E.watt,
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
		unit: k,
		decimals: 1,
		item: "1/2"
	},
	{
		path: "dhw.temperature",
		domain: "sensor",
		suffix: "dhw_temperature",
		kind: "number",
		quantity: "temperature",
		unit: k,
		decimals: 1,
		item: "tank (54 on C)"
	},
	{
		path: "dhw.setpoint",
		domain: "number",
		suffix: "dhw_setpoint",
		kind: "number",
		quantity: "temperature",
		unit: k,
		decimals: 0,
		item: "tank"
	},
	{
		path: "dhw.start_delta",
		domain: "number",
		suffix: "delta_t_start_dhw",
		kind: "number",
		quantity: "difference",
		unit: E.kelvin,
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
		unit: E.percent,
		decimals: 1,
		item: "air unit"
	},
	{
		path: "source.air_unit_outlet_temperature",
		domain: "sensor",
		suffix: "brine_temperature_air_unit_outlet",
		kind: "number",
		quantity: "temperature",
		unit: k,
		decimals: 1,
		item: "air unit"
	},
	{
		path: "source.outside_temperature",
		domain: "sensor",
		suffix: "outside_temperature",
		kind: "number",
		quantity: "temperature",
		unit: k,
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
], wt = new Map(Ct.map((e) => [e.path, e])), Tt = Ct.map((e) => e.path);
[...new Set(Ct.flatMap((e) => "unit" in e ? [e.unit] : []))];
var Et = (e, t) => `${e.domain}.${t}_${e.suffix}`;
// src/calc/readings.ts
function Dt(e, t) {
	return t.quantity === void 0 ? tt(e) : ct(e, t.quantity);
}
function Ot(e, t) {
	switch (t.kind) {
		case "number": return Dt(e, t);
		case "text": return e === void 0 || et(e) || ["unavailable", "unknown"].includes(e.state.trim().toLowerCase()) ? void 0 : e.state.trim();
		case "binary": {
			let t = e?.state.trim().toLowerCase();
			return t === "on" || t !== "off" && void 0;
		}
	}
}
function kt(e, t) {
	return Object.fromEntries(Ct.map((n) => [n.path, Ot(nt(e, t[n.path]), n)]));
}
// src/lib/config.ts
var At = /^[a-z][a-z0-9_]*\.[a-z0-9_]+$/;
function A(e, t) {
	let n = e;
	for (let e of t.split(".")) {
		if (typeof n != "object" || !n || !Object.hasOwn(n, e)) return;
		n = n[e];
	}
	return n;
}
function jt(e) {
	if (typeof e != "string") return;
	let t = e.trim();
	return At.test(t) ? t : void 0;
}
function Mt(e, t) {
	return jt(A(e, t));
}
// src/lib/options.ts
var Nt = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, Pt = /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|var)\((.*)\)$/i, Ft = /^[#a-zA-Z0-9(),.%\s/+-]+$/, It = /* @__PURE__ */ new Set(/* @__PURE__ */ "aliceblue.antiquewhite.aqua.aquamarine.azure.beige.bisque.black.blanchedalmond.blue.blueviolet.brown.burlywood.cadetblue.chartreuse.chocolate.coral.cornflowerblue.cornsilk.crimson.cyan.darkblue.darkcyan.darkgoldenrod.darkgray.darkgreen.darkgrey.darkkhaki.darkmagenta.darkolivegreen.darkorange.darkorchid.darkred.darksalmon.darkseagreen.darkslateblue.darkslategray.darkslategrey.darkturquoise.darkviolet.deeppink.deepskyblue.dimgray.dimgrey.dodgerblue.firebrick.floralwhite.forestgreen.fuchsia.gainsboro.ghostwhite.gold.goldenrod.gray.green.greenyellow.grey.honeydew.hotpink.indianred.indigo.ivory.khaki.lavender.lavenderblush.lawngreen.lemonchiffon.lightblue.lightcoral.lightcyan.lightgoldenrodyellow.lightgray.lightgreen.lightgrey.lightpink.lightsalmon.lightseagreen.lightskyblue.lightslategray.lightslategrey.lightsteelblue.lightyellow.lime.limegreen.linen.magenta.maroon.mediumaquamarine.mediumblue.mediumorchid.mediumpurple.mediumseagreen.mediumslateblue.mediumspringgreen.mediumturquoise.mediumvioletred.midnightblue.mintcream.mistyrose.moccasin.navajowhite.navy.oldlace.olive.olivedrab.orange.orangered.orchid.palegoldenrod.palegreen.paleturquoise.palevioletred.papayawhip.peachpuff.peru.pink.plum.powderblue.purple.rebeccapurple.red.rosybrown.royalblue.saddlebrown.salmon.sandybrown.seagreen.seashell.sienna.silver.skyblue.slateblue.slategray.slategrey.snow.springgreen.steelblue.tan.teal.thistle.tomato.turquoise.violet.wheat.white.whitesmoke.yellow.yellowgreen.transparent.currentcolor".split("."));
function Lt(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) if (e[n] === "(" && t++, e[n] === ")" && (t--, t < 0 || t === 0 && n !== e.length - 1)) return !1;
	return t === 0;
}
function Rt(e) {
	let t = e.trim();
	if (t.length === 0 || t.length > 100 || !Ft.test(t)) return !1;
	if (Nt.test(t) || It.has(t.toLowerCase())) return !0;
	let n = Pt.exec(t);
	if (n === null || !Lt(t)) return !1;
	if (n[1]?.toLowerCase() !== "var") return !0;
	let [r, ...i] = (n[2] ?? "").split(",");
	return /^\s*--[a-zA-Z0-9-]+\s*$/.test(r ?? "") && (i.length === 0 || Rt(i.join(",")));
}
var zt = (e) => e == null;
function Bt(e) {
	switch (e.kind) {
		case "number": return T.number(String(e.min), String(e.max));
		case "color": return T.color;
		case "boolean": return T.boolean;
		case "choice": return T.choice(e.choices);
		case "list": return T.list;
	}
}
var Vt = (e) => e === null || [
	"string",
	"number",
	"boolean"
].includes(typeof e);
function Ht(e) {
	return e.map((e) => typeof e == "boolean" ? e ? "on" : "off" : e === null ? "" : String(e)).filter((e) => e.trim() !== "");
}
function Ut(e, t) {
	switch (e.kind) {
		case "number": return typeof t == "number" && Number.isFinite(t) && t >= e.min && t <= e.max;
		case "color": return typeof t == "string" && Rt(t);
		case "boolean": return typeof t == "boolean";
		case "choice": return typeof t == "string" && e.choices.includes(t);
		case "list": return Array.isArray(t) && t.every(Vt);
	}
}
function Wt(e, t) {
	let n = t.split(".").slice(0, -1);
	for (let t = 1; t <= n.length; t++) {
		let r = n.slice(0, t).join("."), i = A(e, r);
		if (!zt(i) && (typeof i != "object" || Array.isArray(i))) return r;
	}
}
function Gt(e, t) {
	let n = t.flatMap((t) => {
		let n = Wt(e, t.path);
		if (n !== void 0) return [T.invalid(n, T.object)];
		let r = A(e, t.path);
		return zt(r) || Ut(t, r) ? [] : [T.invalid(t.path, Bt(t))];
	});
	return [...new Set(n)];
}
function Kt(e, t) {
	let n = A(e, t.path);
	if (t.kind === "list" && Array.isArray(n) && Ut(t, n)) {
		let e = Ht(n);
		return e.length > 0 ? e : t.default;
	}
	return zt(n) || !Ut(t, n) ? t.default : n;
}
// src/diagram/colors.ts
var qt = [
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
], Jt = "var(--disabled-text-color)", Yt = "#8a8a8a", Xt = `var(--ecogeo-coil-muted, ${Jt})`, Zt = (e) => e ? Jt : Yt, Qt = (e) => typeof e == "object" && !!e && !Array.isArray(e), $t = (e) => typeof e == "string" && Gt({ color: e }, [{
	kind: "color",
	path: "color",
	default: ""
}]).length === 0, en = (e) => e.map((e) => ({
	temperature: e.temperature,
	color: e.color.trim()
}));
function tn(e) {
	let t = A(e, "colors");
	if (t == null) return [];
	if (!Array.isArray(t) || t.length < 2 || t.length > 8) return [D.colors];
	let n = t;
	if (!n.every((e) => Qt(e) && typeof e.temperature == "number" && Number.isFinite(e.temperature) && $t(e.color))) return [D.colors];
	let r = en(n).map((e) => e.temperature);
	return r.every((e, t) => t === 0 || e > (r[t - 1] ?? 0)) ? [] : [D.colors];
}
function nn(e) {
	let t = A(e, "colors");
	return Array.isArray(t) && tn(e).length === 0 ? en(t) : qt;
}
function rn(e, t = qt) {
	let n = t[0], r = t[t.length - 1];
	if (e === void 0 || !Number.isFinite(e) || n === void 0 || r === void 0) return Jt;
	if (e <= n.temperature) return n.color;
	if (e >= r.temperature) return r.color;
	let i = t.findIndex((t) => t.temperature >= e), a = t[i - 1], o = t[i];
	if (a === void 0 || o === void 0) return r.color;
	let s = Math.round((e - a.temperature) / (o.temperature - a.temperature) * 1e3) / 10;
	return s <= 0 ? a.color : s >= 100 ? o.color : `color-mix(in srgb, ${o.color} ${String(s)}%, ${a.color})`;
}
// src/config/variants.ts
var an = [
	"active_cooling",
	"passive_cooling",
	"htr",
	"backup_heater"
], on = [
	1,
	2,
	3,
	4
];
function sn(e) {
	return {
		active_cooling: e === 3 || e === 4,
		passive_cooling: e === 2 || e === 4,
		htr: !0,
		backup_heater: !0
	};
}
function cn(e, t) {
	return {
		...sn(e),
		...t
	};
}
// src/config/options.ts
var ln = ["B", "C"], un = [
	"air",
	"ground",
	"hybrid"
], dn = [
	"external",
	"internal",
	"none"
], fn = ["simplified", "full"], pn = {
	kind: "choice",
	path: "model",
	default: "B",
	choices: ln
}, mn = {
	kind: "choice",
	path: "source",
	default: "ground",
	choices: un
}, hn = {
	kind: "choice",
	path: "dhw",
	default: "external",
	choices: dn
}, gn = {
	kind: "choice",
	path: "detail",
	default: "simplified",
	choices: fn
}, _n = {
	kind: "choice",
	path: "exchanger_fill",
	default: "gradient",
	choices: ["gradient", "none"]
}, vn = [
	pn,
	mn,
	hn,
	gn,
	_n
], yn = [
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
], bn = (e) => e === "C" ? "internal" : "external", j = (e) => e == null, xn = (e) => j(e) || typeof e == "string" && e.trim() === "", Sn = (e) => typeof e == "object" && !!e && !Array.isArray(e), Cn = /^[a-z0-9_]+$/;
function wn(e) {
	let t = A(e, "prefix");
	return xn(t) ? void 0 : t.trim();
}
function Tn(e) {
	let t = A(e, "variant");
	return on.find((e) => e === t) ?? 4;
}
function En(e) {
	let t = Kt(e, pn), n = !j(A(e, "dhw"));
	return {
		model: t,
		source: Kt(e, mn),
		dhw: n ? Kt(e, hn) : bn(t)
	};
}
var Dn = (e) => Kt(e, gn), On = (e) => Kt(e, _n);
function kn(e) {
	let t = A(e, "features");
	if (!Sn(t)) return {};
	let n = {};
	for (let e of an) {
		let r = t[e];
		(r === !0 || r === !1 || r === "unused") && (n[e] = r);
	}
	return n;
}
var An = (e) => e === !0 || e === !1 || e === "unused";
function jn(e, t = "") {
	return Object.entries(e).flatMap(([e, n]) => {
		let r = t === "" ? e : `${t}.${e}`;
		return Sn(n) ? jn(n, r) : [[r, n]];
	});
}
function Mn(e) {
	let t = A(e, "variant");
	return j(t) || on.some((e) => e === t) ? [] : [T.invalid("variant", D.integer(String(on[0]), String(on[on.length - 1])))];
}
function Nn(e) {
	let t = A(e, "prefix");
	return xn(t) || typeof t == "string" && Cn.test(t.trim()) ? [] : [T.invalid("prefix", D.prefix)];
}
function Pn(e) {
	let t = A(e, "features");
	return j(t) ? [] : Sn(t) ? Object.entries(t).flatMap(([e, t]) => an.some((t) => t === e) ? j(t) || An(t) ? [] : [D.featureState(e)] : [D.unknownFeature(e, an)]) : [T.invalid("features", T.object)];
}
function Fn(e) {
	let t = A(e, "entities");
	return j(t) ? [] : Sn(t) ? jn(t).flatMap(([e, t]) => xn(t) ? [] : wt.has(e) ? jt(t) === void 0 ? [D.notEntityId(e)] : [] : [D.unknownRole(e)]) : [T.invalid("entities", T.object)];
}
function In(e) {
	let t = A(e, "entities");
	return Sn(t) && jn(t).some(([, e]) => !xn(e));
}
function Ln(e) {
	let t = Object.keys(e).filter((e) => !yn.includes(e)).map((e) => D.unknownOption(e)), n = Gt(e, vn), r = [
		...t,
		...n,
		...Mn(e),
		...Nn(e),
		...Pn(e),
		...Fn(e),
		...tn(e)
	];
	if (Gt(e, [pn, hn]).length === 0 && !j(A(e, "dhw"))) {
		let { model: t, dhw: n } = En(e);
		(t === "B" && n === "internal" || t === "C" && n === "external") && r.push(D.dhwMismatch(n, t));
	}
	return r;
}
// src/config/sample.ts
var Rn = (e) => `ecogeo_sample.${e.replace(".", "_")}`, zn = {
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
}, Bn = "2026-01-01T12:00:00Z", Vn = Object.fromEntries(Tt.map((e) => [e, Rn(e)])), Hn = Object.fromEntries(Tt.map((e) => {
	let t = wt.get(e)?.unit, n = Rn(e);
	return [n, {
		entity_id: n,
		state: zn[e],
		last_updated: Bn,
		attributes: t === void 0 ? {} : { unit_of_measurement: t }
	}];
}));
// src/config/resolve.ts
function Un(e, t) {
	return Object.fromEntries(Ct.map((n) => [n.path, Mt(e, `entities.${n.path}`) ?? (t === void 0 ? void 0 : Et(n, t))]));
}
var Wn = (e) => wn(e) === void 0 && !In(e);
function Gn(e) {
	let t = wn(e), n = Tn(e), r = Wn(e);
	return {
		...En(e),
		detail: Dn(e),
		exchangerFill: On(e),
		variant: n,
		prefix: t,
		colors: nn(e),
		features: cn(n, kn(e)),
		entities: r ? Vn : Un(e, t),
		sample: r
	};
}
// src/diagram/component-info.ts
var Kn = {
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
}, qn = "source.fan_speed", Jn = "dhw.temperature", Yn = (e, t) => e === void 0 || t?.onTap === void 0 ? void 0 : t.entities[e];
function Xn(e, t) {
	return e === void 0 || t === void 0 ? {
		role: C,
		tabindex: C,
		click: C,
		keydown: C
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
var Zn = o`
  outline: 2px solid var(--primary-color, currentColor);
  outline-offset: 2px;
  filter: drop-shadow(0 0 2px var(--primary-color, currentColor));
`, Qn = {
	width: 1e3,
	height: 620
}, M = {
	x: 240,
	y: 130,
	width: 520,
	height: 475
}, N = {
	x: 408,
	y: 138,
	width: 182,
	height: 66
}, $n = {
	x: 495,
	y: 185
}, er = [[-75, -13], [-75, 13]], P = {
	x: 806,
	y: M.y,
	width: 168,
	height: 180,
	dome: 14
}, tr = P.x + P.width / 2, nr = P.y + 62, rr = P.y + 146, ir = 50, ar = P.x + 14;
function or() {
	let { x: e, y: t, width: n, height: r, dome: i } = P, a = n / 2;
	return `M${String(e)} ${String(t + i)} A${String(a)} ${String(i)} 0 0 1 ${String(e + n)} ${String(t + i)} V${String(t + r - i)} A${String(a)} ${String(i)} 0 0 1 ${String(e)} ${String(t + r - i)} Z`;
}
var F = {
	x: 26,
	y: M.y,
	width: 124,
	height: 210,
	fanX: 88,
	fanY: M.y + 162,
	fanRadius: 34,
	coil: {
		x: 36,
		y: M.y + 16,
		width: 104,
		height: 74
	},
	fins: {
		x: 52,
		step: 6,
		count: 13,
		y0: M.y + 20,
		y1: M.y + 86
	},
	slats: {
		y0: M.y + 134,
		step: 9,
		count: 8
	},
	dividerY: M.y + 114,
	captionX: 88,
	captionY: M.y - 8,
	passes: {
		y0: M.y + 30,
		step: 15,
		count: 4,
		left: 44,
		right: 132
	}
}, sr = F.x + F.width, I = {
	top: F.passes.y0,
	bottom: F.passes.y0 + (F.passes.count - 1) * F.passes.step
}, L = {
	downX: 166,
	upX: 106,
	depth: 140
}, cr = {
	start: 8,
	end: 220
}, R = {
	ground: M.y,
	hybrid: F.y + F.height + 70
}, lr = {
	x: (L.downX + L.upX) / 2,
	y: {
		ground: R.ground + L.depth + 28,
		hybrid: R.hybrid + L.depth + 28
	}
}, z = (e, t, n, r, i, a, o = {}) => ({
	item: e,
	kind: t,
	x: n,
	y: r,
	rotation: i,
	tag: a,
	...o
}), ur = [
	z(1, "port", 270, 130, 0, [
		-7,
		-8,
		"end"
	]),
	z(2, "port", 312, 130, 0, [
		-7,
		-8,
		"end"
	]),
	z(3, "port", 630, 130, 0, [
		-7,
		-8,
		"end"
	]),
	z(4, "port", 690, 130, 0, [
		-7,
		-8,
		"end"
	]),
	z(5, "port", 722, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "external" }),
	z(6, "port", 748, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "external" }),
	z(47, "port", 440, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "internal" }),
	z(48, "port", 490, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "internal" }),
	z(49, "port", 540, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "internal" }),
	z(7, "exchanger", 572, 382, 0, [
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
	z(8, "exchanger", 432, 382, 0, [
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
	z(9, "exchanger", 373, 273, 0, [
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
	z(11, "compressor", 510, 250, 0, [
		0,
		-26,
		"middle"
	]),
	z(12, "expansion_valve", 527, 416, 0, [
		0,
		-14,
		"middle"
	]),
	z(13, "filter_dryer", 487, 416, 0, [
		0,
		-14,
		"middle"
	]),
	z(14, "inversion_valve", 430, 296, 0, [
		-16,
		22,
		"end"
	], { feature: "active_cooling" }),
	z(29, "probe_t", 542, 234, 0, [
		0,
		-14,
		"middle"
	]),
	z(30, "probe_t", 430, 234, 0, [
		0,
		-14,
		"middle"
	]),
	z(35, "transducer_p", 564, 234, 0, [
		0,
		-14,
		"middle"
	]),
	z(36, "transducer_p", 474, 234, 0, [
		0,
		-14,
		"middle"
	]),
	z(39, "pressure_switch", 586, 234, 0, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	z(40, "pressure_switch", 452, 234, 0, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	z(41, "service_outlet", 464, 406, 0, [
		0,
		28,
		"middle"
	], { detail: "full" }),
	z(41, "service_outlet", 620, 270, 90, [
		0,
		14,
		"middle"
	], { detail: "full" }),
	z(10, "exchanger", 520, 470, 0, [
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
	z(15, "pump", 385, 416, 0, [
		0,
		-19,
		"middle"
	]),
	z(16, "pump", 690, 300, 90, [
		19,
		4,
		"start"
	]),
	z(17, "pump", 340, 226, 90, [
		-14,
		4,
		"end"
	], {
		feature: "htr",
		dhw: "any"
	}),
	z(18, "vessel", 725, 520, 0, [
		-16,
		4,
		"end"
	], { detail: "full" }),
	z(19, "vessel", 368, 556, 0, [
		-16,
		4,
		"end"
	], { detail: "full" }),
	z(20, "safety_valve", 741, 440, 90, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	z(21, "safety_valve", 384, 520, 90, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	z(22, "valve", 340, 256, 0, [
		-10,
		4,
		"end"
	], {
		feature: "htr",
		dhw: "any"
	}),
	z(23, "drain_valve", 630, 572, 0, [
		14,
		4,
		"start"
	], { detail: "full" }),
	z(24, "drain_valve", 404, 572, 0, [
		14,
		4,
		"start"
	], { detail: "full" }),
	z(25, "drain_valve", 340, 318, 0, [
		-10,
		4,
		"end"
	], {
		feature: "htr",
		dhw: "any"
	}),
	z(26, "valve3", 270, 172, 270, [
		-14,
		22,
		"end"
	], { dhw: "any" }),
	z(27, "valve3", 350, 416, 0, [
		0,
		-24,
		"middle"
	], { feature: "passive_cooling" }),
	z(28, "valve3", 610, 416, 0, [
		0,
		-24,
		"middle"
	], { feature: "passive_cooling" }),
	z(31, "probe_t", 614, 228, 270, [
		0,
		-14,
		"middle"
	]),
	z(32, "probe_t", 674, 228, 270, [
		0,
		-14,
		"middle"
	]),
	z(33, "probe_t", 254, 228, 270, [
		0,
		-14,
		"middle"
	]),
	z(34, "probe_t", 296, 228, 270, [
		0,
		-14,
		"middle"
	]),
	z(37, "transducer_p", 709, 440, 270, [
		0,
		-14,
		"middle"
	]),
	z(38, "transducer_p", 352, 520, 270, [
		0,
		-14,
		"middle"
	]),
	z(44, "resistor", 270, 320, 90, [
		12,
		6,
		"start"
	], { feature: "backup_heater" }),
	z(45, "thermostat", 286, 282, 90, [
		0,
		-12,
		"middle"
	], { feature: "backup_heater" }),
	z(50, "tank", N.x + N.width / 2, N.y + N.height / 2, 0, [
		-96,
		-26,
		"end"
	], { dhw: "internal" }),
	z(51, "coil", $n.x, $n.y, 0, [
		-74,
		3,
		"middle"
	], { dhw: "internal" }),
	z(52, "service_outlet", 395, 162, 0, [
		-8,
		4,
		"end"
	], {
		dhw: "internal",
		detail: "full"
	}),
	z(53, "drain_valve", 599, 196, 270, [
		0,
		-12,
		"middle"
	], {
		dhw: "internal",
		detail: "full"
	}),
	z(54, "probe_t", 574, 171, 270, [
		26,
		-11,
		"start"
	], { dhw: "internal" })
], dr = (e) => e.split(" ").map((e) => {
	let [t, n] = e.split(",").map(Number);
	return [t ?? 0, n ?? 0];
}), B = 85, V = 50, fr = 226, pr = 206, mr = 234, hr = 214, gr = 12, _r = F.coil.x + F.coil.width, vr = F.passes.step / 2, yr = (L.downX - L.upX) / 2;
function br(e) {
	let { y0: t, step: n, count: r, left: i, right: a } = F.passes, o = [[_r, t]];
	for (let e = 0; e < r; e += 1) {
		let s = t + e * n;
		e % 2 == 0 ? (e > 0 && o.push([a, s]), o.push([i, s])) : o.push([i, s], e === r - 1 ? [_r, s] : [a, s]);
	}
	return (e ? o.reverse() : o).map(([e, t]) => `${String(e)},${String(t)}`).join(" ");
}
function xr(e, t) {
	let { downX: n, upX: r, depth: i } = L, [a, o] = [(n + r) / 2, e + i];
	return t === "down" ? `${String(n)},${String(e)} ${String(n)},${String(o)} ${String(a)},${String(o)}` : `${String(a)},${String(o)} ${String(r)},${String(o)} ${String(r)},${String(e)}`;
}
var H = (...e) => e.map(([e, t]) => `${String(e)},${String(t)}`).join(" "), U = (e, t, n, r, i = {}) => ({
	id: e,
	circuit: t,
	points: dr(n),
	temperatureRole: r,
	direction: 1,
	...i
}), Sr = ["production_dg1"], W = ["production_dg1", "production_dhw"], G = "production.outlet_temperature", K = "production.return_temperature", q = "production.pump", J = "brine.inlet_temperature", Y = "brine.outlet_temperature", X = "brine.pump", Cr = "compressor.discharge_temperature", wr = "compressor.suction_temperature", Tr = "refrigerant.condensation_temperature", Er = "refrigerant.evaporation_temperature", Z = "compressor.percentage", Q = "dhw.temperature", Dr = "source.air_unit_outlet_temperature", Or = [
	"dhw_sup_b",
	"dhw_sup_c",
	"dhw_ret_b",
	"dhw_ret_c",
	"dhw_ext_in",
	"dhw_ext_coil",
	"dhw_ext_out"
], kr = [
	U("p1_stub", Sr, "270,130 270,118", G, { stub: !0 }),
	U("p2_stub", Sr, "312,118 312,130", K, { stub: !0 }),
	U("p1_up", Sr, "270,160 270,130", G, {
		dhw: "any",
		speedRole: q
	}),
	U("p1_direct", Sr, "270,184 270,130", G, {
		dhw: "none",
		speedRole: q
	}),
	U("p2_in", Sr, "312,130 312,198", K, { speedRole: q }),
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
	U("dhw_ext_in", ["dhw_coil"], `722,130 722,50 ${String(tr + ir)},50 ${String(tr + ir)},${String(nr)}`, G, {
		dhw: "external",
		speedRole: q
	}),
	U("dhw_ext_coil", ["dhw_coil"], `${String(tr + ir)},${String(nr)} ${String(tr - ir)},${String(rr)}`, G, {
		dhw: "external",
		speedRole: q,
		shape: {
			kind: "helix",
			cx: tr,
			top: nr,
			bottom: rr,
			rx: ir,
			turns: 4.5
		}
	}),
	U("dhw_ext_out", ["dhw_coil"], `${String(tr - ir)},${String(rr)} ${String(ar)},${String(rr)} ${String(ar)},85 748,85 748,130`, K, {
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
	U("src_out", ["brine"], H([630, 130], [630, B], [mr, B]), Y, { speedRole: X }),
	U("src_in", ["brine"], H([hr, V], [690, V], [690, 130]), J, { speedRole: X }),
	U("src_air_feed", ["brine"], H([mr, B], [fr, B], [fr, I.bottom], [_r, I.bottom]), Y, {
		source: ["air"],
		speedRole: X
	}),
	U("src_air_coil", ["brine"], br(!0), Y, {
		source: ["air"],
		speedRole: X,
		bend: vr
	}),
	U("src_air_exit", ["brine"], H([_r, I.top], [pr, I.top], [pr, V], [hr, V]), Dr, {
		source: ["air"],
		speedRole: X
	}),
	U("src_gnd_feed", ["brine"], H([mr, B], [L.downX, B], [L.downX, R.ground]), Y, {
		source: ["ground"],
		speedRole: X
	}),
	U("src_gnd_down", ["brine"], xr(R.ground, "down"), Y, {
		source: ["ground"],
		speedRole: X,
		roundEnd: !0,
		bend: yr
	}),
	U("src_gnd_up", ["brine"], xr(R.ground, "up"), J, {
		source: ["ground"],
		speedRole: X,
		bend: yr
	}),
	U("src_gnd_exit", ["brine"], H([L.upX, R.ground], [L.upX, V], [hr, V]), J, {
		source: ["ground"],
		speedRole: X
	}),
	U("src_hyb_feed", ["brine"], H([mr, B], [fr, B], [fr, I.top], [_r, I.top]), Y, {
		source: ["hybrid"],
		speedRole: X
	}),
	U("src_hyb_coil", ["brine"], br(!1), Y, {
		source: ["hybrid"],
		speedRole: X,
		bend: vr
	}),
	U("src_hyb_link", ["brine"], H([_r, I.bottom], [L.downX, I.bottom], [L.downX, R.hybrid]), Dr, {
		source: ["hybrid"],
		speedRole: X
	}),
	U("src_hyb_down", ["brine"], xr(R.hybrid, "down"), Dr, {
		source: ["hybrid"],
		speedRole: X,
		roundEnd: !0,
		bend: yr
	}),
	U("src_hyb_up", ["brine"], xr(R.hybrid, "up"), J, {
		source: ["hybrid"],
		speedRole: X,
		bend: yr
	}),
	U("src_hyb_exit", ["brine"], H([L.upX, R.hybrid], [L.upX, R.hybrid - 15], [gr, R.hybrid - 15], [gr, V], [hr, V]), J, {
		source: ["hybrid"],
		speedRole: X
	}),
	U("ref_discharge", ["refrigerant"], "496,250 385,250", Cr, {
		through: "htr",
		speedRole: Z
	}),
	U("ref_9_14", ["refrigerant"], "385,296 416,296", Cr, {
		through: "htr",
		speedRole: Z
	}),
	U("ref_discharge_direct", ["refrigerant"], "496,250 416,250 416,296", Cr, {
		bypass: "htr",
		speedRole: Z
	}),
	U("ref_14_8", ["refrigerant"], "444,306 444,348", Cr, {
		through: "active_cooling",
		reversible: !0,
		speedRole: Z
	}),
	U("ref_7_14", ["refrigerant"], "560,348 560,296 444,296", wr, {
		through: "active_cooling",
		reversible: !0,
		speedRole: Z
	}),
	U("ref_suction", ["refrigerant"], "444,286 610,286 610,250 524,250", wr, {
		through: "active_cooling",
		speedRole: Z
	}),
	U("ref_direct_8", ["refrigerant"], "416,296 444,296 444,348", Cr, {
		bypass: "active_cooling",
		speedRole: Z
	}),
	U("ref_direct_suction", ["refrigerant"], "560,348 560,286 610,286 610,250 524,250", wr, {
		bypass: "active_cooling",
		speedRole: Z
	}),
	U("ref_8_13", ["refrigerant"], "444,416 473,416", Tr, {
		reversible: !0,
		speedRole: Z
	}),
	U("ref_13_12", ["refrigerant"], "501,416 515,416", Tr, {
		reversible: !0,
		speedRole: Z
	}),
	U("ref_12_7", ["refrigerant"], "539,416 560,416", Er, {
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
], Ar = [
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
], jr = [
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
], Mr = (e, t) => t === "htr" && e.dhw === "none" ? !1 : e.features[t], Nr = (e, t) => e === "any" ? t !== "none" : e === t;
function Pr(e, t) {
	if (e.detail === "full" && t.detail !== "full" || e.source !== void 0 && !e.source.includes(t.source) || e.dhw !== void 0 && !Nr(e.dhw, t.dhw) || e.bypass !== void 0 && Mr(t, e.bypass) !== !1 || e.through !== void 0 && Mr(t, e.through) === !1) return "hidden";
	if (e.feature !== void 0) {
		let n = Mr(t, e.feature);
		if (n === !1) return "hidden";
		if (n === "unused") return "muted";
	}
	return "normal";
}
function Fr(e, t) {
	return e.flatMap((e) => {
		let n = Pr(e, t);
		return n === "hidden" ? [] : [{
			part: e,
			state: n
		}];
	});
}
var Ir = (e) => Fr(ur, e), Lr = (e) => Fr(kr, e), Rr = (e, t) => (e.onlyWhen === void 0 || e.onlyWhen.valves2728 === t.valves2728) && e.circuit.some((e) => t.active.has(e)), zr = .35;
function Br(e) {
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
var Vr = (e) => [...e.filter((e) => !e.front), ...e.filter((e) => e.front)];
function Hr(e) {
	let t = (e) => String(Math.round(e * 100) / 100);
	return Br(e).map(({ front: e, curve: [n, r, i, a] }) => ({
		front: e,
		d: `M${t(n[0])} ${t(n[1])} C${t(r[0])} ${t(r[1])} ${t(i[0])} ${t(i[1])} ${t(a[0])} ${t(a[1])}`
	}));
}
function Ur(e, t) {
	let n = Gr(e, 0), r = [`M${String(n[0])} ${String(n[1])}`];
	for (let n = 1; n < e.length; n += 1) {
		let [i, a, o] = [
			Gr(e, n - 1),
			Gr(e, n),
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
var Wr = (e, t) => e[0] === t[0] && e[1] === t[1];
function Gr(e, t) {
	let n = e[t];
	if (n === void 0) throw Error(`No point ${String(t)}`);
	return n;
}
var Kr = (e) => e.slice(1).map((t, n) => [Gr(e, n), t]), qr = (e, t, n) => e >= Math.min(t, n) && e <= Math.max(t, n);
function Jr(e, t = []) {
	let n = [], r, i = (e) => {
		n.push(r === void 0 ? `M${String(e[0])} ${String(e[1])}` : `L${String(e[0])} ${String(e[1])}`), r = e;
	}, a = (e) => {
		n.push(`M${String(e[0])} ${String(e[1])}`), r = e;
	};
	i(Gr(e, 0));
	for (let [n, r] of Kr(e)) {
		let e = Math.sign(r[0] - n[0]), o = Math.sign(r[1] - n[1]), s = Math.abs(r[0] - n[0]) + Math.abs(r[1] - n[1]), c = t.filter((e) => Yr(e, n, r) && !Wr(e, n) && !Wr(e, r)).sort((e, t) => Math.abs(e[0] - n[0]) + Math.abs(e[1] - n[1]) - (Math.abs(t[0] - n[0]) + Math.abs(t[1] - n[1])));
		for (let t of c) {
			let c = Math.abs(t[0] - n[0]) + Math.abs(t[1] - n[1]);
			c > 7 && i([t[0] - e * 7, t[1] - o * 7]), a(s - c > 7 ? [t[0] + e * 7, t[1] + o * 7] : r);
		}
		i(r);
	}
	return n.join(" ");
}
var Yr = (e, t, n) => t[0] === n[0] && e[0] === t[0] && qr(e[1], t[1], n[1]) || t[1] === n[1] && e[1] === t[1] && qr(e[0], t[0], n[0]);
function Xr(e, t) {
	return Ar.filter((n) => n.under === e && t.has(n.over) && t.has(n.under)).map((e) => e.at);
}
// src/diagram/pipes.ts
var Zr = 1.2, Qr = .6, $r = [
	"tap_47",
	"tap_48",
	"tap_49"
], ei = [
	"prod_27_15",
	"prod_15_8",
	"prod_tap_a",
	"prod_tap_b",
	"prod_drain"
];
function ti(e) {
	if (e !== void 0 && e > 0) return Math.min(8, Math.max(Qr, Zr * 100 / e));
}
var ni = {
	"compressor.discharge_temperature": "compressor.suction_temperature",
	"compressor.suction_temperature": "compressor.discharge_temperature",
	"refrigerant.condensation_temperature": "refrigerant.evaporation_temperature",
	"refrigerant.evaporation_temperature": "refrigerant.condensation_temperature"
}, ri = (e, t) => Or.includes(e.id) && ii(t), ii = (e) => e.active.has("htr") && !e.active.has("production_dhw");
function ai(e, t) {
	return ri(e, t.circuits) ? "dhw.temperature" : e.reversible === !0 && t.mode === "active_cooling" ? ni[e.temperatureRole] ?? e.temperatureRole : (t.mode === "passive_cooling" || t.mode === "defrost") && t.circuits.valves2728 === "exchanger" && ei.includes(e.id) ? "production.outlet_temperature" : e.temperatureRole;
}
function oi(e, t, n) {
	return t === "muted" && n === "defrost" && e.feature === "passive_cooling" ? "normal" : t;
}
var si = (e, t) => {
	let n = e[t];
	return typeof n == "number" ? n : void 0;
};
function ci(e, t, n) {
	let { mode: r, circuits: i, readings: a, stops: o } = n, s = $r.includes(e.id), c = oi(e, t, r), l = s || Rr(e, i), u = si(a, ai(e, n)), d = c === "muted" || !l || u === void 0, f = e.direction === -1 != (e.reversible === !0 && r === "active_cooling"), p = {
		color: d ? Jt : rn(u, o),
		muted: d,
		reversed: f
	};
	if (!l || c === "muted" || e.stub === !0 || s) return {
		...p,
		animated: !1
	};
	let m = ri(e, i) || e.speedRole === void 0 && e.circuit.includes("htr") ? 3 : e.speedRole === void 0 ? void 0 : ti(si(a, e.speedRole));
	return m === void 0 ? {
		...p,
		animated: !1
	} : {
		...p,
		animated: !0,
		duration: m
	};
}
var li = (e) => rn(si(e.readings, "dhw.temperature"), e.stops);
function ui(e) {
	let { circuits: t, readings: n, stops: r } = e;
	return ii(t) ? rn(si(n, "dhw.temperature"), r) : t.active.has("dhw_coil") ? rn(si(n, "production.outlet_temperature"), r) : Jt;
}
// src/diagram/symbols.ts
var di = .55;
function fi(e, t, n) {
	let r = -t - 9, i = t + 9;
	return x`<path class="exchanger-fill" data-half=${e} d=${e === "left" ? `M0 ${String(r)} H-16 A4 4 0 0 0 -20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 0 -16 ${String(i)} H0 Z` : `M0 ${String(r)} H16 A4 4 0 0 1 20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 1 16 ${String(i)} H0 Z`} fill=${n} fill-opacity=${di} stroke="none" />`;
}
var pi = (e, t) => x`<text class="glyph" text-anchor="middle" dominant-baseline="central" font-size="9" fill="currentColor" stroke="none" transform="rotate(${-t})">${e}</text>`, mi = {
	kind: "helix",
	cx: 2,
	top: -60,
	bottom: 60,
	rx: 11,
	turns: 7.5
};
function hi() {
	let e = N.x + 2 - $n.x, t = Hr(mi), { cx: n, rx: r, top: i, bottom: a } = mi, o = er[0][1], s = er[1][1], c = r - n;
	return x`<g transform="matrix(0 -1 1 0 0 0)">${Vr(t).map((e) => x`<path data-half=${e.front ? "front" : "back"} stroke-linecap=${e.front ? "round" : "butt"} d=${e.d} opacity=${e.front ? C : zr} />`)}</g><path stroke-width="3" d="M${e} ${o} H${i} M${a} ${c} V${s} H${e}" />`;
}
var gi = "M9 -10.7 L-13 -3 M9 10.7 L-13 3", _i = (e, t) => x`<path d="M0 ${t} V${e}" />`, vi = (e, t) => x`<path d="${e}" fill=${t ? "currentColor" : "none"} />`;
function yi(e, t) {
	let n = t.rotation ?? 0;
	switch (e) {
		case "pump": return x`<circle r="12" /><path d="M-5 -7 V7 L8 0 Z" fill="currentColor" />`;
		case "valve3": {
			let e = t.open ?? ["l", "r"];
			return x`${vi("M-12 -6 V6 L0 0 Z", e.includes("l"))}${vi("M12 -6 V6 L0 0 Z", e.includes("r"))}${vi("M-6 12 H6 L0 0 Z", e.includes("d"))}<rect x="-4" y="-21" width="8" height="8" /><path d="M0 -13 V-8" />`;
		}
		case "inversion_valve": return x`<rect x="-10" y="-14" width="20" height="28" rx="3" /><path d="M-14 0 H-10 M10 -10 H14 M10 0 H14 M10 10 H14" />${t.reversed === !0 ? x`<path d="M-14 0 H14 M14 10 H5 V-10 H14" />` : x`<path d="M-14 0 H-5 V10 H14 M14 0 H5 V-10 H14" />`}`;
		case "probe_t": return x`<circle r="9" />${_i(16, 9)}${pi("T", n)}`;
		case "transducer_p": return x`<circle r="9" />${_i(16, 9)}${pi("P", n)}`;
		case "pressure_switch": return x`<rect x="-7" y="-7" width="14" height="14" />${_i(16, 7)}${pi("P", n)}`;
		case "thermostat": return x`<rect x="-7" y="-7" width="14" height="14" />${_i(16, 7)}${pi("T", n)}`;
		case "exchanger": {
			let e = t.size ?? 34, n = t.fills;
			return x`${n === void 0 ? C : x`${fi("left", e, n.left)}${fi("right", e, n.right)}`}<rect x="-20" y="${-e - 9}" width="40" height="${2 * e + 18}" rx="4" /><path d="M-12 ${-e} V${e} M12 ${-e} V${e}" /><circle cx="-12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="-12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" />`;
		}
		case "compressor": return x`<circle r="14" /><path class="compressor-lines" d="${gi}" />`;
		case "vessel": return x`<circle r="12" /><path d="M-12 2 H12" />`;
		case "safety_valve": return x`<path d="M0 16 V6 M-6 6 H6 L0 -4 Z M0 -4 L-3 -7 L3 -10 L0 -13" />`;
		case "valve": return x`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "drain_valve": return x`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "resistor": return x`<rect x="-28" y="-6" width="56" height="12" rx="2" /><path d="M-18 -6 V6 M18 -6 V6" />`;
		case "filter_dryer": return x`<rect x="-14" y="-5" width="28" height="10" rx="5" />`;
		case "expansion_valve": return x`<path d="M-12 -6 V6 L0 0 L12 -6 V6 L0 0 Z" />`;
		case "service_outlet": return x`<rect x="-3" y="-3" width="6" height="6" />${_i(10, 3)}`;
		case "port": return x`<rect x="-5" y="-6" width="10" height="6" />`;
		case "tank": return x`<rect class="tank-body" data-dhw-tank="internal" x=${-N.width / 2} y=${-N.height / 2} width=${N.width} height=${N.height} rx="14" fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />`;
		case "coil": return hi();
	}
}
function bi(e, t = {}) {
	return x`<g class="symbol ${e}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${t.rotation ?? 0})">${yi(e, t)}</g>`;
}
// src/diagram/cabinet.ts
var xi = o`
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
  /* A muted helix (external coil, coil 51) takes its own grey (refine-schematic-drawing D8; set by the card, light theme only). */
  .helix .pipe.muted {
    stroke: var(--ecogeo-coil-muted, var(--disabled-text-color));
  }
  /* The part of an idle coil pipe inside the tank, in the coil's grey (clipped to the tank body, refine-schematic-drawing D8). */
  .pipe-inside {
    fill: none;
    stroke: var(--ecogeo-coil-muted, var(--disabled-text-color));
    stroke-width: 3;
    stroke-linejoin: round;
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
    ${Zn}
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
function Si(e, t) {
	return e === 26 ? t.valve26 === "dhw" ? ["l", "d"] : ["l", "r"] : t.valves2728 === "exchanger" ? ["d", "r"] : ["l", "r"];
}
function Ci(e, t, n, r, i) {
	let { part: a } = e, { circuits: o } = t, s = oi(a, e.state, t.mode), [c, l, u] = a.tag, d = xt(a.item), f = Xn(Yn(Kn[a.item], r), r?.onTap);
	return x`<g class="symbol-group ${s}" data-item=${a.item} data-kind=${a.kind} aria-label=${d} role=${f.role} tabindex=${f.tabindex} @click=${f.click} @keydown=${f.keydown} style=${a.kind === "coil" ? `color: ${Oi(t)}` : C}>
    <title>${d}</title>
    <g transform="translate(${a.x} ${a.y})">${bi(a.kind, {
		rotation: a.rotation,
		size: a.size,
		open: a.kind === "valve3" ? Si(a.item, o) : void 0,
		reversed: a.kind === "inversion_valve" ? o.valve14 === "reversed" : void 0,
		fills: i
	})}</g>
    ${n === "full" ? x`<text class="item" x=${a.x + c} y=${a.y + l} text-anchor=${u ?? "start"}>${a.item}</text>` : C}
  </g>`;
}
function wi(e, t, n) {
	let r = Hr(t), i = n.muted ? C : `stroke: ${n.color}`;
	return x`<g class="helix ${n.muted ? "muted" : ""}" data-segment=${e.id} style=${i}>
    ${Vr(r).map((e) => x`<path class="pipe ${n.muted ? "muted" : ""}" data-half=${e.front ? "front" : "back"} style=${i} stroke-linecap=${e.front ? "round" : "butt"} opacity=${e.front ? C : zr} d=${e.d} />`)}
    ${n.animated ? x`<path class="flow ${n.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(n.duration)}s" d=${r.filter((e) => e.front).map((e) => e.d).join(" ")} />` : C}
  </g>`;
}
function Ti(e, t, n, r) {
	if (e.shape !== void 0) return wi(e, e.shape, t);
	let i = e.bend === void 0 ? Jr(e.points, n) : Ur(e.points, e.bend);
	return x`<path class="pipe ${t.muted ? "muted" : ""}" data-segment=${e.id} style=${t.muted ? C : `stroke: ${t.color}`} stroke-linecap=${e.roundEnd === !0 ? "round" : C} d=${i} />${t.muted && r !== void 0 && ki.has(e.id) ? x`<path class="pipe-inside" data-inside=${e.id} clip-path="url(#${r})" d=${i} />` : C}${t.animated ? x`<path class="flow ${t.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(t.duration)}s" d=${i} />` : C}`;
}
function Ei(e, t, n, r) {
	let i = (e) => e.map((e) => n.get(e)).find((e) => e !== void 0), a = e.reversible === !0 && r === "active_cooling", [o, s] = a ? [e.leaving, e.entering] : [e.entering, e.leaving], c = i(o), l = i(s), u = (c?.muted ?? !0) && (l?.muted ?? !0), d = (e) => u ? Jt : e?.color ?? "var(--disabled-text-color)", f = e.enters === "top" !== a;
	return {
		id: t,
		y1: +!f,
		y2: +!!f,
		start: d(c),
		end: d(l),
		muted: u
	};
}
var Di = (e) => x`<linearGradient id=${e.id} x1="0" y1=${e.y1} x2="0" y2=${e.y2} data-muted=${e.muted}>
      <stop offset="0" style="stop-color: ${e.start}" />
      <stop offset="1" style="stop-color: ${e.end}" />
    </linearGradient>`;
function Oi(e) {
	let t = ui(e);
	return t === "var(--disabled-text-color)" ? Xt : t;
}
var ki = /* @__PURE__ */ new Set(["dhw_ext_in", "dhw_ext_out"]);
function Ai(e, t, n, r = {
	mode: "gradient",
	idPrefix: "ecogeo"
}) {
	let i = Lr(e), a = new Set(i.map((e) => e.part.id)), o = new Map(i.map((e) => [e.part.id, ci(e.part, e.state, t)])), s = [], c = e.dhw === "external" ? `${r.idPrefix}-tank-clip` : void 0, l = Ir(e).map((i) => {
		let a = r.mode === "gradient" ? i.part.sides : void 0;
		if (a === void 0) return Ci(i, t, e.detail, n);
		let c = {
			left: "none",
			right: "none"
		};
		for (let e of a) {
			let n = Ei(e, `${r.idPrefix}-x${String(i.part.item)}-${e.half}`, o, t.mode);
			s.push(n), c[e.half] = `url(#${n.id})`;
		}
		return Ci(i, t, e.detail, n, c);
	});
	return x`<g class="cabinet">
    <defs>${s.map(Di)}${c === void 0 ? C : x`<clipPath id=${c} data-tank-clip><path d=${or()} /></clipPath>`}</defs>
    <rect class="outline" x=${M.x} y=${M.y} width=${M.width} height=${M.height} rx="6" />
    ${jr.filter((t) => Pr(t, e) !== "hidden").map((e) => x`<text class="circuit-label" x=${e.x} y=${e.y} text-anchor="middle">${mt[e.key]}</text>`)}
    ${i.map((e) => {
		let t = o.get(e.part.id);
		return t === void 0 ? C : Ti(e.part, t, Xr(e.part.id, a), c);
	})}
    ${l}
  </g>`;
}
// src/diagram/dhw.ts
var ji = o`
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
    ${Zn}
  }
  .tank-caption {
    fill: var(--secondary-text-color);
    font-size: 11px;
  }
`;
function Mi(e, t) {
	if (e.dhw !== "external") return x``;
	let { x: n, y: r, width: i, dome: a } = P, o = i / 2, s = or(), c = `M${String(n)} ${String(r + a)} A${String(o)} ${String(a)} 0 0 0 ${String(n + i)} ${String(r + a)}`, l = Xn(Yn(Jn, t), t?.onTap);
	return x`<g class="dhw-storage" data-dhw="external" aria-label=${gt.externalTank} role=${l.role} tabindex=${l.tabindex} @click=${l.click} @keydown=${l.keydown}>
    <title>${gt.externalTank}</title>
    <path class="tank-body" data-dhw-tank="external" d=${s} fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />
    <path class="tank-rim" d=${c} />
    <text class="tank-caption" x=${n + i / 2} y=${r - 6} text-anchor="middle">${gt.externalTank}</text>
  </g>`;
}
// src/lib/format.ts
var Ni = "−";
function Pi(e) {
	let t = e?.locale;
	return typeof t == "object" && t ? t : e?.language === void 0 ? {} : { language: e.language };
}
function Fi(e) {
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
var Ii = /* @__PURE__ */ new Map();
function Li(e, t, n) {
	let r = Fi(e), i = n && e.number_format !== "none", a = `${r?.join(",") ?? ""}|${String(t)}|${String(i)}`, o = Ii.get(a);
	return o === void 0 && (o = new Intl.NumberFormat(r, {
		minimumFractionDigits: t,
		maximumFractionDigits: t,
		useGrouping: i
	}), Ii.set(a, o)), o;
}
function Ri(e, t, n = 0, r = !0) {
	if (!Number.isFinite(e)) return "–";
	let i = Number.isFinite(n) ? Math.min(20, Math.max(0, Math.trunc(n))) : 0, a = Math.abs(e) < .5 / 10 ** i ? 0 : e;
	return Li(t ?? {}, i, r).formatToParts(a).map((e) => e.type === "minusSign" ? Ni : e.value).join("");
}
// src/calc/display.ts
function zi(e) {
	if (typeof e != "object" || !e) return;
	let t = e.display_precision;
	return typeof t == "number" && Number.isInteger(t) && t >= 0 && t <= 20 ? t : void 0;
}
var Bi = (e, t) => t ?? e.decimals ?? 0;
function Vi(e, t) {
	let n = typeof t == "string" ? t.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase() : "";
	return n === (e.unit ?? "").toLowerCase() || e.quantity === "difference" && n === "°c";
}
function Hi(e, t, n, r) {
	let i = wt.get(e);
	if (i === void 0 || t === void 0 || !Number.isFinite(t)) return;
	let a = n === void 0 || !Vi(i, r.states?.[n]?.attributes.unit_of_measurement) ? void 0 : zi(r.entities?.[n]), o = Ri(t, r.locale, Bi(i, a), !1);
	return i.unit === void 0 ? o : `${o} ${i.unit}`;
}
// src/diagram/labels.ts
var Ui = o`
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
}), Wi = P.x + P.width / 2, Gi = P.y + P.height + 22, Ki = N.y + 12, qi = N.x + N.width / 2, Ji = F.y + F.height + 12, Yi = sr + 6, Xi = 12, Zi = 20, Qi = [
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
	$("fan_speed", "source.fan_speed", F.fanX, Ji, "middle", {
		source: ["air", "hybrid"],
		caption: O.fan
	}),
	$("outside_temperature", "source.outside_temperature", F.fanX, Ji + 13, "middle", {
		source: ["air", "hybrid"],
		caption: O.outside
	}),
	$("air_unit_in", "brine.outlet_temperature", Yi, I.bottom - Xi, "start", {
		source: ["air"],
		caption: O.portIn
	}),
	$("air_unit_out", "source.air_unit_outlet_temperature", Yi, I.top + Xi, "start", {
		source: ["air"],
		caption: O.portOut
	}),
	$("hybrid_air_unit_in", "brine.outlet_temperature", Yi, I.top + Xi, "start", {
		source: ["hybrid"],
		caption: O.portIn
	}),
	$("ground_in", "brine.outlet_temperature", L.downX + 6, R.ground + Zi, "start", {
		source: ["ground"],
		caption: O.portIn
	}),
	$("ground_out", "brine.inlet_temperature", L.upX - 6, R.ground + Zi, "end", {
		source: ["ground"],
		caption: O.portOut
	}),
	$("hybrid_ground_out", "brine.inlet_temperature", L.upX - 6, R.hybrid + Zi, "end", {
		source: ["hybrid"],
		caption: O.portOut
	}),
	$("tank_external_temperature", "dhw.temperature", Wi, Gi, "middle", {
		dhw: "external",
		emphasis: !0
	}),
	$("tank_external_setpoint", "dhw.setpoint", Wi, Gi + 15, "middle", {
		dhw: "external",
		caption: O.setpoint
	}),
	$("tank_external_start_delta", "dhw.start_delta", Wi, Gi + 29, "middle", {
		dhw: "external",
		caption: O.startDelta
	}),
	$("tank_external_demand", "dhw.demand", Wi, Gi + 43, "middle", {
		dhw: "external",
		demand: !0
	}),
	$("tank_internal_temperature", "dhw.temperature", N.x + N.width / 6, Ki, "middle", {
		dhw: "internal",
		bare: !0
	}),
	$("tank_internal_setpoint", "dhw.setpoint", qi, Ki, "middle", {
		dhw: "internal",
		caption: O.setpointShort,
		bare: !0
	}),
	$("tank_internal_start_delta", "dhw.start_delta", N.x + N.width * 5 / 6, Ki, "middle", {
		dhw: "internal",
		caption: O.startDeltaShort,
		bare: !0
	}),
	$("tank_internal_demand", "dhw.demand", qi, Ki + 13, "middle", {
		dhw: "internal",
		demand: !0,
		bare: !0
	})
];
function $i(e, t, n, r) {
	return Qi.flatMap((i) => {
		if (Pr(i, e) === "hidden") return [];
		let a = n[i.role], o = {
			id: i.id,
			role: i.role,
			x: i.x,
			y: i.y,
			align: i.align,
			emphasis: i.emphasis === !0,
			...i.bare === !0 ? { bare: !0 } : {},
			entityId: a,
			...i.item === void 0 ? {} : { item: i.item },
			...i.caption === void 0 ? {} : { caption: i.caption }
		}, s = t[i.role];
		if (i.demand === !0) {
			let e = i.role === "heating.demand" ? _t.demand : gt.demand;
			return s === !0 ? [{
				...o,
				text: e,
				missing: !1
			}] : [];
		}
		let c = Hi(i.role, typeof s == "number" ? s : void 0, a, r);
		return [{
			...o,
			text: c ?? "–",
			missing: c === void 0
		}];
	});
}
function ea(e, t, n) {
	let r = (e, n, r, i) => ({
		id: e,
		...r === void 0 ? {} : { caption: r },
		text: i ?? "–",
		missing: i === void 0,
		entityId: t[n]
	}), i = (i, a, o) => {
		let s = e[a];
		return r(i, a, o, Hi(a, typeof s == "number" ? s : void 0, t[a], n));
	}, a = e["unit.on_off"], o = e["unit.summer"] === !0 ? vt.summer : e["unit.winter"] === !0 ? vt.winter : void 0;
	return [
		r("on_off", "unit.on_off", void 0, a === void 0 ? void 0 : yt[a.toLowerCase()] ?? a),
		r("season", e["unit.summer"] === !0 ? "unit.summer" : "unit.winter", void 0, o),
		i("outside_temperature", "source.outside_temperature", vt.outside),
		i("cop", "unit.cop", vt.cop),
		i("condensation_capacity", "heating.capacity", vt.condensation),
		i("evaporation_capacity", "cooling.capacity", vt.evaporation)
	];
}
var ta = (e) => ({
	left: `${String(e.x / Qn.width * 100)}%`,
	top: `${String(e.y / Qn.height * 100)}%`
});
function na(e, t, n, r) {
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
function ra(e, t) {
	return b`${e.map((e) => {
		let { left: n, top: r } = ta(e);
		return b`<span
      class="label ${e.align}${e.emphasis ? " emphasis" : ""}${e.bare === !0 ? " bare" : ""}"
      data-label=${e.id}
      data-role=${e.role}
      data-label-item=${e.item ?? C}
      style="left: ${n}; top: ${r}"
      >${e.caption === void 0 ? C : b`<span class="caption">${e.caption}</span>`}${na(e.entityId, e.text, e.missing, t)}</span
    >`;
	})}`;
}
function ia(e, t) {
	return b`${e.map((e) => b`<span class="footer-item" data-footer=${e.id}
        >${e.caption === void 0 ? C : b`<span class="caption">${e.caption}</span>`}${na(e.entityId, e.text, e.missing, t)}</span
      >`)}`;
}
// src/diagram/source.ts
var aa = o`
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
    ${Zn}
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
`, oa = (e) => e === void 0 || !(e > 0) ? void 0 : Math.min(6, Math.max(.5, 120 / e)), sa = [
	0,
	72,
	144,
	216,
	288
].map((e) => x`<path class="fan-blade" d="M0 -4 C9 -6 21 -16 17 -30 C6 -26 -3 -17 -3 -6 Z" transform="rotate(${e})" />`);
function ca(e, t, n) {
	let { x: r, y: i, width: a, height: o, fanX: s, fanY: c, fanRadius: l, coil: u, fins: d, slats: f, dividerY: p } = F, m = oa(e), ee = Array.from({ length: d.count }, (e, t) => d.x + t * d.step), te = Array.from({ length: f.count }, (e, t) => f.y0 + t * f.step), [ne, re] = [r + 6, s + l + 6], h = s - l - 6 - ne, g = Xn(Yn(qn, n), n?.onTap);
	return x`<g class="air-unit${t ? " muted" : ""}" data-source="air">
    <rect class="source-outline" x=${r} y=${i} width=${a} height=${o} rx="6" />
    <path class="source-divider" d="M${r} ${p} H${r + a}" />
    ${te.map((e) => x`<path class="source-slat" data-slat d="M${ne} ${e} h${h} M${re} ${e} h${h}" />`)}
    <rect class="source-frame" data-coil-block x=${u.x} y=${u.y} width=${u.width} height=${u.height} rx="3" />
    ${ee.map((e) => x`<path class="source-fin" d="M${e} ${d.y0} V${d.y1}" />`)}
    <g class="fan-part" aria-label=${St} role=${g.role} tabindex=${g.tabindex} @click=${g.click} @keydown=${g.keydown}>
      <title>${St}</title>
      <circle class="fan-ring" cx=${s} cy=${c} r=${l} />
      <circle class="fan-hit" cx=${s} cy=${c} r=${l} fill="transparent" stroke="none" />
      <g class="fan" data-fan transform="translate(${s} ${c})">
        <g class=${m === void 0 ? "fan-rotor still" : "fan-rotor"} style=${m === void 0 ? "" : `--fan-duration: ${String(m)}s`}>${sa}<circle class="fan-hub" r="5" fill="var(--primary-text-color)" /></g>
      </g>
    </g>
    <text class="source-caption" x=${F.captionX} y=${F.captionY} text-anchor="middle">${ht.air}</text>
  </g>`;
}
function la(e, t) {
	return Lr(e).flatMap(({ part: e }) => e.id.startsWith("src_") ? e.points.slice(1).flatMap((n, r) => {
		let i = e.points[r];
		return i?.[0] === n[0] && t >= Math.min(i[1], n[1]) && t <= Math.max(i[1], n[1]) ? [n[0]] : [];
	}) : []);
}
function ua(e, t, n, r) {
	let i = la(e, n), a = Array.from({ length: Math.floor((cr.end - cr.start - 12) / 10) + 1 }, (e, t) => cr.start + 6 + t * 10).filter((e) => !i.some((t) => Math.abs(t - e) < 10)), o = lr.y[t];
	return x`<g class="ground-loop${r ? " muted" : ""}" data-source="ground">
    <path class="source-ground" d="M${cr.start} ${n} H${cr.end}" />
    ${a.map((e) => x`<path class="source-ground" d="M${e} ${n} l-6 8" />`)}
    <text class="source-caption" x=${lr.x} y=${o} text-anchor="middle">${ht.ground}</text>
  </g>`;
}
function da(e, t, n, r) {
	let i = e.source === "air" || e.source === "hybrid", a = e.source === "ground" || e.source === "hybrid", o = e.source === "hybrid" ? "hybrid" : "ground";
	return x`<g class="source" data-source-kind=${e.source}>
    ${i ? ca(t["source.fan_speed"], !n, r) : x``}
    ${a ? ua(e, o, R[o], !n) : x``}
  </g>`;
}
// src/lib/define.ts
function fa(e, t) {
	let n = customElements.get(e);
	n === void 0 ? customElements.define(e, t) : n !== t && console.warn(`${e} is already defined by another copy of the module; that copy stays in use.`);
}
// src/lib/render.ts
function pa(e, t) {
	return e === t || Array.isArray(e) && Array.isArray(t) && e.length === t.length && e.every((e, n) => e === t[n]);
}
function ma(e, t) {
	if (e === t) return !0;
	if (typeof e != "object" || typeof t != "object" || e === null || t === null) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	return n.length === r.length && n.every((n) => Object.hasOwn(t, n) && pa(e[n], t[n]));
}
function ha(e, t, n) {
	return e === void 0 || e.locale !== t.locale || e.language !== t.language || e.localize !== t.localize || e.formatEntityState !== t.formatEntityState || e.themes?.darkMode !== t.themes?.darkMode || n.some((n) => e.states[n] !== t.states[n] || !ma(e.entities?.[n], t.entities?.[n]));
}
function ga(e, t, n, r) {
	return e.size === 1 && e.has("hass") ? t !== void 0 && ha(n, t, r) : !0;
}
// src/card/ecogeo-card.ts
var _a = "ecogeo-card", va = Qn.width, ya = Qn.height, ba = 0;
fa(_a, class extends Ve {
	constructor(...e) {
		super(...e), this.entityIds = [], this.idPrefix = `ecogeo${String(++ba)}`;
	}
	static {
		this.styles = [
			xi,
			aa,
			ji,
			Ui,
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
		let t = Ln(e);
		if (t.length > 0) throw Error(t.join("; "));
		this.resolved = Gn(e), this.entityIds = [...new Set(Object.values(this.resolved.entities).filter((e) => e !== void 0))], this.config = e;
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
		return ga(e, this.hass, this.renderedHass, this.entityIds);
	}
	readings(e) {
		let t = e.sample ? Hn : this.hass?.states ?? {};
		return {
			readings: kt(t, e.entities),
			offline: qe(nt(t, e.entities["unit.connection"]))
		};
	}
	render() {
		this.renderedHass = this.hass;
		let e = this.resolved;
		if (e === void 0) return b`<ha-card><div class="diagram"></div></ha-card>`;
		let { readings: t, offline: n } = this.readings(e), r = Ke(t, e.features), i = Ye(r, e.features, e.dhw, t), a = {
			mode: r,
			circuits: i,
			readings: t,
			stops: e.colors
		}, o = e.sample ? Hn : this.hass?.states ?? {}, s = {
			locale: Pi(this.hass),
			entities: this.hass?.entities,
			states: o
		}, c = e.sample ? void 0 : (e) => {
			rt(this, e);
		}, l = {
			entities: e.entities,
			onTap: c
		};
		return b`<ha-card>
      <div class="diagram">
        <svg
          viewBox="0 0 ${va} ${ya}"
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label=${dt}
          style="--dhw-tank-color: ${li(a)}; --ecogeo-coil-muted: ${Zt(this.hass?.themes?.darkMode === !0)}"
        >
          ${x`${da(e, t, i.active.has("brine"), l)}${Mi(e, l)}${Ai(e, a, l, {
			mode: e.exchangerFill,
			idPrefix: this.idPrefix
		})}`}
        </svg>
        ${ra($i(e, t, e.entities, s), c)}
      </div>
      <div class="footer">
        <span class="mode">${ft[r]}</span>
        ${ia(ea(t, e.entities, s), c)}
        ${Je(t["unit.alarm"]) ? b`<span class="alarm">${pt.alarm}</span>` : C}
        ${n ? b`<span class="offline">${pt.offline}</span>` : C}
        ${e.sample ? b`<span class="sample">${pt.sampleValues}</span>` : C}
      </div>
    </ha-card>`;
	}
});
// src/index.ts
var xa = {
	type: _a,
	...ut,
	preview: !0
};
function Sa(e = window) {
	let t = e.customCards ??= [];
	t.some((e) => e.type === xa.type) || t.push({ ...xa });
}
Sa();
export { xa as CARD_ENTRY, Sa as registerCardPicker };
