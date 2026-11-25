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
var ie = globalThis, ae = (e) => e, oe = ie.trustedTypes, se = oe ? oe.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, ce = "$lit$", le = `lit$${Math.random().toFixed(9).slice(2)}$`, ue = "?" + le, de = `<${ue}>`, fe = document, pe = () => fe.createComment(""), me = (e) => e === null || typeof e != "object" && typeof e != "function", he = Array.isArray, ge = (e) => he(e) || typeof e?.[Symbol.iterator] == "function", _e = "[ 	\n\f\r]", ve = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ye = /-->/g, be = />/g, xe = RegExp(`>|${_e}(?:([^\\s"'>=/]+)(${_e}*=${_e}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), Se = /'/g, Ce = /"/g, we = /^(?:script|style|textarea|title)$/i, Te = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), b = Te(1), x = Te(2), Ee = Symbol.for("lit-noChange"), S = Symbol.for("lit-nothing"), De = /* @__PURE__ */ new WeakMap(), Oe = fe.createTreeWalker(fe, 129);
function ke(e, t) {
	if (!he(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return se === void 0 ? t : se.createHTML(t);
}
var Ae = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = ve;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === ve ? c[1] === "!--" ? o = ye : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = xe) : (we.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = xe) : o = be : o === xe ? c[0] === ">" ? (o = i ?? ve, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? xe : c[3] === "\"" ? Ce : Se) : o === Ce || o === Se ? o = xe : o === ye || o === be ? o = ve : (o = xe, i = void 0);
		let d = o === xe && e[t + 1].startsWith("/>") ? " " : "";
		a += o === ve ? n + de : l >= 0 ? (r.push(s), n.slice(0, l) + ce + n.slice(l) + le + d) : n + le + (l === -2 ? t : d);
	}
	return [ke(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, je = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = Ae(t, n);
		if (this.el = e.createElement(l, r), Oe.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = Oe.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(ce)) {
					let t = u[o++], n = i.getAttribute(e).split(le), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Ie : r[1] === "?" ? Le : r[1] === "@" ? Re : Fe
					}), i.removeAttribute(e);
				} else e.startsWith(le) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (we.test(i.tagName)) {
					let e = i.textContent.split(le), t = e.length - 1;
					if (t > 0) {
						i.textContent = oe ? oe.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], pe()), Oe.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], pe());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === ue) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(le, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += le.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = fe.createElement("template");
		return n.innerHTML = e, n;
	}
};
function Me(e, t, n = e, r) {
	if (t === Ee) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = me(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = Me(e, i._$AS(e, t.values), i, r)), t;
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? fe).importNode(t, !0);
		Oe.currentNode = r;
		let i = Oe.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Pe(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new ze(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = Oe.nextNode(), a++);
		}
		return Oe.currentNode = fe, r;
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
		e = Me(this, e, t), me(e) ? e === S || e == null || e === "" ? (this._$AH !== S && this._$AR(), this._$AH = S) : e !== this._$AH && e !== Ee && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ge(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== S && me(this._$AH) ? this._$AA.nextSibling.data = e : this.T(fe.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = je.createElement(ke(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Ne(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = De.get(e.strings);
		return t === void 0 && De.set(e.strings, t = new je(e)), t;
	}
	k(t) {
		he(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(pe()), this.O(pe()), this, this.options)) : r = n[i], r._$AI(a), i++;
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
}, Fe = class {
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
		if (i === void 0) e = Me(this, e, t, 0), a = !me(e) || e !== this._$AH && e !== Ee, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = Me(this, r[n + o], t, o), s === Ee && (s = this._$AH[o]), a ||= !me(s) || s !== this._$AH[o], s === S ? e = S : e !== S && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === S ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Ie = class extends Fe {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === S ? void 0 : e;
	}
}, Le = class extends Fe {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== S);
	}
}, Re = class extends Fe {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = Me(this, e, t, 0) ?? S) === Ee) return;
		let n = this._$AH, r = e === S && n !== S || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== S && (n === S || r);
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
		Me(this, e);
	}
}, Be = ie.litHtmlPolyfillSupport;
Be?.(je, Pe), (ie.litHtmlVersions ??= []).push("3.3.3");
var Ve = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Pe(t.insertBefore(pe(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, He = globalThis, Ue = class extends re {
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
		return Ee;
	}
};
Ue._$litElement$ = !0, Ue.finalized = !0, He.litElementHydrateSupport?.({ LitElement: Ue });
var We = He.litElementPolyfillSupport;
We?.({ LitElement: Ue }), (He.litElementVersions ??= []).push("4.2.2");
// src/strings.ts
var C = {
	invalid: (e, t) => `Invalid option ${e}: expected ${t}`,
	number: (e, t) => `a number from ${e} to ${t}`,
	color: "a CSS colour such as #db4437 or rgb(219, 68, 55)",
	boolean: "true or false",
	object: "a group of options",
	choice: (e) => `one of ${e.join(", ")}`,
	list: "a list of texts"
}, Ge = {
	name: "ecoGEO Schematic",
	description: "The internal schematic of an Ecoforest ecoGEO heat pump, with live values and pipes coloured by temperature.",
	documentationURL: "https://github.com/peeter123/ha-ecogeo-card#readme"
}, Ke = "ecoGEO heat pump schematic", w = {
	celsius: "°C",
	kelvin: "K",
	bar: "bar",
	percent: "%",
	rpm: "rpm",
	watt: "W"
}, qe = {
	off: ["OFF"],
	defrost: ["Defrost"]
}, Je = {
	off: "Off",
	defrost: "Defrost",
	dhw: "DHW",
	active_cooling: "Active cooling",
	heating: "Heating",
	passive_cooling: "Passive cooling",
	standby: "Standby"
}, Ye = {
	alarm: "Alarm",
	offline: "Offline",
	sampleValues: "Sample values"
}, T = {
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
}, Xe = { externalTank: "DHW tank" }, Ze = {
	underfloor: "Underfloor heating",
	radiator: "Radiator"
}, Qe = {
	portIn: "In",
	portOut: "Out"
}, $e = {
	outside: "Outside",
	cop: "COP",
	eer: "EER",
	dg1: "DG1",
	dhw: "DHW",
	cooling: "Cooling",
	htr: "HTR"
}, et = {
	on: "On",
	off: "Off",
	emergency: "Emergency"
}, tt = {
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
}, nt = (e) => {
	let t = tt[e];
	return t === void 0 ? "" : `${t} (${String(e)})`;
}, rt = "Air unit fan", it = "Air unit", at = "Ground collector", E = {
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
}, ot = qe, st = /* @__PURE__ */ new Set(["unknown", "unavailable"]), ct = -999, lt = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;
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
], O = w.celsius, k = [
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
		unit: w.bar,
		decimals: 1,
		item: "38",
		accepts: D
	},
	{
		path: "production.pump",
		domain: "sensor",
		suffix: "production_pump",
		kind: "number",
		unit: w.percent,
		decimals: 0,
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
		unit: w.bar,
		decimals: 1,
		item: "37",
		accepts: D
	},
	{
		path: "brine.pump",
		domain: "sensor",
		suffix: "brine_pump",
		kind: "number",
		unit: w.percent,
		decimals: 0,
		item: "16",
		onOff: !0,
		accepts: St
	},
	{
		path: "compressor.speed",
		domain: "sensor",
		suffix: "compressor_rpm",
		kind: "number",
		unit: w.rpm,
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
		unit: w.percent,
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
		unit: w.watt,
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
		unit: w.bar,
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
		unit: w.bar,
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
		unit: w.kelvin,
		decimals: 1,
		item: "12",
		accepts: D
	},
	{
		path: "refrigerant.expansion_valve",
		domain: "sensor",
		suffix: "expansion_valve_position",
		kind: "number",
		unit: w.percent,
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
		unit: w.watt,
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
		unit: w.watt,
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
		path: "heating.power",
		domain: "sensor",
		suffix: "heating_power_dg1",
		kind: "number",
		quantity: "power",
		unit: w.watt,
		decimals: 0,
		item: "1/2",
		optional: !0,
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
		unit: w.kelvin,
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
		path: "dhw.power",
		domain: "sensor",
		suffix: "heating_power_dhw",
		kind: "number",
		quantity: "power",
		unit: w.watt,
		decimals: 0,
		item: "26",
		optional: !0,
		accepts: D
	},
	{
		path: "htr.active",
		domain: "binary_sensor",
		suffix: "htr_active",
		kind: "binary",
		item: "9",
		optional: !0,
		accepts: Ct
	},
	{
		path: "htr.power",
		domain: "sensor",
		suffix: "heating_power_htr",
		kind: "number",
		quantity: "power",
		unit: w.watt,
		decimals: 0,
		item: "9",
		optional: !0,
		accepts: D
	},
	{
		path: "source.fan_speed",
		domain: "sensor",
		suffix: "aerothermal_fan_speed",
		kind: "number",
		unit: w.percent,
		decimals: 0,
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
		item: "air unit, footer",
		accepts: D
	},
	{
		path: "unit.on_off",
		domain: "sensor",
		suffix: "heatpump_on_off",
		kind: "text",
		item: "mode (not shown)",
		onOff: !0,
		accepts: wt
	},
	{
		path: "unit.summer",
		domain: "binary_sensor",
		suffix: "summer",
		kind: "binary",
		item: "mode (not shown)",
		accepts: Ct
	},
	{
		path: "unit.winter",
		domain: "binary_sensor",
		suffix: "winter",
		kind: "binary",
		item: "mode (not shown)",
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
	},
	{
		path: "unit.system_cop",
		domain: "sensor",
		suffix: "system_cop_display",
		kind: "number",
		decimals: 1,
		item: "footer",
		optional: !0,
		accepts: D
	}
], Tt = [
	"binary_sensor",
	"switch",
	"input_boolean"
], Et = (e) => e !== void 0 && Tt.includes(e.split(".")[0] ?? ""), Dt = new Map(k.map((e) => [e.path, e])), Ot = k.filter((e) => "optional" in e).map((e) => e.path), kt = k.map((e) => e.path);
[...new Set(k.flatMap((e) => "unit" in e ? [e.unit] : []))];
var At = (e, t) => `${e.domain}.${t}_${e.suffix}`;
// src/calc/readings.ts
function jt(e, t) {
	return t.quantity === void 0 ? ft(e) : bt(e, t.quantity) ?? (t.quantity === "pressure" ? ft(e) : void 0);
}
function Mt(e) {
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
function Nt(e, t, n) {
	if (t.onOff === !0 && Et(n)) return Mt(e);
	switch (t.kind) {
		case "number": return jt(e, t);
		case "text": return e === void 0 || dt(e) || ["unavailable", "unknown"].includes(e.state.trim().toLowerCase()) ? void 0 : e.state.trim();
		case "binary": return Mt(e);
	}
}
function Pt(e, t) {
	return Object.fromEntries(k.map((n) => [n.path, Nt(pt(e, t[n.path]), n, t[n.path])]));
}
function Ft(e, t, n) {
	return new Set(Ot.filter((r) => {
		let i = t[r];
		return i === void 0 || n.has(r) && pt(e, i) === void 0;
	}));
}
var It = [
	"production.pump",
	"brine.pump",
	"source.fan_speed"
];
function Lt(e, t, n) {
	let r = {};
	for (let i of It) {
		let a = e[i], o = pt(n, t[i])?.attributes.unit_of_measurement?.trim();
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
function Vt(e, t, n = ot) {
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
	return e !== void 0 && (Mt(e) === !1 || dt({ state: e.state.trim().toLowerCase() }));
}
var Ut = (e) => e === !0;
// src/calc/circuits.ts
function Wt(e, t, n, r, i, a) {
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
	return i && !zt(r["brine.pump"]) && o.delete("brine"), {
		valve26: e === "dhw" ? "dhw" : "production",
		valve14: e === "active_cooling" ? "reversed" : "normal",
		valves2728: (e === "passive_cooling" || e === "defrost") && s ? "exchanger" : "closed",
		active: o
	};
}
// src/lib/config.ts
var Gt = /^[a-z][a-z0-9_]*\.[a-z0-9_]+$/;
function A(e, t) {
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
	return Kt(A(e, t));
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
		case "number": return C.number(String(e.min), String(e.max));
		case "color": return C.color;
		case "boolean": return C.boolean;
		case "choice": return C.choice(e.choices);
		case "list": return C.list;
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
		let r = n.slice(0, t).join("."), i = A(e, r);
		if (!en(i) && (typeof i != "object" || Array.isArray(i))) return r;
	}
}
function sn(e, t) {
	let n = t.flatMap((t) => {
		let n = on(e, t.path);
		if (n !== void 0) return [C.invalid(n, C.object)];
		let r = A(e, t.path);
		return en(r) || an(t, r) ? [] : [C.invalid(t.path, tn(t))];
	});
	return [...new Set(n)];
}
function cn(e, t) {
	let n = A(e, t.path);
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
], j = "var(--disabled-text-color)", un = "#8a8a8a", dn = `var(--ecogeo-coil-muted, ${j})`, fn = (e) => e ? j : un, pn = (e) => typeof e == "object" && !!e && !Array.isArray(e), mn = (e) => typeof e == "string" && sn({ color: e }, [{
	kind: "color",
	path: "color",
	default: ""
}]).length === 0, hn = (e) => e.map((e) => ({
	temperature: e.temperature,
	color: e.color.trim()
}));
function gn(e) {
	let t = A(e, "colors");
	if (t == null) return [];
	if (!Array.isArray(t) || t.length < 2 || t.length > 8) return [T.colors];
	let n = t;
	if (!n.every((e) => pn(e) && typeof e.temperature == "number" && Number.isFinite(e.temperature) && mn(e.color))) return [T.colors];
	let r = hn(n).map((e) => e.temperature);
	return r.every((e, t) => t === 0 || e > (r[t - 1] ?? 0)) ? [] : [T.colors];
}
function _n(e) {
	let t = A(e, "colors");
	return Array.isArray(t) && gn(e).length === 0 ? hn(t) : ln;
}
function vn(e, t = ln) {
	let n = t[0], r = t[t.length - 1];
	if (e === void 0 || !Number.isFinite(e) || n === void 0 || r === void 0) return j;
	if (e <= n.temperature) return n.color;
	if (e >= r.temperature) return r.color;
	let i = t.findIndex((t) => t.temperature >= e), a = t[i - 1], o = t[i];
	if (a === void 0 || o === void 0) return r.color;
	let s = Math.round((e - a.temperature) / (o.temperature - a.temperature) * 1e3) / 10;
	return s <= 0 ? a.color : s >= 100 ? o.color : `color-mix(in srgb, ${o.color} ${String(s)}%, ${a.color})`;
}
// src/config/variants.ts
var yn = [
	"active_cooling",
	"passive_cooling",
	"htr",
	"backup_heater"
], bn = [
	1,
	2,
	3,
	4
];
function xn(e) {
	return {
		active_cooling: e === 3 || e === 4,
		passive_cooling: e === 2 || e === 4,
		htr: !0,
		backup_heater: !0
	};
}
function Sn(e, t) {
	return {
		...xn(e),
		...t
	};
}
// src/config/options.ts
var Cn = ["B", "C"], wn = [
	"air",
	"ground",
	"hybrid"
], Tn = [
	"external",
	"internal",
	"unused",
	"none"
], En = [
	"underfloor",
	"radiator",
	"none"
], Dn = {
	kind: "choice",
	path: "model",
	default: "B",
	choices: Cn
}, On = {
	kind: "choice",
	path: "source",
	default: "ground",
	choices: wn
}, kn = {
	kind: "choice",
	path: "dhw",
	default: "external",
	choices: Tn
}, An = {
	kind: "choice",
	path: "emitter",
	default: "underfloor",
	choices: En
}, jn = {
	kind: "choice",
	path: "exchanger_fill",
	default: "gradient",
	choices: ["gradient", "none"]
}, Mn = {
	kind: "choice",
	path: "layout",
	default: "auto",
	choices: [
		"auto",
		"horizontal",
		"vertical"
	]
}, Nn = [
	Dn,
	On,
	kn,
	An,
	jn,
	Mn
], Pn = [
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
], Fn = (e) => e === "C" ? "internal" : "external", M = (e) => e == null, In = (e) => M(e) || typeof e == "string" && e.trim() === "", Ln = (e) => typeof e == "object" && !!e && !Array.isArray(e), Rn = /^[a-z0-9_]+$/, zn = (e) => typeof e == "string" && e.trim() === "none";
function Bn(e) {
	let t = A(e, "prefix");
	return In(t) ? void 0 : t.trim();
}
function Vn(e) {
	let t = A(e, "variant");
	return bn.find((e) => e === t) ?? 4;
}
function Hn(e) {
	let t = cn(e, Dn), n = !M(A(e, "dhw"));
	return {
		model: t,
		source: cn(e, On),
		dhw: n ? cn(e, kn) : Fn(t),
		emitter: cn(e, An)
	};
}
var Un = (e) => cn(e, jn), Wn = (e) => cn(e, Mn), Gn = ["off", "defrost"], Kn = (e) => Array.isArray(e) && e.length > 0 && e.every((e) => typeof e == "string" && e.trim() !== "");
function qn(e) {
	let t = A(e, "states"), n = Ln(t) ? t : {}, r = (e) => {
		let t = n[e];
		return Kn(t) ? t : ot[e];
	};
	return {
		off: r("off"),
		defrost: r("defrost")
	};
}
function Jn(e) {
	let t = A(e, "features");
	if (!Ln(t)) return {};
	let n = {};
	for (let e of yn) {
		let r = t[e];
		(r === !0 || r === !1 || r === "unused") && (n[e] = r);
	}
	return n;
}
var Yn = (e) => e === !0 || e === !1 || e === "unused";
function Xn(e) {
	let t = A(e, "entities");
	return Ln(t) ? new Set(Zn(t).filter(([e, t]) => Dt.has(e) && zn(t)).map(([e]) => e)) : /* @__PURE__ */ new Set();
}
function Zn(e, t = "") {
	return Object.entries(e).flatMap(([e, n]) => {
		let r = t === "" ? e : `${t}.${e}`;
		return Ln(n) ? Zn(n, r) : [[r, n]];
	});
}
function Qn(e) {
	let t = A(e, "variant");
	return M(t) || bn.some((e) => e === t) ? [] : [C.invalid("variant", T.integer(String(bn[0]), String(bn[bn.length - 1])))];
}
function $n(e) {
	let t = A(e, "prefix");
	return In(t) || typeof t == "string" && Rn.test(t.trim()) ? [] : [C.invalid("prefix", T.prefix)];
}
function er(e) {
	let t = A(e, "features");
	return M(t) ? [] : Ln(t) ? Object.entries(t).flatMap(([e, t]) => yn.some((t) => t === e) ? M(t) || Yn(t) ? [] : [T.featureState(e)] : [T.unknownFeature(e, yn)]) : [C.invalid("features", C.object)];
}
function tr(e) {
	let t = A(e, "states");
	return M(t) ? [] : Ln(t) ? Object.entries(t).flatMap(([e, t]) => Gn.some((t) => t === e) ? M(t) || Kn(t) ? [] : [T.statesList(e)] : [T.statesKey(e)]) : [C.invalid("states", C.object)];
}
function nr(e) {
	let t = A(e, "entities");
	return M(t) ? [] : Ln(t) ? Zn(t).flatMap(([e, t]) => In(t) ? [] : Dt.has(e) ? Kt(t) !== void 0 || zn(t) ? [] : [T.notEntityId(e)] : [T.unknownRole(e)]) : [C.invalid("entities", C.object)];
}
function rr(e) {
	let t = A(e, "entities");
	return Ln(t) && Zn(t).some(([, e]) => !In(e));
}
function ir(e) {
	let t = Object.keys(e).filter((e) => !Pn.includes(e)).map((e) => T.unknownOption(e)), n = sn(e, Nn), r = [
		...t,
		...n,
		...Qn(e),
		...$n(e),
		...er(e),
		...nr(e),
		...tr(e),
		...gn(e)
	];
	if (sn(e, [Dn, kn]).length === 0 && !M(A(e, "dhw"))) {
		let { model: t, dhw: n } = Hn(e);
		(t === "B" && n === "internal" || t === "C" && (n === "external" || n === "none")) && r.push(T.dhwMismatch(n, t));
	}
	return r;
}
// src/config/sample.ts
var ar = (e) => `ecogeo_sample.${e.replace(".", "_")}`, or = {
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
}, sr = "2026-01-01T12:00:00Z", cr = Object.fromEntries(kt.map((e) => [e, ar(e)])), lr = Object.fromEntries(kt.map((e) => {
	let t = Dt.get(e)?.unit, n = ar(e);
	return [n, {
		entity_id: n,
		state: or[e],
		last_updated: sr,
		attributes: t === void 0 ? {} : { unit_of_measurement: t }
	}];
}));
// src/config/resolve.ts
function ur(e, t, n = Xn(e)) {
	return Object.fromEntries(k.map((r) => [r.path, qt(e, `entities.${r.path}`) ?? (t === void 0 || n.has(r.path) ? void 0 : At(r, t))]));
}
function dr(e, t, n = Xn(e)) {
	return t === void 0 ? /* @__PURE__ */ new Set() : new Set(k.filter((t) => qt(e, `entities.${t.path}`) === void 0 && !n.has(t.path)).map((e) => e.path));
}
var fr = (e) => Bn(e) === void 0 && !rr(e);
function pr(e) {
	let t = Bn(e), n = Vn(e), r = fr(e), i = Xn(e);
	return {
		...Hn(e),
		exchangerFill: Un(e),
		layout: Wn(e),
		variant: n,
		prefix: t,
		states: qn(e),
		colors: _n(e),
		features: Sn(n, Jn(e)),
		entities: r ? cr : ur(e, t, i),
		notPresent: i,
		defaulted: r ? /* @__PURE__ */ new Set() : dr(e, t, i),
		sample: r
	};
}
// src/diagram/component-info.ts
var mr = {
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
}, hr = [
	"compressor.speed",
	"compressor.percentage",
	"compressor.power"
];
function gr(e, t) {
	return e === 11 ? hr.find((e) => t?.entities[e] !== void 0) ?? hr[0] : mr[e];
}
var _r = "source.fan_speed", vr = "heating.demand", yr = "dhw.temperature", br = (e, t) => e === void 0 || t?.onTap === void 0 ? void 0 : t.entities[e];
function xr(e, t) {
	return e === void 0 || t === void 0 ? {
		role: S,
		tabindex: S,
		click: S,
		keydown: S
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
`;
function Cr(e, t, n) {
	return e === "auto" ? t === void 0 || !(t > 0) ? !1 : t < 560 + (n ? 24 : 0) : e === "vertical";
}
var wr = {
	pipe: 3,
	outline: 2
}, Tr = 2, Er = 1.25, Dr = (e) => Math.ceil(e * 10 - 1e-9) / 10;
function Or(e, t = 1e3) {
	if (e === void 0 || !(e > 0)) return wr;
	let n = e / t;
	return {
		pipe: Math.max(wr.pipe, Dr(Tr / n)),
		outline: Math.max(wr.outline, Dr(Er / n))
	};
}
function kr(e) {
	let { cardWidth: t, viewBox: n } = e;
	if (t === void 0 || !(t > 0)) return 0;
	if (!e.isPanel || !(e.windowHeight > 0)) return t;
	let r = e.headerHeight !== void 0 && e.headerHeight > 0 ? e.headerHeight : 56, i = e.safeAreaTop !== void 0 && e.safeAreaTop > 0 ? e.safeAreaTop : 0, a = Math.floor((e.windowHeight - r - i - 64) * n.width / n.height);
	return Math.min(t, Math.max(a, 320));
}
// src/diagram/label-places.ts
var Ar = {
	horizontal: 1.3,
	vertical: 2.4
}, jr = (e) => `max(10px, ${String(Ar[e])}cqw)`, Mr = {
	horizontal: 1e3,
	vertical: 740
}, Nr = {
	horizontal: Math.ceil((12 * Mr.horizontal / 560 + 1) / 4) * 4,
	vertical: Math.ceil((12 * Mr.vertical / 320 + 1) / 4) * 4
}, Pr = {}, Fr = (() => {
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
})(), Ir = {
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
}, Lr = (e, t, n, r, i, a = {}) => ({
	id: e,
	role: t,
	x: n,
	y: r,
	align: i,
	...a
}), Rr = (e) => [e.x + e.width / 2, e.y + e.height / 2], zr = 44;
function Br(e) {
	let t = [], { airUnit: n, collector: r, externalTank: i } = e;
	if (n !== void 0 && (e.key?.source === "air" || e.key?.source === "hybrid")) {
		let { outside: r, speed: i, out: a } = n.values, o = ["air", "hybrid"];
		t.push(Lr("outside_temperature", "source.outside_temperature", ...Rr(r), "middle", {
			source: o,
			bare: !0
		}), Lr("fan_speed", "source.fan_speed", ...Rr(i), "middle", {
			source: o,
			bare: !0
		})), e.key.source === "air" && t.push(Lr("air_unit_out", "source.air_unit_outlet_temperature", a.x, Rr(a)[1], "start", {
			source: ["air"],
			bare: !0
		}));
	}
	if (r !== void 0 && e.key?.source !== void 0 && e.key.source !== "air") {
		let n = r.out.x + r.out.width, i = Rr(r.out)[1], a = e.key.source === "hybrid";
		t.push(Lr(a ? "hybrid_ground_out" : "ground_out", "brine.inlet_temperature", n, i, "end", {
			source: [a ? "hybrid" : "ground"],
			bare: !0
		}));
	}
	if (i !== void 0) {
		let e = i.x + i.width / 2;
		t.push(Lr("tank_external_temperature", "dhw.temperature", e, i.y + zr, "middle", {
			dhw: "external",
			bare: !0
		}));
	}
	return t;
}
function Vr(e, t = (e, t) => [e, t], n = "horizontal") {
	let { internalTank: r } = e, i = r.y + 16, a = n === "vertical", o = Lr, s = (e, r, i, a, s, c) => {
		let l = n === "vertical" ? Ir[e] : void 0;
		if (l !== void 0) {
			let [n, i] = t(l.x, l.y);
			return o(e, r, n, i, "middle", l.rotate === !0 ? {
				...c,
				rotate: -90
			} : c);
		}
		let [u, d] = t(i, a);
		return o(e, r, u, d, s, c);
	}, c = Nr[n], l = (e, n, r, i, a, s, l) => {
		let [u, d] = t(i, a);
		return o(n, r, u, d + e * c, s, l);
	};
	return { specs: [
		s("production_out", "production.outlet_temperature", 38, 112, "end", {
			item: 33,
			caption: Qe.portOut
		}),
		s("production_in", "production.return_temperature", 115, 112, "end", {
			item: 34,
			caption: Qe.portIn
		}),
		s("production_pressure", "production.pressure", 115, 142, "end", { item: 38 }),
		s("production_pump", "production.pump", 229, 370, "start", { item: 15 }),
		s("brine_out", "brine.outlet_temperature", 544, 112, "start", {
			item: 31,
			caption: Qe.portOut
		}),
		s("brine_in", "brine.inlet_temperature", 609, 112, "start", {
			item: 32,
			caption: Qe.portIn
		}),
		s("brine_pressure", "brine.pressure", 570, 142, "end", { item: 37 }),
		s("brine_pump", "brine.pump", 570, 298, "end", { item: 16 }),
		s("discharge_temperature", "compressor.discharge_temperature", 283, 167, "start", { item: 30 }),
		l(1, "discharge_pressure", "compressor.discharge_pressure", 283, 167, "start", { item: 36 }),
		s("suction_temperature", "compressor.suction_temperature", 401, 167, "start", { item: 29 }),
		l(1, "suction_pressure", "compressor.suction_pressure", 401, 167, "start", { item: 35 }),
		l(2, "compressor_speed", "compressor.speed", 360, 167, "middle", { item: 11 }),
		s("expansion_valve", "refrigerant.expansion_valve", 412, 426, "middle", { item: 12 }),
		...Br(e),
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
}, Hr = {
	jog: 24,
	second: 34,
	third: 44
}, Ur = {
	horizontal: Hr,
	vertical: Hr
}, Wr = (e) => e === "air" ? N.air.width : e === "ground" ? N.collector.width : N.air.width + N.hybridGap + N.collector.width;
function Gr(e, t, n) {
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
		x0: Kr(e.x0 + n),
		x1: Kr(e.x0 + n + t.width)
	}])));
}
var Kr = (e) => Math.round(e * 100) / 100, qr = 8, Jr = 40;
function Yr(e, t) {
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
			radius: Jr
		},
		body: {
			x: e,
			y: i,
			width: n,
			height: r - qr
		},
		feet: [e + 24, e + 138].map((e) => ({
			x: e,
			y: t - qr,
			width: 24,
			height: qr
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
				y: c + Jr + 2,
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
var Xr = 16, Zr = 20;
function Qr(e, t) {
	let { width: n, height: r } = N.collector, i = t - r, a = N.margin + wr.pipe / 2, o = e + a, s = e + n - a, c = o + Zr, l = c + Xr, u = s - Zr, d = u - Xr, f = i + 128, p = s - 1.5 * wr.pipe;
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
			height: f + wr.pipe - (i + 18)
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
var $r = {
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
function ei(e, t) {
	let { width: n, height: r } = N.emitter, i = $r.pitch, a = t + r, o = (r) => ({
		l: e + N.margin + 2 * i * r,
		r: e + n - N.margin - 2 * i * r,
		t: t + N.margin + 2 * i * r,
		b: a - N.margin - 2 * i * r
	}), s = e + n / 2 - i / 2, c = e + n / 2 + i / 2, l = [[s, a], [s, o(0).b]], u = [[c, a], [c, o(0).b - i]];
	for (let e = 0; e < $r.turns; e += 1) {
		let t = o(e);
		if (l.push([t.l, t.b], [t.l, t.t], [t.r, t.t]), u.push([t.l + i, t.b - i], [t.l + i, t.t + i]), e < $r.turns - 1) {
			let n = o(e + 1);
			l.push([t.r, n.b]), u.push([t.r - i, t.t + i], [t.r - i, n.b - i]);
		} else u.push([t.r, t.t + i]);
	}
	let d = o($r.turns - 1), f = [d.r, d.t + i / 2];
	return {
		loopIn: [...l, f],
		loopOut: [f, ...u.reverse()],
		feedX: s,
		exitX: c
	};
}
function ti(e, t, n) {
	let { width: r, height: i } = N.emitter, a = n - i, o = {
		kind: e,
		x: t,
		y: a,
		width: r,
		height: i
	};
	if (e === "underfloor") {
		let { loopIn: e, loopOut: r, feedX: i, exitX: s } = ei(t, a);
		return {
			...o,
			feedX: i,
			exitX: s,
			inlet: [i, n],
			outlet: [s, n],
			loopIn: e,
			loopOut: r,
			pitch: $r.pitch,
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
var ni = (e) => ({
	feed: e.passes.x0,
	exit: e.passes.x0 + (e.passes.count - 1) * e.passes.step
}), ri = (e) => e.coil.y + e.coil.height;
function ii({ externalTank: e }) {
	if (e === void 0) return "";
	let { x: t, y: n, width: r, height: i, dome: a } = e, o = r / 2, s = N.radius, c = n + i;
	return `M${String(t)} ${String(n + a)} A${String(o)} ${String(a)} 0 0 1 ${String(t + r)} ${String(n + a)} V${String(c - s)} A${String(s)} ${String(s)} 0 0 1 ${String(t + r - s)} ${String(c)} H${String(t + s)} A${String(s)} ${String(s)} 0 0 1 ${String(t)} ${String(c - s)} Z`;
}
var ai = [[-75, -13], [-75, 13]], F = {
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
}, oi = [
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
], si = [
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
}), ci = F.width / 2, R = {
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
	compressor: ci,
	probe29: 410,
	transducer35: 432,
	valve12: 412,
	hx10: ci,
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
}, li = I.coil51.x - 75, ui = (e) => [
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
], di = (e) => e.split(" ").map((e) => {
	let [t, n] = e.split(",").map(Number);
	return [t ?? 0, n ?? 0];
}), B = (...e) => e.map(([e, t]) => `${String(e)},${String(t)}`).join(" "), V = (e, t, n, r, i = {}) => ({
	id: e,
	circuit: t,
	points: di(n),
	temperatureRole: r,
	direction: 1,
	...i
}), H = ["production_dg1"], fi = ["production_dg1", "production_dhw"], U = "production.outlet_temperature", W = "production.return_temperature", G = "production.pump", K = "brine.inlet_temperature", q = "brine.outlet_temperature", J = "brine.pump", pi = "compressor.discharge_temperature", mi = "compressor.suction_temperature", hi = "refrigerant.condensation_temperature", gi = "refrigerant.evaporation_temperature", Y = "compressor.percentage", _i = "dhw.temperature", vi = "source.air_unit_outlet_temperature", yi = [
	"dhw_sup_b",
	"dhw_sup_c",
	"dhw_ret_b",
	"dhw_ret_c",
	"dhw_ext_in",
	"dhw_ext_coil",
	"dhw_ext_out"
], bi = () => {
	let { riser1: e, riser2: t, riser3: n, riser4: r } = R, { dhwSup: i, dhwRet: a, line: o } = z, s = R.hx8 - 12, c = R.hx8 + 12, l = R.hx7 - 12, u = R.hx7 + 12, d = R.hx9 - 12, f = R.hx9 + 12, p = R.hx10 - 12, m = R.hx10 + 12, h = R.compressor - 14, g = R.compressor + 14, _ = R.valve14 - 14, v = R.valve14 + 14, y = (...e) => B(...e);
	return [
		V("p1_up", H, y([e, i - 12], [e, 0]), U, {
			dhw: "any",
			speedRole: G
		}),
		V("p1_direct", H, y([e, i + 12], [e, 0]), U, {
			dhw: "none",
			speedRole: G
		}),
		V("p2_in", H, y([t, 0], [t, a]), W, { speedRole: G }),
		V("prod_44_26", fi, y([e, z.resistor - 28], [e, i + 12]), U, { speedRole: G }),
		V("prod_bypass44", fi, y([e, z.hxTop], [e, z.resistor - 28]), U, {
			bypass: "backup_heater",
			speedRole: G
		}),
		V("prod_8_44", fi, y([s, z.hxTop], [e, z.hxTop]), U, { speedRole: G }),
		V("prod_15_8", fi, y([R.pump15 + 12, o], [s, o]), W, { speedRole: G }),
		V("trunk", fi, y([t, a], [t, o]), W, { speedRole: G }),
		V("prod_27_in", fi, y([t, o], [R.valve27 - 12, o]), W, {
			through: "passive_cooling",
			speedRole: G,
			onlyWhen: { valves2728: "closed" }
		}),
		V("prod_27_15", fi, y([R.valve27 + 12, o], [R.pump15 - 12, o]), W, {
			through: "passive_cooling",
			speedRole: G
		}),
		V("prod_bypass27", fi, y([t, o], [R.pump15 - 12, o]), W, {
			bypass: "passive_cooling",
			speedRole: G
		}),
		V("prod_10_in", ["exchanger_10"], y([t, o], [t, z.hx10Bottom], [p, z.hx10Bottom]), W, {
			feature: "passive_cooling",
			speedRole: G
		}),
		V("prod_10_out", ["exchanger_10"], y([p, z.hx10Top], [R.valve27, z.hx10Top], [R.valve27, o + 12]), U, {
			feature: "passive_cooling",
			speedRole: G
		}),
		V("dhw_sup_a", ["production_dhw"], y([e + 12, i], [R.htrRiser, i]), U, {
			dhw: "any",
			speedRole: G
		}),
		V("dhw_sup_b", ["dhw_coil"], y([R.htrRiser, i], [li, i]), U, {
			dhw: "any",
			speedRole: G
		}),
		V("dhw_sup_c", ["dhw_coil"], y([li, i], [R.port5, i], [R.port5, 0]), U, {
			dhw: "external",
			speedRole: G
		}),
		V("dhw_ret_c", ["dhw_coil"], y([R.port6, 0], [R.port6, a], [li, a]), W, {
			dhw: "external",
			speedRole: G
		}),
		V("dhw_ret_b", ["dhw_coil"], y([li, a], [R.htr, a]), W, {
			dhw: "any",
			speedRole: G
		}),
		V("dhw_ret_a", ["production_dhw"], y([R.htr, a], [t, a]), W, {
			dhw: "any",
			speedRole: G
		}),
		V("htr_in", ["htr"], y([R.htr, a], [R.htr, z.probe - 12]), _i, {
			feature: "htr",
			dhw: "any"
		}),
		V("htr_pump", ["htr"], y([R.htr, z.probe + 12], [R.htr, z.trans - 9]), _i, {
			feature: "htr",
			dhw: "any"
		}),
		V("htr_to_9", ["htr"], y([R.htr, z.trans + 9], [R.htr, z.hx9Bottom], [d, z.hx9Bottom]), _i, {
			feature: "htr",
			dhw: "any"
		}),
		V("htr_riser", ["htr"], y([d, z.hx9Top], [d, i]), _i, {
			feature: "htr",
			dhw: "any"
		}),
		V("tap_47", ["dhw_coil"], y([R.tap47, -12], [R.tap47, I.internalTank.y]), _i, {
			dhw: "internal",
			stub: !0
		}),
		V("tap_48", ["dhw_coil"], y([R.tap48, I.internalTank.y], [R.tap48, -12]), _i, {
			dhw: "internal",
			stub: !0
		}),
		V("tap_49", ["dhw_coil"], y([R.tap49, -12], [R.tap49, I.internalTank.y]), _i, {
			dhw: "internal",
			stub: !0
		}),
		V("ref_discharge", ["refrigerant"], y([h, z.trans], [f, z.trans], [f, z.hx9Top]), pi, {
			through: "htr",
			speedRole: Y
		}),
		V("ref_9_14", ["refrigerant"], y([f, z.hx9Bottom], [_, z.valve14]), pi, {
			through: "htr",
			speedRole: Y
		}),
		V("ref_discharge_direct", ["refrigerant"], y([h, z.trans], [_, z.trans], [_, z.valve14]), pi, {
			bypass: "htr",
			speedRole: Y
		}),
		V("ref_14_8", ["refrigerant"], y([v, z.valve14 + 10], [c, z.hxTop]), pi, {
			through: "active_cooling",
			reversible: !0,
			speedRole: Y
		}),
		V("ref_7_14", ["refrigerant"], y([l, z.hxTop], [l, z.valve14], [v, z.valve14]), mi, {
			through: "active_cooling",
			reversible: !0,
			speedRole: Y
		}),
		V("ref_suction", ["refrigerant"], y([v, z.valve14 - 10], [R.suction, z.valve14 - 10], [R.suction, z.trans], [g, z.trans]), mi, {
			through: "active_cooling",
			speedRole: Y
		}),
		V("ref_direct_8", ["refrigerant"], y([_, z.valve14], [v, z.valve14], [c, z.hxTop]), pi, {
			bypass: "active_cooling",
			speedRole: Y
		}),
		V("ref_direct_suction", ["refrigerant"], y([l, z.hxTop], [l, z.valve14 - 10], [R.suction, z.valve14 - 10], [R.suction, z.trans], [g, z.trans]), mi, {
			bypass: "active_cooling",
			speedRole: Y
		}),
		V("ref_8_13", ["refrigerant"], y([c, o], [R.compressor - 14, o]), hi, {
			reversible: !0,
			speedRole: Y
		}),
		V("ref_13_12", ["refrigerant"], y([R.compressor + 14, o], [R.valve12 - 12, o]), hi, {
			reversible: !0,
			speedRole: Y
		}),
		V("ref_12_7", ["refrigerant"], y([R.valve12 + 12, o], [l, o]), gi, {
			reversible: !0,
			speedRole: Y
		}),
		V("ln4_a", ["brine"], y([r, 0], [r, z.pump16 - 12]), K, { speedRole: J }),
		V("ln4_b", ["brine"], y([r, z.pump16 + 12], [r, z.hxTop]), K, { speedRole: J }),
		V("br_feed7", ["brine"], y([r, z.hxTop], [u, z.hxTop]), K, {
			speedRole: J,
			onlyWhen: { valves2728: "closed" }
		}),
		V("brine_7_28", ["brine"], y([u, o], [R.valve28 - 12, o]), q, {
			through: "passive_cooling",
			speedRole: J,
			onlyWhen: { valves2728: "closed" }
		}),
		V("brine_28_ln3", ["brine"], y([R.valve28 + 12, o], [n, o]), q, {
			through: "passive_cooling",
			speedRole: J
		}),
		V("brine_bypass28", ["brine"], y([u, o], [n, o]), q, {
			bypass: "passive_cooling",
			speedRole: J
		}),
		V("ln3", ["brine"], y([n, o], [n, 0]), q, { speedRole: J }),
		V("br_10_in", ["exchanger_10"], y([r, z.hxTop], [r, z.hx10Top], [m, z.hx10Top]), K, {
			feature: "passive_cooling",
			speedRole: J
		}),
		V("br_10_28", ["exchanger_10"], y([m, z.hx10Bottom], [R.valve28, z.hx10Bottom], [R.valve28, o + 12]), q, {
			feature: "passive_cooling",
			speedRole: J
		})
	];
}, xi = [
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
function Si(e) {
	let { x0: t, step: n, count: r, top: i, bottom: a } = e.passes, o = ri(e), s = [[t, o]];
	for (let e = 0; e < r; e += 1) {
		let c = t + e * n, l = e === r - 1;
		e % 2 == 0 ? (s.push([c, i]), l || s.push([c + n, i])) : (s.push(l ? [c, o] : [c, a]), l || s.push([c + n, a]));
	}
	return s;
}
function Ci(e) {
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
		bend: Xr / 2
	};
}
var wi = (...e) => e.filter((t, n) => n === 0 || !ha(t, e[n - 1] ?? t));
function Ti(e, t) {
	let n = Ei(e.key), r = [
		0,
		1,
		2
	], i = n.reduce((e) => e.flatMap((e) => r.map((t) => [...e, t])), [[]]).map((e) => ({
		chosen: e,
		lifted: e.reduce((e, t, r) => e + (t > 0 ? n[r] === "tank" ? 2 : 1 : 0), 0),
		top: Math.max(...e),
		cost: e.reduce((e, t, r) => e + t * (Vi[n[r] ?? ""] ?? 0), 0)
	})).sort((e, t) => e.lifted - t.lifted || e.top - t.top || e.cost - t.cost), a = (r) => Di(e, t, Object.fromEntries(n.map((e, t) => [e, r[t] ?? 0])));
	for (let { chosen: t } of i) {
		let n = a(t);
		if (Ui({
			segments: n,
			band: e.band
		}).conflicts.length === 0) return n;
	}
	return a(n.map(() => 0));
}
var Ei = (e) => Bi.filter((t) => (t === "tank" ? e.tank : t === "dg1_sup" || t === "dg1_ret" ? e.emitter !== "none" : !0) && (t !== "src_hyb_link" || e.source === "hybrid"));
function Di(e, t, n) {
	let { ports: r, cabinet: i, key: a } = e, o = i.y, s = e.externalCoil, c = zi(o, t), l = [
		c.jog,
		c.second,
		c.third
	], u = (e) => l[n[e] ?? 0] ?? c.jog, d = u("tank"), f = [], { emitter: p } = e;
	if (p === void 0) f.push(V("p1_stub", H, B([r[1], o], [r[1], o - 12]), U, { stub: !0 }), V("p2_stub", H, B([r[2], o - 12], [r[2], o]), W, { stub: !0 }));
	else {
		let e = p.y + p.height;
		f.push(V("dg1_sup", H, B(...wi([r[1], o], [r[1], u("dg1_sup")], [p.feedX, u("dg1_sup")], [p.feedX, e], [p.feedX, p.inlet[1]], p.inlet)), U, { speedRole: G }), ...p.kind === "underfloor" ? [V("dg1_loop_in", H, B(...p.loopIn), U, {
			speedRole: G,
			bend: p.pitch / 2
		}), V("dg1_loop_out", H, B(...p.loopOut), W, {
			speedRole: G,
			bend: p.pitch / 2
		})] : [], V("dg1_ret", H, B(...wi(p.outlet, [p.exitX, p.outlet[1]], [p.exitX, e], [p.exitX, u("dg1_ret")], [r[2], u("dg1_ret")], [r[2], o])), W, { speedRole: G }));
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
		}, { start: t, end: n } = fa(e);
		f.push(V("dhw_ext_in", ["dhw_coil"], B(...wi([r[5], o], [r[5], d], [s.inX, d], t)), U, {
			dhw: "external",
			speedRole: G
		}), V("dhw_ext_coil", ["dhw_coil"], B(t, n), U, {
			dhw: "external",
			speedRole: G,
			shape: e
		}), V("dhw_ext_out", ["dhw_coil"], B(...wi(n, [n[0], d], [r[6], d], [r[6], o])), W, {
			dhw: "external",
			speedRole: G
		}));
	}
	f.push(V("src_out", ["brine"], B([r[3], o], [r[3], u("src_out")]), q, { speedRole: J }), V("src_in", ["brine"], B([r[4], u("src_in")], [r[4], o]), K, { speedRole: J }));
	let { airUnit: m, collector: h } = e, g = (e, t) => B(...wi([r[3], u("src_out")], [e, u("src_out")], [e, t])), _ = (e, t) => B(...wi([e, t], [e, u("src_in")], [r[4], u("src_in")]));
	if (a.source === "air" && m !== void 0) {
		let { feed: e, exit: t } = ni(m);
		f.push(V("src_air_feed", ["brine"], g(e, ri(m)), q, {
			source: ["air"],
			speedRole: J
		}), V("src_air_coil", ["brine"], B(...Si(m)), q, {
			source: ["air"],
			speedRole: J,
			bend: m.passes.step / 2
		}), V("src_air_exit", ["brine"], _(t, ri(m)), vi, {
			source: ["air"],
			speedRole: J
		}));
	}
	if (a.source === "ground" && h !== void 0) {
		let { down: e, up: t, bend: n } = Ci(h);
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
		let { feed: e, exit: t } = ni(m), { down: n, up: r, bend: i } = Ci(h);
		f.push(V("src_hyb_feed", ["brine"], g(e, ri(m)), q, {
			source: ["hybrid"],
			speedRole: J
		}), V("src_hyb_coil", ["brine"], B(...Si(m)), q, {
			source: ["hybrid"],
			speedRole: J,
			bend: m.passes.step / 2
		}), V("src_hyb_link", ["brine"], B([t, ri(m)], [t, u("src_hyb_link")], [h.feedX, u("src_hyb_link")], [h.feedX, h.y + h.height]), vi, {
			source: ["hybrid"],
			speedRole: J
		}), V("src_hyb_down", ["brine"], B(...n), vi, {
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
function Oi(e, t) {
	let n = e[0], r = e[e.length - 1];
	if (n === void 0 || r === void 0) return t;
	if (t <= n[0]) return Kr(t + n[1] - n[0]);
	if (t >= r[0]) return Kr(t + r[1] - r[0]);
	let i = e.findIndex(([e]) => e > t), [a, o] = e[i - 1] ?? n, [s, c] = e[i] ?? r;
	return Kr(o + (t - a) / (s - a) * (c - o));
}
function ki(e, t, n, r) {
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
var Ai = ki(si, {
	"left-edge": 62,
	"riser-1": 46,
	"before-exchanger-8": 22,
	"riser-3": 84,
	"riser-4": 46
}, 10, F.width), ji = ki(oi, { "above-probes": -18 }, N.top + N.height + N.joinLane, F.height), Mi = ki(si, {}, 10, F.width), Ni = { "under-compressor-row": 24 }, Pi = ki(oi, Ni, N.top + N.height + N.joinLane, F.height), Fi = {
	from: 10,
	to: 24,
	extra: 28
}, Ii = ki([{
	id: "tank-head",
	axis: "row",
	from: Fi.from,
	to: Fi.to,
	holds: "tank 50 head"
}, ...oi], {
	...Ni,
	"tank-head": Fi.extra
}, N.top + N.height + N.joinLane, F.height), Li = {
	horizontal: {
		x: Ai,
		y: ji
	},
	vertical: {
		x: Mi,
		y: Pi
	}
}, Ri = (e, t = !1) => {
	let n = Li[e], r = e === "vertical" && t ? Ii : n.y;
	return {
		mapX: (e) => Oi(n.x, e),
		mapY: (e) => Oi(r, e)
	};
}, zi = (e, t = "horizontal") => {
	let n = Ur[t];
	return {
		jog: e - n.jog,
		second: e - n.second,
		third: e - n.third
	};
}, Bi = [
	"dg1_sup",
	"dg1_ret",
	"src_out",
	"src_in",
	"src_hyb_link",
	"tank"
], Vi = {
	dg1_sup: 16,
	dg1_ret: 16,
	src_out: 8,
	src_in: 4,
	src_hyb_link: 2,
	tank: 1
}, Hi = {
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
function Ui(e) {
	let t = [], n = [];
	for (let r of e.segments) {
		let i = Hi[r.id];
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
var Wi = "underfloor", Gi = (e) => ({
	source: e.source,
	tank: na(e) === "external",
	emitter: e.emitter ?? Wi,
	internal: na(e) === "internal"
}), Ki = {
	source: "hybrid",
	tank: !0,
	emitter: Wi
}, qi = (() => {
	let e = (e, t) => {
		let { mapX: n, mapY: r } = Ri(e, t), i = {
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
				width: Kr(n(a.x + a.width) - n(a.x)),
				height: Kr(r(a.y + a.height) - r(a.y))
			},
			coil51: {
				x: n(I.coil51.x - 75) + 75,
				y: r(I.coil51.y)
			},
			headShift: Kr(r(F.height) - Oi(Li[e].y, F.height))
		};
	};
	return {
		horizontal: e("horizontal", !1),
		vertical: e("vertical", !1),
		"vertical|internal": e("vertical", !0),
		"horizontal|internal": e("horizontal", !0)
	};
})(), Ji = (e, t) => {
	let n = qi[t.internal === !0 ? `${e}|internal` : e];
	if (n === void 0) throw Error("no cabinet zones");
	return n;
};
function Yi(e, t, n) {
	let { mapX: r } = Ri(e, t.internal === !0), i = n.cabinet.y - N.joinLane, a = {
		1: r(R.riser1),
		2: r(R.riser2),
		3: r(R.riser3),
		4: r(R.riser4),
		5: r(R.port5),
		6: r(R.port6)
	}, o = Gr([
		{
			name: "emitter",
			centre: (a[1] + a[2]) / 2,
			width: t.emitter === "none" ? 0 : N.emitter.width
		},
		{
			name: "source",
			centre: (a[3] + a[4]) / 2,
			width: Wr(t.source)
		},
		{
			name: "tank",
			centre: (a[5] + a[6]) / 2,
			width: t.tank ? N.tank.width : 0
		}
	], {
		min: n.cabinet.x,
		max: n.cabinet.x + n.cabinet.width
	}, N.gap), s = o.source, c = o.emitter, l = t.emitter === "none" || c === void 0 ? void 0 : ti(t.emitter, c.x0, i), u = t.source === "ground" || s === void 0 ? void 0 : Yr(s.x0, i), d = s === void 0 ? 0 : t.source === "hybrid" ? s.x0 + N.air.width + N.hybridGap : s.x0, f = t.source === "air" || s === void 0 ? void 0 : Qr(d, i), p = o.tank, m = p === void 0 ? void 0 : {
		x: p.x0,
		y: i - N.tank.height,
		width: N.tank.width,
		height: N.tank.height,
		dome: N.tank.dome
	}, h = m === void 0 ? void 0 : {
		cx: m.x + m.width / 2,
		top: m.y + 94,
		bottom: m.y + 152,
		rx: 38,
		inX: m.x + m.width / 2 - 38 - 12
	};
	return {
		key: t,
		band: {
			top: i - N.height,
			bottom: i
		},
		ports: a,
		slots: o,
		...l === void 0 ? {} : { emitter: l },
		...u === void 0 ? {} : { airUnit: u },
		...f === void 0 ? {} : { collector: f },
		...m === void 0 ? {} : { externalTank: m },
		...h === void 0 ? {} : { externalCoil: h }
	};
}
var Xi = /* @__PURE__ */ new Map(), Zi = {
	horizontal: Pr,
	vertical: Fr
};
function Qi(e, t, n = Zi[e]) {
	let { mapX: r, mapY: i } = Ri(e, t.internal === !0), a = {
		...Ji(e, t),
		...Yi(e, t, Ji(e, t))
	}, o = (e, t) => [r(e), i(t)], s = ui(a).map((e) => e.item === 50 || e.item === 51 ? e : {
		...e,
		x: r(e.x),
		y: i(e.y)
	}), c = [...bi().map((e) => ({
		...e,
		points: e.points.map(([e, t]) => [r(e), i(t)])
	})), ...Ti(a, e)], l = xi.map((e) => ({
		...e,
		at: o(e.at[0], e.at[1])
	})), u = Vr(a, o, e);
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
ui(I), bi(), Vr(I);
function $i(e, t = Ki) {
	let n = `${e}|${t.source}|${String(t.tank)}|${t.emitter}|${String(t.internal === !0)}`, r = Xi.get(n);
	if (r !== void 0) return r;
	let i = Qi(e, t);
	return Xi.set(n, i), i;
}
var ea = (e, t = "horizontal") => e.arrangement ?? (e.model === void 0 || e.dhw === void 0 || e.source === void 0 ? $i(t) : $i(t, Gi({
	model: e.model,
	dhw: e.dhw,
	source: e.source,
	emitter: e.emitter
}))), ta = (e, t) => t === "htr" && e.dhw === "none" ? !1 : e.features[t], na = (e) => e.dhw === "unused" ? e.model === "C" ? "internal" : "external" : e.dhw, ra = (e, t) => {
	let n = na(t);
	return e === "any" ? n !== "none" : e === n;
};
function ia(e, t) {
	if (e.source !== void 0 && !e.source.includes(t.source) || e.dhw !== void 0 && !ra(e.dhw, t) || e.bypass !== void 0 && ta(t, e.bypass) !== !1 || e.through !== void 0 && ta(t, e.through) === !1) return "hidden";
	if (e.feature !== void 0) {
		let n = ta(t, e.feature);
		if (n === !1) return "hidden";
		if (n === "unused") return "muted";
	}
	return t.dhw === "unused" && e.dhw !== void 0 && (e.dhw !== "any" || e.unusedMuted === !0) ? "muted" : "normal";
}
function aa(e, t) {
	return e.flatMap((e) => {
		let n = ia(e, t);
		return n === "hidden" ? [] : [{
			part: e,
			state: n
		}];
	});
}
var oa = (e) => aa(ea(e).components, e), sa = (e) => aa(ea(e).segments, e), ca = (e, t) => (e.onlyWhen === void 0 || e.onlyWhen.valves2728 === t.valves2728) && e.circuit.some((e) => t.active.has(e)), la = .35;
function ua(e) {
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
var da = (e) => [...e.filter((e) => !e.front), ...e.filter((e) => e.front)];
function fa(e) {
	let t = ua(e), n = t[0], r = t[t.length - 1];
	if (n === void 0 || r === void 0) throw Error("helix without halves");
	return {
		start: n.curve[0],
		end: r.curve[3]
	};
}
function pa(e) {
	let t = (e) => String(Math.round(e * 100) / 100);
	return ua(e).map(({ front: e, curve: [n, r, i, a] }) => ({
		front: e,
		d: `M${t(n[0])} ${t(n[1])} C${t(r[0])} ${t(r[1])} ${t(i[0])} ${t(i[1])} ${t(a[0])} ${t(a[1])}`
	}));
}
function ma(e, t) {
	let n = ga(e, 0), r = [`M${String(n[0])} ${String(n[1])}`];
	for (let n = 1; n < e.length; n += 1) {
		let [i, a, o] = [
			ga(e, n - 1),
			ga(e, n),
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
var ha = (e, t) => e[0] === t[0] && e[1] === t[1];
function ga(e, t) {
	let n = e[t];
	if (n === void 0) throw Error(`No point ${String(t)}`);
	return n;
}
var _a = (e) => e.slice(1).map((t, n) => [ga(e, n), t]), va = (e, t, n) => e >= Math.min(t, n) && e <= Math.max(t, n);
function ya(e, t = [], n = 7) {
	let r = [], i, a = (e) => {
		r.push(i === void 0 ? `M${String(e[0])} ${String(e[1])}` : `L${String(e[0])} ${String(e[1])}`), i = e;
	}, o = (e) => {
		r.push(`M${String(e[0])} ${String(e[1])}`), i = e;
	};
	a(ga(e, 0));
	for (let [r, i] of _a(e)) {
		let e = Math.sign(i[0] - r[0]), s = Math.sign(i[1] - r[1]), c = Math.abs(i[0] - r[0]) + Math.abs(i[1] - r[1]), l = t.filter((e) => ba(e, r, i) && !ha(e, r) && !ha(e, i)).sort((e, t) => Math.abs(e[0] - r[0]) + Math.abs(e[1] - r[1]) - (Math.abs(t[0] - r[0]) + Math.abs(t[1] - r[1])));
		for (let t of l) {
			let l = Math.abs(t[0] - r[0]) + Math.abs(t[1] - r[1]);
			l > n && a([t[0] - e * n, t[1] - s * n]), o(c - l > n ? [t[0] + e * n, t[1] + s * n] : i);
		}
		a(i);
	}
	return r.join(" ");
}
var ba = (e, t, n) => t[0] === n[0] && e[0] === t[0] && va(e[1], t[1], n[1]) || t[1] === n[1] && e[1] === t[1] && va(e[0], t[0], n[0]);
function xa(e, t, n) {
	return e.crossings.filter((e) => e.under === t && n.has(e.over) && n.has(e.under)).map((e) => e.at);
}
// src/diagram/pipes.ts
var Sa = 1.2, Ca = .6, wa = [
	"tap_47",
	"tap_48",
	"tap_49"
], Ta = ["prod_27_15", "prod_15_8"];
function Ea(e) {
	if (e !== void 0 && e > 0) return Math.min(8, Math.max(Ca, Sa * 100 / e));
}
var Da = {
	"compressor.discharge_temperature": "compressor.suction_temperature",
	"compressor.suction_temperature": "compressor.discharge_temperature",
	"refrigerant.condensation_temperature": "refrigerant.evaporation_temperature",
	"refrigerant.evaporation_temperature": "refrigerant.condensation_temperature"
}, Oa = (e, t) => yi.includes(e.id) && ka(t), ka = (e) => e.active.has("htr") && !e.active.has("production_dhw");
function Aa(e, t) {
	return Oa(e, t.circuits) ? "dhw.temperature" : e.reversible === !0 && t.mode === "active_cooling" ? Da[e.temperatureRole] ?? e.temperatureRole : (t.mode === "passive_cooling" || t.mode === "defrost") && t.circuits.valves2728 === "exchanger" && Ta.includes(e.id) ? "production.outlet_temperature" : e.temperatureRole;
}
function ja(e, t, n) {
	return t === "muted" && n === "defrost" && e.feature === "passive_cooling" ? "normal" : t;
}
var Ma = (e, t) => {
	let n = e[t];
	return n === !0 ? 3 : Ea(typeof n == "number" ? n : void 0);
}, Na = (e, t) => {
	let n = e[t];
	return typeof n == "number" ? n : void 0;
};
function Pa(e, t, n) {
	let { mode: r, circuits: i, readings: a, stops: o } = n, s = wa.includes(e.id), c = ja(e, t, r), l = s || ca(e, i), u = Na(a, Aa(e, n)), d = c === "muted" || !l || u === void 0, f = e.direction === -1 != (e.reversible === !0 && r === "active_cooling"), p = {
		color: d ? j : vn(u, o),
		muted: d,
		reversed: f
	};
	if (!l || c === "muted" || e.stub === !0 || s) return {
		...p,
		animated: !1
	};
	let m = Oa(e, i) || e.speedRole === void 0 && e.circuit.includes("htr") ? 3 : e.speedRole === void 0 ? void 0 : Ma(a, e.speedRole);
	return m === void 0 ? {
		...p,
		animated: !1
	} : {
		...p,
		animated: !0,
		duration: m
	};
}
var Fa = (e) => vn(Na(e.readings, "dhw.temperature"), e.stops);
function Ia(e) {
	let { circuits: t, readings: n, stops: r } = e;
	return ka(t) ? vn(Na(n, "dhw.temperature"), r) : t.active.has("dhw_coil") ? vn(Na(n, "production.outlet_temperature"), r) : j;
}
// src/diagram/symbols.ts
var La = .55;
function Ra(e, t, n) {
	let r = -t - 9, i = t + 9;
	return x`<path class="exchanger-fill" data-half=${e} d=${e === "left" ? `M0 ${String(r)} H-16 A4 4 0 0 0 -20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 0 -16 ${String(i)} H0 Z` : `M0 ${String(r)} H16 A4 4 0 0 1 20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 1 16 ${String(i)} H0 Z`} fill=${n} fill-opacity=${La} stroke="none" />`;
}
var za = (e, t) => x`<text class="glyph" text-anchor="middle" dominant-baseline="central" font-size="9" fill="currentColor" stroke="none" transform="rotate(${-t})">${e}</text>`, Ba = {
	kind: "helix",
	cx: 2,
	top: -60,
	bottom: 60,
	rx: 11,
	turns: 7.5
};
function Va({ internalTank: e, coil51: t }) {
	let n = e.x + 2 - t.x, r = pa(Ba), { cx: i, rx: a, top: o, bottom: s } = Ba, c = ai[0][1], l = ai[1][1], u = a - i;
	return x`<g transform="matrix(0 -1 1 0 0 0)">${da(r).map((e) => x`<path data-half=${e.front ? "front" : "back"} stroke-linecap=${e.front ? "round" : "butt"} d=${e.d} opacity=${e.front ? S : la} />`)}</g><path style="stroke-width: var(--pipe-width, 3)" d="M${n} ${c} H${o} M${s} ${u} V${l} H${n}" />`;
}
var Ha = "M9 -10.7 L-13 -3 M9 10.7 L-13 3", Ua = (e, t) => x`<path d="M0 ${t} V${e}" />`, Wa = (e, t) => x`<path d="${e}" fill=${t ? "currentColor" : "none"} />`;
function Ga(e, t) {
	let n = t.rotation ?? 0, r = () => {
		if (t.arrangement === void 0) throw Error(`the ${e} symbol needs the arrangement it is drawn in`);
		return t.arrangement;
	};
	switch (e) {
		case "pump": return x`<circle r="12" /><path d="M-5 -7 V7 L8 0 Z" fill="currentColor" />`;
		case "valve3": {
			let e = t.open ?? ["l", "r"];
			return x`${Wa("M-12 -6 V6 L0 0 Z", e.includes("l"))}${Wa("M12 -6 V6 L0 0 Z", e.includes("r"))}${Wa("M-6 12 H6 L0 0 Z", e.includes("d"))}<rect x="-4" y="-21" width="8" height="8" /><path d="M0 -13 V-8" />`;
		}
		case "inversion_valve": return x`<rect x="-10" y="-14" width="20" height="28" rx="3" /><path d="M-14 0 H-10 M10 -10 H14 M10 0 H14 M10 10 H14" />${t.reversed === !0 ? x`<path d="M-14 0 H14 M14 10 H5 V-10 H14" />` : x`<path d="M-14 0 H-5 V10 H14 M14 0 H5 V-10 H14" />`}`;
		case "probe_t": return x`<circle r="9" />${Ua(16, 9)}${za("T", n)}`;
		case "transducer_p": return x`<circle r="9" />${Ua(16, 9)}${za("P", n)}`;
		case "thermostat": return x`<rect x="-7" y="-7" width="14" height="14" />${Ua(16, 7)}${za("T", n)}`;
		case "exchanger": {
			let e = t.size ?? 34, n = t.fills;
			return x`${n === void 0 ? S : x`${Ra("left", e, n.left)}${Ra("right", e, n.right)}`}<rect x="-20" y="${-e - 9}" width="40" height="${2 * e + 18}" rx="4" /><path d="M-12 ${-e} V${e} M12 ${-e} V${e}" /><circle cx="-12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="-12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" />`;
		}
		case "compressor": return x`<circle r="14" /><path class="compressor-lines" d="${Ha}" />`;
		case "valve": return x`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "resistor": return x`<rect x="-28" y="-6" width="56" height="12" rx="2" /><path d="M-18 -6 V6 M18 -6 V6" />`;
		case "filter_dryer": return x`<rect x="-14" y="-5" width="28" height="10" rx="5" />`;
		case "expansion_valve": return x`<path d="M-12 -6 V6 L0 0 L12 -6 V6 L0 0 Z" />`;
		case "port": return x`<rect x="-5" y="-6" width="10" height="6" />`;
		case "tank": return x`<rect class="tank-body" data-dhw-tank="internal" x=${-r().internalTank.width / 2} y=${-r().internalTank.height / 2} width=${r().internalTank.width} height=${r().internalTank.height} rx="14" fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />`;
		case "coil": return Va(r());
	}
}
function Ka(e, t = {}) {
	return x`<g class="symbol ${e}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${t.rotation ?? 0})">${Ga(e, t)}</g>`;
}
// src/diagram/cabinet.ts
var qa = o`
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
    ${Sr}
  }
`;
function Ja(e, t) {
	return e === 26 ? t.valve26 === "dhw" ? ["l", "d"] : ["l", "r"] : t.valves2728 === "exchanger" ? ["d", "r"] : ["l", "r"];
}
function Ya(e, t, n, r, i) {
	let { part: a } = e, { circuits: o } = t, s = ja(a, e.state, t.mode), c = nt(a.item), l = xr(br(gr(a.item, n), n), n?.onTap);
	return x`<g class="symbol-group ${s}" data-item=${a.item} data-kind=${a.kind} aria-label=${c} role=${l.role} tabindex=${l.tabindex} @click=${l.click} @keydown=${l.keydown} style=${a.kind === "coil" ? `color: ${eo(t)}` : S}>
    <title>${c}</title>
    <g transform="translate(${a.x} ${a.y})">${Ka(a.kind, {
		rotation: a.rotation,
		size: a.size,
		open: a.kind === "valve3" ? Ja(a.item, o) : void 0,
		reversed: a.kind === "inversion_valve" ? o.valve14 === "reversed" : void 0,
		fills: i,
		arrangement: r
	})}</g>
  </g>`;
}
function Xa(e, t, n) {
	let r = pa(t), i = n.muted ? S : `stroke: ${n.color}`;
	return x`<g class="helix ${n.muted ? "muted" : ""}" data-segment=${e.id} style=${i}>
    ${da(r).map((e) => x`<path class="pipe ${n.muted ? "muted" : ""}" data-half=${e.front ? "front" : "back"} style=${i} stroke-linecap=${e.front ? "round" : "butt"} opacity=${e.front ? S : la} d=${e.d} />`)}
    ${n.animated ? x`<path class="flow ${n.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(n.duration)}s" d=${r.filter((e) => e.front).map((e) => e.d).join(" ")} />` : S}
  </g>`;
}
function Za(e, t, n, r, i) {
	if (e.shape !== void 0) return Xa(e, e.shape, t);
	let a = e.bend === void 0 ? ya(e.points, n, r) : ma(e.points, e.bend);
	return x`<path class="pipe ${t.muted ? "muted" : ""}" data-segment=${e.id} style=${t.muted ? S : `stroke: ${t.color}`} stroke-linecap=${e.roundEnd === !0 ? "round" : S} d=${a} />${t.muted && i !== void 0 && to.has(e.id) ? x`<path class="pipe-inside" data-inside=${e.id} clip-path="url(#${i})" d=${a} />` : S}${t.animated ? x`<path class="flow ${t.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(t.duration)}s" d=${a} />` : S}`;
}
function Qa(e, t, n, r) {
	let i = (e) => e.map((e) => n.get(e)).find((e) => e !== void 0), a = e.reversible === !0 && r === "active_cooling", [o, s] = a ? [e.leaving, e.entering] : [e.entering, e.leaving], c = i(o), l = i(s), u = (c?.muted ?? !0) && (l?.muted ?? !0), d = (e) => u ? j : e?.color ?? "var(--disabled-text-color)", f = e.enters === "top" !== a;
	return {
		id: t,
		y1: +!f,
		y2: +!!f,
		start: d(c),
		end: d(l),
		muted: u
	};
}
var $a = (e) => x`<linearGradient id=${e.id} x1="0" y1=${e.y1} x2="0" y2=${e.y2} data-muted=${e.muted}>
      <stop offset="0" style="stop-color: ${e.start}" />
      <stop offset="1" style="stop-color: ${e.end}" />
    </linearGradient>`;
function eo(e) {
	let t = Ia(e);
	return t === "var(--disabled-text-color)" ? dn : t;
}
var to = /* @__PURE__ */ new Set(["dhw_ext_in", "dhw_ext_out"]);
function no(e, t, n, r = {
	mode: "gradient",
	idPrefix: "ecogeo"
}, i = wr.pipe) {
	let a = 7 * i / wr.pipe, o = ea(e), { cabinet: s } = o, c = sa(e), l = new Set(c.map((e) => e.part.id)), u = new Map(c.map((e) => [e.part.id, Pa(e.part, e.state, t)])), d = [], f = na(e) === "external" ? `${r.idPrefix}-tank-clip` : void 0, p = oa(e).map((e) => {
		let i = r.mode === "gradient" ? e.part.sides : void 0;
		if (i === void 0) return Ya(e, t, n, o);
		let a = {
			left: "none",
			right: "none"
		};
		for (let n of i) {
			let i = Qa(n, `${r.idPrefix}-x${String(e.part.item)}-${n.half}`, u, t.mode);
			d.push(i), a[n.half] = `url(#${i.id})`;
		}
		return Ya(e, t, n, o, a);
	});
	return x`<g class="cabinet">
    <defs>${d.map($a)}${f === void 0 ? S : x`<clipPath id=${f} data-tank-clip><path d=${ii(o)} /></clipPath>`}</defs>
    <rect class="outline" x=${s.x} y=${s.y} width=${s.width} height=${s.height} rx="6" />
    ${c.map((e) => {
		let t = u.get(e.part.id);
		return t === void 0 ? S : Za(e.part, t, xa(o, e.part.id, l), a, f);
	})}
    ${p}
  </g>`;
}
// src/diagram/band-style.ts
var ro = o`
  .band-outline,
  .tank-body {
    stroke-width: max(2.5, var(--outline-width, 2));
  }
`, io = o`
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
    ${Sr}
  }
`;
function ao(e, t) {
	if (na(e) !== "external") return x``;
	let n = ea(e);
	if (n.externalTank === void 0) return x``;
	let { x: r, y: i, width: a, dome: o } = n.externalTank, s = a / 2, c = ii(n), l = `M${String(r)} ${String(i + o)} A${String(s)} ${String(o)} 0 0 0 ${String(r + a)} ${String(i + o)}`, u = xr(br(yr, t), t?.onTap);
	return x`<g class=${e.dhw === "unused" ? "dhw-storage muted" : "dhw-storage"} data-dhw="external" aria-label=${Xe.externalTank} role=${u.role} tabindex=${u.tabindex} @click=${u.click} @keydown=${u.keydown}>
    <title>${Xe.externalTank}</title>
    <path class="tank-body band-outline" data-dhw-tank="external" d=${c} fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />
    <path class="tank-rim" d=${l} />
    <rect class="obstacle" data-obstacle="tank-rim" x=${r} y=${i + o} width=${a} height=${o} fill="none" stroke="none" />
  </g>`;
}
// src/diagram/obstacle.ts
var oo = (e, t) => x`<rect class="obstacle" data-obstacle=${e} x=${t.x} y=${t.y} width=${t.width} height=${t.height} fill="none" stroke="none" />`, so = o`
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
    ${Sr}
  }
`, co = .5;
function lo(e, t, n) {
	let { x: r, y: i, width: a, height: o } = e, s = e.kind === "radiator";
	return x`<rect class="emitter-outline band-outline" x=${r} y=${i} width=${a} height=${o} rx=${N.radius} fill=${s && n ? `url(#${t})` : "none"} fill-opacity=${co} />
    ${s ? x`${e.columns.map((e) => x`<rect class="emitter-column" x=${e.x} y=${e.y} width=${e.width} height=${e.height} rx="4" />`)}${oo("radiator-columns", {
		x: e.columns[0]?.x ?? r,
		y: e.columns[0]?.y ?? i,
		width: (e.columns.at(-1)?.x ?? r) + (e.columns.at(-1)?.width ?? 0) - (e.columns[0]?.x ?? r),
		height: e.columns[0]?.height ?? 0
	})}` : S}`;
}
function uo(e, t, n, r) {
	let i = ea(e), a = i.emitter, o = i.segments.find((e) => e.id === "dg1_sup"), s = i.segments.find((e) => e.id === "dg1_ret");
	if (a === void 0 || o === void 0 || s === void 0) return x``;
	let c = Pa(o, "normal", t), l = Pa(s, "normal", t), u = ca(o, t.circuits), d = c.muted && l.muted, f = `${r.idPrefix}-emitter`, p = a.kind === "radiator", m = xr(br(vr, n), n?.onTap), h = Ze[a.kind];
	return x`<g class="emitter${u ? "" : " muted"}" data-emitter="body" data-emitter-kind=${a.kind} aria-label=${h} role=${m.role} tabindex=${m.tabindex} @click=${m.click} @keydown=${m.keydown}>
    <title>${h}</title>
    ${p ? x`<defs>
      <linearGradient id=${f} gradientUnits="userSpaceOnUse" x1="0" y1=${a.y} x2="0" y2=${a.y + a.height} data-muted=${d}>
        <stop offset="0" style="stop-color: ${d ? j : c.color}" />
        <stop offset="1" style="stop-color: ${d ? j : l.color}" />
      </linearGradient>
    </defs>` : S}
    <rect class="emitter-hit" x=${a.x} y=${a.y} width=${a.width} height=${a.height} fill="transparent" stroke="none" />
    ${lo(a, f, r.mode === "gradient")}
  </g>`;
}
// src/lib/format.ts
var fo = "−";
function po(e) {
	let t = e?.locale;
	return typeof t == "object" && t ? t : e?.language === void 0 ? {} : { language: e.language };
}
function mo(e) {
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
var ho = /* @__PURE__ */ new Map();
function go(e, t, n) {
	let r = mo(e), i = n && e.number_format !== "none", a = `${r?.join(",") ?? ""}|${String(t)}|${String(i)}`, o = ho.get(a);
	return o === void 0 && (o = new Intl.NumberFormat(r, {
		minimumFractionDigits: t,
		maximumFractionDigits: t,
		useGrouping: i
	}), ho.set(a, o)), o;
}
function _o(e, t, n = 0, r = !0) {
	if (!Number.isFinite(e)) return "–";
	let i = Number.isFinite(n) ? Math.min(20, Math.max(0, Math.trunc(n))) : 0, a = Math.abs(e) < .5 / 10 ** i ? 0 : e;
	return go(t ?? {}, i, r).formatToParts(a).map((e) => e.type === "minusSign" ? fo : e.value).join("");
}
// src/calc/display.ts
function vo(e) {
	if (typeof e != "object" || !e) return;
	let t = e.display_precision;
	return typeof t == "number" && Number.isInteger(t) && t >= 0 && t <= 20 ? t : void 0;
}
var yo = /* @__PURE__ */ new Set([
	"production.pump",
	"brine.pump",
	"source.fan_speed"
]), bo = (e, t) => t ?? e.decimals ?? 0;
function xo(e, t) {
	let n = typeof t == "string" ? t.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase() : "";
	return n === (e.unit ?? "").toLowerCase() || e.quantity === "difference" && n === "°c";
}
function So(e) {
	if (/e/i.test(e ?? "")) return 0;
	let t = /^\s*[-+]?\d*\.(\d+)/.exec(e ?? "");
	return Math.min(20, t?.[1]?.length ?? 0);
}
function Co(e, t) {
	let n = e === void 0 ? void 0 : t.states?.[e]?.attributes.unit_of_measurement;
	return typeof n == "string" && n.trim() !== "" ? n.trim() : void 0;
}
function wo(e, t, n, r) {
	if (typeof t == "boolean") return et[t ? "on" : "off"];
	let i = Dt.get(e);
	if (i === void 0 || t === void 0 || !Number.isFinite(t)) return;
	let a = Co(n, r), o = xo(i, a), s = i.quantity !== void 0 && yt(i.quantity, a), c = i.unit !== void 0 && a !== void 0 && !o && !s, l = n === void 0 || !(o || c) ? void 0 : vo(r.entities?.[n]), u = yo.has(e) && !c ? 0 : c && l === void 0 ? So(n === void 0 ? void 0 : r.states?.[n]?.state) : bo(i, l), d = _o(t, r.locale, u, !1), f = c ? a : i.unit;
	return f === void 0 ? d : `${d} ${f}`;
}
// src/diagram/labels.ts
var To = o`
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
    font-size: ${a(jr("horizontal"))};
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
    font-size: ${a(jr("vertical"))};
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
`, Eo = /* @__PURE__ */ new Set();
function Do(e, t, n, r, i = Eo) {
	return ea(e).labels.specs.flatMap((a) => {
		if (i.has(a.role) || ia(a, e) === "hidden" || e.dhw === "unused" && a.dhw !== void 0) return [];
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
		}, u = t[a.role], d = wo(a.role, typeof u == "number" || typeof u == "boolean" ? u : void 0, o, r);
		return [{
			...l,
			text: d ?? "–",
			missing: d === void 0
		}];
	});
}
function Oo(e, t, n, r) {
	let { notPresent: i, absent: a } = r, o = (e, n, r, a) => n.every((e) => i.has(e)) ? void 0 : {
		id: e,
		...r === void 0 ? {} : { caption: r },
		text: a ?? "–",
		missing: a === void 0,
		entityId: t[n[0]]
	}, s = (r) => {
		let i = e[r];
		return wo(r, typeof i == "number" || typeof i == "boolean" ? i : void 0, t[r], n);
	}, c = (e, t, n) => o(e, [t], n, s(t)), l = (e, t, n, r) => c(e, a.has(t) ? n : t, r), u = a.has("unit.system_cop") ? "unit.cop" : "unit.system_cop", d = o("cop", [u], r.mode === "active_cooling" ? $e.eer : $e.cop, e[u] === 0 ? void 0 : s(u)), { mode: f } = r, p = (f === "heating" || f === "active_cooling") && r.features.htr === !0 && (r.dhw === "external" || r.dhw === "internal") && !a.has("htr.power") ? c("htr_power", "htr.power", $e.htr) : void 0, m = f === "heating" ? [l("dg1_power", "heating.power", "heating.capacity", $e.dg1), p] : f === "dhw" ? [l("dhw_power", "dhw.power", "heating.capacity", $e.dhw)] : f === "active_cooling" ? [c("cooling_power", "cooling.capacity", $e.cooling), p] : [];
	return [
		r.source === "ground" ? c("outside_temperature", "source.outside_temperature", $e.outside) : void 0,
		d,
		...m
	].filter((e) => e !== void 0);
}
var ko = (e, t) => ({
	left: `${String(e.x / t.width * 100)}%`,
	top: `${String(e.y / t.height * 100)}%`
});
function Ao(e, t, n, r) {
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
function jo(e, t, n) {
	return b`${e.map((e) => {
		let { left: r, top: i } = ko(e, n);
		return b`<span
      class="label ${e.align}${e.bare === !0 ? " bare" : ""}${e.rotate === void 0 ? "" : " rotated"}"
      data-label=${e.id}
      data-role=${e.role}
      data-label-item=${e.item ?? S}
      style="left: ${r}; top: ${i}"
      >${e.caption === void 0 ? S : b`<span class="caption">${e.caption}</span>`}${Ao(e.entityId, e.text, e.missing, t)}</span
    >`;
	})}`;
}
function Mo(e, t) {
	return b`${e.map((e) => b`<span class="footer-item" data-footer=${e.id}
        >${e.caption === void 0 ? S : b`<span class="caption">${e.caption}</span>`}${Ao(e.entityId, e.text, e.missing, t)}</span
      >`)}`;
}
// node_modules/@lit/reactive-element/decorators/property.js
var No = {
	attribute: !0,
	type: String,
	converter: ee,
	reflect: !1,
	hasChanged: te
}, Po = (e = No, t, n) => {
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
function Fo(e) {
	return (t, n) => typeof n == "object" ? Po(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function Io(e) {
	return Fo({
		...e,
		state: !0,
		attribute: !1
	});
}
// src/lib/define.ts
function Lo(e, t) {
	let n = customElements.get(e);
	return n === void 0 ? (customElements.define(e, t), !0) : (n !== t && console.warn(`${e} is already defined by another copy of the module; that copy stays in use.`), !1);
}
// src/config/keywords.ts
var X = (e) => e.split(/\s+/).filter((e) => e !== ""), Z = "temp temperature temperatuur temperatura temperatur", Ro = "pressure druk presion druck", zo = "pump pomp bomba pumpe circulator", Bo = "heating verwarming heizung heizkreis calefaccion cv", Vo = `production productie produccion produktion ${Bo}`, Ho = "brine glycol source bron brijn captacion salmuera sole", Uo = "dhw sanitary sanitaria tapwater warmwater warmwasser acs caliente domestic hotwater boiler", Wo = "demand vraag demanda anforderung bedarf request", Go = "suction zuig saug ansaug succion aspiracion niederdruck lagedruk", Ko = "discharge pers druckgas heissgas descarga hochdruck hogedruk", qo = "capacity vermogen capacidad kapazitat leistung power", Jo = "valve ventiel valvula ventil position stand posicion stellung", Yo = "compressor compresor kompressor verdichter", Xo = "condens condensation condensatie condensacion kondensation kondens", Zo = "evaporat evaporation evaporacion verdamp verdampfung", Qo = `${Bo} dg verwarmen`, $o = "setpoint set target desired gewenst ingesteld soll wunsch consigna objetivo streef", es = "superheat oververhitting oververhit sobrecalentamiento ueberhitzung uberhitzung", ts = "on off aan uit onoff encendido apagado ein aus", ns = "alarm alarma storing stoerung storung fehler error fault malfunction", rs = "htr recovery recuperacion recuperatie rueckgewinnung", is = "power vermogen potencia leistung", as = "electric elektr", os = [
	as,
	Uo,
	rs
].join(" "), ss = [as, rs].join(" "), cs = [as, Uo].join(" "), ls = "system systeem sistema", us = "cop scop coefficient rendimiento rendement wirkungsgrad efficiency", ds = {
	"production.outlet_temperature": {
		subject: X(Vo),
		role: X(Z)
	},
	"production.return_temperature": {
		subject: X(Vo),
		role: X(Z)
	},
	"production.pressure": {
		subject: X(Vo),
		role: X(Ro)
	},
	"production.pump": {
		subject: X(Vo),
		role: X(zo)
	},
	"brine.outlet_temperature": {
		subject: X(Ho),
		role: X(Z)
	},
	"brine.inlet_temperature": {
		subject: X(Ho),
		role: X(Z)
	},
	"brine.pressure": {
		subject: X(Ho),
		role: X(Ro)
	},
	"brine.pump": {
		subject: X(Ho),
		role: X(zo)
	},
	"compressor.speed": {
		subject: X(Yo),
		role: X("rpm speed toerental toeren velocidad drehzahl frequency frequentie frecuencia frequenz hz running draait actief active activo laufend")
	},
	"compressor.percentage": {
		subject: X(Yo),
		role: X("percentage porcentaje prozent load belasting carga auslastung capaciteit")
	},
	"compressor.power": {
		subject: X("power vermogen potencia leistung electrical elektrisch electrico"),
		role: X("consumption opgenomen verbruik consumo verbrauch aufnahme")
	},
	"compressor.suction_temperature": {
		subject: X(Go),
		role: X(Z)
	},
	"compressor.discharge_temperature": {
		subject: X(Ko),
		role: X(Z)
	},
	"compressor.suction_pressure": {
		subject: X(Go),
		role: X(Ro)
	},
	"compressor.discharge_pressure": {
		subject: X(Ko),
		role: X(Ro)
	},
	"compressor.mode": {
		subject: X(Yo),
		role: X("mode modus modo operation operating bedrijf funcionamiento betriebsart")
	},
	"refrigerant.condensation_temperature": {
		subject: X(Xo),
		role: X(Z)
	},
	"refrigerant.evaporation_temperature": {
		subject: X(Zo),
		role: X(Z)
	},
	"refrigerant.superheat": {
		subject: X(es),
		role: X(es)
	},
	"refrigerant.expansion_valve": {
		subject: X("expansion expansie expansionsventil expans"),
		role: X(Jo)
	},
	"heating.capacity": {
		subject: X(Xo),
		role: X(qo)
	},
	"cooling.capacity": {
		subject: X(Zo),
		role: X(qo)
	},
	"heating.demand": {
		subject: X(Qo),
		role: X(Wo)
	},
	"heating.setpoint": {
		subject: X(Qo),
		role: X(`${Z} ${$o}`)
	},
	"dhw.temperature": {
		subject: X(Uo),
		role: X(Z)
	},
	"dhw.setpoint": {
		subject: X(Uo),
		role: X(`${Z} ${$o}`)
	},
	"dhw.start_delta": {
		subject: X(Uo),
		role: X("delta difference verschil diferencia unterschied start starten arranque")
	},
	"dhw.demand": {
		subject: X(Uo),
		role: X(Wo)
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
		subject: X(`${ts} heatpump warmtepomp`),
		role: X(`${ts} power switch schakelaar`)
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
		subject: X(ns),
		role: X(ns)
	},
	"unit.connection": {
		subject: X("connection connected connectivity conexion verbinding verbindung online communication"),
		role: X("connection connected connectivity conexion verbinding verbindung status online communication")
	},
	"unit.cop": {
		subject: X(us),
		role: X(us),
		exclude: X(ls)
	},
	"heating.power": {
		subject: X(Qo),
		role: X(is),
		exclude: X(os)
	},
	"dhw.power": {
		subject: X(Uo),
		role: X(is),
		exclude: X(ss)
	},
	"htr.active": {
		subject: X(rs),
		role: X("active actief activo aktiv")
	},
	"htr.power": {
		subject: X(rs),
		role: X(is),
		exclude: X(cs)
	},
	"unit.system_cop": {
		subject: X(ls),
		role: X(us)
	}
}, fs = {
	in: X(`in inlet return retour retorno inflow terug terugvoer terugloop inlaat entrada eintritt ruecklauf rucklauf ingaand eingang ${Go}`),
	out: X(`out outlet supply aanvoer uitlaat salida impulsion austritt vorlauf uitgaand ausgang uit ${Ko}`)
}, ps = X($o), ms = /* @__PURE__ */ new Set(["heating.setpoint", "dhw.setpoint"]), hs = X("flow"), gs = {
	exact: 100,
	suffix: 90,
	subject: 30,
	role: 20,
	direction: 10,
	strong: 40,
	tie: 5
}, _s = (e) => e.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replaceAll("ß", "ss"), vs = (e) => _s(e).split(/[^a-z]+/).filter((e) => e !== ""), ys = (e) => {
	let t = e.indexOf(".");
	return [e.slice(0, t), e.slice(t + 1)];
};
function bs(e, t, n, r) {
	let i = n[r]?.name_by_user ?? n[r]?.name ?? "";
	return Object.values(t).filter((e) => e?.device_id === r).flatMap((t) => {
		let n = e[t.entity_id];
		if (n === void 0) return [];
		let [r, a] = ys(t.entity_id), o = n.attributes.friendly_name, s = n.attributes.unit_of_measurement, c = n.attributes.device_class;
		return [{
			entityId: t.entity_id,
			domain: r,
			objectId: a,
			unit: typeof s == "string" ? s : void 0,
			deviceClass: typeof c == "string" ? c : void 0,
			names: [...typeof o == "string" ? [xs(o, i)] : [], ...typeof t.name == "string" ? [t.name] : []]
		}];
	});
}
function xs(e, t) {
	let n = _s(t).trim(), r = _s(e);
	if (n === "" || !r.startsWith(n)) return e;
	let i = r.slice(n.length);
	return i === "" || /^[^a-z0-9]/.test(i) ? i : e;
}
function Ss(e) {
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
function Cs(e) {
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
	return n === void 0 ? Ss(e.map((e) => e.objectId)) : `${n[0]}_`;
}
var ws = (e) => (e ?? "").trim().toLowerCase(), Ts = {
	"compressor.speed": ["rpm", "hz"],
	"production.pump": ["%", "rpm"],
	"brine.pump": ["%", "rpm"],
	"source.fan_speed": ["%", "rpm"]
}, Es = {
	temperature: ["temperature"],
	difference: ["temperature"],
	power: ["power"],
	pressure: ["pressure", "atmospheric_pressure"]
};
function Ds(e, t) {
	if (Tt.includes(t.domain)) return !0;
	if (e.kind !== "number") return ws(t.unit) === "" && (t.deviceClass === void 0 || t.deviceClass === "enum");
	if ("quantity" in e && e.quantity !== void 0) {
		if (!yt(e.quantity, t.unit)) return !1;
		let n = Es[e.quantity];
		return t.deviceClass === void 0 || n === void 0 || n.includes(t.deviceClass);
	}
	let n = ws(t.unit), r = Ts[e.path] ?? ("unit" in e && e.unit !== void 0 ? [ws(e.unit)] : []);
	return r.length === 0 ? n === "" : r.includes(n);
}
function Os(e, t) {
	return e.accepts.includes(t.domain) && Ds(e, t);
}
var ks = (e, t) => e.some((e) => t.some((t) => e.length >= 4 ? t.includes(e) : t === e));
function As(e, t, n) {
	if (t.entityId === At(e, n.replace(/_$/, "")) && n !== "") return gs.exact;
	if ((e.kind !== "binary" || Tt.includes(t.domain)) && (t.objectId === e.suffix || t.objectId.endsWith(`_${e.suffix}`))) return gs.suffix;
	let r = [...vs(t.objectId.startsWith(n) ? t.objectId.slice(n.length) : t.objectId), ...t.names.flatMap(vs)];
	if (ks(ps, r) !== ms.has(e.path)) return 0;
	let i = ds[e.path];
	if (i.exclude !== void 0 && ks(i.exclude, r)) return 0;
	let a = 0;
	if (ks(i.subject, r) && (a += gs.subject), ks(i.role, r) && (a += gs.role), e.direction !== void 0) {
		if ((e.direction !== "out" || !ks(hs, r) || ks(fs.in, r)) && !ks(fs[e.direction], r)) return 0;
		a += gs.direction;
	}
	return a;
}
function js(e) {
	return typeof e != "object" || !e || Array.isArray(e) ? {} : Object.fromEntries(Object.entries(e).map(([e, t]) => [e, typeof t == "object" && t && !Array.isArray(t) ? js(t) : t]));
}
function Ms(e) {
	let { states: t, config: n } = e, r = bs(t, e.entities, e.devices, e.deviceId), i = Cs(r), a = ur(n, Bn(n)), o = /* @__PURE__ */ new Set(), s = [];
	for (let e of k) {
		if (zn(A(n, `entities.${e.path}`))) continue;
		let r = a[e.path];
		r !== void 0 && t[r] !== void 0 ? o.add(r) : s.push(e);
	}
	let c = s.flatMap((e, t) => r.filter((t) => !o.has(t.entityId) && Os(e, t)).map((n) => ({
		role: e,
		order: t,
		candidate: n,
		score: As(e, n, i)
	}))).filter((e) => e.score > 0).sort((e, t) => t.score - e.score || e.order - t.order || (e.candidate.entityId < t.candidate.entityId ? -1 : 1)), l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set();
	for (let e of c) {
		let t = e.role.path;
		if (e.score < gs.strong) break;
		if (l.has(t) || u.has(t) || o.has(e.candidate.entityId)) continue;
		let [n, r] = c.filter((t) => t.role === e.role && !o.has(t.candidate.entityId));
		n !== void 0 && r !== void 0 && n.score - r.score <= gs.tie ? u.add(t) : (l.set(t, e.candidate.entityId), o.add(e.candidate.entityId));
	}
	let d = js(A(n, "entities"));
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
var Ns = E.roleGroups, Ps = E.roles, Fs = {
	"heating.power": E.heatPower,
	"dhw.power": E.heatPower,
	"htr.power": E.heatPower
};
function Is(e) {
	let t = e.split(".")[1] ?? "";
	return Fs[e] ?? Ps[t] ?? t;
}
function Ls(e) {
	let [t = ""] = e.split(".");
	return `${Ns[t] ?? t}: ${Is(e)}`;
}
// src/editor/binding-check.ts
function Rs(e, t) {
	if (t === void 0 || Object.keys(t).length === 0) return [];
	let n = Bn(e), r = ur(e, n), i = dr(e, n);
	return k.flatMap((n) => {
		let a = r[n.path];
		if (a === void 0 || zn(A(e, `entities.${n.path}`))) return [];
		let o = Ls(n.path), s = t[a];
		if (s === void 0) {
			let e = n.path;
			return i.has(e) && Ot.includes(e) ? [] : [E.suggest.unknown(o, a)];
		}
		let c = a.slice(0, a.indexOf("."));
		if (!n.accepts.includes(c)) return [E.suggest.kind(o, a)];
		if (s.state === "unavailable") return [];
		let l = s.attributes.unit_of_measurement, u = s.attributes.device_class;
		return Ds(n, {
			domain: c,
			unit: typeof l == "string" ? l : void 0,
			deviceClass: typeof u == "string" ? u : void 0
		}) ? [] : [E.suggest.unit(o, a)];
	});
}
// src/editor/fields.ts
var zs = (e, t, { advanced: n = !1 } = {}) => ({
	name: e,
	selector: { entity: { filter: { domain: t } } },
	...n ? { advanced: n } : {}
});
function Bs(e) {
	let t = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(e.trim())?.[1];
	if (t === void 0) return;
	let n = t.length === 3 ? t.replace(/./g, "$&$&") : t, r = (e) => Number.parseInt(n.slice(e, e + 2), 16);
	return [
		r(0),
		r(2),
		r(4)
	];
}
var Vs = (e) => Array.isArray(e) && e.length === 3 && e.every((e) => typeof e == "number" && Number.isFinite(e)), Hs = (e) => "#" + e.map((e) => Math.min(255, Math.max(0, Math.round(e))).toString(16).padStart(2, "0")).join(""), Us = (e) => ({
	name: e,
	selector: { color_rgb: {} }
}), Ws = (e, t, n, r = t.default) => ({
	name: e,
	default: r,
	selector: { select: {
		mode: "dropdown",
		options: t.choices.map((e) => ({
			value: e,
			label: n[e] ?? e
		}))
	} }
}), Gs = "#9e9e9e", Ks = /^colors_(\d+)_(temperature|color)$/;
function qs(e) {
	let t = Ks.exec(e);
	return t?.[1] === void 0 ? void 0 : {
		index: Number(t[1]),
		part: t[2]
	};
}
function Js(e) {
	let t = A(e, "colors");
	return Array.isArray(t) ? t.map((e) => {
		let { temperature: t, color: n } = typeof e == "object" && e ? e : {};
		return {
			...typeof t == "number" ? { temperature: t } : {},
			...typeof n == "string" ? { color: n } : {}
		};
	}) : ln.map((e) => ({ ...e }));
}
var Ys = Bs("#9e9e9e") ?? [
	158,
	158,
	158
], Xs = () => ({ color: Ys });
function Zs(e) {
	let t = [...e];
	for (; t.length >= 2 && t[t.length - 1]?.temperature === void 0 && t[t.length - 2]?.temperature === void 0;) t.pop();
	return t.at(-1)?.temperature === void 0 && t.length > 0 ? t : [...t, Xs()];
}
function Qs(e) {
	return Zs(Js(e).map(({ temperature: e, color: t }) => {
		let n = t === void 0 ? void 0 : Bs(t);
		return {
			...e === void 0 ? {} : { temperature: e },
			...n === void 0 ? {} : { color: n },
			...t === void 0 ? {} : { orig: t }
		};
	}));
}
function $s(e) {
	return Array.from({ length: e }, (e, t) => t).flatMap((e) => [{
		name: `colors_${String(e)}_temperature`,
		selector: { number: {
			step: "any",
			mode: "box",
			unit_of_measurement: w.celsius
		} }
	}, Us(`colors_${String(e)}_color`)]);
}
function ec(e) {
	let t = {};
	return e.forEach(({ temperature: e, color: n }, r) => {
		e !== void 0 && (t[`colors_${String(r)}_temperature`] = e), n !== void 0 && (t[`colors_${String(r)}_color`] = [...n]);
	}), t;
}
function tc(e) {
	let t = /* @__PURE__ */ new Map(), n = {};
	for (let [r, i] of Object.entries(e)) {
		let e = qs(r);
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
var nc = (e, t) => e.every((e, n) => e === t[n]);
function rc(e) {
	let t = typeof e == "string" && e.trim() !== "" ? Number(e) : e;
	return typeof t == "number" && Number.isFinite(t) ? t : void 0;
}
function ic(e, t) {
	let n = t === void 0 ? void 0 : Bs(t);
	return Vs(e) ? t !== void 0 && n && nc(n, e) ? t : Hs(e) : t !== void 0 && n === void 0 ? t : Gs;
}
function ac(e, t) {
	let n = Math.max(e.length, ...[...t.keys()].map((e) => e + 1));
	return Zs(Array.from({ length: n }, (n, r) => {
		let i = t.get(r), a = rc(i?.temperature), o = i !== void 0 && Vs(i.color) ? i.color : void 0, s = e[r]?.orig;
		return {
			...a === void 0 ? {} : { temperature: a },
			...o === void 0 ? {} : { color: o },
			...s === void 0 ? {} : { orig: s }
		};
	}));
}
var oc = (e, t) => e.length === t.length && e.every((e, n) => e.temperature === t[n]?.temperature && e.color === t[n]?.color), sc = (e) => e.length === ln.length && e.every((e, t) => {
	let n = ln[t];
	return e.temperature === n?.temperature && e.color.toLowerCase() === n.color;
});
function cc(e, t) {
	let n = e.flatMap(({ temperature: e, color: t, orig: n }) => e === void 0 ? [] : [{
		temperature: e,
		color: ic(t, n)
	}]).sort((e, t) => e.temperature - t.temperature), r = A(t, "colors");
	return Array.isArray(r) && oc(n, Js(t)) ? "keep" : sc(n) ? r !== void 0 && !Array.isArray(r) ? "keep" : void 0 : n;
}
function lc(e, t) {
	return t === void 0 ? Object.fromEntries(Object.entries(e).filter(([e]) => e !== "colors")) : {
		...e,
		colors: t
	};
}
// src/editor/ecogeo-schema.ts
var uc = [
	"features",
	"entities",
	"states"
], dc = ["entities"], fc = "_device", pc = "_not_present", mc = "default", hc = [
	[mc, void 0],
	["true", !0],
	["false", !1],
	["unused", "unused"]
];
function gc(e, t) {
	let { on: n, off: r, unused: i, presetOn: a, presetOff: o, presetUnused: s, variantDefault: c } = E.featureChoices;
	return {
		name: e,
		default: mc,
		coded: hc,
		selector: { select: {
			mode: "dropdown",
			options: [
				{
					value: mc,
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
var _c = [
	"passive_cooling",
	"active_cooling",
	"htr",
	"backup_heater"
];
function vc() {
	return {
		name: "variant",
		default: "4",
		coded: bn.map((e) => [String(e), e]),
		selector: { select: {
			mode: "dropdown",
			options: bn.map((e) => ({
				value: String(e),
				label: E.choices.variant[e]
			}))
		} }
	};
}
var yc = (e) => Tn.filter((t) => t === "unused" || t === Fn(e) || t === "none" && e === "B");
function bc(e, t) {
	let n = A(e, "dhw"), r = yc(t), i = Tn.filter((e) => r.includes(e) || e === n);
	return Ws("dhw", {
		...kn,
		choices: i
	}, E.choices.dhw, Fn(t));
}
function xc(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of k) {
		if (zn(A(e, `entities.${n.path}`))) continue;
		let [r = "", i = ""] = n.path.split(".");
		t.set(r, [...t.get(r) ?? [], {
			...zs(i, n.accepts, { advanced: !0 }),
			label: Is(n.path)
		}]);
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
var Sc = () => ({
	name: pc,
	advanced: !0,
	selector: { select: {
		multiple: !0,
		mode: "dropdown",
		options: k.map((e) => ({
			value: e.path,
			label: Ls(e.path)
		}))
	} }
}), Cc = {
	off: "unit.on_off",
	defrost: "compressor.mode"
};
function wc(e, t) {
	let n = ur(e, Bn(e)), r = (e) => {
		let r = n[Cc[e]], i = r === void 0 ? void 0 : t?.[r]?.attributes.options;
		return Array.isArray(i) ? i.filter((e) => typeof e == "string") : [];
	};
	return {
		off: r("off"),
		defrost: r("defrost")
	};
}
function Tc(e) {
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
function Ec(e, t = Qs(e).length, n) {
	let r = xn(Vn(e)), i = A(e, "model") === Cn[1] ? Cn[1] : Cn[0];
	return [
		{
			type: "expandable",
			name: "unit",
			flatten: !0,
			schema: [
				Ws("model", Dn, E.choices.model),
				vc(),
				Ws("source", On, E.choices.source),
				bc(e, i),
				Ws("emitter", An, E.choices.emitter)
			]
		},
		{
			type: "expandable",
			name: "entity_prefix",
			flatten: !0,
			schema: [{
				name: fc,
				selector: { device: {} }
			}, {
				name: "prefix",
				selector: { text: {} }
			}]
		},
		{
			type: "expandable",
			name: "features",
			schema: _c.map((e) => gc(e, r[e]))
		},
		{
			type: "expandable",
			name: "appearance",
			flatten: !0,
			schema: [
				Ws("exchanger_fill", jn, E.choices.exchanger_fill),
				Ws("layout", Mn, E.choices.layout),
				...$s(t)
			]
		},
		xc(e),
		Sc(),
		Tc(wc(e, n))
	];
}
// src/editor/schema.ts
function Dc(e) {
	return "type" in e;
}
function Oc(e) {
	let { advanced: t, ...n } = e;
	return n;
}
function kc(e, t) {
	return e.flatMap((e) => {
		if (!Dc(e)) return t || e.advanced !== !0 ? [Oc(e)] : [];
		let n = kc(e.schema, t);
		return n.length > 0 ? [{
			...e,
			schema: n
		}] : [];
	});
}
function Q(e, t = "") {
	return e.flatMap((e) => Dc(e) ? Q(e.schema, e.flatten ? t : `${t}${e.name}.`) : [{
		field: e,
		path: `${t}${e.name}`
	}]);
}
function Ac(e, t) {
	return kc(e, t);
}
function jc(e, t) {
	if (e == null || e === "") return !1;
	if (t.default === void 0) return !0;
	if (typeof t.default == "number") {
		let n = typeof e == "number" ? e : typeof e == "string" ? ut(e) : void 0;
		if (n !== void 0) return n !== t.default;
	}
	return Mc(e) !== Mc(t.default);
}
function Mc(e) {
	return (typeof e == "string" || typeof e == "number" || typeof e == "boolean" ? String(e) : JSON.stringify(e)).toLowerCase();
}
function Nc(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function Pc(e, t, n, r, i = "") {
	let [a, ...o] = t.split("."), s = e, { [a]: c, ...l } = s;
	if (o.length === 0) return n === void 0 ? l : Object.hasOwn(s, a) ? {
		...s,
		[a]: n
	} : {
		...l,
		[a]: n
	};
	let u = Pc(Nc(c) ? c : {}, o.join("."), n, r, `${i}${a}.`), d = r !== void 0 && A(r, `${i}${a}`) !== void 0;
	return n === void 0 && Object.keys(u).length === 0 && !d ? l : {
		...s,
		[a]: u
	};
}
function Fc(e, t, n = /* @__PURE__ */ new Set()) {
	return Q(e).reduce((e, { field: r, path: i }) => r.default !== void 0 && A(t, i) === void 0 && !n.has(i) ? Pc(e, i, r.default) : e, t);
}
function Ic(e, t, n) {
	return Q(e).map(({ path: e }) => e).filter((e) => A(t, e) !== void 0 && A(n, e) === void 0);
}
function Lc(e) {
	if (!Nc(e)) return e;
	let t = Object.entries(e).filter(([, e]) => e !== void 0).map(([e, t]) => [e, Lc(t)]);
	return t.length !== Object.keys(e).length || t.some(([t, n]) => n !== e[t]) ? Object.fromEntries(t) : e;
}
function Rc(e, t) {
	return Q(e).reduce((e, { field: n, path: r }) => ("text" in n.selector || "entity" in n.selector) && A(e, r) === "" ? Pc(e, r, void 0, t) : e, t);
}
function zc(e, t) {
	return Q(e).reduce((e, { field: t, path: n }) => {
		let r = A(e, n), i = t.coded?.find(([, e]) => e !== void 0 && e === r);
		return i === void 0 ? e : Pc(e, n, i[0]);
	}, t);
}
function Bc(e, t, n) {
	return Q(e).reduce((e, { field: t, path: r }) => {
		let i = A(e, r), a = t.coded?.find(([e]) => e === i);
		return a === void 0 ? e : Pc(e, r, a[1], n);
	}, t);
}
function Vc(e, t, n, r = []) {
	let i = (e) => Nc(e) && Object.keys(e).length === 0;
	return Object.fromEntries(Object.entries(e).flatMap(([e, a]) => {
		if (!n.includes(e) || !Nc(a)) return [[e, a]];
		let o = t[e], s = r.includes(e) ? Object.fromEntries(Object.entries(a).filter(([e, t]) => !i(t) || Nc(o) && i(o[e]))) : a;
		return Object.keys(s).length > 0 || i(o) ? [[e, s]] : [];
	}));
}
function Hc(e, t, n) {
	return Q(e).reduce((e, { field: n, path: r }) => n.default !== void 0 && A(t, r) === void 0 && A(e, r) !== void 0 && !jc(A(e, r), n) ? Pc(e, r, void 0, t) : e, n);
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/decorate.js
function Uc(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/editor/ecogeo-card-editor.ts
var Wc = "ecogeo-card-editor", Gc = [{
	name: "advanced",
	selector: { boolean: {} }
}], Kc = () => E.advanced, qc = E.sections, Jc = E.fields, Yc = E.roles;
function Xc(e) {
	if (Dc(e)) return e.title ?? qc[e.name] ?? e.name;
	let t = qs(e.name);
	return t === void 0 ? e.label === void 0 ? Jc[e.name] ?? Yc[e.name] ?? e.name : e.label : E.colorRow[t.part](t.index + 1);
}
var Zc = (e) => Object.hasOwn(e, "entities") || Object.hasOwn(e, "states"), Qc = (e) => Object.hasOwn(e, "entities"), $c = [fc, pc];
function el(e, t) {
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
function tl(e, t, n) {
	let r = e;
	for (let e of Xn(n)) t.has(e) || (r = Pc(r, `entities.${e}`, void 0, n));
	for (let e of t) r = Pc(r, `entities.${e}`, "none", n);
	return r;
}
var nl = class extends Ue {
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
		super(), this.schemaFor = Ec, this._switch = { advanced: !1 }, this._optionsKey = "", this._formDefined = customElements.get("ha-form") !== void 0, this._schema = [], this._formSchema = [], this._shown = {}, this._draft = [], this._draftBuilt = !1, this._emptied = /* @__PURE__ */ new Set(), this._toggleAdvanced = (e) => {
			e.stopPropagation(), this._switch = { advanced: e.detail.value.advanced === !0 };
		}, this._configChanged = (e) => {
			e.stopPropagation();
			let t = this._config ?? {}, { [fc]: n, [pc]: r, ...i } = e.detail.value, a = this._has(fc), o = typeof n == "string" && n !== "" ? n : void 0;
			if (a && o !== this._device) {
				this._device = o, this._report = void 0;
				return;
			}
			this._report = void 0;
			let s = this._has(pc), c = a || s ? i : e.detail.value, l = this._hasColorRows, u = l ? tc(c) : void 0, d = Lc(Rc(this._schema, u?.rest ?? c)), f = l ? tc(this._shown).rest : this._shown, p = (e) => {
				let t = A(d, e);
				return e.startsWith("states.") && Array.isArray(t) && t.length === 0;
			}, m = [...Ic(this._schema, f, d), ...Q(this._schema).map(({ path: e }) => e).filter((e) => p(e) && A(f, e) !== void 0)].filter((e) => !$c.includes(e));
			this._emptied = new Set([...this._emptied, ...m].filter((e) => A(d, e) === void 0 || p(e)));
			let h = Bc(this._schema, d, t), g = s && (Array.isArray(r) || Object.hasOwn(e.detail.value, "_not_present")) ? tl(h, new Set(Array.isArray(r) ? r.filter((e) => typeof e == "string") : []), t) : h, _ = Vc(el(Hc(this._schema, t, g), t), t, uc, dc);
			u && (this._draft = ac(this._draft, u.rows));
			let v = u ? cc(this._draft, t) : "keep", y = v === "keep" ? _ : lc(_, v);
			this._colorsSeen = y.colors, this._config = y, this._refreshSchema(y), this.dispatchEvent(new CustomEvent("config-changed", {
				detail: { config: y },
				bubbles: !0,
				composed: !0
			}));
		}, this._suggest = () => {
			let e = this._pickDevice(), t = this.hass;
			if (e === void 0 || t === void 0 || this._config === void 0) return;
			let n = this._config, { entities: r, report: i } = Ms({
				states: t.states,
				entities: t.entities ?? {},
				devices: t.devices ?? {},
				deviceId: e,
				config: n
			});
			this._switch = { advanced: !0 }, this._report = {
				filled: i.filled.length,
				empty: i.empty.map(Ls)
			};
			let a = Object.keys(r).length === 0 && !Qc(n) ? n : {
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
		let n = this._config !== void 0 && Zc(this._config);
		Zc(e) && !n && !this._switch.advanced && (this._switch = { advanced: !0 }), this._draftBuilt && JSON.stringify(e.colors) === JSON.stringify(this._colorsSeen) || (this._draft = Qs(e), this._colorsSeen = e.colors, this._draftBuilt = !0), this._config = e, this._refreshSchema(e);
	}
	_refreshSchema(e) {
		let t = this.schemaFor(e, this._draft.length, this.hass?.states);
		this._optionsKey = JSON.stringify(wc(e, this.hass?.states)), JSON.stringify(t) !== JSON.stringify(this._schema) && (this._schema = t, this._formSchema = Ac(t, this._switch.advanced));
	}
	willUpdate(e) {
		(e.has("schemaFor") && this._config || e.has("hass") && this._config && JSON.stringify(wc(this._config, this.hass?.states)) !== this._optionsKey) && this._refreshSchema(this._config), e.has("_switch") && (this._formSchema = Ac(this._schema, this._switch.advanced)), this._config && (e.has("_config") || e.has("schemaFor") || e.has("_device")) && (this._shown = {
			...zc(this._schema, Fc(this._schema, this._config, this._emptied)),
			...this._hasColorRows ? ec(this._draft) : {},
			...this._has("_device") && this._device !== void 0 ? { [fc]: this._device } : {},
			...this._has("_not_present") ? { [pc]: [...Xn(this._config)] } : {}
		});
	}
	_has(e) {
		return Q(this._schema).some(({ path: t }) => t === e);
	}
	get _hasColorRows() {
		return Q(this._schema).some(({ path: e }) => qs(e) !== void 0);
	}
	_pickDevice() {
		return this.hass === void 0 ? void 0 : this._device;
	}
	_renderNotes() {
		let e = this._config ? Rs(this._config, this.hass?.states) : [];
		return b`
      ${this._has("_device") ? b`<button
              type="button"
              class="suggest"
              ?disabled=${this._pickDevice() === void 0}
              @click=${this._suggest}
            >
              ${E.suggest.button}
            </button>` : S}
      ${this._report ? b`<ul class="report" role="status">
              <li>${E.suggest.filled(this._report.filled)}</li>
              ${this._report.empty.length > 0 ? b`<li>${E.suggest.empty(this._report.empty)}</li>` : S}
            </ul>` : S}
      ${e.length > 0 ? b`<p class="title">${E.suggest.warningsTitle}</p>
              <ul class="warnings">
                ${e.map((e) => b`<li>${e}</li>`)}
              </ul>` : S}
    `;
	}
	render() {
		if (!this._config) return S;
		let e = ir(this._config);
		return b`
      ${e.length > 0 ? b`<p class="error" role="alert">${e.join("; ")}</p>` : S}
      ${this._formDefined ? b`<ha-form
                class="switch"
                .hass=${this.hass}
                .data=${this._switch}
                .schema=${Gc}
                .computeLabel=${Kc}
                @value-changed=${this._toggleAdvanced}
              ></ha-form>
              <ha-form
                .hass=${this.hass}
                .data=${this._shown}
                .schema=${this._formSchema}
                .computeLabel=${Xc}
                @value-changed=${this._configChanged}
              ></ha-form>
              ${this._renderNotes()}` : b`<p class="hint">${E.noForm}</p>`}
    `;
	}
};
Uc([Fo({ attribute: !1 })], nl.prototype, "hass", void 0), Uc([Fo({ attribute: !1 })], nl.prototype, "schemaFor", void 0), Uc([Io()], nl.prototype, "_config", void 0), Uc([Io()], nl.prototype, "_switch", void 0), Uc([Io()], nl.prototype, "_device", void 0), Uc([Io()], nl.prototype, "_report", void 0), Uc([Io()], nl.prototype, "_formDefined", void 0), Lo(Wc, nl);
// src/diagram/source.ts
var rl = o`
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
    ${Sr}
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
`, $ = (e) => Math.round(e * 100) / 100, il = 3, al = (e) => e === !0 ? il : e === void 0 || e === !1 || !(e > 0) ? void 0 : Math.min(6, Math.max(.5, 120 / e)), ol = [
	0,
	72,
	144,
	216,
	288
].map((e) => x`<path class="fan-blade" d="M0 -4 C9 -6 21 -16 17 -30 C6 -26 -3 -17 -3 -6 Z" transform="rotate(${e})" />`), sl = [
	.75,
	.5,
	.25
], cl = 34;
function ll(e, t, n, r) {
	let { body: i, fan: a, coil: o, fins: s, feet: c } = e, l = al(t), u = Array.from({ length: s.count }, (e, t) => $(s.y0 + t * s.step)), d = $(a.radius / cl), f = a.radius * sl[2] * Math.SQRT1_2, p = a.radius * Math.SQRT1_2, m = [
		[-1, -1],
		[1, -1],
		[1, 1],
		[-1, 1]
	].map(([e, t]) => x`<path class="fan-guard fan-spoke" d="M${$(a.cx + (e ?? 0) * f)} ${$(a.cy + (t ?? 0) * f)} L${$(a.cx + (e ?? 0) * p)} ${$(a.cy + (t ?? 0) * p)}" />`), h = xr(br(_r, r), r?.onTap);
	return x`<g class="air-unit${n ? " muted" : ""}" data-source="air" aria-label=${it}>
    <title>${it}</title>
    <rect class="source-outline band-outline" x=${i.x} y=${i.y} width=${i.width} height=${i.height} rx=${N.radius} />
    ${c.map((e) => x`<rect class="source-frame air-foot" x=${e.x} y=${e.y} width=${e.width} height=${e.height} />`)}
    <rect class="source-frame" data-coil-block data-obstacle="air-coil" x=${o.x} y=${o.y} width=${o.width} height=${o.height} rx="3" />
    ${u.map((e) => x`<path class="source-fin" d="M${s.x0} ${e} H${s.x1}" />`)}
    <g class="fan-part" aria-label=${rt} role=${h.role} tabindex=${h.tabindex} @click=${h.click} @keydown=${h.keydown}>
      <title>${rt}</title>
      <circle class="fan-ring" data-obstacle="air-fan" cx=${a.cx} cy=${a.cy} r=${a.radius} />
      <circle class="fan-hit" cx=${a.cx} cy=${a.cy} r=${a.radius} fill="transparent" stroke="none" />
      <g class="fan" data-fan transform="translate(${a.cx} ${a.cy})${d === 1 ? "" : ` scale(${String(d)})`}">
        <g class=${l === void 0 ? "fan-rotor still" : "fan-rotor"} style=${l === void 0 ? "" : `--fan-duration: ${String(l)}s`}>${ol}<circle class="fan-hub" r="5" fill="var(--primary-text-color)" /></g>
      </g>
      <g class="fan-guard-group">
        ${sl.map((e) => x`<circle class="fan-guard fan-guard-ring" cx=${a.cx} cy=${a.cy} r=${$(a.radius * e)} />`)}
        ${m}
      </g>
    </g>
  </g>`;
}
function ul(e, t) {
	let { x: n, y: r, width: i, height: a, hatch: o, probe: s } = e, c = Array.from({ length: Math.floor((i - 20) / 10) + 1 }, (e, t) => $(n + 14 + t * 10));
	return x`<g class="ground-collector${t ? " muted" : ""}" data-source="ground" aria-label=${at}>
    <title>${at}</title>
    <rect class="source-outline band-outline" x=${n} y=${r} width=${i} height=${a} rx=${N.radius} />
    <path class="source-ground" d="M${n} ${o.y + o.height} H${$(n + i)}" />
    ${c.map((e) => x`<path class="source-ground" d="M${e} ${r} l-8 ${o.height}" />`)}
    ${oo("ground-hatch", o)}
    ${oo("ground-probe", s)}
  </g>`;
}
function dl(e, t, n, r) {
	let { airUnit: i, collector: a } = ea(e), o = e.source === "air" || e.source === "hybrid", s = e.source === "ground" || e.source === "hybrid";
	return x`<g class="source" data-source-kind=${e.source}>
    ${o && i !== void 0 ? ll(i, t["source.fan_speed"], !n, r) : x``}
    ${s && a !== void 0 ? ul(a, !n) : x``}
  </g>`;
}
// src/lib/version.ts
var fl = "1.1.1";
// src/lib/render.ts
function pl(e, t) {
	return e === t || Array.isArray(e) && Array.isArray(t) && e.length === t.length && e.every((e, n) => e === t[n]);
}
function ml(e, t) {
	if (e === t) return !0;
	if (typeof e != "object" || typeof t != "object" || e === null || t === null) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	return n.length === r.length && n.every((n) => Object.hasOwn(t, n) && pl(e[n], t[n]));
}
function hl(e, t, n) {
	return e === void 0 || e.locale !== t.locale || e.language !== t.language || e.localize !== t.localize || e.formatEntityState !== t.formatEntityState || e.themes?.darkMode !== t.themes?.darkMode || n.some((n) => e.states[n] !== t.states[n] || !ml(e.entities?.[n], t.entities?.[n]));
}
function gl(e, t, n, r) {
	return e.size === 1 && e.has("hass") ? t !== void 0 && hl(n, t, r) : !0;
}
// src/suggest/stub.ts
function _l(e, t, n) {
	let r = bs(e.states, t, e.devices ?? {}, n), i = Cs(r).replace(/_$/, "");
	if (i === "") return;
	let a = new Set(r.map((e) => e.entityId));
	return k.filter((e) => a.has(At(e, i))).length * 2 >= k.length ? i : void 0;
}
function vl(e) {
	if (e === void 0) return {};
	let t = /* @__PURE__ */ new Map();
	for (let n of Object.values(e.entities ?? {})) {
		if (typeof n.device_id != "string") continue;
		let e = t.get(n.device_id) ?? {};
		e[n.entity_id] = n, t.set(n.device_id, e);
	}
	let n = [...t].flatMap(([t, n]) => _l(e, n, t) ?? []);
	return n.length === 1 ? { prefix: n[0] } : {};
}
// src/card/ecogeo-card.ts
var yl = "ecogeo-card", bl = 0;
Lo("ecogeo-card", class extends Ue {
	static {
		this.version = fl;
	}
	static {
		this.styles = [
			qa,
			ro,
			rl,
			so,
			io,
			To,
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
		return document.createElement(Wc);
	}
	static getStubConfig(e) {
		return vl(e);
	}
	constructor() {
		super(), this.renderedVertical = !1, this.renderedAutoVertical = !1, this.renderedStroke = Or(void 0), this.renderedDrawing = 0, this.entityIds = [], this.idPrefix = `ecogeo${String(++bl)}`, this.onWindowResize = () => {
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
		return kr({
			isPanel: this.inPanel,
			cardWidth: this.width,
			windowHeight: window.innerHeight,
			headerHeight: this.inPanel ? this.cssPx("--header-height") : void 0,
			safeAreaTop: this.inPanel ? this.cssPx("--safe-area-inset-top") : void 0,
			viewBox: e
		});
	}
	layoutWidth() {
		return this.drawingWidthFor($i("horizontal").viewBox);
	}
	get shownLayout() {
		return Cr(this.resolved?.layout ?? "auto", this.layoutWidth(), this.renderedAutoVertical) ? "vertical" : "horizontal";
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
		let t = ir(e);
		if (t.length > 0) throw Error(t.join("; "));
		this.resolved = pr(e), this.entityIds = [...new Set(Object.values(this.resolved.entities).filter((e) => e !== void 0))], this.config = e;
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
			let e = this.shownLayout, t = this.arrangementViewBox(e), n = Or(this.drawingWidthFor(t), t.width);
			return e === "vertical" !== this.renderedVertical || this.fittedWidth(e) !== this.renderedDrawing || n.pipe !== this.renderedStroke.pipe || n.outline !== this.renderedStroke.outline;
		}
		return gl(e, this.hass, this.renderedHass, this.entityIds);
	}
	arrangementViewBox(e) {
		let t = this.resolved;
		return $i(e, t === void 0 ? void 0 : Gi(t)).viewBox;
	}
	fittedWidth(e) {
		if (!this.inPanel || !(this.width > 0)) return 0;
		let t = this.drawingWidthFor(this.arrangementViewBox(e));
		return t < this.width ? t : 0;
	}
	readings(e) {
		let t = e.sample ? lr : this.hass?.states ?? {};
		return {
			readings: Pt(t, e.entities),
			absent: Ft(t, e.entities, e.defaulted),
			offline: Ht(pt(t, e.entities["unit.connection"]))
		};
	}
	render() {
		this.renderedHass = this.hass;
		let e = this.shownLayout, t = e === "vertical";
		this.renderedVertical = t, this.renderedAutoVertical = t && this.resolved?.layout === "auto";
		let n = this.arrangementViewBox(e), r = Or(this.drawingWidthFor(n), n.width);
		this.renderedStroke = r;
		let i = this.fittedWidth(e);
		this.renderedDrawing = i;
		let a = this.resolved;
		if (a === void 0) return b`<ha-card data-layout=${e}><div class="diagram"></div></ha-card>`;
		let o = $i(e, Gi(a)), { viewBox: s } = o, c = {
			...a,
			arrangement: o
		}, { readings: l, absent: u, offline: d } = this.readings(c), f = Vt(l, c.features, c.states), p = Wt(f, c.features, c.dhw, l, !c.notPresent.has("brine.pump"), !u.has("htr.active")), m = c.sample ? lr : this.hass?.states ?? {}, h = Lt(l, c.entities, m), g = {
			mode: f,
			circuits: p,
			readings: h,
			stops: c.colors
		}, _ = {
			locale: po(this.hass),
			entities: this.hass?.entities,
			states: m
		}, v = c.sample ? void 0 : (e) => {
			mt(this, e);
		}, y = {
			entities: c.entities,
			onTap: v
		};
		return b`<ha-card data-layout=${e}>
      <div class="diagram" style=${i > 0 ? `max-width: ${String(i)}px; margin: 0 auto` : S}>
        <svg
          viewBox="0 0 ${s.width} ${s.height}"
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label=${Ke}
          style="--dhw-tank-color: ${c.dhw === "unused" ? j : Fa(g)}; --ecogeo-coil-muted: ${fn(this.hass?.themes?.darkMode === !0)}; --pipe-width: ${String(r.pipe)}; --outline-width: ${String(r.outline)}"
        >
          ${x`${uo(c, g, y, {
			mode: c.exchangerFill,
			idPrefix: this.idPrefix
		})}${dl(c, h, p.active.has("brine"), y)}${ao(c, y)}${no(c, g, y, {
			mode: c.exchangerFill,
			idPrefix: this.idPrefix
		}, r.pipe)}`}
        </svg>
        ${jo(Do(c, l, c.entities, _, c.notPresent), v, s)}
      </div>
      <div class="footer">
        <span class="mode">${Je[f]}</span>
        ${Mo(Oo(l, c.entities, _, {
			mode: f,
			features: c.features,
			source: c.source,
			dhw: c.dhw,
			notPresent: c.notPresent,
			absent: u
		}), v)}
        ${Ut(l["unit.alarm"]) ? b`<span class="alarm">${Ye.alarm}</span>` : S}
        ${d ? b`<span class="offline">${Ye.offline}</span>` : S}
        ${c.sample ? b`<span class="sample">${Ye.sampleValues}</span>` : S}
      </div>
    </ha-card>`;
	}
}) && console.info(`ecogeo-card ${fl}`);
// src/index.ts
var xl = {
	type: yl,
	...Ge,
	preview: !0
};
function Sl(e = window) {
	let t = e.customCards ??= [];
	t.some((e) => e.type === xl.type) || t.push({ ...xl });
}
Sl();
export { xl as CARD_ENTRY, Sl as registerCardPicker };
