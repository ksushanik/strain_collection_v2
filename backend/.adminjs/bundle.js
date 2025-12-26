(function (require$$0, require$$1, require$$2) {
	'use strict';

	function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

	var require$$0__default = /*#__PURE__*/_interopDefault(require$$0);
	var require$$1__default = /*#__PURE__*/_interopDefault(require$$1);
	var require$$2__default = /*#__PURE__*/_interopDefault(require$$2);

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	var dashboard = {};

	var __importDefault$2 = commonjsGlobal && commonjsGlobal.__importDefault || function (mod) {
	  return mod && mod.__esModule ? mod : {
	    "default": mod
	  };
	};
	Object.defineProperty(dashboard, "__esModule", {
	  value: true
	});
	const react_1$4 = __importDefault$2(require$$0__default.default);
	const design_system_1$4 = require$$1__default.default;
	const Dashboard = () => {
	  return react_1$4.default.createElement(design_system_1$4.Box, {
	    variant: 'grey',
	    p: 'xl'
	  }, [react_1$4.default.createElement(design_system_1$4.H2, {
	    key: 'header',
	    mb: 'lg'
	  }, 'Strain Collection Admin'), react_1$4.default.createElement(design_system_1$4.Text, {
	    key: 'text',
	    mb: 'xl'
	  }, 'Добро пожаловать в панель управления Strain Collection. Используйте меню слева для навигации по ресурсам.'), react_1$4.default.createElement(design_system_1$4.Box, {
	    key: 'stats',
	    display: 'flex',
	    gap: 'lg'
	  }, [react_1$4.default.createElement(design_system_1$4.Box, {
	    key: 'strains',
	    p: 'lg',
	    bg: 'white',
	    boxShadow: 'card',
	    borderRadius: 'sm',
	    flex: 1
	  }, [react_1$4.default.createElement(design_system_1$4.Text, {
	    key: 'strains-label',
	    fontWeight: 'bold'
	  }, 'Strains'), react_1$4.default.createElement(design_system_1$4.Text, {
	    key: 'strains-desc',
	    fontSize: 'sm',
	    mt: 'sm'
	  }, 'Управление штаммами микроорганизмов'), react_1$4.default.createElement(design_system_1$4.Button, {
	    key: 'strains-btn',
	    mt: 'md',
	    as: 'a',
	    href: '/admin/resources/Strain'
	  }, 'Перейти')]), react_1$4.default.createElement(design_system_1$4.Box, {
	    key: 'samples',
	    p: 'lg',
	    bg: 'white',
	    boxShadow: 'card',
	    borderRadius: 'sm',
	    flex: 1
	  }, [react_1$4.default.createElement(design_system_1$4.Text, {
	    key: 'samples-label',
	    fontWeight: 'bold'
	  }, 'Samples'), react_1$4.default.createElement(design_system_1$4.Text, {
	    key: 'samples-desc',
	    fontSize: 'sm',
	    mt: 'sm'
	  }, 'Управление образцами и сборами'), react_1$4.default.createElement(design_system_1$4.Button, {
	    key: 'samples-btn',
	    mt: 'md',
	    as: 'a',
	    href: '/admin/resources/Sample'
	  }, 'Перейти')]), react_1$4.default.createElement(design_system_1$4.Box, {
	    key: 'storage',
	    p: 'lg',
	    bg: 'white',
	    boxShadow: 'card',
	    borderRadius: 'sm',
	    flex: 1
	  }, [react_1$4.default.createElement(design_system_1$4.Text, {
	    key: 'storage-label',
	    fontWeight: 'bold'
	  }, 'Storage'), react_1$4.default.createElement(design_system_1$4.Text, {
	    key: 'storage-desc',
	    fontSize: 'sm',
	    mt: 'sm'
	  }, 'Управление хранилищем и ячейками'), react_1$4.default.createElement(design_system_1$4.Button, {
	    key: 'storage-btn',
	    mt: 'md',
	    as: 'a',
	    href: '/admin/resources/StorageBox'
	  }, 'Перейти')])])]);
	};
	var _default$4 = dashboard.default = Dashboard;

	var jsonShow = {};

	var __importDefault$1 = commonjsGlobal && commonjsGlobal.__importDefault || function (mod) {
	  return mod && mod.__esModule ? mod : {
	    "default": mod
	  };
	};
	Object.defineProperty(jsonShow, "__esModule", {
	  value: true
	});
	const react_1$3 = __importDefault$1(require$$0__default.default);
	const design_system_1$3 = require$$1__default.default;
	const JsonShow = props => {
	  const {
	    record,
	    property
	  } = props;
	  let value = record?.params?.[property.path];
	  if (!value && record?.params) {
	    const prefix = `${property.path}.`;
	    const obj = {};
	    let hasKeys = false;
	    Object.keys(record.params).forEach(key => {
	      if (key.startsWith(prefix)) {
	        obj[key.slice(prefix.length)] = record.params[key];
	        hasKeys = true;
	      }
	    });
	    if (hasKeys) value = obj;
	  }
	  if (!value) {
	    return react_1$3.default.createElement('span', null, '-');
	  }
	  let displayValue = value;
	  try {
	    if (typeof value === 'object') {
	      displayValue = JSON.stringify(value, null, 2);
	    } else if (typeof value === 'string') {
	      if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
	        const parsed = JSON.parse(value);
	        displayValue = JSON.stringify(parsed, null, 2);
	      }
	    }
	  } catch {}
	  const content = typeof displayValue === 'string' ? displayValue : JSON.stringify(displayValue, null, 2);
	  return react_1$3.default.createElement(design_system_1$3.Box, {
	    mb: 'xl'
	  }, react_1$3.default.createElement('pre', {
	    style: {
	      whiteSpace: 'pre-wrap',
	      fontSize: '12px',
	      fontFamily: 'monospace',
	      backgroundColor: '#f4f6f8',
	      padding: '10px',
	      borderRadius: '4px'
	    }
	  }, content));
	};
	var _default$3 = jsonShow.default = JsonShow;

	var restoreBackup = {};

	var jsxRuntime = {exports: {}};

	var reactJsxRuntime_development = {};

	/**
	 * @license React
	 * react-jsx-runtime.development.js
	 *
	 * Copyright (c) Facebook, Inc. and its affiliates.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	{
	  (function() {

	var React = require$$0__default.default;

	// ATTENTION
	// When adding new symbols to this file,
	// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
	// The Symbol used to tag the ReactElement-like types.
	var REACT_ELEMENT_TYPE = Symbol.for('react.element');
	var REACT_PORTAL_TYPE = Symbol.for('react.portal');
	var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
	var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
	var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
	var REACT_PROVIDER_TYPE = Symbol.for('react.provider');
	var REACT_CONTEXT_TYPE = Symbol.for('react.context');
	var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
	var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
	var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
	var REACT_MEMO_TYPE = Symbol.for('react.memo');
	var REACT_LAZY_TYPE = Symbol.for('react.lazy');
	var REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');
	var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	var FAUX_ITERATOR_SYMBOL = '@@iterator';
	function getIteratorFn(maybeIterable) {
	  if (maybeIterable === null || typeof maybeIterable !== 'object') {
	    return null;
	  }

	  var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];

	  if (typeof maybeIterator === 'function') {
	    return maybeIterator;
	  }

	  return null;
	}

	var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

	function error(format) {
	  {
	    {
	      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	        args[_key2 - 1] = arguments[_key2];
	      }

	      printWarning('error', format, args);
	    }
	  }
	}

	function printWarning(level, format, args) {
	  // When changing this logic, you might want to also
	  // update consoleWithStackDev.www.js as well.
	  {
	    var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
	    var stack = ReactDebugCurrentFrame.getStackAddendum();

	    if (stack !== '') {
	      format += '%s';
	      args = args.concat([stack]);
	    } // eslint-disable-next-line react-internal/safe-string-coercion


	    var argsWithFormat = args.map(function (item) {
	      return String(item);
	    }); // Careful: RN currently depends on this prefix

	    argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
	    // breaks IE9: https://github.com/facebook/react/issues/13610
	    // eslint-disable-next-line react-internal/no-production-logging

	    Function.prototype.apply.call(console[level], console, argsWithFormat);
	  }
	}

	// -----------------------------------------------------------------------------

	var enableScopeAPI = false; // Experimental Create Event Handle API.
	var enableCacheElement = false;
	var enableTransitionTracing = false; // No known bugs, but needs performance testing

	var enableLegacyHidden = false; // Enables unstable_avoidThisFallback feature in Fiber
	// stuff. Intended to enable React core members to more easily debug scheduling
	// issues in DEV builds.

	var enableDebugTracing = false; // Track which Fiber(s) schedule render work.

	var REACT_MODULE_REFERENCE;

	{
	  REACT_MODULE_REFERENCE = Symbol.for('react.module.reference');
	}

	function isValidElementType(type) {
	  if (typeof type === 'string' || typeof type === 'function') {
	    return true;
	  } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).


	  if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing  || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden  || type === REACT_OFFSCREEN_TYPE || enableScopeAPI  || enableCacheElement  || enableTransitionTracing ) {
	    return true;
	  }

	  if (typeof type === 'object' && type !== null) {
	    if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
	    // types supported by any Flight configuration anywhere since
	    // we don't know which Flight build this will end up being used
	    // with.
	    type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== undefined) {
	      return true;
	    }
	  }

	  return false;
	}

	function getWrappedName(outerType, innerType, wrapperName) {
	  var displayName = outerType.displayName;

	  if (displayName) {
	    return displayName;
	  }

	  var functionName = innerType.displayName || innerType.name || '';
	  return functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName;
	} // Keep in sync with react-reconciler/getComponentNameFromFiber


	function getContextName(type) {
	  return type.displayName || 'Context';
	} // Note that the reconciler package should generally prefer to use getComponentNameFromFiber() instead.


	function getComponentNameFromType(type) {
	  if (type == null) {
	    // Host root, text node or just invalid type.
	    return null;
	  }

	  {
	    if (typeof type.tag === 'number') {
	      error('Received an unexpected object in getComponentNameFromType(). ' + 'This is likely a bug in React. Please file an issue.');
	    }
	  }

	  if (typeof type === 'function') {
	    return type.displayName || type.name || null;
	  }

	  if (typeof type === 'string') {
	    return type;
	  }

	  switch (type) {
	    case REACT_FRAGMENT_TYPE:
	      return 'Fragment';

	    case REACT_PORTAL_TYPE:
	      return 'Portal';

	    case REACT_PROFILER_TYPE:
	      return 'Profiler';

	    case REACT_STRICT_MODE_TYPE:
	      return 'StrictMode';

	    case REACT_SUSPENSE_TYPE:
	      return 'Suspense';

	    case REACT_SUSPENSE_LIST_TYPE:
	      return 'SuspenseList';

	  }

	  if (typeof type === 'object') {
	    switch (type.$$typeof) {
	      case REACT_CONTEXT_TYPE:
	        var context = type;
	        return getContextName(context) + '.Consumer';

	      case REACT_PROVIDER_TYPE:
	        var provider = type;
	        return getContextName(provider._context) + '.Provider';

	      case REACT_FORWARD_REF_TYPE:
	        return getWrappedName(type, type.render, 'ForwardRef');

	      case REACT_MEMO_TYPE:
	        var outerName = type.displayName || null;

	        if (outerName !== null) {
	          return outerName;
	        }

	        return getComponentNameFromType(type.type) || 'Memo';

	      case REACT_LAZY_TYPE:
	        {
	          var lazyComponent = type;
	          var payload = lazyComponent._payload;
	          var init = lazyComponent._init;

	          try {
	            return getComponentNameFromType(init(payload));
	          } catch (x) {
	            return null;
	          }
	        }

	      // eslint-disable-next-line no-fallthrough
	    }
	  }

	  return null;
	}

	var assign = Object.assign;

	// Helpers to patch console.logs to avoid logging during side-effect free
	// replaying on render function. This currently only patches the object
	// lazily which won't cover if the log function was extracted eagerly.
	// We could also eagerly patch the method.
	var disabledDepth = 0;
	var prevLog;
	var prevInfo;
	var prevWarn;
	var prevError;
	var prevGroup;
	var prevGroupCollapsed;
	var prevGroupEnd;

	function disabledLog() {}

	disabledLog.__reactDisabledLog = true;
	function disableLogs() {
	  {
	    if (disabledDepth === 0) {
	      /* eslint-disable react-internal/no-production-logging */
	      prevLog = console.log;
	      prevInfo = console.info;
	      prevWarn = console.warn;
	      prevError = console.error;
	      prevGroup = console.group;
	      prevGroupCollapsed = console.groupCollapsed;
	      prevGroupEnd = console.groupEnd; // https://github.com/facebook/react/issues/19099

	      var props = {
	        configurable: true,
	        enumerable: true,
	        value: disabledLog,
	        writable: true
	      }; // $FlowFixMe Flow thinks console is immutable.

	      Object.defineProperties(console, {
	        info: props,
	        log: props,
	        warn: props,
	        error: props,
	        group: props,
	        groupCollapsed: props,
	        groupEnd: props
	      });
	      /* eslint-enable react-internal/no-production-logging */
	    }

	    disabledDepth++;
	  }
	}
	function reenableLogs() {
	  {
	    disabledDepth--;

	    if (disabledDepth === 0) {
	      /* eslint-disable react-internal/no-production-logging */
	      var props = {
	        configurable: true,
	        enumerable: true,
	        writable: true
	      }; // $FlowFixMe Flow thinks console is immutable.

	      Object.defineProperties(console, {
	        log: assign({}, props, {
	          value: prevLog
	        }),
	        info: assign({}, props, {
	          value: prevInfo
	        }),
	        warn: assign({}, props, {
	          value: prevWarn
	        }),
	        error: assign({}, props, {
	          value: prevError
	        }),
	        group: assign({}, props, {
	          value: prevGroup
	        }),
	        groupCollapsed: assign({}, props, {
	          value: prevGroupCollapsed
	        }),
	        groupEnd: assign({}, props, {
	          value: prevGroupEnd
	        })
	      });
	      /* eslint-enable react-internal/no-production-logging */
	    }

	    if (disabledDepth < 0) {
	      error('disabledDepth fell below zero. ' + 'This is a bug in React. Please file an issue.');
	    }
	  }
	}

	var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
	var prefix;
	function describeBuiltInComponentFrame(name, source, ownerFn) {
	  {
	    if (prefix === undefined) {
	      // Extract the VM specific prefix used by each line.
	      try {
	        throw Error();
	      } catch (x) {
	        var match = x.stack.trim().match(/\n( *(at )?)/);
	        prefix = match && match[1] || '';
	      }
	    } // We use the prefix to ensure our stacks line up with native stack frames.


	    return '\n' + prefix + name;
	  }
	}
	var reentry = false;
	var componentFrameCache;

	{
	  var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
	  componentFrameCache = new PossiblyWeakMap();
	}

	function describeNativeComponentFrame(fn, construct) {
	  // If something asked for a stack inside a fake render, it should get ignored.
	  if ( !fn || reentry) {
	    return '';
	  }

	  {
	    var frame = componentFrameCache.get(fn);

	    if (frame !== undefined) {
	      return frame;
	    }
	  }

	  var control;
	  reentry = true;
	  var previousPrepareStackTrace = Error.prepareStackTrace; // $FlowFixMe It does accept undefined.

	  Error.prepareStackTrace = undefined;
	  var previousDispatcher;

	  {
	    previousDispatcher = ReactCurrentDispatcher.current; // Set the dispatcher in DEV because this might be call in the render function
	    // for warnings.

	    ReactCurrentDispatcher.current = null;
	    disableLogs();
	  }

	  try {
	    // This should throw.
	    if (construct) {
	      // Something should be setting the props in the constructor.
	      var Fake = function () {
	        throw Error();
	      }; // $FlowFixMe


	      Object.defineProperty(Fake.prototype, 'props', {
	        set: function () {
	          // We use a throwing setter instead of frozen or non-writable props
	          // because that won't throw in a non-strict mode function.
	          throw Error();
	        }
	      });

	      if (typeof Reflect === 'object' && Reflect.construct) {
	        // We construct a different control for this case to include any extra
	        // frames added by the construct call.
	        try {
	          Reflect.construct(Fake, []);
	        } catch (x) {
	          control = x;
	        }

	        Reflect.construct(fn, [], Fake);
	      } else {
	        try {
	          Fake.call();
	        } catch (x) {
	          control = x;
	        }

	        fn.call(Fake.prototype);
	      }
	    } else {
	      try {
	        throw Error();
	      } catch (x) {
	        control = x;
	      }

	      fn();
	    }
	  } catch (sample) {
	    // This is inlined manually because closure doesn't do it for us.
	    if (sample && control && typeof sample.stack === 'string') {
	      // This extracts the first frame from the sample that isn't also in the control.
	      // Skipping one frame that we assume is the frame that calls the two.
	      var sampleLines = sample.stack.split('\n');
	      var controlLines = control.stack.split('\n');
	      var s = sampleLines.length - 1;
	      var c = controlLines.length - 1;

	      while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
	        // We expect at least one stack frame to be shared.
	        // Typically this will be the root most one. However, stack frames may be
	        // cut off due to maximum stack limits. In this case, one maybe cut off
	        // earlier than the other. We assume that the sample is longer or the same
	        // and there for cut off earlier. So we should find the root most frame in
	        // the sample somewhere in the control.
	        c--;
	      }

	      for (; s >= 1 && c >= 0; s--, c--) {
	        // Next we find the first one that isn't the same which should be the
	        // frame that called our sample function and the control.
	        if (sampleLines[s] !== controlLines[c]) {
	          // In V8, the first line is describing the message but other VMs don't.
	          // If we're about to return the first line, and the control is also on the same
	          // line, that's a pretty good indicator that our sample threw at same line as
	          // the control. I.e. before we entered the sample frame. So we ignore this result.
	          // This can happen if you passed a class to function component, or non-function.
	          if (s !== 1 || c !== 1) {
	            do {
	              s--;
	              c--; // We may still have similar intermediate frames from the construct call.
	              // The next one that isn't the same should be our match though.

	              if (c < 0 || sampleLines[s] !== controlLines[c]) {
	                // V8 adds a "new" prefix for native classes. Let's remove it to make it prettier.
	                var _frame = '\n' + sampleLines[s].replace(' at new ', ' at '); // If our component frame is labeled "<anonymous>"
	                // but we have a user-provided "displayName"
	                // splice it in to make the stack more readable.


	                if (fn.displayName && _frame.includes('<anonymous>')) {
	                  _frame = _frame.replace('<anonymous>', fn.displayName);
	                }

	                {
	                  if (typeof fn === 'function') {
	                    componentFrameCache.set(fn, _frame);
	                  }
	                } // Return the line we found.


	                return _frame;
	              }
	            } while (s >= 1 && c >= 0);
	          }

	          break;
	        }
	      }
	    }
	  } finally {
	    reentry = false;

	    {
	      ReactCurrentDispatcher.current = previousDispatcher;
	      reenableLogs();
	    }

	    Error.prepareStackTrace = previousPrepareStackTrace;
	  } // Fallback to just using the name if we couldn't make it throw.


	  var name = fn ? fn.displayName || fn.name : '';
	  var syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';

	  {
	    if (typeof fn === 'function') {
	      componentFrameCache.set(fn, syntheticFrame);
	    }
	  }

	  return syntheticFrame;
	}
	function describeFunctionComponentFrame(fn, source, ownerFn) {
	  {
	    return describeNativeComponentFrame(fn, false);
	  }
	}

	function shouldConstruct(Component) {
	  var prototype = Component.prototype;
	  return !!(prototype && prototype.isReactComponent);
	}

	function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {

	  if (type == null) {
	    return '';
	  }

	  if (typeof type === 'function') {
	    {
	      return describeNativeComponentFrame(type, shouldConstruct(type));
	    }
	  }

	  if (typeof type === 'string') {
	    return describeBuiltInComponentFrame(type);
	  }

	  switch (type) {
	    case REACT_SUSPENSE_TYPE:
	      return describeBuiltInComponentFrame('Suspense');

	    case REACT_SUSPENSE_LIST_TYPE:
	      return describeBuiltInComponentFrame('SuspenseList');
	  }

	  if (typeof type === 'object') {
	    switch (type.$$typeof) {
	      case REACT_FORWARD_REF_TYPE:
	        return describeFunctionComponentFrame(type.render);

	      case REACT_MEMO_TYPE:
	        // Memo may contain any component type so we recursively resolve it.
	        return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);

	      case REACT_LAZY_TYPE:
	        {
	          var lazyComponent = type;
	          var payload = lazyComponent._payload;
	          var init = lazyComponent._init;

	          try {
	            // Lazy may contain any component type so we recursively resolve it.
	            return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
	          } catch (x) {}
	        }
	    }
	  }

	  return '';
	}

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	var loggedTypeFailures = {};
	var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;

	function setCurrentlyValidatingElement(element) {
	  {
	    if (element) {
	      var owner = element._owner;
	      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
	      ReactDebugCurrentFrame.setExtraStackFrame(stack);
	    } else {
	      ReactDebugCurrentFrame.setExtraStackFrame(null);
	    }
	  }
	}

	function checkPropTypes(typeSpecs, values, location, componentName, element) {
	  {
	    // $FlowFixMe This is okay but Flow doesn't know it.
	    var has = Function.call.bind(hasOwnProperty);

	    for (var typeSpecName in typeSpecs) {
	      if (has(typeSpecs, typeSpecName)) {
	        var error$1 = void 0; // Prop type validation may throw. In case they do, we don't want to
	        // fail the render phase where it didn't fail before. So we log it.
	        // After these have been cleaned up, we'll let them throw.

	        try {
	          // This is intentionally an invariant that gets caught. It's the same
	          // behavior as without this statement except with a better message.
	          if (typeof typeSpecs[typeSpecName] !== 'function') {
	            // eslint-disable-next-line react-internal/prod-error-codes
	            var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
	            err.name = 'Invariant Violation';
	            throw err;
	          }

	          error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED');
	        } catch (ex) {
	          error$1 = ex;
	        }

	        if (error$1 && !(error$1 instanceof Error)) {
	          setCurrentlyValidatingElement(element);

	          error('%s: type specification of %s' + ' `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error$1);

	          setCurrentlyValidatingElement(null);
	        }

	        if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
	          // Only monitor this failure once because there tends to be a lot of the
	          // same error.
	          loggedTypeFailures[error$1.message] = true;
	          setCurrentlyValidatingElement(element);

	          error('Failed %s type: %s', location, error$1.message);

	          setCurrentlyValidatingElement(null);
	        }
	      }
	    }
	  }
	}

	var isArrayImpl = Array.isArray; // eslint-disable-next-line no-redeclare

	function isArray(a) {
	  return isArrayImpl(a);
	}

	/*
	 * The `'' + value` pattern (used in in perf-sensitive code) throws for Symbol
	 * and Temporal.* types. See https://github.com/facebook/react/pull/22064.
	 *
	 * The functions in this module will throw an easier-to-understand,
	 * easier-to-debug exception with a clear errors message message explaining the
	 * problem. (Instead of a confusing exception thrown inside the implementation
	 * of the `value` object).
	 */
	// $FlowFixMe only called in DEV, so void return is not possible.
	function typeName(value) {
	  {
	    // toStringTag is needed for namespaced types like Temporal.Instant
	    var hasToStringTag = typeof Symbol === 'function' && Symbol.toStringTag;
	    var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || 'Object';
	    return type;
	  }
	} // $FlowFixMe only called in DEV, so void return is not possible.


	function willCoercionThrow(value) {
	  {
	    try {
	      testStringCoercion(value);
	      return false;
	    } catch (e) {
	      return true;
	    }
	  }
	}

	function testStringCoercion(value) {
	  // If you ended up here by following an exception call stack, here's what's
	  // happened: you supplied an object or symbol value to React (as a prop, key,
	  // DOM attribute, CSS property, string ref, etc.) and when React tried to
	  // coerce it to a string using `'' + value`, an exception was thrown.
	  //
	  // The most common types that will cause this exception are `Symbol` instances
	  // and Temporal objects like `Temporal.Instant`. But any object that has a
	  // `valueOf` or `[Symbol.toPrimitive]` method that throws will also cause this
	  // exception. (Library authors do this to prevent users from using built-in
	  // numeric operators like `+` or comparison operators like `>=` because custom
	  // methods are needed to perform accurate arithmetic or comparison.)
	  //
	  // To fix the problem, coerce this object or symbol value to a string before
	  // passing it to React. The most reliable way is usually `String(value)`.
	  //
	  // To find which value is throwing, check the browser or debugger console.
	  // Before this exception was thrown, there should be `console.error` output
	  // that shows the type (Symbol, Temporal.PlainDate, etc.) that caused the
	  // problem and how that type was used: key, atrribute, input value prop, etc.
	  // In most cases, this console output also shows the component and its
	  // ancestor components where the exception happened.
	  //
	  // eslint-disable-next-line react-internal/safe-string-coercion
	  return '' + value;
	}
	function checkKeyStringCoercion(value) {
	  {
	    if (willCoercionThrow(value)) {
	      error('The provided key is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', typeName(value));

	      return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
	    }
	  }
	}

	var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
	var RESERVED_PROPS = {
	  key: true,
	  ref: true,
	  __self: true,
	  __source: true
	};
	var specialPropKeyWarningShown;
	var specialPropRefWarningShown;

	function hasValidRef(config) {
	  {
	    if (hasOwnProperty.call(config, 'ref')) {
	      var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;

	      if (getter && getter.isReactWarning) {
	        return false;
	      }
	    }
	  }

	  return config.ref !== undefined;
	}

	function hasValidKey(config) {
	  {
	    if (hasOwnProperty.call(config, 'key')) {
	      var getter = Object.getOwnPropertyDescriptor(config, 'key').get;

	      if (getter && getter.isReactWarning) {
	        return false;
	      }
	    }
	  }

	  return config.key !== undefined;
	}

	function warnIfStringRefCannotBeAutoConverted(config, self) {
	  {
	    if (typeof config.ref === 'string' && ReactCurrentOwner.current && self) ;
	  }
	}

	function defineKeyPropWarningGetter(props, displayName) {
	  {
	    var warnAboutAccessingKey = function () {
	      if (!specialPropKeyWarningShown) {
	        specialPropKeyWarningShown = true;

	        error('%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
	      }
	    };

	    warnAboutAccessingKey.isReactWarning = true;
	    Object.defineProperty(props, 'key', {
	      get: warnAboutAccessingKey,
	      configurable: true
	    });
	  }
	}

	function defineRefPropWarningGetter(props, displayName) {
	  {
	    var warnAboutAccessingRef = function () {
	      if (!specialPropRefWarningShown) {
	        specialPropRefWarningShown = true;

	        error('%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
	      }
	    };

	    warnAboutAccessingRef.isReactWarning = true;
	    Object.defineProperty(props, 'ref', {
	      get: warnAboutAccessingRef,
	      configurable: true
	    });
	  }
	}
	/**
	 * Factory method to create a new React element. This no longer adheres to
	 * the class pattern, so do not use new to call it. Also, instanceof check
	 * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
	 * if something is a React Element.
	 *
	 * @param {*} type
	 * @param {*} props
	 * @param {*} key
	 * @param {string|object} ref
	 * @param {*} owner
	 * @param {*} self A *temporary* helper to detect places where `this` is
	 * different from the `owner` when React.createElement is called, so that we
	 * can warn. We want to get rid of owner and replace string `ref`s with arrow
	 * functions, and as long as `this` and owner are the same, there will be no
	 * change in behavior.
	 * @param {*} source An annotation object (added by a transpiler or otherwise)
	 * indicating filename, line number, and/or other information.
	 * @internal
	 */


	var ReactElement = function (type, key, ref, self, source, owner, props) {
	  var element = {
	    // This tag allows us to uniquely identify this as a React Element
	    $$typeof: REACT_ELEMENT_TYPE,
	    // Built-in properties that belong on the element
	    type: type,
	    key: key,
	    ref: ref,
	    props: props,
	    // Record the component responsible for creating this element.
	    _owner: owner
	  };

	  {
	    // The validation flag is currently mutative. We put it on
	    // an external backing store so that we can freeze the whole object.
	    // This can be replaced with a WeakMap once they are implemented in
	    // commonly used development environments.
	    element._store = {}; // To make comparing ReactElements easier for testing purposes, we make
	    // the validation flag non-enumerable (where possible, which should
	    // include every environment we run tests in), so the test framework
	    // ignores it.

	    Object.defineProperty(element._store, 'validated', {
	      configurable: false,
	      enumerable: false,
	      writable: true,
	      value: false
	    }); // self and source are DEV only properties.

	    Object.defineProperty(element, '_self', {
	      configurable: false,
	      enumerable: false,
	      writable: false,
	      value: self
	    }); // Two elements created in two different places should be considered
	    // equal for testing purposes and therefore we hide it from enumeration.

	    Object.defineProperty(element, '_source', {
	      configurable: false,
	      enumerable: false,
	      writable: false,
	      value: source
	    });

	    if (Object.freeze) {
	      Object.freeze(element.props);
	      Object.freeze(element);
	    }
	  }

	  return element;
	};
	/**
	 * https://github.com/reactjs/rfcs/pull/107
	 * @param {*} type
	 * @param {object} props
	 * @param {string} key
	 */

	function jsxDEV(type, config, maybeKey, source, self) {
	  {
	    var propName; // Reserved names are extracted

	    var props = {};
	    var key = null;
	    var ref = null; // Currently, key can be spread in as a prop. This causes a potential
	    // issue if key is also explicitly declared (ie. <div {...props} key="Hi" />
	    // or <div key="Hi" {...props} /> ). We want to deprecate key spread,
	    // but as an intermediary step, we will use jsxDEV for everything except
	    // <div {...props} key="Hi" />, because we aren't currently able to tell if
	    // key is explicitly declared to be undefined or not.

	    if (maybeKey !== undefined) {
	      {
	        checkKeyStringCoercion(maybeKey);
	      }

	      key = '' + maybeKey;
	    }

	    if (hasValidKey(config)) {
	      {
	        checkKeyStringCoercion(config.key);
	      }

	      key = '' + config.key;
	    }

	    if (hasValidRef(config)) {
	      ref = config.ref;
	      warnIfStringRefCannotBeAutoConverted(config, self);
	    } // Remaining properties are added to a new props object


	    for (propName in config) {
	      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
	        props[propName] = config[propName];
	      }
	    } // Resolve default props


	    if (type && type.defaultProps) {
	      var defaultProps = type.defaultProps;

	      for (propName in defaultProps) {
	        if (props[propName] === undefined) {
	          props[propName] = defaultProps[propName];
	        }
	      }
	    }

	    if (key || ref) {
	      var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;

	      if (key) {
	        defineKeyPropWarningGetter(props, displayName);
	      }

	      if (ref) {
	        defineRefPropWarningGetter(props, displayName);
	      }
	    }

	    return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
	  }
	}

	var ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
	var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;

	function setCurrentlyValidatingElement$1(element) {
	  {
	    if (element) {
	      var owner = element._owner;
	      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
	      ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
	    } else {
	      ReactDebugCurrentFrame$1.setExtraStackFrame(null);
	    }
	  }
	}

	var propTypesMisspellWarningShown;

	{
	  propTypesMisspellWarningShown = false;
	}
	/**
	 * Verifies the object is a ReactElement.
	 * See https://reactjs.org/docs/react-api.html#isvalidelement
	 * @param {?object} object
	 * @return {boolean} True if `object` is a ReactElement.
	 * @final
	 */


	function isValidElement(object) {
	  {
	    return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
	  }
	}

	function getDeclarationErrorAddendum() {
	  {
	    if (ReactCurrentOwner$1.current) {
	      var name = getComponentNameFromType(ReactCurrentOwner$1.current.type);

	      if (name) {
	        return '\n\nCheck the render method of `' + name + '`.';
	      }
	    }

	    return '';
	  }
	}

	function getSourceInfoErrorAddendum(source) {
	  {

	    return '';
	  }
	}
	/**
	 * Warn if there's no key explicitly set on dynamic arrays of children or
	 * object keys are not valid. This allows us to keep track of children between
	 * updates.
	 */


	var ownerHasKeyUseWarning = {};

	function getCurrentComponentErrorInfo(parentType) {
	  {
	    var info = getDeclarationErrorAddendum();

	    if (!info) {
	      var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;

	      if (parentName) {
	        info = "\n\nCheck the top-level render call using <" + parentName + ">.";
	      }
	    }

	    return info;
	  }
	}
	/**
	 * Warn if the element doesn't have an explicit key assigned to it.
	 * This element is in an array. The array could grow and shrink or be
	 * reordered. All children that haven't already been validated are required to
	 * have a "key" property assigned to it. Error statuses are cached so a warning
	 * will only be shown once.
	 *
	 * @internal
	 * @param {ReactElement} element Element that requires a key.
	 * @param {*} parentType element's parent's type.
	 */


	function validateExplicitKey(element, parentType) {
	  {
	    if (!element._store || element._store.validated || element.key != null) {
	      return;
	    }

	    element._store.validated = true;
	    var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);

	    if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
	      return;
	    }

	    ownerHasKeyUseWarning[currentComponentErrorInfo] = true; // Usually the current owner is the offender, but if it accepts children as a
	    // property, it may be the creator of the child that's responsible for
	    // assigning it a key.

	    var childOwner = '';

	    if (element && element._owner && element._owner !== ReactCurrentOwner$1.current) {
	      // Give the component that originally created this child.
	      childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
	    }

	    setCurrentlyValidatingElement$1(element);

	    error('Each child in a list should have a unique "key" prop.' + '%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);

	    setCurrentlyValidatingElement$1(null);
	  }
	}
	/**
	 * Ensure that every element either is passed in a static location, in an
	 * array with an explicit keys property defined, or in an object literal
	 * with valid key property.
	 *
	 * @internal
	 * @param {ReactNode} node Statically passed child of any type.
	 * @param {*} parentType node's parent's type.
	 */


	function validateChildKeys(node, parentType) {
	  {
	    if (typeof node !== 'object') {
	      return;
	    }

	    if (isArray(node)) {
	      for (var i = 0; i < node.length; i++) {
	        var child = node[i];

	        if (isValidElement(child)) {
	          validateExplicitKey(child, parentType);
	        }
	      }
	    } else if (isValidElement(node)) {
	      // This element was passed in a valid location.
	      if (node._store) {
	        node._store.validated = true;
	      }
	    } else if (node) {
	      var iteratorFn = getIteratorFn(node);

	      if (typeof iteratorFn === 'function') {
	        // Entry iterators used to provide implicit keys,
	        // but now we print a separate warning for them later.
	        if (iteratorFn !== node.entries) {
	          var iterator = iteratorFn.call(node);
	          var step;

	          while (!(step = iterator.next()).done) {
	            if (isValidElement(step.value)) {
	              validateExplicitKey(step.value, parentType);
	            }
	          }
	        }
	      }
	    }
	  }
	}
	/**
	 * Given an element, validate that its props follow the propTypes definition,
	 * provided by the type.
	 *
	 * @param {ReactElement} element
	 */


	function validatePropTypes(element) {
	  {
	    var type = element.type;

	    if (type === null || type === undefined || typeof type === 'string') {
	      return;
	    }

	    var propTypes;

	    if (typeof type === 'function') {
	      propTypes = type.propTypes;
	    } else if (typeof type === 'object' && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
	    // Inner props are checked in the reconciler.
	    type.$$typeof === REACT_MEMO_TYPE)) {
	      propTypes = type.propTypes;
	    } else {
	      return;
	    }

	    if (propTypes) {
	      // Intentionally inside to avoid triggering lazy initializers:
	      var name = getComponentNameFromType(type);
	      checkPropTypes(propTypes, element.props, 'prop', name, element);
	    } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
	      propTypesMisspellWarningShown = true; // Intentionally inside to avoid triggering lazy initializers:

	      var _name = getComponentNameFromType(type);

	      error('Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', _name || 'Unknown');
	    }

	    if (typeof type.getDefaultProps === 'function' && !type.getDefaultProps.isReactClassApproved) {
	      error('getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.');
	    }
	  }
	}
	/**
	 * Given a fragment, validate that it can only be provided with fragment props
	 * @param {ReactElement} fragment
	 */


	function validateFragmentProps(fragment) {
	  {
	    var keys = Object.keys(fragment.props);

	    for (var i = 0; i < keys.length; i++) {
	      var key = keys[i];

	      if (key !== 'children' && key !== 'key') {
	        setCurrentlyValidatingElement$1(fragment);

	        error('Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.', key);

	        setCurrentlyValidatingElement$1(null);
	        break;
	      }
	    }

	    if (fragment.ref !== null) {
	      setCurrentlyValidatingElement$1(fragment);

	      error('Invalid attribute `ref` supplied to `React.Fragment`.');

	      setCurrentlyValidatingElement$1(null);
	    }
	  }
	}

	var didWarnAboutKeySpread = {};
	function jsxWithValidation(type, props, key, isStaticChildren, source, self) {
	  {
	    var validType = isValidElementType(type); // We warn in this case but don't throw. We expect the element creation to
	    // succeed and there will likely be errors in render.

	    if (!validType) {
	      var info = '';

	      if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
	        info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
	      }

	      var sourceInfo = getSourceInfoErrorAddendum();

	      if (sourceInfo) {
	        info += sourceInfo;
	      } else {
	        info += getDeclarationErrorAddendum();
	      }

	      var typeString;

	      if (type === null) {
	        typeString = 'null';
	      } else if (isArray(type)) {
	        typeString = 'array';
	      } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
	        typeString = "<" + (getComponentNameFromType(type.type) || 'Unknown') + " />";
	        info = ' Did you accidentally export a JSX literal instead of a component?';
	      } else {
	        typeString = typeof type;
	      }

	      error('React.jsx: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
	    }

	    var element = jsxDEV(type, props, key, source, self); // The result can be nullish if a mock or a custom function is used.
	    // TODO: Drop this when these are no longer allowed as the type argument.

	    if (element == null) {
	      return element;
	    } // Skip key warning if the type isn't valid since our key validation logic
	    // doesn't expect a non-string/function type and can throw confusing errors.
	    // We don't want exception behavior to differ between dev and prod.
	    // (Rendering will throw with a helpful message and as soon as the type is
	    // fixed, the key warnings will appear.)


	    if (validType) {
	      var children = props.children;

	      if (children !== undefined) {
	        if (isStaticChildren) {
	          if (isArray(children)) {
	            for (var i = 0; i < children.length; i++) {
	              validateChildKeys(children[i], type);
	            }

	            if (Object.freeze) {
	              Object.freeze(children);
	            }
	          } else {
	            error('React.jsx: Static children should always be an array. ' + 'You are likely explicitly calling React.jsxs or React.jsxDEV. ' + 'Use the Babel transform instead.');
	          }
	        } else {
	          validateChildKeys(children, type);
	        }
	      }
	    }

	    {
	      if (hasOwnProperty.call(props, 'key')) {
	        var componentName = getComponentNameFromType(type);
	        var keys = Object.keys(props).filter(function (k) {
	          return k !== 'key';
	        });
	        var beforeExample = keys.length > 0 ? '{key: someKey, ' + keys.join(': ..., ') + ': ...}' : '{key: someKey}';

	        if (!didWarnAboutKeySpread[componentName + beforeExample]) {
	          var afterExample = keys.length > 0 ? '{' + keys.join(': ..., ') + ': ...}' : '{}';

	          error('A props object containing a "key" prop is being spread into JSX:\n' + '  let props = %s;\n' + '  <%s {...props} />\n' + 'React keys must be passed directly to JSX without using spread:\n' + '  let props = %s;\n' + '  <%s key={someKey} {...props} />', beforeExample, componentName, afterExample, componentName);

	          didWarnAboutKeySpread[componentName + beforeExample] = true;
	        }
	      }
	    }

	    if (type === REACT_FRAGMENT_TYPE) {
	      validateFragmentProps(element);
	    } else {
	      validatePropTypes(element);
	    }

	    return element;
	  }
	} // These two functions exist to still get child warnings in dev
	// even with the prod transform. This means that jsxDEV is purely
	// opt-in behavior for better messages but that we won't stop
	// giving you warnings if you use production apis.

	function jsxWithValidationStatic(type, props, key) {
	  {
	    return jsxWithValidation(type, props, key, true);
	  }
	}
	function jsxWithValidationDynamic(type, props, key) {
	  {
	    return jsxWithValidation(type, props, key, false);
	  }
	}

	var jsx =  jsxWithValidationDynamic ; // we may want to special case jsxs internally to take advantage of static children.
	// for now we can ship identical prod functions

	var jsxs =  jsxWithValidationStatic ;

	reactJsxRuntime_development.Fragment = REACT_FRAGMENT_TYPE;
	reactJsxRuntime_development.jsx = jsx;
	reactJsxRuntime_development.jsxs = jsxs;
	  })();
	}

	{
	  jsxRuntime.exports = reactJsxRuntime_development;
	}

	var jsxRuntimeExports = jsxRuntime.exports;

	Object.defineProperty(restoreBackup, "__esModule", {
	  value: true
	});
	var _default$2 = restoreBackup.default = RestoreBackup;
	const jsx_runtime_1$1 = jsxRuntimeExports;
	const react_1$2 = require$$0__default.default;
	const adminjs_1$1 = require$$2__default.default;
	const design_system_1$2 = require$$1__default.default;
	const api$1 = new adminjs_1$1.ApiClient();
	function RestoreBackup(props) {
	  const {
	    resource
	  } = props;
	  const addNotice = (0, adminjs_1$1.useNotice)();
	  const [backupJson, setBackupJson] = (0, react_1$2.useState)('');
	  const [restoring, setRestoring] = (0, react_1$2.useState)(false);
	  const handleFile = async e => {
	    const file = e.target.files?.[0];
	    if (!file) return;
	    const text = await file.text();
	    setBackupJson(text);
	  };
	  const handleSubmit = async () => {
	    if (!backupJson.trim()) {
	      addNotice({
	        message: 'Выберите файл или вставьте JSON бэкапа',
	        type: 'error'
	      });
	      return;
	    }
	    setRestoring(true);
	    try {
	      const response = await api$1.resourceAction({
	        resourceId: resource.id,
	        actionName: 'restore',
	        method: 'post',
	        data: {
	          backupJson
	        }
	      });
	      const notice = response.data?.notice;
	      if (notice) addNotice(notice);
	    } catch (error) {
	      addNotice({
	        message: error?.message || 'Restore failed',
	        type: 'error'
	      });
	    } finally {
	      setRestoring(false);
	    }
	  };
	  return (0, jsx_runtime_1$1.jsxs)(design_system_1$2.Box, {
	    variant: "grey",
	    children: [(0, jsx_runtime_1$1.jsx)(design_system_1$2.Text, {
	      mb: "md",
	      children: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435: \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u0430\u0439\u043B \u0441 JSON-\u0431\u044D\u043A\u0430\u043F\u043E\u043C \u0438\u043B\u0438 \u0432\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435 \u0432\u0440\u0443\u0447\u043D\u0443\u044E. \u0414\u0430\u043D\u043D\u044B\u0435 \u0431\u0443\u0434\u0443\u0442 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0438\u0441\u0430\u043D\u044B."
	    }), (0, jsx_runtime_1$1.jsxs)("label", {
	      style: {
	        display: 'inline-block',
	        marginBottom: 12
	      },
	      children: [(0, jsx_runtime_1$1.jsx)(design_system_1$2.Button, {
	        as: "span",
	        variant: "primary",
	        size: "sm",
	        children: "\u0412\u044B\u0431\u0440\u0430\u0442\u044C \u0444\u0430\u0439\u043B"
	      }), (0, jsx_runtime_1$1.jsx)("input", {
	        type: "file",
	        accept: "application/json",
	        onChange: handleFile,
	        style: {
	          display: 'none'
	        }
	      })]
	    }), (0, jsx_runtime_1$1.jsx)(design_system_1$2.TextArea, {
	      width: "100%",
	      minHeight: "320px",
	      onChange: e => setBackupJson(e.target.value),
	      value: backupJson,
	      placeholder: '{ "samples": [...], "strains": [...] }'
	    }), (0, jsx_runtime_1$1.jsx)(design_system_1$2.Button, {
	      mt: "lg",
	      variant: "primary",
	      onClick: handleSubmit,
	      disabled: restoring,
	      children: restoring ? 'Восстановление...' : 'Восстановить'
	    })]
	  });
	}

	var backupDatabase = {};

	Object.defineProperty(backupDatabase, "__esModule", {
	  value: true
	});
	var _default$1 = backupDatabase.default = BackupDatabase;
	const jsx_runtime_1 = jsxRuntimeExports;
	const react_1$1 = require$$0__default.default;
	const adminjs_1 = require$$2__default.default;
	const design_system_1$1 = require$$1__default.default;
	const api = new adminjs_1.ApiClient();
	function BackupDatabase(props) {
	  const {
	    resource
	  } = props;
	  const addNotice = (0, adminjs_1.useNotice)();
	  const [backupJson, setBackupJson] = (0, react_1$1.useState)('');
	  const [creating, setCreating] = (0, react_1$1.useState)(false);
	  const handleCreate = async () => {
	    setCreating(true);
	    try {
	      const response = await api.resourceAction({
	        resourceId: resource.id,
	        actionName: 'backup',
	        method: 'post'
	      });
	      const notice = response.data?.notice;
	      if (notice) addNotice(notice);
	      const json = response.data?.backup;
	      if (json) {
	        setBackupJson(json);
	      }
	    } catch (error) {
	      addNotice({
	        message: error?.message || 'Не удалось создать бэкап',
	        type: 'error'
	      });
	    } finally {
	      setCreating(false);
	    }
	  };
	  const handleDownload = () => {
	    if (!backupJson) return;
	    const blob = new Blob([backupJson], {
	      type: 'application/json'
	    });
	    const url = URL.createObjectURL(blob);
	    const a = document.createElement('a');
	    a.href = url;
	    a.download = `backup-${new Date().toISOString().replace(/[:]/g, '-')}.json`;
	    a.click();
	    URL.revokeObjectURL(url);
	  };
	  const handleCopy = async () => {
	    if (!backupJson) return;
	    try {
	      await navigator.clipboard.writeText(backupJson);
	      addNotice({
	        message: 'Бэкап скопирован в буфер обмена',
	        type: 'success'
	      });
	    } catch {
	      addNotice({
	        message: 'Не удалось скопировать',
	        type: 'error'
	      });
	    }
	  };
	  return (0, jsx_runtime_1.jsxs)(design_system_1$1.Box, {
	    variant: "grey",
	    children: [(0, jsx_runtime_1.jsx)(design_system_1$1.Text, {
	      mb: "md",
	      children: "\u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u0431\u044D\u043A\u0430\u043F \u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u0435 \u0435\u0433\u043E \u043A\u0430\u043A JSON (\u0441\u043A\u0430\u0447\u0430\u0439\u0442\u0435 \u0444\u0430\u0439\u043B \u0438\u043B\u0438 \u0441\u043A\u043E\u043F\u0438\u0440\u0443\u0439\u0442\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435)."
	    }), (0, jsx_runtime_1.jsx)(design_system_1$1.Button, {
	      variant: "primary",
	      size: "sm",
	      onClick: handleCreate,
	      disabled: creating,
	      mr: "md",
	      children: creating ? 'Создаём…' : 'Создать бэкап'
	    }), (0, jsx_runtime_1.jsx)(design_system_1$1.Button, {
	      variant: "secondary",
	      size: "sm",
	      onClick: handleDownload,
	      disabled: !backupJson,
	      mr: "sm",
	      children: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C JSON"
	    }), (0, jsx_runtime_1.jsx)(design_system_1$1.Button, {
	      variant: "secondary",
	      size: "sm",
	      onClick: handleCopy,
	      disabled: !backupJson,
	      children: "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C"
	    }), (0, jsx_runtime_1.jsx)(design_system_1$1.TextArea, {
	      mt: "lg",
	      width: "100%",
	      minHeight: "320px",
	      onChange: e => setBackupJson(e.target.value),
	      value: backupJson,
	      placeholder: "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0431\u044D\u043A\u0430\u043F\u0430 \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C",
	      readOnly: true
	    })]
	  });
	}

	var permissionsGrid = {};

	var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function (mod) {
	  return mod && mod.__esModule ? mod : {
	    "default": mod
	  };
	};
	Object.defineProperty(permissionsGrid, "__esModule", {
	  value: true
	});
	const react_1 = __importDefault(require$$0__default.default);
	const design_system_1 = require$$1__default.default;
	const SUBJECTS = ['Strain', 'Sample', 'Storage', 'Media', 'Method', 'TraitDefinition', 'Settings', 'Legend', 'Wiki', 'Analytics', 'User', 'Group', 'AuditLog', 'Photo', 'all'];
	const ACTIONS = ['read', 'create', 'update', 'delete', 'manage'];
	const ensureArray = value => Array.isArray(value) ? value.filter(v => typeof v === 'string') : [];
	const PermissionsGrid = props => {
	  const {
	    onChange,
	    property,
	    record
	  } = props;
	  const value = react_1.default.useMemo(() => {
	    const params = record?.params ?? {};
	    if (params[property.path] && typeof params[property.path] === 'object') {
	      return params[property.path];
	    }
	    const result = {};
	    Object.keys(params).forEach(key => {
	      if (key.startsWith(`${property.path}.`)) {
	        const parts = key.slice(property.path.length + 1).split('.');
	        const subject = parts[0];
	        if (SUBJECTS.includes(subject)) {
	          if (!result[subject]) {
	            result[subject] = [];
	          }
	          const paramValue = params[key];
	          if (typeof paramValue === 'string') {
	            result[subject]?.push(paramValue);
	          }
	        }
	      }
	    });
	    return result;
	  }, [record, property.path]);
	  const toggle = (subject, action) => {
	    if (!onChange) return;
	    const current = new Set(ensureArray(value[subject]));
	    if (current.has(action)) {
	      current.delete(action);
	    } else {
	      current.add(action);
	    }
	    const next = {
	      ...value,
	      [subject]: Array.from(current)
	    };
	    onChange(property.path, next);
	  };
	  return react_1.default.createElement(design_system_1.Box, {
	    variant: 'grey'
	  }, [react_1.default.createElement(design_system_1.Text, {
	    key: 'title',
	    mb: 'sm',
	    fontWeight: 'bold'
	  }, 'Permissions Matrix'), react_1.default.createElement(design_system_1.Box, {
	    key: 'grid',
	    display: 'grid',
	    gridTemplateColumns: '160px repeat(5, 1fr)',
	    gridRowGap: 'md',
	    gridColumnGap: 'md'
	  }, [react_1.default.createElement(design_system_1.Box, {
	    key: 'empty'
	  }), ...ACTIONS.map(action => react_1.default.createElement(design_system_1.Label, {
	    key: action,
	    style: {
	      textAlign: 'center'
	    }
	  }, action)), ...SUBJECTS.flatMap(subject => [react_1.default.createElement(design_system_1.Box, {
	    key: `${subject}-label`,
	    display: 'flex',
	    alignItems: 'center',
	    gap: 'xs'
	  }, react_1.default.createElement(design_system_1.Badge, {
	    variant: 'info'
	  }, subject)), ...ACTIONS.map(action => {
	    const checked = ensureArray(value[subject]).includes(action);
	    return react_1.default.createElement(design_system_1.Box, {
	      key: `${subject}-${action}`,
	      display: 'flex',
	      justifyContent: 'center'
	    }, react_1.default.createElement(design_system_1.CheckBox, {
	      id: `${subject}-${action}`,
	      checked,
	      onChange: () => toggle(subject, action)
	    }));
	  })])]), react_1.default.createElement(design_system_1.Text, {
	    key: 'hint',
	    mt: 'md',
	    fontSize: 12,
	    color: 'grey60'
	  }, 'Tip: checking all + manage grants full access for a subject. Use the checkboxes to toggle allowed actions.')]);
	};
	var _default = permissionsGrid.default = PermissionsGrid;

	AdminJS.UserComponents = {};
	AdminJS.UserComponents.Dashboard = _default$4;
	AdminJS.UserComponents.JsonShow = _default$3;
	AdminJS.UserComponents.RestoreBackup = _default$2;
	AdminJS.UserComponents.BackupDatabase = _default$1;
	AdminJS.UserComponents.PermissionsGrid = _default;

})(React, AdminJSDesignSystem, AdminJS);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9kaXN0L3NyYy9hZG1pbi9jb21wb25lbnRzL2Rhc2hib2FyZC5qcyIsIi4uL2Rpc3Qvc3JjL2FkbWluL2NvbXBvbmVudHMvanNvbi1zaG93LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3JlYWN0L2Nqcy9yZWFjdC1qc3gtcnVudGltZS5kZXZlbG9wbWVudC5qcyIsIi4uL25vZGVfbW9kdWxlcy9yZWFjdC9qc3gtcnVudGltZS5qcyIsIi4uL2Rpc3Qvc3JjL2FkbWluL2NvbXBvbmVudHMvcmVzdG9yZS1iYWNrdXAuanMiLCIuLi9kaXN0L3NyYy9hZG1pbi9jb21wb25lbnRzL2JhY2t1cC1kYXRhYmFzZS5qcyIsIi4uL2Rpc3Qvc3JjL2FkbWluL2NvbXBvbmVudHMvcGVybWlzc2lvbnMtZ3JpZC5qcyIsImVudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgcmVhY3RfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwicmVhY3RcIikpO1xuY29uc3QgZGVzaWduX3N5c3RlbV8xID0gcmVxdWlyZShcIkBhZG1pbmpzL2Rlc2lnbi1zeXN0ZW1cIik7XG5jb25zdCBEYXNoYm9hcmQgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KGRlc2lnbl9zeXN0ZW1fMS5Cb3gsIHsgdmFyaWFudDogJ2dyZXknLCBwOiAneGwnIH0sIFtcbiAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoZGVzaWduX3N5c3RlbV8xLkgyLCB7IGtleTogJ2hlYWRlcicsIG1iOiAnbGcnIH0sICdTdHJhaW4gQ29sbGVjdGlvbiBBZG1pbicpLFxuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChkZXNpZ25fc3lzdGVtXzEuVGV4dCwgeyBrZXk6ICd0ZXh0JywgbWI6ICd4bCcgfSwgJ9CU0L7QsdGA0L4g0L/QvtC20LDQu9C+0LLQsNGC0Ywg0LIg0L/QsNC90LXQu9GMINGD0L/RgNCw0LLQu9C10L3QuNGPIFN0cmFpbiBDb2xsZWN0aW9uLiDQmNGB0L/QvtC70YzQt9GD0LnRgtC1INC80LXQvdGOINGB0LvQtdCy0LAg0LTQu9GPINC90LDQstC40LPQsNGG0LjQuCDQv9C+INGA0LXRgdGD0YDRgdCw0LwuJyksXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KGRlc2lnbl9zeXN0ZW1fMS5Cb3gsIHsga2V5OiAnc3RhdHMnLCBkaXNwbGF5OiAnZmxleCcsIGdhcDogJ2xnJyB9LCBbXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChkZXNpZ25fc3lzdGVtXzEuQm94LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnc3RyYWlucycsXG4gICAgICAgICAgICAgICAgcDogJ2xnJyxcbiAgICAgICAgICAgICAgICBiZzogJ3doaXRlJyxcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdjYXJkJyxcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICdzbScsXG4gICAgICAgICAgICAgICAgZmxleDogMSxcbiAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChkZXNpZ25fc3lzdGVtXzEuVGV4dCwgeyBrZXk6ICdzdHJhaW5zLWxhYmVsJywgZm9udFdlaWdodDogJ2JvbGQnIH0sICdTdHJhaW5zJyksXG4gICAgICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoZGVzaWduX3N5c3RlbV8xLlRleHQsIHsga2V5OiAnc3RyYWlucy1kZXNjJywgZm9udFNpemU6ICdzbScsIG10OiAnc20nIH0sICfQo9C/0YDQsNCy0LvQtdC90LjQtSDRiNGC0LDQvNC80LDQvNC4INC80LjQutGA0L7QvtGA0LPQsNC90LjQt9C80L7QsicpLFxuICAgICAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KGRlc2lnbl9zeXN0ZW1fMS5CdXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnc3RyYWlucy1idG4nLFxuICAgICAgICAgICAgICAgICAgICBtdDogJ21kJyxcbiAgICAgICAgICAgICAgICAgICAgYXM6ICdhJyxcbiAgICAgICAgICAgICAgICAgICAgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvU3RyYWluJyxcbiAgICAgICAgICAgICAgICB9LCAn0J/QtdGA0LXQudGC0LgnKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoZGVzaWduX3N5c3RlbV8xLkJveCwge1xuICAgICAgICAgICAgICAgIGtleTogJ3NhbXBsZXMnLFxuICAgICAgICAgICAgICAgIHA6ICdsZycsXG4gICAgICAgICAgICAgICAgYmc6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnY2FyZCcsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnc20nLFxuICAgICAgICAgICAgICAgIGZsZXg6IDEsXG4gICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoZGVzaWduX3N5c3RlbV8xLlRleHQsIHsga2V5OiAnc2FtcGxlcy1sYWJlbCcsIGZvbnRXZWlnaHQ6ICdib2xkJyB9LCAnU2FtcGxlcycpLFxuICAgICAgICAgICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KGRlc2lnbl9zeXN0ZW1fMS5UZXh0LCB7IGtleTogJ3NhbXBsZXMtZGVzYycsIGZvbnRTaXplOiAnc20nLCBtdDogJ3NtJyB9LCAn0KPQv9GA0LDQstC70LXQvdC40LUg0L7QsdGA0LDQt9GG0LDQvNC4INC4INGB0LHQvtGA0LDQvNC4JyksXG4gICAgICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoZGVzaWduX3N5c3RlbV8xLkJ1dHRvbiwge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICdzYW1wbGVzLWJ0bicsXG4gICAgICAgICAgICAgICAgICAgIG10OiAnbWQnLFxuICAgICAgICAgICAgICAgICAgICBhczogJ2EnLFxuICAgICAgICAgICAgICAgICAgICBocmVmOiAnL2FkbWluL3Jlc291cmNlcy9TYW1wbGUnLFxuICAgICAgICAgICAgICAgIH0sICfQn9C10YDQtdC50YLQuCcpLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChkZXNpZ25fc3lzdGVtXzEuQm94LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnc3RvcmFnZScsXG4gICAgICAgICAgICAgICAgcDogJ2xnJyxcbiAgICAgICAgICAgICAgICBiZzogJ3doaXRlJyxcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdjYXJkJyxcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICdzbScsXG4gICAgICAgICAgICAgICAgZmxleDogMSxcbiAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChkZXNpZ25fc3lzdGVtXzEuVGV4dCwgeyBrZXk6ICdzdG9yYWdlLWxhYmVsJywgZm9udFdlaWdodDogJ2JvbGQnIH0sICdTdG9yYWdlJyksXG4gICAgICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoZGVzaWduX3N5c3RlbV8xLlRleHQsIHsga2V5OiAnc3RvcmFnZS1kZXNjJywgZm9udFNpemU6ICdzbScsIG10OiAnc20nIH0sICfQo9C/0YDQsNCy0LvQtdC90LjQtSDRhdGA0LDQvdC40LvQuNGJ0LXQvCDQuCDRj9GH0LXQudC60LDQvNC4JyksXG4gICAgICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoZGVzaWduX3N5c3RlbV8xLkJ1dHRvbiwge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICdzdG9yYWdlLWJ0bicsXG4gICAgICAgICAgICAgICAgICAgIG10OiAnbWQnLFxuICAgICAgICAgICAgICAgICAgICBhczogJ2EnLFxuICAgICAgICAgICAgICAgICAgICBocmVmOiAnL2FkbWluL3Jlc291cmNlcy9TdG9yYWdlQm94JyxcbiAgICAgICAgICAgICAgICB9LCAn0J/QtdGA0LXQudGC0LgnKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICBdKSxcbiAgICBdKTtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBEYXNoYm9hcmQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXNoYm9hcmQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCByZWFjdF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5jb25zdCBkZXNpZ25fc3lzdGVtXzEgPSByZXF1aXJlKFwiQGFkbWluanMvZGVzaWduLXN5c3RlbVwiKTtcbmNvbnN0IEpzb25TaG93ID0gKHByb3BzKSA9PiB7XG4gICAgY29uc3QgeyByZWNvcmQsIHByb3BlcnR5IH0gPSBwcm9wcztcbiAgICBsZXQgdmFsdWUgPSByZWNvcmQ/LnBhcmFtcz8uW3Byb3BlcnR5LnBhdGhdO1xuICAgIGlmICghdmFsdWUgJiYgcmVjb3JkPy5wYXJhbXMpIHtcbiAgICAgICAgY29uc3QgcHJlZml4ID0gYCR7cHJvcGVydHkucGF0aH0uYDtcbiAgICAgICAgY29uc3Qgb2JqID0ge307XG4gICAgICAgIGxldCBoYXNLZXlzID0gZmFsc2U7XG4gICAgICAgIE9iamVjdC5rZXlzKHJlY29yZC5wYXJhbXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKGtleS5zdGFydHNXaXRoKHByZWZpeCkpIHtcbiAgICAgICAgICAgICAgICBvYmpba2V5LnNsaWNlKHByZWZpeC5sZW5ndGgpXSA9IHJlY29yZC5wYXJhbXNba2V5XTtcbiAgICAgICAgICAgICAgICBoYXNLZXlzID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChoYXNLZXlzKVxuICAgICAgICAgICAgdmFsdWUgPSBvYmo7XG4gICAgfVxuICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgbnVsbCwgJy0nKTtcbiAgICB9XG4gICAgbGV0IGRpc3BsYXlWYWx1ZSA9IHZhbHVlO1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBkaXNwbGF5VmFsdWUgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSwgbnVsbCwgMik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgaWYgKHZhbHVlLnRyaW0oKS5zdGFydHNXaXRoKCd7JykgfHwgdmFsdWUudHJpbSgpLnN0YXJ0c1dpdGgoJ1snKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICAgICAgICAgIGRpc3BsYXlWYWx1ZSA9IEpTT04uc3RyaW5naWZ5KHBhcnNlZCwgbnVsbCwgMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2F0Y2gge1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50ID0gdHlwZW9mIGRpc3BsYXlWYWx1ZSA9PT0gJ3N0cmluZydcbiAgICAgICAgPyBkaXNwbGF5VmFsdWVcbiAgICAgICAgOiBKU09OLnN0cmluZ2lmeShkaXNwbGF5VmFsdWUsIG51bGwsIDIpO1xuICAgIHJldHVybiByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChkZXNpZ25fc3lzdGVtXzEuQm94LCB7IG1iOiAneGwnIH0sIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdwcmUnLCB7XG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICB3aGl0ZVNwYWNlOiAncHJlLXdyYXAnLFxuICAgICAgICAgICAgZm9udFNpemU6ICcxMnB4JyxcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6ICdtb25vc3BhY2UnLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2Y0ZjZmOCcsXG4gICAgICAgICAgICBwYWRkaW5nOiAnMTBweCcsXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc0cHgnLFxuICAgICAgICB9LFxuICAgIH0sIGNvbnRlbnQpKTtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBKc29uU2hvdztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWpzb24tc2hvdy5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlIFJlYWN0XG4gKiByZWFjdC1qc3gtcnVudGltZS5kZXZlbG9wbWVudC5qc1xuICpcbiAqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIikge1xuICAoZnVuY3Rpb24oKSB7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbi8vIEFUVEVOVElPTlxuLy8gV2hlbiBhZGRpbmcgbmV3IHN5bWJvbHMgdG8gdGhpcyBmaWxlLFxuLy8gUGxlYXNlIGNvbnNpZGVyIGFsc28gYWRkaW5nIHRvICdyZWFjdC1kZXZ0b29scy1zaGFyZWQvc3JjL2JhY2tlbmQvUmVhY3RTeW1ib2xzJ1xuLy8gVGhlIFN5bWJvbCB1c2VkIHRvIHRhZyB0aGUgUmVhY3RFbGVtZW50LWxpa2UgdHlwZXMuXG52YXIgUkVBQ1RfRUxFTUVOVF9UWVBFID0gU3ltYm9sLmZvcigncmVhY3QuZWxlbWVudCcpO1xudmFyIFJFQUNUX1BPUlRBTF9UWVBFID0gU3ltYm9sLmZvcigncmVhY3QucG9ydGFsJyk7XG52YXIgUkVBQ1RfRlJBR01FTlRfVFlQRSA9IFN5bWJvbC5mb3IoJ3JlYWN0LmZyYWdtZW50Jyk7XG52YXIgUkVBQ1RfU1RSSUNUX01PREVfVFlQRSA9IFN5bWJvbC5mb3IoJ3JlYWN0LnN0cmljdF9tb2RlJyk7XG52YXIgUkVBQ1RfUFJPRklMRVJfVFlQRSA9IFN5bWJvbC5mb3IoJ3JlYWN0LnByb2ZpbGVyJyk7XG52YXIgUkVBQ1RfUFJPVklERVJfVFlQRSA9IFN5bWJvbC5mb3IoJ3JlYWN0LnByb3ZpZGVyJyk7XG52YXIgUkVBQ1RfQ09OVEVYVF9UWVBFID0gU3ltYm9sLmZvcigncmVhY3QuY29udGV4dCcpO1xudmFyIFJFQUNUX0ZPUldBUkRfUkVGX1RZUEUgPSBTeW1ib2wuZm9yKCdyZWFjdC5mb3J3YXJkX3JlZicpO1xudmFyIFJFQUNUX1NVU1BFTlNFX1RZUEUgPSBTeW1ib2wuZm9yKCdyZWFjdC5zdXNwZW5zZScpO1xudmFyIFJFQUNUX1NVU1BFTlNFX0xJU1RfVFlQRSA9IFN5bWJvbC5mb3IoJ3JlYWN0LnN1c3BlbnNlX2xpc3QnKTtcbnZhciBSRUFDVF9NRU1PX1RZUEUgPSBTeW1ib2wuZm9yKCdyZWFjdC5tZW1vJyk7XG52YXIgUkVBQ1RfTEFaWV9UWVBFID0gU3ltYm9sLmZvcigncmVhY3QubGF6eScpO1xudmFyIFJFQUNUX09GRlNDUkVFTl9UWVBFID0gU3ltYm9sLmZvcigncmVhY3Qub2Zmc2NyZWVuJyk7XG52YXIgTUFZQkVfSVRFUkFUT1JfU1lNQk9MID0gU3ltYm9sLml0ZXJhdG9yO1xudmFyIEZBVVhfSVRFUkFUT1JfU1lNQk9MID0gJ0BAaXRlcmF0b3InO1xuZnVuY3Rpb24gZ2V0SXRlcmF0b3JGbihtYXliZUl0ZXJhYmxlKSB7XG4gIGlmIChtYXliZUl0ZXJhYmxlID09PSBudWxsIHx8IHR5cGVvZiBtYXliZUl0ZXJhYmxlICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIG1heWJlSXRlcmF0b3IgPSBNQVlCRV9JVEVSQVRPUl9TWU1CT0wgJiYgbWF5YmVJdGVyYWJsZVtNQVlCRV9JVEVSQVRPUl9TWU1CT0xdIHx8IG1heWJlSXRlcmFibGVbRkFVWF9JVEVSQVRPUl9TWU1CT0xdO1xuXG4gIGlmICh0eXBlb2YgbWF5YmVJdGVyYXRvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBtYXliZUl0ZXJhdG9yO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbnZhciBSZWFjdFNoYXJlZEludGVybmFscyA9IFJlYWN0Ll9fU0VDUkVUX0lOVEVSTkFMU19ET19OT1RfVVNFX09SX1lPVV9XSUxMX0JFX0ZJUkVEO1xuXG5mdW5jdGlvbiBlcnJvcihmb3JtYXQpIHtcbiAge1xuICAgIHtcbiAgICAgIGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuMiA+IDEgPyBfbGVuMiAtIDEgOiAwKSwgX2tleTIgPSAxOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG4gICAgICAgIGFyZ3NbX2tleTIgLSAxXSA9IGFyZ3VtZW50c1tfa2V5Ml07XG4gICAgICB9XG5cbiAgICAgIHByaW50V2FybmluZygnZXJyb3InLCBmb3JtYXQsIGFyZ3MpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBwcmludFdhcm5pbmcobGV2ZWwsIGZvcm1hdCwgYXJncykge1xuICAvLyBXaGVuIGNoYW5naW5nIHRoaXMgbG9naWMsIHlvdSBtaWdodCB3YW50IHRvIGFsc29cbiAgLy8gdXBkYXRlIGNvbnNvbGVXaXRoU3RhY2tEZXYud3d3LmpzIGFzIHdlbGwuXG4gIHtcbiAgICB2YXIgUmVhY3REZWJ1Z0N1cnJlbnRGcmFtZSA9IFJlYWN0U2hhcmVkSW50ZXJuYWxzLlJlYWN0RGVidWdDdXJyZW50RnJhbWU7XG4gICAgdmFyIHN0YWNrID0gUmVhY3REZWJ1Z0N1cnJlbnRGcmFtZS5nZXRTdGFja0FkZGVuZHVtKCk7XG5cbiAgICBpZiAoc3RhY2sgIT09ICcnKSB7XG4gICAgICBmb3JtYXQgKz0gJyVzJztcbiAgICAgIGFyZ3MgPSBhcmdzLmNvbmNhdChbc3RhY2tdKTtcbiAgICB9IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1pbnRlcm5hbC9zYWZlLXN0cmluZy1jb2VyY2lvblxuXG5cbiAgICB2YXIgYXJnc1dpdGhGb3JtYXQgPSBhcmdzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIFN0cmluZyhpdGVtKTtcbiAgICB9KTsgLy8gQ2FyZWZ1bDogUk4gY3VycmVudGx5IGRlcGVuZHMgb24gdGhpcyBwcmVmaXhcblxuICAgIGFyZ3NXaXRoRm9ybWF0LnVuc2hpZnQoJ1dhcm5pbmc6ICcgKyBmb3JtYXQpOyAvLyBXZSBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBzcHJlYWQgKG9yIC5hcHBseSkgZGlyZWN0bHkgYmVjYXVzZSBpdFxuICAgIC8vIGJyZWFrcyBJRTk6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC9pc3N1ZXMvMTM2MTBcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaW50ZXJuYWwvbm8tcHJvZHVjdGlvbi1sb2dnaW5nXG5cbiAgICBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlW2xldmVsXSwgY29uc29sZSwgYXJnc1dpdGhGb3JtYXQpO1xuICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBlbmFibGVTY29wZUFQSSA9IGZhbHNlOyAvLyBFeHBlcmltZW50YWwgQ3JlYXRlIEV2ZW50IEhhbmRsZSBBUEkuXG52YXIgZW5hYmxlQ2FjaGVFbGVtZW50ID0gZmFsc2U7XG52YXIgZW5hYmxlVHJhbnNpdGlvblRyYWNpbmcgPSBmYWxzZTsgLy8gTm8ga25vd24gYnVncywgYnV0IG5lZWRzIHBlcmZvcm1hbmNlIHRlc3RpbmdcblxudmFyIGVuYWJsZUxlZ2FjeUhpZGRlbiA9IGZhbHNlOyAvLyBFbmFibGVzIHVuc3RhYmxlX2F2b2lkVGhpc0ZhbGxiYWNrIGZlYXR1cmUgaW4gRmliZXJcbi8vIHN0dWZmLiBJbnRlbmRlZCB0byBlbmFibGUgUmVhY3QgY29yZSBtZW1iZXJzIHRvIG1vcmUgZWFzaWx5IGRlYnVnIHNjaGVkdWxpbmdcbi8vIGlzc3VlcyBpbiBERVYgYnVpbGRzLlxuXG52YXIgZW5hYmxlRGVidWdUcmFjaW5nID0gZmFsc2U7IC8vIFRyYWNrIHdoaWNoIEZpYmVyKHMpIHNjaGVkdWxlIHJlbmRlciB3b3JrLlxuXG52YXIgUkVBQ1RfTU9EVUxFX1JFRkVSRU5DRTtcblxue1xuICBSRUFDVF9NT0RVTEVfUkVGRVJFTkNFID0gU3ltYm9sLmZvcigncmVhY3QubW9kdWxlLnJlZmVyZW5jZScpO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkRWxlbWVudFR5cGUodHlwZSkge1xuICBpZiAodHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gLy8gTm90ZTogdHlwZW9mIG1pZ2h0IGJlIG90aGVyIHRoYW4gJ3N5bWJvbCcgb3IgJ251bWJlcicgKGUuZy4gaWYgaXQncyBhIHBvbHlmaWxsKS5cblxuXG4gIGlmICh0eXBlID09PSBSRUFDVF9GUkFHTUVOVF9UWVBFIHx8IHR5cGUgPT09IFJFQUNUX1BST0ZJTEVSX1RZUEUgfHwgZW5hYmxlRGVidWdUcmFjaW5nICB8fCB0eXBlID09PSBSRUFDVF9TVFJJQ1RfTU9ERV9UWVBFIHx8IHR5cGUgPT09IFJFQUNUX1NVU1BFTlNFX1RZUEUgfHwgdHlwZSA9PT0gUkVBQ1RfU1VTUEVOU0VfTElTVF9UWVBFIHx8IGVuYWJsZUxlZ2FjeUhpZGRlbiAgfHwgdHlwZSA9PT0gUkVBQ1RfT0ZGU0NSRUVOX1RZUEUgfHwgZW5hYmxlU2NvcGVBUEkgIHx8IGVuYWJsZUNhY2hlRWxlbWVudCAgfHwgZW5hYmxlVHJhbnNpdGlvblRyYWNpbmcgKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAodHlwZW9mIHR5cGUgPT09ICdvYmplY3QnICYmIHR5cGUgIT09IG51bGwpIHtcbiAgICBpZiAodHlwZS4kJHR5cGVvZiA9PT0gUkVBQ1RfTEFaWV9UWVBFIHx8IHR5cGUuJCR0eXBlb2YgPT09IFJFQUNUX01FTU9fVFlQRSB8fCB0eXBlLiQkdHlwZW9mID09PSBSRUFDVF9QUk9WSURFUl9UWVBFIHx8IHR5cGUuJCR0eXBlb2YgPT09IFJFQUNUX0NPTlRFWFRfVFlQRSB8fCB0eXBlLiQkdHlwZW9mID09PSBSRUFDVF9GT1JXQVJEX1JFRl9UWVBFIHx8IC8vIFRoaXMgbmVlZHMgdG8gaW5jbHVkZSBhbGwgcG9zc2libGUgbW9kdWxlIHJlZmVyZW5jZSBvYmplY3RcbiAgICAvLyB0eXBlcyBzdXBwb3J0ZWQgYnkgYW55IEZsaWdodCBjb25maWd1cmF0aW9uIGFueXdoZXJlIHNpbmNlXG4gICAgLy8gd2UgZG9uJ3Qga25vdyB3aGljaCBGbGlnaHQgYnVpbGQgdGhpcyB3aWxsIGVuZCB1cCBiZWluZyB1c2VkXG4gICAgLy8gd2l0aC5cbiAgICB0eXBlLiQkdHlwZW9mID09PSBSRUFDVF9NT0RVTEVfUkVGRVJFTkNFIHx8IHR5cGUuZ2V0TW9kdWxlSWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBnZXRXcmFwcGVkTmFtZShvdXRlclR5cGUsIGlubmVyVHlwZSwgd3JhcHBlck5hbWUpIHtcbiAgdmFyIGRpc3BsYXlOYW1lID0gb3V0ZXJUeXBlLmRpc3BsYXlOYW1lO1xuXG4gIGlmIChkaXNwbGF5TmFtZSkge1xuICAgIHJldHVybiBkaXNwbGF5TmFtZTtcbiAgfVxuXG4gIHZhciBmdW5jdGlvbk5hbWUgPSBpbm5lclR5cGUuZGlzcGxheU5hbWUgfHwgaW5uZXJUeXBlLm5hbWUgfHwgJyc7XG4gIHJldHVybiBmdW5jdGlvbk5hbWUgIT09ICcnID8gd3JhcHBlck5hbWUgKyBcIihcIiArIGZ1bmN0aW9uTmFtZSArIFwiKVwiIDogd3JhcHBlck5hbWU7XG59IC8vIEtlZXAgaW4gc3luYyB3aXRoIHJlYWN0LXJlY29uY2lsZXIvZ2V0Q29tcG9uZW50TmFtZUZyb21GaWJlclxuXG5cbmZ1bmN0aW9uIGdldENvbnRleHROYW1lKHR5cGUpIHtcbiAgcmV0dXJuIHR5cGUuZGlzcGxheU5hbWUgfHwgJ0NvbnRleHQnO1xufSAvLyBOb3RlIHRoYXQgdGhlIHJlY29uY2lsZXIgcGFja2FnZSBzaG91bGQgZ2VuZXJhbGx5IHByZWZlciB0byB1c2UgZ2V0Q29tcG9uZW50TmFtZUZyb21GaWJlcigpIGluc3RlYWQuXG5cblxuZnVuY3Rpb24gZ2V0Q29tcG9uZW50TmFtZUZyb21UeXBlKHR5cGUpIHtcbiAgaWYgKHR5cGUgPT0gbnVsbCkge1xuICAgIC8vIEhvc3Qgcm9vdCwgdGV4dCBub2RlIG9yIGp1c3QgaW52YWxpZCB0eXBlLlxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAge1xuICAgIGlmICh0eXBlb2YgdHlwZS50YWcgPT09ICdudW1iZXInKSB7XG4gICAgICBlcnJvcignUmVjZWl2ZWQgYW4gdW5leHBlY3RlZCBvYmplY3QgaW4gZ2V0Q29tcG9uZW50TmFtZUZyb21UeXBlKCkuICcgKyAnVGhpcyBpcyBsaWtlbHkgYSBidWcgaW4gUmVhY3QuIFBsZWFzZSBmaWxlIGFuIGlzc3VlLicpO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiB0eXBlLmRpc3BsYXlOYW1lIHx8IHR5cGUubmFtZSB8fCBudWxsO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB0eXBlO1xuICB9XG5cbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSBSRUFDVF9GUkFHTUVOVF9UWVBFOlxuICAgICAgcmV0dXJuICdGcmFnbWVudCc7XG5cbiAgICBjYXNlIFJFQUNUX1BPUlRBTF9UWVBFOlxuICAgICAgcmV0dXJuICdQb3J0YWwnO1xuXG4gICAgY2FzZSBSRUFDVF9QUk9GSUxFUl9UWVBFOlxuICAgICAgcmV0dXJuICdQcm9maWxlcic7XG5cbiAgICBjYXNlIFJFQUNUX1NUUklDVF9NT0RFX1RZUEU6XG4gICAgICByZXR1cm4gJ1N0cmljdE1vZGUnO1xuXG4gICAgY2FzZSBSRUFDVF9TVVNQRU5TRV9UWVBFOlxuICAgICAgcmV0dXJuICdTdXNwZW5zZSc7XG5cbiAgICBjYXNlIFJFQUNUX1NVU1BFTlNFX0xJU1RfVFlQRTpcbiAgICAgIHJldHVybiAnU3VzcGVuc2VMaXN0JztcblxuICB9XG5cbiAgaWYgKHR5cGVvZiB0eXBlID09PSAnb2JqZWN0Jykge1xuICAgIHN3aXRjaCAodHlwZS4kJHR5cGVvZikge1xuICAgICAgY2FzZSBSRUFDVF9DT05URVhUX1RZUEU6XG4gICAgICAgIHZhciBjb250ZXh0ID0gdHlwZTtcbiAgICAgICAgcmV0dXJuIGdldENvbnRleHROYW1lKGNvbnRleHQpICsgJy5Db25zdW1lcic7XG5cbiAgICAgIGNhc2UgUkVBQ1RfUFJPVklERVJfVFlQRTpcbiAgICAgICAgdmFyIHByb3ZpZGVyID0gdHlwZTtcbiAgICAgICAgcmV0dXJuIGdldENvbnRleHROYW1lKHByb3ZpZGVyLl9jb250ZXh0KSArICcuUHJvdmlkZXInO1xuXG4gICAgICBjYXNlIFJFQUNUX0ZPUldBUkRfUkVGX1RZUEU6XG4gICAgICAgIHJldHVybiBnZXRXcmFwcGVkTmFtZSh0eXBlLCB0eXBlLnJlbmRlciwgJ0ZvcndhcmRSZWYnKTtcblxuICAgICAgY2FzZSBSRUFDVF9NRU1PX1RZUEU6XG4gICAgICAgIHZhciBvdXRlck5hbWUgPSB0eXBlLmRpc3BsYXlOYW1lIHx8IG51bGw7XG5cbiAgICAgICAgaWYgKG91dGVyTmFtZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBvdXRlck5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZ2V0Q29tcG9uZW50TmFtZUZyb21UeXBlKHR5cGUudHlwZSkgfHwgJ01lbW8nO1xuXG4gICAgICBjYXNlIFJFQUNUX0xBWllfVFlQRTpcbiAgICAgICAge1xuICAgICAgICAgIHZhciBsYXp5Q29tcG9uZW50ID0gdHlwZTtcbiAgICAgICAgICB2YXIgcGF5bG9hZCA9IGxhenlDb21wb25lbnQuX3BheWxvYWQ7XG4gICAgICAgICAgdmFyIGluaXQgPSBsYXp5Q29tcG9uZW50Ll9pbml0O1xuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBnZXRDb21wb25lbnROYW1lRnJvbVR5cGUoaW5pdChwYXlsb2FkKSk7XG4gICAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1mYWxsdGhyb3VnaFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG52YXIgYXNzaWduID0gT2JqZWN0LmFzc2lnbjtcblxuLy8gSGVscGVycyB0byBwYXRjaCBjb25zb2xlLmxvZ3MgdG8gYXZvaWQgbG9nZ2luZyBkdXJpbmcgc2lkZS1lZmZlY3QgZnJlZVxuLy8gcmVwbGF5aW5nIG9uIHJlbmRlciBmdW5jdGlvbi4gVGhpcyBjdXJyZW50bHkgb25seSBwYXRjaGVzIHRoZSBvYmplY3Rcbi8vIGxhemlseSB3aGljaCB3b24ndCBjb3ZlciBpZiB0aGUgbG9nIGZ1bmN0aW9uIHdhcyBleHRyYWN0ZWQgZWFnZXJseS5cbi8vIFdlIGNvdWxkIGFsc28gZWFnZXJseSBwYXRjaCB0aGUgbWV0aG9kLlxudmFyIGRpc2FibGVkRGVwdGggPSAwO1xudmFyIHByZXZMb2c7XG52YXIgcHJldkluZm87XG52YXIgcHJldldhcm47XG52YXIgcHJldkVycm9yO1xudmFyIHByZXZHcm91cDtcbnZhciBwcmV2R3JvdXBDb2xsYXBzZWQ7XG52YXIgcHJldkdyb3VwRW5kO1xuXG5mdW5jdGlvbiBkaXNhYmxlZExvZygpIHt9XG5cbmRpc2FibGVkTG9nLl9fcmVhY3REaXNhYmxlZExvZyA9IHRydWU7XG5mdW5jdGlvbiBkaXNhYmxlTG9ncygpIHtcbiAge1xuICAgIGlmIChkaXNhYmxlZERlcHRoID09PSAwKSB7XG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSByZWFjdC1pbnRlcm5hbC9uby1wcm9kdWN0aW9uLWxvZ2dpbmcgKi9cbiAgICAgIHByZXZMb2cgPSBjb25zb2xlLmxvZztcbiAgICAgIHByZXZJbmZvID0gY29uc29sZS5pbmZvO1xuICAgICAgcHJldldhcm4gPSBjb25zb2xlLndhcm47XG4gICAgICBwcmV2RXJyb3IgPSBjb25zb2xlLmVycm9yO1xuICAgICAgcHJldkdyb3VwID0gY29uc29sZS5ncm91cDtcbiAgICAgIHByZXZHcm91cENvbGxhcHNlZCA9IGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQ7XG4gICAgICBwcmV2R3JvdXBFbmQgPSBjb25zb2xlLmdyb3VwRW5kOyAvLyBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVhY3QvaXNzdWVzLzE5MDk5XG5cbiAgICAgIHZhciBwcm9wcyA9IHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZGlzYWJsZWRMb2csXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9OyAvLyAkRmxvd0ZpeE1lIEZsb3cgdGhpbmtzIGNvbnNvbGUgaXMgaW1tdXRhYmxlLlxuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhjb25zb2xlLCB7XG4gICAgICAgIGluZm86IHByb3BzLFxuICAgICAgICBsb2c6IHByb3BzLFxuICAgICAgICB3YXJuOiBwcm9wcyxcbiAgICAgICAgZXJyb3I6IHByb3BzLFxuICAgICAgICBncm91cDogcHJvcHMsXG4gICAgICAgIGdyb3VwQ29sbGFwc2VkOiBwcm9wcyxcbiAgICAgICAgZ3JvdXBFbmQ6IHByb3BzXG4gICAgICB9KTtcbiAgICAgIC8qIGVzbGludC1lbmFibGUgcmVhY3QtaW50ZXJuYWwvbm8tcHJvZHVjdGlvbi1sb2dnaW5nICovXG4gICAgfVxuXG4gICAgZGlzYWJsZWREZXB0aCsrO1xuICB9XG59XG5mdW5jdGlvbiByZWVuYWJsZUxvZ3MoKSB7XG4gIHtcbiAgICBkaXNhYmxlZERlcHRoLS07XG5cbiAgICBpZiAoZGlzYWJsZWREZXB0aCA9PT0gMCkge1xuICAgICAgLyogZXNsaW50LWRpc2FibGUgcmVhY3QtaW50ZXJuYWwvbm8tcHJvZHVjdGlvbi1sb2dnaW5nICovXG4gICAgICB2YXIgcHJvcHMgPSB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH07IC8vICRGbG93Rml4TWUgRmxvdyB0aGlua3MgY29uc29sZSBpcyBpbW11dGFibGUuXG5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGNvbnNvbGUsIHtcbiAgICAgICAgbG9nOiBhc3NpZ24oe30sIHByb3BzLCB7XG4gICAgICAgICAgdmFsdWU6IHByZXZMb2dcbiAgICAgICAgfSksXG4gICAgICAgIGluZm86IGFzc2lnbih7fSwgcHJvcHMsIHtcbiAgICAgICAgICB2YWx1ZTogcHJldkluZm9cbiAgICAgICAgfSksXG4gICAgICAgIHdhcm46IGFzc2lnbih7fSwgcHJvcHMsIHtcbiAgICAgICAgICB2YWx1ZTogcHJldldhcm5cbiAgICAgICAgfSksXG4gICAgICAgIGVycm9yOiBhc3NpZ24oe30sIHByb3BzLCB7XG4gICAgICAgICAgdmFsdWU6IHByZXZFcnJvclxuICAgICAgICB9KSxcbiAgICAgICAgZ3JvdXA6IGFzc2lnbih7fSwgcHJvcHMsIHtcbiAgICAgICAgICB2YWx1ZTogcHJldkdyb3VwXG4gICAgICAgIH0pLFxuICAgICAgICBncm91cENvbGxhcHNlZDogYXNzaWduKHt9LCBwcm9wcywge1xuICAgICAgICAgIHZhbHVlOiBwcmV2R3JvdXBDb2xsYXBzZWRcbiAgICAgICAgfSksXG4gICAgICAgIGdyb3VwRW5kOiBhc3NpZ24oe30sIHByb3BzLCB7XG4gICAgICAgICAgdmFsdWU6IHByZXZHcm91cEVuZFxuICAgICAgICB9KVxuICAgICAgfSk7XG4gICAgICAvKiBlc2xpbnQtZW5hYmxlIHJlYWN0LWludGVybmFsL25vLXByb2R1Y3Rpb24tbG9nZ2luZyAqL1xuICAgIH1cblxuICAgIGlmIChkaXNhYmxlZERlcHRoIDwgMCkge1xuICAgICAgZXJyb3IoJ2Rpc2FibGVkRGVwdGggZmVsbCBiZWxvdyB6ZXJvLiAnICsgJ1RoaXMgaXMgYSBidWcgaW4gUmVhY3QuIFBsZWFzZSBmaWxlIGFuIGlzc3VlLicpO1xuICAgIH1cbiAgfVxufVxuXG52YXIgUmVhY3RDdXJyZW50RGlzcGF0Y2hlciA9IFJlYWN0U2hhcmVkSW50ZXJuYWxzLlJlYWN0Q3VycmVudERpc3BhdGNoZXI7XG52YXIgcHJlZml4O1xuZnVuY3Rpb24gZGVzY3JpYmVCdWlsdEluQ29tcG9uZW50RnJhbWUobmFtZSwgc291cmNlLCBvd25lckZuKSB7XG4gIHtcbiAgICBpZiAocHJlZml4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEV4dHJhY3QgdGhlIFZNIHNwZWNpZmljIHByZWZpeCB1c2VkIGJ5IGVhY2ggbGluZS5cbiAgICAgIHRyeSB7XG4gICAgICAgIHRocm93IEVycm9yKCk7XG4gICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgIHZhciBtYXRjaCA9IHguc3RhY2sudHJpbSgpLm1hdGNoKC9cXG4oICooYXQgKT8pLyk7XG4gICAgICAgIHByZWZpeCA9IG1hdGNoICYmIG1hdGNoWzFdIHx8ICcnO1xuICAgICAgfVxuICAgIH0gLy8gV2UgdXNlIHRoZSBwcmVmaXggdG8gZW5zdXJlIG91ciBzdGFja3MgbGluZSB1cCB3aXRoIG5hdGl2ZSBzdGFjayBmcmFtZXMuXG5cblxuICAgIHJldHVybiAnXFxuJyArIHByZWZpeCArIG5hbWU7XG4gIH1cbn1cbnZhciByZWVudHJ5ID0gZmFsc2U7XG52YXIgY29tcG9uZW50RnJhbWVDYWNoZTtcblxue1xuICB2YXIgUG9zc2libHlXZWFrTWFwID0gdHlwZW9mIFdlYWtNYXAgPT09ICdmdW5jdGlvbicgPyBXZWFrTWFwIDogTWFwO1xuICBjb21wb25lbnRGcmFtZUNhY2hlID0gbmV3IFBvc3NpYmx5V2Vha01hcCgpO1xufVxuXG5mdW5jdGlvbiBkZXNjcmliZU5hdGl2ZUNvbXBvbmVudEZyYW1lKGZuLCBjb25zdHJ1Y3QpIHtcbiAgLy8gSWYgc29tZXRoaW5nIGFza2VkIGZvciBhIHN0YWNrIGluc2lkZSBhIGZha2UgcmVuZGVyLCBpdCBzaG91bGQgZ2V0IGlnbm9yZWQuXG4gIGlmICggIWZuIHx8IHJlZW50cnkpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICB7XG4gICAgdmFyIGZyYW1lID0gY29tcG9uZW50RnJhbWVDYWNoZS5nZXQoZm4pO1xuXG4gICAgaWYgKGZyYW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBmcmFtZTtcbiAgICB9XG4gIH1cblxuICB2YXIgY29udHJvbDtcbiAgcmVlbnRyeSA9IHRydWU7XG4gIHZhciBwcmV2aW91c1ByZXBhcmVTdGFja1RyYWNlID0gRXJyb3IucHJlcGFyZVN0YWNrVHJhY2U7IC8vICRGbG93Rml4TWUgSXQgZG9lcyBhY2NlcHQgdW5kZWZpbmVkLlxuXG4gIEVycm9yLnByZXBhcmVTdGFja1RyYWNlID0gdW5kZWZpbmVkO1xuICB2YXIgcHJldmlvdXNEaXNwYXRjaGVyO1xuXG4gIHtcbiAgICBwcmV2aW91c0Rpc3BhdGNoZXIgPSBSZWFjdEN1cnJlbnREaXNwYXRjaGVyLmN1cnJlbnQ7IC8vIFNldCB0aGUgZGlzcGF0Y2hlciBpbiBERVYgYmVjYXVzZSB0aGlzIG1pZ2h0IGJlIGNhbGwgaW4gdGhlIHJlbmRlciBmdW5jdGlvblxuICAgIC8vIGZvciB3YXJuaW5ncy5cblxuICAgIFJlYWN0Q3VycmVudERpc3BhdGNoZXIuY3VycmVudCA9IG51bGw7XG4gICAgZGlzYWJsZUxvZ3MoKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gVGhpcyBzaG91bGQgdGhyb3cuXG4gICAgaWYgKGNvbnN0cnVjdCkge1xuICAgICAgLy8gU29tZXRoaW5nIHNob3VsZCBiZSBzZXR0aW5nIHRoZSBwcm9wcyBpbiB0aGUgY29uc3RydWN0b3IuXG4gICAgICB2YXIgRmFrZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoKTtcbiAgICAgIH07IC8vICRGbG93Rml4TWVcblxuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRmFrZS5wcm90b3R5cGUsICdwcm9wcycsIHtcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gV2UgdXNlIGEgdGhyb3dpbmcgc2V0dGVyIGluc3RlYWQgb2YgZnJvemVuIG9yIG5vbi13cml0YWJsZSBwcm9wc1xuICAgICAgICAgIC8vIGJlY2F1c2UgdGhhdCB3b24ndCB0aHJvdyBpbiBhIG5vbi1zdHJpY3QgbW9kZSBmdW5jdGlvbi5cbiAgICAgICAgICB0aHJvdyBFcnJvcigpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSAnb2JqZWN0JyAmJiBSZWZsZWN0LmNvbnN0cnVjdCkge1xuICAgICAgICAvLyBXZSBjb25zdHJ1Y3QgYSBkaWZmZXJlbnQgY29udHJvbCBmb3IgdGhpcyBjYXNlIHRvIGluY2x1ZGUgYW55IGV4dHJhXG4gICAgICAgIC8vIGZyYW1lcyBhZGRlZCBieSB0aGUgY29uc3RydWN0IGNhbGwuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgUmVmbGVjdC5jb25zdHJ1Y3QoRmFrZSwgW10pO1xuICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgY29udHJvbCA9IHg7XG4gICAgICAgIH1cblxuICAgICAgICBSZWZsZWN0LmNvbnN0cnVjdChmbiwgW10sIEZha2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBGYWtlLmNhbGwoKTtcbiAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgIGNvbnRyb2wgPSB4O1xuICAgICAgICB9XG5cbiAgICAgICAgZm4uY2FsbChGYWtlLnByb3RvdHlwZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRocm93IEVycm9yKCk7XG4gICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgIGNvbnRyb2wgPSB4O1xuICAgICAgfVxuXG4gICAgICBmbigpO1xuICAgIH1cbiAgfSBjYXRjaCAoc2FtcGxlKSB7XG4gICAgLy8gVGhpcyBpcyBpbmxpbmVkIG1hbnVhbGx5IGJlY2F1c2UgY2xvc3VyZSBkb2Vzbid0IGRvIGl0IGZvciB1cy5cbiAgICBpZiAoc2FtcGxlICYmIGNvbnRyb2wgJiYgdHlwZW9mIHNhbXBsZS5zdGFjayA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIFRoaXMgZXh0cmFjdHMgdGhlIGZpcnN0IGZyYW1lIGZyb20gdGhlIHNhbXBsZSB0aGF0IGlzbid0IGFsc28gaW4gdGhlIGNvbnRyb2wuXG4gICAgICAvLyBTa2lwcGluZyBvbmUgZnJhbWUgdGhhdCB3ZSBhc3N1bWUgaXMgdGhlIGZyYW1lIHRoYXQgY2FsbHMgdGhlIHR3by5cbiAgICAgIHZhciBzYW1wbGVMaW5lcyA9IHNhbXBsZS5zdGFjay5zcGxpdCgnXFxuJyk7XG4gICAgICB2YXIgY29udHJvbExpbmVzID0gY29udHJvbC5zdGFjay5zcGxpdCgnXFxuJyk7XG4gICAgICB2YXIgcyA9IHNhbXBsZUxpbmVzLmxlbmd0aCAtIDE7XG4gICAgICB2YXIgYyA9IGNvbnRyb2xMaW5lcy5sZW5ndGggLSAxO1xuXG4gICAgICB3aGlsZSAocyA+PSAxICYmIGMgPj0gMCAmJiBzYW1wbGVMaW5lc1tzXSAhPT0gY29udHJvbExpbmVzW2NdKSB7XG4gICAgICAgIC8vIFdlIGV4cGVjdCBhdCBsZWFzdCBvbmUgc3RhY2sgZnJhbWUgdG8gYmUgc2hhcmVkLlxuICAgICAgICAvLyBUeXBpY2FsbHkgdGhpcyB3aWxsIGJlIHRoZSByb290IG1vc3Qgb25lLiBIb3dldmVyLCBzdGFjayBmcmFtZXMgbWF5IGJlXG4gICAgICAgIC8vIGN1dCBvZmYgZHVlIHRvIG1heGltdW0gc3RhY2sgbGltaXRzLiBJbiB0aGlzIGNhc2UsIG9uZSBtYXliZSBjdXQgb2ZmXG4gICAgICAgIC8vIGVhcmxpZXIgdGhhbiB0aGUgb3RoZXIuIFdlIGFzc3VtZSB0aGF0IHRoZSBzYW1wbGUgaXMgbG9uZ2VyIG9yIHRoZSBzYW1lXG4gICAgICAgIC8vIGFuZCB0aGVyZSBmb3IgY3V0IG9mZiBlYXJsaWVyLiBTbyB3ZSBzaG91bGQgZmluZCB0aGUgcm9vdCBtb3N0IGZyYW1lIGluXG4gICAgICAgIC8vIHRoZSBzYW1wbGUgc29tZXdoZXJlIGluIHRoZSBjb250cm9sLlxuICAgICAgICBjLS07XG4gICAgICB9XG5cbiAgICAgIGZvciAoOyBzID49IDEgJiYgYyA+PSAwOyBzLS0sIGMtLSkge1xuICAgICAgICAvLyBOZXh0IHdlIGZpbmQgdGhlIGZpcnN0IG9uZSB0aGF0IGlzbid0IHRoZSBzYW1lIHdoaWNoIHNob3VsZCBiZSB0aGVcbiAgICAgICAgLy8gZnJhbWUgdGhhdCBjYWxsZWQgb3VyIHNhbXBsZSBmdW5jdGlvbiBhbmQgdGhlIGNvbnRyb2wuXG4gICAgICAgIGlmIChzYW1wbGVMaW5lc1tzXSAhPT0gY29udHJvbExpbmVzW2NdKSB7XG4gICAgICAgICAgLy8gSW4gVjgsIHRoZSBmaXJzdCBsaW5lIGlzIGRlc2NyaWJpbmcgdGhlIG1lc3NhZ2UgYnV0IG90aGVyIFZNcyBkb24ndC5cbiAgICAgICAgICAvLyBJZiB3ZSdyZSBhYm91dCB0byByZXR1cm4gdGhlIGZpcnN0IGxpbmUsIGFuZCB0aGUgY29udHJvbCBpcyBhbHNvIG9uIHRoZSBzYW1lXG4gICAgICAgICAgLy8gbGluZSwgdGhhdCdzIGEgcHJldHR5IGdvb2QgaW5kaWNhdG9yIHRoYXQgb3VyIHNhbXBsZSB0aHJldyBhdCBzYW1lIGxpbmUgYXNcbiAgICAgICAgICAvLyB0aGUgY29udHJvbC4gSS5lLiBiZWZvcmUgd2UgZW50ZXJlZCB0aGUgc2FtcGxlIGZyYW1lLiBTbyB3ZSBpZ25vcmUgdGhpcyByZXN1bHQuXG4gICAgICAgICAgLy8gVGhpcyBjYW4gaGFwcGVuIGlmIHlvdSBwYXNzZWQgYSBjbGFzcyB0byBmdW5jdGlvbiBjb21wb25lbnQsIG9yIG5vbi1mdW5jdGlvbi5cbiAgICAgICAgICBpZiAocyAhPT0gMSB8fCBjICE9PSAxKSB7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgIHMtLTtcbiAgICAgICAgICAgICAgYy0tOyAvLyBXZSBtYXkgc3RpbGwgaGF2ZSBzaW1pbGFyIGludGVybWVkaWF0ZSBmcmFtZXMgZnJvbSB0aGUgY29uc3RydWN0IGNhbGwuXG4gICAgICAgICAgICAgIC8vIFRoZSBuZXh0IG9uZSB0aGF0IGlzbid0IHRoZSBzYW1lIHNob3VsZCBiZSBvdXIgbWF0Y2ggdGhvdWdoLlxuXG4gICAgICAgICAgICAgIGlmIChjIDwgMCB8fCBzYW1wbGVMaW5lc1tzXSAhPT0gY29udHJvbExpbmVzW2NdKSB7XG4gICAgICAgICAgICAgICAgLy8gVjggYWRkcyBhIFwibmV3XCIgcHJlZml4IGZvciBuYXRpdmUgY2xhc3Nlcy4gTGV0J3MgcmVtb3ZlIGl0IHRvIG1ha2UgaXQgcHJldHRpZXIuXG4gICAgICAgICAgICAgICAgdmFyIF9mcmFtZSA9ICdcXG4nICsgc2FtcGxlTGluZXNbc10ucmVwbGFjZSgnIGF0IG5ldyAnLCAnIGF0ICcpOyAvLyBJZiBvdXIgY29tcG9uZW50IGZyYW1lIGlzIGxhYmVsZWQgXCI8YW5vbnltb3VzPlwiXG4gICAgICAgICAgICAgICAgLy8gYnV0IHdlIGhhdmUgYSB1c2VyLXByb3ZpZGVkIFwiZGlzcGxheU5hbWVcIlxuICAgICAgICAgICAgICAgIC8vIHNwbGljZSBpdCBpbiB0byBtYWtlIHRoZSBzdGFjayBtb3JlIHJlYWRhYmxlLlxuXG5cbiAgICAgICAgICAgICAgICBpZiAoZm4uZGlzcGxheU5hbWUgJiYgX2ZyYW1lLmluY2x1ZGVzKCc8YW5vbnltb3VzPicpKSB7XG4gICAgICAgICAgICAgICAgICBfZnJhbWUgPSBfZnJhbWUucmVwbGFjZSgnPGFub255bW91cz4nLCBmbi5kaXNwbGF5TmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRGcmFtZUNhY2hlLnNldChmbiwgX2ZyYW1lKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IC8vIFJldHVybiB0aGUgbGluZSB3ZSBmb3VuZC5cblxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIF9mcmFtZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSB3aGlsZSAocyA+PSAxICYmIGMgPj0gMCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gZmluYWxseSB7XG4gICAgcmVlbnRyeSA9IGZhbHNlO1xuXG4gICAge1xuICAgICAgUmVhY3RDdXJyZW50RGlzcGF0Y2hlci5jdXJyZW50ID0gcHJldmlvdXNEaXNwYXRjaGVyO1xuICAgICAgcmVlbmFibGVMb2dzKCk7XG4gICAgfVxuXG4gICAgRXJyb3IucHJlcGFyZVN0YWNrVHJhY2UgPSBwcmV2aW91c1ByZXBhcmVTdGFja1RyYWNlO1xuICB9IC8vIEZhbGxiYWNrIHRvIGp1c3QgdXNpbmcgdGhlIG5hbWUgaWYgd2UgY291bGRuJ3QgbWFrZSBpdCB0aHJvdy5cblxuXG4gIHZhciBuYW1lID0gZm4gPyBmbi5kaXNwbGF5TmFtZSB8fCBmbi5uYW1lIDogJyc7XG4gIHZhciBzeW50aGV0aWNGcmFtZSA9IG5hbWUgPyBkZXNjcmliZUJ1aWx0SW5Db21wb25lbnRGcmFtZShuYW1lKSA6ICcnO1xuXG4gIHtcbiAgICBpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb21wb25lbnRGcmFtZUNhY2hlLnNldChmbiwgc3ludGhldGljRnJhbWUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzeW50aGV0aWNGcmFtZTtcbn1cbmZ1bmN0aW9uIGRlc2NyaWJlRnVuY3Rpb25Db21wb25lbnRGcmFtZShmbiwgc291cmNlLCBvd25lckZuKSB7XG4gIHtcbiAgICByZXR1cm4gZGVzY3JpYmVOYXRpdmVDb21wb25lbnRGcmFtZShmbiwgZmFsc2UpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNob3VsZENvbnN0cnVjdChDb21wb25lbnQpIHtcbiAgdmFyIHByb3RvdHlwZSA9IENvbXBvbmVudC5wcm90b3R5cGU7XG4gIHJldHVybiAhIShwcm90b3R5cGUgJiYgcHJvdG90eXBlLmlzUmVhY3RDb21wb25lbnQpO1xufVxuXG5mdW5jdGlvbiBkZXNjcmliZVVua25vd25FbGVtZW50VHlwZUZyYW1lSW5ERVYodHlwZSwgc291cmNlLCBvd25lckZuKSB7XG5cbiAgaWYgKHR5cGUgPT0gbnVsbCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIGlmICh0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHtcbiAgICAgIHJldHVybiBkZXNjcmliZU5hdGl2ZUNvbXBvbmVudEZyYW1lKHR5cGUsIHNob3VsZENvbnN0cnVjdCh0eXBlKSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBkZXNjcmliZUJ1aWx0SW5Db21wb25lbnRGcmFtZSh0eXBlKTtcbiAgfVxuXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgUkVBQ1RfU1VTUEVOU0VfVFlQRTpcbiAgICAgIHJldHVybiBkZXNjcmliZUJ1aWx0SW5Db21wb25lbnRGcmFtZSgnU3VzcGVuc2UnKTtcblxuICAgIGNhc2UgUkVBQ1RfU1VTUEVOU0VfTElTVF9UWVBFOlxuICAgICAgcmV0dXJuIGRlc2NyaWJlQnVpbHRJbkNvbXBvbmVudEZyYW1lKCdTdXNwZW5zZUxpc3QnKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICBzd2l0Y2ggKHR5cGUuJCR0eXBlb2YpIHtcbiAgICAgIGNhc2UgUkVBQ1RfRk9SV0FSRF9SRUZfVFlQRTpcbiAgICAgICAgcmV0dXJuIGRlc2NyaWJlRnVuY3Rpb25Db21wb25lbnRGcmFtZSh0eXBlLnJlbmRlcik7XG5cbiAgICAgIGNhc2UgUkVBQ1RfTUVNT19UWVBFOlxuICAgICAgICAvLyBNZW1vIG1heSBjb250YWluIGFueSBjb21wb25lbnQgdHlwZSBzbyB3ZSByZWN1cnNpdmVseSByZXNvbHZlIGl0LlxuICAgICAgICByZXR1cm4gZGVzY3JpYmVVbmtub3duRWxlbWVudFR5cGVGcmFtZUluREVWKHR5cGUudHlwZSwgc291cmNlLCBvd25lckZuKTtcblxuICAgICAgY2FzZSBSRUFDVF9MQVpZX1RZUEU6XG4gICAgICAgIHtcbiAgICAgICAgICB2YXIgbGF6eUNvbXBvbmVudCA9IHR5cGU7XG4gICAgICAgICAgdmFyIHBheWxvYWQgPSBsYXp5Q29tcG9uZW50Ll9wYXlsb2FkO1xuICAgICAgICAgIHZhciBpbml0ID0gbGF6eUNvbXBvbmVudC5faW5pdDtcblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBMYXp5IG1heSBjb250YWluIGFueSBjb21wb25lbnQgdHlwZSBzbyB3ZSByZWN1cnNpdmVseSByZXNvbHZlIGl0LlxuICAgICAgICAgICAgcmV0dXJuIGRlc2NyaWJlVW5rbm93bkVsZW1lbnRUeXBlRnJhbWVJbkRFVihpbml0KHBheWxvYWQpLCBzb3VyY2UsIG93bmVyRm4pO1xuICAgICAgICAgIH0gY2F0Y2ggKHgpIHt9XG4gICAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gJyc7XG59XG5cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbnZhciBsb2dnZWRUeXBlRmFpbHVyZXMgPSB7fTtcbnZhciBSZWFjdERlYnVnQ3VycmVudEZyYW1lID0gUmVhY3RTaGFyZWRJbnRlcm5hbHMuUmVhY3REZWJ1Z0N1cnJlbnRGcmFtZTtcblxuZnVuY3Rpb24gc2V0Q3VycmVudGx5VmFsaWRhdGluZ0VsZW1lbnQoZWxlbWVudCkge1xuICB7XG4gICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgIHZhciBvd25lciA9IGVsZW1lbnQuX293bmVyO1xuICAgICAgdmFyIHN0YWNrID0gZGVzY3JpYmVVbmtub3duRWxlbWVudFR5cGVGcmFtZUluREVWKGVsZW1lbnQudHlwZSwgZWxlbWVudC5fc291cmNlLCBvd25lciA/IG93bmVyLnR5cGUgOiBudWxsKTtcbiAgICAgIFJlYWN0RGVidWdDdXJyZW50RnJhbWUuc2V0RXh0cmFTdGFja0ZyYW1lKHN0YWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgUmVhY3REZWJ1Z0N1cnJlbnRGcmFtZS5zZXRFeHRyYVN0YWNrRnJhbWUobnVsbCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrUHJvcFR5cGVzKHR5cGVTcGVjcywgdmFsdWVzLCBsb2NhdGlvbiwgY29tcG9uZW50TmFtZSwgZWxlbWVudCkge1xuICB7XG4gICAgLy8gJEZsb3dGaXhNZSBUaGlzIGlzIG9rYXkgYnV0IEZsb3cgZG9lc24ndCBrbm93IGl0LlxuICAgIHZhciBoYXMgPSBGdW5jdGlvbi5jYWxsLmJpbmQoaGFzT3duUHJvcGVydHkpO1xuXG4gICAgZm9yICh2YXIgdHlwZVNwZWNOYW1lIGluIHR5cGVTcGVjcykge1xuICAgICAgaWYgKGhhcyh0eXBlU3BlY3MsIHR5cGVTcGVjTmFtZSkpIHtcbiAgICAgICAgdmFyIGVycm9yJDEgPSB2b2lkIDA7IC8vIFByb3AgdHlwZSB2YWxpZGF0aW9uIG1heSB0aHJvdy4gSW4gY2FzZSB0aGV5IGRvLCB3ZSBkb24ndCB3YW50IHRvXG4gICAgICAgIC8vIGZhaWwgdGhlIHJlbmRlciBwaGFzZSB3aGVyZSBpdCBkaWRuJ3QgZmFpbCBiZWZvcmUuIFNvIHdlIGxvZyBpdC5cbiAgICAgICAgLy8gQWZ0ZXIgdGhlc2UgaGF2ZSBiZWVuIGNsZWFuZWQgdXAsIHdlJ2xsIGxldCB0aGVtIHRocm93LlxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gVGhpcyBpcyBpbnRlbnRpb25hbGx5IGFuIGludmFyaWFudCB0aGF0IGdldHMgY2F1Z2h0LiBJdCdzIHRoZSBzYW1lXG4gICAgICAgICAgLy8gYmVoYXZpb3IgYXMgd2l0aG91dCB0aGlzIHN0YXRlbWVudCBleGNlcHQgd2l0aCBhIGJldHRlciBtZXNzYWdlLlxuICAgICAgICAgIGlmICh0eXBlb2YgdHlwZVNwZWNzW3R5cGVTcGVjTmFtZV0gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1pbnRlcm5hbC9wcm9kLWVycm9yLWNvZGVzXG4gICAgICAgICAgICB2YXIgZXJyID0gRXJyb3IoKGNvbXBvbmVudE5hbWUgfHwgJ1JlYWN0IGNsYXNzJykgKyAnOiAnICsgbG9jYXRpb24gKyAnIHR5cGUgYCcgKyB0eXBlU3BlY05hbWUgKyAnYCBpcyBpbnZhbGlkOyAnICsgJ2l0IG11c3QgYmUgYSBmdW5jdGlvbiwgdXN1YWxseSBmcm9tIHRoZSBgcHJvcC10eXBlc2AgcGFja2FnZSwgYnV0IHJlY2VpdmVkIGAnICsgdHlwZW9mIHR5cGVTcGVjc1t0eXBlU3BlY05hbWVdICsgJ2AuJyArICdUaGlzIG9mdGVuIGhhcHBlbnMgYmVjYXVzZSBvZiB0eXBvcyBzdWNoIGFzIGBQcm9wVHlwZXMuZnVuY3Rpb25gIGluc3RlYWQgb2YgYFByb3BUeXBlcy5mdW5jYC4nKTtcbiAgICAgICAgICAgIGVyci5uYW1lID0gJ0ludmFyaWFudCBWaW9sYXRpb24nO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGVycm9yJDEgPSB0eXBlU3BlY3NbdHlwZVNwZWNOYW1lXSh2YWx1ZXMsIHR5cGVTcGVjTmFtZSwgY29tcG9uZW50TmFtZSwgbG9jYXRpb24sIG51bGwsICdTRUNSRVRfRE9fTk9UX1BBU1NfVEhJU19PUl9ZT1VfV0lMTF9CRV9GSVJFRCcpO1xuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgIGVycm9yJDEgPSBleDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlcnJvciQxICYmICEoZXJyb3IkMSBpbnN0YW5jZW9mIEVycm9yKSkge1xuICAgICAgICAgIHNldEN1cnJlbnRseVZhbGlkYXRpbmdFbGVtZW50KGVsZW1lbnQpO1xuXG4gICAgICAgICAgZXJyb3IoJyVzOiB0eXBlIHNwZWNpZmljYXRpb24gb2YgJXMnICsgJyBgJXNgIGlzIGludmFsaWQ7IHRoZSB0eXBlIGNoZWNrZXIgJyArICdmdW5jdGlvbiBtdXN0IHJldHVybiBgbnVsbGAgb3IgYW4gYEVycm9yYCBidXQgcmV0dXJuZWQgYSAlcy4gJyArICdZb3UgbWF5IGhhdmUgZm9yZ290dGVuIHRvIHBhc3MgYW4gYXJndW1lbnQgdG8gdGhlIHR5cGUgY2hlY2tlciAnICsgJ2NyZWF0b3IgKGFycmF5T2YsIGluc3RhbmNlT2YsIG9iamVjdE9mLCBvbmVPZiwgb25lT2ZUeXBlLCBhbmQgJyArICdzaGFwZSBhbGwgcmVxdWlyZSBhbiBhcmd1bWVudCkuJywgY29tcG9uZW50TmFtZSB8fCAnUmVhY3QgY2xhc3MnLCBsb2NhdGlvbiwgdHlwZVNwZWNOYW1lLCB0eXBlb2YgZXJyb3IkMSk7XG5cbiAgICAgICAgICBzZXRDdXJyZW50bHlWYWxpZGF0aW5nRWxlbWVudChudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlcnJvciQxIGluc3RhbmNlb2YgRXJyb3IgJiYgIShlcnJvciQxLm1lc3NhZ2UgaW4gbG9nZ2VkVHlwZUZhaWx1cmVzKSkge1xuICAgICAgICAgIC8vIE9ubHkgbW9uaXRvciB0aGlzIGZhaWx1cmUgb25jZSBiZWNhdXNlIHRoZXJlIHRlbmRzIHRvIGJlIGEgbG90IG9mIHRoZVxuICAgICAgICAgIC8vIHNhbWUgZXJyb3IuXG4gICAgICAgICAgbG9nZ2VkVHlwZUZhaWx1cmVzW2Vycm9yJDEubWVzc2FnZV0gPSB0cnVlO1xuICAgICAgICAgIHNldEN1cnJlbnRseVZhbGlkYXRpbmdFbGVtZW50KGVsZW1lbnQpO1xuXG4gICAgICAgICAgZXJyb3IoJ0ZhaWxlZCAlcyB0eXBlOiAlcycsIGxvY2F0aW9uLCBlcnJvciQxLm1lc3NhZ2UpO1xuXG4gICAgICAgICAgc2V0Q3VycmVudGx5VmFsaWRhdGluZ0VsZW1lbnQobnVsbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxudmFyIGlzQXJyYXlJbXBsID0gQXJyYXkuaXNBcnJheTsgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXJlZGVjbGFyZVxuXG5mdW5jdGlvbiBpc0FycmF5KGEpIHtcbiAgcmV0dXJuIGlzQXJyYXlJbXBsKGEpO1xufVxuXG4vKlxuICogVGhlIGAnJyArIHZhbHVlYCBwYXR0ZXJuICh1c2VkIGluIGluIHBlcmYtc2Vuc2l0aXZlIGNvZGUpIHRocm93cyBmb3IgU3ltYm9sXG4gKiBhbmQgVGVtcG9yYWwuKiB0eXBlcy4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC9wdWxsLzIyMDY0LlxuICpcbiAqIFRoZSBmdW5jdGlvbnMgaW4gdGhpcyBtb2R1bGUgd2lsbCB0aHJvdyBhbiBlYXNpZXItdG8tdW5kZXJzdGFuZCxcbiAqIGVhc2llci10by1kZWJ1ZyBleGNlcHRpb24gd2l0aCBhIGNsZWFyIGVycm9ycyBtZXNzYWdlIG1lc3NhZ2UgZXhwbGFpbmluZyB0aGVcbiAqIHByb2JsZW0uIChJbnN0ZWFkIG9mIGEgY29uZnVzaW5nIGV4Y2VwdGlvbiB0aHJvd24gaW5zaWRlIHRoZSBpbXBsZW1lbnRhdGlvblxuICogb2YgdGhlIGB2YWx1ZWAgb2JqZWN0KS5cbiAqL1xuLy8gJEZsb3dGaXhNZSBvbmx5IGNhbGxlZCBpbiBERVYsIHNvIHZvaWQgcmV0dXJuIGlzIG5vdCBwb3NzaWJsZS5cbmZ1bmN0aW9uIHR5cGVOYW1lKHZhbHVlKSB7XG4gIHtcbiAgICAvLyB0b1N0cmluZ1RhZyBpcyBuZWVkZWQgZm9yIG5hbWVzcGFjZWQgdHlwZXMgbGlrZSBUZW1wb3JhbC5JbnN0YW50XG4gICAgdmFyIGhhc1RvU3RyaW5nVGFnID0gdHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiBTeW1ib2wudG9TdHJpbmdUYWc7XG4gICAgdmFyIHR5cGUgPSBoYXNUb1N0cmluZ1RhZyAmJiB2YWx1ZVtTeW1ib2wudG9TdHJpbmdUYWddIHx8IHZhbHVlLmNvbnN0cnVjdG9yLm5hbWUgfHwgJ09iamVjdCc7XG4gICAgcmV0dXJuIHR5cGU7XG4gIH1cbn0gLy8gJEZsb3dGaXhNZSBvbmx5IGNhbGxlZCBpbiBERVYsIHNvIHZvaWQgcmV0dXJuIGlzIG5vdCBwb3NzaWJsZS5cblxuXG5mdW5jdGlvbiB3aWxsQ29lcmNpb25UaHJvdyh2YWx1ZSkge1xuICB7XG4gICAgdHJ5IHtcbiAgICAgIHRlc3RTdHJpbmdDb2VyY2lvbih2YWx1ZSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHRlc3RTdHJpbmdDb2VyY2lvbih2YWx1ZSkge1xuICAvLyBJZiB5b3UgZW5kZWQgdXAgaGVyZSBieSBmb2xsb3dpbmcgYW4gZXhjZXB0aW9uIGNhbGwgc3RhY2ssIGhlcmUncyB3aGF0J3NcbiAgLy8gaGFwcGVuZWQ6IHlvdSBzdXBwbGllZCBhbiBvYmplY3Qgb3Igc3ltYm9sIHZhbHVlIHRvIFJlYWN0IChhcyBhIHByb3AsIGtleSxcbiAgLy8gRE9NIGF0dHJpYnV0ZSwgQ1NTIHByb3BlcnR5LCBzdHJpbmcgcmVmLCBldGMuKSBhbmQgd2hlbiBSZWFjdCB0cmllZCB0b1xuICAvLyBjb2VyY2UgaXQgdG8gYSBzdHJpbmcgdXNpbmcgYCcnICsgdmFsdWVgLCBhbiBleGNlcHRpb24gd2FzIHRocm93bi5cbiAgLy9cbiAgLy8gVGhlIG1vc3QgY29tbW9uIHR5cGVzIHRoYXQgd2lsbCBjYXVzZSB0aGlzIGV4Y2VwdGlvbiBhcmUgYFN5bWJvbGAgaW5zdGFuY2VzXG4gIC8vIGFuZCBUZW1wb3JhbCBvYmplY3RzIGxpa2UgYFRlbXBvcmFsLkluc3RhbnRgLiBCdXQgYW55IG9iamVjdCB0aGF0IGhhcyBhXG4gIC8vIGB2YWx1ZU9mYCBvciBgW1N5bWJvbC50b1ByaW1pdGl2ZV1gIG1ldGhvZCB0aGF0IHRocm93cyB3aWxsIGFsc28gY2F1c2UgdGhpc1xuICAvLyBleGNlcHRpb24uIChMaWJyYXJ5IGF1dGhvcnMgZG8gdGhpcyB0byBwcmV2ZW50IHVzZXJzIGZyb20gdXNpbmcgYnVpbHQtaW5cbiAgLy8gbnVtZXJpYyBvcGVyYXRvcnMgbGlrZSBgK2Agb3IgY29tcGFyaXNvbiBvcGVyYXRvcnMgbGlrZSBgPj1gIGJlY2F1c2UgY3VzdG9tXG4gIC8vIG1ldGhvZHMgYXJlIG5lZWRlZCB0byBwZXJmb3JtIGFjY3VyYXRlIGFyaXRobWV0aWMgb3IgY29tcGFyaXNvbi4pXG4gIC8vXG4gIC8vIFRvIGZpeCB0aGUgcHJvYmxlbSwgY29lcmNlIHRoaXMgb2JqZWN0IG9yIHN5bWJvbCB2YWx1ZSB0byBhIHN0cmluZyBiZWZvcmVcbiAgLy8gcGFzc2luZyBpdCB0byBSZWFjdC4gVGhlIG1vc3QgcmVsaWFibGUgd2F5IGlzIHVzdWFsbHkgYFN0cmluZyh2YWx1ZSlgLlxuICAvL1xuICAvLyBUbyBmaW5kIHdoaWNoIHZhbHVlIGlzIHRocm93aW5nLCBjaGVjayB0aGUgYnJvd3NlciBvciBkZWJ1Z2dlciBjb25zb2xlLlxuICAvLyBCZWZvcmUgdGhpcyBleGNlcHRpb24gd2FzIHRocm93biwgdGhlcmUgc2hvdWxkIGJlIGBjb25zb2xlLmVycm9yYCBvdXRwdXRcbiAgLy8gdGhhdCBzaG93cyB0aGUgdHlwZSAoU3ltYm9sLCBUZW1wb3JhbC5QbGFpbkRhdGUsIGV0Yy4pIHRoYXQgY2F1c2VkIHRoZVxuICAvLyBwcm9ibGVtIGFuZCBob3cgdGhhdCB0eXBlIHdhcyB1c2VkOiBrZXksIGF0cnJpYnV0ZSwgaW5wdXQgdmFsdWUgcHJvcCwgZXRjLlxuICAvLyBJbiBtb3N0IGNhc2VzLCB0aGlzIGNvbnNvbGUgb3V0cHV0IGFsc28gc2hvd3MgdGhlIGNvbXBvbmVudCBhbmQgaXRzXG4gIC8vIGFuY2VzdG9yIGNvbXBvbmVudHMgd2hlcmUgdGhlIGV4Y2VwdGlvbiBoYXBwZW5lZC5cbiAgLy9cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWludGVybmFsL3NhZmUtc3RyaW5nLWNvZXJjaW9uXG4gIHJldHVybiAnJyArIHZhbHVlO1xufVxuZnVuY3Rpb24gY2hlY2tLZXlTdHJpbmdDb2VyY2lvbih2YWx1ZSkge1xuICB7XG4gICAgaWYgKHdpbGxDb2VyY2lvblRocm93KHZhbHVlKSkge1xuICAgICAgZXJyb3IoJ1RoZSBwcm92aWRlZCBrZXkgaXMgYW4gdW5zdXBwb3J0ZWQgdHlwZSAlcy4nICsgJyBUaGlzIHZhbHVlIG11c3QgYmUgY29lcmNlZCB0byBhIHN0cmluZyBiZWZvcmUgYmVmb3JlIHVzaW5nIGl0IGhlcmUuJywgdHlwZU5hbWUodmFsdWUpKTtcblxuICAgICAgcmV0dXJuIHRlc3RTdHJpbmdDb2VyY2lvbih2YWx1ZSk7IC8vIHRocm93ICh0byBoZWxwIGNhbGxlcnMgZmluZCB0cm91Ymxlc2hvb3RpbmcgY29tbWVudHMpXG4gICAgfVxuICB9XG59XG5cbnZhciBSZWFjdEN1cnJlbnRPd25lciA9IFJlYWN0U2hhcmVkSW50ZXJuYWxzLlJlYWN0Q3VycmVudE93bmVyO1xudmFyIFJFU0VSVkVEX1BST1BTID0ge1xuICBrZXk6IHRydWUsXG4gIHJlZjogdHJ1ZSxcbiAgX19zZWxmOiB0cnVlLFxuICBfX3NvdXJjZTogdHJ1ZVxufTtcbnZhciBzcGVjaWFsUHJvcEtleVdhcm5pbmdTaG93bjtcbnZhciBzcGVjaWFsUHJvcFJlZldhcm5pbmdTaG93bjtcbnZhciBkaWRXYXJuQWJvdXRTdHJpbmdSZWZzO1xuXG57XG4gIGRpZFdhcm5BYm91dFN0cmluZ1JlZnMgPSB7fTtcbn1cblxuZnVuY3Rpb24gaGFzVmFsaWRSZWYoY29uZmlnKSB7XG4gIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChjb25maWcsICdyZWYnKSkge1xuICAgICAgdmFyIGdldHRlciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoY29uZmlnLCAncmVmJykuZ2V0O1xuXG4gICAgICBpZiAoZ2V0dGVyICYmIGdldHRlci5pc1JlYWN0V2FybmluZykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvbmZpZy5yZWYgIT09IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gaGFzVmFsaWRLZXkoY29uZmlnKSB7XG4gIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChjb25maWcsICdrZXknKSkge1xuICAgICAgdmFyIGdldHRlciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoY29uZmlnLCAna2V5JykuZ2V0O1xuXG4gICAgICBpZiAoZ2V0dGVyICYmIGdldHRlci5pc1JlYWN0V2FybmluZykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvbmZpZy5rZXkgIT09IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gd2FybklmU3RyaW5nUmVmQ2Fubm90QmVBdXRvQ29udmVydGVkKGNvbmZpZywgc2VsZikge1xuICB7XG4gICAgaWYgKHR5cGVvZiBjb25maWcucmVmID09PSAnc3RyaW5nJyAmJiBSZWFjdEN1cnJlbnRPd25lci5jdXJyZW50ICYmIHNlbGYgJiYgUmVhY3RDdXJyZW50T3duZXIuY3VycmVudC5zdGF0ZU5vZGUgIT09IHNlbGYpIHtcbiAgICAgIHZhciBjb21wb25lbnROYW1lID0gZ2V0Q29tcG9uZW50TmFtZUZyb21UeXBlKFJlYWN0Q3VycmVudE93bmVyLmN1cnJlbnQudHlwZSk7XG5cbiAgICAgIGlmICghZGlkV2FybkFib3V0U3RyaW5nUmVmc1tjb21wb25lbnROYW1lXSkge1xuICAgICAgICBlcnJvcignQ29tcG9uZW50IFwiJXNcIiBjb250YWlucyB0aGUgc3RyaW5nIHJlZiBcIiVzXCIuICcgKyAnU3VwcG9ydCBmb3Igc3RyaW5nIHJlZnMgd2lsbCBiZSByZW1vdmVkIGluIGEgZnV0dXJlIG1ham9yIHJlbGVhc2UuICcgKyAnVGhpcyBjYXNlIGNhbm5vdCBiZSBhdXRvbWF0aWNhbGx5IGNvbnZlcnRlZCB0byBhbiBhcnJvdyBmdW5jdGlvbi4gJyArICdXZSBhc2sgeW91IHRvIG1hbnVhbGx5IGZpeCB0aGlzIGNhc2UgYnkgdXNpbmcgdXNlUmVmKCkgb3IgY3JlYXRlUmVmKCkgaW5zdGVhZC4gJyArICdMZWFybiBtb3JlIGFib3V0IHVzaW5nIHJlZnMgc2FmZWx5IGhlcmU6ICcgKyAnaHR0cHM6Ly9yZWFjdGpzLm9yZy9saW5rL3N0cmljdC1tb2RlLXN0cmluZy1yZWYnLCBnZXRDb21wb25lbnROYW1lRnJvbVR5cGUoUmVhY3RDdXJyZW50T3duZXIuY3VycmVudC50eXBlKSwgY29uZmlnLnJlZik7XG5cbiAgICAgICAgZGlkV2FybkFib3V0U3RyaW5nUmVmc1tjb21wb25lbnROYW1lXSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGRlZmluZUtleVByb3BXYXJuaW5nR2V0dGVyKHByb3BzLCBkaXNwbGF5TmFtZSkge1xuICB7XG4gICAgdmFyIHdhcm5BYm91dEFjY2Vzc2luZ0tleSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghc3BlY2lhbFByb3BLZXlXYXJuaW5nU2hvd24pIHtcbiAgICAgICAgc3BlY2lhbFByb3BLZXlXYXJuaW5nU2hvd24gPSB0cnVlO1xuXG4gICAgICAgIGVycm9yKCclczogYGtleWAgaXMgbm90IGEgcHJvcC4gVHJ5aW5nIHRvIGFjY2VzcyBpdCB3aWxsIHJlc3VsdCAnICsgJ2luIGB1bmRlZmluZWRgIGJlaW5nIHJldHVybmVkLiBJZiB5b3UgbmVlZCB0byBhY2Nlc3MgdGhlIHNhbWUgJyArICd2YWx1ZSB3aXRoaW4gdGhlIGNoaWxkIGNvbXBvbmVudCwgeW91IHNob3VsZCBwYXNzIGl0IGFzIGEgZGlmZmVyZW50ICcgKyAncHJvcC4gKGh0dHBzOi8vcmVhY3Rqcy5vcmcvbGluay9zcGVjaWFsLXByb3BzKScsIGRpc3BsYXlOYW1lKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgd2FybkFib3V0QWNjZXNzaW5nS2V5LmlzUmVhY3RXYXJuaW5nID0gdHJ1ZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvcHMsICdrZXknLCB7XG4gICAgICBnZXQ6IHdhcm5BYm91dEFjY2Vzc2luZ0tleSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRlZmluZVJlZlByb3BXYXJuaW5nR2V0dGVyKHByb3BzLCBkaXNwbGF5TmFtZSkge1xuICB7XG4gICAgdmFyIHdhcm5BYm91dEFjY2Vzc2luZ1JlZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghc3BlY2lhbFByb3BSZWZXYXJuaW5nU2hvd24pIHtcbiAgICAgICAgc3BlY2lhbFByb3BSZWZXYXJuaW5nU2hvd24gPSB0cnVlO1xuXG4gICAgICAgIGVycm9yKCclczogYHJlZmAgaXMgbm90IGEgcHJvcC4gVHJ5aW5nIHRvIGFjY2VzcyBpdCB3aWxsIHJlc3VsdCAnICsgJ2luIGB1bmRlZmluZWRgIGJlaW5nIHJldHVybmVkLiBJZiB5b3UgbmVlZCB0byBhY2Nlc3MgdGhlIHNhbWUgJyArICd2YWx1ZSB3aXRoaW4gdGhlIGNoaWxkIGNvbXBvbmVudCwgeW91IHNob3VsZCBwYXNzIGl0IGFzIGEgZGlmZmVyZW50ICcgKyAncHJvcC4gKGh0dHBzOi8vcmVhY3Rqcy5vcmcvbGluay9zcGVjaWFsLXByb3BzKScsIGRpc3BsYXlOYW1lKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgd2FybkFib3V0QWNjZXNzaW5nUmVmLmlzUmVhY3RXYXJuaW5nID0gdHJ1ZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvcHMsICdyZWYnLCB7XG4gICAgICBnZXQ6IHdhcm5BYm91dEFjY2Vzc2luZ1JlZixcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9XG59XG4vKipcbiAqIEZhY3RvcnkgbWV0aG9kIHRvIGNyZWF0ZSBhIG5ldyBSZWFjdCBlbGVtZW50LiBUaGlzIG5vIGxvbmdlciBhZGhlcmVzIHRvXG4gKiB0aGUgY2xhc3MgcGF0dGVybiwgc28gZG8gbm90IHVzZSBuZXcgdG8gY2FsbCBpdC4gQWxzbywgaW5zdGFuY2VvZiBjaGVja1xuICogd2lsbCBub3Qgd29yay4gSW5zdGVhZCB0ZXN0ICQkdHlwZW9mIGZpZWxkIGFnYWluc3QgU3ltYm9sLmZvcigncmVhY3QuZWxlbWVudCcpIHRvIGNoZWNrXG4gKiBpZiBzb21ldGhpbmcgaXMgYSBSZWFjdCBFbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7Kn0gdHlwZVxuICogQHBhcmFtIHsqfSBwcm9wc1xuICogQHBhcmFtIHsqfSBrZXlcbiAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gcmVmXG4gKiBAcGFyYW0geyp9IG93bmVyXG4gKiBAcGFyYW0geyp9IHNlbGYgQSAqdGVtcG9yYXJ5KiBoZWxwZXIgdG8gZGV0ZWN0IHBsYWNlcyB3aGVyZSBgdGhpc2AgaXNcbiAqIGRpZmZlcmVudCBmcm9tIHRoZSBgb3duZXJgIHdoZW4gUmVhY3QuY3JlYXRlRWxlbWVudCBpcyBjYWxsZWQsIHNvIHRoYXQgd2VcbiAqIGNhbiB3YXJuLiBXZSB3YW50IHRvIGdldCByaWQgb2Ygb3duZXIgYW5kIHJlcGxhY2Ugc3RyaW5nIGByZWZgcyB3aXRoIGFycm93XG4gKiBmdW5jdGlvbnMsIGFuZCBhcyBsb25nIGFzIGB0aGlzYCBhbmQgb3duZXIgYXJlIHRoZSBzYW1lLCB0aGVyZSB3aWxsIGJlIG5vXG4gKiBjaGFuZ2UgaW4gYmVoYXZpb3IuXG4gKiBAcGFyYW0geyp9IHNvdXJjZSBBbiBhbm5vdGF0aW9uIG9iamVjdCAoYWRkZWQgYnkgYSB0cmFuc3BpbGVyIG9yIG90aGVyd2lzZSlcbiAqIGluZGljYXRpbmcgZmlsZW5hbWUsIGxpbmUgbnVtYmVyLCBhbmQvb3Igb3RoZXIgaW5mb3JtYXRpb24uXG4gKiBAaW50ZXJuYWxcbiAqL1xuXG5cbnZhciBSZWFjdEVsZW1lbnQgPSBmdW5jdGlvbiAodHlwZSwga2V5LCByZWYsIHNlbGYsIHNvdXJjZSwgb3duZXIsIHByb3BzKSB7XG4gIHZhciBlbGVtZW50ID0ge1xuICAgIC8vIFRoaXMgdGFnIGFsbG93cyB1cyB0byB1bmlxdWVseSBpZGVudGlmeSB0aGlzIGFzIGEgUmVhY3QgRWxlbWVudFxuICAgICQkdHlwZW9mOiBSRUFDVF9FTEVNRU5UX1RZUEUsXG4gICAgLy8gQnVpbHQtaW4gcHJvcGVydGllcyB0aGF0IGJlbG9uZyBvbiB0aGUgZWxlbWVudFxuICAgIHR5cGU6IHR5cGUsXG4gICAga2V5OiBrZXksXG4gICAgcmVmOiByZWYsXG4gICAgcHJvcHM6IHByb3BzLFxuICAgIC8vIFJlY29yZCB0aGUgY29tcG9uZW50IHJlc3BvbnNpYmxlIGZvciBjcmVhdGluZyB0aGlzIGVsZW1lbnQuXG4gICAgX293bmVyOiBvd25lclxuICB9O1xuXG4gIHtcbiAgICAvLyBUaGUgdmFsaWRhdGlvbiBmbGFnIGlzIGN1cnJlbnRseSBtdXRhdGl2ZS4gV2UgcHV0IGl0IG9uXG4gICAgLy8gYW4gZXh0ZXJuYWwgYmFja2luZyBzdG9yZSBzbyB0aGF0IHdlIGNhbiBmcmVlemUgdGhlIHdob2xlIG9iamVjdC5cbiAgICAvLyBUaGlzIGNhbiBiZSByZXBsYWNlZCB3aXRoIGEgV2Vha01hcCBvbmNlIHRoZXkgYXJlIGltcGxlbWVudGVkIGluXG4gICAgLy8gY29tbW9ubHkgdXNlZCBkZXZlbG9wbWVudCBlbnZpcm9ubWVudHMuXG4gICAgZWxlbWVudC5fc3RvcmUgPSB7fTsgLy8gVG8gbWFrZSBjb21wYXJpbmcgUmVhY3RFbGVtZW50cyBlYXNpZXIgZm9yIHRlc3RpbmcgcHVycG9zZXMsIHdlIG1ha2VcbiAgICAvLyB0aGUgdmFsaWRhdGlvbiBmbGFnIG5vbi1lbnVtZXJhYmxlICh3aGVyZSBwb3NzaWJsZSwgd2hpY2ggc2hvdWxkXG4gICAgLy8gaW5jbHVkZSBldmVyeSBlbnZpcm9ubWVudCB3ZSBydW4gdGVzdHMgaW4pLCBzbyB0aGUgdGVzdCBmcmFtZXdvcmtcbiAgICAvLyBpZ25vcmVzIGl0LlxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQuX3N0b3JlLCAndmFsaWRhdGVkJywge1xuICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICB2YWx1ZTogZmFsc2VcbiAgICB9KTsgLy8gc2VsZiBhbmQgc291cmNlIGFyZSBERVYgb25seSBwcm9wZXJ0aWVzLlxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdfc2VsZicsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgIHZhbHVlOiBzZWxmXG4gICAgfSk7IC8vIFR3byBlbGVtZW50cyBjcmVhdGVkIGluIHR3byBkaWZmZXJlbnQgcGxhY2VzIHNob3VsZCBiZSBjb25zaWRlcmVkXG4gICAgLy8gZXF1YWwgZm9yIHRlc3RpbmcgcHVycG9zZXMgYW5kIHRoZXJlZm9yZSB3ZSBoaWRlIGl0IGZyb20gZW51bWVyYXRpb24uXG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZWxlbWVudCwgJ19zb3VyY2UnLCB7XG4gICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICB2YWx1ZTogc291cmNlXG4gICAgfSk7XG5cbiAgICBpZiAoT2JqZWN0LmZyZWV6ZSkge1xuICAgICAgT2JqZWN0LmZyZWV6ZShlbGVtZW50LnByb3BzKTtcbiAgICAgIE9iamVjdC5mcmVlemUoZWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnQ7XG59O1xuLyoqXG4gKiBodHRwczovL2dpdGh1Yi5jb20vcmVhY3Rqcy9yZmNzL3B1bGwvMTA3XG4gKiBAcGFyYW0geyp9IHR5cGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBwcm9wc1xuICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICovXG5cbmZ1bmN0aW9uIGpzeERFVih0eXBlLCBjb25maWcsIG1heWJlS2V5LCBzb3VyY2UsIHNlbGYpIHtcbiAge1xuICAgIHZhciBwcm9wTmFtZTsgLy8gUmVzZXJ2ZWQgbmFtZXMgYXJlIGV4dHJhY3RlZFxuXG4gICAgdmFyIHByb3BzID0ge307XG4gICAgdmFyIGtleSA9IG51bGw7XG4gICAgdmFyIHJlZiA9IG51bGw7IC8vIEN1cnJlbnRseSwga2V5IGNhbiBiZSBzcHJlYWQgaW4gYXMgYSBwcm9wLiBUaGlzIGNhdXNlcyBhIHBvdGVudGlhbFxuICAgIC8vIGlzc3VlIGlmIGtleSBpcyBhbHNvIGV4cGxpY2l0bHkgZGVjbGFyZWQgKGllLiA8ZGl2IHsuLi5wcm9wc30ga2V5PVwiSGlcIiAvPlxuICAgIC8vIG9yIDxkaXYga2V5PVwiSGlcIiB7Li4ucHJvcHN9IC8+ICkuIFdlIHdhbnQgdG8gZGVwcmVjYXRlIGtleSBzcHJlYWQsXG4gICAgLy8gYnV0IGFzIGFuIGludGVybWVkaWFyeSBzdGVwLCB3ZSB3aWxsIHVzZSBqc3hERVYgZm9yIGV2ZXJ5dGhpbmcgZXhjZXB0XG4gICAgLy8gPGRpdiB7Li4ucHJvcHN9IGtleT1cIkhpXCIgLz4sIGJlY2F1c2Ugd2UgYXJlbid0IGN1cnJlbnRseSBhYmxlIHRvIHRlbGwgaWZcbiAgICAvLyBrZXkgaXMgZXhwbGljaXRseSBkZWNsYXJlZCB0byBiZSB1bmRlZmluZWQgb3Igbm90LlxuXG4gICAgaWYgKG1heWJlS2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHtcbiAgICAgICAgY2hlY2tLZXlTdHJpbmdDb2VyY2lvbihtYXliZUtleSk7XG4gICAgICB9XG5cbiAgICAgIGtleSA9ICcnICsgbWF5YmVLZXk7XG4gICAgfVxuXG4gICAgaWYgKGhhc1ZhbGlkS2V5KGNvbmZpZykpIHtcbiAgICAgIHtcbiAgICAgICAgY2hlY2tLZXlTdHJpbmdDb2VyY2lvbihjb25maWcua2V5KTtcbiAgICAgIH1cblxuICAgICAga2V5ID0gJycgKyBjb25maWcua2V5O1xuICAgIH1cblxuICAgIGlmIChoYXNWYWxpZFJlZihjb25maWcpKSB7XG4gICAgICByZWYgPSBjb25maWcucmVmO1xuICAgICAgd2FybklmU3RyaW5nUmVmQ2Fubm90QmVBdXRvQ29udmVydGVkKGNvbmZpZywgc2VsZik7XG4gICAgfSAvLyBSZW1haW5pbmcgcHJvcGVydGllcyBhcmUgYWRkZWQgdG8gYSBuZXcgcHJvcHMgb2JqZWN0XG5cblxuICAgIGZvciAocHJvcE5hbWUgaW4gY29uZmlnKSB7XG4gICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChjb25maWcsIHByb3BOYW1lKSAmJiAhUkVTRVJWRURfUFJPUFMuaGFzT3duUHJvcGVydHkocHJvcE5hbWUpKSB7XG4gICAgICAgIHByb3BzW3Byb3BOYW1lXSA9IGNvbmZpZ1twcm9wTmFtZV07XG4gICAgICB9XG4gICAgfSAvLyBSZXNvbHZlIGRlZmF1bHQgcHJvcHNcblxuXG4gICAgaWYgKHR5cGUgJiYgdHlwZS5kZWZhdWx0UHJvcHMpIHtcbiAgICAgIHZhciBkZWZhdWx0UHJvcHMgPSB0eXBlLmRlZmF1bHRQcm9wcztcblxuICAgICAgZm9yIChwcm9wTmFtZSBpbiBkZWZhdWx0UHJvcHMpIHtcbiAgICAgICAgaWYgKHByb3BzW3Byb3BOYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcHJvcHNbcHJvcE5hbWVdID0gZGVmYXVsdFByb3BzW3Byb3BOYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChrZXkgfHwgcmVmKSB7XG4gICAgICB2YXIgZGlzcGxheU5hbWUgPSB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyA/IHR5cGUuZGlzcGxheU5hbWUgfHwgdHlwZS5uYW1lIHx8ICdVbmtub3duJyA6IHR5cGU7XG5cbiAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgZGVmaW5lS2V5UHJvcFdhcm5pbmdHZXR0ZXIocHJvcHMsIGRpc3BsYXlOYW1lKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlZikge1xuICAgICAgICBkZWZpbmVSZWZQcm9wV2FybmluZ0dldHRlcihwcm9wcywgZGlzcGxheU5hbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBSZWFjdEVsZW1lbnQodHlwZSwga2V5LCByZWYsIHNlbGYsIHNvdXJjZSwgUmVhY3RDdXJyZW50T3duZXIuY3VycmVudCwgcHJvcHMpO1xuICB9XG59XG5cbnZhciBSZWFjdEN1cnJlbnRPd25lciQxID0gUmVhY3RTaGFyZWRJbnRlcm5hbHMuUmVhY3RDdXJyZW50T3duZXI7XG52YXIgUmVhY3REZWJ1Z0N1cnJlbnRGcmFtZSQxID0gUmVhY3RTaGFyZWRJbnRlcm5hbHMuUmVhY3REZWJ1Z0N1cnJlbnRGcmFtZTtcblxuZnVuY3Rpb24gc2V0Q3VycmVudGx5VmFsaWRhdGluZ0VsZW1lbnQkMShlbGVtZW50KSB7XG4gIHtcbiAgICBpZiAoZWxlbWVudCkge1xuICAgICAgdmFyIG93bmVyID0gZWxlbWVudC5fb3duZXI7XG4gICAgICB2YXIgc3RhY2sgPSBkZXNjcmliZVVua25vd25FbGVtZW50VHlwZUZyYW1lSW5ERVYoZWxlbWVudC50eXBlLCBlbGVtZW50Ll9zb3VyY2UsIG93bmVyID8gb3duZXIudHlwZSA6IG51bGwpO1xuICAgICAgUmVhY3REZWJ1Z0N1cnJlbnRGcmFtZSQxLnNldEV4dHJhU3RhY2tGcmFtZShzdGFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIFJlYWN0RGVidWdDdXJyZW50RnJhbWUkMS5zZXRFeHRyYVN0YWNrRnJhbWUobnVsbCk7XG4gICAgfVxuICB9XG59XG5cbnZhciBwcm9wVHlwZXNNaXNzcGVsbFdhcm5pbmdTaG93bjtcblxue1xuICBwcm9wVHlwZXNNaXNzcGVsbFdhcm5pbmdTaG93biA9IGZhbHNlO1xufVxuLyoqXG4gKiBWZXJpZmllcyB0aGUgb2JqZWN0IGlzIGEgUmVhY3RFbGVtZW50LlxuICogU2VlIGh0dHBzOi8vcmVhY3Rqcy5vcmcvZG9jcy9yZWFjdC1hcGkuaHRtbCNpc3ZhbGlkZWxlbWVudFxuICogQHBhcmFtIHs/b2JqZWN0fSBvYmplY3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgYG9iamVjdGAgaXMgYSBSZWFjdEVsZW1lbnQuXG4gKiBAZmluYWxcbiAqL1xuXG5cbmZ1bmN0aW9uIGlzVmFsaWRFbGVtZW50KG9iamVjdCkge1xuICB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmIG9iamVjdCAhPT0gbnVsbCAmJiBvYmplY3QuJCR0eXBlb2YgPT09IFJFQUNUX0VMRU1FTlRfVFlQRTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREZWNsYXJhdGlvbkVycm9yQWRkZW5kdW0oKSB7XG4gIHtcbiAgICBpZiAoUmVhY3RDdXJyZW50T3duZXIkMS5jdXJyZW50KSB7XG4gICAgICB2YXIgbmFtZSA9IGdldENvbXBvbmVudE5hbWVGcm9tVHlwZShSZWFjdEN1cnJlbnRPd25lciQxLmN1cnJlbnQudHlwZSk7XG5cbiAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgIHJldHVybiAnXFxuXFxuQ2hlY2sgdGhlIHJlbmRlciBtZXRob2Qgb2YgYCcgKyBuYW1lICsgJ2AuJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0U291cmNlSW5mb0Vycm9yQWRkZW5kdW0oc291cmNlKSB7XG4gIHtcbiAgICBpZiAoc291cmNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBmaWxlTmFtZSA9IHNvdXJjZS5maWxlTmFtZS5yZXBsYWNlKC9eLipbXFxcXFxcL10vLCAnJyk7XG4gICAgICB2YXIgbGluZU51bWJlciA9IHNvdXJjZS5saW5lTnVtYmVyO1xuICAgICAgcmV0dXJuICdcXG5cXG5DaGVjayB5b3VyIGNvZGUgYXQgJyArIGZpbGVOYW1lICsgJzonICsgbGluZU51bWJlciArICcuJztcbiAgICB9XG5cbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cbi8qKlxuICogV2FybiBpZiB0aGVyZSdzIG5vIGtleSBleHBsaWNpdGx5IHNldCBvbiBkeW5hbWljIGFycmF5cyBvZiBjaGlsZHJlbiBvclxuICogb2JqZWN0IGtleXMgYXJlIG5vdCB2YWxpZC4gVGhpcyBhbGxvd3MgdXMgdG8ga2VlcCB0cmFjayBvZiBjaGlsZHJlbiBiZXR3ZWVuXG4gKiB1cGRhdGVzLlxuICovXG5cblxudmFyIG93bmVySGFzS2V5VXNlV2FybmluZyA9IHt9O1xuXG5mdW5jdGlvbiBnZXRDdXJyZW50Q29tcG9uZW50RXJyb3JJbmZvKHBhcmVudFR5cGUpIHtcbiAge1xuICAgIHZhciBpbmZvID0gZ2V0RGVjbGFyYXRpb25FcnJvckFkZGVuZHVtKCk7XG5cbiAgICBpZiAoIWluZm8pIHtcbiAgICAgIHZhciBwYXJlbnROYW1lID0gdHlwZW9mIHBhcmVudFR5cGUgPT09ICdzdHJpbmcnID8gcGFyZW50VHlwZSA6IHBhcmVudFR5cGUuZGlzcGxheU5hbWUgfHwgcGFyZW50VHlwZS5uYW1lO1xuXG4gICAgICBpZiAocGFyZW50TmFtZSkge1xuICAgICAgICBpbmZvID0gXCJcXG5cXG5DaGVjayB0aGUgdG9wLWxldmVsIHJlbmRlciBjYWxsIHVzaW5nIDxcIiArIHBhcmVudE5hbWUgKyBcIj4uXCI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGluZm87XG4gIH1cbn1cbi8qKlxuICogV2FybiBpZiB0aGUgZWxlbWVudCBkb2Vzbid0IGhhdmUgYW4gZXhwbGljaXQga2V5IGFzc2lnbmVkIHRvIGl0LlxuICogVGhpcyBlbGVtZW50IGlzIGluIGFuIGFycmF5LiBUaGUgYXJyYXkgY291bGQgZ3JvdyBhbmQgc2hyaW5rIG9yIGJlXG4gKiByZW9yZGVyZWQuIEFsbCBjaGlsZHJlbiB0aGF0IGhhdmVuJ3QgYWxyZWFkeSBiZWVuIHZhbGlkYXRlZCBhcmUgcmVxdWlyZWQgdG9cbiAqIGhhdmUgYSBcImtleVwiIHByb3BlcnR5IGFzc2lnbmVkIHRvIGl0LiBFcnJvciBzdGF0dXNlcyBhcmUgY2FjaGVkIHNvIGEgd2FybmluZ1xuICogd2lsbCBvbmx5IGJlIHNob3duIG9uY2UuXG4gKlxuICogQGludGVybmFsXG4gKiBAcGFyYW0ge1JlYWN0RWxlbWVudH0gZWxlbWVudCBFbGVtZW50IHRoYXQgcmVxdWlyZXMgYSBrZXkuXG4gKiBAcGFyYW0geyp9IHBhcmVudFR5cGUgZWxlbWVudCdzIHBhcmVudCdzIHR5cGUuXG4gKi9cblxuXG5mdW5jdGlvbiB2YWxpZGF0ZUV4cGxpY2l0S2V5KGVsZW1lbnQsIHBhcmVudFR5cGUpIHtcbiAge1xuICAgIGlmICghZWxlbWVudC5fc3RvcmUgfHwgZWxlbWVudC5fc3RvcmUudmFsaWRhdGVkIHx8IGVsZW1lbnQua2V5ICE9IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBlbGVtZW50Ll9zdG9yZS52YWxpZGF0ZWQgPSB0cnVlO1xuICAgIHZhciBjdXJyZW50Q29tcG9uZW50RXJyb3JJbmZvID0gZ2V0Q3VycmVudENvbXBvbmVudEVycm9ySW5mbyhwYXJlbnRUeXBlKTtcblxuICAgIGlmIChvd25lckhhc0tleVVzZVdhcm5pbmdbY3VycmVudENvbXBvbmVudEVycm9ySW5mb10pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBvd25lckhhc0tleVVzZVdhcm5pbmdbY3VycmVudENvbXBvbmVudEVycm9ySW5mb10gPSB0cnVlOyAvLyBVc3VhbGx5IHRoZSBjdXJyZW50IG93bmVyIGlzIHRoZSBvZmZlbmRlciwgYnV0IGlmIGl0IGFjY2VwdHMgY2hpbGRyZW4gYXMgYVxuICAgIC8vIHByb3BlcnR5LCBpdCBtYXkgYmUgdGhlIGNyZWF0b3Igb2YgdGhlIGNoaWxkIHRoYXQncyByZXNwb25zaWJsZSBmb3JcbiAgICAvLyBhc3NpZ25pbmcgaXQgYSBrZXkuXG5cbiAgICB2YXIgY2hpbGRPd25lciA9ICcnO1xuXG4gICAgaWYgKGVsZW1lbnQgJiYgZWxlbWVudC5fb3duZXIgJiYgZWxlbWVudC5fb3duZXIgIT09IFJlYWN0Q3VycmVudE93bmVyJDEuY3VycmVudCkge1xuICAgICAgLy8gR2l2ZSB0aGUgY29tcG9uZW50IHRoYXQgb3JpZ2luYWxseSBjcmVhdGVkIHRoaXMgY2hpbGQuXG4gICAgICBjaGlsZE93bmVyID0gXCIgSXQgd2FzIHBhc3NlZCBhIGNoaWxkIGZyb20gXCIgKyBnZXRDb21wb25lbnROYW1lRnJvbVR5cGUoZWxlbWVudC5fb3duZXIudHlwZSkgKyBcIi5cIjtcbiAgICB9XG5cbiAgICBzZXRDdXJyZW50bHlWYWxpZGF0aW5nRWxlbWVudCQxKGVsZW1lbnQpO1xuXG4gICAgZXJyb3IoJ0VhY2ggY2hpbGQgaW4gYSBsaXN0IHNob3VsZCBoYXZlIGEgdW5pcXVlIFwia2V5XCIgcHJvcC4nICsgJyVzJXMgU2VlIGh0dHBzOi8vcmVhY3Rqcy5vcmcvbGluay93YXJuaW5nLWtleXMgZm9yIG1vcmUgaW5mb3JtYXRpb24uJywgY3VycmVudENvbXBvbmVudEVycm9ySW5mbywgY2hpbGRPd25lcik7XG5cbiAgICBzZXRDdXJyZW50bHlWYWxpZGF0aW5nRWxlbWVudCQxKG51bGwpO1xuICB9XG59XG4vKipcbiAqIEVuc3VyZSB0aGF0IGV2ZXJ5IGVsZW1lbnQgZWl0aGVyIGlzIHBhc3NlZCBpbiBhIHN0YXRpYyBsb2NhdGlvbiwgaW4gYW5cbiAqIGFycmF5IHdpdGggYW4gZXhwbGljaXQga2V5cyBwcm9wZXJ0eSBkZWZpbmVkLCBvciBpbiBhbiBvYmplY3QgbGl0ZXJhbFxuICogd2l0aCB2YWxpZCBrZXkgcHJvcGVydHkuXG4gKlxuICogQGludGVybmFsXG4gKiBAcGFyYW0ge1JlYWN0Tm9kZX0gbm9kZSBTdGF0aWNhbGx5IHBhc3NlZCBjaGlsZCBvZiBhbnkgdHlwZS5cbiAqIEBwYXJhbSB7Kn0gcGFyZW50VHlwZSBub2RlJ3MgcGFyZW50J3MgdHlwZS5cbiAqL1xuXG5cbmZ1bmN0aW9uIHZhbGlkYXRlQ2hpbGRLZXlzKG5vZGUsIHBhcmVudFR5cGUpIHtcbiAge1xuICAgIGlmICh0eXBlb2Ygbm9kZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoaXNBcnJheShub2RlKSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2RlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IG5vZGVbaV07XG5cbiAgICAgICAgaWYgKGlzVmFsaWRFbGVtZW50KGNoaWxkKSkge1xuICAgICAgICAgIHZhbGlkYXRlRXhwbGljaXRLZXkoY2hpbGQsIHBhcmVudFR5cGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc1ZhbGlkRWxlbWVudChub2RlKSkge1xuICAgICAgLy8gVGhpcyBlbGVtZW50IHdhcyBwYXNzZWQgaW4gYSB2YWxpZCBsb2NhdGlvbi5cbiAgICAgIGlmIChub2RlLl9zdG9yZSkge1xuICAgICAgICBub2RlLl9zdG9yZS52YWxpZGF0ZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobm9kZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yRm4gPSBnZXRJdGVyYXRvckZuKG5vZGUpO1xuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhdG9yRm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gRW50cnkgaXRlcmF0b3JzIHVzZWQgdG8gcHJvdmlkZSBpbXBsaWNpdCBrZXlzLFxuICAgICAgICAvLyBidXQgbm93IHdlIHByaW50IGEgc2VwYXJhdGUgd2FybmluZyBmb3IgdGhlbSBsYXRlci5cbiAgICAgICAgaWYgKGl0ZXJhdG9yRm4gIT09IG5vZGUuZW50cmllcykge1xuICAgICAgICAgIHZhciBpdGVyYXRvciA9IGl0ZXJhdG9yRm4uY2FsbChub2RlKTtcbiAgICAgICAgICB2YXIgc3RlcDtcblxuICAgICAgICAgIHdoaWxlICghKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmUpIHtcbiAgICAgICAgICAgIGlmIChpc1ZhbGlkRWxlbWVudChzdGVwLnZhbHVlKSkge1xuICAgICAgICAgICAgICB2YWxpZGF0ZUV4cGxpY2l0S2V5KHN0ZXAudmFsdWUsIHBhcmVudFR5cGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuLyoqXG4gKiBHaXZlbiBhbiBlbGVtZW50LCB2YWxpZGF0ZSB0aGF0IGl0cyBwcm9wcyBmb2xsb3cgdGhlIHByb3BUeXBlcyBkZWZpbml0aW9uLFxuICogcHJvdmlkZWQgYnkgdGhlIHR5cGUuXG4gKlxuICogQHBhcmFtIHtSZWFjdEVsZW1lbnR9IGVsZW1lbnRcbiAqL1xuXG5cbmZ1bmN0aW9uIHZhbGlkYXRlUHJvcFR5cGVzKGVsZW1lbnQpIHtcbiAge1xuICAgIHZhciB0eXBlID0gZWxlbWVudC50eXBlO1xuXG4gICAgaWYgKHR5cGUgPT09IG51bGwgfHwgdHlwZSA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBwcm9wVHlwZXM7XG5cbiAgICBpZiAodHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHByb3BUeXBlcyA9IHR5cGUucHJvcFR5cGVzO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHR5cGUgPT09ICdvYmplY3QnICYmICh0eXBlLiQkdHlwZW9mID09PSBSRUFDVF9GT1JXQVJEX1JFRl9UWVBFIHx8IC8vIE5vdGU6IE1lbW8gb25seSBjaGVja3Mgb3V0ZXIgcHJvcHMgaGVyZS5cbiAgICAvLyBJbm5lciBwcm9wcyBhcmUgY2hlY2tlZCBpbiB0aGUgcmVjb25jaWxlci5cbiAgICB0eXBlLiQkdHlwZW9mID09PSBSRUFDVF9NRU1PX1RZUEUpKSB7XG4gICAgICBwcm9wVHlwZXMgPSB0eXBlLnByb3BUeXBlcztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChwcm9wVHlwZXMpIHtcbiAgICAgIC8vIEludGVudGlvbmFsbHkgaW5zaWRlIHRvIGF2b2lkIHRyaWdnZXJpbmcgbGF6eSBpbml0aWFsaXplcnM6XG4gICAgICB2YXIgbmFtZSA9IGdldENvbXBvbmVudE5hbWVGcm9tVHlwZSh0eXBlKTtcbiAgICAgIGNoZWNrUHJvcFR5cGVzKHByb3BUeXBlcywgZWxlbWVudC5wcm9wcywgJ3Byb3AnLCBuYW1lLCBlbGVtZW50KTtcbiAgICB9IGVsc2UgaWYgKHR5cGUuUHJvcFR5cGVzICE9PSB1bmRlZmluZWQgJiYgIXByb3BUeXBlc01pc3NwZWxsV2FybmluZ1Nob3duKSB7XG4gICAgICBwcm9wVHlwZXNNaXNzcGVsbFdhcm5pbmdTaG93biA9IHRydWU7IC8vIEludGVudGlvbmFsbHkgaW5zaWRlIHRvIGF2b2lkIHRyaWdnZXJpbmcgbGF6eSBpbml0aWFsaXplcnM6XG5cbiAgICAgIHZhciBfbmFtZSA9IGdldENvbXBvbmVudE5hbWVGcm9tVHlwZSh0eXBlKTtcblxuICAgICAgZXJyb3IoJ0NvbXBvbmVudCAlcyBkZWNsYXJlZCBgUHJvcFR5cGVzYCBpbnN0ZWFkIG9mIGBwcm9wVHlwZXNgLiBEaWQgeW91IG1pc3NwZWxsIHRoZSBwcm9wZXJ0eSBhc3NpZ25tZW50PycsIF9uYW1lIHx8ICdVbmtub3duJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB0eXBlLmdldERlZmF1bHRQcm9wcyA9PT0gJ2Z1bmN0aW9uJyAmJiAhdHlwZS5nZXREZWZhdWx0UHJvcHMuaXNSZWFjdENsYXNzQXBwcm92ZWQpIHtcbiAgICAgIGVycm9yKCdnZXREZWZhdWx0UHJvcHMgaXMgb25seSB1c2VkIG9uIGNsYXNzaWMgUmVhY3QuY3JlYXRlQ2xhc3MgJyArICdkZWZpbml0aW9ucy4gVXNlIGEgc3RhdGljIHByb3BlcnR5IG5hbWVkIGBkZWZhdWx0UHJvcHNgIGluc3RlYWQuJyk7XG4gICAgfVxuICB9XG59XG4vKipcbiAqIEdpdmVuIGEgZnJhZ21lbnQsIHZhbGlkYXRlIHRoYXQgaXQgY2FuIG9ubHkgYmUgcHJvdmlkZWQgd2l0aCBmcmFnbWVudCBwcm9wc1xuICogQHBhcmFtIHtSZWFjdEVsZW1lbnR9IGZyYWdtZW50XG4gKi9cblxuXG5mdW5jdGlvbiB2YWxpZGF0ZUZyYWdtZW50UHJvcHMoZnJhZ21lbnQpIHtcbiAge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZnJhZ21lbnQucHJvcHMpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXTtcblxuICAgICAgaWYgKGtleSAhPT0gJ2NoaWxkcmVuJyAmJiBrZXkgIT09ICdrZXknKSB7XG4gICAgICAgIHNldEN1cnJlbnRseVZhbGlkYXRpbmdFbGVtZW50JDEoZnJhZ21lbnQpO1xuXG4gICAgICAgIGVycm9yKCdJbnZhbGlkIHByb3AgYCVzYCBzdXBwbGllZCB0byBgUmVhY3QuRnJhZ21lbnRgLiAnICsgJ1JlYWN0LkZyYWdtZW50IGNhbiBvbmx5IGhhdmUgYGtleWAgYW5kIGBjaGlsZHJlbmAgcHJvcHMuJywga2V5KTtcblxuICAgICAgICBzZXRDdXJyZW50bHlWYWxpZGF0aW5nRWxlbWVudCQxKG51bGwpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZnJhZ21lbnQucmVmICE9PSBudWxsKSB7XG4gICAgICBzZXRDdXJyZW50bHlWYWxpZGF0aW5nRWxlbWVudCQxKGZyYWdtZW50KTtcblxuICAgICAgZXJyb3IoJ0ludmFsaWQgYXR0cmlidXRlIGByZWZgIHN1cHBsaWVkIHRvIGBSZWFjdC5GcmFnbWVudGAuJyk7XG5cbiAgICAgIHNldEN1cnJlbnRseVZhbGlkYXRpbmdFbGVtZW50JDEobnVsbCk7XG4gICAgfVxuICB9XG59XG5cbnZhciBkaWRXYXJuQWJvdXRLZXlTcHJlYWQgPSB7fTtcbmZ1bmN0aW9uIGpzeFdpdGhWYWxpZGF0aW9uKHR5cGUsIHByb3BzLCBrZXksIGlzU3RhdGljQ2hpbGRyZW4sIHNvdXJjZSwgc2VsZikge1xuICB7XG4gICAgdmFyIHZhbGlkVHlwZSA9IGlzVmFsaWRFbGVtZW50VHlwZSh0eXBlKTsgLy8gV2Ugd2FybiBpbiB0aGlzIGNhc2UgYnV0IGRvbid0IHRocm93LiBXZSBleHBlY3QgdGhlIGVsZW1lbnQgY3JlYXRpb24gdG9cbiAgICAvLyBzdWNjZWVkIGFuZCB0aGVyZSB3aWxsIGxpa2VseSBiZSBlcnJvcnMgaW4gcmVuZGVyLlxuXG4gICAgaWYgKCF2YWxpZFR5cGUpIHtcbiAgICAgIHZhciBpbmZvID0gJyc7XG5cbiAgICAgIGlmICh0eXBlID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHR5cGUgPT09ICdvYmplY3QnICYmIHR5cGUgIT09IG51bGwgJiYgT2JqZWN0LmtleXModHlwZSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGluZm8gKz0gJyBZb3UgbGlrZWx5IGZvcmdvdCB0byBleHBvcnQgeW91ciBjb21wb25lbnQgZnJvbSB0aGUgZmlsZSAnICsgXCJpdCdzIGRlZmluZWQgaW4sIG9yIHlvdSBtaWdodCBoYXZlIG1peGVkIHVwIGRlZmF1bHQgYW5kIG5hbWVkIGltcG9ydHMuXCI7XG4gICAgICB9XG5cbiAgICAgIHZhciBzb3VyY2VJbmZvID0gZ2V0U291cmNlSW5mb0Vycm9yQWRkZW5kdW0oc291cmNlKTtcblxuICAgICAgaWYgKHNvdXJjZUluZm8pIHtcbiAgICAgICAgaW5mbyArPSBzb3VyY2VJbmZvO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5mbyArPSBnZXREZWNsYXJhdGlvbkVycm9yQWRkZW5kdW0oKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHR5cGVTdHJpbmc7XG5cbiAgICAgIGlmICh0eXBlID09PSBudWxsKSB7XG4gICAgICAgIHR5cGVTdHJpbmcgPSAnbnVsbCc7XG4gICAgICB9IGVsc2UgaWYgKGlzQXJyYXkodHlwZSkpIHtcbiAgICAgICAgdHlwZVN0cmluZyA9ICdhcnJheSc7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgIT09IHVuZGVmaW5lZCAmJiB0eXBlLiQkdHlwZW9mID09PSBSRUFDVF9FTEVNRU5UX1RZUEUpIHtcbiAgICAgICAgdHlwZVN0cmluZyA9IFwiPFwiICsgKGdldENvbXBvbmVudE5hbWVGcm9tVHlwZSh0eXBlLnR5cGUpIHx8ICdVbmtub3duJykgKyBcIiAvPlwiO1xuICAgICAgICBpbmZvID0gJyBEaWQgeW91IGFjY2lkZW50YWxseSBleHBvcnQgYSBKU1ggbGl0ZXJhbCBpbnN0ZWFkIG9mIGEgY29tcG9uZW50Pyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0eXBlU3RyaW5nID0gdHlwZW9mIHR5cGU7XG4gICAgICB9XG5cbiAgICAgIGVycm9yKCdSZWFjdC5qc3g6IHR5cGUgaXMgaW52YWxpZCAtLSBleHBlY3RlZCBhIHN0cmluZyAoZm9yICcgKyAnYnVpbHQtaW4gY29tcG9uZW50cykgb3IgYSBjbGFzcy9mdW5jdGlvbiAoZm9yIGNvbXBvc2l0ZSAnICsgJ2NvbXBvbmVudHMpIGJ1dCBnb3Q6ICVzLiVzJywgdHlwZVN0cmluZywgaW5mbyk7XG4gICAgfVxuXG4gICAgdmFyIGVsZW1lbnQgPSBqc3hERVYodHlwZSwgcHJvcHMsIGtleSwgc291cmNlLCBzZWxmKTsgLy8gVGhlIHJlc3VsdCBjYW4gYmUgbnVsbGlzaCBpZiBhIG1vY2sgb3IgYSBjdXN0b20gZnVuY3Rpb24gaXMgdXNlZC5cbiAgICAvLyBUT0RPOiBEcm9wIHRoaXMgd2hlbiB0aGVzZSBhcmUgbm8gbG9uZ2VyIGFsbG93ZWQgYXMgdGhlIHR5cGUgYXJndW1lbnQuXG5cbiAgICBpZiAoZWxlbWVudCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9IC8vIFNraXAga2V5IHdhcm5pbmcgaWYgdGhlIHR5cGUgaXNuJ3QgdmFsaWQgc2luY2Ugb3VyIGtleSB2YWxpZGF0aW9uIGxvZ2ljXG4gICAgLy8gZG9lc24ndCBleHBlY3QgYSBub24tc3RyaW5nL2Z1bmN0aW9uIHR5cGUgYW5kIGNhbiB0aHJvdyBjb25mdXNpbmcgZXJyb3JzLlxuICAgIC8vIFdlIGRvbid0IHdhbnQgZXhjZXB0aW9uIGJlaGF2aW9yIHRvIGRpZmZlciBiZXR3ZWVuIGRldiBhbmQgcHJvZC5cbiAgICAvLyAoUmVuZGVyaW5nIHdpbGwgdGhyb3cgd2l0aCBhIGhlbHBmdWwgbWVzc2FnZSBhbmQgYXMgc29vbiBhcyB0aGUgdHlwZSBpc1xuICAgIC8vIGZpeGVkLCB0aGUga2V5IHdhcm5pbmdzIHdpbGwgYXBwZWFyLilcblxuXG4gICAgaWYgKHZhbGlkVHlwZSkge1xuICAgICAgdmFyIGNoaWxkcmVuID0gcHJvcHMuY2hpbGRyZW47XG5cbiAgICAgIGlmIChjaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChpc1N0YXRpY0NoaWxkcmVuKSB7XG4gICAgICAgICAgaWYgKGlzQXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIHZhbGlkYXRlQ2hpbGRLZXlzKGNoaWxkcmVuW2ldLCB0eXBlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKE9iamVjdC5mcmVlemUpIHtcbiAgICAgICAgICAgICAgT2JqZWN0LmZyZWV6ZShjaGlsZHJlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVycm9yKCdSZWFjdC5qc3g6IFN0YXRpYyBjaGlsZHJlbiBzaG91bGQgYWx3YXlzIGJlIGFuIGFycmF5LiAnICsgJ1lvdSBhcmUgbGlrZWx5IGV4cGxpY2l0bHkgY2FsbGluZyBSZWFjdC5qc3hzIG9yIFJlYWN0LmpzeERFVi4gJyArICdVc2UgdGhlIEJhYmVsIHRyYW5zZm9ybSBpbnN0ZWFkLicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWxpZGF0ZUNoaWxkS2V5cyhjaGlsZHJlbiwgdHlwZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB7XG4gICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChwcm9wcywgJ2tleScpKSB7XG4gICAgICAgIHZhciBjb21wb25lbnROYW1lID0gZ2V0Q29tcG9uZW50TmFtZUZyb21UeXBlKHR5cGUpO1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHByb3BzKS5maWx0ZXIoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICByZXR1cm4gayAhPT0gJ2tleSc7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgYmVmb3JlRXhhbXBsZSA9IGtleXMubGVuZ3RoID4gMCA/ICd7a2V5OiBzb21lS2V5LCAnICsga2V5cy5qb2luKCc6IC4uLiwgJykgKyAnOiAuLi59JyA6ICd7a2V5OiBzb21lS2V5fSc7XG5cbiAgICAgICAgaWYgKCFkaWRXYXJuQWJvdXRLZXlTcHJlYWRbY29tcG9uZW50TmFtZSArIGJlZm9yZUV4YW1wbGVdKSB7XG4gICAgICAgICAgdmFyIGFmdGVyRXhhbXBsZSA9IGtleXMubGVuZ3RoID4gMCA/ICd7JyArIGtleXMuam9pbignOiAuLi4sICcpICsgJzogLi4ufScgOiAne30nO1xuXG4gICAgICAgICAgZXJyb3IoJ0EgcHJvcHMgb2JqZWN0IGNvbnRhaW5pbmcgYSBcImtleVwiIHByb3AgaXMgYmVpbmcgc3ByZWFkIGludG8gSlNYOlxcbicgKyAnICBsZXQgcHJvcHMgPSAlcztcXG4nICsgJyAgPCVzIHsuLi5wcm9wc30gLz5cXG4nICsgJ1JlYWN0IGtleXMgbXVzdCBiZSBwYXNzZWQgZGlyZWN0bHkgdG8gSlNYIHdpdGhvdXQgdXNpbmcgc3ByZWFkOlxcbicgKyAnICBsZXQgcHJvcHMgPSAlcztcXG4nICsgJyAgPCVzIGtleT17c29tZUtleX0gey4uLnByb3BzfSAvPicsIGJlZm9yZUV4YW1wbGUsIGNvbXBvbmVudE5hbWUsIGFmdGVyRXhhbXBsZSwgY29tcG9uZW50TmFtZSk7XG5cbiAgICAgICAgICBkaWRXYXJuQWJvdXRLZXlTcHJlYWRbY29tcG9uZW50TmFtZSArIGJlZm9yZUV4YW1wbGVdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlID09PSBSRUFDVF9GUkFHTUVOVF9UWVBFKSB7XG4gICAgICB2YWxpZGF0ZUZyYWdtZW50UHJvcHMoZWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbGlkYXRlUHJvcFR5cGVzKGVsZW1lbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBlbGVtZW50O1xuICB9XG59IC8vIFRoZXNlIHR3byBmdW5jdGlvbnMgZXhpc3QgdG8gc3RpbGwgZ2V0IGNoaWxkIHdhcm5pbmdzIGluIGRldlxuLy8gZXZlbiB3aXRoIHRoZSBwcm9kIHRyYW5zZm9ybS4gVGhpcyBtZWFucyB0aGF0IGpzeERFViBpcyBwdXJlbHlcbi8vIG9wdC1pbiBiZWhhdmlvciBmb3IgYmV0dGVyIG1lc3NhZ2VzIGJ1dCB0aGF0IHdlIHdvbid0IHN0b3Bcbi8vIGdpdmluZyB5b3Ugd2FybmluZ3MgaWYgeW91IHVzZSBwcm9kdWN0aW9uIGFwaXMuXG5cbmZ1bmN0aW9uIGpzeFdpdGhWYWxpZGF0aW9uU3RhdGljKHR5cGUsIHByb3BzLCBrZXkpIHtcbiAge1xuICAgIHJldHVybiBqc3hXaXRoVmFsaWRhdGlvbih0eXBlLCBwcm9wcywga2V5LCB0cnVlKTtcbiAgfVxufVxuZnVuY3Rpb24ganN4V2l0aFZhbGlkYXRpb25EeW5hbWljKHR5cGUsIHByb3BzLCBrZXkpIHtcbiAge1xuICAgIHJldHVybiBqc3hXaXRoVmFsaWRhdGlvbih0eXBlLCBwcm9wcywga2V5LCBmYWxzZSk7XG4gIH1cbn1cblxudmFyIGpzeCA9ICBqc3hXaXRoVmFsaWRhdGlvbkR5bmFtaWMgOyAvLyB3ZSBtYXkgd2FudCB0byBzcGVjaWFsIGNhc2UganN4cyBpbnRlcm5hbGx5IHRvIHRha2UgYWR2YW50YWdlIG9mIHN0YXRpYyBjaGlsZHJlbi5cbi8vIGZvciBub3cgd2UgY2FuIHNoaXAgaWRlbnRpY2FsIHByb2QgZnVuY3Rpb25zXG5cbnZhciBqc3hzID0gIGpzeFdpdGhWYWxpZGF0aW9uU3RhdGljIDtcblxuZXhwb3J0cy5GcmFnbWVudCA9IFJFQUNUX0ZSQUdNRU5UX1RZUEU7XG5leHBvcnRzLmpzeCA9IGpzeDtcbmV4cG9ydHMuanN4cyA9IGpzeHM7XG4gIH0pKCk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9janMvcmVhY3QtanN4LXJ1bnRpbWUucHJvZHVjdGlvbi5taW4uanMnKTtcbn0gZWxzZSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9janMvcmVhY3QtanN4LXJ1bnRpbWUuZGV2ZWxvcG1lbnQuanMnKTtcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gUmVzdG9yZUJhY2t1cDtcbmNvbnN0IGpzeF9ydW50aW1lXzEgPSByZXF1aXJlKFwicmVhY3QvanN4LXJ1bnRpbWVcIik7XG5jb25zdCByZWFjdF8xID0gcmVxdWlyZShcInJlYWN0XCIpO1xuY29uc3QgYWRtaW5qc18xID0gcmVxdWlyZShcImFkbWluanNcIik7XG5jb25zdCBkZXNpZ25fc3lzdGVtXzEgPSByZXF1aXJlKFwiQGFkbWluanMvZGVzaWduLXN5c3RlbVwiKTtcbmNvbnN0IGFwaSA9IG5ldyBhZG1pbmpzXzEuQXBpQ2xpZW50KCk7XG5mdW5jdGlvbiBSZXN0b3JlQmFja3VwKHByb3BzKSB7XG4gICAgY29uc3QgeyByZXNvdXJjZSB9ID0gcHJvcHM7XG4gICAgY29uc3QgYWRkTm90aWNlID0gKDAsIGFkbWluanNfMS51c2VOb3RpY2UpKCk7XG4gICAgY29uc3QgW2JhY2t1cEpzb24sIHNldEJhY2t1cEpzb25dID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKCcnKTtcbiAgICBjb25zdCBbcmVzdG9yaW5nLCBzZXRSZXN0b3JpbmddID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKGZhbHNlKTtcbiAgICBjb25zdCBoYW5kbGVGaWxlID0gYXN5bmMgKGUpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IGUudGFyZ2V0LmZpbGVzPy5bMF07XG4gICAgICAgIGlmICghZmlsZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IGZpbGUudGV4dCgpO1xuICAgICAgICBzZXRCYWNrdXBKc29uKHRleHQpO1xuICAgIH07XG4gICAgY29uc3QgaGFuZGxlU3VibWl0ID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIWJhY2t1cEpzb24udHJpbSgpKSB7XG4gICAgICAgICAgICBhZGROb3RpY2UoeyBtZXNzYWdlOiAn0JLRi9Cx0LXRgNC40YLQtSDRhNCw0LnQuyDQuNC70Lgg0LLRgdGC0LDQstGM0YLQtSBKU09OINCx0Y3QutCw0L/QsCcsIHR5cGU6ICdlcnJvcicgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2V0UmVzdG9yaW5nKHRydWUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucmVzb3VyY2VBY3Rpb24oe1xuICAgICAgICAgICAgICAgIHJlc291cmNlSWQ6IHJlc291cmNlLmlkLFxuICAgICAgICAgICAgICAgIGFjdGlvbk5hbWU6ICdyZXN0b3JlJyxcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgICAgICAgICAgICBkYXRhOiB7IGJhY2t1cEpzb24gfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3Qgbm90aWNlID0gcmVzcG9uc2UuZGF0YT8ubm90aWNlO1xuICAgICAgICAgICAgaWYgKG5vdGljZSlcbiAgICAgICAgICAgICAgICBhZGROb3RpY2Uobm90aWNlKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGFkZE5vdGljZSh7IG1lc3NhZ2U6IGVycm9yPy5tZXNzYWdlIHx8ICdSZXN0b3JlIGZhaWxlZCcsIHR5cGU6ICdlcnJvcicgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRSZXN0b3JpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gKCgwLCBqc3hfcnVudGltZV8xLmpzeHMpKGRlc2lnbl9zeXN0ZW1fMS5Cb3gsIHsgdmFyaWFudDogXCJncmV5XCIsIGNoaWxkcmVuOiBbKDAsIGpzeF9ydW50aW1lXzEuanN4KShkZXNpZ25fc3lzdGVtXzEuVGV4dCwgeyBtYjogXCJtZFwiLCBjaGlsZHJlbjogXCJcXHUwNDEyXFx1MDQzRVxcdTA0NDFcXHUwNDQxXFx1MDQ0MlxcdTA0MzBcXHUwNDNEXFx1MDQzRVxcdTA0MzJcXHUwNDNCXFx1MDQzNVxcdTA0M0RcXHUwNDM4XFx1MDQzNTogXFx1MDQzMlxcdTA0NEJcXHUwNDMxXFx1MDQzNVxcdTA0NDBcXHUwNDM4XFx1MDQ0MlxcdTA0MzUgXFx1MDQ0NFxcdTA0MzBcXHUwNDM5XFx1MDQzQiBcXHUwNDQxIEpTT04tXFx1MDQzMVxcdTA0NERcXHUwNDNBXFx1MDQzMFxcdTA0M0ZcXHUwNDNFXFx1MDQzQyBcXHUwNDM4XFx1MDQzQlxcdTA0MzggXFx1MDQzMlxcdTA0NDFcXHUwNDQyXFx1MDQzMFxcdTA0MzJcXHUwNDRDXFx1MDQ0MlxcdTA0MzUgXFx1MDQ0MVxcdTA0M0VcXHUwNDM0XFx1MDQzNVxcdTA0NDBcXHUwNDM2XFx1MDQzOFxcdTA0M0NcXHUwNDNFXFx1MDQzNSBcXHUwNDMyXFx1MDQ0MFxcdTA0NDNcXHUwNDQ3XFx1MDQzRFxcdTA0NDNcXHUwNDRFLiBcXHUwNDE0XFx1MDQzMFxcdTA0M0RcXHUwNDNEXFx1MDQ0QlxcdTA0MzUgXFx1MDQzMVxcdTA0NDNcXHUwNDM0XFx1MDQ0M1xcdTA0NDIgXFx1MDQzRlxcdTA0MzVcXHUwNDQwXFx1MDQzNVxcdTA0MzdcXHUwNDMwXFx1MDQzRlxcdTA0MzhcXHUwNDQxXFx1MDQzMFxcdTA0M0RcXHUwNDRCLlwiIH0pLCAoMCwganN4X3J1bnRpbWVfMS5qc3hzKShcImxhYmVsXCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIG1hcmdpbkJvdHRvbTogMTIgfSwgY2hpbGRyZW46IFsoMCwganN4X3J1bnRpbWVfMS5qc3gpKGRlc2lnbl9zeXN0ZW1fMS5CdXR0b24sIHsgYXM6IFwic3BhblwiLCB2YXJpYW50OiBcInByaW1hcnlcIiwgc2l6ZTogXCJzbVwiLCBjaGlsZHJlbjogXCJcXHUwNDEyXFx1MDQ0QlxcdTA0MzFcXHUwNDQwXFx1MDQzMFxcdTA0NDJcXHUwNDRDIFxcdTA0NDRcXHUwNDMwXFx1MDQzOVxcdTA0M0JcIiB9KSwgKDAsIGpzeF9ydW50aW1lXzEuanN4KShcImlucHV0XCIsIHsgdHlwZTogXCJmaWxlXCIsIGFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsIG9uQ2hhbmdlOiBoYW5kbGVGaWxlLCBzdHlsZTogeyBkaXNwbGF5OiAnbm9uZScgfSB9KV0gfSksICgwLCBqc3hfcnVudGltZV8xLmpzeCkoZGVzaWduX3N5c3RlbV8xLlRleHRBcmVhLCB7IHdpZHRoOiBcIjEwMCVcIiwgbWluSGVpZ2h0OiBcIjMyMHB4XCIsIG9uQ2hhbmdlOiAoZSkgPT4gc2V0QmFja3VwSnNvbihlLnRhcmdldC52YWx1ZSksIHZhbHVlOiBiYWNrdXBKc29uLCBwbGFjZWhvbGRlcjogJ3sgXCJzYW1wbGVzXCI6IFsuLi5dLCBcInN0cmFpbnNcIjogWy4uLl0gfScgfSksICgwLCBqc3hfcnVudGltZV8xLmpzeCkoZGVzaWduX3N5c3RlbV8xLkJ1dHRvbiwgeyBtdDogXCJsZ1wiLCB2YXJpYW50OiBcInByaW1hcnlcIiwgb25DbGljazogaGFuZGxlU3VibWl0LCBkaXNhYmxlZDogcmVzdG9yaW5nLCBjaGlsZHJlbjogcmVzdG9yaW5nID8gJ9CS0L7RgdGB0YLQsNC90L7QstC70LXQvdC40LUuLi4nIDogJ9CS0L7RgdGB0YLQsNC90L7QstC40YLRjCcgfSldIH0pKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlc3RvcmUtYmFja3VwLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gQmFja3VwRGF0YWJhc2U7XG5jb25zdCBqc3hfcnVudGltZV8xID0gcmVxdWlyZShcInJlYWN0L2pzeC1ydW50aW1lXCIpO1xuY29uc3QgcmVhY3RfMSA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcbmNvbnN0IGFkbWluanNfMSA9IHJlcXVpcmUoXCJhZG1pbmpzXCIpO1xuY29uc3QgZGVzaWduX3N5c3RlbV8xID0gcmVxdWlyZShcIkBhZG1pbmpzL2Rlc2lnbi1zeXN0ZW1cIik7XG5jb25zdCBhcGkgPSBuZXcgYWRtaW5qc18xLkFwaUNsaWVudCgpO1xuZnVuY3Rpb24gQmFja3VwRGF0YWJhc2UocHJvcHMpIHtcbiAgICBjb25zdCB7IHJlc291cmNlIH0gPSBwcm9wcztcbiAgICBjb25zdCBhZGROb3RpY2UgPSAoMCwgYWRtaW5qc18xLnVzZU5vdGljZSkoKTtcbiAgICBjb25zdCBbYmFja3VwSnNvbiwgc2V0QmFja3VwSnNvbl0gPSAoMCwgcmVhY3RfMS51c2VTdGF0ZSkoJycpO1xuICAgIGNvbnN0IFtjcmVhdGluZywgc2V0Q3JlYXRpbmddID0gKDAsIHJlYWN0XzEudXNlU3RhdGUpKGZhbHNlKTtcbiAgICBjb25zdCBoYW5kbGVDcmVhdGUgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHNldENyZWF0aW5nKHRydWUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucmVzb3VyY2VBY3Rpb24oe1xuICAgICAgICAgICAgICAgIHJlc291cmNlSWQ6IHJlc291cmNlLmlkLFxuICAgICAgICAgICAgICAgIGFjdGlvbk5hbWU6ICdiYWNrdXAnLFxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCBub3RpY2UgPSByZXNwb25zZS5kYXRhPy5ub3RpY2U7XG4gICAgICAgICAgICBpZiAobm90aWNlKVxuICAgICAgICAgICAgICAgIGFkZE5vdGljZShub3RpY2UpO1xuICAgICAgICAgICAgY29uc3QganNvbiA9IHJlc3BvbnNlLmRhdGE/LmJhY2t1cDtcbiAgICAgICAgICAgIGlmIChqc29uKSB7XG4gICAgICAgICAgICAgICAgc2V0QmFja3VwSnNvbihqc29uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGFkZE5vdGljZSh7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyb3I/Lm1lc3NhZ2UgfHwgJ9Cd0LUg0YPQtNCw0LvQvtGB0Ywg0YHQvtC30LTQsNGC0Ywg0LHRjdC60LDQvycsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0Q3JlYXRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVEb3dubG9hZCA9ICgpID0+IHtcbiAgICAgICAgaWYgKCFiYWNrdXBKc29uKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2JhY2t1cEpzb25dLCB7IHR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyB9KTtcbiAgICAgICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgYS5ocmVmID0gdXJsO1xuICAgICAgICBhLmRvd25sb2FkID0gYGJhY2t1cC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5yZXBsYWNlKC9bOl0vZywgJy0nKX0uanNvbmA7XG4gICAgICAgIGEuY2xpY2soKTtcbiAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xuICAgIH07XG4gICAgY29uc3QgaGFuZGxlQ29weSA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFiYWNrdXBKc29uKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoYmFja3VwSnNvbik7XG4gICAgICAgICAgICBhZGROb3RpY2Uoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICfQkdGN0LrQsNC/INGB0LrQvtC/0LjRgNC+0LLQsNC9INCyINCx0YPRhNC10YAg0L7QsdC80LXQvdCwJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICBhZGROb3RpY2Uoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICfQndC1INGD0LTQsNC70L7RgdGMINGB0LrQvtC/0LjRgNC+0LLQsNGC0YwnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuICgoMCwganN4X3J1bnRpbWVfMS5qc3hzKShkZXNpZ25fc3lzdGVtXzEuQm94LCB7IHZhcmlhbnQ6IFwiZ3JleVwiLCBjaGlsZHJlbjogWygwLCBqc3hfcnVudGltZV8xLmpzeCkoZGVzaWduX3N5c3RlbV8xLlRleHQsIHsgbWI6IFwibWRcIiwgY2hpbGRyZW46IFwiXFx1MDQyMVxcdTA0M0VcXHUwNDM3XFx1MDQzNFxcdTA0MzBcXHUwNDM5XFx1MDQ0MlxcdTA0MzUgXFx1MDQzMVxcdTA0NERcXHUwNDNBXFx1MDQzMFxcdTA0M0YgXFx1MDQzOCBcXHUwNDQxXFx1MDQzRVxcdTA0NDVcXHUwNDQwXFx1MDQzMFxcdTA0M0RcXHUwNDM4XFx1MDQ0MlxcdTA0MzUgXFx1MDQzNVxcdTA0MzNcXHUwNDNFIFxcdTA0M0FcXHUwNDMwXFx1MDQzQSBKU09OIChcXHUwNDQxXFx1MDQzQVxcdTA0MzBcXHUwNDQ3XFx1MDQzMFxcdTA0MzlcXHUwNDQyXFx1MDQzNSBcXHUwNDQ0XFx1MDQzMFxcdTA0MzlcXHUwNDNCIFxcdTA0MzhcXHUwNDNCXFx1MDQzOCBcXHUwNDQxXFx1MDQzQVxcdTA0M0VcXHUwNDNGXFx1MDQzOFxcdTA0NDBcXHUwNDQzXFx1MDQzOVxcdTA0NDJcXHUwNDM1IFxcdTA0NDFcXHUwNDNFXFx1MDQzNFxcdTA0MzVcXHUwNDQwXFx1MDQzNlxcdTA0MzhcXHUwNDNDXFx1MDQzRVxcdTA0MzUpLlwiIH0pLCAoMCwganN4X3J1bnRpbWVfMS5qc3gpKGRlc2lnbl9zeXN0ZW1fMS5CdXR0b24sIHsgdmFyaWFudDogXCJwcmltYXJ5XCIsIHNpemU6IFwic21cIiwgb25DbGljazogaGFuZGxlQ3JlYXRlLCBkaXNhYmxlZDogY3JlYXRpbmcsIG1yOiBcIm1kXCIsIGNoaWxkcmVuOiBjcmVhdGluZyA/ICfQodC+0LfQtNCw0ZHQvOKApicgOiAn0KHQvtC30LTQsNGC0Ywg0LHRjdC60LDQvycgfSksICgwLCBqc3hfcnVudGltZV8xLmpzeCkoZGVzaWduX3N5c3RlbV8xLkJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBzaXplOiBcInNtXCIsIG9uQ2xpY2s6IGhhbmRsZURvd25sb2FkLCBkaXNhYmxlZDogIWJhY2t1cEpzb24sIG1yOiBcInNtXCIsIGNoaWxkcmVuOiBcIlxcdTA0MjFcXHUwNDNBXFx1MDQzMFxcdTA0NDdcXHUwNDMwXFx1MDQ0MlxcdTA0NEMgSlNPTlwiIH0pLCAoMCwganN4X3J1bnRpbWVfMS5qc3gpKGRlc2lnbl9zeXN0ZW1fMS5CdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgc2l6ZTogXCJzbVwiLCBvbkNsaWNrOiBoYW5kbGVDb3B5LCBkaXNhYmxlZDogIWJhY2t1cEpzb24sIGNoaWxkcmVuOiBcIlxcdTA0MUFcXHUwNDNFXFx1MDQzRlxcdTA0MzhcXHUwNDQwXFx1MDQzRVxcdTA0MzJcXHUwNDMwXFx1MDQ0MlxcdTA0NENcIiB9KSwgKDAsIGpzeF9ydW50aW1lXzEuanN4KShkZXNpZ25fc3lzdGVtXzEuVGV4dEFyZWEsIHsgbXQ6IFwibGdcIiwgd2lkdGg6IFwiMTAwJVwiLCBtaW5IZWlnaHQ6IFwiMzIwcHhcIiwgb25DaGFuZ2U6IChlKSA9PiBzZXRCYWNrdXBKc29uKGUudGFyZ2V0LnZhbHVlKSwgdmFsdWU6IGJhY2t1cEpzb24sIHBsYWNlaG9sZGVyOiBcIlxcdTA0MjBcXHUwNDM1XFx1MDQzN1xcdTA0NDNcXHUwNDNCXFx1MDQ0Q1xcdTA0NDJcXHUwNDMwXFx1MDQ0MiBcXHUwNDMxXFx1MDQ0RFxcdTA0M0FcXHUwNDMwXFx1MDQzRlxcdTA0MzAgXFx1MDQzRlxcdTA0M0VcXHUwNDRGXFx1MDQzMlxcdTA0MzhcXHUwNDQyXFx1MDQ0MVxcdTA0NEYgXFx1MDQzN1xcdTA0MzRcXHUwNDM1XFx1MDQ0MVxcdTA0NENcIiwgcmVhZE9ubHk6IHRydWUgfSldIH0pKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJhY2t1cC1kYXRhYmFzZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHJlYWN0XzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcInJlYWN0XCIpKTtcbmNvbnN0IGRlc2lnbl9zeXN0ZW1fMSA9IHJlcXVpcmUoXCJAYWRtaW5qcy9kZXNpZ24tc3lzdGVtXCIpO1xuY29uc3QgU1VCSkVDVFMgPSBbXG4gICAgJ1N0cmFpbicsXG4gICAgJ1NhbXBsZScsXG4gICAgJ1N0b3JhZ2UnLFxuICAgICdNZWRpYScsXG4gICAgJ01ldGhvZCcsXG4gICAgJ1RyYWl0RGVmaW5pdGlvbicsXG4gICAgJ1NldHRpbmdzJyxcbiAgICAnTGVnZW5kJyxcbiAgICAnV2lraScsXG4gICAgJ0FuYWx5dGljcycsXG4gICAgJ1VzZXInLFxuICAgICdHcm91cCcsXG4gICAgJ0F1ZGl0TG9nJyxcbiAgICAnUGhvdG8nLFxuICAgICdhbGwnLFxuXTtcbmNvbnN0IEFDVElPTlMgPSBbJ3JlYWQnLCAnY3JlYXRlJywgJ3VwZGF0ZScsICdkZWxldGUnLCAnbWFuYWdlJ107XG5jb25zdCBlbnN1cmVBcnJheSA9ICh2YWx1ZSkgPT4gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZS5maWx0ZXIoKHYpID0+IHR5cGVvZiB2ID09PSAnc3RyaW5nJykgOiBbXTtcbmNvbnN0IFBlcm1pc3Npb25zR3JpZCA9IChwcm9wcykgPT4ge1xuICAgIGNvbnN0IHsgb25DaGFuZ2UsIHByb3BlcnR5LCByZWNvcmQgfSA9IHByb3BzO1xuICAgIGNvbnN0IHZhbHVlID0gcmVhY3RfMS5kZWZhdWx0LnVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJhbXMgPSByZWNvcmQ/LnBhcmFtcyA/PyB7fTtcbiAgICAgICAgaWYgKHBhcmFtc1twcm9wZXJ0eS5wYXRoXSAmJiB0eXBlb2YgcGFyYW1zW3Byb3BlcnR5LnBhdGhdID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgcmV0dXJuIHBhcmFtc1twcm9wZXJ0eS5wYXRoXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICAgICAgT2JqZWN0LmtleXMocGFyYW1zKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIGlmIChrZXkuc3RhcnRzV2l0aChgJHtwcm9wZXJ0eS5wYXRofS5gKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnRzID0ga2V5LnNsaWNlKHByb3BlcnR5LnBhdGgubGVuZ3RoICsgMSkuc3BsaXQoJy4nKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJqZWN0ID0gcGFydHNbMF07XG4gICAgICAgICAgICAgICAgaWYgKFNVQkpFQ1RTLmluY2x1ZGVzKHN1YmplY3QpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0W3N1YmplY3RdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbc3ViamVjdF0gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJhbVZhbHVlID0gcGFyYW1zW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW1WYWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtzdWJqZWN0XT8ucHVzaChwYXJhbVZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgW3JlY29yZCwgcHJvcGVydHkucGF0aF0pO1xuICAgIGNvbnN0IHRvZ2dsZSA9IChzdWJqZWN0LCBhY3Rpb24pID0+IHtcbiAgICAgICAgaWYgKCFvbkNoYW5nZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IG5ldyBTZXQoZW5zdXJlQXJyYXkodmFsdWVbc3ViamVjdF0pKTtcbiAgICAgICAgaWYgKGN1cnJlbnQuaGFzKGFjdGlvbikpIHtcbiAgICAgICAgICAgIGN1cnJlbnQuZGVsZXRlKGFjdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjdXJyZW50LmFkZChhY3Rpb24pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5leHQgPSB7IC4uLnZhbHVlLCBbc3ViamVjdF06IEFycmF5LmZyb20oY3VycmVudCkgfTtcbiAgICAgICAgb25DaGFuZ2UocHJvcGVydHkucGF0aCwgbmV4dCk7XG4gICAgfTtcbiAgICByZXR1cm4gcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoZGVzaWduX3N5c3RlbV8xLkJveCwgeyB2YXJpYW50OiAnZ3JleScgfSwgW1xuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChkZXNpZ25fc3lzdGVtXzEuVGV4dCwgeyBrZXk6ICd0aXRsZScsIG1iOiAnc20nLCBmb250V2VpZ2h0OiAnYm9sZCcgfSwgJ1Blcm1pc3Npb25zIE1hdHJpeCcpLFxuICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChkZXNpZ25fc3lzdGVtXzEuQm94LCB7XG4gICAgICAgICAgICBrZXk6ICdncmlkJyxcbiAgICAgICAgICAgIGRpc3BsYXk6ICdncmlkJyxcbiAgICAgICAgICAgIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICcxNjBweCByZXBlYXQoNSwgMWZyKScsXG4gICAgICAgICAgICBncmlkUm93R2FwOiAnbWQnLFxuICAgICAgICAgICAgZ3JpZENvbHVtbkdhcDogJ21kJyxcbiAgICAgICAgfSwgW1xuICAgICAgICAgICAgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoZGVzaWduX3N5c3RlbV8xLkJveCwgeyBrZXk6ICdlbXB0eScgfSksXG4gICAgICAgICAgICAuLi5BQ1RJT05TLm1hcCgoYWN0aW9uKSA9PiByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChkZXNpZ25fc3lzdGVtXzEuTGFiZWwsIHsga2V5OiBhY3Rpb24sIHN0eWxlOiB7IHRleHRBbGlnbjogJ2NlbnRlcicgfSB9LCBhY3Rpb24pKSxcbiAgICAgICAgICAgIC4uLlNVQkpFQ1RTLmZsYXRNYXAoKHN1YmplY3QpID0+IFtcbiAgICAgICAgICAgICAgICByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChkZXNpZ25fc3lzdGVtXzEuQm94LCB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogYCR7c3ViamVjdH0tbGFiZWxgLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICBnYXA6ICd4cycsXG4gICAgICAgICAgICAgICAgfSwgcmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoZGVzaWduX3N5c3RlbV8xLkJhZGdlLCB7IHZhcmlhbnQ6ICdpbmZvJyB9LCBzdWJqZWN0KSksXG4gICAgICAgICAgICAgICAgLi4uQUNUSU9OUy5tYXAoKGFjdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGVja2VkID0gZW5zdXJlQXJyYXkodmFsdWVbc3ViamVjdF0pLmluY2x1ZGVzKGFjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWFjdF8xLmRlZmF1bHQuY3JlYXRlRWxlbWVudChkZXNpZ25fc3lzdGVtXzEuQm94LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGAke3N1YmplY3R9LSR7YWN0aW9ufWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIH0sIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KGRlc2lnbl9zeXN0ZW1fMS5DaGVja0JveCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGAke3N1YmplY3R9LSR7YWN0aW9ufWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6ICgpID0+IHRvZ2dsZShzdWJqZWN0LCBhY3Rpb24pLFxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgXSksXG4gICAgICAgIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KGRlc2lnbl9zeXN0ZW1fMS5UZXh0LCB7IGtleTogJ2hpbnQnLCBtdDogJ21kJywgZm9udFNpemU6IDEyLCBjb2xvcjogJ2dyZXk2MCcgfSwgJ1RpcDogY2hlY2tpbmcgYWxsICsgbWFuYWdlIGdyYW50cyBmdWxsIGFjY2VzcyBmb3IgYSBzdWJqZWN0LiBVc2UgdGhlIGNoZWNrYm94ZXMgdG8gdG9nZ2xlIGFsbG93ZWQgYWN0aW9ucy4nKSxcbiAgICBdKTtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBQZXJtaXNzaW9uc0dyaWQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wZXJtaXNzaW9ucy1ncmlkLmpzLm1hcCIsIkFkbWluSlMuVXNlckNvbXBvbmVudHMgPSB7fVxuaW1wb3J0IERhc2hib2FyZCBmcm9tICcuLi9kaXN0L3NyYy9hZG1pbi9jb21wb25lbnRzL2Rhc2hib2FyZCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuRGFzaGJvYXJkID0gRGFzaGJvYXJkXG5pbXBvcnQgSnNvblNob3cgZnJvbSAnLi4vZGlzdC9zcmMvYWRtaW4vY29tcG9uZW50cy9qc29uLXNob3cnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkpzb25TaG93ID0gSnNvblNob3dcbmltcG9ydCBSZXN0b3JlQmFja3VwIGZyb20gJy4uL2Rpc3Qvc3JjL2FkbWluL2NvbXBvbmVudHMvcmVzdG9yZS1iYWNrdXAnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlJlc3RvcmVCYWNrdXAgPSBSZXN0b3JlQmFja3VwXG5pbXBvcnQgQmFja3VwRGF0YWJhc2UgZnJvbSAnLi4vZGlzdC9zcmMvYWRtaW4vY29tcG9uZW50cy9iYWNrdXAtZGF0YWJhc2UnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkJhY2t1cERhdGFiYXNlID0gQmFja3VwRGF0YWJhc2VcbmltcG9ydCBQZXJtaXNzaW9uc0dyaWQgZnJvbSAnLi4vZGlzdC9zcmMvYWRtaW4vY29tcG9uZW50cy9wZXJtaXNzaW9ucy1ncmlkJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5QZXJtaXNzaW9uc0dyaWQgPSBQZXJtaXNzaW9uc0dyaWQiXSwibmFtZXMiOlsiZGFzaGJvYXJkIiwidmFsdWUiLCJfX2ltcG9ydERlZmF1bHQiLCJyZXF1aXJlJCQwIiwiZGVzaWduX3N5c3RlbV8xIiwicmVxdWlyZSQkMSIsIkRhc2hib2FyZCIsInJlYWN0XzEiLCJkZWZhdWx0IiwiY3JlYXRlRWxlbWVudCIsIkJveCIsInZhcmlhbnQiLCJwIiwiSDIiLCJrZXkiLCJtYiIsIlRleHQiLCJkaXNwbGF5IiwiZ2FwIiwiYmciLCJib3hTaGFkb3ciLCJib3JkZXJSYWRpdXMiLCJmb250V2VpZ2h0IiwiZm9udFNpemUiLCJtdCIsIkJ1dHRvbiIsImFzIiwiaHJlZiIsImRlZmluZVByb3BlcnR5IiwianNvblNob3ciLCJwcm9wcyIsInJlY29yZCIsInByb3BlcnR5IiwicGFyYW1zIiwicGF0aCIsImhhc0tleXMiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsInN0YXJ0c1dpdGgiLCJwcmVmaXgiLCJvYmoiLCJzbGljZSIsImxlbmd0aCIsIkpTT04iLCJ0cmltIiwicGFyc2VkIiwicGFyc2UiLCJkaXNwbGF5VmFsdWUiLCJzdHJpbmdpZnkiLCJqc3hSdW50aW1lTW9kdWxlIiwiX2RlZmF1bHQiLCJyZXN0b3JlQmFja3VwIiwiUmVzdG9yZUJhY2t1cCIsImpzeF9ydW50aW1lXzEiLCJhZG1pbmpzXzEiLCJyZXF1aXJlJCQyIiwicmVxdWlyZSQkMyIsIkFwaUNsaWVudCIsInJlc291cmNlIiwiYWRkTm90aWNlIiwidXNlTm90aWNlIiwiYmFja3VwSnNvbiIsInNldEJhY2t1cEpzb24iLCJyZXN0b3JpbmciLCJzZXRSZXN0b3JpbmciLCJ1c2VTdGF0ZSIsImhhbmRsZUZpbGUiLCJmaWxlIiwiZSIsInRhcmdldCIsImZpbGVzIiwidGV4dCIsIm1lc3NhZ2UiLCJyZXNwb25zZSIsImFwaSIsInJlc291cmNlQWN0aW9uIiwicmVzb3VyY2VJZCIsImlkIiwiYWN0aW9uTmFtZSIsImRhdGEiLCJub3RpY2UiLCJlcnJvciIsImJhY2t1cERhdGFiYXNlIiwiQmFja3VwRGF0YWJhc2UiLCJzZXRDcmVhdGluZyIsIm1ldGhvZCIsImpzb24iLCJ0eXBlIiwiaGFuZGxlRG93bmxvYWQiLCJibG9iIiwiQmxvYiIsInVybCIsIlVSTCIsImNyZWF0ZU9iamVjdFVSTCIsImEiLCJkb2N1bWVudCIsImRvd25sb2FkIiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwicmVwbGFjZSIsInJldm9rZU9iamVjdFVSTCIsIm5hdmlnYXRvciIsImNsaXBib2FyZCIsIndyaXRlVGV4dCIsInBlcm1pc3Npb25zR3JpZCIsIlNVQkpFQ1RTIiwiQXJyYXkiLCJpc0FycmF5IiwiZmlsdGVyIiwib25DaGFuZ2UiLCJ1c2VNZW1vIiwicGFydHMiLCJzcGxpdCIsInN1YmplY3QiLCJpbmNsdWRlcyIsInJlc3VsdCIsInBhcmFtVmFsdWUiLCJwdXNoIiwidG9nZ2xlIiwiYWN0aW9uIiwiY3VycmVudCIsIlNldCIsImVuc3VyZUFycmF5IiwiaGFzIiwiZGVsZXRlIiwiYWRkIiwibmV4dCIsImZyb20iLCJncmlkVGVtcGxhdGVDb2x1bW5zIiwiZ3JpZFJvd0dhcCIsIm1hcCIsIkxhYmVsIiwic3R5bGUiLCJ0ZXh0QWxpZ24iLCJmbGF0TWFwIiwiQWRtaW5KUyIsIlVzZXJDb21wb25lbnRzIiwiSnNvblNob3ciLCJQZXJtaXNzaW9uc0dyaWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQUFBLE1BQUEsQ0FBQSxjQUFBLENBQUFBLFNBQUEsRUFBQSxZQUNJLEVBQUE7Q0FBQUMsRUFBQUEsS0FBQSxFQUFBO0NBQ0EsQ0FBQSxDQUFPO2dCQUdYLEdBQUFDLGlCQUFNLENBQUFDLDJCQUNBLENBQUE7Q0FJTixNQUFBQyxpQkFBQSxHQUFRQywyQkFBQTtDQUNSLE1BQUEsU0FBQSxHQUFBQyxNQUFBO0NBR0EsRUFBQSxPQUFBQyxTQUFBLENBQUFDLE9BQUEsQ0FBQUMsYUFBdUIsQ0FBQUwsaUJBQUEsQ0FBQU0sR0FBQSxFQUFBO0tBQUFDLE9BQUEsRUFBQSxNQUFBO0tBQUFDLENBQUEsRUFBQTtDQUFBLEdBQUEsRUFBQSxXQUN2QkosT0FBZ0IsQ0FBQUMsYUFBQSxDQUFBTCxpQkFBQSxDQUFBUyxFQUFBLEVBQUE7S0FBQUMsR0FBQSxFQUFBLFFBQUE7S0FBQUMsRUFBQSxFQUFBO0NBQUEsR0FBQSxFQUFBLHlCQUFBLENBQUEsWUFDaEJQLE9BQUEsQ0FBQUMsYUFBZ0IsQ0FBQUwsaUJBQUEsQ0FBQVksSUFBQSxFQUFBO0tBQUFGLEdBQUEsRUFBQSxNQUFBO0tBQUFDLEVBQUEsRUFBQTtD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
