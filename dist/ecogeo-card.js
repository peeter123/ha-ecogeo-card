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
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: m } = Object, h = globalThis, g = h.trustedTypes, _ = g ? g.emptyScript : "", v = h.reactiveElementPolyfillSupport, y = (e, t) => e, ee = {
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
}, te = (e, t) => !l(e, t), ne = {
	attribute: !0,
	type: String,
	converter: ee,
	reflect: !1,
	useDefault: !1,
	hasChanged: te
};
Symbol.metadata ??= Symbol("metadata"), h.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var re = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = ne) {
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
		return this.elementProperties.get(e) ?? ne;
	}
	static _$Ei() {
		if (this.hasOwnProperty(y("elementProperties"))) return;
		let e = m(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(y("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(y("properties"))) {
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
			let i = (n.converter?.toAttribute === void 0 ? ee : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? ee : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? te)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
re.elementStyles = [], re.shadowRootOptions = { mode: "open" }, re[y("elementProperties")] = /* @__PURE__ */ new Map(), re[y("finalized")] = /* @__PURE__ */ new Map(), v?.({ ReactiveElement: re }), (h.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var ie = globalThis, ae = (e) => e, oe = ie.trustedTypes, se = oe ? oe.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, ce = "$lit$", b = `lit$${Math.random().toFixed(9).slice(2)}$`, le = "?" + b, ue = `<${le}>`, de = document, fe = () => de.createComment(""), pe = (e) => e === null || typeof e != "object" && typeof e != "function", me = Array.isArray, he = (e) => me(e) || typeof e?.[Symbol.iterator] == "function", ge = "[ 	\n\f\r]", _e = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ve = /-->/g, ye = />/g, be = RegExp(`>|${ge}(?:([^\\s"'>=/]+)(${ge}*=${ge}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), xe = /'/g, Se = /"/g, Ce = /^(?:script|style|textarea|title)$/i, we = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), x = we(1), S = we(2), Te = Symbol.for("lit-noChange"), C = Symbol.for("lit-nothing"), Ee = /* @__PURE__ */ new WeakMap(), De = de.createTreeWalker(de, 129);
function Oe(e, t) {
	if (!me(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return se === void 0 ? t : se.createHTML(t);
}
var ke = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = _e;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === _e ? c[1] === "!--" ? o = ve : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = be) : (Ce.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = be) : o = ye : o === be ? c[0] === ">" ? (o = i ?? _e, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? be : c[3] === "\"" ? Se : xe) : o === Se || o === xe ? o = be : o === ve || o === ye ? o = _e : (o = be, i = void 0);
		let d = o === be && e[t + 1].startsWith("/>") ? " " : "";
		a += o === _e ? n + ue : l >= 0 ? (r.push(s), n.slice(0, l) + ce + n.slice(l) + b + d) : n + b + (l === -2 ? t : d);
	}
	return [Oe(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Ae = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = ke(t, n);
		if (this.el = e.createElement(l, r), De.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = De.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(ce)) {
					let t = u[o++], n = i.getAttribute(e).split(b), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Fe : r[1] === "?" ? Ie : r[1] === "@" ? Le : Pe
					}), i.removeAttribute(e);
				} else e.startsWith(b) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (Ce.test(i.tagName)) {
					let e = i.textContent.split(b), t = e.length - 1;
					if (t > 0) {
						i.textContent = oe ? oe.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], fe()), De.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], fe());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === le) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(b, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += b.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = de.createElement("template");
		return n.innerHTML = e, n;
	}
};
function je(e, t, n = e, r) {
	if (t === Te) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = pe(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = je(e, i._$AS(e, t.values), i, r)), t;
}
var Me = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? de).importNode(t, !0);
		De.currentNode = r;
		let i = De.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Ne(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Re(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = De.nextNode(), a++);
		}
		return De.currentNode = de, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, Ne = class e {
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
		e = je(this, e, t), pe(e) ? e === C || e == null || e === "" ? (this._$AH !== C && this._$AR(), this._$AH = C) : e !== this._$AH && e !== Te && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? he(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== C && pe(this._$AH) ? this._$AA.nextSibling.data = e : this.T(de.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Ae.createElement(Oe(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Me(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = Ee.get(e.strings);
		return t === void 0 && Ee.set(e.strings, t = new Ae(e)), t;
	}
	k(t) {
		me(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(fe()), this.O(fe()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = ae(e).nextSibling;
			ae(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, Pe = class {
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
		if (i === void 0) e = je(this, e, t, 0), a = !pe(e) || e !== this._$AH && e !== Te, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = je(this, r[n + o], t, o), s === Te && (s = this._$AH[o]), a ||= !pe(s) || s !== this._$AH[o], s === C ? e = C : e !== C && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === C ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Fe = class extends Pe {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === C ? void 0 : e;
	}
}, Ie = class extends Pe {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== C);
	}
}, Le = class extends Pe {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = je(this, e, t, 0) ?? C) === Te) return;
		let n = this._$AH, r = e === C && n !== C || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== C && (n === C || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Re = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		je(this, e);
	}
}, ze = ie.litHtmlPolyfillSupport;
ze?.(Ae, Ne), (ie.litHtmlVersions ??= []).push("3.3.3");
var Be = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Ne(t.insertBefore(fe(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Ve = globalThis, He = class extends re {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Be(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return Te;
	}
};
He._$litElement$ = !0, He.finalized = !0, Ve.litElementHydrateSupport?.({ LitElement: He });
var Ue = Ve.litElementPolyfillSupport;
Ue?.({ LitElement: He }), (Ve.litElementVersions ??= []).push("4.2.2");
// src/strings.ts
var w = {
	invalid: (e, t) => `Invalid option ${e}: expected ${t}`,
	number: (e, t) => `a number from ${e} to ${t}`,
	color: "a CSS colour such as #db4437 or rgb(219, 68, 55)",
	boolean: "true or false",
	object: "a group of options",
	choice: (e) => `one of ${e.join(", ")}`,
	list: "a list of texts"
}, We = {
	name: "ecoGEO Schematic",
	description: "The internal schematic of an Ecoforest ecoGEO heat pump, with live values and pipes coloured by temperature.",
	documentationURL: "https://github.com/peeter123/ha-ecogeo-card#readme"
}, Ge = "ecoGEO heat pump schematic", T = {
	celsius: "°C",
	kelvin: "K",
	bar: "bar",
	percent: "%",
	rpm: "rpm",
	watt: "W"
}, Ke = {
	off: ["OFF"],
	defrost: ["Defrost"]
}, qe = {
	off: "Off",
	defrost: "Defrost",
	dhw: "DHW",
	active_cooling: "Active cooling",
	heating: "Heating",
	passive_cooling: "Passive cooling",
	standby: "Standby"
}, Je = {
	alarm: "Alarm",
	offline: "Offline",
	sampleValues: "Sample values"
}, E = {
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
}, Ye = {
	dg1: "DG1",
	outerLoop: "Outer loop",
	dhw: "DHW"
}, Xe = {
	air: "Air unit",
	ground: "Ground loop"
}, Ze = {
	externalTank: "DHW tank",
	demand: "Demand"
}, Qe = { demand: "Demand" }, D = {
	setpoint: "Setpoint",
	startDelta: "Start ΔT",
	setpointShort: "Set",
	startDeltaShort: "ΔT",
	fan: "Fan",
	outside: "Outside",
	portIn: "In",
	portOut: "Out",
	dhw: "DHW"
}, O = {
	outside: "Outside",
	cop: "COP",
	eer: "EER",
	dg1: "DG1",
	dhw: "DHW",
	cooling: "Cooling",
	htr: "HTR",
	summer: "Summer",
	winter: "Winter"
}, $e = {
	on: "On",
	off: "Off",
	emergency: "Emergency"
}, et = {
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
}, tt = (e) => {
	let t = et[e];
	return t === void 0 ? "" : `${t} (${String(e)})`;
}, nt = "Air unit fan", k = {
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
}, rt = Ke, it = /* @__PURE__ */ new Set(["unknown", "unavailable"]), at = -999, ot = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;
function st(e) {
	if (!ot.test(e)) return;
	let t = Number(e);
	return Number.isFinite(t) ? t + 0 : void 0;
}
function ct(e) {
	if (e === void 0 || it.has(e.state)) return !0;
	let t = st(e.state);
	return t !== void 0 && t <= at;
}
function lt(e) {
	if (!(e === void 0 || ct(e))) return st(e.state);
}
// src/lib/hass.ts
var ut = (e, t) => t === void 0 ? void 0 : e[t];
function dt(e, t) {
	e.dispatchEvent(new CustomEvent("hass-more-info", {
		detail: { entityId: t },
		bubbles: !0,
		composed: !0
	}));
}
// src/lib/units.ts
var ft = { scale: 1 }, pt = {
	scale: 5 / 9,
	offset: -32
}, mt = {
	temperature: /* @__PURE__ */ new Map([["°c", ft], ["°f", pt]]),
	difference: /* @__PURE__ */ new Map([
		["k", ft],
		["°c", ft],
		["°f", pt]
	]),
	power: /* @__PURE__ */ new Map([["w", ft], ["kw", { scale: 1e3 }]]),
	pressure: /* @__PURE__ */ new Map([
		["bar", ft],
		["kpa", { scale: .01 }],
		["mpa", { scale: 10 }],
		["pa", { scale: 1e-5 }],
		["mbar", { scale: .001 }],
		["psi", { scale: .0689476 }]
	])
};
function ht(e) {
	return e.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase();
}
var gt = (e, t) => t !== void 0 && mt[e].has(ht(t));
function _t(e, t) {
	let n = lt(e);
	return n === void 0 ? void 0 : vt(t, n, e?.attributes.unit_of_measurement);
}
function vt(e, t, n) {
	if (!Number.isFinite(t) || n === void 0) return;
	let r = mt[e].get(ht(n));
	return r ? (t + (r.offset ?? 0)) * r.scale : void 0;
}
// src/config/roles.ts
var A = [
	"sensor",
	"number",
	"input_number"
], yt = [
	...A,
	"binary_sensor",
	"switch",
	"input_boolean"
], bt = [
	"binary_sensor",
	"switch",
	"input_boolean",
	"sensor"
], xt = [
	"sensor",
	"select",
	"input_select",
	"binary_sensor",
	"switch",
	"input_boolean"
], j = T.celsius, M = [
	{
		path: "production.outlet_temperature",
		domain: "sensor",
		suffix: "production_out",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "33",
		accepts: A,
		direction: "out"
	},
	{
		path: "production.return_temperature",
		domain: "sensor",
		suffix: "production_in",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "34",
		accepts: A,
		direction: "in"
	},
	{
		path: "production.pressure",
		domain: "sensor",
		suffix: "pressure_production",
		kind: "number",
		quantity: "pressure",
		unit: T.bar,
		decimals: 1,
		item: "38",
		accepts: A
	},
	{
		path: "production.pump",
		domain: "sensor",
		suffix: "production_pump",
		kind: "number",
		unit: T.percent,
		decimals: 1,
		item: "15",
		onOff: !0,
		accepts: yt
	},
	{
		path: "brine.outlet_temperature",
		domain: "sensor",
		suffix: "brine_out",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "31",
		accepts: A,
		direction: "out"
	},
	{
		path: "brine.inlet_temperature",
		domain: "sensor",
		suffix: "brine_in",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "32",
		accepts: A,
		direction: "in"
	},
	{
		path: "brine.pressure",
		domain: "sensor",
		suffix: "pressure_brine",
		kind: "number",
		quantity: "pressure",
		unit: T.bar,
		decimals: 1,
		item: "37",
		accepts: A
	},
	{
		path: "brine.pump",
		domain: "sensor",
		suffix: "brine_pump",
		kind: "number",
		unit: T.percent,
		decimals: 1,
		item: "16",
		onOff: !0,
		accepts: yt
	},
	{
		path: "compressor.speed",
		domain: "sensor",
		suffix: "compressor_rpm",
		kind: "number",
		unit: T.rpm,
		decimals: 0,
		item: "11",
		onOff: !0,
		accepts: yt
	},
	{
		path: "compressor.percentage",
		domain: "sensor",
		suffix: "compressor_percentage",
		kind: "number",
		unit: T.percent,
		decimals: 1,
		item: "11",
		accepts: A
	},
	{
		path: "compressor.power",
		domain: "sensor",
		suffix: "power_consumption",
		kind: "number",
		quantity: "power",
		unit: T.watt,
		decimals: 0,
		item: "11",
		accepts: A
	},
	{
		path: "compressor.suction_temperature",
		domain: "sensor",
		suffix: "compressor_suction_temperature",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "29",
		accepts: A,
		direction: "in"
	},
	{
		path: "compressor.discharge_temperature",
		domain: "sensor",
		suffix: "compressor_discharge_temperature",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "30",
		accepts: A,
		direction: "out"
	},
	{
		path: "compressor.suction_pressure",
		domain: "sensor",
		suffix: "compressor_suction_pressure",
		kind: "number",
		quantity: "pressure",
		unit: T.bar,
		decimals: 1,
		item: "35",
		accepts: A,
		direction: "in"
	},
	{
		path: "compressor.discharge_pressure",
		domain: "sensor",
		suffix: "compressor_discharge_pressure",
		kind: "number",
		quantity: "pressure",
		unit: T.bar,
		decimals: 1,
		item: "36",
		accepts: A,
		direction: "out"
	},
	{
		path: "compressor.mode",
		domain: "sensor",
		suffix: "compressor_operation_mode",
		kind: "text",
		item: "11",
		onOff: !0,
		accepts: xt
	},
	{
		path: "refrigerant.condensation_temperature",
		domain: "sensor",
		suffix: "condensation_temperature",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "8",
		accepts: A
	},
	{
		path: "refrigerant.evaporation_temperature",
		domain: "sensor",
		suffix: "evaporation_temperature",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "7",
		accepts: A
	},
	{
		path: "refrigerant.superheat",
		domain: "sensor",
		suffix: "superheat",
		kind: "number",
		quantity: "difference",
		unit: T.kelvin,
		decimals: 1,
		item: "12",
		accepts: A
	},
	{
		path: "refrigerant.expansion_valve",
		domain: "sensor",
		suffix: "expansion_valve_position",
		kind: "number",
		unit: T.percent,
		decimals: 0,
		item: "12",
		accepts: A
	},
	{
		path: "heating.capacity",
		domain: "sensor",
		suffix: "condensation_capacity",
		kind: "number",
		quantity: "power",
		unit: T.watt,
		decimals: 0,
		item: "8",
		accepts: A
	},
	{
		path: "cooling.capacity",
		domain: "sensor",
		suffix: "evaporation_capacity",
		kind: "number",
		quantity: "power",
		unit: T.watt,
		decimals: 0,
		item: "7",
		accepts: A
	},
	{
		path: "heating.demand",
		domain: "binary_sensor",
		suffix: "dg1_demand",
		kind: "binary",
		item: "1/2",
		accepts: bt
	},
	{
		path: "heating.setpoint",
		domain: "sensor",
		suffix: "heating_dg1_setpoint",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "1/2",
		accepts: A
	},
	{
		path: "heating.power",
		domain: "sensor",
		suffix: "heating_power_dg1",
		kind: "number",
		quantity: "power",
		unit: T.watt,
		decimals: 0,
		item: "1/2",
		optional: !0,
		accepts: A
	},
	{
		path: "dhw.temperature",
		domain: "sensor",
		suffix: "dhw_temperature",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "tank (54 on C)",
		accepts: A
	},
	{
		path: "dhw.setpoint",
		domain: "number",
		suffix: "dhw_setpoint",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 0,
		item: "tank",
		accepts: A
	},
	{
		path: "dhw.start_delta",
		domain: "number",
		suffix: "delta_t_start_dhw",
		kind: "number",
		quantity: "difference",
		unit: T.kelvin,
		decimals: 0,
		item: "tank",
		accepts: A
	},
	{
		path: "dhw.demand",
		domain: "binary_sensor",
		suffix: "dhw_demand",
		kind: "binary",
		item: "26",
		accepts: bt
	},
	{
		path: "dhw.power",
		domain: "sensor",
		suffix: "heating_power_dhw",
		kind: "number",
		quantity: "power",
		unit: T.watt,
		decimals: 0,
		item: "26",
		optional: !0,
		accepts: A
	},
	{
		path: "htr.active",
		domain: "binary_sensor",
		suffix: "htr_active",
		kind: "binary",
		item: "9",
		optional: !0,
		accepts: bt
	},
	{
		path: "htr.power",
		domain: "sensor",
		suffix: "heating_power_htr",
		kind: "number",
		quantity: "power",
		unit: T.watt,
		decimals: 0,
		item: "9",
		optional: !0,
		accepts: A
	},
	{
		path: "source.fan_speed",
		domain: "sensor",
		suffix: "aerothermal_fan_speed",
		kind: "number",
		unit: T.percent,
		decimals: 1,
		item: "air unit",
		accepts: A
	},
	{
		path: "source.air_unit_outlet_temperature",
		domain: "sensor",
		suffix: "brine_temperature_air_unit_outlet",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "air unit",
		accepts: A
	},
	{
		path: "source.outside_temperature",
		domain: "sensor",
		suffix: "outside_temperature",
		kind: "number",
		quantity: "temperature",
		unit: j,
		decimals: 1,
		item: "air unit / footer",
		accepts: A
	},
	{
		path: "unit.on_off",
		domain: "sensor",
		suffix: "heatpump_on_off",
		kind: "text",
		item: "footer",
		onOff: !0,
		accepts: xt
	},
	{
		path: "unit.summer",
		domain: "binary_sensor",
		suffix: "summer",
		kind: "binary",
		item: "footer",
		accepts: bt
	},
	{
		path: "unit.winter",
		domain: "binary_sensor",
		suffix: "winter",
		kind: "binary",
		item: "footer",
		accepts: bt
	},
	{
		path: "unit.alarm",
		domain: "binary_sensor",
		suffix: "alarm",
		kind: "binary",
		item: "footer",
		accepts: bt
	},
	{
		path: "unit.connection",
		domain: "binary_sensor",
		suffix: "status",
		kind: "binary",
		item: "footer",
		accepts: bt
	},
	{
		path: "unit.cop",
		domain: "sensor",
		suffix: "cop",
		kind: "number",
		decimals: 1,
		item: "footer",
		accepts: A
	},
	{
		path: "unit.system_cop",
		domain: "sensor",
		suffix: "system_cop_display",
		kind: "number",
		decimals: 1,
		item: "footer",
		optional: !0,
		accepts: A
	}
], St = [
	"binary_sensor",
	"switch",
	"input_boolean"
], Ct = (e) => e !== void 0 && St.includes(e.split(".")[0] ?? ""), wt = new Map(M.map((e) => [e.path, e])), Tt = M.filter((e) => "optional" in e).map((e) => e.path), Et = M.map((e) => e.path);
[...new Set(M.flatMap((e) => "unit" in e ? [e.unit] : []))];
var Dt = (e, t) => `${e.domain}.${t}_${e.suffix}`;
// src/calc/readings.ts
function Ot(e, t) {
	return t.quantity === void 0 ? lt(e) : _t(e, t.quantity) ?? (t.quantity === "pressure" ? lt(e) : void 0);
}
function kt(e) {
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
function At(e, t, n) {
	if (t.onOff === !0 && Ct(n)) return kt(e);
	switch (t.kind) {
		case "number": return Ot(e, t);
		case "text": return e === void 0 || ct(e) || ["unavailable", "unknown"].includes(e.state.trim().toLowerCase()) ? void 0 : e.state.trim();
		case "binary": return kt(e);
	}
}
function jt(e, t) {
	return Object.fromEntries(M.map((n) => [n.path, At(ut(e, t[n.path]), n, t[n.path])]));
}
function Mt(e, t, n) {
	return new Set(Tt.filter((r) => {
		let i = t[r];
		return i === void 0 || n.has(r) && ut(e, i) === void 0;
	}));
}
var Nt = [
	"production.pump",
	"brine.pump",
	"source.fan_speed"
];
function Pt(e, t, n) {
	let r = {};
	for (let i of Nt) {
		let a = e[i], o = ut(n, t[i])?.attributes.unit_of_measurement?.trim();
		typeof a == "number" && a > 0 && o !== void 0 && o !== "" && o !== "%" && (r[i] = !0);
	}
	return {
		...e,
		...r
	};
}
var Ft = (e, t) => typeof e == "string" && t.some((t) => t.trim().toLowerCase() === e.trim().toLowerCase()), It = (e) => e === !0 || typeof e == "number" && e > 0;
function Lt(e) {
	let t = e["compressor.speed"];
	if (t !== void 0) return It(t);
	let n = e["compressor.percentage"];
	if (n !== void 0) return n > 0;
	let r = e["compressor.power"];
	return r === void 0 ? void 0 : r > 100;
}
function Rt(e, t, n = rt) {
	let r = e["unit.on_off"];
	if (r === !1 || Ft(r, n.off)) return "off";
	let i = e["compressor.mode"];
	if (i === !0 || Ft(i, n.defrost)) return "defrost";
	let a = Lt(e);
	if (a === void 0) return "standby";
	let o = e["unit.summer"] === !0;
	return a ? e["dhw.demand"] === !0 ? "dhw" : o && t.active_cooling === !0 ? "active_cooling" : "heating" : o && It(e["production.pump"]) && t.passive_cooling === !0 ? "passive_cooling" : "standby";
}
function zt(e) {
	return e !== void 0 && (kt(e) === !1 || ct({ state: e.state.trim().toLowerCase() }));
}
var Bt = (e) => e === !0;
// src/calc/circuits.ts
function Vt(e, t, n, r, i, a) {
	let o = /* @__PURE__ */ new Set(), s = t.passive_cooling !== !1, c = n === "external" || n === "internal", l = t.htr === !0 && c && (a ? r["htr.active"] === !0 : e === "active_cooling" && (r["heating.capacity"] ?? 0) > 0);
	switch (e) {
		case "heating":
			o.add("refrigerant").add("brine").add("production_dg1"), l && o.add("htr").add("dhw_coil");
			break;
		case "dhw":
			o.add("refrigerant").add("brine"), c && o.add("production_dhw").add("dhw_coil");
			break;
		case "active_cooling":
			o.add("refrigerant").add("brine").add("production_dg1"), l && o.add("htr").add("dhw_coil");
			break;
		case "passive_cooling":
		case "defrost": o.add("brine").add("production_dg1"), s && o.add("exchanger_10");
	}
	return i && !It(r["brine.pump"]) && o.delete("brine"), {
		valve26: e === "dhw" ? "dhw" : "production",
		valve14: e === "active_cooling" ? "reversed" : "normal",
		valves2728: (e === "passive_cooling" || e === "defrost") && s ? "exchanger" : "closed",
		active: o
	};
}
// src/lib/config.ts
var Ht = /^[a-z][a-z0-9_]*\.[a-z0-9_]+$/;
function N(e, t) {
	let n = e;
	for (let e of t.split(".")) {
		if (typeof n != "object" || !n || !Object.hasOwn(n, e)) return;
		n = n[e];
	}
	return n;
}
function Ut(e) {
	if (typeof e != "string") return;
	let t = e.trim();
	return Ht.test(t) ? t : void 0;
}
function Wt(e, t) {
	return Ut(N(e, t));
}
// src/lib/options.ts
var Gt = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, Kt = /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|var)\((.*)\)$/i, qt = /^[#a-zA-Z0-9(),.%\s/+-]+$/, Jt = /* @__PURE__ */ new Set(/* @__PURE__ */ "aliceblue.antiquewhite.aqua.aquamarine.azure.beige.bisque.black.blanchedalmond.blue.blueviolet.brown.burlywood.cadetblue.chartreuse.chocolate.coral.cornflowerblue.cornsilk.crimson.cyan.darkblue.darkcyan.darkgoldenrod.darkgray.darkgreen.darkgrey.darkkhaki.darkmagenta.darkolivegreen.darkorange.darkorchid.darkred.darksalmon.darkseagreen.darkslateblue.darkslategray.darkslategrey.darkturquoise.darkviolet.deeppink.deepskyblue.dimgray.dimgrey.dodgerblue.firebrick.floralwhite.forestgreen.fuchsia.gainsboro.ghostwhite.gold.goldenrod.gray.green.greenyellow.grey.honeydew.hotpink.indianred.indigo.ivory.khaki.lavender.lavenderblush.lawngreen.lemonchiffon.lightblue.lightcoral.lightcyan.lightgoldenrodyellow.lightgray.lightgreen.lightgrey.lightpink.lightsalmon.lightseagreen.lightskyblue.lightslategray.lightslategrey.lightsteelblue.lightyellow.lime.limegreen.linen.magenta.maroon.mediumaquamarine.mediumblue.mediumorchid.mediumpurple.mediumseagreen.mediumslateblue.mediumspringgreen.mediumturquoise.mediumvioletred.midnightblue.mintcream.mistyrose.moccasin.navajowhite.navy.oldlace.olive.olivedrab.orange.orangered.orchid.palegoldenrod.palegreen.paleturquoise.palevioletred.papayawhip.peachpuff.peru.pink.plum.powderblue.purple.rebeccapurple.red.rosybrown.royalblue.saddlebrown.salmon.sandybrown.seagreen.seashell.sienna.silver.skyblue.slateblue.slategray.slategrey.snow.springgreen.steelblue.tan.teal.thistle.tomato.turquoise.violet.wheat.white.whitesmoke.yellow.yellowgreen.transparent.currentcolor".split("."));
function Yt(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) if (e[n] === "(" && t++, e[n] === ")" && (t--, t < 0 || t === 0 && n !== e.length - 1)) return !1;
	return t === 0;
}
function Xt(e) {
	let t = e.trim();
	if (t.length === 0 || t.length > 100 || !qt.test(t)) return !1;
	if (Gt.test(t) || Jt.has(t.toLowerCase())) return !0;
	let n = Kt.exec(t);
	if (n === null || !Yt(t)) return !1;
	if (n[1]?.toLowerCase() !== "var") return !0;
	let [r, ...i] = (n[2] ?? "").split(",");
	return /^\s*--[a-zA-Z0-9-]+\s*$/.test(r ?? "") && (i.length === 0 || Xt(i.join(",")));
}
var Zt = (e) => e == null;
function Qt(e) {
	switch (e.kind) {
		case "number": return w.number(String(e.min), String(e.max));
		case "color": return w.color;
		case "boolean": return w.boolean;
		case "choice": return w.choice(e.choices);
		case "list": return w.list;
	}
}
var $t = (e) => e === null || [
	"string",
	"number",
	"boolean"
].includes(typeof e);
function en(e) {
	return e.map((e) => typeof e == "boolean" ? e ? "on" : "off" : e === null ? "" : String(e)).filter((e) => e.trim() !== "");
}
function tn(e, t) {
	switch (e.kind) {
		case "number": return typeof t == "number" && Number.isFinite(t) && t >= e.min && t <= e.max;
		case "color": return typeof t == "string" && Xt(t);
		case "boolean": return typeof t == "boolean";
		case "choice": return typeof t == "string" && e.choices.includes(t);
		case "list": return Array.isArray(t) && t.every($t);
	}
}
function nn(e, t) {
	let n = t.split(".").slice(0, -1);
	for (let t = 1; t <= n.length; t++) {
		let r = n.slice(0, t).join("."), i = N(e, r);
		if (!Zt(i) && (typeof i != "object" || Array.isArray(i))) return r;
	}
}
function rn(e, t) {
	let n = t.flatMap((t) => {
		let n = nn(e, t.path);
		if (n !== void 0) return [w.invalid(n, w.object)];
		let r = N(e, t.path);
		return Zt(r) || tn(t, r) ? [] : [w.invalid(t.path, Qt(t))];
	});
	return [...new Set(n)];
}
function an(e, t) {
	let n = N(e, t.path);
	if (t.kind === "list" && Array.isArray(n) && tn(t, n)) {
		let e = en(n);
		return e.length > 0 ? e : t.default;
	}
	return Zt(n) || !tn(t, n) ? t.default : n;
}
// src/diagram/colors.ts
var on = [
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
], sn = "var(--disabled-text-color)", cn = "#8a8a8a", ln = `var(--ecogeo-coil-muted, ${sn})`, un = (e) => e ? sn : cn, dn = (e) => typeof e == "object" && !!e && !Array.isArray(e), fn = (e) => typeof e == "string" && rn({ color: e }, [{
	kind: "color",
	path: "color",
	default: ""
}]).length === 0, pn = (e) => e.map((e) => ({
	temperature: e.temperature,
	color: e.color.trim()
}));
function mn(e) {
	let t = N(e, "colors");
	if (t == null) return [];
	if (!Array.isArray(t) || t.length < 2 || t.length > 8) return [E.colors];
	let n = t;
	if (!n.every((e) => dn(e) && typeof e.temperature == "number" && Number.isFinite(e.temperature) && fn(e.color))) return [E.colors];
	let r = pn(n).map((e) => e.temperature);
	return r.every((e, t) => t === 0 || e > (r[t - 1] ?? 0)) ? [] : [E.colors];
}
function hn(e) {
	let t = N(e, "colors");
	return Array.isArray(t) && mn(e).length === 0 ? pn(t) : on;
}
function gn(e, t = on) {
	let n = t[0], r = t[t.length - 1];
	if (e === void 0 || !Number.isFinite(e) || n === void 0 || r === void 0) return sn;
	if (e <= n.temperature) return n.color;
	if (e >= r.temperature) return r.color;
	let i = t.findIndex((t) => t.temperature >= e), a = t[i - 1], o = t[i];
	if (a === void 0 || o === void 0) return r.color;
	let s = Math.round((e - a.temperature) / (o.temperature - a.temperature) * 1e3) / 10;
	return s <= 0 ? a.color : s >= 100 ? o.color : `color-mix(in srgb, ${o.color} ${String(s)}%, ${a.color})`;
}
// src/config/variants.ts
var _n = [
	"active_cooling",
	"passive_cooling",
	"htr",
	"backup_heater"
], vn = [
	1,
	2,
	3,
	4
];
function yn(e) {
	return {
		active_cooling: e === 3 || e === 4,
		passive_cooling: e === 2 || e === 4,
		htr: !0,
		backup_heater: !0
	};
}
function bn(e, t) {
	return {
		...yn(e),
		...t
	};
}
// src/config/options.ts
var xn = ["B", "C"], Sn = [
	"air",
	"ground",
	"hybrid"
], Cn = [
	"external",
	"internal",
	"unused",
	"none"
], wn = ["simplified", "full"], Tn = {
	kind: "choice",
	path: "model",
	default: "B",
	choices: xn
}, En = {
	kind: "choice",
	path: "source",
	default: "ground",
	choices: Sn
}, Dn = {
	kind: "choice",
	path: "dhw",
	default: "external",
	choices: Cn
}, On = {
	kind: "choice",
	path: "detail",
	default: "simplified",
	choices: wn
}, kn = {
	kind: "choice",
	path: "exchanger_fill",
	default: "gradient",
	choices: ["gradient", "none"]
}, An = {
	kind: "choice",
	path: "layout",
	default: "auto",
	choices: [
		"auto",
		"full",
		"compact"
	]
}, jn = [
	Tn,
	En,
	Dn,
	On,
	kn,
	An
], Mn = [
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
], Nn = (e) => e === "C" ? "internal" : "external", P = (e) => e == null, Pn = (e) => P(e) || typeof e == "string" && e.trim() === "", Fn = (e) => typeof e == "object" && !!e && !Array.isArray(e), In = /^[a-z0-9_]+$/, Ln = (e) => typeof e == "string" && e.trim() === "none";
function Rn(e) {
	let t = N(e, "prefix");
	return Pn(t) ? void 0 : t.trim();
}
function zn(e) {
	let t = N(e, "variant");
	return vn.find((e) => e === t) ?? 4;
}
function Bn(e) {
	let t = an(e, Tn), n = !P(N(e, "dhw"));
	return {
		model: t,
		source: an(e, En),
		dhw: n ? an(e, Dn) : Nn(t)
	};
}
var Vn = (e) => an(e, On), Hn = (e) => an(e, kn), Un = (e) => an(e, An), Wn = ["off", "defrost"], Gn = (e) => Array.isArray(e) && e.length > 0 && e.every((e) => typeof e == "string" && e.trim() !== "");
function Kn(e) {
	let t = N(e, "states"), n = Fn(t) ? t : {}, r = (e) => {
		let t = n[e];
		return Gn(t) ? t : rt[e];
	};
	return {
		off: r("off"),
		defrost: r("defrost")
	};
}
function qn(e) {
	let t = N(e, "features");
	if (!Fn(t)) return {};
	let n = {};
	for (let e of _n) {
		let r = t[e];
		(r === !0 || r === !1 || r === "unused") && (n[e] = r);
	}
	return n;
}
var Jn = (e) => e === !0 || e === !1 || e === "unused";
function Yn(e) {
	let t = N(e, "entities");
	return Fn(t) ? new Set(Xn(t).filter(([e, t]) => wt.has(e) && Ln(t)).map(([e]) => e)) : /* @__PURE__ */ new Set();
}
function Xn(e, t = "") {
	return Object.entries(e).flatMap(([e, n]) => {
		let r = t === "" ? e : `${t}.${e}`;
		return Fn(n) ? Xn(n, r) : [[r, n]];
	});
}
function Zn(e) {
	let t = N(e, "variant");
	return P(t) || vn.some((e) => e === t) ? [] : [w.invalid("variant", E.integer(String(vn[0]), String(vn[vn.length - 1])))];
}
function Qn(e) {
	let t = N(e, "prefix");
	return Pn(t) || typeof t == "string" && In.test(t.trim()) ? [] : [w.invalid("prefix", E.prefix)];
}
function $n(e) {
	let t = N(e, "features");
	return P(t) ? [] : Fn(t) ? Object.entries(t).flatMap(([e, t]) => _n.some((t) => t === e) ? P(t) || Jn(t) ? [] : [E.featureState(e)] : [E.unknownFeature(e, _n)]) : [w.invalid("features", w.object)];
}
function er(e) {
	let t = N(e, "states");
	return P(t) ? [] : Fn(t) ? Object.entries(t).flatMap(([e, t]) => Wn.some((t) => t === e) ? P(t) || Gn(t) ? [] : [E.statesList(e)] : [E.statesKey(e)]) : [w.invalid("states", w.object)];
}
function tr(e) {
	let t = N(e, "entities");
	return P(t) ? [] : Fn(t) ? Xn(t).flatMap(([e, t]) => Pn(t) ? [] : wt.has(e) ? Ut(t) !== void 0 || Ln(t) ? [] : [E.notEntityId(e)] : [E.unknownRole(e)]) : [w.invalid("entities", w.object)];
}
function nr(e) {
	let t = N(e, "entities");
	return Fn(t) && Xn(t).some(([, e]) => !Pn(e));
}
function rr(e) {
	let t = Object.keys(e).filter((e) => !Mn.includes(e)).map((e) => E.unknownOption(e)), n = rn(e, jn), r = [
		...t,
		...n,
		...Zn(e),
		...Qn(e),
		...$n(e),
		...tr(e),
		...er(e),
		...mn(e)
	];
	if (rn(e, [Tn, Dn]).length === 0 && !P(N(e, "dhw"))) {
		let { model: t, dhw: n } = Bn(e);
		(t === "B" && n === "internal" || t === "C" && (n === "external" || n === "none")) && r.push(E.dhwMismatch(n, t));
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
}, or = "2026-01-01T12:00:00Z", sr = Object.fromEntries(Et.map((e) => [e, ir(e)])), cr = Object.fromEntries(Et.map((e) => {
	let t = wt.get(e)?.unit, n = ir(e);
	return [n, {
		entity_id: n,
		state: ar[e],
		last_updated: or,
		attributes: t === void 0 ? {} : { unit_of_measurement: t }
	}];
}));
// src/config/resolve.ts
function lr(e, t, n = Yn(e)) {
	return Object.fromEntries(M.map((r) => [r.path, Wt(e, `entities.${r.path}`) ?? (t === void 0 || n.has(r.path) ? void 0 : Dt(r, t))]));
}
function ur(e, t, n = Yn(e)) {
	return t === void 0 ? /* @__PURE__ */ new Set() : new Set(M.filter((t) => Wt(e, `entities.${t.path}`) === void 0 && !n.has(t.path)).map((e) => e.path));
}
var dr = (e) => Rn(e) === void 0 && !nr(e);
function fr(e) {
	let t = Rn(e), n = zn(e), r = dr(e), i = Yn(e);
	return {
		...Bn(e),
		detail: Vn(e),
		exchangerFill: Hn(e),
		layout: Un(e),
		variant: n,
		prefix: t,
		states: Kn(e),
		colors: hn(e),
		features: bn(n, qn(e)),
		entities: r ? sr : lr(e, t, i),
		notPresent: i,
		defaulted: r ? /* @__PURE__ */ new Set() : ur(e, t, i),
		sample: r
	};
}
// src/diagram/component-info.ts
var pr = {
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
}, mr = [
	"compressor.speed",
	"compressor.percentage",
	"compressor.power"
];
function hr(e, t) {
	return e === 11 ? mr.find((e) => t?.entities[e] !== void 0) ?? mr[0] : pr[e];
}
var gr = "source.fan_speed", _r = "dhw.temperature", vr = (e, t) => e === void 0 || t?.onTap === void 0 ? void 0 : t.entities[e];
function yr(e, t) {
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
var br = o`
  outline: 2px solid var(--primary-color, currentColor);
  outline-offset: 2px;
  filter: drop-shadow(0 0 2px var(--primary-color, currentColor));
`, xr = {
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
}, Sr = {
	air_unit_out: {
		at: (e) => ({
			x: e.airUnitWallX + 3,
			y: e.airPortY.top + wr(e),
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
}, Cr = {
	evaporation_temperature: {
		x: 572,
		y: 432,
		align: "middle",
		reason: "evaporator 7's temperature 5 units higher: at y 437 its box reaches exchanger 10 (x 500-559, from y 439), whose top is only 14 units under evaporator 7 (to y 425)"
	},
	tank_internal_setpoint: {
		x: 488,
		y: 150,
		align: "middle",
		reason: "tank 50's setpoint (item 50) 11 units left of the centre to leave room for the start delta end-aligned at x 563"
	},
	tank_internal_demand: {
		x: 488,
		y: 163,
		align: "middle",
		reason: "tank 50's demand text under the row (item 50), kept under the setpoint it follows"
	},
	tank_internal_start_delta: {
		x: 563,
		y: 150,
		align: "end",
		reason: "tank 50's start delta ends at x 563, 2 units before item 54 (x 565-611, from y 151) that its box reached when centred at x 560"
	},
	brine_pressure: {
		x: 720,
		y: 459,
		align: "end",
		reason: "ends at x 720, before pipe brine_tap_b (x 723-726) that the start-aligned value of transducer 37 ran over"
	},
	brine_pump: {
		x: 686,
		y: 323,
		align: "end",
		reason: "pump 16's speed under the pump and left of pipe ln4, not beside it: the 45 units between pipe ln3 (to x 633) and the pump (from x 678) hold the speed only above 700 px"
	},
	superheat: {
		x: 530,
		y: 371,
		align: "end",
		reason: "ends at x 530, left of evaporator 7 (item 7, from x 540) that the centred value touched; 5 units higher so that the pair, 14 apart, still fits above valve 12 (from y 393)"
	},
	expansion_valve: {
		x: 530,
		y: 385,
		align: "end",
		reason: "under the superheat (14 units), ending at x 530: 16 units before item 7's number (x 546), so that it does not read as 58 % 7"
	},
	air_unit_out: {
		x: 152,
		y: 172,
		align: "start",
		reason: "the air unit's outlet starts 2 units off the housing (6 before), so that the outlet caption and its widest value end before the feed pipe (x 224-228) at 640 px"
	},
	production_pump: {
		x: 396,
		y: 371,
		align: "end",
		reason: "pump 15's speed 9 units higher: at y 380 its box touched valve 27 (x 338-362, from y 383) at narrow widths"
	},
	compressor_speed: {
		x: 503,
		y: 308,
		align: "middle",
		reason: "compressor 11's stack of three rows is 14 units apart (12 before), since the 8 px text of a 640 px card is taller than 12 units"
	},
	compressor_percentage: {
		x: 503,
		y: 322,
		align: "middle",
		reason: "the middle row of compressor 11's stack"
	},
	compressor_power: {
		x: 503,
		y: 336,
		align: "middle",
		reason: "the bottom row of compressor 11's stack, clear of the pipe under it"
	},
	production_out: {
		x: 236,
		y: 228,
		align: "end",
		caption: D.portOut,
		reason: "the production column (probes 33 and 34) outside the cabinet's left wall (x 240), level with the probes, with the compact layout's outlet caption; the value ends 4 units before the wall"
	},
	production_in: {
		x: 236,
		y: 247,
		align: "end",
		caption: D.portIn,
		reason: "under the outlet value, outside the wall with the return caption: the 39 units between probe 34's pipes hold the value only above about 800 px, and left of pipe prod_44_26 it would straddle the wall"
	}
}, wr = (e) => Math.round(12 * (e.scale ?? 1) * 100) / 100, Tr = {
	production_out: D.portOut,
	production_in: D.portIn,
	brine_out: D.portOut,
	brine_in: D.portIn,
	tank_internal_temperature: D.dhw,
	tank_external_temperature: D.dhw
}, Er = /* @__PURE__ */ new Set(["tank_internal_temperature"]), Dr = /* @__PURE__ */ new Set([
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
]), Or = (e) => (t, n, r, i, a, o = {}) => {
	let s = e[t], c = Tr[t];
	return {
		id: t,
		role: n,
		tier: Dr.has(t) ? "key" : "detail",
		x: r,
		y: i,
		align: a,
		...s === void 0 ? {} : { compact: s },
		...c === void 0 ? {} : { compactCaption: c },
		...o
	};
};
function kr(e, t, n = (e, t) => [e, t]) {
	let { externalTank: r, internalTank: i, airUnit: a, airUnitWallX: o } = e, s = r.x + r.width / 2, c = r.y + r.height + 22, l = i.y + 12, u = i.x + i.width / 2, d = a.y + a.height + 12, f = o + 6, p = wr(e), m = Or(t), h = (e, t, r, i, a, o) => {
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
			caption: D.fan
		}),
		m("outside_temperature", "source.outside_temperature", e.airUnit.fanX, d + 13, "middle", {
			source: ["air", "hybrid"],
			caption: D.outside
		}),
		m("air_unit_in", "brine.outlet_temperature", f, e.airPortY.bottom - p, "start", {
			source: ["air"],
			caption: D.portIn
		}),
		m("air_unit_out", "source.air_unit_outlet_temperature", f, e.airPortY.top + p, "start", {
			source: ["air"],
			caption: D.portOut
		}),
		m("hybrid_air_unit_in", "brine.outlet_temperature", f, e.airPortY.top + p, "start", {
			source: ["hybrid"],
			caption: D.portIn
		}),
		m("ground_in", "brine.outlet_temperature", e.groundLoop.downX + 6, e.groundLineY.ground + 20, "start", {
			source: ["ground"],
			caption: D.portIn
		}),
		m("ground_out", "brine.inlet_temperature", e.groundLoop.upX - 6, e.groundLineY.ground + 20, "end", {
			source: ["ground"],
			caption: D.portOut
		}),
		m("hybrid_ground_out", "brine.inlet_temperature", e.groundLoop.upX - 6, e.groundLineY.hybrid + 20, "end", {
			source: ["hybrid"],
			caption: D.portOut
		}),
		m("tank_external_temperature", "dhw.temperature", s, c, "middle", {
			dhw: "external",
			emphasis: !0
		}),
		m("tank_external_setpoint", "dhw.setpoint", s, c + 15, "middle", {
			dhw: "external",
			caption: D.setpoint
		}),
		m("tank_external_start_delta", "dhw.start_delta", s, c + 29, "middle", {
			dhw: "external",
			caption: D.startDelta
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
			caption: D.setpointShort,
			bare: !0
		}),
		m("tank_internal_start_delta", "dhw.start_delta", e.internalTank.x + e.internalTank.width * 5 / 6, l, "middle", {
			dhw: "internal",
			caption: D.startDeltaShort,
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
var F = (e) => Math.round(e * 100) / 100;
function Ar(e) {
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
var jr = [[-75, -13], [-75, 13]];
function Mr({ externalTank: e }) {
	let { x: t, y: n, width: r, height: i, dome: a } = e, o = r / 2;
	return `M${String(t)} ${String(n + a)} A${String(o)} ${String(a)} 0 0 1 ${String(t + r)} ${String(n + a)} V${String(n + i - a)} A${String(o)} ${String(a)} 0 0 1 ${String(t)} ${String(n + i - a)} Z`;
}
var I = {
	x: 240,
	y: 130,
	width: 520,
	height: 475
}, L = Ar({
	viewBox: {
		width: 1e3,
		height: 620
	},
	cabinet: I,
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
		y: I.y,
		width: 168,
		height: 180,
		dome: 14
	},
	airUnit: {
		x: 26,
		y: I.y,
		width: 124,
		height: 210,
		fanX: 88,
		fanY: I.y + 162,
		fanRadius: 34,
		coil: {
			x: 36,
			y: I.y + 16,
			width: 104,
			height: 74
		},
		fins: {
			x: 52,
			step: 6,
			count: 13,
			y0: I.y + 20,
			y1: I.y + 86
		},
		slats: {
			y0: I.y + 134,
			step: 9,
			count: 8
		},
		dividerY: I.y + 114,
		captionX: 88,
		captionY: I.y - 8,
		passes: {
			y0: I.y + 30,
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
}), R = (e, t, n, r, i, a, o = {}) => ({
	item: e,
	kind: t,
	x: n,
	y: r,
	rotation: i,
	tag: a,
	...o
}), Nr = (e) => [
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
	R(50, "tank", e.internalTank.x + e.internalTank.width / 2, e.internalTank.y + e.internalTank.height / 2, 0, [
		-96,
		-26,
		"end"
	], { dhw: "internal" }),
	R(51, "coil", e.coil51.x, e.coil51.y, 0, [
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
], Pr = (e) => e.split(" ").map((e) => {
	let [t, n] = e.split(",").map(Number);
	return [t ?? 0, n ?? 0];
});
function Fr(e, t) {
	let { y0: n, step: r, count: i, left: a, right: o } = e.airUnit.passes, s = [[e.coilPortX, n]];
	for (let t = 0; t < i; t += 1) {
		let c = n + t * r;
		t % 2 == 0 ? (t > 0 && s.push([o, c]), s.push([a, c])) : s.push([a, c], t === i - 1 ? [e.coilPortX, c] : [o, c]);
	}
	return (t ? s.reverse() : s).map(([e, t]) => `${String(e)},${String(t)}`).join(" ");
}
function Ir(e, t, n) {
	let { downX: r, upX: i, depth: a } = e.groundLoop, [o, s] = [(r + i) / 2, t + a];
	return n === "down" ? `${String(r)},${String(t)} ${String(r)},${String(s)} ${String(o)},${String(s)}` : `${String(o)},${String(s)} ${String(i)},${String(s)} ${String(i)},${String(t)}`;
}
var z = (...e) => e.map(([e, t]) => `${String(e)},${String(t)}`).join(" "), B = (e, t, n, r, i = {}) => ({
	id: e,
	circuit: t,
	points: Pr(n),
	temperatureRole: r,
	direction: 1,
	...i
}), Lr = ["production_dg1"], V = ["production_dg1", "production_dhw"], H = "production.outlet_temperature", U = "production.return_temperature", W = "production.pump", G = "brine.inlet_temperature", K = "brine.outlet_temperature", q = "brine.pump", Rr = "compressor.discharge_temperature", zr = "compressor.suction_temperature", Br = "refrigerant.condensation_temperature", Vr = "refrigerant.evaporation_temperature", J = "compressor.percentage", Hr = "dhw.temperature", Ur = "source.air_unit_outlet_temperature", Wr = [
	"dhw_sup_b",
	"dhw_sup_c",
	"dhw_ret_b",
	"dhw_ret_c",
	"dhw_ext_in",
	"dhw_ext_coil",
	"dhw_ext_out"
], Gr = (e) => [
	B("p1_stub", Lr, "270,130 270,118", H, { stub: !0 }),
	B("p2_stub", Lr, "312,118 312,130", U, { stub: !0 }),
	B("p1_up", Lr, "270,160 270,130", H, {
		dhw: "any",
		speedRole: W
	}),
	B("p1_direct", Lr, "270,184 270,130", H, {
		dhw: "none",
		speedRole: W
	}),
	B("p2_in", Lr, "312,130 312,198", U, { speedRole: W }),
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
	B("htr_in", ["htr"], "340,198 340,214", Hr, {
		feature: "htr",
		dhw: "any"
	}),
	B("htr_pump", ["htr"], "340,238 340,247", Hr, {
		feature: "htr",
		dhw: "any"
	}),
	B("htr_to_9", ["htr"], "340,265 340,296 361,296", Hr, {
		feature: "htr",
		dhw: "any"
	}),
	B("htr_drain", ["htr"], "340,296 340,309", Hr, {
		feature: "htr",
		dhw: "any",
		stub: !0
	}),
	B("htr_riser", ["htr"], "361,250 361,172", Hr, {
		feature: "htr",
		dhw: "any"
	}),
	B("dhw_ext_in", ["dhw_coil"], `722,130 722,${String(e.run.inY)} ${String(e.externalCoil.cx + e.externalCoil.rx)},${String(e.run.inY)} ${String(e.externalCoil.cx + e.externalCoil.rx)},${String(e.externalCoil.top)}`, H, {
		dhw: "external",
		speedRole: W
	}),
	B("dhw_ext_coil", ["dhw_coil"], `${String(e.externalCoil.cx + e.externalCoil.rx)},${String(e.externalCoil.top)} ${String(e.externalCoil.cx - e.externalCoil.rx)},${String(e.externalCoil.bottom)}`, H, {
		dhw: "external",
		speedRole: W,
		shape: {
			kind: "helix",
			cx: e.externalCoil.cx,
			top: e.externalCoil.top,
			bottom: e.externalCoil.bottom,
			rx: e.externalCoil.rx,
			turns: 4.5
		}
	}),
	B("dhw_ext_out", ["dhw_coil"], `${String(e.externalCoil.cx - e.externalCoil.rx)},${String(e.externalCoil.bottom)} ${String(e.externalCoil.port6X)},${String(e.externalCoil.bottom)} ${String(e.externalCoil.port6X)},${String(e.run.outY)} 748,${String(e.run.outY)} 748,130`, U, {
		dhw: "external",
		speedRole: W
	}),
	B("tap_47", ["dhw_coil"], "440,118 440,138", Hr, {
		dhw: "internal",
		stub: !0
	}),
	B("tap_48", ["dhw_coil"], "490,138 490,118", Hr, {
		dhw: "internal",
		stub: !0
	}),
	B("tap_49", ["dhw_coil"], "540,118 540,138", Hr, {
		dhw: "internal",
		stub: !0
	}),
	B("src_out", ["brine"], z([630, 130], [630, e.run.outY], [e.joinX.out, e.run.outY]), K, { speedRole: q }),
	B("src_in", ["brine"], z([e.joinX.in, e.run.inY], [690, e.run.inY], [690, 130]), G, { speedRole: q }),
	B("src_air_feed", ["brine"], z([e.joinX.out, e.run.outY], [e.run.feedX, e.run.outY], [e.run.feedX, e.airPortY.bottom], [e.coilPortX, e.airPortY.bottom]), K, {
		source: ["air"],
		speedRole: q
	}),
	B("src_air_coil", ["brine"], Fr(e, !0), K, {
		source: ["air"],
		speedRole: q,
		bend: e.airCoilBend
	}),
	B("src_air_exit", ["brine"], z([e.coilPortX, e.airPortY.top], [e.run.returnX, e.airPortY.top], [e.run.returnX, e.run.inY], [e.joinX.in, e.run.inY]), Ur, {
		source: ["air"],
		speedRole: q
	}),
	B("src_gnd_feed", ["brine"], z([e.joinX.out, e.run.outY], [e.groundLoop.downX, e.run.outY], [e.groundLoop.downX, e.groundLineY.ground]), K, {
		source: ["ground"],
		speedRole: q
	}),
	B("src_gnd_down", ["brine"], Ir(e, e.groundLineY.ground, "down"), K, {
		source: ["ground"],
		speedRole: q,
		roundEnd: !0,
		bend: e.loopBend
	}),
	B("src_gnd_up", ["brine"], Ir(e, e.groundLineY.ground, "up"), G, {
		source: ["ground"],
		speedRole: q,
		bend: e.loopBend
	}),
	B("src_gnd_exit", ["brine"], z([e.groundLoop.upX, e.groundLineY.ground], [e.groundLoop.upX, e.run.inY], [e.joinX.in, e.run.inY]), G, {
		source: ["ground"],
		speedRole: q
	}),
	B("src_hyb_feed", ["brine"], z([e.joinX.out, e.run.outY], [e.run.feedX, e.run.outY], [e.run.feedX, e.airPortY.top], [e.coilPortX, e.airPortY.top]), K, {
		source: ["hybrid"],
		speedRole: q
	}),
	B("src_hyb_coil", ["brine"], Fr(e, !1), K, {
		source: ["hybrid"],
		speedRole: q,
		bend: e.airCoilBend
	}),
	B("src_hyb_link", ["brine"], z([e.coilPortX, e.airPortY.bottom], [e.groundLoop.downX, e.airPortY.bottom], [e.groundLoop.downX, e.groundLineY.hybrid]), Ur, {
		source: ["hybrid"],
		speedRole: q
	}),
	B("src_hyb_down", ["brine"], Ir(e, e.groundLineY.hybrid, "down"), Ur, {
		source: ["hybrid"],
		speedRole: q,
		roundEnd: !0,
		bend: e.loopBend
	}),
	B("src_hyb_up", ["brine"], Ir(e, e.groundLineY.hybrid, "up"), G, {
		source: ["hybrid"],
		speedRole: q,
		bend: e.loopBend
	}),
	B("src_hyb_exit", ["brine"], z([e.groundLoop.upX, e.groundLineY.hybrid], [e.groundLoop.upX, e.groundLineY.hybrid - 15], [e.run.hybridReturnX, e.groundLineY.hybrid - 15], [e.run.hybridReturnX, e.run.inY], [e.joinX.in, e.run.inY]), G, {
		source: ["hybrid"],
		speedRole: q
	}),
	B("ref_discharge", ["refrigerant"], "496,250 385,250", Rr, {
		through: "htr",
		speedRole: J
	}),
	B("ref_9_14", ["refrigerant"], "385,296 416,296", Rr, {
		through: "htr",
		speedRole: J
	}),
	B("ref_discharge_direct", ["refrigerant"], "496,250 416,250 416,296", Rr, {
		bypass: "htr",
		speedRole: J
	}),
	B("ref_14_8", ["refrigerant"], "444,306 444,348", Rr, {
		through: "active_cooling",
		reversible: !0,
		speedRole: J
	}),
	B("ref_7_14", ["refrigerant"], "560,348 560,296 444,296", zr, {
		through: "active_cooling",
		reversible: !0,
		speedRole: J
	}),
	B("ref_suction", ["refrigerant"], "444,286 610,286 610,250 524,250", zr, {
		through: "active_cooling",
		speedRole: J
	}),
	B("ref_direct_8", ["refrigerant"], "416,296 444,296 444,348", Rr, {
		bypass: "active_cooling",
		speedRole: J
	}),
	B("ref_direct_suction", ["refrigerant"], "560,348 560,286 610,286 610,250 524,250", zr, {
		bypass: "active_cooling",
		speedRole: J
	}),
	B("ref_8_13", ["refrigerant"], "444,416 473,416", Br, {
		reversible: !0,
		speedRole: J
	}),
	B("ref_13_12", ["refrigerant"], "501,416 515,416", Br, {
		reversible: !0,
		speedRole: J
	}),
	B("ref_12_7", ["refrigerant"], "539,416 560,416", Vr, {
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
], Kr = [
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
], qr = [
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
function Jr(e, t) {
	return {
		...t,
		id: e,
		components: Nr(t),
		segments: Gr(t),
		crossings: Kr,
		circuitLabels: qr,
		labels: { specs: kr(t, {}).specs.map((e) => {
			let t = Cr[e.id];
			return t === void 0 ? e : {
				...e,
				x: t.x,
				y: t.y,
				align: t.align,
				...t.caption === void 0 ? {} : { caption: t.caption }
			};
		}) }
	};
}
var Yr = Jr("full", L);
function Xr(e, t) {
	let n = e[0], r = e[e.length - 1];
	if (n === void 0 || r === void 0) return t;
	if (t <= n[0]) return F(t + n[1] - n[0]);
	if (t >= r[0]) return F(t + r[1] - r[0]);
	let i = e.findIndex(([e]) => e > t), [a, o] = e[i - 1] ?? n, [s, c] = e[i] ?? r;
	return F(o + (t - a) / (s - a) * (c - o));
}
var Zr = [
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
], Qr = [[130, 130], [505, 505]], Y = (e) => Xr(Zr, e), $r = (e) => Xr(Qr, e), X = .8, ei = (e) => F(e * X), ti = -12, ni = (e) => F(ei(e) + ti), ri = (e) => F(I.y + (e - I.y) * X), ii = {
	x: 200,
	y: I.y,
	width: 620,
	height: 400
}, ai = Ar({
	viewBox: {
		width: 1e3,
		height: ii.y + ii.height + 15
	},
	scale: X,
	cabinet: ii,
	internalTank: {
		x: Y(L.internalTank.x),
		y: L.internalTank.y,
		width: F(Y(L.internalTank.x + L.internalTank.width) - Y(L.internalTank.x)),
		height: L.internalTank.height
	},
	coil51: {
		x: Y(L.coil51.x),
		y: L.coil51.y
	},
	externalTank: {
		x: 853,
		y: I.y,
		width: Math.round(168 * X),
		height: Math.round(180 * X),
		dome: Math.round(14 * X)
	},
	airUnit: {
		x: ni(26),
		y: I.y,
		width: ei(124),
		height: F(210 * X),
		fanX: ni(88),
		fanY: ri(I.y + 162),
		fanRadius: F(34 * X),
		coil: {
			x: ni(36),
			y: ri(I.y + 16),
			width: ei(104),
			height: F(74 * X)
		},
		fins: {
			x: ni(52),
			step: F(6 * X),
			count: 13,
			y0: ri(I.y + 20),
			y1: ri(I.y + 86)
		},
		slats: {
			y0: ri(I.y + 134),
			step: F(9 * X),
			count: 8
		},
		dividerY: ri(I.y + 114),
		captionX: ni(88),
		captionY: I.y - 8,
		passes: {
			y0: ri(I.y + 30),
			step: F(15 * X),
			count: 4,
			left: ni(44),
			right: ni(132)
		}
	},
	groundLoop: {
		downX: 130,
		upX: 84,
		depth: F(140 * X)
	},
	groundLineX: {
		start: ei(8),
		end: ei(220)
	},
	run: {
		outY: 85,
		inY: 50,
		feedX: 190,
		returnX: 172,
		hybridReturnX: 6
	}
}), oi = 470;
function si() {
	let e = ai, t = (e) => e >= I.x && e <= I.x + I.width, n = ([e, n]) => t(e) ? [Y(e), $r(n)] : [e, n], r = Y(368), i = Nr(e).filter((e) => e.detail !== "full").map((e) => e.item === 50 || e.item === 51 ? e : e.item === 38 ? {
		...e,
		x: r + 16,
		y: oi,
		rotation: 90
	} : {
		...e,
		x: Y(e.x),
		y: $r(e.y)
	}), a = Gr(e).filter((e) => e.detail !== "full").map((e) => e.id === "prod_tap_a" ? {
		...e,
		points: [[r, $r(416)], [r, oi]]
	} : {
		...e,
		points: e.points.map(n)
	}), o = new Set(a.map((e) => e.id)), s = Kr.filter((e) => o.has(e.over) && o.has(e.under) && (e.over !== "prod_10_in" || e.under !== "prod_tap_a")).map((e) => ({
		...e,
		at: n(e.at)
	})), c = kr(e, xr, (e, t) => [Y(e), $r(t)]);
	return {
		...e,
		id: "simplified",
		components: i,
		segments: a,
		crossings: s,
		circuitLabels: qr.map((e) => ({
			...e,
			x: Y(e.x),
			y: $r(e.y)
		})),
		labels: { specs: c.specs.map((t) => {
			if (t.id === "production_pressure") return {
				...t,
				x: r + 32,
				y: oi,
				align: "start"
			};
			let n = Sr[t.id]?.at(e, (e, t) => [Y(e), $r(t)]);
			return n === void 0 ? t : {
				...t,
				...n
			};
		}) }
	};
}
var ci = si();
function li(e, t) {
	return t === "compact" ? ci : e === "full" ? Yr : ci;
}
var ui = (e) => e.arrangement ?? li(e.detail, "full"), di = (e, t) => t === "htr" && e.dhw === "none" ? !1 : e.features[t], fi = (e) => e.dhw === "unused" ? e.model === "C" ? "internal" : "external" : e.dhw, pi = (e, t) => {
	let n = fi(t);
	return e === "any" ? n !== "none" : e === n;
};
function mi(e, t) {
	if (e.detail === "full" && t.detail !== "full" || e.source !== void 0 && !e.source.includes(t.source) || e.dhw !== void 0 && !pi(e.dhw, t) || e.bypass !== void 0 && di(t, e.bypass) !== !1 || e.through !== void 0 && di(t, e.through) === !1) return "hidden";
	if (e.feature !== void 0) {
		let n = di(t, e.feature);
		if (n === !1) return "hidden";
		if (n === "unused") return "muted";
	}
	return t.dhw === "unused" && e.dhw !== void 0 && (e.dhw !== "any" || e.unusedMuted === !0) ? "muted" : "normal";
}
function hi(e, t) {
	return e.flatMap((e) => {
		let n = mi(e, t);
		return n === "hidden" ? [] : [{
			part: e,
			state: n
		}];
	});
}
var gi = (e) => hi(ui(e).components, e), _i = (e) => hi(ui(e).segments, e), vi = (e, t) => (e.onlyWhen === void 0 || e.onlyWhen.valves2728 === t.valves2728) && e.circuit.some((e) => t.active.has(e)), yi = .35;
function bi(e) {
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
var xi = (e) => [...e.filter((e) => !e.front), ...e.filter((e) => e.front)];
function Si(e) {
	let t = (e) => String(Math.round(e * 100) / 100);
	return bi(e).map(({ front: e, curve: [n, r, i, a] }) => ({
		front: e,
		d: `M${t(n[0])} ${t(n[1])} C${t(r[0])} ${t(r[1])} ${t(i[0])} ${t(i[1])} ${t(a[0])} ${t(a[1])}`
	}));
}
function Ci(e, t) {
	let n = Ti(e, 0), r = [`M${String(n[0])} ${String(n[1])}`];
	for (let n = 1; n < e.length; n += 1) {
		let [i, a, o] = [
			Ti(e, n - 1),
			Ti(e, n),
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
var wi = (e, t) => e[0] === t[0] && e[1] === t[1];
function Ti(e, t) {
	let n = e[t];
	if (n === void 0) throw Error(`No point ${String(t)}`);
	return n;
}
var Ei = (e) => e.slice(1).map((t, n) => [Ti(e, n), t]), Di = (e, t, n) => e >= Math.min(t, n) && e <= Math.max(t, n);
function Oi(e, t = [], n = 7) {
	let r = [], i, a = (e) => {
		r.push(i === void 0 ? `M${String(e[0])} ${String(e[1])}` : `L${String(e[0])} ${String(e[1])}`), i = e;
	}, o = (e) => {
		r.push(`M${String(e[0])} ${String(e[1])}`), i = e;
	};
	a(Ti(e, 0));
	for (let [r, i] of Ei(e)) {
		let e = Math.sign(i[0] - r[0]), s = Math.sign(i[1] - r[1]), c = Math.abs(i[0] - r[0]) + Math.abs(i[1] - r[1]), l = t.filter((e) => ki(e, r, i) && !wi(e, r) && !wi(e, i)).sort((e, t) => Math.abs(e[0] - r[0]) + Math.abs(e[1] - r[1]) - (Math.abs(t[0] - r[0]) + Math.abs(t[1] - r[1])));
		for (let t of l) {
			let l = Math.abs(t[0] - r[0]) + Math.abs(t[1] - r[1]);
			l > n && a([t[0] - e * n, t[1] - s * n]), o(c - l > n ? [t[0] + e * n, t[1] + s * n] : i);
		}
		a(i);
	}
	return r.join(" ");
}
var ki = (e, t, n) => t[0] === n[0] && e[0] === t[0] && Di(e[1], t[1], n[1]) || t[1] === n[1] && e[1] === t[1] && Di(e[0], t[0], n[0]);
function Ai(e, t, n) {
	return e.crossings.filter((e) => e.under === t && n.has(e.over) && n.has(e.under)).map((e) => e.at);
}
function ji(e) {
	return e === "full" ? 640 : 600;
}
function Mi(e, t, n, r) {
	return e === "auto" ? t === void 0 || !(t > 0) ? !1 : t < ji(r) + (n ? 24 : 0) : e === "compact";
}
var Ni = {
	pipe: 3,
	outline: 2
}, Pi = 2, Fi = 1.25, Ii = (e) => Math.ceil(e * 10 - 1e-9) / 10;
function Li(e) {
	if (e === void 0 || !(e > 0)) return Ni;
	let t = e / 1e3;
	return {
		pipe: Math.max(Ni.pipe, Ii(Pi / t)),
		outline: Math.max(Ni.outline, Ii(Fi / t))
	};
}
function Ri(e) {
	let { cardWidth: t, viewBox: n } = e;
	if (t === void 0 || !(t > 0)) return 0;
	if (!e.isPanel || !(e.windowHeight > 0)) return t;
	let r = e.headerHeight !== void 0 && e.headerHeight > 0 ? e.headerHeight : 56, i = e.safeAreaTop !== void 0 && e.safeAreaTop > 0 ? e.safeAreaTop : 0, a = Math.floor((e.windowHeight - r - i - 64) * n.width / n.height);
	return Math.min(t, Math.max(a, 320));
}
// src/diagram/pipes.ts
var zi = 1.2, Bi = .6, Vi = [
	"tap_47",
	"tap_48",
	"tap_49"
], Hi = [
	"prod_27_15",
	"prod_15_8",
	"prod_tap_a",
	"prod_tap_b",
	"prod_drain"
];
function Ui(e) {
	if (e !== void 0 && e > 0) return Math.min(8, Math.max(Bi, zi * 100 / e));
}
var Wi = {
	"compressor.discharge_temperature": "compressor.suction_temperature",
	"compressor.suction_temperature": "compressor.discharge_temperature",
	"refrigerant.condensation_temperature": "refrigerant.evaporation_temperature",
	"refrigerant.evaporation_temperature": "refrigerant.condensation_temperature"
}, Gi = (e, t) => Wr.includes(e.id) && Ki(t), Ki = (e) => e.active.has("htr") && !e.active.has("production_dhw");
function qi(e, t) {
	return Gi(e, t.circuits) ? "dhw.temperature" : e.reversible === !0 && t.mode === "active_cooling" ? Wi[e.temperatureRole] ?? e.temperatureRole : (t.mode === "passive_cooling" || t.mode === "defrost") && t.circuits.valves2728 === "exchanger" && Hi.includes(e.id) ? "production.outlet_temperature" : e.temperatureRole;
}
function Ji(e, t, n) {
	return t === "muted" && n === "defrost" && e.feature === "passive_cooling" ? "normal" : t;
}
var Yi = (e, t) => {
	let n = e[t];
	return n === !0 ? 3 : Ui(typeof n == "number" ? n : void 0);
}, Xi = (e, t) => {
	let n = e[t];
	return typeof n == "number" ? n : void 0;
};
function Zi(e, t, n) {
	let { mode: r, circuits: i, readings: a, stops: o } = n, s = Vi.includes(e.id), c = Ji(e, t, r), l = s || vi(e, i), u = Xi(a, qi(e, n)), d = c === "muted" || !l || u === void 0, f = e.direction === -1 != (e.reversible === !0 && r === "active_cooling"), p = {
		color: d ? sn : gn(u, o),
		muted: d,
		reversed: f
	};
	if (!l || c === "muted" || e.stub === !0 || s) return {
		...p,
		animated: !1
	};
	let m = Gi(e, i) || e.speedRole === void 0 && e.circuit.includes("htr") ? 3 : e.speedRole === void 0 ? void 0 : Yi(a, e.speedRole);
	return m === void 0 ? {
		...p,
		animated: !1
	} : {
		...p,
		animated: !0,
		duration: m
	};
}
var Qi = (e) => gn(Xi(e.readings, "dhw.temperature"), e.stops);
function $i(e) {
	let { circuits: t, readings: n, stops: r } = e;
	return Ki(t) ? gn(Xi(n, "dhw.temperature"), r) : t.active.has("dhw_coil") ? gn(Xi(n, "production.outlet_temperature"), r) : sn;
}
// src/diagram/symbols.ts
var ea = .55;
function ta(e, t, n) {
	let r = -t - 9, i = t + 9;
	return S`<path class="exchanger-fill" data-half=${e} d=${e === "left" ? `M0 ${String(r)} H-16 A4 4 0 0 0 -20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 0 -16 ${String(i)} H0 Z` : `M0 ${String(r)} H16 A4 4 0 0 1 20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 1 16 ${String(i)} H0 Z`} fill=${n} fill-opacity=${ea} stroke="none" />`;
}
var na = (e, t) => S`<text class="glyph" text-anchor="middle" dominant-baseline="central" font-size="9" fill="currentColor" stroke="none" transform="rotate(${-t})">${e}</text>`, ra = {
	kind: "helix",
	cx: 2,
	top: -60,
	bottom: 60,
	rx: 11,
	turns: 7.5
};
function ia({ internalTank: e, coil51: t }) {
	let n = e.x + 2 - t.x, r = Si(ra), { cx: i, rx: a, top: o, bottom: s } = ra, c = jr[0][1], l = jr[1][1], u = a - i;
	return S`<g transform="matrix(0 -1 1 0 0 0)">${xi(r).map((e) => S`<path data-half=${e.front ? "front" : "back"} stroke-linecap=${e.front ? "round" : "butt"} d=${e.d} opacity=${e.front ? C : yi} />`)}</g><path style="stroke-width: var(--pipe-width, 3)" d="M${n} ${c} H${o} M${s} ${u} V${l} H${n}" />`;
}
var aa = "M9 -10.7 L-13 -3 M9 10.7 L-13 3", oa = (e, t) => S`<path d="M0 ${t} V${e}" />`, sa = (e, t) => S`<path d="${e}" fill=${t ? "currentColor" : "none"} />`;
function ca(e, t) {
	let n = t.rotation ?? 0, r = () => {
		if (t.arrangement === void 0) throw Error(`the ${e} symbol needs the arrangement it is drawn in`);
		return t.arrangement;
	};
	switch (e) {
		case "pump": return S`<circle r="12" /><path d="M-5 -7 V7 L8 0 Z" fill="currentColor" />`;
		case "valve3": {
			let e = t.open ?? ["l", "r"];
			return S`${sa("M-12 -6 V6 L0 0 Z", e.includes("l"))}${sa("M12 -6 V6 L0 0 Z", e.includes("r"))}${sa("M-6 12 H6 L0 0 Z", e.includes("d"))}<rect x="-4" y="-21" width="8" height="8" /><path d="M0 -13 V-8" />`;
		}
		case "inversion_valve": return S`<rect x="-10" y="-14" width="20" height="28" rx="3" /><path d="M-14 0 H-10 M10 -10 H14 M10 0 H14 M10 10 H14" />${t.reversed === !0 ? S`<path d="M-14 0 H14 M14 10 H5 V-10 H14" />` : S`<path d="M-14 0 H-5 V10 H14 M14 0 H5 V-10 H14" />`}`;
		case "probe_t": return S`<circle r="9" />${oa(16, 9)}${na("T", n)}`;
		case "transducer_p": return S`<circle r="9" />${oa(16, 9)}${na("P", n)}`;
		case "pressure_switch": return S`<rect x="-7" y="-7" width="14" height="14" />${oa(16, 7)}${na("P", n)}`;
		case "thermostat": return S`<rect x="-7" y="-7" width="14" height="14" />${oa(16, 7)}${na("T", n)}`;
		case "exchanger": {
			let e = t.size ?? 34, n = t.fills;
			return S`${n === void 0 ? C : S`${ta("left", e, n.left)}${ta("right", e, n.right)}`}<rect x="-20" y="${-e - 9}" width="40" height="${2 * e + 18}" rx="4" /><path d="M-12 ${-e} V${e} M12 ${-e} V${e}" /><circle cx="-12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="-12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" />`;
		}
		case "compressor": return S`<circle r="14" /><path class="compressor-lines" d="${aa}" />`;
		case "vessel": return S`<circle r="12" /><path d="M-12 2 H12" />`;
		case "safety_valve": return S`<path d="M0 16 V6 M-6 6 H6 L0 -4 Z M0 -4 L-3 -7 L3 -10 L0 -13" />`;
		case "valve": return S`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "drain_valve": return S`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "resistor": return S`<rect x="-28" y="-6" width="56" height="12" rx="2" /><path d="M-18 -6 V6 M18 -6 V6" />`;
		case "filter_dryer": return S`<rect x="-14" y="-5" width="28" height="10" rx="5" />`;
		case "expansion_valve": return S`<path d="M-12 -6 V6 L0 0 L12 -6 V6 L0 0 Z" />`;
		case "service_outlet": return S`<rect x="-3" y="-3" width="6" height="6" />${oa(10, 3)}`;
		case "port": return S`<rect x="-5" y="-6" width="10" height="6" />`;
		case "tank": return S`<rect class="tank-body" data-dhw-tank="internal" x=${-r().internalTank.width / 2} y=${-r().internalTank.height / 2} width=${r().internalTank.width} height=${r().internalTank.height} rx="14" fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />`;
		case "coil": return ia(r());
	}
}
function la(e, t = {}) {
	return S`<g class="symbol ${e}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${t.rotation ?? 0})">${ca(e, t)}</g>`;
}
// src/diagram/cabinet.ts
var ua = o`
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
    ${br}
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
function da(e, t) {
	return e === 26 ? t.valve26 === "dhw" ? ["l", "d"] : ["l", "r"] : t.valves2728 === "exchanger" ? ["d", "r"] : ["l", "r"];
}
function fa(e, t, n, r, i, a) {
	let { part: o } = e, { circuits: s } = t, c = Ji(o, e.state, t.mode), [l, u, d] = o.tag, f = tt(o.item), p = yr(vr(hr(o.item, r), r), r?.onTap);
	return S`<g class="symbol-group ${c}" data-item=${o.item} data-kind=${o.kind} aria-label=${f} role=${p.role} tabindex=${p.tabindex} @click=${p.click} @keydown=${p.keydown} style=${o.kind === "coil" ? `color: ${_a(t)}` : C}>
    <title>${f}</title>
    <g transform="translate(${o.x} ${o.y})">${la(o.kind, {
		rotation: o.rotation,
		size: o.size,
		open: o.kind === "valve3" ? da(o.item, s) : void 0,
		reversed: o.kind === "inversion_valve" ? s.valve14 === "reversed" : void 0,
		fills: a,
		arrangement: i
	})}</g>
    ${n === "full" ? S`<text class="item" x=${o.x + l} y=${o.y + u} text-anchor=${d ?? "start"}>${o.item}</text>` : C}
  </g>`;
}
function pa(e, t, n) {
	let r = Si(t), i = n.muted ? C : `stroke: ${n.color}`;
	return S`<g class="helix ${n.muted ? "muted" : ""}" data-segment=${e.id} style=${i}>
    ${xi(r).map((e) => S`<path class="pipe ${n.muted ? "muted" : ""}" data-half=${e.front ? "front" : "back"} style=${i} stroke-linecap=${e.front ? "round" : "butt"} opacity=${e.front ? C : yi} d=${e.d} />`)}
    ${n.animated ? S`<path class="flow ${n.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(n.duration)}s" d=${r.filter((e) => e.front).map((e) => e.d).join(" ")} />` : C}
  </g>`;
}
function ma(e, t, n, r, i) {
	if (e.shape !== void 0) return pa(e, e.shape, t);
	let a = e.bend === void 0 ? Oi(e.points, n, r) : Ci(e.points, e.bend);
	return S`<path class="pipe ${t.muted ? "muted" : ""}" data-segment=${e.id} style=${t.muted ? C : `stroke: ${t.color}`} stroke-linecap=${e.roundEnd === !0 ? "round" : C} d=${a} />${t.muted && i !== void 0 && va.has(e.id) ? S`<path class="pipe-inside" data-inside=${e.id} clip-path="url(#${i})" d=${a} />` : C}${t.animated ? S`<path class="flow ${t.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(t.duration)}s" d=${a} />` : C}`;
}
function ha(e, t, n, r) {
	let i = (e) => e.map((e) => n.get(e)).find((e) => e !== void 0), a = e.reversible === !0 && r === "active_cooling", [o, s] = a ? [e.leaving, e.entering] : [e.entering, e.leaving], c = i(o), l = i(s), u = (c?.muted ?? !0) && (l?.muted ?? !0), d = (e) => u ? sn : e?.color ?? "var(--disabled-text-color)", f = e.enters === "top" !== a;
	return {
		id: t,
		y1: +!f,
		y2: +!!f,
		start: d(c),
		end: d(l),
		muted: u
	};
}
var ga = (e) => S`<linearGradient id=${e.id} x1="0" y1=${e.y1} x2="0" y2=${e.y2} data-muted=${e.muted}>
      <stop offset="0" style="stop-color: ${e.start}" />
      <stop offset="1" style="stop-color: ${e.end}" />
    </linearGradient>`;
function _a(e) {
	let t = $i(e);
	return t === "var(--disabled-text-color)" ? ln : t;
}
var va = /* @__PURE__ */ new Set(["dhw_ext_in", "dhw_ext_out"]);
function ya(e, t, n, r = {
	mode: "gradient",
	idPrefix: "ecogeo"
}, i = Ni.pipe) {
	let a = 7 * i / Ni.pipe, o = ui(e), { cabinet: s } = o, c = _i(e), l = new Set(c.map((e) => e.part.id)), u = new Map(c.map((e) => [e.part.id, Zi(e.part, e.state, t)])), d = [], f = fi(e) === "external" ? `${r.idPrefix}-tank-clip` : void 0, p = gi(e).map((i) => {
		let a = r.mode === "gradient" ? i.part.sides : void 0;
		if (a === void 0) return fa(i, t, e.detail, n, o);
		let s = {
			left: "none",
			right: "none"
		};
		for (let e of a) {
			let n = ha(e, `${r.idPrefix}-x${String(i.part.item)}-${e.half}`, u, t.mode);
			d.push(n), s[e.half] = `url(#${n.id})`;
		}
		return fa(i, t, e.detail, n, o, s);
	});
	return S`<g class="cabinet">
    <defs>${d.map(ga)}${f === void 0 ? C : S`<clipPath id=${f} data-tank-clip><path d=${Mr(o)} /></clipPath>`}</defs>
    <rect class="outline" x=${s.x} y=${s.y} width=${s.width} height=${s.height} rx="6" />
    ${o.circuitLabels.filter((t) => e.captions !== !1 && mi(t, e) !== "hidden").map((e) => S`<text class="circuit-label" x=${e.x} y=${e.y} text-anchor="middle">${Ye[e.key]}</text>`)}
    ${c.map((e) => {
		let t = u.get(e.part.id);
		return t === void 0 ? C : ma(e.part, t, Ai(o, e.part.id, l), a, f);
	})}
    ${p}
  </g>`;
}
// src/diagram/dhw.ts
var ba = o`
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
    ${br}
  }
  .tank-caption {
    fill: var(--secondary-text-color);
    font-size: 11px;
  }
`;
function xa(e, t) {
	if (fi(e) !== "external") return S``;
	let n = ui(e), { x: r, y: i, width: a, dome: o } = n.externalTank, s = a / 2, c = Mr(n), l = `M${String(r)} ${String(i + o)} A${String(s)} ${String(o)} 0 0 0 ${String(r + a)} ${String(i + o)}`, u = yr(vr(_r, t), t?.onTap);
	return S`<g class=${e.dhw === "unused" ? "dhw-storage muted" : "dhw-storage"} data-dhw="external" aria-label=${Ze.externalTank} role=${u.role} tabindex=${u.tabindex} @click=${u.click} @keydown=${u.keydown}>
    <title>${Ze.externalTank}</title>
    <path class="tank-body" data-dhw-tank="external" d=${c} fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />
    <path class="tank-rim" d=${l} />
    ${e.captions === !1 ? C : S`<text class="tank-caption" x=${r + a / 2} y=${i - 6} text-anchor="middle">${Ze.externalTank}</text>`}
  </g>`;
}
// src/lib/format.ts
var Sa = "−";
function Ca(e) {
	let t = e?.locale;
	return typeof t == "object" && t ? t : e?.language === void 0 ? {} : { language: e.language };
}
function wa(e) {
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
var Ta = /* @__PURE__ */ new Map();
function Ea(e, t, n) {
	let r = wa(e), i = n && e.number_format !== "none", a = `${r?.join(",") ?? ""}|${String(t)}|${String(i)}`, o = Ta.get(a);
	return o === void 0 && (o = new Intl.NumberFormat(r, {
		minimumFractionDigits: t,
		maximumFractionDigits: t,
		useGrouping: i
	}), Ta.set(a, o)), o;
}
function Da(e, t, n = 0, r = !0) {
	if (!Number.isFinite(e)) return "–";
	let i = Number.isFinite(n) ? Math.min(20, Math.max(0, Math.trunc(n))) : 0, a = Math.abs(e) < .5 / 10 ** i ? 0 : e;
	return Ea(t ?? {}, i, r).formatToParts(a).map((e) => e.type === "minusSign" ? Sa : e.value).join("");
}
// src/calc/display.ts
function Oa(e) {
	if (typeof e != "object" || !e) return;
	let t = e.display_precision;
	return typeof t == "number" && Number.isInteger(t) && t >= 0 && t <= 20 ? t : void 0;
}
var ka = (e, t) => t ?? e.decimals ?? 0;
function Aa(e, t) {
	let n = typeof t == "string" ? t.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase() : "";
	return n === (e.unit ?? "").toLowerCase() || e.quantity === "difference" && n === "°c";
}
function ja(e) {
	if (/e/i.test(e ?? "")) return 0;
	let t = /^\s*[-+]?\d*\.(\d+)/.exec(e ?? "");
	return Math.min(20, t?.[1]?.length ?? 0);
}
function Ma(e, t) {
	let n = e === void 0 ? void 0 : t.states?.[e]?.attributes.unit_of_measurement;
	return typeof n == "string" && n.trim() !== "" ? n.trim() : void 0;
}
function Na(e, t, n, r) {
	if (typeof t == "boolean") return $e[t ? "on" : "off"];
	let i = wt.get(e);
	if (i === void 0 || t === void 0 || !Number.isFinite(t)) return;
	let a = Ma(n, r), o = Aa(i, a), s = i.quantity !== void 0 && gt(i.quantity, a), c = i.unit !== void 0 && a !== void 0 && !o && !s, l = n === void 0 || !(o || c) ? void 0 : Oa(r.entities?.[n]), u = c && l === void 0 ? ja(n === void 0 ? void 0 : r.states?.[n]?.state) : ka(i, l), d = Da(t, r.locale, u, !1), f = c ? a : i.unit;
	return f === void 0 ? d : `${d} ${f}`;
}
// src/diagram/labels.ts
var Pa = o`
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
`, Fa = /* @__PURE__ */ new Set();
function Ia(e, t, n, r, i = !1, a = Fa) {
	return ui(e).labels.specs.flatMap((o) => {
		if (i && o.tier !== "key" || a.has(o.role) || mi(o, e) === "hidden" || e.dhw === "unused" && o.dhw !== void 0) return [];
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
			...i && l !== void 0 && Er.has(o.id) ? { stacked: !0 } : {}
		}, f = t[o.role];
		if (o.demand === !0) {
			let e = o.role === "heating.demand" ? Qe.demand : Ze.demand;
			return f === !0 ? [{
				...d,
				text: e,
				missing: !1
			}] : [];
		}
		let p = Na(o.role, typeof f == "number" || typeof f == "boolean" ? f : void 0, s, r);
		return [{
			...d,
			text: p ?? "–",
			missing: p === void 0
		}];
	});
}
var La = /* @__PURE__ */ new Set(["outside_temperature", "cop"]);
function Ra(e, t, n, r, i = !1) {
	let { notPresent: a, absent: o } = r, s = (e, n, r, i) => n.every((e) => a.has(e)) ? void 0 : {
		id: e,
		tier: La.has(e) ? "key" : "detail",
		...r === void 0 ? {} : { caption: r },
		text: i ?? "–",
		missing: i === void 0,
		entityId: t[n[0]]
	}, c = (r) => {
		let i = e[r];
		return Na(r, typeof i == "number" || typeof i == "boolean" ? i : void 0, t[r], n);
	}, l = (e, t, n) => s(e, [t], n, c(t)), u = (e, t, n, r) => l(e, o.has(t) ? n : t, r), d = e["unit.on_off"], f = e["unit.summer"] === !0 ? O.summer : e["unit.winter"] === !0 ? O.winter : void 0, p = o.has("unit.system_cop") ? "unit.cop" : "unit.system_cop", m = s("cop", [p], r.mode === "active_cooling" ? O.eer : O.cop, e[p] === 0 ? void 0 : c(p)), { mode: h } = r, g = (h === "heating" || h === "active_cooling") && r.features.htr === !0 && (r.dhw === "external" || r.dhw === "internal") && !o.has("htr.power") ? l("htr_power", "htr.power", O.htr) : void 0, _ = h === "heating" ? [u("dg1_power", "heating.power", "heating.capacity", O.dg1), g] : h === "dhw" ? [u("dhw_power", "dhw.power", "heating.capacity", O.dhw)] : h === "active_cooling" ? [l("cooling_power", "cooling.capacity", O.cooling), g] : [], v = [
		s("on_off", ["unit.on_off"], void 0, d === void 0 ? void 0 : typeof d == "boolean" ? $e[d ? "on" : "off"] : $e[d.toLowerCase()] ?? d),
		s("season", e["unit.summer"] === !0 || a.has("unit.winter") ? ["unit.summer", "unit.winter"] : ["unit.winter", "unit.summer"], void 0, f),
		l("outside_temperature", "source.outside_temperature", O.outside),
		m,
		..._
	].filter((e) => e !== void 0);
	return i ? v.filter((e) => e.tier === "key") : v;
}
var za = (e, t) => ({
	left: `${String(e.x / t.width * 100)}%`,
	top: `${String(e.y / t.height * 100)}%`
});
function Ba(e, t, n, r) {
	let i = n ? "value missing" : "value";
	return e === void 0 || r === void 0 ? x`<span class=${i}>${t}</span>` : x`<button
        class=${i}
        type="button"
        @click=${() => {
		r(e);
	}}
      >
        ${t}
      </button>`;
}
function Va(e, t, n) {
	return x`${e.map((e) => {
		let { left: r, top: i } = za(e, n);
		return x`<span
      class="label ${e.align}${e.emphasis ? " emphasis" : ""}${e.bare === !0 ? " bare" : ""}${e.stacked === !0 ? " stacked" : ""}"
      data-label=${e.id}
      data-role=${e.role}
      data-label-item=${e.item ?? C}
      style="left: ${r}; top: ${i}"
      >${e.caption === void 0 ? C : x`<span class="caption">${e.caption}</span>`}${Ba(e.entityId, e.text, e.missing, t)}</span
    >`;
	})}`;
}
function Ha(e, t) {
	return x`${e.map((e) => x`<span class="footer-item" data-footer=${e.id}
        >${e.caption === void 0 ? C : x`<span class="caption">${e.caption}</span>`}${Ba(e.entityId, e.text, e.missing, t)}</span
      >`)}`;
}
// node_modules/@lit/reactive-element/decorators/property.js
var Ua = {
	attribute: !0,
	type: String,
	converter: ee,
	reflect: !1,
	hasChanged: te
}, Wa = (e = Ua, t, n) => {
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
function Ga(e) {
	return (t, n) => typeof n == "object" ? Wa(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function Ka(e) {
	return Ga({
		...e,
		state: !0,
		attribute: !1
	});
}
// src/lib/define.ts
function qa(e, t) {
	let n = customElements.get(e);
	return n === void 0 ? (customElements.define(e, t), !0) : (n !== t && console.warn(`${e} is already defined by another copy of the module; that copy stays in use.`), !1);
}
// src/config/keywords.ts
var Z = (e) => e.split(/\s+/).filter((e) => e !== ""), Q = "temp temperature temperatuur temperatura temperatur", Ja = "pressure druk presion druck", Ya = "pump pomp bomba pumpe circulator", Xa = "heating verwarming heizung heizkreis calefaccion cv", Za = `production productie produccion produktion ${Xa}`, Qa = "brine glycol source bron brijn captacion salmuera sole", $a = "dhw sanitary sanitaria tapwater warmwater warmwasser acs caliente domestic hotwater boiler", eo = "demand vraag demanda anforderung bedarf request", to = "suction zuig saug ansaug succion aspiracion niederdruck lagedruk", no = "discharge pers druckgas heissgas descarga hochdruck hogedruk", ro = "capacity vermogen capacidad kapazitat leistung power", io = "valve ventiel valvula ventil position stand posicion stellung", ao = "compressor compresor kompressor verdichter", oo = "condens condensation condensatie condensacion kondensation kondens", so = "evaporat evaporation evaporacion verdamp verdampfung", co = `${Xa} dg verwarmen`, lo = "setpoint set target desired gewenst ingesteld soll wunsch consigna objetivo streef", uo = "superheat oververhitting oververhit sobrecalentamiento ueberhitzung uberhitzung", fo = "on off aan uit onoff encendido apagado ein aus", po = "alarm alarma storing stoerung storung fehler error fault malfunction", mo = "htr recovery recuperacion recuperatie rueckgewinnung", ho = "power vermogen potencia leistung", go = "electric elektr", _o = [
	go,
	$a,
	mo
].join(" "), vo = [go, mo].join(" "), yo = [go, $a].join(" "), bo = "system systeem sistema", xo = "cop scop coefficient rendimiento rendement wirkungsgrad efficiency", So = {
	"production.outlet_temperature": {
		subject: Z(Za),
		role: Z(Q)
	},
	"production.return_temperature": {
		subject: Z(Za),
		role: Z(Q)
	},
	"production.pressure": {
		subject: Z(Za),
		role: Z(Ja)
	},
	"production.pump": {
		subject: Z(Za),
		role: Z(Ya)
	},
	"brine.outlet_temperature": {
		subject: Z(Qa),
		role: Z(Q)
	},
	"brine.inlet_temperature": {
		subject: Z(Qa),
		role: Z(Q)
	},
	"brine.pressure": {
		subject: Z(Qa),
		role: Z(Ja)
	},
	"brine.pump": {
		subject: Z(Qa),
		role: Z(Ya)
	},
	"compressor.speed": {
		subject: Z(ao),
		role: Z("rpm speed toerental toeren velocidad drehzahl frequency frequentie frecuencia frequenz hz running draait actief active activo laufend")
	},
	"compressor.percentage": {
		subject: Z(ao),
		role: Z("percentage porcentaje prozent load belasting carga auslastung capaciteit")
	},
	"compressor.power": {
		subject: Z("power vermogen potencia leistung electrical elektrisch electrico"),
		role: Z("consumption opgenomen verbruik consumo verbrauch aufnahme")
	},
	"compressor.suction_temperature": {
		subject: Z(to),
		role: Z(Q)
	},
	"compressor.discharge_temperature": {
		subject: Z(no),
		role: Z(Q)
	},
	"compressor.suction_pressure": {
		subject: Z(to),
		role: Z(Ja)
	},
	"compressor.discharge_pressure": {
		subject: Z(no),
		role: Z(Ja)
	},
	"compressor.mode": {
		subject: Z(ao),
		role: Z("mode modus modo operation operating bedrijf funcionamiento betriebsart")
	},
	"refrigerant.condensation_temperature": {
		subject: Z(oo),
		role: Z(Q)
	},
	"refrigerant.evaporation_temperature": {
		subject: Z(so),
		role: Z(Q)
	},
	"refrigerant.superheat": {
		subject: Z(uo),
		role: Z(uo)
	},
	"refrigerant.expansion_valve": {
		subject: Z("expansion expansie expansionsventil expans"),
		role: Z(io)
	},
	"heating.capacity": {
		subject: Z(oo),
		role: Z(ro)
	},
	"cooling.capacity": {
		subject: Z(so),
		role: Z(ro)
	},
	"heating.demand": {
		subject: Z(co),
		role: Z(eo)
	},
	"heating.setpoint": {
		subject: Z(co),
		role: Z(`${Q} ${lo}`)
	},
	"dhw.temperature": {
		subject: Z($a),
		role: Z(Q)
	},
	"dhw.setpoint": {
		subject: Z($a),
		role: Z(`${Q} ${lo}`)
	},
	"dhw.start_delta": {
		subject: Z($a),
		role: Z("delta difference verschil diferencia unterschied start starten arranque")
	},
	"dhw.demand": {
		subject: Z($a),
		role: Z(eo)
	},
	"source.fan_speed": {
		subject: Z("fan ventilator ventilador luefter lufter aerothermal aerotermico"),
		role: Z("speed toerental toeren velocidad drehzahl rpm fan ventilator ventilador")
	},
	"source.air_unit_outlet_temperature": {
		subject: Z("luchtunit lufteinheit airunit aerothermal aero"),
		role: Z(Q)
	},
	"source.outside_temperature": {
		subject: Z("outside outdoor external buiten exterior aussen ausen"),
		role: Z(Q)
	},
	"unit.on_off": {
		subject: Z(`${fo} heatpump warmtepomp`),
		role: Z(`${fo} power switch schakelaar`)
	},
	"unit.summer": {
		subject: Z("summer zomer verano sommer"),
		role: Z("summer zomer verano sommer mode bedrijf modo betrieb")
	},
	"unit.winter": {
		subject: Z("winter invierno"),
		role: Z("winter invierno mode bedrijf modo betrieb")
	},
	"unit.alarm": {
		subject: Z(po),
		role: Z(po)
	},
	"unit.connection": {
		subject: Z("connection connected connectivity conexion verbinding verbindung online communication"),
		role: Z("connection connected connectivity conexion verbinding verbindung status online communication")
	},
	"unit.cop": {
		subject: Z(xo),
		role: Z(xo),
		exclude: Z(bo)
	},
	"heating.power": {
		subject: Z(co),
		role: Z(ho),
		exclude: Z(_o)
	},
	"dhw.power": {
		subject: Z($a),
		role: Z(ho),
		exclude: Z(vo)
	},
	"htr.active": {
		subject: Z(mo),
		role: Z("active actief activo aktiv")
	},
	"htr.power": {
		subject: Z(mo),
		role: Z(ho),
		exclude: Z(yo)
	},
	"unit.system_cop": {
		subject: Z(bo),
		role: Z(xo)
	}
}, Co = {
	in: Z(`in inlet return retour retorno inflow terug terugvoer terugloop inlaat entrada eintritt ruecklauf rucklauf ingaand eingang ${to}`),
	out: Z(`out outlet supply aanvoer uitlaat salida impulsion austritt vorlauf uitgaand ausgang uit ${no}`)
}, wo = Z(lo), To = /* @__PURE__ */ new Set(["heating.setpoint", "dhw.setpoint"]), Eo = Z("flow"), Do = {
	exact: 100,
	suffix: 90,
	subject: 30,
	role: 20,
	direction: 10,
	strong: 40,
	tie: 5
}, Oo = (e) => e.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replaceAll("ß", "ss"), ko = (e) => Oo(e).split(/[^a-z]+/).filter((e) => e !== ""), Ao = (e) => {
	let t = e.indexOf(".");
	return [e.slice(0, t), e.slice(t + 1)];
};
function jo(e, t, n, r) {
	let i = n[r]?.name_by_user ?? n[r]?.name ?? "";
	return Object.values(t).filter((e) => e?.device_id === r).flatMap((t) => {
		let n = e[t.entity_id];
		if (n === void 0) return [];
		let [r, a] = Ao(t.entity_id), o = n.attributes.friendly_name, s = n.attributes.unit_of_measurement, c = n.attributes.device_class;
		return [{
			entityId: t.entity_id,
			domain: r,
			objectId: a,
			unit: typeof s == "string" ? s : void 0,
			deviceClass: typeof c == "string" ? c : void 0,
			names: [...typeof o == "string" ? [Mo(o, i)] : [], ...typeof t.name == "string" ? [t.name] : []]
		}];
	});
}
function Mo(e, t) {
	let n = Oo(t).trim(), r = Oo(e);
	if (n === "" || !r.startsWith(n)) return e;
	let i = r.slice(n.length);
	return i === "" || /^[^a-z0-9]/.test(i) ? i : e;
}
function No(e) {
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
function Po(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of M) {
		let r = /* @__PURE__ */ new Set();
		for (let t of e) {
			let e = `_${n.suffix}`;
			t.domain === n.domain && t.objectId.length > e.length && t.objectId.endsWith(e) && r.add(t.objectId.slice(0, -e.length));
		}
		for (let e of r) t.set(e, (t.get(e) ?? 0) + 1);
	}
	let [n] = [...t].sort(([e, t], [n, r]) => r - t || n.length - e.length || (e < n ? -1 : 1));
	return n === void 0 ? No(e.map((e) => e.objectId)) : `${n[0]}_`;
}
var Fo = (e) => (e ?? "").trim().toLowerCase(), Io = {
	"compressor.speed": ["rpm", "hz"],
	"production.pump": ["%", "rpm"],
	"brine.pump": ["%", "rpm"],
	"source.fan_speed": ["%", "rpm"]
}, Lo = {
	temperature: ["temperature"],
	difference: ["temperature"],
	power: ["power"],
	pressure: ["pressure", "atmospheric_pressure"]
};
function Ro(e, t) {
	if (St.includes(t.domain)) return !0;
	if (e.kind !== "number") return Fo(t.unit) === "" && (t.deviceClass === void 0 || t.deviceClass === "enum");
	if ("quantity" in e && e.quantity !== void 0) {
		if (!gt(e.quantity, t.unit)) return !1;
		let n = Lo[e.quantity];
		return t.deviceClass === void 0 || n === void 0 || n.includes(t.deviceClass);
	}
	let n = Fo(t.unit), r = Io[e.path] ?? ("unit" in e && e.unit !== void 0 ? [Fo(e.unit)] : []);
	return r.length === 0 ? n === "" : r.includes(n);
}
function zo(e, t) {
	return e.accepts.includes(t.domain) && Ro(e, t);
}
var Bo = (e, t) => e.some((e) => t.some((t) => e.length >= 4 ? t.includes(e) : t === e));
function Vo(e, t, n) {
	if (t.entityId === Dt(e, n.replace(/_$/, "")) && n !== "") return Do.exact;
	if ((e.kind !== "binary" || St.includes(t.domain)) && (t.objectId === e.suffix || t.objectId.endsWith(`_${e.suffix}`))) return Do.suffix;
	let r = [...ko(t.objectId.startsWith(n) ? t.objectId.slice(n.length) : t.objectId), ...t.names.flatMap(ko)];
	if (Bo(wo, r) !== To.has(e.path)) return 0;
	let i = So[e.path];
	if (i.exclude !== void 0 && Bo(i.exclude, r)) return 0;
	let a = 0;
	if (Bo(i.subject, r) && (a += Do.subject), Bo(i.role, r) && (a += Do.role), e.direction !== void 0) {
		if ((e.direction !== "out" || !Bo(Eo, r) || Bo(Co.in, r)) && !Bo(Co[e.direction], r)) return 0;
		a += Do.direction;
	}
	return a;
}
function Ho(e) {
	return typeof e != "object" || !e || Array.isArray(e) ? {} : Object.fromEntries(Object.entries(e).map(([e, t]) => [e, typeof t == "object" && t && !Array.isArray(t) ? Ho(t) : t]));
}
function Uo(e) {
	let { states: t, config: n } = e, r = jo(t, e.entities, e.devices, e.deviceId), i = Po(r), a = lr(n, Rn(n)), o = /* @__PURE__ */ new Set(), s = [];
	for (let e of M) {
		if (Ln(N(n, `entities.${e.path}`))) continue;
		let r = a[e.path];
		r !== void 0 && t[r] !== void 0 ? o.add(r) : s.push(e);
	}
	let c = s.flatMap((e, t) => r.filter((t) => !o.has(t.entityId) && zo(e, t)).map((n) => ({
		role: e,
		order: t,
		candidate: n,
		score: Vo(e, n, i)
	}))).filter((e) => e.score > 0).sort((e, t) => t.score - e.score || e.order - t.order || (e.candidate.entityId < t.candidate.entityId ? -1 : 1)), l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set();
	for (let e of c) {
		let t = e.role.path;
		if (e.score < Do.strong) break;
		if (l.has(t) || u.has(t) || o.has(e.candidate.entityId)) continue;
		let [n, r] = c.filter((t) => t.role === e.role && !o.has(t.candidate.entityId));
		n !== void 0 && r !== void 0 && n.score - r.score <= Do.tie ? u.add(t) : (l.set(t, e.candidate.entityId), o.add(e.candidate.entityId));
	}
	let d = Ho(N(n, "entities"));
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
var Wo = k.roleGroups, Go = k.roles, Ko = {
	"heating.power": k.heatPower,
	"dhw.power": k.heatPower,
	"htr.power": k.heatPower
};
function qo(e) {
	let t = e.split(".")[1] ?? "";
	return Ko[e] ?? Go[t] ?? t;
}
function Jo(e) {
	let [t = ""] = e.split(".");
	return `${Wo[t] ?? t}: ${qo(e)}`;
}
// src/editor/binding-check.ts
function Yo(e, t) {
	if (t === void 0 || Object.keys(t).length === 0) return [];
	let n = Rn(e), r = lr(e, n), i = ur(e, n);
	return M.flatMap((n) => {
		let a = r[n.path];
		if (a === void 0 || Ln(N(e, `entities.${n.path}`))) return [];
		let o = Jo(n.path), s = t[a];
		if (s === void 0) {
			let e = n.path;
			return i.has(e) && Tt.includes(e) ? [] : [k.suggest.unknown(o, a)];
		}
		let c = a.slice(0, a.indexOf("."));
		if (!n.accepts.includes(c)) return [k.suggest.kind(o, a)];
		if (s.state === "unavailable") return [];
		let l = s.attributes.unit_of_measurement, u = s.attributes.device_class;
		return Ro(n, {
			domain: c,
			unit: typeof l == "string" ? l : void 0,
			deviceClass: typeof u == "string" ? u : void 0
		}) ? [] : [k.suggest.unit(o, a)];
	});
}
// src/editor/fields.ts
var Xo = (e, t, { advanced: n = !1 } = {}) => ({
	name: e,
	selector: { entity: { filter: { domain: t } } },
	...n ? { advanced: n } : {}
});
function Zo(e) {
	let t = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(e.trim())?.[1];
	if (t === void 0) return;
	let n = t.length === 3 ? t.replace(/./g, "$&$&") : t, r = (e) => Number.parseInt(n.slice(e, e + 2), 16);
	return [
		r(0),
		r(2),
		r(4)
	];
}
var Qo = (e) => Array.isArray(e) && e.length === 3 && e.every((e) => typeof e == "number" && Number.isFinite(e)), $o = (e) => "#" + e.map((e) => Math.min(255, Math.max(0, Math.round(e))).toString(16).padStart(2, "0")).join(""), es = (e) => ({
	name: e,
	selector: { color_rgb: {} }
}), ts = (e, t, n, r = t.default) => ({
	name: e,
	default: r,
	selector: { select: {
		mode: "dropdown",
		options: t.choices.map((e) => ({
			value: e,
			label: n[e] ?? e
		}))
	} }
}), ns = "#9e9e9e", rs = /^colors_(\d+)_(temperature|color)$/;
function is(e) {
	let t = rs.exec(e);
	return t?.[1] === void 0 ? void 0 : {
		index: Number(t[1]),
		part: t[2]
	};
}
function as(e) {
	let t = N(e, "colors");
	return Array.isArray(t) ? t.map((e) => {
		let { temperature: t, color: n } = typeof e == "object" && e ? e : {};
		return {
			...typeof t == "number" ? { temperature: t } : {},
			...typeof n == "string" ? { color: n } : {}
		};
	}) : on.map((e) => ({ ...e }));
}
var os = Zo("#9e9e9e") ?? [
	158,
	158,
	158
], ss = () => ({ color: os });
function cs(e) {
	let t = [...e];
	for (; t.length >= 2 && t[t.length - 1]?.temperature === void 0 && t[t.length - 2]?.temperature === void 0;) t.pop();
	return t.at(-1)?.temperature === void 0 && t.length > 0 ? t : [...t, ss()];
}
function ls(e) {
	return cs(as(e).map(({ temperature: e, color: t }) => {
		let n = t === void 0 ? void 0 : Zo(t);
		return {
			...e === void 0 ? {} : { temperature: e },
			...n === void 0 ? {} : { color: n },
			...t === void 0 ? {} : { orig: t }
		};
	}));
}
function us(e) {
	return Array.from({ length: e }, (e, t) => t).flatMap((e) => [{
		name: `colors_${String(e)}_temperature`,
		selector: { number: {
			step: "any",
			mode: "box",
			unit_of_measurement: T.celsius
		} }
	}, es(`colors_${String(e)}_color`)]);
}
function ds(e) {
	let t = {};
	return e.forEach(({ temperature: e, color: n }, r) => {
		e !== void 0 && (t[`colors_${String(r)}_temperature`] = e), n !== void 0 && (t[`colors_${String(r)}_color`] = [...n]);
	}), t;
}
function fs(e) {
	let t = /* @__PURE__ */ new Map(), n = {};
	for (let [r, i] of Object.entries(e)) {
		let e = is(r);
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
var ps = (e, t) => e.every((e, n) => e === t[n]);
function ms(e) {
	let t = typeof e == "string" && e.trim() !== "" ? Number(e) : e;
	return typeof t == "number" && Number.isFinite(t) ? t : void 0;
}
function hs(e, t) {
	let n = t === void 0 ? void 0 : Zo(t);
	return Qo(e) ? t !== void 0 && n && ps(n, e) ? t : $o(e) : t !== void 0 && n === void 0 ? t : ns;
}
function gs(e, t) {
	let n = Math.max(e.length, ...[...t.keys()].map((e) => e + 1));
	return cs(Array.from({ length: n }, (n, r) => {
		let i = t.get(r), a = ms(i?.temperature), o = i !== void 0 && Qo(i.color) ? i.color : void 0, s = e[r]?.orig;
		return {
			...a === void 0 ? {} : { temperature: a },
			...o === void 0 ? {} : { color: o },
			...s === void 0 ? {} : { orig: s }
		};
	}));
}
var _s = (e, t) => e.length === t.length && e.every((e, n) => e.temperature === t[n]?.temperature && e.color === t[n]?.color), vs = (e) => e.length === on.length && e.every((e, t) => {
	let n = on[t];
	return e.temperature === n?.temperature && e.color.toLowerCase() === n.color;
});
function ys(e, t) {
	let n = e.flatMap(({ temperature: e, color: t, orig: n }) => e === void 0 ? [] : [{
		temperature: e,
		color: hs(t, n)
	}]).sort((e, t) => e.temperature - t.temperature), r = N(t, "colors");
	return Array.isArray(r) && _s(n, as(t)) ? "keep" : vs(n) ? r !== void 0 && !Array.isArray(r) ? "keep" : void 0 : n;
}
function bs(e, t) {
	return t === void 0 ? Object.fromEntries(Object.entries(e).filter(([e]) => e !== "colors")) : {
		...e,
		colors: t
	};
}
// src/editor/ecogeo-schema.ts
var xs = [
	"features",
	"entities",
	"states"
], Ss = ["entities"], Cs = "_device", ws = "_not_present", Ts = "default", Es = [
	[Ts, void 0],
	["true", !0],
	["false", !1],
	["unused", "unused"]
];
function Ds(e, t) {
	let { on: n, off: r, unused: i, presetOn: a, presetOff: o, presetUnused: s, variantDefault: c } = k.featureChoices;
	return {
		name: e,
		default: Ts,
		coded: Es,
		selector: { select: {
			mode: "dropdown",
			options: [
				{
					value: Ts,
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
var Os = [
	"passive_cooling",
	"active_cooling",
	"htr",
	"backup_heater"
];
function ks() {
	return {
		name: "variant",
		default: "4",
		coded: vn.map((e) => [String(e), e]),
		selector: { select: {
			mode: "dropdown",
			options: vn.map((e) => ({
				value: String(e),
				label: k.choices.variant[e]
			}))
		} }
	};
}
var As = (e) => Cn.filter((t) => t === "unused" || t === Nn(e) || t === "none" && e === "B");
function js(e, t) {
	let n = N(e, "dhw"), r = As(t), i = Cn.filter((e) => r.includes(e) || e === n);
	return ts("dhw", {
		...Dn,
		choices: i
	}, k.choices.dhw, Nn(t));
}
function Ms(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of M) {
		if (Ln(N(e, `entities.${n.path}`))) continue;
		let [r = "", i = ""] = n.path.split(".");
		t.set(r, [...t.get(r) ?? [], {
			...Xo(i, n.accepts, { advanced: !0 }),
			label: qo(n.path)
		}]);
	}
	return {
		type: "expandable",
		name: "entities",
		schema: [...t].map(([e, t]) => ({
			type: "expandable",
			name: e,
			title: k.roleGroups[e],
			schema: t
		}))
	};
}
var Ns = () => ({
	name: ws,
	advanced: !0,
	selector: { select: {
		multiple: !0,
		mode: "dropdown",
		options: M.map((e) => ({
			value: e.path,
			label: Jo(e.path)
		}))
	} }
}), Ps = {
	off: "unit.on_off",
	defrost: "compressor.mode"
};
function Fs(e, t) {
	let n = lr(e, Rn(e)), r = (e) => {
		let r = n[Ps[e]], i = r === void 0 ? void 0 : t?.[r]?.attributes.options;
		return Array.isArray(i) ? i.filter((e) => typeof e == "string") : [];
	};
	return {
		off: r("off"),
		defrost: r("defrost")
	};
}
function Is(e) {
	let t = (t) => ({
		name: t,
		advanced: !0,
		default: [...rt[t]],
		selector: { select: {
			multiple: !0,
			custom_value: !0,
			mode: "dropdown",
			options: [.../* @__PURE__ */ new Set([...e[t], ...rt[t]])]
		} }
	});
	return {
		type: "expandable",
		name: "states",
		schema: [t("off"), t("defrost")]
	};
}
function Ls(e, t = ls(e).length, n) {
	let r = yn(zn(e)), i = N(e, "model") === xn[1] ? xn[1] : xn[0];
	return [
		{
			type: "expandable",
			name: "unit",
			flatten: !0,
			schema: [
				ts("model", Tn, k.choices.model),
				ks(),
				ts("source", En, k.choices.source),
				js(e, i)
			]
		},
		{
			type: "expandable",
			name: "entity_prefix",
			flatten: !0,
			schema: [{
				name: Cs,
				selector: { device: {} }
			}, {
				name: "prefix",
				selector: { text: {} }
			}]
		},
		{
			type: "expandable",
			name: "features",
			schema: Os.map((e) => Ds(e, r[e]))
		},
		{
			type: "expandable",
			name: "appearance",
			flatten: !0,
			schema: [
				ts("detail", On, k.choices.detail),
				ts("exchanger_fill", kn, k.choices.exchanger_fill),
				ts("layout", An, k.choices.layout),
				...us(t)
			]
		},
		Ms(e),
		Ns(),
		Is(Fs(e, n))
	];
}
// src/editor/schema.ts
function Rs(e) {
	return "type" in e;
}
function zs(e) {
	let { advanced: t, ...n } = e;
	return n;
}
function Bs(e, t) {
	return e.flatMap((e) => {
		if (!Rs(e)) return t || e.advanced !== !0 ? [zs(e)] : [];
		let n = Bs(e.schema, t);
		return n.length > 0 ? [{
			...e,
			schema: n
		}] : [];
	});
}
function $(e, t = "") {
	return e.flatMap((e) => Rs(e) ? $(e.schema, e.flatten ? t : `${t}${e.name}.`) : [{
		field: e,
		path: `${t}${e.name}`
	}]);
}
function Vs(e, t) {
	return Bs(e, t);
}
function Hs(e, t) {
	if (e == null || e === "") return !1;
	if (t.default === void 0) return !0;
	if (typeof t.default == "number") {
		let n = typeof e == "number" ? e : typeof e == "string" ? st(e) : void 0;
		if (n !== void 0) return n !== t.default;
	}
	return Us(e) !== Us(t.default);
}
function Us(e) {
	return (typeof e == "string" || typeof e == "number" || typeof e == "boolean" ? String(e) : JSON.stringify(e)).toLowerCase();
}
function Ws(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function Gs(e, t, n, r, i = "") {
	let [a, ...o] = t.split("."), s = e, { [a]: c, ...l } = s;
	if (o.length === 0) return n === void 0 ? l : Object.hasOwn(s, a) ? {
		...s,
		[a]: n
	} : {
		...l,
		[a]: n
	};
	let u = Gs(Ws(c) ? c : {}, o.join("."), n, r, `${i}${a}.`), d = r !== void 0 && N(r, `${i}${a}`) !== void 0;
	return n === void 0 && Object.keys(u).length === 0 && !d ? l : {
		...s,
		[a]: u
	};
}
function Ks(e, t, n = /* @__PURE__ */ new Set()) {
	return $(e).reduce((e, { field: r, path: i }) => r.default !== void 0 && N(t, i) === void 0 && !n.has(i) ? Gs(e, i, r.default) : e, t);
}
function qs(e, t, n) {
	return $(e).map(({ path: e }) => e).filter((e) => N(t, e) !== void 0 && N(n, e) === void 0);
}
function Js(e) {
	if (!Ws(e)) return e;
	let t = Object.entries(e).filter(([, e]) => e !== void 0).map(([e, t]) => [e, Js(t)]);
	return t.length !== Object.keys(e).length || t.some(([t, n]) => n !== e[t]) ? Object.fromEntries(t) : e;
}
function Ys(e, t) {
	return $(e).reduce((e, { field: n, path: r }) => ("text" in n.selector || "entity" in n.selector) && N(e, r) === "" ? Gs(e, r, void 0, t) : e, t);
}
function Xs(e, t) {
	return $(e).reduce((e, { field: t, path: n }) => {
		let r = N(e, n), i = t.coded?.find(([, e]) => e !== void 0 && e === r);
		return i === void 0 ? e : Gs(e, n, i[0]);
	}, t);
}
function Zs(e, t, n) {
	return $(e).reduce((e, { field: t, path: r }) => {
		let i = N(e, r), a = t.coded?.find(([e]) => e === i);
		return a === void 0 ? e : Gs(e, r, a[1], n);
	}, t);
}
function Qs(e, t, n, r = []) {
	let i = (e) => Ws(e) && Object.keys(e).length === 0;
	return Object.fromEntries(Object.entries(e).flatMap(([e, a]) => {
		if (!n.includes(e) || !Ws(a)) return [[e, a]];
		let o = t[e], s = r.includes(e) ? Object.fromEntries(Object.entries(a).filter(([e, t]) => !i(t) || Ws(o) && i(o[e]))) : a;
		return Object.keys(s).length > 0 || i(o) ? [[e, s]] : [];
	}));
}
function $s(e, t, n) {
	return $(e).reduce((e, { field: n, path: r }) => n.default !== void 0 && N(t, r) === void 0 && N(e, r) !== void 0 && !Hs(N(e, r), n) ? Gs(e, r, void 0, t) : e, n);
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/decorate.js
function ec(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/editor/ecogeo-card-editor.ts
var tc = "ecogeo-card-editor", nc = [{
	name: "advanced",
	selector: { boolean: {} }
}], rc = () => k.advanced, ic = k.sections, ac = k.fields, oc = k.roles;
function sc(e) {
	if (Rs(e)) return e.title ?? ic[e.name] ?? e.name;
	let t = is(e.name);
	return t === void 0 ? e.label === void 0 ? ac[e.name] ?? oc[e.name] ?? e.name : e.label : k.colorRow[t.part](t.index + 1);
}
var cc = (e) => Object.hasOwn(e, "entities") || Object.hasOwn(e, "states"), lc = (e) => Object.hasOwn(e, "entities"), uc = [Cs, ws];
function dc(e, t) {
	let n = e.states;
	if (typeof n != "object" || !n || Array.isArray(n)) return e;
	let r = (e, t) => Array.isArray(e) && Array.isArray(t) && e.length === t.length && e.every((e, n) => String(e).trim().toLowerCase() === String(t[n]).trim().toLowerCase()), i = Object.entries(n).filter(([e, n]) => {
		if (!Array.isArray(n)) return !0;
		if (n.length === 0) return !1;
		let i = e === "off" || e === "defrost" ? rt[e] : void 0, a = JSON.stringify(n) === JSON.stringify(N(t, `states.${e}`));
		return i === void 0 || !r(n, i) || a;
	});
	return {
		...e,
		states: Object.fromEntries(i)
	};
}
function fc(e, t, n) {
	let r = e;
	for (let e of Yn(n)) t.has(e) || (r = Gs(r, `entities.${e}`, void 0, n));
	for (let e of t) r = Gs(r, `entities.${e}`, "none", n);
	return r;
}
var pc = class extends He {
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
		super(), this.schemaFor = Ls, this._switch = { advanced: !1 }, this._optionsKey = "", this._formDefined = customElements.get("ha-form") !== void 0, this._schema = [], this._formSchema = [], this._shown = {}, this._draft = [], this._draftBuilt = !1, this._emptied = /* @__PURE__ */ new Set(), this._toggleAdvanced = (e) => {
			e.stopPropagation(), this._switch = { advanced: e.detail.value.advanced === !0 };
		}, this._configChanged = (e) => {
			e.stopPropagation();
			let t = this._config ?? {}, { [Cs]: n, [ws]: r, ...i } = e.detail.value, a = this._has(Cs), o = typeof n == "string" && n !== "" ? n : void 0;
			if (a && o !== this._device) {
				this._device = o, this._report = void 0;
				return;
			}
			this._report = void 0;
			let s = this._has(ws), c = a || s ? i : e.detail.value, l = this._hasColorRows, u = l ? fs(c) : void 0, d = Js(Ys(this._schema, u?.rest ?? c)), f = l ? fs(this._shown).rest : this._shown, p = (e) => {
				let t = N(d, e);
				return e.startsWith("states.") && Array.isArray(t) && t.length === 0;
			}, m = [...qs(this._schema, f, d), ...$(this._schema).map(({ path: e }) => e).filter((e) => p(e) && N(f, e) !== void 0)].filter((e) => !uc.includes(e));
			this._emptied = new Set([...this._emptied, ...m].filter((e) => N(d, e) === void 0 || p(e)));
			let h = Zs(this._schema, d, t), g = s && (Array.isArray(r) || Object.hasOwn(e.detail.value, "_not_present")) ? fc(h, new Set(Array.isArray(r) ? r.filter((e) => typeof e == "string") : []), t) : h, _ = Qs(dc($s(this._schema, t, g), t), t, xs, Ss);
			u && (this._draft = gs(this._draft, u.rows));
			let v = u ? ys(this._draft, t) : "keep", y = v === "keep" ? _ : bs(_, v);
			this._colorsSeen = y.colors, this._config = y, this._refreshSchema(y), this.dispatchEvent(new CustomEvent("config-changed", {
				detail: { config: y },
				bubbles: !0,
				composed: !0
			}));
		}, this._suggest = () => {
			let e = this._pickDevice(), t = this.hass;
			if (e === void 0 || t === void 0 || this._config === void 0) return;
			let n = this._config, { entities: r, report: i } = Uo({
				states: t.states,
				entities: t.entities ?? {},
				devices: t.devices ?? {},
				deviceId: e,
				config: n
			});
			this._switch = { advanced: !0 }, this._report = {
				filled: i.filled.length,
				empty: i.empty.map(Jo)
			};
			let a = Object.keys(r).length === 0 && !lc(n) ? n : {
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
		let n = this._config !== void 0 && cc(this._config);
		cc(e) && !n && !this._switch.advanced && (this._switch = { advanced: !0 }), this._draftBuilt && JSON.stringify(e.colors) === JSON.stringify(this._colorsSeen) || (this._draft = ls(e), this._colorsSeen = e.colors, this._draftBuilt = !0), this._config = e, this._refreshSchema(e);
	}
	_refreshSchema(e) {
		let t = this.schemaFor(e, this._draft.length, this.hass?.states);
		this._optionsKey = JSON.stringify(Fs(e, this.hass?.states)), JSON.stringify(t) !== JSON.stringify(this._schema) && (this._schema = t, this._formSchema = Vs(t, this._switch.advanced));
	}
	willUpdate(e) {
		(e.has("schemaFor") && this._config || e.has("hass") && this._config && JSON.stringify(Fs(this._config, this.hass?.states)) !== this._optionsKey) && this._refreshSchema(this._config), e.has("_switch") && (this._formSchema = Vs(this._schema, this._switch.advanced)), this._config && (e.has("_config") || e.has("schemaFor") || e.has("_device")) && (this._shown = {
			...Xs(this._schema, Ks(this._schema, this._config, this._emptied)),
			...this._hasColorRows ? ds(this._draft) : {},
			...this._has("_device") && this._device !== void 0 ? { [Cs]: this._device } : {},
			...this._has("_not_present") ? { [ws]: [...Yn(this._config)] } : {}
		});
	}
	_has(e) {
		return $(this._schema).some(({ path: t }) => t === e);
	}
	get _hasColorRows() {
		return $(this._schema).some(({ path: e }) => is(e) !== void 0);
	}
	_pickDevice() {
		return this.hass === void 0 ? void 0 : this._device;
	}
	_renderNotes() {
		let e = this._config ? Yo(this._config, this.hass?.states) : [];
		return x`
      ${this._has("_device") ? x`<button
              type="button"
              class="suggest"
              ?disabled=${this._pickDevice() === void 0}
              @click=${this._suggest}
            >
              ${k.suggest.button}
            </button>` : C}
      ${this._report ? x`<ul class="report" role="status">
              <li>${k.suggest.filled(this._report.filled)}</li>
              ${this._report.empty.length > 0 ? x`<li>${k.suggest.empty(this._report.empty)}</li>` : C}
            </ul>` : C}
      ${e.length > 0 ? x`<p class="title">${k.suggest.warningsTitle}</p>
              <ul class="warnings">
                ${e.map((e) => x`<li>${e}</li>`)}
              </ul>` : C}
    `;
	}
	render() {
		if (!this._config) return C;
		let e = rr(this._config);
		return x`
      ${e.length > 0 ? x`<p class="error" role="alert">${e.join("; ")}</p>` : C}
      ${this._formDefined ? x`<ha-form
                class="switch"
                .hass=${this.hass}
                .data=${this._switch}
                .schema=${nc}
                .computeLabel=${rc}
                @value-changed=${this._toggleAdvanced}
              ></ha-form>
              <ha-form
                .hass=${this.hass}
                .data=${this._shown}
                .schema=${this._formSchema}
                .computeLabel=${sc}
                @value-changed=${this._configChanged}
              ></ha-form>
              ${this._renderNotes()}` : x`<p class="hint">${k.noForm}</p>`}
    `;
	}
};
ec([Ga({ attribute: !1 })], pc.prototype, "hass", void 0), ec([Ga({ attribute: !1 })], pc.prototype, "schemaFor", void 0), ec([Ka()], pc.prototype, "_config", void 0), ec([Ka()], pc.prototype, "_switch", void 0), ec([Ka()], pc.prototype, "_device", void 0), ec([Ka()], pc.prototype, "_report", void 0), ec([Ka()], pc.prototype, "_formDefined", void 0), qa(tc, pc);
// src/diagram/source.ts
var mc = o`
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
    ${br}
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
`, hc = (e) => Math.round(e * 100) / 100, gc = 3, _c = (e) => e === !0 ? gc : e === void 0 || e === !1 || !(e > 0) ? void 0 : Math.min(6, Math.max(.5, 120 / e)), vc = [
	0,
	72,
	144,
	216,
	288
].map((e) => S`<path class="fan-blade" d="M0 -4 C9 -6 21 -16 17 -30 C6 -26 -3 -17 -3 -6 Z" transform="rotate(${e})" />`);
function yc(e, t, n, r, i, a) {
	let { x: o, y: s, width: c, height: l, fanX: u, fanY: d, fanRadius: f, coil: p, fins: m, slats: h, dividerY: g } = e, _ = _c(t), v = Array.from({ length: m.count }, (e, t) => hc(m.x + t * m.step)), y = Array.from({ length: h.count }, (e, t) => hc(h.y0 + t * h.step)), [ee, te] = [hc(o + 6), hc(u + f + 6)], ne = hc(u - f - 6 - ee), re = hc(a ?? 1), ie = yr(vr(gr, r), r?.onTap);
	return S`<g class="air-unit${n ? " muted" : ""}" data-source="air">
    <rect class="source-outline" x=${o} y=${s} width=${c} height=${l} rx="6" />
    <path class="source-divider" d="M${o} ${g} H${hc(o + c)}" />
    ${y.map((e) => S`<path class="source-slat" data-slat d="M${ee} ${e} h${ne} M${te} ${e} h${ne}" />`)}
    <rect class="source-frame" data-coil-block x=${p.x} y=${p.y} width=${p.width} height=${p.height} rx="3" />
    ${v.map((e) => S`<path class="source-fin" d="M${e} ${m.y0} V${m.y1}" />`)}
    <g class="fan-part" aria-label=${nt} role=${ie.role} tabindex=${ie.tabindex} @click=${ie.click} @keydown=${ie.keydown}>
      <title>${nt}</title>
      <circle class="fan-ring" cx=${u} cy=${d} r=${f} />
      <circle class="fan-hit" cx=${u} cy=${d} r=${f} fill="transparent" stroke="none" />
      <g class="fan" data-fan transform="translate(${u} ${d})${re === 1 ? "" : ` scale(${String(re)})`}">
        <g class=${_ === void 0 ? "fan-rotor still" : "fan-rotor"} style=${_ === void 0 ? "" : `--fan-duration: ${String(_)}s`}>${vc}<circle class="fan-hub" r="5" fill="var(--primary-text-color)" /></g>
      </g>
    </g>
    ${i ? S`<text class="source-caption" x=${e.captionX} y=${e.captionY} text-anchor="middle">${Xe.air}</text>` : C}
  </g>`;
}
function bc(e, t) {
	return _i(e).flatMap(({ part: e }) => e.id.startsWith("src_") ? e.points.slice(1).flatMap((n, r) => {
		let i = e.points[r];
		return i?.[0] === n[0] && t >= Math.min(i[1], n[1]) && t <= Math.max(i[1], n[1]) ? [n[0]] : [];
	}) : []);
}
function xc(e, t, n, r) {
	let { groundLineX: i, groundCaption: a } = ui(e), o = bc(e, n), s = Array.from({ length: Math.floor((i.end - i.start - 12) / 10) + 1 }, (e, t) => i.start + 6 + t * 10).filter((e) => !o.some((t) => Math.abs(t - e) < 10)), c = a.y[t];
	return S`<g class="ground-loop${r ? " muted" : ""}" data-source="ground">
    <path class="source-ground" d="M${i.start} ${n} H${i.end}" />
    ${s.map((e) => S`<path class="source-ground" d="M${e} ${n} l-6 8" />`)}
    ${e.captions === !1 ? C : S`<text class="source-caption" x=${a.x} y=${c} text-anchor="middle">${Xe.ground}</text>`}
  </g>`;
}
function Sc(e, t, n, r) {
	let { airUnit: i, groundLineY: a, scale: o } = ui(e), s = e.source === "air" || e.source === "hybrid", c = e.source === "ground" || e.source === "hybrid", l = e.source === "hybrid" ? "hybrid" : "ground";
	return S`<g class="source" data-source-kind=${e.source}>
    ${s ? yc(i, t["source.fan_speed"], !n, r, e.captions !== !1, o) : S``}
    ${c ? xc(e, l, a[l], !n) : S``}
  </g>`;
}
// src/lib/version.ts
var Cc = "1.0.0";
// src/lib/render.ts
function wc(e, t) {
	return e === t || Array.isArray(e) && Array.isArray(t) && e.length === t.length && e.every((e, n) => e === t[n]);
}
function Tc(e, t) {
	if (e === t) return !0;
	if (typeof e != "object" || typeof t != "object" || e === null || t === null) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	return n.length === r.length && n.every((n) => Object.hasOwn(t, n) && wc(e[n], t[n]));
}
function Ec(e, t, n) {
	return e === void 0 || e.locale !== t.locale || e.language !== t.language || e.localize !== t.localize || e.formatEntityState !== t.formatEntityState || e.themes?.darkMode !== t.themes?.darkMode || n.some((n) => e.states[n] !== t.states[n] || !Tc(e.entities?.[n], t.entities?.[n]));
}
function Dc(e, t, n, r) {
	return e.size === 1 && e.has("hass") ? t !== void 0 && Ec(n, t, r) : !0;
}
// src/suggest/stub.ts
function Oc(e, t, n) {
	let r = jo(e.states, t, e.devices ?? {}, n), i = Po(r).replace(/_$/, "");
	if (i === "") return;
	let a = new Set(r.map((e) => e.entityId));
	return M.filter((e) => a.has(Dt(e, i))).length * 2 >= M.length ? i : void 0;
}
function kc(e) {
	if (e === void 0) return {};
	let t = /* @__PURE__ */ new Map();
	for (let n of Object.values(e.entities ?? {})) {
		if (typeof n.device_id != "string") continue;
		let e = t.get(n.device_id) ?? {};
		e[n.entity_id] = n, t.set(n.device_id, e);
	}
	let n = [...t].flatMap(([t, n]) => Oc(e, n, t) ?? []);
	return n.length === 1 ? { prefix: n[0] } : {};
}
// src/card/ecogeo-card.ts
var Ac = "ecogeo-card", jc = 0;
qa("ecogeo-card", class extends He {
	static {
		this.version = Cc;
	}
	static {
		this.styles = [
			ua,
			mc,
			ba,
			Pa,
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
		return document.createElement(tc);
	}
	static getStubConfig(e) {
		return kc(e);
	}
	constructor() {
		super(), this.renderedCompact = !1, this.renderedAutoCompact = !1, this.renderedStroke = Li(void 0), this.renderedDrawing = 0, this.entityIds = [], this.idPrefix = `ecogeo${String(++jc)}`, this.onWindowResize = () => {
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
		return Ri({
			isPanel: this.inPanel,
			cardWidth: this.width,
			windowHeight: window.innerHeight,
			headerHeight: this.inPanel ? this.cssPx("--header-height") : void 0,
			safeAreaTop: this.inPanel ? this.cssPx("--safe-area-inset-top") : void 0,
			viewBox: e
		});
	}
	layoutWidth() {
		return this.drawingWidthFor(li(this.resolved?.detail ?? "simplified", "full").viewBox);
	}
	get shownLayout() {
		return Mi(this.resolved?.layout ?? "auto", this.layoutWidth(), this.renderedAutoCompact, this.resolved?.detail ?? "simplified") ? "compact" : "full";
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
		this.resolved = fr(e), this.entityIds = [...new Set(Object.values(this.resolved.entities).filter((e) => e !== void 0))], this.config = e;
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
			let e = this.shownLayout, t = Li(this.drawingWidthFor(this.arrangementViewBox(e)));
			return e === "compact" !== this.renderedCompact || this.fittedWidth(e) !== this.renderedDrawing || t.pipe !== this.renderedStroke.pipe || t.outline !== this.renderedStroke.outline;
		}
		return Dc(e, this.hass, this.renderedHass, this.entityIds);
	}
	arrangementViewBox(e) {
		return li(e === "compact" ? "simplified" : this.resolved?.detail ?? "simplified", e).viewBox;
	}
	fittedWidth(e) {
		if (!this.inPanel || !(this.width > 0)) return 0;
		let t = this.drawingWidthFor(this.arrangementViewBox(e));
		return t < this.width ? t : 0;
	}
	readings(e) {
		let t = e.sample ? cr : this.hass?.states ?? {};
		return {
			readings: jt(t, e.entities),
			absent: Mt(t, e.entities, e.defaulted),
			offline: zt(ut(t, e.entities["unit.connection"]))
		};
	}
	render() {
		this.renderedHass = this.hass;
		let e = this.shownLayout, t = e === "compact";
		this.renderedCompact = t, this.renderedAutoCompact = t && this.resolved?.layout === "auto";
		let n = Li(this.drawingWidthFor(this.arrangementViewBox(e)));
		this.renderedStroke = n;
		let r = this.fittedWidth(e);
		this.renderedDrawing = r;
		let i = this.resolved;
		if (i === void 0) return x`<ha-card data-layout=${e}><div class="diagram"></div></ha-card>`;
		let a = t ? "simplified" : i.detail, o = li(a, e), { viewBox: s } = o, c = t ? {
			...i,
			detail: a,
			captions: !1,
			arrangement: o
		} : {
			...i,
			arrangement: o
		}, { readings: l, absent: u, offline: d } = this.readings(c), f = Rt(l, c.features, c.states), p = Vt(f, c.features, c.dhw, l, !c.notPresent.has("brine.pump"), !u.has("htr.active")), m = c.sample ? cr : this.hass?.states ?? {}, h = Pt(l, c.entities, m), g = {
			mode: f,
			circuits: p,
			readings: h,
			stops: c.colors
		}, _ = {
			locale: Ca(this.hass),
			entities: this.hass?.entities,
			states: m
		}, v = c.sample ? void 0 : (e) => {
			dt(this, e);
		}, y = {
			entities: c.entities,
			onTap: v
		};
		return x`<ha-card data-layout=${e}>
      <div class="diagram" style=${r > 0 ? `max-width: ${String(r)}px; margin: 0 auto` : C}>
        <svg
          viewBox="0 0 ${s.width} ${s.height}"
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label=${Ge}
          style="--dhw-tank-color: ${c.dhw === "unused" ? sn : Qi(g)}; --ecogeo-coil-muted: ${un(this.hass?.themes?.darkMode === !0)}; --pipe-width: ${String(n.pipe)}; --outline-width: ${String(n.outline)}"
        >
          ${S`${Sc(c, h, p.active.has("brine"), y)}${xa(c, y)}${ya(c, g, y, {
			mode: c.exchangerFill,
			idPrefix: this.idPrefix
		}, n.pipe)}`}
        </svg>
        ${Va(Ia(c, l, c.entities, _, t, c.notPresent), v, s)}
      </div>
      <div class="footer">
        <span class="mode">${qe[f]}</span>
        ${Ha(Ra(l, c.entities, _, {
			mode: f,
			features: c.features,
			dhw: c.dhw,
			notPresent: c.notPresent,
			absent: u
		}, t), v)}
        ${Bt(l["unit.alarm"]) ? x`<span class="alarm">${Je.alarm}</span>` : C}
        ${d ? x`<span class="offline">${Je.offline}</span>` : C}
        ${c.sample ? x`<span class="sample">${Je.sampleValues}</span>` : C}
      </div>
    </ha-card>`;
	}
}) && console.info(`ecogeo-card ${Cc}`);
// src/index.ts
var Mc = {
	type: Ac,
	...We,
	preview: !0
};
function Nc(e = window) {
	let t = e.customCards ??= [];
	t.some((e) => e.type === Mc.type) || t.push({ ...Mc });
}
Nc();
export { Mc as CARD_ENTRY, Nc as registerCardPicker };
