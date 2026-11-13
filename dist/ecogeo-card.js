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
oe.elementStyles = [], oe.shadowRootOptions = { mode: "open" }, oe[g("elementProperties")] = /* @__PURE__ */ new Map(), oe[g("finalized")] = /* @__PURE__ */ new Map(), ne?.({ ReactiveElement: oe }), (h.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var se = globalThis, ce = (e) => e, le = se.trustedTypes, ue = le ? le.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, de = "$lit$", fe = `lit$${Math.random().toFixed(9).slice(2)}$`, pe = "?" + fe, me = `<${pe}>`, he = document, ge = () => he.createComment(""), _e = (e) => e === null || typeof e != "object" && typeof e != "function", ve = Array.isArray, ye = (e) => ve(e) || typeof e?.[Symbol.iterator] == "function", be = "[ 	\n\f\r]", xe = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Se = /-->/g, Ce = />/g, we = RegExp(`>|${be}(?:([^\\s"'>=/]+)(${be}*=${be}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), Te = /'/g, Ee = /"/g, De = /^(?:script|style|textarea|title)$/i, Oe = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), _ = Oe(1), v = Oe(2), ke = Symbol.for("lit-noChange"), y = Symbol.for("lit-nothing"), Ae = /* @__PURE__ */ new WeakMap(), je = he.createTreeWalker(he, 129);
function Me(e, t) {
	if (!ve(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return ue === void 0 ? t : ue.createHTML(t);
}
var Ne = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = xe;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === xe ? c[1] === "!--" ? o = Se : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = we) : (De.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = we) : o = Ce : o === we ? c[0] === ">" ? (o = i ?? xe, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? we : c[3] === "\"" ? Ee : Te) : o === Ee || o === Te ? o = we : o === Se || o === Ce ? o = xe : (o = we, i = void 0);
		let d = o === we && e[t + 1].startsWith("/>") ? " " : "";
		a += o === xe ? n + me : l >= 0 ? (r.push(s), n.slice(0, l) + de + n.slice(l) + fe + d) : n + fe + (l === -2 ? t : d);
	}
	return [Me(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Pe = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = Ne(t, n);
		if (this.el = e.createElement(l, r), je.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = je.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(de)) {
					let t = u[o++], n = i.getAttribute(e).split(fe), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? ze : r[1] === "?" ? Be : r[1] === "@" ? Ve : Re
					}), i.removeAttribute(e);
				} else e.startsWith(fe) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (De.test(i.tagName)) {
					let e = i.textContent.split(fe), t = e.length - 1;
					if (t > 0) {
						i.textContent = le ? le.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], ge()), je.nextNode(), c.push({
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
					for (; (e = i.data.indexOf(fe, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += fe.length - 1;
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
function Fe(e, t, n = e, r) {
	if (t === ke) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = _e(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = Fe(e, i._$AS(e, t.values), i, r)), t;
}
var Ie = class {
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
		je.currentNode = r;
		let i = je.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Le(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new He(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = je.nextNode(), a++);
		}
		return je.currentNode = he, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, Le = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = y, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = Fe(this, e, t), _e(e) ? e === y || e == null || e === "" ? (this._$AH !== y && this._$AR(), this._$AH = y) : e !== this._$AH && e !== ke && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ye(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== y && _e(this._$AH) ? this._$AA.nextSibling.data = e : this.T(he.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Pe.createElement(Me(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Ie(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = Ae.get(e.strings);
		return t === void 0 && Ae.set(e.strings, t = new Pe(e)), t;
	}
	k(t) {
		ve(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(ge()), this.O(ge()), this, this.options)) : r = n[i], r._$AI(a), i++;
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
}, Re = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = y, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = y;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = Fe(this, e, t, 0), a = !_e(e) || e !== this._$AH && e !== ke, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = Fe(this, r[n + o], t, o), s === ke && (s = this._$AH[o]), a ||= !_e(s) || s !== this._$AH[o], s === y ? e = y : e !== y && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === y ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, ze = class extends Re {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === y ? void 0 : e;
	}
}, Be = class extends Re {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== y);
	}
}, Ve = class extends Re {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = Fe(this, e, t, 0) ?? y) === ke) return;
		let n = this._$AH, r = e === y && n !== y || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== y && (n === y || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, He = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		Fe(this, e);
	}
}, Ue = se.litHtmlPolyfillSupport;
Ue?.(Pe, Le), (se.litHtmlVersions ??= []).push("3.3.3");
var We = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Le(t.insertBefore(ge(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Ge = globalThis, Ke = class extends oe {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = We(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return ke;
	}
};
Ke._$litElement$ = !0, Ke.finalized = !0, Ge.litElementHydrateSupport?.({ LitElement: Ke });
var qe = Ge.litElementPolyfillSupport;
qe?.({ LitElement: Ke }), (Ge.litElementVersions ??= []).push("4.2.2");
// src/strings.ts
var b = {
	invalid: (e, t) => `Invalid option ${e}: expected ${t}`,
	number: (e, t) => `a number from ${e} to ${t}`,
	color: "a CSS colour such as #db4437 or rgb(219, 68, 55)",
	boolean: "true or false",
	object: "a group of options",
	choice: (e) => `one of ${e.join(", ")}`,
	list: "a list of texts"
}, Je = {
	name: "ecoGEO Schematic",
	description: "The internal schematic of an Ecoforest ecoGEO heat pump, with live values and pipes coloured by temperature."
}, Ye = "ecoGEO heat pump schematic", x = {
	celsius: "°C",
	kelvin: "K",
	bar: "bar",
	percent: "%",
	rpm: "rpm",
	watt: "W"
}, Xe = {
	off: ["OFF"],
	defrost: ["Defrost"]
}, Ze = {
	off: "Off",
	defrost: "Defrost",
	dhw: "DHW",
	active_cooling: "Active cooling",
	heating: "Heating",
	passive_cooling: "Passive cooling",
	standby: "Standby"
}, Qe = {
	alarm: "Alarm",
	offline: "Offline",
	sampleValues: "Sample values"
}, S = {
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
}, $e = {
	dg1: "DG1",
	outerLoop: "Outer loop",
	dhw: "DHW"
}, et = {
	air: "Air unit",
	ground: "Ground loop"
}, tt = {
	externalTank: "DHW tank",
	demand: "Demand"
}, nt = { demand: "Demand" }, C = {
	setpoint: "Setpoint",
	startDelta: "Start ΔT",
	setpointShort: "Set",
	startDeltaShort: "ΔT",
	fan: "Fan",
	outside: "Outside",
	portIn: "In",
	portOut: "Out",
	dhw: "DHW"
}, rt = {
	outside: "Outside",
	cop: "COP",
	condensation: "Condensation",
	evaporation: "Evaporation",
	summer: "Summer",
	winter: "Winter"
}, it = {
	on: "On",
	off: "Off",
	emergency: "Emergency"
}, at = {
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
}, ot = (e) => {
	let t = at[e];
	return t === void 0 ? "" : `${t} (${String(e)})`;
}, st = "Air unit fan", w = {
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
}, ct = Xe, lt = /* @__PURE__ */ new Set(["unknown", "unavailable"]), ut = -999, dt = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;
function ft(e) {
	if (!dt.test(e)) return;
	let t = Number(e);
	return Number.isFinite(t) ? t + 0 : void 0;
}
function pt(e) {
	if (e === void 0 || lt.has(e.state)) return !0;
	let t = ft(e.state);
	return t !== void 0 && t <= ut;
}
function mt(e) {
	if (!(e === void 0 || pt(e))) return ft(e.state);
}
// src/lib/hass.ts
var ht = (e, t) => t === void 0 ? void 0 : e[t];
function gt(e, t) {
	e.dispatchEvent(new CustomEvent("hass-more-info", {
		detail: { entityId: t },
		bubbles: !0,
		composed: !0
	}));
}
// src/lib/units.ts
var _t = { scale: 1 }, vt = {
	scale: 5 / 9,
	offset: -32
}, yt = {
	temperature: /* @__PURE__ */ new Map([["°c", _t], ["°f", vt]]),
	difference: /* @__PURE__ */ new Map([
		["k", _t],
		["°c", _t],
		["°f", vt]
	]),
	power: /* @__PURE__ */ new Map([["w", _t], ["kw", { scale: 1e3 }]]),
	pressure: /* @__PURE__ */ new Map([
		["bar", _t],
		["kpa", { scale: .01 }],
		["mpa", { scale: 10 }],
		["pa", { scale: 1e-5 }],
		["mbar", { scale: .001 }],
		["psi", { scale: .0689476 }]
	])
};
function bt(e) {
	return e.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase();
}
var xt = (e, t) => t !== void 0 && yt[e].has(bt(t));
function St(e, t) {
	let n = mt(e);
	return n === void 0 ? void 0 : Ct(t, n, e?.attributes.unit_of_measurement);
}
function Ct(e, t, n) {
	if (!Number.isFinite(t) || n === void 0) return;
	let r = yt[e].get(bt(n));
	return r ? (t + (r.offset ?? 0)) * r.scale : void 0;
}
// src/config/roles.ts
var T = [
	"sensor",
	"number",
	"input_number"
], wt = [
	...T,
	"binary_sensor",
	"switch",
	"input_boolean"
], Tt = [
	"binary_sensor",
	"switch",
	"input_boolean",
	"sensor"
], Et = [
	"sensor",
	"select",
	"input_select",
	"binary_sensor",
	"switch",
	"input_boolean"
], E = x.celsius, D = [
	{
		path: "production.outlet_temperature",
		domain: "sensor",
		suffix: "production_out",
		kind: "number",
		quantity: "temperature",
		unit: E,
		decimals: 1,
		item: "33",
		accepts: T,
		direction: "out"
	},
	{
		path: "production.return_temperature",
		domain: "sensor",
		suffix: "production_in",
		kind: "number",
		quantity: "temperature",
		unit: E,
		decimals: 1,
		item: "34",
		accepts: T,
		direction: "in"
	},
	{
		path: "production.pressure",
		domain: "sensor",
		suffix: "pressure_production",
		kind: "number",
		quantity: "pressure",
		unit: x.bar,
		decimals: 1,
		item: "38",
		accepts: T
	},
	{
		path: "production.pump",
		domain: "sensor",
		suffix: "production_pump",
		kind: "number",
		unit: x.percent,
		decimals: 1,
		item: "15",
		onOff: !0,
		accepts: wt
	},
	{
		path: "brine.outlet_temperature",
		domain: "sensor",
		suffix: "brine_out",
		kind: "number",
		quantity: "temperature",
		unit: E,
		decimals: 1,
		item: "31",
		accepts: T,
		direction: "out"
	},
	{
		path: "brine.inlet_temperature",
		domain: "sensor",
		suffix: "brine_in",
		kind: "number",
		quantity: "temperature",
		unit: E,
		decimals: 1,
		item: "32",
		accepts: T,
		direction: "in"
	},
	{
		path: "brine.pressure",
		domain: "sensor",
		suffix: "pressure_brine",
		kind: "number",
		quantity: "pressure",
		unit: x.bar,
		decimals: 1,
		item: "37",
		accepts: T
	},
	{
		path: "brine.pump",
		domain: "sensor",
		suffix: "brine_pump",
		kind: "number",
		unit: x.percent,
		decimals: 1,
		item: "16",
		onOff: !0,
		accepts: wt
	},
	{
		path: "compressor.speed",
		domain: "sensor",
		suffix: "compressor_rpm",
		kind: "number",
		unit: x.rpm,
		decimals: 0,
		item: "11",
		onOff: !0,
		accepts: wt
	},
	{
		path: "compressor.percentage",
		domain: "sensor",
		suffix: "compressor_percentage",
		kind: "number",
		unit: x.percent,
		decimals: 1,
		item: "11",
		accepts: T
	},
	{
		path: "compressor.power",
		domain: "sensor",
		suffix: "power_consumption",
		kind: "number",
		quantity: "power",
		unit: x.watt,
		decimals: 0,
		item: "11",
		accepts: T
	},
	{
		path: "compressor.suction_temperature",
		domain: "sensor",
		suffix: "compressor_suction_temperature",
		kind: "number",
		quantity: "temperature",
		unit: E,
		decimals: 1,
		item: "29",
		accepts: T,
		direction: "in"
	},
	{
		path: "compressor.discharge_temperature",
		domain: "sensor",
		suffix: "compressor_discharge_temperature",
		kind: "number",
		quantity: "temperature",
		unit: E,
		decimals: 1,
		item: "30",
		accepts: T,
		direction: "out"
	},
	{
		path: "compressor.suction_pressure",
		domain: "sensor",
		suffix: "compressor_suction_pressure",
		kind: "number",
		quantity: "pressure",
		unit: x.bar,
		decimals: 1,
		item: "35",
		accepts: T,
		direction: "in"
	},
	{
		path: "compressor.discharge_pressure",
		domain: "sensor",
		suffix: "compressor_discharge_pressure",
		kind: "number",
		quantity: "pressure",
		unit: x.bar,
		decimals: 1,
		item: "36",
		accepts: T,
		direction: "out"
	},
	{
		path: "compressor.mode",
		domain: "sensor",
		suffix: "compressor_operation_mode",
		kind: "text",
		item: "11",
		onOff: !0,
		accepts: Et
	},
	{
		path: "refrigerant.condensation_temperature",
		domain: "sensor",
		suffix: "condensation_temperature",
		kind: "number",
		quantity: "temperature",
		unit: E,
		decimals: 1,
		item: "8",
		accepts: T
	},
	{
		path: "refrigerant.evaporation_temperature",
		domain: "sensor",
		suffix: "evaporation_temperature",
		kind: "number",
		quantity: "temperature",
		unit: E,
		decimals: 1,
		item: "7",
		accepts: T
	},
	{
		path: "refrigerant.superheat",
		domain: "sensor",
		suffix: "superheat",
		kind: "number",
		quantity: "difference",
		unit: x.kelvin,
		decimals: 1,
		item: "12",
		accepts: T
	},
	{
		path: "refrigerant.expansion_valve",
		domain: "sensor",
		suffix: "expansion_valve_position",
		kind: "number",
		unit: x.percent,
		decimals: 0,
		item: "12",
		accepts: T
	},
	{
		path: "heating.capacity",
		domain: "sensor",
		suffix: "condensation_capacity",
		kind: "number",
		quantity: "power",
		unit: x.watt,
		decimals: 0,
		item: "8",
		accepts: T
	},
	{
		path: "cooling.capacity",
		domain: "sensor",
		suffix: "evaporation_capacity",
		kind: "number",
		quantity: "power",
		unit: x.watt,
		decimals: 0,
		item: "7",
		accepts: T
	},
	{
		path: "heating.demand",
		domain: "binary_sensor",
		suffix: "dg1_demand",
		kind: "binary",
		item: "1/2",
		accepts: Tt
	},
	{
		path: "heating.setpoint",
		domain: "sensor",
		suffix: "heating_dg1_setpoint",
		kind: "number",
		quantity: "temperature",
		unit: E,
		decimals: 1,
		item: "1/2",
		accepts: T
	},
	{
		path: "dhw.temperature",
		domain: "sensor",
		suffix: "dhw_temperature",
		kind: "number",
		quantity: "temperature",
		unit: E,
		decimals: 1,
		item: "tank (54 on C)",
		accepts: T
	},
	{
		path: "dhw.setpoint",
		domain: "number",
		suffix: "dhw_setpoint",
		kind: "number",
		quantity: "temperature",
		unit: E,
		decimals: 0,
		item: "tank",
		accepts: T
	},
	{
		path: "dhw.start_delta",
		domain: "number",
		suffix: "delta_t_start_dhw",
		kind: "number",
		quantity: "difference",
		unit: x.kelvin,
		decimals: 0,
		item: "tank",
		accepts: T
	},
	{
		path: "dhw.demand",
		domain: "binary_sensor",
		suffix: "dhw_demand",
		kind: "binary",
		item: "26",
		accepts: Tt
	},
	{
		path: "source.fan_speed",
		domain: "sensor",
		suffix: "aerothermal_fan_speed",
		kind: "number",
		unit: x.percent,
		decimals: 1,
		item: "air unit",
		accepts: T
	},
	{
		path: "source.air_unit_outlet_temperature",
		domain: "sensor",
		suffix: "brine_temperature_air_unit_outlet",
		kind: "number",
		quantity: "temperature",
		unit: E,
		decimals: 1,
		item: "air unit",
		accepts: T
	},
	{
		path: "source.outside_temperature",
		domain: "sensor",
		suffix: "outside_temperature",
		kind: "number",
		quantity: "temperature",
		unit: E,
		decimals: 1,
		item: "air unit / footer",
		accepts: T
	},
	{
		path: "unit.on_off",
		domain: "sensor",
		suffix: "heatpump_on_off",
		kind: "text",
		item: "footer",
		onOff: !0,
		accepts: Et
	},
	{
		path: "unit.summer",
		domain: "binary_sensor",
		suffix: "summer",
		kind: "binary",
		item: "footer",
		accepts: Tt
	},
	{
		path: "unit.winter",
		domain: "binary_sensor",
		suffix: "winter",
		kind: "binary",
		item: "footer",
		accepts: Tt
	},
	{
		path: "unit.alarm",
		domain: "binary_sensor",
		suffix: "alarm",
		kind: "binary",
		item: "footer",
		accepts: Tt
	},
	{
		path: "unit.connection",
		domain: "binary_sensor",
		suffix: "status",
		kind: "binary",
		item: "footer",
		accepts: Tt
	},
	{
		path: "unit.cop",
		domain: "sensor",
		suffix: "cop",
		kind: "number",
		decimals: 1,
		item: "footer",
		accepts: T
	}
], Dt = [
	"binary_sensor",
	"switch",
	"input_boolean"
], Ot = (e) => e !== void 0 && Dt.includes(e.split(".")[0] ?? ""), kt = new Map(D.map((e) => [e.path, e])), At = D.map((e) => e.path);
[...new Set(D.flatMap((e) => "unit" in e ? [e.unit] : []))];
var jt = (e, t) => `${e.domain}.${t}_${e.suffix}`;
// src/calc/readings.ts
function Mt(e, t) {
	return t.quantity === void 0 ? mt(e) : St(e, t.quantity) ?? (t.quantity === "pressure" ? mt(e) : void 0);
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
	if (t.onOff === !0 && Ot(n)) return Nt(e);
	switch (t.kind) {
		case "number": return Mt(e, t);
		case "text": return e === void 0 || pt(e) || ["unavailable", "unknown"].includes(e.state.trim().toLowerCase()) ? void 0 : e.state.trim();
		case "binary": return Nt(e);
	}
}
function Ft(e, t) {
	return Object.fromEntries(D.map((n) => [n.path, Pt(ht(e, t[n.path]), n, t[n.path])]));
}
var It = [
	"production.pump",
	"brine.pump",
	"source.fan_speed"
];
function Lt(e, t, n) {
	let r = {};
	for (let i of It) {
		let a = e[i], o = ht(n, t[i])?.attributes.unit_of_measurement?.trim();
		typeof a == "number" && a > 0 && o !== void 0 && o !== "" && o !== "%" && (r[i] = !0);
	}
	return {
		...e,
		...r
	};
}
var Rt = (e, t) => typeof e == "string" && t.some((t) => t.trim().toLowerCase() === e.trim().toLowerCase()), zt = (e) => e === !0 || typeof e == "number" && e > 0;
function Bt(e) {
	let t = e["compressor.speed"];
	if (t !== void 0) return zt(t);
	let n = e["compressor.percentage"];
	if (n !== void 0) return n > 0;
	let r = e["compressor.power"];
	return r === void 0 ? void 0 : r > 100;
}
function Vt(e, t, n = ct) {
	let r = e["unit.on_off"];
	if (r === !1 || Rt(r, n.off)) return "off";
	let i = e["compressor.mode"];
	if (i === !0 || Rt(i, n.defrost)) return "defrost";
	let a = Bt(e);
	if (a === void 0) return "standby";
	let o = e["unit.summer"] === !0;
	return a ? e["dhw.demand"] === !0 ? "dhw" : o && t.active_cooling === !0 ? "active_cooling" : "heating" : o && zt(e["production.pump"]) && t.passive_cooling === !0 ? "passive_cooling" : "standby";
}
function Ht(e) {
	return e !== void 0 && (Nt(e) === !1 || pt({ state: e.state.trim().toLowerCase() }));
}
var Ut = (e) => e === !0;
// src/calc/circuits.ts
function Wt(e, t, n, r, i = !0) {
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
	return i && !zt(r["brine.pump"]) && a.delete("brine"), {
		valve26: e === "dhw" ? "dhw" : "production",
		valve14: e === "active_cooling" ? "reversed" : "normal",
		valves2728: (e === "passive_cooling" || e === "defrost") && o ? "exchanger" : "closed",
		active: a
	};
}
// src/lib/config.ts
var Gt = /^[a-z][a-z0-9_]*\.[a-z0-9_]+$/;
function O(e, t) {
	let n = e;
	for (let e of t.split(".")) {
		if (typeof n != "object" || !n || !Object.hasOwn(n, e)) return;
		n = n[e];
	}
	return n;
}
function Kt(e) {
	if (typeof e != "string") return;
	let t = e.trim();
	return Gt.test(t) ? t : void 0;
}
function qt(e, t) {
	return Kt(O(e, t));
}
// src/lib/options.ts
var Jt = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, Yt = /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|var)\((.*)\)$/i, Xt = /^[#a-zA-Z0-9(),.%\s/+-]+$/, Zt = /* @__PURE__ */ new Set(/* @__PURE__ */ "aliceblue.antiquewhite.aqua.aquamarine.azure.beige.bisque.black.blanchedalmond.blue.blueviolet.brown.burlywood.cadetblue.chartreuse.chocolate.coral.cornflowerblue.cornsilk.crimson.cyan.darkblue.darkcyan.darkgoldenrod.darkgray.darkgreen.darkgrey.darkkhaki.darkmagenta.darkolivegreen.darkorange.darkorchid.darkred.darksalmon.darkseagreen.darkslateblue.darkslategray.darkslategrey.darkturquoise.darkviolet.deeppink.deepskyblue.dimgray.dimgrey.dodgerblue.firebrick.floralwhite.forestgreen.fuchsia.gainsboro.ghostwhite.gold.goldenrod.gray.green.greenyellow.grey.honeydew.hotpink.indianred.indigo.ivory.khaki.lavender.lavenderblush.lawngreen.lemonchiffon.lightblue.lightcoral.lightcyan.lightgoldenrodyellow.lightgray.lightgreen.lightgrey.lightpink.lightsalmon.lightseagreen.lightskyblue.lightslategray.lightslategrey.lightsteelblue.lightyellow.lime.limegreen.linen.magenta.maroon.mediumaquamarine.mediumblue.mediumorchid.mediumpurple.mediumseagreen.mediumslateblue.mediumspringgreen.mediumturquoise.mediumvioletred.midnightblue.mintcream.mistyrose.moccasin.navajowhite.navy.oldlace.olive.olivedrab.orange.orangered.orchid.palegoldenrod.palegreen.paleturquoise.palevioletred.papayawhip.peachpuff.peru.pink.plum.powderblue.purple.rebeccapurple.red.rosybrown.royalblue.saddlebrown.salmon.sandybrown.seagreen.seashell.sienna.silver.skyblue.slateblue.slategray.slategrey.snow.springgreen.steelblue.tan.teal.thistle.tomato.turquoise.violet.wheat.white.whitesmoke.yellow.yellowgreen.transparent.currentcolor".split("."));
function Qt(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) if (e[n] === "(" && t++, e[n] === ")" && (t--, t < 0 || t === 0 && n !== e.length - 1)) return !1;
	return t === 0;
}
function $t(e) {
	let t = e.trim();
	if (t.length === 0 || t.length > 100 || !Xt.test(t)) return !1;
	if (Jt.test(t) || Zt.has(t.toLowerCase())) return !0;
	let n = Yt.exec(t);
	if (n === null || !Qt(t)) return !1;
	if (n[1]?.toLowerCase() !== "var") return !0;
	let [r, ...i] = (n[2] ?? "").split(",");
	return /^\s*--[a-zA-Z0-9-]+\s*$/.test(r ?? "") && (i.length === 0 || $t(i.join(",")));
}
var en = (e) => e == null;
function tn(e) {
	switch (e.kind) {
		case "number": return b.number(String(e.min), String(e.max));
		case "color": return b.color;
		case "boolean": return b.boolean;
		case "choice": return b.choice(e.choices);
		case "list": return b.list;
	}
}
var nn = (e) => e === null || [
	"string",
	"number",
	"boolean"
].includes(typeof e);
function rn(e) {
	return e.map((e) => typeof e == "boolean" ? e ? "on" : "off" : e === null ? "" : String(e)).filter((e) => e.trim() !== "");
}
function an(e, t) {
	switch (e.kind) {
		case "number": return typeof t == "number" && Number.isFinite(t) && t >= e.min && t <= e.max;
		case "color": return typeof t == "string" && $t(t);
		case "boolean": return typeof t == "boolean";
		case "choice": return typeof t == "string" && e.choices.includes(t);
		case "list": return Array.isArray(t) && t.every(nn);
	}
}
function on(e, t) {
	let n = t.split(".").slice(0, -1);
	for (let t = 1; t <= n.length; t++) {
		let r = n.slice(0, t).join("."), i = O(e, r);
		if (!en(i) && (typeof i != "object" || Array.isArray(i))) return r;
	}
}
function sn(e, t) {
	let n = t.flatMap((t) => {
		let n = on(e, t.path);
		if (n !== void 0) return [b.invalid(n, b.object)];
		let r = O(e, t.path);
		return en(r) || an(t, r) ? [] : [b.invalid(t.path, tn(t))];
	});
	return [...new Set(n)];
}
function cn(e, t) {
	let n = O(e, t.path);
	if (t.kind === "list" && Array.isArray(n) && an(t, n)) {
		let e = rn(n);
		return e.length > 0 ? e : t.default;
	}
	return en(n) || !an(t, n) ? t.default : n;
}
// src/diagram/colors.ts
var ln = [
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
], un = "var(--disabled-text-color)", dn = "#8a8a8a", fn = `var(--ecogeo-coil-muted, ${un})`, pn = (e) => e ? un : dn, mn = (e) => typeof e == "object" && !!e && !Array.isArray(e), hn = (e) => typeof e == "string" && sn({ color: e }, [{
	kind: "color",
	path: "color",
	default: ""
}]).length === 0, gn = (e) => e.map((e) => ({
	temperature: e.temperature,
	color: e.color.trim()
}));
function _n(e) {
	let t = O(e, "colors");
	if (t == null) return [];
	if (!Array.isArray(t) || t.length < 2 || t.length > 8) return [S.colors];
	let n = t;
	if (!n.every((e) => mn(e) && typeof e.temperature == "number" && Number.isFinite(e.temperature) && hn(e.color))) return [S.colors];
	let r = gn(n).map((e) => e.temperature);
	return r.every((e, t) => t === 0 || e > (r[t - 1] ?? 0)) ? [] : [S.colors];
}
function vn(e) {
	let t = O(e, "colors");
	return Array.isArray(t) && _n(e).length === 0 ? gn(t) : ln;
}
function yn(e, t = ln) {
	let n = t[0], r = t[t.length - 1];
	if (e === void 0 || !Number.isFinite(e) || n === void 0 || r === void 0) return un;
	if (e <= n.temperature) return n.color;
	if (e >= r.temperature) return r.color;
	let i = t.findIndex((t) => t.temperature >= e), a = t[i - 1], o = t[i];
	if (a === void 0 || o === void 0) return r.color;
	let s = Math.round((e - a.temperature) / (o.temperature - a.temperature) * 1e3) / 10;
	return s <= 0 ? a.color : s >= 100 ? o.color : `color-mix(in srgb, ${o.color} ${String(s)}%, ${a.color})`;
}
// src/config/variants.ts
var bn = [
	"active_cooling",
	"passive_cooling",
	"htr",
	"backup_heater"
], xn = [
	1,
	2,
	3,
	4
];
function Sn(e) {
	return {
		active_cooling: e === 3 || e === 4,
		passive_cooling: e === 2 || e === 4,
		htr: !0,
		backup_heater: !0
	};
}
function Cn(e, t) {
	return {
		...Sn(e),
		...t
	};
}
// src/config/options.ts
var wn = ["B", "C"], Tn = [
	"air",
	"ground",
	"hybrid"
], En = [
	"external",
	"internal",
	"unused",
	"none"
], Dn = ["simplified", "full"], On = {
	kind: "choice",
	path: "model",
	default: "B",
	choices: wn
}, kn = {
	kind: "choice",
	path: "source",
	default: "ground",
	choices: Tn
}, An = {
	kind: "choice",
	path: "dhw",
	default: "external",
	choices: En
}, jn = {
	kind: "choice",
	path: "detail",
	default: "simplified",
	choices: Dn
}, Mn = {
	kind: "choice",
	path: "exchanger_fill",
	default: "gradient",
	choices: ["gradient", "none"]
}, Nn = {
	kind: "choice",
	path: "layout",
	default: "auto",
	choices: [
		"auto",
		"full",
		"compact"
	]
}, Pn = [
	On,
	kn,
	An,
	jn,
	Mn,
	Nn
], Fn = [
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
], In = (e) => e === "C" ? "internal" : "external", k = (e) => e == null, Ln = (e) => k(e) || typeof e == "string" && e.trim() === "", Rn = (e) => typeof e == "object" && !!e && !Array.isArray(e), zn = /^[a-z0-9_]+$/, Bn = (e) => typeof e == "string" && e.trim() === "none";
function Vn(e) {
	let t = O(e, "prefix");
	return Ln(t) ? void 0 : t.trim();
}
function Hn(e) {
	let t = O(e, "variant");
	return xn.find((e) => e === t) ?? 4;
}
function Un(e) {
	let t = cn(e, On), n = !k(O(e, "dhw"));
	return {
		model: t,
		source: cn(e, kn),
		dhw: n ? cn(e, An) : In(t)
	};
}
var Wn = (e) => cn(e, jn), Gn = (e) => cn(e, Mn), Kn = (e) => cn(e, Nn), qn = ["off", "defrost"], Jn = (e) => Array.isArray(e) && e.length > 0 && e.every((e) => typeof e == "string" && e.trim() !== "");
function Yn(e) {
	let t = O(e, "states"), n = Rn(t) ? t : {}, r = (e) => {
		let t = n[e];
		return Jn(t) ? t : ct[e];
	};
	return {
		off: r("off"),
		defrost: r("defrost")
	};
}
function Xn(e) {
	let t = O(e, "features");
	if (!Rn(t)) return {};
	let n = {};
	for (let e of bn) {
		let r = t[e];
		(r === !0 || r === !1 || r === "unused") && (n[e] = r);
	}
	return n;
}
var Zn = (e) => e === !0 || e === !1 || e === "unused";
function Qn(e) {
	let t = O(e, "entities");
	return Rn(t) ? new Set($n(t).filter(([e, t]) => kt.has(e) && Bn(t)).map(([e]) => e)) : /* @__PURE__ */ new Set();
}
function $n(e, t = "") {
	return Object.entries(e).flatMap(([e, n]) => {
		let r = t === "" ? e : `${t}.${e}`;
		return Rn(n) ? $n(n, r) : [[r, n]];
	});
}
function er(e) {
	let t = O(e, "variant");
	return k(t) || xn.some((e) => e === t) ? [] : [b.invalid("variant", S.integer(String(xn[0]), String(xn[xn.length - 1])))];
}
function tr(e) {
	let t = O(e, "prefix");
	return Ln(t) || typeof t == "string" && zn.test(t.trim()) ? [] : [b.invalid("prefix", S.prefix)];
}
function nr(e) {
	let t = O(e, "features");
	return k(t) ? [] : Rn(t) ? Object.entries(t).flatMap(([e, t]) => bn.some((t) => t === e) ? k(t) || Zn(t) ? [] : [S.featureState(e)] : [S.unknownFeature(e, bn)]) : [b.invalid("features", b.object)];
}
function rr(e) {
	let t = O(e, "states");
	return k(t) ? [] : Rn(t) ? Object.entries(t).flatMap(([e, t]) => qn.some((t) => t === e) ? k(t) || Jn(t) ? [] : [S.statesList(e)] : [S.statesKey(e)]) : [b.invalid("states", b.object)];
}
function ir(e) {
	let t = O(e, "entities");
	return k(t) ? [] : Rn(t) ? $n(t).flatMap(([e, t]) => Ln(t) ? [] : kt.has(e) ? Kt(t) !== void 0 || Bn(t) ? [] : [S.notEntityId(e)] : [S.unknownRole(e)]) : [b.invalid("entities", b.object)];
}
function ar(e) {
	let t = O(e, "entities");
	return Rn(t) && $n(t).some(([, e]) => !Ln(e));
}
function or(e) {
	let t = Object.keys(e).filter((e) => !Fn.includes(e)).map((e) => S.unknownOption(e)), n = sn(e, Pn), r = [
		...t,
		...n,
		...er(e),
		...tr(e),
		...nr(e),
		...ir(e),
		...rr(e),
		..._n(e)
	];
	if (sn(e, [On, An]).length === 0 && !k(O(e, "dhw"))) {
		let { model: t, dhw: n } = Un(e);
		(t === "B" && n === "internal" || t === "C" && (n === "external" || n === "none")) && r.push(S.dhwMismatch(n, t));
	}
	return r;
}
// src/config/sample.ts
var sr = (e) => `ecogeo_sample.${e.replace(".", "_")}`, cr = {
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
}, lr = "2026-01-01T12:00:00Z", ur = Object.fromEntries(At.map((e) => [e, sr(e)])), dr = Object.fromEntries(At.map((e) => {
	let t = kt.get(e)?.unit, n = sr(e);
	return [n, {
		entity_id: n,
		state: cr[e],
		last_updated: lr,
		attributes: t === void 0 ? {} : { unit_of_measurement: t }
	}];
}));
// src/config/resolve.ts
function fr(e, t, n = Qn(e)) {
	return Object.fromEntries(D.map((r) => [r.path, qt(e, `entities.${r.path}`) ?? (t === void 0 || n.has(r.path) ? void 0 : jt(r, t))]));
}
var pr = (e) => Vn(e) === void 0 && !ar(e);
function mr(e) {
	let t = Vn(e), n = Hn(e), r = pr(e), i = Qn(e);
	return {
		...Un(e),
		detail: Wn(e),
		exchangerFill: Gn(e),
		layout: Kn(e),
		variant: n,
		prefix: t,
		states: Yn(e),
		colors: vn(e),
		features: Cn(n, Xn(e)),
		entities: r ? ur : fr(e, t, i),
		notPresent: i,
		sample: r
	};
}
// src/diagram/component-info.ts
var hr = {
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
}, gr = [
	"compressor.speed",
	"compressor.percentage",
	"compressor.power"
];
function _r(e, t) {
	return e === 11 ? gr.find((e) => t?.entities[e] !== void 0) ?? gr[0] : hr[e];
}
var vr = "source.fan_speed", yr = "dhw.temperature", br = (e, t) => e === void 0 || t?.onTap === void 0 ? void 0 : t.entities[e];
function xr(e, t) {
	return e === void 0 || t === void 0 ? {
		role: y,
		tabindex: y,
		click: y,
		keydown: y
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
var Sr = o`
  outline: 2px solid var(--primary-color, currentColor);
  outline-offset: 2px;
  filter: drop-shadow(0 0 2px var(--primary-color, currentColor));
`, Cr = {
	width: 1e3,
	height: 620
}, A = {
	x: 240,
	y: 130,
	width: 520,
	height: 475
}, j = {
	x: 408,
	y: 138,
	width: 182,
	height: 66
}, wr = {
	x: 495,
	y: 185
}, Tr = [[-75, -13], [-75, 13]], M = {
	x: 806,
	y: A.y,
	width: 168,
	height: 180,
	dome: 14
}, Er = M.x + M.width / 2, Dr = M.y + 62, Or = M.y + 146, kr = 50, Ar = M.x + 14;
function jr() {
	let { x: e, y: t, width: n, height: r, dome: i } = M, a = n / 2;
	return `M${String(e)} ${String(t + i)} A${String(a)} ${String(i)} 0 0 1 ${String(e + n)} ${String(t + i)} V${String(t + r - i)} A${String(a)} ${String(i)} 0 0 1 ${String(e)} ${String(t + r - i)} Z`;
}
var N = {
	x: 26,
	y: A.y,
	width: 124,
	height: 210,
	fanX: 88,
	fanY: A.y + 162,
	fanRadius: 34,
	coil: {
		x: 36,
		y: A.y + 16,
		width: 104,
		height: 74
	},
	fins: {
		x: 52,
		step: 6,
		count: 13,
		y0: A.y + 20,
		y1: A.y + 86
	},
	slats: {
		y0: A.y + 134,
		step: 9,
		count: 8
	},
	dividerY: A.y + 114,
	captionX: 88,
	captionY: A.y - 8,
	passes: {
		y0: A.y + 30,
		step: 15,
		count: 4,
		left: 44,
		right: 132
	}
}, Mr = N.x + N.width, P = {
	top: N.passes.y0,
	bottom: N.passes.y0 + (N.passes.count - 1) * N.passes.step
}, F = {
	downX: 166,
	upX: 106,
	depth: 140
}, Nr = {
	start: 8,
	end: 220
}, I = {
	ground: A.y,
	hybrid: N.y + N.height + 70
}, Pr = {
	x: (F.downX + F.upX) / 2,
	y: {
		ground: I.ground + F.depth + 28,
		hybrid: I.hybrid + F.depth + 28
	}
}, L = (e, t, n, r, i, a, o = {}) => ({
	item: e,
	kind: t,
	x: n,
	y: r,
	rotation: i,
	tag: a,
	...o
}), Fr = [
	L(1, "port", 270, 130, 0, [
		-7,
		-8,
		"end"
	]),
	L(2, "port", 312, 130, 0, [
		-7,
		-8,
		"end"
	]),
	L(3, "port", 630, 130, 0, [
		-7,
		-8,
		"end"
	]),
	L(4, "port", 690, 130, 0, [
		-7,
		-8,
		"end"
	]),
	L(5, "port", 722, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "external" }),
	L(6, "port", 748, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "external" }),
	L(47, "port", 440, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "internal" }),
	L(48, "port", 490, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "internal" }),
	L(49, "port", 540, 130, 0, [
		-7,
		-8,
		"end"
	], { dhw: "internal" }),
	L(7, "exchanger", 572, 382, 0, [
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
	L(8, "exchanger", 432, 382, 0, [
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
	L(9, "exchanger", 373, 273, 0, [
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
	L(11, "compressor", 510, 250, 0, [
		0,
		-26,
		"middle"
	]),
	L(12, "expansion_valve", 527, 416, 0, [
		0,
		-14,
		"middle"
	]),
	L(13, "filter_dryer", 487, 416, 0, [
		0,
		-14,
		"middle"
	]),
	L(14, "inversion_valve", 430, 296, 0, [
		-16,
		22,
		"end"
	], { feature: "active_cooling" }),
	L(29, "probe_t", 542, 234, 0, [
		0,
		-14,
		"middle"
	]),
	L(30, "probe_t", 430, 234, 0, [
		0,
		-14,
		"middle"
	]),
	L(35, "transducer_p", 564, 234, 0, [
		0,
		-14,
		"middle"
	]),
	L(36, "transducer_p", 474, 234, 0, [
		0,
		-14,
		"middle"
	]),
	L(39, "pressure_switch", 586, 234, 0, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	L(40, "pressure_switch", 452, 234, 0, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	L(41, "service_outlet", 464, 406, 0, [
		0,
		28,
		"middle"
	], { detail: "full" }),
	L(41, "service_outlet", 620, 270, 90, [
		0,
		14,
		"middle"
	], { detail: "full" }),
	L(10, "exchanger", 520, 470, 0, [
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
	L(15, "pump", 385, 416, 0, [
		0,
		-19,
		"middle"
	]),
	L(16, "pump", 690, 300, 90, [
		19,
		4,
		"start"
	]),
	L(17, "pump", 340, 226, 90, [
		-14,
		4,
		"end"
	], {
		feature: "htr",
		dhw: "any"
	}),
	L(18, "vessel", 725, 520, 0, [
		-16,
		4,
		"end"
	], { detail: "full" }),
	L(19, "vessel", 368, 556, 0, [
		-16,
		4,
		"end"
	], { detail: "full" }),
	L(20, "safety_valve", 741, 440, 90, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	L(21, "safety_valve", 384, 520, 90, [
		0,
		-14,
		"middle"
	], { detail: "full" }),
	L(22, "valve", 340, 256, 0, [
		-10,
		4,
		"end"
	], {
		feature: "htr",
		dhw: "any"
	}),
	L(23, "drain_valve", 630, 572, 0, [
		14,
		4,
		"start"
	], { detail: "full" }),
	L(24, "drain_valve", 404, 572, 0, [
		14,
		4,
		"start"
	], { detail: "full" }),
	L(25, "drain_valve", 340, 318, 0, [
		-10,
		4,
		"end"
	], {
		feature: "htr",
		dhw: "any"
	}),
	L(26, "valve3", 270, 172, 270, [
		-14,
		22,
		"end"
	], {
		dhw: "any",
		unusedMuted: !0
	}),
	L(27, "valve3", 350, 416, 0, [
		0,
		-24,
		"middle"
	], { feature: "passive_cooling" }),
	L(28, "valve3", 610, 416, 0, [
		0,
		-24,
		"middle"
	], { feature: "passive_cooling" }),
	L(31, "probe_t", 614, 228, 270, [
		0,
		-14,
		"middle"
	]),
	L(32, "probe_t", 674, 228, 270, [
		0,
		-14,
		"middle"
	]),
	L(33, "probe_t", 254, 228, 270, [
		0,
		-14,
		"middle"
	]),
	L(34, "probe_t", 296, 228, 270, [
		0,
		-14,
		"middle"
	]),
	L(37, "transducer_p", 709, 440, 270, [
		0,
		-14,
		"middle"
	]),
	L(38, "transducer_p", 352, 520, 270, [
		0,
		-14,
		"middle"
	]),
	L(44, "resistor", 270, 320, 90, [
		12,
		6,
		"start"
	], { feature: "backup_heater" }),
	L(45, "thermostat", 286, 282, 90, [
		0,
		-12,
		"middle"
	], { feature: "backup_heater" }),
	L(50, "tank", j.x + j.width / 2, j.y + j.height / 2, 0, [
		-96,
		-26,
		"end"
	], { dhw: "internal" }),
	L(51, "coil", wr.x, wr.y, 0, [
		-74,
		3,
		"middle"
	], { dhw: "internal" }),
	L(52, "service_outlet", 395, 162, 0, [
		-8,
		4,
		"end"
	], {
		dhw: "internal",
		detail: "full"
	}),
	L(53, "drain_valve", 599, 196, 270, [
		0,
		-12,
		"middle"
	], {
		dhw: "internal",
		detail: "full"
	}),
	L(54, "probe_t", 574, 171, 270, [
		26,
		-11,
		"start"
	], { dhw: "internal" })
], Ir = (e) => e.split(" ").map((e) => {
	let [t, n] = e.split(",").map(Number);
	return [t ?? 0, n ?? 0];
}), R = 85, Lr = 50, Rr = 226, zr = 206, Br = 234, Vr = 214, Hr = 12, Ur = N.coil.x + N.coil.width, Wr = N.passes.step / 2, Gr = (F.downX - F.upX) / 2;
function Kr(e) {
	let { y0: t, step: n, count: r, left: i, right: a } = N.passes, o = [[Ur, t]];
	for (let e = 0; e < r; e += 1) {
		let s = t + e * n;
		e % 2 == 0 ? (e > 0 && o.push([a, s]), o.push([i, s])) : o.push([i, s], e === r - 1 ? [Ur, s] : [a, s]);
	}
	return (e ? o.reverse() : o).map(([e, t]) => `${String(e)},${String(t)}`).join(" ");
}
function qr(e, t) {
	let { downX: n, upX: r, depth: i } = F, [a, o] = [(n + r) / 2, e + i];
	return t === "down" ? `${String(n)},${String(e)} ${String(n)},${String(o)} ${String(a)},${String(o)}` : `${String(a)},${String(o)} ${String(r)},${String(o)} ${String(r)},${String(e)}`;
}
var z = (...e) => e.map(([e, t]) => `${String(e)},${String(t)}`).join(" "), B = (e, t, n, r, i = {}) => ({
	id: e,
	circuit: t,
	points: Ir(n),
	temperatureRole: r,
	direction: 1,
	...i
}), Jr = ["production_dg1"], V = ["production_dg1", "production_dhw"], H = "production.outlet_temperature", U = "production.return_temperature", W = "production.pump", G = "brine.inlet_temperature", K = "brine.outlet_temperature", q = "brine.pump", Yr = "compressor.discharge_temperature", Xr = "compressor.suction_temperature", Zr = "refrigerant.condensation_temperature", Qr = "refrigerant.evaporation_temperature", J = "compressor.percentage", $r = "dhw.temperature", ei = "source.air_unit_outlet_temperature", ti = [
	"dhw_sup_b",
	"dhw_sup_c",
	"dhw_ret_b",
	"dhw_ret_c",
	"dhw_ext_in",
	"dhw_ext_coil",
	"dhw_ext_out"
], ni = [
	B("p1_stub", Jr, "270,130 270,118", H, { stub: !0 }),
	B("p2_stub", Jr, "312,118 312,130", U, { stub: !0 }),
	B("p1_up", Jr, "270,160 270,130", H, {
		dhw: "any",
		speedRole: W
	}),
	B("p1_direct", Jr, "270,184 270,130", H, {
		dhw: "none",
		speedRole: W
	}),
	B("p2_in", Jr, "312,130 312,198", U, { speedRole: W }),
	B("prod_44_26", V, "270,292 270,184", H, { speedRole: W }),
	B("prod_bypass44", V, "270,348 270,292", H, {
		bypass: "backup_heater",
		speedRole: W
	}),
	B("prod_8_44", V, "420,348 270,348", H, { speedRole: W }),
	B("prod_15_8", V, "397,416 420,416", U, { speedRole: W }),
	B("trunk", V, "312,198 312,416", U, { speedRole: W }),
	B("prod_27_in", V, "312,416 338,416", U, {
		through: "passive_cooling",
		speedRole: W,
		onlyWhen: { valves2728: "closed" }
	}),
	B("prod_27_15", V, "362,416 373,416", U, {
		through: "passive_cooling",
		speedRole: W
	}),
	B("prod_bypass27", V, "312,416 373,416", U, {
		bypass: "passive_cooling",
		speedRole: W
	}),
	B("prod_10_in", ["exchanger_10"], "312,416 312,492 508,492", U, {
		feature: "passive_cooling",
		speedRole: W
	}),
	B("prod_10_out", ["exchanger_10"], "508,448 350,448 350,428", H, {
		feature: "passive_cooling",
		speedRole: W
	}),
	B("prod_tap_a", V, "368,416 368,520", U, { stub: !0 }),
	B("prod_tap_b", V, "368,520 368,544", U, {
		stub: !0,
		detail: "full"
	}),
	B("prod_drain", V, "404,416 404,563", U, {
		stub: !0,
		detail: "full"
	}),
	B("dhw_sup_a", ["production_dhw"], "282,172 361,172", H, {
		dhw: "any",
		speedRole: W
	}),
	B("dhw_sup_b", ["dhw_coil"], "361,172 420,172", H, {
		dhw: "any",
		speedRole: W
	}),
	B("dhw_sup_c", ["dhw_coil"], "420,172 722,172 722,130", H, {
		dhw: "external",
		speedRole: W
	}),
	B("dhw_ret_c", ["dhw_coil"], "748,130 748,198 420,198", U, {
		dhw: "external",
		speedRole: W
	}),
	B("dhw_ret_b", ["dhw_coil"], "420,198 340,198", U, {
		dhw: "any",
		speedRole: W
	}),
	B("dhw_ret_a", ["production_dhw"], "340,198 312,198", U, {
		dhw: "any",
		speedRole: W
	}),
	B("htr_in", ["htr"], "340,198 340,214", $r, {
		feature: "htr",
		dhw: "any"
	}),
	B("htr_pump", ["htr"], "340,238 340,247", $r, {
		feature: "htr",
		dhw: "any"
	}),
	B("htr_to_9", ["htr"], "340,265 340,296 361,296", $r, {
		feature: "htr",
		dhw: "any"
	}),
	B("htr_drain", ["htr"], "340,296 340,309", $r, {
		feature: "htr",
		dhw: "any",
		stub: !0
	}),
	B("htr_riser", ["htr"], "361,250 361,172", $r, {
		feature: "htr",
		dhw: "any"
	}),
	B("dhw_ext_in", ["dhw_coil"], `722,130 722,50 ${String(Er + kr)},50 ${String(Er + kr)},${String(Dr)}`, H, {
		dhw: "external",
		speedRole: W
	}),
	B("dhw_ext_coil", ["dhw_coil"], `${String(Er + kr)},${String(Dr)} ${String(Er - kr)},${String(Or)}`, H, {
		dhw: "external",
		speedRole: W,
		shape: {
			kind: "helix",
			cx: Er,
			top: Dr,
			bottom: Or,
			rx: kr,
			turns: 4.5
		}
	}),
	B("dhw_ext_out", ["dhw_coil"], `${String(Er - kr)},${String(Or)} ${String(Ar)},${String(Or)} ${String(Ar)},85 748,85 748,130`, U, {
		dhw: "external",
		speedRole: W
	}),
	B("tap_47", ["dhw_coil"], "440,118 440,138", $r, {
		dhw: "internal",
		stub: !0
	}),
	B("tap_48", ["dhw_coil"], "490,138 490,118", $r, {
		dhw: "internal",
		stub: !0
	}),
	B("tap_49", ["dhw_coil"], "540,118 540,138", $r, {
		dhw: "internal",
		stub: !0
	}),
	B("src_out", ["brine"], z([630, 130], [630, R], [Br, R]), K, { speedRole: q }),
	B("src_in", ["brine"], z([Vr, Lr], [690, Lr], [690, 130]), G, { speedRole: q }),
	B("src_air_feed", ["brine"], z([Br, R], [Rr, R], [Rr, P.bottom], [Ur, P.bottom]), K, {
		source: ["air"],
		speedRole: q
	}),
	B("src_air_coil", ["brine"], Kr(!0), K, {
		source: ["air"],
		speedRole: q,
		bend: Wr
	}),
	B("src_air_exit", ["brine"], z([Ur, P.top], [zr, P.top], [zr, Lr], [Vr, Lr]), ei, {
		source: ["air"],
		speedRole: q
	}),
	B("src_gnd_feed", ["brine"], z([Br, R], [F.downX, R], [F.downX, I.ground]), K, {
		source: ["ground"],
		speedRole: q
	}),
	B("src_gnd_down", ["brine"], qr(I.ground, "down"), K, {
		source: ["ground"],
		speedRole: q,
		roundEnd: !0,
		bend: Gr
	}),
	B("src_gnd_up", ["brine"], qr(I.ground, "up"), G, {
		source: ["ground"],
		speedRole: q,
		bend: Gr
	}),
	B("src_gnd_exit", ["brine"], z([F.upX, I.ground], [F.upX, Lr], [Vr, Lr]), G, {
		source: ["ground"],
		speedRole: q
	}),
	B("src_hyb_feed", ["brine"], z([Br, R], [Rr, R], [Rr, P.top], [Ur, P.top]), K, {
		source: ["hybrid"],
		speedRole: q
	}),
	B("src_hyb_coil", ["brine"], Kr(!1), K, {
		source: ["hybrid"],
		speedRole: q,
		bend: Wr
	}),
	B("src_hyb_link", ["brine"], z([Ur, P.bottom], [F.downX, P.bottom], [F.downX, I.hybrid]), ei, {
		source: ["hybrid"],
		speedRole: q
	}),
	B("src_hyb_down", ["brine"], qr(I.hybrid, "down"), ei, {
		source: ["hybrid"],
		speedRole: q,
		roundEnd: !0,
		bend: Gr
	}),
	B("src_hyb_up", ["brine"], qr(I.hybrid, "up"), G, {
		source: ["hybrid"],
		speedRole: q,
		bend: Gr
	}),
	B("src_hyb_exit", ["brine"], z([F.upX, I.hybrid], [F.upX, I.hybrid - 15], [Hr, I.hybrid - 15], [Hr, Lr], [Vr, Lr]), G, {
		source: ["hybrid"],
		speedRole: q
	}),
	B("ref_discharge", ["refrigerant"], "496,250 385,250", Yr, {
		through: "htr",
		speedRole: J
	}),
	B("ref_9_14", ["refrigerant"], "385,296 416,296", Yr, {
		through: "htr",
		speedRole: J
	}),
	B("ref_discharge_direct", ["refrigerant"], "496,250 416,250 416,296", Yr, {
		bypass: "htr",
		speedRole: J
	}),
	B("ref_14_8", ["refrigerant"], "444,306 444,348", Yr, {
		through: "active_cooling",
		reversible: !0,
		speedRole: J
	}),
	B("ref_7_14", ["refrigerant"], "560,348 560,296 444,296", Xr, {
		through: "active_cooling",
		reversible: !0,
		speedRole: J
	}),
	B("ref_suction", ["refrigerant"], "444,286 610,286 610,250 524,250", Xr, {
		through: "active_cooling",
		speedRole: J
	}),
	B("ref_direct_8", ["refrigerant"], "416,296 444,296 444,348", Yr, {
		bypass: "active_cooling",
		speedRole: J
	}),
	B("ref_direct_suction", ["refrigerant"], "560,348 560,286 610,286 610,250 524,250", Xr, {
		bypass: "active_cooling",
		speedRole: J
	}),
	B("ref_8_13", ["refrigerant"], "444,416 473,416", Zr, {
		reversible: !0,
		speedRole: J
	}),
	B("ref_13_12", ["refrigerant"], "501,416 515,416", Zr, {
		reversible: !0,
		speedRole: J
	}),
	B("ref_12_7", ["refrigerant"], "539,416 560,416", Qr, {
		reversible: !0,
		speedRole: J
	}),
	B("ln4_a", ["brine"], "690,130 690,288", G, { speedRole: q }),
	B("ln4_b", ["brine"], "690,312 690,348", G, { speedRole: q }),
	B("br_feed7", ["brine"], "690,348 584,348", G, {
		speedRole: q,
		onlyWhen: { valves2728: "closed" }
	}),
	B("brine_7_28", ["brine"], "584,416 598,416", K, {
		through: "passive_cooling",
		speedRole: q,
		onlyWhen: { valves2728: "closed" }
	}),
	B("brine_28_ln3", ["brine"], "622,416 630,416", K, {
		through: "passive_cooling",
		speedRole: q
	}),
	B("brine_bypass28", ["brine"], "584,416 630,416", K, {
		bypass: "passive_cooling",
		speedRole: q
	}),
	B("ln3", ["brine"], "630,416 630,130", K, { speedRole: q }),
	B("br_10_in", ["exchanger_10"], "690,348 690,448 532,448", G, {
		feature: "passive_cooling",
		speedRole: q
	}),
	B("br_10_28", ["exchanger_10"], "532,492 610,492 610,428", K, {
		feature: "passive_cooling",
		speedRole: q
	}),
	B("brine_tap_a", ["brine"], "690,270 725,270 725,440", G, { stub: !0 }),
	B("brine_tap_b", ["brine"], "725,440 725,508", G, {
		stub: !0,
		detail: "full"
	}),
	B("brine_drain", ["brine"], "630,416 630,563", K, {
		stub: !0,
		detail: "full"
	})
], ri = [
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
], ii = [
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
], ai = (e, t) => t === "htr" && e.dhw === "none" ? !1 : e.features[t], oi = (e) => e.dhw === "unused" ? e.model === "C" ? "internal" : "external" : e.dhw, si = (e, t) => {
	let n = oi(t);
	return e === "any" ? n !== "none" : e === n;
};
function ci(e, t) {
	if (e.detail === "full" && t.detail !== "full" || e.source !== void 0 && !e.source.includes(t.source) || e.dhw !== void 0 && !si(e.dhw, t) || e.bypass !== void 0 && ai(t, e.bypass) !== !1 || e.through !== void 0 && ai(t, e.through) === !1) return "hidden";
	if (e.feature !== void 0) {
		let n = ai(t, e.feature);
		if (n === !1) return "hidden";
		if (n === "unused") return "muted";
	}
	return t.dhw === "unused" && e.dhw !== void 0 && (e.dhw !== "any" || e.unusedMuted === !0) ? "muted" : "normal";
}
function li(e, t) {
	return e.flatMap((e) => {
		let n = ci(e, t);
		return n === "hidden" ? [] : [{
			part: e,
			state: n
		}];
	});
}
var ui = (e) => li(Fr, e), di = (e) => li(ni, e), fi = (e, t) => (e.onlyWhen === void 0 || e.onlyWhen.valves2728 === t.valves2728) && e.circuit.some((e) => t.active.has(e)), pi = .35;
function mi(e) {
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
var hi = (e) => [...e.filter((e) => !e.front), ...e.filter((e) => e.front)];
function gi(e) {
	let t = (e) => String(Math.round(e * 100) / 100);
	return mi(e).map(({ front: e, curve: [n, r, i, a] }) => ({
		front: e,
		d: `M${t(n[0])} ${t(n[1])} C${t(r[0])} ${t(r[1])} ${t(i[0])} ${t(i[1])} ${t(a[0])} ${t(a[1])}`
	}));
}
function _i(e, t) {
	let n = yi(e, 0), r = [`M${String(n[0])} ${String(n[1])}`];
	for (let n = 1; n < e.length; n += 1) {
		let [i, a, o] = [
			yi(e, n - 1),
			yi(e, n),
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
var vi = (e, t) => e[0] === t[0] && e[1] === t[1];
function yi(e, t) {
	let n = e[t];
	if (n === void 0) throw Error(`No point ${String(t)}`);
	return n;
}
var bi = (e) => e.slice(1).map((t, n) => [yi(e, n), t]), xi = (e, t, n) => e >= Math.min(t, n) && e <= Math.max(t, n);
function Si(e, t = [], n = 7) {
	let r = [], i, a = (e) => {
		r.push(i === void 0 ? `M${String(e[0])} ${String(e[1])}` : `L${String(e[0])} ${String(e[1])}`), i = e;
	}, o = (e) => {
		r.push(`M${String(e[0])} ${String(e[1])}`), i = e;
	};
	a(yi(e, 0));
	for (let [r, i] of bi(e)) {
		let e = Math.sign(i[0] - r[0]), s = Math.sign(i[1] - r[1]), c = Math.abs(i[0] - r[0]) + Math.abs(i[1] - r[1]), l = t.filter((e) => Ci(e, r, i) && !vi(e, r) && !vi(e, i)).sort((e, t) => Math.abs(e[0] - r[0]) + Math.abs(e[1] - r[1]) - (Math.abs(t[0] - r[0]) + Math.abs(t[1] - r[1])));
		for (let t of l) {
			let l = Math.abs(t[0] - r[0]) + Math.abs(t[1] - r[1]);
			l > n && a([t[0] - e * n, t[1] - s * n]), o(c - l > n ? [t[0] + e * n, t[1] + s * n] : i);
		}
		a(i);
	}
	return r.join(" ");
}
var Ci = (e, t, n) => t[0] === n[0] && e[0] === t[0] && xi(e[1], t[1], n[1]) || t[1] === n[1] && e[1] === t[1] && xi(e[0], t[0], n[0]);
function wi(e, t) {
	return ri.filter((n) => n.under === e && t.has(n.over) && t.has(n.under)).map((e) => e.at);
}
function Ti(e, t, n) {
	return e === "auto" ? t === void 0 || !(t > 0) ? !1 : t < 640 + (n ? 24 : 0) : e === "compact";
}
var Ei = {
	pipe: 3,
	outline: 2
}, Di = 2, Oi = 1.25, ki = (e) => Math.ceil(e * 10 - 1e-9) / 10;
function Ai(e) {
	if (e === void 0 || !(e > 0)) return Ei;
	let t = e / 1e3;
	return {
		pipe: Math.max(Ei.pipe, ki(Di / t)),
		outline: Math.max(Ei.outline, ki(Oi / t))
	};
}
// src/diagram/pipes.ts
var ji = 1.2, Mi = .6, Ni = [
	"tap_47",
	"tap_48",
	"tap_49"
], Pi = [
	"prod_27_15",
	"prod_15_8",
	"prod_tap_a",
	"prod_tap_b",
	"prod_drain"
];
function Fi(e) {
	if (e !== void 0 && e > 0) return Math.min(8, Math.max(Mi, ji * 100 / e));
}
var Ii = {
	"compressor.discharge_temperature": "compressor.suction_temperature",
	"compressor.suction_temperature": "compressor.discharge_temperature",
	"refrigerant.condensation_temperature": "refrigerant.evaporation_temperature",
	"refrigerant.evaporation_temperature": "refrigerant.condensation_temperature"
}, Li = (e, t) => ti.includes(e.id) && Ri(t), Ri = (e) => e.active.has("htr") && !e.active.has("production_dhw");
function zi(e, t) {
	return Li(e, t.circuits) ? "dhw.temperature" : e.reversible === !0 && t.mode === "active_cooling" ? Ii[e.temperatureRole] ?? e.temperatureRole : (t.mode === "passive_cooling" || t.mode === "defrost") && t.circuits.valves2728 === "exchanger" && Pi.includes(e.id) ? "production.outlet_temperature" : e.temperatureRole;
}
function Bi(e, t, n) {
	return t === "muted" && n === "defrost" && e.feature === "passive_cooling" ? "normal" : t;
}
var Vi = (e, t) => {
	let n = e[t];
	return n === !0 ? 3 : Fi(typeof n == "number" ? n : void 0);
}, Hi = (e, t) => {
	let n = e[t];
	return typeof n == "number" ? n : void 0;
};
function Ui(e, t, n) {
	let { mode: r, circuits: i, readings: a, stops: o } = n, s = Ni.includes(e.id), c = Bi(e, t, r), l = s || fi(e, i), u = Hi(a, zi(e, n)), d = c === "muted" || !l || u === void 0, f = e.direction === -1 != (e.reversible === !0 && r === "active_cooling"), p = {
		color: d ? un : yn(u, o),
		muted: d,
		reversed: f
	};
	if (!l || c === "muted" || e.stub === !0 || s) return {
		...p,
		animated: !1
	};
	let m = Li(e, i) || e.speedRole === void 0 && e.circuit.includes("htr") ? 3 : e.speedRole === void 0 ? void 0 : Vi(a, e.speedRole);
	return m === void 0 ? {
		...p,
		animated: !1
	} : {
		...p,
		animated: !0,
		duration: m
	};
}
var Wi = (e) => yn(Hi(e.readings, "dhw.temperature"), e.stops);
function Gi(e) {
	let { circuits: t, readings: n, stops: r } = e;
	return Ri(t) ? yn(Hi(n, "dhw.temperature"), r) : t.active.has("dhw_coil") ? yn(Hi(n, "production.outlet_temperature"), r) : un;
}
// src/diagram/symbols.ts
var Ki = .55;
function qi(e, t, n) {
	let r = -t - 9, i = t + 9;
	return v`<path class="exchanger-fill" data-half=${e} d=${e === "left" ? `M0 ${String(r)} H-16 A4 4 0 0 0 -20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 0 -16 ${String(i)} H0 Z` : `M0 ${String(r)} H16 A4 4 0 0 1 20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 1 16 ${String(i)} H0 Z`} fill=${n} fill-opacity=${Ki} stroke="none" />`;
}
var Ji = (e, t) => v`<text class="glyph" text-anchor="middle" dominant-baseline="central" font-size="9" fill="currentColor" stroke="none" transform="rotate(${-t})">${e}</text>`, Yi = {
	kind: "helix",
	cx: 2,
	top: -60,
	bottom: 60,
	rx: 11,
	turns: 7.5
};
function Xi() {
	let e = j.x + 2 - wr.x, t = gi(Yi), { cx: n, rx: r, top: i, bottom: a } = Yi, o = Tr[0][1], s = Tr[1][1], c = r - n;
	return v`<g transform="matrix(0 -1 1 0 0 0)">${hi(t).map((e) => v`<path data-half=${e.front ? "front" : "back"} stroke-linecap=${e.front ? "round" : "butt"} d=${e.d} opacity=${e.front ? y : pi} />`)}</g><path style="stroke-width: var(--pipe-width, 3)" d="M${e} ${o} H${i} M${a} ${c} V${s} H${e}" />`;
}
var Zi = "M9 -10.7 L-13 -3 M9 10.7 L-13 3", Qi = (e, t) => v`<path d="M0 ${t} V${e}" />`, $i = (e, t) => v`<path d="${e}" fill=${t ? "currentColor" : "none"} />`;
function ea(e, t) {
	let n = t.rotation ?? 0;
	switch (e) {
		case "pump": return v`<circle r="12" /><path d="M-5 -7 V7 L8 0 Z" fill="currentColor" />`;
		case "valve3": {
			let e = t.open ?? ["l", "r"];
			return v`${$i("M-12 -6 V6 L0 0 Z", e.includes("l"))}${$i("M12 -6 V6 L0 0 Z", e.includes("r"))}${$i("M-6 12 H6 L0 0 Z", e.includes("d"))}<rect x="-4" y="-21" width="8" height="8" /><path d="M0 -13 V-8" />`;
		}
		case "inversion_valve": return v`<rect x="-10" y="-14" width="20" height="28" rx="3" /><path d="M-14 0 H-10 M10 -10 H14 M10 0 H14 M10 10 H14" />${t.reversed === !0 ? v`<path d="M-14 0 H14 M14 10 H5 V-10 H14" />` : v`<path d="M-14 0 H-5 V10 H14 M14 0 H5 V-10 H14" />`}`;
		case "probe_t": return v`<circle r="9" />${Qi(16, 9)}${Ji("T", n)}`;
		case "transducer_p": return v`<circle r="9" />${Qi(16, 9)}${Ji("P", n)}`;
		case "pressure_switch": return v`<rect x="-7" y="-7" width="14" height="14" />${Qi(16, 7)}${Ji("P", n)}`;
		case "thermostat": return v`<rect x="-7" y="-7" width="14" height="14" />${Qi(16, 7)}${Ji("T", n)}`;
		case "exchanger": {
			let e = t.size ?? 34, n = t.fills;
			return v`${n === void 0 ? y : v`${qi("left", e, n.left)}${qi("right", e, n.right)}`}<rect x="-20" y="${-e - 9}" width="40" height="${2 * e + 18}" rx="4" /><path d="M-12 ${-e} V${e} M12 ${-e} V${e}" /><circle cx="-12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="-12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" />`;
		}
		case "compressor": return v`<circle r="14" /><path class="compressor-lines" d="${Zi}" />`;
		case "vessel": return v`<circle r="12" /><path d="M-12 2 H12" />`;
		case "safety_valve": return v`<path d="M0 16 V6 M-6 6 H6 L0 -4 Z M0 -4 L-3 -7 L3 -10 L0 -13" />`;
		case "valve": return v`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "drain_valve": return v`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "resistor": return v`<rect x="-28" y="-6" width="56" height="12" rx="2" /><path d="M-18 -6 V6 M18 -6 V6" />`;
		case "filter_dryer": return v`<rect x="-14" y="-5" width="28" height="10" rx="5" />`;
		case "expansion_valve": return v`<path d="M-12 -6 V6 L0 0 L12 -6 V6 L0 0 Z" />`;
		case "service_outlet": return v`<rect x="-3" y="-3" width="6" height="6" />${Qi(10, 3)}`;
		case "port": return v`<rect x="-5" y="-6" width="10" height="6" />`;
		case "tank": return v`<rect class="tank-body" data-dhw-tank="internal" x=${-j.width / 2} y=${-j.height / 2} width=${j.width} height=${j.height} rx="14" fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />`;
		case "coil": return Xi();
	}
}
function ta(e, t = {}) {
	return v`<g class="symbol ${e}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${t.rotation ?? 0})">${ea(e, t)}</g>`;
}
// src/diagram/cabinet.ts
var na = o`
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
    ${Sr}
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
function ra(e, t) {
	return e === 26 ? t.valve26 === "dhw" ? ["l", "d"] : ["l", "r"] : t.valves2728 === "exchanger" ? ["d", "r"] : ["l", "r"];
}
function ia(e, t, n, r, i) {
	let { part: a } = e, { circuits: o } = t, s = Bi(a, e.state, t.mode), [c, l, u] = a.tag, d = ot(a.item), f = xr(br(_r(a.item, r), r), r?.onTap);
	return v`<g class="symbol-group ${s}" data-item=${a.item} data-kind=${a.kind} aria-label=${d} role=${f.role} tabindex=${f.tabindex} @click=${f.click} @keydown=${f.keydown} style=${a.kind === "coil" ? `color: ${la(t)}` : y}>
    <title>${d}</title>
    <g transform="translate(${a.x} ${a.y})">${ta(a.kind, {
		rotation: a.rotation,
		size: a.size,
		open: a.kind === "valve3" ? ra(a.item, o) : void 0,
		reversed: a.kind === "inversion_valve" ? o.valve14 === "reversed" : void 0,
		fills: i
	})}</g>
    ${n === "full" ? v`<text class="item" x=${a.x + c} y=${a.y + l} text-anchor=${u ?? "start"}>${a.item}</text>` : y}
  </g>`;
}
function aa(e, t, n) {
	let r = gi(t), i = n.muted ? y : `stroke: ${n.color}`;
	return v`<g class="helix ${n.muted ? "muted" : ""}" data-segment=${e.id} style=${i}>
    ${hi(r).map((e) => v`<path class="pipe ${n.muted ? "muted" : ""}" data-half=${e.front ? "front" : "back"} style=${i} stroke-linecap=${e.front ? "round" : "butt"} opacity=${e.front ? y : pi} d=${e.d} />`)}
    ${n.animated ? v`<path class="flow ${n.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(n.duration)}s" d=${r.filter((e) => e.front).map((e) => e.d).join(" ")} />` : y}
  </g>`;
}
function oa(e, t, n, r, i) {
	if (e.shape !== void 0) return aa(e, e.shape, t);
	let a = e.bend === void 0 ? Si(e.points, n, r) : _i(e.points, e.bend);
	return v`<path class="pipe ${t.muted ? "muted" : ""}" data-segment=${e.id} style=${t.muted ? y : `stroke: ${t.color}`} stroke-linecap=${e.roundEnd === !0 ? "round" : y} d=${a} />${t.muted && i !== void 0 && ua.has(e.id) ? v`<path class="pipe-inside" data-inside=${e.id} clip-path="url(#${i})" d=${a} />` : y}${t.animated ? v`<path class="flow ${t.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(t.duration)}s" d=${a} />` : y}`;
}
function sa(e, t, n, r) {
	let i = (e) => e.map((e) => n.get(e)).find((e) => e !== void 0), a = e.reversible === !0 && r === "active_cooling", [o, s] = a ? [e.leaving, e.entering] : [e.entering, e.leaving], c = i(o), l = i(s), u = (c?.muted ?? !0) && (l?.muted ?? !0), d = (e) => u ? un : e?.color ?? "var(--disabled-text-color)", f = e.enters === "top" !== a;
	return {
		id: t,
		y1: +!f,
		y2: +!!f,
		start: d(c),
		end: d(l),
		muted: u
	};
}
var ca = (e) => v`<linearGradient id=${e.id} x1="0" y1=${e.y1} x2="0" y2=${e.y2} data-muted=${e.muted}>
      <stop offset="0" style="stop-color: ${e.start}" />
      <stop offset="1" style="stop-color: ${e.end}" />
    </linearGradient>`;
function la(e) {
	let t = Gi(e);
	return t === "var(--disabled-text-color)" ? fn : t;
}
var ua = /* @__PURE__ */ new Set(["dhw_ext_in", "dhw_ext_out"]);
function da(e, t, n, r = {
	mode: "gradient",
	idPrefix: "ecogeo"
}, i = Ei.pipe) {
	let a = 7 * i / Ei.pipe, o = di(e), s = new Set(o.map((e) => e.part.id)), c = new Map(o.map((e) => [e.part.id, Ui(e.part, e.state, t)])), l = [], u = oi(e) === "external" ? `${r.idPrefix}-tank-clip` : void 0, d = ui(e).map((i) => {
		let a = r.mode === "gradient" ? i.part.sides : void 0;
		if (a === void 0) return ia(i, t, e.detail, n);
		let o = {
			left: "none",
			right: "none"
		};
		for (let e of a) {
			let n = sa(e, `${r.idPrefix}-x${String(i.part.item)}-${e.half}`, c, t.mode);
			l.push(n), o[e.half] = `url(#${n.id})`;
		}
		return ia(i, t, e.detail, n, o);
	});
	return v`<g class="cabinet">
    <defs>${l.map(ca)}${u === void 0 ? y : v`<clipPath id=${u} data-tank-clip><path d=${jr()} /></clipPath>`}</defs>
    <rect class="outline" x=${A.x} y=${A.y} width=${A.width} height=${A.height} rx="6" />
    ${ii.filter((t) => e.captions !== !1 && ci(t, e) !== "hidden").map((e) => v`<text class="circuit-label" x=${e.x} y=${e.y} text-anchor="middle">${$e[e.key]}</text>`)}
    ${o.map((e) => {
		let t = c.get(e.part.id);
		return t === void 0 ? y : oa(e.part, t, wi(e.part.id, s), a, u);
	})}
    ${d}
  </g>`;
}
// src/diagram/dhw.ts
var fa = o`
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
    ${Sr}
  }
  .tank-caption {
    fill: var(--secondary-text-color);
    font-size: 11px;
  }
`;
function pa(e, t) {
	if (oi(e) !== "external") return v``;
	let { x: n, y: r, width: i, dome: a } = M, o = i / 2, s = jr(), c = `M${String(n)} ${String(r + a)} A${String(o)} ${String(a)} 0 0 0 ${String(n + i)} ${String(r + a)}`, l = xr(br(yr, t), t?.onTap);
	return v`<g class=${e.dhw === "unused" ? "dhw-storage muted" : "dhw-storage"} data-dhw="external" aria-label=${tt.externalTank} role=${l.role} tabindex=${l.tabindex} @click=${l.click} @keydown=${l.keydown}>
    <title>${tt.externalTank}</title>
    <path class="tank-body" data-dhw-tank="external" d=${s} fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />
    <path class="tank-rim" d=${c} />
    ${e.captions === !1 ? y : v`<text class="tank-caption" x=${n + i / 2} y=${r - 6} text-anchor="middle">${tt.externalTank}</text>`}
  </g>`;
}
// src/lib/format.ts
var ma = "−";
function ha(e) {
	let t = e?.locale;
	return typeof t == "object" && t ? t : e?.language === void 0 ? {} : { language: e.language };
}
function ga(e) {
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
var _a = /* @__PURE__ */ new Map();
function va(e, t, n) {
	let r = ga(e), i = n && e.number_format !== "none", a = `${r?.join(",") ?? ""}|${String(t)}|${String(i)}`, o = _a.get(a);
	return o === void 0 && (o = new Intl.NumberFormat(r, {
		minimumFractionDigits: t,
		maximumFractionDigits: t,
		useGrouping: i
	}), _a.set(a, o)), o;
}
function ya(e, t, n = 0, r = !0) {
	if (!Number.isFinite(e)) return "–";
	let i = Number.isFinite(n) ? Math.min(20, Math.max(0, Math.trunc(n))) : 0, a = Math.abs(e) < .5 / 10 ** i ? 0 : e;
	return va(t ?? {}, i, r).formatToParts(a).map((e) => e.type === "minusSign" ? ma : e.value).join("");
}
// src/calc/display.ts
function ba(e) {
	if (typeof e != "object" || !e) return;
	let t = e.display_precision;
	return typeof t == "number" && Number.isInteger(t) && t >= 0 && t <= 20 ? t : void 0;
}
var xa = (e, t) => t ?? e.decimals ?? 0;
function Sa(e, t) {
	let n = typeof t == "string" ? t.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase() : "";
	return n === (e.unit ?? "").toLowerCase() || e.quantity === "difference" && n === "°c";
}
function Ca(e) {
	if (/e/i.test(e ?? "")) return 0;
	let t = /^\s*[-+]?\d*\.(\d+)/.exec(e ?? "");
	return Math.min(20, t?.[1]?.length ?? 0);
}
function wa(e, t) {
	let n = e === void 0 ? void 0 : t.states?.[e]?.attributes.unit_of_measurement;
	return typeof n == "string" && n.trim() !== "" ? n.trim() : void 0;
}
function Ta(e, t, n, r) {
	if (typeof t == "boolean") return it[t ? "on" : "off"];
	let i = kt.get(e);
	if (i === void 0 || t === void 0 || !Number.isFinite(t)) return;
	let a = wa(n, r), o = Sa(i, a), s = i.quantity !== void 0 && xt(i.quantity, a), c = i.unit !== void 0 && a !== void 0 && !o && !s, l = n === void 0 || !(o || c) ? void 0 : ba(r.entities?.[n]), u = c && l === void 0 ? Ca(n === void 0 ? void 0 : r.states?.[n]?.state) : xa(i, l), d = ya(t, r.locale, u, !1), f = c ? a : i.unit;
	return f === void 0 ? d : `${d} ${f}`;
}
// src/diagram/labels.ts
var Ea = o`
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
`, Da = {
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
}, Oa = {
	production_out: C.portOut,
	production_in: C.portIn,
	brine_out: C.portOut,
	brine_in: C.portIn,
	tank_internal_temperature: C.dhw,
	tank_external_temperature: C.dhw
}, ka = /* @__PURE__ */ new Set(["tank_internal_temperature"]), Aa = /* @__PURE__ */ new Set([
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
]), Y = (e, t, n, r, i, a = {}) => {
	let o = Da[e], s = Oa[e];
	return {
		id: e,
		role: t,
		tier: Aa.has(e) ? "key" : "detail",
		x: n,
		y: r,
		align: i,
		...o === void 0 ? {} : { compact: o },
		...s === void 0 ? {} : { compactCaption: s },
		...a
	};
}, ja = M.x + M.width / 2, Ma = M.y + M.height + 22, Na = j.y + 12, Pa = j.x + j.width / 2, Fa = N.y + N.height + 12, Ia = Mr + 6, La = 12, Ra = 20, za = [
	Y("production_out", "production.outlet_temperature", 237, 228, "end", { item: 33 }),
	Y("production_in", "production.return_temperature", 291, 247, "middle", { item: 34 }),
	Y("production_pressure", "production.pressure", 360, 537, "end", { item: 38 }),
	Y("production_pump", "production.pump", 396, 380, "end", { item: 15 }),
	Y("dg1_setpoint", "heating.setpoint", 291, 96, "middle", { item: 1 }),
	Y("dg1_demand", "heating.demand", 320, 123, "start", {
		item: 1,
		demand: !0
	}),
	Y("brine_out", "brine.outlet_temperature", 633, 247, "start", { item: 31 }),
	Y("brine_in", "brine.inlet_temperature", 697, 247, "start", { item: 32 }),
	Y("brine_pressure", "brine.pressure", 689, 459, "start", { item: 37 }),
	Y("brine_pump", "brine.pump", 676, 300, "end", { item: 16 }),
	Y("discharge_temperature", "compressor.discharge_temperature", 436, 262, "start", { item: 30 }),
	Y("discharge_pressure", "compressor.discharge_pressure", 480, 275, "middle", { item: 36 }),
	Y("suction_temperature", "compressor.suction_temperature", 528, 262, "start", { item: 29 }),
	Y("suction_pressure", "compressor.suction_pressure", 570, 275, "middle", { item: 35 }),
	Y("compressor_speed", "compressor.speed", 503, 307, "middle", { item: 11 }),
	Y("compressor_percentage", "compressor.percentage", 503, 319, "middle", { item: 11 }),
	Y("compressor_power", "compressor.power", 503, 331, "middle", { item: 11 }),
	Y("superheat", "refrigerant.superheat", 527, 376, "middle", { item: 12 }),
	Y("expansion_valve", "refrigerant.expansion_valve", 527, 388, "middle", { item: 12 }),
	Y("condensation_temperature", "refrigerant.condensation_temperature", 432, 437, "middle", { item: 8 }),
	Y("evaporation_temperature", "refrigerant.evaporation_temperature", 572, 437, "middle", { item: 7 }),
	Y("fan_speed", "source.fan_speed", N.fanX, Fa, "middle", {
		source: ["air", "hybrid"],
		caption: C.fan
	}),
	Y("outside_temperature", "source.outside_temperature", N.fanX, Fa + 13, "middle", {
		source: ["air", "hybrid"],
		caption: C.outside
	}),
	Y("air_unit_in", "brine.outlet_temperature", Ia, P.bottom - La, "start", {
		source: ["air"],
		caption: C.portIn
	}),
	Y("air_unit_out", "source.air_unit_outlet_temperature", Ia, P.top + La, "start", {
		source: ["air"],
		caption: C.portOut
	}),
	Y("hybrid_air_unit_in", "brine.outlet_temperature", Ia, P.top + La, "start", {
		source: ["hybrid"],
		caption: C.portIn
	}),
	Y("ground_in", "brine.outlet_temperature", F.downX + 6, I.ground + Ra, "start", {
		source: ["ground"],
		caption: C.portIn
	}),
	Y("ground_out", "brine.inlet_temperature", F.upX - 6, I.ground + Ra, "end", {
		source: ["ground"],
		caption: C.portOut
	}),
	Y("hybrid_ground_out", "brine.inlet_temperature", F.upX - 6, I.hybrid + Ra, "end", {
		source: ["hybrid"],
		caption: C.portOut
	}),
	Y("tank_external_temperature", "dhw.temperature", ja, Ma, "middle", {
		dhw: "external",
		emphasis: !0
	}),
	Y("tank_external_setpoint", "dhw.setpoint", ja, Ma + 15, "middle", {
		dhw: "external",
		caption: C.setpoint
	}),
	Y("tank_external_start_delta", "dhw.start_delta", ja, Ma + 29, "middle", {
		dhw: "external",
		caption: C.startDelta
	}),
	Y("tank_external_demand", "dhw.demand", ja, Ma + 43, "middle", {
		dhw: "external",
		demand: !0
	}),
	Y("tank_internal_temperature", "dhw.temperature", j.x + j.width / 6, Na, "middle", {
		dhw: "internal",
		bare: !0
	}),
	Y("tank_internal_setpoint", "dhw.setpoint", Pa, Na, "middle", {
		dhw: "internal",
		caption: C.setpointShort,
		bare: !0
	}),
	Y("tank_internal_start_delta", "dhw.start_delta", j.x + j.width * 5 / 6, Na, "middle", {
		dhw: "internal",
		caption: C.startDeltaShort,
		bare: !0
	}),
	Y("tank_internal_demand", "dhw.demand", Pa, Na + 13, "middle", {
		dhw: "internal",
		demand: !0,
		bare: !0
	})
], Ba = /* @__PURE__ */ new Set();
function Va(e, t, n, r, i = !1, a = Ba) {
	return za.flatMap((o) => {
		if (i && o.tier !== "key" || a.has(o.role) || ci(o, e) === "hidden" || e.dhw === "unused" && o.dhw !== void 0) return [];
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
			...i && l !== void 0 && ka.has(o.id) ? { stacked: !0 } : {}
		}, f = t[o.role];
		if (o.demand === !0) {
			let e = o.role === "heating.demand" ? nt.demand : tt.demand;
			return f === !0 ? [{
				...d,
				text: e,
				missing: !1
			}] : [];
		}
		let p = Ta(o.role, typeof f == "number" || typeof f == "boolean" ? f : void 0, s, r);
		return [{
			...d,
			text: p ?? "–",
			missing: p === void 0
		}];
	});
}
var Ha = /* @__PURE__ */ new Set(["outside_temperature", "cop"]);
function Ua(e, t, n, r = !1, i = Ba) {
	let a = (e, n, r, a) => n.every((e) => i.has(e)) ? void 0 : {
		id: e,
		tier: Ha.has(e) ? "key" : "detail",
		...r === void 0 ? {} : { caption: r },
		text: a ?? "–",
		missing: a === void 0,
		entityId: t[n[0]]
	}, o = (r, i, o) => {
		let s = e[i];
		return a(r, [i], o, Ta(i, typeof s == "number" || typeof s == "boolean" ? s : void 0, t[i], n));
	}, s = e["unit.on_off"], c = e["unit.summer"] === !0 ? rt.summer : e["unit.winter"] === !0 ? rt.winter : void 0, l = [
		a("on_off", ["unit.on_off"], void 0, s === void 0 ? void 0 : typeof s == "boolean" ? it[s ? "on" : "off"] : it[s.toLowerCase()] ?? s),
		a("season", e["unit.summer"] === !0 || i.has("unit.winter") ? ["unit.summer", "unit.winter"] : ["unit.winter", "unit.summer"], void 0, c),
		o("outside_temperature", "source.outside_temperature", rt.outside),
		o("cop", "unit.cop", rt.cop),
		o("condensation_capacity", "heating.capacity", rt.condensation),
		o("evaporation_capacity", "cooling.capacity", rt.evaporation)
	].filter((e) => e !== void 0);
	return r ? l.filter((e) => e.tier === "key") : l;
}
var Wa = (e) => ({
	left: `${String(e.x / Cr.width * 100)}%`,
	top: `${String(e.y / Cr.height * 100)}%`
});
function Ga(e, t, n, r) {
	let i = n ? "value missing" : "value";
	return e === void 0 || r === void 0 ? _`<span class=${i}>${t}</span>` : _`<button
        class=${i}
        type="button"
        @click=${() => {
		r(e);
	}}
      >
        ${t}
      </button>`;
}
function Ka(e, t) {
	return _`${e.map((e) => {
		let { left: n, top: r } = Wa(e);
		return _`<span
      class="label ${e.align}${e.emphasis ? " emphasis" : ""}${e.bare === !0 ? " bare" : ""}${e.stacked === !0 ? " stacked" : ""}"
      data-label=${e.id}
      data-role=${e.role}
      data-label-item=${e.item ?? y}
      style="left: ${n}; top: ${r}"
      >${e.caption === void 0 ? y : _`<span class="caption">${e.caption}</span>`}${Ga(e.entityId, e.text, e.missing, t)}</span
    >`;
	})}`;
}
function qa(e, t) {
	return _`${e.map((e) => _`<span class="footer-item" data-footer=${e.id}
        >${e.caption === void 0 ? y : _`<span class="caption">${e.caption}</span>`}${Ga(e.entityId, e.text, e.missing, t)}</span
      >`)}`;
}
// node_modules/@lit/reactive-element/decorators/property.js
var Ja = {
	attribute: !0,
	type: String,
	converter: re,
	reflect: !1,
	hasChanged: ie
}, Ya = (e = Ja, t, n) => {
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
function Xa(e) {
	return (t, n) => typeof n == "object" ? Ya(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function Za(e) {
	return Xa({
		...e,
		state: !0,
		attribute: !1
	});
}
// src/lib/define.ts
function Qa(e, t) {
	let n = customElements.get(e);
	n === void 0 ? customElements.define(e, t) : n !== t && console.warn(`${e} is already defined by another copy of the module; that copy stays in use.`);
}
// src/config/keywords.ts
var X = (e) => e.split(/\s+/).filter((e) => e !== ""), Z = "temp temperature temperatuur temperatura temperatur", $a = "pressure druk presion druck", eo = "pump pomp bomba pumpe circulator", to = "heating verwarming heizung heizkreis calefaccion cv", no = `production productie produccion produktion ${to}`, ro = "brine glycol source bron brijn captacion salmuera sole", io = "dhw sanitary sanitaria tapwater warmwater warmwasser acs caliente domestic hotwater boiler", ao = "demand vraag demanda anforderung bedarf request", oo = "suction zuig saug ansaug succion aspiracion niederdruck lagedruk", so = "discharge pers druckgas heissgas descarga hochdruck hogedruk", co = "capacity vermogen capacidad kapazitat leistung power", lo = "valve ventiel valvula ventil position stand posicion stellung", uo = "compressor compresor kompressor verdichter", fo = "condens condensation condensatie condensacion kondensation kondens", po = "evaporat evaporation evaporacion verdamp verdampfung", mo = `${to} dg verwarmen`, ho = "setpoint set target desired gewenst ingesteld soll wunsch consigna objetivo streef", go = "superheat oververhitting oververhit sobrecalentamiento ueberhitzung uberhitzung", _o = "on off aan uit onoff encendido apagado ein aus", vo = "alarm alarma storing stoerung storung fehler error fault malfunction", yo = "cop scop coefficient rendimiento rendement wirkungsgrad efficiency", bo = {
	"production.outlet_temperature": {
		subject: X(no),
		role: X(Z)
	},
	"production.return_temperature": {
		subject: X(no),
		role: X(Z)
	},
	"production.pressure": {
		subject: X(no),
		role: X($a)
	},
	"production.pump": {
		subject: X(no),
		role: X(eo)
	},
	"brine.outlet_temperature": {
		subject: X(ro),
		role: X(Z)
	},
	"brine.inlet_temperature": {
		subject: X(ro),
		role: X(Z)
	},
	"brine.pressure": {
		subject: X(ro),
		role: X($a)
	},
	"brine.pump": {
		subject: X(ro),
		role: X(eo)
	},
	"compressor.speed": {
		subject: X(uo),
		role: X("rpm speed toerental toeren velocidad drehzahl frequency frequentie frecuencia frequenz hz running draait actief active activo laufend")
	},
	"compressor.percentage": {
		subject: X(uo),
		role: X("percentage porcentaje prozent load belasting carga auslastung capaciteit")
	},
	"compressor.power": {
		subject: X("power vermogen potencia leistung electrical elektrisch electrico"),
		role: X("consumption opgenomen verbruik consumo verbrauch aufnahme")
	},
	"compressor.suction_temperature": {
		subject: X(oo),
		role: X(Z)
	},
	"compressor.discharge_temperature": {
		subject: X(so),
		role: X(Z)
	},
	"compressor.suction_pressure": {
		subject: X(oo),
		role: X($a)
	},
	"compressor.discharge_pressure": {
		subject: X(so),
		role: X($a)
	},
	"compressor.mode": {
		subject: X(uo),
		role: X("mode modus modo operation operating bedrijf funcionamiento betriebsart")
	},
	"refrigerant.condensation_temperature": {
		subject: X(fo),
		role: X(Z)
	},
	"refrigerant.evaporation_temperature": {
		subject: X(po),
		role: X(Z)
	},
	"refrigerant.superheat": {
		subject: X(go),
		role: X(go)
	},
	"refrigerant.expansion_valve": {
		subject: X("expansion expansie expansionsventil expans"),
		role: X(lo)
	},
	"heating.capacity": {
		subject: X(fo),
		role: X(co)
	},
	"cooling.capacity": {
		subject: X(po),
		role: X(co)
	},
	"heating.demand": {
		subject: X(mo),
		role: X(ao)
	},
	"heating.setpoint": {
		subject: X(mo),
		role: X(`${Z} ${ho}`)
	},
	"dhw.temperature": {
		subject: X(io),
		role: X(Z)
	},
	"dhw.setpoint": {
		subject: X(io),
		role: X(`${Z} ${ho}`)
	},
	"dhw.start_delta": {
		subject: X(io),
		role: X("delta difference verschil diferencia unterschied start starten arranque")
	},
	"dhw.demand": {
		subject: X(io),
		role: X(ao)
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
		subject: X(`${_o} heatpump warmtepomp`),
		role: X(`${_o} power switch schakelaar`)
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
		subject: X(vo),
		role: X(vo)
	},
	"unit.connection": {
		subject: X("connection connected connectivity conexion verbinding verbindung online communication"),
		role: X("connection connected connectivity conexion verbinding verbindung status online communication")
	},
	"unit.cop": {
		subject: X(yo),
		role: X(yo)
	}
}, xo = {
	in: X(`in inlet return retour retorno inflow terug terugvoer terugloop inlaat entrada eintritt ruecklauf rucklauf ingaand eingang ${oo}`),
	out: X(`out outlet supply aanvoer uitlaat salida impulsion austritt vorlauf uitgaand ausgang uit ${so}`)
}, So = X(ho), Co = /* @__PURE__ */ new Set(["heating.setpoint", "dhw.setpoint"]), wo = X("flow"), To = {
	exact: 100,
	suffix: 90,
	subject: 30,
	role: 20,
	direction: 10,
	strong: 40,
	tie: 5
}, Eo = (e) => e.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replaceAll("ß", "ss"), Do = (e) => Eo(e).split(/[^a-z]+/).filter((e) => e !== ""), Oo = (e) => {
	let t = e.indexOf(".");
	return [e.slice(0, t), e.slice(t + 1)];
};
function ko(e, t, n, r) {
	let i = n[r]?.name_by_user ?? n[r]?.name ?? "";
	return Object.values(t).filter((e) => e?.device_id === r).flatMap((t) => {
		let n = e[t.entity_id];
		if (n === void 0) return [];
		let [r, a] = Oo(t.entity_id), o = n.attributes.friendly_name, s = n.attributes.unit_of_measurement, c = n.attributes.device_class;
		return [{
			entityId: t.entity_id,
			domain: r,
			objectId: a,
			unit: typeof s == "string" ? s : void 0,
			deviceClass: typeof c == "string" ? c : void 0,
			names: [...typeof o == "string" ? [Ao(o, i)] : [], ...typeof t.name == "string" ? [t.name] : []]
		}];
	});
}
function Ao(e, t) {
	let n = Eo(t).trim(), r = Eo(e);
	if (n === "" || !r.startsWith(n)) return e;
	let i = r.slice(n.length);
	return i === "" || /^[^a-z0-9]/.test(i) ? i : e;
}
function jo(e) {
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
function Mo(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of D) {
		let r = /* @__PURE__ */ new Set();
		for (let t of e) {
			let e = `_${n.suffix}`;
			t.domain === n.domain && t.objectId.length > e.length && t.objectId.endsWith(e) && r.add(t.objectId.slice(0, -e.length));
		}
		for (let e of r) t.set(e, (t.get(e) ?? 0) + 1);
	}
	let [n] = [...t].sort(([e, t], [n, r]) => r - t || n.length - e.length || (e < n ? -1 : 1));
	return n === void 0 ? jo(e.map((e) => e.objectId)) : `${n[0]}_`;
}
var No = (e) => (e ?? "").trim().toLowerCase(), Po = {
	"compressor.speed": ["rpm", "hz"],
	"production.pump": ["%", "rpm"],
	"brine.pump": ["%", "rpm"],
	"source.fan_speed": ["%", "rpm"]
}, Fo = {
	temperature: ["temperature"],
	difference: ["temperature"],
	power: ["power"],
	pressure: ["pressure", "atmospheric_pressure"]
};
function Io(e, t) {
	if (Dt.includes(t.domain)) return !0;
	if (e.kind !== "number") return No(t.unit) === "" && (t.deviceClass === void 0 || t.deviceClass === "enum");
	if ("quantity" in e && e.quantity !== void 0) {
		if (!xt(e.quantity, t.unit)) return !1;
		let n = Fo[e.quantity];
		return t.deviceClass === void 0 || n === void 0 || n.includes(t.deviceClass);
	}
	let n = No(t.unit), r = Po[e.path] ?? ("unit" in e && e.unit !== void 0 ? [No(e.unit)] : []);
	return r.length === 0 ? n === "" : r.includes(n);
}
function Lo(e, t) {
	return e.accepts.includes(t.domain) && Io(e, t);
}
var Ro = (e, t) => e.some((e) => t.some((t) => e.length >= 4 ? t.includes(e) : t === e));
function zo(e, t, n) {
	if (t.entityId === jt(e, n.replace(/_$/, "")) && n !== "") return To.exact;
	if ((e.kind !== "binary" || Dt.includes(t.domain)) && (t.objectId === e.suffix || t.objectId.endsWith(`_${e.suffix}`))) return To.suffix;
	let r = [...Do(t.objectId.startsWith(n) ? t.objectId.slice(n.length) : t.objectId), ...t.names.flatMap(Do)];
	if (Ro(So, r) !== Co.has(e.path)) return 0;
	let i = 0, a = bo[e.path];
	if (Ro(a.subject, r) && (i += To.subject), Ro(a.role, r) && (i += To.role), e.direction !== void 0) {
		if ((e.direction !== "out" || !Ro(wo, r) || Ro(xo.in, r)) && !Ro(xo[e.direction], r)) return 0;
		i += To.direction;
	}
	return i;
}
function Bo(e) {
	return typeof e != "object" || !e || Array.isArray(e) ? {} : Object.fromEntries(Object.entries(e).map(([e, t]) => [e, typeof t == "object" && t && !Array.isArray(t) ? Bo(t) : t]));
}
function Vo(e) {
	let { states: t, config: n } = e, r = ko(t, e.entities, e.devices, e.deviceId), i = Mo(r), a = fr(n, Vn(n)), o = /* @__PURE__ */ new Set(), s = [];
	for (let e of D) {
		if (Bn(O(n, `entities.${e.path}`))) continue;
		let r = a[e.path];
		r !== void 0 && t[r] !== void 0 ? o.add(r) : s.push(e);
	}
	let c = s.flatMap((e, t) => r.filter((t) => !o.has(t.entityId) && Lo(e, t)).map((n) => ({
		role: e,
		order: t,
		candidate: n,
		score: zo(e, n, i)
	}))).filter((e) => e.score > 0).sort((e, t) => t.score - e.score || e.order - t.order || (e.candidate.entityId < t.candidate.entityId ? -1 : 1)), l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set();
	for (let e of c) {
		let t = e.role.path;
		if (e.score < To.strong) break;
		if (l.has(t) || u.has(t) || o.has(e.candidate.entityId)) continue;
		let [n, r] = c.filter((t) => t.role === e.role && !o.has(t.candidate.entityId));
		n !== void 0 && r !== void 0 && n.score - r.score <= To.tie ? u.add(t) : (l.set(t, e.candidate.entityId), o.add(e.candidate.entityId));
	}
	let d = Bo(O(n, "entities"));
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
var Ho = w.roleGroups, Uo = w.roles;
function Wo(e) {
	let [t = "", n = ""] = e.split(".");
	return `${Ho[t] ?? t}: ${Uo[n] ?? n}`;
}
// src/editor/binding-check.ts
function Go(e, t) {
	if (t === void 0 || Object.keys(t).length === 0) return [];
	let n = fr(e, Vn(e));
	return D.flatMap((r) => {
		let i = n[r.path];
		if (i === void 0 || Bn(O(e, `entities.${r.path}`))) return [];
		let a = Wo(r.path), o = t[i];
		if (o === void 0) return [w.suggest.unknown(a, i)];
		let s = i.slice(0, i.indexOf("."));
		if (!r.accepts.includes(s)) return [w.suggest.kind(a, i)];
		if (o.state === "unavailable") return [];
		let c = o.attributes.unit_of_measurement, l = o.attributes.device_class;
		return Io(r, {
			domain: s,
			unit: typeof c == "string" ? c : void 0,
			deviceClass: typeof l == "string" ? l : void 0
		}) ? [] : [w.suggest.unit(a, i)];
	});
}
// src/editor/fields.ts
var Ko = (e, t, { advanced: n = !1 } = {}) => ({
	name: e,
	selector: { entity: { filter: { domain: t } } },
	...n ? { advanced: n } : {}
});
function qo(e) {
	let t = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(e.trim())?.[1];
	if (t === void 0) return;
	let n = t.length === 3 ? t.replace(/./g, "$&$&") : t, r = (e) => Number.parseInt(n.slice(e, e + 2), 16);
	return [
		r(0),
		r(2),
		r(4)
	];
}
var Jo = (e) => Array.isArray(e) && e.length === 3 && e.every((e) => typeof e == "number" && Number.isFinite(e)), Yo = (e) => "#" + e.map((e) => Math.min(255, Math.max(0, Math.round(e))).toString(16).padStart(2, "0")).join(""), Xo = (e) => ({
	name: e,
	selector: { color_rgb: {} }
}), Zo = (e, t, n, r = t.default) => ({
	name: e,
	default: r,
	selector: { select: {
		mode: "dropdown",
		options: t.choices.map((e) => ({
			value: e,
			label: n[e] ?? e
		}))
	} }
}), Qo = "#9e9e9e", $o = /^colors_(\d+)_(temperature|color)$/;
function es(e) {
	let t = $o.exec(e);
	return t?.[1] === void 0 ? void 0 : {
		index: Number(t[1]),
		part: t[2]
	};
}
function ts(e) {
	let t = O(e, "colors");
	return Array.isArray(t) ? t.map((e) => {
		let { temperature: t, color: n } = typeof e == "object" && e ? e : {};
		return {
			...typeof t == "number" ? { temperature: t } : {},
			...typeof n == "string" ? { color: n } : {}
		};
	}) : ln.map((e) => ({ ...e }));
}
var ns = qo("#9e9e9e") ?? [
	158,
	158,
	158
], rs = () => ({ color: ns });
function is(e) {
	let t = [...e];
	for (; t.length >= 2 && t[t.length - 1]?.temperature === void 0 && t[t.length - 2]?.temperature === void 0;) t.pop();
	return t.at(-1)?.temperature === void 0 && t.length > 0 ? t : [...t, rs()];
}
function as(e) {
	return is(ts(e).map(({ temperature: e, color: t }) => {
		let n = t === void 0 ? void 0 : qo(t);
		return {
			...e === void 0 ? {} : { temperature: e },
			...n === void 0 ? {} : { color: n },
			...t === void 0 ? {} : { orig: t }
		};
	}));
}
function os(e) {
	return Array.from({ length: e }, (e, t) => t).flatMap((e) => [{
		name: `colors_${String(e)}_temperature`,
		selector: { number: {
			step: "any",
			mode: "box",
			unit_of_measurement: x.celsius
		} }
	}, Xo(`colors_${String(e)}_color`)]);
}
function ss(e) {
	let t = {};
	return e.forEach(({ temperature: e, color: n }, r) => {
		e !== void 0 && (t[`colors_${String(r)}_temperature`] = e), n !== void 0 && (t[`colors_${String(r)}_color`] = [...n]);
	}), t;
}
function cs(e) {
	let t = /* @__PURE__ */ new Map(), n = {};
	for (let [r, i] of Object.entries(e)) {
		let e = es(r);
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
var ls = (e, t) => e.every((e, n) => e === t[n]);
function us(e) {
	let t = typeof e == "string" && e.trim() !== "" ? Number(e) : e;
	return typeof t == "number" && Number.isFinite(t) ? t : void 0;
}
function ds(e, t) {
	let n = t === void 0 ? void 0 : qo(t);
	return Jo(e) ? t !== void 0 && n && ls(n, e) ? t : Yo(e) : t !== void 0 && n === void 0 ? t : Qo;
}
function fs(e, t) {
	let n = Math.max(e.length, ...[...t.keys()].map((e) => e + 1));
	return is(Array.from({ length: n }, (n, r) => {
		let i = t.get(r), a = us(i?.temperature), o = i !== void 0 && Jo(i.color) ? i.color : void 0, s = e[r]?.orig;
		return {
			...a === void 0 ? {} : { temperature: a },
			...o === void 0 ? {} : { color: o },
			...s === void 0 ? {} : { orig: s }
		};
	}));
}
var ps = (e, t) => e.length === t.length && e.every((e, n) => e.temperature === t[n]?.temperature && e.color === t[n]?.color), ms = (e) => e.length === ln.length && e.every((e, t) => {
	let n = ln[t];
	return e.temperature === n?.temperature && e.color.toLowerCase() === n.color;
});
function hs(e, t) {
	let n = e.flatMap(({ temperature: e, color: t, orig: n }) => e === void 0 ? [] : [{
		temperature: e,
		color: ds(t, n)
	}]).sort((e, t) => e.temperature - t.temperature), r = O(t, "colors");
	return Array.isArray(r) && ps(n, ts(t)) ? "keep" : ms(n) ? r !== void 0 && !Array.isArray(r) ? "keep" : void 0 : n;
}
function gs(e, t) {
	return t === void 0 ? Object.fromEntries(Object.entries(e).filter(([e]) => e !== "colors")) : {
		...e,
		colors: t
	};
}
// src/editor/ecogeo-schema.ts
var _s = [
	"features",
	"entities",
	"states"
], vs = ["entities"], ys = "_device", bs = "_not_present", xs = "default", Ss = [
	[xs, void 0],
	["true", !0],
	["false", !1],
	["unused", "unused"]
];
function Cs(e, t) {
	let { on: n, off: r, unused: i, presetOn: a, presetOff: o, presetUnused: s, variantDefault: c } = w.featureChoices;
	return {
		name: e,
		default: xs,
		coded: Ss,
		selector: { select: {
			mode: "dropdown",
			options: [
				{
					value: xs,
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
var ws = [
	"passive_cooling",
	"active_cooling",
	"htr",
	"backup_heater"
];
function Ts() {
	return {
		name: "variant",
		default: "4",
		coded: xn.map((e) => [String(e), e]),
		selector: { select: {
			mode: "dropdown",
			options: xn.map((e) => ({
				value: String(e),
				label: w.choices.variant[e]
			}))
		} }
	};
}
var Es = (e) => En.filter((t) => t === "unused" || t === In(e) || t === "none" && e === "B");
function Ds(e, t) {
	let n = O(e, "dhw"), r = Es(t), i = En.filter((e) => r.includes(e) || e === n);
	return Zo("dhw", {
		...An,
		choices: i
	}, w.choices.dhw, In(t));
}
function Os(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of D) {
		if (Bn(O(e, `entities.${n.path}`))) continue;
		let [r = "", i = ""] = n.path.split(".");
		t.set(r, [...t.get(r) ?? [], Ko(i, n.accepts, { advanced: !0 })]);
	}
	return {
		type: "expandable",
		name: "entities",
		schema: [...t].map(([e, t]) => ({
			type: "expandable",
			name: e,
			title: w.roleGroups[e],
			schema: t
		}))
	};
}
var ks = () => ({
	name: bs,
	advanced: !0,
	selector: { select: {
		multiple: !0,
		mode: "dropdown",
		options: D.map((e) => ({
			value: e.path,
			label: Wo(e.path)
		}))
	} }
}), As = {
	off: "unit.on_off",
	defrost: "compressor.mode"
};
function js(e, t) {
	let n = fr(e, Vn(e)), r = (e) => {
		let r = n[As[e]], i = r === void 0 ? void 0 : t?.[r]?.attributes.options;
		return Array.isArray(i) ? i.filter((e) => typeof e == "string") : [];
	};
	return {
		off: r("off"),
		defrost: r("defrost")
	};
}
function Ms(e) {
	let t = (t) => ({
		name: t,
		advanced: !0,
		default: [...ct[t]],
		selector: { select: {
			multiple: !0,
			custom_value: !0,
			mode: "dropdown",
			options: [.../* @__PURE__ */ new Set([...e[t], ...ct[t]])]
		} }
	});
	return {
		type: "expandable",
		name: "states",
		schema: [t("off"), t("defrost")]
	};
}
function Ns(e, t = as(e).length, n) {
	let r = Sn(Hn(e)), i = O(e, "model") === wn[1] ? wn[1] : wn[0];
	return [
		{
			type: "expandable",
			name: "unit",
			flatten: !0,
			schema: [
				Zo("model", On, w.choices.model),
				Ts(),
				Zo("source", kn, w.choices.source),
				Ds(e, i)
			]
		},
		{
			type: "expandable",
			name: "entity_prefix",
			flatten: !0,
			schema: [{
				name: ys,
				selector: { device: {} }
			}, {
				name: "prefix",
				selector: { text: {} }
			}]
		},
		{
			type: "expandable",
			name: "features",
			schema: ws.map((e) => Cs(e, r[e]))
		},
		{
			type: "expandable",
			name: "appearance",
			flatten: !0,
			schema: [
				Zo("detail", jn, w.choices.detail),
				Zo("exchanger_fill", Mn, w.choices.exchanger_fill),
				Zo("layout", Nn, w.choices.layout),
				...os(t)
			]
		},
		Os(e),
		ks(),
		Ms(js(e, n))
	];
}
// src/editor/schema.ts
function Ps(e) {
	return "type" in e;
}
function Fs(e) {
	let { advanced: t, ...n } = e;
	return n;
}
function Is(e, t) {
	return e.flatMap((e) => {
		if (!Ps(e)) return t || e.advanced !== !0 ? [Fs(e)] : [];
		let n = Is(e.schema, t);
		return n.length > 0 ? [{
			...e,
			schema: n
		}] : [];
	});
}
function Q(e, t = "") {
	return e.flatMap((e) => Ps(e) ? Q(e.schema, e.flatten ? t : `${t}${e.name}.`) : [{
		field: e,
		path: `${t}${e.name}`
	}]);
}
function Ls(e, t) {
	return Is(e, t);
}
function Rs(e, t) {
	if (e == null || e === "") return !1;
	if (t.default === void 0) return !0;
	if (typeof t.default == "number") {
		let n = typeof e == "number" ? e : typeof e == "string" ? ft(e) : void 0;
		if (n !== void 0) return n !== t.default;
	}
	return zs(e) !== zs(t.default);
}
function zs(e) {
	return (typeof e == "string" || typeof e == "number" || typeof e == "boolean" ? String(e) : JSON.stringify(e)).toLowerCase();
}
function Bs(e) {
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
	let u = $(Bs(c) ? c : {}, o.join("."), n, r, `${i}${a}.`), d = r !== void 0 && O(r, `${i}${a}`) !== void 0;
	return n === void 0 && Object.keys(u).length === 0 && !d ? l : {
		...s,
		[a]: u
	};
}
function Vs(e, t, n = /* @__PURE__ */ new Set()) {
	return Q(e).reduce((e, { field: r, path: i }) => r.default !== void 0 && O(t, i) === void 0 && !n.has(i) ? $(e, i, r.default) : e, t);
}
function Hs(e, t, n) {
	return Q(e).map(({ path: e }) => e).filter((e) => O(t, e) !== void 0 && O(n, e) === void 0);
}
function Us(e) {
	if (!Bs(e)) return e;
	let t = Object.entries(e).filter(([, e]) => e !== void 0).map(([e, t]) => [e, Us(t)]);
	return t.length !== Object.keys(e).length || t.some(([t, n]) => n !== e[t]) ? Object.fromEntries(t) : e;
}
function Ws(e, t) {
	return Q(e).reduce((e, { field: n, path: r }) => ("text" in n.selector || "entity" in n.selector) && O(e, r) === "" ? $(e, r, void 0, t) : e, t);
}
function Gs(e, t) {
	return Q(e).reduce((e, { field: t, path: n }) => {
		let r = O(e, n), i = t.coded?.find(([, e]) => e !== void 0 && e === r);
		return i === void 0 ? e : $(e, n, i[0]);
	}, t);
}
function Ks(e, t, n) {
	return Q(e).reduce((e, { field: t, path: r }) => {
		let i = O(e, r), a = t.coded?.find(([e]) => e === i);
		return a === void 0 ? e : $(e, r, a[1], n);
	}, t);
}
function qs(e, t, n, r = []) {
	let i = (e) => Bs(e) && Object.keys(e).length === 0;
	return Object.fromEntries(Object.entries(e).flatMap(([e, a]) => {
		if (!n.includes(e) || !Bs(a)) return [[e, a]];
		let o = t[e], s = r.includes(e) ? Object.fromEntries(Object.entries(a).filter(([e, t]) => !i(t) || Bs(o) && i(o[e]))) : a;
		return Object.keys(s).length > 0 || i(o) ? [[e, s]] : [];
	}));
}
function Js(e, t, n) {
	return Q(e).reduce((e, { field: n, path: r }) => n.default !== void 0 && O(t, r) === void 0 && O(e, r) !== void 0 && !Rs(O(e, r), n) ? $(e, r, void 0, t) : e, n);
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/decorate.js
function Ys(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/editor/ecogeo-card-editor.ts
var Xs = "ecogeo-card-editor", Zs = [{
	name: "advanced",
	selector: { boolean: {} }
}], Qs = () => w.advanced, $s = w.sections, ec = w.fields, tc = w.roles;
function nc(e) {
	if (Ps(e)) return e.title ?? $s[e.name] ?? e.name;
	let t = es(e.name);
	return t === void 0 ? ec[e.name] ?? tc[e.name] ?? e.name : w.colorRow[t.part](t.index + 1);
}
var rc = (e) => Object.hasOwn(e, "entities") || Object.hasOwn(e, "states"), ic = (e) => Object.hasOwn(e, "entities"), ac = [ys, bs];
function oc(e, t) {
	let n = e.states;
	if (typeof n != "object" || !n || Array.isArray(n)) return e;
	let r = (e, t) => Array.isArray(e) && Array.isArray(t) && e.length === t.length && e.every((e, n) => String(e).trim().toLowerCase() === String(t[n]).trim().toLowerCase()), i = Object.entries(n).filter(([e, n]) => {
		if (!Array.isArray(n)) return !0;
		if (n.length === 0) return !1;
		let i = e === "off" || e === "defrost" ? ct[e] : void 0, a = JSON.stringify(n) === JSON.stringify(O(t, `states.${e}`));
		return i === void 0 || !r(n, i) || a;
	});
	return {
		...e,
		states: Object.fromEntries(i)
	};
}
function sc(e, t, n) {
	let r = e;
	for (let e of Qn(n)) t.has(e) || (r = $(r, `entities.${e}`, void 0, n));
	for (let e of t) r = $(r, `entities.${e}`, "none", n);
	return r;
}
var cc = class extends Ke {
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
		super(), this.schemaFor = Ns, this._switch = { advanced: !1 }, this._optionsKey = "", this._formDefined = customElements.get("ha-form") !== void 0, this._schema = [], this._formSchema = [], this._shown = {}, this._draft = [], this._draftBuilt = !1, this._emptied = /* @__PURE__ */ new Set(), this._toggleAdvanced = (e) => {
			e.stopPropagation(), this._switch = { advanced: e.detail.value.advanced === !0 };
		}, this._configChanged = (e) => {
			e.stopPropagation();
			let t = this._config ?? {}, { [ys]: n, [bs]: r, ...i } = e.detail.value, a = this._has(ys), o = typeof n == "string" && n !== "" ? n : void 0;
			if (a && o !== this._device) {
				this._device = o, this._report = void 0;
				return;
			}
			this._report = void 0;
			let s = this._has(bs), c = a || s ? i : e.detail.value, l = this._hasColorRows, u = l ? cs(c) : void 0, d = Us(Ws(this._schema, u?.rest ?? c)), f = l ? cs(this._shown).rest : this._shown, p = (e) => {
				let t = O(d, e);
				return e.startsWith("states.") && Array.isArray(t) && t.length === 0;
			}, m = [...Hs(this._schema, f, d), ...Q(this._schema).map(({ path: e }) => e).filter((e) => p(e) && O(f, e) !== void 0)].filter((e) => !ac.includes(e));
			this._emptied = new Set([...this._emptied, ...m].filter((e) => O(d, e) === void 0 || p(e)));
			let h = Ks(this._schema, d, t), ee = s && (Array.isArray(r) || Object.hasOwn(e.detail.value, "_not_present")) ? sc(h, new Set(Array.isArray(r) ? r.filter((e) => typeof e == "string") : []), t) : h, te = qs(oc(Js(this._schema, t, ee), t), t, _s, vs);
			u && (this._draft = fs(this._draft, u.rows));
			let ne = u ? hs(this._draft, t) : "keep", g = ne === "keep" ? te : gs(te, ne);
			this._colorsSeen = g.colors, this._config = g, this._refreshSchema(g), this.dispatchEvent(new CustomEvent("config-changed", {
				detail: { config: g },
				bubbles: !0,
				composed: !0
			}));
		}, this._suggest = () => {
			let e = this._pickDevice(), t = this.hass;
			if (e === void 0 || t === void 0 || this._config === void 0) return;
			let n = this._config, { entities: r, report: i } = Vo({
				states: t.states,
				entities: t.entities ?? {},
				devices: t.devices ?? {},
				deviceId: e,
				config: n
			});
			this._switch = { advanced: !0 }, this._report = {
				filled: i.filled.length,
				empty: i.empty.map(Wo)
			};
			let a = Object.keys(r).length === 0 && !ic(n) ? n : {
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
		let n = this._config !== void 0 && rc(this._config);
		rc(e) && !n && !this._switch.advanced && (this._switch = { advanced: !0 }), this._draftBuilt && JSON.stringify(e.colors) === JSON.stringify(this._colorsSeen) || (this._draft = as(e), this._colorsSeen = e.colors, this._draftBuilt = !0), this._config = e, this._refreshSchema(e);
	}
	_refreshSchema(e) {
		let t = this.schemaFor(e, this._draft.length, this.hass?.states);
		this._optionsKey = JSON.stringify(js(e, this.hass?.states)), JSON.stringify(t) !== JSON.stringify(this._schema) && (this._schema = t, this._formSchema = Ls(t, this._switch.advanced));
	}
	willUpdate(e) {
		(e.has("schemaFor") && this._config || e.has("hass") && this._config && JSON.stringify(js(this._config, this.hass?.states)) !== this._optionsKey) && this._refreshSchema(this._config), e.has("_switch") && (this._formSchema = Ls(this._schema, this._switch.advanced)), this._config && (e.has("_config") || e.has("schemaFor") || e.has("_device")) && (this._shown = {
			...Gs(this._schema, Vs(this._schema, this._config, this._emptied)),
			...this._hasColorRows ? ss(this._draft) : {},
			...this._has("_device") && this._device !== void 0 ? { [ys]: this._device } : {},
			...this._has("_not_present") ? { [bs]: [...Qn(this._config)] } : {}
		});
	}
	_has(e) {
		return Q(this._schema).some(({ path: t }) => t === e);
	}
	get _hasColorRows() {
		return Q(this._schema).some(({ path: e }) => es(e) !== void 0);
	}
	_pickDevice() {
		return this.hass === void 0 ? void 0 : this._device;
	}
	_renderNotes() {
		let e = this._config ? Go(this._config, this.hass?.states) : [];
		return _`
      ${this._has("_device") ? _`<button
              type="button"
              class="suggest"
              ?disabled=${this._pickDevice() === void 0}
              @click=${this._suggest}
            >
              ${w.suggest.button}
            </button>` : y}
      ${this._report ? _`<ul class="report" role="status">
              <li>${w.suggest.filled(this._report.filled)}</li>
              ${this._report.empty.length > 0 ? _`<li>${w.suggest.empty(this._report.empty)}</li>` : y}
            </ul>` : y}
      ${e.length > 0 ? _`<p class="title">${w.suggest.warningsTitle}</p>
              <ul class="warnings">
                ${e.map((e) => _`<li>${e}</li>`)}
              </ul>` : y}
    `;
	}
	render() {
		if (!this._config) return y;
		let e = or(this._config);
		return _`
      ${e.length > 0 ? _`<p class="error" role="alert">${e.join("; ")}</p>` : y}
      ${this._formDefined ? _`<ha-form
                class="switch"
                .hass=${this.hass}
                .data=${this._switch}
                .schema=${Zs}
                .computeLabel=${Qs}
                @value-changed=${this._toggleAdvanced}
              ></ha-form>
              <ha-form
                .hass=${this.hass}
                .data=${this._shown}
                .schema=${this._formSchema}
                .computeLabel=${nc}
                @value-changed=${this._configChanged}
              ></ha-form>
              ${this._renderNotes()}` : _`<p class="hint">${w.noForm}</p>`}
    `;
	}
};
Ys([Xa({ attribute: !1 })], cc.prototype, "hass", void 0), Ys([Xa({ attribute: !1 })], cc.prototype, "schemaFor", void 0), Ys([Za()], cc.prototype, "_config", void 0), Ys([Za()], cc.prototype, "_switch", void 0), Ys([Za()], cc.prototype, "_device", void 0), Ys([Za()], cc.prototype, "_report", void 0), Ys([Za()], cc.prototype, "_formDefined", void 0), Qa(Xs, cc);
// src/diagram/source.ts
var lc = o`
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
    ${Sr}
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
`, uc = 3, dc = (e) => e === !0 ? uc : e === void 0 || e === !1 || !(e > 0) ? void 0 : Math.min(6, Math.max(.5, 120 / e)), fc = [
	0,
	72,
	144,
	216,
	288
].map((e) => v`<path class="fan-blade" d="M0 -4 C9 -6 21 -16 17 -30 C6 -26 -3 -17 -3 -6 Z" transform="rotate(${e})" />`);
function pc(e, t, n, r) {
	let { x: i, y: a, width: o, height: s, fanX: c, fanY: l, fanRadius: u, coil: d, fins: f, slats: p, dividerY: m } = N, h = dc(e), ee = Array.from({ length: f.count }, (e, t) => f.x + t * f.step), te = Array.from({ length: p.count }, (e, t) => p.y0 + t * p.step), [ne, g] = [i + 6, c + u + 6], re = c - u - 6 - ne, ie = xr(br(vr, n), n?.onTap);
	return v`<g class="air-unit${t ? " muted" : ""}" data-source="air">
    <rect class="source-outline" x=${i} y=${a} width=${o} height=${s} rx="6" />
    <path class="source-divider" d="M${i} ${m} H${i + o}" />
    ${te.map((e) => v`<path class="source-slat" data-slat d="M${ne} ${e} h${re} M${g} ${e} h${re}" />`)}
    <rect class="source-frame" data-coil-block x=${d.x} y=${d.y} width=${d.width} height=${d.height} rx="3" />
    ${ee.map((e) => v`<path class="source-fin" d="M${e} ${f.y0} V${f.y1}" />`)}
    <g class="fan-part" aria-label=${st} role=${ie.role} tabindex=${ie.tabindex} @click=${ie.click} @keydown=${ie.keydown}>
      <title>${st}</title>
      <circle class="fan-ring" cx=${c} cy=${l} r=${u} />
      <circle class="fan-hit" cx=${c} cy=${l} r=${u} fill="transparent" stroke="none" />
      <g class="fan" data-fan transform="translate(${c} ${l})">
        <g class=${h === void 0 ? "fan-rotor still" : "fan-rotor"} style=${h === void 0 ? "" : `--fan-duration: ${String(h)}s`}>${fc}<circle class="fan-hub" r="5" fill="var(--primary-text-color)" /></g>
      </g>
    </g>
    ${r ? v`<text class="source-caption" x=${N.captionX} y=${N.captionY} text-anchor="middle">${et.air}</text>` : y}
  </g>`;
}
function mc(e, t) {
	return di(e).flatMap(({ part: e }) => e.id.startsWith("src_") ? e.points.slice(1).flatMap((n, r) => {
		let i = e.points[r];
		return i?.[0] === n[0] && t >= Math.min(i[1], n[1]) && t <= Math.max(i[1], n[1]) ? [n[0]] : [];
	}) : []);
}
function hc(e, t, n, r) {
	let i = mc(e, n), a = Array.from({ length: Math.floor((Nr.end - Nr.start - 12) / 10) + 1 }, (e, t) => Nr.start + 6 + t * 10).filter((e) => !i.some((t) => Math.abs(t - e) < 10)), o = Pr.y[t];
	return v`<g class="ground-loop${r ? " muted" : ""}" data-source="ground">
    <path class="source-ground" d="M${Nr.start} ${n} H${Nr.end}" />
    ${a.map((e) => v`<path class="source-ground" d="M${e} ${n} l-6 8" />`)}
    ${e.captions === !1 ? y : v`<text class="source-caption" x=${Pr.x} y=${o} text-anchor="middle">${et.ground}</text>`}
  </g>`;
}
function gc(e, t, n, r) {
	let i = e.source === "air" || e.source === "hybrid", a = e.source === "ground" || e.source === "hybrid", o = e.source === "hybrid" ? "hybrid" : "ground";
	return v`<g class="source" data-source-kind=${e.source}>
    ${i ? pc(t["source.fan_speed"], !n, r, e.captions !== !1) : v``}
    ${a ? hc(e, o, I[o], !n) : v``}
  </g>`;
}
// src/lib/render.ts
function _c(e, t) {
	return e === t || Array.isArray(e) && Array.isArray(t) && e.length === t.length && e.every((e, n) => e === t[n]);
}
function vc(e, t) {
	if (e === t) return !0;
	if (typeof e != "object" || typeof t != "object" || e === null || t === null) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	return n.length === r.length && n.every((n) => Object.hasOwn(t, n) && _c(e[n], t[n]));
}
function yc(e, t, n) {
	return e === void 0 || e.locale !== t.locale || e.language !== t.language || e.localize !== t.localize || e.formatEntityState !== t.formatEntityState || e.themes?.darkMode !== t.themes?.darkMode || n.some((n) => e.states[n] !== t.states[n] || !vc(e.entities?.[n], t.entities?.[n]));
}
function bc(e, t, n, r) {
	return e.size === 1 && e.has("hass") ? t !== void 0 && yc(n, t, r) : !0;
}
// src/suggest/stub.ts
function xc(e, t, n) {
	let r = ko(e.states, t, e.devices ?? {}, n), i = Mo(r).replace(/_$/, "");
	if (i === "") return;
	let a = new Set(r.map((e) => e.entityId));
	return D.filter((e) => a.has(jt(e, i))).length * 2 >= D.length ? i : void 0;
}
function Sc(e) {
	if (e === void 0) return {};
	let t = /* @__PURE__ */ new Map();
	for (let n of Object.values(e.entities ?? {})) {
		if (typeof n.device_id != "string") continue;
		let e = t.get(n.device_id) ?? {};
		e[n.entity_id] = n, t.set(n.device_id, e);
	}
	let n = [...t].flatMap(([t, n]) => xc(e, n, t) ?? []);
	return n.length === 1 ? { prefix: n[0] } : {};
}
// src/card/ecogeo-card.ts
var Cc = "ecogeo-card", wc = Cr.width, Tc = Cr.height, Ec = 0;
Qa(Cc, class extends Ke {
	static {
		this.styles = [
			na,
			lc,
			fa,
			Ea,
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
		return document.createElement(Xs);
	}
	static getStubConfig(e) {
		return Sc(e);
	}
	constructor() {
		super(), this.renderedCompact = !1, this.renderedAutoCompact = !1, this.renderedStroke = Ai(void 0), this.entityIds = [], this.idPrefix = `ecogeo${String(++Ec)}`, this.width = 0;
	}
	get shownLayout() {
		return Ti(this.resolved?.layout ?? "auto", this.width, this.renderedAutoCompact) ? "compact" : "full";
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
		let t = or(e);
		if (t.length > 0) throw Error(t.join("; "));
		this.resolved = mr(e), this.entityIds = [...new Set(Object.values(this.resolved.entities).filter((e) => e !== void 0))], this.config = e;
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
			let e = Ai(this.width);
			return this.shownLayout === "compact" !== this.renderedCompact || e.pipe !== this.renderedStroke.pipe || e.outline !== this.renderedStroke.outline;
		}
		return bc(e, this.hass, this.renderedHass, this.entityIds);
	}
	readings(e) {
		let t = e.sample ? dr : this.hass?.states ?? {};
		return {
			readings: Ft(t, e.entities),
			offline: Ht(ht(t, e.entities["unit.connection"]))
		};
	}
	render() {
		this.renderedHass = this.hass;
		let e = this.shownLayout, t = e === "compact";
		this.renderedCompact = t, this.renderedAutoCompact = t && this.resolved?.layout === "auto";
		let n = Ai(this.width);
		this.renderedStroke = n;
		let r = this.resolved;
		if (r === void 0) return _`<ha-card data-layout=${e}><div class="diagram"></div></ha-card>`;
		let i = t ? {
			...r,
			detail: "simplified",
			captions: !1
		} : r, { readings: a, offline: o } = this.readings(i), s = Vt(a, i.features, i.states), c = Wt(s, i.features, i.dhw, a, !i.notPresent.has("brine.pump")), l = i.sample ? dr : this.hass?.states ?? {}, u = Lt(a, i.entities, l), d = {
			mode: s,
			circuits: c,
			readings: u,
			stops: i.colors
		}, f = {
			locale: ha(this.hass),
			entities: this.hass?.entities,
			states: l
		}, p = i.sample ? void 0 : (e) => {
			gt(this, e);
		}, m = {
			entities: i.entities,
			onTap: p
		};
		return _`<ha-card data-layout=${e}>
      <div class="diagram">
        <svg
          viewBox="0 0 ${wc} ${Tc}"
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label=${Ye}
          style="--dhw-tank-color: ${i.dhw === "unused" ? un : Wi(d)}; --ecogeo-coil-muted: ${pn(this.hass?.themes?.darkMode === !0)}; --pipe-width: ${String(n.pipe)}; --outline-width: ${String(n.outline)}"
        >
          ${v`${gc(i, u, c.active.has("brine"), m)}${pa(i, m)}${da(i, d, m, {
			mode: i.exchangerFill,
			idPrefix: this.idPrefix
		}, n.pipe)}`}
        </svg>
        ${Ka(Va(i, a, i.entities, f, t, i.notPresent), p)}
      </div>
      <div class="footer">
        <span class="mode">${Ze[s]}</span>
        ${qa(Ua(a, i.entities, f, t, i.notPresent), p)}
        ${Ut(a["unit.alarm"]) ? _`<span class="alarm">${Qe.alarm}</span>` : y}
        ${o ? _`<span class="offline">${Qe.offline}</span>` : y}
        ${i.sample ? _`<span class="sample">${Qe.sampleValues}</span>` : y}
      </div>
    </ha-card>`;
	}
});
// src/index.ts
var Dc = {
	type: Cc,
	...Je,
	preview: !0
};
function Oc(e = window) {
	let t = e.customCards ??= [];
	t.some((e) => e.type === Dc.type) || t.push({ ...Dc });
}
Oc();
export { Dc as CARD_ENTRY, Oc as registerCardPicker };
