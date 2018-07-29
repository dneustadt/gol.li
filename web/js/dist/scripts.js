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
dragula([
    document.querySelector('.service-form .service-rows')
]);
var sticky = new Sticky('[data-sticky]');
