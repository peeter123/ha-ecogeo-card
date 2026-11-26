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
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: m } = Object, h = globalThis, g = h.trustedTypes, _ = g ? g.emptyScript : "", ee = h.reactiveElementPolyfillSupport, v = (e, t) => e, te = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? _ : null;
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
}, ne = (e, t) => !l(e, t), re = {
	attribute: !0,
	type: String,
	converter: te,
	reflect: !1,
	useDefault: !1,
	hasChanged: ne
};
Symbol.metadata ??= Symbol("metadata"), h.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var ie = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = re) {
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
		return this.elementProperties.get(e) ?? re;
	}
	static _$Ei() {
		if (this.hasOwnProperty(v("elementProperties"))) return;
		let e = m(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(v("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(v("properties"))) {
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
			let i = (n.converter?.toAttribute === void 0 ? te : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? te : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? ne)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
ie.elementStyles = [], ie.shadowRootOptions = { mode: "open" }, ie[v("elementProperties")] = /* @__PURE__ */ new Map(), ie[v("finalized")] = /* @__PURE__ */ new Map(), ee?.({ ReactiveElement: ie }), (h.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var ae = globalThis, oe = (e) => e, se = ae.trustedTypes, ce = se ? se.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, le = "$lit$", ue = `lit$${Math.random().toFixed(9).slice(2)}$`, de = "?" + ue, fe = `<${de}>`, pe = document, me = () => pe.createComment(""), he = (e) => e === null || typeof e != "object" && typeof e != "function", ge = Array.isArray, _e = (e) => ge(e) || typeof e?.[Symbol.iterator] == "function", ve = "[ 	\n\f\r]", ye = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, be = /-->/g, xe = />/g, Se = RegExp(`>|${ve}(?:([^\\s"'>=/]+)(${ve}*=${ve}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), Ce = /'/g, we = /"/g, Te = /^(?:script|style|textarea|title)$/i, Ee = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), y = Ee(1), b = Ee(2), De = Symbol.for("lit-noChange"), x = Symbol.for("lit-nothing"), Oe = /* @__PURE__ */ new WeakMap(), ke = pe.createTreeWalker(pe, 129);
function Ae(e, t) {
	if (!ge(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return ce === void 0 ? t : ce.createHTML(t);
}
var je = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = ye;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === ye ? c[1] === "!--" ? o = be : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = Se) : (Te.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = Se) : o = xe : o === Se ? c[0] === ">" ? (o = i ?? ye, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? Se : c[3] === "\"" ? we : Ce) : o === we || o === Ce ? o = Se : o === be || o === xe ? o = ye : (o = Se, i = void 0);
		let d = o === Se && e[t + 1].startsWith("/>") ? " " : "";
		a += o === ye ? n + fe : l >= 0 ? (r.push(s), n.slice(0, l) + le + n.slice(l) + ue + d) : n + ue + (l === -2 ? t : d);
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
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(le)) {
					let t = u[o++], n = i.getAttribute(e).split(ue), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Le : r[1] === "?" ? Re : r[1] === "@" ? ze : Ie
					}), i.removeAttribute(e);
				} else e.startsWith(ue) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (Te.test(i.tagName)) {
					let e = i.textContent.split(ue), t = e.length - 1;
					if (t > 0) {
						i.textContent = se ? se.emptyScript : "";
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
					for (; (e = i.data.indexOf(ue, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += ue.length - 1;
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
			let t = oe(e).nextSibling;
			oe(e).remove(), e = t;
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
}, Ve = ae.litHtmlPolyfillSupport;
Ve?.(Me, Fe), (ae.litHtmlVersions ??= []).push("3.3.3");
var He = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Fe(t.insertBefore(me(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Ue = globalThis, We = class extends ie {
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
	description: "The internal schematic of an Ecoforest ecoGEO heat pump, with live values and pipes coloured by temperature.",
	documentationURL: "https://github.com/peeter123/ha-ecogeo-card#readme"
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
}, Ze = { externalTank: "DHW tank" }, Qe = {
	underfloor: "Underfloor heating",
	radiator: "Radiator"
}, $e = {
	portIn: "In",
	portOut: "Out"
}, et = {
	outside: "Outside",
	cop: "COP",
	eer: "EER",
	dg1: "DG1",
	dhw: "DHW",
	cooling: "Cooling",
	htr: "HTR"
}, tt = {
	on: "On",
	off: "Off",
	emergency: "Emergency"
}, nt = {
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
	22: "HTR system retention valve",
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
	44: "Outlet resistor",
	45: "Safety thermostat",
	47: "Tap water inlet",
	48: "DHW outlet",
	49: "DHW recirculation",
	50: "DHW tank",
	51: "DHW coil",
	54: "DHW temperature probe"
}, rt = (e) => {
	let t = nt[e];
	return t === void 0 ? "" : `${t} (${String(e)})`;
}, it = "Air unit fan", at = "Air unit", ot = "Ground collector", T = {
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
		emitter: "Heat emitter",
		prefix: "Entity prefix",
		passive_cooling: "Passive cooling",
		active_cooling: "Active cooling",
		htr: "HTR",
		backup_heater: "Backup heater",
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
		htr: "HTR recovery",
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
		cop: "COP",
		active: "Active",
		system_cop: "System COP"
	},
	heatPower: "Heat power",
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
			ground: "Ground collector",
			hybrid: "Air unit and ground collector"
		},
		dhw: {
			external: "External tank",
			internal: "Internal tank",
			unused: "Tank not in use",
			none: "None"
		},
		emitter: {
			underfloor: "Underfloor heating",
			radiator: "Radiator",
			none: "None"
		},
		exchanger_fill: {
			gradient: "Gradient",
			none: "None"
		},
		layout: {
			auto: "Auto (by width)",
			horizontal: "Horizontal",
			vertical: "Vertical"
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
}, st = Je, ct = /* @__PURE__ */ new Set(["unknown", "unavailable"]), lt = -999, ut = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;
function dt(e) {
	if (!ut.test(e)) return;
	let t = Number(e);
	return Number.isFinite(t) ? t + 0 : void 0;
}
function ft(e) {
	if (e === void 0 || ct.has(e.state)) return !0;
	let t = dt(e.state);
	return t !== void 0 && t <= lt;
}
function pt(e) {
	if (!(e === void 0 || ft(e))) return dt(e.state);
}
// src/lib/hass.ts
var mt = (e, t) => t === void 0 ? void 0 : e[t];
function ht(e, t) {
	e.dispatchEvent(new CustomEvent("hass-more-info", {
		detail: { entityId: t },
		bubbles: !0,
		composed: !0
	}));
}
// src/lib/units.ts
var gt = { scale: 1 }, _t = {
	scale: 5 / 9,
	offset: -32
}, vt = {
	temperature: /* @__PURE__ */ new Map([["°c", gt], ["°f", _t]]),
	difference: /* @__PURE__ */ new Map([
		["k", gt],
		["°c", gt],
		["°f", _t]
	]),
	power: /* @__PURE__ */ new Map([["w", gt], ["kw", { scale: 1e3 }]]),
	pressure: /* @__PURE__ */ new Map([
		["bar", gt],
		["kpa", { scale: .01 }],
		["mpa", { scale: 10 }],
		["pa", { scale: 1e-5 }],
		["mbar", { scale: .001 }],
		["psi", { scale: .0689476 }]
	])
};
function yt(e) {
	return e.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase();
}
var bt = (e, t) => t !== void 0 && vt[e].has(yt(t));
function xt(e, t) {
	let n = pt(e);
	return n === void 0 ? void 0 : St(t, n, e?.attributes.unit_of_measurement);
}
function St(e, t, n) {
	if (!Number.isFinite(t) || n === void 0) return;
	let r = vt[e].get(yt(n));
	return r ? (t + (r.offset ?? 0)) * r.scale : void 0;
}
// src/config/roles.ts
var E = [
	"sensor",
	"number",
	"input_number"
], Ct = [
	...E,
	"binary_sensor",
	"switch",
	"input_boolean"
], wt = [
	"binary_sensor",
	"switch",
	"input_boolean",
	"sensor"
], Tt = [
	"sensor",
	"select",
	"input_select",
	"binary_sensor",
	"switch",
	"input_boolean"
], D = C.celsius, O = [
	{
		path: "production.outlet_temperature",
		domain: "sensor",
		suffix: "production_out",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "33",
		accepts: E,
		direction: "out"
	},
	{
		path: "production.return_temperature",
		domain: "sensor",
		suffix: "production_in",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "34",
		accepts: E,
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
		accepts: E
	},
	{
		path: "production.pump",
		domain: "sensor",
		suffix: "production_pump",
		kind: "number",
		unit: C.percent,
		decimals: 0,
		item: "15",
		onOff: !0,
		accepts: Ct
	},
	{
		path: "brine.outlet_temperature",
		domain: "sensor",
		suffix: "brine_out",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "31",
		accepts: E,
		direction: "out"
	},
	{
		path: "brine.inlet_temperature",
		domain: "sensor",
		suffix: "brine_in",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "32",
		accepts: E,
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
		accepts: E
	},
	{
		path: "brine.pump",
		domain: "sensor",
		suffix: "brine_pump",
		kind: "number",
		unit: C.percent,
		decimals: 0,
		item: "16",
		onOff: !0,
		accepts: Ct
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
		accepts: Ct
	},
	{
		path: "compressor.percentage",
		domain: "sensor",
		suffix: "compressor_percentage",
		kind: "number",
		unit: C.percent,
		decimals: 1,
		item: "11",
		accepts: E
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
		accepts: E
	},
	{
		path: "compressor.suction_temperature",
		domain: "sensor",
		suffix: "compressor_suction_temperature",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "29",
		accepts: E,
		direction: "in"
	},
	{
		path: "compressor.discharge_temperature",
		domain: "sensor",
		suffix: "compressor_discharge_temperature",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "30",
		accepts: E,
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
		accepts: E,
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
		accepts: E,
		direction: "out"
	},
	{
		path: "compressor.mode",
		domain: "sensor",
		suffix: "compressor_operation_mode",
		kind: "text",
		item: "11",
		onOff: !0,
		accepts: Tt
	},
	{
		path: "refrigerant.condensation_temperature",
		domain: "sensor",
		suffix: "condensation_temperature",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "8",
		accepts: E
	},
	{
		path: "refrigerant.evaporation_temperature",
		domain: "sensor",
		suffix: "evaporation_temperature",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "7",
		accepts: E
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
		accepts: E
	},
	{
		path: "refrigerant.expansion_valve",
		domain: "sensor",
		suffix: "expansion_valve_position",
		kind: "number",
		unit: C.percent,
		decimals: 0,
		item: "12",
		accepts: E
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
		accepts: E
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
		accepts: E
	},
	{
		path: "heating.demand",
		domain: "binary_sensor",
		suffix: "dg1_demand",
		kind: "binary",
		item: "1/2",
		accepts: wt
	},
	{
		path: "heating.setpoint",
		domain: "sensor",
		suffix: "heating_dg1_setpoint",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "1/2",
		accepts: E
	},
	{
		path: "heating.power",
		domain: "sensor",
		suffix: "heating_power_dg1",
		kind: "number",
		quantity: "power",
		unit: C.watt,
		decimals: 0,
		item: "1/2",
		optional: !0,
		accepts: E
	},
	{
		path: "dhw.temperature",
		domain: "sensor",
		suffix: "dhw_temperature",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "tank (54 on C)",
		accepts: E
	},
	{
		path: "dhw.setpoint",
		domain: "number",
		suffix: "dhw_setpoint",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 0,
		item: "tank",
		accepts: E
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
		accepts: E
	},
	{
		path: "dhw.demand",
		domain: "binary_sensor",
		suffix: "dhw_demand",
		kind: "binary",
		item: "26",
		accepts: wt
	},
	{
		path: "dhw.power",
		domain: "sensor",
		suffix: "heating_power_dhw",
		kind: "number",
		quantity: "power",
		unit: C.watt,
		decimals: 0,
		item: "26",
		optional: !0,
		accepts: E
	},
	{
		path: "htr.active",
		domain: "binary_sensor",
		suffix: "htr_active",
		kind: "binary",
		item: "9",
		optional: !0,
		accepts: wt
	},
	{
		path: "htr.power",
		domain: "sensor",
		suffix: "heating_power_htr",
		kind: "number",
		quantity: "power",
		unit: C.watt,
		decimals: 0,
		item: "9",
		optional: !0,
		accepts: E
	},
	{
		path: "source.fan_speed",
		domain: "sensor",
		suffix: "aerothermal_fan_speed",
		kind: "number",
		unit: C.percent,
		decimals: 0,
		item: "air unit",
		accepts: E
	},
	{
		path: "source.air_unit_outlet_temperature",
		domain: "sensor",
		suffix: "brine_temperature_air_unit_outlet",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "air unit",
		accepts: E
	},
	{
		path: "source.outside_temperature",
		domain: "sensor",
		suffix: "outside_temperature",
		kind: "number",
		quantity: "temperature",
		unit: D,
		decimals: 1,
		item: "air unit, footer",
		accepts: E
	},
	{
		path: "unit.on_off",
		domain: "sensor",
		suffix: "heatpump_on_off",
		kind: "text",
		item: "mode (not shown)",
		onOff: !0,
		accepts: Tt
	},
	{
		path: "unit.summer",
		domain: "binary_sensor",
		suffix: "summer",
		kind: "binary",
		item: "mode (not shown)",
		accepts: wt
	},
	{
		path: "unit.winter",
		domain: "binary_sensor",
		suffix: "winter",
		kind: "binary",
		item: "mode (not shown)",
		accepts: wt
	},
	{
		path: "unit.alarm",
		domain: "binary_sensor",
		suffix: "alarm",
		kind: "binary",
		item: "footer",
		accepts: wt
	},
	{
		path: "unit.connection",
		domain: "binary_sensor",
		suffix: "status",
		kind: "binary",
		item: "footer",
		accepts: wt
	},
	{
		path: "unit.cop",
		domain: "sensor",
		suffix: "cop",
		kind: "number",
		decimals: 1,
		item: "footer",
		accepts: E
	},
	{
		path: "unit.system_cop",
		domain: "sensor",
		suffix: "system_cop_display",
		kind: "number",
		decimals: 1,
		item: "footer",
		optional: !0,
		accepts: E
	}
], Et = [
	"binary_sensor",
	"switch",
	"input_boolean"
], Dt = (e) => e !== void 0 && Et.includes(e.split(".")[0] ?? ""), Ot = new Map(O.map((e) => [e.path, e])), kt = O.filter((e) => "optional" in e).map((e) => e.path), At = O.map((e) => e.path);
[...new Set(O.flatMap((e) => "unit" in e ? [e.unit] : []))];
var jt = (e, t) => `${e.domain}.${t}_${e.suffix}`;
// src/calc/readings.ts
function Mt(e, t) {
	return t.quantity === void 0 ? pt(e) : xt(e, t.quantity) ?? (t.quantity === "pressure" ? pt(e) : void 0);
}
function Nt(e) {
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
function Pt(e, t, n) {
	if (t.onOff === !0 && Dt(n)) return Nt(e);
	switch (t.kind) {
		case "number": return Mt(e, t);
		case "text": return e === void 0 || ft(e) || ["unavailable", "unknown"].includes(e.state.trim().toLowerCase()) ? void 0 : e.state.trim();
		case "binary": return Nt(e);
	}
}
function Ft(e, t) {
	return Object.fromEntries(O.map((n) => [n.path, Pt(mt(e, t[n.path]), n, t[n.path])]));
}
function It(e, t, n) {
	return new Set(kt.filter((r) => {
		let i = t[r];
		return i === void 0 || n.has(r) && mt(e, i) === void 0;
	}));
}
var Lt = [
	"production.pump",
	"brine.pump",
	"source.fan_speed"
];
function Rt(e, t, n) {
	let r = {};
	for (let i of Lt) {
		let a = e[i], o = mt(n, t[i])?.attributes.unit_of_measurement?.trim();
		typeof a == "number" && a > 0 && o !== void 0 && o !== "" && o !== "%" && (r[i] = !0);
	}
	return {
		...e,
		...r
	};
}
// src/calc/mode.ts
var zt = 100, Bt = (e, t) => typeof e == "string" && t.some((t) => t.trim().toLowerCase() === e.trim().toLowerCase()), Vt = (e) => e === !0 || typeof e == "number" && e > 0;
function Ht(e) {
	let t = e["compressor.speed"];
	if (t !== void 0) return Vt(t);
	let n = e["compressor.percentage"];
	if (n !== void 0) return n > 0;
	let r = e["compressor.power"];
	return r === void 0 ? void 0 : r > zt;
}
function Ut(e, t, n = st) {
	let r = e["unit.on_off"];
	if (r === !1 || Bt(r, n.off)) return "off";
	let i = e["compressor.mode"];
	if (i === !0 || Bt(i, n.defrost)) return "defrost";
	let a = Ht(e);
	if (a === void 0) return "standby";
	let o = e["unit.summer"] === !0;
	return a ? e["dhw.demand"] === !0 ? "dhw" : o && t.active_cooling === !0 ? "active_cooling" : "heating" : o && Vt(e["production.pump"]) && t.passive_cooling === !0 ? "passive_cooling" : "standby";
}
function Wt(e) {
	return e !== void 0 && (Nt(e) === !1 || ft({ state: e.state.trim().toLowerCase() }));
}
var Gt = (e) => e === !0;
// src/calc/circuits.ts
function Kt(e, t, n, r, i) {
	return t !== !0 || !n ? !1 : i ? r["htr.active"] === !0 : e === "active_cooling" && (r["heating.capacity"] ?? 0) > 0;
}
function qt(e, t, n, r) {
	switch (e) {
		case "heating":
		case "active_cooling": return [
			"refrigerant",
			"brine",
			"production_dg1",
			...n ? ["htr", "dhw_coil"] : []
		];
		case "dhw": return [
			"refrigerant",
			"brine",
			...t ? ["production_dhw", "dhw_coil"] : []
		];
		case "passive_cooling":
		case "defrost": return [
			"brine",
			"production_dg1",
			...r ? ["exchanger_10"] : []
		];
		case "off":
		case "standby": return [];
	}
}
function Jt(e, t, n, r, i, a) {
	let o = t.passive_cooling !== !1, s = n === "external" || n === "internal", c = Kt(e, t.htr, s, r, a), l = new Set(qt(e, s, c, o));
	return i && !Vt(r["brine.pump"]) && l.delete("brine"), {
		valve26: e === "dhw" ? "dhw" : "production",
		valve14: e === "active_cooling" ? "reversed" : "normal",
		valves2728: (e === "passive_cooling" || e === "defrost") && o ? "exchanger" : "closed",
		active: l
	};
}
// src/lib/config.ts
var Yt = /^[a-z][a-z0-9_]*\.[a-z0-9_]+$/;
function k(e, t) {
	let n = e;
	for (let e of t.split(".")) {
		if (typeof n != "object" || !n || !Object.hasOwn(n, e)) return;
		n = n[e];
	}
	return n;
}
function Xt(e) {
	if (typeof e != "string") return;
	let t = e.trim();
	return Yt.test(t) ? t : void 0;
}
function Zt(e, t) {
	return Xt(k(e, t));
}
// src/lib/options.ts
var Qt = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, $t = /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|var)\((.*)\)$/i, en = /^[#a-zA-Z0-9(),.%\s/+-]+$/, tn = /* @__PURE__ */ new Set(/* @__PURE__ */ "aliceblue.antiquewhite.aqua.aquamarine.azure.beige.bisque.black.blanchedalmond.blue.blueviolet.brown.burlywood.cadetblue.chartreuse.chocolate.coral.cornflowerblue.cornsilk.crimson.cyan.darkblue.darkcyan.darkgoldenrod.darkgray.darkgreen.darkgrey.darkkhaki.darkmagenta.darkolivegreen.darkorange.darkorchid.darkred.darksalmon.darkseagreen.darkslateblue.darkslategray.darkslategrey.darkturquoise.darkviolet.deeppink.deepskyblue.dimgray.dimgrey.dodgerblue.firebrick.floralwhite.forestgreen.fuchsia.gainsboro.ghostwhite.gold.goldenrod.gray.green.greenyellow.grey.honeydew.hotpink.indianred.indigo.ivory.khaki.lavender.lavenderblush.lawngreen.lemonchiffon.lightblue.lightcoral.lightcyan.lightgoldenrodyellow.lightgray.lightgreen.lightgrey.lightpink.lightsalmon.lightseagreen.lightskyblue.lightslategray.lightslategrey.lightsteelblue.lightyellow.lime.limegreen.linen.magenta.maroon.mediumaquamarine.mediumblue.mediumorchid.mediumpurple.mediumseagreen.mediumslateblue.mediumspringgreen.mediumturquoise.mediumvioletred.midnightblue.mintcream.mistyrose.moccasin.navajowhite.navy.oldlace.olive.olivedrab.orange.orangered.orchid.palegoldenrod.palegreen.paleturquoise.palevioletred.papayawhip.peachpuff.peru.pink.plum.powderblue.purple.rebeccapurple.red.rosybrown.royalblue.saddlebrown.salmon.sandybrown.seagreen.seashell.sienna.silver.skyblue.slateblue.slategray.slategrey.snow.springgreen.steelblue.tan.teal.thistle.tomato.turquoise.violet.wheat.white.whitesmoke.yellow.yellowgreen.transparent.currentcolor".split("."));
function nn(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) if (e[n] === "(" && t++, e[n] === ")" && (t--, t < 0 || t === 0 && n !== e.length - 1)) return !1;
	return t === 0;
}
function rn(e) {
	let t = e.trim();
	if (t.length === 0 || t.length > 100 || !en.test(t)) return !1;
	if (Qt.test(t) || tn.has(t.toLowerCase())) return !0;
	let n = $t.exec(t);
	if (n === null || !nn(t)) return !1;
	if (n[1]?.toLowerCase() !== "var") return !0;
	let [r, ...i] = (n[2] ?? "").split(",");
	return /^\s*--[a-zA-Z0-9-]+\s*$/.test(r ?? "") && (i.length === 0 || rn(i.join(",")));
}
var an = (e) => e == null;
function on(e) {
	switch (e.kind) {
		case "number": return S.number(String(e.min), String(e.max));
		case "color": return S.color;
		case "boolean": return S.boolean;
		case "choice": return S.choice(e.choices);
		case "list": return S.list;
	}
}
var sn = (e) => e === null || [
	"string",
	"number",
	"boolean"
].includes(typeof e);
function cn(e) {
	return e.map((e) => typeof e == "boolean" ? e ? "on" : "off" : e === null ? "" : String(e)).filter((e) => e.trim() !== "");
}
function ln(e, t) {
	switch (e.kind) {
		case "number": return typeof t == "number" && Number.isFinite(t) && t >= e.min && t <= e.max;
		case "color": return typeof t == "string" && rn(t);
		case "boolean": return typeof t == "boolean";
		case "choice": return typeof t == "string" && e.choices.includes(t);
		case "list": return Array.isArray(t) && t.every(sn);
	}
}
function un(e, t) {
	let n = t.split(".").slice(0, -1);
	for (let t = 1; t <= n.length; t++) {
		let r = n.slice(0, t).join("."), i = k(e, r);
		if (!an(i) && (typeof i != "object" || Array.isArray(i))) return r;
	}
}
function dn(e, t) {
	let n = t.flatMap((t) => {
		let n = un(e, t.path);
		if (n !== void 0) return [S.invalid(n, S.object)];
		let r = k(e, t.path);
		return an(r) || ln(t, r) ? [] : [S.invalid(t.path, on(t))];
	});
	return [...new Set(n)];
}
function fn(e, t) {
	let n = k(e, t.path);
	if (t.kind === "list" && Array.isArray(n) && ln(t, n)) {
		let e = cn(n);
		return e.length > 0 ? e : t.default;
	}
	return an(n) || !ln(t, n) ? t.default : n;
}
// src/diagram/colors.ts
var pn = [
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
], mn = 2, hn = 8, A = "var(--disabled-text-color)", gn = "#8a8a8a", _n = `var(--ecogeo-coil-muted, ${A})`, vn = (e) => e ? A : gn, yn = (e) => typeof e == "object" && !!e && !Array.isArray(e), bn = (e) => typeof e == "string" && dn({ color: e }, [{
	kind: "color",
	path: "color",
	default: ""
}]).length === 0, xn = (e) => e.map((e) => ({
	temperature: e.temperature,
	color: e.color.trim()
}));
function Sn(e) {
	let t = k(e, "colors");
	if (t == null) return [];
	if (!Array.isArray(t) || t.length < mn || t.length > hn) return [w.colors];
	let n = t;
	if (!n.every((e) => yn(e) && typeof e.temperature == "number" && Number.isFinite(e.temperature) && bn(e.color))) return [w.colors];
	let r = xn(n).map((e) => e.temperature);
	return r.every((e, t) => t === 0 || e > (r[t - 1] ?? 0)) ? [] : [w.colors];
}
function Cn(e) {
	let t = k(e, "colors");
	return Array.isArray(t) && Sn(e).length === 0 ? xn(t) : pn;
}
function wn(e, t = pn) {
	let n = t[0], r = t[t.length - 1];
	if (e === void 0 || !Number.isFinite(e) || n === void 0 || r === void 0) return A;
	if (e <= n.temperature) return n.color;
	if (e >= r.temperature) return r.color;
	let i = t.findIndex((t) => t.temperature >= e), a = t[i - 1], o = t[i];
	if (a === void 0 || o === void 0) return r.color;
	let s = Math.round((e - a.temperature) / (o.temperature - a.temperature) * 1e3) / 10;
	return s <= 0 ? a.color : s >= 100 ? o.color : `color-mix(in srgb, ${o.color} ${String(s)}%, ${a.color})`;
}
// src/config/variants.ts
var Tn = [
	"active_cooling",
	"passive_cooling",
	"htr",
	"backup_heater"
], En = [
	1,
	2,
	3,
	4
];
function Dn(e) {
	return {
		active_cooling: e === 3 || e === 4,
		passive_cooling: e === 2 || e === 4,
		htr: !0,
		backup_heater: !0
	};
}
function On(e, t) {
	return {
		...Dn(e),
		...t
	};
}
// src/config/options.ts
var kn = ["B", "C"], An = [
	"air",
	"ground",
	"hybrid"
], jn = [
	"external",
	"internal",
	"unused",
	"none"
], Mn = [
	"underfloor",
	"radiator",
	"none"
], Nn = {
	kind: "choice",
	path: "model",
	default: "B",
	choices: kn
}, Pn = {
	kind: "choice",
	path: "source",
	default: "ground",
	choices: An
}, Fn = {
	kind: "choice",
	path: "dhw",
	default: "external",
	choices: jn
}, In = {
	kind: "choice",
	path: "emitter",
	default: "underfloor",
	choices: Mn
}, Ln = {
	kind: "choice",
	path: "exchanger_fill",
	default: "gradient",
	choices: ["gradient", "none"]
}, Rn = {
	kind: "choice",
	path: "layout",
	default: "auto",
	choices: [
		"auto",
		"horizontal",
		"vertical"
	]
}, zn = [
	Nn,
	Pn,
	Fn,
	In,
	Ln,
	Rn
], Bn = [
	"type",
	"model",
	"variant",
	"source",
	"dhw",
	"emitter",
	"prefix",
	"features",
	"entities",
	"states",
	"colors",
	"exchanger_fill",
	"layout",
	"view_layout",
	"layout_options",
	"grid_options",
	"visibility"
], Vn = (e) => e === "C" ? "internal" : "external", j = (e) => e == null, Hn = (e) => j(e) || typeof e == "string" && e.trim() === "", M = (e) => typeof e == "object" && !!e && !Array.isArray(e), Un = /^[a-z0-9_]+$/, Wn = "none", Gn = (e) => typeof e == "string" && e.trim() === Wn;
function Kn(e) {
	let t = k(e, "prefix");
	return Hn(t) ? void 0 : t.trim();
}
function qn(e) {
	let t = k(e, "variant");
	return En.find((e) => e === t) ?? 4;
}
function Jn(e) {
	let t = fn(e, Nn), n = !j(k(e, "dhw"));
	return {
		model: t,
		source: fn(e, Pn),
		dhw: n ? fn(e, Fn) : Vn(t),
		emitter: fn(e, In)
	};
}
var Yn = (e) => fn(e, Ln), Xn = (e) => fn(e, Rn), Zn = ["off", "defrost"], Qn = (e) => Array.isArray(e) && e.length > 0 && e.every((e) => typeof e == "string" && e.trim() !== "");
function $n(e) {
	let t = k(e, "states"), n = M(t) ? t : {}, r = (e) => {
		let t = n[e];
		return Qn(t) ? t : st[e];
	};
	return {
		off: r("off"),
		defrost: r("defrost")
	};
}
function er(e) {
	let t = k(e, "features");
	if (!M(t)) return {};
	let n = {};
	for (let e of Tn) {
		let r = t[e];
		(r === !0 || r === !1 || r === "unused") && (n[e] = r);
	}
	return n;
}
var tr = (e) => e === !0 || e === !1 || e === "unused";
function nr(e) {
	let t = k(e, "entities");
	return M(t) ? new Set(rr(t).filter(([e, t]) => Ot.has(e) && Gn(t)).map(([e]) => e)) : /* @__PURE__ */ new Set();
}
function rr(e, t = "") {
	return Object.entries(e).flatMap(([e, n]) => {
		let r = t === "" ? e : `${t}.${e}`;
		return M(n) ? rr(n, r) : [[r, n]];
	});
}
function ir(e) {
	let t = k(e, "variant");
	return j(t) || En.some((e) => e === t) ? [] : [S.invalid("variant", w.integer(String(En[0]), String(En[En.length - 1])))];
}
function ar(e) {
	let t = k(e, "prefix");
	return Hn(t) || typeof t == "string" && Un.test(t.trim()) ? [] : [S.invalid("prefix", w.prefix)];
}
function or(e) {
	let t = k(e, "features");
	return j(t) ? [] : M(t) ? Object.entries(t).flatMap(([e, t]) => Tn.some((t) => t === e) ? j(t) || tr(t) ? [] : [w.featureState(e)] : [w.unknownFeature(e, Tn)]) : [S.invalid("features", S.object)];
}
function sr(e) {
	let t = k(e, "states");
	return j(t) ? [] : M(t) ? Object.entries(t).flatMap(([e, t]) => Zn.some((t) => t === e) ? j(t) || Qn(t) ? [] : [w.statesList(e)] : [w.statesKey(e)]) : [S.invalid("states", S.object)];
}
function cr(e) {
	let t = k(e, "entities");
	return j(t) ? [] : M(t) ? rr(t).flatMap(([e, t]) => Hn(t) ? [] : Ot.has(e) ? Xt(t) !== void 0 || Gn(t) ? [] : [w.notEntityId(e)] : [w.unknownRole(e)]) : [S.invalid("entities", S.object)];
}
function lr(e) {
	let t = k(e, "entities");
	return M(t) && rr(t).some(([, e]) => !Hn(e));
}
function ur(e) {
	let t = Object.keys(e).filter((e) => !Bn.includes(e)).map((e) => w.unknownOption(e)), n = dn(e, zn), r = [
		...t,
		...n,
		...ir(e),
		...ar(e),
		...or(e),
		...cr(e),
		...sr(e),
		...Sn(e)
	];
	if (dn(e, [Nn, Fn]).length === 0 && !j(k(e, "dhw"))) {
		let { model: t, dhw: n } = Jn(e);
		(t === "B" && n === "internal" || t === "C" && (n === "external" || n === "none")) && r.push(w.dhwMismatch(n, t));
	}
	return r;
}
// src/config/sample.ts
var dr = (e) => `ecogeo_sample.${e.replace(".", "_")}`, fr = {
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
	"heating.power": "4712",
	"dhw.power": "0",
	"htr.active": "off",
	"htr.power": "0",
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
	"unit.cop": "6",
	"unit.system_cop": "5.8"
}, pr = "2026-01-01T12:00:00Z", mr = Object.fromEntries(At.map((e) => [e, dr(e)])), hr = Object.fromEntries(At.map((e) => {
	let t = Ot.get(e)?.unit, n = dr(e);
	return [n, {
		entity_id: n,
		state: fr[e],
		last_updated: pr,
		attributes: t === void 0 ? {} : { unit_of_measurement: t }
	}];
}));
// src/config/resolve.ts
function gr(e, t, n = nr(e)) {
	return Object.fromEntries(O.map((r) => [r.path, Zt(e, `entities.${r.path}`) ?? (t === void 0 || n.has(r.path) ? void 0 : jt(r, t))]));
}
function _r(e, t, n = nr(e)) {
	return t === void 0 ? /* @__PURE__ */ new Set() : new Set(O.filter((t) => Zt(e, `entities.${t.path}`) === void 0 && !n.has(t.path)).map((e) => e.path));
}
var vr = (e) => Kn(e) === void 0 && !lr(e);
function yr(e) {
	let t = Kn(e), n = qn(e), r = vr(e), i = nr(e);
	return {
		...Jn(e),
		exchangerFill: Yn(e),
		layout: Xn(e),
		variant: n,
		prefix: t,
		states: $n(e),
		colors: Cn(e),
		features: On(n, er(e)),
		entities: r ? mr : gr(e, t, i),
		notPresent: i,
		defaulted: r ? /* @__PURE__ */ new Set() : _r(e, t, i),
		sample: r
	};
}
// src/diagram/component-info.ts
var br = {
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
}, xr = [
	"compressor.speed",
	"compressor.percentage",
	"compressor.power"
];
function Sr(e, t) {
	return e === 11 ? xr.find((e) => t?.entities[e] !== void 0) ?? xr[0] : br[e];
}
var Cr = "source.fan_speed", wr = "heating.demand", Tr = "dhw.temperature", Er = (e, t) => e === void 0 || t?.onTap === void 0 ? void 0 : t.entities[e];
function Dr(e, t) {
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
var Or = o`
  outline: 2px solid var(--primary-color, currentColor);
  outline-offset: 2px;
  filter: drop-shadow(0 0 2px var(--primary-color, currentColor));
`;
function kr(e, t, n) {
	return e === "auto" ? t === void 0 || !(t > 0) ? !1 : t < 560 + (n ? 24 : 0) : e === "vertical";
}
var Ar = {
	pipe: 3,
	outline: 2
}, jr = 2, Mr = 1.25, Nr = (e) => Math.ceil(e * 10 - 1e-9) / 10;
function Pr(e, t = 1e3) {
	if (e === void 0 || !(e > 0)) return Ar;
	let n = e / t;
	return {
		pipe: Math.max(Ar.pipe, Nr(jr / n)),
		outline: Math.max(Ar.outline, Nr(Mr / n))
	};
}
function Fr(e) {
	let { cardWidth: t, viewBox: n } = e;
	if (t === void 0 || !(t > 0)) return 0;
	if (!e.isPanel || !(e.windowHeight > 0)) return t;
	let r = e.headerHeight !== void 0 && e.headerHeight > 0 ? e.headerHeight : 56, i = e.safeAreaTop !== void 0 && e.safeAreaTop > 0 ? e.safeAreaTop : 0, a = Math.floor((e.windowHeight - r - i - 64) * n.width / n.height);
	return Math.min(t, Math.max(a, 320));
}
// src/diagram/label-places.ts
var Ir = {
	horizontal: 1.3,
	vertical: 2.4
}, Lr = (e) => `max(10px, ${String(Ir[e])}cqw)`, Rr = 12, zr = {
	horizontal: 1e3,
	vertical: 740
}, Br = {
	horizontal: Math.ceil((Rr * zr.horizontal / 560 + 1) / 4) * 4,
	vertical: Math.ceil((Rr * zr.vertical / 320 + 1) / 4) * 4
}, Vr = {}, Hr = (() => {
	let e = (e, t, n, r, i) => ({
		at: (r) => ({
			x: e,
			y: t + r.headShift,
			align: n,
			...i ? { rotate: -90 } : {}
		}),
		reason: r
	}), t = "turned -90 degrees along its vertical pipe, in one row with its outlet, return and pressure values at the same height (the search keeps their vertical extents nested, in this order from left to right)";
	return {
		production_out: e(56, 424, "middle", `the left strip between the outline and riser 1 is 55 units wide: the default place on probe 33 meets it; ${t}, under probe 33`, !0),
		production_in: e(96, 424, "middle", `the gap between riser 1 and the trunk is 77 units wide, probe 34's body fills its right side: the default place on probe 34 meets it; ${t}, left of the trunk under probe 34`, !0),
		production_pressure: e(132, 432, "middle", `the default place on transducer 38 meets it; ${t}, under transducer 38 and next to the return value in the same gap`, !0),
		brine_out: e(532, 424, "middle", `the gap between the suction line and riser 3 is 47 units wide: the default place on probe 31 meets it and riser 3; ${t}, under probe 31`, !0),
		brine_in: e(628, 424, "middle", `the default place on probe 32 meets it and riser 4; ${t}, right of riser 4, in order after the outlet value`, !0),
		brine_pressure: e(664, 420, "middle", `the default place on transducer 37 meets it and riser 4; ${t}, next to the return value in the gap right of riser 4 (123 units wide)`, !0),
		brine_pump: e(636, 560, "middle", "the default place on pump 16 meets it; turned -90 degrees along riser 4, right of the pump in the gap right of riser 4", !0),
		production_pump: e(192, 620, "start", "horizontal, above pump 15 (the search keeps it no lower than its default place): the default place meets valve 27, so it starts 10 units right of it", !1)
	};
})(), Ur = {
	production_out: {
		x: 49,
		y: 112,
		rotate: !0
	},
	production_in: {
		x: 126,
		y: 112,
		rotate: !0
	},
	production_pressure: {
		x: 126,
		y: 142,
		rotate: !0
	},
	production_pump: {
		x: 217,
		y: 366
	},
	brine_out: {
		x: 526,
		y: 112,
		rotate: !0
	},
	brine_in: {
		x: 581,
		y: 112,
		rotate: !0
	},
	brine_pressure: {
		x: 581,
		y: 142,
		rotate: !0
	},
	brine_pump: {
		x: 597,
		y: 298,
		rotate: !0
	}
}, Wr = (e, t, n, r, i, a = {}) => ({
	id: e,
	role: t,
	x: n,
	y: r,
	align: i,
	...a
}), Gr = (e) => [e.x + e.width / 2, e.y + e.height / 2], Kr = 44;
function qr(e) {
	let t = [], { airUnit: n, collector: r, externalTank: i } = e;
	if (n !== void 0 && (e.key?.source === "air" || e.key?.source === "hybrid")) {
		let { outside: r, speed: i, out: a } = n.values, o = ["air", "hybrid"];
		t.push(Wr("outside_temperature", "source.outside_temperature", ...Gr(r), "middle", {
			source: o,
			bare: !0
		}), Wr("fan_speed", "source.fan_speed", ...Gr(i), "middle", {
			source: o,
			bare: !0
		})), e.key.source === "air" && t.push(Wr("air_unit_out", "source.air_unit_outlet_temperature", a.x, Gr(a)[1], "start", {
			source: ["air"],
			bare: !0
		}));
	}
	if (r !== void 0 && e.key?.source !== void 0 && e.key.source !== "air") {
		let n = r.out.x + r.out.width, i = Gr(r.out)[1], a = e.key.source === "hybrid";
		t.push(Wr(a ? "hybrid_ground_out" : "ground_out", "brine.inlet_temperature", n, i, "end", {
			source: [a ? "hybrid" : "ground"],
			bare: !0
		}));
	}
	if (i !== void 0) {
		let e = i.x + i.width / 2;
		t.push(Wr("tank_external_temperature", "dhw.temperature", e, i.y + Kr, "middle", {
			dhw: "external",
			bare: !0
		}));
	}
	return t;
}
function Jr(e, t = (e, t) => [e, t], n = "horizontal") {
	let { internalTank: r } = e, i = r.y + 16, a = n === "vertical", o = Wr, s = (e, r, i, a, s, c) => {
		let l = n === "vertical" ? Ur[e] : void 0;
		if (l !== void 0) {
			let [n, i] = t(l.x, l.y);
			return o(e, r, n, i, "middle", l.rotate === !0 ? {
				...c,
				rotate: -90
			} : c);
		}
		let [u, d] = t(i, a);
		return o(e, r, u, d, s, c);
	}, c = Br[n], l = (e, n, r, i, a, s, l) => {
		let [u, d] = t(i, a);
		return o(n, r, u, d + e * c, s, l);
	};
	return { specs: [
		s("production_out", "production.outlet_temperature", 38, 112, "end", {
			item: 33,
			caption: $e.portOut
		}),
		s("production_in", "production.return_temperature", 115, 112, "end", {
			item: 34,
			caption: $e.portIn
		}),
		s("production_pressure", "production.pressure", 115, 142, "end", { item: 38 }),
		s("production_pump", "production.pump", 229, 370, "start", { item: 15 }),
		s("brine_out", "brine.outlet_temperature", 544, 112, "start", {
			item: 31,
			caption: $e.portOut
		}),
		s("brine_in", "brine.inlet_temperature", 609, 112, "start", {
			item: 32,
			caption: $e.portIn
		}),
		s("brine_pressure", "brine.pressure", 570, 142, "end", { item: 37 }),
		s("brine_pump", "brine.pump", 570, 298, "end", { item: 16 }),
		s("discharge_temperature", "compressor.discharge_temperature", 283, 167, "start", { item: 30 }),
		l(1, "discharge_pressure", "compressor.discharge_pressure", 283, 167, "start", { item: 36 }),
		s("suction_temperature", "compressor.suction_temperature", 401, 167, "start", { item: 29 }),
		l(1, "suction_pressure", "compressor.suction_pressure", 401, 167, "start", { item: 35 }),
		l(2, "compressor_speed", "compressor.speed", 360, 167, "middle", { item: 11 }),
		s("expansion_valve", "refrigerant.expansion_valve", 412, 426, "middle", { item: 12 }),
		...qr(e),
		o("tank_internal_temperature", "dhw.temperature", r.x + (a ? 24 : 70), a ? r.y + 18 : i, a ? "start" : "end", {
			dhw: "internal",
			bare: !0
		})
	] };
}
// src/diagram/geometry.ts
var N = {
	height: 176,
	top: 6,
	joinLane: 56,
	gap: 24,
	radius: 6,
	margin: 8,
	air: {
		width: 190,
		height: 176
	},
	collector: {
		width: 126,
		height: 176
	},
	hybridGap: 12,
	tank: {
		width: 160,
		height: 176,
		dome: 14
	},
	emitter: {
		width: 180,
		height: 176
	}
}, Yr = {
	jog: 24,
	second: 34,
	third: 44
}, Xr = {
	horizontal: Yr,
	vertical: Yr
}, Zr = (e) => e === "air" ? N.air.width : e === "ground" ? N.collector.width : N.air.width + N.hybridGap + N.collector.width;
function Qr(e, t, n) {
	let r = (e) => Math.min(Math.max(e.total / e.members.length, t.min), t.max - e.width), i = [];
	for (let t of e.filter((e) => e.width > 0)) {
		let e = {
			members: [{
				item: t,
				offset: 0
			}],
			width: t.width,
			total: t.centre - t.width / 2,
			x0: 0
		};
		for (e.x0 = r(e);;) {
			let t = i[i.length - 1];
			if (t === void 0 || t.x0 + t.width + n <= e.x0) break;
			i.pop();
			let a = t.width + n;
			e = {
				members: [...t.members, ...e.members.map((e) => ({
					...e,
					offset: e.offset + a
				}))],
				width: t.width + n + e.width,
				total: t.total + e.total - e.members.length * a,
				x0: 0
			}, e.x0 = r(e);
		}
		i.push(e);
	}
	return Object.fromEntries(i.flatMap((e) => e.members.map(({ item: t, offset: n }) => [t.name, {
		x0: $r(e.x0 + n),
		x1: $r(e.x0 + n + t.width)
	}])));
}
var $r = (e) => Math.round(e * 100) / 100, ei = 8, ti = 40;
function ni(e, t) {
	let { width: n, height: r } = N.air, i = t - r, a = N.margin, o = {
		x: e + a,
		y: i + 36,
		width: 64,
		height: 120
	}, s = e + n * .62, c = i + 74;
	return {
		x: e,
		y: i,
		width: n,
		height: r,
		fan: {
			cx: s,
			cy: c,
			radius: ti
		},
		body: {
			x: e,
			y: i,
			width: n,
			height: r - ei
		},
		feet: [e + 24, e + 138].map((e) => ({
			x: e,
			y: t - ei,
			width: 24,
			height: ei
		})),
		coil: o,
		fins: {
			x0: o.x + 4,
			x1: o.x + o.width - 4,
			y0: o.y + 10,
			step: 10,
			count: 11
		},
		passes: {
			x0: o.x + 10,
			step: 14,
			count: 4,
			top: o.y + 14,
			bottom: o.y + 100
		},
		values: {
			outside: {
				x: s - 64,
				y: i + 4,
				width: 128,
				height: 28
			},
			speed: {
				x: s - 64,
				y: c + ti + 2,
				width: 128,
				height: 24
			},
			out: {
				x: o.x + o.width + 6,
				y: i + 140,
				width: n - 2 * a - o.width - 6,
				height: 24
			}
		}
	};
}
var ri = 16, ii = 20;
function ai(e, t) {
	let { width: n, height: r } = N.collector, i = t - r, a = N.margin + Ar.pipe / 2, o = e + a, s = e + n - a, c = o + ii, l = c + ri, u = s - ii, d = u - ri, f = i + 128, p = s - 1.5 * Ar.pipe;
	return {
		x: e,
		y: i,
		width: n,
		height: r,
		hatch: {
			x: e,
			y: i,
			width: n,
			height: 14
		},
		out: {
			x: o + N.margin,
			y: i + 138,
			width: p - (o + N.margin),
			height: 28
		},
		probe: {
			x: e + N.margin,
			y: i + 18,
			width: n - 2 * N.margin,
			height: f + Ar.pipe - (i + 18)
		},
		feedX: o,
		returnX: s,
		legs: [
			c,
			l,
			d,
			u
		],
		headerY: i + 24,
		bendY: f
	};
}
var oi = 12, si = {
	pitch: 14,
	turns: 3
}, P = {
	count: 6,
	width: 10,
	gap: 8,
	top: 52,
	bottom: 168,
	inletY: 62,
	outletY: 158
};
function ci(e, t) {
	let { width: n, height: r } = N.emitter, i = si.pitch, a = t + r, o = (r) => ({
		l: e + N.margin + 2 * i * r,
		r: e + n - N.margin - 2 * i * r,
		t: t + N.margin + 2 * i * r,
		b: a - N.margin - 2 * i * r
	}), s = e + n / 2 - i / 2, c = e + n / 2 + i / 2, l = [[s, a], [s, o(0).b]], u = [[c, a], [c, o(0).b - i]];
	for (let e = 0; e < si.turns; e += 1) {
		let t = o(e);
		if (l.push([t.l, t.b], [t.l, t.t], [t.r, t.t]), u.push([t.l + i, t.b - i], [t.l + i, t.t + i]), e < si.turns - 1) {
			let n = o(e + 1);
			l.push([t.r, n.b]), u.push([t.r - i, t.t + i], [t.r - i, n.b - i]);
		} else u.push([t.r, t.t + i]);
	}
	let d = o(si.turns - 1), f = [d.r, d.t + i / 2];
	return {
		loopIn: [...l, f],
		loopOut: [f, ...u.reverse()],
		feedX: s,
		exitX: c
	};
}
function li(e, t, n) {
	let { width: r, height: i } = N.emitter, a = n - i, o = {
		kind: e,
		x: t,
		y: a,
		width: r,
		height: i
	};
	if (e === "underfloor") {
		let { loopIn: e, loopOut: r, feedX: i, exitX: s } = ci(t, a);
		return {
			...o,
			feedX: i,
			exitX: s,
			inlet: [i, n],
			outlet: [s, n],
			loopIn: e,
			loopOut: r,
			pitch: si.pitch,
			columns: []
		};
	}
	let s = t + 34, c = t + r - 34, l = P.count * P.width + (P.count - 1) * P.gap, u = t + (r - l) / 2, d = Array.from({ length: P.count }, (e, t) => ({
		x: u + t * (P.width + P.gap),
		y: a + P.top,
		width: P.width,
		height: P.bottom - P.top
	}));
	return {
		...o,
		feedX: s,
		exitX: c,
		inlet: [u, a + P.inletY],
		outlet: [u + l, a + P.outletY],
		loopIn: [],
		loopOut: [],
		pitch: 0,
		columns: d
	};
}
var ui = (e) => ({
	feed: e.passes.x0,
	exit: e.passes.x0 + (e.passes.count - 1) * e.passes.step
}), di = (e) => e.coil.y + e.coil.height;
function fi({ externalTank: e }) {
	if (e === void 0) return "";
	let { x: t, y: n, width: r, height: i, dome: a } = e, o = r / 2, s = N.radius, c = n + i;
	return `M${String(t)} ${String(n + a)} A${String(o)} ${String(a)} 0 0 1 ${String(t + r)} ${String(n + a)} V${String(c - s)} A${String(s)} ${String(s)} 0 0 1 ${String(t + r - s)} ${String(c)} H${String(t + s)} A${String(s)} ${String(s)} 0 0 1 ${String(t)} ${String(c - s)} Z`;
}
var pi = [[-75, -13], [-75, 13]], F = {
	x: 0,
	y: 0,
	width: 720,
	height: 520
}, I = {
	viewBox: {
		width: 720,
		height: 520
	},
	cabinet: F,
	internalTank: {
		x: 358,
		y: 8,
		width: 174,
		height: 66
	},
	coil51: {
		x: 439,
		y: 55
	},
	headShift: 0
}, mi = [
	{
		id: "above-probes",
		axis: "row",
		from: 76,
		to: 100,
		holds: "nothing in either layout: the room between the hot-water lines of row A and the probe row (the horizontal layout narrows it, the vertical layout leaves it as it is)"
	},
	{
		id: "under-compressor-row",
		axis: "row",
		from: 156,
		to: 228,
		holds: "the discharge and suction blocks (temperature over pressure, two rows) under their pairs 30/36 and 29/35, the compressor speed in a third row under 11, in both layouts (the vertical layout heightens the lane for the three rows)"
	},
	{
		id: "under-valve-row",
		axis: "row",
		from: 408,
		to: 444,
		holds: "the expansion valve opening alone, centred under valve 12 (one row, in both layouts)"
	}
], hi = [
	{
		id: "left-edge",
		axis: "column",
		from: 0,
		to: 40,
		holds: "the production outlet value, left of probe 33 (thermostat 45 stands in probe 33's column, lower down)"
	},
	{
		id: "riser-1",
		axis: "column",
		from: 77,
		to: 117,
		holds: "the production return value and pressure, between valve 26 / riser 1 and probes 34 and 38 (right-aligned to their bodies)"
	},
	{
		id: "trunk",
		axis: "column",
		from: 142,
		to: 160,
		holds: "nothing: the gap between the trunk and the heat-recovery column"
	},
	{
		id: "before-exchanger-8",
		axis: "column",
		from: 229,
		to: 269,
		holds: "the value of pump 15, right of the pump, between the heat-recovery column and exchanger 8 / tank 50"
	},
	{
		id: "riser-3",
		axis: "column",
		from: 542,
		to: 572,
		holds: "the brine outlet value right of riser 3, the brine pressure left of transducer 37 and the value of pump 16"
	},
	{
		id: "riser-4",
		axis: "column",
		from: 609,
		to: 667,
		holds: "the brine inlet value, right of riser 4 and pump 16"
	}
], L = (e, t, n, r, i, a = {}) => ({
	item: e,
	kind: t,
	x: n,
	y: r,
	rotation: i,
	...a
}), gi = F.width / 2, R = {
	body1: 49,
	riser1: 65,
	body2: 126,
	riser2: 142,
	htr: 172,
	htrRiser: 193,
	valve27: 182,
	hx9: 205,
	pump15: 217,
	hx8: 289,
	valve14: 287,
	probe30: 287,
	transducer36: 309,
	compressor: gi,
	probe29: 410,
	transducer35: 432,
	valve12: 412,
	hx10: gi,
	hx7: 457,
	suction: 495,
	valve28: 522,
	probe31: 526,
	riser3: 542,
	body4: 581,
	riser4: 597,
	port5: 667,
	port6: 707,
	tap47: 392,
	tap48: 445,
	tap49: 498
}, z = {
	dhwSup: 42,
	dhwRet: 68,
	probe: 112,
	pair: 126,
	trans: 142,
	hx9Top: 237,
	hx9: 260,
	hx9Bottom: 283,
	valve14: 283,
	pump16: 298,
	resistor: 300,
	thermostat: 254,
	hxTop: 328,
	hx: 362,
	line: 396,
	hx10Top: 453,
	hx10: 475,
	hx10Bottom: 497
}, _i = I.coil51.x - 75, vi = (e) => [
	L(1, "port", R.riser1, 0, 0),
	L(2, "port", R.riser2, 0, 0),
	L(3, "port", R.riser3, 0, 0),
	L(4, "port", R.riser4, 0, 0),
	L(5, "port", R.port5, 0, 0, { dhw: "external" }),
	L(6, "port", R.port6, 0, 0, { dhw: "external" }),
	L(47, "port", R.tap47, 0, 0, { dhw: "internal" }),
	L(48, "port", R.tap48, 0, 0, { dhw: "internal" }),
	L(49, "port", R.tap49, 0, 0, { dhw: "internal" }),
	L(7, "exchanger", R.hx7, z.hx, 0, {
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
	L(8, "exchanger", R.hx8, z.hx, 0, {
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
	L(9, "exchanger", R.hx9, z.hx9, 0, {
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
	L(11, "compressor", R.compressor, z.trans, 0),
	L(12, "expansion_valve", R.valve12, z.line, 0),
	L(13, "filter_dryer", R.compressor, z.line, 0),
	L(14, "inversion_valve", R.valve14, z.valve14, 0, { feature: "active_cooling" }),
	L(29, "probe_t", R.probe29, z.pair, 0),
	L(30, "probe_t", R.probe30, z.pair, 0),
	L(35, "transducer_p", R.transducer35, z.pair, 0),
	L(36, "transducer_p", R.transducer36, z.pair, 0),
	L(10, "exchanger", R.hx10, z.hx10, 0, {
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
	L(15, "pump", R.pump15, z.line, 0),
	L(16, "pump", R.riser4, z.pump16, 90),
	L(17, "pump", R.htr, z.probe, 90, {
		feature: "htr",
		dhw: "any"
	}),
	L(22, "valve", R.htr, z.trans, 0, {
		feature: "htr",
		dhw: "any"
	}),
	L(26, "valve3", R.riser1, z.dhwSup, 270, {
		dhw: "any",
		unusedMuted: !0
	}),
	L(27, "valve3", R.valve27, z.line, 0, { feature: "passive_cooling" }),
	L(28, "valve3", R.valve28, z.line, 0, { feature: "passive_cooling" }),
	L(31, "probe_t", R.probe31, z.probe, 270),
	L(32, "probe_t", R.body4, z.probe, 270),
	L(33, "probe_t", R.body1, z.probe, 270),
	L(34, "probe_t", R.body2, z.probe, 270),
	L(37, "transducer_p", R.body4, z.trans, 270),
	L(38, "transducer_p", R.body2, z.trans, 270),
	L(44, "resistor", R.riser1, z.resistor, 90, { feature: "backup_heater" }),
	L(45, "thermostat", R.body1, z.thermostat, 270, { feature: "backup_heater" }),
	L(50, "tank", e.internalTank.x + e.internalTank.width / 2, e.internalTank.y + e.internalTank.height / 2, 0, { dhw: "internal" }),
	L(51, "coil", e.coil51.x, e.coil51.y, 0, { dhw: "internal" }),
	L(54, "probe_t", I.internalTank.x + I.internalTank.width - 16, 41, 270, { dhw: "internal" })
], yi = (e) => e.split(" ").map((e) => {
	let [t, n] = e.split(",").map(Number);
	return [t ?? 0, n ?? 0];
}), B = (...e) => e.map(([e, t]) => `${String(e)},${String(t)}`).join(" "), V = (e, t, n, r, i = {}) => ({
	id: e,
	circuit: t,
	points: yi(n),
	temperatureRole: r,
	direction: 1,
	...i
}), H = ["production_dg1"], bi = ["production_dg1", "production_dhw"], U = "production.outlet_temperature", W = "production.return_temperature", G = "production.pump", K = "brine.inlet_temperature", q = "brine.outlet_temperature", J = "brine.pump", xi = "compressor.discharge_temperature", Si = "compressor.suction_temperature", Ci = "refrigerant.condensation_temperature", wi = "refrigerant.evaporation_temperature", Y = "compressor.percentage", Ti = "dhw.temperature", Ei = "source.air_unit_outlet_temperature", Di = [
	"dhw_sup_b",
	"dhw_sup_c",
	"dhw_ret_b",
	"dhw_ret_c",
	"dhw_ext_in",
	"dhw_ext_coil",
	"dhw_ext_out"
], Oi = () => {
	let { riser1: e, riser2: t, riser3: n, riser4: r } = R, { dhwSup: i, dhwRet: a, line: o } = z, s = R.hx8 - 12, c = R.hx8 + 12, l = R.hx7 - 12, u = R.hx7 + 12, d = R.hx9 - 12, f = R.hx9 + 12, p = R.hx10 - 12, m = R.hx10 + 12, h = R.compressor - 14, g = R.compressor + 14, _ = R.valve14 - 14, ee = R.valve14 + 14, v = (...e) => B(...e);
	return [
		V("p1_up", H, v([e, i - 12], [e, 0]), U, {
			dhw: "any",
			speedRole: G
		}),
		V("p1_direct", H, v([e, i + 12], [e, 0]), U, {
			dhw: "none",
			speedRole: G
		}),
		V("p2_in", H, v([t, 0], [t, a]), W, { speedRole: G }),
		V("prod_44_26", bi, v([e, z.resistor - 28], [e, i + 12]), U, { speedRole: G }),
		V("prod_bypass44", bi, v([e, z.hxTop], [e, z.resistor - 28]), U, {
			bypass: "backup_heater",
			speedRole: G
		}),
		V("prod_8_44", bi, v([s, z.hxTop], [e, z.hxTop]), U, { speedRole: G }),
		V("prod_15_8", bi, v([R.pump15 + 12, o], [s, o]), W, { speedRole: G }),
		V("trunk", bi, v([t, a], [t, o]), W, { speedRole: G }),
		V("prod_27_in", bi, v([t, o], [R.valve27 - 12, o]), W, {
			through: "passive_cooling",
			speedRole: G,
			onlyWhen: { valves2728: "closed" }
		}),
		V("prod_27_15", bi, v([R.valve27 + 12, o], [R.pump15 - 12, o]), W, {
			through: "passive_cooling",
			speedRole: G
		}),
		V("prod_bypass27", bi, v([t, o], [R.pump15 - 12, o]), W, {
			bypass: "passive_cooling",
			speedRole: G
		}),
		V("prod_10_in", ["exchanger_10"], v([t, o], [t, z.hx10Bottom], [p, z.hx10Bottom]), W, {
			feature: "passive_cooling",
			speedRole: G
		}),
		V("prod_10_out", ["exchanger_10"], v([p, z.hx10Top], [R.valve27, z.hx10Top], [R.valve27, o + 12]), U, {
			feature: "passive_cooling",
			speedRole: G
		}),
		V("dhw_sup_a", ["production_dhw"], v([e + 12, i], [R.htrRiser, i]), U, {
			dhw: "any",
			speedRole: G
		}),
		V("dhw_sup_b", ["dhw_coil"], v([R.htrRiser, i], [_i, i]), U, {
			dhw: "any",
			speedRole: G
		}),
		V("dhw_sup_c", ["dhw_coil"], v([_i, i], [R.port5, i], [R.port5, 0]), U, {
			dhw: "external",
			speedRole: G
		}),
		V("dhw_ret_c", ["dhw_coil"], v([R.port6, 0], [R.port6, a], [_i, a]), W, {
			dhw: "external",
			speedRole: G
		}),
		V("dhw_ret_b", ["dhw_coil"], v([_i, a], [R.htr, a]), W, {
			dhw: "any",
			speedRole: G
		}),
		V("dhw_ret_a", ["production_dhw"], v([R.htr, a], [t, a]), W, {
			dhw: "any",
			speedRole: G
		}),
		V("htr_in", ["htr"], v([R.htr, a], [R.htr, z.probe - 12]), Ti, {
			feature: "htr",
			dhw: "any"
		}),
		V("htr_pump", ["htr"], v([R.htr, z.probe + 12], [R.htr, z.trans - 9]), Ti, {
			feature: "htr",
			dhw: "any"
		}),
		V("htr_to_9", ["htr"], v([R.htr, z.trans + 9], [R.htr, z.hx9Bottom], [d, z.hx9Bottom]), Ti, {
			feature: "htr",
			dhw: "any"
		}),
		V("htr_riser", ["htr"], v([d, z.hx9Top], [d, i]), Ti, {
			feature: "htr",
			dhw: "any"
		}),
		V("tap_47", ["dhw_coil"], v([R.tap47, -12], [R.tap47, I.internalTank.y]), Ti, {
			dhw: "internal",
			stub: !0
		}),
		V("tap_48", ["dhw_coil"], v([R.tap48, I.internalTank.y], [R.tap48, -12]), Ti, {
			dhw: "internal",
			stub: !0
		}),
		V("tap_49", ["dhw_coil"], v([R.tap49, -12], [R.tap49, I.internalTank.y]), Ti, {
			dhw: "internal",
			stub: !0
		}),
		V("ref_discharge", ["refrigerant"], v([h, z.trans], [f, z.trans], [f, z.hx9Top]), xi, {
			through: "htr",
			speedRole: Y
		}),
		V("ref_9_14", ["refrigerant"], v([f, z.hx9Bottom], [_, z.valve14]), xi, {
			through: "htr",
			speedRole: Y
		}),
		V("ref_discharge_direct", ["refrigerant"], v([h, z.trans], [_, z.trans], [_, z.valve14]), xi, {
			bypass: "htr",
			speedRole: Y
		}),
		V("ref_14_8", ["refrigerant"], v([ee, z.valve14 + 10], [c, z.hxTop]), xi, {
			through: "active_cooling",
			reversible: !0,
			speedRole: Y
		}),
		V("ref_7_14", ["refrigerant"], v([l, z.hxTop], [l, z.valve14], [ee, z.valve14]), Si, {
			through: "active_cooling",
			reversible: !0,
			speedRole: Y
		}),
		V("ref_suction", ["refrigerant"], v([ee, z.valve14 - 10], [R.suction, z.valve14 - 10], [R.suction, z.trans], [g, z.trans]), Si, {
			through: "active_cooling",
			speedRole: Y
		}),
		V("ref_direct_8", ["refrigerant"], v([_, z.valve14], [ee, z.valve14], [c, z.hxTop]), xi, {
			bypass: "active_cooling",
			speedRole: Y
		}),
		V("ref_direct_suction", ["refrigerant"], v([l, z.hxTop], [l, z.valve14 - 10], [R.suction, z.valve14 - 10], [R.suction, z.trans], [g, z.trans]), Si, {
			bypass: "active_cooling",
			speedRole: Y
		}),
		V("ref_8_13", ["refrigerant"], v([c, o], [R.compressor - 14, o]), Ci, {
			reversible: !0,
			speedRole: Y
		}),
		V("ref_13_12", ["refrigerant"], v([R.compressor + 14, o], [R.valve12 - 12, o]), Ci, {
			reversible: !0,
			speedRole: Y
		}),
		V("ref_12_7", ["refrigerant"], v([R.valve12 + 12, o], [l, o]), wi, {
			reversible: !0,
			speedRole: Y
		}),
		V("ln4_a", ["brine"], v([r, 0], [r, z.pump16 - 12]), K, { speedRole: J }),
		V("ln4_b", ["brine"], v([r, z.pump16 + 12], [r, z.hxTop]), K, { speedRole: J }),
		V("br_feed7", ["brine"], v([r, z.hxTop], [u, z.hxTop]), K, {
			speedRole: J,
			onlyWhen: { valves2728: "closed" }
		}),
		V("brine_7_28", ["brine"], v([u, o], [R.valve28 - 12, o]), q, {
			through: "passive_cooling",
			speedRole: J,
			onlyWhen: { valves2728: "closed" }
		}),
		V("brine_28_ln3", ["brine"], v([R.valve28 + 12, o], [n, o]), q, {
			through: "passive_cooling",
			speedRole: J
		}),
		V("brine_bypass28", ["brine"], v([u, o], [n, o]), q, {
			bypass: "passive_cooling",
			speedRole: J
		}),
		V("ln3", ["brine"], v([n, o], [n, 0]), q, { speedRole: J }),
		V("br_10_in", ["exchanger_10"], v([r, z.hxTop], [r, z.hx10Top], [m, z.hx10Top]), K, {
			feature: "passive_cooling",
			speedRole: J
		}),
		V("br_10_28", ["exchanger_10"], v([m, z.hx10Bottom], [R.valve28, z.hx10Bottom], [R.valve28, o + 12]), q, {
			feature: "passive_cooling",
			speedRole: J
		})
	];
}, ki = [
	{
		over: "dhw_sup_a",
		under: "p2_in",
		at: [R.riser2, z.dhwSup]
	},
	{
		over: "dhw_sup_c",
		under: "ln3",
		at: [R.riser3, z.dhwSup]
	},
	{
		over: "dhw_sup_c",
		under: "ln4_a",
		at: [R.riser4, z.dhwSup]
	},
	{
		over: "dhw_ret_c",
		under: "ln3",
		at: [R.riser3, z.dhwRet]
	},
	{
		over: "dhw_ret_c",
		under: "ln4_a",
		at: [R.riser4, z.dhwRet]
	},
	{
		over: "dhw_ret_b",
		under: "htr_riser",
		at: [R.hx9 - 12, z.dhwRet]
	},
	{
		over: "trunk",
		under: "prod_8_44",
		at: [R.riser2, z.hxTop]
	},
	{
		over: "ln3",
		under: "br_feed7",
		at: [R.riser3, z.hxTop]
	},
	{
		over: "br_10_in",
		under: "br_10_28",
		at: [R.valve28, z.hx10Top]
	}
];
function Ai(e) {
	let { x0: t, step: n, count: r, top: i, bottom: a } = e.passes, o = di(e), s = [[t, o]];
	for (let e = 0; e < r; e += 1) {
		let c = t + e * n, l = e === r - 1;
		e % 2 == 0 ? (s.push([c, i]), l || s.push([c + n, i])) : (s.push(l ? [c, o] : [c, a]), l || s.push([c + n, a]));
	}
	return s;
}
function ji(e) {
	let { feedX: t, returnX: n, headerY: r, bendY: i } = e, [a, o, s, c] = e.legs, l = e.y + e.height, u = (o + s) / 2;
	return {
		down: [
			[t, l],
			[t, r],
			[a, r],
			[a, i],
			[o, i],
			[o, r],
			[u, r]
		],
		up: [
			[u, r],
			[s, r],
			[s, i],
			[c, i],
			[c, r],
			[n, r],
			[n, l]
		],
		bend: ri / 2
	};
}
var Mi = (...e) => e.filter((t, n) => n === 0 || !Oa(t, e[n - 1] ?? t));
function Ni(e, t) {
	let n = Pi(e.key), r = [
		0,
		1,
		2
	], i = n.reduce((e) => e.flatMap((e) => r.map((t) => [...e, t])), [[]]).map((e) => ({
		chosen: e,
		lifted: e.reduce((e, t, r) => e + (t > 0 ? n[r] === "tank" ? 2 : 1 : 0), 0),
		top: Math.max(...e),
		cost: e.reduce((e, t, r) => e + t * (Yi[n[r] ?? ""] ?? 0), 0)
	})).sort((e, t) => e.lifted - t.lifted || e.top - t.top || e.cost - t.cost), a = (r) => Fi(e, t, Object.fromEntries(n.map((e, t) => [e, r[t] ?? 0])));
	for (let { chosen: t } of i) {
		let n = a(t);
		if (Zi({
			segments: n,
			band: e.band
		}).conflicts.length === 0) return n;
	}
	return a(n.map(() => 0));
}
var Pi = (e) => Ji.filter((t) => (t === "tank" ? e.tank : t === "dg1_sup" || t === "dg1_ret" ? e.emitter !== "none" : !0) && (t !== "src_hyb_link" || e.source === "hybrid"));
function Fi(e, t, n) {
	let { ports: r, cabinet: i, key: a } = e, o = i.y, s = e.externalCoil, c = qi(o, t), l = [
		c.jog,
		c.second,
		c.third
	], u = (e) => l[n[e] ?? 0] ?? c.jog, d = u("tank"), f = [], { emitter: p } = e;
	if (p === void 0) f.push(V("p1_stub", H, B([r[1], o], [r[1], o - oi]), U, { stub: !0 }), V("p2_stub", H, B([r[2], o - oi], [r[2], o]), W, { stub: !0 }));
	else {
		let e = p.y + p.height;
		f.push(V("dg1_sup", H, B(...Mi([r[1], o], [r[1], u("dg1_sup")], [p.feedX, u("dg1_sup")], [p.feedX, e], [p.feedX, p.inlet[1]], p.inlet)), U, { speedRole: G }), ...p.kind === "underfloor" ? [V("dg1_loop_in", H, B(...p.loopIn), U, {
			speedRole: G,
			bend: p.pitch / 2
		}), V("dg1_loop_out", H, B(...p.loopOut), W, {
			speedRole: G,
			bend: p.pitch / 2
		})] : [], V("dg1_ret", H, B(...Mi(p.outlet, [p.exitX, p.outlet[1]], [p.exitX, e], [p.exitX, u("dg1_ret")], [r[2], u("dg1_ret")], [r[2], o])), W, { speedRole: G }));
	}
	if (a.tank && s !== void 0) {
		let e = {
			kind: "helix",
			cx: s.cx,
			top: s.top,
			bottom: s.bottom,
			rx: s.rx,
			turns: 4.5,
			fromLeft: !0,
			startX: s.inX
		}, { start: t, end: n } = Ta(e);
		f.push(V("dhw_ext_in", ["dhw_coil"], B(...Mi([r[5], o], [r[5], d], [s.inX, d], t)), U, {
			dhw: "external",
			speedRole: G
		}), V("dhw_ext_coil", ["dhw_coil"], B(t, n), U, {
			dhw: "external",
			speedRole: G,
			shape: e
		}), V("dhw_ext_out", ["dhw_coil"], B(...Mi(n, [n[0], d], [r[6], d], [r[6], o])), W, {
			dhw: "external",
			speedRole: G
		}));
	}
	f.push(V("src_out", ["brine"], B([r[3], o], [r[3], u("src_out")]), q, { speedRole: J }), V("src_in", ["brine"], B([r[4], u("src_in")], [r[4], o]), K, { speedRole: J }));
	let { airUnit: m, collector: h } = e, g = (e, t) => B(...Mi([r[3], u("src_out")], [e, u("src_out")], [e, t])), _ = (e, t) => B(...Mi([e, t], [e, u("src_in")], [r[4], u("src_in")]));
	if (a.source === "air" && m !== void 0) {
		let { feed: e, exit: t } = ui(m);
		f.push(V("src_air_feed", ["brine"], g(e, di(m)), q, {
			source: ["air"],
			speedRole: J
		}), V("src_air_coil", ["brine"], B(...Ai(m)), q, {
			source: ["air"],
			speedRole: J,
			bend: m.passes.step / 2
		}), V("src_air_exit", ["brine"], _(t, di(m)), Ei, {
			source: ["air"],
			speedRole: J
		}));
	}
	if (a.source === "ground" && h !== void 0) {
		let { down: e, up: t, bend: n } = ji(h);
		f.push(V("src_gnd_feed", ["brine"], g(h.feedX, h.y + h.height), q, {
			source: ["ground"],
			speedRole: J
		}), V("src_gnd_down", ["brine"], B(...e), q, {
			source: ["ground"],
			speedRole: J,
			roundEnd: !0,
			bend: n
		}), V("src_gnd_up", ["brine"], B(...t), K, {
			source: ["ground"],
			speedRole: J,
			bend: n
		}), V("src_gnd_exit", ["brine"], _(h.returnX, h.y + h.height), K, {
			source: ["ground"],
			speedRole: J
		}));
	}
	if (a.source === "hybrid" && m !== void 0 && h !== void 0) {
		let { feed: e, exit: t } = ui(m), { down: n, up: r, bend: i } = ji(h);
		f.push(V("src_hyb_feed", ["brine"], g(e, di(m)), q, {
			source: ["hybrid"],
			speedRole: J
		}), V("src_hyb_coil", ["brine"], B(...Ai(m)), q, {
			source: ["hybrid"],
			speedRole: J,
			bend: m.passes.step / 2
		}), V("src_hyb_link", ["brine"], B([t, di(m)], [t, u("src_hyb_link")], [h.feedX, u("src_hyb_link")], [h.feedX, h.y + h.height]), Ei, {
			source: ["hybrid"],
			speedRole: J
		}), V("src_hyb_down", ["brine"], B(...n), Ei, {
			source: ["hybrid"],
			speedRole: J,
			roundEnd: !0,
			bend: i
		}), V("src_hyb_up", ["brine"], B(...r), K, {
			source: ["hybrid"],
			speedRole: J,
			bend: i
		}), V("src_hyb_exit", ["brine"], _(h.returnX, h.y + h.height), K, {
			source: ["hybrid"],
			speedRole: J
		}));
	}
	return f;
}
function Ii(e, t) {
	let n = e[0], r = e[e.length - 1];
	if (n === void 0 || r === void 0) return t;
	if (t <= n[0]) return $r(t + n[1] - n[0]);
	if (t >= r[0]) return $r(t + r[1] - r[0]);
	let i = e.findIndex(([e]) => e > t), [a, o] = e[i - 1] ?? n, [s, c] = e[i] ?? r;
	return $r(o + (t - a) / (s - a) * (c - o));
}
function Li(e, t, n, r) {
	let i = [], a = (e, t) => {
		i[i.length - 1]?.[0] === e && i.pop(), i.push([e, t]);
	}, o = 0;
	a(0, n);
	for (let r of e) {
		let e = t[r.id] ?? 0;
		e !== 0 && (a(r.from, n + r.from + o), o += e, a(r.to, n + r.to + o));
	}
	return a(r, n + r + o), i;
}
var Ri = Li(hi, {
	"left-edge": 62,
	"riser-1": 46,
	"before-exchanger-8": 22,
	"riser-3": 84,
	"riser-4": 46
}, 10, F.width), zi = Li(mi, { "above-probes": -18 }, N.top + N.height + N.joinLane, F.height), Bi = Li(hi, {}, 10, F.width), Vi = { "under-compressor-row": 24 }, Hi = Li(mi, Vi, N.top + N.height + N.joinLane, F.height), Ui = {
	from: 10,
	to: 24,
	extra: 28
}, Wi = Li([{
	id: "tank-head",
	axis: "row",
	from: Ui.from,
	to: Ui.to,
	holds: "tank 50 head"
}, ...mi], {
	...Vi,
	"tank-head": Ui.extra
}, N.top + N.height + N.joinLane, F.height), Gi = {
	horizontal: {
		x: Ri,
		y: zi
	},
	vertical: {
		x: Bi,
		y: Hi
	}
}, Ki = (e, t = !1) => {
	let n = Gi[e], r = e === "vertical" && t ? Wi : n.y;
	return {
		mapX: (e) => Ii(n.x, e),
		mapY: (e) => Ii(r, e)
	};
}, qi = (e, t = "horizontal") => {
	let n = Xr[t];
	return {
		jog: e - n.jog,
		second: e - n.second,
		third: e - n.third
	};
}, Ji = [
	"dg1_sup",
	"dg1_ret",
	"src_out",
	"src_in",
	"src_hyb_link",
	"tank"
], Yi = {
	dg1_sup: 16,
	dg1_ret: 16,
	src_out: 8,
	src_in: 4,
	src_hyb_link: 2,
	tank: 1
}, Xi = {
	dg1_sup: "dg1_sup",
	dg1_ret: "dg1_ret",
	dhw_ext_in: "dhw_ext_in",
	dhw_ext_out: "dhw_ext_out",
	src_out: "src_out",
	src_air_feed: "src_out",
	src_gnd_feed: "src_out",
	src_hyb_feed: "src_out",
	src_in: "src_in",
	src_air_exit: "src_in",
	src_gnd_exit: "src_in",
	src_hyb_exit: "src_in",
	src_hyb_link: "src_hyb_link"
};
function Zi(e) {
	let t = [], n = [];
	for (let r of e.segments) {
		let i = Xi[r.id];
		i !== void 0 && r.points.forEach((a, o) => {
			let s = r.points[o + 1];
			s !== void 0 && (a[1] === s[1] && a[0] !== s[0] && a[1] > e.band.bottom ? t.push({
				pipe: i,
				level: a[1],
				x0: Math.min(a[0], s[0]),
				x1: Math.max(a[0], s[0])
			}) : a[0] === s[0] && n.push({
				pipe: i,
				x: a[0],
				y0: Math.min(a[1], s[1]),
				y1: Math.max(a[1], s[1])
			}));
		});
	}
	let r = [];
	return t.forEach((e, i) => {
		for (let n of t.slice(i + 1)) n.level === e.level && n.pipe !== e.pipe && n.x0 <= e.x1 && e.x0 <= n.x1 && r.push({
			pipes: [e.pipe, n.pipe],
			x: Math.max(e.x0, n.x0),
			level: e.level
		});
		for (let t of n) t.pipe !== e.pipe && t.x >= e.x0 && t.x <= e.x1 && t.y0 <= e.level && e.level <= t.y1 && r.push({
			pipes: [t.pipe, e.pipe],
			x: t.x,
			level: e.level
		});
	}), {
		spans: t,
		conflicts: r
	};
}
var Qi = "underfloor", $i = (e) => ({
	source: e.source,
	tank: pa(e) === "external",
	emitter: e.emitter ?? Qi,
	internal: pa(e) === "internal"
}), ea = {
	source: "hybrid",
	tank: !0,
	emitter: Qi
}, ta = (() => {
	let e = (e, t) => {
		let { mapX: n, mapY: r } = Ki(e, t), i = {
			x: n(F.x),
			y: r(F.y),
			width: n(F.x + F.width) - n(F.x),
			height: r(F.y + F.height) - r(F.y)
		}, a = I.internalTank;
		return {
			viewBox: {
				width: i.x + i.width + 10,
				height: i.y + i.height + 15
			},
			cabinet: i,
			internalTank: {
				x: n(a.x),
				y: r(a.y),
				width: $r(n(a.x + a.width) - n(a.x)),
				height: $r(r(a.y + a.height) - r(a.y))
			},
			coil51: {
				x: n(I.coil51.x - 75) + 75,
				y: r(I.coil51.y)
			},
			headShift: $r(r(F.height) - Ii(Gi[e].y, F.height))
		};
	};
	return {
		horizontal: e("horizontal", !1),
		vertical: e("vertical", !1),
		"vertical|internal": e("vertical", !0),
		"horizontal|internal": e("horizontal", !0)
	};
})(), na = (e, t) => {
	let n = ta[t.internal === !0 ? `${e}|internal` : e];
	if (n === void 0) throw Error("no cabinet zones");
	return n;
};
function ra(e) {
	return {
		1: e(R.riser1),
		2: e(R.riser2),
		3: e(R.riser3),
		4: e(R.riser4),
		5: e(R.port5),
		6: e(R.port6)
	};
}
function ia(e, t, n) {
	let r = t === "ground" || e === void 0 ? void 0 : ni(e.x0, n), i = e === void 0 ? 0 : t === "hybrid" ? e.x0 + N.air.width + N.hybridGap : e.x0;
	return {
		air: r,
		collector: t === "air" || e === void 0 ? void 0 : ai(i, n)
	};
}
function aa(e, t) {
	if (e === void 0) return {
		tankShape: void 0,
		coil: void 0
	};
	let n = {
		x: e.x0,
		y: t - N.tank.height,
		width: N.tank.width,
		height: N.tank.height,
		dome: N.tank.dome
	};
	return {
		tankShape: n,
		coil: {
			cx: n.x + n.width / 2,
			top: n.y + 94,
			bottom: n.y + 152,
			rx: 38,
			inX: n.x + n.width / 2 - 38 - 12
		}
	};
}
function oa(e, t, n) {
	let { mapX: r } = Ki(e, t.internal === !0), i = n.cabinet.y - N.joinLane, a = ra(r), o = Qr([
		{
			name: "emitter",
			centre: (a[1] + a[2]) / 2,
			width: t.emitter === "none" ? 0 : N.emitter.width
		},
		{
			name: "source",
			centre: (a[3] + a[4]) / 2,
			width: Zr(t.source)
		},
		{
			name: "tank",
			centre: (a[5] + a[6]) / 2,
			width: t.tank ? N.tank.width : 0
		}
	], {
		min: n.cabinet.x,
		max: n.cabinet.x + n.cabinet.width
	}, N.gap), s = o.emitter, c = t.emitter === "none" || s === void 0 ? void 0 : li(t.emitter, s.x0, i), { air: l, collector: u } = ia(o.source, t.source, i), { tankShape: d, coil: f } = aa(o.tank, i);
	return {
		key: t,
		band: {
			top: i - N.height,
			bottom: i
		},
		ports: a,
		slots: o,
		...c === void 0 ? {} : { emitter: c },
		...l === void 0 ? {} : { airUnit: l },
		...u === void 0 ? {} : { collector: u },
		...d === void 0 ? {} : { externalTank: d },
		...f === void 0 ? {} : { externalCoil: f }
	};
}
var sa = /* @__PURE__ */ new Map(), ca = {
	horizontal: Vr,
	vertical: Hr
};
function la(e, t, n = ca[e]) {
	let { mapX: r, mapY: i } = Ki(e, t.internal === !0), a = {
		...na(e, t),
		...oa(e, t, na(e, t))
	}, o = (e, t) => [r(e), i(t)], s = vi(a).map((e) => e.item === 50 || e.item === 51 ? e : {
		...e,
		x: r(e.x),
		y: i(e.y)
	}), c = [...Oi().map((e) => ({
		...e,
		points: e.points.map(([e, t]) => [r(e), i(t)])
	})), ...Ni(a, e)], l = ki.map((e) => ({
		...e,
		at: o(e.at[0], e.at[1])
	})), u = Jr(a, o, e);
	return {
		...a,
		id: e,
		components: s,
		segments: c,
		crossings: l,
		labels: { specs: u.specs.map((e) => {
			let t = n[e.id]?.at(a, o);
			return t === void 0 ? e : {
				...e,
				...t
			};
		}) }
	};
}
vi(I), Oi(), Jr(I);
function ua(e, t = ea) {
	let n = `${e}|${t.source}|${String(t.tank)}|${t.emitter}|${String(t.internal === !0)}`, r = sa.get(n);
	if (r !== void 0) return r;
	let i = la(e, t);
	return sa.set(n, i), i;
}
var da = (e, t = "horizontal") => e.arrangement ?? (e.model === void 0 || e.dhw === void 0 || e.source === void 0 ? ua(t) : ua(t, $i({
	model: e.model,
	dhw: e.dhw,
	source: e.source,
	emitter: e.emitter
}))), fa = (e, t) => t === "htr" && e.dhw === "none" ? !1 : e.features[t], pa = (e) => e.dhw === "unused" ? e.model === "C" ? "internal" : "external" : e.dhw, ma = (e, t) => {
	let n = pa(t);
	return e === "any" ? n !== "none" : e === n;
};
function ha(e, t) {
	return e.source !== void 0 && !e.source.includes(t.source) || e.dhw !== void 0 && !ma(e.dhw, t) || e.bypass !== void 0 && fa(t, e.bypass) !== !1 || e.through !== void 0 && fa(t, e.through) === !1;
}
function ga(e, t) {
	if (e.feature === void 0) return;
	let n = fa(t, e.feature);
	return n === !1 ? "hidden" : n === "unused" ? "muted" : void 0;
}
function _a(e, t) {
	if (ha(e, t)) return "hidden";
	let n = ga(e, t);
	return n === void 0 ? t.dhw === "unused" && e.dhw !== void 0 && (e.dhw !== "any" || e.unusedMuted === !0) ? "muted" : "normal" : n;
}
function va(e, t) {
	return e.flatMap((e) => {
		let n = _a(e, t);
		return n === "hidden" ? [] : [{
			part: e,
			state: n
		}];
	});
}
var ya = (e) => va(da(e).components, e), ba = (e) => va(da(e).segments, e), xa = (e, t) => (e.onlyWhen === void 0 || e.onlyWhen.valves2728 === t.valves2728) && e.circuit.some((e) => t.active.has(e)), Sa = .35;
function Ca(e) {
	let t = Math.max(1, Math.round(e.turns * 2)), n = e.fromLeft === !0, r = n ? 3 * (e.bottom - e.top) / (3 * t + 2) : (e.bottom - e.top) / t, i = 4 / 3 * Math.max(3, r);
	return Array.from({ length: t }, (a, o) => {
		let s = n ? o % 2 == 1 : o % 2 == 0, c = e.cx + e.rx, l = e.cx - e.rx, [u, d] = s ? [c, l] : [o === 0 && n ? e.startX ?? l : l, c], f = e.top + (n ? 2 * r / 3 : 0) + o * r, p = f + r, m = s ? i : -i, h = o === t - 1 && !n;
		return {
			front: s,
			curve: [
				[u, f],
				[u, f + m],
				h ? [d + (u - d) * .3, p] : [d, p + m],
				[d, p]
			]
		};
	});
}
var wa = (e) => [...e.filter((e) => !e.front), ...e.filter((e) => e.front)];
function Ta(e) {
	let t = Ca(e), n = t[0], r = t[t.length - 1];
	if (n === void 0 || r === void 0) throw Error("helix without halves");
	return {
		start: n.curve[0],
		end: r.curve[3]
	};
}
function Ea(e) {
	let t = (e) => String(Math.round(e * 100) / 100);
	return Ca(e).map(({ front: e, curve: [n, r, i, a] }) => ({
		front: e,
		d: `M${t(n[0])} ${t(n[1])} C${t(r[0])} ${t(r[1])} ${t(i[0])} ${t(i[1])} ${t(a[0])} ${t(a[1])}`
	}));
}
function Da(e, t) {
	let n = ka(e, 0), r = [`M${String(n[0])} ${String(n[1])}`];
	for (let n = 1; n < e.length; n += 1) {
		let [i, a, o] = [
			ka(e, n - 1),
			ka(e, n),
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
var Oa = (e, t) => e[0] === t[0] && e[1] === t[1];
function ka(e, t) {
	let n = e[t];
	if (n === void 0) throw Error(`No point ${String(t)}`);
	return n;
}
var Aa = (e) => e.slice(1).map((t, n) => [ka(e, n), t]), ja = (e, t, n) => e >= Math.min(t, n) && e <= Math.max(t, n);
function Ma(e, t = [], n = 7) {
	let r = [], i, a = (e) => {
		r.push(i === void 0 ? `M${String(e[0])} ${String(e[1])}` : `L${String(e[0])} ${String(e[1])}`), i = e;
	}, o = (e) => {
		r.push(`M${String(e[0])} ${String(e[1])}`), i = e;
	};
	a(ka(e, 0));
	for (let [r, i] of Aa(e)) {
		let e = Math.sign(i[0] - r[0]), s = Math.sign(i[1] - r[1]), c = Math.abs(i[0] - r[0]) + Math.abs(i[1] - r[1]), l = t.filter((e) => Na(e, r, i) && !Oa(e, r) && !Oa(e, i)).sort((e, t) => Math.abs(e[0] - r[0]) + Math.abs(e[1] - r[1]) - (Math.abs(t[0] - r[0]) + Math.abs(t[1] - r[1])));
		for (let t of l) {
			let l = Math.abs(t[0] - r[0]) + Math.abs(t[1] - r[1]);
			l > n && a([t[0] - e * n, t[1] - s * n]), o(c - l > n ? [t[0] + e * n, t[1] + s * n] : i);
		}
		a(i);
	}
	return r.join(" ");
}
var Na = (e, t, n) => t[0] === n[0] && e[0] === t[0] && ja(e[1], t[1], n[1]) || t[1] === n[1] && e[1] === t[1] && ja(e[0], t[0], n[0]);
function Pa(e, t, n) {
	return e.crossings.filter((e) => e.under === t && n.has(e.over) && n.has(e.under)).map((e) => e.at);
}
// src/diagram/pipes.ts
var Fa = 1.2, Ia = .6, La = [
	"tap_47",
	"tap_48",
	"tap_49"
], Ra = ["prod_27_15", "prod_15_8"];
function za(e) {
	if (e !== void 0 && e > 0) return Math.min(8, Math.max(Ia, Fa * 100 / e));
}
var Ba = {
	"compressor.discharge_temperature": "compressor.suction_temperature",
	"compressor.suction_temperature": "compressor.discharge_temperature",
	"refrigerant.condensation_temperature": "refrigerant.evaporation_temperature",
	"refrigerant.evaporation_temperature": "refrigerant.condensation_temperature"
}, Va = (e, t) => Di.includes(e.id) && Ha(t), Ha = (e) => e.active.has("htr") && !e.active.has("production_dhw");
function Ua(e, t) {
	return Va(e, t.circuits) ? "dhw.temperature" : e.reversible === !0 && t.mode === "active_cooling" ? Ba[e.temperatureRole] ?? e.temperatureRole : (t.mode === "passive_cooling" || t.mode === "defrost") && t.circuits.valves2728 === "exchanger" && Ra.includes(e.id) ? "production.outlet_temperature" : e.temperatureRole;
}
function Wa(e, t, n) {
	return t === "muted" && n === "defrost" && e.feature === "passive_cooling" ? "normal" : t;
}
var Ga = (e, t) => {
	let n = e[t];
	return n === !0 ? 3 : za(typeof n == "number" ? n : void 0);
}, Ka = (e, t) => {
	let n = e[t];
	return typeof n == "number" ? n : void 0;
};
function qa(e, t, n) {
	let { mode: r, circuits: i, readings: a, stops: o } = n, s = La.includes(e.id), c = Wa(e, t, r), l = s || xa(e, i), u = Ka(a, Ua(e, n)), d = c === "muted" || !l || u === void 0, f = e.direction === -1 != (e.reversible === !0 && r === "active_cooling"), p = {
		color: d ? A : wn(u, o),
		muted: d,
		reversed: f
	};
	if (!l || c === "muted" || e.stub === !0 || s) return {
		...p,
		animated: !1
	};
	let m = Va(e, i) || e.speedRole === void 0 && e.circuit.includes("htr") ? 3 : e.speedRole === void 0 ? void 0 : Ga(a, e.speedRole);
	return m === void 0 ? {
		...p,
		animated: !1
	} : {
		...p,
		animated: !0,
		duration: m
	};
}
var Ja = (e) => wn(Ka(e.readings, "dhw.temperature"), e.stops);
function Ya(e) {
	let { circuits: t, readings: n, stops: r } = e;
	return Ha(t) ? wn(Ka(n, "dhw.temperature"), r) : t.active.has("dhw_coil") ? wn(Ka(n, "production.outlet_temperature"), r) : A;
}
// src/diagram/symbols.ts
var Xa = .55;
function Za(e, t, n) {
	let r = -t - 9, i = t + 9;
	return b`<path class="exchanger-fill" data-half=${e} d=${e === "left" ? `M0 ${String(r)} H-16 A4 4 0 0 0 -20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 0 -16 ${String(i)} H0 Z` : `M0 ${String(r)} H16 A4 4 0 0 1 20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 1 16 ${String(i)} H0 Z`} fill=${n} fill-opacity=${Xa} stroke="none" />`;
}
var Qa = (e, t) => b`<text class="glyph" text-anchor="middle" dominant-baseline="central" font-size="9" fill="currentColor" stroke="none" transform="rotate(${-t})">${e}</text>`, $a = {
	kind: "helix",
	cx: 2,
	top: -60,
	bottom: 60,
	rx: 11,
	turns: 7.5
};
function eo({ internalTank: e, coil51: t }) {
	let n = e.x + 2 - t.x, r = Ea($a), { cx: i, rx: a, top: o, bottom: s } = $a, c = pi[0][1], l = pi[1][1], u = a - i;
	return b`<g transform="matrix(0 -1 1 0 0 0)">${wa(r).map((e) => b`<path data-half=${e.front ? "front" : "back"} stroke-linecap=${e.front ? "round" : "butt"} d=${e.d} opacity=${e.front ? x : Sa} />`)}</g><path style="stroke-width: var(--pipe-width, 3)" d="M${n} ${c} H${o} M${s} ${u} V${l} H${n}" />`;
}
var to = "M9 -10.7 L-13 -3 M9 10.7 L-13 3", no = (e, t) => b`<path d="M0 ${t} V${e}" />`, ro = (e, t) => b`<path d="${e}" fill=${t ? "currentColor" : "none"} />`;
function io(e, t) {
	if (t.arrangement === void 0) throw Error(`the ${e} symbol needs the arrangement it is drawn in`);
	return t.arrangement;
}
function ao(e) {
	let t = e.open ?? ["l", "r"];
	return b`${ro("M-12 -6 V6 L0 0 Z", t.includes("l"))}${ro("M12 -6 V6 L0 0 Z", t.includes("r"))}${ro("M-6 12 H6 L0 0 Z", t.includes("d"))}<rect x="-4" y="-21" width="8" height="8" /><path d="M0 -13 V-8" />`;
}
function oo(e) {
	return b`<rect x="-10" y="-14" width="20" height="28" rx="3" /><path d="M-14 0 H-10 M10 -10 H14 M10 0 H14 M10 10 H14" />${e.reversed === !0 ? b`<path d="M-14 0 H14 M14 10 H5 V-10 H14" />` : b`<path d="M-14 0 H-5 V10 H14 M14 0 H5 V-10 H14" />`}`;
}
function so(e) {
	let t = e.size ?? 34, n = e.fills;
	return b`${n === void 0 ? x : b`${Za("left", t, n.left)}${Za("right", t, n.right)}`}<rect x="-20" y="${-t - 9}" width="40" height="${2 * t + 18}" rx="4" /><path d="M-12 ${-t} V${t} M12 ${-t} V${t}" /><circle cx="-12" cy="${-t}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${-t}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="-12" cy="${t}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${t}" r="3.5" fill="var(--card-background-color, transparent)" />`;
}
function co(e, t) {
	let { width: n, height: r } = io(e, t).internalTank;
	return b`<rect class="tank-body" data-dhw-tank="internal" x=${-n / 2} y=${-r / 2} width=${n} height=${r} rx="14" fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />`;
}
var lo = {
	pump: () => b`<circle r="12" /><path d="M-5 -7 V7 L8 0 Z" fill="currentColor" />`,
	valve3: (e, t) => ao(t),
	inversion_valve: (e, t) => oo(t),
	probe_t: (e, t, n) => b`<circle r="9" />${no(16, 9)}${Qa("T", n)}`,
	transducer_p: (e, t, n) => b`<circle r="9" />${no(16, 9)}${Qa("P", n)}`,
	thermostat: (e, t, n) => b`<rect x="-7" y="-7" width="14" height="14" />${no(16, 7)}${Qa("T", n)}`,
	exchanger: (e, t) => so(t),
	compressor: () => b`<circle r="14" /><path class="compressor-lines" d="${to}" />`,
	valve: () => b`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`,
	resistor: () => b`<rect x="-28" y="-6" width="56" height="12" rx="2" /><path d="M-18 -6 V6 M18 -6 V6" />`,
	filter_dryer: () => b`<rect x="-14" y="-5" width="28" height="10" rx="5" />`,
	expansion_valve: () => b`<path d="M-12 -6 V6 L0 0 L12 -6 V6 L0 0 Z" />`,
	port: () => b`<rect x="-5" y="-6" width="10" height="6" />`,
	tank: co,
	coil: (e, t) => eo(io(e, t))
};
function uo(e, t) {
	return lo[e](e, t, t.rotation ?? 0);
}
function fo(e, t = {}) {
	return b`<g class="symbol ${e}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${t.rotation ?? 0})">${uo(e, t)}</g>`;
}
// src/diagram/cabinet.ts
var po = o`
  /* The stroke widths follow the card's width (responsive-layout "Minimum rendered sizes"): the card sets --pipe-width and --outline-width on the svg,
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
    ${Or}
  }
`;
function mo(e, t) {
	return e === 26 ? t.valve26 === "dhw" ? ["l", "d"] : ["l", "r"] : t.valves2728 === "exchanger" ? ["d", "r"] : ["l", "r"];
}
function ho(e, t, n, r, i) {
	let { part: a } = e, { circuits: o } = t, s = Wa(a, e.state, t.mode), c = rt(a.item), l = Dr(Er(Sr(a.item, n), n), n?.onTap);
	return b`<g class="symbol-group ${s}" data-item=${a.item} data-kind=${a.kind} aria-label=${c} role=${l.role} tabindex=${l.tabindex} @click=${l.click} @keydown=${l.keydown} style=${a.kind === "coil" ? `color: ${bo(t)}` : x}>
    <title>${c}</title>
    <g transform="translate(${a.x} ${a.y})">${fo(a.kind, {
		rotation: a.rotation,
		size: a.size,
		open: a.kind === "valve3" ? mo(a.item, o) : void 0,
		reversed: a.kind === "inversion_valve" ? o.valve14 === "reversed" : void 0,
		fills: i,
		arrangement: r
	})}</g>
  </g>`;
}
function go(e, t, n) {
	let r = Ea(t), i = n.muted ? x : `stroke: ${n.color}`;
	return b`<g class="helix ${n.muted ? "muted" : ""}" data-segment=${e.id} style=${i}>
    ${wa(r).map((e) => b`<path class="pipe ${n.muted ? "muted" : ""}" data-half=${e.front ? "front" : "back"} style=${i} stroke-linecap=${e.front ? "round" : "butt"} opacity=${e.front ? x : Sa} d=${e.d} />`)}
    ${n.animated ? b`<path class="flow ${n.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(n.duration)}s" d=${r.filter((e) => e.front).map((e) => e.d).join(" ")} />` : x}
  </g>`;
}
function _o(e, t, n, r, i) {
	if (e.shape !== void 0) return go(e, e.shape, t);
	let a = e.bend === void 0 ? Ma(e.points, n, r) : Da(e.points, e.bend);
	return b`<path class="pipe ${t.muted ? "muted" : ""}" data-segment=${e.id} style=${t.muted ? x : `stroke: ${t.color}`} stroke-linecap=${e.roundEnd === !0 ? "round" : x} d=${a} />${t.muted && i !== void 0 && xo.has(e.id) ? b`<path class="pipe-inside" data-inside=${e.id} clip-path="url(#${i})" d=${a} />` : x}${t.animated ? b`<path class="flow ${t.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(t.duration)}s" d=${a} />` : x}`;
}
function vo(e, t, n, r) {
	let i = (e) => e.map((e) => n.get(e)).find((e) => e !== void 0), a = e.reversible === !0 && r === "active_cooling", [o, s] = a ? [e.leaving, e.entering] : [e.entering, e.leaving], c = i(o), l = i(s), u = (c?.muted ?? !0) && (l?.muted ?? !0), d = (e) => u ? A : e?.color ?? "var(--disabled-text-color)", f = e.enters === "top" !== a;
	return {
		id: t,
		y1: +!f,
		y2: +!!f,
		start: d(c),
		end: d(l),
		muted: u
	};
}
var yo = (e) => b`<linearGradient id=${e.id} x1="0" y1=${e.y1} x2="0" y2=${e.y2} data-muted=${e.muted}>
      <stop offset="0" style="stop-color: ${e.start}" />
      <stop offset="1" style="stop-color: ${e.end}" />
    </linearGradient>`;
function bo(e) {
	let t = Ya(e);
	return t === "var(--disabled-text-color)" ? _n : t;
}
var xo = /* @__PURE__ */ new Set(["dhw_ext_in", "dhw_ext_out"]);
function So(e, t, n, r = {
	mode: "gradient",
	idPrefix: "ecogeo"
}, i = Ar.pipe) {
	let a = 7 * i / Ar.pipe, o = da(e), { cabinet: s } = o, c = ba(e), l = new Set(c.map((e) => e.part.id)), u = new Map(c.map((e) => [e.part.id, qa(e.part, e.state, t)])), d = [], f = pa(e) === "external" ? `${r.idPrefix}-tank-clip` : void 0, p = ya(e).map((e) => {
		let i = r.mode === "gradient" ? e.part.sides : void 0;
		if (i === void 0) return ho(e, t, n, o);
		let a = {
			left: "none",
			right: "none"
		};
		for (let n of i) {
			let i = vo(n, `${r.idPrefix}-x${String(e.part.item)}-${n.half}`, u, t.mode);
			d.push(i), a[n.half] = `url(#${i.id})`;
		}
		return ho(e, t, n, o, a);
	});
	return b`<g class="cabinet">
    <defs>${d.map(yo)}${f === void 0 ? x : b`<clipPath id=${f} data-tank-clip><path d=${fi(o)} /></clipPath>`}</defs>
    <rect class="outline" x=${s.x} y=${s.y} width=${s.width} height=${s.height} rx="6" />
    ${c.map((e) => {
		let t = u.get(e.part.id);
		return t === void 0 ? x : _o(e.part, t, Pa(o, e.part.id, l), a, f);
	})}
    ${p}
  </g>`;
}
// src/diagram/band-style.ts
var Co = o`
  .band-outline,
  .tank-body {
    stroke-width: max(2.5, var(--outline-width, 2));
  }
`, wo = o`
  .tank-body {
    stroke: var(--primary-text-color);
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
    ${Or}
  }
`;
function To(e, t) {
	if (pa(e) !== "external") return b``;
	let n = da(e);
	if (n.externalTank === void 0) return b``;
	let { x: r, y: i, width: a, dome: o } = n.externalTank, s = a / 2, c = fi(n), l = `M${String(r)} ${String(i + o)} A${String(s)} ${String(o)} 0 0 0 ${String(r + a)} ${String(i + o)}`, u = Dr(Er(Tr, t), t?.onTap);
	return b`<g class=${e.dhw === "unused" ? "dhw-storage muted" : "dhw-storage"} data-dhw="external" aria-label=${Ze.externalTank} role=${u.role} tabindex=${u.tabindex} @click=${u.click} @keydown=${u.keydown}>
    <title>${Ze.externalTank}</title>
    <path class="tank-body band-outline" data-dhw-tank="external" d=${c} fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />
    <path class="tank-rim" d=${l} />
    <rect class="obstacle" data-obstacle="tank-rim" x=${r} y=${i + o} width=${a} height=${o} fill="none" stroke="none" />
  </g>`;
}
// src/diagram/obstacle.ts
var Eo = (e, t) => b`<rect class="obstacle" data-obstacle=${e} x=${t.x} y=${t.y} width=${t.width} height=${t.height} fill="none" stroke="none" />`, Do = o`
  .emitter-outline {
    stroke: var(--primary-text-color);
  }
  .emitter-column {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-opacity: 0.6;
    stroke-width: calc(var(--outline-width, 2) * 0.75);
  }
  /* The circuit is inactive: the body, its lines and its columns are muted like the pipes. */
  .emitter.muted .emitter-outline,
  .emitter.muted .emitter-column {
    stroke: var(--disabled-text-color);
  }
  /* The spiral's runs are segments drawn above the body: a tap on them reaches the body's hit area (the emitter's button). */
  .pipe[data-segment^='dg1_loop'],
  .flow[data-flow^='dg1_loop'] {
    pointer-events: none;
  }
  .emitter[role='button'] {
    cursor: pointer;
  }
  .emitter[role='button']:focus-visible {
    ${Or}
  }
`, Oo = .5;
function ko(e) {
	let t = e.columns[0], n = e.columns.at(-1);
	return t === void 0 || n === void 0 ? {
		x: e.x,
		y: e.y,
		width: 0,
		height: 0
	} : {
		x: t.x,
		y: t.y,
		width: n.x + n.width - t.x,
		height: t.height
	};
}
function Ao(e, t, n) {
	let { x: r, y: i, width: a, height: o } = e, s = e.kind === "radiator";
	return b`<rect class="emitter-outline band-outline" x=${r} y=${i} width=${a} height=${o} rx=${N.radius} fill=${s && n ? `url(#${t})` : "none"} fill-opacity=${Oo} />
    ${s ? b`${e.columns.map((e) => b`<rect class="emitter-column" x=${e.x} y=${e.y} width=${e.width} height=${e.height} rx="4" />`)}${Eo("radiator-columns", ko(e))}` : x}`;
}
function jo(e, t, n, r) {
	let i = da(e), a = i.emitter, o = i.segments.find((e) => e.id === "dg1_sup"), s = i.segments.find((e) => e.id === "dg1_ret");
	if (a === void 0 || o === void 0 || s === void 0) return b``;
	let c = qa(o, "normal", t), l = qa(s, "normal", t), u = xa(o, t.circuits), d = c.muted && l.muted, f = `${r.idPrefix}-emitter`, p = a.kind === "radiator", m = Dr(Er(wr, n), n?.onTap), h = Qe[a.kind];
	return b`<g class="emitter${u ? "" : " muted"}" data-emitter="body" data-emitter-kind=${a.kind} aria-label=${h} role=${m.role} tabindex=${m.tabindex} @click=${m.click} @keydown=${m.keydown}>
    <title>${h}</title>
    ${p ? b`<defs>
      <linearGradient id=${f} gradientUnits="userSpaceOnUse" x1="0" y1=${a.y} x2="0" y2=${a.y + a.height} data-muted=${d}>
        <stop offset="0" style="stop-color: ${d ? A : c.color}" />
        <stop offset="1" style="stop-color: ${d ? A : l.color}" />
      </linearGradient>
    </defs>` : x}
    <rect class="emitter-hit" x=${a.x} y=${a.y} width=${a.width} height=${a.height} fill="transparent" stroke="none" />
    ${Ao(a, f, r.mode === "gradient")}
  </g>`;
}
// src/lib/format.ts
var Mo = "−";
function No(e) {
	let t = e?.locale;
	return typeof t == "object" && t ? t : e?.language === void 0 ? {} : { language: e.language };
}
function Po(e) {
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
var Fo = /* @__PURE__ */ new Map();
function Io(e, t, n) {
	let r = Po(e), i = n && e.number_format !== "none", a = `${r?.join(",") ?? ""}|${String(t)}|${String(i)}`, o = Fo.get(a);
	return o === void 0 && (o = new Intl.NumberFormat(r, {
		minimumFractionDigits: t,
		maximumFractionDigits: t,
		useGrouping: i
	}), Fo.set(a, o)), o;
}
function Lo(e, t, n = 0, r = !0) {
	if (!Number.isFinite(e)) return "–";
	let i = Number.isFinite(n) ? Math.min(20, Math.max(0, Math.trunc(n))) : 0, a = Math.abs(e) < .5 / 10 ** i ? 0 : e;
	return Io(t ?? {}, i, r).formatToParts(a).map((e) => e.type === "minusSign" ? Mo : e.value).join("");
}
// src/calc/display.ts
function Ro(e) {
	if (typeof e != "object" || !e) return;
	let t = e.display_precision;
	return typeof t == "number" && Number.isInteger(t) && t >= 0 && t <= 20 ? t : void 0;
}
var zo = /* @__PURE__ */ new Set([
	"production.pump",
	"brine.pump",
	"source.fan_speed"
]), Bo = (e, t) => t ?? e.decimals ?? 0;
function Vo(e, t) {
	let n = typeof t == "string" ? t.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase() : "";
	return n === (e.unit ?? "").toLowerCase() || e.quantity === "difference" && n === "°c";
}
function Ho(e) {
	if (/e/i.test(e ?? "")) return 0;
	let t = /^\s*[-+]?\d*\.(\d+)/.exec(e ?? "");
	return Math.min(20, t?.[1]?.length ?? 0);
}
function Uo(e, t) {
	let n = e === void 0 ? void 0 : t.states?.[e]?.attributes.unit_of_measurement;
	return typeof n == "string" && n.trim() !== "" ? n.trim() : void 0;
}
function Wo(e, t, n) {
	return e === void 0 || !t ? void 0 : Ro(n.entities?.[e]);
}
function Go(e, t, n, r, i, a) {
	return zo.has(e) && !n ? 0 : n && r === void 0 ? Ho(i === void 0 ? void 0 : a.states?.[i]?.state) : Bo(t, r);
}
function Ko(e, t, n, r) {
	if (typeof t == "boolean") return tt[t ? "on" : "off"];
	let i = Ot.get(e);
	if (i === void 0 || t === void 0 || !Number.isFinite(t)) return;
	let a = Uo(n, r), o = Vo(i, a), s = i.quantity !== void 0 && bt(i.quantity, a), c = i.unit !== void 0 && a !== void 0 && !o && !s, l = Go(e, i, c, Wo(n, o || c, r), n, r), u = Lo(t, r.locale, l, !1), d = c ? a : i.unit;
	return d === void 0 ? u : `${u} ${d}`;
}
// src/diagram/labels.ts
var qo = o`
  .diagram {
    position: relative;
    container-type: inline-size;
  }
  .diagram svg {
    display: block;
    width: 100%;
    height: auto;
  }
  /* One drawing unit is 1 cqw / 10 in the horizontal layout (viewBox 1000 wide) and 1 cqw / 7.4 in the vertical one (740 wide): the labels grow with the drawing above 770 px (horizontal) and 417 px (vertical), never below 10 px (LABEL_FONT_K). */
  .label {
    position: absolute;
    display: inline-flex;
    align-items: baseline;
    gap: 0.3em;
    padding: 0 0.15em;
    border-radius: 2px;
    font-size: ${a(Lr("horizontal"))};
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
  .label.rotated {
    transform: translate(-50%, -50%) rotate(-90deg);
  }
  [data-layout='vertical'] .label {
    font-size: ${a(Lr("vertical"))};
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
`, Jo = /* @__PURE__ */ new Set();
function Yo(e, t, n, r, i = Jo) {
	return da(e).labels.specs.flatMap((a) => {
		if (i.has(a.role) || _a(a, e) === "hidden" || e.dhw === "unused" && a.dhw !== void 0) return [];
		let o = n[a.role], { caption: s } = a, c = {
			x: a.x,
			y: a.y,
			align: a.align
		}, l = {
			id: a.id,
			role: a.role,
			...c,
			...a.bare === !0 ? { bare: !0 } : {},
			...a.rotate === void 0 ? {} : { rotate: a.rotate },
			entityId: o,
			...a.item === void 0 ? {} : { item: a.item },
			...s === void 0 ? {} : { caption: s }
		}, u = t[a.role], d = Ko(a.role, typeof u == "number" || typeof u == "boolean" ? u : void 0, o, r);
		return [{
			...l,
			text: d ?? "–",
			missing: d === void 0
		}];
	});
}
function Xo(e, t, n, r) {
	let { notPresent: i, absent: a } = r, o = (e, n, r, a) => n.every((e) => i.has(e)) ? void 0 : {
		id: e,
		...r === void 0 ? {} : { caption: r },
		text: a ?? "–",
		missing: a === void 0,
		entityId: t[n[0]]
	}, s = (r) => {
		let i = e[r];
		return Ko(r, typeof i == "number" || typeof i == "boolean" ? i : void 0, t[r], n);
	}, c = (e, t, n) => o(e, [t], n, s(t)), l = (e, t, n, r) => c(e, a.has(t) ? n : t, r), u = a.has("unit.system_cop") ? "unit.cop" : "unit.system_cop", d = o("cop", [u], r.mode === "active_cooling" ? et.eer : et.cop, e[u] === 0 ? void 0 : s(u)), { mode: f } = r, p = (f === "heating" || f === "active_cooling") && r.features.htr === !0 && (r.dhw === "external" || r.dhw === "internal") && !a.has("htr.power") ? c("htr_power", "htr.power", et.htr) : void 0, m = f === "heating" ? [l("dg1_power", "heating.power", "heating.capacity", et.dg1), p] : f === "dhw" ? [l("dhw_power", "dhw.power", "heating.capacity", et.dhw)] : f === "active_cooling" ? [c("cooling_power", "cooling.capacity", et.cooling), p] : [];
	return [
		r.source === "ground" ? c("outside_temperature", "source.outside_temperature", et.outside) : void 0,
		d,
		...m
	].filter((e) => e !== void 0);
}
var Zo = (e, t) => ({
	left: `${String(e.x / t.width * 100)}%`,
	top: `${String(e.y / t.height * 100)}%`
});
function Qo(e, t, n, r) {
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
function $o(e, t, n) {
	return y`${e.map((e) => {
		let { left: r, top: i } = Zo(e, n);
		return y`<span
      class="label ${e.align}${e.bare === !0 ? " bare" : ""}${e.rotate === void 0 ? "" : " rotated"}"
      data-label=${e.id}
      data-role=${e.role}
      data-label-item=${e.item ?? x}
      style="left: ${r}; top: ${i}"
      >${e.caption === void 0 ? x : y`<span class="caption">${e.caption}</span>`}${Qo(e.entityId, e.text, e.missing, t)}</span
    >`;
	})}`;
}
function es(e, t) {
	return y`${e.map((e) => y`<span class="footer-item" data-footer=${e.id}
        >${e.caption === void 0 ? x : y`<span class="caption">${e.caption}</span>`}${Qo(e.entityId, e.text, e.missing, t)}</span
      >`)}`;
}
// node_modules/@lit/reactive-element/decorators/property.js
var ts = {
	attribute: !0,
	type: String,
	converter: te,
	reflect: !1,
	hasChanged: ne
}, ns = (e = ts, t, n) => {
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
function rs(e) {
	return (t, n) => typeof n == "object" ? ns(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function is(e) {
	return rs({
		...e,
		state: !0,
		attribute: !1
	});
}
// src/lib/define.ts
function as(e, t) {
	let n = customElements.get(e);
	return n === void 0 ? (customElements.define(e, t), !0) : (n !== t && console.warn(`${e} is already defined by another copy of the module; that copy stays in use.`), !1);
}
// src/config/keywords.ts
var X = (e) => e.split(/\s+/).filter((e) => e !== ""), Z = "temp temperature temperatuur temperatura temperatur", os = "pressure druk presion druck", ss = "pump pomp bomba pumpe circulator", cs = "heating verwarming heizung heizkreis calefaccion cv", ls = `production productie produccion produktion ${cs}`, us = "brine glycol source bron brijn captacion salmuera sole", ds = "dhw sanitary sanitaria tapwater warmwater warmwasser acs caliente domestic hotwater boiler", fs = "demand vraag demanda anforderung bedarf request", ps = "suction zuig saug ansaug succion aspiracion niederdruck lagedruk", ms = "discharge pers druckgas heissgas descarga hochdruck hogedruk", hs = "capacity vermogen capacidad kapazitat leistung power", gs = "valve ventiel valvula ventil position stand posicion stellung", _s = "compressor compresor kompressor verdichter", vs = "condens condensation condensatie condensacion kondensation kondens", ys = "evaporat evaporation evaporacion verdamp verdampfung", bs = `${cs} dg verwarmen`, xs = "setpoint set target desired gewenst ingesteld soll wunsch consigna objetivo streef", Ss = "superheat oververhitting oververhit sobrecalentamiento ueberhitzung uberhitzung", Cs = "on off aan uit onoff encendido apagado ein aus", ws = "alarm alarma storing stoerung storung fehler error fault malfunction", Ts = "htr recovery recuperacion recuperatie rueckgewinnung", Es = "power vermogen potencia leistung", Ds = "electric elektr", Os = [
	Ds,
	ds,
	Ts
].join(" "), ks = [Ds, Ts].join(" "), As = [Ds, ds].join(" "), js = "system systeem sistema", Ms = "cop scop coefficient rendimiento rendement wirkungsgrad efficiency", Ns = {
	"production.outlet_temperature": {
		subject: X(ls),
		role: X(Z)
	},
	"production.return_temperature": {
		subject: X(ls),
		role: X(Z)
	},
	"production.pressure": {
		subject: X(ls),
		role: X(os)
	},
	"production.pump": {
		subject: X(ls),
		role: X(ss)
	},
	"brine.outlet_temperature": {
		subject: X(us),
		role: X(Z)
	},
	"brine.inlet_temperature": {
		subject: X(us),
		role: X(Z)
	},
	"brine.pressure": {
		subject: X(us),
		role: X(os)
	},
	"brine.pump": {
		subject: X(us),
		role: X(ss)
	},
	"compressor.speed": {
		subject: X(_s),
		role: X("rpm speed toerental toeren velocidad drehzahl frequency frequentie frecuencia frequenz hz running draait actief active activo laufend")
	},
	"compressor.percentage": {
		subject: X(_s),
		role: X("percentage porcentaje prozent load belasting carga auslastung capaciteit")
	},
	"compressor.power": {
		subject: X("power vermogen potencia leistung electrical elektrisch electrico"),
		role: X("consumption opgenomen verbruik consumo verbrauch aufnahme")
	},
	"compressor.suction_temperature": {
		subject: X(ps),
		role: X(Z)
	},
	"compressor.discharge_temperature": {
		subject: X(ms),
		role: X(Z)
	},
	"compressor.suction_pressure": {
		subject: X(ps),
		role: X(os)
	},
	"compressor.discharge_pressure": {
		subject: X(ms),
		role: X(os)
	},
	"compressor.mode": {
		subject: X(_s),
		role: X("mode modus modo operation operating bedrijf funcionamiento betriebsart")
	},
	"refrigerant.condensation_temperature": {
		subject: X(vs),
		role: X(Z)
	},
	"refrigerant.evaporation_temperature": {
		subject: X(ys),
		role: X(Z)
	},
	"refrigerant.superheat": {
		subject: X(Ss),
		role: X(Ss)
	},
	"refrigerant.expansion_valve": {
		subject: X("expansion expansie expansionsventil expans"),
		role: X(gs)
	},
	"heating.capacity": {
		subject: X(vs),
		role: X(hs)
	},
	"cooling.capacity": {
		subject: X(ys),
		role: X(hs)
	},
	"heating.demand": {
		subject: X(bs),
		role: X(fs)
	},
	"heating.setpoint": {
		subject: X(bs),
		role: X(`${Z} ${xs}`)
	},
	"dhw.temperature": {
		subject: X(ds),
		role: X(Z)
	},
	"dhw.setpoint": {
		subject: X(ds),
		role: X(`${Z} ${xs}`)
	},
	"dhw.start_delta": {
		subject: X(ds),
		role: X("delta difference verschil diferencia unterschied start starten arranque")
	},
	"dhw.demand": {
		subject: X(ds),
		role: X(fs)
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
		subject: X(`${Cs} heatpump warmtepomp`),
		role: X(`${Cs} power switch schakelaar`)
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
		subject: X(ws),
		role: X(ws)
	},
	"unit.connection": {
		subject: X("connection connected connectivity conexion verbinding verbindung online communication"),
		role: X("connection connected connectivity conexion verbinding verbindung status online communication")
	},
	"unit.cop": {
		subject: X(Ms),
		role: X(Ms),
		exclude: X(js)
	},
	"heating.power": {
		subject: X(bs),
		role: X(Es),
		exclude: X(Os)
	},
	"dhw.power": {
		subject: X(ds),
		role: X(Es),
		exclude: X(ks)
	},
	"htr.active": {
		subject: X(Ts),
		role: X("active actief activo aktiv")
	},
	"htr.power": {
		subject: X(Ts),
		role: X(Es),
		exclude: X(As)
	},
	"unit.system_cop": {
		subject: X(js),
		role: X(Ms)
	}
}, Ps = {
	in: X(`in inlet return retour retorno inflow terug terugvoer terugloop inlaat entrada eintritt ruecklauf rucklauf ingaand eingang ${ps}`),
	out: X(`out outlet supply aanvoer uitlaat salida impulsion austritt vorlauf uitgaand ausgang uit ${ms}`)
}, Fs = X(xs), Is = /* @__PURE__ */ new Set(["heating.setpoint", "dhw.setpoint"]), Ls = X("flow"), Rs = {
	exact: 100,
	suffix: 90,
	subject: 30,
	role: 20,
	direction: 10,
	strong: 40,
	tie: 5
}, zs = (e) => e.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replaceAll("ß", "ss"), Bs = (e) => zs(e).split(/[^a-z]+/).filter((e) => e !== ""), Vs = (e) => {
	let t = e.indexOf(".");
	return [e.slice(0, t), e.slice(t + 1)];
};
function Hs(e, t, n, r) {
	let i = n[r]?.name_by_user ?? n[r]?.name ?? "";
	return Object.values(t).filter((e) => e?.device_id === r).flatMap((t) => {
		let n = e[t.entity_id];
		if (n === void 0) return [];
		let [r, a] = Vs(t.entity_id), o = n.attributes.friendly_name, s = n.attributes.unit_of_measurement, c = n.attributes.device_class;
		return [{
			entityId: t.entity_id,
			domain: r,
			objectId: a,
			unit: typeof s == "string" ? s : void 0,
			deviceClass: typeof c == "string" ? c : void 0,
			names: [...typeof o == "string" ? [Us(o, i)] : [], ...typeof t.name == "string" ? [t.name] : []]
		}];
	});
}
function Us(e, t) {
	let n = zs(t).trim(), r = zs(e);
	if (n === "" || !r.startsWith(n)) return e;
	let i = r.slice(n.length);
	return i === "" || /^[^a-z0-9]/.test(i) ? i : e;
}
function Ws(e) {
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
function Gs(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of O) {
		let r = /* @__PURE__ */ new Set();
		for (let t of e) {
			let e = `_${n.suffix}`;
			t.domain === n.domain && t.objectId.length > e.length && t.objectId.endsWith(e) && r.add(t.objectId.slice(0, -e.length));
		}
		for (let e of r) t.set(e, (t.get(e) ?? 0) + 1);
	}
	let [n] = [...t].sort(([e, t], [n, r]) => r - t || n.length - e.length || (e < n ? -1 : 1));
	return n === void 0 ? Ws(e.map((e) => e.objectId)) : `${n[0]}_`;
}
var Ks = (e) => (e ?? "").trim().toLowerCase(), qs = {
	"compressor.speed": ["rpm", "hz"],
	"production.pump": ["%", "rpm"],
	"brine.pump": ["%", "rpm"],
	"source.fan_speed": ["%", "rpm"]
}, Js = {
	temperature: ["temperature"],
	difference: ["temperature"],
	power: ["power"],
	pressure: ["pressure", "atmospheric_pressure"]
};
function Ys(e, t) {
	if (Et.includes(t.domain)) return !0;
	if (e.kind !== "number") return Ks(t.unit) === "" && (t.deviceClass === void 0 || t.deviceClass === "enum");
	if ("quantity" in e && e.quantity !== void 0) {
		if (!bt(e.quantity, t.unit)) return !1;
		let n = Js[e.quantity];
		return t.deviceClass === void 0 || n === void 0 || n.includes(t.deviceClass);
	}
	let n = Ks(t.unit), r = qs[e.path] ?? ("unit" in e && e.unit !== void 0 ? [Ks(e.unit)] : []);
	return r.length === 0 ? n === "" : r.includes(n);
}
function Xs(e, t) {
	return e.accepts.includes(t.domain) && Ys(e, t);
}
var Zs = (e, t) => e.some((e) => t.some((t) => e.length >= 4 ? t.includes(e) : t === e));
function Qs(e, t, n) {
	return t.entityId === jt(e, n.replace(/_$/, "")) && n !== "" ? Rs.exact : (e.kind !== "binary" || Et.includes(t.domain)) && (t.objectId === e.suffix || t.objectId.endsWith(`_${e.suffix}`)) ? Rs.suffix : 0;
}
function $s(e, t) {
	if (e.direction === void 0) return 0;
	if (e.direction === "out" && Zs(Ls, t) && !Zs(Ps.in, t) || Zs(Ps[e.direction], t)) return Rs.direction;
}
function ec(e, t, n) {
	let r = Qs(e, t, n);
	if (r > 0) return r;
	let i = [...Bs(t.objectId.startsWith(n) ? t.objectId.slice(n.length) : t.objectId), ...t.names.flatMap(Bs)];
	if (Zs(Fs, i) !== Is.has(e.path)) return 0;
	let a = Ns[e.path];
	if (a.exclude !== void 0 && Zs(a.exclude, i)) return 0;
	let o = 0;
	Zs(a.subject, i) && (o += Rs.subject), Zs(a.role, i) && (o += Rs.role);
	let s = $s(e, i);
	return s === void 0 ? 0 : o + s;
}
function tc(e) {
	return typeof e != "object" || !e || Array.isArray(e) ? {} : Object.fromEntries(Object.entries(e).map(([e, t]) => [e, typeof t == "object" && t && !Array.isArray(t) ? tc(t) : t]));
}
function nc(e, t) {
	let n = gr(e, Kn(e)), r = /* @__PURE__ */ new Set(), i = [];
	for (let a of O) {
		if (Gn(k(e, `entities.${a.path}`))) continue;
		let o = n[a.path];
		o !== void 0 && t[o] !== void 0 ? r.add(o) : i.push(a);
	}
	return {
		open: i,
		used: r
	};
}
function rc(e, t, n, r) {
	return e.flatMap((e, i) => t.filter((t) => !n.has(t.entityId) && Xs(e, t)).map((t) => ({
		role: e,
		order: i,
		candidate: t,
		score: ec(e, t, r)
	}))).filter((e) => e.score > 0).sort((e, t) => t.score - e.score || e.order - t.order || (e.candidate.entityId < t.candidate.entityId ? -1 : 1));
}
function ic(e, t) {
	let n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set();
	for (let i of e) {
		let a = i.role.path;
		if (i.score < Rs.strong) break;
		if (n.has(a) || r.has(a) || t.has(i.candidate.entityId)) continue;
		let [o, s] = e.filter((e) => e.role === i.role && !t.has(e.candidate.entityId));
		o !== void 0 && s !== void 0 && o.score - s.score <= Rs.tie ? r.add(a) : (n.set(a, i.candidate.entityId), t.add(i.candidate.entityId));
	}
	return n;
}
function ac(e, t) {
	let n = tc(k(e, "entities"));
	for (let [e, r] of t) {
		let [t = "", i = ""] = e.split("."), a = n[t], o = typeof a == "object" && a ? a : {};
		o[i] = r, n[t] = o;
	}
	return n;
}
function oc(e) {
	let { states: t, config: n } = e, r = Hs(t, e.entities, e.devices, e.deviceId), i = Gs(r), { open: a, used: o } = nc(n, t), s = ic(rc(a, r, o, i), o);
	return {
		entities: ac(n, s),
		report: {
			filled: a.map((e) => e.path).filter((e) => s.has(e)),
			empty: a.map((e) => e.path).filter((e) => !s.has(e))
		}
	};
}
// src/editor/role-labels.ts
var sc = T.roleGroups, cc = T.roles, lc = {
	"heating.power": T.heatPower,
	"dhw.power": T.heatPower,
	"htr.power": T.heatPower
};
function uc(e) {
	let t = e.split(".")[1] ?? "";
	return lc[e] ?? cc[t] ?? t;
}
function dc(e) {
	let [t = ""] = e.split(".");
	return `${sc[t] ?? t}: ${uc(e)}`;
}
// src/editor/binding-check.ts
function fc(e, t) {
	if (t === void 0 || Object.keys(t).length === 0) return [];
	let n = Kn(e), r = gr(e, n), i = _r(e, n);
	return O.flatMap((n) => {
		let a = r[n.path];
		if (a === void 0 || Gn(k(e, `entities.${n.path}`))) return [];
		let o = dc(n.path), s = t[a];
		if (s === void 0) {
			let e = n.path;
			return i.has(e) && kt.includes(e) ? [] : [T.suggest.unknown(o, a)];
		}
		let c = a.slice(0, a.indexOf("."));
		if (!n.accepts.includes(c)) return [T.suggest.kind(o, a)];
		if (s.state === "unavailable") return [];
		let l = s.attributes.unit_of_measurement, u = s.attributes.device_class;
		return Ys(n, {
			domain: c,
			unit: typeof l == "string" ? l : void 0,
			deviceClass: typeof u == "string" ? u : void 0
		}) ? [] : [T.suggest.unit(o, a)];
	});
}
// src/editor/fields.ts
var pc = (e, t, { advanced: n = !1 } = {}) => ({
	name: e,
	selector: { entity: { filter: { domain: t } } },
	...n ? { advanced: n } : {}
});
function mc(e) {
	let t = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(e.trim())?.[1];
	if (t === void 0) return;
	let n = t.length === 3 ? t.replace(/./g, "$&$&") : t, r = (e) => Number.parseInt(n.slice(e, e + 2), 16);
	return [
		r(0),
		r(2),
		r(4)
	];
}
var hc = (e) => Array.isArray(e) && e.length === 3 && e.every((e) => typeof e == "number" && Number.isFinite(e)), gc = (e) => "#" + e.map((e) => Math.min(255, Math.max(0, Math.round(e))).toString(16).padStart(2, "0")).join(""), _c = (e) => ({
	name: e,
	selector: { color_rgb: {} }
}), vc = (e, t, n, r = t.default) => ({
	name: e,
	default: r,
	selector: { select: {
		mode: "dropdown",
		options: t.choices.map((e) => ({
			value: e,
			label: n[e] ?? e
		}))
	} }
}), yc = "#9e9e9e", bc = /^colors_(\d+)_(temperature|color)$/;
function xc(e) {
	let t = bc.exec(e);
	return t?.[1] === void 0 ? void 0 : {
		index: Number(t[1]),
		part: t[2]
	};
}
function Sc(e) {
	let t = k(e, "colors");
	return Array.isArray(t) ? t.map((e) => {
		let { temperature: t, color: n } = typeof e == "object" && e ? e : {};
		return {
			...typeof t == "number" ? { temperature: t } : {},
			...typeof n == "string" ? { color: n } : {}
		};
	}) : pn.map((e) => ({ ...e }));
}
var Cc = mc("#9e9e9e") ?? [
	158,
	158,
	158
], wc = () => ({ color: Cc });
function Tc(e) {
	let t = [...e];
	for (; t.length >= 2 && t[t.length - 1]?.temperature === void 0 && t[t.length - 2]?.temperature === void 0;) t.pop();
	return t.at(-1)?.temperature === void 0 && t.length > 0 ? t : [...t, wc()];
}
function Ec(e) {
	return Tc(Sc(e).map(({ temperature: e, color: t }) => {
		let n = t === void 0 ? void 0 : mc(t);
		return {
			...e === void 0 ? {} : { temperature: e },
			...n === void 0 ? {} : { color: n },
			...t === void 0 ? {} : { orig: t }
		};
	}));
}
function Dc(e) {
	return Array.from({ length: e }, (e, t) => t).flatMap((e) => [{
		name: `colors_${String(e)}_temperature`,
		selector: { number: {
			step: "any",
			mode: "box",
			unit_of_measurement: C.celsius
		} }
	}, _c(`colors_${String(e)}_color`)]);
}
function Oc(e) {
	let t = {};
	return e.forEach(({ temperature: e, color: n }, r) => {
		e !== void 0 && (t[`colors_${String(r)}_temperature`] = e), n !== void 0 && (t[`colors_${String(r)}_color`] = [...n]);
	}), t;
}
function kc(e) {
	let t = /* @__PURE__ */ new Map(), n = {};
	for (let [r, i] of Object.entries(e)) {
		let e = xc(r);
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
var Ac = (e, t) => e.every((e, n) => e === t[n]);
function jc(e) {
	let t = typeof e == "string" && e.trim() !== "" ? Number(e) : e;
	return typeof t == "number" && Number.isFinite(t) ? t : void 0;
}
function Mc(e, t) {
	let n = t === void 0 ? void 0 : mc(t);
	return hc(e) ? t !== void 0 && n && Ac(n, e) ? t : gc(e) : t !== void 0 && n === void 0 ? t : yc;
}
function Nc(e, t) {
	let n = Math.max(e.length, ...[...t.keys()].map((e) => e + 1));
	return Tc(Array.from({ length: n }, (n, r) => {
		let i = t.get(r), a = jc(i?.temperature), o = i !== void 0 && hc(i.color) ? i.color : void 0, s = e[r]?.orig;
		return {
			...a === void 0 ? {} : { temperature: a },
			...o === void 0 ? {} : { color: o },
			...s === void 0 ? {} : { orig: s }
		};
	}));
}
var Pc = (e, t) => e.length === t.length && e.every((e, n) => e.temperature === t[n]?.temperature && e.color === t[n]?.color), Fc = (e) => e.length === pn.length && e.every((e, t) => {
	let n = pn[t];
	return e.temperature === n?.temperature && e.color.toLowerCase() === n.color;
});
function Ic(e, t) {
	let n = e.flatMap(({ temperature: e, color: t, orig: n }) => e === void 0 ? [] : [{
		temperature: e,
		color: Mc(t, n)
	}]).sort((e, t) => e.temperature - t.temperature), r = k(t, "colors");
	return Array.isArray(r) && Pc(n, Sc(t)) ? "keep" : Fc(n) ? r !== void 0 && !Array.isArray(r) ? "keep" : void 0 : n;
}
function Lc(e, t) {
	return t === void 0 ? Object.fromEntries(Object.entries(e).filter(([e]) => e !== "colors")) : {
		...e,
		colors: t
	};
}
// src/editor/ecogeo-schema.ts
var Rc = [
	"features",
	"entities",
	"states"
], zc = ["entities"], Bc = "_device", Vc = "_not_present", Hc = "default", Uc = [
	[Hc, void 0],
	["true", !0],
	["false", !1],
	["unused", "unused"]
];
function Wc(e, t) {
	let { on: n, off: r, unused: i, presetOn: a, presetOff: o, presetUnused: s, variantDefault: c } = T.featureChoices;
	return {
		name: e,
		default: Hc,
		coded: Uc,
		selector: { select: {
			mode: "dropdown",
			options: [
				{
					value: Hc,
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
var Gc = [
	"passive_cooling",
	"active_cooling",
	"htr",
	"backup_heater"
];
function Kc() {
	return {
		name: "variant",
		default: "4",
		coded: En.map((e) => [String(e), e]),
		selector: { select: {
			mode: "dropdown",
			options: En.map((e) => ({
				value: String(e),
				label: T.choices.variant[e]
			}))
		} }
	};
}
var qc = (e) => jn.filter((t) => t === "unused" || t === Vn(e) || t === "none" && e === "B");
function Jc(e, t) {
	let n = k(e, "dhw"), r = qc(t), i = jn.filter((e) => r.includes(e) || e === n);
	return vc("dhw", {
		...Fn,
		choices: i
	}, T.choices.dhw, Vn(t));
}
function Yc(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of O) {
		if (Gn(k(e, `entities.${n.path}`))) continue;
		let [r = "", i = ""] = n.path.split(".");
		t.set(r, [...t.get(r) ?? [], {
			...pc(i, n.accepts, { advanced: !0 }),
			label: uc(n.path)
		}]);
	}
	return {
		type: "expandable",
		name: "entities",
		schema: [...t].map(([e, t]) => ({
			type: "expandable",
			name: e,
			title: T.roleGroups[e],
			schema: t
		}))
	};
}
var Xc = () => ({
	name: Vc,
	advanced: !0,
	selector: { select: {
		multiple: !0,
		mode: "dropdown",
		options: O.map((e) => ({
			value: e.path,
			label: dc(e.path)
		}))
	} }
}), Zc = {
	off: "unit.on_off",
	defrost: "compressor.mode"
};
function Qc(e, t) {
	let n = gr(e, Kn(e)), r = (e) => {
		let r = n[Zc[e]], i = r === void 0 ? void 0 : t?.[r]?.attributes.options;
		return Array.isArray(i) ? i.filter((e) => typeof e == "string") : [];
	};
	return {
		off: r("off"),
		defrost: r("defrost")
	};
}
function $c(e) {
	let t = (t) => ({
		name: t,
		advanced: !0,
		default: [...st[t]],
		selector: { select: {
			multiple: !0,
			custom_value: !0,
			mode: "dropdown",
			options: [.../* @__PURE__ */ new Set([...e[t], ...st[t]])]
		} }
	});
	return {
		type: "expandable",
		name: "states",
		schema: [t("off"), t("defrost")]
	};
}
function el(e, t = Ec(e).length, n) {
	let r = Dn(qn(e)), i = k(e, "model") === kn[1] ? kn[1] : kn[0];
	return [
		{
			type: "expandable",
			name: "unit",
			flatten: !0,
			schema: [
				vc("model", Nn, T.choices.model),
				Kc(),
				vc("source", Pn, T.choices.source),
				Jc(e, i),
				vc("emitter", In, T.choices.emitter)
			]
		},
		{
			type: "expandable",
			name: "entity_prefix",
			flatten: !0,
			schema: [{
				name: Bc,
				selector: { device: {} }
			}, {
				name: "prefix",
				selector: { text: {} }
			}]
		},
		{
			type: "expandable",
			name: "features",
			schema: Gc.map((e) => Wc(e, r[e]))
		},
		{
			type: "expandable",
			name: "appearance",
			flatten: !0,
			schema: [
				vc("exchanger_fill", Ln, T.choices.exchanger_fill),
				vc("layout", Rn, T.choices.layout),
				...Dc(t)
			]
		},
		Yc(e),
		Xc(),
		$c(Qc(e, n))
	];
}
// src/editor/schema.ts
function tl(e) {
	return "type" in e;
}
function nl(e) {
	let { advanced: t, ...n } = e;
	return n;
}
function rl(e, t) {
	return e.flatMap((e) => {
		if (!tl(e)) return t || e.advanced !== !0 ? [nl(e)] : [];
		let n = rl(e.schema, t);
		return n.length > 0 ? [{
			...e,
			schema: n
		}] : [];
	});
}
function Q(e, t = "") {
	return e.flatMap((e) => tl(e) ? Q(e.schema, e.flatten ? t : `${t}${e.name}.`) : [{
		field: e,
		path: `${t}${e.name}`
	}]);
}
function il(e, t) {
	return rl(e, t);
}
function al(e, t) {
	if (e == null || e === "") return !1;
	if (t.default === void 0) return !0;
	if (typeof t.default == "number") {
		let n = typeof e == "number" ? e : typeof e == "string" ? dt(e) : void 0;
		if (n !== void 0) return n !== t.default;
	}
	return ol(e) !== ol(t.default);
}
function ol(e) {
	return (typeof e == "string" || typeof e == "number" || typeof e == "boolean" ? String(e) : JSON.stringify(e)).toLowerCase();
}
function sl(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function cl(e, t, n, r, i = "") {
	let [a, ...o] = t.split("."), s = e, { [a]: c, ...l } = s;
	if (o.length === 0) return n === void 0 ? l : Object.hasOwn(s, a) ? {
		...s,
		[a]: n
	} : {
		...l,
		[a]: n
	};
	let u = cl(sl(c) ? c : {}, o.join("."), n, r, `${i}${a}.`), d = r !== void 0 && k(r, `${i}${a}`) !== void 0;
	return n === void 0 && Object.keys(u).length === 0 && !d ? l : {
		...s,
		[a]: u
	};
}
function ll(e, t, n = /* @__PURE__ */ new Set()) {
	return Q(e).reduce((e, { field: r, path: i }) => r.default !== void 0 && k(t, i) === void 0 && !n.has(i) ? cl(e, i, r.default) : e, t);
}
function ul(e, t, n) {
	return Q(e).map(({ path: e }) => e).filter((e) => k(t, e) !== void 0 && k(n, e) === void 0);
}
function dl(e) {
	if (!sl(e)) return e;
	let t = Object.entries(e).filter(([, e]) => e !== void 0).map(([e, t]) => [e, dl(t)]);
	return t.length !== Object.keys(e).length || t.some(([t, n]) => n !== e[t]) ? Object.fromEntries(t) : e;
}
function fl(e, t) {
	return Q(e).reduce((e, { field: n, path: r }) => ("text" in n.selector || "entity" in n.selector) && k(e, r) === "" ? cl(e, r, void 0, t) : e, t);
}
function pl(e, t) {
	return Q(e).reduce((e, { field: t, path: n }) => {
		let r = k(e, n), i = t.coded?.find(([, e]) => e !== void 0 && e === r);
		return i === void 0 ? e : cl(e, n, i[0]);
	}, t);
}
function ml(e, t, n) {
	return Q(e).reduce((e, { field: t, path: r }) => {
		let i = k(e, r), a = t.coded?.find(([e]) => e === i);
		return a === void 0 ? e : cl(e, r, a[1], n);
	}, t);
}
function hl(e, t, n, r = []) {
	let i = (e) => sl(e) && Object.keys(e).length === 0;
	return Object.fromEntries(Object.entries(e).flatMap(([e, a]) => {
		if (!n.includes(e) || !sl(a)) return [[e, a]];
		let o = t[e], s = r.includes(e) ? Object.fromEntries(Object.entries(a).filter(([e, t]) => !i(t) || sl(o) && i(o[e]))) : a;
		return Object.keys(s).length > 0 || i(o) ? [[e, s]] : [];
	}));
}
function gl(e, t, n) {
	return Q(e).reduce((e, { field: n, path: r }) => n.default !== void 0 && k(t, r) === void 0 && k(e, r) !== void 0 && !al(k(e, r), n) ? cl(e, r, void 0, t) : e, n);
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/decorate.js
function _l(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/editor/ecogeo-card-editor.ts
var vl = "ecogeo-card-editor", yl = [{
	name: "advanced",
	selector: { boolean: {} }
}], bl = () => T.advanced, xl = T.sections, Sl = T.fields, Cl = T.roles;
function wl(e) {
	if (tl(e)) return e.title ?? xl[e.name] ?? e.name;
	let t = xc(e.name);
	return t === void 0 ? e.label === void 0 ? Sl[e.name] ?? Cl[e.name] ?? e.name : e.label : T.colorRow[t.part](t.index + 1);
}
var Tl = (e) => Object.hasOwn(e, "entities") || Object.hasOwn(e, "states"), El = (e) => Object.hasOwn(e, "entities"), Dl = [Bc, Vc];
function Ol(e, t) {
	let n = e.states;
	if (typeof n != "object" || !n || Array.isArray(n)) return e;
	let r = (e, t) => Array.isArray(e) && Array.isArray(t) && e.length === t.length && e.every((e, n) => String(e).trim().toLowerCase() === String(t[n]).trim().toLowerCase()), i = Object.entries(n).filter(([e, n]) => {
		if (!Array.isArray(n)) return !0;
		if (n.length === 0) return !1;
		let i = e === "off" || e === "defrost" ? st[e] : void 0, a = JSON.stringify(n) === JSON.stringify(k(t, `states.${e}`));
		return i === void 0 || !r(n, i) || a;
	});
	return {
		...e,
		states: Object.fromEntries(i)
	};
}
function kl(e, t, n) {
	let r = e;
	for (let e of nr(n)) t.has(e) || (r = cl(r, `entities.${e}`, void 0, n));
	for (let e of t) r = cl(r, `entities.${e}`, "none", n);
	return r;
}
function Al(e) {
	return typeof e == "string" && e !== "" ? e : void 0;
}
function jl(e, t) {
	let n = k(e, t);
	return t.startsWith("states.") && Array.isArray(n) && n.length === 0;
}
function Ml(e, t, n) {
	let r = t[Vc];
	return !Array.isArray(r) && !Object.hasOwn(t, "_not_present") ? e : kl(e, new Set(Array.isArray(r) ? r.filter((e) => typeof e == "string") : []), n);
}
function Nl(e, t, n, r) {
	let i = [...ul(e, r, n), ...Q(e).map(({ path: e }) => e).filter((e) => jl(n, e) && k(r, e) !== void 0)].filter((e) => !Dl.includes(e));
	return new Set([...t, ...i].filter((e) => k(n, e) === void 0 || jl(n, e)));
}
var Pl = class extends We {
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
		super(), this.schemaFor = el, this._switch = { advanced: !1 }, this._optionsKey = "", this._formDefined = customElements.get("ha-form") !== void 0, this._schema = [], this._formSchema = [], this._shown = {}, this._draft = [], this._draftBuilt = !1, this._emptied = /* @__PURE__ */ new Set(), this._toggleAdvanced = (e) => {
			e.stopPropagation(), this._switch = { advanced: e.detail.value.advanced === !0 };
		}, this._configChanged = (e) => {
			e.stopPropagation();
			let t = this._config ?? {}, { [Bc]: n, [Vc]: r, ...i } = e.detail.value, a = this._has(Bc), o = Al(n);
			if (a && o !== this._device) {
				this._device = o, this._report = void 0;
				return;
			}
			this._report = void 0;
			let s = this._has(Vc), c = a || s ? i : e.detail.value, l = this._hasColorRows, u = l ? kc(c) : void 0, d = dl(fl(this._schema, u?.rest ?? c)), f = l ? kc(this._shown).rest : this._shown;
			this._emptied = Nl(this._schema, this._emptied, d, f);
			let p = ml(this._schema, d, t), m = s ? Ml(p, e.detail.value, t) : p, h = hl(Ol(gl(this._schema, t, m), t), t, Rc, zc);
			u && (this._draft = Nc(this._draft, u.rows));
			let g = u ? Ic(this._draft, t) : "keep", _ = g === "keep" ? h : Lc(h, g);
			this._colorsSeen = _.colors, this._config = _, this._refreshSchema(_), this.dispatchEvent(new CustomEvent("config-changed", {
				detail: { config: _ },
				bubbles: !0,
				composed: !0
			}));
		}, this._suggest = () => {
			let e = this._pickDevice(), t = this.hass;
			if (e === void 0 || t === void 0 || this._config === void 0) return;
			let n = this._config, { entities: r, report: i } = oc({
				states: t.states,
				entities: t.entities ?? {},
				devices: t.devices ?? {},
				deviceId: e,
				config: n
			});
			this._switch = { advanced: !0 }, this._report = {
				filled: i.filled.length,
				empty: i.empty.map(dc)
			};
			let a = Object.keys(r).length === 0 && !El(n) ? n : {
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
		let n = this._config !== void 0 && Tl(this._config);
		Tl(e) && !n && !this._switch.advanced && (this._switch = { advanced: !0 }), this._draftBuilt && JSON.stringify(e.colors) === JSON.stringify(this._colorsSeen) || (this._draft = Ec(e), this._colorsSeen = e.colors, this._draftBuilt = !0), this._config = e, this._refreshSchema(e);
	}
	_refreshSchema(e) {
		let t = this.schemaFor(e, this._draft.length, this.hass?.states);
		this._optionsKey = JSON.stringify(Qc(e, this.hass?.states)), JSON.stringify(t) !== JSON.stringify(this._schema) && (this._schema = t, this._formSchema = il(t, this._switch.advanced));
	}
	willUpdate(e) {
		this._syncSchema(e), e.has("_switch") && (this._formSchema = il(this._schema, this._switch.advanced)), this._config && (e.has("_config") || e.has("schemaFor") || e.has("_device")) && (this._shown = this._shownData(this._config));
	}
	_syncSchema(e) {
		(e.has("schemaFor") && this._config || e.has("hass") && this._config && JSON.stringify(Qc(this._config, this.hass?.states)) !== this._optionsKey) && this._refreshSchema(this._config);
	}
	_shownData(e) {
		return {
			...pl(this._schema, ll(this._schema, e, this._emptied)),
			...this._hasColorRows ? Oc(this._draft) : {},
			...this._has("_device") && this._device !== void 0 ? { [Bc]: this._device } : {},
			...this._has("_not_present") ? { [Vc]: [...nr(e)] } : {}
		};
	}
	_has(e) {
		return Q(this._schema).some(({ path: t }) => t === e);
	}
	get _hasColorRows() {
		return Q(this._schema).some(({ path: e }) => xc(e) !== void 0);
	}
	_pickDevice() {
		return this.hass === void 0 ? void 0 : this._device;
	}
	_renderNotes() {
		let e = this._config ? fc(this._config, this.hass?.states) : [];
		return y`
      ${this._has("_device") ? y`<button
              type="button"
              class="suggest"
              ?disabled=${this._pickDevice() === void 0}
              @click=${this._suggest}
            >
              ${T.suggest.button}
            </button>` : x}
      ${this._report ? y`<ul class="report" role="status">
              <li>${T.suggest.filled(this._report.filled)}</li>
              ${this._report.empty.length > 0 ? y`<li>${T.suggest.empty(this._report.empty)}</li>` : x}
            </ul>` : x}
      ${e.length > 0 ? y`<p class="title">${T.suggest.warningsTitle}</p>
              <ul class="warnings">
                ${e.map((e) => y`<li>${e}</li>`)}
              </ul>` : x}
    `;
	}
	render() {
		if (!this._config) return x;
		let e = ur(this._config);
		return y`
      ${e.length > 0 ? y`<p class="error" role="alert">${e.join("; ")}</p>` : x}
      ${this._formDefined ? y`<ha-form
                class="switch"
                .hass=${this.hass}
                .data=${this._switch}
                .schema=${yl}
                .computeLabel=${bl}
                @value-changed=${this._toggleAdvanced}
              ></ha-form>
              <ha-form
                .hass=${this.hass}
                .data=${this._shown}
                .schema=${this._formSchema}
                .computeLabel=${wl}
                @value-changed=${this._configChanged}
              ></ha-form>
              ${this._renderNotes()}` : y`<p class="hint">${T.noForm}</p>`}
    `;
	}
};
_l([rs({ attribute: !1 })], Pl.prototype, "hass", void 0), _l([rs({ attribute: !1 })], Pl.prototype, "schemaFor", void 0), _l([is()], Pl.prototype, "_config", void 0), _l([is()], Pl.prototype, "_switch", void 0), _l([is()], Pl.prototype, "_device", void 0), _l([is()], Pl.prototype, "_report", void 0), _l([is()], Pl.prototype, "_formDefined", void 0), as(vl, Pl);
// src/diagram/source.ts
var Fl = o`
  .source-outline {
    fill: none;
    stroke: var(--primary-text-color);
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
  .source-ground {
    stroke: var(--secondary-text-color);
    stroke-width: calc(var(--outline-width, 2) * 0.75);
  }
  /* The brine circuit is inactive: the case, coil and ground line are muted like the pipes; the fan follows its own speed. */
  .muted .source-outline,
  .muted .source-frame,
  .muted .source-fin,
  .muted .source-ground {
    stroke: var(--disabled-text-color);
  }
  .fan-part[role='button'] {
    cursor: pointer;
  }
  .fan-part[role='button']:focus-visible {
    ${Or}
  }
  /* the fan's static guard (rings and spokes) is drawn in the fin style, so the turning blades stay visible through it */
  .fan-guard {
    fill: none;
    stroke: var(--secondary-text-color);
    stroke-opacity: 0.8;
    stroke-width: calc(var(--outline-width, 2) * 0.7);
  }
  .muted .fan-guard {
    stroke: var(--disabled-text-color);
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
`, $ = (e) => Math.round(e * 100) / 100, Il = 3, Ll = (e) => e === !0 ? Il : e === void 0 || e === !1 || !(e > 0) ? void 0 : Math.min(6, Math.max(.5, 120 / e)), Rl = [
	0,
	72,
	144,
	216,
	288
].map((e) => b`<path class="fan-blade" d="M0 -4 C9 -6 21 -16 17 -30 C6 -26 -3 -17 -3 -6 Z" transform="rotate(${e})" />`), zl = [
	.75,
	.5,
	.25
], Bl = 34;
function Vl(e, t, n, r) {
	let { body: i, fan: a, coil: o, fins: s, feet: c } = e, l = Ll(t), u = Array.from({ length: s.count }, (e, t) => $(s.y0 + t * s.step)), d = $(a.radius / Bl), f = a.radius * zl[2] * Math.SQRT1_2, p = a.radius * Math.SQRT1_2, m = [
		[-1, -1],
		[1, -1],
		[1, 1],
		[-1, 1]
	].map(([e, t]) => b`<path class="fan-guard fan-spoke" d="M${$(a.cx + (e ?? 0) * f)} ${$(a.cy + (t ?? 0) * f)} L${$(a.cx + (e ?? 0) * p)} ${$(a.cy + (t ?? 0) * p)}" />`), h = Dr(Er(Cr, r), r?.onTap);
	return b`<g class="air-unit${n ? " muted" : ""}" data-source="air" aria-label=${at}>
    <title>${at}</title>
    <rect class="source-outline band-outline" x=${i.x} y=${i.y} width=${i.width} height=${i.height} rx=${N.radius} />
    ${c.map((e) => b`<rect class="source-frame air-foot" x=${e.x} y=${e.y} width=${e.width} height=${e.height} />`)}
    <rect class="source-frame" data-coil-block data-obstacle="air-coil" x=${o.x} y=${o.y} width=${o.width} height=${o.height} rx="3" />
    ${u.map((e) => b`<path class="source-fin" d="M${s.x0} ${e} H${s.x1}" />`)}
    <g class="fan-part" aria-label=${it} role=${h.role} tabindex=${h.tabindex} @click=${h.click} @keydown=${h.keydown}>
      <title>${it}</title>
      <circle class="fan-ring" data-obstacle="air-fan" cx=${a.cx} cy=${a.cy} r=${a.radius} />
      <circle class="fan-hit" cx=${a.cx} cy=${a.cy} r=${a.radius} fill="transparent" stroke="none" />
      <g class="fan" data-fan transform="translate(${a.cx} ${a.cy})${d === 1 ? "" : ` scale(${String(d)})`}">
        <g class=${l === void 0 ? "fan-rotor still" : "fan-rotor"} style=${l === void 0 ? "" : `--fan-duration: ${String(l)}s`}>${Rl}<circle class="fan-hub" r="5" fill="var(--primary-text-color)" /></g>
      </g>
      <g class="fan-guard-group">
        ${zl.map((e) => b`<circle class="fan-guard fan-guard-ring" cx=${a.cx} cy=${a.cy} r=${$(a.radius * e)} />`)}
        ${m}
      </g>
    </g>
  </g>`;
}
function Hl(e, t) {
	let { x: n, y: r, width: i, height: a, hatch: o, probe: s } = e, c = Array.from({ length: Math.floor((i - 20) / 10) + 1 }, (e, t) => $(n + 14 + t * 10));
	return b`<g class="ground-collector${t ? " muted" : ""}" data-source="ground" aria-label=${ot}>
    <title>${ot}</title>
    <rect class="source-outline band-outline" x=${n} y=${r} width=${i} height=${a} rx=${N.radius} />
    <path class="source-ground" d="M${n} ${o.y + o.height} H${$(n + i)}" />
    ${c.map((e) => b`<path class="source-ground" d="M${e} ${r} l-8 ${o.height}" />`)}
    ${Eo("ground-hatch", o)}
    ${Eo("ground-probe", s)}
  </g>`;
}
function Ul(e, t, n, r) {
	let { airUnit: i, collector: a } = da(e), o = e.source === "air" || e.source === "hybrid", s = e.source === "ground" || e.source === "hybrid";
	return b`<g class="source" data-source-kind=${e.source}>
    ${o && i !== void 0 ? Vl(i, t["source.fan_speed"], !n, r) : b``}
    ${s && a !== void 0 ? Hl(a, !n) : b``}
  </g>`;
}
// src/lib/version.ts
var Wl = "1.1.2";
// src/lib/render.ts
function Gl(e, t) {
	return e === t || Array.isArray(e) && Array.isArray(t) && e.length === t.length && e.every((e, n) => e === t[n]);
}
function Kl(e, t) {
	if (e === t) return !0;
	if (typeof e != "object" || typeof t != "object" || e === null || t === null) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	return n.length === r.length && n.every((n) => Object.hasOwn(t, n) && Gl(e[n], t[n]));
}
function ql(e, t, n) {
	return e === void 0 || e.locale !== t.locale || e.language !== t.language || e.localize !== t.localize || e.formatEntityState !== t.formatEntityState || e.themes?.darkMode !== t.themes?.darkMode || n.some((n) => e.states[n] !== t.states[n] || !Kl(e.entities?.[n], t.entities?.[n]));
}
function Jl(e, t, n, r) {
	return e.size === 1 && e.has("hass") ? t !== void 0 && ql(n, t, r) : !0;
}
// src/suggest/stub.ts
function Yl(e, t, n) {
	let r = Hs(e.states, t, e.devices ?? {}, n), i = Gs(r).replace(/_$/, "");
	if (i === "") return;
	let a = new Set(r.map((e) => e.entityId));
	return O.filter((e) => a.has(jt(e, i))).length * 2 >= O.length ? i : void 0;
}
function Xl(e) {
	if (e === void 0) return {};
	let t = /* @__PURE__ */ new Map();
	for (let n of Object.values(e.entities ?? {})) {
		if (typeof n.device_id != "string") continue;
		let e = t.get(n.device_id) ?? {};
		e[n.entity_id] = n, t.set(n.device_id, e);
	}
	let n = [...t].flatMap(([t, n]) => Yl(e, n, t) ?? []);
	return n.length === 1 ? { prefix: n[0] } : {};
}
// src/card/ecogeo-card.ts
var Zl = "ecogeo-card", Ql = 0;
as("ecogeo-card", class extends We {
	static {
		this.version = Wl;
	}
	static {
		this.styles = [
			po,
			Co,
			Fl,
			Do,
			wo,
			qo,
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
		return document.createElement(vl);
	}
	static getStubConfig(e) {
		return Xl(e);
	}
	constructor() {
		super(), this.renderedVertical = !1, this.renderedAutoVertical = !1, this.renderedStroke = Pr(void 0), this.renderedDrawing = 0, this.entityIds = [], this.idPrefix = `ecogeo${String(++Ql)}`, this.onWindowResize = () => {
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
		return Fr({
			isPanel: this.inPanel,
			cardWidth: this.width,
			windowHeight: window.innerHeight,
			headerHeight: this.inPanel ? this.cssPx("--header-height") : void 0,
			safeAreaTop: this.inPanel ? this.cssPx("--safe-area-inset-top") : void 0,
			viewBox: e
		});
	}
	layoutWidth() {
		return this.drawingWidthFor(ua("horizontal").viewBox);
	}
	get shownLayout() {
		return kr(this.resolved?.layout ?? "auto", this.layoutWidth(), this.renderedAutoVertical) ? "vertical" : "horizontal";
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
		let t = ur(e);
		if (t.length > 0) throw Error(t.join("; "));
		this.resolved = yr(e), this.entityIds = [...new Set(Object.values(this.resolved.entities).filter((e) => e !== void 0))], this.config = e;
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
			let e = this.shownLayout, t = this.arrangementViewBox(e), n = Pr(this.drawingWidthFor(t), t.width);
			return e === "vertical" !== this.renderedVertical || this.fittedWidth(e) !== this.renderedDrawing || n.pipe !== this.renderedStroke.pipe || n.outline !== this.renderedStroke.outline;
		}
		return Jl(e, this.hass, this.renderedHass, this.entityIds);
	}
	arrangementViewBox(e) {
		let t = this.resolved;
		return ua(e, t === void 0 ? void 0 : $i(t)).viewBox;
	}
	fittedWidth(e) {
		if (!this.inPanel || !(this.width > 0)) return 0;
		let t = this.drawingWidthFor(this.arrangementViewBox(e));
		return t < this.width ? t : 0;
	}
	statesFor(e) {
		return e.sample ? hr : this.hass?.states ?? {};
	}
	tapFor(e) {
		return e.sample ? void 0 : (e) => {
			ht(this, e);
		};
	}
	readings(e) {
		let t = this.statesFor(e);
		return {
			readings: Ft(t, e.entities),
			absent: It(t, e.entities, e.defaulted),
			offline: Wt(mt(t, e.entities["unit.connection"]))
		};
	}
	render() {
		this.renderedHass = this.hass;
		let e = this.shownLayout, t = e === "vertical";
		this.renderedVertical = t, this.renderedAutoVertical = t && this.resolved?.layout === "auto";
		let n = this.arrangementViewBox(e), r = Pr(this.drawingWidthFor(n), n.width);
		this.renderedStroke = r;
		let i = this.fittedWidth(e);
		this.renderedDrawing = i;
		let a = this.resolved;
		if (a === void 0) return y`<ha-card data-layout=${e}><div class="diagram"></div></ha-card>`;
		let o = ua(e, $i(a)), { viewBox: s } = o, c = {
			...a,
			arrangement: o
		}, { readings: l, absent: u, offline: d } = this.readings(c), f = Ut(l, c.features, c.states), p = Jt(f, c.features, c.dhw, l, !c.notPresent.has("brine.pump"), !u.has("htr.active")), m = this.statesFor(c), h = Rt(l, c.entities, m), g = {
			mode: f,
			circuits: p,
			readings: h,
			stops: c.colors
		}, _ = {
			locale: No(this.hass),
			entities: this.hass?.entities,
			states: m
		}, ee = this.tapFor(c), v = {
			entities: c.entities,
			onTap: ee
		};
		return y`<ha-card data-layout=${e}>
      <div class="diagram" style=${i > 0 ? `max-width: ${String(i)}px; margin: 0 auto` : x}>
        <svg
          viewBox="0 0 ${s.width} ${s.height}"
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label=${qe}
          style="--dhw-tank-color: ${c.dhw === "unused" ? A : Ja(g)}; --ecogeo-coil-muted: ${vn(this.hass?.themes?.darkMode === !0)}; --pipe-width: ${String(r.pipe)}; --outline-width: ${String(r.outline)}"
        >
          ${b`${jo(c, g, v, {
			mode: c.exchangerFill,
			idPrefix: this.idPrefix
		})}${Ul(c, h, p.active.has("brine"), v)}${To(c, v)}${So(c, g, v, {
			mode: c.exchangerFill,
			idPrefix: this.idPrefix
		}, r.pipe)}`}
        </svg>
        ${$o(Yo(c, l, c.entities, _, c.notPresent), ee, s)}
      </div>
      <div class="footer">
        <span class="mode">${Ye[f]}</span>
        ${es(Xo(l, c.entities, _, {
			mode: f,
			features: c.features,
			source: c.source,
			dhw: c.dhw,
			notPresent: c.notPresent,
			absent: u
		}), ee)}
        ${Gt(l["unit.alarm"]) ? y`<span class="alarm">${Xe.alarm}</span>` : x}
        ${d ? y`<span class="offline">${Xe.offline}</span>` : x}
        ${c.sample ? y`<span class="sample">${Xe.sampleValues}</span>` : x}
      </div>
    </ha-card>`;
	}
}) && console.info(`ecogeo-card ${Wl}`);
// src/index.ts
var $l = {
	type: Zl,
	...Ke,
	preview: !0
};
function eu(e = window) {
	let t = e.customCards ??= [];
	t.some((e) => e.type === $l.type) || t.push({ ...$l });
}
eu();
export { $l as CARD_ENTRY, eu as registerCardPicker };
