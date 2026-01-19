function createModule(e, _globalThis) {
  for (var r = 0; r < _globalThis.length; r++) {
    const n = _globalThis[r];
    if (typeof n != "string" && !Array.isArray(n)) {
      for (const t in n) {
        if (t !== "default" && !(t in e)) {
          const r = Object.getOwnPropertyDescriptor(n, t);
          if (r) {
            Object.defineProperty(
              e,
              t,
              r.get
                ? r
                : {
                    enumerable: true,
                    get: () => n[t],
                  },
            );
          }
        }
      }
    }
  }
  return Object.freeze(
    Object.defineProperty(e, Symbol.toStringTag, {
      value: "Module",
    }),
  );
}
var globalContext =
  typeof globalThis != "undefined"
    ? globalThis
    : typeof window != "undefined"
      ? window
      : typeof global != "undefined"
        ? global
        : typeof self != "undefined"
          ? self
          : {};
function getDefaultExport(moduleExports) {
  if (
    moduleExports &&
    moduleExports.__esModule &&
    Object.prototype.hasOwnProperty.call(moduleExports, "default")
  ) {
    return moduleExports.default;
  } else {
    return moduleExports;
  }
}
function createEsModuleProxy(module) {
  if (Object.prototype.hasOwnProperty.call(module, "__esModule")) {
    return module;
  }
  var t = module.default;
  if (typeof t == "function") {
    var r = function constructorProxy() {
      var r = false;
      try {
        r = this instanceof constructorProxy;
      } catch {}
      if (r) {
        return Reflect.construct(t, arguments, this.constructor);
      } else {
        return t.apply(this, arguments);
      }
    };
    r.prototype = t.prototype;
  } else {
    r = {};
  }
  Object.defineProperty(r, "__esModule", {
    value: true,
  });
  Object.keys(module).forEach(function (moduleKey) {
    var n = Object.getOwnPropertyDescriptor(module, moduleKey);
    Object.defineProperty(
      r,
      moduleKey,
      n.get
        ? n
        : {
            enumerable: true,
            get: function () {
              return module[moduleKey];
            },
          },
    );
  });
  return r;
}
var isInitialized;
var isReactInitialized;
var moduleCache = {
  exports: {},
};
var reactElements = {};
function initializeReact() {
  if (!isReactInitialized) {
    isReactInitialized = 1;
    moduleCache.exports = (function () {
      if (isInitialized) {
        return reactElements;
      }
      isInitialized = 1;
      var e = Symbol.for("react.transitional.element");
      var t = Symbol.for("react.fragment");
      function r(Fragment, r, propDescriptor) {
        var a = null;
        if (propDescriptor !== undefined) {
          a = "" + propDescriptor;
        }
        if (r.key !== undefined) {
          a = "" + r.key;
        }
        if ("key" in r) {
          propDescriptor = {};
          for (var o in r) {
            if (o !== "key") {
              propDescriptor[o] = r[o];
            }
          }
        } else {
          propDescriptor = r;
        }
        r = propDescriptor.ref;
        return {
          $$typeof: e,
          type: Fragment,
          key: a,
          ref: r !== undefined ? r : null,
          props: propDescriptor,
        };
      }
      reactElements.Fragment = t;
      reactElements.jsx = r;
      reactElements.jsxs = r;
      return reactElements;
    })();
  }
  return moduleCache.exports;
}
var createElement;
var _createElement;
var createReactElement = initializeReact();
var __createElement = {
  exports: {},
};
var ___createElement = {};
function _______createReactElement() {
  if (createElement) {
    return ___createElement;
  }
  createElement = 1;
  var e = Symbol.for("react.transitional.element");
  var t = Symbol.for("react.portal");
  var r = Symbol.for("react.fragment");
  var n = Symbol.for("react.strict_mode");
  var a = Symbol.for("react.profiler");
  var o = Symbol.for("react.consumer");
  var s = Symbol.for("react.context");
  var i = Symbol.for("react.forward_ref");
  var c = Symbol.for("react.suspense");
  var l = Symbol.for("react.memo");
  var f = Symbol.for("react.lazy");
  var d = Symbol.for("react.activity");
  var h = Symbol.iterator;
  var y = {
    isMounted: function () {
      return false;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {},
  };
  var m = Object.assign;
  var E = {};
  function _(reactElement, isPortal, createJSXElement) {
    this.props = reactElement;
    this.context = isPortal;
    this.refs = E;
    this.updater = createJSXElement || y;
  }
  function w() {}
  function g(_reactElement, portalSymbol, fragmentSymbol) {
    this.props = _reactElement;
    this.context = portalSymbol;
    this.refs = E;
    this.updater = fragmentSymbol || y;
  }
  _.prototype.isReactComponent = {};
  _.prototype.setState = function (reactTransitionalElement, _portalSymbol) {
    if (
      typeof reactTransitionalElement != "object" &&
      typeof reactTransitionalElement != "function" &&
      reactTransitionalElement != null
    ) {
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables.",
      );
    }
    this.updater.enqueueSetState(
      this,
      reactTransitionalElement,
      _portalSymbol,
      "setState",
    );
  };
  _.prototype.forceUpdate = function (Component) {
    this.updater.enqueueForceUpdate(this, Component, "forceUpdate");
  };
  w.prototype = _.prototype;
  var S = (g.prototype = new w());
  S.constructor = g;
  m(S, _.prototype);
  S.isPureReactComponent = true;
  var T = Array.isArray;
  function b() {}
  var A = {
    H: null,
    A: null,
    T: null,
    S: null,
  };
  var v = Object.prototype.hasOwnProperty;
  function _________createReactElement(_Component, __Component, ___Component) {
    var a = ___Component.ref;
    return {
      $$typeof: e,
      type: _Component,
      key: __Component,
      ref: a !== undefined ? a : null,
      props: ___Component,
    };
  }
  function R(____Component) {
    return (
      typeof ____Component == "object" &&
      ____Component !== null &&
      ____Component.$$typeof === e
    );
  }
  var P = /\/+/g;
  function I(EmptyFunction, _____Component) {
    if (
      typeof EmptyFunction == "object" &&
      EmptyFunction !== null &&
      EmptyFunction.key != null
    ) {
      r = "" + EmptyFunction.key;
      n = {
        "=": "=0",
        ":": "=2",
      };
      return (
        "$" +
        r.replace(/[=:]/g, function (ReactComponentError) {
          return n[ReactComponentError];
        })
      );
    } else {
      return _____Component.toString(36);
    }
    var r;
    var n;
  }
  function D(callback, _callback, refValue, __callback, ___callback) {
    var i = typeof callback;
    if (i === "undefined" || i === "boolean") {
      callback = null;
    }
    var c;
    var u;
    var l = false;
    if (callback === null) {
      l = true;
    } else {
      switch (i) {
        case "bigint":
        case "string":
        case "number":
          l = true;
          break;
        case "object":
          switch (callback.$$typeof) {
            case e:
            case t:
              l = true;
              break;
            case f:
              return D(
                (l = callback._init)(callback._payload),
                _callback,
                refValue,
                __callback,
                ___callback,
              );
          }
      }
    }
    if (l) {
      ___callback = ___callback(callback);
      if (__callback === "") {
        l = "." + I(callback, 0);
      } else {
        l = __callback;
      }
      if (T(___callback)) {
        refValue = "";
        if (l != null) {
          refValue = l.replace(P, "$&/") + "/";
        }
        D(___callback, _callback, refValue, "", function (REACT_ELEMENT_TYPE) {
          return REACT_ELEMENT_TYPE;
        });
      } else if (___callback != null) {
        if (R(___callback)) {
          c = ___callback;
          u =
            refValue +
            (___callback.key == null ||
            (callback && callback.key === ___callback.key)
              ? ""
              : ("" + ___callback.key).replace(P, "$&/") + "/") +
            l;
          ___callback = _________createReactElement(c.type, u, c.props);
        }
        _callback.push(___callback);
      }
      return 1;
    }
    l = 0;
    var d;
    var p = __callback === "" ? "." : __callback + ":";
    if (T(callback)) {
      for (var y = 0; y < callback.length; y++) {
        l += D(
          (__callback = callback[y]),
          _callback,
          refValue,
          (i = p + I(__callback, y)),
          ___callback,
        );
      }
    } else if (
      typeof (y =
        (d = callback) === null || typeof d != "object"
          ? null
          : typeof (d = (h && d[h]) || d["@@iterator"]) == "function"
            ? d
            : null) == "function"
    ) {
      callback = y.call(callback);
      y = 0;
      while (!(__callback = callback.next()).done) {
        l += D(
          (__callback = __callback.value),
          _callback,
          refValue,
          (i = p + I(__callback, y++)),
          ___callback,
        );
      }
    } else if (i === "object") {
      if (typeof callback.then == "function") {
        return D(
          (function (_REACT_ELEMENT_TYPE) {
            switch (_REACT_ELEMENT_TYPE.status) {
              case "fulfilled":
                return _REACT_ELEMENT_TYPE.value;
              case "rejected":
                throw _REACT_ELEMENT_TYPE.reason;
              default:
                if (typeof _REACT_ELEMENT_TYPE.status == "string") {
                  _REACT_ELEMENT_TYPE.then(b, b);
                } else {
                  _REACT_ELEMENT_TYPE.status = "pending";
                  _REACT_ELEMENT_TYPE.then(
                    function (REACT_FRAGMENT_TYPE) {
                      if (_REACT_ELEMENT_TYPE.status === "pending") {
                        _REACT_ELEMENT_TYPE.status = "fulfilled";
                        _REACT_ELEMENT_TYPE.value = REACT_FRAGMENT_TYPE;
                      }
                    },
                    function (element) {
                      if (_REACT_ELEMENT_TYPE.status === "pending") {
                        _REACT_ELEMENT_TYPE.status = "rejected";
                        _REACT_ELEMENT_TYPE.reason = element;
                      }
                    },
                  );
                }
                switch (_REACT_ELEMENT_TYPE.status) {
                  case "fulfilled":
                    return _REACT_ELEMENT_TYPE.value;
                  case "rejected":
                    throw _REACT_ELEMENT_TYPE.reason;
                }
            }
            throw _REACT_ELEMENT_TYPE;
          })(callback),
          _callback,
          refValue,
          __callback,
          ___callback,
        );
      }
      _callback = String(callback);
      throw Error(
        "Objects are not valid as a React child (found: " +
          (_callback === "[object Object]"
            ? "object with keys {" + Object.keys(callback).join(", ") + "}"
            : _callback) +
          "). If you meant to render a collection of children, use an array instead.",
      );
    }
    return l;
  }
  function C(_element, __element, mapReactChildrenRecursively) {
    if (_element == null) {
      return _element;
    }
    var n = [];
    var a = 0;
    D(_element, n, "", "", function (___element) {
      return __element.call(mapReactChildrenRecursively, ___element, a++);
    });
    return n;
  }
  function k(____element) {
    if (____element._status === -1) {
      var t = ____element._result;
      (t = t()).then(
        function (_____element) {
          if (____element._status === 0 || ____element._status === -1) {
            ____element._status = 1;
            ____element._result = _____element;
          }
        },
        function (______element) {
          if (____element._status === 0 || ____element._status === -1) {
            ____element._status = 2;
            ____element._result = ______element;
          }
        },
      );
      if (____element._status === -1) {
        ____element._status = 0;
        ____element._result = t;
      }
    }
    if (____element._status === 1) {
      return ____element._result.default;
    }
    throw ____element._result;
  }
  var N =
    typeof reportError == "function"
      ? reportError
      : function (handlePromise) {
          if (
            typeof window == "object" &&
            typeof window.ErrorEvent == "function"
          ) {
            var t = new window.ErrorEvent("error", {
              bubbles: true,
              cancelable: true,
              message:
                typeof handlePromise == "object" &&
                handlePromise !== null &&
                typeof handlePromise.message == "string"
                  ? String(handlePromise.message)
                  : String(handlePromise),
              error: handlePromise,
            });
            if (!window.dispatchEvent(t)) {
              return;
            }
          } else if (
            typeof process == "object" &&
            typeof process.emit == "function"
          ) {
            process.emit("uncaughtException", handlePromise);
            return;
          }
        };
  var U = {
    map: C,
    forEach: function (
      reactElementType,
      reactElementTypePromise,
      __REACT_ELEMENT_TYPE,
    ) {
      C(
        reactElementType,
        function () {
          reactElementTypePromise.apply(this, arguments);
        },
        __REACT_ELEMENT_TYPE,
      );
    },
    count: function (elementType) {
      var t = 0;
      C(elementType, function () {
        t++;
      });
      return t;
    },
    toArray: function (_reactElementType) {
      return (
        C(_reactElementType, function (__reactElementType) {
          return __reactElementType;
        }) || []
      );
    },
    only: function (_______element) {
      if (!R(_______element)) {
        throw Error(
          "React.Children.only expected to receive a single React element child.",
        );
      }
      return _______element;
    },
  };
  ___createElement.Activity = d;
  ___createElement.Children = U;
  ___createElement.Component = _;
  ___createElement.Fragment = r;
  ___createElement.Profiler = a;
  ___createElement.PureComponent = g;
  ___createElement.StrictMode = n;
  ___createElement.Suspense = c;
  ___createElement.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE =
    A;
  ___createElement.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function (errorType) {
      return A.H.useMemoCache(errorType);
    },
  };
  ___createElement.cache = function (___reactElementType) {
    return function () {
      return ___reactElementType.apply(null, arguments);
    };
  };
  ___createElement.cacheSignal = function () {
    return null;
  };
  ___createElement.cloneElement = function (
    mapReactChildren,
    lazyResult,
    mapChildren,
  ) {
    if (mapReactChildren == null) {
      throw Error(
        "The argument must be a React element, but you passed " +
          mapReactChildren +
          ".",
      );
    }
    var n = m({}, mapReactChildren.props);
    var a = mapReactChildren.key;
    if (lazyResult != null) {
      if (lazyResult.key !== undefined) {
        a = "" + lazyResult.key;
      }
      for (o in lazyResult) {
        if (
          !!v.call(lazyResult, o) &&
          o !== "key" &&
          o !== "__self" &&
          o !== "__source" &&
          (o !== "ref" || lazyResult.ref !== undefined)
        ) {
          n[o] = lazyResult[o];
        }
      }
    }
    var o = arguments.length - 2;
    if (o === 1) {
      n.children = mapChildren;
    } else if (o > 1) {
      var s = Array(o);
      for (var i = 0; i < o; i++) {
        s[i] = arguments[i + 2];
      }
      n.children = s;
    }
    return _________createReactElement(mapReactChildren.type, a, n);
  };
  ___createElement.createContext = function (error) {
    (error = {
      $$typeof: s,
      _currentValue: error,
      _currentValue2: error,
      _threadCount: 0,
      Provider: null,
      Consumer: null,
    }).Provider = error;
    error.Consumer = {
      $$typeof: o,
      _context: error,
    };
    return error;
  };
  ___createElement.createElement = function (
    elementCache,
    event,
    loadedElement,
  ) {
    var n;
    var a = {};
    var o = null;
    if (event != null) {
      if (event.key !== undefined) {
        o = "" + event.key;
      }
      for (n in event) {
        if (
          v.call(event, n) &&
          n !== "key" &&
          n !== "__self" &&
          n !== "__source"
        ) {
          a[n] = event[n];
        }
      }
    }
    var s = arguments.length - 2;
    if (s === 1) {
      a.children = loadedElement;
    } else if (s > 1) {
      var i = Array(s);
      for (var c = 0; c < s; c++) {
        i[c] = arguments[c + 2];
      }
      a.children = i;
    }
    if (elementCache && elementCache.defaultProps) {
      for (n in (s = elementCache.defaultProps)) {
        if (a[n] === undefined) {
          a[n] = s[n];
        }
      }
    }
    return _________createReactElement(elementCache, o, a);
  };
  ___createElement.createRef = function () {
    return {
      current: null,
    };
  };
  ___createElement.forwardRef = function (_error) {
    return {
      $$typeof: i,
      render: _error,
    };
  };
  ___createElement.isValidElement = R;
  ___createElement.lazy = function (________element) {
    return {
      $$typeof: f,
      _payload: {
        _status: -1,
        _result: ________element,
      },
      _init: k,
    };
  };
  ___createElement.memo = function (____createElement, counter) {
    return {
      $$typeof: l,
      type: ____createElement,
      compare: counter === undefined ? null : counter,
    };
  };
  ___createElement.startTransition = function (_________element) {
    var t = A.T;
    var r = {};
    A.T = r;
    try {
      var n = _________element();
      var a = A.S;
      if (a !== null) {
        a(r, n);
      }
      if (typeof n == "object" && n !== null && typeof n.then == "function") {
        n.then(b, N);
      }
    } catch (o) {
      N(o);
    } finally {
      if (t !== null && r.types !== null) {
        t.types = r.types;
      }
      A.T = t;
    }
  };
  ___createElement.unstable_useCacheRefresh = function () {
    return A.H.useCacheRefresh();
  };
  ___createElement.use = function (_____createElement) {
    return A.H.use(_____createElement);
  };
  ___createElement.useActionState = function (
    ______createElement,
    _______createElement,
    _Fragment,
  ) {
    return A.H.useActionState(
      ______createElement,
      _______createElement,
      _Fragment,
    );
  };
  ___createElement.useCallback = function (React, ________createElement) {
    return A.H.useCallback(React, ________createElement);
  };
  ___createElement.useContext = function (_React) {
    return A.H.useContext(_React);
  };
  ___createElement.useDebugValue = function () {};
  ___createElement.useDeferredValue = function (
    _________createElement,
    __________createElement,
  ) {
    return A.H.useDeferredValue(
      _________createElement,
      __________createElement,
    );
  };
  ___createElement.useEffect = function (
    ___________createElement,
    ____________createElement,
  ) {
    return A.H.useEffect(___________createElement, ____________createElement);
  };
  ___createElement.useEffectEvent = function (_____________createElement) {
    return A.H.useEffectEvent(_____________createElement);
  };
  ___createElement.useId = function () {
    return A.H.useId();
  };
  ___createElement.useImperativeHandle = function (
    ______________createElement,
    _______________createElement,
    ________________createElement,
  ) {
    return A.H.useImperativeHandle(
      ______________createElement,
      _______________createElement,
      ________________createElement,
    );
  };
  ___createElement.useInsertionEffect = function (
    __________element,
    _________________createElement,
  ) {
    return A.H.useInsertionEffect(
      __________element,
      _________________createElement,
    );
  };
  ___createElement.useLayoutEffect = function (
    __________________createElement,
    ___________________createElement,
  ) {
    return A.H.useLayoutEffect(
      __________________createElement,
      ___________________createElement,
    );
  };
  ___createElement.useMemo = function (
    defaultValue,
    ____________________createElement,
  ) {
    return A.H.useMemo(defaultValue, ____________________createElement);
  };
  ___createElement.useOptimistic = function (
    _____________________createElement,
    ______________________createElement,
  ) {
    return A.H.useOptimistic(
      _____________________createElement,
      ______________________createElement,
    );
  };
  ___createElement.useReducer = function (
    _defaultValue,
    _createReactElement,
    __createReactElement,
  ) {
    return A.H.useReducer(
      _defaultValue,
      _createReactElement,
      __createReactElement,
    );
  };
  ___createElement.useRef = function (_______________________createElement) {
    return A.H.useRef(_______________________createElement);
  };
  ___createElement.useState = function (_elementType) {
    return A.H.useState(_elementType);
  };
  ___createElement.useSyncExternalStore = function (
    errorValue,
    ________________________createElement,
    _________________________createElement,
  ) {
    return A.H.useSyncExternalStore(
      errorValue,
      ________________________createElement,
      _________________________createElement,
    );
  };
  ___createElement.useTransition = function () {
    return A.H.useTransition();
  };
  ___createElement.version = "19.2.1";
  return ___createElement;
}
function getCreateElement() {
  if (!_createElement) {
    _createElement = 1;
    __createElement.exports = _______createReactElement();
  }
  return __createElement.exports;
}
var _mapChildren = getCreateElement();
const _loadedElement = getDefaultExport(_mapChildren);
const __________________________createElement = createModule(
  {
    __proto__: null,
    default: _loadedElement,
  },
  [_mapChildren],
);
function parseHeaders(___________________________createElement) {
  let t;
  let r;
  let n;
  let a = false;
  return function (REACT_CONSUMER_TYPE) {
    if (t === undefined) {
      t = REACT_CONSUMER_TYPE;
      r = 0;
      n = -1;
    } else {
      t = (function (createContext, t) {
        const r = new Uint8Array(createContext.length + t.length);
        r.set(createContext);
        r.set(t, createContext.length);
        return r;
      })(t, REACT_CONSUMER_TYPE);
    }
    const s = t.length;
    let i = 0;
    while (r < s) {
      if (a) {
        if (t[r] === 10) {
          i = ++r;
        }
        a = false;
      }
      let o = -1;
      for (; r < s && o === -1; ++r) {
        switch (t[r]) {
          case 58:
            if (n === -1) {
              n = r - i;
            }
            break;
          case 13:
            a = true;
          case 10:
            o = r;
        }
      }
      if (o === -1) {
        break;
      }
      ___________________________createElement(t.subarray(i, o), n);
      i = r;
      n = -1;
    }
    if (i === s) {
      t = undefined;
    } else if (i !== 0) {
      t = t.subarray(i);
      r -= i;
    }
  };
}
const ____________________________createElement = "text/event-stream";
const _____________________________createElement = "last-event-id";
function createEventSource(exports, previousTransition) {
  var {
    signal: r,
    headers: n,
    onopen: a,
    onmessage: o,
    onclose: s,
    onerror: i,
    openWhenHidden: c,
    fetch: u,
  } = previousTransition;
  var l = (function (___createReactElement, _previousTransition) {
    var r = {};
    for (var n in ___createReactElement) {
      if (
        Object.prototype.hasOwnProperty.call(___createReactElement, n) &&
        _previousTransition.indexOf(n) < 0
      ) {
        r[n] = ___createReactElement[n];
      }
    }
    if (
      ___createReactElement != null &&
      typeof Object.getOwnPropertySymbols == "function"
    ) {
      var a = 0;
      for (
        n = Object.getOwnPropertySymbols(___createReactElement);
        a < n.length;
        a++
      ) {
        if (
          _previousTransition.indexOf(n[a]) < 0 &&
          Object.prototype.propertyIsEnumerable.call(
            ___createReactElement,
            n[a],
          )
        ) {
          r[n[a]] = ___createReactElement[n[a]];
        }
      }
    }
    return r;
  })(previousTransition, [
    "signal",
    "headers",
    "onopen",
    "onmessage",
    "onclose",
    "onerror",
    "openWhenHidden",
    "fetch",
  ]);
  return new Promise((t, f) => {
    const d = Object.assign({}, n);
    let p;
    function h() {
      p.abort();
      if (!document.hidden) {
        A();
      }
    }
    d.accept ||= ____________________________createElement;
    if (!c) {
      document.addEventListener("visibilitychange", h);
    }
    let y = 1000;
    let m = 0;
    function E() {
      document.removeEventListener("visibilitychange", h);
      window.clearTimeout(m);
      p.abort();
    }
    if (r != null) {
      r.addEventListener("abort", () => {
        E();
        t();
      });
    }
    const _ = u ?? window.fetch;
    const T = a ?? validateContentType;
    async function A() {
      p = new AbortController();
      try {
        const r = await _(
          exports,
          Object.assign(Object.assign({}, l), {
            headers: d,
            signal: p.signal,
          }),
        );
        await T(r);
        await (async function (_exports, t) {
          const r = _exports.getReader();
          let n;
          while (!(n = await r.read()).done) {
            t(n.value);
          }
        })(
          r.body,
          parseHeaders(
            (function (hooks, t, reactHooks) {
              let n = {
                data: "",
                event: "",
                id: "",
                retry: undefined,
              };
              const a = new TextDecoder();
              return function (ReactHooks, __React) {
                if (ReactHooks.length === 0) {
                  if (reactHooks != null) {
                    reactHooks(n);
                  }
                  n = {
                    data: "",
                    event: "",
                    id: "",
                    retry: undefined,
                  };
                } else if (__React > 0) {
                  const r = a.decode(ReactHooks.subarray(0, __React));
                  const i = __React + (ReactHooks[__React + 1] === 32 ? 2 : 1);
                  const c = a.decode(ReactHooks.subarray(i));
                  switch (r) {
                    case "data":
                      n.data = n.data ? n.data + "\n" + c : c;
                      break;
                    case "event":
                      n.event = c;
                      break;
                    case "id":
                      hooks((n.id = c));
                      break;
                    case "retry":
                      const r = parseInt(c, 10);
                      if (!isNaN(r)) {
                        t((n.retry = r));
                      }
                  }
                }
              };
            })(
              (e) => {
                if (e) {
                  d[_____________________________createElement] = e;
                } else {
                  delete d[_____________________________createElement];
                }
              },
              (e) => {
                y = e;
              },
              o,
            ),
          ),
        );
        if (s != null) {
          s();
        }
        E();
        t();
      } catch (n) {
        if (!p.signal.aborted) {
          try {
            const e = (i == null ? undefined : i(n)) ?? y;
            window.clearTimeout(m);
            m = window.setTimeout(A, e);
          } catch (a) {
            E();
            f(a);
          }
        }
      }
    }
    A();
  });
}
function validateContentType(_ReactHooks) {
  const t = _ReactHooks.headers.get("content-type");
  if (
    !(t == null
      ? undefined
      : t.startsWith(____________________________createElement))
  ) {
    throw new Error(
      `Expected content-type to be ${____________________________createElement}, Actual: ${t}`,
    );
  }
}
const react = {
  production: {
    SEGMENT_WRITE_KEY: "H7hVDRIBUrlBySLqJ15oAivgqhomdAKT",
  },
  development: {
    SEGMENT_WRITE_KEY: "hNex10EGp3coubOXQI1BIElYaZcA1o0u",
  },
};
const ___React = "fcoeoabgfenejglbffodgkkbkcdhcgfn";
const ____React = {
  AUTHORIZE_URL: "https://claude.ai/oauth/authorize",
  TOKEN_URL: "https://platform.claude.com/v1/oauth/token",
  SCOPES_STR: "user:profile user:inference user:chat",
  CLIENT_ID: "54511e87-7abf-4923-9d84-d6f24532e871",
  REDIRECT_URI: `chrome-extension://${"dihbgbndebgnbjfmelmegjepbnkhlgni"}/oauth_callback.html`,
};
const REACT = {
  development: ____React,
  production: {
    ...____React,
    CLIENT_ID: "dae2cad8-15c5-43d2-9046-fcaecc135fa4",
    REDIRECT_URI: `chrome-extension://${___React}/oauth_callback.html`,
  },
};
const ____createReactElement = () => {
  const e = "production";
  const t = REACT[e];
  return {
    environment: e,
    apiBaseUrl: "https://api.anthropic.com",
    wsApiBaseUrl: "wss://api.anthropic.com",
    segmentWriteKey: react[e].SEGMENT_WRITE_KEY,
    oauth: t,
  };
};
var createElementFunction = ((e) => {
  e.ACCESS_TOKEN = "accessToken";
  e.REFRESH_TOKEN = "refreshToken";
  e.TOKEN_EXPIRY = "tokenExpiry";
  e.OAUTH_STATE = "oauthState";
  e.CODE_VERIFIER = "codeVerifier";
  e.ANTHROPIC_API_KEY = "anthropicApiKey";
  e.SELECTED_MODEL = "selectedModel";
  e.SYSTEM_PROMPT = "systemPrompt";
  e.DEBUG_MODE = "debugMode";
  e.MODEL_SELECTOR_DEBUG = "modelSelectorDebug";
  e.SHOW_TRACE_IDS = "showTraceIds";
  e.SHOW_SYSTEM_REMINDERS = "showSystemReminders";
  e.USE_SESSIONS_API = "useSessionsAPI";
  e.SESSIONS_API_HOSTNAME = "sessionsApiHostname";
  e.BROWSER_CONTROL_PERMISSION_ACCEPTED = "browserControlPermissionAccepted";
  e.PERMISSION_STORAGE = "permissionStorage";
  e.LAST_PERMISSION_MODE_PREFERENCE = "lastPermissionModePreference";
  e.ANONYMOUS_ID = "anonymousId";
  e.TEST_DATA_MESSAGES = "test_data_messages";
  e.SCHEDULED_TASK_LOGS = "scheduledTaskLogs";
  e.SCHEDULED_TASK_STATS = "scheduledTaskStats";
  e.PENDING_SCHEDULED_TASK = "pendingScheduledTask";
  e.TARGET_TAB_ID = "targetTabId";
  e.UPDATE_AVAILABLE = "updateAvailable";
  e.TIP_DISPLAY_COUNTS = "tipDisplayCounts";
  e.NEW_TAB_NOTE = "newTabNote";
  e.CUSTOM_APP_LINKS = "customAppLinks";
  e.NOTIFICATIONS_ENABLED = "notificationsEnabled";
  e.ANNOUNCEMENT_DISMISSED = "announcementDismissed";
  e.MODEL_OVERRIDE_SEEN = "modelOverrideSeen";
  e.SAVED_PROMPTS = "savedPrompts";
  e.SAVED_PROMPT_CATEGORIES = "savedPromptCategories";
  e.TAB_GROUPS = "tabGroups";
  e.DISMISSED_TAB_GROUPS = "dismissedTabGroups";
  e.MCP_TAB_GROUP_ID = "mcpTabGroupId";
  e.MCP_CONNECTED = "mcpConnected";
  e.WIDGET_ORDER = "widgetOrder";
  return e;
})(createElementFunction || {});
async function getStoredValueOrDefault(omitProperties, resolve) {
  const r = await chrome.storage.local.get(omitProperties);
  if (r[omitProperties] !== undefined) {
    return r[omitProperties];
  } else {
    return resolve;
  }
}
async function ___setPropertyPath(eventSource, _resolve) {
  await chrome.storage.local.set({
    [eventSource]: _resolve,
  });
}
async function removeStorageKeys(_eventSource) {
  const t = Array.isArray(_eventSource) ? _eventSource : [_eventSource];
  await chrome.storage.local.remove(t);
}
async function getStorageItem(___________element) {
  return await chrome.storage.local.get(___________element);
}
async function __________setNestedProperty(__eventSource) {
  await chrome.storage.local.set(__eventSource);
}
const _____createReactElement = new Set(["anonymousId", "updateAvailable"]);
async function generateUniqueIdentifier() {
  const e = Object.values(createElementFunction).filter(
    (e) => !_____createReactElement.has(e),
  );
  await removeStorageKeys(e);
}
const logLevel = (e) =>
  btoa(String.fromCharCode(...e))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
const ______createReactElement = async (e, t) => {
  await __________setNestedProperty({
    [createElementFunction.ACCESS_TOKEN]: e.accessToken,
    [createElementFunction.REFRESH_TOKEN]: e.refreshToken,
    [createElementFunction.TOKEN_EXPIRY]: e.expiresAt,
    [createElementFunction.OAUTH_STATE]: t,
  });
};
const handleVisibilityChange = async (e, t) => {
  try {
    const r = await fetch(t.TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: t.CLIENT_ID,
        refresh_token: e,
      }),
    });
    if (!r.ok) {
      const e = await r.text();
      return {
        success: false,
        error: `Token refresh failed: ${r.status} ${e}`,
      };
    }
    const n = await r.json();
    if (n.error) {
      return {
        success: false,
        error: n.error_description || n.error,
      };
    } else {
      return {
        success: true,
        accessToken: n.access_token,
        refreshToken: n.refresh_token || e,
        expiresAt: n.expires_in ? Date.now() + n.expires_in * 1000 : undefined,
      };
    }
  } catch (r) {
    return {
      success: false,
      error:
        r instanceof Error ? r.message : "Network error during token refresh",
    };
  }
};
const parseServerSentEvent = async () => {
  try {
    const e = await getStorageItem([
      createElementFunction.ACCESS_TOKEN,
      createElementFunction.REFRESH_TOKEN,
      createElementFunction.TOKEN_EXPIRY,
    ]);
    if (!e[createElementFunction.ACCESS_TOKEN]) {
      return {
        isValid: false,
        isRefreshed: false,
      };
    }
    const t = Date.now();
    const r = e[createElementFunction.TOKEN_EXPIRY];
    const n = !!r && t < r;
    if (!r || !(t >= r - 3600000)) {
      return {
        isValid: n,
        isRefreshed: false,
      };
    }
    if (!e[createElementFunction.REFRESH_TOKEN]) {
      return {
        isValid: n,
        isRefreshed: false,
      };
    }
    const a = ____createReactElement();
    for (let o = 0; o < 3; o++) {
      const t = await handleVisibilityChange(
        e[createElementFunction.REFRESH_TOKEN],
        a.oauth,
      );
      if (t.success) {
        await ______createReactElement(t);
        return {
          isValid: true,
          isRefreshed: true,
        };
      }
      if (o === 2) {
        await removeStorageKeys([
          createElementFunction.ACCESS_TOKEN,
          createElementFunction.REFRESH_TOKEN,
          createElementFunction.TOKEN_EXPIRY,
        ]);
        return {
          isValid: n,
          isRefreshed: false,
        };
      }
    }
    return {
      isValid: n,
      isRefreshed: false,
    };
  } catch {
    return {
      isValid: false,
      isRefreshed: false,
    };
  }
};
const __ReactHooks = async () => {
  if (!(await parseServerSentEvent()).isValid) {
    return;
  }
  return (
    (await getStoredValueOrDefault(createElementFunction.ACCESS_TOKEN)) ||
    undefined
  );
};
const ___ReactHooks = async (e, t) => {
  try {
    const r = new URLSearchParams(new URL(e).search);
    const n = r.get("code");
    const a = r.get("error");
    const o = r.get("error_description");
    const s = r.get("state");
    if (a) {
      return {
        success: false,
        error: `Authentication failed: ${a}${o ? " - " + o : ""}`,
      };
    }
    if (!n) {
      return {
        success: false,
        error: "No authorization code received",
      };
    }
    const i =
      (await getStoredValueOrDefault(createElementFunction.CODE_VERIFIER)) ||
      "";
    const c = ____createReactElement();
    const u = await (async (e, t, r, n) => {
      try {
        const a = await fetch(n.TOKEN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: n.CLIENT_ID,
            code: e,
            redirect_uri: n.REDIRECT_URI,
            state: t,
            code_verifier: r,
          }),
        });
        if (!a.ok) {
          const e = await a.text();
          return {
            success: false,
            error: `Token exchange failed: ${a.status} ${e}`,
          };
        }
        const o = await a.json();
        if (o.error) {
          return {
            success: false,
            error: o.error_description || o.error,
          };
        } else {
          return {
            success: true,
            accessToken: o.access_token,
            refreshToken: o.refresh_token,
            expiresAt: o.expires_in
              ? Date.now() + o.expires_in * 1000
              : undefined,
          };
        }
      } catch (a) {
        return {
          success: false,
          error:
            a instanceof Error
              ? a.message
              : "Network error during token exchange",
        };
      }
    })(n, s || "", i, c.oauth);
    if (u.success) {
      await ______createReactElement(u, s || undefined);
      const e = "https://claude.ai/chrome/installed";
      if (t) {
        await chrome.tabs.update(t, {
          url: e,
        });
      }
      return {
        success: true,
        message: "Authentication successful!",
      };
    }
    return {
      success: false,
      error: u.error || "Failed to exchange authorization code for token",
    };
  } catch (r) {
    return {
      success: false,
      error:
        r instanceof Error
          ? r.message
          : "An unexpected error occurred during authentication",
    };
  }
};
const LocalStorageKeys = async () => {
  await generateUniqueIdentifier();
};
const StorageKeys = async () => {
  const e = ____createReactElement();
  const t = ((e) => {
    const t = new Uint8Array(e);
    crypto.getRandomValues(t);
    return logLevel(t);
  })(32);
  const r = logLevel(crypto.getRandomValues(new Uint8Array(32)));
  const n = await (async (e) => {
    const t = new TextEncoder().encode(e);
    const r = await crypto.subtle.digest("SHA-256", t);
    return logLevel(new Uint8Array(r));
  })(r);
  await __________setNestedProperty({
    [createElementFunction.OAUTH_STATE]: t,
    [createElementFunction.CODE_VERIFIER]: r,
  });
  const a = new URLSearchParams({
    client_id: e.oauth.CLIENT_ID,
    response_type: "code",
    scope: e.oauth.SCOPES_STR,
    redirect_uri: e.oauth.REDIRECT_URI,
    state: t,
    code_challenge: n,
    code_challenge_method: "S256",
  });
  const o = `${e.oauth.AUTHORIZE_URL}?${a.toString()}`;
  chrome.tabs.create({
    url: o,
  });
};
const _StorageKeys = new (class {
  baseURL;
  constructor() {
    const e = ____createReactElement();
    this.baseURL = e.apiBaseUrl;
  }
  async fetch(e, t = {}) {
    const r = await __ReactHooks();
    if (!r) {
      throw new Error("No valid OAuth token available");
    }
    const n = `${this.baseURL}${e}`;
    const a = {
      Authorization: `Bearer ${r}`,
      "Content-Type": "application/json",
      "anthropic-client-platform": "claude_browser_extension",
      ...t.headers,
    };
    const o = await fetch(n, {
      ...t,
      headers: a,
    });
    if (!o.ok) {
      throw new Error(`API request failed: ${o.status} ${o.statusText}`);
    }
    const s = o.headers.get("content-type");
    if (o.status === 204) {
      return null;
    } else if (s?.includes("application/json")) {
      return o.json();
    } else if (s) {
      return o.blob();
    } else {
      return null;
    }
  }
  async fetchEventSource(e, t) {
    const r = await __ReactHooks();
    if (!r) {
      throw new Error("No valid OAuth token available for SSE stream");
    }
    const n = `${this.baseURL}${e}`;
    const a = new AbortController();
    await createEventSource(n, {
      ...t,
      headers: {
        Authorization: `Bearer ${r}`,
        "anthropic-client-platform": "claude_browser_extension",
        ...t.headers,
      },
      signal: t.signal || a.signal,
    });
    return () => {
      a.abort();
    };
  }
})();
class FeatureManager {
  config;
  features = null;
  cacheTimestamp = null;
  initPromise = null;
  isRefreshing = false;
  constructor(e) {
    this.config = {
      ...e,
      cacheTTL: e.cacheTTL ?? 300000,
      storageKey: e.storageKey ?? "features",
    };
  }
  setOnFeaturesUpdated(e) {
    this.config.onFeaturesUpdated = e;
  }
  async loadFromCache() {
    try {
      const e = (await chrome.storage.local.get(this.config.storageKey))[
        this.config.storageKey
      ];
      if (e && e.payload && e.timestamp) {
        if (Date.now() - e.timestamp < this.config.cacheTTL) {
          return e;
        }
      }
    } catch (e) {}
    return null;
  }
  async saveToCache(e) {
    try {
      const t = {
        payload: e,
        timestamp: Date.now(),
      };
      await chrome.storage.local.set({
        [this.config.storageKey]: t,
      });
    } catch (t) {}
  }
  async fetchAndUpdate() {
    try {
      const e = await this.config.fetchFeatures();
      this.features = e.features;
      this.cacheTimestamp = Date.now();
      await this.saveToCache(e);
      this.config.onFeaturesUpdated?.(e.features);
    } catch (e) {
      throw e;
    }
  }
  checkAndRefreshIfStale() {
    if (!this.cacheTimestamp || this.isRefreshing) {
      return;
    }
    if (Date.now() - this.cacheTimestamp > this.config.cacheTTL) {
      this.isRefreshing = true;
      return this.fetchAndUpdate()
        .catch((e) => {})
        .finally(() => {
          this.isRefreshing = false;
        });
    } else {
      return undefined;
    }
  }
  async initialize() {
    if (!this.features) {
      this.initPromise ||= (async () => {
        const e = await this.loadFromCache();
        if (e) {
          this.features = e.payload.features;
          this.cacheTimestamp = e.timestamp;
          this.config.onFeaturesUpdated?.(e.payload.features);
          if (Date.now() - e.timestamp > this.config.cacheTTL / 2) {
            this.isRefreshing = true;
            try {
              await this.fetchAndUpdate();
            } catch (t) {
            } finally {
              this.isRefreshing = false;
            }
          }
          return;
        }
        try {
          await this.fetchAndUpdate();
        } catch {}
      })();
      return this.initPromise;
    }
  }
  getFeatureValue(e, t) {
    this.checkAndRefreshIfStale();
    const r = this.features?.[e];
    if (r && r.value !== undefined && r.value !== null) {
      return r.value;
    } else {
      return t;
    }
  }
  async getFeatureValueAsync(e, t) {
    await this.checkAndRefreshIfStale();
    const r = this.features?.[e];
    if (r && r.value !== undefined && r.value !== null) {
      return r.value;
    } else {
      return t;
    }
  }
  isFeatureEnabled(e) {
    this.checkAndRefreshIfStale();
    const t = this.features?.[e];
    return t?.on ?? false;
  }
  async isFeatureEnabledAsync(e) {
    await this.checkAndRefreshIfStale();
    const t = this.features?.[e];
    return t?.on ?? false;
  }
  getFeature(e) {
    this.checkAndRefreshIfStale();
    return this.features?.[e];
  }
  async getFeatureAsync(e) {
    await this.checkAndRefreshIfStale();
    return this.features?.[e];
  }
  async refresh() {
    await this.fetchAndUpdate();
  }
  isReady() {
    return this.features !== null;
  }
}
async function fetchClaudeChromeFeatures() {
  return _StorageKeys.fetch("/api/bootstrap/features/claude_in_chrome");
}
let response = null;
const authCode = _mapChildren.createContext(null);
function FeatureProvider({ children: e }) {
  const [t, r] = _mapChildren.useState(null);
  const [n, a] = _mapChildren.useState(false);
  const [o, s] = _mapChildren.useState(null);
  const i = _mapChildren.useRef(null);
  _mapChildren.useEffect(() => {
    const e = (e) => {
      r(e);
      s(null);
    };
    n = e;
    response ||= new FeatureManager({
      fetchFeatures: fetchClaudeChromeFeatures,
      onFeaturesUpdated: n,
    });
    const t = response;
    var n;
    i.current = t;
    t.setOnFeaturesUpdated(e);
    t.initialize()
      .then(() => {
        a(true);
      })
      .catch((e) => {
        s(e instanceof Error ? e : new Error(String(e)));
        a(true);
      });
  }, []);
  const c = _mapChildren.useCallback(
    (e, t) => (i.current ? i.current.getFeatureValue(e, t) : t),
    [t],
  );
  const u = _mapChildren.useCallback(
    (e) => !!i.current && i.current.isFeatureEnabled(e),
    [t],
  );
  const l = _mapChildren.useCallback(
    (e) => {
      if (i.current) {
        return i.current.getFeature(e);
      }
    },
    [t],
  );
  const d = _mapChildren.useCallback((e) => t?.[e] !== undefined, [t]);
  const p = _mapChildren.useCallback(async () => {
    if (i.current) {
      await i.current.refresh();
    }
  }, []);
  const h = _mapChildren.useMemo(
    () => ({
      isReady: n,
      error: o,
      getFeatureValue: c,
      isFeatureEnabled: u,
      getFeature: l,
      hasFeature: d,
      refresh: p,
    }),
    [n, o, c, u, l, d, p],
  );
  return createReactElement.jsx(authCode.Provider, {
    value: h,
    children: e,
  });
}
function useFeatures() {
  const e = _mapChildren.useContext(authCode);
  if (!e) {
    throw new Error("useFeatures must be used within a FeatureProvider");
  }
  return e;
}
function getRedirectFeatureValue(redirectUrl, tabId) {
  const { getFeatureValue: r } = useFeatures();
  return r(redirectUrl, tabId);
}
function useFeatureFlag(urlEndpoint) {
  const { isFeatureEnabled: t } = useFeatures();
  return t(urlEndpoint);
}
function isFeatureReady() {
  const { isReady: e } = useFeatures();
  return e;
}
const authUrl = {};
const regularExpressions = function (_redirectUrl, _tabId, __error) {
  let n = Promise.resolve();
  if (_tabId && _tabId.length > 0) {
    let e = function (e) {
      return Promise.all(
        e.map((e) =>
          Promise.resolve(e).then(
            (e) => ({
              status: "fulfilled",
              value: e,
            }),
            (e) => ({
              status: "rejected",
              reason: e,
            }),
          ),
        ),
      );
    };
    document.getElementsByTagName("link");
    const r = document.querySelector("meta[property=csp-nonce]");
    const a = r?.nonce || r?.getAttribute("nonce");
    n = e(
      _tabId.map((e) => {
        if (
          (e = (function (e) {
            return "/" + e;
          })(e)) in authUrl
        ) {
          return;
        }
        authUrl[e] = true;
        const t = e.endsWith(".css");
        const r = t ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${e}"]${r}`)) {
          return;
        }
        const n = document.createElement("link");
        n.rel = t ? "stylesheet" : "modulepreload";
        if (!t) {
          n.as = "script";
        }
        n.crossOrigin = "";
        n.href = e;
        if (a) {
          n.setAttribute("nonce", a);
        }
        document.head.appendChild(n);
        if (t) {
          return new Promise((t, r) => {
            n.addEventListener("load", t);
            n.addEventListener("error", () =>
              r(new Error(`Unable to preload CSS for ${e}`)),
            );
          });
        } else {
          return undefined;
        }
      }),
    );
  }
  function a(config) {
    const t = new Event("vite:preloadError", {
      cancelable: true,
    });
    t.payload = config;
    window.dispatchEvent(t);
    if (!t.defaultPrevented) {
      throw config;
    }
  }
  return n.then((t) => {
    for (const e of t || []) {
      if (e.status === "rejected") {
        a(e.reason);
      }
    }
    return _redirectUrl().catch(a);
  });
};
function setPrototypeHelper(endpoint, options) {
  return (setPrototypeHelper =
    Object.setPrototypeOf ||
    ({
      __proto__: [],
    } instanceof Array &&
      function (signalVariable, requestOptions) {
        signalVariable.__proto__ = requestOptions;
      }) ||
    function (url, _requestOptions) {
      for (var r in _requestOptions) {
        if (Object.prototype.hasOwnProperty.call(_requestOptions, r)) {
          url[r] = _requestOptions[r];
        }
      }
    })(endpoint, options);
}
function extendClass(_endpoint, _options) {
  if (typeof _options != "function" && _options !== null) {
    throw new TypeError(
      "Class extends value " +
        String(_options) +
        " is not a constructor or null",
    );
  }
  function r() {
    this.constructor = _endpoint;
  }
  setPrototypeHelper(_endpoint, _options);
  _endpoint.prototype =
    _options === null
      ? Object.create(_options)
      : ((r.prototype = _options.prototype), new r());
}
function objectAssign() {
  objectAssign =
    Object.assign ||
    function (__endpoint) {
      var t;
      var r = 1;
      for (var n = arguments.length; r < n; r++) {
        for (var a in (t = arguments[r])) {
          if (Object.prototype.hasOwnProperty.call(t, a)) {
            __endpoint[a] = t[a];
          }
        }
      }
      return __endpoint;
    };
  return objectAssign.apply(this, arguments);
}
function _omitProperties(_config, headers) {
  var r = {};
  for (var n in _config) {
    if (
      Object.prototype.hasOwnProperty.call(_config, n) &&
      headers.indexOf(n) < 0
    ) {
      r[n] = _config[n];
    }
  }
  if (_config != null && typeof Object.getOwnPropertySymbols == "function") {
    var a = 0;
    for (n = Object.getOwnPropertySymbols(_config); a < n.length; a++) {
      if (
        headers.indexOf(n[a]) < 0 &&
        Object.prototype.propertyIsEnumerable.call(_config, n[a])
      ) {
        r[n[a]] = _config[n[a]];
      }
    }
  }
  return r;
}
function asyncWrapper(
  ____callback,
  cachedData,
  result,
  checkAndRefreshIfNeeded,
) {
  return new (result ||= Promise)(function (_____callback, _cachedData) {
    function s(cacheData) {
      try {
        c(checkAndRefreshIfNeeded.next(cacheData));
      } catch (t) {
        _cachedData(t);
      }
    }
    function i(__cachedData) {
      try {
        c(checkAndRefreshIfNeeded.throw(__cachedData));
      } catch (t) {
        _cachedData(t);
      }
    }
    function c(___cachedData) {
      var t;
      if (___cachedData.done) {
        _____callback(___cachedData.value);
      } else {
        ((t = ___cachedData.value),
        t instanceof result
          ? t
          : new result(function (data) {
              data(t);
            })).then(s, i);
      }
    }
    c(
      (checkAndRefreshIfNeeded = checkAndRefreshIfNeeded.apply(
        ____callback,
        cachedData || [],
      )).next(),
    );
  });
}
function createGenerator(____cachedData, _data) {
  var r;
  var n;
  var a;
  var o;
  var s = {
    label: 0,
    sent: function () {
      if (a[0] & 1) {
        throw a[1];
      }
      return a[1];
    },
    trys: [],
    ops: [],
  };
  o = {
    next: i(0),
    throw: i(1),
    return: i(2),
  };
  if (typeof Symbol == "function") {
    o[Symbol.iterator] = function () {
      return this;
    };
  }
  return o;
  function i(i) {
    return function (_____cachedData) {
      return (function (i) {
        if (r) {
          throw new TypeError("Generator is already executing.");
        }
        if (o) {
          o = 0;
          if (i[0]) {
            s = 0;
          }
        }
        while (s) {
          try {
            r = 1;
            if (
              n &&
              (a =
                i[0] & 2
                  ? n.return
                  : i[0]
                    ? n.throw || ((a = n.return) && a.call(n), 0)
                    : n.next) &&
              !(a = a.call(n, i[1])).done
            ) {
              return a;
            }
            n = 0;
            if (a) {
              i = [i[0] & 2, a.value];
            }
            switch (i[0]) {
              case 0:
              case 1:
                a = i;
                break;
              case 4:
                s.label++;
                return {
                  value: i[1],
                  done: false,
                };
              case 5:
                s.label++;
                n = i[1];
                i = [0];
                continue;
              case 7:
                i = s.ops.pop();
                s.trys.pop();
                continue;
              default:
                if (
                  !((a = s.trys),
                  (a = a.length > 0 && a[a.length - 1]) ||
                    (i[0] !== 6 && i[0] !== 2))
                ) {
                  s = 0;
                  continue;
                }
                if (i[0] === 3 && (!a || (i[1] > a[0] && i[1] < a[3]))) {
                  s.label = i[1];
                  break;
                }
                if (i[0] === 6 && s.label < a[1]) {
                  s.label = a[1];
                  a = i;
                  break;
                }
                if (a && s.label < a[2]) {
                  s.label = a[2];
                  s.ops.push(i);
                  break;
                }
                if (a[2]) {
                  s.ops.pop();
                }
                s.trys.pop();
                continue;
            }
            i = _data.call(____cachedData, s);
          } catch (c) {
            i = [6, c];
            n = 0;
          } finally {
            r = a = 0;
          }
        }
        if (i[0] & 5) {
          throw i[1];
        }
        return {
          value: i[0] ? i[1] : undefined,
          done: true,
        };
      })([i, _____cachedData]);
    };
  }
}
function mergeArrays(children, features, setFeatures) {
  if (setFeatures || arguments.length === 2) {
    var n;
    var a = 0;
    for (var o = features.length; a < o; a++) {
      if (!!n || !(a in features)) {
        n ||= Array.prototype.slice.call(features, 0, a);
        n[a] = features[a];
      }
    }
  }
  return children.concat(n || Array.prototype.slice.call(features));
}
function _________setNestedProperty(
  handleFeaturesUpdated,
  featuresData,
  featureManager,
) {
  if (featuresData.split) {
    featuresData = featuresData.split(".");
  }
  var n;
  var a;
  var o = 0;
  var s = featuresData.length;
  for (
    var i = handleFeaturesUpdated;
    o < s &&
    (a = "" + featuresData[o++]) != "__proto__" &&
    a !== "constructor" &&
    a !== "prototype";

  ) {
    i = i[a] =
      o === s
        ? featureManager
        : typeof (n = i[a]) == typeof featuresData
          ? n
          : featuresData[o] * 0 != 0 || ~("" + featuresData[o]).indexOf(".")
            ? {}
            : [];
  }
}
var _children;
var dependencies = 256;
for (var hexArray = []; dependencies--; ) {
  hexArray[dependencies] = (dependencies + 256).toString(16).substring(1);
}
function generateUUID() {
  var e;
  var t = 0;
  var r = "";
  if (!_children || dependencies + 16 > 256) {
    for (_children = Array((t = 256)); t--; ) {
      _children[t] = (Math.random() * 256) | 0;
    }
    t = dependencies = 0;
  }
  for (; t < 16; t++) {
    e = _children[dependencies + t];
    if (t == 6) {
      r += hexArray[(e & 15) | 64];
    } else if (t == 8) {
      r += hexArray[(e & 63) | 128];
    } else {
      r += hexArray[e];
    }
    if (t & 1 && t > 1 && t < 11) {
      r += "-";
    }
  }
  dependencies++;
  return r;
}
class PromptManager {
  static async getAllPrompts() {
    return (
      (await getStoredValueOrDefault(createElementFunction.SAVED_PROMPTS)) || []
    );
  }
  static async getPromptById(e) {
    return (await this.getAllPrompts()).find((t) => t.id === e);
  }
  static async getPromptByCommand(e) {
    return (await this.getAllPrompts()).find((t) => t.command === e);
  }
  static async savePrompt(e) {
    const t = await this.getAllPrompts();
    if (e.command) {
      if (t.find((t) => t.command === e.command)) {
        throw new Error(`/${e.command} is already in use`);
      }
    }
    const r = {
      ...e,
      id: `prompt_${Date.now()}`,
      createdAt: e.createdAt || Date.now(),
      usageCount: e.usageCount || 0,
    };
    t.push(r);
    await ___setPropertyPath(createElementFunction.SAVED_PROMPTS, t);
    if (r.repeatType && r.repeatType !== "none") {
      await this.updateAlarmForPrompt(r);
    }
    return r;
  }
  static async updatePrompt(e, t) {
    const r = await this.getAllPrompts();
    const n = r.findIndex((t) => t.id === e);
    if (n === -1) {
      return;
    }
    if (t.command && t.command !== r[n].command) {
      if (r.find((e) => e.command === t.command)) {
        throw new Error(`/${t.command} is already in use`);
      }
    }
    const a = r[n];
    r[n] = {
      ...r[n],
      ...t,
    };
    await ___setPropertyPath(createElementFunction.SAVED_PROMPTS, r);
    const o = r[n];
    if (
      a.repeatType !== o.repeatType ||
      a.specificTime !== o.specificTime ||
      a.specificDate !== o.specificDate ||
      a.dayOfWeek !== o.dayOfWeek ||
      a.dayOfMonth !== o.dayOfMonth ||
      a.monthAndDay !== o.monthAndDay
    ) {
      await this.updateAlarmForPrompt(o);
    }
    return r[n];
  }
  static async deletePrompt(e) {
    const t = await this.getAllPrompts();
    const r = t.find((t) => t.id === e);
    const n = t.filter((t) => t.id !== e);
    return (
      n.length !== t.length &&
      (r?.repeatType &&
        r.repeatType !== "none" &&
        (await chrome.alarms.clear(e)),
      await ___setPropertyPath(createElementFunction.SAVED_PROMPTS, n),
      true)
    );
  }
  static async recordPromptUsage(e) {
    const t = await this.getAllPrompts();
    const r = t.find((t) => t.id === e);
    if (r) {
      r.lastUsedAt = Date.now();
      r.usageCount = (r.usageCount || 0) + 1;
      await ___setPropertyPath(createElementFunction.SAVED_PROMPTS, t);
    }
  }
  static async searchPrompts(e) {
    const t = await this.getAllPrompts();
    const r = e.toLowerCase();
    return t.filter(
      (e) =>
        e.prompt.toLowerCase().includes(r) ||
        (e.command && e.command.toLowerCase().includes(r)),
    );
  }
  static async exportPrompts(e) {
    const t = await this.getAllPrompts();
    const r = e ? t.filter((t) => e.includes(t.id)) : t;
    return JSON.stringify(r, null, 2);
  }
  static async importPrompts(e, t = false) {
    const r = JSON.parse(e);
    const n = t ? [] : await this.getAllPrompts();
    const a = r.map((e) => ({
      ...e,
      id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      usageCount: 0,
      lastUsedAt: undefined,
    }));
    const o = [...n, ...a].filter((e) => e.command).map((e) => e.command);
    const s = new Set(o);
    if (o.length !== s.size) {
      throw new Error("Import contains duplicate command shortcuts");
    }
    const i = [...n, ...a];
    await ___setPropertyPath(createElementFunction.SAVED_PROMPTS, i);
    return a.length;
  }
  static async updateAlarmForPrompt(e) {
    const t = e.id;
    await chrome.alarms.clear(t);
    if (!e.repeatType || e.repeatType === "none" || !e.specificTime) {
      return;
    }
    const r = new Date();
    const [n, a] = e.specificTime.split(":").map(Number);
    switch (e.repeatType) {
      case "once": {
        if (!e.specificDate) {
          return;
        }
        const [o, s, i] = e.specificDate.split("-").map(Number);
        const c = new Date(o, s - 1, i, n, a, 0, 0);
        if (c > r) {
          await chrome.alarms.create(t, {
            when: c.getTime(),
          });
        }
        break;
      }
      case "daily": {
        const e = new Date();
        e.setHours(n, a, 0, 0);
        if (e <= r) {
          e.setDate(e.getDate() + 1);
        }
        await chrome.alarms.create(t, {
          when: e.getTime(),
          periodInMinutes: 1440,
        });
        break;
      }
      case "weekly": {
        if (e.dayOfWeek === undefined) {
          return;
        }
        let o = (e.dayOfWeek - r.getDay() + 7) % 7;
        if (o === 0) {
          const e = new Date();
          e.setHours(n, a, 0, 0);
          if (e <= r) {
            o = 7;
          }
        }
        const s = new Date();
        s.setDate(r.getDate() + o);
        s.setHours(n, a, 0, 0);
        await chrome.alarms.create(t, {
          when: s.getTime(),
          periodInMinutes: 10080,
        });
        break;
      }
      case "monthly": {
        if (!e.dayOfMonth) {
          return;
        }
        const o = new Date();
        o.setDate(e.dayOfMonth);
        o.setHours(n, a, 0, 0);
        if (o <= r) {
          o.setMonth(o.getMonth() + 1);
        }
        await chrome.alarms.create(t, {
          when: o.getTime(),
        });
        break;
      }
      case "annually": {
        if (!e.monthAndDay) {
          return;
        }
        const [o, s] = e.monthAndDay.split("-").map(Number);
        const i = new Date();
        i.setMonth(o - 1);
        i.setDate(s);
        i.setHours(n, a, 0, 0);
        if (i <= r) {
          i.setFullYear(i.getFullYear() + 1);
        }
        await chrome.alarms.create(t, {
          when: i.getTime(),
        });
        break;
      }
    }
  }
  static async updateNextRunTimes() {
    const e = await this.getAllPrompts();
    const t = await chrome.alarms.getAll();
    let r = false;
    for (const n of e) {
      if (n.repeatType && n.repeatType !== "none") {
        const e = t.find((e) => e.name === n.id);
        const a = e?.scheduledTime;
        if (n.nextRun !== a) {
          n.nextRun = a;
          r = true;
        }
      } else if (n.nextRun) {
        n.nextRun = undefined;
        r = true;
      }
    }
    if (r) {
      await ___setPropertyPath(createElementFunction.SAVED_PROMPTS, e);
    }
  }
}
const state = Object.freeze(
  Object.defineProperty(
    {
      __proto__: null,
      SavedPromptsService: PromptManager,
    },
    Symbol.toStringTag,
    {
      value: "Module",
    },
  ),
);
var generatorState = ((e) => {
  e.NAVIGATE = "navigate";
  e.READ_PAGE_CONTENT = "read_page_content";
  e.READ_CONSOLE_MESSAGES = "read_console_messages";
  e.READ_NETWORK_REQUESTS = "read_network_requests";
  e.CLICK = "click";
  e.TYPE = "type";
  e.UPLOAD_IMAGE = "upload_image";
  e.DOMAIN_TRANSITION = "domain_transition";
  e.PLAN_APPROVAL = "plan_approval";
  e.EXECUTE_JAVASCRIPT = "execute_javascript";
  e.REMOTE_MCP = "remote_mcp";
  return e;
})(generatorState || {});
const ___error = async () => {
  let e = await getStoredValueOrDefault(createElementFunction.ANONYMOUS_ID);
  if (!e) {
    e = crypto.randomUUID();
    await ___setPropertyPath(createElementFunction.ANONYMOUS_ID, e);
  }
  return e;
};
const useMemo = (e) => ({
  email: e.account.email,
  organizationID: e.organization.uuid,
  organizationUUID: e.organization.uuid,
  applicationSlug: "claude-browser-use",
  isMax: e.account.has_claude_max,
  isPro: e.account.has_claude_pro,
  orgType: e.organization.organization_type,
});
var greaterThanOrEqual = ((e) => {
  e.ALLOW = "allow";
  e.DENY = "deny";
  return e;
})(greaterThanOrEqual || {});
var shouldExtractFeatures = ((e) => {
  e.ONCE = "once";
  e.ALWAYS = "always";
  return e;
})(shouldExtractFeatures || {});
function getActionDescription(____error) {
  return {
    [generatorState.NAVIGATE]: "navigate to",
    [generatorState.READ_PAGE_CONTENT]: "read page content on",
    [generatorState.READ_CONSOLE_MESSAGES]: "read debugging information on",
    [generatorState.READ_NETWORK_REQUESTS]: "read debugging information on",
    [generatorState.CLICK]: "click on",
    [generatorState.TYPE]: "type text into",
    [generatorState.UPLOAD_IMAGE]: "upload an image to",
    [generatorState.DOMAIN_TRANSITION]: "navigate from",
    [generatorState.PLAN_APPROVAL]: "approve plan for",
    [generatorState.EXECUTE_JAVASCRIPT]: "execute JavaScript on",
    [generatorState.REMOTE_MCP]: "access",
  }[____error];
}
const slice = ["follow_a_plan", "skip_all_permission_checks"];
const setProperty = "follow_a_plan";
export {
  _________setNestedProperty as A,
  generateUUID as B,
  asyncWrapper as C,
  setProperty as D,
  createGenerator as E,
  FeatureProvider as F,
  isFeatureReady as G,
  LocalStorageKeys as H,
  ___ReactHooks as I,
  FeatureManager as J,
  useMemo as K,
  greaterThanOrEqual as L,
  createEsModuleProxy as M,
  state as N,
  shouldExtractFeatures as P,
  _loadedElement as R,
  createElementFunction as S,
  generatorState as T,
  slice as U,
  regularExpressions as _,
  getDefaultExport as a,
  PromptManager as b,
  getCreateElement as c,
  ___error as d,
  useFeatures as e,
  useFeatureFlag as f,
  getStoredValueOrDefault as g,
  ____createReactElement as h,
  getActionDescription as i,
  createReactElement as j,
  __ReactHooks as k,
  parseServerSentEvent as l,
  _StorageKeys as m,
  getStorageItem as n,
  StorageKeys as o,
  globalContext as p,
  initializeReact as q,
  _mapChildren as r,
  ___setPropertyPath as s,
  removeStorageKeys as t,
  getRedirectFeatureValue as u,
  __________________________createElement as v,
  objectAssign as w,
  _omitProperties as x,
  mergeArrays as y,
  extendClass as z,
};
