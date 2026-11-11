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
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: ee, getOwnPropertySymbols: te, getPrototypeOf: ne } = Object, re = globalThis, ie = re.trustedTypes, ae = ie ? ie.emptyScript : "", oe = re.reactiveElementPolyfillSupport, se = (e, t) => e, ce = {
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
}, le = (e, t) => !l(e, t), ue = {
	attribute: !0,
	type: String,
	converter: ce,
	reflect: !1,
	useDefault: !1,
	hasChanged: le
};
Symbol.metadata ??= Symbol("metadata"), re.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var f = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = ue) {
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
		return this.elementProperties.get(e) ?? ue;
	}
	static _$Ei() {
		if (this.hasOwnProperty(se("elementProperties"))) return;
		let e = ne(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(se("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(se("properties"))) {
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
			let i = (n.converter?.toAttribute === void 0 ? ce : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? ce : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? le)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
f.elementStyles = [], f.shadowRootOptions = { mode: "open" }, f[se("elementProperties")] = /* @__PURE__ */ new Map(), f[se("finalized")] = /* @__PURE__ */ new Map(), oe?.({ ReactiveElement: f }), (re.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var de = globalThis, fe = (e) => e, pe = de.trustedTypes, me = pe ? pe.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, he = "$lit$", p = `lit$${Math.random().toFixed(9).slice(2)}$`, ge = "?" + p, _e = `<${ge}>`, m = document, h = () => m.createComment(""), g = (e) => e === null || typeof e != "object" && typeof e != "function", ve = Array.isArray, ye = (e) => ve(e) || typeof e?.[Symbol.iterator] == "function", be = "[ 	\n\f\r]", _ = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, xe = /-->/g, Se = />/g, v = RegExp(`>|${be}(?:([^\\s"'>=/]+)(${be}*=${be}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), Ce = /'/g, we = /"/g, Te = /^(?:script|style|textarea|title)$/i, Ee = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), y = Ee(1), b = Ee(2), x = Symbol.for("lit-noChange"), S = Symbol.for("lit-nothing"), De = /* @__PURE__ */ new WeakMap(), C = m.createTreeWalker(m, 129);
function Oe(e, t) {
	if (!ve(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return me === void 0 ? t : me.createHTML(t);
}
var ke = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = _;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === _ ? c[1] === "!--" ? o = xe : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = v) : (Te.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = v) : o = Se : o === v ? c[0] === ">" ? (o = i ?? _, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? v : c[3] === "\"" ? we : Ce) : o === we || o === Ce ? o = v : o === xe || o === Se ? o = _ : (o = v, i = void 0);
		let d = o === v && e[t + 1].startsWith("/>") ? " " : "";
		a += o === _ ? n + _e : l >= 0 ? (r.push(s), n.slice(0, l) + he + n.slice(l) + p + d) : n + p + (l === -2 ? t : d);
	}
	return [Oe(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Ae = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = ke(t, n);
		if (this.el = e.createElement(l, r), C.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = C.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(he)) {
					let t = u[o++], n = i.getAttribute(e).split(p), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Pe : r[1] === "?" ? Fe : r[1] === "@" ? Ie : Ne
					}), i.removeAttribute(e);
				} else e.startsWith(p) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (Te.test(i.tagName)) {
					let e = i.textContent.split(p), t = e.length - 1;
					if (t > 0) {
						i.textContent = pe ? pe.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], h()), C.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], h());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === ge) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(p, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += p.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = m.createElement("template");
		return n.innerHTML = e, n;
	}
};
function w(e, t, n = e, r) {
	if (t === x) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = g(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = w(e, i._$AS(e, t.values), i, r)), t;
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? m).importNode(t, !0);
		C.currentNode = r;
		let i = C.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Me(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Le(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = C.nextNode(), a++);
		}
		return C.currentNode = m, r;
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
		this.type = 2, this._$AH = S, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = w(this, e, t), g(e) ? e === S || e == null || e === "" ? (this._$AH !== S && this._$AR(), this._$AH = S) : e !== this._$AH && e !== x && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ye(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== S && g(this._$AH) ? this._$AA.nextSibling.data = e : this.T(m.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Ae.createElement(Oe(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new je(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = De.get(e.strings);
		return t === void 0 && De.set(e.strings, t = new Ae(e)), t;
	}
	k(t) {
		ve(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(h()), this.O(h()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = fe(e).nextSibling;
			fe(e).remove(), e = t;
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
		this.type = 1, this._$AH = S, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = S;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = w(this, e, t, 0), a = !g(e) || e !== this._$AH && e !== x, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = w(this, r[n + o], t, o), s === x && (s = this._$AH[o]), a ||= !g(s) || s !== this._$AH[o], s === S ? e = S : e !== S && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === S ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Pe = class extends Ne {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === S ? void 0 : e;
	}
}, Fe = class extends Ne {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== S);
	}
}, Ie = class extends Ne {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = w(this, e, t, 0) ?? S) === x) return;
		let n = this._$AH, r = e === S && n !== S || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== S && (n === S || r);
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
		w(this, e);
	}
}, Re = de.litHtmlPolyfillSupport;
Re?.(Ae, Me), (de.litHtmlVersions ??= []).push("3.3.3");
var ze = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Me(t.insertBefore(h(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Be = globalThis, T = class extends f {
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
		return x;
	}
};
T._$litElement$ = !0, T.finalized = !0, Be.litElementHydrateSupport?.({ LitElement: T });
var Ve = Be.litElementPolyfillSupport;
Ve?.({ LitElement: T }), (Be.litElementVersions ??= []).push("4.2.2");
// src/calc/mode.ts
var He = [
	"off",
	"unavailable",
	"unknown"
], Ue = (e, t) => e?.trim().toLowerCase() === t, We = (e) => e !== void 0 && e > 0;
function Ge(e, t) {
	if (Ue(e["unit.on_off"], "off")) return "off";
	if (Ue(e["compressor.mode"], "defrost")) return "defrost";
	let n = e["compressor.speed"];
	if (n === void 0) return "standby";
	let r = e["unit.summer"] === !0;
	return We(n) ? e["dhw.demand"] === !0 ? "dhw" : r && t.active_cooling === !0 ? "active_cooling" : "heating" : r && We(e["production.pump"]) && t.passive_cooling === !0 ? "passive_cooling" : "standby";
}
function Ke(e) {
	return e !== void 0 && He.includes(e.state.trim().toLowerCase());
}
var qe = (e) => e === !0;
// src/calc/circuits.ts
function Je(e, t, n, r) {
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
	return We(r["brine.pump"]) || i.delete("brine"), {
		valve26: e === "dhw" ? "dhw" : "production",
		valve14: e === "active_cooling" ? "reversed" : "normal",
		valves2728: (e === "passive_cooling" || e === "defrost") && a ? "exchanger" : "closed",
		active: i
	};
}
// src/lib/availability.ts
var Ye = /* @__PURE__ */ new Set(["unknown", "unavailable"]), Xe = -999, Ze = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;
function Qe(e) {
	if (!Ze.test(e)) return;
	let t = Number(e);
	return Number.isFinite(t) ? t + 0 : void 0;
}
function $e(e) {
	if (e === void 0 || Ye.has(e.state)) return !0;
	let t = Qe(e.state);
	return t !== void 0 && t <= Xe;
}
function et(e) {
	if (!(e === void 0 || $e(e))) return Qe(e.state);
}
// src/lib/hass.ts
var tt = (e, t) => t === void 0 ? void 0 : e[t];
function nt(e, t) {
	e.dispatchEvent(new CustomEvent("hass-more-info", {
		detail: { entityId: t },
		bubbles: !0,
		composed: !0
	}));
}
// src/lib/units.ts
var rt = { scale: 1 }, it = {
	scale: 5 / 9,
	offset: -32
}, at = {
	temperature: /* @__PURE__ */ new Map([["°c", rt], ["°f", it]]),
	difference: /* @__PURE__ */ new Map([
		["k", rt],
		["°c", rt],
		["°f", it]
	]),
	power: /* @__PURE__ */ new Map([["w", rt], ["kw", { scale: 1e3 }]])
};
function ot(e) {
	return e.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase();
}
function st(e, t) {
	let n = et(e);
	return n === void 0 ? void 0 : ct(t, n, e?.attributes.unit_of_measurement);
}
function ct(e, t, n) {
	if (!Number.isFinite(t) || n === void 0) return;
	let r = at[e].get(ot(n));
	return r ? (t + (r.offset ?? 0)) * r.scale : void 0;
}
// src/strings.ts
var E = {
	invalid: (e, t) => `Invalid option ${e}: expected ${t}`,
	number: (e, t) => `a number from ${e} to ${t}`,
	color: "a CSS colour such as #db4437 or rgb(219, 68, 55)",
	boolean: "true or false",
	object: "a group of options",
	choice: (e) => `one of ${e.join(", ")}`,
	list: "a list of texts"
}, lt = {
	name: "ecoGEO Schematic",
	description: "The internal schematic of an Ecoforest ecoGEO heat pump, with live values and pipes coloured by temperature."
}, ut = "ecoGEO heat pump schematic", D = {
	celsius: "°C",
	kelvin: "K",
	bar: "bar",
	percent: "%",
	rpm: "rpm",
	watt: "W"
}, dt = {
	off: "Off",
	defrost: "Defrost",
	dhw: "DHW",
	active_cooling: "Active cooling",
	heating: "Heating",
	passive_cooling: "Passive cooling",
	standby: "Standby"
}, ft = {
	alarm: "Alarm",
	offline: "Offline",
	sampleValues: "Sample values"
}, O = {
	unknownOption: (e) => `Unknown option ${e}`,
	unknownFeature: (e, t) => `Unknown feature ${e}: expected one of ${t.join(", ")}`,
	unknownRole: (e) => `Unknown entity role ${e}`,
	notEntityId: (e) => `Invalid entity for ${e}: expected an entity id such as sensor.name`,
	featureState: (e) => `Invalid option features.${e}: expected true, false or unused`,
	integer: (e, t) => `a whole number from ${e} to ${t}`,
	prefix: "a prefix of lowercase letters, digits and underscores",
	colors: "Invalid option colors: expected an ascending list of 2 to 8 stops, each { temperature, color } with a number and a CSS colour",
	dhwMismatch: (e, t) => `Invalid option dhw: ${e} does not fit model ${t}`
}, pt = {
	dg1: "DG1",
	outerLoop: "Outer loop",
	dhw: "DHW"
}, mt = {
	air: "Air unit",
	ground: "Ground loop"
}, ht = {
	externalTank: "DHW tank",
	demand: "Demand"
}, gt = { demand: "Demand" }, k = {
	setpoint: "Setpoint",
	startDelta: "Start ΔT",
	fan: "Fan",
	outside: "Outside",
	airOutlet: "Outlet",
	groundIn: "In",
	groundOut: "Out"
}, A = {
	outside: "Outside",
	cop: "COP",
	condensation: "Condensation",
	evaporation: "Evaporation",
	summer: "Summer",
	winter: "Winter"
}, _t = {
	on: "On",
	off: "Off",
	emergency: "Emergency"
}, j = D.celsius, M = [
	{
		path: "production.outlet_temperature",
		domain: "sensor",
		suffix: "production_out",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "33"
	},
	{
		path: "production.return_temperature",
		domain: "sensor",
		suffix: "production_in",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "34"
	},
	{
		path: "production.pressure",
		domain: "sensor",
		suffix: "pressure_production",
		kind: "number",
		unit: D.bar,
		decimals: 1,
		item: "38"
	},
	{
		path: "production.pump",
		domain: "sensor",
		suffix: "production_pump",
		kind: "number",
		unit: D.percent,
		decimals: 1,
		item: "15"
	},
	{
		path: "brine.outlet_temperature",
		domain: "sensor",
		suffix: "brine_out",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "31"
	},
	{
		path: "brine.inlet_temperature",
		domain: "sensor",
		suffix: "brine_in",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "32"
	},
	{
		path: "brine.pressure",
		domain: "sensor",
		suffix: "pressure_brine",
		kind: "number",
		unit: D.bar,
		decimals: 1,
		item: "37"
	},
	{
		path: "brine.pump",
		domain: "sensor",
		suffix: "brine_pump",
		kind: "number",
		unit: D.percent,
		decimals: 1,
		item: "16"
	},
	{
		path: "compressor.speed",
		domain: "sensor",
		suffix: "compressor_rpm",
		kind: "number",
		unit: D.rpm,
		decimals: 0,
		item: "11"
	},
	{
		path: "compressor.percentage",
		domain: "sensor",
		suffix: "compressor_percentage",
		kind: "number",
		unit: D.percent,
		decimals: 1,
		item: "11"
	},
	{
		path: "compressor.power",
		domain: "sensor",
		suffix: "power_consumption",
		kind: "number",
		quantity: "power",
		unit: D.watt,
		decimals: 0,
		item: "11"
	},
	{
		path: "compressor.suction_temperature",
		domain: "sensor",
		suffix: "compressor_suction_temperature",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "29"
	},
	{
		path: "compressor.discharge_temperature",
		domain: "sensor",
		suffix: "compressor_discharge_temperature",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "30"
	},
	{
		path: "compressor.suction_pressure",
		domain: "sensor",
		suffix: "compressor_suction_pressure",
		kind: "number",
		unit: D.bar,
		decimals: 1,
		item: "35"
	},
	{
		path: "compressor.discharge_pressure",
		domain: "sensor",
		suffix: "compressor_discharge_pressure",
		kind: "number",
		unit: D.bar,
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
		unit: j,
		decimals: 1,
		item: "8"
	},
	{
		path: "refrigerant.evaporation_temperature",
		domain: "sensor",
		suffix: "evaporation_temperature",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "7"
	},
	{
		path: "refrigerant.superheat",
		domain: "sensor",
		suffix: "superheat",
		kind: "number",
		quantity: "difference",
		unit: D.kelvin,
		decimals: 1,
		item: "12"
	},
	{
		path: "refrigerant.expansion_valve",
		domain: "sensor",
		suffix: "expansion_valve_position",
		kind: "number",
		unit: D.percent,
		decimals: 0,
		item: "12"
	},
	{
		path: "heating.capacity",
		domain: "sensor",
		suffix: "condensation_capacity",
		kind: "number",
		quantity: "power",
		unit: D.watt,
		decimals: 0,
		item: "8"
	},
	{
		path: "cooling.capacity",
		domain: "sensor",
		suffix: "evaporation_capacity",
		kind: "number",
		quantity: "power",
		unit: D.watt,
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
		unit: j,
		decimals: 1,
		item: "1/2"
	},
	{
		path: "dhw.temperature",
		domain: "sensor",
		suffix: "dhw_temperature",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "tank (54 on C)"
	},
	{
		path: "dhw.setpoint",
		domain: "number",
		suffix: "dhw_setpoint",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 0,
		item: "tank"
	},
	{
		path: "dhw.start_delta",
		domain: "number",
		suffix: "delta_t_start_dhw",
		kind: "number",
		quantity: "difference",
		unit: D.kelvin,
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
		unit: D.percent,
		decimals: 1,
		item: "air unit"
	},
	{
		path: "source.air_unit_outlet_temperature",
		domain: "sensor",
		suffix: "brine_temperature_air_unit_outlet",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "air unit"
	},
	{
		path: "source.outside_temperature",
		domain: "sensor",
		suffix: "outside_temperature",
		kind: "number",
		quantity: "temperature",
		unit: j,
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
], vt = new Map(M.map((e) => [e.path, e])), yt = M.map((e) => e.path);
[...new Set(M.flatMap((e) => "unit" in e ? [e.unit] : []))];
var bt = (e, t) => `${e.domain}.${t}_${e.suffix}`;
// src/calc/readings.ts
function xt(e, t) {
	return t.quantity === void 0 ? et(e) : st(e, t.quantity);
}
function St(e, t) {
	switch (t.kind) {
		case "number": return xt(e, t);
		case "text": return e === void 0 || $e(e) || ["unavailable", "unknown"].includes(e.state.trim().toLowerCase()) ? void 0 : e.state.trim();
		case "binary": {
			let t = e?.state.trim().toLowerCase();
			return t === "on" || t !== "off" && void 0;
		}
	}
}
function Ct(e, t) {
	return Object.fromEntries(M.map((n) => [n.path, St(tt(e, t[n.path]), n)]));
}
// src/lib/config.ts
var wt = /^[a-z][a-z0-9_]*\.[a-z0-9_]+$/;
function N(e, t) {
	let n = e;
	for (let e of t.split(".")) {
		if (typeof n != "object" || !n || !Object.hasOwn(n, e)) return;
		n = n[e];
	}
	return n;
}
function Tt(e) {
	if (typeof e != "string") return;
	let t = e.trim();
	return wt.test(t) ? t : void 0;
}
function Et(e, t) {
	return Tt(N(e, t));
}
// src/lib/options.ts
var Dt = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, Ot = /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|var)\((.*)\)$/i, kt = /^[#a-zA-Z0-9(),.%\s/+-]+$/, At = /* @__PURE__ */ new Set(/* @__PURE__ */ "aliceblue.antiquewhite.aqua.aquamarine.azure.beige.bisque.black.blanchedalmond.blue.blueviolet.brown.burlywood.cadetblue.chartreuse.chocolate.coral.cornflowerblue.cornsilk.crimson.cyan.darkblue.darkcyan.darkgoldenrod.darkgray.darkgreen.darkgrey.darkkhaki.darkmagenta.darkolivegreen.darkorange.darkorchid.darkred.darksalmon.darkseagreen.darkslateblue.darkslategray.darkslategrey.darkturquoise.darkviolet.deeppink.deepskyblue.dimgray.dimgrey.dodgerblue.firebrick.floralwhite.forestgreen.fuchsia.gainsboro.ghostwhite.gold.goldenrod.gray.green.greenyellow.grey.honeydew.hotpink.indianred.indigo.ivory.khaki.lavender.lavenderblush.lawngreen.lemonchiffon.lightblue.lightcoral.lightcyan.lightgoldenrodyellow.lightgray.lightgreen.lightgrey.lightpink.lightsalmon.lightseagreen.lightskyblue.lightslategray.lightslategrey.lightsteelblue.lightyellow.lime.limegreen.linen.magenta.maroon.mediumaquamarine.mediumblue.mediumorchid.mediumpurple.mediumseagreen.mediumslateblue.mediumspringgreen.mediumturquoise.mediumvioletred.midnightblue.mintcream.mistyrose.moccasin.navajowhite.navy.oldlace.olive.olivedrab.orange.orangered.orchid.palegoldenrod.palegreen.paleturquoise.palevioletred.papayawhip.peachpuff.peru.pink.plum.powderblue.purple.rebeccapurple.red.rosybrown.royalblue.saddlebrown.salmon.sandybrown.seagreen.seashell.sienna.silver.skyblue.slateblue.slategray.slategrey.snow.springgreen.steelblue.tan.teal.thistle.tomato.turquoise.violet.wheat.white.whitesmoke.yellow.yellowgreen.transparent.currentcolor".split("."));
function jt(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) if (e[n] === "(" && t++, e[n] === ")" && (t--, t < 0 || t === 0 && n !== e.length - 1)) return !1;
	return t === 0;
}
function Mt(e) {
	let t = e.trim();
	if (t.length === 0 || t.length > 100 || !kt.test(t)) return !1;
	if (Dt.test(t) || At.has(t.toLowerCase())) return !0;
	let n = Ot.exec(t);
	if (n === null || !jt(t)) return !1;
	if (n[1]?.toLowerCase() !== "var") return !0;
	let [r, ...i] = (n[2] ?? "").split(",");
	return /^\s*--[a-zA-Z0-9-]+\s*$/.test(r ?? "") && (i.length === 0 || Mt(i.join(",")));
}
var Nt = (e) => e == null;
function Pt(e) {
	switch (e.kind) {
		case "number": return E.number(String(e.min), String(e.max));
		case "color": return E.color;
		case "boolean": return E.boolean;
		case "choice": return E.choice(e.choices);
		case "list": return E.list;
	}
}
var Ft = (e) => e === null || [
	"string",
	"number",
	"boolean"
].includes(typeof e);
function It(e) {
	return e.map((e) => typeof e == "boolean" ? e ? "on" : "off" : e === null ? "" : String(e)).filter((e) => e.trim() !== "");
}
function Lt(e, t) {
	switch (e.kind) {
		case "number": return typeof t == "number" && Number.isFinite(t) && t >= e.min && t <= e.max;
		case "color": return typeof t == "string" && Mt(t);
		case "boolean": return typeof t == "boolean";
		case "choice": return typeof t == "string" && e.choices.includes(t);
		case "list": return Array.isArray(t) && t.every(Ft);
	}
}
function Rt(e, t) {
	let n = t.split(".").slice(0, -1);
	for (let t = 1; t <= n.length; t++) {
		let r = n.slice(0, t).join("."), i = N(e, r);
		if (!Nt(i) && (typeof i != "object" || Array.isArray(i))) return r;
	}
}
function zt(e, t) {
	let n = t.flatMap((t) => {
		let n = Rt(e, t.path);
		if (n !== void 0) return [E.invalid(n, E.object)];
		let r = N(e, t.path);
		return Nt(r) || Lt(t, r) ? [] : [E.invalid(t.path, Pt(t))];
	});
	return [...new Set(n)];
}
function Bt(e, t) {
	let n = N(e, t.path);
	if (t.kind === "list" && Array.isArray(n) && Lt(t, n)) {
		let e = It(n);
		return e.length > 0 ? e : t.default;
	}
	return Nt(n) || !Lt(t, n) ? t.default : n;
}
// src/diagram/colors.ts
var Vt = [
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
], Ht = "var(--disabled-text-color)", Ut = (e) => typeof e == "object" && !!e && !Array.isArray(e), Wt = (e) => typeof e == "string" && zt({ color: e }, [{
	kind: "color",
	path: "color",
	default: ""
}]).length === 0, Gt = (e) => e.map((e) => ({
	temperature: e.temperature,
	color: e.color.trim()
}));
function Kt(e) {
	let t = N(e, "colors");
	if (t == null) return [];
	if (!Array.isArray(t) || t.length < 2 || t.length > 8) return [O.colors];
	let n = t;
	if (!n.every((e) => Ut(e) && typeof e.temperature == "number" && Number.isFinite(e.temperature) && Wt(e.color))) return [O.colors];
	let r = Gt(n).map((e) => e.temperature);
	return r.every((e, t) => t === 0 || e > (r[t - 1] ?? 0)) ? [] : [O.colors];
}
function qt(e) {
	let t = N(e, "colors");
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
], P = [
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
], tn = {
	kind: "choice",
	path: "model",
	default: "B",
	choices: Qt
}, nn = {
	kind: "choice",
	path: "source",
	default: "ground",
	choices: $t
}, rn = {
	kind: "choice",
	path: "dhw",
	default: "external",
	choices: en
}, an = [
	tn,
	nn,
	rn
], on = [
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
], sn = (e) => e === "C" ? "internal" : "external", F = (e) => e == null, cn = (e) => F(e) || typeof e == "string" && e.trim() === "", I = (e) => typeof e == "object" && !!e && !Array.isArray(e), ln = /^[a-z0-9_]+$/;
function un(e) {
	let t = N(e, "prefix");
	return cn(t) ? void 0 : t.trim();
}
function dn(e) {
	let t = N(e, "variant");
	return P.find((e) => e === t) ?? 4;
}
function fn(e) {
	let t = Bt(e, tn), n = !F(N(e, "dhw"));
	return {
		model: t,
		source: Bt(e, nn),
		dhw: n ? Bt(e, rn) : sn(t)
	};
}
function pn(e) {
	let t = N(e, "features");
	if (!I(t)) return {};
	let n = {};
	for (let e of Yt) {
		let r = t[e];
		(r === !0 || r === !1 || r === "unused") && (n[e] = r);
	}
	return n;
}
var mn = (e) => e === !0 || e === !1 || e === "unused";
function hn(e, t = "") {
	return Object.entries(e).flatMap(([e, n]) => {
		let r = t === "" ? e : `${t}.${e}`;
		return I(n) ? hn(n, r) : [[r, n]];
	});
}
function gn(e) {
	let t = N(e, "variant");
	return F(t) || P.some((e) => e === t) ? [] : [E.invalid("variant", O.integer(String(P[0]), String(P[P.length - 1])))];
}
function _n(e) {
	let t = N(e, "prefix");
	return cn(t) || typeof t == "string" && ln.test(t.trim()) ? [] : [E.invalid("prefix", O.prefix)];
}
function vn(e) {
	let t = N(e, "features");
	return F(t) ? [] : I(t) ? Object.entries(t).flatMap(([e, t]) => Yt.some((t) => t === e) ? F(t) || mn(t) ? [] : [O.featureState(e)] : [O.unknownFeature(e, Yt)]) : [E.invalid("features", E.object)];
}
function yn(e) {
	let t = N(e, "entities");
	return F(t) ? [] : I(t) ? hn(t).flatMap(([e, t]) => cn(t) ? [] : vt.has(e) ? Tt(t) === void 0 ? [O.notEntityId(e)] : [] : [O.unknownRole(e)]) : [E.invalid("entities", E.object)];
}
function bn(e) {
	let t = N(e, "entities");
	return I(t) && hn(t).some(([, e]) => !cn(e));
}
function xn(e) {
	let t = Object.keys(e).filter((e) => !on.includes(e)).map((e) => O.unknownOption(e)), n = zt(e, an), r = [
		...t,
		...n,
		...gn(e),
		..._n(e),
		...vn(e),
		...yn(e),
		...Kt(e)
	];
	if (zt(e, [tn, rn]).length === 0 && !F(N(e, "dhw"))) {
		let { model: t, dhw: n } = fn(e);
		(t === "B" && n === "internal" || t === "C" && n === "external") && r.push(O.dhwMismatch(n, t));
	}
	return r;
}
// src/config/sample.ts
var Sn = (e) => `ecogeo_sample.${e.replace(".", "_")}`, Cn = {
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
}, wn = "2026-01-01T12:00:00Z", Tn = Object.fromEntries(yt.map((e) => [e, Sn(e)])), En = Object.fromEntries(yt.map((e) => {
	let t = vt.get(e)?.unit, n = Sn(e);
	return [n, {
		entity_id: n,
		state: Cn[e],
		last_updated: wn,
		attributes: t === void 0 ? {} : { unit_of_measurement: t }
	}];
}));
// src/config/resolve.ts
function Dn(e, t) {
	return Object.fromEntries(M.map((n) => [n.path, Et(e, `entities.${n.path}`) ?? (t === void 0 ? void 0 : bt(n, t))]));
}
var On = (e) => un(e) === void 0 && !bn(e);
function kn(e) {
	let t = un(e), n = dn(e), r = On(e);
	return {
		...fn(e),
		variant: n,
		prefix: t,
		colors: qt(e),
		features: Zt(n, pn(e)),
		entities: r ? Tn : Dn(e, t),
		sample: r
	};
}
// src/diagram/geometry.ts
var An = {
	width: 1e3,
	height: 620
}, jn = {
	x: 240,
	y: 130,
	width: 520,
	height: 475
}, L = {
	x: 408,
	y: 138,
	width: 182,
	height: 66
}, Mn = {
	x: 806,
	y: 150,
	width: 178,
	height: 180
}, R = {
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
}, Nn = {
	ground: 160,
	hybrid: 350
}, Pn = {
	x: 105,
	y: {
		ground: 320,
		hybrid: 510
	}
}, z = (e, t, n, r, i, a, o = {}) => ({
	item: e,
	kind: t,
	x: n,
	y: r,
	rotation: i,
	tag: a,
	...o
}), Fn = [
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
	], { size: 34 }),
	z(8, "exchanger", 432, 382, 0, [
		-26,
		6,
		"end"
	], { size: 34 }),
	z(9, "exchanger", 373, 273, 0, [
		26,
		-2,
		"start"
	], {
		size: 23,
		feature: "htr"
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
	]),
	z(40, "pressure_switch", 452, 234, 0, [
		0,
		-14,
		"middle"
	]),
	z(41, "service_outlet", 464, 406, 0, [
		0,
		28,
		"middle"
	]),
	z(41, "service_outlet", 620, 270, 90, [
		0,
		14,
		"middle"
	]),
	z(10, "exchanger", 520, 470, 0, [
		28,
		4,
		"start"
	], {
		size: 22,
		feature: "passive_cooling"
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
	]),
	z(19, "vessel", 368, 556, 0, [
		-16,
		4,
		"end"
	]),
	z(20, "safety_valve", 741, 440, 90, [
		0,
		-14,
		"middle"
	]),
	z(21, "safety_valve", 384, 520, 90, [
		0,
		-14,
		"middle"
	]),
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
	]),
	z(24, "drain_valve", 404, 572, 0, [
		14,
		4,
		"start"
	]),
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
	z(50, "tank", L.x + L.width / 2, L.y + L.height / 2, 0, [
		-80,
		-17,
		"start"
	], { dhw: "internal" }),
	z(51, "coil", 495, 185, 0, [
		0,
		-25,
		"middle"
	], { dhw: "internal" }),
	z(52, "service_outlet", 395, 162, 0, [
		-8,
		4,
		"end"
	], { dhw: "internal" }),
	z(53, "drain_valve", 599, 196, 270, [
		0,
		-12,
		"middle"
	], { dhw: "internal" }),
	z(54, "probe_t", 574, 171, 270, [
		0,
		-14,
		"middle"
	], { dhw: "internal" })
], In = (e) => e.split(" ").map((e) => {
	let [t, n] = e.split(",").map(Number);
	return [t ?? 0, n ?? 0];
}), B = (e, t, n, r, i = {}) => ({
	id: e,
	circuit: t,
	points: In(n),
	temperatureRole: r,
	direction: 1,
	...i
}), V = ["production_dg1"], H = ["production_dg1", "production_dhw"], U = "production.outlet_temperature", W = "production.return_temperature", G = "production.pump", K = "brine.inlet_temperature", q = "brine.outlet_temperature", J = "brine.pump", Y = "compressor.discharge_temperature", Ln = "compressor.suction_temperature", Rn = "refrigerant.condensation_temperature", zn = "refrigerant.evaporation_temperature", X = "compressor.percentage", Z = "dhw.temperature", Bn = "source.air_unit_outlet_temperature", Vn = [
	"dhw_sup_b",
	"dhw_sup_c",
	"dhw_ret_b",
	"dhw_ret_c",
	"dhw_ext_in",
	"dhw_ext_coil",
	"dhw_ext_out"
], Hn = [
	B("p1_stub", V, "270,130 270,118", U, { stub: !0 }),
	B("p2_stub", V, "312,118 312,130", W, { stub: !0 }),
	B("p1_up", V, "270,160 270,130", U, {
		dhw: "any",
		speedRole: G
	}),
	B("p1_direct", V, "270,184 270,130", U, {
		dhw: "none",
		speedRole: G
	}),
	B("p2_in", V, "312,130 312,198", W, { speedRole: G }),
	B("prod_44_26", H, "270,292 270,184", U, { speedRole: G }),
	B("prod_bypass44", H, "270,348 270,292", U, {
		bypass: "backup_heater",
		speedRole: G
	}),
	B("prod_8_44", H, "420,348 270,348", U, { speedRole: G }),
	B("prod_15_8", H, "397,416 420,416", W, { speedRole: G }),
	B("trunk", H, "312,198 312,416", W, { speedRole: G }),
	B("prod_27_in", H, "312,416 338,416", W, {
		through: "passive_cooling",
		speedRole: G,
		onlyWhen: { valves2728: "closed" }
	}),
	B("prod_27_15", H, "362,416 373,416", W, {
		through: "passive_cooling",
		speedRole: G
	}),
	B("prod_bypass27", H, "312,416 373,416", W, {
		bypass: "passive_cooling",
		speedRole: G
	}),
	B("prod_10_in", ["exchanger_10"], "312,416 312,492 508,492", W, {
		feature: "passive_cooling",
		speedRole: G
	}),
	B("prod_10_out", ["exchanger_10"], "508,448 350,448 350,428", U, {
		feature: "passive_cooling",
		speedRole: G
	}),
	B("prod_tap_a", H, "368,416 368,520", W, { stub: !0 }),
	B("prod_tap_b", H, "368,520 368,544", W, { stub: !0 }),
	B("prod_drain", H, "404,416 404,563", W, { stub: !0 }),
	B("dhw_sup_a", ["production_dhw"], "282,172 361,172", U, {
		dhw: "any",
		speedRole: G
	}),
	B("dhw_sup_b", ["dhw_coil"], "361,172 420,172", U, {
		dhw: "any",
		speedRole: G
	}),
	B("dhw_sup_c", ["dhw_coil"], "420,172 722,172 722,130", U, {
		dhw: "external",
		speedRole: G
	}),
	B("dhw_ret_c", ["dhw_coil"], "748,130 748,198 420,198", W, {
		dhw: "external",
		speedRole: G
	}),
	B("dhw_ret_b", ["dhw_coil"], "420,198 340,198", W, {
		dhw: "any",
		speedRole: G
	}),
	B("dhw_ret_a", ["production_dhw"], "340,198 312,198", W, {
		dhw: "any",
		speedRole: G
	}),
	B("htr_in", ["htr"], "340,198 340,214", Z, {
		feature: "htr",
		dhw: "any"
	}),
	B("htr_pump", ["htr"], "340,238 340,247", Z, {
		feature: "htr",
		dhw: "any"
	}),
	B("htr_to_9", ["htr"], "340,265 340,296 361,296", Z, {
		feature: "htr",
		dhw: "any"
	}),
	B("htr_drain", ["htr"], "340,296 340,309", Z, {
		feature: "htr",
		dhw: "any",
		stub: !0
	}),
	B("htr_riser", ["htr"], "361,250 361,172", Z, {
		feature: "htr",
		dhw: "any"
	}),
	B("dhw_ext_in", ["dhw_coil"], "722,130 722,50 940,50 940,190", U, {
		dhw: "external",
		speedRole: G
	}),
	B("dhw_ext_coil", ["dhw_coil"], "940,190 840,190 840,235 940,235 940,280 840,280", U, {
		dhw: "external",
		speedRole: G
	}),
	B("dhw_ext_out", ["dhw_coil"], "840,280 820,280 820,85 748,85 748,130", W, {
		dhw: "external",
		speedRole: G
	}),
	B("tap_47", ["dhw_coil"], "440,118 440,138", Z, {
		dhw: "internal",
		stub: !0
	}),
	B("tap_48", ["dhw_coil"], "490,138 490,118", Z, {
		dhw: "internal",
		stub: !0
	}),
	B("tap_49", ["dhw_coil"], "540,118 540,138", Z, {
		dhw: "internal",
		stub: !0
	}),
	B("src_out", ["brine"], "630,130 630,85 150,85", q, { speedRole: J }),
	B("src_in", ["brine"], "20,50 690,50 690,130", K, { speedRole: J }),
	B("src_air_feed", ["brine"], "150,85 150,150", q, {
		source: ["air", "hybrid"],
		speedRole: J
	}),
	B("src_air_coil", ["brine"], "150,150 70,150 70,168 150,168 150,186 70,186", q, {
		source: ["air", "hybrid"],
		speedRole: J
	}),
	B("src_air_exit", ["brine"], "70,186 20,186 20,50", Bn, {
		source: ["air"],
		speedRole: J
	}),
	B("src_gnd_feed", ["brine"], "150,85 150,210", q, {
		source: ["ground"],
		speedRole: J
	}),
	B("src_gnd_loop", ["brine"], "150,210 60,210 60,250 150,250 150,290 20,290", q, {
		source: ["ground"],
		speedRole: J
	}),
	B("src_gnd_exit", ["brine"], "20,290 20,50", K, {
		source: ["ground"],
		speedRole: J
	}),
	B("src_hyb_link", ["brine"], "70,186 29,186 29,390", Bn, {
		source: ["hybrid"],
		speedRole: J
	}),
	B("src_hyb_loop", ["brine"], "29,390 150,390 150,420 60,420 60,450 150,450 150,480 20,480", Bn, {
		source: ["hybrid"],
		speedRole: J
	}),
	B("src_hyb_exit", ["brine"], "20,480 20,50", K, {
		source: ["hybrid"],
		speedRole: J
	}),
	B("ref_discharge", ["refrigerant"], "496,250 385,250", Y, {
		through: "htr",
		speedRole: X
	}),
	B("ref_9_14", ["refrigerant"], "385,296 416,296", Y, {
		through: "htr",
		speedRole: X
	}),
	B("ref_discharge_direct", ["refrigerant"], "496,250 416,250 416,296", Y, {
		bypass: "htr",
		speedRole: X
	}),
	B("ref_14_8", ["refrigerant"], "444,306 444,348", Y, {
		through: "active_cooling",
		reversible: !0,
		speedRole: X
	}),
	B("ref_7_14", ["refrigerant"], "560,348 560,296 444,296", Ln, {
		through: "active_cooling",
		reversible: !0,
		speedRole: X
	}),
	B("ref_suction", ["refrigerant"], "444,286 610,286 610,250 524,250", Ln, {
		through: "active_cooling",
		speedRole: X
	}),
	B("ref_direct_8", ["refrigerant"], "416,296 444,296 444,348", Y, {
		bypass: "active_cooling",
		speedRole: X
	}),
	B("ref_direct_suction", ["refrigerant"], "560,348 560,286 610,286 610,250 524,250", Ln, {
		bypass: "active_cooling",
		speedRole: X
	}),
	B("ref_8_13", ["refrigerant"], "444,416 473,416", Rn, {
		reversible: !0,
		speedRole: X
	}),
	B("ref_13_12", ["refrigerant"], "501,416 515,416", Rn, {
		reversible: !0,
		speedRole: X
	}),
	B("ref_12_7", ["refrigerant"], "539,416 560,416", zn, {
		reversible: !0,
		speedRole: X
	}),
	B("ln4_a", ["brine"], "690,130 690,288", K, { speedRole: J }),
	B("ln4_b", ["brine"], "690,312 690,348", K, { speedRole: J }),
	B("br_feed7", ["brine"], "690,348 584,348", K, {
		speedRole: J,
		onlyWhen: { valves2728: "closed" }
	}),
	B("brine_7_28", ["brine"], "584,416 598,416", q, {
		through: "passive_cooling",
		speedRole: J,
		onlyWhen: { valves2728: "closed" }
	}),
	B("brine_28_ln3", ["brine"], "622,416 630,416", q, {
		through: "passive_cooling",
		speedRole: J
	}),
	B("brine_bypass28", ["brine"], "584,416 630,416", q, {
		bypass: "passive_cooling",
		speedRole: J
	}),
	B("ln3", ["brine"], "630,416 630,130", q, { speedRole: J }),
	B("br_10_in", ["exchanger_10"], "690,348 690,448 532,448", K, {
		feature: "passive_cooling",
		speedRole: J
	}),
	B("br_10_28", ["exchanger_10"], "532,492 610,492 610,428", q, {
		feature: "passive_cooling",
		speedRole: J
	}),
	B("brine_tap_a", ["brine"], "690,270 725,270 725,480", K, { stub: !0 }),
	B("brine_tap_b", ["brine"], "725,480 725,508", K, { stub: !0 }),
	B("brine_drain", ["brine"], "630,416 630,563", q, { stub: !0 })
], Un = [
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
], Wn = [
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
], Gn = (e, t) => t === "htr" && e.dhw === "none" ? !1 : e.features[t], Kn = (e, t) => e === "any" ? t !== "none" : e === t;
function qn(e, t) {
	if (e.source !== void 0 && !e.source.includes(t.source) || e.dhw !== void 0 && !Kn(e.dhw, t.dhw) || e.bypass !== void 0 && Gn(t, e.bypass) !== !1 || e.through !== void 0 && Gn(t, e.through) === !1) return "hidden";
	if (e.feature !== void 0) {
		let n = Gn(t, e.feature);
		if (n === !1) return "hidden";
		if (n === "unused") return "muted";
	}
	return "normal";
}
function Jn(e, t) {
	return e.flatMap((e) => {
		let n = qn(e, t);
		return n === "hidden" ? [] : [{
			part: e,
			state: n
		}];
	});
}
var Yn = (e) => Jn(Fn, e), Xn = (e) => Jn(Hn, e), Zn = (e, t) => (e.onlyWhen === void 0 || e.onlyWhen.valves2728 === t.valves2728) && e.circuit.some((e) => t.active.has(e)), Qn = (e, t) => e[0] === t[0] && e[1] === t[1];
function $n(e, t) {
	let n = e[t];
	if (n === void 0) throw Error(`No point ${String(t)}`);
	return n;
}
var er = (e) => e.slice(1).map((t, n) => [$n(e, n), t]), tr = (e, t, n) => e >= Math.min(t, n) && e <= Math.max(t, n);
function nr(e, t = []) {
	let n = [], r, i = (e) => {
		n.push(r === void 0 ? `M${String(e[0])} ${String(e[1])}` : `L${String(e[0])} ${String(e[1])}`), r = e;
	}, a = (e) => {
		n.push(`M${String(e[0])} ${String(e[1])}`), r = e;
	};
	i($n(e, 0));
	for (let [n, r] of er(e)) {
		let e = Math.sign(r[0] - n[0]), o = Math.sign(r[1] - n[1]), s = Math.abs(r[0] - n[0]) + Math.abs(r[1] - n[1]), c = t.filter((e) => rr(e, n, r) && !Qn(e, n) && !Qn(e, r)).sort((e, t) => Math.abs(e[0] - n[0]) + Math.abs(e[1] - n[1]) - (Math.abs(t[0] - n[0]) + Math.abs(t[1] - n[1])));
		for (let t of c) {
			let c = Math.abs(t[0] - n[0]) + Math.abs(t[1] - n[1]);
			c > 5 && i([t[0] - e * 5, t[1] - o * 5]), a(s - c > 5 ? [t[0] + e * 5, t[1] + o * 5] : r);
		}
		i(r);
	}
	return n.join(" ");
}
var rr = (e, t, n) => t[0] === n[0] && e[0] === t[0] && tr(e[1], t[1], n[1]) || t[1] === n[1] && e[1] === t[1] && tr(e[0], t[0], n[0]);
function ir(e, t) {
	return Un.filter((n) => n.under === e && t.has(n.over) && t.has(n.under)).map((e) => e.at);
}
// src/diagram/pipes.ts
var ar = 1.2, or = .6, sr = [
	"tap_47",
	"tap_48",
	"tap_49"
], cr = [
	"prod_27_15",
	"prod_15_8",
	"prod_tap_a",
	"prod_tap_b",
	"prod_drain"
];
function lr(e) {
	if (e !== void 0 && e > 0) return Math.min(8, Math.max(or, ar * 100 / e));
}
var ur = {
	"compressor.discharge_temperature": "compressor.suction_temperature",
	"compressor.suction_temperature": "compressor.discharge_temperature",
	"refrigerant.condensation_temperature": "refrigerant.evaporation_temperature",
	"refrigerant.evaporation_temperature": "refrigerant.condensation_temperature"
}, dr = (e, t) => Vn.includes(e.id) && fr(t), fr = (e) => e.active.has("htr") && !e.active.has("production_dhw");
function pr(e, t) {
	return dr(e, t.circuits) ? "dhw.temperature" : e.reversible === !0 && t.mode === "active_cooling" ? ur[e.temperatureRole] ?? e.temperatureRole : (t.mode === "passive_cooling" || t.mode === "defrost") && t.circuits.valves2728 === "exchanger" && cr.includes(e.id) ? "production.outlet_temperature" : e.temperatureRole;
}
function mr(e, t, n) {
	return t === "muted" && n === "defrost" && e.feature === "passive_cooling" ? "normal" : t;
}
var Q = (e, t) => {
	let n = e[t];
	return typeof n == "number" ? n : void 0;
};
function hr(e, t, n) {
	let { mode: r, circuits: i, readings: a, stops: o } = n, s = sr.includes(e.id), c = mr(e, t, r), l = s || Zn(e, i), u = Q(a, pr(e, n)), d = c === "muted" || !l || u === void 0, ee = e.direction === -1 != (e.reversible === !0 && r === "active_cooling"), te = {
		color: d ? Ht : Jt(u, o),
		muted: d,
		reversed: ee
	};
	if (!l || c === "muted" || e.stub === !0 || s) return {
		...te,
		animated: !1
	};
	let ne = dr(e, i) || e.speedRole === void 0 && e.circuit.includes("htr") ? 3 : e.speedRole === void 0 ? void 0 : lr(Q(a, e.speedRole));
	return ne === void 0 ? {
		...te,
		animated: !1
	} : {
		...te,
		animated: !0,
		duration: ne
	};
}
var gr = (e) => Jt(Q(e.readings, "dhw.temperature"), e.stops);
function _r(e) {
	let { circuits: t, readings: n, stops: r } = e;
	return fr(t) ? Jt(Q(n, "dhw.temperature"), r) : t.active.has("dhw_coil") ? Jt(Q(n, "production.outlet_temperature"), r) : Ht;
}
// src/diagram/symbols.ts
var vr = (e, t) => b`<text class="glyph" text-anchor="middle" dominant-baseline="central" font-size="9" fill="currentColor" stroke="none" transform="rotate(${-t})">${e}</text>`;
function yr(e, t, n) {
	let r = Array.from({ length: 14 }, (r, i) => {
		let a = i + 1;
		return `L${String(e + (t - e) * a / 15)} ${String(n + (a % 2 == 1 ? -3 : 3))}`;
	});
	return `M${String(e)} ${String(n)} ${r.join(" ")} L${String(t)} ${String(n)}`;
}
var br = (e, t) => b`<path d="M0 ${t} V${e}" />`, xr = (e, t) => b`<path d="${e}" fill=${t ? "currentColor" : "none"} />`;
function Sr(e, t) {
	let n = t.rotation ?? 0;
	switch (e) {
		case "pump": return b`<circle r="12" /><path d="M-5 -7 V7 L8 0 Z" fill="currentColor" />`;
		case "valve3": {
			let e = t.open ?? ["l", "r"];
			return b`${xr("M-12 -6 V6 L0 0 Z", e.includes("l"))}${xr("M12 -6 V6 L0 0 Z", e.includes("r"))}${xr("M-6 12 H6 L0 0 Z", e.includes("d"))}<rect x="-4" y="-21" width="8" height="8" /><path d="M0 -13 V-8" />`;
		}
		case "inversion_valve": return b`<rect x="-10" y="-14" width="20" height="28" rx="3" /><path d="M-14 0 H-10 M10 -10 H14 M10 0 H14 M10 10 H14" />${t.reversed === !0 ? b`<path d="M-14 0 H14 M14 10 H5 V-10 H14" />` : b`<path d="M-14 0 H-5 V10 H14 M14 0 H5 V-10 H14" />`}`;
		case "probe_t": return b`<circle r="9" />${br(16, 9)}${vr("T", n)}`;
		case "transducer_p": return b`<circle r="9" />${br(16, 9)}${vr("P", n)}`;
		case "pressure_switch": return b`<rect x="-7" y="-7" width="14" height="14" />${br(16, 7)}${vr("P", n)}`;
		case "thermostat": return b`<rect x="-7" y="-7" width="14" height="14" />${br(16, 7)}${vr("T", n)}`;
		case "exchanger": {
			let e = t.size ?? 34;
			return b`<rect x="-20" y="${-e - 9}" width="40" height="${2 * e + 18}" rx="4" /><path d="M-12 ${-e} V${e} M12 ${-e} V${e}" /><circle cx="-12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="-12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" />`;
		}
		case "compressor": return b`<circle r="14" /><path d="M0 -8 A8 8 0 1 0 8 0 M0 -8 L6 -4" />`;
		case "vessel": return b`<circle r="12" /><path d="M-12 2 H12" />`;
		case "safety_valve": return b`<path d="M0 16 V6 M-6 6 H6 L0 -4 Z M0 -4 L-3 -7 L3 -10 L0 -13" />`;
		case "valve": return b`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "drain_valve": return b`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "resistor": return b`<rect x="-28" y="-6" width="56" height="12" rx="2" /><path d="M-18 -6 V6 M18 -6 V6" />`;
		case "filter_dryer": return b`<rect x="-14" y="-5" width="28" height="10" rx="5" />`;
		case "expansion_valve": return b`<path d="M-12 -6 V6 L0 0 L12 -6 V6 L0 0 Z" />`;
		case "service_outlet": return b`<rect x="-3" y="-3" width="6" height="6" />${br(10, 3)}`;
		case "port": return b`<rect x="-5" y="-6" width="10" height="6" />`;
		case "tank": return b`<rect class="tank-body" data-dhw-tank="internal" x=${-L.width / 2} y=${-L.height / 2} width=${L.width} height=${L.height} rx="14" fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />`;
		case "coil": return b`<path d="${yr(-75, 60, -13)} M60 -13 V13 ${yr(60, -75, 13).replace("M60 13 ", "")}" />`;
	}
}
function Cr(e, t = {}) {
	return b`<g class="symbol ${e}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${t.rotation ?? 0})">${Sr(e, t)}</g>`;
}
// src/diagram/cabinet.ts
var wr = o`
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
function Tr(e, t) {
	return e === 26 ? t.valve26 === "dhw" ? ["l", "d"] : ["l", "r"] : t.valves2728 === "exchanger" ? ["d", "r"] : ["l", "r"];
}
function Er(e, t) {
	let { part: n } = e, { circuits: r } = t, i = mr(n, e.state, t.mode), [a, o, s] = n.tag;
	return b`<g class="symbol-group ${i}" data-item=${n.item} data-kind=${n.kind} style=${n.kind === "coil" ? `color: ${_r(t)}` : S}>
    <g transform="translate(${n.x} ${n.y})">${Cr(n.kind, {
		rotation: n.rotation,
		size: n.size,
		open: n.kind === "valve3" ? Tr(n.item, r) : void 0,
		reversed: n.kind === "inversion_valve" ? r.valve14 === "reversed" : void 0
	})}</g>
    <text class="item" x=${n.x + a} y=${n.y + o} text-anchor=${s ?? "start"}>${n.item}</text>
  </g>`;
}
function Dr(e, t, n, r) {
	let i = hr(e, t, n), a = nr(e.points, r);
	return b`<path class="pipe ${i.muted ? "muted" : ""}" data-segment=${e.id} style=${i.muted ? S : `stroke: ${i.color}`} d=${a} />${i.animated ? b`<path class="flow ${i.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(i.duration)}s" d=${a} />` : S}`;
}
function Or(e, t) {
	let n = Xn(e), r = new Set(n.map((e) => e.part.id));
	return b`<g class="cabinet">
    <rect class="outline" x=${jn.x} y=${jn.y} width=${jn.width} height=${jn.height} rx="6" />
    ${Wn.filter((t) => qn(t, e) !== "hidden").map((e) => b`<text class="circuit-label" x=${e.x} y=${e.y} text-anchor="middle">${pt[e.key]}</text>`)}
    ${n.map((e) => Dr(e.part, e.state, t, ir(e.part.id, r)))}
    ${Yn(e).map((e) => Er(e, t))}
  </g>`;
}
// src/diagram/dhw.ts
var kr = o`
  .tank-body {
    stroke: var(--primary-text-color);
    stroke-width: 2;
  }
  .tank-caption {
    fill: var(--secondary-text-color);
    font-size: 11px;
  }
`;
function Ar(e) {
	if (e.dhw !== "external") return b``;
	let { x: t, y: n, width: r, height: i } = Mn;
	return b`<g class="dhw-storage" data-dhw="external">
    <rect class="tank-body" data-dhw-tank="external" x=${t} y=${n} width=${r} height=${i} rx="22" fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />
    <text class="tank-caption" x=${t + r / 2} y=${n - 6} text-anchor="middle">${ht.externalTank}</text>
  </g>`;
}
// src/lib/format.ts
var jr = "−";
function Mr(e) {
	let t = e?.locale;
	return typeof t == "object" && t ? t : e?.language === void 0 ? {} : { language: e.language };
}
function Nr(e) {
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
var Pr = /* @__PURE__ */ new Map();
function Fr(e, t, n) {
	let r = Nr(e), i = n && e.number_format !== "none", a = `${r?.join(",") ?? ""}|${String(t)}|${String(i)}`, o = Pr.get(a);
	return o === void 0 && (o = new Intl.NumberFormat(r, {
		minimumFractionDigits: t,
		maximumFractionDigits: t,
		useGrouping: i
	}), Pr.set(a, o)), o;
}
function Ir(e, t, n = 0, r = !0) {
	if (!Number.isFinite(e)) return "–";
	let i = Number.isFinite(n) ? Math.min(20, Math.max(0, Math.trunc(n))) : 0, a = Math.abs(e) < .5 / 10 ** i ? 0 : e;
	return Fr(t ?? {}, i, r).formatToParts(a).map((e) => e.type === "minusSign" ? jr : e.value).join("");
}
// src/calc/display.ts
function Lr(e) {
	if (typeof e != "object" || !e) return;
	let t = e.display_precision;
	return typeof t == "number" && Number.isInteger(t) && t >= 0 && t <= 20 ? t : void 0;
}
var Rr = (e, t) => t ?? e.decimals ?? 0;
function zr(e, t) {
	let n = typeof t == "string" ? t.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase() : "";
	return n === (e.unit ?? "").toLowerCase() || e.quantity === "difference" && n === "°c";
}
function Br(e, t, n, r) {
	let i = vt.get(e);
	if (i === void 0 || t === void 0 || !Number.isFinite(t)) return;
	let a = n === void 0 || !zr(i, r.states?.[n]?.attributes.unit_of_measurement) ? void 0 : Lr(r.entities?.[n]), o = Ir(t, r.locale, Rr(i, a), !1);
	return i.unit === void 0 ? o : `${o} ${i.unit}`;
}
// src/diagram/labels.ts
var Vr = o`
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
}), Hr = 895, Ur = [
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
		caption: k.fan
	}),
	$("outside_temperature", "source.outside_temperature", 115, 325, "middle", {
		source: ["air", "hybrid"],
		caption: k.outside
	}),
	$("air_unit_outlet", "source.air_unit_outlet_temperature", 115, 338, "middle", {
		source: ["air", "hybrid"],
		caption: k.airOutlet
	}),
	$("ground_out", "brine.outlet_temperature", 158, 203, "start", {
		source: ["ground"],
		caption: k.groundOut
	}),
	$("ground_in", "brine.inlet_temperature", 158, 290, "start", {
		source: ["ground"],
		caption: k.groundIn
	}),
	$("hybrid_ground_in", "brine.inlet_temperature", 158, 480, "start", {
		source: ["hybrid"],
		caption: k.groundIn
	}),
	...["external", "internal"].flatMap((e) => {
		let t = e === "external" ? 352 : 152;
		return [
			$(`tank_${e}_temperature`, "dhw.temperature", Hr, t, "middle", {
				dhw: e,
				emphasis: !0
			}),
			$(`tank_${e}_setpoint`, "dhw.setpoint", Hr, t + 15, "middle", {
				dhw: e,
				caption: k.setpoint
			}),
			$(`tank_${e}_start_delta`, "dhw.start_delta", Hr, t + 29, "middle", {
				dhw: e,
				caption: k.startDelta
			}),
			$(`tank_${e}_demand`, "dhw.demand", Hr, t + 43, "middle", {
				dhw: e,
				demand: !0
			})
		];
	})
];
function Wr(e, t, n, r) {
	return Ur.flatMap((i) => {
		if (qn(i, e) === "hidden") return [];
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
			let e = i.role === "heating.demand" ? gt.demand : ht.demand;
			return s === !0 ? [{
				...o,
				text: e,
				missing: !1
			}] : [];
		}
		let c = Br(i.role, typeof s == "number" ? s : void 0, a, r);
		return [{
			...o,
			text: c ?? "–",
			missing: c === void 0
		}];
	});
}
function Gr(e, t, n) {
	let r = (e, n, r, i) => ({
		id: e,
		...r === void 0 ? {} : { caption: r },
		text: i ?? "–",
		missing: i === void 0,
		entityId: t[n]
	}), i = (i, a, o) => {
		let s = e[a];
		return r(i, a, o, Br(a, typeof s == "number" ? s : void 0, t[a], n));
	}, a = e["unit.on_off"], o = e["unit.summer"] === !0 ? A.summer : e["unit.winter"] === !0 ? A.winter : void 0;
	return [
		r("on_off", "unit.on_off", void 0, a === void 0 ? void 0 : _t[a.toLowerCase()] ?? a),
		r("season", e["unit.summer"] === !0 ? "unit.summer" : "unit.winter", void 0, o),
		i("outside_temperature", "source.outside_temperature", A.outside),
		i("cop", "unit.cop", A.cop),
		i("condensation_capacity", "heating.capacity", A.condensation),
		i("evaporation_capacity", "cooling.capacity", A.evaporation)
	];
}
var Kr = (e) => ({
	left: `${String(e.x / An.width * 100)}%`,
	top: `${String(e.y / An.height * 100)}%`
});
function qr(e, t, n, r) {
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
function Jr(e, t) {
	return y`${e.map((e) => {
		let { left: n, top: r } = Kr(e);
		return y`<span
      class="label ${e.align}${e.emphasis ? " emphasis" : ""}"
      data-label=${e.id}
      data-role=${e.role}
      data-label-item=${e.item ?? S}
      style="left: ${n}; top: ${r}"
      >${e.caption === void 0 ? S : y`<span class="caption">${e.caption}</span>`}${qr(e.entityId, e.text, e.missing, t)}</span
    >`;
	})}`;
}
function Yr(e, t) {
	return y`${e.map((e) => y`<span class="footer-item" data-footer=${e.id}
        >${e.caption === void 0 ? S : y`<span class="caption">${e.caption}</span>`}${qr(e.entityId, e.text, e.missing, t)}</span
      >`)}`;
}
// src/diagram/source.ts
var Xr = o`
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
`, Zr = (e) => e === void 0 || !(e > 0) ? void 0 : Math.min(6, Math.max(.5, 120 / e)), Qr = [
	0,
	90,
	180,
	270
].map((e) => b`<path class="fan-blade" d="M0 0 C6 -8 6 -24 0 -30 C-8 -24 -8 -8 0 0 Z" transform="rotate(${e})" />`);
function $r(e, t) {
	let { x: n, y: r, width: i, height: a, fanX: o, fanY: s, fanRadius: c } = R, l = Zr(e), { fins: u } = R, d = Array.from({ length: u.count }, (e, t) => u.x + t * u.step);
	return b`<g class="air-unit${t ? " muted" : ""}" data-source="air">
    <rect class="source-outline" x=${n} y=${r} width=${i} height=${a} rx="6" />
    ${d.map((e) => b`<path class="source-fin" d="M${e} ${R.fins.y0} V${R.fins.y1}" />`)}
    <circle class="fan-ring" cx=${o} cy=${s} r=${c} />
    <g class="fan" data-fan transform="translate(${o} ${s})">
      <g class=${l === void 0 ? "fan-rotor still" : "fan-rotor"} style=${l === void 0 ? "" : `--fan-duration: ${String(l)}s`}>${Qr}<circle r="4" fill="var(--primary-text-color)" /></g>
    </g>
    <text class="source-caption" x=${R.captionX} y=${R.captionY} text-anchor="middle">${mt.air}</text>
  </g>`;
}
function ei(e, t) {
	return Xn(e).flatMap(({ part: e }) => e.id.startsWith("src_") ? e.points.slice(1).flatMap((n, r) => {
		let i = e.points[r];
		return i?.[0] === n[0] && t > Math.min(i[1], n[1]) && t < Math.max(i[1], n[1]) ? [n[0]] : [];
	}) : []);
}
function ti(e, t, n, r) {
	let i = ei(e, n), a = Array.from({ length: 16 }, (e, t) => 44 + t * 10).filter((e) => !i.some((t) => Math.abs(t - e) < 8)), o = Pn.y[t];
	return b`<g class="ground-loop${r ? " muted" : ""}" data-source="ground">
    <path class="source-ground" d="M8 ${n} H202" />
    ${a.map((e) => b`<path class="source-ground" d="M${e} ${n} l-6 8" />`)}
    <text class="source-caption" x=${Pn.x} y=${o} text-anchor="middle">${mt.ground}</text>
  </g>`;
}
function ni(e, t, n) {
	let r = e.source === "air" || e.source === "hybrid", i = e.source === "ground" || e.source === "hybrid", a = e.source === "hybrid" ? "hybrid" : "ground";
	return b`<g class="source" data-source-kind=${e.source}>
    ${r ? $r(t["source.fan_speed"], !n) : b``}
    ${i ? ti(e, a, Nn[a], !n) : b``}
  </g>`;
}
// src/lib/define.ts
function ri(e, t) {
	let n = customElements.get(e);
	n === void 0 ? customElements.define(e, t) : n !== t && console.warn(`${e} is already defined by another copy of the module; that copy stays in use.`);
}
// src/lib/render.ts
function ii(e, t) {
	return e === t || Array.isArray(e) && Array.isArray(t) && e.length === t.length && e.every((e, n) => e === t[n]);
}
function ai(e, t) {
	if (e === t) return !0;
	if (typeof e != "object" || typeof t != "object" || e === null || t === null) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	return n.length === r.length && n.every((n) => Object.hasOwn(t, n) && ii(e[n], t[n]));
}
function oi(e, t, n) {
	return e === void 0 || e.locale !== t.locale || e.language !== t.language || e.localize !== t.localize || e.formatEntityState !== t.formatEntityState || e.themes?.darkMode !== t.themes?.darkMode || n.some((n) => e.states[n] !== t.states[n] || !ai(e.entities?.[n], t.entities?.[n]));
}
function si(e, t, n, r) {
	return e.size === 1 && e.has("hass") ? t !== void 0 && oi(n, t, r) : !0;
}
// src/card/ecogeo-card.ts
var ci = "ecogeo-card", li = An.width, ui = An.height;
ri(ci, class extends T {
	constructor(...e) {
		super(...e), this.entityIds = [];
	}
	static {
		this.styles = [
			wr,
			Xr,
			kr,
			Vr,
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
		let t = xn(e);
		if (t.length > 0) throw Error(t.join("; "));
		this.resolved = kn(e), this.entityIds = [...new Set(Object.values(this.resolved.entities).filter((e) => e !== void 0))], this.config = e;
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
		return si(e, this.hass, this.renderedHass, this.entityIds);
	}
	readings(e) {
		let t = e.sample ? En : this.hass?.states ?? {};
		return {
			readings: Ct(t, e.entities),
			offline: Ke(tt(t, e.entities["unit.connection"]))
		};
	}
	render() {
		this.renderedHass = this.hass;
		let e = this.resolved;
		if (e === void 0) return y`<ha-card><div class="diagram"></div></ha-card>`;
		let { readings: t, offline: n } = this.readings(e), r = Ge(t, e.features), i = Je(r, e.features, e.dhw, t), a = {
			mode: r,
			circuits: i,
			readings: t,
			stops: e.colors
		}, o = e.sample ? En : this.hass?.states ?? {}, s = {
			locale: Mr(this.hass),
			entities: this.hass?.entities,
			states: o
		}, c = e.sample ? void 0 : (e) => {
			nt(this, e);
		};
		return y`<ha-card>
      <div class="diagram">
        <svg
          viewBox="0 0 ${li} ${ui}"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label=${ut}
          style="--dhw-tank-color: ${gr(a)}"
        >
          ${b`${ni(e, t, i.active.has("brine"))}${Ar(e)}${Or(e, a)}`}
        </svg>
        ${Jr(Wr(e, t, e.entities, s), c)}
      </div>
      <div class="footer">
        <span class="mode">${dt[r]}</span>
        ${Yr(Gr(t, e.entities, s), c)}
        ${qe(t["unit.alarm"]) ? y`<span class="alarm">${ft.alarm}</span>` : S}
        ${n ? y`<span class="offline">${ft.offline}</span>` : S}
        ${e.sample ? y`<span class="sample">${ft.sampleValues}</span>` : S}
      </div>
    </ha-card>`;
	}
});
// src/index.ts
var di = {
	type: ci,
	...lt,
	preview: !0
};
function fi(e = window) {
	let t = e.customCards ??= [];
	t.some((e) => e.type === di.type) || t.push({ ...di });
}
fi();
export { di as CARD_ENTRY, fi as registerCardPicker };
