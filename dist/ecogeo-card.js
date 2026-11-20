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
}, Xe = {
	externalTank: "DHW tank",
	demand: "Demand"
}, Ze = { demand: "Demand" }, Qe = {
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
}, it = "Air unit fan", at = "Air unit", ot = "Ground collector", E = {
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
}, st = qe, ct = /* @__PURE__ */ new Set(["unknown", "unavailable"]), lt = -999, ut = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;
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
var D = [
	"sensor",
	"number",
	"input_number"
], Ct = [
	...D,
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
		accepts: Ct
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
		accepts: Ct
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
		accepts: Ct
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
		accepts: Tt
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
		accepts: wt
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
		accepts: wt
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
		accepts: wt
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
		item: "footer",
		accepts: D
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
], Et = [
	"binary_sensor",
	"switch",
	"input_boolean"
], Dt = (e) => e !== void 0 && Et.includes(e.split(".")[0] ?? ""), Ot = new Map(k.map((e) => [e.path, e])), kt = k.filter((e) => "optional" in e).map((e) => e.path), At = k.map((e) => e.path);
[...new Set(k.flatMap((e) => "unit" in e ? [e.unit] : []))];
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
	return Object.fromEntries(k.map((n) => [n.path, Pt(mt(e, t[n.path]), n, t[n.path])]));
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
var zt = (e, t) => typeof e == "string" && t.some((t) => t.trim().toLowerCase() === e.trim().toLowerCase()), Bt = (e) => e === !0 || typeof e == "number" && e > 0;
function Vt(e) {
	let t = e["compressor.speed"];
	if (t !== void 0) return Bt(t);
	let n = e["compressor.percentage"];
	if (n !== void 0) return n > 0;
	let r = e["compressor.power"];
	return r === void 0 ? void 0 : r > 100;
}
function Ht(e, t, n = st) {
	let r = e["unit.on_off"];
	if (r === !1 || zt(r, n.off)) return "off";
	let i = e["compressor.mode"];
	if (i === !0 || zt(i, n.defrost)) return "defrost";
	let a = Vt(e);
	if (a === void 0) return "standby";
	let o = e["unit.summer"] === !0;
	return a ? e["dhw.demand"] === !0 ? "dhw" : o && t.active_cooling === !0 ? "active_cooling" : "heating" : o && Bt(e["production.pump"]) && t.passive_cooling === !0 ? "passive_cooling" : "standby";
}
function Ut(e) {
	return e !== void 0 && (Nt(e) === !1 || ft({ state: e.state.trim().toLowerCase() }));
}
var Wt = (e) => e === !0;
// src/calc/circuits.ts
function Gt(e, t, n, r, i, a) {
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
	return i && !Bt(r["brine.pump"]) && o.delete("brine"), {
		valve26: e === "dhw" ? "dhw" : "production",
		valve14: e === "active_cooling" ? "reversed" : "normal",
		valves2728: (e === "passive_cooling" || e === "defrost") && s ? "exchanger" : "closed",
		active: o
	};
}
// src/lib/config.ts
var Kt = /^[a-z][a-z0-9_]*\.[a-z0-9_]+$/;
function A(e, t) {
	let n = e;
	for (let e of t.split(".")) {
		if (typeof n != "object" || !n || !Object.hasOwn(n, e)) return;
		n = n[e];
	}
	return n;
}
function qt(e) {
	if (typeof e != "string") return;
	let t = e.trim();
	return Kt.test(t) ? t : void 0;
}
function Jt(e, t) {
	return qt(A(e, t));
}
// src/lib/options.ts
var Yt = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, Xt = /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|var)\((.*)\)$/i, Zt = /^[#a-zA-Z0-9(),.%\s/+-]+$/, Qt = /* @__PURE__ */ new Set(/* @__PURE__ */ "aliceblue.antiquewhite.aqua.aquamarine.azure.beige.bisque.black.blanchedalmond.blue.blueviolet.brown.burlywood.cadetblue.chartreuse.chocolate.coral.cornflowerblue.cornsilk.crimson.cyan.darkblue.darkcyan.darkgoldenrod.darkgray.darkgreen.darkgrey.darkkhaki.darkmagenta.darkolivegreen.darkorange.darkorchid.darkred.darksalmon.darkseagreen.darkslateblue.darkslategray.darkslategrey.darkturquoise.darkviolet.deeppink.deepskyblue.dimgray.dimgrey.dodgerblue.firebrick.floralwhite.forestgreen.fuchsia.gainsboro.ghostwhite.gold.goldenrod.gray.green.greenyellow.grey.honeydew.hotpink.indianred.indigo.ivory.khaki.lavender.lavenderblush.lawngreen.lemonchiffon.lightblue.lightcoral.lightcyan.lightgoldenrodyellow.lightgray.lightgreen.lightgrey.lightpink.lightsalmon.lightseagreen.lightskyblue.lightslategray.lightslategrey.lightsteelblue.lightyellow.lime.limegreen.linen.magenta.maroon.mediumaquamarine.mediumblue.mediumorchid.mediumpurple.mediumseagreen.mediumslateblue.mediumspringgreen.mediumturquoise.mediumvioletred.midnightblue.mintcream.mistyrose.moccasin.navajowhite.navy.oldlace.olive.olivedrab.orange.orangered.orchid.palegoldenrod.palegreen.paleturquoise.palevioletred.papayawhip.peachpuff.peru.pink.plum.powderblue.purple.rebeccapurple.red.rosybrown.royalblue.saddlebrown.salmon.sandybrown.seagreen.seashell.sienna.silver.skyblue.slateblue.slategray.slategrey.snow.springgreen.steelblue.tan.teal.thistle.tomato.turquoise.violet.wheat.white.whitesmoke.yellow.yellowgreen.transparent.currentcolor".split("."));
function $t(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) if (e[n] === "(" && t++, e[n] === ")" && (t--, t < 0 || t === 0 && n !== e.length - 1)) return !1;
	return t === 0;
}
function en(e) {
	let t = e.trim();
	if (t.length === 0 || t.length > 100 || !Zt.test(t)) return !1;
	if (Yt.test(t) || Qt.has(t.toLowerCase())) return !0;
	let n = Xt.exec(t);
	if (n === null || !$t(t)) return !1;
	if (n[1]?.toLowerCase() !== "var") return !0;
	let [r, ...i] = (n[2] ?? "").split(",");
	return /^\s*--[a-zA-Z0-9-]+\s*$/.test(r ?? "") && (i.length === 0 || en(i.join(",")));
}
var tn = (e) => e == null;
function nn(e) {
	switch (e.kind) {
		case "number": return C.number(String(e.min), String(e.max));
		case "color": return C.color;
		case "boolean": return C.boolean;
		case "choice": return C.choice(e.choices);
		case "list": return C.list;
	}
}
var rn = (e) => e === null || [
	"string",
	"number",
	"boolean"
].includes(typeof e);
function an(e) {
	return e.map((e) => typeof e == "boolean" ? e ? "on" : "off" : e === null ? "" : String(e)).filter((e) => e.trim() !== "");
}
function on(e, t) {
	switch (e.kind) {
		case "number": return typeof t == "number" && Number.isFinite(t) && t >= e.min && t <= e.max;
		case "color": return typeof t == "string" && en(t);
		case "boolean": return typeof t == "boolean";
		case "choice": return typeof t == "string" && e.choices.includes(t);
		case "list": return Array.isArray(t) && t.every(rn);
	}
}
function sn(e, t) {
	let n = t.split(".").slice(0, -1);
	for (let t = 1; t <= n.length; t++) {
		let r = n.slice(0, t).join("."), i = A(e, r);
		if (!tn(i) && (typeof i != "object" || Array.isArray(i))) return r;
	}
}
function cn(e, t) {
	let n = t.flatMap((t) => {
		let n = sn(e, t.path);
		if (n !== void 0) return [C.invalid(n, C.object)];
		let r = A(e, t.path);
		return tn(r) || on(t, r) ? [] : [C.invalid(t.path, nn(t))];
	});
	return [...new Set(n)];
}
function ln(e, t) {
	let n = A(e, t.path);
	if (t.kind === "list" && Array.isArray(n) && on(t, n)) {
		let e = an(n);
		return e.length > 0 ? e : t.default;
	}
	return tn(n) || !on(t, n) ? t.default : n;
}
// src/diagram/colors.ts
var un = [
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
], j = "var(--disabled-text-color)", dn = "#8a8a8a", fn = `var(--ecogeo-coil-muted, ${j})`, pn = (e) => e ? j : dn, mn = (e) => typeof e == "object" && !!e && !Array.isArray(e), hn = (e) => typeof e == "string" && cn({ color: e }, [{
	kind: "color",
	path: "color",
	default: ""
}]).length === 0, gn = (e) => e.map((e) => ({
	temperature: e.temperature,
	color: e.color.trim()
}));
function _n(e) {
	let t = A(e, "colors");
	if (t == null) return [];
	if (!Array.isArray(t) || t.length < 2 || t.length > 8) return [T.colors];
	let n = t;
	if (!n.every((e) => mn(e) && typeof e.temperature == "number" && Number.isFinite(e.temperature) && hn(e.color))) return [T.colors];
	let r = gn(n).map((e) => e.temperature);
	return r.every((e, t) => t === 0 || e > (r[t - 1] ?? 0)) ? [] : [T.colors];
}
function vn(e) {
	let t = A(e, "colors");
	return Array.isArray(t) && _n(e).length === 0 ? gn(t) : un;
}
function yn(e, t = un) {
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
], Dn = [
	"underfloor",
	"radiator",
	"none"
], On = {
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
	path: "emitter",
	default: "underfloor",
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
		"horizontal",
		"vertical"
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
], In = (e) => e === "C" ? "internal" : "external", M = (e) => e == null, Ln = (e) => M(e) || typeof e == "string" && e.trim() === "", N = (e) => typeof e == "object" && !!e && !Array.isArray(e), Rn = /^[a-z0-9_]+$/, zn = (e) => typeof e == "string" && e.trim() === "none";
function Bn(e) {
	let t = A(e, "prefix");
	return Ln(t) ? void 0 : t.trim();
}
function Vn(e) {
	let t = A(e, "variant");
	return xn.find((e) => e === t) ?? 4;
}
function Hn(e) {
	let t = ln(e, On), n = !M(A(e, "dhw"));
	return {
		model: t,
		source: ln(e, kn),
		dhw: n ? ln(e, An) : In(t),
		emitter: ln(e, jn)
	};
}
var Un = (e) => ln(e, Mn), Wn = (e) => ln(e, Nn), Gn = ["off", "defrost"], Kn = (e) => Array.isArray(e) && e.length > 0 && e.every((e) => typeof e == "string" && e.trim() !== "");
function qn(e) {
	let t = A(e, "states"), n = N(t) ? t : {}, r = (e) => {
		let t = n[e];
		return Kn(t) ? t : st[e];
	};
	return {
		off: r("off"),
		defrost: r("defrost")
	};
}
function Jn(e) {
	let t = A(e, "features");
	if (!N(t)) return {};
	let n = {};
	for (let e of bn) {
		let r = t[e];
		(r === !0 || r === !1 || r === "unused") && (n[e] = r);
	}
	return n;
}
var Yn = (e) => e === !0 || e === !1 || e === "unused";
function Xn(e) {
	let t = A(e, "entities");
	return N(t) ? new Set(Zn(t).filter(([e, t]) => Ot.has(e) && zn(t)).map(([e]) => e)) : /* @__PURE__ */ new Set();
}
function Zn(e, t = "") {
	return Object.entries(e).flatMap(([e, n]) => {
		let r = t === "" ? e : `${t}.${e}`;
		return N(n) ? Zn(n, r) : [[r, n]];
	});
}
function Qn(e) {
	let t = A(e, "variant");
	return M(t) || xn.some((e) => e === t) ? [] : [C.invalid("variant", T.integer(String(xn[0]), String(xn[xn.length - 1])))];
}
function $n(e) {
	let t = A(e, "prefix");
	return Ln(t) || typeof t == "string" && Rn.test(t.trim()) ? [] : [C.invalid("prefix", T.prefix)];
}
function er(e) {
	let t = A(e, "features");
	return M(t) ? [] : N(t) ? Object.entries(t).flatMap(([e, t]) => bn.some((t) => t === e) ? M(t) || Yn(t) ? [] : [T.featureState(e)] : [T.unknownFeature(e, bn)]) : [C.invalid("features", C.object)];
}
function tr(e) {
	let t = A(e, "states");
	return M(t) ? [] : N(t) ? Object.entries(t).flatMap(([e, t]) => Gn.some((t) => t === e) ? M(t) || Kn(t) ? [] : [T.statesList(e)] : [T.statesKey(e)]) : [C.invalid("states", C.object)];
}
function nr(e) {
	let t = A(e, "entities");
	return M(t) ? [] : N(t) ? Zn(t).flatMap(([e, t]) => Ln(t) ? [] : Ot.has(e) ? qt(t) !== void 0 || zn(t) ? [] : [T.notEntityId(e)] : [T.unknownRole(e)]) : [C.invalid("entities", C.object)];
}
function rr(e) {
	let t = A(e, "entities");
	return N(t) && Zn(t).some(([, e]) => !Ln(e));
}
function ir(e) {
	let t = Object.keys(e).filter((e) => !Fn.includes(e)).map((e) => T.unknownOption(e)), n = cn(e, Pn), r = [
		...t,
		...n,
		...Qn(e),
		...$n(e),
		...er(e),
		...nr(e),
		...tr(e),
		..._n(e)
	];
	if (cn(e, [On, An]).length === 0 && !M(A(e, "dhw"))) {
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
}, sr = "2026-01-01T12:00:00Z", cr = Object.fromEntries(At.map((e) => [e, ar(e)])), lr = Object.fromEntries(At.map((e) => {
	let t = Ot.get(e)?.unit, n = ar(e);
	return [n, {
		entity_id: n,
		state: or[e],
		last_updated: sr,
		attributes: t === void 0 ? {} : { unit_of_measurement: t }
	}];
}));
// src/config/resolve.ts
function ur(e, t, n = Xn(e)) {
	return Object.fromEntries(k.map((r) => [r.path, Jt(e, `entities.${r.path}`) ?? (t === void 0 || n.has(r.path) ? void 0 : jt(r, t))]));
}
function dr(e, t, n = Xn(e)) {
	return t === void 0 ? /* @__PURE__ */ new Set() : new Set(k.filter((t) => Jt(e, `entities.${t.path}`) === void 0 && !n.has(t.path)).map((e) => e.path));
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
		colors: vn(e),
		features: Cn(n, Jn(e)),
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
		production_pump: e(192, 620, "start", "horizontal, above pump 15 (the search keeps it no lower than its default place): the default place meets valve 27, so it starts 10 units right of it", !1),
		dg1_demand: {
			at: () => ({
				x: 208,
				y: 224,
				align: "middle"
			}),
			reason: "in the join lane over the cabinet, beside the stubs of connections 1/2 (emitter: none): the default place meets the stub of connection 2"
		}
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
}), Rr = (e) => [e.x + e.width / 2, e.y + e.height / 2], zr = 44, Br = 74;
function Vr(e) {
	let t = [], { airUnit: n, collector: r, externalTank: i, emitter: a } = e;
	if (a !== void 0) {
		let [e, n] = Rr(a.strip);
		t.push(Lr("emitter_demand", "heating.demand", e, n, "middle", {
			item: 1,
			demand: !0
		}));
	}
	if (n !== void 0 && e.key?.source === "air") {
		let [e, r] = Rr(n.strip);
		t.push(Lr("air_unit_out", "source.air_unit_outlet_temperature", e, r, "middle", { source: ["air"] }));
	}
	if (r !== void 0 && e.key?.source !== void 0 && e.key.source !== "air") {
		let [n, i] = Rr(r.strip), a = e.key.source === "hybrid";
		t.push(Lr(a ? "hybrid_ground_out" : "ground_out", "brine.inlet_temperature", n, i, "middle", { source: [a ? "hybrid" : "ground"] }));
	}
	if (i !== void 0) {
		let e = i.x + i.width / 2;
		t.push(Lr("tank_external_temperature", "dhw.temperature", e, i.y + zr, "middle", {
			dhw: "external",
			emphasis: !0,
			bare: !0
		}), Lr("tank_external_demand", "dhw.demand", e, i.y + Br, "middle", {
			dhw: "external",
			demand: !0,
			bare: !0
		}));
	}
	return t;
}
function Hr(e, t = (e, t) => [e, t], n = "horizontal") {
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
			caption: $e.portOut
		}),
		s("production_in", "production.return_temperature", 115, 112, "end", {
			item: 34,
			caption: $e.portIn
		}),
		s("production_pressure", "production.pressure", 115, 142, "end", { item: 38 }),
		s("production_pump", "production.pump", 229, 370, "start", { item: 15 }),
		...e.key === void 0 || e.key.emitter === "none" ? [s("dg1_demand", "heating.demand", 150, -14, "start", {
			item: 1,
			demand: !0
		})] : [],
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
		...Vr(e),
		o("tank_internal_temperature", "dhw.temperature", r.x + (a ? 24 : 70), a ? r.y + 18 : i, a ? "start" : "end", {
			dhw: "internal",
			bare: !0
		}),
		o("tank_internal_demand", "dhw.demand", r.x + (a ? 24 : 150), a ? r.y + 46 : i - 4, a ? "start" : "end", {
			dhw: "internal",
			demand: !0,
			bare: !0
		})
	] };
}
// src/diagram/geometry.ts
var P = {
	height: 176,
	top: 6,
	joinLane: 56,
	gap: 24,
	air: {
		width: 130,
		height: 176
	},
	collector: {
		width: 170,
		height: 176
	},
	hybridGap: 12,
	tank: {
		width: 160,
		height: 176,
		dome: 14
	},
	emitter: {
		width: 200,
		height: 176
	}
}, Ur = {
	horizontal: {
		out: 22,
		in: 34,
		link: 46,
		tank: 28
	},
	vertical: {
		out: 22,
		in: 34,
		link: 46,
		tank: 40
	}
}, Wr = (e) => e === "air" ? P.air.width : e === "ground" ? P.collector.width : P.air.width + P.hybridGap + P.collector.width;
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
		x0: F(e.x0 + n),
		x1: F(e.x0 + n + t.width)
	}])));
}
var F = (e) => Math.round(e * 100) / 100;
function Kr(e, t) {
	let { width: n, height: r } = P.air, i = t - r, a = {
		x: e + 10,
		y: i + 110,
		width: 110,
		height: 58
	};
	return {
		x: e,
		y: i,
		width: n,
		height: r,
		fan: {
			cx: e + n / 2,
			cy: i + 40,
			radius: 28
		},
		dividerY: i + 78,
		strip: {
			x: e + 8,
			y: i + 82,
			width: n - 16,
			height: 24
		},
		coil: a,
		fins: {
			x0: a.x + 4,
			x1: a.x + a.width - 4,
			y0: a.y + 8,
			step: 8,
			count: 6
		},
		passes: {
			x0: e + 32,
			step: 22,
			count: 4,
			top: a.y + 12,
			bottom: a.y + 46
		}
	};
}
function qr(e, t) {
	let { width: n, height: r } = P.collector, i = t - r;
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
		strip: {
			x: e + 8,
			y: i + 18,
			width: n - 16,
			height: 24
		},
		serpentine: {
			x: e + 8,
			y: i + 48,
			width: n - 16,
			height: r - 48
		},
		passes: {
			y0: i + 54,
			step: 30,
			count: 4,
			left: e + 34,
			right: e + n - 14
		},
		feedX: e + 14
	};
}
var Jr = {
	top: 50,
	step: 26,
	count: 5,
	inset: 52
}, I = {
	count: 6,
	width: 10,
	gap: 8,
	top: 52,
	bottom: 168,
	inletY: 62,
	outletY: 158
};
function Yr(e, t, n) {
	let { width: r, height: i } = P.emitter, a = n - i, o = t + 34, s = t + r - 34, c = {
		kind: e,
		x: t,
		y: a,
		width: r,
		height: i,
		strip: {
			x: t + 8,
			y: a + 14,
			width: r - 16,
			height: 24
		},
		feedX: o,
		exitX: s
	};
	if (e === "underfloor") {
		let e = Array.from({ length: Jr.count }, (e, t) => a + Jr.top + t * Jr.step), [n, i, l, u, d] = e;
		if (n === void 0 || i === void 0 || l === void 0 || u === void 0 || d === void 0) throw Error("five passes");
		let f = t + Jr.inset, p = t + r - Jr.inset;
		return {
			...c,
			inlet: [o, n],
			outlet: [s, d],
			loop: [
				[o, n],
				[p, n],
				[p, i],
				[f, i],
				[f, l],
				[p, l],
				[p, u],
				[f, u],
				[f, d],
				[s, d]
			],
			passes: e,
			columns: []
		};
	}
	let l = I.count * I.width + (I.count - 1) * I.gap, u = t + (r - l) / 2, d = Array.from({ length: I.count }, (e, t) => ({
		x: u + t * (I.width + I.gap),
		y: a + I.top,
		width: I.width,
		height: I.bottom - I.top
	}));
	return {
		...c,
		inlet: [u, a + I.inletY],
		outlet: [u + l, a + I.outletY],
		loop: [],
		passes: [],
		columns: d
	};
}
var Xr = (e) => ({
	feed: e.passes.x0,
	exit: e.passes.x0 + (e.passes.count - 1) * e.passes.step
}), Zr = (e) => e.coil.y + e.coil.height, Qr = (e) => Array.from({ length: e.passes.count }, (t, n) => e.passes.y0 + n * e.passes.step);
function $r({ externalTank: e }) {
	if (e === void 0) return "";
	let { x: t, y: n, width: r, height: i, dome: a } = e, o = r / 2;
	return `M${String(t)} ${String(n + a)} A${String(o)} ${String(a)} 0 0 1 ${String(t + r)} ${String(n + a)} V${String(n + i - a)} A${String(o)} ${String(a)} 0 0 1 ${String(t)} ${String(n + i - a)} Z`;
}
var ei = [[-75, -13], [-75, 13]], L = {
	x: 0,
	y: 0,
	width: 720,
	height: 520
}, R = {
	viewBox: {
		width: 720,
		height: 520
	},
	cabinet: L,
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
}, ti = [
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
], ni = [
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
], z = (e, t, n, r, i, a = {}) => ({
	item: e,
	kind: t,
	x: n,
	y: r,
	rotation: i,
	...a
}), ri = L.width / 2, B = {
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
	compressor: ri,
	probe29: 410,
	transducer35: 432,
	valve12: 412,
	hx10: ri,
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
}, V = {
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
}, ii = R.coil51.x - 75, ai = (e) => [
	z(1, "port", B.riser1, 0, 0),
	z(2, "port", B.riser2, 0, 0),
	z(3, "port", B.riser3, 0, 0),
	z(4, "port", B.riser4, 0, 0),
	z(5, "port", B.port5, 0, 0, { dhw: "external" }),
	z(6, "port", B.port6, 0, 0, { dhw: "external" }),
	z(47, "port", B.tap47, 0, 0, { dhw: "internal" }),
	z(48, "port", B.tap48, 0, 0, { dhw: "internal" }),
	z(49, "port", B.tap49, 0, 0, { dhw: "internal" }),
	z(7, "exchanger", B.hx7, V.hx, 0, {
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
	z(8, "exchanger", B.hx8, V.hx, 0, {
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
	z(9, "exchanger", B.hx9, V.hx9, 0, {
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
	z(11, "compressor", B.compressor, V.trans, 0),
	z(12, "expansion_valve", B.valve12, V.line, 0),
	z(13, "filter_dryer", B.compressor, V.line, 0),
	z(14, "inversion_valve", B.valve14, V.valve14, 0, { feature: "active_cooling" }),
	z(29, "probe_t", B.probe29, V.pair, 0),
	z(30, "probe_t", B.probe30, V.pair, 0),
	z(35, "transducer_p", B.transducer35, V.pair, 0),
	z(36, "transducer_p", B.transducer36, V.pair, 0),
	z(10, "exchanger", B.hx10, V.hx10, 0, {
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
	z(15, "pump", B.pump15, V.line, 0),
	z(16, "pump", B.riser4, V.pump16, 90),
	z(17, "pump", B.htr, V.probe, 90, {
		feature: "htr",
		dhw: "any"
	}),
	z(22, "valve", B.htr, V.trans, 0, {
		feature: "htr",
		dhw: "any"
	}),
	z(26, "valve3", B.riser1, V.dhwSup, 270, {
		dhw: "any",
		unusedMuted: !0
	}),
	z(27, "valve3", B.valve27, V.line, 0, { feature: "passive_cooling" }),
	z(28, "valve3", B.valve28, V.line, 0, { feature: "passive_cooling" }),
	z(31, "probe_t", B.probe31, V.probe, 270),
	z(32, "probe_t", B.body4, V.probe, 270),
	z(33, "probe_t", B.body1, V.probe, 270),
	z(34, "probe_t", B.body2, V.probe, 270),
	z(37, "transducer_p", B.body4, V.trans, 270),
	z(38, "transducer_p", B.body2, V.trans, 270),
	z(44, "resistor", B.riser1, V.resistor, 90, { feature: "backup_heater" }),
	z(45, "thermostat", B.body1, V.thermostat, 270, { feature: "backup_heater" }),
	z(50, "tank", e.internalTank.x + e.internalTank.width / 2, e.internalTank.y + e.internalTank.height / 2, 0, { dhw: "internal" }),
	z(51, "coil", e.coil51.x, e.coil51.y, 0, { dhw: "internal" }),
	z(54, "probe_t", R.internalTank.x + R.internalTank.width - 16, 41, 270, { dhw: "internal" })
], oi = (e) => e.split(" ").map((e) => {
	let [t, n] = e.split(",").map(Number);
	return [t ?? 0, n ?? 0];
}), H = (...e) => e.map(([e, t]) => `${String(e)},${String(t)}`).join(" "), U = (e, t, n, r, i = {}) => ({
	id: e,
	circuit: t,
	points: oi(n),
	temperatureRole: r,
	direction: 1,
	...i
}), si = ["production_dg1"], ci = ["production_dg1", "production_dhw"], W = "production.outlet_temperature", G = "production.return_temperature", K = "production.pump", q = "brine.inlet_temperature", J = "brine.outlet_temperature", Y = "brine.pump", li = "compressor.discharge_temperature", ui = "compressor.suction_temperature", di = "refrigerant.condensation_temperature", fi = "refrigerant.evaporation_temperature", X = "compressor.percentage", pi = "dhw.temperature", mi = "source.air_unit_outlet_temperature", hi = [
	"dhw_sup_b",
	"dhw_sup_c",
	"dhw_ret_b",
	"dhw_ret_c",
	"dhw_ext_in",
	"dhw_ext_coil",
	"dhw_ext_out"
], gi = () => {
	let { riser1: e, riser2: t, riser3: n, riser4: r } = B, { dhwSup: i, dhwRet: a, line: o } = V, s = B.hx8 - 12, c = B.hx8 + 12, l = B.hx7 - 12, u = B.hx7 + 12, d = B.hx9 - 12, f = B.hx9 + 12, p = B.hx10 - 12, m = B.hx10 + 12, h = B.compressor - 14, g = B.compressor + 14, _ = B.valve14 - 14, v = B.valve14 + 14, y = (...e) => H(...e);
	return [
		U("p1_up", si, y([e, i - 12], [e, 0]), W, {
			dhw: "any",
			speedRole: K
		}),
		U("p1_direct", si, y([e, i + 12], [e, 0]), W, {
			dhw: "none",
			speedRole: K
		}),
		U("p2_in", si, y([t, 0], [t, a]), G, { speedRole: K }),
		U("prod_44_26", ci, y([e, V.resistor - 28], [e, i + 12]), W, { speedRole: K }),
		U("prod_bypass44", ci, y([e, V.hxTop], [e, V.resistor - 28]), W, {
			bypass: "backup_heater",
			speedRole: K
		}),
		U("prod_8_44", ci, y([s, V.hxTop], [e, V.hxTop]), W, { speedRole: K }),
		U("prod_15_8", ci, y([B.pump15 + 12, o], [s, o]), G, { speedRole: K }),
		U("trunk", ci, y([t, a], [t, o]), G, { speedRole: K }),
		U("prod_27_in", ci, y([t, o], [B.valve27 - 12, o]), G, {
			through: "passive_cooling",
			speedRole: K,
			onlyWhen: { valves2728: "closed" }
		}),
		U("prod_27_15", ci, y([B.valve27 + 12, o], [B.pump15 - 12, o]), G, {
			through: "passive_cooling",
			speedRole: K
		}),
		U("prod_bypass27", ci, y([t, o], [B.pump15 - 12, o]), G, {
			bypass: "passive_cooling",
			speedRole: K
		}),
		U("prod_10_in", ["exchanger_10"], y([t, o], [t, V.hx10Bottom], [p, V.hx10Bottom]), G, {
			feature: "passive_cooling",
			speedRole: K
		}),
		U("prod_10_out", ["exchanger_10"], y([p, V.hx10Top], [B.valve27, V.hx10Top], [B.valve27, o + 12]), W, {
			feature: "passive_cooling",
			speedRole: K
		}),
		U("dhw_sup_a", ["production_dhw"], y([e + 12, i], [B.htrRiser, i]), W, {
			dhw: "any",
			speedRole: K
		}),
		U("dhw_sup_b", ["dhw_coil"], y([B.htrRiser, i], [ii, i]), W, {
			dhw: "any",
			speedRole: K
		}),
		U("dhw_sup_c", ["dhw_coil"], y([ii, i], [B.port5, i], [B.port5, 0]), W, {
			dhw: "external",
			speedRole: K
		}),
		U("dhw_ret_c", ["dhw_coil"], y([B.port6, 0], [B.port6, a], [ii, a]), G, {
			dhw: "external",
			speedRole: K
		}),
		U("dhw_ret_b", ["dhw_coil"], y([ii, a], [B.htr, a]), G, {
			dhw: "any",
			speedRole: K
		}),
		U("dhw_ret_a", ["production_dhw"], y([B.htr, a], [t, a]), G, {
			dhw: "any",
			speedRole: K
		}),
		U("htr_in", ["htr"], y([B.htr, a], [B.htr, V.probe - 12]), pi, {
			feature: "htr",
			dhw: "any"
		}),
		U("htr_pump", ["htr"], y([B.htr, V.probe + 12], [B.htr, V.trans - 9]), pi, {
			feature: "htr",
			dhw: "any"
		}),
		U("htr_to_9", ["htr"], y([B.htr, V.trans + 9], [B.htr, V.hx9Bottom], [d, V.hx9Bottom]), pi, {
			feature: "htr",
			dhw: "any"
		}),
		U("htr_riser", ["htr"], y([d, V.hx9Top], [d, i]), pi, {
			feature: "htr",
			dhw: "any"
		}),
		U("tap_47", ["dhw_coil"], y([B.tap47, -12], [B.tap47, R.internalTank.y]), pi, {
			dhw: "internal",
			stub: !0
		}),
		U("tap_48", ["dhw_coil"], y([B.tap48, R.internalTank.y], [B.tap48, -12]), pi, {
			dhw: "internal",
			stub: !0
		}),
		U("tap_49", ["dhw_coil"], y([B.tap49, -12], [B.tap49, R.internalTank.y]), pi, {
			dhw: "internal",
			stub: !0
		}),
		U("ref_discharge", ["refrigerant"], y([h, V.trans], [f, V.trans], [f, V.hx9Top]), li, {
			through: "htr",
			speedRole: X
		}),
		U("ref_9_14", ["refrigerant"], y([f, V.hx9Bottom], [_, V.valve14]), li, {
			through: "htr",
			speedRole: X
		}),
		U("ref_discharge_direct", ["refrigerant"], y([h, V.trans], [_, V.trans], [_, V.valve14]), li, {
			bypass: "htr",
			speedRole: X
		}),
		U("ref_14_8", ["refrigerant"], y([v, V.valve14 + 10], [c, V.hxTop]), li, {
			through: "active_cooling",
			reversible: !0,
			speedRole: X
		}),
		U("ref_7_14", ["refrigerant"], y([l, V.hxTop], [l, V.valve14], [v, V.valve14]), ui, {
			through: "active_cooling",
			reversible: !0,
			speedRole: X
		}),
		U("ref_suction", ["refrigerant"], y([v, V.valve14 - 10], [B.suction, V.valve14 - 10], [B.suction, V.trans], [g, V.trans]), ui, {
			through: "active_cooling",
			speedRole: X
		}),
		U("ref_direct_8", ["refrigerant"], y([_, V.valve14], [v, V.valve14], [c, V.hxTop]), li, {
			bypass: "active_cooling",
			speedRole: X
		}),
		U("ref_direct_suction", ["refrigerant"], y([l, V.hxTop], [l, V.valve14 - 10], [B.suction, V.valve14 - 10], [B.suction, V.trans], [g, V.trans]), ui, {
			bypass: "active_cooling",
			speedRole: X
		}),
		U("ref_8_13", ["refrigerant"], y([c, o], [B.compressor - 14, o]), di, {
			reversible: !0,
			speedRole: X
		}),
		U("ref_13_12", ["refrigerant"], y([B.compressor + 14, o], [B.valve12 - 12, o]), di, {
			reversible: !0,
			speedRole: X
		}),
		U("ref_12_7", ["refrigerant"], y([B.valve12 + 12, o], [l, o]), fi, {
			reversible: !0,
			speedRole: X
		}),
		U("ln4_a", ["brine"], y([r, 0], [r, V.pump16 - 12]), q, { speedRole: Y }),
		U("ln4_b", ["brine"], y([r, V.pump16 + 12], [r, V.hxTop]), q, { speedRole: Y }),
		U("br_feed7", ["brine"], y([r, V.hxTop], [u, V.hxTop]), q, {
			speedRole: Y,
			onlyWhen: { valves2728: "closed" }
		}),
		U("brine_7_28", ["brine"], y([u, o], [B.valve28 - 12, o]), J, {
			through: "passive_cooling",
			speedRole: Y,
			onlyWhen: { valves2728: "closed" }
		}),
		U("brine_28_ln3", ["brine"], y([B.valve28 + 12, o], [n, o]), J, {
			through: "passive_cooling",
			speedRole: Y
		}),
		U("brine_bypass28", ["brine"], y([u, o], [n, o]), J, {
			bypass: "passive_cooling",
			speedRole: Y
		}),
		U("ln3", ["brine"], y([n, o], [n, 0]), J, { speedRole: Y }),
		U("br_10_in", ["exchanger_10"], y([r, V.hxTop], [r, V.hx10Top], [m, V.hx10Top]), q, {
			feature: "passive_cooling",
			speedRole: Y
		}),
		U("br_10_28", ["exchanger_10"], y([m, V.hx10Bottom], [B.valve28, V.hx10Bottom], [B.valve28, o + 12]), J, {
			feature: "passive_cooling",
			speedRole: Y
		})
	];
}, _i = [
	{
		over: "dhw_sup_a",
		under: "p2_in",
		at: [B.riser2, V.dhwSup]
	},
	{
		over: "dhw_sup_c",
		under: "ln3",
		at: [B.riser3, V.dhwSup]
	},
	{
		over: "dhw_sup_c",
		under: "ln4_a",
		at: [B.riser4, V.dhwSup]
	},
	{
		over: "dhw_ret_c",
		under: "ln3",
		at: [B.riser3, V.dhwRet]
	},
	{
		over: "dhw_ret_c",
		under: "ln4_a",
		at: [B.riser4, V.dhwRet]
	},
	{
		over: "dhw_ret_b",
		under: "htr_riser",
		at: [B.hx9 - 12, V.dhwRet]
	},
	{
		over: "trunk",
		under: "prod_8_44",
		at: [B.riser2, V.hxTop]
	},
	{
		over: "ln3",
		under: "br_feed7",
		at: [B.riser3, V.hxTop]
	},
	{
		over: "br_10_in",
		under: "br_10_28",
		at: [B.valve28, V.hx10Top]
	}
];
function vi(e) {
	let { x0: t, step: n, count: r, top: i, bottom: a } = e.passes, o = Zr(e), s = [[t, o]];
	for (let e = 0; e < r; e += 1) {
		let c = t + e * n, l = e === r - 1;
		e % 2 == 0 ? (s.push([c, i]), l || s.push([c + n, i])) : (s.push(l ? [c, o] : [c, a]), l || s.push([c + n, a]));
	}
	return s;
}
function yi(e) {
	let { left: t, right: n } = e.passes, [r, i, a, o] = Qr(e);
	if (r === void 0 || i === void 0 || a === void 0 || o === void 0) throw Error("four passes");
	let s = e.y + e.height, c = (i + a) / 2;
	return {
		down: [
			[e.feedX, s],
			[e.feedX, r],
			[n, r],
			[n, i],
			[t, i],
			[t, c]
		],
		up: [
			[t, c],
			[t, a],
			[n, a],
			[n, o],
			[t, o]
		]
	};
}
var bi = (...e) => e.filter((t, n) => n === 0 || !ia(t, e[n - 1] ?? t));
function xi(e, t) {
	let { ports: n, cabinet: r, key: i } = e, a = r.y, o = e.externalCoil, s = Ni(a, t), c = [], { emitter: l } = e;
	if (l === void 0) c.push(U("p1_stub", si, H([n[1], a], [n[1], a - 12]), W, { stub: !0 }), U("p2_stub", si, H([n[2], a - 12], [n[2], a]), G, { stub: !0 }));
	else {
		let e = l.y + l.height;
		c.push(U("dg1_sup", si, H(...bi([n[1], a], [n[1], s.out], [l.feedX, s.out], [l.feedX, e], [l.feedX, l.inlet[1]], l.inlet)), W, { speedRole: K }), U("dg1_ret", si, H(...bi(l.outlet, [l.exitX, l.outlet[1]], [l.exitX, e], [l.exitX, s.out], [n[2], s.out], [n[2], a])), G, { speedRole: K }));
	}
	if (i.tank && o !== void 0) {
		let e = [o.cx - o.rx, o.top], t = [o.cx + o.rx, o.bottom];
		c.push(U("dhw_ext_in", ["dhw_coil"], H(...bi([n[5], a], [n[5], s.tank], [o.inX, s.tank], [o.inX, o.top], e)), W, {
			dhw: "external",
			speedRole: K
		}), U("dhw_ext_coil", ["dhw_coil"], H(e, t), W, {
			dhw: "external",
			speedRole: K,
			shape: {
				kind: "helix",
				cx: o.cx,
				top: o.top,
				bottom: o.bottom,
				rx: o.rx,
				turns: 4.5,
				mirror: !0
			}
		}), U("dhw_ext_out", ["dhw_coil"], H(...bi(t, [o.outX, o.bottom], [o.outX, s.tank], [n[6], s.tank], [n[6], a])), G, {
			dhw: "external",
			speedRole: K
		}));
	}
	c.push(U("src_out", ["brine"], H([n[3], a], [n[3], s.out]), J, { speedRole: Y }), U("src_in", ["brine"], H([n[4], s.in], [n[4], a]), q, { speedRole: Y }));
	let { airUnit: u, collector: d } = e, f = (e, t) => H(...bi([n[3], s.out], [e, s.out], [e, t])), p = (e, t) => H(...bi([e, t], [e, s.in], [n[4], s.in]));
	if (i.source === "air" && u !== void 0) {
		let { feed: e, exit: t } = Xr(u);
		c.push(U("src_air_feed", ["brine"], f(e, Zr(u)), J, {
			source: ["air"],
			speedRole: Y
		}), U("src_air_coil", ["brine"], H(...vi(u)), J, {
			source: ["air"],
			speedRole: Y,
			bend: u.passes.step / 2
		}), U("src_air_exit", ["brine"], p(t, Zr(u)), mi, {
			source: ["air"],
			speedRole: Y
		}));
	}
	if (i.source === "ground" && d !== void 0) {
		let { down: e, up: t } = yi(d), n = d.passes.step / 2;
		c.push(U("src_gnd_feed", ["brine"], f(d.feedX, d.y + d.height), J, {
			source: ["ground"],
			speedRole: Y
		}), U("src_gnd_down", ["brine"], H(...e), J, {
			source: ["ground"],
			speedRole: Y,
			roundEnd: !0,
			bend: n
		}), U("src_gnd_up", ["brine"], H(...t), q, {
			source: ["ground"],
			speedRole: Y,
			bend: n
		}), U("src_gnd_exit", ["brine"], p(d.passes.left, Qr(d)[3] ?? 0), q, {
			source: ["ground"],
			speedRole: Y
		}));
	}
	if (i.source === "hybrid" && u !== void 0 && d !== void 0) {
		let { feed: e, exit: t } = Xr(u), { down: n, up: r } = yi(d), i = d.passes.step / 2;
		c.push(U("src_hyb_feed", ["brine"], f(e, Zr(u)), J, {
			source: ["hybrid"],
			speedRole: Y
		}), U("src_hyb_coil", ["brine"], H(...vi(u)), J, {
			source: ["hybrid"],
			speedRole: Y,
			bend: u.passes.step / 2
		}), U("src_hyb_link", ["brine"], H([t, Zr(u)], [t, s.link], [d.feedX, s.link], [d.feedX, d.y + d.height]), mi, {
			source: ["hybrid"],
			speedRole: Y
		}), U("src_hyb_down", ["brine"], H(...n), mi, {
			source: ["hybrid"],
			speedRole: Y,
			roundEnd: !0,
			bend: i
		}), U("src_hyb_up", ["brine"], H(...r), q, {
			source: ["hybrid"],
			speedRole: Y,
			bend: i
		}), U("src_hyb_exit", ["brine"], p(d.passes.left, Qr(d)[3] ?? 0), q, {
			source: ["hybrid"],
			speedRole: Y
		}));
	}
	return c;
}
function Si(e, t) {
	let n = e[0], r = e[e.length - 1];
	if (n === void 0 || r === void 0) return t;
	if (t <= n[0]) return F(t + n[1] - n[0]);
	if (t >= r[0]) return F(t + r[1] - r[0]);
	let i = e.findIndex(([e]) => e > t), [a, o] = e[i - 1] ?? n, [s, c] = e[i] ?? r;
	return F(o + (t - a) / (s - a) * (c - o));
}
function Ci(e, t, n, r) {
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
var wi = Ci(ni, {
	"left-edge": 62,
	"riser-1": 46,
	"before-exchanger-8": 22,
	"riser-3": 84,
	"riser-4": 46
}, 10, L.width), Ti = Ci(ti, { "above-probes": -18 }, P.top + P.height + P.joinLane, L.height), Ei = Ci(ni, {}, 10, L.width), Di = { "under-compressor-row": 24 }, Oi = Ci(ti, Di, P.top + P.height + P.joinLane, L.height), ki = {
	from: 10,
	to: 24,
	extra: 28
}, Ai = Ci([{
	id: "tank-head",
	axis: "row",
	from: ki.from,
	to: ki.to,
	holds: "tank 50 head"
}, ...ti], {
	...Di,
	"tank-head": ki.extra
}, P.top + P.height + P.joinLane, L.height), ji = {
	horizontal: {
		x: wi,
		y: Ti
	},
	vertical: {
		x: Ei,
		y: Oi
	}
}, Mi = (e, t = !1) => {
	let n = ji[e], r = e === "vertical" && t ? Ai : n.y;
	return {
		mapX: (e) => Si(n.x, e),
		mapY: (e) => Si(r, e)
	};
}, Ni = (e, t = "horizontal") => {
	let n = Ur[t];
	return {
		out: e - n.out,
		in: e - n.in,
		link: e - n.link,
		tank: e - n.tank
	};
}, Pi = "underfloor", Fi = (e) => ({
	source: e.source,
	tank: Ki(e) === "external",
	emitter: e.emitter ?? Pi,
	internal: Ki(e) === "internal"
}), Ii = {
	source: "hybrid",
	tank: !0,
	emitter: Pi
}, Li = (() => {
	let e = (e, t) => {
		let { mapX: n, mapY: r } = Mi(e, t), i = {
			x: n(L.x),
			y: r(L.y),
			width: n(L.x + L.width) - n(L.x),
			height: r(L.y + L.height) - r(L.y)
		}, a = R.internalTank;
		return {
			viewBox: {
				width: i.x + i.width + 10,
				height: i.y + i.height + 15
			},
			cabinet: i,
			internalTank: {
				x: n(a.x),
				y: r(a.y),
				width: F(n(a.x + a.width) - n(a.x)),
				height: F(r(a.y + a.height) - r(a.y))
			},
			coil51: {
				x: n(R.coil51.x - 75) + 75,
				y: r(R.coil51.y)
			},
			headShift: F(r(L.height) - Si(ji[e].y, L.height))
		};
	};
	return {
		horizontal: e("horizontal", !1),
		vertical: e("vertical", !1),
		"vertical|internal": e("vertical", !0),
		"horizontal|internal": e("horizontal", !0)
	};
})(), Ri = (e, t) => {
	let n = Li[t.internal === !0 ? `${e}|internal` : e];
	if (n === void 0) throw Error("no cabinet zones");
	return n;
};
function zi(e, t, n) {
	let { mapX: r } = Mi(e, t.internal === !0), i = n.cabinet.y - P.joinLane, a = {
		1: r(B.riser1),
		2: r(B.riser2),
		3: r(B.riser3),
		4: r(B.riser4),
		5: r(B.port5),
		6: r(B.port6)
	}, o = Gr([
		{
			name: "emitter",
			centre: (a[1] + a[2]) / 2,
			width: t.emitter === "none" ? 0 : P.emitter.width
		},
		{
			name: "source",
			centre: (a[3] + a[4]) / 2,
			width: Wr(t.source)
		},
		{
			name: "tank",
			centre: (a[5] + a[6]) / 2,
			width: t.tank ? P.tank.width : 0
		}
	], {
		min: n.cabinet.x,
		max: n.cabinet.x + n.cabinet.width
	}, P.gap), s = o.source, c = o.emitter, l = t.emitter === "none" || c === void 0 ? void 0 : Yr(t.emitter, c.x0, i), u = t.source === "ground" || s === void 0 ? void 0 : Kr(s.x0, i), d = s === void 0 ? 0 : t.source === "hybrid" ? s.x0 + P.air.width + P.hybridGap : s.x0, f = t.source === "air" || s === void 0 ? void 0 : qr(d, i), p = o.tank, m = p === void 0 ? void 0 : {
		x: p.x0,
		y: i - P.tank.height,
		width: P.tank.width,
		height: P.tank.height,
		dome: P.tank.dome
	}, h = m === void 0 ? void 0 : {
		cx: m.x + m.width / 2,
		top: m.y + 90,
		bottom: m.y + 152,
		rx: 38,
		inX: m.x + m.width / 2 - 38 - 12,
		outX: m.x + m.width / 2 + 38 + 12
	};
	return {
		key: t,
		band: {
			top: i - P.height,
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
var Bi = /* @__PURE__ */ new Map(), Vi = {
	horizontal: Pr,
	vertical: Fr
};
function Hi(e, t, n = Vi[e]) {
	let { mapX: r, mapY: i } = Mi(e, t.internal === !0), a = {
		...Ri(e, t),
		...zi(e, t, Ri(e, t))
	}, o = (e, t) => [r(e), i(t)], s = ai(a).map((e) => e.item === 50 || e.item === 51 ? e : {
		...e,
		x: r(e.x),
		y: i(e.y)
	}), c = [...gi().map((e) => ({
		...e,
		points: e.points.map(([e, t]) => [r(e), i(t)])
	})), ...xi(a, e)], l = _i.map((e) => ({
		...e,
		at: o(e.at[0], e.at[1])
	})), u = Hr(a, o, e);
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
ai(R), gi(), Hr(R);
function Ui(e, t = Ii) {
	let n = `${e}|${t.source}|${String(t.tank)}|${t.emitter}|${String(t.internal === !0)}`, r = Bi.get(n);
	if (r !== void 0) return r;
	let i = Hi(e, t);
	return Bi.set(n, i), i;
}
var Wi = (e, t = "horizontal") => e.arrangement ?? (e.model === void 0 || e.dhw === void 0 || e.source === void 0 ? Ui(t) : Ui(t, Fi({
	model: e.model,
	dhw: e.dhw,
	source: e.source,
	emitter: e.emitter
}))), Gi = (e, t) => t === "htr" && e.dhw === "none" ? !1 : e.features[t], Ki = (e) => e.dhw === "unused" ? e.model === "C" ? "internal" : "external" : e.dhw, qi = (e, t) => {
	let n = Ki(t);
	return e === "any" ? n !== "none" : e === n;
};
function Ji(e, t) {
	if (e.source !== void 0 && !e.source.includes(t.source) || e.dhw !== void 0 && !qi(e.dhw, t) || e.bypass !== void 0 && Gi(t, e.bypass) !== !1 || e.through !== void 0 && Gi(t, e.through) === !1) return "hidden";
	if (e.feature !== void 0) {
		let n = Gi(t, e.feature);
		if (n === !1) return "hidden";
		if (n === "unused") return "muted";
	}
	return t.dhw === "unused" && e.dhw !== void 0 && (e.dhw !== "any" || e.unusedMuted === !0) ? "muted" : "normal";
}
function Yi(e, t) {
	return e.flatMap((e) => {
		let n = Ji(e, t);
		return n === "hidden" ? [] : [{
			part: e,
			state: n
		}];
	});
}
var Xi = (e) => Yi(Wi(e).components, e), Zi = (e) => Yi(Wi(e).segments, e), Qi = (e, t) => (e.onlyWhen === void 0 || e.onlyWhen.valves2728 === t.valves2728) && e.circuit.some((e) => t.active.has(e)), $i = .35;
function ea(e) {
	let t = Math.max(1, Math.round(e.turns * 2)), n = (e.bottom - e.top) / t, r = 4 / 3 * Math.max(3, n);
	return Array.from({ length: t }, (i, a) => {
		let o = a % 2 == 0, [s, c] = e.mirror === !0 ? [e.cx - e.rx, e.cx + e.rx] : [e.cx + e.rx, e.cx - e.rx], [l, u] = o ? [s, c] : [c, s], d = e.top + a * n, f = d + n, p = o ? r : -r, m = a === t - 1;
		return {
			front: o,
			curve: [
				[l, d],
				[l, d + p],
				m ? [u + (l - u) * .3, f] : [u, f + p],
				[u, f]
			]
		};
	});
}
var ta = (e) => [...e.filter((e) => !e.front), ...e.filter((e) => e.front)];
function na(e) {
	let t = (e) => String(Math.round(e * 100) / 100);
	return ea(e).map(({ front: e, curve: [n, r, i, a] }) => ({
		front: e,
		d: `M${t(n[0])} ${t(n[1])} C${t(r[0])} ${t(r[1])} ${t(i[0])} ${t(i[1])} ${t(a[0])} ${t(a[1])}`
	}));
}
function ra(e, t) {
	let n = aa(e, 0), r = [`M${String(n[0])} ${String(n[1])}`];
	for (let n = 1; n < e.length; n += 1) {
		let [i, a, o] = [
			aa(e, n - 1),
			aa(e, n),
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
var ia = (e, t) => e[0] === t[0] && e[1] === t[1];
function aa(e, t) {
	let n = e[t];
	if (n === void 0) throw Error(`No point ${String(t)}`);
	return n;
}
var oa = (e) => e.slice(1).map((t, n) => [aa(e, n), t]), sa = (e, t, n) => e >= Math.min(t, n) && e <= Math.max(t, n);
function ca(e, t = [], n = 7) {
	let r = [], i, a = (e) => {
		r.push(i === void 0 ? `M${String(e[0])} ${String(e[1])}` : `L${String(e[0])} ${String(e[1])}`), i = e;
	}, o = (e) => {
		r.push(`M${String(e[0])} ${String(e[1])}`), i = e;
	};
	a(aa(e, 0));
	for (let [r, i] of oa(e)) {
		let e = Math.sign(i[0] - r[0]), s = Math.sign(i[1] - r[1]), c = Math.abs(i[0] - r[0]) + Math.abs(i[1] - r[1]), l = t.filter((e) => la(e, r, i) && !ia(e, r) && !ia(e, i)).sort((e, t) => Math.abs(e[0] - r[0]) + Math.abs(e[1] - r[1]) - (Math.abs(t[0] - r[0]) + Math.abs(t[1] - r[1])));
		for (let t of l) {
			let l = Math.abs(t[0] - r[0]) + Math.abs(t[1] - r[1]);
			l > n && a([t[0] - e * n, t[1] - s * n]), o(c - l > n ? [t[0] + e * n, t[1] + s * n] : i);
		}
		a(i);
	}
	return r.join(" ");
}
var la = (e, t, n) => t[0] === n[0] && e[0] === t[0] && sa(e[1], t[1], n[1]) || t[1] === n[1] && e[1] === t[1] && sa(e[0], t[0], n[0]);
function ua(e, t, n) {
	return e.crossings.filter((e) => e.under === t && n.has(e.over) && n.has(e.under)).map((e) => e.at);
}
// src/diagram/pipes.ts
var da = 1.2, fa = .6, pa = [
	"tap_47",
	"tap_48",
	"tap_49"
], ma = ["prod_27_15", "prod_15_8"];
function ha(e) {
	if (e !== void 0 && e > 0) return Math.min(8, Math.max(fa, da * 100 / e));
}
var ga = {
	"compressor.discharge_temperature": "compressor.suction_temperature",
	"compressor.suction_temperature": "compressor.discharge_temperature",
	"refrigerant.condensation_temperature": "refrigerant.evaporation_temperature",
	"refrigerant.evaporation_temperature": "refrigerant.condensation_temperature"
}, _a = (e, t) => hi.includes(e.id) && va(t), va = (e) => e.active.has("htr") && !e.active.has("production_dhw");
function ya(e, t) {
	return _a(e, t.circuits) ? "dhw.temperature" : e.reversible === !0 && t.mode === "active_cooling" ? ga[e.temperatureRole] ?? e.temperatureRole : (t.mode === "passive_cooling" || t.mode === "defrost") && t.circuits.valves2728 === "exchanger" && ma.includes(e.id) ? "production.outlet_temperature" : e.temperatureRole;
}
function ba(e, t, n) {
	return t === "muted" && n === "defrost" && e.feature === "passive_cooling" ? "normal" : t;
}
var xa = (e, t) => {
	let n = e[t];
	return n === !0 ? 3 : ha(typeof n == "number" ? n : void 0);
}, Sa = (e, t) => {
	let n = e[t];
	return typeof n == "number" ? n : void 0;
};
function Ca(e, t, n) {
	let { mode: r, circuits: i, readings: a, stops: o } = n, s = pa.includes(e.id), c = ba(e, t, r), l = s || Qi(e, i), u = Sa(a, ya(e, n)), d = c === "muted" || !l || u === void 0, f = e.direction === -1 != (e.reversible === !0 && r === "active_cooling"), p = {
		color: d ? j : yn(u, o),
		muted: d,
		reversed: f
	};
	if (!l || c === "muted" || e.stub === !0 || s) return {
		...p,
		animated: !1
	};
	let m = _a(e, i) || e.speedRole === void 0 && e.circuit.includes("htr") ? 3 : e.speedRole === void 0 ? void 0 : xa(a, e.speedRole);
	return m === void 0 ? {
		...p,
		animated: !1
	} : {
		...p,
		animated: !0,
		duration: m
	};
}
var wa = (e) => yn(Sa(e.readings, "dhw.temperature"), e.stops);
function Ta(e) {
	let { circuits: t, readings: n, stops: r } = e;
	return va(t) ? yn(Sa(n, "dhw.temperature"), r) : t.active.has("dhw_coil") ? yn(Sa(n, "production.outlet_temperature"), r) : j;
}
// src/diagram/symbols.ts
var Ea = .55;
function Da(e, t, n) {
	let r = -t - 9, i = t + 9;
	return x`<path class="exchanger-fill" data-half=${e} d=${e === "left" ? `M0 ${String(r)} H-16 A4 4 0 0 0 -20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 0 -16 ${String(i)} H0 Z` : `M0 ${String(r)} H16 A4 4 0 0 1 20 ${String(r + 4)} V${String(i - 4)} A4 4 0 0 1 16 ${String(i)} H0 Z`} fill=${n} fill-opacity=${Ea} stroke="none" />`;
}
var Oa = (e, t) => x`<text class="glyph" text-anchor="middle" dominant-baseline="central" font-size="9" fill="currentColor" stroke="none" transform="rotate(${-t})">${e}</text>`, ka = {
	kind: "helix",
	cx: 2,
	top: -60,
	bottom: 60,
	rx: 11,
	turns: 7.5
};
function Aa({ internalTank: e, coil51: t }) {
	let n = e.x + 2 - t.x, r = na(ka), { cx: i, rx: a, top: o, bottom: s } = ka, c = ei[0][1], l = ei[1][1], u = a - i;
	return x`<g transform="matrix(0 -1 1 0 0 0)">${ta(r).map((e) => x`<path data-half=${e.front ? "front" : "back"} stroke-linecap=${e.front ? "round" : "butt"} d=${e.d} opacity=${e.front ? S : $i} />`)}</g><path style="stroke-width: var(--pipe-width, 3)" d="M${n} ${c} H${o} M${s} ${u} V${l} H${n}" />`;
}
var ja = "M9 -10.7 L-13 -3 M9 10.7 L-13 3", Ma = ["M9 -10.7 L-13.73 -2.75 A14 14 0 0 1 9 -10.7 Z", "M9 10.7 L-13.73 2.75 A14 14 0 0 0 9 10.7 Z"], Na = (e, t) => x`<path d="M0 ${t} V${e}" />`, Pa = (e, t) => x`<path d="${e}" fill=${t ? "currentColor" : "none"} />`;
function Fa(e, t) {
	let n = t.rotation ?? 0, r = () => {
		if (t.arrangement === void 0) throw Error(`the ${e} symbol needs the arrangement it is drawn in`);
		return t.arrangement;
	};
	switch (e) {
		case "pump": return x`<circle r="12" /><path d="M-5 -7 V7 L8 0 Z" fill="currentColor" />`;
		case "valve3": {
			let e = t.open ?? ["l", "r"];
			return x`${Pa("M-12 -6 V6 L0 0 Z", e.includes("l"))}${Pa("M12 -6 V6 L0 0 Z", e.includes("r"))}${Pa("M-6 12 H6 L0 0 Z", e.includes("d"))}<rect x="-4" y="-21" width="8" height="8" /><path d="M0 -13 V-8" />`;
		}
		case "inversion_valve": return x`<rect x="-10" y="-14" width="20" height="28" rx="3" /><path d="M-14 0 H-10 M10 -10 H14 M10 0 H14 M10 10 H14" />${t.reversed === !0 ? x`<path d="M-14 0 H14 M14 10 H5 V-10 H14" />` : x`<path d="M-14 0 H-5 V10 H14 M14 0 H5 V-10 H14" />`}`;
		case "probe_t": return x`<circle r="9" />${Na(16, 9)}${Oa("T", n)}`;
		case "transducer_p": return x`<circle r="9" />${Na(16, 9)}${Oa("P", n)}`;
		case "thermostat": return x`<rect x="-7" y="-7" width="14" height="14" />${Na(16, 7)}${Oa("T", n)}`;
		case "exchanger": {
			let e = t.size ?? 34, n = t.fills;
			return x`${n === void 0 ? S : x`${Da("left", e, n.left)}${Da("right", e, n.right)}`}<rect x="-20" y="${-e - 9}" width="40" height="${2 * e + 18}" rx="4" /><path d="M-12 ${-e} V${e} M12 ${-e} V${e}" /><circle cx="-12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${-e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="-12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${e}" r="3.5" fill="var(--card-background-color, transparent)" />`;
		}
		case "compressor": return x`<circle r="14" />${Ma.map((e) => x`<path class="compressor-fill" d=${e} fill="currentColor" />`)}<path class="compressor-lines" d="${ja}" />`;
		case "valve": return x`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
		case "resistor": return x`<rect x="-28" y="-6" width="56" height="12" rx="2" /><path d="M-18 -6 V6 M18 -6 V6" />`;
		case "filter_dryer": return x`<rect x="-14" y="-5" width="28" height="10" rx="5" />`;
		case "expansion_valve": return x`<path d="M-12 -6 V6 L0 0 L12 -6 V6 L0 0 Z" />`;
		case "port": return x`<rect x="-5" y="-6" width="10" height="6" />`;
		case "tank": return x`<rect class="tank-body" data-dhw-tank="internal" x=${-r().internalTank.width / 2} y=${-r().internalTank.height / 2} width=${r().internalTank.width} height=${r().internalTank.height} rx="14" fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />`;
		case "coil": return Aa(r());
	}
}
function Ia(e, t = {}) {
	return x`<g class="symbol ${e}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${t.rotation ?? 0})">${Fa(e, t)}</g>`;
}
// src/diagram/cabinet.ts
var La = o`
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
function Ra(e, t) {
	return e === 26 ? t.valve26 === "dhw" ? ["l", "d"] : ["l", "r"] : t.valves2728 === "exchanger" ? ["d", "r"] : ["l", "r"];
}
function za(e, t, n, r, i) {
	let { part: a } = e, { circuits: o } = t, s = ba(a, e.state, t.mode), c = rt(a.item), l = xr(br(gr(a.item, n), n), n?.onTap);
	return x`<g class="symbol-group ${s}" data-item=${a.item} data-kind=${a.kind} aria-label=${c} role=${l.role} tabindex=${l.tabindex} @click=${l.click} @keydown=${l.keydown} style=${a.kind === "coil" ? `color: ${Wa(t)}` : S}>
    <title>${c}</title>
    <g transform="translate(${a.x} ${a.y})">${Ia(a.kind, {
		rotation: a.rotation,
		size: a.size,
		open: a.kind === "valve3" ? Ra(a.item, o) : void 0,
		reversed: a.kind === "inversion_valve" ? o.valve14 === "reversed" : void 0,
		fills: i,
		arrangement: r
	})}</g>
  </g>`;
}
function Ba(e, t, n) {
	let r = na(t), i = n.muted ? S : `stroke: ${n.color}`;
	return x`<g class="helix ${n.muted ? "muted" : ""}" data-segment=${e.id} style=${i}>
    ${ta(r).map((e) => x`<path class="pipe ${n.muted ? "muted" : ""}" data-half=${e.front ? "front" : "back"} style=${i} stroke-linecap=${e.front ? "round" : "butt"} opacity=${e.front ? S : $i} d=${e.d} />`)}
    ${n.animated ? x`<path class="flow ${n.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(n.duration)}s" d=${r.filter((e) => e.front).map((e) => e.d).join(" ")} />` : S}
  </g>`;
}
function Va(e, t, n, r, i) {
	if (e.shape !== void 0) return Ba(e, e.shape, t);
	let a = e.bend === void 0 ? ca(e.points, n, r) : ra(e.points, e.bend);
	return x`<path class="pipe ${t.muted ? "muted" : ""}" data-segment=${e.id} style=${t.muted ? S : `stroke: ${t.color}`} stroke-linecap=${e.roundEnd === !0 ? "round" : S} d=${a} />${t.muted && i !== void 0 && Ga.has(e.id) ? x`<path class="pipe-inside" data-inside=${e.id} clip-path="url(#${i})" d=${a} />` : S}${t.animated ? x`<path class="flow ${t.reversed ? "reversed" : ""}" data-flow=${e.id} style="--flow-duration: ${String(t.duration)}s" d=${a} />` : S}`;
}
function Ha(e, t, n, r) {
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
var Ua = (e) => x`<linearGradient id=${e.id} x1="0" y1=${e.y1} x2="0" y2=${e.y2} data-muted=${e.muted}>
      <stop offset="0" style="stop-color: ${e.start}" />
      <stop offset="1" style="stop-color: ${e.end}" />
    </linearGradient>`;
function Wa(e) {
	let t = Ta(e);
	return t === "var(--disabled-text-color)" ? fn : t;
}
var Ga = /* @__PURE__ */ new Set(["dhw_ext_in", "dhw_ext_out"]);
function Ka(e, t, n, r = {
	mode: "gradient",
	idPrefix: "ecogeo"
}, i = wr.pipe) {
	let a = 7 * i / wr.pipe, o = Wi(e), { cabinet: s } = o, c = Zi(e), l = new Set(c.map((e) => e.part.id)), u = new Map(c.map((e) => [e.part.id, Ca(e.part, e.state, t)])), d = [], f = Ki(e) === "external" ? `${r.idPrefix}-tank-clip` : void 0, p = Xi(e).map((e) => {
		let i = r.mode === "gradient" ? e.part.sides : void 0;
		if (i === void 0) return za(e, t, n, o);
		let a = {
			left: "none",
			right: "none"
		};
		for (let n of i) {
			let i = Ha(n, `${r.idPrefix}-x${String(e.part.item)}-${n.half}`, u, t.mode);
			d.push(i), a[n.half] = `url(#${i.id})`;
		}
		return za(e, t, n, o, a);
	});
	return x`<g class="cabinet">
    <defs>${d.map(Ua)}${f === void 0 ? S : x`<clipPath id=${f} data-tank-clip><path d=${$r(o)} /></clipPath>`}</defs>
    <rect class="outline" x=${s.x} y=${s.y} width=${s.width} height=${s.height} rx="6" />
    ${c.map((e) => {
		let t = u.get(e.part.id);
		return t === void 0 ? S : Va(e.part, t, ua(o, e.part.id, l), a, f);
	})}
    ${p}
  </g>`;
}
// src/diagram/dhw.ts
var qa = o`
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
`;
function Ja(e, t) {
	if (Ki(e) !== "external") return x``;
	let n = Wi(e);
	if (n.externalTank === void 0) return x``;
	let { x: r, y: i, width: a, dome: o } = n.externalTank, s = a / 2, c = $r(n), l = `M${String(r)} ${String(i + o)} A${String(s)} ${String(o)} 0 0 0 ${String(r + a)} ${String(i + o)}`, u = xr(br(yr, t), t?.onTap);
	return x`<g class=${e.dhw === "unused" ? "dhw-storage muted" : "dhw-storage"} data-dhw="external" aria-label=${Xe.externalTank} role=${u.role} tabindex=${u.tabindex} @click=${u.click} @keydown=${u.keydown}>
    <title>${Xe.externalTank}</title>
    <path class="tank-body" data-dhw-tank="external" d=${c} fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />
    <path class="tank-rim" d=${l} />
    <rect class="obstacle" data-obstacle="tank-rim" x=${r} y=${i + o} width=${a} height=${o} fill="none" stroke="none" />
  </g>`;
}
// src/diagram/obstacle.ts
var Ya = (e, t) => x`<rect class="obstacle" data-obstacle=${e} x=${t.x} y=${t.y} width=${t.width} height=${t.height} fill="none" stroke="none" />`, Xa = o`
  .emitter-outline {
    stroke: var(--primary-text-color);
    stroke-width: max(2.5, var(--outline-width, 2));
  }
  .emitter-line,
  .emitter-column {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-opacity: 0.6;
    stroke-width: calc(var(--outline-width, 2) * 0.75);
  }
  /* The circuit is inactive: the body, its lines and its columns are muted like the pipes. */
  .emitter.muted .emitter-outline,
  .emitter.muted .emitter-line,
  .emitter.muted .emitter-column {
    stroke: var(--disabled-text-color);
  }
  .emitter[role='button'] {
    cursor: pointer;
  }
  .emitter[role='button']:focus-visible {
    ${Sr}
  }
`, Za = .5, Qa = 43;
function $a(e, t, n, r, i) {
	let { x: a, y: o, width: s, height: c } = e, l = e.kind === "radiator", u = t.muted ? S : `stroke: url(#${t.gradient})`;
	return x`<rect class="emitter-outline" x=${a} y=${o} width=${s} height=${c} rx="6" fill=${l && r ? `url(#${t.gradient})` : "none"} fill-opacity=${Za} />
    ${l ? x`${e.columns.map((e) => x`<rect class="emitter-column" x=${e.x} y=${e.y} width=${e.width} height=${e.height} rx="4" />`)}${Ya("radiator-columns", {
		x: e.columns[0]?.x ?? a,
		y: e.columns[0]?.y ?? o,
		width: (e.columns.at(-1)?.x ?? a) + (e.columns.at(-1)?.width ?? 0) - (e.columns[0]?.x ?? a),
		height: e.columns[0]?.height ?? 0
	})}` : x`<path class="emitter-line" d="M${a} ${o + Qa} H${a + s}" />${Ya("emitter-divider", {
		x: a,
		y: o + Qa - 1.5,
		width: s,
		height: 3
	})}<path class="pipe${t.muted ? " muted" : ""}" data-emitter-loop style=${u} stroke-linecap="round" d=${n} />${i === void 0 ? S : x`<path class="flow" data-flow="dg1_loop" style="--flow-duration: ${String(i.duration)}s" d=${n} />`}`}`;
}
function eo(e, t, n, r) {
	let i = Wi(e), a = i.emitter, o = i.segments.find((e) => e.id === "dg1_sup"), s = i.segments.find((e) => e.id === "dg1_ret");
	if (a === void 0 || o === void 0 || s === void 0) return x``;
	let c = Ca(o, "normal", t), l = Ca(s, "normal", t), u = Qi(o, t.circuits), d = c.muted && l.muted, f = `${r.idPrefix}-emitter`, p = a.kind === "radiator", m = p ? a.y : a.passes[0] ?? a.y, h = p ? a.y + a.height : a.passes.at(-1) ?? a.y + a.height, g = xr(br(vr, n), n?.onTap), _ = Qe[a.kind], v = a.loop.length === 0 ? "" : ra(a.loop, (a.passes[1] ?? 0) / 2 - (a.passes[0] ?? 0) / 2);
	return x`<g class="emitter${u ? "" : " muted"}" data-emitter="body" data-emitter-kind=${a.kind} aria-label=${_} role=${g.role} tabindex=${g.tabindex} @click=${g.click} @keydown=${g.keydown}>
    <title>${_}</title>
    <defs>
      <linearGradient id=${f} gradientUnits="userSpaceOnUse" x1="0" y1=${m} x2="0" y2=${h} data-muted=${d}>
        <stop offset="0" style="stop-color: ${d ? j : c.color}" />
        <stop offset="1" style="stop-color: ${d ? j : l.color}" />
      </linearGradient>
    </defs>
    <rect class="emitter-hit" x=${a.x} y=${a.y} width=${a.width} height=${a.height} fill="transparent" stroke="none" />
    ${$a(a, {
		gradient: f,
		muted: d
	}, v, r.mode === "gradient", c.animated ? { duration: c.duration ?? 2 } : void 0)}
  </g>`;
}
// src/lib/format.ts
var to = "−";
function no(e) {
	let t = e?.locale;
	return typeof t == "object" && t ? t : e?.language === void 0 ? {} : { language: e.language };
}
function ro(e) {
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
var io = /* @__PURE__ */ new Map();
function ao(e, t, n) {
	let r = ro(e), i = n && e.number_format !== "none", a = `${r?.join(",") ?? ""}|${String(t)}|${String(i)}`, o = io.get(a);
	return o === void 0 && (o = new Intl.NumberFormat(r, {
		minimumFractionDigits: t,
		maximumFractionDigits: t,
		useGrouping: i
	}), io.set(a, o)), o;
}
function oo(e, t, n = 0, r = !0) {
	if (!Number.isFinite(e)) return "–";
	let i = Number.isFinite(n) ? Math.min(20, Math.max(0, Math.trunc(n))) : 0, a = Math.abs(e) < .5 / 10 ** i ? 0 : e;
	return ao(t ?? {}, i, r).formatToParts(a).map((e) => e.type === "minusSign" ? to : e.value).join("");
}
// src/calc/display.ts
function so(e) {
	if (typeof e != "object" || !e) return;
	let t = e.display_precision;
	return typeof t == "number" && Number.isInteger(t) && t >= 0 && t <= 20 ? t : void 0;
}
var co = /* @__PURE__ */ new Set(["production.pump", "brine.pump"]), lo = (e, t) => t ?? e.decimals ?? 0;
function uo(e, t) {
	let n = typeof t == "string" ? t.trim().replaceAll("º", "°").normalize("NFKC").toLowerCase() : "";
	return n === (e.unit ?? "").toLowerCase() || e.quantity === "difference" && n === "°c";
}
function fo(e) {
	if (/e/i.test(e ?? "")) return 0;
	let t = /^\s*[-+]?\d*\.(\d+)/.exec(e ?? "");
	return Math.min(20, t?.[1]?.length ?? 0);
}
function po(e, t) {
	let n = e === void 0 ? void 0 : t.states?.[e]?.attributes.unit_of_measurement;
	return typeof n == "string" && n.trim() !== "" ? n.trim() : void 0;
}
function mo(e, t, n, r) {
	if (typeof t == "boolean") return tt[t ? "on" : "off"];
	let i = Ot.get(e);
	if (i === void 0 || t === void 0 || !Number.isFinite(t)) return;
	let a = po(n, r), o = uo(i, a), s = i.quantity !== void 0 && bt(i.quantity, a), c = i.unit !== void 0 && a !== void 0 && !o && !s, l = n === void 0 || !(o || c) ? void 0 : so(r.entities?.[n]), u = co.has(e) && !c ? 0 : c && l === void 0 ? fo(n === void 0 ? void 0 : r.states?.[n]?.state) : lo(i, l), d = oo(t, r.locale, u, !1), f = c ? a : i.unit;
	return f === void 0 ? d : `${d} ${f}`;
}
// src/diagram/labels.ts
var ho = o`
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
  .label.emphasis {
    font-size: max(11px, ${a(String(1.2 * Ar.horizontal))}cqw);
    font-weight: 600;
  }
  [data-layout='vertical'] .label.emphasis {
    font-size: max(11px, ${a(String(1.2 * Ar.vertical))}cqw);
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
`, go = /* @__PURE__ */ new Set();
function _o(e, t, n, r, i = go) {
	return Wi(e).labels.specs.flatMap((a) => {
		if (i.has(a.role) || Ji(a, e) === "hidden" || e.dhw === "unused" && a.dhw !== void 0) return [];
		let o = n[a.role], { caption: s } = a, c = {
			x: a.x,
			y: a.y,
			align: a.align
		}, l = {
			id: a.id,
			role: a.role,
			...c,
			emphasis: a.emphasis === !0,
			...a.bare === !0 ? { bare: !0 } : {},
			...a.rotate === void 0 ? {} : { rotate: a.rotate },
			entityId: o,
			...a.item === void 0 ? {} : { item: a.item },
			...s === void 0 ? {} : { caption: s }
		}, u = t[a.role];
		if (a.demand === !0) {
			let e = a.role === "heating.demand" ? Ze.demand : Xe.demand;
			return u === !0 ? [{
				...l,
				text: e,
				missing: !1
			}] : [];
		}
		let d = mo(a.role, typeof u == "number" || typeof u == "boolean" ? u : void 0, o, r);
		return [{
			...l,
			text: d ?? "–",
			missing: d === void 0
		}];
	});
}
function vo(e, t, n, r) {
	let { notPresent: i, absent: a } = r, o = (e, n, r, a) => n.every((e) => i.has(e)) ? void 0 : {
		id: e,
		...r === void 0 ? {} : { caption: r },
		text: a ?? "–",
		missing: a === void 0,
		entityId: t[n[0]]
	}, s = (r) => {
		let i = e[r];
		return mo(r, typeof i == "number" || typeof i == "boolean" ? i : void 0, t[r], n);
	}, c = (e, t, n) => o(e, [t], n, s(t)), l = (e, t, n, r) => c(e, a.has(t) ? n : t, r), u = a.has("unit.system_cop") ? "unit.cop" : "unit.system_cop", d = o("cop", [u], r.mode === "active_cooling" ? et.eer : et.cop, e[u] === 0 ? void 0 : s(u)), { mode: f } = r, p = (f === "heating" || f === "active_cooling") && r.features.htr === !0 && (r.dhw === "external" || r.dhw === "internal") && !a.has("htr.power") ? c("htr_power", "htr.power", et.htr) : void 0, m = f === "heating" ? [l("dg1_power", "heating.power", "heating.capacity", et.dg1), p] : f === "dhw" ? [l("dhw_power", "dhw.power", "heating.capacity", et.dhw)] : f === "active_cooling" ? [c("cooling_power", "cooling.capacity", et.cooling), p] : [];
	return [
		c("outside_temperature", "source.outside_temperature", et.outside),
		d,
		...m
	].filter((e) => e !== void 0);
}
var yo = (e, t) => ({
	left: `${String(e.x / t.width * 100)}%`,
	top: `${String(e.y / t.height * 100)}%`
});
function bo(e, t, n, r) {
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
function xo(e, t, n) {
	return b`${e.map((e) => {
		let { left: r, top: i } = yo(e, n);
		return b`<span
      class="label ${e.align}${e.emphasis ? " emphasis" : ""}${e.bare === !0 ? " bare" : ""}${e.rotate === void 0 ? "" : " rotated"}"
      data-label=${e.id}
      data-role=${e.role}
      data-label-item=${e.item ?? S}
      style="left: ${r}; top: ${i}"
      >${e.caption === void 0 ? S : b`<span class="caption">${e.caption}</span>`}${bo(e.entityId, e.text, e.missing, t)}</span
    >`;
	})}`;
}
function So(e, t) {
	return b`${e.map((e) => b`<span class="footer-item" data-footer=${e.id}
        >${e.caption === void 0 ? S : b`<span class="caption">${e.caption}</span>`}${bo(e.entityId, e.text, e.missing, t)}</span
      >`)}`;
}
// node_modules/@lit/reactive-element/decorators/property.js
var Co = {
	attribute: !0,
	type: String,
	converter: ee,
	reflect: !1,
	hasChanged: te
}, wo = (e = Co, t, n) => {
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
function To(e) {
	return (t, n) => typeof n == "object" ? wo(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
// node_modules/@lit/reactive-element/decorators/state.js
function Eo(e) {
	return To({
		...e,
		state: !0,
		attribute: !1
	});
}
// src/lib/define.ts
function Do(e, t) {
	let n = customElements.get(e);
	return n === void 0 ? (customElements.define(e, t), !0) : (n !== t && console.warn(`${e} is already defined by another copy of the module; that copy stays in use.`), !1);
}
// src/config/keywords.ts
var Z = (e) => e.split(/\s+/).filter((e) => e !== ""), Q = "temp temperature temperatuur temperatura temperatur", Oo = "pressure druk presion druck", ko = "pump pomp bomba pumpe circulator", Ao = "heating verwarming heizung heizkreis calefaccion cv", jo = `production productie produccion produktion ${Ao}`, Mo = "brine glycol source bron brijn captacion salmuera sole", No = "dhw sanitary sanitaria tapwater warmwater warmwasser acs caliente domestic hotwater boiler", Po = "demand vraag demanda anforderung bedarf request", Fo = "suction zuig saug ansaug succion aspiracion niederdruck lagedruk", Io = "discharge pers druckgas heissgas descarga hochdruck hogedruk", Lo = "capacity vermogen capacidad kapazitat leistung power", Ro = "valve ventiel valvula ventil position stand posicion stellung", zo = "compressor compresor kompressor verdichter", Bo = "condens condensation condensatie condensacion kondensation kondens", Vo = "evaporat evaporation evaporacion verdamp verdampfung", Ho = `${Ao} dg verwarmen`, Uo = "setpoint set target desired gewenst ingesteld soll wunsch consigna objetivo streef", Wo = "superheat oververhitting oververhit sobrecalentamiento ueberhitzung uberhitzung", Go = "on off aan uit onoff encendido apagado ein aus", Ko = "alarm alarma storing stoerung storung fehler error fault malfunction", qo = "htr recovery recuperacion recuperatie rueckgewinnung", Jo = "power vermogen potencia leistung", Yo = "electric elektr", Xo = [
	Yo,
	No,
	qo
].join(" "), Zo = [Yo, qo].join(" "), Qo = [Yo, No].join(" "), $o = "system systeem sistema", es = "cop scop coefficient rendimiento rendement wirkungsgrad efficiency", ts = {
	"production.outlet_temperature": {
		subject: Z(jo),
		role: Z(Q)
	},
	"production.return_temperature": {
		subject: Z(jo),
		role: Z(Q)
	},
	"production.pressure": {
		subject: Z(jo),
		role: Z(Oo)
	},
	"production.pump": {
		subject: Z(jo),
		role: Z(ko)
	},
	"brine.outlet_temperature": {
		subject: Z(Mo),
		role: Z(Q)
	},
	"brine.inlet_temperature": {
		subject: Z(Mo),
		role: Z(Q)
	},
	"brine.pressure": {
		subject: Z(Mo),
		role: Z(Oo)
	},
	"brine.pump": {
		subject: Z(Mo),
		role: Z(ko)
	},
	"compressor.speed": {
		subject: Z(zo),
		role: Z("rpm speed toerental toeren velocidad drehzahl frequency frequentie frecuencia frequenz hz running draait actief active activo laufend")
	},
	"compressor.percentage": {
		subject: Z(zo),
		role: Z("percentage porcentaje prozent load belasting carga auslastung capaciteit")
	},
	"compressor.power": {
		subject: Z("power vermogen potencia leistung electrical elektrisch electrico"),
		role: Z("consumption opgenomen verbruik consumo verbrauch aufnahme")
	},
	"compressor.suction_temperature": {
		subject: Z(Fo),
		role: Z(Q)
	},
	"compressor.discharge_temperature": {
		subject: Z(Io),
		role: Z(Q)
	},
	"compressor.suction_pressure": {
		subject: Z(Fo),
		role: Z(Oo)
	},
	"compressor.discharge_pressure": {
		subject: Z(Io),
		role: Z(Oo)
	},
	"compressor.mode": {
		subject: Z(zo),
		role: Z("mode modus modo operation operating bedrijf funcionamiento betriebsart")
	},
	"refrigerant.condensation_temperature": {
		subject: Z(Bo),
		role: Z(Q)
	},
	"refrigerant.evaporation_temperature": {
		subject: Z(Vo),
		role: Z(Q)
	},
	"refrigerant.superheat": {
		subject: Z(Wo),
		role: Z(Wo)
	},
	"refrigerant.expansion_valve": {
		subject: Z("expansion expansie expansionsventil expans"),
		role: Z(Ro)
	},
	"heating.capacity": {
		subject: Z(Bo),
		role: Z(Lo)
	},
	"cooling.capacity": {
		subject: Z(Vo),
		role: Z(Lo)
	},
	"heating.demand": {
		subject: Z(Ho),
		role: Z(Po)
	},
	"heating.setpoint": {
		subject: Z(Ho),
		role: Z(`${Q} ${Uo}`)
	},
	"dhw.temperature": {
		subject: Z(No),
		role: Z(Q)
	},
	"dhw.setpoint": {
		subject: Z(No),
		role: Z(`${Q} ${Uo}`)
	},
	"dhw.start_delta": {
		subject: Z(No),
		role: Z("delta difference verschil diferencia unterschied start starten arranque")
	},
	"dhw.demand": {
		subject: Z(No),
		role: Z(Po)
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
		subject: Z(`${Go} heatpump warmtepomp`),
		role: Z(`${Go} power switch schakelaar`)
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
		subject: Z(Ko),
		role: Z(Ko)
	},
	"unit.connection": {
		subject: Z("connection connected connectivity conexion verbinding verbindung online communication"),
		role: Z("connection connected connectivity conexion verbinding verbindung status online communication")
	},
	"unit.cop": {
		subject: Z(es),
		role: Z(es),
		exclude: Z($o)
	},
	"heating.power": {
		subject: Z(Ho),
		role: Z(Jo),
		exclude: Z(Xo)
	},
	"dhw.power": {
		subject: Z(No),
		role: Z(Jo),
		exclude: Z(Zo)
	},
	"htr.active": {
		subject: Z(qo),
		role: Z("active actief activo aktiv")
	},
	"htr.power": {
		subject: Z(qo),
		role: Z(Jo),
		exclude: Z(Qo)
	},
	"unit.system_cop": {
		subject: Z($o),
		role: Z(es)
	}
}, ns = {
	in: Z(`in inlet return retour retorno inflow terug terugvoer terugloop inlaat entrada eintritt ruecklauf rucklauf ingaand eingang ${Fo}`),
	out: Z(`out outlet supply aanvoer uitlaat salida impulsion austritt vorlauf uitgaand ausgang uit ${Io}`)
}, rs = Z(Uo), is = /* @__PURE__ */ new Set(["heating.setpoint", "dhw.setpoint"]), as = Z("flow"), os = {
	exact: 100,
	suffix: 90,
	subject: 30,
	role: 20,
	direction: 10,
	strong: 40,
	tie: 5
}, ss = (e) => e.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replaceAll("ß", "ss"), cs = (e) => ss(e).split(/[^a-z]+/).filter((e) => e !== ""), ls = (e) => {
	let t = e.indexOf(".");
	return [e.slice(0, t), e.slice(t + 1)];
};
function us(e, t, n, r) {
	let i = n[r]?.name_by_user ?? n[r]?.name ?? "";
	return Object.values(t).filter((e) => e?.device_id === r).flatMap((t) => {
		let n = e[t.entity_id];
		if (n === void 0) return [];
		let [r, a] = ls(t.entity_id), o = n.attributes.friendly_name, s = n.attributes.unit_of_measurement, c = n.attributes.device_class;
		return [{
			entityId: t.entity_id,
			domain: r,
			objectId: a,
			unit: typeof s == "string" ? s : void 0,
			deviceClass: typeof c == "string" ? c : void 0,
			names: [...typeof o == "string" ? [ds(o, i)] : [], ...typeof t.name == "string" ? [t.name] : []]
		}];
	});
}
function ds(e, t) {
	let n = ss(t).trim(), r = ss(e);
	if (n === "" || !r.startsWith(n)) return e;
	let i = r.slice(n.length);
	return i === "" || /^[^a-z0-9]/.test(i) ? i : e;
}
function fs(e) {
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
function ps(e) {
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
	return n === void 0 ? fs(e.map((e) => e.objectId)) : `${n[0]}_`;
}
var ms = (e) => (e ?? "").trim().toLowerCase(), hs = {
	"compressor.speed": ["rpm", "hz"],
	"production.pump": ["%", "rpm"],
	"brine.pump": ["%", "rpm"],
	"source.fan_speed": ["%", "rpm"]
}, gs = {
	temperature: ["temperature"],
	difference: ["temperature"],
	power: ["power"],
	pressure: ["pressure", "atmospheric_pressure"]
};
function _s(e, t) {
	if (Et.includes(t.domain)) return !0;
	if (e.kind !== "number") return ms(t.unit) === "" && (t.deviceClass === void 0 || t.deviceClass === "enum");
	if ("quantity" in e && e.quantity !== void 0) {
		if (!bt(e.quantity, t.unit)) return !1;
		let n = gs[e.quantity];
		return t.deviceClass === void 0 || n === void 0 || n.includes(t.deviceClass);
	}
	let n = ms(t.unit), r = hs[e.path] ?? ("unit" in e && e.unit !== void 0 ? [ms(e.unit)] : []);
	return r.length === 0 ? n === "" : r.includes(n);
}
function vs(e, t) {
	return e.accepts.includes(t.domain) && _s(e, t);
}
var ys = (e, t) => e.some((e) => t.some((t) => e.length >= 4 ? t.includes(e) : t === e));
function bs(e, t, n) {
	if (t.entityId === jt(e, n.replace(/_$/, "")) && n !== "") return os.exact;
	if ((e.kind !== "binary" || Et.includes(t.domain)) && (t.objectId === e.suffix || t.objectId.endsWith(`_${e.suffix}`))) return os.suffix;
	let r = [...cs(t.objectId.startsWith(n) ? t.objectId.slice(n.length) : t.objectId), ...t.names.flatMap(cs)];
	if (ys(rs, r) !== is.has(e.path)) return 0;
	let i = ts[e.path];
	if (i.exclude !== void 0 && ys(i.exclude, r)) return 0;
	let a = 0;
	if (ys(i.subject, r) && (a += os.subject), ys(i.role, r) && (a += os.role), e.direction !== void 0) {
		if ((e.direction !== "out" || !ys(as, r) || ys(ns.in, r)) && !ys(ns[e.direction], r)) return 0;
		a += os.direction;
	}
	return a;
}
function xs(e) {
	return typeof e != "object" || !e || Array.isArray(e) ? {} : Object.fromEntries(Object.entries(e).map(([e, t]) => [e, typeof t == "object" && t && !Array.isArray(t) ? xs(t) : t]));
}
function Ss(e) {
	let { states: t, config: n } = e, r = us(t, e.entities, e.devices, e.deviceId), i = ps(r), a = ur(n, Bn(n)), o = /* @__PURE__ */ new Set(), s = [];
	for (let e of k) {
		if (zn(A(n, `entities.${e.path}`))) continue;
		let r = a[e.path];
		r !== void 0 && t[r] !== void 0 ? o.add(r) : s.push(e);
	}
	let c = s.flatMap((e, t) => r.filter((t) => !o.has(t.entityId) && vs(e, t)).map((n) => ({
		role: e,
		order: t,
		candidate: n,
		score: bs(e, n, i)
	}))).filter((e) => e.score > 0).sort((e, t) => t.score - e.score || e.order - t.order || (e.candidate.entityId < t.candidate.entityId ? -1 : 1)), l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set();
	for (let e of c) {
		let t = e.role.path;
		if (e.score < os.strong) break;
		if (l.has(t) || u.has(t) || o.has(e.candidate.entityId)) continue;
		let [n, r] = c.filter((t) => t.role === e.role && !o.has(t.candidate.entityId));
		n !== void 0 && r !== void 0 && n.score - r.score <= os.tie ? u.add(t) : (l.set(t, e.candidate.entityId), o.add(e.candidate.entityId));
	}
	let d = xs(A(n, "entities"));
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
var Cs = E.roleGroups, ws = E.roles, Ts = {
	"heating.power": E.heatPower,
	"dhw.power": E.heatPower,
	"htr.power": E.heatPower
};
function Es(e) {
	let t = e.split(".")[1] ?? "";
	return Ts[e] ?? ws[t] ?? t;
}
function Ds(e) {
	let [t = ""] = e.split(".");
	return `${Cs[t] ?? t}: ${Es(e)}`;
}
// src/editor/binding-check.ts
function Os(e, t) {
	if (t === void 0 || Object.keys(t).length === 0) return [];
	let n = Bn(e), r = ur(e, n), i = dr(e, n);
	return k.flatMap((n) => {
		let a = r[n.path];
		if (a === void 0 || zn(A(e, `entities.${n.path}`))) return [];
		let o = Ds(n.path), s = t[a];
		if (s === void 0) {
			let e = n.path;
			return i.has(e) && kt.includes(e) ? [] : [E.suggest.unknown(o, a)];
		}
		let c = a.slice(0, a.indexOf("."));
		if (!n.accepts.includes(c)) return [E.suggest.kind(o, a)];
		if (s.state === "unavailable") return [];
		let l = s.attributes.unit_of_measurement, u = s.attributes.device_class;
		return _s(n, {
			domain: c,
			unit: typeof l == "string" ? l : void 0,
			deviceClass: typeof u == "string" ? u : void 0
		}) ? [] : [E.suggest.unit(o, a)];
	});
}
// src/editor/fields.ts
var ks = (e, t, { advanced: n = !1 } = {}) => ({
	name: e,
	selector: { entity: { filter: { domain: t } } },
	...n ? { advanced: n } : {}
});
function As(e) {
	let t = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(e.trim())?.[1];
	if (t === void 0) return;
	let n = t.length === 3 ? t.replace(/./g, "$&$&") : t, r = (e) => Number.parseInt(n.slice(e, e + 2), 16);
	return [
		r(0),
		r(2),
		r(4)
	];
}
var js = (e) => Array.isArray(e) && e.length === 3 && e.every((e) => typeof e == "number" && Number.isFinite(e)), Ms = (e) => "#" + e.map((e) => Math.min(255, Math.max(0, Math.round(e))).toString(16).padStart(2, "0")).join(""), Ns = (e) => ({
	name: e,
	selector: { color_rgb: {} }
}), Ps = (e, t, n, r = t.default) => ({
	name: e,
	default: r,
	selector: { select: {
		mode: "dropdown",
		options: t.choices.map((e) => ({
			value: e,
			label: n[e] ?? e
		}))
	} }
}), Fs = "#9e9e9e", Is = /^colors_(\d+)_(temperature|color)$/;
function Ls(e) {
	let t = Is.exec(e);
	return t?.[1] === void 0 ? void 0 : {
		index: Number(t[1]),
		part: t[2]
	};
}
function Rs(e) {
	let t = A(e, "colors");
	return Array.isArray(t) ? t.map((e) => {
		let { temperature: t, color: n } = typeof e == "object" && e ? e : {};
		return {
			...typeof t == "number" ? { temperature: t } : {},
			...typeof n == "string" ? { color: n } : {}
		};
	}) : un.map((e) => ({ ...e }));
}
var zs = As("#9e9e9e") ?? [
	158,
	158,
	158
], Bs = () => ({ color: zs });
function Vs(e) {
	let t = [...e];
	for (; t.length >= 2 && t[t.length - 1]?.temperature === void 0 && t[t.length - 2]?.temperature === void 0;) t.pop();
	return t.at(-1)?.temperature === void 0 && t.length > 0 ? t : [...t, Bs()];
}
function Hs(e) {
	return Vs(Rs(e).map(({ temperature: e, color: t }) => {
		let n = t === void 0 ? void 0 : As(t);
		return {
			...e === void 0 ? {} : { temperature: e },
			...n === void 0 ? {} : { color: n },
			...t === void 0 ? {} : { orig: t }
		};
	}));
}
function Us(e) {
	return Array.from({ length: e }, (e, t) => t).flatMap((e) => [{
		name: `colors_${String(e)}_temperature`,
		selector: { number: {
			step: "any",
			mode: "box",
			unit_of_measurement: w.celsius
		} }
	}, Ns(`colors_${String(e)}_color`)]);
}
function Ws(e) {
	let t = {};
	return e.forEach(({ temperature: e, color: n }, r) => {
		e !== void 0 && (t[`colors_${String(r)}_temperature`] = e), n !== void 0 && (t[`colors_${String(r)}_color`] = [...n]);
	}), t;
}
function Gs(e) {
	let t = /* @__PURE__ */ new Map(), n = {};
	for (let [r, i] of Object.entries(e)) {
		let e = Ls(r);
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
var Ks = (e, t) => e.every((e, n) => e === t[n]);
function qs(e) {
	let t = typeof e == "string" && e.trim() !== "" ? Number(e) : e;
	return typeof t == "number" && Number.isFinite(t) ? t : void 0;
}
function Js(e, t) {
	let n = t === void 0 ? void 0 : As(t);
	return js(e) ? t !== void 0 && n && Ks(n, e) ? t : Ms(e) : t !== void 0 && n === void 0 ? t : Fs;
}
function Ys(e, t) {
	let n = Math.max(e.length, ...[...t.keys()].map((e) => e + 1));
	return Vs(Array.from({ length: n }, (n, r) => {
		let i = t.get(r), a = qs(i?.temperature), o = i !== void 0 && js(i.color) ? i.color : void 0, s = e[r]?.orig;
		return {
			...a === void 0 ? {} : { temperature: a },
			...o === void 0 ? {} : { color: o },
			...s === void 0 ? {} : { orig: s }
		};
	}));
}
var Xs = (e, t) => e.length === t.length && e.every((e, n) => e.temperature === t[n]?.temperature && e.color === t[n]?.color), Zs = (e) => e.length === un.length && e.every((e, t) => {
	let n = un[t];
	return e.temperature === n?.temperature && e.color.toLowerCase() === n.color;
});
function Qs(e, t) {
	let n = e.flatMap(({ temperature: e, color: t, orig: n }) => e === void 0 ? [] : [{
		temperature: e,
		color: Js(t, n)
	}]).sort((e, t) => e.temperature - t.temperature), r = A(t, "colors");
	return Array.isArray(r) && Xs(n, Rs(t)) ? "keep" : Zs(n) ? r !== void 0 && !Array.isArray(r) ? "keep" : void 0 : n;
}
function $s(e, t) {
	return t === void 0 ? Object.fromEntries(Object.entries(e).filter(([e]) => e !== "colors")) : {
		...e,
		colors: t
	};
}
// src/editor/ecogeo-schema.ts
var ec = [
	"features",
	"entities",
	"states"
], tc = ["entities"], nc = "_device", rc = "_not_present", ic = "default", ac = [
	[ic, void 0],
	["true", !0],
	["false", !1],
	["unused", "unused"]
];
function oc(e, t) {
	let { on: n, off: r, unused: i, presetOn: a, presetOff: o, presetUnused: s, variantDefault: c } = E.featureChoices;
	return {
		name: e,
		default: ic,
		coded: ac,
		selector: { select: {
			mode: "dropdown",
			options: [
				{
					value: ic,
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
var sc = [
	"passive_cooling",
	"active_cooling",
	"htr",
	"backup_heater"
];
function cc() {
	return {
		name: "variant",
		default: "4",
		coded: xn.map((e) => [String(e), e]),
		selector: { select: {
			mode: "dropdown",
			options: xn.map((e) => ({
				value: String(e),
				label: E.choices.variant[e]
			}))
		} }
	};
}
var lc = (e) => En.filter((t) => t === "unused" || t === In(e) || t === "none" && e === "B");
function uc(e, t) {
	let n = A(e, "dhw"), r = lc(t), i = En.filter((e) => r.includes(e) || e === n);
	return Ps("dhw", {
		...An,
		choices: i
	}, E.choices.dhw, In(t));
}
function dc(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of k) {
		if (zn(A(e, `entities.${n.path}`))) continue;
		let [r = "", i = ""] = n.path.split(".");
		t.set(r, [...t.get(r) ?? [], {
			...ks(i, n.accepts, { advanced: !0 }),
			label: Es(n.path)
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
var fc = () => ({
	name: rc,
	advanced: !0,
	selector: { select: {
		multiple: !0,
		mode: "dropdown",
		options: k.map((e) => ({
			value: e.path,
			label: Ds(e.path)
		}))
	} }
}), pc = {
	off: "unit.on_off",
	defrost: "compressor.mode"
};
function mc(e, t) {
	let n = ur(e, Bn(e)), r = (e) => {
		let r = n[pc[e]], i = r === void 0 ? void 0 : t?.[r]?.attributes.options;
		return Array.isArray(i) ? i.filter((e) => typeof e == "string") : [];
	};
	return {
		off: r("off"),
		defrost: r("defrost")
	};
}
function hc(e) {
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
function gc(e, t = Hs(e).length, n) {
	let r = Sn(Vn(e)), i = A(e, "model") === wn[1] ? wn[1] : wn[0];
	return [
		{
			type: "expandable",
			name: "unit",
			flatten: !0,
			schema: [
				Ps("model", On, E.choices.model),
				cc(),
				Ps("source", kn, E.choices.source),
				uc(e, i),
				Ps("emitter", jn, E.choices.emitter)
			]
		},
		{
			type: "expandable",
			name: "entity_prefix",
			flatten: !0,
			schema: [{
				name: nc,
				selector: { device: {} }
			}, {
				name: "prefix",
				selector: { text: {} }
			}]
		},
		{
			type: "expandable",
			name: "features",
			schema: sc.map((e) => oc(e, r[e]))
		},
		{
			type: "expandable",
			name: "appearance",
			flatten: !0,
			schema: [
				Ps("exchanger_fill", Mn, E.choices.exchanger_fill),
				Ps("layout", Nn, E.choices.layout),
				...Us(t)
			]
		},
		dc(e),
		fc(),
		hc(mc(e, n))
	];
}
// src/editor/schema.ts
function _c(e) {
	return "type" in e;
}
function vc(e) {
	let { advanced: t, ...n } = e;
	return n;
}
function yc(e, t) {
	return e.flatMap((e) => {
		if (!_c(e)) return t || e.advanced !== !0 ? [vc(e)] : [];
		let n = yc(e.schema, t);
		return n.length > 0 ? [{
			...e,
			schema: n
		}] : [];
	});
}
function $(e, t = "") {
	return e.flatMap((e) => _c(e) ? $(e.schema, e.flatten ? t : `${t}${e.name}.`) : [{
		field: e,
		path: `${t}${e.name}`
	}]);
}
function bc(e, t) {
	return yc(e, t);
}
function xc(e, t) {
	if (e == null || e === "") return !1;
	if (t.default === void 0) return !0;
	if (typeof t.default == "number") {
		let n = typeof e == "number" ? e : typeof e == "string" ? dt(e) : void 0;
		if (n !== void 0) return n !== t.default;
	}
	return Sc(e) !== Sc(t.default);
}
function Sc(e) {
	return (typeof e == "string" || typeof e == "number" || typeof e == "boolean" ? String(e) : JSON.stringify(e)).toLowerCase();
}
function Cc(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function wc(e, t, n, r, i = "") {
	let [a, ...o] = t.split("."), s = e, { [a]: c, ...l } = s;
	if (o.length === 0) return n === void 0 ? l : Object.hasOwn(s, a) ? {
		...s,
		[a]: n
	} : {
		...l,
		[a]: n
	};
	let u = wc(Cc(c) ? c : {}, o.join("."), n, r, `${i}${a}.`), d = r !== void 0 && A(r, `${i}${a}`) !== void 0;
	return n === void 0 && Object.keys(u).length === 0 && !d ? l : {
		...s,
		[a]: u
	};
}
function Tc(e, t, n = /* @__PURE__ */ new Set()) {
	return $(e).reduce((e, { field: r, path: i }) => r.default !== void 0 && A(t, i) === void 0 && !n.has(i) ? wc(e, i, r.default) : e, t);
}
function Ec(e, t, n) {
	return $(e).map(({ path: e }) => e).filter((e) => A(t, e) !== void 0 && A(n, e) === void 0);
}
function Dc(e) {
	if (!Cc(e)) return e;
	let t = Object.entries(e).filter(([, e]) => e !== void 0).map(([e, t]) => [e, Dc(t)]);
	return t.length !== Object.keys(e).length || t.some(([t, n]) => n !== e[t]) ? Object.fromEntries(t) : e;
}
function Oc(e, t) {
	return $(e).reduce((e, { field: n, path: r }) => ("text" in n.selector || "entity" in n.selector) && A(e, r) === "" ? wc(e, r, void 0, t) : e, t);
}
function kc(e, t) {
	return $(e).reduce((e, { field: t, path: n }) => {
		let r = A(e, n), i = t.coded?.find(([, e]) => e !== void 0 && e === r);
		return i === void 0 ? e : wc(e, n, i[0]);
	}, t);
}
function Ac(e, t, n) {
	return $(e).reduce((e, { field: t, path: r }) => {
		let i = A(e, r), a = t.coded?.find(([e]) => e === i);
		return a === void 0 ? e : wc(e, r, a[1], n);
	}, t);
}
function jc(e, t, n, r = []) {
	let i = (e) => Cc(e) && Object.keys(e).length === 0;
	return Object.fromEntries(Object.entries(e).flatMap(([e, a]) => {
		if (!n.includes(e) || !Cc(a)) return [[e, a]];
		let o = t[e], s = r.includes(e) ? Object.fromEntries(Object.entries(a).filter(([e, t]) => !i(t) || Cc(o) && i(o[e]))) : a;
		return Object.keys(s).length > 0 || i(o) ? [[e, s]] : [];
	}));
}
function Mc(e, t, n) {
	return $(e).reduce((e, { field: n, path: r }) => n.default !== void 0 && A(t, r) === void 0 && A(e, r) !== void 0 && !xc(A(e, r), n) ? wc(e, r, void 0, t) : e, n);
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/decorate.js
function Nc(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
// src/editor/ecogeo-card-editor.ts
var Pc = "ecogeo-card-editor", Fc = [{
	name: "advanced",
	selector: { boolean: {} }
}], Ic = () => E.advanced, Lc = E.sections, Rc = E.fields, zc = E.roles;
function Bc(e) {
	if (_c(e)) return e.title ?? Lc[e.name] ?? e.name;
	let t = Ls(e.name);
	return t === void 0 ? e.label === void 0 ? Rc[e.name] ?? zc[e.name] ?? e.name : e.label : E.colorRow[t.part](t.index + 1);
}
var Vc = (e) => Object.hasOwn(e, "entities") || Object.hasOwn(e, "states"), Hc = (e) => Object.hasOwn(e, "entities"), Uc = [nc, rc];
function Wc(e, t) {
	let n = e.states;
	if (typeof n != "object" || !n || Array.isArray(n)) return e;
	let r = (e, t) => Array.isArray(e) && Array.isArray(t) && e.length === t.length && e.every((e, n) => String(e).trim().toLowerCase() === String(t[n]).trim().toLowerCase()), i = Object.entries(n).filter(([e, n]) => {
		if (!Array.isArray(n)) return !0;
		if (n.length === 0) return !1;
		let i = e === "off" || e === "defrost" ? st[e] : void 0, a = JSON.stringify(n) === JSON.stringify(A(t, `states.${e}`));
		return i === void 0 || !r(n, i) || a;
	});
	return {
		...e,
		states: Object.fromEntries(i)
	};
}
function Gc(e, t, n) {
	let r = e;
	for (let e of Xn(n)) t.has(e) || (r = wc(r, `entities.${e}`, void 0, n));
	for (let e of t) r = wc(r, `entities.${e}`, "none", n);
	return r;
}
var Kc = class extends Ue {
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
		super(), this.schemaFor = gc, this._switch = { advanced: !1 }, this._optionsKey = "", this._formDefined = customElements.get("ha-form") !== void 0, this._schema = [], this._formSchema = [], this._shown = {}, this._draft = [], this._draftBuilt = !1, this._emptied = /* @__PURE__ */ new Set(), this._toggleAdvanced = (e) => {
			e.stopPropagation(), this._switch = { advanced: e.detail.value.advanced === !0 };
		}, this._configChanged = (e) => {
			e.stopPropagation();
			let t = this._config ?? {}, { [nc]: n, [rc]: r, ...i } = e.detail.value, a = this._has(nc), o = typeof n == "string" && n !== "" ? n : void 0;
			if (a && o !== this._device) {
				this._device = o, this._report = void 0;
				return;
			}
			this._report = void 0;
			let s = this._has(rc), c = a || s ? i : e.detail.value, l = this._hasColorRows, u = l ? Gs(c) : void 0, d = Dc(Oc(this._schema, u?.rest ?? c)), f = l ? Gs(this._shown).rest : this._shown, p = (e) => {
				let t = A(d, e);
				return e.startsWith("states.") && Array.isArray(t) && t.length === 0;
			}, m = [...Ec(this._schema, f, d), ...$(this._schema).map(({ path: e }) => e).filter((e) => p(e) && A(f, e) !== void 0)].filter((e) => !Uc.includes(e));
			this._emptied = new Set([...this._emptied, ...m].filter((e) => A(d, e) === void 0 || p(e)));
			let h = Ac(this._schema, d, t), g = s && (Array.isArray(r) || Object.hasOwn(e.detail.value, "_not_present")) ? Gc(h, new Set(Array.isArray(r) ? r.filter((e) => typeof e == "string") : []), t) : h, _ = jc(Wc(Mc(this._schema, t, g), t), t, ec, tc);
			u && (this._draft = Ys(this._draft, u.rows));
			let v = u ? Qs(this._draft, t) : "keep", y = v === "keep" ? _ : $s(_, v);
			this._colorsSeen = y.colors, this._config = y, this._refreshSchema(y), this.dispatchEvent(new CustomEvent("config-changed", {
				detail: { config: y },
				bubbles: !0,
				composed: !0
			}));
		}, this._suggest = () => {
			let e = this._pickDevice(), t = this.hass;
			if (e === void 0 || t === void 0 || this._config === void 0) return;
			let n = this._config, { entities: r, report: i } = Ss({
				states: t.states,
				entities: t.entities ?? {},
				devices: t.devices ?? {},
				deviceId: e,
				config: n
			});
			this._switch = { advanced: !0 }, this._report = {
				filled: i.filled.length,
				empty: i.empty.map(Ds)
			};
			let a = Object.keys(r).length === 0 && !Hc(n) ? n : {
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
		let n = this._config !== void 0 && Vc(this._config);
		Vc(e) && !n && !this._switch.advanced && (this._switch = { advanced: !0 }), this._draftBuilt && JSON.stringify(e.colors) === JSON.stringify(this._colorsSeen) || (this._draft = Hs(e), this._colorsSeen = e.colors, this._draftBuilt = !0), this._config = e, this._refreshSchema(e);
	}
	_refreshSchema(e) {
		let t = this.schemaFor(e, this._draft.length, this.hass?.states);
		this._optionsKey = JSON.stringify(mc(e, this.hass?.states)), JSON.stringify(t) !== JSON.stringify(this._schema) && (this._schema = t, this._formSchema = bc(t, this._switch.advanced));
	}
	willUpdate(e) {
		(e.has("schemaFor") && this._config || e.has("hass") && this._config && JSON.stringify(mc(this._config, this.hass?.states)) !== this._optionsKey) && this._refreshSchema(this._config), e.has("_switch") && (this._formSchema = bc(this._schema, this._switch.advanced)), this._config && (e.has("_config") || e.has("schemaFor") || e.has("_device")) && (this._shown = {
			...kc(this._schema, Tc(this._schema, this._config, this._emptied)),
			...this._hasColorRows ? Ws(this._draft) : {},
			...this._has("_device") && this._device !== void 0 ? { [nc]: this._device } : {},
			...this._has("_not_present") ? { [rc]: [...Xn(this._config)] } : {}
		});
	}
	_has(e) {
		return $(this._schema).some(({ path: t }) => t === e);
	}
	get _hasColorRows() {
		return $(this._schema).some(({ path: e }) => Ls(e) !== void 0);
	}
	_pickDevice() {
		return this.hass === void 0 ? void 0 : this._device;
	}
	_renderNotes() {
		let e = this._config ? Os(this._config, this.hass?.states) : [];
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
                .schema=${Fc}
                .computeLabel=${Ic}
                @value-changed=${this._toggleAdvanced}
              ></ha-form>
              <ha-form
                .hass=${this.hass}
                .data=${this._shown}
                .schema=${this._formSchema}
                .computeLabel=${Bc}
                @value-changed=${this._configChanged}
              ></ha-form>
              ${this._renderNotes()}` : b`<p class="hint">${E.noForm}</p>`}
    `;
	}
};
Nc([To({ attribute: !1 })], Kc.prototype, "hass", void 0), Nc([To({ attribute: !1 })], Kc.prototype, "schemaFor", void 0), Nc([Eo()], Kc.prototype, "_config", void 0), Nc([Eo()], Kc.prototype, "_switch", void 0), Nc([Eo()], Kc.prototype, "_device", void 0), Nc([Eo()], Kc.prototype, "_report", void 0), Nc([Eo()], Kc.prototype, "_formDefined", void 0), Do(Pc, Kc);
// src/diagram/source.ts
var qc = o`
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
  .muted .source-divider,
  .muted .source-ground {
    stroke: var(--disabled-text-color);
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
`, Jc = (e) => Math.round(e * 100) / 100, Yc = 3, Xc = (e) => e === !0 ? Yc : e === void 0 || e === !1 || !(e > 0) ? void 0 : Math.min(6, Math.max(.5, 120 / e)), Zc = [
	0,
	72,
	144,
	216,
	288
].map((e) => x`<path class="fan-blade" d="M0 -4 C9 -6 21 -16 17 -30 C6 -26 -3 -17 -3 -6 Z" transform="rotate(${e})" />`), Qc = 34;
function $c(e, t, n, r) {
	let { x: i, y: a, width: o, height: s, fan: c, coil: l, fins: u, dividerY: d } = e, f = Xc(t), p = Array.from({ length: u.count }, (e, t) => Jc(u.y0 + t * u.step)), m = Jc(c.radius / Qc), h = xr(br(_r, r), r?.onTap);
	return x`<g class="air-unit${n ? " muted" : ""}" data-source="air" aria-label=${at}>
    <title>${at}</title>
    <rect class="source-outline" x=${i} y=${a} width=${o} height=${s} rx="6" />
    <path class="source-divider" d="M${i} ${d} H${Jc(i + o)}" />
    ${Ya("air-divider", {
		x: i,
		y: d - 1.5,
		width: o,
		height: 3
	})}
    <rect class="source-frame" data-coil-block data-obstacle="air-coil" x=${l.x} y=${l.y} width=${l.width} height=${l.height} rx="3" />
    ${p.map((e) => x`<path class="source-fin" d="M${u.x0} ${e} H${u.x1}" />`)}
    <g class="fan-part" aria-label=${it} role=${h.role} tabindex=${h.tabindex} @click=${h.click} @keydown=${h.keydown}>
      <title>${it}</title>
      <circle class="fan-ring" data-obstacle="air-fan" cx=${c.cx} cy=${c.cy} r=${c.radius} />
      <circle class="fan-hit" cx=${c.cx} cy=${c.cy} r=${c.radius} fill="transparent" stroke="none" />
      <g class="fan" data-fan transform="translate(${c.cx} ${c.cy})${m === 1 ? "" : ` scale(${String(m)})`}">
        <g class=${f === void 0 ? "fan-rotor still" : "fan-rotor"} style=${f === void 0 ? "" : `--fan-duration: ${String(f)}s`}>${Zc}<circle class="fan-hub" r="5" fill="var(--primary-text-color)" /></g>
      </g>
    </g>
  </g>`;
}
function el(e, t) {
	let { x: n, y: r, width: i, height: a, hatch: o, serpentine: s } = e, c = Array.from({ length: Math.floor((i - 20) / 10) + 1 }, (e, t) => Jc(n + 14 + t * 10));
	return x`<g class="ground-collector${t ? " muted" : ""}" data-source="ground" aria-label=${ot}>
    <title>${ot}</title>
    <rect class="source-outline" x=${n} y=${r} width=${i} height=${a} rx="4" />
    <path class="source-ground" d="M${n} ${o.y + o.height} H${Jc(n + i)}" />
    ${c.map((e) => x`<path class="source-ground" d="M${e} ${r} l-8 ${o.height}" />`)}
    ${Ya("ground-hatch", o)}
    ${Ya("ground-serpentine", s)}
  </g>`;
}
function tl(e, t, n, r) {
	let { airUnit: i, collector: a } = Wi(e), o = e.source === "air" || e.source === "hybrid", s = e.source === "ground" || e.source === "hybrid";
	return x`<g class="source" data-source-kind=${e.source}>
    ${o && i !== void 0 ? $c(i, t["source.fan_speed"], !n, r) : x``}
    ${s && a !== void 0 ? el(a, !n) : x``}
  </g>`;
}
// src/lib/version.ts
var nl = "1.0.0";
// src/lib/render.ts
function rl(e, t) {
	return e === t || Array.isArray(e) && Array.isArray(t) && e.length === t.length && e.every((e, n) => e === t[n]);
}
function il(e, t) {
	if (e === t) return !0;
	if (typeof e != "object" || typeof t != "object" || e === null || t === null) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	return n.length === r.length && n.every((n) => Object.hasOwn(t, n) && rl(e[n], t[n]));
}
function al(e, t, n) {
	return e === void 0 || e.locale !== t.locale || e.language !== t.language || e.localize !== t.localize || e.formatEntityState !== t.formatEntityState || e.themes?.darkMode !== t.themes?.darkMode || n.some((n) => e.states[n] !== t.states[n] || !il(e.entities?.[n], t.entities?.[n]));
}
function ol(e, t, n, r) {
	return e.size === 1 && e.has("hass") ? t !== void 0 && al(n, t, r) : !0;
}
// src/suggest/stub.ts
function sl(e, t, n) {
	let r = us(e.states, t, e.devices ?? {}, n), i = ps(r).replace(/_$/, "");
	if (i === "") return;
	let a = new Set(r.map((e) => e.entityId));
	return k.filter((e) => a.has(jt(e, i))).length * 2 >= k.length ? i : void 0;
}
function cl(e) {
	if (e === void 0) return {};
	let t = /* @__PURE__ */ new Map();
	for (let n of Object.values(e.entities ?? {})) {
		if (typeof n.device_id != "string") continue;
		let e = t.get(n.device_id) ?? {};
		e[n.entity_id] = n, t.set(n.device_id, e);
	}
	let n = [...t].flatMap(([t, n]) => sl(e, n, t) ?? []);
	return n.length === 1 ? { prefix: n[0] } : {};
}
// src/card/ecogeo-card.ts
var ll = "ecogeo-card", ul = 0;
Do("ecogeo-card", class extends Ue {
	static {
		this.version = nl;
	}
	static {
		this.styles = [
			La,
			qc,
			Xa,
			qa,
			ho,
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
		return document.createElement(Pc);
	}
	static getStubConfig(e) {
		return cl(e);
	}
	constructor() {
		super(), this.renderedVertical = !1, this.renderedAutoVertical = !1, this.renderedStroke = Or(void 0), this.renderedDrawing = 0, this.entityIds = [], this.idPrefix = `ecogeo${String(++ul)}`, this.onWindowResize = () => {
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
		return this.drawingWidthFor(Ui("horizontal").viewBox);
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
		return ol(e, this.hass, this.renderedHass, this.entityIds);
	}
	arrangementViewBox(e) {
		let t = this.resolved;
		return Ui(e, t === void 0 ? void 0 : Fi(t)).viewBox;
	}
	fittedWidth(e) {
		if (!this.inPanel || !(this.width > 0)) return 0;
		let t = this.drawingWidthFor(this.arrangementViewBox(e));
		return t < this.width ? t : 0;
	}
	readings(e) {
		let t = e.sample ? lr : this.hass?.states ?? {};
		return {
			readings: Ft(t, e.entities),
			absent: It(t, e.entities, e.defaulted),
			offline: Ut(mt(t, e.entities["unit.connection"]))
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
		let o = Ui(e, Fi(a)), { viewBox: s } = o, c = {
			...a,
			arrangement: o
		}, { readings: l, absent: u, offline: d } = this.readings(c), f = Ht(l, c.features, c.states), p = Gt(f, c.features, c.dhw, l, !c.notPresent.has("brine.pump"), !u.has("htr.active")), m = c.sample ? lr : this.hass?.states ?? {}, h = Rt(l, c.entities, m), g = {
			mode: f,
			circuits: p,
			readings: h,
			stops: c.colors
		}, _ = {
			locale: no(this.hass),
			entities: this.hass?.entities,
			states: m
		}, v = c.sample ? void 0 : (e) => {
			ht(this, e);
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
          style="--dhw-tank-color: ${c.dhw === "unused" ? j : wa(g)}; --ecogeo-coil-muted: ${pn(this.hass?.themes?.darkMode === !0)}; --pipe-width: ${String(r.pipe)}; --outline-width: ${String(r.outline)}"
        >
          ${x`${eo(c, g, y, {
			mode: c.exchangerFill,
			idPrefix: this.idPrefix
		})}${tl(c, h, p.active.has("brine"), y)}${Ja(c, y)}${Ka(c, g, y, {
			mode: c.exchangerFill,
			idPrefix: this.idPrefix
		}, r.pipe)}`}
        </svg>
        ${xo(_o(c, l, c.entities, _, c.notPresent), v, s)}
      </div>
      <div class="footer">
        <span class="mode">${Je[f]}</span>
        ${So(vo(l, c.entities, _, {
			mode: f,
			features: c.features,
			dhw: c.dhw,
			notPresent: c.notPresent,
			absent: u
		}), v)}
        ${Wt(l["unit.alarm"]) ? b`<span class="alarm">${Ye.alarm}</span>` : S}
        ${d ? b`<span class="offline">${Ye.offline}</span>` : S}
        ${c.sample ? b`<span class="sample">${Ye.sampleValues}</span>` : S}
      </div>
    </ha-card>`;
	}
}) && console.info(`ecogeo-card ${nl}`);
// src/index.ts
var dl = {
	type: ll,
	...Ge,
	preview: !0
};
function fl(e = window) {
	let t = e.customCards ??= [];
	t.some((e) => e.type === dl.type) || t.push({ ...dl });
}
fl();
export { dl as CARD_ENTRY, fl as registerCardPicker };
