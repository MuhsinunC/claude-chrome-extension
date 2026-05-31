function e(e, t) {
  for (var r = 0; r < t.length; r++) {
    const n = t[r];
    if (typeof n != "string" && !Array.isArray(n)) {
      for (const t in n) {
        if (t !== "default" && !(t in e)) {
          const r = Object.getOwnPropertyDescriptor(n, t);
          if (r) {
            Object.defineProperty(e, t, r.get ? r : {
              enumerable: true,
              get: () => n[t]
            });
          }
        }
      }
    }
  }
  return Object.freeze(Object.defineProperty(e, Symbol.toStringTag, {
    value: "Module"
  }));
}
var t = typeof globalThis != "undefined" ? globalThis : typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : {};
function r(e) {
  if (e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default")) {
    return e.default;
  } else {
    return e;
  }
}
function n(e) {
  if (Object.prototype.hasOwnProperty.call(e, "__esModule")) {
    return e;
  }
  var t = e.default;
  if (typeof t == "function") {
    var r = function e() {
      var r = false;
      try {
        r = this instanceof e;
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
    value: true
  });
  Object.keys(e).forEach(function (t) {
    var n = Object.getOwnPropertyDescriptor(e, t);
    Object.defineProperty(r, t, n.get ? n : {
      enumerable: true,
      get: function () {
        return e[t];
      }
    });
  });
  return r;
}
var a;
var o;
var s = {
  exports: {}
};
var i = {};
function c() {
  if (!o) {
    o = 1;
    s.exports = function () {
      if (a) {
        return i;
      }
      a = 1;
      var e = Symbol.for("react.transitional.element");
      var t = Symbol.for("react.fragment");
      function r(t, r, n) {
        var a = null;
        if (n !== undefined) {
          a = "" + n;
        }
        if (r.key !== undefined) {
          a = "" + r.key;
        }
        if ("key" in r) {
          n = {};
          for (var o in r) {
            if (o !== "key") {
              n[o] = r[o];
            }
          }
        } else {
          n = r;
        }
        r = n.ref;
        return {
          $$typeof: e,
          type: t,
          key: a,
          ref: r !== undefined ? r : null,
          props: n
        };
      }
      i.Fragment = t;
      i.jsx = r;
      i.jsxs = r;
      return i;
    }();
  }
  return s.exports;
}
var u;
var l;
var f = c();
var d = {
  exports: {}
};
var p = {};
function h() {
  if (u) {
    return p;
  }
  u = 1;
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
    enqueueSetState: function () {}
  };
  var m = Object.assign;
  var E = {};
  function _(e, t, r) {
    this.props = e;
    this.context = t;
    this.refs = E;
    this.updater = r || y;
  }
  function w() {}
  function g(e, t, r) {
    this.props = e;
    this.context = t;
    this.refs = E;
    this.updater = r || y;
  }
  _.prototype.isReactComponent = {};
  _.prototype.setState = function (e, t) {
    if (typeof e != "object" && typeof e != "function" && e != null) {
      throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
    }
    this.updater.enqueueSetState(this, e, t, "setState");
  };
  _.prototype.forceUpdate = function (e) {
    this.updater.enqueueForceUpdate(this, e, "forceUpdate");
  };
  w.prototype = _.prototype;
  var S = g.prototype = new w();
  S.constructor = g;
  m(S, _.prototype);
  S.isPureReactComponent = true;
  var T = Array.isArray;
  function b() {}
  var A = {
    H: null,
    A: null,
    T: null,
    S: null
  };
  var v = Object.prototype.hasOwnProperty;
  function O(t, r, n) {
    var a = n.ref;
    return {
      $$typeof: e,
      type: t,
      key: r,
      ref: a !== undefined ? a : null,
      props: n
    };
  }
  function R(t) {
    return typeof t == "object" && t !== null && t.$$typeof === e;
  }
  var P = /\/+/g;
  function I(e, t) {
    if (typeof e == "object" && e !== null && e.key != null) {
      r = "" + e.key;
      n = {
        "=": "=0",
        ":": "=2"
      };
      return "$" + r.replace(/[=:]/g, function (e) {
        return n[e];
      });
    } else {
      return t.toString(36);
    }
    var r;
    var n;
  }
  function D(r, n, a, o, s) {
    var i = typeof r;
    if (i === "undefined" || i === "boolean") {
      r = null;
    }
    var c;
    var u;
    var l = false;
    if (r === null) {
      l = true;
    } else {
      switch (i) {
        case "bigint":
        case "string":
        case "number":
          l = true;
          break;
        case "object":
          switch (r.$$typeof) {
            case e:
            case t:
              l = true;
              break;
            case f:
              return D((l = r._init)(r._payload), n, a, o, s);
          }
      }
    }
    if (l) {
      s = s(r);
      l = o === "" ? "." + I(r, 0) : o;
      if (T(s)) {
        a = "";
        if (l != null) {
          a = l.replace(P, "$&/") + "/";
        }
        D(s, n, a, "", function (e) {
          return e;
        });
      } else if (s != null) {
        if (R(s)) {
          c = s;
          u = a + (s.key == null || r && r.key === s.key ? "" : ("" + s.key).replace(P, "$&/") + "/") + l;
          s = O(c.type, u, c.props);
        }
        n.push(s);
      }
      return 1;
    }
    l = 0;
    var d;
    var p = o === "" ? "." : o + ":";
    if (T(r)) {
      for (var y = 0; y < r.length; y++) {
        l += D(o = r[y], n, a, i = p + I(o, y), s);
      }
    } else if (typeof (y = (d = r) === null || typeof d != "object" ? null : typeof (d = h && d[h] || d["@@iterator"]) == "function" ? d : null) == "function") {
      r = y.call(r);
      y = 0;
      while (!(o = r.next()).done) {
        l += D(o = o.value, n, a, i = p + I(o, y++), s);
      }
    } else if (i === "object") {
      if (typeof r.then == "function") {
        return D(function (e) {
          switch (e.status) {
            case "fulfilled":
              return e.value;
            case "rejected":
              throw e.reason;
            default:
              if (typeof e.status == "string") {
                e.then(b, b);
              } else {
                e.status = "pending";
                e.then(function (t) {
                  if (e.status === "pending") {
                    e.status = "fulfilled";
                    e.value = t;
                  }
                }, function (t) {
                  if (e.status === "pending") {
                    e.status = "rejected";
                    e.reason = t;
                  }
                });
              }
              switch (e.status) {
                case "fulfilled":
                  return e.value;
                case "rejected":
                  throw e.reason;
              }
          }
          throw e;
        }(r), n, a, o, s);
      }
      n = String(r);
      throw Error("Objects are not valid as a React child (found: " + (n === "[object Object]" ? "object with keys {" + Object.keys(r).join(", ") + "}" : n) + "). If you meant to render a collection of children, use an array instead.");
    }
    return l;
  }
  function C(e, t, r) {
    if (e == null) {
      return e;
    }
    var n = [];
    var a = 0;
    D(e, n, "", "", function (e) {
      return t.call(r, e, a++);
    });
    return n;
  }
  function k(e) {
    if (e._status === -1) {
      var t = e._result;
      (t = t()).then(function (t) {
        if (e._status === 0 || e._status === -1) {
          e._status = 1;
          e._result = t;
        }
      }, function (t) {
        if (e._status === 0 || e._status === -1) {
          e._status = 2;
          e._result = t;
        }
      });
      if (e._status === -1) {
        e._status = 0;
        e._result = t;
      }
    }
    if (e._status === 1) {
      return e._result.default;
    }
    throw e._result;
  }
  var N = typeof reportError == "function" ? reportError : function (e) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var t = new window.ErrorEvent("error", {
        bubbles: true,
        cancelable: true,
        message: typeof e == "object" && e !== null && typeof e.message == "string" ? String(e.message) : String(e),
        error: e
      });
      if (!window.dispatchEvent(t)) {
        return;
      }
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", e);
      return;
    }
  };
  var U = {
    map: C,
    forEach: function (e, t, r) {
      C(e, function () {
        t.apply(this, arguments);
      }, r);
    },
    count: function (e) {
      var t = 0;
      C(e, function () {
        t++;
      });
      return t;
    },
    toArray: function (e) {
      return C(e, function (e) {
        return e;
      }) || [];
    },
    only: function (e) {
      if (!R(e)) {
        throw Error("React.Children.only expected to receive a single React element child.");
      }
      return e;
    }
  };
  p.Activity = d;
  p.Children = U;
  p.Component = _;
  p.Fragment = r;
  p.Profiler = a;
  p.PureComponent = g;
  p.StrictMode = n;
  p.Suspense = c;
  p.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = A;
  p.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function (e) {
      return A.H.useMemoCache(e);
    }
  };
  p.cache = function (e) {
    return function () {
      return e.apply(null, arguments);
    };
  };
  p.cacheSignal = function () {
    return null;
  };
  p.cloneElement = function (e, t, r) {
    if (e == null) {
      throw Error("The argument must be a React element, but you passed " + e + ".");
    }
    var n = m({}, e.props);
    var a = e.key;
    if (t != null) {
      if (t.key !== undefined) {
        a = "" + t.key;
      }
      for (o in t) {
        if (!!v.call(t, o) && o !== "key" && o !== "__self" && o !== "__source" && (o !== "ref" || t.ref !== undefined)) {
          n[o] = t[o];
        }
      }
    }
    var o = arguments.length - 2;
    if (o === 1) {
      n.children = r;
    } else if (o > 1) {
      var s = Array(o);
      for (var i = 0; i < o; i++) {
        s[i] = arguments[i + 2];
      }
      n.children = s;
    }
    return O(e.type, a, n);
  };
  p.createContext = function (e) {
    (e = {
      $$typeof: s,
      _currentValue: e,
      _currentValue2: e,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    }).Provider = e;
    e.Consumer = {
      $$typeof: o,
      _context: e
    };
    return e;
  };
  p.createElement = function (e, t, r) {
    var n;
    var a = {};
    var o = null;
    if (t != null) {
      if (t.key !== undefined) {
        o = "" + t.key;
      }
      for (n in t) {
        if (v.call(t, n) && n !== "key" && n !== "__self" && n !== "__source") {
          a[n] = t[n];
        }
      }
    }
    var s = arguments.length - 2;
    if (s === 1) {
      a.children = r;
    } else if (s > 1) {
      var i = Array(s);
      for (var c = 0; c < s; c++) {
        i[c] = arguments[c + 2];
      }
      a.children = i;
    }
    if (e && e.defaultProps) {
      for (n in s = e.defaultProps) {
        if (a[n] === undefined) {
          a[n] = s[n];
        }
      }
    }
    return O(e, o, a);
  };
  p.createRef = function () {
    return {
      current: null
    };
  };
  p.forwardRef = function (e) {
    return {
      $$typeof: i,
      render: e
    };
  };
  p.isValidElement = R;
  p.lazy = function (e) {
    return {
      $$typeof: f,
      _payload: {
        _status: -1,
        _result: e
      },
      _init: k
    };
  };
  p.memo = function (e, t) {
    return {
      $$typeof: l,
      type: e,
      compare: t === undefined ? null : t
    };
  };
  p.startTransition = function (e) {
    var t = A.T;
    var r = {};
    A.T = r;
    try {
      var n = e();
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
  p.unstable_useCacheRefresh = function () {
    return A.H.useCacheRefresh();
  };
  p.use = function (e) {
    return A.H.use(e);
  };
  p.useActionState = function (e, t, r) {
    return A.H.useActionState(e, t, r);
  };
  p.useCallback = function (e, t) {
    return A.H.useCallback(e, t);
  };
  p.useContext = function (e) {
    return A.H.useContext(e);
  };
  p.useDebugValue = function () {};
  p.useDeferredValue = function (e, t) {
    return A.H.useDeferredValue(e, t);
  };
  p.useEffect = function (e, t) {
    return A.H.useEffect(e, t);
  };
  p.useEffectEvent = function (e) {
    return A.H.useEffectEvent(e);
  };
  p.useId = function () {
    return A.H.useId();
  };
  p.useImperativeHandle = function (e, t, r) {
    return A.H.useImperativeHandle(e, t, r);
  };
  p.useInsertionEffect = function (e, t) {
    return A.H.useInsertionEffect(e, t);
  };
  p.useLayoutEffect = function (e, t) {
    return A.H.useLayoutEffect(e, t);
  };
  p.useMemo = function (e, t) {
    return A.H.useMemo(e, t);
  };
  p.useOptimistic = function (e, t) {
    return A.H.useOptimistic(e, t);
  };
  p.useReducer = function (e, t, r) {
    return A.H.useReducer(e, t, r);
  };
  p.useRef = function (e) {
    return A.H.useRef(e);
  };
  p.useState = function (e) {
    return A.H.useState(e);
  };
  p.useSyncExternalStore = function (e, t, r) {
    return A.H.useSyncExternalStore(e, t, r);
  };
  p.useTransition = function () {
    return A.H.useTransition();
  };
  p.version = "19.2.1";
  return p;
}
function y() {
  if (!l) {
    l = 1;
    d.exports = h();
  }
  return d.exports;
}
var m = y();
const E = r(m);
const _ = e({
  __proto__: null,
  default: E
}, [m]);
function w(e) {
  let t;
  let r;
  let n;
  let a = false;
  return function (o) {
    if (t === undefined) {
      t = o;
      r = 0;
      n = -1;
    } else {
      t = function (e, t) {
        const r = new Uint8Array(e.length + t.length);
        r.set(e);
        r.set(t, e.length);
        return r;
      }(t, o);
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
      e(t.subarray(i, o), n);
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
const g = "text/event-stream";
const S = "last-event-id";
function T(e, t) {
  var {
    signal: r,
    headers: n,
    onopen: a,
    onmessage: o,
    onclose: s,
    onerror: i,
    openWhenHidden: c,
    fetch: u
  } = t;
  var l = function (e, t) {
    var r = {};
    for (var n in e) {
      if (Object.prototype.hasOwnProperty.call(e, n) && t.indexOf(n) < 0) {
        r[n] = e[n];
      }
    }
    if (e != null && typeof Object.getOwnPropertySymbols == "function") {
      var a = 0;
      for (n = Object.getOwnPropertySymbols(e); a < n.length; a++) {
        if (t.indexOf(n[a]) < 0 && Object.prototype.propertyIsEnumerable.call(e, n[a])) {
          r[n[a]] = e[n[a]];
        }
      }
    }
    return r;
  }(t, ["signal", "headers", "onopen", "onmessage", "onclose", "onerror", "openWhenHidden", "fetch"]);
  return new Promise((t, f) => {
    const d = Object.assign({}, n);
    let p;
    function h() {
      p.abort();
      if (!document.hidden) {
        A();
      }
    }
    d.accept ||= g;
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
    const T = a ?? b;
    async function A() {
      p = new AbortController();
      try {
        const r = await _(e, Object.assign(Object.assign({}, l), {
          headers: d,
          signal: p.signal
        }));
        await T(r);
        await async function (e, t) {
          const r = e.getReader();
          let n;
          while (!(n = await r.read()).done) {
            t(n.value);
          }
        }(r.body, w(function (e, t, r) {
          let n = {
            data: "",
            event: "",
            id: "",
            retry: undefined
          };
          const a = new TextDecoder();
          return function (o, s) {
            if (o.length === 0) {
              if (r != null) {
                r(n);
              }
              n = {
                data: "",
                event: "",
                id: "",
                retry: undefined
              };
            } else if (s > 0) {
              const r = a.decode(o.subarray(0, s));
              const i = s + (o[s + 1] === 32 ? 2 : 1);
              const c = a.decode(o.subarray(i));
              switch (r) {
                case "data":
                  n.data = n.data ? n.data + "\n" + c : c;
                  break;
                case "event":
                  n.event = c;
                  break;
                case "id":
                  e(n.id = c);
                  break;
                case "retry":
                  const r = parseInt(c, 10);
                  if (!isNaN(r)) {
                    t(n.retry = r);
                  }
              }
            }
          };
        }(e => {
          if (e) {
            d[S] = e;
          } else {
            delete d[S];
          }
        }, e => {
          y = e;
        }, o)));
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
function b(e) {
  const t = e.headers.get("content-type");
  if (!(t == null ? undefined : t.startsWith(g))) {
    throw new Error(`Expected content-type to be ${g}, Actual: ${t}`);
  }
}
const A = {
  production: {
    SEGMENT_WRITE_KEY: "H7hVDRIBUrlBySLqJ15oAivgqhomdAKT"
  },
  development: {
    SEGMENT_WRITE_KEY: "hNex10EGp3coubOXQI1BIElYaZcA1o0u"
  }
};
const v = "fcoeoabgfenejglbffodgkkbkcdhcgfn";
const O = {
  AUTHORIZE_URL: "https://claude.ai/oauth/authorize",
  TOKEN_URL: "https://platform.claude.com/v1/oauth/token",
  SCOPES_STR: "user:profile user:inference user:chat",
  CLIENT_ID: "54511e87-7abf-4923-9d84-d6f24532e871",
  REDIRECT_URI: `chrome-extension://${"dihbgbndebgnbjfmelmegjepbnkhlgni"}/oauth_callback.html`
};
const R = {
  development: O,
  production: {
    ...O,
    CLIENT_ID: "dae2cad8-15c5-43d2-9046-fcaecc135fa4",
    REDIRECT_URI: `chrome-extension://${v}/oauth_callback.html`
  }
};
const P = () => {
  const e = "production";
  const t = R[e];
  return {
    environment: e,
    apiBaseUrl: "https://api.anthropic.com",
    wsApiBaseUrl: "wss://api.anthropic.com",
    segmentWriteKey: A[e].SEGMENT_WRITE_KEY,
    oauth: t
  };
};
var I = (e => {
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
})(I || {});
async function D(e, t) {
  const r = await chrome.storage.local.get(e);
  if (r[e] !== undefined) {
    return r[e];
  } else {
    return t;
  }
}
async function C(e, t) {
  await chrome.storage.local.set({
    [e]: t
  });
}
async function k(e) {
  const t = Array.isArray(e) ? e : [e];
  await chrome.storage.local.remove(t);
}
async function N(e) {
  return await chrome.storage.local.get(e);
}
async function U(e) {
  await chrome.storage.local.set(e);
}
const x = new Set(["anonymousId", "updateAvailable"]);
async function M() {
  const e = Object.values(I).filter(e => !x.has(e));
  await k(e);
}
const L = e => btoa(String.fromCharCode(...e)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
const j = async (e, t) => {
  await U({
    [I.ACCESS_TOKEN]: e.accessToken,
    [I.REFRESH_TOKEN]: e.refreshToken,
    [I.TOKEN_EXPIRY]: e.expiresAt,
    [I.OAUTH_STATE]: t
  });
};
const H = async (e, t) => {
  try {
    const r = await fetch(t.TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: t.CLIENT_ID,
        refresh_token: e
      })
    });
    if (!r.ok) {
      const e = await r.text();
      return {
        success: false,
        error: `Token refresh failed: ${r.status} ${e}`
      };
    }
    const n = await r.json();
    if (n.error) {
      return {
        success: false,
        error: n.error_description || n.error
      };
    } else {
      return {
        success: true,
        accessToken: n.access_token,
        refreshToken: n.refresh_token || e,
        expiresAt: n.expires_in ? Date.now() + n.expires_in * 1000 : undefined
      };
    }
  } catch (r) {
    return {
      success: false,
      error: r instanceof Error ? r.message : "Network error during token refresh"
    };
  }
};
const F = async () => {
  try {
    const e = await N([I.ACCESS_TOKEN, I.REFRESH_TOKEN, I.TOKEN_EXPIRY]);
    if (!e[I.ACCESS_TOKEN]) {
      return {
        isValid: false,
        isRefreshed: false
      };
    }
    const t = Date.now();
    const r = e[I.TOKEN_EXPIRY];
    const n = !!r && t < r;
    if (!r || !(t >= r - 3600000)) {
      return {
        isValid: n,
        isRefreshed: false
      };
    }
    if (!e[I.REFRESH_TOKEN]) {
      return {
        isValid: n,
        isRefreshed: false
      };
    }
    const a = P();
    for (let o = 0; o < 3; o++) {
      const t = await H(e[I.REFRESH_TOKEN], a.oauth);
      if (t.success) {
        await j(t);
        return {
          isValid: true,
          isRefreshed: true
        };
      }
      if (o === 2) {
        await k([I.ACCESS_TOKEN, I.REFRESH_TOKEN, I.TOKEN_EXPIRY]);
        return {
          isValid: n,
          isRefreshed: false
        };
      }
    }
    return {
      isValid: n,
      isRefreshed: false
    };
  } catch {
    return {
      isValid: false,
      isRefreshed: false
    };
  }
};
const $ = async () => {
  if (!(await F()).isValid) {
    return;
  }
  return (await D(I.ACCESS_TOKEN)) || undefined;
};
const V = async (e, t) => {
  try {
    const r = new URLSearchParams(new URL(e).search);
    const n = r.get("code");
    const a = r.get("error");
    const o = r.get("error_description");
    const s = r.get("state");
    if (a) {
      return {
        success: false,
        error: `Authentication failed: ${a}${o ? " - " + o : ""}`
      };
    }
    if (!n) {
      return {
        success: false,
        error: "No authorization code received"
      };
    }
    const i = (await D(I.CODE_VERIFIER)) || "";
    const c = P();
    const u = await (async (e, t, r, n) => {
      try {
        const a = await fetch(n.TOKEN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: n.CLIENT_ID,
            code: e,
            redirect_uri: n.REDIRECT_URI,
            state: t,
            code_verifier: r
          })
        });
        if (!a.ok) {
          const e = await a.text();
          return {
            success: false,
            error: `Token exchange failed: ${a.status} ${e}`
          };
        }
        const o = await a.json();
        if (o.error) {
          return {
            success: false,
            error: o.error_description || o.error
          };
        } else {
          return {
            success: true,
            accessToken: o.access_token,
            refreshToken: o.refresh_token,
            expiresAt: o.expires_in ? Date.now() + o.expires_in * 1000 : undefined
          };
        }
      } catch (a) {
        return {
          success: false,
          error: a instanceof Error ? a.message : "Network error during token exchange"
        };
      }
    })(n, s || "", i, c.oauth);
    if (u.success) {
      await j(u, s || undefined);
      const e = "https://claude.ai/chrome/installed";
      if (t) {
        await chrome.tabs.update(t, {
          url: e
        });
      }
      return {
        success: true,
        message: "Authentication successful!"
      };
    }
    return {
      success: false,
      error: u.error || "Failed to exchange authorization code for token"
    };
  } catch (r) {
    return {
      success: false,
      error: r instanceof Error ? r.message : "An unexpected error occurred during authentication"
    };
  }
};
const K = async () => {
  await M();
};
const G = async () => {
  const e = P();
  const t = (e => {
    const t = new Uint8Array(e);
    crypto.getRandomValues(t);
    return L(t);
  })(32);
  const r = L(crypto.getRandomValues(new Uint8Array(32)));
  const n = await (async e => {
    const t = new TextEncoder().encode(e);
    const r = await crypto.subtle.digest("SHA-256", t);
    return L(new Uint8Array(r));
  })(r);
  await U({
    [I.OAUTH_STATE]: t,
    [I.CODE_VERIFIER]: r
  });
  const a = new URLSearchParams({
    client_id: e.oauth.CLIENT_ID,
    response_type: "code",
    scope: e.oauth.SCOPES_STR,
    redirect_uri: e.oauth.REDIRECT_URI,
    state: t,
    code_challenge: n,
    code_challenge_method: "S256"
  });
  const o = `${e.oauth.AUTHORIZE_URL}?${a.toString()}`;
  chrome.tabs.create({
    url: o
  });
};
const Y = new class {
  baseURL;
  constructor() {
    const e = P();
    this.baseURL = e.apiBaseUrl;
  }
  async fetch(e, t = {}) {
    const r = await $();
    if (!r) {
      throw new Error("No valid OAuth token available");
    }
    const n = `${this.baseURL}${e}`;
    const a = {
      Authorization: `Bearer ${r}`,
      "Content-Type": "application/json",
      "anthropic-client-platform": "claude_browser_extension",
      ...t.headers
    };
    const o = await fetch(n, {
      ...t,
      headers: a
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
    const r = await $();
    if (!r) {
      throw new Error("No valid OAuth token available for SSE stream");
    }
    const n = `${this.baseURL}${e}`;
    const a = new AbortController();
    await T(n, {
      ...t,
      headers: {
        Authorization: `Bearer ${r}`,
        "anthropic-client-platform": "claude_browser_extension",
        ...t.headers
      },
      signal: t.signal || a.signal
    });
    return () => {
      a.abort();
    };
  }
}();
class B {
  config;
  features = null;
  cacheTimestamp = null;
  initPromise = null;
  isRefreshing = false;
  constructor(e) {
    this.config = {
      ...e,
      cacheTTL: e.cacheTTL ?? 300000,
      storageKey: e.storageKey ?? "features"
    };
  }
  setOnFeaturesUpdated(e) {
    this.config.onFeaturesUpdated = e;
  }
  async loadFromCache() {
    try {
      const e = (await chrome.storage.local.get(this.config.storageKey))[this.config.storageKey];
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
        timestamp: Date.now()
      };
      await chrome.storage.local.set({
        [this.config.storageKey]: t
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
      return this.fetchAndUpdate().catch(e => {}).finally(() => {
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
            } catch (t) {} finally {
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
async function W() {
  return Y.fetch("/api/bootstrap/features/claude_in_chrome");
}
let z = null;
const q = m.createContext(null);
function X({
  children: e
}) {
  const [t, r] = m.useState(null);
  const [n, a] = m.useState(false);
  const [o, s] = m.useState(null);
  const i = m.useRef(null);
  m.useEffect(() => {
    const e = e => {
      r(e);
      s(null);
    };
    n = e;
    z ||= new B({
      fetchFeatures: W,
      onFeaturesUpdated: n
    });
    const t = z;
    var n;
    i.current = t;
    t.setOnFeaturesUpdated(e);
    t.initialize().then(() => {
      a(true);
    }).catch(e => {
      s(e instanceof Error ? e : new Error(String(e)));
      a(true);
    });
  }, []);
  const c = m.useCallback((e, t) => i.current ? i.current.getFeatureValue(e, t) : t, [t]);
  const u = m.useCallback(e => !!i.current && i.current.isFeatureEnabled(e), [t]);
  const l = m.useCallback(e => {
    if (i.current) {
      return i.current.getFeature(e);
    }
  }, [t]);
  const d = m.useCallback(e => t?.[e] !== undefined, [t]);
  const p = m.useCallback(async () => {
    if (i.current) {
      await i.current.refresh();
    }
  }, []);
  const h = m.useMemo(() => ({
    isReady: n,
    error: o,
    getFeatureValue: c,
    isFeatureEnabled: u,
    getFeature: l,
    hasFeature: d,
    refresh: p
  }), [n, o, c, u, l, d, p]);
  return f.jsx(q.Provider, {
    value: h,
    children: e
  });
}
function J() {
  const e = m.useContext(q);
  if (!e) {
    throw new Error("useFeatures must be used within a FeatureProvider");
  }
  return e;
}
function Q(e, t) {
  const {
    getFeatureValue: r
  } = J();
  return r(e, t);
}
function Z(e) {
  const {
    isFeatureEnabled: t
  } = J();
  return t(e);
}
function ee() {
  const {
    isReady: e
  } = J();
  return e;
}
const te = {};
const re = function (e, t, r) {
  let n = Promise.resolve();
  if (t && t.length > 0) {
    let e = function (e) {
      return Promise.all(e.map(e => Promise.resolve(e).then(e => ({
        status: "fulfilled",
        value: e
      }), e => ({
        status: "rejected",
        reason: e
      }))));
    };
    document.getElementsByTagName("link");
    const r = document.querySelector("meta[property=csp-nonce]");
    const a = r?.nonce || r?.getAttribute("nonce");
    n = e(t.map(e => {
      if ((e = function (e) {
        return "/" + e;
      }(e)) in te) {
        return;
      }
      te[e] = true;
      const t = e.endsWith(".css");
      const r = t ? "[rel=\"stylesheet\"]" : "";
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
          n.addEventListener("error", () => r(new Error(`Unable to preload CSS for ${e}`)));
        });
      } else {
        return undefined;
      }
    }));
  }
  function a(e) {
    const t = new Event("vite:preloadError", {
      cancelable: true
    });
    t.payload = e;
    window.dispatchEvent(t);
    if (!t.defaultPrevented) {
      throw e;
    }
  }
  return n.then(t => {
    for (const e of t || []) {
      if (e.status === "rejected") {
        a(e.reason);
      }
    }
    return e().catch(a);
  });
};
function ne(e, t) {
  return (ne = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (e, t) {
    e.__proto__ = t;
  } || function (e, t) {
    for (var r in t) {
      if (Object.prototype.hasOwnProperty.call(t, r)) {
        e[r] = t[r];
      }
    }
  })(e, t);
}
function ae(e, t) {
  if (typeof t != "function" && t !== null) {
    throw new TypeError("Class extends value " + String(t) + " is not a constructor or null");
  }
  function r() {
    this.constructor = e;
  }
  ne(e, t);
  e.prototype = t === null ? Object.create(t) : (r.prototype = t.prototype, new r());
}
function oe() {
  oe = Object.assign || function (e) {
    var t;
    for (var r = 1, n = arguments.length; r < n; r++) {
      for (var a in t = arguments[r]) {
        if (Object.prototype.hasOwnProperty.call(t, a)) {
          e[a] = t[a];
        }
      }
    }
    return e;
  };
  return oe.apply(this, arguments);
}
function se(e, t) {
  var r = {};
  for (var n in e) {
    if (Object.prototype.hasOwnProperty.call(e, n) && t.indexOf(n) < 0) {
      r[n] = e[n];
    }
  }
  if (e != null && typeof Object.getOwnPropertySymbols == "function") {
    var a = 0;
    for (n = Object.getOwnPropertySymbols(e); a < n.length; a++) {
      if (t.indexOf(n[a]) < 0 && Object.prototype.propertyIsEnumerable.call(e, n[a])) {
        r[n[a]] = e[n[a]];
      }
    }
  }
  return r;
}
function ie(e, t, r, n) {
  return new (r ||= Promise)(function (a, o) {
    function s(e) {
      try {
        c(n.next(e));
      } catch (t) {
        o(t);
      }
    }
    function i(e) {
      try {
        c(n.throw(e));
      } catch (t) {
        o(t);
      }
    }
    function c(e) {
      var t;
      if (e.done) {
        a(e.value);
      } else {
        (t = e.value, t instanceof r ? t : new r(function (e) {
          e(t);
        })).then(s, i);
      }
    }
    c((n = n.apply(e, t || [])).next());
  });
}
function ce(e, t) {
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
    ops: []
  };
  o = {
    next: i(0),
    throw: i(1),
    return: i(2)
  };
  if (typeof Symbol == "function") {
    o[Symbol.iterator] = function () {
      return this;
    };
  }
  return o;
  function i(i) {
    return function (c) {
      return function (i) {
        if (r) {
          throw new TypeError("Generator is already executing.");
        }
        while (o && (o = 0, i[0] && (s = 0)), s) {
          try {
            r = 1;
            if (n && (a = i[0] & 2 ? n.return : i[0] ? n.throw || ((a = n.return) && a.call(n), 0) : n.next) && !(a = a.call(n, i[1])).done) {
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
                  done: false
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
                if (!(a = s.trys, (a = a.length > 0 && a[a.length - 1]) || i[0] !== 6 && i[0] !== 2)) {
                  s = 0;
                  continue;
                }
                if (i[0] === 3 && (!a || i[1] > a[0] && i[1] < a[3])) {
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
            i = t.call(e, s);
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
          done: true
        };
      }([i, c]);
    };
  }
}
function ue(e, t, r) {
  if (r || arguments.length === 2) {
    var n;
    for (var a = 0, o = t.length; a < o; a++) {
      if (!!n || !(a in t)) {
        n ||= Array.prototype.slice.call(t, 0, a);
        n[a] = t[a];
      }
    }
  }
  return e.concat(n || Array.prototype.slice.call(t));
}
function le(e, t, r) {
  if (t.split) {
    t = t.split(".");
  }
  var n;
  for (var a, o = 0, s = t.length, i = e; o < s && (a = "" + t[o++]) != "__proto__" && a !== "constructor" && a !== "prototype";) {
    i = i[a] = o === s ? r : typeof (n = i[a]) == typeof t ? n : t[o] * 0 != 0 || ~("" + t[o]).indexOf(".") ? {} : [];
  }
}
var fe;
for (var de = 256, pe = []; de--;) {
  pe[de] = (de + 256).toString(16).substring(1);
}
function he() {
  var e;
  var t = 0;
  var r = "";
  if (!fe || de + 16 > 256) {
    for (fe = Array(t = 256); t--;) {
      fe[t] = Math.random() * 256 | 0;
    }
    t = de = 0;
  }
  for (; t < 16; t++) {
    e = fe[de + t];
    r += t == 6 ? pe[e & 15 | 64] : t == 8 ? pe[e & 63 | 128] : pe[e];
    if (t & 1 && t > 1 && t < 11) {
      r += "-";
    }
  }
  de++;
  return r;
}
class ye {
  static async getAllPrompts() {
    return (await D(I.SAVED_PROMPTS)) || [];
  }
  static async getPromptById(e) {
    return (await this.getAllPrompts()).find(t => t.id === e);
  }
  static async getPromptByCommand(e) {
    return (await this.getAllPrompts()).find(t => t.command === e);
  }
  static async savePrompt(e) {
    const t = await this.getAllPrompts();
    if (e.command) {
      if (t.find(t => t.command === e.command)) {
        throw new Error(`/${e.command} is already in use`);
      }
    }
    const r = {
      ...e,
      id: `prompt_${Date.now()}`,
      createdAt: e.createdAt || Date.now(),
      usageCount: e.usageCount || 0
    };
    t.push(r);
    await C(I.SAVED_PROMPTS, t);
    if (r.repeatType && r.repeatType !== "none") {
      await this.updateAlarmForPrompt(r);
    }
    return r;
  }
  static async updatePrompt(e, t) {
    const r = await this.getAllPrompts();
    const n = r.findIndex(t => t.id === e);
    if (n === -1) {
      return;
    }
    if (t.command && t.command !== r[n].command) {
      if (r.find(e => e.command === t.command)) {
        throw new Error(`/${t.command} is already in use`);
      }
    }
    const a = r[n];
    r[n] = {
      ...r[n],
      ...t
    };
    await C(I.SAVED_PROMPTS, r);
    const o = r[n];
    if (a.repeatType !== o.repeatType || a.specificTime !== o.specificTime || a.specificDate !== o.specificDate || a.dayOfWeek !== o.dayOfWeek || a.dayOfMonth !== o.dayOfMonth || a.monthAndDay !== o.monthAndDay) {
      await this.updateAlarmForPrompt(o);
    }
    return r[n];
  }
  static async deletePrompt(e) {
    const t = await this.getAllPrompts();
    const r = t.find(t => t.id === e);
    const n = t.filter(t => t.id !== e);
    return n.length !== t.length && (r?.repeatType && r.repeatType !== "none" && (await chrome.alarms.clear(e)), await C(I.SAVED_PROMPTS, n), true);
  }
  static async recordPromptUsage(e) {
    const t = await this.getAllPrompts();
    const r = t.find(t => t.id === e);
    if (r) {
      r.lastUsedAt = Date.now();
      r.usageCount = (r.usageCount || 0) + 1;
      await C(I.SAVED_PROMPTS, t);
    }
  }
  static async searchPrompts(e) {
    const t = await this.getAllPrompts();
    const r = e.toLowerCase();
    return t.filter(e => e.prompt.toLowerCase().includes(r) || e.command && e.command.toLowerCase().includes(r));
  }
  static async exportPrompts(e) {
    const t = await this.getAllPrompts();
    const r = e ? t.filter(t => e.includes(t.id)) : t;
    return JSON.stringify(r, null, 2);
  }
  static async importPrompts(e, t = false) {
    const r = JSON.parse(e);
    const n = t ? [] : await this.getAllPrompts();
    const a = r.map(e => ({
      ...e,
      id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      usageCount: 0,
      lastUsedAt: undefined
    }));
    const o = [...n, ...a].filter(e => e.command).map(e => e.command);
    const s = new Set(o);
    if (o.length !== s.size) {
      throw new Error("Import contains duplicate command shortcuts");
    }
    const i = [...n, ...a];
    await C(I.SAVED_PROMPTS, i);
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
      case "once":
        {
          if (!e.specificDate) {
            return;
          }
          const [o, s, i] = e.specificDate.split("-").map(Number);
          const c = new Date(o, s - 1, i, n, a, 0, 0);
          if (c > r) {
            await chrome.alarms.create(t, {
              when: c.getTime()
            });
          }
          break;
        }
      case "daily":
        {
          const e = new Date();
          e.setHours(n, a, 0, 0);
          if (e <= r) {
            e.setDate(e.getDate() + 1);
          }
          await chrome.alarms.create(t, {
            when: e.getTime(),
            periodInMinutes: 1440
          });
          break;
        }
      case "weekly":
        {
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
            periodInMinutes: 10080
          });
          break;
        }
      case "monthly":
        {
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
            when: o.getTime()
          });
          break;
        }
      case "annually":
        {
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
            when: i.getTime()
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
        const e = t.find(e => e.name === n.id);
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
      await C(I.SAVED_PROMPTS, e);
    }
  }
}
const me = Object.freeze(Object.defineProperty({
  __proto__: null,
  SavedPromptsService: ye
}, Symbol.toStringTag, {
  value: "Module"
}));
var Ee = (e => {
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
})(Ee || {});
const _e = async () => {
  let e = await D(I.ANONYMOUS_ID);
  if (!e) {
    e = crypto.randomUUID();
    await C(I.ANONYMOUS_ID, e);
  }
  return e;
};
const we = e => ({
  email: e.account.email,
  organizationID: e.organization.uuid,
  organizationUUID: e.organization.uuid,
  applicationSlug: "claude-browser-use",
  isMax: e.account.has_claude_max,
  isPro: e.account.has_claude_pro,
  orgType: e.organization.organization_type
});
var ge = (e => {
  e.ALLOW = "allow";
  e.DENY = "deny";
  return e;
})(ge || {});
var Se = (e => {
  e.ONCE = "once";
  e.ALWAYS = "always";
  return e;
})(Se || {});
function Te(e) {
  return {
    [Ee.NAVIGATE]: "navigate to",
    [Ee.READ_PAGE_CONTENT]: "read page content on",
    [Ee.READ_CONSOLE_MESSAGES]: "read debugging information on",
    [Ee.READ_NETWORK_REQUESTS]: "read debugging information on",
    [Ee.CLICK]: "click on",
    [Ee.TYPE]: "type text into",
    [Ee.UPLOAD_IMAGE]: "upload an image to",
    [Ee.DOMAIN_TRANSITION]: "navigate from",
    [Ee.PLAN_APPROVAL]: "approve plan for",
    [Ee.EXECUTE_JAVASCRIPT]: "execute JavaScript on",
    [Ee.REMOTE_MCP]: "access"
  }[e];
}
const be = ["follow_a_plan", "skip_all_permission_checks"];
const Ae = "follow_a_plan";
export { le as A, he as B, ie as C, Ae as D, ce as E, X as F, ee as G, K as H, V as I, B as J, we as K, ge as L, n as M, me as N, Se as P, E as R, I as S, Ee as T, be as U, re as _, r as a, ye as b, y as c, _e as d, J as e, Z as f, D as g, P as h, Te as i, f as j, $ as k, F as l, Y as m, N as n, G as o, t as p, c as q, m as r, C as s, k as t, Q as u, _ as v, oe as w, se as x, ue as y, ae as z };