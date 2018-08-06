(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.dragula = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
        'use strict';

        var cache = {};
        var start = '(?:^|\\s)';
        var end = '(?:\\s|$)';

        function lookupClass (className) {
            var cached = cache[className];
            if (cached) {
                cached.lastIndex = 0;
            } else {
                cache[className] = cached = new RegExp(start + className + end, 'g');
            }
            return cached;
        }

        function addClass (el, className) {
            var current = el.className;
            if (!current.length) {
                el.className = className;
            } else if (!lookupClass(className).test(current)) {
                el.className += ' ' + className;
            }
        }

        function rmClass (el, className) {
            el.className = el.className.replace(lookupClass(className), ' ').trim();
        }

        module.exports = {
            add: addClass,
            rm: rmClass
        };

    },{}],2:[function(require,module,exports){
        (function (global){
            'use strict';

            var emitter = require('contra/emitter');
            var crossvent = require('crossvent');
            var classes = require('./classes');
            var doc = document;
            var documentElement = doc.documentElement;

            function dragula (initialContainers, options) {
                var len = arguments.length;
                if (len === 1 && Array.isArray(initialContainers) === false) {
                    options = initialContainers;
                    initialContainers = [];
                }
                var _mirror; // mirror image
                var _source; // source container
                var _item; // item being dragged
                var _offsetX; // reference x
                var _offsetY; // reference y
                var _moveX; // reference move x
                var _moveY; // reference move y
                var _initialSibling; // reference sibling when grabbed
                var _currentSibling; // reference sibling now
                var _copy; // item used for copying
                var _renderTimer; // timer for setTimeout renderMirrorImage
                var _lastDropTarget = null; // last container item was over
                var _grabbed; // holds mousedown context until first mousemove

                var o = options || {};
                if (o.moves === void 0) { o.moves = always; }
                if (o.accepts === void 0) { o.accepts = always; }
                if (o.invalid === void 0) { o.invalid = invalidTarget; }
                if (o.containers === void 0) { o.containers = initialContainers || []; }
                if (o.isContainer === void 0) { o.isContainer = never; }
                if (o.copy === void 0) { o.copy = false; }
                if (o.copySortSource === void 0) { o.copySortSource = false; }
                if (o.revertOnSpill === void 0) { o.revertOnSpill = false; }
                if (o.removeOnSpill === void 0) { o.removeOnSpill = false; }
                if (o.direction === void 0) { o.direction = 'vertical'; }
                if (o.ignoreInputTextSelection === void 0) { o.ignoreInputTextSelection = true; }
                if (o.mirrorContainer === void 0) { o.mirrorContainer = doc.body; }

                var drake = emitter({
                    containers: o.containers,
                    start: manualStart,
                    end: end,
                    cancel: cancel,
                    remove: remove,
                    destroy: destroy,
                    canMove: canMove,
                    dragging: false
                });

                if (o.removeOnSpill === true) {
                    drake.on('over', spillOver).on('out', spillOut);
                }

                events();

                return drake;

                function isContainer (el) {
                    return drake.containers.indexOf(el) !== -1 || o.isContainer(el);
                }

                function events (remove) {
                    var op = remove ? 'remove' : 'add';
                    touchy(documentElement, op, 'mousedown', grab);
                    touchy(documentElement, op, 'mouseup', release);
                }

                function eventualMovements (remove) {
                    var op = remove ? 'remove' : 'add';
                    touchy(documentElement, op, 'mousemove', startBecauseMouseMoved);
                }

                function movements (remove) {
                    var op = remove ? 'remove' : 'add';
                    crossvent[op](documentElement, 'selectstart', preventGrabbed); // IE8
                    crossvent[op](documentElement, 'click', preventGrabbed);
                }

                function destroy () {
                    events(true);
                    release({});
                }

                function preventGrabbed (e) {
                    if (_grabbed) {
                        e.preventDefault();
                    }
                }

                function grab (e) {
                    _moveX = e.clientX;
                    _moveY = e.clientY;

                    var ignore = whichMouseButton(e) !== 1 || e.metaKey || e.ctrlKey;
                    if (ignore) {
                        return; // we only care about honest-to-god left clicks and touch events
                    }
                    var item = e.target;
                    var context = canStart(item);
                    if (!context) {
                        return;
                    }
                    _grabbed = context;
                    eventualMovements();
                    if (e.type === 'mousedown') {
                        if (isInput(item)) { // see also: https://github.com/bevacqua/dragula/issues/208
                            item.focus(); // fixes https://github.com/bevacqua/dragula/issues/176
                        } else {
                            e.preventDefault(); // fixes https://github.com/bevacqua/dragula/issues/155
                        }
                    }
                }

                function startBecauseMouseMoved (e) {
                    if (!_grabbed) {
                        return;
                    }
                    if (whichMouseButton(e) === 0) {
                        release({});
                        return; // when text is selected on an input and then dragged, mouseup doesn't fire. this is our only hope
                    }
                    // truthy check fixes #239, equality fixes #207
                    if (e.clientX !== void 0 && e.clientX === _moveX && e.clientY !== void 0 && e.clientY === _moveY) {
                        return;
                    }
                    if (o.ignoreInputTextSelection) {
                        var clientX = getCoord('clientX', e);
                        var clientY = getCoord('clientY', e);
                        var elementBehindCursor = doc.elementFromPoint(clientX, clientY);
                        if (isInput(elementBehindCursor)) {
                            return;
                        }
                    }

                    var grabbed = _grabbed; // call to end() unsets _grabbed
                    eventualMovements(true);
                    movements();
                    end();
                    start(grabbed);

                    var offset = getOffset(_item);
                    _offsetX = getCoord('pageX', e) - offset.left;
                    _offsetY = getCoord('pageY', e) - offset.top;

                    classes.add(_copy || _item, 'gu-transit');
                    renderMirrorImage();
                    drag(e);
                }

                function canStart (item) {
                    if (drake.dragging && _mirror) {
                        return;
                    }
                    if (isContainer(item)) {
                        return; // don't drag container itself
                    }
                    var handle = item;
                    while (getParent(item) && isContainer(getParent(item)) === false) {
                        if (o.invalid(item, handle)) {
                            return;
                        }
                        item = getParent(item); // drag target should be a top element
                        if (!item) {
                            return;
                        }
                    }
                    var source = getParent(item);
                    if (!source) {
                        return;
                    }
                    if (o.invalid(item, handle)) {
                        return;
                    }

                    var movable = o.moves(item, source, handle, nextEl(item));
                    if (!movable) {
                        return;
                    }

                    return {
                        item: item,
                        source: source
                    };
                }

                function canMove (item) {
                    return !!canStart(item);
                }

                function manualStart (item) {
                    var context = canStart(item);
                    if (context) {
                        start(context);
                    }
                }

                function start (context) {
                    if (isCopy(context.item, context.source)) {
                        _copy = context.item.cloneNode(true);
                        drake.emit('cloned', _copy, context.item, 'copy');
                    }

                    _source = context.source;
                    _item = context.item;
                    _initialSibling = _currentSibling = nextEl(context.item);

                    drake.dragging = true;
                    drake.emit('drag', _item, _source);
                }

                function invalidTarget () {
                    return false;
                }

                function end () {
                    if (!drake.dragging) {
                        return;
                    }
                    var item = _copy || _item;
                    drop(item, getParent(item));
                }

                function ungrab () {
                    _grabbed = false;
                    eventualMovements(true);
                    movements(true);
                }

                function release (e) {
                    ungrab();

                    if (!drake.dragging) {
                        return;
                    }
                    var item = _copy || _item;
                    var clientX = getCoord('clientX', e);
                    var clientY = getCoord('clientY', e);
                    var elementBehindCursor = getElementBehindPoint(_mirror, clientX, clientY);
                    var dropTarget = findDropTarget(elementBehindCursor, clientX, clientY);
                    if (dropTarget && ((_copy && o.copySortSource) || (!_copy || dropTarget !== _source))) {
                        drop(item, dropTarget);
                    } else if (o.removeOnSpill) {
                        remove();
                    } else {
                        cancel();
                    }
                }

                function drop (item, target) {
                    var parent = getParent(item);
                    if (_copy && o.copySortSource && target === _source) {
                        parent.removeChild(_item);
                    }
                    if (isInitialPlacement(target)) {
                        drake.emit('cancel', item, _source, _source);
                    } else {
                        drake.emit('drop', item, target, _source, _currentSibling);
                    }
                    cleanup();
                }

                function remove () {
                    if (!drake.dragging) {
                        return;
                    }
                    var item = _copy || _item;
                    var parent = getParent(item);
                    if (parent) {
                        parent.removeChild(item);
                    }
                    drake.emit(_copy ? 'cancel' : 'remove', item, parent, _source);
                    cleanup();
                }

                function cancel (revert) {
                    if (!drake.dragging) {
                        return;
                    }
                    var reverts = arguments.length > 0 ? revert : o.revertOnSpill;
                    var item = _copy || _item;
                    var parent = getParent(item);
                    var initial = isInitialPlacement(parent);
                    if (initial === false && reverts) {
                        if (_copy) {
                            if (parent) {
                                parent.removeChild(_copy);
                            }
                        } else {
                            _source.insertBefore(item, _initialSibling);
                        }
                    }
                    if (initial || reverts) {
                        drake.emit('cancel', item, _source, _source);
                    } else {
                        drake.emit('drop', item, parent, _source, _currentSibling);
                    }
                    cleanup();
                }

                function cleanup () {
                    var item = _copy || _item;
                    ungrab();
                    removeMirrorImage();
                    if (item) {
                        classes.rm(item, 'gu-transit');
                    }
                    if (_renderTimer) {
                        clearTimeout(_renderTimer);
                    }
                    drake.dragging = false;
                    if (_lastDropTarget) {
                        drake.emit('out', item, _lastDropTarget, _source);
                    }
                    drake.emit('dragend', item);
                    _source = _item = _copy = _initialSibling = _currentSibling = _renderTimer = _lastDropTarget = null;
                }

                function isInitialPlacement (target, s) {
                    var sibling;
                    if (s !== void 0) {
                        sibling = s;
                    } else if (_mirror) {
                        sibling = _currentSibling;
                    } else {
                        sibling = nextEl(_copy || _item);
                    }
                    return target === _source && sibling === _initialSibling;
                }

                function findDropTarget (elementBehindCursor, clientX, clientY) {
                    var target = elementBehindCursor;
                    while (target && !accepted()) {
                        target = getParent(target);
                    }
                    return target;

                    function accepted () {
                        var droppable = isContainer(target);
                        if (droppable === false) {
                            return false;
                        }

                        var immediate = getImmediateChild(target, elementBehindCursor);
                        var reference = getReference(target, immediate, clientX, clientY);
                        var initial = isInitialPlacement(target, reference);
                        if (initial) {
                            return true; // should always be able to drop it right back where it was
                        }
                        return o.accepts(_item, target, _source, reference);
                    }
                }

                function drag (e) {
                    if (!_mirror) {
                        return;
                    }
                    e.preventDefault();

                    var clientX = getCoord('clientX', e);
                    var clientY = getCoord('clientY', e);
                    var x = clientX - _offsetX;
                    var y = clientY - _offsetY;

                    _mirror.style.left = x + 'px';
                    _mirror.style.top = y + 'px';

                    var item = _copy || _item;
                    var elementBehindCursor = getElementBehindPoint(_mirror, clientX, clientY);
                    var dropTarget = findDropTarget(elementBehindCursor, clientX, clientY);
                    var changed = dropTarget !== null && dropTarget !== _lastDropTarget;
                    if (changed || dropTarget === null) {
                        out();
                        _lastDropTarget = dropTarget;
                        over();
                    }
                    var parent = getParent(item);
                    if (dropTarget === _source && _copy && !o.copySortSource) {
                        if (parent) {
                            parent.removeChild(item);
                        }
                        return;
                    }
                    var reference;
                    var immediate = getImmediateChild(dropTarget, elementBehindCursor);
                    if (immediate !== null) {
                        reference = getReference(dropTarget, immediate, clientX, clientY);
                    } else if (o.revertOnSpill === true && !_copy) {
                        reference = _initialSibling;
                        dropTarget = _source;
                    } else {
                        if (_copy && parent) {
                            parent.removeChild(item);
                        }
                        return;
                    }
                    if (
                        (reference === null && changed) ||
                        reference !== item &&
                        reference !== nextEl(item)
                    ) {
                        _currentSibling = reference;
                        dropTarget.insertBefore(item, reference);
                        drake.emit('shadow', item, dropTarget, _source);
                    }
                    function moved (type) { drake.emit(type, item, _lastDropTarget, _source); }
                    function over () { if (changed) { moved('over'); } }
                    function out () { if (_lastDropTarget) { moved('out'); } }
                }

                function spillOver (el) {
                    classes.rm(el, 'gu-hide');
                }

                function spillOut (el) {
                    if (drake.dragging) { classes.add(el, 'gu-hide'); }
                }

                function renderMirrorImage () {
                    if (_mirror) {
                        return;
                    }
                    var rect = _item.getBoundingClientRect();
                    _mirror = _item.cloneNode(true);
                    _mirror.style.width = getRectWidth(rect) + 'px';
                    _mirror.style.height = getRectHeight(rect) + 'px';
                    classes.rm(_mirror, 'gu-transit');
                    classes.add(_mirror, 'gu-mirror');
                    o.mirrorContainer.appendChild(_mirror);
                    touchy(documentElement, 'add', 'mousemove', drag);
                    classes.add(o.mirrorContainer, 'gu-unselectable');
                    drake.emit('cloned', _mirror, _item, 'mirror');
                }

                function removeMirrorImage () {
                    if (_mirror) {
                        classes.rm(o.mirrorContainer, 'gu-unselectable');
                        touchy(documentElement, 'remove', 'mousemove', drag);
                        getParent(_mirror).removeChild(_mirror);
                        _mirror = null;
                    }
                }

                function getImmediateChild (dropTarget, target) {
                    var immediate = target;
                    while (immediate !== dropTarget && getParent(immediate) !== dropTarget) {
                        immediate = getParent(immediate);
                    }
                    if (immediate === documentElement) {
                        return null;
                    }
                    return immediate;
                }

                function getReference (dropTarget, target, x, y) {
                    var horizontal = o.direction === 'horizontal';
                    var reference = target !== dropTarget ? inside() : outside();
                    return reference;

                    function outside () { // slower, but able to figure out any position
                        var len = dropTarget.children.length;
                        var i;
                        var el;
                        var rect;
                        for (i = 0; i < len; i++) {
                            el = dropTarget.children[i];
                            rect = el.getBoundingClientRect();
                            if (horizontal && (rect.left + rect.width / 2) > x) { return el; }
                            if (!horizontal && (rect.top + rect.height / 2) > y) { return el; }
                        }
                        return null;
                    }

                    function inside () { // faster, but only available if dropped inside a child element
                        var rect = target.getBoundingClientRect();
                        if (horizontal) {
                            return resolve(x > rect.left + getRectWidth(rect) / 2);
                        }
                        return resolve(y > rect.top + getRectHeight(rect) / 2);
                    }

                    function resolve (after) {
                        return after ? nextEl(target) : target;
                    }
                }

                function isCopy (item, container) {
                    return typeof o.copy === 'boolean' ? o.copy : o.copy(item, container);
                }
            }

            function touchy (el, op, type, fn) {
                var touch = {
                    mouseup: 'touchend',
                    mousedown: 'touchstart',
                    mousemove: 'touchmove'
                };
                var pointers = {
                    mouseup: 'pointerup',
                    mousedown: 'pointerdown',
                    mousemove: 'pointermove'
                };
                var microsoft = {
                    mouseup: 'MSPointerUp',
                    mousedown: 'MSPointerDown',
                    mousemove: 'MSPointerMove'
                };
                if (global.navigator.pointerEnabled) {
                    crossvent[op](el, pointers[type], fn);
                } else if (global.navigator.msPointerEnabled) {
                    crossvent[op](el, microsoft[type], fn);
                } else {
                    crossvent[op](el, touch[type], fn);
                    crossvent[op](el, type, fn);
                }
            }

            function whichMouseButton (e) {
                if (e.touches !== void 0) { return e.touches.length; }
                if (e.which !== void 0 && e.which !== 0) { return e.which; } // see https://github.com/bevacqua/dragula/issues/261
                if (e.buttons !== void 0) { return e.buttons; }
                var button = e.button;
                if (button !== void 0) { // see https://github.com/jquery/jquery/blob/99e8ff1baa7ae341e94bb89c3e84570c7c3ad9ea/src/event.js#L573-L575
                    return button & 1 ? 1 : button & 2 ? 3 : (button & 4 ? 2 : 0);
                }
            }

            function getOffset (el) {
                var rect = el.getBoundingClientRect();
                return {
                    left: rect.left + getScroll('scrollLeft', 'pageXOffset'),
                    top: rect.top + getScroll('scrollTop', 'pageYOffset')
                };
            }

            function getScroll (scrollProp, offsetProp) {
                if (typeof global[offsetProp] !== 'undefined') {
                    return global[offsetProp];
                }
                if (documentElement.clientHeight) {
                    return documentElement[scrollProp];
                }
                return doc.body[scrollProp];
            }

            function getElementBehindPoint (point, x, y) {
                var p = point || {};
                var state = p.className;
                var el;
                p.className += ' gu-hide';
                el = doc.elementFromPoint(x, y);
                p.className = state;
                return el;
            }

            function never () { return false; }
            function always () { return true; }
            function getRectWidth (rect) { return rect.width || (rect.right - rect.left); }
            function getRectHeight (rect) { return rect.height || (rect.bottom - rect.top); }
            function getParent (el) { return el.parentNode === doc ? null : el.parentNode; }
            function isInput (el) { return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || isEditable(el); }
            function isEditable (el) {
                if (!el) { return false; } // no parents were editable
                if (el.contentEditable === 'false') { return false; } // stop the lookup
                if (el.contentEditable === 'true') { return true; } // found a contentEditable element in the chain
                return isEditable(getParent(el)); // contentEditable is set to 'inherit'
            }

            function nextEl (el) {
                return el.nextElementSibling || manually();
                function manually () {
                    var sibling = el;
                    do {
                        sibling = sibling.nextSibling;
                    } while (sibling && sibling.nodeType !== 1);
                    return sibling;
                }
            }

            function getEventHost (e) {
                // on touchend event, we have to use `e.changedTouches`
                // see http://stackoverflow.com/questions/7192563/touchend-event-properties
                // see https://github.com/bevacqua/dragula/issues/34
                if (e.targetTouches && e.targetTouches.length) {
                    return e.targetTouches[0];
                }
                if (e.changedTouches && e.changedTouches.length) {
                    return e.changedTouches[0];
                }
                return e;
            }

            function getCoord (coord, e) {
                var host = getEventHost(e);
                var missMap = {
                    pageX: 'clientX', // IE8
                    pageY: 'clientY' // IE8
                };
                if (coord in missMap && !(coord in host) && missMap[coord] in host) {
                    coord = missMap[coord];
                }
                return host[coord];
            }

            module.exports = dragula;

        }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

    },{"./classes":1,"contra/emitter":5,"crossvent":6}],3:[function(require,module,exports){
        module.exports = function atoa (a, n) { return Array.prototype.slice.call(a, n); }

    },{}],4:[function(require,module,exports){
        'use strict';

        var ticky = require('ticky');

        module.exports = function debounce (fn, args, ctx) {
            if (!fn) { return; }
            ticky(function run () {
                fn.apply(ctx || null, args || []);
            });
        };

    },{"ticky":9}],5:[function(require,module,exports){
        'use strict';

        var atoa = require('atoa');
        var debounce = require('./debounce');

        module.exports = function emitter (thing, options) {
            var opts = options || {};
            var evt = {};
            if (thing === undefined) { thing = {}; }
            thing.on = function (type, fn) {
                if (!evt[type]) {
                    evt[type] = [fn];
                } else {
                    evt[type].push(fn);
                }
                return thing;
            };
            thing.once = function (type, fn) {
                fn._once = true; // thing.off(fn) still works!
                thing.on(type, fn);
                return thing;
            };
            thing.off = function (type, fn) {
                var c = arguments.length;
                if (c === 1) {
                    delete evt[type];
                } else if (c === 0) {
                    evt = {};
                } else {
                    var et = evt[type];
                    if (!et) { return thing; }
                    et.splice(et.indexOf(fn), 1);
                }
                return thing;
            };
            thing.emit = function () {
                var args = atoa(arguments);
                return thing.emitterSnapshot(args.shift()).apply(this, args);
            };
            thing.emitterSnapshot = function (type) {
                var et = (evt[type] || []).slice(0);
                return function () {
                    var args = atoa(arguments);
                    var ctx = this || thing;
                    if (type === 'error' && opts.throws !== false && !et.length) { throw args.length === 1 ? args[0] : args; }
                    et.forEach(function emitter (listen) {
                        if (opts.async) { debounce(listen, args, ctx); } else { listen.apply(ctx, args); }
                        if (listen._once) { thing.off(type, listen); }
                    });
                    return thing;
                };
            };
            return thing;
        };

    },{"./debounce":4,"atoa":3}],6:[function(require,module,exports){
        (function (global){
            'use strict';

            var customEvent = require('custom-event');
            var eventmap = require('./eventmap');
            var doc = global.document;
            var addEvent = addEventEasy;
            var removeEvent = removeEventEasy;
            var hardCache = [];

            if (!global.addEventListener) {
                addEvent = addEventHard;
                removeEvent = removeEventHard;
            }

            module.exports = {
                add: addEvent,
                remove: removeEvent,
                fabricate: fabricateEvent
            };

            function addEventEasy (el, type, fn, capturing) {
                return el.addEventListener(type, fn, capturing);
            }

            function addEventHard (el, type, fn) {
                return el.attachEvent('on' + type, wrap(el, type, fn));
            }

            function removeEventEasy (el, type, fn, capturing) {
                return el.removeEventListener(type, fn, capturing);
            }

            function removeEventHard (el, type, fn) {
                var listener = unwrap(el, type, fn);
                if (listener) {
                    return el.detachEvent('on' + type, listener);
                }
            }

            function fabricateEvent (el, type, model) {
                var e = eventmap.indexOf(type) === -1 ? makeCustomEvent() : makeClassicEvent();
                if (el.dispatchEvent) {
                    el.dispatchEvent(e);
                } else {
                    el.fireEvent('on' + type, e);
                }
                function makeClassicEvent () {
                    var e;
                    if (doc.createEvent) {
                        e = doc.createEvent('Event');
                        e.initEvent(type, true, true);
                    } else if (doc.createEventObject) {
                        e = doc.createEventObject();
                    }
                    return e;
                }
                function makeCustomEvent () {
                    return new customEvent(type, { detail: model });
                }
            }

            function wrapperFactory (el, type, fn) {
                return function wrapper (originalEvent) {
                    var e = originalEvent || global.event;
                    e.target = e.target || e.srcElement;
                    e.preventDefault = e.preventDefault || function preventDefault () { e.returnValue = false; };
                    e.stopPropagation = e.stopPropagation || function stopPropagation () { e.cancelBubble = true; };
                    e.which = e.which || e.keyCode;
                    fn.call(el, e);
                };
            }

            function wrap (el, type, fn) {
                var wrapper = unwrap(el, type, fn) || wrapperFactory(el, type, fn);
                hardCache.push({
                    wrapper: wrapper,
                    element: el,
                    type: type,
                    fn: fn
                });
                return wrapper;
            }

            function unwrap (el, type, fn) {
                var i = find(el, type, fn);
                if (i) {
                    var wrapper = hardCache[i].wrapper;
                    hardCache.splice(i, 1); // free up a tad of memory
                    return wrapper;
                }
            }

            function find (el, type, fn) {
                var i, item;
                for (i = 0; i < hardCache.length; i++) {
                    item = hardCache[i];
                    if (item.element === el && item.type === type && item.fn === fn) {
                        return i;
                    }
                }
            }

        }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

    },{"./eventmap":7,"custom-event":8}],7:[function(require,module,exports){
        (function (global){
            'use strict';

            var eventmap = [];
            var eventname = '';
            var ron = /^on/;

            for (eventname in global) {
                if (ron.test(eventname)) {
                    eventmap.push(eventname.slice(2));
                }
            }

            module.exports = eventmap;

        }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

    },{}],8:[function(require,module,exports){
        (function (global){

            var NativeCustomEvent = global.CustomEvent;

            function useNative () {
                try {
                    var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
                    return  'cat' === p.type && 'bar' === p.detail.foo;
                } catch (e) {
                }
                return false;
            }

            /**
             * Cross-browser `CustomEvent` constructor.
             *
             * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
             *
             * @public
             */

            module.exports = useNative() ? NativeCustomEvent :

                // IE >= 9
                'function' === typeof document.createEvent ? function CustomEvent (type, params) {
                        var e = document.createEvent('CustomEvent');
                        if (params) {
                            e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
                        } else {
                            e.initCustomEvent(type, false, false, void 0);
                        }
                        return e;
                    } :

                    // IE <= 8
                    function CustomEvent (type, params) {
                        var e = document.createEventObject();
                        e.type = type;
                        if (params) {
                            e.bubbles = Boolean(params.bubbles);
                            e.cancelable = Boolean(params.cancelable);
                            e.detail = params.detail;
                        } else {
                            e.bubbles = false;
                            e.cancelable = false;
                            e.detail = void 0;
                        }
                        return e;
                    }

        }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

    },{}],9:[function(require,module,exports){
        var si = typeof setImmediate === 'function', tick;
        if (si) {
            tick = function (fn) { setImmediate(fn); };
        } else {
            tick = function (fn) { setTimeout(fn, 0); };
        }

        module.exports = tick;
    },{}]},{},[2])(2)
});
///#source 1 1 /src/1.0.0/core.js
/*! head.core - v1.0.2 */
/*
 * HeadJS     The only script in your <HEAD>
 * Author     Tero Piirainen  (tipiirai)
 * Maintainer Robert Hoffmann (itechnology)
 * License    MIT / http://bit.ly/mit-license
 * WebSite    http://headjs.com
 */
(function(win, undefined) {
    "use strict";

    // gt, gte, lt, lte, eq breakpoints would have been more simple to write as ['gt','gte','lt','lte','eq']
    // but then we would have had to loop over the collection on each resize() event,
    // a simple object with a direct access to true/false is therefore much more efficient
    var doc   = win.document,
        nav   = win.navigator,
        loc   = win.location,
        html  = doc.documentElement,
        klass = [],
        conf  = {
            screens   : [240, 320, 480, 640, 768, 800, 1024, 1280, 1440, 1680, 1920],
            screensCss: { "gt": true, "gte": false, "lt": true, "lte": false, "eq": false },
            browsers  : [
                { ie: { min: 6, max: 11 } }
                //,{ chrome : { min: 8, max: 33 } }
                //,{ ff     : { min: 3, max: 26 } }
                //,{ ios    : { min: 3, max:  7 } }
                //,{ android: { min: 2, max:  4 } }
                //,{ webkit : { min: 9, max: 12 } }
                //,{ opera  : { min: 9, max: 12 } }
            ],
            browserCss: { "gt": true, "gte": false, "lt": true, "lte": false, "eq": true },
            html5     : true,
            page      : "-page",
            section   : "-section",
            head      : "head"
        };

    if (win.head_conf) {
        for (var item in win.head_conf) {
            if (win.head_conf[item] !== undefined) {
                conf[item] = win.head_conf[item];
            }
        }
    }

    function pushClass(name) {
        klass[klass.length] = name;
    }

    function removeClass(name) {
        // need to test for both space and no space
        // https://github.com/headjs/headjs/issues/270
        // https://github.com/headjs/headjs/issues/226
        var re = new RegExp(" ?\\b" + name + "\\b");
        html.className = html.className.replace(re, "");
    }

    function each(arr, fn) {
        for (var i = 0, l = arr.length; i < l; i++) {
            fn.call(arr, arr[i], i);
        }
    }

    // API
    var api = win[conf.head] = function() {
        api.ready.apply(null, arguments);
    };

    api.feature = function(key, enabled, queue) {

        // internal: apply all classes
        if (!key) {
            html.className += " " + klass.join(" ");
            klass = [];

            return api;
        }

        if (Object.prototype.toString.call(enabled) === "[object Function]") {
            enabled = enabled.call();
        }

        pushClass((enabled ? "" : "no-") + key);
        api[key] = !!enabled;

        // apply class to HTML element
        if (!queue) {
            removeClass("no-" + key);
            removeClass(key);
            api.feature();
        }

        return api;
    };

    // no queue here, so we can remove any eventual pre-existing no-js class
    api.feature("js", true);

    // browser type & version
    var ua     = nav.userAgent.toLowerCase(),
        mobile = /mobile|android|kindle|silk|midp|phone|(windows .+arm|touch)/.test(ua);

    // useful for enabling/disabling feature (we can consider a desktop navigator to have more cpu/gpu power)
    api.feature("mobile" , mobile , true);
    api.feature("desktop", !mobile, true);

    // http://www.zytrax.com/tech/web/browser_ids.htm
    // http://www.zytrax.com/tech/web/mobile_ids.html
    ua = /(chrome|firefox)[ \/]([\w.]+)/.exec(ua) || // Chrome & Firefox
        /(iphone|ipad|ipod)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Mobile IOS
        /(android)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Mobile Webkit
        /(webkit|opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Safari & Opera
        /(msie) ([\w.]+)/.exec(ua) ||
        /(trident).+rv:(\w.)+/.exec(ua) || [];

    var browser = ua[1],
        version = parseFloat(ua[2]);

    switch (browser) {
        case "msie":
        case "trident":
            browser = "ie";
            version = doc.documentMode || version;
            break;

        case "firefox":
            browser = "ff";
            break;

        case "ipod":
        case "ipad":
        case "iphone":
            browser = "ios";
            break;

        case "webkit":
            browser = "safari";
            break;
    }

    // Browser vendor and version
    api.browser = {
        name: browser,
        version: version
    };
    api.browser[browser] = true;

    for (var i = 0, l = conf.browsers.length; i < l; i++) {
        for (var key in conf.browsers[i]) {
            if (browser === key) {
                pushClass(key);

                var min = conf.browsers[i][key].min;
                var max = conf.browsers[i][key].max;

                for (var v = min; v <= max; v++) {
                    if (version > v) {
                        if (conf.browserCss.gt) {
                            pushClass("gt-" + key + v);
                        }

                        if (conf.browserCss.gte) {
                            pushClass("gte-" + key + v);
                        }
                    } else if (version < v) {
                        if (conf.browserCss.lt) {
                            pushClass("lt-" + key + v);
                        }

                        if (conf.browserCss.lte) {
                            pushClass("lte-" + key + v);
                        }
                    } else if (version === v) {
                        if (conf.browserCss.lte) {
                            pushClass("lte-" + key + v);
                        }

                        if (conf.browserCss.eq) {
                            pushClass("eq-" + key + v);
                        }

                        if (conf.browserCss.gte) {
                            pushClass("gte-" + key + v);
                        }
                    }
                }
            } else {
                pushClass("no-" + key);
            }
        }
    }

    pushClass(browser);
    pushClass(browser + parseInt(version, 10));

    // IE lt9 specific
    if (conf.html5 && browser === "ie" && version < 9) {
        // HTML5 support : you still need to add html5 css initialization styles to your site
        // See: assets/html5.css
        each("abbr|article|aside|audio|canvas|details|figcaption|figure|footer|header|hgroup|main|mark|meter|nav|output|progress|section|summary|time|video".split("|"), function(el) {
            doc.createElement(el);
        });
    }

    // CSS "router"
    each(loc.pathname.split("/"), function(el, i) {
        if (this.length > 2 && this[i + 1] !== undefined) {
            if (i) {
                pushClass(this.slice(i, i + 1).join("-").toLowerCase() + conf.section);
            }
        } else {
            // pageId
            var id = el || "index", index = id.indexOf(".");
            if (index > 0) {
                id = id.substring(0, index);
            }

            html.id = id.toLowerCase() + conf.page;

            // on root?
            if (!i) {
                pushClass("root" + conf.section);
            }
        }
    });

    // basic screen info
    api.screen = {
        height: win.screen.height,
        width : win.screen.width
    };

    // viewport resolutions: w-100, lt-480, lt-1024 ...
    function screenSize() {
        // remove earlier sizes
        html.className = html.className.replace(/ (w-|eq-|gt-|gte-|lt-|lte-|portrait|no-portrait|landscape|no-landscape)\d+/g, "");

        // Viewport width
        var iw = win.innerWidth || html.clientWidth,
            ow = win.outerWidth || win.screen.width;

        api.screen.innerWidth = iw;
        api.screen.outerWidth = ow;

        // for debugging purposes, not really useful for anything else
        pushClass("w-" + iw);

        each(conf.screens, function(width) {
            if (iw > width) {
                if (conf.screensCss.gt) {
                    pushClass("gt-" + width);
                }

                if (conf.screensCss.gte) {
                    pushClass("gte-" + width);
                }
            } else if (iw < width) {
                if (conf.screensCss.lt) {
                    pushClass("lt-" + width);
                }

                if (conf.screensCss.lte) {
                    pushClass("lte-" + width);
                }
            } else if (iw === width) {
                if (conf.screensCss.lte) {
                    pushClass("lte-" + width);
                }

                if (conf.screensCss.eq) {
                    pushClass("e-q" + width);
                }

                if (conf.screensCss.gte) {
                    pushClass("gte-" + width);
                }
            }
        });

        // Viewport height
        var ih = win.innerHeight || html.clientHeight,
            oh = win.outerHeight || win.screen.height;

        api.screen.innerHeight = ih;
        api.screen.outerHeight = oh;

        // no need for onChange event to detect this
        api.feature("portrait" , (ih > iw));
        api.feature("landscape", (ih < iw));
    }

    screenSize();

    // Throttle navigators from triggering too many resize events
    var resizeId = 0;

    function onResize() {
        win.clearTimeout(resizeId);
        resizeId = win.setTimeout(screenSize, 50);
    }

    // Manually attach, as to not overwrite existing handler
    if (win.addEventListener) {
        win.addEventListener("resize", onResize, false);

    } else {
        // IE8 and less
        win.attachEvent("onresize", onResize);
    }
}(window));
///#source 1 1 /src/1.0.0/css3.js
/*! head.css3 - v1.0.0 */
/*
 * HeadJS     The only script in your <HEAD>
 * Author     Tero Piirainen  (tipiirai)
 * Maintainer Robert Hoffmann (itechnology)
 * License    MIT / http://bit.ly/mit-license
 * WebSite    http://headjs.com
 */
(function (win, undefined) {
    "use strict";

    var doc = win.document,
        /*
            To add a new test:

            head.feature("video", function() {
                var tag = document.createElement('video');
                return !!tag.canPlayType;
            });

            Good place to grab more tests

            https://github.com/Modernizr/Modernizr/blob/master/modernizr.js
        */

        /* CSS modernizer */
        el       = doc.createElement("i"),
        style    = el.style,
        prefs    = " -o- -moz- -ms- -webkit- -khtml- ".split(" "),
        domPrefs = "Webkit Moz O ms Khtml".split(" "),
        headVar  = win.head_conf && win.head_conf.head || "head",
        api      = win[headVar];

    // Thanks Paul Irish!

    function testProps(props) {
        for (var i in props) {
            if (style[props[i]] !== undefined) {
                return true;
            }
        }

        return false;
    }


    function testAll(prop) {
        var camel = prop.charAt(0).toUpperCase() + prop.substr(1),
            props = (prop + " " + domPrefs.join(camel + " ") + camel).split(" ");

        return !!testProps(props);
    }

    var tests = {
        // should we seperate linear/radial ?
        // seems like some browsers need a test for prefix http://caniuse.com/#feat=css-gradients
        gradient: function () {
            var s1 = "background-image:",
                s2 = "gradient(linear,left top,right bottom,from(#9f9),to(#fff));",
                s3 = "linear-gradient(left top,#eee,#fff);";

            style.cssText = (s1 + prefs.join(s2 + s1) + prefs.join(s3 + s1)).slice(0, -s1.length);
            return !!style.backgroundImage;
        },

        rgba: function () {
            style.cssText = "background-color:rgba(0,0,0,0.5)";
            return !!style.backgroundColor;
        },

        opacity: function () {
            return el.style.opacity === "";
        },

        textshadow: function () {
            return style.textShadow === "";
        },

        multiplebgs: function () {
            style.cssText = "background:url(https://),url(https://),red url(https://)";

            // If the UA supports multiple backgrounds, there should be three occurrences
            // of the string "url(" in the return value for elemStyle.background
            var result = (style.background || "").match(/url/g);

            return Object.prototype.toString.call(result) === "[object Array]" && result.length === 3;
        },

        boxshadow: function () {
            return testAll("boxShadow");
        },

        borderimage: function () {
            return testAll("borderImage");
        },

        borderradius: function () {
            return testAll("borderRadius");
        },

        cssreflections: function () {
            return testAll("boxReflect");
        },

        csstransforms: function () {
            return testAll("transform");
        },

        csstransitions: function () {
            return testAll("transition");
        },
        touch: function () {
            return "ontouchstart" in win;
        },
        retina: function () {
            return (win.devicePixelRatio > 1);
        },

        /*
            font-face support. Uses browser sniffing but is synchronous.
            http://paulirish.com/2009/font-face-feature-detection/
        */
        fontface: function () {
            var browser = api.browser.name, version = api.browser.version;

            switch (browser) {
                case "ie":
                    return version >= 9;

                case "chrome":
                    return version >= 13;

                case "ff":
                    return version >= 6;

                case "ios":
                    return version >= 5;

                case "android":
                    return false;

                case "webkit":
                    return version >= 5.1;

                case "opera":
                    return version >= 10;

                default:
                    return false;
            }
        }
    };

    // queue features
    for (var key in tests) {
        if (tests[key]) {
            api.feature(key, tests[key].call(), true);
        }
    }

    // enable features at once
    api.feature();

}(window));
///#source 1 1 /src/1.0.0/load.js
/*! head.load - v1.0.3 */
/*
 * HeadJS     The only script in your <HEAD>
 * Author     Tero Piirainen  (tipiirai)
 * Maintainer Robert Hoffmann (itechnology)
 * License    MIT / http://bit.ly/mit-license
 * WebSite    http://headjs.com
 */
(function (win, undefined) {
    "use strict";

    //#region variables
    var doc        = win.document,
        domWaiters = [],
        handlers   = {}, // user functions waiting for events
        assets     = {}, // loadable items in various states
        isAsync    = "async" in doc.createElement("script") || "MozAppearance" in doc.documentElement.style || win.opera,
        isDomReady,

        /*** public API ***/
        headVar = win.head_conf && win.head_conf.head || "head",
        api     = win[headVar] = (win[headVar] || function () { api.ready.apply(null, arguments); }),

        // states
        PRELOADING = 1,
        PRELOADED  = 2,
        LOADING    = 3,
        LOADED     = 4;
    //#endregion

    //#region PRIVATE functions

    //#region Helper functions
    function noop() {
        // does nothing
    }

    function each(arr, callback) {
        if (!arr) {
            return;
        }

        // arguments special type
        if (typeof arr === "object") {
            arr = [].slice.call(arr);
        }

        // do the job
        for (var i = 0, l = arr.length; i < l; i++) {
            callback.call(arr, arr[i], i);
        }
    }

    /* A must read: http://bonsaiden.github.com/JavaScript-Garden
     ************************************************************/
    function is(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }

    function isFunction(item) {
        return is("Function", item);
    }

    function isArray(item) {
        return is("Array", item);
    }

    function toLabel(url) {
        ///<summary>Converts a url to a file label</summary>
        var items = url.split("/"),
            name = items[items.length - 1],
            i    = name.indexOf("?");

        return i !== -1 ? name.substring(0, i) : name;
    }

    // INFO: this look like a "im triggering callbacks all over the place, but only wanna run it one time function" ..should try to make everything work without it if possible
    // INFO: Even better. Look into promises/defered's like jQuery is doing
    function one(callback) {
        ///<summary>Execute a callback only once</summary>
        callback = callback || noop;

        if (callback._done) {
            return;
        }

        callback();
        callback._done = 1;
    }
    //#endregion

    function conditional(test, success, failure, callback) {
        ///<summary>
        /// INFO: use cases:
        ///    head.test(condition, null       , "file.NOk" , callback);
        ///    head.test(condition, "fileOk.js", null       , callback);
        ///    head.test(condition, "fileOk.js", "file.NOk" , callback);
        ///    head.test(condition, "fileOk.js", ["file.NOk", "file.NOk"], callback);
        ///    head.test({
        ///               test    : condition,
        ///               success : [{ label1: "file1Ok.js"  }, { label2: "file2Ok.js" }],
        ///               failure : [{ label1: "file1NOk.js" }, { label2: "file2NOk.js" }],
        ///               callback: callback
        ///    );
        ///    head.test({
        ///               test    : condition,
        ///               success : ["file1Ok.js" , "file2Ok.js"],
        ///               failure : ["file1NOk.js", "file2NOk.js"],
        ///               callback: callback
        ///    );
        ///</summary>
        var obj = (typeof test === "object") ? test : {
            test: test,
            success: !!success ? isArray(success) ? success : [success] : false,
            failure: !!failure ? isArray(failure) ? failure : [failure] : false,
            callback: callback || noop
        };

        // Test Passed ?
        var passed = !!obj.test;

        // Do we have a success case
        if (passed && !!obj.success) {
            obj.success.push(obj.callback);
            api.load.apply(null, obj.success);
        }
        // Do we have a fail case
        else if (!passed && !!obj.failure) {
            obj.failure.push(obj.callback);
            api.load.apply(null, obj.failure);
        }
        else {
            callback();
        }

        return api;
    }

    function getAsset(item) {
        ///<summary>
        /// Assets are in the form of
        /// {
        ///     name : label,
        ///     url  : url,
        ///     state: state
        /// }
        ///</summary>
        var asset = {};

        if (typeof item === "object") {
            for (var label in item) {
                if (!!item[label]) {
                    asset = {
                        name: label,
                        url : item[label]
                    };
                }
            }
        }
        else {
            asset = {
                name: toLabel(item),
                url : item
            };
        }

        // is the item already existant
        var existing = assets[asset.name];
        if (existing && existing.url === asset.url) {
            return existing;
        }

        assets[asset.name] = asset;
        return asset;
    }

    function allLoaded(items) {
        items = items || assets;

        for (var name in items) {
            if (items.hasOwnProperty(name) && items[name].state !== LOADED) {
                return false;
            }
        }

        return true;
    }

    function onPreload(asset) {
        asset.state = PRELOADED;

        each(asset.onpreload, function (afterPreload) {
            afterPreload.call();
        });
    }

    function preLoad(asset, callback) {
        if (asset.state === undefined) {

            asset.state     = PRELOADING;
            asset.onpreload = [];

            loadAsset({ url: asset.url, type: "cache" }, function () {
                onPreload(asset);
            });
        }
    }

    function apiLoadHack() {
        /// <summary>preload with text/cache hack
        ///
        /// head.load("http://domain.com/file.js","http://domain.com/file.js", callBack)
        /// head.load(["http://domain.com/file.js","http://domain.com/file.js"], callBack)
        /// head.load({ label1: "http://domain.com/file.js" }, { label2: "http://domain.com/file.js" }, callBack)
        /// head.load([{ label1: "http://domain.com/file.js" }, { label2: "http://domain.com/file.js" }], callBack)
        /// </summary>
        var args     = arguments,
            callback = args[args.length - 1],
            rest     = [].slice.call(args, 1),
            next     = rest[0];

        if (!isFunction(callback)) {
            callback = null;
        }

        // if array, repush as args
        if (isArray(args[0])) {
            args[0].push(callback);
            api.load.apply(null, args[0]);

            return api;
        }

        // multiple arguments
        if (!!next) {
            /* Preload with text/cache hack (not good!)
             * http://blog.getify.com/on-script-loaders/
             * http://www.nczonline.net/blog/2010/12/21/thoughts-on-script-loaders/
             * If caching is not configured correctly on the server, then items could load twice !
             *************************************************************************************/
            each(rest, function (item) {
                // item is not a callback or empty string
                if (!isFunction(item) && !!item) {
                    preLoad(getAsset(item));
                }
            });

            // execute
            load(getAsset(args[0]), isFunction(next) ? next : function () {
                api.load.apply(null, rest);
            });
        }
        else {
            // single item
            load(getAsset(args[0]));
        }

        return api;
    }

    function apiLoadAsync() {
        ///<summary>
        /// simply load and let browser take care of ordering
        ///
        /// head.load("http://domain.com/file.js","http://domain.com/file.js", callBack)
        /// head.load(["http://domain.com/file.js","http://domain.com/file.js"], callBack)
        /// head.load({ label1: "http://domain.com/file.js" }, { label2: "http://domain.com/file.js" }, callBack)
        /// head.load([{ label1: "http://domain.com/file.js" }, { label2: "http://domain.com/file.js" }], callBack)
        ///</summary>
        var args     = arguments,
            callback = args[args.length - 1],
            items    = {};

        if (!isFunction(callback)) {
            callback = null;
        }

        // if array, repush as args
        if (isArray(args[0])) {
            args[0].push(callback);
            api.load.apply(null, args[0]);

            return api;
        }

        // JRH 262#issuecomment-26288601
        // First populate the items array.
        // When allLoaded is called, all items will be populated.
        // Issue when lazy loaded, the callback can execute early.
        each(args, function (item, i) {
            if (item !== callback) {
                item             = getAsset(item);
                items[item.name] = item;
            }
        });

        each(args, function (item, i) {
            if (item !== callback) {
                item = getAsset(item);

                load(item, function () {
                    if (allLoaded(items)) {
                        one(callback);
                    }
                });
            }
        });

        return api;
    }

    function load(asset, callback) {
        ///<summary>Used with normal loading logic</summary>
        callback = callback || noop;

        if (asset.state === LOADED) {
            callback();
            return;
        }

        // INFO: why would we trigger a ready event when its not really loaded yet ?
        if (asset.state === LOADING) {
            api.ready(asset.name, callback);
            return;
        }

        if (asset.state === PRELOADING) {
            asset.onpreload.push(function () {
                load(asset, callback);
            });
            return;
        }

        asset.state = LOADING;

        loadAsset(asset, function () {
            asset.state = LOADED;

            callback();

            // handlers for this asset
            each(handlers[asset.name], function (fn) {
                one(fn);
            });

            // dom is ready & no assets are queued for loading
            // INFO: shouldn't we be doing the same test above ?
            if (isDomReady && allLoaded()) {
                each(handlers.ALL, function (fn) {
                    one(fn);
                });
            }
        });
    }

    function getExtension(url) {
        url = url || "";

        var items = url.split("?")[0].split(".");
        return items[items.length-1].toLowerCase();
    }

    /* Parts inspired from: https://github.com/cujojs/curl
    ******************************************************/
    function loadAsset(asset, callback) {
        callback = callback || noop;

        function error(event) {
            event = event || win.event;

            // release event listeners
            ele.onload = ele.onreadystatechange = ele.onerror = null;

            // do callback
            callback();

            // need some more detailed error handling here
        }

        function process(event) {
            event = event || win.event;

            // IE 7/8 (2 events on 1st load)
            // 1) event.type = readystatechange, s.readyState = loading
            // 2) event.type = readystatechange, s.readyState = loaded

            // IE 7/8 (1 event on reload)
            // 1) event.type = readystatechange, s.readyState = complete

            // event.type === 'readystatechange' && /loaded|complete/.test(s.readyState)

            // IE 9 (3 events on 1st load)
            // 1) event.type = readystatechange, s.readyState = loading
            // 2) event.type = readystatechange, s.readyState = loaded
            // 3) event.type = load            , s.readyState = loaded

            // IE 9 (2 events on reload)
            // 1) event.type = readystatechange, s.readyState = complete
            // 2) event.type = load            , s.readyState = complete

            // event.type === 'load'             && /loaded|complete/.test(s.readyState)
            // event.type === 'readystatechange' && /loaded|complete/.test(s.readyState)

            // IE 10 (3 events on 1st load)
            // 1) event.type = readystatechange, s.readyState = loading
            // 2) event.type = load            , s.readyState = complete
            // 3) event.type = readystatechange, s.readyState = loaded

            // IE 10 (3 events on reload)
            // 1) event.type = readystatechange, s.readyState = loaded
            // 2) event.type = load            , s.readyState = complete
            // 3) event.type = readystatechange, s.readyState = complete

            // event.type === 'load'             && /loaded|complete/.test(s.readyState)
            // event.type === 'readystatechange' && /complete/.test(s.readyState)

            // Other Browsers (1 event on 1st load)
            // 1) event.type = load, s.readyState = undefined

            // Other Browsers (1 event on reload)
            // 1) event.type = load, s.readyState = undefined

            // event.type == 'load' && s.readyState = undefined

            // !doc.documentMode is for IE6/7, IE8+ have documentMode
            if (event.type === "load" || (/loaded|complete/.test(ele.readyState) && (!doc.documentMode || doc.documentMode < 9))) {
                // remove timeouts
                win.clearTimeout(asset.errorTimeout);
                win.clearTimeout(asset.cssTimeout);

                // release event listeners
                ele.onload = ele.onreadystatechange = ele.onerror = null;

                // do callback
                callback();
            }
        }

        function isCssLoaded() {
            // should we test again ? 20 retries = 5secs ..after that, the callback will be triggered by the error handler at 7secs
            if (asset.state !== LOADED && asset.cssRetries <= 20) {

                // loop through stylesheets
                for (var i = 0, l = doc.styleSheets.length; i < l; i++) {
                    // do we have a match ?
                    // we need to tests agains ele.href and not asset.url, because a local file will be assigned the full http path on a link element
                    if (doc.styleSheets[i].href === ele.href) {
                        process({ "type": "load" });
                        return;
                    }
                }

                // increment & try again
                asset.cssRetries++;
                asset.cssTimeout = win.setTimeout(isCssLoaded, 250);
            }
        }

        var ele;
        var ext = getExtension(asset.url);

        if (ext === "css") {
            ele      = doc.createElement("link");
            ele.type = "text/" + (asset.type || "css");
            ele.rel  = "stylesheet";
            ele.href = asset.url;

            /* onload supported for CSS on unsupported browsers
             * Safari windows 5.1.7, FF < 10
             */

            // Set counter to zero
            asset.cssRetries = 0;
            asset.cssTimeout = win.setTimeout(isCssLoaded, 500);
        }
        else {
            ele      = doc.createElement("script");
            ele.type = "text/" + (asset.type || "javascript");
            ele.src = asset.url;
        }

        ele.onload  = ele.onreadystatechange = process;
        ele.onerror = error;

        /* Good read, but doesn't give much hope !
         * http://blog.getify.com/on-script-loaders/
         * http://www.nczonline.net/blog/2010/12/21/thoughts-on-script-loaders/
         * https://hacks.mozilla.org/2009/06/defer/
         */

        // ASYNC: load in parallel and execute as soon as possible
        ele.async = false;
        // DEFER: load in parallel but maintain execution order
        ele.defer = false;

        // timout for asset loading
        asset.errorTimeout = win.setTimeout(function () {
            error({ type: "timeout" });
        }, 7e3);

        // use insertBefore to keep IE from throwing Operation Aborted (thx Bryan Forbes!)
        var head = doc.head || doc.getElementsByTagName("head")[0];

        // but insert at end of head, because otherwise if it is a stylesheet, it will not override values
        head.insertBefore(ele, head.lastChild);
    }

    /* Parts inspired from: https://github.com/jrburke/requirejs
    ************************************************************/
    function init() {
        var items = doc.getElementsByTagName("script");

        // look for a script with a data-head-init attribute
        for (var i = 0, l = items.length; i < l; i++) {
            var dataMain = items[i].getAttribute("data-headjs-load");
            if (!!dataMain) {
                api.load(dataMain);
                return;
            }
        }
    }

    function ready(key, callback) {
        ///<summary>
        /// INFO: use cases:
        ///    head.ready(callBack);
        ///    head.ready(document , callBack);
        ///    head.ready("file.js", callBack);
        ///    head.ready("label"  , callBack);
        ///    head.ready(["label1", "label2"], callback);
        ///</summary>

        // DOM ready check: head.ready(document, function() { });
        if (key === doc) {
            if (isDomReady) {
                one(callback);
            }
            else {
                domWaiters.push(callback);
            }

            return api;
        }

        // shift arguments
        if (isFunction(key)) {
            callback = key;
            key      = "ALL"; // holds all callbacks that where added without labels: ready(callBack)
        }

        // queue all items from key and return. The callback will be executed if all items from key are already loaded.
        if (isArray(key)) {
            var items = {};

            each(key, function (item) {
                items[item] = assets[item];

                api.ready(item, function() {
                    if (allLoaded(items)) {
                        one(callback);
                    }
                });
            });

            return api;
        }

        // make sure arguments are sane
        if (typeof key !== "string" || !isFunction(callback)) {
            return api;
        }

        // this can also be called when we trigger events based on filenames & labels
        var asset = assets[key];

        // item already loaded --> execute and return
        if (asset && asset.state === LOADED || key === "ALL" && allLoaded() && isDomReady) {
            one(callback);
            return api;
        }

        var arr = handlers[key];
        if (!arr) {
            arr = handlers[key] = [callback];
        }
        else {
            arr.push(callback);
        }

        return api;
    }

    /* Mix of stuff from jQuery & IEContentLoaded
     * http://dev.w3.org/html5/spec/the-end.html#the-end
     ***************************************************/
    function domReady() {
        // Make sure body exists, at least, in case IE gets a little overzealous (jQuery ticket #5443).
        if (!doc.body) {
            // let's not get nasty by setting a timeout too small.. (loop mania guaranteed if assets are queued)
            win.clearTimeout(api.readyTimeout);
            api.readyTimeout = win.setTimeout(domReady, 50);
            return;
        }

        if (!isDomReady) {
            isDomReady = true;

            init();
            each(domWaiters, function (fn) {
                one(fn);
            });
        }
    }

    function domContentLoaded() {
        // W3C
        if (doc.addEventListener) {
            doc.removeEventListener("DOMContentLoaded", domContentLoaded, false);
            domReady();
        }

        // IE
        else if (doc.readyState === "complete") {
            // we're here because readyState === "complete" in oldIE
            // which is good enough for us to call the dom ready!
            doc.detachEvent("onreadystatechange", domContentLoaded);
            domReady();
        }
    }

    // Catch cases where ready() is called after the browser event has already occurred.
    // we once tried to use readyState "interactive" here, but it caused issues like the one
    // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
    if (doc.readyState === "complete") {
        domReady();
    }

    // W3C
    else if (doc.addEventListener) {
        doc.addEventListener("DOMContentLoaded", domContentLoaded, false);

        // A fallback to window.onload, that will always work
        win.addEventListener("load", domReady, false);
    }

    // IE
    else {
        // Ensure firing before onload, maybe late but safe also for iframes
        doc.attachEvent("onreadystatechange", domContentLoaded);

        // A fallback to window.onload, that will always work
        win.attachEvent("onload", domReady);

        // If IE and not a frame
        // continually check to see if the document is ready
        var top = false;

        try {
            top = !win.frameElement && doc.documentElement;
        } catch (e) { }

        if (top && top.doScroll) {
            (function doScrollCheck() {
                if (!isDomReady) {
                    try {
                        // Use the trick by Diego Perini
                        // http://javascript.nwbox.com/IEContentLoaded/
                        top.doScroll("left");
                    } catch (error) {
                        // let's not get nasty by setting a timeout too small.. (loop mania guaranteed if assets are queued)
                        win.clearTimeout(api.readyTimeout);
                        api.readyTimeout = win.setTimeout(doScrollCheck, 50);
                        return;
                    }

                    // and execute any waiting functions
                    domReady();
                }
            }());
        }
    }
    //#endregion

    //#region Public Exports
    // INFO: determine which method to use for loading
    api.load  = api.js = isAsync ? apiLoadAsync : apiLoadHack;
    api.test  = conditional;
    api.ready = ready;
    //#endregion

    //#region INIT
    // perform this when DOM is ready
    api.ready(doc, function () {
        if (allLoaded()) {
            each(handlers.ALL, function (callback) {
                one(callback);
            });
        }

        if (api.feature) {
            api.feature("domloaded", true);
        }
    });
    //#endregion
}(window));
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Sticky.js
 * Library for sticky elements written in vanilla javascript. With this library you can easily set sticky elements on your website. It's also responsive.
 *
 * @version 1.2.0
 * @author Rafal Galus <biuro@rafalgalus.pl>
 * @website https://rgalus.github.io/sticky-js/
 * @repo https://github.com/rgalus/sticky-js
 * @license https://github.com/rgalus/sticky-js/blob/master/LICENSE
 */

var Sticky = function () {
    /**
     * Sticky instance constructor
     * @constructor
     * @param {string} selector - Selector which we can find elements
     * @param {string} options - Global options for sticky elements (could be overwritten by data-{option}="" attributes)
     */
    function Sticky() {
        var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Sticky);

        this.selector = selector;
        this.elements = [];

        this.version = '1.2.0';

        this.vp = this.getViewportSize();
        this.body = document.querySelector('body');

        this.options = {
            wrap: options.wrap || false,
            marginTop: options.marginTop || 0,
            stickyFor: options.stickyFor || 0,
            stickyClass: options.stickyClass || null,
            stickyContainer: options.stickyContainer || 'body'
        };

        this.updateScrollTopPosition = this.updateScrollTopPosition.bind(this);

        this.updateScrollTopPosition();
        window.addEventListener('load', this.updateScrollTopPosition);
        window.addEventListener('scroll', this.updateScrollTopPosition);

        this.run();
    }

    /**
     * Function that waits for page to be fully loaded and then renders & activates every sticky element found with specified selector
     * @function
     */


    Sticky.prototype.run = function run() {
        var _this = this;

        // wait for page to be fully loaded
        var pageLoaded = setInterval(function () {
            if (document.readyState === 'complete') {
                clearInterval(pageLoaded);

                var elements = document.querySelectorAll(_this.selector);
                _this.forEach(elements, function (element) {
                    return _this.renderElement(element);
                });
            }
        }, 10);
    };

    /**
     * Function that assign needed variables for sticky element, that are used in future for calculations and other
     * @function
     * @param {node} element - Element to be rendered
     */


    Sticky.prototype.renderElement = function renderElement(element) {
        var _this2 = this;

        // create container for variables needed in future
        element.sticky = {};

        // set default variables
        element.sticky.active = false;

        element.sticky.marginTop = parseInt(element.getAttribute('data-margin-top')) || this.options.marginTop;
        element.sticky.stickyFor = parseInt(element.getAttribute('data-sticky-for')) || this.options.stickyFor;
        element.sticky.stickyClass = element.getAttribute('data-sticky-class') || this.options.stickyClass;
        element.sticky.wrap = element.hasAttribute('data-sticky-wrap') ? true : this.options.wrap;
        // @todo attribute for stickyContainer
        // element.sticky.stickyContainer = element.getAttribute('data-sticky-container') || this.options.stickyContainer;
        element.sticky.stickyContainer = this.options.stickyContainer;

        element.sticky.container = this.getStickyContainer(element);
        element.sticky.container.rect = this.getRectangle(element.sticky.container);

        element.sticky.rect = this.getRectangle(element);

        // fix when element is image that has not yet loaded and width, height = 0
        if (element.tagName.toLowerCase() === 'img') {
            element.onload = function () {
                return element.sticky.rect = _this2.getRectangle(element);
            };
        }

        if (element.sticky.wrap) {
            this.wrapElement(element);
        }

        // activate rendered element
        this.activate(element);
    };

    /**
     * Wraps element into placeholder element
     * @function
     * @param {node} element - Element to be wrapped
     */


    Sticky.prototype.wrapElement = function wrapElement(element) {
        element.insertAdjacentHTML('beforebegin', '<span></span>');
        element.previousSibling.appendChild(element);
    };

    /**
     * Function that activates element when specified conditions are met and then initalise events
     * @function
     * @param {node} element - Element to be activated
     */


    Sticky.prototype.activate = function activate(element) {
        if (element.sticky.rect.top + element.sticky.rect.height < element.sticky.container.rect.top + element.sticky.container.rect.height && element.sticky.stickyFor < this.vp.width && !element.sticky.active) {
            element.sticky.active = true;
        }

        if (this.elements.indexOf(element) < 0) {
            this.elements.push(element);
        }

        if (!element.sticky.resizeEvent) {
            this.initResizeEvents(element);
            element.sticky.resizeEvent = true;
        }

        if (!element.sticky.scrollEvent) {
            this.initScrollEvents(element);
            element.sticky.scrollEvent = true;
        }

        this.setPosition(element);
    };

    /**
     * Function which is adding onResizeEvents to window listener and assigns function to element as resizeListener
     * @function
     * @param {node} element - Element for which resize events are initialised
     */


    Sticky.prototype.initResizeEvents = function initResizeEvents(element) {
        var _this3 = this;

        element.sticky.resizeListener = function () {
            return _this3.onResizeEvents(element);
        };
        window.addEventListener('resize', element.sticky.resizeListener);
    };

    /**
     * Removes element listener from resize event
     * @function
     * @param {node} element - Element from which listener is deleted
     */


    Sticky.prototype.destroyResizeEvents = function destroyResizeEvents(element) {
        window.removeEventListener('resize', element.sticky.resizeListener);
    };

    /**
     * Function which is fired when user resize window. It checks if element should be activated or deactivated and then run setPosition function
     * @function
     * @param {node} element - Element for which event function is fired
     */


    Sticky.prototype.onResizeEvents = function onResizeEvents(element) {
        this.vp = this.getViewportSize();

        element.sticky.rect = this.getRectangle(element);
        element.sticky.container.rect = this.getRectangle(element.sticky.container);

        if (element.sticky.rect.top + element.sticky.rect.height < element.sticky.container.rect.top + element.sticky.container.rect.height && element.sticky.stickyFor < this.vp.width && !element.sticky.active) {
            element.sticky.active = true;
        } else if (element.sticky.rect.top + element.sticky.rect.height >= element.sticky.container.rect.top + element.sticky.container.rect.height || element.sticky.stickyFor >= this.vp.width && element.sticky.active) {
            element.sticky.active = false;
        }

        this.setPosition(element);
    };

    /**
     * Function which is adding onScrollEvents to window listener and assigns function to element as scrollListener
     * @function
     * @param {node} element - Element for which scroll events are initialised
     */


    Sticky.prototype.initScrollEvents = function initScrollEvents(element) {
        var _this4 = this;

        element.sticky.scrollListener = function () {
            return _this4.onScrollEvents(element);
        };
        window.addEventListener('scroll', element.sticky.scrollListener);
    };

    /**
     * Removes element listener from scroll event
     * @function
     * @param {node} element - Element from which listener is deleted
     */


    Sticky.prototype.destroyScrollEvents = function destroyScrollEvents(element) {
        window.removeEventListener('scroll', element.sticky.scrollListener);
    };

    /**
     * Function which is fired when user scroll window. If element is active, function is invoking setPosition function
     * @function
     * @param {node} element - Element for which event function is fired
     */


    Sticky.prototype.onScrollEvents = function onScrollEvents(element) {
        if (element.sticky.active) {
            this.setPosition(element);
        }
    };

    /**
     * Main function for the library. Here are some condition calculations and css appending for sticky element when user scroll window
     * @function
     * @param {node} element - Element that will be positioned if it's active
     */


    Sticky.prototype.setPosition = function setPosition(element) {
        this.css(element, { position: '', width: '', top: '', left: '' });

        if (this.vp.height < element.sticky.rect.height || !element.sticky.active) {
            return;
        }

        if (!element.sticky.rect.width) {
            element.sticky.rect = this.getRectangle(element);
        }

        if (element.sticky.wrap) {
            this.css(element.parentNode, {
                display: 'block',
                width: element.sticky.rect.width + 'px',
                height: element.sticky.rect.height + 'px'
            });
        }

        if (element.sticky.rect.top === 0 && element.sticky.container === this.body) {
            this.css(element, {
                position: 'fixed',
                top: element.sticky.rect.top + 'px',
                left: element.sticky.rect.left + 'px',
                width: element.sticky.rect.width + 'px'
            });
        } else if (this.scrollTop > element.sticky.rect.top - element.sticky.marginTop) {
            this.css(element, {
                position: 'fixed',
                width: element.sticky.rect.width + 'px',
                left: element.sticky.rect.left + 'px'
            });

            if (this.scrollTop + element.sticky.rect.height + element.sticky.marginTop > element.sticky.container.rect.top + element.sticky.container.offsetHeight) {

                if (element.sticky.stickyClass) {
                    element.classList.remove(element.sticky.stickyClass);
                }

                this.css(element, {
                    top: element.sticky.container.rect.top + element.sticky.container.offsetHeight - (this.scrollTop + element.sticky.rect.height) + 'px' });
            } else {
                if (element.sticky.stickyClass) {
                    element.classList.add(element.sticky.stickyClass);
                }

                this.css(element, { top: element.sticky.marginTop + 'px' });
            }
        } else {
            if (element.sticky.stickyClass) {
                element.classList.remove(element.sticky.stickyClass);
            }

            this.css(element, { position: '', width: '', top: '', left: '' });

            if (element.sticky.wrap) {
                this.css(element.parentNode, { display: '', width: '', height: '' });
            }
        }
    };

    /**
     * Function that updates element sticky rectangle (with sticky container), then activate or deactivate element, then update position if it's active
     * @function
     */


    Sticky.prototype.update = function update() {
        var _this5 = this;

        this.forEach(this.elements, function (element) {
            element.sticky.rect = _this5.getRectangle(element);
            element.sticky.container.rect = _this5.getRectangle(element.sticky.container);

            _this5.activate(element);
            _this5.setPosition(element);
        });
    };

    /**
     * Destroys sticky element, remove listeners
     * @function
     */


    Sticky.prototype.destroy = function destroy() {
        var _this6 = this;

        this.forEach(this.elements, function (element) {
            _this6.destroyResizeEvents(element);
            _this6.destroyScrollEvents(element);
            delete element.sticky;
        });
    };

    /**
     * Function that returns container element in which sticky element is stuck (if is not specified, then it's stuck to body)
     * @function
     * @param {node} element - Element which sticky container are looked for
     * @return {node} element - Sticky container
     */


    Sticky.prototype.getStickyContainer = function getStickyContainer(element) {
        var container = element.parentNode;

        while (!container.hasAttribute('data-sticky-container') && !container.parentNode.querySelector(element.sticky.stickyContainer) && container !== this.body) {
            container = container.parentNode;
        }

        return container;
    };

    /**
     * Function that returns element rectangle & position (width, height, top, left)
     * @function
     * @param {node} element - Element which position & rectangle are returned
     * @return {object}
     */


    Sticky.prototype.getRectangle = function getRectangle(element) {
        this.css(element, { position: '', width: '', top: '', left: '' });

        var width = Math.max(element.offsetWidth, element.clientWidth, element.scrollWidth);
        var height = Math.max(element.offsetHeight, element.clientHeight, element.scrollHeight);

        var top = 0;
        var left = 0;

        do {
            top += element.offsetTop || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        } while (element);

        return { top: top, left: left, width: width, height: height };
    };

    /**
     * Function that returns viewport dimensions
     * @function
     * @return {object}
     */


    Sticky.prototype.getViewportSize = function getViewportSize() {
        return {
            width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
            height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        };
    };

    /**
     * Function that updates window scroll position
     * @function
     * @return {number}
     */


    Sticky.prototype.updateScrollTopPosition = function updateScrollTopPosition() {
        this.scrollTop = (window.pageYOffset || document.scrollTop) - (document.clientTop || 0) || 0;
    };

    /**
     * Helper function for loops
     * @helper
     * @param {array}
     * @param {function} callback - Callback function (no need for explanation)
     */


    Sticky.prototype.forEach = function forEach(array, callback) {
        for (var i = 0, len = array.length; i < len; i++) {
            callback(array[i]);
        }
    };

    /**
     * Helper function to add/remove css properties for specified element.
     * @helper
     * @param {node} element - DOM element
     * @param {object} properties - CSS properties that will be added/removed from specified element
     */


    Sticky.prototype.css = function css(element, properties) {
        for (var property in properties) {
            if (properties.hasOwnProperty(property)) {
                element.style[property] = properties[property];
            }
        }
    };

    return Sticky;
}();

/**
 * Export function that supports AMD, CommonJS and Plain Browser.
 */


(function (root, factory) {
    if (typeof exports !== 'undefined') {
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.Sticky = factory;
    }
})(this, Sticky);
Array.from(document.querySelectorAll('.column.remove .remove--button')).forEach((element) =>
{
    let id = element.getAttribute('data-id'),
        selectorDropdown = '.service-select--dropdown input[value="' + id + '"]',
        selectorHandle = '.column.handle input[data-id="' + id + '"]';

    element.addEventListener('click', function(event) {
        event.preventDefault();

        Array.from(document.querySelectorAll(selectorDropdown)).forEach((element) =>
        {
            element.checked = false;
        });

        Array.from(document.querySelectorAll(selectorHandle)).forEach((element) =>
        {
            element.value = '';
            element.parentElement.parentElement.setAttribute('style', 'display: none;')
        });
    });
});

Array.from(document.querySelectorAll('.service-select--dropdown input')).forEach((element) =>
{
    let id = element.value,
        selectorHandle = '.column.handle input[data-id="' + id + '"]';

    element.addEventListener('change', function(event) {
        event.preventDefault();

        if (event.target.checked) {
            Array.from(document.querySelectorAll(selectorHandle)).forEach((element) =>
            {
                let container = element.parentElement.parentElement;

                container.removeAttribute('style');
                container.scrollIntoView(true);
            });
        }
    });
});

Array.from(document.querySelectorAll('.dropdown-label')).forEach((element) => {
    // fix: no focus on button on Mac OS
    element.addEventListener('click', function(event) {
        event.target.focus();
    });
});
Array.from(document.querySelectorAll('.confirm-checkbox')).forEach((element) =>
{
    element.addEventListener('change', function(event) {
        event.preventDefault();

        let button = event.target.nextElementSibling;

        if (event.target.checked) {
            button.removeAttribute('disabled');
        } else {
            button.setAttribute('disabled', 'disabled')
        }
    });
});
Array.from(document.querySelectorAll('.create-qrcode')).forEach((element) =>
{
    element.addEventListener('click', function(event) {
        event.preventDefault();

        head.load(event.target.getAttribute('data-js'), function() {
            let qrcodeContainer = document.getElementById('qrcode');

            while (qrcodeContainer.firstChild) {
                qrcodeContainer.removeChild(qrcodeContainer.firstChild);
            }

            let qrcode = new QRCode(qrcodeContainer, {
                width: 200,
                height: 200,
                useSVG: true
            });

            qrcode.makeCode(event.target.getAttribute('data-url'));
        });
    });
});
dragula([
    document.querySelector('.service-form .service-rows')
]);
Array.from(document.querySelectorAll('.errors')).forEach((element) =>
{
    element.scrollIntoView(true);
});
var sticky = new Sticky('[data-sticky]');

Array.from(document.querySelectorAll('input[name="_username"]')).forEach((element) =>
{
    element.addEventListener('keydown', function(event) {
        if (event.keyCode === 37 || event.keyCode === 39 || event.keyCode === 8 || event.keyCode === 9 || event.keyCode === 13) {
            return;
        }

        if ((event.keyCode < 48 || event.keyCode > 90 || event.shiftKey) && !(event.shiftKey && event.keyCode === 189)){
            event.preventDefault();
        }
    });
});